import { configureStore } from "@reduxjs/toolkit"
import rootReducer from "./rootReducer.js";
import { authApi } from "@/features/api/authApi.js";
import { courseApi } from "@/features/api/courseApi.js";
import { resourceApi } from "@/features/api/resourceApi.js";
import { domainApi } from "@/features/api/domainApi.js";
import { ebookApi } from "@/features/api/ebookApi.js";
import { progressApi } from "@/features/api/progressApi.js";
import { purchaseApi } from "@/features/api/purchaseApi.js";
import { contactApi } from "@/features/api/contactApi.js";

export const appStore = configureStore({
    reducer: rootReducer,
    middleware: (defaultMiddleware) => defaultMiddleware().concat(
        authApi.middleware,
        courseApi.middleware,
        resourceApi.middleware,
        domainApi.middleware,
        ebookApi.middleware,
        progressApi.middleware,
        purchaseApi.middleware,
        contactApi.middleware
    )
});


// If the user refreshes the page , then still it 'll remain store in the store... // there is also a another way  "persisting the User."
// If anyone Refreshes, then it will hit loadUser endpoint which is in authApi.


// this part is very important for authentication.
// This manually triggers an API call when the app starts.
const initializeApp = async () => {
    await appStore.dispatch(authApi.endpoints.loadUser.initiate({}, { forceRefetch: true }))
}
initializeApp();
