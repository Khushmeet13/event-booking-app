export default function CartDrawer({ open, onClose, cart, onRemove, onCheckout }) {
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={`fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-[#0f0f17] border-l border-white/5 flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <h2 className="font-display text-lg tracking-[0.15em]">YOUR CART</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:border-[#c9a84c]/50 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#f0ead6]/60">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white/20">
                  <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96C5 16.1 6.1 17.2 7.2 17.2h13.8v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63H19c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
              </div>
              <p className="text-sm text-white/30 tracking-widest uppercase">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="group relative bg-white/3 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-sm tracking-wider truncate">{item.eventTitle}</p>
                      <p className="text-xs text-white/40 mt-0.5">{item.date} · {item.time}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-full font-medium ${item.type === "VIP" ? "bg-[#c9a84c]/15 text-[#c9a84c] border border-[#c9a84c]/20" : "bg-white/5 text-white/50 border border-white/10"}`}
                        >
                          {item.type}
                        </span>
                        <span className="text-xs text-white/40">Seat {item.seatId}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="text-sm font-medium text-[#c9a84c]">₹{item.price.toLocaleString()}</p>
                      <button
                        onClick={() => onRemove(item.id)}
                        className="w-6 h-6 rounded-full bg-white/5 hover:bg-red-500/20 flex items-center justify-center transition-colors"
                      >
                        <svg viewBox="0 0 24 24" className="w-3 h-3 fill-white/40 hover:fill-red-400">
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="px-6 py-5 border-t border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs tracking-widest text-white/40 uppercase">Total</span>
              <span className="font-display text-xl text-[#c9a84c]">₹{total.toLocaleString()}</span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full py-3.5 bg-[#c9a84c] text-black text-xs tracking-[0.25em] uppercase font-bold rounded-xl hover:bg-[#dbb95e] transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
