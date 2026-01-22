import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, MapPin, Filter, SlidersHorizontal, Grid, List as ListIcon, Star, Zap, ShoppingBag, GraduationCap, Truck, CheckCircle } from 'lucide-react';
import { useListings } from '@/contexts/ListingsContext';
import ListingCard from '@/components/ListingCard';
import ListingModal from '@/components/ListingModal';
import type { Listing } from '@/contexts/ListingsContext';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';

// Visual Category Data
const CATEGORIES = [
  { id: 'all', label: 'All', icon: <Grid className="w-4 h-4" /> },
  { id: 'Skills', label: 'Skills', icon: <GraduationCap className="w-4 h-4" /> },
  { id: 'Items', label: 'Items', icon: <ShoppingBag className="w-4 h-4" /> },
  { id: 'Services', label: 'Services', icon: <Zap className="w-4 h-4" /> },
  { id: 'Transport', label: 'Transport', icon: <Truck className="w-4 h-4" /> },
];

export default function Explore() {
   const { listings, isLoading, fetchListings } = useListings();
   const [searchParams, setSearchParams] = useSearchParams();

   const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
   const [selectedCategory, setSelectedCategory] = useState(searchParams.get('cat') || 'all');
   const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [viewMode, setViewMode] = useState<'grid' | 'list'>((searchParams.get('view') as 'grid' | 'list') || 'grid');
   const [sortBy, setSortBy] = useState<'relevance' | 'price-asc' | 'price-desc' | 'newest'>(
      (searchParams.get('sort') as 'relevance' | 'price-asc' | 'price-desc' | 'newest') || 'relevance'
   );
  
   // Advanced Filter States
   const [showFilters, setShowFilters] = useState(false);
   const [priceRange, setPriceRange] = useState<[number, number]>([
      Number.parseInt(searchParams.get('min') || '0', 10) || 0,
      Number.parseInt(searchParams.get('max') || '1000', 10) || 1000,
   ]);
   const [verifiedOnly, setVerifiedOnly] = useState(searchParams.get('verified') === '1');

  // Mock "Featured" Listings for the Hero Section
  const featuredListings = listings.slice(0, 3); 

   const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          listing.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || listing.category === selectedCategory;
    const matchesVerified = !verifiedOnly || listing.verified;
   const price = listing.price_bc || 0;
   const matchesPrice = price >= priceRange[0] && price <= priceRange[1];

    return matchesSearch && matchesCategory && matchesVerified && matchesPrice;
  });

  const handleViewDetails = (listing: Listing) => {
      setSelectedListing(listing);
      setIsModalOpen(true);
      const params = new URLSearchParams(searchParams);
      params.set('listing', listing.id);
      setSearchParams(params, { replace: true });
  };

   useEffect(() => {
      const listingId = searchParams.get('listing');
      if (!listingId) return;
      const match = listings.find(l => String(l.id) === listingId);
      if (match) {
         setSelectedListing(match);
         setIsModalOpen(true);
      }
   }, [listings, searchParams]);

   // Server-side fetch when key query params change
  useEffect(() => {
    fetchListings(1, selectedCategory, searchQuery, sortBy, priceRange[0], priceRange[1]);
  }, [fetchListings, selectedCategory, searchQuery, sortBy, priceRange]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedListing(null);
    const params = new URLSearchParams(searchParams);
    params.delete('listing');
    setSearchParams(params, { replace: true });
  };

   useEffect(() => {
      const params = new URLSearchParams();

      if (searchQuery) params.set('q', searchQuery);
      if (selectedCategory !== 'all') params.set('cat', selectedCategory);
      if (priceRange[0] > 0) params.set('min', String(priceRange[0]));
      if (priceRange[1] < 1000) params.set('max', String(priceRange[1]));
      if (verifiedOnly) params.set('verified', '1');
      if (viewMode !== 'grid') params.set('view', viewMode);
      if (sortBy !== 'relevance') params.set('sort', sortBy);
      if (selectedListing) params.set('listing', selectedListing.id);

      setSearchParams(params, { replace: true });
   }, [searchQuery, selectedCategory, priceRange, verifiedOnly, viewMode, sortBy, selectedListing, setSearchParams]);

   const sortedListings = [...filteredListings].sort((a, b) => {
      if (sortBy === 'price-asc') {
         return (a.price_bc || 0) - (b.price_bc || 0);
      }
      if (sortBy === 'price-desc') {
         return (b.price_bc || 0) - (a.price_bc || 0);
      }
      if (sortBy === 'newest') {
         const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
         const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
         return bTime - aTime;
      }
      return 0; // relevance/default keeps original order
   });

   const handleApplyFilters = () => {
      setShowFilters(false);
      toast.success('Filters applied');
   };

   const handleClearFilters = () => {
      setSearchQuery('');
      setSelectedCategory('all');
      setPriceRange([0, 1000]);
      setVerifiedOnly(false);
      setViewMode('grid');
      setSortBy('relevance');
      setSelectedListing(null);
      setShowFilters(false);
      setSearchParams(new URLSearchParams(), { replace: true });
      toast.message('Filters reset');
   };

  return (
    <div className="min-h-screen bg-[#020617] relative">
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-900/10 to-transparent -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* 1. Marketplace Spotlight Hero */}
        <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl h-[280px] md:h-[320px] group animate-fade-in-up">
           <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2664&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105" />
           <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
           
           <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-12 space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider w-fit animate-fade-in-up">
                 <Star className="w-3 h-3 fill-emerald-400" /> Featured Collections
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight animate-fade-in-up [animation-delay:100ms]">
                 Discover Rare Finds & <br/>
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Expert Services</span>
              </h1>
              <p className="text-slate-300 text-lg animate-fade-in-up [animation-delay:200ms]">
                 Connect with top-rated traders in your area today.
              </p>
           </div>
        </div>

        {/* 2. Control Bar (Search & Toggles) */}
        <div className="sticky top-20 z-30 glass p-2 rounded-2xl border border-white/10 shadow-xl flex flex-col md:flex-row gap-3">
           <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                 type="text"
                 placeholder="Search for items, skills, services..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full h-12 pl-12 pr-4 bg-slate-950/50 rounded-xl border border-transparent focus:border-emerald-500/50 focus:bg-slate-900 text-white placeholder:text-slate-500 outline-none transition-all"
              />
           </div>
           
           <div className="flex items-center gap-2">
              <Button 
                 onClick={() => setShowFilters(!showFilters)}
                 variant="outline" 
                 className={`h-12 px-4 border-slate-700 hover:bg-slate-800 text-slate-300 ${showFilters ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : ''}`}
              >
                 <SlidersHorizontal className="w-4 h-4 mr-2" /> Filters
              </Button>
              
              <div className="h-12 bg-slate-950/50 rounded-xl p-1 flex border border-white/5">
                 <button 
                    onClick={() => setViewMode('grid')}
                    className={`px-3 rounded-lg flex items-center justify-center transition-all ${viewMode === 'grid' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                 >
                    <Grid className="w-5 h-5" />
                 </button>
                 <button 
                    onClick={() => setViewMode('list')}
                    className={`px-3 rounded-lg flex items-center justify-center transition-all ${viewMode === 'list' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                 >
                    <ListIcon className="w-5 h-5" />
                 </button>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="h-12 rounded-xl bg-slate-950/80 border border-white/10 text-slate-200 px-3 text-sm focus:outline-none focus:border-emerald-500/50"
              >
                        <option value="relevance">Sort: Relevance</option>
                        <option value="newest">Newest First</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
              </select>
           </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
           
           {/* 3. Sidebar Filters (Collapsible on Mobile) */}
           <div className={`w-full lg:w-64 space-y-6 flex-shrink-0 transition-all duration-300 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="glass rounded-2xl p-6 border border-white/5 space-y-8 sticky top-36">
                 
                 {/* Categories */}
                 <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Categories</h3>
                    <div className="space-y-1">
                       {CATEGORIES.map(cat => (
                          <button
                             key={cat.id}
                             onClick={() => setSelectedCategory(cat.id)}
                             className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                selectedCategory === cat.id 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                             }`}
                          >
                             {cat.icon}
                             {cat.label}
                          </button>
                       ))}
                    </div>
                 </div>

                 {/* Price/Value Range */}
                 <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                       <span className="text-slate-400 font-bold">Min Value</span>
                       <span className="text-emerald-400 font-bold">{priceRange[0]} BC</span>
                    </div>
                    <input 
                       type="range" 
                       min="0" 
                       max="1000" 
                       value={priceRange[0]} 
                       onChange={(e) => {
                          const nextMin = parseInt(e.target.value, 10);
                          setPriceRange([Math.min(nextMin, priceRange[1]), priceRange[1]]);
                       }}
                       className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />

                    <div className="flex justify-between text-sm pt-2">
                       <span className="text-slate-400 font-bold">Max Value</span>
                       <span className="text-emerald-400 font-bold">{priceRange[1]} BC</span>
                    </div>
                    <input 
                       type="range" 
                       min="0" 
                       max="1000" 
                       value={priceRange[1]} 
                       onChange={(e) => {
                          const nextMax = parseInt(e.target.value, 10);
                          setPriceRange([priceRange[0], Math.max(nextMax, priceRange[0])]);
                       }}
                       className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                 </div>

                 {/* Verified Toggle */}
                 <div className="pt-4 border-t border-white/5">
                    <label className="flex items-center gap-3 cursor-pointer group">
                       <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${verifiedOnly ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600 bg-transparent group-hover:border-slate-500'}`}>
                          {verifiedOnly && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                       </div>
                       <input type="checkbox" className="hidden" checked={verifiedOnly} onChange={() => setVerifiedOnly(!verifiedOnly)} />
                       <span className="text-sm text-slate-300 group-hover:text-white">Verified Traders Only</span>
                    </label>
                 </div>

                 <div className="pt-4">
                    <Button className="w-full btn-primary" onClick={handleApplyFilters}>Apply Filters</Button>
                    <Button variant="ghost" className="w-full mt-3 text-slate-400 hover:text-white" onClick={handleClearFilters}>Clear Filters</Button>
                 </div>
              </div>
           </div>

           {/* 4. Results Grid */}
           <div className="flex-1 min-h-[500px]">
              <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-bold text-white">
                    {selectedCategory === 'all' ? 'All Listings' : selectedCategory}
                 </h2>
                 <span className="text-sm text-slate-500">{filteredListings.length} results found</span>
              </div>

              {isLoading ? (
                 <div className="flex flex-col items-center justify-center py-32">
                    <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
                    <p className="text-slate-500">Searching the Verse...</p>
                 </div>
              ) : filteredListings.length > 0 ? (
                 <div className={`grid gap-6 ${
                    viewMode === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' 
                    : 'grid-cols-1'
                 }`}>
                    {sortedListings.map(listing => (
                       viewMode === 'grid' ? (
                          <ListingCard key={listing.id} listing={listing} onViewDetails={handleViewDetails} />
                       ) : (
                          <ListViewCard key={listing.id} listing={listing} onViewDetails={handleViewDetails} />
                       )
                    ))}
                 </div>
              ) : (
                 <div className="glass rounded-2xl p-12 text-center border border-dashed border-slate-700">
                    <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800">
                       <Filter className="w-8 h-8 text-slate-600" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No matches found</h3>
                    <p className="text-slate-400 mb-6">Try adjusting your filters or search for something else.</p>
                    <Button variant="outline" onClick={handleClearFilters} className="border-slate-700 text-slate-300">
                       Clear Filters
                    </Button>
                 </div>
              )}
           </div>
        </div>
      </div>

      <ListingModal
        listing={selectedListing}
        isOpen={isModalOpen}
            onClose={handleModalClose}
      />
    </div>
  );
}

