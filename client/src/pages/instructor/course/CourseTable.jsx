import { Button } from "@/components/ui/button";
import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useNavigate } from "react-router-dom";
import { useGetCreatorCourseQuery } from "@/features/api/courseApi";
import { Edit, BookOpen, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const CourseTable = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useGetCreatorCourseQuery(undefined, { refetchOnMountOrArgChange: true });

  if (isLoading) return <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-teal-500"></div>
  </div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <BookOpen className="text-teal-600" />
          Manage Your Case-Studies
        </h1>
        <Button
          onClick={() => navigate(`create`)}
          className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2 shadow-lg shadow-teal-100"
        >
          <Plus size={18} />
          Create New Case-Study
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
        <Table className="min-w-max">
          <TableCaption>A list of your created case studies.</TableCaption>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-[120px] font-bold">Price (INR)</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="font-bold">Course Title</TableHead>
              <TableHead className="text-right font-bold pr-6">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.courses?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-gray-500 italic">
                  No courses found. Click "Create New Course" to get started.
                </TableCell>
              </TableRow>
            ) : (
              data.courses.map((course) => (
                <TableRow key={course._id} className="hover:bg-gray-50/50 transition-colors">
                  <TableCell className="font-bold text-teal-700">
                    {course?.coursePrice ? `INR ${course.coursePrice}` : "Free"}
                  </TableCell>
                  <TableCell>
                    <Badge className={course.isPublished ? "bg-teal-100 text-teal-700 hover:bg-teal-200 border-none shadow-none" : "bg-gray-100 text-gray-600 hover:bg-gray-200 border-none shadow-none"}>
                      {course.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-gray-800">{course.courseTitle}</TableCell>
                  <TableCell className="text-right pr-6">
                    <Button
                      size='sm'
                      variant='ghost'
                      className="text-teal-600 hover:bg-teal-50 hover:text-teal-700"
                      onClick={() => navigate(`${course._id}`)}
                    >
                      <Edit size={18} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CourseTable;
