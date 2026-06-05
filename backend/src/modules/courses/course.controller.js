import { CourseModel } from "./course.model.js";

/**
 * Lấy danh sách khóa học, hỗ trợ lọc theo field và level
 */
export const getCourses = async (req, res) => {
    try {
        const { field, level } = req.query;
        const query = {};

        if (field) {
            query.field = field;
        }

        if (level) {
            query.level = level;
        }

        const courses = await CourseModel.find(query)
            .select("-lessons.content") // Không lấy nội dung bài đọc khi lấy list để nhẹ request
            .sort({ createdAt: 1 })
            .lean();

        res.json({
            success: true,
            data: courses
        });
    } catch (error) {
        console.error("Error in getCourses:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Lấy chi tiết khóa học và danh sách bài học đầy đủ
 */
export const getCourseDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await CourseModel.findById(id).lean();

        if (!course) {
            return res.status(404).json({ success: false, message: "Không tìm thấy khóa học" });
        }

        res.json({
            success: true,
            data: course
        });
    } catch (error) {
        console.error("Error in getCourseDetail:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export default {
    getCourses,
    getCourseDetail
};
