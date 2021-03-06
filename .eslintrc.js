module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    "project": "tsconfig.json"
  },
  plugins: ["prettier"],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    "plugin:prettier/recommended"
  ],
  rules: {
    "@typescript-eslint/explicit-function-return-type": [
      "error",
      {
        "allowExpressions": true
      }
    ],
    "jest/valid-title": "off"
  }
};
