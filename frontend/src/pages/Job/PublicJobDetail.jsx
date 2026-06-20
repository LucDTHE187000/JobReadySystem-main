import { API_URL } from '@/config';
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
    MapPin, Clock, Heart, Share2, ChevronRight,
    Briefcase, Users, Calendar, Eye, Facebook,
    Loader2, AlertCircle, Globe, ExternalLink,
    CheckCircle2, Send, X, FileText, Mail,
    Phone, Upload, ArrowRight, DollarSign
} from 'lucide-react';
import Header from '../../components/ui/Header';
import Footer from '../../components/ui/Footer';
import { useAuth } from '../../contexts/AuthContext';
import { siteImages } from '../../config/siteImages';

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
    let { min, max, currency } = salary;
    if (!min && !max) return 'Thỏa thuận';
    const isVND = currency === 'VND' || !currency || currency.toUpperCase() === 'VND';
    const unit = isVND ? ' triệu VNĐ' : ` ${currency}`;
    if (isVND) {
        if (min >= 100000) min = min / 1000000;
        if (max >= 100000) max = max / 1000000;
    }
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
    if (avatar) return <img src={avatar} alt={company} className={`${sz} rounded-xl object-cover border border-white/20 flex-shrink-0`} />;
    const initials = (company || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
    return <div className={`${sz} ${color} rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0`}>{initials}</div>;
}

