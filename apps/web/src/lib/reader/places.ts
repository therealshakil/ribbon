/**
 * Places from other devices (spec 004 US2): reading them from the mirror, joining them with
 * this device's place, and choosing where a book opens (FR-009, research R6).
 */
import type { ReadingPosition } from '@longshelf/shared/library';
import { ProgressGetSchema, type Place } from '@longshelf/shared/progress';
import type { SavedPlace } from './settings.ts';

export const THIS_DEVICE = 'this-device';

/** A mirror row as a position, under its device id. */
export const fromPlace = (p: Place): ReadingPosition => ({
	bookId: p.bookId,
	source: p.deviceId,
	deviceName: p.deviceName,
	percent: p.percent,
	chapterLabel: p.chapterLabel,
	href: p.href,
	fraction: p.fraction,
	...(p.cfi ? { cfi: p.cfi } : {}),
	...(p.fileSha256 ? { fileSha256: p.fileSha256 } : {}),
	readAt: p.readAt,
	furthestHref: p.furthestHref,
	furthestPercent: p.furthestPercent
});

/** This device's saved place as a position. */
export const fromSaved = (bookId: string, s: SavedPlace): ReadingPosition => ({
	bookId,
	source: THIS_DEVICE,
	percent: s.percent,
	chapterLabel: s.chapterLabel,
	href: s.href,
	fraction: 0,
	...(s.cfi ? { cfi: s.cfi } : {}),
	...(s.fileSha256 ? { fileSha256: s.fileSha256 } : {}),
	readAt: s.readAt,
	furthestHref: s.furthestHref,
	furthestPercent: Math.max(s.furthestPercent, s.percent)
});

/**
 * A book's positions: this device first (its local place, or its mirror row if storage was
 * cleared), then other devices, most recently read first.
 */
export function mergePositions(
	bookId: string,
	rows: Place[],
	local: SavedPlace | null,
	deviceId: string
): ReadingPosition[] {
	const mine = rows.filter((r) => r.bookId === bookId);
	const own = mine.find((r) => r.deviceId === deviceId);
	const others = mine
		.filter((r) => r.deviceId !== deviceId)
		.map(fromPlace)
		.sort((a, b) => b.readAt.localeCompare(a.readAt));
	const here = local
		? fromSaved(bookId, local)
		: own
			? { ...fromPlace(own), source: THIS_DEVICE }
			: null;
	return here ? [here, ...others] : others;
}

/** Where the reader starts for a position: the CFI on the same file, else chapter, else percent. */
export interface Start {
	cfi?: string;
	href?: string;
	/** Through the whole book, 0–1. */
	fraction?: number;
}

export function startAt(p: ReadingPosition, fileSha256?: string): Start {
	if (p.cfi && fileSha256 && p.fileSha256 === fileSha256) return { cfi: p.cfi };
	return { ...(p.href ? { href: p.href } : {}), fraction: p.percent / 100 };
}

export type OpenChoice = { kind: 'here' } | { kind: 'adopt'; from: ReadingPosition };

/**
 * FR-009 (owner, 2026-11-27): the most recently read place wins, by when it was read, never by
 * when it arrived. Open here unless another device read this book more recently. `here` is null
 * when this device has never read the book.
 */
export function chooseOpen(
	here: Pick<SavedPlace, 'readAt'> | null,
	positions: ReadingPosition[]
): OpenChoice {
	const newest = positions
		.filter((p) => p.source !== THIS_DEVICE)
		.reduce<ReadingPosition | null>((a, p) => (!a || p.readAt > a.readAt ? p : a), null);
	if (!newest) return { kind: 'here' };
	if (here && Date.parse(newest.readAt) <= Date.parse(here.readAt)) return { kind: 'here' };
	return { kind: 'adopt', from: newest };
}

/** Below this, a place without a chapter isn't far enough on to be worth offering. */
export const OFFER_MIN_PERCENT = 5;

/** One offer, known by where and when it was read, so it is offered once. */
export const offerKey = (p: Pick<ReadingPosition, 'source' | 'readAt'>) =>
	`${p.source}@${p.readAt}`;

/**
 * FR-009: a place worth offering after opening at `opened`. It must be further on, in a later
 * chapter (or, with no chapter to compare, at least OFFER_MIN_PERCENT further), and not offered
 * before. The furthest such place wins.
 */
export function placeToOffer(
	opened: Pick<ReadingPosition, 'percent' | 'href'>,
	candidates: ReadingPosition[],
	offered: ReadonlySet<string>
): ReadingPosition | undefined {
	return candidates
		.filter(
			(p) =>
				!offered.has(offerKey(p)) &&
				p.percent > opened.percent &&
				(p.href && opened.href
					? p.href !== opened.href
					: p.percent - opened.percent >= OFFER_MIN_PERCENT)
		)
		.reduce<ReadingPosition | undefined>(
			(a, p) => (!a || p.percent > a.percent ? p : a),
			undefined
		);
}

const OFFERED_KEY = 'longshelf.reader.offered.v1';

/** The offers already shown for a book. */
export function loadOffered(bookId: string): Set<string> {
	try {
		const all = JSON.parse(localStorage.getItem(OFFERED_KEY) ?? '{}') as Record<string, string[]>;
		return new Set(Array.isArray(all[bookId]) ? all[bookId] : []);
	} catch {
		return new Set();
	}
}

/** Remember that an offer was shown, so it isn't shown again. */
export function markOffered(bookId: string, key: string): void {
	try {
		const all = JSON.parse(localStorage.getItem(OFFERED_KEY) ?? '{}') as Record<string, string[]>;
		// Only the latest few per book matter: a place offered long ago has been read past.
		all[bookId] = [...new Set([...(all[bookId] ?? []), key])].slice(-10);
		localStorage.setItem(OFFERED_KEY, JSON.stringify(all));
	} catch {
		// Storage unavailable: the offer may show again, which is harmless.
	}
}

/** The place this device keeps when it adopts another device's place: same `readAt`, synced. */
export function adoptedPlace(from: ReadingPosition, fileSha256?: string): SavedPlace {
	const sameFile = !!from.cfi && !!fileSha256 && from.fileSha256 === fileSha256;
	return {
		cfi: sameFile ? from.cfi! : '',
		fraction: from.percent / 100,
		chapterLabel: from.chapterLabel,
		savedAt: from.readAt,
		href: from.href,
		percent: from.percent,
		furthestPercent: Math.max(from.furthestPercent, from.percent),
		furthestHref: from.furthestHref,
		...(sameFile ? { fileSha256 } : {}),
		readAt: from.readAt,
		syncedAt: from.readAt
	};
}

/** The content hash in a mirror file URL (`/api/files/<sha>`), if there is one. */
export const fileShaOf = (url: string | null | undefined) =>
	/\/api\/files\/([0-9a-f]{64})/.exec(url ?? '')?.[1];

/**
 * Every place on the mirror, or null if they can't be read now (offline with no copy, signed
 * out, or a local run with no mirror). The service worker answers offline with its last copy.
 */
export async function fetchPlaces(f: typeof fetch = fetch): Promise<Place[] | null> {
	try {
		// Longer than the service worker's patience, so a saved copy wins when there is one.
		const res = await f('/api/progress', {
			redirect: 'manual',
			signal: AbortSignal.timeout(4000)
		});
		if (!res.ok) return null;
		const parsed = ProgressGetSchema.safeParse(await res.json());
		return parsed.success ? parsed.data.places : null;
	} catch {
		return null;
	}
}
