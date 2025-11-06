import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";

const [tsBaseConfig, ...tsAdditionalConfigs] =
  tsPlugin.configs["flat/recommended"];

const baseConfig = {
  ...tsBaseConfig,
  languageOptions: {
    ...tsBaseConfig.languageOptions,
    parserOptions: {
      ...(tsBaseConfig.languageOptions?.parserOptions ?? {}),
      ecmaVersion: "latest",
      sourceType: "module",
      ecmaFeatures: {
        ...(tsBaseConfig.languageOptions?.parserOptions?.ecmaFeatures ?? {}),
        jsx: true,
      },
    },
    globals: {
      ...globals.browser,
      ...globals.node,
    },
  },
  plugins: {
    ...(tsBaseConfig.plugins ?? {}),
    "@next/next": nextPlugin,
    "react-hooks": reactHooks,
  },
  rules: {
    ...js.configs.recommended.rules,
    ...(nextPlugin.configs.recommended?.rules ?? {}),
    ...(reactHooks.configs.recommended?.rules ?? {}),
    "@next/next/no-html-link-for-pages": "error",
    "no-useless-escape": "off",
  },
};

const typedConfigs = tsAdditionalConfigs.map((config) => {
  if (!config.rules) {
    return config;
  }

  return {
    ...config,
    rules: {
      ...config.rules,
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "off",
    },
  };
});

export default [
  {
    ignores: ["node_modules/**", ".next/**", "Build/**"],
  },
  baseConfig,
  ...typedConfigs,
];
