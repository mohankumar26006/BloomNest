import React from "react";

export type CardVariant = "glass" | "flat" | "gradient" | "border";
export type CardRadius = "lg" | "xl" | "2xl" | "3xl";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  radius?: CardRadius;
  children: React.ReactNode;
  className?: string;
  isHoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  variant = "flat",
  radius = "xl",
  children,
  className = "",
  isHoverable = false,
  ...props
}) => {
  const radiusStyles: Record<CardRadius, string> = {
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    "3xl": "rounded-3xl",
  };

  const variantStyles: Record<CardVariant, string> = {
    glass:
      "bg-white/95 dark:bg-[#1A1523]/95 border border-rose-100/80 dark:border-rose-900/40 shadow-sm text-gray-900 dark:text-rose-100",
    flat:
      "bg-white dark:bg-[#1A1523] border border-gray-100 dark:border-rose-900/30 shadow-sm text-gray-900 dark:text-rose-100",
    gradient:
      "bg-rose-50 dark:bg-[#221221] border border-rose-200/60 dark:border-rose-900/50 shadow-sm text-gray-900 dark:text-rose-100",
    border:
      "bg-transparent border-2 border-rose-200 dark:border-rose-900/50 text-gray-900 dark:text-rose-100",
  };

  const hoverStyles = isHoverable
    ? "transition-colors duration-150 hover:border-rose-300 dark:hover:border-rose-700 cursor-pointer"
    : "";

  return (
    <div
      className={`${radiusStyles[radius]} ${variantStyles[variant]} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
