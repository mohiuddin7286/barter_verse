import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';

const Admin = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const result = await response.json();

      if (result.success) {
        setStats(result.data);
      } else {
        setMessage(`Error: ${result.message}`);
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading admin dashboard...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">👨‍💼 Admin Dashboard</h1>

      {message && (
        <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
          {message}
        </div>
      )}

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalUsers || 0}</p>
              </div>
              <Users className="text-blue-500" size={32} />
            </div>
          </div>

          {/* Total Listings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Listings</p>
                <p className="text-3xl font-bold text-green-600">{stats.totalListings || 0}</p>
              </div>
              <TrendingUp className="text-green-500" size={32} />
            </div>
          </div>

          {/* Active Trades */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Trades</p>
                <p className="text-3xl font-bold text-purple-600">{stats.activeTrades || 0}</p>
              </div>
              <CheckCircle className="text-purple-500" size={32} />
            </div>
          </div>

          {/* Total Coins Traded */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Coins</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.totalCoinsTraded || 0}</p>
              </div>
              <AlertCircle className="text-yellow-500" size={32} />
            </div>
          </div>
        </div>
      )}

      {/* Admin Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">⚙️ Admin Actions</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium">
            View All Users
          </button>
          <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium">
            Manage Listings
          </button>
          <button className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium">
            Review Trades
          </button>
          <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium">
            System Settings
          </button>
        </div>
      </div>

      {/* Info Message */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-gray-700">
          Admin panel features: User management, listing moderation, trade monitoring, and system configuration.
        </p>
      </div>
    </div>
  );
};

export default Admin;
