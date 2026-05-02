"""
Lingua - AI Translation App
Flask backend using Qwen2-0.5B local model via HuggingFace transformers.
"""

from flask import Flask, request, jsonify, render_template
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
import re

app = Flask(__name__)

# ── Model Setup ──────────────────────────────────────────────────────────────
MODEL_NAME = "Qwen/Qwen2-0.5B"
print(f"Loading model: {MODEL_NAME}…")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    torch_dtype=torch.float32,
    trust_remote_code=True
)
model.eval()
print("Model ready.")

# ── Language config ───────────────────────────────────────────────────────────
LANG_NAMES = {
    "en": "English",
    "es": "Spanish",
    "ko": "Korean",
    "fr": "French",
    "de": "German",
    "ja": "Japanese",
    "zh": "Chinese",
    "pt": "Portuguese",
    "it": "Italian",
    "ru": "Russian",
}

def clean_output(text: str, prompt: str) -> str:
    """Strip prompt echo, explanations, and keep only the first translated sentence."""

    # 1. Remove the prompt itself if the model echoed it back
    if prompt in text:
        text = text[text.index(prompt) + len(prompt):]

    # 2. Remove common preamble phrases the model likes to add
    preambles = [
        r"^(Translation|Translated text|Output|Answer|Result)\s*:\s*",
        r"^Sure[,!]?\s*",
        r"^Here('s| is) the translation\s*[:\-]?\s*",
    ]
    for p in preambles:
        text = re.sub(p, "", text, flags=re.IGNORECASE)

    # 3. Cut everything after "Explanation", "Note", "In this", etc.
    #    This is the main fix — Qwen-0.5B always appends an explanation.
    explanation_markers = [
        r"\s*Explanation\s*:.*",
        r"\s*Note\s*:.*",
        r"\s*Translation note.*",
        r"\s*In (this|the) (case|sentence|context|example).*",
        r"\s*This (means|translates|is).*",
        r"\s*The (given|above|original|sentence|phrase|word).*",
        r"\s*\(.*\).*",          # anything in parentheses and beyond
    ]
    for p in explanation_markers:
        text = re.sub(p, "", text, flags=re.IGNORECASE | re.DOTALL)

    # 4. Keep only the first non-empty line
    #    If the translation is clean it's one line; if not, the explanation
    #    starts on line 2+.
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    text = lines[0] if lines else ""

    # 5. If there are multiple sentences, keep only the first one.
    #    Real translations of short inputs are one sentence.
    #    Split on  .  !  ?  — but keep the punctuation attached.
    first_sentence = re.split(r'(?<=[.!?])\s+', text)
    text = first_sentence[0] if first_sentence else text

    return text.strip().strip('"\'')

def build_prompt(text: str, src_lang: str, tgt_lang: str) -> str:
    """
    Minimal, direct prompt.

    Why simpler is better for Qwen2-0.5B:
    - Few-shot examples backfire on tiny models: they pattern-match the example
      output instead of translating the actual input. "¿Qué hora es?" became
      "Qué hora está?" because the model blended example structure with wrong verb.
    - Long system prompts ("professional translator", "idiomatic") consume tokens
      the model uses for the actual translation, degrading output quality.
    - Direct format  `{src}: {text}\n{tgt}:` is the clearest signal for the model.
    """
    src = LANG_NAMES.get(src_lang, src_lang)
    tgt = LANG_NAMES.get(tgt_lang, tgt_lang)
    return (
        f"Translate the following text from {src} to {tgt}.\n"
        f"Output ONLY the translation. No explanations. No extra text.\n\n"
        f"{src}: {text}\n"
        f"{tgt}:"
    )

# ── Routes ────────────────────────────────────────────────────────────────────
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/translate", methods=["POST"])
def translate():
    data = request.get_json(force=True)
    text     = data.get("text", "").strip()
    src_lang = data.get("source", "en")
    tgt_lang = data.get("target", "es")

    if not text:
        return jsonify({"error": "No text provided."}), 400
    if src_lang == tgt_lang:
        return jsonify({"translation": text, "status": "ok"})

    prompt = build_prompt(text, src_lang, tgt_lang)

    inputs = tokenizer(prompt, return_tensors="pt")
    try:
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=128,
                do_sample=False,
                # FIX: temperature removed — invalid when do_sample=False
                # in transformers >=4.45 it raises ValueError → HTTP 500
                repetition_penalty=1.3,
                pad_token_id=tokenizer.eos_token_id,
            )
    except Exception as e:
        return jsonify({"error": f"Model inference failed: {str(e)}"}), 500

    # Decode only the newly generated tokens
    generated = tokenizer.decode(
        outputs[0][inputs["input_ids"].shape[1]:],
        skip_special_tokens=True
    )
    translation = clean_output(generated, prompt)

    if not translation:
        return jsonify({"error": "Model returned an empty translation. Please try again."}), 500

    return jsonify({"translation": translation, "status": "ok"})

if __name__ == "__main__":
    app.run(debug=True, port=5000)