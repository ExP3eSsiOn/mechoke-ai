"use client";

import { useState, useEffect } from "react";

type User = {
  userId: string;
  lastActive?: string;
  messageCount?: number;
  firstSeen?: string;
};

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState("");

  // Search and filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Send message
  const [showSendModal, setShowSendModal] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState("");

  // Copy notification
  const [copiedId, setCopiedId] = useState("");

  // Fetch users
  const fetchUsers = async (authToken: string) => {
    try {
      setLoading(true);
      const res = await fetch("/api/debug/users?limit=1000", {
        headers: { Authorization: `Bearer ${authToken}` },
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
      setUsers(data.users || []);
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
      fetchUsers(token);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (userId: string) => {
    navigator.clipboard.writeText(userId);
    setCopiedId(userId);
    setTimeout(() => setCopiedId(""), 2000);
  };

  // Toggle user selection
  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  // Select all
  const selectAll = () => {
    const filtered = filteredUsers.map((u) => u.userId);
    setSelectedUsers(filtered);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedUsers([]);
  };

  // Send message to selected
  const handleSendToSelected = async () => {
    if (selectedUsers.length === 0) {
      alert("กรุณาเลือก users ก่อน");
      return;
    }

    if (!message.trim()) {
      alert("กรุณากรอกข้อความ");
      return;
    }

    const confirmed = confirm(
      `ต้องการส่งข้อความไปยัง ${selectedUsers.length} คนใช่หรือไม่?`
    );
    if (!confirmed) return;

    try {
      setSending(true);
      setSendResult("");

      const res = await fetch("/api/admin/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userIds: selectedUsers,
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");

      setSendResult(`✅ ส่งสำเร็จ ${data.successCount}/${selectedUsers.length} คน`);
      setMessage("");
      setSelectedUsers([]);
      setTimeout(() => {
        setShowSendModal(false);
        setSendResult("");
      }, 3000);
    } catch (err) {
      setSendResult(`❌ ${err instanceof Error ? err.message : "Failed"}`);
    } finally {
      setSending(false);
    }
  };

  // Filter users
  const filteredUsers = users.filter((user) =>
    user.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Load on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("adminToken");
    if (savedToken) {
      setToken(savedToken);
      fetchUsers(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  // Login screen
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              👥 Users Management
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

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-lg text-gray-600">Loading users...</p>
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
                👥 Users Management
              </h1>
              <div className="flex flex-wrap gap-3 text-sm">
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="text-blue-700 font-medium">{users.length} Total Users</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-green-700 font-medium">
                    {selectedUsers.length} Selected
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchUsers(token)}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:from-green-600 hover:to-blue-600 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                🔄 Refresh
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("adminToken");
                  setAuthenticated(false);
                }}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                🔍 Search User ID
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Type to search..."
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={selectAll}
                disabled={filteredUsers.length === 0}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✅ Select All ({filteredUsers.length})
              </button>
              <button
                onClick={clearSelection}
                disabled={selectedUsers.length === 0}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ❌ Clear
              </button>
            </div>
          </div>

          {selectedUsers.length > 0 && (
            <button
              onClick={() => setShowSendModal(true)}
              className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:from-green-600 hover:to-blue-600 transition-all font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              📤 Send Message to {selectedUsers.length} Selected User{selectedUsers.length > 1 ? "s" : ""}
            </button>
          )}
        </div>

        {/* Users List */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            📋 Users List ({filteredUsers.length})
          </h2>

          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">ไม่พบ users</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredUsers.map((user) => (
                <div
                  key={user.userId}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedUsers.includes(user.userId)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-gray-50 hover:border-gray-300"
                  }`}
                  onClick={() => toggleUser(user.userId)}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.userId)}
                      onChange={() => toggleUser(user.userId)}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-mono text-sm font-semibold text-gray-800 truncate">
                          {user.userId}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(user.userId);
                          }}
                          className={`px-2 py-1 text-xs rounded-lg transition-all ${
                            copiedId === user.userId
                              ? "bg-green-500 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          {copiedId === user.userId ? "✓ Copied!" : "📋 Copy"}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                        {user.messageCount !== undefined && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                            💬 {user.messageCount} messages
                          </span>
                        )}
                        {user.lastActive && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">
                            🕒 {new Date(user.lastActive).toLocaleString("th-TH")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Send Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  📤 Send Message
                </h2>
                <button
                  onClick={() => setShowSendModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  กำลังส่งไปยัง <strong>{selectedUsers.length} users</strong>
                </p>
                <div className="max-h-32 overflow-y-auto bg-gray-50 p-3 rounded-lg">
                  {selectedUsers.slice(0, 5).map((id) => (
                    <p key={id} className="text-xs font-mono text-gray-600">
                      {id}
                    </p>
                  ))}
                  {selectedUsers.length > 5 && (
                    <p className="text-xs text-gray-500 mt-1">
                      ...และอีก {selectedUsers.length - 5} users
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  ข้อความ:
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  rows={8}
                  placeholder="พิมพ์ข้อความที่ต้องการส่ง..."
                />
                <p className="text-xs text-gray-500 mt-1">{message.length} ตัวอักษร</p>
              </div>

              {sendResult && (
                <div
                  className={`p-4 rounded-xl border-2 mb-4 ${
                    sendResult.startsWith("✅")
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-red-50 border-red-200 text-red-700"
                  }`}
                >
                  <p className="font-medium">{sendResult}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSendModal(false)}
                  disabled={sending}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-semibold disabled:opacity-50"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSendToSelected}
                  disabled={sending || !message.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:from-green-600 hover:to-blue-600 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? "⏳ กำลังส่ง..." : "🚀 ส่งข้อความ"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
