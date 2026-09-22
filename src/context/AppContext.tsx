import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { get, set } from "idb-keyval";
import {
  PageView,
  UserProfile,
  HealthVital,
  Medicine,
  Appointment,
  KickSession,
  ContractionLog,
  MoodLog,
  JournalEntry,
  HospitalBagItem,
  EmergencyContact,
  BabyName,
  AppNotification,
  LanguageCode,
  UiThemeOption,
  ScanReportAttachment,
} from "../types";
import {
  DEMO_USER,
  DEMO_VITALS,
  DEMO_MEDICINES,
  DEMO_APPOINTMENTS,
  DEMO_KICK_SESSIONS,
  DEMO_CONTRACTIONS,
  DEMO_JOURNAL,
  DEMO_HOSPITAL_BAG,
  DEMO_EMERGENCY_CONTACTS,
  DEMO_NOTIFICATIONS,
} from "../data/initialDemoData";
import { BABY_NAMES_DATABASE } from "../data/babyNames";
import { TRANSLATIONS, LanguageOption, SUPPORTED_LANGUAGES } from "../data/translations";
import { playUrgentAlertSound } from "../utils/alertSound";
import { evaluateHealthVital } from "../services/healthVitalsService";
import { enqueueMutation, subscribeSyncStatus, SyncStatus } from "../services/syncEngine";
import { calculatePregnancyProgress } from "../utils/pregnancyCalculation";

interface AppContextType {
  syncStatus: SyncStatus;
  pendingSyncCount: number;
  activePage: PageView;
  setActivePage: (page: PageView) => void;
  user: UserProfile;
  updateUser: (fields: Partial<UserProfile>) => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  supportedLanguages: LanguageOption[];
  t: (key: string, vars?: Record<string, string | number>) => string;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  currentTheme: UiThemeOption;
  setUiTheme: (theme: UiThemeOption) => void;
  vitals: HealthVital[];
  addVital: (vital: Omit<HealthVital, "id">) => Promise<HealthVital>;
  updateVital: (id: number | string, updated: Partial<HealthVital>) => Promise<HealthVital>;
  deleteVital: (id: number | string) => Promise<void>;
  quickAddWater: (amountMl?: number) => void;
  isAudioMuted: boolean;
  toggleAudioMute: () => void;
  medicines: Medicine[];
  toggleMedicineTaken: (id: number) => void;
  addMedicine: (med: Omit<Medicine, "id" | "isActive" | "isTakenToday">) => void;
  appointments: Appointment[];
  addAppointment: (apt: Omit<Appointment, "id" | "status">) => void;
  kickSessions: KickSession[];
  addKickSession: (session: Omit<KickSession, "id">) => void;
  contractions: ContractionLog[];
  addContraction: (contraction: Omit<ContractionLog, "id">) => void;
  moodLogs: MoodLog[];
  addMoodLog: (log: Omit<MoodLog, "id">) => void;
  journalEntries: JournalEntry[];
  addJournalEntry: (entry: Omit<JournalEntry, "id">) => void;
  hospitalBag: HospitalBagItem[];
  toggleHospitalItem: (id: number) => void;
  addHospitalItem: (item: Omit<HospitalBagItem, "id" | "isPacked">) => void;
  emergencyContacts: EmergencyContact[];
  addEmergencyContact: (contact: Omit<EmergencyContact, "id">) => void;
  babyNames: BabyName[];
  toggleFavoriteBabyName: (id: string) => void;
  notifications: AppNotification[];
  markNotificationRead: (id: number) => void;
  toast: string | null;
  showToast: (msg: string) => void;
  resetAllData: () => void;
  loadDemoData: () => void;
  initializeNewUser: (profile: Partial<UserProfile>) => void;
  signInUser: (profile: { fullName: string; email: string; currentWeek?: number; trimester?: number; eddDate?: string }) => void;
  isHydrated: boolean;
  triggerNotification: (title: string, body?: string) => void;
  scanReports: ScanReportAttachment[];
  addScanReport: (report: Omit<ScanReportAttachment, "id" | "uploadedAt">) => void;
  deleteScanReport: (id: string) => void;
  getScanReportsByScanId: (scanId: string) => ScanReportAttachment[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "bloomnest_app_state_v1";

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("synced");
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [activePage, setActivePage] = useState<PageView>("dashboard");
  const [user, setUser] = useState<UserProfile>(DEMO_USER);

  useEffect(() => {
    const unsubscribe = subscribeSyncStatus((status, count) => {
      setSyncStatus(status);
      setPendingSyncCount(count);
    });
    return () => unsubscribe();
  }, []);
  const [language, setLanguageState] = useState<LanguageCode>("en");
  const [dynamicDict, setDynamicDict] = useState<Record<string, string>>(TRANSLATIONS["en"]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [currentTheme, setCurrentTheme] = useState<UiThemeOption>("soft-pastel-minimal");

  const setUiTheme = (theme: UiThemeOption) => {
    setCurrentTheme(theme);
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "midnight-lavender" || theme === "black-rosegold") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  };

  const [vitals, setVitals] = useState<HealthVital[]>(DEMO_VITALS);
  const [medicines, setMedicines] = useState<Medicine[]>(DEMO_MEDICINES);
  const [appointments, setAppointments] = useState<Appointment[]>(DEMO_APPOINTMENTS);
  const [kickSessions, setKickSessions] = useState<KickSession[]>(DEMO_KICK_SESSIONS);
  const [contractions, setContractions] = useState<ContractionLog[]>(DEMO_CONTRACTIONS);
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(DEMO_JOURNAL);
  const [hospitalBag, setHospitalBag] = useState<HospitalBagItem[]>(DEMO_HOSPITAL_BAG);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>(DEMO_EMERGENCY_CONTACTS);
  const [babyNames, setBabyNames] = useState<BabyName[]>(BABY_NAMES_DATABASE);
  const [notifications, setNotifications] = useState<AppNotification[]>(DEMO_NOTIFICATIONS);
  const [scanReports, setScanReports] = useState<ScanReportAttachment[]>([]);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", currentTheme);
    if (currentTheme === "midnight-lavender" || currentTheme === "black-rosegold") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, [currentTheme]);

