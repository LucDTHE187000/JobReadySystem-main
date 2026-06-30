import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { isEmployerRole, isAdminRole, isLocalDev } from '../../utils/roles';

export function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F4F6FB]">
                <p className="text-[#5A6482] font-medium">Đang tải...</p>
            </div>
        );
    }
    if (!user) {
        const redirectPath = encodeURIComponent(location.pathname + location.search);
        return <Navigate to={`/login?redirect=${redirectPath}`} replace />;
    }
    return children;
}

/** Chỉ dành cho Admin — redirect về / nếu không phải ADMIN */
export function AdminRoute({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F4F6FB]">
                <p className="text-[#5A6482] font-medium">Đang tải...</p>
            </div>
        );
    }
    if (!user) {
        const redirectPath = encodeURIComponent(location.pathname + location.search);
        return <Navigate to={`/login?redirect=${redirectPath}`} replace />;
    }
    if (!isAdminRole(user.role)) return <Navigate to="/" replace />;
    return children;
}

/** Chỉ ứng viên — redirect employer về trang chủ (trừ localhost dev có thể vào employer) */
export function JobSeekerRoute({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F4F6FB]">
                <p className="text-[#5A6482]">Đang tải...</p>
            </div>
        );
    }
    if (!user) {
        const redirectPath = encodeURIComponent(location.pathname + location.search);
        return <Navigate to={`/login?redirect=${redirectPath}`} replace />;
    }
    // Admin và Employer không được vào route của Job Seeker
    if (isAdminRole(user.role)) return <Navigate to="/admin/dashboard" replace />;
    if (isEmployerRole(user.role) && !isLocalDev()) {
        return <Navigate to="/" replace />;
    }
    return children;
}

/** Employer dashboard — chỉ localhost hoặc role employer */
export function EmployerRoute({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F4F6FB]">
                <p className="text-[#5A6482]">Đang tải...</p>
            </div>
        );
    }
    if (!user) {
        const redirectPath = encodeURIComponent(location.pathname + location.search);
        return <Navigate to={`/login?redirect=${redirectPath}`} replace />;
    }
    // Admin không dùng employer routes — redirect về admin dashboard
    if (isAdminRole(user.role)) return <Navigate to="/admin/dashboard" replace />;
    if (!isLocalDev() && !isEmployerRole(user.role)) {
        return <Navigate to="/" replace />;
    }
    if (!isEmployerRole(user.role)) {
        return <Navigate to="/" replace />;
    }
    return children;
}

/** Chặn employer truy cập các trang chỉ dùng cho ứng viên hoặc trang thông tin công khai */
export function NoEmployerRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F4F6FB]">
                <p className="text-[#5A6482]">Đang tải...</p>
            </div>
        );
    }
    // Admin có thể xem tất cả các trang công khai
    if (user && isAdminRole(user.role)) return children;
    if (user && isEmployerRole(user.role) && !isLocalDev()) {
        return <Navigate to="/dashboard" replace />;
    }
    return children;
}
