# Vitalline — Movement as Medicine

A single-page health & wellness website that connects common medical conditions to the exercise that helps them, with a live AI health console as its centerpiece.
<img width="334" height="334" alt="image" src="https://github.com/user-attachments/assets/c965d390-2d9d-4de1-99fa-684ac07daf4c" />
<img width="368" height="331" alt="image" src="https://github.com/user-attachments/assets/7238148b-f236-4693-b7dd-08dcdc97ca9e" />
<img width="921" height="347" alt="image" src="https://github.com/user-attachments/assets/80afc6e8-abe1-4359-af8f-8c0b9839576b" />

![type](https://img.shields.io/badge/type-static%20site%20%2B%20serverless-1C6E5C)
![stack](https://img.shields.io/badge/stack-HTML%20%2F%20CSS%20%2F%20JS%20%2F%20Vercel-4A5FE8)

**Built by Utkrisht Verma** · [GitHub](https://github.com/utkrishtverma111-hash)

<!-- Add 1-2 screenshots here once deployed, e.g.: -->
<!-- ![Vitalline hero screenshot](./screenshots/hero.png) -->

## What it does

- **AI Health Console (hero)** — A live chat interface styled like a heart-monitor readout, embedded on the homepage. Ask it about a condition, symptom, or goal and it responds in real time.
- **Full-Screen Chat (`chat.html`)** — A dedicated, distraction-free chat page (linked from the nav as "Full Chat") for longer conversations — single chat window, no sidebar, with a persistent urgent-care banner and a "General information, not a diagnosis" badge. Uses the same `/api/chat` backend and grounding as the hero console.
- **Condition Library** — Eight featured conditions (Type 2 Diabetes, Hypertension, Coronary Heart Disease, Osteoarthritis, Weight Management, Anxiety & Depression, Osteoporosis, Asthma & COPD), each expandable to show recommended exercises, the mechanism of benefit, and safety cautions.
- **Why Movement Works** — Five exercise categories (cardio, strength, flexibility, mind-body, low-impact) mapped to what each one does physiologically.
- **Goal Finder** — Pick a goal (heart health, joint & bone health, weight management, mental wellbeing) and get a simple weekly routine.
- **Blog** — Short, plain-language articles on the research behind exercise and health.
- Clear medical disclaimer throughout — this is an educational resource, not a substitute for professional care.

## Tech stack

- Plain **HTML, CSS, and vanilla JavaScript** on the frontend — no framework, no build step.
- Fonts from Google Fonts: **Fraunces** (display), **IBM Plex Sans** (body), **IBM Plex Mono** (data/labels).
- A single **Vercel serverless function** (`/api/chat.js`) that calls the Anthropic API and keeps the API key server-side, so it's never exposed in the browser.
- A curated **diseases.json** reference dataset (`data/diseases.json`, 80 common conditions, each with symptoms, causes, honest curability, treatment approaches, lifestyle advice, and cautions) that the function searches before every AI call, grounding answers in verified data instead of relying purely on the model's own training — a lightweight retrieval-augmented generation (RAG) setup with no vector database required.

## How the AI grounding works

1. The browser sends the user's message to `/api/chat`.
2. The serverless function scans `data/diseases.json` for entries whose `aliases` (keywords) appear in the message, and takes the top 3 matches.
3. If matches are found, their symptoms, causes, treatment categories, and cautions are inserted into the system prompt as "reference data" the model is told to prefer over its own knowledge.
4. The AI's reply is returned along with which dataset entries (if any) it was grounded in — shown to the user as a small "Grounded in: ..." tag under the response, so the source of the information is transparent.
5. If nothing in the dataset matches, the AI falls back to general knowledge with the same safety-conscious system prompt (no dosages, defer emergencies to real medical help, etc.).

To add a new condition to what the AI can ground its answers in, add an entry to `data/diseases.json` (copy the shape of any existing entry; put everyday phrasings in `aliases`, since matching is whole-word and case-insensitive) — no code changes needed, no retraining, no redeployment beyond the normal git push.

## Project structure

```
vitalline/
├── vitalline.html      # main site UI (rename to index.html for root routing)
├── chat.html            # dedicated full-screen chat page
├── api/
│   └── chat.js         # serverless function — retrieves relevant data + calls Anthropic
├── data/
│   └── diseases.json   # curated disease reference dataset used to ground AI answers
├── .env.example        # template for the required environment variable
├── .gitignore
└── README.md
```

## Running it locally

You'll need [Node.js](https://nodejs.org) and the Vercel CLI to run the serverless function locally (the AI console won't work with a plain double-click open, since it needs `/api/chat` to exist).

```bash
git clone https://github.com/utkrishtverma111-hash/Health-care-.git
cd Health-care-

npm install -g vercel        # if you don't have it already
cp .env.example .env.local   # then paste your real Anthropic API key into .env.local

vercel dev
```

This starts a local server (usually `http://localhost:3000`) with both the static site and the `/api/chat` function running together.

> If you just want to preview the visual design without the AI console working, you can still open `vitalline.html` directly in a browser — every other section works with no backend at all.

## Deploying to Vercel

1. Push this repo to GitHub (already done ✅).
2. Go to [vercel.com/new](https://vercel.com/new) and import the `Health-care-` repository.
3. In **Project Settings → Environment Variables**, add:
   - `ANTHROPIC_API_KEY` = your real Anthropic API key
4. Deploy. Vercel automatically detects `api/chat.js` as a serverless function — no extra config needed.
5. Once live, the AI console will call your own `/api/chat` endpoint, keeping the key private.

## Customizing

- **Add a condition** — add an entry to the `conditions` array in the `<script>` block of `vitalline.html` (name, sub, icon SVG, exercises, benefit, caution). It renders automatically.
- **Add a blog post** — add an entry to the `articles` array the same way (title, date, icon, excerpt, body).
- **Add a goal** — add a key to the `goals` object with `frequency`, `exercises`, and `watch` arrays.
- **Change the palette** — everything is driven by CSS custom properties at the top of the `<style>` block (`--bg`, `--ink`, `--teal`, `--coral`, `--sage`, `--pulse`).

## Roadmap

- [ ] Contact form
- [ ] More conditions in the library
- [ ] Custom domain

## Disclaimer

This project is an educational resource. It does not provide medical advice, diagnosis, or treatment, and is not a substitute for consultation with a licensed healthcare professional.

## License

MIT — feel free to fork, adapt, and reuse.
