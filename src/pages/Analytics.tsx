import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--destructive))'];

export default function Analytics() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-extrabold text-center tracking-tight leading-tight">Analytics</h1>
          <p className="text-base leading-relaxed tracking-wide text-muted-foreground text-center">
            Insights into your trading patterns and community trends
          </p>
        </div>

        <Tabs defaultValue="user" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="user">User Stats</TabsTrigger>
            <TabsTrigger value="trends">Trade Trends</TabsTrigger>
            <TabsTrigger value="coins">Coin Flow</TabsTrigger>
          </TabsList>

          <TabsContent value="user" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-[#0B1120] rounded-2xl p-6 shadow-lg border border-border hover:scale-[1.02] transition-transform duration-300">
                <CardHeader>
                  <CardTitle>Trade Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={tradeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="completed" fill="hsl(var(--primary))" name="Completed" />
                      <Bar dataKey="pending" fill="hsl(var(--accent))" name="Pending" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-[#0B1120] rounded-2xl p-6 shadow-lg border border-border hover:scale-[1.02] transition-transform duration-300">
                <CardHeader>
                  <CardTitle>Trade by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-[#0B1120] rounded-2xl p-6 shadow-lg border border-border hover:scale-[1.02] transition-transform duration-300">
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <MetricCard label="Avg. Trade Value" value="45 BC" />
                  <MetricCard label="Success Rate" value="94%" />
                  <MetricCard label="Response Time" value="2.4h" />
                  <MetricCard label="Rating" value="4.8⭐" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends">
            <Card className="bg-[#0B1120] rounded-2xl p-6 shadow-lg border border-border">
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">Detailed trend analysis coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coins">
            <Card className="bg-[#0B1120] rounded-2xl p-6 shadow-lg border border-border">
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">Coin flow visualization coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1 text-left">
      <div className="text-sm uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
