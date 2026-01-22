import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Trash2 } from 'lucide-react';

const ChatSystem = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [startNewChat, setStartNewChat] = useState(false);
  const [newChatUserId, setNewChatUserId] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
    fetchUnreadCount();
    const interval = setInterval(() => {
      fetchUnreadCount();
      if (selectedConversation) {
        fetchMessages(selectedConversation);
      }
    }, 3000); // Poll every 3 seconds
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
        setMessage(`❌ ${result.message}`);
      }
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
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
        setMessage(`❌ ${result.message}`);
      }
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
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
          receiver_id: selectedConversation,
          content: newMessage,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setNewMessage('');
        fetchMessages(selectedConversation);
        fetchConversations();
      } else {
        setMessage(`❌ ${result.message}`);
      }
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStartNewChat = async () => {
    if (!newChatUserId.trim()) {
      setMessage('❌ Please enter a user ID');
      return;
    }

    setSelectedConversation(newChatUserId);
    setStartNewChat(false);
    setNewChatUserId('');
    await fetchMessages(newChatUserId);
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Delete this message?')) return;

    try {
      const response = await fetch(`/api/chat/${messageId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      const result = await response.json();

      if (result.success) {
        if (selectedConversation) {
          fetchMessages(selectedConversation);
        }
      } else {
        setMessage(`❌ ${result.message}`);
      }
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  const currentUser = localStorage.getItem('userId'); // Assume this is stored

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2 text-foreground">
        <MessageCircle /> Direct Messaging
        {unreadCount > 0 && (
          <span className="ml-2 bg-destructive text-white px-3 py-1 rounded-full text-sm font-medium">
            {unreadCount} Unread
          </span>
        )}
      </h1>

      {message && (
        <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <div className="card-upgrade rounded-lg overflow-hidden flex flex-col">
          <div className="p-4 border-b" style={{ background: 'hsl(var(--section-background))' }}>
            <h2 className="text-lg font-semibold mb-3 text-foreground">Conversations</h2>
            <button
              onClick={() => setStartNewChat(!startNewChat)}
              className="w-full btn-primary text-white py-2 rounded-lg text-sm font-medium"
            >
              {startNewChat ? '❌ Cancel' : '➕ New Chat'}
            </button>

            {startNewChat && (
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  placeholder="User ID"
                  value={newChatUserId}
                  onChange={(e) => setNewChatUserId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-[hsl(var(--border))] rounded-lg text-sm text-foreground bg-card"
                />
                <button
                  onClick={handleStartNewChat}
                  className="btn-secondary px-3 py-2 text-sm"
                >
                  ✓
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.length > 0 ? (
              conversations.map((conv) => (
                <div
                  key={conv.other_user_id}
                  onClick={() => setSelectedConversation(conv.other_user_id)}
                  className={`p-4 border-b cursor-pointer transition ${
                    selectedConversation === conv.other_user_id
                      ? 'bg-section-background border-l-4' + ' border-l-[hsl(var(--primary))]'
                      : 'hover:bg-section-background'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold">{conv.other_user_id}</p>
                      <p className="text-sm text-muted-foreground truncate">{conv.last_message || 'No messages'}</p>
                      {conv.last_message_at && (
                        <p className="text-xs text-muted-foreground mt-1">{new Date(conv.last_message_at).toLocaleDateString()}</p>
                      )}
                    </div>
                    {conv.unread_count > 0 && (
                      <span className="ml-2 bg-destructive text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                <p>No conversations yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="md:col-span-2 card-upgrade flex flex-col">
          {selectedConversation ? (
            <>
              {/* Header */}
              <div className="p-4 border-b" style={{ background: 'hsl(var(--section-background))' }}>
                <h3 className="text-lg font-semibold text-foreground">{selectedConversation}</h3>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length > 0 ? (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_id === currentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.sender_id === currentUser
                            ? 'bg-secondary text-white'
                            : 'bg-card text-foreground'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        {msg.sender_id === currentUser && (
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="mt-1 text-xs hover:underline text-muted-foreground"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 mt-8">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t" style={{ background: 'hsl(var(--section-background))' }}>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-[hsl(var(--border))] rounded-lg focus:outline-none bg-card text-foreground"
                  />
                  <button
                    type="submit"
                    disabled={loading || !newMessage.trim()}
                    className="btn-primary disabled:opacity-50 flex items-center gap-2 px-6"
                  >
                    <Send size={18} />
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>Select or start a conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatSystem;
