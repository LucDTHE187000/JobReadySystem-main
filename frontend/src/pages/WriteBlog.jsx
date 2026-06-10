import { API_URL } from '@/config';
import { useState, useEffect } from 'react';
import SeekerLayout from '../components/layout/SeekerLayout';
import { useAuth } from '../contexts/AuthContext';
import { Star, Send, Award, Calendar, CheckCircle2, ListFilter, Quote } from 'lucide-react';
import axios from 'axios';

export default function WriteBlog() {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [rating, setRating] = useState(5);
    const [outcome, setOutcome] = useState('Nhận Offer');
    const [myBlogs, setMyBlogs] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const outcomes = ['Nhận Offer', 'Đang phỏng vấn', 'Đang xem xét', 'Nhận phản hồi', 'Đang học tập'];

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    const fetchMyBlogs = async () => {
        if (!token) return;
        try {
            const res = await axios.get(`${API_URL}/api/blogs/my`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMyBlogs(res.data || []);
        } catch (error) {
            console.error("Fetch my blogs failed:", error);
        }
    };

    useEffect(() => {
        fetchMyBlogs();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !description.trim()) {
            setMessage({ type: 'error', text: 'Vui lòng điền đầy đủ các trường thông tin.' });
            return;
        }

        try {
            setSubmitting(true);
            setMessage({ type: '', text: '' });
            
            await axios.post(`${API_URL}/api/blogs`, {
                title: title.trim(),
                description: description.trim(),
                rating,
                outcome
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage({ type: 'success', text: 'Bài viết của bạn đã được đăng thành công!' });
            setTitle('');
            setDescription('');
            setRating(5);
            setOutcome('Nhận Offer');
            fetchMyBlogs();
        } catch (error) {
            console.error("Post blog failed:", error);
            setMessage({ type: 'error', text: error.response?.data?.message || 'Có lỗi xảy ra khi đăng bài.' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SeekerLayout title="Viết Blog & Trải nghiệm" breadcrumb="Ứng viên > Viết Blog">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Form Column */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl p-6 sm:p-8 text-slate-800 shadow-md">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-slate-800 mb-2">Chia Sẻ Hành Trình Của Bạn</h2>
                            <p className="text-sm text-slate-500">
                                Hãy viết về trải nghiệm phỏng vấn, ôn luyện CV hoặc những bài học quý giá mà bạn học được tại JobReady để tiếp thêm động lực cho các ứng viên khác nhé!
                            </p>
                        </div>

                        {message.text && (
                            <div className={`p-4 rounded-xl mb-6 text-sm font-semibold flex items-center gap-2 ${
                                message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm' : 'bg-red-50 text-red-700 border border-red-200 shadow-sm'
                            }`}>
                                <CheckCircle2 size={18} />
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-2">Tiêu đề bài chia sẻ</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Ví dụ: Bí kíp đỗ Senior UI/UX Designer tại VNG nhờ JobReady"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0A2463] text-sm"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-2">Trạng thái kết quả đạt được</label>
                                    <select
                                        value={outcome}
                                        onChange={(e) => setOutcome(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0A2463] text-sm bg-white text-slate-800 placeholder:text-slate-400"
                                    >
                                        {outcomes.map(item => (
                                            <option key={item} value={item}>{item}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-2">Đánh giá độ hữu ích của JobReady</label>
                                    <div className="flex items-center gap-1.5 h-[46px] px-4 border border-gray-200 rounded-xl bg-white">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                className="hover:scale-110 transition-transform"
                                            >
                                                <Star
                                                    size={22}
                                                    className={star <= rating ? 'fill-[#F5C518] text-[#F5C518]' : 'text-gray-300'}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-2">Nội dung chi tiết trải nghiệm</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={6}
                                    placeholder="Hãy mô tả chi tiết: Bạn đã gặp khó khăn gì? Các bài học phỏng vấn AI, chấm điểm CV của JobReady đã giúp ích gì cho bạn? Lời khuyên cho các ứng viên khác..."
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0A2463] text-sm leading-relaxed bg-white"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-[#0A2463] text-white font-bold rounded-xl hover:bg-[#071A4A] transition-colors text-sm shadow-sm"
                            >
                                <Send size={16} />
                                {submitting ? 'Đang gửi...' : 'Đăng bài chia sẻ ngay'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Column (My posted blogs) */}
                <div className="space-y-6">
                    <div className="bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl p-6 text-slate-800 shadow-md h-full flex flex-col">
                        <div className="flex items-center gap-2 mb-6">
                            <Award className="text-[#F5C518]" size={22} />
                            <h2 className="text-lg font-bold text-slate-800">Bài Viết Của Bạn</h2>
                        </div>

                        <div className="space-y-4 flex-1 overflow-y-auto max-h-[500px] pr-1">
                            {myBlogs.length === 0 ? (
                                <div className="text-center py-12 text-slate-400">
                                    <Quote size={36} className="mx-auto mb-2 text-slate-200" />
                                    <p className="text-sm">Bạn chưa đăng bài chia sẻ nào.</p>
                                </div>
                            ) : (
                                myBlogs.map((blog) => (
                                    <div key={blog._id} className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-slate-800 shadow-sm">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="px-2.5 py-0.5 bg-[#0A2463]/10 text-[#0A2463] font-bold text-[10px] rounded-full">
                                                {blog.outcome}
                                            </span>
                                            <div className="flex items-center gap-0.5">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        size={12}
                                                        className={star <= blog.rating ? 'fill-[#F5C518] text-[#F5C518]' : 'text-gray-300'}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <h4 className="font-bold text-sm text-slate-800 mb-1 line-clamp-1">{blog.title}</h4>
                                        <p className="text-xs text-slate-600 line-clamp-3 mb-2 leading-relaxed">{blog.description}</p>
                                        <span className="text-[10px] text-slate-400">
                                            {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </SeekerLayout>
    );
}
