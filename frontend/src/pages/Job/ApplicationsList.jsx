import { useEffect, useState, useMemo } from "react";
import SideBar from "../../components/SideBar";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Star } from 'lucide-react';
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
          "http://localhost:4000/api/jobs/job-application",
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

  if (loading) return <div className="p-6">Loading...</div>;



  return (
    <div className="flex min-h-screen bg-gray-100">
      <SideBar profile={user} />

      <div className="flex-1 p-6 space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">My Job Posts</h1>

          <button
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            onClick={() => navigate("/create")}
          >
            + Create Job
          </button>
        </div>

        {/* FILTER BAR */}
        <div className="bg-white p-4 rounded-xl shadow-sm flex flex-wrap gap-4 items-center">

          <input
            type="text"
            placeholder="Search title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded-lg text-sm w-56"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border px-3 py-2 rounded-lg text-sm"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border px-3 py-2 rounded-lg text-sm"
          >
            <option value="all">All Types</option>
            <option value="full_time">Full Time</option>
            <option value="part_time">Part Time</option>
            <option value="internship">Internship</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border px-3 py-2 rounded-lg text-sm"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>

          <button
            onClick={clearFilters}
            className="px-3 py-2 text-sm bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Clear
          </button>
        </div>

        {/* JOB LIST */}
        {filteredJobs.length === 0 ? (
          <p>No jobs found.</p>
        ) : (
          filteredJobs.map((job) => (
            <div
              key={job._id}
              className="bg-white rounded-xl shadow-sm p-5 flex justify-between items-center"
            >
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex">
                  {job.title}
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm ml-2 ${job.status === "open"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                      }`}
                  >
                    {job.status || "closed"}
                  </span>
                  <span className="items-center justify-center ml-2 pt-2">
                    {job.isPremium ? <Star size={15} /> : ""}
                  </span>
                </h3>

                <p className="text-sm text-gray-600 line-clamp-2">
                  {job.description}
                </p>

                <div className="text-sm text-gray-600 flex gap-4 flex-wrap">
                  <span>💼 {job.jobType || "N/A"}</span>

                  <span>
                    💰 {job.salary?.min?.toLocaleString() || 0} -{" "}
                    {job.salary?.max?.toLocaleString() || 0}{" "}
                    {job.salary?.currency || ""}
                  </span>

                  <span>📍 {job.location?.city || "N/A"}</span>
                </div>

                <div className="text-sm text-gray-500">
                  Created at:{" "}
                  {job.createdAt
                    ? new Date(job.createdAt).toLocaleDateString()
                    : "N/A"}
                </div>
              </div>

              <div className="text-right space-y-2">
                <div className="text-sm">
                  Applications:{" "}
                  <span className="font-semibold">
                    {job.applicationsCount ?? 0}
                  </span>
                </div>



                <button
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  onClick={() =>
                    navigate(`/job-applications/${job._id}`)
                  }
                >
                  View Applications
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ApplicationsList;
