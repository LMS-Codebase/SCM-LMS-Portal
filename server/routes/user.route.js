import express from "express";
import { register, login, getUserProfile, logout, updateProfile, rateInstructor, toggleCart } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../utils/multer.js";


const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/profile").get(isAuthenticated, getUserProfile);
router.route("/profile/update").put(isAuthenticated, upload.single("profilePhoto"), updateProfile);
router.route("/instructor/:instructorId/rate").post(isAuthenticated, rateInstructor);
router.route("/cart/toggle").post(isAuthenticated, toggleCart);


export default router; 