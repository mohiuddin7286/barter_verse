import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';
import { useAuth } from './AuthContext';
import { useCoins } from './CoinContext';
import { useToast } from '@/hooks/use-toast';

export interface Trade {
  id: string;
  initiatorId: string;
  responderUserId?: string;
  listingId: string;
  proposedListingId?: string;
  proposedCoins?: number;
  // Enhanced Status State Machine
  status: 'PENDING' | 'ESCROW_LOCKED' | 'DELIVERED' | 'COMPLETED' | 'REJECTED' | 'DISPUTED';
  direction: 'incoming' | 'outgoing';
  createdAt: string;
  initiator?: {
    id: string;
    email: string;
    display_name?: string;
    avatar_url?: string;
    reputation_score?: number; // Added for Trust Logic
  };
  responder?: {
    id: string;
    email: string;
    display_name?: string;
    avatar_url?: string;
  };
  listing?: {
    id: string;
    title: string;
    price_bc: number;
    images?: string[];
  };
}

interface TradeContextType {
  trades: Trade[];
  isLoading: boolean;
  activeEscrowAmount: number; // New: Track locked coins
  createTrade: (data: any) => Promise<boolean>;
  acceptTrade: (id: string) => Promise<boolean>;
  rejectTrade: (id: string) => Promise<boolean>;
  confirmDelivery: (id: string) => Promise<boolean>; // New: Step 2 of Escrow
  completeTrade: (id: string) => Promise<boolean>;   // New: Final Release
  cancelTrade: (id: string) => Promise<boolean>;
  fetchTrades: () => Promise<void>;
}

const TradeContext = createContext<TradeContextType | undefined>(undefined);

export function TradeProvider({ children }: { children: ReactNode }) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const coinContext = useCoins();

  // Calculated value: Total coins currently locked in escrow
  const activeEscrowAmount = trades
    .filter(t => t.status === 'ESCROW_LOCKED' && t.direction === 'outgoing')
    .reduce((acc, t) => acc + (t.proposedCoins || 0), 0);

  const fetchTrades = async () => {
    if (!user) {
      setTrades([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.getTrades();
      const data = response.data?.data || response.data || [];

      // Process trades to add direction
      const processedTrades = (Array.isArray(data) ? data : []).map((trade: any) => ({
        ...trade,
        direction: trade.responder_id === user.id || trade.responderUserId === user.id ? 'incoming' : 'outgoing',
      }));

      // Sort by status priority (Action Required -> Active -> Completed)
      const sortedTrades = processedTrades.sort((a: Trade, b: Trade) => {
        const priority = { 'PENDING': 1, 'ESCROW_LOCKED': 2, 'DELIVERED': 3, 'COMPLETED': 4, 'REJECTED': 5, 'DISPUTED': 0 };
        return (priority[a.status] || 99) - (priority[b.status] || 99);
      });

      setTrades(sortedTrades);
    } catch (error) {
      console.error('Error fetching trades:', error);
      // Silent fail on fetch to avoid spamming toasts
    } finally {
      setIsLoading(false);
    }
  };

  // 1. INITIATE: Propose a trade (Coins are checked but not locked yet)
  const createTrade = async (data: any): Promise<boolean> => {
    if (!user) return false;

    // Safety Check: Do they have enough coins?
    if (data.proposedCoins && coinContext.balance < data.proposedCoins) {
        toast({ title: 'Insufficient Funds', description: 'You need more Barter Coins to make this offer.', variant: 'destructive' });
        return false;
    }

    try {
      await api.createTrade({ ...data, initiatorId: user.id });
      await fetchTrades();
      toast({
        title: 'Offer Sent',
        description: 'Waiting for the seller to accept. Your coins will be locked when they accept.',
      });
      return true;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to send offer',
        variant: 'destructive',
      });
      return false;
    }
  };

  // 2. ACCEPT: This triggers the ESCROW LOCK
  const acceptTrade = async (id: string): Promise<boolean> => {
    try {
      // API call should handle the coin locking on the backend
      await api.confirmTrade(id, 'accept'); 
      await fetchTrades();
      
      // Update local balance UI
      try { await coinContext.fetchBalance(); } catch {}
      
      toast({
        title: 'Trade Accepted',
        description: 'Escrow initiated. Coins are now LOCKED until completion.',
        className: 'bg-emerald-500 text-white border-none',
      });
      return true;
    } catch (error: any) {
      toast({ title: 'Error', description: 'Could not accept trade.', variant: 'destructive' });
      return false;
    }
  };

  const rejectTrade = async (id: string): Promise<boolean> => {
    try {
      await api.confirmTrade(id, 'reject');
      await fetchTrades();
      toast({ title: 'Trade Rejected', description: 'The offer has been declined.' });
      return true;
    } catch (error) {
      return false;
    }
  };

  // 3. CONFIRM DELIVERY: Seller says "I have sent the item"
  const confirmDelivery = async (id: string): Promise<boolean> => {
    try {
        // In a real backend, this updates status to 'DELIVERED'
        // For now, we might simulate this or use a specific API endpoint
        // await api.updateTradeStatus(id, 'DELIVERED'); 
        
        toast({
            title: 'Delivery Confirmed',
            description: 'Buyer has been notified to verify receipt.',
        });
        await fetchTrades();
        return true;
    } catch (error) {
        return false;
    }
  };

  // 4. COMPLETE: Buyer confirms receipt -> Coins Released to Seller
  const completeTrade = async (id: string): Promise<boolean> => {
    try {
      await api.completeTrade(id);
      await fetchTrades();
      
      // Coins move from Escrow -> Seller Wallet
      try { await coinContext.fetchBalance(); await coinContext.fetchTransactions(); } catch {}
      
      toast({
        title: 'Trade Completed! 🎉',
        description: 'Funds released. Please rate your partner.',
        className: 'bg-blue-600 text-white border-none',
      });
      return true;
    } catch (error: any) {
      toast({ title: 'Error', description: 'Failed to complete trade.', variant: 'destructive' });
      return false;
    }
  };

  const cancelTrade = async (id: string): Promise<boolean> => {
    try {
      await api.cancelTrade(id);
      await fetchTrades();
      toast({ title: 'Trade Cancelled', description: 'Any locked funds have been returned.' });
      return true;
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (user) fetchTrades();
  }, [user, authLoading]);

  // Poll for status updates (Crucial for Escrow states)
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(fetchTrades, 15000); // 15s poll
    return () => clearInterval(interval);
  }, [user]);

  return (
    <TradeContext.Provider
      value={{
        trades,
        isLoading,
        activeEscrowAmount,
        createTrade,
        acceptTrade,
        rejectTrade,
        confirmDelivery,
        completeTrade,
        cancelTrade,
        fetchTrades,
      }}
    >
      {children}
    </TradeContext.Provider>
  );
}

export function useTrade() {
  const context = useContext(TradeContext);
  if (!context) throw new Error('useTrade must be used within TradeProvider');
  return context;
}