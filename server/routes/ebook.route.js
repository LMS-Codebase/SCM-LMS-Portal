import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../utils/multer.js";
import {
    createEbook,
    addEbook,
    getEbooksByCreator,
    editEbook,
    deleteEbook,
    getEbookById,
    togglePublishEbook,
    getPublishedEbooks,
    rateEbook
} from "../controllers/ebook.controller.js";

const router = express.Router();

router.route("/published-ebooks").get(getPublishedEbooks);
router.route("/").post(isAuthenticated, createEbook);
router.route("/add").post(isAuthenticated, addEbook);
router.route("/").get(isAuthenticated, getEbooksByCreator);

router.route("/:ebookId").get(isAuthenticated, getEbookById);
router.route("/:ebookId").put(isAuthenticated, upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'filePDFUrl', maxCount: 1 },
    { name: 'authorImage', maxCount: 1 }
]), editEbook);

router.route("/:ebookId").delete(isAuthenticated, deleteEbook);
router.route("/:ebookId/publish").patch(isAuthenticated, togglePublishEbook);
router.route("/:ebookId/rate").post(isAuthenticated, rateEbook);

export default router;
