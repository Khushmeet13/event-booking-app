import { useState, useCallback } from "react";
import { searchVenues, INDIA_CITIES, CONFIG } from "../services/api";
import { usePaginatedSearch } from "../hooks/useApi";
import { SkeletonGrid, ApiKeyBanner, ErrorState, EmptyState, LoadMoreButton, LiveBadge } from "../components/UI";

export default function Venues({ onNavigate }) {
  const [activeCity, setActiveCity] = useState("");
  const [keyword, setKeyword] = useState("");
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState("grid");
  const isApiKeySet = CONFIG.TICKETMASTER_KEY !== "YOUR_TICKETMASTER_API_KEY";

  const searchFn = useCallback(
    (params) => searchVenues({ ...params, countryCode: "IN" }),
    []
  );

  const { results: venues, total, loading, error, initialLoad, search, loadMore, hasMore } =
    usePaginatedSearch(searchFn, { keyword: "", city: "", size: 20 });

  const handleFilter = (updates) => {
    const newCity = updates.city ?? activeCity;
    const newKw = updates.keyword ?? keyword;
    if ("city" in updates) setActiveCity(newCity);
    if ("keyword" in updates) setKeyword(newKw);
    search({ keyword: newKw, city: newCity, size: 20 });
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-[#0a0a0f]">
      {/* Hero */}
      <div className="max-w-7xl mx-auto px-6 mt-8 mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-px h-8 bg-[#c9a84c]" />
          <span className="text-[10px] tracking-[0.4em] text-[#c9a84c] uppercase">Across World</span>
          {isApiKeySet && <LiveBadge />}
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <h1 className="font-display text-5xl md:text-7xl leading-none tracking-tight">
            The<br /><span className="text-[#c9a84c]">Spaces.</span>
          </h1>
          <p className="text-white/40 text-sm max-w-xs leading-relaxed md:mb-2">
            Live venue data from Ticketmaster. Click any venue to explore details and get directions.
            {total > 0 && <span className="block text-[#c9a84c]/70 mt-1">{total.toLocaleString()} venues found.</span>}
          </p>
        </div>

        {!isApiKeySet && <ApiKeyBanner service="Ticketmaster" />}

        {/* Stats */}
        {!initialLoad && total > 0 && (
          <div className="grid grid-cols-3 gap-6 py-8 border-y border-white/5 mb-8">
            {[
              { val: total.toLocaleString(), label: "Partner Venues" },
              { val: "8+", label: "Cities" },
              { val: "Live", label: "Data Source" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-display text-3xl text-[#c9a84c]">{s.val}</p>
                <p className="text-[10px] tracking-widest uppercase text-white/25 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 mb-8 flex flex-col sm:flex-row gap-4 sm:items-center justify-end">
        {/* <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleFilter({ city: "" })}
            className={`px-3 py-1.5 rounded-full text-[10px] tracking-[0.15em] uppercase transition-all ${activeCity === "" ? "bg-[#c9a84c] text-black font-bold" : "border border-white/10 text-white/40 hover:border-white/25"}`}
          >
            All
          </button>
          {INDIA_CITIES.map((c) => (
            <button
              key={c}
              onClick={() => handleFilter({ city: c })}
              className={`px-3 py-1.5 rounded-full text-[10px] tracking-[0.15em] uppercase transition-all ${activeCity === c ? "bg-[#c9a84c] text-black font-bold" : "border border-white/10 text-white/40 hover:border-white/25"}`}
            >
              {c}
            </button>
          ))}
        </div> */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              value={keyword}
              onChange={(e) => handleFilter({ keyword: e.target.value })}
              placeholder="Search venues..."
              className="pl-3 pr-4 py-2 bg-white/3 border border-white/8 rounded-full text-xs text-white placeholder-white/20 outline-none focus:border-[#c9a84c]/40 transition-colors w-80"
            />
          </div>
          <div className="flex gap-1 p-1 bg-white/3 border border-white/8 rounded-xl">
            {["grid", "list"].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-lg transition-all ${view === v ? "bg-[#c9a84c]/15 text-[#c9a84c]" : "text-white/30 hover:text-white/50"}`}
              >
                {v === "grid" ? (
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z"/></svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M3 5h18v2H3zm0 6h18v2H3zm0 6h18v2H3z"/></svg>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-7xl mx-auto px-6">
        {error ? (
          <ErrorState message={error} onRetry={() => search({ keyword, city: activeCity })} />
        ) : loading && initialLoad ? (
          <SkeletonGrid count={6} type="venue" />
        ) : venues.length === 0 ? (
          <EmptyState title="No venues found" subtitle="Try a different city or search term." icon="🏛️" />
        ) : view === "grid" ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {venues.map((venue, i) => (
                <VenueCard key={venue.id} venue={venue} index={i} onClick={() => setSelected(venue)} />
              ))}
            </div>
            <LoadMoreButton onClick={loadMore} loading={loading} hasMore={hasMore} total={total} shown={venues.length} />
          </>
        ) : (
          <>
            <div className="space-y-4">
              {venues.map((venue, i) => (
                <VenueRow key={venue.id} venue={venue} index={i} onClick={() => setSelected(venue)} />
              ))}
            </div>
            <LoadMoreButton onClick={loadMore} loading={loading} hasMore={hasMore} total={total} shown={venues.length} />
          </>
        )}
      </div>

      {selected && <VenueModal venue={selected} onClose={() => setSelected(null)} onNavigate={onNavigate} />}
    </div>
  );
}

function VenueCard({ venue, index, onClick }) {
  return (
    <div
      onClick={onClick}
      className="animate-fadeUp group cursor-pointer bg-[#0f0f17] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-300"
      style={{ animationDelay: `${index * 0.07}s` }}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={venue.image}
          alt={venue.name}
          className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-105"
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&q=80"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f17] via-transparent to-transparent" />
        <div className="absolute top-3 left-3">
          <span className="text-[9px] tracking-widest uppercase px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white/60 border border-white/10">{venue.type}</span>
        </div>
        {venue.upcomingEvents > 0 && (
          <div className="absolute top-3 right-3">
            <span className="text-[9px] tracking-widest uppercase px-2 py-1 rounded-full bg-[#c9a84c]/20 text-[#c9a84c] border border-[#c9a84c]/20">
              {venue.upcomingEvents} events
            </span>
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-display text-xl line-clamp-1">{venue.name}</h3>
            <p className="text-xs text-white/40 mt-0.5 flex items-center gap-1">
              <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
              {[venue.city, venue.state, venue.country].filter(Boolean).join(", ")}
            </p>
          </div>
        </div>
        {venue.address && (
          <p className="text-xs text-white/25 leading-relaxed line-clamp-2 mb-3">{venue.address}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[#c9a84c]/70">{venue.upcomingEvents} upcoming</span>
          <button className="flex items-center gap-1.5 text-[10px] tracking-widest uppercase text-[#c9a84c] group-hover:gap-2 transition-all">
            Details
            <svg viewBox="0 0 24 24" className="w-3 h-3 fill-[#c9a84c]"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function VenueRow({ venue, index, onClick }) {
  return (
    <div
      onClick={onClick}
      className="animate-fadeUp group cursor-pointer bg-[#0f0f17] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-300 flex"
      style={{ animationDelay: `${index * 0.04}s` }}
    >
      <div className="relative w-36 flex-shrink-0 overflow-hidden">
        <img
          src={venue.image}
          alt={venue.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&q=80"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0f0f17]/50" />
      </div>
      <div className="flex-1 p-5 flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-xl line-clamp-1">{venue.name}</h3>
          <p className="text-[10px] text-white/35 mb-1">{[venue.city, venue.country].filter(Boolean).join(", ")} · {venue.type}</p>
          {venue.address && <p className="text-xs text-white/25 line-clamp-1">{venue.address}</p>}
        </div>
        <div className="flex-shrink-0 text-right">
          <p className="text-sm font-medium text-[#c9a84c]">{venue.upcomingEvents}</p>
          <p className="text-[9px] text-white/25 uppercase tracking-wider">events</p>
        </div>
      </div>
    </div>
  );
}

function VenueModal({ venue, onClose, onNavigate }) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.address || venue.name)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-[#0f0f17] border border-white/8 rounded-2xl overflow-hidden max-w-2xl w-full animate-fadeUp shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="relative h-56">
          <img
            src={venue.image}
            alt={venue.name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&q=80"; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f17] via-[#0f0f17]/20 to-transparent" />
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 border border-white/10 flex items-center justify-center hover:border-white/30 transition-colors">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white/60"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </button>
          <div className="absolute bottom-4 left-6">
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#c9a84c] mb-1">{venue.type}</p>
            <h2 className="font-display text-3xl line-clamp-1">{venue.name}</h2>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "City", value: venue.city || "—" },
              { label: "Upcoming", value: venue.upcomingEvents || "—" },
              { label: "Country", value: venue.country || "—" },
            ].map((s) => (
              <div key={s.label} className="bg-white/3 rounded-xl p-3 text-center">
                <p className="text-[9px] tracking-widest uppercase text-white/25 mb-1">{s.label}</p>
                <p className="text-sm font-medium text-[#c9a84c]">{s.value}</p>
              </div>
            ))}
          </div>

          {venue.address && (
            <div>
              <p className="text-[9px] tracking-[0.3em] uppercase text-white/25 mb-2">Address</p>
              <p className="text-sm text-white/50">{venue.address}</p>
            </div>
          )}

          {venue.parkingDetail && (
            <div>
              <p className="text-[9px] tracking-[0.3em] uppercase text-white/25 mb-1">Parking</p>
              <p className="text-xs text-white/35 leading-relaxed">{venue.parkingDetail}</p>
            </div>
          )}

          {venue.generalInfo?.generalRule && (
            <div>
              <p className="text-[9px] tracking-[0.3em] uppercase text-white/25 mb-1">General Info</p>
              <p className="text-xs text-white/35 leading-relaxed line-clamp-3">{venue.generalInfo.generalRule}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={() => { onClose(); onNavigate && onNavigate("listings"); }}
              className="flex-1 py-3 bg-[#c9a84c] text-black text-[11px] tracking-[0.2em] uppercase font-bold rounded-xl hover:bg-[#dbb95e] transition-colors flex items-center justify-center gap-2"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-black"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/></svg>
              View Events
            </button>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 border border-white/10 text-white/50 text-[11px] tracking-[0.2em] uppercase rounded-xl hover:border-white/20 hover:text-white/70 transition-all flex items-center justify-center gap-2"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              Get Directions
            </a>
          </div>
          {venue.url && (
            <a href={venue.url} target="_blank" rel="noopener noreferrer" className="block text-center text-[9px] text-white/20 hover:text-white/40 transition-colors">
              View on Ticketmaster ↗
            </a>
          )}
          <p className="text-[9px] text-center text-white/15">Live data from Ticketmaster Discovery API</p>
        </div>
      </div>
    </div>
  );
}
