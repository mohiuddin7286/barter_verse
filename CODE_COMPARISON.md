# 📊 Before & After Code Examples

## Overview
Visual comparison of code changes from Supabase to Express backend integration.

---

## 1. Authentication Context

### ❌ BEFORE (Supabase)
```typescript
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/` }
    });
    return { error };
  };

  // ...rest of code
};
```

### ✅ AFTER (Express + JWT)
```typescript
import { api } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  display_name?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      api.setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const response = await api.signup(email, password);
      const { token: newToken, user: newUser } = response.data.data;
      
      setToken(newToken);
      setUser(newUser);
      api.setToken(newToken);
      
      localStorage.setItem('auth_token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      navigate('/dashboard');
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.response?.data?.message } };
    }
  };

  // ...rest of code
};
```

**Key Changes:**
- ✨ Uses `api.signup()` instead of `supabase.auth.signUp()`
- ✨ JWT token stored in localStorage
- ✨ Manual session management instead of Supabase subscriptions
- ✨ `isAuthenticated` boolean added

---

## 2. Listings Context

### ❌ BEFORE (Supabase Direct Query + Real-time)
```typescript
import { supabase } from '@/integrations/supabase/client';

const ListingsProvider = ({ children }) => {
  const [listings, setListings] = useState<Listing[]>([]);

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          profiles:owner (
            display_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedListings: Listing[] = (data || []).map((listing: any) => ({
        id: listing.id,
        title: listing.title,
        owner: listing.owner,
        owner_name: listing.profiles?.display_name || 'User',
        price_bc: listing.price_bc,
        // ...
      }));

      setListings(formattedListings);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('listings-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'listings' },
        () => { fetchListings(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // ...
};
```

### ✅ AFTER (HTTP API + Polling)
```typescript
import { api } from '@/lib/api';

const ListingsProvider = ({ children }) => {
  const [listings, setListings] = useState<Listing[]>([]);

  const fetchListings = async (page = 1, category?: string) => {
    try {
      setIsLoading(true);
      const response = await api.getListings(page, 10, category);
      const data = response.data.data || [];
      setListings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setListings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createListing = async (data: any) => {
    try {
      const response = await api.createListing(data);
      const newListing = response.data.data;
      await fetchListings();
      return newListing;
    } catch (error) {
      console.error('Error creating listing:', error);
      return null;
    }
  };

  // Polling instead of real-time
  useEffect(() => {
    const interval = setInterval(() => {
      fetchListings();
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // ...
};
```

**Key Changes:**
- ✨ Uses `api.getListings()` instead of direct Supabase query
- ✨ Polling every 30 seconds instead of real-time subscriptions
- ✨ API handles response formatting
- ✨ `createListing()` method added to context

---

## 3. Coin Context

### ❌ BEFORE (Supabase + Edge Functions)
```typescript
const CoinProvider = ({ children }) => {
  const [balance, setBalance] = useState(0);
  const { user, session } = useAuth();

  const fetchBalance = async () => {
    if (!user || !session) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('coins')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setBalance(data?.coins || 0);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const earnCoins = async (amount: number, reason?: string) => {
    if (!user || !session) return false;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-coins/add`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ amount, reason }),
        }
      );

      if (!response.ok) throw new Error('Failed to add coins');
      const result = await response.json();
      setBalance(result.new_balance);
      return true;
    } catch (error) {
      console.error('Error earning coins:', error);
      return false;
    }
  };

  // Real-time subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('coin-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${user.id}`,
      }, (payload) => {
        if (payload.new && 'coins' in payload.new) {
          setBalance((payload.new as any).coins);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);
};
```

### ✅ AFTER (Backend API)
```typescript
const CoinProvider = ({ children }) => {
  const [balance, setBalance] = useState(0);
  const { user } = useAuth();

  const fetchBalance = async () => {
    if (!user) {
      setBalance(0);
      return;
    }

    try {
      const response = await api.getBalance(user.id);
      setBalance(response.data.data?.balance || 0);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance(0);
    }
  };

  const addCoins = async (amount: number, reason?: string) => {
    if (!user) return false;

    try {
      const response = await api.addCoins(user.id, amount, reason);
      setBalance(response.data.data?.new_balance || 0);
      await fetchTransactions();
      return true;
    } catch (error: any) {
      console.error('Error adding coins:', error);
      toast.error(error.response?.data?.message || 'Failed to add coins');
      return false;
    }
  };

  const transferCoins = async (toUserId: string, amount: number) => {
    if (!user) return false;

    try {
      const response = await api.transferCoins(user.id, toUserId, amount);
      setBalance(response.data.data?.new_balance || 0);
      return true;
    } catch (error: any) {
      console.error('Error transferring coins:', error);
      return false;
    }
  };

  // Polling
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchBalance();
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);
};
```

**Key Changes:**
- ✨ Uses `api.getBalance()`, `api.addCoins()`, `api.transferCoins()`
- ✨ No manual fetch() calls - all handled by API client
- ✨ Backend returns `new_balance` - cleaner response
- ✨ Polling instead of real-time subscriptions
- ✨ New `transferCoins()` method added

---

## 4. Trade Context

### ❌ BEFORE (Supabase Edge Functions)
```typescript
const TradeProvider = ({ children }) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const { user, session } = useAuth();

  const fetchTrades = async () => {
    if (!user || !session) {
      setTrades([]);
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-trades`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch trades');
      const result = await response.json();
      
      const processedTrades = (result.data || []).map((trade: any) => ({
        ...trade,
        direction: trade.receiver === user.id ? 'incoming' : 'outgoing',
      }));
      
      setTrades(processedTrades);
    } catch (error) {
      console.error('Error fetching trades:', error);
    }
  };

  const acceptTrade = async (id: string) => {
    if (!session) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-trades/${id}/accept`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to accept trade');
      await fetchTrades();
    } catch (error) {
      console.error('Error accepting trade:', error);
    }
  };
};
```

### ✅ AFTER (HTTP API Client)
```typescript
const TradeProvider = ({ children }) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const { user } = useAuth();

  const fetchTrades = async () => {
    if (!user) {
      setTrades([]);
      return;
    }

    try {
      const response = await api.getTrades(user.id);
      const data = response.data.data || [];

      const processedTrades = (Array.isArray(data) ? data : []).map((trade: any) => ({
        ...trade,
        direction: trade.responderUserId === user.id ? 'incoming' : 'outgoing',
      }));

      setTrades(processedTrades);
    } catch (error) {
      console.error('Error fetching trades:', error);
      setTrades([]);
    }
  };

  const createTrade = async (data: any) => {
    if (!user) return false;

    try {
      await api.createTrade({ ...data, initiatorId: user.id });
      await fetchTrades();
      toast.success('Trade created!');
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create trade');
      return false;
    }
  };

  const confirmTrade = async (id: string, action: 'accept' | 'reject') => {
    if (!user) return false;

    try {
      await api.confirmTrade(id, action);
      await fetchTrades();
      toast.success(`Trade ${action}ed!`);
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${action} trade`);
      return false;
    }
  };

  const completeTrade = async (id: string) => {
    if (!user) return false;

    try {
      await api.completeTrade(id);
      await fetchTrades();
      toast.success('Trade completed!');
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to complete trade');
      return false;
    }
  };
};
```

**Key Changes:**
- ✨ Uses `api.getTrades()`, `api.createTrade()`, `api.confirmTrade()`, `api.completeTrade()`
- ✨ No manual Authorization header management
- ✨ Better error handling with toast notifications
- ✨ Cleaner API method calls
- ✨ Boolean return values for each action

---

## 5. API Calls in Pages

### ❌ BEFORE (PostListing.tsx - Supabase)
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  if (!user || !session) {
    toast.error('Please login');
    navigate('/auth');
    return;
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-listings`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
          location: formData.location,
          price_bc: priceBC,
          description: formData.description,
          images: formData.image ? [formData.image] : [],
          available_today: true,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed');
    }

    await spendCoins(LISTING_COST, 'listing_posted');
    toast.success('Listing posted!');
    navigate('/explore');
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Failed to post');
  }
};
```

### ✅ AFTER (PostListing.tsx - Express)
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  if (!isAuthenticated || !user) {
    toast.error('Please login');
    navigate('/auth');
    return;
  }

  try {
    await api.createListing({
      title: formData.title,
      category: formData.category,
      description: formData.description,
      ownerId: user.id,
      status: 'ACTIVE',
    });

    await spendCoins(10, 'listing_posted');
    toast.success('Listing posted!');
    await fetchListings();
    navigate('/explore');
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Failed to post');
  }
};
```

**Key Changes:**
- ✨ Uses `api.createListing()` instead of fetch()
- ✨ No manual Authorization header
- ✨ Cleaner error handling
- ✨ Uses `isAuthenticated` boolean
- ✨ Simpler request payload

---

## 6. API Client Creation (NEW)

### ✅ NEW FILE: src/lib/api.ts
```typescript
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Auto-add Authorization header
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });
  }

  setToken(token: string | null) {
    this.token = token;
  }

  // Auth
  async signup(email: string, password: string) {
    return this.client.post('/auth/signup', { email, password });
  }

  async signin(email: string, password: string) {
    return this.client.post('/auth/signin', { email, password });
  }

  // Listings
  async getListings(page = 1, limit = 10, category?: string) {
    return this.client.get('/listings', { params: { page, limit, category } });
  }

  async createListing(data: any) {
    return this.client.post('/listings', data);
  }

  // Coins
  async getBalance(userId: string) {
    return this.client.get(`/coins/balance/${userId}`);
  }

  async addCoins(userId: string, amount: number) {
    return this.client.post('/coins/add', { userId, amount });
  }

  // Trades
  async getTrades(userId: string) {
    return this.client.get(`/trades/${userId}`);
  }

  async createTrade(data: any) {
    return this.client.post('/trades', data);
  }

  // ... more methods
}

export const api = new ApiClient();
```

---

## Summary of Changes

| Aspect | Before | After |
|--------|--------|-------|
| **Library** | @supabase/supabase-js | axios |
| **Auth** | Supabase Auth service | JWT tokens |
| **Real-time** | Subscriptions | Polling (30s) |
| **Token Store** | Supabase managed | localStorage |
| **API Calls** | Direct fetch() | api client |
| **Error Handling** | Try/catch | Axios interceptors |
| **Headers** | Manual per request | Auto-added by client |
| **Response Format** | Supabase specific | Backend response.data.data |
| **Status Codes** | Implicit | Explicit (201, 200, 404, 500) |

---

## Result

✨ **Code is cleaner, more maintainable, and fully under your control**

No more Supabase dependency - complete frontend independence!

