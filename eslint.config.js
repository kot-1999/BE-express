import eslintPluginPrettier from "eslint-plugin-prettier";
import typescriptEslintPlugin from "@typescript-eslint/eslint-plugin";
import typescriptEslintParser from "@typescript-eslint/parser";
import eslintImport from 'eslint-plugin-import'

export default [{
  files: ["**/*.ts", "**/*.tsx", "**/*.js"],
  languageOptions: {
    parser: typescriptEslintParser,
    parserOptions: {
      ecmaVersion: "latest",
      project: "./tsconfig.eslint.json"
    }
  },
  plugins: {
    "@typescript-eslint": typescriptEslintPlugin,
    prettier: eslintPluginPrettier,
    import: eslintImport
  },
  rules: {
    "object-curly-newline": [
      "error",
      {
        "ObjectExpression": { "multiline": true, "consistent": true },
        "ObjectPattern": { "multiline": true, "consistent": true },
        "ImportDeclaration": { "multiline": true, "consistent": true },
        "ExportDeclaration": { "multiline": true, "consistent": true }
      }
    ],
    "arrow-parens": ["error", "always"],
    "object-property-newline": [
      "error",
      { "allowAllPropertiesOnSameLine": false }
    ],
    "operator-linebreak": ["error", "before"],
    "function-paren-newline": ["error", "multiline"],
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "indent": ["error", 4],
    "wrap-iife": ["error", "inside"],
    "quotes": ["error", "single", { "avoidEscape": true }],
    "max-len": ["error", {
      "code": 120,
      "ignoreComments": false, // Ignore long comments
      "ignoreUrls": false, // Ignore long URLs
      "ignoreStrings": false, // Ignore strings in the line length calculation
      "ignoreTemplateLiterals": false, // Ignore template literals
      "ignoreRegExpLiterals": false
    }],
    "newline-per-chained-call": ["error", { "ignoreChainWithDepth": 2 }],
    curly: ["error", "all"],
    "no-console": "error",
    eqeqeq: ["error", "always"],
    "no-var": "error",
    "key-spacing": ["error", { "beforeColon": false, "afterColon": true }],
    "object-curly-spacing": ["error", "always"],
    "no-extra-semi": "error",
    "comma-dangle": ["error", "never"],
    "prefer-const": "error",
    "brace-style": ["error", "1tbs", { "allowSingleLine": true }],
    "no-duplicate-imports": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
    "import/no-cycle": "error",
    "no-multiple-empty-lines": ["error", { "max": 1, "maxEOF": 0, "maxBOF": 0 }],
    "import/order": [
      "error",
      {
        "alphabetize": { "order": "asc", "caseInsensitive": true },
        "groups": ["builtin", "external", "internal", ["parent", "sibling", "index"], "object", "type"],
        "newlines-between": "always"
      }
    ],
    "import/newline-after-import": "error"
  },
  settings: {},
  ignores: ["node_modules/", "dist/", ".idea"],
}]