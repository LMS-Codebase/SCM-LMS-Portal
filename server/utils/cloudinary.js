import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  cloud_name: process.env.CLOUD_NAME,
});

/**
 * @param {string} filePath
 * @param {"video" | "raw" | "pdf"} explicitType
 */
export const uploadMedia = async (filePath, explicitType = null) => {
  try {
    let resourceType = "auto";
    let folder = "images";

    if (explicitType === "video") {
      resourceType = "video";
      folder = "course-videos";
    } else if (explicitType === "raw" || explicitType === "pdf") {
      resourceType = "auto";
      folder = "course-pdfs";
    }

    const res = await cloudinary.uploader.upload(filePath, {
      resource_type: resourceType,
      folder,
      use_filename: true,
      access_mode: "public", // 🔥 Ensures the URL is publicly accessible
    });

    return {
      public_id: res.public_id,
      secure_url: res.secure_url,
      resource_type: res.resource_type,
    };

  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    throw error;
  }
};


export const deleteMediaFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(error);
  }
};

export const deleteVideoFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
  } catch (error) {
    console.error(error);
  }
};

