import React, { useState, useEffect, useMemo } from "react";
import {
  CalendarHeart,
  Thermometer,
  Droplet,
  Plus,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Info,
  Heart,
  HelpCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  X,
  Eye,
  Activity,
  ZoomIn,
  AlertCircle,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";

export interface CycleLog {
  id: string;
  date: string;
  cycleDay: number;
  bbt?: number; // e.g. 97.8 F
  cervicalMucus?: "dry" | "sticky" | "creamy" | "egg_white" | "watery" | "slippery_egg_white";
  lhTest?: "not_tested" | "negative" | "low" | "high" | "positive" | "peak";
  intercourse?: boolean; // backwards compatible
  intimacy?: "yes" | "no" | "prefer_not_to_say";
  symptoms?: string[];
  notes?: string;
}

export const PreconceptionCycleLab: React.FC = () => {
  // 1. Existing LocalStorage State (Preserved)
  const [cycleLength, setCycleLength] = useState<number>(() => {
    const saved = localStorage.getItem("bloom_pre_cycleLength");
    return saved ? parseInt(saved, 10) : 28;
  });

  const [periodDuration, setPeriodDuration] = useState<number>(() => {
    const saved = localStorage.getItem("bloom_pre_periodDuration");
    return saved ? parseInt(saved, 10) : 5;
  });

  const [lastPeriodDate, setLastPeriodDate] = useState<string>(() => {
    const saved = localStorage.getItem("bloom_pre_lastPeriodDate");
    if (saved) return saved;
    // Default to 13 days ago so today is cycle day 14
    const d = new Date();
    d.setDate(d.getDate() - 13);
    return d.toISOString().split("T")[0];
  });

  const [logs, setLogs] = useState<CycleLog[]>(() => {
    const saved = localStorage.getItem("bloom_pre_cycleLogs");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        // fallback
      }
    }
    const todayStr = new Date().toISOString().split("T")[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    return [
      {
        id: "1",
        date: todayStr,
        cycleDay: 14,
        bbt: 97.9,
        cervicalMucus: "egg_white",
        lhTest: "peak",
        intercourse: true,
        intimacy: "yes",
        symptoms: ["Cramps", "Fatigue"],
        notes: "Test line appeared darker than control line.",
      },
      {
        id: "2",
        date: yesterdayStr,
        cycleDay: 13,
        bbt: 97.5,
        cervicalMucus: "watery",
        lhTest: "positive",
        intercourse: true,
        intimacy: "yes",
        symptoms: ["Breast tenderness"],
        notes: "Test line as dark as control line.",
      },
    ];
  });

  // UI Modals & Educational Overlays
  const [isCheckInOpen, setIsCheckInOpen] = useState<boolean>(false);
  const [showLearningSection, setShowLearningSection] = useState<boolean>(true);
  const [activeEduGuide, setActiveEduGuide] = useState<"bbt" | "mucus" | "lh" | null>(null);
  const [selectedZoomImage, setSelectedZoomImage] = useState<{ src: string; alt: string; label: string } | null>(null);

  // Form State for Daily Check-in
  const [inputBbt, setInputBbt] = useState<string>("");
  const [selectedMucus, setSelectedMucus] = useState<CycleLog["cervicalMucus"] | "">("");
  const [selectedLh, setSelectedLh] = useState<CycleLog["lhTest"] | "">("not_tested");
  const [selectedIntimacy, setSelectedIntimacy] = useState<"yes" | "no" | "prefer_not_to_say">("prefer_not_to_say");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [inputNotes, setInputNotes] = useState<string>("");

  // Persist settings
  useEffect(() => {
    localStorage.setItem("bloom_pre_cycleLength", cycleLength.toString());
  }, [cycleLength]);

  useEffect(() => {
    localStorage.setItem("bloom_pre_periodDuration", periodDuration.toString());
  }, [periodDuration]);

  useEffect(() => {
    localStorage.setItem("bloom_pre_lastPeriodDate", lastPeriodDate);
  }, [lastPeriodDate]);

  useEffect(() => {
    localStorage.setItem("bloom_pre_cycleLogs", JSON.stringify(logs));
  }, [logs]);

  // Clinical Cycle Day Calculation Engine (Normalized to midnight local time)
  const calculateCycleDay = () => {
    try {
      const [sy, sm, sd] = lastPeriodDate.split("-").map(Number);
      const startMidnight = new Date(sy, (sm || 1) - 1, sd || 1, 0, 0, 0, 0);
      const today = new Date();
      const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
      const diffMs = todayMidnight.getTime() - startMidnight.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const safeDiffDays = Math.max(0, diffDays);
      return (safeDiffDays % cycleLength) + 1;
    } catch {
      return 14;
    }
  };

  const currentCycleDay = calculateCycleDay();
  const estimatedOvulationDay = Math.max(1, cycleLength - 14);
  const isEstimatedFertileWindow =
    currentCycleDay >= estimatedOvulationDay - 4 && currentCycleDay <= estimatedOvulationDay + 1;
  const isEstimatedPeakDay = currentCycleDay === estimatedOvulationDay;

  // Open modal pre-populated for today if existing
  const handleOpenCheckIn = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    const existing = logs.find((l) => l.date === todayStr);
    if (existing) {
      setInputBbt(existing.bbt ? existing.bbt.toString() : "");
      setSelectedMucus(existing.cervicalMucus || "");
      setSelectedLh(existing.lhTest || "not_tested");
      setSelectedIntimacy(
        existing.intimacy || (existing.intercourse ? "yes" : "no")
      );
      setSelectedSymptoms(existing.symptoms || []);
      setInputNotes(existing.notes || "");
    } else {
      setInputBbt("");
      setSelectedMucus("");
      setSelectedLh("not_tested");
      setSelectedIntimacy("prefer_not_to_say");
      setSelectedSymptoms([]);
      setInputNotes("");
    }
    setIsCheckInOpen(true);
  };

  const handleSaveCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    const todayStr = new Date().toISOString().split("T")[0];
    const newEntry: CycleLog = {
      id: Date.now().toString(),
      date: todayStr,
      cycleDay: currentCycleDay,
      bbt: inputBbt ? parseFloat(inputBbt) : undefined,
      cervicalMucus: selectedMucus ? (selectedMucus as any) : undefined,
      lhTest: selectedLh ? (selectedLh as any) : "not_tested",
      intimacy: selectedIntimacy,
      intercourse: selectedIntimacy === "yes",
      symptoms: selectedSymptoms,
      notes: inputNotes.trim() ? inputNotes.trim() : undefined,
    };

    setLogs([newEntry, ...logs.filter((l) => l.date !== todayStr)]);
    setIsCheckInOpen(false);
  };

  const toggleSymptom = (sym: string) => {
    if (sym === "None") {
      setSelectedSymptoms((prev) => (prev.includes("None") ? [] : ["None"]));
      return;
    }
    setSelectedSymptoms((prev) => {
      const filtered = prev.filter((s) => s !== "None");
      return filtered.includes(sym) ? filtered.filter((s) => s !== sym) : [...filtered, sym];
    });
  };

  // Observational Interpretation Engine (Cautious, non-diagnostic)
  const interpretation = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const todayLog = logs.find((l) => l.date === todayStr);

    const observations: string[] = [];

    if (todayLog) {
      const isWetOrSlippery =
        todayLog.cervicalMucus === "egg_white" ||
        todayLog.cervicalMucus === "slippery_egg_white" ||
        todayLog.cervicalMucus === "watery";

      const isPositiveOrPeakLh =
        todayLog.lhTest === "positive" ||
        todayLog.lhTest === "peak" ||
        todayLog.lhTest === "high";

      if (isWetOrSlippery && isPositiveOrPeakLh) {
        observations.push(
          "You recorded more than one fertility sign today (slippery/wet mucus and an elevated LH observation). In reproductive biology, these observations can occur around the fertile phase."
        );
      } else if (isWetOrSlippery) {
        observations.push(
          "Your cervical mucus observation reflects a wetter or more slippery pattern. These natural changes can be associated with the fertile phase of a cycle."
        );
      } else if (isPositiveOrPeakLh) {
        observations.push(
          "You logged a positive or peak ovulation test today. Changes in LH levels can be associated with the approach of ovulation."
        );
      } else if (todayLog.cervicalMucus === "dry" || todayLog.cervicalMucus === "sticky") {
        observations.push(
          "You logged dry or sticky cervical mucus today. In typical cycle patterns, this is often observed outside of the fertile phase."
        );
      }
    }

    // BBT Multi-day Trend Analysis (cautious trend language)
    const validBbtLogs = logs.filter((l) => typeof l.bbt === "number" && !isNaN(l.bbt));
    if (validBbtLogs.length >= 3) {
      const sortedBbt = [...validBbtLogs].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      const recent = sortedBbt.slice(-3);
      const diff = (recent[recent.length - 1].bbt || 0) - (recent[0].bbt || 0);

      if (diff >= 0.3) {
        observations.push(
          "Your recent temperature pattern shows a mild rise compared with earlier readings. BBT patterns are best observed across multiple days rather than from an isolated measurement."
        );
      } else {
        observations.push(
          "Your logged waking temperatures currently remain within your steady baseline range. Consistent morning measurements help identify patterns over time."
        );
      }
    } else {
      observations.push(
        "Log a few more consecutive morning temperatures to view your multi-day BBT baseline pattern."
      );
    }

    return observations;
  }, [logs]);

  // Visual Mucus Categories with Clean Educational Reference Illustrations
  const mucusOptions = [
    {
      id: "dry",
      label: "Dry",
      shortDesc: "Little or no noticeable discharge",
      patternWording: "Typically less fertile pattern",
      imageSrc: "/assets/cervical_mucus/cervical_mucus_dry.png",
      altText: "Educational example of dry cervical fluid observation showing dry tissue paper and fingertips with no fluid present.",
      whatYouNotice: "Sensation of dryness at the vulva, minimal to no moisture on tissue paper.",
      texture: "Dry, rough, or minimal feel.",
      stretch: "Does not stretch (no fluid).",
      typicalCyclePattern: "Common immediately following menstruation.",
      badgeColor: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-800",
    },
    {
      id: "sticky",
      label: "Sticky",
      shortDesc: "Thick or tacky, breaks easily",
      patternWording: "Often a transitional pattern",
      imageSrc: "/assets/cervical_mucus/cervical_mucus_sticky.png",
      altText: "Educational example of sticky cervical fluid showing thick, paste-like texture between fingertips that breaks easily.",
      whatYouNotice: "Thick, tacky, opaque white or yellowish fluid on fingertips.",
      texture: "Paste-like, crumbly, or tacky.",
      stretch: "Breaks easily when fingertips separate.",
      typicalCyclePattern: "Often observed early in the follicular phase before ovulation.",
      badgeColor: "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700",
    },
    {
      id: "creamy",
      label: "Creamy",
      shortDesc: "Smooth, white or lotion-like",
      patternWording: "Fertility may be increasing",
      imageSrc: "/assets/cervical_mucus/cervical_mucus_creamy.png",
      altText: "Educational example of creamy cervical fluid showing smooth, white lotion-like consistency.",
      whatYouNotice: "Smooth, milky, opaque white or off-white appearance.",
      texture: "Lotion-like, smooth, or damp.",
      stretch: "Holds form, low elasticity.",
      typicalCyclePattern: "Commonly seen as estrogen levels begin rising prior to ovulation.",
      badgeColor: "bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-800",
    },
    {
      id: "watery",
      label: "Watery",
      shortDesc: "Thin, clear and wet sensation",
      patternWording: "Often associated with increasing fertility",
      imageSrc: "/assets/cervical_mucus/cervical_mucus_watery.png",
      altText: "Educational example of watery cervical fluid showing thin, clear, wet fluid glistening on fingertips.",
      whatYouNotice: "Clear, thin, liquid fluid creating a wet or slippery sensation.",
      texture: "Fluid, watery, non-viscous.",
      stretch: "Runs like water, thin liquid consistency.",
      typicalCyclePattern: "Frequently observed leading up to peak ovulation days.",
      badgeColor: "bg-teal-100 text-teal-900 border-teal-300 dark:bg-teal-950/60 dark:text-teal-200 dark:border-teal-800",
    },
    {
      id: "egg_white",
      label: "Egg-white / Stretchy",
      shortDesc: "Clear, slippery and stretches easily",
      patternWording: "Commonly associated with peak fertility",
      imageSrc: "/assets/cervical_mucus/cervical_mucus_eggwhite.png",
      altText: "Educational example of clear, stretchy cervical mucus (EWCM) associated with the fertile window.",
      whatYouNotice: "Clear, glistening fluid resembling raw egg white.",
      texture: "Slippery, lubricative, elastic.",
      stretch: "Stretches 1–2 inches or more between fingers without breaking.",
      typicalCyclePattern: "Typically observed around estrogen peak and ovulation window.",
      badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800",
    },
  ];

  // LH Strip Educational Representations (Clear visual difference beyond color alone)
  const lhOptions = [
    {
      id: "not_tested",
      label: "Not tested",
      desc: "No LH test taken today",
      stripSvg: (
        <svg viewBox="0 0 100 28" className="w-24 h-7 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
          <rect x="2" y="2" width="24" height="24" rx="2" fill="#94a3b8" opacity="0.4" />
          <text x="14" y="16" fontSize="7" textAnchor="middle" fill="#64748b" fontWeight="bold">LH</text>
          <line x1="32" y1="2" x2="32" y2="26" stroke="#cbd5e1" strokeWidth="1" />
          <text x="64" y="16" fontSize="7" textAnchor="middle" fill="#94a3b8">Unused</text>
        </svg>
      ),
    },
    {
      id: "negative",
      label: "Negative",
      desc: "Test line appears lighter than the control line",
      stripSvg: (
        <svg viewBox="0 0 100 28" className="w-24 h-7 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900">
          <rect x="2" y="2" width="24" height="24" rx="2" fill="#10b981" opacity="0.3" />
          <text x="14" y="16" fontSize="7" textAnchor="middle" fill="#047857" fontWeight="bold">LH</text>
          <line x1="50" y1="5" x2="50" y2="23" stroke="#f43f5e" strokeWidth="1.2" strokeDasharray="1 1" opacity="0.45" />
          <text x="50" y="27" fontSize="5" textAnchor="middle" fill="#94a3b8">T</text>
          <line x1="72" y1="5" x2="72" y2="23" stroke="#be123c" strokeWidth="3" strokeLinecap="round" />
          <text x="72" y="27" fontSize="5" textAnchor="middle" fill="#64748b">C</text>
        </svg>
      ),
    },
    {
      id: "positive",
      label: "Positive",
      desc: "Test line appears as dark as or darker than the control line",
      stripSvg: (
        <svg viewBox="0 0 100 28" className="w-24 h-7 rounded border border-emerald-300 dark:border-emerald-700 bg-emerald-50/40 dark:bg-slate-900">
          <rect x="2" y="2" width="24" height="24" rx="2" fill="#10b981" opacity="0.5" />
          <text x="14" y="16" fontSize="7" textAnchor="middle" fill="#047857" fontWeight="bold">LH</text>
          <line x1="50" y1="5" x2="50" y2="23" stroke="#be123c" strokeWidth="3" strokeLinecap="round" />
          <text x="50" y="27" fontSize="5" textAnchor="middle" fill="#be123c" fontWeight="bold">T</text>
          <line x1="72" y1="5" x2="72" y2="23" stroke="#be123c" strokeWidth="3" strokeLinecap="round" />
          <text x="72" y="27" fontSize="5" textAnchor="middle" fill="#be123c" fontWeight="bold">C</text>
        </svg>
      ),
    },
    {
      id: "peak",
      label: "Peak",
      desc: "Specific test/digital device reporting a peak result",
      stripSvg: (
        <svg viewBox="0 0 100 28" className="w-24 h-7 rounded border border-rose-300 dark:border-rose-700 bg-rose-50/40 dark:bg-slate-900">
          <rect x="2" y="2" width="24" height="24" rx="2" fill="#f43f5e" opacity="0.4" />
          <text x="14" y="16" fontSize="6.5" textAnchor="middle" fill="#9f1239" fontWeight="bold">PEAK</text>
          <line x1="50" y1="4" x2="50" y2="24" stroke="#881337" strokeWidth="4.5" strokeLinecap="round" />
          <text x="50" y="27" fontSize="5" textAnchor="middle" fill="#881337" fontWeight="bold">T</text>
          <line x1="72" y1="5" x2="72" y2="23" stroke="#be123c" strokeWidth="2.5" strokeLinecap="round" />
          <text x="72" y="27" fontSize="5" textAnchor="middle" fill="#be123c">C</text>
        </svg>
      ),
    },
  ];

  const commonSymptomsList = [
    "Cramps",
    "Bloating",
    "Breast tenderness",
    "Headache",
    "Fatigue",
    "Mood changes",
    "None",
    "Other",
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-800 via-emerald-800 to-teal-950 text-white shadow-xl shadow-emerald-950/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/30 text-emerald-200">
              <CalendarHeart className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
              Fertility Signs Learning & Observation
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">Cycle & Fertility Tracker</h2>
          <p className="text-emerald-100 text-sm mt-1 max-w-2xl">
            Learn what your body signals indicate, record your daily observations, and understand your natural cycle patterns.
          </p>
        </div>
        <Button
          variant="primary"
          className="bg-white text-emerald-950 hover:bg-emerald-50 font-bold px-5 py-2.5 rounded-2xl shadow-lg border-0 shrink-0"
          onClick={handleOpenCheckIn}
        >
          <Plus className="w-4 h-4 mr-2 text-emerald-700" />
          Today's Check-in
        </Button>
      </div>

      {/* 1. FIRST-TIME USER — FERTILITY SIGNS LEARNING SECTION */}
      <Card variant="glass" className="p-6 border-emerald-100 dark:border-emerald-900/40">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowLearningSection(!showLearningSection)}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-emerald-950 dark:text-emerald-50 text-lg">
                Understand Your Fertility Signs
              </h3>
              <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80">
                Learn what to observe before you start tracking.
              </p>
            </div>
          </div>
          <button className="text-emerald-700 dark:text-emerald-300 p-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/30">
            {showLearningSection ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {showLearningSection && (
          <div className="mt-6 pt-6 border-t border-emerald-100 dark:border-emerald-900/30 grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Concept A: Basal Body Temperature */}
            <div className="p-4 rounded-2xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-900/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2 text-orange-800 dark:text-orange-300">
                  <Thermometer className="w-5 h-5 text-orange-600" />
                  <h4 className="font-bold text-sm">Basal Body Temperature (BBT)</h4>
                </div>
                <div className="text-xs text-orange-950/80 dark:text-orange-200/80 space-y-1.5 leading-relaxed">
                  <p>
                    <strong>What is it?</strong> Your basal body temperature is your body temperature measured after waking up and before getting out of bed.
                  </p>
                  <p>
                    <strong>How to track it:</strong>
                  </p>
                  <ul className="list-disc list-inside text-[11px] space-y-0.5 opacity-90">
                    <li>Measure in the morning.</li>
                    <li>Measure before getting out of bed or doing normal activities.</li>
                    <li>Try to measure around the same time each day.</li>
                    <li>Record the temperature consistently.</li>
                  </ul>
                </div>
              </div>
              <button
                onClick={() => setActiveEduGuide("bbt")}
                className="mt-4 text-xs font-bold text-orange-700 dark:text-orange-300 hover:underline flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" /> How do I measure BBT?
              </button>
            </div>

            {/* Concept B: Cervical Mucus */}
            <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-900/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2 text-teal-800 dark:text-teal-300">
                  <Droplet className="w-5 h-5 text-teal-600" />
                  <h4 className="font-bold text-sm">Cervical Mucus</h4>
                </div>
                <div className="text-xs text-teal-950/80 dark:text-teal-200/80 space-y-1.5 leading-relaxed">
                  <p>
                    <strong>What is it?</strong> Cervical mucus naturally changes throughout the menstrual cycle in response to hormonal shifts.
                  </p>
                  <p>
                    Observing whether the sensation feels <em>Dry</em>, <em>Creamy</em>, or <em>Slippery/Egg-white</em> helps you understand your body's fertile phase.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveEduGuide("mucus")}
                className="mt-4 text-xs font-bold text-teal-700 dark:text-teal-300 hover:underline flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" /> How do I identify this? (Visual Guide)
              </button>
            </div>

            {/* Concept C: LH Ovulation Test */}
            <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2 text-rose-800 dark:text-rose-300">
                  <TrendingUp className="w-5 h-5 text-rose-600" />
                  <h4 className="font-bold text-sm">Ovulation Test (LH)</h4>
                </div>
                <div className="text-xs text-rose-950/80 dark:text-rose-200/80 space-y-1.5 leading-relaxed">
                  <p>
                    <strong>What is it?</strong> LH tests detect luteinizing hormone in urine. Changes in LH can be useful when tracking the fertile phase.
                  </p>
                  <p>
                    A test is considered positive when the test line appears as dark as or darker than the control line.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveEduGuide("lh")}
                className="mt-4 text-xs font-bold text-rose-700 dark:text-rose-300 hover:underline flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" /> How do I read an LH test?
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* 2. CYCLE SETUP & CURRENT CONTEXT STRIP */}
      <Card variant="glass" className="p-6 border-emerald-100 dark:border-emerald-900/40">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-emerald-100 dark:border-emerald-900/30">
          <div>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
              Cycle Status & Estimates
            </div>
            <div className="text-3xl font-black text-emerald-950 dark:text-emerald-50 flex items-center gap-3 mt-1">
              Cycle Day {currentCycleDay}
              {isEstimatedPeakDay ? (
                <Badge variant="success" className="bg-emerald-600 text-white font-bold">
                  Estimated Peak Ovulation Day 🔥
                </Badge>
              ) : isEstimatedFertileWindow ? (
                <Badge variant="warning" className="bg-teal-600 text-white font-bold">
                  Estimated Fertile Window 🌱
                </Badge>
              ) : (
                <Badge variant="neutral" className="bg-slate-200 dark:bg-slate-700 font-bold">
                  Estimated Follicular / Luteal Phase
                </Badge>
              )}
            </div>
            <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80 mt-1">
              Estimated ovulation day is around <strong>Day {estimatedOvulationDay}</strong> based on your {cycleLength}-day cycle setup.
            </p>
          </div>

          {/* Cycle Parameters Setup */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-xs">
              <span className="block text-emerald-700/80 dark:text-emerald-300/80 font-semibold">Average Cycle Length</span>
              <select
                value={cycleLength}
                onChange={(e) => setCycleLength(parseInt(e.target.value, 10))}
                className="mt-1 font-bold text-sm bg-emerald-50 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-100 rounded-xl px-3 py-1.5 border border-emerald-200 dark:border-emerald-800"
              >
                {[24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35].map((d) => (
                  <option key={d} value={d}>
                    {d} Days
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs">
              <span className="block text-emerald-700/80 dark:text-emerald-300/80 font-semibold">Period Duration</span>
              <select
                value={periodDuration}
                onChange={(e) => setPeriodDuration(parseInt(e.target.value, 10))}
                className="mt-1 font-bold text-sm bg-emerald-50 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-100 rounded-xl px-3 py-1.5 border border-emerald-200 dark:border-emerald-800"
              >
                {[3, 4, 5, 6, 7].map((d) => (
                  <option key={d} value={d}>
                    {d} Days
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs">
              <span className="block text-emerald-700/80 dark:text-emerald-300/80 font-semibold">Last Period (LMP)</span>
              <input
                type="date"
                value={lastPeriodDate}
                onChange={(e) => setLastPeriodDate(e.target.value)}
                className="mt-1 font-bold text-sm bg-emerald-50 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-100 rounded-xl px-3 py-1.5 border border-emerald-200 dark:border-emerald-800"
              />
            </div>
          </div>
        </div>

        {/* 24-35 Day Visual Strip */}
        <div className="pt-6">
          <div className="text-xs font-bold text-emerald-800 dark:text-emerald-200 mb-3 flex items-center justify-between">
            <span>Cycle Visualization (Estimated Phases)</span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
              Pink = Period | Green = Fertile Window | Star = Est. Ovulation Day
            </span>
          </div>
          <div className="grid grid-cols-7 sm:grid-cols-14 md:grid-cols-28 gap-1.5">
            {Array.from({ length: cycleLength }).map((_, idx) => {
              const day = idx + 1;
              const isToday = day === currentCycleDay;
              const isPeak = day === estimatedOvulationDay;
              const isFertile = day >= estimatedOvulationDay - 4 && day <= estimatedOvulationDay + 1;
              const isPeriod = day <= periodDuration;

              return (
                <div
                  key={day}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl text-center border transition-all ${
                    isToday
                      ? "ring-2 ring-emerald-500 scale-105 bg-emerald-600 text-white font-black shadow-md"
                      : isPeak
                      ? "bg-amber-100 dark:bg-amber-900/40 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 font-bold"
                      : isFertile
                      ? "bg-teal-100 dark:bg-teal-900/40 border-teal-200 dark:border-teal-700 text-teal-900 dark:text-teal-200 font-medium"
                      : isPeriod
                      ? "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-300"
                      : "bg-white dark:bg-[#15201c] border-emerald-100 dark:border-emerald-900/30 text-emerald-900/60 dark:text-emerald-300/40"
                  }`}
                >
                  <span className="text-[10px] font-mono">D{day}</span>
                  {isPeak ? <Sparkles className="w-3.5 h-3.5 mt-0.5 text-amber-500" /> : null}
                  {isPeriod && !isPeak ? <span className="text-[9px] font-bold">🩸</span> : null}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* 3. YOUR OBSERVATIONS (CAUTIOUS INTERPRETATION SECTION) */}
      <Card variant="glass" className="p-6 border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-emerald-950 dark:text-emerald-50 text-base">
              Your Observations
            </h3>
            <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80">
              Educational interpretation based on your logged entries. Always consult your healthcare provider for medical concerns.
            </p>
          </div>
        </div>

        <div className="space-y-2 mt-4">
          {interpretation.map((note, index) => (
            <div
              key={index}
              className="p-3 rounded-xl bg-white dark:bg-[#15201c] border border-emerald-100 dark:border-emerald-900/30 text-xs text-emerald-950 dark:text-emerald-100 leading-relaxed flex items-start gap-2.5"
            >
              <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>{note}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* 4. CYCLE HISTORY & OBSERVATIONS TABLE */}
      <Card variant="glass" className="p-6 border-emerald-100 dark:border-emerald-900/40">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-emerald-950 dark:text-emerald-50 text-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Cycle History & Observations
            </h3>
            <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80 mt-0.5">
              Reviewing your past logs helps you observe changes across your cycle.
            </p>
          </div>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            {logs.length} entries recorded
          </span>
        </div>

        {logs.length === 0 ? (
          <div className="p-8 text-center text-emerald-600/70 dark:text-emerald-400/70 text-sm">
            No observations logged yet. Click "Today's Check-in" to start your pattern observation.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400">
                  <th className="pb-3 font-bold">Date & Day</th>
                  <th className="pb-3 font-bold">BBT (°F)</th>
                  <th className="pb-3 font-bold">Cervical Mucus</th>
                  <th className="pb-3 font-bold">LH Test</th>
                  <th className="pb-3 font-bold">Intimacy</th>
                  <th className="pb-3 font-bold">Symptoms & Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50 dark:divide-emerald-900/20">
                {logs.map((log) => {
                  const mucusLabel =
                    log.cervicalMucus === "egg_white" || log.cervicalMucus === "slippery_egg_white"
                      ? "Slippery / Egg-white"
                      : log.cervicalMucus
                      ? log.cervicalMucus.charAt(0).toUpperCase() + log.cervicalMucus.slice(1)
                      : "—";

                  const lhLabel =
                    log.lhTest === "peak"
                      ? "Peak"
                      : log.lhTest === "positive" || log.lhTest === "high"
                      ? "Positive"
                      : log.lhTest === "negative" || log.lhTest === "low"
                      ? "Negative"
                      : "Not tested";

                  const intimacyDisplay =
                    log.intimacy === "yes" || log.intercourse === true
                      ? "Yes"
                      : log.intimacy === "no"
                      ? "No"
                      : "—";

                  return (
                    <tr key={log.id} className="text-emerald-900 dark:text-emerald-100">
                      <td className="py-3 font-bold">
                        {log.date}
                        <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                          CD {log.cycleDay}
                        </span>
                      </td>
                      <td className="py-3 font-mono font-bold text-teal-700 dark:text-teal-300">
                        {log.bbt ? `${log.bbt.toFixed(1)}°F` : "—"}
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-1 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-teal-800 dark:text-teal-200 font-medium">
                          {mucusLabel}
                        </span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 rounded-lg font-bold text-[11px] ${
                            lhLabel === "Peak"
                              ? "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300"
                              : lhLabel === "Positive"
                              ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
                              : lhLabel === "Negative"
                              ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                              : "text-slate-400"
                          }`}
                        >
                          {lhLabel}
                        </span>
                      </td>
                      <td className="py-3">
                        {intimacyDisplay === "Yes" ? (
                          <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold">
                            <Heart className="w-3.5 h-3.5 fill-rose-500" /> Yes
                          </span>
                        ) : intimacyDisplay === "No" ? (
                          <span className="text-slate-400">No</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3">
                        <div className="space-y-1">
                          {log.symptoms && log.symptoms.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {log.symptoms.map((s, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                          {log.notes && (
                            <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80 italic">
                              {log.notes}
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 5. TODAY'S CHECK-IN MODAL (BEGINNER-FRIENDLY LOGGING) */}
      {isCheckInOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#15201c] w-full max-w-xl rounded-3xl p-6 border border-emerald-100 dark:border-emerald-900/50 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-emerald-100 dark:border-emerald-900/30">
              <div>
                <h3 className="font-black text-xl text-emerald-950 dark:text-emerald-50 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-500" />
                  Today's Check-in
                </h3>
                <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80 mt-0.5">
                  Cycle Day {currentCycleDay} • {isEstimatedFertileWindow ? "Estimated fertile phase" : "Cycle baseline"}
                </p>
              </div>
              <button
                onClick={() => setIsCheckInOpen(false)}
                className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCheckIn} className="space-y-6 pt-4">
              {/* Question A: BBT */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-emerald-900 dark:text-emerald-100 flex items-center gap-1.5">
                    <Thermometer className="w-4 h-4 text-orange-500" />
                    What was your temperature this morning?
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveEduGuide("bbt")}
                    className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    How do I measure?
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="95.0"
                    max="103.0"
                    value={inputBbt}
                    onChange={(e) => setInputBbt(e.target.value)}
                    placeholder="e.g. 97.8"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-900/20 font-mono font-bold text-emerald-950 dark:text-emerald-50"
                  />
                  <span className="font-bold text-sm text-emerald-700 dark:text-emerald-300">°F</span>
                </div>
                <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-1 block">
                  Measured right after waking up before sitting up or speaking.
                </span>
              </div>

              {/* Question B: Cervical Mucus */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-emerald-900 dark:text-emerald-100 flex items-center gap-1.5">
                    <Droplet className="w-4 h-4 text-teal-500" />
                    What did you notice today? (Cervical Mucus)
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveEduGuide("mucus")}
                    className="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    Visual guide
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {mucusOptions.map((opt) => {
                    const isSelected = selectedMucus === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => setSelectedMucus(opt.id as any)}
                        className={`p-2.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                          isSelected
                            ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20"
                            : "bg-white dark:bg-[#15201c] border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-300"
                        }`}
                      >
                        <img
                          src={opt.imageSrc}
                          alt={opt.altText}
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0 shadow-sm"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-xs text-emerald-950 dark:text-emerald-50">
                              {opt.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-emerald-700/90 dark:text-emerald-300/90 leading-tight mt-0.5">
                            "{opt.shortDesc}"
                          </p>
                          <span className={`inline-block text-[9px] font-semibold px-1.5 py-0.5 rounded border mt-1.5 ${opt.badgeColor}`}>
                            {opt.patternWording}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Question C: LH Ovulation Test */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-emerald-900 dark:text-emerald-100 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-rose-500" />
                    Did you take an ovulation test today?
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveEduGuide("lh")}
                    className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline"
                  >
                    How to read?
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {lhOptions.map((opt) => {
                    const isSelected = selectedLh === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => setSelectedLh(opt.id as any)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                          isSelected
                            ? "bg-rose-50 dark:bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/20"
                            : "bg-white dark:bg-[#15201c] border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-emerald-950 dark:text-emerald-50">
                            {opt.label}
                          </span>
                          {opt.stripSvg}
                        </div>
                        <p className="text-[10px] text-emerald-700/80 dark:text-emerald-300/80 leading-tight">
                          {opt.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Question D: Symptoms */}
              <div>
                <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-100 mb-2">
                  Symptoms you noticed today (select all that apply):
                </label>
                <div className="flex flex-wrap gap-2">
                  {commonSymptomsList.map((sym) => {
                    const isSelected = selectedSymptoms.includes(sym);
                    return (
                      <button
                        type="button"
                        key={sym}
                        onClick={() => toggleSymptom(sym)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                          isSelected
                            ? "bg-emerald-600 text-white border-emerald-600 font-bold"
                            : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800"
                        }`}
                      >
                        {isSelected ? "✓ " : "+ "}
                        {sym}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question E: Intimacy (Neutral, professional, optional) */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-500" />
                  Intimacy (Optional)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["yes", "no", "prefer_not_to_say"] as const).map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => setSelectedIntimacy(opt)}
                      className={`py-2 text-xs rounded-xl font-bold border transition-all ${
                        selectedIntimacy === opt
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white dark:bg-[#15201c] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      {opt === "yes" ? "Yes" : opt === "no" ? "No" : "Prefer not to log"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question F: Notes */}
              <div>
                <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-100 mb-1">
                  Anything else you noticed? (Optional)
                </label>
                <textarea
                  rows={2}
                  value={inputNotes}
                  onChange={(e) => setInputNotes(e.target.value)}
                  placeholder="Record any specific notes or observations..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-[#15201c] text-emerald-950 dark:text-emerald-50"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCheckInOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 font-bold text-xs text-emerald-800 dark:text-emerald-200"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs"
                >
                  Save Today's Check-in
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. EDUCATIONAL DETAIL MODALS */}
      {activeEduGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#15201c] w-full max-w-lg rounded-3xl p-6 border border-emerald-100 dark:border-emerald-900/50 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-emerald-900/30">
              <h3 className="font-black text-lg text-emerald-950 dark:text-emerald-50 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                {activeEduGuide === "bbt"
                  ? "How to Measure Basal Body Temperature (BBT)"
                  : activeEduGuide === "mucus"
                  ? "Visual Guide: Observing Cervical Mucus"
                  : "How to Read an LH Ovulation Test"}
              </h3>
              <button
                onClick={() => setActiveEduGuide(null)}
                className="w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Guide Content */}
            {activeEduGuide === "bbt" && (
              <div className="space-y-3 text-xs text-emerald-900 dark:text-emerald-100 leading-relaxed">
                <p>
                  Basal body temperature (BBT) is your lowest natural body temperature during rest. In reproductive biology, progesterone released after ovulation can be associated with a mild sustained rise (about 0.3°F to 0.6°F).
                </p>
                <div className="p-3.5 rounded-2xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200/60 space-y-2">
                  <h5 className="font-bold text-orange-900 dark:text-orange-200">Step-by-Step Routine:</h5>
                  <ol className="list-decimal list-inside space-y-1 text-[11px]">
                    <li>Keep a basal thermometer (measures to 1/10th or 1/100th of a degree) on your bedside table.</li>
                    <li>Take the measurement immediately upon waking up, before sitting up, getting out of bed, drinking water, or speaking.</li>
                    <li>Try to measure after at least 3–4 consecutive hours of sleep and at approximately the same time each morning.</li>
                    <li>Record your reading in Fahrenheit (°F) in Today's Check-in.</li>
                  </ol>
                </div>
                <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80">
                  Note: A single isolated temperature reading does not confirm ovulation. BBT is evaluated as an overall multi-day pattern across the cycle.
                </p>
              </div>
            )}

            {activeEduGuide === "mucus" && (
              <div className="space-y-4 text-xs text-emerald-900 dark:text-emerald-100 leading-relaxed">
                <div className="p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/50 text-[11px] text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
                  <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <p>
                    <strong>Individual Variation Note:</strong> Cervical mucus can look different from person to person. These visuals are examples to help you recognize general patterns.
                  </p>
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1.5 custom-scrollbar">
                  {mucusOptions.map((opt) => (
                    <div
                      key={opt.id}
                      className="p-3.5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 bg-slate-50/60 dark:bg-slate-900/40 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-emerald-100/60 dark:border-emerald-900/20 pb-2">
                        <h4 className="font-extrabold text-sm text-emerald-950 dark:text-emerald-50 flex items-center gap-2">
                          {opt.label}
                        </h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${opt.badgeColor}`}>
                          {opt.patternWording}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 items-center">
                        <div className="relative group shrink-0 cursor-pointer" onClick={() => setSelectedZoomImage({ src: opt.imageSrc, alt: opt.altText, label: opt.label })}>
                          <img
                            src={opt.imageSrc}
                            alt={opt.altText}
                            className="w-32 h-24 rounded-xl object-cover border border-emerald-200 dark:border-emerald-800/60 shadow-sm"
                          />
                          <div className="absolute inset-0 bg-black/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold gap-1">
                            <ZoomIn className="w-3.5 h-3.5" /> Zoom
                          </div>
                        </div>

                        <div className="space-y-1.5 text-[11px] text-emerald-900/90 dark:text-emerald-100/90 flex-1 w-full">
                          <p>
                            <strong className="text-emerald-950 dark:text-emerald-50">What you may notice:</strong> {opt.whatYouNotice}
                          </p>
                          <p>
                            <strong className="text-emerald-950 dark:text-emerald-50">Texture:</strong> {opt.texture}
                          </p>
                          <p>
                            <strong className="text-emerald-950 dark:text-emerald-50">Stretch:</strong> {opt.stretch}
                          </p>
                          <p>
                            <strong className="text-emerald-950 dark:text-emerald-50">Typical cycle pattern:</strong> {opt.typicalCyclePattern}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-950 dark:text-amber-100">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    Medical Disclaimer
                  </div>
                  <p className="leading-snug">
                    Cervical mucus patterns vary between people and cycles. These examples are for fertility awareness education and are not a medical diagnosis. Cervical mucus alone cannot confirm ovulation or pregnancy.
                  </p>
                </div>

                <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80 text-center italic">
                  Tip: Observe fluid when wiping with clean tissue or with clean fingertips before urination.
                </p>
              </div>
            )}

            {activeEduGuide === "lh" && (
              <div className="space-y-3 text-xs text-emerald-900 dark:text-emerald-100 leading-relaxed">
                <p>
                  LH (Luteinizing Hormone) test strips help identify changes in hormone levels in urine. Unlike a pregnancy test, an LH test usually shows two lines; the intensity of the test line is what matters.
                </p>
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs">Negative:</span>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">Test line (T) is lighter than control line (C).</p>
                    </div>
                    {lhOptions[1].stripSvg}
                  </div>
                  <div className="p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between bg-emerald-50/40 dark:bg-emerald-950/20">
                    <div>
                      <span className="font-bold text-xs text-emerald-950 dark:text-emerald-100">Positive:</span>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-300">Test line (T) is as dark as or darker than control line (C).</p>
                    </div>
                    {lhOptions[2].stripSvg}
                  </div>
                  <div className="p-2.5 rounded-xl border border-rose-200 dark:border-rose-800 flex items-center justify-between bg-rose-50/40 dark:bg-rose-950/20">
                    <div>
                      <span className="font-bold text-xs text-rose-900 dark:text-rose-100">Peak:</span>
                      <p className="text-[11px] text-rose-700 dark:text-rose-300">For devices or strips with a distinct peak designation.</p>
                    </div>
                    {lhOptions[3].stripSvg}
                  </div>
                </div>
                <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80">
                  Read your strip within the timeframe specified on the product instructions (usually 5–10 minutes).
                </p>
              </div>
            )}

            <div className="pt-2">
              <Button
                variant="primary"
                onClick={() => setActiveEduGuide(null)}
                className="w-full py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl"
              >
                Close Guide
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 7. IMAGE ZOOM OVERLAY MODAL */}
      {selectedZoomImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md cursor-pointer"
          onClick={() => setSelectedZoomImage(null)}
        >
          <div
            className="bg-white dark:bg-[#15201c] max-w-xl w-full rounded-3xl p-5 border border-emerald-100 dark:border-emerald-900/50 shadow-2xl space-y-3 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-emerald-100 dark:border-emerald-900/30">
              <h4 className="font-extrabold text-sm text-emerald-950 dark:text-emerald-50">
                Educational Visual Reference: {selectedZoomImage.label}
              </h4>
              <button
                onClick={() => setSelectedZoomImage(null)}
                className="w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img
              src={selectedZoomImage.src}
              alt={selectedZoomImage.alt}
              className="w-full max-h-[70vh] object-contain rounded-2xl border border-emerald-100 dark:border-emerald-900/30 shadow-md"
            />
            <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80 text-center italic">
              {selectedZoomImage.alt}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
