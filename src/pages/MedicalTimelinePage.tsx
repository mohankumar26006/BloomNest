import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { INDIAN_SCANS } from "../data/medicalScans";
import {
  SCENARIO_HEALTHY,
  SCENARIO_GDM,
  SCENARIO_ANEMIA,
  INITIAL_TIMELINE_ANALYSIS,
} from "../data/scanLabTimelineData";
import { ScanMilestone, ScanLabMilestoneRecord, TimelineAnalysisResult } from "../types";
import { ScanReportUploadModal } from "../components/ScanReportUploadModal";
import { BiomarkerTrajectoryCharts } from "../components/timeline/BiomarkerTrajectoryCharts";
import { CrossModalCorrelationMatrix } from "../components/timeline/CrossModalCorrelationMatrix";
import { ChronologicalScanLabFeed } from "../components/timeline/ChronologicalScanLabFeed";
import { TimelineAIAnalysisCard } from "../components/timeline/TimelineAIAnalysisCard";
import { LogScanLabResultModal } from "../components/timeline/LogScanLabResultModal";
import {
  Card,
  Button,
  Badge,
  PageHeading,
  CardHeading,
  BodyText,
  Caption,
} from "../components/ui";
import {
  Stethoscope,
  CheckCircle2,
  FileText,
  HelpCircle,
  AlertCircle,
  ChevronRight,
  X,
  Upload,
  Eye,
  FileCheck,
  Plus,
  Sparkles,
  Calendar,
  Activity,
  Layers,
  BookOpen,
  Droplets,
  Utensils,
  ShieldCheck,
  Search,
  Heart,
  ArrowRight,
  Info,
  Check,
  Clock,
  Filter,
} from "lucide-react";

