// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent } from "@/components/ui/card";
// import React from "react";
// import { motion } from "framer-motion";
// import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from "react-router-dom";

// // https://solutionsreview.com/enterprise-resource-planning/files/2021/07/MicrosoftTeams-image-12.jpg

// // const courses = [1,2,3,4,5,6,7];

// const Course = () => {
//   const { type } = useParams();
//   // const isLoading = false;
//   return (

//     //                                               Single Card
//     // <Card className="overflow-hidden rounded-lg bg-white shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
//     //   <div className="relative">
//     //     <img
//     //       src="https://d13loartjoc1yn.cloudfront.net/upload/article/large/1739965601SCMF.webp"
//     //       alt="thumbnail"
//     //       className="w-full h-36 object-cover rounded-t-lg"
//     //     />
//     //   </div>
//     //   <CardContent className="px-5 py-4 space-y-3">
//     //     <h1 className="hover:underline font-bold text-lg">
//     //       Supply Chain Management Courses 2026{" "}
//     //     </h1>

//     //     <div className="flex items-center justify-between">
//     //       <div className="flex items-center gap-3">
//     //         <Avatar className="h-8 w-8">
//     //           <AvatarImage
//     //             // src="https://github.com/shadcn.png"
//     //             src="https://static.vecteezy.com/system/resources/thumbnails/037/468/797/small_2x/user-icon-illustration-for-graphic-design-logo-web-site-social-media-mobile-app-ui-png.png"
//     //             alt="Profile Picture"
//     //           />
//     //           <AvatarFallback>PP</AvatarFallback>
//     //         </Avatar>
//     //         <h1 className="font-medium text-sm">Instructor Name</h1>
//     //       </div>
//     //       <Badge className="bg-blue-500 text-white px-2 py-1 text-xs rounded-full">
//     //         Advance
//     //       </Badge>
//     //     </div>

//     //     <div className="text-lg font-bold">
//     //         <span>₹4999</span>
//     //     </div>

//     //   </CardContent>
//     // </Card>

//     //                                                Card by ChatGPT
//     <div className="max-w-7xl mx-auto px-4 py-16">
//       <motion.h1
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="text-3xl font-bold text-center mb-12"
//       >
//         {type?.toUpperCase()} 2026
//       </motion.h1>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
//         {[1, 2, 3, 4].map((i) => (
//           <motion.div
//             key={i}
//             whileHover={{ y: -8 }}
//             className="rounded-2xl bg-white shadow-lg overflow-hidden"
//           >
//             <div className="h-40 bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-bold">
//               SUPPLY CHAIN COURSE
//             </div>
//             <div className="p-4">
//               <h3 className="font-semibold mb-2">Supply Chain Management 2026</h3>
//               <p className="text-sm text-gray-500 mb-3">Instructor Name</p>
//               <div className="flex items-center justify-between">
//                 <span className="font-bold">₹4999</span>
//                 <button className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm">
//                   Advance
//                 </button>
//               </div>
//             </div>
//           </motion.div>
//         ))}
//       </div>
//    </div>

// //                                              Card By Us
// //      <>
// //        {/* Resources Container  */}
// //        <div className="bg-gray-50">
// //          <div className="max-w-7xl mx-auto p-6">
// //            <h2 className="font-bold text-3xl text-center mb-10">Resources</h2>

// //            {/* For Mobile device , we 'll have only one column  */}
// //            <div className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-4 gap-6">
// //              {isLoading ? (
// //               Array.from({ length: 8 }).map((_, index) => (
// //                 <CourseSkeleton key={index} />
// //               ))
// //             ) : (
// //               courses.map((course, index) => <Course key={index}/>)

// //             )}
// //           </div>
// //         </div>
// //       </div>
// //     </>
// //   );
// // };

// // export default Course;

// // // Loading Skeleton (until whole page don't get loaded)
// // const CourseSkeleton = () => {
// //   return (
// //     <div className="bg-white shadow-md hover:shadow-lg transition-shadow rounded-lg overflow-hidden">
// //       <Skeleton className="w-full h-36" />
// //       <div className="px-5 py-4 space-y-3">
// //         <Skeleton className="h-6 w-3/4" />
// //         <div className="flex items-center justify-between">
// //           <div className="flex items-center gap-3">
// //             <Skeleton className="h-6 w-6 rounded-full" />
// //             <Skeleton className="h-4 w-20" />
// //           </div>
// //           <Skeleton className="h-4 w-16" />
// //         </div>
// //         <Skeleton className="h-4 w-1/4" />
// //       </div>
// //     </div>
//   );

// };

// export default Course;

//                                                    Card as per Video
// import { Link } from "react-router-dom";
// import { motion } from "framer-motion";

// import { Card, CardContent } from "@/components/ui/card";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";

// const Course = ({ type, courseId }) => {
//   return (
//     <Link to={`/resources/courses/${type}/${courseId}`}>
//       <motion.div
//         whileHover={{ y: -8 }}
//         transition={{ type: "spring", stiffness: 300 }}
//         className="cursor-pointer"
//       >
//         <Card className="overflow-hidden rounded-lg bg-white shadow-lg hover:shadow-2xl transition-all duration-300">

