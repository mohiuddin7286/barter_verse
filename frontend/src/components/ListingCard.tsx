import { Heart, MapPin, Coins, CheckCircle, ArrowRight, Star, User, MoreVertical, Edit, Trash2, EyeOff } from 'lucide-react';
import { useListings } from '@/contexts/ListingsContext';
import { useAuth } from '@/contexts/AuthContext'; // Import Auth to check ownership
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Listing } from '@/contexts/ListingsContext';

interface ListingCardProps {
  listing: Listing;
  onViewDetails: (listing: Listing) => void;
  // New optional props for management
  onEdit?: (listing: Listing) => void;
  onDelete?: (id: string) => void;
}

export default function ListingCard({ listing, onViewDetails, onEdit, onDelete }: ListingCardProps) {
  const { user } = useAuth();
  const { toggleWishlist, isInWishlist } = useListings();
  
  const inWishlist = isInWishlist(listing.id);
  // Check if the logged-in user is the owner of this listing
  const isOwner = user?.id === listing.owner?.id || user?.id === listing.owner_id;

  const imageUrl = listing.images?.[0] || 'https://images.unsplash.com/photo-1557821552-17105176677c?w=500';
  const coins = listing.price_bc || 0;
  
  // Owner Details
  const ownerName = listing.owner?.username || 'Unknown User';
  const ownerAvatar = listing.owner?.avatar_url;
  const ownerRating = listing.owner?.rating ? listing.owner.rating.toFixed(1) : 'New';

  const badgeColor = 
    listing.category === 'Skills' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
    listing.category === 'Services' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
    'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';

  return (
    <div className="group relative bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-900/20 flex flex-col h-full">
      
      {/* 1. Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={imageUrl}
          alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
        
        {/* --- ACTION BUTTON LOGIC --- */}
        {isOwner ? (
          // If Owner: Show Management Menu
          <div className="absolute top-3 right-3 z-20">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 rounded-full bg-slate-950/50 backdrop-blur-md border border-white/10 hover:bg-white hover:text-black transition-all text-white">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-200">
                <DropdownMenuItem onClick={() => onViewDetails(listing)} className="cursor-pointer hover:bg-slate-800">
                   View Public Page
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(listing); }} className="cursor-pointer hover:bg-slate-800">
                  <Edit className="w-4 h-4 mr-2" /> Edit Listing
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => e.stopPropagation()} className="cursor-pointer hover:bg-slate-800 text-slate-400">
                  <EyeOff className="w-4 h-4 mr-2" /> Archive
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-800" />
                <DropdownMenuItem 
                  onClick={(e) => { e.stopPropagation(); onDelete?.(listing.id); }} 
                  className="cursor-pointer text-red-400 hover:bg-red-900/20 hover:text-red-300 focus:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          // If Visitor: Show Wishlist Heart
          <button
            onClick={(e) => { e.stopPropagation(); toggleWishlist(listing.id); }}
            className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/50 backdrop-blur-md border border-white/10 hover:bg-white hover:text-red-500 transition-all group/heart z-20"
          >
            <Heart
              className={`w-4 h-4 ${inWishlist ? 'fill-red-500 text-red-500' : 'text-slate-300 group-hover/heart:text-red-500'}`}
            />
          </button>
        )}

        {/* Verified Badge */}
        {listing.verified && (
          <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-amber-500/90 text-slate-900 flex items-center gap-1 text-[10px] font-bold shadow-lg">
            <CheckCircle className="w-3 h-3" />
            VERIFIED
          </div>
        )}

        {/* Price Tag Overlay */}
        <div className="absolute bottom-3 right-3">
             <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/80 backdrop-blur border border-amber-500/30 shadow-lg">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-sm font-bold text-amber-100">{coins} BC</span>
             </div>
        </div>
      </div>

      {/* 2. Content */}
      <div className="p-5 flex flex-col flex-1">
        
        {/* Category & Location */}
        <div className="flex items-start justify-between mb-3">
            <div className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${badgeColor}`}>
                {listing.category?.toUpperCase() || 'ITEM'}
            </div>
            <div className="flex items-center text-xs text-slate-500">
                <MapPin className="w-3 h-3 mr-1" />
                <span className="truncate max-w-[80px]">{listing.location || 'Remote'}</span>
            </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-100 mb-2 line-clamp-1 group-hover:text-emerald-400 transition-colors">
            {listing.title}
        </h3>
        
        {/* Description */}
        <p className="text-sm text-slate-400 line-clamp-2 mb-4 flex-1 min-h-[40px]">
            {listing.description || 'No description provided.'}
        </p>

        {/* User Info Section */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 mb-4">
            <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                    {ownerAvatar ? (
                        <img src={ownerAvatar} alt={ownerName} className="h-full w-full object-cover" />
                    ) : (
                        <User className="w-3 h-3 text-slate-400" />
                    )}
                </div>
                <span className="text-xs text-slate-300 font-medium truncate max-w-[100px]">
                    {isOwner ? 'You' : `@${ownerName}`}
                </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                <Star className="w-3 h-3 fill-amber-400" /> 
                <span className="font-bold">{ownerRating}</span>
            </div>
        </div>

        {/* Action Button */}
        {isOwner ? (
            <Button 
                onClick={() => onEdit?.(listing)} 
                variant="outline"
                className="w-full border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
            >
                <Edit className="w-4 h-4 mr-2" /> Manage Listing
            </Button>
        ) : (
            <Button 
                onClick={() => onViewDetails(listing)} 
                className="w-full bg-slate-800 hover:bg-emerald-600 text-white border border-slate-700 hover:border-emerald-500 transition-all group/btn"
            >
                View Details
                <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
        )}
      </div>
    </div>
  );
}