import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";
import { deleteMediaFromCloudinary, deleteVideoFromCloudinary, uploadMedia, extractPublicId } from "../utils/s3.js"


// Creating Courses
export const createCourse = async (req, res) => {
  try {
    const {
      courseTitle,
      subTitle,
      description,
      courseLevel,
      coursePrice,
      courseDuration,
      courseThumbnail,
      resource,
      domain
    } = req.body;
    if (!courseTitle || !resource || !domain || (Array.isArray(domain) && domain.length === 0)) {
      return res.status(400).json({
        message: "courseTitle, resource, and at least one domain are required."
      });
    }

    // Build course data object
    const courseData = {
      courseTitle,
      resource,
      domain,
      creator: req.id
    };
    if (subTitle !== undefined) courseData.subTitle = subTitle;
    if (description !== undefined) courseData.description = description;
    if (courseLevel !== undefined) courseData.courseLevel = courseLevel;
    if (coursePrice !== undefined) courseData.coursePrice = coursePrice;
    if (courseDuration !== undefined) courseData.courseDuration = courseDuration;
    if (courseThumbnail !== undefined) courseData.courseThumbnail = courseThumbnail;

    const course = await Course.create(courseData);
    return res.status(201).json({
      course,
      message: "Course Created."
    });

  } catch (error) {
    // console.log(error);
    return res.status(500).json({
      message: "Failed to create course"
    });
  }
}




export const getPublishedCourse = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true })
      .populate({ path: "creator", select: "name photoUrl" })
      .populate({ path: "resource" })
      .populate({ path: "domain" });
    if (!courses) {
      return res.status(404).json({
        message: "Course not found"
      })
    }
    return res.status(200).json({
      courses,
    })
  } catch (error) {
    // console.log(error); 

    // 500 = Interval server error 
    return res.status(500).json({
      message: "Failed to get published courses"
    })
  }
}




// Getting Courses
export const getCreatorCourses = async (req, res) => {
  try {

    // to get allInstructorCourses, we need user ID
    const userId = req.id;
    // we have creatorId == UserId .. field in CourseSchema ..which 'll help us to get courses of that particular instructor
    const courses = await Course.find({ creator: userId });
    if (!courses) {
      return res.status(404).json({
        courses: [],
        message: "Course not found"
      })
    };

    // if we get courses.... then let's return that
    return res.status(200).json({
      courses,
    })

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to create course"
    })
  }
}






// export const editCourse = async(req, res) => {
//     try {
//         const courseId = req.params.courseId;
//         const {courseTitle, subTitle, description, category, courseLevel, coursePrice, courseDuration} = req.body;
//         // coz we 'll not get thumbnail from body
//         const thumbnail = req.file;

//         let course = await Course.findById(courseId);
//         if(!course){
//             return res.status(404).json({
//                 message:"Course not found!"
//             })
//         }
//         // while updating thumbnail , have to delete the previous stored one also .
//         let courseThumbnail;
//         if(thumbnail){
//             if(course.courseThumbnail){
//                 const publicId = course.courseThumbnail.split("/").pop().split(".")[0];
//                 await deleteMediaFromCloudinary(publicId); //delete old image
//             }

//            // upload a thumbnail on cloudinary 
//            // --> gives secure_url  ....cloudinary response getting stored in this our courseThumbnail variable        
//             courseThumbnail = await uploadMedia(thumbnail.path);
//         }


//         const updateData = {courseTitle, subTitle, description, category, courseLevel, coursePrice, courseDuration, courseThumbnail:courseThumbnail?.secure_url}

//         // assigning updated data
//         course = await Course.findByIdAndUpdate(courseId, updateData, {new:true});

//         return res.status(200).json({
//             course,
//             message:"Course updated successfully."
//         })

