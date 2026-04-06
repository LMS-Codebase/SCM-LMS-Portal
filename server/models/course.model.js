import mongoose from "mongoose"

const courseSchema = new mongoose.Schema({
    courseTitle: {
        type: String,
        required: true
    },
    subTitle: {
        type: String,
    },
    description: {
        type: String,
    },

    courseLevel: {
        type: String,
        enum: ["Beginner", "Medium", "Advance"]
    },
    coursePrice: {
        type: Number
    },
    courseDuration: {
        type: String
    },
    validityPeriod: {
        type: String,
        enum: ['3 Months', '6 Months', '1 Year', 'Lifetime'],
        default: 'Lifetime'
    },
    courseThumbnail: {
        type: String,
    },


    // ✅ COMMON RESOURCES
    commonVideos: [
        {
            public_id: String,
            url: String,
            originalName: String
        }
    ],

    commonPdfs: [
        {
            public_id: String,
            url: String,
            originalName: String
        }
    ],


    enrolledStudents: [
        {
            // generating relationship b/w course model and User via user/student id 
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ],
    lectures: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lecture"
        }
    ],
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    isPublished: {
        type: Boolean,
        default: false
    },


    resource: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Resource",
        required: true,
    },

    domain: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Domain",
        required: true,
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


export const Course = mongoose.model("Course", courseSchema);