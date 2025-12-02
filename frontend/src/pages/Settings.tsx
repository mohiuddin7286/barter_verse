import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCoins } from '@/contexts/CoinContext';
import { Coins, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const { balance, earnCoins, spendCoins } = useCoins();

  const handleAddCoins = async () => {
    const success = await earnCoins(50, 'manual_add');
    if (success) {
      toast.success('Added 50 BC to your wallet!');
    }
  };

  const handleSpendCoins = async () => {
    const success = await spendCoins(25, 'manual_spend');
    if (success) {
      toast.success('Spent 25 BC successfully!');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Settings</h1>
          <p className="text-muted-foreground text-lg">
            Manage your profile and preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card className="card-glass">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input id="name" defaultValue="You" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="trader@barterverse.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" defaultValue="Delhi" />
              </div>
              <Button className="bg-primary hover:bg-primary/90">
                Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Coin Wallet */}
          <Card className="card-glass">
            <CardHeader>
              <CardTitle>Barter Coin Wallet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-6 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30">
                <div className="flex items-center gap-3">
                  <Coins className="w-8 h-8 text-accent" />
                  <div>
                    <div className="text-sm text-muted-foreground">Current Balance</div>
                    <div className="text-3xl font-bold text-accent">{balance} BC</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <Button onClick={handleAddCoins} className="flex-1 bg-primary hover:bg-primary/90">
                  Add 50 BC
                </Button>
                <Button onClick={handleSpendCoins} variant="outline" className="flex-1">
                  Spend 25 BC
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card className="card-glass">
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="destructive" className="w-full">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
