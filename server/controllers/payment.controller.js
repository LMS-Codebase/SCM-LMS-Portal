import { instance } from "../index.js";
import crypto from "crypto";
import { Course } from "../models/course.model.js";
import { Ebook } from "../models/ebook.model.js";
import { User } from "../models/user.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";

// Helper to calculate expiration date
const addAccessExpiration = (user, resourceId, validityPeriod) => {
  if (!validityPeriod || validityPeriod === 'Lifetime') return;
  const now = new Date();
  let expiresAt = null;
  if (validityPeriod === '3 Months') expiresAt = new Date(now.setMonth(now.getMonth() + 3));
  else if (validityPeriod === '6 Months') expiresAt = new Date(now.setMonth(now.getMonth() + 6));
  else if (validityPeriod === '1 Year') expiresAt = new Date(now.setFullYear(now.getFullYear() + 1));

  if (expiresAt) {
    if (!user.accessExpirations) user.accessExpirations = [];
    const existing = user.accessExpirations.find(exp => exp.resourceId && exp.resourceId.toString() === resourceId.toString());
    if (existing) {
      existing.expiresAt = expiresAt;
    } else {
      user.accessExpirations.push({ resourceId, expiresAt });
    }
  }
};

// 1. Create Order (Razorpay)
export const checkout = async (req, res) => {
  try {
    const { resourceId, resourceType, isCartCheckout } = req.body;
    const userId = req.id;
    const user = await User.findById(userId);

    let amount = 0;
    let currency = "INR";
    let description = "Course Checkout";

    if (isCartCheckout) {
      if (!user.cart || user.cart.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      for (const item of user.cart) {
        if (item.resourceType === 'course') {
          const course = await Course.findById(item.resourceId);
          if (course) amount += course.coursePrice || 0;
        } else if (item.resourceType === 'ebook') {
          const ebook = await Ebook.findById(item.resourceId);
          if (ebook) amount += ebook.price || 0;
        }
      }
      description = "Cart Checkout";
    } else {
      let resource;
      if (resourceType === 'course') {
        resource = await Course.findById(resourceId);
        amount = resource?.coursePrice || 0;
      } else if (resourceType === 'ebook') {
        resource = await Ebook.findById(resourceId);
        amount = resource?.price || 0;
      } else {
        return res.status(400).json({ message: "Invalid resource type" });
      }

      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }
    }

    if (amount <= 0) {
      if (isCartCheckout) {
        for (const item of user.cart) {
          if (item.resourceType === 'course') {
            if (!user.enrolledCourses.includes(item.resourceId)) {
              user.enrolledCourses.push(item.resourceId);
            }
            const course = await Course.findById(item.resourceId);
            if (course) {
              addAccessExpiration(user, item.resourceId, course.validityPeriod);
              if (!course.enrolledStudents.includes(userId)) {
                course.enrolledStudents.push(userId);
                await course.save();
              }
            }
          } else if (item.resourceType === 'ebook') {
            if (!user.enrolledEbooks.includes(item.resourceId)) {
              user.enrolledEbooks.push(item.resourceId);
            }
            const ebook = await Ebook.findById(item.resourceId);
            if (ebook) addAccessExpiration(user, item.resourceId, ebook.validityPeriod);
          }
        }
        await user.save();
      } else {
        if (resourceType === 'course') {
          if (!user.enrolledCourses.includes(resourceId)) {
            user.enrolledCourses.push(resourceId);
          }
          const course = await Course.findById(resourceId);
          if (course) {
            addAccessExpiration(user, resourceId, course.validityPeriod);
            if (!course.enrolledStudents.includes(userId)) {
              course.enrolledStudents.push(userId);
              await course.save();
            }
          }
          if (!user.cart.some(item => item.resourceId.toString() === resourceId && item.resourceType === 'course')) {
            user.cart.push({ resourceId, resourceType: 'course' });
          }
        } else if (resourceType === 'ebook') {
          if (!user.enrolledEbooks.includes(resourceId)) {
            user.enrolledEbooks.push(resourceId);
          }
          const ebook = await Ebook.findById(resourceId);
          if (ebook) addAccessExpiration(user, resourceId, ebook.validityPeriod);

          if (!user.cart.some(item => item.resourceId.toString() === resourceId && item.resourceType === 'ebook')) {
            user.cart.push({ resourceId, resourceType: 'ebook' });
          }
        }
        await user.save();
      }
      return res.status(200).json({ success: true, free: true, message: "Free resource(s) purchased successfully!" });
    }

    const options = {
      amount: Number(amount * 100),
      currency: currency,
      receipt: `rcpt_${Date.now().toString().slice(-10)}`,
      notes: {
        resourceId: isCartCheckout ? 'cart' : resourceId,
        resourceType: isCartCheckout ? 'cart' : resourceType,
        isCartCheckout: String(!!isCartCheckout),
        userId
      }
    };

    const order = await instance.orders.create(options);

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Razorpay Checkout Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 2. Verify Payment (Signature Verification)
export const paymentVerification = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, resourceId, resourceType, isCartCheckout } = req.body;
    const userId = req.id;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (isCartCheckout) {
        for (const item of user.cart) {
          if (item.resourceType === 'course') {
            const course = await Course.findById(item.resourceId);
            if (course) {
              if (!user.enrolledCourses.includes(item.resourceId)) {
                user.enrolledCourses.push(item.resourceId);
              }
              addAccessExpiration(user, item.resourceId, course.validityPeriod);

              if (!course.enrolledStudents.includes(userId)) {
                course.enrolledStudents.push(userId);
                await course.save();
              }
            }
          } else if (item.resourceType === 'ebook') {
            const ebook = await Ebook.findById(item.resourceId);
            if (!user.enrolledEbooks.includes(item.resourceId)) {
              user.enrolledEbooks.push(item.resourceId);
            }
            if (ebook) addAccessExpiration(user, item.resourceId, ebook.validityPeriod);
          }
        }
        user.cart = []; // Empty the cart on successful multi-purchase
      } else {
        if (resourceType === 'course') {
          const course = await Course.findById(resourceId);
          if (!course) return res.status(404).json({ message: "Course not found" });

          if (!user.enrolledCourses.includes(resourceId)) {
            user.enrolledCourses.push(resourceId);
          }
          addAccessExpiration(user, resourceId, course.validityPeriod);

          if (!course.enrolledStudents.includes(userId)) {
            course.enrolledStudents.push(userId);
            await course.save();
          }
        } else if (resourceType === 'ebook') {
          const ebook = await Ebook.findById(resourceId);
          if (!ebook) return res.status(404).json({ message: "E-book not found" });

          if (!user.enrolledEbooks.includes(resourceId)) {
            user.enrolledEbooks.push(resourceId);
          }
          addAccessExpiration(user, resourceId, ebook.validityPeriod);
        }
      }

      await user.save();

      // Create a purchase record
      await CoursePurchase.create({
        courseId: resourceType === 'course' ? resourceId : null,
        userId,
        amount: 0, // Should get from order ideally
        status: "completed",
        paymentId: razorpay_payment_id,
        method: "razorpay"
      });

      res.status(200).json({
        success: true,
        message: "Payment verified and enrollment successful"
      });

    } else {
      res.status(400).json({
        success: false,
        message: "Payment verification failed"
      });
    }
  } catch (error) {
    console.error("Razorpay Verification Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Fallback / legacy purchase (not usually for razorpay, but keeping for direct access if needed)
export const purchaseResource = async (req, res) => {
  try {
    const { resourceId, resourceType } = req.body;
    const userId = req.id;

    const user = await User.findById(userId);
    if (resourceType === 'course') {
      if (!user.enrolledCourses.includes(resourceId)) user.enrolledCourses.push(resourceId);
    } else if (resourceType === 'ebook') {
      if (!user.enrolledEbooks.includes(resourceId)) user.enrolledEbooks.push(resourceId);
    }

    await user.save();

    return res.status(200).json({ success: true, message: "Purchase successful" });
  } catch (error) {
    res.status(500).json({ message: "Failed" });
  }
};
