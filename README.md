# Loop — Feedback Management System (React + Vite)

A feedback collection and admin dashboard app built with React and Vite.

## Features
- **Give feedback** tab: customers submit name, category, star rating, and a message.
- **Admin dashboard** tab: total responses, average rating, top category, and open-review count; a bar chart of feedback by category (Recharts); auto-generated insights (weakest/strongest category, low ratings, items awaiting review); a filterable, sortable feedback table where admins can update each item's status (Open / Reviewed / Actioned).

## Project structure
```
server/                    Express + JWT + Mongoose API (app.js, db.js, models/, notify.js)
api/index.js               Vercel serverless entry
src/
  components/
    FeedbackForm.jsx       customer submission form
    StarRating.jsx         star rating input
    AdminDashboard.jsx     dashboard layout + state
    CategoryChart.jsx      Recharts bar chart
    InsightList.jsx        generated insight cards
    FeedbackTable.jsx      feedback ledger table
  data/
    seedFeedback.js        sample starting data + category list
  AdminPage.jsx / LoginForm.jsx   admin data loading + sign-in form
  store/                   Redux store, RTK Query api, auth slice
  App.jsx                  root component, tab switching, auth gate
  index.css                all styling (design tokens as CSS variables)
  main.jsx                 React entry point
```

## Architecture

- **Frontend**: React + Vite, Redux Toolkit + RTK Query (`src/store/`). Token is kept in `localStorage`, sent as `Authorization: Bearer`, and a 401 logs the admin out.
- **Backend**: Express app in `server/app.js` with JWT auth (bcrypt passwords) and **MongoDB via Mongoose** (`server/models/`, `server/db.js`).
  - `server/index.js` — local entry (`app.listen`).
  - `api/index.js` — Vercel serverless entry (same app, exported as a function).
  - The MongoDB connection is cached across invocations, which is required for serverless.
- **Third-party API**: [Resend](https://resend.com) emails an alert when someone submits a rating of 2 stars or lower (`server/notify.js`). Optional: it does nothing unless `RESEND_API_KEY` and `NOTIFY_TO` are set, and an email failure never blocks the submission.

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/health` | public |
| POST | `/api/auth/login` | public |
| GET | `/api/auth/me` | signed in |
| POST | `/api/feedback` | public (feedback form) |
| GET | `/api/feedback` | admin |
| PATCH | `/api/feedback/:id/status` | admin |

## Run locally

1. Create a free MongoDB Atlas cluster (or run MongoDB locally) and copy its connection string.
2. `cp .env.example .env` and fill in `MONGODB_URI` and `JWT_SECRET` (plus `ADMIN_EMAIL` / `ADMIN_PASSWORD`).
3. ```bash
   npm install
   npm run dev:all     # Vite (5173) + API (4000)
   ```
4. Open http://localhost:5173. In dev the admin defaults to `admin@loop.com` / `admin123` if you don't set `ADMIN_PASSWORD`, and 8 demo feedback items are inserted into an empty database.

## Deploy to Vercel

1. **MongoDB Atlas**: create a cluster and a database user. Under *Network Access*, allow `0.0.0.0/0` (Vercel's IPs are dynamic).
2. Push this project to GitHub and **Import** it at vercel.com/new. The Vite framework preset is detected automatically (build `npm run build`, output `dist`).
3. In *Project Settings -> Environment Variables*, add:
   - `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (required in production; no insecure defaults are used there)
   - optional: `RESEND_API_KEY`, `NOTIFY_TO`, `NOTIFY_FROM`, `SEED_DEMO_DATA=true`
4. Deploy. The admin user is created automatically on the first API request.
5. Check `https://<your-app>.vercel.app/api/health`, then sign in on the Admin tab.

CLI alternative: `npm i -g vercel && vercel` (then `vercel --prod`).

Note on Resend: with the default `onboarding@resend.dev` sender you can only email your own Resend account address. Verify a domain to send elsewhere.

## Build for production
```bash
npm run build
```
Outputs a static site to `dist/`, which you can deploy anywhere (Vercel, Netlify, GitHub Pages, your own server, etc.) — `npm run preview` serves that build locally to check it.

## Notes
- Tokens expire after 1h (`JWT_EXPIRES_IN`). For production hardening consider httpOnly-cookie tokens + refresh tokens and login rate limiting (an in-memory limiter is weak on serverless; use Upstash/Redis).
- Uses [Recharts](https://recharts.org) for the category chart and Google Fonts (Fraunces + IBM Plex Sans).
