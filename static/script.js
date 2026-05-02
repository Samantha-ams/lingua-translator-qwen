/**
 * Lingua — script.js
 * Handles: language selection, swap, translate API call,
 *          character counter, copy, clear, all UI state.
 */

// ── State ─────────────────────────────────────────────────────────────────────
const state = {
  source: 'en',
  target: 'es',
  loading: false,
};

// Lang display names (mirrors backend LANG_NAMES)
const LANG_NAMES = {
  en: 'English', es: 'Spanish', ko: 'Korean',
  fr: 'French',  ja: 'Japanese', de: 'German',
};

// ── DOM refs ──────────────────────────────────────────────────────────────────
const inputEl       = document.getElementById('input-text');
const charCountEl   = document.getElementById('char-count');
const translateBtn  = document.getElementById('translate-btn');
const clearBtn      = document.getElementById('clear-btn');
const copyBtn       = document.getElementById('copy-btn');
const swapBtn       = document.getElementById('swap-btn');
const sourceBadge   = document.getElementById('source-badge');
const targetBadge   = document.getElementById('target-badge');
const outputEmpty   = document.getElementById('output-empty');
const outputResult  = document.getElementById('output-result');
const outputError   = document.getElementById('output-error');
const resultOriginal    = document.getElementById('result-original');
const resultTranslated  = document.getElementById('result-translated');
const errorMessage  = document.getElementById('error-message');

// ── Pill selection ────────────────────────────────────────────────────────────
document.querySelectorAll('.pill').forEach(pill => {
  pill.addEventListener('click', () => {
    const group = pill.dataset.group;   // 'source' | 'target'
    const lang  = pill.dataset.lang;

    // Deselect all pills in the same group
    document.querySelectorAll(`.pill[data-group="${group}"]`).forEach(p => {
      p.classList.remove('active');
    });
    pill.classList.add('active');

    // Update state
    state[group] = lang;

    // Sync badges
    if (group === 'source') sourceBadge.textContent = LANG_NAMES[lang] ?? lang;
    else                    targetBadge.textContent = LANG_NAMES[lang] ?? lang;

    // Highlight conflict: same lang on both sides
    highlightConflict();
  });
});

function highlightConflict() {
  // Remove all conflict classes first
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('conflict'));

  if (state.source === state.target) {
    // Mark both active pills as conflicting
    document.querySelectorAll('.pill.active').forEach(p => p.classList.add('conflict'));
  }
}

// ── Swap languages ────────────────────────────────────────────────────────────
swapBtn.addEventListener('click', () => {
  const prevSource = state.source;
  const prevTarget = state.target;

  // Flip state
  state.source = prevTarget;
  state.target = prevSource;

  // Re-render pill selection
  document.querySelectorAll('.pill').forEach(pill => {
    const group = pill.dataset.group;
    const lang  = pill.dataset.lang;
    pill.classList.toggle('active', state[group] === lang);
  });

  // Sync badges
  sourceBadge.textContent = LANG_NAMES[state.source] ?? state.source;
  targetBadge.textContent = LANG_NAMES[state.target] ?? state.target;

  highlightConflict();

  // Also swap current output <-> input if a result exists
  if (!outputResult.hidden && resultTranslated.textContent) {
    const translated = resultTranslated.textContent;
    const original   = inputEl.value;
    inputEl.value = translated;
    updateCharCount();
    // Clear output so user re-translates with swapped context
    showEmpty();
  }
});

// ── Character counter ─────────────────────────────────────────────────────────
function updateCharCount() {
  const len = inputEl.value.length;
  charCountEl.textContent = len;

  const el = charCountEl.parentElement;
  el.classList.remove('near-limit', 'at-limit');
  if (len >= 1000)      el.classList.add('at-limit');
  else if (len >= 800)  el.classList.add('near-limit');
}
inputEl.addEventListener('input', updateCharCount);

// Auto-resize textarea height
inputEl.addEventListener('input', () => {
  inputEl.style.height = 'auto';
  inputEl.style.height = `${inputEl.scrollHeight}px`;
});

// ── Translate ─────────────────────────────────────────────────────────────────
translateBtn.addEventListener('click', doTranslate);

// Allow Ctrl/Cmd + Enter to translate
inputEl.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') doTranslate();
});

async function doTranslate() {
  const text = inputEl.value.trim();
  if (!text || state.loading) return;

  setLoading(true);
  showEmpty(); // 👈 evita estados mezclados

  try {
    const res = await fetch('/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        source: state.source,
        target: state.target,
      }),
    });

    const data = await res.json();

    // 👇 NO uses res.ok como bloqueo principal
    if (!data.translation) {
      throw new Error(data.error || 'No translation returned');
    }

    showResult(text, data.translation);

  } catch (err) {
    showError(err.message || 'Translation failed. Please try again.');
  } finally {
    setLoading(false);
  }
}

// ── UI state helpers ──────────────────────────────────────────────────────────
function setLoading(on) {
  state.loading = on;
  translateBtn.classList.toggle('loading', on);
  translateBtn.disabled = on;
}

function showEmpty() {
  outputEmpty.hidden  = false;
  outputResult.hidden = true;
  outputError.hidden  = true;
  copyBtn.disabled    = true;
}

function showResult(original, translation) {
  resultOriginal.textContent   = original;
  resultTranslated.textContent = translation;

  outputEmpty.hidden  = true;
  outputResult.hidden = false;
  outputError.hidden  = true;
  copyBtn.disabled    = false;

  // Re-trigger animation by forcing reflow
  outputResult.querySelectorAll('.result-block').forEach(b => {
    b.style.animation = 'none';
    void b.offsetHeight;
    b.style.animation = '';
  });
}

function showError(msg) {
  errorMessage.textContent = msg;
  outputEmpty.hidden  = true;
  outputResult.hidden = true;
  outputError.hidden  = false;
  copyBtn.disabled    = true;
}

// ── Clear input ───────────────────────────────────────────────────────────────
clearBtn.addEventListener('click', () => {
  inputEl.value = '';
  inputEl.style.height = 'auto';
  updateCharCount();
  showEmpty();
  inputEl.focus();
});

// ── Copy translation ──────────────────────────────────────────────────────────
copyBtn.addEventListener('click', async () => {
  const text = resultTranslated.textContent;
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
    // Visual confirmation
    copyBtn.classList.add('copied');
    // Temporarily swap icon to checkmark
    copyBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
           stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>`;
    setTimeout(() => {
      copyBtn.classList.remove('copied');
      copyBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>`;
    }, 1800);
  } catch {
    // Fallback for non-secure contexts
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
});

// ── Init ──────────────────────────────────────────────────────────────────────
// Set badges from initial state
sourceBadge.textContent = LANG_NAMES[state.source];
targetBadge.textContent = LANG_NAMES[state.target];
updateCharCount();
