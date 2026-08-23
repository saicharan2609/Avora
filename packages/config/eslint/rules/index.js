import * as fs from "node:fs";

const prohibitedDirectoryNames = new Set([
  "utils",
  "helpers",
  "common",
  "shared",
  "misc",
  "lib"
]);

// Deliberately excludes a bare `\blevel\b` pattern: "level" alone is also
// the correct word for unrelated, non-hierarchy concepts this codebase
// legitimately uses (classification `confidence.level`, a `page-level`
// extraction failure, a log level) and a bare match on it produced only
// false positives in practice. `depth_level` and `hierarchy_level` below
// still catch the compounds that actually name a structural level.
const fixedHierarchyPatterns = [
  /\bchapter(s)?\b/i,
  /\bunit_id\b/i,
  /\bunitId\b/,
  /\bmodule_id\b/i,
  /\bmoduleId\b/,
  /\btopic_id\b/i,
  /\bweek_id\b/i,
  /\blesson_id\b/i,
  /\bdepth_level\b/i,
  /\bhierarchy_level\b/i,
  /\bparent_type\b/i,
  /\bnode_type\b/i
];

const designLiteralPattern =
  /#[0-9a-fA-F]{3,8}\b|\b\d+(px|rem|em|dp|ms)\b|rgba?\(|hsla?\(/;

function getSourceFilename(context) {
  return (
    context.sourceCode?.filename ??
    context.filename ??
    "<input>"
  );
}

// This directory's entire purpose is to hold the literal word/pattern data
// (vendor names, "TODO", "tier-1", hierarchy labels, ...) that these very
// text-matching rules scan every other file in the repository for. Any
// createTextRule-based check would otherwise trip over its own pattern
// definitions and error messages, which is a tautology, not a finding —
// this directory is the one legitimate place these words are expected to
// live as data.
function isEslintRuleImplementationFile(normalizedFilename) {
  return normalizedFilename.includes("packages/config/eslint/rules/");
}

function createTextRule(ruleName, predicate, message) {
  return {
    meta: {
      type: "problem",
      docs: {
        description: ruleName
      },
      schema: []
    },

    create(context) {
      return {
        Program(node) {
          const sourceText = context.sourceCode.getText();
          const filename = getSourceFilename(context);
          const normalizedFilename = filename.replaceAll("\\", "/");

          if (isEslintRuleImplementationFile(normalizedFilename)) {
            return;
          }

          if (predicate(sourceText, filename)) {
            context.report({
              node,
              message
            });
          }
        }
      };
    }
  };
}

function containsReExportDeclaration(programNode) {
  return programNode.body.some(
    (statement) =>
      statement.type === "ExportAllDeclaration" ||
      (statement.type === "ExportNamedDeclaration" &&
        statement.source !== null)
  );
}

// `apps/*` are composition roots (architecture.md §4), never imported as a
// library by another workspace member and never given a package.json
// "exports" map. ENG-022's "barrels only at a package's public boundary"
// concern does not apply to them: a nested index.ts inside an app is
// internal aggregation reached only by relative import within that same
// app, not a second public entry point into it.
function isInsideAnApp(normalizedFilename) {
  return /(?:^|\/)apps\/[^/]+\//.test(normalizedFilename);
}

function findWorkspaceRootDirectory(fs, absoluteDirectory) {
  let currentDirectory = absoluteDirectory;

  while (true) {
    const candidatePackageJsonPath = `${currentDirectory}/package.json`;

    if (fs.existsSync(candidatePackageJsonPath)) {
      return currentDirectory;
    }

    const parentDirectory = currentDirectory.slice(
      0,
      currentDirectory.lastIndexOf("/")
    );

    if (parentDirectory === currentDirectory || parentDirectory.length === 0) {
      return null;
    }

    currentDirectory = parentDirectory;
  }
}

