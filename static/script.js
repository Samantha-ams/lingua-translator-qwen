/**
 * Lingua GitHub Pages demo.
 * Static-only version: GitHub Pages cannot run Flask/Python, so this keeps
 * the UI usable with deterministic sample translations in the browser.
 */
const state = {
  source: 'en',
  target: 'es',
  loading: false,
};

const LANG_NAMES = {
  en: 'English', es: 'Spanish', ko: 'Korean',
  fr: 'French', ja: 'Japanese', de: 'German',
};

const API_LANG_CODES = {
  en: 'en',
  es: 'es',
  ko: 'ko',
  fr: 'fr',
  ja: 'ja',
  de: 'de',
};

const DEMO_TRANSLATIONS = {
  'en:es': {
    hello: 'hola',
    'good morning': 'buenos dias',
    'thank you': 'gracias',
    'how are you?': 'como estas?',
    'what time is it?': '¿Qué hora es?',
    'i like soccer': 'me gusta el futbol',
    'i like soccer.': 'me gusta el futbol.',
    'i play soccer': 'juego futbol',
    'i love soccer': 'me encanta el futbol',
    'i love learning languages': 'me encanta aprender idiomas',
  },
  'es:en': {
    hola: 'hello',
    gracias: 'thank you',
    'buenos dias': 'good morning',
    'como estas?': 'how are you?',
    '¿qué hora es?': 'what time is it?',
    'que hora es?': 'what time is it?',
    'me gusta el futbol': 'i like soccer',
    'me gusta el futbol.': 'i like soccer.',
    'juego futbol': 'i play soccer',
    'me encanta el futbol': 'i love soccer',
    'me encanta aprender idiomas': 'i love learning languages',
  },
  'en:fr': { hello: 'bonjour', 'thank you': 'merci', 'good morning': 'bonjour' },
  'fr:en': { bonjour: 'hello', merci: 'thank you' },
  'en:de': { hello: 'hallo', 'thank you': 'danke', 'good morning': 'guten morgen' },
  'de:en': { hallo: 'hello', danke: 'thank you', 'guten morgen': 'good morning' },
  'en:ja': { hello: 'こんにちは', 'thank you': 'ありがとう', 'good morning': 'おはようございます' },
  'ja:en': { 'こんにちは': 'hello', 'ありがとう': 'thank you', 'おはようございます': 'good morning' },
  'en:ko': { hello: '안녕하세요', 'thank you': '감사합니다', 'good morning': '좋은 아침입니다' },
  'ko:en': { '안녕하세요': 'hello', '감사합니다': 'thank you', '좋은 아침입니다': 'good morning' },
};

const inputEl = document.getElementById('input-text');
const charCountEl = document.getElementById('char-count');
const translateBtn = document.getElementById('translate-btn');
const clearBtn = document.getElementById('clear-btn');
const copyBtn = document.getElementById('copy-btn');
const swapBtn = document.getElementById('swap-btn');
const sourceBadge = document.getElementById('source-badge');
const targetBadge = document.getElementById('target-badge');
const outputEmpty = document.getElementById('output-empty');
const outputResult = document.getElementById('output-result');
const outputError = document.getElementById('output-error');
const resultOriginal = document.getElementById('result-original');
const resultTranslated = document.getElementById('result-translated');
const errorMessage = document.getElementById('error-message');

document.querySelectorAll('.pill').forEach(pill => {
  pill.addEventListener('click', () => {
    const group = pill.dataset.group;
    const lang = pill.dataset.lang;

    document.querySelectorAll(`.pill[data-group="${group}"]`).forEach(p => {
      p.classList.remove('active');
    });
    pill.classList.add('active');

    state[group] = lang;
    if (group === 'source') sourceBadge.textContent = LANG_NAMES[lang] ?? lang;
    else targetBadge.textContent = LANG_NAMES[lang] ?? lang;
    highlightConflict();
  });
});

function highlightConflict() {
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('conflict'));
  if (state.source === state.target) {
    document.querySelectorAll('.pill.active').forEach(p => p.classList.add('conflict'));
  }
}

