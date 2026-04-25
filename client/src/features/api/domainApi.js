import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const domainApi = createApi({
  reducerPath: "domainApi",
  tagTypes: ["Domain"],
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/v1/domain/`,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    createDomain: builder.mutation({
      query: (formData) => ({
        url: "",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Domain"],
    }),
    updateDomainThumbnail: builder.mutation({
      query: ({ domainId, formData }) => ({
        url: `${domainId}/thumbnail`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Domain"],
    }),
    getDomains: builder.query({
      query: () => ({
        url: "",
        method: "GET",
      }),
      providesTags: ["Domain"],
    }),
  }),
});

export const {
  useCreateDomainMutation,
  useGetDomainsQuery,
  useUpdateDomainThumbnailMutation,
} = domainApi;
