import Resource from "../models/resource.model.js";
import { deleteMediaFromCloudinary, getApiBaseUrl } from "../utils/s3.js";

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
      const fileKey = req.file.key;
      logoData = {
        url: `${getApiBaseUrl()}/api/v1/media/s3?key=${encodeURIComponent(fileKey)}`,
        public_id: fileKey,
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

export const updateResourceThumbnail = async (req, res) => {
  try {
    const { resourceId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Thumbnail is required",
      });
    }

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    if (resource.logo?.public_id) {
      await deleteMediaFromCloudinary(resource.logo.public_id);
    }

    const fileKey = req.file.key;
    resource.logo = {
      url: `${getApiBaseUrl()}/api/v1/media/s3?key=${encodeURIComponent(fileKey)}`,
      public_id: fileKey,
    };

    await resource.save();

    res.status(200).json({
      success: true,
      message: "Resource thumbnail updated successfully",
      resource,
    });
  } catch (error) {
    console.error("updateResourceThumbnail error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update resource thumbnail",
      error: error.message,
    });
  }
};
