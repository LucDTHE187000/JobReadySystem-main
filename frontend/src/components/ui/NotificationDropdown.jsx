import { useState, useEffect } from 'react';
import { CheckCheck, Calendar, Send, MessageSquare, Eye, Megaphone, ChevronDown, Bell, Circle } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function NotificationDropdown({ onClose }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('Tất cả');
    const tabs = ['Tất cả', 'Chưa đọc', 'Hẹn phỏng vấn', 'Hệ thống'];

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    const fetchNotifications = async () => {
        if (!token) return;
        try {
            const res = await axios.get(`${API_URL}/api/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data || []);
        } catch (error) {
            console.error("Fetch notifications failed:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Polling every 30s
        return () => clearInterval(interval);
    }, [token]);

    const markAllRead = async () => {
        if (!token) return;
        try {
            await axios.put(`${API_URL}/api/notifications/mark-all-read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error("Mark all read failed:", error);
        }
    };

    const markSingleRead = async (id) => {
        if (!token) return;
        try {
            await axios.put(`${API_URL}/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error("Mark single read failed:", error);
        }
    };

    function formatTimeAgo(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        return `${diffDays} ngày trước`;
    }

    const getIcon = (type) => {
        switch (type) {
            case 'interview':
                return <Calendar className="text-white" size={20} />;
            case 'application':
                return <Send className="text-white" size={20} />;
            case 'success':
                return <CheckCheck className="text-white" size={20} />;
            case 'warning':
                return <MessageSquare className="text-white" size={20} />;
            case 'system':
                return <Megaphone className="text-white" size={20} />;
            default:
                return <Eye className="text-white" size={20} />;
        }
    };

    const getBgColor = (type) => {
        switch (type) {
            case 'interview': return 'bg-purple-500 shadow-purple-200';
            case 'application': return 'bg-green-500 shadow-green-200';
            case 'success': return 'bg-cyan-500 shadow-cyan-200';
            case 'warning': return 'bg-orange-500 shadow-orange-200';
            case 'system': return 'bg-red-500 shadow-red-200';
            default: return 'bg-[#0A2463] shadow-blue-200';
        }
    };

    // Filter logic
    const filteredNotifications = notifications.filter(n => {
        if (activeTab === 'Chưa đọc') return !n.isRead;
        if (activeTab === 'Hẹn phỏng vấn') return n.type === 'interview';
        if (activeTab === 'Hệ thống') return n.type === 'system' || n.type === 'info';
        return true;
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="absolute right-0 top-full mt-2 w-[90vw] sm:w-[500px] md:w-[600px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 z-50 flex flex-col max-h-[80vh] overflow-hidden origin-top-right animate-in fade-in slide-in-from-top-4 duration-200">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white shrink-0">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-[#0A2463]">Trung Tâm Thông Báo</h2>
                    {unreadCount > 0 && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-600 font-bold text-xs rounded-full">
                            {unreadCount} mới
                        </span>
                    )}
                </div>
                <button 
                    onClick={markAllRead}
                    className="flex items-center justify-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-700 hover:bg-gray-50 transition-colors font-medium shrink-0"
                >
                    <CheckCheck size={14} />
                    Đánh dấu tất cả là đã đọc
                </button>
            </div>

            {/* Tabs */}
            <div className="px-4 py-1.5 border-b border-gray-100 bg-white shrink-0 flex gap-2 overflow-x-auto no-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${activeTab === tab
                            ? 'bg-[#0A2463] text-white'
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1 p-4 space-y-3 bg-slate-50">
                {filteredNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <Bell size={40} className="stroke-1 mb-2 text-gray-300" />
                        <p className="text-sm">Không có thông báo nào trong mục này</p>
                    </div>
                ) : (
                    filteredNotifications.map((n) => (
                        <div 
                            key={n._id}
                            onClick={() => !n.isRead && markSingleRead(n._id)}
                            className={`bg-white border text-left rounded-xl p-4 flex gap-3 shadow-sm relative transition-all duration-200 cursor-pointer ${
                                !n.isRead 
                                ? 'border-[#0A2463]/20 border-l-4 border-l-[#0A2463]' 
                                : 'border-gray-100 opacity-80 hover:opacity-100'
                            }`}
                        >
                            {!n.isRead && (
                                <span className="absolute top-4 right-4 w-2 h-2 bg-[#F5C518] rounded-full animate-pulse"></span>
                            )}
                            <div className="flex-shrink-0 mt-0.5">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${getBgColor(n.type)}`}>
                                    {getIcon(n.type)}
                                </div>
                            </div>
                            <div className="flex-1 pr-4">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className={`font-bold text-sm text-gray-900 leading-tight`}>
                                        {n.title}
                                    </h3>
                                </div>
                                <p className="text-xs text-gray-600 leading-relaxed mb-2">
                                    {n.description}
                                </p>
                                <span className="text-[10px] text-gray-400 font-medium">
                                    {formatTimeAgo(n.createdAt)}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-100 bg-slate-50 shrink-0 text-center">
                <button onClick={onClose} className="text-xs font-bold text-[#0A2463] hover:text-[#071A4A] transition-colors">
                    Đóng
                </button>
            </div>
        </div>
    );
}

