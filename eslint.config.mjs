import js from "@eslint/js";
import prettierPlugin from "eslint-plugin-prettier/recommended";
import reactHooks from "eslint-plugin-react-hooks";
import tailwindcss from "eslint-plugin-tailwindcss";
import globals from "globals";
import tsEslint from "typescript-eslint";

export default [
  js.configs.recommended,
  ...tsEslint.configs.recommended,
  ...tailwindcss.configs["flat/recommended"],
  {
    ignores: ["**/dist/", "**/node_modules/", ".aws-sam/", "coverage/"],
  },
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: ["backend/src/**/*.ts", "shared/src/**/*.ts"],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    ...reactHooks.configs["recommended-latest"],
    files: ["frontend/src/**/*.{ts,tsx}"],
    rules: {
      ...reactHooks.configs["recommended-latest"].rules,
      "tailwindcss/no-custom-classname": "off",
    },
    languageOptions: {
      globals: globals.browser,
    },
  },
  prettierPlugin,
];
