import React from "react";

export interface DeliveryChallanData {
  parent: {
    xchlnum: string;
    token_no: string;
    created_at: string;
    xmobile: string;
    xcus: string;
    xchgtot: string;
    xtotamt: string;
    xpayloan: string;
    xemptysack: number;
    xemptysackchgtot: string;
    xinterestamt: string;
    xfanchgtot: string;
    customer_name: string;
    father_name: string;
    district_name: string;
    upazila_name: string;
    union_name: string;
    post_office: string;
    village: string;
  };
  child: Array<{
    xchlnum: string;
    xqtychl: string;
    xunit: string;
    xfloor: string;
    xpocket: string;
  }>;
}

interface DeliveryChallanTemplateProps {
  data: DeliveryChallanData;
}

const DeliveryChallanTemplate: React.FC<DeliveryChallanTemplateProps> = ({
  data,
}) => {
  const parent = data?.parent || ({} as any);
  const child = data?.child || [];

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  const totalQty = child.reduce(
    (acc, curr) => acc + parseFloat(curr.xqtychl),
    0
  );

  return (
    <div
      id="delivery-challan-print-area"
      className="p-8 bg-white text-black font-serif text-sm border border-gray-300 mx-auto"
      style={{
        width: "210mm",
        height: "296mm",
        fontFamily: '"Noto Serif Bengali", serif',
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div className="relative overflow-hidden text-center mb-6 py-6 px-4 bg-gradient-to-b from-green-50 to-white border-b-4 border-double border-green-800 rounded-t-lg">
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

        <div className="relative z-10">
          <h6 className="text-xs mb-1 font-medium text-zinc-600">
            বিসমিল্লাহির রাহমানির রাহিম
          </h6>
          <div className="inline-block px-3 py-0.5 mb-2 bg-green-800 text-white text-[10px] rounded-full tracking-wider uppercase">
            রাহবার এগ্রো কমপ্লেক্স (প্রাঃ) লিমিটেড এর অঙ্গ প্রতিষ্ঠান
          </div>
          <div className="flex justify-center items-center gap-4 mb-2">
            <div className="hidden md:block h-px w-12 bg-green-800/30"></div>
            <h1 className="text-3xl font-black text-green-900 tracking-tight drop-shadow-sm">
              রাহবার হিমাগার (প্রাঃ) লিমিটেড ইউনিট-৪
            </h1>
            <div className="hidden md:block h-px w-12 bg-green-800/30"></div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <p className="text-sm font-bold text-zinc-700">
              বটতলী, বীরগঞ্জ, দিনাজপুর।
            </p>
            <div className="flex gap-4 mt-1">
              <p className="text-xs font-semibold bg-white px-2 py-0.5 border border-zinc-200 rounded shadow-sm">
                <span className="text-green-800">মোবাইল:</span> ০১৭০১৮৮৯০৪,
                ০১৭৪০১৩৩১৪৪
              </p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-green-800 rounded-t-full"></div>
      </div>

      {/* Title Bar */}
      <div className="grid grid-cols-3 items-center bg-green-100 border-y-2 border-green-800 py-1 px-4 mb-4">
        <div className="font-semibold text-left text-xs">ডেলিভারি আদেশ</div>
        <div className="flex justify-center">
          <div className="font-bold text-lg bg-green-800 text-white px-6 py-1 rounded-full whitespace-nowrap">
            ডেলিভারি চালান
          </div>
        </div>
        <div className="font-semibold text-md text-right">
          চালান নংঃ {parent.xchlnum}
        </div>
      </div>

      {/* Customer Info */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-6 text-sm">
        <div className="flex">
          <span className="w-24 font-semibold">তারিখঃ</span>
          <span className="border-b border-dotted border-gray-600 flex-1">
            {formatDate(parent.created_at)}
          </span>
        </div>
        <div className="flex">
          <span className="w-24 font-semibold">টোকেন নংঃ</span>
          <span className="border-b border-dotted border-gray-600 flex-1">
            {parent.token_no}
          </span>
        </div>
        <div className="flex col-span-2">
          <span className="w-24 font-semibold">গ্রাহকের নামঃ</span>
          <span className="border-b border-dotted border-gray-600 flex-1">
            {parent.customer_name}
          </span>
        </div>
        <div className="flex col-span-2">
          <span className="w-24 font-semibold">পিতার নামঃ</span>
          <span className="border-b border-dotted border-gray-600 flex-1">
            {parent.father_name}
          </span>
        </div>
        <div className="flex col-span-2">
          <span className="w-24 font-semibold">ঠিকানাঃ</span>
          <span className="border-b border-dotted border-gray-600 flex-1">
            {parent.village}, {parent.post_office}, {parent.upazila_name},{" "}
            {parent.district_name}
          </span>
        </div>
        <div className="flex">
          <span className="w-24 font-semibold">মোবাইল নংঃ</span>
          <span className="border-b border-dotted border-gray-600 flex-1">
            {parent.xmobile}
          </span>
        </div>
        <div className="flex">
          <span className="w-24 font-semibold">কাস্টমার আইডিঃ</span>
          <span className="border-b border-dotted border-gray-600 flex-1">
            {parent.xcus}
          </span>
        </div>
      </div>

      {/* Main Table and Calc */}
      <div className="grid grid-cols-12 gap-4">
        {/* Child Table */}
        <div className="col-span-7">
          <table className="w-full border-collapse border border-gray-800 text-center text-xs">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-800 p-1">ইউনিট</th>
                <th className="border border-gray-800 p-1">ফ্লোর</th>
                <th className="border border-gray-800 p-1">পকেট</th>
                <th className="border border-gray-800 p-1">বস্তার পরিমাণ</th>
              </tr>
            </thead>
            <tbody>
              {child.map((item, idx) => (
                <tr key={idx}>
                  <td className="border border-gray-800 p-2">{item.xunit}</td>
                  <td className="border border-gray-800 p-2">{item.xfloor}</td>
                  <td className="border border-gray-800 p-2">{item.xpocket}</td>
                  <td className="border border-gray-800 p-2 font-bold">
                    {parseFloat(item.xqtychl).toFixed(0)}
                  </td>
                </tr>
              ))}
              <tr className="font-bold bg-green-50">
                <td
                  colSpan={3}
                  className="border border-gray-800 p-2 text-right"
                >
                  সর্বমোট বস্তা:
                </td>
                <td className="border border-gray-800 p-2">
                  {totalQty.toFixed(0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Financial Section */}
        <div className="col-span-5">
          <div className="border border-gray-800 rounded-sm">
            <div className="bg-green-800 text-white text-center py-1 font-bold text-xs uppercase">
              টাকা আদায় বিবরণ
            </div>
            <div className="p-2 space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span>বস্তার ভাড়া:</span>
                <span className="font-bold">{parent.xchgtot}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>খালি বস্তার মূল্য ({parent.xemptysack} টি):</span>
                <span className="font-bold">{parent.xemptysackchgtot}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>ফ্যান চার্জ:</span>
                <span className="font-bold">{parent.xfanchgtot}</span>
              </div>
              <div className="flex justify-between items-center text-red-700">
                <span>লোন পরিশোধ:</span>
                <span className="font-bold">{parent.xpayloan}</span>
              </div>
              <div className="flex justify-between items-center border-t border-gray-300 pt-1 font-bold text-sm text-green-900">
                <span>সর্বমোট আদায়:</span>
                <span>{parent.xtotamt}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-20 flex justify-between items-end px-10">
        <div className="text-center">
          <p className="border-t border-black px-4 pt-1 font-bold">
            গ্রহীতার স্বাক্ষর
          </p>
        </div>
        <div className="text-center">
          <p className="border-t border-black px-4 pt-1 font-bold">
            ম্যানেজারের স্বাক্ষর
          </p>
        </div>
      </div>

      <div className="mt-12 text-[11px] text-zinc-600 leading-relaxed border-t border-zinc-200 pt-4">
        <p className="italic">
          বিঃদ্রঃ অফিস সহকারী এবং স্টোরকিপারের স্বাক্ষর ব্যতীত এই চালান বৈধ বলে
          বিবেচিত হবে না।
        </p>
      </div>
    </div>
  );
};

export default DeliveryChallanTemplate;
