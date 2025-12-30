import React, { useState, useEffect } from 'react';
import { AlertCircle, Download, Trash2, LogOut } from 'lucide-react';

const PrivacySettings = () => {
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
        // Create downloadable JSON file
        const dataStr = JSON.stringify(result.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `barter_verse_data_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        setMessage('✅ Your data has been exported successfully!');
      } else {
        setMessage(`❌ Error: ${result.message}`);
      }
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setMessage('❌ Please enter your password to confirm deletion');
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
        setMessage(
          '✅ Account deleted successfully. You will be logged out in 3 seconds...'
        );
        setTimeout(() => {
          localStorage.removeItem('token');
          window.location.href = '/';
        }, 3000);
      } else {
        setMessage(`❌ Error: ${result.message}`);
      }
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">🔐 Privacy & Data Protection</h1>

      {message && (
        <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
          {message}
        </div>
      )}

      {/* Data Export Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start gap-4">
          <Download className="text-blue-500 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-2">📥 Export Your Data (GDPR)</h2>
            <p className="text-gray-600 mb-4">
              Download a complete copy of your profile, listings, trades, and transaction history
              in JSON format.
            </p>
            <button
              onClick={handleExportData}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium"
            >
              {loading ? '⏳ Exporting...' : '📥 Export Data'}
            </button>
          </div>
        </div>
      </div>

      {/* Audit Logs Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">📋 Account Activity Log</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Action</th>
                <th className="px-4 py-2 text-left">Resource</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
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
                  <td className="px-4 py-2 text-gray-500">
                    {new Date(log.timestamp).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Account Section */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="text-red-500 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-2 text-red-700">
              ⚠️ Delete Account (GDPR Right to be Forgotten)
            </h2>
            <p className="text-gray-600 mb-4">
              Your account will be anonymized and all personal information will be removed. This
              action cannot be undone.
            </p>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium"
              >
                <Trash2 className="inline mr-2" size={18} />
                Delete Account
              </button>
            ) : (
              <div className="bg-white p-4 rounded-lg border border-red-300">
                <p className="mb-3 font-semibold">Confirm account deletion by entering your password:</p>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={loading}
                    className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium"
                  >
                    {loading ? '⏳ Deleting...' : 'Confirm Deletion'}
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeletePassword('');
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Privacy Info */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-700">
        <p className="mb-2">
          <strong>🔒 Data Protection:</strong> Your password is hashed using bcryptjs. Sensitive
          data is encrypted with AES-256-GCM encryption.
        </p>
        <p>
          <strong>✅ GDPR Compliance:</strong> We support your right to access, export, and delete
          your data at any time.
        </p>
      </div>
    </div>
  );
};

export default PrivacySettings;
