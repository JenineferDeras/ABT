import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import reactPlugin from "eslint-plugin-react";
import tseslint from "typescript-eslint";
import globals from "globals";

const reactRecommended = reactPlugin.configs.recommended;
const nextRecommended = nextPlugin.configs.recommended;
const reactSettings = reactRecommended.settings ?? {
  react: { version: "detect" },
};

export default [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "dist/**",
      "build/**",
      "coverage/**",
      ".vercel/**",
      "models/index.ts",
      "next-env.d.ts",
    ],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      "no-var": "error",
    },
  },
  {
    files: ["**/*.{jsx,tsx}"],
    plugins: { react: reactPlugin },
    languageOptions: {
      parserOptions: {
        ...(reactRecommended.languageOptions?.parserOptions ?? {}),
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    settings: reactSettings,
    rules: {
      ...reactRecommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/display-name": "off",
      "react/prop-types": "off",
    },
  },
  {
    files: ["**/*.{jsx,tsx}"],
    plugins: { "@next/next": nextPlugin },
    rules: nextRecommended.rules,
  },
];
