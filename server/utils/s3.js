import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

export const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const bucketName = process.env.AWS_BUCKET_NAME;

/**
 * @param {string} filePath
 * @param {"video" | "raw" | "pdf" | null} explicitType
 */
export const uploadMedia = async (filePath, explicitType = null) => {
  try {
    let folder = "images";
    if (explicitType === "video") folder = "course-videos";
    else if (explicitType === "raw" || explicitType === "pdf") folder = "course-pdfs";

    // generate a unique key for S3
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const fileStream = fs.createReadStream(filePath);

    let contentType = "application/octet-stream";
    if (explicitType === "video") contentType = "video/mp4";
    else if (explicitType === "pdf") contentType = "application/pdf";
    else contentType = "image/jpeg"; // default for images

    const uploadParams = {
      Bucket: bucketName,
      Key: fileName,
      Body: fileStream,
      ContentType: contentType,
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    // After uploading, return the backend proxy URL that will redirect to a pre-signed URL.
    // This allows the DB to store a permanent URL that dynamically signs the S3 asset on fetch
    const secure_url = `${process.env.API_URL || 'http://localhost:5000'}/api/v1/media/s3?key=${encodeURIComponent(fileName)}`;

    return {
      public_id: fileName, // Use the S3 Key as public_id
      secure_url: secure_url,
      resource_type: explicitType || "image",
    };
  } catch (error) {
    console.error("S3 upload failed:", error);
    throw error;
  }
};


export const deleteMediaFromCloudinary = async (publicId) => {
  try {
    const deleteParams = {
      Bucket: bucketName,
      Key: publicId,
    };
    await s3Client.send(new DeleteObjectCommand(deleteParams));
  } catch (error) {
    console.error("S3 delete failed:", error);
  }
};

export const deleteVideoFromCloudinary = async (publicId) => {
  try {
    const deleteParams = {
      Bucket: bucketName,
      Key: publicId,
    };
    await s3Client.send(new DeleteObjectCommand(deleteParams));
  } catch (error) {
    console.error("S3 delete video failed:", error);
  }
};

// Newly added to support dynamically generated pre-signed URLs
export const generatePresignedUrl = async (key) => {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    // Valid for 2 mins (120 seconds) - extremely short to prevent URL sharing
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 120 });
    return signedUrl;
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
    throw error;
  }
};

export const extractPublicId = (url) => {
  if (!url) return null;
  try {
    // If it's a relative URL, mock a base to parse properly
    const urlObj = new URL(url, 'http://localhost');
    if (urlObj.searchParams.has("key")) {
      return urlObj.searchParams.get("key");
    }
    return url.split("/").pop().split(".")[0];
  } catch (e) {
    return url.split("/").pop().split(".")[0];
  }
};

