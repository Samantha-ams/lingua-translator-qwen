# Lingua â€” Local AI Translator

A clean, interactive web translator powered by **Qwen2-0.5B**, running fully locally.
Focused on user experience, responsiveness, and lightweight AI integration.`r`n`r`n**Live demo:** https://samantha-ams.github.io/lingua-translator-qwen/

---

##  Preview

<img width="1090" height="615" alt="image" src="https://github.com/user-attachments/assets/280fa546-3d14-40ff-97a6-666ebbf2d1b1" />


---

##  Tech Stack

* Python (Flask)
* HuggingFace Transformers
* Qwen2-0.5B (local LLM)
* HTML, CSS, JavaScript (vanilla)

---

## ðŸ“ Project Structure

```
translator_app/
â”œâ”€â”€ app.py                 # Flask backend + model inference
â”œâ”€â”€ requirements.txt
â”œâ”€â”€ templates/
â”‚   â””â”€â”€ index.html         # Single-page UI
â””â”€â”€ static/
    â”œâ”€â”€ styles.css         # Full design system
    â””â”€â”€ script.js          # All interactivity (no framework)
```

---

## âš™ï¸ Setup

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

## ðŸŒ Supported Languages

English Â· Spanish Â· Korean Â· French Â· Japanese Â· German

---

##  Key Features

* Language pill buttons (no dropdowns)
* â‡… Swap languages (also swaps input text)
* Character counter with visual warnings
* Loading spinner during translation
* Clean output display (original + translation)
* One-click copy with confirmation
* Clear input button
* Ctrl/Cmd + Enter shortcut
* Conflict detection (same source & target)
* Fully responsive (mobile-first)

---

## âš ï¸ Notes

This app uses a lightweight local model (**Qwen2-0.5B**), so translations may not always be perfect.
The main focus of this project is **UI/UX design and local AI integration**, not translation accuracy.

---

## ðŸ’¡ Future Improvements

* Better translation model integration
* Streaming responses
* Language auto-detection
* Translation history


