import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCoins } from '@/contexts/CoinContext';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Coins, Package, ArrowLeftRight, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  totalListings: number;
  activeListings: number;
  completedTrades: number;
  totalCoins: number;
}

interface Listing {
  id: string;
  title: string;
  category: string;
  price_bc: number;
  images: string[];
  created_at: string;
}

export default function Dashboard() {
  const { balance, transactions } = useCoins();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalListings: 0,
    activeListings: 0,
    completedTrades: 0,
    totalCoins: 0,
  });
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [chartData, setChartData] = useState<{ month: string; trades: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Fetch user's listings
      const listingsResponse = await api.getUserListings(user.id);
      const listingsData = Array.isArray(listingsResponse.data.data) ? listingsResponse.data.data : [];

      // Fetch user's trades
      const tradesResponse = await api.getTrades(user.id);
      const tradesData = Array.isArray(tradesResponse.data.data) ? tradesResponse.data.data : [];

      const completedTrades = tradesData.filter(t => t.status === 'COMPLETED').length || 0;

      // Calculate chart data from trades (last 6 months)
      const now = new Date();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        return {
          month: months[date.getMonth()],
          trades: 0,
        };
      });

      tradesData.forEach(trade => {
        if (trade.status === 'COMPLETED') {
          const tradeDate = new Date(trade.createdAt || new Date());
          const monthDiff = (now.getFullYear() - tradeDate.getFullYear()) * 12 + (now.getMonth() - tradeDate.getMonth());
          if (monthDiff < 6) {
            const idx = 5 - monthDiff;
            if (idx >= 0 && idx < 6) {
              last6Months[idx].trades++;
            }
          }
        }
      });

      setStats({
        totalListings: listingsData.length || 0,
        activeListings: listingsData.filter((l: any) => l.status === 'ACTIVE').length || 0,
        completedTrades,
        totalCoins: balance,
      });
      setMyListings(listingsData);
      setChartData(last6Months);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Poll for updates every 30 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-extrabold text-center tracking-tight leading-tight">Dashboard</h1>
          <p className="text-base leading-relaxed tracking-wide text-muted-foreground text-center">
            Track your trading activity and performance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<Package className="w-8 h-8" />}
            title="Total Listings"
            value={isLoading ? '...' : stats.totalListings}
            color="primary"
          />
          <StatCard
            icon={<ArrowLeftRight className="w-8 h-8" />}
            title="Trades Completed"
            value={isLoading ? '...' : stats.completedTrades}
            color="accent"
          />
          <StatCard
            icon={<Coins className="w-8 h-8" />}
            title="Coin Balance"
            value={isLoading ? '...' : `${balance} BC`}
            color="accent"
          />
          <StatCard
            icon={<TrendingUp className="w-8 h-8" />}
            title="Active Listings"
            value={isLoading ? '...' : stats.activeListings}
            color="primary"
          />
        </div>

        {/* Trade Activity Chart */}
        <Card className="bg-[#0B1120] rounded-2xl p-6 shadow-lg border border-border">
          <CardHeader>
            <CardTitle>Trade Activity (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Loading chart data...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="trades"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent Listings */}
        <Card className="bg-[#0B1120] rounded-2xl p-6 shadow-lg border border-border">
          <CardHeader>
            <CardTitle>Your Recent Listings</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading listings...</div>
            ) : myListings.length > 0 ? (
              <div className="space-y-4">
                {myListings.slice(0, 5).map(listing => (
                  <div
                    key={listing.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {listing.images?.[0] && (
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <div className="font-medium">{listing.title}</div>
                        <div className="text-sm text-muted-foreground">{listing.category}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-yellow-500" />
                      <span className="font-semibold text-yellow-500">{listing.price_bc} BC</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No listings yet. Create your first listing to get started!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Coin Transactions History */}
        <Card className="bg-[#0B1120] rounded-2xl p-6 shadow-lg border border-border">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.slice(0, 10).map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-card border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${tx.type === 'earn' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <div>
                        <div className="text-sm font-medium">
                          {tx.meta?.reason || tx.type}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className={`font-semibold ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount} BC
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No transactions yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color }: { icon: React.ReactNode; title: string; value: string | number; color: string }) {
  return (
    <Card className="bg-[#0F172A] rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-wide text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
          <div className={`text-${color}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
