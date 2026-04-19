import path from "node:path";

import test from "@playwright/test";

const authFile = path.join(import.meta.dirname, '../.auth/user.json');

test("setup signed-in user", async ({ page }) => {
  // Navigate to the sign-in page
  await page.goto("signin");
  // Wait for the page to be hydrated
  await page.waitForLoadState("networkidle");

  // Fill in the sign-in form
  const emailInput = page.getByRole('textbox', { name: 'Email' })
  const passwordInput = page.getByRole('textbox', { name: 'Password' })

  await emailInput.fill(process.env.USER_TEST_EMAIL || "");
  await passwordInput.fill(process.env.USER_TEST_PASSWORD || "");

  // Submit the form
  await page.click('button[type="submit"]');

  // Wait for navigation to the signed-in area
  await page.waitForURL("/");

  await page.context().storageState({ path: authFile });
});