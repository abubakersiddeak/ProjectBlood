export const ALLOWED_IMAGE_TYPES: readonly string[] = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;
export const MAX_IMAGE_SIZE: number = 5 * 1024 * 1024;
export const MAX_IMAGE_SIZE_MB: number = 5;
export const EMAIL_PATTERN = /\S+@\S+\.\S+/;
export const PHONE_PATTERN = /^(?:\+88|88)?(01[3-9]\d{8})$/;
export const PASSWORD_MIN_LENGTH = 6;
export const NAME_MIN_LENGTH = 3;
export const BLOOD_GROUPS = [
  "All Blood Groups",
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
];
export const URGENCY_LEVELS = [
  { value: "Normal", label: "Normal" },
  { value: "Urgent", label: "Urgent" },
  { value: "Emergency", label: "Emergency " },
];
export const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
export const DONATION_STATUS = ["pending", "in-progress", "success", "cancel"];
