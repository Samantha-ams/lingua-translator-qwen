# Lingua - Local AI Translator

A clean, interactive web translator powered by Qwen2-0.5B, running fully locally. Focused on user experience, responsiveness, and lightweight AI integration.

---

## 🌐 Live Demo

https://samantha-ams.github.io/lingua-translator-qwen/

---

## 📸 Preview

![Preview](image.png)

---

## 🛠 Tech Stack

- Python (Flask)
- HuggingFace Transformers
- Qwen2-0.5B (Local LLM)
- HTML
- CSS
- JavaScript (Vanilla)

---

## 📁 Project Structure

```bash
translator_app/
├── app.py                 # Flask backend + model inference
├── requirements.txt
├── templates/
│   └── index.html         # Single-page UI
└── static/
    ├── styles.css         # Full design system
    └── script.js          # Frontend interactivity
```

---

## ⚙️ Setup

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Run the application

```bash
python app.py
```

### 3. Open in your browser

```txt
http://localhost:5000
```

---

## 🌍 Supported Languages

- English
- Spanish
- Korean
- French
- Japanese
- German

---

## ✨ Key Features

- Language pill buttons (no dropdown menus)
- ⇄ Swap languages with one click
- Input character counter
- Visual warning system
- Loading spinner during translation
- Clean translation output
- Copy-to-clipboard button
- Clear input button
- Ctrl/Cmd + Enter shortcut
- Conflict detection for same-language translation
- Fully responsive design

---

## ⚠️ Notes

This project uses a lightweight local model (**Qwen2-0.5B**), so translation quality may vary depending on the language pair and prompt complexity.

The main focus of this project is:
- UI/UX design
- Local AI integration
- Lightweight deployment
- Interactive frontend experience

---

## 💡 Future Improvements

- Better translation model integration
- Streaming responses
- Automatic language detection
- Translation history
- Dark/light mode toggle
- Docker support

---

## 👩‍💻 Author

Samantha Aislinn Melo Salgado
