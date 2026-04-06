import React from "react";
import ReactDOM from "react-dom/client";
import { StrictMode } from "react";
import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import { appStore } from "./app/store";
import { Toaster } from "./components/ui/sonner";
import { useLoadUserQuery } from "./features/api/authApi";

const Custom = ({ children }) => {
  const { isLoading } = useLoadUserQuery();
  return <>{isLoading ? <h1 className="text-center font-bold text-2xl">Loading....</h1> : <>{children}</>}</>;
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* <BrowserRouter> */}
    <Provider store={appStore}>
      <Custom>
        <div className="font-sans">
        <App />
        </div>
        <Toaster />
      </Custom>
    </Provider>
    {/* </BrowserRouter> */}
  </StrictMode>,
);
 