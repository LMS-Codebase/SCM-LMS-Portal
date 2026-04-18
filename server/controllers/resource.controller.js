import Resource from "../models/resource.model.js";
import { uploadMedia } from "../utils/s3.js";

export const createResource = async (req, res) => {
  try {
    const { name, type } = req.body;

    // ✅ SINGLE VALIDATION
    if (!name || !type || !req.file) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    let userId = req.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // ✅ Upload to Cloudinary
    let logoData = {};
    try {
      const uploadRes = await uploadMedia(req.file.path);
      logoData = {
        url: uploadRes.secure_url,
        public_id: uploadRes.public_id,
      };
    } catch (cloudErr) {
      console.error("Cloudinary upload error:", cloudErr);
      return res.status(500).json({
        success: false,
        message: "Cloudinary upload failed",
        error: cloudErr.message,
      });
    }

    // ✅ Save to DB
    const resource = await Resource.create({
      name,
      logo: logoData,
      type,
      createdBy: userId,
    });

    res.status(201).json({
      success: true,
      message: "Resource created successfully",
      resource,
    });
  } catch (error) {
    console.error("General createResource error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create resource",
      error: error.message,
    });
  }
};

export const getAllResources = async (req, res) => {
  try {
    const resources = await Resource.find();
    res.status(200).json({ resources });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch resources",
      error: error.message,
    });
  }
};