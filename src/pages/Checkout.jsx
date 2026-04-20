import { useState } from "react";
import emailjs from "emailjs-com";
import QRCode from "qrcode";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";


const sendEmail = async (tickets, form) => {
  // console.log("🚀 sendEmail called");
  // console.log("FORM EMAIL:", form.email);

  try {
    const qrImage = await QRCode.toDataURL(tickets[0].qrData);

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

        qr_code: qrImage,
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
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    dialCode: "91",
    address: "",
    city: "",
    state: "",
    zip: "",
    sendOnWhatsApp: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const subtotal = cart.reduce((s, i) => s + i.price, 0);
  const convenience = Math.round(subtotal * 0.03);
  const total = subtotal + convenience;

  const getLocalNumber = () => {
    const dialLen = form.dialCode.length;
    return form.phone.slice(dialLen);
  };


  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is Required";
    if (!form.email.includes("@")) e.email = "Valid email required";
    const local = getLocalNumber();
    if (local.length < 7) e.phone = "Enter a valid phone number";
    if (!form.address.trim()) e.address = "Address is Required";
    if (!form.city.trim()) e.city = "City is Required";
    if (!form.state.trim()) e.state = "State is Required";
    if (!form.zip.trim()) e.zip = "Zip Code is Required";

    return e;
  };

  const buildWhatsappUrl = (tickets, form) => {
    const message =
      `🎟️ *STAGEPASS - Booking Confirmed!*\n\n` +
      `👤 Name: ${form.name}\n` +
      `🎭 Event: ${tickets[0].eventTitle}\n` +
      `📅 Date: ${tickets[0].date}\n` +
      `⏰ Time: ${tickets[0].time}\n` +
      `💺 Seats: ${tickets.map(t => t.seatId).join(", ")}\n` +
      `🆔 Payment ID: ${tickets[0].paymentId}\n` +
      `🎫 Ticket ID: ${tickets[0].ticketId}\n\n` +
      `Thank you for booking!`;
    return `https://wa.me/${form.phone}?text=${encodeURIComponent(message)}`;
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
        //console.log("✅ PAYMENT SUCCESS", response);

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
        const waUrl = form.sendOnWhatsApp ? buildWhatsappUrl(tickets, form) : null;
        onConfirm(tickets, waUrl);

      },

      prefill: {
        name: form.name,
        email: form.email,
        contact: "+" + form.phone,
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
    <>
      <style>{`
        .stagepass-phone .react-tel-input .flag-dropdown {
          background: transparent !important;
          border: none !important;
          border-right: 1px solid rgba(255,255,255,0.08) !important;
          border-radius: 12px 0 0 12px !important;
        }
        .stagepass-phone .react-tel-input .flag-dropdown:hover,
        .stagepass-phone .react-tel-input .flag-dropdown.open {
          background: rgba(255,255,255,0.05) !important;
        }
        .stagepass-phone .react-tel-input .selected-flag {
          background: transparent !important;
          border-radius: 12px 0 0 12px !important;
          padding: 0 8px 0 12px;
        }
        .stagepass-phone .react-tel-input .country-list {
          background: #1a1a26 !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
          border-radius: 12px !important;
          margin-top: 4px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5) !important;
          max-height: 220px;
        }
        .stagepass-phone .react-tel-input .country-list .country {
          color: rgba(255,255,255,0.7) !important;
          padding: 8px 14px !important;
          font-size: 12px !important;
        }
        .stagepass-phone .react-tel-input .country-list .country:hover,
        .stagepass-phone .react-tel-input .country-list .country.highlight {
          background: rgba(201,168,76,0.12) !important;
          color: #c9a84c !important;
        }
        .stagepass-phone .react-tel-input .country-list .divider {
          border-color: rgba(255,255,255,0.06) !important;
        }
        .stagepass-phone .react-tel-input .form-control {
          width: 100% !important;
          height: auto !important;
          background: rgba(255,255,255,0.03) !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
          border-radius: 12px !important;
          padding: 12px 16px 12px 52px !important;
          font-size: 14px !important;
          color: white !important;
          outline: none !important;
          transition: border-color 0.2s, background 0.2s;
        }
        .stagepass-phone .react-tel-input .form-control:focus {
          border-color: rgba(201,168,76,0.5) !important;
          box-shadow: none !important;
        }
        .stagepass-phone.phone-error .react-tel-input .form-control {
          border-color: rgba(239,68,68,0.5) !important;
        }
        .stagepass-phone .react-tel-input .form-control::placeholder {
          color: rgba(255,255,255,0.2) !important;
        }
        .stagepass-phone .react-tel-input .flag-dropdown .arrow {
          border-top-color: rgba(255,255,255,0.3) !important;
        }
      `}</style>

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
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-white/40 mb-1.5">
                    Phone
                  </label>
                  <div
                    className={`stagepass-phone${errors.phone ? " phone-error" : ""}`}
                  >
                    <PhoneInput
                      country={"in"}
                      value={form.phone}
                      onChange={(phone, data) =>
                        setForm((prev) => ({
                          ...prev,
                          phone,
                          dialCode: data.dialCode,
                        }))
                      }

                      placeholder="Phone number"
                      inputProps={{ name: "phone", autoComplete: "tel" }}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-[10px] text-red-400 mt-1">
                      {errors.phone}
                    </p>
                  )}
                </div>
                <Field
                  label="Address Line"
                  value={form.address}
                  onChange={(v) => setForm({ ...form, address: v })}
                  error={errors.address}
                  placeholder="Street address"
                  className="sm:col-span-2"
                />

                <Field
                  label="City"
                  value={form.city}
                  onChange={(v) => setForm({ ...form, city: v })}
                  error={errors.city}
                  placeholder="City"
                />

                <Field
                  label="State"
                  value={form.state}
                  onChange={(v) => setForm({ ...form, state: v })}
                  error={errors.state}
                  placeholder="State"
                />

                <Field
                  label="ZIP Code"
                  value={form.zip}
                  onChange={(v) => setForm({ ...form, zip: v })}
                  error={errors.zip}
                  placeholder="Postal Code"
                />
              </div>
              <div className="mt-4">
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={form.sendOnWhatsApp}
                    onChange={(e) =>
                      setForm({ ...form, sendOnWhatsApp: e.target.checked })
                    }
                    className="accent-purple-500"
                  />
                  Send ticket details on WhatsApp
                </label>
              </div>
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
    </>
  );
}
