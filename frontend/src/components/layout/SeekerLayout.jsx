import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Home, FileText, BrainCircuit, History, BarChart3, User, LogOut,
    Briefcase, ClipboardList, CreditCard, Plus, MessageSquare, BookOpen, PenTool
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const NAV = [
    { to: '/', label: 'Trang chủ', icon: Home, external: true },
    { to: '/jobs', label: 'Tìm việc', icon: Briefcase },
    { to: '/cv-upload', label: 'Chấm CV', icon: FileText },
    { to: '/interview', label: 'Phỏng vấn AI', icon: BrainCircuit },
    { to: '/learning', label: 'Học tập', icon: BookOpen },
    { to: '/interview-history', label: 'Lịch sử PV', icon: History },
    { to: '/interview-analytics', label: 'Phân tích', icon: BarChart3 },
    { to: '/my-applications', label: 'Ứng tuyển', icon: ClipboardList },
    { to: '/profile', label: 'Hồ sơ', icon: User },
    { to: '/write-blog', label: 'Viết Blog', icon: PenTool },
    { to: '/feedback', label: 'Feedback', icon: MessageSquare },
];

export default function SeekerLayout({ children, title, breadcrumb }) {
    const { user, signOut } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const credits = user?.credits ?? 6500;

    return (
        <div 
            className="min-h-screen flex bg-cover bg-center bg-no-repeat bg-fixed relative"
            style={{ backgroundImage: `url('/background3.jpg')` }}
        >
            {/* Premium backdrop-blur and dark-gradient overlay */}
            <div className="absolute inset-0 bg-[#030a21]/20 backdrop-blur-[0.5px] pointer-events-none" />

            <aside className="relative z-10 hidden lg:flex w-64 min-h-screen bg-[#030A21]/75 backdrop-blur-md flex-col flex-shrink-0 border-r border-white/10">
                <div className="p-5 border-b border-white/10">
                    <Link to="/" className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center flex-shrink-0 overflow-hidden">
                            <img src="/logo-jobready.png" alt="JobReady logo" className="w-full h-full object-cover" />
                        </div>
                        <span className="font-bold text-white text-lg tracking-tight">JOB<span className="text-[#F5C518]">READY</span></span>
                    </Link>
                </div>

                <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
                    {NAV.map(({ to, label, icon: Icon, external }) => {
                        const active = !external && location.pathname === to;
                        const cls = active
                            ? 'bg-[#F5C518]/20 text-[#F5C518] border-l-2 border-[#F5C518]'
                            : 'text-white/70 hover:bg-white/10 hover:text-white border-l-2 border-transparent';
                        if (external) {
                            return (
                                <Link key={to} to={to} className={`flex items-center gap-3 px-4 py-2.5 rounded-r-lg text-sm font-medium ${cls}`}>
                                    <Icon size={18} /> {label}
                                </Link>
                            );
                        }
                        return (
                            <Link key={to} to={to} className={`flex items-center gap-3 px-4 py-2.5 rounded-r-lg text-sm font-medium transition-colors ${cls}`}>
                                <Icon size={18} className={active ? 'text-[#F5C518]' : ''} /> {label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/10 space-y-3">
                    <div className="bg-white/10 rounded-xl p-4">
                        <p className="text-[10px] uppercase tracking-wider text-white/50 mb-1">Credit</p>
                        <p className="text-2xl font-bold text-[#F5C518]">{credits.toLocaleString('vi-VN')}</p>
                        <button
                            type="button"
                            onClick={() => navigate('/pricing')}
                            className="mt-3 w-full flex items-center justify-center gap-2 py-2 bg-[#F5C518] text-[#0A2463] text-sm font-bold rounded-lg hover:bg-[#D4A800]"
                        >
                            <Plus size={16} /> Nạp credit
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate('/profile')}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 text-white/80 text-sm"
                    >
                        <div className="w-9 h-9 rounded-full bg-[#F5C518] text-[#0A2463] font-bold flex items-center justify-center">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="text-left flex-1 min-w-0">
                            <p className="font-semibold text-white truncate">{user?.name}</p>
                            <p className="text-xs text-white/50 truncate">{user?.email}</p>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => { signOut(); navigate('/'); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-white/60 hover:text-white text-sm"
                    >
                        <LogOut size={16} /> Đăng xuất
                    </button>
                </div>
            </aside>

            <div className="relative z-10 flex-1 flex flex-col min-w-0">
                <header className="lg:hidden sticky top-0 z-40 bg-[#030A21]/80 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-white/10">
                    <Link to="/" className="flex items-center gap-2 font-bold text-white">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 overflow-hidden">
                            <img src="/logo-jobready.png" alt="JobReady logo" className="w-full h-full object-cover" />
                        </div>
                        <span>JOB<span className="text-[#F5C518]">READY</span></span>
                    </Link>
                    <span className="text-[#F5C518] font-bold text-sm">{credits} credit</span>
                </header>

                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
                    {breadcrumb && (
                        <p className="text-xs text-slate-800 font-bold mb-2">{breadcrumb}</p>
                    )}
                    {title && (
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mb-6">{title}</h1>
                    )}
                    {children}
                </main>
            </div>
        </div>
    );
}
