

//                                                      Infinte Carousel
// import { motion } from "framer-motion";
// import Course from "../pages/student/Course";
// import {TrendingUp} from  "lucide-react"


// const TrendingCarousel = ({ courses }) => {
//   const items = [...courses, ...courses, ...courses]; // duplicate THRICE
//  //  const items = [...courses];

//   return (
//     <section className="w-full mt-8">

//         <div className="flex">
//       <h2 className="text-3xl font-bold px-2 mb-6">
//         Trending
//       </h2>
//         <TrendingUp className="flex items-center" size={22}/>
//         </div>

//       {/* NO SCROLL DIV, NO FIXED HEIGHT */}
//       <div className="relative w-full overflow-hidden">
//         <motion.div
//           className="flex gap-6"
//           animate={{ x: ["0%", "-50%"] }}
//           transition={{
//             duration: 30,
//             ease: "linear",
//             repeat: Infinity,
//           }}
//         >
//           {items.map((course, index) => (
//             <Course
//               key={index}
//               {...course}
//               disableHover
//             />
//           ))}
//         </motion.div>
//       </div>
//     </section>
//   );
// };

// export default TrendingCarousel;







//                                                Static Carousel
import { useRef } from "react";
import Course from "../pages/student/Course";
import { TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";

const TrendingCarousel = ({ courses }) => {
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    scrollRef.current.scrollBy({
      left: -900,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({
      left: 900,
      behavior: "smooth",
    });
  };

  return (
    <section className="w-full mt-8 relative">

      {/* HEADER */}
      <div className="flex items-center gap-2 px-2 mb-6">
        <h2 className="text-3xl font-bold text-[#005599]">Trending</h2>
        <TrendingUp size={22} className="text-[#005599]" />
      </div>

      {/* LEFT ARROW */}
      <button
        onClick={scrollLeft}
        className="absolute left-0 top-[55%] -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2 hover:scale-110 transition"
      >
        <ChevronLeft size={26} />
      </button>

      {/* RIGHT ARROW */}
      <button
        onClick={scrollRight}
        className="absolute right-0 top-[55%] -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2 hover:scale-110 transition"
      >
        <ChevronRight size={26} />
      </button>

      {/* SCROLL AREA */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-hidden overflow-y-visible scroll-smooth px-10 py-10"
      >
        {courses.map((course, index) => (
          <Course
            key={index}
            {...course}
            disableHover
          />
        ))}
      </div>
    </section>
  );
};

export default TrendingCarousel;


