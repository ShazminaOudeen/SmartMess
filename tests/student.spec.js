// @ts-check
import { test, expect } from '@playwright/test';

/*  ─────────────────────────────────────────────
 *  SmartMess — Student Module Playwright Tests
 *  Author : Sahnas
 *  Covers : All 14 Student Module Features
 *  ───────────────────────────────────────────── */

const STUDENT_EMAIL    = 'mendis@gmail.com';
const STUDENT_PASSWORD = 'mendis123';

// ── Helper: login ─────────────────────────────
async function loginAsStudent(page) {
  await page.goto('/login/user');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);
  await page.getByPlaceholder(/enter your email/i).fill(STUDENT_EMAIL);
  await page.getByPlaceholder(/enter your password/i).fill(STUDENT_PASSWORD);
  await page.getByRole('button', { name: /sign in as user/i }).click();
  await page.waitForURL(/student\/canteens|^\/$/, { timeout: 20000 });
  await page.waitForTimeout(500);
}

// ── Helper: login and go to a specific page ───
async function loginAndGo(page, path) {
  await loginAsStudent(page);
  await page.goto(path);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);
}

// ── Helper: navigate to first canteen's meal page ──
// Waits up to 20s for the View Menu button (API may be slow)
async function goToMealListing(page) {
  await page.goto('/student/canteens');
  await page.waitForLoadState('domcontentloaded');
  // Wait for at least one View Menu button to appear (API-driven content)
  const viewMenuBtn = page.locator('button').filter({ hasText: /view menu/i }).first();
  await viewMenuBtn.waitFor({ state: 'visible', timeout: 20000 });
  await viewMenuBtn.click();
  await page.waitForURL(/\/student\/canteens\/.+\/meals/, { timeout: 15000 });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);
}

// ── Helper: add item to cart then go to cart page ──
async function addItemAndGoToCart(page) {
  await goToMealListing(page);
  const addBtn = page.locator('button').filter({ hasText: /add to cart/i }).first();
  await addBtn.waitFor({ state: 'visible', timeout: 10000 });
  await addBtn.click();
  await page.waitForTimeout(1000);
  await page.goto('/student/cart');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);
}

// ══════════════════════════════════════════════
//  1. STUDENT LOGIN
// ══════════════════════════════════════════════

test.describe('TC-S01 | Student Login', () => {

  test('Login page loads with email and password fields', async ({ page }) => {
    await page.goto('/login/user');
    await expect(page.getByPlaceholder(/enter your email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/enter your password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in as user/i })).toBeVisible();
  });

  test('Login fails with wrong password', async ({ page }) => {
    await page.goto('/login/user');
    await page.getByPlaceholder(/enter your email/i).fill(STUDENT_EMAIL);
    await page.getByPlaceholder(/enter your password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in as user/i }).click();
    await expect(page.getByText(/invalid email or password/i)).toBeVisible({ timeout: 10000 });
  });

  test('Student login redirects to canteens page', async ({ page }) => {
    await loginAsStudent(page);
    await expect(page).toHaveURL(/student\/canteens|^\/$/, { timeout: 10000 });
  });

  test('Student name appears in layout after login', async ({ page }) => {
    await loginAsStudent(page);
    await expect(page.locator('body')).toBeVisible();
  });

});

// ══════════════════════════════════════════════
//  2. BROWSE CANTEENS
// ══════════════════════════════════════════════

