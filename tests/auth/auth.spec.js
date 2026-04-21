// auth.spec.js — Playwright tests for SmartMess Auth Pages
// Covers: LoginPage, StudentRegister, CanteenRegister

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

// AuthContext uses axios with baseURL: 'http://localhost:5000/api/auth'
// so all login/register calls go to the backend port, not the Vite dev server.
// StudentRegister uses the AuthContext register() → also hits :5000
// CanteenRegister uses fetch('/api/auth/register') → hits :5173 (proxied)
const AUTH_API        = 'http://localhost:5000/api/auth/login';
const REG_API         = 'http://localhost:5000/api/auth/register'; // StudentRegister (axios)
const CANTEEN_REG_API = '**/api/auth/register';                    // CanteenRegister (fetch, relative)

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

async function fillLogin(page, email, password) {
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
}

async function fillStudentForm(page, overrides = {}) {
    const data = {
        name: 'Alice Smith',
        email: 'alice@example.com',
        password: 'secret123',
        confirmPassword: 'secret123',
        phone: '+94 77 123 4567',
        university: 'SLIIT',
        studentId: 'IT12345678',
        ...overrides,
    };
    await page.fill('input[name="name"]', data.name);
    await page.fill('input[name="email"]', data.email);
    await page.fill('input[name="password"]', data.password);
    await page.fill('input[name="confirmPassword"]', data.confirmPassword);
    if (data.phone)      await page.fill('input[name="phone"]', data.phone);
    if (data.university) await page.fill('input[name="university"]', data.university);
    if (data.studentId)  await page.fill('input[name="studentId"]', data.studentId);
    return data;
}

async function fillCanteenForm(page, overrides = {}) {
    const data = {
        name: 'Bob Owner',
        email: 'bob@canteen.com',
        password: 'secret123',
        confirmPassword: 'secret123',
        canteenName: 'Campus Bites',
        location: 'Main Campus, Block A',
        licenseNumber: 'LIC-001',
        phone: '+94 77 987 6543',
        ...overrides,
    };
    await page.fill('input[name="name"]', data.name);
    await page.fill('input[name="email"]', data.email);
    await page.fill('input[name="password"]', data.password);
    await page.fill('input[name="confirmPassword"]', data.confirmPassword);
    await page.fill('input[name="canteenName"]', data.canteenName);
    if (data.location)      await page.fill('input[name="location"]', data.location);
    if (data.licenseNumber) await page.fill('input[name="licenseNumber"]', data.licenseNumber);
    if (data.phone)         await page.fill('input[name="phone"]', data.phone);
    return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN PAGE — /login/user
// ─────────────────────────────────────────────────────────────────────────────

test.describe('LoginPage — User (role: user)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(`${BASE_URL}/login/user`);
    });

    test('renders User Login heading and tagline', async ({ page }) => {
        await expect(page.getByRole('heading', { name: /user login/i })).toBeVisible();
        await expect(page.getByText(/students, teachers & staff/i)).toBeVisible();
    });

    test('renders email and password fields', async ({ page }) => {
        await expect(page.locator('input[name="email"]')).toBeVisible();
        await expect(page.locator('input[name="password"]')).toBeVisible();
    });

    test('shows error toast when submitting empty form', async ({ page }) => {
        await page.evaluate(() => {
            document.querySelectorAll('input[required]').forEach(el => el.removeAttribute('required'));
        });
        await page.click('button[type="submit"]');
        await expect(page.getByText(/please fill in all fields/i)).toBeVisible({ timeout: 5000 });
    });

    test('toggles password visibility', async ({ page }) => {
        const passwordInput = page.locator('input[name="password"]');
        await expect(passwordInput).toHaveAttribute('type', 'password');
        await page.locator('button[type="button"]').first().click();
        await expect(passwordInput).toHaveAttribute('type', 'text');
        await page.locator('button[type="button"]').first().click();
        await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('shows spinner on submit with valid fields', async ({ page }) => {
        await page.route(AUTH_API, async (route) => {
            await new Promise(r => setTimeout(r, 3000));
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true, token: 'tok', user: { role: 'student' } }),
            });
        });
        await fillLogin(page, 'alice@example.com', 'secret123');
        await page.click('button[type="submit"]');
        await expect(page.getByText(/signing in/i)).toBeVisible();
    });

    test('shows error toast on failed login', async ({ page }) => {
        await page.route(AUTH_API, route =>
            route.fulfill({
                status: 401,
                contentType: 'application/json',
                body: JSON.stringify({ success: false, message: 'Invalid credentials' }),
            })
        );
        await fillLogin(page, 'wrong@example.com', 'wrongpass');
        await page.click('button[type="submit"]');
        await expect(page.getByText(/invalid credentials/i)).toBeVisible();
    });

    test('redirects to /student/canteens on successful login', async ({ page }) => {
        await page.route(AUTH_API, route =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true, token: 'tok', user: { role: 'student' } }),
            })
        );
        await fillLogin(page, 'alice@example.com', 'secret123');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(/\/student\/canteens/, { timeout: 5000 });
    });

    test('"Back to Login Portal" link navigates to /login', async ({ page }) => {
        await page.click('text=Back to Login Portal');
        await expect(page).toHaveURL(/\/login$/);
    });

    test('register link points to /register/student', async ({ page }) => {
        await expect(page.getByRole('link', { name: /create student account/i }))
            .toHaveAttribute('href', '/register/student');
    });
}); // closes LoginPage — User

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN PAGE — /login/canteen
// ─────────────────────────────────────────────────────────────────────────────

