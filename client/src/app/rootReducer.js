import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice";
import { authApi } from "@/features/api/authApi";
import { courseApi } from "@/features/api/courseApi";
import { resourceApi } from "@/features/api/resourceApi";
import { domainApi } from "@/features/api/domainApi";
import { ebookApi } from "@/features/api/ebookApi";
import { progressApi } from "@/features/api/progressApi";
import { purchaseApi } from "@/features/api/purchaseApi";
import { contactApi } from "@/features/api/contactApi";

const rootReducer = combineReducers({
    [authApi.reducerPath]: authApi.reducer,
    [courseApi.reducerPath]: courseApi.reducer,
    [resourceApi.reducerPath]: resourceApi.reducer,
    [domainApi.reducerPath]: domainApi.reducer,
    [ebookApi.reducerPath]: ebookApi.reducer,
    [progressApi.reducerPath]: progressApi.reducer,
    [purchaseApi.reducerPath]: purchaseApi.reducer,
    [contactApi.reducerPath]: contactApi.reducer,
    auth: authReducer
});

export default rootReducer;  