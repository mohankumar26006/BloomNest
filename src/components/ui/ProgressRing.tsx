import React from "react";

export interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  centerText?: React.ReactNode;
  className?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  percentage,
  size = 110,
  strokeWidth = 8,
  label = "Complete",
  centerText,
  className = "",
}) => {
  const safePercent = Math.min(100, Math.max(0, percentage));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (safePercent / 100) * circumference;

  return (
    <div
      role="progressbar"
      aria-valuenow={safePercent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg className="transform -rotate-90" style={{ width: size, height: size }}>
        {/* Background Track Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="text-rose-100 dark:text-rose-950/60"
          stroke="currentColor"
          fill="transparent"
        />

        {/* Foreground Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeOffset}
          strokeLinecap="round"
          className="text-rose-500 dark:text-rose-400 transition-all duration-700 ease-out"
          stroke="currentColor"
          fill="transparent"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-1">
        {centerText || (
          <>
            <span className="font-serif font-bold text-xl sm:text-2xl text-gray-900 dark:text-rose-100 leading-none">
              {Math.round(safePercent)}%
            </span>
            {label && (
              <span className="font-sans text-[9px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-300 mt-1">
                {label}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
};
