import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

interface CoinContextType {
  balance: number;
  isLoading: boolean;
  transactions: CoinTransaction[];
  fetchBalance: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  addCoins: (amount: number, reason?: string) => Promise<boolean>;
  spendCoins: (amount: number, reason?: string) => Promise<boolean>;
  transferCoins: (toUserId: string, amount: number) => Promise<boolean>;
}

interface CoinTransaction {
  id: string;
  amount: number;
  type: string;
  description?: string;
  createdAt: string;
}

const CoinContext = createContext<CoinContextType | undefined>(undefined);

export function CoinProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchBalance = async () => {
    if (!user) {
      setBalance(0);
      setIsLoading(false);
      return;
    }

    try {
      const response = await Promise.race([
        api.getBalance(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
      ]);
      // backend returns { coins: number }
      setBalance(response.data?.coins ?? 0);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance(0);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      const response = await api.getTransactionHistory(50);
      setTransactions(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    }
  };

  const addCoins = async (amount: number, reason?: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const response = await api.addCoins(amount, reason);
      setBalance(response.data?.data?.new_balance || response.data?.new_balance || 0);
      await fetchTransactions();
      toast({
        title: 'Success',
        description: `Added ${amount} coins`,
      });
      return true;
    } catch (error: any) {
      console.error('Error adding coins:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to add coins',
        variant: 'destructive',
      });
      return false;
    }
  };

  const spendCoins = async (amount: number, reason?: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const response = await api.spendCoins(amount, reason);
      setBalance(response.data?.data?.new_balance || response.data?.new_balance || 0);
      await fetchTransactions();
      toast({
        title: 'Success',
        description: `Spent ${amount} coins`,
      });
      return true;
    } catch (error: any) {
      console.error('Error spending coins:', error);
      toast({
        title: 'Insufficient Coins',
        description: error.response?.data?.message || 'Failed to spend coins',
        variant: 'destructive',
      });
      return false;
    }
  };

  const transferCoins = async (toUserId: string, amount: number): Promise<boolean> => {
    if (!user) return false;

    try {
      const response = await api.transferCoins(toUserId, amount);
      setBalance(response.data?.data?.senderBalance || response.data?.senderBalance || 0);
      await fetchTransactions();
      toast({
        title: 'Success',
        description: `Transferred ${amount} coins`,
      });
      return true;
    } catch (error: any) {
      console.error('Error transferring coins:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to transfer coins',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Fetch balance when user logs in
  useEffect(() => {
    if (user) {
      fetchBalance();
      fetchTransactions();
    }
  }, [user]);

  // Poll for updates every 30 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchBalance();
      fetchTransactions();
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  return (
    <CoinContext.Provider
      value={{
        balance,
        isLoading,
        transactions,
        fetchBalance,
        fetchTransactions,
        addCoins,
        spendCoins,
        transferCoins,
      }}
    >
      {children}
    </CoinContext.Provider>
  );
}

export function useCoins() {
  const context = useContext(CoinContext);
  if (!context) throw new Error('useCoins must be used within CoinProvider');
  return context;
}
