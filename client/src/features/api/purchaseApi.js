import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const PURCHASE_API = "http://localhost:5000/api/v1/payment/";

export const purchaseApi = createApi({
    reducerPath: "purchaseApi",
    baseQuery: fetchBaseQuery({
        baseUrl: PURCHASE_API,
        credentials: "include"
    }),
    endpoints: (builder) => ({
        // Razorpay Checkout (Order creation)
        createOrder: builder.mutation({
            query: (data) => ({
                url: "/checkout",
                method: "POST",
                body: data
            })
        }),
        // Razorpay Verification
        verifyPayment: builder.mutation({
            query: (paymentData) => ({
                url: "/verify",
                method: "POST",
                body: paymentData
            })
        }),
        // Legacy/Direct (Still keeping for compatibility)
        purchaseResource: builder.mutation({
            query: ({ resourceId, resourceType }) => ({
                url: "/purchase",
                method: "POST",
                body: { resourceId, resourceType }
            })
        }),
    })
});

export const {
    useCreateOrderMutation,
    useVerifyPaymentMutation,
    usePurchaseResourceMutation
} = purchaseApi;
