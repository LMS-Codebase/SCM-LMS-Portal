import express from "express";
import { sendContactMessage } from "../controllers/contact.controller.js";

const router = express.Router();

router.route("/").post(sendContactMessage);

export default router;
