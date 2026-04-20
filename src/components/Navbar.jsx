import { useState } from "react";

const NAV_LINKS = [
  { label: "Events", page: "listings" },
  { label: "Artists", page: "artists" },
  { label: "Venues", page: "venues" },
  { label: "About", page: "about" },
];

export default function Navbar({ cartCount, onCartOpen, onHome, onNavigate, currentPage }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavigate = (page) => {
    onNavigate ? onNavigate(page) : onHome();
    setMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <button onClick={onHome} className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-full bg-[#c9a84c] flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-black">
              <path d="M20 6H4l-.01-.01A2 2 0 0 1 6 4h12a2 2 0 0 1 2 2v.01zM20 8H4v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm-9 3h2v2h-2v-2zm0 4h2v2h-2v-2z"/>
            </svg>
          </div>
          <span className="font-display text-lg tracking-[0.15em] text-[#f0ead6] group-hover:text-[#c9a84c] transition-colors">
            STAGE<span className="text-[#c9a84c]">PASS</span>
          </span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((item) => {
            const isActive = currentPage === item.page ||
              (item.page === "listings" && ["listings", "seats", "checkout", "confirmation"].includes(currentPage));
            return (
              <button
                key={item.label}
                onClick={() => handleNavigate(item.page)}
                className={`relative text-xs tracking-[0.2em] uppercase transition-colors pb-0.5 ${
                  isActive ? "text-[#c9a84c]" : "text-[#f0ead6]/50 hover:text-[#c9a84c]"
                }`}
              >
                {item.label}
                {isActive && <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-[#c9a84c] rounded-full" />}
              </button>
            );
          })}
        </nav>

        {/* Right side: cart + hamburger */}
        <div className="flex items-center gap-3">
          <button
            onClick={onCartOpen}
            className="relative flex items-center gap-2 px-4 py-2 border border-white/10 rounded-full hover:border-[#c9a84c]/50 hover:bg-[#c9a84c]/5 transition-all group"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#f0ead6]/70 group-hover:fill-[#c9a84c] transition-colors">
              <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96C5 16.1 6.1 17.2 7.2 17.2h13.8v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63H19c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
            <span className="text-xs tracking-widest text-[#f0ead6]/70 group-hover:text-[#c9a84c] transition-colors">
              Cart
            </span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#c9a84c] text-black text-[10px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col gap-[5px] p-1"
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-[1.5px] bg-[#f0ead6]/70 rounded-full transition-all duration-300 ${menuOpen ? "translate-y-[6.5px] rotate-45" : ""}`} />
            <span className={`block w-5 h-[1.5px] bg-[#f0ead6]/70 rounded-full transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-[1.5px] bg-[#f0ead6]/70 rounded-full transition-all duration-300 ${menuOpen ? "-translate-y-[6.5px] -rotate-45" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? "max-h-64" : "max-h-0"}`}>
        <nav className="bg-[#0f0f16] border-t border-white/5 px-6 py-3 flex flex-col">
          {NAV_LINKS.map((item) => {
            const isActive = currentPage === item.page ||
              (item.page === "listings" && ["listings", "seats", "checkout", "confirmation"].includes(currentPage));
            return (
              <button
                key={item.label}
                onClick={() => handleNavigate(item.page)}
                className={`flex items-center justify-between py-3 text-xs tracking-[0.2em] uppercase border-b border-white/5 last:border-0 transition-colors ${
                  isActive ? "text-[#c9a84c]" : "text-[#f0ead6]/50 hover:text-[#c9a84c]"
                }`}
              >
                {item.label}
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]" />}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}