import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { isJobSeekerRole, isEmployerRole } from '../utils/roles';
import { User, Lock, Briefcase, Camera, Building, Mail, Phone, MapPin, Save } from 'lucide-react';
import axios from 'axios';
import SeekerLayout from '../components/layout/SeekerLayout';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function Profile() {
    const { user, refreshUser } = useAuth();
    const credits = user?.credits ?? 0;
    const [activeTab, setActiveTab] = useState('general');

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

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                address: user.address || '',
                avatar: user.avatar || '',
                skills: user.skills ? user.skills.join(', ') : '',
                experience: user.experience || '',
                education: user.education || '',
                companyName: user.companyName || '',
                companyDescription: user.companyDescription || '',
                companyWebsite: user.companyWebsite || ''
            });
        }
    }, [user]);

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

    const tabBtn = (key) =>
        activeTab === key
            ? 'bg-[#F5C518]/10 text-[#0A2463] border-l-2 border-[#F5C518] font-bold'
            : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200/40 border-l-2 border-transparent';

    const isEmployer = isEmployerRole(user?.role);
    const PageWrapper = isEmployer ? ({ children }) => <div className="min-h-screen bg-[#F4F6FB]">{children}</div> : SeekerLayout;

    return (
        <PageWrapper title="Hồ sơ & Credit" breadcrumb="Tài khoản › Hồ sơ">
            <div className="max-w-5xl mx-auto w-full">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="md:col-span-2 bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl p-6 text-slate-800 shadow-md">
                        <p className="text-xs uppercase tracking-wider text-slate-500 mb-1 font-semibold">Số dư credit</p>
                        <p className="text-4xl font-bold text-[#F5C518]">{credits.toLocaleString('vi-VN')}</p>
                    </div>
                </div>

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
                        </div>
                    )}

                    {/* Content Area */}
                    <div className={isEmployer ? '' : 'md:col-span-3'}>
                        <div className="bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl p-6 sm:p-8 text-slate-800 shadow-md">

                            {message.text && (
                                <div className={`p-4 rounded-xl mb-6 text-sm flex items-center gap-2 backdrop-blur-md ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm' : 'bg-red-50 text-red-700 border border-red-200 shadow-sm'
                                    }`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    {message.text}
                                </div>
                            )}

                            {activeTab === 'general' && (
                                <form onSubmit={handleSaveProfile} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
                                        <div
                                            className="relative group cursor-pointer"
                                            onClick={() => document.getElementById('avatar-upload').click()}
                                        >
                                            {formData.avatar ? (
                                                <div className="w-24 h-24 rounded-full overflow-hidden shadow-md">
                                                    <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <div className="w-24 h-24 bg-gradient-to-br from-[#0A2463] to-[#1A3A7C] rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-md">
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
                                            <p className="text-sm text-slate-500 mt-1">Chấp nhận JPG, PNG dung lượng tối đa 2MB</p>
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
                                                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-[#0A2463] placeholder:text-slate-400 transition-all outline-none"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Mail size={16} className="text-gray-400" /> Email <span className="text-xs text-gray-400 font-normal">(Không thể đổi)</span>
                                            </label>
                                            <input
                                                type="email" value={user?.email || ''} readOnly
                                                className="w-full px-4 py-2.5 !bg-slate-100 !border-slate-200 rounded-xl !text-slate-500 cursor-not-allowed outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Phone size={16} className="text-gray-400" /> Số điện thoại
                                            </label>
                                            <input
                                                type="tel" name="phone"
                                                value={formData.phone} onChange={handleInputChange}
                                                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-[#0A2463] placeholder:text-slate-400 transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <MapPin size={16} className="text-gray-400" /> Địa chỉ
                                            </label>
                                            <input
                                                type="text" name="address"
                                                value={formData.address} onChange={handleInputChange}
                                                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-[#0A2463] placeholder:text-slate-400 transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <button disabled={loading} type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-[#F5C518] text-[#0A2463] font-bold rounded-xl hover:bg-[#D4A800] transition-colors">
                                            <Save size={18} /> Lưu thay đổi
                                        </button>
                                    </div>
                                </form>
                            )}

                            {activeTab === 'professional' && (
                                <form onSubmit={handleSaveProfile} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Kỹ năng (Cánh nhau bằng dấu phẩy)</label>
                                        <input
                                            type="text" name="skills" placeholder="React, Node.js, Design..."
                                            value={formData.skills} onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-[#0A2463] placeholder:text-slate-400 transition-all outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Kinh nghiệm làm việc</label>
                                        <textarea
                                            name="experience" rows={4} placeholder="Mô tả kinh nghiệm của bạn..."
                                            value={formData.experience} onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-[#0A2463] placeholder:text-slate-400 transition-all outline-none"
                                        ></textarea>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Học vấn</label>
                                        <textarea
                                            name="education" rows={3} placeholder="Trường đại học, chứng chỉ..."
                                            value={formData.education} onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-[#0A2463] placeholder:text-slate-400 transition-all outline-none"
                                        ></textarea>
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <button disabled={loading} type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-[#F5C518] text-[#0A2463] font-bold rounded-xl hover:bg-[#D4A800] transition-colors">
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
                                                <div className="w-24 h-24 bg-gradient-to-br from-[#0A2463] to-[#247BA0] rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-md">
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
                                            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-[#0A2463] placeholder:text-slate-400 transition-all outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Website công ty</label>
                                        <input
                                            type="text" name="companyWebsite" placeholder="https://..."
                                            value={formData.companyWebsite} onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-[#0A2463] placeholder:text-slate-400 transition-all outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Mô tả công ty</label>
                                        <textarea
                                            name="companyDescription" rows={5} placeholder="Giới thiệu về văn hóa, lĩnh vực hoạt động..."
                                            value={formData.companyDescription} onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-[#0A2463] placeholder:text-slate-400 transition-all outline-none"
                                        ></textarea>
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <button disabled={loading} type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-[#F5C518] text-[#0A2463] font-bold rounded-xl hover:bg-[#D4A800] transition-colors">
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
                                            <input
                                                type="password" name="oldPassword"
                                                value={passwordData.oldPassword} onChange={handlePasswordChange}
                                                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-[#0A2463] placeholder:text-slate-400 transition-all outline-none"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Mật khẩu mới</label>
                                            <input
                                                type="password" name="newPassword" minLength={6}
                                                value={passwordData.newPassword} onChange={handlePasswordChange}
                                                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-[#0A2463] placeholder:text-slate-400 transition-all outline-none"
                                                required
                                            />
                                            <p className="text-xs text-white/60">Yêu cầu tối thiểu 6 ký tự.</p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Xác nhận mật khẩu mới</label>
                                            <input
                                                type="password" name="confirmPassword" minLength={6}
                                                value={passwordData.confirmPassword} onChange={handlePasswordChange}
                                                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-[#0A2463] placeholder:text-slate-400 transition-all outline-none"
                                                required
                                            />
                                        </div>

                                        <div className="pt-4">
                                            <button disabled={loading} type="submit" className="flex items-center justify-center gap-2 w-full px-6 py-2.5 bg-[#F5C518] text-[#0A2463] font-bold rounded-xl hover:bg-[#D4A800] transition-colors">
                                                <Lock size={18} /> Đổi mật khẩu
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
}
