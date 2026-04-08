import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const EBOOK_API = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/v1/ebook/`;

export const ebookApi = createApi({
    reducerPath: "ebookApi",
    tagTypes: ['Ebook', 'Refetch_Creator_Ebook'],
    baseQuery: fetchBaseQuery({
        baseUrl: EBOOK_API,
        credentials: "include"
    }),
    endpoints: (builder) => ({
        createEbook: builder.mutation({
            query: (data) => ({
                url: "/",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ['Refetch_Creator_Ebook']
        }),
        addEbook: builder.mutation({
            query: (data) => ({
                url: "/add",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ['Refetch_Creator_Ebook']
        }),
        getCreatorEbooks: builder.query({
            query: () => ({
                url: "/",
                method: "GET",
            }),
            providesTags: ['Refetch_Creator_Ebook']
        }),
        editEbook: builder.mutation({
            query: ({ formData, ebookId }) => ({
                url: `/${ebookId}`,
                method: "PUT",
                body: formData
            }),
            invalidatesTags: (result, error, arg) => [
                { type: "Refetch_Creator_Ebook" },
                { type: "Ebook", id: arg.ebookId },
            ],
        }),
        getEbookById: builder.query({
            query: (ebookId) => ({
                url: `/${ebookId}`,
                method: "GET"
            }),
            providesTags: (result, error, ebookId) => [
                { type: "Ebook", id: ebookId },
            ],
        }),
        deleteEbook: builder.mutation({
            query: (ebookId) => ({
                url: `/${ebookId}`,
                method: "DELETE"
            }),
            invalidatesTags: ['Refetch_Creator_Ebook']
        }),
        publishEbook: builder.mutation({
            query: ({ ebookId, query }) => ({
                url: `/${ebookId}/publish?publish=${query}`,
                method: "PATCH"
            }),
            invalidatesTags: (result, error, arg) => [
                { type: "Refetch_Creator_Ebook" },
                { type: "Ebook", id: arg.ebookId },
            ],
        }),
        getPublishedEbooks: builder.query({
            query: () => ({
                url: "/published-ebooks",
                method: "GET"
            })
        }),
        rateEbook: builder.mutation({
            query: ({ ebookId, rating }) => ({
                url: `/${ebookId}/rate`,
                method: "POST",
                body: { rating }
            })
        }),
    })
});

export const {
    useCreateEbookMutation,
    useGetCreatorEbooksQuery,
    useEditEbookMutation,
    useAddEbookMutation,
    useGetEbookByIdQuery,
    useDeleteEbookMutation,
    usePublishEbookMutation,
    useGetPublishedEbooksQuery,
    useRateEbookMutation,
} = ebookApi;
