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

                </div>
            </div>
        </div>
    );
}

