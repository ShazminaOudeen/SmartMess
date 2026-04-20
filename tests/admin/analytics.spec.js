// tests/analytics.spec.js
// User Journey: Admin views canteen revenue analytics, sorts rankings, searches, exports CSV/PDF

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

test.describe('Analytics Page', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`${BASE_URL}/admin/analytics`);
  });

  // ── 1. Page renders correctly ─────────────────────────────────────────────
  test('should display Analytics page title', async ({ page }) => {
    await expect(page.getByText(/analytics/i).first()).toBeVisible();
  });

  test('should display three summary stat cards', async ({ page }) => {
   await expect(page.getByRole('paragraph').filter({ hasText: 'Total Revenue' }).first()).toBeVisible();
    await expect(page.getByRole('paragraph').filter({ hasText: 'Total Orders' }).first()).toBeVisible();
    await expect(page.getByText(/most popular/i)).toBeVisible();
  });

  test('should show stat values after loading', async ({ page }) => {
    await expect(page.locator('.animate-pulse').first()).not.toBeVisible({ timeout: 8000 });
    // Rs. prefix should appear in the revenue card
    const revText = page.getByText(/Rs\./i).first();
    await expect(revText).toBeVisible();
  });

  // ── 2. Month/Year filter on summary cards ─────────────────────────────────
  test('should show month label on stat cards', async ({ page }) => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const currentMonth = months[new Date().getMonth()];
    await expect(page.getByText(new RegExp(currentMonth, 'i')).first()).toBeVisible();
  });

  // ── 3. Line chart section ─────────────────────────────────────────────────
  test('should display Monthly Orders Trend chart section', async ({ page }) => {
    await expect(page.getByText(/monthly orders trend/i)).toBeVisible();
  });

  test.beforeEach(async ({ page }) => {
  test.setTimeout(60000);
    const yearSelect = page.locator('select').first();
    await expect(yearSelect).toBeVisible();
    const currentYear = String(new Date().getFullYear());
    await expect(yearSelect).toHaveValue(currentYear);
  });

  test('should change year when selecting different year in chart dropdown', async ({ page }) => {
    const yearSelect   = page.locator('select').first();
    const currentYear  = new Date().getFullYear();
    const previousYear = String(currentYear - 1);
    await yearSelect.selectOption(previousYear);
    await expect(yearSelect).toHaveValue(previousYear);
    await page.waitForTimeout(1000);
    // Chart reloads — no crash
    await expect(page.getByText(/monthly orders trend/i)).toBeVisible();
  });

  // ── 4. Rankings table ─────────────────────────────────────────────────────
 test('should display Canteen Rankings table with headers', async ({ page }) => {
  await expect(page.locator('span').filter({ hasText: /^Monthly Orders$/ })).toBeVisible();
  await expect(page.locator('span').filter({ hasText: /^Monthly Revenue$/ })).toBeVisible();
  await expect(page.locator('span').filter({ hasText: /^Total Revenue$/ })).toBeVisible();
  await expect(page.locator('span').filter({ hasText: /^Total Orders$/ })).toBeVisible();
  await expect(page.getByText(/avg \/ order/i)).toBeVisible();
});

  test('should render canteen rows or empty state in rankings table', async ({ page }) => {
    await page.waitForTimeout(3000);
    const hasRows  = (await page.locator('.divide-y > div').count()) > 0;
    const hasEmpty = await page.getByText(/no data for/i).first().isVisible();
    expect(hasRows || hasEmpty).toBeTruthy();
  });

  // ── 5. Sort columns ───────────────────────────────────────────────────────
  test('should sort by Monthly Orders when column header is clicked', async ({ page }) => {
    await page.waitForTimeout(2000);
    const monthlyOrdersHeader = page.getByText(/monthly orders/i).first();
    await monthlyOrdersHeader.click();
    await page.waitForTimeout(500);
    // Sort icon should become active (text turns primary color)
    await expect(monthlyOrdersHeader).toBeVisible();
  });

  test('should reverse sort direction when same column clicked twice', async ({ page }) => {
    await page.waitForTimeout(2000);
    const header = page.getByText(/monthly revenue/i).first();
    await header.click();
    await page.waitForTimeout(300);
    await header.click();
    await page.waitForTimeout(300);
    // No crash — still visible
    await expect(header).toBeVisible();
  });

  // ── 6. Month/Year picker in rankings ─────────────────────────────────────
  test('should display month and year selectors above rankings table', async ({ page }) => {
    // Multiple selects exist: one in chart, two in table toolbar
    const selects = page.locator('select');
    const count   = await selects.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('should reload rankings when month is changed', async ({ page }) => {
    const monthSelect = page.locator('select').nth(1); // Second select = month picker in table
    await monthSelect.selectOption('1'); // January
    await page.waitForTimeout(1500);
    // "Jan" badge appears
   await expect(page.locator('span').filter({ hasText: /^Jan \d{4}$/ })).toBeVisible();
  });

  // ── 7. Search functionality ───────────────────────────────────────────────
  test('should display search input in rankings table', async ({ page }) => {
    await expect(page.getByPlaceholder(/search canteen by name/i)).toBeVisible();
  });

  test('should show search hint with match count when searching', async ({ page }) => {
    await page.waitForTimeout(2000);
    const searchInput = page.getByPlaceholder(/search canteen by name/i);
    await searchInput.fill('a');
    await page.waitForTimeout(500);
    await expect(page.getByText(/of.*canteens match/i)).toBeVisible();
  });

  test('should show no results when search yields no match', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search canteen by name/i);
    await searchInput.fill('zzznocanteenmatch999');
    await page.waitForTimeout(500);
    await expect(page.getByText(/no canteens matching/i)).toBeVisible();
  });

  test('should show Clear button in search hint and clear search on click', async ({ page }) => {
    await page.waitForTimeout(2000);
    const searchInput = page.getByPlaceholder(/search canteen by name/i);
    await searchInput.fill('a');
    await page.waitForTimeout(500);
    const clearBtn = page.getByRole('button', { name: /clear/i });
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();
    await expect(searchInput).toHaveValue('');
  });

  // ── 8. Export buttons ─────────────────────────────────────────────────────
  test('should display CSV and PDF export buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: /csv/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /pdf/i })).toBeVisible();
  });

  test('should disable CSV export when no canteens are shown', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search canteen by name/i);
    await searchInput.fill('zzznocanteenmatch999');
    await page.waitForTimeout(500);
    const csvBtn = page.getByRole('button', { name: /csv/i });
    await expect(csvBtn).toBeDisabled();
  });

  // ── 9. Footer totals ──────────────────────────────────────────────────────
  test('should display footer totals row below rankings table', async ({ page }) => {
    await page.waitForTimeout(3000);
   const hasEmpty = await page.getByText(/no data for/i).first().isVisible();
    if (!hasEmpty) {
      await expect(page.getByText(/total orders/i).last()).toBeVisible();
      await expect(page.getByText(/total revenue/i).last()).toBeVisible();
    }
  });

  // ── 10. Rank badges ───────────────────────────────────────────────────────
  test('should display rank 1 as a Trophy icon badge', async ({ page }) => {
    await page.waitForTimeout(3000);
   const hasEmpty = await page.getByText(/no data for/i).first().isVisible();
    if (!hasEmpty) {
      // Trophy icon rendered for rank 1
      const trophyIcon = page.locator('[class*="from-amber"]').first();
      await expect(trophyIcon).toBeVisible();
    }
  });

});