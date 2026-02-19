import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import AllBloodDonationReqPublic from "@/components/shared/AllBloodDonationReqPublic";
import React from "react";

export default function page() {
  return (
    <div>
      <Navbar />
      <AllBloodDonationReqPublic />
      <Footer />
    </div>
  );
}
