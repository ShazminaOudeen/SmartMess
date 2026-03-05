// @ts-check
import { test, expect } from '@playwright/test';

/*  ─────────────────────────────────────────────
 *  SmartMess — Auth Module Playwright Tests
 *  Author : Dhanujaya
 *  Covers : Registration, Login, Profile, Password Change, Logout
 *  ───────────────────────────────────────────── */

// Unique email per run to avoid duplicate conflicts
const timestamp = Date.now();
const STUDENT_EMAIL = `student_test_${timestamp}@test.com`;
const STUDENT_PASSWORD = 'Test@123456';
const STUDENT_NAME = 'Test Student';
const CANTEEN_EMAIL = `canteen_test_${timestamp}@test.com`;
const CANTEEN_PASSWORD = 'Canteen@123';
const CANTEEN_NAME = 'Test Canteen Owner';
const CANTEEN_BIZ_NAME = 'Campus Bites Test';

// ══════════════════════════════════════════════
//  1. HOMEPAGE & NAVIGATION TESTS
// ══════════════════════════════════════════════

test.describe('Homepage & Navigation', () => {
    test('TC-01: Homepage loads successfully', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/SmartMess|Vite|client/i);
        await expect(page.locator('body')).toBeVisible();
    });

    test('TC-02: Login Portal is accessible from homepage', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('link', { name: /log in/i }).first().click();
        await expect(page).toHaveURL('/login');
        await expect(page.getByText(/who are you/i)).toBeVisible();
    });

    test('TC-03: Login Portal shows all three role cards', async ({ page }) => {
        await page.goto('/login');
        await expect(page.getByRole('heading', { name: 'User' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Canteen' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Admin' })).toBeVisible();
    });

    test('TC-04: User login card navigates to /login/user', async ({ page }) => {
        await page.goto('/login');
        await page.getByRole('link', { name: /login as user/i }).click();
        await expect(page).toHaveURL('/login/user');
    });

    test('TC-05: Canteen login card navigates to /login/canteen', async ({ page }) => {
        await page.goto('/login');
        await page.getByRole('link', { name: /login as canteen/i }).click();
        await expect(page).toHaveURL('/login/canteen');
    });

    test('TC-06: Admin login card navigates to /login/admin', async ({ page }) => {
        await page.goto('/login');
        await page.getByRole('link', { name: /login as admin/i }).click();
        await expect(page).toHaveURL('/login/admin');
    });
});

// ══════════════════════════════════════════════
//  2. LOGIN PAGE UI TESTS
// ══════════════════════════════════════════════

