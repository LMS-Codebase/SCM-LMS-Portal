// import React from "react";

// import HeroSection from "./HeroSection";
// import { Skeleton } from "@/components/ui/skeleton";
// import Course from "./Course";

//                                                Courses Structure

// const courses = [1,2,3,4,5,6,7];

// const ResourcesPage = () => {
//   const isLoading = false;

//   return (
//     <>
//       {/* Resources Container  */}
//       <div className="bg-gray-50">
//         <div className="max-w-7xl mx-auto p-6">
//           <h2 className="font-bold text-3xl text-center mb-10">Resources</h2>

//           {/* For Mobile device , we 'll have only one column  */}
//           <div className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-4 gap-6">
//             {isLoading ? (
//               Array.from({ length: 8 }).map((_, index) => (
//                 <CourseSkeleton key={index} />
//               ))
//             ) : (
//               courses.map((course, index) => <Course key={index}/>)

//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default ResourcesPage;

// // Loading Skeleton (until whole page don't get loaded)
// const CourseSkeleton = () => {
//   return (
//     <div className="bg-white shadow-md hover:shadow-lg transition-shadow rounded-lg overflow-hidden">
//       <Skeleton className="w-full h-36" />
//       <div className="px-5 py-4 space-y-3">
//         <Skeleton className="h-6 w-3/4" />
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <Skeleton className="h-6 w-6 rounded-full" />
//             <Skeleton className="h-4 w-20" />
//           </div>
//           <Skeleton className="h-4 w-16" />
//         </div>
//         <Skeleton className="h-4 w-1/4" />
//       </div>
//     </div>
//   );
// };

import { motion } from "framer-motion";
import {
  useNavigate,
} from "react-router-dom";
import CourseLogo1 from "../../../src/assets/images/CourseLogo1.png";
import caseStudyThumbnail from "../../assets/images/caseStudyThumbnail.jpeg"
import SCM_Logo2 from "../../assets/images/SCM_Logo2.webp"
import eBookThumbnail1 from "../../assets/images/eBookThumbnail1.png"
import { useGetPublishedResourcesQuery } from "@/features/api/resourceApi";
import { useGetDomainsQuery } from "@/features/api/domainApi";
import { useGetPublishedCourseQuery } from "@/features/api/courseApi";
import { useGetPublishedEbooksQuery } from "@/features/api/ebookApi";
import TrendingCarousel from "@/components/TrendingCarousel";
import Course from "./Course";
/* -------------------- DATA -------------------- */
// const resourceTypes = [
//   { id: "courses", title: "Courses" },
//   { id: "ebooks", title: "E-books" },
//   { id: "case-studies", title: "Case Studies" },
//   { id: "blogs", title: "Blogs" },
//   // { id: "presentations", title: "Presentations" },
// ];
// const resourceTypes = [
//   {
//     id: "courses",
//     title: "Courses",
//     image: SCM_Logo2,
//   },
//   {
//     id: "ebooks",
//     title: "E-Books",
//     image: eBookThumbnail1,
//   },
//   {
//     id: "case-studies",
//     title: "Case Studies",
//     image: caseStudyThumbnail,
//   },
//   {
//     id: "blogs",
//     title: "Blogs",
//     image: "https://media.istockphoto.com/id/2079473218/vector/key-components-of-supply-chain-and-business-workflow-system-outline-diagram.jpg?s=612x612&w=0&k=20&c=TtTRhlVabtlwACgRIV9M8_DR5Pl1bDS9lhGRS5nllx8=",
//   },
// ];


// const domains = [
//   "Supply Chain Planning",
//   "Logistics",
//   "Inventory",
//   "Supply Chain Analytics",
//   // "Supply Chain Optimization",
// ];


// const domains = [
//   {
//     title: "Supply Chain Planning",
//     image: CourseLogo1,
//   },
//   {
//     title: "Logistics",
//     image: CourseLogo1,
//   },
//   {
//     title: "Inventory",
//     image: CourseLogo1,
//   },
//   {
//     title: "Supply Chain Analytics",
//     image: CourseLogo1,
//   },
// ];



