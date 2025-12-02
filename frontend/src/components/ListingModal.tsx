import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Coins, CheckCircle, User, Loader2 } from 'lucide-react';
import { useTrade } from '@/contexts/TradeContext';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useState } from 'react';
import type { Listing } from '@/contexts/ListingsContext';

interface ListingModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ListingModal({ listing, isOpen, onClose }: ListingModalProps) {
  const { createTrade } = useTrade();
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  if (!listing) return null;

  const displayUser = listing.owner?.display_name || 'User';
  const isOwnListing = user && listing.ownerId === user.id;

  const handleSendRequest = async () => {
    if (!isAuthenticated || !user) {
      toast.error('Please log in to send trade requests');
      return;
    }

    if (isOwnListing) {
      toast.error('You cannot send a trade request for your own listing');
      return;
    }

    setIsLoading(true);
    try {
      const success = await createTrade({
        listingId: listing.id,
        responderUserId: listing.ownerId,
        message: `I'd like to trade for your ${listing.title}`,
      });

      if (success) {
        onClose();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{listing.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="relative h-64 rounded-xl overflow-hidden">
            <img
              src={imageUrl}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
            {listing.verified && (
              <div className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm px-3 py-2 rounded-full flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Verified</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="px-4 py-2 rounded-full bg-primary/20 text-primary font-medium">
                {listing.category}
              </span>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-5 h-5" />
                <span>{listing.location}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">{displayUser}</span>
            </div>

            {listing.description && (
              <p className="text-muted-foreground leading-relaxed">
                {listing.description}
              </p>
            )}

            <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-primary/20">
              <Coins className="w-6 h-6 text-accent" />
              <div>
                <div className="text-sm text-muted-foreground">Barter Value</div>
                <div className="text-xl font-bold text-accent">{coins} BC</div>
              </div>
            </div>

            <Button
              onClick={handleSendRequest}
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 glow-effect"
              disabled={isLoading || !hasOwnerId || isOwnListing}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : isOwnListing ? (
                'Your Own Listing'
              ) : !hasOwnerId ? (
                'Mock Data - Not Available'
              ) : (
                'Send Trade Request'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
