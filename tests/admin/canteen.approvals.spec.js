// tests/canteen.approvals.spec.js
// User Journey: Admin reviews pending canteen registrations, approves or rejects them

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

test.describe('Canteen Approvals', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`${BASE_URL}/admin/canteens/approvals`);
  });

  // ── 1. Page renders correctly ─────────────────────────────────────────────
  test('should display Canteen Approvals page title', async ({ page }) => {
    await expect(page.getByText(/canteen approvals/i)).toBeVisible();
  });

  test('should display three stat cards: Approved, Pending, Rejected', async ({ page }) => {
    await expect(page.getByText(/approved canteens/i)).toBeVisible();
    await expect(page.getByText(/pending approval/i)).toBeVisible();
    await expect(page.getByText('Rejected').first()).toBeVisible();
  });

  // ── 2. Filter buttons ─────────────────────────────────────────────────────
  test('should display filter buttons: Pending, Approved, Rejected, All', async ({ page }) => {
    await expect(page.getByRole('button', { name: /^pending$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^approved$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^rejected$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^all$/i })).toBeVisible();
  });

  test('should default to Pending filter on load', async ({ page }) => {
    // The Pending button should have active styling (yellow classes)
    const pendingBtn = page.getByRole('button', { name: /^pending$/i });
    await expect(pendingBtn).toHaveClass(/yellow/);
  });

  test('should switch to Approved filter and reload list', async ({ page }) => {
    const approvedBtn = page.getByRole('button', { name: /^approved$/i });
    await approvedBtn.click();
    await page.waitForTimeout(1000);
    // Either cards appear or empty state is shown
    const hasCards  = (await page.locator('.grid .bg-white').count()) > 0;
    const hasEmpty  = await page.getByText(/no.*canteens/i).isVisible();
    expect(hasCards || hasEmpty).toBeTruthy();
  });

  test('should switch to All filter and reload list', async ({ page }) => {
    await page.getByRole('button', { name: /^all$/i }).click();
    await page.waitForTimeout(1000);
    const hasCards = (await page.locator('.rounded-2xl.border').count()) > 0;
    const hasEmpty = await page.getByText(/no.*canteens/i).isVisible();
    expect(hasCards || hasEmpty).toBeTruthy();
  });

  // ── 3. Search functionality ───────────────────────────────────────────────
  test('should display search input field', async ({ page }) => {
    await expect(page.getByPlaceholder(/search by canteen or owner/i)).toBeVisible();
  });

  test('should filter results as user types in search box', async ({ page }) => {
    // Switch to All to have more results
    await page.getByRole('button', { name: /^all$/i }).click();
    await page.waitForTimeout(1000);

    const searchInput = page.getByPlaceholder(/search by canteen or owner/i);
    await searchInput.fill('xyz_no_match_12345');
    await page.waitForTimeout(500);

    // Either shows "no results" or "0 results"
    const noResult = await page.getByText(/no results/i).isVisible()
                  || await page.getByText(/0 result/i).isVisible();
    expect(noResult).toBeTruthy();
  });

  test('should show result count feedback when searching', async ({ page }) => {
    await page.getByRole('button', { name: /^all$/i }).click();
    await page.waitForTimeout(1000);
    const searchInput = page.getByPlaceholder(/search by canteen or owner/i);
    await searchInput.fill('a');
    await page.waitForTimeout(500);
    // Shows "X result(s) for..." text
    await expect(page.getByText(/\d+ results? for/i).or(page.getByText(/0 results/i)).first()).toBeVisible();
  });

  // ── 4. Canteen cards ──────────────────────────────────────────────────────
  test('should render canteen cards with View Details button', async ({ page }) => {
    await page.waitForTimeout(2000);
    const hasPending = await page.getByRole('button', { name: /view details/i }).first().isVisible();
    const hasEmpty   = await page.getByText(/no.*canteens/i).isVisible();
    expect(hasPending || hasEmpty).toBeTruthy();
  });

  test('should open detail modal when View Details is clicked', async ({ page }) => {
    await page.waitForTimeout(2000);
    const viewBtn = page.getByRole('button', { name: /view details/i }).first();
    const isVisible = await viewBtn.isVisible();
    if (isVisible) {
      await viewBtn.click();
      // Modal shows registration details text
      await expect(page.getByText(/registration details/i)).toBeVisible();
    }
  });

  test('should close detail modal when X button is clicked', async ({ page }) => {
    await page.waitForTimeout(2000);
    const viewBtn = page.getByRole('button', { name: /view details/i }).first();
    const isVisible = await viewBtn.isVisible();
    if (isVisible) {
      await viewBtn.click();
      await expect(page.getByText(/registration details/i)).toBeVisible();
      // Close the modal
      await page.locator('button').filter({ has: page.locator('svg') }).last().click();
      await expect(page.getByText(/registration details/i)).not.toBeVisible();
    }
  });

  // ── 5. Reject modal requires reason ──────────────────────────────────────
  test('should disable Reject confirm button when reason is empty', async ({ page }) => {
    await page.waitForTimeout(2000);
    // Click reject icon on first pending card (XCircle button)
    const rejectIconBtn = page.locator('button').filter({ has: page.locator('[data-testid="x-circle"], svg') }).nth(1);
    // Find the reject button by looking for the red border button
    const cards = await page.locator('.grid.grid-cols-2 > div').count();
    if (cards > 0) {
      // Open reject modal via the red border icon button on the first card
      const rejectBtns = page.locator('button.border-red-200, button.border-red-800');
      const count = await rejectBtns.count();
      if (count > 0) {
        await rejectBtns.first().click();
        await page.waitForTimeout(300);
        // Reject confirm button should be disabled when textarea is empty
        const confirmBtn = page.getByRole('button', { name: /^reject$/i }).last();
        await expect(confirmBtn).toBeDisabled();
      }
    }
  });

  test('should enable Reject button when reason is typed', async ({ page }) => {
    await page.waitForTimeout(2000);
    const rejectBtns = page.locator('button.border-red-200, button.border-red-800');
    const count = await rejectBtns.count();
    if (count > 0) {
      await rejectBtns.first().click();
      await page.waitForTimeout(300);
      await page.locator('textarea').fill('Incomplete documents submitted.');
      const confirmBtn = page.getByRole('button', { name: /^reject$/i }).last();
      await expect(confirmBtn).not.toBeDisabled();
    }
  });

  // ── 6. Export PDF button ──────────────────────────────────────────────────
  test('should display Export PDF button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /export pdf/i })).toBeVisible();
  });

  test('should disable Export PDF button when no canteens are shown', async ({ page }) => {
    // Search for something that returns no results
    const searchInput = page.getByPlaceholder(/search by canteen or owner/i);
    await searchInput.fill('zzznoresult999');
    await page.waitForTimeout(500);
    const exportBtn = page.getByRole('button', { name: /export pdf/i });
    await expect(exportBtn).toBeDisabled();
  });

  // ── 7. Status badges ──────────────────────────────────────────────────────
  test('should show status badge on each canteen card', async ({ page }) => {
    await page.getByRole('button', { name: /^all$/i }).click();
    await page.waitForTimeout(2000);
    const badges = page.locator('.rounded-full').filter({ hasText: /pending|approved|rejected/i });
    const count  = await badges.count();
    // If there are canteen cards, there should be status badges
    const cards  = await page.locator('.grid.grid-cols-2 > div').count();
    if (cards > 0) {
      expect(count).toBeGreaterThan(0);
    }
  });

});