test.describe('LoginPage — Canteen (role: canteen)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(`${BASE_URL}/login/canteen`);
    });

    test('renders Canteen Login heading', async ({ page }) => {
        await expect(page.getByRole('heading', { name: /canteen login/i })).toBeVisible();
        await expect(page.getByText(/food vendors & operators/i)).toBeVisible();
    });

    test('register link points to /register/canteen', async ({ page }) => {
        await expect(page.getByRole('link', { name: /register canteen/i }))
            .toHaveAttribute('href', '/register/canteen');
    });

    test('redirects to /canteen/dashboard on successful login', async ({ page }) => {
        await page.route(AUTH_API, route =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true, token: 'tok', user: { role: 'canteen' } }),
            })
        );
        await fillLogin(page, 'bob@canteen.com', 'secret123');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(/\/canteen\/dashboard/, { timeout: 8000 });
    });
}); // closes LoginPage — Canteen

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN PAGE — /login/admin
// ─────────────────────────────────────────────────────────────────────────────

test.describe('LoginPage — Admin (role: admin)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(`${BASE_URL}/login/admin`);
    });

    test('renders Admin Login heading', async ({ page }) => {
        await expect(page.getByRole('heading', { name: /admin login/i })).toBeVisible();
        await expect(page.getByText(/system administrators/i)).toBeVisible();
    });

    test('does NOT show register link for admin', async ({ page }) => {
        await expect(page.getByRole('link', { name: /register/i })).toHaveCount(0);
    });

    test('redirects to /admin/dashboard on successful login', async ({ page }) => {
        await page.route(AUTH_API, route =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true, token: 'tok', user: { role: 'admin' } }),
            })
        );
        await fillLogin(page, 'admin@smartmess.com', 'adminpass');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 5000 });
    });
}); // closes LoginPage — Admin

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT REGISTER — /register/student
// ─────────────────────────────────────────────────────────────────────────────

