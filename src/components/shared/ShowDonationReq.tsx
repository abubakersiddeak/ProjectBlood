// "use client";

// import React, { useState, useEffect, ChangeEvent } from "react";
// import { useRouter } from "next/navigation";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   MapPin,
//   Calendar,
//   Clock,
//   Building2,
//   X,
//   ArrowRight,
//   Droplet,
//   ChevronLeft,
//   ChevronRight,
// } from "lucide-react";
// import Swal from "sweetalert2";
// import Image from "next/image";
// import server from "@/lib/api";

// // --- Interfaces ---

// interface Address {
//   streetAddress?: string;
//   district: string;
//   upazila: string;
// }

// interface DonationRequest {
//   _id: string;
//   bloodGroup: string;
//   donationDate: string;
//   donationTime: string;
//   recipientName: string;
//   recipientPhone: string;
//   hospitalName: string;
//   fullAddress: Address;
//   additionalMessage?: string;
//   requesterId?: {
//     name: string;
//   };
// }

// interface FilterState {
//   search: string;
//   bloodGroup: string;
//   district: string;
// }

// // --- Main Page Component ---

// export default function ShowDonationReq() {
//   const [requests, setRequests] = useState<DonationRequest[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [selectedRequest, setSelectedRequest] =
//     useState<DonationRequest | null>(null);

//   // Pagination State
//   const [page, setPage] = useState<number>(1);
//   const [totalPages, setTotalPages] = useState<number>(1);
//   const LIMIT = 12;

//   // Filter States
//   const [filters, setFilters] = useState<FilterState>({
//     search: "",
//     bloodGroup: "all",
//     district: "",
//   });

//   useEffect(() => {
//     const fetchRequests = async () => {
//       setLoading(true);
//       try {
//         const params = {
//           status: "pending",
//           page: page,
//           limit: LIMIT,
//           ...(filters.search && { search: filters.search }),
//           ...(filters.district && { district: filters.district }),
//           ...(filters.bloodGroup !== "all" && {
//             bloodGroup: filters.bloodGroup,
//           }),
//         };

//         const response = await server.get(
//           "/api/bloodDonationReq/totalBloodDonationReqPublic",
//           { params }
//         );

//         if (response.data.success) {
//           setRequests(response.data.data);
//           setTotalPages(response.data.pagination.pages);
//         }
//       } catch (error) {
//         console.error("Failed to fetch donation requests:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchRequests();
//   }, [filters, page]);

//   const resetFilters = () => {
//     setFilters({ search: "", bloodGroup: "all", district: "" });
//     setPage(1);
//   };

//   const handlePageChange = (newPage: number) => {
//     if (newPage >= 1 && newPage <= totalPages) {
//       setPage(newPage);
//       window.scrollTo({ top: 0, behavior: "smooth" });
//     }
//   };

//   return (
//     <section className="bg-white min-h-screen py-12 md:py-20">
//       <div className="max-w-7xl px-3 lg:px-3 2xl:px-0 mx-auto">
//         {/* Header */}
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-10 border-b border-gray-200 pb-6 gap-4">
//           <div className="max-w-lg">
//             <div className="inline-block bg-black text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 mb-3">
//               Urgent
//             </div>
//             <h2 className="text-3xl md:text-4xl font-bold text-black tracking-tight">
//               Urgent <span className="text-red-600">Requests</span>
//             </h2>
//           </div>
//           <p className="text-xs md:text-sm text-gray-500 font-medium">
//             Direct donor-to-patient connections.
//           </p>
//         </div>

//         {/* State Management: Loading, Content, or Empty */}
//         {loading ? (
//           <div className="w-full h-64 flex items-center justify-center border border-gray-200 bg-gray-50">
//             <div className="animate-pulse text-gray-400 font-mono text-sm">
//               LOADING DATA...
//             </div>
//           </div>
//         ) : requests.length > 0 ? (
//           <>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-12">
//               {requests.map((req) => (
//                 <MinimalCard
//                   key={req._id}
//                   request={req}
//                   onClick={() => setSelectedRequest(req)}
//                 />
//               ))}
//             </div>

