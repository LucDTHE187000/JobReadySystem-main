import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import SideBar from "../../components/SideBar";
import axios from "axios";
import {
    Search, User, Briefcase, BookOpen, Filter, X, ChevronLeft, ChevronRight, Mail, Trash2, Send, Minus
} from "lucide-react";

const EXPERIENCE_OPTIONS = [
    "Chưa có kinh nghiệm",
    "Dưới 1 năm",
    "1-2 năm",
    "2-3 năm",
    "3-5 năm",
    "Trên 5 năm",
];

const POPULAR_SKILLS = [
    "JavaScript", "Python", "Java", "React", "Node.js", "SQL",
    "Excel", "Marketing", "Design", "Figma", "Communication", "Leadership"
];

export default function CandidateSearch() {
    const { user } = useAuth();
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [search, setSearch] = useState("");
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [skillInput, setSkillInput] = useState("");
    const [experience, setExperience] = useState("");
    const [showFilters, setShowFilters] = useState(false);

    // Contact compose modal states
    const [contactModalOpen, setContactModalOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [emailSubject, setEmailSubject] = useState("");
    const [emailBody, setEmailBody] = useState("");
    const [sendingEmail, setSendingEmail] = useState(false);

    const fetchCandidates = useCallback(async () => {
        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            if (!token) return;
            setLoading(true);

            const params = { page, limit: 12 };
            if (search.trim()) params.search = search.trim();
            if (selectedSkills.length > 0) params.skills = selectedSkills.join(",");
            if (experience) params.experience = experience;

            const res = await axios.get("http://localhost:4000/api/users/candidates/search", {
                headers: { Authorization: `Bearer ${token}` },
                params,
            });

            setCandidates(res.data.candidates || []);
            setTotal(res.data.total || 0);
            setTotalPages(res.data.totalPages || 1);
        } catch (err) {
            console.error("Fetch candidates error:", err.response?.data || err);
        } finally {
            setLoading(false);
        }
    }, [search, selectedSkills, experience, page]);

    useEffect(() => {
        if (user) fetchCandidates();
    }, [user, fetchCandidates]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchCandidates();
    };

    const addSkill = (skill) => {
        if (!selectedSkills.includes(skill)) {
            setSelectedSkills(prev => [...prev, skill]);
            setPage(1);
        }
        setSkillInput("");
    };

    const removeSkill = (skill) => {
        setSelectedSkills(prev => prev.filter(s => s !== skill));
        setPage(1);
    };

    const clearFilters = () => {
        setSearch("");
        setSelectedSkills([]);
        setExperience("");
        setPage(1);
    };

    const handleContactClick = (candidate) => {
        setSelectedCandidate(candidate);
        setEmailSubject(`Cơ hội việc làm từ ${user?.companyName || user?.name || "JobReady"}`);
        setEmailBody(`Chào ${candidate.name},\n\nChúng tôi đã xem qua hồ sơ của bạn trên hệ thống JobReady và rất ấn tượng với kỹ năng/kinh nghiệm của bạn.\nChúng tôi muốn trao đổi thêm về các cơ hội việc làm tại công ty.\n\nTrân trọng,\n${user?.companyName || user?.name || "Bộ phận tuyển dụng"}`);
        setContactModalOpen(true);
        setIsMinimized(false);
    };

    const handleSendEmail = async (e) => {
        e.preventDefault();
        if (!selectedCandidate) return;

        setSendingEmail(true);
        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            await axios.post("http://localhost:4000/api/users/candidates/contact", {
                candidateEmail: selectedCandidate.email,
                subject: emailSubject,
                body: emailBody
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Đã gửi email liên hệ thành công!");
            setContactModalOpen(false);
        } catch (err) {
            console.error("Error sending contact email:", err);
            alert(err.response?.data?.message || "Không thể gửi email. Vui lòng thử lại sau.");
        } finally {
            setSendingEmail(false);
        }
    };

    const hasFilters = search || selectedSkills.length > 0 || experience;

    return (
        <div 
            className="min-h-screen flex bg-cover bg-center bg-no-repeat bg-fixed relative"
            style={{ backgroundImage: "url('/background3.jpg')" }}
        >
            {/* Premium backdrop-blur and overlay */}
            <div className="absolute inset-0 bg-slate-950/35 backdrop-blur-[1px] pointer-events-none" />

            <div className="relative z-10 flex w-full">
                <SideBar profile={user} />

                <main className="flex-1 p-6 lg:p-8 overflow-auto">
                    {/* Header */}
                    <div className="mb-8 bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-white/60 shadow-xl shadow-slate-900/5">
                        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-800 mb-1">
                            Tìm kiếm ứng viên
                        </h1>
                        <p className="text-sm text-slate-650 font-medium">
                            Tìm ứng viên phù hợp với vị trí tuyển dụng của bạn
                        </p>
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl shadow-slate-900/5 border border-white/60 p-5 mb-6">
                        <div className="flex gap-3 flex-wrap">
                            <div className="relative flex-1 min-w-[200px]">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Tìm theo tên hoặc kỹ năng..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm text-slate-800 font-medium placeholder:text-slate-400 bg-white/70 shadow-inner transition-all"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                                    showFilters 
                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100/30' 
                                        : 'border-slate-200/80 text-slate-700 bg-white/80 hover:bg-slate-50 shadow-sm'
                                }`}
                            >
                                <Filter size={16} />
                                Bộ lọc
                                {(selectedSkills.length > 0 || experience) && (
                                    <span className="ml-1 bg-indigo-100 text-indigo-800 text-xs font-semibold px-1.5 py-0.5 rounded-full shadow-sm">
                                        {selectedSkills.length + (experience ? 1 : 0)}
                                    </span>
                                )}
                            </button>

                            <button
                                type="submit"
                                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-100/30 transition-all duration-300"
                            >
                                Tìm kiếm
                            </button>

                            {hasFilters && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="flex items-center gap-1 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50/50 rounded-xl font-semibold transition-all"
                                >
                                    <X size={15} /> Xóa bộ lọc
                                </button>
                            )}
                        </div>

                        {/* Expanded Filters */}
                        {showFilters && (
                            <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                                {/* Skills */}
                                <div>
                                    <label className="text-sm font-semibold text-slate-750 mb-2 block">Kỹ năng</label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {selectedSkills.map(skill => (
                                            <span key={skill} className="flex items-center gap-1 px-3 py-1 bg-indigo-50/60 text-indigo-700 rounded-full text-xs font-semibold border border-indigo-100/80 shadow-sm">
                                                {skill}
                                                <button type="button" onClick={() => removeSkill(skill)}>
                                                    <X size={12} className="hover:text-indigo-900 transition-colors inline-block ml-1" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                        {POPULAR_SKILLS.filter(s => !selectedSkills.includes(s)).map(skill => (
                                            <button
                                                key={skill}
                                                type="button"
                                                onClick={() => addSkill(skill)}
                                                className="px-3 py-1 border border-slate-200 bg-white/60 rounded-full text-xs text-slate-650 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 font-medium shadow-sm transition-all"
                                            >
                                                + {skill}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        <input
                                            type="text"
                                            placeholder="Nhập kỹ năng khác..."
                                            value={skillInput}
                                            onChange={e => setSkillInput(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    if (skillInput.trim()) addSkill(skillInput.trim());
                                                }
                                            }}
                                            className="flex-1 px-3 py-1.5 border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 font-medium bg-white/70 shadow-inner"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => { if (skillInput.trim()) addSkill(skillInput.trim()); }}
                                            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-sm font-semibold transition-all shadow-sm"
                                        >
                                            Thêm
                                        </button>
                                    </div>
                                </div>

                                {/* Experience */}
                                <div>
                                    <label className="text-sm font-semibold text-slate-750 mb-2 block">Kinh nghiệm</label>
                                    <div className="flex flex-wrap gap-2">
                                        {EXPERIENCE_OPTIONS.map(opt => (
                                            <button
                                                key={opt}
                                                type="button"
                                                onClick={() => { setExperience(experience === opt ? "" : opt); setPage(1); }}
                                                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                                                    experience === opt 
                                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100/30' 
                                                        : 'border-slate-200 text-slate-650 bg-white/80 hover:bg-slate-50 shadow-sm'
                                                }`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>

                    {/* Results Count */}
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-slate-650 font-medium bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/60 shadow-lg shadow-slate-900/5">
                            Tìm thấy <span className="font-bold text-indigo-600 underline decoration-indigo-500/30">{total}</span> ứng viên
                        </p>
                    </div>

                    {/* Cards Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="bg-white/80 backdrop-blur-md rounded-2xl p-5 animate-pulse border border-white/60 shadow-xl shadow-slate-900/5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 bg-gray-200 rounded-full" />
                                        <div className="flex-1">
                                            <div className="h-4 bg-gray-200 rounded mb-1 w-3/4" />
                                            <div className="h-3 bg-gray-100 rounded w-1/2" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-3 bg-gray-100 rounded" />
                                        <div className="h-3 bg-gray-100 rounded w-4/5" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : candidates.length === 0 ? (
                        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/60 p-12 text-center shadow-xl shadow-slate-900/5">
                            <User size={48} className="text-slate-400 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-800 mb-1">Không tìm thấy ứng viên</h3>
                            <p className="text-sm text-slate-500 font-medium">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {candidates.map(c => (
                                <CandidateCard key={c._id} candidate={c} onContactClick={handleContactClick} />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-8">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-xl border border-slate-200 bg-white/80 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                                        page === i + 1 
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100/30' 
                                            : 'border border-slate-200 bg-white/80 hover:bg-slate-50 text-slate-700'
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 rounded-xl border border-slate-200 bg-white/80 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    )}
                </main>

                {/* Gmail-style Compose Email Modal */}
                {contactModalOpen && selectedCandidate && (
                    <div
                        className={`fixed bottom-0 right-4 lg:right-12 z-50 w-full max-w-lg bg-white/90 backdrop-blur-md rounded-t-2xl shadow-2xl border border-white/60 flex flex-col transition-all duration-300 ${
                            isMinimized ? "h-11" : "h-[450px]"
                        }`}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-4 py-2.5 rounded-t-2xl flex items-center justify-between cursor-pointer flex-shrink-0" onClick={() => setIsMinimized(!isMinimized)}>
                            <span className="font-semibold text-sm">Thư mới (Liên hệ ứng viên)</span>
                            <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                                <button
                                    onClick={() => setIsMinimized(!isMinimized)}
                                    className="text-white/80 hover:text-white p-0.5 rounded hover:bg-white/10"
                                    title="Thu nhỏ / Phóng to"
                                >
                                    <Minus size={16} />
                                </button>
                                <button
                                    onClick={() => setContactModalOpen(false)}
                                    className="text-white/80 hover:text-white p-0.5 rounded hover:bg-white/10"
                                    title="Đóng"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Form Body - Hidden when minimized */}
                        {!isMinimized && (
                            <form onSubmit={handleSendEmail} className="flex-1 flex flex-col overflow-hidden">
                                {/* To Field */}
                                <div className="flex items-center px-4 py-2.5 border-b border-slate-100 text-sm bg-slate-50/50">
                                    <span className="text-slate-500 font-semibold w-12 flex-shrink-0">Tới:</span>
                                    <div className="flex-1 bg-white/60 rounded-lg px-3 py-1 text-slate-700 font-semibold truncate border border-slate-200/80">
                                        {selectedCandidate.name} &lt;{selectedCandidate.email}&gt;
                                    </div>
                                </div>

                                {/* Subject Field */}
                                <div className="flex items-center px-4 py-2.5 border-b border-slate-100 text-sm">
                                    <span className="text-slate-500 font-semibold w-12 flex-shrink-0">Tiêu đề:</span>
                                    <input
                                        type="text"
                                        value={emailSubject}
                                        onChange={e => setEmailSubject(e.target.value)}
                                        placeholder="Nhập tiêu đề thư..."
                                        required
                                        className="flex-1 focus:outline-none text-slate-750 font-semibold bg-transparent"
                                    />
                                </div>

                                {/* Message Body */}
                                <div className="flex-1 px-4 py-3 overflow-auto bg-transparent">
                                    <textarea
                                        value={emailBody}
                                        onChange={e => setEmailBody(e.target.value)}
                                        placeholder="Nhập nội dung thư liên hệ..."
                                        required
                                        className="w-full h-full resize-none focus:outline-none text-slate-700 font-medium text-sm leading-relaxed bg-transparent"
                                    />
                                </div>

                                {/* Footer / Actions */}
                                <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="submit"
                                            disabled={sendingEmail}
                                            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-indigo-100/30 transition-all duration-300 disabled:opacity-50"
                                        >
                                            {sendingEmail ? "Đang gửi..." : (
                                                <>
                                                    Gửi <Send size={14} />
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setContactModalOpen(false)}
                                        className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 transition-colors"
                                        title="Hủy thư nháp"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function CandidateCard({ candidate, onContactClick }) {
    const initials = candidate.name?.split(" ").map(w => w[0]).slice(-2).join("").toUpperCase() || "?";
    const colors = ["bg-indigo-500", "bg-purple-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-sky-500"];
    const colorClass = colors[candidate.name?.charCodeAt(0) % colors.length] || "bg-indigo-500";

    return (
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/60 p-5 hover:shadow-xl hover:shadow-indigo-150/10 hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between h-[230px] shadow-sm">
            <div>
                {/* Avatar & Name */}
                <div className="flex items-center gap-3 mb-3">
                    {candidate.avatarUrl ? (
                        <img src={candidate.avatarUrl} alt={candidate.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm" />
                    ) : (
                        <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center text-white font-bold text-xs shadow-inner`}>
                            {initials}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 truncate text-sm">{candidate.name}</p>
                        <p className="text-xs text-slate-500 font-medium truncate">{candidate.email}</p>
                    </div>
                </div>

                {/* Experience */}
                {candidate.experience && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-650 font-medium mb-1.5">
                        <Briefcase size={12} className="text-slate-400 flex-shrink-0" />
                        <span className="truncate">{candidate.experience}</span>
                    </div>
                )}

                {/* Education */}
                {candidate.education && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-650 font-medium mb-2">
                        <BookOpen size={12} className="text-slate-400 flex-shrink-0" />
                        <span className="truncate">{candidate.education}</span>
                    </div>
                )}

                {/* Skills */}
                {candidate.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                        {candidate.skills.slice(0, 2).map(skill => (
                            <span key={skill} className="px-2 py-0.5 bg-indigo-50/60 text-indigo-700 rounded-full text-[9px] font-semibold border border-indigo-100/50">
                                {skill}
                            </span>
                        ))}
                        {candidate.skills.length > 2 && (
                            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[9px] font-semibold">
                                +{candidate.skills.length - 2}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Contact Button */}
            <button
                onClick={() => onContactClick(candidate)}
                className="w-full flex items-center justify-center gap-2 py-2 bg-white/90 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:border-indigo-500 hover:text-indigo-600 group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-violet-600 group-hover:text-white group-hover:border-transparent transition-all duration-300 shadow-sm"
            >
                <Mail size={13} />
                Liên hệ
            </button>
        </div>
    );
}
