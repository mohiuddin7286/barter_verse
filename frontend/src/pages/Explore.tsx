import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Loader2, MapPin } from 'lucide-react';
import { useListings } from '@/contexts/ListingsContext';
import ListingCard from '@/components/ListingCard';
import ListingModal from '@/components/ListingModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Listing } from '@/contexts/ListingsContext';

export default function Explore() {
  const { listings, isLoading } = useListings();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Location-based search
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [radius, setRadius] = useState(50);
  const [nearbyResults, setNearbyResults] = useState<any[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || listing.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'Skills', 'Items', 'Services'];

  const handleViewDetails = (listing: Listing) => {
    setSelectedListing(listing);
    setIsModalOpen(true);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage('❌ Geolocation is not supported by your browser');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLocationMessage('✅ Location detected!');
        setLocationLoading(false);
      },
      () => {
        setLocationMessage('❌ Failed to access your location');
        setLocationLoading(false);
      }
    );
  };

  const searchNearby = async () => {
    if (!latitude || !longitude) {
      setLocationMessage('❌ Please set your location first');
      return;
    }

    try {
      setLocationLoading(true);
      const response = await fetch(
        `/api/location/nearby-listings?latitude=${latitude}&longitude=${longitude}&radius=${radius}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      const result = await response.json();
      if (result.success) {
        setNearbyResults(result.data);
        setLocationMessage(`✅ Found ${result.data.length} listings within ${radius} km`);
      } else {
        setLocationMessage(`❌ ${result.message}`);
      }
    } catch (error: any) {
      setLocationMessage(`❌ Error: ${error.message}`);
    } finally {
      setLocationLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-extrabold text-center tracking-tight leading-tight">Explore Listings</h1>
          <p className="text-base leading-relaxed tracking-wide text-muted-foreground text-center">
            Discover amazing items, services, and skills available for trade
          </p>
        </div>

        {/* Tabs for Search vs Location */}
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search">🔍 Search Listings</TabsTrigger>
            <TabsTrigger value="nearby">📍 Find Nearby</TabsTrigger>
          </TabsList>

          {/* Search Tab */}
          <TabsContent value="search" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search listings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 bg-[#0B1120] border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-48 h-12 bg-[#0B1120] border border-border rounded-xl">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Results Count */}
            <div className="text-muted-foreground">
              Showing {filteredListings.length} {filteredListings.length === 1 ? 'listing' : 'listings'}
            </div>

            {/* Listings Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredListings.map(listing => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>

                {filteredListings.length === 0 && (
                  <div className="text-center py-20">
                    <p className="text-xl text-muted-foreground">No listings found. Try adjusting your filters.</p>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Location Tab */}
          <TabsContent value="nearby" className="space-y-6">
            <div className="space-y-4 p-6 border rounded-lg">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <MapPin className="w-5 h-5" /> Find Listings Near You
              </h2>

              {locationMessage && (
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm">
                  {locationMessage}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-2">Latitude</label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={latitude || ''}
                    onChange={(e) => setLatitude(parseFloat(e.target.value) || null)}
                    placeholder="e.g., 28.7041"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">Longitude</label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={longitude || ''}
                    onChange={(e) => setLongitude(parseFloat(e.target.value) || null)}
                    placeholder="e.g., 77.1025"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={useCurrentLocation}
                  disabled={locationLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  📍 Use Current Location
                </Button>

                <div>
                  <label className="text-sm font-medium block mb-2">Search Radius (km)</label>
                  <Input
                    type="number"
                    value={radius}
                    onChange={(e) => setRadius(parseInt(e.target.value) || 50)}
                    min="1"
                    max="500"
                  />
                </div>
              </div>

              <Button
                onClick={searchNearby}
                disabled={locationLoading}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {locationLoading ? 'Searching...' : 'Search Nearby Listings'}
              </Button>
            </div>

            {/* Nearby Results */}
            {nearbyResults.length > 0 && (
              <div className="space-y-4">
                <div className="text-muted-foreground">
                  Found {nearbyResults.length} {nearbyResults.length === 1 ? 'listing' : 'listings'}
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {nearbyResults.map(listing => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <ListingModal
        listing={selectedListing}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
