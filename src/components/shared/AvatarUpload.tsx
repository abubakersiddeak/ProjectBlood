"use client";
import React, { useCallback } from "react";
import Image from "next/image";
import { User, Camera, X } from "lucide-react";
import { AvatarUploadProps } from "@/types/registrationTyps";

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  previewImage,
  onImageChange,
  onRemove,
  error,
  fileInputRef,
}) => {
  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, [fileInputRef]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        fileInputRef.current?.click();
      }
    },
    [fileInputRef]
  );

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div
          role="button"
          tabIndex={0}
          className={`w-24 h-24 border-2 ${
            error ? "border-red-500" : "border-gray-300"
          } overflow-hidden bg-gray-100 cursor-pointer hover:border-red-500 hover:bg-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2`}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
        >
          {previewImage ? (
            <Image
              src={previewImage}
              alt="Preview"
              height={96}
              width={96}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
              <User className="w-8 h-8" />
              <span className="text-xs mt-1">Click to upload</span>
            </div>
          )}
        </div>

        <button
          type="button"
          className="absolute -bottom-1 -right-1 w-8 h-8 bg-red-600 flex items-center justify-center cursor-pointer"
          onClick={handleClick}
        >
          <Camera className="w-4 h-4 text-white" />
        </button>

        {previewImage && (
          <button
            type="button"
            onClick={onRemove}
            className="absolute -top-1 -right-1 w-6 h-6 bg-gray-800 flex items-center justify-center text-white"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={onImageChange}
      />

      {error && <p className="mt-2 text-red-500 text-xs">{error}</p>}
      <p className="text-gray-500 text-xs mt-2">
        Click avatar or camera icon to upload (Optional)
      </p>
      <p className="text-gray-400 text-xs">Max 5MB (JPG, PNG, GIF, WebP)</p>
    </div>
  );
};

export default AvatarUpload;
