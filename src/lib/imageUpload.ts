import Swal from "sweetalert2";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_MB } from "./constants";

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
}

/* Image Validation */
export const validateImage = (file: File): ImageValidationResult => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: "Please upload a valid image (JPG, PNG, GIF, WebP)",
    };
  }

  if (file.size > MAX_IMAGE_SIZE_MB) {
    return {
      isValid: false,
      error: "File size should be less than 5MB",
    };
  }

  return { isValid: true };
};

/* Upload Image (fetch)  */
export const uploadImageToImgBB = async (file: File): Promise<string> => {
  Swal.fire({
    title: "Uploading Image...",
    text: "Please wait while we upload your profile picture",
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
  });

  try {
    const apiKey = process.env.NEXT_PUBLIC_IMGBB_HOST_KEY;

    if (!apiKey) {
      throw new Error("ImgBB API key is missing");
    }

    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error("Image upload failed");
    }

    return result.data.display_url;
  } catch (error) {
    console.error("Image upload error:", error);
    throw new Error("Failed to upload image. Please try again.");
  } finally {
    Swal.close();
  }
};

/* Image Preview */
export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject("Failed to read file");
    reader.readAsDataURL(file);
  });
};
