import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGetPublishedCourseQuery } from "@/features/api/courseApi";
import Course from "../Course"

const CaseStudy = () => {
  const { data, isLoading, isError } = useGetPublishedCourseQuery();
  const navigate = useNavigate();

  // Filter only case-study courses
  const caseStudies = useMemo(() => {
    if (!data?.courses) return [];
    return data.courses.filter(course => course.resource?.type === "case-study");
  }, [data]);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading case studies.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold mb-8 mt-8">Case Studies</h2>
      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {caseStudies.map((course) => (
          <Course
            key={course._id}
            courseId={course._id}
            type={course.resource?.type}
            image={course.courseThumbnail}
            title={course.courseTitle}
            price={course.coursePrice}
            duration={course.courseDuration}
            instructorName={course.creator?.name || "Unknown"}
            instructorAvatar={course.creator?.photoUrl || ""}
            level={course.courseLevel}
          />
        ))}
      </div>
    </div>
  );
};

export default CaseStudy;