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
    <div 
      className="min-h-screen flex bg-cover bg-center bg-no-repeat bg-fixed relative"
      style={{ backgroundImage: "url('/background3.jpg')" }}
    >
      {/* Premium backdrop-blur and overlay */}
      <div className="absolute inset-0 bg-slate-950/35 backdrop-blur-[1px] pointer-events-none" />

      <div className="relative z-10 flex w-full h-screen">
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
          <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-white/60 px-6 lg:px-8 py-4 flex items-center justify-between gap-4 shadow-lg shadow-slate-900/5">
            <div className="flex items-center gap-4 flex-1 lg:max-w-xl">
              <button
                className="lg:hidden text-slate-800"
                onClick={() => setSidebarOpen(true)}
              >
                <MessageSquare size={24} />
              </button>
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-1">Feedback người dùng</p>
                <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-800">Danh sách phản hồi</h1>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 bg-white/80 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 shadow-sm transition-all text-xs lg:text-sm"
            >
              Đăng xuất
            </button>
          </header>

          <div className="p-4 lg:p-8">
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur-md p-6 shadow-xl shadow-slate-900/5">
                <div className="flex items-center gap-3 mb-3 text-indigo-600">
                  <MessageSquare size={20} />
                  <p className="text-sm font-semibold text-slate-500">Tổng feedback</p>
                </div>
                <p className="text-3xl font-bold tracking-tight text-slate-800">{feedbacks.length}</p>
              </div>

              <div className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur-md p-6 shadow-xl shadow-slate-900/5">
                <div className="flex items-center gap-3 mb-3 text-indigo-600">
                  <Clock3 size={20} />
                  <p className="text-sm font-semibold text-slate-500">Mới nhất</p>
                </div>
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {feedbacks[0] ? new Date(feedbacks[0].createdAt).toLocaleString('vi-VN') : 'Chưa có phản hồi'}
                </p>
              </div>

              <div className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur-md p-6 shadow-xl shadow-slate-900/5">
                <div className="flex items-center gap-3 mb-3 text-indigo-600">
                  <User size={20} />
                  <p className="text-sm font-semibold text-slate-500">Người dùng</p>
                </div>
                <p className="text-3xl font-bold tracking-tight text-slate-800">
                  {new Set(feedbacks.map((item) => item.userEmail)).size || 0}
                </p>
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-100 bg-red-50/60 backdrop-blur-sm p-4 text-sm text-red-650 font-semibold mb-6">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center h-72 text-slate-600 font-semibold">
                <Loader2 className="animate-spin mr-3 text-indigo-600" /> Đang tải feedback...
              </div>
            ) : (
              <div className="space-y-4">
                {feedbacks.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 backdrop-blur-md p-8 text-center text-slate-500 font-semibold shadow-xl shadow-slate-900/5">
                    Hiện chưa có phản hồi nào.
                  </div>
                ) : (
                  feedbacks.map((item) => (
                    <div key={item._id} className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur-md p-6 shadow-xl shadow-slate-900/5 hover:-translate-y-0.5 transition-all duration-300">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-indigo-600 font-semibold mb-1">{item.type}</p>
                          <h2 className="text-lg font-bold text-slate-800">{item.subject}</h2>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-xs text-slate-500 font-semibold">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">{new Date(item.createdAt).toLocaleTimeString('vi-VN')}</p>
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-3 mb-4">
                        <div className="rounded-xl bg-white/50 border border-white/40 p-3.5">
                          <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-1">Người gửi</p>
                          <p className="text-xs text-slate-700 font-semibold truncate">{item.userEmail}</p>
                        </div>
                        <div className="rounded-xl bg-white/50 border border-white/40 p-3.5">
                          <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-1">Trạng thái</p>
                          <div>
                            <span className="inline-flex rounded-full bg-indigo-50 border border-indigo-100 px-3 py-0.5 text-[10px] font-semibold text-indigo-700 shadow-sm">{item.status}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed text-slate-650 font-medium whitespace-pre-line bg-white/40 border border-white/30 rounded-xl p-4">{item.message}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
