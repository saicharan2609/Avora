module.exports = {
  "*.{js,cjs,mjs,ts,tsx,json,yml,yaml,md,css}": [
    "pnpm format:check",
    "pnpm lint"
  ]
};