export const MedicalTimelinePage: React.FC = () => {
  const { user, vitals, setActivePage, getScanReportsByScanId } = useApp();

  // Top view mode: Simple Mom-Friendly Guide vs Advanced Clinical EHR Analysis
  const [viewMode, setViewMode] = useState<"guide" | "analysis">("guide");

  // State for timeline records and analysis
  const [records, setRecords] = useState<ScanLabMilestoneRecord[]>(SCENARIO_HEALTHY);
  const [analysis, setAnalysis] = useState<TimelineAnalysisResult>(INITIAL_TIMELINE_ANALYSIS);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [activeScenario, setActiveScenario] = useState<"healthy" | "gdm" | "anemia">("healthy");

  // Jargon Decoder search / modal state
  const [showJargonDecoder, setShowJargonDecoder] = useState<boolean>(false);
  const [decoderSearch, setDecoderSearch] = useState<string>("");

  // Modal states
  const [logModalRecord, setLogModalRecord] = useState<ScanLabMilestoneRecord | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);

  // Month Explorer states
  const calculateDefaultMonth = (): number => {
    if (!user.currentWeek) return 5;
    const w = user.currentWeek;
    if (w <= 4) return 1;
    if (w <= 8) return 2;
    if (w <= 13) return 3;
    if (w <= 17) return 4;
    if (w <= 22) return 5;
    if (w <= 27) return 6;
    if (w <= 31) return 7;
    if (w <= 35) return 8;
    return 9;
  };

  const [selectedMonth, setSelectedMonth] = useState<number>(calculateDefaultMonth());
  const [selectedTrimester, setSelectedTrimester] = useState<number>(
    user.trimester || (calculateDefaultMonth() <= 3 ? 1 : calculateDefaultMonth() <= 6 ? 2 : 3)
  );
  const [activeDrawerScan, setActiveDrawerScan] = useState<ScanMilestone | null>(null);
  const [activeUploadModalScan, setActiveUploadModalScan] = useState<ScanMilestone | null>(null);

  // Month Definitions with Gestational Week Windows
  const MONTH_DEFINITIONS = [
    { month: 1, trimester: 1, weeks: "Weeks 1 – 4", title: "Month 1 · Early Care & Pregnancy Confirmation", sub: "Preconception health & baseline blood panel" },
    { month: 2, trimester: 1, weeks: "Weeks 5 – 8", title: "Month 2 · Viability & Heartbeat Check", sub: "First dating ultrasound & early thyroid check" },
    { month: 3, trimester: 1, weeks: "Weeks 9 – 13+6", title: "Month 3 · First Trimester Screening", sub: "NT ultrasound scan & Dual Marker screening" },
    { month: 4, trimester: 2, weeks: "Weeks 14 – 17", title: "Month 4 · Second Trimester Antenatal Care", sub: "Routine checkup & optional quadruple screen" },
    { month: 5, trimester: 2, weeks: "Weeks 18 – 22", title: "Month 5 · The Big Level-II Anomaly Scan 🌟", sub: "Head-to-toe structural check of baby's organs" },
    { month: 6, trimester: 2, weeks: "Weeks 23 – 27", title: "Month 6 · Sugar & Wellness Screening", sub: "75g OGTT gestational diabetes test & CBC" },
    { month: 7, trimester: 3, weeks: "Weeks 28 – 31", title: "Month 7 · Third Trimester Growth & Tdap", sub: "Growth monitoring, Tdap shot & blood test" },
    { month: 8, trimester: 3, weeks: "Weeks 32 – 35", title: "Month 8 · Fetal Growth & Umbilical Doppler", sub: "Fetal weight percentiles & blood flow check" },
    { month: 9, trimester: 3, weeks: "Weeks 36 – 40", title: "Month 9 · Birth Readiness & Final Profile", sub: "Head-down position check & term biophysical profile" },
  ];

  const activeMonthInfo = MONTH_DEFINITIONS.find((m) => m.month === selectedMonth) || MONTH_DEFINITIONS[4];

  // Week-First Overlap Filter Engine for Explorer
  const filteredScans = INDIAN_SCANS.filter((scan) => {
    if (selectedMonth === 1 && scan.weeks.includes("1 – 4")) return true;
    if (selectedMonth === 2 && (scan.weeks.includes("5 – 8") || scan.weeks.includes("6 – 8"))) return true;
    if (selectedMonth === 3 && scan.weeks.includes("11 – 13+6")) return true;
    if (selectedMonth === 4 && scan.weeks.includes("14 – 17")) return true;
    if (selectedMonth === 5 && scan.weeks.includes("18 – 22")) return true;
    if (selectedMonth === 6 && scan.weeks.includes("24 – 28")) return true;
    if (selectedMonth === 7 && (scan.weeks.includes("24 – 28") || scan.weeks.includes("28 – 31"))) return true;
    if (selectedMonth === 8 && scan.weeks.includes("32 – 35")) return true;
    if (selectedMonth === 9 && scan.weeks.includes("36 – 40")) return true;
    return false;
  });

  // Table Filter State for 40-Week Report Tracker
  const [tableFilter, setTableFilter] = useState<"all" | "attached" | "missing" | "upcoming">("all");

  // Helper to determine status for each scan in tracker table
  const getScanStatusInfo = (scan: ScanMilestone) => {
    const attachedReports = getScanReportsByScanId(scan.id);
    const hasAttached = attachedReports.length > 0;

    const matches = scan.weeks.match(/\d+/g);
    let startWeek = 1;
    let endWeek = 40;
    if (matches && matches.length > 0) {
      startWeek = parseInt(matches[0], 10);
      endWeek = parseInt(matches[matches.length - 1], 10);
    }

    const currentWeek = user.currentWeek || 24;

    if (hasAttached) {
      return {
        type: "attached" as const,
        label: `Report Attached (${attachedReports.length})`,
        isComplete: true,
        reportCount: attachedReports.length,
        startWeek,
        endWeek,
      };
    }

    if (currentWeek >= startWeek) {
      return {
        type: "missing" as const,
        label: currentWeek <= endWeek ? "Due Now (Attach Report)" : "Report Not Attached",
        isComplete: false,
        reportCount: 0,
        startWeek,
        endWeek,
      };
    }

    return {
      type: "upcoming" as const,
      label: `Upcoming (Week ${startWeek})`,
      isComplete: false,
      reportCount: 0,
      startWeek,
      endWeek,
    };
  };

  const allScansWithStatus = INDIAN_SCANS.map((s) => ({
    scan: s,
    status: getScanStatusInfo(s),
  }));

  const attachedScansCount = allScansWithStatus.filter((s) => s.status.type === "attached").length;
  const missingScansCount = allScansWithStatus.filter((s) => s.status.type === "missing").length;
  const upcomingScansCount = allScansWithStatus.filter((s) => s.status.type === "upcoming").length;
  const dueScansTotal = attachedScansCount + missingScansCount;
  const completionPercentage = dueScansTotal > 0 ? Math.round((attachedScansCount / dueScansTotal) * 100) : 100;

  const displayedTableScans = allScansWithStatus.filter((item) => {
    if (tableFilter === "attached") return item.status.type === "attached";
    if (tableFilter === "missing") return item.status.type === "missing";
    if (tableFilter === "upcoming") return item.status.type === "upcoming";
    return true;
  });

  // Friendly Jargon Dictionary
  const JARGON_DICTIONARY = [
    { term: "CRL", name: "Crown-Rump Length", meaning: "Baby's length from top of head to little bottom.", normal: "Used in Weeks 6–13 to fix your exact due date.", status: "Normal & Safe ✅" },
    { term: "FHR", name: "Fetal Heart Rate", meaning: "How fast baby's tiny heart is beating in one minute.", normal: "Normal range is 120 – 160 beats per minute.", status: "Strong Rhythm 💖" },
    { term: "NT", name: "Nuchal Translucency", meaning: "Clear, protective fluid cushion behind baby's neck.", normal: "Healthy threshold is under 2.5 mm.", status: "Optimal Finding ✅" },
    { term: "BPD", name: "Biparietal Diameter", meaning: "Width across baby's head (ear to ear).", normal: "Ensures healthy brain and cranial growth.", status: "Growing Nicely 🧠" },
    { term: "HC", name: "Head Circumference", meaning: "Distance all the way around baby's head.", normal: "Monitors symmetrical brain growth on schedule.", status: "Symmetrical ✅" },
    { term: "AC", name: "Abdominal Circumference", meaning: "Measurement around baby's little tummy.", normal: "Best indicator of baby's weight and nutrition.", status: "Well-Nourished 🍼" },
    { term: "FL", name: "Femur Length", meaning: "Length of baby's thigh bone (longest bone).", normal: "Reflects baby's height and skeletal strength.", status: "Healthy Bones 🦴" },
    { term: "EFW", name: "Estimated Fetal Weight", meaning: "Baby's estimated weight calculated by ultrasound.", normal: "Within the 10th to 90th percentile for your week.", status: "On Track ⚖️" },
    { term: "AFI", name: "Amniotic Fluid Index", meaning: "Depth of the warm water cushion protecting baby.", normal: "Healthy range is 8 cm to 18 cm.", status: "Safe Water Cushion 🌊" },
    { term: "Hb", name: "Hemoglobin", meaning: "Iron-rich protein in mama's blood carrying oxygen.", normal: "Optimal maternal range is 11.0 to 13.5 g/dL.", status: "Energized & Strong 🩸" },
    { term: "TSH", name: "Thyroid Stimulating Hormone", meaning: "Hormone managing mama's energy and baby's brain.", normal: "Ideal in pregnancy when under 2.5 mIU/L.", status: "Balanced Metabolism ⚡" },
    { term: "OGTT", name: "75g Oral Glucose Test", meaning: "Checks how gently mama's body handles natural sugar.", normal: "Fasting < 92 mg/dL, 2-hr < 153 mg/dL.", status: "Healthy Glucose 🍯" },
    { term: "Cephalic", name: "Head-Down Position", meaning: "Baby is nestled head-down facing your back.", normal: "Most babies settle here between Weeks 32 and 36.", status: "Ideal for Birth 👶" },
    { term: "Placenta Grade", name: "Placental Maturity", meaning: "How mature the placenta is as due date approaches.", normal: "Grade 0 early on, Grade II/III at full term.", status: "Healthy Placenta 🛡️" },
  ];

  const filteredJargon = JARGON_DICTIONARY.filter(
    (j) =>
      j.term.toLowerCase().includes(decoderSearch.toLowerCase()) ||
      j.name.toLowerCase().includes(decoderSearch.toLowerCase()) ||
      j.meaning.toLowerCase().includes(decoderSearch.toLowerCase())
  );

  // Call the server endpoint to analyze current records with Gemini AI
  const executeAnalysis = async (currentRecords: ScanLabMilestoneRecord[], scenarioKey?: string) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/scan-lab-timeline/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient: {
            fullName: user.fullName || "Mom",
            currentWeek: user.currentWeek || 24,
            trimester: user.trimester || 2,
            bloodGroup: user.bloodGroup || "O+",
          },
          records: currentRecords,
          vitals: vitals || [],
          caseType: scenarioKey || activeScenario,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.analysis) {
          setAnalysis(data.analysis);
        }
      }
    } catch (err) {
      console.warn("Timeline analysis fetch error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Switch between realistic clinical scenarios
  const handleSelectScenario = (scenario: "healthy" | "gdm" | "anemia") => {
    setActiveScenario(scenario);
    let newRecords = SCENARIO_HEALTHY;
    if (scenario === "gdm") newRecords = SCENARIO_GDM;
    if (scenario === "anemia") newRecords = SCENARIO_ANEMIA;
    setRecords(newRecords);
    executeAnalysis(newRecords, scenario);
  };

  // Handle saving a new or edited record
  const handleSaveRecord = (savedRecord: ScanLabMilestoneRecord) => {
    setRecords((prev) => {
      const existingIdx = prev.findIndex((r) => r.id === savedRecord.id);
      let updated: ScanLabMilestoneRecord[];
      if (existingIdx >= 0) {
        updated = [...prev];
        updated[existingIdx] = savedRecord;
      } else {
        updated = [...prev, savedRecord].sort((a, b) => a.gestationalWeek - b.gestationalWeek);
      }
      executeAnalysis(updated);
      return updated;
    });
  };

  // Convert ScanLabMilestoneRecord to compatible ScanMilestone for the upload modal
  const handleOpenReportModalForRecord = (record: ScanLabMilestoneRecord) => {
    const compatibleScan: ScanMilestone = {
      id: record.milestoneId || record.id,
      title: record.title,
      trimester: record.trimester,
      weeks: `Week ${record.gestationalWeek}`,
      type: record.type,
      shortDesc: record.findingsSummary,
      purpose: record.findingsSummary,
      prepTips: ["Bring all previous medical reports and maintain necessary fasting if required."],
      keyMetrics: record.keyBiomarkers.map((b) => b.name),
      doctorQuestions: [],
      classification: "RECOMMENDED",
    };
    setActiveUploadModalScan(compatibleScan);
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-300 max-w-7xl mx-auto font-sans">
      {/* 1. WARM & PEACEFUL HERO HEADER */}
      <Card variant="gradient" radius="3xl" className="p-6 sm:p-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="rose" size="sm" icon={<Heart className="w-3.5 h-3.5" />}>
                Mother & Baby Antenatal Care
              </Badge>

              {user.currentWeek ? (
                <Badge variant="sage" size="sm">
                  Your Current Stage: Week {user.currentWeek} (Trimester {user.trimester || 2})
                </Badge>
              ) : (
                <Badge variant="lavender" size="sm">
                  40-Week Gentle Roadmap
                </Badge>
              )}
            </div>

            <PageHeading>Pregnancy Scans & Lab Guide 🌸</PageHeading>

            <BodyText>
              A calm, simple guide to every scan and routine test for you and your baby — with plain-English explanations and zero confusing jargon.
            </BodyText>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setShowJargonDecoder(true)}
              leftIcon={<BookOpen className="w-4 h-4 text-amber-500" />}
            >
              Jargon Decoder 📖
            </Button>

            <Button
              variant="secondary"
              size="md"
              onClick={() => setActivePage("reports")}
              leftIcon={<FileText className="w-4 h-4 text-rose-500" />}
            >
              My Reports
            </Button>
          </div>
        </div>

        {/* View Mode Switcher Tabs */}
        <div className="pt-2 flex items-center justify-between gap-2 border-t border-rose-100 dark:border-rose-900/40 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("guide")}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all ${
                viewMode === "guide"
                  ? "bg-rose-500 text-white shadow-sm"
                  : "bg-white/80 dark:bg-[#1A1523]/80 text-gray-700 dark:text-rose-200 hover:bg-rose-100 dark:hover:bg-rose-950/60 border border-rose-100 dark:border-rose-900/40"
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Mom's Peaceful Guide</span>
            </button>

            <button
              onClick={() => setViewMode("analysis")}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all ${
                viewMode === "analysis"
                  ? "bg-rose-500 text-white shadow-sm"
                  : "bg-white/80 dark:bg-[#1A1523]/80 text-gray-700 dark:text-rose-200 hover:bg-rose-100 dark:hover:bg-rose-950/60 border border-rose-100 dark:border-rose-900/40"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Detailed Clinical Analysis 🔬</span>
            </button>
          </div>

          <div className="text-[11px] font-bold text-rose-600 dark:text-rose-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>ICMR & FOGSI Certified Protocol</span>
          </div>
        </div>
      </Card>

      {/* VIEW MODE 1: MOM'S PEACEFUL & SIMPLE GUIDE (DEFAULT) */}
      {viewMode === "guide" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* TRIMESTER TABS */}
          <div className="flex items-center gap-2 border-b border-rose-100 dark:border-rose-900/40 pb-2 overflow-x-auto">
            {[
              { tri: 1, label: "Trimester 1 (Months 1–3)", sub: "Early Days & Viability" },
              { tri: 2, label: "Trimester 2 (Months 4–6)", sub: "Organ Checks & Sugar" },
              { tri: 3, label: "Trimester 3 (Months 7–9)", sub: "Growth & Birth Ready" },
            ].map((t) => {
              const isSelected = selectedTrimester === t.tri;
              return (
                <button
                  key={t.tri}
                  onClick={() => {
                    setSelectedTrimester(t.tri);
                    // Automatically jump to the first month of that trimester
                    const firstMonthOfTri = (t.tri - 1) * 3 + 1;
                    setSelectedMonth(firstMonthOfTri);
                  }}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 text-left ${
                    isSelected
                      ? "bg-rose-500 text-white shadow-sm"
                      : "bg-white dark:bg-[#1A1523] text-gray-700 dark:text-rose-200 border border-rose-100 dark:border-rose-900/40 hover:bg-rose-50"
                  }`}
                >
                  <div>{t.label}</div>
                  <div className={`text-[10px] ${isSelected ? "text-rose-100" : "text-gray-400 dark:text-rose-400"}`}>
                    {t.sub}
                  </div>
                </button>
              );
            })}
          </div>

          {/* D. MONTH SELECTOR PILLS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-rose-300">
              <span>Select Month to View Checks:</span>
              <span className="text-rose-600 dark:text-rose-300">Currently in {activeMonthInfo.weeks}</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
              {MONTH_DEFINITIONS.map((m) => {
                const isSelected = selectedMonth === m.month;
                const isUserCurrentMonth = calculateDefaultMonth() === m.month && !!user.currentWeek;

                return (
                  <button
                    key={m.month}
                    onClick={() => {
                      setSelectedMonth(m.month);
                      setSelectedTrimester(m.trimester);
                    }}
                    className={`p-2.5 rounded-2xl border text-center transition-all relative ${
                      isSelected
                        ? "bg-rose-500 text-white border-rose-600 shadow-md scale-102"
                        : "bg-white dark:bg-[#1A1523] border-rose-100 dark:border-rose-900/40 text-gray-800 dark:text-rose-200 hover:border-rose-300"
                    }`}
                  >
                    {isUserCurrentMonth && (
                      <span className="absolute -top-2 left-1/2 transform -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[8px] font-black uppercase">
                        Current
                      </span>
                    )}
                    <div className="text-xs font-extrabold">Month {m.month}</div>
                    <div className={`text-[10px] font-semibold ${isSelected ? "opacity-90" : "text-gray-500 dark:text-rose-400"}`}>
                      {m.weeks}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* E. MONTH HEADER & SCAN CARDS GRID */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-rose-100 dark:border-rose-900/40 pb-3">
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-gray-900 dark:text-rose-100">
                  {activeMonthInfo.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-rose-300">{activeMonthInfo.sub}</p>
              </div>

              <Badge variant="rose" size="sm">
                {filteredScans.length} Check(s)
              </Badge>
            </div>

            {filteredScans.length === 0 ? (
              <Card variant="flat" radius="3xl" className="p-8 text-center space-y-3">
                <div className="text-3xl">🌿</div>
                <CardHeading>No Major Routine Scan Listed for Month {selectedMonth}</CardHeading>
                <BodyText className="max-w-md mx-auto">
                  Regular antenatal care continues throughout pregnancy. If your doctor requests an individual check during this stage, you can log it here anytime.
                </BodyText>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredScans.map((scan) => {
                  const categoryType = scan.type || "ULTRASOUND";
                  const categoryLabel =
                    categoryType === "LAB_INVESTIGATION"
                      ? "Maternal Blood / Lab Test 🧪"
                      : categoryType === "FETAL_MONITORING"
                      ? "Baby Heart & Movement 💖"
                      : "Baby Ultrasound Scan 👶";

                  const classification = scan.classification || "RECOMMENDED";
                  const classBadge =
                    classification === "RECOMMENDED"
                      ? "Routine & Essential ✅"
                      : "Doctor's Advice 📋";

                  const attachedReports = getScanReportsByScanId(scan.id);
                  const hasAttachedReports = attachedReports.length > 0;

                  return (
                    <Card
                      key={scan.id}
                      variant="glass"
                      radius="3xl"
                      className="p-5 sm:p-6 space-y-4 flex flex-col justify-between hover:shadow-md transition-all border border-rose-100/80 dark:border-rose-900/40"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                            {categoryLabel}
                          </span>
                          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                            {classBadge}
                          </span>
                        </div>

                        <div>
                          <div className="text-xs font-bold text-rose-600 dark:text-rose-300">
                            Best Scheduled: {scan.weeks}
                          </div>
                          <h4 className="font-serif text-lg font-bold text-gray-900 dark:text-rose-100 mt-0.5">
                            {scan.title}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-rose-200 mt-1.5 leading-relaxed">
                            {scan.shortDesc}
                          </p>

                          {scan.supportNote && (
                            <div className="text-[11px] font-medium text-amber-800 dark:text-amber-200 bg-amber-50/80 dark:bg-amber-950/30 p-2.5 rounded-xl mt-2 flex items-start gap-1.5 border border-amber-200/60">
                              <span>💡</span>
                              <span>{scan.supportNote}</span>
                            </div>
                          )}
                        </div>

                        {/* Quick Prep Indicator Badges */}
                        <div className="flex items-center gap-2 pt-1 text-[11px] text-gray-500 dark:text-rose-300 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center gap-1">
                            <Droplets className="w-3 h-3 text-blue-500" />
                            <span>{scan.type === "ULTRASOUND" ? "Full Bladder (Water)" : "Hydrate Normally"}</span>
                          </span>

                          <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center gap-1">
                            <Utensils className="w-3 h-3 text-amber-500" />
                            <span>{scan.id.includes("ogtt") || scan.id.includes("sugar") ? "8-hr Fasting" : "Light Snack OK"}</span>
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-rose-100 dark:border-rose-900/40 flex items-center justify-between gap-2 flex-wrap">
                        {hasAttachedReports ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setActiveUploadModalScan(scan)}
                            className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50"
                            leftIcon={<FileCheck className="w-3.5 h-3.5 text-emerald-600" />}
                          >
                            {attachedReports.length} Report(s) Attached
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setActiveUploadModalScan(scan)}
                            className="text-rose-600 hover:text-rose-700"
                            leftIcon={<Upload className="w-3.5 h-3.5" />}
                          >
                            Attach Report
                          </Button>
                        )}

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setActiveDrawerScan(scan)}
                          rightIcon={<ChevronRight className="w-4 h-4" />}
                        >
                          View Details
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* F. COMPLETE 40-WEEK SCANS & REPORT STATUS TRACKER TABLE */}
          <div className="bg-white dark:bg-[#1A1523] p-5 sm:p-7 rounded-[32px] border border-rose-100 dark:border-rose-900/40 shadow-xs space-y-6">
            
            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rose-100 dark:border-rose-900/40 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>40-Week Antenatal Master Checklist</span>
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                    Week {user.currentWeek || 24} Tracking
                  </span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-gray-900 dark:text-rose-100">
                  All Scans & Reports Status Tracker 📋
                </h3>
                <p className="text-xs text-gray-500 dark:text-rose-300">
                  Quick summary of all required pregnancy investigations. Green checkbox means report is attached; red means report is needed.
                </p>
              </div>

              {/* Stats Counters */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="px-3 py-1.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <div className="text-xs font-bold text-emerald-800 dark:text-emerald-200">
                    {attachedScansCount} Attached
                  </div>
                </div>

                <div className="px-3 py-1.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <div className="text-xs font-bold text-rose-800 dark:text-rose-200">
                    {missingScansCount} Needs Report
                  </div>
                </div>

                <div className="px-3 py-1.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                  <div className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {upcomingScansCount} Upcoming
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-gray-600 dark:text-rose-300">
                  Due Tests Report Completion: {completionPercentage}%
                </span>
                <span className="text-rose-600 dark:text-rose-300">
                  {attachedScansCount} of {dueScansTotal} due reports saved
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-linear-to-r from-rose-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { key: "all", label: `All Scans (${allScansWithStatus.length})` },
                { key: "attached", label: `🟢 Attached (${attachedScansCount})` },
                { key: "missing", label: `🔴 Needs Report (${missingScansCount})` },
                { key: "upcoming", label: `⏳ Upcoming (${upcomingScansCount})` },
              ].map((f) => {
                const isActive = tableFilter === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => setTableFilter(f.key as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      isActive
                        ? "bg-rose-500 text-white shadow-xs"
                        : "bg-gray-100 dark:bg-gray-800/70 text-gray-700 dark:text-rose-200 hover:bg-gray-200"
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-rose-100 dark:border-rose-900/40 text-gray-400 dark:text-rose-300/60 uppercase text-[10px] tracking-wider font-extrabold">
                    <th className="pb-3 pr-4">Timing & Window</th>
                    <th className="pb-3 pr-4">Scan / Investigation Name</th>
                    <th className="pb-3 pr-4">Type</th>
                    <th className="pb-3 pr-4">Report Status</th>
                    <th className="pb-3 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-50 dark:divide-rose-950/40">
                  {displayedTableScans.map(({ scan, status }) => {
                    const isAttached = status.type === "attached";
                    const isMissing = status.type === "missing";
                    const isUpcoming = status.type === "upcoming";

                    return (
                      <tr
                        key={scan.id}
                        className={`transition-colors hover:bg-rose-50/40 dark:hover:bg-rose-950/20 ${
                          isMissing ? "bg-rose-50/20 dark:bg-rose-950/10" : ""
                        }`}
                      >
                        {/* Timing */}
                        <td className="py-3.5 pr-4 whitespace-nowrap">
                          <div className="font-extrabold text-gray-900 dark:text-rose-100">
                            {scan.weeks}
                          </div>
                          <div className="text-[10px] text-rose-600 dark:text-rose-300 font-semibold">
                            Trimester {scan.trimester}
                          </div>
                        </td>

                        {/* Title & Short Description */}
                        <td className="py-3.5 pr-4">
                          <div className="font-bold text-gray-900 dark:text-rose-100 flex items-center gap-1.5">
                            <span>{scan.title}</span>
                          </div>
                          <div className="text-[11px] text-gray-500 dark:text-rose-300/70 line-clamp-1 mt-0.5">
                            {scan.shortDesc}
                          </div>
                        </td>

                        {/* Type */}
                        <td className="py-3.5 pr-4 whitespace-nowrap">
                          <span className="text-[11px] font-semibold text-gray-700 dark:text-rose-200">
                            {scan.type === "ULTRASOUND"
                              ? "👶 Ultrasound"
                              : scan.type === "LAB_INVESTIGATION"
                              ? "🧪 Blood Lab"
                              : "💖 Monitoring"}
                          </span>
                        </td>

                        {/* Report Status with Checkbox Box */}
                        <td className="py-3.5 pr-4 whitespace-nowrap">
                          {isAttached && (
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-md bg-emerald-500 text-white flex items-center justify-center shadow-xs shrink-0">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                              <div>
                                <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                                  Attached ({status.reportCount})
                                </div>
                                <div className="text-[9px] text-emerald-600/80 dark:text-emerald-400">
                                  Report verified
                                </div>
                              </div>
                            </div>
                          )}

                          {isMissing && (
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-md bg-rose-500 text-white flex items-center justify-center shadow-xs shrink-0 animate-pulse">
                                <AlertCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                              </div>
                              <div>
                                <div className="text-xs font-bold text-rose-600 dark:text-rose-400">
                                  Report Not Attached
                                </div>
                                <div className="text-[9px] text-rose-500 dark:text-rose-400/80">
                                  Attach for doctor brief
                                </div>
                              </div>
                            </div>
                          )}

                          {isUpcoming && (
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300 flex items-center justify-center shrink-0">
                                <Clock className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <div className="text-xs font-medium text-gray-600 dark:text-rose-300/80">
                                  Scheduled
                                </div>
                                <div className="text-[9px] text-gray-400 dark:text-rose-300/50">
                                  Week {status.startWeek}
                                </div>
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Quick Action Button */}
                        <td className="py-3.5 text-right whitespace-nowrap">
                          {isAttached ? (
                            <Button
                              variant="secondary"
                              size="xs"
                              onClick={() => setActiveUploadModalScan(scan)}
                              leftIcon={<Eye className="w-3.5 h-3.5 text-emerald-600" />}
                            >
                              View Report
                            </Button>
                          ) : isMissing ? (
                            <Button
                              variant="primary"
                              size="xs"
                              onClick={() => setActiveUploadModalScan(scan)}
                              leftIcon={<Upload className="w-3.5 h-3.5" />}
                              className="bg-rose-500 hover:bg-rose-600 text-white"
                            >
                              Attach Report
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => setActiveDrawerScan(scan)}
                              rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                              className="text-gray-600 dark:text-rose-300"
                            >
                              Prep Tips
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Card View */}
            <div className="sm:hidden space-y-3">
              {displayedTableScans.map(({ scan, status }) => {
                const isAttached = status.type === "attached";
                const isMissing = status.type === "missing";

                return (
                  <div
                    key={scan.id}
                    className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                      isMissing
                        ? "bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60"
                        : "bg-gray-50/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-gray-900 dark:text-rose-100">
                        {scan.weeks}
                      </span>
                      <span className="text-[10px] font-semibold text-gray-500">
                        {scan.type === "ULTRASOUND" ? "👶 Scan" : "🧪 Lab"}
                      </span>
                    </div>

                    <div className="font-bold text-sm text-gray-900 dark:text-rose-100">
                      {scan.title}
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-100 dark:border-gray-700/60">
                      {/* Checkbox badge */}
                      {isAttached ? (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                          <div className="w-4 h-4 rounded-md bg-emerald-500 text-white flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                          <span>Attached</span>
                        </div>
                      ) : isMissing ? (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600">
                          <div className="w-4 h-4 rounded-md bg-rose-500 text-white flex items-center justify-center">
                            <AlertCircle className="w-3 h-3" />
                          </div>
                          <span>Needs Report</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Upcoming</span>
                        </div>
                      )}

                      {/* Action */}
                      {isAttached ? (
                        <Button
                          variant="secondary"
                          size="xs"
                          onClick={() => setActiveUploadModalScan(scan)}
                          leftIcon={<Eye className="w-3 h-3 text-emerald-600" />}
                        >
                          View
                        </Button>
                      ) : isMissing ? (
                        <Button
                          variant="primary"
                          size="xs"
                          onClick={() => setActiveUploadModalScan(scan)}
                          leftIcon={<Upload className="w-3 h-3" />}
                        >
                          Attach
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => setActiveDrawerScan(scan)}
                        >
                          Tips
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* VIEW MODE 2: DETAILED CLINICAL ANALYSIS (OPTIONAL FOR DOCTORS & DETAILED METRICS) */}
      {viewMode === "analysis" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-900 dark:text-rose-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-500 shrink-0" />
              <span>
                <strong>Detailed Clinical Mode:</strong> Longitudinal biomarker tracking, cross-modal correlations, and raw doctor metrics.
              </span>
            </div>
            <button
              onClick={() => setViewMode("guide")}
              className="text-xs font-bold text-rose-600 hover:underline shrink-0 ml-2"
            >
              ← Back to Simple Guide
            </button>
          </div>

          {/* 1. AI Clinical Synthesis Card */}
          <TimelineAIAnalysisCard
            analysis={analysis}
            isAnalyzing={isAnalyzing}
            onRefreshAnalysis={() => executeAnalysis(records)}
            onSelectScenario={handleSelectScenario}
          />

          {/* 2. Interactive Biomarker & Biometry Trajectory Charts */}
          <BiomarkerTrajectoryCharts records={records} />

          {/* 3. Cross-Modal Correlation Matrix (Labs ↔ Ultrasound) */}
          <CrossModalCorrelationMatrix correlations={analysis.crossModalCorrelations} />

          {/* 4. Complete Chronological Timeline Feed */}
          <ChronologicalScanLabFeed
            records={records}
            onOpenReportModal={handleOpenReportModalForRecord}
            onEditRecord={(rec) => {
              setLogModalRecord(rec);
              setIsLogModalOpen(true);
            }}
            onAddNewRecord={() => {
              setLogModalRecord(null);
              setIsLogModalOpen(true);
            }}
          />
        </div>
      )}

      {/* JARGON DECODER MODAL */}
      {showJargonDecoder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1523] w-full max-w-2xl rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-rose-100 dark:border-rose-900/40 pb-4">
              <div>
                <span className="text-xs font-bold uppercase text-rose-500 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  <span>Plain-English Medical Translator</span>
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-gray-900 dark:text-rose-100 mt-1">
                  Common Scan & Lab Terms Decoder 📖
                </h3>
              </div>

              <button
                onClick={() => setShowJargonDecoder(false)}
                className="p-2 rounded-full hover:bg-rose-100 dark:hover:bg-rose-950 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={decoderSearch}
                onChange={(e) => setDecoderSearch(e.target.value)}
                placeholder="Search term (e.g. BPD, AFI, Hb, FL, TSH, OGTT)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-xs text-gray-900 dark:text-rose-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>

            {/* Decoder List */}
            <div className="overflow-y-auto space-y-3 pr-1 divide-y divide-rose-50 dark:divide-rose-950/60">
              {filteredJargon.map((item) => (
                <div key={item.term} className="pt-3 first:pt-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-rose-600 dark:text-rose-300">
                        {item.term}
                      </span>
                      <span className="text-xs font-bold text-gray-800 dark:text-rose-100">
                        · {item.name}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                      {item.status}
                    </span>
                  </div>

                  <p className="text-xs text-gray-700 dark:text-rose-200 leading-relaxed">
                    <strong>Meaning:</strong> {item.meaning}
                  </p>

                  <p className="text-[11px] text-gray-500 dark:text-rose-400">
                    <strong>Normal in Pregnancy:</strong> {item.normal}
                  </p>
                </div>
              ))}

              {filteredJargon.length === 0 && (
                <div className="p-6 text-center text-xs text-gray-500">
                  No term found matching "{decoderSearch}". Try searching BPD, AFI, Hb, or TSH.
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-rose-100 dark:border-rose-900/40 flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setShowJargonDecoder(false)}>
                Done & Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 4. SCAN DETAILS DRAWER / MODAL */}
      {activeDrawerScan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex justify-end">
          <div className="bg-white dark:bg-[#1A1523] w-full max-w-lg h-full overflow-y-auto p-6 space-y-6 shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-rose-100 dark:border-rose-900/40 pb-4">
              <div>
                <Badge variant="rose" size="sm">
                  {activeDrawerScan.weeks}
                </Badge>
                <CardHeading className="text-xl mt-1">{activeDrawerScan.title}</CardHeading>
              </div>

              <button
                onClick={() => setActiveDrawerScan(null)}
                className="p-2 rounded-full hover:bg-rose-100 dark:hover:bg-rose-950 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <Caption className="font-bold text-gray-900 dark:text-rose-100">Why This Test Is Done</Caption>
                <BodyText className="leading-relaxed">{activeDrawerScan.purpose || activeDrawerScan.shortDesc}</BodyText>
              </div>

              {activeDrawerScan.prepTips && activeDrawerScan.prepTips.length > 0 && (
                <div className="space-y-1">
                  <Caption className="font-bold text-gray-900 dark:text-rose-100">Preparation & Tips</Caption>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-rose-200">
                    {activeDrawerScan.prepTips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {activeDrawerScan.keyMetrics && activeDrawerScan.keyMetrics.length > 0 && (
                <div className="space-y-1">
                  <Caption className="font-bold text-gray-900 dark:text-rose-100">What Doctor Evaluates</Caption>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-rose-200">
                    {activeDrawerScan.keyMetrics.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {activeDrawerScan.doctorQuestions && activeDrawerScan.doctorQuestions.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-rose-100 dark:border-rose-900/40">
                  <Caption className="font-bold text-gray-900 dark:text-rose-100">Questions to Ask Your Doctor</Caption>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-rose-200">
                    {activeDrawerScan.doctorQuestions.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-rose-100 dark:border-rose-900/40 flex items-center justify-between">
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  setActiveUploadModalScan(activeDrawerScan);
                  setActiveDrawerScan(null);
                }}
                leftIcon={<Upload className="w-4 h-4 text-rose-500" />}
              >
                Upload / View Reports
              </Button>

              <Button variant="ghost" size="md" onClick={() => setActiveDrawerScan(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 5. UPLOAD & REPORT MANAGEMENT MODAL */}
      {activeUploadModalScan && (
        <ScanReportUploadModal
          scan={activeUploadModalScan}
          onClose={() => setActiveUploadModalScan(null)}
        />
      )}

      {/* 6. LOG OR EDIT SCAN/LAB RESULT MODAL */}
      {isLogModalOpen && (
        <LogScanLabResultModal
          initialRecord={logModalRecord}
          onSave={handleSaveRecord}
          onClose={() => {
            setIsLogModalOpen(false);
            setLogModalRecord(null);
          }}
        />
      )}
    </div>
  );
};
