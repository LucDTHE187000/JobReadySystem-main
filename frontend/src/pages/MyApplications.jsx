import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Briefcase, MapPin, Clock, ChevronRight, Loader2,
    FileText, Heart, User, Settings, LogOut, LayoutDashboard,
    CheckCircle2, Circle, Calendar, Building2, Filter, Search,
    ClipboardList, ChevronLeft, ChevronDown
} from 'lucide-react';
import SeekerLayout from '../components/layout/SeekerLayout';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const STATUS_CONFIG = {
    pending:   { label: 'Đang xem xét', color: 'bg-blue-500/25 text-blue-300 border border-blue-500/25',   dot: 'bg-blue-400' },
    interview: { label: 'Hẹn phỏng vấn', color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
    accepted:  { label: 'Đã nhận', color: 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/25',  dot: 'bg-emerald-400' },
    rejected:  { label: 'Đã kết thúc', color: 'bg-gray-100 text-white/60',    dot: 'bg-gray-400' },
};

const TABS = [
    { key: 'all',       label: 'Tất cả' },
    { key: 'pending',   label: 'Đang xem xét' },
    { key: 'interview', label: 'Phỏng vấn' },
    { key: 'done',      label: 'Đã kết thúc' },
];

const STEPS = ['Đã gửi', 'Xem hồ sơ', 'Phỏng vấn', 'Kết quả'];

function getStepIndex(status) {
    if (status === 'pending')   return 1;
    if (status === 'interview') return 2;
    if (status === 'accepted' || status === 'rejected') return 3;
    return 0;
}

function formatSalary(salary) {
    if (!salary) return 'Thỏa thuận';
    let { min, max, currency } = salary;
    if (!min && !max) return 'Thỏa thuận';
    
    const isVND = currency === 'VND' || !currency || currency.toUpperCase() === 'VND';
    const unit = isVND ? ' triệu VNĐ' : ` ${currency}`;
    
    if (isVND) {
        if (min >= 100000) min = min / 1000000;
        if (max >= 100000) max = max / 1000000;
    }
    
    if (min && max) return `${min.toLocaleString()} – ${max.toLocaleString()}${unit}`;
    if (min) return `Từ ${min.toLocaleString()}${unit}`;
    if (max) return `Đến ${max.toLocaleString()}${unit}`;
    return 'Thỏa thuận';
}

function timeAgo(date) {
    const diff = Date.now() - new Date(date).getTime();
    const d = Math.floor(diff / 86400000);
    if (d === 0) return 'Hôm nay';
    if (d === 1) return 'Hôm qua';
    if (d < 30)  return `${d} ngày trước`;
    const m = Math.floor(d / 30);
    return `${m} tháng trước`;
}

function CompanyLogo({ company, avatar }) {
    if (avatar) return (
        <img src={`${API_URL}${avatar}`} alt={company}
            className="w-12 h-12 rounded-xl object-cover border border-gray-100 flex-shrink-0"
            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
        />
    );
    const initials = (company || 'C').charAt(0).toUpperCase();
    const colors = ['bg-[#0A2463]','bg-violet-500','bg-emerald-500','bg-[#F5C518]','bg-pink-500'];
    const color = colors[initials.charCodeAt(0) % colors.length];
    return (
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
            {initials}
        </div>
    );
}

function ProgressStepper({ status }) {
    const activeStep = getStepIndex(status);
    const isRejected = status === 'rejected';
    return (
        <div className="flex items-center gap-0 mt-4 w-full">
            {STEPS.map((step, i) => {
                const done = i <= activeStep;
                const active = i === activeStep;
                const stepColor = isRejected && i === activeStep ? 'bg-red-500 border-red-500' : done ? 'bg-[#F5C518] border-[#F5C518]' : 'bg-white/10 border-white/20';
                const textColor = active ? (isRejected ? 'text-red-600 font-semibold' : 'text-white font-semibold') : done ? 'text-[#1A3A7C] font-medium' : 'text-gray-400';
                const lineColor = i < activeStep ? 'bg-[#0A2463]' : 'bg-gray-200';
                return (
                    <div key={i} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-white text-xs ${stepColor}`}>
                                {done ? <CheckCircle2 className="w-3.5 h-3.5 text-[#F5C518]" /> : <Circle className="w-3.5 h-3.5 text-white/30" />}
                            </div>
                            <span className={`text-[10px] mt-1 whitespace-nowrap ${textColor}`}>{step}</span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className={`h-0.5 flex-1 mx-1 mb-4 ${lineColor}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function ApplicationCard({ app }) {
    const job = app.jobId || {};
    const recruiter = job.recruiterId || {};
    const companyName = recruiter.companyName || recruiter.name || 'Công ty';
    const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
    const city = job.location?.city || '';

    return (
        <div className="bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-5 hover:bg-white/15 transition-all text-white shadow-xl">
            <div className="flex items-start gap-4">
                <CompanyLogo company={companyName} avatar={recruiter.avatarUrl || recruiter.avatar} />
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="min-w-0">
                            <Link
                                to={`/jobs/${job._id}`}
                                className="text-base font-bold text-white hover:text-white transition-colors line-clamp-1"
                            >
                                {job.title || 'Vị trí không xác định'}
                            </Link>
                            <p className="text-sm text-white/60 mt-0.5 flex items-center gap-1">
                                <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="truncate">{companyName}</span>
                                {city && <><span className="text-white/30 mx-1">•</span><MapPin className="w-3.5 h-3.5 flex-shrink-0" /><span className="truncate">{city}</span></>}
                            </p>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0 ${cfg.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                            {cfg.label}
                        </span>
                    </div>

                    <div className="flex items-center gap-3 mt-2 text-xs text-white/50">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Đã ứng tuyển {timeAgo(app.createdAt)}</span>
                        {app.status === 'interview' && app.interviewDate && (
                            <span className="flex items-center gap-1 text-purple-600 font-medium">
                                <Calendar className="w-3.5 h-3.5" />
                                Phỏng vấn: {new Date(app.interviewDate).toLocaleDateString('vi-VN')}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <ProgressStepper status={app.status} />

            {/* Interview notification */}
            {app.status === 'interview' && app.interviewDate && (
                <div className="mt-4 flex items-start gap-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
                    <span className="w-1.5 h-full min-h-[36px] bg-purple-400 rounded-full flex-shrink-0 mt-0.5"></span>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-purple-800 mb-0.5">Phản hồi từ Nhà tuyển dụng</p>
                        <p className="text-xs text-purple-700">
                            Bạn có lịch phỏng vấn vào <strong>{new Date(app.interviewDate).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' })}</strong>.
                        </p>
                    </div>
                </div>
            )}

            {/* Rejected message */}
            {app.status === 'rejected' && (
                <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10 text-white">
                    <p className="text-xs text-white/60 italic">
                        Cảm ơn bạn đã quan tâm. Vị trí này hiện đã được lấp đầy hoặc tạm dừng tuyển dụng. Chúng tôi sẽ lưu hồ sơ của bạn cho các cơ hội sắp tới.
                    </p>
                </div>
            )}
        </div>
    );
}

const PER_PAGE = 5;

export default function MyApplications() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    // Saved Jobs states
    const [activeParentTab, setActiveParentTab] = useState('applications'); // 'applications' | 'saved'
    const [savedJobs, setSavedJobs] = useState([]);
    const [savedLoading, setSavedLoading] = useState(false);

    useEffect(() => {
        fetchApplications();
        fetchSavedJobs();
    }, []);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/api/applications/my`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setApplications(res.data.applications || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSavedJobs = async () => {
        try {
            setSavedLoading(true);
            const res = await axios.get(`${API_URL}/api/jobs/saved`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSavedJobs((res.data.data || []).filter(j => j));
        } catch (err) {
            console.error("Error fetching saved jobs:", err);
        } finally {
            setSavedLoading(false);
        }
    };

    const handleUnsaveJob = async (jobId) => {
        if (!window.confirm("Bạn có chắc muốn bỏ lưu việc làm này?")) return;
        try {
            await axios.post(`${API_URL}/api/jobs/${jobId}/save`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSavedJobs(prev => prev.filter(j => j._id !== jobId));
        } catch (err) {
            console.error("Error unsaving job:", err);
        }
    };

    const filtered = applications.filter(app => {
        const job = app.jobId || {};
        const recruiter = job.recruiterId || {};
        const matchTab =
            activeTab === 'all' ? true :
            activeTab === 'done' ? (app.status === 'rejected' || app.status === 'accepted') :
            app.status === activeTab;
        const q = search.toLowerCase();
        const matchSearch = !q ||
            (job.title || '').toLowerCase().includes(q) ||
            (recruiter.companyName || recruiter.name || '').toLowerCase().includes(q);
        return matchTab && matchSearch;
    });

    const tabCounts = {
        all: applications.length,
        pending: applications.filter(a => a.status === 'pending').length,
        interview: applications.filter(a => a.status === 'interview').length,
        done: applications.filter(a => a.status === 'rejected' || a.status === 'accepted').length,
    };

    const totalPages = Math.ceil(filtered.length / PER_PAGE);
    const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    const handleTabChange = (key) => { setActiveTab(key); setPage(1); };

    return (
        <SeekerLayout title="Quản lý việc làm" breadcrumb="Công việc › Việc làm của tôi">
            <div className="max-w-4xl mx-auto w-full space-y-5">
                {/* Parent Tabs Selector */}
                <div className="flex border-b border-gray-200 mb-6">
                    <button
                        onClick={() => setActiveParentTab('applications')}
                        className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all ${
                            activeParentTab === 'applications'
                                ? 'border-[#F5C518] text-white font-bold'
                                : 'border-transparent text-white/60 hover:text-white'
                        }`}
                    >
                        💼 Đơn ứng tuyển
                    </button>
                    <button
                        onClick={() => setActiveParentTab('saved')}
                        className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all ${
                            activeParentTab === 'saved'
                                ? 'border-[#F5C518] text-white font-bold'
                                : 'border-transparent text-white/60 hover:text-white'
                        }`}
                    >
                        ⭐ Việc làm đã lưu
                    </button>
                </div>

                {/* Sub Tab: Applications */}
                {activeParentTab === 'applications' && (
                    <>
                        <p className="text-sm text-white/60 -mt-2">
                            Theo dõi trạng thái từ {applications.length} đơn ứng tuyển.
                        </p>

                        {/* Search + Filter bar */}
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                                    placeholder="Tìm theo tên công việc, công ty..."
                                    className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#F5C518]"
                                />
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1 shadow-sm overflow-x-auto">
                            {TABS.map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => handleTabChange(tab.key)}
                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                                        activeTab === tab.key
                                            ? 'bg-[#F5C518] text-[#0A2463] font-bold shadow-sm'
                                            : 'text-white/60 hover:text-white hover:bg-white/10'
                                    }`}
                                >
                                    {tab.label}
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                        activeTab === tab.key ? 'bg-[#0A2463]/15 text-[#0A2463]' : 'bg-white/10 text-white/60'
                                    }`}>
                                        {tabCounts[tab.key]}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Application list */}
                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 className="w-8 h-8 animate-spin text-white" />
                            </div>
                        ) : paginated.length === 0 ? (
                            <div className="bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-12 text-center text-white shadow-xl">
                                <ClipboardList className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                <p className="text-white/60 font-medium">Chưa có đơn ứng tuyển nào</p>
                                <p className="text-sm text-gray-400 mt-1">Hãy ứng tuyển để bắt đầu hành trình sự nghiệp!</p>
                                <Link to="/jobs" className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-[#F5C518] text-[#0A2463] rounded-xl text-sm font-bold hover:bg-[#D4A800] transition-colors">
                                    <Briefcase className="w-4 h-4" /> Tìm việc làm
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {paginated.map(app => (
                                    <ApplicationCard key={app._id} app={app} />
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-1 pt-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-2 rounded-lg border border-white/10 text-white disabled:opacity-40 hover:bg-white/10 transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4 text-white" />
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                                            p === page ? 'bg-[#0A2463] text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="p-2 rounded-lg border border-white/10 text-white disabled:opacity-40 hover:bg-white/10 transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4 text-white" />
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Sub Tab: Saved Jobs */}
                {activeParentTab === 'saved' && (
                    <div className="space-y-4">
                        <p className="text-sm text-white/60 -mt-2">
                            Bạn đã lưu {savedJobs.length} công việc quan tâm.
                        </p>
                        
                        {savedLoading ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 className="w-8 h-8 animate-spin text-white" />
                            </div>
                        ) : savedJobs.length === 0 ? (
                            <div className="bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-12 text-center text-white shadow-xl">
                                <Heart className="w-12 h-12 text-white/20 mx-auto mb-3" />
                                <p className="text-white/60 font-medium">Chưa có việc làm nào được lưu</p>
                                <p className="text-sm text-white/60 mt-1">Lưu các việc làm yêu thích khi xem tin tuyển dụng để nộp đơn ứng tuyển sau!</p>
                                <Link to="/jobs" className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-[#F5C518] text-[#0A2463] rounded-xl text-sm font-bold hover:bg-[#D4A800] transition-colors">
                                    <Briefcase className="w-4 h-4" /> Khám phá việc làm
                                </Link>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {savedJobs.map(job => {
                                    const companyName = job.recruiterId?.companyName || job.recruiterId?.name || 'Công ty';
                                    const city = job.location?.city || '';
                                    return (
                                        <div key={job._id} className="bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-5 hover:bg-white/15 transition-all text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                <CompanyLogo company={companyName} avatar={job.recruiterId?.avatarUrl || job.recruiterId?.avatar} />
                                                <div className="min-w-0 text-left">
                                                    <Link
                                                        to={`/jobs/${job._id}`}
                                                        className="text-base font-bold text-white hover:text-white transition-colors line-clamp-1"
                                                    >
                                                        {job.title}
                                                    </Link>
                                                    <p className="text-sm text-white/60 mt-0.5 flex items-center gap-1 flex-wrap">
                                                        <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                                                        <span>{companyName}</span>
                                                        {city && <><span className="text-gray-300">•</span><MapPin className="w-3.5 h-3.5 flex-shrink-0" /><span>{city}</span></>}
                                                    </p>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/20 rounded-lg font-medium">{job.jobType}</span>
                                                        <span className="text-xs px-2 py-1 bg-[#F5C518]/20 text-[#F5C518] border border-[#F5C518]/20 rounded-lg font-medium">💰 {formatSalary(job.salary)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 self-end sm:self-auto flex-wrap">
                                                <Link
                                                    to={`/jobs/${job._id}`}
                                                    className="px-4 py-2 bg-[#0A2463] hover:bg-[#071A4A] text-white text-xs font-semibold rounded-lg transition flex items-center justify-center"
                                                >
                                                    Chi tiết & Apply
                                                </Link>
                                                <button
                                                    onClick={() => handleUnsaveJob(job._id)}
                                                    className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-semibold rounded-lg transition cursor-pointer"
                                                >
                                                    Hủy lưu
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </SeekerLayout>
    );
}
