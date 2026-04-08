import { User } from "../models/user.model.js";
import { Course } from "../models/course.model.js";
import { Ebook } from "../models/ebook.model.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";

//                                                          Register
export const register = async (req, res) => {
  try {
    const { name: mobileNo, password, role } = req.body;
    if (!mobileNo || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }
    if (!/^\d{10}$/.test(String(mobileNo).trim())) {
      return res.status(400).json({
        success: false,
        message: "Mobile number must be exactly 10 digits.",
      });
    }
    const user = await User.findOne({ mobileNo });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this mobile number.",
      });
    }

    // behind the scene use 'hashing algorithm'
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      mobileNo,
      password: hashedPassword,
      role
    });
    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to register",
    });
  }
};

//                                                           Login
export const login = async (req, res) => {
  try {
    const { name: mobileNo, password } = req.body;

    if (!mobileNo || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const user = await User.findOne({ mobileNo });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Incorrect mobile number or password",
      });
    }

    // isPasswordMatch a boolean variable
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect mobile number or password",
      });
    }

    generateToken(res, user, `Welcome back ${user.name}`);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to login",
    });
  }
};


export const logout = async (req, res) => {
  try {
    // maxAge : 0  means (turant/instantly) , get logout as soon as the user clicks logout button
    return res.status(200).cookie("token", "", { maxAge: 0, sameSite: "none", secure: true }).json({
      message: "Logged out successfully.",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to logout",
    });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    // User Profile will only be visible to that user who is already logged in
    // Need a Middleware => isAuthenticated / verified
    // isAuthenticated is our custom middleware ..that is making us sure that if we have a user ..then it will already be saved in req.id ..request object
    const userId = req.id;
    let user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "Profile not found",
        success: false
      })
    }

    // === Enforce Access Expirations (Lazy cleanup) ===
    const now = new Date();
    let hasChanges = false;

    if (user.accessExpirations && user.accessExpirations.length > 0) {
      const activeExpirations = [];
      user.accessExpirations.forEach(exp => {
        if (exp.expiresAt && new Date(exp.expiresAt) < now) {
          user.enrolledCourses.pull(exp.resourceId);
          user.enrolledEbooks.pull(exp.resourceId);
          hasChanges = true;
        } else {
          activeExpirations.push(exp);
        }
      });
      if (hasChanges) {
        user.accessExpirations = activeExpirations;
        await user.save();
      }
    }

    // Now reload user with populated content
    user = await User.findById(userId)
      .select("-password")
      .populate({
        path: "enrolledCourses",
        populate: { path: "creator", select: "name photoUrl" }
      })
      .populate({
        path: "enrolledEbooks",
        populate: { path: "creator", select: "name photoUrl" }
      });



    // Hydrate cart details
    let cartDetails = [];
    if (user.cart && user.cart.length > 0) {
      for (const item of user.cart) {
        if (item.resourceType === 'course') {
          const course = await mongoose.model("Course").findById(item.resourceId).select("courseTitle coursePrice courseThumbnail");
          if (course) cartDetails.push({ ...item.toObject(), details: course, price: course.coursePrice });
        } else if (item.resourceType === 'ebook') {
          const ebook = await mongoose.model("Ebook").findById(item.resourceId).select("title price thumbnail");
          if (ebook) cartDetails.push({ ...item.toObject(), details: ebook, price: ebook.price });
        }
      }
    }

    const userObj = user.toObject();
    userObj.cartDetails = cartDetails;

    return res.status(200).json({
      success: true,
      user: userObj
    })

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to Load User",
    });
  }
};



export const updateProfile = async (req, res) => {
  try {
    const userId = req.id;
    const { name, bio, socialLinks } = req.body;
    const profilePhoto = req.file;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false
      })
    }

    let photoUrl = user.photoUrl; // Default to existing photo

    // If a new photo is uploaded
    if (profilePhoto) {
      // Delete old photo from Cloudinary if it exists
      if (user.photoUrl) {
        const publicId = user.photoUrl.split("/").pop().split(".")[0];
        await deleteMediaFromCloudinary(publicId);
      }
      // Upload new photo
      const cloudResponse = await uploadMedia(profilePhoto.path);
      photoUrl = cloudResponse.secure_url;
    }

    // Prepare updated data
    const updatedData = {
      name: name || user.name,
      photoUrl,
      bio: bio !== undefined ? bio : user.bio,
    };

    // Handle socialLinks (might come as a JSON string from frontend due to FormData)
    if (socialLinks) {
      try {
        updatedData.socialLinks = typeof socialLinks === 'string' ? JSON.parse(socialLinks) : socialLinks;
      } catch (error) {
        console.error("Error parsing socialLinks:", error);
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true }).select("-password");

    return res.status(200).json({
      success: true,
      user: updatedUser,
      message: "Profile updated successfully."
    })

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to Update Profile",
    });
  }
}

