import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Admin = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      // Admin stats endpoint not yet implemented - show placeholder
      setStats({
        total_users: 0,
        total_listings: 0,
        total_trades: 0,
        total_coins_distributed: 0,
      });
      setMessage('Admin dashboard loaded (stats not yet implemented)');
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminAction = (action: 'users' | 'listings' | 'trades' | 'settings') => {
    const routes: Record<typeof action, string> = {
      users: '/community',
      listings: '/explore',
      trades: '/trade-center',
      settings: '/settings',
    };

    const labels: Record<typeof action, string> = {
      users: 'View All Users',
      listings: 'Manage Listings',
      trades: 'Review Trades',
      settings: 'System Settings',
    };

    toast.message(`${labels[action]} opening...`);
    navigate(routes[action]);
  };

  if (loading) {
    return <div className="p-6 text-center">Loading admin dashboard...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">👨‍💼 Admin Dashboard</h1>

      {message && (
        <div className="mb-6 p-4 rounded-lg" style={{ background: 'hsl(var(--section-background))', border: '1px solid hsl(var(--border))' }}>
          {message}
        </div>
      )}

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="card-upgrade p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Users</p>
                <p className="text-3xl font-bold text-primary">{stats.totalUsers || 0}</p>
              </div>
              <Users className="text-primary" size={32} />
            </div>
          </div>

          {/* Total Listings */}
          <div className="card-upgrade p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Listings</p>
                <p className="text-3xl font-bold text-secondary">{stats.totalListings || 0}</p>
              </div>
              <TrendingUp className="text-secondary" size={32} />
            </div>
          </div>

          {/* Active Trades */}
          <div className="card-upgrade p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Active Trades</p>
                <p className="text-3xl font-bold text-primary">{stats.activeTrades || 0}</p>
              </div>
              <CheckCircle className="text-primary" size={32} />
            </div>
          </div>

          {/* Total Coins Traded */}
          <div className="card-upgrade p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Coins</p>
                <p className="text-3xl font-bold" style={{ color: 'hsl(var(--gold-primary))' }}>{stats.totalCoinsTraded || 0}</p>
              </div>
              <AlertCircle className="text-[hsl(var(--gold-primary))]" size={32} />
            </div>
          </div>
        </div>
      )}

      {/* Admin Actions */}
      <div className="card-upgrade p-6">
        <h2 className="text-2xl font-bold mb-4">⚙️ Admin Actions</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="btn-primary px-6 py-3" onClick={() => handleAdminAction('users')}>
            View All Users
          </button>
          <button className="btn-secondary px-6 py-3" onClick={() => handleAdminAction('listings')}>
            Manage Listings
          </button>
          <button className="btn-primary px-6 py-3" onClick={() => handleAdminAction('trades')}>
            Review Trades
          </button>
          <button className="btn-secondary px-6 py-3" onClick={() => handleAdminAction('settings')}>
            System Settings
          </button>
        </div>
      </div>

      {/* Info Message */}
      <div className="mt-8 p-4" style={{ background: 'hsl(var(--section-background))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}>
        <p className="text-sm text-muted-foreground">
          Admin panel features: User management, listing moderation, trade monitoring, and system configuration.
        </p>
      </div>
    </div>
  );
};

export default Admin;
