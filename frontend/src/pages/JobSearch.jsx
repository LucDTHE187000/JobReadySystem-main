import { API_URL } from '@/config';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
    Search, MapPin, Heart, Clock, ChevronDown,
    ChevronLeft, ChevronRight, Briefcase, SlidersHorizontal, X, DollarSign
} from 'lucide-react';
import SeekerLayout from '../components/layout/SeekerLayout';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import { siteImages } from '../config/siteImages';

const JOB_TYPES = [
    { value: 'full-time', label: 'Toàn thời gian' },
    { value: 'part-time', label: 'Bán thời gian' },
    { value: 'internship', label: 'Thực tập' },
    { value: 'remote', label: 'Làm việc từ xa' },
];

const EXPERIENCE_LEVELS = [
    { value: '', label: 'Tất cả kinh nghiệm' },
    { value: 'intern', label: 'Thực tập / Fresher' },
    { value: 'junior', label: 'Dưới 1 năm / Junior' },
    { value: 'mid', label: '1 – 3 năm / Mid-level' },
    { value: 'senior', label: 'Trên 3 năm / Senior' },
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
                        <span className={`flex items-center gap-1 text-sm font-semibold px-2.5 py-1 rounded-full ${
                            user 
                                ? 'text-amber-700 bg-amber-50 border border-amber-100' 
                                : 'text-[#F5C518] bg-white/10'
                        }`}>
                            <DollarSign className="w-3.5 h-3.5 flex-shrink-0" />
                            {formatSalary(job.salary)}
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
                            {job.externalUrl && (
                                <span className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 ${
                                    user
                                        ? 'bg-cyan-50 text-cyan-600 border border-cyan-150'
                                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                }`}>
                                    🌐 {job.sourcePlatform || 'Nguồn ngoài'}
                                </span>
                            )}
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
                            onClick={e => {
                                e.stopPropagation();
                                if (job.externalUrl) {
                                    window.open(job.externalUrl, '_blank', 'noopener,noreferrer');
                                } else {
                                    navigate(`/jobs/${job._id}`);
                                }
                            }}
                            className="text-sm font-medium px-3.5 py-1.5 rounded-lg transition-colors flex-shrink-0 text-[#0A2463] bg-[#F5C518] hover:bg-[#D4A800]"
                        >
                            {job.externalUrl ? 'Ứng tuyển ngoài' : 'Ứng tuyển ngay'}
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

const PlatformIcon = ({ name }) => {
    if (name === 'TopCV') {
        return (
            <div className="w-12 h-12 rounded-xl bg-emerald-600 flex flex-col items-center justify-center text-white font-bold text-xs select-none shadow-md shadow-emerald-500/10">
                <span className="leading-none text-[9px]">top</span>
                <span className="text-[11px] text-emerald-300 font-extrabold leading-none mt-0.5">CV</span>
            </div>
        );
    }
    if (name === 'VietnamWorks') {
        return (
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex flex-col items-center justify-center text-white font-bold text-[9px] select-none shadow-md shadow-blue-500/10 uppercase tracking-tighter">
                <span className="leading-none text-[8px]">Vietnam</span>
                <span className="text-[9px] text-amber-300 font-extrabold leading-none mt-0.5">Works</span>
            </div>
        );
    }
    if (name === 'LinkedIn') {
        return (
            <div className="w-12 h-12 rounded-xl bg-[#0077B5] flex items-center justify-center text-white font-bold text-lg select-none shadow-md shadow-sky-500/10 font-sans">
                in
            </div>
        );
    }
    // ViecLam24h
    return (
        <div className="w-12 h-12 rounded-xl bg-orange-500 flex flex-col items-center justify-center text-white font-bold text-[8px] select-none shadow-md shadow-orange-500/10 uppercase tracking-wide">
            <span>Việc Làm</span>
            <span className="text-yellow-200 text-[10px] font-extrabold leading-none mt-0.5">24h</span>
        </div>
    );
};

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
    const [experience, setExperience] = useState(searchParams.get('experience') || '');
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
    const [searchTab, setSearchTab] = useState('internal');

    const recommendedPlatforms = useMemo(() => {
        const kw = (keyword || '').toLowerCase();
        const isIT = kw.includes('it') || kw.includes('developer') || kw.includes('lập trình') || kw.includes('software') || kw.includes('web') || kw.includes('front') || kw.includes('back') || kw.includes('node') || kw.includes('react') || kw.includes('java') || kw.includes('python') || kw.includes('data') || kw.includes('tech') || kw.includes('engineer') || kw.includes('ai') || kw.includes('cloud') || kw.includes('sư');
        const isMarketing = kw.includes('marketing') || kw.includes('seo') || kw.includes('content') || kw.includes('digital') || kw.includes('pr') || kw.includes('truyền thông');
        const isSales = kw.includes('sale') || kw.includes('bán hàng') || kw.includes('kinh doanh') || kw.includes('tư vấn') || kw.includes('chăm sóc');
        const isIntern = selectedTypes.includes('internship') || kw.includes('thực tập') || kw.includes('intern') || kw.includes('fresher') || experience === 'intern';
        const isPartTime = selectedTypes.includes('part-time') || kw.includes('bán thời gian') || kw.includes('parttime');
        const isRemote = selectedTypes.includes('remote') || kw.includes('remote') || kw.includes('từ xa');
        const isHighSalary = salaryRange === '30-999' || salaryRange === '20-30';
        const isSenior = experience === 'senior';
        const isMid = experience === 'mid';
        const isJunior = experience === 'junior';
        
        let topcvCity = '';
        if (location.includes('Hà Nội')) topcvCity = '1';
        else if (location.includes('TP. HCM') || location.includes('Hồ Chí Minh')) topcvCity = '2';
        else if (location.includes('Đà Nẵng')) topcvCity = '3';
        else if (location.includes('Hải Phòng')) topcvCity = '4';
        else if (location.includes('Cần Thơ')) topcvCity = '5';
        else if (location.includes('Bình Dương')) topcvCity = '6';
        else if (location.includes('Đồng Nai')) topcvCity = '7';

        let topcvSalary = '';
        if (salaryRange === '0-10') topcvSalary = '&salary_min=0&salary_max=10000000';
        else if (salaryRange === '10-20') topcvSalary = '&salary_min=10000000&salary_max=20000000';
        else if (salaryRange === '20-30') topcvSalary = '&salary_min=20000000&salary_max=30000000';
        else if (salaryRange === '30-999') topcvSalary = '&salary_min=30000000';

        let topcvExp = '';
        if (experience === 'intern') topcvExp = '&exp=1';
        else if (experience === 'junior') topcvExp = '&exp=2';
        else if (experience === 'mid') topcvExp = '&exp=4';
        else if (experience === 'senior') topcvExp = '&exp=5';

        let linkedinJt = '';
        if (selectedTypes.includes('full-time')) linkedinJt = '&f_JT=F';
        else if (selectedTypes.includes('part-time')) linkedinJt = '&f_JT=P';
        else if (selectedTypes.includes('internship')) linkedinJt = '&f_JT=I';

        let linkedinExp = '';
        if (experience === 'intern') linkedinExp = '&f_E=1';
        else if (experience === 'junior') linkedinExp = '&f_E=2';
        else if (experience === 'mid') linkedinExp = '&f_E=3';
        else if (experience === 'senior') linkedinExp = '&f_E=4';

        const locationQuery = location && location !== 'Tất cả địa điểm' ? ` ${location}` : '';
        const expLabel = EXPERIENCE_LEVELS.find(e => e.value === experience)?.label || '';
        const expQuery = expLabel && experience !== '' ? ` ${expLabel}` : '';
        const generalSearchKeyword = keyword || '';

        let platforms = [
            {
                name: 'TopCV',
                color: 'from-emerald-500 to-emerald-600',
                bgLight: 'bg-emerald-50/60 border-emerald-100 hover:border-emerald-300 text-emerald-800',
                bgDark: 'bg-emerald-950/20 border border-emerald-500/10 hover:border-emerald-500/30 text-emerald-300',
                desc: 'Mạng lưới tuyển dụng lớn nhất Việt Nam.',
                reasons: ['Kho việc làm dồi dào', 'Giao diện thân thiện'],
                baseScore: 75,
                searchUrl: `https://www.topcv.vn/viec-lam?keyword=${encodeURIComponent(generalSearchKeyword)}` + (topcvCity ? `&city=${topcvCity}` : '') + topcvSalary + topcvExp
            },
            {
                name: 'VietnamWorks',
                color: 'from-blue-500 to-blue-600',
                bgLight: 'bg-blue-50/60 border border-blue-100 hover:border-blue-300 text-blue-800',
                bgDark: 'bg-blue-950/20 border border-blue-500/10 hover:border-blue-500/30 text-blue-300',
                desc: 'Cổng thông tin việc làm trung & cao cấp uy tín.',
                reasons: ['Phù hợp nhân sự trung/cao cấp', 'Nhiều tập đoàn lớn'],
                baseScore: 70,
                searchUrl: `https://www.vietnamworks.com/tim-viec-lam?q=${encodeURIComponent(generalSearchKeyword + locationQuery + expQuery)}`
            },
            {
                name: 'LinkedIn',
                color: 'from-[#0077B5] to-sky-700',
                bgLight: 'bg-sky-50/60 border border-sky-100 hover:border-sky-300 text-sky-800',
                bgDark: 'bg-sky-950/20 border border-sky-500/10 hover:border-sky-500/30 text-sky-300',
                desc: 'Mạng xã hội nghề nghiệp toàn cầu.',
                reasons: ['Doanh nghiệp nước ngoài', 'Chuyên nghiệp & toàn cầu'],
                baseScore: 65,
                searchUrl: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(generalSearchKeyword)}` + (location ? `&location=${encodeURIComponent(location)}` : '&location=Vietnam') + linkedinJt + linkedinExp
            },
            {
                name: 'ViecLam24h',
                color: 'from-orange-500 to-orange-600',
                bgLight: 'bg-orange-50/60 border border-orange-100 hover:border-orange-300 text-orange-800',
                bgDark: 'bg-orange-950/20 border border-orange-500/10 hover:border-orange-500/30 text-orange-300',
                desc: 'Cổng việc làm phổ thông & văn phòng đa dạng.',
                reasons: ['Nhiều việc dịch vụ, bán hàng', 'Tuyển dụng nhanh'],
                baseScore: 60,
                searchUrl: `https://vieclam24h.vn/tim-kiem?keyword=${encodeURIComponent(generalSearchKeyword + locationQuery + expQuery)}`
            }
        ];

        platforms = platforms.map(p => {
            let score = p.baseScore;
            let reasons = [...p.reasons];

            if (p.name === 'LinkedIn') {
                if (isIT) {
                    score += 25;
                    reasons.unshift('Top 1 cho ngành Lập trình & CNTT');
                }
                if (isRemote) {
                    score += 20;
                    reasons.unshift('Phù hợp nhất cho làm việc từ xa (Remote)');
                }
                if (isHighSalary) {
                    score += 15;
                    reasons.push('Lượng việc làm lương cao dồi dào');
                }
                if (isSenior) {
                    score += 20;
                    reasons.unshift('Rất nhiều vị trí Senior & Lead nước ngoài');
                }
                if (isIntern) {
                    score -= 10;
                }
            }

            if (p.name === 'TopCV') {
                if (isIT || isMarketing || isSales) {
                    score += 15;
                    reasons.unshift('Rất nhiều việc IT, Marketing & Sales');
                }
                if (isIntern) {
                    score += 30;
                    reasons.unshift('Ưu việt cho Thực tập & Sinh viên mới ra trường');
                }
                if (isJunior) {
                    score += 20;
                    reasons.unshift('Nguồn tin phong phú cho Junior dưới 1 năm');
                }
                if (location && (location.includes('Hà Nội') || location.includes('TP. HCM'))) {
                    score += 10;
                    reasons.push(`Nhiều tin tuyển dụng tại ${location}`);
                }
            }

            if (p.name === 'VietnamWorks') {
                if (isHighSalary) {
                    score += 20;
                    reasons.unshift('Hàng đầu cho vị trí Senior & Quản lý');
                }
                if (isIT) {
                    score += 10;
                    reasons.push('Nhiều vị trí IT Tech Lead');
                }
                if (isSenior || isMid) {
                    score += 20;
                    reasons.unshift('Phù hợp nhân sự từ 2 năm kinh nghiệm trở lên');
                }
                if (isIntern) {
                    score -= 15;
                }
            }

            if (p.name === 'ViecLam24h') {
                if (isSales || (!isIT && kw.length > 0)) {
                    score += 15;
                    reasons.unshift('Tốt cho dịch vụ, bán hàng, văn phòng');
                }
                if (isPartTime) {
                    score += 25;
                    reasons.unshift('Nhiều việc part-time phổ thông');
                }
                if (isIntern) {
                    score += 15;
                    reasons.push('Nhiều việc làm thời vụ cho sinh viên');
                }
                if (isSenior) {
                    score -= 15;
                }
            }

            score = Math.min(99, Math.max(30, score));
            return { ...p, score, reasons: Array.from(new Set(reasons)).slice(0, 3) };
        });

        return platforms.sort((a, b) => b.score - a.score);
    }, [keyword, location, selectedTypes, salaryRange, experience]);

    const buildQuery = useCallback((overrides = {}) => {
        const p = {
            keyword,
            location: location === 'Tất cả địa điểm' ? '' : location,
            jobType: selectedTypes.join(','),
            salary: salaryRange,
            experience,
            sort,
            page,
            ...overrides,
        };
        const params = {};
        if (p.keyword) params.keyword = p.keyword;
        if (p.location) params.location = p.location;
        if (p.jobType) params.jobType = p.jobType;
        if (p.salary) params.salary = p.salary;
        if (p.experience) params.experience = p.experience;
        if (p.sort !== 'newest') params.sort = p.sort;
        if (p.page > 1) params.page = p.page;
        return params;
    }, [keyword, location, selectedTypes, salaryRange, experience, sort, page]);

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
    }, [page, sort, selectedTypes, salaryRange, experience]);

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
        setExperience('');
        setLocation('');
        setKeyword('');
        setPage(1);
        setSort('newest');
    };

    const hasFilters = selectedTypes.length > 0 || salaryRange || experience || (location && location !== 'Tất cả địa điểm');

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

                            {/* Experience */}
                            <div className="mb-5">
                                <h4 className={`text-sm font-semibold mb-3 flex items-center gap-1.5 ${user ? 'text-slate-700' : 'text-white'}`}>
                                    <Clock className="w-3.5 h-3.5" />
                                    Kinh nghiệm làm việc
                                </h4>
                                <div className="space-y-2.5">
                                    {EXPERIENCE_LEVELS.map(exp => (
                                        <label key={exp.value} className="flex items-center gap-2.5 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="experience"
                                                value={exp.value}
                                                checked={experience === exp.value}
                                                onChange={() => { setExperience(exp.value); setPage(1); }}
                                                className="w-4 h-4 border-gray-300 text-[#0A2463] focus:ring-[#0A2463] cursor-pointer"
                                            />
                                            <span className={`text-sm transition-colors ${user ? 'text-slate-600 group-hover:text-slate-900' : 'text-white/70 group-hover:text-white'}`}>
                                                {exp.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className={`border-t my-4 ${user ? 'border-slate-200' : 'border-white/5'}`} />

                            {/* Salary */}
                            <div>
                                <h4 className={`text-sm font-semibold mb-3 flex items-center gap-1.5 ${user ? 'text-slate-700' : 'text-white'}`}>
                                    <DollarSign className="w-4 h-4 flex-shrink-0 text-slate-500" />
                                    Mức lương mong muốn
                                </h4>
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
                        {/* Tab Switcher */}
                        <div className="flex border-b border-gray-200/60 dark:border-white/10 mb-6 gap-2">
                            <button
                                onClick={() => setSearchTab('internal')}
                                className={`pb-3 text-sm font-bold border-b-2 px-4 transition-colors ${
                                    searchTab === 'internal'
                                        ? 'border-[#F5C518] text-[#F5C518]'
                                        : user
                                            ? 'border-transparent text-slate-700 hover:text-[#0A2463]'
                                            : 'border-transparent text-zinc-300 hover:text-white'
                                }`}
                            >
                                Việc làm hệ thống ({total})
                            </button>
                            <button
                                onClick={() => setSearchTab('external')}
                                className={`pb-3 text-sm font-bold border-b-2 px-4 transition-colors ${
                                    searchTab === 'external'
                                        ? 'border-[#F5C518] text-[#F5C518]'
                                        : user
                                            ? 'border-transparent text-slate-700 hover:text-[#0A2463]'
                                            : 'border-transparent text-zinc-300 hover:text-white'
                                }`}
                            >
                                Đối tác liên kết (Ngoài hệ thống)
                            </button>
                        </div>

                        {searchTab === 'internal' ? (
                            <>
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
                                        {experience && (
                                            <span key={experience} className={`inline-flex items-center gap-1 text-xs border px-2.5 py-1 rounded-full ${
                                                user
                                                    ? 'bg-slate-100 text-slate-700 border-slate-200'
                                                    : 'bg-white/10 text-white border border-white/10'
                                            }`}>
                                                <Clock className="w-3 h-3 flex-shrink-0 text-slate-400" />
                                                {EXPERIENCE_LEVELS.find(e => e.value === experience)?.label}
                                                <button onClick={() => setExperience('')} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                                            </span>
                                        )}
                                        {location && (
                                            <span key={location} className={`inline-flex items-center gap-1 text-xs border px-2.5 py-1 rounded-full ${
                                                user
                                                    ? 'bg-slate-100 text-slate-700 border-slate-200'
                                                    : 'bg-white/10 text-white border border-white/10'
                                            }`}>
                                                <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
                                                {location}
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
                                    <div className={`rounded-xl border p-8 text-center ${
                                        user 
                                            ? 'bg-white/80 border-slate-200/60 text-slate-800' 
                                            : 'bg-white/10 border border-white/10 text-white'
                                    }`}>
                                        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 ${
                                            user ? 'bg-slate-100' : 'bg-white/10'
                                        }`}>
                                            <Search className={`w-6 h-6 ${user ? 'text-slate-400' : 'text-white/40'}`} />
                                        </div>
                                        <h3 className={`text-base font-semibold mb-1 ${user ? 'text-slate-800' : 'text-white'}`}>
                                            Không tìm thấy kết quả trong hệ thống
                                        </h3>
                                        <p className={`text-xs mb-4 ${user ? 'text-slate-500' : 'text-white/60'}`}>
                                            Thử thay đổi bộ lọc, hoặc xem qua các gợi ý tìm kiếm bên ngoài phù hợp nhất bên dưới:
                                        </p>
                                        
                                        <div className="border-t border-dashed my-6 border-gray-300/40" />

                                        <div className="text-left mt-2">
                                            <h4 className={`text-sm font-bold flex items-center gap-1.5 mb-3 ${user ? 'text-slate-700' : 'text-white'}`}>
                                                🌐 Đề xuất tìm kiếm trên đối tác liên kết
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {recommendedPlatforms.map((platform, idx) => {
                                                    const bgClass = user ? platform.bgLight : platform.bgDark;
                                                    return (
                                                        <div
                                                            key={platform.name}
                                                            className={`border rounded-xl p-4 flex flex-col justify-between transition-all hover:scale-[1.01] ${bgClass}`}
                                                        >
                                                            <div>
                                                                <div className="flex items-center justify-between gap-2 mb-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <PlatformIcon name={platform.name} />
                                                                        <div>
                                                                            <h5 className={`font-bold text-sm ${user ? 'text-slate-800' : 'text-white'}`}>
                                                                                {platform.name}
                                                                            </h5>
                                                                            <p className="text-[10px] text-amber-500 font-medium">
                                                                                ★ Phù hợp {platform.score}%
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                {/* Suitability score bar */}
                                                                <div className="w-full bg-gray-200/45 dark:bg-white/10 rounded-full h-1 mb-3 overflow-hidden">
                                                                    <div 
                                                                        className="bg-[#F5C518] h-1 rounded-full transition-all duration-500" 
                                                                        style={{ width: `${platform.score}%` }}
                                                                    />
                                                                </div>
                                                                <p className={`text-[11px] mb-3 leading-relaxed ${user ? 'text-slate-500' : 'text-white/70'}`}>
                                                                    {platform.desc}
                                                                </p>
                                                            </div>
                                                            <a
                                                                href={platform.searchUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="w-full inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-[#F5C518] hover:bg-[#D4A800] text-[#0A2463] font-bold text-xs rounded-lg shadow-sm transition-all"
                                                            >
                                                                🔍 Tìm trên {platform.name}
                                                            </a>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
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
                            </>
                        ) : (
                            <div className="space-y-6">
                                <div className={`rounded-xl border p-5 ${
                                    user 
                                        ? 'bg-white/80 border-slate-200/60 text-slate-800' 
                                        : 'bg-white/10 border border-white/10 text-white'
                                }`}>
                                    <div className="flex items-center justify-between flex-wrap gap-4">
                                        <div>
                                            <h3 className={`text-base font-bold flex items-center gap-2 ${user ? 'text-slate-800' : 'text-white'}`}>
                                                🌐 Tìm kiếm mở rộng trên Đối tác Tuyển dụng
                                            </h3>
                                            <p className={`text-xs mt-1 ${user ? 'text-slate-500' : 'text-white/60'}`}>
                                                Hệ thống AI đề xuất thứ tự các trang tuyển dụng lớn phù hợp nhất dựa trên bộ lọc của bạn.
                                            </p>
                                        </div>
                                        {hasFilters && (
                                            <div className={`text-xs px-3 py-1.5 rounded-lg border font-medium ${
                                                user ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-white/5 border-white/10 text-white/70'
                                            }`}>
                                                Bộ lọc đang áp dụng: <span className="font-semibold text-[#F5C518]">{keyword || 'Mọi vị trí'}</span>
                                                {location && <span> tại <span className="font-semibold text-[#F5C518]">{location}</span></span>}
                                                {experience && <span> - <span className="font-semibold text-[#F5C518]">{EXPERIENCE_LEVELS.find(e => e.value === experience)?.label}</span></span>}
                                                {salaryRange && <span> - Lương <span className="font-semibold text-[#F5C518]">{SALARY_RANGES.find(r => r.value === salaryRange)?.label}</span></span>}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {recommendedPlatforms.map((platform, idx) => {
                                        const bgClass = user ? platform.bgLight : platform.bgDark;
                                        return (
                                             <div
                                                key={platform.name}
                                                className={`border rounded-2xl p-5 flex flex-col justify-between transition-all hover:scale-[1.01] hover:shadow-md ${bgClass}`}
                                             >
                                                <div>
                                                    <div className="flex items-center justify-between gap-3 mb-2">
                                                        <div className="flex items-center gap-3">
                                                            <PlatformIcon name={platform.name} />
                                                            <div>
                                                                <h4 className={`font-bold text-base ${user ? 'text-slate-800' : 'text-white'}`}>
                                                                    {platform.name}
                                                                </h4>
                                                                <p className={`text-[11px] font-medium leading-none ${
                                                                    idx === 0
                                                                        ? 'text-emerald-500'
                                                                        : 'text-amber-500'
                                                                }`}>
                                                                    {idx === 0 ? '★ Khuyên dùng nhất' : `Xếp hạng #${idx + 1}`}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-xs bg-amber-500/10 text-[#F5C518] border border-[#F5C518]/20 px-2.5 py-1 rounded-full font-bold">
                                                                Phù hợp {platform.score}%
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Suitability score bar */}
                                                    <div className="w-full bg-gray-200/45 dark:bg-white/10 rounded-full h-1.5 mb-4 overflow-hidden">
                                                        <div 
                                                            className="bg-gradient-to-r from-[#F5C518] to-amber-500 h-1.5 rounded-full transition-all duration-500" 
                                                            style={{ width: `${platform.score}%` }}
                                                        />
                                                    </div>

                                                    <p className={`text-xs mb-4 leading-relaxed ${user ? 'text-slate-600' : 'text-white/70'}`}>
                                                        {platform.desc}
                                                    </p>

                                                    <div className="space-y-1.5 mb-5">
                                                        {platform.reasons.map((reason, i) => (
                                                            <div key={i} className="flex items-start gap-1.5 text-xs">
                                                                <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                                                                <span className={user ? 'text-slate-600' : 'text-white/80'}>{reason}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <a
                                                    href={platform.searchUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#F5C518] to-amber-500 hover:from-amber-500 hover:to-amber-600 text-[#0A2463] font-bold text-sm rounded-xl shadow-sm transition-all"
                                                >
                                                    🔍 Tìm việc trên {platform.name}
                                                </a>
                                            </div>
                                        );
                                    })}
                                </div>
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
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Kinh nghiệm làm việc</h4>
                            <div className="space-y-2.5">
                                {EXPERIENCE_LEVELS.map(exp => (
                                    <label key={exp.value} className="flex items-center gap-2.5 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="experience-mobile"
                                            value={exp.value}
                                            checked={experience === exp.value}
                                            onChange={() => { setExperience(exp.value); setPage(1); }}
                                            className="w-4 h-4 border-gray-300 text-[#0A2463] focus:ring-[#0A2463]"
                                        />
                                        <span className="text-sm text-gray-600">{exp.label}</span>
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