test.describe('StudentRegister', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(`${BASE_URL}/register/student`);
    });

    test('renders Student Registration heading', async ({ page }) => {
        await expect(page.getByRole('heading', { name: /student registration/i })).toBeVisible();
        await expect(page.getByText(/create your smartmess student account/i)).toBeVisible();
    });

    test('renders all required fields', async ({ page }) => {
        for (const name of ['name', 'email', 'password', 'confirmPassword']) {
            await expect(page.locator(`input[name="${name}"]`)).toBeVisible();
        }
    });

    test('renders optional fields', async ({ page }) => {
        for (const name of ['phone', 'university', 'studentId']) {
            await expect(page.locator(`input[name="${name}"]`)).toBeVisible();
        }
    });

    test('shows error when required fields are empty', async ({ page }) => {
        await page.evaluate(() => {
            document.querySelectorAll('input[required]').forEach(el => el.removeAttribute('required'));
        });
        await page.click('button[type="submit"]');
        await expect(page.getByText(/please fill in all required fields/i)).toBeVisible({ timeout: 5000 });
    });

    test('shows error when passwords do not match', async ({ page }) => {
        await fillStudentForm(page, { confirmPassword: 'different' });
        await page.click('button[type="submit"]');
        await expect(page.getByText(/passwords do not match/i)).toBeVisible();
    });

    test('shows error when password is too short', async ({ page }) => {
        await fillStudentForm(page, { password: 'abc', confirmPassword: 'abc' });
        await page.click('button[type="submit"]');
        await expect(page.getByText(/at least 6 characters/i)).toBeVisible();
    });

    test('toggles password visibility', async ({ page }) => {
        const pwInput = page.locator('input[name="password"]');
        await expect(pwInput).toHaveAttribute('type', 'password');
        await page.locator('button[type="button"]').nth(0).click();
        await expect(pwInput).toHaveAttribute('type', 'text');
    });

    test('toggles confirm password visibility', async ({ page }) => {
        const cpInput = page.locator('input[name="confirmPassword"]');
        await expect(cpInput).toHaveAttribute('type', 'password');
        await page.locator('button[type="button"]').nth(1).click();
        await expect(cpInput).toHaveAttribute('type', 'text');
    });

    test('shows spinner during submission', async ({ page }) => {
        await page.route(REG_API, async (route) => {
            await new Promise(r => setTimeout(r, 3000));
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true }),
            });
        });
        await fillStudentForm(page);
        await page.click('button[type="submit"]');
        await expect(page.getByText(/creating account/i)).toBeVisible();
    });

    test('shows success toast and redirects on successful registration', async ({ page }) => {
        await page.route(REG_API, route =>
            route.fulfill({
                status: 201,
                contentType: 'application/json',
                body: JSON.stringify({ success: true }),
            })
        );
        await fillStudentForm(page);
        await page.click('button[type="submit"]');
        await expect(page.getByText(/registration successful/i)).toBeVisible({ timeout: 10000 });
        await expect(page).toHaveURL(/\/login\/user/, { timeout: 5000 });
    });

    test('shows error toast on server failure', async ({ page }) => {
        await page.route(REG_API, route =>
            route.fulfill({
                status: 400,
                contentType: 'application/json',
                body: JSON.stringify({ success: false, message: 'Email already in use' }),
            })
        );
        await fillStudentForm(page);
        await page.click('button[type="submit"]');
        await expect(page.getByText(/email already in use/i)).toBeVisible();
    });

    test('"Back to Login" link navigates to /login/user', async ({ page }) => {
        await page.click('text=Back to Login');
        await expect(page).toHaveURL(/\/login\/user/);
    });

    test('"Sign in here" link navigates to /login/user', async ({ page }) => {
        await expect(page.getByRole('link', { name: /sign in here/i }))
            .toHaveAttribute('href', '/login/user');
    });

    test('SmartMess footer copyright is present', async ({ page }) => {
        await expect(page.getByText(/smartmess/i).last()).toBeVisible();
    });
}); // closes StudentRegister

// ─────────────────────────────────────────────────────────────────────────────
// CANTEEN REGISTER — /register/canteen
// ─────────────────────────────────────────────────────────────────────────────