function normalizeExportLikePath(rawPath) {
  return rawPath
    .replace(/^\.\//, "")
    .replace(/^dist\//, "")
    .replace(/^src\//, "")
    .replace(/\.(d\.ts|ts|tsx|js|mjs|cjs)$/, "");
}

function collectExportTargetPaths(exportsMapValue, collected) {
  if (typeof exportsMapValue === "string") {
    collected.push(exportsMapValue);
    return;
  }

  if (exportsMapValue !== null && typeof exportsMapValue === "object") {
    for (const nestedValue of Object.values(exportsMapValue)) {
      collectExportTargetPaths(nestedValue, collected);
    }
  }
}

const workspacePackageExportsCache = new Map();

function readWorkspacePackageExportTargets(fs, workspaceRootDirectory) {
  if (workspacePackageExportsCache.has(workspaceRootDirectory)) {
    return workspacePackageExportsCache.get(workspaceRootDirectory);
  }

  let exportTargets = [];

  try {
    const packageJson = JSON.parse(
      fs.readFileSync(`${workspaceRootDirectory}/package.json`, "utf8")
    );

    if (packageJson.exports !== undefined && packageJson.exports !== null) {
      for (const exportsMapValue of Object.values(packageJson.exports)) {
        collectExportTargetPaths(exportsMapValue, exportTargets);
      }
    }
  } catch {
    exportTargets = [];
  }

  workspacePackageExportsCache.set(workspaceRootDirectory, exportTargets);

  return exportTargets;
}

// A barrel (an index.ts that re-exports) is this repository's established,
// universal mechanism for declaring one workspace member's public subpath
// surface — every package, plus e2e and evals, exposes many such subpaths
// via package.json "exports" (packages/ai/gateway/budget-gate, packages/db
// repositories/*, packages/domain/<module>, e2e/adaptivity, and so on).
// ENG-022's actual concern is a second, *undeclared* public boundary, not
// the presence of a nested index.ts as such — so a barrel is allowed
// whenever its own workspace member's package.json declares it as an
// export target, and flagged only when it does not.
function isDeclaredWorkspacePackageExport(fs, filename) {
  const normalizedFilename = filename.replaceAll("\\", "/");
  const lastSlashIndex = normalizedFilename.lastIndexOf("/");

  if (lastSlashIndex === -1) {
    return false;
  }

  const absoluteDirectory = normalizedFilename.slice(0, lastSlashIndex);
  const workspaceRootDirectory = findWorkspaceRootDirectory(
    fs,
    absoluteDirectory
  );

  if (workspaceRootDirectory === null) {
    return false;
  }

  const packageRelativePath = normalizedFilename.slice(
    workspaceRootDirectory.length + 1
  );
  const normalizedFileLogicalPath = normalizeExportLikePath(
    packageRelativePath
  );
  const exportTargets = readWorkspacePackageExportTargets(
    fs,
    workspaceRootDirectory
  );

  return exportTargets.some((exportTarget) => {
    const normalizedExportTarget = normalizeExportLikePath(exportTarget);

    if (normalizedExportTarget === normalizedFileLogicalPath) {
      return true;
    }

    // A domain module's own internal sub-folders (contracts/, services/,
    // repositories/, jobs/, policies/, ports/ — the ENG-016 closed set, and
    // packages/core's api/academic-style intermediate folders) are never
    // independently published, but they are reachable only by relative
    // import from within the one directory the module *does* declare — so a
    // barrel anywhere beneath a declared export target's own directory is
    // exactly as safe as the declared barrel itself.
    const exportTargetDirectory = normalizedExportTarget.endsWith("/index")
      ? normalizedExportTarget.slice(0, -"/index".length)
      : null;

    return (
      exportTargetDirectory !== null &&
      normalizedFileLogicalPath.startsWith(`${exportTargetDirectory}/`)
    );
  });
}

const rules = {
  "no-fixed-hierarchy": createTextRule(
    "No fixed academic hierarchy identifiers",
    (sourceText) =>
      fixedHierarchyPatterns.some((pattern) => pattern.test(sourceText)),
    "Fixed academic hierarchy identifiers are prohibited. Use structure_unit and structure_type_label vocabulary."
  ),

  "no-vendor-outside-adapters": createTextRule(
    "No vendor names outside adapter paths",
    (sourceText, filename) => {
      const normalizedFilename = filename.replaceAll("\\", "/");

      const isAdapterPath =
        normalizedFilename.includes("/adapters/") ||
        normalizedFilename.includes("packages/adapters/") ||
        normalizedFilename.includes("packages/ai/adapters/");

      if (isAdapterPath) {
        return false;
      }

      // ENG-018's actual concern is importing a vendor SDK package directly
      // outside an adapter directory — not the mere textual presence of a
      // vendor's name. A bare-word match also fires on legitimate,
      // unrelated uses (an OAuth provider identifier string such as
      // `provider === "google"`, or importing Avora's own sanctioned
      // `@avora/ai/adapters/google` subpath from a composition root), so
      // only an import/require module specifier is checked, and only when
      // that specifier does not itself resolve into an adapters/ path.
      const importSpecifierPattern =
        /\b(?:from|require)\s*\(?\s*["']([^"']+)["']/g;
      let match;

      while ((match = importSpecifierPattern.exec(sourceText)) !== null) {
        const specifier = match[1];

        if (
          /\b(openai|anthropic|google|stripe|resend|sentry|posthog)\b/i.test(
            specifier
          ) &&
          !specifier.includes("/adapters/")
        ) {
          return true;
        }
      }

      return false;
    },
    "Vendor names are confined to adapter paths."
  ),

  "require-ai-label": createTextRule(
    "Require AI label",
    (sourceText) =>
      /provenance\s*[:=]\s*["']ai["']/.test(sourceText) &&
      !/AIGeneratedBadge/.test(sourceText),
    "AI provenance rendering must include AIGeneratedBadge."
  ),

  "no-free-text-citation": createTextRule(
    "No free text citation",
    (sourceText) => /\bcitation(Text|String|Label)\b/i.test(sourceText),
    "Citations are foreign keys, never free text strings."
  ),

  "no-content-in-logger": createTextRule(
    "No content in logger",
    (sourceText) =>
      /logger\.(debug|info|warn|error|fatal)\([^)]*(filename|content|resourceTitle|studentText)/s.test(
        sourceText
      ),
    "Student academic content must never enter logs."
  ),

  "module-boundary": createTextRule(
    "Domain module boundary",
    (sourceText) =>
      /from\s+["']@avora\/domain\/[^"']+\/(contracts|services|repositories|events|jobs|policies|ports)\//.test(
        sourceText
      ),
    "Cross-module imports must use the module public index."
  ),

  "package-dependency-direction": createTextRule(
    "Package dependency direction",
    (sourceText) =>
      /from\s+["']@avora\/ui-web["']/.test(sourceText) &&
      /from\s+["']@avora\/ui-mobile["']/.test(sourceText),
    "ui-web and ui-mobile must not import each other."
  ),

  "no-prohibited-directory": createTextRule(
    "No prohibited directory names",
    (_sourceText, filename) =>
      filename
        .replaceAll("\\", "/")
        .split("/")
        .some((segment) => prohibitedDirectoryNames.has(segment)),
    "Prohibited generic directory name."
  ),

  "no-internal-barrel": {
    meta: {
      type: "problem",
      docs: {
        description: "No internal barrel"
      },
      schema: []
    },

    create(context) {
      return {
        Program(node) {
          const normalizedFilename = getSourceFilename(context).replaceAll(
            "\\",
            "/"
          );

          if (!/(?:^|\/)index\.(ts|tsx)$/.test(normalizedFilename)) {
            return;
          }

          if (!containsReExportDeclaration(node)) {
            return;
          }

          if (isInsideAnApp(normalizedFilename)) {
            return;
          }

          if (isDeclaredWorkspacePackageExport(fs, normalizedFilename)) {
            return;
          }

          context.report({
            node,
            message: "Internal barrels are prohibited outside package roots."
          });
        }
      };
    }
  },

  "no-hardcoded-design-value": createTextRule(
    "No hardcoded design values",
    (sourceText, filename) =>
      designLiteralPattern.test(sourceText) &&
      !filename
        .replaceAll("\\", "/")
        .includes("packages/design-tokens/tier-1/"),
    "Design values must come from tokens."
  ),

  "tier-2-tokens-only": createTextRule(
    "Tier 2 tokens only",
    (sourceText, filename) => {
      const normalizedFilename = filename.replaceAll("\\", "/");

      // packages/design-tokens/tier-2/ deriving its semantic aliases from
      // tier-1 primitive values is tier-2's entire purpose (DESIGN-SYSTEM.md,
      // REPOSITORY.md §5.10), not a component reaching into tier-1 directly.
      // The rule's actual concern is a *component* (packages/ui-web,
      // packages/ui-mobile) referencing tier-1, which tier-2/ is not.
      if (normalizedFilename.includes("packages/design-tokens/")) {
        return false;
      }

      return /\btier-1\b|tier1\b/.test(sourceText);
    },
    "Components may not reference Tier 1 primitive tokens."
  ),

  "env-tier": createTextRule(
    "Environment tier boundaries",
    (sourceText, filename) => {
      const normalizedFilename = filename.replaceAll("\\", "/");

      const isClientReachable =
        normalizedFilename.includes("apps/web/") ||
        normalizedFilename.includes("apps/mobile/") ||
        normalizedFilename.includes("packages/ui-");

      return (
        isClientReachable &&
        /\b(SUPABASE_SERVICE_ROLE_KEY|MODEL_PROVIDER_API_KEY|WORKER_SECRET)\b/.test(
          sourceText
        )
      );
    },
    "Server or worker tier environment variables cannot appear in client-reachable code."
  ),

  "no-string-concat-into-prompt": createTextRule(
    "No string concatenation into prompt",
    (sourceText) =>
      /\bprompt\b[^;\n]*(`|\+)|(`|\+)[^;\n]*\bmodelInput\b/i.test(
        sourceText
      ),
    "Student content must not be string-concatenated into prompts."
  ),

  "no-offset-pagination": createTextRule(
    "No offset pagination",
    (sourceText) =>
      /\b(offset|skip)\s*[:=]/.test(sourceText) &&
      // `z.iso.datetime({ offset: true })` is Zod's option controlling
      // whether a timezone offset is permitted in an ISO timestamp — an
      // unrelated, coincidental use of the identifier "offset" that has
      // nothing to do with row-skipping pagination (ENG-118).
      !/\.datetime\(\s*\{\s*offset\s*:/.test(sourceText),
    "Pagination must be cursor-based."
  ),

  "require-units-in-name": createTextRule(
    "Require units in names",
    (sourceText) =>
      // Requires a following digit so a *definition* of a bare numeric
      // field (`timeout: 5000`) is caught, while a namespaced category key
      // whose values already carry their own unit as a string
      // (`size: { touchTarget: "44px" }`) and a property *access* such as
      // `resourceIds.size === otherIds.size` are not.
      /\b(duration|size|cost|tokens|timeout)\s*[:=]\s*\d/i.test(sourceText),
    "Numeric fields for time, size, cost, or token budget must include units in the name."
  ),

  "no-enum": createTextRule(
    "No TypeScript enum",
    (sourceText) => /\benum\s+[A-Z]/.test(sourceText),
    "TypeScript enum is prohibited. Use unions or const objects."
  ),

  "owned-todo": createTextRule(
    "Owned TODO",
    (sourceText) =>
      // Word boundaries matter here: without them this matched "ToDo"
      // case-insensitively inside ordinary camelCase identifiers this
      // codebase uses constantly (mapXToDomain, ...BelongsToDocument),
      // which is a mapper-naming convention, not an unowned TODO comment.
      /\bTODO\b(?!\s*\(@[^,]+,\s*[A-Z]+-\d+\))/i.test(sourceText),
    "TODO must include an owner and issue."
  )
};

export default {
  rules
};