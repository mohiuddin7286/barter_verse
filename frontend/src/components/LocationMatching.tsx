import React, { useState, useEffect } from 'react';
import { MapPin, Users, Package } from 'lucide-react';

const LocationMatching = () => {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [radius, setRadius] = useState(50);
  const [searchType, setSearchType] = useState<'traders' | 'listings'>('traders');
  const [category, setCategory] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage('❌ Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setMessage('✅ Location detected!');
        setLoading(false);
      },
      () => {
        setMessage('❌ Failed to access your location');
        setLoading(false);
      }
    );
  };

  const updateLocation = async () => {
    if (!latitude || !longitude) {
      if (!city || !country) {
        setMessage('❌ Please enter coordinates or city/country');
        return;
      }
    }

    try {
      setLoading(true);
      const response = await fetch('/api/location/update-location', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          latitude,
          longitude,
          city,
          country,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setMessage('✅ Location updated successfully!');
      } else {
        setMessage(`❌ ${result.message}`);
      }
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const searchNearby = async () => {
    if (!latitude || !longitude) {
      setMessage('❌ Please set your location first');
      return;
    }

    try {
      setLoading(true);
      const endpoint =
        searchType === 'traders'
          ? `/api/location/nearby-traders?radius=${radius}&category=${category}`
          : `/api/location/nearby-listings?radius=${radius}&category=${category}`;

      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      const result = await response.json();
      if (result.success) {
        setResults(result.data);
        setMessage(`✅ Found ${result.data.length} results within ${radius} km`);
      } else {
        setMessage(`❌ ${result.message}`);
      }
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">🗺️ Location-Based Matching</h1>

      {message && (
        <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
          {message}
        </div>
      )}

      {/* Location Setup */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* GPS Input */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">📍 Set Your Location</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Latitude</label>
              <input
                type="number"
                step="0.0001"
                value={latitude || ''}
                onChange={(e) => setLatitude(parseFloat(e.target.value) || null)}
                placeholder="e.g., 28.7041"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Longitude</label>
              <input
                type="number"
                step="0.0001"
                value={longitude || ''}
                onChange={(e) => setLongitude(parseFloat(e.target.value) || null)}
                placeholder="e.g., 77.1025"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <button
              onClick={useCurrentLocation}
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-2 rounded-lg font-medium"
            >
              📍 Use Current Location
            </button>
          </div>
        </div>

        {/* Manual Input */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">🏙️ Or Enter City/Country</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g., Bangalore"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g., India"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <button
              onClick={updateLocation}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-2 rounded-lg font-medium"
            >
              💾 Save Location
            </button>
          </div>
        </div>
      </div>

      {/* Search Settings */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">🔍 Find Nearby</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Search Type</label>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as 'traders' | 'listings')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="traders">Nearby Traders</option>
              <option value="listings">Nearby Listings</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category (Optional)</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., photography"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Radius (km)</label>
            <input
              type="number"
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value) || 50)}
              min="1"
              max="500"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={searchNearby}
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-2 rounded-lg font-medium"
            >
              {loading ? '⏳ Searching...' : '🔍 Search'}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.map((result) =>
            searchType === 'traders' ? (
              <div key={result.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start gap-4">
                  {result.avatar_url && (
                    <img
                      src={result.avatar_url}
                      alt={result.username}
                      className="w-16 h-16 rounded-full"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{result.username}</h3>
                    <p className="text-gray-600">
                      ⭐ {result.rating.toFixed(1)} • 📍 {result.distance.toFixed(1)} km away
                    </p>
                    {result.city && (
                      <p className="text-sm text-gray-500">
                        📌 {result.city}, {result.country}
                      </p>
                    )}
                    {result.listings.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium">Skills:</p>
                        {result.listings.map((listing: any) => (
                          <span
                            key={listing.id}
                            className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2 mt-1"
                          >
                            {listing.title}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div key={result.id} className="bg-white rounded-lg shadow-md p-6">
                {result.image_url && (
                  <img
                    src={result.image_url}
                    alt={result.title}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                )}
                <h3 className="text-lg font-semibold">{result.title}</h3>
                <p className="text-gray-600 text-sm mt-2">{result.description}</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-600">{result.category}</span>
                  <span className="text-sm text-gray-500">📍 {result.distance.toFixed(1)} km</span>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm">
                    📌 {result.owner.username} (⭐ {result.owner.rating.toFixed(1)})
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {results.length === 0 && !loading && message && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No results found. Try adjusting your search radius.</p>
        </div>
      )}
    </div>
  );
};

export default LocationMatching;