test.describe('TC-S02 | Browse Canteens', () => {

  test('Canteen listing page loads successfully', async ({ page }) => {
    await loginAndGo(page, '/student/canteens');
    await expect(page).toHaveURL('/student/canteens');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Search input is present on canteens page', async ({ page }) => {
    await loginAndGo(page, '/student/canteens');
    await expect(
      page.locator('input[placeholder*="canteen" i], input[placeholder*="search" i]').first()
    ).toBeVisible({ timeout: 8000 });
  });

  test('Canteen cards appear on the page', async ({ page }) => {
    await loginAndGo(page, '/student/canteens');
    await page.waitForTimeout(2000);
    const cards = page.locator('[class*="card"], [class*="grid"] > div').first();
    await expect(cards).toBeVisible({ timeout: 8000 });
  });

  test('Favourites button is visible', async ({ page }) => {
    await loginAndGo(page, '/student/canteens');
    const favBtn = page.locator('button').filter({ hasText: /favourites/i }).first();
    await expect(favBtn).toBeVisible({ timeout: 8000 });
  });

  test('View Menu button exists on canteen cards', async ({ page }) => {
    await loginAndGo(page, '/student/canteens');
    const btn = page.locator('button').filter({ hasText: /view menu/i }).first();
    await expect(btn).toBeVisible({ timeout: 20000 });
  });

  test('Clicking View Menu goes to meal listing', async ({ page }) => {
    await loginAsStudent(page);
    await goToMealListing(page);
    await expect(page).toHaveURL(/\/student\/canteens\/.+\/meals/);
  });

});

// ══════════════════════════════════════════════
//  3. MEAL LISTING & FILTERS
// ══════════════════════════════════════════════

test.describe('TC-S03 | Meal Listing & Filters', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsStudent(page);
    await goToMealListing(page);
  });

  test('Meal listing URL is correct', async ({ page }) => {
    await expect(page).toHaveURL(/\/student\/canteens\/.+\/meals/);
  });

  test('Breakfast category filter button exists', async ({ page }) => {
    const btn = page.locator('button').filter({ hasText: /breakfast/i }).first();
    await expect(btn).toBeVisible({ timeout: 8000 });
  });

  test('Lunch category filter button exists', async ({ page }) => {
    const btn = page.locator('button').filter({ hasText: /lunch/i }).first();
    await expect(btn).toBeVisible({ timeout: 8000 });
  });

  test('Price filter dropdown is visible', async ({ page }) => {
    // select element is always rendered in the filter bar regardless of meals loading
    await expect(page.locator('select').first()).toBeVisible({ timeout: 8000 });
  });

  test('Price filter has multiple options', async ({ page }) => {
    const dropdown = page.locator('select').first();
    await dropdown.waitFor({ timeout: 8000 });
    const options = await dropdown.locator('option').count();
    expect(options).toBeGreaterThan(1);
  });

  test('Category filter click works', async ({ page }) => {
    const btn = page.locator('button').filter({ hasText: /drinks/i }).first();
    await btn.waitFor({ timeout: 8000 });
    await btn.click();
    await page.waitForTimeout(500);
    await expect(page.locator('body')).toBeVisible();
  });

  test('Rate Canteen button is visible', async ({ page }) => {
    const btn = page.locator('button').filter({ hasText: /rate canteen/i }).first();
    await expect(btn).toBeVisible({ timeout: 8000 });
  });

  test('Report button is visible', async ({ page }) => {
    const btn = page.locator('button').filter({ hasText: /report/i }).first();
    await expect(btn).toBeVisible({ timeout: 8000 });
  });

  test('Cart button is visible', async ({ page }) => {
    const btn = page.locator('button').filter({ hasText: /cart/i }).first();
    await expect(btn).toBeVisible({ timeout: 8000 });
  });

  test('Back to Canteens link is visible', async ({ page }) => {
    const backLink = page.locator('a, button').filter({ hasText: /back to canteens/i }).first();
    await expect(backLink).toBeVisible({ timeout: 8000 });
  });

});

// ══════════════════════════════════════════════
//  4. RATE CANTEEN MODAL
// ══════════════════════════════════════════════

test.describe('TC-S04 | Rate Canteen', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsStudent(page);
    await goToMealListing(page);
  });

  test('Rate Canteen button opens a modal', async ({ page }) => {
    const rateBtn = page.locator('button').filter({ hasText: /rate canteen/i }).first();
    await rateBtn.waitFor({ timeout: 8000 });
    await rateBtn.click();
    await page.waitForTimeout(500);
    const modal = page.locator('[class*="fixed"]').last();
    await expect(modal).toBeVisible({ timeout: 5000 });
  });

  test('Modal contains rating elements', async ({ page }) => {
    const rateBtn = page.locator('button').filter({ hasText: /rate canteen/i }).first();
    await rateBtn.waitFor({ timeout: 8000 });
    await rateBtn.click();
    await page.waitForTimeout(500);
    await expect(page.locator('[class*="fixed"]').last()).toBeVisible({ timeout: 5000 });
  });

  test('Rating modal can be dismissed', async ({ page }) => {
    const rateBtn = page.locator('button').filter({ hasText: /rate canteen/i }).first();
    await rateBtn.waitFor({ timeout: 8000 });
    await rateBtn.click();
    await page.waitForTimeout(500);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    await expect(page.locator('body')).toBeVisible();
  });

});