  useEffect(() => {
    const loadState = async () => {
      try {
        // 1. Try LocalStorage / IndexedDB first (source of truth for offline-first user data)
        const savedLocal = await get(LOCAL_STORAGE_KEY);
        if (savedLocal) {
          const localParsed = typeof savedLocal === "string" ? JSON.parse(savedLocal) : savedLocal;
          if (localParsed.user) {
            const recalibrated = calculatePregnancyProgress(localParsed.user);
            setUser({
              ...DEMO_USER,
              ...localParsed.user,
              currentWeek: recalibrated.currentWeek,
              trimester: recalibrated.trimester,
              daysRemaining: recalibrated.daysRemaining,
              edd: recalibrated.edd,
              hasCompletedOnboarding: localParsed.user.hasCompletedOnboarding !== undefined ? Boolean(localParsed.user.hasCompletedOnboarding) : false,
            });
          }
          if (localParsed.vitals !== undefined) setVitals(localParsed.vitals);
          if (localParsed.medicines !== undefined) setMedicines(localParsed.medicines);
          if (localParsed.kickSessions !== undefined) setKickSessions(localParsed.kickSessions);
          if (localParsed.contractions !== undefined) setContractions(localParsed.contractions);
          if (localParsed.moodLogs !== undefined) setMoodLogs(localParsed.moodLogs);
          if (localParsed.journalEntries !== undefined) setJournalEntries(localParsed.journalEntries);
          if (localParsed.appointments !== undefined) setAppointments(localParsed.appointments);
          if (localParsed.hospitalBag !== undefined) setHospitalBag(localParsed.hospitalBag);
          if (localParsed.emergencyContacts !== undefined) setEmergencyContacts(localParsed.emergencyContacts);
          if (localParsed.babyNames !== undefined) {
            // Keep only user-favorited AI names, purge legacy cached demo names (e.g. Aaradhya)
            setBabyNames(localParsed.babyNames.filter((b: any) => b.isFavorite && !/^\d+$/.test(b.id)));
          }
          if (localParsed.notifications !== undefined) setNotifications(localParsed.notifications);
          if (localParsed.scanReports !== undefined) setScanReports(localParsed.scanReports);
          if (localParsed.language) setLanguageState(localParsed.language);
          if (localParsed.currentTheme) {
            setCurrentTheme(localParsed.currentTheme);
            if (localParsed.currentTheme === "soft-pastel-minimal" || localParsed.currentTheme === "serene-rose" || localParsed.currentTheme === "botanical-sage") {
              setIsDarkMode(false);
              document.documentElement.classList.remove("dark");
            }
          }
        } else {
          // Fallback to server state if fresh install (with 800ms max timeout)
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 800);
          try {
            const response = await fetch("/api/state", { signal: controller.signal });
            clearTimeout(timeoutId);
            if (response.ok) {
              const parsed = await response.json();
              if (parsed.fullName) {
                setUser((prev) => ({
                  ...prev,
                  fullName: parsed.fullName,
                  email: parsed.email || prev.email,
                  doctorName: parsed.obgynName || parsed.doctorName || prev.doctorName,
                  hospitalName: parsed.hospitalName || prev.hospitalName,
                  lmpDate: parsed.lmpDate || prev.lmpDate,
                  currentWeek: parsed.currentWeek || prev.currentWeek,
                  trimester: parsed.trimester || prev.trimester,
                  hasCompletedOnboarding: true,
                }));
              }
              if (parsed.moodLogs && Array.isArray(parsed.moodLogs)) setMoodLogs(parsed.moodLogs);
              if (parsed.journalEntries && Array.isArray(parsed.journalEntries)) setJournalEntries(parsed.journalEntries);
              if (parsed.notifications && Array.isArray(parsed.notifications)) setNotifications(parsed.notifications);
              if (parsed.hospitalVisits && Array.isArray(parsed.hospitalVisits)) setAppointments(parsed.hospitalVisits);
              if (parsed.language) setLanguageState(parsed.language);
            }
          } catch {
            // Fetch timeout or network failure fallback
          }
        }
      } catch (e) {
        console.error("Failed to load local state:", e);
      } finally {
        setIsHydrated(true);
      }
    };
    loadState();
  }, []);

  // Sync state to LocalStorage and Server
  useEffect(() => {
    if (!isHydrated) return; // Don't overwrite state before loading
    const saveState = async () => {
      try {
        // Save complete state to LocalStorage / IndexedDB
        const stateToSaveLocal = {
          user,
          vitals,
          medicines,
          appointments,
          kickSessions,
          contractions,
          moodLogs,
          journalEntries,
          hospitalBag,
          emergencyContacts,
          babyNames,
          notifications,
          scanReports,
          language,
          isDarkMode,
          currentTheme,
        };
        await set(LOCAL_STORAGE_KEY, stateToSaveLocal);

        // Optional server backup
        fetch("/api/state", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user,
            language,
            moodLogs,
            journalEntries,
            notifications,
            hospitalVisits: appointments,
          }),
        }).catch(() => {});
      } catch (e) {
        console.error("Failed to save state:", e);
      }
    };
    saveState();
  }, [
    user,
    vitals,
    medicines,
    appointments,
    kickSessions,
    contractions,
    moodLogs,
    journalEntries,
    hospitalBag,
    emergencyContacts,
    babyNames,
    notifications,
    scanReports,
    language,
    isDarkMode,
    currentTheme,
  ]);

  // Dark mode & theme attribute handler
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", currentTheme);
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode, currentTheme]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // Dynamic Translation Fetcher
  useEffect(() => {
    let isMounted = true;
    const fetchDict = async () => {
      try {
        const res = await fetch(`/api/translations?lang=${language}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.translations) {
            setDynamicDict(data.translations);
          }
        }
      } catch (e) {
        console.error("Failed to fetch translations", e);
      }
    };
    fetchDict();
    return () => { isMounted = false; };
  }, [language]);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    showToast(`Language switched to ${SUPPORTED_LANGUAGES.find((l) => l.code === lang)?.label}`);
  };

  const t = (key: string, vars?: Record<string, string | number>): string => {
    let text = dynamicDict[key] || TRANSLATIONS["en"][key] || key;

    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
      });
    }

    return text;
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const triggerNotification = useCallback((title: string, body?: string) => {
    if (!("Notification" in window)) return;
    
    if (Notification.permission === "granted") {
      new Notification(title, { body, icon: "/vite.svg" });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification(title, { body, icon: "/vite.svg" });
        }
      });
    }
  }, []);

  const updateUser = (fields: Partial<UserProfile>) => {
    setUser((prev) => {
      const merged = { ...prev, ...fields };
      if (fields.currentWeek !== undefined || fields.edd !== undefined || fields.lmpDate !== undefined || fields.dueDate !== undefined) {
        const recalibrated = calculatePregnancyProgress(merged);
        return {
          ...merged,
          currentWeek: recalibrated.currentWeek,
          trimester: recalibrated.trimester,
          daysRemaining: recalibrated.daysRemaining,
          edd: recalibrated.edd,
        };
      }
      return merged;
    });
    showToast("Profile updated successfully! 💕");
  };

  const toggleAudioMute = () => {
    setIsAudioMuted((prev) => !prev);
    showToast(isAudioMuted ? "Alert sound unmuted 🔔" : "Alert sound muted 🔕");
  };

  const addVital = async (vital: Omit<HealthVital, "id">): Promise<HealthVital> => {
    try {
      const res = await fetch("/api/vitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vital),
      });

      if (res.ok) {
        const data = await res.json();
        const serverEntry: HealthVital = data.entry;

        setVitals((prev) => [serverEntry, ...prev]);
        enqueueMutation(user.id, "HealthVitalLog", "CREATE", serverEntry).catch(() => {});

        if (serverEntry.evaluation?.playAlertSound) {
          playUrgentAlertSound(isAudioMuted);
          showToast("⚠️ Alert: Severe vital reading evaluated by backend");
        } else {
          showToast("Health vitals logged! ✨");
        }

        return serverEntry;
      } else {
        const errData = await res.json().catch(() => ({}));
        console.warn("Server vitals endpoint returned non-ok, falling back locally:", errData);
      }
    } catch (err) {
      console.warn("Server vitals endpoint unreachable, falling back locally:", err);
    }

    // Resilient offline-first fallback: Evaluate deterministically in client and save to state / IndexedDB
    const evaluation = evaluateHealthVital(vital);
    const localEntry: HealthVital = {
      ...vital,
      id: Date.now(),
      date: vital.date || new Date().toISOString().split("T")[0],
      timestamp: new Date().toISOString(),
      evaluation,
    };

    setVitals((prev) => [localEntry, ...prev]);
    enqueueMutation(user.id, "HealthVitalLog", "CREATE", localEntry).catch(() => {});

    if (localEntry.evaluation?.playAlertSound) {
      playUrgentAlertSound(isAudioMuted);
      showToast("⚠️ Alert: Severe vital reading evaluated");
    } else {
      showToast("Health vitals logged! ✨");
    }

    return localEntry;
  };

  const quickAddWater = (amountMl: number = 250) => {
    if (vitals.length === 0) return;
    const latest = vitals[0];
    const updatedCandidate = {
      ...latest,
      waterMl: (latest.waterMl || 0) + amountMl,
    };

    fetch("/api/vitals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedCandidate),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.entry) {
          setVitals((prev) => [data.entry, ...prev.slice(1)]);
          enqueueMutation(user.id, "HealthVitalLog", "UPDATE", data.entry).catch(() => {});
          showToast(`Hydration +${amountMl}ml logged! 💧`);
        }
      })
      .catch(() => {
        // Fallback local update
        setVitals((prev) => [updatedCandidate, ...prev.slice(1)]);
        showToast(`Hydration +${amountMl}ml logged! 💧`);
      });
  };

  const deleteVital = async (id: number | string): Promise<void> => {
    setVitals((prev) => prev.filter((v) => String(v.id) !== String(id)));
    enqueueMutation(user.id, "HealthVitalLog", "DELETE", { id }).catch(() => {});
    showToast("Vitals entry removed 🗑️");
  };

  const updateVital = async (id: number | string, updated: Partial<HealthVital>): Promise<HealthVital> => {
    const existing = vitals.find((v) => String(v.id) === String(id));
    const candidate = { ...(existing || {}), ...updated, id };

    try {
      const res = await fetch("/api/vitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(candidate),
      });

      if (res.ok) {
        const data = await res.json();
        const serverEntry: HealthVital = data.entry;

        setVitals((prev) => prev.map((v) => (String(v.id) === String(id) ? serverEntry : v)));
        enqueueMutation(user.id, "HealthVitalLog", "UPDATE", serverEntry).catch(() => {});
        showToast("Health vital record updated! ✨");
        return serverEntry;
      }
    } catch (err) {
      console.warn("Server vitals update unreachable, falling back to local:", err);
    }

    // Local evaluation fallback
    const evaluation = evaluateHealthVital(candidate);
    const localEntry: HealthVital = {
      ...candidate,
      evaluation,
    } as HealthVital;

    setVitals((prev) => prev.map((v) => (String(v.id) === String(id) ? localEntry : v)));
    enqueueMutation(user.id, "HealthVitalLog", "UPDATE", localEntry).catch(() => {});
    showToast("Health vital record updated! ✨");
    return localEntry;
  };

  const toggleMedicineTaken = (id: number) => {
    setMedicines((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isTakenToday: !m.isTakenToday } : m))
    );
  };

  const addMedicine = (med: Omit<Medicine, "id" | "isActive" | "isTakenToday">) => {
    const newMed: Medicine = {
      ...med,
      id: Date.now(),
      isActive: true,
      isTakenToday: false,
    };
    setMedicines((prev) => [...prev, newMed]);
    showToast("Medicine reminder added! 💊");
  };

  const addAppointment = (apt: Omit<Appointment, "id" | "status">) => {
    const newApt: Appointment = { ...apt, id: Date.now(), status: "upcoming" };
    setAppointments((prev) => [newApt, ...prev]);
    enqueueMutation(user.id, "Appointment", "CREATE", newApt).catch(() => {});
    showToast("Doctor appointment scheduled! 🩺");
    triggerNotification("Appointment Scheduled", `Dr. visit set for ${apt.appointmentDate}`);
  };

  const addKickSession = (session: Omit<KickSession, "id">) => {
    const newSession: KickSession = { ...session, id: Date.now() };
    setKickSessions((prev) => [newSession, ...prev]);
    enqueueMutation(user.id, "KickSession", "CREATE", newSession).catch(() => {});

    // Sync today's kicks into authoritative vitals list for cross-feature consistency
    const todayStr = session.date || new Date().toISOString().split("T")[0];
    setVitals((prevVitals) => {
      if (prevVitals.length > 0 && prevVitals[0].date && prevVitals[0].date.startsWith(todayStr)) {
        const currentKicks = prevVitals[0].babyKicksCount || 0;
        const updatedFirst = {
          ...prevVitals[0],
          babyKicksCount: currentKicks + session.kickCount,
        };
        return [updatedFirst, ...prevVitals.slice(1)];
      }
      return prevVitals;
    });

    showToast("Kick session saved! 👶");
  };

  const addContraction = (contraction: Omit<ContractionLog, "id">) => {
    const newLog: ContractionLog = { ...contraction, id: Date.now() };
    setContractions((prev) => [newLog, ...prev]);
    enqueueMutation(user.id, "ContractionLog", "CREATE", newLog).catch(() => {});
    triggerNotification("Contraction Logged", `Duration: ${contraction.durationSeconds}s`);
  };

  const addMoodLog = (log: Omit<MoodLog, "id">) => {
    const newLog: MoodLog = { ...log, id: Date.now() };
    setMoodLogs((prev) => [newLog, ...prev]);
    enqueueMutation(user.id, "MoodLog", "CREATE", newLog).catch(() => {});
    showToast("Mood & sleep entry logged! 🌸");
  };

  const addJournalEntry = (entry: Omit<JournalEntry, "id">) => {
    const newEntry: JournalEntry = { ...entry, id: Date.now() };
    setJournalEntries((prev) => [newEntry, ...prev]);
    enqueueMutation(user.id, "JournalEntry", "CREATE", newEntry).catch(() => {});
    showToast("Journal entry published! 📖");
  };

  const toggleHospitalItem = (id: number) => {
    setHospitalBag((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, isPacked: !item.isPacked } : item));
      const targetItem = updated.find((i) => i.id === id);
      if (targetItem) {
        enqueueMutation(user.id, "HospitalBagItem", "UPDATE", targetItem).catch(() => {});
      }
      return updated;
    });
  };

  const addHospitalItem = (item: Omit<HospitalBagItem, "id" | "isPacked">) => {
    const newItem: HospitalBagItem = { ...item, id: Date.now(), isPacked: false };
    setHospitalBag((prev) => [...prev, newItem]);
    enqueueMutation(user.id, "HospitalBagItem", "CREATE", newItem).catch(() => {});
    showToast("Added item to hospital bag! 💼");
  };

  const addEmergencyContact = (contact: Omit<EmergencyContact, "id">) => {
    const newContact: EmergencyContact = { ...contact, id: Date.now() };
    setEmergencyContacts((prev) => [...prev, newContact]);
    enqueueMutation(user.id, "EmergencyContact", "CREATE", newContact).catch(() => {});
    showToast("Emergency contact saved! 📞");
  };

  const toggleFavoriteBabyName = (id: string) => {
    setBabyNames((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isFavorite: !n.isFavorite } : n))
    );
  };

  const markNotificationRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const loadDemoData = () => {
    setUser(DEMO_USER);
    setVitals(DEMO_VITALS);
    setMedicines(DEMO_MEDICINES);
    setAppointments(DEMO_APPOINTMENTS);
    setKickSessions(DEMO_KICK_SESSIONS);
    setContractions(DEMO_CONTRACTIONS);
    setJournalEntries(DEMO_JOURNAL);
    setHospitalBag(DEMO_HOSPITAL_BAG);
    setEmergencyContacts(DEMO_EMERGENCY_CONTACTS);
    setBabyNames(BABY_NAMES_DATABASE);
    setNotifications(DEMO_NOTIFICATIONS);
    showToast("Loaded Sarah's Demo Account! 🌸");
  };

  const signInUser = (profile: {
    fullName: string;
    email: string;
    currentWeek?: number;
    trimester?: number;
    eddDate?: string;
  }) => {
    if (profile.email.toLowerCase() === "sarah@bloomnest.com") {
      loadDemoData();
      setActivePage("dashboard");
      return;
    }

    const progress = calculatePregnancyProgress({
      currentWeek: profile.currentWeek,
      trimester: profile.trimester,
      edd: profile.eddDate,
    });

    setUser((prev) => ({
      ...prev,
      fullName: profile.fullName || prev.fullName,
      email: profile.email || prev.email,
      currentWeek: progress.currentWeek,
      trimester: progress.trimester,
      edd: progress.edd,
      daysRemaining: progress.daysRemaining,
      hasCompletedOnboarding: true,
    }));

    setActivePage("dashboard");
    showToast(`🌸 Welcome back, ${profile.fullName || "Mom"}! Direct login to Dashboard.`);
  };

  const initializeNewUser = (profile: Partial<UserProfile>) => {
    const progress = calculatePregnancyProgress({
      currentWeek: profile.currentWeek,
      trimester: profile.trimester,
      edd: profile.edd,
      lmpDate: profile.lmpDate,
    });

    const newUser: UserProfile = {
      id: Date.now(),
      fullName: profile.fullName || "New Mom",
      email: profile.email || "mom@bloomnest.com",
      role: "user",
      currentJourney: profile.currentJourney,
      currentWeek: progress.currentWeek,
      trimester: progress.trimester,
      edd: progress.edd,
      lmpDate: profile.lmpDate || "2026-06-05",
      daysRemaining: progress.daysRemaining,
      age: profile.age || 28,
      avatarUrl: profile.avatarUrl || undefined,
      doctorName: profile.doctorName || "Dr. Emily Chen, MD (OB-GYN)",
      hospitalName: profile.hospitalName || "Apollo Cradle Maternity",
      hasCompletedOnboarding: true,
      prePregnancyDetails: profile.prePregnancyDetails,
      postpartumDetails: profile.postpartumDetails,
      extractedMedicalFields: profile.extractedMedicalFields,
    };

    setUser(newUser);

    // Auto-calibrate baseline vitals from medical report extraction if available
    const extracted = profile.extractedMedicalFields || [];
    let initialVitalsList: HealthVital[] = [];

    if (extracted.length > 0) {
      const bpField = extracted.find((f) => f.label.toLowerCase().includes("blood pressure") || f.label.toLowerCase().includes("bp"));
      const sugarField = extracted.find((f) => f.label.toLowerCase().includes("sugar") || f.label.toLowerCase().includes("glucose"));
      const weightField = extracted.find((f) => f.label.toLowerCase().includes("weight"));
      const hbField = extracted.find((f) => f.label.toLowerCase().includes("hemoglobin") || f.label.toLowerCase().includes("hb"));

      let sys = 118, dia = 74;
      if (bpField && bpField.value.includes("/")) {
        const parts = bpField.value.split("/");
        sys = parseInt(parts[0], 10) || 118;
        dia = parseInt(parts[1], 10) || 74;
      }

      const sugarVal = sugarField ? parseFloat(sugarField.value) || 86 : 86;
      const weightVal = weightField ? parseFloat(weightField.value) || 62.5 : 62.5;

      const baselineVital: HealthVital = {
        id: Date.now(),
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        systolicBp: sys,
        diastolicBp: dia,
        bloodSugarMgDl: sugarVal,
        glucoseMgDl: sugarVal,
        glucoseContext: "fasting",
        weightKg: weightVal,
        waterMl: 1750,
        sleepHours: 8,
        symptoms: [],
        energyLevel: 8,
        mood: "Calm & Reassured",
        babyKicksCount: 10,
        notes: `Calibrated from BloomScan OCR (${extracted.length} clinical markers verified)`,
        evaluation: evaluateHealthVital({
          systolicBp: sys,
          diastolicBp: dia,
          bloodSugarMgDl: sugarVal,
          glucoseMgDl: sugarVal,
          glucoseContext: "fasting",
        }),
      };

      initialVitalsList = [baselineVital];
      setVitals(initialVitalsList);
    } else {
      setVitals([]);
    }

    setMedicines([
      { id: 1, name: "Prenatal Multivitamin + DHA", dosage: "1 Tablet Daily with Breakfast", time: "09:00 AM", isTakenToday: false, isActive: true },
      { id: 2, name: "Folic Acid & Elemental Iron", dosage: "1 Capsule with Citrus Juice", time: "01:00 PM", isTakenToday: false, isActive: true },
      { id: 3, name: "Calcium & Vitamin D3", dosage: "1 Tablet Post-Dinner", time: "09:00 PM", isTakenToday: false, isActive: true },
    ]);

    // Pre-populate upcoming consultation with their primary OB-GYN if available
    if (newUser.doctorName) {
      setAppointments([
        {
          id: Date.now() + 1,
          doctorName: newUser.doctorName,
          specialty: "Obstetrics & Maternal-Fetal Medicine",
          clinicName: newUser.hospitalName || "Apollo Cradle Maternity",
          appointmentDate: "In 2 Weeks (Routine Trimester Follow-up)",
          time: "10:30 AM",
          status: "upcoming",
          notes: "Routine antenatal assessment & growth ultrasound review.",
        },
      ]);
    } else {
      setAppointments([]);
    }

    setKickSessions([]);
    setContractions([]);
    setMoodLogs([]);
    setJournalEntries([]);
    setHospitalBag(DEMO_HOSPITAL_BAG.map((item) => ({ ...item, isPacked: false })));
    setEmergencyContacts([
      { id: 1, name: "Primary Care Emergency", relation: "Hospital Helplink", phone: "108" },
      { id: 2, name: newUser.doctorName || "Dr. Ananya Sharma", relation: "OB-GYN", phone: "+91 98401 23456" },
    ]);
    setNotifications([
      {
        id: Date.now(),
        title: `Welcome to BloomNest, ${newUser.fullName}! 🌸`,
        message: `Your dashboard is personalized to Week ${newUser.currentWeek}. Verified clinical baseline, medication timers, and AI guidance are calibrated.`,
        time: "Just now",
        isRead: false,
        type: "system",
      },
    ]);
    showToast(`Welcome, ${newUser.fullName}! Your personalized hub is ready ✨`);
  };

  const resetAllData = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    loadDemoData();
  };

  const addScanReport = useCallback(
    (newReport: Omit<ScanReportAttachment, "id" | "uploadedAt">) => {
      const report: ScanReportAttachment = {
        ...newReport,
        id: `report-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        uploadedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      };
      setScanReports((prev) => [report, ...prev]);
      setToast(t("reportAttachedSuccessfully") || "Scan report attached successfully!");
    },
    [t]
  );

  const deleteScanReport = useCallback(
    (id: string) => {
      setScanReports((prev) => prev.filter((r) => r.id !== id));
      setToast(t("reportDeleted") || "Report removed");
    },
    [t]
  );

  const getScanReportsByScanId = useCallback(
    (scanId: string) => {
      return scanReports.filter((r) => r.scanId === scanId);
    },
    [scanReports]
  );

  return (
    <AppContext.Provider
      value={{
        syncStatus,
        pendingSyncCount,
        activePage,
        setActivePage,
        user,
        updateUser,
        language,
        setLanguage,
        supportedLanguages: SUPPORTED_LANGUAGES,
        t,
        isDarkMode,
        toggleDarkMode,
        currentTheme,
        setUiTheme,
        vitals,
        addVital,
        updateVital,
        deleteVital,
        quickAddWater,
        isAudioMuted,
        toggleAudioMute,
        medicines,
        toggleMedicineTaken,
        addMedicine,
        appointments,
        addAppointment,
        kickSessions,
        addKickSession,
        contractions,
        addContraction,
        moodLogs,
        addMoodLog,
        journalEntries,
        addJournalEntry,
        hospitalBag,
        toggleHospitalItem,
        addHospitalItem,
        emergencyContacts,
        addEmergencyContact,
        babyNames,
        toggleFavoriteBabyName,
        notifications,
        markNotificationRead,
        toast,
        showToast,
        resetAllData,
        loadDemoData,
        initializeNewUser,
        signInUser,
        isHydrated,
        triggerNotification,
        scanReports,
        addScanReport,
        deleteScanReport,
        getScanReportsByScanId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