test.describe('Login Page UI', () => {
    test('TC-07: User login page renders correctly', async ({ page }) => {
        await page.goto('/login/user');
        await expect(page.getByText(/user login/i)).toBeVisible();
        await expect(page.getByPlaceholder(/enter your email/i)).toBeVisible();
        await expect(page.getByPlaceholder(/enter your password/i)).toBeVisible();
        await expect(page.getByRole('button', { name: /sign in as user/i })).toBeVisible();
    });

    test('TC-08: Canteen login page renders correctly', async ({ page }) => {
        await page.goto('/login/canteen');
        await expect(page.getByText(/canteen login/i)).toBeVisible();
        await expect(page.getByRole('button', { name: /sign in as canteen/i })).toBeVisible();
    });

    test('TC-09: Admin login page renders correctly', async ({ page }) => {
        await page.goto('/login/admin');
        await expect(page.getByText(/admin login/i)).toBeVisible();
        await expect(page.getByRole('button', { name: /sign in as admin/i })).toBeVisible();
    });

    test('TC-10: Login page has back to portal link', async ({ page }) => {
        await page.goto('/login/user');
        const backLink = page.getByRole('link', { name: /back to login portal/i });
        await expect(backLink).toBeVisible();
        await backLink.click();
        await expect(page).toHaveURL('/login');
    });

    test('TC-11: Login page has create account link for user', async ({ page }) => {
        await page.goto('/login/user');
        await expect(page.getByRole('link', { name: /create student account/i })).toBeVisible();
    });

    test('TC-12: Login page has register link for canteen', async ({ page }) => {
        await page.goto('/login/canteen');
        await expect(page.getByRole('link', { name: /register canteen/i })).toBeVisible();
    });

    test('TC-13: Admin login page has no register link', async ({ page }) => {
        await page.goto('/login/admin');
        await expect(page.getByText(/don't have an account/i)).not.toBeVisible();
    });

    test('TC-14: Password visibility toggle works', async ({ page }) => {
        await page.goto('/login/user');
        const passwordInput = page.getByPlaceholder(/enter your password/i);

        // Initially password type
        await expect(passwordInput).toHaveAttribute('type', 'password');

        // Click toggle
        await page.locator('button').filter({ has: page.locator('svg') }).last().click();
        await expect(passwordInput).toHaveAttribute('type', 'text');
    });
});

// ══════════════════════════════════════════════
//  3. STUDENT REGISTRATION TESTS
// ══════════════════════════════════════════════

test.describe('Student Registration', () => {
    test('TC-15: Student registration page renders correctly', async ({ page }) => {
        await page.goto('/register/student');
        await expect(page.getByText(/student registration/i)).toBeVisible();
        await expect(page.getByPlaceholder(/enter your full name/i)).toBeVisible();
        await expect(page.getByPlaceholder(/enter your email/i)).toBeVisible();
    });

    test('TC-16: Student registration - empty form shows validation', async ({ page }) => {
        await page.goto('/register/student');
        await page.getByRole('button', { name: /create student account/i }).click();
        // Browser native validation should prevent submission
        await expect(page).toHaveURL('/register/student');
    });

    test('TC-17: Student registration - password mismatch shows error', async ({ page }) => {
        await page.goto('/register/student');
        await page.getByPlaceholder(/enter your full name/i).fill('Test User');
        await page.getByPlaceholder(/enter your email/i).fill('mismatch@test.com');
        await page.getByPlaceholder(/minimum 6 characters/i).fill('password123');
        await page.getByPlaceholder(/confirm your password/i).fill('different123');
        await page.getByRole('button', { name: /create student account/i }).click();

        // Should show toast error
        await expect(page.getByText(/passwords do not match/i)).toBeVisible({ timeout: 5000 });
    });

    test('TC-18: Student registration - successful registration', async ({ page }) => {
        await page.goto('/register/student');
        await page.getByPlaceholder(/enter your full name/i).fill(STUDENT_NAME);
        await page.getByPlaceholder(/enter your email/i).fill(STUDENT_EMAIL);
        await page.getByPlaceholder(/minimum 6 characters/i).fill(STUDENT_PASSWORD);
        await page.getByPlaceholder(/confirm your password/i).fill(STUDENT_PASSWORD);

        await page.getByRole('button', { name: /create student account/i }).click();

        // Should show success toast
        await expect(page.getByText(/registration successful/i)).toBeVisible({ timeout: 10000 });

        // Should redirect to login page
        await expect(page).toHaveURL(/\/login\/user/, { timeout: 5000 });
    });

    test('TC-19: Student registration - duplicate email shows error', async ({ page }) => {
        await page.goto('/register/student');
        await page.getByPlaceholder(/enter your full name/i).fill('Duplicate User');
        await page.getByPlaceholder(/enter your email/i).fill(STUDENT_EMAIL);
        await page.getByPlaceholder(/minimum 6 characters/i).fill('password123');
        await page.getByPlaceholder(/confirm your password/i).fill('password123');

        await page.getByRole('button', { name: /create student account/i }).click();

        // Should show duplicate email error
        await expect(page.getByText(/already exists/i)).toBeVisible({ timeout: 10000 });
    });
});

// ══════════════════════════════════════════════
//  4. CANTEEN REGISTRATION TESTS
// ══════════════════════════════════════════════

test.describe('Canteen Registration', () => {
    test('TC-20: Canteen registration page renders correctly', async ({ page }) => {
        await page.goto('/register/canteen');
        await expect(page.getByText(/canteen registration/i)).toBeVisible();
        await expect(page.getByPlaceholder(/enter owner name/i)).toBeVisible();
        await expect(page.getByPlaceholder(/campus bites/i)).toBeVisible();
    });

    test('TC-21: Canteen registration - successful registration', async ({ page }) => {
        await page.goto('/register/canteen');
        await page.getByPlaceholder(/enter owner name/i).fill(CANTEEN_NAME);
        await page.getByPlaceholder(/enter your email/i).fill(CANTEEN_EMAIL);
        await page.getByPlaceholder(/minimum 6 characters/i).fill(CANTEEN_PASSWORD);
        await page.getByPlaceholder(/confirm your password/i).fill(CANTEEN_PASSWORD);
        await page.getByPlaceholder(/campus bites/i).fill(CANTEEN_BIZ_NAME);
        await page.getByPlaceholder(/main campus/i).fill('Main Campus Block A');
        await page.getByPlaceholder(/enter license/i).fill('LIC-2026-001');

        await page.getByRole('button', { name: /register canteen/i }).click();

        await expect(page.getByText(/registration successful/i)).toBeVisible({ timeout: 10000 });
        await expect(page).toHaveURL(/\/login\/canteen/, { timeout: 5000 });
    });
});

// ══════════════════════════════════════════════
//  5. LOGIN FUNCTIONALITY TESTS
// ══════════════════════════════════════════════

test.describe('Login Functionality', () => {
    test('TC-22: Login with invalid credentials shows error', async ({ page }) => {
        await page.goto('/login/user');
        await page.getByPlaceholder(/enter your email/i).fill('nonexistent@test.com');
        await page.getByPlaceholder(/enter your password/i).fill('wrongpass');
        await page.getByRole('button', { name: /sign in as user/i }).click();

        await expect(page.getByText(/invalid email or password/i)).toBeVisible({ timeout: 10000 });
    });

    test('TC-23: Login with wrong password shows error', async ({ page }) => {
        await page.goto('/login/user');
        await page.getByPlaceholder(/enter your email/i).fill(STUDENT_EMAIL);
        await page.getByPlaceholder(/enter your password/i).fill('wrongpassword');
        await page.getByRole('button', { name: /sign in as user/i }).click();

        await expect(page.getByText(/invalid email or password/i)).toBeVisible({ timeout: 10000 });
    });

    test('TC-24: Login with wrong role shows error', async ({ page }) => {
        await page.goto('/login/canteen');
        await page.getByPlaceholder(/enter your email/i).fill(STUDENT_EMAIL);
        await page.getByPlaceholder(/enter your password/i).fill(STUDENT_PASSWORD);
        await page.getByRole('button', { name: /sign in as canteen/i }).click();

        await expect(page.getByText(/invalid email or password/i)).toBeVisible({ timeout: 10000 });
    });

    test('TC-25: Successful student login', async ({ page }) => {
        await page.goto('/login/user');
        await page.getByPlaceholder(/enter your email/i).fill(STUDENT_EMAIL);
        await page.getByPlaceholder(/enter your password/i).fill(STUDENT_PASSWORD);
        await page.getByRole('button', { name: /sign in as user/i }).click();

        // Should show success toast
        await expect(page.getByText(/login successful/i)).toBeVisible({ timeout: 10000 });

        // Should redirect to home
        await expect(page).toHaveURL('/', { timeout: 5000 });
    });

    test('TC-26: Successful canteen login', async ({ page }) => {
        await page.goto('/login/canteen');
        await page.getByPlaceholder(/enter your email/i).fill(CANTEEN_EMAIL);
        await page.getByPlaceholder(/enter your password/i).fill(CANTEEN_PASSWORD);
        await page.getByRole('button', { name: /sign in as canteen/i }).click();

        await expect(page.getByText(/login successful/i)).toBeVisible({ timeout: 10000 });
        await expect(page).toHaveURL('/', { timeout: 5000 });
    });
});

// ══════════════════════════════════════════════
//  6. AUTHENTICATED STATE TESTS
// ══════════════════════════════════════════════

test.describe('Authenticated User State', () => {
    test.beforeEach(async ({ page }) => {
        // Login as student before each test
        await page.goto('/login/user');
        await page.getByPlaceholder(/enter your email/i).fill(STUDENT_EMAIL);
        await page.getByPlaceholder(/enter your password/i).fill(STUDENT_PASSWORD);
        await page.getByRole('button', { name: /sign in as user/i }).click();
        await expect(page).toHaveURL('/', { timeout: 15000 });
    });

    test('TC-27: Header shows user name after login', async ({ page }) => {
        await expect(page.locator('.max-w-\\[100px\\].truncate').first()).toBeVisible({ timeout: 5000 });
    });

    test('TC-28: Header shows logout button after login', async ({ page }) => {
        await expect(page.getByRole('button', { name: /logout/i })).toBeVisible({ timeout: 5000 });
    });

    test('TC-29: Profile page is accessible when logged in', async ({ page }) => {
        await page.waitForTimeout(1000); // Give React state time to update
        await page.reload(); // Force full hydration of AuthContext
        await expect(page).toHaveURL('/', { timeout: 15000 });
        await page.locator('a[href="/profile"]').click();
        await expect(page).toHaveURL('/profile', { timeout: 15000 });
        await expect(page.getByRole('heading', { name: STUDENT_NAME })).toBeVisible({ timeout: 5000 });
        await expect(page.locator(`p:has-text("${STUDENT_EMAIL}")`).first()).toBeVisible();
        await expect(page.getByRole('heading', { name: /student/i })).toBeVisible();
    });

    test('TC-30: Logout clears auth state', async ({ page }) => {
        await page.getByRole('button', { name: /logout/i }).first().click();

        // Should redirect to home and show Log In button
        await expect(page).toHaveURL('/');
        await expect(page.getByRole('link', { name: /log in/i }).first()).toBeVisible({ timeout: 5000 });
    });
});

// ══════════════════════════════════════════════
//  7. PROFILE PAGE TESTS
// ══════════════════════════════════════════════

test.describe('Profile Page', () => {
    test.beforeEach(async ({ page }) => {
        // Clear any previous session
        await page.goto('/');
        await page.evaluate(() => localStorage.clear());

        await page.goto('/login/user');
        await page.getByPlaceholder(/enter your email/i).fill(STUDENT_EMAIL);
        await page.getByPlaceholder(/enter your password/i).fill(STUDENT_PASSWORD);

        // Wait for login API response to ensure backend processing finishes
        const responsePromise = page.waitForResponse(response => response.url().includes('/api/auth/login') && response.status() === 200);
        await page.getByRole('button', { name: /sign in as user/i }).click();
        await responsePromise;

        await expect(page).toHaveURL('/', { timeout: 15000 });
        await page.waitForTimeout(1000); // Give React state time to update
        await page.reload(); // Force full hydration of AuthContext
        await expect(page).toHaveURL('/', { timeout: 15000 });

        // Navigate by clicking the profile link
        await page.locator('a[href="/profile"]').click();
        await expect(page).toHaveURL('/profile', { timeout: 15000 });
    });

    test('TC-31: Profile displays user information', async ({ page }) => {
        await expect(page.getByRole('heading', { name: STUDENT_NAME })).toBeVisible({ timeout: 5000 });
        await expect(page.locator(`p:has-text("${STUDENT_EMAIL}")`).first()).toBeVisible();
    });

    test('TC-32: Profile shows student role badge', async ({ page }) => {
        await expect(page.getByRole('heading', { name: /student/i })).toBeVisible();
    });

    test('TC-33: Profile edit mode activates on edit click', async ({ page }) => {
        // Click edit button
        await page.locator('button[title="Edit Profile"]').click();

        // Should show input fields
        await expect(page.locator('input[name="name"]')).toBeVisible();
        // Should show save and cancel buttons
        await expect(page.locator('button[title="Save"]')).toBeVisible();
        await expect(page.locator('button[title="Cancel"]')).toBeVisible();
    });

    test('TC-34: Profile edit cancel restores original values', async ({ page }) => {
        await page.locator('button[title="Edit Profile"]').click();
        const nameInput = page.locator('input[name="name"]');
        await nameInput.fill('Changed Name');

        // Click cancel
        await page.locator('button[title="Cancel"]').click();

        // Should show original name again
        await expect(page.getByRole('heading', { name: STUDENT_NAME })).toBeVisible();
    });

    test('TC-35: Change password section toggles', async ({ page }) => {
        const changeBtn = page.getByText(/change password/i);
        await changeBtn.click();

        // Should show password fields
        await expect(page.getByPlaceholder(/enter current password/i)).toBeVisible();
        await expect(page.getByPlaceholder(/minimum 6 characters/i)).toBeVisible();
        await expect(page.getByPlaceholder(/re-enter new password/i)).toBeVisible();
    });

    test('TC-36: Change password with wrong current password shows error', async ({ page }) => {
        await page.getByText(/change password/i).click();
        await page.getByPlaceholder(/enter current password/i).fill('wrongpassword');
        await page.getByPlaceholder(/minimum 6 characters/i).fill('NewPass@123');
        await page.getByPlaceholder(/re-enter new password/i).fill('NewPass@123');
        await page.getByRole('button', { name: /update password/i }).click();

        await expect(page.getByText(/current password is incorrect/i)).toBeVisible({ timeout: 10000 });
    });

    test('TC-37: Change password mismatch shows error', async ({ page }) => {
        await page.getByText(/change password/i).click();
        await page.getByPlaceholder(/enter current password/i).fill(STUDENT_PASSWORD);
        await page.getByPlaceholder(/minimum 6 characters/i).fill('NewPass@123');
        await page.getByPlaceholder(/re-enter new password/i).fill('Different@123');
        await page.getByRole('button', { name: /update password/i }).click();

        await expect(page.getByText(/do not match/i)).toBeVisible({ timeout: 5000 });
    });

    test('TC-38: Profile has back to home link', async ({ page }) => {
        const backLink = page.getByRole('link', { name: /back to home/i });
        await expect(backLink).toBeVisible();
    });

    test('TC-39: Profile has logout button', async ({ page }) => {
        const logoutBtn = page.getByRole('button', { name: /logout/i });
        await expect(logoutBtn).toBeVisible();
    });

    test('TC-40: Profile logout redirects to home', async ({ page }) => {
        await page.getByRole('button', { name: /logout/i }).first().click();
        await expect(page).toHaveURL('/');
    });
});

// ══════════════════════════════════════════════
//  8. PROTECTED ROUTE TESTS
// ══════════════════════════════════════════════

test.describe('Protected Routes', () => {
    test('TC-41: Profile page redirects to login when not authenticated', async ({ page }) => {
        // Clear any stored tokens
        await page.goto('/');
        await page.evaluate(() => localStorage.clear());

        await page.goto('/profile');
        await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    });
});

// ══════════════════════════════════════════════
//  9. RESPONSIVE / DARK MODE TESTS
// ══════════════════════════════════════════════

test.describe('Theme & Accessibility', () => {
    test('TC-42: Login page renders in dark mode', async ({ page }) => {
        await page.goto('/login/user');
        // Toggle to dark mode via localStorage
        await page.evaluate(() => {
            localStorage.setItem('theme', 'dark');
            document.documentElement.classList.add('dark');
        });
        await page.reload();
        await expect(page.locator('html')).toHaveClass(/dark/);
    });

    test('TC-43: Registration page renders in dark mode', async ({ page }) => {
        await page.goto('/register/student');
        await page.evaluate(() => {
            localStorage.setItem('theme', 'dark');
            document.documentElement.classList.add('dark');
        });
        await page.reload();
        await expect(page.locator('html')).toHaveClass(/dark/);
    });
});
