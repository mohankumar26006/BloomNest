import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { BirthPlanPreference } from "../types";
import { FileText, Printer, CheckCircle2, Heart, ShieldAlert, Sparkles, UserCheck, Baby, Stethoscope, ChevronRight } from "lucide-react";

export const BirthPlanPage: React.FC = () => {
  const { showToast, user } = useApp();

  const [plan, setPlan] = useState<BirthPlanPreference>({
    deliveryType: "vaginal",
    painManagement: ["epidural", "breathing", "hydrotherapy"],
    birthPartnerName: "David Jenkins",
    birthPartnerRole: "Primary Birth Partner & Support Advocate",
    skinToSkin: "immediate",
    cordClamping: "delayed-1-3-mins",
    newbornProcedures: {
      vitaminK: "shot",
      eyeOintment: true,
      hepBVac: true,
      delayedBathing: true,
      breastfeedingSupport: true,
    },
    specialNotes: "Prefer low lighting and soft music in labor room if possible. Please notify partner immediately if C-section becomes necessary.",
  });

  const [isSaved, setIsSaved] = useState(false);

  const togglePainManagement = (option: string) => {
    setPlan((prev) => {
      const exists = prev.painManagement.includes(option);
      const updated = exists
        ? prev.painManagement.filter((p) => p !== option)
        : [...prev.painManagement, option];
      return { ...prev, painManagement: updated };
    });
  };

  const handleSave = () => {
    setIsSaved(true);
    showToast("Birth plan saved successfully! Ready for hospital admission export.");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rose-100 dark:border-rose-900/30 pb-4">
        <div>
          <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            <span>Labor & Delivery Preferences</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-gray-900 dark:text-rose-100 mt-1">
            Birth Plan Builder & Hospital Admission Export
          </h1>
          <p className="text-xs text-gray-500 dark:text-rose-300 mt-1">
            Communicates your labor preferences, pain management choices, and newborn care decisions clearly to your medical team.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-md"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save Plan</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-white dark:bg-[#1a1523] border border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-200 rounded-2xl text-xs font-bold flex items-center gap-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all shadow-xs"
          >
            <Printer className="w-4 h-4 text-rose-500" />
            <span>Export / Print PDF</span>
          </button>
        </div>
      </div>

      {/* Main Grid Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Delivery Mode Preference */}
          <div className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-gray-900 dark:text-rose-100 flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-2">
              <Baby className="w-4 h-4 text-rose-500" />
              <span>1. Delivery Mode Preferences</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {[
                { id: "vaginal", title: "Vaginal Delivery", desc: "Spontaneous unassisted birth unless medically indicated" },
                { id: "c-section-medically-required", title: "C-Section if Needed", desc: "Vaginal trial with C-section as emergency backup" },
                { id: "planned-c-section", title: "Elective / Planned C-Section", desc: "Pre-scheduled surgical delivery" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPlan((prev) => ({ ...prev, deliveryType: opt.id as any }))}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    plan.deliveryType === opt.id
                      ? "bg-rose-500 text-white border-rose-600 shadow-md scale-[1.02]"
                      : "bg-rose-50/40 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/40 text-gray-800 dark:text-rose-200 hover:bg-rose-100/50"
                  }`}
                >
                  <div className="font-bold text-xs mb-1">{opt.title}</div>
                  <div className={`text-[11px] ${plan.deliveryType === opt.id ? "text-rose-100" : "text-gray-500 dark:text-rose-400"}`}>
                    {opt.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Pain Management Choices */}
          <div className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-gray-900 dark:text-rose-100 flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>2. Pain Relief & Comfort Preferences</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              {[
                { id: "epidural", label: "Epidural Analgesia" },
                { id: "gas-air", label: "Entonox (Gas & Air)" },
                { id: "hydrotherapy", label: "Shower / Warm Bath" },
                { id: "breathing", label: "Breathing & Hypnobirthing" },
                { id: "tens", label: "TENS Machine" },
                { id: "massage", label: "Counterpressure Massage" },
              ].map((item) => {
                const isSelected = plan.painManagement.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => togglePainManagement(item.id)}
                    className={`p-3 rounded-2xl border text-left font-bold flex items-center justify-between transition-all ${
                      isSelected
                        ? "bg-purple-600 text-white border-purple-700 shadow-sm"
                        : "bg-rose-50/30 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30 text-gray-700 dark:text-rose-200"
                    }`}
                  >
                    <span>{item.label}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Birth Partner & Post-Delivery Procedures */}
          <div className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-gray-900 dark:text-rose-100 flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-2">
              <UserCheck className="w-4 h-4 text-emerald-500" />
              <span>3. Birth Partner & Immediate Postpartum Care</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-600 dark:text-rose-300 mb-1">Birth Partner Name</label>
                <input
                  type="text"
                  value={plan.birthPartnerName}
                  onChange={(e) => setPlan((prev) => ({ ...prev, birthPartnerName: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-600 dark:text-rose-300 mb-1">Partner Role / Advocacy</label>
                <input
                  type="text"
                  value={plan.birthPartnerRole}
                  onChange={(e) => setPlan((prev) => ({ ...prev, birthPartnerRole: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-600 dark:text-rose-300 mb-1">Skin-to-Skin Preference</label>
                <select
                  value={plan.skinToSkin}
                  onChange={(e: any) => setPlan((prev) => ({ ...prev, skinToSkin: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 font-bold"
                >
                  <option value="immediate">Immediate (Golden Hour with Mother)</option>
                  <option value="delayed">After Brief Medical Check</option>
                  <option value="partner-if-c-section">Partner Skin-to-Skin if C-Section</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-600 dark:text-rose-300 mb-1">Cord Clamping Preference</label>
                <select
                  value={plan.cordClamping}
                  onChange={(e: any) => setPlan((prev) => ({ ...prev, cordClamping: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 font-bold"
                >
                  <option value="delayed-1-3-mins">Delayed Cord Clamping (1 - 3 Mins)</option>
                  <option value="immediate">Immediate Clamping</option>
                  <option value="cord-blood-banking">Cord Blood Stem Cell Collection</option>
                </select>
              </div>
            </div>

            {/* Newborn Care Toggles */}
            <div className="pt-3 space-y-2 border-t border-black/5 dark:border-white/5">
              <span className="text-xs font-bold text-gray-700 dark:text-rose-200 block">Newborn Procedures Preferences:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { key: "eyeOintment", label: "Erythromycin Eye Ointment" },
                  { key: "hepBVac", label: "Hepatitis B Vaccination" },
                  { key: "delayedBathing", label: "Delayed Bathing (24 Hours)" },
                  { key: "breastfeedingSupport", label: "Lactation Specialist Support" },
                ].map((item) => (
                  <label key={item.key} className="flex items-center gap-2 cursor-pointer bg-rose-50/30 dark:bg-rose-950/20 p-2.5 rounded-xl border border-rose-100 dark:border-rose-900/30">
                    <input
                      type="checkbox"
                      checked={(plan.newbornProcedures as any)[item.key]}
                      onChange={(e) =>
                        setPlan((prev) => ({
                          ...prev,
                          newbornProcedures: { ...prev.newbornProcedures, [item.key]: e.target.checked },
                        }))
                      }
                      className="accent-rose-500 w-4 h-4 rounded"
                    />
                    <span className="font-semibold text-gray-800 dark:text-rose-200">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-xs text-gray-600 dark:text-rose-300 mb-1">Special Labor Instructions & Atmosphere</label>
              <textarea
                rows={2}
                value={plan.specialNotes}
                onChange={(e) => setPlan((prev) => ({ ...prev, specialNotes: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Live Admission Card Preview */}
        <div className="bg-gradient-to-br from-rose-500 via-pink-600 to-purple-700 text-white p-6 rounded-3xl shadow-xl space-y-5 h-fit print:border print:text-black print:bg-white">
          <div className="border-b border-white/20 pb-4">
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-rose-200">
              Official Hospital Document
            </div>
            <h2 className="font-serif text-xl font-bold mt-1">Birth Plan Summary</h2>
            <p className="text-xs text-rose-100 mt-0.5">
              Mother: {user.fullName} · Week {user.currentWeek} (EDD: {user.edd})
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="bg-white/10 p-3 rounded-2xl border border-white/15 space-y-1">
              <span className="text-[10px] font-bold uppercase text-rose-200 block">Delivery Method:</span>
              <span className="font-extrabold capitalize text-sm">{plan.deliveryType.replace(/-/g, " ")}</span>
            </div>

            <div className="bg-white/10 p-3 rounded-2xl border border-white/15 space-y-1">
              <span className="text-[10px] font-bold uppercase text-rose-200 block">Pain Management:</span>
              <div className="flex flex-wrap gap-1">
                {plan.painManagement.map((pm) => (
                  <span key={pm} className="px-2 py-0.5 rounded-md bg-white/20 font-bold capitalize text-[10px]">
                    {pm}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white/10 p-3 rounded-2xl border border-white/15 space-y-1">
              <span className="text-[10px] font-bold uppercase text-rose-200 block">Birth Partner:</span>
              <div className="font-bold">{plan.birthPartnerName}</div>
              <div className="text-[11px] opacity-80">{plan.birthPartnerRole}</div>
            </div>

            <div className="bg-white/10 p-3 rounded-2xl border border-white/15 space-y-1">
              <span className="text-[10px] font-bold uppercase text-rose-200 block">Postpartum Preferences:</span>
              <ul className="list-disc list-inside text-[11px] space-y-0.5 opacity-90">
                <li>Skin-to-skin: {plan.skinToSkin}</li>
                <li>Cord clamping: {plan.cordClamping}</li>
                <li>Delayed bathing: {plan.newbornProcedures.delayedBathing ? "Yes (24h)" : "No"}</li>
              </ul>
            </div>
          </div>

          <button
            onClick={handlePrint}
            className="w-full py-3 bg-white text-rose-700 font-extrabold text-xs rounded-2xl hover:bg-rose-50 transition-all flex items-center justify-center gap-2 shadow-md print:hidden"
          >
            <Printer className="w-4 h-4" />
            <span>Print for Hospital Admission</span>
          </button>
        </div>
      </div>
    </div>
  );
};
