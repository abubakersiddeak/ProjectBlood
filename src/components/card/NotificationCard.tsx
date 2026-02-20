"use client";
import React from "react";

interface NotificationCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
}

export default function NotificationCard({
  title,
  value,
  icon,
}: NotificationCardProps) {
  const handleCardClick = () => {
    console.log("Card clicked:", title);
  };

  return (
    <button
      onClick={handleCardClick}
      className="bg-white border cursor-pointer border-gray-200 p-4 hover:shadow-lg transition-shadow w-full"
    >
      <p className="text-sm text-gray-600 font-medium mb-1 text-center">
        {title}
      </p>

      <div className="flex items-center justify-center gap-4">
        <div className="p-2 rounded">{icon}</div>

        <p className="text-3xl font-bold text-gray-900">
          {value.toLocaleString()}
        </p>
      </div>
    </button>
  );
}
