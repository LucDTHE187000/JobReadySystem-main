import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import {
    Upload, FileText, Trash2,
    CheckCircle, AlertCircle, Loader2,
    Sparkles, Bot
} from 'lucide-react';
import SeekerLayout from '../components/layout/SeekerLayout';
import CVReportPanel from '../components/cv/CVReportPanel';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function CVUpload() {
    const { user, refreshUser } = useAuth();
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const inputRef = useRef(null);

    const [cvs, setCvs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [analyzingCvId, setAnalyzingCvId] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [showAnalysis, setShowAnalysis] = useState(false);

    useEffect(() => {
        fetchCVs();
    }, []);

    const fetchCVs = async () => {
        try {
            setLoading(true);
            console.log('[CVUpload] Fetching CV list from server...');
            
            const res = await axios.get(`${API_URL}/api/cv/my-cv`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('[CVUpload] CV List:', res.data);
            setCvs(res.data.cvs || []);
        } catch (error) {
            console.error('[CVUpload] Fetch error:', error);
            setCvs([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (file) => {
        if (!file) return;

        if (file.type !== 'application/pdf') {
            setMessage({ type: 'error', text: 'Chỉ chấp nhận file PDF.' });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'File quá lớn. Tối đa 5MB.' });
            return;
        }

        try {
            setUploading(true);
            setMessage(null);

            const formData = new FormData();
            formData.append('cv', file);

            console.log('[CVUpload] Uploading file:', file.name);

            const uploadRes = await axios.post(`${API_URL}/api/cv/upload`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('[CVUpload] Upload response:', uploadRes.data);
            setMessage({ type: 'success', text: `Upload CV thành công! (${uploadRes.data.totalCVs} CV)` });
            
            console.log('[CVUpload] Fetching updated CV list...');
            await fetchCVs();

        } catch (error) {
            console.error('[CVUpload] Upload error:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Lỗi khi upload CV.'
            });
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteCV = async (cvId) => {
        if (!window.confirm('Bạn có chắc muốn xóa CV này?')) return;

        try {
            console.log('[CVUpload] Deleting CV:', cvId);

            await axios.delete(`${API_URL}/api/cv/${cvId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('[CVUpload] CV deleted successfully');
            setMessage({ type: 'success', text: 'Đã xóa CV.' });
            
            console.log('[CVUpload] Fetching updated CV list after delete...');
            await fetchCVs();

        } catch (error) {
            console.error('[CVUpload] Delete error:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Lỗi khi xóa CV.'
            });
        }
    };

    const handleAnalyze = async (cvId) => {
        try {
            setAnalyzing(true);
            setAnalyzingCvId(cvId);
            console.log('[CVUpload] Starting CV analysis for:', cvId);

            const res = await axios.post(`${API_URL}/api/cv/analyze-current`, { cvId }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('[CVUpload] Analysis response:', res.data);

            if (res.data?.data) {
                setAnalysisResult(res.data.data);
                setShowAnalysis(true);
                await fetchCVs();
                if (refreshUser) await refreshUser();
            }
        } catch (error) {
            console.error('[CVUpload] Analysis error:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.error || 'Lỗi khi phân tích CV.'
            });
        } finally {
            setAnalyzing(false);
            setAnalyzingCvId(null);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleUpload(e.dataTransfer.files[0]);
        }
    };

    const analyzedCv = cvs.find((c) => c._id === analyzingCvId) || cvs[cvs.length - 1];

    return (
        <SeekerLayout breadcrumb="Activity Hub › Chấm CV" title={showAnalysis ? '' : 'Chấm & phân tích CV'}>
            {!showAnalysis && (
                <p className="text-[#5A6482] mb-6 -mt-4">Phân tích ATS, kỹ năng và mở khóa luyện phỏng vấn AI (500 credit/lần)</p>
            )}

            {showAnalysis && analysisResult ? (
                <CVReportPanel
                    analysis={analysisResult}
                    fileName={analyzedCv?.fileName}
                    onClose={() => setShowAnalysis(false)}
                />
            ) : (
            <div className="max-w-6xl mx-auto w-full">

                {/* Message Alert */}
                {message && (
                    <div className={`mb-8 flex items-center gap-3 p-4 rounded-xl ${
                        message.type === 'success'
                            ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                            : 'bg-red-50 border border-red-200 text-red-700'
                    }`}>
                        {message.type === 'success'
                            ? <CheckCircle className="w-5 h-5 flex-shrink-0" />
                            : <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        }
                        <span className="text-sm flex-1">{message.text}</span>
                        <button onClick={() => setMessage(null)} className="font-bold">×</button>
                    </div>
                )}

                <div className="grid md:grid-cols-3 gap-8 mb-12">
                    {/* Upload Area - 2 columns */}
                    <div className="md:col-span-2">
                        <div
                            onClick={() => inputRef.current?.click()}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            className={`relative rounded-3xl border-3 border-dashed p-16 cursor-pointer transition-all shadow-2xl ${
                                dragActive
                                    ? 'border-cyan-500 bg-gradient-to-br from-cyan-50 to-blue-50 scale-105'
                                    : 'border-orange-300 hover:border-cyan-500 hover:bg-gradient-to-br hover:from-orange-50 hover:to-cyan-50'
                            }`}
                        >
                            {/* AI Bot Animation */}
                            <div className="text-center">
                                <div className="w-28 h-28 mx-auto mb-8 bg-gradient-to-br from-orange-500 via-red-500 to-cyan-500 rounded-full flex items-center justify-center animate-pulse shadow-2xl">
                                    <Bot className="w-14 h-14 text-white" />
                                </div>

                                {uploading ? (
                                    <>
                                        <Loader2 className="w-8 h-8 animate-spin text-cyan-500 mx-auto mb-3" />
                                        <p className="text-gray-700 font-semibold">Đang tải lên...</p>
                                    </>
                                ) : analyzing ? (
                                    <>
                                        <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-3" />
                                        <p className="text-gray-700 font-semibold text-lg">🤖 AI đang phân tích chi tiết CV...</p>
                                        <p className="text-sm text-gray-600 mt-3">Đang kiểm tra: Kinh nghiệm • Kỹ năng • Thành tích • Ngôn ngữ</p>
                                        <div className="w-48 h-1 bg-gray-200 rounded-full mx-auto mt-3 overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-orange-500 to-cyan-500 animate-pulse"></div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex justify-center gap-2 mb-4">
                                            <Upload className="w-6 h-6 text-cyan-500" />
                                            <Sparkles className="w-6 h-6 text-orange-500" />
                                        </div>
                                        <p className="text-xl font-bold text-gray-900 mb-2">Kéo thả CV của bạn vào đây</p>
                                        <p className="text-sm text-gray-600">hoặc click để chọn file (PDF, max 5MB)</p>
                                    </>
                                )}
                            </div>

                            <input
                                ref={inputRef}
                                type="file"
                                accept=".pdf"
                                onChange={(e) => handleUpload(e.target.files?.[0])}
                                className="hidden"
                            />
                        </div>
                    </div>

                    {/* Features - 1 column */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-3xl p-8 shadow-lg">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                            <CheckCircle className="w-5 h-5 text-purple-600" />
                            Tính Năng
                        </h3>
                        <ul className="space-y-3 text-sm text-gray-700">
                            <li className="flex items-center gap-2"><span className="text-purple-600 font-bold">✨</span> Upload nhiều CV cùng lúc</li>
                            <li className="flex items-center gap-2"><span className="text-purple-600 font-bold">📊</span> Đánh giá chi tiết theo tiêu chí</li>
                            <li className="flex items-center gap-2"><span className="text-purple-600 font-bold">🎯</span> Gợi ý cụ thể cải thiện</li>
                            <li className="flex items-center gap-2"><span className="text-purple-600 font-bold">⚡</span> Phân tích AI 3-5 giây</li>
                            <li className="flex items-center gap-2"><span className="text-purple-600 font-bold">📈</span> So sánh điểm các CV</li>
                        </ul>
                    </div>
                </div>

                {/* CVs List */}
                {!loading && cvs.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <FileText className="w-7 h-7 text-cyan-600" />
                            CV Của Bạn ({cvs.length})
                        </h2>
                        <div className="grid gap-4">
                            {cvs.map((cv) => (
                                <div key={cv._id} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-cyan-500 hover:shadow-lg transition-shadow">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 text-lg mb-2">{cv.fileName}</h3>
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <span>📅 {formatDate(cv.uploadedAt)}</span>
                                                <span>💾 {formatFileSize(cv.fileSize)}</span>
                                            </div>
                                        </div>
                                        {cv.analysis?.score && (
                                            <div className="flex flex-col gap-3 min-w-fit">
                                                <div className={`px-4 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-md ${
                                                    cv.analysis.score >= 75
                                                        ? 'bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700'
                                                        : cv.analysis.score >= 60
                                                        ? 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700'
                                                        : 'bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700'
                                                }`}>
                                                    {cv.analysis.score >= 75 ? '🌟 Tuyệt vời' : cv.analysis.score >= 60 ? '✓ Tốt' : '⚠ Cần cải thiện'}
                                                    <span className="font-bold text-lg">{cv.analysis.score}/100</span>
                                                </div>
                                                {cv.analysis.scoreBreakdown && (
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {Object.entries(cv.analysis.scoreBreakdown).map(([key, val]) => {
                                                            const labels = {
                                                                'structure': 'Cấu trúc',
                                                                'experience': 'Kinh nghiệm',
                                                                'skills': 'Kỹ năng',
                                                                'achievements': 'Thành tích',
                                                                'language': 'Chất lượng'
                                                            };
                                                            return (
                                                                <div key={key} className="bg-gradient-to-br from-gray-50 to-gray-100 px-3 py-2 rounded-lg text-xs border border-gray-200">
                                                                    <div className="font-semibold text-gray-700">{labels[key] || key}</div>
                                                                    <div className="text-gray-600 font-bold">{val} pts</div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleAnalyze(cv._id)}
                                            disabled={analyzingCvId === cv._id}
                                            className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                                        >
                                            {analyzingCvId === cv._id ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Đang phân tích...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-4 h-4" />
                                                    Phân Tích
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCV(cv._id)}
                                            className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-semibold rounded-lg transition-colors flex items-center gap-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Xóa
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && cvs.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg text-gray-600">Bạn chưa tải lên CV nào</p>
                        <p className="text-sm text-gray-500 mt-2">Tải lên CV từ phần trên để bắt đầu</p>
                    </div>
                )}
            </div>

            )}
        </SeekerLayout>
    );
}