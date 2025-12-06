"use client";

import { useState, useEffect } from "react";

interface IbanInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  id?: string;
  required?: boolean;
}

export function IbanInput({
  value,
  onChange,
  className = "",
  placeholder = "FR76...",
  id,
  required = false,
}: IbanInputProps) {
  // Format IBAN with spaces every 4 characters
  const formatIban = (input: string) => {
    // Remove all non-alphanumeric characters and convert to uppercase
    const cleaned = input.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    
    // Add spaces every 4 characters
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(" ");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    // Remove spaces to get the actual value
    const cleanValue = rawValue.replace(/\s/g, "").toUpperCase();
    
    // Limit to 27 characters (standard French IBAN length)
    if (cleanValue.length <= 27) {
      onChange(cleanValue);
    }
  };

  // Check if IBAN is valid (basic check: starts with FR and has 27 chars)
  const isValid = value.startsWith("FR") && value.length === 27;
  const isEmpty = value.length === 0;

  return (
    <div className="relative">
      <input
        type="text"
        id={id}
        value={formatIban(value)}
        onChange={handleChange}
        className={`${className} ${
          !isEmpty && !isValid
            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
            : !isEmpty && isValid
            ? "border-green-300 focus:border-green-500 focus:ring-green-500"
            : ""
        }`}
        placeholder={placeholder}
        required={required}
        maxLength={34} // 27 chars + 6 spaces
      />
      {!isEmpty && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          {isValid ? (
            <svg
              className="h-5 w-5 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="h-5 w-5 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
        </div>
      )}
      {!isEmpty && !isValid && (
        <p className="mt-1 text-xs text-red-500">
          Un IBAN français doit commencer par FR et contenir 27 caractères.
        </p>
      )}
    </div>
  );
}
