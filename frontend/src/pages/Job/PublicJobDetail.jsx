import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
    MapPin, Clock, Heart, Share2, ChevronRight,
    Briefcase, Users, Calendar, Eye, Facebook,
    Loader2, AlertCircle, Globe, ExternalLink,
    CheckCircle2, Send, X, FileText, Mail,
    Phone, Upload, ArrowRight
} from 'lucide-react';
import Header from '../../components/ui/Header';
import Footer from '../../components/ui/Footer';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

/* ---------- helpers ---------- */
function timeAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} ngày trước`;
    return `${Math.floor(diff / 2592000)} tháng trước`;
}

function formatSalary(salary) {
    if (!salary) return 'Thỏa thuận';
    const { min, max, currency } = salary;
    const unit = currency === 'VND' ? ' triệu VNĐ' : (currency || '');
    if (!min && !max) return 'Thỏa thuận';
    if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()}${unit}`;
    if (min) return `Từ ${min.toLocaleString()}${unit}`;
    if (max) return `Đến ${max.toLocaleString()}${unit}`;
    return 'Thỏa thuận';
}

function jobTypeLabel(t) {
    return { 'full-time': 'Toàn thời gian', 'part-time': 'Bán thời gian', remote: 'Làm từ xa', internship: 'Thực tập' }[t] || t;
}

function parseLines(text) {
    if (!text) return [];
    return text.split('\n').map(l => l.trim()).filter(Boolean);
}

