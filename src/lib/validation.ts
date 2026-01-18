import { EMAIL_PATTERN, PASSWORD_MIN_LENGTH, PHONE_PATTERN } from "./constants";

export const validationRules = {
  fullName: {
    required: "Full name is required",
    minLength: {
      value: 3,
      message: "Name must be at least 3 characters",
    },
  },
  email: {
    required: "Email is required",
    pattern: {
      value: EMAIL_PATTERN,
      message: "Please enter a valid email",
    },
  },
  phone: {
    required: "Phone number is required",
    pattern: {
      value: PHONE_PATTERN,
      message: "Enter valid 11-digit number",
    },
  },
  bloodGroup: {
    required: "Blood group is required",
  },
  district: {
    required: "District is required",
  },
  upazila: {
    required: "Upazila is required",
  },
  password: {
    required: "Password is required",
    minLength: {
      value: PASSWORD_MIN_LENGTH,
      message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
    },
  },
} as const;
