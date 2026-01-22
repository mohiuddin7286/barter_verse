import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { divIcon } from 'leaflet'; 
import 'leaflet/dist/leaflet.css';
import { api } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { Loader2, MapPin, Navigation, Search, Filter, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

// --- Custom Component to fly to location ---
function MapController({ coords }: { coords: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo(coords, 13, { duration: 2 }); // Smooth animation
    }
  }, [coords, map]);
  return null;
}

export default function EcoMap() {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [viewCoords, setViewCoords] = useState<[number, number] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  // Default: India Center
  const defaultCenter = { lat: 20.5937, lng: 78.9629 }; 

  useEffect(() => {
    loadMapData();
  }, []);

  const loadMapData = async () => {
    try {
      const res = await api.getEcoMapItems();
      setItems(res.data.data);
    } catch (error) {
      console.error("Failed to load map listings");
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = `${item.title || ''} ${item.owner?.username || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesPrice = (item.price_bc || 0) >= priceRange[0] && (item.price_bc || 0) <= priceRange[1];
    return matchesSearch && matchesCategory && matchesPrice;
  });

  useEffect(() => {
    if (selectedItem && !filteredItems.find((i) => i.id === selectedItem.id)) {
      setSelectedItem(null);
    }
  }, [filteredItems, selectedItem]);

  // Create Airbnb-style Price Marker
  const createCustomIcon = (price: number) => {
    return divIcon({
      className: 'custom-map-marker',
      html: `<div class="price-marker">${price} BC</div>`,
      iconSize: [50, 30],
      iconAnchor: [25, 15]
    });
  };

  if (loading) {
      return (
          <div className="h-screen bg-[#020617] flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
              <span className="ml-3 text-white font-mono">Initializing Satellites...</span>
          </div>
      );
  }

  return (
    <div className="h-[calc(100vh-64px)] w-full relative bg-[#020617] overflow-hidden">
      
      {/* 1. Floating Header (Search & Filter) */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-col md:flex-row gap-3 pointer-events-none">
         <div className="glass p-2 rounded-xl border border-white/10 flex items-center gap-2 pointer-events-auto shadow-2xl md:w-96 w-full">
            <Search className="w-5 h-5 text-slate-400 ml-2" />
            <Input 
              placeholder="Search items nearby..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
              className="border-none bg-transparent focus-visible:ring-0 text-white placeholder:text-slate-500 h-8"
            />
         </div>
         <Button className="glass pointer-events-auto border border-white/10 text-white hover:bg-slate-800 w-fit" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" /> Filters
         </Button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="absolute top-20 left-4 z-[999] w-80 glass p-4 rounded-xl border border-white/10 shadow-xl pointer-events-auto">
          <h3 className="text-white font-bold mb-4">Filter Listings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 block mb-2">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
              >
                <option value="all">All Categories</option>
                <option value="Skills">Skills</option>
                <option value="Items">Items</option>
                <option value="Services">Services</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-400 block mb-2">Price Range</label>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold text-sm">{priceRange[0]} BC</span>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={priceRange[0]}
                  onChange={(e) => {
                    const newMin = parseInt(e.target.value);
                    if (newMin <= priceRange[1]) setPriceRange([newMin, priceRange[1]]);
                  }}
                  className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-emerald-400 font-bold text-sm">{priceRange[1]} BC</span>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={priceRange[1]}
                  onChange={(e) => {
                    const newMax = parseInt(e.target.value);
                    if (newMax >= priceRange[0]) setPriceRange([priceRange[0], newMax]);
                  }}
                  className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>

            <Button
              onClick={() => {
                setShowFilters(false);
                toast.success('Filters applied');
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              Apply
            </Button>
          </div>
        </div>
      )}

      <MapContainer center={[defaultCenter.lat, defaultCenter.lng]} zoom={5} className="h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <MapController coords={viewCoords} />

        {filteredItems.map((item) => (
            item.owner?.latitude && item.owner?.longitude && (
                <Marker 
                    key={item.id} 
                    position={[item.owner.latitude, item.owner.longitude]}
                    icon={createCustomIcon(item.price_bc)}
                    eventHandlers={{
                      click: () => {
                        setSelectedItem(item);
                        setViewCoords([item.owner.latitude, item.owner.longitude]);
                      },
                    }}
                />
            )
        ))}
      </MapContainer>

      {/* 3. Floating User Location Button */}
      <div className="absolute bottom-32 right-4 z-[1000]">
         <Button 
            size="icon" 
            className="h-12 w-12 rounded-full bg-slate-900 border border-emerald-500/30 text-emerald-400 shadow-xl hover:bg-slate-800"
            onClick={() => {
               navigator.geolocation.getCurrentPosition(pos => {
                  setViewCoords([pos.coords.latitude, pos.coords.longitude]);
               });
            }}
         >
            <Navigation className="w-5 h-5" />
         </Button>
      </div>

      {/* 4. Selected Item Card (Floating Bottom Sheet) */}
      {selectedItem && (
        <div className="absolute bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-[1000] animate-in slide-in-from-bottom-10 fade-in duration-300">
           <div className="glass bg-slate-900/90 backdrop-blur-xl p-4 rounded-3xl border border-emerald-500/30 shadow-2xl relative">
              
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-2 right-2 p-1 rounded-full bg-slate-800/50 text-slate-400 hover:text-white hover:bg-red-500/20 hover:text-red-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex gap-4">
                 <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-white/10">
                    <img 
                      src={selectedItem.images?.[0] || 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=1000'} 
                      alt={selectedItem.title} 
                      className="w-full h-full object-cover"
                    />
                 </div>
                 
                 <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-lg truncate">{selectedItem.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                       <Avatar className="w-5 h-5">
                          <AvatarImage src={selectedItem.owner?.avatar_url} />
                          <AvatarFallback className="text-[10px]">{selectedItem.owner?.username?.[0]}</AvatarFallback>
                       </Avatar>
                       <span className="text-sm text-slate-400 truncate">{selectedItem.owner?.username}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                       <span className="text-emerald-400 font-bold font-mono text-xl">{selectedItem.price_bc} BC</span>
                       <Button 
                          size="sm" 
                          onClick={() => navigate(`/explore?id=${selectedItem.id}`)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-4"
                        >
                          View Deal
                       </Button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}