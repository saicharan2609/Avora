-- Mobile OAuth token handoff.
--
-- Purpose:
-- - The web OAuth callback exchanges the provider code for a session
--   server-side. For a mobile-originated sign-in, that session cannot be
--   handed to the app as httpOnly cookies, and it must not be placed in the
--   avora:// deep-link URL as raw bearer tokens (URLs are logged by the OS,
--   crash breadcrumbs, and navigation state).
-- - Instead, the callback stores the session here as a short-lived,
--   single-use ticket and redirects with only the opaque handoff id. The
--   mobile app exchanges that id for the real session over an HTTPS POST
--   body via consume_mobile_auth_handoff, never through a URL.
--
-- This migration intentionally does not implement the exchange route,
-- rate limiting on the exchange endpoint, or SEC-043 notification behavior.

create table public.mobile_auth_handoffs (
  handoff_id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (student_id) on delete cascade,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

comment on table public.mobile_auth_handoffs is
  'classification: identity; purpose: short-lived single-use ticket handing an OAuth session from the web callback to the mobile app without placing bearer tokens in a deep-link URL.';

comment on column public.mobile_auth_handoffs.handoff_id is
  'classification: identity; purpose: unguessable, single-use handoff ticket identifier carried in the avora:// redirect.';

comment on column public.mobile_auth_handoffs.student_id is
  'classification: identity; purpose: owning student identifier used for RLS on the insert path.';

comment on column public.mobile_auth_handoffs.access_token is
  'classification: identity; purpose: session access token held only until consumed or expired.';

comment on column public.mobile_auth_handoffs.refresh_token is
  'classification: identity; purpose: session refresh token held only until consumed or expired.';

comment on column public.mobile_auth_handoffs.expires_at is
  'classification: identity; purpose: expiry of the underlying session being handed off, not of the ticket itself.';

comment on column public.mobile_auth_handoffs.created_at is
  'classification: operational; purpose: ticket creation timestamp, used to enforce the short handoff window.';

create index mobile_auth_handoffs_created_at_idx
  on public.mobile_auth_handoffs (created_at);

alter table public.mobile_auth_handoffs enable row level security;
alter table public.mobile_auth_handoffs force row level security;

-- The web callback inserts as the just-authenticated student. No select,
-- update, or delete policy exists for any role: the only read path is the
-- narrowly-scoped consume_mobile_auth_handoff function below, which bypasses
-- RLS deliberately (it has no student session to evaluate auth.uid() against)
-- and is the single-use, deny-by-default alternative to a broad policy.
create policy mobile_auth_handoffs_insert_own
  on public.mobile_auth_handoffs
  for insert
  to authenticated
  with check (student_id = auth.uid());

create function public.consume_mobile_auth_handoff(handoff_code uuid)
returns table (
  student_id uuid,
  access_token text,
  refresh_token text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  delete from public.mobile_auth_handoffs
  where mobile_auth_handoffs.handoff_id = handoff_code
    and mobile_auth_handoffs.created_at > now() - interval '2 minutes'
  returning
    mobile_auth_handoffs.student_id,
    mobile_auth_handoffs.access_token,
    mobile_auth_handoffs.refresh_token,
    mobile_auth_handoffs.expires_at;
end;
$$;

comment on function public.consume_mobile_auth_handoff(uuid) is
  'classification: identity; purpose: single-use, time-boxed consumption of a mobile auth handoff ticket. Deletes on read so a code can never be replayed.';

revoke all on function public.consume_mobile_auth_handoff(uuid) from public;
grant execute on function public.consume_mobile_auth_handoff(uuid) to anon, authenticated;
