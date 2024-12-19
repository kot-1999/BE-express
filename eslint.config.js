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
      sourceType: "module",
      project: "./tsconfig.eslint.json"
    }
  },
  plugins: {
    "@typescript-eslint": typescriptEslintPlugin,
    prettier: eslintPluginPrettier,
    import: eslintImport
  },
  rules: {
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "indent": ["error", 4],
    "quotes": ["error", "single"],
    "semi": ["error", "never"],
    "max-len": ["warn", { "code": 120 }],
    curly: ["error", "all"],
    "no-console": "warn",
    eqeqeq: ["error", "always"],
    "no-var": "error",
    "key-spacing": ["error", { "beforeColon": false, "afterColon": true }],
    "object-curly-spacing": ["error", "always"],
    "no-extra-semi": "error",
    "comma-dangle": ["error", "never"],
    "prefer-const": "error",
    "no-duplicate-imports": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
    "import/order": [
      "error",
      {
        "alphabetize": { "order": "asc" },
        "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
        "newlines-between": "always"
      }
    ],
    "import/newline-after-import": "error"
  },
  settings: {},
  ignores: ["node_modules/", "dist/", ".idea"],
}]