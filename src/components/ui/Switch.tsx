// import React from 'react';

// interface SwitchProps {
//   id: string;
//   label?: string;
//   isChecked: boolean;
//   onChange: (isChecked: boolean) => void;
//   isDisabled?: boolean;
//   className?: string;
// }

// export const Switch: React.FC<SwitchProps> = ({
//   id,
//   label,
//   isChecked,
//   onChange,
//   isDisabled = false,
//   className = '',
// }) => {
//   return (
//     <div className={`flex items-center ${className}`}>
//       <div className="relative inline-block h-6 w-11">
//         <input
//           id={id}
//           type="checkbox"
//           className="peer sr-only"
//           checked={isChecked}
//           onChange={(e) => onChange(e.target.checked)}
//           disabled={isDisabled}
//         />
//         <div
//           className={`
//             absolute inset-0 rounded-full transition-colors duration-200
//             ${isChecked ? 'bg-blue-600' : 'bg-gray-200'}
//             ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
//           `}
//         />
//         <div
//           className={`
//             absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-200
//             ${isChecked ? 'translate-x-5' : ''}
//           `}
//         />
//       </div>
//       {label && (
//         <label
//           htmlFor={id}
//           className={`ml-3 text-sm ${isDisabled ? 'text-gray-400' : 'text-gray-700'}`}
//         >
//           {label}
//         </label>
//       )}
//     </div>
//   );
// };


// src/components/ui/Switch.tsx
import React from 'react';

interface SwitchProps {
  id: string;
  label?: string;
  isChecked: boolean;
  onChange: (isChecked: boolean) => void;
  isDisabled?: boolean;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  id,
  label,
  isChecked,
  onChange,
  isDisabled = false,
  className = '',
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="relative inline-block h-6 w-11">
        <input
          id={id}
          type="checkbox"
          className="peer sr-only"
          checked={isChecked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={isDisabled}
        />
        <label
          htmlFor={id}
          className={`
            absolute inset-0 cursor-pointer rounded-full transition-colors duration-200
            ${isChecked ? 'bg-blue-600' : 'bg-gray-200'}
            ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <span 
            className={`
              absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-200
              ${isChecked ? 'translate-x-5' : 'translate-x-0'}
            `}
          />
        </label>
      </div>
      {label && (
        <label
          htmlFor={id}
          className={`ml-3 text-sm cursor-pointer ${isDisabled ? 'text-gray-400' : 'text-gray-700'}`}
        >
          {label}
        </label>
      )}
    </div>
  );
};