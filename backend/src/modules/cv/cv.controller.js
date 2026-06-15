import path from 'path';
import fs from 'fs';
import { promises as fs_promises } from 'fs';
import { fileURLToPath } from 'url';
import { UserModel } from '../users/user.model.js';
import CVService from './cv.service.js';
import { deductCredits, CREDIT_COSTS } from '../../utils/credit.util.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../../uploads/cvs');

export class CVController {
    /**
     * Author: Dương Trọng Lực - mssv: HE187000
     * Param: req, res
     * Description: Xử lý upload file PDF của người dùng. Lưu file vào server và add vào array cvs trong DB.
     */
    static async uploadCV(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'Vui lòng chọn file PDF để upload' });
            }

            const userId = req.user.userId;
            const originalFilename = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
            const fileSize = req.file.size;
            const timestamp = Date.now();
            const newFilename = `cv_${userId}_${timestamp}.pdf`;
            const filePath = `/uploads/cvs/${newFilename}`;

            console.log(`[CV Upload] User: ${userId}, Original: ${originalFilename}, New: ${newFilename}`);

            try {
                // Rename file từ multer default name thành new filename với timestamp
                const oldPath = req.file.path;
                const newPath = path.join(__dirname, '../../../uploads/cvs', newFilename);
                
                console.log(`[CV Upload] Renaming file from: ${oldPath} to: ${newPath}`);
                await fs_promises.rename(oldPath, newPath);
                console.log(`[CV Upload] File renamed successfully`);
            } catch (renameError) {
                console.error(`[CV Upload] Error renaming file:`, renameError);
                // Nếu rename fail, xóa file cũ
                try {
                    await fs_promises.unlink(req.file.path);
                } catch (unlinkError) {
                    console.error(`[CV Upload] Error deleting temp file:`, unlinkError);
                }
                return res.status(500).json({ message: 'Lỗi khi xử lý file upload' });
            }

            // Thêm CV vào array cvs
            const newCV = {
                fileName: originalFilename,
                filePath: filePath,
                fileSize: fileSize,
                uploadedAt: new Date(),
            };

            const updated = await UserModel.findByIdAndUpdate(
                userId,
                {
                    $push: { cvs: newCV },
                    resume: filePath // Cập nhật resume default là CV mới nhất
                },
                { new: true }
            );

            console.log(`[CV Upload] Added CV. Total CVs: ${updated.cvs.length}`);

            return res.status(200).json({
                message: 'Upload CV thành công',
                cv: updated.cvs[updated.cvs.length - 1],
                totalCVs: updated.cvs.length,
            });
        } catch (error) {
            console.error('[CV Upload] Error:', error);
            return res.status(500).json({ message: error.message || 'Lỗi khi upload CV' });
        }
    }

    /**
     * Xem CV trực tiếp (inline PDF) — Authenticated users
     * GET /api/cv/:userId
     */
    static async viewCV(req, res) {
        try {
            const { userId } = req.params;

            const user = await UserModel.findById(userId).select('resume name').lean();
            if (!user || !user.resume) {
                return res.status(404).json({ message: 'Không tìm thấy CV' });
            }

            const filePath = path.join(__dirname, '../../../', user.resume);

            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ message: 'File CV không tồn tại' });
            }

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename="CV_${user.name}.pdf"`);

            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);
        } catch (error) {
            console.error('View CV error:', error);
            return res.status(500).json({ message: 'Lỗi khi xem CV' });
        }
    }

    /**
     * Tải CV về máy — Authenticated users
     * GET /api/cv/:userId/download
     */
    static async downloadCV(req, res) {
        try {
            const { userId } = req.params;

            const user = await UserModel.findById(userId).select('resume name').lean();
            if (!user || !user.resume) {
                return res.status(404).json({ message: 'Không tìm thấy CV' });
            }

            const filePath = path.join(__dirname, '../../../', user.resume);

            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ message: 'File CV không tồn tại' });
            }

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="CV_${user.name}.pdf"`);

            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);
        } catch (error) {
            console.error('Download CV error:', error);
            return res.status(500).json({ message: 'Lỗi khi tải CV' });
        }
    }

    /**
     * Xóa 1 CV cụ thể — JOB_SEEKER only
     * DELETE /api/cv/:cvId
     */
    static async deleteCV(req, res) {
        try {
            const userId = req.user.userId;
            const { cvId } = req.params;

            console.log(`[Delete CV] User: ${userId}, CV ID: ${cvId}`);

            const user = await UserModel.findById(userId).select('cvs').lean();
            if (!user || !user.cvs || user.cvs.length === 0) {
                console.log(`[Delete CV] No CVs found for user: ${userId}`);
                return res.status(404).json({ message: 'Không có CV để xóa' });
            }

            // Tìm CV cần xóa
            const cvIndex = user.cvs.findIndex(cv => cv._id.toString() === cvId);
            if (cvIndex === -1) {
                console.log(`[Delete CV] CV not found: ${cvId}`);
                return res.status(404).json({ message: 'CV không tồn tại' });
            }

            const cv = user.cvs[cvIndex];
            console.log(`[Delete CV] Deleting file: ${cv.filePath}`);

            // Xóa file trên disk
            const filePath = path.join(__dirname, '../../../', cv.filePath);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`[Delete CV] File deleted from disk: ${filePath}`);
            }

            // Xóa CV khỏi array
            const newCVs = user.cvs.filter((_, idx) => idx !== cvIndex);
            
            // Cập nhật DB
            await UserModel.findByIdAndUpdate(userId, { cvs: newCVs });
            console.log(`[Delete CV] DB updated. Remaining CVs: ${newCVs.length}`);

            return res.status(200).json({ 
                message: 'Đã xóa CV thành công',
                remainingCVs: newCVs.length 
            });
        } catch (error) {
            console.error('Delete CV error:', error);
            return res.status(500).json({ message: 'Lỗi khi xóa CV' });
        }
    }

    /**
     * Lấy danh sách CV của user hiện tại
     * GET /api/cv/my-cv
     */
    static async getMyCV(req, res) {
        try {
            const userId = req.user.userId;
            console.log(`[Get CV] Fetching CVs for user: ${userId}`);

            const user = await UserModel.findById(userId).select('cvs name').lean();

            if (!user) {
                console.log(`[Get CV] User not found: ${userId}`);
                return res.status(200).json({ hasCVs: false, cvs: [] });
            }

            const cvs = user.cvs || [];
            console.log(`[Get CV] Found ${cvs.length} CVs for user ${userId}`);

            // Verify files exist on disk
            const validCVs = [];
            for (const cv of cvs) {
                const filePath = path.join(__dirname, '../../../', cv.filePath);
                if (fs.existsSync(filePath)) {
                    validCVs.push({
                        _id: cv._id,
                        fileName: cv.fileName,
                        filePath: cv.filePath,
                        fileSize: cv.fileSize,
                        uploadedAt: cv.uploadedAt,
                        analysis: cv.analysis,
                    });
                } else {
                    console.log(`[Get CV] File not found, removing: ${filePath}`);
                }
            }

            // Cleanup invalid CVs từ DB
            if (validCVs.length !== cvs.length) {
                await UserModel.findByIdAndUpdate(userId, { cvs: validCVs });
            }

            const response = {
                hasCVs: validCVs.length > 0,
                cvs: validCVs,
                totalCVs: validCVs.length,
            };

            console.log(`[Get CV] Returning:`, response);

            return res.status(200).json(response);
        } catch (error) {
            console.error('Get CVs error:', error);
            return res.status(500).json({ message: 'Lỗi khi lấy danh sách CV' });
        }
    }

    /**
     * Phân tích CV bằng AI
     * POST /api/cv/analyze
     * Body: { cvText, jobDescription? }
     */
    static async analyzeCV(req, res) {
        try {
            const { cvText, jobDescription } = req.body;

            if (!cvText || cvText.trim().length === 0) {
                return res.status(400).json({ error: 'Nội dung CV không được để trống' });
            }

            // Gọi CV Service để phân tích
            const analysis = await CVService.analyzeCV(cvText, jobDescription || '');

            return res.status(200).json({
                success: true,
                message: 'Phân tích CV thành công',
                data: analysis,
            });
        } catch (error) {
            console.error('Analyze CV error:', error);
            return res.status(500).json({ error: error.message || 'Lỗi khi phân tích CV' });
        }
    }

    /**
     * Phân tích CV cụ thể (Extract text từ file rồi analyze)
     * POST /api/cv/analyze-current
     * Body: { cvId? } - Nếu không chỉ định thì dùng CV mới nhất
     */
    static async analyzeCurrentCV(req, res) {
        try {
            const userId = req.user.userId;
            const { cvId } = req.body;

            console.log(`[Analyze CV] User: ${userId}, CV ID: ${cvId || 'latest'}`);

            const user = await UserModel.findById(userId).select('cvs').lean();
            if (!user || !user.cvs || user.cvs.length === 0) {
                console.log(`[Analyze CV] No CVs found for user: ${userId}`);
                return res.status(404).json({ error: 'Không tìm thấy CV để phân tích' });
            }

            // Nếu không chỉ định cvId, dùng CV mới nhất (cuối array)
            let cv;
            if (cvId) {
                cv = user.cvs.find(c => c._id.toString() === cvId);
                if (!cv) {
                    console.log(`[Analyze CV] CV not found: ${cvId}`);
                    return res.status(404).json({ error: 'CV không tồn tại' });
                }
            } else {
                cv = user.cvs[user.cvs.length - 1];
            }

            const filePath = path.join(__dirname, '../../../', cv.filePath);
            if (!fs.existsSync(filePath)) {
                console.log(`[Analyze CV] File not found at: ${filePath}`);
                return res.status(404).json({ error: 'File CV không tồn tại' });
            }

            console.log(`[Analyze CV] Extracting text from PDF: ${filePath}`);

            // Lazy import pdf-parse and extract text
            let cvText = '';
            try {
                const pdfModule = await import('pdf-parse');
                const pdfParse = pdfModule.default || pdfModule;
                const pdfBuffer = fs.readFileSync(filePath);
                const pdfData = await pdfParse(pdfBuffer);
                cvText = pdfData.text || '';
                console.log(`[Analyze CV] Extracted ${cvText.length} characters from PDF`);
            } catch (pdfError) {
                console.log(`[Analyze CV] PDF extraction error (will use fallback):`, pdfError.message);
                // Fallback: use filename as basic content
                cvText = `CV Name: ${cv.fileName}\nFile Size: ${cv.fileSize} bytes\nPlease upload a valid PDF with text content.`;
            }

            if (!cvText || cvText.trim().length === 0) {
                console.log(`[Analyze CV] No text extracted from PDF`);
                return res.status(400).json({ error: 'Không thể trích xuất text từ CV' });
            }

            console.log(`[Analyze CV] Extracted ${cvText.length} characters from PDF`);
            console.log(`[Analyze CV] Calling Groq service...`);

            try {
                await deductCredits(userId, CREDIT_COSTS.CV_ANALYZE, UserModel);
            } catch (creditErr) {
                return res.status(creditErr.status || 402).json({
                    error: creditErr.message || 'Không đủ credit để phân tích CV',
                });
            }

            // Gọi CV Service để phân tích
            const analysis = await CVService.analyzeCV(cvText, '');

            console.log(`[Analyze CV] Analysis complete. Score: ${analysis.score}`);

            // Lưu analysis vào DB
            const updated = await UserModel.findByIdAndUpdate(
                userId,
                {
                    $set: { 'cvs.$[elem].analysis': analysis }
                },
                {
                    arrayFilters: [{ 'elem._id': cv._id }],
                    new: true
                }
            );

            return res.status(200).json({
                success: true,
                message: 'Phân tích CV thành công',
                data: analysis,
            });
        } catch (error) {
            console.error('Analyze current CV error:', error);
            return res.status(500).json({ error: error.message || 'Lỗi khi phân tích CV' });
        }
    }

    /**
     * Lấy danh sách thiết kế mẫu CV của user hiện tại
     * GET /api/cv/designs
     */
    static async getCVDesigns(req, res) {
        try {
            const userId = req.user.userId;
            const user = await UserModel.findById(userId).select('cvDesigns').lean();
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            return res.status(200).json({
                success: true,
                designs: user.cvDesigns || []
            });
        } catch (error) {
            console.error('Get CV designs error:', error);
            return res.status(500).json({ message: 'Lỗi khi lấy danh sách thiết kế CV' });
        }
    }

    /**
     * Lưu thiết kế mẫu CV (Lưu mới hoặc lưu đè)
     * POST /api/cv/designs
     */
    static async saveCVDesign(req, res) {
        try {
            const userId = req.user.userId;
            const { id, name, data } = req.body;

            if (!name || !data) {
                return res.status(400).json({ message: 'Thiếu thông tin tên thiết kế hoặc dữ liệu thiết kế' });
            }

            const user = await UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            if (!user.cvDesigns) {
                user.cvDesigns = [];
            }

            let design;
            if (id) {
                // Tìm theo id
                design = user.cvDesigns.id(id);
            } else {
                // Hoặc tìm theo name
                design = user.cvDesigns.find(d => d.name === name);
            }

            if (design) {
                design.name = name;
                design.data = data;
                design.updatedAt = new Date();
            } else {
                user.cvDesigns.push({
                    name,
                    data,
                    updatedAt: new Date()
                });
            }

            await user.save();

            return res.status(200).json({
                success: true,
                message: 'Lưu thiết kế CV thành công',
                designs: user.cvDesigns
            });
        } catch (error) {
            console.error('Save CV design error:', error);
            return res.status(500).json({ message: 'Lỗi khi lưu thiết kế CV' });
        }
    }

    /**
     * Xóa thiết kế mẫu CV
     * DELETE /api/cv/designs/:id
     */
    static async deleteCVDesign(req, res) {
        try {
            const userId = req.user.userId;
            const { id } = req.params;

            const user = await UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            if (!user.cvDesigns) {
                return res.status(404).json({ message: 'Không tìm thấy thiết kế để xóa' });
            }

            user.cvDesigns = user.cvDesigns.filter(d => d._id.toString() !== id);
            await user.save();

            return res.status(200).json({
                success: true,
                message: 'Đã xóa thiết kế CV thành công',
                designs: user.cvDesigns
            });
        } catch (error) {
            console.error('Delete CV design error:', error);
            return res.status(500).json({ message: 'Lỗi khi xóa thiết kế CV' });
        }
    }
}
