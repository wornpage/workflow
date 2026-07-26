# @wornpage/workflow

The pack state machine — the blocker / next-action / done-when triad, plus
filtering, ordering and label derivation. Pure TypeScript, zero dependencies,
no Svelte required.

21 tests.

## Install

```bash
bun add @wornpage/workflow
```

## The model

A `Pack` is one unit of work. Three fields carry the workflow:

- **`blocker`** — free text. The string `'none'` (`DEMO_BLOCKER_NONE`) means
  unblocked. There is no boolean; the blocker *is* the text.
- **`next`** — the single next action. Missing means the work has stalled.
- **`doneWhen`** — the proof target that closes the item.

```ts
import {
  hasBlocker, isMissingNextAction, isReview,
  primaryCommand, orderPacks, filterPacks, buildStandupText,
  DEMO_BLOCKER_NONE, STATE_FILTERS
} from '@wornpage/workflow';

const pack = { id: 'lights', title: 'lighting-checklist', blocker: 'none', next: 'Open' };

hasBlocker(pack);              // false
isMissingNextAction(pack);     // false
primaryCommand(pack);          // { label, action, shortcut }
```

## Exports

| Function | Description |
|----------|-------------|
| `workTitle(pack)` | Display title, de-slugified |
| `hasBlocker(pack)` | Whether `blocker` is set to anything but `'none'` |
| `isMissingNextAction(pack)` | Whether the work has stalled |
| `isReview(pack)` | Whether the pack needs a decision |
| `blockerText(pack)` | Human-readable blocker line |
| `dueUrgency(due)` | Urgency bucket for a due date |
| `dueDateLabel(due)` | Human-readable due date |
| `primaryCommand(pack)` | The one action to offer: `{ label, action, shortcut }` |
| `workflowLabel(pack)` | `{ label, help }` for the current state |
| `workflowCardClass(pack, selected?, recentlyUnblocked?)` | Card class string |
| `orderPacks(packs)` | Canonical ordering |
| `filterPacks(packs, filter, query?)` | Filter by `STATE_FILTERS` plus optional search |
| `buildStandupText(packs)` | One-line standup summary |

| Constant | Value |
|----------|-------|
| `DEMO_BLOCKER_NONE` | `'none'` |
| `STATE_FILTERS` | `all`, `active`, `blocked`, `draft`, `done`, `review` |
| `VALID_PACK_STATUSES` | `active`, `blocked`, `draft`, `done` |
| `SERVER_PACK_ACTIONS` | `start`, `unblock`, `block`, `done`, `open` |
| `NEXT_ACTIONS` | `Open`, `Start`, `Block`, `Done`, `Review`, `Focus` |

Types `Pack` and `Receipt` are exported.

## Building

This package ships TypeScript source. Consumers resolving the `svelte`
export condition (Vite, SvelteKit) read `src/` directly. For plain node or bun
resolution, build the bundle first:

```bash
bun run build
```

## Tests

```bash
bun test
```

## License

MIT
