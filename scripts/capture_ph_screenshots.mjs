// Product Hunt gallery capture — reproducible 1270x760 screenshots of the six
// launch frames (see BACKLINKS.md "Gallery assets"). Re-run after data updates
// so the launch imagery never drifts from the live site.
//
//   npm i -D playwright && npx playwright install chromium   # one time
//   node scripts/capture_ph_screenshots.mjs                  # dev server on :3000
//   BASE_URL=https://www.wheretoapply.xyz node scripts/capture_ph_screenshots.mjs
//
// Output: scripts/ph-screenshots/*.png

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), "ph-screenshots");

// PH gallery images render at 1270x760.
const VIEWPORT = { width: 1270, height: 760 };

/** Scroll so `locator`'s top sits `topPx` down from the viewport top. */
async function anchorTop(page, locator, topPx = 96) {
  await locator.evaluate((el, top) => {
    const y = el.getBoundingClientRect().top + window.scrollY - top;
    window.scrollTo({ top: Math.max(0, y), behavior: "instant" });
  }, topPx);
  await page.waitForTimeout(250);
}

/** Kill the cookie banner and any other fixed overlays before shooting. */
async function dismissCookieBanner(page) {
  const decline = page.getByRole("button", { name: /decline/i });
  if (await decline.count()) {
    await decline.first().click().catch(() => {});
    await page.waitForTimeout(300);
  }
}

const shots = [
  {
    name: "1-homepage-hero",
    async run(page) {
      await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
      await dismissCookieBanner(page);
      // reduced-motion makes AnimatedPlaceholder settle on the first full
      // phrase ("Master of Data Science") instead of mid-typewriter.
      await page.waitForTimeout(400);
    },
  },
  {
    name: "2-universities-filtered",
    async run(page) {
      await page.goto(`${BASE_URL}/universities`, { waitUntil: "networkidle" });
      await dismissCookieBanner(page);
      // the three filter <select>s have no accessible label; state is the first
      await page.locator("select").nth(0).selectOption({ label: "Victoria" });
      await page.getByRole("button", { name: "A$30k to 45k" }).click();
      await page.waitForTimeout(300);
      // frame the filter panel + first result cards, not the long intro copy
      await anchorTop(page, page.getByRole("button", { name: "Group of Eight" }), 190);
    },
  },
  {
    name: "3-university-profile",
    async run(page) {
      await page.goto(`${BASE_URL}/universities/monash-university`, { waitUntil: "networkidle" });
      await dismissCookieBanner(page);
      // keep the name + status stamp in frame above the fact grid
      await anchorTop(page, page.getByRole("heading", { level: 1, name: "Monash University" }), 130);
    },
  },
  {
    name: "4-points-calculator",
    async run(page) {
      await page.goto(`${BASE_URL}/visas/points-calculator`, { waitUntil: "networkidle" });
      await dismissCookieBanner(page);
      // a realistic 65-point profile
      await page.getByRole("combobox", { name: /age at invitation/i }).selectOption({ label: "25 to 32 (30 pts)" });
      await page.getByRole("combobox", { name: /english level/i }).selectOption({ label: "Proficient (10 pts)" });
      await page.getByRole("combobox", { name: /skilled employment outside australia/i }).selectOption({ label: "5 to 7 years (10 pts)" });
      await page.getByRole("combobox", { name: /highest qualification/i }).selectOption({ label: "Bachelor or Master degree (15 pts)" });
      await page.waitForTimeout(300);
      // top of the form: the four answered fields carry point values, which
      // reads as "in use" better than the run of unanswered 0-pt fields lower down
      await anchorTop(page, page.getByRole("heading", { level: 1 }), 150);
    },
  },
  {
    name: "5-deadlines",
    async run(page) {
      await page.goto(`${BASE_URL}/deadlines`, { waitUntil: "networkidle" });
      await dismissCookieBanner(page);
      // skip the intro; frame the filter bar + a run of deadline rows
      await anchorTop(page, page.getByRole("button", { name: "Filter" }), 110);
    },
  },
  {
    name: "6-visas-hub",
    async run(page) {
      await page.goto(`${BASE_URL}/visas`, { waitUntil: "networkidle" });
      await dismissCookieBanner(page);
      await anchorTop(page, page.getByRole("heading", { name: "The study-to-PR pathway" }), 130);
    },
  },
];

const main = async () => {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2, // retina-sharp PNGs
    colorScheme: "light",
    reducedMotion: "reduce",
  });
  const page = await context.newPage();

  for (const shot of shots) {
    process.stdout.write(`  ${shot.name} … `);
    try {
      await shot.run(page);
      await page.screenshot({ path: join(OUT_DIR, `${shot.name}.png`) });
      console.log("ok");
    } catch (err) {
      console.log(`FAILED — ${err.message}`);
    }
  }

  await browser.close();
  console.log(`\nDone. Files in ${OUT_DIR}`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
