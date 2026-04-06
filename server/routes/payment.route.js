import express from "express";
import { checkout, paymentVerification, purchaseResource } from "../controllers/payment.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.route("/checkout").post(isAuthenticated, checkout);
router.route("/verify").post(isAuthenticated, paymentVerification);
router.route("/purchase").post(isAuthenticated, purchaseResource);

export default router;