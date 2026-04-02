import { useState } from "react";

export default function SeatSelection({ event, cart, onAddToCart, onBack, onViewCart }) {
  const [selectedType, setSelectedType] = useState("general");
  const [hoveredSeat, setHoveredSeat] = useState(null);
  const [justAdded, setJustAdded] = useState(null);

  const isVipRow = (row) => event.vipRows.includes(row);
  const isBooked = (seatId) => event.bookedSeats.includes(seatId);
  const isInCart = (seatId) => cart.some((c) => c.seatId === seatId && c.eventId === event.id);

  const getPrice = (isVip) => {
    const phase = event.pricing.phase;
    return isVip ? event.pricing[phase].vip : event.pricing[phase].general;
  };

  const handleSeatClick = (seatId, isVip) => {
    if (isBooked(seatId) || isInCart(seatId)) return;
    const price = getPrice(isVip);
    const type = isVip ? "VIP" : "General";
    onAddToCart({
      eventId: event.id,
      eventTitle: event.title,
      date: event.date,
      time: event.time,
      seatId,
      type,
      price,
      isVip,
    });
    setJustAdded(seatId);
    setTimeout(() => setJustAdded(null), 1200);
  };

  const cartCountForEvent = cart.filter((c) => c.eventId === event.id).length;

  return (
    <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[11px] tracking-widest uppercase text-white/40 hover:text-[#c9a84c] transition-colors mb-8 mt-4 group"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current group-hover:-translate-x-0.5 transition-transform">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
        </svg>
        Back to Events
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: Event Info */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <div className="relative rounded-2xl overflow-hidden h-52">
              <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4">
                <h2 className="font-display text-2xl">{event.title}</h2>
                <p className="text-xs text-white/50 mt-0.5">{event.subtitle}</p>
              </div>
            </div>

            <div className="bg-[#0f0f17] border border-white/5 rounded-2xl p-5 space-y-3">
              {[
                { icon: "calendar", label: event.date + " · " + event.time },
                { icon: "location", label: event.venue },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {icon === "calendar" ? (
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#c9a84c]"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#c9a84c]"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                    )}
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed">{label}</p>
                </div>
              ))}
            </div>

            {/* Pricing */}
            <div className="bg-[#0f0f17] border border-white/5 rounded-2xl p-5">
              <p className="text-[10px] tracking-[0.3em] uppercase text-white/30 mb-4">Ticket Pricing</p>
              <div className="space-y-3">
                {["VIP", "General"].map((t) => {
                  const isVip = t === "VIP";
                  const price = getPrice(isVip);
                  return (
                    <div key={t} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isVip ? "bg-[#c9a84c]" : "bg-white/30"}`} />
                        <span className="text-sm text-white/60">{t}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-[#c9a84c]">₹{price.toLocaleString()}</p>
                        {event.pricing.phase === "earlyBird" && (
                          <p className="text-[9px] text-[#c9a84c]/60 tracking-wider">Early Bird</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {event.pricing.earlyBirdEnds && event.pricing.phase === "earlyBird" && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <p className="text-[10px] text-white/30 tracking-wide">
                    Early bird pricing ends <span className="text-[#c9a84c]">{event.pricing.earlyBirdEnds}</span>
                  </p>
                </div>
              )}
            </div>

            {cartCountForEvent > 0 && (
              <button
                onClick={onViewCart}
                className="w-full py-3 bg-[#c9a84c] text-black text-xs tracking-[0.2em] uppercase font-bold rounded-xl hover:bg-[#dbb95e] transition-colors"
              >
                View Cart ({cartCountForEvent})
              </button>
            )}
          </div>
        </div>

        {/* Right: Seat Map */}
        <div className="lg:col-span-2">
          <div className="bg-[#0f0f17] border border-white/5 rounded-2xl p-6 md:p-8">
            {/* Stage */}
            <div className="flex justify-center mb-10">
              <div className="relative">
                <div className="w-64 h-10 rounded-t-full bg-gradient-to-b from-[#c9a84c]/20 to-transparent border border-[#c9a84c]/20 flex items-center justify-center">
                  <span className="text-[10px] tracking-[0.4em] uppercase text-[#c9a84c]/60">Stage</span>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-5 justify-center mb-8">
              {[
                { color: "bg-[#c9a84c]", label: "VIP Available" },
                { color: "bg-white/20", label: "General" },
                { color: "bg-white/5 border border-white/10", label: "Booked" },
                { color: "bg-[#4c7dc9]", label: "In Cart" },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-sm ${color}`} />
                  <span className="text-[10px] tracking-wider text-white/40">{label}</span>
                </div>
              ))}
            </div>

            {/* Seat Grid */}
            <div className="space-y-2">
              {event.rows.map((row) => {
                const isVip = isVipRow(row);
                return (
                  <div key={row} className="flex items-center gap-3">
                    <span className="text-[11px] font-mono text-white/20 w-4 flex-shrink-0">{row}</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {Array.from({ length: event.seatsPerRow }, (_, i) => {
                        const seatId = `${row}${i + 1}`;
                        const booked = isBooked(seatId);
                        const inCart = isInCart(seatId);
                        const added = justAdded === seatId;

                        return (
                          <button
                            key={seatId}
                            disabled={booked}
                            onClick={() => handleSeatClick(seatId, isVip)}
                            onMouseEnter={() => setHoveredSeat(seatId)}
                            onMouseLeave={() => setHoveredSeat(null)}
                            title={`${seatId} · ${isVip ? "VIP" : "General"} · ₹${getPrice(isVip).toLocaleString()}`}
                            className={`relative w-7 h-7 rounded-sm text-[9px] font-mono transition-all duration-150 focus:outline-none
                              ${booked ? "bg-white/5 text-white/10 cursor-not-allowed" :
                                inCart ? "bg-[#4c7dc9] text-white scale-110 shadow-lg shadow-[#4c7dc9]/30" :
                                added ? "bg-[#4c7dc9] scale-125" :
                                isVip ? "bg-[#c9a84c]/20 border border-[#c9a84c]/40 text-[#c9a84c] hover:bg-[#c9a84c] hover:text-black hover:scale-110" :
                                "bg-white/8 border border-white/10 text-white/40 hover:bg-white/20 hover:scale-110"
                              }`}
                          >
                            {i + 1}
                          </button>
                        );
                      })}
                    </div>
                    {isVip && (
                      <span className="text-[9px] tracking-wider uppercase text-[#c9a84c]/50 ml-1">VIP</span>
                    )}
                  </div>
                );
              })}
            </div>

            

            {hoveredSeat && !isBooked(hoveredSeat) && !isInCart(hoveredSeat) && (
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <p className="text-xs text-white/40">
                  Seat <span className="text-white">{hoveredSeat}</span> ·{" "}
                  <span className={isVipRow(hoveredSeat[0]) ? "text-[#c9a84c]" : "text-white/60"}>
                    {isVipRow(hoveredSeat[0]) ? "VIP" : "General"}
                  </span>
                </p>
                <p className="text-sm font-medium text-[#c9a84c]">
                  ₹{getPrice(isVipRow(hoveredSeat[0])).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {/* Tip */}
          <p className="text-center text-[11px] text-white/20 tracking-wider mt-4">
            Click a seat to add it to your cart. Hover to preview pricing.
          </p>
        </div>
      </div>
    </div>
  );
}