// Special Card for "List View" mode
function ListViewCard({ listing, onViewDetails }: { listing: Listing, onViewDetails: (l: Listing) => void }) {
   const imageUrl = listing.images?.[0] || 'https://images.unsplash.com/photo-1557821552-17105176677c?w=500';
   
   return (
      <div className="glass p-4 rounded-xl border border-white/5 hover:border-emerald-500/30 transition-all flex gap-6 items-center group cursor-pointer" onClick={() => onViewDetails(listing)}>
         <div className="h-24 w-32 flex-shrink-0 rounded-lg overflow-hidden bg-slate-900">
            <img src={imageUrl} alt={listing.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
         </div>
         <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
               <div>
                  <h3 className="text-lg font-bold text-white truncate group-hover:text-emerald-400 transition-colors">{listing.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                     <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-xs">{listing.category}</span>
                     <span>•</span>
                     <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {listing.location || 'Remote'}</span>
                  </div>
               </div>
               <div className="text-right">
                  <div className="text-xl font-bold text-amber-400">{listing.price_bc} BC</div>
                  {listing.verified && <div className="text-xs text-emerald-500 font-medium flex items-center justify-end gap-1"><CheckCircle className="w-3 h-3" /> Verified</div>}
               </div>
            </div>
            <p className="text-sm text-slate-400 mt-2 line-clamp-1">{listing.description}</p>
         </div>
      </div>
   );
}