//             {/* Pagination */}
//             <div className="flex flex-col md:flex-row items-center justify-between gap-4">
//               <p className="text-sm text-gray-500 font-medium">
//                 Showing page{" "}
//                 <span className="text-black font-bold">{page}</span> of{" "}
//                 <span className="text-black font-bold">{totalPages}</span>
//               </p>
//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={() => handlePageChange(page - 1)}
//                   disabled={page === 1}
//                   className="h-10 px-4 border border-gray-300 hover:border-black transition-colors disabled:opacity-40 font-bold text-sm uppercase flex items-center gap-2"
//                 >
//                   <ChevronLeft size={16} /> Prev
//                 </button>
//                 <button
//                   onClick={() => handlePageChange(page + 1)}
//                   disabled={page === totalPages}
//                   className="h-10 px-4 border border-gray-300 hover:border-black transition-colors disabled:opacity-40 font-bold text-sm uppercase flex items-center gap-2"
//                 >
//                   Next <ChevronRight size={16} />
//                 </button>
//               </div>
//             </div>
//           </>
//         ) : (
//           <div className="border border-black p-12 text-center bg-gray-50">
//             <h3 className="text-xl font-bold uppercase">No Requests Found</h3>
//             <button
//               onClick={resetFilters}
//               className="inline-block mt-6 text-red-600 font-bold hover:underline underline-offset-4"
//             >
//               Clear all filters
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Modal */}
//       <AnimatePresence>
//         {selectedRequest && (
//           <SquareModal
//             request={selectedRequest}
//             onClose={() => setSelectedRequest(null)}
//           />
//         )}
//       </AnimatePresence>
//     </section>
//   );
// }

// // --- Sub-Component: MinimalCard ---

// interface MinimalCardProps {
//   request: DonationRequest;
//   onClick: () => void;
// }

// function MinimalCard({ request, onClick }: MinimalCardProps) {
//   const formattedDate = new Date(request.donationDate).toLocaleDateString(
//     "en-US",
//     { month: "short", day: "numeric" }
//   );

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 10 }}
//       whileInView={{ opacity: 1, y: 0 }}
//       viewport={{ once: true }}
//       className="group relative border border-gray-200 bg-white transition-all flex flex-col h-full cursor-pointer hover:border-red-100 hover:shadow-lg"
//       onClick={onClick}
//     >
//       <div className="flex border-b border-gray-200">
//         <div className="bg-red-600 text-white w-20 h-20 flex items-center justify-center text-2xl font-bold shrink-0">
//           {request.bloodGroup}
//         </div>
//         <div className="flex-1 p-4 flex flex-col justify-center">
//           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
//             Required By
//           </span>
//           <div className="flex items-center gap-2 text-black font-medium text-sm">
//             <Calendar size={14} /> {formattedDate}
//             <span className="text-gray-300">|</span>
//             <Clock size={14} /> {request.donationTime}
//           </div>
//         </div>
//       </div>

//       <div className="p-5 grow space-y-4">
//         <div>
//           <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
//             Patient
//           </p>
//           <h3 className="text-lg font-bold text-black leading-tight truncate">
//             {request.recipientName}
//           </h3>
//         </div>
//         <div className="space-y-2">
//           <div className="flex items-start gap-3">
//             <Building2 size={16} className="mt-1 text-gray-400 shrink-0" />
//             <span className="text-sm text-gray-800 line-clamp-1">
//               {request.hospitalName}
//             </span>
//           </div>
//           <div className="flex items-start gap-3">
//             <MapPin size={16} className="mt-1 text-gray-400 shrink-0" />
//             <span className="text-sm text-gray-600 line-clamp-1">
//               {request.fullAddress.district}, {request.fullAddress.upazila}
//             </span>
//           </div>
//         </div>
//       </div>

//       <div className="p-4 border-t border-gray-100 mt-auto bg-gray-50 group-hover:bg-red-50 transition-colors">
//         <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
//           <span>View Details</span>
//           <ArrowRight size={16} />
//         </div>
//       </div>
//     </motion.div>
//   );
// }

// // --- Sub-Component: SquareModal ---

// interface SquareModalProps {
//   request: DonationRequest;
//   onClose: () => void;
// }

// function SquareModal({ request, onClose }: SquareModalProps) {
//   const [isProcessing, setIsProcessing] = useState<boolean>(false);
//   const router = useRouter();

