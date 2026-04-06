import { useState } from "react";
import emailjs from "emailjs-com";

const PAYMENT_METHODS = [
  { id: "card", label: "Credit / Debit Card", icon: "💳" },
  { id: "upi", label: "UPI", icon: "⚡" },
  { id: "netbanking", label: "Net Banking", icon: "🏦" },
];

const sendEmail = async (tickets, form) => {
  // console.log("🚀 sendEmail called");
  // console.log("FORM EMAIL:", form.email);

  try {
    const res = await emailjs.send(
      import.meta.env.VITE_EMAIL_SERVICE_ID,
      import.meta.env.VITE_EMAIL_TEMPLATE_ID,
      {
        to_name: form.name,
        email: form.email,
        event_name: tickets[0].eventTitle,
        event_date: tickets[0].date,
        event_time: tickets[0].time,
        seats: tickets.map(t => t.seatId).join(", "),
        payment_id: tickets[0].paymentId,
      },
      import.meta.env.VITE_EMAIL_PUBLIC_KEY
    );


    //console.log("✅ Email sent:", res);

  } catch (err) {
    console.error("❌ Email failed FULL:", err?.text || err);
  }
};

const Field = ({ label, id, type = "text", value, onChange, error, placeholder, className = "" }) => (
  <div className={className}>
    <label className="block text-[10px] tracking-[0.2em] uppercase text-white/40 mb-1.5">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full bg-white/3 border rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all focus:bg-white/5
          ${error ? "border-red-500/50 focus:border-red-500" : "border-white/8 focus:border-[#c9a84c]/50"}`}
    />
    {error && <p className="text-[10px] text-red-400 mt-1">{error}</p>}
  </div>
);

export default function Checkout({ cart, onBack, onConfirm }) {
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [form, setForm] = useState({ name: "", email: "", phone: "", card: "", expiry: "", cvv: "", upi: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const subtotal = cart.reduce((s, i) => s + i.price, 0);
  const convenience = Math.round(subtotal * 0.03);
  const total = subtotal + convenience;

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.email.includes("@")) e.email = "Valid email required";
    if (!/^\d{10}$/.test(form.phone)) e.phone = "10-digit number required";
    if (paymentMethod === "card") {
      if (form.card.replace(/\s/g, "").length < 16) e.card = "Enter 16-digit card number";
      if (!form.expiry.match(/^\d{2}\/\d{2}$/)) e.expiry = "MM/YY format";
      if (form.cvv.length < 3) e.cvv = "3-digit CVV";
    }
    if (paymentMethod === "upi" && !form.upi.includes("@")) e.upi = "Valid UPI ID required";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);

    const options = {
      key: import.meta.env.VITE_RAZOR_API_KEY,
      amount: total * 100,
      currency: "INR",
      name: "STAGEPASS",
      description: "Ticket Booking",

      handler: function (response) {
        console.log("✅ PAYMENT SUCCESS", response);

        const tickets = cart.map((item) => ({
          ...item,
          ticketId:
            "TKT-" + Math.random().toString(36).substr(2, 8).toUpperCase(),
          holder: form.name,
          email: form.email,
          paymentId: response.razorpay_payment_id,


          qrData: JSON.stringify({
            event: item.eventTitle,
            seat: item.seatId,
            user: form.name,
            id: item.id,
          }),

          issuedAt: new Date().toLocaleString(),
        }));

        setLoading(false);

        sendEmail(tickets, form);

        onConfirm(tickets);
      },

      prefill: {
        name: form.name,
        email: form.email,
        contact: form.phone,
      },

      theme: {
        color: "#c9a84c",
      },

      modal: {
        ondismiss: () => setLoading(false),
      },
    };

    const rzp = new window.Razorpay(options);

    rzp.on("payment.failed", function (response) {
      console.error("❌ Payment Failed:", response.error);
      alert("Payment failed! Try again.");
      setLoading(false);
    });

    rzp.open();
  };


  const formatCard = (v) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const formatExpiry = (v) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length >= 3 ? d.slice(0, 2) + "/" + d.slice(2) : d;
  };


  return (
    <div className="pt-24 pb-20 px-6 max-w-6xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[11px] tracking-widest uppercase text-white/40 hover:text-[#c9a84c] transition-colors mb-8 mt-4 group"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" /></svg>
        Back to Seats
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Left: Form */}
        <div className="lg:col-span-3 space-y-6">
          {/* Contact Info */}
          <div className="bg-[#0f0f17] border border-white/5 rounded-2xl p-6">
            <h3 className="font-display text-base tracking-wider mb-5">Contact Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} error={errors.name} placeholder="Your full name" className="sm:col-span-2" />
              <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} error={errors.email} placeholder="ticket@example.com" />
              <Field
                label="Phone"
                type="tel"
                value={form.phone}
                onChange={(v) =>
                  setForm((prev) => ({
                    ...prev,
                    phone: v.replace(/\D/g, "").slice(0, 10),
                  }))
                }
                error={errors.phone}
                placeholder="10-digit number"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-[#0f0f17] border border-white/5 rounded-2xl p-6">
            <h3 className="font-display text-base tracking-wider mb-5">Payment Method</h3>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${paymentMethod === m.id
                    ? "border-[#c9a84c]/50 bg-[#c9a84c]/5"
                    : "border-white/8 hover:border-white/15"
                    }`}
                >
                  <span className="text-xl">{m.icon}</span>
                  <span className="text-[10px] tracking-wider text-white/50">{m.label}</span>
                </button>
              ))}
            </div>

            {paymentMethod === "card" && (
              <div className="space-y-4">
                <Field label="Card Number" value={form.card} onChange={(v) => setForm({ ...form, card: formatCard(v) })} error={errors.card} placeholder="0000 0000 0000 0000" />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Expiry" value={form.expiry} onChange={(v) => setForm({ ...form, expiry: formatExpiry(v) })} error={errors.expiry} placeholder="MM/YY" />
                  <Field label="CVV" value={form.cvv} onChange={(v) => setForm({ ...form, cvv: v.replace(/\D/g, "").slice(0, 3) })} error={errors.cvv} placeholder="123" />
                </div>
              </div>
            )}

            {paymentMethod === "upi" && (
              <Field label="UPI ID" value={form.upi} onChange={(v) => setForm({ ...form, upi: v })} error={errors.upi} placeholder="yourname@upi" />
            )}

            {paymentMethod === "netbanking" && (
              <div className="grid grid-cols-2 gap-2">
                {["HDFC", "SBI", "ICICI", "Axis", "Kotak", "Others"].map((b) => (
                  <div key={b} className="py-2 px-3 rounded-lg border border-white/8 text-xs text-white/40 text-center hover:border-white/20 cursor-pointer transition-colors">{b}</div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 bg-[#0f0f17] border border-white/5 rounded-2xl p-6 space-y-5">
            <h3 className="font-display text-base tracking-wider">Order Summary</h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 text-xs truncate">{item.eventTitle}</p>
                    <p className="text-white/30 text-[11px]">
                      Seat {item.seatId} ·{" "}
                      <span className={item.type === "VIP" ? "text-[#c9a84c]" : "text-white/40"}>{item.type}</span>
                    </p>
                  </div>
                  <p className="text-white/70 text-xs flex-shrink-0">₹{item.price.toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-white/5 pt-4 space-y-2">
              <div className="flex justify-between text-xs text-white/40">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-white/40">
                <span>Convenience Fee (3%)</span>
                <span>₹{convenience.toLocaleString()}</span>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4 flex justify-between items-center">
              <span className="text-sm text-white/60 tracking-wider">Total</span>
              <span className="font-display text-2xl text-[#c9a84c]">₹{total.toLocaleString()}</span>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 bg-[#c9a84c] text-black text-xs tracking-[0.25em] uppercase font-bold rounded-xl hover:bg-[#dbb95e] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30" strokeDashoffset="10" />
                  </svg>
                  Processing...
                </>
              ) : (
                <>Pay ₹{total.toLocaleString()}</>
              )}
            </button>

            <div className="flex items-center justify-center gap-2">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white/20"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" /></svg>
              <span className="text-[10px] text-white/20 tracking-wider">256-bit SSL Encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
