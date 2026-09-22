import React from "react";
import { UserProfile, PageView } from "../../types";
import { PageHeading, Caption } from "../ui/Typography";
import { Badge } from "../ui/Badge";
import { Sparkles, ChevronDown, User } from "lucide-react";

// Asset Image
import sarahAvatar from "../../assets/images/sarah_pastel_avatar_1785746217665.jpg";

interface DashboardHeaderProps {
  user: UserProfile;
  timeOfDayGreeting: string;
  onNavigate: (page: PageView) => void;
  t: (key: string, options?: any) => string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  timeOfDayGreeting,
  onNavigate,
  t,
}) => {
  const displayName = user.fullName || "Mom";

  const journeyText =
    user.currentJourney === "PRE_PREGNANCY"
      ? "🌱 Preconception Journey"
      : user.currentJourney === "POST_PREGNANCY"
      ? "🌷 Fourth Trimester Journey"
      : "🤰 Gestational Journey";

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="space-y-1">
        <Caption className="text-gray-500 dark:text-rose-300/80">
          {timeOfDayGreeting}
        </Caption>

        <PageHeading>{displayName}</PageHeading>

        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          <Badge variant="rose" size="sm">
            {journeyText}
          </Badge>

          <button
            onClick={() => onNavigate("timeline")}
            className="bg-[#fce8ee] dark:bg-rose-950/60 hover:bg-[#fbd8e3] dark:hover:bg-rose-900/60 text-[#b84a6b] dark:text-rose-200 text-xs font-semibold px-3 py-0.5 rounded-full border border-[#f5cad6] dark:border-rose-800/50 inline-flex items-center gap-1 transition-colors shadow-2xs min-h-[32px]"
          >
            <span>
              {t("weekTrimesterBadge", { week: user.currentWeek, trimester: user.trimester }) !== "weekTrimesterBadge"
                ? t("weekTrimesterBadge", { week: user.currentWeek, trimester: user.trimester })
                : `Week ${user.currentWeek} · Trimester ${user.trimester}`}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#b84a6b] dark:text-rose-300" />
          </button>

          {user.extractedMedicalFields && user.extractedMedicalFields.length > 0 && (
            <button
              onClick={() => onNavigate("medical-profile")}
              className="bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold px-3 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/50 inline-flex items-center gap-1 transition-colors shadow-2xs min-h-[32px]"
              title="Verified clinical parameters extracted from your medical report"
            >
              <Sparkles className="w-3 h-3 text-emerald-500" />
              <span>Report Calibrated ({user.extractedMedicalFields.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* User Avatar -> Settings */}
      <div
        className="relative cursor-pointer group shrink-0"
        onClick={() => onNavigate("settings")}
        title="View Settings Profile"
      >
        <img
          src={user.avatarUrl || sarahAvatar}
          alt={user.fullName}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-pink-200 dark:border-rose-700 shadow-md group-hover:scale-105 transition-transform"
        />
        <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-400 border-2 border-white dark:border-[#120e18] rounded-full" />
      </div>
    </div>
  );
};
