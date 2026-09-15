import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { HealthVital, GlucoseContext, SymptomSafetyCheck } from "../types";
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
    window.scrollTo({ top: 380, behavior: "smooth" });
    showToast(`Editing vital record from ${vital.date} ✏️`);
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
      showToast(`⚠️ ${errors[0]}`);
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
      } else {
        await addVital(payload);
      }
      setNotes("");
    } catch (err: any) {
      setApiError(err.message || "Unable to save health vital. Please check connection.");
      showToast("⚠️ Could not reach server. Saved locally.");
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
  const maxSystolic = Math.max(...recentVitals.map((v) => v.systolicBp || 0), 120);
  const maxDiastolic = Math.max(...recentVitals.map((v) => v.diastolicBp || 0), 80);
  const totalAlerts = recentVitals.filter((v) => v.evaluation?.requiresUrgentAttention).length;

  const doctorBriefText = `🩺 BloomNest Clinical Vitals Summary (14-Day Log)
Patient: ${user?.name || "Expecting Mother"} | Gestational Week: ${user?.currentWeek || 24}
--------------------------------------------------
• Average Blood Pressure: ${avgSystolic}/${avgDiastolic} mmHg (Avg Pulse: ${avgPulse} BPM)
• Highest Recorded BP: ${maxSystolic}/${maxDiastolic} mmHg
• Mean Arterial Pressure (MAP Avg): ${Math.round((avgSystolic + 2 * avgDiastolic) / 3)} mmHg
• Recent Fasting Blood Sugar: ${vitals[0]?.glucoseMgDl || vitals[0]?.bloodSugarMgDl || 92} mg/dL (${(vitals[0]?.glucoseContext || "fasting").replace(/_/g, " ")})
• Severe Urgency Alerts Triggered: ${totalAlerts}
• Recent Symptoms Logged: ${vitals[0]?.symptoms?.join(", ") || "None"}
--------------------------------------------------
Generated via BloomNest Authoritative Maternal Health Platform.`;

  const handleCopyDoctorBrief = () => {
    navigator.clipboard.writeText(doctorBriefText);
    setIsCopied(true);
    showToast("Doctor summary copied to clipboard! 📋");
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
            <span>Clinical Range Guide 📖</span>
          </button>

          <button
            onClick={() => setShowDoctorReportModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Doctor Brief 📲</span>
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

      {/* 2. TODAY'S HEALTH SNAPSHOT (Summary Cards Grid) */}
      <div className="bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-purple-500/10 dark:from-rose-950/40 dark:via-pink-950/20 dark:to-purple-950/40 p-6 rounded-3xl border border-rose-200/70 dark:border-rose-800/50 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-bold text-gray-900 dark:text-rose-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose-500" />
              <span>Your Health Today</span>
            </h2>
            <p className="text-xs text-gray-600 dark:text-rose-300">
              Maternal vitals and physiological screening based on latest clinical entry
            </p>
          </div>

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
              {latestVital ? `${latestVital.systolicBp}/${latestVital.diastolicBp}` : `${systolic || 120}/${diastolic || 80}`}
            </div>
            <div className="text-[10px] font-medium mt-0.5 opacity-90 truncate">
              MAP: {latestEval?.bp?.map || Math.round(((parseInt(systolic, 10) || 120) + 2 * (parseInt(diastolic, 10) || 80)) / 3)} mmHg
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
                <Activity className="w-3.5 h-3.5 text-rose-500" /> Pulse (BPM)
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-lg font-serif font-black mt-1">
              {latestVital?.pulseBpm || pulse} <span className="text-[10px] font-normal">bpm</span>
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
              {latestVital ? `${latestVital.glucoseMgDl || latestVital.bloodSugarMgDl || 92}` : `${glucose}`}{" "}
              <span className="text-[10px] font-normal">mg/dL</span>
            </div>
            <div className="text-[10px] font-medium mt-0.5 capitalize truncate">
              {latestVital?.glucoseContext ? latestVital.glucoseContext.replace(/_/g, " ") : glucoseContext.replace(/_/g, " ")} • {latestEval?.glucose?.statusText || "Target"}
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
              {((latestVital ? latestVital.waterMl : water) / 1000).toFixed(1)} <span className="text-[10px] font-normal">L</span>
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
              {latestVital ? latestVital.sleepHours : sleep} <span className="text-[10px] font-normal">hrs</span>
            </div>
            <div className="text-[10px] text-gray-500 dark:text-rose-300 mt-0.5 truncate">
              Restful night sleep
            </div>
          </div>

          {/* Fetal Kicks Snapshot */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1a1523] border border-purple-100 dark:border-purple-900/40">
            <div className="flex items-center justify-between text-[11px] font-bold text-purple-700 dark:text-purple-300">
              <span className="flex items-center gap-1">
                <Footprints className="w-3.5 h-3.5 text-purple-500" /> Baby Kicks
              </span>
              <span className="text-[9px] bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded-md font-bold">
                Active
              </span>
            </div>
            <div className="text-lg font-serif font-black text-gray-900 dark:text-rose-100 mt-1">
              {latestVital ? latestVital.babyKicksCount : kicks} <span className="text-[10px] font-normal">movements</span>
            </div>
            <div className="text-[10px] text-gray-500 dark:text-rose-300 mt-0.5 truncate">
              Recorded movement
            </div>
          </div>
        </div>
      </div>

      {/* SEVERE WARNING BANNER */}
      {latestEval?.requiresUrgentAttention && (
        <div className="p-5 rounded-3xl bg-rose-600 text-white font-bold text-xs shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 text-white animate-bounce" />
            </div>
            <div>
              <div className="text-sm font-black uppercase tracking-wide">
                ⚠️ Severe-Range Reading Alert
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

      {/* 3. GRID: LOGGER FORM + RECHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LOGGER FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-5"
        >
          {/* Form Header / Edit Mode Indicator */}
          <div className="border-b border-rose-100 dark:border-rose-900/30 pb-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-900 dark:text-rose-100 flex items-center gap-2">
                {editingVitalId ? <Edit3 className="w-4 h-4 text-amber-500" /> : <Plus className="w-4 h-4 text-rose-500" />}
                <span>{editingVitalId ? "Edit Vitals Record" : "Log Clinical Biometrics"}</span>
              </h3>
              <span className="text-[10px] text-rose-500 font-bold">Backend Authority API</span>
            </div>

            {editingVitalId && (
              <div className="mt-2.5 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between text-xs text-amber-800 dark:text-amber-200">
                <span className="font-medium text-[11px]">Editing past record #{String(editingVitalId).slice(-4)}</span>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-[11px] font-bold text-rose-600 hover:underline"
                >
                  Cancel Edit ✕
                </button>
              </div>
            )}
          </div>

          {/* Date & Time Picker Row */}
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

          {/* Blood Pressure & Pulse Inputs */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700 dark:text-rose-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500" /> BP & Heart Rate
              </span>
              <span className="text-[10px] font-normal text-gray-400">
                MAP: {Math.round(((parseInt(systolic, 10) || 120) + 2 * (parseInt(diastolic, 10) || 80)) / 3)} mmHg
              </span>
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-gray-500">Systolic (mmHg)</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={systolic}
                  onChange={(e) => setSystolic(cleanIntInput(e.target.value))}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 font-extrabold text-gray-900 dark:text-rose-100 placeholder:text-gray-400 dark:placeholder:text-rose-400/40"
                  placeholder="118"
                  maxLength={3}
                />
              </div>

              <div>
                <span className="text-[10px] text-gray-500">Diastolic (mmHg)</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={diastolic}
                  onChange={(e) => setDiastolic(cleanIntInput(e.target.value))}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 font-extrabold text-gray-900 dark:text-rose-100 placeholder:text-gray-400 dark:placeholder:text-rose-400/40"
                  placeholder="76"
                  maxLength={3}
                />
              </div>

              <div>
                <span className="text-[10px] text-gray-500">Pulse (BPM)</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={pulse}
                  onChange={(e) => setPulse(cleanIntInput(e.target.value))}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 font-extrabold text-gray-900 dark:text-rose-100 placeholder:text-gray-400 dark:placeholder:text-rose-400/40"
                  placeholder="78"
                  maxLength={3}
                />
              </div>
            </div>
          </div>

          {/* Blood Glucose & Context Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700 dark:text-rose-200 flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-amber-500" /> Blood Glucose (mg/dL)
            </label>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-gray-500">Glucose Value</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={glucose}
                  onChange={(e) => setGlucose(cleanIntInput(e.target.value))}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 font-extrabold text-gray-900 dark:text-rose-100 placeholder:text-gray-400 dark:placeholder:text-rose-400/40"
                  placeholder="92"
                  maxLength={3}
                />
              </div>

              <div>
                <span className="text-[10px] text-gray-500">Timing Context</span>
                <select
                  value={glucoseContext}
                  onChange={(e: any) => setGlucoseContext(e.target.value)}
                  className="w-full mt-1 px-2.5 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 font-bold text-xs text-gray-900 dark:text-rose-100"
                >
                  <option value="fasting">Fasting (&lt;95)</option>
                  <option value="1h_post_meal">1-hour post meal (&lt;140)</option>
                  <option value="2h_post_meal">2-hours post meal (&lt;120)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Weight & Hydration */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-gray-600 dark:text-rose-300 mb-1 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-rose-500" /> Weight (kg)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={weight}
                onChange={(e) => setWeight(cleanFloatInput(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 font-bold text-gray-900 dark:text-rose-100 placeholder:text-gray-400 dark:placeholder:text-rose-400/40"
                placeholder="64.8"
                maxLength={5}
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-600 dark:text-rose-300 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <GlassWater className="w-3.5 h-3.5 text-cyan-500" /> Water (mL)
                </span>
              </label>
              <div className="flex gap-1">
                <input
                  type="text"
                  inputMode="numeric"
                  value={water}
                  onChange={(e) => setWater(cleanIntInput(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 font-bold text-gray-900 dark:text-rose-100 placeholder:text-gray-400 dark:placeholder:text-rose-400/40"
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
                  className="px-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-bold text-[10px] shrink-0"
                  title="Add 250ml"
                >
                  +250
                </button>
              </div>
            </div>
          </div>

          {/* Sleep & Kick Count */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-gray-600 dark:text-rose-300 mb-1 flex items-center gap-1">
                <Moon className="w-3.5 h-3.5 text-indigo-500" /> Sleep (hrs)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={sleep}
                onChange={(e) => setSleep(cleanFloatInput(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 font-bold text-gray-900 dark:text-rose-100 placeholder:text-gray-400 dark:placeholder:text-rose-400/40"
                placeholder="8.0"
                maxLength={4}
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-600 dark:text-rose-300 mb-1 flex items-center gap-1">
                <Footprints className="w-3.5 h-3.5 text-purple-500" /> Baby Kicks
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={kicks}
                onChange={(e) => setKicks(cleanIntInput(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 font-bold text-gray-900 dark:text-rose-100 placeholder:text-gray-400 dark:placeholder:text-rose-400/40"
                placeholder="12"
                maxLength={3}
              />
            </div>
          </div>

          {/* Symptom Safety Screening Checkboxes */}
          <div className="space-y-2 border-t border-rose-100 dark:border-rose-900/30 pt-3">
            <label className="block text-xs font-bold text-gray-700 dark:text-rose-200 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" /> Symptom Safety Screening
            </label>
            <div className="space-y-1.5 text-xs text-gray-600 dark:text-rose-300">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={symptomCheck.headache}
                  onChange={() => handleSymptomToggle("headache")}
                  className="rounded border-rose-300 text-rose-600 focus:ring-rose-500"
                />
                <span>Persistent or unusually severe headache</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={symptomCheck.visionChanges}
                  onChange={() => handleSymptomToggle("visionChanges")}
                  className="rounded border-rose-300 text-rose-600 focus:ring-rose-500"
                />
                <span>Vision changes (blurriness or spots before eyes)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={symptomCheck.upperAbdominalPain}
                  onChange={() => handleSymptomToggle("upperAbdominalPain")}
                  className="rounded border-rose-300 text-rose-600 focus:ring-rose-500"
                />
                <span>Upper abdominal or under-rib pain</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={symptomCheck.breathingDifficulty}
                  onChange={() => handleSymptomToggle("breathingDifficulty")}
                  className="rounded border-rose-300 text-rose-600 focus:ring-rose-500"
                />
                <span>Shortness of breath or difficulty breathing</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={symptomCheck.unusualSwelling}
                  onChange={() => handleSymptomToggle("unusualSwelling")}
                  className="rounded border-rose-300 text-rose-600 focus:ring-rose-500"
                />
                <span>Sudden or unusual swelling in face, hands, or ankles</span>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-xs text-gray-600 dark:text-rose-300 mb-1">
              Clinical Observations & Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Active kicks after lunch. Fasting taken right upon waking."
              className="w-full px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-xs text-gray-900 dark:text-rose-100"
            />
          </div>

          {/* Validation or API Error Alerts Banner */}
          {(validationErrors.length > 0 || apiError) && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs space-y-1.5 animate-in fade-in">
              <div className="flex items-center gap-1.5 font-bold text-rose-700 dark:text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Please check the following before saving:</span>
              </div>
              {validationErrors.map((err, idx) => (
                <div key={idx} className="text-rose-600 dark:text-rose-400 pl-5 text-[11px]">
                  • {err}
                </div>
              ))}
              {apiError && (
                <div className="text-rose-600 dark:text-rose-400 pl-5 text-[11px]">
                  • {apiError}
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
          >
            {isSubmitting
              ? "Evaluating via Backend API..."
              : editingVitalId
              ? "Update Vital Entry ✨"
              : "Save & Evaluate Health Vitals ✨"}
          </button>
        </form>

        {/* RECHARTS & LIVE FORM PREVIEWS */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Neutral Typing Input Preview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl border border-rose-100 dark:border-rose-900/40 bg-white dark:bg-[#1a1523] shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-gray-700 dark:text-rose-200">
                  <Activity className="w-4 h-4 text-rose-500" /> Current Input Preview
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  {editingVitalId ? "Editing" : "Pending Save"}
                </span>
              </div>

              <div className="text-3xl font-serif font-extrabold text-gray-900 dark:text-rose-100">
                {systolic || "—"} / {diastolic || "—"} <span className="text-xs font-normal text-gray-500">mmHg</span>
              </div>

              <div className="text-xs font-medium text-gray-600 dark:text-rose-300 flex items-center justify-between">
                <span>Pulse: <strong>{pulse || "—"} BPM</strong></span>
                <span>MAP: <strong>{Math.round(((parseInt(systolic, 10) || 120) + 2 * (parseInt(diastolic, 10) || 80)) / 3)} mmHg</strong></span>
              </div>

              <p className="text-[11px] text-gray-500 dark:text-rose-400 border-t border-gray-100 dark:border-rose-900/30 pt-2">
                Date: {logDate} • Time: {logTime}
              </p>
            </div>

            <div className="p-5 rounded-3xl border border-rose-100 dark:border-rose-900/40 bg-white dark:bg-[#1a1523] shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-gray-700 dark:text-rose-200">
                  <Thermometer className="w-4 h-4 text-amber-500" /> Glucose Input Preview
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  {editingVitalId ? "Editing" : "Pending Save"}
                </span>
              </div>

              <div className="text-3xl font-serif font-extrabold text-gray-900 dark:text-rose-100">
                {glucose} <span className="text-xs font-normal text-gray-500">mg/dL</span>
              </div>

              <div className="text-xs font-medium text-gray-600 dark:text-rose-300 flex items-center gap-1 capitalize">
                <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Context: <strong>{glucoseContext.replace(/_/g, " ")}</strong></span>
              </div>

              <p className="text-[11px] text-gray-500 dark:text-rose-400 border-t border-gray-100 dark:border-rose-900/30 pt-2">
                Targets: Fasting &lt;95 | 1h Post &lt;140 | 2h Post &lt;120 mg/dL
              </p>
            </div>
          </div>

          {/* RECHARTS TRAJECTORY VISUALIZATION */}
          <div className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-100 dark:border-rose-900/30 pb-3">
              <h3 className="font-bold text-sm text-gray-900 dark:text-rose-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-rose-500" />
                <span>Historical Vitals Progression</span>
              </h3>

              {/* Chart Tabs */}
              <div className="flex flex-wrap bg-rose-50 dark:bg-rose-950/40 p-1 rounded-xl border border-rose-200/60 dark:border-rose-900/40 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setActiveChartTab("weight")}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    activeChartTab === "weight"
                      ? "bg-rose-500 text-white shadow-xs"
                      : "text-gray-600 dark:text-rose-300"
                  }`}
                >
                  Weight Trend
                </button>

                <button
                  type="button"
                  onClick={() => setActiveChartTab("bp")}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    activeChartTab === "bp"
                      ? "bg-rose-500 text-white shadow-xs"
                      : "text-gray-600 dark:text-rose-300"
                  }`}
                >
                  BP & MAP
                </button>

                <button
                  type="button"
                  onClick={() => setActiveChartTab("pulse")}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    activeChartTab === "pulse"
                      ? "bg-rose-500 text-white shadow-xs"
                      : "text-gray-600 dark:text-rose-300"
                  }`}
                >
                  Pulse (BPM)
                </button>

                <button
                  type="button"
                  onClick={() => setActiveChartTab("glucose")}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    activeChartTab === "glucose"
                      ? "bg-rose-500 text-white shadow-xs"
                      : "text-gray-600 dark:text-rose-300"
                  }`}
                >
                  Glucose
                </button>
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis domain={["dataMin - 2", "dataMax + 2"]} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />

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
                        dot={{ r: 3 }}
                        name="Systolic BP (mmHg)"
                      />
                      <Line
                        type="monotone"
                        dataKey="diastolic"
                        stroke="#8b5cf6"
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                        name="Diastolic BP (mmHg)"
                      />
                      <Line
                        type="monotone"
                        dataKey="map"
                        stroke="#06b6d4"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={{ r: 3 }}
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
      </div>

      {/* 4. HISTORICAL VITALS LOG TABLE WITH FILTERING & ACTIONS */}
      <div className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-100 dark:border-rose-900/30 pb-3">
          <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-rose-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-rose-500" />
            <span>Recorded Clinical History ({filteredVitals.length})</span>
          </h3>

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
              🩺 BP & Pulse
            </button>
            <button
              onClick={() => setHistoryFilter("glucose")}
              className={`px-3 py-1 rounded-xl transition-all ${
                historyFilter === "glucose" ? "bg-rose-500 text-white shadow-xs" : "text-gray-600 dark:text-rose-300 hover:bg-rose-100"
              }`}
            >
              🧪 Glucose
            </button>
            <button
              onClick={() => setHistoryFilter("alerts")}
              className={`px-3 py-1 rounded-xl transition-all ${
                historyFilter === "alerts" ? "bg-rose-500 text-white shadow-xs" : "text-gray-600 dark:text-rose-300 hover:bg-rose-100"
              }`}
            >
              ⚠️ Alerts Only
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
