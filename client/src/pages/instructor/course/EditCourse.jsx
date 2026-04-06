import { Button } from '@/components/ui/button'
import React from 'react'
import { Link } from 'react-router-dom'
import CourseTab from './CourseTab';
import { ArrowLeft, Video } from "lucide-react";

const EditCourse = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link to="/instructor/course">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-10 w-10 hover:bg-teal-50 hover:text-teal-600 transition-all border-teal-100"
            >
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <h1 className="font-bold text-3xl text-gray-900 tracking-tight">Edit your Case-Study</h1>
            {/* <p className="text-gray-500 mt-1 italic">Fine-tune your content and associated case-study materials.</p> */}
          </div>
        </div>

        <Link to="lecture">
          <Button className="bg-gray-900 hover:bg-black text-white font-bold px-6 shadow-xl flex items-center gap-2">
            <Video size={18} />
            Manage Lectures Syllabus
          </Button>
        </Link>
      </div>

      <CourseTab />
    </div>
  )
}

export default EditCourse;