//     } catch (error) {
//         console.log(error); 
//         return res.status(500).json({
//             message:"Failed to edit course"
//         })
//     }
// }
export const editCourse = async (req, res) => {
  try {
    const { courseId } = req.params;


    // These are optional inputs
    const {
      courseTitle,
      subTitle,
      description,
      courseLevel,
      coursePrice,
      courseDuration,
      validityPeriod,
      resource,
      domain
    } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found!" });
    }

    /* ================= THUMBNAIL ================= */
    // Only run this if user uploads a new image
    if (req.files?.courseThumbnail?.[0]) {
      if (course.courseThumbnail) {
        const publicId = extractPublicId(course.courseThumbnail);
        await deleteMediaFromCloudinary(publicId);
      }

      const fileKey = req.files.courseThumbnail[0].key;
      course.courseThumbnail = `${process.env.API_URL || 'http://localhost:5000'}/api/v1/media/s3?key=${encodeURIComponent(fileKey)}`;
    }

    /* ================= COMMON VIDEOS ================= */
    if (req.files?.commonVideos?.length > 0) {
      for (const file of req.files.commonVideos) {
        course.commonVideos.push({
          public_id: file.key,
          url: `${process.env.API_URL || 'http://localhost:5000'}/api/v1/media/s3?key=${encodeURIComponent(file.key)}`,
          originalName: file.originalname,
        });
      }
    }

    /* ================= COMMON PDFS ================= */
    if (req.files?.commonPdfs?.length > 0) {
      for (const file of req.files.commonPdfs) {
        course.commonPdfs.push({
          public_id: file.key,
          url: `${process.env.API_URL || 'http://localhost:5000'}/api/v1/media/s3?key=${encodeURIComponent(file.key)}`,
          originalName: file.originalname,
        });
      }
    }

    /* ================= BASIC FIELDS ================= */
    // Only fields that user sends are updated
    // Others remain unchanged
    if (courseTitle !== undefined) course.courseTitle = courseTitle;
    if (subTitle !== undefined) course.subTitle = subTitle;
    if (description !== undefined) course.description = description;
    if (courseLevel !== undefined) course.courseLevel = courseLevel;
    if (coursePrice !== undefined) course.coursePrice = Number(coursePrice);
    if (courseDuration !== undefined) course.courseDuration = courseDuration;
    if (validityPeriod !== undefined) course.validityPeriod = validityPeriod;
    if (resource !== undefined) course.resource = resource;
    if (domain !== undefined) {
      course.domain = Array.isArray(domain) ? domain : [domain];
    }

    await course.save();

    return res.status(200).json({
      message: "Course updated successfully",
      course
    });

  } catch (error) {
    console.error("Edit Course Error:", error);
    return res.status(500).json({ message: "All fields are required." });
  }
};


export const deleteCommonMedia = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { public_id, type } = req.body; // "video" | "pdf"

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // delete from cloudinary
    await deleteMediaFromCloudinary(public_id);

    if (type === "video") {
      course.commonVideos = course.commonVideos.filter(
        v => v.public_id !== public_id
      );
    }

    if (type === "pdf") {
      course.commonPdfs = course.commonPdfs.filter(
        p => p.public_id !== public_id
      );
    }

    await course.save();

    res.status(200).json({
      message: "Media deleted successfully",
      course
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete media" });
  }
};








export const getCourseById = async (req, res) => {
  try {
    // const courseId = req.params.courseId;
    const { courseId } = req.params;

    const course = await Course.findById(courseId)
      .populate({ path: "creator", select: "name mobileNo photoUrl bio socialLinks ratings" })
      .populate({
        path: "lectures",
        populate: { path: "subLectures" }
      })
      .populate("resource");

    if (!course) {
      return res.status(404).json({
        message: "Course not found!"
      });
    }

    const userId = req.id;
    const user = userId ? await import("../models/user.model.js").then(m => m.User.findById(userId).select("cart accessExpirations")) : null;
    const isOwner = userId ? course.creator?._id.toString() === userId.toString() : false;
    const isPurchased = userId
      ? course.enrolledStudents?.some(studentId => studentId.toString() === userId.toString())
      : false;
    const hasFreeCartAccess = userId
      ? Number(course.coursePrice || 0) === 0 && user?.cart?.some(
        item => item.resourceType === "course" && item.resourceId?.toString() === courseId.toString()
      )
      : false;

    let hasExpired = false;
    if (isPurchased && user) {
      const expRecord = user.accessExpirations?.find(exp => exp.resourceId?.toString() === courseId.toString());
      if (expRecord && expRecord.expiresAt && new Date(expRecord.expiresAt).getTime() < Date.now()) {
        hasExpired = true;
      }
    }

    if (!isOwner && (!isPurchased || hasExpired) && !hasFreeCartAccess) {
      // Keep course details visible, but hide protected learning assets until enrolled.
      course.lectures.forEach(lecture => {
        lecture.videoUrl = undefined;
        lecture.publicId = undefined;
        lecture.subLectures?.forEach(sub => {
          sub.videoUrl = undefined;
          sub.publicId = undefined;
        });
      });
      course.commonVideos?.forEach(video => {
        video.url = undefined;
        video.public_id = undefined;
      });
      course.commonPdfs?.forEach(pdf => {
        pdf.url = undefined;
        pdf.public_id = undefined;
      });
    }

    return res.status(200).json({
      course
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to get course by id"
    })
  }
}





//                                                    Lecture Page Logic

