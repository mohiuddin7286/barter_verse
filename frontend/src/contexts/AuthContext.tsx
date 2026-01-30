import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  rating?: number;
  coins?: number;
  created_at?: string;
  role?: string;
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const initializeRef = useRef(false);

  // Initialize auth from localStorage - do this synchronously
  if (!initializeRef.current) {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');
    
    console.log('🔐 AuthContext init - storedToken:', storedToken ? `${storedToken.substring(0, 20)}...` : 'null');
    console.log('👤 AuthContext init - storedUser:', storedUser ? 'exists' : 'null');
    
    if (storedToken && storedUser) {
      try {
        // Set token on api client IMMEDIATELY
        api.setToken(storedToken);
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        console.log('✅ Auth restored from localStorage');
      } catch (error) {
        console.error('❌ Failed to restore auth from localStorage:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        api.setToken(null);
      }
    } else {
      // No stored auth, clear api token
      api.setToken(null);
      console.log('❌ No stored auth in localStorage');
    }
    
    initializeRef.current = true;
    setLoading(false);
  }

  const signUp = async (email: string, password: string) => {
    try {
      const response = await api.signup(email, password);
      const { token: newToken, user: newUser } = response.data.data;
      
      setToken(newToken);
      setUser(newUser);
      api.setToken(newToken);
      
      // Store in localStorage
      localStorage.setItem('auth_token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      navigate('/dashboard');
      return { error: null };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Sign up failed';
      return { error: { message: errorMessage } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await api.signin(email, password);
      const { token: newToken, user: newUser } = response.data.data;
      
      setToken(newToken);
      setUser(newUser);
      api.setToken(newToken);
      
      // Store in localStorage
      localStorage.setItem('auth_token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      navigate('/dashboard');
      return { error: null };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Sign in failed';
      return { error: { message: errorMessage } };
    }
  };

  const signOut = async () => {
    try {
      await api.logout();
      setToken(null);
      setUser(null);
      api.setToken(null);
      
      // Clear localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      
      navigate('/auth');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        signUp,
        signIn,
        signOut,
        loading,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}