//   const handleDonate = async () => {
//     const result = await Swal.fire({
//       title: "CONFIRM DONATION?",
//       text: `Are you sure you want to donate to ${request.recipientName}?`,
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#dc2626",
//       cancelButtonColor: "#000000",
//       confirmButtonText: "YES, I WILL DONATE",
//       cancelButtonText: "CANCEL",
//     });

//     if (result.isConfirmed) {
//       setIsProcessing(true);
//       try {
//         const response = await server.put(
//           `/api/bloodDonationReq/${request._id}/donate`
//         );
//         if (response.data.success) {
//           await Swal.fire(
//             "ACCEPTED!",
//             "Thank you for your donation.",
//             "success"
//           );
//           window.location.reload();
//         }
//       } catch (error: any) {
//         if (error.response?.status === 401) {
//           router.push("/registerDonor");
//         } else {
//           Swal.fire(
//             "ERROR",
//             error.response?.data?.message || "Failed to process.",
//             "error"
//           );
//         }
//       } finally {
//         setIsProcessing(false);
//       }
//     }
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-0 md:p-4 backdrop-blur-sm"
//       onClick={onClose}
//     >
//       <motion.div
//         initial={{ scale: 0.95, opacity: 0 }}
//         animate={{ scale: 1, opacity: 1 }}
//         exit={{ scale: 0.95, opacity: 0 }}
//         onClick={(e) => e.stopPropagation()}
//         className="bg-white w-full md:max-w-3xl md:h-auto h-full flex flex-col shadow-2xl overflow-y-auto"
//       >
//         <div className="flex justify-between items-stretch border-b border-black/30 h-20 shrink-0">
//           <div className="bg-red-600 text-white px-6 md:px-10 flex items-center justify-center text-3xl font-bold">
//             {request.bloodGroup}
//           </div>
//           <button
//             onClick={onClose}
//             className="px-6 hover:bg-black hover:text-white transition-colors border-l border-gray-200"
//           >
//             <X size={28} />
//           </button>
//         </div>

//         <div className="flex flex-col md:flex-row h-full">
//           <div className="p-6 md:p-10 w-full md:w-1/2 space-y-8 border-b md:border-b-0 md:border-r border-gray-200">
//             <div>
//               <span className="inline-block bg-black text-white text-xs font-bold px-2 py-1 mb-4 uppercase">
//                 Urgent
//               </span>
//               <h2 className="text-3xl font-bold text-black mb-1">
//                 {request.recipientName}
//               </h2>
//               <p className="text-gray-500 text-sm">Patient</p>
//             </div>
//             <div className="space-y-4">
//               <InfoRow
//                 icon={<Building2 size={18} />}
//                 label="Hospital"
//                 value={request.hospitalName}
//               />
//               <InfoRow
//                 icon={<MapPin size={18} />}
//                 label="Address"
//                 value={`${request.fullAddress.district}`}
//               />
//               <InfoRow
//                 icon={<Calendar size={18} />}
//                 label="Date"
//                 value={`${request.donationDate} at ${request.donationTime}`}
//               />
//             </div>
//           </div>

//           <div className="p-6 md:p-10 w-full md:w-1/2 flex flex-col justify-between bg-gray-50/50">
//             <div className="space-y-6">
//               <h3 className="text-lg font-bold uppercase border-b border-gray-300 pb-2">
//                 Contact
//               </h3>
//               <a
//                 href={`tel:${request.recipientPhone}`}
//                 className="text-xl font-bold text-black hover:text-red-600 underline underline-offset-4"
//               >
//                 {request.recipientPhone}
//               </a>
//             </div>
//             <div className="mt-8 space-y-3">
//               <button
//                 onClick={handleDonate}
//                 disabled={isProcessing}
//                 className="w-full bg-red-600 text-white h-14 font-bold uppercase hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400"
//               >
//                 {isProcessing ? (
//                   "Wait..."
//                 ) : (
//                   <>
//                     <Droplet size={20} /> I will Donate
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// }

// function InfoRow({
//   icon,
//   label,
//   value,
// }: {
//   icon: React.ReactNode;
//   label: string;
//   value: string;
// }) {
//   return (
//     <div className="flex items-start gap-4">
//       <div className="mt-0.5 text-black">{icon}</div>
//       <div>
//         <p className="text-xs font-bold text-gray-400 uppercase">{label}</p>
//         <p className="text-sm font-bold text-gray-900 leading-snug">{value}</p>
//       </div>
//     </div>
//   );
// }
