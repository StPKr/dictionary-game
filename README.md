# dictionary-game

A tiny **German learning game** (German → Bulgarian) built with:

- **Server**: Node + Express + TypeScript
- **Client**: React + TypeScript (Vite)

## Run locally

From the repo root:

```bash
npm install
npm run dev
```

This starts a **single dev server** (Express + Vite middleware).  
Watch the terminal output for the URL, e.g. `http://localhost:5173` (or another free port).

## DeepL setup (Option A)

This project fetches a random German word from Wiktionary and uses **DeepL** to translate it:

- **Hint**: German → English
- **Answer**: German → Bulgarian

Create `server/.env` (see `server/.env.example`) and set:

- **`DEEPL_AUTH_KEY`**: your DeepL API key (free plan works)

## How to play

- The app shows a **German word**
- Type the **Bulgarian translation**
- Click **Hint (English)** to reveal the English translation
- If correct: German + English + Bulgarian are shown, then click **Next word**
- If wrong: an error message appears and you can try again

## Add more words

Words are fetched from Wiktionary, translated via DeepL.