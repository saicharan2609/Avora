export type DomainEventName = `${string}.${string}`;

export type DomainEventPayload = Readonly<Record<string, string | number | boolean | null>>;

export type DomainEvent<EventName extends DomainEventName, Payload extends DomainEventPayload> =
  Readonly<{
    name: EventName;
    payload: Payload;
  }>;