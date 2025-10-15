import React from "react";
// import { Link } from "react-router";
// import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        {children}
        <div className="items-center hidden w-full h-full lg:w-1/2 bg-[#F5F2EC] dark:bg-white/5 lg:grid">
          <div className="relative flex items-center justify-center z-1 w-full h-full">
            {/* <!-- ===== Background Image Start ===== --> */}
            <img 
              src="/images/grid-image/grid.jpg" 
              alt="Background" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="flex flex-col items-center max-w-xs relative z-10">
              <div className="p-6 bg-white/50 rounded-lg">
                <h1 className=" text-[#1F2B7C] text-4xl font-bold mb-4">
                  A little piece of  
                  <span className="text-[#ED1F2A]"> Canada</span> in your 
                  neighborhood.
                </h1>
                <hr className="border-black border-t-1 w-full mb-4" />
                <p className="text-black text-md mb-6">Conveniently located in New Eskaton</p>
                <h2 className="text-gray-800 text-2xl font-bold">A new horizon awaits.</h2>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
