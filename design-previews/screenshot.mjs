import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';

const pages = [
  'direction-a-cinematic',
  'direction-b-bento-glass',
  'direction-c-bold',
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1080 }, deviceScaleFactor: 1.5 });

for (const name of pages) {
  const page = await ctx.newPage();
  await page.goto(`file:///home/user/SoloWay/design-previews/${name}.html`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);
  await page.screenshot({ path: `/home/user/SoloWay/design-previews/${name}.png` });
  console.log(`captured ${name}.png`);
  await page.close();
}

await browser.close();