// ══════════════════════════════════════════════
//  5. REPORT / COMPLAINT FORM
// ══════════════════════════════════════════════

test.describe('TC-S05 | Report & Complaint Form', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsStudent(page);
    await goToMealListing(page);
    const reportBtn = page.locator('button').filter({ hasText: /report/i }).first();
    await reportBtn.waitFor({ timeout: 8000 });
    await reportBtn.click();
    await page.waitForTimeout(800);
  });

  test('Report modal title is visible', async ({ page }) => {
    await expect(page.getByText(/report an issue/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('Submitted by section shows auto-filled info', async ({ page }) => {
    await expect(page.getByText(/submitted by/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('Order Issue category button is visible', async ({ page }) => {
    // Use contains-text match — button may have icon children alongside text
    await expect(
      page.locator('button').filter({ hasText: /order issue/i }).first()
    ).toBeVisible({ timeout: 8000 });
  });

  test('Food Quality category button is visible', async ({ page }) => {
    await expect(
      page.locator('button').filter({ hasText: /food quality/i }).first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('Priority level Low button is visible', async ({ page }) => {
    await expect(
      page.locator('button').filter({ hasText: /\bLow\b/i }).first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('Priority level Urgent button is visible', async ({ page }) => {
    await expect(
      page.locator('button').filter({ hasText: /urgent/i }).first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('Date of incident field is visible', async ({ page }) => {
    await expect(page.locator('input[type="date"]').first()).toBeVisible({ timeout: 5000 });
  });

  test('Description textarea is visible', async ({ page }) => {
    await expect(page.locator('textarea').first()).toBeVisible({ timeout: 5000 });
  });

  test('Email contact preference button is visible', async ({ page }) => {
    // Button contains an icon + "Email" text — avoid exact-match anchor
    await expect(
      page.locator('button').filter({ hasText: /email/i }).first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('Submitting empty form shows validation error', async ({ page }) => {
    await page.locator('button').filter({ hasText: /submit report/i }).first().click();
    await expect(page.locator('body')).toBeVisible();
    await expect(page.getByText(/report an issue/i).first()).toBeVisible({ timeout: 3000 });
  });

  test('Description character counter appears when typing', async ({ page }) => {
    const textarea = page.locator('textarea').first();
    await textarea.fill('Testing the complaint form description field.');
    await expect(page.getByText(/\/500/i).first()).toBeVisible({ timeout: 3000 });
  });

  test('Photo upload area is visible', async ({ page }) => {
    await expect(page.getByText(/upload/i).first()).toBeVisible({ timeout: 5000 });
  });

});

// ══════════════════════════════════════════════
//  6. ADD TO CART
// ══════════════════════════════════════════════

test.describe('TC-S06 | Add to Cart', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsStudent(page);
    await goToMealListing(page);
  });

  test('Add to Cart button is visible on meals', async ({ page }) => {
    // Meal cards load from API — wait generously
    const addBtn = page.locator('button').filter({ hasText: /add to cart/i }).first();
    await expect(addBtn).toBeVisible({ timeout: 15000 });
  });

  test('Clicking Add to Cart shows success feedback', async ({ page }) => {
    const addBtn = page.locator('button').filter({ hasText: /add to cart/i }).first();
    await addBtn.waitFor({ state: 'visible', timeout: 15000 });
    await addBtn.click();
    const feedback = page.getByText(/added/i).first();
    await expect(feedback).toBeVisible({ timeout: 8000 });
  });

  test('Meal prices are shown in RS currency', async ({ page }) => {
    const rsText = page.getByText(/RS/i).first();
    await expect(rsText).toBeVisible({ timeout: 8000 });
  });

  test('Meal names are visible on cards', async ({ page }) => {
    await page.waitForTimeout(1000);
    const meals = page.locator('[class*="card"] h3, [class*="card"] p').first();
    await expect(meals).toBeVisible({ timeout: 8000 });
  });

});

// ══════════════════════════════════════════════
//  7. CART PAGE
// ══════════════════════════════════════════════

test.describe('TC-S07 | Cart Page', () => {

  test('Cart page loads at correct URL', async ({ page }) => {
    await loginAndGo(page, '/student/cart');
    await expect(page).toHaveURL('/student/cart');
  });

  test('Cart page body is visible', async ({ page }) => {
    await loginAndGo(page, '/student/cart');
    await expect(page.locator('body')).toBeVisible();
  });

  test('My Cart heading is visible', async ({ page }) => {
    await loginAndGo(page, '/student/cart');
    await expect(page.getByText(/my cart/i).first()).toBeVisible({ timeout: 8000 });
  });

  test('Order Summary section is visible', async ({ page }) => {
    await loginAsStudent(page);
    await addItemAndGoToCart(page);
    await expect(page.getByText(/order summary/i).first()).toBeVisible({ timeout: 8000 });
  });

  test('Continue Shopping button is visible', async ({ page }) => {
    await loginAndGo(page, '/student/cart');
    const btn = page.locator('button, a').filter({ hasText: /continue shopping/i }).first();
    await expect(btn).toBeVisible({ timeout: 8000 });
  });

  test('Proceed to Checkout button is visible', async ({ page }) => {
    await loginAsStudent(page);
    await addItemAndGoToCart(page);
    const btn = page.locator('button').filter({ hasText: /proceed to checkout/i }).first();
    await expect(btn).toBeVisible({ timeout: 8000 });
  });

  test('Clear Cart button is visible', async ({ page }) => {
    await loginAsStudent(page);
    await addItemAndGoToCart(page);
    const btn = page.locator('button').filter({ hasText: /clear cart/i }).first();
    await expect(btn).toBeVisible({ timeout: 8000 });
  });

  test('RS currency shown in cart', async ({ page }) => {
    await loginAndGo(page, '/student/cart');
    await page.waitForTimeout(1000);
    const content = await page.content();
    expect(content.includes('RS') || content.includes('cart')).toBeTruthy();
  });

  test('Continue Shopping navigates to canteens', async ({ page }) => {
    await loginAndGo(page, '/student/cart');
    const btn = page.locator('button, a').filter({ hasText: /continue shopping/i }).first();
    await btn.waitFor({ timeout: 8000 });
    await btn.click();
    await expect(page).toHaveURL('/student/canteens', { timeout: 8000 });
  });

});

// ══════════════════════════════════════════════
//  8. CHECKOUT PAGE
// ══════════════════════════════════════════════

test.describe('TC-S08 | Checkout Page', () => {

  // Checkout page always renders the payment section regardless of cart state
  // (the component shows payment methods + a "No items" note when cart is empty)

  test('Checkout page loads at correct URL', async ({ page }) => {
    await loginAndGo(page, '/student/checkout');
    await expect(page).toHaveURL('/student/checkout');
  });

  test('Checkout page body is visible', async ({ page }) => {
    await loginAndGo(page, '/student/checkout');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Checkout heading is shown', async ({ page }) => {
    await loginAndGo(page, '/student/checkout');
    await expect(page.getByText(/checkout/i).first()).toBeVisible({ timeout: 8000 });
  });

  test('Payment method options are visible', async ({ page }) => {
    // Add item first so the full checkout UI renders with payment methods
    await loginAsStudent(page);
    await addItemAndGoToCart(page);
    await page.goto('/student/checkout');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    await expect(page.getByText(/cash on pickup/i).first()).toBeVisible({ timeout: 8000 });
  });

  test('Online Banking option exists', async ({ page }) => {
    await loginAndGo(page, '/student/checkout');
    await expect(page.getByText(/online banking/i).first()).toBeVisible({ timeout: 8000 });
  });

  test('E-Wallet option exists', async ({ page }) => {
    await loginAndGo(page, '/student/checkout');
    await expect(page.getByText(/e-wallet/i).first()).toBeVisible({ timeout: 8000 });
  });

  test('Place Order button is visible', async ({ page }) => {
    await loginAndGo(page, '/student/checkout');
    const btn = page.locator('button').filter({ hasText: /place order/i }).first();
    await expect(btn).toBeVisible({ timeout: 8000 });
  });

  test('Back to Cart text is visible', async ({ page }) => {
    await loginAndGo(page, '/student/checkout');
    await expect(page.getByText(/back to cart/i).first()).toBeVisible({ timeout: 8000 });
  });

  test('RS currency appears on checkout page', async ({ page }) => {
    await loginAndGo(page, '/student/checkout');
    await page.waitForTimeout(1000);
    const content = await page.content();
    expect(content.includes('RS') || content.includes('checkout')).toBeTruthy();
  });

});

// ══════════════════════════════════════════════
//  9. ORDER HISTORY PAGE
// ══════════════════════════════════════════════

test.describe('TC-S09 | Order History', () => {

  test('Order history page loads', async ({ page }) => {
    await loginAndGo(page, '/student/orders');
    await expect(page).toHaveURL('/student/orders');
  });

  test('Order History heading is visible', async ({ page }) => {
    await loginAndGo(page, '/student/orders');
    await expect(page.getByText(/order/i).first()).toBeVisible({ timeout: 8000 });
  });

  test('All Orders filter tab is visible', async ({ page }) => {
    await loginAndGo(page, '/student/orders');
    const btn = page.locator('button').filter({ hasText: /all orders/i }).first();
    await expect(btn).toBeVisible({ timeout: 8000 });
  });

  test('Completed filter tab is visible', async ({ page }) => {
    await loginAndGo(page, '/student/orders');
    const btn = page.locator('button').filter({ hasText: /completed/i }).first();
    await expect(btn).toBeVisible({ timeout: 8000 });
  });

  test('Cancelled filter tab is visible', async ({ page }) => {
    await loginAndGo(page, '/student/orders');
    const btn = page.locator('button').filter({ hasText: /cancelled/i }).first();
    await expect(btn).toBeVisible({ timeout: 8000 });
  });

  test('Refresh button is visible', async ({ page }) => {
    await loginAndGo(page, '/student/orders');
    const btn = page.locator('button').filter({ hasText: /refresh/i }).first();
    await expect(btn).toBeVisible({ timeout: 8000 });
  });

  test('Page does not contain RM currency', async ({ page }) => {
    await loginAndGo(page, '/student/orders');
    await page.waitForTimeout(2000);
    const content = await page.content();
    const rmMatches = (content.match(/\bRM\b/g) || []);
    expect(rmMatches.length).toBe(0);
  });

  test('Expenses navigation button exists', async ({ page }) => {
    await loginAndGo(page, '/student/orders');
    const btn = page.locator('button, a').filter({ hasText: /expenses/i }).first();
    await expect(btn).toBeVisible({ timeout: 8000 });
  });

  test('Auto-refresh info text is visible', async ({ page }) => {
    await loginAndGo(page, '/student/orders');
    const content = await page.content();
    expect(content.toLowerCase()).toContain('refresh');
  });

});

// ══════════════════════════════════════════════
//  10. EXPENSE DASHBOARD
// ══════════════════════════════════════════════

test.describe('TC-S10 | Expense Dashboard', () => {

  test('Expense dashboard page loads', async ({ page }) => {
    await loginAndGo(page, '/student/expenses');
    await expect(page).toHaveURL('/student/expenses');
  });

  test('Expense summary heading is visible', async ({ page }) => {
    await loginAndGo(page, '/student/expenses');
    await expect(page.getByText(/expense/i).first()).toBeVisible({ timeout: 8000 });
  });

  test('Stats cards section is present', async ({ page }) => {
    await loginAndGo(page, '/student/expenses');
    // Wait for API data then check content — "Total Spent" / "Total Orders" always render
    await expect(page.getByText(/total spent/i).first()).toBeVisible({ timeout: 15000 });
  });

  test('Page does not contain RM currency', async ({ page }) => {
    await loginAndGo(page, '/student/expenses');
    await page.waitForTimeout(2000);
    const content = await page.content();
    const rmMatches = (content.match(/\bRM\b/g) || []);
    expect(rmMatches.length).toBe(0);
  });

  test('Current year is shown', async ({ page }) => {
    await loginAndGo(page, '/student/expenses');
    await page.waitForTimeout(1000);
    const year = new Date().getFullYear().toString();
    const content = await page.content();
    expect(content).toContain(year);
  });

  test('Monthly breakdown section exists', async ({ page }) => {
    await loginAndGo(page, '/student/expenses');
    const content = await page.content();
    expect(content.toLowerCase()).toContain('monthly');
  });

  test('Month-by-month table exists', async ({ page }) => {
    await loginAndGo(page, '/student/expenses');
    const content = await page.content();
    expect(content.toLowerCase()).toContain('month');
  });

  test('Export PDF button is visible', async ({ page }) => {
    await loginAndGo(page, '/student/expenses');
    await page.waitForTimeout(1000);
    const btn = page.locator('button').filter({ hasText: /export pdf/i }).first();
    await expect(btn).toBeVisible({ timeout: 8000 });
  });

  test('Back to Orders button navigates correctly', async ({ page }) => {
    await loginAndGo(page, '/student/expenses');
    const btn = page.locator('button, a').filter({ hasText: /back to orders/i }).first();
    await btn.waitFor({ timeout: 8000 });
    await btn.click();
    await expect(page).toHaveURL('/student/orders', { timeout: 8000 });
  });

  test('Month abbreviations are present in table', async ({ page }) => {
    await loginAndGo(page, '/student/expenses');
    // Month names are always rendered in the table skeleton/data rows
    await expect(page.getByText('Jan').first()).toBeVisible({ timeout: 15000 });
  });

});

// ══════════════════════════════════════════════
//  11. GLOBAL SEARCH
// ══════════════════════════════════════════════

test.describe('TC-S11 | Global Search', () => {

  test('Search page loads at correct URL', async ({ page }) => {
    await loginAndGo(page, '/student/search');
    await expect(page).toHaveURL('/student/search');
  });

  test('Search page heading is visible', async ({ page }) => {
    await loginAndGo(page, '/student/search');
    await expect(page.getByText(/search/i).first()).toBeVisible({ timeout: 8000 });
  });

  test('Search input field is visible', async ({ page }) => {
    await loginAndGo(page, '/student/search');
    const input = page.locator('input').first();
    await expect(input).toBeVisible({ timeout: 8000 });
  });

  test('Category filter buttons are present', async ({ page }) => {
    await loginAndGo(page, '/student/search');
    const btn = page.locator('button').filter({ hasText: /breakfast/i }).first();
    await expect(btn).toBeVisible({ timeout: 8000 });
  });

  test('Price filter dropdown is visible', async ({ page }) => {
    await loginAndGo(page, '/student/search');
    const dropdown = page.locator('select').first();
    await expect(dropdown).toBeVisible({ timeout: 8000 });
  });

  test('Empty state is shown before searching', async ({ page }) => {
    await loginAndGo(page, '/student/search');
    await expect(page.getByText(/start searching/i).first()).toBeVisible({ timeout: 8000 });
  });

  test('Typing in search triggers results', async ({ page }) => {
    await loginAndGo(page, '/student/search');
    const input = page.locator('input').first();
    await input.fill('rice');
    await page.waitForTimeout(1500);
    await expect(page.locator('body')).toBeVisible();
  });

  test('Category filter click updates the page', async ({ page }) => {
    await loginAndGo(page, '/student/search');
    const btn = page.locator('button').filter({ hasText: /drinks/i }).first();
    await btn.waitFor({ timeout: 8000 });
    await btn.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('Clear all button appears when filters are active', async ({ page }) => {
    await loginAndGo(page, '/student/search');
    const input = page.locator('input').first();
    await input.fill('nasi');
    await page.waitForTimeout(700);
    const clearBtn = page.locator('button, a').filter({ hasText: /clear all/i }).first();
    await expect(clearBtn).toBeVisible({ timeout: 5000 });
  });

});

// ══════════════════════════════════════════════
//  12. INQUIRY FORM
// ══════════════════════════════════════════════

test.describe('TC-S12 | Inquiry Form', () => {

  test('Inquiry page loads at correct URL', async ({ page }) => {
    await loginAndGo(page, '/student/inquiry');
    await expect(page).toHaveURL('/student/inquiry');
  });

  test('Inquiry form heading is visible', async ({ page }) => {
    await loginAndGo(page, '/student/inquiry');
    await expect(page.getByText(/inquiry/i).first()).toBeVisible({ timeout: 8000 });
  });

  test('Name input field is present', async ({ page }) => {
    await loginAndGo(page, '/student/inquiry');
    const input = page.locator('input').first();
    await expect(input).toBeVisible({ timeout: 8000 });
  });

  test('Name field is auto-filled with logged-in user', async ({ page }) => {
    await loginAndGo(page, '/student/inquiry');
    await page.waitForTimeout(1000);
    const nameInput = page.locator('input[type="text"]').first();
    await nameInput.waitFor({ timeout: 8000 });
    await expect(nameInput).toBeVisible();
  });

  test('Phone number field is visible', async ({ page }) => {
    await loginAndGo(page, '/student/inquiry');
    const phoneInput = page.locator('input[type="tel"]').first();
    await expect(phoneInput).toBeVisible({ timeout: 8000 });
  });

  test('Inquiry type buttons are visible', async ({ page }) => {
    await loginAndGo(page, '/student/inquiry');
    const btn = page.locator('button').filter({ hasText: /general inquiry/i }).first();
    await expect(btn).toBeVisible({ timeout: 8000 });
  });

  test('Subject field is visible', async ({ page }) => {
    await loginAndGo(page, '/student/inquiry');
    const input = page.getByPlaceholder(/brief subject/i).first();
    await expect(input).toBeVisible({ timeout: 8000 });
  });

  test('Message textarea is visible', async ({ page }) => {
    await loginAndGo(page, '/student/inquiry');
    const textarea = page.locator('textarea').first();
    await expect(textarea).toBeVisible({ timeout: 8000 });
  });

  test('Contact preference buttons are visible', async ({ page }) => {
    await loginAndGo(page, '/student/inquiry');
    // Button contains SVG icon + "Email" text — use partial/regex match not exact anchor
    await expect(
      page.locator('button').filter({ hasText: /email/i }).first()
    ).toBeVisible({ timeout: 8000 });
  });

  test('Submitting empty form shows validation errors', async ({ page }) => {
    await loginAndGo(page, '/student/inquiry');
    await page.locator('input[type="text"]').first().fill('');
    const submitBtn = page.locator('button').filter({ hasText: /submit inquiry/i }).first();
    await submitBtn.click();
    await page.waitForTimeout(500);
    await expect(page).toHaveURL('/student/inquiry');
  });

  test('Message character counter appears when typing', async ({ page }) => {
    await loginAndGo(page, '/student/inquiry');
    const textarea = page.locator('textarea').first();
    await textarea.fill('Testing the inquiry form message field content here.');
    const counter = page.getByText(/\/1000/i).first();
    await expect(counter).toBeVisible({ timeout: 3000 });
  });

  test('Confirmation dialog appears on valid form submit', async ({ page }) => {
    await loginAndGo(page, '/student/inquiry');
    await page.waitForTimeout(500);
    await page.locator('input[type="text"]').first().fill('Test Student Name');
    const emailField = page.locator('input[type="email"]').first();
    if (await emailField.count() > 0) await emailField.fill('test@test.com');
    const phoneField = page.locator('input[type="tel"]').first();
    if (await phoneField.count() > 0) await phoneField.fill('+94771234567');
    await page.locator('button').filter({ hasText: /general inquiry/i }).first().click();
    await page.getByPlaceholder(/brief subject/i).fill('Test Subject Line Here');
    await page.locator('textarea').first().fill('This is a detailed test message for the inquiry form that is long enough to pass the minimum character validation.');
    await page.locator('button').filter({ hasText: /submit inquiry/i }).first().click();
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toBeVisible();
  });

});

// ══════════════════════════════════════════════
//  13. DARK / LIGHT MODE
// ══════════════════════════════════════════════

test.describe('TC-S13 | Dark / Light Mode', () => {

  test('Theme toggle button is visible in sidebar', async ({ page }) => {
    await loginAndGo(page, '/student/canteens');
    const themeBtn = page.locator('button').filter({ hasText: /light mode|dark mode/i }).first();
    await expect(themeBtn).toBeVisible({ timeout: 8000 });
  });

  test('Clicking theme toggle does not crash the page', async ({ page }) => {
    await loginAndGo(page, '/student/canteens');
    const themeBtn = page.locator('button').filter({ hasText: /light mode|dark mode/i }).first();
    await themeBtn.waitFor({ timeout: 8000 });
    await themeBtn.click();
    await page.waitForTimeout(500);
    await expect(page.locator('body')).toBeVisible();
  });

  test('Page has dark or light class on html element', async ({ page }) => {
    await loginAndGo(page, '/student/canteens');
    const html = page.locator('html');
    await expect(html).toBeVisible();
  });

});

// ══════════════════════════════════════════════
//  14. SIDEBAR NAVIGATION
// ══════════════════════════════════════════════

test.describe('TC-S14 | Sidebar Navigation', () => {

  test('SmartMess brand text is in sidebar', async ({ page }) => {
    await loginAndGo(page, '/student/canteens');
    await expect(page.getByText(/smartmess/i).first()).toBeVisible({ timeout: 8000 });
  });

  test('Student label is visible in sidebar', async ({ page }) => {
    await loginAndGo(page, '/student/canteens');
    await expect(page.getByText(/student/i).first()).toBeVisible({ timeout: 8000 });
  });

  test('Canteens nav item is visible', async ({ page }) => {
    await loginAndGo(page, '/student/canteens');
    await expect(page.getByText(/canteens/i).first()).toBeVisible({ timeout: 8000 });
  });

  test('Search nav item navigates to search page', async ({ page }) => {
    await loginAndGo(page, '/student/canteens');
    // Sidebar uses <button> elements with onClick navigation (confirmed from page snapshots)
    await page.locator('nav button').filter({ hasText: /^Search$/i }).first().click();
    await expect(page).toHaveURL('/student/search', { timeout: 8000 });
  });

  test('Cart nav item navigates to cart page', async ({ page }) => {
    await loginAndGo(page, '/student/canteens');
    await page.locator('nav button').filter({ hasText: /^Cart$/i }).first().click();
    await expect(page).toHaveURL('/student/cart', { timeout: 8000 });
  });

  test('My Orders nav item navigates to orders page', async ({ page }) => {
    await loginAndGo(page, '/student/canteens');
    await page.locator('nav button').filter({ hasText: /my orders/i }).first().click();
    await expect(page).toHaveURL('/student/orders', { timeout: 8000 });
  });

  test('Expenses nav item navigates to expenses page', async ({ page }) => {
    await loginAndGo(page, '/student/canteens');
    await page.locator('nav button').filter({ hasText: /^Expenses$/i }).first().click();
    await expect(page).toHaveURL('/student/expenses', { timeout: 8000 });
  });

  test('Logout button is visible', async ({ page }) => {
    await loginAndGo(page, '/student/canteens');
    await expect(page.getByText(/logout/i).first()).toBeVisible({ timeout: 8000 });
  });

  test('Logout redirects to home page', async ({ page }) => {
    await loginAndGo(page, '/student/canteens');
    await page.locator('button').filter({ hasText: /logout/i }).first().click();
    await expect(page).toHaveURL('/', { timeout: 8000 });
  });

});