import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Repeat } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#020617] border-t border-white/5 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Section: Brand & Main Nav */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
          
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <Repeat className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">BarterVerse</span>
          </div>

          {/* Minimal Navigation */}
          <nav className="flex gap-8 text-sm font-medium">
            <Link to="/explore" className="text-slate-400 hover:text-emerald-400 transition-colors">Marketplace</Link>
            <Link to="/map" className="text-slate-400 hover:text-emerald-400 transition-colors">EcoMap</Link>
            <Link to="/governance" className="text-slate-400 hover:text-emerald-400 transition-colors">Governance</Link>
            <Link to="/about" className="text-slate-400 hover:text-emerald-400 transition-colors">About</Link>
          </nav>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-white/5 mb-8" />

        {/* Bottom Section: Copyright & Socials */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          
          <div className="flex gap-6">
            <span>© {currentYear} BarterVerse Inc.</span>
            <Link to="/privacy" className="hover:text-slate-300">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-slate-300">Terms of Service</Link>
          </div>

          {/* Social Icons */}
          <div className="flex gap-4">
            <a href="#" className="p-2 rounded-full hover:bg-white/5 hover:text-white transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 rounded-full hover:bg-white/5 hover:text-white transition-colors">
              <Github className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 rounded-full hover:bg-white/5 hover:text-white transition-colors">
              <Linkedin className="w-4 h-4" />
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
}