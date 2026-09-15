import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { PREGNANCY_WEEKS_DATA } from "../data/pregnancyWeeksData";
import { calculatePregnancyProgress } from "../utils/pregnancyCalculation";
import { PageView } from "../types";
import confetti from "canvas-confetti";
import {
  Baby,
  Heart,
  Info,
  Apple,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Circle,
  Stethoscope,
  List,
  Compass,
  Camera,
  Share2,
  HeartHandshake,
  ArrowUpRight,
  Trash2,
  Plus,
  X,
  Copy,
  Check,
  Calendar,
  Clock,
  ExternalLink,
} from "lucide-react";

// Asset Images
import pastelMotherArt from "../assets/images/pastel_mother_art_1785746033662.jpg";

// Key clinical and developmental milestones
const CLINICAL_MILESTONES: Record<number, { title: string; badge: string; icon: string; color: string }> = {
  12: { title: "NT Scan & First Trimester Screen", badge: "12W Scan", icon: "🔬", color: "bg-blue-500 text-white" },
  18: { title: "First Baby Kicks (Quickening)", badge: "First Kicks", icon: "💖", color: "bg-rose-500 text-white" },
  20: { title: "Level-II Anomaly Scan", badge: "Anomaly Scan", icon: "🩺", color: "bg-purple-600 text-white" },
  24: { title: "Fetal Viability & Hearing", badge: "Viability", icon: "🌟", color: "bg-amber-500 text-white" },
  28: { title: "OGTT Sugar Test & Tdap Shot", badge: "Sugar & Tdap", icon: "🩸", color: "bg-emerald-600 text-white" },
  32: { title: "Third Trimester Growth Scan", badge: "Growth Scan", icon: "📏", color: "bg-indigo-500 text-white" },
  36: { title: "Full Term & Hospital Bag Ready", badge: "Full Term", icon: "🎒", color: "bg-pink-600 text-white" },
  40: { title: "Estimated Due Date Arrival", badge: "Due Date", icon: "🎉", color: "bg-red-500 text-white" },
};

// Structured weekly task item with optional deep link into app features
export interface WeeklyTaskItem {
  text: string;
  actionPage?: PageView;
  actionLabel?: string;
}

// Week-by-week actionable checklist items with smart feature links
const getWeeklyTasks = (week: number): WeeklyTaskItem[] => {
  if (week <= 4) {
    return [
      { text: "Take daily 400mcg Folic Acid supplement", actionPage: "medicine", actionLabel: "Medicine" },
      { text: "Hydrate with 2.5L water & nutrient fluids", actionPage: "health-tracker", actionLabel: "Log Water" },
      { text: "Confirm pregnancy blood test (Beta-hCG) with clinic", actionPage: "medical-timeline", actionLabel: "Scans & Labs" }
    ];
  } else if (week <= 8) {
    return [
      { text: "Schedule first trimester dating ultrasound", actionPage: "medical-timeline", actionLabel: "Book Scan" },
      { text: "Keep ginger tea or lemon water ready for morning nausea", actionPage: "nutrition", actionLabel: "Nutrition" },
      { text: "Rest adequately and avoid heavy physical lifting", actionPage: "garbha-wellness", actionLabel: "Wellness" }
    ];
  } else if (week <= 12) {
    return [
      { text: "Book 11-13 week Nuchal Translucency (NT) scan", actionPage: "medical-timeline", actionLabel: "NT Scan" },
      { text: "Discuss prenatal genetic screening with your OB-GYN", actionPage: "appointments", actionLabel: "Doctor Visit" },
      { text: "Maintain daily iron and folic acid compliance", actionPage: "medicine", actionLabel: "Medicine" }
    ];
  } else if (week <= 16) {
    return [
      { text: "Begin gentle 20-min daily prenatal walking or stretches", actionPage: "yoga", actionLabel: "Yoga" },
      { text: "Switch to comfortable supportive cotton maternity wear" },
      { text: "Track blood pressure reading in BloomNest Vitals", actionPage: "health-tracker", actionLabel: "Log BP" }
    ];
  } else if (week <= 20) {
    return [
      { text: "Book comprehensive Level-II Anomaly Ultrasound scan", actionPage: "medical-timeline", actionLabel: "Level-II Scan" },
      { text: "Observe for first gentle flutter sensations (quickening)", actionPage: "kick-counter", actionLabel: "Kick Counter" },
      { text: "Begin sleeping on your left lateral side with pillows" }
    ];
  } else if (week <= 24) {
    return [
      { text: "Practice daily evening baby kick counting (aim for 10 kicks)", actionPage: "kick-counter", actionLabel: "Kick Counter" },
      { text: "Schedule upcoming 24-28 Week Glucose Tolerance (OGTT) test", actionPage: "medical-timeline", actionLabel: "OGTT Lab" },
      { text: "Elevate feet for 15 minutes to reduce evening pedal swelling" }
    ];
  } else if (week <= 28) {
    return [
      { text: "Complete Oral Glucose Tolerance (OGTT) fasting screening", actionPage: "medical-timeline", actionLabel: "OGTT Lab" },
      { text: "Consult doctor regarding routine Tdap vaccination schedule", actionPage: "medical-timeline", actionLabel: "Tdap Shot" },
      { text: "Check hemoglobin baseline (maintain iron-rich diet)", actionPage: "nutrition", actionLabel: "Nutrition" }
    ];
  } else if (week <= 32) {
    return [
      { text: "Schedule third trimester growth & umbilical Doppler scan", actionPage: "medical-timeline", actionLabel: "Growth Scan" },
      { text: "Maintain active daily fetal movement charting", actionPage: "kick-counter", actionLabel: "Kick Counter" },
      { text: "Stay hydrated to support optimal amniotic fluid (AFI)", actionPage: "health-tracker", actionLabel: "Log Water" }
    ];
  } else if (week <= 36) {
    return [
      { text: "Pack hospital labor bag for mother, newborn, and birth partner", actionPage: "hospital-bag", actionLabel: "Hospital Bag" },
      { text: "Finalize hospital route, emergency taxi/driver contact", actionPage: "emergency-contacts", actionLabel: "Emergency" },
      { text: "Practice diaphragmatic labor breathing in BloomNest Yoga", actionPage: "yoga", actionLabel: "Yoga" }
    ];
  } else {
    return [
      { text: "Keep hospital bags readily accessible near the front door", actionPage: "hospital-bag", actionLabel: "Hospital Bag" },
      { text: "Monitor for regular uterine contractions (use Contraction Timer)", actionPage: "contraction-timer", actionLabel: "Contraction Timer" },
      { text: "Stay calm, rested, and in close touch with your OB-GYN", actionPage: "emergency-contacts", actionLabel: "Doctor Contact" }
    ];
  }
};

