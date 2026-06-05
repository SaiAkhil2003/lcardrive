const { expect, test } = require("@playwright/test");

const publicRoutes = [
  "/",
  "/search",
  "/find-my-instructor",
  "/instructors/footscray/sarah-m-footscray",
  "/sitemap.xml",
  "/robots.txt"
];

async function expectPageHasAnyText(page, patterns) {
  const body = page.locator("body");

  for (const pattern of patterns) {
    if ((await body.getByText(pattern).count()) > 0) {
      await expect(body.getByText(pattern).first()).toBeVisible();
      return;
    }
  }

  await expect(body).toContainText(patterns[0]);
}

test.describe("public routes", () => {
  for (const route of publicRoutes) {
    test(`${route} loads without login`, async ({ page, request }) => {
      if (route.endsWith(".xml") || route.endsWith(".txt")) {
        const response = await request.get(route);
        expect(response.ok()).toBeTruthy();
        return;
      }

      const response = await page.goto(route);
      expect(response?.ok()).toBeTruthy();
      await expect(page.locator("body")).toBeVisible();
    });
  }
});

test.describe("Clerk auth routes", () => {
  test("/sign-in shows Clerk sign-in UI", async ({ page }) => {
    const response = await page.goto("/sign-in");
    expect(response?.ok()).toBeTruthy();

    await expectPageHasAnyText(page, [
      /sign in/i,
      /email address/i,
      /continue with google/i
    ]);
    await expect(page.getByText(/continue with google/i).first()).toBeVisible();
    await expect(page.getByLabel(/email address/i).first()).toBeVisible();
  });

  test("/sign-up shows Clerk sign-up UI", async ({ page }) => {
    const response = await page.goto("/sign-up");
    expect(response?.ok()).toBeTruthy();

    await expectPageHasAnyText(page, [
      /create your account/i,
      /email address/i,
      /continue with google/i
    ]);
    await expect(page.getByText(/continue with google/i).first()).toBeVisible();
    await expect(page.getByLabel(/email address/i).first()).toBeVisible();
  });
});

test.describe("protected routes while signed out", () => {
  test("/portal/profile redirects to sign-in or shows sign-in UI", async ({ page }) => {
    await page.goto("/portal/profile");

    const url = page.url();
    const body = page.locator("body");

    if (url.includes("/sign-in")) {
      await expect(body).toContainText(/sign in/i);
      return;
    }

    await expect(body).toContainText(/sign in|clerk setup required/i);
  });

  test("/admin redirects to sign-in or denies access", async ({ page }) => {
    const response = await page.goto("/admin");
    const body = page.locator("body");

    if (page.url().includes("/sign-in")) {
      await expect(body).toContainText(/sign in/i);
      return;
    }

    if (response?.status() === 403) {
      await expect(body).toContainText(/forbidden|admin role/i);
      return;
    }

    await expect(body).toContainText(/sign in|forbidden|admin role/i);
  });
});

test.describe("claim route", () => {
  test("/claim/sarah-m-footscray loads signed-out claim prompt", async ({ page }) => {
    const response = await page.goto("/claim/sarah-m-footscray");
    expect(response?.ok()).toBeTruthy();

    await expect(page.locator("body")).toContainText(
      /sign in|sign up|claim your lcardrive profile|claim/i
    );
  });
});

test.describe("API fallback routes", () => {
  test("/api/ai/match returns a safe response", async ({ request }) => {
    const response = await request.post("/api/ai/match", {
      data: {
        suburb: "Footscray",
        transmission: "Auto",
        special_needs: ["Anxiety Friendly"],
        available_days: ["Monday"],
        max_hourly_rate: 80
      }
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data.matches)).toBeTruthy();
  });

  test("/api/ai/bio returns success or auth-required safe status", async ({ request }) => {
    const response = await request.post("/api/ai/bio", {
      data: {
        years_experience: "8",
        licence_types: "Car",
        teaching_style: "calm clear patient",
        learner_types: "nervous learners",
        proud_of: "helping learners pass safely",
        specialisations: "test preparation"
      }
    });

    expect([200, 401]).toContain(response.status());
  });

  test("/api/contact-instructor returns a safe response", async ({ request }) => {
    const response = await request.post("/api/contact-instructor", {
      data: {
        instructorId: "sarah-m-footscray",
        instructorName: "Sarah M.",
        name: "Test Learner",
        email: "learner@example.com",
        phone: "0400000000",
        message: "Testing contact fallback."
      }
    });

    expect(response.status()).toBe(200);
  });

  test("/api/claims returns success or auth-required safe status", async ({ request }) => {
    const response = await request.post("/api/claims", {
      data: {
        instructorId: "sarah-m-footscray",
        fullName: "Test Instructor",
        email: "instructor@example.com",
        phone: "0400000000",
        adiRegistration: "ADI-VIC-10291"
      }
    });

    expect([200, 401]).toContain(response.status());
  });
});
