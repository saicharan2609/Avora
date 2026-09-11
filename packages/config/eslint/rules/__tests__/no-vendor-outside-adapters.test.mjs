import { RuleTester } from "eslint";
import rule from "../index.js";

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  }
});

ruleTester.run("no-vendor-outside-adapters", rule.rules["no-vendor-outside-adapters"], {
  valid: [
    {
      name: "supabase adapter imports @supabase/supabase-js",
      filename: "D:/Projects/Avora/packages/adapters/supabase/auth/adapter.ts",
      code: 'import { createClient } from "@supabase/supabase-js";'
    },

    {
      name: "supabase adapter imports the scoped @supabase/auth-js package",
      filename: "D:/Projects/Avora/packages/adapters/supabase/auth/session.ts",
      code: 'import { Session } from "@supabase/auth-js";'
    },

    {
      name: "packages/db client is the authorized Supabase data-access layer",
      filename: "D:/Projects/Avora/packages/db/client/index.ts",
      code: 'import { createClient } from "@supabase/supabase-js";'
    },

    {
      name: "a packages/db repository is the authorized Supabase data-access layer",
      filename: "D:/Projects/Avora/packages/db/repositories/jobs/repository.ts",
      code: 'import { createClient } from "@supabase/supabase-js";'
    },

    {
      name: "a plain OAuth provider identifier string is not an import specifier",
      filename: "D:/Projects/Avora/apps/mobile/app/(auth)/index.tsx",
      code: 'const provider = "google"; const isGoogle = provider === "google";'
    },

    {
      name: "a composition root importing Avora's own sanctioned adapter subpath",
      filename: "D:/Projects/Avora/apps/web/app/api/auth/_shared/supabase-auth.ts",
      code: 'import { createSupabaseAuthAdapter } from "@avora/adapters/supabase/auth";'
    },

    {
      name: "a relative import of Avora's own locally-named supabase-auth.ts wrapper is not a vendor import",
      filename: "D:/Projects/Avora/apps/web/app/api/auth/_shared/mobile-auth-handoff.ts",
      code: 'import { readWebAuthEnvironment } from "./supabase-auth";'
    }
  ],

  invalid: [
    {
      name: "mobile source imports @supabase/supabase-js directly",
      filename: "D:/Projects/Avora/apps/mobile/src/auth/httpAuthPort.ts",
      code: 'import { createClient } from "@supabase/supabase-js";',
      errors: [
        {
          message: "Vendor names are confined to adapter paths."
        }
      ]
    },

    {
      name: "mobile source imports the scoped @supabase/auth-js package directly",
      filename: "D:/Projects/Avora/apps/mobile/app/auth-callback.tsx",
      code: 'import { Session } from "@supabase/auth-js";',
      errors: [
        {
          message: "Vendor names are confined to adapter paths."
        }
      ]
    },

    {
      name: "an unauthorized feature/domain package imports @supabase/supabase-js directly",
      filename: "D:/Projects/Avora/packages/domain/identity/services/SomeService.ts",
      code: 'import { createClient } from "@supabase/supabase-js";',
      errors: [
        {
          message: "Vendor names are confined to adapter paths."
        }
      ]
    },

    {
      name: "existing vendor enforcement (openai) outside adapters is unchanged",
      filename: "D:/Projects/Avora/packages/domain/tutor/services/TutorService.ts",
      code: 'import OpenAI from "openai";',
      errors: [
        {
          message: "Vendor names are confined to adapter paths."
        }
      ]
    }
  ]
});
