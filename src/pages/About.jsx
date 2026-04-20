import { useState } from "react";
import emailjs from "@emailjs/browser";


const VALUES = [
  {
    icon: "◈",
    title: "Artist First",
    desc: "Every feature, every fee structure, every policy is designed with the artist's interests in mind. When they thrive, the ecosystem thrives.",
  },
  {
    icon: "◎",
    title: "Radical Transparency",
    desc: "No hidden fees. No opaque algorithms. No selling your data. What you see is what you pay — and what artists see is exactly what they earn.",
  },
  {
    icon: "◬",
    title: "Experience as Product",
    desc: "A ticket isn't a transaction. It's the beginning of a memory. We design every touchpoint — from discovery to entry — as part of that experience.",
  },
  {
    icon: "◇",
    title: "Curation Over Volume",
    desc: "We don't list every show in every city. We partner with venues and artists who share our standards. Quality is not negotiable.",
  },
];

const TIMELINE = [
  { year: "Jan 2025", event: "Project ideation — identified the gap in India's live event ticketing space. Started research and wireframing." },
  { year: "Feb 2025", event: "Tech stack finalized. React + Tailwind setup done. Core UI components and design system built from scratch." },
  { year: "Mar 2025", event: "Homepage, Events listing, and Event detail pages completed. QR ticket generation logic implemented." },
  { year: "Apr 2025", event: "Artist and Venue pages added. Contact form integrated with EmailJS. Mobile responsiveness polished." },
  { year: "May 2025", event: "Razorpay payment gateway integrated. Secure end-to-end ticket purchasing flow live with UPI, cards, and netbanking support." },
  { year: "Jun 2025", event: "About page, FAQ, and full dark UI theme finalized. Performance optimizations done. StagePass v1.0 deployed." },
];

const FAQS = [
  { q: "How does StagePass differ from other ticketing platforms?", a: "We focus on quality over quantity — curated events, transparent pricing, and a design that respects the experience. We also offer artists real-time data and a fair fee structure." },
  { q: "What are your service fees?", a: "We charge a flat 3% convenience fee — no hidden charges, no dynamic markups. Artists keep 90% of face value." },
  { q: "Can I transfer my ticket to someone else?", a: "Yes. All tickets can be transferred through your account dashboard up to 2 hours before the event." },
  { q: "What happens if an event is cancelled?", a: "Full refunds are processed within 3–5 business days. You'll receive an email notification the moment a cancellation is confirmed." },
  { q: "How do I verify a ticket at the door?", a: "Venues use our QR scanner app. Every ticket generates a unique QR code that's scanned once at entry." },
];

