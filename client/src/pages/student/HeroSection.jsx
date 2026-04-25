import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import LMSBanner from "../../assets/images/LandingPageBanner.jpg";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative w-full h-[50vh] md:h-[55vh] flex items-center mt-12">
      {/* BACKGROUND IMAGES */}
      <img
        src={LMSBanner}
        alt="Desktop Banner"
        className="absolute inset-0 w-full h-full object-cover object-center hidden md:block -z-10"
      />
      <img
        src={LMSBanner}
        alt="Mobile Banner"
        className="absolute inset-0 w-full h-full object-cover object-center block md:hidden -z-10"
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-[#192A56]/60 pointer-events-none -z-10" />

      {/* BANNER CONTENT */}
      <div className="px-6 sm:px-12 lg:px-32 w-full z-10 flex flex-col items-start pt-4">
        <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-medium text-white mb-3 max-w-4xl tracking-tight drop-shadow-sm">
          Find the Best Resources for You
        </h1>
        <p className="text-base sm:text-lg text-white/95 font-normal tracking-normal max-w-2xl mb-8 drop-shadow-sm">
          Discover, Learn, and Upskill with our wide range of resources
        </p>

        <div className="flex flex-col items-start gap-6">
          <p className="text-white/95 font-semibold tracking-wide">
            Case Studies | E-books | Courses | Blogs
          </p>
          <Button
            onClick={() => navigate("/explore")}
            className="bg-[#007bff] hover:bg-[#0056b3] text-white text-lg px-8 py-6 rounded-full font-bold shadow-md transition-all"
          >
            Explore
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
