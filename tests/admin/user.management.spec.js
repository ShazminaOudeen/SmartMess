// tests/user.management.spec.js
// User Journey: Admin views users, searches, filters by status, blocks/unblocks, exports PDF

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

test.describe('User Management', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`${BASE_URL}/admin/users`);
  });

  // ── 1. Page renders correctly ─────────────────────────────────────────────
  test('should display User Management page title', async ({ page }) => {
    await expect(page.getByText(/user management/i)).toBeVisible();
  });

  test('should show three stat cards: Total, Active, Blocked', async ({ page }) => {
    await expect(page.getByText(/total users/i)).toBeVisible();
    await expect(page.getByText(/active users/i)).toBeVisible();
    await expect(page.getByText(/blocked users/i)).toBeVisible();
  });

  test('should load stat numbers after skeletons disappear', async ({ page }) => {
    await expect(page.locator('.animate-pulse').first()).not.toBeVisible({ timeout: 8000 });
    const statValues = page.locator('.tabular-nums');
    await expect(statValues.first()).toBeVisible();
  });

  // ── 2. Table structure ────────────────────────────────────────────────────
  test('should render table with User, Email, Registered, Status, Action headers', async ({ page }) => {
    await expect(page.getByText(/^user$/i)).toBeVisible();
    await expect(page.getByText(/^email$/i)).toBeVisible();
    await expect(page.getByText(/^registered$/i)).toBeVisible();
    await expect(page.getByText(/^status$/i)).toBeVisible();
    await expect(page.getByText(/^action$/i)).toBeVisible();
  });

  test('should display user rows after data loads', async ({ page }) => {
    await page.waitForTimeout(2500);
    const hasRows  = (await page.locator('.divide-y > div').count()) > 0;
    const hasEmpty = await page.getByText(/no users found/i).isVisible();
    expect(hasRows || hasEmpty).toBeTruthy();
  });

  // ── 3. Search functionality ───────────────────────────────────────────────
  test('should display search input with correct placeholder', async ({ page }) => {
    await expect(page.getByPlaceholder(/search by name, email, phone or nic/i)).toBeVisible();
  });

  test('should filter user list when typing in search box', async ({ page }) => {
    await page.waitForTimeout(2000);
    const searchInput = page.getByPlaceholder(/search by name, email, phone or nic/i);
    await searchInput.fill('zzznomatchuser99999');
    await page.waitForTimeout(500);
    await expect(page.getByText(/no results/i)).toBeVisible();
  });

  test('should show result count when search filter is active', async ({ page }) => {
    await page.waitForTimeout(2000);
    const searchInput = page.getByPlaceholder(/search by name, email, phone or nic/i);
    await searchInput.fill('a');
    await page.waitForTimeout(500);
    // "Showing X user(s) matching..." appears
    await expect(page.getByText(/showing/i)).toBeVisible();
  });

  // ── 4. Status filter buttons ──────────────────────────────────────────────
  test('should display All, Active, Blocked filter buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: /^all$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^active$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^blocked$/i })).toBeVisible();
  });

  test('should apply Active filter and show only active users', async ({ page }) => {
    await page.waitForTimeout(2000);
    await page.getByRole('button', { name: /^active$/i }).click();
    await page.waitForTimeout(500);
    // No blocked badges should be visible
    const blockedBadges = page.locator('.rounded-full').filter({ hasText: /^blocked$/i });
    const count         = await blockedBadges.count();
    expect(count).toBe(0);
  });

  test('should apply Blocked filter and show only blocked users', async ({ page }) => {
    await page.waitForTimeout(2000);
    await page.getByRole('button', { name: /^blocked$/i }).click();
    await page.waitForTimeout(500);
    const activeBadges = page.locator('.rounded-full').filter({ hasText: /^active$/i });
    const count        = await activeBadges.count();
    expect(count).toBe(0);
  });

  // ── 5. View user modal ────────────────────────────────────────────────────
  test('should open user detail modal when Eye icon is clicked', async ({ page }) => {
    await page.waitForTimeout(2500);
    const eyeBtn = page.locator('button').filter({ has: page.locator('svg') }).nth(0);
    // Find the eye button specifically (first action column button)
    const viewBtns = page.locator('.col-span-1 button').first();
    const isVisible = await viewBtns.isVisible();
    if (isVisible) {
      await viewBtns.click();
      // Modal should show user details like Email, Phone
      await expect(page.getByText(/email/i).last()).toBeVisible();
    }
  });

  test('should close user detail modal when Close is clicked', async ({ page }) => {
    await page.waitForTimeout(2500);
    // Open modal
    const viewBtns = page.locator('.col-span-1 button').first();
    const isVisible = await viewBtns.isVisible();
    if (isVisible) {
      await viewBtns.click();
      await page.waitForTimeout(300);
      const closeBtn = page.getByRole('button', { name: /close/i });
      await closeBtn.click();
      // Modal closes
      await expect(page.getByRole('button', { name: /close/i })).not.toBeVisible({ timeout: 2000 });
    }
  });

  // ── 6. Block/Unblock user ─────────────────────────────────────────────────
  test('should show Block User button for active users in modal', async ({ page }) => {
    await page.waitForTimeout(2500);
    const viewBtns = page.locator('.col-span-1 button').first();
    const isVisible = await viewBtns.isVisible();
    if (isVisible) {
      await viewBtns.click();
      // Either Block User or Unblock User button should be visible
      const actionBtn = page.getByRole('button', { name: /block user|unblock user/i });
      await expect(actionBtn).toBeVisible();
    }
  });

  test('should show toast message after blocking a user', async ({ page }) => {
    await page.waitForTimeout(2500);
    // Find a non-blocked user's quick block button in the table
    const blockBtns = page.locator('.bg-red-50.border-red-200');
    const count      = await blockBtns.count();
    if (count > 0) {
      await blockBtns.first().click();
      await expect(page.locator('.fixed.top-4')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText(/blocked successfully/i)).toBeVisible({ timeout: 5000 });
    }
  });

  // ── 7. Status badges ──────────────────────────────────────────────────────
  test('should show Active or Blocked badge on each user row', async ({ page }) => {
    await page.waitForTimeout(2500);
    const hasEmpty = await page.getByText(/no users found/i).isVisible();
    if (!hasEmpty) {
      const badges = page.locator('.rounded-full').filter({ hasText: /active|blocked/i });
      const count  = await badges.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  // ── 8. Export PDF ─────────────────────────────────────────────────────────
  test('should display Export PDF button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /export pdf/i })).toBeVisible();
  });

  test('should disable Export PDF button when user list is empty', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search by name, email, phone or nic/i);
    await searchInput.fill('zzznomatchuser99999');
    await page.waitForTimeout(500);
    const exportBtn = page.getByRole('button', { name: /export pdf/i });
    await expect(exportBtn).toBeDisabled();
  });

  test('should show success toast after exporting PDF', async ({ page }) => {
    await page.waitForTimeout(2500);
    const exportBtn = page.getByRole('button', { name: /export pdf/i });
    const isEnabled = await exportBtn.isEnabled();
    if (isEnabled) {
      await exportBtn.click();
      await expect(page.getByText(/exported successfully/i)).toBeVisible({ timeout: 8000 });
    }
  });

});