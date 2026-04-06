import express from "express";
import { getUserCourseProgress, updateLectureProgress, markAsIncomplete } from "../controllers/courseProgress.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

// get progress 
router.route("/:courseId").get(isAuthenticated, getUserCourseProgress);

// mark lecture as viewed
router.route("/:courseId/lecture/:lectureId/view").post(isAuthenticated, updateLectureProgress);

// Reset progress 
router.route("/:courseId/reset").post(isAuthenticated, markAsIncomplete);

export default router;
