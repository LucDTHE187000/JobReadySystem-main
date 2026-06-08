import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SideBar from "../../components/SideBar";
import { useAuth } from "../../contexts/AuthContext";

function CreateJob() {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const { user } = useAuth();
  const isEdit = !!jobId;
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    requirements: "",
    jobType: "full-time", 
    salaryMin: "",
    salaryMax: "",
    currency: "VND",
    city: "",
    isPremium: false,
  });

  useEffect(() => {
    if (user === null) {
      navigate("/login");
      return;
    }

    if (isEdit && token) {
      const fetchJobDetails = async () => {
        try {
          const res = await fetch(`http://localhost:4000/api/jobs/${jobId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          const data = await res.json();
          if (res.ok && data.job) {
            const job = data.job;
            setForm({
              title: job.title || "",
              description: job.description || "",
              requirements: job.requirements || "",
              jobType: job.jobType || "full-time",
              salaryMin: job.salary?.min !== undefined ? job.salary.min : "",
              salaryMax: job.salary?.max !== undefined ? job.salary.max : "",
              currency: job.salary?.currency || "VND",
              city: job.location?.city || "",
              isPremium: job.isPremium || false,
            });
          }
        } catch (err) {
          console.error("Fetch job detail error:", err);
        }
      };
      fetchJobDetails();
    }
  }, [user, navigate, jobId, isEdit, token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("Bạn cần đăng nhập để đăng tin tuyển dụng");
      navigate("/login");
      return;
    }

    const payload = {
      recruiterId: user._id,
      title: form.title,
      description: form.description,
      requirements: form.requirements,
      jobType: form.jobType,
      salary: {
        min: form.salaryMin ? Number(form.salaryMin) : 0,
        max: form.salaryMax ? Number(form.salaryMax) : 0,
        currency: form.currency,
      },
      location: {
        city: form.city,
        country: "Vietnam",
      },
      isPremium: form.isPremium,
    };

    try {
      setLoading(true);

      const url = isEdit
        ? `http://localhost:4000/api/jobs/${jobId}`
        : "http://localhost:4000/api/jobs";

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Action failed");
      }

      alert(isEdit ? "Cập nhật tin thành công!" : "Đăng tin thành công!");

      if (!isEdit && form.isPremium) {
        navigate(`/payment/${data._id}`);
      } else {
        navigate("/job-application");
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

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
          <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-xl shadow-slate-900/5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 mb-1">
              {isEdit ? "Cập nhật Tin Tuyển Dụng" : "Đăng Tin Tuyển Dụng"}
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              {isEdit ? "Chỉnh sửa thông tin bên dưới và lưu lại thay đổi" : "Hoàn thành thông tin bên dưới để đăng tin tuyển dụng"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
            <Section title="Thông tin cơ bản">
              <Input
                label="Tiêu đề công việc"
                name="title"
                value={form.title}
                required
                onChange={handleChange}
              />

              <Select
                label="Loại hình công việc"
                name="jobType"
                value={form.jobType}
                onChange={handleChange}
                options={[
                  { value: "full-time", label: "Toàn thời gian" },
                  { value: "part-time", label: "Bán thời gian" },
                  { value: "internship", label: "Thực tập" },
                  { value: "remote", label: "Remote" },
                  { value: "contract", label: "Hợp đồng" },
                ]}
              />
            </Section>

            <Section title="Chi tiết công việc">
              <Textarea
                label="Mô tả công việc"
                name="description"
                value={form.description}
                onChange={handleChange}
              />

              <Textarea
                label="Yêu cầu ứng viên"
                name="requirements"
                value={form.requirements}
                onChange={handleChange}
              />
            </Section>

            <Section title="Lương">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Lương từ"
                  name="salaryMin"
                  type="number"
                  value={form.salaryMin}
                  onChange={handleChange}
                />

                <Input
                  label="Đến"
                  name="salaryMax"
                  type="number"
                  value={form.salaryMax}
                  onChange={handleChange}
                />

                <Select
                  label="Tiền tệ"
                  name="currency"
                  value={form.currency}
                  onChange={handleChange}
                  options={[
                    { value: "VND", label: "VND" },
                    { value: "USD", label: "USD" },
                  ]}
                />
              </div>
            </Section>

            <Section title="Địa điểm làm việc">
              <Input
                label="Tỉnh / Thành phố"
                name="city"
                value={form.city}
                onChange={handleChange}
              />
            </Section>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-6 py-2.5 border border-slate-200 bg-white/80 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl shadow-sm transition-all"
                onClick={() => navigate(-1)}
              >
                Hủy
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 font-semibold shadow-lg shadow-indigo-100/30 transition-all duration-300"
              >
                {loading ? (isEdit ? "Đang cập nhật..." : "Đang đăng...") : (isEdit ? "Lưu thay đổi" : "Đăng tin ngay →")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ======================== */

const Section = ({ title, children }) => (
  <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-white/60 shadow-xl shadow-slate-900/5 space-y-4">
    <h2 className="font-bold text-lg text-slate-800 border-b border-slate-100 pb-2">{title}</h2>
    {children}
  </div>
);

const Input = ({ label, ...props }) => (
  <div className="space-y-1 text-left">
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
    <input {...props} className="w-full bg-white/70 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl p-2.5 text-slate-800 placeholder-slate-400 font-medium transition-all shadow-inner focus:ring-0 outline-none" />
  </div>
);

const Textarea = ({ label, ...props }) => (
  <div className="space-y-1 text-left">
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
    <textarea {...props} rows={5} className="w-full bg-white/70 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl p-2.5 text-slate-850 placeholder-slate-400 font-medium transition-all shadow-inner focus:ring-0 outline-none" />
  </div>
);

const Select = ({ label, options, ...props }) => (
  <div className="space-y-1 text-left">
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
    <select {...props} className="w-full bg-white/70 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl p-2.5 text-slate-700 font-semibold transition-all shadow-inner focus:ring-0 outline-none">
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </div>
);

export default CreateJob;
