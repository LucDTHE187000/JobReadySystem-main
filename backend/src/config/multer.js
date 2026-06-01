import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Thư mục lưu trữ CV
const uploadDir = path.join(__dirname, '../../uploads/cvs');

// Tạo thư mục nếu chưa tồn tại
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình storage
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, _file, cb) => {
        // Đặt tên file theo userId để dễ quản lý (1 user = 1 CV)
        const userId = req.user.userId;
        const ext = '.pdf';
        cb(null, `cv_${userId}${ext}`);
    },
});

// Chỉ cho phép file PDF
const fileFilter = (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Chỉ cho phép upload file PDF'), false);
    }
};

export const uploadCV = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});
