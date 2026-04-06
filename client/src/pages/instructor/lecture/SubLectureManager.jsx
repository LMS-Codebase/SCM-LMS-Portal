import React from "react";
import { useState } from "react";
import { useCreateSubLectureMutation, useGetCourseLectureQuery, useGetSubLecturesQuery } from "@/features/api/courseApi";
import SubLectureItem from "./SubLectureItem";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useParams } from "react-router-dom";

const SubLectureManager = ({ lectureId }) => {
  const [title, setTitle] = useState("");
  const { data } = useGetSubLecturesQuery(lectureId);
  const [createSubLecture] = useCreateSubLectureMutation();


 const params = useParams();
  const courseId = params.courseId;
  const { refetch } = useGetCourseLectureQuery(courseId);


  const addHandler = async () => {
    await createSubLecture({ lectureId, title });
    setTitle("");
    refetch();
  };

  return (
    <div className="mt-8">
      <h3 className="font-semibold text-lg">Sub Lectures</h3>

      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Sub lecture title"
      />
      <Button onClick={addHandler}>Add Sub Lecture</Button>

      <div className="mt-4 space-y-4">
        {data?.subLectures.map((sl) => (
          <SubLectureItem key={sl._id} subLecture={sl} />
        ))}
      </div>
    </div>
  );
};

export default SubLectureManager;