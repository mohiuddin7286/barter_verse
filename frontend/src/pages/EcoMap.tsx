import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpDown,
  Clock3,
  Filter,
  Layers3,
  Loader2,
  MapPin,
  Navigation,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

type SortMode = 'recommended' | 'nearest' | 'price-asc' | 'price-desc' | 'newest';

type MapListing = {
  id: string;
  title?: string;
  category?: string;
  price_bc?: number;
  images?: string[];
  location?: string;
  createdAt?: string;
  owner?: {
    id: string;
    username?: string;
    avatar_url?: string;
    latitude?: number;
    longitude?: number;
    city?: string;
  };
};

type EnhancedMapListing = MapListing & {
  distanceKm: number | null;
  hasCoords: boolean;
  imageUrl: string;
};

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

function calculateDistanceKm(startLat: number, startLon: number, endLat: number, endLon: number) {
  const earthRadius = 6371;
  const latDelta = ((endLat - startLat) * Math.PI) / 180;
  const lonDelta = ((endLon - startLon) * Math.PI) / 180;
  const a =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.cos((startLat * Math.PI) / 180) *
      Math.cos((endLat * Math.PI) / 180) *
      Math.sin(lonDelta / 2) *
      Math.sin(lonDelta / 2);
  return 2 * earthRadius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function EcoMap() {
  const navigate = useNavigate();
  const [items, setItems] = useState<MapListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<EnhancedMapListing | null>(null);
  const [viewCoords, setViewCoords] = useState<[number, number] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortMode, setSortMode] = useState<SortMode>('recommended');
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);

  // Default: India Center
  const defaultCenter = { lat: 20.5937, lng: 78.9629 }; 

  useEffect(() => {
    loadMapData();
  }, []);

  const loadMapData = async () => {
    try {
      const res = await api.getEcoMapItems();
      setItems(res.data.data || []);
    } catch (error) {
      console.error("Failed to load map listings");
    } finally {
      setLoading(false);
    }
  };

  const enhancedItems = useMemo(() => {
    const origin = userCoords ?? [defaultCenter.lat, defaultCenter.lng];

    return items
      .map((item) => {
        const hasCoords = typeof item.owner?.latitude === 'number' && typeof item.owner?.longitude === 'number';
        const distanceKm = hasCoords
          ? calculateDistanceKm(origin[0], origin[1], item.owner!.latitude!, item.owner!.longitude!)
          : null;

        return {
          ...item,
          distanceKm,
          hasCoords,
          imageUrl: item.images?.[0] || 'https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=1000&auto=format&fit=crop',
        };
      })
      .filter((item) => {
        const matchesSearch = `${item.title || ''} ${item.owner?.username || ''} ${item.location || ''}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
        const matchesPrice = (item.price_bc || 0) >= priceRange[0] && (item.price_bc || 0) <= priceRange[1];
        return matchesSearch && matchesCategory && matchesPrice;
      })
      .sort((left, right) => {
        if (sortMode === 'price-asc') return (left.price_bc || 0) - (right.price_bc || 0);
        if (sortMode === 'price-desc') return (right.price_bc || 0) - (left.price_bc || 0);
        if (sortMode === 'newest') return new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime();
        if (sortMode === 'nearest') {
          const leftDistance = left.distanceKm ?? Number.POSITIVE_INFINITY;
          const rightDistance = right.distanceKm ?? Number.POSITIVE_INFINITY;
          return leftDistance - rightDistance;
        }

        const leftScore = (left.distanceKm ?? 999) + (left.price_bc || 0) / 1000;
        const rightScore = (right.distanceKm ?? 999) + (right.price_bc || 0) / 1000;
        return leftScore - rightScore;
      });
  }, [items, searchTerm, categoryFilter, priceRange, sortMode, userCoords]);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(items.map((item) => item.category).filter(Boolean) as string[]));
    return ['all', ...uniqueCategories.sort((left, right) => left.localeCompare(right))];
  }, [items]);

  const mapStats = useMemo(() => {
    const priced = enhancedItems.map((item) => item.price_bc || 0);
    const total = enhancedItems.length;
    const averagePrice = total ? Math.round(priced.reduce((sum, value) => sum + value, 0) / total) : 0;
    const withCoords = enhancedItems.filter((item) => item.hasCoords).length;

    return { total, averagePrice, withCoords };
  }, [enhancedItems]);

  useEffect(() => {
    if (selectedItem && !enhancedItems.find((i) => i.id === selectedItem.id)) {
      setSelectedItem(null);
    }
  }, [enhancedItems, selectedItem]);

  // Create Airbnb-style Price Marker
  const createCustomIcon = (price: number) => {
    return divIcon({
      className: 'custom-map-marker',
      html: `
        <div style="display:flex;flex-direction:column;align-items:center;transform:translateY(-6px);pointer-events:none;">
          <div style="position:relative;display:flex;align-items:center;justify-content:center;width:28px;height:28px;">
            <span class="animate-ping" style="position:absolute;inset:0;border-radius:9999px;background:rgba(16,185,129,.28);"></span>
            <span style="position:relative;display:block;width:12px;height:12px;border-radius:9999px;background:#10b981;box-shadow:0 0 0 6px rgba(16,185,129,.12), 0 0 18px rgba(16,185,129,.9);"></span>
          </div>
          <div style="margin-top:4px;padding:4px 8px;border-radius:9999px;background:rgba(15,23,42,.92);border:1px solid rgba(16,185,129,.45);color:#a7f3d0;font-size:10px;font-weight:700;letter-spacing:.02em;white-space:nowrap;box-shadow:0 8px 24px rgba(0,0,0,.28);">
            ${price} BC
          </div>
        </div>
      `,
      iconSize: [64, 56],
      iconAnchor: [32, 28]
    });
  };

  const focusUserLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Location services are not available in this browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
        setUserCoords(coords);
        setViewCoords(coords);
        toast.success('Centered on your location');
      },
      () => {
        toast.error('Unable to access your location');
      }
    );
  };

  const openListing = (item: EnhancedMapListing) => {
    navigate(`/explore?id=${item.id}`);
  };

  const selectListing = (item: EnhancedMapListing) => {
    setSelectedItem(item);
    if (item.owner?.latitude && item.owner?.longitude) {
      setViewCoords([item.owner.latitude, item.owner.longitude]);
    }
  };

  if (loading) {
      return (
          <div className="h-screen bg-background transition-colors duration-300 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
              <span className="ml-3 text-slate-900 dark:text-white font-mono">Initializing Satellites...</span>
          </div>
      );
  }

  return (
    <div className="h-[calc(100vh-64px)] w-full bg-background transition-colors duration-300 overflow-hidden">
      <div className="h-full flex flex-col xl:flex-row">
        <aside className="w-full xl:w-[440px] border-b xl:border-b-0 xl:border-r border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-950/70 backdrop-blur-xl overflow-hidden flex flex-col">
          <div className="p-4 xl:p-5 border-b border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold uppercase tracking-[0.24em]">
                  <Sparkles className="w-3 h-3" /> Listing Atlas
                </div>
                <h1 className="mt-3 text-2xl xl:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Discover nearby listings
                </h1>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-md">
                  Compare listings by price, distance, and category, then jump straight to the deal you want.
                </p>
              </div>
              <Button
                size="icon"
                variant="outline"
                className="shrink-0 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setSortMode(sortMode === 'recommended' ? 'nearest' : 'recommended')}
              >
                <Layers3 className="w-4 h-4 text-emerald-500" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Listings</div>
                <div className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{mapStats.total}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">With coords</div>
                <div className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{mapStats.withCoords}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Avg price</div>
                <div className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{mapStats.averagePrice} BC</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2">
                <Search className="w-4 h-4 text-slate-500" />
                <Input
                  placeholder="Search listings, sellers, locations"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-0 bg-transparent p-0 focus-visible:ring-0 text-slate-900 dark:text-white placeholder:text-slate-500"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="text-slate-500 hover:text-slate-900 dark:hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setCategoryFilter(category)}
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium border transition-colors ${
                      categoryFilter === category
                        ? 'bg-emerald-500 text-slate-900 border-emerald-400'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-emerald-500/40'
                    }`}
                  >
                    {category === 'all' ? 'All' : category}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {([
                  ['recommended', 'Recommended'],
                  ['nearest', 'Nearest'],
                  ['price-asc', 'Price low'],
                  ['price-desc', 'Price high'],
                ] as Array<[SortMode, string]>).map(([mode, label]) => (
                  <button
                    key={mode}
                    onClick={() => setSortMode(mode)}
                    className={`rounded-2xl border px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                      sortMode === mode
                        ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <ArrowUpDown className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>

              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Price range</h3>
                    <p className="text-xs text-slate-500">Refine the listing pool by value</p>
                  </div>
                  <div className="inline-flex items-center gap-2 text-xs text-emerald-500 font-semibold">
                    <TrendingUp className="w-3 h-3" /> Live filters
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500">Min</span>
                    <span className="text-xs font-semibold text-emerald-500">{priceRange[0]} BC</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={priceRange[0]}
                    onChange={(e) => {
                      const newMin = parseInt(e.target.value);
                      if (newMin <= priceRange[1]) setPriceRange([newMin, priceRange[1]]);
                    }}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500">Max</span>
                    <span className="text-xs font-semibold text-emerald-500">{priceRange[1]} BC</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={priceRange[1]}
                    onChange={(e) => {
                      const newMax = parseInt(e.target.value);
                      if (newMax >= priceRange[0]) setPriceRange([priceRange[0], newMax]);
                    }}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    onClick={() => {
                      setCategoryFilter('all');
                      setPriceRange([0, 1000]);
                      setSearchTerm('');
                      setSortMode('recommended');
                      toast.success('Filters reset');
                    }}
                    variant="outline"
                    className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    Reset
                  </Button>
                  <Button
                    onClick={() => toast.success('Filters are already live in the listing rail')}
                    className="rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 border border-emerald-300"
                  >
                    Apply live view
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={focusUserLocation}
                    className="rounded-2xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    My location
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-3 xl:p-4 space-y-3">
            <div className="flex items-center justify-between px-1 pb-1">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Listing options</h2>
              <span className="text-xs text-slate-500">{enhancedItems.length} matches</span>
            </div>

            {enhancedItems.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                  <Filter className="w-5 h-5 text-slate-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No listings match</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Widen your filters or try a different search term.
                </p>
              </div>
            ) : (
              enhancedItems.map((item) => {
                const isSelected = selectedItem?.id === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => selectListing(item)}
                    className={`w-full rounded-3xl border p-3 text-left transition-all duration-300 ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500/30 hover:-translate-y-0.5'
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                        <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                        <div className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                          {item.category || 'Listing'}
                        </div>
                      </div>

                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="truncate text-base font-semibold text-slate-900 dark:text-white">
                              {item.title}
                            </h3>
                            <p className="truncate text-xs text-slate-500">
                              @{item.owner?.username || 'unknown seller'}
                            </p>
                          </div>
                          <span className="shrink-0 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-500">
                            {item.price_bc || 0} BC
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-800 px-2 py-1">
                            <MapPin className="w-3 h-3" /> {item.location || item.owner?.city || 'Location pending'}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-800 px-2 py-1">
                            <Clock3 className="w-3 h-3" />
                            {item.distanceKm !== null ? `${item.distanceKm.toFixed(1)} km away` : 'Distance unavailable'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <div className="flex -space-x-2">
                            <Avatar className="h-7 w-7 border-2 border-white dark:border-slate-950">
                              <AvatarImage src={item.owner?.avatar_url} />
                              <AvatarFallback className="text-[10px]">{item.owner?.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                            </Avatar>
                          </div>
                          <span className="text-xs text-slate-500">Seller profile</span>
                          <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-emerald-500">
                            Open <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section className="relative flex-1 min-h-[52vh] xl:min-h-0 overflow-hidden">
          <div className="absolute left-4 top-4 right-4 z-[1000] flex flex-wrap items-center gap-3 pointer-events-none">
            <div className="pointer-events-auto inline-flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 px-3 py-2 shadow-lg backdrop-blur-xl">
              <Layers3 className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-medium text-slate-900 dark:text-white">Map view</span>
            </div>
            <div className="pointer-events-auto inline-flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 px-3 py-2 shadow-lg backdrop-blur-xl">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-slate-600 dark:text-slate-400">Click a card to focus the pin</span>
            </div>
            <div className="pointer-events-auto ml-auto hidden md:flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 px-3 py-2 shadow-lg backdrop-blur-xl">
              <Star className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-slate-600 dark:text-slate-400">Prices shown in Barter Coins</span>
            </div>
          </div>

          <MapContainer center={[defaultCenter.lat, defaultCenter.lng]} zoom={5} className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />

            <MapController coords={viewCoords} />

            {enhancedItems.map((item) => (
              item.hasCoords && item.owner?.latitude && item.owner?.longitude && (
                <Marker
                  key={item.id}
                  position={[item.owner.latitude, item.owner.longitude]}
                  icon={createCustomIcon(item.price_bc || 0)}
                  eventHandlers={{
                    click: () => selectListing(item),
                  }}
                />
              )
            ))}
          </MapContainer>

          <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-3">
            <Button
              size="icon"
              className="h-12 w-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={focusUserLocation}
            >
              <Navigation className="w-5 h-5 text-emerald-500" />
            </Button>
            <Button
              size="icon"
              className="h-12 w-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => toast.success('Filters are live in the listing rail')}
            >
              <Filter className="w-5 h-5 text-emerald-500" />
            </Button>
          </div>

          {selectedItem && (
            <div className="absolute bottom-4 left-4 right-4 z-[1000] md:left-auto md:right-4 md:w-[420px] animate-in slide-in-from-bottom-8 fade-in duration-300">
              <div className="glass bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl p-4 rounded-3xl border border-emerald-500/20 shadow-2xl relative">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex gap-4 pr-8">
                  <div className="h-28 w-28 shrink-0 overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800">
                    <img src={selectedItem.imageUrl} alt={selectedItem.title} className="h-full w-full object-cover" />
                  </div>

                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <Sparkles className="w-3 h-3" /> Highlighted listing
                    </div>
                    <h3 className="truncate text-lg font-bold text-slate-900 dark:text-white">
                      {selectedItem.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={selectedItem.owner?.avatar_url} />
                        <AvatarFallback className="text-[10px]">{selectedItem.owner?.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                      </Avatar>
                      <span className="truncate">@{selectedItem.owner?.username || 'unknown seller'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <MapPin className="w-4 h-4 text-emerald-500" />
                      <span className="truncate">{selectedItem.location || selectedItem.owner?.city || 'Location pending'}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-2xl font-bold text-emerald-500">{selectedItem.price_bc || 0} BC</span>
                      <span className="text-xs text-slate-500">
                        {selectedItem.distanceKm !== null ? `${selectedItem.distanceKm.toFixed(1)} km away` : 'No coordinates'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Button
                        size="sm"
                        onClick={() => openListing(selectedItem)}
                        className="rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold"
                      >
                        View listing
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (selectedItem.owner?.latitude && selectedItem.owner?.longitude) {
                            setViewCoords([selectedItem.owner.latitude, selectedItem.owner.longitude]);
                            toast.success('Focused on this listing');
                          }
                        }}
                        className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      >
                        Center map
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
