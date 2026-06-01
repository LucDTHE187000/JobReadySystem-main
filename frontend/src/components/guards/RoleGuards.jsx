import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { isEmployerRole, isLocalDev } from '../../utils/roles';

export function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F4F6FB]">
                <p className="text-[#5A6482] font-medium">Đang tải...</p>
            </div>
        );
    }
    if (!user) return <Navigate to="/login" replace />;
    return children;
}

/** Chỉ ứng viên — redirect employer về trang chủ (trừ localhost dev có thể vào employer) */
export function JobSeekerRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F4F6FB]">
                <p className="text-[#5A6482]">Đang tải...</p>
            </div>
        );
    }
    if (!user) return <Navigate to="/login" replace />;
    if (isEmployerRole(user.role) && !isLocalDev()) {
        return <Navigate to="/" replace />;
    }
    return children;
}

/** Employer dashboard — chỉ localhost hoặc role employer */
export function EmployerRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F4F6FB]">
                <p className="text-[#5A6482]">Đang tải...</p>
            </div>
        );
    }
    if (!user) return <Navigate to="/login" replace />;
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
    if (user && isEmployerRole(user.role) && !isLocalDev()) {
        return <Navigate to="/dashboard" replace />;
    }
    return children;
}
