import { RuleTester } from "eslint";
import rule from "../index.js";

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  }
});

ruleTester.run("no-internal-barrel", rule.rules["no-internal-barrel"], {
  valid: [
    {
      name: "package root barrel",
      filename: "D:/Projects/Avora/packages/core/index.ts",
      code: 'export { StudentId } from "./identity/StudentId.js";'
    },

    {
      name: "package src aggregate barrel",
      filename: "D:/Projects/Avora/packages/retrieval/src/index.ts",
      code: 'export { search } from "./search/search.js";'
    },

    {
      name: "canonical domain module public surface",
      filename: "D:/Projects/Avora/packages/domain/academic/index.ts",
      code: 'export { AcademicService } from "./services/academic.service.js";'
    },

    {
      name: "another canonical domain module public surface",
      filename: "D:/Projects/Avora/packages/domain/tutor/index.ts",
      code: 'export { TutorService } from "./services/tutor.service.js";'
    },

    {
      name: "web primitive barrel",
      filename: "D:/Projects/Avora/packages/ui-web/primitives/index.ts",
      code: 'export { Button } from "./Button.js";'
    },

    {
      name: "mobile primitive barrel",
      filename: "D:/Projects/Avora/packages/ui-mobile/primitives/index.ts",
      code: 'export { Button } from "./Button.js";'
    },

    {
      name: "index file without re-export",
      filename: "D:/Projects/Avora/packages/jobs/queue/index.ts",
      code: "export const queueName = 'resource';"
    },

    {
      name: "local export without source",
      filename: "D:/Projects/Avora/packages/jobs/queue/index.ts",
      code: `
        const queueName = "resource";
        export { queueName };
      `
    },

    {
      name: "non-TypeScript index is ignored",
      filename: "D:/Projects/Avora/packages/jobs/queue/index.js",
      code: 'export { queue } from "./queue.js";'
    }
  ],

  invalid: [
    {
      name: "jobs queue internal barrel",
      filename: "D:/Projects/Avora/packages/jobs/queue/index.ts",
      code: 'export { Queue } from "./Queue.js";',
      errors: [
        {
          message: "Internal barrels are prohibited outside package roots."
        }
      ]
    },

    {
      name: "jobs ports internal barrel",
      filename: "D:/Projects/Avora/packages/jobs/ports/index.ts",
      code: 'export { QueuePort } from "./QueuePort.js";',
      errors: [
        {
          message: "Internal barrels are prohibited outside package roots."
        }
      ]
    },

    {
      name: "retrieval search internal barrel",
      filename: "D:/Projects/Avora/packages/retrieval/search/index.ts",
      code: 'export { search } from "./search.js";',
      errors: [
        {
          message: "Internal barrels are prohibited outside package roots."
        }
      ]
    },

    {
      name: "retrieval chunking contracts internal barrel",
      filename:
        "D:/Projects/Avora/packages/retrieval/chunking/contracts/index.ts",
      code: 'export { RetrievalChunk } from "./RetrievalChunk.contract.js";',
      errors: [
        {
          message: "Internal barrels are prohibited outside package roots."
        }
      ]
    },

    {
      name: "core contracts internal barrel",
      filename: "D:/Projects/Avora/packages/core/contracts/index.ts",
      code: 'export { ResourceUploadApi } from "./resources/ResourceUploadApi.contract.js";',
      errors: [
        {
          message: "Internal barrels are prohibited outside package roots."
        }
      ]
    },

    {
      name: "nested UI component barrel",
      filename: "D:/Projects/Avora/packages/ui-web/domain-components/index.ts",
      code: 'export { ResourceCard } from "./ResourceCard.js";',
      errors: [
        {
          message: "Internal barrels are prohibited outside package roots."
        }
      ]
    },

    {
      name: "worker pipeline barrel",
      filename: "D:/Projects/Avora/apps/worker/src/resource-extraction/index.ts",
      code: 'export { handleResourceExtractionJob } from "./handler.js";',
      errors: [
        {
          message: "Internal barrels are prohibited outside package roots."
        }
      ]
    },

    {
      name: "windows path internal barrel",
      filename:
        "D:\\Projects\\Avora\\packages\\retrieval\\search\\index.ts",
      code: 'export { search } from "./search.js";',
      errors: [
        {
          message: "Internal barrels are prohibited outside package roots."
        }
      ]
    }
  ]
});