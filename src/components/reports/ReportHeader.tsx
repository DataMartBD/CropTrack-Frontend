import React from "react";

interface ReportHeaderProps {
  title: string;
  address?: string;
  children?: React.ReactNode;
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({
  title,
  address = "বটতলী, বীরগঞ্জ, দিনাজপুর।",
  children,
}) => {
  return (
    <div className="relative overflow-hidden text-center mb-4 py-4 px-4 bg-gradient-to-b from-green-50 to-white border-b-2 border-double border-green-800 rounded-t-lg">
      {/* Background Graphic Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <h6 className="text-[10px] mb-1 text-zinc-600">
          বিসমিল্লাহির রাহমানির রাহিম
        </h6>

        <div className="inline-block px-2 py-0.5 mb-1 bg-green-800 text-white text-[9px] rounded-sm uppercase">
          রাহবার এগ্রো কমপ্লেক্স (প্রাঃ) লিমিটেড এর অঙ্গ প্রতিষ্ঠান
        </div>

        <div className="flex justify-center items-center gap-2 mb-1">
          <div className="hidden md:block h-px w-8 bg-green-800/30"></div>
          <h1 className="text-xl font-bold text-green-900">{title}</h1>
          <div className="hidden md:block h-px w-8 bg-green-800/30"></div>
        </div>

        <div className="flex flex-col items-center justify-center">
          <p className="text-xs text-zinc-700">{address}</p>
          <div className="flex gap-4 mt-0.5">{children}</div>
        </div>
      </div>
    </div>
  );
};
