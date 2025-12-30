import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, MessageCircle, User, Send, Trash2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  
  // Chat functionality
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [startNewChat, setStartNewChat] = useState(false);
  const [newChatUserId, setNewChatUserId] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleLike = (id: number) => {
    setLikedThreads(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Chat functions
  useEffect(() => {
    fetchConversations();
    fetchUnreadCount();
    const interval = setInterval(() => {
      fetchUnreadCount();
      if (selectedConversation) {
        fetchMessages(selectedConversation);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/chat/conversations', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const result = await response.json();

      if (result.success) {
        setConversations(result.data || []);
      } else {
        setChatMessage(`❌ ${result.message}`);
      }
    } catch (error: any) {
      setChatMessage(`❌ Error: ${error.message}`);
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      const response = await fetch(`/api/chat/conversation/${userId}?limit=50`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const result = await response.json();

      if (result.success) {
        setMessages(result.data.messages || []);
      } else {
        setChatMessage(`❌ ${result.message}`);
      }
    } catch (error: any) {
      setChatMessage(`❌ Error: ${error.message}`);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/chat/unread-count', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const result = await response.json();

      if (result.success) {
        setUnreadCount(result.data.unread_count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedConversation || !newMessage.trim()) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          recipient_id: selectedConversation,
          content: newMessage,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setNewMessage('');
        fetchMessages(selectedConversation);
      } else {
        setChatMessage(`❌ ${result.message}`);
      }
    } catch (error: any) {
      setChatMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStartNewChat = async () => {
    if (!newChatUserId.trim()) {
      setChatMessage('❌ Please enter a user ID');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/chat/start-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ user_id: newChatUserId }),
      });

      const result = await response.json();

      if (result.success) {
        setChatMessage('✅ Conversation started!');
        setNewChatUserId('');
        setStartNewChat(false);
        fetchConversations();
        setSelectedConversation(newChatUserId);
      } else {
        setChatMessage(`❌ ${result.message}`);
      }
    } catch (error: any) {
      setChatMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConversation = async (userId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/chat/conversation/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      const result = await response.json();

      if (result.success) {
        setChatMessage('✅ Conversation deleted!');
        setSelectedConversation(null);
        fetchConversations();
      } else {
        setChatMessage(`❌ ${result.message}`);
      }
    } catch (error: any) {
      setChatMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
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

          {/* Tabs */}
          <Tabs defaultValue="discussions" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="discussions">💬 Discussions</TabsTrigger>
              <TabsTrigger value="messages">
                📨 Messages {unreadCount > 0 && <span className="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">{unreadCount}</span>}
              </TabsTrigger>
            </TabsList>

            {/* Discussions Tab */}
            <TabsContent value="discussions" className="space-y-6">
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
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages" className="space-y-4">
              {chatMessage && (
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm">
                  {chatMessage}
                </div>
              )}

              {/* Start New Chat */}
              <div className="flex gap-2">
                <Button
                  onClick={() => setStartNewChat(!startNewChat)}
                  className="bg-primary hover:bg-primary/90"
                >
                  {startNewChat ? 'Cancel' : '+ New Chat'}
                </Button>
              </div>

              {startNewChat && (
                <div className="p-4 border rounded-lg bg-card space-y-3">
                  <div>
                    <label className="text-sm font-medium block mb-2">User ID</label>
                    <Input
                      value={newChatUserId}
                      onChange={(e) => setNewChatUserId(e.target.value)}
                      placeholder="Enter user ID to start chat"
                    />
                  </div>
                  <Button
                    onClick={handleStartNewChat}
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    {loading ? 'Starting...' : 'Start Conversation'}
                  </Button>
                </div>
              )}

              {/* Conversations List */}
              <div className="space-y-3">
                {conversations.length > 0 ? (
                  conversations.map((conv) => (
                    <div
                      key={conv.other_user_id}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedConversation === conv.other_user_id
                          ? 'bg-primary/20 border-primary'
                          : 'bg-card border-border hover:border-primary/50'
                      }`}
                      onClick={() => {
                        setSelectedConversation(conv.other_user_id);
                        fetchMessages(conv.other_user_id);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">User: {conv.other_user_id}</div>
                          <div className="text-sm text-muted-foreground truncate">{conv.last_message_preview}</div>
                        </div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteConversation(conv.other_user_id);
                          }}
                          variant="ghost"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No conversations yet</p>
                )}
              </div>

              {/* Chat Window */}
              {selectedConversation && (
                <Card className="bg-[#0B1120] rounded-2xl shadow-lg border border-border">
                  <CardHeader>
                    <CardTitle>Chat with {selectedConversation}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Messages */}
                    <div className="h-96 overflow-y-auto space-y-3 bg-card p-4 rounded-lg border border-border">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.is_from_me ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs p-3 rounded-lg ${
                              msg.is_from_me
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {new Date(msg.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        disabled={loading}
                      />
                      <Button
                        type="submit"
                        disabled={loading || !newMessage.trim()}
                        size="sm"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
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