export const rateInstructor = async (req, res) => {
  try {
    const studentId = req.id;
    const { instructorId } = req.params;
    const { rating } = req.body;

    if (rating == null || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Invalid rating value." });
    }

    const instructor = await User.findById(instructorId);
    if (!instructor || instructor.role !== 'instructor') {
      return res.status(404).json({ success: false, message: "Instructor not found." });
    }

    const existingRatingIndex = instructor.ratings.findIndex(r => r.userId.toString() === studentId);
    if (existingRatingIndex >= 0) {
      instructor.ratings[existingRatingIndex].rating = rating;
    } else {
      instructor.ratings.push({ userId: studentId, rating });
    }

    await instructor.save();

    const totalRatings = instructor.ratings.length;
    const avgRating = totalRatings > 0 ? (instructor.ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1) : 0;

    return res.status(200).json({ success: true, message: "Rating submitted successfully!", averageRating: avgRating });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to rate instructor." });
  }
};

export const toggleCart = async (req, res) => {
  try {
    const userId = req.id;
    const { resourceId, resourceType } = req.body;

    if (!resourceId || !resourceType) {
      return res.status(400).json({ success: false, message: "Missing resource details" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    let resource;
    let isFreeResource = false;

    if (resourceType === 'course') {
      resource = await Course.findById(resourceId).select("coursePrice enrolledStudents");
      if (!resource) {
        return res.status(404).json({ success: false, message: "Course not found" });
      }
      isFreeResource = Number(resource.coursePrice || 0) === 0;
    } else if (resourceType === 'ebook') {
      resource = await Ebook.findById(resourceId).select("price");
      if (!resource) {
        return res.status(404).json({ success: false, message: "E-book not found" });
      }
      isFreeResource = Number(resource.price || 0) === 0;
    } else {
      return res.status(400).json({ success: false, message: "Invalid resource type" });
    }

    const itemIndex = user.cart.findIndex(item => item.resourceId.toString() === resourceId);
    const isEnrolled = resourceType === 'course'
      ? user.enrolledCourses.some(id => id.toString() === resourceId)
      : user.enrolledEbooks.some(id => id.toString() === resourceId);

    if (itemIndex > -1) {
      user.cart.splice(itemIndex, 1);

      if (isFreeResource && isEnrolled) {
        if (resourceType === 'course') {
          user.enrolledCourses.pull(resourceId);
          resource.enrolledStudents?.pull(userId);
          await resource.save();
        } else {
          user.enrolledEbooks.pull(resourceId);
        }

        user.accessExpirations = (user.accessExpirations || []).filter(
          (item) => item.resourceId?.toString() !== resourceId
        );
      }

      await user.save();
      return res.status(200).json({
        success: true,
        message: isFreeResource && isEnrolled ? "Free access removed successfully" : "Removed from cart",
        action: 'removed'
      });
    } else {
      if (isFreeResource && isEnrolled) {
        if (resourceType === 'course') {
          user.enrolledCourses.pull(resourceId);
          resource.enrolledStudents?.pull(userId);
          await resource.save();
        } else {
          user.enrolledEbooks.pull(resourceId);
        }

        user.accessExpirations = (user.accessExpirations || []).filter(
          (item) => item.resourceId?.toString() !== resourceId
        );

        await user.save();
        return res.status(200).json({
          success: true,
          message: "Free access removed successfully",
          action: 'removed'
        });
      }

      if (isEnrolled) {
        return res.status(400).json({
          success: false,
          message: resourceType === 'course' ? "Already enrolled in this course" : "Already purchased this e-book"
        });
      }

      user.cart.push({ resourceId, resourceType });
      await user.save();
      return res.status(200).json({ success: true, message: "Added to cart", action: 'added' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to update cart" });
  }
};
