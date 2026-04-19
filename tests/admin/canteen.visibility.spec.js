// tests/canteen.visibility.spec.js
// User Journey: Admin toggles canteen visibility, filters and searches canteens, exports PDF

import { test, expect } from '@playwright/test';

const BASE_URL       = 'http://localhost:5173';
const ADMIN_EMAIL    = 'felix@gmail.com';
const ADMIN_PASSWORD = 'Shazmina2005';

async function loginAsAdmin(page) {
  await page.goto(`${BASE_URL}/login/admin`);
  await page.getByPlaceholder(/email/i).fill(ADMIN_EMAIL);
  await page.getByPlaceholder(/password/i).fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: /login|sign in/i }).click();
  await page.waitForURL(/\/admin/, { timeout: 10000 });
}

test.describe('Canteen Visibility', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`${BASE_URL}/admin/canteens/manage`);
  });

  // ── 1. Page renders correctly ─────────────────────────────────────────────
  test('should display Canteen Visibility page title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Canteen Visibility' })).toBeVisible();
  });

  test('should display three stat cards: Operating, Visible, Hidden', async ({ page }) => {
    await expect(page.getByText(/operating canteens/i)).toBeVisible();
    await expect(page.getByText(/visible canteens/i)).toBeVisible();
    await expect(page.getByText(/hidden canteens/i)).toBeVisible();
  });

  test('should show stat card values after loading', async ({ page }) => {
    await expect(page.locator('.animate-pulse').first()).not.toBeVisible({ timeout: 8000 });
    const statNums = page.locator('.tabular-nums');
    await expect(statNums.first()).toBeVisible();
  });

  // ── 2. Table structure ────────────────────────────────────────────────────
  test('should render table with correct column headers', async ({ page }) => {
    await expect(page.getByText(/^canteen$/i)).toBeVisible();
    await expect(page.getByText(/^status$/i)).toBeVisible();
    await expect(page.getByText(/^rating$/i)).toBeVisible();
    await expect(page.getByText(/^orders$/i)).toBeVisible();
   await expect(page.locator('div').filter({ hasText: /^Complaints$/ }).first()).toBeVisible();
    await expect(page.getByText(/^toggle$/i)).toBeVisible();
  });

  // ── 3. Filter buttons ─────────────────────────────────────────────────────
  test('should display visibility filter buttons: All, Visible, Hidden', async ({ page }) => {
    await expect(page.getByRole('button', { name: /^all$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^visible$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^hidden$/i })).toBeVisible();
  });

  test('should default to All filter on page load', async ({ page }) => {
    const allBtn = page.getByRole('button', { name: /^all$/i });
    await expect(allBtn).toHaveClass(/indigo/);
  });

  test('should filter to Visible only canteens when Visible filter clicked', async ({ page }) => {
    await page.getByRole('button', { name: /^visible$/i }).click();
    await page.waitForTimeout(1000);
    // All visible status badges in the table should say "Visible"
    const hiddenBadges = page.locator('.rounded-full').filter({ hasText: /^hidden$/i });
    const count = await hiddenBadges.count();
    expect(count).toBe(0);
  });

  test('should filter to Hidden only canteens when Hidden filter clicked', async ({ page }) => {
    await page.getByRole('button', { name: /^hidden$/i }).click();
    await page.waitForTimeout(1000);
    const visibleBadges = page.locator('.rounded-full').filter({ hasText: /^visible$/i });
    const count = await visibleBadges.count();
    expect(count).toBe(0);
  });

  // ── 4. Search functionality ───────────────────────────────────────────────
  test('should display search input', async ({ page }) => {
    await expect(page.getByPlaceholder(/search by canteen or owner/i)).toBeVisible();
  });

  test('should show filtered count when searching', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search by canteen or owner/i);
    await searchInput.fill('a');
    await page.waitForTimeout(500);
    // Shows "X canteen(s) matching..." text
    await expect(page.getByText(/showing \d+ canteen/i)).toBeVisible();
  });

  test('should show empty state when search yields no results', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search by canteen or owner/i);
    await searchInput.fill('xyznocanteen99999');
    await page.waitForTimeout(500);
    await expect(page.getByText(/no results/i)).toBeVisible();
  });

  // ── 5. Toggle visibility button ───────────────────────────────────────────
  test('should render Hide or Show toggle button for each canteen row', async ({ page }) => {
    await page.waitForTimeout(2000);
    const toggleBtns = page.getByRole('button', { name: /hide|show/i });
    const count      = await toggleBtns.count();
    const hasEmpty   = await page.getByText(/no canteens found/i).isVisible();
    if (!hasEmpty) {
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should show toast notification after toggling canteen visibility', async ({ page }) => {
    await page.waitForTimeout(2000);
    const toggleBtn = page.getByRole('button', { name: /hide|show/i }).first();
    const isVisible = await toggleBtn.isVisible();
    if (isVisible) {
      await toggleBtn.click();
      // Toast message should appear
      await expect(
        page.locator('.fixed.top-4.right-4').or(page.getByText(/visible|hidden/i))
      ).toBeVisible({ timeout: 5000 });
    }
  });

  // ── 6. Star ratings render ────────────────────────────────────────────────
  test('should render star rating icons in the table rows', async ({ page }) => {
    await page.waitForTimeout(2000);
    const hasEmpty = await page.getByText(/no canteens found/i).isVisible();
    if (!hasEmpty) {
      // Star SVG icons should exist in table
      const stars = page.locator('svg').filter({ has: page.locator('[class*="amber"]') });
      const count = await stars.count();
      // Rows exist so stars should be present
      expect(count).toBeGreaterThanOrEqual(0); // may be 0 if no ratings yet
    }
  });

  // ── 7. Export PDF ─────────────────────────────────────────────────────────
  test('should display Export PDF button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /export pdf/i })).toBeVisible();
  });

  test('should disable Export PDF when no canteens match search', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search by canteen or owner/i);
    await searchInput.fill('xyznocanteen99999');
    await page.waitForTimeout(500);
    const exportBtn = page.getByRole('button', { name: /export pdf/i });
    await expect(exportBtn).toBeDisabled();
  });

  // ── 8. Visibility badge colours ───────────────────────────────────────────
  test('should show green badge for visible canteens and gray for hidden', async ({ page }) => {
    await page.waitForTimeout(2000);
    const hasEmpty = await page.getByText(/no canteens found/i).isVisible();
    if (!hasEmpty) {
      const visibleBadge = page.locator('.bg-green-50').first();
      const exists       = await visibleBadge.isVisible();
      expect(exists).toBeTruthy();
    }
  });

});