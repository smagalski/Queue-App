// Stress-related pieces originally in public/js/endday.js.
// These are excerpts with surrounding context noted — not a drop-in file.
// Needs: import { getStressWeights, getStressExcludedCats, _recomputeStressScore } from './categories.js';

// ── Local display helpers ──────────────────────────────────────────────────

function stressColor(score) {
  if (score <= 3) return '#4caf7d';
  if (score <= 6) return '#f0a500';
  return '#ff6b8a';
}

function stressLabel(score) {
  if (score <= 2) return 'Very relaxed day';
  if (score <= 4) return 'Light load';
  if (score <= 6) return 'Moderate';
  if (score <= 8) return 'Demanding day';
  return 'High stress day';
}

// ── computeDayReport() ───────────────────────────────────────────────────
// The full function also computed `timePerTask`, `priorityBreakdown`, and
// `incompleteTasks` which were KEPT — only this block (and the `stressScore`
// key in the returned object) was removed:

/*
  const otherCatId   = state.categoryRules.length ? state.categoryRules[state.categoryRules.length - 1].id : 'other';
  const OTHER_WEIGHT = 0.3;
  const _stressW = t => getCategoryForTask(t.title, {}, t.id, t.categoryOverride) === otherCatId ? OTHER_WEIGHT : 1.0;
  const _stressTimeMap = {};
  let urgencyRaw = 0, sTotal = 0;
  for (const t of nonBreak) {
    const w = _stressW(t);
    sTotal += w;
    if (t.priority === 1 || t.priority === 2) urgencyRaw += w;
    let mins = 0;
    if (t.startTime && t.endTime) mins = parseDateLocalMins(t.endTime) - parseDateLocalMins(t.startTime);
    else mins = t.duration || 0;
    if (mins > 0) _stressTimeMap[t.title || 'Untitled'] = (_stressTimeMap[t.title || 'Untitled'] || 0) + mins * w;
  }
  const urgencyNorm = Math.min(urgencyRaw, 10) / 10;
  const volumeNorm  = (Math.min(Math.max(sTotal, 3), 20) - 3) / 17;
  const workMins    = Object.values(_stressTimeMap).reduce((s, m) => s + m, 0);
  const workHours   = workMins / 60;
  const hoursNorm   = (Math.min(Math.max(workHours, 4), 12) - 4) / 8;
  const rawScore    = (3 * hoursNorm + volumeNorm + 0.5 * urgencyNorm) / 4.5 * 10;
  const stressScore = Math.min(Math.max(Math.round(rawScore), 1), 10);
*/

// ── openEndDayModal() ────────────────────────────────────────────────────
// The edmBody.innerHTML template included this block after the Priority
// Breakdown section (Time Spent / Priority Breakdown sections were KEPT):

/*
    <div class="edm-stress">
      <div class="edm-stress-score" style="color:${col}">${stressScore}</div>
      <div>
        <div class="edm-stress-desc" style="color:${col}">${stressLabel(stressScore)}</div>
        <div class="edm-stress-label">Stress score out of 10 — based on task urgency, volume, and hours worked.</div>
      </div>
    </div>
*/
// where `col = stressColor(stressScore)`, destructured from `report`.

// ── hdcDrop() ────────────────────────────────────────────────────────────
// After re-rendering `.hdc-tasks` on a category drag-drop, this recomputed
// and repainted the stress badge live:

/*
      const newScore = _recomputeStressScore(card._dayData);
      if (newScore != null) {
        const stressEl = card.querySelector('.hdc-stress');
        if (stressEl) {
          const col = stressColor(newScore);
          stressEl.style.background = `${col}22`;
          stressEl.style.color = col;
          stressEl.textContent = `Stress ${newScore}/10 · ${stressLabel(newScore)}`;
        }
      }
*/

// ── renderHistoryDay(day) ────────────────────────────────────────────────
// Computed the badge values (`liveStress`/`displayScore`/`col`/`label`) and
// rendered them into the card header next to the date:

/*
  const liveStress   = _recomputeStressScore(day);
  const displayScore = liveStress ?? day.stressScore ?? 1;
  const col          = stressColor(displayScore);
  const label        = stressLabel(displayScore);
  ...
  <div class="hdc-stress" style="background:${col}22;color:${col}">Stress ${displayScore}/10 · ${label}</div>
*/
