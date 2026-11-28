import { library, LIBRARY_MODE } from '#lib/library/index.ts';
import type { LayoutLoad } from './$types';

/**
 * A deployment renders in the browser only (spec 003 research R3): the Worker never parses the
 * catalogue. The sample build keeps server rendering.
 */
export const ssr = LIBRARY_MODE !== 'mirror';

/**
 * Whether AI features show at all (FR-016). Off when switched off or not available here, and
 * when offline or slow: every page waits on this, so it never holds a page up for long.
 */
async function aiEnabled(f: typeof fetch): Promise<boolean> {
	if (typeof navigator !== 'undefined' && !navigator.onLine) return false;
	try {
		const r = await f('/api/ai/usage', { signal: AbortSignal.timeout(3000) });
		return r.ok && ((await r.json()) as { enabled: boolean }).enabled;
	} catch {
		return false;
	}
}

export const load: LayoutLoad = async ({ fetch }) => {
	const [sync, ai] = await Promise.all([library.syncStatus(), aiEnabled(fetch)]);
	return { sync, ai };
};
