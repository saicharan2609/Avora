const prohibitedDirectoryNames = new Set([
  "utils",
  "helpers",
  "common",
  "shared",
  "misc",
  "lib"
]);

const fixedHierarchyPatterns = [
  /\bchapter(s)?\b/i,
  /\bunit_id\b/i,
  /\bunitId\b/,
  /\bmodule_id\b/i,
  /\bmoduleId\b/,
  /\btopic_id\b/i,
  /\bweek_id\b/i,
  /\blesson_id\b/i,
  /\blevel\b/i,
  /\bdepth_level\b/i,
  /\bhierarchy_level\b/i,
  /\bparent_type\b/i,
  /\bnode_type\b/i
];

const designLiteralPattern =
  /#[0-9a-fA-F]{3,8}\b|\b\d+(px|rem|em|dp|ms)\b|rgba?\(|hsla?\(/;

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

          if (predicate(sourceText, context.getFilename())) {
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

const rules = {
  "no-fixed-hierarchy": createTextRule(
    "No fixed academic hierarchy identifiers",
    (sourceText) => fixedHierarchyPatterns.some((pattern) => pattern.test(sourceText)),
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

      return (
        !isAdapterPath &&
        /\b(openai|anthropic|google|stripe|resend|sentry|posthog)\b/i.test(sourceText)
      );
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

  "no-internal-barrel": createTextRule(
    "No internal barrel",
    (_sourceText, filename) => {
      const normalizedFilename = filename.replaceAll("\\", "/");
      return /\/index\.(ts|tsx|js|mjs|cjs)$/.test(normalizedFilename) &&
        !/^.*\/packages\/[^/]+\/index\.(ts|js)$/.test(normalizedFilename);
    },
    "Internal barrels are prohibited outside package roots."
  ),

  "no-hardcoded-design-value": createTextRule(
    "No hardcoded design values",
    (sourceText, filename) =>
      designLiteralPattern.test(sourceText) &&
      !filename.replaceAll("\\", "/").includes("packages/design-tokens/tier-1/"),
    "Design values must come from tokens."
  ),

  "tier-2-tokens-only": createTextRule(
    "Tier 2 tokens only",
    (sourceText) => /\btier-1\b|tier1\b/.test(sourceText),
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
        /\b(SUPABASE_SERVICE_ROLE_KEY|MODEL_PROVIDER_API_KEY|WORKER_SECRET)\b/.test(sourceText)
      );
    },
    "Server or worker tier environment variables cannot appear in client-reachable code."
  ),

  "no-string-concat-into-prompt": createTextRule(
    "No string concatenation into prompt",
    (sourceText) =>
      /\bprompt\b[^;\n]*(`|\+)|(`|\+)[^;\n]*\bmodelInput\b/i.test(sourceText),
    "Student content must not be string-concatenated into prompts."
  ),

  "no-offset-pagination": createTextRule(
    "No offset pagination",
    (sourceText) => /\b(offset|skip)\s*[:=]/.test(sourceText),
    "Pagination must be cursor-based."
  ),

  "require-units-in-name": createTextRule(
    "Require units in names",
    (sourceText) => /\b(duration|size|cost|tokens|timeout)\s*[:=]/i.test(sourceText),
    "Numeric fields for time, size, cost, or token budget must include units in the name."
  ),

  "no-enum": createTextRule(
    "No TypeScript enum",
    (sourceText) => /\benum\s+[A-Z]/.test(sourceText),
    "TypeScript enum is prohibited. Use unions or const objects."
  ),

  "owned-todo": createTextRule(
    "Owned TODO",
    (sourceText) => /TODO(?!\s*\(@[^,]+,\s*[A-Z]+-\d+\))/i.test(sourceText),
    "TODO must include an owner and issue."
  )
};

export default {
  rules
};