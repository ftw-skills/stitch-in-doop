import { copyFile, cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const project = fileURLToPath(new URL('./', import.meta.url));
const dist = resolve(process.argv[2] ?? resolve(project, 'dist'));
const source = path => resolve(project, path);
const output = path => resolve(dist, path);

for (const directory of ['pages', 'css', 'asset/raw']) {
  await mkdir(output(directory), { recursive: true });
}

await copyFile(source('style/page-typography.css'), output('css/page-typography.css'));
await cp(source('asset/raw/photos'), output('asset/raw/photos'), { recursive: true });

const english = await readFile(source('pages/en.html'), 'utf8');
const chinese = await readFile(source('pages/zh.html'), 'utf8');
await writeFile(output('index.html'), english
  .replace('../style/page-typography.css', 'css/page-typography.css')
  .replace('href="zh.html"', 'href="pages/zh.html"')
  .replaceAll('../asset/raw/', 'asset/raw/'), 'utf8');
await writeFile(output('pages/zh.html'), chinese
  .replace('../style/page-typography.css', '../css/page-typography.css')
  .replace('href="en.html"', 'href="../index.html"'), 'utf8');
