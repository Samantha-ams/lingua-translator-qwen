# Lingua — Local AI Translator

A clean, interactive web translator powered by **Qwen2-0.5B**, running fully locally.
Focused on user experience, responsiveness, and lightweight AI integration.

---

## 🚀 Preview

*(Add a screenshot or GIF here if possible)*

---

## 🧠 Tech Stack

* Python (Flask)
* HuggingFace Transformers
* Qwen2-0.5B (local LLM)
* HTML, CSS, JavaScript (vanilla)

---

## 📁 Project Structure

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

---

## ⚙️ Setup

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Run the app:

```bash
python app.py
```

3. Open in your browser:

```
http://localhost:5000
```

---

## 🌍 Supported Languages

English · Spanish · Korean · French · Japanese · German

---

## ✨ Key Features

* Language pill buttons (no dropdowns)
* ⇅ Swap languages (also swaps input text)
* Character counter with visual warnings
* Loading spinner during translation
* Clean output display (original + translation)
* One-click copy with confirmation
* Clear input button
* Ctrl/Cmd + Enter shortcut
* Conflict detection (same source & target)
* Fully responsive (mobile-first)

---

## ⚠️ Notes

This app uses a lightweight local model (**Qwen2-0.5B**), so translations may not always be perfect.
The main focus of this project is **UI/UX design and local AI integration**, not translation accuracy.

---

## 💡 Future Improvements

* Better translation model integration
* Streaming responses
* Language auto-detection
* Translation history

