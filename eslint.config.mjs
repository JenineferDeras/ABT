import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
<<<<<<< HEAD
=======
      ".next/**/*",
>>>>>>> 420d661fb588b567d48bc8c8f6ee52b18239beb5
      "supabase/functions/**/*",
      "apiClient.ts",
      "models/**/*",
      "users/**/*",
    ],
  },
  ...compat.extends("next/core-web-vitals"),
];

export default eslintConfig;
