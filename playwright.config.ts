import path from 'node:path';

import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  // fullyParallel false because we are going with the simplest approach for now: https://playwright.dev/docs/auth#basic-shared-account-in-all-tests
  /* Run tests sequentially for database isolation */
  fullyParallel: false,
  /* Global setup and teardown for isolated test database */
  globalSetup: path.resolve('./e2e-tests/global-setup'),
  globalTeardown: path.resolve('./e2e-tests/global-teardown'),
  /* Configure projects for major browsers */
  projects: [
    {
      name: 'signin',
      testDir: 'e2e-tests/signed-in-user',
      testMatch: /.*\.setup\.ts/,
    },
    {
      dependencies: ['signin'],
      name: 'signed-in-user',
      testDir: 'e2e-tests/signed-in-user',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e-tests/.auth/user.json',
      },
    },
    {
      name: 'public',
      testDir: 'e2e-tests/public',
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
