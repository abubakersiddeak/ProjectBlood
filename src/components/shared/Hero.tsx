"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Heart,
  Users,
  Clock,
  Phone,
  Shield,
  Droplet,
  ArrowRight,
  Activity,
  LucideIcon,
} from "lucide-react";

/** 1. Define the interface for the feature items **/
interface FeatureItem {
  icon: LucideIcon;
  text: string;
}

export default function Hero() {
  /** 2. Apply the type to the features array **/
  const features: FeatureItem[] = [
    {
      icon: Shield,
      text: "100% Safe & Secure",
    },
    {
      icon: Activity,
      text: "Verified Donors",
    },
    {
      icon: Droplet,
      text: "Free Service",
    },
  ];

  return (
    <main className="bg-gray-50 py-10 md:py-3">
      {/* Hero Section */}
      <section className="relative py-8 md:py-12 lg:py-20 overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-red-100 rounded-full blur-3xl opacity-20 -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-50 rounded-full blur-3xl opacity-30 -z-10" />

        <div className="max-w-7xl px-4 md:px-6 lg:px-3 2xl:px-0 mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left space-y-6 md:space-y-4 2xl:space-y-6 order-2 lg:order-1"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 border-l-4 border-red-600"
              >
                <Droplet size={16} className="fill-current" />
                <span className="text-sm 2xl:text-base font-bold uppercase tracking-wide">
                  Save Lives Today
                </span>
              </motion.div>

              {/* Main Heading */}
              <div className="space-y-3 2xl:space-y-4">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-5xl font-bold text-gray-900 leading-tight"
                >
                  Every Drop of Blood
                  <span className="block mt-2 text-red-600 relative">
                    Saves A Life
                    <svg
                      className="absolute -bottom-2 left-0 w-full hidden md:block"
                      height="12"
                      viewBox="0 0 300 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M2 10C50 5 100 2 150 5C200 8 250 7 298 10"
                        stroke="#dc2626"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-600 text-base sm:text-lg lg:text-xl leading-relaxed max-w-xl mx-auto lg:mx-0"
                >
                  Join our community of heroes making a difference. Your single
                  donation can save up to{" "}
                  <span className="font-bold text-red-600">three lives</span>.
                  Be the reason someone smiles today.
                </motion.p>
              </div>

              {/* Features Pills */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-3 justify-center lg:justify-start"
              >
                {features.map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <IconComponent size={16} className="text-red-600" />
                      <span className="text-xs md:text-sm font-medium text-gray-700">
                        {feature.text}
                      </span>
                    </div>
                  );
                })}
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4 justify-center lg:justify-start"
              >
                <Link
                  href="/register"
                  className="group relative bg-red-600 text-white px-6 md:px-8 py-3 md:py-4 text-sm md:text-base hover:bg-red-700 transition-all font-bold uppercase tracking-wide text-center overflow-hidden cursor-pointer"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Heart
                      size={18}
                      className="group-hover:scale-110 transition-transform"
                    />
                    Become a Donor
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </span>
                  <div className="absolute inset-0 bg-linear-to-r from-red-700 to-red-800 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </Link>

                <Link
                  href="/search"
                  className="group bg-white border-2 border-gray-900 text-gray-900 px-6 md:px-8 py-3 md:py-4 text-sm md:text-base hover:bg-gray-900 hover:text-white transition-all font-bold uppercase tracking-wide text-center cursor-pointer"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Users size={18} />
                    Find Donors
                  </span>
                </Link>
              </motion.div>

              {/* Fund Donation Link */}
              {/* <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Link
                  href="/payment"
                  className="group inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm md:text-base cursor-pointer"
                >
                  <Droplet size={16} className="fill-current" />
                  <span className="border-b-2 border-red-200 group-hover:border-red-600 transition-colors">
                    Support underprivileged patients
                  </span>
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>
              </motion.div> */}
            </motion.div>

            {/* Right Image Section */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="order-1 lg:order-2 relative"
            >
              <div className="relative max-w-md sm:max-w-lg lg:max-w-none mx-auto">
                <div className="absolute -top-4 -left-4 w-20 h-20 bg-red-600 opacity-20 -z-10" />
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-red-600 opacity-10 -z-10" />

                <div className="relative border-8 border-white shadow-2xl bg-white overflow-hidden group">
                  <Image
                    height={500}
                    width={500}
                    src="https://i.ibb.co.com/yBGfjN6r/photo-1615461066159-fea0960485d5.jpg"
                    alt="Blood Donation - Saving Lives"
                    className="w-full h-54 sm:h-80 md:h-90 lg:h-87.5 xl:h-100 2xl:h-125 object-cover group-hover:scale-105 transition-transform duration-500"
                    priority
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-4 left-4 bg-white px-4 py-2 shadow-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs md:text-sm font-bold text-gray-900 uppercase">
                        Active Now
                      </span>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="relative md:absolute -bottom-6 md:-bottom-8 right-0 md:-right-6 bg-linear-to-br from-red-600 to-red-700 p-4 md:p-6 shadow-2xl max-w-full md:max-w-xs mx-4 md:mx-0 border-4 border-white mt-4 md:mt-0"
                >
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="bg-white/20 backdrop-blur-sm p-2 md:p-3 shrink-0">
                      <Phone size={24} className="text-white" />
                    </div>
                    <div>
                      <div className="text-red-100 font-bold text-xs md:text-sm uppercase tracking-wider mb-1">
                        Emergency Hotline
                      </div>
                      <a
                        href="tel:+8801790884776"
                        className="text-white font-bold text-lg md:text-xl tracking-wide hover:underline"
                      >
                        +880 1790884776
                      </a>
                      <div className="text-red-100 text-xs mt-2 flex items-center gap-1">
                        <Clock size={12} />
                        <span>Available 24/7</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full" />
                </motion.div>

                {/* Info Cards - Desktop Only */}
                <div className="hidden xl:flex absolute top-1/2 -left-20 transform -translate-y-1/2 flex-col gap-3">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 }}
                    className="bg-white p-4 shadow-lg border-l-4 border-red-600 max-w-48"
                  >
                    <div className="text-2xl font-bold text-red-600">30+</div>
                    <div className="text-xs text-gray-600 uppercase">
                      Blood Banks
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.4 }}
                    className="bg-white p-4 shadow-lg border-l-4 border-red-600 max-w-48"
                  >
                    <div className="text-2xl font-bold text-red-600">50+</div>
                    <div className="text-xs text-gray-600 uppercase">
                      Districts
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
