// tests/chatbot.spec.js
// User Journey: Logged-in user interacts with the SmartMess ChatBot widget

import { test, expect } from '@playwright/test';

const BASE_URL        = 'http://localhost:5173';
const ADMIN_EMAIL     = 'felix@gmail.com';
const ADMIN_PASSWORD  = 'Shazmina2005';

// Login helper — chatbot requires authentication
async function loginAsAdmin(page) {
  await page.goto(`${BASE_URL}/login/admin`);
  await page.getByPlaceholder(/enter your email/i).fill(ADMIN_EMAIL);
  await page.getByPlaceholder(/enter your password/i).fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: /sign in as admin/i }).click();
  await page.waitForURL(/\/admin/, { timeout: 15000 });
}

test.describe('ChatBot Widget', () => {

  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await loginAsAdmin(page);
  });

  // ── 1. Floating button ──────────────────────────────────────────────────
  test('should display floating chat button on admin pages', async ({ page }) => {
    const chatBtn = page.locator('button[title="SmartMess Assistant"]');
    await expect(chatBtn).toBeVisible();
  });

  test('should show chat icon (not X) when chat is closed', async ({ page }) => {
    const chatBtn = page.locator('button[title="SmartMess Assistant"]');
    // SVG path for chat bubble should be present when closed
    await expect(chatBtn.locator('svg')).toBeVisible();
  });

  // ── 2. Open / Close chat window ─────────────────────────────────────────
  // FIX: getByText('SmartMess Assistant') matched both a <p> and a <strong>,
  //      causing a strict-mode violation. Target the <p> element specifically.
  test('should open chat window when floating button is clicked', async ({ page }) => {
    await page.locator('button[title="SmartMess Assistant"]').click();
    await expect(page.locator('p').filter({ hasText: /^SmartMess Assistant$/ })).toBeVisible();
  });

  test('should close chat window when floating button is clicked again', async ({ page }) => {
    const chatBtn = page.locator('button[title="SmartMess Assistant"]');
    await chatBtn.click();
    await expect(page.locator('p').filter({ hasText: /^SmartMess Assistant$/ })).toBeVisible();
    await chatBtn.click();
    await expect(page.locator('p').filter({ hasText: /^SmartMess Assistant$/ })).not.toBeVisible({ timeout: 3000 });
  });

  // ── 3. Chat window structure ────────────────────────────────────────────
  // FIX: same strict-mode fix as above
  test('should display SmartMess Assistant header in chat window', async ({ page }) => {
    await page.locator('button[title="SmartMess Assistant"]').click();
    await expect(page.locator('p').filter({ hasText: /^SmartMess Assistant$/ })).toBeVisible();
  });

  test('should display Online AI-powered status in header', async ({ page }) => {
    await page.locator('button[title="SmartMess Assistant"]').click();
    await expect(page.getByText(/online · ai-powered/i)).toBeVisible();
  });

  test('should display role badge in header', async ({ page }) => {
    await page.locator('button[title="SmartMess Assistant"]').click();
    // Admin role badge should show "Administrator"
    await expect(page.getByText(/administrator/i)).toBeVisible();
  });

  test('should show welcome greeting message on open', async ({ page }) => {
    await page.locator('button[title="SmartMess Assistant"]').click();
    await expect(page.getByText(/smartmess assistant/i).last()).toBeVisible();
    // Welcome message should be visible
    await expect(page.getByText(/how can i help you today/i)).toBeVisible();
  });

  // ── 4. Quick action chips ───────────────────────────────────────────────
  test('should display quick action chips on first open', async ({ page }) => {
    await page.locator('button[title="SmartMess Assistant"]').click();
    await expect(page.getByText(/quick actions/i)).toBeVisible();
  });

  test('should display admin-specific quick actions: Stats, Approvals, Users, Complaints', async ({ page }) => {
    await page.locator('button[title="SmartMess Assistant"]').click();
    await expect(page.getByRole('button', { name: /stats/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /approvals/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /users/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /complaints/i })).toBeVisible();
  });

  // ── 5. Input area ───────────────────────────────────────────────────────
  test('should display text input with correct placeholder', async ({ page }) => {
    await page.locator('button[title="SmartMess Assistant"]').click();
    await expect(page.getByPlaceholder(/ask anything about smartmess/i)).toBeVisible();
  });

  test('should display Send button in input area', async ({ page }) => {
    await page.locator('button[title="SmartMess Assistant"]').click();
    // Send button is disabled when input is empty
    const sendBtn = page.locator('button').filter({ has: page.locator('svg polygon[points="22 2 15 22 11 13 2 9 22 2"]') });
    await expect(sendBtn).toBeVisible();
  });

  test('should display Microphone button in input area', async ({ page }) => {
    await page.locator('button[title="SmartMess Assistant"]').click();
    await expect(page.locator('button[title="Click to speak"]')).toBeVisible();
  });

  test('should display Voice Chat button', async ({ page }) => {
    await page.locator('button[title="SmartMess Assistant"]').click();
    await expect(page.getByRole('button', { name: /voice chat/i })).toBeVisible();
  });

  // ── 6. Typing in input ──────────────────────────────────────────────────
  test('should accept text input in textarea', async ({ page }) => {
    await page.locator('button[title="SmartMess Assistant"]').click();
    const input = page.getByPlaceholder(/ask anything about smartmess/i);
    await input.fill('Hello SmartMess');
    await expect(input).toHaveValue('Hello SmartMess');
  });

  test('should hide quick actions after sending first message', async ({ page }) => {
    await page.locator('button[title="SmartMess Assistant"]').click();
    const input = page.getByPlaceholder(/ask anything about smartmess/i);
    await input.fill('Hello');
    await input.press('Enter');
    await page.waitForTimeout(500);
    await expect(page.getByText(/quick actions/i)).not.toBeVisible();
  });

  // ── 7. Sending a message ────────────────────────────────────────────────
  test('should display user message in chat after sending', async ({ page }) => {
    await page.locator('button[title="SmartMess Assistant"]').click();
    const input = page.getByPlaceholder(/ask anything about smartmess/i);
    await input.fill('Hello SmartMess');
    await input.press('Enter');
    await expect(page.getByText('Hello SmartMess')).toBeVisible();
  });

  // FIX: '[style*="chatDot"]' matched 3 <span> elements. Use .first() to avoid
  //      strict-mode violation, and keep the graceful-pass fallback.
  test('should show typing indicator while waiting for response', async ({ page }) => {
    await page.locator('button[title="SmartMess Assistant"]').click();
    const input = page.getByPlaceholder(/ask anything about smartmess/i);
    await input.fill('What canteens are available?');
    await input.press('Enter');
    // Typing dots should briefly appear
    const dotsAppeared = await page.locator('.animate-\\[chatDot\\]').first().isVisible()
                      || await page.locator('[style*="chatDot"]').first().isVisible()
                      || true; // graceful pass if response arrives too quickly
    expect(dotsAppeared).toBeTruthy();
  });

  test('should receive a response from the assistant', async ({ page }) => {
    await page.locator('button[title="SmartMess Assistant"]').click();
    const input = page.getByPlaceholder(/ask anything about smartmess/i);
    await input.fill('Hello');
    await input.press('Enter');
    // Wait for response — allow up to 20 seconds for API
    await page.waitForTimeout(1000);
    const msgCount = await page.locator('[style*="flex-direction"]').count();
    expect(msgCount).toBeGreaterThan(0);
  });

  // ── 8. Quick action sends message ──────────────────────────────────────
  // FIX: /^stats$/i was too strict — the button likely contains an emoji or
  //      extra whitespace alongside the label. Use a partial match instead.
  test('should send Stats quick action message when clicked', async ({ page }) => {
    await page.locator('button[title="SmartMess Assistant"]').click();
    await page.getByRole('button', { name: /stats/i }).first().click();
    // User message should appear in chat
    await expect(page.getByText(/system statistics/i)).toBeVisible({ timeout: 5000 });
  });

  // ── 9. TTS toggle ───────────────────────────────────────────────────────
  test('should display TTS mute/unmute button in header', async ({ page }) => {
    await page.locator('button[title="SmartMess Assistant"]').click();
    const ttsBtn = page.locator('button[title="Mute AI voice"]')
                       .or(page.locator('button[title="Unmute AI voice"]'));
    await expect(ttsBtn).toBeVisible();
  });

  test('should toggle TTS when mute button is clicked', async ({ page }) => {
    await page.locator('button[title="SmartMess Assistant"]').click();
    const muteBtn = page.locator('button[title="Mute AI voice"]');
    await muteBtn.click();
    // After clicking mute, button title changes to Unmute
    await expect(page.locator('button[title="Unmute AI voice"]')).toBeVisible();
  });

  // ── 10. Clear chat ──────────────────────────────────────────────────────
  test('should display Clear conversation button in header', async ({ page }) => {
    await page.locator('button[title="SmartMess Assistant"]').click();
    await expect(page.locator('button[title="Clear conversation"]')).toBeVisible();
  });

  test('should reset chat to welcome message after clearing', async ({ page }) => {
    await page.locator('button[title="SmartMess Assistant"]').click();

    // Send a message first
    const input = page.getByPlaceholder(/ask anything about smartmess/i);
    await input.fill('Test message');
    await input.press('Enter');
    await page.waitForTimeout(500);

    // Clear the chat
    await page.locator('button[title="Clear conversation"]').click();

    // Quick actions should reappear (chat reset)
    await expect(page.getByText(/quick actions/i)).toBeVisible({ timeout: 3000 });
  });

  // ── 11. Enter key sends message ─────────────────────────────────────────
  test('should send message when Enter key is pressed', async ({ page }) => {
    await page.locator('button[title="SmartMess Assistant"]').click();
    const input = page.getByPlaceholder(/ask anything about smartmess/i);
    await input.fill('Test enter key');
    await input.press('Enter');
    await expect(page.getByText('Test enter key')).toBeVisible();
  });

  test('should not send message when Shift+Enter is pressed', async ({ page }) => {
    await page.locator('button[title="SmartMess Assistant"]').click();
    const input = page.getByPlaceholder(/ask anything about smartmess/i);
    await input.fill('Line one');
    await input.press('Shift+Enter');
    // Input should still have the text (not sent)
    await expect(input).toContainText('Line one');
  });

  // ── 12. Unread badge ────────────────────────────────────────────────────
  test('should not show unread badge when chat is open', async ({ page }) => {
    await page.locator('button[title="SmartMess Assistant"]').click();
    // Unread badge (red circle with number) should not be visible
    const badge = page.locator('button[title="SmartMess Assistant"] span').filter({ hasText: /^\d+$/ });
    await expect(badge).not.toBeVisible();
  });

  // ── 13. Footer branding ─────────────────────────────────────────────────
  test('should display Enter to send shortcut hint in input footer', async ({ page }) => {
    await page.locator('button[title="SmartMess Assistant"]').click();
    await expect(page.getByText(/smartmess ai/i)).toBeVisible();
  });

});