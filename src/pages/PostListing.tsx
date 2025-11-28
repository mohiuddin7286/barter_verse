import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useListings } from '@/contexts/ListingsContext';
import { useCoins } from '@/contexts/CoinContext';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function PostListing() {
  const navigate = useNavigate();
  const { fetchListings } = useListings();
  const { balance, spendCoins } = useCoins();
  const { user, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    location: '',
    coins: '',
    description: '',
    image: '',
  });

  const LISTING_COST = 10; // Cost to post a listing

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      toast.error('Please login to post a listing');
      navigate('/auth');
      return;
    }

    if (!formData.title || !formData.category || !formData.coins) {
      toast.error('Please fill in all required fields');
      return;
    }

    const coins = parseInt(formData.coins);
    if (isNaN(coins) || coins < 1) {
      toast.error('Please enter a valid coin value (minimum 1 BC)');
      return;
    }

    const LISTING_COST = 10; // Cost to post a listing
    if (balance < LISTING_COST) {
      toast.error(`Insufficient coins! You need ${LISTING_COST} BC to post a listing.`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Create listing via backend API
      await api.createListing({
        title: formData.title,
        category: formData.category,
        description: formData.description,
        ownerId: user.id,
        status: 'ACTIVE',
      });

      // Deduct coins for posting
      await spendCoins(LISTING_COST, 'listing_posted');

      toast.success(`Listing posted successfully! ${LISTING_COST} BC deducted.`);
      await fetchListings();
      navigate('/explore');
    } catch (error) {
      console.error('Error posting listing:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to post listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-extrabold text-center tracking-tight leading-tight">Post a Listing</h1>
          <p className="text-base leading-relaxed tracking-wide text-muted-foreground text-center">
            Share what you want to trade with the community
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-[#0F172A] rounded-2xl shadow-lg p-8 border border-border">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title" className="text-sm uppercase tracking-wide">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Guitar Lessons, Vintage Bicycle"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-[#0B1120] border border-border rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="category" className="text-sm uppercase tracking-wide">Category *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger className="bg-[#0B1120] border border-border rounded-xl p-3">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Skills">Skills</SelectItem>
                <SelectItem value="Items">Items</SelectItem>
                <SelectItem value="Services">Services</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="location" className="text-sm uppercase tracking-wide">Location *</Label>
            <Input
              id="location"
              placeholder="City name"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="bg-[#0B1120] border border-border rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="coins" className="text-sm uppercase tracking-wide">Barter Coins Value *</Label>
            <Input
              id="coins"
              type="number"
              placeholder="e.g., 30"
              value={formData.coins}
              onChange={(e) => setFormData({ ...formData, coins: e.target.value })}
              className="bg-[#0B1120] border border-border rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description" className="text-sm uppercase tracking-wide">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your listing in detail..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="bg-[#0B1120] border border-border rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="image" className="text-sm uppercase tracking-wide">Image URL (Optional)</Label>
            <Input
              id="image"
              placeholder="https://example.com/image.jpg"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="bg-[#0B1120] border border-border rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <Button 
              type="submit" 
              size="lg" 
              variant="gradient" 
              className="w-full glow-effect"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                `Post Listing (10 BC)`
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Posting a listing costs 10 BC. Your current balance: {balance} BC
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
