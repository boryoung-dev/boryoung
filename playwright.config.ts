import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: 0,
  timeout: 30000,
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "web",
      use: { baseURL: "http://localhost:3000" },
      testMatch: /web\/.*.spec\.ts/,
    },
    {
      name: "admin",
      use: { baseURL: "http://localhost:3001" },
      testMatch: /admin\/.*.spec\.ts/,
    },
  ],
});
