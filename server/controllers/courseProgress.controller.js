import { CourseProgress } from "../models/courseProgress.model.js";
import { Course } from "../models/course.model.js";
import { User } from "../models/user.model.js";

export const getUserCourseProgress = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.id; // from isAuthenticated middleware

        if (!courseId || courseId === "undefined") {
            return res.status(400).json({ message: "Invalid course ID" });
        }

        // 1. Fetch the user's progress for this course
        let courseProgress = await CourseProgress.findOne({ courseId, userId }).populate("courseId");

        const courseDetails = await Course.findById(courseId).populate("lectures");

        if (!courseDetails) {
            return res.status(404).json({
                message: "Course not found",
            });
        }

        const user = await User.findById(userId).select("cart");
        const isOwner = courseDetails.creator?.toString() === userId.toString();
        const isPurchased = courseDetails.enrolledStudents?.some(studentId => studentId.toString() === userId.toString());
        const hasFreeCartAccess =
            Number(courseDetails.coursePrice || 0) === 0 &&
            user?.cart?.some(item => item.resourceType === "course" && item.resourceId?.toString() === courseId.toString());

        if (!isPurchased && !isOwner && !hasFreeCartAccess) {
            return res.status(403).json({
                message: "You must purchase this course to access its contents."
            });
        }

        // 2. If no progress found, return it as it is (showing the course with zero progress)
        if (!courseProgress) {
            return res.status(200).json({
                data: {
                    courseDetails,
                    progress: [],
                    completed: false,
                },
            });
        }

        // 3. Return the progress
        return res.status(200).json({
            data: {
                courseDetails,
                progress: courseProgress.lectureProgress,
                completed: courseProgress.completed,
            },
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error fetching course progress",
        });
    }
};

export const updateLectureProgress = async (req, res) => {
    try {
        const { courseId, lectureId } = req.params;
        const userId = req.id;

        if (!courseId || courseId === "undefined") {
            return res.status(400).json({ message: "Invalid course ID" });
        }

        // 1. Find or create the course progress record
        let courseProgress = await CourseProgress.findOne({ courseId, userId });

        if (!courseProgress) {
            // If it doesn't exist, create a new record
            courseProgress = await CourseProgress.create({
                userId,
                courseId,
                completed: false,
                lectureProgress: [],
            });
        }

        // 2. Find the lecture in the progress array
        const lectureIndex = courseProgress.lectureProgress.findIndex(
            (item) => item.lectureId.toString() === lectureId
        );

        if (lectureIndex !== -1) {
            // Lecture already exists, update its status
            courseProgress.lectureProgress[lectureIndex].viewed = true;
        } else {
            // Add new lecture progress
            courseProgress.lectureProgress.push({
                lectureId,
                viewed: true,
            });
        }

        // 3. Check if all course lectures are completed
        const course = await Course.findById(courseId).populate("lectures");
        if (courseProgress.lectureProgress.length === course.lectures.length) {
            courseProgress.completed = true;
        }

        await courseProgress.save();

        return res.status(200).json({
            message: "Lecture progress updated successfully.",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error updating lecture progress",
        });
    }
};

export const markAsIncomplete = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.id;

        const courseProgress = await CourseProgress.findOne({ courseId, userId });
        if (!courseProgress) {
            return res.status(404).json({
                message: "Course progress not found",
            });
        }

        courseProgress.completed = false;
        courseProgress.lectureProgress = [];
        await courseProgress.save();

        return res.status(200).json({
            message: "Course progress reset.",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error resetting course progress",
        });
    }
};
