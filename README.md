# MP District Courts — Case Search

Search Madhya Pradesh district court records by party name, CNR number, advocate, or cause list. Powered by the [eCourtsIndia API](https://ecourtsindia.com/api).

## Features

- **Party Name Search** — find cases by petitioner, respondent, or accused name
- **CNR Lookup** — get full case details by unique case number record
- **Advocate Search** — find cases handled by a specific advocate
- **Cause List Search** — search daily schedules by case number, party name, or FIR number
- Results filtered to **Madhya Pradesh District Courts** by default
- Full case detail view with hearing history, FIR details, parties, and orders

## Deploy on Render

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Render will auto-detect `render.yaml`. Set these:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
5. Add environment variable:
   - `ECOURTS_API_KEY` = your eCourtsIndia API token
   - `PORT` = `10000`
6. Deploy

## API Key

Get your free API key (₹200 free credits) at [ecourtsindia.com/api](https://ecourtsindia.com/api).

## Tech Stack

- Next.js 14 (App Router)
- Server-side API routes (API key stays safe on the server)
- No database needed
