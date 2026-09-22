import React from "react";
import { Sparkles, Flower2 } from "lucide-react";
import { Button } from "./Button";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}) => {
  return (
    <div
      className={`p-8 sm:p-10 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-100/80 dark:border-rose-900/30 text-center space-y-4 max-w-md mx-auto ${className}`}
    >
      <div className="w-16 h-16 rounded-3xl bg-white dark:bg-[#1A1523] text-rose-500 flex items-center justify-center mx-auto shadow-md border border-rose-100 dark:border-rose-900/40">
        {icon || <Flower2 className="w-8 h-8 text-rose-400" />}
      </div>

      <div className="space-y-1.5">
        <h3 className="font-serif text-lg sm:text-xl font-bold text-gray-900 dark:text-rose-100 flex items-center justify-center gap-1.5">
          <span>{title}</span>
          <Sparkles className="w-4 h-4 text-amber-400" />
        </h3>
        <p className="font-sans text-xs text-gray-500 dark:text-rose-300/80 max-w-xs mx-auto leading-relaxed">
          {description}
        </p>
      </div>

      {actionLabel && onAction && (
        <div className="pt-2">
          <Button variant="secondary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
