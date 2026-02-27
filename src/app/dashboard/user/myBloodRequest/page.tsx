"use client";
import AddDonationReqModal from "@/components/modal/AddDonationReqModal";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <Button
        onClick={() => {
          setIsModalOpen(!isModalOpen);
        }}
      >
        open modal
      </Button>
      <AddDonationReqModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
