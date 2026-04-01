# StagePass — Event Ticket Booking System

A production-grade event ticketing frontend built with React + Tailwind CSS, powered by real live APIs.

## 🚀 Quick Start

```bash
npm install
cp .env.example .env   # add your API keys
npm run dev
```

---

## 🔑 API Keys (Free)

### 1. Ticketmaster Discovery API
Powers: **Events**, **Artists**, **Venues** — all real, live data.

- Register free at [developer.ticketmaster.com](https://developer.ticketmaster.com/)
- Click **"Get your API key"**
- Your **Consumer Key** = your API key
- Add to `.env`: `VITE_TM_API_KEY=your_key_here`
- **Free tier**: 5,000 requests/day · 2 req/sec

### 2. Last.fm API
Powers: **Artist bios**, **listener counts**, **similar artists**, **high-res images**

- Register free at [last.fm/api/account/create](https://www.last.fm/api/account/create)
- Add to `.env`: `VITE_LASTFM_API_KEY=your_key_here`
- **Free tier**: Unlimited reads · 5 req/sec

### 3. MusicBrainz API
Powers: **Artist metadata enrichment** — no key needed, completely free.

---

## 📁 Project Structure

```
src/
├── services/
│   └── api.js              ← All API calls (TM + Last.fm + MusicBrainz)
├── hooks/
│   └── useApi.js           ← useAsync, usePaginatedSearch, useDebounce
├── components/
│   ├── Navbar.jsx
│   ├── CartDrawer.jsx
│   └── UI.jsx              ← Skeletons, ErrorState, EmptyState, LiveBadge
├── pages/
│   ├── EventListings.jsx   ← Live TM events with search + city + genre filters
│   ├── SeatSelection.jsx   ← Seat map (demo seats, TM doesn't expose on free tier)
│   ├── Checkout.jsx        ← Payment form with validation
│   ├── TicketConfirmation.jsx ← QR code generation
│   ├── Artists.jsx         ← Live TM attractions + Last.fm enrichment
│   ├── Venues.jsx          ← Live TM venues + Google Maps directions
│   └── About.jsx           ← Static brand/team/FAQ page
└── data/
    └── events.js           ← Fallback static data (used when no API key)
```

---

## 🌐 APIs Used

| API | Purpose | Auth | Limit |
|-----|---------|------|-------|
| [Ticketmaster Discovery v2](https://developer.ticketmaster.com/) | Events, Artists, Venues | Free API key | 5000/day |
| [Last.fm](https://www.last.fm/api) | Artist bios, images, similar | Free API key | Unlimited |
| [MusicBrainz](https://musicbrainz.org/doc/MusicBrainz_API) | Artist metadata, genres | None required | 1 req/sec |
| [Google Maps](https://maps.google.com) | Venue directions (deep link) | None required | Unlimited |

---

## 💳 Payment Flow

1. Browse events → powered by Ticketmaster API  
2. Select seats → demo seat map (TM free tier doesn't expose seat maps)  
3. Checkout → form validation + payment method selection  
4. Confirmation → unique QR code generated per ticket  

---

## ⚙️ Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_TM_API_KEY` | Ticketmaster API key |
| `VITE_LASTFM_API_KEY` | Last.fm API key |
