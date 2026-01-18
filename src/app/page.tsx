"use client";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/shared/Hero";

// import Footer from "@/components/layout/Footer";
// import Navbar from "@/components/layout/Navbar";
// import Contact from "@/components/shared/Contact";
// import DonationProcess from "@/components/shared/DonationProcess";
// import Hero from "@/components/shared/Hero";
// import ShowDonationReq from "@/components/shared/ShowDonationReq";
// import WhyDonateBlood from "@/components/shared/WhyDonateBlood";

/**
 * If you have a User interface, you should import it here.
 * Example: import { User } from "@/types/auth";
 */

export default function Home(): React.JSX.Element {
  // Assuming useAuth provides a typed user object
  // const { user } = useAuth();

  // Log for debugging during development
  // if (process.env.NODE_ENV === "development") {
  //   console.log("Current User Session:", user);
  // }

  return (
    <main className="relative min-h-screen bg-white">
      <Navbar />
      <Navbar />
      <Hero />
      {/* <ShowDonationReq /> */}
      {/* <WhyDonateBlood /> */}
      {/* <DonationProcess /> */}
      {/* <Contact /> */}
      <Footer />
    </main>
  );
}
