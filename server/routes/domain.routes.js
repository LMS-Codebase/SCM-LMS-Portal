import express from "express";
import multer from "multer";
import {
  createDomain,
  getDomains,
} from "../controllers/domain.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", isAuthenticated, upload.single("logo"), createDomain);
router.get("/", getDomains);

export default router;