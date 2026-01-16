"use client";

import { ChevronDown } from "lucide-react";
import type { FormSelectProps } from "@/types/formTyps";

export default function FormSelect({
  id,
  label,
  icon: Icon,
  error,
  register,
  options,
  placeholder,
  validation,
  disabled = false,
  className = "",
}: FormSelectProps) {
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
        <select
          id={id}
          disabled={disabled}
          {...register(id, validation)}
          className={`
            w-full py-2.5 border appearance-none bg-white text-sm
            ${Icon ? "pl-10" : "pl-3"}
            pr-8
            ${
              hasError
                ? "border-red-500 bg-red-50"
                : "border-gray-300 focus:border-red-500"
            }
            ${
              disabled
                ? "bg-gray-100 cursor-not-allowed text-gray-400"
                : "cursor-pointer"
            }
            focus:outline-none transition-colors
          `}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${id}-error` : undefined}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
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
