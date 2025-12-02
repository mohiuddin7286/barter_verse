import { Link, useLocation } from 'react-router-dom';
import { Coins, Menu, X, LogOut, LogIn } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const balance = user?.coins ?? 0;
  const [prevBalance, setPrevBalance] = useState(balance);
  const [isAnimating, setIsAnimating] = useState(false);

  // Trigger animation when balance changes
  useEffect(() => {
    if (balance !== prevBalance) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      setPrevBalance(balance);
      return () => clearTimeout(timer);
    }
  }, [balance, prevBalance]);

  const links = [
    { name: 'Home', path: '/' },
    { name: 'Explore', path: '/explore' },
    { name: 'Post', path: '/post' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Trade Center', path: '/trade-center' },
    { name: 'Skills', path: '/skill-share' },
    { name: 'Community', path: '/community' },
    { name: 'Analytics', path: '/analytics' },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border backdrop-blur-md bg-background/70 transition-colors duration-700 ease-in-out">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent glow-text">
              ⚜️ BarterVerse
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-6">
            {links.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === link.path ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div 
                className={`relative flex items-center gap-2 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-black px-5 py-2.5 rounded-full shadow-[0_4px_20px_rgba(251,191,36,0.4)] font-semibold transition-all duration-300 hover:shadow-[0_6px_25px_rgba(251,191,36,0.6)] hover:scale-[1.02] ${
                  isAnimating ? 'animate-[bounce_0.6s_ease-in-out]' : ''
                }`}
              >
                <Coins className="w-5 h-5 animate-pulse" />
                <span className={`text-base tabular-nums transition-all duration-300 ${
                  isAnimating ? 'scale-110' : 'scale-100'
                }`}>
                  {balance} BC
                </span>
              </div>
            )}

            <div className="hidden lg:block">
              {user ? (
                <Button variant="outline" size="sm" onClick={signOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              ) : (
                <Link to="/auth">
                  <Button variant="default" size="sm">
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                </Link>
              )}
            </div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden text-foreground"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
