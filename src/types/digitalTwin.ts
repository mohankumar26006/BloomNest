export type AvatarVisualState =
  | "STABLE"
  | "POSITIVE"
  | "TIRED"
  | "DISCOMFORT"
  | "LOW_MOOD"
  | "ATTENTION";

export interface AvatarReaction {
  state: AvatarVisualState;
  label: string;
  reason: string;
  updatedAt: string;
  severityLevel: "info" | "normal" | "warning" | "alert";
}

export interface TwinChangeItem {
  id: string;
  category: "pregnancy" | "health" | "wellness" | "care" | "safety";
  title: string;
  description: string;
  type: "improved" | "declined" | "neutral" | "attention";
  timestamp: string;
}

export interface DigitalTwinState {
  pregnancy: {
    week: number;
    trimester: number;
    dueDate: string;
    progress: number;
    daysRemaining: number;
  };
  health: {
    symptoms: string[];
    pain: {
      active: boolean;
      location?: string;
      intensity?: number;
      description?: string;
    };
    recentVitals: {
      bp?: string;
      systolic?: number;
      diastolic?: number;
      pulse?: number;
      glucose?: number;
      weight?: number;
      map?: number;
    };
    trends: string;
  };
  wellness: {
    hydration: {
      todayMl: number;
      targetMl: number;
      isAdequate: boolean;
    };
    sleep: {
      lastNightHours: number;
      isRestful: boolean;
      qualityDescription: string;
    };
    nutrition: {
      mealsLogged: number;
      notes: string;
    };
    mood: {
      currentMood: string;
      isPositive: boolean;
    };
  };
  care: {
    upcomingAppointments: Array<{
      id: string | number;
      title: string;
      date: string;
      doctorName?: string;
    }>;
    medications: {
      totalActive: number;
      takenTodayCount: number;
    };
    careTasksDue: number;
  };
  memory: {
    relevantMemories: string[];
    preferences: string[];
    observations: string[];
  };
  safety: {
    status: "NORMAL" | "ATTENTION" | "HIGH" | "SEVERE";
    hasHighRiskSymptoms: boolean;
    symptomAlerts: string[];
    activeConstraints: string[];
    requiresUrgentAttention: boolean;
  };
  avatar: AvatarReaction;
  changes: TwinChangeItem[];
}
