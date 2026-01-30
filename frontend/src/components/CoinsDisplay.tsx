import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Coins, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Transaction {
  id: string;
  amount: number;
  reason: string;
  created_at: string;
}

export function CoinsDisplay() {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchCoinsData();
    
    // Auto-refresh coins every 5 seconds
    const interval = setInterval(fetchCoinsData, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchCoinsData = async () => {
    try {
      setIsLoading(true);
      const [balanceRes, historyRes] = await Promise.all([
        api.getBalance(),
        api.getTransactionHistory(5)
      ]);
      setBalance(balanceRes?.data?.balance || 0);
      setTransactions(historyRes?.data?.transactions || []);
    } catch (error) {
      console.error('Failed to fetch coins:', error);
      setBalance(0);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500/50 text-amber-400"
        >
          <Coins className="w-4 h-4" />
          <span className="font-semibold">{isLoading ? '...' : balance}</span>
          <span className="text-xs text-amber-300">BC</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md bg-slate-900 border border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-400">
            <Coins className="w-5 h-5" />
            BarterCoins Account
          </DialogTitle>
          <DialogDescription>
            View your balance and recent transactions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Balance Card */}
          <Card className="bg-gradient-to-br from-amber-500/20 to-orange-500/10 border-amber-500/30">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <p className="text-sm text-slate-300">Your Balance</p>
                <p className="text-4xl font-bold text-amber-400">{balance}</p>
                <p className="text-xs text-slate-400">BarterCoins</p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <div className="space-y-3">
            <h3 className="font-semibold text-white text-sm">Recent Activity</h3>
            {isLoading ? (
              <div className="text-center py-6 text-slate-400">Loading...</div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-sm">
                No transactions yet
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-slate-600 transition"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {tx.amount > 0 ? (
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {tx.reason}
                        </p>
                        <p className="text-xs text-slate-400">
                          {formatDate(tx.created_at)}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`font-semibold whitespace-nowrap ml-2 ${
                        tx.amount > 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {tx.amount > 0 ? '+' : ''}{tx.amount}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={fetchCoinsData}
              disabled={isLoading}
            >
              Refresh
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
              onClick={() => setIsOpen(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
