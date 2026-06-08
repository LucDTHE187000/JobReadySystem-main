import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
    Search, MapPin, Heart, Clock, ChevronDown,
    ChevronLeft, ChevronRight, Briefcase, SlidersHorizontal, X
} from 'lucide-react';
import SeekerLayout from '../components/layout/SeekerLayout';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import { siteImages } from '../config/siteImages';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const JOB_TYPES = [
    { value: 'full-time', label: 'Toàn thời gian' },
    { value: 'part-time', label: 'Bán thời gian' },
    { value: 'internship', label: 'Thực tập' },
    { value: 'remote', label: 'Làm việc từ xa' },
];

const SALARY_RANGES = [
    { value: '', label: 'Tất cả mức lương' },
    { value: '0-10', label: 'Dưới 10 triệu' },
    { value: '10-20', label: '10 – 20 triệu' },
    { value: '20-30', label: '20 – 30 triệu' },
    { value: '30-999', label: 'Trên 30 triệu' },
    { value: 'negotiate', label: 'Thỏa thuận' },
];

const LOCATIONS = [
    'Tất cả địa điểm',
    'Hà Nội',
    'TP. HCM',
    'Đà Nẵng',
    'Hải Phòng',
    'Cần Thơ',
    'Bình Dương',
    'Đồng Nai',
];

function timeAgo(dateStr) {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} ngày trước`;
    return `${Math.floor(diff / 2592000)} tháng trước`;
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

function jobTypeLabel(type) {
    return JOB_TYPES.find(t => t.value === type)?.label || type;
}

function CompanyAvatar({ company, avatar }) {
    if (avatar) {
        return (
            <img
                src={avatar}
                alt={company}
                className="w-12 h-12 rounded-xl object-cover border border-gray-200 flex-shrink-0"
            />
        );
    }
    const initials = (company || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
    const colors = ['bg-[#0A2463]', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-green-500'];
    const color = colors[(company || '').charCodeAt(0) % colors.length];
    return (
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${color}`}>
            {initials}
        </div>
    );
}

