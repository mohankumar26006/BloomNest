import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Car, Plane, AlertTriangle, ShieldCheck, MapPin, Compass, FileText, CheckCircle2, Globe, Heart } from "lucide-react";

export const TravelSafetyPage: React.FC = () => {
  const { user, showToast } = useApp();

  const [relocationCity, setRelocationCity] = useState("Bengaluru");
  const [preferredHospital, setPreferredHospital] = useState("Manipal Maternity Hospital, HAL Airport Road");

  const week = user.currentWeek || 24;
  let travelStatus = {
    badgeClass: "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800",
    iconColor: "text-emerald-600",
    label: `Current Week ${week} (Golden Travel Window)`,
    bannerColor: "bg-teal-600",
    bannerTitle: "Trimester 2 (Weeks 14 – 28): Optimal Travel Window",
    bannerDesc: "Morning sickness has typically subsided, energy levels are optimal, and the risk of early complications is statistically lowest.",
  };

  if (week < 14) {
    travelStatus = {
      badgeClass: "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-800",
      iconColor: "text-amber-600",
      label: `Current Week ${week} (First Trimester Caution Window)`,
      bannerColor: "bg-orange-600",
      bannerTitle: "Trimester 1 (Weeks 1 – 13): Early Pregnancy Caution",
      bannerDesc: "Early symptoms like nausea and fatigue are common. Stay well hydrated, avoid strenuous journeys, and carry medical prescriptions.",
    };
  } else if (week >= 36) {
    travelStatus = {
      badgeClass: "bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-800",
      iconColor: "text-rose-600",
      label: `Current Week ${week} (Travel Restricted - Imminent Delivery)`,
      bannerColor: "bg-rose-700",
      bannerTitle: "Week 36+: Commercial Airlines Restrict Travel",
      bannerDesc: "Labor can begin spontaneously. Long-distance and air travel are strictly discouraged. Stay close to your designated delivery hospital.",
    };
  } else if (week >= 29) {
    travelStatus = {
      badgeClass: "bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-800",
      iconColor: "text-purple-600",
      label: `Current Week ${week} (Third Trimester - Fit-to-Fly Required)`,
      bannerColor: "bg-indigo-600",
      bannerTitle: "Trimester 3 (Weeks 29 – 35): Doctor Clearance Required",
      bannerDesc: "A signed Fit-to-Fly certificate from your OB-GYN is required by airlines. Wear compression socks and take frequent rest walks.",
    };
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rose-100 dark:border-rose-900/30 pb-4">
        <div>
          <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-4 h-4" />
            <span>Trimester Travel & Relocation Protocol</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-gray-900 dark:text-rose-100 mt-1">
            Pregnancy Travel Safety Guide & Relocation Support
          </h1>
          <p className="text-xs text-gray-500 dark:text-rose-300 mt-1">
            Clinical guidelines for road, flight, and train travel, fit-to-fly certificates, and relocation hospital setup.
          </p>
        </div>

        <div className={`px-3.5 py-1.5 rounded-full border text-xs font-extrabold flex items-center gap-1.5 shrink-0 ${travelStatus.badgeClass}`}>
          <ShieldCheck className={`w-4 h-4 ${travelStatus.iconColor}`} />
          <span>{travelStatus.label}</span>
        </div>
      </div>

      {/* Dynamic Travel Window Banner */}
      <div className={`${travelStatus.bannerColor} text-white p-6 rounded-3xl shadow-sm space-y-2`}>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/80">
          <Globe className="w-4 h-4" />
          <span>ACOG Clinical Travel Guidance</span>
        </div>
        <h3 className="font-serif text-xl font-bold">{travelStatus.bannerTitle}</h3>
        <p className="text-xs text-white/90 leading-relaxed">
          {travelStatus.bannerDesc}
        </p>
      </div>

      {/* Travel Modes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Car Travel Guidelines */}
        <div className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-4">
          <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-rose-100 flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-2">
            <Car className="w-5 h-5 text-rose-500" />
            <span>1. Car & Road Travel Safety</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 space-y-1">
              <span className="font-bold text-gray-900 dark:text-rose-100 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-rose-500" /> 3-Point Seatbelt Positioning
              </span>
              <p className="text-gray-600 dark:text-rose-300">
                Place lap belt low across hip bones below the pregnant belly. Shoulder strap crosses between breasts over shoulder. Never lie strap across abdomen.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 space-y-1">
              <span className="font-bold text-gray-900 dark:text-rose-100 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-rose-500" /> 2-Hour Rest & Stretch Stops
              </span>
              <p className="text-gray-600 dark:text-rose-300">
                Stop every 2 hours for a 10-minute walk to maintain venous return and prevent Deep Vein Thrombosis (DVT) blood clots.
              </p>
            </div>
          </div>
        </div>

        {/* Flight Safety Guidelines */}
        <div className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-4">
          <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-rose-100 flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-2">
            <Plane className="w-5 h-5 text-sky-500" />
            <span>2. Flight & Air Travel Safety</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/30 space-y-1">
              <span className="font-bold text-gray-900 dark:text-rose-100 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-sky-500" /> Airline Commercial Cut-Off (36 Weeks)
              </span>
              <p className="text-gray-600 dark:text-rose-300">
                Commercial airlines restrict flying after 36 weeks (32 weeks for twins). Carry a signed doctor Fit-to-Fly certificate after 28 weeks.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/30 space-y-1">
              <span className="font-bold text-gray-900 dark:text-rose-100 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-sky-500" /> Graduated Compression Stockings
              </span>
              <p className="text-gray-600 dark:text-rose-300">
                Wear class-1 medical compression socks during flights over 2 hours and stay well-hydrated with electrolyte water.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Travel Relocation Support Form */}
      <div className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-4">
        <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-rose-100 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-rose-500" />
          <span>Relocation & Travel Emergency Hospital Setup</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-600 dark:text-rose-300 mb-1">Destination City</label>
            <input
              type="text"
              value={relocationCity}
              onChange={(e) => setRelocationCity(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-600 dark:text-rose-300 mb-1">Preferred Maternity Hospital at Destination</label>
            <input
              type="text"
              value={preferredHospital}
              onChange={(e) => setPreferredHospital(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 font-bold"
            />
          </div>
        </div>

        <button
          onClick={() => showToast(`Saved travel relocation profile for ${relocationCity}!`)}
          className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-md"
        >
          Save Relocation Travel Settings
        </button>
      </div>
    </div>
  );
};
