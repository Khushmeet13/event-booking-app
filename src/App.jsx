import { useState } from "react";
import EventListings from "./pages/EventListings";
import SeatSelection from "./pages/SeatSelection";
import Checkout from "./pages/Checkout";
import TicketConfirmation from "./pages/TicketConfirmation";
import Artists from "./pages/Artists";
import Venues from "./pages/Venues";
import About from "./pages/About";
import CartDrawer from "./components/CartDrawer";
import Navbar from "./components/Navbar";

export default function App() {
  const [page, setPage] = useState("listings");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [confirmedTickets, setConfirmedTickets] = useState(null);
  const [whatsappUrl, setWhatsappUrl] = useState(null);

  const addToCart = (item) => {
    setCart((prev) => {
      const exists = prev.find(
        (c) => c.eventId === item.eventId && c.seatId === item.seatId && c.type === item.type
      );
      if (exists) return prev;
      return [...prev, { ...item, id: Date.now() + Math.random() }];
    });
    setCartOpen(true);
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((c) => c.id !== id));

   const onCheckout = (tickets, waUrl) => {
    setConfirmedTickets(tickets);
    setWhatsappUrl(waUrl ?? null);
    setCart([]);
    setPage("confirmation");
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0ead6] font-body">
      <Navbar
        cartCount={cart.length}
        onCartOpen={() => setCartOpen(true)}
        onHome={() => setPage("listings")}
        onNavigate={setPage}
        currentPage={page}
      />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onRemove={removeFromCart}
        onCheckout={() => { setCartOpen(false); setPage("checkout"); }}
      />

      <main>
        {page === "listings" && (
          <EventListings
            onSelectEvent={(ev) => { setSelectedEvent(ev); setPage("seats"); }}
          />
        )}
        {page === "seats" && selectedEvent && (
          <SeatSelection
            event={selectedEvent}
            cart={cart}
            onAddToCart={addToCart}
            onBack={() => setPage("listings")}
            onViewCart={() => setCartOpen(true)}
          />
        )}
        {page === "checkout" && (
          <Checkout
            cart={cart}
            onBack={() => setPage("seats")}
            onConfirm={onCheckout}
          />
        )}
        {page === "confirmation" && confirmedTickets && (
          <TicketConfirmation
            tickets={confirmedTickets}
             whatsappUrl={whatsappUrl}
            onHome={() => setPage("listings")}
          />
        )}
        {page === "artists" && <Artists />}
        {page === "venues" && <Venues onNavigate={setPage} />}
        {page === "about" && <About />}
      </main>
    </div>
  );
}
