// Stress-related pieces originally in public/js/wrapup.js.

// commitWrapUp() wrote this field into the history doc payload (removed):
//   stressScore: report.stressScore,

// Original _recomputeWrapUpReport(doneTasks, catOverrides) — `timePerTask` and
// `priorityBreakdown` computation were KEPT (in a simplified form that no
// longer needs `catOverrides` or `getCategoryForTask`); this is the full
// original for reference:

function _recomputeWrapUpReport(doneTasks, catOverrides) {
  const rules      = state.categoryRules.length ? state.categoryRules : DEFAULT_CATEGORY_RULES;
  const otherCatId = rules[rules.length - 1].id;
  const nonBreak   = doneTasks.filter(t => !t.isBreak);
  const timeMap = {};
  let urgencyRaw = 0, sTotal = 0, workMins = 0;
  const pCount = { 1: 0, 2: 0, 3: 0, 4: 0 };
  for (const t of nonBreak) {
    const catId = catOverrides[t.title] || getCategoryForTask(t.title, {}, t.id, t.categoryOverride);
    const w = catId === otherCatId ? 0.3 : 1.0;
    let mins = 0;
    if (t.startTime && t.endTime) mins = parseDateLocalMins(t.endTime) - parseDateLocalMins(t.startTime);
    else mins = t.duration || 0;
    if (mins > 0) { timeMap[t.title || 'Untitled'] = (timeMap[t.title || 'Untitled'] || 0) + mins; }
    sTotal += w; workMins += mins * w;
    if (t.priority === 1 || t.priority === 2) urgencyRaw += w;
    if (t.priority && pCount[t.priority] !== undefined) pCount[t.priority]++;
  }
  const timePerTask = Object.entries(timeMap).map(([title, mins]) => ({ title, mins })).sort((a, b) => b.mins - a.mins);
  const priorityBreakdown = { urgent: pCount[1], high: pCount[2], medium: pCount[3], low: pCount[4], total: nonBreak.length };
  const hoursNorm   = (Math.min(Math.max(workMins / 60, 4), 12) - 4) / 8;
  const volumeNorm  = (Math.min(Math.max(sTotal, 3), 20) - 3) / 17;
  const urgencyNorm = Math.min(urgencyRaw, 10) / 10;
  const stressScore = Math.min(Math.max(Math.round((3 * hoursNorm + volumeNorm + 0.5 * urgencyNorm) / 4.5 * 10), 1), 10);
  return { timePerTask, priorityBreakdown, stressScore };
}
