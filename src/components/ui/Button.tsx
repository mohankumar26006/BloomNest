import React from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = "",
  disabled,
  ...props
}) => {
  // Base styling: 44px min touch target, smooth transitions, focus ring
  const baseStyles =
    "inline-flex items-center justify-center font-bold font-sans rounded-2xl transition-all duration-200 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]";

  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      "bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 hover:from-rose-600 hover:to-purple-600 text-white shadow-md shadow-rose-300/40 dark:shadow-none border border-rose-400/20",
    secondary:
      "bg-rose-50/80 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-200 border border-rose-200/60 dark:border-rose-900/40 shadow-xs",
    ghost:
      "bg-transparent hover:bg-rose-50/60 dark:hover:bg-rose-950/30 text-gray-700 dark:text-rose-300 hover:text-rose-600",
    danger:
      "bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-200/40 dark:shadow-none border border-red-400/20",
  };

  const sizeStyles: Record<ButtonSize, string> = {
    sm: "px-3.5 py-2 text-xs gap-1.5",
    md: "px-5 py-2.5 text-xs sm:text-sm gap-2",
    lg: "px-6 py-3.5 text-sm sm:text-base gap-2.5",
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}

      <span>{children}</span>

      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
