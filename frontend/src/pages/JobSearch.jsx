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
    const recruiter = job.recruiterId || {};
    const companyName = recruiter.companyName || recruiter.name || 'Công ty';
    const avatar = recruiter.avatarUrl || recruiter.avatar || null;

    return (
        <div
            className={`bg-white rounded-xl border p-4 sm:p-5 hover:shadow-md transition-shadow cursor-pointer ${job.isPremium ? 'border-orange-200 ring-1 ring-orange-100' : 'border-gray-200'}`}
            onClick={() => navigate(`/jobs/${job._id}`)}
        >
            <div className="flex gap-3 sm:gap-4 items-start">
                <CompanyAvatar company={companyName} avatar={avatar} />

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-base font-semibold text-gray-900 truncate hover:text-[#0A2463] transition-colors">
                                    {job.title}
                                </h3>
                                {job.isPremium && (
                                    <span className="text-xs bg-orange-100 text-orange-600 font-medium px-2 py-0.5 rounded-full flex-shrink-0">
                                        HOT
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 mt-0.5">{companyName}</p>
                        </div>
                        <button
                            onClick={e => { e.stopPropagation(); onToggleSave(job._id); }}
                            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                        >
                            <Heart
                                className={`w-5 h-5 transition-colors ${saved ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                            />
                        </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5">
                        <span className="flex items-center gap-1.5 text-sm font-medium text-[#0A2463] bg-[#F5C518]/15 px-2.5 py-1 rounded-full">
                            💰 {formatSalary(job.salary)}
                        </span>
                        <span className="flex items-center gap-1 text-sm text-gray-500">
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                            {job.location?.city
                                ? `${job.location.city}${job.location.country ? ', ' + job.location.country : ''}`
                                : 'Không xác định'}
                        </span>
                        <span className="flex items-center gap-1 text-sm text-gray-400">
                            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                            {timeAgo(job.createdAt)}
                        </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-3 flex-wrap">
                        <div className="flex flex-wrap gap-1.5">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
                                {jobTypeLabel(job.jobType)}
                            </span>
                            {job.requirements && job.requirements.split(',').slice(0, 2).map((req, i) => (
                                <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
                                    {req.trim()}
                                </span>
                            ))}
                        </div>
                        <button
                            onClick={e => { e.stopPropagation(); navigate(`/jobs/${job._id}`); }}
                            className="text-sm font-medium text-white bg-[#0A2463] hover:bg-[#071A4A] px-3.5 py-1.5 rounded-lg transition-colors flex-shrink-0"
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
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronLeft className="w-4 h-4" />
            </button>

            {left > 1 && (
                <>
                    <button onClick={() => onPageChange(1)} className="w-9 h-9 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">1</button>
                    {left > 2 && <span className="px-1 text-gray-400">…</span>}
                </>
            )}

            {pages.map(p => (
                <button
                    key={p}
                    onClick={() => onPageChange(p)}
                    className={`w-9 h-9 text-sm rounded-lg border transition-colors font-medium ${
                        p === page
                            ? 'bg-[#0A2463] border-cyan-500 text-white'
                            : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                >
                    {p}
                </button>
            ))}

            {right < totalPages && (
                <>
                    {right < totalPages - 1 && <span className="px-1 text-gray-400">…</span>}
                    <button onClick={() => onPageChange(totalPages)} className="w-9 h-9 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">{totalPages}</button>
                </>
            )}

            <button
                disabled={page === totalPages}
                onClick={() => onPageChange(page + 1)}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
            const ids = (res.data.data || []).filter(j => j).map(j => j._id);
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
            <div className="min-h-screen bg-[#F4F6FB] flex flex-col justify-between">
                <div>
                    <Header />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                        {children}
                    </div>
                </div>
                <Footer />
            </div>
        );

    return (
        <Wrapper title="Tìm việc làm" breadcrumb="Việc làm › Tìm kiếm">
            <div className="bg-white border border-[#DDE3F0] rounded-2xl py-6 px-4 mb-6">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-5">
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
                                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2463] focus:border-transparent"
                            />
                        </div>

                        {/* Location */}
                        <div className="relative sm:w-56">
                            <button
                                onClick={() => setShowLocationDrop(v => !v)}
                                className="w-full flex items-center gap-2 px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white hover:border-cyan-400 transition-colors"
                            >
                                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <span className="flex-1 text-left text-gray-700 truncate">
                                    {location || 'Tất cả địa điểm'}
                                </span>
                                <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            </button>
                            {showLocationDrop && (
                                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-30 py-1">
                                    {LOCATIONS.map(loc => (
                                        <button
                                            key={loc}
                                            onClick={() => { setLocation(loc === 'Tất cả địa điểm' ? '' : loc); setShowLocationDrop(false); }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${(location === loc || (!location && loc === 'Tất cả địa điểm')) ? 'text-[#0A2463] font-medium' : 'text-gray-700'}`}
                                        >
                                            {loc}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleSearch}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0A2463] hover:bg-[#071A4A] text-white rounded-lg font-medium text-sm transition-colors"
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
                                        ? 'bg-[#0A2463] border-cyan-500 text-white'
                                        : 'bg-white border-gray-300 text-gray-600 hover:border-cyan-400 hover:text-[#0A2463]'
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
                        <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                    <SlidersHorizontal className="w-4 h-4 text-cyan-500" />
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
                                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
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
                                                className="w-4 h-4 rounded border-gray-300 text-cyan-500 focus:ring-[#0A2463] cursor-pointer"
                                            />
                                            <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                                                {type.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t border-gray-100 my-4" />

                            {/* Salary */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-3">💰 Mức lương mong muốn</h4>
                                <div className="space-y-2.5">
                                    {SALARY_RANGES.map(range => (
                                        <label key={range.value} className="flex items-center gap-2.5 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="salary"
                                                value={range.value}
                                                checked={salaryRange === range.value}
                                                onChange={() => { setSalaryRange(range.value); setPage(1); }}
                                                className="w-4 h-4 border-gray-300 text-cyan-500 focus:ring-[#0A2463] cursor-pointer"
                                            />
                                            <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
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
                                <p className="text-sm text-gray-600">
                                    {loading ? (
                                        <span className="text-gray-400">Đang tìm kiếm...</span>
                                    ) : (
                                        <><span className="font-semibold text-gray-900">{total.toLocaleString()}</span> việc làm phù hợp</>
                                    )}
                                </p>
                                {/* Mobile filter btn */}
                                <button
                                    onClick={() => setMobileFiltersOpen(true)}
                                    className="lg:hidden flex items-center gap-1 text-sm text-[#0A2463] border border-cyan-200 px-2.5 py-1 rounded-lg hover:bg-cyan-50 transition-colors"
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
                                        className="flex items-center gap-1.5 text-sm text-gray-700 border border-gray-200 bg-white px-3 py-1.5 rounded-lg hover:border-gray-300 transition-colors"
                                    >
                                        Sắp xếp: <span className="font-medium">{sort === 'newest' ? 'Mới nhất' : 'Lương cao'}</span>
                                        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                                    </button>
                                    {showSortDrop && (
                                        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 w-36 py-1">
                                            {[{ value: 'newest', label: 'Mới nhất' }, { value: 'salary', label: 'Lương cao' }].map(opt => (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => { setSort(opt.value); setPage(1); setShowSortDrop(false); }}
                                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${sort === opt.value ? 'text-[#0A2463] font-medium' : 'text-gray-700'}`}
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
                                    <span key={t} className="inline-flex items-center gap-1 text-xs bg-cyan-50 text-cyan-700 border border-cyan-200 px-2.5 py-1 rounded-full">
                                        {jobTypeLabel(t)}
                                        <button onClick={() => toggleType(t)} className="hover:text-cyan-900"><X className="w-3 h-3" /></button>
                                    </span>
                                ))}
                                {salaryRange && (
                                    <span className="inline-flex items-center gap-1 text-xs bg-cyan-50 text-cyan-700 border border-cyan-200 px-2.5 py-1 rounded-full">
                                        {SALARY_RANGES.find(r => r.value === salaryRange)?.label}
                                        <button onClick={() => setSalaryRange('')} className="hover:text-cyan-900"><X className="w-3 h-3" /></button>
                                    </span>
                                )}
                                {location && (
                                    <span className="inline-flex items-center gap-1 text-xs bg-cyan-50 text-cyan-700 border border-cyan-200 px-2.5 py-1 rounded-full">
                                        📍 {location}
                                        <button onClick={() => setLocation('')} className="hover:text-cyan-900"><X className="w-3 h-3" /></button>
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Job list */}
                        {loading ? (
                            <div className="space-y-4">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 bg-gray-200 rounded-xl flex-shrink-0" />
                                            <div className="flex-1 space-y-3">
                                                <div className="h-4 bg-gray-200 rounded w-2/3" />
                                                <div className="h-3 bg-gray-200 rounded w-1/3" />
                                                <div className="flex gap-2">
                                                    <div className="h-6 bg-gray-100 rounded-full w-24" />
                                                    <div className="h-6 bg-gray-100 rounded-full w-20" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-7 h-7 text-gray-400" />
                                </div>
                                <h3 className="text-base font-semibold text-gray-900 mb-1">Không tìm thấy kết quả</h3>
                                <p className="text-sm text-gray-500 mb-4">Thử thay đổi từ khóa hoặc bộ lọc để tìm kiếm</p>
                                <button onClick={clearFilters} className="text-sm text-[#0A2463] hover:text-cyan-700 font-medium">
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
