import { test, expect } from "@playwright/test";

// Third-party requests are never sent by these tests.
test.beforeEach(async ({ page }) => {
  await page.route("https://formsubmit.co/**", (route) => route.abort());
});

test("responsive layout has no document overflow from 320 to 1920px", async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const widths = [
    ...new Set([
      320,
      350,
      351,
      375,
      390,
      440,
      441,
      600,
      700,
      701,
      768,
      900,
      901,
      1024,
      1150,
      1151,
      1280,
      1440,
      1600,
      1920,
      ...Array.from({ length: 53 }, (_, i) => 320 + i * 30),
    ]),
  ].sort((a, b) => a - b);
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    for (const name of [
      "Digital presence",
      "Intelligent workflows",
      "Connected operations",
    ]) {
      await page
        .getByRole("tab", { name: new RegExp(name) })
        .evaluate((tab) => tab.click());
      const metrics = await page.evaluate(() => ({
        viewport: innerWidth,
        document: document.documentElement.scrollWidth,
      }));
      expect(metrics.document, `${name} at ${width}px`).toBeLessThanOrEqual(
        metrics.viewport + 1,
      );
    }
  }
});

test("mobile navigation opens, closes and supports Escape at 320px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 780 });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Open navigation" });
  await toggle.click();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(toggle).toBeFocused();
  await toggle.click();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Capabilities" })
    .click();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(page).toHaveURL(/#capabilities$/);
});

test("product tabs support keyboard navigation and demos work", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("tab", { name: /Digital presence/ }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: /Intelligent workflows/ }),
  ).toHaveAttribute("aria-selected", "true");
  await page.getByRole("button", { name: "Run the demo" }).click();
  await expect(page.locator("#workflow-result")).toContainText(
    "No real data was sent",
  );
  await expect(page.locator(".workflow-node.active")).toHaveCount(4);
  await page.getByRole("tab", { name: /Connected operations/ }).click();
  await page.getByRole("button", { name: "Low stock", exact: true }).click();
  await expect(page.locator("tbody tr:visible")).toHaveCount(2);
  await page.getByRole("button", { name: "All products" }).click();
  await expect(page.locator("tbody tr:visible")).toHaveCount(4);
});

test("currency is consistent and remembered; service CTA preselects enquiry", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "INR ₹" }).click();
  await expect(page.locator('[data-price="starter"]')).toHaveText("₹14,999");
  await expect(page.locator('[data-price="growth"]')).toHaveText("₹24,999");
  await page.reload();
  await expect(page.getByRole("button", { name: "INR ₹" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.getByRole("button", { name: "USD $" }).click();
  await expect(page.locator('[data-price="starter"]')).toHaveText("$1,500");
  await page.getByRole("link", { name: /Automate the everyday/ }).click();
  await expect(page.getByLabel("What are you building?")).toHaveValue(
    "Agentic workflows",
  );
});

async function fillEnquiry(page) {
  await page.getByLabel("Your name").fill("Test User");
  await page.getByLabel("Email address").fill("test@example.com");
  await page
    .getByLabel("What are you building?")
    .selectOption("Something custom");
  await page
    .getByLabel("A little about your idea")
    .fill("A local test. This enquiry must never be sent.");
  await page.getByRole("checkbox").check();
}

test("failed HTTP and application responses keep details; successful retry is confirmed", async ({
  page,
}) => {
  await page.goto("/");
  await fillEnquiry(page);
  let calls = 0;
  await page.route("https://formsubmit.co/**", async (route) => {
    calls++;
    const response =
      calls === 1
        ? { status: 500, body: { success: false } }
        : calls === 2
          ? { status: 200, body: { success: "false" } }
          : { status: 200, body: { success: "true" } };
    await route.fulfill({
      status: response.status,
      contentType: "application/json",
      body: JSON.stringify(response.body),
    });
  });
  const submit = page.getByRole("button", { name: /Let’s make it happen/ });
  for (let attempt = 0; attempt < 2; attempt++) {
    await submit.click();
    await expect(page.locator("#form-status")).toHaveAttribute(
      "data-state",
      "error",
    );
    await expect(page.getByLabel("Your name")).toHaveValue("Test User");
    await expect(submit).toBeEnabled();
  }
  await submit.click();
  await expect(page.locator("#form-status")).toHaveAttribute(
    "data-state",
    "success",
  );
  await expect(page.getByLabel("Your name")).toBeEmpty();
  expect(calls).toBe(3);
});

test("duplicate submissions are prevented", async ({ page }) => {
  await page.goto("/");
  await fillEnquiry(page);
  let calls = 0;
  await page.route("https://formsubmit.co/**", async (route) => {
    calls++;
    await new Promise((resolve) => setTimeout(resolve, 300));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: '{"success":true}',
    });
  });
  await page.locator("#booking-form").evaluate((form) => {
    form.requestSubmit();
    form.requestSubmit();
    form.requestSubmit();
  });
  await expect(page.locator("#form-status")).toHaveAttribute(
    "data-state",
    "success",
  );
  expect(calls).toBe(1);
});

