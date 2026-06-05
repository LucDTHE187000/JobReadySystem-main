import mongoose from "mongoose";

const LessonSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    duration: { type: String }, // e.g. "15:30" or "45 phút"
    videoUrl: { type: String }, // YouTube embed or mock link
    content: { type: String }, // Text/Reading content
    order: { type: Number, default: 0 }
});

const CourseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    field: { type: String, required: true }, // e.g. "IT", "Sales", "Marketing", "Finance", "HR"
    description: { type: String, required: true },
    level: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Beginner" },
    instructor: {
        name: { type: String, required: true },
        title: { type: String },
        avatar: { type: String }
    },
    thumbnail: { type: String }, // Gradient style or Image URL
    lessons: [LessonSchema],
    duration: { type: String }, // e.g. "5 giờ 30 phút"
    lessonsCount: { type: Number, default: 0 }
}, {
    timestamps: true,
    collection: "courses"
});

export const CourseModel = mongoose.model("Course", CourseSchema);
