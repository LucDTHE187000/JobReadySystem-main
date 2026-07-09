import { API_URL } from '@/config';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import NotificationDropdown from '../components/ui/NotificationDropdown';
import { useNavigate } from 'react-router-dom';
import {
    FileText,
    Eye,
    Calendar,
    TrendingUp,
    Users,
    Home,
    Briefcase,
    BarChart3,
    Settings,
    Bell,
    MessageSquare,
    ChevronRight,
    Search,
    AlertCircle,
    Image as ImageIcon
} from 'lucide-react';
import SideBar from "../components/SideBar";

export default function Dashboard() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [activeMenu, setActiveMenu] = useState('home');
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);

    const notificationRef = useRef(null);
    const bellRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (notificationRef.current && !notificationRef.current.contains(event.target) &&
                bellRef.current && !bellRef.current.contains(event.target)) {
                setIsNotificationOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (user) {
            setProfile(user);
        }
    }, [user]);

    const [stats, setStats] = useState([
        { label: 'Việc làm của bạn', value: '—', icon: FileText, change: '' },
        { label: 'Tổng ứng viên', value: '—', icon: Eye, change: '' },
        { label: 'Chờ phỏng vấn', value: '—', icon: Calendar, change: '' },
        { label: 'Tỷ lệ chấp nhận', value: '—', icon: TrendingUp, change: '' },
    ]);
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                if (!token) return;
                const headers = { Authorization: `Bearer ${token}` };

                const [jobsRes, appsRes] = await Promise.all([
                    fetch(`${API_URL}/api/jobs/job-application`, { headers }),
                    fetch(`${API_URL}/api/applications/company/applicants`, { headers }),
                ]);
                const jobsData = jobsRes.ok ? await jobsRes.json() : null;
                const appsData = appsRes.ok ? await appsRes.json() : null;

                const totalJobs = jobsData?.count ?? 0;
                const applicants = appsData?.applicants ?? [];
                const totalApplicants = applicants.length;
                const interviewCount = applicants.filter(a => a.status === 'interview').length;
                const acceptedCount = applicants.filter(a => a.status === 'accepted').length;
                const acceptRate = totalApplicants > 0 ? ((acceptedCount / totalApplicants) * 100).toFixed(1) + '%' : '0%';

                setPendingCount(applicants.filter(a => a.status === 'pending').length);
                setStats([
                    { label: 'Việc làm của bạn', value: totalJobs.toString(), icon: FileText, change: '' },
                    { label: 'Tổng ứng viên', value: totalApplicants.toString(), icon: Users, change: '' },
                    { label: 'Chờ phỏng vấn', value: interviewCount.toString(), icon: Calendar, change: '' },
                    { label: 'Tỷ lệ chấp nhận', value: acceptRate, icon: TrendingUp, change: '' },
                ]);
            } catch (err) {
                console.error('Load stats error:', err);
            }
        };
        loadStats();
    }, [activeMenu]);

    const [notifications, setNotifications] = useState([]);
    const [campaigns, setCampaigns] = useState([]);

    // Campaign form states
    const [campaignTitle, setCampaignTitle] = useState('');
    const [campaignImage, setCampaignImage] = useState('');
    const [campaignFileName, setCampaignFileName] = useState('');
    const [campaignSubmitting, setCampaignSubmitting] = useState(false);
    const [campaignError, setCampaignError] = useState('');
    const [campaignSuccess, setCampaignSuccess] = useState('');

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setCampaignError('Kích thước file không được vượt quá 5MB.');
                return;
            }
            try {
                const base64 = await convertToBase64(file);
                setCampaignImage(base64);
                setCampaignFileName(file.name);
                setCampaignError('');
                setCampaignSuccess('');
            } catch (err) {
                console.error(err);
                setCampaignError('Lỗi đọc file.');
            }
        }
    };

    const handleCreateCampaign = async (e) => {
        e.preventDefault();
        if (!campaignTitle.trim()) {
            setCampaignError('Vui lòng nhập tên chiến dịch quảng cáo.');
            return;
        }
        if (!campaignImage) {
            setCampaignError('Vui lòng chọn hình ảnh banner.');
            return;
        }

        try {
            setCampaignSubmitting(true);
            setCampaignError('');
            setCampaignSuccess('');

            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/campaigns`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: campaignTitle.trim(),
                    image: campaignImage
                })
            });

            if (res.ok) {
                setCampaignSuccess('Đã đăng chiến dịch quảng cáo thành công!');
                setCampaignTitle('');
                setCampaignImage('');
                setCampaignFileName('');
                fetchCampaigns();
            } else {
                const errData = await res.json();
                setCampaignError(errData.message || 'Lỗi khi tạo chiến dịch.');
            }
        } catch (err) {
            console.error(err);
            setCampaignError('Không thể kết nối đến server.');
        } finally {
            setCampaignSubmitting(false);
        }
    };

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) return;
            const res = await fetch(`${API_URL}/api/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data || []);
            }
        } catch (err) {
            console.error('Load notifications error:', err);
        }
    };

    const fetchCampaigns = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) return;
            const res = await fetch(`${API_URL}/api/campaigns/my`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setCampaigns(data || []);
            }
        } catch (err) {
            console.error('Load campaigns error:', err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        fetchCampaigns();
        const interval = setInterval(fetchNotifications, 30000); // Poll notifications every 30s
        return () => clearInterval(interval);
    }, []);

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'interview': return Calendar;
            case 'application': return FileText;
            case 'success': return TrendingUp;
            case 'warning': return Bell;
            case 'system': return Bell;
            default: return Bell;
        }
    };

    const getNotificationColors = (type) => {
        switch (type) {
            case 'interview': return { color: 'text-purple-500', bg: 'bg-purple-50' };
            case 'application': return { color: 'text-blue-500', bg: 'bg-blue-50' };
            case 'success': return { color: 'text-green-500', bg: 'bg-green-50' };
            case 'warning': return { color: 'text-orange-500', bg: 'bg-orange-50' };
            case 'system': return { color: 'text-red-500', bg: 'bg-red-50' };
            default: return { color: 'text-cyan-500', bg: 'bg-cyan-50' };
        }
    };

    function formatTimeAgo(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        return `${diffDays} ngày trước`;
    }

    const displayCampaigns = campaigns.length > 0 ? campaigns.map(c => ({
        _id: c._id,
        title: c.title,
        image: c.image,
        views: `${c.views} lượt`,
        applicants: `${c.applicants} ứng viên`,
        tag: c.status === 'running' ? 'ĐANG CHẠY' : 'ĐÃ DỪNG'
    })) : [
        {
            _id: 'mock1',
            title: 'Tuyển dụng Software Engineer 2024',
            views: '3.2k lượt',
            applicants: '156 ứng viên',
            image: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=200',
            tag: 'ĐANG CHẠY'
        },
        {
            _id: 'mock2',
            title: 'Branding: Mở rộng cơ hội việc làm toàn diện',
            views: '2.8k lượt',
            applicants: '89 ứng viên',
            image: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=200',
            tag: 'ĐANG CHẠY'
        }
    ];

    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div 
            className="min-h-screen flex bg-cover bg-center bg-no-repeat bg-fixed relative"
            style={{ backgroundImage: `url('/background3.jpg')` }}
        >
            {/* Premium backdrop-blur and dark-gradient overlay */}
            <div className="absolute inset-0 bg-slate-950/30 backdrop-blur-[1px] pointer-events-none" />

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className="relative z-10 flex w-full">
                <SideBar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    activeMenu={activeMenu}
                    setActiveMenu={setActiveMenu}
                    profile={profile}
                />

                <main className="flex-1 overflow-auto w-full relative">
                    <header className="sticky top-0 z-20 bg-white/70 border-b border-white/45 backdrop-blur-md px-4 lg:px-8 py-4 flex items-center justify-between gap-4 shadow-sm">
                        <div className="flex items-center gap-4 flex-1 lg:max-w-xl">
                            <button
                                className="lg:hidden text-slate-600 hover:text-slate-800"
                                onClick={() => setSidebarOpen(true)}
                            >
                                <Briefcase size={24} />
                            </button>
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm..."
                                    className="w-full pl-10 pr-4 py-2 bg-white/60 border border-slate-200 focus:border-indigo-500 focus:bg-white text-sm text-slate-800 placeholder-slate-400 font-medium transition-all shadow-inner rounded-xl focus:ring-0 outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 lg:gap-4">
                            <div className="relative">
                                <button
                                    ref={bellRef}
                                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                    className={`relative p-2 rounded-xl hidden sm:block transition-all ${isNotificationOpen ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'}`}
                                >
                                    <Bell size={22} className={isNotificationOpen ? "fill-indigo-600 text-indigo-600" : ""} />
                                    {notifications.some(n => !n.isRead) && (
                                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
                                    )}
                                </button>

                                {isNotificationOpen && (
                                    <div ref={notificationRef}>
                                        <NotificationDropdown onClose={() => setIsNotificationOpen(false)} />
                                    </div>
                                )}
                            </div>
                            <button 
                                onClick={() => navigate('/employer/feedback')}
                                className="relative p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-800 rounded-xl hidden sm:block transition-all"
                            >
                                <MessageSquare size={22} />
                            </button>
                            <button
                                onClick={() => signOut()}
                                className="px-3 py-2 lg:px-4 bg-white/80 border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold rounded-xl shadow-sm transition-all text-xs lg:text-sm whitespace-nowrap"
                            >
                                Đăng xuất
                            </button>
                        </div>
                    </header>

                    <div className="p-4 lg:p-8 space-y-6">
                        {user?.role === "EMPLOYER" && !user?.isApproved && (
                            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl flex items-start gap-3 shadow-sm">
                                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-sm">Tài khoản tuyển dụng chưa được kiểm duyệt</h4>
                                    <p className="text-xs text-amber-700 mt-1 font-medium leading-relaxed">
                                        Doanh nghiệp của bạn hiện đang chờ Admin xác thực thông tin (tra cứu công ty, kiểm duyệt giấy phép kinh doanh...). 
                                        Bạn có thể xem trước các tính năng, nhưng sẽ chưa thể đăng tin tuyển dụng mới lên hệ thống.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-xl shadow-slate-900/5 inline-block w-full sm:w-auto">
                            <h1 className="text-2xl lg:text-3xl text-slate-800 font-bold tracking-tight mb-1">CHÀO MỪNG TRỞ LẠI!</h1>
                            <p className="text-sm text-slate-600 font-medium">Hôm nay có {pendingCount} ứng viên mới đang chờ bạn xem xét</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
                            {stats.map((stat, index) => (
                                <div key={index} className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/60 shadow-xl shadow-slate-900/5 hover:bg-white hover:-translate-y-0.5 transition-all text-slate-800">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="bg-indigo-50 p-3 rounded-xl">
                                            <stat.icon className="text-indigo-600" size={24} />
                                        </div>
                                        <span className="text-emerald-600 text-xs font-bold">{stat.change}</span>
                                    </div>
                                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">{stat.label}</p>
                                    <p className="text-3xl font-bold tracking-tight text-slate-800">{stat.value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/60 shadow-xl shadow-slate-900/5">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-lg font-bold text-slate-800">Quản lý quảng cáo</h2>
                                        <button className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold transition-colors">
                                            Tất cả chiến dịch
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div
                                            className="bg-slate-55/40 border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-slate-50/50 rounded-xl p-6 text-center cursor-pointer transition-all"
                                            onClick={() => document.getElementById('ad-upload').click()}
                                        >
                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100">
                                                <ImageIcon className="text-slate-400" size={24} />
                                            </div>
                                            <h3 className="font-semibold text-slate-700 text-sm mb-1">
                                                {campaignFileName ? `Đã chọn: ${campaignFileName}` : 'Tải lên Banner / Poster quảng cáo mới'}
                                            </h3>
                                            <p className="text-xs text-slate-400 font-medium mb-3">PNG, JPEG, GIF (Tối đa 5MB, tỷ lệ 16:9)</p>
                                            <button 
                                                type="button" 
                                                className="px-4 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold rounded-lg shadow-sm transition-all"
                                            >
                                                {campaignFileName ? 'Thay đổi tệp' : 'Chọn tệp tin'}
                                            </button>
                                            <input
                                                type="file"
                                                id="ad-upload"
                                                className="hidden"
                                                accept="image/png, image/jpeg, image/gif"
                                                onChange={handleFileChange}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>

                                        {campaignImage && (
                                            <form onSubmit={handleCreateCampaign} className="p-4 bg-white/60 border border-slate-200/80 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200 text-left">
                                                <div className="flex gap-3 items-center">
                                                    <img src={campaignImage} className="w-16 h-10 rounded object-cover border border-slate-200" alt="Preview" />
                                                    <div className="flex-1">
                                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Tên chiến dịch quảng cáo</label>
                                                        <input
                                                            type="text"
                                                            value={campaignTitle}
                                                            onChange={(e) => setCampaignTitle(e.target.value)}
                                                            placeholder="Ví dụ: Chiến dịch chiêu mộ Software Engineer 2024"
                                                            className="w-full px-3 py-1.5 border border-slate-200 focus:border-indigo-500 rounded-lg text-xs font-medium text-slate-800 bg-white"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex justify-end gap-2 pt-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setCampaignImage('');
                                                            setCampaignFileName('');
                                                            setCampaignTitle('');
                                                        }}
                                                        className="px-3 py-1.5 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50 bg-white shadow-sm transition-all"
                                                    >
                                                        Hủy
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        disabled={campaignSubmitting}
                                                        className="px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold text-xs rounded-lg shadow-md transition-all"
                                                    >
                                                        {campaignSubmitting ? 'Đang tạo...' : 'Tạo chiến dịch'}
                                                    </button>
                                                </div>
                                            </form>
                                        )}

                                        {campaignError && <p className="text-xs font-semibold text-red-650 bg-red-50 border border-red-100/60 p-2.5 rounded-lg text-left">{campaignError}</p>}
                                        {campaignSuccess && <p className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100/60 p-2.5 rounded-lg text-left">{campaignSuccess}</p>}
                                    </div>

                                    <div className="mt-8">
                                        <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase mb-4 text-left">CHIẾN DỊCH ĐANG CHẠY</h3>
                                        <div className="space-y-4">
                                            {displayCampaigns.map((campaign) => (
                                                <div key={campaign._id} className="flex items-center gap-4 p-4 bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl hover:bg-white/80 transition-all text-left">
                                                    <img
                                                        src={campaign.image}
                                                        alt={campaign.title}
                                                        className="w-20 h-20 rounded-lg object-cover border border-slate-200"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                                                            <h4 className="font-semibold text-slate-800 truncate">{campaign.title}</h4>
                                                            <span className={`w-fit px-2 py-0.5 text-xs font-bold rounded-full ${
                                                                campaign.tag === 'ĐANG CHẠY' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/60' : 'bg-slate-200 text-slate-700'
                                                            }`}>
                                                                {campaign.tag}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                                                            <span className="flex items-center gap-1">
                                                                <Eye size={14} className="text-slate-400" />
                                                                {campaign.views}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Users size={14} className="text-slate-400" />
                                                                {campaign.applicants}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <button className="text-slate-400 hover:text-slate-700 transition-colors">
                                                        <ChevronRight size={20} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/60 shadow-xl shadow-slate-900/5">
                                    <h2 className="text-lg font-bold text-slate-800 mb-4">Thông báo hệ thống</h2>
                                    <div className="space-y-4">
                                        {notifications.length === 0 ? (
                                            <p className="text-xs text-slate-400 font-medium text-center py-6">Không có thông báo mới nào</p>
                                        ) : (
                                            notifications.slice(0, 5).map((notification) => {
                                                const IconComponent = getNotificationIcon(notification.type);
                                                const { color, bg } = getNotificationColors(notification.type);
                                                return (
                                                    <div key={notification._id} className="border-b border-slate-100 last:border-0 pb-4 last:pb-0 text-left">
                                                        <div className="flex gap-3">
                                                            <div className={`${bg} p-2 rounded-xl h-fit`}>
                                                                <IconComponent className={color} size={18} />
                                                            </div>
                                                            <div className="flex-1">
                                                                <h4 className="font-semibold text-sm text-slate-800 mb-1">
                                                                    {notification.title}
                                                                </h4>
                                                                <p className="text-xs text-slate-500 font-medium mb-1.5 line-clamp-2">
                                                                    {notification.description}
                                                                </p>
                                                                <p className="text-[10px] text-slate-400 font-medium">{formatTimeAgo(notification.createdAt)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
