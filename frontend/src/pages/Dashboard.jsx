
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
        { label: 'Tin tuyển dụng', value: '—', icon: FileText, change: '' },
        { label: 'Ứng viên', value: '—', icon: Eye, change: '' },
        { label: 'Chờ phỏng vấn', value: '—', icon: Calendar, change: '' },
        { label: 'Tỷ lệ chấp nhận', value: '—', icon: TrendingUp, change: '' },
    ]);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                if (!token) return;
                const headers = { Authorization: `Bearer ${token}` };

                const [jobsRes, appsRes] = await Promise.all([
                    fetch('http://localhost:4000/api/jobs/my', { headers }),
                    fetch('http://localhost:4000/api/applications/company/applicants', { headers }),
                ]);
                const jobsData = jobsRes.ok ? await jobsRes.json() : null;
                const appsData = appsRes.ok ? await appsRes.json() : null;

                const totalJobs = jobsData?.count ?? 0;
                const applicants = appsData?.applicants ?? [];
                const totalApplicants = applicants.length;
                const interviewCount = applicants.filter(a => a.status === 'interview').length;
                const acceptedCount = applicants.filter(a => a.status === 'accepted').length;
                const acceptRate = totalApplicants > 0 ? ((acceptedCount / totalApplicants) * 100).toFixed(1) + '%' : '0%';

                setStats([
                    { label: 'Tin tuyển dụng', value: totalJobs.toString(), icon: FileText, change: '' },
                    { label: 'Tổng ứng viên', value: totalApplicants.toString(), icon: Users, change: '' },
                    { label: 'Chờ phỏng vấn', value: interviewCount.toString(), icon: Calendar, change: '' },
                    { label: 'Tỷ lệ chấp nhận', value: acceptRate, icon: TrendingUp, change: '' },
                ]);
            } catch (err) {
                console.error('Load stats error:', err);
            }
        };
        loadStats();
    }, []);

    const notifications = [
        {
            icon: Users,
            color: 'text-blue-500',
            bg: 'bg-blue-50',
            title: 'Cập nhật chính sách mới',
            description: 'Từ ngày 01/03/2024, hệ thống sẽ cập nhật các chính sách mới về quy định tuyển dụng. Vui lòng xem chi tiết và tuân thủ theo các quy định mới này.',
            time: '2 giờ trước'
        },
        {
            icon: Calendar,
            color: 'text-green-500',
            bg: 'bg-green-50',
            title: 'Gửi bạn gợi ý và ưu tiên thương hiệu',
            description: 'Nền tảng giúp bạn nâm nhanh và toàn diện các công cụ và hướng dẫn để tối ưu hóa thương hiệu với chỉ 3 bước đơn giản.',
            time: '5 giờ trước'
        },
        {
            icon: FileText,
            color: 'text-orange-500',
            bg: 'bg-orange-50',
            title: 'Mẹo tuyển dụng hiệu quả',
            description: 'Khám phá 5 chiến lược tuyển dụng hiệu quả để thu hút ứng viên chất lượng cao cho doanh nghiệp của bạn.',
            time: '1 ngày trước'
        },
        {
            icon: Bell,
            color: 'text-cyan-500',
            bg: 'bg-cyan-50',
            title: 'Tín năng cải tiến hệ thống',
            description: 'Phiên bản mới ngày 15/02/2024 đã có mặt với nhiều cải tiến về giao diện và tốc độ xử lý.',
            time: '3 ngày trước'
        }
    ];

    const campaigns = [
        {
            title: 'Tuyển dụng Software Engineer 2024',
            views: '3.2k lượt',
            applicants: '156 ứng viên',
            image: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=200',
            tag: 'ĐANG CHẠY'
        },
        {
            title: 'Branding: Mở trường hội việc dụng dễng',
            views: '2.8k lượt',
            applicants: '89 ứng viên',
            image: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=200',
            tag: 'ĐANG CHẠY'
        }
    ];

    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-[#F4F6FB]">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <SideBar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                activeMenu={activeMenu}
                setActiveMenu={setActiveMenu}
                profile={profile}
            />

            <main className="flex-1 overflow-auto w-full relative">
                <header className="sticky top-0 z-20 bg-white border-b border-[#DDE3F0] px-4 lg:px-8 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 lg:max-w-xl">
                        <button
                            className="lg:hidden text-gray-500"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Briefcase size={24} />
                        </button>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Tìm kiếm..."
                                className="w-full pl-10 pr-4 py-2 bg-[#F4F6FB] border border-[#DDE3F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2463] text-sm"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 lg:gap-4">
                        <div className="relative">
                            <button
                                ref={bellRef}
                                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                className={`relative p-2 rounded-lg hidden sm:block transition-colors ${isNotificationOpen ? 'bg-[#0A2463]/10 text-[#0A2463]' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                <Bell size={22} className={isNotificationOpen ? "fill-[#0A2463]" : ""} />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
                            </button>

                            {isNotificationOpen && (
                                <div ref={notificationRef}>
                                    <NotificationDropdown onClose={() => setIsNotificationOpen(false)} />
                                </div>
                            )}
                        </div>
                        <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg hidden sm:block">
                            <MessageSquare size={22} />
                        </button>
                        <button
                            onClick={() => signOut()}
                            className="px-3 py-2 lg:px-4 bg-[#0A2463] text-white rounded-lg hover:bg-[#071A4A] transition-colors text-xs lg:text-sm font-medium whitespace-nowrap"
                        >
                            Đăng xuất
                        </button>
                    </div>
                </header>

                <div className="p-4 lg:p-8">
                    <div className="mb-8">
                        <h1 className="font-heading text-2xl lg:text-3xl text-[#0A2463] mb-1">CHÀO MỪNG TRỞ LẠI!</h1>
                        <p className="text-sm lg:text-base text-[#5A6482]">Hôm nay có 45 ứng viên mới đang chờ bạn xem xét</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="bg-white rounded-2xl p-6 border border-[#DDE3F0] shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="bg-[#0A2463]/10 p-3 rounded-xl">
                                        <stat.icon className="text-[#0A2463]" size={24} />
                                    </div>
                                    <span className="text-green-600 text-sm font-medium">{stat.change}</span>
                                </div>
                                <p className="text-[#5A6482] text-sm mb-1">{stat.label}</p>
                                <p className="font-heading text-3xl text-[#0A2463]">{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-xl p-6 border border-gray-100">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-bold text-gray-900">Quản lý quảng cáo</h2>
                                    <button className="text-[#0A2463] hover:text-[#F5C518] text-sm font-medium">
                                        Tất cả chiến dịch
                                    </button>
                                </div>

                                <div
                                    className="bg-[#0A2463]/5 border border-[#DDE3F0] rounded-lg p-8 text-center mb-6 cursor-pointer hover:bg-[#0A2463]/10 transition-colors"
                                    onClick={() => document.getElementById('ad-upload').click()}
                                >
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                                        <ImageIcon className="text-[#0A2463]" size={32} />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Tải lên Banner / Poster quảng cáo mới</h3>
                                    <p className="text-sm text-gray-600 mb-4">PNG, JPEG, PDF (Kích thước tối đa: 5MB). Tỷ lệ khuyến nghị: 16:9 </p>
                                    <button className="px-6 py-2 bg-[#F5C518] text-[#0A2463] font-bold rounded-lg hover:bg-[#D4A800] transition-colors text-sm">
                                        Chọn tệp tin
                                    </button>
                                    <input
                                        type="file"
                                        id="ad-upload"
                                        className="hidden"
                                        accept="image/png, image/jpeg, application/pdf"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                alert(`Đã chọn file: ${file.name}`);
                                            }
                                        }}
                                    />
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-4">CHIẾN DỊCH ĐANG CHẠY</h3>
                                    <div className="space-y-4">
                                        {campaigns.map((campaign, index) => (
                                            <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                <img
                                                    src={campaign.image}
                                                    alt={campaign.title}
                                                    className="w-20 h-20 rounded-lg object-cover"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                                                        <h4 className="font-semibold text-gray-900 truncate">{campaign.title}</h4>
                                                        <span className="w-fit px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                                                            {campaign.tag}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                                        <span className="flex items-center gap-1">
                                                            <Eye size={14} />
                                                            {campaign.views}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Users size={14} />
                                                            {campaign.applicants}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button className="text-gray-400 hover:text-gray-600">
                                                    <ChevronRight size={20} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white rounded-xl p-6 border border-gray-100">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Thông báo hệ thống</h2>
                                <div className="space-y-4">
                                    {notifications.map((notification, index) => (
                                        <div key={index} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                                            <div className="flex gap-3">
                                                <div className={`${notification.bg} p-2 rounded-lg h-fit`}>
                                                    <notification.icon className={notification.color} size={18} />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-sm text-gray-900 mb-1">
                                                        {notification.title}
                                                    </h4>
                                                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                                        {notification.description}
                                                    </p>
                                                    <button className="text-xs text-[#0A2463] hover:text-[#F5C518] font-medium">
                                                        Xem toàn bộ thông báo
                                                    </button>
                                                    <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
