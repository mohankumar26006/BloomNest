import React from "react";
import { JourneyStage, PageView } from "../../types";
import { Card } from "../ui/Card";
import { Flower2, ShoppingBag, Droplets, Dumbbell, Calendar, Heart, Shield } from "lucide-react";

// Asset Images
import sarahAvatar from "../../assets/images/sarah_pastel_avatar_1785746217665.jpg";
import hospitalBagArt from "../../assets/images/hospital_bag_art_1785744744950.jpg";
import waterGlassArt from "../../assets/images/water_glass_art_1785744759907.jpg";
import prenatalYogaArt from "../../assets/images/prenatal_yoga_art_1785744775109.jpg";

interface JourneyDiscoveryHubProps {
  journey?: JourneyStage;
  currentWeek: number;
  onNavigate: (page: PageView) => void;
  t: (key: string, options?: any) => string;
}

export const JourneyDiscoveryHub: React.FC<JourneyDiscoveryHubProps> = ({
  journey = "PREGNANCY",
  currentWeek,
  onNavigate,
  t,
}) => {
  const isThirdTrimester = currentWeek >= 28;

  return (
    <div className="space-y-3">
      <div className="text-xs font-bold text-gray-900 dark:text-rose-100 font-serif">
        Explore Your Maternal Journey
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Garbha Sanskar Card */}
        <Card
          variant="glass"
          radius="2xl"
          isHoverable
          onClick={() => onNavigate("garbha-wellness")}
          className="p-4 flex items-center gap-3 group border-pink-100 dark:border-rose-900/40"
        >
          <img
            src={sarahAvatar}
            alt="Garbha Sanskar"
            className="w-10 h-10 rounded-xl object-cover shrink-0 group-hover:opacity-90 transition-opacity"
          />
          <div>
            <div className="text-xs font-bold text-gray-900 dark:text-rose-100">
              {t("garbhaSanskar")}
            </div>
            <div className="text-[10px] text-gray-500 dark:text-rose-300/70">
              {t("musicRagas")}
            </div>
          </div>
        </Card>

        {/* Hospital Bag Checklist (Contextual: 3rd Trimester or Postpartum) */}
        <Card
          variant="glass"
          radius="2xl"
          isHoverable
          onClick={() => onNavigate("hospital-bag")}
          className={`p-4 flex items-center gap-3 group border-purple-100 dark:border-rose-900/40 ${
            isThirdTrimester ? "ring-2 ring-rose-400/40" : ""
          }`}
        >
          <img
            src={hospitalBagArt}
            alt="Hospital Bag"
            className="w-10 h-10 rounded-xl object-cover shrink-0 group-hover:opacity-90 transition-opacity"
          />
          <div>
            <div className="text-xs font-bold text-gray-900 dark:text-rose-100 flex items-center gap-1">
              <span>{t("hospitalBag")}</span>
              {isThirdTrimester && <span className="text-[9px] font-extrabold text-rose-500 uppercase">3rd Tri</span>}
            </div>
            <div className="text-[10px] text-gray-500 dark:text-rose-300/70">
              {t("checklistPrep")}
            </div>
          </div>
        </Card>

        {/* Water / Hydration Tracker */}
        <Card
          variant="glass"
          radius="2xl"
          isHoverable
          onClick={() => onNavigate("health-tracker")}
          className="p-4 flex items-center gap-3 group border-blue-100 dark:border-rose-900/40"
        >
          <img
            src={waterGlassArt}
            alt="Water Tracker"
            className="w-10 h-10 rounded-xl object-cover shrink-0 group-hover:opacity-90 transition-opacity"
          />
          <div>
            <div className="text-xs font-bold text-gray-900 dark:text-rose-100">
              {t("waterTracker")}
            </div>
            <div className="text-[10px] text-gray-500 dark:text-rose-300/70">
              {t("waterLogged", { liters: "2.2" })}
            </div>
          </div>
        </Card>

        {/* Prenatal Yoga */}
        <Card
          variant="glass"
          radius="2xl"
          isHoverable
          onClick={() => onNavigate("yoga")}
          className="p-4 flex items-center gap-3 group border-emerald-100 dark:border-rose-900/40"
        >
          <img
            src={prenatalYogaArt}
            alt="Prenatal Yoga"
            className="w-10 h-10 rounded-xl object-cover shrink-0 group-hover:opacity-90 transition-opacity"
          />
          <div>
            <div className="text-xs font-bold text-gray-900 dark:text-rose-100">
              {t("prenatalYoga")}
            </div>
            <div className="text-[10px] text-gray-500 dark:text-rose-300/70">
              {t("breathingAsanas")}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
