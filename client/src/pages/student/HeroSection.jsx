import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";


const HeroSection = () => {

  const navigate = useNavigate();

  return (
    <div className="relative bg-gradient-to-r from-teal-900 to bg-teal-950 py-16 px-4 text-center">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-white text-4xl font-bold mb-4 mt-8">
          Find the Best Resource for You
        </h1>
        <p className="text-gray-200 mb-8">
          Discover, Learn, and Upskill with our wide range of resources
        </p>
        <p className="text-white">Case Studies | E-books | Courses | Blogs</p>
      </div>

      <div className="mt-10">
        <Button
          onClick={() => navigate("/explore")}
          className="bg-teal-100 text-teal-950 hover:bg-teal-700 hover:text-white text-xl px-7 py-7 rounded-md">
          Explore
        </Button>
      </div>
    </div>
  );
};

export default HeroSection;
