import { useState } from "react";
import SideBar from "../components/SideBar";

const PostJob = () => {
    const [progress] = useState(45);

    return (
        <div className="bg-[#f5f7fb] flex">
            <SideBar />
            {/* CONTENT */}
            <main className="ml-64 min-h-screen px-6 py-8">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT */}
                    <div className="lg:col-span-2 space-y-6">
                        <Header />

                        <Progress progress={progress} />

                        <Section title="Thông tin cơ bản">
                            <Grid>
                                <Input label="Tiêu đề công việc" placeholder="Senior ReactJS Developer" />
                                <Select label="Ngành nghề" options={["IT", "Marketing", "Kinh doanh"]} />
                                <Select label="Loại hình công việc" options={["Fulltime", "Parttime", "Remote"]} />
                            </Grid>
                        </Section>

                        <Section title="Chi tiết công việc">
                            <Textarea label="Mô tả công việc" />
                            <Textarea label="Yêu cầu ứng viên" />
                        </Section>

                        <Section title="Quyền lợi & Lương">
                            <Grid cols={3}>
                                <Input label="Lương từ" />
                                <Input label="Đến" />
                                <Select label="Tiền tệ" options={["VND", "USD"]} />
                            </Grid>
                        </Section>

                        <Actions />
                    </div>

                    {/* RIGHT */}
                    <RightPanel />
                </div>
            </main>
        </div>
    );
};

export default PostJob;
const Header = () => (
    <div>
        <h1 className="text-2xl font-bold">Đăng Tin Tuyển Dụng</h1>
        <p className="text-sm text-gray-500">
            Hoàn thành các bước để tìm ứng viên phù hợp
        </p>
    </div>
);

const Progress = ({ progress }) => (
    <div className="bg-white rounded-xl p-5">
        <div className="flex justify-between text-sm mb-2">
            <span>Tiến trình</span>
            <span className="text-cyan-600 font-semibold">{progress}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded">
            <div className="h-full bg-cyan-500 rounded" style={{ width: `${progress}%` }} />
        </div>
    </div>
);

const Section = ({ title, children }) => (
    <div className="bg-white rounded-xl p-6 space-y-4">
        <h2 className="font-semibold">{title}</h2>
        {children}
    </div>
);

const Grid = ({ children, cols = 2 }) => (
    <div className={`grid grid-cols-1 md:grid-cols-${cols} gap-4`}>
        {children}
    </div>
);

const Input = ({ label, ...props }) => (
    <div>
        <label className="block text-sm mb-1">{label}</label>
        <input {...props} className="w-full border rounded-lg px-3 py-2" />
    </div>
);

const Textarea = ({ label }) => (
    <div>
        <label className="block text-sm mb-1">{label}</label>
        <textarea rows={4} className="w-full border rounded-lg px-3 py-2" />
    </div>
);

const Select = ({ label, options }) => (
    <div>
        <label className="block text-sm mb-1">{label}</label>
        <select className="w-full border rounded-lg px-3 py-2">
            {options.map(o => <option key={o}>{o}</option>)}
        </select>
    </div>
);

const Actions = () => (
    <div className="flex justify-end gap-4">
        <button className="px-6 py-2 border rounded-lg">Lưu nháp</button>
        <button className="px-6 py-2 bg-cyan-500 text-white rounded-lg">
            Đăng tin →
        </button>
    </div>
);

const RightPanel = () => (
    <div className="space-y-6">
        <div className="bg-cyan-50 p-5 rounded-xl">
            <h3 className="font-semibold text-cyan-700">Mẹo hay</h3>
            <ul className="text-sm text-cyan-700 mt-2 space-y-1">
                <li>• Tiêu đề rõ ràng</li>
                <li>• Nêu lương</li>
                <li>• Văn hóa công ty</li>
            </ul>
        </div>
    </div>
);
