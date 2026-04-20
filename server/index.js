// MseiiqelW02axCW3  --> MongoDB Password
// Restarting server to load new ENV keys
// const express = require...  -->  OLD WAY


// Creating server using express
// Type = module in 'package.json'
import express from "express";
import dotenv from "dotenv";
dotenv.config();

import connectDB from "./database/db.js";
import userRoute from "./routes/user.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import courseRoute from "./routes/course.route.js";
import mediaRoute from "./routes/media.route.js";
import resourceRoutes from "./routes/resource.routes.js";
import domainRoutes from "./routes/domain.routes.js";
import ebookRoute from "./routes/ebook.route.js";
import progressRoute from "./routes/courseProgress.route.js";
import contactRoute from "./routes/contact.route.js";


import Razorpay from "razorpay"
import paymentRoute from "./routes/payment.route.js";


// will integrate sooonnn
export const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});



//  call database connection here
connectDB();
const app = express();


const allowedOrigins = [
  "https://learn.scmconnect.in",
  "https://scmconnect.in",
  "http://localhost:5173"
];

// default middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);



// const PORT = process.env.PORT || 3000 ;   // 'll see that y it's not working properly 
const PORT = 5000;


// test route to see ..server is running .
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});


// APIs 
// setting end point
app.use("/api/v1/media", mediaRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/payment", paymentRoute);
app.use("/api/v1/resource", resourceRoutes);
app.use("/api/v1/domain", domainRoutes);
app.use("/api/v1/ebook", ebookRoute);
app.use("/api/v1/progress", progressRoute);
app.use("/api/v1/contact", contactRoute);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server Listening at port ${PORT}`);
});