swapBtn.addEventListener('click', () => {
  const prevSource = state.source;
  const prevTarget = state.target;
  state.source = prevTarget;
  state.target = prevSource;

  document.querySelectorAll('.pill').forEach(pill => {
    pill.classList.toggle('active', state[pill.dataset.group] === pill.dataset.lang);
  });

  sourceBadge.textContent = LANG_NAMES[state.source] ?? state.source;
  targetBadge.textContent = LANG_NAMES[state.target] ?? state.target;
  highlightConflict();

  if (!outputResult.hidden && resultTranslated.textContent) {
    inputEl.value = resultTranslated.textContent;
    updateCharCount();
    showEmpty();
  }
});

function updateCharCount() {
  const len = inputEl.value.length;
  charCountEl.textContent = len;
  const el = charCountEl.parentElement;
  el.classList.remove('near-limit', 'at-limit');
  if (len >= 1000) el.classList.add('at-limit');
  else if (len >= 800) el.classList.add('near-limit');
}
inputEl.addEventListener('input', updateCharCount);
inputEl.addEventListener('input', () => {
  inputEl.style.height = 'auto';
  inputEl.style.height = `${inputEl.scrollHeight}px`;
});

translateBtn.addEventListener('click', doTranslate);
inputEl.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') doTranslate();
});

async function doTranslate() {
  const text = inputEl.value.trim();
  if (!text || state.loading) return;
  if (state.source === state.target) {
    showResult(text, text);
    return;
  }

  setLoading(true);
  showEmpty();

  try {
    const translation = await translateText(text, state.source, state.target);
    showResult(text, translation);
  } catch (err) {
    showError(err.message || 'Translation failed. Please try again.');
  } finally {
    setLoading(false);
  }
}

async function translateText(text, source, target) {
  const local = localTranslate(text, source, target);
  if (local) return local;

  const sourceCode = API_LANG_CODES[source];
  const targetCode = API_LANG_CODES[target];
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceCode}|${targetCode}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Translation service unavailable.');

  const data = await res.json();
  const translated = data?.responseData?.translatedText?.trim();
  if (translated) return translated;

  return simpleFallback(text, source, target);
}

function localTranslate(text, source, target) {
  const dictionary = DEMO_TRANSLATIONS[`${source}:${target}`] || {};
  const exact = dictionary[text.toLowerCase()];
  if (exact) return preserveCapitalization(text, exact);

  return '';
}

function simpleFallback(text, source, target) {
  const words = DEMO_TRANSLATIONS[`${source}:${target}`] || {};
  const translated = text.replace(/[A-Za-z]+(?:'[A-Za-z]+)?/g, word => {
    return words[word.toLowerCase()] || word;
  });

  return translated === text
    ? `Translation unavailable for this phrase. Try another sentence.`
    : translated;
}

function preserveCapitalization(input, output) {
  return input[0] === input[0]?.toUpperCase()
    ? output.charAt(0).toUpperCase() + output.slice(1)
    : output;
}

function setLoading(on) {
  state.loading = on;
  translateBtn.classList.toggle('loading', on);
  translateBtn.disabled = on;
}

function showEmpty() {
  outputEmpty.hidden = false;
  outputResult.hidden = true;
  outputError.hidden = true;
  copyBtn.disabled = true;
}

function showResult(original, translation) {
  resultOriginal.textContent = original;
  resultTranslated.textContent = translation;
  outputEmpty.hidden = true;
  outputResult.hidden = false;
  outputError.hidden = true;
  copyBtn.disabled = false;
}

function showError(msg) {
  errorMessage.textContent = msg;
  outputEmpty.hidden = true;
  outputResult.hidden = true;
  outputError.hidden = false;
  copyBtn.disabled = true;
}

clearBtn.addEventListener('click', () => {
  inputEl.value = '';
  inputEl.style.height = 'auto';
  updateCharCount();
  showEmpty();
  inputEl.focus();
});

copyBtn.addEventListener('click', async () => {
  const text = resultTranslated.textContent;
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
    copyBtn.classList.add('copied');
    copyBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
    setTimeout(() => {
      copyBtn.classList.remove('copied');
      copyBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
    }, 1800);
  } catch {
    showError('Copy failed. Select the translation manually.');
  }
});

sourceBadge.textContent = LANG_NAMES[state.source];
targetBadge.textContent = LANG_NAMES[state.target];
updateCharCount();
