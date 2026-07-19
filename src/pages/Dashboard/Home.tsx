import PageMeta from "../../components/common/PageMeta";
// import { useEffect, useState } from "react";
import Farm from "/images/cold-storage/farm.svg";
import {
  FcInspection,
  FcPaid,
  FcShipped,FcMoneyTransfer} from "react-icons/fc";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

export default function Home() {
  const navigate = useNavigate();
  // const [userType, setCurrentUserType] = useState<string | null>(null);
  const { t } = useTranslation();

  // useEffect(() => {
  //   setCurrentUserType(localStorage.getItem("user_type"));
  // }, []);

  return (
    <>
      <PageMeta title="CropTrack" description="CropTrack Dashboard" />

      {/* Main Section */}
      <section
        className="bg-[#1D2939] text-white rounded-lg bg-no-repeat bg-right-bottom bg-contain py-3"
        style={{ backgroundImage: `url(${Farm})` }}
      >
        <div className="w-full flex flex-col md:flex-row items-center my-6 md:my-12">
          <div className="flex flex-col w-full lg:w-1/3 justify-center items-start p-4">
            <h1 className="text-4xl md:text-4xl  font-semibold p-1 text-[#F0DA78] tracking-loose">
              CropTrack
            </h1>
            <h2 className="text-2xl text-white md:text-3xl leading-relaxed md:leading-snug mb-1">
              Rahbar Cold Storage
            </h2>
          </div>
        </div>
      </section>

      {/* Grid container for 3 separate sections */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8 w-full">

           {/* JV */}
        <section
          onClick={() => navigate("/accounts/journal-voucher")}
          className="relative bg-[#7E9598] text-white rounded-lg bg-no-repeat bg-right-bottom bg-contain py-6 transform transition duration-300 hover:scale-[1.03] hover:shadow-lg hover:-translate-y-1 cursor-default"
        >
          <div className="p-6 pr-20">
            <h3 className="text-white text-3xl font-semibold mb-4">
              {t("journal_voucher")}
            </h3>
          </div>
          <div className="absolute bottom-4 right-4">
            <FcMoneyTransfer  size={100} className="opacity-90" />
          </div>
        </section>

        {/* Booking */}
        <section
          onClick={() => navigate("/booking/new")}
          className="relative bg-[#13725A] text-white rounded-lg bg-no-repeat bg-right-bottom bg-contain py-6 transform transition duration-300 hover:scale-[1.03] hover:shadow-lg hover:-translate-y-1 cursor-default"
        >
          <div className="p-6 pr-20">
            <h3 className="text-white text-3xl font-semibold mb-4">
              {t("booking")}
            </h3>
          </div>
          <div className="absolute bottom-4 right-4">
            <FcInspection size={100} className="opacity-90" />
          </div>
        </section>

        {/* Certificate */}
        <section
          onClick={() => navigate("/certificate/new")}
          className="relative bg-[#52AD59] text-white rounded-lg bg-no-repeat bg-right-bottom bg-contain py-6 transform transition duration-300 hover:scale-[1.03] hover:shadow-lg hover:-translate-y-1 cursor-default"
        >
          <div className="p-6 pr-20">
            <h3 className="text-white text-3xl font-semibold mb-4">
              {t("certificate")}
            </h3>
          </div>
          <div className="absolute bottom-4 right-4">
            <FcShipped size={100} className="opacity-90" />
          </div>
        </section>

        {/* Pocket */}
        <section
          onClick={() => navigate("/certificate/list")}
          className="relative bg-[#97813A] text-white rounded-lg bg-no-repeat bg-right-bottom bg-contain py-6 transform transition duration-300 hover:scale-[1.03] hover:shadow-lg hover:-translate-y-1 cursor-default"
        >
          <div className="p-6 pr-20">
            <h3 className="text-white text-3xl font-semibold mb-4">
              {t("inventory_flow")}
            </h3>
          </div>
          <div className="absolute bottom-4 right-4">
            <FcPaid size={100} className="opacity-90" />
          </div>
        </section>
      </div>

      {/* Stats */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8 container mx-auto">
        <div className="flex items-center px-5 py-6 shadow-sm rounded-md bg-[#1D2939]">
          <h1 className="text-5xl">
            <FcFrame />
          </h1>

          <div className="mx-5">
            <h4 className="text-2xl font-semibold text-white">4644</h4>
            <div className="text-white">{t("stored_bags")}</div>
          </div>
        </div>
        <div className="flex items-center px-5 py-6 shadow-sm rounded-md bg-[#1D2939]">
          <h1 className="text-5xl">
            <FcContacts />
          </h1>

          <div className="mx-5">
            <h4 className="text-2xl font-semibold text-white">358</h4>
            <div className="text-white">{t("reg_customers")}</div>
          </div>
        </div>

        <div className="flex items-center px-5 py-6 shadow-sm rounded-md bg-[#1D2939]">
          <h1 className="text-5xl">
            <FcInTransit />
          </h1>
          <div className="mx-5">
            <h4 className="text-2xl font-semibold text-white">50</h4>
            <div className="text-white">{t("todays_do")}</div>
          </div>
        </div>
        <div className="flex items-center px-5 py-6 shadow-sm rounded-md bg-[#1D2939]">
          <h1 className="text-5xl">
            <FcSafe />
          </h1>
          <div className="mx-5">
            <h4 className="text-2xl font-semibold text-white">107</h4>
            <div className="text-white">{t("todays_collection")}</div>
          </div>
        </div>
      </div> */}
    </>
  );
}
