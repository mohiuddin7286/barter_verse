import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCoins } from '@/contexts/CoinContext';
import { Coins, LogOut, AlertCircle, Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

export default function Settings() {
  const { balance, earnCoins, spendCoins } = useCoins();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const handleExportData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/privacy/export', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const result = await response.json();

      if (result.success) {
        const dataStr = JSON.stringify(result.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `barter_verse_data_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        toast.success('✅ Your data has been exported successfully!');
        setMessage('✅ Your data has been exported successfully!');
      } else {
        setMessage(`❌ Error: ${result.message}`);
        toast.error(`Error: ${result.message}`);
      }
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setMessage('❌ Please enter your password to confirm deletion');
      toast.error('Please enter your password to confirm deletion');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/privacy/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ password: deletePassword }),
      });
      const result = await response.json();

      if (result.success) {
        setMessage('✅ Account deleted successfully. You will be logged out in 3 seconds...');
        toast.success('Account deleted. Logging out...');
        setTimeout(() => {
          localStorage.removeItem('token');
          window.location.href = '/';
        }, 3000);
      } else {
        setMessage(`❌ Error: ${result.message}`);
        toast.error(`Error: ${result.message}`);
      }
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
      setDeletePassword('');
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const response = await fetch('/api/privacy/audit-logs?limit=20', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const result = await response.json();
      if (result.success) {
        setAuditLogs(result.data);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

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

          {/* Privacy & Data Protection */}
          <Card className="card-glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🔐</span> Privacy & Data Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {message && (
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-sm">
                  {message}
                </div>
              )}

              {/* Export Data Section */}
              <div className="space-y-3 p-4 rounded-lg border">
                <div className="flex items-start gap-3">
                  <Download className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">📥 Export Your Data (GDPR)</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Download a complete copy of your profile, listings, trades, and transaction history
                    </p>
                    <Button
                      onClick={handleExportData}
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {loading ? '⏳ Exporting...' : '📥 Export Data'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Audit Logs Section */}
              <div className="space-y-3">
                <h3 className="font-semibold">📋 Account Activity Log</h3>
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-2 text-left">Action</th>
                        <th className="px-4 py-2 text-left">Resource</th>
                        <th className="px-4 py-2 text-left">Status</th>
                        <th className="px-4 py-2 text-left">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.length > 0 ? (
                        auditLogs.map((log) => (
                          <tr key={log.userId + log.timestamp} className="border-t">
                            <td className="px-4 py-2">{log.action}</td>
                            <td className="px-4 py-2">{log.resource}</td>
                            <td className="px-4 py-2">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  log.status === 'success'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {log.status}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-muted-foreground">
                              {new Date(log.timestamp).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-2 text-center text-muted-foreground">
                            No activity logs yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Delete Account Section */}
              <div className="space-y-3 p-4 rounded-lg border border-red-200 bg-red-50">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-700 mb-1">
                      ⚠️ Delete Account (GDPR)
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Your account will be anonymized and all personal information will be removed. This action cannot be undone.
                    </p>

                    {!showDeleteConfirm ? (
                      <Button
                        onClick={() => setShowDeleteConfirm(true)}
                        variant="destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </Button>
                    ) : (
                      <div className="space-y-3 p-3 rounded-lg border border-red-300 bg-white">
                        <p className="text-sm font-semibold">Confirm account deletion by entering your password:</p>
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          value={deletePassword}
                          onChange={(e) => setDeletePassword(e.target.value)}
                        />
                        <div className="flex gap-3">
                          <Button
                            onClick={handleDeleteAccount}
                            disabled={loading}
                            variant="destructive"
                          >
                            {loading ? '⏳ Deleting...' : 'Confirm Deletion'}
                          </Button>
                          <Button
                            onClick={() => {
                              setShowDeleteConfirm(false);
                              setDeletePassword('');
                            }}
                            variant="outline"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Privacy Info */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm space-y-2">
                <p>
                  <strong>🔒 Data Protection:</strong> Your password is hashed using bcryptjs. Sensitive data is encrypted.
                </p>
                <p>
                  <strong>✅ GDPR Compliance:</strong> We support your right to access, export, and delete your data.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
