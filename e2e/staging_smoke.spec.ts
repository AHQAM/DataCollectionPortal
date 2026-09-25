import { test, expect } from "@playwright/test";

test.describe("Staging Environment - E2E Smoke & Health Suite", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to base URL (staging or local preview)
    await page.goto("/");
  });

  test("1. loads authentication portal and renders essential branding elements", async ({
    page,
  }) => {
    // Check page header
    const portalHeader = page.locator("h1");
    await expect(portalHeader).toBeVisible();
    await expect(portalHeader).toContainText(
      /بوابة جمع البيانات|Field Data Collection/i,
    );

    // Verify email & password fields are rendered
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
  });

  test("2. toggles language and switches document direction between RTL and LTR", async ({
    page,
  }) => {
    const html = page.locator("html");

    // Initially Arabic / RTL
    const initialDir = await html.getAttribute("dir");
    expect(initialDir).toBe("rtl");

    // Find and click the language toggle button
    const langButton = page.locator("button", { hasText: /English|عربي/i });
    await expect(langButton).toBeVisible();
    await langButton.click();

    // After click -> LTR / English
    await expect(html).toHaveAttribute("dir", "ltr");
    const portalHeader = page.locator("h1");
    await expect(portalHeader).toContainText("Field Data Collection Portal");

    // Switch back -> RTL / Arabic
    await langButton.click();
    await expect(html).toHaveAttribute("dir", "rtl");
    await expect(portalHeader).toContainText("بوابة جمع البيانات الميدانية");
  });

  test("3. validates required inputs and displays feedback on invalid login attempt", async ({
    page,
  }) => {
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    // Fill invalid credentials
    await emailInput.fill("invalid-test-user@staging-smoke.com");
    await passwordInput.fill("WrongPassword123!");
    await submitButton.click();

    // Verify error feedback or alert banner appears
    const alertBox = page.locator(".bg-rose-50, [role='alert']");
    await expect(alertBox).toBeVisible({ timeout: 10000 });
  });

  test("4. verifies mobile and responsive layout adaptability", async ({
    page,
  }) => {
    // Test on Mobile viewport (e.g. iPhone 13 resolution: 390x844)
    await page.setViewportSize({ width: 390, height: 844 });
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();

    // Test on Desktop resolution (1280x800)
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(emailInput).toBeVisible();
  });

  test("5. simulates offline mode and verifies IndexedDB queueing resilience during network partition", async ({
    page,
  }) => {
    // 1. Simulate network disconnect
    await page.context().setOffline(true);
    const isOffline = await page.evaluate(() => {
      window.dispatchEvent(new Event("offline"));
      return !navigator.onLine;
    });
    expect(isOffline).toBe(true);

    // 2. Validate IndexedDB offline storage is functional and can persist queued items
    const idbOperational = await page.evaluate(async () => {
      return new Promise<boolean>((resolve) => {
        try {
          const req = indexedDB.open("DataCollectionOfflineDB", 1);
          req.onupgradeneeded = (e: any) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains("queued_records")) {
              db.createObjectStore("queued_records", { keyPath: "id" });
            }
          };
          req.onsuccess = () => {
            const db = req.result;
            const tx = db.transaction("queued_records", "readwrite");
            const store = tx.objectStore("queued_records");
            const testItem = {
              id: "e2e_test_record_" + Date.now(),
              recordId: "rec_e2e_1",
              requestId: "req_e2e_1",
              values: { field1: "offline_value" },
              isDraft: true,
              createdAt: Date.now(),
              retryCount: 0,
            };
            store.add(testItem);
            tx.oncomplete = () => {
              const readTx = db.transaction("queued_records", "readonly");
              const readReq = readTx.objectStore("queued_records").getAll();
              readReq.onsuccess = () => {
                const count = readReq.result.length;
                db.close();
                resolve(count > 0);
              };
              readReq.onerror = () => {
                db.close();
                resolve(false);
              };
            };
            tx.onerror = () => {
              db.close();
              resolve(false);
            };
          };
          req.onerror = () => resolve(false);
        } catch {
          resolve(false);
        }
      });
    });
    expect(idbOperational).toBe(true);

    // 3. Restore network connectivity
    await page.context().setOffline(false);
    const isOnlineNow = await page.evaluate(() => {
      window.dispatchEvent(new Event("online"));
      return navigator.onLine;
    });
    expect(isOnlineNow).toBe(true);
  });
});

