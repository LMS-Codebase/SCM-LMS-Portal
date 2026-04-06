import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { createCourse, createLecture, deleteCommonMedia, editCourse, editLecture, getCourseById, getCourseLecture, getCreatorCourses, getLectureById, getPublishedCourse, removeLecture, togglePublishCourse, rateCourse } from "../controllers/course.controller.js";
import upload from "../utils/multer.js";
import { createSubLecture, getSubLectures, updateSubLecture } from "../controllers/subLecture.controller.js";


const router = express.Router();

// only authenticated user can create the course --> first isAuthenticated 'll get checked , then createCourse will run .

// Endpoint defined in 'index.js' as '/api/v1/course'
router.route("/").post(isAuthenticated, createCourse);

// getting published courses to display on explore page
router.route("/published-courses").get(isAuthenticated, getPublishedCourse);

router.route("/").get(isAuthenticated, getCreatorCourses);
// router.route("/:courseId").put(isAuthenticated, upload.single("courseThumbnail") ,editCourse);
router.route("/:courseId").put(
  isAuthenticated,
  upload.fields([
    { name: "courseThumbnail", maxCount: 1 },
    { name: "commonVideos", maxCount: 10 },
    { name: "commonPdfs", maxCount: 10 }
  ]),
  editCourse
);
router.route("/:courseId/common-media")
  .delete(isAuthenticated, deleteCommonMedia);



router.route("/:courseId").get(isAuthenticated, getCourseById);



// route for adding multiple common videos and pdfs in CourseTab


// lecture routes
router.route("/:courseId/lecture").post(isAuthenticated, createLecture);
router.route("/:courseId/lecture").get(isAuthenticated, getCourseLecture);
router.route("/:courseId/lecture/:lectureId").post(isAuthenticated, editLecture);
router.route("/lecture/:lectureId").delete(isAuthenticated, removeLecture);
router.route("/lecture/:lectureId").get(isAuthenticated, getLectureById);




/* ======================= SUB-LECTURE ROUTES (NEW) ======================= */

// create sub-lecture
router.route("/lecture/:lectureId/sub-lecture")
  .post(isAuthenticated, createSubLecture)
  .get(isAuthenticated, getSubLectures);

// // update sub-lecture
// router.route("/sub-lecture/:subLectureId")
//   .post(isAuthenticated, updateSubLecture);
router.route("/sub-lecture/:subLectureId")
  .post(
    isAuthenticated,
    upload.fields([
      { name: "videos", maxCount: 10 },
      { name: "pdfs", maxCount: 10 }
    ]),
    updateSubLecture
  );




// publish route
// to update some minor thing , so using 'patch' method
router.route("/:courseId").patch(isAuthenticated, togglePublishCourse);

// rate course
router.route("/:courseId/rate").post(isAuthenticated, rateCourse);

export default router; 