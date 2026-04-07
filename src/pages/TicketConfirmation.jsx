import { useEffect, useRef, useState } from "react";
import QRCodeLib from "qrcode";
import JSZip from "jszip";

// ---------- QRCode ----------
function QRCode({ data, size = 140 }) {
  const [qr, setQr] = useState("");
  useEffect(() => {
    QRCodeLib.toDataURL(data, { width: size, margin: 2 })
      .then(setQr)
      .catch(console.error);
  }, [data, size]);
  return (
    <div className="rounded overflow-hidden">
      {qr ? (
        <img src={qr} alt="QR Code" width={size} height={size} />
      ) : (
        <p className="text-xs text-white/30">Generating QR...</p>
      )}
    </div>
  );
}

// ---------- TicketCard ----------
function TicketCard({ ticket, index, frontRef  }) {
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
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front */}
          <div
          ref={frontRef}
            className="relative bg-[#0f0f17] border border-white/8 rounded-2xl overflow-hidden"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="relative h-28 bg-gradient-to-br from-[#1a1608] to-[#0f0f17] overflow-hidden">
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg, #c9a84c 0, #c9a84c 1px, transparent 0, transparent 50%)",
                  backgroundSize: "10px 10px",
                }}
              />
              <div className="absolute inset-0 flex items-center px-6">
                <div>
                  <p className="font-display text-xl tracking-wide">{ticket.eventTitle}</p>
                  <p className="text-xs text-white/40 mt-0.5">
                    {ticket.date} · {ticket.time}
                  </p>
                </div>
                <div className="ml-auto">
                  <span
                    className={`text-xs tracking-widest uppercase px-3 py-1 rounded-full font-bold ${
                      ticket.type === "VIP"
                        ? "bg-[#c9a84c]/20 text-[#c9a84c] border border-[#c9a84c]/30"
                        : "bg-white/8 text-white/50"
                    }`}
                  >
                    {ticket.type}
                  </span>
                </div>
              </div>
            </div>

            <div className="relative flex items-center px-3">
              <div className="absolute -left-3 w-6 h-6 rounded-full bg-[#0a0a0f]" />
              <div className="w-full border-t border-dashed border-white/10 my-0" />
              <div className="absolute -right-3 w-6 h-6 rounded-full bg-[#0a0a0f]" />
            </div>

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
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <div className="p-1 bg-white rounded-xl shadow-lg shadow-black/40">
              <QRCode data={ticket.qrData} size={200} />
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

// ---------- Main ----------
export default function TicketConfirmation({ tickets, onHome }) {
  const cardRefs = useRef([]);
  const frontRefs = useRef([]);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;

      if (tickets.length === 1) {
        const canvas = await html2canvas(frontRefs.current[0], {
          backgroundColor: "#0a0a0f",
          scale: 2,
        });
        const link = document.createElement("a");
        link.download = `ticket-${tickets[0].ticketId}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      } else {
        const zip = new JSZip();
        for (let i = 0; i < tickets.length; i++) {
          const canvas = await html2canvas(frontRefs.current[i], {
            backgroundColor: "#0a0a0f",
            scale: 2,
          });
          const blob = await new Promise((res) => canvas.toBlob(res, "image/png"));
          zip.file(`ticket-${tickets[i].ticketId}.png`, blob);
        }
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const link = document.createElement("a");
        link.download = "tickets.zip";
        link.href = URL.createObjectURL(zipBlob);
        link.click();
        URL.revokeObjectURL(link.href);
      }
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="pt-24 pb-20 px-6 max-w-4xl mx-auto">
      {/* Success Header */}
      <div className="text-center mb-14 mt-8 animate-fadeUp">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/20 mb-6">
          <svg viewBox="0 0 24 24" className="w-9 h-9 fill-[#c9a84c]">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
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
            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
          </svg>
          <span className="text-xs text-white/50 tracking-wider">
            Tickets emailed to {tickets[0]?.email}
          </span>
        </div>
      </div>

      {/* Tickets */}
      <div className="space-y-4 mb-12">
        {tickets.map((ticket, i) => (
          <TicketCard
            key={ticket.ticketId}
            ticket={ticket}
            index={i}
            frontRef={(el) => (frontRefs.current[i] = el)}
          />
        ))}
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {[
          { icon: "📱", title: "Mobile Entry", desc: "Show QR code at the gate. No printout needed." },
          { icon: "⏰", title: "Arrive Early", desc: "Doors open 60 minutes before showtime." },
          { icon: "🔄", title: "Transfers", desc: "Tickets can be transferred via Settings > My Tickets." },
        ].map((tip) => (
          <div
            key={tip.title}
            className="bg-[#0f0f17] border border-white/5 rounded-xl p-4 text-center"
          >
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

        {/* ✅ Download button */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="px-8 py-3.5 border border-white/10 text-white/50 text-xs tracking-[0.2em] uppercase rounded-xl hover:border-white/20 hover:text-white/70 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {downloading ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
              Preparing...
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
              </svg>
              Download Tickets
            </>
          )}
        </button>
      </div>
    </div>
  );
}