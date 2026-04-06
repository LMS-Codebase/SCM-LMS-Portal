import Navbar from "@/components/Navbar";
import ScrollToTop from "../ScrollToTop";
import React from "react";
import { Outlet } from "react-router-dom";
import Footer from "@/components/Footer";

const MainLayout = () => {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <div>
        {/* to render children , we have to use 'Outlet' - A type of component from react-router  */}
        <Outlet/>
        {/* <Footer/> */}
      </div>
    </>
  );
};

export default MainLayout;
