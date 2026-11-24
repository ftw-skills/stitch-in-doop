import { mkdir, readFile, writeFile } from 'node:fs/promises';

const dist = new URL('./dist/', import.meta.url);
await mkdir(dist, { recursive: true });
for (const id of ['dashboard', 'history', 'automations']) {
  const html = await readFile(new URL('./pages/' + id + '.html', import.meta.url), 'utf8');
  const destination = new URL(id === 'dashboard' ? 'index.html' : id + '.html', dist);
  await writeFile(destination, html.replaceAll('data-local-href="dashboard.html"', 'data-local-href="index.html"'));
}
