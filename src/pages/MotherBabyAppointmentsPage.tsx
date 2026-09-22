import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  PostpartumProfile,
  BabyProfileData,
  MotherBabyAppointment,
  AppointmentTarget,
  AppointmentStatus,
  AppointmentQuestion,
  QuestionStatus,
} from "../types";
import {
  calculatePostpartumDay,
  calculatePostpartumWeek,
  getRecoveryStage,
  formatBabyAge,
} from "../utils/postpartumUtils";
import {
  Calendar,
  Clock,
  Plus,
  User,
  Baby,
  Heart,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FileText,
  Trash2,
  Building2,
  MapPin,
  Stethoscope,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Info,
  Droplet,
  HeartPulse,
  Bandage,
  Milk,
  Droplets,
  Utensils,
  Moon,
  Smile,
  Pill,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";

const APPOINTMENTS_KEY = "bloomnest_mother_baby_appointments_v1";

interface MotherBabyAppointmentsPageProps {
  onNavigateSubPage?: (page: string) => void;
}

export const MotherBabyAppointmentsPage: React.FC<MotherBabyAppointmentsPageProps> = ({
  onNavigateSubPage,
}) => {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState<"upcoming" | "preparation" | "history">("upcoming");
  const [filterTarget, setFilterTarget] = useState<"all" | "mother" | "baby">("all");

  // Contexts
  const [profile, setProfile] = useState<PostpartumProfile | null>(null);
  const [babyProfile, setBabyProfile] = useState<BabyProfileData | null>(null);

  // State
  const [appointments, setAppointments] = useState<MotherBabyAppointment[]>([]);

  // Modals
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showCompleteModal, setShowCompleteModal] = useState<boolean>(false);
  const [selectedApptForAction, setSelectedApptForAction] = useState<MotherBabyAppointment | null>(null);

  // Form State: Add Appointment
  const [target, setTarget] = useState<AppointmentTarget>("mother");
  const [category, setCategory] = useState<string>("Postpartum Check-up");
  const [title, setTitle] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState<string>("10:00 AM");
  const [providerName, setProviderName] = useState<string>("");
  const [clinicHospital, setClinicHospital] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [isInPerson, setIsInPerson] = useState<boolean>(true);
  const [purpose, setPurpose] = useState<string>("");
  const [initialQuestion, setInitialQuestion] = useState<string>("");

  // Form State: Complete Visit
  const [visitNotes, setVisitNotes] = useState<string>("");
  const [followUpRequired, setFollowUpRequired] = useState<boolean>(false);
  const [followUpDate, setFollowUpDate] = useState<string>("");

  // Load contexts and appointments
  useEffect(() => {
    // 1. Feature 01 Context
    const savedProfile = localStorage.getItem("bloomnest_postpartum_profile_v1");
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    } else if (user?.journeyStage === "POST_PREGNANCY") {
      setProfile({
        deliveryDate: new Date().toISOString().split("T")[0],
        deliveryType: "vaginal",
        numberOfBabies: 1,
      });
    }

    // 2. Feature 03 Baby Profile
    const savedBaby = localStorage.getItem("bloomnest_baby_profile_v1");
    if (savedBaby) {
      setBabyProfile(JSON.parse(savedBaby));
    }

    // 3. Feature 17 Appointments
    const savedAppts = localStorage.getItem(APPOINTMENTS_KEY);
    if (savedAppts) {
      setAppointments(JSON.parse(savedAppts));
    } else {
      // Default sample appointments if empty
      const initialAppts: MotherBabyAppointment[] = [
        {
          id: "appt_init_1",
          target: "mother",
          category: "Postpartum Check-up",
          title: "6-Week Routine Postpartum Recovery Check",
          date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
          time: "10:30 AM",
          providerName: "Dr. Ananya Sharma (OB/GYN)",
          clinicHospital: "Apollo Womens Hospital",
          location: "Consultation Room 302",
          isInPerson: true,
          purpose: "Routine physical recovery check, pelvic exam, and wound review.",
          status: "upcoming",
          questions: [
            { id: "q1", question: "Is my physical pain and lochia pattern normal for Week 3?", status: "open" },
            { id: "q2", question: "When can I safely resume light core exercises?", status: "open" },
          ],
          followUpRequired: false,
          postpartumDay: calculatePostpartumDay(profile?.deliveryDate || new Date().toISOString().split("T")[0]),
          postpartumWeek: calculatePostpartumWeek(calculatePostpartumDay(profile?.deliveryDate || new Date().toISOString().split("T")[0])),
          createdAt: new Date().toISOString(),
        },
        {
          id: "appt_init_2",
          target: "baby",
          babyName: babyProfile?.babyName || "Baby",
          category: "Newborn Check-up",
          title: "Newborn Pediatric Wellness & Growth Visit",
          date: new Date(Date.now() + 10 * 86400000).toISOString().split("T")[0],
          time: "02:00 PM",
          providerName: "Dr. Rajesh Kumar (Pediatrician)",
          clinicHospital: "City Childrens Clinic",
          isInPerson: true,
          purpose: "Routine baby weight check, feeding progress, and reflex exam.",
          status: "upcoming",
          questions: [
            { id: "q3", question: "Is baby's weight gain on target for this week?", status: "open" },
          ],
          followUpRequired: false,
          postpartumDay: calculatePostpartumDay(profile?.deliveryDate || new Date().toISOString().split("T")[0]),
          postpartumWeek: calculatePostpartumWeek(calculatePostpartumDay(profile?.deliveryDate || new Date().toISOString().split("T")[0])),
          createdAt: new Date().toISOString(),
        },
      ];
      setAppointments(initialAppts);
      localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(initialAppts));
    }
  }, [user]);

  // Derived calculations
  const deliveryDateStr = profile?.deliveryDate || new Date().toISOString().split("T")[0];
  const postpartumDay = calculatePostpartumDay(deliveryDateStr);
  const postpartumWeek = calculatePostpartumWeek(postpartumDay);
  const recoveryStage = getRecoveryStage(postpartumDay).title;

  // Filtered Appointments
  const upcomingAppts = appointments.filter((a) => a.status === "upcoming" || a.status === "rescheduled");
  const completedAppts = appointments.filter((a) => a.status === "completed");

  const filteredUpcoming = upcomingAppts.filter((a) => {
    if (filterTarget === "mother") return a.target === "mother";
    if (filterTarget === "baby") return a.target === "baby";
    return true;
  });

  // Handlers
  const handleSaveAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const initialQuestionsList: AppointmentQuestion[] = initialQuestion.trim()
      ? [{ id: `q_${Date.now()}`, question: initialQuestion.trim(), status: "open" }]
      : [];

    const newAppt: MotherBabyAppointment = {
      id: `appt_${Date.now()}`,
      userId: user?.id?.toString(),
      target,
      babyName: target !== "mother" ? babyProfile?.babyName || "Baby" : undefined,
      category,
      title: title.trim(),
      date,
      time,
      providerName: providerName.trim() || profile?.doctorName || undefined,
      clinicHospital: clinicHospital.trim() || profile?.hospitalName || undefined,
      location: location.trim() || undefined,
      isInPerson,
      purpose: purpose.trim() || "Routine appointment check.",
      status: "upcoming",
      questions: initialQuestionsList,
      followUpRequired: false,
      postpartumDay,
      postpartumWeek,
      createdAt: new Date().toISOString(),
    };

    const updated = [newAppt, ...appointments];
    setAppointments(updated);
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(updated));

    // Reset Form
    setTitle("");
    setPurpose("");
    setInitialQuestion("");
    setShowAddModal(false);
  };

  const handleOpenCompleteModal = (appt: MotherBabyAppointment) => {
    setSelectedApptForAction(appt);
    setVisitNotes(appt.notes || "");
    setFollowUpRequired(false);
    setFollowUpDate("");
    setShowCompleteModal(true);
  };

  const handleSaveVisitCompletion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApptForAction) return;

    const updatedAppts = appointments.map((a) => {
      if (a.id === selectedApptForAction.id) {
        return {
          ...a,
          status: "completed" as AppointmentStatus,
          notes: visitNotes.trim() || undefined,
          followUpRequired,
          followUpDate: followUpRequired && followUpDate ? followUpDate : undefined,
        };
      }
      return a;
    });

    // If follow up date is set, automatically create the next upcoming appointment entry!
    if (followUpRequired && followUpDate) {
      const nextFollowUpAppt: MotherBabyAppointment = {
        id: `appt_${Date.now()}_followup`,
        userId: user?.id?.toString(),
        target: selectedApptForAction.target,
        babyName: selectedApptForAction.babyName,
        category: selectedApptForAction.category,
        title: `Follow-up: ${selectedApptForAction.title}`,
        date: followUpDate,
        time: selectedApptForAction.time,
        providerName: selectedApptForAction.providerName,
        clinicHospital: selectedApptForAction.clinicHospital,
        isInPerson: selectedApptForAction.isInPerson,
        purpose: `Follow-up visit regarding previous visit on ${selectedApptForAction.date}.`,
        status: "upcoming",
        questions: [],
        followUpRequired: false,
        postpartumDay,
        postpartumWeek,
        createdAt: new Date().toISOString(),
      };
      updatedAppts.unshift(nextFollowUpAppt);
    }

    setAppointments(updatedAppts);
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(updatedAppts));
    setShowCompleteModal(false);
  };

  const handleAddQuestionToAppt = (apptId: string, qText: string) => {
    if (!qText.trim()) return;
    const updated = appointments.map((a) => {
      if (a.id === apptId) {
        const newQ: AppointmentQuestion = {
          id: `q_${Date.now()}`,
          question: qText.trim(),
          status: "open",
        };
        return { ...a, questions: [...a.questions, newQ] };
      }
      return a;
    });
    setAppointments(updated);
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(updated));
  };

  const handleToggleQuestionStatus = (apptId: string, qId: string, newStatus: QuestionStatus) => {
    const updated = appointments.map((a) => {
      if (a.id === apptId) {
        const updatedQ = a.questions.map((q) => (q.id === qId ? { ...q, status: newStatus } : q));
        return { ...a, questions: updatedQ };
      }
      return a;
    });
    setAppointments(updated);
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(updated));
  };

  const handleDeleteAppointment = (id: string) => {
    if (confirm("Delete this appointment record?")) {
      const updated = appointments.filter((a) => a.id !== id);
      setAppointments(updated);
      localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(updated));
    }
  };

  // Helper for Context Prep Links
  const getContextPrepLinks = (categoryStr: string, targetType: AppointmentTarget) => {
    const links = [];
    const cat = categoryStr.toLowerCase();

    if (cat.includes("wound") || cat.includes("c-section")) {
      links.push({ name: "C-Section & Wound Care", page: "wound", badge: "Feature 07", icon: Bandage });
      links.push({ name: "Pain & Recovery Care", page: "pain", badge: "Feature 06", icon: HeartPulse });
      links.push({ name: "Medication Management", page: "medication", badge: "Feature 16", icon: Pill });
    } else if (cat.includes("lactation") || cat.includes("breastfeeding")) {
      links.push({ name: "Direct Breastfeeding", page: "breastfeeding", badge: "Feature 08", icon: Milk });
      links.push({ name: "Pumping & Milk Expressed", page: "pumping", badge: "Feature 09", icon: Droplets });
      links.push({ name: "Baby Feeding Care", page: "baby-feeding", badge: "Feature 10", icon: Utensils });
    } else if (cat.includes("pediatric") || cat.includes("newborn") || targetType === "baby") {
      links.push({ name: "Newborn Baby Care Profile", page: "baby-care", badge: "Feature 03", icon: Baby });
      links.push({ name: "Baby Feeding Care", page: "baby-feeding", badge: "Feature 10", icon: Utensils });
      links.push({ name: "Baby Diaper Care", page: "diapers", badge: "Feature 11", icon: Baby });
      links.push({ name: "Baby Sleep Care", page: "baby-sleep", badge: "Feature 13", icon: Moon });
    } else if (cat.includes("emotional") || cat.includes("mental")) {
      links.push({ name: "Mood & Emotional Wellbeing", page: "mood-wellbeing", badge: "Feature 14", icon: Smile });
      links.push({ name: "Mother Sleep & Fatigue", page: "sleep-fatigue", badge: "Feature 12", icon: Moon });
    } else {
      // Default Postpartum Checkup links
      links.push({ name: "Mother Physical Recovery", page: "recovery", badge: "Feature 02", icon: Heart });
      links.push({ name: "Bleeding & Lochia Care", page: "bleeding", badge: "Feature 05", icon: Droplet });
      links.push({ name: "Medication Management", page: "medication", badge: "Feature 16", icon: Pill });
    }
    return links;
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#120E18] text-slate-800 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      
      {/* TOP HEADER WITH POSTPARTUM CONTEXT */}
      <div className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300 text-xs font-semibold rounded-full flex items-center gap-1.5 border border-sky-200 dark:border-sky-800">
              <Calendar className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              Feature 17 • Postpartum Care
            </span>
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-full">
              Day {postpartumDay} • Week {postpartumWeek}
            </span>
            <span className="px-3 py-1 rounded-full bg-rose-500 text-white font-extrabold text-xs">
              {recoveryStage}
            </span>
            {babyProfile && (
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 text-xs font-semibold rounded-full flex items-center gap-1 border border-purple-200 dark:border-purple-800">
                👶 {babyProfile.babyName} ({formatBabyAge(babyProfile.birthDate || deliveryDateStr)})
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-8 h-8 text-sky-600 dark:text-sky-400" />
            Mother & Baby Appointments
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Central visit scheduling, doctor questions, context-aware preparation, and follow-up continuity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
          {onNavigateSubPage && (
            <button
              onClick={() => onNavigateSubPage("trend-pattern")}
              className="px-3.5 py-2 rounded-xl border border-purple-200 dark:border-purple-900/50 bg-purple-50 dark:bg-purple-950/30 text-purple-800 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Trends (Feat 19)
            </button>
          )}
          {onNavigateSubPage && (
            <button
              onClick={() => onNavigateSubPage("doctor-brief")}
              className="px-3.5 py-2 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-800 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Doctor Brief (Feat 18)
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Schedule Visit
          </button>
        </div>
      </div>

      {/* NON-DUPLICATION DATA BOUNDARY BANNER */}
      <div className="bg-sky-50/80 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-800/60 rounded-2xl p-4 flex items-start gap-3 text-sky-900 dark:text-sky-200">
        <Info className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
        <div className="text-xs md:text-sm">
          <span className="font-semibold text-sky-950 dark:text-sky-100">Appointments & Clinical Data Boundary:</span>{" "}
          Feature 17 manages visit dates, doctor questions, visit prep links, and post-visit notes. Clinical records collected during visits remain safely stored in their respective source modules (Features 1–16).
        </div>
      </div>

      {/* TABS NAVIGATION & QUICK FILTER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="bg-slate-100 dark:bg-slate-900/60 p-1.5 rounded-2xl flex gap-1 border border-slate-200/60 dark:border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === "upcoming"
                ? "bg-white dark:bg-[#1A1523] text-sky-600 dark:text-sky-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Calendar className="w-4 h-4" />
            Upcoming Visits ({upcomingAppts.length})
          </button>

          <button
            onClick={() => setActiveTab("preparation")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === "preparation"
                ? "bg-white dark:bg-[#1A1523] text-sky-600 dark:text-sky-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Visit Preparation
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === "history"
                ? "bg-white dark:bg-[#1A1523] text-sky-600 dark:text-sky-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            History ({completedAppts.length})
          </button>
        </div>

        {/* TARGET FILTER BUTTONS */}
        {activeTab === "upcoming" && (
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-800 text-xs self-start sm:self-auto">
            <button
              onClick={() => setFilterTarget("all")}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                filterTarget === "all"
                  ? "bg-white dark:bg-[#1A1523] text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterTarget("mother")}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                filterTarget === "mother"
                  ? "bg-white dark:bg-[#1A1523] text-rose-600 dark:text-rose-400 shadow-sm"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              🌸 Mother
            </button>
            <button
              onClick={() => setFilterTarget("baby")}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                filterTarget === "baby"
                  ? "bg-white dark:bg-[#1A1523] text-purple-600 dark:text-purple-400 shadow-sm"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              🍼 Baby
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: UPCOMING VISITS */}
      {activeTab === "upcoming" && (
        <div className="space-y-6">
          {filteredUpcoming.length === 0 ? (
            <div className="bg-white dark:bg-[#1A1523] rounded-3xl p-12 text-center border border-dashed border-slate-200 dark:border-slate-800">
              <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Upcoming Appointments Scheduled</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-4">
                Schedule your 6-week postpartum checkup, wound follow-up, or baby's pediatric visit to keep recovery on track.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Schedule First Appointment
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredUpcoming.map((appt) => {
                const prepLinks = getContextPrepLinks(appt.category, appt.target);
                return (
                  <div
                    key={appt.id}
                    className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* CARD HEADER */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span
                            className={`text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                              appt.target === "mother"
                                ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
                                : appt.target === "baby"
                                ? "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300"
                                : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                            }`}
                          >
                            {appt.target === "mother" ? "🌸 Mother Visit" : appt.target === "baby" ? `🍼 Baby Visit (${appt.babyName || "Baby"})` : "👩‍🍼 Joint Visit"}
                          </span>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2">{appt.title}</h3>
                        </div>
                        <span className="text-xs bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 px-2.5 py-1 rounded-lg font-semibold shrink-0 border border-sky-100 dark:border-sky-900/40">
                          {appt.category}
                        </span>
                      </div>

                      {/* DATE & PROVIDER INFO */}
                      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-3.5 text-xs text-slate-700 dark:text-slate-300 space-y-1.5 my-3 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 text-sky-700 dark:text-sky-400 font-bold text-sm">
                          <Clock className="w-4 h-4 shrink-0" />
                          {appt.date} at {appt.time}
                        </div>
                        {appt.providerName && (
                          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <Stethoscope className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>Provider: <strong>{appt.providerName}</strong></span>
                          </div>
                        )}
                        {appt.clinicHospital && (
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{appt.clinicHospital} {appt.location ? `• ${appt.location}` : ""}</span>
                          </div>
                        )}
                        <div className="text-slate-600 dark:text-slate-400 pt-1">
                          🎯 <strong>Purpose:</strong> {appt.purpose}
                        </div>
                      </div>

                      {/* QUESTIONS FOR DOCTOR PREVIEW */}
                      <div className="space-y-1.5 mb-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                            <HelpCircle className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                            Questions for Doctor ({appt.questions.length})
                          </span>
                        </div>

                        {appt.questions.length > 0 ? (
                          <ul className="text-xs space-y-1 pl-2">
                            {appt.questions.map((q) => (
                              <li key={q.id} className="flex items-start justify-between gap-2 text-slate-700 dark:text-slate-300">
                                <span className="truncate">• {q.question}</span>
                                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded capitalize shrink-0 font-medium">
                                  {q.status}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-[11px] text-slate-400 italic">No questions added yet.</p>
                        )}
                      </div>

                      {/* CONTEXT PREP LINKS */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                          Relevant Module Records
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {prepLinks.map((link, idx) => {
                            const IconComponent = link.icon;
                            return (
                              <button
                                key={idx}
                                onClick={() => onNavigateSubPage && onNavigateSubPage(link.page)}
                                className="text-[11px] bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-800 dark:text-purple-300 px-2.5 py-1 rounded-xl font-medium flex items-center gap-1.5 transition-colors border border-purple-200/60 dark:border-purple-800/40"
                              >
                                <IconComponent className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                                <span>{link.name}</span>
                                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* CARD ACTIONS */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 gap-2">
                      <button
                        onClick={() => handleDeleteAppointment(appt.id)}
                        className="text-xs text-slate-400 hover:text-rose-600 transition-colors p-1 font-medium"
                      >
                        Delete
                      </button>

                      <button
                        onClick={() => handleOpenCompleteModal(appt)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Complete / Log Doctor Notes
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: VISIT PREPARATION & RECORDS */}
      {activeTab === "preparation" && (
        <div className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              Context-Aware Visit Preparation Dashboard
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Before your appointment, quickly review your recorded observations from Features 1–16 without switching screens.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
              <h4 className="font-bold text-rose-950 dark:text-rose-300 text-sm flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                Maternal Recovery Checkup Prep
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Review physical pain, energy levels, lochia bleeding trends, wound incision status, and emotional wellbeing check-ins.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <button onClick={() => onNavigateSubPage && onNavigateSubPage("recovery")} className="text-xs bg-white dark:bg-slate-800 text-rose-700 dark:text-rose-300 px-2.5 py-1 rounded-xl border border-rose-200 dark:border-rose-800 font-medium hover:bg-rose-50 dark:hover:bg-rose-950/40">
                  Feat 02 Recovery Log
                </button>
                <button onClick={() => onNavigateSubPage && onNavigateSubPage("bleeding")} className="text-xs bg-white dark:bg-slate-800 text-rose-700 dark:text-rose-300 px-2.5 py-1 rounded-xl border border-rose-200 dark:border-rose-800 font-medium hover:bg-rose-50 dark:hover:bg-rose-950/40">
                  Feat 05 Bleeding History
                </button>
                <button onClick={() => onNavigateSubPage && onNavigateSubPage("pain")} className="text-xs bg-white dark:bg-slate-800 text-rose-700 dark:text-rose-300 px-2.5 py-1 rounded-xl border border-rose-200 dark:border-rose-800 font-medium hover:bg-rose-50 dark:hover:bg-rose-950/40">
                  Feat 06 Pain History
                </button>
                <button onClick={() => onNavigateSubPage && onNavigateSubPage("wound")} className="text-xs bg-white dark:bg-slate-800 text-rose-700 dark:text-rose-300 px-2.5 py-1 rounded-xl border border-rose-200 dark:border-rose-800 font-medium hover:bg-rose-50 dark:hover:bg-rose-950/40">
                  Feat 07 Wound Condition
                </button>
                <button onClick={() => onNavigateSubPage && onNavigateSubPage("medication")} className="text-xs bg-white dark:bg-slate-800 text-rose-700 dark:text-rose-300 px-2.5 py-1 rounded-xl border border-rose-200 dark:border-rose-800 font-medium hover:bg-rose-50 dark:hover:bg-rose-950/40">
                  Feat 16 Medications List
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
              <h4 className="font-bold text-purple-950 dark:text-purple-300 text-sm flex items-center gap-1.5">
                <Baby className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                Pediatric / Newborn Visit Prep
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Review baby feeding volume, diaper wet/dirty output logs, sleep duration, and growth trends.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <button onClick={() => onNavigateSubPage && onNavigateSubPage("baby-care")} className="text-xs bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded-xl border border-purple-200 dark:border-purple-800 font-medium hover:bg-purple-50 dark:hover:bg-purple-950/40">
                  Feat 03 Baby Profile
                </button>
                <button onClick={() => onNavigateSubPage && onNavigateSubPage("baby-feeding")} className="text-xs bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded-xl border border-purple-200 dark:border-purple-800 font-medium hover:bg-purple-50 dark:hover:bg-purple-950/40">
                  Feat 10 Baby Intake
                </button>
                <button onClick={() => onNavigateSubPage && onNavigateSubPage("diapers")} className="text-xs bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded-xl border border-purple-200 dark:border-purple-800 font-medium hover:bg-purple-50 dark:hover:bg-purple-950/40">
                  Feat 11 Diaper Output
                </button>
                <button onClick={() => onNavigateSubPage && onNavigateSubPage("baby-sleep")} className="text-xs bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded-xl border border-purple-200 dark:border-purple-800 font-medium hover:bg-purple-50 dark:hover:bg-purple-950/40">
                  Feat 13 Baby Sleep
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COMPLETED VISITS & FOLLOW-UP */}
      {activeTab === "history" && (
        <div className="bg-white dark:bg-[#1A1523] rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Completed Appointments & Follow-up History
          </h3>

          {completedAppts.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 italic py-6 text-center">No completed visits recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Appointment Title</th>
                    <th className="p-3">Target</th>
                    <th className="p-3">Provider</th>
                    <th className="p-3">Doctor Notes Recorded</th>
                    <th className="p-3">Follow-up Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {completedAppts.map((appt) => (
                    <tr key={appt.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition">
                      <td className="p-3 font-medium text-slate-900 dark:text-white">{appt.date}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{appt.title}</td>
                      <td className="p-3">
                        <span className="capitalize font-semibold text-purple-700 dark:text-purple-300">{appt.target}</span>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{appt.providerName || "—"}</td>
                      <td className="p-3 text-slate-700 dark:text-slate-300 italic max-w-xs truncate">
                        {appt.notes ? `"${appt.notes}"` : "No notes recorded"}
                      </td>
                      <td className="p-3">
                        {appt.followUpRequired && appt.followUpDate ? (
                          <span className="text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg">
                            Scheduled for {appt.followUpDate}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500">None required</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteAppointment(appt.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: SCHEDULE APPOINTMENT */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1A1523] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800/80 my-8 text-slate-800 dark:text-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                Schedule Healthcare Visit
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAppointment} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Who is this visit for?</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "mother", label: "🌸 Mother" },
                    { id: "baby", label: "🍼 Baby" },
                    { id: "both", label: "👩‍🍼 Joint" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTarget(t.id as AppointmentTarget)}
                      className={`p-2.5 rounded-xl border font-bold text-center transition ${
                        target === t.id
                          ? "bg-sky-600 text-white border-sky-600 shadow-sm"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="Postpartum Check-up">Postpartum Check-up</option>
                    <option value="Wound Follow-up">C-Section / Wound Follow-up</option>
                    <option value="Breastfeeding / Lactation">Breastfeeding / Lactation</option>
                    <option value="Newborn Check-up">Newborn Pediatric Visit</option>
                    <option value="Vaccination">Vaccination Visit</option>
                    <option value="Emotional Wellbeing">Mental & Emotional Wellbeing</option>
                    <option value="Medication Review">Medication Review</option>
                    <option value="Other">Other Specialty Visit</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Appointment Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 6-Week Postpartum Recovery Check"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 10:30 AM"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Provider Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Ananya Sharma"
                    value={providerName}
                    onChange={(e) => setProviderName(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Clinic / Hospital</label>
                  <input
                    type="text"
                    placeholder="e.g. Apollo Womens Hospital"
                    value={clinicHospital}
                    onChange={(e) => setClinicHospital(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Purpose of Visit</label>
                <input
                  type="text"
                  placeholder="e.g. Routine physical recovery check, incision check, feeding review"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Initial Question for Doctor (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Is this level of pelvic discomfort normal?"
                  value={initialQuestion}
                  onChange={(e) => setInitialQuestion(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold"
                >
                  Schedule Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: COMPLETE VISIT & LOG NOTES */}
      {showCompleteModal && selectedApptForAction && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1A1523] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800/80 my-8 text-slate-800 dark:text-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Complete Visit & Log Notes
              </h3>
              <button onClick={() => setShowCompleteModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVisitCompletion} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Clinician / Doctor Notes (User Recorded)</label>
                <textarea
                  rows={3}
                  placeholder="Record what the healthcare provider instructed (e.g. Doctor confirmed wound is healing well, continue iron supplement for 2 weeks)."
                  value={visitNotes}
                  onChange={(e) => setVisitNotes(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="followUpCheck"
                  checked={followUpRequired}
                  onChange={(e) => setFollowUpRequired(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <label htmlFor="followUpCheck" className="text-slate-700 dark:text-slate-300 font-bold">
                  Follow-up visit required?
                </label>
              </div>

              {followUpRequired && (
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Follow-up Date</label>
                  <input
                    type="date"
                    required
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Setting a follow-up date will automatically schedule your next visit entry!
                  </p>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
                >
                  Save & Complete Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MotherBabyAppointmentsPage;
