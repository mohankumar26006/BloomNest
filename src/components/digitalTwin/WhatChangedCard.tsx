import React from "react";
import { TwinChangeItem } from "../../types/digitalTwin";
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Clock,
  Sparkles,
  Calendar,
  HeartHandshake,
  Moon,
  Info,
} from "lucide-react";

interface WhatChangedCardProps {
  changes: TwinChangeItem[];
}

export const WhatChangedCard: React.FC<WhatChangedCardProps> = ({ changes }) => {
  if (!changes || changes.length === 0) {
    return (
      <div className="p-5 rounded-3xl bg-white border border-purple-100 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-purple-600" />
          <h3 className="text-sm font-bold text-gray-900 font-serif">
            What Changed?
          </h3>
        </div>
        <p className="text-xs text-gray-500">
          Not enough historical data yet. As you log your health vitals, sleep, and wellness, meaningful longitudinal changes will automatically appear here.
        </p>
      </div>
    );
  }

  const getCategoryIcon = (category: TwinChangeItem["category"]) => {
    switch (category) {
      case "pregnancy":
        return Sparkles;
      case "health":
        return HeartHandshake;
      case "wellness":
        return Moon;
      case "care":
        return Calendar;
      case "safety":
        return AlertCircle;
      default:
        return Info;
    }
  };

  const getBadgeStyle = (type: TwinChangeItem["type"]) => {
    switch (type) {
      case "improved":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: TrendingUp,
          iconColor: "text-emerald-600",
        };
      case "declined":
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          icon: TrendingDown,
          iconColor: "text-amber-600",
        };
      case "attention":
        return {
          bg: "bg-amber-50 text-amber-800 border-amber-200",
          icon: AlertCircle,
          iconColor: "text-amber-600",
        };
      case "neutral":
      default:
        return {
          bg: "bg-purple-50 text-purple-700 border-purple-200",
          icon: Sparkles,
          iconColor: "text-purple-600",
        };
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white border border-purple-100 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 font-serif">
              What Changed?
            </h3>
            <p className="text-[11px] text-gray-500">
              Live longitudinal updates from your journey data
            </p>
          </div>
        </div>

        <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
          {changes.length} Updates
        </span>
      </div>

      <div className="space-y-2.5">
        {changes.map((item) => {
          const badge = getBadgeStyle(item.type);
          const TrendIcon = badge.icon;
          const CategoryIcon = getCategoryIcon(item.category);

          return (
            <div
              key={item.id}
              className="p-3.5 rounded-2xl bg-[#FAF8FC] border border-purple-100/60 flex items-start gap-3 transition-colors hover:bg-purple-50/50"
            >
              <div
                className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${badge.bg}`}
              >
                <TrendIcon className={`w-3.5 h-3.5 ${badge.iconColor}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-gray-900 truncate">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 capitalize shrink-0 flex items-center gap-1">
                    <CategoryIcon className="w-3 h-3" />
                    {item.category}
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
