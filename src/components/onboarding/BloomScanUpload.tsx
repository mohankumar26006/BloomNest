import React, { useState, useRef } from "react";
import { motion } from "motion/react";
import { ProgressHeader } from "./ProgressHeader";
import { UploadCloud, FileText, X, Sparkles, ArrowRight, ShieldCheck, Image as ImageIcon } from "lucide-react";

interface BloomScanUploadProps {
  onStartAnalyze: (fileName: string) => void;
  onBack: () => void;
}

export const BloomScanUpload: React.FC<BloomScanUploadProps> = ({
  onStartAnalyze,
  onBack,
}) => {
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string } | null>({
    name: "Maternal_Ultrasound_Week24_Scan.pdf",
    size: "2.4 MB",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setSelectedFile({ name: file.name, size: `${sizeMb} MB` });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setSelectedFile({ name: file.name, size: `${sizeMb} MB` });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-[#FFF0F5] via-[#FFF7F9] to-[#F5E6EC] dark:from-[#120E18] dark:via-[#1A1424] dark:to-[#22172A] text-gray-900 dark:text-rose-100">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl bg-white/90 dark:bg-[#1A1523]/90 backdrop-blur-xl p-6 sm:p-8 rounded-[36px] border border-rose-100 dark:border-rose-900/40 shadow-2xl shadow-rose-200/50 dark:shadow-none space-y-6"
      >
        <ProgressHeader
          currentStep={3}
          totalSteps={4}
          title="🤖 BloomScan Medical Digitizer"
          onBack={onBack}
        />

        <div className="text-center space-y-1">
          <p className="text-xs text-gray-500 dark:text-rose-300">
            Upload your lab report, ultrasound scan, or doctor's prescription for instant clinical field extraction.
          </p>
        </div>

        {/* File Dropzone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="p-8 rounded-3xl border-2 border-dashed border-rose-300 dark:border-rose-800 bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-50/80 transition-all cursor-pointer text-center space-y-3"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.png,.jpg,.jpeg"
            className="hidden"
          />

          <div className="w-14 h-14 rounded-2xl bg-rose-500 text-white flex items-center justify-center mx-auto shadow-md">
            <UploadCloud className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <div className="font-serif font-bold text-base text-gray-900 dark:text-rose-100">
              Drag & Drop your report here
            </div>
            <div className="text-xs text-rose-600 dark:text-rose-300 font-semibold underline">
              or browse from your device
            </div>
          </div>

          <div className="text-[11px] text-gray-400 dark:text-rose-400">
            Supported formats: <strong>PDF, JPG, JPEG, PNG</strong> (Max 15 MB)
          </div>
        </div>

        {/* Selected File Card */}
        {selectedFile && (
          <div className="p-4 rounded-2xl bg-white dark:bg-[#15111C] border border-rose-200 dark:border-rose-900/40 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-xs text-gray-900 dark:text-rose-100 truncate max-w-[200px]">
                  {selectedFile.name}
                </div>
                <div className="text-[10px] text-gray-400">{selectedFile.size} · Ready for AI extraction</div>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(null);
              }}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <button
          disabled={!selectedFile}
          onClick={() => onStartAnalyze(selectedFile?.name || "Report.pdf")}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>Analyze Report with BloomScan →</span>
        </button>
      </motion.div>
    </div>
  );
};
