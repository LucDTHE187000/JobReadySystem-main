import {
  Home,
  Users,
  Briefcase,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
  activeMenu,
  setActiveMenu,
  profile,
}) => {
  const navigate = useNavigate();

  return (
    <aside
      className={`
        fixed lg:sticky z-30 top-0 left-0
        bg-[#0A2463] w-64 min-h-screen p-4 flex flex-col
        transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
    >
      <div className="flex items-center justify-between mb-8 px-2 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-[#F5C518] rounded-lg flex items-center justify-center">
            <span className="font-heading text-[#0A2463] text-lg leading-none pt-0.5">JR</span>
          </div>
          <span className="font-heading text-xl text-white tracking-wide">
            JOB<span className="text-[#F5C518]">READY</span>
          </span>
        </div>

        <button
          className="lg:hidden text-white/70 hover:text-white"
          onClick={() => setSidebarOpen(false)}
        >
          <ChevronRight className="rotate-180" size={24} />
        </button>
      </div>

      <nav className="space-y-1 flex-shrink-0 flex-1">
        <MenuItem
          icon={<Home size={20} />}
          label="Tổng quan"
          active={activeMenu === "home"}
          onClick={() => {
            setActiveMenu("home");
            navigate("/dashboard");
          }}
        />
        <MenuItem
          icon={<Briefcase size={20} />}
          label="Quản lý công việc"
          active={activeMenu === "jobs"}
          onClick={() => {
            setActiveMenu("jobs");
            navigate("/job-application");
          }}
        />
        <MenuItem
          icon={<Users size={20} />}
          label="Danh sách ứng viên"
          active={activeMenu === "candidates"}
          onClick={() => {
            setActiveMenu("candidates");
            navigate("/candidate");
          }}
        />
        <MenuItem
          icon={<MessageSquare size={20} />}
          label="Feedback"
          active={activeMenu === "feedback"}
          onClick={() => {
            setActiveMenu("feedback");
            navigate("/employer/feedback");
          }}
        />
      </nav>

      <div className="mt-auto px-2 flex-shrink-0 border-t border-white/10 pt-4">
        <div
          onClick={() => navigate("/profile")}
          className="flex items-center gap-3 px-2 py-3 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group"
        >
          <div className="w-10 h-10 bg-[#F5C518] rounded-full flex items-center justify-center text-[#0A2463] font-bold text-lg flex-shrink-0">
            {profile?.name?.charAt(0) || "C"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-white truncate">{profile?.name || "User"}</p>
            <p className="text-xs text-white/50">Nhà tuyển dụng</p>
          </div>
          <ChevronRight size={18} className="text-white/40 group-hover:text-white transition-colors" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

const MenuItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mx-0 ${
      active
        ? "bg-[#F5C518]/20 text-[#F5C518] border-l-2 border-[#F5C518]"
        : "text-white/70 hover:bg-white/10 hover:text-white"
    }`}
  >
    {icon}
    <span className="font-medium text-sm">{label}</span>
  </button>
);
