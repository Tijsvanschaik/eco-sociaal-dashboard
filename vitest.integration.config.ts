import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

import { loadDotEnvFiles } from "./tests/integration/parse-env-file";

// Prefer values from `.env` / `.env.local` on disk over inherited `process.env`
// (e.g. CI placeholder URLs) so `npm run test:integration` always targets the
// developer's Supabase project when those files are present.
const diskEnv = loadDotEnvFiles(process.cwd());
const INTEGRATION_ENV_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

const env: Record<string, string> = {};
for (const key of INTEGRATION_ENV_KEYS) {
  if (diskEnv[key]) {
    env[key] = diskEnv[key];
  } else if (process.env[key]) {
    env[key] = process.env[key] as string;
  }
}

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
    },
  },
  test: {
    environment: "node",
    include: ["tests/integration/**/*.{test,spec}.ts"],
    exclude: ["node_modules", ".next"],
    testTimeout: 30_000,
    hookTimeout: 60_000,
    env,
    // Integration tests mutate shared data; serialize them.
    fileParallelism: false,
    sequence: {
      concurrent: false,
    },
  },
});