export default function About() {
  const [openFaq, setOpenFaq] = useState(null);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleContact = async () => {
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;

    setLoading(true);
    setError("");

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAIL_SERVICE_ID,
        import.meta.env.VITE_MESSAGE_TEMPLATE_ID,
        {
          from_name: contactForm.name,
          from_email: contactForm.email,
          message: contactForm.message,
          email: import.meta.env.VITE_EMAIL
        },
        import.meta.env.VITE_EMAIL_PUBLIC_KEY
      );
      setSubmitted(true);
    } catch (err) {
      console.error("Status:", err?.status);
      console.error("Text:", err?.text);
      console.error("Full error:", JSON.stringify(err));
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="pt-24 pb-20 min-h-screen bg-[#0a0a0f]">

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 mt-8 mb-24">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-px h-8 bg-[#c9a84c]" />
          <span className="text-[10px] tracking-[0.4em] text-[#c9a84c] uppercase">Our Story</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h1 className="font-display text-6xl md:text-8xl leading-none tracking-tight mb-8">
              Built for<br />the<br /><span className="text-[#c9a84c]">Stage.</span>
            </h1>
            <p className="text-white/50 text-base leading-relaxed mb-6 max-w-md">
              StagePass was born from a simple frustration: great events deserved better infrastructure. We built the platform we wished existed.
            </p>
            <p className="text-white/35 text-sm leading-relaxed max-w-md">
              Founded in 2020 in Mumbai, we started with ten venues and a belief that the ticketing experience should match the quality of the show itself. Five years later, that belief drives every line of code we write and every partnership we sign.
            </p>
          </div>
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden h-96">
              <img
                src="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80"
                alt="Live concert"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f]/60 to-transparent" />
            </div>
            {/* Floating stat */}
            <div className="absolute -bottom-6 -left-6 bg-[#0f0f17] border border-white/8 rounded-xl p-5 animate-fadeUp">
              <p className="font-display text-3xl text-[#c9a84c]">120K+</p>
              <p className="text-[10px] tracking-widest uppercase text-white/30 mt-1">Tickets Issued</p>
            </div>
            <div className="absolute -top-4 -right-4 bg-[#c9a84c]/10 border border-[#c9a84c]/20 rounded-xl p-4 animate-fadeUp" style={{ animationDelay: "0.2s" }}>
              <p className="font-display text-2xl text-[#c9a84c]">8</p>
              <p className="text-[10px] tracking-widest uppercase text-[#c9a84c]/60 mt-0.5">Cities</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-7xl mx-auto px-6 mb-24">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-px h-8 bg-[#c9a84c]" />
          <span className="text-[10px] tracking-[0.4em] text-[#c9a84c] uppercase">What We Believe</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {VALUES.map((v, i) => (
            <div
              key={v.title}
              className="animate-fadeUp bg-[#0f0f17] border border-white/5 rounded-2xl p-6 hover:border-[#c9a84c]/20 transition-colors group"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="text-3xl text-[#c9a84c] mb-4 group-hover:scale-110 transition-transform inline-block">{v.icon}</div>
              <h3 className="font-display text-lg mb-2">{v.title}</h3>
              <p className="text-xs text-white/35 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="max-w-7xl mx-auto px-6 mb-24">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-px h-8 bg-[#c9a84c]" />
          <span className="text-[10px] tracking-[0.4em] text-[#c9a84c] uppercase">How It Was Built</span>
        </div>
        <div className="relative">
          {/* Line */}
          <div className="absolute left-16 top-0 bottom-0 w-px bg-white/5 hidden md:block" />
          <div className="space-y-6">
            {TIMELINE.map((item, i) => (
              <div
                key={item.year}
                className="animate-fadeUp flex gap-6 items-start group"
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <div className="flex-shrink-0 w-16 pt-1 text-right">
                  <span className="font-display text-lg text-[#c9a84c]/60 group-hover:text-[#c9a84c] transition-colors">{item.year}</span>
                </div>
                <div className="hidden md:flex flex-col items-center pt-2">
                  <div className="w-3 h-3 rounded-full border-2 border-[#c9a84c]/30 group-hover:border-[#c9a84c] group-hover:bg-[#c9a84c]/20 transition-all flex-shrink-0 relative z-10 bg-[#0a0a0f]" />
                </div>
                <div className="flex-1 bg-[#0f0f17] border border-white/5 rounded-xl p-4 group-hover:border-white/10 transition-colors">
                  <p className="text-sm text-white/60 leading-relaxed">{item.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Team */}
      <section className="max-w-7xl mx-auto px-6 mb-24">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-px h-8 bg-[#c9a84c]" />
          <span className="text-[10px] tracking-[0.4em] text-[#c9a84c] uppercase">The Builder</span>
        </div>
        <div className="flex justify-center">
          <div className="animate-fadeUp group max-w-xs w-full">
            <div className="relative rounded-2xl overflow-hidden h-72 mb-4">
              <img
                src="/profile-img.png"
                alt="Khushmeet Saini"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <a href="https://www.linkedin.com/in/khushmeet-saini/" target="_blank" rel="noreferrer"
                  className="w-7 h-7 rounded-full bg-[#0f0f17]/80 border border-white/10 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white/60">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-display text-xl">Khushmeet Saini</h3>
              <p className="text-[10px] tracking-wider text-[#c9a84c]/70 uppercase mb-1">Founder & Web Developer</p>
              <p className="text-xs text-white/30 mb-3">Chandigarh</p>
              <p className="text-xs text-white/35 leading-relaxed">
                A passionate web developer with a keen eye for design and a love for building seamless digital experiences.
                Crafted StagePass from the ground up — architecting the frontend, engineering the ticketing
                infrastructure, and shaping every interaction to ensure the platform feels as good as the shows it serves.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 mb-24">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-px h-8 bg-[#c9a84c]" />
          <span className="text-[10px] tracking-[0.4em] text-[#c9a84c] uppercase">FAQ</span>
        </div>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className={`animate-fadeUp bg-[#0f0f17] border rounded-xl overflow-hidden transition-colors ${openFaq === i ? "border-[#c9a84c]/20" : "border-white/5 hover:border-white/10"}`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="text-sm text-white/70 font-medium pr-4">{faq.q}</span>
                <span className={`flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${openFaq === i ? "border-[#c9a84c]/40 bg-[#c9a84c]/10 rotate-45" : "border-white/15"}`}>
                  <svg viewBox="0 0 24 24" className={`w-3 h-3 transition-colors ${openFaq === i ? "fill-[#c9a84c]" : "fill-white/30"}`}>
                    <path d="M19 13H13v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                  </svg>
                </span>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4">
                  <p className="text-sm text-white/40 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-[#0f0f17] border border-white/5 rounded-2xl p-8 md:p-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-px h-8 bg-[#c9a84c]" />
              <span className="text-[10px] tracking-[0.4em] text-[#c9a84c] uppercase">Get In Touch</span>
            </div>
            <h2 className="font-display text-4xl mb-4">Let's Talk.</h2>
            <p className="text-white/40 text-sm leading-relaxed mb-8 max-w-sm">
              Whether you're an artist looking to partner, a venue exploring integration, or a fan with a question — we read every message.
            </p>
            <div className="space-y-4">
              {[
                { label: "General Enquiries", value: "hello@stagepass.in" },
                { label: "Artist Partnerships", value: "artists@stagepass.in" },
                { label: "Venue Partnerships", value: "venues@stagepass.in" },
                { label: "Press", value: "press@stagepass.in" },
              ].map((c) => (
                <div key={c.label} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]/50" />
                  <div>
                    <p className="text-[9px] tracking-widest uppercase text-white/25">{c.label}</p>
                    <p className="text-sm text-white/60">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center gap-4 text-center animate-fadeUp">
                <div className="w-16 h-16 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/20 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-7 h-7 fill-[#c9a84c]"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                </div>
                <h3 className="font-display text-2xl">Message Sent</h3>
                <p className="text-sm text-white/40">We'll get back to you within 24 hours.</p>
                <button onClick={() => setSubmitted(false)} className="text-[11px] tracking-widest uppercase text-[#c9a84c]/60 hover:text-[#c9a84c] transition-colors mt-2">Send Another</button>
              </div>
            ) : (
              <div className="space-y-4">
                {[
                  { label: "Your Name", key: "name", placeholder: "Full name" },
                  { label: "Email", key: "email", placeholder: "your@email.com" },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-white/30 mb-1.5">{label}</label>
                    <input
                      type="text"
                      value={contactForm[key]}
                      onChange={(e) => setContactForm({ ...contactForm, [key]: e.target.value })}
                      placeholder={placeholder}
                      className="w-full bg-white/3 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-[#c9a84c]/40 transition-colors"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-white/30 mb-1.5">Message</label>
                  <textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="What's on your mind?"
                    rows={5}
                    className="w-full bg-white/3 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-[#c9a84c]/40 transition-colors resize-none"
                  />
                </div>
                <button
                  onClick={handleContact}
                  disabled={loading}
                  className="w-full py-3.5 bg-[#c9a84c] text-black text-xs tracking-[0.25em] uppercase font-bold rounded-xl hover:bg-[#dbb95e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>

                {error && (
                  <p className="text-xs text-red-400 text-center">{error}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
