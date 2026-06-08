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

    // CV Builder states
    const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'builder'
    const [cvForm, setCvForm] = useState({
        name: user?.name || '',
        title: '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        summary: '',
        experience: [{ company: '', role: '', duration: '', desc: '' }],
        education: [{ school: '', major: '', duration: '', desc: '' }],
        skills: '',
        projects: [{ name: '', desc: '' }],
        template: 'standard'
    });

    const handleAddExperience = () => {
        setCvForm(prev => ({
            ...prev,
            experience: [...prev.experience, { company: '', role: '', duration: '', desc: '' }]
        }));
    };

    const handleRemoveExperience = (index) => {
        setCvForm(prev => {
            const list = [...prev.experience];
            list.splice(index, 1);
            return { ...prev, experience: list };
        });
    };

    const handleExperienceChange = (index, field, value) => {
        setCvForm(prev => {
            const list = [...prev.experience];
            list[index] = { ...list[index], [field]: value };
            return { ...prev, experience: list };
        });
    };

    const handleAddEducation = () => {
        setCvForm(prev => ({
            ...prev,
            education: [...prev.education, { school: '', major: '', duration: '', desc: '' }]
        }));
    };

    const handleRemoveEducation = (index) => {
        setCvForm(prev => {
            const list = [...prev.education];
            list.splice(index, 1);
            return { ...prev, education: list };
        });
    };

    const handleEducationChange = (index, field, value) => {
        setCvForm(prev => {
            const list = [...prev.education];
            list[index] = { ...list[index], [field]: value };
            return { ...prev, education: list };
        });
    };

    const handleAddProject = () => {
        setCvForm(prev => ({
            ...prev,
            projects: [...prev.projects, { name: '', desc: '' }]
        }));
    };

    const handleRemoveProject = (index) => {
        setCvForm(prev => {
            const list = [...prev.projects];
            list.splice(index, 1);
            return { ...prev, projects: list };
        });
    };

    const handleProjectChange = (index, field, value) => {
        setCvForm(prev => {
            const list = [...prev.projects];
            list[index] = { ...list[index], [field]: value };
            return { ...prev, projects: list };
        });
    };

    const handleDownloadPDF = () => {
        const printWindow = window.open('', '_blank');
        
        let templateCSS = '';
        if (cvForm.template === 'standard') {
            templateCSS = `
                body { font-family: 'Inter', sans-serif; color: #1e293b; padding: 40px; line-height: 1.6; max-width: 800px; margin: auto; }
                .header { border-bottom: 2px solid #0A2463; padding-bottom: 15px; margin-bottom: 20px; }
                .name { font-size: 26px; font-weight: bold; color: #0A2463; text-transform: uppercase; margin: 0; }
                .title { font-size: 14px; color: #475569; margin-top: 5px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
                .contact { font-size: 12px; color: #64748b; margin-top: 8px; display: flex; flex-wrap: wrap; gap: 15px; }
                .section { margin-bottom: 20px; }
                .section-title { font-size: 14px; font-weight: bold; color: #0A2463; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
                .item { margin-bottom: 12px; }
                .item-header { display: flex; justify-content: space-between; font-weight: bold; color: #334155; font-size: 14px; }
                .item-sub { color: #64748b; font-size: 12px; font-style: italic; margin-bottom: 3px; font-weight: 500; }
                .item-desc { font-size: 12.5px; color: #475569; margin: 3px 0 0 0; text-align: justify; white-space: pre-line; }
                .skills-list { display: flex; flex-wrap: wrap; gap: 6px; }
                .skill-tag { background: #f1f5f9; color: #475569; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; border: 1px solid #e2e8f0; }
            `;
        } else if (cvForm.template === 'modern') {
            templateCSS = `
                body { font-family: 'Inter', sans-serif; color: #334155; margin: 0; padding: 0; line-height: 1.5; background: white; }
                .container { display: flex; min-height: 297mm; }
                .sidebar { width: 33%; bg-color: #0A2463; background: #0A2463; color: white; padding: 35px 25px; box-sizing: border-box; }
                .main-content { width: 67%; padding: 35px 35px; box-sizing: border-box; }
                .name { font-size: 24px; font-weight: bold; color: white; margin: 0; text-transform: uppercase; }
                .title { font-size: 13px; color: #f5c518; margin-top: 5px; font-weight: 600; text-transform: uppercase; }
                .sidebar-section { margin-bottom: 25px; }
                .sidebar-title { font-size: 13px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 5px; margin-bottom: 12px; color: #f5c518; letter-spacing: 1px; }
                .sidebar-contact { font-size: 11.5px; color: rgba(255,255,255,0.85); margin-bottom: 8px; word-break: break-all; }
                .main-section { margin-bottom: 25px; }
                .main-title { font-size: 14px; font-weight: bold; color: #0A2463; border-bottom: 2px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
                .item { margin-bottom: 15px; }
                .item-header { display: flex; justify-content: space-between; font-weight: bold; color: #0A2463; font-size: 13.5px; }
                .item-sub { color: #64748b; font-size: 12px; margin-bottom: 3px; font-weight: 500; }
                .item-desc { font-size: 12.5px; color: #475569; margin: 3px 0 0 0; text-align: justify; white-space: pre-line; }
                .skill-tag { display: inline-block; background: rgba(255,255,255,0.15); color: white; padding: 3px 8px; margin: 0 4px 4px 0; border-radius: 4px; font-size: 11px; }
            `;
        } else { // creative
            templateCSS = `
                body { font-family: 'Inter', sans-serif; color: #2d3748; padding: 40px; line-height: 1.6; max-width: 800px; margin: auto; }
                .header { background: linear-gradient(135deg, #0A2463, #3a5fa9); color: white; padding: 25px 30px; border-radius: 12px; margin-bottom: 25px; }
                .name { font-size: 28px; font-weight: 800; margin: 0; text-transform: uppercase; }
                .title { font-size: 14px; color: rgba(255,255,255,0.9); margin-top: 5px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
                .contact { font-size: 12px; color: rgba(255,255,255,0.85); margin-top: 10px; display: flex; flex-wrap: wrap; gap: 15px; }
                .section { margin-bottom: 25px; }
                .section-title { font-size: 14px; font-weight: 800; color: #0A2463; display: flex; align-items: center; gap: 8px; margin-bottom: 12px; text-transform: uppercase; }
                .section-title::after { content: ''; flex: 1; height: 2px; background: linear-gradient(to right, #0A2463, transparent); }
                .item { margin-bottom: 12px; border-left: 3px solid #f5c518; padding-left: 12px; }
                .item-header { display: flex; justify-content: space-between; font-weight: bold; color: #1a202c; font-size: 13.5px; }
                .item-sub { color: #4a5568; font-size: 12px; margin-bottom: 3px; font-weight: 500; }
                .item-desc { font-size: 12.5px; color: #4a5568; margin: 3px 0 0 0; text-align: justify; white-space: pre-line; }
                .skills-list { display: flex; flex-wrap: wrap; gap: 5px; }
                .skill-tag { background: #ebf8ff; color: #2b6cb0; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; border: 1px solid #bee3f8; }
            `;
        }

        let cvHTML = '';
        if (cvForm.template === 'modern') {
            cvHTML = `
                <div class="container">
                    <div class="sidebar">
                        <div class="name">${cvForm.name || 'Họ và Tên'}</div>
                        <div class="title">${cvForm.title || 'Vị trí ứng tuyển'}</div>
                        
                        <div class="sidebar-section" style="margin-top: 30px;">
                            <div class="sidebar-title">Liên hệ</div>
                            <div class="sidebar-contact">📞 ${cvForm.phone || 'Chưa cung cấp'}</div>
                            <div class="sidebar-contact">✉️ ${cvForm.email || 'Chưa cung cấp'}</div>
                            <div class="sidebar-contact">📍 ${cvForm.address || 'Chưa cung cấp'}</div>
                        </div>
                        
                        <div class="sidebar-section">
                            <div class="sidebar-title">Kỹ năng</div>
                            <div style="margin-top: 10px;">
                                ${cvForm.skills.split(',').map(s => s.trim()).filter(Boolean).map(s => `<span class="skill-tag">${s}</span>`).join('') || 'Chưa cung cấp'}
                            </div>
                        </div>
                    </div>
                    <div class="main-content">
                        <div class="main-section">
                            <div class="main-title">Giới thiệu bản thân</div>
                            <p style="font-size: 13px; color: #475569; margin: 0; text-align: justify; white-space: pre-line;">${cvForm.summary || 'Chưa cung cấp thông tin giới thiệu.'}</p>
                        </div>
                        
                        <div class="main-section">
                            <div class="main-title">Kinh nghiệm làm việc</div>
                            ${cvForm.experience.map(exp => `
                                <div class="item">
                                    <div class="item-header">
                                        <span>${exp.role || 'Vị trí'}</span>
                                        <span style="font-size: 12px; color: #64748b; font-weight: normal;">${exp.duration || 'Thời gian'}</span>
                                    </div>
                                    <div class="item-sub">${exp.company || 'Tên công ty'}</div>
                                    <div class="item-desc">${exp.desc || 'Mô tả công việc'}</div>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="main-section">
                            <div class="main-title">Học vấn</div>
                            ${cvForm.education.map(edu => `
                                <div class="item">
                                    <div class="item-header">
                                        <span>${edu.school || 'Tên trường học'}</span>
                                        <span style="font-size: 12px; color: #64748b; font-weight: normal;">${edu.duration || 'Thời gian'}</span>
                                    </div>
                                    <div class="item-sub">${edu.major || 'Chuyên ngành'}</div>
                                    <div class="item-desc">${edu.desc || ''}</div>
                                </div>
                            `).join('')}
                        </div>

                        ${cvForm.projects.some(p => p.name || p.desc) ? `
                        <div class="main-section">
                            <div class="main-title">Dự án cá nhân</div>
                            ${cvForm.projects.map(p => `
                                <div class="item">
                                    <div class="item-header">
                                        <span>${p.name || 'Tên dự án'}</span>
                                    </div>
                                    <div class="item-desc">${p.desc || ''}</div>
                                </div>
                            `).join('')}
                        </div>
                        ` : ''}
                    </div>
                </div>
            `;
        } else {
            cvHTML = `
                <div class="header">
                    <div class="name">${cvForm.name || 'Họ và Tên'}</div>
                    <div class="title">${cvForm.title || 'Vị trí ứng tuyển'}</div>
                    <div class="contact">
                        <span>📞 ${cvForm.phone || 'Chưa cung cấp'}</span>
                        <span>✉️ ${cvForm.email || 'Chưa cung cấp'}</span>
                        <span>📍 ${cvForm.address || 'Chưa cung cấp'}</span>
                    </div>
                </div>
                
                <div class="section">
                    <div class="section-title">Giới thiệu bản thân</div>
                    <p style="font-size: 13px; margin: 0; text-align: justify; white-space: pre-line;">${cvForm.summary || 'Chưa cung cấp thông tin giới thiệu.'}</p>
                </div>
                
                <div class="section">
                    <div class="section-title">Kinh nghiệm làm việc</div>
                    ${cvForm.experience.map(exp => `
                        <div class="item">
                            <div class="item-header">
                                <span>${exp.company || 'Tên công ty'}</span>
                                <span style="font-size: 12px; font-weight: normal; color: #64748b;">${exp.duration || 'Thời gian'}</span>
                            </div>
                            <div class="item-sub">${exp.role || 'Vị trí'}</div>
                            <div class="item-desc">${exp.desc || 'Mô tả công việc'}</div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="section">
                    <div class="section-title">Học vấn</div>
                    ${cvForm.education.map(edu => `
                        <div class="item">
                            <div class="item-header">
                                <span>${edu.school || 'Tên trường học'}</span>
                                <span style="font-size: 12px; font-weight: normal; color: #64748b;">${edu.duration || 'Thời gian'}</span>
                            </div>
                            <div class="item-sub">${edu.major || 'Chuyên ngành'}</div>
                            <div class="item-desc">${edu.desc || ''}</div>
                        </div>
                    `).join('')}
                </div>

                ${cvForm.projects.some(p => p.name || p.desc) ? `
                <div class="section">
                    <div class="section-title">Dự án cá nhân</div>
                    ${cvForm.projects.map(p => `
                        <div class="item">
                            <div class="item-header">
                                <span>${p.name || 'Tên dự án'}</span>
                            </div>
                            <div class="item-desc">${p.desc || ''}</div>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
                
                <div class="section">
                    <div class="section-title">Kỹ năng</div>
                    <div class="skills-list">
                        ${cvForm.skills.split(',').map(s => s.trim()).filter(Boolean).map(s => `<span class="skill-tag">${s}</span>`).join('') || 'Chưa cung cấp'}
                    </div>
                </div>
            `;
        }

        printWindow.document.write(`
            <html>
                <head>
                    <title>CV_${cvForm.name ? cvForm.name.replace(/\\s+/g, '_') : 'JobReady'}</title>
                    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
                    <style>
                        ${templateCSS}
                        @media print {
                            body { padding: 0; background: white; }
                            .container { min-height: 100%; }
                            @page { size: A4; margin: 0; }
                        }
                    </style>
                </head>
                <body>
                    ${cvHTML}
                    <script>
                        window.onload = function() {
                            window.print();
                        }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 -mt-4">
                    <p className="text-slate-700 font-semibold">Phân tích ATS, kỹ năng và mở khóa luyện phỏng vấn AI (500 credit/lần)</p>
                    
                    {/* Tabs Selector */}
                    <div className="flex bg-slate-200/50 p-1 rounded-xl border border-slate-300/60 self-start sm:self-auto shadow-sm">
                        <button
                            onClick={() => setActiveTab('upload')}
                            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
                                activeTab === 'upload'
                                    ? 'bg-[#F5C518] text-[#0A2463] font-bold shadow-sm'
                                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200/40'
                            }`}
                        >
                            📁 Tải lên CV
                        </button>
                        <button
                            onClick={() => setActiveTab('builder')}
                            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
                                activeTab === 'builder'
                                    ? 'bg-[#F5C518] text-[#0A2463] font-bold shadow-sm'
                                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200/40'
                            }`}
                        >
                            ✏️ Tự thiết kế CV
                        </button>
                    </div>
                </div>
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
                            ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-sm'
                            : 'bg-red-50 border border-red-200 text-red-700 shadow-sm'
                    }`}>
                        {message.type === 'success'
                            ? <CheckCircle className="w-5 h-5 flex-shrink-0" />
                            : <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        }
                        <span className="text-sm flex-1">{message.text}</span>
                        <button onClick={() => setMessage(null)} className="font-bold">×</button>
                    </div>
                )}

                {/* Tab: Upload CV */}
                {activeTab === 'upload' && (
                    <>
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
                                            ? 'border-[#F5C518] bg-white scale-105 shadow-xl'
                                            : 'border-slate-300 hover:border-[#F5C518] bg-white/80 hover:bg-white shadow-md'
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
                                                <p className="text-slate-700 font-semibold">Đang tải lên...</p>
                                            </>
                                        ) : analyzing ? (
                                            <>
                                                <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-3" />
                                                <p className="text-slate-800 font-semibold text-lg">🤖 AI đang phân tích chi tiết CV...</p>
                                                <p className="text-sm text-slate-600 mt-3">Đang kiểm tra: Kinh nghiệm • Kỹ năng • Thành tích • Ngôn ngữ</p>
                                                <div className="w-48 h-1 bg-slate-200 rounded-full mx-auto mt-3 overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-orange-500 to-cyan-500 animate-pulse"></div>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex justify-center gap-2 mb-4">
                                                    <Upload className="w-6 h-6 text-cyan-500" />
                                                    <Sparkles className="w-6 h-6 text-orange-500" />
                                                </div>
                                                <p className="text-xl font-bold text-slate-800 mb-2">Kéo thả CV của bạn vào đây</p>
                                                <p className="text-sm text-slate-500">hoặc click để chọn file (PDF, max 5MB)</p>
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
                            <div className="bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-3xl p-8 shadow-lg text-slate-800">
                                <h3 className="font-bold text-[#0A2463] mb-4 flex items-center gap-2 text-lg">
                                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                                    Tính Năng
                                </h3>
                                <ul className="space-y-3 text-sm text-slate-600">
                                    <li className="flex items-center gap-2"><span className="text-emerald-400 font-bold">✨</span> Upload nhiều CV cùng lúc</li>
                                    <li className="flex items-center gap-2"><span className="text-emerald-400 font-bold">📊</span> Đánh giá chi tiết theo tiêu chí</li>
                                    <li className="flex items-center gap-2"><span className="text-emerald-400 font-bold">🎯</span> Gợi ý cụ thể cải thiện</li>
                                    <li className="flex items-center gap-2"><span className="text-emerald-400 font-bold">⚡</span> Phân tích AI 3-5 giây</li>
                                    <li className="flex items-center gap-2"><span className="text-emerald-400 font-bold">📈</span> So sánh điểm các CV</li>
                                </ul>
                            </div>
                        </div>

                        {/* CVs List */}
                        {!loading && cvs.length > 0 && (
                            <div className="mb-12">
                                <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                                    <FileText className="w-7 h-7 text-[#F5C518]" />
                                    CV Của Bạn ({cvs.length})
                                </h2>
                                <div className="grid gap-4">
                                    {cvs.map((cv) => (
                                        <div key={cv._id} className="bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-xl p-6 border-l-4 border-l-cyan-500 hover:bg-white/95 hover:shadow-lg transition-all duration-300 text-slate-800 shadow-md">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-slate-800 text-lg mb-2">{cv.fileName}</h3>
                                                    <div className="flex items-center gap-4 text-sm text-slate-500">
                                                        <span>📅 {formatDate(cv.uploadedAt)}</span>
                                                        <span>💾 {formatFileSize(cv.fileSize)}</span>
                                                    </div>
                                                </div>
                                                {cv.analysis?.score && (
                                                    <div className="flex flex-col gap-3 min-w-fit">
                                                        <div className={`px-4 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-md ${
                                                            cv.analysis.score >= 75
                                                                ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                                                                : cv.analysis.score >= 60
                                                                ? 'bg-gradient-to-r from-blue-500/20 to-blue-500/10 text-blue-300 border border-blue-500/20'
                                                                : 'bg-gradient-to-r from-amber-500/20 to-amber-500/10 text-gray-500 border border-amber-500/20'
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
                                                                        <div key={key} className="bg-slate-50 px-3 py-2 rounded-lg text-xs border border-slate-200 text-slate-700">
                                                                            <div className="font-semibold text-slate-600">{labels[key] || key}</div>
                                                                            <div className="text-slate-500 font-bold">{val} pts</div>
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
                                                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold rounded-lg border border-red-500/20 transition-all flex items-center gap-2"
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
                            <div className="text-center py-12 bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl text-slate-700 shadow-md">
                                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-lg text-slate-500">Bạn chưa tải lên CV nào</p>
                                <p className="text-sm text-slate-500 mt-2">Tải lên CV từ phần trên hoặc chuyển sang tab "Tự thiết kế CV" để bắt đầu</p>
                            </div>
                        )}
                    </>
                )}

                {/* Tab: CV Builder */}
                {activeTab === 'builder' && (
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Form input - 2 columns */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Personal Info */}
                            <div className="bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl p-6 text-slate-800 shadow-md">
                                <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
                                    <span className="p-1 rounded-lg bg-white/10 text-white">👤</span>
                                    Thông tin cá nhân
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Họ và Tên</label>
                                        <input
                                            type="text"
                                            value={cvForm.name}
                                            onChange={(e) => setCvForm({ ...cvForm, name: e.target.value })}
                                            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0A2463]"
                                            placeholder="Nguyễn Văn A"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Vị trí ứng tuyển</label>
                                        <input
                                            type="text"
                                            value={cvForm.title}
                                            onChange={(e) => setCvForm({ ...cvForm, title: e.target.value })}
                                            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0A2463]"
                                            placeholder="VD: Frontend Developer, Sales Manager..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Email</label>
                                        <input
                                            type="email"
                                            value={cvForm.email}
                                            onChange={(e) => setCvForm({ ...cvForm, email: e.target.value })}
                                            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0A2463]"
                                            placeholder="email@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Số điện thoại</label>
                                        <input
                                            type="text"
                                            value={cvForm.phone}
                                            onChange={(e) => setCvForm({ ...cvForm, phone: e.target.value })}
                                            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0A2463]"
                                            placeholder="0901234567"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Địa chỉ</label>
                                        <input
                                            type="text"
                                            value={cvForm.address}
                                            onChange={(e) => setCvForm({ ...cvForm, address: e.target.value })}
                                            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0A2463]"
                                            placeholder="VD: Quận 1, TP. Hồ Chí Minh"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl p-6 text-slate-800 shadow-md">
                                <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
                                    <span className="p-1 rounded-lg bg-white/10 text-white">📝</span>
                                    Giới thiệu bản thân
                                </h3>
                                <textarea
                                    value={cvForm.summary}
                                    onChange={(e) => setCvForm({ ...cvForm, summary: e.target.value })}
                                    rows={4}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0A2463] resize-none"
                                    placeholder="Tóm tắt ngắn gọn về kinh nghiệm, thế mạnh và mục tiêu nghề nghiệp của bạn..."
                                />
                            </div>

                            {/* Experience */}
                            <div className="bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl p-6 text-slate-800 shadow-md">
                                <div className="flex justify-between items-center mb-4 border-b pb-2">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <span className="p-1 rounded-lg bg-white/10 text-white">💼</span>
                                        Kinh nghiệm làm việc
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={handleAddExperience}
                                        className="px-3 py-1.5 bg-slate-100 text-[#0A2463] border border-white/10 hover:bg-white/15 text-xs font-semibold rounded-lg transition"
                                    >
                                        + Thêm kinh nghiệm
                                    </button>
                                </div>
                                <div className="space-y-6">
                                    {cvForm.experience.map((exp, index) => (
                                        <div key={index} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 relative">
                                            {cvForm.experience.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveExperience(index)}
                                                    className="absolute top-4 right-4 text-red-500 hover:text-red-700 font-bold text-xs"
                                                >
                                                    Xóa
                                                </button>
                                            )}
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Tên công ty</label>
                                                    <input
                                                        type="text"
                                                        value={exp.company}
                                                        onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                                                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0A2463]"
                                                        placeholder="Google, FPT..."
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Vị trí/Chức danh</label>
                                                    <input
                                                        type="text"
                                                        value={exp.role}
                                                        onChange={(e) => handleExperienceChange(index, 'role', e.target.value)}
                                                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0A2463]"
                                                        placeholder="VD: Senior Developer, Sales Executive..."
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Khoảng thời gian</label>
                                                    <input
                                                        type="text"
                                                        value={exp.duration}
                                                        onChange={(e) => handleExperienceChange(index, 'duration', e.target.value)}
                                                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0A2463]"
                                                        placeholder="VD: 09/2023 - Hiện tại, 2021 - 2023..."
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Mô tả công việc</label>
                                                    <textarea
                                                        value={exp.desc}
                                                        onChange={(e) => handleExperienceChange(index, 'desc', e.target.value)}
                                                        rows={3}
                                                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0A2463] resize-none"
                                                        placeholder="Nêu chi tiết công việc, nhiệm vụ chính và các thành tích nổi bật của bạn..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Education */}
                            <div className="bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl p-6 text-slate-800 shadow-md">
                                <div className="flex justify-between items-center mb-4 border-b pb-2">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <span className="p-1 rounded-lg bg-white/10 text-white">🎓</span>
                                        Học vấn
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={handleAddEducation}
                                        className="px-3 py-1.5 bg-slate-100 text-[#0A2463] border border-white/10 hover:bg-white/15 text-xs font-semibold rounded-lg transition"
                                    >
                                        + Thêm học vấn
                                    </button>
                                </div>
                                <div className="space-y-6">
                                    {cvForm.education.map((edu, index) => (
                                        <div key={index} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 relative">
                                            {cvForm.education.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveEducation(index)}
                                                    className="absolute top-4 right-4 text-red-500 hover:text-red-700 font-bold text-xs"
                                                >
                                                    Xóa
                                                </button>
                                            )}
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Tên trường học</label>
                                                    <input
                                                        type="text"
                                                        value={edu.school}
                                                        onChange={(e) => handleEducationChange(index, 'school', e.target.value)}
                                                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0A2463]"
                                                        placeholder="Đại học Bách Khoa, FPT University..."
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Chuyên ngành</label>
                                                    <input
                                                        type="text"
                                                        value={edu.major}
                                                        onChange={(e) => handleEducationChange(index, 'major', e.target.value)}
                                                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0A2463]"
                                                        placeholder="VD: Khoa học Máy tính, Quản trị Kinh doanh..."
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Khoảng thời gian</label>
                                                    <input
                                                        type="text"
                                                        value={edu.duration}
                                                        onChange={(e) => handleEducationChange(index, 'duration', e.target.value)}
                                                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0A2463]"
                                                        placeholder="VD: 2019 - 2023..."
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Mô tả bổ sung (Tùy chọn)</label>
                                                    <input
                                                        type="text"
                                                        value={edu.desc}
                                                        onChange={(e) => handleEducationChange(index, 'desc', e.target.value)}
                                                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0A2463]"
                                                        placeholder="VD: GPA: 3.6/4.0, Học bổng khuyến học..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Skills */}
                            <div className="bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl p-6 text-slate-800 shadow-md">
                                <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
                                    <span className="p-1 rounded-lg bg-white/10 text-white">🛠️</span>
                                    Kỹ năng chuyên môn
                                </h3>
                                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase font-semibold text-slate-600">Danh sách kỹ năng (ngăn cách bằng dấu phẩy)</label>
                                <input
                                    type="text"
                                    value={cvForm.skills}
                                    onChange={(e) => setCvForm({ ...cvForm, skills: e.target.value })}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0A2463]"
                                    placeholder="VD: ReactJS, NodeJS, JavaScript, Git, Communication..."
                                />
                            </div>

                            {/* Projects */}
                            <div className="bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl p-6 text-slate-800 shadow-md">
                                <div className="flex justify-between items-center mb-4 border-b pb-2">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <span className="p-1 rounded-lg bg-white/10 text-white">📂</span>
                                        Dự án cá nhân (Tùy chọn)
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={handleAddProject}
                                        className="px-3 py-1.5 bg-slate-100 text-[#0A2463] border border-white/10 hover:bg-white/15 text-xs font-semibold rounded-lg transition"
                                    >
                                        + Thêm dự án
                                    </button>
                                </div>
                                <div className="space-y-6">
                                    {cvForm.projects.map((p, index) => (
                                        <div key={index} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 relative">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveProject(index)}
                                                className="absolute top-4 right-4 text-red-500 hover:text-red-700 font-bold text-xs"
                                            >
                                                Xóa
                                            </button>
                                            <div className="grid gap-4">
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Tên dự án</label>
                                                    <input
                                                        type="text"
                                                        value={p.name}
                                                        onChange={(e) => handleProjectChange(index, 'name', e.target.value)}
                                                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0A2463]"
                                                        placeholder="VD: Website Bán Hàng E-Commerce, Ứng Dụng Chat realtime..."
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Mô tả dự án</label>
                                                    <textarea
                                                        value={p.desc}
                                                        onChange={(e) => handleProjectChange(index, 'desc', e.target.value)}
                                                        rows={2}
                                                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0A2463] resize-none"
                                                        placeholder="Nêu công nghệ sử dụng và kết quả của dự án..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar templates & download */}
                        <div className="space-y-6">
                            <div className="bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl p-6 text-slate-800 shadow-md">
                                <h3 className="font-bold text-lg mb-4 text-[#F5C518]">🎨 Chọn Giao Diện</h3>
                                <div className="space-y-3">
                                    {[
                                        { id: 'standard', name: 'Standard (Thanh Lịch)', desc: 'Bố cục truyền thống màu Navy sang trọng.' },
                                        { id: 'modern', name: 'Modern (Hiện Đại)', desc: 'Bố cục 2 cột gọn gàng, năng động.' },
                                        { id: 'creative', name: 'Creative (Sáng Tạo)', desc: 'Hộp màu Gradient trẻ trung, nổi bật.' }
                                    ].map((tpl) => (
                                        <div
                                            key={tpl.id}
                                            onClick={() => setCvForm({ ...cvForm, template: tpl.id })}
                                            className={`p-4 rounded-xl border-2 cursor-pointer text-left transition ${
                                                cvForm.template === tpl.id
                                                    ? 'border-[#F5C518] bg-[#F5C518]/10 text-slate-900'
                                                    : 'border-slate-200 hover:border-[#F5C518]/30 hover:bg-slate-50'
                                            }`}
                                        >
                                            <p className="font-semibold text-sm">{tpl.name}</p>
                                            <p className="text-xs text-slate-500 mt-1">{tpl.desc}</p>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={handleDownloadPDF}
                                    className="w-full mt-6 py-3 bg-[#F5C518] hover:bg-[#d9ae10] text-[#0A2463] font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                                >
                                    📥 Tải xuống CV (PDF)
                                </button>
                            </div>

                            <div className="bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl p-6 text-slate-800 shadow-md">
                                <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                                    <span>💡</span> Hướng dẫn tải lên
                                </h3>
                                <p className="text-xs text-slate-500 leading-relaxed text-justify">
                                    Sau khi tải xuống CV dạng PDF, bạn hãy chuyển sang tab <strong>"Tải lên CV"</strong> ở phía trên để nộp file và tiến hành <strong>AI CV Scan & Analysis</strong> để nhận phản hồi chi tiết từ AI.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            )}
        </SeekerLayout>
    );
}