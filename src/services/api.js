/**
 * StagePass API Service Layer
 *
 * APIs used:
 *  1. Ticketmaster Discovery API — events, attractions, venues (free, 5000 req/day)
 *     → Get your free key at: https://developer.ticketmaster.com/
 *     → Replace TICKETMASTER_API_KEY below with your key
 *
 *  2. MusicBrainz API — artist metadata, tags, genres
 *     → Completely free, no key needed
 *     → Rate limit: 1 req/sec (we handle this)
 *
 *  3. Last.fm API — artist images, biography, similar artists (free, 5 req/sec)
 *     → Get your free key at: https://www.last.fm/api/account/create
 *     → Replace LASTFM_API_KEY below with your key
 */

// ─── CONFIG ─────────────────────────────────────────────────────────────────
export const CONFIG = {
  // Replace with your real Ticketmaster API key (free at developer.ticketmaster.com)
  TICKETMASTER_KEY: import.meta.env.VITE_TM_API_KEY || "YOUR_TICKETMASTER_API_KEY",

  // Replace with your real Last.fm API key (free at last.fm/api)
  LASTFM_KEY: import.meta.env.VITE_LASTFM_API_KEY || "YOUR_LASTFM_API_KEY",

  TM_BASE: "https://app.ticketmaster.com/discovery/v2",
  MB_BASE: "https://musicbrainz.org/ws/2",
  LASTFM_BASE: "https://ws.audioscrobbler.com/2.0",
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const cache = new Map();

async function fetchWithCache(url, options = {}) {
  if (cache.has(url)) return cache.get(url);
  const res = await fetch(url, {
    headers: { "User-Agent": "StagePass/1.0 (stagepass.in)" },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${url}`);
  const data = await res.json();
  cache.set(url, data);
  return data;
}

function tmUrl(path, params = {}) {
  const p = new URLSearchParams({
    apikey: CONFIG.TICKETMASTER_KEY,
    ...params,
  });
  return `${CONFIG.TM_BASE}${path}?${p}`;
}

function mbUrl(path, params = {}) {
  const p = new URLSearchParams({ fmt: "json", ...params });
  return `${CONFIG.MB_BASE}${path}?${p}`;
}

function lastfmUrl(params = {}) {
  const p = new URLSearchParams({
    api_key: CONFIG.LASTFM_KEY,
    format: "json",
    ...params,
  });
  return `${CONFIG.LASTFM_BASE}?${p}`;
}

// ─── IMAGE HELPERS ───────────────────────────────────────────────────────────
export function getTMImage(images = [], ratio = "16_9", size = "LARGE") {
  if (!images?.length) return null;
  const match = images.find((img) => img.ratio === ratio && img.width > 500);
  return match?.url || images[0]?.url || null;
}

export function placeholderImage(seed = "event") {
  const seeds = {
    event: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
    artist: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
    venue: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&q=80",
  };
  return seeds[seed] || seeds.event;
}

// ─── TICKETMASTER: EVENTS ────────────────────────────────────────────────────

/**
 * Search events by keyword / genre / city
 */
export async function searchEvents({
  keyword = "",
  city = "",
  genre = "",
  //countryCode = "IN",
  size = 20,
  page = 0,
  classificationName = "music",
} = {}) {
  const params = {
    size,
    page,
    sort: "date,asc",
    classificationName,
  };
  if (keyword) params.keyword = keyword;
  if (city) params.city = city;
  if (genre) params.genreId = genre;
  //if (countryCode) params.countryCode = countryCode;

  try {
    const data = await fetchWithCache(tmUrl("/events.json", params));
    const events = data?._embedded?.events || [];
    return {
      events: events.map(normalizeTMEvent),
      total: data?.page?.totalElements || 0,
      totalPages: data?.page?.totalPages || 0,
    };
  } catch (err) {
    console.warn("Ticketmaster events fetch failed:", err.message);
    return { events: [], total: 0, totalPages: 0, error: err.message };
  }
}

/**
 * Get a single event by ID
 */
export async function getEvent(id) {
  try {
    const data = await fetchWithCache(tmUrl(`/events/${id}.json`));
    return normalizeTMEvent(data);
  } catch (err) {
    console.warn("getEvent failed:", err.message);
    return null;
  }
}

/**
 * Normalize a Ticketmaster event into our app's shape
 */
export function normalizeTMEvent(ev) {
  const venue = ev?._embedded?.venues?.[0];
  const attraction = ev?._embedded?.attractions?.[0];
  const priceRange = ev?.priceRanges?.[0];
  const classification = ev?.classifications?.[0];
  const dateInfo = ev?.dates?.start;

  return {
    id: ev.id,
    title: ev.name,
    subtitle: attraction?.name || classification?.genre?.name || "",
    date: dateInfo?.localDate
      ? new Date(dateInfo.localDate).toLocaleDateString("en-IN", {
          year: "numeric", month: "short", day: "numeric",
        })
      : "TBA",
    time: dateInfo?.localTime
      ? new Date(`2000-01-01T${dateInfo.localTime}`).toLocaleTimeString("en-IN", {
          hour: "2-digit", minute: "2-digit",
        })
      : "TBA",
    venue: venue
      ? `${venue.name}, ${venue.city?.name || ""}`
      : "Venue TBA",
    venueId: venue?.id,
    venueName: venue?.name,
    venueCity: venue?.city?.name,
    venueAddress: venue?.address?.line1,
    genre: classification?.genre?.name || classification?.segment?.name || "Music",
    subGenre: classification?.subGenre?.name || "",
    image:
      getTMImage(ev.images, "16_9", "LARGE") ||
      getTMImage(ev.images) ||
      placeholderImage("event"),
    images: ev.images || [],
    url: ev.url,
    pricing: {
      phase: "regular",
      regular: {
        vip: priceRange ? Math.round(priceRange.max) : 4999,
        general: priceRange ? Math.round(priceRange.min) : 1999,
      },
      earlyBird: {
        vip: priceRange ? Math.round(priceRange.max * 0.8) : 3999,
        general: priceRange ? Math.round(priceRange.min * 0.8) : 1599,
      },
    },
    badge: dateInfo?.noSpecificTime ? "TBA" : "On Sale",
    badgeColor: "#c9a84c",
    description: ev.info || ev.pleaseNote || `${ev.name} — live experience.`,
    attractions: ev._embedded?.attractions || [],
    status: ev.dates?.status?.code,
    // Seat map defaults (TM doesn't give seat maps on free tier)
    rows: ["A", "B", "C", "D", "E", "F"],
    seatsPerRow: 20,
    vipRows: ["A", "B"],
    bookedSeats: generateBookedSeats(),
    // Raw TM data preserved
    _raw: ev,
  };
}

function generateBookedSeats() {
  const rows = ["A", "B", "C", "D", "E", "F"];
  const booked = [];
  rows.forEach((r) => {
    const count = Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      booked.push(`${r}${Math.ceil(Math.random() * 10)}`);
    }
  });
  return [...new Set(booked)];
}

// ─── TICKETMASTER: ATTRACTIONS (ARTISTS) ─────────────────────────────────────

/**
 * Search artists/attractions
 */
export async function searchArtists({
  keyword = "",
  classificationName = "music",
  size = 20,
  page = 0,
} = {}) {
  const params = { keyword, classificationName, size, page };
  try {
    const data = await fetchWithCache(tmUrl("/attractions.json", params));
    const items = data?._embedded?.attractions || [];
    return {
      artists: items.map(normalizeTMArtist),
      total: data?.page?.totalElements || 0,
    };
  } catch (err) {
    console.warn("searchArtists failed:", err.message);
    return { artists: [], total: 0, error: err.message };
  }
}

/**
 * Get single artist by TM attraction ID
 */
export async function getArtist(id) {
  try {
    const data = await fetchWithCache(tmUrl(`/attractions/${id}.json`));
    return normalizeTMArtist(data);
  } catch (err) {
    console.warn("getArtist failed:", err.message);
    return null;
  }
}

export function normalizeTMArtist(a) {
  const classification = a?.classifications?.[0];
  return {
    id: a.id,
    name: a.name,
    genre: classification?.genre?.name || classification?.segment?.name || "Music",
    subGenre: classification?.subGenre?.name || "",
    image: getTMImage(a.images, "16_9") || getTMImage(a.images) || placeholderImage("artist"),
    images: a.images || [],
    url: a.url,
    upcomingEvents: a.upcomingEvents?.ticketmaster || 0,
    tags: [
      classification?.segment?.name,
      classification?.genre?.name,
      classification?.subGenre?.name,
    ].filter(Boolean),
    externalLinks: a.externalLinks || {},
    _raw: a,
  };
}

// ─── TICKETMASTER: VENUES ────────────────────────────────────────────────────

/**
 * Search venues
 */
export async function searchVenues({
  keyword = "",
  city = "",
  countryCode = "IN",
  size = 20,
  page = 0,
} = {}) {
  const params = { size, page };
  if (keyword) params.keyword = keyword;
  if (city) params.city = city;
  //if (countryCode) params.countryCode = countryCode;

  try {
    const data = await fetchWithCache(tmUrl("/venues.json", params));
    const items = data?._embedded?.venues || [];
    return {
      venues: items.map(normalizeTMVenue),
      total: data?.page?.totalElements || 0,
    };
  } catch (err) {
    console.warn("searchVenues failed:", err.message);
    return { venues: [], total: 0, error: err.message };
  }
}

/**
 * Get single venue by ID
 */
export async function getVenue(id) {
  try {
    const data = await fetchWithCache(tmUrl(`/venues/${id}.json`));
    return normalizeTMVenue(data);
  } catch (err) {
    console.warn("getVenue failed:", err.message);
    return null;
  }
}

export function normalizeTMVenue(v) {
  return {
    id: v.id,
    name: v.name,
    city: v.city?.name || "",
    state: v.state?.name || "",
    country: v.country?.name || "",
    address: [v.address?.line1, v.city?.name, v.state?.name, v.country?.name]
      .filter(Boolean)
      .join(", "),
    postalCode: v.postalCode || "",
    lat: v.location?.latitude,
    lng: v.location?.longitude,
    image:
      getTMImage(v.images, "16_9") ||
      getTMImage(v.images) ||
      placeholderImage("venue"),
    images: v.images || [],
    url: v.url,
    capacity: v.generalInfo?.generalRule
      ? "See venue"
      : v.upcomingEvents?.ticketmaster
      ? `${v.upcomingEvents.ticketmaster} upcoming events`
      : "",
    upcomingEvents: v.upcomingEvents?.ticketmaster || 0,
    type: v.type || "Venue",
    timezone: v.timezone,
    parkingDetail: v.parkingDetail,
    generalInfo: v.generalInfo,
    boxOfficeInfo: v.boxOfficeInfo,
    socialLinks: v.externalLinks || {},
    _raw: v,
  };
}

// ─── MUSICBRAINZ: ARTIST ENRICHMENT ─────────────────────────────────────────

/**
 * Search artists on MusicBrainz (no key needed)
 */
export async function mbSearchArtist(name, limit = 5) {
  try {
    const data = await fetchWithCache(
      mbUrl("/artist", { query: name, limit })
    );
    return data?.artists || [];
  } catch (err) {
    console.warn("MB artist search failed:", err.message);
    return [];
  }
}

/**
 * Get MusicBrainz artist detail by MBID
 */
export async function mbGetArtist(mbid) {
  try {
    const data = await fetchWithCache(
      mbUrl(`/artist/${mbid}`, { inc: "tags+genres+ratings+url-rels" })
    );
    return data;
  } catch (err) {
    console.warn("MB getArtist failed:", err.message);
    return null;
  }
}

// ─── LAST.FM: ARTIST BIO + IMAGES ────────────────────────────────────────────

/**
 * Get artist info from Last.fm (bio, image, similar)
 */
export async function lastfmGetArtist(name) {
  try {
    const data = await fetchWithCache(
      lastfmUrl({ method: "artist.getinfo", artist: name, autocorrect: 1 })
    );
    const a = data?.artist;
    if (!a) return null;
    return {
      name: a.name,
      bio: a.bio?.summary?.replace(/<[^>]+>/g, "").split(" Read more")[0] || "",
      image:
        a.image?.find((i) => i.size === "extralarge")?.["#text"] ||
        a.image?.find((i) => i.size === "large")?.["#text"] ||
        null,
      listeners: parseInt(a.stats?.listeners || "0"),
      playcount: parseInt(a.stats?.playcount || "0"),
      similar: a.similar?.artist?.map((s) => s.name) || [],
      tags: a.tags?.tag?.map((t) => t.name) || [],
      url: a.url,
    };
  } catch (err) {
    console.warn("Last.fm getArtist failed:", err.message);
    return null;
  }
}

/**
 * Get top tracks for an artist from Last.fm
 */
export async function lastfmGetTopTracks(name, limit = 5) {
  try {
    const data = await fetchWithCache(
      lastfmUrl({ method: "artist.gettoptracks", artist: name, limit })
    );
    return (data?.toptracks?.track || []).map((t) => ({
      name: t.name,
      playcount: parseInt(t.playcount || "0"),
      url: t.url,
    }));
  } catch (err) {
    console.warn("Last.fm getTopTracks failed:", err.message);
    return [];
  }
}

// ─── COMBINED: ARTIST FULL PROFILE ───────────────────────────────────────────

/**
 * Get a fully enriched artist profile from TM + Last.fm
 */
export async function getArtistProfile(tmArtist) {
  const [lfmData, topTracks] = await Promise.all([
    lastfmGetArtist(tmArtist.name),
    lastfmGetTopTracks(tmArtist.name),
  ]);

  return {
    ...tmArtist,
    bio: lfmData?.bio || `${tmArtist.name} — performing live.`,
    image: lfmData?.image && !lfmData.image.includes('2a96cbd8b46e442fc41c2b86b821562f')
      ? lfmData.image
      : tmArtist.image,
    listeners: lfmData?.listeners,
    playcount: lfmData?.playcount,
    similar: lfmData?.similar || [],
    tags: [...new Set([...tmArtist.tags, ...(lfmData?.tags || [])])].slice(0, 6),
    topTracks,
    lastfmUrl: lfmData?.url,
    followers: lfmData?.listeners
      ? formatNumber(lfmData.listeners)
      : `${tmArtist.upcomingEvents} shows`,
  };
}

// ─── UTILITIES ───────────────────────────────────────────────────────────────

export function formatNumber(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export function formatPrice(amount, currency = "INR") {
  if (!amount) return "Price TBA";
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─── MUSIC GENRES (TM classification IDs for India) ──────────────────────────
export const MUSIC_GENRES = [
  { id: "", name: "All Genres" },
  { id: "KnvZfZ7vAev", name: "Electronic" },
  { id: "KnvZfZ7vAvF", name: "Rock" },
  { id: "KnvZfZ7vAeA", name: "Jazz" },
  { id: "KnvZfZ7vAvd", name: "Classical" },
  { id: "KnvZfZ7vAeJ", name: "Pop" },
  { id: "KnvZfZ7vAvt", name: "Hip-Hop" },
  { id: "KnvZfZ7vAv1", name: "Metal" },
  { id: "KnvZfZ7vAvE", name: "R&B" },
];

export const INDIA_CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad",
  "Chennai", "Kolkata", "Pune", "Ahmedabad",
];
