import express from "express";

import {
  createDomain,
  getDomains,
  updateDomainThumbnail,
} from "../controllers/domain.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();
import upload from "../utils/multer.js";

router.post("/", isAuthenticated, upload.single("logo"), createDomain);
router.get("/", getDomains);
router.put("/:domainId/thumbnail", isAuthenticated, upload.single("logo"), updateDomainThumbnail);

export default router;