// Compassionate Partner / Dad tips tailored to gestational week
const getPartnerTip = (week: number): string => {
  if (week <= 8) {
    return "Morning sickness and hormone spikes peak now. Keep fresh ginger water, lemon slices, or light crackers within arm's reach by her bedside before she steps out of bed!";
  } else if (week <= 12) {
    return "Help coordinate and accompany her to the upcoming 12-week First Trimester NT scan. Hearing the rapid little heartbeat together is an unforgettable bonding moment!";
  } else if (week <= 16) {
    return "Her energy is rebounding! Plan an unhurried, gentle evening walk together and make sure her water bottle stays topped up with coconut water or electrolyte fluids.";
  } else if (week <= 20) {
    return "The Level-II Anomaly ultrasound is here! Also, baby's first subtle flutters (quickening) may be felt — place a warm, calm palm on her lower belly during quiet evenings.";
  } else if (week <= 24) {
    return "Fetal hearing is active! Talk, sing, or read a bedtime story to the baby bump. A gentle 10-minute foot or lower back massage will provide instant relief from swelling.";
  } else if (week <= 28) {
    return "Support her during the fasting OGTT test morning. Double-check that prenatal vitamins, calcium, and iron supplements are taken on time with balanced meals.";
  } else if (week <= 32) {
    return "Nesting instinct kicks in. Take charge of nursery room setup, heavy grocery runs, and help position pregnancy pillows so mom sleeps comfortably on her left lateral side.";
  } else if (week <= 36) {
    return "Hospital prep time! Ensure the hospital bag is fully packed and placed near the front door. Review the car fuel level, hospital parking, and emergency route.";
  } else {
    return "Baby is arriving any day! Keep calm, time any contractions using the Contraction Timer, offer sips of water, and reassure mom with warm, steady emotional support.";
  }
};

