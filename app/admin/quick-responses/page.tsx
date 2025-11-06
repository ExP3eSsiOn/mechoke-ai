"use client";

import { useState, useEffect } from "react";

type QuickResponse = {
  key: string;
  text: string;
  keywords: string[];
  tags?: string[];
};

export default function QuickResponsesPage() {
  const [responses, setResponses] = useState<QuickResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  // Send message form
  const [userId, setUserId] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState("");

  // Fetch templates
  const fetchTemplates = async (authToken: string) => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/quick-responses", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          setAuthenticated(false);
          setError("Invalid token");
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      setResponses(data.data || []);
      setAuthenticated(true);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  // Authentication
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      localStorage.setItem("adminToken", token);
      fetchTemplates(token);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("คัดลอกแล้ว!");
  };

  // Send message
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !selectedTemplate) {
      alert("กรุณากรอก User ID และเลือก Template");
      return;
    }

    try {
      setSending(true);
      setSendResult("");
      const res = await fetch("/api/admin/quick-responses/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          templateKey: selectedTemplate,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      setSendResult("✅ ส่งข้อความสำเร็จ!");
      setUserId("");
      setSelectedTemplate("");
    } catch (err) {
      setSendResult(`❌ ${err instanceof Error ? err.message : "Failed to send"}`);
    } finally {
      setSending(false);
    }
  };

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("adminToken");
    if (savedToken) {
      setToken(savedToken);
      fetchTemplates(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  // Not authenticated - show login
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6">🔐 Admin Login</h1>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Admin Token</label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter admin token"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">📝 Quick Responses</h1>
            <button
              onClick={() => {
                localStorage.removeItem("adminToken");
                setAuthenticated(false);
                setToken("");
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            จำนวน templates: {responses.length} รายการ
          </p>
        </div>

        {/* Send Message Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">📤 ส่งข้อความ</h2>
          <form onSubmit={handleSend} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">User ID (LINE)</label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="U1234567890abcdef..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Template</label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">-- เลือก template --</option>
                  {responses.map((r) => (
                    <option key={r.key} value={r.key}>
                      {r.key}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={sending}
              className="w-full md:w-auto px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:bg-gray-400"
            >
              {sending ? "กำลังส่ง..." : "ส่งข้อความ"}
            </button>
            {sendResult && (
              <p className={`text-sm ${sendResult.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>
                {sendResult}
              </p>
            )}
          </form>
        </div>

        {/* Templates Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {responses.map((response) => (
            <div
              key={response.key}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-blue-600">{response.key}</h3>
                <button
                  onClick={() => copyToClipboard(response.text)}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
                >
                  📋 Copy
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 font-medium mb-2">ข้อความ:</p>
                <pre className="text-sm bg-gray-50 p-3 rounded-lg whitespace-pre-wrap break-words max-h-64 overflow-y-auto">
                  {response.text}
                </pre>
              </div>

              <div className="mb-3">
                <p className="text-sm text-gray-600 font-medium mb-1">Keywords:</p>
                <div className="flex flex-wrap gap-1">
                  {response.keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {response.tags && response.tags.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Tags:</p>
                  <div className="flex flex-wrap gap-1">
                    {response.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
