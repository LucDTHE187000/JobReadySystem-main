import { API_URL } from '@/config';
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    BookOpen, Clock, User, PlayCircle, ChevronLeft,
    CheckCircle, Award, BookMarked, Video, FileText,
    Sparkles, Loader2, ArrowRight
} from 'lucide-react';
import SeekerLayout from '../components/layout/SeekerLayout';

const CATEGORIES = [
    { key: 'all', label: '📖 Tất cả lĩnh vực' },
    { key: 'IT', label: '💻 Công nghệ & Code' },
    { key: 'Sales', label: '🤝 Kinh doanh & Sales' },
    { key: 'Marketing', label: '📈 Marketing & Ads' },
    { key: 'Finance', label: '💰 Tài chính & Đầu tư' },
    { key: 'HR', label: '👥 Quản trị Nhân sự' }
];

export default function Learning() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    const getGradientStyle = (thumbnail) => {
        if (!thumbnail) {
            return { background: 'linear-gradient(135deg, #0A2463, #247BA0)' };
        }
        // Extract hex values from from-[#HEX] and to-[#HEX]
        const fromMatch = thumbnail.match(/from-\[#?([a-fA-F0-9]{3,8})\]/);
        const toMatch = thumbnail.match(/to-\[#?([a-fA-F0-9]{3,8})\]/);
        
        if (fromMatch && toMatch) {
            const fromColor = `#${fromMatch[1]}`;
            const toColor = `#${toMatch[1]}`;
            return { background: `linear-gradient(135deg, ${fromColor}, ${toColor})` };
        }
        return { background: 'linear-gradient(135deg, #0A2463, #247BA0)' };
    };

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('all');
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [courseDetailLoading, setCourseDetailLoading] = useState(false);
    const [activeLesson, setActiveLesson] = useState(null);
    const [completedLessons, setCompletedLessons] = useState({}); // courseId -> array of completed lesson IDs

    useEffect(() => {
        fetchCourses();
        // Load completed lessons from localStorage
        const savedCompleted = JSON.parse(localStorage.getItem('completedLessons') || '{}');
        setCompletedLessons(savedCompleted);
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/api/courses`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCourses(res.data.data || []);
        } catch (error) {
            console.error("Error fetching courses:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectCourse = async (courseId) => {
        try {
            setCourseDetailLoading(true);
            const res = await axios.get(`${API_URL}/api/courses/${courseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const courseData = res.data.data;
            setSelectedCourse(courseData);
            if (courseData.lessons && courseData.lessons.length > 0) {
                // Sort lessons by order
                const sorted = [...courseData.lessons].sort((a, b) => a.order - b.order);
                setActiveLesson(sorted[0]);
            }
        } catch (error) {
            console.error("Error fetching course detail:", error);
        } finally {
            setCourseDetailLoading(false);
        }
    };

    const handleToggleCompleteLesson = (lessonId) => {
        if (!selectedCourse) return;
        const courseId = selectedCourse._id;
        const currentCompleted = completedLessons[courseId] || [];

        let newCompleted;
        if (currentCompleted.includes(lessonId)) {
            newCompleted = currentCompleted.filter(id => id !== lessonId);
        } else {
            newCompleted = [...currentCompleted, lessonId];
        }

        const updated = {
            ...completedLessons,
            [courseId]: newCompleted
        };
        setCompletedLessons(updated);
        localStorage.setItem('completedLessons', JSON.stringify(updated));
    };

    const levelWeight = { 'Advanced': 3, 'Intermediate': 2, 'Beginner': 1 };
    const sortCoursesByLevel = (list) => {
        return [...list].sort((a, b) => (levelWeight[b.level] || 0) - (levelWeight[a.level] || 0));
    };

    const renderCourseCard = (course) => {
        const completedCount = (completedLessons[course._id] || []).length;
        const isFinished = completedCount === course.lessonsCount;
        return (
            <div
                key={course._id}
                className="bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl overflow-hidden hover:bg-white hover:-translate-y-1 transition-all duration-300 flex flex-col group text-slate-800 shadow-md h-full"
            >
                {/* Gradient Header Thumbnail */}
                <div 
                    style={getGradientStyle(course.thumbnail)} 
                    className="h-40 p-6 flex flex-col justify-between text-white relative"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl group-hover:scale-110 transition-transform duration-500"></div>
                    <div className="flex justify-between items-center z-10">
                        <span className="text-[10px] bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg font-bold border border-white/10 uppercase tracking-wider text-white">
                            {course.field === 'IT' ? 'Công nghệ & Code' :
                             course.field === 'Sales' ? 'Kinh doanh & Sales' :
                             course.field === 'Marketing' ? 'Marketing & Ads' :
                             course.field === 'Finance' ? 'Tài chính & Đầu tư' :
                             course.field === 'HR' ? 'Quản trị Nhân sự' : course.field}
                        </span>
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase z-10 bg-white/25 backdrop-blur-md border border-white/10 text-white">
                            {course.level === 'Beginner' ? 'Cơ bản' : 
                             course.level === 'Intermediate' ? 'Trung cấp' : 
                             course.level === 'Advanced' ? 'Nâng cao' : course.level}
                        </span>
                    </div>
                    <div className="z-10">
                        <h3 className="font-heading font-extrabold text-lg leading-snug line-clamp-2 drop-shadow-md text-white group-hover:text-[#F5C518] transition-colors duration-300">
                            {course.title}
                        </h3>
                    </div>
                </div>

                {/* Description & Info */}
                <div className="p-5 flex-1 flex flex-col justify-between bg-transparent">
                    <div>
                        <p className="text-slate-600 text-xs sm:text-sm line-clamp-3 mb-5 leading-relaxed">
                            {course.description}
                        </p>
                        {/* Author */}
                        <div className="flex items-center gap-2.5 mb-5">
                            <div 
                                style={getGradientStyle(course.thumbnail)} 
                                className="w-9 h-9 rounded-full text-white flex items-center justify-center font-bold text-sm shadow-sm"
                            >
                                {course.instructor?.name?.charAt(0) || 'I'}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-slate-800 truncate">{course.instructor?.name}</p>
                                <p className="text-[10px] text-slate-500 truncate">{course.instructor?.title}</p>
                            </div>
                        </div>
                    </div>

                    {/* Details & Action */}
                    <div className="border-t border-slate-200 pt-4 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                            <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                {course.duration}
                            </span>
                            <span className="flex items-center gap-1">
                                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                                {course.lessonsCount} bài
                            </span>
                        </div>
                        {isFinished ? (
                            <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg shadow-sm">
                                <CheckCircle className="w-3.5 h-3.5" /> Hoàn thành
                            </span>
                        ) : completedCount > 0 ? (
                            <span className="text-xs text-[#F5C518] font-bold bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 text-slate-700">
                                Đang học ({completedCount}/{course.lessonsCount})
                            </span>
                        ) : null}
                    </div>
                </div>

                {/* Play Button Action */}
                <div className="px-5 pb-5 bg-transparent">
                    <button
                        onClick={() => handleSelectCourse(course._id)}
                        className="w-full py-2.5 bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group-hover:bg-[#F5C518] group-hover:text-[#0A2463] group-hover:border-[#F5C518] hover:bg-[#F5C518] hover:text-[#0A2463] hover:shadow-md cursor-pointer"
                    >
                        <PlayCircle className="w-4 h-4" /> Bắt đầu học
                    </button>
                </div>
            </div>
        );
    };

    const filteredCourses = activeCategory === 'all'
        ? courses
        : courses.filter(c => c.field === activeCategory);

    // Render course catalog
    if (!selectedCourse) {
        return (
            <SeekerLayout title="Học tập & Nâng cao kỹ năng" breadcrumb="Activity Hub › Khóa học & Bài học">
                <div className="max-w-6xl mx-auto w-full">
                    {/* Welcome Banner */}
                    <div className="relative overflow-hidden bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-3xl p-8 sm:p-10 text-slate-800 mb-8 shadow-md">
                        <div className="absolute top-0 right-0 translate-x-12 -translate-y-12 w-64 h-64 bg-[#F5C518]/10 rounded-full blur-2xl"></div>
                        <div className="relative z-10 max-w-2xl">
                            <span className="bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 w-fit mb-4 shadow-sm">
                                <Sparkles className="w-3.5 h-3.5" /> Học tập không giới hạn
                            </span>
                            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
                                Đột phá sự nghiệp cùng JobReady Academy
                            </h2>
                            <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
                                Nâng cao chuyên môn và kỹ năng phỏng vấn theo từng lĩnh vực. Mỗi bài học được tối ưu hóa cho ứng viên giúp bạn tăng 85% cơ hội vượt qua vòng phỏng vấn chuyên sâu.
                            </p>
                        </div>
                    </div>

                    {/* Category tabs */}
                    <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.key}
                                onClick={() => setActiveCategory(cat.key)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border whitespace-nowrap shadow-sm ${
                                    activeCategory === cat.key
                                        ? 'bg-[#F5C518] text-[#0A2463] border-[#F5C518]'
                                        : 'bg-slate-100 text-slate-600 hover:text-slate-800 border-slate-200 hover:bg-slate-200/40'
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Courses catalog */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 className="w-10 h-10 animate-spin text-[#0A2463]" />
                            <p className="text-sm text-slate-500 font-medium">Đang tải danh sách bài học...</p>
                        </div>
                    ) : activeCategory === 'all' ? (
                        <div className="space-y-12">
                            {CATEGORIES.filter(cat => cat.key !== 'all').map(cat => {
                                const catCourses = courses.filter(c => c.field === cat.key);
                                if (catCourses.length === 0) return null;
                                const sortedCatCourses = sortCoursesByLevel(catCourses);
                                return (
                                    <div key={cat.key} className="space-y-4">
                                        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                                {cat.label}
                                                <span className="text-xs font-semibold bg-slate-100/80 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">
                                                    {catCourses.length} khóa học
                                                </span>
                                            </h3>
                                        </div>
                                        <div 
                                            className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide snap-x snap-mandatory"
                                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                        >
                                            {sortedCatCourses.map(course => (
                                                <div key={course._id} className="w-[300px] sm:w-[340px] flex-shrink-0 snap-start">
                                                    {renderCourseCard(course)}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : filteredCourses.length === 0 ? (
                        <div className="bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl p-12 text-center shadow-md text-slate-700">
                            <BookMarked className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">Chưa có khóa học nào thuộc lĩnh vực này</p>
                            <p className="text-sm text-slate-500 mt-1">Vui lòng chọn các danh mục khác hoặc quay lại sau.</p>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sortCoursesByLevel(filteredCourses).map(course => (
                                <div key={course._id}>
                                    {renderCourseCard(course)}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </SeekerLayout>
        );
    }

    // Render Course Details & Player
    const completedList = completedLessons[selectedCourse._id] || [];
    const isCourseCompleted = completedList.length === selectedCourse.lessonsCount;

    return (
        <SeekerLayout title={selectedCourse.title} breadcrumb={`Học tập › Khóa học › ${selectedCourse.title}`}>
            <div className="max-w-7xl mx-auto w-full">
                {/* Back to List */}
                <button
                    onClick={() => { setSelectedCourse(null); setActiveLesson(null); }}
                    className="flex items-center gap-1.5 text-sm font-bold text-gray-600 hover:text-[#F5C518] mb-6 transition"
                >
                    <ChevronLeft className="w-4 h-4" /> Quay lại danh sách
                </button>

                {courseDetailLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="w-10 h-10 animate-spin text-[#0A2463]" />
                        <p className="text-sm text-slate-500 font-medium">Đang tải nội dung khóa học...</p>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-8 items-start">
                        {/* LEFT: Player & Content - 2 columns */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Video / Player Area */}
                            {activeLesson && (
                                <div className="bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl overflow-hidden text-slate-800 shadow-md">
                                    {activeLesson.videoUrl ? (
                                        <div className="aspect-video w-full bg-black relative">
                                            <iframe
                                                src={activeLesson.videoUrl}
                                                title={activeLesson.title}
                                                className="absolute inset-0 w-full h-full border-0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                allowFullScreen
                                            ></iframe>
                                        </div>
                                    ) : (
                                        <div className="aspect-video w-full bg-slate-900 flex flex-col items-center justify-center text-white p-8 text-center gap-3">
                                            <Video className="w-16 h-16 text-white/40 animate-pulse" />
                                            <p className="text-lg font-bold">Bài học không có video</p>
                                            <p className="text-sm text-white/60 max-w-sm">Mời bạn đọc tài liệu hướng dẫn chi tiết ở phần bên dưới.</p>
                                        </div>
                                    )}

                                    {/* Active Lesson Text Info */}
                                    <div className="p-6">
                                        <div className="flex items-start justify-between gap-4 mb-4">
                                            <div>
                                                <span className="text-xs bg-[#F5C518]/20 text-[#F5C518] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                                                    Bài {activeLesson.order}
                                                </span>
                                                <h2 className="text-xl font-bold text-[#0A2463] mt-2">{activeLesson.title}</h2>
                                                <p className="text-sm text-slate-600 mt-1">{activeLesson.description}</p>
                                            </div>
                                            <button
                                                onClick={() => handleToggleCompleteLesson(activeLesson._id)}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                                                    completedList.includes(activeLesson._id)
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : 'bg-white text-gray-600 hover:text-emerald-700 border-gray-200 hover:border-emerald-200'
                                                }`}
                                            >
                                                <CheckCircle className={`w-4 h-4 ${completedList.includes(activeLesson._id) ? 'fill-emerald-700 text-white' : ''}`} />
                                                {completedList.includes(activeLesson._id) ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}
                                            </button>
                                        </div>

                                        {/* Reading content */}
                                        <div className="border-t border-slate-200 pt-6 mt-6">
                                            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                                                <FileText className="w-4 h-4 text-cyan-600" /> Tài liệu tự học nâng cao
                                            </h3>
                                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-sm text-slate-700 leading-relaxed whitespace-pre-line text-justify shadow-inner">
                                                {activeLesson.content || "Chưa có tài liệu bổ trợ cho bài học này."}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Instructor Card */}
                            <div className="bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl p-6 flex flex-col sm:flex-row gap-4 items-center sm:items-start text-center sm:text-left text-slate-800 shadow-md">
                                <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 text-[#0A2463] flex items-center justify-center font-bold text-2xl shadow-md flex-shrink-0">
                                    {selectedCourse.instructor?.name?.charAt(0)}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <h4 className="font-bold text-slate-800 text-lg">{selectedCourse.instructor?.name}</h4>
                                    <p className="text-xs text-[#F5C518] font-semibold">{selectedCourse.instructor?.title}</p>
                                    <p className="text-xs text-slate-600 leading-relaxed pt-1">
                                        Giảng viên có nhiều năm kinh nghiệm thực chiến trong ngành, chịu trách nhiệm xây dựng nội dung bài giảng chất lượng cao bám sát thực tiễn phỏng vấn của các doanh nghiệp hàng đầu.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Course outline - 1 column */}
                        <div className="space-y-6">
                            {/* Course Progress Card */}
                            <div className="bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl p-6 text-slate-800 shadow-md">
                                <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Tiến độ khóa học</h3>
                                <div className="flex items-center justify-between text-sm text-slate-700 mb-2 font-semibold">
                                    <span>Tốc độ hoàn thành</span>
                                    <span>{Math.round((completedList.length / selectedCourse.lessonsCount) * 100)}%</span>
                                </div>
                                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-4 border border-slate-200">
                                    <div
                                        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500"
                                        style={{ width: `${(completedList.length / selectedCourse.lessonsCount) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="text-xs text-slate-500 flex justify-between">
                                    <span>Đã xong: {completedList.length}/{selectedCourse.lessonsCount} bài</span>
                                    {isCourseCompleted && (
                                        <span className="text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 animate-bounce shadow-sm">
                                            <Award className="w-3.5 h-3.5" /> Xuất sắc!
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Lessons Playlist */}
                            <div className="bg-white/80 border border-slate-200/60 backdrop-blur-md rounded-2xl overflow-hidden text-slate-800 shadow-md">
                                <div className="bg-slate-100 border-b border-slate-200 px-5 py-4 text-slate-800 font-bold">
                                    <h3 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                                        <BookMarked className="w-4 h-4 text-[#F5C518]" /> Danh sách bài học
                                    </h3>
                                </div>
                                <div className="divide-y divide-slate-200 max-h-[420px] overflow-y-auto">
                                    {selectedCourse.lessons && [...selectedCourse.lessons].sort((a,b) => a.order - b.order).map((les, index) => {
                                        const isSelected = activeLesson?._id === les._id;
                                        const isCompleted = completedList.includes(les._id);
                                        return (
                                            <button
                                                key={les._id}
                                                onClick={() => setActiveLesson(les)}
                                                className={`w-full p-4 flex gap-3 text-left transition-all hover:bg-slate-100/50 cursor-pointer ${
                                                    isSelected ? 'bg-[#F5C518]/10 border-l-4 border-[#F5C518]' : ''
                                                }`}
                                            >
                                                {/* Play / Check Icon */}
                                                <div className="flex-shrink-0 mt-0.5">
                                                    {isCompleted ? (
                                                        <CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-100" />
                                                    ) : (
                                                        <PlayCircle className={`w-5 h-5 ${isSelected ? 'text-[#0A2463] font-bold' : 'text-slate-400'}`} />
                                                    )}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex justify-between items-center gap-2">
                                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-[#0A2463]/70' : 'text-slate-400'}`}>Bài {les.order}</span>
                                                        <span className={`text-[10px] flex items-center gap-0.5 ${isSelected ? 'text-[#0A2463]/70' : 'text-slate-400'}`}>
                                                            <Clock className="w-2.5 h-2.5" /> {les.duration}
                                                        </span>
                                                    </div>
                                                    <p className={`text-xs font-bold mt-1 line-clamp-2 leading-snug ${isSelected ? 'text-[#0A2463]' : 'text-slate-700'}`}>
                                                        {les.title}
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </SeekerLayout>
    );
}
