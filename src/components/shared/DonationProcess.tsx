// "use client";

// import React from "react";
// import { motion } from "framer-motion";
// import {
//   ClipboardList,
//   Stethoscope,
//   Droplet,
//   Coffee,
//   Check,
//   ArrowRight,
//   LucideIcon,
// } from "lucide-react";

// // --- Interfaces ---

// interface ProcessStep {
//   step: string;
//   title: string;
//   description: string;
//   icon: LucideIcon;
// }

// export default function DonationProcess() {
//   /** 1. Typed array for the timeline steps **/
//   const processSteps: ProcessStep[] = [
//     {
//       step: "01",
//       title: "Registration",
//       description: "Basic ID check & form filling.",
//       icon: ClipboardList,
//     },
//     {
//       step: "02",
//       title: "Screening",
//       description: "BP, Temp & Hemoglobin check.",
//       icon: Stethoscope,
//     },
//     {
//       step: "03",
//       title: "Donation",
//       description: "8-10 mins process. Safe & Sterile.",
//       icon: Droplet,
//     },
//     {
//       step: "04",
//       title: "Recovery",
//       description: "15 min rest with refreshments.",
//       icon: Coffee,
//     },
//   ];

//   /** 2. Simple string arrays for lists **/
//   const beforeDonation: string[] = [
//     "Sleep 7-8 hours",
//     "Eat iron-rich meal",
//     "Drink 16oz water",
//     "Bring ID card",
//   ];

//   const afterDonation: string[] = [
//     "Rest 15 minutes",
//     "Drink fluids",
//     "Avoid heavy lifting",
//     "Keep bandage 4h",
//   ];

//   return (
//     <section
//       id="guidelines"
//       className="py-12 bg-white font-sans text-gray-900 border-t border-gray-100"
//     >
//       <div className="max-w-7xl mx-auto px-3 lg:px-3 2xl:px-0">
//         {/* --- Header --- */}
//         <div className="flex flex-col md:flex-row justify-between items-start mb-8 border-b border-gray-200 pb-6">
//           <div className="max-w-lg">
//             <div className="inline-block bg-black text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 mb-3">
//               Procedure
//             </div>
//             <h2 className="text-3xl font-bold text-black tracking-tight">
//               Simple <span className="text-red-600">Donation Process</span>
//             </h2>
//           </div>
//           <p className="text-sm text-gray-500 font-medium mt-2 md:mt-0">
//             Total time: Approx. 30-45 minutes
//           </p>
//         </div>

//         {/* --- Process Steps (Compact Timeline) --- */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-gray-200 mb-8">
//           {processSteps.map((process, index) => {
//             const IconComponent = process.icon;
//             return (
//               <motion.div
//                 key={index}
//                 initial={{ opacity: 0, y: 10 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ delay: index * 0.1 }}
//                 className="group relative p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-gray-200 last:border-r-0 hover:bg-gray-50 transition-colors"
//               >
//                 {/* Connector Line (Desktop Only) */}
//                 {index !== processSteps.length - 1 && (
//                   <div className="hidden lg:block absolute top-1/2 -right-3 z-10 text-gray-300">
//                     <ArrowRight size={20} />
//                   </div>
//                 )}

//                 <div className="flex justify-between items-start mb-4">
//                   <span className="text-3xl font-light text-gray-200 group-hover:text-red-600 transition-colors">
//                     {process.step}
//                   </span>
//                   <IconComponent
//                     className="text-gray-400 group-hover:text-black transition-colors"
//                     size={24}
//                   />
//                 </div>

//                 <h3 className="text-lg font-bold text-gray-900 mb-2 uppercase tracking-wide">
//                   {process.title}
//                 </h3>
//                 <p className="text-xs text-gray-500 leading-relaxed">
//                   {process.description}
//                 </p>
//               </motion.div>
//             );
//           })}
//         </div>

//         {/* --- Before & After (Split Density) --- */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-gray-200">
//           {/* Before Donation */}
//           <div className="bg-red-50 p-8 border-b md:border-b-0 md:border-r border-gray-200">
//             <div className="flex items-center gap-3 mb-6">
//               <div className="bg-red-600 text-white p-1.5">
//                 <Check size={16} />
//               </div>
//               <h3 className="text-lg font-bold uppercase tracking-wide text-red-900">
//                 Before Donation
//               </h3>
//             </div>

//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//               {beforeDonation.map((item, i) => (
//                 <div
//                   key={i}
//                   className="flex items-center gap-2 text-sm text-gray-700"
//                 >
//                   <span className="w-1.5 h-1.5 bg-red-400"></span>
//                   {item}
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* After Donation */}
//           <div className="bg-white p-8">
//             <div className="flex items-center gap-3 mb-6">
//               <div className="bg-black text-white p-1.5">
//                 <Check size={16} />
//               </div>
//               <h3 className="text-lg font-bold uppercase tracking-wide text-gray-900">
//                 After Donation
//               </h3>
//             </div>

//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//               {afterDonation.map((item, i) => (
//                 <div
//                   key={i}
//                   className="flex items-center gap-2 text-sm text-gray-700"
//                 >
//                   <span className="w-1.5 h-1.5 bg-gray-400"></span>
//                   {item}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }
