import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Activity, PieChart as PieIcon, ArrowUpRight, DollarSign, Clock } from 'lucide-react';

const tradeData = [
  { month: 'Jan', completed: 12, pending: 3 },
  { month: 'Feb', completed: 19, pending: 5 },
  { month: 'Mar', completed: 15, pending: 2 },
  { month: 'Apr', completed: 28, pending: 4 },
  { month: 'May', completed: 22, pending: 6 },
  { month: 'Jun', completed: 35, pending: 8 },
];

const categoryData = [
  { name: 'Skills', value: 35 },
  { name: 'Items', value: 45 },
  { name: 'Services', value: 20 },
];

const COLORS = ['#22c55e', '#f59e0b', '#3b82f6'];

export default function Analytics() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] -z-10" />

      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white tracking-tight">Analytics Dashboard</h1>
            <p className="text-slate-400">Real-time insights into your trading performance and market trends.</p>
          </div>
          <div className="flex gap-2">
             <div className="bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-lg text-sm text-slate-300">
                Last Updated: <span className="text-emerald-400 font-mono">Just now</span>
             </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <MetricCard 
              label="Total Trade Value" 
              value="2,450 BC" 
              trend="+12%" 
              icon={<DollarSign className="w-5 h-5 text-amber-400" />} 
              color="amber"
           />
           <MetricCard 
              label="Success Rate" 
              value="94.2%" 
              trend="+2.1%" 
              icon={<Activity className="w-5 h-5 text-emerald-400" />} 
              color="emerald"
           />
           <MetricCard 
              label="Avg Response Time" 
              value="1.5 Hrs" 
              trend="-15%" 
              icon={<Clock className="w-5 h-5 text-blue-400" />} 
              color="blue"
           />
           <MetricCard 
              label="Active Listings" 
              value="12" 
              trend="Stable" 
              icon={<TrendingUp className="w-5 h-5 text-purple-400" />} 
              color="purple"
           />
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-slate-900/80 border border-white/10 p-1 rounded-xl w-full max-w-md">
            <TabsTrigger value="overview" className="flex-1 rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Overview</TabsTrigger>
            <TabsTrigger value="categories" className="flex-1 rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Categories</TabsTrigger>
            <TabsTrigger value="growth" className="flex-1 rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Growth</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 animate-fade-in">
            <div className="grid lg:grid-cols-3 gap-6">
              
              {/* Main Chart */}
              <Card className="lg:col-span-2 glass border border-white/5 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-slate-100 flex items-center gap-2">
                     <TrendingUp className="w-5 h-5 text-emerald-400" /> Trade Volume
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={tradeData}>
                        <defs>
                          <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="month" stroke="#64748b" tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff' }}
                        />
                        <Area type="monotone" dataKey="completed" stroke="#22c55e" fillOpacity={1} fill="url(#colorCompleted)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Pie Chart */}
              <Card className="glass border border-white/5 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-slate-100 flex items-center gap-2">
                     <PieIcon className="w-5 h-5 text-blue-400" /> Portfolio Mix
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Center Legend Overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                       <span className="text-2xl font-bold text-white">100%</span>
                       <span className="text-xs text-slate-500">DISTRIBUTION</span>
                    </div>
                  </div>
                  <div className="flex justify-center gap-4 mt-4">
                     {categoryData.map((item, idx) => (
                        <div key={item.name} className="flex items-center gap-2 text-xs text-slate-300">
                           <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                           {item.name}
                        </div>
                     ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="categories">
             <div className="glass p-12 text-center border border-white/5 rounded-2xl">
                <p className="text-slate-500">Detailed category breakdown module coming in v2.0</p>
             </div>
          </TabsContent>
          
          <TabsContent value="growth">
             <div className="glass p-12 text-center border border-white/5 rounded-2xl">
                <p className="text-slate-500">Growth forecasting engine initializing...</p>
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function MetricCard({ label, value, trend, icon, color }: { label: string; value: string; trend: string; icon: React.ReactNode; color: string }) {
  const isPositive = trend.startsWith('+') || trend === 'Stable';
  
  return (
    <div className="glass p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
       <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-xl bg-${color}-500/10 border border-${color}-500/20`}>
             {icon}
          </div>
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
             {trend}
          </span>
       </div>
       <div className="space-y-1">
          <h3 className="text-slate-400 text-sm font-medium">{label}</h3>
          <p className="text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400 transition-all">
             {value}
          </p>
       </div>
    </div>
  );
}