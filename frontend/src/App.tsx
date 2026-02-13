import { useState } from 'react';

function App() {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShortUrl('');
    setLoading(true);

    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (data.success) {
        setShortUrl(data.data.shortUrl);
        setUrl('');
      } else {
        setError(data.error?.message || 'Failed to shorten URL');
      }
    } catch (err) {
      setError('Network error. API might not be ready yet.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl);
    alert('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">URL Shortener</h1>
          <p className="text-sm text-gray-600">Fast, simple, powerful</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Shorten Your URLs
          </h2>
          <p className="text-lg text-gray-600">
            Create short, memorable links in seconds
          </p>
        </div>

        {/* URL Shortening Form */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                Enter your long URL
              </label>
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/very/long/url/that/needs/shortening"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !url}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Shortening...' : 'Shorten URL'}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Success Result */}
          {shortUrl && (
            <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg animate-fade-in">
              <p className="text-sm font-medium text-green-900 mb-2">
                ✅ Your shortened URL:
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={shortUrl}
                  readOnly
                  className="flex-1 px-4 py-2 bg-white border border-green-300 rounded-lg text-green-900 font-mono text-sm"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Lightning Fast</h3>
            <p className="text-gray-600 text-sm">
              Sub-100ms redirects with Redis caching
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Track Analytics</h3>
            <p className="text-gray-600 text-sm">
              Monitor clicks, locations, and devices
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure & Safe</h3>
            <p className="text-gray-600 text-sm">
              URL validation and SSRF protection
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 text-sm">
          <p>Built with React + TypeScript + Tailwind CSS</p>
          <p className="mt-1">Powered by Node.js + PostgreSQL + Redis</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