function CompanyLogo({ company, avatar, size = 'lg' }) {
    const sz = size === 'lg' ? 'w-16 h-16 text-xl' : size === 'md' ? 'w-12 h-12 text-base' : 'w-10 h-10 text-sm';
    const colors = ['bg-cyan-500', 'bg-blue-600', 'bg-indigo-500', 'bg-purple-600', 'bg-pink-500', 'bg-orange-500'];
    const color = colors[(company || '').charCodeAt(0) % colors.length];
    if (avatar) return <img src={avatar} alt={company} className={`${sz} rounded-xl object-cover border border-gray-200 flex-shrink-0`} />;
    const initials = (company || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
    return <div className={`${sz} ${color} rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0`}>{initials}</div>;
}

/* ─── Apply Modal ─── */
function ApplyModal({ job, user, onClose, onSuccess }) {
    const navigate = useNavigate();
    const backdropRef = useRef(null);

    const [cvInfo, setCvInfo] = useState(null);
    const [cvLoading, setCvLoading] = useState(true);
    const [coverLetter, setCoverLetter] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState('form'); // 'form' | 'success'
    const [errorMsg, setErrorMsg] = useState('');

    const recruiter = job.recruiterId || {};
    const companyName = recruiter.companyName || recruiter.name || 'Công ty';
    const avatar = recruiter.avatarUrl || recruiter.avatar || null;

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        axios.get(`${API_URL}/api/cv/my-cv`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => setCvInfo(res.data))
            .catch(() => setCvInfo(null))
            .finally(() => setCvLoading(false));
    }, []);

    const handleSubmit = async () => {
        setErrorMsg('');
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            await axios.post(`${API_URL}/api/applications`, {
                jobId: job._id,
                resumeUrl: cvInfo?.resumeUrl || user?.resume || '',
                coverLetter: coverLetter.trim(),
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStep('success');
            onSuccess();
        } catch (err) {
            const msg = err.response?.data?.message || '';
            if (msg.toLowerCase().includes('rồi') || err.response?.status === 400) {
                setErrorMsg('Bạn đã ứng tuyển vị trí này rồi.');
            } else {
                setErrorMsg(msg || 'Ứng tuyển thất bại, vui lòng thử lại.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleBackdrop = (e) => {
        if (e.target === backdropRef.current) onClose();
    };

    const userInitial = (user?.name || '?')[0].toUpperCase();

    return (
        <div
            ref={backdropRef}
            onClick={handleBackdrop}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-6"
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
                    <h2 className="text-base font-bold text-gray-900">Ứng tuyển công việc</h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {step === 'success' ? (
                    /* ── SUCCESS ── */
                    <div className="px-6 py-10 flex flex-col items-center text-center gap-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-9 h-9 text-green-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Ứng tuyển thành công!</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Hồ sơ của bạn đã được gửi đến{' '}
                                <span className="font-semibold text-gray-700">{companyName}</span>.
                                Nhà tuyển dụng sẽ liên hệ với bạn trong thời gian sớm nhất.
                            </p>
                        </div>
                        <div className="w-full bg-gray-50 rounded-xl p-4 text-left">
                            <p className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wide">Vị trí ứng tuyển</p>
                            <p className="text-sm font-bold text-gray-800 line-clamp-2">{job.title}</p>
                            <p className="text-xs text-cyan-600 mt-0.5">{companyName}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-semibold text-sm transition-colors"
                        >
                            Đóng
                        </button>
                    </div>
                ) : (
                    /* ── FORM ── */
                    <div className="px-6 py-5 space-y-5">

                        {/* Job preview */}
                        <div className="flex gap-3 items-center bg-gray-50 rounded-xl p-3.5">
                            <CompanyLogo company={companyName} avatar={avatar} size="md" />
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">{job.title}</p>
                                <p className="text-xs text-cyan-600 mt-0.5">{companyName}</p>
                                <div className="flex flex-wrap gap-2 mt-1.5">
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {job.location?.city || 'Không xác định'}
                                    </span>
                                    <span className="text-xs font-medium text-cyan-700">
                                        💰 {formatSalary(job.salary)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* User info */}
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2.5">Thông tin ứng viên</p>
                            <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                                <div className="flex items-center gap-3 px-4 py-3">
                                    <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                        {userInitial}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                                        <p className="text-xs text-gray-400">Ứng viên</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 px-4 py-2.5">
                                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">{user?.email}</span>
                                </div>
                                {user?.phone && (
                                    <div className="flex items-center gap-3 px-4 py-2.5">
                                        <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        <span className="text-sm text-gray-700">{user.phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* CV section */}
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2.5">CV của bạn</p>
                            {cvLoading ? (
                                <div className="border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                    <span className="text-sm text-gray-400">Đang tải thông tin CV...</span>
                                </div>
                            ) : cvInfo?.resumeUrl ? (
                                <div className="border border-green-200 bg-green-50 rounded-xl p-4 flex items-center gap-3">
                                    <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <FileText className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-green-800 truncate">
                                            {cvInfo.fileName || 'CV của tôi'}
                                        </p>
                                        <p className="text-xs text-green-600 mt-0.5">CV đã sẵn sàng để gửi ✓</p>
                                    </div>
                                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                </div>
                            ) : (
                                <div className="border border-orange-200 bg-orange-50 rounded-xl p-4">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-orange-800">Chưa có CV</p>
                                            <p className="text-xs text-orange-600 mt-0.5 leading-relaxed">
                                                Tải lên CV để tăng cơ hội được nhà tuyển dụng chú ý.
                                            </p>
                                            <Link
                                                to="/cv-upload"
                                                target="_blank"
                                                className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-orange-700 bg-orange-100 hover:bg-orange-200 px-3 py-1.5 rounded-lg transition-colors"
                                            >
                                                <Upload className="w-3.5 h-3.5" />
                                                Tải lên CV ngay
                                                <ArrowRight className="w-3 h-3" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Cover letter */}
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2.5">
                                Thư giới thiệu
                                <span className="text-gray-400 font-normal normal-case ml-1">(không bắt buộc)</span>
                            </p>
                            <textarea
                                value={coverLetter}
                                onChange={e => setCoverLetter(e.target.value)}
                                placeholder="Giới thiệu bản thân và lý do bạn muốn ứng tuyển vị trí này..."
                                rows={4}
                                maxLength={1000}
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent resize-none leading-relaxed"
                            />
                            <p className="text-right text-xs text-gray-400 mt-1">{coverLetter.length}/1000</p>
                        </div>

                        {/* Error */}
                        {errorMsg && (
                            <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {errorMsg}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pb-1">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                            >
                                {submitting
                                    ? <><Loader2 className="w-4 h-4 animate-spin" />Đang gửi...</>
                                    : <><Send className="w-4 h-4" />Nộp hồ sơ</>
                                }
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function RelatedJobCard({ job }) {
    const navigate = useNavigate();
    const recruiter = job.recruiterId || {};
    const company = recruiter.companyName || recruiter.name || 'Công ty';
    return (
        <div
            onClick={() => navigate(`/jobs/${job._id}`)}
            className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-cyan-200 transition-all cursor-pointer"
        >
            <div className="flex gap-3 items-start">
                <CompanyLogo company={company} avatar={recruiter.avatarUrl || recruiter.avatar} size="sm" />
                <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">{job.title}</h4>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{company}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="text-xs bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-full font-medium">
                            {formatSalary(job.salary)}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {jobTypeLabel(job.jobType)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PublicJobDetail() {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [job, setJob] = useState(null);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saved, setSaved] = useState(false);
    const [applyDone, setApplyDone] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('savedJobs') || '[]');
        setSaved(saved.includes(jobId));
    }, [jobId]);

    useEffect(() => {
        window.scrollTo({ top: 0 });
        setApplyDone(false);
        setLoading(true);
        setError(null);
        axios.get(`${API_URL}/api/jobs/${jobId}`)
            .then(res => {
                setJob(res.data.job);
                setRelated(res.data.related || []);
            })
            .catch(err => setError(err.response?.data?.message || 'Không tải được dữ liệu'))
            .finally(() => setLoading(false));
    }, [jobId]);

    const handleSave = () => {
        const list = JSON.parse(localStorage.getItem('savedJobs') || '[]');
        const next = saved ? list.filter(id => id !== jobId) : [...list, jobId];
        localStorage.setItem('savedJobs', JSON.stringify(next));
        setSaved(!saved);
    };

    const handleOpenApply = () => {
        if (!user) {
            navigate(`/login?redirect=/jobs/${jobId}`);
            return;
        }
        setShowModal(true);
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-cyan-500" />
                <p className="text-sm text-gray-500">Đang tải chi tiết công việc...</p>
            </div>
            <Footer />
        </div>
    );

    if (error || !job) return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <div className="flex-1 flex flex-col items-center justify-center px-4 gap-4">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-sm w-full">
                    <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                    <p className="text-red-600 font-semibold">{error || 'Không tìm thấy công việc'}</p>
                    <button onClick={() => navigate('/jobs')} className="mt-4 text-sm text-cyan-600 hover:underline">← Quay lại tìm kiếm</button>
                </div>
            </div>
            <Footer />
        </div>
    );

    const recruiter = job.recruiterId || {};
    const companyName = recruiter.companyName || recruiter.name || 'Công ty';
    const avatar = recruiter.avatarUrl || recruiter.avatar || null;
    const descLines = parseLines(job.description);
    const reqLines = parseLines(job.requirements);
    const isOpen = job.status === 'open';

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200 py-3 px-4">
                <div className="max-w-6xl mx-auto flex items-center gap-1.5 text-xs text-gray-500 flex-wrap">
                    <Link to="/" className="hover:text-cyan-600 transition-colors">Trang chủ</Link>
                    <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <Link to="/jobs" className="hover:text-cyan-600 transition-colors">Tìm việc làm</Link>
                    <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-700 font-medium truncate max-w-[200px]">{job.title}</span>
                </div>
            </div>

            <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">

                {/* Job header card */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 mb-5 shadow-sm">
                    <div className="flex gap-4 items-start">
                        <CompanyLogo company={companyName} avatar={avatar} size="lg" />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                                <div className="min-w-0">
                                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">{job.title}</h1>
                                    <p className="text-sm text-cyan-600 font-medium mt-1">{companyName}</p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                        onClick={handleOpenApply}
                                        disabled={applyDone || !isOpen}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                                            applyDone
                                                ? 'bg-green-500 text-white cursor-default'
                                                : !isOpen
                                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                    : 'bg-cyan-500 hover:bg-cyan-600 text-white shadow-sm hover:shadow-md'
                                        }`}
                                    >
                                        {applyDone
                                            ? <><CheckCircle2 className="w-4 h-4" /> Đã ứng tuyển</>
                                            : <><Send className="w-4 h-4" /> Ứng tuyển ngay</>
                                        }
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="p-2.5 rounded-xl border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all"
                                    >
                                        <Heart className={`w-5 h-5 transition-colors ${saved ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3">
                                <span className="flex items-center gap-1.5 text-sm text-gray-600">
                                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    {job.location?.city
                                        ? `${job.location.city}${job.location.country ? ', ' + job.location.country : ''}`
                                        : 'Không xác định'}
                                </span>
                                <span className="flex items-center gap-1.5 text-sm font-semibold text-cyan-700">
                                    💰 {formatSalary(job.salary)}
                                </span>
                                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                                    <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    {timeAgo(job.createdAt)}
                                </span>
                                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                                    <Eye className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    {job.views || 0} lượt xem
                                </span>
                                <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${
                                    job.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                                }`}>
                                    {job.status === 'open' ? '🟢 Đang tuyển' : '🔴 Đã đóng'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {applyDone && (
                        <div className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-green-50 text-green-700 border border-green-200">
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                            Hồ sơ đã được gửi thành công! Nhà tuyển dụng sẽ liên hệ bạn sớm.
                        </div>
                    )}
                </div>

                {/* Main grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    {/* ── LEFT: main content ── */}
                    <div className="lg:col-span-2 space-y-5">

                        {/* Mô tả công việc */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-1 h-5 bg-cyan-500 rounded-full"></span>
                                Mô tả công việc
                            </h2>
                            {descLines.length > 0 ? (
                                <ul className="space-y-2">
                                    {descLines.map((line, i) => (
                                        <li key={i} className="flex gap-2.5 text-sm text-gray-700 leading-relaxed">
                                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0"></span>
                                            {line}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500 italic">Chưa có mô tả chi tiết.</p>
                            )}
                        </div>

                        {/* Yêu cầu ứng viên */}
                        {reqLines.length > 0 && (
                            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                                <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="w-1 h-5 bg-cyan-500 rounded-full"></span>
                                    Yêu cầu ứng viên
                                </h2>
                                <ul className="space-y-2">
                                    {reqLines.map((line, i) => (
                                        <li key={i} className="flex gap-2.5 text-sm text-gray-700 leading-relaxed">
                                            <CheckCircle2 className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                                            {line}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* CTA apply */}
                        {isOpen && !applyDone && (
                            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                                <p className="text-sm text-gray-600 mb-4 text-center">
                                    Quan tâm đến vị trí này? Ứng tuyển ngay để không bỏ lỡ cơ hội!
                                </p>
                                <button
                                    onClick={handleOpenApply}
                                    className="w-full py-3 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white shadow-sm hover:shadow-md"
                                >
                                    <Send className="w-5 h-5" /> Ứng tuyển ngay
                                </button>
                                {!user && (
                                    <p className="text-xs text-center text-gray-400 mt-2">
                                        Chưa có tài khoản?{' '}
                                        <Link to="/register" className="text-cyan-500 hover:underline font-medium">Đăng ký miễn phí</Link>
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── RIGHT: sidebar ── */}
                    <div className="space-y-5">

                        {/* Thông tin chung */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-900 mb-4">Thông tin chung</h3>
                            <div className="space-y-3.5">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-cyan-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Briefcase className="w-4 h-4 text-cyan-600" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold">Hình thức</p>
                                        <p className="text-sm font-semibold text-gray-800">{jobTypeLabel(job.jobType)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <span className="text-sm">💰</span>
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold">Mức lương</p>
                                        <p className="text-sm font-semibold text-gray-800">{formatSalary(job.salary)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Users className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold">Đã ứng tuyển</p>
                                        <p className="text-sm font-semibold text-gray-800">{job.applicationsCount || 0} người</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Calendar className="w-4 h-4 text-orange-500" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold">Ngày đăng</p>
                                        <p className="text-sm font-semibold text-gray-800">
                                            {new Date(job.createdAt).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold">Địa điểm</p>
                                        <p className="text-sm font-semibold text-gray-800">
                                            {job.location?.city
                                                ? `${job.location.city}${job.location.country ? ', ' + job.location.country : ''}`
                                                : 'Không xác định'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Thông tin công ty */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-900 mb-4">Thông tin công ty</h3>
                            <div className="flex items-center gap-3 mb-3">
                                <CompanyLogo company={companyName} avatar={avatar} size="sm" />
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-gray-900 leading-snug">{companyName}</p>
                                    {recruiter.companyWebsite && (
                                        <a
                                            href={recruiter.companyWebsite.startsWith('http') ? recruiter.companyWebsite : `https://${recruiter.companyWebsite}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-xs text-cyan-600 hover:underline mt-0.5"
                                        >
                                            <Globe className="w-3 h-3" />
                                            {recruiter.companyWebsite}
                                            <ExternalLink className="w-2.5 h-2.5" />
                                        </a>
                                    )}
                                </div>
                            </div>

                            {recruiter.companyDescription ? (
                                <p className="text-xs text-gray-600 leading-relaxed line-clamp-4">
                                    {recruiter.companyDescription}
                                </p>
                            ) : (
                                <p className="text-xs text-gray-400 italic">Chưa có thông tin mô tả công ty.</p>
                            )}
                        </div>

                        {/* Chia sẻ */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-900 mb-3">Chia sẻ việc làm</h3>
                            <div className="flex gap-2">
                                <a
                                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition-colors"
                                >
                                    <Facebook className="w-3.5 h-3.5" /> Facebook
                                </a>
                                <button
                                    onClick={handleShare}
                                    className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors"
                                >
                                    <Share2 className="w-3.5 h-3.5" />
                                    {copied ? 'Đã sao chép!' : 'Sao chép link'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related jobs */}
                {related.length > 0 && (
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-bold text-gray-900">Việc làm liên quan</h2>
                            <Link to="/jobs" className="text-xs text-cyan-600 hover:underline font-medium">Xem tất cả →</Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {related.map(j => <RelatedJobCard key={j._id} job={j} />)}
                        </div>
                    </div>
                )}
            </div>

            {showModal && (
                <ApplyModal
                    job={job}
                    user={user}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setApplyDone(true);
                        setTimeout(() => setShowModal(false), 2500);
                    }}
                />
            )}
            <Footer />
        </div>
    );
}
