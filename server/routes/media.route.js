// uploading lectures

import express from "express";
import upload from "../utils/multer.js"
import { uploadMedia, generatePresignedUrl } from "../utils/s3.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";


const router = express.Router();


// end-point for media/lectureVideo upload
// making it's controller directly here, as it's only has few lines 
router.route("/upload-video").post(isAuthenticated, upload.single("file"), async (req, res) => {
    try {
        const fileKey = req.file.key;
        const result = {
            public_id: fileKey,
            secure_url: `${process.env.API_URL || 'http://localhost:5000'}/api/v1/media/s3?key=${encodeURIComponent(fileKey)}`,
        };
        res.status(200).json({
            success: true,
            message: "File uploaded successfully.",
            data: result
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error uploading file" })
    }
});

router.route("/upload-pdf").post(isAuthenticated, upload.single("file"), async (req, res) => {
    try {
        const fileKey = req.file.key;
        const result = {
            public_id: fileKey,
            secure_url: `${process.env.API_URL || 'http://localhost:5000'}/api/v1/media/s3?key=${encodeURIComponent(fileKey)}`,
        };
        res.status(200).json({
            success: true,
            message: "PDF uploaded successfully.",
            data: result
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error uploading PDF" })
    }
});

// Dynamic pre-signed URL proxy
router.route("/s3").get(isAuthenticated, async (req, res) => {
    try {
        const key = req.query.key;
        if (!key) {
            return res.status(400).json({ message: "S3 Object Key is required" });
        }
        const signedUrl = await generatePresignedUrl(key);
        // Redirect the browser to the pre-signed S3 URL
        res.redirect(signedUrl);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error generating pre-signed URL" });
    }
});


export default router;