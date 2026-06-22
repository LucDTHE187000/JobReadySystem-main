import { API_URL } from '@/config';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { isJobSeekerRole, isEmployerRole } from '../utils/roles';
import { User, Lock, Briefcase, Camera, Building, Mail, Phone, MapPin, Save, ArrowLeft, Eye, EyeOff, CreditCard } from 'lucide-react';
import axios from 'axios';
import SeekerLayout from '../components/layout/SeekerLayout';

export default function Profile() {
    const { user, refreshUser } = useAuth();
    const credits = user?.credits ?? 0;
    const [activeTab, setActiveTab] = useState('general');
    const [billingHistory, setBillingHistory] = useState([]);
    const [billingLoading, setBillingLoading] = useState(false);
    const [activePackage, setActivePackage] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        avatar: '',
        skills: '',
        experience: '',
        education: '',
        companyName: '',
        companyDescription: '',
        companyWebsite: ''
    });

    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                address: user.address || '',
                avatar: user.avatar || user.avatarUrl || '',
                skills: user.skills ? user.skills.join(', ') : '',
                experience: user.experience || '',
                education: user.education || '',
                companyName: user.companyName || '',
                companyDescription: user.companyDescription || '',
                companyWebsite: user.companyWebsite || ''
            });
        }
    }, [user]);

    useEffect(() => {
        if (user && activeTab === 'billing') {
            fetchBillingHistory();
        }
    }, [user, activeTab]);

    const fetchBillingHistory = async () => {
        try {
            setBillingLoading(true);
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/payment/history`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const history = response.data.history || [];
            setBillingHistory(history);
            
            // Tìm gói thanh toán thành công gần nhất
            const paidOrders = history.filter(o => o.status === 'PAID');
            if (paidOrders.length > 0) {
                setActivePackage(paidOrders[0].packageName);
            } else {
                setActivePackage('Cơ bản');
            }
        } catch (err) {
            console.error("Lỗi khi tải lịch sử giao dịch:", err);
        } finally {
            setBillingLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const dataToUpdate = { ...formData };
            // parse skills string to array — always produce a proper array
            dataToUpdate.skills = dataToUpdate.skills
                ? dataToUpdate.skills.split(',').map(s => s.trim()).filter(Boolean)
                : [];

            const response = await axios.put(`${API_URL}/api/users/profile`, dataToUpdate, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Refresh global user context so header/sidebar update instantly
            await refreshUser();
            setMessage({ type: 'success', text: 'Cập nhật hồ sơ thành công!' });

        } catch (error) {
            console.error('Profile update error:', error);
            setMessage({ type: 'error', text: error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSavePassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp!' });
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            await axios.post(`${API_URL}/api/users/change-password`, {
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Không thể đổi mật khẩu.' });
        } finally {
            setLoading(false);
        }
    };

    const navigate = useNavigate();

    const tabBtn = (key) =>
        activeTab === key
            ? 'bg-indigo-50 text-indigo-700 border-l-2 border-indigo-500 font-semibold'
            : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50 border-l-2 border-transparent';

    const isEmployer = isEmployerRole(user?.role);
    const isNotSeeker = user?.role === 'EMPLOYER' || user?.role === 'ADMIN';

    const PageWrapper = isNotSeeker
        ? ({ children }) => (
            <div 
                className="min-h-screen flex bg-cover bg-center bg-no-repeat bg-fixed relative p-6 lg:p-8 justify-center items-start w-full"
                style={{ backgroundImage: "url('/background3.jpg')" }}
            >
                <div className="absolute inset-0 bg-slate-950/35 backdrop-blur-[1px] pointer-events-none" />
                <div className="relative z-10 w-full max-w-5xl my-4">
                    {children}
                </div>
            </div>
          )
        : SeekerLayout;

    const handleBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else if (user?.role === 'ADMIN') {
            navigate('/admin/dashboard');
        } else {
            navigate('/dashboard');
        }
    };

    return (
        <PageWrapper title="Hồ sơ & Credit" breadcrumb="Tài khoản › Hồ sơ">
            <div className="max-w-5xl mx-auto w-full space-y-6">
                {isNotSeeker && (
                    <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-xl shadow-slate-900/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleBack}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white/85 border border-slate-250/70 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-all text-sm flex-shrink-0 cursor-pointer"
                            >
                                <ArrowLeft size={16} /> Quay lại
                            </button>
                            <div>
                                <h1 className="text-xl font-bold tracking-tight text-slate-800">Thông tin cá nhân</h1>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">Quản lý và cập nhật thông tin tài khoản của bạn</p>
                            </div>
                        </div>
                        <div className="bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-xl text-indigo-700 font-semibold text-xs shadow-sm">
                            Vai trò: {user?.role === 'ADMIN' ? 'Quản trị viên' : 'Nhà tuyển dụng'}
                        </div>
                    </div>
                )}

                {user?.role !== 'ADMIN' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 bg-white/80 border border-white/60 backdrop-blur-md rounded-2xl p-6 text-slate-800 shadow-xl shadow-slate-900/5">
                            <p className="text-xs uppercase tracking-wider text-slate-500 mb-1 font-semibold">Số dư credit</p>
                            <p className="text-4xl font-bold text-indigo-650">{credits.toLocaleString('vi-VN')}</p>
                        </div>
                    </div>
                )}

                {isEmployer && (
                    <div className="mb-6">
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => { setActiveTab('general'); setMessage({ type: '', text: '' }) }}
                                className={`flex-1 min-w-[160px] flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${tabBtn('general')}`}
                            >
                                <User size={18} />
                                Hồ sơ cá nhân
                            </button>
                            {isJobSeekerRole(user?.role) && (
                                <button
                                    onClick={() => { setActiveTab('professional'); setMessage({ type: '', text: '' }) }}
                                    className={`flex-1 min-w-[160px] flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${tabBtn('professional')}`}
                                >
                                    <Briefcase size={18} />
                                    Thông tin nghề nghiệp
                                </button>
                            )}
                            {isEmployer && (
                                <button
                                    onClick={() => { setActiveTab('company'); setMessage({ type: '', text: '' }) }}
                                    className={`flex-1 min-w-[160px] flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${tabBtn('company')}`}
                                >
                                    <Building size={18} />
                                    Thông tin công ty
                                </button>
                            )}
                            <button
                                onClick={() => { setActiveTab('security'); setMessage({ type: '', text: '' }) }}
                                className={`flex-1 min-w-[160px] flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${tabBtn('security')}`}
                            >
                                <Lock size={18} />
                                Bảo mật
                            </button>
                            {user?.role !== 'ADMIN' && (
                                <button
                                    onClick={() => { setActiveTab('billing'); setMessage({ type: '', text: '' }) }}
                                    className={`flex-1 min-w-[160px] flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${tabBtn('billing')}`}
                                >
                                    <CreditCard size={18} />
                                    Gói & Giao dịch
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <div className={`grid grid-cols-1 ${!isEmployer ? 'md:grid-cols-4' : ''} gap-8`}>

                    {/* Sidebar Tabs */}
                    {!isEmployer && (
                        <div className="md:col-span-1 space-y-1">
                            <button
                                onClick={() => { setActiveTab('general'); setMessage({ type: '', text: '' }) }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${tabBtn('general')}`}
                            >
                                <User size={18} />
                                Hồ sơ cá nhân
                            </button>

                            {isJobSeekerRole(user?.role) && (
                                <button
                                    onClick={() => { setActiveTab('professional'); setMessage({ type: '', text: '' }) }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${tabBtn('professional')}`}
                                >
                                    <Briefcase size={18} />
                                    Thông tin nghề nghiệp
                                </button>
                            )}

                            {isEmployer && (
                                <button
                                    onClick={() => { setActiveTab('company'); setMessage({ type: '', text: '' }) }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${tabBtn('company')}`}
                                >
                                    <Building size={18} />
                                    Thông tin công ty
                                </button>
                            )}

                            <button
                                onClick={() => { setActiveTab('security'); setMessage({ type: '', text: '' }) }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${tabBtn('security')}`}
                            >
                                <Lock size={18} />
                                Bảo mật
                            </button>
                            {user?.role !== 'ADMIN' && (
                                <button
                                    onClick={() => { setActiveTab('billing'); setMessage({ type: '', text: '' }) }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${tabBtn('billing')}`}
                                >
                                    <CreditCard size={18} />
                                    Gói & Giao dịch
                                </button>
                            )}
                        </div>
                    )}

                    {/* Content Area */}
                    <div className={isEmployer ? '' : 'md:col-span-3'}>
                        <div className="bg-white/80 border border-white/60 backdrop-blur-md rounded-2xl p-6 sm:p-8 text-slate-850 shadow-xl shadow-slate-900/5">

                            {message.text && (
                                <div className={`p-4 rounded-xl mb-6 text-sm flex items-center gap-2 backdrop-blur-md ${message.type === 'success' ? 'bg-emerald-50/60 text-emerald-700 border border-emerald-200 shadow-sm' : 'bg-red-50/60 text-red-700 border border-red-200 shadow-sm'
                                    }`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    {message.text}
                                </div>
                            )}

                             {activeTab === 'general' && (
                                <form onSubmit={handleSaveProfile} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="flex items-center gap-6 pb-6 border-b border-gray-100 flex-wrap sm:flex-nowrap">
                                        <div
                                            className="relative group cursor-pointer"
                                            onClick={() => document.getElementById('avatar-upload').click()}
                                        >
                                            {formData.avatar ? (
                                                <div className="w-24 h-24 rounded-full overflow-hidden shadow-md">
                                                    <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <div className="w-24 h-24 bg-gradient-to-br from-indigo-650 to-violet-650 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-md">
                                                    {formData.name.charAt(0) || 'U'}
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Camera className="text-white" size={24} />
                                            </div>
                                            <input
                                                id="avatar-upload"
                                                type="file"
                                                accept="image/png, image/jpeg, image/jpg"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        if (file.size > 2 * 1024 * 1024) {
                                                            setMessage({ type: 'error', text: 'Kích thước ảnh tối đa 2MB' });
                                                            return;
                                                        }
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            setFormData({ ...formData, avatar: reader.result });
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-800">Ảnh đại diện</h3>
                                            <p className="text-sm text-slate-500 mt-1 mb-2">Chấp nhận JPG, PNG dung lượng tối đa 2MB</p>
                                            {formData.avatar && (
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, avatar: '' })}
                                                    className="px-3 py-1 bg-red-50 text-red-650 hover:bg-red-100 hover:text-red-755 font-semibold text-xs rounded-lg border border-red-200 shadow-sm transition-all cursor-pointer"
                                                >
                                                    Xóa ảnh đại diện
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <User size={16} className="text-gray-400" /> Họ và tên
                                            </label>
                                            <input
                                                type="text" name="name"
                                                value={formData.name} onChange={handleInputChange}
                                                className="w-full px-4 py-2.5 bg-white/70 border border-slate-200/80 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white placeholder:text-slate-400 transition-all outline-none shadow-inner font-medium text-sm"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Mail size={16} className="text-gray-400" /> Email <span className="text-xs text-gray-400 font-normal">(Không thể đổi)</span>
                                            </label>
                                            <input
                                                type="email" value={user?.email || ''} readOnly
                                                className="w-full px-4 py-2.5 !bg-slate-100/50 !border-slate-200 rounded-xl !text-slate-500 cursor-not-allowed outline-none font-medium text-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Phone size={16} className="text-gray-400" /> Số điện thoại
                                            </label>
                                            <input
                                                type="tel" name="phone"
                                                placeholder="Ví dụ: +84 123 456 789"
                                                value={formData.phone} onChange={handleInputChange}
                                                className="w-full px-4 py-2.5 bg-white/70 border border-slate-200/80 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white placeholder:text-slate-450 transition-all outline-none shadow-inner font-medium text-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <MapPin size={16} className="text-gray-400" /> Địa chỉ
                                            </label>
                                            <input
                                                type="text" name="address"
                                                value={formData.address} onChange={handleInputChange}
                                                className="w-full px-4 py-2.5 bg-white/70 border border-slate-200/80 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white placeholder:text-slate-400 transition-all outline-none shadow-inner font-medium text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <button disabled={loading} type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-100/30 transition-all cursor-pointer text-sm">
                                            <Save size={18} /> Lưu thay đổi
                                        </button>
                                    </div>
                                </form>
                            )}

                            {activeTab === 'professional' && (
                                <form onSubmit={handleSaveProfile} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="bg-indigo-50 border border-indigo-150 rounded-xl p-4 text-xs text-indigo-800 leading-relaxed shadow-sm">
                                        <span className="font-semibold block mb-1">💡 Tại sao cần cập nhật thông tin nghề nghiệp?</span>
                                        Các thông tin Kỹ năng, Kinh nghiệm và Học vấn này sẽ được sử dụng làm cơ sở để AI hỗ trợ bạn chấm điểm CV, đề xuất khóa học phù hợp và tối ưu hóa câu hỏi phỏng vấn thử nghiệm. Hãy điền đầy đủ và chi tiết nhất có thể!
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Kỹ năng (Cách nhau bằng dấu phẩy)</label>
                                        <input
                                            type="text" name="skills" placeholder="React, Node.js, Design..."
                                            value={formData.skills} onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 bg-white/70 border border-slate-200/80 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white placeholder:text-slate-400 transition-all outline-none shadow-inner font-medium text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Kinh nghiệm làm việc</label>
                                        <textarea
                                            name="experience" rows={4} placeholder="Mô tả kinh nghiệm của bạn..."
                                            value={formData.experience} onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 bg-white/70 border border-slate-200/80 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white placeholder:text-slate-400 transition-all outline-none shadow-inner font-medium text-sm resize-none"
                                        ></textarea>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Học vấn</label>
                                        <textarea
                                            name="education" rows={3} placeholder="Trường đại học, chứng chỉ..."
                                            value={formData.education} onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 bg-white/70 border border-slate-200/80 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white placeholder:text-slate-400 transition-all outline-none shadow-inner font-medium text-sm resize-none"
                                        ></textarea>
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <button disabled={loading} type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-100/30 transition-all cursor-pointer text-sm">
                                            <Save size={18} /> Lưu hồ sơ nghề nghiệp
                                        </button>
                                    </div>
                                </form>
                            )}

                            {activeTab === 'company' && (
                                <form onSubmit={handleSaveProfile} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    {/* Logo Công ty */}
                                    <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
                                        <div
                                            className="relative group cursor-pointer"
                                            onClick={() => document.getElementById('company-logo-upload').click()}
                                        >
                                            {formData.avatar ? (
                                                <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-md border border-gray-200">
                                                    <img src={formData.avatar} alt="Logo công ty" className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-violet-650 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-md">
                                                    {formData.companyName?.charAt(0) || 'C'}
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Camera className="text-white" size={24} />
                                            </div>
                                            <input
                                                id="company-logo-upload"
                                                type="file"
                                                accept="image/png, image/jpeg, image/jpg"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        if (file.size > 2 * 1024 * 1024) {
                                                            setMessage({ type: 'error', text: 'Kích thước ảnh tối đa 2MB' });
                                                            return;
                                                        }
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            setFormData({ ...formData, avatar: reader.result });
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-800">Logo công ty</h3>
                                            <p className="text-sm text-slate-500 mt-1">Chấp nhận JPG, PNG dung lượng tối đa 2MB. Logo hiển thị trên các tin tuyển dụng.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Tên công ty</label>
                                        <input
                                            type="text" name="companyName" placeholder="Tên doanh nghiệp của bạn"
                                            value={formData.companyName} onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 bg-white/70 border border-slate-200/80 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white placeholder:text-slate-400 transition-all outline-none shadow-inner font-medium text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Website công ty</label>
                                        <input
                                            type="text" name="companyWebsite" placeholder="https://..."
                                            value={formData.companyWebsite} onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 bg-white/70 border border-slate-200/80 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white placeholder:text-slate-400 transition-all outline-none shadow-inner font-medium text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Mô tả công ty</label>
                                        <textarea
                                            name="companyDescription" rows={5} placeholder="Giới thiệu về văn hóa, lĩnh vực hoạt động..."
                                            value={formData.companyDescription} onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 bg-white/70 border border-slate-200/80 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white placeholder:text-slate-400 transition-all outline-none shadow-inner font-medium text-sm resize-none"
                                        ></textarea>
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <button disabled={loading} type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-100/30 transition-all cursor-pointer text-sm">
                                            <Save size={18} /> Cập nhật công ty
                                        </button>
                                    </div>
                                </form>
                            )}

                            {activeTab === 'security' && (
                                <form onSubmit={handleSavePassword} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="max-w-md space-y-5">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Mật khẩu hiện tại</label>
                                            <div className="relative">
                                                <input
                                                    type={showOldPassword ? "text" : "password"} name="oldPassword"
                                                    value={passwordData.oldPassword} onChange={handlePasswordChange}
                                                    className="w-full px-4 py-2.5 pr-10 bg-white/70 border border-slate-200/80 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white placeholder:text-slate-400 transition-all outline-none shadow-inner font-medium text-sm"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowOldPassword(!showOldPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-600 transition-colors cursor-pointer"
                                                >
                                                    {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Mật khẩu mới</label>
                                            <div className="relative">
                                                <input
                                                    type={showNewPassword ? "text" : "password"} name="newPassword" minLength={6}
                                                    value={passwordData.newPassword} onChange={handlePasswordChange}
                                                    className="w-full px-4 py-2.5 pr-10 bg-white/70 border border-slate-200/80 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white placeholder:text-slate-400 transition-all outline-none shadow-inner font-medium text-sm"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-600 transition-colors cursor-pointer"
                                                >
                                                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                            <p className="text-xs text-slate-400 font-medium">Yêu cầu tối thiểu 6 ký tự.</p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Xác nhận mật khẩu mới</label>
                                            <div className="relative">
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"} name="confirmPassword" minLength={6}
                                                    value={passwordData.confirmPassword} onChange={handlePasswordChange}
                                                    className="w-full px-4 py-2.5 pr-10 bg-white/70 border border-slate-200/80 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white placeholder:text-slate-400 transition-all outline-none shadow-inner font-medium text-sm"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-600 transition-colors cursor-pointer"
                                                >
                                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="pt-4">
                                            <button disabled={loading} type="submit" className="flex items-center justify-center gap-2 w-full px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-100/30 transition-all cursor-pointer text-sm">
                                                <Lock size={18} /> Đổi mật khẩu
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}

                             {activeTab === 'billing' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 border border-white/10 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                        <div>
                                            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Gói dịch vụ hiện tại</p>
                                            <h3 className="text-2xl font-bold text-[#F5C518] mt-1">
                                                {activePackage || 'Đang tải...'}
                                            </h3>
                                            <p className="text-xs text-white/50 mt-1">Hạn mức credit hiện tại: {credits.toLocaleString('vi-VN')} credit</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => navigate('/credits')}
                                            className="px-5 py-2.5 bg-[#F5C518] text-[#0A2463] text-sm font-bold rounded-xl hover:bg-[#D4A800] transition-colors self-start sm:self-auto"
                                        >
                                            + Nạp thêm credit
                                        </button>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">
                                            Lịch sử nạp credit
                                        </h3>
                                        {billingLoading ? (
                                            <div className="text-center py-8">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-650 mx-auto"></div>
                                                <p className="text-sm text-slate-500 mt-2">Đang tải lịch sử giao dịch...</p>
                                            </div>
                                        ) : billingHistory.length > 0 ? (
                                            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                                                <table className="min-w-full divide-y divide-slate-200">
                                                    <thead className="bg-slate-50">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Mã đơn hàng</th>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Ngày tạo</th>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Gói nạp</th>
                                                            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Số tiền</th>
                                                            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Credit cộng</th>
                                                            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Trạng thái</th>
                                                            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Thao tác</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-slate-100">
                                                        {billingHistory.map((order) => (
                                                            <tr key={order._id} className="hover:bg-slate-50/50">
                                                                <td className="px-4 py-3 text-sm font-semibold text-slate-700">#{order.payosOrderCode}</td>
                                                                <td className="px-4 py-3 text-xs text-slate-500">
                                                                    {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                                                                        day: '2-digit', month: '2-digit', year: 'numeric',
                                                                        hour: '2-digit', minute: '2-digit'
                                                                    })}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-slate-800 font-medium">{order.packageName}</td>
                                                                <td className="px-4 py-3 text-sm text-right text-slate-900 font-bold">{(order.amount || 0).toLocaleString('vi-VN')}₫</td>
                                                                <td className="px-4 py-3 text-sm text-center text-emerald-600 font-bold">+{order.creditAmount?.toLocaleString('vi-VN')}</td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                                                                        order.status === 'PAID'
                                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                                            : order.status === 'PENDING'
                                                                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                                                            : 'bg-red-50 text-red-700 border border-red-200'
                                                                    }`}>
                                                                        {order.status === 'PAID' ? 'Thành công' : order.status === 'PENDING' ? 'Chờ quét mã' : 'Đã hủy'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    {order.status === 'PENDING' && order.checkoutUrl && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => navigate(`/credits?orderCode=${order.payosOrderCode}`)}
                                                                            className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                                                                        >
                                                                            Quét mã ngay
                                                                        </button>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-350">
                                                <p className="text-sm text-slate-500 font-medium">Bạn chưa thực hiện giao dịch nào.</p>
                                                <button
                                                    type="button"
                                                    onClick={() => navigate('/credits')}
                                                    className="mt-3 text-xs bg-indigo-650 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg cursor-pointer"
                                                >
                                                    Nạp credit đầu tiên
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
}