/* -------------------- REUSABLE CARD -------------------- */
const Card = ({ title, image, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className="
      cursor-pointer
      bg-white
      rounded-md
      border border-gray-200
      shadow-md hover:shadow-xl
      transition-all duration-300
      overflow-hidden
      h-[290px]
    "
  >
    {/* Heading */}
    <div className="h-[64px] flex items-center justify-center border-b border-gray-300 bg-teal-800">
      <h3 className="text-2xl font-bold tracking-wide text-white">
        {title}
      </h3>
    </div>

    {/* Image – FULL FILL */}
    <div className="flex-1">
      <div className="relative w-full h-56 bg-[#e2f0f2] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-fill"
        />
      </div>
    </div>
  </motion.div>
);


/* -------------------- RESOURCES PAGE -------------------- */
const ResourcesPage = () => {
  console.log("RESOURCES PAGE");

  const navigate = useNavigate();

  const { data: resourceData, isLoading: resourceIsLoading } = useGetPublishedResourcesQuery();
  const { data: domainData, isLoading: domainIsLoading } = useGetDomainsQuery();
  const { data: courseData, isLoading: courseIsLoading, isError: courseIsError } = useGetPublishedCourseQuery();
  const { data: ebookData, isLoading: ebookIsLoading } = useGetPublishedEbooksQuery();

  const trendingCourses = courseData?.courses?.map(course => {
    const ratings = course.ratings || [];
    const avgRating = ratings.length > 0 ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length) : 0;
    return {
      courseId: course._id,
      type: course.resource?.type || "course",
      image: course.courseThumbnail?.url || course.courseThumbnail,
      title: course.courseTitle,
      price: course.coursePrice,
      duration: course.courseDuration,
      instructorName: course.creator?.name || "Unknown",
      instructorAvatar: course.creator?.photoUrl || "",
      level: course.courseLevel,
      isEbook: false,
      avgRating
    };
  }) || [];

  const trendingEbooks = ebookData?.ebooks?.map(ebook => {
    const ratings = ebook.ratings || [];
    const avgRating = ratings.length > 0 ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length) : 0;
    return {
      courseId: ebook._id,
      type: "E-Book",
      image: ebook.thumbnail,
      title: ebook.title,
      price: ebook.price,
      duration: ebook.noOfPages,
      instructorName: ebook.authorName || ebook.creator?.name || "Unknown",
      instructorAvatar: ebook.authorImage || ebook.creator?.photoUrl || "",
      level: "E-Book",
      isEbook: true,
      avgRating
    };
  }) || [];

  const trendingItems = [...trendingCourses, ...trendingEbooks].sort((a, b) => b.avgRating - a.avgRating);

  if (resourceIsLoading || domainIsLoading || courseIsLoading || ebookIsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">

      {/* Trending Carousel */}
      {trendingItems.length > 0 && (
        <TrendingCarousel courses={trendingItems} />
      )}

      {courseIsError && (
        <div className="text-red-500 text-center my-4 font-semibold italic">
          Failed to load courses. Please try again.
        </div>
      )}


      {/* Resource Type */}
      <section className="mb-14 mt-20">
        <h2 className="text-3xl font-bold mb-6">Resource</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {resourceData?.resources?.map((item) => (
            <Card
              key={item._id}
              title={item.name}
              image={item.logo?.url}
              // onClick={() => {
              //   // Dynamic navigation based on resource type
              //   if (item.type === "case-study") {
              //     navigate("/resources/case-studies");
              //   } else if (item.type === "ebook") {
              //     navigate("/resources/ebooks");
              //   } else if (item.type === "blog") {
              //     navigate("/resources/blogs");
              //   } else if (item.type === "course") {
              //     navigate(`/resources/${item._id}`);
              //   } else {
              //     // fallback
              //     navigate(`/resources/${item._id}`);
              //   }
              // }}
              onClick={() => {
                navigate(`/explore?resource=${item.name}`);
              }}
            />
          ))}
        </div>
      </section>


      {/* Domain */}
      <section className="mb-14">
        <h2 className="text-3xl font-bold mb-6 mt-20">Domain</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {domainData?.domains?.map((domain) => (
            <Card
              key={domain._id}
              title={domain.name}
              image={domain.image?.url}
              onClick={() => navigate(`/explore?domain=${domain.name}`)}
            />
          ))}
        </div>
      </section>

      {/* Published E-books */}
      {/* {ebookData?.ebooks?.length > 0 && (
        <section className="mb-14">
          <h2 className="text-3xl font-bold mb-6 mt-20">Recently Published E-Books</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ebookData.ebooks.map((ebook) => (
              <Course
                key={ebook._id}
                courseId={ebook._id}
                className="w-full"
                image={ebook.thumbnail}
                title={ebook.title}
                price={ebook.price}
                duration={ebook.noOfPages}
                instructorName={ebook.authorName}
                instructorAvatar={ebook.creator?.photoUrl}
                level="E-Book"
                isEbook={true}
                isbn={ebook.isbn}
                language={ebook.language}
              />
            ))}
          </div>
        </section>
      )} */}
    </div>
  );
};

export default ResourcesPage;


/* -------------------- APP ROUTES -------------------- */
// export default function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/resources" element={<ResourcesPage />} />
//         <Route path="/resources/:type" element={<CoursesPage />} />
//       </Routes>
//     </Router>
//   );
// }
