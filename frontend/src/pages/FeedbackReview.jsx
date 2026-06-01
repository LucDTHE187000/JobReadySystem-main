import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import SideBar from '../components/SideBar';
import axios from 'axios';
import { MessageSquare, Clock3, User, Loader2 } from 'lucide-react';

export default function FeedbackReview() {
  const { user, signOut } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('feedback');
  const notificationRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const fetchFeedbacks = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get(`${API_URL}/api/feedback`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFeedbacks(response.data.feedbacks || []);
      } catch (err) {
        console.error('Fetch feedbacks error:', err);
        setError(err.response?.data?.message || 'Không thể tải danh sách feedback.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, [API_URL]);

  return (
    <div className="flex h-screen bg-[#F4F6FB]">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <SideBar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        profile={user}
      />

      <main className="flex-1 overflow-auto w-full relative">
        <header className="sticky top-0 z-20 bg-white border-b border-[#DDE3F0] px-4 lg:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 lg:max-w-xl">
            <button
              className="lg:hidden text-gray-500"
              onClick={() => setSidebarOpen(true)}
            >
              <MessageSquare size={24} />
            </button>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[#64748B] mb-1">Feedback người dùng</p>
              <h1 className="text-2xl lg:text-3xl font-bold text-[#0A2463]">Danh sách phản hồi</h1>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="px-3 py-2 bg-[#0A2463] text-white rounded-lg hover:bg-[#071A4A] transition-colors text-xs lg:text-sm font-medium"
          >
            Đăng xuất
          </button>
        </header>

        <div className="p-4 lg:p-8">
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-3xl border border-[#DDE3F0] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-[#0A2463]">
                <MessageSquare size={20} />
                <p className="text-sm font-semibold">Tổng feedback</p>
              </div>
              <p className="text-4xl font-heading text-[#0A2463]">{feedbacks.length}</p>
            </div>
            <div className="rounded-3xl border border-[#DDE3F0] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-[#0A2463]">
                <Clock3 size={20} />
                <p className="text-sm font-semibold">Mới nhất</p>
              </div>
              <p className="text-lg text-[#0A2463]">{feedbacks[0] ? new Date(feedbacks[0].createdAt).toLocaleString('vi-VN') : 'Chưa có phản hồi'}</p>
            </div>
            <div className="rounded-3xl border border-[#DDE3F0] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-[#0A2463]">
                <User size={20} />
                <p className="text-sm font-semibold">Người dùng</p>
              </div>
              <p className="text-lg text-[#0A2463]">{new Set(feedbacks.map((item) => item.userEmail)).size || 0}</p>
            </div>
          </div>

          {error && (
            <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-sm text-red-700 mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-72 text-[#0A2463]">
              <Loader2 className="animate-spin mr-3" /> Đang tải feedback...
            </div>
          ) : (
            <div className="space-y-4">
              {feedbacks.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-[#CBD5E1] bg-white p-8 text-center text-[#64748B]">
                  Hiện chưa có phản hồi nào.
                </div>
              ) : (
                feedbacks.map((item) => (
                  <div key={item._id} className="rounded-3xl border border-[#DDE3F0] bg-white p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-[#64748B] mb-2">{item.type}</p>
                        <h2 className="text-xl font-semibold text-[#0A2463]">{item.subject}</h2>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-[#64748B]">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</p>
                        <p className="text-sm text-[#94A3B8]">{new Date(item.createdAt).toLocaleTimeString('vi-VN')}</p>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3 mb-4">
                      <div className="rounded-3xl bg-[#F8FAFC] p-4">
                        <p className="text-[11px] uppercase tracking-[0.3em] text-[#475569] mb-2">Người gửi</p>
                        <p className="text-sm text-[#0A2463] font-medium">{item.userEmail}</p>
                      </div>
                      <div className="rounded-3xl bg-[#F8FAFC] p-4">
                        <p className="text-[11px] uppercase tracking-[0.3em] text-[#475569] mb-2">Trạng thái</p>
                        <span className="inline-flex rounded-full bg-[#F5C518]/15 px-3 py-1 text-xs font-semibold text-[#92400E]">{item.status}</span>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-[#334155] whitespace-pre-line">{item.message}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
