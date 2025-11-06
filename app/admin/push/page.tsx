"use client";

import { useState, useEffect } from "react";

type PromotionTemplate = {
  key: string;
  title: string;
  text: string;
  category: string;
};

type User = {
  userId: string;
  lastActive?: string;
  messageCount?: number;
};

export default function AdminPushPage() {
  const [token, setToken] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  // Users
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [sendToAll, setSendToAll] = useState(true);

  // Templates
  const [templates, setTemplates] = useState<PromotionTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [useCustom, setUseCustom] = useState(false);

  // Sending
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState("");

  // Preview
  const [previewUserId, setPreviewUserId] = useState("");
  const [previewing, setPreviewing] = useState(false);

  // History
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load templates from Quick Responses
  const loadTemplates = async (authToken: string) => {
    try {
      const res = await fetch("/api/admin/quick-responses", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) throw new Error("Failed to load templates");

      const data = await res.json();
      const promotionTemplates = data.data
        .filter((t: any) => ["promotion", "info", "support"].some((cat: string) => t.tags?.includes(cat)))
        .map((t: any) => ({
          key: t.key,
          title: t.key.replace(/_/g, " ").toUpperCase(),
          text: t.text,
          category: t.tags?.[0] || "other",
        }));

      setTemplates(promotionTemplates);
    } catch (err) {
      console.error("Failed to load templates:", err);
    }
  };

  // Load users
  const loadUsers = async (authToken: string) => {
    try {
      const res = await fetch("/api/debug/users?limit=100", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) throw new Error("Failed to load users");

      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  };

  // Load history
  const loadHistory = async (authToken: string) => {
    try {
      const res = await fetch("/api/admin/push/history", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) throw new Error("Failed to load history");

      const data = await res.json();
      setHistory(data.history || []);
    } catch (err) {
      console.error("Failed to load history:", err);
    }
  };

  // Authentication
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      localStorage.setItem("adminToken", token);
      setAuthenticated(true);
      loadTemplates(token);
      loadUsers(token);
      loadHistory(token);
    }
  };

  // Send preview
  const handlePreview = async () => {
    if (!previewUserId) {
      alert("กรุณากรอก User ID สำหรับ preview");
      return;
    }

    const message = useCustom ? customMessage : templates.find(t => t.key === selectedTemplate)?.text;
    if (!message) {
      alert("กรุณาเลือก template หรือกรอกข้อความ");
      return;
    }

    try {
      setPreviewing(true);
      const res = await fetch("/api/admin/push/preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: previewUserId, message }),
      });

      if (!res.ok) throw new Error("Failed to send preview");
      alert("✅ ส่ง preview สำเร็จ!");
    } catch (err) {
      alert(`❌ ${err instanceof Error ? err.message : "Failed"}`);
    } finally {
      setPreviewing(false);
    }
  };

  // Send promotion
  const handleSend = async () => {
    const message = useCustom ? customMessage : templates.find(t => t.key === selectedTemplate)?.text;
    if (!message) {
      alert("กรุณาเลือก template หรือกรอกข้อความ");
      return;
    }

    const targetUserIds = sendToAll ? users.map(u => u.userId) : selectedUsers;
    if (targetUserIds.length === 0) {
      alert("ไม่มี users ที่จะส่ง");
      return;
    }

    const confirmed = confirm(
      `ต้องการส่งข้อความไปยัง ${targetUserIds.length} คนใช่หรือไม่?\n\n` +
      `ข้อความ:\n${message.substring(0, 100)}...`
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
          userIds: targetUserIds,
          message,
          templateKey: useCustom ? null : selectedTemplate,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");

      setSendResult(`✅ ส่งสำเร็จ ${data.successCount}/${targetUserIds.length} คน`);
      loadHistory(token);
    } catch (err) {
      setSendResult(`❌ ${err instanceof Error ? err.message : "Failed"}`);
    } finally {
      setSending(false);
    }
  };

  // Toggle user selection
  const toggleUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  // Load on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("adminToken");
    if (savedToken) {
      setToken(savedToken);
      setAuthenticated(true);
      loadTemplates(savedToken);
      loadUsers(savedToken);
      loadHistory(savedToken);
    }
  }, []);

  // Update custom message when template changes
  useEffect(() => {
    if (!useCustom && selectedTemplate) {
      const template = templates.find(t => t.key === selectedTemplate);
      if (template) {
        setCustomMessage(template.text);
      }
    }
  }, [selectedTemplate, useCustom, templates]);

  // Login screen
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <h1 className="text-3xl font-bold mb-6 text-center text-purple-600">
            🚀 Push Promotion
          </h1>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Admin Token</label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="Enter admin token"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-600 transition font-medium"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-purple-600">🚀 Push Promotion System</h1>
              <p className="text-gray-600 mt-1">
                Users: {users.length} คน | Templates: {templates.length} รายการ
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                📊 History
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("adminToken");
                  setAuthenticated(false);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* History Modal */}
        {showHistory && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">📊 Send History</h2>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-gray-500 text-center py-4">ยังไม่มีประวัติการส่ง</p>
              ) : (
                history.map((h, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{h.timestamp}</span>
                      <span className="text-green-600">{h.successCount}/{h.totalCount} คน</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{h.message?.substring(0, 80)}...</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Message Composer */}
          <div className="lg:col-span-2 space-y-6">
            {/* Template Selection */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">📝 เลือก Template</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={!useCustom}
                      onChange={() => setUseCustom(false)}
                      className="w-4 h-4"
                    />
                    <span>ใช้ Template</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={useCustom}
                      onChange={() => setUseCustom(true)}
                      className="w-4 h-4"
                    />
                    <span>เขียนเอง (Custom)</span>
                  </label>
                </div>

                {!useCustom && (
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="">-- เลือก template --</option>
                    {templates.map((t) => (
                      <option key={t.key} value={t.key}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">ข้อความ:</label>
                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    disabled={!useCustom && !selectedTemplate}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none font-mono text-sm"
                    rows={12}
                    placeholder="เลือก template หรือเขียนข้อความเอง..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {customMessage.length} ตัวอักษร
                  </p>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">👁️ ส่ง Preview</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={previewUserId}
                  onChange={(e) => setPreviewUserId(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="User ID สำหรับทดสอบ (LINE User ID)"
                />
                <button
                  onClick={handlePreview}
                  disabled={previewing}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400"
                >
                  {previewing ? "กำลังส่ง..." : "ส่ง Preview"}
                </button>
              </div>
            </div>

            {/* Send Button */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg p-6 text-white">
              <h2 className="text-xl font-bold mb-4">🚀 ส่ง Promotion</h2>
              <button
                onClick={handleSend}
                disabled={sending}
                className="w-full py-4 bg-white text-purple-600 rounded-xl hover:bg-gray-100 transition font-bold text-lg disabled:bg-gray-300"
              >
                {sending
                  ? "กำลังส่ง..."
                  : `ส่งไปยัง ${sendToAll ? users.length : selectedUsers.length} คน`}
              </button>
              {sendResult && (
                <p className="mt-4 text-center font-medium">{sendResult}</p>
              )}
            </div>
          </div>

          {/* Right: User Selection */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">👥 เลือก Users</h2>

              <div className="space-y-4">
                <label className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendToAll}
                    onChange={(e) => setSendToAll(e.target.checked)}
                    className="w-5 h-5"
                  />
                  <span className="font-medium">ส่งให้ทุกคน ({users.length} คน)</span>
                </label>

                {!sendToAll && (
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    <p className="text-sm text-gray-600 mb-2">
                      เลือกแล้ว: {selectedUsers.length} คน
                    </p>
                    {users.map((user) => (
                      <label
                        key={user.userId}
                        className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                      >
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.userId)}
                          onChange={() => toggleUser(user.userId)}
                          className="w-4 h-4"
                        />
                        <div className="flex-1 text-sm">
                          <div className="font-mono text-xs text-gray-600">
                            {user.userId.substring(0, 20)}...
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.messageCount || 0} messages
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
