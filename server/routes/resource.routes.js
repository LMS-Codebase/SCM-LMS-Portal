import express from "express";
import upload from "../utils/multer.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  createResource,
  getAllResources,
  updateResourceThumbnail,
} from "../controllers/resource.controller.js";

const router = express.Router();

router.route("/")
  .post(isAuthenticated, upload.single("logo"), createResource)
  .get(getAllResources);

router.route("/:resourceId/thumbnail")
  .put(isAuthenticated, upload.single("logo"), updateResourceThumbnail);

export default router;
