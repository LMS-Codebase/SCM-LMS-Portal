// // controllers/domain.controller.js
// import Domain from "../models/domain.model.js";
// import { uploadMedia } from "../utils/s3.js";

// export const createDomain = async (req, res) => {
//   try {
//     const { name } = req.body;

//     let imageData = {};

//     if (req.file) {
//       try {
//         const uploadRes = await uploadMedia(req.file.path);
//         imageData = {
//           url: uploadRes.secure_url,
//           public_id: uploadRes.public_id,
//         };
//       } catch (cloudErr) {
//         console.error("Cloudinary upload error:", cloudErr);
//         return res.status(500).json({ message: "Cloudinary upload failed", error: cloudErr.message });
//       }
//     } else {
//       console.warn("No file uploaded: req.file is undefined");
//     }

//     let userId = req.id;
//     if (!userId) {
//       console.warn("User not authenticated, no user id found in req.id");
//       return res.status(401).json({ message: "User not authenticated" });
//     }

//     try {
//       const domain = await Domain.create({
//         name,
//         image: imageData,
//         createdBy: userId,
//       });

//       res.status(201).json({
//         success: true,
//         message: "Domain created successfully",
//         domain,
//       });
//     } catch (dbErr) {
//       console.error("Domain DB create error:", dbErr);
//       res.status(500).json({ message: "Failed to create domain in DB", error: dbErr.message });
//     }
//   } catch (error) {
//     console.error("General createDomain error:", error);
//     res.status(500).json({ message: "Failed to create domain", error: error.message });
//   }
// };

// export const getDomains = async (req, res) => {
//   try {
//     const domains = await Domain.find();

//     res.status(200).json({ domains });
//   } catch (error) {
//     res.status(500).json({ message: "Failed to fetch domains" });
//   }
// };


import Domain from "../models/domain.model.js";
import { uploadMedia } from "../utils/s3.js";

export const createDomain = async (req, res) => {
  try {
    const { name } = req.body;

    // ✅ SINGLE VALIDATION
    if (!name || !req.file) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const userId = req.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // ✅ Upload to Cloudinary
    let imageData = {};
    try {
      const fileKey = req.file.key;
      imageData = {
        url: `${process.env.API_URL || 'http://localhost:5000'}/api/v1/media/s3?key=${encodeURIComponent(fileKey)}`,
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
    const domain = await Domain.create({
      name,
      image: imageData,
      createdBy: userId,
    });

    res.status(201).json({
      success: true,
      message: "Domain created successfully",
      domain,
    });
  } catch (error) {
    console.error("General createDomain error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create domain",
      error: error.message,
    });
  }
};

export const getDomains = async (req, res) => {
  try {
    const domains = await Domain.find();
    res.status(200).json({ domains });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch domains",
      error: error.message,
    });
  }
};