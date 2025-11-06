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
    alert("📋 คัดลอกแล้ว!");
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              📝 Quick Responses
            </h1>
            <p className="text-gray-600">Admin Panel</p>
          </div>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Admin Token</label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter admin token"
              />
            </div>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">❌ {error}</p>
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              🔓 Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                📝 Quick Responses
              </h1>
              <div className="flex flex-wrap gap-3 text-sm">
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="text-blue-700 font-medium">{responses.length} Templates</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem("adminToken");
                setAuthenticated(false);
                setToken("");
              }}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Send Message Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">📤 ส่งข้อความ</h2>
          </div>
          <form onSubmit={handleSend} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  User ID (LINE)
                </label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="U1234567890abcdef..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Template</label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
                >
                  <option value="">-- เลือก template --</option>
                  {responses.map((r) => (
                    <option key={r.key} value={r.key}>
                      {r.key.replace(/_/g, " ").toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={sending}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:from-green-600 hover:to-blue-600 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? "⏳ กำลังส่ง..." : "🚀 ส่งข้อความ"}
              </button>
            </div>
            {sendResult && (
              <div className={`p-4 rounded-xl border-2 ${
                sendResult.startsWith("✅")
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}>
                <p className="font-medium">{sendResult}</p>
              </div>
            )}
          </form>
        </div>

        {/* Templates Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {responses.map((response, index) => (
            <div
              key={response.key}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-gray-100 overflow-hidden group"
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-white flex-1 pr-2">
                    {response.key.replace(/_/g, " ").toUpperCase()}
                  </h3>
                  <button
                    onClick={() => copyToClipboard(response.text)}
                    className="px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white text-sm rounded-lg hover:bg-white/30 transition-all font-medium shadow-lg"
                  >
                    📋 Copy
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5">
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    ข้อความ:
                  </p>
                  <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-100">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap break-words max-h-48 overflow-y-auto font-sans">
                      {response.text}
                    </pre>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    Keywords:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {response.keywords.slice(0, 3).map((kw, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-xs rounded-full font-medium"
                      >
                        {kw}
                      </span>
                    ))}
                    {response.keywords.length > 3 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                        +{response.keywords.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {response.tags && response.tags.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                      Tags:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {response.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs rounded-full font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
