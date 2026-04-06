import { useState, useCallback } from "react";
import { searchArtists, getArtistProfile, lastfmGetArtist, CONFIG, formatNumber } from "../services/api";
import { usePaginatedSearch, useDebounce, useAsync } from "../hooks/useApi";
import { SkeletonGrid, ApiKeyBanner, ErrorState, EmptyState, LoadMoreButton, LiveBadge } from "../components/UI";
import { FaInstagram, FaTwitter, FaFacebookF, FaYoutube, FaGlobe } from "react-icons/fa";

const GENRE_FILTERS = ["All", "Rock", "Electronic", "Jazz", "Classical", "Pop", "Hip-Hop", "R&B", "Metal"];

export default function Artists() {
  const [keyword, setKeyword] = useState("");
  const [genre, setGenre] = useState("All");
  const [selected, setSelected] = useState(null);
  const isApiKeySet = CONFIG.TICKETMASTER_KEY !== "YOUR_TICKETMASTER_API_KEY";

  const searchFn = useCallback((params) => searchArtists({ ...params, classificationName: "music" }), []);

  const { results: artists, total, loading, error, initialLoad, search, loadMore, hasMore } =
    usePaginatedSearch(searchFn, { keyword: "music", size: 20 });

  const handleFilter = (updates) => {
    const kw = updates.keyword ?? keyword;
    const g = updates.genre ?? genre;
    if ("keyword" in updates) setKeyword(kw);
    if ("genre" in updates) setGenre(g);
    search({
      keyword: g !== "All" ? g : kw || "music",
      size: 20,
    });
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-6 mt-8 mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-px h-8 bg-[#c9a84c]" />
          <span className="text-[10px] tracking-[0.4em] text-[#c9a84c] uppercase">Performing Artists</span>
          {isApiKeySet && <LiveBadge />}
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <h1 className="font-display text-5xl md:text-7xl leading-none tracking-tight">
            The<br /><span className="text-[#c9a84c]">Talent.</span>
          </h1>
          <p className="text-white/40 text-sm max-w-xs leading-relaxed md:mb-2">
            Discover artists from across the music spectrum — live from Ticketmaster{isApiKeySet ? " & Last.fm" : ""}.
            {total > 0 && <span className="block text-[#c9a84c]/70 mt-1">{total.toLocaleString()} artists found.</span>}
          </p>
        </div>

        {!isApiKeySet && <ApiKeyBanner service="Ticketmaster" />}

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative">
            <svg viewBox="0 0 24 24" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 fill-white/25 pointer-events-none">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
            <input
              type="text"
              value={keyword}
              onChange={(e) => handleFilter({ keyword: e.target.value })}
              placeholder="Search artists..."
              className="pl-9 pr-4 py-2.5 bg-white/3 border border-white/8 rounded-xl text-sm text-white placeholder-white/20 outline-none focus:border-[#c9a84c]/40 transition-colors w-52"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {GENRE_FILTERS.map((g) => (
              <button
                key={g}
                onClick={() => handleFilter({ genre: g })}
                className={`px-3 py-1.5 rounded-full text-[10px] tracking-[0.15em] uppercase transition-all ${genre === g ? "bg-[#c9a84c] text-black font-bold" : "border border-white/10 text-white/40 hover:border-white/25"}`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {error ? (
          <ErrorState message={error} onRetry={() => search({ keyword: keyword || "music" })} />
        ) : loading && initialLoad ? (
          <SkeletonGrid count={6} type="artist" />
        ) : artists.length === 0 ? (
          <EmptyState title="No artists found" subtitle="Try a different genre or search term." icon="🎵" />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {artists.map((artist, i) => (
                <ArtistCard
                  key={artist.id}
                  artist={artist}
                  index={i}
                  onClick={() => setSelected(artist)}
                />
              ))}
            </div>
            <LoadMoreButton onClick={loadMore} loading={loading} hasMore={hasMore} total={total} shown={artists.length} />
          </>
        )}
      </div>

      {selected && <ArtistModal artist={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function ArtistCard({ artist, index, onClick }) {
  return (
    <div
      onClick={onClick}
      className="animate-fadeUp group bg-[#0f0f17] border border-white/5 rounded-2xl overflow-hidden cursor-pointer hover:border-[#c9a84c]/20 transition-all duration-300"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={artist.image}
          alt={artist.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f17] to-transparent" />
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-display text-xl line-clamp-1">{artist.name}</h3>
            <p className="text-[10px] tracking-wider text-[#c9a84c]/80 mt-0.5">{artist.genre}{artist.subGenre ? ` · ${artist.subGenre}` : ""}</p>
          </div>
          {artist.upcomingEvents > 0 && (
            <div className="text-right">
              <p className="text-sm font-medium text-white/60">{artist.upcomingEvents}</p>
              <p className="text-[9px] text-white/25">shows</p>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-1 mt-3">
          {artist.tags.slice(0, 3).map((t) => (
            <span key={t} className="text-[9px] tracking-wider px-1.5 py-0.5 rounded border border-white/10 text-white/30 uppercase">{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

const getExternalLinks = (links = {}) => {
  return {
    youtube: links.youtube?.[0]?.url,
    twitter: links.twitter?.[0]?.url,
    facebook: links.facebook?.[0]?.url,
    instagram: links.instagram?.[0]?.url,
    website: links.homepage?.[0]?.url,
  };
};

function ArtistModal({ artist, onClose }) {
  const external = getExternalLinks(artist.externalLinks);

  const { data: enriched, loading } = useAsync(
    () => lastfmGetArtist(artist.name),
    [artist.name]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-[#0f0f17] border border-white/8 rounded-2xl overflow-hidden max-w-lg w-full animate-fadeUp shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="relative h-64">
          <img
            src={enriched?.image && !enriched.image.includes("2a96cbd8b46e442fc41c2b86b821562f") ? enriched.image : artist.image}
            alt={artist.name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80"; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f17] via-[#0f0f17]/30 to-transparent" />
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 border border-white/10 flex items-center justify-center hover:border-white/30 transition-colors">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white/60"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
          </button>
          <div className="absolute bottom-4 left-6">
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#c9a84c] mb-1">{artist.genre}</p>
            <h2 className="font-display text-3xl">{artist.name}</h2>
          </div>
        </div>
        <div className="p-6 space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Upcoming", value: artist.upcomingEvents || "—" },
              { label: "Listeners", value: enriched?.listeners ? formatNumber(enriched.listeners) : loading ? "…" : "—" },
              { label: "Plays", value: enriched?.playcount ? formatNumber(enriched.playcount) : loading ? "…" : "—" },
            ].map((s) => (
              <div key={s.label} className="bg-white/3 rounded-xl p-3 text-center">
                <p className="text-[9px] tracking-widest uppercase text-white/25 mb-1">{s.label}</p>
                <p className="text-sm font-medium text-[#c9a84c]">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Bio from Last.fm */}
          {loading ? (
            <div className="h-16 bg-white/3 rounded-xl animate-pulse" />
          ) : enriched?.bio ? (
            <div>
              <p className="text-[9px] tracking-[0.3em] uppercase text-white/25 mb-2">Biography</p>
              <p className="text-sm text-white/50 leading-relaxed line-clamp-4">{enriched.bio}</p>
            </div>
          ) : null}

          {/* Tags */}
          {(enriched?.tags || artist.tags)?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {(enriched?.tags || artist.tags).slice(0, 8).map((t) => (
                <span key={t} className="text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full border border-[#c9a84c]/20 text-[#c9a84c]/70 bg-[#c9a84c]/5">{t}</span>
              ))}
            </div>
          )}

          {/* Similar Artists */}
          {enriched?.similar?.length > 0 && (
            <div>
              <p className="text-[9px] tracking-[0.3em] uppercase text-white/25 mb-2">Similar Artists</p>
              <div className="flex flex-wrap gap-1.5">
                {enriched.similar.slice(0, 5).map((s) => (
                  <span key={s} className="text-[10px] px-2 py-1 rounded-lg bg-white/3 border border-white/8 text-white/40">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* External Links */}
          {Object.values(external).some(Boolean) && (
            <div>
              <p className="text-[9px] tracking-[0.3em] uppercase text-white/25 mb-2">
                Connect
              </p>

              <div className="flex flex-wrap gap-2">

                {external.website && (
                  <a href={external.website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] rounded-full border border-white/10 text-white/40 hover:border-white/30 transition">
                    <FaGlobe className="text-xs" />
                    Website
                  </a>
                )}

                {external.instagram && (
                  <a href={external.instagram} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] rounded-full border border-pink-500/20 text-pink-400 hover:border-pink-400 transition">
                    <FaInstagram className="text-xs" />
                    Instagram
                  </a>
                )}

                {external.twitter && (
                  <a href={external.twitter} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] rounded-full border border-blue-400/20 text-blue-400 hover:border-blue-400 transition">
                    <FaTwitter className="text-xs" />
                    Twitter
                  </a>
                )}

                {external.facebook && (
                  <a href={external.facebook} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] rounded-full border border-blue-600/20 text-blue-500 hover:border-blue-500 transition">
                    <FaFacebookF className="text-xs" />
                    Facebook
                  </a>
                )}

                {external.youtube && (
                  <a href={external.youtube} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] rounded-full border border-red-500/20 text-red-400 hover:border-red-400 transition">
                    <FaYoutube className="text-xs" />
                    YouTube
                  </a>
                )}

              </div>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            {artist.url && (
              <a href={artist.url} target="_blank" rel="noopener noreferrer" className="flex-1 py-3 bg-[#c9a84c] text-black text-[11px] tracking-[0.2em] uppercase font-bold rounded-xl hover:bg-[#dbb95e] transition-colors flex items-center justify-center gap-2">
                View on Ticketmaster
              </a>
            )}
            {enriched?.url && (
              <a href={enriched.url} target="_blank" rel="noopener noreferrer" className="flex-1 py-3 border border-white/10 text-white/50 text-[11px] tracking-[0.2em] uppercase rounded-xl hover:border-white/20 transition-colors flex items-center justify-center">
                Last.fm Profile
              </a>
            )}
          </div>
          <p className="text-[9px] text-center text-white/20">Data from Ticketmaster · Last.fm · MusicBrainz</p>
        </div>
      </div>
    </div>
  );
}
