import React from "react";

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

export const DisplayHeading: React.FC<TypographyProps> = ({ children, className = "", as: Component = "h1" }) => (
  <Component className={`font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-rose-100 ${className}`}>
    {children}
  </Component>
);

export const PageHeading: React.FC<TypographyProps> = ({ children, className = "", as: Component = "h1" }) => (
  <Component className={`font-serif text-2xl sm:text-3xl font-bold text-gray-900 dark:text-rose-100 ${className}`}>
    {children}
  </Component>
);

export const SectionHeading: React.FC<TypographyProps> = ({ children, className = "", as: Component = "h2" }) => (
  <Component className={`font-serif text-xl sm:text-2xl font-bold text-gray-900 dark:text-rose-100 ${className}`}>
    {children}
  </Component>
);

export const CardHeading: React.FC<TypographyProps> = ({ children, className = "", as: Component = "h3" }) => (
  <Component className={`font-serif text-base sm:text-lg font-bold text-gray-900 dark:text-rose-100 ${className}`}>
    {children}
  </Component>
);

export const BodyText: React.FC<TypographyProps> = ({ children, className = "", as: Component = "p" }) => (
  <Component className={`font-sans text-xs sm:text-sm font-medium text-gray-600 dark:text-rose-300/90 leading-relaxed ${className}`}>
    {children}
  </Component>
);

export const Caption: React.FC<TypographyProps> = ({ children, className = "", as: Component = "span" }) => (
  <Component className={`font-sans text-[11px] sm:text-xs font-semibold text-gray-400 dark:text-rose-400 ${className}`}>
    {children}
  </Component>
);

export const Metadata: React.FC<TypographyProps> = ({ children, className = "", as: Component = "span" }) => (
  <Component className={`font-sans text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-300 ${className}`}>
    {children}
  </Component>
);
