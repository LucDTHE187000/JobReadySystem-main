import SideBar from "../../components/SideBar";
import { useAuth } from '../../contexts/AuthContext';
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
    Search,
    Download,
    Plus,
    FileText,
    Mail,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Minus,
    X,
    Send,
    Trash2,
} from "lucide-react";

export default function ManageCandidates() {
    const { user } = useAuth();

    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [selectedJob, setSelectedJob] = useState("");
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [interviewDate, setInterviewDate] = useState("");

    // Contact candidate states
    const [contactCandidate, setContactCandidate] = useState(null);
    const [contactModalOpen, setContactModalOpen] = useState(false);
    const [emailSubject, setEmailSubject] = useState("");
    const [emailBody, setEmailBody] = useState("");
    const [sendingEmail, setSendingEmail] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);

    const handleContactClick = (candidate) => {
        const jobseeker = candidate.jobseekerId;
        if (!jobseeker || !jobseeker.email) {
            alert("Ứng viên không có thông tin email hợp lệ");
            return;
        }
        setContactCandidate(candidate);
        setEmailSubject(`Cơ hội việc làm từ ${user?.companyName || user?.name || "JobReady"}`);
        setEmailBody(`Chào ${jobseeker.name || "bạn"},\n\nChúng tôi đã xem qua hồ sơ ứng tuyển của bạn cho vị trí ${candidate.jobId?.title || ""} trên hệ thống JobReady và rất ấn tượng với kỹ năng/kinh nghiệm của bạn.\nChúng tôi muốn trao đổi thêm về các cơ hội việc làm tại công ty.\n\nTrân trọng,\n${user?.companyName || user?.name || "Bộ phận tuyển dụng"}`);
        setContactModalOpen(true);
        setIsMinimized(false);
    };

    const handleSendEmail = async (e) => {
        e.preventDefault();
        if (!contactCandidate || !contactCandidate.jobseekerId?.email) return;

        setSendingEmail(true);
        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
            await axios.post(`${API_URL}/api/users/candidates/contact`, {
                candidateEmail: contactCandidate.jobseekerId.email,
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

    useEffect(() => {
        if (!user) return;

        const fetchApplicants = async () => {
            try {
                const token = localStorage.getItem("token") || sessionStorage.getItem("token");
                if (!token) return;

                setLoading(true);
                console.log("token: ", token);

                const res = await axios.get(
                    "http://localhost:4000/api/applications/company/applicants",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setCandidates(res.data?.applicants || []);
            } catch (err) {
                console.error("Fetch applicants error:", err.response?.data || err);
            } finally {
                setLoading(false);
            }
        };

        fetchApplicants();
    }, [user]);



    // 🎯 Lấy danh sách vị trí duy nhất
    const jobOptions = useMemo(() => {
        const titles = candidates.map(c => c.jobId?.title);
        return [...new Set(titles)];
    }, [candidates]);

    // 🎯 Filter logic
    const filteredCandidates = useMemo(() => {
        return candidates.filter(c => {
            const matchSearch =
                c.jobseekerId?.name?.toLowerCase().includes(search.toLowerCase()) ||
                c.jobseekerId?.email?.toLowerCase().includes(search.toLowerCase());

            const matchStatus =
                selectedStatus === "" || c.status === selectedStatus;

            const matchJob =
                selectedJob === "" || c.jobId?.title === selectedJob;

            return matchSearch && matchStatus && matchJob;
        });
    }, [candidates, search, selectedStatus, selectedJob]);

    const getStatusColor = (status) => {
        switch (status) {
            case "pending":
                return "bg-blue-100 text-blue-600";
            case "interview":
                return "bg-yellow-100 text-yellow-600";
            case "accepted":
                return "bg-green-100 text-green-600";
            case "rejected":
                return "bg-red-100 text-red-600";
            default:
                return "bg-gray-100 text-gray-600";
        }
    };
    const openInterviewModal = (candidate) => {
        let formattedDate = "";

        if (candidate.interviewDate) {
            formattedDate = new Date(candidate.interviewDate)
                .toISOString()
                .slice(0, 16); // 👉 chỉ lấy YYYY-MM-DDTHH:mm
        }

        setSelectedCandidate({
            ...candidate,
            interviewDate: formattedDate,
        });
    };

    const handleUpdateStatus = async (appId, newStatus) => {
        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            if (!token) {
                alert("Bạn chưa đăng nhập");
                return;
            }

            await axios.put(
                `http://localhost:4000/api/applications/${appId}/status`,
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            alert("Cập nhật trạng thái thành công");
            setCandidates(prev =>
                prev.map(item =>
                    item._id === appId
                        ? { ...item, status: newStatus }
                        : item
                )
            );
        } catch (err) {
            console.error("Update status error:", err.response?.data || err);
            alert("Có lỗi xảy ra khi cập nhật trạng thái");
        }
    };


    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <SideBar profile={user} />

            <div className="p-6 bg-gray-100 min-h-screen w-full">

                {/* HEADER */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">
                        Quản lý ứng viên
                    </h1>
                    <p className="text-sm text-gray-500">
                        Tổng cộng{" "}
                        <span className="text-blue-600 font-semibold">
                            {filteredCandidates.length}
                        </span>{" "}
                        ứng viên
                    </p>
                </div>

                {/* FILTER */}
                <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
                    <div className="grid grid-cols-4 gap-4">

                        <input
                            type="text"
                            placeholder="Tìm theo tên hoặc email..."
                            className="col-span-2 px-4 py-2 border rounded-lg"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        <select
                            className="border rounded-lg px-3 py-2"
                            value={selectedJob}
                            onChange={(e) => setSelectedJob(e.target.value)}
                        >
                            <option value="">Tất cả vị trí</option>
                            {jobOptions.map((title, i) => (
                                <option key={i} value={title}>
                                    {title}
                                </option>
                            ))}
                        </select>

                        <select
                            className="border rounded-lg px-3 py-2"
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="pending">Pending</option>
                            <option value="interview">Interview</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                {/* TABLE */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                            <tr>
                                <th className="text-left p-4">Họ tên</th>
                                <th className="text-left p-4">Vị trí</th>
                                <th className="text-left p-4">Ngày nộp</th>
                                <th className="text-left p-4">Ngày phỏng vấn</th>
                                <th className="text-left p-4">Trạng thái</th>
                                <th className="text-left p-4">Action</th>

                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="p-6 text-center">
                                        Đang tải...
                                    </td>
                                </tr>
                            ) : filteredCandidates.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-6 text-center">
                                        Không có dữ liệu
                                    </td>
                                </tr>
                            ) : (
                                filteredCandidates.map((c) => (
                                    <tr key={c._id} className="border-t hover:bg-gray-50">
                                        <td className="p-4">
                                            <div>
                                                <p className="font-medium">
                                                    {c.jobseekerId?.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {c.jobseekerId?.email}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="p-4">
                                            {c.jobId?.title}
                                        </td>
                                        <td className="p-4 text-gray-500">
                                            {c.appliedAt
                                                ? new Date(c.appliedAt).toLocaleDateString("vi-VN")
                                                : "—"}
                                        </td>
                                        <td className="p-4 text-gray-500">
                                            {c.interviewDate
                                                ? new Date(c.interviewDate).toLocaleDateString("vi-VN")
                                                : "—"}
                                        </td>

                                        <td className="p-4">
                                            <span
                                                className={`px-3 py-1 text-xs rounded-full ${getStatusColor(
                                                    c.status
                                                )}`}
                                            >
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">

                                                {/* XEM CV */}
                                                {c.resumeUrl ? (
                                                    <a
                                                        href={c.resumeUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition"
                                                    >
                                                        <FileText size={14} />
                                                        CV
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">No CV</span>
                                                )}

                                                {/* XẾP LỊCH PHỎNG VẤN */}
                                                <button
                                                    onClick={() => openInterviewModal(c)}
                                                    className="inline-flex items-center gap-1 px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition"
                                                >
                                                    <Calendar size={14} />
                                                    Hẹn phỏng vấn
                                                </button>

                                                {/* LIÊN HỆ GỬI MAIL */}
                                                <button
                                                    onClick={() => handleContactClick(c)}
                                                    className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition"
                                                    title="Gửi email liên hệ"
                                                >
                                                    <Mail size={14} />
                                                    Liên hệ
                                                </button>

                                                {/* CẬP NHẬT TRẠNG THÁI */}
                                                <select
                                                    value={c.status}
                                                    onChange={(e) => handleUpdateStatus(c._id, e.target.value)}
                                                    className="px-2 py-1 text-xs border rounded-lg bg-white outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer font-medium"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="interview">Interview</option>
                                                    <option value="accepted">Accepted</option>
                                                    <option value="rejected">Rejected</option>
                                                </select>

                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    {selectedCandidate && (
                        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                            <div className="bg-white rounded-xl p-6 w-96 shadow-lg relative">

                                {/* Nút X đóng modal */}
                                <button
                                    onClick={() => setSelectedCandidate(null)}
                                    className="absolute top-3 right-3 text-gray-500 hover:text-black text-lg"
                                >
                                    ✕
                                </button>

                                <h2 className="text-lg font-semibold mb-4">
                                    Xếp lịch phỏng vấn
                                </h2>

                                <p className="text-sm text-gray-600 mb-2">
                                    Ứng viên: {selectedCandidate.jobseekerId?.name}
                                </p>

                                <input
                                    type="datetime-local"
                                    className="w-full border rounded-lg px-3 py-2 mb-4"
                                    value={selectedCandidate.interviewDate || ""}
                                    onChange={(e) =>
                                        setSelectedCandidate({
                                            ...selectedCandidate,
                                            interviewDate: e.target.value,
                                        })
                                    }
                                />
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={async () => {
                                            try {
                                                const token = localStorage.getItem("token") || sessionStorage.getItem("token");
                                                if (!token) {
                                                    alert("Bạn chưa đăng nhập");
                                                    return;
                                                }

                                                await axios.put(
                                                    `http://localhost:4000/api/applications/${selectedCandidate._id}/interview`,
                                                    {
                                                        interviewDate: selectedCandidate.interviewDate,
                                                    },
                                                    {
                                                        headers: {
                                                            Authorization: `Bearer ${token}`,
                                                        },
                                                    }
                                                );

                                                alert("Đã xếp lịch thành công");

                                                setCandidates(prev =>
                                                    prev.map(item =>
                                                        item._id === selectedCandidate._id
                                                            ? {
                                                                ...item,
                                                                status: "interview",
                                                                interviewDate: selectedCandidate.interviewDate
                                                            }
                                                            : item
                                                    )
                                                );

                                                setSelectedCandidate(null);

                                            } catch (err) {
                                                console.error(err.response?.data || err);
                                                alert("Có lỗi xảy ra");
                                            }
                                        }}
                                        className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600"
                                    >
                                        Lưu
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Gmail-style Compose Email Modal */}
                    {contactModalOpen && contactCandidate && contactCandidate.jobseekerId && (
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
                                            {contactCandidate.jobseekerId.name} &lt;{contactCandidate.jobseekerId.email}&gt;
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
            </div>
        </div>
    );
}

