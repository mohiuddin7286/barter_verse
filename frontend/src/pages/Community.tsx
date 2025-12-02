import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, User } from 'lucide-react';
import { useState } from 'react';

const threads = [
  {
    id: 1,
    user: 'Ammar',
    title: 'Best practices for successful trades',
    content: 'After completing 50+ trades, here are my top tips for smooth exchanges...',
    likes: 24,
    comments: 8,
    timeAgo: '2h ago',
  },
  {
    id: 2,
    user: 'Priya',
    title: 'Looking for graphic design tools',
    content: 'Does anyone have Adobe CC or Figma resources they\'d like to trade?',
    likes: 12,
    comments: 5,
    timeAgo: '4h ago',
  },
  {
    id: 3,
    user: 'Rahul',
    title: 'Success story: Traded my way to a home office',
    content: 'Started with a simple keyboard trade, now I have a complete setup!',
    likes: 45,
    comments: 15,
    timeAgo: '1d ago',
  },
];

const topTraders = [
  { name: 'Siddu', trades: 127, coins: 5420 },
  { name: 'Ammar', trades: 95, coins: 4230 },
  { name: 'Priya', trades: 82, coins: 3890 },
];

export default function Community() {
  const [likedThreads, setLikedThreads] = useState<number[]>([]);

  const toggleLike = (id: number) => {
    setLikedThreads(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-extrabold text-center lg:text-left tracking-tight leading-tight">Community</h1>
            <p className="text-base leading-relaxed tracking-wide text-muted-foreground text-center lg:text-left">
              Connect with fellow traders and share your experiences
            </p>
          </div>

          {threads.map(thread => (
            <Card key={thread.id} className="bg-[#0F172A] rounded-2xl shadow-lg border border-border">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 bg-primary/20">
                    <User className="w-6 h-6 text-primary" />
                  </Avatar>
                  <div>
                    <div className="font-semibold">{thread.user}</div>
                    <div className="text-sm text-muted-foreground">{thread.timeAgo}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{thread.title}</h3>
                  <p className="text-muted-foreground">{thread.content}</p>
                </div>

                <div className="flex items-center gap-6 pt-4 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLike(thread.id)}
                    className="gap-2"
                  >
                    <Heart
                      className={`w-5 h-5 ${likedThreads.includes(thread.id) ? 'fill-destructive text-destructive' : ''}`}
                    />
                    <span>{thread.likes + (likedThreads.includes(thread.id) ? 1 : 0)}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <MessageCircle className="w-5 h-5" />
                    <span>{thread.comments}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="bg-[#0F172A] rounded-2xl shadow-lg border border-border">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-xl font-semibold">Top Traders</h3>
              {topTraders.map((trader, index) => (
                <div
                  key={trader.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-card border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold">{trader.name}</div>
                      <div className="text-sm text-muted-foreground">{trader.trades} trades</div>
                    </div>
                  </div>
                  <div className="text-accent font-semibold">{trader.coins} BC</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-[#0F172A] rounded-2xl shadow-lg border border-border">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-xl font-semibold">Recent Topics</h3>
              <div className="space-y-3">
                {['Barter Tips', 'Success Stories', 'New Categories', 'Trading Safety'].map(topic => (
                  <Button key={topic} variant="ghost" className="w-full justify-start">
                    {topic}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
