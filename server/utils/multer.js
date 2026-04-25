import multer from "multer";
import multerS3 from "multer-s3";
import { s3Client } from "./s3.js";
import dotenv from "dotenv";

dotenv.config();

const storage = multerS3({
    s3: s3Client,
    bucket: process.env.AWS_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
        let folder = "images";
        if (file.mimetype.startsWith("video/")) {
            folder = "course-videos";
        } else if (file.mimetype === "application/pdf") {
            folder = "course-pdfs";
        } else if (
            file.mimetype === "application/vnd.ms-excel" ||
            file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ) {
            folder = "course-sheets";
        }

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = file.originalname.split('.').pop() || "bin";
        const finalKey = `${folder}/${file.fieldname}-${uniqueSuffix}.${ext}`;

        cb(null, finalKey);
    }
});

const upload = multer({ storage: storage });

export default upload;
