import { Router } from "express";
import { CampaignController } from "./campaign.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

router.post("/", authMiddleware, CampaignController.createCampaign);
router.get("/my", authMiddleware, CampaignController.getMyCampaigns);
router.get("/running", CampaignController.getAllRunningCampaigns);

export default router;
