# Lingua — AI Translator

A beautiful, interactive translator web app powered by **Qwen2-0.5B** running fully locally.

## Project structure

```
translator_app/
├── app.py                 # Flask backend + model inference
├── requirements.txt
├── templates/
│   └── index.html         # Single-page UI
└── static/
    ├── styles.css         # Full design system
    └── script.js          # All interactivity (no framework)
```

## Setup

```bash
pip install -r requirements.txt
python app.py
```

Open http://localhost:5000

## Supported languages
English · Spanish · Korean · French · Japanese · German

## Key features
- Language pill buttons (no dropdowns)
- ⇅ Swap languages (also swaps input text)
- Character counter with colour warnings
- Spinner loading state on translate button
- Formatted output: original + styled translation block
- One-click copy with checkmark confirmation
- Clear button
- Ctrl/Cmd + Enter shortcut to translate
- Conflict highlight when source == target
- Responsive (mobile-first)
