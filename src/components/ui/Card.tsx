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
  variant = "glass",
  radius = "3xl",
  children,
  className = "",
  isHoverable = false,
  ...props
}) => {
  const radiusStyles: Record<CardRadius, string> = {
    lg: "rounded-xl",
    xl: "rounded-2xl",
    "2xl": "rounded-[24px]",
    "3xl": "rounded-[32px]",
  };

  const variantStyles: Record<CardVariant, string> = {
    glass:
      "bg-white/80 dark:bg-[#1A1523]/80 backdrop-blur-xl border border-rose-100/80 dark:border-rose-900/40 shadow-xl shadow-rose-200/40 dark:shadow-none text-gray-900 dark:text-rose-100",
    flat:
      "bg-white dark:bg-[#1A1523] border border-gray-100 dark:border-rose-900/30 shadow-sm text-gray-900 dark:text-rose-100",
    gradient:
      "bg-gradient-to-br from-rose-50/80 via-pink-50/50 to-purple-50/70 dark:from-[#221221] dark:via-[#291528] dark:to-[#2e172e] border border-rose-200/60 dark:border-rose-900/50 shadow-md text-gray-900 dark:text-rose-100",
    border:
      "bg-transparent border-2 border-rose-200 dark:border-rose-900/50 text-gray-900 dark:text-rose-100",
  };

  const hoverStyles = isHoverable
    ? "transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] cursor-pointer"
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
