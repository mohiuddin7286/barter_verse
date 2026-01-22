import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom'; // Added useSearchParams
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCoins } from '@/contexts/CoinContext';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, LayoutGrid, MapPin, Coins, Image as ImageIcon, Sparkles, Type, ArrowRight, Save } from 'lucide-react';

export default function PostListing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit'); // Get ID from URL
  
  const { balance, spendCoins } = useCoins();
  const { user, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    location: '',
    coins: '',
    description: '',
    image: '',
  });

  const LISTING_COST = 10;

  // --- NEW: Fetch Data if Editing ---
  useEffect(() => {
    if (editId && isAuthenticated) {
      setIsLoadingData(true);
      api.getListingById(editId)
        .then((response: any) => {
          const data = response.data.data || response.data; // Handle API wrapper
          setFormData({
            title: data.title,
            category: data.category,
            location: data.location,
            coins: data.price_bc.toString(),
            description: data.description,
            image: data.images?.[0] || '', // Handle image array
          });
        })
        .catch(() => {
          toast.error("Could not load listing details");
          navigate('/post'); // Fallback to create mode
        })
        .finally(() => setIsLoadingData(false));
    }
  }, [editId, isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      toast.error('Please login to continue');
      navigate('/auth');
      return;
    }

    if (!formData.title || !formData.category || !formData.coins) {
      toast.error('Please fill in all required fields');
      return;
    }

    const coins = parseInt(formData.coins);
    if (isNaN(coins) || coins < 1) {
      toast.error('Please enter a valid coin value');
      return;
    }

    // Only check balance if creating a NEW listing
    if (!editId && balance < LISTING_COST) {
      toast.error(`Insufficient coins! You need ${LISTING_COST} BC.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        price_bc: coins,
        location: formData.location || 'Remote',
        images: formData.image ? [formData.image] : [],
        ownerId: user.id,
        status: 'ACTIVE',
      };

      if (editId) {
        // --- UPDATE MODE ---
        await api.updateListing(editId, payload);
        toast.success('Listing updated successfully!');
        navigate('/profile'); // Go back to profile after edit
      } else {
        // --- CREATE MODE ---
        await api.createListing(payload);
        await spendCoins(LISTING_COST, 'listing_posted');
        toast.success(`Listing posted! ${LISTING_COST} BC deducted.`);
        navigate('/explore');
      }

    } catch (error) {
      console.error('Error submitting listing:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
    );
  }

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#020617]">
      {/* Animated Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
      </div>

      <div className="max-w-3xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-slate-300 text-sm font-medium">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{editId ? 'Editor Studio' : 'Creation Studio'}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            {editId ? 'Edit Your ' : 'Create a New '} 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Opportunity</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-lg mx-auto">
            {editId ? 'Update details to attract more traders.' : 'Turn your skills, items, or services into Barter Coins.'}
          </p>
        </div>

        {/* Form Card */}
        <div className="glass rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl relative animate-fade-in-up [animation-delay:200ms]">
          
          {/* Progress Indicator */}
          <div className="absolute top-0 left-0 w-full h-1 bg-slate-800 rounded-t-3xl overflow-hidden">
             <div className="h-full bg-emerald-500 w-1/3" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Main Details */}
            <div className="space-y-6">
               <div className="space-y-2">
                  <Label className="text-xs font-bold text-emerald-400 uppercase tracking-wider ml-1">What are you offering?</Label>
                  <div className="relative group">
                    <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                    <Input
                      placeholder="e.g., Vintage Film Camera or Python Tutoring"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="pl-12 h-14 bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-600 focus:ring-emerald-500/50 focus:border-emerald-500/50 rounded-xl text-lg transition-all"
                    />
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Category</Label>
                    <div className="relative group">
                       <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 z-10 pointer-events-none group-focus-within:text-emerald-400 transition-colors">
                         <LayoutGrid className="w-full h-full" />
                       </div>
                       <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                        <SelectTrigger className="pl-12 h-12 bg-slate-950/50 border-slate-800 text-slate-200 rounded-xl focus:ring-emerald-500/50">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                          <SelectItem value="Skills">Skills</SelectItem>
                          <SelectItem value="Items">Items</SelectItem>
                          <SelectItem value="Services">Services</SelectItem>
                          <SelectItem value="Transport">Transport</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Value (BC)</Label>
                    <div className="relative group">
                      <Coins className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500 group-focus-within:text-amber-400 transition-colors" />
                      <Input
                        type="number"
                        placeholder="e.g. 30"
                        value={formData.coins}
                        onChange={(e) => setFormData({ ...formData, coins: e.target.value })}
                        className="pl-12 h-12 bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-600 focus:ring-amber-500/50 focus:border-amber-500/50 rounded-xl font-mono"
                      />
                    </div>
                  </div>
               </div>
            </div>

            {/* Rich Details */}
            <div className="space-y-6 pt-4 border-t border-white/5">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Location</Label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                    <Input
                      placeholder="City, Neighborhood, or 'Remote'"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="pl-12 h-12 bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-600 focus:ring-emerald-500/50 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Description</Label>
                  <Textarea
                    placeholder="Tell the story of your item or explain your teaching style..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={5}
                    className="bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-600 focus:ring-emerald-500/50 rounded-xl resize-none p-4 leading-relaxed"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Cover Image URL</Label>
                  <div className="relative group">
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                    <Input
                      placeholder="Paste image URL (e.g. https://images.unsplash.com/...)"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="pl-12 h-12 bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-600 focus:ring-emerald-500/50 rounded-xl"
                    />
                  </div>
                  <p className="text-xs text-slate-500 ml-1">Tip: Right-click an image online and select "Copy Image Address"</p>
                </div>
            </div>

            {/* Action Bar */}
            <div className="pt-6">
              <Button 
                type="submit" 
                size="lg" 
                className="w-full btn-primary h-14 text-lg font-bold shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-transform duration-200"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {editId ? 'Updating Listing...' : 'Publishing to the Verse...'}
                  </>
                ) : (
                  <span className="flex items-center gap-2">
                    {editId ? <Save className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                    {editId ? 'Save Changes' : 'Publish Listing'}
                  </span>
                )}
              </Button>
              
              {!editId && (
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500 mt-4 bg-slate-900/50 py-2 rounded-lg border border-slate-800/50 w-fit mx-auto px-4">
                  <span>Cost: <span className="text-white font-bold">{LISTING_COST} BC</span></span>
                  <span className="text-slate-700">|</span>
                  <span>Your Balance: <span className={`font-bold ${balance < LISTING_COST ? 'text-red-400' : 'text-emerald-400'}`}>{balance} BC</span></span>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}