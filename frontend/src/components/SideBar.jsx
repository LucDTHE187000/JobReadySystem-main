import {
  Home,
  Users,
  Briefcase,
  ChevronRight,
  MessageSquare,
  Search,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
  activeMenu,
  setActiveMenu,
  profile,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const getActiveMenu = () => {
    if (activeMenu) return activeMenu;
    if (currentPath === "/dashboard") return "home";
    if (
      currentPath === "/job-application" ||
      currentPath === "/create" ||
      currentPath.startsWith("/edit-job") ||
      currentPath.startsWith("/job-applications")
    )
      return "jobs";
    if (currentPath === "/candidate") return "candidates";
    if (currentPath === "/candidate-search") return "candidate-search";
    if (currentPath === "/employer/feedback") return "feedback";
    return "";
  };

  const active = getActiveMenu();

  return (
    <aside
      className={`
        fixed lg:sticky z-30 top-0 left-0
        bg-slate-900/45 border-r border-white/10 backdrop-blur-md w-64 min-h-screen p-4 flex flex-col
        transition-transform duration-300 shadow-xl
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
    >
      <div className="flex items-center justify-between mb-8 px-2 flex-shrink-0 border-b border-white/10 pb-5">
        <div className="flex flex-col">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center font-bold text-white text-sm">
              JR
            </div>
            <span className="font-bold text-white text-lg">
              JOB<span className="text-indigo-400">READY</span>
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Briefcase size={14} className="text-indigo-400" />
            <span className="text-indigo-400/90 text-xs font-semibold uppercase tracking-wider">Recruiter Panel</span>
          </div>
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
          active={active === "home"}
          onClick={() => {
            setActiveMenu?.("home");
            navigate("/dashboard");
          }}
        />
        <MenuItem
          icon={<Briefcase size={20} />}
          label="Quản lý công việc"
          active={active === "jobs"}
          onClick={() => {
            setActiveMenu?.("jobs");
            navigate("/job-application");
          }}
        />
        <MenuItem
          icon={<Users size={20} />}
          label="Danh sách ứng viên"
          active={active === "candidates"}
          onClick={() => {
            setActiveMenu?.("candidates");
            navigate("/candidate");
          }}
        />
        <MenuItem
          icon={<Search size={20} />}
          label="Tìm kiếm ứng viên"
          active={active === "candidate-search"}
          onClick={() => {
            setActiveMenu?.("candidate-search");
            navigate("/candidate-search");
          }}
        />
        <MenuItem
          icon={<MessageSquare size={20} />}
          label="Feedback"
          active={active === "feedback"}
          onClick={() => {
            setActiveMenu?.("feedback");
            navigate("/employer/feedback");
          }}
        />
      </nav>

      <div className="mt-auto px-2 flex-shrink-0 border-t border-white/10 pt-4">
        <div
          onClick={() => navigate("/profile")}
          className="flex items-center gap-3 px-2 py-2 cursor-pointer hover:bg-white/5 rounded-xl transition-all group"
          title="Xem hồ sơ cá nhân"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-bold flex items-center justify-center text-sm shadow-md">
            {profile?.name?.charAt(0) || "C"}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="font-semibold text-white text-sm truncate">{profile?.name || "Nhà tuyển dụng"}</p>
            <p className="text-[10px] text-white/40">Xem hồ sơ</p>
          </div>
          <ChevronRight size={16} className="text-white/40 group-hover:text-white transition-colors" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

const MenuItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all border-l-2 text-sm font-medium mx-0 cursor-pointer ${
      active
        ? "bg-indigo-600/30 text-indigo-200 border-indigo-500 shadow-inner"
        : "text-white/60 hover:bg-white/5 hover:text-white border-transparent"
    }`}
  >
    {icon}
    <span className="font-medium text-sm">{label}</span>
  </button>
);
