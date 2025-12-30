import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Link as LinkIcon, Trash2 } from 'lucide-react';

const SessionScheduling = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'provider' | 'participant'>('all');

  const [formData, setFormData] = useState({
    participant_id: '',
    skill_title: '',
    description: '',
    scheduled_at: '',
    duration_minutes: 60,
    location: '',
    meeting_link: '',
  });

  const [statusUpdate, setStatusUpdate] = useState<{
    sessionId: string;
    status: string;
    feedback?: string;
    rating?: number;
  } | null>(null);

  useEffect(() => {
    fetchSessions();
  }, [activeTab]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const roleParam = activeTab === 'all' ? '' : `&role=${activeTab}`;
      const response = await fetch(`/api/sessions/my-sessions?${roleParam}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const result = await response.json();

      if (result.success) {
        setSessions(result.data || []);
      } else {
        setMessage(`❌ ${result.message}`);
      }
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.participant_id || !formData.skill_title || !formData.scheduled_at) {
      setMessage('❌ Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/sessions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setMessage('✅ Session created successfully!');
        setShowCreateForm(false);
        setFormData({
          participant_id: '',
          skill_title: '',
          description: '',
          scheduled_at: '',
          duration_minutes: 60,
          location: '',
          meeting_link: '',
        });
        fetchSessions();
      } else {
        setMessage(`❌ ${result.message}`);
      }
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (sessionId: string, newStatus: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/sessions/${sessionId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          status: newStatus,
          feedback: statusUpdate?.feedback,
          rating: statusUpdate?.rating,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage('✅ Session status updated!');
        setStatusUpdate(null);
        fetchSessions();
      } else {
        setMessage(`❌ ${result.message}`);
      }
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to cancel this session?')) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      const result = await response.json();

      if (result.success) {
        setMessage('✅ Session cancelled successfully!');
        fetchSessions();
      } else {
        setMessage(`❌ ${result.message}`);
      }
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">📅 Skill Session Scheduling</h1>

      {message && (
        <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        {['all', 'provider', 'participant'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 font-medium capitalize ${
              activeTab === tab
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab === 'all' ? '📅 All Sessions' : tab === 'provider' ? '👨‍🏫 As Provider' : '👨‍🎓 As Participant'}
          </button>
        ))}
      </div>

      {/* Create Button */}
      <button
        onClick={() => setShowCreateForm(!showCreateForm)}
        className="mb-6 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium"
      >
        {showCreateForm ? '❌ Cancel' : '➕ New Session'}
      </button>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create New Session</h2>

          <form onSubmit={handleCreateSession} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Participant User ID"
              value={formData.participant_id}
              onChange={(e) => setFormData({ ...formData, participant_id: e.target.value })}
              required
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />

            <input
              type="text"
              placeholder="Skill Title (e.g., Photography Basics)"
              value={formData.skill_title}
              onChange={(e) => setFormData({ ...formData, skill_title: e.target.value })}
              required
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />

            <textarea
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg col-span-1 md:col-span-2"
              rows={2}
            />

            <input
              type="datetime-local"
              value={formData.scheduled_at}
              onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
              required
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />

            <input
              type="number"
              placeholder="Duration (minutes)"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
              min="30"
              max="480"
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />

            <input
              type="text"
              placeholder="Location (optional)"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />

            <input
              type="url"
              placeholder="Meeting Link (optional)"
              value={formData.meeting_link}
              onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />

            <button
              type="submit"
              disabled={loading}
              className="col-span-1 md:col-span-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-2 rounded-lg font-medium"
            >
              {loading ? '⏳ Creating...' : '✅ Create Session'}
            </button>
          </form>
        </div>
      )}

      {/* Sessions List */}
      {sessions.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {sessions.map((session) => (
            <div key={session.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{session.skill_title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{session.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(session.status)}`}>
                  {session.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-blue-500" />
                  <span>{new Date(session.scheduled_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-blue-500" />
                  <span>{new Date(session.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({session.duration_minutes} min)</span>
                </div>
                {session.location && (
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-red-500" />
                    <span>{session.location}</span>
                  </div>
                )}
                {session.meeting_link && (
                  <a
                    href={session.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-500 hover:underline"
                  >
                    <LinkIcon size={18} />
                    <span>Meeting Link</span>
                  </a>
                )}
              </div>

              <div className="border-t pt-4 mt-4">
                <p className="text-sm text-gray-600">
                  👨‍🏫 Provider: <span className="font-medium">{session.provider.username}</span>
                  {' '} • 👨‍🎓 Participant: <span className="font-medium">{session.participant.username}</span>
                </p>
              </div>

              {/* Status Update Section */}
              {session.status === 'COMPLETED' && !session.rating && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <label className="block text-sm font-medium mb-2">Rate this session (1-5 stars)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.5"
                    placeholder="Rating"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                    onChange={(e) =>
                      setStatusUpdate({
                        sessionId: session.id,
                        status: 'COMPLETED',
                        rating: parseFloat(e.target.value),
                      })
                    }
                  />
                  <textarea
                    placeholder="Feedback (optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                    onChange={(e) =>
                      setStatusUpdate({
                        ...statusUpdate!,
                        feedback: e.target.value,
                      })
                    }
                    rows={2}
                  />
                  <button
                    onClick={() => handleUpdateStatus(session.id, 'COMPLETED')}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Submit Feedback
                  </button>
                </div>
              )}

              {session.status !== 'COMPLETED' && session.status !== 'CANCELLED' && (
                <div className="mt-4 flex gap-2 flex-wrap">
                  {session.status === 'SCHEDULED' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(session.id, 'IN_PROGRESS')}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm"
                      >
                        Start Session
                      </button>
                      <button
                        onClick={() => handleDeleteSession(session.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
                      >
                        <Trash2 size={16} className="inline mr-1" />
                        Cancel
                      </button>
                    </>
                  )}
                  {session.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => handleUpdateStatus(session.id, 'COMPLETED')}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {loading ? '⏳ Loading sessions...' : 'No sessions scheduled yet.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default SessionScheduling;
