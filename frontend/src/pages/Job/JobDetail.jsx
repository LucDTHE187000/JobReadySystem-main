import { API_URL } from '@/config';
import SideBar from "../../components/SideBar";
import { useAuth } from '../../contexts/AuthContext';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Briefcase, Mail, Phone, FileText, Calendar, Loader2,
    ArrowLeft, MapPin, DollarSign, Clock, CheckCircle,
    Eye, ChevronRight, UserCheck
} from 'lucide-react';

const JobDetail = () => {
    const { user } = useAuth();
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);



    useEffect(() => {
        const fetchJobAndApplicants = async () => {
            try {
                setLoading(true);

                const token = localStorage.getItem("token") || sessionStorage.getItem("token");

                const response = await axios.get(
                    `${API_URL}/api/jobs/job-applications/${jobId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setData(response.data);
            } catch (err) {
                setError(err.response?.data?.message || "Không thể tải dữ liệu công việc");
            } finally {
                setLoading(false);
            }
        };

        if (jobId) fetchJobAndApplicants();
    }, [jobId]);

    const handleToggleStatus = async () => {
        try {
            setUpdatingStatus(true);
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");

            const response = await axios.patch(
                `${API_URL}/api/jobs/${jobId}/toggle-status`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Update UI ngay lập tức
            setData(response.data.job);

        } catch (err) {
            alert("Không thể cập nhật trạng thái");
        } finally {
            setUpdatingStatus(false);
        }
    };


    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            <p className="mt-4 text-gray-500 font-medium animate-pulse">Đang tải chi tiết công việc...</p>
        </div>
    );

    if (error || !data) return (
        <div className="flex flex-col items-center justify-center min-h-screen p-10 text-center">
            <div className="bg-red-50 p-6 rounded-2xl">
                <p className="text-red-500 font-bold text-lg">{error || "Dữ liệu không tồn tại"}</p>
                <button onClick={() => navigate(-1)} className="mt-4 flex items-center justify-center w-full text-blue-600 font-semibold hover:underline">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại ngay
                </button>
            </div>
        </div>
    );



    return (
        <div 
            className="min-h-screen flex bg-cover bg-center bg-no-repeat bg-fixed relative"
            style={{ backgroundImage: `url('/background3.jpg')` }}
        >
            {/* Premium backdrop-blur and dark-gradient overlay */}
            <div className="absolute inset-0 bg-slate-950/30 backdrop-blur-[1px] pointer-events-none" />

            <div className="relative z-10 flex w-full">
                <SideBar profile={user} />

                <div className="flex-1 p-8 overflow-y-auto">
                    {/* Header & Back Button */}
                    <div className="flex items-center justify-between mb-8 bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-xl shadow-slate-900/5">
                        <button onClick={() => navigate(-1)} className="flex items-center text-slate-700 hover:text-indigo-600 transition-colors font-semibold text-sm">
                            <ArrowLeft className="w-5 h-5 mr-2 text-slate-600" /> Quay lại
                        </button>
                        <div className="flex gap-2">
                            <span className="text-xs text-slate-600 font-semibold bg-white/80 border border-slate-200 px-3 py-1.5 rounded-xl flex items-center shadow-sm">
                                <Eye className="w-3.5 h-3.5 mr-1.5 text-slate-500" /> {data.views || 0} lượt xem
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* CỘT TRÁI: THÔNG TIN CHI TIẾT */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-xl shadow-slate-900/5 border border-white/60">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-800">{data.title}</h1>
                                        <div className="flex items-center mt-3 gap-3">
                                            <span className="bg-indigo-50 border border-indigo-100/60 text-indigo-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                                {data.jobType?.replace('_', ' ')}
                                            </span>
                                            <span className={`flex items-center text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${data.status === 'open' ? 'bg-emerald-50 border-emerald-100/60 text-emerald-600 shadow-sm' : 'bg-red-50 border-red-100/60 text-red-600 shadow-sm'}`}>
                                                {data.status === 'open' ? 'Đang tuyển' : 'Đã đóng'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8 mt-10">
                                    <div>
                                        <h3 className="text-base font-bold text-slate-800 flex items-center mb-4 border-b border-slate-100 pb-2">
                                            <span className="w-1.5 h-6 bg-indigo-500 rounded-full mr-3"></span>
                                            Mô tả công việc
                                        </h3>
                                        <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-line pl-4 text-sm">
                                            {data.description}
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-base font-bold text-slate-800 flex items-center mb-4 border-b border-slate-100 pb-2">
                                            <span className="w-1.5 h-6 bg-indigo-500 rounded-full mr-3"></span>
                                            Yêu cầu ứng viên
                                        </h3>
                                        <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-line pl-4 text-sm">
                                            {data.requirements || "Không có yêu cầu cụ thể."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CỘT PHẢI: THÔNG TIN NHANH */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl shadow-slate-900/5 border border-white/60 sticky top-8">
                                <h3 className="text-slate-800 font-bold mb-6 flex items-center px-2 border-b border-slate-100 pb-3">
                                    Tóm tắt công việc
                                </h3>

                                <div className="space-y-1">
                                    <div className="flex items-center p-4 hover:bg-slate-50/60 rounded-xl transition-colors">
                                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mr-4 border border-emerald-100/60">
                                            <DollarSign className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Mức lương</p>
                                            <p className="text-sm font-bold text-slate-800">
                                                {data.salary?.min?.toLocaleString()} - {data.salary?.max?.toLocaleString()} {data.salary?.currency}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center p-4 hover:bg-slate-50/60 rounded-xl transition-colors">
                                        <div className="w-10 h-10 bg-indigo-50 border border-indigo-100/60 rounded-xl flex items-center justify-center mr-4">
                                            <MapPin className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Địa điểm</p>
                                            <p className="text-sm font-bold text-slate-800 leading-tight">
                                                {data.location?.city}, {data.location?.district}
                                            </p>
                                            <p className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-1">{data.location?.address}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center p-4 hover:bg-slate-50/60 rounded-xl transition-colors">
                                        <div className="w-10 h-10 bg-violet-50 border border-violet-100/60 rounded-xl flex items-center justify-center mr-4">
                                            <Calendar className="w-5 h-5 text-violet-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Ngày đăng</p>
                                            <p className="text-sm font-bold text-slate-800">
                                                {new Date(data.createdAt).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center p-4 hover:bg-slate-50/60 rounded-xl transition-colors">
                                        <div className="w-10 h-10 bg-amber-50 border border-amber-200/60 rounded-xl flex items-center justify-center mr-4">
                                            <Clock className="w-5 h-5 text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Hình thức</p>
                                            <p className="text-sm font-bold text-slate-800 capitalize">
                                                {data.jobType?.replace('_', ' ')}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* 🔥 BUTTON QUẢN LÝ TRẠNG THÁI */}
                                <button
                                    onClick={handleToggleStatus}
                                    disabled={updatingStatus}
                                    className={`w-full mt-6 py-3.5 rounded-xl font-semibold shadow-md transition-all flex items-center justify-center group ${data.status === 'open'
                                        ? 'bg-red-50 border border-red-150 text-red-600 hover:bg-red-100/80 shadow-sm'
                                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-100/25'
                                        } ${updatingStatus && "opacity-70 cursor-not-allowed"}`}
                                  >
                                    {updatingStatus ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Đang cập nhật...
                                        </>
                                    ) : (
                                        <>
                                            {data.status === 'open'
                                                ? 'Đóng tuyển dụng'
                                                : 'Mở lại tuyển dụng'}
                                            <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetail;