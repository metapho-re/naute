export default {
  extends: ["stylelint-config-standard", "stylelint-config-idiomatic-order"],
  ignoreFiles: ["**/dist/**/*.css"],
  plugins: ["stylelint-order"],
  rules: {
    "at-rule-no-unknown": [
      true,
      { ignoreAtRules: ["theme", "custom-variant", "utility"] },
    ],
    "import-notation": "string",
    "selector-class-pattern": null,
  },
};
