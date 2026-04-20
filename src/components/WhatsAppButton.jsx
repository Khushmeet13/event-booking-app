import { useState } from "react";

export default function WhatsAppChat({ phoneNumber, agentName = "Support", agentRole = "Typically replies instantly" }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const handleSend = () => {
    const text = message.trim() || "Hi! I need help with my booking.";
    window.open(
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  return (
    <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 9999, fontFamily: "sans-serif" }}>

      {/* Chat Card */}
      {open && (
        <div style={{
          position: "absolute", bottom: "70px", right: 0,
          width: "300px", borderRadius: "16px",
          background: "#fff", boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{ background: "#075E54", padding: "14px 16px", display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "50%",
              background: "#25D366", display: "flex", alignItems: "center",
              justifyContent: "center", color: "#fff", fontWeight: 600, fontSize: "16px",
            }}>
              {agentName[0]}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#fff", fontWeight: 600, fontSize: "14px" }}>{agentName}</div>
              <div style={{ color: "#9de3d6", fontSize: "12px" }}>{agentRole}</div>
            </div>
            <button onClick={() => setOpen(false)}
              style={{ background: "none", border: "none", color: "#9de3d6", fontSize: "18px", cursor: "pointer", lineHeight: 1 }}>
              ✕
            </button>
          </div>

          {/* Chat bubble area */}
          <div style={{ background: "#ece5dd", padding: "16px", minHeight: "80px" }}>
            <div style={{
              background: "#fff", borderRadius: "0 8px 8px 8px",
              padding: "10px 12px", fontSize: "13px", color: "#333",
              boxShadow: "0 1px 2px rgba(0,0,0,0.1)", maxWidth: "85%", lineHeight: 1.5,
            }}>
              👋 Hi there! How can we help you today?
              <div style={{ fontSize: "11px", color: "#999", marginTop: "4px", textAlign: "right" }}>
                {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>

          {/* Input */}
          <div style={{ background: "#f0f0f0", padding: "10px 12px", display: "flex", gap: "8px", alignItems: "center" }}>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message"
              style={{
                flex: 1, padding: "8px 12px", borderRadius: "24px",
                border: "none", fontSize: "13px", outline: "none",
                background: "#fff", color: "#333",
              }}
            />
            <button onClick={handleSend} style={{
              background: "#25D366", border: "none", borderRadius: "50%",
              width: "36px", height: "36px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="white">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button onClick={() => setOpen(!open)} style={{
        width: "56px", height: "56px", borderRadius: "50%",
        background: "#25D366", border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
      }}>
        {open
          ? <svg viewBox="0 0 24 24" width="22" height="22" fill="white"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          : <svg viewBox="0 0 24 24" width="28" height="28" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.135.558 4.14 1.535 5.878L0 24l6.335-1.516A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.877 0-3.628-.5-5.143-1.371l-.369-.214-3.763.9.944-3.668-.241-.383A9.937 9.937 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
        }
      </button>
    </div>
  );
}
