import { API_URL } from '@/config';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import {
    Upload, FileText, Trash2,
    CheckCircle, AlertCircle, Loader2,
    Sparkles, Bot, BarChart3, Target, Zap, TrendingUp,
    GraduationCap, Wrench, Folder, Palette, Briefcase, FileEdit
} from 'lucide-react';
import SeekerLayout from '../components/layout/SeekerLayout';
import CVReportPanel from '../components/cv/CVReportPanel';

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

    // CV templates & designs state
    const [savedDesigns, setSavedDesigns] = useState([]);
    const [selectedDesignId, setSelectedDesignId] = useState('');
    const [newDesignName, setNewDesignName] = useState('');

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
        template: 'standard',
        sectionOrder: ['summary', 'experience', 'education', 'skills', 'projects']
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

    const handleFormDragStart = (e, index) => {
        e.dataTransfer.setData("text/plain", index.toString());
        e.dataTransfer.effectAllowed = "move";
    };

    const handleFormDrop = (e, destIndex) => {
        e.preventDefault();
        const sourceIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
        if (isNaN(sourceIndex) || sourceIndex === destIndex) return;
        
        const newOrder = [...(cvForm.sectionOrder || ['summary', 'experience', 'education', 'skills', 'projects'])];
        const [movedItem] = newOrder.splice(sourceIndex, 1);
        newOrder.splice(destIndex, 0, movedItem);
        
        setCvForm(prev => ({
            ...prev,
            sectionOrder: newOrder
        }));
    };

    const handleDownloadPDF = (isPrint = true) => {
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
        const order = cvForm.sectionOrder || ['summary', 'experience', 'education', 'skills', 'projects'];

        if (cvForm.template === 'modern') {
            let mainContentHTML = '';
            order.forEach((secId) => {
                if (secId === 'summary') {
                    mainContentHTML += `
                        <div class="main-section">
                            <div class="main-title">Giới thiệu bản thân</div>
                            <p style="font-size: 13px; color: #475569; margin: 0; text-align: justify; white-space: pre-line;">${cvForm.summary || 'Chưa cung cấp thông tin giới thiệu.'}</p>
                        </div>
                    `;
                } else if (secId === 'experience') {
                    mainContentHTML += `
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
                    `;
                } else if (secId === 'education') {
                    mainContentHTML += `
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
                    `;
                } else if (secId === 'projects') {
                    if (cvForm.projects.some(p => p.name || p.desc)) {
                        mainContentHTML += `
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
                        `;
                    }
                }
            });

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
                        ${mainContentHTML}
                    </div>
                </div>
            `;
        } else {
            let sectionsHTML = '';
            order.forEach((secId) => {
                if (secId === 'summary') {
                    sectionsHTML += `
                        <div class="section">
                            <div class="section-title">Giới thiệu bản thân</div>
                            <p style="font-size: 13px; margin: 0; text-align: justify; white-space: pre-line;">${cvForm.summary || 'Chưa cung cấp thông tin giới thiệu.'}</p>
                        </div>
                    `;
                } else if (secId === 'experience') {
                    sectionsHTML += `
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
                    `;
                } else if (secId === 'education') {
                    sectionsHTML += `
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
                    `;
                } else if (secId === 'projects') {
                    if (cvForm.projects.some(p => p.name || p.desc)) {
                        sectionsHTML += `
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
                        `;
                    }
                } else if (secId === 'skills') {
                    sectionsHTML += `
                        <div class="section">
                            <div class="section-title">Kỹ năng</div>
                            <div class="skills-list">
                                ${cvForm.skills.split(',').map(s => s.trim()).filter(Boolean).map(s => `<span class="skill-tag">${s}</span>`).join('') || 'Chưa cung cấp'}
                            </div>
                        </div>
                    `;
                }
            });

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
                ${sectionsHTML}
            `;
        }

        printWindow.document.write(`
            <html>
                <head>
                    <title>CV_${cvForm.name ? cvForm.name.replace(/\s+/g, '_') : 'JobReady'}</title>
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
                    ${isPrint ? `
                    <script>
                        window.onload = function() {
                            window.print();
                        }
                    </script>
                    ` : ''}
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    useEffect(() => {
        fetchCVs();
        fetchDesigns();
    }, []);

    const fetchDesigns = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/cv/designs`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSavedDesigns(res.data.designs || []);
        } catch (error) {
            console.error("Fetch designs error:", error);
        }
    };

    const handleSelectDesign = (id) => {
        setSelectedDesignId(id);
        if (!id) {
            setCvForm({
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
                template: 'standard',
                sectionOrder: ['summary', 'experience', 'education', 'skills', 'projects']
            });
            setNewDesignName('');
            return;
        }
        const design = savedDesigns.find(d => d._id === id);
        if (design) {
            setCvForm({
                ...design.data,
                sectionOrder: design.data?.sectionOrder || ['summary', 'experience', 'education', 'skills', 'projects']
            });
            setNewDesignName(design.name);
        }
    };

    const handleSaveDesign = async () => {
        const designName = newDesignName.trim();
        if (!designName) {
            alert("Vui lòng nhập tên thiết kế CV!");
            return;
        }

        try {
            const res = await axios.post(`${API_URL}/api/cv/designs`, {
                id: selectedDesignId || undefined,
                name: designName,
                data: cvForm
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                setSavedDesigns(res.data.designs || []);
                const saved = (res.data.designs || []).find(d => d.name === designName);
                if (saved) {
                    setSelectedDesignId(saved._id);
                    setNewDesignName(saved.name);
                }
                alert("Lưu thiết kế CV thành công!");
            }
        } catch (error) {
            console.error("Save design error:", error);
            alert("Không thể lưu thiết kế CV.");
        }
    };

    const handleDeleteDesign = async () => {
        if (!selectedDesignId) {
            alert("Vui lòng chọn một thiết kế để xóa!");
            return;
        }

        if (!window.confirm("Bạn có chắc chắn muốn xóa thiết kế này?")) {
            return;
        }

        try {
            const res = await axios.delete(`${API_URL}/api/cv/designs/${selectedDesignId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                setSavedDesigns(res.data.designs || []);
                setSelectedDesignId('');
                setNewDesignName('');
                alert("Đã xóa thiết kế CV thành công!");
            }
        } catch (error) {
            console.error("Delete design error:", error);
            alert("Không thể xóa thiết kế CV.");
        }
    };

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
                    <p className="text-slate-700 font-medium text-sm sm:text-base">Hệ thống AI tự động đánh giá độ tương thích ATS, đề xuất cải thiện kỹ năng.</p>
                    
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
                                                <p className="text-slate-800 font-semibold text-lg flex items-center justify-center gap-2">
                                                    <Bot className="w-5 h-5 text-cyan-500 animate-bounce" />
                                                    AI đang phân tích chi tiết CV...
                                                </p>
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

                            {/* Features & Cost - 1 column */}
                            <div className="space-y-6">
                                <div className="bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-3xl p-6 text-slate-800 shadow-md">
                                    <p className="text-xs uppercase text-slate-500 mb-1 font-semibold">Chi phí phân tích</p>
                                    <p className="text-3xl font-bold text-[#0A2463]">500 credit / lần</p>
                                    <p className="text-sm text-slate-500 mt-2">Số dư: <span className="text-[#0A2463] font-bold">{(user?.credits ?? 0).toLocaleString('vi-VN')}</span></p>
                                    {(user?.credits ?? 0) < 500 && (
                                        <p className="text-red-650 text-xs mt-2 font-bold">Không đủ credit — hãy nạp thêm tại Pricing.</p>
                                    )}
                                </div>

                                <div className="bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-3xl p-8 shadow-lg text-slate-800">
                                    <h3 className="font-bold text-[#0A2463] mb-4 flex items-center gap-2 text-lg">
                                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                                        Tính Năng
                                    </h3>
                                    <ul className="space-y-3.5 text-sm text-slate-600">
                                        <li className="flex items-center gap-2.5">
                                            <Sparkles className="w-4 h-4 text-orange-400 flex-shrink-0" />
                                            <span>Upload nhiều CV cùng lúc</span>
                                        </li>
                                        <li className="flex items-center gap-2.5">
                                            <BarChart3 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                            <span>Đánh giá chi tiết theo tiêu chí</span>
                                        </li>
                                        <li className="flex items-center gap-2.5">
                                            <Target className="w-4 h-4 text-red-400 flex-shrink-0" />
                                            <span>Gợi ý cụ thể cải thiện</span>
                                        </li>
                                        <li className="flex items-center gap-2.5">
                                            <Zap className="w-4 h-4 text-amber-400 flex-shrink-0" />
                                            <span>Phân tích AI 3-5 giây</span>
                                        </li>
                                        <li className="flex items-center gap-2.5">
                                            <TrendingUp className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                            <span>So sánh điểm các CV</span>
                                        </li>
                                    </ul>
                                </div>
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
                                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
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
                                                {cv.filePath && (
                                                    <a
                                                        href={`${API_URL}${cv.filePath}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg border border-slate-300 transition-all flex items-center gap-2 cursor-pointer text-sm"
                                                    >
                                                        Xem CV
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteCV(cv._id)}
                                                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold rounded-lg border border-red-500/20 transition-all flex items-center gap-2 cursor-pointer"
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
                    <div className="space-y-6">
                        {/* Saved Templates Selector */}
                        <div className="bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl p-6 text-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex-1 space-y-1">
                                <label className="block text-xs font-semibold text-slate-500 uppercase">Chọn mẫu thiết kế đã lưu</label>
                                <select
                                    value={selectedDesignId}
                                    onChange={(e) => handleSelectDesign(e.target.value)}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-800 outline-none focus:ring-2 focus:ring-[#0A2463] font-medium"
                                >
                                    <option value="">-- Tạo thiết kế mới --</option>
                                    {savedDesigns.map((d) => (
                                        <option key={d._id} value={d._id}>{d.name}</option>
                                    ))}
                                </select>
                                {savedDesigns.length === 0 && (
                                    <p className="text-[11px] text-slate-500 mt-1 italic">
                                        * Chưa có thiết kế nào được lưu. Nhập thông tin bên dưới rồi bấm "Lưu thiết kế" ở bên phải.
                                    </p>
                                )}
                            </div>
                            <div className="flex-1 space-y-1">
                                <label className="block text-xs font-semibold text-slate-500 uppercase">Tên thiết kế</label>
                                <input
                                    type="text"
                                    placeholder="Ví dụ: CV Tiếng Anh, CV 2026..."
                                    value={newDesignName}
                                    onChange={(e) => setNewDesignName(e.target.value)}
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-800 outline-none focus:ring-2 focus:ring-[#0A2463]"
                                />
                            </div>
                            <div className="flex items-end gap-2 pt-5">
                                <button
                                    type="button"
                                    onClick={handleSaveDesign}
                                    className="px-4 py-2 bg-[#F5C518] hover:bg-[#d9ae10] text-[#0A2463] font-bold text-sm rounded-lg shadow-md transition-all cursor-pointer"
                                >
                                    Lưu thiết kế
                                </button>
                                {selectedDesignId && (
                                    <button
                                        type="button"
                                        onClick={handleDeleteDesign}
                                        className="px-4 py-2 bg-red-50 text-red-650 hover:bg-red-100 font-bold text-sm rounded-lg border border-red-200 transition-all cursor-pointer"
                                    >
                                        Xóa mẫu
                                    </button>
                                )}
                            </div>
                        </div>

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

                            {(cvForm.sectionOrder || ['summary', 'experience', 'education', 'skills', 'projects']).map((secId, index) => {
                                if (secId === 'summary') {
                                    return (
                                        <div 
                                            key="summary"
                                            className="bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl p-6 text-slate-800 shadow-md transition-all duration-300"
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={(e) => handleFormDrop(e, index)}
                                        >
                                            <div 
                                                draggable
                                                onDragStart={(e) => handleFormDragStart(e, index)}
                                                className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2 cursor-grab active:cursor-grabbing group"
                                            >
                                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 select-none">
                                                    <span className="text-slate-400 group-hover:text-[#F5C518] transition-colors font-bold text-xl mr-1">⋮⋮</span>
                                                    <FileEdit className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                                                    Giới thiệu bản thân
                                                </h3>
                                                <span className="text-xs text-slate-400 font-medium">Kéo để sắp xếp</span>
                                            </div>
                                            <textarea
                                                value={cvForm.summary}
                                                onChange={(e) => setCvForm({ ...cvForm, summary: e.target.value })}
                                                rows={4}
                                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0A2463] resize-none"
                                                placeholder="Tóm tắt ngắn gọn về kinh nghiệm, thế mạnh và mục tiêu nghề nghiệp của bạn..."
                                            />
                                        </div>
                                    );
                                }
                                if (secId === 'experience') {
                                    return (
                                        <div 
                                            key="experience"
                                            className="bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl p-6 text-slate-800 shadow-md transition-all duration-300"
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={(e) => handleFormDrop(e, index)}
                                        >
                                            <div 
                                                draggable
                                                onDragStart={(e) => handleFormDragStart(e, index)}
                                                className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2 cursor-grab active:cursor-grabbing group"
                                            >
                                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 select-none">
                                                    <span className="text-slate-400 group-hover:text-[#F5C518] transition-colors font-bold text-xl mr-1">⋮⋮</span>
                                                    <Briefcase className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                                    Kinh nghiệm làm việc
                                                </h3>
                                                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        type="button"
                                                        onClick={handleAddExperience}
                                                        className="px-3 py-1.5 bg-slate-100 text-[#0A2463] border border-slate-200 hover:bg-slate-200 text-xs font-semibold rounded-lg transition"
                                                    >
                                                        + Thêm kinh nghiệm
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="space-y-6">
                                                {cvForm.experience.map((exp, expIdx) => (
                                                    <div key={expIdx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 relative animate-fadeIn">
                                                        {cvForm.experience.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveExperience(expIdx)}
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
                                                                    onChange={(e) => handleExperienceChange(expIdx, 'company', e.target.value)}
                                                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0A2463]"
                                                                    placeholder="Google, FPT..."
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Vị trí/Chức danh</label>
                                                                <input
                                                                    type="text"
                                                                    value={exp.role}
                                                                    onChange={(e) => handleExperienceChange(expIdx, 'role', e.target.value)}
                                                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0A2463]"
                                                                    placeholder="VD: Senior Developer, Sales Executive..."
                                                                />
                                                            </div>
                                                            <div className="md:col-span-2">
                                                                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Khoảng thời gian</label>
                                                                <input
                                                                    type="text"
                                                                    value={exp.duration}
                                                                    onChange={(e) => handleExperienceChange(expIdx, 'duration', e.target.value)}
                                                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0A2463]"
                                                                    placeholder="VD: 09/2023 - Hiện tại, 2021 - 2023..."
                                                                />
                                                            </div>
                                                            <div className="md:col-span-2">
                                                                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Mô tả công việc</label>
                                                                <textarea
                                                                    value={exp.desc}
                                                                    onChange={(e) => handleExperienceChange(expIdx, 'desc', e.target.value)}
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
                                    );
                                }
                                if (secId === 'education') {
                                    return (
                                        <div 
                                            key="education"
                                            className="bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl p-6 text-slate-800 shadow-md transition-all duration-300"
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={(e) => handleFormDrop(e, index)}
                                        >
                                            <div 
                                                draggable
                                                onDragStart={(e) => handleFormDragStart(e, index)}
                                                className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2 cursor-grab active:cursor-grabbing group"
                                            >
                                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 select-none">
                                                    <span className="text-slate-400 group-hover:text-[#F5C518] transition-colors font-bold text-xl mr-1">⋮⋮</span>
                                                    <GraduationCap className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                                    Học vấn
                                                </h3>
                                                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        type="button"
                                                        onClick={handleAddEducation}
                                                        className="px-3 py-1.5 bg-slate-100 text-[#0A2463] border border-slate-200 hover:bg-slate-200 text-xs font-semibold rounded-lg transition"
                                                    >
                                                        + Thêm học vấn
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="space-y-6">
                                                {cvForm.education.map((edu, eduIdx) => (
                                                    <div key={eduIdx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 relative animate-fadeIn">
                                                        {cvForm.education.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveEducation(eduIdx)}
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
                                                                    onChange={(e) => handleEducationChange(eduIdx, 'school', e.target.value)}
                                                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0A2463]"
                                                                    placeholder="Đại học Bách Khoa, FPT University..."
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Chuyên ngành</label>
                                                                <input
                                                                    type="text"
                                                                    value={edu.major}
                                                                    onChange={(e) => handleEducationChange(eduIdx, 'major', e.target.value)}
                                                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0A2463]"
                                                                    placeholder="VD: Khoa học Máy tính, Quản trị Kinh doanh..."
                                                                />
                                                            </div>
                                                            <div className="md:col-span-2">
                                                                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Khoảng thời gian</label>
                                                                <input
                                                                    type="text"
                                                                    value={edu.duration}
                                                                    onChange={(e) => handleEducationChange(eduIdx, 'duration', e.target.value)}
                                                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0A2463]"
                                                                    placeholder="VD: 2019 - 2023..."
                                                                />
                                                            </div>
                                                            <div className="md:col-span-2">
                                                                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Mô tả bổ sung (Tùy chọn)</label>
                                                                <input
                                                                    type="text"
                                                                    value={edu.desc}
                                                                    onChange={(e) => handleEducationChange(eduIdx, 'desc', e.target.value)}
                                                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0A2463]"
                                                                    placeholder="VD: GPA: 3.6/4.0, Học bổng khuyến học..."
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                }
                                if (secId === 'skills') {
                                    return (
                                        <div 
                                            key="skills"
                                            className="bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl p-6 text-slate-800 shadow-md transition-all duration-300"
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={(e) => handleFormDrop(e, index)}
                                        >
                                            <div 
                                                draggable
                                                onDragStart={(e) => handleFormDragStart(e, index)}
                                                className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2 cursor-grab active:cursor-grabbing group"
                                            >
                                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 select-none">
                                                    <span className="text-slate-400 group-hover:text-[#F5C518] transition-colors font-bold text-xl mr-1">⋮⋮</span>
                                                    <Wrench className="w-5 h-5 text-amber-500 flex-shrink-0" />
                                                    Kỹ năng chuyên môn
                                                </h3>
                                                <span className="text-xs text-slate-400 font-medium">Kéo để sắp xếp</span>
                                            </div>
                                            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase font-semibold text-slate-600">Danh sách kỹ năng (ngăn cách bằng dấu phẩy)</label>
                                            <input
                                                type="text"
                                                value={cvForm.skills}
                                                onChange={(e) => setCvForm({ ...cvForm, skills: e.target.value })}
                                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0A2463]"
                                                placeholder="VD: ReactJS, NodeJS, JavaScript, Git, Communication..."
                                            />
                                        </div>
                                    );
                                }
                                if (secId === 'projects') {
                                    return (
                                        <div 
                                            key="projects"
                                            className="bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl p-6 text-slate-800 shadow-md transition-all duration-300"
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={(e) => handleFormDrop(e, index)}
                                        >
                                            <div 
                                                draggable
                                                onDragStart={(e) => handleFormDragStart(e, index)}
                                                className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2 cursor-grab active:cursor-grabbing group"
                                            >
                                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 select-none">
                                                    <span className="text-slate-400 group-hover:text-[#F5C518] transition-colors font-bold text-xl mr-1">⋮⋮</span>
                                                    <Folder className="w-5 h-5 text-cyan-500 flex-shrink-0" />
                                                    Dự án cá nhân (Tùy chọn)
                                                </h3>
                                                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        type="button"
                                                        onClick={handleAddProject}
                                                        className="px-3 py-1.5 bg-slate-100 text-[#0A2463] border border-slate-200 hover:bg-slate-200 text-xs font-semibold rounded-lg transition"
                                                    >
                                                        + Thêm dự án
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="space-y-6">
                                                {cvForm.projects.map((p, projIdx) => (
                                                    <div key={projIdx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 relative animate-fadeIn">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveProject(projIdx)}
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
                                                                    onChange={(e) => handleProjectChange(projIdx, 'name', e.target.value)}
                                                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0A2463]"
                                                                    placeholder="VD: Website Bán Hàng E-Commerce, Ứng Dụng Chat realtime..."
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Mô tả dự án</label>
                                                                <textarea
                                                                    value={p.desc}
                                                                    onChange={(e) => handleProjectChange(projIdx, 'desc', e.target.value)}
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
                                    );
                                }
                                return null;
                            })}
                        </div>

                        {/* Sidebar templates & download */}
                        <div className="space-y-6">
                            {/* Drag and Drop layout order panel */}
                            <div className="bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl p-6 text-slate-800 shadow-md space-y-3">
                                <h3 className="font-bold text-lg text-[#0A2463] flex items-center gap-2 border-b pb-2 border-slate-200 select-none">
                                    <span className="p-1 rounded-lg bg-[#F5C518]/10 text-[#F5C518]">🔄</span>
                                    Sắp Xếp Bố Cục CV
                                </h3>
                                <p className="text-xs text-slate-500 leading-relaxed">Kéo thả các phần dưới đây để sắp xếp lại thứ tự hiển thị của CV khi xuất PDF và trên form nhập liệu:</p>
                                <div className="space-y-2">
                                    {(cvForm.sectionOrder || ['summary', 'experience', 'education', 'skills', 'projects']).map((secId, idx) => {
                                        const labels = {
                                            summary: '📝 Giới thiệu bản thân',
                                            experience: '💼 Kinh nghiệm làm việc',
                                            education: '🎓 Học vấn & Trình độ',
                                            skills: '🛠️ Kỹ năng chuyên môn',
                                            projects: '📂 Dự án cá nhân'
                                        };
                                        return (
                                            <div
                                                key={secId}
                                                draggable
                                                onDragStart={(e) => handleFormDragStart(e, idx)}
                                                onDragOver={(e) => e.preventDefault()}
                                                onDrop={(e) => handleFormDrop(e, idx)}
                                                className="flex items-center justify-between p-3 bg-white border border-slate-200 hover:border-[#F5C518] rounded-xl cursor-grab active:cursor-grabbing hover:bg-slate-50 transition-all shadow-sm group select-none"
                                            >
                                                <span className="text-xs font-semibold text-slate-700">{labels[secId]}</span>
                                                <span className="text-slate-400 group-hover:text-[#F5C518] transition-colors font-bold">
                                                    ⋮⋮
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl p-6 text-slate-800 shadow-md">
                                <h3 className="font-bold text-lg mb-4 text-[#0A2463] flex items-center gap-2">
                                    <Palette className="w-5 h-5 text-[#F5C518] flex-shrink-0" />
                                    Chọn Giao Diện
                                </h3>
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
                                    onClick={() => handleDownloadPDF(true)}
                                    className="w-full mt-6 py-3 bg-[#F5C518] hover:bg-[#d9ae10] text-[#0A2463] font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                                >
                                    📥 Tải xuống CV (PDF)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDownloadPDF(false)}
                                    className="w-full mt-3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                                >
                                    🔍 Xem trước CV
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
                    </div>
                )}
            </div>

            )}
        </SeekerLayout>
    );
}