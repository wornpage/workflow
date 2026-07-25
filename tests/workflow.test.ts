import { describe, test, expect } from 'bun:test';
import { hasBlocker, isMissingNextAction, isReview, primaryCommand, workTitle } from '../src/workflow';
import { orderPacks, filterPacks, buildStandupText, dueUrgency } from '../src/workflow';
import type { Pack } from '../src/types';

const mkPack = (overrides: Partial<Pack> = {}): Pack => ({
	id: 'p1', title: 'Test pack', status: 'active', blocker: 'none', next: 'Open', owner: 'me', ...overrides,
});

describe('hasBlocker', () => {
	test('none means not blocked', () => expect(hasBlocker(mkPack())).toBe(false));
	test('empty means not blocked', () => expect(hasBlocker(mkPack({ blocker: '' }))).toBe(false));
	test('text means blocked', () => expect(hasBlocker(mkPack({ blocker: 'waiting on review' }))).toBe(true));
});

describe('isMissingNextAction', () => {
	test('Open means has next', () => expect(isMissingNextAction(mkPack())).toBe(false));
	test('empty means missing', () => expect(isMissingNextAction(mkPack({ next: '' }))).toBe(true));
	test('unknown value means missing', () => expect(isMissingNextAction(mkPack({ next: 'Foo' }))).toBe(true));
});

describe('isReview', () => {
	test('blocked pack needs review', () => expect(isReview(mkPack({ blocker: 'blocked' }))).toBe(true));
	test('done pack does not need review', () => expect(isReview(mkPack({ status: 'done' }))).toBe(false));
	test('active with next does not need review', () => expect(isReview(mkPack())).toBe(false));
	test('missing owner needs review', () => expect(isReview(mkPack({ owner: '' }))).toBe(true));
});

describe('primaryCommand', () => {
	test('blocked shows clear blocker', () => {
		const cmd = primaryCommand(mkPack({ blocker: 'blocked' }));
		expect(cmd.label).toBe('Clear blocker');
	});
	test('done shows reopen', () => {
		const cmd = primaryCommand(mkPack({ status: 'done' }));
		expect(cmd.label).toBe('Reopen');
	});
	test('active with Open shows Open', () => {
		const cmd = primaryCommand(mkPack());
		expect(cmd.label).toBe('Open');
	});
});

describe('dueUrgency', () => {
	test('no due returns empty', () => expect(dueUrgency()).toBe(''));
	test('past date is overdue', () => expect(dueUrgency('2020-01-01')).toBe('overdue'));
});

describe('orderPacks', () => {
	test('blocked packs come first', () => {
		const packs = [
			mkPack({ id: 'a', title: 'A', blocker: 'none' }),
			mkPack({ id: 'b', title: 'B', blocker: 'blocked' }),
		];
		const ordered = orderPacks(packs);
		expect(ordered[0].title).toBe('B');
	});
});

describe('filterPacks', () => {
	test('all returns everything', () => {
		expect(filterPacks([mkPack(), mkPack({ id: 'b' })], 'all').length).toBe(2);
	});
	test('review returns only review-needing', () => {
		expect(filterPacks([mkPack(), mkPack({ blocker: 'blocked' })], 'review').length).toBe(1);
	});
	test('query filters by title', () => {
		expect(filterPacks([mkPack({ title: 'Lighting' }), mkPack({ title: 'Other' })], 'all', 'light').length).toBe(1);
	});
});

describe('buildStandupText', () => {
	test('all clear when empty', () => expect(buildStandupText([])).toBe('All clear'));
	test('counts review items', () => expect(buildStandupText([mkPack({ blocker: 'blocked' })])).toContain('needs review'));
});
