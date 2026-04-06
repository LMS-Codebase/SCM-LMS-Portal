import { ChartNoAxesColumn, SquareLibrary } from 'lucide-react'
import React from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useGetPublishedResourcesQuery } from "@/features/api/resourceApi";
import { useGetDomainsQuery } from "@/features/api/domainApi";
import { Library, Globe, Dot } from 'lucide-react';
const Sidebar = () => {


  const { data: resourceData } = useGetPublishedResourcesQuery();
  const { data: domainData } = useGetDomainsQuery();
  const navigate = useNavigate();

  return (
    <div className='flex flex-col lg:flex-row w-full mt-16'>
      <div className='lg:block w-full lg:w-[250px] sm:w-[300px] space-y-8 border-r border-gray-300 bg-[#f0f0f0] p-5 lg:sticky top-16 lg:h-[calc(100vh-4rem)] max-h-64 lg:max-h-none overflow-y-auto'>
        <div className='space-y-4 lg:mt-8'>
          {/* <Link to="dashboard" className='flex items-center gap-2'>
        <ChartNoAxesColumn size={22}/>
        <h1>Dashboard</h1>
        </Link> */}


          {/* Resource Section */}
          <Link to="resource/create" className='flex items-center gap-2'>
            {/* <SquareLibrary size={22}/> */}
            <div className="font-bold text-xl mb-2 mt-8 flex items-center gap-2">
              <Library size={28} className="text-blue-600" />
              {/* <h1>Add Resource</h1> */}
              Add Resource
            </div>
          </Link>
          {/* Resources Heading */}
          {/* <Library size={28} className="text-blue-600" /> */}

          {/* <ul className="ml-6 mb-4">
  {resourceData?.resources?.map((item) => (
    <li key={item._id} className="text-base font-medium py-1 flex items-center gap-2">
      <Dot size={18} className="text-blue-400" />
      {item.name}
    </li>
  ))}
</ul> */}
          <ul className="ml-6 mb-4">
            {resourceData?.resources?.map((item) => (
              <li
                key={item._id}
                className="text-base font-medium py-1 flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => {
                  const type = item.type?.toLowerCase();
                  if (type === "ebook") {
                    navigate("/instructor/ebook");
                  } else {
                    navigate("/instructor/course");
                  }
                }}
              >
                <Dot size={18} className="text-blue-400" />
                {item.name}
              </li>
            ))}
          </ul>


          {/* Domain Section  */}
          <Link to="domain/create" className='flex items-center gap-2'>
            {/* <SquareLibrary size={22}/> */}
            <div className="font-bold text-xl mb-2 mt-8 flex items-center gap-2">
              <Globe size={28} className="text-green-600" />
              {/* <h1>Add Domain</h1> */}
              Add Domain
            </div>
          </Link>
          {/* Domains Heading */}
          {/* <Globe size={28} className="text-green-600" /> */}

          <ul className="ml-6 mb-4">
            {domainData?.domains?.map((item) => (
              <li key={item._id} className="text-base font-medium py-1 flex items-center gap-2">
                <Dot size={18} className="text-green-400" />
                {item.name}
              </li>
            ))}
          </ul>

          {/* <Link to="course" className='flex items-center gap-2'>
        <SquareLibrary size={22}/>
        <h1>Case Study</h1>
      </Link> */}
        </div>
      </div>

      {/* Rendering Child's  */}
      <div className='flex-1 md:p-8 p-4 lg:p-12 xl:p-24 bg-white'>
        <Outlet />
      </div>
    </div>
  )
}

export default Sidebar;
