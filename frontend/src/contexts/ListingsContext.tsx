import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';
import { useAuth } from './AuthContext';

export interface Listing {
  id: string;
  title: string;
  category?: string;
  description?: string;
  status: 'ACTIVE' | 'TRADED' | 'ARCHIVED';
  ownerId: string;
  owner?: {
    id: string;
    email: string;
    display_name?: string;
    rating?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface ListingsContextType {
  listings: Listing[];
  wishlist: string[];
  isLoading: boolean;
  fetchListings: (page?: number, category?: string, search?: string) => Promise<void>;
  createListing: (data: any) => Promise<Listing | null>;
  updateListing: (id: string, data: any) => Promise<Listing | null>;
  deleteListing: (id: string) => Promise<boolean>;
  archiveListing: (id: string) => Promise<boolean>;
  toggleWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
}

const ListingsContext = createContext<ListingsContextType | undefined>(undefined);

export function ListingsProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const fetchListings = async (page = 1, category?: string, search?: string) => {
    try {
      setIsLoading(true);
      const response = await api.getListings(page, 10, category, search);
      // Handle both response structures: { success, data: { listings, pagination } } and { data: listings[] }
      const responseData = response.data;
      let listingsArray = [];
      
      if (responseData.data?.listings) {
        // Response structure: { data: { listings: [], pagination: {} } }
        listingsArray = responseData.data.listings;
      } else if (responseData.listings) {
        // Response structure: { listings: [], pagination: {} }
        listingsArray = responseData.listings;
      } else if (Array.isArray(responseData.data)) {
        // Response structure: { data: [] }
        listingsArray = responseData.data;
      } else if (Array.isArray(responseData)) {
        // Response structure: []
        listingsArray = responseData;
      }
      
      setListings(Array.isArray(listingsArray) ? listingsArray : []);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setListings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createListing = async (data: any): Promise<Listing | null> => {
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

  const updateListing = async (id: string, data: any): Promise<Listing | null> => {
    try {
      const response = await api.updateListing(id, data);
      const updatedListing = response.data.data;
      await fetchListings();
      return updatedListing;
    } catch (error) {
      console.error('Error updating listing:', error);
      return null;
    }
  };

  const deleteListing = async (id: string): Promise<boolean> => {
    try {
      await api.deleteListing(id);
      await fetchListings();
      return true;
    } catch (error) {
      console.error('Error deleting listing:', error);
      return false;
    }
  };

  const archiveListing = async (id: string): Promise<boolean> => {
    try {
      await api.archiveListing(id);
      await fetchListings();
      return true;
    } catch (error) {
      console.error('Error archiving listing:', error);
      return false;
    }
  };

  const toggleWishlist = (id: string) => {
    setWishlist(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const isInWishlist = (id: string) => wishlist.includes(id);

  useEffect(() => {
    fetchListings();
  }, []);

  // Poll for updates every 30 seconds instead of real-time subscription
  useEffect(() => {
    const interval = setInterval(() => {
      fetchListings();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <ListingsContext.Provider
      value={{
        listings,
        wishlist,
        isLoading,
        fetchListings,
        createListing,
        updateListing,
        deleteListing,
        archiveListing,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </ListingsContext.Provider>
  );
}

export function useListings() {
  const context = useContext(ListingsContext);
  if (!context) throw new Error('useListings must be used within ListingsProvider');
  return context;
}
