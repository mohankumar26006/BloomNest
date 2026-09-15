import React, { useState, useEffect, useId } from "react";
import { useApp } from "../context/AppContext";
import { PostpartumProfile, PostpartumDeliveryType } from "../types";
import {
  calculatePostpartumDay,
  calculatePostpartumWeek,
  formatPostpartumTime,
  getRecoveryStage,
  formatDeliveryType,
  RecoveryStageInfo,
} from "../utils/postpartumUtils";
import {
  Heart,
  Calendar,
  Sparkles,
  Clock,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Activity,
  X,
  FileText,
  UserCheck,
  Building2,
  ShieldAlert,
  BookOpen,
} from "lucide-react";

const DEFAULT_PROFILE_STORAGE_KEY = "bloomnest_postpartum_profile_v1";

export const PostpartumCarePage: React.FC = () => {
  const { user, showToast } = useApp();

  const deliveryDateInputId = useId();
  const deliveryTypeInputId = useId();
  const babyBirthDateInputId = useId();
  const numberOfBabiesInputId = useId();
  const hospitalInputId = useId();
  const providerInputId = useId();
  const notesInputId = useId();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<PostpartumProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedPreviewStage, setSelectedPreviewStage] = useState<RecoveryStageInfo | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Setup Form State
  const [formDeliveryDate, setFormDeliveryDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [formDeliveryType, setFormDeliveryType] = useState<PostpartumDeliveryType>("vaginal");
  const [formBabyBirthDate, setFormBabyBirthDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [formNumBabies, setFormNumBabies] = useState<number>(1);
  const [formHospital, setFormHospital] = useState<string>("");
  const [formProvider, setFormProvider] = useState<string>("");
  const [formNotes, setFormNotes] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);

  // Load Postpartum Profile from localStorage or initial user state
  useEffect(() => {
    const loadProfile = () => {
      try {
        const saved = localStorage.getItem(DEFAULT_PROFILE_STORAGE_KEY);
        if (saved) {
          const parsed: PostpartumProfile = JSON.parse(saved);
          setProfile(parsed);
          populateFormFields(parsed);
        } else if (user?.journeyStage === "POST_PREGNANCY" || user?.eddDate) {
          const initial: PostpartumProfile = {
            deliveryDate: new Date().toISOString().split("T")[0],
            deliveryType: "vaginal",
            babyBirthDate: new Date().toISOString().split("T")[0],
            numberOfBabies: 1,
            hospital: user.hospitalName || "",
            healthcareProvider: user.doctorName || "",
          };
          setProfile(initial);
          populateFormFields(initial);
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error("Error loading postpartum profile:", err);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, [user]);

  const populateFormFields = (p: PostpartumProfile) => {
    setFormDeliveryDate(p.deliveryDate || new Date().toISOString().split("T")[0]);
    setFormDeliveryType(p.deliveryType || "vaginal");
    setFormBabyBirthDate(p.babyBirthDate || p.deliveryDate || new Date().toISOString().split("T")[0]);
    setFormNumBabies(p.numberOfBabies || 1);
    setFormHospital(p.hospital || p.deliveryLocation || "");
    setFormProvider(p.healthcareProvider || "");
    setFormNotes(p.notes || "");
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formDeliveryDate) {
      setFormError("Please select a valid delivery date.");
      return;
    }

    const deliveryDateObj = new Date(formDeliveryDate);
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    if (deliveryDateObj > now) {
      setFormError("Delivery date cannot be in the future.");
      return;
    }

    if (!formDeliveryType) {
      setFormError("Please select a delivery type.");
      return;
    }

    const updatedProfile: PostpartumProfile = {
      id: profile?.id || `pp_${Date.now()}`,
      userId: user?.id || "user_demo",
      deliveryDate: formDeliveryDate,
      deliveryType: formDeliveryType,
      babyBirthDate: formBabyBirthDate || formDeliveryDate,
      numberOfBabies: formNumBabies,
      hospital: formHospital.trim(),
      deliveryLocation: formHospital.trim(),
      healthcareProvider: formProvider.trim(),
      notes: formNotes.trim(),
      updatedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(DEFAULT_PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));
      setProfile(updatedProfile);
      setIsModalOpen(false);
      setSaveSuccessMsg("Postpartum details updated!");
      showToast("Postpartum details saved 💕");
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch (err) {
      setFormError("Failed to save postpartum details.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#120E18] p-6 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 rounded-full border-4 border-rose-200 border-t-rose-500 animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading Postpartum Care...</p>
      </div>
    );
  }

  // EMPTY STATE / ONBOARDING SETUP
  if (!profile) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#120E18] p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-[#1A1523] rounded-3xl p-8 border border-rose-100 dark:border-rose-900/40 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8 fill-rose-400 text-rose-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-rose-100">Set Up Postpartum Recovery</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Enter your delivery date and delivery type to view your personalized recovery stage and guidelines.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full py-3 px-6 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-md transition-all"
          >
            Configure Delivery Details
          </button>
        </div>

        {isModalOpen && (
          <ModalForm
            deliveryDateInputId={deliveryDateInputId}
            deliveryTypeInputId={deliveryTypeInputId}
            babyBirthDateInputId={babyBirthDateInputId}
            numberOfBabiesInputId={numberOfBabiesInputId}
            hospitalInputId={hospitalInputId}
            providerInputId={providerInputId}
            notesInputId={notesInputId}
            formDeliveryDate={formDeliveryDate}
            setFormDeliveryDate={setFormDeliveryDate}
            formDeliveryType={formDeliveryType}
            setFormDeliveryType={setFormDeliveryType}
            formBabyBirthDate={formBabyBirthDate}
            setFormBabyBirthDate={setFormBabyBirthDate}
            formNumBabies={formNumBabies}
            setFormNumBabies={setFormNumBabies}
            formHospital={formHospital}
            setFormHospital={setFormHospital}
            formProvider={formProvider}
            setFormProvider={setFormProvider}
            formNotes={formNotes}
            setFormNotes={setFormNotes}
            formError={formError}
            handleSaveProfile={handleSaveProfile}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </div>
    );
  }

  // CALCULATIONS & DERIVED VALUES
  const postpartumDay = calculatePostpartumDay(profile.deliveryDate);
  const postpartumWeek = calculatePostpartumWeek(postpartumDay);
  const timeFormatted = formatPostpartumTime(postpartumDay);
  const currentStage = getRecoveryStage(postpartumDay);
  const activePreviewStage = selectedPreviewStage || currentStage;

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#120E18] text-slate-800 dark:text-rose-100 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* TOAST */}
      {saveSuccessMsg && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-800 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* HEADER & EDIT ACTION */}
      <header className="flex items-center justify-between border-b border-rose-100 dark:border-rose-900/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 uppercase tracking-wider">
              Feature 01
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Postpartum Care</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-rose-100 tracking-tight mt-1">
            Postpartum Recovery Journey
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Organizes your overall recovery timeline around where you are today.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white dark:bg-[#1A1523] text-rose-600 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-900/40 text-xs shadow-xs hover:bg-rose-50 transition-all"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Details</span>
        </button>
      </header>

      {/* 🌟 MAIN OVERALL RECOVERY HERO CARD (Answers: "Naan ipo recovery-la endha stage-la irukken?") */}
      <section className="bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-rose-500/15 relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Top Stage Badge & Delivery Type */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/20 pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-200" />
              <span className="text-xs font-extrabold uppercase tracking-widest text-rose-100">Current Recovery Stage</span>
            </div>
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md font-bold text-xs">
              {formatDeliveryType(profile.deliveryType)}
            </span>
          </div>

          {/* Core Day & Week Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-1">
              <div className="text-4xl sm:text-5xl font-black tracking-tight">
                Postpartum Day {postpartumDay}
              </div>
              <div className="text-lg sm:text-xl font-bold text-rose-100">
                Week {postpartumWeek} of recovery
              </div>
              <p className="text-xs text-rose-100/80 pt-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-200" />
                <span>{timeFormatted.formatted}</span>
              </p>
            </div>

            {/* Current Stage Info Box */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 space-y-2">
              <div className="text-xs font-extrabold uppercase tracking-wider text-rose-200">
                Stage {currentStage.stageNumber}: {currentStage.title}
              </div>
              <p className="text-xs text-white/90 leading-relaxed">
                {currentStage.description}
              </p>
            </div>
          </div>

          {/* Quick Profile Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
            <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-xl">
              <span className="text-[10px] text-rose-200 font-medium block">Delivery Date</span>
              <span className="font-bold">{profile.deliveryDate}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-xl">
              <span className="text-[10px] text-rose-200 font-medium block">Delivery Type</span>
              <span className="font-bold">{formatDeliveryType(profile.deliveryType)}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-xl">
              <span className="text-[10px] text-rose-200 font-medium block">Babies</span>
              <span className="font-bold">{profile.numberOfBabies} Baby</span>
            </div>
            {profile.hospital ? (
              <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-xl">
                <span className="text-[10px] text-rose-200 font-medium block">Hospital</span>
                <span className="font-bold truncate block">{profile.hospital}</span>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-xs p-2.5 rounded-xl">
                <span className="text-[10px] text-rose-200 font-medium block">Stage Window</span>
                <span className="font-bold">{currentStage.dayRange}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 🧭 4-STAGE INTERACTIVE TRACKER (Simple & Visual) */}
      <section className="bg-white dark:bg-[#1A1523] rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-rose-900/30 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-rose-100 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-500" />
            <span>4-Stage Postpartum Timeline</span>
          </h2>
          {selectedPreviewStage && selectedPreviewStage.key !== currentStage.key && (
            <button
              onClick={() => setSelectedPreviewStage(null)}
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
            >
              Reset to Current Stage
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            getRecoveryStage(0),
            getRecoveryStage(7),
            getRecoveryStage(15),
            getRecoveryStage(43),
          ].map((stg) => {
            const isCurrent = currentStage.key === stg.key;
            const isSelected = activePreviewStage.key === stg.key;
            const isCompleted = currentStage.stageNumber > stg.stageNumber;

            return (
              <button
                key={stg.key}
                onClick={() => setSelectedPreviewStage(stg)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  isCurrent
                    ? "bg-rose-50 dark:bg-rose-950/50 border-rose-400 ring-2 ring-rose-400/20"
                    : isSelected
                    ? "bg-slate-100 dark:bg-slate-800 border-slate-400"
                    : isCompleted
                    ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300/60"
                    : "bg-white dark:bg-[#15111C] border-slate-200 dark:border-gray-800 hover:border-rose-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Stage {stg.stageNumber} • {stg.dayRange}
                  </span>
                  {isCurrent && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-bold uppercase">
                      Current
                    </span>
                  )}
                  {isCompleted && !isCurrent && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  )}
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-rose-100">{stg.title}</h3>
              </button>
            );
          })}
        </div>
      </section>

      {/* 📌 IMPORTANT RECOVERY INFORMATION (Stage Relevant Only) */}
      <section className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-rose-900/30 shadow-xs space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-rose-900/30 pb-3">
          <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-rose-100">
              Important Recovery Information for {activePreviewStage.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Essential physical recovery guidance for {activePreviewStage.dayRange} ({formatDeliveryType(profile.deliveryType)})
            </p>
          </div>
        </div>

        {/* Dynamic Stage Bullet Points */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activePreviewStage.focusPoints.map((point, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 flex items-start gap-3"
            >
              <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="text-xs font-semibold text-slate-800 dark:text-rose-200">
                {point}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 📚 GENERAL POSTPARTUM EDUCATION (Stage Relevant Only) */}
      <section className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-rose-900/30 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-rose-900/30 pb-3">
          <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-rose-100">
              Stage Education: {activePreviewStage.title} ({activePreviewStage.dayRange})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Targeted educational advice relevant strictly to this recovery stage.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {activePreviewStage.guidanceCategories.map((cat, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-50/80 dark:bg-[#15111C] border border-slate-200/60 dark:border-gray-800 space-y-3"
            >
              <h3 className="text-xs font-bold text-slate-900 dark:text-rose-200 uppercase tracking-wider border-b border-slate-200 dark:border-gray-800 pb-2">
                {cat.title}
              </h3>
              <ul className="space-y-2">
                {cat.items.map((item, iIdx) => (
                  <li key={iIdx} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* EDIT MODAL */}
      {isModalOpen && (
        <ModalForm
          deliveryDateInputId={deliveryDateInputId}
          deliveryTypeInputId={deliveryTypeInputId}
          babyBirthDateInputId={babyBirthDateInputId}
          numberOfBabiesInputId={numberOfBabiesInputId}
          hospitalInputId={hospitalInputId}
          providerInputId={providerInputId}
          notesInputId={notesInputId}
          formDeliveryDate={formDeliveryDate}
          setFormDeliveryDate={setFormDeliveryDate}
          formDeliveryType={formDeliveryType}
          setFormDeliveryType={setFormDeliveryType}
          formBabyBirthDate={formBabyBirthDate}
          setFormBabyBirthDate={setFormBabyBirthDate}
          formNumBabies={formNumBabies}
          setFormNumBabies={setFormNumBabies}
          formHospital={formHospital}
          setFormHospital={setFormHospital}
          formProvider={formProvider}
          setFormProvider={setFormProvider}
          formNotes={formNotes}
          setFormNotes={setFormNotes}
          formError={formError}
          handleSaveProfile={handleSaveProfile}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

// MODAL FORM COMPONENT
const ModalForm: React.FC<{
  deliveryDateInputId: string;
  deliveryTypeInputId: string;
  babyBirthDateInputId: string;
  numberOfBabiesInputId: string;
  hospitalInputId: string;
  providerInputId: string;
  notesInputId: string;
  formDeliveryDate: string;
  setFormDeliveryDate: (val: string) => void;
  formDeliveryType: PostpartumDeliveryType;
  setFormDeliveryType: (val: PostpartumDeliveryType) => void;
  formBabyBirthDate: string;
  setFormBabyBirthDate: (val: string) => void;
  formNumBabies: number;
  setFormNumBabies: (val: number) => void;
  formHospital: string;
  setFormHospital: (val: string) => void;
  formProvider: string;
  setFormProvider: (val: string) => void;
  formNotes: string;
  setFormNotes: (val: string) => void;
  formError: string | null;
  handleSaveProfile: (e: React.FormEvent) => void;
  onClose: () => void;
}> = ({
  deliveryDateInputId,
  deliveryTypeInputId,
  babyBirthDateInputId,
  numberOfBabiesInputId,
  hospitalInputId,
  providerInputId,
  notesInputId,
  formDeliveryDate,
  setFormDeliveryDate,
  formDeliveryType,
  setFormDeliveryType,
  formBabyBirthDate,
  setFormBabyBirthDate,
  formNumBabies,
  setFormNumBabies,
  formHospital,
  setFormHospital,
  formProvider,
  setFormProvider,
  formNotes,
  setFormNotes,
  formError,
  handleSaveProfile,
  onClose,
}) => (
  <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
    <div className="bg-white dark:bg-[#1A1523] text-slate-800 dark:text-rose-100 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-rose-100 dark:border-rose-900/40 my-8">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-rose-900/40 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-rose-100">Postpartum Delivery Details</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Configure delivery details to calculate recovery stage.</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
          <X className="w-5 h-5" />
        </button>
      </div>

      {formError && (
        <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs font-medium text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-4 mt-4 text-xs">
        <div>
          <label htmlFor={deliveryDateInputId} className="block font-bold text-slate-700 dark:text-rose-300 mb-1">
            Delivery Date <span className="text-rose-500">*</span>
          </label>
          <input
            id={deliveryDateInputId}
            type="date"
            required
            value={formDeliveryDate}
            onChange={(e) => {
              setFormDeliveryDate(e.target.value);
              if (!formBabyBirthDate) setFormBabyBirthDate(e.target.value);
            }}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-gray-800 bg-white dark:bg-[#15111C] font-semibold"
          />
          <span className="text-[10px] text-slate-400 mt-1 block">Marks Postpartum Day 0</span>
        </div>

        <div>
          <label htmlFor={deliveryTypeInputId} className="block font-bold text-slate-700 dark:text-rose-300 mb-1">
            Delivery Type <span className="text-rose-500">*</span>
          </label>
          <select
            id={deliveryTypeInputId}
            value={formDeliveryType}
            onChange={(e) => setFormDeliveryType(e.target.value as PostpartumDeliveryType)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-gray-800 bg-white dark:bg-[#15111C] font-semibold"
          >
            <option value="vaginal">Vaginal Delivery</option>
            <option value="c_section">C-Section</option>
            <option value="assisted_vaginal">Assisted Vaginal Delivery</option>
            <option value="other">Other / Custom</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor={babyBirthDateInputId} className="block font-bold text-slate-700 dark:text-rose-300 mb-1">
              Baby Birth Date
            </label>
            <input
              id={babyBirthDateInputId}
              type="date"
              value={formBabyBirthDate}
              onChange={(e) => setFormBabyBirthDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-gray-800 bg-white dark:bg-[#15111C] font-semibold"
            />
          </div>

          <div>
            <label htmlFor={numberOfBabiesInputId} className="block font-bold text-slate-700 dark:text-rose-300 mb-1">
              Number of Babies
            </label>
            <input
              id={numberOfBabiesInputId}
              type="number"
              min="1"
              max="5"
              value={formNumBabies}
              onChange={(e) => setFormNumBabies(parseInt(e.target.value, 10) || 1)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-gray-800 bg-white dark:bg-[#15111C] font-semibold"
            />
          </div>
        </div>

        <div>
          <label htmlFor={hospitalInputId} className="block font-bold text-slate-700 dark:text-rose-300 mb-1">
            Hospital / Delivery Location <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <input
            id={hospitalInputId}
            type="text"
            placeholder="e.g. Apollo Cradle Hospital"
            value={formHospital}
            onChange={(e) => setFormHospital(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-gray-800 bg-white dark:bg-[#15111C] font-semibold"
          />
        </div>

        <div>
          <label htmlFor={providerInputId} className="block font-bold text-slate-700 dark:text-rose-300 mb-1">
            Healthcare Provider / OBGYN <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <input
            id={providerInputId}
            type="text"
            placeholder="e.g. Dr. Ananya Sharma, MD"
            value={formProvider}
            onChange={(e) => setFormProvider(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-gray-800 bg-white dark:bg-[#15111C] font-semibold"
          />
        </div>

        <div>
          <label htmlFor={notesInputId} className="block font-bold text-slate-700 dark:text-rose-300 mb-1">
            Postpartum Notes <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <textarea
            id={notesInputId}
            rows={3}
            placeholder="Any special recovery notes..."
            value={formNotes}
            onChange={(e) => setFormNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-gray-800 bg-white dark:bg-[#15111C] font-semibold"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-rose-900/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-gray-800 font-bold text-slate-600 dark:text-rose-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold shadow-md"
          >
            Save Details
          </button>
        </div>
      </form>
    </div>
  </div>
);
