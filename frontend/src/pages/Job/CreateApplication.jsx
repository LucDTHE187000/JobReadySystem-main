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
    <div className="min-h-screen bg-gray-100 flex">
      <SideBar profile={user} />

      <div className="w-full max-w-5xl ml-10 p-6">
        <h1 className="text-2xl font-semibold mb-1">
          {isEdit ? "Cập nhật Tin Tuyển Dụng" : "Đăng Tin Tuyển Dụng"}
        </h1>

        <p className="text-gray-500 mb-6">
          {isEdit ? "Chỉnh sửa thông tin bên dưới và lưu lại thay đổi" : "Hoàn thành thông tin bên dưới để đăng tin tuyển dụng"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">

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
            <div className="grid grid-cols-3 gap-4">
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
              className="px-6 py-2 border rounded-lg"
              onClick={() => navigate(-1)}
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (isEdit ? "Đang cập nhật..." : "Đang đăng...") : (isEdit ? "Lưu thay đổi" : "Đăng tin ngay →")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ======================== */

const Section = ({ title, children }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
    <h2 className="font-semibold text-lg">{title}</h2>
    {children}
  </div>
);

const Input = ({ label, ...props }) => (
  <div className="space-y-1">
    <label className="text-sm font-medium">{label}</label>
    <input {...props} className="w-full border rounded-lg p-2" />
  </div>
);

const Textarea = ({ label, ...props }) => (
  <div className="space-y-1">
    <label className="text-sm font-medium">{label}</label>
    <textarea {...props} rows={4} className="w-full border rounded-lg p-2" />
  </div>
);

const Select = ({ label, options, ...props }) => (
  <div className="space-y-1">
    <label className="text-sm font-medium">{label}</label>
    <select {...props} className="w-full border rounded-lg p-2">
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </div>
);

export default CreateJob;
