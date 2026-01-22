import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useCoins } from '@/contexts/CoinContext';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { 
  Coins, Package, ArrowLeftRight, TrendingUp, Calendar, 
  Clock, Trash2, Plus, Activity, Zap, ArrowUpRight, 
  Wallet, Bell, Search 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  status: string;
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
  const [chartData, setChartData] = useState<{ month: string; value: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  // Determine greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

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
      const tradesResponse = await api.getTrades();
      const tradesData = Array.isArray(tradesResponse.data.data) ? tradesResponse.data.data : [];

      const completedTrades = tradesData.filter((t: any) => t.status === 'COMPLETED').length || 0;

      // Mock Chart Data (Simulating Net Worth Growth)
      const mockChartData = [
        { month: 'Jan', value: 120 },
        { month: 'Feb', value: 132 },
        { month: 'Mar', value: 101 },
        { month: 'Apr', value: 134 },
        { month: 'May', value: 190 },
        { month: 'Jun', value: 230 },
        { month: 'Jul', value: balance || 245 }, 
      ];

      setStats({
        totalListings: listingsData.length || 0,
        activeListings: listingsData.filter((l: any) => l.status === 'ACTIVE').length || 0,
        completedTrades,
        totalCoins: balance,
      });
      setMyListings(listingsData);
      setChartData(mockChartData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] relative overflow-hidden">
      
      {/* Ambient Background */}
      <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in-up">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-medium text-sm">
               <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
               </span>
               Live Dashboard
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight">
              {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">{user?.display_name || 'Trader'}</span>
            </h1>
            <p className="text-slate-400">Here's what's happening in your barter portfolio today.</p>
          </div>

          <div className="flex gap-3">
             <Button variant="outline" className="border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-300 hover:text-white" onClick={() => navigate('/explore')}>
                <Search className="w-4 h-4 mr-2" /> Find Trades
             </Button>
             <Button className="btn-primary shadow-lg shadow-emerald-500/20" onClick={() => navigate('/post')}>
                <Plus className="w-4 h-4 mr-2" /> New Listing
             </Button>
          </div>
        </div>

        {/* Stats Grid - Staggered Animation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<Wallet className="w-6 h-6 text-amber-400" />}
            label="Total Balance"
            value={`${balance} BC`}
            trend="+12% this month"
            color="amber"
            delay="0ms"
          />
          <StatCard
            icon={<Package className="w-6 h-6 text-blue-400" />}
            label="Active Listings"
            value={stats.activeListings.toString()}
            trend="2 Pending Approval"
            color="blue"
            delay="100ms"
          />
          <StatCard
            icon={<ArrowLeftRight className="w-6 h-6 text-emerald-400" />}
            label="Completed Trades"
            value={stats.completedTrades.toString()}
            trend="100% Satisfaction"
            color="emerald"
            delay="200ms"
          />
          <StatCard
            icon={<Zap className="w-6 h-6 text-purple-400" />}
            label="Reputation Score"
            value="4.8/5.0"
            trend="Top 10% of Traders"
            color="purple"
            delay="300ms"
          />
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up [animation-delay:400ms] opacity-0" style={{ animationFillMode: 'forwards' }}>
          
          {/* Left Column: Charts & Listings */}
          <div className="lg:col-span-2 space-y-8">
             
             {/* Chart Card */}
             <div className="glass p-6 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                   <Activity className="w-24 h-24 text-white" />
                </div>
                
                <div className="flex items-center justify-between mb-8 relative z-10">
                   <div>
                      <h3 className="text-lg font-bold text-white">Portfolio Growth</h3>
                      <p className="text-sm text-slate-400">Net worth in Barter Coins over time</p>
                   </div>
                   <div className="flex gap-2">
                      <select className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-1.5 outline-none focus:border-emerald-500/50">
                         <option>Last 6 Months</option>
                         <option>This Year</option>
                      </select>
                   </div>
                </div>

                <div className="h-[300px] w-full relative z-10">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                         <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                               <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                            </linearGradient>
                         </defs>
                         <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                         <XAxis dataKey="month" stroke="#64748b" tickLine={false} axisLine={false} fontSize={12} />
                         <YAxis stroke="#64748b" tickLine={false} axisLine={false} fontSize={12} />
                         <Tooltip 
                            contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px', color: '#fff' }}
                            itemStyle={{ color: '#22c55e' }}
                         />
                         <Area type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>
             </div>

             {/* Listings Tabs */}
             <Tabs defaultValue="active" className="w-full">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="text-xl font-bold text-white">Your Inventory</h3>
                   <TabsList className="bg-slate-900/50 border border-slate-800 p-1 rounded-xl">
                      <TabsTrigger value="active" className="text-xs rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Active</TabsTrigger>
                      <TabsTrigger value="drafts" className="text-xs rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Drafts</TabsTrigger>
                   </TabsList>
                </div>

                <TabsContent value="active" className="space-y-4">
                   {isLoading ? (
                      <div className="text-center py-12 text-slate-500">Loading...</div>
                   ) : myListings.length > 0 ? (
                      myListings.slice(0, 3).map((listing) => (
                         <div key={listing.id} className="group glass p-4 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all flex items-center gap-4 cursor-pointer">
                            <div className="h-16 w-16 rounded-xl bg-slate-900 overflow-hidden flex-shrink-0">
                               <img src={listing.images?.[0] || 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=150'} alt={listing.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="flex-1 min-w-0">
                               <h4 className="font-bold text-slate-200 truncate group-hover:text-emerald-400 transition-colors">{listing.title}</h4>
                               <p className="text-xs text-slate-500">{listing.category} • Listed {new Date(listing.created_at).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                               <div className="font-bold text-amber-400 text-lg">{listing.price_bc} BC</div>
                               <div className="text-xs text-emerald-500 font-medium flex items-center justify-end gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active</div>
                            </div>
                         </div>
                      ))
                   ) : (
                      <div className="glass p-12 rounded-2xl border border-dashed border-slate-800 text-center">
                         <p className="text-slate-500 mb-4">No active listings found.</p>
                         <Button variant="outline" size="sm" onClick={() => navigate('/post')}>Create First Listing</Button>
                      </div>
                   )}
                </TabsContent>
             </Tabs>
          </div>

          {/* Right Column: Activity Feed */}
          <div className="space-y-6">
             <div className="glass p-6 rounded-3xl border border-white/5 h-full min-h-[500px] flex flex-col">
                <div className="flex items-center justify-between mb-6">
                   <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Bell className="w-5 h-5 text-blue-400" /> Recent Activity
                   </h3>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-6 relative">
                   {/* Timeline Line */}
                   <div className="absolute left-[19px] top-2 bottom-0 w-0.5 bg-slate-800 -z-10" />

                   {transactions.length > 0 ? (
                      transactions.slice(0, 8).map((tx, idx) => (
                         <div key={tx.id || idx} className="flex gap-4 group">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-4 border-[#020617] shadow-sm transition-colors ${
                               tx.type === 'earn' ? 'bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white' : 
                               'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-white'
                            }`}>
                               {tx.type === 'earn' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowLeftRight className="w-5 h-5" />}
                            </div>
                            <div className="pb-6 border-b border-white/5 w-full group-last:border-0 group-last:pb-0">
                               <div className="flex justify-between items-start">
                                  <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                                     {tx.meta?.reason || (tx.type === 'earn' ? 'Received Payment' : 'Sent Payment')}
                                  </p>
                                  <span className={`text-xs font-bold ${tx.amount > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                                     {tx.amount > 0 ? '+' : ''}{tx.amount} BC
                                  </span>
                               </div>
                               <p className="text-xs text-slate-500 mt-1">
                                  {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Wallet Transaction
                               </p>
                            </div>
                         </div>
                      ))
                   ) : (
                      <div className="text-center py-20 text-slate-500">
                         <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
                         <p>No recent activity recorded.</p>
                      </div>
                   )}
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, trend, color, delay }: { icon: React.ReactNode, label: string, value: string, trend: string, color: string, delay: string }) {
   return (
      <div 
         className={`glass p-6 rounded-3xl border border-white/5 hover:-translate-y-1 transition-all duration-300 group hover:border-${color}-500/30 animate-fade-in-up opacity-0`}
         style={{ animationDelay: delay, animationFillMode: 'forwards' }}
      >
         <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl bg-${color}-500/10 border border-${color}-500/20 group-hover:scale-110 transition-transform`}>
               {icon}
            </div>
            {trend && (
               <span className={`text-[10px] font-bold px-2 py-1 rounded-full bg-${color}-500/10 text-${color}-400 border border-${color}-500/10`}>
                  {trend}
               </span>
            )}
         </div>
         <div className="space-y-1">
            <p className="text-sm font-medium text-slate-400">{label}</p>
            <h3 className="text-3xl font-bold text-white tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400 transition-all">
               {value}
            </h3>
         </div>
      </div>
   );
}