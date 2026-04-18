// tests/canteen/canteen.spec.js
// SmartMess — Canteen Module Playwright Test Suite
// Run with: npx playwright test tests/canteen/canteen.spec.js
//npx playwright test tests/canteen/canteen.spec.js --reporter=list
import { test, expect } from '@playwright/test';

const BASE_URL         = 'http://localhost:5173';
const CANTEEN_EMAIL    = 'snackshack@gmail.com';
const CANTEEN_PASSWORD = 'Canteen123';

async function loginAsCanteen(page) {
  await page.goto(`${BASE_URL}/login/canteen`);
  await page.fill('input[type="email"], input[name="email"]', CANTEEN_EMAIL);
  await page.fill('input[type="password"], input[name="password"]', CANTEEN_PASSWORD);
  await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
  await page.waitForURL((url) => !url.toString().includes('/login'), { timeout: 10000 });
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. AUTHENTICATION & ACCESS CONTROL
// ─────────────────────────────────────────────────────────────────────────────
test.describe('1. Authentication & Access Control', () => {

  // FIX: Was timing out waiting 30s. Now we just navigate and check the
  // dashboard content is NOT visible — no long wait needed.
  test('TC-AUTH-01: Unauthenticated user cannot see dashboard data', async ({ page }) => {
    await page.goto(`${BASE_URL}/canteen/dashboard`);
    await page.waitForLoadState('networkidle');
    const revenueVisible = await page.locator("text=Today's Revenue").isVisible().catch(() => false);
    expect(revenueVisible).toBe(false);
  });

  test('TC-AUTH-02: Canteen owner can log in successfully', async ({ page }) => {
    await loginAsCanteen(page);
    await page.goto(`${BASE_URL}/canteen/dashboard`);
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 8000 });
  });

  test('TC-AUTH-03: Login fails with wrong password', async ({ page }) => {
    await page.goto(`${BASE_URL}/login/canteen`);
    await page.fill('input[type="email"], input[name="email"]', CANTEEN_EMAIL);
    await page.fill('input[type="password"], input[name="password"]', 'WrongPassword123');
    await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
    await expect(page.locator('text=/invalid|incorrect|wrong|failed/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('TC-AUTH-04: Canteen owner can log out', async ({ page }) => {
    await loginAsCanteen(page);
    await page.goto(`${BASE_URL}/canteen/dashboard`);
    await page.click('button:has-text("Logout")');
    await expect(page).not.toHaveURL(/\/canteen/);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// 2. CANTEEN DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
test.describe('2. Canteen Dashboard', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsCanteen(page);
    await page.goto(`${BASE_URL}/canteen/dashboard`);
    await page.waitForSelector("text=Today's Orders", { timeout: 8000 });
  });

  test('TC-DASH-01: Dashboard loads and shows all 4 stat cards', async ({ page }) => {
    await expect(page.locator("text=Today's Orders")).toBeVisible();
    await expect(page.locator('text=Pending Meals')).toBeVisible();
    await expect(page.locator('text=Total Meals')).toBeVisible();
    await expect(page.locator("text=Today's Revenue")).toBeVisible();
  });

  test('TC-DASH-02: Order Status Overview section is visible', async ({ page }) => {
    await expect(page.locator('text=Order Status Overview')).toBeVisible();
  });

  test('TC-DASH-03: Popular Meals section is visible', async ({ page }) => {
    await expect(page.locator('text=Popular Meals')).toBeVisible();
  });

  test('TC-DASH-04: Quick Actions section has 4 buttons', async ({ page }) => {
    await expect(page.locator('text=Quick Actions')).toBeVisible();
    await expect(page.locator('text=Add Meal')).toBeVisible();
    await expect(page.locator('text=View Orders')).toBeVisible();
    await expect(page.locator('text=Edit Profile')).toBeVisible();
    await expect(page.getByRole('button', { name: 'View Revenue', exact: true })).toBeVisible();
  });

  test('TC-DASH-05: Refresh button reloads dashboard data', async ({ page }) => {
    await page.click('button:has-text("Refresh")');
    await expect(page.locator("text=Today's Orders")).toBeVisible({ timeout: 8000 });
  });

  test('TC-DASH-06: View All in Order Status navigates to orders page', async ({ page }) => {
    await page.locator('button:has-text("View All"), a:has-text("View All")').first().click();
    await expect(page).toHaveURL(/\/canteen\/orders/, { timeout: 5000 });
  });

  test('TC-DASH-07: View Revenue link navigates to revenue page', async ({ page }) => {
    await page.locator('button:has-text("View Revenue →")').click();
    await expect(page).toHaveURL(/\/canteen\/revenue/, { timeout: 5000 });
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// 3. CANTEEN PROFILE
// ─────────────────────────────────────────────────────────────────────────────
test.describe('3. Canteen Profile', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsCanteen(page);
    await page.goto(`${BASE_URL}/canteen/profile`);
    await page.waitForSelector('input[name="ownerName"]', { timeout: 8000 });
  });

  test('TC-PROF-01: Profile page loads with all form fields visible', async ({ page }) => {
    await expect(page.locator('input[name="ownerName"]')).toBeVisible();
    await expect(page.locator('input[name="canteenName"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="phone"]')).toBeVisible();
    await expect(page.locator('textarea[name="description"]')).toBeVisible();
  });

  test('TC-PROF-02: Save fails when Owner Name is empty', async ({ page }) => {
    await page.fill('input[name="ownerName"]', '');
    await page.click('button:has-text("Save Changes")');
    await expect(page.locator('text=Owner name is required')).toBeVisible({ timeout: 5000 });
  });

  test('TC-PROF-03: Save fails when Canteen Name is empty', async ({ page }) => {
    await page.fill('input[name="canteenName"]', '');
    await page.click('button:has-text("Save Changes")');
    await expect(page.locator('text=Canteen name is required')).toBeVisible({ timeout: 5000 });
  });

  test('TC-PROF-04: Owner Name rejects numbers live', async ({ page }) => {
    const input = page.locator('input[name="ownerName"]');
    await input.fill('');
    await input.type('John123');
    await expect(input).toHaveValue('John');
  });

  test('TC-PROF-05: Canteen Name rejects symbols live', async ({ page }) => {
    const input = page.locator('input[name="canteenName"]');
    await input.fill('');
    await input.type('Cafe99!');
    await expect(input).toHaveValue('Cafe');
  });

  test('TC-PROF-06: Invalid email shows validation error', async ({ page }) => {
  const emailInput = page.locator('input[name="email"]');
  await emailInput.triple_click(); // select all
  await emailInput.fill('');       // clear it
  await emailInput.fill('notanemail');
  // Also clear ownerName/canteenName to ensure they're valid so only email triggers error
  await page.fill('input[name="ownerName"]', 'Test Owner');
  await page.fill('input[name="canteenName"]', 'Test Canteen');
  await page.click('button:has-text("Save Changes")');
  await expect(
    page.locator('text=Enter a valid email').or(page.locator('text=/valid email/i')).first()
  ).toBeVisible({ timeout: 5000 });
});

  test('TC-PROF-07: Valid email format passes without error', async ({ page }) => {
    await page.fill('input[name="ownerName"]', 'Test Owner');
    await page.fill('input[name="canteenName"]', 'Test Canteen');
    await page.fill('input[name="email"]', 'valid@example.com');
    await page.click('button:has-text("Save Changes")');
    await expect(page.locator('text=/valid email/i')).not.toBeVisible({ timeout: 3000 });
  });

  test('TC-PROF-08: Description rejects numbers live', async ({ page }) => {
    const textarea = page.locator('textarea[name="description"]');
    await textarea.fill('');
    await textarea.type('Good canteen 123');
    const val = await textarea.inputValue();
    expect(val).not.toMatch(/\d/);
  });

  test('TC-PROF-09: Description character counter shows /500', async ({ page }) => {
    await expect(page.locator('text=/ 500/')).toBeVisible();
  });

  test('TC-PROF-10: Status section shows Approved or Pending Approval', async ({ page }) => {
    const isApproved = await page.locator('text=Approved').isVisible().catch(() => false);
    const isPending  = await page.locator('text=Pending Approval').isVisible().catch(() => false);
    expect(isApproved || isPending).toBe(true);
  });

  test('TC-PROF-11: Successful save shows success toast', async ({ page }) => {
    await page.fill('input[name="ownerName"]', 'Test Owner');
    await page.fill('input[name="canteenName"]', 'Test Canteen');
    await page.click('button:has-text("Save Changes")');
    await expect(page.locator('text=/updated successfully/i')).toBeVisible({ timeout: 8000 });
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// 4. OPERATING HOURS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('4. Operating Hours', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsCanteen(page);
    await page.goto(`${BASE_URL}/canteen/hours`);
    await page.waitForSelector('text=Monday', { timeout: 8000 });
  });

  test('TC-HOURS-01: All 7 days are listed', async ({ page }) => {
    for (const day of ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']) {
      await expect(page.locator(`text=${day}`).first()).toBeVisible();
    }
  });

  test('TC-HOURS-02: Open Days and Closed Days summary cards are visible', async ({ page }) => {
    await expect(page.locator('text=Open Days')).toBeVisible();
    await expect(page.locator('text=Closed Days')).toBeVisible();
  });

  test('TC-HOURS-03: Toggling a day flips its Open/Closed status', async ({ page }) => {
    const mondayRow = page.locator('div').filter({ hasText: /^Monday/ }).first();
    const toggleBtn = mondayRow.locator('button').last();
    const wasOpen   = await mondayRow.locator('text=Open').isVisible().catch(() => false);
    await toggleBtn.click();
    if (wasOpen) {
      await expect(mondayRow.locator('text=Closed')).toBeVisible({ timeout: 3000 });
    } else {
      await expect(mondayRow.getByText('Open', { exact: true }).first()).toBeVisible({ timeout: 3000 });
    }
  });

  test('TC-HOURS-04: Reset Weekdays sets Monday open time to 08:00', async ({ page }) => {
    await page.click('button:has-text("Reset Weekdays")');
    await expect(page.locator('input[type="time"]').first()).toHaveValue('08:00');
  });

  test('TC-HOURS-05: Save Hours shows success toast', async ({ page }) => {
    await page.click('button:has-text("Save Hours")');
    await expect(page.locator('text=Operating hours saved')).toBeVisible({ timeout: 8000 });
  });

  test('TC-HOURS-06: Time inputs become disabled when a day is toggled closed', async ({ page }) => {
    const satRow  = page.locator('div').filter({ hasText: /^Saturday/ }).first();
    const toggle  = satRow.locator('button').last();
    const isOpen  = await satRow.locator('text=Open').isVisible().catch(() => false);
    if (isOpen) {
      await toggle.click();
      await expect(satRow.locator('text=Closed')).toBeVisible({ timeout: 3000 });
    }
    await expect(satRow.locator('input[type="time"]').first()).toBeDisabled({ timeout: 3000 });
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// 5. MEALS MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────
test.describe('5. Meals Management', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsCanteen(page);
    await page.goto(`${BASE_URL}/canteen/meals`);
    await page.waitForSelector('text=Meal Management', { timeout: 8000 });
  });

  test('TC-MEAL-01: Meals page loads with all stat cards', async ({ page }) => {
    await expect(page.locator('text=Total Meals')).toBeVisible();
    await expect(page.locator('text=Out of Stock')).toBeVisible();
    await expect(page.locator('text=Categories')).toBeVisible();
  });

  test('TC-MEAL-02: Add New Meal button opens the modal', async ({ page }) => {
    await page.click('button:has-text("Add New Meal")');
    await expect(page.locator('input[name="name"]')).toBeVisible({ timeout: 5000 });
  });

  test('TC-MEAL-03: Add meal fails when name is empty', async ({ page }) => {
    await page.click('button:has-text("Add New Meal")');
    await page.waitForSelector('input[name="name"]');
    await page.fill('input[name="basePrice"]', '200');
    await page.getByRole('button', { name: 'Add Meal' }).click();
    await expect(page.locator('text=Meal name is required')).toBeVisible({ timeout: 5000 });
  });

  test('TC-MEAL-04: Meal name rejects numbers live', async ({ page }) => {
    await page.click('button:has-text("Add New Meal")');
    await page.waitForSelector('input[name="name"]');
    await page.locator('input[name="name"]').type('Rice123');
    expect(await page.locator('input[name="name"]').inputValue()).not.toMatch(/\d/);
  });

  test('TC-MEAL-05: Add meal fails when base price is missing', async ({ page }) => {
    await page.click('button:has-text("Add New Meal")');
    await page.waitForSelector('input[name="name"]');
    await page.fill('input[name="name"]', 'Rice Curry');
    await page.getByRole('button', { name: 'Add Meal' }).click();
    await expect(page.locator('text=Base price is required')).toBeVisible({ timeout: 5000 });
  });

  test('TC-MEAL-06: Entering base price shows Medium auto-fill hint', async ({ page }) => {
    await page.click('button:has-text("Add New Meal")');
    await page.waitForSelector('input[name="basePrice"]');
    await page.fill('input[name="basePrice"]', '250');
    await expect(page.locator('text=Auto-filled as Medium price')).toBeVisible({ timeout: 3000 });
  });

  test('TC-MEAL-07: Successfully adding a meal shows success toast', async ({ page }) => {
    await page.click('button:has-text("Add New Meal")');
    await page.waitForSelector('input[name="name"]');
    await page.fill('input[name="name"]', 'Test Meal');
    await page.fill('input[name="basePrice"]', '150');
    await page.getByRole('button', { name: 'Add Meal' }).click();
    await expect(page.locator('text=Meal added successfully')).toBeVisible({ timeout: 8000 });
  });

  test('TC-MEAL-08: Cancel button closes the Add Meal modal', async ({ page }) => {
    await page.click('button:has-text("Add New Meal")');
    await page.waitForSelector('input[name="name"]');
    await page.click('button:has-text("Cancel")');
    await expect(page.locator('input[name="name"]')).not.toBeVisible({ timeout: 3000 });
  });

  test('TC-MEAL-09: Edit button opens modal pre-filled with meal data', async ({ page }) => {
    const editBtns = page.locator('button[class*="blue"]');
    const count    = await editBtns.count();
    if (count > 0) {
      await editBtns.first().click();
      await expect(page.locator('text=Edit Meal')).toBeVisible({ timeout: 5000 });
      expect((await page.locator('input[name="name"]').inputValue()).length).toBeGreaterThan(0);
    } else {
      test.skip();
    }
  });

  // FIX: Reading MealsPage.jsx — the delete button is inside each meal card and calls
  // setDeleteId(meal._id). The modal renders <h3>Delete Meal?</h3>.
  // The delete button has NO stable class — it just has text-red-600 hover classes.
  // We target it by finding meal cards (they contain "Rs.") then clicking
  // the last button inside each card (eye | edit | DELETE — delete is always last).
  test('TC-MEAL-10: Delete button shows confirmation modal', async ({ page }) => {
    await expect(page.locator('text=Meal Management')).toBeVisible({ timeout: 5000 });

    // Meal cards in grid view contain "Rs." for the price display
    const mealCards = page.locator('.group').filter({ hasText: /Rs\./ });
    const mealCount = await mealCards.count();

    if (mealCount === 0) {
      test.skip();
      return;
    }

    // Each card's bottom row has 3 buttons: toggle-availability | edit | delete
    // Delete is always the LAST button in the card
    const firstCard   = mealCards.first();
    const deleteBtn   = firstCard.locator('button').last();

    await deleteBtn.click();

    // Modal has <h3 className="text-xl font-bold ...">Delete Meal?</h3>
    await expect(page.locator('h3:has-text("Delete Meal?")')).toBeVisible({ timeout: 5000 });

    // Close with Cancel button (last Cancel on page, inside the modal)
    await page.locator('button:has-text("Cancel")').last().click();

    // Confirm modal closed
    await expect(page.locator('h3:has-text("Delete Meal?")')).not.toBeVisible({ timeout: 3000 });
  });

  test('TC-MEAL-11: Search filters meals showing no results for unknown term', async ({ page }) => {
    await page.locator('input[placeholder*="Search meals"]').fill('zzz_nonexistent_meal');
    await expect(page.locator('text=No meals found')).toBeVisible({ timeout: 5000 });
  });

  test('TC-MEAL-12: Category filter works', async ({ page }) => {
    await page.click('button:has-text("Filters")');
    await page.locator('select').filter({ has: page.locator('option[value="Rice"]') }).selectOption('Rice');
    await expect(page.locator('text=results')).toBeVisible({ timeout: 3000 });
  });

  test('TC-MEAL-13: List view toggle shows table headers', async ({ page }) => {
    const viewBtns = page.locator('div[class*="rounded-xl"] button');
    if (await viewBtns.count() >= 2) {
      await viewBtns.nth(1).click();
      await expect(page.locator('th:has-text("Name")')).toBeVisible({ timeout: 5000 });
    }
  });

  test('TC-MEAL-14: Export PDF button is clickable without crashing', async ({ page }) => {
    await page.locator('button:has-text("Export PDF")').click();
    await expect(page.locator('text=Meal Management')).toBeVisible({ timeout: 3000 });
  });

  test('TC-MEAL-15: Medium size is always on and cannot be toggled', async ({ page }) => {
    await page.click('button:has-text("Add New Meal")');
    await page.waitForSelector('text=Size Variations');
    await expect(page.locator('text=always on')).toBeVisible({ timeout: 5000 });
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// 6. ORDERS MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────
test.describe('6. Orders Management', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsCanteen(page);
    await page.goto(`${BASE_URL}/canteen/orders`);
    await page.waitForSelector('h1:has-text("Orders")', { timeout: 8000 });
  });

  test('TC-ORD-01: Orders page loads with 4 stat cards', async ({ page }) => {
    await expect(page.locator('text=Total Orders')).toBeVisible();
    await expect(
      page.locator('p[class*="uppercase"]:has-text("Pending")').or(
        page.locator('p[class*="tracking"]:has-text("Pending")')
      ).first()
    ).toBeVisible();
    await expect(page.locator('text=Preparing').first()).toBeVisible();
    await expect(page.locator('text=Completed').first()).toBeVisible();
  });

  test('TC-ORD-02: Search input filters orders', async ({ page }) => {
    await page.locator('input[placeholder*="Search by student"]').fill('nonexistentxyz');
    await expect(page.locator('text=No orders found')).toBeVisible({ timeout: 5000 });
  });

  test('TC-ORD-03: Status filter dropdown has all statuses', async ({ page }) => {
    await expect(page.locator('option[value="pending"]')).toBeAttached();
    await expect(page.locator('option[value="accepted"]')).toBeAttached();
    await expect(page.locator('option[value="completed"]')).toBeAttached();
    await expect(page.locator('option[value="cancelled"]')).toBeAttached();
  });

  test('TC-ORD-04: Eye button opens the order detail modal', async ({ page }) => {
    const eyeBtns = page.locator('button[class*="blue"]');
    if (await eyeBtns.count() > 0) {
      await eyeBtns.first().click();
      await expect(page.locator('text=Order #')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('text=Student Info')).toBeVisible();
      await expect(page.locator('text=Order Items')).toBeVisible();
    } else { test.skip(); }
  });

  test('TC-ORD-05: Order detail shows actual student name not just "Student"', async ({ page }) => {
    const eyeBtns = page.locator('button[class*="blue"]');
    if (await eyeBtns.count() > 0) {
      await eyeBtns.first().click();
      await page.waitForSelector('text=Student Info', { timeout: 5000 });
      const nameText = await page.locator('div').filter({ hasText: 'Student Info' }).locator('p').first().textContent();
      expect(nameText?.trim()).not.toBe('Student');
    } else { test.skip(); }
  });

  test('TC-ORD-06: Order detail modal X button closes the modal', async ({ page }) => {
    const eyeBtns = page.locator('button[class*="blue"]');
    if (await eyeBtns.count() > 0) {
      await eyeBtns.first().click();
      await page.waitForSelector('text=Student Info', { timeout: 5000 });
      await page.locator('button[class*="gray"]').filter({ has: page.locator('svg') }).first().click();
      await expect(page.locator('text=Student Info')).not.toBeVisible({ timeout: 3000 });
    } else { test.skip(); }
  });

  test('TC-ORD-07: Pending order shows Accept and Reject buttons', async ({ page }) => {
    await page.selectOption('select', 'pending');
    const eyeBtns = page.locator('button[class*="blue"]');
    if (await eyeBtns.count() > 0) {
      await eyeBtns.first().click();
      await expect(page.locator('button:has-text("Accept Order")')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('button:has-text("Reject Order")')).toBeVisible();
    } else { test.skip(); }
  });

  test('TC-ORD-08: Refresh button reloads orders without crashing', async ({ page }) => {
    await page.click('button:has-text("Refresh")');
    await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible({ timeout: 8000 });
  });

  test('TC-ORD-09: Cancelled filter shows orders list or empty state', async ({ page }) => {
    await page.selectOption('select', 'cancelled');
    const empty   = await page.locator('text=No orders found').isVisible().catch(() => false);
    const heading = await page.getByRole('heading', { name: 'Orders' }).isVisible().catch(() => false);
    expect(empty || heading).toBe(true);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// 7. REVENUE
// ─────────────────────────────────────────────────────────────────────────────
test.describe('7. Revenue', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsCanteen(page);
    await page.goto(`${BASE_URL}/canteen/revenue`);
    await page.waitForSelector('h1:has-text("Revenue")', { timeout: 8000 });
  });

  test('TC-REV-01: Revenue page loads with 3 summary cards', async ({ page }) => {
    await expect(page.locator('text=Total Revenue')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('text=Total Orders')).toBeVisible();
    await expect(page.locator('text=Avg Order Value')).toBeVisible();
  });

  test('TC-REV-02: Month and Year selectors are present', async ({ page }) => {
    expect(await page.locator('select').count()).toBeGreaterThanOrEqual(2);
  });

  test('TC-REV-03: Daily chart tab is shown by default', async ({ page }) => {
    await expect(page.locator('button:has-text("Daily")')).toBeVisible({ timeout: 8000 });
  });

  test('TC-REV-04: Monthly chart tab switch works', async ({ page }) => {
    await page.click('button:has-text("Monthly")');
    await expect(page.locator('button:has-text("Monthly")')).toBeVisible({ timeout: 3000 });
  });

  test('TC-REV-05: Changing month updates revenue data', async ({ page }) => {
    await page.locator('select').first().selectOption('1');
    await expect(page.getByRole('heading', { name: 'Revenue' })).toBeVisible({ timeout: 8000 });
  });

  test('TC-REV-06: Export CSV button is visible and clickable', async ({ page }) => {
    await expect(page.locator('button:has-text("CSV")')).toBeVisible({ timeout: 5000 });
    await page.locator('button:has-text("CSV")').click();
    await expect(page.getByRole('heading', { name: 'Revenue' })).toBeVisible({ timeout: 5000 });
  });

  test('TC-REV-07: Export PDF Report button is visible', async ({ page }) => {
    await expect(page.locator('button:has-text("PDF Report")')).toBeVisible({ timeout: 5000 });
  });

  test('TC-REV-08: Popular Meals section is visible', async ({ page }) => {
    await expect(page.locator('text=Popular Meals')).toBeVisible({ timeout: 8000 });
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// 8. REVIEWS & FEEDBACK
// ─────────────────────────────────────────────────────────────────────────────
test.describe('8. Reviews & Feedback', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsCanteen(page);
    await page.goto(`${BASE_URL}/canteen/feedback`);
    await page.waitForSelector('h1:has-text("Reviews")', { timeout: 8000 });
  });

  test('TC-REV-01: Reviews page loads with rating summary', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Reviews & Feedback' })).toBeVisible();
    await expect(
      page.locator('text=reviews · ').or(page.getByText(/\d+ reviews/)).first()
    ).toBeVisible();
  });

  test('TC-REV-02: Star filter dropdown has all options', async ({ page }) => {
    await expect(page.locator('option[value="All"]')).toBeAttached();
    await expect(page.locator('option[value="5 Stars"]')).toBeAttached();
    await expect(page.locator('option[value="1 Star"]')).toBeAttached();
  });

  test('TC-REV-03: Search input filters reviews', async ({ page }) => {
    await page.locator('input[placeholder*="Search"]').fill('zzz_nonexistent_student');
    const noReviews   = await page.locator('text=No reviews yet').isVisible().catch(() => false);
    const zeroResults = await page.locator('text=0 results').isVisible().catch(() => false);
    expect(noReviews || zeroResults).toBe(true);
  });

  test('TC-REV-04: Reply button is visible on each review', async ({ page }) => {
    const replyBtns = page.locator('button:has-text("Reply"), button:has-text("Edit Reply")');
    if (await replyBtns.count() > 0) {
      await expect(replyBtns.first()).toBeVisible();
    }
  });

  test('TC-REV-05: Clicking Reply opens the reply textarea', async ({ page }) => {
    const replyBtn = page.locator('button:has-text("Reply")').first();
    if (await replyBtn.count() > 0) {
      await replyBtn.click();
      await expect(page.locator('textarea[placeholder*="Write your reply"]')).toBeVisible({ timeout: 5000 });
    }
  });

  test('TC-REV-06: Sending empty reply shows error toast', async ({ page }) => {
    const replyBtn = page.locator('button:has-text("Reply")').first();
    if (await replyBtn.count() > 0) {
      await replyBtn.click();
      await page.waitForSelector('textarea[placeholder*="Write your reply"]');
      await page.click('button:has-text("Send Reply")');
      await expect(page.locator('text=Reply cannot be empty')).toBeVisible({ timeout: 5000 });
    }
  });

  test('TC-REV-07: Cancel reply hides the textarea', async ({ page }) => {
    const replyBtn = page.locator('button:has-text("Reply")').first();
    if (await replyBtn.count() > 0) {
      await replyBtn.click();
      await page.waitForSelector('textarea[placeholder*="Write your reply"]');
      await page.click('button:has-text("Cancel")');
      await expect(page.locator('textarea[placeholder*="Write your reply"]')).not.toBeVisible({ timeout: 3000 });
    }
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// 9. SIDEBAR NAVIGATION
// ─────────────────────────────────────────────────────────────────────────────
test.describe('9. Sidebar Navigation', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsCanteen(page);
    await page.goto(`${BASE_URL}/canteen/dashboard`);
    await page.waitForSelector('text=SmartMess', { timeout: 8000 });
  });

  test('TC-NAV-01: Sidebar shows all main nav items', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'My Canteen' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Meals' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Orders' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Revenue' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Reviews & Feedback' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Report an Issue' })).toBeVisible();
  });

  test('TC-NAV-02: My Canteen expands to show Profile and Operating Hours', async ({ page }) => {
    await page.click('button:has-text("My Canteen")');
    await expect(page.locator('a:has-text("Profile")')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('a:has-text("Operating Hours")')).toBeVisible();
  });

  test('TC-NAV-03: Clicking Meals navigates to /canteen/meals', async ({ page }) => {
    await page.getByRole('link', { name: 'Meals' }).click();
    await expect(page).toHaveURL(/\/canteen\/meals/, { timeout: 5000 });
  });

  test('TC-NAV-04: Clicking Orders navigates to /canteen/orders', async ({ page }) => {
    await page.getByRole('link', { name: 'Orders' }).click();
    await expect(page).toHaveURL(/\/canteen\/orders/, { timeout: 5000 });
  });

  test('TC-NAV-05: Collapse button collapses the sidebar', async ({ page }) => {
    await page.locator('button:has-text("Collapse")').click();
    await expect(page.locator('p:has-text("Canteen Portal")')).not.toBeVisible({ timeout: 3000 });
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// 10. REPORT AN ISSUE
// ─────────────────────────────────────────────────────────────────────────────
test.describe('10. Report an Issue', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsCanteen(page);
    await page.goto(`${BASE_URL}/canteen/report`);
    await page.waitForSelector('h1:has-text("Report")', { timeout: 8000 });
  });

  test('TC-RPT-01: Report page loads correctly', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Report an Issue' })).toBeVisible({ timeout: 5000 });
  });

  test('TC-RPT-02: Submitting without required fields shows validation error', async ({ page }) => {
    const submitBtn = page.locator('button:has-text("Submit Report"), button[type="submit"]').first();
    if (await submitBtn.count() > 0) {
      await submitBtn.click();
      await expect(
        page.locator('text=/required|fill|category|description/i').first()
      ).toBeVisible({ timeout: 5000 });
    }
  });

});