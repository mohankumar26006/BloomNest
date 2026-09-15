import React, { useId } from "react";

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  helperText?: string;
  className?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  icon,
  error,
  helperText,
  className = "",
  id: customId,
  disabled,
  ...props
}) => {
  const generatedId = useId();
  const inputId = customId || generatedId;

  return (
    <div className="w-full space-y-1.5 text-xs font-sans">
      {label && (
        <label htmlFor={inputId} className="block font-bold text-gray-700 dark:text-rose-300">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 text-gray-400 dark:text-rose-400 pointer-events-none shrink-0">
            {icon}
          </div>
        )}

        <input
          id={inputId}
          disabled={disabled}
          className={`w-full py-2.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border text-gray-900 dark:text-rose-100 font-semibold min-h-[44px] transition-all focus:outline-none focus:ring-2 focus:ring-rose-400 ${
            icon ? "pl-10 pr-4" : "px-4"
          } ${
            error
              ? "border-red-400 dark:border-red-500 focus:ring-red-400"
              : "border-rose-100 dark:border-rose-900/40 hover:border-rose-300"
          } ${disabled ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-900" : ""} ${className}`}
          {...props}
        />
      </div>

      {error ? (
        <p className="text-[11px] font-bold text-red-500 flex items-center gap-1">
          ⚠️ {error}
        </p>
      ) : helperText ? (
        <p className="text-[11px] font-semibold text-gray-400 dark:text-rose-400">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};
