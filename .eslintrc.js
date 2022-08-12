module.exports = {
  root: true,
  extends: "@react-native-community",
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "import"],
  overrides: [
    {
      files: ["*.js", "*.ts", "*.tsx"],
      rules: {
        "@typescript-eslint/no-shadow": ["error"],
        "no-shadow": "off",
        "no-undef": "off",
        quotes: ["error", "double"],
        "import/order": [
          "error",
          {
            groups: ["builtin", "external", "internal"],
            pathGroups: [
              {
                pattern: "react+(|-native)",
                group: "external",
                position: "before",
              },
            ],
            pathGroupsExcludedImportTypes: ["react+(|-native)"],
            "newlines-between": "always",
            alphabetize: {
              order: "asc",
              caseInsensitive: true,
            },
          },
        ],
      },
    },
  ],
};
