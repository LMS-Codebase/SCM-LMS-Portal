import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const resourceApi = createApi({
  reducerPath: "resourceApi",
  tagTypes: ["Resource"],
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/v1/resource/`,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    createResource: builder.mutation({
      query: (formData) => ({
        url: "",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Resource"],
    }),

    getPublishedResources: builder.query({
      query: () => ({
        url: "",
        method: "GET",
      }),
      providesTags: ["Resource"],
    }),
  }),
});

export const {
  useCreateResourceMutation,
  useGetPublishedResourcesQuery,
} = resourceApi;