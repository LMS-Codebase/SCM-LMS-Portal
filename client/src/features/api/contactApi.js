import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const CONTACT_API = "http://localhost:5000/api/v1/contact";

export const contactApi = createApi({
    reducerPath: "contactApi",
    baseQuery: fetchBaseQuery({
        baseUrl: CONTACT_API,
        credentials: "include"
    }),
    endpoints: (builder) => ({
        submitContact: builder.mutation({
            query: (contactData) => ({
                url: "/",
                method: "POST",
                body: contactData
            })
        })
    })
});

export const { useSubmitContactMutation } = contactApi;
