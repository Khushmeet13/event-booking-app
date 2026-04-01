// ─── SKELETON LOADERS ──────────────────────────────────────────────────────

export function SkeletonCard() {
  return (
    <div className="bg-[#0f0f17] border border-white/5 rounded-2xl overflow-hidden animate-pulse">
      <div className="h-48 bg-white/5" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-white/5 rounded w-3/4" />
        <div className="h-3 bg-white/5 rounded w-1/2" />
        <div className="h-3 bg-white/5 rounded w-full" />
        <div className="h-3 bg-white/5 rounded w-4/5" />
        <div className="flex justify-between items-center pt-2">
          <div className="flex gap-1">
            <div className="h-5 w-12 bg-white/5 rounded" />
            <div className="h-5 w-14 bg-white/5 rounded" />
          </div>
          <div className="h-4 w-20 bg-white/5 rounded" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonArtistCard() {
  return (
    <div className="bg-[#0f0f17] border border-white/5 rounded-2xl overflow-hidden animate-pulse">
      <div className="h-44 bg-white/5" />
      <div className="p-5 space-y-3">
        <div className="flex justify-between">
          <div className="space-y-1.5">
            <div className="h-5 bg-white/5 rounded w-32" />
            <div className="h-3 bg-white/5 rounded w-20" />
          </div>
          <div className="h-6 w-10 bg-white/5 rounded" />
        </div>
        <div className="h-3 bg-white/5 rounded w-full" />
        <div className="h-3 bg-white/5 rounded w-3/4" />
        <div className="flex gap-1 pt-1">
          <div className="h-5 w-12 bg-white/5 rounded-full" />
          <div className="h-5 w-16 bg-white/5 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonVenueCard() {
  return (
    <div className="bg-[#0f0f17] border border-white/5 rounded-2xl overflow-hidden animate-pulse">
      <div className="h-48 bg-white/5" />
      <div className="p-5 space-y-3">
        <div className="flex justify-between">
          <div className="space-y-1.5">
            <div className="h-5 bg-white/5 rounded w-40" />
            <div className="h-3 bg-white/5 rounded w-24" />
          </div>
          <div className="space-y-1">
            <div className="h-4 w-8 bg-white/5 rounded" />
            <div className="h-3 w-12 bg-white/5 rounded" />
          </div>
        </div>
        <div className="h-3 bg-white/5 rounded w-full" />
        <div className="h-3 bg-white/5 rounded w-2/3" />
        <div className="flex gap-1 pt-1">
          <div className="h-5 w-14 bg-white/5 rounded" />
          <div className="h-5 w-10 bg-white/5 rounded" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6, type = "event" }) {
  const Comp = type === "artist" ? SkeletonArtistCard : type === "venue" ? SkeletonVenueCard : SkeletonCard;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <Comp key={i} />
      ))}
    </div>
  );
}

// ─── API KEY BANNER ────────────────────────────────────────────────────────

export function ApiKeyBanner({ service = "Ticketmaster" }) {
  const links = {
    Ticketmaster: "https://developer.ticketmaster.com/",
    "Last.fm": "https://www.last.fm/api/account/create",
  };
  return (
    <div className="mb-6 bg-[#c9a84c]/8 border border-[#c9a84c]/20 rounded-xl px-5 py-4 flex items-start gap-3">
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#c9a84c] flex-shrink-0 mt-0.5">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
      </svg>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[#c9a84c] font-medium mb-0.5">API Key Required</p>
        <p className="text-[11px] text-white/50 leading-relaxed">
          Add your free{" "}
          <a href={links[service]} target="_blank" rel="noopener noreferrer" className="text-[#c9a84c] underline underline-offset-2">
            {service} API key
          </a>{" "}
          to <code className="bg-white/8 px-1.5 py-0.5 rounded text-white/70">.env</code> as{" "}
          <code className="bg-white/8 px-1.5 py-0.5 rounded text-white/70">
            {service === "Ticketmaster" ? "VITE_TM_API_KEY" : "VITE_LASTFM_API_KEY"}
          </code>{" "}
          to load live data. Showing demo mode until then.
        </p>
      </div>
    </div>
  );
}

// ─── ERROR STATE ───────────────────────────────────────────────────────────

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="w-14 h-14 rounded-full border border-red-500/20 bg-red-500/5 flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-red-400/60">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
      </div>
      <div>
        <p className="text-sm text-white/50 mb-1">Failed to load data</p>
        <p className="text-[11px] text-white/25 max-w-xs">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 border border-white/10 rounded-xl text-xs text-white/40 hover:border-[#c9a84c]/30 hover:text-[#c9a84c] transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}

// ─── EMPTY STATE ───────────────────────────────────────────────────────────

export function EmptyState({ title = "Nothing found", subtitle = "Try a different search or filter.", icon = "🎭" }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
      <div className="text-4xl">{icon}</div>
      <p className="text-sm text-white/50">{title}</p>
      <p className="text-[11px] text-white/25 max-w-xs">{subtitle}</p>
    </div>
  );
}

// ─── LIVE BADGE ────────────────────────────────────────────────────────────

export function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 text-[9px] tracking-widest uppercase px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400">
      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
      Live Data
    </span>
  );
}

// ─── LOAD MORE BUTTON ──────────────────────────────────────────────────────

export function LoadMoreButton({ onClick, loading, hasMore, total, shown }) {
  if (!hasMore) return null;
  return (
    <div className="flex flex-col items-center gap-2 mt-10">
      <p className="text-[11px] text-white/25">
        Showing {shown} of {total}
      </p>
      <button
        onClick={onClick}
        disabled={loading}
        className="px-8 py-3 border border-white/10 rounded-xl text-xs tracking-widest uppercase text-white/40 hover:border-[#c9a84c]/30 hover:text-[#c9a84c] transition-all disabled:opacity-50"
      >
        {loading ? "Loading..." : "Load More"}
      </button>
    </div>
  );
}
