import express from "express";
import upload from "../utils/multer.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { createResource, getAllResources } from "../controllers/resource.controller.js";

const router = express.Router();

router.route("/")
  .post(isAuthenticated, upload.single("logo"), createResource)
  .get(getAllResources);

export default router;