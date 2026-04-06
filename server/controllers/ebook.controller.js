import { Ebook } from "../models/ebook.model.js";
import { uploadMedia, deleteMediaFromCloudinary } from "../utils/cloudinary.js";





export const addEbook = async (req, res) => {
    try {
        const { title, description, authorName, price, validityPeriod } = req.body;

        if (!title || !description || !authorName || price === undefined || price === null) {
            return res.status(400).json({
                message: "Title, description, author name and price are required."
            });
        }

        if (price < 0) {
            return res.status(400).json({
                message: "Price cannot be negative."
            });
        }

        const ebook = await Ebook.create({
            title,
            description,
            authorName,
            price,
            validityPeriod,
            creator: req.id
        });

        return res.status(201).json({
            ebook,
            message: "E-book created successfully."
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to create e-book"
        });
    }
};

export const createEbook = async (req, res) => {
    try {
        const { title, description, authorName, authorBio, price, noOfPages, yearOfPublication, edition, language, publisherName, isbn } = req.body;

        if (!title || !description || !authorName || !price || !yearOfPublication || !edition || !language || !publisherName || !isbn) {
            return res.status(400).json({
                message: "All required fields must be filled: title, description, author name, price, year, edition, language, publisher, and ISBN."
            });
        }

        const ebook = await Ebook.create({
            title,
            description,
            authorName,
            authorBio,
            price,
            noOfPages,
            yearOfPublication,
            edition,
            language,
            publisherName,
            isbn,
            creator: req.id
        });

        return res.status(201).json({
            ebook,
            message: "E-book created successfully."
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to create e-book"
        });
    }
};






export const getEbooksByCreator = async (req, res) => {
    try {
        const creatorId = req.id;
        const ebooks = await Ebook.find({ creator: creatorId });

        return res.status(200).json({
            ebooks
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to fetch e-books"
        });
    }
};





export const editEbook = async (req, res) => {

    // console.log("EDIT EBOOK API HIT");

    try {
        // 2 things
        // console.log("body", req.body);
        // console.log("files", req.files);
        const { ebookId } = req.params;
        const { title, description, authorName, authorBio, price, noOfPages, validityPeriod, yearOfPublication, edition, language, publisherName, isbn, resource, domain } = req.body;

        const ebook = await Ebook.findById(ebookId);
        if (!ebook) {
            return res.status(404).json({ message: "E-book not found!" });
        }

        /* ================= THUMBNAIL ================= */
        if (req.files?.thumbnail?.[0]) {
            if (ebook.thumbnail) {
                const publicId = ebook.thumbnail.split("/").pop().split(".")[0];
                await deleteMediaFromCloudinary(publicId);
            }
            const uploadedThumb = await uploadMedia(req.files.thumbnail[0].path);
            ebook.thumbnail = uploadedThumb.secure_url;
        }

        /* ================= PDF FILE ================= */
        if (req.files?.filePDFUrl?.[0]) {
            if (ebook.filePDFUrl) {
                const publicId = ebook.filePDFUrl.split("/").pop().split(".")[0];
                await deleteMediaFromCloudinary(publicId);
            }
            const uploadedPdf = await uploadMedia(req.files.filePDFUrl[0].path, "pdf");
            ebook.filePDFUrl = uploadedPdf.secure_url;
        }

        /* ================= AUTHOR IMAGE ================= */
        if (req.files?.authorImage?.[0]) {
            if (ebook.authorImage) {
                const publicId = ebook.authorImage.split("/").pop().split(".")[0];
                await deleteMediaFromCloudinary(publicId);
            }
            const uploadedAuthorImage = await uploadMedia(req.files.authorImage[0].path);
            ebook.authorImage = uploadedAuthorImage.secure_url;
        }

        /* ================= BASIC FIELDS ================= */
        if (title !== undefined) ebook.title = title;
        if (description !== undefined) ebook.description = description;
        if (authorName !== undefined) ebook.authorName = authorName;
        if (authorBio !== undefined) ebook.authorBio = authorBio;
        if (price !== undefined) ebook.price = Number(price);
        if (noOfPages !== undefined) ebook.noOfPages = Number(noOfPages);
        if (validityPeriod !== undefined) ebook.validityPeriod = validityPeriod;
        if (yearOfPublication !== undefined) ebook.yearOfPublication = Number(yearOfPublication);
        if (edition !== undefined) ebook.edition = edition;
        if (language !== undefined) ebook.language = language;
        if (publisherName !== undefined) ebook.publisherName = publisherName;
        if (isbn !== undefined) ebook.isbn = isbn;
        if (resource !== undefined) ebook.resource = resource;
        if (domain !== undefined) {
            ebook.domain = Array.isArray(domain) ? domain : [domain];
        }

        await ebook.save();

        return res.status(200).json({
            message: "E-book updated successfully",
            ebook
        });

    } catch (error) {
        console.error("Edit E-book Error:", error);
        return res.status(500).json({ message: "Failed to edit e-book" });
    }
};





