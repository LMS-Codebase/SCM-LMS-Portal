import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const progressApi = createApi({
    reducerPath: "progressApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:5000/api/v1/progress",
        credentials: "include", // Required to pass cookies/authentication
    }),
    // Adding tagTypes for cache invalidation
    tagTypes: ["CourseProgress"],
    endpoints: (builder) => ({
        getCourseProgress: builder.query({
            query: (courseId) => ({
                url: `/${courseId}`,
                method: "GET",
            }),
            providesTags: ["CourseProgress"],
        }),
        updateLectureProgress: builder.mutation({
            query: ({ courseId, lectureId }) => ({
                url: `/${courseId}/lecture/${lectureId}/view`,
                method: "POST",
            }),
            invalidatesTags: ["CourseProgress"],
        }),
        resetCourseProgress: builder.mutation({
            query: (courseId) => ({
                url: `/${courseId}/reset`,
                method: "POST",
            }),
            invalidatesTags: ["CourseProgress"],
        }),
    }),
});

export const {
    useGetCourseProgressQuery,
    useUpdateLectureProgressMutation,
    useResetCourseProgressMutation,
} = progressApi;
