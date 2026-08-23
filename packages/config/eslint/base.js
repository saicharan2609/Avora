import js from "@eslint/js";
import parser from "@typescript-eslint/parser";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import importPlugin from "eslint-plugin-import";
import globals from "globals";

export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/.expo/**",
      "**/.turbo/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/*.tsbuildinfo"
    ]
  },

  js.configs.recommended,

  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser,
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.es2022
      }
    },
    plugins: {
      "@typescript-eslint": typescriptPlugin,
      import: importPlugin
    },
    rules: {
      "no-unused-vars": "off",

      "no-console": "error",
      "no-debugger": "error",
      "no-alert": "error",
      "no-var": "error",
      "prefer-const": "error",
      "eqeqeq": ["error", "always"],
      "complexity": ["error", 10],
      "max-depth": ["error", 4],
      "max-params": ["error", 4],

      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "caughtErrorsIgnorePattern": "^_"
        }
      ],

      "import/no-cycle": "error",
      "import/no-default-export": "off"
    }
  },

  {
    // ENG-052: "No `as`, no `!` outside adapters and tests." e2e/ is a
    // dedicated cross-cutting test harness (ENG-019 exception); *.e2e.ts
    // and __tests__/ colocate the rest. A non-null assertion here is the
    // documented test exception, not a suppression of the rule.
    files: [
      "e2e/**/*.{ts,tsx}",
      "**/__tests__/**/*.{ts,tsx}",
      "**/*.e2e.{ts,tsx}",
      "**/*.test.{ts,tsx}"
    ],
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off"
    }
  },

  {
    // e2e/ and evals/ are CI/test-harness packages (REPOSITORY.md §7-8) —
    // never deployed, never part of a student-facing runtime, so ENG-259's
    // concern (structured logging in production) does not apply. Their
    // run-*.ts entry points are CLI tools whose designed output *is*
    // console text for a human watching CI.
    files: ["e2e/**/*.{ts,tsx}", "evals/**/*.{ts,tsx}"],
    rules: {
      "no-console": "off"
    }
  },

  {
    // Owner approval (Pre-Stage-12): Worker process startup and shutdown lifecycle
    // logging in `apps/worker/src/main.ts` and `apps/worker/src/runtime/shutdown.ts`
    // is an explicitly approved bootstrap/lifecycle exception while a full LoggerContract
    // implementation is pending.
    files: [
      "apps/worker/src/main.ts",
      "apps/worker/src/runtime/shutdown.ts"
    ],
    rules: {
      "no-console": "off"
    }
  },

  {
    files: ["**/*.{js,cjs,mjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.es2022
      }
    },
    plugins: {
      import: importPlugin
    },
    rules: {
      "no-console": "error",
      "no-debugger": "error",
      "no-alert": "error",
      "no-var": "error",
      "prefer-const": "error",
      "eqeqeq": ["error", "always"],
      "complexity": ["error", 10],
      "max-depth": ["error", 4],
      "max-params": ["error", 4],

      "import/no-cycle": "error",
      "import/no-default-export": "off"
    }
  }
];