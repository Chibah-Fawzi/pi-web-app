# pi-web

Next.js (TypeScript) app that combines:

- **Dashboard** (`/`) — live system metrics via **Server-Sent Events** from `GET /api/ws` (same pattern as `pi-app`).
- **LLM chat** (`/chat`) — UI from `pi-llm-chat`, but requests go to **`pi-chat`** through **`POST /api/chat`** (proxy), not directly to Ollama.

Run **`pi-chat`** on port **3001** so the proxy can reach it. Ollama is configured inside `pi-chat` (`OLLAMA_BASE_URL`, `OLLAMA_MODEL`).

## Scripts

```bash
npm install
npm run dev          # http://localhost:3000 — set PORT=3002 if needed
npm run build
npm start
```

## Environment

Copy `.env.example` to `.env.local` and adjust:

| Variable | Purpose |
| --- | --- |
| `PI_CHAT_API_URL` | Base URL of `pi-chat` (default `http://127.0.0.1:3001`). |
| `NEXT_PUBLIC_CHAT_API_URL` | Optional. Defaults to `/api/chat` (proxy). Set only if the browser must call chat elsewhere. |

## Run with `pi-chat`

Terminal 1 — from `pi-chatbot/pi-chat`:

```bash
npm install && node index.js
# or: npm run dev
```

Terminal 2 — from `pi-chatbot/pi-web`:

```bash
npm run dev
```

Open **Dashboard** and **LLM Chat** from the top navigation.
