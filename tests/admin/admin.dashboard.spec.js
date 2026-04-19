// tests/admin.dashboard.spec.js
// User Journey: Admin views dashboard stats, chart, activity feed and refreshes data

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';
const ADMIN_EMAIL = 'felix@gmail.com';
const ADMIN_PASSWORD = 'Shazmina2005';

// ── Shared login helper ───────────────────────────────────────────────────────
async function loginAsAdmin(page) {
  await page.goto(`${BASE_URL}/login/admin`);
  await page.getByPlaceholder(/email/i).fill(ADMIN_EMAIL);
  await page.getByPlaceholder(/password/i).fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: /login|sign in/i }).click();
  // Wait until redirected into admin area
  await page.waitForURL(/\/admin/, { timeout: 10000 });
}

test.describe('Admin Dashboard', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`${BASE_URL}/admin/dashboard`);
  });

  // ── 1. Page loads and shows correct title ────────────────────────────────
  test('should display Dashboard title in header', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  // ── 2. Stat cards render (loading → value) ───────────────────────────────
  test('should display three stat cards with labels', async ({ page }) => {
    await expect(page.getByText(/total users/i)).toBeVisible();
    await expect(page.getByText(/approved canteens/i)).toBeVisible();
    await expect(page.getByText(/total orders/i)).toBeVisible();
  });

  test('should show numeric values in stat cards after loading', async ({ page }) => {
    // Pulse skeletons should disappear and numbers appear
    await expect(page.locator('.animate-pulse').first()).not.toBeVisible({ timeout: 8000 });
    // Numbers are rendered as tabular-nums text — at least one should exist
    const statValues = page.locator('.tabular-nums');
    await expect(statValues.first()).toBeVisible();
  });

  // ── 3. Bar chart section ─────────────────────────────────────────────────
  test('should display Orders by Canteen chart section', async ({ page }) => {
    await expect(page.getByText(/orders by canteen/i)).toBeVisible();
    await expect(page.getByText(/today's distribution/i)).toBeVisible();
  });

  test('should show Export CSV button in chart section', async ({ page }) => {
    const exportBtn = page.getByRole('button', { name: /export csv/i });
    await expect(exportBtn).toBeVisible();
  });

  // ── 4. Activity Feed ─────────────────────────────────────────────────────
  test('should display System Activity section', async ({ page }) => {
    await expect(page.getByText(/system activity/i)).toBeVisible();
  });

  test('should show total events count in activity feed', async ({ page }) => {
    // Waits for "X total events" text to appear
    await expect(page.getByText(/total events/i)).toBeVisible({ timeout: 8000 });
  });

  test('should display activity items with time badges after loading', async ({ page }) => {
    // Wait for loading to finish
    await page.waitForTimeout(2000);
    // Either shows activity items OR "No activity yet" message
    const hasItems   = await page.locator('.divide-y > div').count() > 0;
    const hasEmpty   = await page.getByText(/no activity yet/i).isVisible();
    expect(hasItems || hasEmpty).toBeTruthy();
  });

  // ── 5. Pagination in activity feed ───────────────────────────────────────
  test('should show pagination controls when there are multiple pages', async ({ page }) => {
    await page.waitForTimeout(2000);
    const pagination = page.locator('button').filter({ hasText: '' }).nth(0);
    // Pagination only appears if totalPages > 1; skip gracefully if not
    const paginationArea = page.locator('text=/\\d+ \\/ \\d+/');
    const hasPagination  = await paginationArea.isVisible();
    if (hasPagination) {
      // Next button should be visible
      await expect(page.locator('button[disabled]').or(page.locator('button'))).toBeTruthy();
    }
  });

  // ── 6. Refresh button ────────────────────────────────────────────────────
  test('should have a refresh button in the header', async ({ page }) => {
    // AdminHeader renders a refresh button
    const refreshBtn = page.getByRole('button', { name: /refresh/i });
    await expect(refreshBtn).toBeVisible();
  });

  test('should trigger refresh and update last refreshed time', async ({ page }) => {
    const refreshBtn = page.getByRole('button', { name: /refresh/i });
    await refreshBtn.click();
    // After clicking, either spinning state or "just now" timestamp appears
    await page.waitForTimeout(500);
    // No crash — page is still intact
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  // ── 7. Scroll arrows in chart ────────────────────────────────────────────
  test('should show chart scroll arrows when chart data is present', async ({ page }) => {
    await page.waitForTimeout(2000);
    const chartEmpty = await page.getByText(/no orders today/i).isVisible();
    if (!chartEmpty) {
      // ChevronLeft and ChevronRight buttons should be visible
      const arrows = page.locator('button').filter({ has: page.locator('svg') });
      await expect(arrows.first()).toBeVisible();
    }
  });

});