test("WebGL failure and blocked storage do not break core UI", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (/webgl/i.test(type)) return null;
      return getContext.call(this, type, ...args);
    };
    Storage.prototype.getItem = () => {
      throw new Error("Storage blocked");
    };
    Storage.prototype.setItem = () => {
      throw new Error("Storage blocked");
    };
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.waitForTimeout(1800);
  await expect(page.locator("#scene-shell")).not.toHaveClass(/scene-ready/);
  await page.getByRole("button", { name: "INR ₹" }).click();
  await expect(page.locator('[data-price="starter"]')).toHaveText("₹14,999");
  await page.getByRole("link", { name: /Make it intelligent/ }).click();
  await expect(page.getByLabel("What are you building?")).toHaveValue(
    "AI systems & agents",
  );
  expect(errors).toEqual([]);
});

test("3D scene renders, can pause, and respects reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator("#scene-shell")).toHaveClass(/scene-ready/, {
    timeout: 15000,
  });
  const pause = page.getByRole("button", { name: "Pause 3D animation" });
  await pause.click();
  await expect(
    page.getByRole("button", { name: "Resume 3D animation" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("#motion-toggle")).toBeHidden();
  await expect(page.locator("#scene-hint")).toContainText(
    "Reduced motion respected",
  );
  expect(errors).toEqual([]);
});

test("no JavaScript still exposes content and email contact", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 800 },
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4173/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "email your enquiry" }),
  ).toBeVisible();
  await expect(page.locator("#submit-btn")).toBeDisabled();
  await context.close();
});

test("hero product controls focus screens, preselect enquiry and reset with Escape", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("#scene-shell")).toHaveClass(/scene-ready/);
  await page.getByRole("button", { name: "AI agents", exact: true }).click();
  await expect(page.locator("#scene-shell")).toHaveAttribute(
    "data-selected-screen",
    "voice",
  );
  await expect(
    page.getByRole("heading", { name: "A smarter first conversation." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Build something like this" }).click();
  await expect(page.getByLabel("What are you building?")).toHaveValue(
    "AI systems & agents",
  );
  await page
    .getByRole("button", { name: "Business systems", exact: true })
    .click();
  await page.keyboard.press("Escape");
  await expect(page.locator(".hero-product-detail")).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Business systems", exact: true }),
  ).toBeFocused();
  await page.locator("#hero-canvas").scrollIntoViewIfNeeded();
  const canvas = await page.locator("#hero-canvas").boundingBox();
  await page.mouse.move(
    canvas.x + canvas.width / 2,
    canvas.y + canvas.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    canvas.x + canvas.width / 2 + 80,
    canvas.y + canvas.height / 2,
    { steps: 8 },
  );
  await page.mouse.up();
  expect(
    Number(await page.locator("#scene-shell").getAttribute("data-rotation")),
  ).toBeGreaterThan(0);
});

test("hero discovery works without WebGL and fits 320px with details open", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (/webgl/i.test(type)) return null;
      return original.call(this, type, ...args);
    };
  });
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Business systems", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Bring your operations together." }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320);
  await page.getByRole("link", { name: "Build something like this" }).click();
  await expect(page.getByLabel("What are you building?")).toHaveValue(
    "Business software",
  );
});
