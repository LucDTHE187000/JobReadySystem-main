import { Router } from 'express';
import { CVController } from './cv.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { uploadCV } from '../../config/multer.js';

export const cvRouter = Router();

// ⚠️ IMPORTANT: Specific routes MUST come before wildcard routes!

// Lấy thông tin CV của user hiện tại
cvRouter.get('/my-cv', authMiddleware, CVController.getMyCV);

// Phân tích CV bằng AI (POST /api/cv/analyze)
cvRouter.post('/analyze', authMiddleware, CVController.analyzeCV);

// Phân tích CV hiện tại của user (POST /api/cv/analyze-current)
cvRouter.post('/analyze-current', authMiddleware, CVController.analyzeCurrentCV);

// Quản lý mẫu thiết kế CV tự tạo
cvRouter.get('/designs', authMiddleware, CVController.getCVDesigns);
cvRouter.post('/designs', authMiddleware, CVController.saveCVDesign);
cvRouter.delete('/designs/:id', authMiddleware, CVController.deleteCVDesign);

// Upload CV (JOB_SEEKER only)
cvRouter.post('/upload', authMiddleware, (req, res, next) => {
    if (req.user.userContext?.role !== 'JOB_SEEKER') {
        return res.status(403).json({ message: 'Chỉ ứng viên mới có thể upload CV' });
    }
    next();
}, uploadCV.single('cv'), (err, req, res, next) => {
    if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File quá lớn. Kích thước tối đa là 5MB' });
        }
        return res.status(400).json({ message: err.message });
    }
    next();
}, CVController.uploadCV);

// Xóa 1 CV cụ thể (JOB_SEEKER only)
cvRouter.delete('/:cvId', authMiddleware, (req, res, next) => {
    if (req.user.userContext?.role !== 'JOB_SEEKER') {
        return res.status(403).json({ message: 'Chỉ ứng viên mới có thể xóa CV' });
    }
    next();
}, CVController.deleteCV);

// Wildcard routes MUST come LAST
// Xem CV trực tiếp (mở PDF trong trình duyệt)
cvRouter.get('/:userId', authMiddleware, CVController.viewCV);

// Tải CV về máy
cvRouter.get('/:userId/download', authMiddleware, CVController.downloadCV);
