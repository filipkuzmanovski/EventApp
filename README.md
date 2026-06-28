# EventApp — Skopje nightlife events

Monorepo with three parts:

| Folder | Stack | What it does |
|--------|-------|--------------|
| [`scraper/`](scraper) | Python | Scrapes Instagram posts from Skopje clubs, keeps the last 2 weeks, POSTs events to the backend |
| [`backend/`](backend) | Spring Boot + PostgreSQL (Supabase) | Stores posts, exposes a REST API |
| [`frontend/`](frontend) | React + Vite | Displays the events, with search and pagination |

## Data flow

```
scraper  ──POST /api/events──>  backend  ──GET /api/events/all──>  frontend
                                   │
                              PostgreSQL (Supabase)
```

---

## Setup

### 1. Backend (`backend/`)

Open the `backend/` folder in IntelliJ and run `EventAppApplication`
(starts on `http://localhost:8080`). The database connection is configured in
`src/main/resources/application.properties`.

### 2. Frontend (`frontend/`)

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

The backend must be running for events to load.

### 3. Scraper (`scraper/`)

```bash
cd scraper
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt
copy .env.example .env          # then put your RapidAPI key in .env
python EventAppScraper.py
```

The scraper reads `RAPIDAPI_KEY` from `.env` and POSTs results to the backend at
`http://localhost:8080/api/events`, so start the backend first.
