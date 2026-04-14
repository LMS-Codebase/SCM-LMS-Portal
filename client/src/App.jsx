import "./App.css";
import { Routes, Route, createBrowserRouter, RouterProvider } from "react-router-dom";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import ResourcesPage from "./pages/student/ResourcesPage";
import MainLayout from "./layout/MainLayout";
import HeroSection from "./pages/student/HeroSection";
import MyLearning from "./pages/student/MyLearning";
import Profile from "./pages/student/Profile";
import Course from "./pages/student/Course";
import Sidebar from "./pages/instructor/Sidebar";
import Dashboard from "./pages/instructor/Dashboard";
import AddCourse from "./pages/instructor/course/AddCourse";
import CourseTable from "./pages/instructor/course/CourseTable";
import EditCourse from "./pages/instructor/course/EditCourse";
import CreateLecture from "./pages/instructor/lecture/CreateLecture";
import EditLecture from "./pages/instructor/lecture/EditLecture";
import ExplorePage from "./pages/ExplorePage"
import EbookTable from "./pages/instructor/ebook/EbookTable";
import AddEbook from "./pages/instructor/ebook/AddEbook";
import EditEbook from "./pages/instructor/ebook/EditEbook";
import CourseDetail from "./pages/student/CourseDetail";
import AddResource from "./pages/instructor/AddResource";
import AddDomain from "./pages/instructor/AddDomain";
import CaseStudy from "./pages/student/Resources/CaseStudy";
import EbookDetail from "./pages/student/EbookDetail";
import ConnectUs from "./pages/student/ConnectUs";
import { ProtectedRoute, InstructorRoute, AuthenticatedAdminRoute, StudentRoute } from "./components/ProtectedRoute";


const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: (
          <AuthenticatedAdminRoute>
            <LandingPage />
          </AuthenticatedAdminRoute>
        ),
      },
      {
        path: "resources",
        element: (
          <StudentRoute>
            <HeroSection />
            <ResourcesPage />
          </StudentRoute>
        ),
      },
      {
        path: "explore",
        element: <StudentRoute><ExplorePage /></StudentRoute>
      },
      {
        path: "resources/case-studies",
        element: <StudentRoute><CaseStudy /></StudentRoute>
      },
      {
        path: "resources/:type",
        element: <StudentRoute><Course /></StudentRoute>
      },
      {
        path: "my-learning",
        element: <StudentRoute><MyLearning /></StudentRoute>
      },
      {
        path: "profile",
        element: <ProtectedRoute><Profile /></ProtectedRoute>
      },
      {
        path: "explore/course-detail/:courseId",
        element: <StudentRoute><CourseDetail /></StudentRoute>
      },
      {
        path: "explore/ebook-detail/:ebookId",
        element: <StudentRoute><EbookDetail /></StudentRoute>
      },
      {
        path: "connect-us",
        element: <ConnectUs />
      },
      // { 
      //   path: "resources/ebooks",
      //   element: <EBooks/>
      // },
      // {
      //   path: "resources/blogs",
      //   element: <Blogs/>
      // },
      // {
      //   path: "resource",
      //   element: <ResourceList />
      // },


      // Instructor routes start from here
      {
        path: "instructor",
        element: <InstructorRoute><Sidebar /></InstructorRoute>,
        children: [
          // {
          //   path: "dashboard",
          //   element: <Dashboard />
          // },
          {
            path: "course",
            element: <CourseTable />
          },
          {
            path: "course/create",
            element: <AddCourse />
          },
          {
            path: "course/:courseId",
            element: <EditCourse />
          },
          {
            path: "course/:courseId/lecture",
            element: <CreateLecture />
          },
          {
            path: "course/:courseId/lecture/:lectureId",
            element: <EditLecture />
          },
          {
            path: "ebook",
            element: <EbookTable />
          },
          {
            path: "ebook/create",
            element: <AddEbook />
          },
          {
            path: "ebook/:ebookId",
            element: <EditEbook />
          },
          {
            path: "resource/create",
            element: <AddResource />
          },
          {
            path: "domain/create",
            element: <AddDomain />
          },
        ]
      }
    ],
  },
]);



function App() {
  return (
    <main>
      <RouterProvider router={appRouter} />

    </main>
  );
}

export default App;





{/* <Navbar /> */ }
{/* <LandingPage /> */ }

{/* <Routes> */ }
{/* <Route path="/" element={<LandingPage />} /> */ }
{/* <Route path="/about" element={<About />} /> */ }
{/* <Route path="/login" element={<Login />} /> */ }
{/* <Route path="/resources" element={<ResourcesPage />} /> */ }
{/* </Routes> */ }






//  <BrowserRouter>
//       <Routes>
//         {/* Resource Pages */}
//         <Route path="/resources/courses" element={<Courses />} />
//         <Route path="/resources/e-books" element={<EBooks />} />
//         <Route path="/resources/blogs" element={<Blogs />} />

//         {/* Single Resource Detail */}
//         <Route
//           path="/resources/:type/:id"
//           element={<CourseDetails />}
//         />
//       </Routes>
//     </BrowserRouter>