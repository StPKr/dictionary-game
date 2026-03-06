# dictionary-game

A tiny **German learning game** (German → Bulgarian) built with:

- **Server**: Node + Express + TypeScript
- **Client**: React 18 + TypeScript (Vite)
- **Monorepo**: Unified dev server with Vite middleware

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up DeepL API key
Create `server/.env` with your DeepL API key:
```env
DEEPL_AUTH_KEY=your_deepl_api_key_here
```

Get a free key at [DeepL API](https://www.deepl.com/pro-api) (free tier works great).

### 3. Start the dev server
```bash
npm run dev
```

The server starts at **http://localhost:54001** (or the next available port).

## How to Play

1. Click **Next word** to load a random German word from Wiktionary
2. Type the **Bulgarian translation** in the input field
3. Click **Hint** to reveal the English translation (optional)
4. Submit your answer:
   - ✅ **Correct**: See all three translations, then click **Next word**
   - ❌ **Incorrect**: Try again without losing the current word

## Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript, styled with CSS
- **Backend**: Express + TypeScript, runs with tsx watch mode
- **Data**: In-memory sessions with 10-minute expiry
- **Word source**: German Wiktionary API (random word selection)
- **Translation**: DeepL API (German → English + Bulgarian)

### Key Components
- `server/src/index.ts` - Express routes (`/api/next`, `/api/answer`)
- `client/src/ui/App.tsx` - Main React component with game logic
- `server/src/wiktionary.ts` - Fetches random German words with filtering
- `server/src/deepl.ts` - Handles translation via DeepL API
- `server/src/sessions.ts` - In-memory session management

## Development

### Available Scripts
```bash
npm run dev              # Single dev server (Express + Vite)
npm run dev:split       # Run server & client separately (for debugging)
npm run dev:server      # Server only (tsx watch)
npm run dev:client      # Client only (Vite)
npm run build           # Build both server and client
npm start               # Start production server
```

### Project Structure
```
.
├── client/              # React frontend (Vite)
│   ├── src/ui/App.tsx  # Main game component
│   └── src/ui/api.ts   # API client
├── server/              # Express backend
│   ├── src/index.ts     # Routes & session validation
│   ├── src/wiktionary.ts  # Word fetching
│   ├── src/deepl.ts     # Translation API
│   └── src/sessions.ts  # Session management
└── package.json         # Monorepo workspace config
```

## Troubleshooting

### "Failed to fetch next word (HTTP 502)"
This usually means:
- **Invalid DeepL key**: Check `server/.env` has a valid API key
- **Wiktionary unavailable**: Check your internet connection
- **DeepL rate limited**: Wait a moment and try again

### Server not reloading changes
The server uses `tsx watch`. If changes aren't picked up, stop and restart `npm run dev`.

### Port already in use
The dev server will try the next available port. Check the terminal for the actual URL (e.g., http://localhost:54002).

## Notes

- Words are fetched **dynamically** from Wiktionary (not a static list)
- Sessions expire after **10 minutes** of inactivity
- No user authentication—each session is anonymous
- CORS is enabled for all origins
- The **English hint** is optional and doesn't affect validation