export const createLecture = async (req, res) => {
  try {
    const { lectureTitle } = req.body;
    const { courseId } = req.params;

    if (!lectureTitle || !courseId) {
      return res.status(400).json({
        message: "Lecture title is required"
      })
    };

    // create lecture
    const lecture = await Lecture.create({ lectureTitle });


    // after creating lecture , we have to push it into it's Particular course schema
    const course = await Course.findById(courseId);
    if (course) {
      course.lectures.push(lecture._id);
      await course.save();
    }

    return res.status(201).json({
      lecture,
      message: "Lecture created successfully."
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to create lecture"
    })
  }
}



// export const getCourseLecture = async (req, res) => {
//     try {
//         const {courseId} = req.params;
//         const course = await Course.findById(courseId).populate("lectures");
//          if(!course){
//             return res.status(404).json({
//                 message:"Course not found"
//             })
//          }
//          return res.status(200).json({
//             lectures:course.lectures
//          });

//     } catch (error) {
//         console.log(error); 
//         return res.status(500).json({
//             message:"Failed to get lectures"
//         })
//     }
// }

export const getCourseLecture = async (req, res) => {
  try {
    const { courseId } = req.params;

    // get course with lectures
    const course = await Course.findById(courseId)
      .populate({
        path: "lectures",
        populate: {
          path: "subLectures",
          select: "title videos pdfs createdAt"
        }
      });

    if (!course) {
      return res.status(404).json({
        message: "Course not found"
      });
    }

    res.status(200).json({
      success: true,
      lectures: course.lectures
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch lectures"
    });
  }
};





export const editLecture = async (req, res) => {
  try {

    // console.log(req.body);

    //  videoInfo obj contains public_id & url 
    const { lectureTitle, videoInfo, pdfInfo, isPreviewFree } = req.body;
    const { courseId, lectureId } = req.params;
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({
        message: "Lecture not found!"
      })
    }

    // update lecture
    if (lectureTitle) lecture.lectureTitle = lectureTitle;
    if (videoInfo?.videoUrl) lecture.videoUrl = videoInfo.videoUrl;
    if (videoInfo?.publicId) lecture.publicId = videoInfo.publicId;

    if (pdfInfo?.pdfUrl) lecture.pdfUrl = pdfInfo.pdfUrl;
    if (pdfInfo?.publicId) lecture.pdfPublicId = pdfInfo.publicId;

    lecture.isPreviewFree = isPreviewFree;

    await lecture.save();

    // Ensure the course still has the lecture id if it was not already added
    const course = await Course.findById(courseId);
    // in case , if lectureId not included in course , then add it .
    if (course && !course.lectures.includes(lecture._id)) {
      course.lectures.push(lecture._id);
      await course.save();
    };

    return res.status(200).json({
      lecture,
      message: "Lecture updated successfully."
    })

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to edit lectures"
    })
  }
}



export const removeLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const lecture = await Lecture.findByIdAndDelete(lectureId);
    if (!lecture) {
      return res.status(404).json({
        message: "Lecture not found!"
      });
    }
    // delete the lecture from cloudinary as well
    if (lecture.publicId) {
      await deleteVideoFromCloudinary(lecture.publicId);
    }

    // Remove the lecture reference from the associated course
    await Course.updateOne(
      { lectures: lectureId },  // find the course that contains the lecture
      { $pull: { lectures: lectureId } }  //remove the lectures id from the lectures array    
    );

    return res.status(200).json({
      message: "Lecture removed successfully."
    })

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to remove lecture"
    })
  }
}





export const getLectureById = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({
        message: "Lecture not found!"
      });
    }
    return res.status(200).json({
      lecture
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to get lecture by id"
    })
  }
}





// publish || unpublish course logic
export const togglePublishCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { publish } = req.query;   //true,false --> telling a action ... toPublish or not // publish = AbooleanValue
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        message: "Course not found!"
      });
    }

    // publish status based on the query parameter
    course.isPublished = publish === "true";
    await course.save();

    const statusMessage = course.isPublished ? "Published" : "Unpublished";
    return res.status(200).json({
      message: `Course is ${statusMessage}`
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to update status"
    })
  }
}

export const rateCourse = async (req, res) => {
  try {
    const studentId = req.id;
    const { courseId } = req.params;
    const { rating } = req.body;

    if (rating == null || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Invalid rating value." });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    const existingRatingIndex = course.ratings.findIndex(r => r.userId.toString() === studentId);
    if (existingRatingIndex >= 0) {
      course.ratings[existingRatingIndex].rating = rating;
    } else {
      course.ratings.push({ userId: studentId, rating });
    }

    await course.save();

    const totalRatings = course.ratings.length;
    const avgRating = totalRatings > 0 ? (course.ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1) : 0;

    return res.status(200).json({ success: true, message: "Course rated successfully!", averageRating: avgRating });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to rate course." });
  }
};


