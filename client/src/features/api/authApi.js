import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedIn } from "../authSlice";

// Doing API integration in RTK Query

const USER_API = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/v1/user/`;

export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: fetchBaseQuery({
        baseUrl: USER_API,
        credentials: 'include'
    }),
    endpoints: (builder) => ({
        registerUser: builder.mutation({
            query: (inputData) => ({
                url: "register",
                method: "POST",
                body: inputData,
            })
        }),
        // loginUser: builder.mutation({
        //     query: (inputData) => ({
        //         url:"login",
        //         method:"POST",
        //         body:inputData,
        //     }),
        //     async onQueryStarted(_ , {queryFulfilled, dispatch}){
        //         try {
        //             const result = await queryFulfilled;
        //             dispatch(userLoggedIn({user: result.data.user}));
        //         } catch (error) {
        //             console.log(error);
        //         }
        //     }
        // }),
        loginUser: builder.mutation({
            query: (inputData) => ({
                url: "login",
                method: "POST",
                body: inputData,
            }),

            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const result = await queryFulfilled;
                    // ✅ 1. update authSlice (you already had this)
                    dispatch(userLoggedIn({ user: result.data.user }));

                    // ✅ 2. update RTK Query cache for loadUser
                    dispatch(
                        authApi.util.updateQueryData("loadUser", undefined, (draft) => {
                            return result.data; // { success, user }
                        })
                    );

                } catch (error) {
                    console.log(error);
                }
            },
        }),




        logoutUser: builder.mutation({
            query: () => ({
                url: "logout",
                method: "GET",
            }),

            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;

                    // ✅ clear authSlice user
                    dispatch(userLoggedIn({ user: null }));

                    // ✅ clear RTK Query cached loadUser
                    dispatch(
                        authApi.util.updateQueryData("loadUser", undefined, () => null)
                    );

                } catch (error) {
                    console.log(error);
                }
            },
        }),



        // to get something , have to use 'builder.query'
        loadUser: builder.query({
            query: () => ({
                url: "profile",
                method: "GET"
            }),
            async onQueryStarted(_, { queryFulfilled, dispatch }) {
                try {
                    const result = await queryFulfilled;
                    dispatch(userLoggedIn({ user: result.data.user }));
                } catch (error) {
                    console.log(error);
                }
            }
        }),

        // 
        updateUser: builder.mutation({
            query: (formData) => ({
                url: "profile/update",
                method: "PUT",
                body: formData,
                credentials: "include"
            })
        }),
        rateInstructor: builder.mutation({
            query: (data) => ({
                url: `instructor/${data.instructorId}/rate`,
                method: "POST",
                body: { rating: data.rating },
                credentials: "include"
            })
        }),
        toggleCart: builder.mutation({
            query: (data) => ({
                url: "cart/toggle",
                method: "POST",
                body: data,
                credentials: "include"
            })
        })
    })
});

export const {
    useRegisterUserMutation,
    useLoginUserMutation,
    useLogoutUserMutation,
    useLoadUserQuery,
    useUpdateUserMutation,
    useRateInstructorMutation,
    useToggleCartMutation
} = authApi;