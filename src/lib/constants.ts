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
