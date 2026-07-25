export interface Pack {
	id?: string;
	title?: string;
	status?: string;
	blocker?: string;
	blockedBy?: string;
	next?: string;
	owner?: string;
	due?: string;
	doneWhen?: string;
	purpose?: string;
	energy?: string;
	pinned?: boolean;
	activity?: string[];
}

export interface Receipt {
	summary?: string;
	tone?: string;
}

export const SERVER_PACK_ACTIONS = new Set(['start', 'unblock', 'block', 'done', 'open']);
export const STATE_FILTERS = ['all', 'active', 'blocked', 'draft', 'done', 'review'] as const;
export const VALID_PACK_STATUSES = new Set(['active', 'blocked', 'draft', 'done']);
export const DEMO_BLOCKER_NONE = 'none';

export const ACTION_LABELS: Record<string, string> = {
	start: 'Start', unblock: 'Unblock', block: 'Block', done: 'Done', open: 'Open',
};

export const NEXT_ACTIONS = ['Open', 'Start', 'Block', 'Done', 'Review', 'Focus'];
