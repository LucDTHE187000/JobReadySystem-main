import { useState } from 'react';
import { CheckCheck, Calendar, Send, MessageSquare, Eye, Megaphone, ChevronDown, Rocket } from 'lucide-react';

export default function NotificationDropdown({ onClose }) {
    const [activeTab, setActiveTab] = useState('Tất cả');
    const tabs = ['Tất cả', 'Chưa đọc', 'Thư mới', 'Hệ thống'];

    return (
        <div className="absolute right-0 top-full mt-2 w-[90vw] sm:w-[500px] md:w-[650px] lg:w-[750px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 z-50 flex flex-col max-h-[85vh] overflow-hidden origin-top-right animate-in fade-in slide-in-from-top-4 duration-200">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white shrink-0">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Trung Tâm Thông Báo</h2>
                    <span className="px-2.5 py-1 bg-cyan-50 text-cyan-600 font-semibold text-xs rounded-full">
                        12 mới
                    </span>
                </div>
                <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium shrink-0">
                    <CheckCheck size={18} />
                    Đánh dấu tất cả là đã đọc
                </button>
            </div>

            {/* Tabs */}
            <div className="px-4 sm:px-6 py-2 border-b border-gray-100 bg-white shrink-0 flex gap-2 overflow-x-auto no-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 sm:px-5 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab
                            ? 'bg-cyan-50 text-cyan-600'
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-4 bg-slate-50">
                {/* Item 1 - Interview */}
                <div className="bg-white border text-left border-cyan-100 border-l-4 border-l-cyan-500 rounded-xl p-4 sm:p-5 flex gap-4 shadow-sm relative">
                    <span className="absolute top-5 right-5 w-2 h-2 bg-cyan-500 rounded-full"></span>
                    <div className="flex-shrink-0 mt-1 hidden sm:block">
                        <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center shadow-sm shadow-cyan-200">
                            <Calendar className="text-white" size={24} />
                        </div>
                    </div>
                    <div className="flex-1 pr-6">
                        <div className="flex items-center justify-between mb-1.5">
                            <h3 className="font-bold text-gray-900 text-sm sm:text-base pr-2">Lời mời phỏng vấn: Chuyên viên Marketing</h3>
                            <span className="text-xs text-gray-500 whitespace-nowrap hidden sm:block">2 phút trước</span>
                        </div>
                        <span className="text-xs text-gray-500 block mb-2 sm:hidden">2 phút trước</span>
                        <p className="text-sm text-gray-600 leading-relaxed mb-4">
                            Công ty TNHH Giải pháp Công nghệ ABC đã xem hồ sơ của bạn và gửi lời mời phỏng vấn cho vị trí Marketing Specialist. Buổi phỏng vấn dự kiến diễn ra vào lúc 10:00 AM Thứ Hai tuần sau.
                        </p>
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                            <button className="px-4 sm:px-5 py-2 bg-cyan-500 text-white rounded-lg text-sm font-medium hover:bg-cyan-600 transition-colors shadow-sm shadow-cyan-200">
                                Xác nhận tham gia
                            </button>
                            <button className="px-4 sm:px-5 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors bg-white">
                                Xem chi tiết
                            </button>
                        </div>
                    </div>
                </div>

                {/* Item 2 - Success */}
                <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-5 flex gap-4 hover:border-gray-200 hover:shadow-sm transition-all text-left">
                    <div className="flex-shrink-0 mt-1 hidden sm:block">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <Send className="text-green-500" size={24} />
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1.5">
                            <h3 className="font-bold text-gray-900 text-sm sm:text-base">Ứng tuyển thành công</h3>
                            <span className="text-xs text-gray-500 whitespace-nowrap hidden sm:block">1 giờ trước</span>
                        </div>
                        <span className="text-xs text-gray-500 block mb-2 sm:hidden">1 giờ trước</span>
                        <p className="text-sm text-gray-600 leading-relaxed max-w-[95%]">
                            Hồ sơ của bạn cho vị trí Senior UI/UX Designer tại VNG Corporation đã được gửi đi thành công. Nhà tuyển dụng sẽ phản hồi trong vòng 3-5 ngày làm việc.
                        </p>
                    </div>
                </div>

                {/* Item 3 - Feedback */}
                <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-5 flex gap-4 hover:border-gray-200 hover:shadow-sm transition-all relative text-left">
                    <span className="absolute top-5 right-5 w-2 h-2 bg-cyan-500 rounded-full"></span>
                    <div className="flex-shrink-0 mt-1 hidden sm:block">
                        <div className="w-12 h-12 bg-orange-100/80 rounded-xl flex items-center justify-center">
                            <MessageSquare className="text-orange-500" size={24} />
                        </div>
                    </div>
                    <div className="flex-1 pr-6">
                        <div className="flex items-center justify-between mb-1.5">
                            <h3 className="font-bold text-gray-900 text-sm sm:text-base">Phản hồi từ nhà tuyển dụng</h3>
                            <span className="text-xs text-gray-500 whitespace-nowrap hidden sm:block">4 giờ trước</span>
                        </div>
                        <span className="text-xs text-gray-500 block mb-2 sm:hidden">4 giờ trước</span>
                        <p className="text-sm text-gray-600 leading-relaxed font-medium">
                            "Chào bạn, chúng tôi rất ấn tượng với Portfolio của bạn. Bạn có thể gửi thêm một số dự án mobile app mà bạn đã thực hiện không?"
                        </p>
                    </div>
                </div>

                {/* Item 4 - View */}
                <div className="bg-slate-50/50 border border-gray-100 rounded-xl p-4 sm:p-5 flex gap-4 hover:border-gray-200 hover:bg-white transition-all text-left opacity-80 hover:opacity-100">
                    <div className="flex-shrink-0 mt-1 hidden sm:block">
                        <div className="w-12 h-12 bg-purple-100/70 rounded-xl flex items-center justify-center">
                            <Eye className="text-purple-600" size={24} />
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1.5">
                            <h3 className="font-bold text-gray-900 text-sm sm:text-base">Hồ sơ của bạn có lượt xem mới</h3>
                            <span className="text-xs text-gray-500 whitespace-nowrap hidden sm:block">Hôm qua</span>
                        </div>
                        <span className="text-xs text-gray-500 block mb-2 sm:hidden">Hôm qua</span>
                        <p className="text-sm text-gray-600 leading-relaxed max-w-[95%]">
                            Đã có 5 nhà tuyển dụng từ lĩnh vực Fintech vừa xem hồ sơ trực tuyến của bạn trong 24 giờ qua. Cập nhật hồ sơ để tăng khả năng kết nối!
                        </p>
                    </div>
                </div>

                {/* Item 5 - System */}
                <div className="bg-slate-50/50 border border-gray-100 rounded-xl p-4 sm:p-5 flex gap-4 hover:border-gray-200 hover:bg-white transition-all text-left opacity-80 hover:opacity-100">
                    <div className="flex-shrink-0 mt-1 hidden sm:block">
                        <div className="w-12 h-12 bg-blue-100/70 rounded-xl flex items-center justify-center">
                            <Megaphone className="text-blue-500" size={24} strokeWidth={1} />
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1.5">
                            <h3 className="font-bold text-gray-900 text-sm sm:text-base">Cập nhật hệ thống: Tính năng AI Resume</h3>
                            <span className="text-xs text-gray-500 whitespace-nowrap hidden sm:block">2 ngày trước</span>
                        </div>
                        <span className="text-xs text-gray-500 block mb-2 sm:hidden">2 ngày trước</span>
                        <p className="text-sm text-gray-600 leading-relaxed max-w-[95%]">
                            RecruitHub vừa ra mắt tính năng phân tích CV bằng AI. Hãy trải nghiệm ngay để biết hồ sơ của bạn đang thiếu hụt những kỹ năng gì so với thị trường.
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-3 sm:p-4 border-t border-gray-100 bg-slate-50 shrink-0">
                <button className="w-full flex items-center justify-center gap-1.5 text-sm font-semibold text-cyan-500 hover:text-cyan-600 py-2 transition-colors">
                    Xem các thông báo cũ hơn
                    <ChevronDown size={16} strokeWidth={3} />
                </button>
            </div>

            {/* Overlay for mobile to close on click outside if needed, optional */}
        </div>
    );
}
