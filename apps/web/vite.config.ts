import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import adapter from '@sveltejs/adapter-cloudflare';
import { sveltekit } from '@sveltejs/kit/vite';
import { accessEnv } from '@longshelf/sync-cli/config';
import { localCalibre } from './scripts/local-calibre.ts';

// Unit tests never open remote connections: they stay fast and need no credentials.
const remoteBindings = !process.env.VITEST;

// Remote bindings (Workers AI in dev) pass Cloudflare Access with the same service token the
// longshelf CLI uses (spec 003 research R5), unless the caller already set one.
if (remoteBindings) Object.assign(process.env, accessEnv());

// `mirror` for a deployment (`pnpm run deploy`); the sample library otherwise, so e2e keeps its
// fixed data (spec 003).
const libraryMode = process.env.LONGSHELF_LIBRARY === 'mirror' ? 'mirror' : 'sample';

export default defineConfig({
	define: { __LIBRARY_MODE__: JSON.stringify(libraryMode) },
	plugins: [
		localCalibre(),
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter({ platformProxy: { remoteBindings } }),
			// Offline, every page is answered with the cached start page. Relative asset paths in it
			// ("./_app/…") would resolve under the deeper address and leave a blank screen.
			paths: { relative: false }
		})
	],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}', 'tests/unit/**/*.test.ts'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
