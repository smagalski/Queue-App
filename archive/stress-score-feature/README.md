# Stress Score feature (removed 2026-08-27)

This archive preserves the "Stress Score" feature that was removed from Queue on
2026-08-27, in case it's re-implemented later. Categories and the end-of-day /
history category time breakdown were kept — only the stress score computation,
settings tab, and UI badges were removed.

## What it did

A 1–10 score shown in the End Day modal and on each Day History card, computed
from three weighted factors (adjustable in Settings → Stress Score):
- **Hours worked** — total weighted time spent on tasks that day
- **Task volume** — number of tasks completed (categories can be excluded from
  counting, and everything filed under the catch-all "Other" category was
  down-weighted to 0.3x)
- **Urgency** — proportion of Urgent/High priority tasks

Per-user weights (`STRESS_DEFAULTS = { hours: 6, volume: 2, urgency: 1 }`) and
excluded-category set were stored in localStorage (`q_stress_weights_${uid}`,
`q_stress_excluded_cats_${uid}`), not Firestore. The computed score itself
*was* written to Firestore on the day's history doc (`stressScore` field).

## Files in this archive

- `constants.stress.js` — `STRESS_DEFAULTS`
- `categories.stress.js` — weight/exclusion getters+setters, `_renderStressCatList`,
  `onStressSlider`, `resetStressWeights`, `_recomputeStressScore` (all originally
  in `public/js/categories.js`)
- `endday.stress.js` — `stressColor`, `stressLabel`, the stress-computation block
  from `computeDayReport()`, the `.edm-stress` markup from `openEndDayModal()`,
  the live-recompute-on-drag bit in `hdcDrop()`, and the `.hdc-stress` badge in
  `renderHistoryDay()` (all originally in `public/js/endday.js`)
- `wrapup.stress.js` — the stress bits of `_recomputeWrapUpReport()` and the
  `stressScore` field written in `commitWrapUp()` (originally in `public/js/wrapup.js`)
- `firebase.stress.js` — the `tab === 'stress'` branch of `switchSettingsTab()`
  (originally in `public/js/firebase.js`)
- `html.stress.snippet.html` — the "Stress Score" settings sidebar tab button +
  panel markup (was identical in both `public/index.html` and `public/mobile.html`)
- `css.stress.css` — every stress-related CSS rule from `public/css/app.css`
  (includes an already-dead standalone `.stress-overlay`/`.stress-modal` set
  that predates the settings-panel version — harmless to drop if not reused)

## Re-integration notes

- `history/{date}` Firestore docs from before the removal still have a
  `stressScore` field sitting in old data — harmless, just unused now.
- `getCategoryForTask` (still in `categories.js`) is what `_recomputeStressScore`
  and the wrap-up/end-day stress blocks used to classify tasks — that function
  was NOT removed, only its stress-specific callers were.
- Settings tab wiring: re-add `stab-stress` button + `settingsPanel-stress` div,
  the `tab === 'stress'` branch in `switchSettingsTab()`, and re-export
  `onStressCatToggle`, `onStressSlider`, `resetStressWeights` from `main.js`'s
  imports/`Object.assign(window, …)` block.
