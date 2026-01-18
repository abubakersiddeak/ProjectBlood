import { ComponentType } from "react";
import { ChevronDown, LucideIcon } from "lucide-react";
import {
  FieldError,
  FieldValues,
  Path,
  UseFormRegister,
  RegisterOptions,
} from "react-hook-form";
export interface IFormInputProps {
  id: string;
  label: string;

  // Icon component (ex: lucide-react)
  icon?: ComponentType<{ className?: string }>;

  // React Hook Form
  register: UseFormRegister<any>;
  validation?: Record<string, any>;
  error?: FieldError;

  // Input
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  disabled?: boolean;

  // Password toggle
  showPasswordToggle?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;

  // Styling
  className?: string;
}
export interface IFormSelectProps<T extends FieldValues = FieldValues> {
  /** Unique identifier for the select field */
  id: Path<T>;
  /** Label text displayed above the select field */
  label: string;
  /** Optional Lucide icon component to display on the left side */
  icon?: LucideIcon;
  /** Error object from react-hook-form */
  error?: FieldError;
  /** Register function from react-hook-form */
  register: UseFormRegister<any>;
  /** Array of option values to display in the select dropdown */
  options: string[];
  /** Placeholder text for the default empty option */
  placeholder: string;
  /** Validation rules for react-hook-form */
  validation?: RegisterOptions<T>;
  /** Whether the select field is disabled */
  disabled?: boolean;
  /** Additional CSS classes to apply to the container div */
  className?: string;
}
