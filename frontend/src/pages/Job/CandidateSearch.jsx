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
        <div className="flex min-h-screen bg-[#F4F6FB]">
            <SideBar profile={user} />

            <main className="flex-1 p-6 lg:p-8 overflow-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl lg:text-3xl font-bold text-[#0A2463] mb-1">
                        Tìm kiếm ứng viên
                    </h1>
                    <p className="text-sm text-[#5A6482]">
                        Tìm ứng viên phù hợp với vị trí tuyển dụng của bạn
                    </p>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-sm border border-[#DDE3F0] p-4 mb-6">
                    <div className="flex gap-3 flex-wrap">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Tìm theo tên hoặc kỹ năng..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-[#DDE3F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A2463] text-sm"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${showFilters ? 'bg-[#0A2463] text-white border-[#0A2463]' : 'border-[#DDE3F0] text-gray-600 hover:bg-gray-50'}`}
                        >
                            <Filter size={16} />
                            Bộ lọc
                            {(selectedSkills.length > 0 || experience) && (
                                <span className="ml-1 bg-[#F5C518] text-[#0A2463] text-xs font-bold px-1.5 py-0.5 rounded-full">
                                    {selectedSkills.length + (experience ? 1 : 0)}
                                </span>
                            )}
                        </button>

                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-[#0A2463] text-white rounded-xl text-sm font-semibold hover:bg-[#071A4A] transition-colors"
                        >
                            Tìm kiếm
                        </button>

                        {hasFilters && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="flex items-center gap-1 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                            >
                                <X size={15} /> Xóa bộ lọc
                            </button>
                        )}
                    </div>

                    {/* Expanded Filters */}
                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-[#DDE3F0] space-y-4">
                            {/* Skills */}
                            <div>
                                <label className="text-sm font-semibold text-gray-700 mb-2 block">Kỹ năng</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {selectedSkills.map(skill => (
                                        <span key={skill} className="flex items-center gap-1 px-3 py-1 bg-[#0A2463]/10 text-[#0A2463] rounded-full text-xs font-medium">
                                            {skill}
                                            <button type="button" onClick={() => removeSkill(skill)}>
                                                <X size={12} />
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
                                            className="px-3 py-1 border border-[#DDE3F0] rounded-full text-xs text-gray-600 hover:bg-[#0A2463] hover:text-white hover:border-[#0A2463] transition-colors"
                                        >
                                            + {skill}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex gap-2 mt-2">
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
                                        className="flex-1 px-3 py-1.5 border border-[#DDE3F0] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#0A2463]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => { if (skillInput.trim()) addSkill(skillInput.trim()); }}
                                        className="px-3 py-1.5 bg-[#0A2463] text-white rounded-lg text-sm"
                                    >
                                        Thêm
                                    </button>
                                </div>
                            </div>

                            {/* Experience */}
                            <div>
                                <label className="text-sm font-semibold text-gray-700 mb-2 block">Kinh nghiệm</label>
                                <div className="flex flex-wrap gap-2">
                                    {EXPERIENCE_OPTIONS.map(opt => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => { setExperience(experience === opt ? "" : opt); setPage(1); }}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${experience === opt ? 'bg-[#F5C518] text-[#0A2463] border-[#F5C518]' : 'border-[#DDE3F0] text-gray-600 hover:bg-gray-50'}`}
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
                    <p className="text-sm text-[#5A6482]">
                        Tìm thấy <span className="font-semibold text-[#0A2463]">{total}</span> ứng viên
                    </p>
                </div>

                {/* Cards Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-5 animate-pulse border border-[#DDE3F0]">
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
                    <div className="bg-white rounded-2xl border border-[#DDE3F0] p-12 text-center">
                        <User size={48} className="text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-1">Không tìm thấy ứng viên</h3>
                        <p className="text-sm text-gray-400">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
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
                            className="p-2 rounded-lg border border-[#DDE3F0] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setPage(i + 1)}
                                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === i + 1 ? 'bg-[#0A2463] text-white' : 'border border-[#DDE3F0] hover:bg-gray-50 text-gray-600'}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-2 rounded-lg border border-[#DDE3F0] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                )}
            </main>

            {/* Gmail-style Compose Email Modal */}
            {contactModalOpen && selectedCandidate && (
                <div
                    className={`fixed bottom-0 right-4 lg:right-12 z-50 w-full max-w-lg bg-white rounded-t-2xl shadow-2xl border border-gray-300 flex flex-col transition-all duration-300 ${
                        isMinimized ? "h-11" : "h-[450px]"
                    }`}
                >
                    {/* Header */}
                    <div className="bg-[#0A2463] text-white px-4 py-2.5 rounded-t-2xl flex items-center justify-between cursor-pointer flex-shrink-0" onClick={() => setIsMinimized(!isMinimized)}>
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
                            <div className="flex items-center px-4 py-2 border-b border-gray-200 text-sm">
                                <span className="text-gray-500 w-12 flex-shrink-0">Tới:</span>
                                <div className="flex-1 bg-gray-100 rounded px-2.5 py-1 text-gray-700 font-medium truncate">
                                    {selectedCandidate.name} &lt;{selectedCandidate.email}&gt;
                                </div>
                            </div>

                            {/* Subject Field */}
                            <div className="flex items-center px-4 py-2 border-b border-gray-200 text-sm">
                                <span className="text-gray-500 w-12 flex-shrink-0">Tiêu đề:</span>
                                <input
                                    type="text"
                                    value={emailSubject}
                                    onChange={e => setEmailSubject(e.target.value)}
                                    placeholder="Nhập tiêu đề thư..."
                                    required
                                    className="flex-1 focus:outline-none text-gray-800"
                                />
                            </div>

                            {/* Message Body */}
                            <div className="flex-1 px-4 py-3 overflow-auto">
                                <textarea
                                    value={emailBody}
                                    onChange={e => setEmailBody(e.target.value)}
                                    placeholder="Nhập nội dung thư liên hệ..."
                                    required
                                    className="w-full h-full resize-none focus:outline-none text-gray-800 text-sm leading-relaxed"
                                />
                            </div>

                            {/* Footer / Actions */}
                            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
                                <div className="flex items-center gap-3">
                                    <button
                                        type="submit"
                                        disabled={sendingEmail}
                                        className="flex items-center gap-2 px-5 py-2 bg-[#0A2463] text-white rounded-lg text-sm font-semibold hover:bg-[#071A4A] transition-colors disabled:opacity-50"
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
                                    className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 transition-colors"
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
    );
}

function CandidateCard({ candidate, onContactClick }) {
    const initials = candidate.name?.split(" ").map(w => w[0]).slice(-2).join("").toUpperCase() || "?";
    const colors = ["bg-blue-500", "bg-purple-500", "bg-green-500", "bg-orange-500", "bg-pink-500", "bg-teal-500"];
    const colorClass = colors[candidate.name?.charCodeAt(0) % colors.length] || "bg-blue-500";

    return (
        <div className="bg-white rounded-2xl border border-[#DDE3F0] p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group flex flex-col justify-between h-[230px]">
            <div>
                {/* Avatar & Name */}
                <div className="flex items-center gap-3 mb-3">
                    {candidate.avatarUrl ? (
                        <img src={candidate.avatarUrl} alt={candidate.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-[#DDE3F0]" />
                    ) : (
                        <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center text-white font-bold text-xs`}>
                            {initials}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#0A2463] truncate text-sm">{candidate.name}</p>
                        <p className="text-xs text-gray-400 truncate">{candidate.email}</p>
                    </div>
                </div>

                {/* Experience */}
                {candidate.experience && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
                        <Briefcase size={12} className="text-gray-400 flex-shrink-0" />
                        <span className="truncate">{candidate.experience}</span>
                    </div>
                )}

                {/* Education */}
                {candidate.education && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                        <BookOpen size={12} className="text-gray-400 flex-shrink-0" />
                        <span className="truncate">{candidate.education}</span>
                    </div>
                )}

                {/* Skills */}
                {candidate.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                        {candidate.skills.slice(0, 2).map(skill => (
                            <span key={skill} className="px-2 py-0.5 bg-[#0A2463]/8 text-[#0A2463] rounded-full text-[9px] font-medium border border-[#0A2463]/20">
                                {skill}
                            </span>
                        ))}
                        {candidate.skills.length > 2 && (
                            <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full text-[9px]">
                                +{candidate.skills.length - 2}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Contact Button */}
            <button
                onClick={() => onContactClick(candidate)}
                className="w-full flex items-center justify-center gap-2 py-2 bg-[#0A2463] text-white rounded-xl text-xs font-semibold hover:bg-[#071A4A] transition-colors group-hover:bg-[#F5C518] group-hover:text-[#0A2463]"
            >
                <Mail size={13} />
                Liên hệ
            </button>
        </div>
    );
}
