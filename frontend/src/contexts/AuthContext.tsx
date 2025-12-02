import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  display_name?: string;
  bio?: string;
  rating?: number;
  coins?: number;
  created_at?: string;
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

  // Initialize auth from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        api.setToken(storedToken);
      } catch (error) {
        console.error('Failed to restore auth from localStorage:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      }
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