import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/store/cartStore";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Index from "./pages/Index";
import Designer from "./pages/Designer";
import Cart from "./pages/Cart";
import NotFound from "./pages/NotFound";
import Collection from "./pages/Collection";

const queryClient = new QueryClient();

// Use import.meta.env.BASE_URL so react-router matches the vite base path
const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename={basename}>
          <Navbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/designer" element={<Designer />} />
            <Route path="/collection" element={<Collection />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
