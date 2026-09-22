import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { MedicalProfileData } from "../types";
import { ShieldCheck, QrCode, Droplet, AlertTriangle, UserCheck, Stethoscope, PhoneCall, Plus, Trash2, Printer, Heart, FileText } from "lucide-react";

export const MedicalProfilePage: React.FC = () => {
  const { user, showToast, t } = useApp();

  const [profile, setProfile] = useState<MedicalProfileData>({
    bloodGroup: "O+",
    rhFactor: "Negative",
    rhOGAMNeeded: true,
    allergies: ["Penicillin", "Latex"],
    gravidaCount: 2,
    paraCount: 1,
    previousCSection: false,
    previousCSectionNotes: "None (Prior full-term unassisted vaginal delivery)",
    highRiskNotes: ["Mild Rh-Sensitization Protocol", "Gestational Fasting Glucose Monitoring"],
    emergencyContactName: "David Jenkins (Husband)",
    emergencyContactPhone: "+91 98765 43210",
    obgynName: "Dr. Anjali Sharma, MD (OB-GYN)",
    obgynPhone: "+91 98111 22334",
    hospitalName: "BloomNest Maternity Super-Specialty Hospital",
    hospitalAddress: "42 Healthcare Boulevard, Sector 4",
  });

  const [newAllergy, setNewAllergy] = useState("");
  const [newHighRiskNote, setNewHighRiskNote] = useState("");

  const handleAddAllergy = () => {
    if (!newAllergy.trim()) return;
    setProfile((prev) => ({ ...prev, allergies: [...prev.allergies, newAllergy.trim()] }));
    setNewAllergy("");
    showToast(t("allergyAdded"));
  };

  const handleRemoveAllergy = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index),
    }));
  };

  const handleAddHighRisk = () => {
    if (!newHighRiskNote.trim()) return;
    setProfile((prev) => ({ ...prev, highRiskNotes: [...prev.highRiskNotes, newHighRiskNote.trim()] }));
    setNewHighRiskNote("");
    showToast(t("clinicalNoteAdded"));
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rose-100 dark:border-rose-900/30 pb-4">
        <div>
          <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider">
            <Droplet className="w-4 h-4" />
            <span>{t("emergencyMedicalData")}</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-gray-900 dark:text-rose-100 mt-1">
            {t("bloodGroupProfileTitle")}
          </h1>
          <p className="text-xs text-gray-500 dark:text-rose-300 mt-1">
            {t("bloodGroupProfileDesc")}
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-md shrink-0"
        >
          <Printer className="w-4 h-4" />
          <span>{t("printEmergencyId")}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Blood & Rh Factor Banner */}
          <div className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-gray-900 dark:text-rose-100 flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-2">
              <Droplet className="w-4 h-4 text-red-500" />
              <span>{t("bloodGroupProtocol")}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-600 dark:text-rose-300 mb-1">{t("maternalBloodGroup")}</label>
                <select
                  value={profile.bloodGroup}
                  onChange={(e) => setProfile((p) => ({ ...p, bloodGroup: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 font-extrabold text-sm text-rose-600 dark:text-rose-300"
                >
                  {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-600 dark:text-rose-300 mb-1">{t("rhFactor")}</label>
                <select
                  value={profile.rhFactor}
                  onChange={(e: any) =>
                    setProfile((p) => ({
                      ...p,
                      rhFactor: e.target.value,
                      rhOGAMNeeded: e.target.value === "Negative",
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 font-extrabold text-sm"
                >
                  <option value="Positive">{t("rhPositive")}</option>
                  <option value="Negative">{t("rhNegative")}</option>
                </select>
              </div>
            </div>

            {profile.rhFactor === "Negative" && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-start gap-3 text-xs">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">{t("rhAlertTitle")}</span>
                  {t("rhAlertDesc")}
                </div>
              </div>
            )}
          </div>

          {/* Pregnancy History & Allergies */}
          <div className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-gray-900 dark:text-rose-100 flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-2">
              <FileText className="w-4 h-4 text-rose-500" />
              <span>{t("obstetricalHistory")}</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-600 dark:text-rose-300 mb-1">{t("gravidaCount")}</label>
                <input
                  type="number"
                  value={profile.gravidaCount}
                  onChange={(e) => setProfile((p) => ({ ...p, gravidaCount: parseInt(e.target.value) || 1 }))}
                  className="w-full px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-600 dark:text-rose-300 mb-1">{t("paraCount")}</label>
                <input
                  type="number"
                  value={profile.paraCount}
                  onChange={(e) => setProfile((p) => ({ ...p, paraCount: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-600 dark:text-rose-300 mb-1">{t("priorCSection")}</label>
                <select
                  value={profile.previousCSection ? "yes" : "no"}
                  onChange={(e) => setProfile((p) => ({ ...p, previousCSection: e.target.value === "yes" }))}
                  className="w-full px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 font-bold"
                >
                  <option value="no">{t("noPriorCSection")}</option>
                  <option value="yes">{t("yesPriorCSection")}</option>
                </select>
              </div>
            </div>

            {/* Allergies list */}
            <div className="space-y-2 pt-2">
              <label className="block font-semibold text-xs text-gray-600 dark:text-rose-300">{t("knownAllergies")}</label>
              <div className="flex flex-wrap gap-2">
                {profile.allergies.map((alg, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-bold text-xs flex items-center gap-1.5"
                  >
                    <span>{alg}</span>
                    <button onClick={() => handleRemoveAllergy(i)}>
                      <Trash2 className="w-3.5 h-3.5 hover:text-red-900" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  placeholder={t("addAllergyPlaceholder")}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs"
                />
                <button
                  onClick={handleAddAllergy}
                  className="px-3 py-1.5 bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t("add")}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Digital Medical ID Card Widget */}
        <div className="bg-gradient-to-br from-slate-900 via-zinc-900 to-rose-950 text-white p-6 rounded-3xl shadow-2xl space-y-6 border border-rose-900/50 flex flex-col justify-between print:bg-white print:text-black">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-xs">
                  ID
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-rose-300 font-bold">{t("digitalMedicalId")}</div>
                  <div className="text-xs font-bold text-white">{t("emergencyResponseCard")}</div>
                </div>
              </div>

              <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 font-extrabold text-[10px] uppercase">
                {t("blood")}: {profile.bloodGroup} ({profile.rhFactor})
              </span>
            </div>

            {/* Mother Credentials */}
            <div className="space-y-3 text-xs">
              <div>
                <div className="text-[10px] uppercase text-gray-400">{t("patientName")}</div>
                <div className="font-bold text-base text-rose-100">{user.fullName}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] bg-white/5 p-3 rounded-2xl border border-white/10">
                <div>
                  <div className="text-[10px] text-gray-400">{t("currentGestation")}</div>
                  <div className="font-bold text-rose-300">{t("weekLabel", { week: user.currentWeek })}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400">{t("expectedDueDate")}</div>
                  <div className="font-bold text-rose-300">{user.edd}</div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] uppercase text-gray-400">{t("primaryObgyn")}</div>
                <div className="font-bold text-xs text-rose-200">{profile.obgynName}</div>
                <div className="text-[11px] text-gray-400">{profile.hospitalName}</div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] uppercase text-gray-400">{t("emergencyContact")}</div>
                <div className="font-bold text-xs text-rose-200">{profile.emergencyContactName}</div>
                <div className="text-[11px] text-rose-400 font-mono">{profile.emergencyContactPhone}</div>
              </div>
            </div>

            {/* Simulated First Responder QR Code */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-gray-300 uppercase">{t("emergencyRespondersScan")}</div>
                <div className="text-[10px] text-gray-400">{t("instantParamedicAccess")}</div>
              </div>

              <div className="w-16 h-16 bg-white p-1 rounded-xl flex items-center justify-center shrink-0">
                <QrCode className="w-14 h-14 text-slate-900" />
              </div>
            </div>
          </div>

          <button
            onClick={() => window.print()}
            className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 print:hidden"
          >
            <Printer className="w-4 h-4" />
            <span>{t("printMedicalIdBadge")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
