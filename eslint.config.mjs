import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [".next/**", "node_modules/**", "data/**", "public/uploads/**", "next-env.d.ts"]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      "@next/next": nextPlugin
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      "@next/next/no-img-element": "off"
    }
  },
  {
    files: ["**/*.{ts,tsx,mjs}"],
    languageOptions: {
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        FormData: "readonly",
        File: "readonly",
        React: "readonly",
        window: "readonly",
        localStorage: "readonly"
      }
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
    }
  }
];
