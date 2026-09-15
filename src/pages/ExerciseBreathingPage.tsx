import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Flower2, Play, Pause, RotateCcw, ShieldAlert, Footprints, Flame, Timer, Activity, CheckCircle2, HeartHandshake } from "lucide-react";

export const ExerciseBreathingPage: React.FC = () => {
  const { showToast, user, t } = useApp();

  // Kegel Timer State
  const [kegelActive, setKegelActive] = useState(false);
  const [kegelPhase, setKegelPhase] = useState<"contract" | "relax">("contract");
  const [kegelSeconds, setKegelSeconds] = useState(0);
  const [kegelReps, setKegelReps] = useState(0);
  
  // Breathing Timer State
  const [breathActive, setBreathActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [breathSeconds, setBreathSeconds] = useState(4);
  const [breathRounds, setBreathRounds] = useState(0);

  // Walking Tracker State
  const [walkSteps, setWalkSteps] = useState(3200);
  const [walkMinutes, setWalkMinutes] = useState(25);
  const [walkActive, setWalkActive] = useState(false);

  // Kegel Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (kegelActive) {
      interval = setInterval(() => {
        setKegelSeconds((prev) => {
          if (prev <= 1) {
            if (kegelPhase === "contract") {
              setKegelPhase("relax");
              return 5;
            } else {
              setKegelPhase("contract");
              setKegelReps((r) => r + 1);
              return 5;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [kegelActive, kegelPhase]);

  // Breathing Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (breathActive) {
      interval = setInterval(() => {
        setBreathSeconds((prev) => {
          if (prev <= 1) {
            if (breathPhase === "inhale") {
              setBreathPhase("hold");
              return 4;
            } else if (breathPhase === "hold") {
              setBreathPhase("exhale");
              return 6;
            } else {
              setBreathPhase("inhale");
              setBreathRounds((r) => r + 1);
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [breathActive, breathPhase]);

  // Walk Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (walkActive) {
      interval = setInterval(() => {
        setWalkMinutes((prev) => prev + 1);
        setWalkSteps((prev) => prev + 110);
      }, 60000);
    }
    return () => clearInterval(interval);
  }, [walkActive]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider">
          <Flower2 className="w-4 h-4" />
          <span>{t("clinicalFitnessTitle")}</span>
        </div>
        <h1 className="font-serif text-2xl font-bold text-gray-900 dark:text-rose-100 mt-1">
          {t("prenatalExerciseHub")}
        </h1>
        <p className="text-xs text-gray-500 dark:text-rose-300 mt-1">
          {t("prenatalExerciseDesc")}
        </p>
      </div>

      {/* Safety Warning Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-start gap-3 text-xs">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">{t("clinicalExerciseSafetyRule")}</span>
          {t("clinicalExerciseSafetyDesc")}
        </div>
      </div>

      {/* Interactive Timers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. Interactive Pelvic Floor (Kegel) Timer */}
        <div className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                {t("pelvicFloorFitness")}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                {t("repsDone")}: {kegelReps}
              </span>
            </div>
            <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-rose-100 mt-1">
              {t("kegelExerciseTimer")}
            </h3>
            <p className="text-xs text-gray-500 dark:text-rose-300 mt-0.5">
              {t("kegelExerciseDesc")}
            </p>
          </div>

          {/* Kegel Visualizer Circle */}
          <div className="flex flex-col items-center justify-center py-4">
            <div
              className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-700 ${
                kegelActive
                  ? kegelPhase === "contract"
                    ? "border-emerald-500 bg-emerald-500/10 scale-110 shadow-lg shadow-emerald-500/20"
                    : "border-sky-500 bg-sky-500/10 scale-95"
                  : "border-gray-300 dark:border-rose-900/40"
              }`}
            >
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-rose-300">
                {kegelActive ? t(kegelPhase) : t("ready")}
              </span>
              <span className="font-serif text-3xl font-extrabold text-gray-900 dark:text-rose-100 mt-1">
                {kegelSeconds}s
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setKegelActive(!kegelActive)}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-1.5 transition-all ${
                kegelActive ? "bg-amber-600 hover:bg-amber-700" : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {kegelActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{kegelActive ? t("pause") : t("startKegels")}</span>
            </button>
            <button
              onClick={() => {
                setKegelActive(false);
                setKegelReps(0);
                setKegelSeconds(5);
              }}
              className="p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/40 text-gray-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Labor Breathing Practice Circle */}
        <div className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-600 dark:text-purple-400">
                {t("contractionPainRelief")}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
                {t("rounds")}: {breathRounds}
              </span>
            </div>
            <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-rose-100 mt-1">
              {t("laborBreathingGuide")}
            </h3>
            <p className="text-xs text-gray-500 dark:text-rose-300 mt-0.5">
              {t("laborBreathingDesc")}
            </p>
          </div>

          {/* Breathing Animated Circle */}
          <div className="flex flex-col items-center justify-center py-4">
            <div
              className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-1000 ${
                breathActive
                  ? breathPhase === "inhale"
                    ? "border-purple-500 bg-purple-500/20 scale-110 shadow-lg shadow-purple-500/20"
                    : breathPhase === "hold"
                    ? "border-amber-500 bg-amber-500/20 scale-105"
                    : "border-sky-500 bg-sky-500/10 scale-90"
                  : "border-gray-300 dark:border-rose-900/40"
              }`}
            >
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-300">
                {breathActive ? t(breathPhase) : t("breathe")}
              </span>
              <span className="font-serif text-3xl font-extrabold text-gray-900 dark:text-rose-100 mt-1">
                {breathSeconds}s
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setBreathActive(!breathActive)}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-1.5 transition-all ${
                breathActive ? "bg-amber-600 hover:bg-amber-700" : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {breathActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{breathActive ? t("pause") : t("startBreathing")}</span>
            </button>
            <button
              onClick={() => {
                setBreathActive(false);
                setBreathRounds(0);
                setBreathSeconds(4);
              }}
              className="p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/40 text-gray-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3. Maternal Walking Tracker */}
        <div className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-500">
                {t("dailyCardiovascular")}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-bold">
                {t("goal5000Steps")}
              </span>
            </div>
            <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-rose-100 mt-1">
              {t("maternalWalkingTracker")}
            </h3>
            <p className="text-xs text-gray-500 dark:text-rose-300 mt-0.5">
              {t("maternalWalkingDesc")}
            </p>
          </div>

          <div className="space-y-3 py-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-rose-300 flex items-center gap-1">
                <Footprints className="w-4 h-4 text-rose-500" /> {t("stepsToday")}
              </span>
              <span className="font-extrabold text-base text-gray-900 dark:text-rose-100">
                {walkSteps.toLocaleString()} {t("steps")}
              </span>
            </div>

            <div className="w-full bg-rose-100 dark:bg-rose-950/50 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (walkSteps / 5000) * 100)}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="bg-rose-50/40 dark:bg-rose-950/20 p-2.5 rounded-xl border border-rose-100 dark:border-rose-900/30">
                <div className="text-gray-400">{t("distance")}</div>
                <div className="font-bold text-gray-900 dark:text-rose-100">
                  {(walkSteps * 0.00075).toFixed(2)} {t("km")}
                </div>
              </div>
              <div className="bg-rose-50/40 dark:bg-rose-950/20 p-2.5 rounded-xl border border-rose-100 dark:border-rose-900/30">
                <div className="text-gray-400">{t("walkDuration")}</div>
                <div className="font-bold text-gray-900 dark:text-rose-100">{walkMinutes} {t("mins")}</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setWalkActive(!walkActive);
              showToast(walkActive ? t("walkingPaused") : t("walkingActive"));
            }}
            className={`w-full py-2.5 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-1.5 transition-all ${
              walkActive ? "bg-amber-600 hover:bg-amber-700" : "bg-rose-500 hover:bg-rose-600"
            }`}
          >
            <Footprints className="w-4 h-4" />
            <span>{walkActive ? t("pauseWalking") : t("startWalkSession")}</span>
          </button>
        </div>
      </div>

      {/* Trimester-Specific Exercise Library */}
      <div className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-4">
        <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-rose-100 flex items-center gap-2">
          <Activity className="w-5 h-5 text-rose-500" />
          <span>{t("trimesterExerciseGuide")}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {[
            {
              tri: t("trimester1Range"),
              color: "border-sky-200 dark:border-sky-900/40 bg-sky-50/30 dark:bg-sky-950/20",
              exercises: [
                { name: t("pelvicTilts"), desc: t("pelvicTiltsDesc") },
                { name: t("briskWalking"), desc: t("briskWalkingDesc") },
                { name: t("catCowStretch"), desc: t("catCowStretchDesc") },
              ],
            },
            {
              tri: t("trimester2Range"),
              color: "border-rose-200 dark:border-rose-900/40 bg-rose-50/30 dark:bg-rose-950/20",
              exercises: [
                { name: t("prenatalSquats"), desc: t("prenatalSquatsDesc") },
                { name: t("sideLyingLegLifts"), desc: t("sideLyingLegLiftsDesc") },
                { name: t("butterflyStretch"), desc: t("butterflyStretchDesc") },
              ],
            },
            {
              tri: t("trimester3Range"),
              color: "border-purple-200 dark:border-purple-900/40 bg-purple-50/30 dark:bg-purple-950/20",
              exercises: [
                { name: t("pelvicFloorHold"), desc: t("pelvicFloorHoldDesc") },
                { name: t("deepBirthSquats"), desc: t("deepBirthSquatsDesc") },
                { name: t("laborBreathSync"), desc: t("laborBreathSyncDesc") },
              ],
            },
          ].map((item, idx) => (
            <div key={idx} className={`p-5 rounded-2xl border space-y-3 ${item.color}`}>
              <div className="font-bold text-sm text-gray-900 dark:text-rose-100">{item.tri}</div>
              <div className="space-y-2">
                {item.exercises.map((e, i) => (
                  <div key={i} className="bg-white/70 dark:bg-black/20 p-3 rounded-xl border border-black/5 dark:border-white/5 space-y-0.5">
                    <div className="font-bold text-gray-800 dark:text-rose-100 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-rose-500" />
                      <span>{e.name}</span>
                    </div>
                    <p className="text-[11px] text-gray-600 dark:text-rose-300">{e.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
