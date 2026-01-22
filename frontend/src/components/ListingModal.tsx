import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, User, ShieldCheck, X, ArrowRight, Star, Calendar, Share2, Heart } from 'lucide-react';
import { useState } from 'react';
import MakeOfferDialog from './MakeOfferDialog';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ListingModalProps {
  listing: any; // Using 'any' for flexibility with your current context types
  isOpen: boolean;
  onClose: () => void;
}

export default function ListingModal({ listing, isOpen, onClose }: ListingModalProps) {
  const { user } = useAuth();
  const [isOfferOpen, setIsOfferOpen] = useState(false);

  if (!listing) return null;

  const isOwner = user?.id === listing.owner_id;

   const handleShare = async () => {
      const shareUrl = `${window.location.origin}/explore?id=${listing.id}`;
      const shareData = {
         title: listing.title,
         text: `Check out this listing on BarterVerse: ${listing.title}`,
         url: shareUrl,
      };

      try {
         if (navigator.share) {
            await navigator.share(shareData);
            toast.success('Shared successfully');
         } else if (navigator.clipboard) {
            await navigator.clipboard.writeText(shareUrl);
            toast.success('Link copied to clipboard');
         } else {
            toast.message('Share not available on this device');
         }
      } catch (error) {
         toast.error('Unable to share right now');
      }
   };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl p-0 bg-[#0B1121] border-slate-800 text-slate-200 overflow-hidden h-[90vh] md:h-auto md:max-h-[85vh] flex flex-col md:flex-row gap-0">
          
          {/* Close Button (Mobile friendly) */}
          <button 
             onClick={onClose} 
             className="absolute right-4 top-4 z-50 p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors"
          >
             <X className="w-5 h-5" />
          </button>

          {/* LEFT: Image Gallery */}
          <div className="w-full md:w-1/2 h-64 md:h-auto bg-slate-900 relative group">
             <img 
               src={listing.images?.[0] || 'https://images.unsplash.com/photo-1556740758-90de374c12ad'} 
               alt={listing.title} 
               className="w-full h-full object-cover"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-[#0B1121] to-transparent md:hidden" />
             
             {/* Floating Price Badge */}
             <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 px-4 py-2 bg-black/60 backdrop-blur-xl rounded-xl border border-white/10 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-400 font-bold text-lg">{listing.price_bc} BC</span>
             </div>
          </div>

          {/* RIGHT: Content & Actions */}
          <div className="w-full md:w-1/2 flex flex-col h-full bg-[#0B1121]">
             <ScrollArea className="flex-1 p-6 md:p-8">
                <div className="space-y-6">
                   
                   {/* Header Info */}
                   <div>
                      <div className="flex items-center gap-2 mb-3">
                         <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1">
                            {listing.category}
                         </Badge>
                         {listing.verified && (
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 gap-1 pl-1">
                               <ShieldCheck className="w-3 h-3" /> Verified
                            </Badge>
                         )}
                      </div>
                      <h2 className="text-3xl font-extrabold text-white leading-tight mb-2">{listing.title}</h2>
                      <div className="flex items-center text-slate-400 text-sm gap-4">
                         <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {listing.location || 'Remote'}</span>
                         <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Posted 2d ago</span>
                      </div>
                   </div>

                   {/* Description */}
                   <div className="space-y-2">
                      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Description</h3>
                      <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                         {listing.description || 'No detailed description provided by the seller.'}
                      </p>
                   </div>

                   {/* Seller Info Card */}
                   <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-center gap-4">
                      <Avatar className="w-12 h-12 border-2 border-slate-700">
                         <AvatarImage src={listing.owner?.avatar_url} />
                         <AvatarFallback className="bg-slate-800 text-slate-400">
                            <User className="w-6 h-6" />
                         </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                         <div className="font-bold text-white text-sm">Seller Info</div>
                         <div className="text-xs text-slate-500">Member since 2024</div>
                      </div>
                      <div className="text-right">
                         <div className="flex items-center text-amber-400 font-bold text-sm gap-1">
                            <Star className="w-4 h-4 fill-current" /> 4.9
                         </div>
                         <div className="text-[10px] text-slate-500">24 Trades</div>
                      </div>
                   </div>
                </div>
             </ScrollArea>

             {/* Action Footer */}
             <div className="p-6 border-t border-slate-800 bg-[#0B1121] z-10 flex gap-3">
                <Button variant="outline" className="flex-1 border-slate-700 hover:bg-slate-800 text-slate-300" onClick={handleShare}>
                   <Share2 className="w-4 h-4 mr-2" /> Share
                </Button>
                
                <Button 
                   onClick={() => setIsOfferOpen(true)}
                   disabled={isOwner}
                   className={`flex-[2] font-bold text-lg h-12 ${
                      isOwner 
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                   }`}
                >
                   {isOwner ? (
                      'Manage Listing'
                   ) : (
                      <>
                         Make an Offer <ArrowRight className="ml-2 w-5 h-5" />
                      </>
                   )}
                </Button>
             </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Connection to the Transaction Logic */}
      <MakeOfferDialog 
         isOpen={isOfferOpen} 
         onClose={() => setIsOfferOpen(false)} 
         listing={listing} 
      />
    </>
  );
}