test.describe('CanteenRegister', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(`${BASE_URL}/register/canteen`);
    });

    test('renders Canteen Registration heading', async ({ page }) => {
        await expect(page.getByRole('heading', { name: /canteen registration/i })).toBeVisible();
        await expect(page.getByText(/register your canteen on smartmess/i)).toBeVisible();
    });

    test('renders all required fields', async ({ page }) => {
        for (const name of ['name', 'email', 'password', 'confirmPassword', 'canteenName']) {
            await expect(page.locator(`input[name="${name}"]`)).toBeVisible();
        }
    });

    test('renders optional fields', async ({ page }) => {
        for (const name of ['location', 'licenseNumber', 'phone']) {
            await expect(page.locator(`input[name="${name}"]`)).toBeVisible();
        }
    });

    test('shows error when required fields are empty', async ({ page }) => {
        await page.evaluate(() => {
            document.querySelectorAll('input[required]').forEach(el => el.removeAttribute('required'));
        });
        await page.click('button[type="submit"]');
        await expect(page.getByText(/please fill in all required fields/i)).toBeVisible({ timeout: 5000 });
    });

    test('shows error when document is not uploaded', async ({ page }) => {
        await fillCanteenForm(page);
        await page.click('button[type="submit"]');
        await expect(page.getByText(/please upload your registration document/i)).toBeVisible();
    });

    test('shows error when passwords do not match', async ({ page }) => {
        await fillCanteenForm(page, { confirmPassword: 'different' });
        await page.locator('input[type="file"]').setInputFiles({
            name: 'license.pdf',
            mimeType: 'application/pdf',
            buffer: Buffer.from('dummy'),
        });
        await page.click('button[type="submit"]');
        await expect(page.getByText(/passwords do not match/i)).toBeVisible();
    });

    test('shows error when password is too short', async ({ page }) => {
        await fillCanteenForm(page, { password: 'abc', confirmPassword: 'abc' });
        await page.locator('input[type="file"]').setInputFiles({
            name: 'license.pdf',
            mimeType: 'application/pdf',
            buffer: Buffer.from('dummy'),
        });
        await page.click('button[type="submit"]');
        await expect(page.getByText(/at least 6 characters/i)).toBeVisible();
    });

    test('document upload shows file name after selection', async ({ page }) => {
        await page.locator('input[type="file"]').setInputFiles({
            name: 'my_license.pdf',
            mimeType: 'application/pdf',
            buffer: Buffer.from('dummy'),
        });
        await expect(page.getByText('my_license.pdf')).toBeVisible();
    });

    test('accepts PDF, JPG, JPEG and PNG file types', async ({ page }) => {
        const fileInput = page.locator('input[type="file"]');
        const accept = await fileInput.getAttribute('accept');
        expect(accept).toContain('.pdf');
        expect(accept).toContain('.jpg');
        expect(accept).toContain('.jpeg');
        expect(accept).toContain('.png');
    });

    test('toggles password visibility', async ({ page }) => {
        const pwInput = page.locator('input[name="password"]');
        await expect(pwInput).toHaveAttribute('type', 'password');
        await page.locator('button[type="button"]').nth(0).click();
        await expect(pwInput).toHaveAttribute('type', 'text');
    });

    test('toggles confirm password visibility', async ({ page }) => {
        const cpInput = page.locator('input[name="confirmPassword"]');
        await expect(cpInput).toHaveAttribute('type', 'password');
        await page.locator('button[type="button"]').nth(1).click();
        await expect(cpInput).toHaveAttribute('type', 'text');
    });

    test('shows spinner during submission', async ({ page }) => {
        await page.route(CANTEEN_REG_API, async (route) => {
            await new Promise(r => setTimeout(r, 3000));
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true }),
            });
        });
        await fillCanteenForm(page);
        await page.locator('input[type="file"]').setInputFiles({
            name: 'license.pdf',
            mimeType: 'application/pdf',
            buffer: Buffer.from('dummy'),
        });
        await page.click('button[type="submit"]');
        await expect(page.getByText(/submitting registration/i)).toBeVisible();
    });

    test('shows success toast and redirects on successful registration', async ({ page }) => {
        await page.route(CANTEEN_REG_API, route =>
            route.fulfill({
                status: 201,
                contentType: 'application/json',
                body: JSON.stringify({ success: true }),
            })
        );
        await fillCanteenForm(page);
        await page.locator('input[type="file"]').setInputFiles({
            name: 'license.pdf',
            mimeType: 'application/pdf',
            buffer: Buffer.from('dummy'),
        });
        await page.click('button[type="submit"]');
        await expect(page.getByText(/awaiting admin approval/i)).toBeVisible({ timeout: 10000 });
        await expect(page).toHaveURL(/\/login\/canteen/, { timeout: 5000 });
    });

    test('shows error toast on server failure', async ({ page }) => {
        await page.route(CANTEEN_REG_API, route =>
            route.fulfill({
                status: 400,
                contentType: 'application/json',
                body: JSON.stringify({ success: false, message: 'Email already exists' }),
            })
        );
        await fillCanteenForm(page);
        await page.locator('input[type="file"]').setInputFiles({
            name: 'license.pdf',
            mimeType: 'application/pdf',
            buffer: Buffer.from('dummy'),
        });
        await page.click('button[type="submit"]');
        await expect(page.getByText(/email already exists/i)).toBeVisible();
    });

    test('shows generic error toast on network failure', async ({ page }) => {
        await page.route(CANTEEN_REG_API, route => route.abort());
        await fillCanteenForm(page);
        await page.locator('input[type="file"]').setInputFiles({
            name: 'license.pdf',
            mimeType: 'application/pdf',
            buffer: Buffer.from('dummy'),
        });
        await page.click('button[type="submit"]');
        await expect(page.getByText(/registration failed/i)).toBeVisible();
    });

    test('"Back to Login" link navigates to /login/canteen', async ({ page }) => {
        await page.click('text=Back to Login');
        await expect(page).toHaveURL(/\/login\/canteen/);
    });

    test('"Sign in here" link navigates to /login/canteen', async ({ page }) => {
        await expect(page.getByRole('link', { name: /sign in here/i }))
            .toHaveAttribute('href', '/login/canteen');
    });

    test('form is submitted as multipart/form-data (no Content-Type header)', async ({ page }) => {
        let requestContentType = '';
        await page.route(CANTEEN_REG_API, route => {
            requestContentType = route.request().headers()['content-type'] || '';
            route.fulfill({
                status: 201,
                contentType: 'application/json',
                body: JSON.stringify({ success: true }),
            });
        });
        await fillCanteenForm(page);
        await page.locator('input[type="file"]').setInputFiles({
            name: 'license.pdf',
            mimeType: 'application/pdf',
            buffer: Buffer.from('dummy'),
        });
        await page.click('button[type="submit"]');
        expect(requestContentType).toContain('multipart/form-data');
    });

    test('SmartMess footer copyright is present', async ({ page }) => {
        await expect(page.getByText(/smartmess/i).last()).toBeVisible();
    });
}); // closes CanteenRegister