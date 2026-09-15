import React from "react";
import { useApp } from "../context/AppContext";
import { Users, Heart, Sparkles, CheckCircle2, Shield, Calendar, Gift } from "lucide-react";

export const PartnerPage: React.FC = () => {
  const { user, t } = useApp();

  const PARTNER_TIPS = [
    {
      week: 12,
      trimesterKey: "trimester1",
      babySizeKey: "partnerBabySize12",
      mamaFeelingKey: "partnerMamaFeeling12",
      partnerAdviceKey: "partnerAdvice12",
      actionItems: ["partnerAction12_1", "partnerAction12_2", "partnerAction12_3"],
    },
    {
      week: 24,
      trimesterKey: "trimester2",
      babySizeKey: "partnerBabySize24",
      mamaFeelingKey: "partnerMamaFeeling24",
      partnerAdviceKey: "partnerAdvice24",
      actionItems: ["partnerAction24_1", "partnerAction24_2", "partnerAction24_3"],
    },
    {
      week: 36,
      trimesterKey: "trimester3",
      babySizeKey: "partnerBabySize36",
      mamaFeelingKey: "partnerMamaFeeling36",
      partnerAdviceKey: "partnerAdvice36",
      actionItems: ["partnerAction36_1", "partnerAction36_2", "partnerAction36_3"],
    },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>{t("coParentingSupport")}</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-gray-900 dark:text-rose-100 mt-1">
            {t("partnerHubTitle")}
          </h1>
          <p className="text-xs text-gray-500 dark:text-rose-300 mt-1">
            {t("partnerHubSubtitle")}
          </p>
        </div>
      </div>

      {/* Hero Tip for Current Week */}
      <div className="p-8 rounded-3xl bg-gradient-to-tr from-purple-900 via-indigo-900 to-rose-950 text-white shadow-xl space-y-4">
        <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold w-fit text-amber-300">
          <Sparkles className="w-4 h-4" />
          <span>{t("weekPartnerFocus", { week: user.currentWeek })}</span>
        </div>

        <h2 className="font-serif text-2xl font-bold">
          {t("howToSupportThisWeek", { name: user.fullName.split(" ")[0] })}
        </h2>

        <p className="text-xs text-purple-200 leading-relaxed max-w-2xl">
          {t("partnerHeroDesc", { week: user.currentWeek })}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
            <span className="font-bold text-amber-300 block mb-1">{t("partnerTip1Title")}</span>
            <span className="text-purple-100">{t("partnerTip1Desc")}</span>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
            <span className="font-bold text-amber-300 block mb-1">{t("partnerTip2Title")}</span>
            <span className="text-purple-100">{t("partnerTip2Desc")}</span>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
            <span className="font-bold text-amber-300 block mb-1">{t("partnerTip3Title")}</span>
            <span className="text-purple-100">{t("partnerTip3Desc")}</span>
          </div>
        </div>
      </div>

      {/* Trimester Partner Tips Cards */}
      <div className="space-y-4">
        {PARTNER_TIPS.map((tip, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-rose-100 dark:border-rose-900/30">
              <span className="text-xs font-bold text-rose-600 dark:text-rose-300">
                {t("weekLabel", { week: tip.week })} · {t(tip.trimesterKey)}
              </span>
              <span className="text-xs font-semibold text-gray-500 dark:text-rose-400">
                {t("baby")}: {t(tip.babySizeKey)}
              </span>
            </div>

            <div>
              <h3 className="font-serif font-bold text-base text-gray-900 dark:text-rose-100">
                {t("mothersStateFeelings")}
              </h3>
              <p className="text-xs text-gray-600 dark:text-rose-300 mt-1">
                {t(tip.mamaFeelingKey)}
              </p>
            </div>

            <div>
              <h3 className="font-serif font-bold text-base text-gray-900 dark:text-rose-100">
                {t("partnerActionGuide")}
              </h3>
              <p className="text-xs text-rose-700 dark:text-rose-200 mt-1 font-medium">
                {t(tip.partnerAdviceKey)}
              </p>
            </div>

            <div className="space-y-1.5 pt-2">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                {t("actionChecklist")}
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {tip.actionItems.map((itemKey, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/30 font-semibold text-rose-900 dark:text-rose-100 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>{t(itemKey)}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
