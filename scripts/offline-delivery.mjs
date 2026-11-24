import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { lstat, mkdir, mkdtemp, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { unzipSync, zipSync } from 'fflate';
import { projectManifest, readJson } from './project-files.mjs';

const [folder] = process.argv.slice(2);
assert.ok(folder && process.argv.length === 3, 'Usage: node scripts/offline-delivery.mjs PROJECT_DIR');
const project = resolve(folder);
const { slug, flows } = await readJson(join(project, 'offline.json'));
const { devices } = await projectManifest(project, 'pages', 'pages.json');
assert.match(slug ?? '', /^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'offline.json requires a lowercase ZIP slug');
assert.ok(Array.isArray(flows) && flows.length, 'offline.json requires at least one flow');
const covered = new Set();
for (const flow of flows) {
  assert.ok(Array.isArray(flow.devices) && flow.devices.length, 'Each flow needs device names');
  assert.ok(Array.isArray(flow.steps) && flow.steps[0]?.path === 'index.html' &&
    !flow.steps[0].click && !flow.steps[0].reload, 'Every flow must open the ZIP root index.html');
  for (const [index, step] of flow.steps.entries()) {
    assert.ok(typeof step.path === 'string' && step.path, 'Each step needs an expected path');
    if (index) {
      assert.ok(Boolean(step.click) !== (step.reload === true), 'After entry specify a click selector or reload');
    }
  }
  for (const name of flow.devices) {
    assert.ok(devices.some(device => device.name === name), 'Unknown offline device: ' + name);
    covered.add(name);
  }
}
assert.deepEqual([...covered].sort(), devices.map(device => device.name).sort(), 'Offline flows must cover every device');

function inTree(root, path) {
  const rel = relative(root, path);
  return rel !== '' && rel !== '..' && !rel.startsWith('../') && !rel.startsWith('..\\') && !isAbsolute(rel);
}

async function collect(root, prefix = '', files = Object.create(null)) {
  const entries = await readdir(join(root, prefix), { withFileTypes: true });
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
    const name = prefix + entry.name;
    assert.ok(!/[\\:]/.test(entry.name), 'Unsupported ZIP path: ' + name);
    if (entry.isDirectory()) await collect(root, name + '/', files);
    else {
      assert.ok(entry.isFile(), 'dist/ must contain regular files: ' + name);
      files[name] = await readFile(join(root, name));
    }
  }
  return files;
}

const dist = join(project, 'dist');
assert.ok((await lstat(dist)).isDirectory(), 'dist/ must be a project directory');
const files = await collect(dist);
assert.ok(files['index.html']?.length, 'Build dist/index.html before running offline delivery');
const zip = zipSync(files, { level: 6 });
const extract = await mkdtemp(join(tmpdir(), 'stitch-offline-'));
assert.ok(inTree(resolve(tmpdir()), extract), 'Unexpected temporary extraction path');
const require = createRequire(import.meta.url);
const results = [];
try {
  for (const [name, content] of Object.entries(unzipSync(zip))) {
    const destination = resolve(extract, name);
    assert.ok(inTree(extract, destination), 'ZIP entry outside its root: ' + name);
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, content);
  }

  const { chromium } = require(process.env.STITCH_PLAYWRIGHT_MODULE || 'playwright');
  const browser = await chromium.launch({ channel: process.env.STITCH_CHROME_CHANNEL || 'chrome' });
  const rootUrl = pathToFileURL(extract + '/');
  try {
    for (const [index, flow] of flows.entries()) {
      for (const name of flow.devices) {
        const { width, height } = devices.find(device => device.name === name);
        const context = await browser.newContext({ offline: true, viewport: { width, height } });
        try {
          const page = await context.newPage();
          page.setDefaultTimeout(8000);
          const requests = [];
          const errors = [];
          page.on('request', request => {
            const url = new URL(request.url());
            if (url.protocol === 'file:' && inTree(extract, fileURLToPath(url))) return;
            if (!['data:', 'blob:', 'about:'].includes(url.protocol)) requests.push(request.url());
          });
          page.on('requestfailed', request => errors.push(request.url()));
          page.on('pageerror', error => errors.push(error.message));
          const states = [];
          for (const [position, step] of flow.steps.entries()) {
            const target = new URL(step.path, rootUrl);
            assert.ok(target.protocol === 'file:' && inTree(extract, fileURLToPath(target)),
              'Expected path must stay inside the ZIP: ' + step.path);
            if (!position) await page.goto(target.href);
            else if (step.reload) await page.reload();
            else await page.locator(step.click).click();
            await page.waitForURL(target.href);
            if (step.visible) await page.locator(step.visible).waitFor({ state: 'visible' });
            const observed = await page.evaluate(async () => {
              await document.fonts.ready;
              const images = [...document.images];
              await Promise.all(images.map(image => image.decode()));
              return {
                lang: document.documentElement.lang,
                images: images.map(image => [image.naturalWidth, image.naturalHeight]),
                overflow: document.documentElement.scrollWidth - innerWidth,
              };
            });
            assert.ok(observed.overflow <= 1, name + ': horizontal overflow at ' + step.path);
            if (step.lang !== undefined) assert.equal(observed.lang, step.lang, name + ': language at ' + step.path);
            if (step.images !== undefined) assert.equal(observed.images.length, step.images, name + ': images at ' + step.path);
            states.push({ path: step.path, ...observed });
          }
          assert.deepEqual(requests, [], name + ': requests outside the extracted package');
          assert.deepEqual(errors, [], name + ': missing resources or browser errors');
          results.push({ flow: index + 1, device: name, viewport: [width, height], states, requests, errors });
        } finally {
          await context.close();
        }
      }
    }
  } finally {
    await browser.close();
  }
} finally {
  await rm(extract, { recursive: true, force: true });
}

const archive = slug + '.zip';
const report = {
  passed: true,
  archive,
  sha256: createHash('sha256').update(zip).digest('hex'),
  files: Object.keys(files).length,
  results,
};
await mkdir(join(project, 'reports'), { recursive: true });
for (const [name, content] of [[archive, zip], ['reports/offline-acceptance.json', JSON.stringify(report, null, 2) + '\n']]) {
  const target = join(project, name);
  const pending = target + '.' + randomUUID() + '.tmp';
  try {
    await writeFile(pending, content, { flag: 'wx' });
    await rename(pending, target);
  } finally {
    await rm(pending, { force: true });
  }
}
console.log(JSON.stringify({ passed: true, archive, files: report.files, flows: results.length, sha256: report.sha256 }));