//           {/* Thumbnail */}
//           <div className="relative">
//             <img
//               src="https://d13loartjoc1yn.cloudfront.net/upload/article/large/1739965601SCMF.webp"
//               alt="thumbnail"
//               className="w-full h-36 object-cover rounded-t-lg"
//             />
//           </div>

//           {/* Card Content */}
//           <CardContent className="px-5 py-4 space-y-3">
//             <h1 className="hover:underline font-bold text-lg">
//               Supply Chain Management Courses 2026
//             </h1>

//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <Avatar className="h-8 w-8">
//                   <AvatarImage
//                     src="https://static.vecteezy.com/system/resources/thumbnails/037/468/797/small_2x/user-icon-illustration-for-graphic-design-logo-web-site-social-media-mobile-app-ui-png.png"
//                     alt="Instructor"
//                   />
//                   <AvatarFallback>IN</AvatarFallback>
//                 </Avatar>

//                 <h1 className="font-medium text-sm">
//                   Instructor Name
//                 </h1>
//               </div>

//               <Badge className="bg-blue-500 text-white px-2 py-1 text-xs rounded-full">
//                 Advance
//               </Badge>
//             </div>

//             <div className="text-lg font-bold">
//               ₹4999
//             </div>
//           </CardContent>
//         </Card>
//       </motion.div>
//     </Link>
//   );
// };

// export default Course;

//                                              Dynamic card by Us
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const Course = ({
  type,
  courseId,
  image,
  title,
  price,
  duration,
  instructorName,
  instructorAvatar,
  level,
  isbn,
  language,
  disableHover = false,
  className = "",
  isEbook = false,
}) => {
  return (
    <Link
      to={isEbook ? `/explore/ebook-detail/${courseId}` : `/explore/course-detail/${courseId}`}
      className={`
        block 
        flex-shrink-0
        w-[80vw] 
        sm:w-[340px] 
        md:w-[300px] 
        lg:w-[260px] 
        xl:w-[280px]
        ${className}
      `}
    >
      <motion.div
        whileHover={disableHover ? {} : { scale: 1.03 }}
        whileTap={disableHover ? {} : { scale: 0.97 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="cursor-pointer h-full"
      >
        <Card
          className={`
            overflow-hidden
            rounded-md
            bg-[#e1fcf9]
            shadow-md
            ${!disableHover ? "hover:shadow-xl" : ""}
            transition-all
            duration-300
            flex flex-col
            h-full
            lg:h-[431px]
            xl:h-[431px]
          `}
        >
          {/* Thumbnail */}
          <div
            className="
      w-full
      overflow-hidden
      rounded-t-lg
      bg-[#a6c7c4]
      flex-shrink-0

      h-40        /* mobile */
      sm:h-48     /* small tablets */
      md:h-52     /* tablets */
      lg:h-56     /* laptops (your perfect height) */
      xl:h-60     /* large screens */
    "
          >
            <img
              src={image}
              alt={title}
              className="
        w-full
        h-full
        object-fill
      "
            />
          </div>

          {/* Card Content */}
          <CardContent className="px-5 py-4 flex flex-col flex-1">
            <div className="flex-1 space-y-2">
              <h1 className="hover:underline font-bold text-lg line-clamp-2 min-h-[56px]">
                {title}
              </h1>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700">
                  <h1 className="font-semibold text-sm">{isEbook ? "Author:" : "Trainer:"}</h1>
                  <Avatar className="h-7 w-7 border border-gray-200">
                    <AvatarImage src={instructorAvatar} alt={instructorName} />
                    <AvatarFallback className="bg-teal-100 text-teal-800 text-xs">
                      {instructorName?.charAt(0) || (isEbook ? "A" : "T")}
                    </AvatarFallback>
                  </Avatar>
                  <h1 className="text-sm font-medium truncate max-w-[120px]">{instructorName}</h1>
                </div>
              </div>

              <div className="text-sm text-gray-600 flex flex-col gap-1.5 mt-1">
                <div className="flex items-center gap-1.5 capitalize">
                  <span className="font-semibold text-gray-800">{isEbook ? "Pages: " : "Duration: "}</span>
                  <span className={isEbook && (duration <= 0 || !duration) ? "text-[10px] text-gray-400 font-bold" : ""}>
                    {isEbook ? (duration > 0 ? duration : "NOT MENTIONED") : (duration + " hr")}
                  </span>
                </div>
                {/* {isEbook && language && language !== "N/A" && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-semibold text-gray-800">Language:</span>
                    <span className="text-[11px] font-bold text-teal-700 uppercase">{language}</span>
                  </div>
                )} */}
              </div>
            </div>

            <div className="pt-4 mt-auto border-t border-gray-100 flex justify-between items-center">
              <div className="text-lg font-bold text-teal-900">
                <span className="text-xs font-normal text-gray-500 mr-1">INR</span>{price}
              </div>
              <Badge className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 text-[10px] uppercase font-bold rounded-full">
                {level}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
};

export default Course;

// Route Setup (must match this)
// <Route
//   path="/resources/courses/:type"
//   element={<CoursesPage />}
// />

// <Route
//   path="/resources/courses/:type/:courseId"
//   element={<CourseDetails />}
// />
