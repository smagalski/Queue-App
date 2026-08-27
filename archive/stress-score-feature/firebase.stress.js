// Originally in public/js/firebase.js
// Needs: import { getStressWeights, _renderStressCatList } from './categories.js';

// switchSettingsTab(tab) had this branch (in addition to the 'categories',
// 'account', 'about' branches, which were kept):

/*
  } else if (tab === 'stress') {
    const w = getStressWeights();
    ['hours', 'volume', 'urgency'].forEach(k => {
      const key = k.charAt(0).toUpperCase() + k.slice(1);
      document.getElementById('stressSlider' + key).value = w[k];
      document.getElementById('stressVal'    + key).textContent = w[k];
    });
    _renderStressCatList();
  }
*/
