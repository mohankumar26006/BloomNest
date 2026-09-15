import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Shield, Activity, Users, Database, Server, CheckCircle2, AlertTriangle, PhoneCall, Stethoscope, FileText, Search, UserCheck } from "lucide-react";

interface PatientRecord {
  id: string;
  name: string;
  age: number;
  currentWeek: number;
  trimester: number;
  edd: string;
  riskStatus: "low" | "moderate" | "high";
  riskReason?: string;
  lastBp: string;
  lastGlucose: string;
}

const DEMO_PATIENT_ROSTER: PatientRecord[] = [
  {
    id: "p1",
    name: "Sarah Jenkins (Current User)",
    age: 28,
    currentWeek: 28,
    trimester: 3,
    edd: "2026-10-24",
    riskStatus: "low",
    lastBp: "118/76 mmHg",
    lastGlucose: "88 mg/dL",
  },
  {
    id: "p2",
    name: "Ananya Ramesh",
    age: 32,
    currentWeek: 34,
    trimester: 3,
    edd: "2026-09-12",
    riskStatus: "high",
    riskReason: "Elevated BP (142/92 mmHg) · Preeclampsia Watch",
    lastBp: "142/92 mmHg",
    lastGlucose: "102 mg/dL",
  },
  {
    id: "p3",
    name: "Priya Sharma",
    age: 26,
    currentWeek: 18,
    trimester: 2,
    edd: "2026-12-30",
    riskStatus: "low",
    lastBp: "110/70 mmHg",
    lastGlucose: "82 mg/dL",
  },
  {
    id: "p4",
    name: "Meera Kulkarni",
    age: 30,
    currentWeek: 26,
    trimester: 2,
    edd: "2026-11-08",
    riskStatus: "moderate",
    riskReason: "Gestational Diabetes Fasting Glucose (104 mg/dL)",
    lastBp: "124/80 mmHg",
    lastGlucose: "104 mg/dL",
  },
];

export const AdminPage: React.FC = () => {
  const { user, vitals, medicines, kickSessions, journalEntries, showToast } = useApp();
  const [searchFilter, setSearchFilter] = useState("");

  const filteredRoster = DEMO_PATIENT_ROSTER.filter(
    (p) =>
      p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.riskStatus.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>Clinical Coordination Portal</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-gray-900 dark:text-rose-100 mt-1">
            OB-GYN Clinical Coordinator & Patient Portal
          </h1>
          <p className="text-xs text-gray-500 dark:text-rose-300 mt-1">
            Real-time maternal triage panel, high-risk vitals monitoring, and clinical coordination system.
          </p>
        </div>

        <button
          onClick={() => showToast("Simulated clinical report exported to PDF.")}
          className="px-4 py-2 bg-rose-500 text-white rounded-2xl text-xs font-bold flex items-center gap-2 hover:bg-rose-600 transition-all shrink-0 shadow-md"
        >
          <FileText className="w-4 h-4" />
          <span>Export Clinical Panel PDF</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
        <div className="bg-white dark:bg-[#1a1523] p-5 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm">
          <div className="text-gray-400">Total Patient Panel</div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-300 mt-1">
            {DEMO_PATIENT_ROSTER.length} Expectant Mothers
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1523] p-5 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm">
          <div className="text-gray-400">High-Risk Triage Flagged</div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">1 Patient</div>
        </div>

        <div className="bg-white dark:bg-[#1a1523] p-5 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm">
          <div className="text-gray-400">Total Vitals Recorded</div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-300 mt-1">{vitals.length}</div>
        </div>

        <div className="bg-white dark:bg-[#1a1523] p-5 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm">
          <div className="text-gray-400">Active Kick Sessions</div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-300 mt-1">{kickSessions.length}</div>
        </div>
      </div>

      {/* PATIENT ROSTER PANEL */}
      <div className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-sm text-gray-900 dark:text-rose-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-rose-500" />
            <span>Maternal Patient Roster & Triage Monitor</span>
          </h3>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search patient name or risk status..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-xs"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredRoster.map((patient) => (
            <div
              key={patient.id}
              className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs ${
                patient.riskStatus === "high"
                  ? "bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-900/40"
                  : patient.riskStatus === "moderate"
                  ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40"
                  : "bg-rose-50/20 dark:bg-rose-950/10 border-rose-100 dark:border-rose-900/30"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-gray-900 dark:text-rose-100">
                    {patient.name} ({patient.age} yrs)
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] uppercase ${
                      patient.riskStatus === "high"
                        ? "bg-red-600 text-white"
                        : patient.riskStatus === "moderate"
                        ? "bg-amber-600 text-white"
                        : "bg-emerald-600 text-white"
                    }`}
                  >
                    {patient.riskStatus} Risk
                  </span>
                </div>

                <div className="text-[11px] text-gray-600 dark:text-rose-300">
                  Week {patient.currentWeek} (Trimester {patient.trimester}) · EDD: {patient.edd}
                </div>

                {patient.riskReason && (
                  <div className="text-[11px] font-semibold text-red-600 dark:text-red-300 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Clinical Alert: {patient.riskReason}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-black/5 dark:border-white/5">
                <div className="text-right hidden sm:block">
                  <div className="text-gray-400 text-[10px]">Latest Vitals</div>
                  <div className="font-bold text-gray-800 dark:text-rose-100">
                    BP {patient.lastBp} · Sugar {patient.lastGlucose}
                  </div>
                </div>

                <button
                  onClick={() => showToast(`Initiating tele-consultation with ${patient.name}`)}
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call / Contact</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Engine Status */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1a1523] border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-3">
        <h3 className="font-bold text-sm text-gray-900 dark:text-rose-100 flex items-center gap-2">
          <Server className="w-4 h-4 text-emerald-500" />
          <span>Clinical Engine Infrastructure</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-900 dark:text-emerald-200 font-semibold flex items-center justify-between">
            <span>Express Backend Server</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100">
              Port 3000 Ready
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 text-purple-900 dark:text-purple-200 font-semibold flex items-center justify-between">
            <span>Gemini AI Engine</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-100">
              gemini-3.6-flash
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-900 dark:text-rose-200 font-semibold flex items-center justify-between">
            <span>Client Framework</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-200 dark:bg-rose-800 text-rose-900 dark:text-rose-100">
              React 19 + Vite
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

