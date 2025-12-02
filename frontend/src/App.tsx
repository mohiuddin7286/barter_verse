import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CoinProvider } from "./contexts/CoinContext";
import { ListingsProvider } from "./contexts/ListingsContext";
import { TradeProvider } from "./contexts/TradeContext";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import PostListing from "./pages/PostListing";
import Dashboard from "./pages/Dashboard";
import TradeCenter from "./pages/TradeCenter";
import SkillShare from "./pages/SkillShare";
import Community from "./pages/Community";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CoinProvider>
            <ListingsProvider>
              <TradeProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <main className="flex-1">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/explore" element={<Explore />} />
                        <Route path="/post" element={<PostListing />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/trade-center" element={<TradeCenter />} />
                        <Route path="/skill-share" element={<SkillShare />} />
                        <Route path="/community" element={<Community />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>
                    <Footer />
                  </div>
                </TooltipProvider>
              </TradeProvider>
            </ListingsProvider>
          </CoinProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
