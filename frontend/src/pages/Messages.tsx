import { useState, useEffect, useRef } from 'react';
import { Search, Send, MoreVertical, Phone, Video, Image as ImageIcon, Paperclip, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Load Conversations List
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const res = await api.getConversations();
      // Ensure we extract data correctly from response
      const data = res.data.data || res.data; 
      setConversations(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error("Error loading chats:", error);
      setLoading(false);
    }
  };

  // 2. Load Messages when a chat is selected
  useEffect(() => {
    if (selectedChat) {
        api.getMessages(selectedChat.otherUser.id).then(res => {
            const data = res.data.data || res.data;
            setMessages(Array.isArray(data) ? data : []);
            scrollToBottom();
        });
    }
  }, [selectedChat]);

  const scrollToBottom = () => {
    setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  // 3. Send Message
  const handleSend = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    
    const tempMsg = {
      id: Date.now().toString(),
      sender_id: user?.id,
      content: newMessage,
      created_at: new Date().toISOString()
    };

    // Optimistic UI Update
    setMessages([...messages, tempMsg]);
    setNewMessage("");
    scrollToBottom();

    try {
      await api.sendMessage(selectedChat.otherUser.id, tempMsg.content);
      loadConversations(); // Update "Last message" in sidebar
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-[#020617] flex overflow-hidden">
      
      {/* Sidebar - Chat List */}
      <div className="w-80 border-r border-white/5 bg-slate-950/50 flex flex-col">
        <div className="p-4 border-b border-white/5">
          <h2 className="text-xl font-bold text-white mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input 
              placeholder="Search chats..." 
              className="pl-9 bg-slate-900 border-slate-800 text-white focus:ring-emerald-500/20" 
            />
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {loading ? (
                <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-emerald-500"/></div>
            ) : conversations.length === 0 ? (
                <div className="text-center text-slate-500 p-4 text-sm">No conversations yet.</div>
            ) : (
                conversations.map(chat => (
                <button
                    key={chat.id}
                    onClick={() => setSelectedChat(chat)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    selectedChat?.id === chat.id 
                        ? 'bg-emerald-500/10 border border-emerald-500/20' 
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                >
                    <Avatar>
                    <AvatarImage src={chat.otherUser?.avatar_url} />
                    <AvatarFallback className="bg-slate-800 text-slate-300">
                        {chat.otherUser?.username?.[0]?.toUpperCase()}
                    </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 text-left overflow-hidden">
                    <div className="flex justify-between items-center mb-0.5">
                        <span className={`font-medium ${selectedChat?.id === chat.id ? 'text-emerald-400' : 'text-slate-200'}`}>
                        {chat.otherUser?.username || "Unknown"}
                        </span>
                        <span className="text-[10px] text-slate-500">
                            {new Date(chat.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{chat.lastMessage}</p>
                    </div>
                </button>
                ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[url('/bg-pattern.svg')] bg-opacity-5">
        {selectedChat ? (
            <>
                {/* Chat Header */}
                <div className="h-16 border-b border-white/5 bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                    <Avatar>
                    <AvatarImage src={selectedChat.otherUser?.avatar_url} />
                    <AvatarFallback className="bg-emerald-900 text-emerald-200">
                        {selectedChat.otherUser?.username?.[0]}
                    </AvatarFallback>
                    </Avatar>
                    <div>
                    <h3 className="font-bold text-white">{selectedChat.otherUser?.username}</h3>
                    <p className="text-xs text-emerald-400 flex items-center gap-1">Online</p>
                    </div>
                </div>
                </div>

                {/* Messages Feed */}
                <ScrollArea className="flex-1 p-6">
                <div className="space-y-4">
                    {messages.map((msg, idx) => (
                    <div 
                        key={idx} 
                        className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[70%] rounded-2xl p-3 px-4 ${
                        msg.sender_id === user?.id 
                            ? 'bg-emerald-600 text-white rounded-tr-none' 
                            : 'bg-slate-800 text-slate-200 rounded-tl-none'
                        }`}>
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-[10px] mt-1 text-right ${msg.sender_id === user?.id ? 'text-emerald-200' : 'text-slate-500'}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                        </div>
                    </div>
                    ))}
                    <div ref={scrollRef} />
                </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="p-4 bg-slate-950 border-t border-white/5">
                <div className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-xl border border-white/5">
                    <Input 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type a message..." 
                    className="flex-1 bg-transparent border-none focus-visible:ring-0 text-white placeholder:text-slate-500"
                    />
                    <Button onClick={handleSend} disabled={!newMessage.trim()} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg w-10 h-10 p-0">
                    <Send className="w-5 h-5" />
                    </Button>
                </div>
                </div>
            </>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                <div className="bg-slate-900 p-6 rounded-full mb-4">
                    <Search className="w-10 h-10 text-slate-600" />
                </div>
                <p>Select a conversation to start chatting</p>
            </div>
        )}
      </div>
    </div>
  );
}