export const deleteEbook = async (req, res) => {
    try {
        const { ebookId } = req.params;
        const ebook = await Ebook.findById(ebookId);

        if (!ebook) {
            return res.status(404).json({ message: "E-book not found!" });
        }

        // Delete images/pdfs from cloudinary
        if (ebook.thumbnail) {
            const publicId = ebook.thumbnail.split("/").pop().split(".")[0];
            await deleteMediaFromCloudinary(publicId);
        }
        if (ebook.filePDFUrl) {
            const publicId = ebook.filePDFUrl.split("/").pop().split(".")[0];
            await deleteMediaFromCloudinary(publicId);
        }
        if (ebook.authorImage) {
            const publicId = ebook.authorImage.split("/").pop().split(".")[0];
            await deleteMediaFromCloudinary(publicId);
        }

        await Ebook.findByIdAndDelete(ebookId);

        return res.status(200).json({
            message: "E-book deleted successfully."
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to delete e-book"
        });
    }
};





export const getEbookById = async (req, res) => {
    try {
        const { ebookId } = req.params;
        const ebook = await Ebook.findById(ebookId).populate({ path: "creator" }).populate("resource").populate("domain");
        if (!ebook) {
            return res.status(404).json({ message: "E-book not found!" });
        }

        const userId = req.id;
        const user = userId
            ? await req.app.locals.models?.User?.findById(userId) || await import("../models/user.model.js").then(m => m.User.findById(userId))
            : null;
        const isOwner = userId ? ebook.creator._id.toString() === userId.toString() : false;
        const isPurchased = userId
            ? user?.enrolledEbooks?.some(id => id.toString() === ebookId.toString())
            : false;
        const hasFreeCartAccess = userId
            ? Number(ebook.price || 0) === 0 && user?.cart?.some(
                item => item.resourceType === "ebook" && item.resourceId?.toString() === ebookId.toString()
            )
            : false;

        if (!isOwner && !isPurchased && !hasFreeCartAccess) {
            ebook.filePDFUrl = undefined;
        }

        return res.status(200).json({ ebook });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Failed to get e-book" });
    }
};





export const togglePublishEbook = async (req, res) => {
    try {
        const { ebookId } = req.params;
        const { publish } = req.query;
        const ebook = await Ebook.findById(ebookId);
        if (!ebook) {
            return res.status(404).json({ message: "E-book not found!" });
        }

        ebook.isPublished = publish === "true";
        await ebook.save();

        const statusMessage = ebook.isPublished ? "Published" : "Unpublished";
        return res.status(200).json({
            message: `E-book is ${statusMessage}`
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Failed to update status" });
    }
};




export const getPublishedEbooks = async (req, res) => {
    try {
        const ebooks = await Ebook.find({ isPublished: true }).populate({ path: "creator" }).populate("resource").populate("domain");
        return res.status(200).json({ ebooks });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Failed to fetch published e-books" });
    }
}

export const rateEbook = async (req, res) => {
    try {
        const studentId = req.id;
        const { ebookId } = req.params;
        const { rating } = req.body;

        if (rating == null || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: "Invalid rating value." });
        }

        const ebook = await Ebook.findById(ebookId);
        if (!ebook) {
            return res.status(404).json({ success: false, message: "Ebook not found." });
        }

        const existingRatingIndex = ebook.ratings.findIndex(r => r.userId.toString() === studentId);
        if (existingRatingIndex >= 0) {
            ebook.ratings[existingRatingIndex].rating = rating;
        } else {
            ebook.ratings.push({ userId: studentId, rating });
        }

        await ebook.save();

        const totalRatings = ebook.ratings.length;
        const avgRating = totalRatings > 0 ? (ebook.ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1) : 0;

        return res.status(200).json({ success: true, message: "Ebook rated successfully!", averageRating: avgRating });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to rate ebook." });
    }
};
