export interface IRegistrationFormData {
  fullName: string;
  email: string;
  phone: string;
  bloodGroup: string;
  location: {
    address: { district: string; upazila: string };
    coordinates: [];
  };
  password: string;
  avatar?: string;
}

export interface District {
  id: string;
  name: string;
  lat: string;
  lng: string;
}

export interface Upazila {
  id: string;
  district_id: string;
  name: string;
}
export interface AvatarUploadProps {
  previewImage: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  error?: string | null;
}
