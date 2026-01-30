import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, AlertCircle, CheckCircle, Trash2, ShieldCheck, Repeat, Coins, History } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const Admin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [pendingTrades, setPendingTrades] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const [txnLoading, setTxnLoading] = useState(false);
  const [coinTargetUserId, setCoinTargetUserId] = useState<string>('');
  const [coinAmount, setCoinAmount] = useState<number>(0);
  const [coinReason, setCoinReason] = useState<string>('admin_adjustment');

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Scroll to section on hash change
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      }
    }
  }, [location.hash, loading]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, tradesRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getAdminTrades('PENDING'),
      ]);

      setStats(statsRes.data.data);
      setUsers(usersRes.data.data || []);
      setPendingTrades(tradesRes.data.data || []);
      if (!coinTargetUserId && usersRes.data.data?.length) {
        setCoinTargetUserId(usersRes.data.data[0].id);
      }
      setMessage('Admin dashboard loaded');
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      setTxnLoading(true);
      const res = await api.getAdminTransactions(20, 0);
      setTransactions(res.data.data || []);
    } catch (error: any) {
      toast.error(`Failed to load transactions: ${error.message}`);
    } finally {
      setTxnLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

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

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await api.updateUserRole(userId, role);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
      toast.success('Role updated');
    } catch (error: any) {
      toast.error(`Failed to update role: ${error.message}`);
    }
  };

  const handleCoinAdjust = async (mode: 'add' | 'deduct') => {
    if (!coinTargetUserId || !coinAmount) {
      toast.error('Select a user and amount');
      return;
    }
    try {
      setAdjusting(true);
      if (mode === 'add') {
        await api.addCoinsToUser(coinTargetUserId, coinAmount, coinReason);
      } else {
        await api.deductCoinsFromUser(coinTargetUserId, coinAmount, coinReason);
      }
      // Optimistically update user balance locally
      setUsers((prev) => prev.map((u) => u.id === coinTargetUserId ? { ...u, coins: (u.coins || 0) + (mode === 'add' ? coinAmount : -coinAmount) } : u));
      loadTransactions();
      toast.success(`Coins ${mode === 'add' ? 'added' : 'deducted'}`);
    } catch (error: any) {
      toast.error(`Failed to ${mode} coins: ${error.message}`);
    } finally {
      setAdjusting(false);
    }
  };

  const handleResolveTrade = async (tradeId: string, action: 'accept' | 'reject' | 'cancel' | 'complete') => {
    try {
      const actions: Record<typeof action, () => Promise<any>> = {
        accept: () => api.adminAcceptTrade(tradeId),
        reject: () => api.adminRejectTrade(tradeId, 'rejected by admin'),
        cancel: () => api.adminCancelTrade(tradeId, 'cancelled by admin'),
        complete: () => api.adminCompleteTrade(tradeId),
      };
      await actions[action]();
      setPendingTrades((prev) => prev.filter((t) => t.id !== tradeId));
      toast.success(`Trade ${action}ed`);
    } catch (error: any) {
      toast.error(`Failed to ${action} trade: ${error.message}`);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading admin dashboard...</div>;
  }

  if (user && user.role !== 'admin') {
    return <div className="p-6 text-center">Access denied. Admins only.</div>;
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

      {/* Users Table */}
      <div id="user-management" className="card-upgrade p-6 mb-8 scroll-mt-24">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2"><Users className="w-5 h-5" /> Users</h2>
          <span className="text-sm text-muted-foreground">{users.length} accounts</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-slate-800">
                <th className="py-2">Email</th>
                <th className="py-2">Username</th>
                <th className="py-2">Coins</th>
                <th className="py-2">Role</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.slice(0, 8).map((u) => (
                <tr key={u.id} className="border-b border-slate-900/60">
                  <td className="py-2">{u.email}</td>
                  <td className="py-2">{u.username}</td>
                  <td className="py-2">{u.coins}</td>
                  <td className="py-2">
                    <select
                      className="bg-slate-900 border border-slate-800 rounded px-2 py-1"
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="py-2 flex gap-2">
                    <button className="btn-secondary px-3 py-1 text-xs" onClick={() => handleAdminAction('users')}>Open</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Coin Adjustments */}
      <div id="coin-distribution" className="card-upgrade p-6 mb-8 scroll-mt-24">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2"><Coins className="w-5 h-5" /> Adjust Coins</h2>
          <span className="text-sm text-muted-foreground">Manual adjustments are logged</span>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">User</label>
            <select
              className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2"
              value={coinTargetUserId}
              onChange={(e) => setCoinTargetUserId(e.target.value)}
            >
              <option value="">Select user</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.email} ({u.username})</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Amount (BC)</label>
            <input
              type="number"
              className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2"
              value={coinAmount}
              onChange={(e) => setCoinAmount(Number(e.target.value))}
              min={1}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Reason</label>
            <input
              type="text"
              className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2"
              value={coinReason}
              onChange={(e) => setCoinReason(e.target.value)}
              placeholder="admin_adjustment"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button
            className="btn-primary px-4 py-2"
            onClick={() => handleCoinAdjust('add')}
            disabled={adjusting}
          >
            Add Coins
          </button>
          <button
            className="btn-secondary px-4 py-2"
            onClick={() => handleCoinAdjust('deduct')}
            disabled={adjusting}
          >
            Deduct Coins
          </button>
          {adjusting && <span className="text-sm text-muted-foreground">Processing...</span>}
        </div>
      </div>

      {/* Pending Trades */}
      <div id="trade-moderation" className="card-upgrade p-6 mb-8 scroll-mt-24">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2"><ShieldCheck className="w-5 h-5" /> Pending Trades</h2>
          <span className="text-sm text-muted-foreground">{pendingTrades.length} awaiting moderation</span>
        </div>
        {pendingTrades.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pending trades.</p>
        ) : (
          <div className="space-y-3">
            {pendingTrades.slice(0, 5).map((t) => (
              <div key={t.id} className="border border-slate-800 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{t.listing?.title || 'Listing'} </p>
                  <p className="text-xs text-muted-foreground">{t.initiator?.username} → {t.responder?.username}</p>
                </div>
                <div className="flex gap-2">
                  <button className="btn-primary px-3 py-1 text-xs" onClick={() => handleResolveTrade(t.id, 'accept')}>Accept</button>
                  <button className="btn-secondary px-3 py-1 text-xs" onClick={() => handleResolveTrade(t.id, 'reject')}>Reject</button>
                  <button className="btn-secondary px-3 py-1 text-xs" onClick={() => handleResolveTrade(t.id, 'cancel')}>Cancel</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div id="audit-logs" className="card-upgrade p-6 mb-8 scroll-mt-24">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2"><History className="w-5 h-5" /> Recent Coin Transactions</h2>
          <button className="btn-secondary px-3 py-1 text-xs" onClick={loadTransactions} disabled={txnLoading}>
            <Repeat className="w-4 h-4 mr-1 inline" /> Refresh
          </button>
        </div>
        {txnLoading ? (
          <p className="text-sm text-muted-foreground">Loading transactions...</p>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No transactions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-slate-800">
                  <th className="py-2">User</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Reason</th>
                  <th className="py-2">When</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-b border-slate-900/60">
                    <td className="py-2">{t.user?.email || t.user_id}</td>
                    <td className={`py-2 ${t.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{t.amount}</td>
                    <td className="py-2">{t.reason}</td>
                    <td className="py-2 text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
