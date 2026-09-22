import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { HealthVital, GlucoseContext, SymptomSafetyCheck } from "../types";
import { evaluateVitalsTrend, VitalsTrendAnalysis } from "../services/healthVitalsService";
import {
  Heart,
  Activity,
  Scale,
  Plus,
  TrendingUp,
  ShieldAlert,
  GlassWater,
  Thermometer,
  Sparkles,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertTriangle,
  Moon,
  Footprints,
  Info,
  Calendar,
  Clock,
  Edit3,
  Trash2,
  Printer,
  Share2,
  Copy,
  Check,
  X,
  BookOpen,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

export const HealthTrackerPage: React.FC = () => {
  const {
    vitals,
    addVital,
    updateVital,
    deleteVital,
    quickAddWater,
    isAudioMuted,
    toggleAudioMute,
    showToast,
    user,
  } = useApp();

  // Form State - stored as sanitized strings to prevent leading zeros (e.g. 0120 -> 120) and sticky zeros
  const [logDate, setLogDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [logTime, setLogTime] = useState<string>(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  });
  const [systolic, setSystolic] = useState<string>("118");
  const [diastolic, setDiastolic] = useState<string>("76");
  const [pulse, setPulse] = useState<string>("78");
  const [glucose, setGlucose] = useState<string>("92");
  const [glucoseContext, setGlucoseContext] = useState<GlucoseContext>("fasting");
  const [weight, setWeight] = useState<string>("64.8");
  const [water, setWater] = useState<string>("2200");
  const [sleep, setSleep] = useState<string>("8.0");
  const [kicks, setKicks] = useState<string>("12");
  const [notes, setNotes] = useState<string>("");

  // Helper to sanitize whole number inputs and strip accidental leading zeros
  const cleanIntInput = (val: string): string => {
    // Only digits, and strip leading zeros if followed by another digit (e.g. "0120" -> "120", "080" -> "80", "098" -> "98")
    return val.replace(/[^0-9]/g, "").replace(/^0+(?=\d)/, "");
  };

  // Helper to sanitize float numbers (e.g. weight, sleep)
  const cleanFloatInput = (val: string): string => {
    let cleaned = val.replace(/[^0-9.]/g, "").replace(/^0+(?=\d)/, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) {
      cleaned = parts[0] + "." + parts.slice(1).join("");
    }
    return cleaned;
  };

  // Symptom Safety Check State
  const [symptomCheck, setSymptomCheck] = useState<SymptomSafetyCheck>({
    headache: false,
    visionChanges: false,
    upperAbdominalPain: false,
    breathingDifficulty: false,
    unusualSwelling: false,
  });

  // UI Flow States
  const [activePageTab, setActivePageTab] = useState<"overview" | "log" | "trends" | "history">("overview");
  const [editingVitalId, setEditingVitalId] = useState<number | string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeChartTab, setActiveChartTab] = useState<"weight" | "bp" | "pulse" | "glucose">("weight");
  const [historyFilter, setHistoryFilter] = useState<"all" | "bp" | "glucose" | "alerts">("all");
  const [showClinicalGuideModal, setShowClinicalGuideModal] = useState<boolean>(false);
  const [showDoctorReportModal, setShowDoctorReportModal] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const handleSymptomToggle = (key: keyof SymptomSafetyCheck) => {
    setSymptomCheck((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleResetToNow = () => {
    setLogDate(new Date().toISOString().split("T")[0]);
    const d = new Date();
    setLogTime(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
    showToast("Timestamp reset to current date & time ⏰");
  };

  const handleStartEdit = (vital: HealthVital) => {
    setActivePageTab("log");
    setEditingVitalId(vital.id);
    setLogDate(vital.date || new Date().toISOString().split("T")[0]);
    setLogTime(vital.time || "08:00");
    setSystolic(String(vital.systolicBp || 120));
    setDiastolic(String(vital.diastolicBp || 80));
    setPulse(String(vital.pulseBpm || 78));
    setGlucose(String(vital.glucoseMgDl || vital.bloodSugarMgDl || 92));
    setGlucoseContext(vital.glucoseContext || "fasting");
    setWeight(String(vital.weightKg || 64.0));
    setWater(String(vital.waterMl || 2000));
    setSleep(String(vital.sleepHours || 8.0));
    setKicks(String(vital.babyKicksCount || 10));
    setNotes(vital.notes || "");
    if (vital.symptomCheck) {
      setSymptomCheck(vital.symptomCheck);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    showToast(`Editing vital record from ${vital.date}`);
  };

  const handleCancelEdit = () => {
    setEditingVitalId(null);
    setNotes("");
    showToast("Edit cancelled.");
  };

  const handleDeleteVital = async (id: number | string) => {
    if (window.confirm("Are you sure you want to remove this vital record?")) {
      await deleteVital(id);
      if (editingVitalId === id) {
        setEditingVitalId(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanSys = systolic.trim();
    const cleanDia = diastolic.trim();
    const cleanPulse = pulse.trim();

    const numSystolic = cleanSys ? parseInt(cleanSys, 10) : NaN;
    const numDiastolic = cleanDia ? parseInt(cleanDia, 10) : NaN;
    const numPulse = cleanPulse ? parseInt(cleanPulse, 10) : 78;

    // Optional or forgiving fields with smart fallbacks
    const numGlucose = glucose.trim() ? parseInt(glucose.trim(), 10) : undefined;
    const numWeight = weight.trim() ? parseFloat(weight.trim()) : (vitals[0]?.weightKg || 64.0);
    const numWater = water.trim() ? parseInt(water.trim(), 10) : 2000;
    const numSleep = sleep.trim() ? parseFloat(sleep.trim()) : 8.0;
    const numKicks = kicks.trim() ? parseInt(kicks.trim(), 10) : 10;

    // Frontend validation: accepts any positive number so clinical alerts can trigger freely
    const errors: string[] = [];
    if (isNaN(numSystolic) || numSystolic <= 0) {
      errors.push("Please enter a valid positive number for Systolic Blood Pressure.");
    }
    if (isNaN(numDiastolic) || numDiastolic <= 0) {
      errors.push("Please enter a valid positive number for Diastolic Blood Pressure.");
    }
    if (isNaN(numPulse) || numPulse <= 0) {
      errors.push("Please enter a valid positive number for Pulse / Heart Rate.");
    }
    if (numGlucose !== undefined && (isNaN(numGlucose) || numGlucose <= 0)) {
      errors.push("Please enter a valid positive number for Blood Glucose.");
    }
    if (isNaN(numWeight) || numWeight <= 0) {
      errors.push("Please enter a valid weight in kg.");
    }
    if (isNaN(numWater) || numWater < 0) {
      errors.push("Water intake cannot be negative.");
    }
    if (isNaN(numSleep) || numSleep < 0) {
      errors.push("Sleep hours cannot be negative.");
    }
    if (isNaN(numKicks) || numKicks < 0) {
      errors.push("Baby kick count cannot be negative.");
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      showToast(errors[0]);
      return;
    }
    setValidationErrors([]);
    setApiError(null);
    setIsSubmitting(true);

    const symptomTags: string[] = [];
    if (symptomCheck.headache) symptomTags.push("Severe headache");
    if (symptomCheck.visionChanges) symptomTags.push("Vision changes");
    if (symptomCheck.upperAbdominalPain) symptomTags.push("Upper abdominal pain");
    if (symptomCheck.breathingDifficulty) symptomTags.push("Shortness of breath");
    if (symptomCheck.unusualSwelling) symptomTags.push("Unusual swelling");
    if (symptomTags.length === 0) symptomTags.push("Normal vitals");

    const payload = {
      date: logDate,
      time: logTime,
      timestamp: `${logDate}T${logTime}:00.000Z`,
      weightKg: numWeight,
      systolicBp: numSystolic,
      diastolicBp: numDiastolic,
      pulseBpm: numPulse,
      glucoseMgDl: numGlucose,
      bloodSugarMgDl: numGlucose,
      glucoseContext,
      waterMl: numWater,
      sleepHours: numSleep,
      babyKicksCount: numKicks,
      symptoms: symptomTags,
      symptomCheck,
      energyLevel: 8,
      mood: "Monitored",
      notes,
    };

    try {
      if (editingVitalId) {
        await updateVital(editingVitalId, payload);
        setEditingVitalId(null);
        showToast("Vital record updated & evaluated!");
      } else {
        await addVital(payload);
        showToast("Vitals saved & clinically evaluated!");
      }
      setNotes("");
      setActivePageTab("overview");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setApiError(err.message || "Unable to save health vital. Please check connection.");
      showToast("Could not reach server. Saved locally.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Recharts Data Mapping
  const chartData = [...vitals].reverse().map((v) => {
    return {
      date: v.date ? v.date.slice(5) : "Today",
      weight: v.weightKg,
      systolic: v.systolicBp,
      diastolic: v.diastolicBp,
      pulse: v.pulseBpm || 78,
      map: v.evaluation?.bp?.map || Math.round((v.systolicBp + 2 * v.diastolicBp) / 3),
      glucose: v.glucoseMgDl || v.bloodSugarMgDl || 90,
    };
  });

  // Filtered vitals list for historical table
  const filteredVitals = vitals.filter((v) => {
    if (historyFilter === "all") return true;
    if (historyFilter === "bp") return v.systolicBp > 0;
    if (historyFilter === "glucose") return (v.glucoseMgDl || v.bloodSugarMgDl || 0) > 0;
    if (historyFilter === "alerts") {
      return (
        v.evaluation?.overallStatus === "HIGH" ||
        v.evaluation?.overallStatus === "SEVERE" ||
        v.evaluation?.requiresUrgentAttention
      );
    }
    return true;
  });

  // 48-Hour Consecutive Trend Analysis (Preeclampsia early detection)
  const vitalsTrend: VitalsTrendAnalysis = evaluateVitalsTrend(vitals);

  // Clinical Summary Calculations for Doctor Brief
  const recentVitals = vitals.slice(0, 14);
  const avgSystolic = Math.round(
    recentVitals.reduce((acc, curr) => acc + (curr.systolicBp || 120), 0) / (recentVitals.length || 1)
  );
  const avgDiastolic = Math.round(
    recentVitals.reduce((acc, curr) => acc + (curr.diastolicBp || 80), 0) / (recentVitals.length || 1)
  );
  const avgPulse = Math.round(
    recentVitals.reduce((acc, curr) => acc + (curr.pulseBpm || 78), 0) / (recentVitals.length || 1)
  );
  const avgWater = Math.round(
    recentVitals.reduce((acc, curr) => acc + (curr.waterMl || 2000), 0) / (recentVitals.length || 1)
  );
  const maxSystolic = Math.max(...recentVitals.map((v) => v.systolicBp || 0), 120);
  const maxDiastolic = Math.max(...recentVitals.map((v) => v.diastolicBp || 0), 80);
  const totalAlerts = recentVitals.filter((v) => v.evaluation?.requiresUrgentAttention).length;

  const doctorBriefText = `*BloomNest Maternal Clinical Summary*
Patient: ${user?.name || "Expecting Mother"} | Week ${user?.currentWeek || 24} (Trimester ${user?.trimester || 2})
Reporting Period: Last 14 Days (${recentVitals.length} logs recorded)
--------------------------------------------------
*Cardiovascular & Vitals Profile*:
• Average Blood Pressure: ${avgSystolic}/${avgDiastolic} mmHg (Target: 90-120/60-80)
• Highest Recorded BP: ${maxSystolic}/${maxDiastolic} mmHg
• Mean Arterial Pressure (MAP): ${Math.round((avgSystolic + 2 * avgDiastolic) / 3)} mmHg
• Average Resting Pulse: ${avgPulse} BPM

*Metabolic & Nutrition*:
• Latest Glucose: ${vitals[0]?.glucoseMgDl || vitals[0]?.bloodSugarMgDl || 92} mg/dL (${(vitals[0]?.glucoseContext || "fasting").replace(/_/g, " ")})
• Current Weight: ${vitals[0]?.weightKg || 64.0} kg
• Daily Hydration Average: ${(avgWater / 1000).toFixed(1)} L / day

*Clinical Trend & Safety Shield*:
• 48-Hour Trend Status: ${vitalsTrend.advisoryLevel === "NONE" ? "Stable (No progressive upward drift)" : `${vitalsTrend.advisoryTitle} (${vitalsTrend.advisoryMessage})`}
• High-Risk Symptoms Checked: ${vitals[0]?.symptoms && vitals[0].symptoms.length > 0 ? vitals[0].symptoms.join(", ") : "None reported"}
• Severe Red-Flag Alerts Triggered: ${totalAlerts}
--------------------------------------------------
Generated via BloomNest Maternal Health Companion.`;

  const handleCopyDoctorBrief = () => {
    navigator.clipboard.writeText(doctorBriefText);
    setIsCopied(true);
    showToast("Doctor summary copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Latest backend-evaluated vital entry for Today's Snapshot
  const latestVital = vitals.length > 0 ? vitals[0] : null;
  const latestEval = latestVital?.evaluation;

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300 max-w-7xl mx-auto font-sans">
      
      {/* 1. TOP HEADER & ACTION BAR */}
      <div className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider">
            <Heart className="w-4 h-4" />
            <span>Authoritative Maternal Biometric Screening</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-gray-900 dark:text-rose-100 mt-1">
            Health Vitals & Clinical Monitor
          </h1>
          <p className="text-xs text-gray-500 dark:text-rose-300 mt-1">
            Track blood pressure, heart rate, blood glucose, hydration, and preeclampsia red flags with backend validation.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setShowClinicalGuideModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold hover:bg-purple-100 transition-colors shadow-xs"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Clinical Range Guide</span>
          </button>

          <button
            onClick={() => setShowDoctorReportModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Doctor Brief</span>
          </button>

          <button
            onClick={toggleAudioMute}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl border text-xs font-bold transition-all shadow-xs ${
              isAudioMuted
                ? "bg-gray-100 dark:bg-rose-950/40 border-gray-200 dark:border-rose-900/40 text-gray-600 dark:text-rose-300"
                : "bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-200"
            }`}
            title={isAudioMuted ? "Unmute alert sounds" : "Mute alert sounds"}
          >
            {isAudioMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-gray-500" />
                <span className="hidden sm:inline">Sound: Muted</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                <span className="hidden sm:inline">Sound: Active</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. ELEGANT SEGMENTED TAB NAVIGATION */}
      <div className="flex items-center justify-between border-b border-rose-100 dark:border-rose-900/30 pb-3 gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 sm:gap-2 bg-rose-50/70 dark:bg-rose-950/40 p-1.5 rounded-2xl border border-rose-200/60 dark:border-rose-900/40 overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setActivePageTab("overview")}
            className={`flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
              activePageTab === "overview"
                ? "bg-rose-500 text-white shadow-xs"
                : "text-gray-700 dark:text-rose-200 hover:text-rose-600"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Today's Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePageTab("log")}
            className={`flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
              activePageTab === "log"
                ? "bg-rose-500 text-white shadow-xs"
                : "text-gray-700 dark:text-rose-200 hover:text-rose-600"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{editingVitalId ? "Edit Vital Entry" : "Log Vitals"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePageTab("trends")}
            className={`flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
              activePageTab === "trends"
                ? "bg-rose-500 text-white shadow-xs"
                : "text-gray-700 dark:text-rose-200 hover:text-rose-600"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Trends & Analytics</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePageTab("history")}
            className={`flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
              activePageTab === "history"
                ? "bg-rose-500 text-white shadow-xs"
                : "text-gray-700 dark:text-rose-200 hover:text-rose-600"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>History ({vitals.length})</span>
          </button>
        </div>

        <div className="text-[11px] font-semibold text-gray-500 dark:text-rose-300 hidden md:block">
          {activePageTab === "overview" && "Daily biometric standing & clinical observations"}
          {activePageTab === "log" && "Enter maternal biometrics • Instant obstetric evaluation"}
          {activePageTab === "trends" && "Longitudinal progress curves & gestational averages"}
          {activePageTab === "history" && "Searchable database & doctor brief export"}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: TODAY'S OVERVIEW & STATUS                                         */}
      {/* ========================================================================= */}
      {activePageTab === "overview" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* SEVERE WARNING BANNER */}
          {latestEval?.requiresUrgentAttention && (
            <div className="p-5 rounded-3xl bg-rose-600 text-white font-bold text-xs shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-6 h-6 text-white animate-bounce" />
                </div>
                <div>
                  <div className="text-sm font-black uppercase tracking-wide">
                    Severe-Range Reading Alert
                  </div>
                  <div className="text-xs opacity-95 mt-0.5">
                    {latestEval.bp?.status === "SEVERE"
                      ? latestEval.bp.statusText
                      : latestEval.pulse?.status === "SEVERE"
                      ? latestEval.pulse.statusText
                      : "One or more high-risk symptoms selected. Please contact your OB-GYN or maternity healthcare provider immediately."}
                  </div>
                </div>
              </div>

              <a
                href="tel:108"
                className="px-4 py-2 bg-white text-rose-700 rounded-xl font-bold text-xs hover:bg-rose-50 shadow-sm shrink-0 transition-colors"
              >
                Call Emergency (108)
              </a>
            </div>
          )}

          {/* 48-HOUR CONSECUTIVE TREND ADVISORY BANNER */}
          {vitalsTrend.advisoryLevel !== "NONE" && (
            <div
              className={`p-5 rounded-3xl border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300 ${
                vitalsTrend.advisoryLevel === "WARNING"
                  ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-100"
                  : "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800 text-purple-950 dark:text-purple-100"
              }`}
            >
              <div className="flex items-start sm:items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    vitalsTrend.advisoryLevel === "WARNING"
                      ? "bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200"
                      : "bg-purple-200 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200"
                  }`}
                >
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/80 dark:bg-black/40 border border-current/20">
                      48-Hour Clinical Trend Observation
                    </span>
                    <span className="text-xs font-bold">{vitalsTrend.advisoryTitle}</span>
                  </div>
                  <p className="text-xs opacity-90 leading-relaxed max-w-3xl">
                    {vitalsTrend.advisoryMessage}
                  </p>
                  {vitalsTrend.recommendations.length > 0 && (
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] font-semibold opacity-95">
                      {vitalsTrend.recommendations.map((rec, i) => (
                        <span key={i} className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>{rec}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDoctorReportModal(true)}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-black/40 border border-current/20 font-bold text-xs hover:bg-black/5 dark:hover:bg-white/10 shrink-0 transition-colors shadow-xs"
              >
                Review in Doctor Brief
              </button>
            </div>
          )}

          {/* TODAY'S HEALTH SNAPSHOT (Summary Cards Grid) */}
          <div className="bg-rose-50/80 dark:bg-rose-950/40 p-6 rounded-3xl border border-rose-200/70 dark:border-rose-800/50 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-lg font-bold text-gray-900 dark:text-rose-100 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-rose-500" />
                  <span>Your Health Today</span>
                </h2>
                <p className="text-xs text-gray-600 dark:text-rose-300">
                  {latestVital
                    ? `Latest screening recorded on ${latestVital.date} at ${latestVital.time || "recent"}`
                    : "No vitals recorded yet. Log your first reading below."}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    !latestEval || latestEval.overallStatus === "NORMAL"
                      ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                      : latestEval.overallStatus === "ATTENTION"
                      ? "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                      : "bg-rose-600 text-white shadow-md animate-pulse"
                  }`}
                >
                  {!latestEval || latestEval.overallStatus === "NORMAL"
                    ? "✓ All Targets Met"
                    : latestEval.overallStatus === "ATTENTION"
                    ? "⚠ Attention Suggested"
                    : "⚠ Clinical Warning"}
                </span>

                <button
                  type="button"
                  onClick={() => setActivePageTab("log")}
                  className="px-3.5 py-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Reading</span>
                </button>
              </div>
            </div>

            {/* 6-Grid Snapshot Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* Blood Pressure Snapshot */}
              <div
                className={`p-3.5 rounded-2xl border transition-all ${
                  !latestEval || latestEval.bp?.status === "NORMAL"
                    ? "bg-white dark:bg-[#1a1523] border-emerald-200 dark:border-emerald-900/50"
                    : latestEval.bp?.status === "ATTENTION"
                    ? "bg-amber-50/90 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800"
                    : "bg-rose-500 text-white border-rose-600 shadow-md"
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold opacity-80">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5" /> BP
                  </span>
                  {(!latestEval || latestEval.bp?.status === "NORMAL") && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  {latestEval?.bp?.status === "ATTENTION" && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                  {(latestEval?.bp?.status === "HIGH" || latestEval?.bp?.status === "SEVERE") && <ShieldAlert className="w-3.5 h-3.5" />}
                </div>
                <div className="text-lg font-serif font-black mt-1">
                  {latestVital ? `${latestVital.systolicBp}/${latestVital.diastolicBp}` : "120/80"}
                </div>
                <div className="text-[10px] font-medium mt-0.5 opacity-90 truncate">
                  MAP: {latestEval?.bp?.map || (latestVital ? Math.round((latestVital.systolicBp + 2 * latestVital.diastolicBp) / 3) : 93)} mmHg
                </div>
              </div>

              {/* Pulse / Heart Rate Snapshot */}
              <div
                className={`p-3.5 rounded-2xl border transition-all ${
                  !latestEval?.pulse || latestEval.pulse.status === "NORMAL"
                    ? "bg-white dark:bg-[#1a1523] border-pink-200 dark:border-pink-900/50"
                    : latestEval.pulse.status === "ATTENTION"
                    ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800"
                    : "bg-rose-500 text-white border-rose-600 shadow-md"
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold opacity-80">
                  <span className="flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-rose-500" /> Pulse
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-lg font-serif font-black mt-1">
                  {latestVital?.pulseBpm || 78} <span className="text-[10px] font-normal">bpm</span>
                </div>
                <div className="text-[10px] font-medium mt-0.5 opacity-90 truncate">
                  {latestEval?.pulse?.statusText || "60–100 BPM Normal"}
                </div>
              </div>

              {/* Glucose Snapshot */}
              <div
                className={`p-3.5 rounded-2xl border transition-all ${
                  !latestEval?.glucose || latestEval.glucose.status === "NORMAL"
                    ? "bg-white dark:bg-[#1a1523] border-emerald-200 dark:border-emerald-900/50"
                    : "bg-rose-500 text-white border-rose-600 shadow-md"
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold opacity-80">
                  <span className="flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5" /> Glucose
                  </span>
                  {!latestEval?.glucose || latestEval.glucose.status === "NORMAL" ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5" />
                  )}
                </div>
                <div className="text-lg font-serif font-black mt-1">
                  {latestVital ? `${latestVital.glucoseMgDl || latestVital.bloodSugarMgDl || 92}` : "92"}{" "}
                  <span className="text-[10px] font-normal">mg/dL</span>
                </div>
                <div className="text-[10px] font-medium mt-0.5 capitalize truncate">
                  {latestVital?.glucoseContext ? latestVital.glucoseContext.replace(/_/g, " ") : "fasting"} • {latestEval?.glucose?.statusText || "Target"}
                </div>
              </div>

              {/* Hydration Snapshot */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1a1523] border border-cyan-100 dark:border-cyan-900/40">
                <div className="flex items-center justify-between text-[11px] font-bold text-cyan-700 dark:text-cyan-300">
                  <span className="flex items-center gap-1">
                    <GlassWater className="w-3.5 h-3.5 text-cyan-500" /> Water
                  </span>
                  <button
                    onClick={() => quickAddWater(250)}
                    className="text-[9px] bg-cyan-500 text-white px-1.5 py-0.5 rounded-md font-bold hover:bg-cyan-600"
                  >
                    +250ml
                  </button>
                </div>
                <div className="text-lg font-serif font-black text-gray-900 dark:text-rose-100 mt-1">
                  {((latestVital ? latestVital.waterMl : 2200) / 1000).toFixed(1)} <span className="text-[10px] font-normal">L</span>
                </div>
                <div className="text-[10px] text-gray-500 dark:text-rose-300 mt-0.5 truncate">
                  Target: 2.5 - 3.0 L/day
                </div>
              </div>

              {/* Sleep Snapshot */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1a1523] border border-indigo-100 dark:border-indigo-900/40">
                <div className="flex items-center justify-between text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                  <span className="flex items-center gap-1">
                    <Moon className="w-3.5 h-3.5 text-indigo-500" /> Sleep
                  </span>
                  <span className="text-[9px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded-md font-bold">
                    Rest
                  </span>
                </div>
                <div className="text-lg font-serif font-black text-gray-900 dark:text-rose-100 mt-1">
                  {latestVital ? latestVital.sleepHours : 8.0} <span className="text-[10px] font-normal">hrs</span>
                </div>
                <div className="text-[10px] text-gray-500 dark:text-rose-300 mt-0.5 truncate">
                  Restful night sleep
                </div>
              </div>

              {/* Fetal Kicks Snapshot */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1a1523] border border-purple-100 dark:border-purple-900/40">
                <div className="flex items-center justify-between text-[11px] font-bold text-purple-700 dark:text-purple-300">
                  <span className="flex items-center gap-1">
                    <Footprints className="w-3.5 h-3.5 text-purple-500" /> Kicks
                  </span>
                  <span className="text-[9px] bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded-md font-bold">
                    Active
                  </span>
                </div>
                <div className="text-lg font-serif font-black text-gray-900 dark:text-rose-100 mt-1">
                  {latestVital ? latestVital.babyKicksCount : 12} <span className="text-[10px] font-normal">moves</span>
                </div>
                <div className="text-[10px] text-gray-500 dark:text-rose-300 mt-0.5 truncate">
                  Recorded movement
                </div>
              </div>
            </div>
          </div>

          {/* BP Safe-Zone Spectrum Gauge (Full Width & Spacious) */}
          {(() => {
            const sysNum = latestVital?.systolicBp || 118;
            const diaNum = latestVital?.diastolicBp || 76;
            const mapVal = latestEval?.bp?.map || Math.round((sysNum + 2 * diaNum) / 3);

            let zoneColor = "bg-emerald-500";
            let zoneTextColor = "text-emerald-700 dark:text-emerald-300";
            let zoneBg = "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800";
            let zoneTitle = "Target Maternal Safe Zone (90–120 / 60–80)";
            let zoneSubtitle = "Optimal placental perfusion and healthy maternal hemodynamics.";

            if (sysNum >= 160 || diaNum >= 110) {
              zoneColor = "bg-rose-600";
              zoneTextColor = "text-rose-700 dark:text-rose-300";
              zoneBg = "bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800";
              zoneTitle = "Severe-Range Hypertension (≥160/110)";
              zoneSubtitle = "Clinical emergency threshold. Prompt medical evaluation required.";
            } else if (sysNum >= 140 || diaNum >= 90) {
              zoneColor = "bg-orange-500";
              zoneTextColor = "text-orange-700 dark:text-orange-300";
              zoneBg = "bg-orange-50 dark:bg-orange-950/40 border-orange-300 dark:border-orange-800";
              zoneTitle = "Gestational Hypertension (≥140/90)";
              zoneSubtitle = "Elevated clinical reading. Contact healthcare provider for monitoring.";
            } else if (sysNum > 120 || diaNum > 80) {
              zoneColor = "bg-amber-500";
              zoneTextColor = "text-amber-700 dark:text-amber-300";
              zoneBg = "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800";
              zoneTitle = "Pre-hypertensive / Elevated (121–139 / 81–89)";
              zoneSubtitle = "Above target range. Ensure restful hydration and re-check.";
            } else if ((sysNum > 0 && sysNum < 90) || (diaNum > 0 && diaNum < 60)) {
              zoneColor = "bg-sky-500";
              zoneTextColor = "text-sky-700 dark:text-sky-300";
              zoneBg = "bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800";
              zoneTitle = "Low Blood Pressure (<90/<60)";
              zoneSubtitle = "Ensure fluid hydration and rest on left side to boost circulation.";
            }

            const needlePos = Math.min(Math.max(((sysNum - 70) / (180 - 70)) * 100, 5), 95);

            return (
              <div className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-100 dark:border-rose-900/30 pb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-rose-500" />
                    <div>
                      <h3 className="font-serif font-bold text-base text-gray-900 dark:text-rose-100">
                        BP Safe-Zone Spectrum & Hemodynamics
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-rose-300">
                        Continuous biometric placement based on latest recording ({sysNum}/{diaNum} mmHg)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-3 py-1 rounded-full font-black uppercase tracking-wider ${zoneTextColor} ${zoneBg}`}>
                      MAP: {mapVal > 0 ? `${mapVal} mmHg` : "--"} (70–93 Normal)
                    </span>
                  </div>
                </div>

                <div className="relative pt-4 pb-2">
                  <div className="h-4 w-full rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 via-amber-400 via-orange-500 to-rose-600 shadow-inner relative overflow-hidden" />

                  <div className="relative h-6 w-full">
                    <div
                      className="absolute -top-4 -translate-x-1/2 flex flex-col items-center transition-all duration-500 pointer-events-none"
                      style={{ left: `${needlePos}%` }}
                    >
                      <div className="w-4 h-4 rounded-full bg-white dark:bg-gray-900 border-2 border-gray-900 dark:border-white shadow-lg ring-4 ring-rose-500/20" />
                      <div className="w-0.5 h-3 bg-gray-900 dark:bg-white" />
                    </div>

                    <div className="flex justify-between text-[10px] font-bold text-gray-400 dark:text-rose-300/60 pt-2">
                      <span>&lt;90 Low</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-black">90-120 Target</span>
                      <span className="text-amber-600 dark:text-amber-400">121-139</span>
                      <span className="text-orange-600 dark:text-orange-400">140-159</span>
                      <span className="text-rose-600 dark:text-rose-400">&ge;160 Severe</span>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border ${zoneBg} flex items-start gap-3 mt-2`}>
                  <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${zoneColor} animate-pulse`} />
                  <div className="text-xs">
                    <span className={`font-bold ${zoneTextColor}`}>{zoneTitle}: </span>
                    <span className="text-gray-700 dark:text-rose-200">{zoneSubtitle}</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Fast Navigation Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-[#1a1523] p-5 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-xs flex items-center justify-between gap-3">
              <div>
                <h4 className="font-serif font-bold text-sm text-gray-900 dark:text-rose-100">
                  Ready to log new numbers?
                </h4>
                <p className="text-xs text-gray-500 dark:text-rose-300">
                  Enter blood pressure, glucose, or kicks with deterministic clinical validation.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActivePageTab("log")}
                className="px-4 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-xs shrink-0 flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Vitals</span>
              </button>
            </div>

            <div className="bg-white dark:bg-[#1a1523] p-5 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-xs flex items-center justify-between gap-3">
              <div>
                <h4 className="font-serif font-bold text-sm text-gray-900 dark:text-rose-100">
                  Need to consult your doctor?
                </h4>
                <p className="text-xs text-gray-500 dark:text-rose-300">
                  Export an aggregated 14-day antenatal biometric brief directly to WhatsApp.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDoctorReportModal(true)}
                className="px-4 py-2.5 rounded-2xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-bold text-xs shrink-0 flex items-center gap-1.5 transition-all"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Doctor Brief</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: LOG NEW VITALS (Clean, Spacious, Distraction-Free Form)            */}
      {/* ========================================================================= */}
      {activePageTab === "log" && (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-200">
          
          {/* Edit Mode Notice Banner */}
          {editingVitalId && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 font-bold">
                <Edit3 className="w-4 h-4 text-amber-600" />
                <span>Editing recorded vital entry from {logDate} {logTime}</span>
              </div>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-3 py-1 rounded-xl bg-white dark:bg-amber-900/60 border border-amber-300 text-amber-800 dark:text-amber-200 font-bold text-[11px] hover:bg-amber-100 transition-colors"
              >
                Cancel Edit ✕
              </button>
            </div>
          )}

          {/* API Backend Error Callout */}
          {apiError && (
            <div className="p-4 rounded-2xl bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100 text-xs space-y-1 font-bold">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Unable to save/evaluate your vital right now:</span>
              </div>
              <p className="font-normal text-rose-800 dark:text-rose-200">{apiError}</p>
            </div>
          )}

          {/* Validation Errors Box */}
          {validationErrors.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Please correct the following input errors:</span>
              </div>
              <ul className="list-disc pl-5 space-y-0.5">
                {validationErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Balanced 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            
            {/* Card 1: Cardiovascular & Circulation */}
            <div className="bg-white dark:bg-[#1a1523] p-6 sm:p-7 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-rose-100 dark:border-rose-900/30 pb-3">
                <h3 className="font-serif font-bold text-base text-gray-900 dark:text-rose-100 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>Cardiovascular & Circulation</span>
                </h3>
                <span className="text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950 px-2.5 py-0.5 rounded-full border border-rose-200/50">
                  Target 90–120 / 60–80
                </span>
              </div>

              {/* Date & Time Picker */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700 dark:text-rose-200 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-purple-500" />
                    <span>Reading Date & Time</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleResetToNow}
                    className="text-[10px] font-bold text-purple-600 dark:text-purple-300 hover:underline flex items-center gap-1"
                  >
                    <Clock className="w-3 h-3" />
                    <span>Reset to Now</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <input
                    type="date"
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 font-semibold text-gray-900 dark:text-rose-100 text-xs"
                  />
                  <input
                    type="time"
                    value={logTime}
                    onChange={(e) => setLogTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 font-semibold text-gray-900 dark:text-rose-100 text-xs"
                  />
                </div>
              </div>

              {/* Systolic, Diastolic, Pulse */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-rose-200">
                  Blood Pressure & Heart Rate Readings
                </label>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-500 block mb-1">Systolic (mmHg)</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={systolic}
                      onChange={(e) => setSystolic(cleanIntInput(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 font-black text-base text-gray-900 dark:text-rose-100 placeholder:text-gray-400"
                      placeholder="118"
                      maxLength={3}
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-500 block mb-1">Diastolic (mmHg)</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={diastolic}
                      onChange={(e) => setDiastolic(cleanIntInput(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 font-black text-base text-gray-900 dark:text-rose-100 placeholder:text-gray-400"
                      placeholder="76"
                      maxLength={3}
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-500 block mb-1">Pulse (BPM)</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={pulse}
                      onChange={(e) => setPulse(cleanIntInput(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 font-black text-base text-gray-900 dark:text-rose-100 placeholder:text-gray-400"
                      placeholder="78"
                      maxLength={3}
                    />
                  </div>
                </div>
              </div>

              {/* Real-Time Category & MAP Status Pill (Live Feedback) */}
              {(() => {
                const sysNum = parseInt(systolic, 10) || 0;
                const diaNum = parseInt(diastolic, 10) || 0;
                const mapVal = Math.round((sysNum + 2 * diaNum) / 3);

                let statusBadge = {
                  bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
                  text: "text-emerald-700 dark:text-emerald-300",
                  label: "Target Maternal Safe Zone (90–120 / 60–80)",
                  icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
                };

                if (sysNum >= 160 || diaNum >= 110) {
                  statusBadge = {
                    bg: "bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800",
                    text: "text-rose-700 dark:text-rose-300",
                    label: "Severe-Range Hypertension (≥160/110) • Emergency Care Needed",
                    icon: <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 animate-pulse" />,
                  };
                } else if (sysNum >= 140 || diaNum >= 90) {
                  statusBadge = {
                    bg: "bg-orange-50 dark:bg-orange-950/40 border-orange-300 dark:border-orange-800",
                    text: "text-orange-700 dark:text-orange-300",
                    label: "Gestational Hypertension (≥140/90) • Clinical Monitoring Suggested",
                    icon: <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0" />,
                  };
                } else if (sysNum > 120 || diaNum > 80) {
                  statusBadge = {
                    bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800",
                    text: "text-amber-700 dark:text-amber-300",
                    label: "Elevated / Pre-hypertensive (121–139 / 81–89)",
                    icon: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />,
                  };
                } else if ((sysNum > 0 && sysNum < 90) || (diaNum > 0 && diaNum < 60)) {
                  statusBadge = {
                    bg: "bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800",
                    text: "text-sky-700 dark:text-sky-300",
                    label: "Low Blood Pressure (<90/<60) • Rest on Left Side & Hydrate",
                    icon: <Info className="w-4 h-4 text-sky-600 shrink-0" />,
                  };
                }

                return (
                  <div className={`p-3 rounded-2xl border ${statusBadge.bg} flex items-center justify-between gap-2 text-xs transition-all`}>
                    <div className="flex items-center gap-2 min-w-0">
                      {statusBadge.icon}
                      <span className={`font-bold truncate ${statusBadge.text}`}>{statusBadge.label}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-gray-600 dark:text-rose-200 bg-white/80 dark:bg-black/40 px-2 py-0.5 rounded-md shrink-0">
                      MAP: {mapVal > 0 ? `${mapVal} mmHg` : "--"}
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* Card 2: Metabolic, Nutrition & Symptoms */}
            <div className="bg-white dark:bg-[#1a1523] p-6 sm:p-7 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-rose-100 dark:border-rose-900/30 pb-3">
                <h3 className="font-serif font-bold text-base text-gray-900 dark:text-rose-100 flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-amber-500" />
                  <span>Metabolic & Maternal Wellness</span>
                </h3>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 px-2.5 py-0.5 rounded-full border border-amber-200/50">
                  Glucose, Weight & Symptoms
                </span>
              </div>

              {/* Blood Glucose & Context Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-rose-200 mb-1">
                    Blood Glucose (mg/dL)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={glucose}
                    onChange={(e) => setGlucose(cleanIntInput(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 font-black text-base text-gray-900 dark:text-rose-100 placeholder:text-gray-400"
                    placeholder="92"
                    maxLength={3}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-rose-200 mb-1">
                    Timing Context
                  </label>
                  <select
                    value={glucoseContext}
                    onChange={(e: any) => setGlucoseContext(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 font-bold text-xs text-gray-900 dark:text-rose-100"
                  >
                    <option value="fasting">Fasting (&lt;95 mg/dL)</option>
                    <option value="1h_post_meal">1 Hour Post-Meal (&lt;140 mg/dL)</option>
                    <option value="2h_post_meal">2 Hours Post-Meal (&lt;120 mg/dL)</option>
                    <option value="postprandial">Random / Other</option>
                  </select>
                </div>
              </div>

              {/* Weight & Hydration */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-gray-600 dark:text-rose-300 mb-1 flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5 text-pink-500" /> Weight (kg)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={weight}
                    onChange={(e) => setWeight(cleanFloatInput(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 font-bold text-gray-900 dark:text-rose-100"
                    placeholder="64.8"
                    maxLength={5}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-600 dark:text-rose-300 mb-1 flex items-center gap-1">
                    <GlassWater className="w-3.5 h-3.5 text-cyan-500" /> Fluid Intake (mL)
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={water}
                      onChange={(e) => setWater(cleanIntInput(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 font-bold text-gray-900 dark:text-rose-100"
                      placeholder="2200"
                      maxLength={5}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const current = parseInt(water, 10) || 0;
                        setWater(String(current + 250));
                        quickAddWater(250);
                      }}
                      className="px-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-bold text-[10px] shrink-0 transition-colors"
                      title="Add 250ml"
                    >
                      +250
                    </button>
                  </div>
                </div>
              </div>

              {/* Sleep & Kicks */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-gray-600 dark:text-rose-300 mb-1 flex items-center gap-1">
                    <Moon className="w-3.5 h-3.5 text-indigo-500" /> Sleep Duration (hrs)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={sleep}
                    onChange={(e) => setSleep(cleanFloatInput(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 font-bold text-gray-900 dark:text-rose-100"
                    placeholder="8.0"
                    maxLength={4}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-600 dark:text-rose-300 mb-1 flex items-center gap-1">
                    <Footprints className="w-3.5 h-3.5 text-purple-500" /> Baby Kicks Today
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={kicks}
                    onChange={(e) => setKicks(cleanIntInput(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 font-bold text-gray-900 dark:text-rose-100"
                    placeholder="12"
                    maxLength={3}
                  />
                </div>
              </div>

              {/* Modern Interactive Pill Chips for Symptom Screening */}
              <div className="space-y-2 border-t border-rose-100 dark:border-rose-900/30 pt-3">
                <label className="block text-xs font-bold text-gray-700 dark:text-rose-200 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                  <span>Preeclampsia Symptom Safety Check</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { key: "headache" as const, label: "Persistent Headache" },
                    { key: "visionChanges" as const, label: "Vision Changes / Spots" },
                    { key: "upperAbdominalPain" as const, label: "Upper Abdominal Pain" },
                    { key: "breathingDifficulty" as const, label: "Shortness of Breath" },
                    { key: "unusualSwelling" as const, label: "Sudden Facial Swelling" },
                  ].map((opt) => {
                    const isSelected = symptomCheck[opt.key];
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => handleSymptomToggle(opt.key)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between border transition-all text-left ${
                          isSelected
                            ? "bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200 ring-2 ring-rose-500/20"
                            : "bg-gray-50/70 dark:bg-gray-900/30 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300"
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="text-[11px]">{opt.label}</span>
                        </span>
                        {isSelected ? (
                          <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-gray-300 dark:border-gray-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-semibold text-xs text-gray-600 dark:text-rose-300 mb-1">
                  Clinical Notes & Personal Memo
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Active kicks after lunch. Hydrated well today."
                  className="w-full px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-xs text-gray-900 dark:text-rose-100"
                />
              </div>
            </div>
          </div>

          {/* Full-Width Save Bar */}
          <div className="bg-white dark:bg-[#1a1523] p-4 sm:p-5 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-500 dark:text-rose-300 text-center sm:text-left">
              Deterministic obstetric evaluation ensures zero hallucination & instant maternal biometric analysis.
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {editingVitalId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-5 py-3 rounded-2xl border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-200 font-bold text-xs hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  Cancel Edit
                </button>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all active:scale-[0.99] disabled:opacity-50"
              >
                {isSubmitting
                  ? "Evaluating via Clinical Authority..."
                  : editingVitalId
                  ? "Update Vital Entry"
                  : "Save & Evaluate Health Vitals"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: HEALTH TRENDS & ANALYTICS */}
      {activePageTab === "trends" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Executive Trend Summary Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#1a1523] border border-rose-100 dark:border-rose-900/40 shadow-xs text-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase">14-Day Average BP</span>
              <div className="text-xl font-serif font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                {avgSystolic}/{avgDiastolic} <span className="text-xs font-normal text-gray-400">mmHg</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#1a1523] border border-rose-100 dark:border-rose-900/40 shadow-xs text-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase">Mean Arterial MAP</span>
              <div className="text-xl font-serif font-bold text-cyan-600 dark:text-cyan-400 mt-0.5">
                {Math.round((avgSystolic + 2 * avgDiastolic) / 3)} <span className="text-xs font-normal text-gray-400">mmHg</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#1a1523] border border-rose-100 dark:border-rose-900/40 shadow-xs text-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase">Mean Resting Pulse</span>
              <div className="text-xl font-serif font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {avgPulse} <span className="text-xs font-normal text-gray-400">BPM</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#1a1523] border border-rose-100 dark:border-rose-900/40 shadow-xs text-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase">Fluid Adherence</span>
              <div className="text-xl font-serif font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                {(avgWater / 1000).toFixed(1)} <span className="text-xs font-normal text-gray-400">L / day</span>
              </div>
            </div>
          </div>

          {/* Full Width Recharts Curve */}
          <div className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-100 dark:border-rose-900/30 pb-4">
              <div>
                <h3 className="font-serif font-bold text-base text-gray-900 dark:text-rose-100 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-rose-500" />
                  <span>Longitudinal Biometric Trajectory</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-rose-300">
                  Select a metric below to visualize physiological maternal trends over time.
                </p>
              </div>

              {/* Chart Tabs */}
              <div className="flex flex-wrap bg-rose-50/70 dark:bg-rose-950/40 p-1 rounded-2xl border border-rose-200/60 dark:border-rose-900/40 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveChartTab("bp")}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    activeChartTab === "bp"
                      ? "bg-rose-500 text-white shadow-xs"
                      : "text-gray-600 dark:text-rose-300 hover:text-rose-600"
                  }`}
                >
                  BP & MAP
                </button>

                <button
                  type="button"
                  onClick={() => setActiveChartTab("weight")}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    activeChartTab === "weight"
                      ? "bg-rose-500 text-white shadow-xs"
                      : "text-gray-600 dark:text-rose-300 hover:text-rose-600"
                  }`}
                >
                  Weight Trend
                </button>

                <button
                  type="button"
                  onClick={() => setActiveChartTab("pulse")}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    activeChartTab === "pulse"
                      ? "bg-rose-500 text-white shadow-xs"
                      : "text-gray-600 dark:text-rose-300 hover:text-rose-600"
                  }`}
                >
                  Pulse (BPM)
                </button>

                <button
                  type="button"
                  onClick={() => setActiveChartTab("glucose")}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    activeChartTab === "glucose"
                      ? "bg-rose-500 text-white shadow-xs"
                      : "text-gray-600 dark:text-rose-300 hover:text-rose-600"
                  }`}
                >
                  Glucose
                </button>
              </div>
            </div>

            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis domain={["dataMin - 2", "dataMax + 2"]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />

                  {activeChartTab === "weight" && (
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="#ec4899"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      name="Weight (kg)"
                    />
                  )}

                  {activeChartTab === "bp" && (
                    <>
                      <Line
                        type="monotone"
                        dataKey="systolic"
                        stroke="#f43f5e"
                        strokeWidth={2.5}
                        dot={{ r: 4 }}
                        name="Systolic BP (mmHg)"
                      />
                      <Line
                        type="monotone"
                        dataKey="diastolic"
                        stroke="#8b5cf6"
                        strokeWidth={2.5}
                        dot={{ r: 4 }}
                        name="Diastolic BP (mmHg)"
                      />
                      <Line
                        type="monotone"
                        dataKey="map"
                        stroke="#06b6d4"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={{ r: 4 }}
                        name="Calculated MAP (mmHg)"
                      />
                    </>
                  )}

                  {activeChartTab === "pulse" && (
                    <Line
                      type="monotone"
                      dataKey="pulse"
                      stroke="#e11d48"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      name="Pulse / Heart Rate (BPM)"
                    />
                  )}

                  {activeChartTab === "glucose" && (
                    <Line
                      type="monotone"
                      dataKey="glucose"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      name="Glucose (mg/dL)"
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HISTORICAL RECORDS & DOCTOR BRIEF */}
      {activePageTab === "history" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-100 dark:border-rose-900/30 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-rose-100 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-rose-500" />
                  <span>Recorded Clinical History ({filteredVitals.length})</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-rose-300">
                  Complete time-series records of blood pressure, blood glucose, weight, and safety checks.
                </p>
              </div>

              {/* Quick Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1 bg-rose-50/70 dark:bg-rose-950/40 p-1 rounded-2xl border border-rose-200/60 dark:border-rose-900/40 text-xs font-bold">
                <button
                  onClick={() => setHistoryFilter("all")}
                  className={`px-3 py-1 rounded-xl transition-all ${
                    historyFilter === "all" ? "bg-rose-500 text-white shadow-xs" : "text-gray-600 dark:text-rose-300 hover:bg-rose-100"
                  }`}
                >
                  All Logs ({vitals.length})
                </button>
                <button
                  onClick={() => setHistoryFilter("bp")}
                  className={`px-3 py-1 rounded-xl transition-all ${
                    historyFilter === "bp" ? "bg-rose-500 text-white shadow-xs" : "text-gray-600 dark:text-rose-300 hover:bg-rose-100"
                  }`}
                >
                  BP & Pulse
                </button>
                <button
                  onClick={() => setHistoryFilter("glucose")}
                  className={`px-3 py-1 rounded-xl transition-all ${
                    historyFilter === "glucose" ? "bg-rose-500 text-white shadow-xs" : "text-gray-600 dark:text-rose-300 hover:bg-rose-100"
                  }`}
                >
                  Glucose
                </button>
                <button
                  onClick={() => setHistoryFilter("alerts")}
                  className={`px-3 py-1 rounded-xl transition-all ${
                    historyFilter === "alerts" ? "bg-rose-500 text-white shadow-xs" : "text-gray-600 dark:text-rose-300 hover:bg-rose-100"
                  }`}
                >
                  Alerts Only
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-rose-100 dark:border-rose-900/30 text-gray-500 dark:text-rose-300 font-bold uppercase">
                    <th className="py-2.5 px-3">Date & Time</th>
                    <th className="py-2.5 px-3">BP & Pulse</th>
                    <th className="py-2.5 px-3">BP Status</th>
                    <th className="py-2.5 px-3">Glucose</th>
                    <th className="py-2.5 px-3">Glucose Status</th>
                    <th className="py-2.5 px-3">Weight & Water</th>
                    <th className="py-2.5 px-3">Sleep / Kicks</th>
                    <th className="py-2.5 px-3">Symptoms / Notes</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-50 dark:divide-rose-950/40">
                  {filteredVitals.map((v) => {
                    const evalData = v.evaluation;
                    const isCurrentEdit = editingVitalId === v.id;
                    return (
                      <tr
                        key={v.id}
                        className={`transition-colors ${
                          isCurrentEdit
                            ? "bg-amber-50/70 dark:bg-amber-950/30"
                            : "hover:bg-rose-50/40 dark:hover:bg-rose-950/20"
                        }`}
                      >
                        <td className="py-3 px-3 font-mono font-bold text-gray-900 dark:text-rose-100 whitespace-nowrap">
                          {v.date}
                          {v.time && <span className="block text-[10px] text-gray-400 font-normal">{v.time}</span>}
                        </td>

                        <td className="py-3 px-3 font-semibold text-gray-800 dark:text-rose-200 whitespace-nowrap">
                          {v.systolicBp}/{v.diastolicBp} mmHg <br />
                          <span className="text-[10px] text-gray-500 font-normal">
                            Pulse: {v.pulseBpm || 78} bpm • MAP: {evalData?.bp?.map || Math.round((v.systolicBp + 2 * v.diastolicBp) / 3)}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              !evalData || evalData.bp?.status === "NORMAL"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : evalData.bp?.status === "ATTENTION"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                : "bg-rose-600 text-white"
                            }`}
                          >
                            {!evalData || evalData.bp?.status === "NORMAL"
                              ? "✓ Target"
                              : evalData.bp?.status === "ATTENTION"
                              ? "⚠ Attention"
                              : "⚠ High/Severe"}
                          </span>
                        </td>

                        <td className="py-3 px-3 capitalize font-medium text-gray-700 dark:text-rose-300 whitespace-nowrap">
                          {v.glucoseMgDl || v.bloodSugarMgDl ? `${v.glucoseMgDl || v.bloodSugarMgDl} mg/dL` : "N/A"}{" "}
                          <br />
                          <span className="text-[10px] text-gray-400">({(v.glucoseContext || "fasting").replace(/_/g, " ")})</span>
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              !evalData?.glucose || evalData.glucose.status === "NORMAL"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-rose-600 text-white"
                            }`}
                          >
                            {!evalData?.glucose || evalData.glucose.status === "NORMAL" ? "✓ Target" : "⚠ Above Target"}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-gray-700 dark:text-rose-300 whitespace-nowrap">
                          {v.weightKg} kg • {(v.waterMl / 1000).toFixed(1)} L
                        </td>

                        <td className="py-3 px-3 text-gray-700 dark:text-rose-300 whitespace-nowrap">
                          {v.sleepHours}h • {v.babyKicksCount} kicks
                        </td>

                        <td className="py-3 px-3 text-gray-600 dark:text-rose-300 max-w-xs truncate">
                          {v.symptoms && v.symptoms.length > 0 ? v.symptoms.join(", ") : "Normal"}
                          {v.notes && <span className="block text-[10px] text-gray-400 truncate">{v.notes}</span>}
                        </td>

                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleStartEdit(v)}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                              title="Edit Vital Entry"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteVital(v.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="Delete Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredVitals.length === 0 && (
                <div className="p-8 text-center text-gray-500 dark:text-rose-300 text-xs">
                  No vital records match the selected filter.
                </div>
              )}
            </div>
          </div>

          {/* Integrated 14-Day Doctor Brief Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#1a1523] border border-rose-100 dark:border-rose-900/40 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-rose-500" />
                <h4 className="font-serif font-bold text-sm text-gray-900 dark:text-rose-100">
                  Antenatal Teleconsultation Summary Ready
                </h4>
              </div>
              <p className="text-xs text-gray-500 dark:text-rose-300">
                14-day aggregated blood pressure, glucose curve, hydration pace, and symptom audit formatted for OB-GYN review.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyDoctorBrief}
                className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors"
              >
                {isCopied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                <span>{isCopied ? "Copied to Clipboard!" : "Copy for WhatsApp"}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowDoctorReportModal(true)}
                className="px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-200 font-bold text-xs hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
              >
                View Full Brief
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. DOCTOR BRIEF MODAL */}
      {showDoctorReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1a1523] rounded-3xl border border-rose-200 dark:border-rose-900/50 shadow-2xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-rose-100 dark:border-rose-900/30 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-600">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-gray-900 dark:text-rose-100">
                    Clinical Vitals Brief (Doctor Share)
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-rose-300">
                    Formatted 14-day maternal trajectory for your OB-GYN consultation
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDoctorReportModal(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-rose-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formatted Report Card */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#120E18] border border-gray-200 dark:border-rose-900/40 font-mono text-xs text-gray-800 dark:text-rose-200 whitespace-pre-wrap leading-relaxed">
              {doctorBriefText}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl border border-gray-300 dark:border-rose-900/50 text-xs font-bold text-gray-700 dark:text-rose-200 hover:bg-gray-100 dark:hover:bg-rose-950/40 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Log</span>
              </button>

              <button
                onClick={handleCopyDoctorBrief}
                className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors"
              >
                {isCopied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                <span>{isCopied ? "Copied!" : "Copy for WhatsApp"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. CLINICAL RANGE GUIDE MODAL */}
      {showClinicalGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1a1523] rounded-3xl border border-purple-200 dark:border-purple-900/50 shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-purple-100 dark:border-purple-900/30 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-gray-900 dark:text-purple-100">
                    Maternal Obstetric Range & Vitals Guide
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-rose-300">
                    Evidence-based clinical thresholds and reasons for prenatal monitoring
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowClinicalGuideModal(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-purple-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-gray-700 dark:text-rose-200 leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30 space-y-1">
                <h4 className="font-bold text-gray-900 dark:text-rose-100 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <span>Blood Pressure & Mean Arterial Pressure (MAP)</span>
                </h4>
                <p>
                  <strong>Normal in Pregnancy:</strong> Systolic 90–129 mmHg and Diastolic ≤ 84 mmHg (ideal: 110–120 / 70–80 mmHg).
                  <br />
                  <strong>Attention / Mild Elevation:</strong> Systolic 130–139 mmHg or Diastolic 85–89 mmHg.
                  <br />
                  <strong>Gestational Hypertension:</strong> Systolic ≥ 140 mmHg or Diastolic ≥ 90 mmHg.
                  <br />
                  <strong>Severe Range:</strong> Systolic ≥ 160 or Diastolic ≥ 110 mmHg.
                  <br />
                  <strong>MAP Formula:</strong> <code>(Systolic + 2 * Diastolic) / 3</code>. MAP represents average arterial perfusion pressure (normal 70–95 mmHg). A persistent MAP above 105 mmHg in the 2nd trimester is a clinical indicator for preeclampsia surveillance.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-pink-50/50 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-900/30 space-y-1">
                <h4 className="font-bold text-gray-900 dark:text-pink-100 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-pink-500" />
                  <span>Maternal Pulse & Heart Rate Changes</span>
                </h4>
                <p>
                  During pregnancy, your total blood volume expands by 40–50%. To pump this extra oxygen to your growing baby, resting heart rate naturally rises by 10–15 beats per minute (normal range: <strong>60–100 BPM</strong>, up to 110 during peak 3rd trimester).
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30 space-y-1">
                <h4 className="font-bold text-gray-900 dark:text-amber-100 flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                  <span>Gestational Diabetes (GDM) Targets</span>
                </h4>
                <p>
                  Because placental hormones create physiological insulin resistance:
                  <br />
                  • <strong>Fasting Blood Sugar:</strong> &lt; 95 mg/dL
                  <br />
                  • <strong>1-Hour Post Meal:</strong> &lt; 140 mg/dL
                  <br />
                  • <strong>2-Hours Post Meal:</strong> &lt; 120 mg/dL
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-red-50/70 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 space-y-1">
                <h4 className="font-bold text-red-900 dark:text-red-200 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                  <span>When to Seek Immediate Medical Care (Call 108)</span>
                </h4>
                <p>
                  Seek emergency triage immediately if BP is ≥ 160/110 mmHg or if high BP is accompanied by severe persistent headache, vision spots, right-upper abdominal pain under ribs, or sudden facial swelling.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowClinicalGuideModal(false)}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700"
              >
                Understood, Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default HealthTrackerPage;
