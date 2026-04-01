import { useEffect, useRef, useState } from "react";

function generateQRPattern(data) {
  // Simple deterministic QR-like visual pattern from string hash
  const size = 21;
  const hash = [...data].reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) | 0, 0);
  const pattern = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Finder patterns (corners)
      const inTopLeft = r < 7 && c < 7;
      const inTopRight = r < 7 && c >= size - 7;
      const inBottomLeft = r >= size - 7 && c < 7;
      if (inTopLeft || inTopRight || inBottomLeft) {
        const lr = inTopLeft ? r : inTopRight ? r : r - (size - 7);
        const lc = inTopLeft ? c : inTopRight ? c - (size - 7) : c;
        const isOuter = lr === 0 || lr === 6 || lc === 0 || lc === 6;
        const isInner = lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4;
        pattern.push(isOuter || isInner ? 1 : 0);
      } else {
        const seed = (hash ^ (r * 7 + c * 13) ^ (r * c)) & 1;
        pattern.push(seed);
      }
    }
  }
  return { pattern, size };
}

function QRCode({ data, size = 140 }) {
  const { pattern, size: gridSize } = generateQRPattern(data);
  const cellSize = size / gridSize;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded">
      <rect width={size} height={size} fill="white" />
      {pattern.map((v, i) => {
        if (!v) return null;
        const row = Math.floor(i / gridSize);
        const col = i % gridSize;
        return (
          <rect
            key={i}
            x={col * cellSize}
            y={row * cellSize}
            width={cellSize}
            height={cellSize}
            fill="#0a0a0f"
          />
        );
      })}
    </svg>
  );
}

function TicketCard({ ticket, index }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="animate-fadeUp"
      style={{ animationDelay: `${index * 0.12}s` }}
    >
      <div
        className="relative cursor-pointer"
        style={{ perspective: "1000px" }}
        onClick={() => setFlipped(!flipped)}
      >
        <div
          className="relative transition-all duration-700"
          style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          {/* Front */}
          <div
            className="relative bg-[#0f0f17] border border-white/8 rounded-2xl overflow-hidden"
            style={{ backfaceVisibility: "hidden" }}
          >
            {/* Top section */}
            <div className="relative h-28 bg-gradient-to-br from-[#1a1608] to-[#0f0f17] overflow-hidden">
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: "repeating-linear-gradient(45deg, #c9a84c 0, #c9a84c 1px, transparent 0, transparent 50%)", backgroundSize: "10px 10px" }}
              />
              <div className="absolute inset-0 flex items-center px-6">
                <div>
                  <p className="font-display text-xl tracking-wide">{ticket.eventTitle}</p>
                  <p className="text-xs text-white/40 mt-0.5">{ticket.date} · {ticket.time}</p>
                </div>
                <div className="ml-auto">
                  <span className={`text-xs tracking-widest uppercase px-3 py-1 rounded-full font-bold ${ticket.type === "VIP" ? "bg-[#c9a84c]/20 text-[#c9a84c] border border-[#c9a84c]/30" : "bg-white/8 text-white/50"}`}>
                    {ticket.type}
                  </span>
                </div>
              </div>
            </div>

            {/* Perforated edge */}
            <div className="relative flex items-center px-3">
              <div className="absolute -left-3 w-6 h-6 rounded-full bg-[#0a0a0f]" />
              <div className="w-full border-t border-dashed border-white/10 my-0" />
              <div className="absolute -right-3 w-6 h-6 rounded-full bg-[#0a0a0f]" />
            </div>

            {/* Bottom section */}
            <div className="p-5 grid grid-cols-3 gap-4">
              <div>
                <p className="text-[9px] tracking-[0.2em] uppercase text-white/25 mb-1">Seat</p>
                <p className="font-display text-2xl text-[#c9a84c]">{ticket.seatId}</p>
              </div>
              <div>
                <p className="text-[9px] tracking-[0.2em] uppercase text-white/25 mb-1">Ticket ID</p>
                <p className="text-xs font-mono text-white/60">{ticket.ticketId}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] tracking-[0.2em] uppercase text-white/25 mb-1">Holder</p>
                <p className="text-xs text-white/60 truncate">{ticket.holder}</p>
              </div>
            </div>

            <div className="absolute bottom-3 right-4 text-[9px] text-white/15 tracking-widest">
              Tap to view QR
            </div>
          </div>

          {/* Back (QR) */}
          <div
            className="absolute inset-0 bg-[#0f0f17] border border-white/8 rounded-2xl flex flex-col items-center justify-center gap-4 p-6"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <div className="p-3 bg-white rounded-xl shadow-lg shadow-black/40">
              <QRCode data={ticket.qrData} size={130} />
            </div>
            <div className="text-center">
              <p className="font-mono text-xs text-[#c9a84c] tracking-wider">{ticket.ticketId}</p>
              <p className="text-[10px] text-white/30 mt-1">Scan at entry gate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TicketConfirmation({ tickets, onHome }) {
  return (
    <div className="pt-24 pb-20 px-6 max-w-4xl mx-auto">
      {/* Success Header */}
      <div className="text-center mb-14 mt-8 animate-fadeUp">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/20 mb-6">
          <svg viewBox="0 0 24 24" className="w-9 h-9 fill-[#c9a84c]">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
        </div>
        <h1 className="font-display text-4xl md:text-5xl mb-3">
          You're <span className="text-[#c9a84c]">In.</span>
        </h1>
        <p className="text-white/40 text-sm max-w-sm mx-auto leading-relaxed">
          Your tickets have been confirmed. Tap any ticket to reveal its QR code for venue entry.
        </p>

        <div className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-full bg-white/3 border border-white/8">
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#c9a84c]">
            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
          <span className="text-xs text-white/50 tracking-wider">
            Tickets emailed to {tickets[0]?.email}
          </span>
        </div>
      </div>

      {/* Tickets */}
      <div className="space-y-4 mb-12">
        {tickets.map((ticket, i) => (
          <TicketCard key={ticket.ticketId} ticket={ticket} index={i} />
        ))}
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {[
          { icon: "📱", title: "Mobile Entry", desc: "Show QR code at the gate. No printout needed." },
          { icon: "⏰", title: "Arrive Early", desc: "Doors open 60 minutes before showtime." },
          { icon: "🔄", title: "Transfers", desc: "Tickets can be transferred via Settings > My Tickets." },
        ].map((tip) => (
          <div key={tip.title} className="bg-[#0f0f17] border border-white/5 rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">{tip.icon}</div>
            <p className="text-xs font-medium text-white/70 mb-1">{tip.title}</p>
            <p className="text-[11px] text-white/30 leading-relaxed">{tip.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onHome}
          className="px-8 py-3.5 bg-[#c9a84c] text-black text-xs tracking-[0.25em] uppercase font-bold rounded-xl hover:bg-[#dbb95e] transition-colors"
        >
          Browse More Events
        </button>
        <button className="px-8 py-3.5 border border-white/10 text-white/50 text-xs tracking-[0.2em] uppercase rounded-xl hover:border-white/20 hover:text-white/70 transition-all">
          Download Tickets
        </button>
      </div>
    </div>
  );
}
