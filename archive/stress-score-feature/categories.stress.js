// Originally in public/js/categories.js
// Needs: import { STRESS_DEFAULTS } from './constants.js';
//        import { state } from './state.js';
//        import { getCategoryForTask } from './categories.js' (same file, kept)
//        import { parseDateLocalMins } from './utils.js';

// ── Stress Score Weights ───────────────────────────────────────────────────

function _stressKey(name) {
  const uid = state.currentUser?.uid;
  return uid ? `q_${name}_${uid}` : `q_${name}`;
}

export function getStressWeights() {
  try {
    const saved = JSON.parse(localStorage.getItem(_stressKey('stress_weights')) || 'null');
    if (saved && typeof saved.hours === 'number') return saved;
  } catch(e) {}
  return { ...STRESS_DEFAULTS };
}

export function getStressExcludedCats() {
  try {
    const saved = JSON.parse(localStorage.getItem(_stressKey('stress_excluded_cats')) || 'null');
    if (Array.isArray(saved)) return new Set(saved);
  } catch(e) {}
  return new Set(); // default: all categories included
}

export function onStressCatToggle(catId, checked) {
  const excluded = getStressExcludedCats();
  if (checked) excluded.delete(catId);
  else excluded.add(catId);
  localStorage.setItem(_stressKey('stress_excluded_cats'), JSON.stringify([...excluded]));
}

export function _renderStressCatList() {
  const excluded = getStressExcludedCats();
  const el = document.getElementById('stressCatList');
  if (!el) return;
  el.innerHTML = state.categoryRules.map(cat => {
    const checked = !excluded.has(cat.id);
    return `<label class="stress-cat-row">
      <input type="checkbox" ${checked ? 'checked' : ''}
        onchange="onStressCatToggle('${cat.id.replace(/'/g,"\\'")}', this.checked)">
      <span>${esc(cat.name)}</span>
    </label>`;
  }).join('');
}

export function onStressSlider(factor, val) {
  const key = factor.charAt(0).toUpperCase() + factor.slice(1);
  document.getElementById('stressVal' + key).textContent = val;
  const w = getStressWeights();
  w[factor] = Number(val);
  localStorage.setItem(_stressKey('stress_weights'), JSON.stringify(w));
}

export function resetStressWeights() {
  localStorage.setItem(_stressKey('stress_weights'), JSON.stringify(STRESS_DEFAULTS));
  localStorage.removeItem(_stressKey('stress_excluded_cats'));
  ['hours', 'volume', 'urgency'].forEach(k => {
    const key = k.charAt(0).toUpperCase() + k.slice(1);
    document.getElementById('stressSlider' + key).value = STRESS_DEFAULTS[k];
    document.getElementById('stressVal'    + key).textContent = STRESS_DEFAULTS[k];
  });
  _renderStressCatList();
}

export function _recomputeStressScore(day) {
  if (!day.doneTasks || !day.doneTasks.length) return null;
  const rules       = state.categoryRules.length ? state.categoryRules : DEFAULT_CATEGORY_RULES;
  const otherCatId  = rules[rules.length - 1].id;
  const overrides   = day.taskCategoryOverrides || {};
  const excluded    = getStressExcludedCats();
  const OTHER_WEIGHT = 0.3;
  const _catOf = t => getCategoryForTask(t.title, overrides, t.title, t.categoryOverride);
  const _stressW = t => _catOf(t) === otherCatId ? OTHER_WEIGHT : 1.0;

  const nonBreak = day.doneTasks.filter(t => !t.isBreak && !excluded.has(_catOf(t)));
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
  const workMins  = Object.values(_stressTimeMap).reduce((s, m) => s + m, 0);
  const workHours = workMins / 60;

  const urgencyNorm = Math.min(urgencyRaw, 10) / 10;
  const volumeNorm  = (Math.min(Math.max(sTotal, 3), 20) - 3) / 17;
  const hoursNorm   = (Math.min(Math.max(workHours, 4), 12) - 4) / 8;
  const sw = getStressWeights();
  const swTotal = (sw.hours + sw.volume + sw.urgency) || 1;
  const raw = (sw.hours * hoursNorm + sw.volume * volumeNorm + sw.urgency * urgencyNorm) / swTotal * 10;
  return Math.min(Math.max(Math.round(raw), 1), 10);
}

// _saveCategoryRules() also used to call _renderStressCatList() after every
// category edit, to keep the "Count Towards Score" checklist in sync:
//
//   function _saveCategoryRules() {
//     save();
//     _renderStressCatList();
//   }
