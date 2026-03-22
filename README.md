# AlgoVerse

Interactive algorithm visualizer — MERN stack (React + Vite + Three.js + Tailwind, Express + MongoDB + JWT).

## Local development

### Prerequisites

- Node.js 18+
- MongoDB running locally or a cloud URI

### Server

```bash
cd server
cp .env.example .env
# Edit .env — set MONGO_URI, JWT_SECRET, JWT_REFRESH_SECRET, CLIENT_URL=http://localhost:5173
npm install
npm run dev
```

API defaults to `http://localhost:5000`. Health check: `GET /api/health`.

### Client

```bash
cd client
npm install
npm run dev
```

For local dev, leave `VITE_API_URL` unset; Vite proxies `/api` to the server so cookies work on `http://localhost:5173`.

## Production deployment

- **Render (API):** Web service, `npm start` in `server/`, set env vars from `server/.env.example`. Use `CLIENT_URL` = your Netlify site URL. Set `NODE_ENV=production` for secure cookies (`SameSite=None`, `Secure`).
- **Netlify (client):** Build command `npm run build`, publish directory `client/dist`. Set build env `VITE_API_URL` to your Render API origin (no trailing slash).

## API routes

- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`
- `GET/POST/DELETE /api/history` (authenticated)
- `POST /api/graph/bfs`, `POST /api/graph/dfs`, `POST /api/graph/warshall` (authenticated)
