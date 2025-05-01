import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  id: string;
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  error?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  placeholder?: string;
  className?: string;
  hint?: string;
}

export const Select: React.FC<SelectProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  error,
  isRequired = false,
  isDisabled = false,
  placeholder,
  className = '',
  hint,
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={isDisabled}
        className={`text-gray-600
          block w-full rounded-md border px-3 py-2 text-sm appearance-none bg-white
          ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}
          ${isDisabled ? 'bg-gray-100 text-gray-500' : ''}
          focus:outline-none focus:ring-2 focus:ring-offset-0
        `}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {hint && !error && (
        <p className="mt-1 text-sm text-gray-500">{hint}</p>
      )}
      
      {error && (
        <div className="mt-2 text-red-600 text-sm flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {error}
        </div>
      )}
    </div>
  );
};