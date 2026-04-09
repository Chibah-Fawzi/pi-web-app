# pi-web

Next.js (TypeScript) app that combines a **live system dashboard** and **local LLM chat** in one UI. Chat requests go to the separate **`pi-chat`** service through **`POST /api/chat`** (proxy), not straight to Ollama.

Run **`pi-chat`** on port **3001** so the proxy can reach it. Ollama is configured inside `pi-chat` (`OLLAMA_BASE_URL`, `OLLAMA_MODEL`).

## Features

### App shell

- **Single layout** — Sticky header on every page with π branding, **Dashboard** and **LLM Chat** links, and highlight for the active route.
- **Light / dark theme** — Toggle in the header (`next-themes`); preference follows the system by default.
- **Responsive** — Nav labels show in full on larger screens; compact on small viewports.

### Dashboard (`/`)

- **Welcome + overview cards** — Short intro and cards that summarize live monitoring, chat integration, storage snapshot, and load averages.
- **Live system metrics** — Server-rendered first load, then **Server-Sent Events** (`GET /api/ws`) for updates about every **5s** (configurable via `?interval=`).
- **Connection feedback** — Indicator for live vs static data, last update time, retry on failure.
- **At a glance** — Hostname, platform, architecture, CPU core count, CPU temperature (Raspberry Pi `vcgencmd` when available), memory used/total, root filesystem usage with progress styling, per-core CPU usage bars, load averages (1 / 5 / 15 min), uptime, kernel release, free memory, storage availability and mount point.
- **Color cues** — Progress bars and temperature text shift green / orange / red by thresholds for quick health scanning.

### LLM Chat (`/chat`)

- **Conversation UI** — User and assistant bubbles, empty-state prompt, “thinking” state before the first token.
- **Streaming replies** — NDJSON stream from `pi-chat` is parsed incrementally; assistant text grows as the model generates; optional caret while streaming.
- **Errors** — Friendly messages if the API or Ollama fails (e.g. `ollama_error`).
- **Same-origin API** — Browser calls **`/api/chat`**; Next forwards to **`pi-chat`** using `PI_CHAT_API_URL` (see [Environment](#environment)).

For implementation details of the dashboard pipeline, see [Dashboard](#dashboard) below.

## Dashboard

The home page at **`/`** is the Raspberry Pi **system dashboard**.

### How it works

1. **First paint (server)** — `src/app/page.tsx` calls `getSystemDetails()` from `src/lib/system.ts` on the server. That reads the **host** machine (CPU, memory, temperature via `vcgencmd` on a Pi, disk via `df`, load via `uptime` / `os`, etc.) and passes the result to the client as `initialData`.

2. **Live updates (client)** — `src/components/client-dashboard.tsx` loads `RealTimeDashboard` (client-only). `src/hooks/use-system-data.ts` opens an **`EventSource`** to **`GET /api/ws`**. The route in `src/app/api/ws/route.ts` polls `getSystemDetails()` on an interval and pushes **Server-Sent Events** (`text/event-stream`) with JSON payloads (`type: system-update`). The UI reconnects if the stream drops.

3. **What you see** — Connection status, quick stats (hostname, platform, CPU temp, memory %, storage %), per-core CPU usage with progress bars, load averages, uptime, kernel, and free memory / storage details.

### Relevant files

| Area | Location |
| --- | --- |
| Page layout & feature cards | `src/app/page.tsx` |
| Live metrics UI | `src/components/real-time-dashboard.tsx`, `client-dashboard.tsx` |
| SSE hook | `src/hooks/use-system-data.ts` |
| SSE API | `src/app/api/ws/route.ts` |
| Host metrics | `src/lib/system.ts` |

### Notes

- **Docker:** If you run this app in a container without extra mounts, `vcgencmd` and sometimes disk/uptime may fall back to defaults or host paths—run on the Pi host or map `/host/proc` etc. if you need exact hardware readings.
- **Interval:** Default is **5s**. The hook passes it as `GET /api/ws?interval=5000`; the route handler uses that for `setInterval` between pushes.

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

Terminal 1 — from the **`pi-chat`** project (e.g. `pi-chatbot/pi-chat` or your clone):

```bash
npm install && node index.js
# or: npm run dev
```

Terminal 2 — from **`pi-web`** (this folder):

```bash
npm install && npm run dev
```

Open **Dashboard** and **LLM Chat** from the top navigation.
