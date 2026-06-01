import express from "express";
import controller from "./job.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import Job from "./job.model.js";

const router = express.Router();


/* ===== PUBLIC: Tìm kiếm tất cả job ===== */
router.get("/search", async (req, res) => {
  try {
    const {
      keyword,
      location,
      jobType,
      salaryMin,
      salaryMax,
      page = 1,
      limit = 8,
      sort = "newest",
    } = req.query;

    const query = { status: "open" };

    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ];
    }

    if (location) {
      query["location.city"] = { $regex: location, $options: "i" };
    }

    if (jobType) {
      const types = jobType.split(",");
      query.jobType = { $in: types };
    }

    if (salaryMin) query["salary.min"] = { $gte: Number(salaryMin) };
    if (salaryMax) query["salary.max"] = { $lte: Number(salaryMax) };

    const sortOrder = sort === "newest" ? { isPremium: -1, createdAt: -1 } : { isPremium: -1, salary: -1 };
    const skip = (Number(page) - 1) * Number(limit);

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate("recruiterId", "name companyName avatar avatarUrl")
        .sort(sortOrder)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Job.countDocuments(query),
    ]);

    res.json({
      data: jobs,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

/* ===== JOB: Tạo job mới ===== */
router.post("/", authMiddleware, controller.createJob);
/* ===== JOB ===== */
router.post("/", authMiddleware, async (req, res) => {
    try {
        console.log("USER FROM TOKEN:", req.user); // 🔥 debug

        const job = new Job({
            ...req.body,
            recruiterId: req.user.userId
        });

        await job.save();

        res.status(201).json(job);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
});




/* ===== RECRUITER XEM DANH SÁCH APPLY ===== */
router.get(
  "/job-applications/:jobId",
  authMiddleware,
  controller.getJobDetail
);


router.get("/job-application", authMiddleware, controller.getMyJobs);

router.patch("/:jobId/toggle-status", authMiddleware, controller.toggleJobStatus);

/* ===== PUBLIC: Job detail cho job seeker ===== */
router.get("/:jobId", async (req, res) => {
  try {
    const { jobId } = req.params;
    if (!jobId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid jobId" });
    }

    const job = await Job.findById(jobId)
      .populate("recruiterId", "name companyName companyDescription companyWebsite avatar avatarUrl phone email")
      .lean();

    if (!job) return res.status(404).json({ message: "Job not found" });

    // Increment views
    await Job.findByIdAndUpdate(jobId, { $inc: { views: 1 } });

    // Related jobs: same recruiter or same jobType, exclude current
    const related = await Job.find({
      _id: { $ne: jobId },
      status: "open",
      $or: [
        { recruiterId: job.recruiterId?._id || job.recruiterId },
        { jobType: job.jobType },
      ],
    })
      .populate("recruiterId", "name companyName avatar avatarUrl")
      .limit(3)
      .sort({ isPremium: -1, createdAt: -1 })
      .lean();

    res.json({ job, related });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
