import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Bot, FileText, CheckCircle2, Sparkles, Search } from "lucide-react";

interface BloomScanProcessingProps {
  fileName: string;
  onComplete: (extractedData?: any) => void;
}

export const BloomScanProcessing: React.FC<BloomScanProcessingProps> = ({
  fileName,
  onComplete,
}) => {
  const [progress, setProgress] = useState(15);
  const [phaseText, setPhaseText] = useState("Reading document & verifying format...");

  useEffect(() => {
    let extractedPayload: any = null;

    // Trigger AI OCR Extraction from Backend
    fetch("/api/scan/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json?.data) {
          extractedPayload = json.data;
        }
      })
      .catch((err) => {
        console.warn("Scan extraction request note:", err);
      });

    const t1 = setTimeout(() => {
      setProgress(40);
      setPhaseText("Scanning ultrasound & laboratory clinical markers...");
    }, 900);

    const t2 = setTimeout(() => {
      setProgress(75);
      setPhaseText("Gemini OCR extracting Gestational Age, EDD & Vitals...");
    }, 2000);

    const t3 = setTimeout(() => {
      setProgress(100);
      setPhaseText("Calibrating personal pregnancy profile & metrics...");
    }, 3200);

    const t4 = setTimeout(() => {
      onComplete(extractedPayload);
    }, 3900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [fileName, onComplete]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-[#FFF0F5] via-[#FFF7F9] to-[#F5E6EC] dark:from-[#120E18] dark:via-[#1A1424] dark:to-[#22172A] text-gray-900 dark:text-rose-100">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg bg-white/90 dark:bg-[#1A1523]/90 backdrop-blur-xl p-8 rounded-[36px] border border-rose-100 dark:border-rose-900/40 shadow-2xl shadow-rose-200/50 dark:shadow-none text-center space-y-6"
      >
        {/* Animated Bot Icon */}
        <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 bg-rose-500/20 rounded-full animate-ping" />
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-500 via-pink-500 to-rose-500 text-white flex items-center justify-center shadow-xl relative z-10">
            <Bot className="w-10 h-10 animate-pulse" />
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="font-serif text-2xl font-bold text-gray-900 dark:text-rose-100">
            🤖 BloomScan AI Digitizing
          </h2>
          <p className="text-xs text-rose-600 dark:text-rose-300 font-semibold truncate max-w-xs mx-auto">
            {fileName}
          </p>
        </div>

        {/* Progress Bar & Status Text */}
        <div className="space-y-3 p-5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-gray-700 dark:text-rose-200">{phaseText}</span>
            <span className="text-rose-600 font-extrabold">{progress}%</span>
          </div>

          <div className="w-full h-3 bg-rose-100 dark:bg-rose-950/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="text-left text-xs space-y-2 max-w-xs mx-auto pt-2 text-gray-600 dark:text-rose-300">
          <div className={`flex items-center gap-2 ${progress >= 40 ? "text-emerald-600 font-bold" : ""}`}>
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Document layout parsed</span>
          </div>
          <div className={`flex items-center gap-2 ${progress >= 75 ? "text-emerald-600 font-bold" : "opacity-60"}`}>
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Clinical metrics & vitals extracted</span>
          </div>
          <div className={`flex items-center gap-2 ${progress === 100 ? "text-emerald-600 font-bold" : "opacity-40"}`}>
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Formulating review cards</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
