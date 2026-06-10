import { useEffect, useState, useMemo } from "react";
import SideBar from "../../components/SideBar";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Star } from 'lucide-react';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function ApplicationsList() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // FILTER STATES
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    if (user === undefined) return;

    if (!user) {
      navigate("/login");
      return;
    }

    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const res = await fetch(
          `${API_URL}/api/jobs/job-application`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch jobs");
        }

        setJobs(data.data || []);
      } catch (err) {
        console.error("FETCH ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [user, navigate]);

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tin tuyển dụng này? Tất cả các hồ sơ ứng tuyển liên quan sẽ bị xóa!")) return;
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Xóa thất bại");
      alert("Đã xóa tin tuyển dụng thành công!");
      setJobs(prev => prev.filter(j => j._id !== jobId));
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // FILTER + SORT LOGIC
  const filteredJobs = useMemo(() => {
    let filtered = jobs.filter((job) => {
      const matchSearch = job.title
        ?.toLowerCase()
        .includes(search.toLowerCase());

      const matchStatus =
        statusFilter === "all" || job.status === statusFilter;

      const matchType =
        typeFilter === "all" || job.jobType === typeFilter;

      return matchSearch && matchStatus && matchType;
    });

    // 🔥 SORT PREMIUM TRƯỚC + DATE SAU
    filtered.sort((a, b) => {
      // Ưu tiên premium
      if (a.isPremium !== b.isPremium) {
        return Number(b.isPremium) - Number(a.isPremium);
      }

      // Sau đó sort theo ngày
      if (sortBy === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
    });

    return filtered;
  }, [jobs, search, statusFilter, typeFilter, sortBy]);


  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setTypeFilter("all");
    setSortBy("newest");
  };

  if (loading) return <div className="p-6 text-slate-800 font-bold bg-white/80 backdrop-blur-md rounded-2xl border border-white/60 shadow-xl m-8">Loading...</div>;

  return (
    <div 
      className="min-h-screen flex bg-cover bg-center bg-no-repeat bg-fixed relative"
      style={{ backgroundImage: `url('/background3.jpg')` }}
    >
      {/* Premium backdrop-blur and dark-gradient overlay */}
      <div className="absolute inset-0 bg-slate-950/30 backdrop-blur-[1px] pointer-events-none" />

      <div className="relative z-10 flex w-full">
        <SideBar profile={user} />

        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* HEADER */}
          <div className="flex items-center justify-between bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-xl shadow-slate-900/5">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-800">My Job Posts</h1>
              <p className="text-sm text-slate-500 font-medium mt-1">Quản lý danh sách tin tuyển dụng của công ty bạn</p>
            </div>

            <button
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-100/30 transition-all duration-300"
              onClick={() => navigate("/create")}
            >
              + Create Job
            </button>
          </div>

          {/* FILTER BAR */}
          <div className="bg-white/80 backdrop-blur-md p-4 border border-white/60 rounded-2xl shadow-xl shadow-slate-900/5 flex flex-wrap gap-4 items-center">
            <input
              type="text"
              placeholder="Search title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/70 border border-slate-200 focus:border-indigo-500 focus:bg-white px-3 py-2 rounded-xl text-sm w-56 text-slate-800 placeholder-slate-400 font-medium transition-all shadow-inner focus:ring-0 outline-none"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white/70 border border-slate-200 focus:border-indigo-500 focus:bg-white px-3 py-2 rounded-xl text-sm text-slate-700 font-semibold transition-all shadow-inner focus:ring-0 outline-none"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-white/70 border border-slate-200 focus:border-indigo-500 focus:bg-white px-3 py-2 rounded-xl text-sm text-slate-700 font-semibold transition-all shadow-inner focus:ring-0 outline-none"
            >
              <option value="all">All Types</option>
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="internship">Internship</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/70 border border-slate-200 focus:border-indigo-500 focus:bg-white px-3 py-2 rounded-xl text-sm text-slate-700 font-semibold transition-all shadow-inner focus:ring-0 outline-none"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>

            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm bg-white/80 border border-slate-200 text-slate-650 font-semibold rounded-xl hover:bg-slate-50 shadow-sm transition-all"
            >
              Clear
            </button>
          </div>

          {/* JOB LIST */}
          {filteredJobs.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl p-8 text-center text-slate-705 shadow-xl shadow-slate-900/5">
              <p className="font-semibold text-slate-800 text-lg">No jobs found.</p>
              <p className="text-sm text-slate-500 font-medium mt-1">Hãy đăng tin tuyển dụng mới để tiếp cận hàng ngàn ứng viên!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <div
                  key={job._id}
                  className="bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl shadow-xl shadow-slate-900/5 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:bg-white/95 hover:-translate-y-0.5 transition-all text-slate-800"
                >
                  <div className="space-y-2 flex-1">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 flex-wrap">
                      {job.title}
                      <span
                        className={`inline-block px-3 py-0.5 rounded-full text-xs font-bold border ${job.status === "open"
                          ? "bg-emerald-50 border-emerald-100/60 text-emerald-600"
                          : "bg-slate-150 border-slate-200 text-slate-500"
                          }`}
                      >
                        {job.status === "open" ? "Open" : "Closed"}
                      </span>
                      {job.isPremium && (
                        <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200/60 text-amber-700 text-xs px-2.5 py-0.5 rounded-full font-semibold shadow-sm">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> HOT
                        </span>
                      )}
                    </h3>

                    <p className="text-sm text-slate-600 font-medium line-clamp-2">
                      {job.description}
                    </p>

                    <div className="text-xs text-slate-500 font-medium flex gap-4 flex-wrap">
                      <span>💼 {job.jobType || "N/A"}</span>

                      <span>
                        💰 {job.salary?.min?.toLocaleString() || 0} -{" "}
                        {job.salary?.max?.toLocaleString() || 0}{" "}
                        {job.salary?.currency || ""}
                      </span>

                      <span>📍 {job.location?.city || "N/A"}</span>
                    </div>

                    <div className="text-[10px] text-slate-400 font-medium">
                      Created at:{" "}
                      {job.createdAt
                        ? new Date(job.createdAt).toLocaleDateString("vi-VN")
                        : "N/A"}
                    </div>
                  </div>

                  <div className="text-left md:text-right space-y-3 flex-shrink-0 w-full md:w-auto">
                    <div className="text-xs font-semibold text-slate-500">
                      Applications:{" "}
                      <span className="font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-xl ml-1 shadow-sm">
                        {job.applicationsCount ?? 0}
                      </span>
                    </div>

                    <div className="flex gap-2 justify-start md:justify-end mt-2 flex-wrap">
                      <button
                        className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-100/35 transition-all"
                        onClick={() =>
                          navigate(`/job-applications/${job._id}`)
                        }
                      >
                        View Applications
                      </button>
                      <button
                        className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 text-xs font-semibold shadow-sm transition-all"
                        onClick={() => navigate(`/edit-job/${job._id}`)}
                      >
                        Sửa
                      </button>
                      <button
                        className="px-3.5 py-1.5 bg-red-55 text-red-655 border border-red-100 rounded-xl hover:bg-red-105 text-xs font-semibold shadow-sm transition-all"
                        onClick={() => handleDeleteJob(job._id)}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ApplicationsList;
