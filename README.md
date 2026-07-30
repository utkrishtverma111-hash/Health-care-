<<<<<<< HEAD
# Vitalline — Movement as Medicine

A single-page health & wellness website that connects common medical conditions to the exercise that helps them, with a live AI health console as its centerpiece.
<img width="334" height="334" alt="image" src="https://github.com/user-attachments/assets/c965d390-2d9d-4de1-99fa-684ac07daf4c" />
<img width="368" height="331" alt="image" src="https://github.com/user-attachments/assets/7238148b-f236-4693-b7dd-08dcdc97ca9e" />
<img width="921" height="347" alt="image" src="https://github.com/user-attachments/assets/80afc6e8-abe1-4359-af8f-8c0b9839576b" />

![type](https://img.shields.io/badge/type-static%20website-1C6E5C)
![stack](https://img.shields.io/badge/stack-HTML%20%2F%20CSS%20%2F%20JS-4A5FE8)

## What it does

- **AI Health Console (hero)** — A live chat interface styled like a heart-monitor readout. Ask it about a condition, symptom, or goal and it responds in real time via the Anthropic API, explaining which exercise helps, why, and what to watch out for.
- **Condition Library** — Eight common conditions (Type 2 Diabetes, Hypertension, Coronary Heart Disease, Osteoarthritis, Weight Management, Anxiety & Depression, Osteoporosis, Asthma & COPD), each expandable to show recommended exercises, the mechanism of benefit, and safety cautions.
- **Why Movement Works** — Five exercise categories (cardio, strength, flexibility, mind-body, low-impact) mapped to what each one does physiologically.
- **Goal Finder** — Pick a goal (heart health, joint & bone health, weight management, mental wellbeing) and get a simple weekly routine.
- Clear medical disclaimer throughout — this is an educational resource, not a substitute for professional care.

## Tech stack

- Plain **HTML, CSS, and vanilla JavaScript** — no build step, no framework, no dependencies to install.
- Fonts loaded from Google Fonts: **Fraunces** (display), **IBM Plex Sans** (body), **IBM Plex Mono** (data/labels).
- The AI console calls the **Anthropic Messages API** (`api.anthropic.com/v1/messages`) directly from the browser.

## Running it locally

No build tools required. Just open the file in a browser:

```bash
git clone https://github.com/your-username/vitalline.git
cd vitalline
open vitalline.html   # macOS
# or just double-click vitalline.html in your file explorer
```

For the AI console to work outside of an environment that already proxies the request, you'll need to either:
1. Route the fetch call through your own backend that attaches an Anthropic API key (recommended — never expose an API key in client-side JS), or
2. Swap the `fetch` call in the `sendConsole()` function for whatever LLM endpoint you're using.

## File structure

```
vitalline/
├── vitalline.html   # entire site — HTML, CSS, and JS in one file
└── README.md
```

## Customizing

- **Add a condition** — add an entry to the `conditions` array in the `<script>` block (name, sub, icon SVG, exercises, benefit, caution). It will render automatically.
- **Add a goal** — add a key to the `goals` object with `frequency`, `exercises`, and `watch` arrays.
- **Change the palette** — everything is driven by CSS custom properties at the top of the `<style>` block (`--bg`, `--ink`, `--teal`, `--coral`, `--sage`, `--pulse`).

## Disclaimer

This project is an educational resource. It does not provide medical advice, diagnosis, or treatment, and is not a substitute for consultation with a licensed healthcare professional.

## License

MIT — feel free to fork, adapt, and reuse.
=======
# Health-care-
>>>>>>> bb51a30c675bbff823b2a186200a97be21522c47
