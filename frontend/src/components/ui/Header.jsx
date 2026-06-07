
import { Menu, X, Bell, Search, Settings as SettingsIcon, LogOut, User, ChevronDown, FileText, ClipboardList, BrainCircuit } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import axios from 'axios';

const ROLE_LABEL = {
    ADMIN: 'Quản trị viên',
    EMPLOYER: 'Nhà tuyển dụng',
    JOB_SEEKER: 'Ứng viên',
};

const PUBLIC_LINKS = [
    { to: '/', label: 'Trang chủ' },
    { to: '/about', label: 'Về chúng tôi' },
    { to: '/pricing', label: 'Bảng giá' },
    { to: '/jobs', label: 'Tìm việc làm' },
];

export default function Header({ variant = 'dark' }) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const isEmployer = user?.role === 'EMPLOYER' || user?.role === 'ADMIN';

    const [unreadCount, setUnreadCount] = useState(0);

    const notificationRef = useRef(null);
    const bellRef = useRef(null);
    const userMenuRef = useRef(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        if (!user) return;
        const fetchUnread = async () => {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            if (!token) return;
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/notifications`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const count = res.data?.filter(n => !n.isRead).length || 0;
                setUnreadCount(count);
            } catch (error) {
                console.error("Fetch unread count failed:", error);
            }
        };
        fetchUnread();
        const interval = setInterval(fetchUnread, 30000); // Poll every 30 seconds
        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (notificationRef.current && !notificationRef.current.contains(event.target) &&
                bellRef.current && !bellRef.current.contains(event.target)) {
                setIsNotificationOpen(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSignOut = () => {
        signOut();
        setIsUserMenuOpen(false);
        navigate('/');
    };

    const isActive = (path) => location.pathname === path;

    const headerClass = variant === 'dark'
        ? `sticky top-0 z-50 bg-transparent transition-all duration-300 ${scrolled ? 'bg-[#030A21]/70 backdrop-blur-md shadow-[0_2px_20px_rgba(3,10,33,0.3)] border-b border-white/5' : ''}`
        : 'sticky top-0 z-50 bg-white border-b border-[#DDE3F0] shadow-sm';

    return (
        <header className={headerClass}>
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-[68px]">
                    <Link to="/" className="flex items-center gap-2.5 min-w-0 pr-4 group">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
                            <img src="/logo-jobready.png" alt="JobReady logo" className="w-full h-full object-cover" />
                        </div>
                        <span className="font-heading text-2xl sm:text-3xl text-white tracking-wide">
                            JOB<span className="text-gold">READY</span>
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-1 lg:gap-2 flex-1 pl-6">
                        {!user ? (
                            PUBLIC_LINKS.map(({ to, label }) => (
                                <Link
                                    key={to}
                                    to={to}
                                    className={`nav-link-underline px-3 py-2 text-sm lg:text-[15px] font-medium transition-colors whitespace-nowrap ${
                                        isActive(to) ? 'text-[#F5C518]' : 'text-white/80 hover:text-[#F5C518]'
                                    }`}
                                >
                                    {label}
                                </Link>
                            ))
                        ) : (
                            <>
                                {!isEmployer && (
                                    <Link to="/jobs" className="px-3 py-2 text-sm text-white/80 hover:text-gold font-medium whitespace-nowrap">{t('navigation.jobSearch')}</Link>
                                )}
                                {user?.role === 'JOB_SEEKER' && (
                                    <>
                                        <Link to="/cv-upload" className="px-3 py-2 text-sm text-white/80 hover:text-gold font-medium whitespace-nowrap">{t('navigation.myCV')}</Link>
                                        <Link to="/my-applications" className="px-3 py-2 text-sm text-white/80 hover:text-gold font-medium whitespace-nowrap">{t('navigation.myApplications')}</Link>
                                        <Link to="/interview" className="flex items-center gap-1.5 px-3 py-2 text-sm text-[#F5C518] font-semibold whitespace-nowrap nav-link-underline">
                                            <BrainCircuit size={16} className="text-[#F5C518]" />{t('navigation.interview')}
                                        </Link>
                                    </>
                                )}
                                {isEmployer && (
                                    <Link to="/dashboard" className="px-3 py-2 text-sm text-white/80 hover:text-[#F5C518] font-medium whitespace-nowrap">Dashboard</Link>
                                )}
                            </>
                        )}
                    </nav>

                    <div className="flex items-center gap-2 sm:gap-3">
                        {user ? (
                            <>
                                <div className="hidden lg:block relative mr-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm..."
                                        className="w-[200px] pl-9 pr-4 py-2 bg-white/10 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold/50 text-sm text-white placeholder:text-white/40"
                                    />
                                </div>

                                <div className="relative">
                                    <button
                                        ref={bellRef}
                                        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                        className={`relative p-2 rounded-lg transition-colors ${isNotificationOpen ? 'bg-white/15 text-gold' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
                                    >
                                        <Bell size={20} />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gold border-2 border-[#0A2463] rounded-full animate-pulse"></span>
                                        )}
                                    </button>
                                    {isNotificationOpen && (
                                        <div ref={notificationRef}>
                                            <NotificationDropdown onClose={() => setIsNotificationOpen(false)} />
                                        </div>
                                    )}
                                </div>

                                <Link to="/profile" className="hidden sm:block p-2 text-white/80 hover:bg-white/10 rounded-lg transition-colors">
                                    <SettingsIcon size={20} />
                                </Link>



                                <div className="relative hidden sm:block" ref={userMenuRef}>
                                    <button
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-navy text-sm font-bold">
                                            {user.name?.charAt(0)?.toUpperCase() || <User size={16} />}
                                        </div>
                                        <div className="hidden lg:block text-left">
                                            <p className="text-sm font-medium text-white leading-tight">{user.name}</p>
                                            <p className="text-xs text-white/50">{ROLE_LABEL[user.role] || user.role}</p>
                                        </div>
                                        <ChevronDown size={14} className="text-white/50 hidden lg:block" />
                                    </button>

                                    {isUserMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <p className="text-sm font-semibold text-navy">{user.name}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                                <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-gold/20 text-navy rounded-full font-medium">
                                                    {ROLE_LABEL[user.role] || user.role}
                                                </span>
                                            </div>
                                            {user.role === 'JOB_SEEKER' ? (
                                                <>
                                                    <Link to="/my-applications" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                                        <ClipboardList size={15} /> {t('navigation.myApplications')}
                                                    </Link>
                                                    <Link to="/cv-upload" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                                        <FileText size={15} /> {t('navigation.myCV')}
                                                    </Link>
                                                    <Link to="/interview" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-navy hover:bg-gold/10">
                                                        <BrainCircuit size={15} /> {t('navigation.interview')}
                                                    </Link>
                                                </>
                                            ) : (
                                                <Link to="/dashboard" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                                    <User size={15} /> Dashboard
                                                </Link>
                                            )}
                                            <Link to="/profile" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                                <SettingsIcon size={15} /> {t('navigation.settings')}
                                            </Link>
                                            <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                                <LogOut size={15} /> {t('navigation.signOut')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="hidden sm:flex items-center gap-2">

                                <Link to="/login" className="px-4 py-2 text-sm border border-white/30 text-white rounded-md hover:bg-white/10 font-medium transition-colors">
                                    {t('auth.login')}
                                </Link>
                                <Link to="/register" className="px-5 py-2 text-sm bg-[#F5C518] text-[#0A2463] font-semibold rounded-md hover:bg-[#D4A800] transition-colors">
                                    {t('auth.register')}
                                </Link>
                            </div>
                        )}

                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {isOpen && (
                    <nav className="md:hidden pb-4 space-y-1 border-t border-white/10 pt-3">
                        {!user ? (
                            PUBLIC_LINKS.map(({ to, label }) => (
                                <Link key={to} to={to} onClick={() => setIsOpen(false)}
                                    className={`block px-3 py-2.5 rounded-lg font-medium ${isActive(to) ? 'text-gold bg-white/10' : 'text-white/80 hover:bg-white/5'}`}>
                                    {label}
                                </Link>
                            ))
                        ) : (
                            <>
                                {!isEmployer && (
                                    <Link to="/jobs" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 text-white/80 hover:bg-white/5 rounded-lg">{t('navigation.jobSearch')}</Link>
                                )}
                                {user?.role === 'JOB_SEEKER' && (
                                    <>
                                        <Link to="/cv-upload" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 text-white/80 hover:bg-white/5 rounded-lg">{t('navigation.myCV')}</Link>
                                        <Link to="/interview" onClick={() => setIsOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-gold font-medium hover:bg-white/5 rounded-lg">
                                            <BrainCircuit size={16} /> {t('navigation.interview')}
                                        </Link>
                                    </>
                                )}
                            </>
                        )}
                        {user ? (
                            <>
                                {isEmployer && (
                                    <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 text-white/80 hover:bg-white/5 rounded-lg">Dashboard</Link>
                                )}
                                {!isEmployer && (
                                    <Link to="/jobs" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 text-white/80 hover:bg-white/5 rounded-lg">{t('navigation.jobSearch')}</Link>
                                )}
                                <button onClick={handleSignOut} className="w-full text-left px-3 py-2.5 text-sm text-red-400 hover:bg-white/5 rounded-lg">{t('navigation.signOut')}</button>
                            </>
                        ) : (
                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                                <Link to="/login" onClick={() => setIsOpen(false)} className="text-center px-4 py-2.5 text-sm font-medium text-white border border-white/20 rounded-lg hover:bg-white/5">{t('auth.login')}</Link>
                                <Link to="/register" onClick={() => setIsOpen(false)} className="text-center px-4 py-2.5 text-sm font-bold btn-gold rounded-lg">{t('auth.register')}</Link>
                            </div>
                        )}
                    </nav>
                )}
            </div>
        </header>
    );
}
