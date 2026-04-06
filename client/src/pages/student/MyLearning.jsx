import React, { useEffect } from "react";
import Course from "./Course";
import { useLoadUserQuery, useToggleCartMutation } from "@/features/api/authApi";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

//  storing ..whatever courses he/she has purchased
const MyLearning = () => {
  const { data, isLoading, refetch } = useLoadUserQuery(undefined, { refetchOnMountOrArgChange: true });
  const [toggleCart, { isLoading: isRemoving }] = useToggleCartMutation();
  const user = data?.user;

  useEffect(() => {
    refetch();
  }, [refetch]);

  const myLearningCourses = user?.enrolledCourses || [];
  const myLearningEbooks = user?.enrolledEbooks || [];
  const totalItems = myLearningCourses.length + myLearningEbooks.length;

  const handleRemoveFreeItem = async (resourceId, resourceType) => {
    try {
      const res = await toggleCart({ resourceId, resourceType }).unwrap();
      toast.success(res.message || "Free access removed successfully");
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to remove free access");
    }
  };

  return (
    <div className="max-w-7xl mx-auto my-24 px-4 md:px-8">
      <h1 className="font-bold text-3xl md:text-4xl text-gray-900 border-b pb-4">🎓 MY LEARNINGS</h1>
      <div className="my-8">
        {isLoading ? (
          <div className="flex justify-center mt-20">
            <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
          </div>
        ) : totalItems === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <h2 className="text-xl font-bold text-gray-700">Your library is empty.</h2>
            <p className="text-gray-500 mt-2 mb-6">You are not enrolled in any courses or e-books yet.</p>
            <a href="/explore" className="bg-teal-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-teal-700 transition">
              Explore Courses
            </a>
          </div>
        ) : (
          <div className="space-y-12">
            {myLearningCourses.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-800">Video Courses</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {myLearningCourses.map((item) => (
                    <div key={item._id} className="space-y-3">
                      <Course
                        courseId={item._id}
                        image={item.courseThumbnail?.url || item.courseThumbnail}
                        title={item.courseTitle}
                        price={item.coursePrice}
                        duration={item.courseDuration}
                        instructorName={item.creator?.name}
                        instructorAvatar={item.creator?.photoUrl}
                        level={item.courseLevel}
                        isEbook={false}
                      />
                      {Number(item.coursePrice || 0) === 0 && (
                        <Button
                          variant="outline"
                          disabled={isRemoving}
                          onClick={() => handleRemoveFreeItem(item._id, "course")}
                          className="w-full border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove Free Access
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {myLearningEbooks.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800">Purchased E-Books</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {myLearningEbooks.map((item) => (
                    <div key={item._id} className="space-y-3">
                      <Course
                        courseId={item._id}
                        image={item.thumbnail}
                        title={item.title}
                        price={item.price}
                        duration={item.noOfPages}
                        instructorName={item.authorName}
                        instructorAvatar={null}
                        level="E-Book"
                        isEbook={true}
                      />
                      {Number(item.price || 0) === 0 && (
                        <Button
                          variant="outline"
                          disabled={isRemoving}
                          onClick={() => handleRemoveFreeItem(item._id, "ebook")}
                          className="w-full border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove Free Access
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLearning;

// Skeleton component for loading state
const MyLearningSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className="bg-gray-300 rounded-lg h-40 animate-pulse"
        ></div>
      ))}
    </div>
  );
};
