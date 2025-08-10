import js from "@eslint/js";
import globals from "globals";
import solid from "eslint-plugin-solid/configs/typescript";
import tseslint from "typescript-eslint";
import { globalIgnores } from "eslint/config";

export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    ...solid,
    extends: [
      js.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      ...solid.rules,
      "@typescript-eslint/array-type": ["warn", { default: "generic" }],
      "@typescript-eslint/consistent-type-definitions": ["warn", "type"],
      "@typescript-eslint/restrict-template-expressions": ["off"],
      "@typescript-eslint/no-confusing-void-expression": ["off"],
      "@typescript-eslint/no-non-null-assertion": ["off"],
      "@typescript-eslint/no-floating-promises": ["off"],
      "@typescript-eslint/prefer-optional-chain": ["off"],
      "solid/prefer-show": ["warn"],
    },
  },
]);
