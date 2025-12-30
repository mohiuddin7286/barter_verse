import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Trade {
  id: string;
  initiatorId: string;
  responderUserId?: string;
  listingId: string;
  proposedListingId?: string;
  proposedCoins?: number;
  status: 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'REJECTED';
  direction: 'incoming' | 'outgoing';
  createdAt: string;
  initiator?: {
    id: string;
    email: string;
    display_name?: string;
  };
  responder?: {
    id: string;
    email: string;
    display_name?: string;
  };
  listing?: {
    id: string;
    title: string;
  };
}

interface TradeContextType {
  trades: Trade[];
  isLoading: boolean;
  createTrade: (data: any) => Promise<boolean>;
  confirmTrade: (id: string, action: 'accept' | 'reject') => Promise<boolean>;
  acceptTrade: (id: string) => Promise<boolean>;
  rejectTrade: (id: string) => Promise<boolean>;
  completeTrade: (id: string) => Promise<boolean>;
  cancelTrade: (id: string) => Promise<boolean>;
  fetchTrades: () => Promise<void>;
}

const TradeContext = createContext<TradeContextType | undefined>(undefined);

export function TradeProvider({ children }: { children: ReactNode }) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTrades = async () => {
    if (!user) {
      setTrades([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.getTrades();
      const data = response.data || [];

      // Process trades to add direction
      const processedTrades = (Array.isArray(data) ? data : []).map((trade: any) => ({
        ...trade,
        direction: trade.responder_id === user.id || trade.responderUserId === user.id ? 'incoming' : 'outgoing',
      }));

      setTrades(processedTrades);
    } catch (error) {
      console.error('Error fetching trades:', error);
      setTrades([]);
      toast({
        title: 'Error',
        description: 'Failed to load trades',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createTrade = async (data: any): Promise<boolean> => {
    if (!user) return false;

    try {
      await api.createTrade({ ...data, initiatorId: user.id });
      await fetchTrades();
      toast({
        title: 'Trade Created',
        description: 'Your trade request has been sent!',
      });
      return true;
    } catch (error: any) {
      console.error('Error creating trade:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create trade',
        variant: 'destructive',
      });
      return false;
    }
  };

  const confirmTrade = async (id: string, action: 'accept' | 'reject'): Promise<boolean> => {
    if (!user) return false;

    try {
      await api.confirmTrade(id, action);
      await fetchTrades();
      toast({
        title: 'Success',
        description: `Trade ${action}ed successfully!`,
      });
      return true;
    } catch (error: any) {
      console.error(`Error ${action}ing trade:`, error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || `Failed to ${action} trade`,
        variant: 'destructive',
      });
      return false;
    }
  };

  // Wrapper methods for accept and reject
  const acceptTrade = async (id: string): Promise<boolean> => {
    return confirmTrade(id, 'accept');
  };

  const rejectTrade = async (id: string): Promise<boolean> => {
    return confirmTrade(id, 'reject');
  };

  const completeTrade = async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      await api.completeTrade(id);
      await fetchTrades();
      toast({
        title: 'Success',
        description: 'Trade completed successfully!',
      });
      return true;
    } catch (error: any) {
      console.error('Error completing trade:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to complete trade',
        variant: 'destructive',
      });
      return false;
    }
  };

  const cancelTrade = async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      await api.cancelTrade(id);
      await fetchTrades();
      toast({
        title: 'Success',
        description: 'Trade canceled successfully!',
      });
      return true;
    } catch (error: any) {
      console.error('Error canceling trade:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to cancel trade',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Fetch trades on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchTrades();
    }
  }, [user]);

  // Poll for updates every 30 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchTrades();
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  return (
    <TradeContext.Provider
      value={{
        trades,
        isLoading,
        createTrade,
        confirmTrade,
        acceptTrade,
        rejectTrade,
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
