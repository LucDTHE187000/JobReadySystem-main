import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
    Users, Briefcase, BarChart3, Shield, Search, ChevronLeft, ChevronRight,
    Lock, Unlock, Trash2, CheckCircle, XCircle, Clock, TrendingUp,
    UserCheck, FileText, LayoutDashboard, LogOut, AlertTriangle,
    Building2, CheckCircle2, Ban, Eye, Bell, CreditCard
} from "lucide-react";

const API = "http://localhost:4000/api/admin";

function getToken() {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
}

function authHeader() {
    return { Authorization: `Bearer ${getToken()}` };
}

// ============================================================
// SIDEBAR NAV
// ============================================================
const ADMIN_NAV = [
    { id: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
    { id: "users", label: "Người dùng", icon: Users },
    { id: "employers", label: "Duyệt doanh nghiệp", icon: Building2 },
    { id: "jobs", label: "Tin tuyển dụng", icon: Briefcase },
    { id: "payments", label: "Quản lý thanh toán", icon: CreditCard },
];

function AdminSidebar({ active, setActive, user, onLogout, pendingCount }) {
    const navigate = useNavigate();
    return (
        <aside className="w-64 min-h-screen bg-slate-900/45 border-r border-white/10 backdrop-blur-md flex flex-col flex-shrink-0 shadow-xl relative z-10">
            <div className="p-5 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center font-bold text-white text-sm">JR</div>
                    <span className="font-bold text-white text-lg">JOB<span className="text-indigo-400">READY</span></span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                    <Shield size={14} className="text-indigo-400" />
                    <span className="text-indigo-450 text-xs font-semibold uppercase tracking-wider">Admin Panel</span>
                </div>
            </div>

            <nav className="flex-1 p-3 space-y-1">
                {ADMIN_NAV.map(({ id, label, icon: Icon }) => {
                    const isActive = active === id;
                    const showBadge = id === "employers" && pendingCount > 0;
                    return (
                        <button
                            key={id}
                            onClick={() => setActive(id)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border-l-2 ${isActive
                                ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500 shadow-inner'
                                : 'text-white/60 hover:bg-white/5 hover:text-white border-transparent'
                                }`}
                        >
                            <Icon size={18} /> {label}
                            {showBadge && (
                                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                                    {pendingCount > 99 ? '99+' : pendingCount}
                                </span> 
                             )}
                        </button>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/10">
                <div 
                    onClick={() => navigate("/profile")}
                    className="flex items-center gap-3 mb-3 px-2 cursor-pointer hover:bg-white/5 p-1.5 rounded-xl transition-all"
                    title="Xem hồ sơ cá nhân"
                >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-bold flex items-center justify-center text-sm shadow-md">
                        {user?.name?.charAt(0) || "A"}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                        <p className="font-semibold text-white text-sm truncate">{user?.name}</p>
                        <p className="text-[10px] text-white/40">Xem hồ sơ</p>
                    </div>
                </div>
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-white/50 hover:text-white text-sm rounded-xl hover:bg-white/5 transition-all"
                >
                    <LogOut size={16} /> Đăng xuất
                </button>
            </div>
        </aside>
    );
}

// ============================================================
// DASHBOARD TAB
// ============================================================
function DashboardTab({ onNavigate }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${API}/stats`, { headers: authHeader() })
            .then(r => setStats(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-650" /></div>;

    const cards = [
        { label: "Tổng người dùng", value: stats?.totalUsers, icon: Users, color: "bg-blue-500", light: "bg-blue-50", textColor: "text-blue-600" },
        { label: "Job Seeker", value: stats?.totalJobSeekers, icon: UserCheck, color: "bg-green-500", light: "bg-green-50", textColor: "text-green-600" },
        { label: "Nhà tuyển dụng", value: stats?.totalEmployers, icon: Building2, color: "bg-orange-500", light: "bg-orange-50", textColor: "text-orange-600" },
        { label: "Tin tuyển dụng", value: stats?.totalJobs, icon: FileText, color: "bg-purple-500", light: "bg-purple-50", textColor: "text-purple-600" },
        { label: "Lượt ứng tuyển", value: stats?.totalApplications, icon: BarChart3, color: "bg-pink-500", light: "bg-pink-50", textColor: "text-pink-600" },
        { label: "Đang tuyển", value: stats?.openJobs, icon: TrendingUp, color: "bg-teal-500", light: "bg-teal-50", textColor: "text-teal-600" },
        { label: "Người dùng mới (7 ngày)", value: stats?.newUsersThisWeek, icon: Users, color: "bg-indigo-500", light: "bg-indigo-50", textColor: "text-indigo-600" },
        { label: "Ứng tuyển mới (7 ngày)", value: stats?.newApplicationsThisWeek, icon: TrendingUp, color: "bg-yellow-500", light: "bg-yellow-50", textColor: "text-yellow-600" },
    ];

    return (
        <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-white/60 shadow-xl shadow-slate-900/5">
                <h2 className="text-2xl font-bold tracking-tight text-slate-800 mb-1">Tổng quan hệ thống</h2>
                <p className="text-sm text-slate-500 font-medium">Dữ liệu thống kê realtime từ cơ sở dữ liệu</p>
            </div>

            {/* Alert if pending employers */}
            {stats?.pendingEmployers > 0 && (
                <div
                    className="flex items-center gap-4 p-4 bg-amber-50/65 backdrop-blur-sm border border-amber-200/60 rounded-2xl cursor-pointer hover:bg-amber-100/60 transition-all shadow-md shadow-slate-900/5"
                    onClick={() => onNavigate('employers')}
                >
                    <div className="bg-amber-100 p-2.5 rounded-xl flex-shrink-0">
                        <Bell size={20} className="text-amber-600" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-amber-800 text-sm">
                            Có <span className="font-bold">{stats.pendingEmployers}</span> nhà tuyển dụng đang chờ duyệt
                        </p>
                        <p className="text-xs text-amber-600 mt-0.5 font-medium">Nhấn để xem và duyệt ngay</p>
                    </div>
                    <ChevronRight size={16} className="text-amber-500 flex-shrink-0" />
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {cards.map((card, i) => (
                    <div key={i} className="bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-white/60 shadow-xl shadow-slate-900/5 hover:-translate-y-0.5 transition-all duration-300">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`${card.light} p-3 rounded-xl`}>
                                <card.icon size={22} className={card.textColor} />
                            </div>
                        </div>
                        <p className="text-xs font-semibold text-slate-500 mb-1">{card.label}</p>
                        <p className={`text-3xl font-bold tracking-tight ${card.textColor}`}>{card.value?.toLocaleString() ?? "—"}</p>
                    </div>
                ))}
            </div>

            <div className="bg-slate-900/85 backdrop-blur-md rounded-2xl p-6 border border-white/10 text-white shadow-xl shadow-slate-900/5">
                <div className="flex items-start gap-4">
                    <div className="bg-[#F5C518]/20 p-3 rounded-xl">
                        <Shield size={24} className="text-[#F5C518]" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-1 text-white">Admin Control Panel</h3>
                        <p className="text-slate-300 text-sm leading-relaxed font-medium">
                            Bạn đang truy cập với quyền Admin. Mọi thay đổi đều có hiệu lực ngay lập tức.
                            Hãy thận trọng khi xóa hoặc khóa tài khoản.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================================
// USERS TAB
// ============================================================
function UsersTab() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit: 15 };
            if (search) params.search = search;
            if (roleFilter) params.role = roleFilter;
            const res = await axios.get(`${API}/users`, { headers: authHeader(), params });
            setUsers(res.data.users || []);
            setTotal(res.data.total || 0);
            setTotalPages(res.data.totalPages || 1);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [search, roleFilter, page]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const toggleActive = async (userId, currentState) => {
        if (!window.confirm(`Bạn có chắc muốn ${currentState ? "khóa" : "mở khóa"} tài khoản này?`)) return;
        try {
            await axios.put(`${API}/users/${userId}/toggle-active`, {}, { headers: authHeader() });
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !u.isActive } : u));
        } catch (e) {
            alert("Có lỗi xảy ra");
        }
    };

    const roleLabel = { ADMIN: "Admin", EMPLOYER: "Nhà tuyển dụng", JOB_SEEKER: "Job Seeker" };
    const roleBadge = {
        ADMIN: "bg-purple-50 text-purple-700 border-purple-100",
        EMPLOYER: "bg-orange-50 text-orange-700 border-orange-100",
        JOB_SEEKER: "bg-blue-50 text-blue-700 border-blue-100",
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-white/60 shadow-xl shadow-slate-900/5">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800">Quản lý người dùng</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                        Tổng <span className="font-bold text-indigo-650 underline decoration-indigo-500/30">{total}</span> người dùng
                    </p>
                </div>
            </div>

            <div className="bg-white/80 backdrop-blur-md border border-white/60 p-4 rounded-2xl shadow-xl shadow-slate-900/5 flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Tìm tên hoặc email..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 placeholder-slate-400 bg-white/70 font-medium transition-all shadow-inner focus:border-transparent outline-none"
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
                    className="bg-white/70 border border-slate-200/80 rounded-xl px-3 py-2 text-sm text-slate-705 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                >
                    <option value="">Tất cả vai trò</option>
                    <option value="JOB_SEEKER">Job Seeker</option>
                    <option value="EMPLOYER">Nhà tuyển dụng</option>
                    <option value="ADMIN">Admin</option>
                </select>
            </div>

            <div className="bg-white/80 border border-white/60 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl shadow-slate-900/5">
                <div className="overflow-x-auto">
                    <table className="w-full table-fixed text-sm">
                        <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 uppercase text-xs font-bold">
                            <tr>
                                <th className="text-left p-4 font-semibold w-[32%]">Người dùng</th>
                                <th className="text-left p-4 font-semibold w-[15%]">Vai trò</th>
                                <th className="text-left p-4 font-semibold w-[13%]">Credits</th>
                                <th className="text-left p-4 font-semibold w-[13%]">Ngày tạo</th>
                                <th className="text-left p-4 font-semibold w-[15%]">Trạng thái</th>
                                <th className="text-left p-4 font-semibold w-[12%]">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-750 font-medium">
                            {loading ? (
                                <tr><td colSpan={6} className="text-center p-6 font-bold text-slate-500">Đang tải...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={6} className="text-center p-6 font-bold text-slate-500">Không có dữ liệu</td></tr>
                            ) : users.map(u => (
                                <tr key={u._id} className="border-t border-slate-100 hover:bg-white/40 transition-colors text-slate-750">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
                                                {u.name?.charAt(0) || "?"}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-slate-800 truncate">{u.name}</p>
                                                <p className="text-xs text-slate-500 font-medium truncate">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleBadge[u.role] || 'bg-gray-100 text-gray-600'}`}>
                                            {roleLabel[u.role] || u.role}
                                        </span>
                                    </td>
                                    <td className="p-4 font-mono text-indigo-650 font-bold">
                                        {u.credits?.toLocaleString() ?? "—"}
                                    </td>
                                    <td className="p-4 text-slate-500 font-medium">
                                        {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${u.isActive !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                            {u.isActive !== false ? <><CheckCircle size={11} /> Hoạt động</> : <><XCircle size={11} /> Bị khóa</>}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => toggleActive(u._id, u.isActive !== false)}
                                            disabled={u.role === 'ADMIN'}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${u.isActive !== false
                                                ? 'bg-red-50 text-red-650 hover:bg-red-100/80 border-red-100 shadow-sm'
                                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80 border-emerald-100 shadow-sm'
                                                }`}
                                        >
                                            {u.isActive !== false ? <><Lock size={13} /> Khóa</> : <><Unlock size={13} /> Mở khóa</>}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-slate-100">
                        <p className="text-xs text-slate-500 font-medium">Trang {page} / {totalPages}</p>
                        <div className="flex gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-xl border border-slate-200 bg-white/80 text-slate-700 hover:bg-slate-50 disabled:opacity-40 shadow-sm transition-all">
                                <ChevronLeft size={16} />
                            </button>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-xl border border-slate-200 bg-white/80 text-slate-700 hover:bg-slate-50 disabled:opacity-40 shadow-sm transition-all">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
// EMPLOYERS TAB (Duyệt doanh nghiệp)
// ============================================================
function EmployersTab() {
    const [employers, setEmployers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("pending"); // pending | approved | all
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const fetchEmployers = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit: 10 };
            if (search) params.search = search;
            if (filter === "pending") params.isApproved = "false";
            else if (filter === "approved") params.isApproved = "true";
            const res = await axios.get(`${API}/employers`, { headers: authHeader(), params });
            setEmployers(res.data.employers || []);
            setTotal(res.data.total || 0);
            setTotalPages(res.data.totalPages || 1);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [search, filter, page]);

    useEffect(() => { fetchEmployers(); }, [fetchEmployers]);

    const handleApproval = async (userId, isApproved) => {
        const action = isApproved ? "duyệt" : "từ chối";
        if (!window.confirm(`Bạn có chắc muốn ${action} nhà tuyển dụng này?`)) return;
        try {
            await axios.put(`${API}/employers/${userId}/approval`, { isApproved }, { headers: authHeader() });
            setEmployers(prev => prev.map(e =>
                e._id === userId ? { ...e, isApproved, isActive: isApproved } : e
            ));
            // Re-fetch to update count
            fetchEmployers();
        } catch (e) {
            alert("Có lỗi xảy ra");
        }
    };

    const FILTER_TABS = [
        { key: "pending", label: "Chờ duyệt", color: "text-amber-600" },
        { key: "approved", label: "Đã duyệt", color: "text-green-600" },
        { key: "all", label: "Tất cả", color: "text-gray-600" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-white/60 shadow-xl shadow-slate-900/5">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800">Duyệt doanh nghiệp</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                        Kiểm duyệt và phê duyệt tài khoản Nhà tuyển dụng
                    </p>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex gap-1 bg-white/70 backdrop-blur-md border border-slate-200/80 rounded-xl p-1 shadow-sm w-fit">
                    {FILTER_TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => { setFilter(tab.key); setPage(1); }}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${filter === tab.key
                                ? 'bg-indigo-650 text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="bg-white/80 backdrop-blur-md border border-white/60 p-3 rounded-2xl shadow-xl shadow-slate-900/5 flex-1 w-full md:max-w-md">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Tìm tên, email hoặc tên công ty..."
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 placeholder-slate-400 bg-white/70 font-medium transition-all shadow-inner focus:border-transparent outline-none"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white/80 border border-white/60 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl shadow-slate-900/5">
                <div className="overflow-x-auto">
                    <table className="w-full table-fixed text-sm">
                        <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 uppercase text-xs font-bold">
                            <tr>
                                <th className="text-left p-4 font-semibold w-[30%]">Nhà tuyển dụng</th>
                                <th className="text-left p-4 font-semibold w-[22%]">Công ty</th>
                                <th className="text-left p-4 font-semibold w-[16%]">Ngày đăng ký</th>
                                <th className="text-left p-4 font-semibold w-[16%]">Trạng thái</th>
                                <th className="text-left p-4 font-semibold w-[16%]">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-750 font-medium">
                            {loading ? (
                                <tr><td colSpan={5} className="text-center p-8 font-bold text-slate-500">Đang tải...</td></tr>
                            ) : employers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-16 text-center">
                                        <Building2 size={40} className="text-slate-300 mx-auto mb-3" />
                                        <p className="text-slate-400 font-bold">
                                            {filter === "pending" ? "Không có nhà tuyển dụng nào chờ duyệt" : "Không có dữ liệu"}
                                        </p>
                                    </td>
                                </tr>
                            ) : employers.map(emp => (
                                <tr key={emp._id} className="border-t border-slate-100 hover:bg-white/40 transition-colors text-slate-750">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm">
                                                {emp.name?.charAt(0) || "?"}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-slate-800 truncate">{emp.name}</p>
                                                <p className="text-xs text-slate-500 font-medium truncate">{emp.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-700 font-medium truncate">
                                        {emp.companyName || <span className="text-slate-400 italic font-normal">Chưa cập nhật</span>}
                                    </td>
                                    <td className="p-4 text-slate-500 font-medium">
                                        {new Date(emp.createdAt).toLocaleDateString("vi-VN")}
                                    </td>
                                    <td className="p-4">
                                        {emp.isApproved ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-100">
                                                <CheckCircle2 size={11} /> Đã duyệt
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-amber-50 text-amber-700 border-amber-100">
                                                <Clock size={11} /> Chờ duyệt
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            {!emp.isApproved ? (
                                                <>
                                                    <button
                                                        onClick={() => handleApproval(emp._id, true)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-750 hover:bg-emerald-100/80 border border-emerald-100 rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer"
                                                    >
                                                        <CheckCircle2 size={13} /> Duyệt
                                                    </button>
                                                    <button
                                                        onClick={() => handleApproval(emp._id, false)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-650 hover:bg-red-100/80 border border-red-105 rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer"
                                                    >
                                                        <Ban size={13} /> Từ chối
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => handleApproval(emp._id, false)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-605 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer"
                                                >
                                                    <Ban size={13} /> Thu hồi
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-slate-100">
                        <p className="text-xs text-slate-500 font-medium">Trang {page} / {totalPages} — Tổng {total} nhà tuyển dụng</p>
                        <div className="flex gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-xl border border-slate-200 bg-white/80 text-slate-700 hover:bg-slate-50 disabled:opacity-40 shadow-sm transition-all">
                                <ChevronLeft size={16} />
                            </button>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-xl border border-slate-200 bg-white/80 text-slate-700 hover:bg-slate-50 disabled:opacity-40 shadow-sm transition-all">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function JobsTab() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit: 15 };
            if (search) params.search = search;
            if (statusFilter) params.status = statusFilter;
            const res = await axios.get(`${API}/jobs`, { headers: authHeader(), params });
            setJobs(res.data.jobs || []);
            setTotal(res.data.total || 0);
            setTotalPages(res.data.totalPages || 1);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter, page]);

    useEffect(() => { fetchJobs(); }, [fetchJobs]);

    const updateStatus = async (jobId, status) => {
        try {
            await axios.put(`${API}/jobs/${jobId}/status`, { status }, { headers: authHeader() });
            setJobs(prev => prev.map(j => j._id === jobId ? { ...j, status } : j));
        } catch (e) {
            alert("Có lỗi xảy ra");
        }
    };

    const deleteJob = async (jobId) => {
        if (!window.confirm("Bạn có chắc muốn xóa tin tuyển dụng này? Tất cả đơn ứng tuyển liên quan cũng sẽ bị xóa.")) return;
        try {
            await axios.delete(`${API}/jobs/${jobId}`, { headers: authHeader() });
            setJobs(prev => prev.filter(j => j._id !== jobId));
            setTotal(t => t - 1);
        } catch (e) {
            alert("Có lỗi xảy ra");
        }
    };

    const statusBadge = {
        open: "bg-emerald-50 text-emerald-700 border-emerald-100",
        closed: "bg-slate-100 text-slate-600 border-slate-200",
        pending: "bg-amber-50 text-amber-705 border-amber-100",
    };
    const statusLabel = { open: "Đang mở", closed: "Đã đóng", pending: "Chờ duyệt" };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-white/60 shadow-xl shadow-slate-900/5">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800">Quản lý tin tuyển dụng</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">Tổng <span className="font-bold text-indigo-650 underline decoration-indigo-500/30">{total}</span> tin tuyển dụng</p>
                </div>
            </div>

            <div className="bg-white/80 backdrop-blur-md border border-white/60 p-4 rounded-2xl shadow-xl shadow-slate-900/5 flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Tìm tiêu đề hoặc địa điểm..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 placeholder-slate-400 bg-white/70 font-medium transition-all shadow-inner focus:border-transparent outline-none"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                    className="bg-white/70 border border-slate-200/80 rounded-xl px-3 py-2 text-sm text-slate-705 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="open">Đang mở</option>
                    <option value="closed">Đã đóng</option>
                    <option value="pending">Chờ duyệt</option>
                </select>
            </div>

            <div className="bg-white/80 border border-white/60 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl shadow-slate-900/5">
                <div className="overflow-x-auto">
                    <table className="w-full table-fixed text-sm">
                        <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 uppercase text-xs font-bold">
                            <tr>
                                <th className="text-left p-4 font-semibold w-[26%]">Tiêu đề</th>
                                <th className="text-left p-4 font-semibold w-[20%]">Công ty</th>
                                <th className="text-left p-4 font-semibold w-[16%]">Địa điểm</th>
                                <th className="text-left p-4 font-semibold w-[14%]">Ngày đăng</th>
                                <th className="text-left p-4 font-semibold w-[12%]">Trạng thái</th>
                                <th className="text-left p-4 font-semibold w-[12%]">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-750 font-medium">
                            {loading ? (
                                <tr><td colSpan={6} className="text-center p-8 font-bold text-slate-500">Đang tải...</td></tr>
                            ) : jobs.length === 0 ? (
                                <tr><td colSpan={6} className="text-center p-8 font-bold text-slate-500">Không có dữ liệu</td></tr>
                            ) : jobs.map(j => (
                                <tr key={j._id} className="border-t border-slate-100 hover:bg-white/40 transition-colors text-slate-750">
                                    <td className="p-4">
                                        <p className="font-semibold text-slate-800 truncate" title={j.title}>{j.title}</p>
                                        <p className="text-xs text-slate-500 font-medium mt-0.5">{j.jobType}</p>
                                    </td>
                                    <td className="p-4 text-slate-700 font-medium truncate" title={j.recruiterId?.companyName || j.recruiterId?.name || ""}>
                                        {j.recruiterId?.companyName || j.recruiterId?.name || "—"}
                                    </td>
                                    <td className="p-4 text-slate-505 truncate">
                                        {j.location?.city
                                            ? `${j.location.city}${j.location.country ? ', ' + j.location.country : ''}`
                                            : "—"}
                                    </td>
                                    <td className="p-4 text-slate-500 font-medium">
                                        {new Date(j.createdAt).toLocaleDateString("vi-VN")}
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusBadge[j.status] || 'bg-gray-100 text-gray-650'}`}>
                                            {j.status === 'open' && <CheckCircle size={11} />}
                                            {j.status === 'closed' && <XCircle size={11} />}
                                            {j.status === 'pending' && <Clock size={11} />}
                                            {statusLabel[j.status] || j.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={j.status}
                                                onChange={e => updateStatus(j._id, e.target.value)}
                                                className="text-xs font-semibold bg-white/80 border border-slate-205 rounded-xl px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                            >
                                                <option value="open">Mở</option>
                                                <option value="closed">Đóng</option>
                                                <option value="pending">Chờ duyệt</option>
                                            </select>
                                            <button
                                                onClick={() => deleteJob(j._id)}
                                                className="p-1.5 bg-red-50 text-red-650 hover:bg-red-100/80 border border-red-100 rounded-xl transition-all shadow-sm cursor-pointer"
                                                title="Xóa tin tuyển dụng"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-slate-100">
                        <p className="text-xs text-slate-500 font-medium">Trang {page} / {totalPages}</p>
                        <div className="flex gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-xl border border-slate-200 bg-white/80 text-slate-700 hover:bg-slate-50 disabled:opacity-40 shadow-sm transition-all">
                                <ChevronLeft size={16} />
                            </button>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-xl border border-slate-200 bg-white/80 text-slate-700 hover:bg-slate-50 disabled:opacity-40 shadow-sm transition-all">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================================
// PAYMENTS TAB (PAYOS STYLE)
// ============================================================
function PaymentsTab() {
    const [payments, setPayments] = useState([]);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        successCount: 0,
        pendingCount: 0,
        cancelledCount: 0,
        totalCount: 0
    });
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [hoveredPoint, setHoveredPoint] = useState(null);

    const fetchPayments = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit: 10 };
            if (search) params.search = search;
            if (statusFilter) params.status = statusFilter;
            const res = await axios.get(`${API}/payments`, {
                headers: authHeader(),
                params
            });
            setPayments(res.data.payments || []);
            setStats(res.data.stats || {
                totalRevenue: 0,
                successCount: 0,
                pendingCount: 0,
                cancelledCount: 0,
                totalCount: 0
            });
            setChartData(res.data.chartData || []);
            setTotalPages(res.data.totalPages || 1);
        } catch (e) {
            console.error("Error fetching payments:", e);
        } finally {
            setLoading(false);
        }
    }, [page, search, statusFilter]);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    // Handle search input
    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleFilterStatus = (status) => {
        setStatusFilter(status);
        setPage(1);
    };

    // SVG Line chart computations
    const renderChart = () => {
        if (!chartData || chartData.length === 0) return null;
        
        const width = 800;
        const height = 240;
        const paddingLeft = 70;
        const paddingRight = 20;
        const paddingTop = 20;
        const paddingBottom = 40;
        
        const chartWidth = width - paddingLeft - paddingRight;
        const chartHeight = height - paddingTop - paddingBottom;
        
        const maxVal = Math.max(...chartData.map(d => d.revenue), 100000);
        
        // Compute coordinates
        const points = chartData.map((d, index) => {
            const x = paddingLeft + (index / (chartData.length - 1)) * chartWidth;
            const y = (paddingTop + chartHeight) - (d.revenue / maxVal) * chartHeight;
            return { x, y, data: d };
        });
        
        // Generate path
        const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
        
        // Generate area path
        const areaPath = points.length > 0 
            ? `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
            : '';

        // Generate Y axis grid lines (4 lines)
        const gridLines = [];
        for (let i = 0; i <= 4; i++) {
            const ratio = i / 4;
            const y = paddingTop + chartHeight - ratio * chartHeight;
            const value = ratio * maxVal;
            gridLines.push({ y, value });
        }
        
        return (
            <div className="relative w-full overflow-x-auto">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[700px] h-auto overflow-visible select-none">
                    <defs>
                        <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.35"/>
                            <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.0"/>
                        </linearGradient>
                    </defs>

                    {/* Grid Lines */}
                    {gridLines.map((line, i) => (
                        <g key={i} className="opacity-40">
                            <line 
                                x1={paddingLeft} 
                                y1={line.y} 
                                x2={width - paddingRight} 
                                y2={line.y} 
                                stroke="rgba(203, 213, 225, 0.4)" 
                                strokeWidth="1"
                                strokeDasharray="4 4"
                            />
                            <text 
                                x={paddingLeft - 8} 
                                y={line.y + 4} 
                                fill="#4B5563" 
                                fontSize="10" 
                                textAnchor="end"
                                className="font-mono font-bold text-slate-700"
                            >
                                {line.value >= 1000000 ? `${(line.value / 1000000).toFixed(1)}M` : `${(line.value / 1000).toFixed(0)}K`}
                            </text>
                        </g>
                    ))}

                    {/* Area Path under line */}
                    {areaPath && (
                        <path d={areaPath} fill="url(#chart-grad)" />
                    )}

                    {/* Main Line Path */}
                    {linePath && (
                        <path 
                            d={linePath} 
                            fill="none" 
                            stroke="#4F46E5" 
                            strokeWidth="3" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                        />
                    )}

                    {/* X Axis labels */}
                    {points.map((p, i) => {
                        // Show labels for every 2 days to avoid overlap
                        if (i % 2 !== 0 && i !== points.length - 1) return null;
                        const dateObj = new Date(p.data.date);
                        const label = `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;
                        return (
                            <text 
                                key={i} 
                                x={p.x} 
                                y={height - paddingBottom + 18} 
                                fill="#374151" 
                                fontSize="10" 
                                textAnchor="middle"
                                className="font-bold text-slate-700"
                            >
                                {label}
                            </text>
                        );
                    })}

                    {/* Interactive Circles */}
                    {points.map((p, i) => (
                        <g key={i} className="group cursor-pointer">
                            <circle 
                                cx={p.x} 
                                cy={p.y} 
                                r="4" 
                                fill="#4F46E5" 
                                stroke="#FFFFFF" 
                                strokeWidth="2"
                                className="transition-all duration-150 hover:r-6"
                                onMouseEnter={() => setHoveredPoint({ x: p.x, y: p.y, data: p.data })}
                                onMouseLeave={() => setHoveredPoint(null)}
                            />
                            <circle 
                                cx={p.x} 
                                cy={p.y} 
                                r="12" 
                                fill="transparent" 
                                onMouseEnter={() => setHoveredPoint({ x: p.x, y: p.y, data: p.data })}
                                onMouseLeave={() => setHoveredPoint(null)}
                            />
                        </g>
                    ))}
                </svg>

                {/* Tooltip Overlay */}
                {hoveredPoint && (
                    <div 
                        className="absolute bg-slate-900/95 text-white px-3 py-2 rounded-xl shadow-lg border border-slate-700 text-xs pointer-events-none z-10 flex flex-col gap-0.5"
                        style={{
                            left: `${(hoveredPoint.x / width) * 100}%`,
                            top: `${((hoveredPoint.y + (hoveredPoint.y < 85 ? 16 : -52)) / height) * 100}%`,
                            transform: "translateX(-50%)"
                        }}
                    >
                        <span className="font-bold text-[10px] text-gray-400 uppercase tracking-wider">
                            {new Date(hoveredPoint.data.date).toLocaleDateString("vi-VN", { dateStyle: "medium" })}
                        </span>
                        <span className="font-semibold text-sky-400">
                            Doanh thu: {hoveredPoint.data.revenue.toLocaleString("vi-VN")} đ
                        </span>
                        <span className="text-gray-300">
                            {hoveredPoint.data.count} giao dịch thành công
                        </span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-white/60 shadow-xl shadow-slate-900/5">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800">Quản lý thanh toán</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">Giám sát doanh thu và lịch sử giao dịch PayOS thực tế</p>
                </div>
                <button 
                    onClick={fetchPayments} 
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-white/85 border border-slate-250/70 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-all text-sm cursor-pointer self-start sm:self-center"
                >
                    Tải lại dữ liệu
                </button>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Doanh thu */}
                <div className="bg-white/80 border border-white/60 backdrop-blur-md rounded-2xl p-5 shadow-xl shadow-slate-900/5 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Doanh thu (Paid)</p>
                        <p className="text-2xl font-bold text-emerald-600">{(stats.totalRevenue || 0).toLocaleString("vi-VN")} đ</p>
                    </div>
                    <div className="bg-emerald-50 p-3 rounded-xl">
                        <TrendingUp size={24} className="text-emerald-600" />
                    </div>
                </div>

                {/* Tổng giao dịch */}
                <div className="bg-white/80 border border-white/60 backdrop-blur-md rounded-2xl p-5 shadow-xl shadow-slate-900/5 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng đơn hàng</p>
                        <p className="text-2xl font-bold text-indigo-650">{(stats.totalCount || 0).toLocaleString("vi-VN")}</p>
                    </div>
                    <div className="bg-indigo-50 p-3 rounded-xl">
                        <FileText size={24} className="text-indigo-600" />
                    </div>
                </div>

                {/* Thành công */}
                <div className="bg-white/80 border border-white/60 backdrop-blur-md rounded-2xl p-5 shadow-xl shadow-slate-900/5 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Thành công</p>
                        <p className="text-2xl font-bold text-emerald-600">{stats.successCount || 0}</p>
                        <p className="text-[10px] text-slate-400 font-medium">
                            Tỉ lệ: {stats.totalCount ? Math.round((stats.successCount / stats.totalCount) * 100) : 0}%
                        </p>
                    </div>
                    <div className="bg-emerald-50 p-3 rounded-xl">
                        <CheckCircle size={24} className="text-emerald-600" />
                    </div>
                </div>

                {/* Chờ thanh toán / Huỷ */}
                <div className="bg-white/80 border border-white/60 backdrop-blur-md rounded-2xl p-5 shadow-xl shadow-slate-900/5 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Chờ / Đã Huỷ</p>
                        <p className="text-2xl font-bold text-slate-700">
                            {stats.pendingCount || 0} <span className="text-slate-300">/</span> <span className="text-red-500">{stats.cancelledCount || 0}</span>
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">Chưa thanh toán & Bị hủy bỏ</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl flex gap-1 items-center">
                        <Clock size={16} className="text-amber-500" />
                        <XCircle size={16} className="text-red-500" />
                    </div>
                </div>
            </div>

            {/* PayOS Revenue Chart */}
            <div className="bg-white/80 border border-white/60 backdrop-blur-md rounded-2xl p-6 shadow-xl shadow-slate-900/5">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="font-bold text-slate-800">Biểu đồ doanh thu</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Biến động doanh thu hàng ngày trong 14 ngày qua</p>
                    </div>
                    <span className="text-xs bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold px-2.5 py-1 rounded-lg">PayOS Realtime</span>
                </div>
                {chartData.length > 0 ? renderChart() : <div className="h-48 flex items-center justify-center text-slate-400 text-sm font-semibold">Chưa có dữ liệu giao dịch thành công</div>}
            </div>

            {/* Transactions List */}
            <div className="bg-white/80 border border-white/60 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl shadow-slate-900/5">
                {/* Filters */}
                <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                        {[
                            { value: "", label: "Tất cả giao dịch" },
                            { value: "PAID", label: "Thành công" },
                            { value: "PENDING", label: "Chờ thanh toán" },
                            { value: "CANCELLED", label: "Đã hủy" }
                        ].map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => handleFilterStatus(opt.value)}
                                className={`px-4 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-sm ${
                                    statusFilter === opt.value
                                        ? "bg-indigo-600 text-white border-indigo-650"
                                        : "bg-white/85 text-slate-605 border-slate-200 hover:bg-white"
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm email, gói cước..."
                            value={search}
                            onChange={handleSearchChange}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 placeholder-slate-400 bg-white/70 font-medium transition-all shadow-inner focus:border-transparent outline-none"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full table-fixed text-left text-sm">
                        <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-505 font-semibold text-xs uppercase tracking-wider">
                            <tr>
                                <th className="p-4 font-semibold w-[16%]">Mã đơn hàng</th>
                                <th className="p-4 font-semibold w-[26%]">Người dùng</th>
                                <th className="p-4 font-semibold w-[20%]">Gói dịch vụ</th>
                                <th className="p-4 font-semibold w-[14%]">Số tiền</th>
                                <th className="p-4 font-semibold w-[12%]">Trạng thái</th>
                                <th className="p-4 font-semibold w-[12%]">Thời gian</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-750 font-medium">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center p-8 font-bold text-slate-500">
                                        <div className="flex justify-center items-center gap-2">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-650" />
                                            <span className="text-xs text-slate-500 font-semibold">Đang tải lịch sử giao dịch...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : payments.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center p-8 font-bold text-slate-505">Không tìm thấy giao dịch nào</td>
                                </tr>
                            ) : (
                                payments.map(p => (
                                    <tr key={p._id} className="border-t border-slate-100 hover:bg-white/40 transition-colors text-slate-750">
                                        <td className="p-4 font-mono text-xs font-bold text-slate-800 truncate" title={p.payosOrderCode}>
                                            #{p.payosOrderCode}
                                        </td>
                                        <td className="p-4 min-w-0">
                                            <div className="truncate">
                                                <p className="font-semibold text-slate-800 truncate" title={p.user?.name}>{p.user?.name || "Người dùng ẩn"}</p>
                                                <p className="text-xs text-slate-505 font-medium truncate" title={p.user?.email}>{p.user?.email || "—"}</p>
                                            </div>
                                        </td>
                                        <td className="p-4 min-w-0">
                                            <div className="truncate">
                                                <p className="font-semibold text-slate-800 truncate" title={p.packageName}>{p.packageName}</p>
                                                <p className="text-xs text-slate-505 font-medium mt-0.5">+{p.creditAmount?.toLocaleString()} Credits</p>
                                            </div>
                                        </td>
                                        <td className="p-4 font-semibold text-slate-800 font-mono">
                                            {(p.amount || 0).toLocaleString("vi-VN")} đ
                                        </td>
                                        <td className="p-4">
                                            {p.status === "PAID" && (
                                                <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-100 shadow-sm">
                                                    <CheckCircle size={11} className="fill-emerald-700 text-white" />
                                                    Thành công
                                                </span>
                                            )}
                                            {p.status === "PENDING" && (
                                                <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-705 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-100 shadow-sm">
                                                    <Clock size={11} />
                                                    Chờ thanh toán
                                                </span>
                                            )}
                                            {p.status === "CANCELLED" && (
                                                <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-705 text-xs font-bold px-2.5 py-0.5 rounded-full border border-red-100 shadow-sm">
                                                    <XCircle size={11} />
                                                    Đã hủy
                                                </span>
                                            )}
                                            {!["PAID", "PENDING", "CANCELLED"].includes(p.status) && (
                                                <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-slate-200 shadow-sm">
                                                    {p.status}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-xs text-slate-500 font-medium">
                                            {new Date(p.createdAt).toLocaleString("vi-VN")}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-slate-100">
                        <p className="text-xs text-slate-505 font-medium">Trang {page} / {totalPages}</p>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setPage(p => Math.max(1, p - 1))} 
                                disabled={page === 1} 
                                className="p-2 rounded-xl border border-slate-200 bg-white/80 text-slate-705 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button 
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                                disabled={page === totalPages} 
                                className="p-2 rounded-xl border border-slate-200 bg-white/80 text-slate-705 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================================
// MAIN ADMIN PAGE
// ============================================================
export default function AdminDashboard() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [pendingEmployerCount, setPendingEmployerCount] = useState(0);

    // Guard: redirect if not admin
    useEffect(() => {
        if (user && user.role !== "ADMIN") {
            navigate("/", { replace: true });
        }
    }, [user, navigate]);

    // Load pending employer count for sidebar badge
    useEffect(() => {
        if (user?.role === "ADMIN") {
            axios.get(`${API}/stats`, { headers: authHeader() })
                .then(r => setPendingEmployerCount(r.data.pendingEmployers || 0))
                .catch(() => { });
        }
    }, [user]);

    if (!user || user.role !== "ADMIN") {
        return (
            <div 
                className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat bg-fixed relative"
                style={{ backgroundImage: "url('/background3.jpg')" }}
            >
                <div className="absolute inset-0 bg-slate-950/35 backdrop-blur-[1px] pointer-events-none" />
                <div className="relative z-10 text-center bg-white/80 border border-white/60 backdrop-blur-md rounded-2xl p-8 shadow-xl shadow-slate-900/5 max-w-sm">
                    <AlertTriangle size={48} className="text-amber-500 mx-auto mb-3" />
                    <h2 className="text-xl font-bold text-slate-800">Không có quyền truy cập</h2>
                    <p className="text-slate-500 text-sm mt-1">Trang này chỉ dành cho Admin</p>
                </div>
            </div>
        );
    }

    const handleLogout = () => {
        signOut();
        navigate("/");
    };

    const TABS = {
        dashboard: <DashboardTab onNavigate={setActiveTab} />,
        users: <UsersTab />,
        employers: <EmployersTab />,
        jobs: <JobsTab />,
        payments: <PaymentsTab />,
    };

    return (
        <div 
            className="min-h-screen flex bg-cover bg-center bg-no-repeat bg-fixed relative font-sans w-full"
            style={{ backgroundImage: "url('/background3.jpg')" }}
        >
            {/* Premium backdrop-blur and overlay */}
            <div className="absolute inset-0 bg-slate-950/35 backdrop-blur-[1px] pointer-events-none" />

            <div className="relative z-10 flex w-full min-h-screen">
                <AdminSidebar
                    active={activeTab}
                    setActive={setActiveTab}
                    user={user}
                    onLogout={handleLogout}
                    pendingCount={pendingEmployerCount}
                />
                <main className="flex-1 p-6 lg:p-8 overflow-auto">
                    <div className="max-w-7xl mx-auto w-full space-y-6">
                        {TABS[activeTab]}
                    </div>
                </main>
            </div>
        </div>
    );
}
