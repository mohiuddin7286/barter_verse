import { Heart, MapPin, Coins, CheckCircle } from 'lucide-react';
import { useListings } from '@/contexts/ListingsContext';
import { Button } from '@/components/ui/button';
import type { Listing } from '@/contexts/ListingsContext';

interface ListingCardProps {
  listing: Listing;
  onViewDetails: (listing: Listing) => void;
}

export default function ListingCard({ listing, onViewDetails }: ListingCardProps) {
  const { toggleWishlist, isInWishlist } = useListings();
  const inWishlist = isInWishlist(listing.id);
  const imageUrl = listing.images?.[0] || 'https://images.unsplash.com/photo-1557821552-17105176677c?w=500';
  const displayUser = listing.owner_name || 'User';
  const coins = listing.price_bc || 0;

  return (
    <div className="card-glass rounded-2xl overflow-hidden group hover:glow-effect transition-all duration-300">
      <div className="relative overflow-hidden h-48">
        <img
          src={imageUrl}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {listing.verified && (
          <div className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            <span className="text-xs font-medium">Verified</span>
          </div>
        )}
        <button
          onClick={() => toggleWishlist(listing.id)}
          className="absolute top-3 left-3 bg-card/90 backdrop-blur-sm p-2 rounded-full hover:scale-110 transition-transform"
        >
          <Heart
            className={`w-5 h-5 ${inWishlist ? 'fill-destructive text-destructive' : 'text-foreground'}`}
          />
        </button>
      </div>

      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg line-clamp-1">{listing.title}</h3>
          <span className="text-xs px-3 py-1 rounded-full bg-primary/20 text-primary whitespace-nowrap">
            {listing.category}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>{listing.location}</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-accent" />
            <span className="font-semibold text-accent">{coins} BC</span>
          </div>
          <Button
            onClick={() => onViewDetails(listing)}
            variant="default"
            size="sm"
            className="bg-primary hover:bg-primary/90"
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
}
