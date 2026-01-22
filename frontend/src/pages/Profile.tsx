import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTrade } from '@/contexts/TradeContext';
import { useListings } from '@/contexts/ListingsContext'; // Import Listings Context
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import ListingCard from '@/components/ListingCard'; // Import ListingCard
import { 
  Loader2, Edit2, Check, X, Upload, Coins, Star, Calendar, 
  ShieldCheck, MapPin, Package, Trophy, LogOut, ArrowUpRight, ArrowDownLeft, Grid 
} from 'lucide-react';

export default function Profile() {
  const { user, isAuthenticated, signOut } = useAuth();
  const { trades, fetchTrades } = useTrade();
  const { listings, fetchListings, deleteListing } = useListings(); // Get listing functions
  
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    display_name: user?.display_name || '',
    bio: user?.bio || '',
    avatar_url: user?.avatar_url || '',
  });

  // Fetch Data on Load
  useEffect(() => {
    if (user) {
        fetchTrades();
      fetchListings(); // Fetch all listings (Context usually filters, but we filter below)
    }
  }, [user]);

  // Filter listings belonging to the current user
  const myListings = listings.filter(item => item.ownerId === user?.id || item.owner?.id === user?.id);

  if (!isAuthenticated || !user) {
    navigate('/auth');
    return null;
  }

  const getInitials = (name?: string) => {
    if (!name) return user.email[0].toUpperCase();
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // --- Handlers ---
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // (Keep your existing image compression logic here if you want, usually handled by API in real apps)
    // For now, assuming simple read for preview
    const reader = new FileReader();
    reader.onloadend = () => {
        setFormData({ ...formData, avatar_url: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!formData.display_name.trim()) return toast.error('Display name is required');
    setIsLoading(true);
    try {
      const response = await api.updateProfile(formData);
      // Ideally update AuthContext state here too
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      window.location.reload(); 
    } catch (error: any) {
      toast.error(error.message || 'Failed to update');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteListing = async (id: string) => {
      if (confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
          try {
              await deleteListing(id); // Use context function
              toast.success("Listing deleted successfully");
          } catch (e) {
              toast.error("Failed to delete listing");
          }
      }
  };

  return (
    <div className="min-h-screen py-12 px-4 relative bg-[#020617]">
      {/* Ambience */}
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-emerald-900/10 to-transparent -z-10" />
      
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* 1. Profile Header (Unchanged Logic) */}
        <div className="glass rounded-[2.5rem] p-8 md:p-10 border border-white/5 shadow-2xl relative overflow-hidden animate-fade-in-up">
           <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
              <div className="flex flex-col items-center gap-4 w-full md:w-auto">
                 <div className="relative group">
                    <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-[#020617] shadow-xl">
                       <AvatarImage src={formData.avatar_url || user?.avatar_url} className="object-cover" />
                       <AvatarFallback className="bg-slate-800 text-3xl font-bold text-emerald-400">
                          {getInitials(formData.display_name)}
                       </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                       <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10 text-white">
                          <Upload className="w-8 h-8" />
                       </button>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                 </div>
              </div>

              <div className="flex-1 w-full space-y-6">
                 {isEditing ? (
                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 space-y-4">
                       <Input value={formData.display_name} onChange={(e) => setFormData({ ...formData, display_name: e.target.value })} placeholder="Display Name" className="bg-slate-950 border-slate-800 text-white" />
                       <Textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} placeholder="Bio" className="bg-slate-950 border-slate-800 text-white" />
                       <div className="flex gap-2">
                          <Button onClick={handleSave} disabled={isLoading} className="btn-primary flex-1">Save</Button>
                          <Button onClick={() => setIsEditing(false)} variant="outline" className="flex-1">Cancel</Button>
                       </div>
                    </div>
                 ) : (
                    <div className="space-y-4">
                       <div className="flex justify-between items-start">
                          <div>
                             <h1 className="text-3xl font-bold text-white">{user.display_name}</h1>
                             <div className="flex items-center gap-4 text-slate-400 mt-1 text-sm">
                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Earth</span>
                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Joined 2024</span>
                             </div>
                          </div>
                          <div className="flex gap-2">
                             <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="border-slate-700">Edit Profile</Button>
                             {signOut && <Button onClick={signOut} variant="ghost" size="icon" className="text-red-400"><LogOut className="w-4 h-4" /></Button>}
                          </div>
                       </div>
                       <p className="text-slate-300 italic">"{user.bio || "No bio yet."}"</p>
                       <div className="flex flex-wrap gap-4">
                          <StatPill icon={<Coins className="w-4 h-4 text-amber-400" />} label="Balance" value={`${user.coins || 0} BC`} />
                          <StatPill icon={<Star className="w-4 h-4 text-emerald-400" />} label="Rating" value={user.rating || "5.0"} />
                       </div>
                    </div>
                 )}
              </div>
           </div>
        </div>

        {/* 2. Tabs Section */}
        <Tabs defaultValue="inventory" className="w-full">
           <TabsList className="bg-slate-900/50 border border-slate-800 p-1 rounded-xl mb-8">
              <TabsTrigger value="inventory" className="flex-1 px-6 rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                 <Grid className="w-4 h-4 mr-2" /> Inventory ({myListings.length})
              </TabsTrigger>
              <TabsTrigger value="history" className="flex-1 px-6 rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                 <Package className="w-4 h-4 mr-2" /> History
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex-1 px-6 rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                 <Trophy className="w-4 h-4 mr-2" /> Badges
              </TabsTrigger>
           </TabsList>

           {/* --- INVENTORY TAB (NEW) --- */}
           <TabsContent value="inventory" className="animate-in fade-in slide-in-from-bottom-4">
              {myListings.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myListings.map(item => (
                       <ListingCard 
                          key={item.id} 
                          listing={item}
                          onViewDetails={() => navigate(`/explore?id=${item.id}`)}
                          onEdit={(item) => navigate(`/post?edit=${item.id}`)} // Redirects to Post form in Edit mode
                          onDelete={handleDeleteListing} // Passes delete handler
                       />
                    ))}
                 </div>
              ) : (
                 <div className="glass p-12 text-center rounded-3xl border border-dashed border-slate-800">
                    <Package className="w-16 h-16 mx-auto text-slate-700 mb-4" />
                    <h3 className="text-xl font-bold text-slate-300">Your Inventory is Empty</h3>
                    <p className="text-slate-500 mb-6">Start listing items to trade with the community.</p>
                    <Button onClick={() => navigate('/post')} className="btn-primary">Post Item</Button>
                 </div>
              )}
           </TabsContent>

           {/* History Tab */}
           <TabsContent value="history">
              {trades.length > 0 ? (
                 <div className="grid gap-4">
                    {trades.map((trade: any) => {
                       const isIncoming = trade.responderUserId === user.id || trade.responder_id === user.id;
                       return (
                          <div key={trade.id} className="glass p-5 rounded-2xl border border-white/5 flex items-center justify-between">
                             <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-full ${trade.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                                   <Package className="w-6 h-6" />
                                </div>
                                <div>
                                   <h4 className="font-bold text-white">{trade.listing?.title || 'Unknown Item'}</h4>
                                   <div className="text-xs text-slate-500 mt-1 flex gap-2">
                                      <span className="uppercase">{trade.status}</span>
                                      <span>•</span>
                                      <span>{new Date(trade.createdAt || trade.created_at).toLocaleDateString()}</span>
                                   </div>
                                </div>
                             </div>
                             <div className="text-right">
                                <div className="font-bold text-white">{trade.coin_amount} BC</div>
                                <div className={`text-xs ${isIncoming ? 'text-emerald-400' : 'text-slate-400'}`}>
                                   {isIncoming ? 'Received' : 'Sent'}
                                </div>
                             </div>
                          </div>
                       );
                    })}
                 </div>
              ) : (
                 <div className="text-center p-12 text-slate-500">No trades yet.</div>
              )}
           </TabsContent>

           {/* Achievements Tab */}
           <TabsContent value="achievements">
              <div className="glass p-8 rounded-3xl border border-white/5">
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <BadgeDisplay icon="🌱" name="Eco Starter" unlocked />
                    <BadgeDisplay icon="🤝" name="Trusted" unlocked />
                    <BadgeDisplay icon="⚡" name="Fast Responder" />
                    <BadgeDisplay icon="💎" name="Power Trader" />
                 </div>
              </div>
           </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Helpers
function StatPill({ icon, label, value }: any) {
   return (
      <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl">
         {icon}
         <div className="flex flex-col leading-none">
            <span className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">{label}</span>
            <span className="text-sm font-bold text-white">{value}</span>
         </div>
      </div>
   );
}

function BadgeDisplay({ icon, name, unlocked }: any) {
   return (
      <div className={`text-center p-5 rounded-2xl border ${unlocked ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-900/50 border-slate-800 opacity-50'}`}>
         <div className="text-4xl mb-3">{icon}</div>
         <div className="font-bold text-sm text-slate-300">{name}</div>
      </div>
   );
}