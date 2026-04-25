import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const COURSE_API = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/v1/course/`;

// when a new course is created , have to refetch it to display it instantly on UI
// Steps : Add..  tagTypes:["any var name u want to write"] , invalidateTags and provideTags

export const courseApi = createApi({
    reducerPath: "courseApi",
    tagTypes: ['Refetch_Creator_Course', 'Refetch_Lecture', 'SubLecture', 'Course'],   //have to refetch it whenever i 'll be creating new course
    baseQuery: fetchBaseQuery({
        baseUrl: COURSE_API,
        credentials: "include"
    }),
    endpoints: (builder) => ({
        createCourse: builder.mutation({       //mutation to pass data
            query: ({ courseTitle, resource, domain, whatWillYouLearn, description, subTitle }) => ({   // passing data in request
                url: "",
                method: "POST",
                body: { courseTitle, resource, domain, whatWillYouLearn, description, subTitle },
            }),
            invalidatesTags: ['Refetch_Creator_Course']   // invalidates means --> it refetches the courses.
        }),
        getPublishedCourse: builder.query({
            query: () => ({
                url: "/published-courses",
                method: "GET"
            })
        }),
        getCreatorCourse: builder.query({     //query to fetch data 
            query: () => ({
                url: "/",
                method: "GET",
            }),
            providesTags: ['Refetch_Creator_Course']
        }),
        editCourse: builder.mutation({
            query: ({ formData, courseId }) => ({
                url: `/${courseId}`,
                method: "PUT",
                body: formData
            }),
            invalidatesTags: (result, error, arg) => [
                { type: "Refetch_Creator_Course" },
                { type: "Course", id: arg.courseId },
            ],
        }),
        getCourseById: builder.query({
            query: (courseId) => ({
                url: `/${courseId}`,
                method: "GET"
            }),
            providesTags: (result, error, courseId) => [
                { type: "Course", id: courseId },
            ],

        }),

        deleteCommonMedia: builder.mutation({
            query: ({ courseId, public_id, type }) => ({
                url: `/${courseId}/common-media`,
                method: "DELETE",
                body: { public_id, type }
            }),
            invalidatesTags: ["Refetch_Creator_Course"]
        }),

        createLecture: builder.mutation({
            query: ({ lectureTitle, courseId }) => ({
                url: `/${courseId}/lecture`,
                method: "POST",
                body: { lectureTitle }
            })
        }),
        getCourseLecture: builder.query({
            query: (courseId) => ({
                url: `/${courseId}/lecture`,
                method: "GET"
            }),
            providesTags: ['Refetch_Lecture']
        }),
        editLecture: builder.mutation({
            query: ({ lectureTitle, videoInfo, pdfInfo, excelInfo, isPreviewFree, courseId, lectureId }) => ({
                url: `/${courseId}/lecture/${lectureId}`,
                method: "POST",
                body: { lectureTitle, videoInfo, pdfInfo, excelInfo, isPreviewFree }
            }),
            invalidatesTags: (result, error, arg) => [{ type: "Course", id: arg.courseId }, 'Refetch_Lecture']
        }),
        removeLecture: builder.mutation({
            query: (lectureId) => ({
                url: `/lecture/${lectureId}`,
                method: "DELETE"
            }),
            invalidatesTags: ['Refetch_Lecture']
        }),
        getLectureById: builder.query({
            query: (lectureId) => ({
                url: `/lecture/${lectureId}`,
                method: "GET"
            })
        }),
        createSubLecture: builder.mutation({
            query: ({ lectureId, title }) => ({
                url: `/lecture/${lectureId}/sub-lecture`,
                method: "POST",
                body: { title }
            }),
            invalidatesTags: ["SubLecture"]
        }),

        getSubLectures: builder.query({
            query: (lectureId) => ({
                url: `/lecture/${lectureId}/sub-lecture`,
                method: "GET"
            }),
            providesTags: ["SubLecture"]
        }),

        updateSubLecture: builder.mutation({
            query: ({ subLectureId, ...data }) => ({
                url: `/sub-lecture/${subLectureId}`,
                method: "POST",
                body: data
            }),
            invalidatesTags: (result, error, arg) => ["SubLecture", { type: "Course" }]
        }),
        publishCourse: builder.mutation({
            query: ({ courseId, query }) => ({
                url: `/${courseId}/publish?publish=${query}`,
                method: "PUT"
            }),
            invalidatesTags: (result, error, arg) => [
                { type: "Course", id: arg.courseId },
                "Refetch_Creator_Course"
            ]
        }),
        rateCourse: builder.mutation({
            query: ({ courseId, rating }) => ({
                url: `/${courseId}/rate`,
                method: "POST",
                body: { rating }
            })
        }),
    })
})

export const {
    useCreateCourseMutation,
    useGetPublishedCourseQuery,
    useGetCreatorCourseQuery,
    useEditCourseMutation,
    useGetCourseByIdQuery,
    useDeleteCommonMediaMutation,
    useCreateLectureMutation,
    useGetCourseLectureQuery,
    useEditLectureMutation,
    useRemoveLectureMutation,
    useGetLectureByIdQuery,
    usePublishCourseMutation,
    useCreateSubLectureMutation,
    useGetSubLecturesQuery,
    useUpdateSubLectureMutation,
    useRateCourseMutation,
} = courseApi;
