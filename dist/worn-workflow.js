// src/types.ts
var SERVER_PACK_ACTIONS = new Set(["start", "unblock", "block", "done", "open"]);
var STATE_FILTERS = ["all", "active", "blocked", "draft", "done", "review"];
var VALID_PACK_STATUSES = new Set(["active", "blocked", "draft", "done"]);
var DEMO_BLOCKER_NONE = "none";
var NEXT_ACTIONS = ["Open", "Start", "Block", "Done", "Review", "Focus"];

// src/workflow.ts
function workTitle(pack) {
  return pack?.title || pack?.id || "Untitled";
}
function isMissingNextAction(pack) {
  const next = pack.next?.trim().toLowerCase() || "";
  return !next || !NEXT_ACTIONS.includes(pack.next || "");
}
function hasBlocker(pack) {
  const blocker = pack.blocker?.trim().toLowerCase() || "";
  return Boolean(blocker) && blocker !== DEMO_BLOCKER_NONE;
}
function isReview(pack) {
  if (pack.status === "done" || pack.status === "draft")
    return false;
  if (hasBlocker(pack))
    return true;
  if (isMissingNextAction(pack))
    return true;
  if (!pack.owner?.trim())
    return true;
  if (pack.next?.trim().toLowerCase() === "review")
    return true;
  return false;
}
function blockerText(pack) {
  const b = pack?.blocker || "";
  return b === DEMO_BLOCKER_NONE || !b ? "None" : b;
}
function dueUrgency(due) {
  if (!due)
    return "";
  const now = new Date;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDate = new Date(due);
  const diffDays = Math.round((dueDate.getTime() - today.getTime()) / 86400000);
  if (diffDays < 0)
    return "overdue";
  if (diffDays === 0)
    return "today";
  if (diffDays <= 7)
    return "soon";
  return "later";
}
function dueDateLabel(due) {
  if (!due)
    return "";
  try {
    const d = new Date(due);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return due;
  }
}
function primaryCommand(pack) {
  if (hasBlocker(pack))
    return { label: "Clear blocker", action: "unblock", shortcut: "U" };
  if (isMissingNextAction(pack))
    return { label: "Set next action", action: "open", shortcut: "O" };
  if (pack.status === "done")
    return { label: "Reopen", action: "open", shortcut: "O" };
  if (pack.next === "Block")
    return { label: "Set blocker", action: "block", shortcut: "B" };
  if (pack.next === "Done")
    return { label: "Mark done", action: "done", shortcut: "D" };
  if (pack.next === "Review")
    return { label: "Mark done", action: "done", shortcut: "D" };
  if (pack.next === "Start")
    return { label: "Start", action: "start", shortcut: "S" };
  return { label: pack.next || "Open", action: (pack.next || "open").toLowerCase(), shortcut: "" };
}
function workflowLabel(pack) {
  if (pack.status === "done")
    return { label: "Done", help: "Work is finished" };
  if (hasBlocker(pack))
    return { label: "Blocked", help: "Blocked by " + blockerText(pack) };
  if (isMissingNextAction(pack))
    return { label: "Needs next", help: "No next action set" };
  if (pack.status === "draft")
    return { label: "Draft", help: "Not yet started" };
  return { label: "Active", help: "In progress" };
}
function orderPacks(packs) {
  const rank = (pack) => {
    if (hasBlocker(pack))
      return 0;
    if (isMissingNextAction(pack))
      return 1;
    const urgency = dueUrgency(pack.due);
    if (urgency === "overdue")
      return 2;
    if (urgency === "today")
      return 3;
    if (urgency === "soon")
      return 4;
    return 5;
  };
  return [...packs].sort((a, b) => rank(a) - rank(b));
}
function filterPacks(packs, filter, query) {
  let filtered = packs;
  if (filter === "review")
    filtered = packs.filter((p) => isReview(p));
  else if (filter === "all")
    filtered = packs;
  else if (filter === "active")
    filtered = packs.filter((p) => p.status === "active" && !hasBlocker(p));
  else
    filtered = packs.filter((p) => p.status === filter);
  if (query?.trim()) {
    const q = query.toLowerCase();
    filtered = filtered.filter((p) => p.title?.toLowerCase().includes(q) || "" || (p.owner?.toLowerCase().includes(q) || "") || (p.blocker?.toLowerCase().includes(q) || "") || (p.doneWhen?.toLowerCase().includes(q) || ""));
  }
  return filtered;
}
function workflowCardClass(pack, selected, recentlyUnblocked) {
  const classes = [];
  if (pack.status === "done")
    classes.push("is-done");
  else if (hasBlocker(pack))
    classes.push("is-blocked");
  else if (isMissingNextAction(pack))
    classes.push("is-needs-action");
  else
    classes.push("is-ready");
  if (selected)
    classes.push("selected");
  if (recentlyUnblocked)
    classes.push("demo-just-unblocked");
  return classes.join(" ");
}
function buildStandupText(packs) {
  const reviewCount = packs.filter((p) => isReview(p)).length;
  const doneCount = packs.filter((p) => p.status === "done").length;
  const total = packs.length;
  const parts = [];
  if (reviewCount > 0)
    parts.push(reviewCount + " item" + (reviewCount === 1 ? "" : "s") + " need" + (reviewCount === 1 ? "s" : "") + " review");
  if (doneCount > 0)
    parts.push(doneCount + " done (" + Math.round(doneCount / total * 100) + "%)");
  return parts.join(", ") || "All clear";
}
export {
  workflowLabel,
  workflowCardClass,
  workTitle,
  primaryCommand,
  orderPacks,
  isReview,
  isMissingNextAction,
  hasBlocker,
  filterPacks,
  dueUrgency,
  dueDateLabel,
  buildStandupText,
  blockerText,
  VALID_PACK_STATUSES,
  STATE_FILTERS,
  SERVER_PACK_ACTIONS,
  NEXT_ACTIONS,
  DEMO_BLOCKER_NONE
};