/* ─── Apply Modal ─── */
function ApplyModal({ job, user, onClose, onSuccess }) {
    const navigate = useNavigate();
    const backdropRef = useRef(null);
    const fileInputRef = useRef(null);

    const [cvInfo, setCvInfo] = useState(null);
    const [cvLoading, setCvLoading] = useState(true);
    const [uploadingCv, setUploadingCv] = useState(false);
    const [coverLetter, setCoverLetter] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState('form');
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
        if (!token) {
            setCvLoading(false);
            return;
        }
        axios.get(`${API_URL}/api/cv/my-cv`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                if (res.data && res.data.hasCVs && res.data.cvs.length > 0) {
                    const latest = res.data.cvs[res.data.cvs.length - 1];
                    setCvInfo({
                        resumeUrl: latest.filePath,
                        fileName: latest.fileName
                    });
                } else if (user?.resume) {
                    setCvInfo({
                        resumeUrl: user.resume,
                        fileName: 'CV của tôi'
                    });
                } else {
                    setCvInfo(null);
                }
            })
            .catch(() => setCvInfo(null))
            .finally(() => setCvLoading(false));
    }, [user]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            setErrorMsg('Chỉ chấp nhận tệp định dạng PDF.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setErrorMsg('Kích thước tệp phải nhỏ hơn 5MB.');
            return;
        }

        setErrorMsg('');
        setUploadingCv(true);

        const formData = new FormData();
        formData.append('cv', file);

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const res = await axios.post(`${API_URL}/api/cv/upload`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (res.data && res.data.cv) {
                setCvInfo({
                    resumeUrl: res.data.cv.filePath,
                    fileName: res.data.cv.fileName,
                });
            } else {
                setErrorMsg('Không nhận dạng được file vừa tải lên.');
            }
        } catch (err) {
            console.error(err);
            setErrorMsg(err.response?.data?.message || 'Không thể tải lên CV. Vui lòng thử lại.');
        } finally {
            setUploadingCv(false);
        }
    };

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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-6"
        >
            <div className="bg-[#0d1b3e]/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/10">
                    <h2 className="text-base font-bold text-white">Ứng tuyển công việc</h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {step === 'success' ? (
                    /* ── SUCCESS ── */
                    <div className="px-6 py-10 flex flex-col items-center text-center gap-4">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30">
                            <CheckCircle2 className="w-9 h-9 text-green-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white mb-1">Ứng tuyển thành công!</h3>
                            <p className="text-sm text-white/60 leading-relaxed">
                                Hồ sơ của bạn đã được gửi đến{' '}
                                <span className="font-semibold text-white/80">{companyName}</span>.
                                Nhà tuyển dụng sẽ liên hệ với bạn trong thời gian sớm nhất.
                            </p>
                        </div>
                        <div className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-left">
                            <p className="text-xs text-white/40 mb-1 font-semibold uppercase tracking-wide">Vị trí ứng tuyển</p>
                            <p className="text-sm font-bold text-white line-clamp-2">{job.title}</p>
                            <p className="text-xs text-cyan-400 mt-0.5">{companyName}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white rounded-xl font-semibold text-sm transition-all"
                        >
                            Đóng
                        </button>
                    </div>
                ) : (
                    /* ── FORM ── */
                    <div className="px-6 py-5 space-y-5">

                        {/* Job preview */}
                        <div className="flex gap-3 items-center bg-white/5 border border-white/10 rounded-xl p-3.5">
                            <CompanyLogo company={companyName} avatar={avatar} size="md" />
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-white line-clamp-2 leading-snug">{job.title}</p>
                                <p className="text-xs text-cyan-400 mt-0.5">{companyName}</p>
                                <div className="flex flex-wrap gap-2 mt-1.5">
                                    <span className="text-xs text-white/50 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {job.location?.city || 'Không xác định'}
                                    </span>
                                    <span className="text-xs font-medium text-[#F5C518] inline-flex items-center gap-1">
                                        <DollarSign className="w-3.5 h-3.5 flex-shrink-0" />
                                        {formatSalary(job.salary)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* User info */}
                        <div>
                            <p className="text-xs font-bold text-white/50 uppercase tracking-wide mb-2.5">Thông tin ứng viên</p>
                            <div className="border border-white/10 rounded-xl overflow-hidden divide-y divide-white/5">
                                <div className="flex items-center gap-3 px-4 py-3 bg-white/5">
                                    <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                        {userInitial}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">{user?.name}</p>
                                        <p className="text-xs text-white/40">Ứng viên</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 px-4 py-2.5">
                                    <Mail className="w-4 h-4 text-white/40 flex-shrink-0" />
                                    <span className="text-sm text-white/70">{user?.email}</span>
                                </div>
                                {user?.phone && (
                                    <div className="flex items-center gap-3 px-4 py-2.5">
                                        <Phone className="w-4 h-4 text-white/40 flex-shrink-0" />
                                        <span className="text-sm text-white/70">{user.phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* CV section */}
                        <div>
                            <p className="text-xs font-bold text-white/50 uppercase tracking-wide mb-2.5">CV của bạn</p>
                            
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                accept=".pdf"
                                className="hidden"
                            />

                            {cvLoading ? (
                                <div className="border border-white/10 rounded-xl p-4 flex items-center gap-3">
                                    <Loader2 className="w-4 h-4 animate-spin text-white/40" />
                                    <span className="text-sm text-white/40">Đang tải thông tin CV...</span>
                                </div>
                            ) : uploadingCv ? (
                                <div className="border border-cyan-500/20 bg-cyan-500/5 rounded-xl p-4 flex items-center gap-3">
                                    <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                                    <span className="text-sm text-cyan-300">Đang tải lên CV của bạn...</span>
                                </div>
                            ) : cvInfo?.resumeUrl ? (
                                <div className="border border-green-500/30 bg-green-500/10 rounded-xl p-4 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-9 h-9 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <FileText className="w-4 h-4 text-green-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-green-300 truncate">
                                                {cvInfo.fileName || 'CV của tôi'}
                                            </p>
                                            <p className="text-xs text-green-400/70 mt-0.5">CV đã sẵn sàng ✓</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-xs font-semibold text-cyan-300 bg-cyan-500/20 hover:bg-cyan-500/30 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0 flex items-center gap-1.5"
                                    >
                                        <Upload className="w-3.5 h-3.5" /> Thay đổi
                                    </button>
                                </div>
                            ) : (
                                <div className="border border-orange-500/30 bg-orange-500/10 rounded-xl p-4">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-orange-300">Chưa có CV</p>
                                            <p className="text-xs text-orange-400/70 mt-0.5 leading-relaxed mb-3">
                                                Tải lên CV để tăng cơ hội được nhà tuyển dụng chú ý.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300 bg-cyan-500/20 hover:bg-cyan-500/30 px-3.5 py-2 rounded-lg transition-colors"
                                            >
                                                <Upload className="w-3.5 h-3.5" />
                                                Tải lên CV ngay
                                                <ArrowRight className="w-3.5 h-3.5 ml-1" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Cover letter */}
                        <div>
                            <p className="text-xs font-bold text-white/50 uppercase tracking-wide mb-2.5">
                                Thư giới thiệu
                                <span className="text-white/30 font-normal normal-case ml-1">(không bắt buộc)</span>
                            </p>
                            <textarea
                                value={coverLetter}
                                onChange={e => setCoverLetter(e.target.value)}
                                placeholder="Giới thiệu bản thân và lý do bạn muốn ứng tuyển vị trí này..."
                                rows={4}
                                maxLength={1000}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 resize-none leading-relaxed"
                            />
                            <p className="text-right text-xs text-white/30 mt-1">{coverLetter.length}/1000</p>
                        </div>

                        {/* Error */}
                        {errorMsg && (
                            <div className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {errorMsg}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pb-1">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 border border-white/15 text-white/70 rounded-xl font-semibold text-sm hover:bg-white/5 hover:text-white transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
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
            className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer"
        >
            <div className="flex gap-3 items-start">
                <CompanyLogo company={company} avatar={recruiter.avatarUrl || recruiter.avatar} size="sm" />
                <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-white line-clamp-2 leading-snug">{job.title}</h4>
                    <p className="text-xs text-white/50 mt-0.5 truncate">{company}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="text-xs bg-cyan-500/15 text-cyan-400 px-2 py-0.5 rounded-full font-medium border border-cyan-500/20">
                            {formatSalary(job.salary)}
                        </span>
                        <span className="text-xs bg-white/5 text-white/50 px-2 py-0.5 rounded-full border border-white/10">
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
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            axios.get(`${API_URL}/api/jobs/saved`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => {
                const list = res.data.data || [];
                setSaved(list.some(j => j._id === jobId));
            })
            .catch(err => {
                console.error("Error checking saved job:", err);
                const localSaved = JSON.parse(localStorage.getItem('savedJobs') || '[]');
                setSaved(localSaved.includes(jobId));
            });
        } else {
            const saved = JSON.parse(localStorage.getItem('savedJobs') || '[]');
            setSaved(saved.includes(jobId));
        }
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

    const handleSave = async () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            try {
                const res = await axios.post(`${API_URL}/api/jobs/${jobId}/save`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSaved(res.data.isSaved);
            } catch (err) {
                console.error("Error saving job:", err);
            }
        } else {
            const list = JSON.parse(localStorage.getItem('savedJobs') || '[]');
            const next = saved ? list.filter(id => id !== jobId) : [...list, jobId];
            localStorage.setItem('savedJobs', JSON.stringify(next));
            setSaved(!saved);
        }
    };

    const handleOpenApply = () => {
        if (job && job.externalUrl) {
            window.open(job.externalUrl, '_blank', 'noopener,noreferrer');
            return;
        }
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
        <div
            className="min-h-screen text-white relative overflow-hidden bg-cover bg-center bg-no-repeat bg-fixed flex flex-col"
            style={{ backgroundImage: `url(${siteImages.guestBg})` }}
        >
            <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-zinc-950/70 to-black/90 backdrop-blur-[3px] pointer-events-none" />
            <Header />
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-cyan-400" />
                <p className="text-sm text-white/60">Đang tải chi tiết công việc...</p>
            </div>
            <Footer theme="dark" />
        </div>
    );

    if (error || !job) return (
        <div
            className="min-h-screen text-white relative overflow-hidden bg-cover bg-center bg-no-repeat bg-fixed flex flex-col"
            style={{ backgroundImage: `url(${siteImages.guestBg})` }}
        >
            <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-zinc-950/70 to-black/90 backdrop-blur-[3px] pointer-events-none" />
            <Header />
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 gap-4">
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center max-w-sm w-full backdrop-blur-md">
                    <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                    <p className="text-red-300 font-semibold">{error || 'Không tìm thấy công việc'}</p>
                    <button onClick={() => navigate('/jobs')} className="mt-4 text-sm text-cyan-400 hover:underline">← Quay lại tìm kiếm</button>
                </div>
            </div>
            <Footer theme="dark" />
        </div>
    );

    const recruiter = job.recruiterId || {};
    const companyName = recruiter.companyName || recruiter.name || 'Công ty';
    const avatar = recruiter.avatarUrl || recruiter.avatar || null;
    const descLines = parseLines(job.description);
    const reqLines = parseLines(job.requirements);
    const isOpen = job.status === 'open';

    return (
        <div
            className="min-h-screen text-white relative overflow-hidden bg-cover bg-center bg-no-repeat bg-fixed flex flex-col"
            style={{ backgroundImage: `url(${siteImages.guestBg})` }}
        >
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-zinc-950/70 to-black/90 backdrop-blur-[3px] pointer-events-none" />

            <Header />

            {/* Breadcrumb */}
            <div className="relative z-10 border-b border-white/10 py-3 px-4 bg-white/5 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto flex items-center gap-1.5 text-xs text-white/50 flex-wrap">
                    <Link to="/" className="hover:text-[#F5C518] transition-colors">Trang chủ</Link>
                    <ChevronRight className="w-3 h-3 text-white/30 flex-shrink-0" />
                    <Link to="/jobs" className="hover:text-[#F5C518] transition-colors">Tìm việc làm</Link>
                    <ChevronRight className="w-3 h-3 text-white/30 flex-shrink-0" />
                    <span className="text-white/80 font-medium truncate max-w-[200px]">{job.title}</span>
                </div>
            </div>

            <div className="relative z-10 flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">

                {/* Job header card */}
                <div className="bg-white/8 backdrop-blur-md rounded-2xl border border-white/15 p-5 sm:p-6 mb-5 shadow-xl">
                    <div className="flex gap-4 items-start">
                        <CompanyLogo company={companyName} avatar={avatar} size="lg" />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                                <div className="min-w-0">
                                    <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">{job.title}</h1>
                                    <p className="text-sm text-cyan-400 font-medium mt-1">{companyName}</p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                        onClick={handleOpenApply}
                                        disabled={!job?.externalUrl && (applyDone || !isOpen)}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                                            applyDone && !job?.externalUrl
                                                ? 'bg-green-500/80 text-white cursor-default'
                                                : !isOpen
                                                    ? 'bg-white/10 text-white/40 cursor-not-allowed'
                                                    : 'bg-gradient-to-r from-[#F5C518] to-[#D4A800] text-[#0A2463] shadow-md hover:scale-105 active:scale-95'
                                        }`}
                                    >
                                        {job?.externalUrl ? (
                                            <>
                                                <ExternalLink className="w-4 h-4" />
                                                Ứng tuyển nguồn ngoài {job.sourcePlatform ? `(${job.sourcePlatform})` : ''}
                                            </>
                                        ) : applyDone ? (
                                            <><CheckCircle2 className="w-4 h-4" /> Đã ứng tuyển</>
                                        ) : (
                                            <><Send className="w-4 h-4" /> Ứng tuyển ngay</>
                                        )}
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="p-2.5 rounded-xl border border-white/15 hover:border-red-400/50 hover:bg-red-500/10 transition-all"
                                    >
                                        <Heart className={`w-5 h-5 transition-colors ${saved ? 'fill-red-400 text-red-400' : 'text-white/50'}`} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3">
                                <span className="flex items-center gap-1.5 text-sm text-white/60">
                                    <MapPin className="w-4 h-4 text-white/40 flex-shrink-0" />
                                    {job.location?.city
                                        ? `${job.location.city}${job.location.country ? ', ' + job.location.country : ''}`
                                        : 'Không xác định'}
                                </span>
                                <span className="flex items-center gap-1.5 text-sm font-semibold text-[#F5C518]">
                                    <DollarSign className="w-4 h-4 flex-shrink-0" />
                                    {formatSalary(job.salary)}
                                </span>
                                <span className="flex items-center gap-1.5 text-sm text-white/50">
                                    <Clock className="w-4 h-4 text-white/40 flex-shrink-0" />
                                    {timeAgo(job.createdAt)}
                                </span>
                                <span className="flex items-center gap-1.5 text-sm text-white/50">
                                    <Eye className="w-4 h-4 text-white/40 flex-shrink-0" />
                                    {job.views || 0} lượt xem
                                </span>
                                <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${
                                    job.status === 'open'
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                }`}>
                                    {job.status === 'open' ? '🟢 Đang tuyển' : '🔴 Đã đóng'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {applyDone && (
                        <div className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-green-500/15 text-green-400 border border-green-500/30">
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
                        <div className="bg-white/8 backdrop-blur-md rounded-2xl border border-white/15 p-6 shadow-lg">
                            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                                <span className="w-1 h-5 bg-cyan-400 rounded-full"></span>
                                Mô tả công việc
                            </h2>
                            {descLines.length > 0 ? (
                                <ul className="space-y-2">
                                    {descLines.map((line, i) => (
                                        <li key={i} className="flex gap-2.5 text-sm text-white/75 leading-relaxed">
                                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0"></span>
                                            {line}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-white/40 italic">Chưa có mô tả chi tiết.</p>
                            )}
                        </div>

                        {/* Yêu cầu ứng viên */}
                        {reqLines.length > 0 && (
                            <div className="bg-white/8 backdrop-blur-md rounded-2xl border border-white/15 p-6 shadow-lg">
                                <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                                    <span className="w-1 h-5 bg-cyan-400 rounded-full"></span>
                                    Yêu cầu ứng viên
                                </h2>
                                <ul className="space-y-2">
                                    {reqLines.map((line, i) => (
                                        <li key={i} className="flex gap-2.5 text-sm text-white/75 leading-relaxed">
                                            <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                                            {line}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* CTA apply */}
                        {isOpen && !applyDone && (
                            <div className="bg-white/8 backdrop-blur-md rounded-2xl border border-white/15 p-6 shadow-lg">
                                <p className="text-sm text-white/60 mb-4 text-center">
                                    Quan tâm đến vị trí này? Ứng tuyển ngay để không bỏ lỡ cơ hội!
                                </p>
                                <button
                                    onClick={handleOpenApply}
                                    className="w-full py-3 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-[#F5C518] to-[#D4A800] text-[#0A2463] shadow-lg hover:scale-[1.02] active:scale-98"
                                >
                                    <Send className="w-5 h-5" /> Ứng tuyển ngay
                                </button>
                                {!user && (
                                    <p className="text-xs text-center text-white/40 mt-2">
                                        Chưa có tài khoản?{' '}
                                        <Link to="/register" className="text-cyan-400 hover:underline font-medium">Đăng ký miễn phí</Link>
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── RIGHT: sidebar ── */}
                    <div className="space-y-5">

                        {/* Thông tin chung */}
                        <div className="bg-white/8 backdrop-blur-md rounded-2xl border border-white/15 p-5 shadow-lg">
                            <h3 className="text-sm font-bold text-white mb-4">Thông tin chung</h3>
                            <div className="space-y-3.5">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-cyan-500/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-cyan-500/20">
                                        <Briefcase className="w-4 h-4 text-cyan-400" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-white/40 uppercase tracking-wide font-semibold">Hình thức</p>
                                        <p className="text-sm font-semibold text-white">{jobTypeLabel(job.jobType)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-[#F5C518]/15 rounded-xl flex items-center justify-center flex-shrink-0 border border-[#F5C518]/20">
                                        <DollarSign className="w-4 h-4 text-[#F5C518] flex-shrink-0" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-white/40 uppercase tracking-wide font-semibold">Mức lương</p>
                                        <p className="text-sm font-semibold text-white">{formatSalary(job.salary)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-purple-500/15 rounded-xl flex items-center justify-center flex-shrink-0 border border-purple-500/20">
                                        <Users className="w-4 h-4 text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-white/40 uppercase tracking-wide font-semibold">Đã ứng tuyển</p>
                                        <p className="text-sm font-semibold text-white">{job.applicationsCount || 0} người</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-orange-500/15 rounded-xl flex items-center justify-center flex-shrink-0 border border-orange-500/20">
                                        <Calendar className="w-4 h-4 text-orange-400" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-white/40 uppercase tracking-wide font-semibold">Ngày đăng</p>
                                        <p className="text-sm font-semibold text-white">
                                            {new Date(job.createdAt).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-blue-500/15 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-500/20">
                                        <MapPin className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-white/40 uppercase tracking-wide font-semibold">Địa điểm</p>
                                        <p className="text-sm font-semibold text-white">
                                            {job.location?.city
                                                ? `${job.location.city}${job.location.country ? ', ' + job.location.country : ''}`
                                                : 'Không xác định'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Thông tin công ty */}
                        <div className="bg-white/8 backdrop-blur-md rounded-2xl border border-white/15 p-5 shadow-lg">
                            <h3 className="text-sm font-bold text-white mb-4">Thông tin công ty</h3>
                            <div className="flex items-center gap-3 mb-3">
                                <CompanyLogo company={companyName} avatar={avatar} size="sm" />
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-white leading-snug">{companyName}</p>
                                    {recruiter.companyWebsite && (
                                        <a
                                            href={recruiter.companyWebsite.startsWith('http') ? recruiter.companyWebsite : `https://${recruiter.companyWebsite}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-xs text-cyan-400 hover:underline mt-0.5"
                                        >
                                            <Globe className="w-3 h-3" />
                                            {recruiter.companyWebsite}
                                            <ExternalLink className="w-2.5 h-2.5" />
                                        </a>
                                    )}
                                </div>
                            </div>

                            {recruiter.companyDescription ? (
                                <p className="text-xs text-white/60 leading-relaxed line-clamp-4">
                                    {recruiter.companyDescription}
                                </p>
                            ) : (
                                <p className="text-xs text-white/30 italic">Chưa có thông tin mô tả công ty.</p>
                            )}
                        </div>

                        {/* Chia sẻ */}
                        <div className="bg-white/8 backdrop-blur-md rounded-2xl border border-white/15 p-5 shadow-lg">
                            <h3 className="text-sm font-bold text-white mb-3">Chia sẻ việc làm</h3>
                            <div className="flex gap-2">
                                <a
                                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-medium transition-colors"
                                >
                                    <Facebook className="w-3.5 h-3.5" /> Facebook
                                </a>
                                <button
                                    onClick={handleShare}
                                    className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 rounded-lg text-xs font-medium transition-colors"
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
                            <h2 className="text-base font-bold text-white">Việc làm liên quan</h2>
                            <Link to="/jobs" className="text-xs text-cyan-400 hover:underline font-medium">Xem tất cả →</Link>
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
            <Footer theme="dark" />
        </div>
    );
}
