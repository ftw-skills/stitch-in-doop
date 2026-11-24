import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [extracted] = process.argv.slice(2);
assert.ok(extracted, 'Usage: node verify-offline.mjs EXTRACTED_ZIP_DIR');
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.STITCH_PLAYWRIGHT_MODULE || 'playwright');
const manifest = JSON.parse(await readFile(new URL('./pages.json', import.meta.url), 'utf8'));
const entry = pathToFileURL(resolve(extracted, 'index.html')).href;
const browser = await chromium.launch({ channel: process.env.STITCH_CHROME_CHANNEL || 'chrome' });
const results = [];

try {
  for (const device of manifest.devices) {
    const context = await browser.newContext({
      offline: true,
      viewport: { width: device.width, height: device.height },
    });
    try {
      const page = await context.newPage();
      const requests = [];
      const errors = [];
      page.on('request', request => {
        if (!request.url().startsWith('file:')) requests.push(request.url());
      });
      page.on('requestfailed', request => errors.push(request.url()));
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(entry);
      const observed = [];
      for (const [index, expected] of device.expectedRoute.entries()) {
        const expectedFile = expected === 'en' ? 'index.html' : 'pages/zh.html';
        assert.equal(page.url(), pathToFileURL(resolve(extracted, expectedFile)).href);
        const state = await page.evaluate(async () => {
          await document.fonts.ready;
          const photos = [...document.images];
          await Promise.all(photos.map(photo => photo.decode()));
          return {
            locale: document.documentElement.lang,
            headingSize: parseFloat(getComputedStyle(document.querySelector('h1')).fontSize),
            photos: photos.map(photo => [photo.naturalWidth, photo.naturalHeight]),
            overflow: document.documentElement.scrollWidth - innerWidth,
          };
        });
        assert.equal(state.locale, expected === 'en' ? 'en' : 'zh-CN');
        assert.equal(state.photos.length, 3);
        assert.ok(state.photos.every(([width, height]) => width > 0 && height > 0));
        assert.equal(state.overflow, 0);
        observed.push({ path: expectedFile, ...state });
        if (index < device.expectedRoute.length - 1) {
          const destination = device.expectedRoute[index + 1];
          const target = pathToFileURL(resolve(extracted, destination === 'en' ? 'index.html' : 'pages/zh.html')).href;
          await Promise.all([
            page.waitForURL(target),
            page.locator('[data-route-key]').click(),
          ]);
        }
      }
      assert.deepEqual(requests, [], device.name + ' external requests');
      assert.deepEqual(errors, [], device.name + ' resource errors');
      results.push({ device: device.name, width: device.width, height: device.height, observed, requests, errors });
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}
console.log(JSON.stringify({ passed: true, devices: results }, null, 2));
