import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Flower2, Play, Square, Sparkles, Heart, ShieldCheck, Clock } from "lucide-react";

export const YogaPage: React.FC = () => {
  const { t } = useApp();
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState<"Inhale" | "Hold" | "Exhale">("Inhale");
  const [timerCount, setTimerCount] = useState(4);

  const playSoftChime = (freq = 440) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {
      // Audio fallback silent
    }
  };

  useEffect(() => {
    if (!isBreathing) return;

    const interval = setInterval(() => {
      setTimerCount((prev) => {
        if (prev > 1) return prev - 1;

        if (breathPhase === "Inhale") {
          setBreathPhase("Hold");
          playSoftChime(523.25); // C5
          return 4;
        } else if (breathPhase === "Hold") {
          setBreathPhase("Exhale");
          playSoftChime(392.0); // G4
          return 6;
        } else {
          setBreathPhase("Inhale");
          playSoftChime(659.25); // E5
          return 4;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isBreathing, breathPhase]);

  const toggleBreathing = () => {
    if (isBreathing) {
      setIsBreathing(false);
      setBreathPhase("Inhale");
      setTimerCount(4);
    } else {
      setIsBreathing(true);
      setBreathPhase("Inhale");
      setTimerCount(4);
    }
  };

  const YOGA_POSES = [
    {
      title: "Baddha Konasana (Butterfly Pose)",
      benefits: "Opens pelvic hips, improves blood circulation to lower abdomen, prepares hips for labor.",
      trimester: t("allTrimesters"),
      duration: "3-5 Minutes",
      imageUrl: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=600&q=80",
    },
    {
      title: "Marjaryasana-Bitilasana (Cat-Cow Stretch)",
      benefits: "Relieves lower back pressure, aligns fetal position, eases spinal tension.",
      trimester: t("trimester23"),
      duration: "10 Repetitions",
      imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80",
    },
    {
      title: "Viparita Karani (Legs Up Wall supported)",
      benefits: "Reduces foot and ankle swelling, promotes restful sleep, calms nervous system.",
      trimester: t("trimester12"),
      duration: "5-10 Minutes",
      imageUrl: "https://images.unsplash.com/photo-1510894347250-93a9c73367f8?auto=format&fit=crop&w=600&q=80",
    },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider">
            <Flower2 className="w-4 h-4" />
            <span>{t("pelvicMindfulWellness")}</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-gray-900 dark:text-rose-100 mt-1">
            {t("prenatalYogaGuide")}
          </h1>
          <p className="text-xs text-gray-500 dark:text-rose-300 mt-1">
            {t("prenatalYogaDesc")}
          </p>
        </div>
      </div>

      {/* Breathing Circle Visualizer Card */}
      <div className="p-8 rounded-3xl bg-gradient-to-tr from-purple-900 via-indigo-900 to-rose-950 text-white shadow-xl flex flex-col items-center justify-center text-center space-y-6">
        <div className="space-y-1">
          <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-rose-300">
            {t("guidedBreathPacer")}
          </span>
          <h2 className="font-serif text-2xl font-bold">{t("laborRelaxationBreath")}</h2>
        </div>

        {/* Pulsing Breathing Circle */}
        <div className="relative w-48 h-48 flex items-center justify-center">
          <div
            className={`absolute inset-0 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 opacity-30 transition-all duration-1000 ${
              isBreathing && breathPhase === "Inhale"
                ? "scale-125 duration-[4000ms]"
                : isBreathing && breathPhase === "Exhale"
                ? "scale-75 duration-[6000ms]"
                : "scale-100"
            }`}
          />
          <div className="w-36 h-36 rounded-full bg-white/10 border-2 border-white/30 backdrop-blur-md flex flex-col items-center justify-center relative z-10 shadow-2xl">
            <span className="text-sm font-bold text-amber-300 uppercase tracking-widest">
              {isBreathing ? t(breathPhase.toLowerCase()) : t("ready")}
            </span>
            <span className="text-4xl font-extrabold my-1">
              {isBreathing ? timerCount : "4-4-6"}
            </span>
            <span className="text-[10px] text-purple-200">
              {breathPhase === "Inhale" ? t("inhaleDeep") : breathPhase === "Hold" ? t("holdSoft") : t("exhaleSlowly")}
            </span>
          </div>
        </div>

        <button
          onClick={toggleBreathing}
          className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95"
        >
          {isBreathing ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          <span>{isBreathing ? t("pauseBreathPacer") : t("startGuidedBreathing")}</span>
        </button>
      </div>

      {/* Trimester Yoga Poses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {YOGA_POSES.map((pose, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-[#1a1523] rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm overflow-hidden flex flex-col justify-between"
          >
            <div>
              <img
                src={pose.imageUrl}
                alt={pose.title}
                className="w-full h-40 object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="p-5 space-y-2">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-200">
                  {pose.trimester}
                </span>
                <h3 className="font-serif font-bold text-base text-gray-900 dark:text-rose-100">
                  {pose.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-rose-300 leading-relaxed">
                  {pose.benefits}
                </p>
              </div>
            </div>

            <div className="p-5 pt-0 border-t border-rose-100 dark:border-rose-900/30 mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-rose-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-rose-500" />
                {pose.duration}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
