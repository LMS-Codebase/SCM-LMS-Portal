import { Edit } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom'

const Lecture = ({lecture, courseId ,index}) => {

    const navigate = useNavigate();
    const goToUpdateLecture = () => {

        // Both these navigation routes have same meaning . 
        // navigate(`/instructor/course/${courseId}/lecture/${lecture._id}`)
        navigate(`${lecture._id}`);
    }

  return (
    <>
    <div className='flex items-center justify-between bg-[#F7F9FA] px-4 py-2 rounded-md my-2'>
        <h1 className='font-bold text-gray-800'>Lecture - {index+1} : {lecture.lectureTitle}</h1>
        <Edit 
        onClick={goToUpdateLecture}
        size={20}
        className='cursor-pointer text-gray-600 hover:text-blue-600'
        />
    </div>
    {/* <div className="border rounded-lg p-4 mb-4"> */}
      {/* <h3 className="font-semibold text-lg">
        {index + 1}. {lecture.lectureTitle}
      </h3> */}

      {/* SUB LECTURES */}
      {lecture.subLectures?.length > 0 && (
        <ul className="ml-6 mt-2 space-y-2">
          {lecture.subLectures.map((sub, i) => (
            <li key={sub._id}>
              <p className="font-medium">
                {index + 1}.{i + 1} {sub.title}
              </p>

              {/* VIDEOS */}
              {sub.videos?.length > 0 && (
                <ul className="ml-4 text-sm list-disc">
                  {sub.videos.map(v => (
                    <li key={v.publicId} className="text-green-600">
                      {v.name}
                    </li>
                  ))}
                </ul>
              )}

              {/* PDFs */}
              {sub.pdfs?.length > 0 && (
                <ul className="ml-4 text-sm list-disc">
                  {sub.pdfs.map(p => (
                    <li key={p.publicId} className="text-blue-600">
                      {p.name}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    {/* </div> */}
    </>
  )
}

export default Lecture
