import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { CoinsDisplay } from '@/components/CoinsDisplay';
import { NotificationBell } from '@/components/NotificationBell';
import { 
  Menu, X, Plus, User, LogOut, LayoutDashboard, 
  Compass, Zap, MessageSquare, Map as MapIcon, 
  Swords, ChevronDown, Repeat, Vote
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// Importing logo from src/logo.png (ensure the file exists there)
import logoImg from '../logo.png'; 

export default function Navbar() {
  const { user, signOut, isAuthenticated } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for glass transition
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setIsOpen(false), [location]);

  // Navigation Links
  const navLinks = [
    { name: 'Explore', path: '/explore', icon: <Compass className="w-4 h-4" /> },
    { name: 'Map', path: '/map', icon: <MapIcon className="w-4 h-4" /> },
    { name: 'Skills', path: '/skill-share', icon: <Zap className="w-4 h-4" /> },
    { name: 'Quests', path: '/quests', icon: <Swords className="w-4 h-4" /> },
    { name: 'Community', path: '/community', icon: <MessageSquare className="w-4 h-4" /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ease-in-out ${
      scrolled 
        ? 'bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-emerald-900/5 py-2' 
        : 'bg-transparent py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-3 group relative z-10">
            <div className="relative">
               <div className="absolute inset-0 bg-emerald-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
               <img src={logoImg} alt="BarterVerse" className="w-9 h-9 object-contain relative z-10 transition-transform duration-300 group-hover:scale-110" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight hidden sm:block">
              Barter<span className="text-emerald-400">Verse</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 bg-white/5 backdrop-blur-md rounded-full px-2 py-1 border border-white/5">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  isActive(link.path)
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link to="/post">
                  <Button size="sm" className="btn-primary rounded-full px-5 h-10 shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all">
                    <Plus className="w-4 h-4 mr-2" /> Post
                  </Button>
                </Link>

                <div className="h-8 w-px bg-white/10 mx-1" />
                {/* Coins Display */}
                {isAuthenticated && <CoinsDisplay />}
                {/* Notification Bell */}
                <NotificationBell isAuthenticated={isAuthenticated} />

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-slate-900/50 border border-slate-700 hover:border-emerald-500/50 transition-all group">
                      <Avatar className="h-8 w-8 border border-slate-600 group-hover:border-emerald-500 transition-colors">
                        <AvatarImage src={user?.avatar_url} />
                        <AvatarFallback className="bg-slate-800 text-xs text-emerald-400 font-bold">
                          {user?.email?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-slate-300 group-hover:text-white truncate max-w-[80px]">
                         {user?.display_name || 'User'}
                      </span>
                      <ChevronDown className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                    </button>
                  </DropdownMenuTrigger>
                  
                  <DropdownMenuContent align="end" className="w-64 bg-[#0B1121]/95 backdrop-blur-xl border-slate-800 text-slate-200 mt-2 p-2 rounded-xl shadow-2xl">
                    <DropdownMenuLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 py-2">
                       My Account
                    </DropdownMenuLabel>
                    
                    <Link to="/dashboard">
                      <DropdownMenuItem className="focus:bg-emerald-500/10 focus:text-emerald-400 cursor-pointer rounded-lg px-3 py-2.5">
                        <LayoutDashboard className="w-4 h-4 mr-3" /> Dashboard
                      </DropdownMenuItem>
                    </Link>
                    <Link to="/trade-center">
                      <DropdownMenuItem className="focus:bg-emerald-500/10 focus:text-emerald-400 cursor-pointer rounded-lg px-3 py-2.5">
                        <Repeat className="w-4 h-4 mr-3" /> Trade Center
                      </DropdownMenuItem>
                    </Link>
                    <Link to="/profile">
                      <DropdownMenuItem className="focus:bg-emerald-500/10 focus:text-emerald-400 cursor-pointer rounded-lg px-3 py-2.5">
                        <User className="w-4 h-4 mr-3" /> Profile & Settings
                      </DropdownMenuItem>
                    </Link>
                    {/* Fixed: Removed duplicate Link wrapper here */}
                    <Link to="/messages">
                        <DropdownMenuItem className="focus:bg-emerald-500/10 focus:text-emerald-400 cursor-pointer rounded-lg px-3 py-2.5">
                            <MessageSquare className="w-4 h-4 mr-3" /> Messages
                        </DropdownMenuItem>
                    </Link>
                    <Link to="/governance">
                      <DropdownMenuItem className="focus:bg-emerald-500/10 focus:text-emerald-400 cursor-pointer rounded-lg px-3 py-2.5">
                        <Vote className="w-4 h-4 mr-3" /> Governance
                      </DropdownMenuItem>
                    </Link>
                    
                    <DropdownMenuSeparator className="bg-white/10 my-2" />
                    
                    <DropdownMenuItem onClick={signOut} className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer rounded-lg px-3 py-2.5">
                      <LogOut className="w-4 h-4 mr-3" /> Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex gap-4">
                <Link to="/auth">
                  <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/5 rounded-full">
                    Log in
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button className="bg-white text-black hover:bg-emerald-50 font-semibold rounded-full px-6">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-4">
             {isAuthenticated && (
                <Link to="/post">
                   <Button size="icon" className="rounded-full bg-emerald-600 hover:bg-emerald-500 w-9 h-9">
                      <Plus className="w-5 h-5" />
                   </Button>
                </Link>
             )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-[#020617]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl p-4 animate-fade-in-up">
          <div className="grid gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
                  isActive(link.path)
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${isActive(link.path) ? 'bg-emerald-500/20' : 'bg-slate-800'}`}>
                   {link.icon}
                </div>
                <span className="font-medium">{link.name}</span>
              </Link>
            ))}
            
            <Link to="/governance" className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all">
               <div className="p-1.5 rounded-lg bg-slate-800"><Vote className="w-4 h-4" /></div>
               <span className="font-medium">Governance</span>
            </Link>
          </div>
          
          <div className="pt-4 mt-4 border-t border-white/5">
            {isAuthenticated ? (
              <div className="space-y-3">
                <Link to="/dashboard">
                   <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-white/5 h-12 rounded-xl">
                      <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
                   </Button>
                </Link>
                <Link to="/trade-center">
                   <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-white/5 h-12 rounded-xl">
                      <Repeat className="w-5 h-5 mr-3" /> Trade Center
                   </Button>
                </Link>
                <Button variant="outline" className="w-full border-red-500/20 text-red-400 hover:bg-red-500/10 h-12 rounded-xl justify-start" onClick={signOut}>
                   <LogOut className="w-5 h-5 mr-3" /> Sign Out
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link to="/auth">
                   <Button variant="outline" className="w-full border-slate-700 text-slate-300 h-12 rounded-xl">Log in</Button>
                </Link>
                <Link to="/auth">
                   <Button className="w-full bg-emerald-600 hover:bg-emerald-500 h-12 rounded-xl">Sign up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}