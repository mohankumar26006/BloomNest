import React, { useState } from "react";
import { motion } from "motion/react";
import { ProgressHeader } from "./ProgressHeader";
import { Calendar, Baby, HeartPulse, Sparkles, ArrowRight, Building2, Stethoscope, Droplets, Check } from "lucide-react";

interface PregnancyOnboardingProps {
  onNext: (details: {
    currentWeek: number;
    trimester: number;
    edd: string;
    bloodGroup: string;
    doctorName: string;
    hospitalName: string;
  }) => void;
  onBack: () => void;
}

export const PregnancyOnboarding: React.FC<PregnancyOnboardingProps> = ({
  onNext,
  onBack,
}) => {
  const [currentWeek, setCurrentWeek] = useState<number>(24);
  const [bloodGroup, setBloodGroup] = useState<string>("O+");
  const [doctorName, setDoctorName] = useState<string>("Dr. Ananya Sharma, MD");
  const [hospitalName, setHospitalName] = useState<string>("Apollo Cradle Maternity");
  const [pregnancyType, setPregnancyType] = useState<"single" | "twins">("single");

  // Calculate EDD based on week
  const calculateEddFromWeek = (week: number): string => {
    const daysRemaining = (40 - Math.min(42, Math.max(1, week))) * 7;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysRemaining);
    return targetDate.toISOString().split("T")[0];
  };

  const [edd, setEdd] = useState<string>(() => calculateEddFromWeek(24));

  const handleWeekChange = (w: number) => {
    const safeW = Math.min(42, Math.max(1, w));
    setCurrentWeek(safeW);
    setEdd(calculateEddFromWeek(safeW));
  };

  const trimester = currentWeek <= 13 ? 1 : currentWeek <= 27 ? 2 : 3;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({
      currentWeek,
      trimester,
      edd,
      bloodGroup,
      doctorName,
      hospitalName,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-[#FFF0F5] via-[#FFF7F9] to-[#F5E6EC] dark:from-[#120E18] dark:via-[#1A1424] dark:to-[#22172A] text-gray-900 dark:text-rose-100">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl bg-white/90 dark:bg-[#1A1523]/90 backdrop-blur-xl p-6 sm:p-8 rounded-[36px] border border-rose-100 dark:border-rose-900/40 shadow-2xl shadow-rose-200/50 dark:shadow-none space-y-6"
      >
        <ProgressHeader
          currentStep={2}
          totalSteps={4}
          title="🤰 Pregnancy & Gestational Personalization"
          onBack={onBack}
        />

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* Gestational Progress Card */}
          <div className="bg-rose-50/60 dark:bg-rose-950/30 p-5 rounded-3xl border border-rose-100 dark:border-rose-900/40 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-base font-bold text-gray-900 dark:text-rose-100 flex items-center gap-2">
                <Baby className="w-5 h-5 text-rose-500" />
                <span>Gestational Timeline & EDD</span>
              </h3>

              <span className="px-3 py-1 bg-rose-500 text-white font-extrabold rounded-full text-xs">
                Week {currentWeek} (Trimester {trimester})
              </span>
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-rose-300 mb-1">
                Drag to set your current gestational week:
              </label>
              <input
                type="range"
                min={1}
                max={40}
                value={currentWeek}
                onChange={(e) => handleWeekChange(parseInt(e.target.value) || 20)}
                className="w-full accent-rose-500 mt-2"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-semibold px-1 mt-1">
                <span>Week 1 (1st Tri)</span>
                <span>Week 20 (2nd Tri)</span>
                <span>Week 40 (Full Term)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block font-bold text-gray-700 dark:text-rose-300 mb-1">
                  Estimated Due Date (EDD)
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                  <input
                    type="date"
                    required
                    value={edd}
                    onChange={(e) => setEdd(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-white dark:bg-[#15111C] border border-rose-200 dark:border-rose-900/40 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-rose-300 mb-1">
                  Pregnancy Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPregnancyType("single")}
                    className={`py-2.5 rounded-xl font-bold border transition-all ${
                      pregnancyType === "single"
                        ? "bg-rose-500 text-white border-rose-600 shadow-sm"
                        : "bg-white dark:bg-[#15111C] text-gray-700 dark:text-rose-200 border-gray-200 dark:border-gray-800"
                    }`}
                  >
                    👶 Single Baby
                  </button>
                  <button
                    type="button"
                    onClick={() => setPregnancyType("twins")}
                    className={`py-2.5 rounded-xl font-bold border transition-all ${
                      pregnancyType === "twins"
                        ? "bg-rose-500 text-white border-rose-600 shadow-sm"
                        : "bg-white dark:bg-[#15111C] text-gray-700 dark:text-rose-200 border-gray-200 dark:border-gray-800"
                    }`}
                  >
                    👶👶 Twins / Multiples
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Care Team & Medical Markers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-gray-700 dark:text-rose-300 mb-1">
                Blood Group
              </label>
              <div className="relative">
                <Droplets className="w-4 h-4 absolute left-3.5 top-3 text-red-500" />
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 font-bold"
                >
                  {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-rose-300 mb-1">
                Primary OB-GYN
              </label>
              <div className="relative">
                <Stethoscope className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="Dr. Ananya Sharma"
                  className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-rose-300 mb-1">
                Maternity Hospital
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="text"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  placeholder="Apollo Cradle Maternity"
                  className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 font-bold"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
          >
            <span>Next: Medical Report Check</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </motion.div>
    </div>
  );
};
