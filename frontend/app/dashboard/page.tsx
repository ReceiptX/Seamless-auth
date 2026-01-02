'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getBusinessConfig, updateBusinessConfig } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [business, setBusiness] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [allowedOrigins, setAllowedOrigins] = useState('');
  const [callbackUrl, setCallbackUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedBusiness = localStorage.getItem('business');

    if (!storedToken || !storedBusiness) {
      router.push('/login');
      return;
    }

    setToken(storedToken);
    setBusiness(JSON.parse(storedBusiness));

    loadConfig(storedToken);
  }, [router]);

  const loadConfig = async (token: string) => {
    try {
      const data = await getBusinessConfig(token);
      setConfig(data);
      setAllowedOrigins(data.allowedOrigins?.join('\n') || '');
      setCallbackUrl(data.callbackUrl || '');
    } catch (err) {
      console.error('Failed to load config:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setSaving(true);

    try {
      const origins = allowedOrigins
        .split('\n')
        .map((o) => o.trim())
        .filter((o) => o);

      const data = await updateBusinessConfig(
        token,
        origins,
        callbackUrl || null
      );
      setConfig(data);
      setMessage('Configuration saved successfully!');
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('business');
    router.push('/login');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setMessage('Copied to clipboard!');
    setTimeout(() => setMessage(''), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const embedCode = `<div id="seamless-auth-container"></div>
<script src="${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/embed/button.js?key=${config?.publicKey}"></script>
<script>
  window.addEventListener('seamlessAuthSuccess', function(event) {
    console.log('User authenticated:', event.detail);
    // Access token: event.detail.token
    // Access user: event.detail.user
  });
</script>`;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Seamless Auth Dashboard</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Your API Key</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={config?.publicKey || ''}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
            <button
              onClick={() => copyToClipboard(config?.publicKey || '')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Copy
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Configuration</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Allowed Origins (one per line)
              </label>
              <textarea
                value={allowedOrigins}
                onChange={(e) => setAllowedOrigins(e.target.value)}
                rows={4}
                placeholder="https://yourdomain.com&#10;https://app.yourdomain.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                These domains will be allowed to use your auth button
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Callback URL (optional)
              </label>
              <input
                type="url"
                value={callbackUrl}
                onChange={(e) => setCallbackUrl(e.target.value)}
                placeholder="https://yourdomain.com/auth/callback"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                If provided, users will be redirected here after authentication
              </p>
            </div>
            {message && (
              <div className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </div>
            )}
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Embed Code</h2>
          <p className="text-sm text-gray-600 mb-2">
            Copy and paste this code into your website:
          </p>
          <div className="relative">
            <pre className="bg-gray-50 p-4 rounded border border-gray-300 overflow-x-auto text-sm">
              <code>{embedCode}</code>
            </pre>
            <button
              onClick={() => copyToClipboard(embedCode)}
              className="absolute top-2 right-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
