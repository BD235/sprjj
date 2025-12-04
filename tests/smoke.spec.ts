import { test, expect } from "@playwright/test";

test("halaman sign-in dapat dibuka", async ({ page }) => {
  await page.goto("/sign-in");
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
});
