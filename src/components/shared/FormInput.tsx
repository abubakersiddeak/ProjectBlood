"use client";

import { EyeOff, Eye } from "lucide-react";

export default function FormInput({
  id,
  label,
  icon: Icon,
  error,
  register,
  type = "text",
  placeholder,
  validation,
  showPasswordToggle = false,
  showPassword = false,
  onTogglePassword,
  disabled = false,
  className = "",
}: FormInputProps) {
  const inputType = showPasswordToggle
    ? showPassword
      ? "text"
      : "password"
    : type;
  const hasError = !!error;

  return (
    <div className={className}>
      <label className="block text-gray-700 text-sm mb-1" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon
              className={`w-4 h-4 ${
                hasError ? "text-red-400" : "text-gray-400"
              }`}
            />
          </div>
        )}
        <input
          type={inputType}
          id={id}
          disabled={disabled}
          {...register(id, validation)}
          className={`
            w-full py-2.5 border text-sm
            ${Icon ? "pl-10" : "pl-3"}
            ${showPasswordToggle ? "pr-10" : "pr-3"}
            ${
              hasError
                ? "border-red-500 bg-red-50"
                : "border-gray-300 focus:border-red-500"
            }
            ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}
            focus:outline-none transition-colors
          `}
          placeholder={placeholder}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${id}-error` : undefined}
        />
        {showPasswordToggle && onTogglePassword && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
            onClick={onTogglePassword}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" />
            ) : (
              <Eye className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" />
            )}
          </button>
        )}
      </div>
      {hasError && (
        <p
          id={`${id}-error`}
          className="mt-1 text-red-500 text-xs"
          role="alert"
        >
          {error.message}
        </p>
      )}
    </div>
  );
}