export const TimelinePage: React.FC = () => {
  const { user, setActivePage, showToast, addJournalEntry } = useApp();
  const currentWeek = user.currentWeek || 24;
  const [selectedWeek, setSelectedWeek] = useState<number>(currentWeek);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [discoveryTab, setDiscoveryTab] = useState<"story" | "checklist" | "photos" | "partner">("story");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedShareText, setCopiedShareText] = useState(false);
  const [loggedSymptoms, setLoggedSymptoms] = useState<Record<string, boolean>>({});

  // Dynamic day-by-day gestational calculation (ACOG compliant)
  const progress = calculatePregnancyProgress(user);

  // Weekly checklist state with localStorage persistence
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("bloomnest_timeline_tasks_v1");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Weekly bump & memory photos with localStorage persistence
  const [bumpPhotos, setBumpPhotos] = useState<Record<number, { dataUrl: string; note: string; date: string }>>(() => {
    try {
      const saved = localStorage.getItem("bloomnest_bump_photos_v1");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const mapScrollContainerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Map canvas coordinate settings
  const canvasWidth = 600;
  const nodeSpacingY = 95;
  const totalCanvasHeight = PREGNANCY_WEEKS_DATA.length * nodeSpacingY + 100;

  // Center the current week node ("YOU ARE HERE") inside the map box on mount
  useEffect(() => {
    if (mapScrollContainerRef.current && viewMode === "map") {
      const currentWeekIndex = currentWeek - 1;
      const currentWeekNodeY = 50 + currentWeekIndex * nodeSpacingY;
      mapScrollContainerRef.current.scrollTop = Math.max(0, currentWeekNodeY - 200);
    }
  }, [currentWeek, viewMode]);

  const detail = PREGNANCY_WEEKS_DATA[selectedWeek - 1] || PREGNANCY_WEEKS_DATA[23];
  const tasksForSelectedWeek = getWeeklyTasks(selectedWeek);
  const currentWeekPhoto = bumpPhotos[selectedWeek];

  // Toggle task completion
  const handleToggleTask = (taskIndex: number) => {
    const taskKey = `w${selectedWeek}_t${taskIndex}`;
    const updated = {
      ...completedTasks,
      [taskKey]: !completedTasks[taskKey]
    };
    setCompletedTasks(updated);
    try {
      localStorage.setItem("bloomnest_timeline_tasks_v1", JSON.stringify(updated));
    } catch {
      // storage unavailable
    }

    // If all tasks for this week become completed, fire celebration confetti
    const allCompleted = tasksForSelectedWeek.every((_, i) =>
      i === taskIndex ? !completedTasks[taskKey] : completedTasks[`w${selectedWeek}_t${i}`]
    );
    if (allCompleted && !completedTasks[taskKey]) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

  // Trimester jump helper
  const scrollToTrimester = (targetWeek: number) => {
    setSelectedWeek(targetWeek);
    if (mapScrollContainerRef.current && viewMode === "map") {
      const nodeY = 50 + (targetWeek - 1) * nodeSpacingY;
      mapScrollContainerRef.current.scrollTo({ top: Math.max(0, nodeY - 200), behavior: "smooth" });
    }
  };

  // Dynamic indefinite article helper ("a" vs "an")
  const getArticle = (word: string): string => {
    if (!word) return "a";
    const cleanWord = word.replace(/^[^\w]+/, "").trim();
    const firstChar = cleanWord.charAt(0).toLowerCase();
    return ["a", "e", "i", "o", "u"].includes(firstChar) ? "an" : "a";
  };

  // Handle bump photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("Please choose an image under 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const updated = {
        ...bumpPhotos,
        [selectedWeek]: {
          dataUrl,
          note: `Week ${selectedWeek} Bump Memory`,
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        }
      };
      setBumpPhotos(updated);
      try {
        localStorage.setItem("bloomnest_bump_photos_v1", JSON.stringify(updated));
      } catch (err) {
        console.error("Storage full", err);
      }
      showToast(`Saved Week ${selectedWeek} Bump Photo! 📸`);
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 }
      });
    };
    reader.readAsDataURL(file);
  };

  // Handle bump photo delete
  const handleDeletePhoto = (weekNum: number) => {
    const updated = { ...bumpPhotos };
    delete updated[weekNum];
    setBumpPhotos(updated);
    try {
      localStorage.setItem("bloomnest_bump_photos_v1", JSON.stringify(updated));
    } catch {}
    showToast(`Removed Week ${weekNum} photo`);
  };

  // Handle one-tap symptom quick log
  const handleQuickLogSymptom = (symptomText: string) => {
    addJournalEntry({
      title: `Week ${selectedWeek} Timeline: ${symptomText}`,
      content: `Logged from Pregnancy Timeline during Week ${selectedWeek}. Experienced symptom: ${symptomText}.`,
      category: "physical",
      mood: "neutral",
      tags: [symptomText.toLowerCase().replace(/\s+/g, "-"), `week-${selectedWeek}`],
      createdAt: new Date().toISOString(),
    });
    setLoggedSymptoms(prev => ({ ...prev, [`${selectedWeek}_${symptomText}`]: true }));
    showToast(`Logged "${symptomText}" to your Health Journal ✓`);
  };

  // Share text generator
  const getShareText = () => {
    const article = getArticle(detail.babySize.name);
    return `🌸 BloomNest Pregnancy Milestone! Week ${detail.week}: Our baby is the size of ${article} ${detail.babySize.name} ${detail.babySize.emoji} (${detail.babySize.length}, ${detail.babySize.weight}). ${progress.daysRemaining} days until arrival! 💕`;
  };

  const handleCopyShareText = () => {
    navigator.clipboard.writeText(getShareText());
    setCopiedShareText(true);
    showToast("Milestone card copied to clipboard! 📋");
    setTimeout(() => setCopiedShareText(false), 2500);
  };

  // Calculate numeric X & Y coordinates for all 40 weeks with gentle horizontal curve
  const nodes = PREGNANCY_WEEKS_DATA.map((w, idx) => {
    const x = 300 + 170 * Math.sin(idx * 0.45);
    const y = 50 + idx * nodeSpacingY;
    return { ...w, x, y };
  });

  // Generate 100% VALID SVG path string connecting every single node
  const pathD = nodes.reduce((acc, curr, i) => {
    if (i === 0) return `M ${curr.x} ${curr.y}`;
    const prev = nodes[i - 1];
    const controlY = (prev.y + curr.y) / 2;
    return `${acc} C ${prev.x} ${controlY}, ${curr.x} ${controlY}, ${curr.x} ${curr.y}`;
  }, "");

  return (
    <div className="h-full bg-[#FAF4EE] dark:bg-[#120E18] text-gray-900 dark:text-rose-100 p-3 sm:p-6 font-sans space-y-6 max-w-6xl mx-auto animate-in fade-in duration-300">
      
      {/* 1. TOP TRIMESTER PROGRESS & LIVE GESTATIONAL AGE BAR */}
      <div className="bg-white/85 dark:bg-[#1A1523]/85 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-[#EDE0D4] dark:border-rose-900/40 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Gestational Progress with Live Week + Days */}
        <div className="w-full md:w-auto flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-100 to-pink-200 dark:from-rose-950/80 dark:to-pink-900/40 border border-rose-300/80 dark:border-rose-800 flex flex-col items-center justify-center text-rose-700 dark:text-rose-200 font-serif shadow-xs">
            <span className="text-base font-extrabold leading-none">{currentWeek}W</span>
            <span className="text-[10px] font-bold text-rose-500 dark:text-rose-300 mt-0.5">
              +{progress.dayOfCurrentWeek}d
            </span>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-rose-100 font-serif">
                {progress.gestationalAgeText} · Trimester {progress.trimester}
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300">
                {progress.progressPercent}% Complete
              </span>
              <span className="text-[11px] font-medium text-gray-500 dark:text-rose-300/80 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-rose-500" />
                <span>{progress.daysRemaining} days to EDD</span>
              </span>
            </div>
            <div className="w-48 sm:w-72 h-2 bg-gray-200 dark:bg-rose-950/40 rounded-full mt-1.5 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-rose-400 via-pink-500 to-rose-600 rounded-full transition-all duration-500"
                style={{ width: `${progress.progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Trimester Fast Jumps & Dual View Toggle */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => scrollToTrimester(1)}
            className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              selectedWeek <= 12
                ? "bg-rose-500 text-white shadow-xs"
                : "bg-rose-50 dark:bg-rose-950/40 text-gray-700 dark:text-rose-200 hover:bg-rose-100"
            }`}
          >
            <span>T1 · W1–12</span>
            {currentWeek > 12 && <span className="text-[10px]">✅</span>}
          </button>

          <button
            onClick={() => scrollToTrimester(13)}
            className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              selectedWeek >= 13 && selectedWeek <= 27
                ? "bg-rose-500 text-white shadow-xs"
                : "bg-rose-50 dark:bg-rose-950/40 text-gray-700 dark:text-rose-200 hover:bg-rose-100"
            }`}
          >
            <span>T2 · W13–27</span>
            {currentWeek >= 13 && currentWeek <= 27 && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>}
          </button>

          <button
            onClick={() => scrollToTrimester(28)}
            className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              selectedWeek >= 28
                ? "bg-rose-500 text-white shadow-xs"
                : "bg-rose-50 dark:bg-rose-950/40 text-gray-700 dark:text-rose-200 hover:bg-rose-100"
            }`}
          >
            <span>T3 · W28–40</span>
            {currentWeek >= 28 && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>}
          </button>

          {/* Dual View Toggle */}
          <div className="ml-auto md:ml-2 pl-2 border-l border-gray-200 dark:border-rose-900/40 flex items-center gap-1">
            <button
              onClick={() => setViewMode("map")}
              title="Botanical Map View"
              className={`p-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === "map"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-gray-100 dark:bg-rose-950/30 text-gray-600 dark:text-rose-300"
              }`}
            >
              <Compass className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              title="Milestone List View"
              className={`p-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === "list"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-gray-100 dark:bg-rose-950/30 text-gray-600 dark:text-rose-300"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. BOX 1 (TOP): 40-WEEK PREGNANCY TIMELINE MAP / LIST (SPACIOUS FULL WIDTH) */}
      <div className="bg-white/90 dark:bg-[#1A1523] p-4 sm:p-5 rounded-[36px] border-2 border-[#EDE0D4] dark:border-rose-900/40 shadow-md relative h-[480px] overflow-hidden flex flex-col">
        
        {/* Sticky Controls Header inside Timeline Box */}
        <div className="shrink-0 z-40 bg-[#FAF4EE]/95 dark:bg-[#14101A]/95 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-[#EDE0D4] dark:border-rose-900/40 flex items-center justify-between mb-2 shadow-xs">
          <div className="font-serif font-bold text-xs sm:text-sm text-gray-900 dark:text-rose-100 flex items-center gap-2">
            <span>🌸 {viewMode === "map" ? "Botanical Vine Map" : "Milestone Timeline Feed"}</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300">
              Week {currentWeek} Active
            </span>
            <span className="text-[11px] text-gray-500 dark:text-rose-300/70 hidden sm:inline">
              (Viewing: Week {selectedWeek})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedWeek(currentWeek);
                if (mapScrollContainerRef.current && viewMode === "map") {
                  const currentWeekNodeY = 50 + (currentWeek - 1) * nodeSpacingY;
                  mapScrollContainerRef.current.scrollTo({ top: Math.max(0, currentWeekNodeY - 200), behavior: "smooth" });
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-[11px] sm:text-xs shadow-xs transition-all flex items-center gap-1.5"
            >
              <span>Reset to W{currentWeek} ✨</span>
            </button>
          </div>
        </div>

        {viewMode === "map" ? (
          /* INNER SCROLLABLE MAP VIEWPORT */
          <div 
            ref={mapScrollContainerRef}
            className="grow overflow-y-auto overflow-x-hidden relative scrollbar-thin scrollbar-thumb-rose-300 rounded-2xl"
          >
            {/* Centered Map Canvas with consistent 600px coordinate grid */}
            <div className="relative mx-auto w-full max-w-[600px]" style={{ height: `${totalCanvasHeight}px` }}>
              
              {/* CONNECTED SVG TRAIL LINES */}
              <svg 
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox={`0 0 ${canvasWidth} ${totalCanvasHeight}`}
                preserveAspectRatio="none"
              >
                {/* Glow Path Line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#F2C4CE"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.6"
                />
                {/* Main Rose Line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#E26989"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Botanical Vine Line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#8BA888"
                  strokeWidth="2.5"
                  strokeDasharray="8 5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              {/* ALL 40 WEEK NODES */}
              {nodes.map((w) => {
                const isCurrent = w.week === currentWeek;
                const isSelected = w.week === selectedWeek;
                const isCompleted = w.week < currentWeek;
                const milestone = CLINICAL_MILESTONES[w.week];
                const hasPhoto = Boolean(bumpPhotos[w.week]);

                const leftPercent = (w.x / canvasWidth) * 100;

                return (
                  <div
                    key={w.week}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all z-20"
                    style={{ left: `${leftPercent}%`, top: `${w.y}px` }}
                  >
                    {/* Milestone Pill Label above Node */}
                    {milestone && (
                      <div className={`text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs mb-1 flex items-center gap-1 whitespace-nowrap z-30 animate-pulse ${milestone.color}`}>
                        <span>{milestone.icon}</span>
                        <span>{milestone.badge}</span>
                      </div>
                    )}

                    {/* PRESENT / CURRENT WEEK HIGHLIGHTED */}
                    {isCurrent ? (
                      <div className="flex flex-col items-center relative">
                        {/* Compact YOU ARE HERE Stamp */}
                        <div className="text-[9px] font-serif font-extrabold uppercase tracking-wider text-[#B85C47] dark:text-rose-300 bg-white/95 dark:bg-black/80 px-2.5 py-0.5 rounded-full border border-rose-300/80 shadow-xs whitespace-nowrap -mb-1 z-30 flex items-center gap-1">
                          <span>YOU ARE HERE ✨</span>
                          {hasPhoto && <span>📸</span>}
                        </div>

                        {/* Current Node Circle */}
                        <button
                          onClick={() => setSelectedWeek(w.week)}
                          className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-white dark:bg-[#1A1523] border-2 border-rose-400 shadow-xl flex flex-col items-center justify-center relative ring-4 ring-rose-300/60 transition-all hover:scale-105"
                        >
                          <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full border border-emerald-400 flex flex-col items-center justify-center p-0.5">
                            <span className="text-[9px] text-emerald-700 dark:text-emerald-300 font-serif">🌿</span>
                            <span className="font-serif font-bold text-base sm:text-lg text-gray-900 dark:text-rose-100">
                              W{w.week}
                            </span>
                          </div>
                        </button>
                      </div>
                    ) : (
                      /* NORMAL & COMPLETED NODES */
                      <button
                        onClick={() => setSelectedWeek(w.week)}
                        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 flex flex-col items-center justify-center font-serif text-[11px] font-bold shadow-xs transition-all hover:scale-110 min-h-[44px] min-w-[44px] relative ${
                          isSelected
                            ? "bg-rose-100 dark:bg-rose-950/80 border-rose-500 text-rose-800 dark:text-rose-100 ring-2 ring-rose-300/60 scale-105"
                            : isCompleted
                            ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-800 dark:text-emerald-300"
                            : "bg-white dark:bg-[#1A1523] border-[#EDE0D4] text-gray-900 dark:text-rose-100"
                        }`}
                      >
                        <span>W{w.week}</span>
                        {isCompleted && (
                          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white text-[7px] font-extrabold flex items-center justify-center border border-white">
                            ✓
                          </span>
                        )}
                        {hasPhoto && !isCompleted && (
                          <span className="absolute -top-1 -left-1 text-[9px]">
                            📸
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}

            </div>
          </div>
        ) : (
          /* LIST FEED VIEW (ALTERNATIVE ACCESSIBLE VIEW) */
          <div className="grow overflow-y-auto space-y-3 p-2 scrollbar-thin scrollbar-thumb-rose-300">
            {PREGNANCY_WEEKS_DATA.map((w) => {
              const isCurrent = w.week === currentWeek;
              const isSelected = w.week === selectedWeek;
              const isCompleted = w.week < currentWeek;
              const milestone = CLINICAL_MILESTONES[w.week];
              const hasPhoto = Boolean(bumpPhotos[w.week]);

              return (
                <div
                  key={w.week}
                  onClick={() => setSelectedWeek(w.week)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? "bg-rose-50 dark:bg-rose-950/60 border-rose-400 ring-2 ring-rose-300/50"
                      : isCurrent
                      ? "bg-amber-50/60 dark:bg-amber-950/30 border-amber-300"
                      : "bg-white dark:bg-[#15111c] border-[#EDE0D4] dark:border-rose-900/30 hover:border-rose-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-serif font-bold text-xs ${
                      isCurrent
                        ? "bg-rose-500 text-white shadow-xs"
                        : isCompleted
                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300"
                        : "bg-gray-100 dark:bg-rose-950/40 text-gray-700 dark:text-rose-200"
                    }`}>
                      W{w.week}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900 dark:text-rose-100 font-serif">
                          Week {w.week} · {w.babySize.name}
                        </span>
                        {isCurrent && (
                          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500 text-white">
                            Current
                          </span>
                        )}
                        {isCompleted && (
                          <span className="text-[10px] text-emerald-600 font-bold">✓ Logged</span>
                        )}
                        {hasPhoto && (
                          <span className="text-[9px] font-medium text-rose-500">📸 Photo</span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-rose-300 mt-0.5 flex items-center gap-2">
                        <span>{w.babySize.emoji} {w.babySize.length}</span>
                        <span>•</span>
                        <span>{w.babySize.weight}</span>
                      </div>
                    </div>
                  </div>

                  {milestone && (
                    <div className={`text-[10px] font-bold px-2.5 py-1 rounded-xl shadow-2xs flex items-center gap-1 ${milestone.color}`}>
                      <span>{milestone.icon}</span>
                      <span>{milestone.badge}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. BOX 2 (UNDERNEATH): WEEK XX DISCOVERY STORY & INTERACTIVE HUB (ZERO-CLUTTER TABBED DESIGN) */}
      <div className="bg-white/95 dark:bg-[#1A1523]/95 backdrop-blur-xl p-5 sm:p-7 rounded-[36px] border-2 border-[#E8DCD0] dark:border-rose-900/50 shadow-xl space-y-6 text-gray-900 dark:text-rose-100">
        
        {/* BOX 2 HERO HEADER: ELEGANT, SPACIOUS & MAGAZINE-STYLED */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#F0E6DD] dark:border-rose-900/30 pb-5">
          
          {/* Left: Week & Baby Size Hero Headline */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-serif font-extrabold uppercase tracking-widest text-[#B85C47] dark:text-rose-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                <span>Week {detail.week} · {detail.trimester === 1 ? "1st Trimester" : detail.trimester === 2 ? "2nd Trimester" : "3rd Trimester"}</span>
              </span>
              {detail.week === currentWeek && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white shadow-2xs">
                  Current Week ✨
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-3 flex-wrap">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 dark:text-rose-50 tracking-tight">
                Size of {getArticle(detail.babySize.name)} {detail.babySize.name}
              </h2>
              <span className="text-2xl sm:text-3xl filter drop-shadow-xs">
                {detail.babySize.emoji || "👶"}
              </span>
            </div>

            {/* Subtle Pill Metrics */}
            <div className="flex items-center gap-2 pt-0.5">
              <span className="px-2.5 py-1 rounded-full bg-[#FAF4EE] dark:bg-rose-950/40 border border-[#EDE0D4] dark:border-rose-900/40 text-[11px] font-bold text-gray-700 dark:text-rose-200">
                📏 Length: {detail.babySize.length}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-[#FAF4EE] dark:bg-rose-950/40 border border-[#EDE0D4] dark:border-rose-900/40 text-[11px] font-bold text-gray-700 dark:text-rose-200">
                ⚖️ Weight: {detail.babySize.weight}
              </span>
            </div>
          </div>

          {/* Right: Quick Action Buttons */}
          <div className="flex items-center gap-2.5 self-stretch md:self-auto justify-end">
            <button
              onClick={() => {
                setIsShareModalOpen(true);
                confetti({ particleCount: 30, spread: 45, origin: { y: 0.5 } });
              }}
              className="px-4 py-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
              title="Share Baby Size Milestone"
            >
              <Share2 className="w-4 h-4 text-rose-600" />
              <span>Share 💌</span>
            </button>

            <button
              onClick={() => setActivePage("baby-development")}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs shadow-md shadow-rose-200 dark:shadow-none transition-all flex items-center justify-center gap-1.5"
            >
              <Baby className="w-4 h-4" />
              <span>3D Fetal Studio</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ELEGANT SEGMENTED TAB SWITCHER */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setDiscoveryTab("story")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              discoveryTab === "story"
                ? "bg-rose-500 text-white shadow-md scale-102"
                : "bg-[#FAF4EE] dark:bg-rose-950/30 text-gray-700 dark:text-rose-200 border border-[#EDE0D4] dark:border-rose-900/40 hover:bg-rose-100/60"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Story & Insights</span>
          </button>

          <button
            onClick={() => setDiscoveryTab("checklist")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              discoveryTab === "checklist"
                ? "bg-rose-500 text-white shadow-md scale-102"
                : "bg-[#FAF4EE] dark:bg-rose-950/30 text-gray-700 dark:text-rose-200 border border-[#EDE0D4] dark:border-rose-900/40 hover:bg-rose-100/60"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Weekly Checklist</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
              discoveryTab === "checklist" ? "bg-white/20 text-white" : "bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-200"
            }`}>
              {tasksForSelectedWeek.filter((_, i) => completedTasks[`w${detail.week}_t${i}`]).length}/{tasksForSelectedWeek.length}
            </span>
          </button>

          <button
            onClick={() => setDiscoveryTab("photos")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              discoveryTab === "photos"
                ? "bg-rose-500 text-white shadow-md scale-102"
                : "bg-[#FAF4EE] dark:bg-rose-950/30 text-gray-700 dark:text-rose-200 border border-[#EDE0D4] dark:border-rose-900/40 hover:bg-rose-100/60"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Bump & Ultrasound Photo</span>
            {bumpPhotos[detail.week] && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                discoveryTab === "photos" ? "bg-white/20 text-white" : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
              }`}>
                ✓ Logged
              </span>
            )}
          </button>

          <button
            onClick={() => setDiscoveryTab("partner")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              discoveryTab === "partner"
                ? "bg-indigo-600 text-white shadow-md scale-102"
                : "bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 border border-indigo-200/80 dark:border-indigo-900/40 hover:bg-indigo-100/60"
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5 text-rose-400" />
            <span>Partner Corner</span>
          </button>
        </div>

        {/* TAB 1: STORY & INSIGHTS VIEW */}
        {discoveryTab === "story" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* SCIENCE FUN FACT BANNER */}
            {detail.funFact && (
              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-pink-500/10 dark:from-amber-950/40 dark:via-rose-950/40 dark:to-pink-950/40 border border-amber-300/60 dark:border-amber-700/50 flex items-start gap-3.5 shadow-xs">
                <div className="w-9 h-9 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0 text-lg shadow-2xs">
                  💡
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-extrabold text-amber-800 dark:text-amber-300 uppercase tracking-widest block">
                    Week {detail.week} Fetal Science Fact
                  </span>
                  <p className="text-xs sm:text-sm text-gray-800 dark:text-rose-100 leading-relaxed font-medium">
                    {detail.funFact}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {/* CARD A: BABY'S MILESTONE & NUTRITION */}
              <div className="p-6 rounded-3xl bg-[#FAF4EE] dark:bg-rose-950/30 border border-[#EDE0D4] dark:border-rose-900/40 space-y-5 shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 font-serif font-bold text-gray-900 dark:text-rose-100 text-sm uppercase tracking-wider">
                    <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/60 flex items-center justify-center text-rose-600 dark:text-rose-300">
                      <Baby className="w-4 h-4" />
                    </div>
                    <span>Baby Development (Week {detail.week})</span>
                  </div>
                  <div className="space-y-2">
                    {detail.milestones.map((m, idx) => (
                      <p key={idx} className="text-sm text-gray-800 dark:text-rose-100 leading-relaxed font-serif flex items-start gap-2">
                        <span className="text-rose-500 font-bold text-xs mt-1">•</span>
                        <span>{m}</span>
                      </p>
                    ))}
                  </div>
                </div>

                {/* Nutrition Advice Box */}
                <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wide">
                    <Apple className="w-4 h-4 text-amber-600" />
                    <span>Nutrition Guidance</span>
                  </div>
                  <div className="space-y-1">
                    {detail.nutritionAdvice.map((nut, idx) => (
                      <p key={idx} className="text-xs text-amber-950 dark:text-amber-100 leading-relaxed font-medium flex items-start gap-1.5">
                        <span className="text-amber-600 font-bold text-[10px] mt-0.5">•</span>
                        <span>{nut}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* CARD B: MOTHER'S BODY & COMMON SYMPTOMS */}
              <div className="p-6 rounded-3xl bg-[#FAF4EE] dark:bg-rose-950/30 border border-[#EDE0D4] dark:border-rose-900/40 space-y-5 shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 font-serif font-bold text-gray-900 dark:text-rose-100 text-sm uppercase tracking-wider">
                    <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/60 flex items-center justify-center text-rose-600 dark:text-rose-300">
                      <Heart className="w-4 h-4" />
                    </div>
                    <span>Mother's Physical Changes</span>
                  </div>
                  <div className="space-y-2">
                    {detail.motherChanges.map((mc, idx) => (
                      <p key={idx} className="text-sm text-gray-800 dark:text-rose-100 leading-relaxed font-serif flex items-start gap-2">
                        <span className="text-pink-500 font-bold text-xs mt-1">•</span>
                        <span>{mc}</span>
                      </p>
                    ))}
                  </div>
                </div>

                {/* Common Symptoms with 1-Tap Quick Log */}
                <div className="p-4 rounded-2xl bg-white dark:bg-[#15111c] border border-rose-100 dark:border-rose-900/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 dark:text-rose-100 uppercase tracking-wide">
                      <Info className="w-3.5 h-3.5 text-rose-500" />
                      <span>Week {detail.week} Symptoms</span>
                    </div>
                    <span className="text-[10px] text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-full">
                      Tap to Log in Journal
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {detail.symptoms.map((sym, idx) => {
                      const cleanSym = sym.trim();
                      const isLogged = loggedSymptoms[`${selectedWeek}_${cleanSym}`];
                      return (
                        <button
                          key={idx}
                          onClick={() => handleQuickLogSymptom(cleanSym)}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 font-medium ${
                            isLogged
                              ? "bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 text-emerald-800 dark:text-emerald-200 shadow-2xs"
                              : "bg-[#FAF4EE] dark:bg-[#1A1523] border-rose-200 hover:border-rose-400 text-gray-700 dark:text-rose-200 hover:bg-rose-50"
                          }`}
                          title="Click to log this symptom to Health Journal"
                        >
                          {isLogged ? <Check className="w-3 h-3 text-emerald-600" /> : <Plus className="w-3 h-3 text-rose-400" />}
                          <span>{cleanSym}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* CLINICAL CHECKUPS & SAFETY PRECAUTIONS ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-blue-900 dark:text-blue-200 font-bold uppercase tracking-wider text-[11px]">
                  <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                  <span>Clinical Checkups & Labs</span>
                </div>
                <div className="space-y-1 text-gray-700 dark:text-blue-100">
                  {detail.checkups.map((c, idx) => (
                    <p key={idx} className="flex items-start gap-1.5">
                      <span className="text-blue-500 font-bold">•</span>
                      <span>{c}</span>
                    </p>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-rose-900 dark:text-rose-200 font-bold uppercase tracking-wider text-[11px]">
                  <Info className="w-3.5 h-3.5 text-rose-600" />
                  <span>Safety Precautions & Things to Avoid</span>
                </div>
                <div className="space-y-1 text-gray-700 dark:text-rose-100">
                  {detail.thingsToAvoid.map((avoid, idx) => (
                    <p key={idx} className="flex items-start gap-1.5">
                      <span className="text-rose-500 font-bold">•</span>
                      <span>{avoid}</span>
                    </p>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: WEEKLY CHECKLIST VIEW */}
        {discoveryTab === "checklist" && (
          <div className="p-6 sm:p-7 rounded-3xl bg-[#FAF4EE] dark:bg-rose-950/30 border border-[#EDE0D4] dark:border-rose-900/40 space-y-5 shadow-xs animate-in fade-in duration-200 max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EDE0D4] dark:border-rose-900/40 pb-4">
              <div>
                <h3 className="font-serif font-bold text-base sm:text-lg text-gray-900 dark:text-rose-100">
                  Week {detail.week} Action Checklist
                </h3>
                <p className="text-xs text-gray-500 dark:text-rose-300/80 mt-0.5">
                  Essential prenatal tasks, wellness practices, and medical screenings for this week.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-rose-600 dark:text-rose-300 bg-white dark:bg-black/40 px-3 py-1 rounded-full border border-rose-200 dark:border-rose-800">
                  {tasksForSelectedWeek.filter((_, i) => completedTasks[`w${detail.week}_t${i}`]).length} of {tasksForSelectedWeek.length} Completed
                </span>
              </div>
            </div>

            {/* Checklist items */}
            <div className="space-y-3">
              {tasksForSelectedWeek.map((taskItem, i) => {
                const isChecked = Boolean(completedTasks[`w${detail.week}_t${i}`]);
                return (
                  <div
                    key={i}
                    className={`flex items-start justify-between gap-3 p-4 rounded-2xl text-xs sm:text-sm transition-all border ${
                      isChecked
                        ? "bg-white/60 dark:bg-black/30 border-emerald-200/60 dark:border-emerald-900/40 text-gray-400 dark:text-gray-500"
                        : "bg-white dark:bg-[#15111c] border-[#EDE0D4] dark:border-rose-900/40 text-gray-800 dark:text-rose-100 shadow-2xs hover:border-rose-300"
                    }`}
                  >
                    <div
                      onClick={() => handleToggleTask(i)}
                      className="flex items-start gap-3 cursor-pointer grow select-none"
                    >
                      {isChecked ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <span className={`leading-relaxed font-medium ${isChecked ? "line-through" : ""}`}>
                        {taskItem.text}
                      </span>
                    </div>

                    {/* Smart Action Link */}
                    {taskItem.actionPage && taskItem.actionLabel && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePage(taskItem.actionPage!);
                        }}
                        className="shrink-0 px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/60 dark:hover:bg-rose-800 text-rose-800 dark:text-rose-200 font-bold text-xs flex items-center gap-1 transition-all shadow-2xs"
                        title={`Open ${taskItem.actionLabel}`}
                      >
                        <span>{taskItem.actionLabel}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-rose-600 dark:text-rose-300" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: BUMP & ULTRASOUND PHOTO VIEW */}
        {discoveryTab === "photos" && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#FAF4EE] dark:bg-rose-950/30 border border-[#EDE0D4] dark:border-rose-900/40 space-y-6 shadow-xs animate-in fade-in duration-200 max-w-2xl mx-auto text-center">
            <div>
              <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-rose-100">
                Week {detail.week} Bump & Ultrasound Photo Memory
              </h3>
              <p className="text-xs text-gray-500 dark:text-rose-300/80 mt-1">
                Preserve your beautiful pregnancy moments week-by-week.
              </p>
            </div>

            {currentWeekPhoto ? (
              <div className="bg-white dark:bg-[#14101A] p-5 rounded-3xl border border-rose-200 dark:border-rose-900/40 shadow-md space-y-4 max-w-md mx-auto">
                <img
                  src={currentWeekPhoto.dataUrl}
                  alt={`Week ${detail.week} Bump Memory`}
                  className="w-full h-64 object-cover rounded-2xl border border-rose-100 shadow-inner"
                />
                <div className="flex items-center justify-between pt-1">
                  <div className="text-left">
                    <div className="text-sm font-bold text-gray-900 dark:text-rose-100 font-serif">
                      {currentWeekPhoto.note}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-rose-300 flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-rose-400" />
                      <span>{currentWeekPhoto.date}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeletePhoto(detail.week)}
                    className="p-2 text-gray-400 hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-md mx-auto">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-10 px-6 rounded-3xl border-2 border-dashed border-rose-300/80 dark:border-rose-800 hover:border-rose-500 bg-white/70 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 flex flex-col items-center justify-center gap-3 transition-all hover:bg-rose-50/60 shadow-2xs group cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-900/60 flex items-center justify-center text-rose-600 dark:text-rose-300 group-hover:scale-110 transition-transform">
                    <Camera className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-sm font-bold block">Upload Week {detail.week} Photo</span>
                    <span className="text-xs text-gray-500 dark:text-rose-300/70">JPG, PNG or WEBP up to 5MB</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PARTNER CORNER VIEW */}
        {discoveryTab === "partner" && (
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-50/80 via-purple-50/40 to-pink-50/30 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-pink-950/10 border border-indigo-200/80 dark:border-indigo-900/40 space-y-5 shadow-xs animate-in fade-in duration-200 max-w-3xl mx-auto">
            <div className="flex items-center justify-between border-b border-indigo-100 dark:border-indigo-900/40 pb-4">
              <div className="flex items-center gap-2.5 font-serif font-bold text-indigo-950 dark:text-indigo-200 text-base uppercase tracking-wider">
                <div className="w-9 h-9 rounded-2xl bg-indigo-100 dark:bg-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <span>Partner Corner · Dad's Guide for Week {detail.week}</span>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(`💙 BloomNest Partner Tip (Week ${detail.week}): ${getPartnerTip(detail.week)}`);
                  showToast("Copied partner tip to clipboard! 📋");
                }}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-200 text-xs font-bold hover:bg-indigo-50 transition-all flex items-center gap-1.5 shadow-2xs"
                title="Copy tip to share with partner"
              >
                <span>Share with Dad</span>
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-white/90 dark:bg-[#14101A]/80 border border-indigo-100 dark:border-indigo-900/40 shadow-xs">
              <p className="text-sm sm:text-base text-indigo-950 dark:text-indigo-100 leading-relaxed font-serif">
                "{getPartnerTip(detail.week)}"
              </p>
            </div>

            <div className="text-xs text-indigo-800/80 dark:text-indigo-300/80 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Tip: Share this with your partner so they know exactly how to best support you this week!</span>
            </div>
          </div>
        )}

        {/* BOX 2 BOTTOM ROW */}
        <div className="pt-3 border-t border-[#F0E6DD] dark:border-rose-900/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-gray-500 dark:text-rose-300/80">
            Select any of the 40 weeks on the map above to view that week's complete story.
          </div>

          <button
            onClick={() => setActivePage("ai-assistant")}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 text-purple-700 dark:text-purple-300 font-bold shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span>Ask BloomNest AI About Week {detail.week}</span>
          </button>
        </div>

      </div>

      {/* SHARE BABY SIZE MODAL POPUP */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 max-w-md w-full border-2 border-rose-200 dark:border-rose-900 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-rose-900/40 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-500" />
                <h3 className="font-serif font-bold text-base text-gray-900 dark:text-rose-100">
                  Share Baby Size Milestone
                </h3>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-rose-200 p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Aesthetic Card Preview */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-100/70 dark:from-rose-950/60 dark:to-pink-900/30 border border-rose-200 dark:border-rose-800 text-center space-y-2">
              <div className="text-4xl">{detail.babySize.emoji || "👶"}</div>
              <div className="font-serif font-extrabold text-xl text-rose-900 dark:text-rose-100">
                Week {detail.week} Milestone
              </div>
              <div className="text-sm font-semibold text-rose-700 dark:text-rose-300">
                Baby is as big as {getArticle(detail.babySize.name)} {detail.babySize.name}!
              </div>
              <div className="text-xs text-gray-600 dark:text-rose-200/80 flex items-center justify-center gap-3 pt-1">
                <span>📏 {detail.babySize.length}</span>
                <span>•</span>
                <span>⚖️ {detail.babySize.weight}</span>
                <span>•</span>
                <span>⏳ {progress.daysRemaining} days left</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={handleCopyShareText}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all hover:opacity-95"
              >
                {copiedShareText ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedShareText ? "Copied to Clipboard! ✓" : "Copy Milestone Update"}</span>
              </button>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(getShareText())}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all text-center"
              >
                <span>Share via WhatsApp 💬</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TimelinePage;
