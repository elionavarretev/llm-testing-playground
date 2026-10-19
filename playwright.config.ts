import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // No retries on purpose: a flaky LLM answer is a finding, not noise.
  retries: 0,
  reporter: [['list']],
});
