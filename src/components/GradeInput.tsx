import React from 'react';

interface GradeInputProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function GradeInput({ value, onChange, placeholder = "Grade", className = "" }: GradeInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      onChange(undefined);
    } else {
      const num = parseFloat(val);
      if (!isNaN(num) && num >= 0 && num <= 20) {
        onChange(num);
      }
    }
  };

  return (
    <input
      type="number"
      min="0"
      max="20"
      step="0.25"
      value={value ?? ''}
      onChange={handleChange}
      placeholder={placeholder}
      className={`w-20 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all ${className}`}
    />
  );
}