function JobCard({ job, onToggleSave, saved }) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const recruiter = job.recruiterId || {};
    const companyName = recruiter.companyName || recruiter.name || 'Công ty';
    const avatar = recruiter.avatarUrl || recruiter.avatar || null;

    return (
        <div
            className={`rounded-xl border p-4 sm:p-5 hover:shadow-md transition-all cursor-pointer ${
                user
                    ? job.isPremium
                        ? 'bg-white/80 border-[#F5C518]/50 text-slate-800 ring-1 ring-[#F5C518]/10 hover:border-[#F5C518] hover:bg-white'
                        : 'bg-white/80 border-slate-200/60 text-slate-800 hover:border-[#F5C518]/30 hover:bg-white'
                    : job.isPremium
                        ? 'bg-white/10 border-[#F5C518]/50 text-white ring-1 ring-[#F5C518]/10 hover:border-[#F5C518] hover:bg-white/20'
                        : 'bg-white/10 border border-white/10 text-white hover:border-[#F5C518]/30 hover:bg-white/15'
            }`}
            onClick={() => navigate(`/jobs/${job._id}`)}
        >
            <div className="flex gap-3 sm:gap-4 items-start">
                <CompanyAvatar company={companyName} avatar={avatar} />

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className={`text-base font-semibold truncate hover:text-[#F5C518] transition-colors ${user ? 'text-slate-800' : 'text-white'}`}>
                                    {job.title}
                                </h3>
                                {job.isPremium && (
                                    <span className="text-xs bg-orange-100 text-orange-600 font-medium px-2 py-0.5 rounded-full flex-shrink-0">
                                        HOT
                                    </span>
                                )}
                            </div>
                            <p className={`text-sm mt-0.5 ${user ? 'text-slate-500' : 'text-white/60'}`}>{companyName}</p>
                        </div>
                        <button
                            onClick={e => { e.stopPropagation(); onToggleSave(job._id); }}
                            className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
                                user 
                                    ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-100' 
                                    : 'text-white/40 hover:bg-white/10'
                            }`}
                        >
                            <Heart
                                className={`w-5 h-5 transition-colors ${saved ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                            />
                        </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5">
                        <span className={`flex items-center gap-1.5 text-sm font-semibold px-2.5 py-1 rounded-full ${
                            user 
                                ? 'text-amber-700 bg-amber-50 border border-amber-100' 
                                : 'text-[#F5C518] bg-white/10'
                        }`}>
                            💰 {formatSalary(job.salary)}
                        </span>
                        <span className={`flex items-center gap-1 text-sm ${user ? 'text-slate-500' : 'text-white/60'}`}>
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                            {job.location?.city
                                ? `${job.location.city}${job.location.country ? ', ' + job.location.country : ''}`
                                : 'Không xác định'}
                        </span>
                        <span className={`flex items-center gap-1 text-sm ${user ? 'text-slate-400' : 'text-white/40'}`}>
                            <Clock className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                            {timeAgo(job.createdAt)}
                        </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-3 flex-wrap">
                        <div className="flex flex-wrap gap-1.5">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                                user 
                                    ? 'bg-slate-100 text-slate-600 border border-slate-200/60' 
                                    : 'bg-white/10 text-white/80'
                            }`}>
                                {jobTypeLabel(job.jobType)}
                            </span>
                            {job.requirements && job.requirements.split(',').slice(0, 2).map((req, i) => (
                                <span key={i} className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                                    user 
                                        ? 'bg-slate-100 text-slate-600 border border-slate-200/60' 
                                        : 'bg-white/10 text-white/80'
                                }`}>
                                    {req.trim()}
                                </span>
                            ))}
                        </div>
                        <button
                            onClick={e => { e.stopPropagation(); navigate(`/jobs/${job._id}`); }}
                            className="text-sm font-medium px-3.5 py-1.5 rounded-lg transition-colors flex-shrink-0 text-[#0A2463] bg-[#F5C518] hover:bg-[#D4A800]"
                        >
                            Ứng tuyển ngay
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Pagination({ page, totalPages, onPageChange }) {
    const { user } = useAuth();
    if (totalPages <= 1) return null;

    const pages = [];
    const delta = 2;
    let left = page - delta;
    let right = page + delta;
    if (left < 1) { right += 1 - left; left = 1; }
    if (right > totalPages) { left -= right - totalPages; right = totalPages; }
    left = Math.max(1, left);

    for (let i = left; i <= right; i++) pages.push(i);

    return (
        <div className="flex items-center justify-center gap-1 mt-8">
            <button
                disabled={page === 1}
                onClick={() => onPageChange(page - 1)}
                className={`p-2 rounded-lg border disabled:opacity-40 disabled:cursor-not-allowed transition-colors ${
                    user 
                        ? 'border-slate-300 text-slate-700 hover:bg-slate-100 bg-white shadow-sm' 
                        : 'border-white/10 text-white hover:bg-white/10'
                }`}
            >
                <ChevronLeft className="w-4 h-4" />
            </button>

            {left > 1 && (
                <>
                    <button 
                        onClick={() => onPageChange(1)} 
                        className={`w-9 h-9 text-sm rounded-lg border transition-colors ${
                            user 
                                ? 'border-slate-300 text-slate-700 hover:bg-slate-100 bg-white shadow-sm' 
                                : 'border-white/10 text-white hover:bg-white/10'
                        }`}
                    >
                        1
                    </button>
                    {left > 2 && <span className={`px-1 ${user ? 'text-slate-400' : 'text-white/40'}`}>…</span>}
                </>
            )}

            {pages.map(p => (
                <button
                    key={p}
                    onClick={() => onPageChange(p)}
                    className={`w-9 h-9 text-sm rounded-lg border transition-colors font-medium ${
                        p === page
                            ? 'bg-[#F5C518] border-transparent text-[#0A2463]'
                            : user
                                ? 'border-slate-300 hover:bg-slate-100 text-slate-700 bg-white shadow-sm'
                                : 'border-white/10 hover:bg-white/10 text-white'
                    }`}
                >
                    {p}
                </button>
            ))}

            {right < totalPages && (
                <>
                    {right < totalPages - 1 && <span className={`px-1 ${user ? 'text-slate-400' : 'text-white/40'}`}>…</span>}
                    <button 
                        onClick={() => onPageChange(totalPages)} 
                        className={`w-9 h-9 text-sm rounded-lg border transition-colors ${
                            user 
                                ? 'border-slate-300 text-slate-700 hover:bg-slate-100 bg-white shadow-sm' 
                                : 'border-white/10 text-white hover:bg-white/10'
                        }`}
                    >
                        {totalPages}
                    </button>
                </>
            )}

            <button
                disabled={page === totalPages}
                onClick={() => onPageChange(page + 1)}
                className={`p-2 rounded-lg border disabled:opacity-40 disabled:cursor-not-allowed transition-colors ${
                    user 
                        ? 'border-slate-300 text-slate-700 hover:bg-slate-100 bg-white shadow-sm' 
                        : 'border-white/10 text-white hover:bg-white/10'
                }`}
            >
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );
}

