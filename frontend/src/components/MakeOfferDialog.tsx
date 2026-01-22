import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCoins } from '@/contexts/CoinContext';
import { useTrade } from '@/contexts/TradeContext';
import { Loader2, Coins, ArrowLeftRight, Package } from 'lucide-react';
import { toast } from 'sonner';

interface MakeOfferDialogProps {
  isOpen: boolean;
  onClose: () => void;
  listing: any;
}

export default function MakeOfferDialog({ isOpen, onClose, listing }: MakeOfferDialogProps) {
  const { balance } = useCoins();
  const { createTrade } = useTrade();
  const [offerType, setOfferType] = useState('coins');
  const [offerAmount, setOfferAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Safety Check: If no listing data, return null to prevent crash
  if (!listing) return null;

  // Safe Access to price
  const listingPrice = listing.price_bc ?? 0;

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      let tradeData: any = {
        listingId: listing.id,
        responderUserId: listing.owner_id, 
      };

      if (offerType === 'coins') {
        const amount = parseInt(offerAmount);
        if (isNaN(amount) || amount <= 0) {
          throw new Error('Please enter a valid coin amount');
        }
        if (amount > balance) {
          throw new Error(`Insufficient funds. You have ${balance} BC.`);
        }
        tradeData.proposedCoins = amount;
      }

      const success = await createTrade(tradeData);
      if (success) {
        onClose();
        setOfferAmount('');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send offer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0B1121] border-slate-800 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span className="text-emerald-400">⚡</span> Make an Offer
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            You are offering on <strong>{listing.title}</strong> (Listed for {listingPrice} BC)
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="coins" onValueChange={setOfferType} className="w-full mt-4">
          <TabsList className="bg-slate-900 w-full border border-slate-800">
            <TabsTrigger value="coins" className="flex-1 data-[state=active]:bg-emerald-600 text-xs">
               <Coins className="w-3 h-3 mr-2" /> Pay with Coins
            </TabsTrigger>
            <TabsTrigger value="item" className="flex-1 data-[state=active]:bg-blue-600 text-xs disabled:opacity-50" disabled>
               <Package className="w-3 h-3 mr-2" /> Trade an Item (Soon)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="coins" className="space-y-4 py-4">
             <div className="space-y-2">
                <Label className="text-xs text-slate-400 uppercase font-bold">Your Offer (BC)</Label>
                <div className="relative">
                   <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
                   <Input 
                      type="number" 
                      // FIX: Safe access to string conversion
                      placeholder={listingPrice.toString()} 
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(e.target.value)}
                      className="pl-10 bg-slate-950 border-slate-700 text-white focus:ring-emerald-500/50"
                   />
                </div>
                <div className="flex justify-between text-xs mt-2">
                   <span className="text-slate-500">Asking Price: {listingPrice} BC</span>
                   <span className={`${balance < parseInt(offerAmount || '0') ? 'text-red-400' : 'text-emerald-400'}`}>
                      Your Balance: {balance} BC
                   </span>
                </div>
             </div>
          </TabsContent>
          
          <TabsContent value="item" className="py-8 text-center text-slate-500">
             <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
             <p>Select an item from your inventory to trade.</p>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4 gap-2 sm:gap-0">
          <Button variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white">Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-500 text-white w-full sm:w-auto">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowLeftRight className="w-4 h-4 mr-2" />}
            Send Offer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}