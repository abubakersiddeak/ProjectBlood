"use client";
import AddDonationReqModal from "@/components/modal/AddDonationReqModal";
import OwnCreatedBloodReq from "@/components/shared/OwnCreatedBloodReq";

import { Button } from "@/components/ui/button";
import { Plus, Droplet } from "lucide-react";
import React, { useState } from "react";

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50  dark:bg-gray-950">
      {/* Clean Header */}
      <div className=" dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto  py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            {/* Title */}
            <div className="flex items-center gap-3">
              <div className="bg-red-50 dark:bg-red-950 p-2.5 ">
                <Droplet className="h-6 w-6 text-red-600 dark:text-red-400 fill-red-600 dark:fill-red-400" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  My Requests
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Manage your blood donation requests
                </p>
              </div>
            </div>

            {/* Create Button - Desktop */}
            <Button
              size="lg"
              className="hidden sm:flex bg-black rounded-none text-white shadow-sm transition-all duration-200 cursor-pointer group"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-200" />
              Create Request
            </Button>

            {/* Create Button - Mobile */}
            <Button
              size="default"
              className="sm:hidden w-full bg-red-600 hover:bg-red-700 text-white shadow-sm transition-all duration-200 cursor-pointer"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Request
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto  py-6 sm:py-8">
        <OwnCreatedBloodReq key={refreshKey} />
      </div>

      {/* Modal */}
      <AddDonationReqModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          setRefreshKey((prev) => prev + 1);
        }}
      />
    </div>
  );
}
