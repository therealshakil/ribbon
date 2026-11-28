import { execFileSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// Spec 003 T029 (on demand: `pnpm test:e2e:mirror`): the screens on a mirror build, seeded by the
// real longshelf CLI with the licence-free test library.
const ROOT = join(import.meta.dirname, '../../../..');
const LIBRARY = join(ROOT, 'packages/sync-cli/test/fixtures/library');

test.describe.configure({ mode: 'serial' });

test.beforeAll(() => {
	const url = test.info().project.use.baseURL!;
	const out = execFileSync(
		process.execPath,
		[join(ROOT, 'packages/sync-cli/src/main.ts'), 'library', '--library', LIBRARY, '--yes'],
		{
			encoding: 'utf8',
			env: {
				...process.env,
				XDG_CONFIG_HOME: mkdtempSync(join(tmpdir(), 'longshelf-e2e-')),
				LONGSHELF_URL: url,
				LONGSHELF_CLIENT_ID: 'local',
				LONGSHELF_CLIENT_SECRET: 'local'
			}
		}
	);
	expect(out).toMatch(/6 books in Calibre/);
});

const axe = async (page: import('@playwright/test').Page) =>
	(
		await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
			.analyze()
	).violations.map((v) => `${v.id} (${v.nodes.length})`);

test('Library lists the uploaded books with covers', async ({ page }) => {
	await page.goto('/library?tab=all');
	for (const title of ['Dracula', 'Middlemarch', 'Paradise Lost', 'The King in Yellow'])
		await expect(page.getByRole('link', { name: title, exact: true })).toBeVisible();
	const cover = page.locator('img[src^="/api/covers/"]').first();
	await expect(cover).toBeVisible();
	expect(await cover.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
	expect(await axe(page)).toEqual([]);
});

test('a book page lists its files, and a file saves under its title', async ({ page }) => {
	await page.goto('/library?tab=all');
	await page.getByRole('link', { name: 'The King in Yellow', exact: true }).click();
	const pdf = page.getByRole('link', { name: 'PDF' });
	await expect(pdf).toBeVisible();
	const [download] = await Promise.all([page.waitForEvent('download'), pdf.click()]);
	expect(download.suggestedFilename()).toBe('The King in Yellow - Robert W. Chambers.pdf');
	expect(await axe(page)).toEqual([]);
});

test('the reader opens a mirrored EPUB', async ({ page }) => {
	await page.goto('/library?tab=all');
	await page.getByRole('link', { name: 'Dracula', exact: true }).click();
	const file = page.waitForResponse((r) => r.url().includes('/api/files/') && r.ok());
	await page.getByRole('link', { name: /Start reading|Continue reading/ }).click();
	await file;
	await expect(page).toHaveURL(/\/read\//);
	await expect(page.getByText('Dracula').first()).toBeVisible();
});

test('the news issue shows its own cover on Home', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByText('The Evening Courier, Sat, 14 Nov 2026')).toBeAttached();
	await expect(page.locator('.issues img[src^="/api/covers/"]')).toBeVisible();
});

test('after a first visit, the app reopens offline with the covers it has seen (SC-007)', async ({
	page,
	context
}) => {
	await page.goto('/library?tab=all');
	await page.evaluate(() => navigator.serviceWorker.ready);
	// The first load installs the worker; the second is served through it and fills the caches.
	await page.reload({ waitUntil: 'networkidle' });
	await expect(page.locator('img[src^="/api/covers/"]').first()).toBeVisible();
	await page.close();

	// Reopen like an installed app: a new tab, offline. The app's own code must come from the
	// service worker, not from a browser cache that a real reopen wouldn't have.
	await context.setOffline(true);
	const reopened = await context.newPage();
	const fromWorker: boolean[] = [];
	reopened.on('response', (r) => {
		if (r.url().includes('/_app/immutable/')) fromWorker.push(r.fromServiceWorker());
	});
	await reopened.goto('/library?tab=all');
	await expect(reopened.getByRole('heading', { name: 'Library', level: 1 })).toBeVisible();
	expect(fromWorker.length).toBeGreaterThan(0);
	expect(fromWorker.every(Boolean)).toBe(true);
	const cover = reopened.locator('img[src^="/api/covers/"]').first();
	await expect
		.poll(() => cover.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth))
		.toBeGreaterThan(0);
	await expect(reopened.getByRole('banner').getByText('Offline')).toBeVisible();
	await context.setOffline(false);
});

// The app starts with no connection, and on a signal so weak nothing answers, at any address: a
// relative asset path once left deeper pages blank, and unanswered requests once held every page.
test('the app starts offline and on a weak signal, at any page', async ({ page, context }) => {
	test.setTimeout(120_000);
	await page.goto('/library?tab=all');
	await page.evaluate(() => navigator.serviceWorker.ready);
	await page.reload();
	await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
	const book = (await page
		.getByRole('link', { name: 'Dracula', exact: true })
		.first()
		.getAttribute('href'))!;
	await page.goto(book);
	await expect(page.getByRole('heading', { name: 'Dracula' })).toBeVisible();
	await page.close();

	const opens = async (path: string) => {
		const p = await context.newPage();
		await p.goto(path, { waitUntil: 'commit' });
		await expect(p.getByRole('navigation', { name: 'Main' })).toBeVisible({ timeout: 15_000 });
		await p.close();
	};
	await context.setOffline(true);
	for (const path of ['/', '/library?tab=all', book]) await opens(path);
	await context.setOffline(false);

	// Every request hangs, the service worker's too (PW_EXPERIMENTAL_SERVICE_WORKER_NETWORK_EVENTS).
	await context.route('**/*', () => {});
	for (const path of ['/', book]) await opens(path);
});
