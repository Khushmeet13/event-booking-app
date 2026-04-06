import { useState, useCallback } from "react";
import { searchEvents, MUSIC_GENRES, INDIA_CITIES, CONFIG } from "../services/api";
import { usePaginatedSearch, useDebounce } from "../hooks/useApi";
import { SkeletonGrid, ApiKeyBanner, ErrorState, EmptyState, LoadMoreButton, LiveBadge } from "../components/UI";

export default function EventListings({ onSelectEvent }) {
  const [keyword, setKeyword] = useState("");
  const [city, setCity] = useState("");
  const [genreId, setGenreId] = useState("");
  const isApiKeySet = CONFIG.TICKETMASTER_KEY !== "YOUR_TICKETMASTER_API_KEY";

 const searchFn = useCallback(
  (params) => searchEvents({ 
    ...params, 
    countryCode: "IN", 
    classificationName: "music",
    startDateTime: new Date().toISOString().split('.')[0] + "Z", // e.g. "2026-04-06T00:00:00Z"
  }),
  []
);

  const { results: events, total, loading, error, initialLoad, search, loadMore, hasMore } =
    usePaginatedSearch(searchFn, { keyword: "", city: "", genreId: "" });

  const handleFilter = (updates) => {
    const newParams = { keyword, city, genreId, ...updates };
    if ("keyword" in updates) setKeyword(updates.keyword);
    if ("city" in updates) setCity(updates.city);
    if ("genreId" in updates) setGenreId(updates.genreId);
    search(newParams);
  };

  return (
    <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
      {/* Hero */}
      <div className="mb-10 mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-px h-8 bg-[#c9a84c]" />
          <span className="text-[10px] tracking-[0.4em] text-[#c9a84c] uppercase">Live Experiences</span>
          {isApiKeySet && <LiveBadge />}
        </div>
        <h1 className="font-display text-5xl md:text-7xl leading-none tracking-tight mb-3">
          Extraordinary<br /><span className="text-[#c9a84c]">Evenings.</span>
        </h1>
        <p className="text-white/40 text-sm max-w-md leading-relaxed mt-3">
          Live events across World — concerts, festivals, theatre and more.
          {total > 0 && <span className="text-[#c9a84c]/70"> {total.toLocaleString()} events found.</span>}
        </p>
      </div>

      {!isApiKeySet && <ApiKeyBanner service="Ticketmaster" />}

      {/* Search + Filters */}
      <div className="mb-8 space-y-4">
        <div className="relative max-w-lg">
          <svg viewBox="0 0 24 24" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 fill-white/25 pointer-events-none">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            type="text"
            value={keyword}
            onChange={(e) => handleFilter({ keyword: e.target.value })}
            placeholder="Search events, artists, venues..."
            className="w-full pl-11 pr-4 py-3 bg-white/3 border border-white/8 rounded-xl text-sm text-white placeholder-white/20 outline-none focus:border-[#c9a84c]/40 transition-colors"
          />
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={city}
            onChange={(e) => handleFilter({ city: e.target.value })}
            className="bg-white/3 border border-white/8 rounded-xl px-4 py-2.5 text-xs text-white/60 outline-none focus:border-[#c9a84c]/40 transition-colors appearance-none cursor-pointer"
          >
            <option value="" className="bg-[#0f0f17]">All Cities</option>
            {INDIA_CITIES.map((c) => (
              <option key={c} value={c} className="bg-[#0f0f17]">{c}</option>
            ))}
          </select>

          <div className="flex flex-wrap gap-1.5">
            {MUSIC_GENRES.slice(0, 6).map((g) => (
              <button
                key={g.id}
                onClick={() => handleFilter({ genreId: g.id })}
                className={`px-3 py-1.5 rounded-full text-[10px] tracking-[0.15em] uppercase transition-all ${
                  genreId === g.id
                    ? "bg-[#c9a84c] text-black font-bold"
                    : "border border-white/10 text-white/40 hover:border-white/25"
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {error ? (
        <ErrorState message={error} onRetry={() => search({ keyword, city, genreId })} />
      ) : loading && initialLoad ? (
        <SkeletonGrid count={6} type="event" />
      ) : events.length === 0 ? (
        <EmptyState title="No events found" subtitle="Try adjusting your filters or search." icon="🎭" />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, idx) => (
              <EventCard key={event.id} event={event} onClick={() => onSelectEvent(event)} delay={idx * 0.05} />
            ))}
          </div>
          <LoadMoreButton onClick={loadMore} loading={loading} hasMore={hasMore} total={total} shown={events.length} />
        </>
      )}

      {!initialLoad && total > 0 && (
        <div className="mt-20 pt-10 border-t border-white/5 grid grid-cols-3 gap-8">
          {[
            { label: "Events Found", value: total.toLocaleString() },
            { label: "Cities Covered", value: "8+" },
            { label: "Powered By", value: "Ticketmaster" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-2xl md:text-3xl text-[#c9a84c]">{s.value}</p>
              <p className="text-[10px] tracking-widest uppercase text-white/30 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EventCard({ event, onClick, delay }) {
  const price = event.pricing?.regular?.general;
  const genreDisplay = [event.genre, event.subGenre].filter(Boolean).join(" · ");

  return (
    <div onClick={onClick} style={{ animationDelay: `${delay}s` }} className="group cursor-pointer animate-fadeUp">
      <div className="relative overflow-hidden rounded-2xl bg-[#0f0f17] border border-white/5 hover:border-[#c9a84c]/30 transition-all duration-500 h-full flex flex-col">
        <div className="relative h-52 overflow-hidden flex-shrink-0">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80"; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f17] via-[#0f0f17]/30 to-transparent" />
          {event.badge && (
            <div className="absolute top-3 left-3">
              <span className="text-[10px] tracking-[0.2em] uppercase px-2.5 py-1 rounded-full font-bold bg-[#c9a84c]/20 text-[#c9a84c] border border-[#c9a84c]/30">
                {event.badge}
              </span>
            </div>
          )}
          {genreDisplay && (
            <div className="absolute top-3 right-3">
              <span className="text-[9px] tracking-widest uppercase text-white/50 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
                {genreDisplay.slice(0, 24)}
              </span>
            </div>
          )}
        </div>

        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-xl tracking-wide leading-tight line-clamp-1">{event.title}</h3>
              {event.subtitle && <p className="text-xs text-white/40 mt-0.5 line-clamp-1">{event.subtitle}</p>}
            </div>
            {price && (
              <div className="text-right flex-shrink-0">
                <p className="text-[9px] tracking-widest text-white/30 uppercase">from</p>
                <p className="font-display text-base text-[#c9a84c]">₹{price.toLocaleString()}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1 mb-3">
            <div className="flex items-center gap-1.5 text-[11px] text-white/35">
              <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current flex-shrink-0"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>
              <span>{event.date}{event.time !== "TBA" ? ` · ${event.time}` : ""}</span>
            </div>
            {event.venue && (
              <div className="flex items-center gap-1.5 text-[11px] text-white/35">
                <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current flex-shrink-0"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
                <span className="line-clamp-1">{event.venue}</span>
              </div>
            )}
          </div>

          {event.description && (
            <p className="text-xs text-white/25 leading-relaxed line-clamp-2 mb-4 flex-1">{event.description}</p>
          )}

          <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
            {event.url ? (
              <a href={event.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-[9px] text-white/20 hover:text-white/40 transition-colors">
                via Ticketmaster ↗
              </a>
            ) : <span />}
            <button className="flex items-center gap-1.5 text-[11px] tracking-widest uppercase text-[#c9a84c] group-hover:gap-2.5 transition-all">
              Select Seats
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#c9a84c]"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