export default function JobSearch() {
    const [searchParams, setSearchParams] = useSearchParams();
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
    const [location, setLocation] = useState(searchParams.get('location') || '');
    const [selectedTypes, setSelectedTypes] = useState(() => {
        const t = searchParams.get('jobType');
        return t ? t.split(',') : [];
    });
    const [salaryRange, setSalaryRange] = useState(searchParams.get('salary') || '');
    const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
    const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

    const [jobs, setJobs] = useState([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [savedJobs, setSavedJobs] = useState([]);

    const [showLocationDrop, setShowLocationDrop] = useState(false);
    const [showSortDrop, setShowSortDrop] = useState(false);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    const buildQuery = useCallback((overrides = {}) => {
        const p = {
            keyword,
            location: location === 'Tất cả địa điểm' ? '' : location,
            jobType: selectedTypes.join(','),
            salary: salaryRange,
            sort,
            page,
            ...overrides,
        };
        const params = {};
        if (p.keyword) params.keyword = p.keyword;
        if (p.location) params.location = p.location;
        if (p.jobType) params.jobType = p.jobType;
        if (p.salary) params.salary = p.salary;
        if (p.sort !== 'newest') params.sort = p.sort;
        if (p.page > 1) params.page = p.page;
        return params;
    }, [keyword, location, selectedTypes, salaryRange, sort, page]);

    const fetchJobs = useCallback(async (overrides = {}) => {
        setLoading(true);
        try {
            const params = buildQuery(overrides);
            const apiParams = { ...params };

            // Convert salary range
            if (params.salary && params.salary !== 'negotiate') {
                const [mn, mx] = params.salary.split('-').map(Number);
                if (!isNaN(mn)) apiParams.salaryMin = mn;
                if (!isNaN(mx) && mx < 900) apiParams.salaryMax = mx;
                delete apiParams.salary;
            } else if (params.salary === 'negotiate') {
                apiParams.salaryMin = 0;
                apiParams.salaryMax = 0;
                delete apiParams.salary;
            }

            const res = await axios.get(`${API_URL}/api/jobs/search`, { params: apiParams });
            setJobs(res.data.data || []);
            setTotal(res.data.total || 0);
            setTotalPages(res.data.totalPages || 0);
        } catch (err) {
            console.error(err);
            setJobs([]);
        } finally {
            setLoading(false);
        }
    }, [buildQuery]);

    const fetchSavedJobsList = useCallback(async () => {
        if (!token) return;
        try {
            const res = await axios.get(`${API_URL}/api/jobs/saved`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const ids = (res.data.data || []).filter(j => j && typeof j === 'object' && j._id).map(j => j._id);
            setSavedJobs(ids);
        } catch (err) {
            console.error("Error fetching saved jobs ids:", err);
        }
    }, [token]);

    useEffect(() => {
        fetchJobs();
        fetchSavedJobsList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, sort, selectedTypes, salaryRange]);

    const handleSearch = () => {
        setPage(1);
        const overrides = { page: 1 };
        setSearchParams(buildQuery(overrides));
        fetchJobs(overrides);
    };

    const handlePageChange = (p) => {
        setPage(p);
        setSearchParams(buildQuery({ page: p }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const toggleType = (value) => {
        setPage(1);
        setSelectedTypes(prev =>
            prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
        );
    };

    const toggleSave = async (id) => {
        if (!token) {
            navigate('/login');
            return;
        }
        try {
            const res = await axios.post(`${API_URL}/api/jobs/${id}/save`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.isSaved) {
                setSavedJobs(prev => [...prev, id]);
            } else {
                setSavedJobs(prev => prev.filter(v => v !== id));
            }
        } catch (err) {
            console.error("Error toggling save job:", err);
        }
    };

    const clearFilters = () => {
        setSelectedTypes([]);
        setSalaryRange('');
        setLocation('');
        setKeyword('');
        setPage(1);
        setSort('newest');
    };

    const hasFilters = selectedTypes.length > 0 || salaryRange || (location && location !== 'Tất cả địa điểm');

    const { user } = useAuth();
    const Wrapper = user 
        ? SeekerLayout 
        : ({ children }) => (
            <div 
                className="min-h-screen text-white relative overflow-hidden flex flex-col justify-between bg-cover bg-center bg-no-repeat bg-fixed"
                style={{ backgroundImage: `url(${siteImages.guestBg})` }}
            >
                {/* Premium backdrop-blur and dark-gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-zinc-950/70 to-black/90 backdrop-blur-[3px] pointer-events-none" />

                <div className="relative z-10 flex-1 flex flex-col justify-between">
                    <div>
                        <Header />
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                            {children}
                        </div>
                    </div>
                    <Footer />
                </div>
            </div>
        );

    return (
        <Wrapper title="Tìm việc làm" breadcrumb="Việc làm › Tìm kiếm">
            <div className={`rounded-2xl py-6 px-4 mb-6 border backdrop-blur-md shadow-xl ${
                user
                    ? 'bg-white/80 border-slate-200/60 text-slate-800'
                    : 'bg-white/10 border border-white/10 text-white'
            }`}>
                <div className="max-w-5xl mx-auto">
                    <h1 className={`text-2xl sm:text-3xl font-bold text-center mb-5 ${user ? 'text-slate-800' : 'text-white'}`}>
                        Tìm kiếm công việc mơ ước của bạn
                    </h1>

                    {/* Search Bar */}
                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Vị trí, kỹ năng, công ty..."
                                value={keyword}
                                onChange={e => setKeyword(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                className={`w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F5C518] ${
                                    user 
                                        ? 'border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 focus:ring-[#0A2463]/20 focus:border-[#F5C518]' 
                                        : 'border-white/10 bg-white/10 text-white placeholder:text-white/30'
                                }`}
                            />
                        </div>

                        {/* Location */}
                        <div className="relative sm:w-56">
                            <button
                                onClick={() => setShowLocationDrop(v => !v)}
                                className={`w-full flex items-center gap-2 px-3 py-2.5 border rounded-lg text-sm transition-colors ${
                                    user
                                        ? 'border-slate-300 bg-white text-slate-800 hover:border-[#F5C518]/30'
                                        : 'border-white/10 bg-white/10 text-white hover:border-[#F5C518]/30'
                                }`}
                            >
                                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <span className="flex-1 text-left truncate">
                                    {location || 'Tất cả địa điểm'}
                                </span>
                                <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            </button>
                            {showLocationDrop && (
                                <div className={`absolute top-full left-0 mt-1 w-full border rounded-xl shadow-lg z-30 py-1 backdrop-blur-md ${
                                    user 
                                        ? 'bg-white border-slate-200 text-slate-800 shadow-md' 
                                        : 'bg-slate-900/90 border-white/10 text-white'
                                }`}>
                                    {LOCATIONS.map(loc => (
                                        <button
                                            key={loc}
                                            onClick={() => { setLocation(loc === 'Tất cả địa điểm' ? '' : loc); setShowLocationDrop(false); }}
                                            className={`w-full text-left px-4 py-2 text-sm transition-colors ${(location === loc || (!location && loc === 'Tất cả địa điểm')) ? 'text-[#0A2463] font-bold' : ''} ${
                                                user 
                                                    ? 'hover:bg-slate-100 text-slate-700' 
                                                    : 'hover:bg-white/10 text-white/90'
                                            }`}
                                        >
                                            {loc}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleSearch}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-colors bg-[#F5C518] hover:bg-[#D4A800] text-[#0A2463]"
                        >
                            <Search className="w-4 h-4" />
                            Tìm kiếm
                        </button>
                    </div>

                    {/* Quick filter chips */}
                    <div className="flex flex-wrap gap-2 mt-4">
                        {[
                            { label: 'Toàn thời gian', key: 'full-time' },
                            { label: 'Làm từ xa', key: 'remote' },
                            { label: 'Thực tập', key: 'internship' },
                        ].map(chip => (
                            <button
                                key={chip.key}
                                onClick={() => toggleType(chip.key)}
                                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                                    selectedTypes.includes(chip.key)
                                        ? 'bg-[#F5C518] border-transparent text-[#0A2463]'
                                        : user
                                            ? 'bg-white border-slate-300 text-slate-600 hover:border-[#F5C518]/55 hover:text-[#0A2463]'
                                            : 'bg-white/10 border border-white/10 text-white/70 hover:border-[#F5C518]/30 hover:text-[#F5C518]'
                                }`}
                            >
                                {chip.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex gap-6">
                    {/* Sidebar */}
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <div className={`rounded-xl border p-5 sticky top-24 backdrop-blur-md shadow-xl ${
                            user 
                                ? 'bg-white/80 border-slate-200/60 text-slate-800' 
                                : 'bg-white/10 border-white/10 text-white'
                        }`}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className={`font-semibold flex items-center gap-2 ${user ? 'text-slate-800' : 'text-white'}`}>
                                    <SlidersHorizontal className="w-4 h-4 text-[#0A2463]" />
                                    Bộ lọc
                                </h3>
                                {hasFilters && (
                                    <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-600 transition-colors">
                                        Xóa tất cả
                                    </button>
                                )}
                            </div>

                            {/* Job Type */}
                            <div className="mb-5">
                                <h4 className={`text-sm font-semibold mb-3 flex items-center gap-1.5 ${user ? 'text-slate-700' : 'text-white'}`}>
                                    <Briefcase className="w-3.5 h-3.5" />
                                    Loại hình làm việc
                                </h4>
                                <div className="space-y-2.5">
                                    {JOB_TYPES.map(type => (
                                        <label key={type.value} className="flex items-center gap-2.5 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={selectedTypes.includes(type.value)}
                                                onChange={() => toggleType(type.value)}
                                                className="w-4 h-4 rounded border-gray-300 text-[#0A2463] focus:ring-[#0A2463] cursor-pointer"
                                            />
                                            <span className={`text-sm transition-colors ${user ? 'text-slate-600 group-hover:text-slate-900' : 'text-white/70 group-hover:text-white'}`}>
                                                {type.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className={`border-t my-4 ${user ? 'border-slate-200' : 'border-white/5'}`} />

                            {/* Salary */}
                            <div>
                                <h4 className={`text-sm font-semibold mb-3 ${user ? 'text-slate-700' : 'text-white'}`}>💰 Mức lương mong muốn</h4>
                                <div className="space-y-2.5">
                                    {SALARY_RANGES.map(range => (
                                        <label key={range.value} className="flex items-center gap-2.5 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="salary"
                                                value={range.value}
                                                checked={salaryRange === range.value}
                                                onChange={() => { setSalaryRange(range.value); setPage(1); }}
                                                className="w-4 h-4 border-gray-300 text-[#0A2463] focus:ring-[#0A2463] cursor-pointer"
                                            />
                                            <span className={`text-sm transition-colors ${user ? 'text-slate-600 group-hover:text-slate-900' : 'text-white/70 group-hover:text-white'}`}>
                                                {range.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                        {/* Results header */}
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                            <div className="flex items-center gap-3">
                                <p className={`text-sm ${user ? 'text-slate-600' : 'text-white/60'}`}>
                                    {loading ? (
                                        <span className="text-gray-400">Đang tìm kiếm...</span>
                                    ) : (
                                        <>
                                            <span className={`font-bold ${user ? 'text-[#0A2463]' : 'text-[#F5C518]'}`}>
                                                {total.toLocaleString()}
                                            </span>{' '}
                                            việc làm phù hợp
                                        </>
                                    )}
                                </p>
                                {/* Mobile filter btn */}
                                <button
                                    onClick={() => setMobileFiltersOpen(true)}
                                    className={`lg:hidden flex items-center gap-1 text-sm border px-2.5 py-1 rounded-lg transition-colors ${
                                        user 
                                            ? 'text-slate-700 border-slate-300 hover:bg-slate-100 bg-white' 
                                            : 'text-white border-white/10 hover:bg-white/10'
                                    }`}
                                >
                                    <SlidersHorizontal className="w-3.5 h-3.5" />
                                    Bộ lọc
                                </button>
                            </div>

                            <div className="flex items-center gap-3">
                                {hasFilters && (
                                    <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors">
                                        <X className="w-3 h-3" />
                                        Xóa bộ lọc
                                    </button>
                                )}
                                {/* Sort */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowSortDrop(v => !v)}
                                        className={`flex items-center gap-1.5 text-sm border px-3 py-1.5 rounded-lg transition-colors ${
                                            user
                                                ? 'text-slate-700 border-slate-300 bg-white hover:bg-slate-50'
                                                : 'text-white/80 border-white/10 bg-white/10 hover:bg-white/15 hover:border-white/20'
                                        }`}
                                    >
                                        Sắp xếp: <span className="font-medium">{sort === 'newest' ? 'Mới nhất' : 'Lương cao'}</span>
                                        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                                    </button>
                                    {showSortDrop && (
                                        <div className={`absolute right-0 top-full mt-1 border rounded-xl shadow-lg z-20 w-36 py-1 backdrop-blur-md ${
                                            user 
                                                ? 'bg-white border-slate-200 text-slate-800' 
                                                : 'bg-slate-900/90 border-white/10 text-white'
                                        }`}>
                                            {[{ value: 'newest', label: 'Mới nhất' }, { value: 'salary', label: 'Lương cao' }].map(opt => (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => { setSort(opt.value); setPage(1); setShowSortDrop(false); }}
                                                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                                                        user 
                                                            ? 'hover:bg-slate-100 text-slate-700' 
                                                            : 'hover:bg-white/10 text-white/90'
                                                    } ${sort === opt.value ? 'text-[#0A2463] font-bold' : ''}`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Active filter tags */}
                        {hasFilters && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {selectedTypes.map(t => (
                                    <span key={t} className={`inline-flex items-center gap-1 text-xs border px-2.5 py-1 rounded-full ${
                                        user
                                            ? 'bg-slate-100 text-slate-700 border-slate-200'
                                            : 'bg-white/10 text-white border border-white/10'
                                    }`}>
                                        {jobTypeLabel(t)}
                                        <button onClick={() => toggleType(t)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                                    </span>
                                ))}
                                {salaryRange && (
                                    <span key={salaryRange} className={`inline-flex items-center gap-1 text-xs border px-2.5 py-1 rounded-full ${
                                        user
                                            ? 'bg-slate-100 text-slate-700 border-slate-200'
                                            : 'bg-white/10 text-white border border-white/10'
                                    }`}>
                                        {SALARY_RANGES.find(r => r.value === salaryRange)?.label}
                                        <button onClick={() => setSalaryRange('')} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                                    </span>
                                )}
                                {location && (
                                    <span key={location} className={`inline-flex items-center gap-1 text-xs border px-2.5 py-1 rounded-full ${
                                        user
                                            ? 'bg-slate-100 text-slate-700 border-slate-200'
                                            : 'bg-white/10 text-white border border-white/10'
                                    }`}>
                                        📍 {location}
                                        <button onClick={() => setLocation('')} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Job list */}
                        {loading ? (
                            <div className="space-y-4">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className={`rounded-xl border p-5 animate-pulse ${
                                        user 
                                            ? 'bg-white/80 border-slate-200/60' 
                                            : 'bg-white/10 border border-white/10'
                                    }`}>
                                        <div className="flex gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex-shrink-0 ${user ? 'bg-slate-200' : 'bg-white/10'}`} />
                                            <div className="flex-1 space-y-3">
                                                <div className={`h-4 rounded w-2/3 ${user ? 'bg-slate-200' : 'bg-white/10'}`} />
                                                <div className={`h-3 rounded w-1/3 ${user ? 'bg-slate-200' : 'bg-white/10'}`} />
                                                <div className="flex gap-2">
                                                    <div className={`h-6 rounded-full w-24 ${user ? 'bg-slate-100' : 'bg-white/5'}`} />
                                                    <div className={`h-6 rounded-full w-20 ${user ? 'bg-slate-100' : 'bg-white/5'}`} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className={`rounded-xl border p-12 text-center ${
                                user 
                                    ? 'bg-white/80 border-slate-200/60 text-slate-800' 
                                    : 'bg-white/10 border border-white/10 text-white'
                            }`}>
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                                    user ? 'bg-slate-100' : 'bg-white/10'
                                }`}>
                                    <Search className={`w-7 h-7 ${user ? 'text-slate-400' : 'text-white/40'}`} />
                                </div>
                                <h3 className={`text-base font-semibold mb-1 ${user ? 'text-slate-800' : 'text-white'}`}>
                                    Không tìm thấy kết quả
                                </h3>
                                <p className={`text-sm mb-4 ${user ? 'text-slate-500' : 'text-white/60'}`}>
                                    Thử thay đổi từ khóa hoặc bộ lọc để tìm kiếm
                                </p>
                                <button 
                                    onClick={clearFilters} 
                                    className={`text-sm font-semibold ${user ? 'text-[#0A2463] hover:text-[#071A4A]' : 'text-[#F5C518] hover:text-[#D4A800]'}`}
                                >
                                    Xóa tất cả bộ lọc →
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {jobs.map(job => (
                                    <JobCard
                                        key={job._id}
                                        job={job}
                                        onToggleSave={toggleSave}
                                        saved={savedJobs.includes(job._id)}
                                    />
                                ))}
                            </div>
                        )}

                        <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
                    </div>
                </div>
            </div>

            {/* Mobile filter drawer */}
            {mobileFiltersOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
                    <div className="absolute right-0 top-0 bottom-0 w-72 bg-white overflow-y-auto p-5">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-semibold text-gray-900 text-base">Bộ lọc</h3>
                            <button onClick={() => setMobileFiltersOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                                <X className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>

                        <div className="mb-5">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Loại hình làm việc</h4>
                            <div className="space-y-2.5">
                                {JOB_TYPES.map(type => (
                                    <label key={type.value} className="flex items-center gap-2.5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedTypes.includes(type.value)}
                                            onChange={() => toggleType(type.value)}
                                            className="w-4 h-4 rounded border-gray-300 text-cyan-500 focus:ring-[#0A2463]"
                                        />
                                        <span className="text-sm text-gray-600">{type.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="border-t border-gray-100 my-4" />

                        <div className="mb-5">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Mức lương mong muốn</h4>
                            <div className="space-y-2.5">
                                {SALARY_RANGES.map(range => (
                                    <label key={range.value} className="flex items-center gap-2.5 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="salary-mobile"
                                            value={range.value}
                                            checked={salaryRange === range.value}
                                            onChange={() => { setSalaryRange(range.value); setPage(1); }}
                                            className="w-4 h-4 border-gray-300 text-cyan-500 focus:ring-[#0A2463]"
                                        />
                                        <span className="text-sm text-gray-600">{range.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2 mt-6">
                            <button onClick={() => { clearFilters(); setMobileFiltersOpen(false); }} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                                Xóa tất cả
                            </button>
                            <button onClick={() => setMobileFiltersOpen(false)} className="flex-1 py-2.5 bg-[#0A2463] text-white rounded-lg text-sm font-medium hover:bg-[#071A4A] transition-colors">
                                Áp dụng
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </Wrapper>
    );
}
