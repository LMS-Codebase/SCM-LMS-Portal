import mongoose from "mongoose";

const ebookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    authorName: {
        type: String,
        required: true,
    },
    authorBio: {
        type: String,
    },
    authorImage: {
        type: String,
    },
    price: {
        type: Number,
        required: true,
    },
    thumbnail: {
        type: String, // Cloudinary URL
    },
    filePDFUrl: {
        type: String, // Cloudinary URL
    },
    noOfPages: {
        type: Number,
    },
    validityPeriod: {
        type: String,
        enum: ['3 Months', '6 Months', '1 Year', 'Lifetime'],
        default: 'Lifetime'
    },
    yearOfPublication: {
        type: Number,
    },
    edition: {
        type: String,
    },
    language: {
        type: String,
    },
    publisherName: {
        type: String,
    },
    isbn: {
        type: String,
        match: [/^(?=(?:\D*\d){13}\D*$)[\d-]+$/, "Please provide a valid 13-digit ISBN number (hyphens allowed)."]
    },
    isPublished: {
        type: Boolean,
        default: false,
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    resource: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Resource",
    },
    domain: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Domain",
    }],
    ratings: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            rating: {
                type: Number,
                required: true,
                min: 1,
                max: 5
            }
        }
    ],
}, { timestamps: true });

export const Ebook = mongoose.model("Ebook", ebookSchema);
