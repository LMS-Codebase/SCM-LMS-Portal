import express from "express";
import upload from "../utils/multer.js";
import { generatePresignedUrl, getApiBaseUrl } from "../utils/s3.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.route("/upload-video").post(isAuthenticated, upload.single("file"), async (req, res) => {
  try {
    const fileKey = req.file.key;
    const result = {
      public_id: fileKey,
      secure_url: `${getApiBaseUrl()}/api/v1/media/s3?key=${encodeURIComponent(fileKey)}`,
    };
    res.status(200).json({
      success: true,
      message: "File uploaded successfully.",
      data: result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error uploading file" });
  }
});

router.route("/upload-pdf").post(isAuthenticated, upload.single("file"), async (req, res) => {
  try {
    const fileKey = req.file.key;
    const result = {
      public_id: fileKey,
      secure_url: `${getApiBaseUrl()}/api/v1/media/s3?key=${encodeURIComponent(fileKey)}`,
    };
    res.status(200).json({
      success: true,
      message: "PDF uploaded successfully.",
      data: result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error uploading PDF" });
  }
});

router.route("/upload-sheet").post(isAuthenticated, upload.single("file"), async (req, res) => {
  try {
    const fileKey = req.file.key;
    const result = {
      public_id: fileKey,
      secure_url: `${getApiBaseUrl()}/api/v1/media/s3?key=${encodeURIComponent(fileKey)}`,
    };
    res.status(200).json({
      success: true,
      message: "Excel file uploaded successfully.",
      data: result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error uploading Excel file" });
  }
});

router.route("/public-s3").get(async (req, res) => {
  try {
    const key = req.query.key;
    if (!key) {
      return res.status(400).json({ message: "S3 Object Key is required" });
    }
    if (!String(key).startsWith("images/")) {
      return res.status(403).json({ message: "Only public image assets are allowed" });
    }
    const signedUrl = await generatePresignedUrl(key);
    res.redirect(signedUrl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generating public image URL" });
  }
});

router.route("/s3").get(isAuthenticated, async (req, res) => {
  try {
    const key = req.query.key;
    if (!key) {
      return res.status(400).json({ message: "S3 Object Key is required" });
    }
    const signedUrl = await generatePresignedUrl(key);
    res.redirect(signedUrl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generating pre-signed URL" });
  }
});

export default router;
