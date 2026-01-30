import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Explore from './pages/Explore';
import PostListing from './pages/PostListing';
import SkillShare from './pages/SkillShare';
import Community from './pages/Community';
import TradeCenter from './pages/TradeCenter';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import EcoMap from './pages/EcoMap';         
import Quests from './pages/Quests';         
import Governance from './pages/Governance'; 
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { CoinProvider } from '@/contexts/CoinContext';
import { TradeProvider } from '@/contexts/TradeContext';
import { ListingsProvider } from '@/contexts/ListingsContext';
import Messages from './pages/Messages';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <AuthProvider>
          <CoinProvider>
            <TradeProvider>
              <ListingsProvider>
                <Navbar />
                <main className="flex-1 pt-16">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/explore" element={<Explore />} />
                    <Route path="/post" element={<PostListing />} />
                    <Route path="/skill-share" element={<SkillShare />} />
                    <Route path="/community" element={<Community />} />
                    <Route path="/trade-center" element={<TradeCenter />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/messages" element={<Messages />} />
                    <Route path="/admin" element={<Admin />} />
                    
                    {/* New Tabs */}
                    <Route path="/map" element={<EcoMap />} />
                    <Route path="/quests" element={<Quests />} />
                    <Route path="/governance" element={<Governance />} />
                  </Routes>
                </main>
                <Footer />
                <Toaster />
              </ListingsProvider>
            </TradeProvider>
          </CoinProvider>
        </AuthProvider>
      </div>
    </BrowserRouter>
  );
}

export default App;