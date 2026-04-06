import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        default: ""
    },
    mobileNo: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: (value) => /^\d{10}$/.test(String(value).trim()),
            message: "Mobile number must be exactly 10 digits."
        }
    },

    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["instructor", "student"],
        default: 'student'
    },

    // Generating Relationship between user and courses
    // A user can enroll in multiple courses that's y using array
    enrolledCourses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            default: [],
        }
    ],
    enrolledEbooks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Ebook',
            default: [],
        }
    ],
    accessExpirations: [
        {
            resourceId: { type: mongoose.Schema.Types.ObjectId },
            expiresAt: { type: Date }
        }
    ],
    photoUrl: {
        type: String,
        default: "",
    },
    bio: {
        type: String,
        default: ""
    },
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
    cart: [
        {
            resourceId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true
            },
            resourceType: {
                type: String,
                enum: ['course', 'ebook'],
                required: true
            }
        }
    ],

    // can be multiple , that's why using array
    socialLinks: [
        {
            title: String,
            link: String
        }
    ]
}, { timestamps: true });

export const User = mongoose.model("User", userSchema)
