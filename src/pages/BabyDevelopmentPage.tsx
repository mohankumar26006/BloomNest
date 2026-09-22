import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { PREGNANCY_WEEKS_DATA } from "../data/pregnancyWeeksData";
import { getMaternalPostureData } from "../data/maternalPostureData";
import { calculatePregnancyProgress } from "../utils/pregnancyCalculation";
import confetti from "canvas-confetti";
import {
  Baby,
  Volume2,
  VolumeX,
  Sparkles,
  Heart,
  Activity,
  Scale,
  Move,
  Image as ImageIcon,
  Layers,
  Info,
  CheckCircle2,
  Eye,
  Brain,
  Compass,
  ArrowLeft,
  Headphones,
  Radio,
  Clock,
  RotateCw,
  RotateCcw,
  Hand,
  Play,
  Pause,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  Check,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import fetalDevBanner from "../assets/images/fetal_dev_banner_1785562889402.jpg";
import prenatalYogaGuide from "../assets/images/prenatal_yoga_guide_1785562916165.jpg";

// Clinical Fetal Heart Rate (FHR) by gestational week (ACOG standard)
export const getFetalHeartRateBpm = (week: number): number => {
  if (week <= 5) return 0; // Pre-cardiac detection
  if (week === 6) return 108;
  if (week === 7) return 126;
  if (week === 8) return 152;
  if (week <= 10) return 174; // Peak embryological cardiac rate
  if (week <= 14) return 162;
  if (week <= 20) return 152;
  if (week <= 28) return 146;
  if (week <= 34) return 140;
  return 134; // Full term physiological stabilization
};

// Clinical anatomical milestones by organ system & gestational stage
export const getAnatomicalHotspotDetails = (
  hotspot: "brain" | "heart" | "limbs" | "senses",
  week: number,
  bpm: number
) => {
  if (hotspot === "brain") {
    if (week <= 12) {
      return {
        title: "Neural Tube & Cerebral Primordia",
        system: "Central Nervous System",
        stage: "Embryonic Neurogenesis (1st Trimester)",
        fact: "Neural tube has completely closed. Forebrain, midbrain, and hindbrain are rapidly dividing into cerebral hemispheres.",
        details: "At this stage, approximately 250,000 neural precursor cells form per minute. Early involuntary reflex circuits wire the spinal cord.",
        statLabel: "Neural Proliferation",
        statValue: "250K cells / min",
        milestoneTag: "Neural Tube Complete",
        interactiveAction: "ai_brain",
      };
    } else if (week <= 27) {
      return {
        title: "Cerebral Cortex Folding & Synaptic Wiring",
        system: "Central Nervous System",
        stage: "Synaptogenesis & Sensory Pathways (2nd Trimester)",
        fact: `At Week ${week}, cortical sulci (grooves) are forming to expand cerebral surface area and synaptic density.`,
        details: "The thalamus coordinates sensory inputs with the brainstem. EEG recordings at this stage show distinct sleep-wake circadian rhythm cycles.",
        statLabel: "Brain Rhythms",
        statValue: "Circadian Active",
        milestoneTag: "Cortical Folding",
        interactiveAction: "ai_brain",
      };
    } else {
      return {
        title: "Advanced Cognitive & REM Dream Pathways",
        system: "Central Nervous System",
        stage: "Myelination & Term Brain Architecture (3rd Trimester)",
        fact: `At Week ${week}, billions of synapses are insulated by protective myelin sheaths, multiplying signal transmission speeds tenfold.`,
        details: "Rapid Eye Movement (REM) sleep patterns confirm active dream states. Baby remembers maternal voice cadences and coordinates swallowing-breathing reflexes.",
        statLabel: "Brain Weight Ratio",
        statValue: "15% of Body Mass",
        milestoneTag: "REM Dreaming Active",
        interactiveAction: "ai_brain",
      };
    }
  } else if (hotspot === "heart") {
    if (week <= 10) {
      return {
        title: "Cardiogenesis & Rapid Embryonic Pulse",
        system: "Cardiovascular System",
        stage: "Cardiac Looping (1st Trimester)",
        fact: `The primitive cardiac tube has looped into 4 rudimentary chambers, pumping rapidly at ~${bpm} BPM.`,
        details: "Heart muscle accelerates to its gestational peak (~174 BPM) around week 9–10, circulating oxygenated blood to developing embryonic tissues.",
        statLabel: "Current Rhythm",
        statValue: `${bpm} BPM`,
        milestoneTag: "Early Cardiac Looping",
        interactiveAction: "play_heartbeat",
      };
    } else if (week <= 27) {
      return {
        title: "4-Chambered Cardiovascular Circulation",
        system: "Cardiovascular System",
        stage: "Mid-Pregnancy Hemodynamics (2nd Trimester)",
        fact: `The 4-chambered heart and valves pump ~28 liters of oxygenated blood daily through the umbilical vein and ductus venosus.`,
        details: `Heart rate has stabilized around ${bpm} BPM. Both atria, ventricles, and outflow tracts are clearly visualized during clinical Level-II anomaly ultrasound.`,
        statLabel: "Daily Flow",
        statValue: "~28 Liters / day",
        milestoneTag: "Level-II Anomaly Visible",
        interactiveAction: "play_heartbeat",
      };
    } else {
      return {
        title: "Hemodynamic Shunts & Term Cardiac Strength",
        system: "Cardiovascular System",
        stage: "Pre-Birth Vascular Readiness (3rd Trimester)",
        fact: `At Week ${week}, sturdy cardiac rhythm (${bpm} BPM) prepares the baby for instantaneous postpartum lung ventilation transition.`,
        details: "The foramen ovale and ductus arteriosus efficiently bypass fluid-filled fetal lungs, delivering maximum oxygenated blood directly to the growing brain.",
        statLabel: "Resting Heart Rate",
        statValue: `${bpm} BPM (Mature)`,
        milestoneTag: "Full Hemodynamic Output",
        interactiveAction: "play_heartbeat",
      };
    }
  } else if (hotspot === "limbs") {
    if (week <= 12) {
      return {
        title: "Limb Morphogenesis & Digital Separation",
        system: "Musculoskeletal System",
        stage: "Paddle to Ray Differentiation (1st Trimester)",
        fact: "Paddle-like limb buds have undergone apoptosis (digital webbing separation) into 10 distinct fingers and 10 toes.",
        details: "Shoulder, elbow, hip, and knee joint cavities appear. Involuntary neuromuscular twitches begin as motor axons innervate muscle beds.",
        statLabel: "Digits Formed",
        statValue: "10 Fingers & 10 Toes",
        milestoneTag: "Web-Free Digits",
        interactiveAction: "kick_counter",
      };
    } else if (week <= 27) {
      return {
        title: "Quickening Kicks & Unique Fingerprints",
        system: "Musculoskeletal System",
        stage: "Active Kicks & Dermatoglyphs (2nd Trimester)",
        fact: `Permanent friction ridge patterns (unique fingerprints) are permanently formed on tiny fingers at Week ${week}.`,
        details: "Long bones undergo active ossification (calcium hardening). Baby flexes wrists, stretches legs, and practices sucking the thumb. Mom clearly feels quickening kicks!",
        statLabel: "Movement Sensation",
        statValue: "Quickening Kicks",
        milestoneTag: "Fingerprints Etched",
        interactiveAction: "kick_counter",
      };
    } else {
      return {
        title: "Palmar Grasp Reflex & Spatial Turning",
        system: "Musculoskeletal System",
        stage: "Coordinated Muscle Strength (3rd Trimester)",
        fact: "Baby has a firm palmar grasp reflex capable of clutching the umbilical cord and turning cephalic (head-down).",
        details: "As womb space becomes cozy, rapid kicks transform into rolling pushes, elbow nudges, and pelvic stretches against the uterine wall.",
        statLabel: "Grasp Strength",
        statValue: "Firm Palmar Grasp",
        milestoneTag: "Cephalic Positioning",
        interactiveAction: "kick_counter",
      };
    }
  } else {
    // Senses
    if (week <= 15) {
      return {
        title: "Sensory Nerve Receptors & Facial Nerve Buds",
        system: "Sensory & Neurological",
        stage: "Early Sensory Primordia (1st Trimester)",
        fact: "Microscopic tactile nerve endings sprout densely around the lips, palms, and soles of the feet.",
        details: "Eyelids remain fused shut to protect delicate embryonic lenses while the retinal layers and optic nerve organize. Facial muscles practice frowning and grimacing.",
        statLabel: "Touch Receptors",
        statValue: "Perioral Active",
        milestoneTag: "Fused Eyelids Protection",
        interactiveAction: "womb_audio",
      };
    } else if (week <= 27) {
      return {
        title: "Auditory Cochlea & Womb Acoustic Perception",
        system: "Sensory & Neurological",
        stage: "Hearing Activation & Voice Familiarity (2nd Trimester)",
        fact: `At Week ${week}, inner ear ossicles (malleus, incus, stapes) and cochlea are fully functional and hearing!`,
        details: "Baby perceives maternal heart pulses, aortic blood flow whooshing, and external family voices! Amniotic swallowing exposes taste buds to culinary hints from mom's meals.",
        statLabel: "Auditory Threshold",
        statValue: "250–500 Hz Acoustic",
        milestoneTag: "Recognizes Mom's Voice",
        interactiveAction: "womb_audio",
      };
    } else {
      return {
        title: "Pupil Light Reflexes & Amniotic Taste Acuity",
        system: "Sensory & Neurological",
        stage: "Full Sensory Integration (3rd Trimester)",
        fact: `Baby blinks open eyes at Week ${week}, constricting pupils in response to bright light shining on mom's belly.`,
        details: "Thousands of taste buds differentiate sweet and savory flavors in the amniotic fluid. Auditory memory strengthens, recognizing bedtime songs and parent voices immediately after birth.",
        statLabel: "Visual Reflex",
        statValue: "Blinking & Pupillary",
        milestoneTag: "Eyelids Open & Blinking",
        interactiveAction: "womb_audio",
      };
    }
  }
};

// Direct 1-to-1 path resolver for all 40 unique gestational weeks
export const getFetusImageSrc = (week: number): string => {
  const safeWeek = Math.max(1, Math.min(40, Math.round(week || 1)));
  return `/assets/cinematic/fetus_week_${safeWeek}.jpg`;
};

export interface HotspotCoordinates {
  brain: { top: string; left: string };
  senses: { top: string; left: string };
  heart: { top: string; left: string };
  limbs: { top: string; left: string };
}

// Dynamically calibrated pin positions for all 40 unique gestational weeks
// Pins accurately land on Brain/Cranium, Eyes/Senses, Heart/Thorax, and Limbs/Feet
export const getHotspotCoordinates = (week: number): HotspotCoordinates => {
  const safeWeek = Math.max(1, Math.min(40, Math.round(week || 1)));
  
  // Format: { b: [top%, left%], s: [top%, left%], h: [top%, left%], l: [top%, left%] }
  const coordinateMap: Record<number, { b: [number, number]; s: [number, number]; h: [number, number]; l: [number, number] }> = {
    // Week 1: Cleavage / Blastocyst cellular division
    1: { b: [40, 50], s: [48, 58], h: [48, 48], l: [52, 38] },
    // Week 2: Implantation / Blastocyst cavity
    2: { b: [32, 50], s: [42, 58], h: [50, 50], l: [62, 45] },
    // Week 3: Neural plate formation & early embryonic disc
    3: { b: [28, 50], s: [38, 56], h: [50, 48], l: [68, 48] },
    // Week 4: Early embryo C-shape facing left
    4: { b: [26, 44], s: [36, 38], h: [48, 46], l: [68, 42] },
    // Week 5: Optic vesicle / eye spot forming
    5: { b: [24, 54], s: [34, 46], h: [48, 52], l: [70, 54] },
    // Week 6: Translucent embryo with brain vesicles
    6: { b: [22, 62], s: [32, 58], h: [46, 56], l: [68, 52] },
    // Week 7: Rapid neurogenesis & limb buds
    7: { b: [24, 52], s: [34, 44], h: [50, 52], l: [72, 52] },
    // Week 8: Web-free digits & facial features
    8: { b: [22, 54], s: [32, 45], h: [48, 52], l: [68, 50] },
    // Week 9: Fetus facing left in amniotic sac
    9: { b: [24, 56], s: [35, 45], h: [48, 52], l: [72, 48] },
    // Week 10: Fetus facing right
    10: { b: [24, 54], s: [34, 62], h: [48, 54], l: [72, 48] },
    // Week 11: Active reflex twitches, facing left
    11: { b: [26, 48], s: [32, 38], h: [48, 46], l: [68, 60] },
    // Week 12: End of 1st trimester, upright profile
    12: { b: [24, 52], s: [34, 46], h: [50, 50], l: [72, 52] },
    // Week 13: Vocal cords forming, facing left
    13: { b: [24, 56], s: [34, 46], h: [48, 52], l: [70, 44] },
    // Week 14: Second trimester start, facing right (Calibrated to user screenshot)
    14: { b: [24, 62], s: [35, 55], h: [50, 54], l: [72, 28] },
    // Week 15: Thin translucent skin, facing left
    15: { b: [25, 54], s: [35, 46], h: [50, 52], l: [70, 44] },
    // Week 16: Pumping ~28L blood daily, facing left
    16: { b: [25, 54], s: [35, 46], h: [48, 54], l: [70, 52] },
    // Week 17: Adipose fat deposits, facing left
    17: { b: [25, 54], s: [36, 44], h: [50, 54], l: [72, 46] },
    // Week 18: Level-II ultrasound scan visible, facing left
    18: { b: [26, 54], s: [36, 46], h: [50, 54], l: [70, 48] },
    // Week 19: Vernix caseosa coating, facing right profile
    19: { b: [25, 45], s: [36, 54], h: [56, 52], l: [62, 60] },
    // Week 20: Halfway milestone, facing right
    20: { b: [24, 48], s: [34, 56], h: [50, 50], l: [72, 56] },
    // Week 21: Cephalic orientation (Head-down lower right, feet upper left)
    21: { b: [66, 62], s: [58, 66], h: [48, 56], l: [28, 38] },
    // Week 22: Developing sense of touch, facing left
    22: { b: [26, 54], s: [36, 46], h: [52, 52], l: [72, 48] },
    // Week 23: Rapid eye movement & hearing, facing left
    23: { b: [26, 48], s: [36, 42], h: [50, 50], l: [70, 56] },
    // Week 24: Viability threshold, facing left
    24: { b: [26, 54], s: [36, 46], h: [50, 52], l: [72, 48] },
    // Week 25: Capillaries forming, facing left
    25: { b: [26, 46], s: [36, 38], h: [52, 46], l: [72, 52] },
    // Week 26: Eyes beginning to open, facing right
    26: { b: [25, 50], s: [35, 58], h: [52, 52], l: [72, 52] },
    // Week 27: End of 2nd trimester, regular sleep cycles
    27: { b: [25, 54], s: [35, 46], h: [52, 52], l: [70, 48] },
    // Week 28: 3rd trimester start, REM dreaming, facing right
    28: { b: [25, 48], s: [35, 54], h: [52, 50], l: [70, 52] },
    // Week 29: Massive brain surface folding, profile
    29: { b: [26, 50], s: [38, 56], h: [58, 52], l: [75, 56] },
    // Week 30: Cephalic head-down (Head lower left, feet upper right)
    30: { b: [74, 40], s: [66, 45], h: [50, 50], l: [22, 56] },
    // Week 31: Rapid bone ossification, facing left
    31: { b: [26, 48], s: [36, 42], h: [52, 50], l: [72, 54] },
    // Week 32: Practice breathing motions, facing left
    32: { b: [26, 50], s: [36, 42], h: [52, 50], l: [72, 56] },
    // Week 33: Immune antibodies transfer, close-up
    33: { b: [25, 46], s: [36, 38], h: [56, 46], l: [78, 50] },
    // Week 34: Central nervous system mature, facial close-up
    34: { b: [24, 50], s: [42, 50], h: [66, 50], l: [66, 64] },
    // Week 35: Kidneys fully processed, facing left
    35: { b: [26, 48], s: [36, 42], h: [54, 50], l: [74, 52] },
    // Week 36: Shedding vernix caseosa, facing left
    36: { b: [26, 52], s: [36, 46], h: [52, 50], l: [70, 44] },
    // Week 37: Early term milestone reached, facing left
    37: { b: [26, 52], s: [36, 46], h: [52, 50], l: [74, 48] },
    // Week 38: Firm palmar grasp reflex, facing right
    38: { b: [26, 48], s: [36, 54], h: [52, 50], l: [74, 52] },
    // Week 39: Full term cephalic engagement (Head deep in pelvis/bottom, feet at top)
    39: { b: [76, 50], s: [68, 52], h: [50, 50], l: [24, 52] },
    // Week 40: Birth ready baby curled peacefully
    40: { b: [26, 52], s: [36, 46], h: [52, 50], l: [70, 50] },
  };

  const c = coordinateMap[safeWeek] || { b: [25, 50], s: [35, 46], h: [50, 50], l: [70, 50] };

  return {
    brain: { top: `${c.b[0]}%`, left: `${c.b[1]}%` },
    senses: { top: `${c.s[0]}%`, left: `${c.s[1]}%` },
    heart: { top: `${c.h[0]}%`, left: `${c.h[1]}%` },
    limbs: { top: `${c.l[0]}%`, left: `${c.l[1]}%` },
  };
};

export const BabyDevelopmentPage: React.FC = () => {
  const { user, setActivePage, t, showToast } = useApp();
  const currentWeek = user.currentWeek || 24;
  const [selectedWeek, setSelectedWeek] = useState<number>(currentWeek);
  
  // Audio state
  const [isPlayingHeartbeat, setIsPlayingHeartbeat] = useState(false);
  const [isWombHearingMode, setIsWombHearingMode] = useState(false);
  const [isDopplerPlaying, setIsDopplerPlaying] = useState(false);
  const [heartbeatSoundType, setHeartbeatSoundType] = useState<"doppler" | "stethoscope">("doppler");
  const [heartbeatVolume, setHeartbeatVolume] = useState<number>(0.75);
  const [wombSoundscapeMode, setWombSoundscapeMode] = useState<"placental_flow" | "amniotic_drift" | "maternal_hum">("placental_flow");
  const [wombAudioVolume, setWombAudioVolume] = useState<number>(0.65);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [ecgPulseActive, setEcgPulseActive] = useState(false);

  const soundTypeRef = useRef<"doppler" | "stethoscope">("doppler");
  soundTypeRef.current = heartbeatSoundType;
  const volumeRef = useRef<number>(0.75);
  volumeRef.current = heartbeatVolume;
  const wombModeRef = useRef<"placental_flow" | "amniotic_drift" | "maternal_hum">("placental_flow");
  wombModeRef.current = wombSoundscapeMode;
  const wombVolumeRef = useRef<number>(0.65);
  wombVolumeRef.current = wombAudioVolume;
  const wombSoundNodesRef = useRef<{
    noiseSource?: AudioBufferSourceNode | null;
    fluidGain?: GainNode | null;
    pulseInterval?: any;
    lfoOsc?: OscillatorNode | null;
    humOsc1?: OscillatorNode | null;
    humOsc2?: OscillatorNode | null;
    humGain?: GainNode | null;
  } | null>(null);
  
  // Pure 360° Circular (Clockwise / Counter-Clockwise) Rotation State (No front/back flipping!)
  const [rotationAngle, setRotationAngle] = useState(0); // 0 to 360 degrees
  const [rotationDirection, setRotationDirection] = useState<"cw" | "ccw">("cw");
  const [rotationSpeedMode, setRotationSpeedMode] = useState<"gentle" | "slow" | "normal">("gentle"); // Default to gentle / porumaya
  const [isDragging, setIsDragging] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isBabyStirring, setIsBabyStirring] = useState(false);
  const [ripple, setRipple] = useState<{ x: number; y: number; id: number } | null>(null);
  const [touchMessage, setTouchMessage] = useState<string | null>(null);

  const dragStartRef = useRef<{ x: number; y: number; startAngle: number; orbCenterX: number; orbCenterY: number }>({
    x: 0,
    y: 0,
    startAngle: 0,
    orbCenterX: 0,
    orbCenterY: 0,
  });

  // Pictorial representation tab state
  const [pictorialMode, setPictorialMode] = useState<"cinematic_video" | "fetal_art" | "yoga_guide">("cinematic_video");
  const [activeHotspot, setActiveHotspot] = useState<"brain" | "heart" | "limbs" | "senses" | null>("heart");

  // Maternal Posture & Biomechanics Studio State
  const [postureTab, setPostureTab] = useState<"standing" | "sitting" | "sleeping" | "lifting">("standing");
  const [postureChecklist, setPostureChecklist] = useState<{ [key: string]: boolean }>({
    chin: false,
    shoulders: false,
    pelvis: false,
    knees: false,
  });

  // Perspective angle state in Cinematic View
  const [perspectiveAngle, setPerspectiveAngle] = useState<"overview" | "profile" | "senses">("overview");

  // Side-by-side comparison state
  const [compareWeek, setCompareWeek] = useState<number>(Math.min(selectedWeek + 4, 40));
  const [showComparison, setShowComparison] = useState(false);

  // Real gestational progress
  const progress = calculatePregnancyProgress(user);
  const detail = PREGNANCY_WEEKS_DATA[selectedWeek - 1] || PREGNANCY_WEEKS_DATA[23];
  const compareDetail = PREGNANCY_WEEKS_DATA[compareWeek - 1] || PREGNANCY_WEEKS_DATA[27];
  const postureData = getMaternalPostureData(selectedWeek);

  const currentBpm = getFetalHeartRateBpm(selectedWeek);
  const heartbeatIntervalRef = useRef<any>(null);
  const wombSoundNodeRef = useRef<any>(null);
  const dopplerIntervalRef = useRef<any>(null);
  const animFrameRef = useRef<number | null>(null);
  const orbRef = useRef<HTMLDivElement | null>(null);

  // Calm & peaceful fetal rotation speed (degrees per second)
  const getSpeedDegreesPerSec = () => {
    switch (rotationSpeedMode) {
      case "gentle": return 3.2; // ~112s per revolution: ultra-peaceful, graceful amniotic float
      case "slow": return 5.5;   // ~65s per revolution: gentle drift
      case "normal": return 9.0; // ~40s per revolution: steady observation
      default: return 3.2;
    }
  };

  // Smooth continuous 360° circular floating rotation (Clockwise / Counter-Clockwise)
  useEffect(() => {
    let lastTime = performance.now();

    const animateRotation = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      if (isAutoRotating && !isDragging && pictorialMode === "cinematic_video") {
        const baseSpeed = getSpeedDegreesPerSec();
        const speed = rotationDirection === "cw" ? baseSpeed : -baseSpeed;
        setRotationAngle((prev) => (prev + speed * delta + 360) % 360);
      }

      animFrameRef.current = requestAnimationFrame(animateRotation);
    };

    animFrameRef.current = requestAnimationFrame(animateRotation);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isAutoRotating, isDragging, rotationDirection, rotationSpeedMode, pictorialMode]);

  // Clean up all Web Audio contexts and timers on unmount
  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, [audioCtx]);

  const stopAllAudio = () => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    if (dopplerIntervalRef.current) {
      clearInterval(dopplerIntervalRef.current);
      dopplerIntervalRef.current = null;
    }
    stopWombAudioNodes();
    if (audioCtx) {
      try { audioCtx.close(); } catch {}
      setAudioCtx(null);
    }
    setIsPlayingHeartbeat(false);
    setIsWombHearingMode(false);
    setIsDopplerPlaying(false);
    setEcgPulseActive(false);
  };

  // Obtain or create active AudioContext
  const getOrCreateAudioContext = () => {
    if (audioCtx && audioCtx.state !== "closed") {
      if (audioCtx.state === "suspended") {
        audioCtx.resume().catch(() => {});
      }
      return audioCtx;
    }
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    setAudioCtx(ctx);
    return ctx;
  };

  // Authentic Double-Beat (Lub-Dub) & Ultrasound Doppler Fetal Cardiac Synthesizer
  const playCardiacCycle = (
    ctx: AudioContext,
    soundType: "stethoscope" | "doppler",
    volume: number
  ) => {
    if (ctx.state === "closed") return;
    const now = ctx.currentTime;

    if (soundType === "stethoscope") {
      // 1. S1 ("Lub" - Mitral & Tricuspid Valvular Inflow Closure)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter1 = ctx.createBiquadFilter();
      const gain1 = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(84, now);
      osc1.frequency.exponentialRampToValueAtTime(38, now + 0.1);

      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(54, now);
      osc2.frequency.exponentialRampToValueAtTime(24, now + 0.1);

      filter1.type = "lowpass";
      filter1.frequency.setValueAtTime(180, now);
      filter1.Q.value = 1.6;

      const s1Vol = Math.max(0.01, volume * 0.55);
      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.linearRampToValueAtTime(s1Vol, now + 0.012);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc1.connect(filter1);
      osc2.connect(filter1);
      filter1.connect(gain1);
      gain1.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.11);
      osc2.stop(now + 0.11);

      // 2. S2 ("Dub" - Aortic & Pulmonary Valvular Closure) ~115ms later
      const s2Delay = 0.115;
      const osc3 = ctx.createOscillator();
      const osc4 = ctx.createOscillator();
      const filter2 = ctx.createBiquadFilter();
      const gain2 = ctx.createGain();

      osc3.type = "sine";
      osc3.frequency.setValueAtTime(116, now + s2Delay);
      osc3.frequency.exponentialRampToValueAtTime(50, now + s2Delay + 0.075);

      osc4.type = "triangle";
      osc4.frequency.setValueAtTime(72, now + s2Delay);
      osc4.frequency.exponentialRampToValueAtTime(32, now + s2Delay + 0.075);

      filter2.type = "lowpass";
      filter2.frequency.setValueAtTime(220, now + s2Delay);
      filter2.Q.value = 1.3;

      const s2Vol = Math.max(0.01, volume * 0.40);
      gain2.gain.setValueAtTime(0.001, now + s2Delay);
      gain2.gain.linearRampToValueAtTime(s2Vol, now + s2Delay + 0.01);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + s2Delay + 0.075);

      osc3.connect(filter2);
      osc4.connect(filter2);
      filter2.connect(gain2);
      gain2.connect(ctx.destination);

      osc3.start(now + s2Delay);
      osc4.start(now + s2Delay);
      osc3.stop(now + s2Delay + 0.08);
      osc4.stop(now + s2Delay + 0.08);

    } else {
      // "doppler" - Clinical Ultrasound Transducer Doppler (Authentic Galloping Horse Hemodynamics)
      // Pulse 1: Systolic Ejection Jet
      const osc1 = ctx.createOscillator();
      const filter1 = ctx.createBiquadFilter();
      const gain1 = ctx.createGain();

      osc1.type = "sawtooth";
      osc1.frequency.setValueAtTime(360, now);
      osc1.frequency.exponentialRampToValueAtTime(155, now + 0.125);

      filter1.type = "bandpass";
      filter1.frequency.setValueAtTime(390, now);
      filter1.Q.value = 3.6;

      const d1Vol = Math.max(0.01, volume * 0.45);
      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.linearRampToValueAtTime(d1Vol, now + 0.016);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.125);

      osc1.connect(filter1);
      filter1.connect(gain1);
      gain1.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.13);

      // Pulse 2: Diastolic Recoil Jet at now + 0.115s
      const s2Delay = 0.115;
      const osc2 = ctx.createOscillator();
      const filter2 = ctx.createBiquadFilter();
      const gain2 = ctx.createGain();

      osc2.type = "sawtooth";
      osc2.frequency.setValueAtTime(285, now + s2Delay);
      osc2.frequency.exponentialRampToValueAtTime(130, now + s2Delay + 0.085);

      filter2.type = "bandpass";
      filter2.frequency.setValueAtTime(330, now + s2Delay);
      filter2.Q.value = 3.2;

      const d2Vol = Math.max(0.01, volume * 0.32);
      gain2.gain.setValueAtTime(0.001, now + s2Delay);
      gain2.gain.linearRampToValueAtTime(d2Vol, now + s2Delay + 0.012);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + s2Delay + 0.085);

      osc2.connect(filter2);
      filter2.connect(gain2);
      gain2.connect(ctx.destination);

      osc2.start(now + s2Delay);
      osc2.stop(now + s2Delay + 0.09);
    }

    setEcgPulseActive(true);
    setTimeout(() => setEcgPulseActive(false), 140);
  };

  const startHeartbeatInterval = (ctx: AudioContext, bpm: number) => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }
    const intervalMs = Math.round((60 / bpm) * 1000);
    playCardiacCycle(ctx, soundTypeRef.current, volumeRef.current);
    heartbeatIntervalRef.current = setInterval(() => {
      if (ctx.state === "closed") {
        if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
        return;
      }
      playCardiacCycle(ctx, soundTypeRef.current, volumeRef.current);
    }, intervalMs);
  };

  // Dynamic Gestational Heartbeat Simulator
  const toggleHeartbeat = () => {
    if (isPlayingHeartbeat) {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      setIsPlayingHeartbeat(false);
      setEcgPulseActive(false);
    } else {
      if (currentBpm === 0) {
        showToast("Cardiac activity detects starting from Week 6");
        return;
      }

      const ctx = getOrCreateAudioContext();
      startHeartbeatInterval(ctx, currentBpm);
      setIsPlayingHeartbeat(true);
      const label = soundTypeRef.current === "doppler" ? "Ultrasound Doppler" : "Stethoscope Lub-Dub";
      showToast(`Playing Week ${selectedWeek} Heartbeat (${currentBpm} BPM · ${label})`);
    }
  };

  const handleSoundTypeChange = (type: "doppler" | "stethoscope") => {
    setHeartbeatSoundType(type);
    soundTypeRef.current = type;
    if (isPlayingHeartbeat) {
      const ctx = getOrCreateAudioContext();
      if (currentBpm > 0) {
        startHeartbeatInterval(ctx, currentBpm);
      }
    }
    const label = type === "doppler" ? "Ultrasound Doppler (Galloping Horse)" : "Natural Stethoscope (In-Utero Lub-Dub)";
    showToast(`Switched sound: ${label}`);
  };

  // Re-adjust heartbeat rate if selectedWeek changes while playing
  useEffect(() => {
    if (isPlayingHeartbeat) {
      if (currentBpm > 0) {
        const ctx = getOrCreateAudioContext();
        startHeartbeatInterval(ctx, currentBpm);
      } else {
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = null;
        }
        setIsPlayingHeartbeat(false);
        setEcgPulseActive(false);
      }
    }
  }, [selectedWeek, currentBpm]);

  // Stop all active Womb Audio nodes and timers safely
  const stopWombAudioNodes = () => {
    if (wombSoundNodesRef.current) {
      const n = wombSoundNodesRef.current;
      if (n.pulseInterval) {
        clearInterval(n.pulseInterval);
        n.pulseInterval = null;
      }
      try {
        if (n.noiseSource) {
          n.noiseSource.stop();
          n.noiseSource.disconnect();
          n.noiseSource = null;
        }
      } catch {}
      try {
        if (n.lfoOsc) {
          n.lfoOsc.stop();
          n.lfoOsc.disconnect();
          n.lfoOsc = null;
        }
      } catch {}
      try {
        if (n.humOsc1) {
          n.humOsc1.stop();
          n.humOsc1.disconnect();
          n.humOsc1 = null;
        }
      } catch {}
      try {
        if (n.humOsc2) {
          n.humOsc2.stop();
          n.humOsc2.disconnect();
          n.humOsc2 = null;
        }
      } catch {}
      try {
        if (n.humGain) {
          n.humGain.disconnect();
          n.humGain = null;
        }
      } catch {}
      try {
        if (n.fluidGain) {
          n.fluidGain.disconnect();
          n.fluidGain = null;
        }
      } catch {}
      wombSoundNodesRef.current = null;
    }
  };

  // Authentic Multi-Layer Intrauterine Womb Acoustic Synthesizer
  const startWombSoundscape = (
    ctx: AudioContext,
    mode: "placental_flow" | "amniotic_drift" | "maternal_hum",
    volume: number
  ) => {
    stopWombAudioNodes();
    if (ctx.state === "closed") return;

    // Layer 1: Amniotic Fluid Pink/Brown Noise Bed (4 Seconds looped buffer)
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.14;
      b6 = white * 0.115926;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    // Steep 400Hz lowpass filter replicating intrauterine acoustic barrier
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    const baseFreq = mode === "amniotic_drift" ? 190 : mode === "placental_flow" ? 240 : 280;
    filter.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    filter.Q.value = mode === "amniotic_drift" ? 1.8 : 1.2;

    const fluidGain = ctx.createGain();
    const fluidVol = Math.max(0.01, volume * (mode === "amniotic_drift" ? 0.36 : 0.24));
    fluidGain.gain.setValueAtTime(fluidVol, ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(fluidGain);
    fluidGain.connect(ctx.destination);
    noiseSource.start();

    let pulseInterval: any = null;
    let lfoOsc: OscillatorNode | null = null;
    let humOsc1: OscillatorNode | null = null;
    let humOsc2: OscillatorNode | null = null;
    let humGain: GainNode | null = null;

    if (mode === "placental_flow") {
      // Layer 2: Maternal Aortic & Placental Flow Pulse (~72 BPM Maternal Resting Rhythm)
      const maternalIntervalMs = 833; // 72 BPM
      const playMaternalPlacentalWhoosh = () => {
        if (ctx.state === "closed") return;
        const now = ctx.currentTime;
        const pulseOsc = ctx.createOscillator();
        const pulseFilter = ctx.createBiquadFilter();
        const pulseGain = ctx.createGain();

        pulseOsc.type = "sine";
        pulseOsc.frequency.setValueAtTime(74, now);
        pulseOsc.frequency.exponentialRampToValueAtTime(36, now + 0.38);

        pulseFilter.type = "lowpass";
        pulseFilter.frequency.setValueAtTime(190, now);
        pulseFilter.Q.value = 1.4;

        const whooshVol = Math.max(0.01, volume * 0.35);
        pulseGain.gain.setValueAtTime(0.001, now);
        pulseGain.gain.linearRampToValueAtTime(whooshVol, now + 0.12);
        pulseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

        pulseOsc.connect(pulseFilter);
        pulseFilter.connect(pulseGain);
        pulseGain.connect(ctx.destination);

        pulseOsc.start(now);
        pulseOsc.stop(now + 0.45);
      };

      playMaternalPlacentalWhoosh();
      pulseInterval = setInterval(playMaternalPlacentalWhoosh, maternalIntervalMs);

    } else if (mode === "amniotic_drift") {
      // Gentle tidal fluid LFO filter oscillation (0.18 Hz)
      lfoOsc = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfoOsc.type = "sine";
      lfoOsc.frequency.setValueAtTime(0.18, ctx.currentTime);
      lfoGain.gain.setValueAtTime(65, ctx.currentTime);
      lfoOsc.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfoOsc.start();

    } else if (mode === "maternal_hum") {
      // Layer 3: Maternal Bone-Conducted Voice / Lullaby Drone (~130Hz C3 fundamental)
      humOsc1 = ctx.createOscillator();
      humOsc2 = ctx.createOscillator();
      const humFilter = ctx.createBiquadFilter();
      humGain = ctx.createGain();

      humOsc1.type = "sine";
      humOsc1.frequency.setValueAtTime(130.8, ctx.currentTime); // C3 fundamental
      humOsc2.type = "triangle";
      humOsc2.frequency.setValueAtTime(261.6, ctx.currentTime); // C4 harmonic

      humFilter.type = "lowpass";
      humFilter.frequency.setValueAtTime(260, ctx.currentTime);
      humFilter.Q.value = 2.0;

      const humVol = Math.max(0.01, volume * 0.20);
      humGain.gain.setValueAtTime(0.001, ctx.currentTime);
      humGain.gain.linearRampToValueAtTime(humVol, ctx.currentTime + 0.5);

      humOsc1.connect(humFilter);
      humOsc2.connect(humFilter);
      humFilter.connect(humGain);
      humGain.connect(ctx.destination);

      humOsc1.start();
      humOsc2.start();
    }

    wombSoundNodesRef.current = {
      noiseSource,
      fluidGain,
      pulseInterval,
      lfoOsc,
      humOsc1,
      humOsc2,
      humGain,
    };
  };

  // "What Baby Hears in the Womb" Intrauterine Acoustic Simulator Toggle
  const toggleWombHearingMode = () => {
    if (isWombHearingMode) {
      stopWombAudioNodes();
      setIsWombHearingMode(false);
    } else {
      if (selectedWeek < 16) {
        showToast("Fetal hearing organs (cochlea) mature between Weeks 18-24");
      }
      const ctx = getOrCreateAudioContext();
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      startWombSoundscape(ctx, wombModeRef.current, wombVolumeRef.current);
      setIsWombHearingMode(true);
      const modeLabel = wombModeRef.current === "placental_flow"
        ? "Mother's Placental Pulse (72 BPM)"
        : wombModeRef.current === "amniotic_drift"
        ? "Deep Amniotic Fluid Drift"
        : "Maternal Humming & Voice";
      showToast(`Activated Womb Audio: ${modeLabel}`);
    }
  };

  const handleWombModeChange = (mode: "placental_flow" | "amniotic_drift" | "maternal_hum") => {
    setWombSoundscapeMode(mode);
    wombModeRef.current = mode;
    if (isWombHearingMode) {
      const ctx = getOrCreateAudioContext();
      startWombSoundscape(ctx, mode, wombVolumeRef.current);
    }
    const label = mode === "placental_flow"
      ? "Mother's Placental Pulse (72 BPM)"
      : mode === "amniotic_drift"
      ? "Deep Amniotic Fluid Drift"
      : "Maternal Humming & Voice";
    showToast(`Switched soundscape: ${label}`);
  };

  const handleWombVolumeChange = (vol: number) => {
    setWombAudioVolume(vol);
    wombVolumeRef.current = vol;
    const ctx = audioCtx;
    if (ctx && wombSoundNodesRef.current) {
      try {
        if (wombSoundNodesRef.current.fluidGain) {
          const factor = wombModeRef.current === "amniotic_drift" ? 0.36 : 0.24;
          wombSoundNodesRef.current.fluidGain.gain.setValueAtTime(vol * factor, ctx.currentTime);
        }
        if (wombSoundNodesRef.current.humGain) {
          wombSoundNodesRef.current.humGain.gain.setValueAtTime(Math.max(0.001, vol * 0.20), ctx.currentTime);
        }
      } catch {}
    }
  };

  // Clinical Doppler Ultrasound Audio Simulator
  const toggleDopplerAudio = () => {
    if (isDopplerPlaying) {
      if (dopplerIntervalRef.current) {
        clearInterval(dopplerIntervalRef.current);
        dopplerIntervalRef.current = null;
      }
      setIsDopplerPlaying(false);
    } else {
      const ctx = getOrCreateAudioContext();
      const intervalMs = Math.round((60 / (currentBpm || 140)) * 1000);

      const playDopplerPulse = () => {
        if (ctx.state === "closed") return;
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(380, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.18);

        filter.type = "bandpass";
        filter.frequency.setValueAtTime(450, ctx.currentTime);
        filter.Q.value = 4.0;

        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.18);
      };

      playDopplerPulse();
      dopplerIntervalRef.current = setInterval(playDopplerPulse, intervalMs);
      setIsDopplerPlaying(true);
      showToast("Playing Clinical Doppler Ultrasound Flow");
    }
  };

  // ----------------------------------------------------
  // INTERACTIVE 360° CLOCKWISE / ANTI-CLOCKWISE ROTATION GESTURES
  // ----------------------------------------------------
  const handlePointerDown = (clientX: number, clientY: number) => {
    setIsDragging(true);
    let centerX = clientX;
    let centerY = clientY;
    if (orbRef.current) {
      const rect = orbRef.current.getBoundingClientRect();
      centerX = rect.left + rect.width / 2;
      centerY = rect.top + rect.height / 2;
    }
    dragStartRef.current = {
      x: clientX,
      y: clientY,
      startAngle: rotationAngle,
      orbCenterX: centerX,
      orbCenterY: centerY,
    };
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    const { orbCenterX, orbCenterY, x, y, startAngle } = dragStartRef.current;

    // Calculate polar angle around the orb center
    const currentAngleRad = Math.atan2(clientY - orbCenterY, clientX - orbCenterX);
    const startAngleRad = Math.atan2(y - orbCenterY, x - orbCenterX);
    const deltaAngleDeg = (currentAngleRad - startAngleRad) * (180 / Math.PI);

    // Also support natural horizontal drag
    const horizontalDelta = (clientX - x) * 0.75;
    const combinedDelta = Math.abs(deltaAngleDeg) > 4 ? deltaAngleDeg : horizontalDelta;

    setRotationAngle((startAngle + combinedDelta + 360) % 360);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Touch Mom's Belly (Ripple & Baby Stir Reaction)
  const handleWombClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) return;
    if (!orbRef.current) return;

    const rect = orbRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setRipple({ x, y, id: Date.now() });

    // Baby gentle stir reaction
    setIsBabyStirring(true);
    setTouchMessage("Baby felt mom's gentle touch!");

    confetti({
      particleCount: 25,
      spread: 40,
      origin: {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      },
    });

    setTimeout(() => {
      setIsBabyStirring(false);
    }, 1200);

    setTimeout(() => {
      setTouchMessage(null);
    }, 3200);
  };

  // Trajectory data for growth charts
  const trajectoryData = PREGNANCY_WEEKS_DATA.map((w) => {
    const rawWeight = parseFloat(w.babySize.weight.replace(/[^0-9.]/g, ""));
    const weightGrams = w.babySize.weight.includes("kg") ? rawWeight * 1000 : rawWeight;
    const lengthCm = parseFloat(w.babySize.length.replace(/[^0-9.]/g, ""));

    return {
      week: `W${w.week}`,
      weekNum: w.week,
      weightGrams: isNaN(weightGrams) ? 0 : weightGrams,
      lengthCm: isNaN(lengthCm) ? 0 : lengthCm,
    };
  });

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto animate-in fade-in duration-300 select-none">
      
      {/* 1. HEADER BANNER: SMART NAVIGATION + AUDIO SUITE */}
      <div className="bg-white dark:bg-[#1A1523] p-5 sm:p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActivePage("timeline")}
              className="px-2.5 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-200 text-xs font-bold transition-all flex items-center gap-1 border border-rose-200 dark:border-rose-800"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Timeline</span>
            </button>

            <span className="text-rose-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <Baby className="w-3.5 h-3.5" />
              <span>{t("fetalGrowthStudio")}</span>
            </span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 dark:text-rose-100 mt-1.5">
            Fetal Growth Studio 3D & Audio
          </h1>
          <p className="text-xs text-gray-500 dark:text-rose-300 mt-1">
            Experience 360° amniotic fetal movement, maternal touch response, and authentic heartbeats.
          </p>
        </div>

        {/* Audio & Comparison Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Side-by-Side Comparison Toggle */}
          <button
            onClick={() => setShowComparison(!showComparison)}
            className={`px-3.5 py-2 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all ${
              showComparison
                ? "bg-purple-600 text-white shadow-md"
                : "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900/40 hover:bg-purple-100"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{showComparison ? "Hide Compare" : "Side-by-Side"}</span>
          </button>

          {/* Womb Acoustic Hearing Simulator Button & Quick Modes */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleWombHearingMode}
              className={`px-3.5 py-2 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs ${
                isWombHearingMode
                  ? "bg-indigo-600 text-white shadow-md animate-pulse"
                  : "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/40 hover:bg-indigo-100"
              }`}
              title="Listen to what baby hears inside the amniotic sac"
            >
              <Headphones className="w-4 h-4" />
              <span>{isWombHearingMode ? "Womb Sounds (On)" : "Womb Audio"}</span>
            </button>

            {isWombHearingMode && (
              <div className="hidden sm:flex items-center bg-indigo-50 dark:bg-indigo-950/60 p-0.5 rounded-xl border border-indigo-200 dark:border-indigo-900/40 text-[10px] font-extrabold animate-fadeIn">
                <button
                  type="button"
                  onClick={() => handleWombModeChange("placental_flow")}
                  className={`px-2 py-1 rounded-lg transition-all ${
                    wombSoundscapeMode === "placental_flow"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-gray-600 dark:text-indigo-300 hover:text-indigo-600"
                  }`}
                  title="Mother's Placental Pulse (72 BPM)"
                >
                  Pulse
                </button>
                <button
                  type="button"
                  onClick={() => handleWombModeChange("amniotic_drift")}
                  className={`px-2 py-1 rounded-lg transition-all ${
                    wombSoundscapeMode === "amniotic_drift"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-gray-600 dark:text-indigo-300 hover:text-indigo-600"
                  }`}
                  title="Amniotic Fluid Drift"
                >
                  Drift
                </button>
                <button
                  type="button"
                  onClick={() => handleWombModeChange("maternal_hum")}
                  className={`px-2 py-1 rounded-lg transition-all ${
                    wombSoundscapeMode === "maternal_hum"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-gray-600 dark:text-indigo-300 hover:text-indigo-600"
                  }`}
                  title="Maternal Voice Hum"
                >
                  Voice
                </button>
              </div>
            )}
          </div>

          {/* Real Gestational Dynamic Heartbeat Button */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleHeartbeat}
              className={`px-4 py-2 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all ${
                isPlayingHeartbeat
                  ? "bg-rose-600 text-white animate-pulse"
                  : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-200 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-100"
              }`}
            >
              {isPlayingHeartbeat ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isPlayingHeartbeat ? `Heartbeat (${currentBpm} BPM)` : "Play Heartbeat"}</span>
            </button>

            {/* Quick sound type toggle when playing */}
            {isPlayingHeartbeat && (
              <button
                onClick={() => handleSoundTypeChange(heartbeatSoundType === "doppler" ? "stethoscope" : "doppler")}
                className="px-2.5 py-2 rounded-2xl bg-white dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-[10px] font-bold text-rose-600 dark:text-rose-300 shadow-xs hover:bg-rose-50 transition-all flex items-center gap-1"
                title="Click to switch between Ultrasound Doppler and Stethoscope sound"
              >
                <span>{heartbeatSoundType === "doppler" ? "Doppler" : "Stethoscope"}</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* 2. WEEK SELECTOR BAR WITH QUICK RESET TO MOTHER'S CURRENT WEEK */}
      <div className="bg-white dark:bg-[#1A1523] p-5 sm:p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-2">
            <Compass className="w-4 h-4" />
            <span>Select Gestational Week</span>
          </div>

          <div className="flex items-center gap-2">
            {selectedWeek !== currentWeek && (
              <button
                onClick={() => setSelectedWeek(currentWeek)}
                className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border border-amber-300 hover:bg-amber-200 transition-all flex items-center gap-1"
              >
                <span>Jump to My Week {currentWeek}</span>
              </button>
            )}

            <span className="text-xs font-bold text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-3 py-1 rounded-full border border-rose-200 dark:border-rose-900/40">
              Week {selectedWeek} ({detail.trimester === 1 ? "1st Trimester" : detail.trimester === 2 ? "2nd Trimester" : "3rd Trimester"})
            </span>
          </div>
        </div>

        {/* 40-Week Horizontal Pill Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-rose-300">
          {Array.from({ length: 40 }, (_, i) => i + 1).map((w) => {
            const isSelected = selectedWeek === w;
            const isMomCurrent = w === currentWeek;
            return (
              <button
                key={w}
                onClick={() => setSelectedWeek(w)}
                className={`min-w-[40px] h-11 rounded-2xl text-xs font-bold transition-all flex flex-col items-center justify-center relative ${
                  isSelected
                    ? "bg-rose-500 text-white shadow-md scale-105 ring-2 ring-rose-300/60"
                    : isMomCurrent
                    ? "bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 border-2 border-rose-400"
                    : "bg-rose-50/60 dark:bg-rose-950/30 text-gray-700 dark:text-rose-200 hover:bg-rose-100 dark:hover:bg-rose-900/40"
                }`}
              >
                <span>W{w}</span>
                {isMomCurrent && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 -mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. PICTORIAL REPRESENTATION STUDIO & CINEMATIC DISPLAY */}
      <div className="bg-white dark:bg-[#1A1523] p-5 sm:p-7 rounded-2xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-6">
        
        {/* Studio Mode Switcher Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-100 dark:border-rose-900/40 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4" />
              <span>Pictorial Representation Studio</span>
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900 dark:text-rose-100 mt-1">
              Visuals for Week {selectedWeek} · {detail.babySize.name}
            </h2>
          </div>

          <div className="flex flex-wrap gap-1 bg-rose-50/80 dark:bg-rose-950/40 p-1.5 rounded-2xl border border-rose-100 dark:border-rose-900/40">
            <button
              onClick={() => setPictorialMode("cinematic_video")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                pictorialMode === "cinematic_video"
                  ? "bg-rose-500 text-white shadow-xs"
                  : "text-gray-600 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cinematic Womb 360°</span>
            </button>

            <button
              onClick={() => setPictorialMode("fetal_art")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                pictorialMode === "fetal_art"
                  ? "bg-rose-500 text-white shadow-xs"
                  : "text-gray-600 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40"
              }`}
            >
              <Baby className="w-3.5 h-3.5" />
              <span>Anatomical Hotspots</span>
            </button>

            <button
              onClick={() => setPictorialMode("yoga_guide")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                pictorialMode === "yoga_guide"
                  ? "bg-rose-500 text-white shadow-xs"
                  : "text-gray-600 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40"
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Maternal Posture</span>
            </button>
          </div>
        </div>

        {/* MODE 1: CINEMATIC WOMB VIEW (360° CLOCKWISE & COUNTER-CLOCKWISE CIRCULAR ROTATION) */}
        {pictorialMode === "cinematic_video" && (
          <div className="space-y-4">
            
            {/* Top Toolbar: Perspective Angle & 360° Circular Rotation Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-1">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-rose-300">
                  <RotateCw className="w-3.5 h-3.5 text-rose-500" />
                  <span>Lens:</span>
                </div>
                <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/40 p-1 rounded-xl border border-rose-200 dark:border-rose-900/40 text-[11px] font-bold">
                  <button
                    onClick={() => setPerspectiveAngle("overview")}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      perspectiveAngle === "overview" ? "bg-rose-500 text-white shadow-xs" : "text-gray-600 dark:text-rose-200"
                    }`}
                  >
                    Womb Overview
                  </button>
                  <button
                    onClick={() => setPerspectiveAngle("profile")}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      perspectiveAngle === "profile" ? "bg-rose-500 text-white shadow-xs" : "text-gray-600 dark:text-rose-200"
                    }`}
                  >
                    Lateral Profile
                  </button>
                  <button
                    onClick={() => setPerspectiveAngle("senses")}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      perspectiveAngle === "senses" ? "bg-rose-500 text-white shadow-xs" : "text-gray-600 dark:text-rose-200"
                    }`}
                  >
                    Sensory Focus
                  </button>
                </div>
              </div>

              {/* 360° Clockwise / Anti-Clockwise Motion Controls */}
              <div className="flex items-center gap-2">
                
                {/* Clockwise / Anti-Clockwise Direction Switcher */}
                <div className="flex items-center bg-white dark:bg-rose-950/30 border border-gray-200 dark:border-rose-900/60 rounded-xl p-0.5 text-xs font-bold">
                  <button
                    onClick={() => {
                      setRotationDirection("cw");
                      showToast("Rotating Clockwise ↻");
                    }}
                    className={`px-2 py-1 rounded-lg flex items-center gap-1 transition-all ${
                      rotationDirection === "cw" ? "bg-rose-500 text-white shadow-2xs" : "text-gray-600 dark:text-rose-300"
                    }`}
                    title="Rotate Clockwise"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>Clockwise</span>
                  </button>

                  <button
                    onClick={() => {
                      setRotationDirection("ccw");
                      showToast("Rotating Counter-Clockwise ↺");
                    }}
                    className={`px-2 py-1 rounded-lg flex items-center gap-1 transition-all ${
                      rotationDirection === "ccw" ? "bg-rose-500 text-white shadow-2xs" : "text-gray-600 dark:text-rose-300"
                    }`}
                    title="Rotate Anti-Clockwise"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Anti-Clockwise</span>
                  </button>
                </div>

                {/* Speed Mode Toggle (Gentle / Porumaya, Slow, Normal) */}
                <button
                  onClick={() => {
                    const nextMode = rotationSpeedMode === "gentle" ? "slow" : rotationSpeedMode === "slow" ? "normal" : "gentle";
                    setRotationSpeedMode(nextMode);
                    const label = nextMode === "gentle" ? "Gentle (Porumaya)" : nextMode === "slow" ? "Slow" : "Normal";
                    showToast(`Speed: ${label}`);
                  }}
                  className="px-2.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-rose-950/30 text-xs font-bold text-gray-700 dark:text-rose-200 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-all flex items-center gap-1 shadow-2xs"
                  title="Cycle Rotation Speed: Gentle (Porumaya) / Slow / Normal"
                >
                  <span className="text-rose-500">Speed:</span>
                  <span>{rotationSpeedMode === "gentle" ? "Gentle" : rotationSpeedMode === "slow" ? "Slow" : "Normal"}</span>
                </button>

                {/* Auto Rotate Toggle */}
                <button
                  onClick={() => setIsAutoRotating(!isAutoRotating)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs ${
                    isAutoRotating
                      ? "bg-rose-100 dark:bg-rose-900/60 border-rose-300 text-rose-800 dark:text-rose-200"
                      : "bg-white dark:bg-rose-950/30 border-gray-200 dark:border-rose-900 text-gray-700 dark:text-rose-300"
                  }`}
                  title="Toggle continuous smooth 360° circular floating orbit"
                >
                  {isAutoRotating ? <Pause className="w-3 h-3 text-rose-600" /> : <Play className="w-3 h-3 text-rose-500" />}
                  <span>{isAutoRotating ? "Float (On)" : "Paused"}</span>
                </button>

                {/* Reset Rotation to 0° */}
                <button
                  onClick={() => {
                    setRotationAngle(0);
                    showToast("Reset baby position to upright (0°)");
                  }}
                  className="p-1.5 rounded-xl bg-white dark:bg-rose-950/30 border border-gray-200 dark:border-rose-900 text-gray-600 dark:text-rose-300 hover:text-rose-600 transition-all"
                  title="Reset to upright 0°"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Cinematic Stage Canvas */}
            <div
              onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
              onMouseUp={handlePointerUp}
              onMouseLeave={handlePointerUp}
              onTouchMove={(e) => {
                if (e.touches[0]) {
                  handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
                }
              }}
              onTouchEnd={handlePointerUp}
              className="relative rounded-3xl overflow-hidden shadow-sm h-[480px] md:h-[530px] w-full max-w-5xl mx-auto border border-rose-200/50 dark:border-rose-900/40 transition-all duration-700 bg-rose-50 dark:bg-[#1E1425]"
            >
              
              {/* LAYER 1: MATERNAL SILHOUETTE PORTRAIT */}
              <div className="absolute inset-y-0 right-0 w-full md:w-2/3 pointer-events-none opacity-85 dark:opacity-60 mix-blend-multiply dark:mix-blend-screen">
                <img
                  src="/assets/cinematic/maternal_portrait.png"
                  alt="Maternal Portrait"
                  loading="lazy"
                  className="w-full h-full object-cover object-center md:object-[center_70%]"
                />
                <div className="absolute inset-0 bg-rose-500/10 dark:bg-purple-900/15" />
              </div>

              {/* LAYER 2: THE COSMIC WOMB BUBBLE & 360° CIRCULAR ROTATING BABY ORB */}
              <div
                ref={orbRef}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handlePointerDown(e.clientX, e.clientY);
                }}
                onTouchStart={(e) => {
                  if (e.touches[0]) {
                    handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
                  }
                }}
                onClick={handleWombClick}
                className={`absolute top-[65%] md:top-[68%] right-[16%] md:right-[22%] -translate-y-1/2 transition-all duration-500 flex items-center justify-center z-20 cursor-grab active:cursor-grabbing ${
                  perspectiveAngle === "profile" ? "scale-115" : perspectiveAngle === "senses" ? "scale-125" : "scale-100"
                } w-[220px] h-[220px] md:w-[280px] md:h-[280px]`}
              >
                
                {/* Orbital Rings Effect */}
                <div className="absolute inset-[-14px] md:inset-[-18px] rounded-full border border-rose-400/40 dark:border-rose-300/30 border-dashed animate-[spin_40s_linear_infinite] pointer-events-none" />
                <div className="absolute inset-[-28px] md:inset-[-34px] rounded-full border border-pink-400/30 dark:border-purple-300/20 animate-[spin_30s_linear_infinite_reverse] pointer-events-none" />
                <div className="absolute inset-[-42px] md:inset-[-50px] rounded-full border-[0.5px] border-white/40 dark:border-white/15 animate-[spin_50s_linear_infinite] pointer-events-none" />
                
                {/* Pulsing Satellite Sparks */}
                <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-rose-400 dark:bg-rose-300 rounded-full shadow-[0_0_10px_#f43f5e] animate-[pulse_2s_ease-in-out_infinite]" />
                <div className="absolute bottom-6 left-[-15px] w-1.5 h-1.5 bg-pink-300 rounded-full shadow-[0_0_8px_pink] animate-[pulse_3s_ease-in-out_infinite]" />

                {/* THE CIRCULAR ROTATABLE WOMB ORB (NO FRONT/BACK FLIPPING!) */}
                <div 
                  className={`absolute inset-0 rounded-full backdrop-blur-xs transition-all duration-300 shadow-sm overflow-hidden ${
                    ecgPulseActive ? "ring-4 ring-rose-400 scale-102" : "ring-2 ring-rose-300/60"
                  } ${isBabyStirring ? "ring-4 ring-pink-400 scale-105" : ""} bg-rose-200/30 dark:bg-purple-950/60`}
                  style={{
                    maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 58%, rgba(0,0,0,0) 72%)',
                    WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 58%, rgba(0,0,0,0) 72%)',
                  }}
                >
                  {/* PURE 360° PLANAR ROTATION CONTAINER (CLOCKWISE / ANTI-CLOCKWISE) */}
                  <div
                    className="w-full h-full relative flex items-center justify-center"
                    style={{
                      transform: `rotate(${rotationAngle}deg) scale(${isBabyStirring ? 1.05 : 1})`,
                      transformOrigin: "center center",
                      transition: isDragging || isAutoRotating ? "none" : "transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)",
                    }}
                  >
                    {/* The Cinematic Fetus Image - Always Crystal-Clear Front-Facing */}
                    <img
                      key={`${selectedWeek}-${perspectiveAngle}`}
                      src={getFetusImageSrc(selectedWeek)}
                      loading="lazy"
                      onError={(e) => { 
                        e.currentTarget.src = fetalDevBanner;
                        e.currentTarget.className = "absolute inset-0 w-full h-full object-cover opacity-80 blur-xs";
                      }}
                      alt={`Fetal development week ${selectedWeek}`}
                      className="w-full h-full object-cover origin-center animate-[pulse_9s_ease-in-out_infinite] select-none"
                      draggable={false}
                    />
                  </div>

                  {/* Translucent Amniotic Fluid Caustic Wave Shimmer */}
                  <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.22),transparent_70%)] animate-pulse" />

                  {/* Water Ripple Effect on Touch */}
                  {ripple && (
                    <span
                      key={ripple.id}
                      className="absolute rounded-full bg-rose-400/40 pointer-events-none animate-ping"
                      style={{
                        left: `${ripple.x}px`,
                        top: `${ripple.y}px`,
                        width: "80px",
                        height: "80px",
                        transform: "translate(-50%, -50%)",
                      }}
                    />
                  )}
                </div>

                {/* Emotional Message Balloon on Tap */}
                {touchMessage && (
                  <div className="absolute -top-10 bg-white/95 dark:bg-black/90 px-3.5 py-1 rounded-full border border-pink-300 dark:border-pink-800 text-[11px] font-bold text-pink-600 dark:text-pink-300 shadow-xl flex items-center gap-1.5 z-40 animate-bounce whitespace-nowrap">
                    <span>{touchMessage}</span>
                  </div>
                )}

                {/* Live BPM Badge inside Womb */}
                {currentBpm > 0 && (
                  <div className="absolute -bottom-3 bg-white/95 dark:bg-black/90 px-3.5 py-1 rounded-full border border-rose-300 dark:border-rose-800 text-[10px] font-extrabold text-rose-600 dark:text-rose-300 shadow-md flex items-center gap-1.5 z-30">
                    <Heart className={`w-3 h-3 text-rose-500 ${ecgPulseActive ? "scale-125 text-red-500" : ""}`} />
                    <span>{currentBpm} BPM</span>
                  </div>
                )}
              </div>

              {/* Touch Helper Hint on Womb */}
              <div className="absolute bottom-3 right-6 z-30 pointer-events-none hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 dark:text-rose-300/80 bg-white/80 dark:bg-black/50 px-3 py-1 rounded-full border border-rose-200/60 shadow-2xs">
                <Hand className="w-3 h-3 text-rose-500 animate-pulse" />
                <span>Drag to turn 360° ↻ · Tap to feel baby stir</span>
              </div>

              {/* LAYER 3: UI CONTENT ON THE LEFT */}
              <div className="absolute inset-y-0 left-0 w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between pointer-events-none z-30 text-gray-900 dark:text-rose-50">
                
                {/* Top Section: Week & Trimester */}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl md:text-3xl font-serif font-extrabold tracking-tight text-gray-900 dark:text-rose-100">
                      Week {selectedWeek}
                    </h2>
                    {selectedWeek === currentWeek && (
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-500 text-white shadow-xs">
                        Active Week
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-rose-600 dark:text-rose-300 mt-1">
                    {detail.trimester === 1 ? 'First' : detail.trimester === 2 ? 'Second' : 'Third'} Trimester · Fetal Development
                  </p>
                </div>

                {/* Middle Section: Stage & Fruit */}
                <div className="space-y-1 my-auto pt-2">
                  <p className="text-xs font-medium text-gray-600 dark:text-rose-200/80 uppercase tracking-wider">
                    Baby is approximately the size of
                  </p>
                  <h3 className="text-3xl sm:text-4xl font-serif font-bold text-rose-600 dark:text-rose-300 flex items-center gap-2">
                    <span>{detail.babySize.name}</span>
                    <span className="text-3xl">{detail.babySize.emoji}</span>
                  </h3>
                  {detail.babySize.indianComparison && (
                    <p className="text-xs text-gray-500 dark:text-rose-300/70 font-medium">
                      ({detail.babySize.indianComparison})
                    </p>
                  )}
                </div>

                {/* Bottom Section: Length, Weight, & Days Remaining */}
                <div className="space-y-3 pb-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/80 dark:bg-black/40 backdrop-blur-md p-2.5 rounded-2xl border border-rose-200/60 dark:border-rose-900/40">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-rose-300 block">Length</span>
                      <span className="text-lg font-bold text-gray-900 dark:text-rose-100">{detail.babySize.length}</span>
                    </div>

                    <div className="bg-white/80 dark:bg-black/40 backdrop-blur-md p-2.5 rounded-2xl border border-rose-200/60 dark:border-rose-900/40">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-rose-300 block">Weight</span>
                      <span className="text-lg font-bold text-gray-900 dark:text-rose-100">{detail.babySize.weight}</span>
                    </div>
                  </div>

                  {/* Days to Arrival Indicator */}
                  <div className="bg-white/80 dark:bg-black/40 backdrop-blur-md p-2.5 rounded-2xl border border-rose-200/60 dark:border-rose-900/40 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700 dark:text-rose-200 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-rose-500" />
                      <span>Days to EDD Arrival</span>
                    </span>
                    <span className="text-sm font-extrabold text-rose-600 dark:text-rose-300">
                      {selectedWeek === currentWeek ? `${progress.daysRemaining} days` : `${Math.max(0, 280 - (selectedWeek * 7))} days`}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* MODE 2: ANATOMICAL HOTSPOTS & FETAL ART (INTERACTIVE PINPOINT RADARS & GESTATIONAL CLINICAL INSIGHTS) */}
        {pictorialMode === "fetal_art" && (() => {
          const hotspotDetails = getAnatomicalHotspotDetails(activeHotspot || "heart", selectedWeek, currentBpm);
          const hotspotCoords = getHotspotCoordinates(selectedWeek);

          return (
            <div className="space-y-6">
              
              {/* TOP ANATOMICAL SYSTEM SELECTOR PILLS */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setActiveHotspot("brain")}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                    activeHotspot === "brain"
                      ? "bg-rose-500 text-white shadow-md scale-102 ring-2 ring-rose-300/50"
                      : "bg-[#FAF4EE] dark:bg-rose-950/30 text-gray-700 dark:text-rose-200 border border-[#EDE0D4] dark:border-rose-900/40 hover:bg-rose-100/60"
                  }`}
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span>Brain & CNS</span>
                </button>

                <button
                  onClick={() => setActiveHotspot("heart")}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                    activeHotspot === "heart"
                      ? "bg-rose-500 text-white shadow-md scale-102 ring-2 ring-rose-300/50"
                      : "bg-[#FAF4EE] dark:bg-rose-950/30 text-gray-700 dark:text-rose-200 border border-[#EDE0D4] dark:border-rose-900/40 hover:bg-rose-100/60"
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${activeHotspot === "heart" ? "animate-pulse" : ""}`} />
                  <span>Heart & Cardiac ({currentBpm} BPM)</span>
                </button>

                <button
                  onClick={() => setActiveHotspot("limbs")}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                    activeHotspot === "limbs"
                      ? "bg-rose-500 text-white shadow-md scale-102 ring-2 ring-rose-300/50"
                      : "bg-[#FAF4EE] dark:bg-rose-950/30 text-gray-700 dark:text-rose-200 border border-[#EDE0D4] dark:border-rose-900/40 hover:bg-rose-100/60"
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Limbs & Kicks</span>
                </button>

                <button
                  onClick={() => setActiveHotspot("senses")}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                    activeHotspot === "senses"
                      ? "bg-rose-500 text-white shadow-md scale-102 ring-2 ring-rose-300/50"
                      : "bg-[#FAF4EE] dark:bg-rose-950/30 text-gray-700 dark:text-rose-200 border border-[#EDE0D4] dark:border-rose-900/40 hover:bg-rose-100/60"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Sensory Organs & Hearing</span>
                </button>
              </div>

              {/* MAIN CONTENT GRID: INTERACTIVE FETUS CANVAS + CLINICAL INSIGHTS CARD */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* 1. THE INTERACTIVE FETUS CANVAS WITH DIRECT CLICKABLE HOTSPOT RADARS */}
                <div className="lg:col-span-7 relative rounded-2xl overflow-hidden shadow-sm border-2 border-rose-200/70 dark:border-rose-900/50 bg-rose-50 dark:bg-[#1E1425] min-h-[380px] sm:min-h-[420px] flex items-center justify-center p-4 sm:p-6">
                  
                  {/* Calibrated 1:1 Aspect-Square Container Anchoring Hotspot Pins Directly to Image Space */}
                  <div className="relative w-full max-w-[340px] sm:max-w-[400px] aspect-square flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl bg-black/40">
                    
                    {/* High-Resolution Gestational Fetus Image for THIS specific week */}
                    <img
                      key={`hotspot-${selectedWeek}`}
                      src={getFetusImageSrc(selectedWeek)}
                      alt={`Week ${selectedWeek} Fetus Anatomy`}
                      onError={(e) => {
                        e.currentTarget.src = fetalDevBanner;
                        e.currentTarget.className = "w-full h-full object-cover opacity-80";
                      }}
                      className="w-full h-full object-cover drop-shadow-2xl select-none pointer-events-none"
                      draggable={false}
                    />

                    {/* Ambient Caustic Fluid Shimmer */}
                    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.15),transparent_70%)] animate-pulse" />

                    {/* HOTSPOT 1: BRAIN & CNS RADAR BEACON */}
                    <div
                      onClick={() => setActiveHotspot("brain")}
                      style={{ top: hotspotCoords.brain.top, left: hotspotCoords.brain.left }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-30 flex flex-col items-center transition-all duration-500 ease-out"
                      title="Click to inspect Brain & Nervous System"
                    >
                      <div className="relative flex items-center justify-center">
                        <span className={`absolute rounded-full transition-all ${
                          activeHotspot === "brain"
                            ? "w-10 h-10 bg-rose-500/40 animate-ping"
                            : "w-6 h-6 bg-rose-400/20 group-hover:scale-125"
                        }`} />
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${
                          activeHotspot === "brain"
                            ? "bg-rose-500 text-white scale-110 ring-4 ring-white dark:ring-rose-900"
                            : "bg-white/90 dark:bg-black/80 text-rose-600 border border-rose-300 hover:scale-110"
                        }`}>
                          <Brain className="w-4 h-4" />
                        </div>
                      </div>
                      <span className={`mt-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold whitespace-nowrap shadow-xs backdrop-blur-md transition-all ${
                        activeHotspot === "brain"
                          ? "bg-rose-500 text-white"
                          : "bg-white/90 dark:bg-black/80 text-gray-800 dark:text-rose-200 border border-rose-200"
                      }`}>
                        Brain & CNS
                      </span>
                    </div>

                    {/* HOTSPOT 2: SENSORY ORGANS RADAR BEACON */}
                    <div
                      onClick={() => setActiveHotspot("senses")}
                      style={{ top: hotspotCoords.senses.top, left: hotspotCoords.senses.left }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-30 flex flex-col items-center transition-all duration-500 ease-out"
                      title="Click to inspect Sensory Organs & Hearing"
                    >
                      <div className="relative flex items-center justify-center">
                        <span className={`absolute rounded-full transition-all ${
                          activeHotspot === "senses"
                            ? "w-10 h-10 bg-amber-500/40 animate-ping"
                            : "w-6 h-6 bg-amber-400/20 group-hover:scale-125"
                        }`} />
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${
                          activeHotspot === "senses"
                            ? "bg-amber-500 text-white scale-110 ring-4 ring-white dark:ring-amber-900"
                            : "bg-white/90 dark:bg-black/80 text-amber-600 border border-amber-300 hover:scale-110"
                        }`}>
                          <Eye className="w-4 h-4" />
                        </div>
                      </div>
                      <span className={`mt-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold whitespace-nowrap shadow-xs backdrop-blur-md transition-all ${
                        activeHotspot === "senses"
                          ? "bg-amber-500 text-white"
                          : "bg-white/90 dark:bg-black/80 text-gray-800 dark:text-amber-200 border border-amber-200"
                      }`}>
                        Senses & Ears
                      </span>
                    </div>

                    {/* HOTSPOT 3: CARDIOVASCULAR HEART RADAR BEACON */}
                    <div
                      onClick={() => setActiveHotspot("heart")}
                      style={{ top: hotspotCoords.heart.top, left: hotspotCoords.heart.left }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-30 flex flex-col items-center transition-all duration-500 ease-out"
                      title="Click to inspect Fetal Heart & Circulation"
                    >
                      <div className="relative flex items-center justify-center">
                        <span className={`absolute rounded-full transition-all ${
                          activeHotspot === "heart"
                            ? "w-12 h-12 bg-rose-600/40 animate-ping"
                            : "w-7 h-7 bg-rose-500/20 group-hover:scale-125"
                        }`} />
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm ${
                          activeHotspot === "heart"
                            ? "bg-rose-600 text-white scale-115 ring-4 ring-white dark:ring-rose-900 animate-pulse"
                            : "bg-white/90 dark:bg-black/80 text-rose-600 border border-rose-300 hover:scale-110"
                        }`}>
                          <Heart className="w-4 h-4" />
                        </div>
                      </div>
                      <span className={`mt-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold whitespace-nowrap shadow-xs backdrop-blur-md transition-all ${
                        activeHotspot === "heart"
                          ? "bg-rose-600 text-white"
                          : "bg-white/90 dark:bg-black/80 text-gray-800 dark:text-rose-200 border border-rose-200"
                      }`}>
                        Heart ({currentBpm} BPM)
                      </span>
                    </div>

                    {/* HOTSPOT 4: LIMBS & MOVEMENT RADAR BEACON */}
                    <div
                      onClick={() => setActiveHotspot("limbs")}
                      style={{ top: hotspotCoords.limbs.top, left: hotspotCoords.limbs.left }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-30 flex flex-col items-center transition-all duration-500 ease-out"
                      title="Click to inspect Limbs, Skeleton & Kicks"
                    >
                      <div className="relative flex items-center justify-center">
                        <span className={`absolute rounded-full transition-all ${
                          activeHotspot === "limbs"
                            ? "w-10 h-10 bg-purple-500/40 animate-ping"
                            : "w-6 h-6 bg-purple-400/20 group-hover:scale-125"
                        }`} />
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${
                          activeHotspot === "limbs"
                            ? "bg-purple-600 text-white scale-110 ring-4 ring-white dark:ring-purple-900"
                            : "bg-white/90 dark:bg-black/80 text-purple-600 border border-purple-300 hover:scale-110"
                        }`}>
                          <Activity className="w-4 h-4" />
                        </div>
                      </div>
                      <span className={`mt-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold whitespace-nowrap shadow-xs backdrop-blur-md transition-all ${
                        activeHotspot === "limbs"
                          ? "bg-purple-600 text-white"
                          : "bg-white/90 dark:bg-black/80 text-gray-800 dark:text-purple-200 border border-purple-200"
                      }`}>
                        Limbs & Kicks
                      </span>
                    </div>

                  </div>

                  {/* Top-Left Banner Overlay */}
                  <div className="absolute top-4 left-4 bg-white/80 dark:bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-rose-200/60 dark:border-rose-900/40 text-[11px] font-bold text-gray-800 dark:text-rose-200 flex items-center gap-1.5 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                    <span>Week {selectedWeek} Fetal Anatomy</span>
                  </div>

                  {/* Bottom-Right Measurement Badge */}
                  <div className="absolute bottom-4 right-4 bg-white/80 dark:bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-rose-200/60 dark:border-rose-900/40 text-[11px] font-bold text-gray-800 dark:text-rose-200 shadow-xs">
                    <span>{detail.babySize.length} · {detail.babySize.weight}</span>
                  </div>

                </div>

                {/* 2. DYNAMIC GESTATIONAL CLINICAL INSIGHTS & ACTION HUB */}
                <div className="lg:col-span-5 space-y-4 animate-in fade-in duration-200">
                  
                  {/* Main Anatomical System Card */}
                  <div className="bg-[#FAF4EE] dark:bg-rose-950/30 p-6 rounded-3xl border-2 border-rose-200/80 dark:border-rose-900/40 space-y-4 shadow-sm">
                    
                    {/* Header: System & Stage */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/60 px-2.5 py-0.5 rounded-full">
                          {hotspotDetails.system}
                        </span>
                        <span className="text-[10px] font-bold text-gray-500 dark:text-rose-300/80">
                          Week {selectedWeek}
                        </span>
                      </div>
                      <h3 className="font-serif text-lg sm:text-xl font-bold text-gray-900 dark:text-rose-50 pt-1">
                        {hotspotDetails.title}
                      </h3>
                      <p className="text-xs text-rose-600 dark:text-rose-300 font-semibold">
                        {hotspotDetails.stage}
                      </p>
                    </div>

                    {/* Key Clinical Fact Quote Box */}
                    <div className="p-4 rounded-2xl bg-white/90 dark:bg-[#14101A]/80 border border-rose-100 dark:border-rose-900/40 shadow-xs">
                      <p className="text-xs sm:text-sm text-gray-900 dark:text-rose-100 font-serif leading-relaxed italic">
                        "{hotspotDetails.fact}"
                      </p>
                    </div>

                    {/* Detailed Physiological Development */}
                    <p className="text-xs text-gray-700 dark:text-rose-200 leading-relaxed font-medium">
                      {hotspotDetails.details}
                    </p>

                    {/* Clinical Stat Grid */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="bg-white/80 dark:bg-black/40 p-3 rounded-2xl border border-rose-100 dark:border-rose-900/40">
                        <span className="text-[9px] font-extrabold uppercase text-gray-500 dark:text-rose-300 block">
                          {hotspotDetails.statLabel}
                        </span>
                        <span className="text-sm font-bold text-rose-600 dark:text-rose-300 mt-0.5 block">
                          {hotspotDetails.statValue}
                        </span>
                      </div>

                      <div className="bg-white/80 dark:bg-black/40 p-3 rounded-2xl border border-rose-100 dark:border-rose-900/40">
                        <span className="text-[9px] font-extrabold uppercase text-gray-500 dark:text-rose-300 block">
                          Clinical Milestone
                        </span>
                        <span className="text-sm font-bold text-gray-900 dark:text-rose-100 mt-0.5 block truncate">
                          {hotspotDetails.milestoneTag}
                        </span>
                      </div>
                    </div>

                    {/* MULTI-SENSORY INTERACTIVE ACTION BUTTON */}
                    <div className="pt-2">
                      {activeHotspot === "heart" && (
                        <div className="space-y-3">
                          {/* Play / Pause Primary Button */}
                          <button
                            onClick={toggleHeartbeat}
                            className={`w-full py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all ${
                              isPlayingHeartbeat
                                ? "bg-rose-600 text-white animate-pulse"
                                : "bg-rose-500 hover:bg-rose-600 text-white"
                            }`}
                          >
                            {isPlayingHeartbeat ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            <span>
                              {isPlayingHeartbeat
                                ? `Pause Fetal Heartbeat (${currentBpm} BPM)`
                                : `Listen to Real Heartbeat (${currentBpm} BPM)`}
                            </span>
                          </button>

                          {/* Sound Mode & Acoustic Volume Settings */}
                          <div className="bg-white/90 dark:bg-black/40 p-3 rounded-2xl border border-rose-200/60 dark:border-rose-900/40 space-y-2.5 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-gray-700 dark:text-rose-200 flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full transition-all ${ecgPulseActive ? "bg-rose-500 scale-150 animate-ping" : "bg-rose-300"}`} />
                                Sound Mode:
                              </span>

                              {/* Doppler vs Stethoscope Switcher */}
                              <div className="flex items-center bg-rose-50 dark:bg-rose-950/60 p-0.5 rounded-xl border border-rose-200 dark:border-rose-900/40 text-[10px] font-extrabold">
                                <button
                                  type="button"
                                  onClick={() => handleSoundTypeChange("doppler")}
                                  className={`px-2.5 py-1 rounded-lg transition-all ${
                                    heartbeatSoundType === "doppler"
                                      ? "bg-rose-500 text-white shadow-2xs"
                                      : "text-gray-600 dark:text-rose-300 hover:text-rose-600"
                                  }`}
                                  title="Clinical Ultrasound Doppler Transducer (Galloping Horse Rhythm)"
                                >
                                  Doppler
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSoundTypeChange("stethoscope")}
                                  className={`px-2.5 py-1 rounded-lg transition-all ${
                                    heartbeatSoundType === "stethoscope"
                                      ? "bg-rose-500 text-white shadow-2xs"
                                      : "text-gray-600 dark:text-rose-300 hover:text-rose-600"
                                  }`}
                                  title="In-Utero Acoustic Stethoscope (Lub-Dub Double Beat)"
                                >
                                  Stethoscope
                                </button>
                              </div>
                            </div>

                            {/* Volume Slider & Audio Status */}
                            <div className="flex items-center justify-between gap-3 pt-1 border-t border-rose-100 dark:border-rose-900/30">
                              <span className="text-[10px] font-semibold text-gray-500 dark:text-rose-300/80">
                                {heartbeatSoundType === "doppler" ? "Ultrasound Gallop" : "Organic Lub-Dub"}
                              </span>
                              <div className="flex items-center gap-2">
                                <Volume2 className="w-3 h-3 text-gray-400" />
                                <input
                                  type="range"
                                  min="0.1"
                                  max="1"
                                  step="0.05"
                                  value={heartbeatVolume}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    setHeartbeatVolume(val);
                                    volumeRef.current = val;
                                  }}
                                  className="w-20 accent-rose-500 h-1.5 bg-rose-200 dark:bg-rose-950 rounded-lg cursor-pointer"
                                />
                                <Volume2 className="w-3.5 h-3.5 text-gray-400" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeHotspot === "senses" && (
                        <div className="space-y-3 pt-1">
                          {/* Main Play/Pause Button */}
                          <button
                            onClick={toggleWombHearingMode}
                            className={`w-full py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all ${
                              isWombHearingMode
                                ? "bg-indigo-600 text-white animate-pulse"
                                : "bg-indigo-500 hover:bg-indigo-600 text-white"
                            }`}
                          >
                            <Headphones className="w-4 h-4" />
                            <span>
                              {isWombHearingMode
                                ? "Pause Intrauterine Soundscape"
                                : "Immerse in Womb Soundscape"}
                            </span>
                          </button>

                          {/* Soundscape Mode & Acoustic Volume Settings Studio */}
                          <div className="bg-white/90 dark:bg-black/40 p-3 rounded-2xl border border-indigo-200/60 dark:border-indigo-900/40 space-y-2.5 text-xs">
                            {/* Gestational Hearing Stage Milestone */}
                            <div className="flex items-center justify-between pb-2 border-b border-indigo-100 dark:border-indigo-900/30">
                              <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full transition-all ${isWombHearingMode ? "bg-indigo-500 scale-125 animate-ping" : "bg-indigo-300"}`} />
                                Hearing Stage:
                              </span>
                              <span className="text-[10px] font-semibold text-gray-500 dark:text-indigo-200">
                                {selectedWeek < 18
                                  ? `Week ${selectedWeek}: Cochlea Forming`
                                  : selectedWeek < 24
                                  ? `Week ${selectedWeek}: Low-Freq Perception`
                                  : `Week ${selectedWeek}: Recognizes Mother's Voice`}
                              </span>
                            </div>

                            {/* Soundscape Layer Selection */}
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-indigo-300">
                                Soundscape Layer:
                              </span>
                              <div className="grid grid-cols-3 gap-1.5 bg-indigo-50/70 dark:bg-indigo-950/60 p-1 rounded-xl border border-indigo-200/60 dark:border-indigo-900/40 text-[10px] font-bold">
                                <button
                                  type="button"
                                  onClick={() => handleWombModeChange("placental_flow")}
                                  className={`py-1.5 px-2 rounded-lg transition-all text-center flex flex-col items-center gap-0.5 ${
                                    wombSoundscapeMode === "placental_flow"
                                      ? "bg-indigo-600 text-white shadow-xs"
                                      : "text-gray-600 dark:text-indigo-300 hover:text-indigo-600"
                                  }`}
                                  title="Maternal Placental Flow Pulse (72 BPM)"
                                >
                                  <span>Placental</span>
                                  <span className="text-[8px] opacity-80">72 BPM Bruit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleWombModeChange("amniotic_drift")}
                                  className={`py-1.5 px-2 rounded-lg transition-all text-center flex flex-col items-center gap-0.5 ${
                                    wombSoundscapeMode === "amniotic_drift"
                                      ? "bg-indigo-600 text-white shadow-xs"
                                      : "text-gray-600 dark:text-indigo-300 hover:text-indigo-600"
                                  }`}
                                  title="Amniotic Fluid Drift (Lowpass Noise Bed)"
                                >
                                  <span>Amniotic</span>
                                  <span className="text-[8px] opacity-80">Fluid Drift</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleWombModeChange("maternal_hum")}
                                  className={`py-1.5 px-2 rounded-lg transition-all text-center flex flex-col items-center gap-0.5 ${
                                    wombSoundscapeMode === "maternal_hum"
                                      ? "bg-indigo-600 text-white shadow-xs"
                                      : "text-gray-600 dark:text-indigo-300 hover:text-indigo-600"
                                  }`}
                                  title="Maternal Bone-Conducted Voice / Hum"
                                >
                                  <span>Voice Hum</span>
                                  <span className="text-[8px] opacity-80">130Hz Drone</span>
                                </button>
                              </div>
                            </div>

                            {/* Soundscape Volume Slider */}
                            <div className="flex items-center justify-between gap-3 pt-1 border-t border-indigo-100 dark:border-indigo-900/30">
                              <span className="text-[10px] font-semibold text-gray-500 dark:text-indigo-300/80">
                                {wombSoundscapeMode === "placental_flow"
                                  ? "Aortic / Placental Flow"
                                  : wombSoundscapeMode === "amniotic_drift"
                                  ? "Amniotic Sac Resonance"
                                  : "Maternal Spine Conducted Hum"}
                              </span>
                              <div className="flex items-center gap-2">
                                <Volume2 className="w-3 h-3 text-gray-400" />
                                <input
                                  type="range"
                                  min="0.1"
                                  max="1"
                                  step="0.05"
                                  value={wombAudioVolume}
                                  onChange={(e) => handleWombVolumeChange(parseFloat(e.target.value))}
                                  className="w-20 accent-indigo-600 h-1.5 bg-indigo-200 dark:bg-indigo-950 rounded-lg cursor-pointer"
                                />
                                <Volume2 className="w-3.5 h-3.5 text-gray-400" />
                              </div>
                            </div>

                            {/* Clinical Bioacoustics Note */}
                            <p className="text-[9px] text-gray-500 dark:text-indigo-300/70 italic leading-relaxed pt-1">
                              Amniotic fluid acts as a natural lowpass acoustic filter (&lt;500Hz), muffling external high-frequency sounds while maternal vascular flow and low voice fundamentals are conducted directly to the fetus.
                            </p>
                          </div>
                        </div>
                      )}

                      {activeHotspot === "limbs" && (
                        <button
                          onClick={() => setActivePage("kick-counter")}
                          className="w-full py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
                        >
                          <Activity className="w-4 h-4" />
                          <span>Open Kick Counter & Movement Tracker</span>
                        </button>
                      )}

                      {activeHotspot === "brain" && (
                        <button
                          onClick={() => setActivePage("ai-assistant")}
                          className="w-full py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all"
                        >
                          <Brain className="w-4 h-4" />
                          <span>Ask AI About Week {selectedWeek} Brain Development</span>
                        </button>
                      )}
                    </div>

                  </div>

                </div>

              </div>

            </div>
          );
        })()}

        {/* MODE 3: MATERNAL BIOMECHANICS & POSTURE STUDIO */}
        {pictorialMode === "yoga_guide" && (
          <div className="space-y-6">
            
            {/* 1. Header Banner & Gestational Biomechanical Metrics */}
            <div className="bg-rose-500/10 p-5 sm:p-6 rounded-3xl border border-rose-200/70 dark:border-rose-900/50 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-xl bg-rose-500 text-white shadow-xs">
                      <Heart className="w-4 h-4" />
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                      Mama's Healthy Posture & Daily Comfort
                    </span>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-gray-900 dark:text-rose-100 mt-1">
                    {postureData.trimesterTitle}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-rose-200/80 mt-1 max-w-2xl leading-relaxed">
                    {postureData.trimesterSubtitle}
                  </p>
                </div>

                {/* 4 Live Physiological Metric Pills */}
                <div className="grid grid-cols-2 sm:flex sm:flex-col gap-2 shrink-0">
                  <div className="bg-white/80 dark:bg-rose-950/60 px-3 py-1.5 rounded-xl border border-rose-200/60 dark:border-rose-900/40 text-left">
                    <span className="text-[10px] text-gray-500 dark:text-rose-300/80 block uppercase font-bold">Body Balance Shift</span>
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-300">+{postureData.centerOfGravityCm} cm Forward</span>
                  </div>
                  <div className="bg-white/80 dark:bg-rose-950/60 px-3 py-1.5 rounded-xl border border-rose-200/60 dark:border-rose-900/40 text-left">
                    <span className="text-[10px] text-gray-500 dark:text-rose-300/80 block uppercase font-bold">Baby & Belly Level</span>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-300">{postureData.fundalHeight}</span>
                  </div>
                  <div className="bg-white/80 dark:bg-rose-950/60 px-3 py-1.5 rounded-xl border border-rose-200/60 dark:border-rose-900/40 text-left">
                    <span className="text-[10px] text-gray-500 dark:text-rose-300/80 block uppercase font-bold">Joint Flexibility</span>
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-300">{postureData.relaxinStatus}</span>
                  </div>
                  <div className="bg-white/80 dark:bg-rose-950/60 px-3 py-1.5 rounded-xl border border-rose-200/60 dark:border-rose-900/40 text-left">
                    <span className="text-[10px] text-gray-500 dark:text-rose-300/80 block uppercase font-bold">Baby's Sweet Spot</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{postureData.fetalTargetPosition}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Side-by-Side Biomechanical Spinal Alignment Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card A: Slouch Risk (Warning / Caution) */}
              <div className="bg-amber-50/50 dark:bg-amber-950/20 p-5 rounded-3xl border border-amber-200 dark:border-amber-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-amber-600" />
                    <span>{postureData.slouchCard.badge}</span>
                  </span>
                  <span className={`text-[10px] font-semibold ${postureData.slouchCard.shearBadgeColor}`}>
                    {postureData.slouchCard.shearForce}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-amber-950 dark:text-amber-200">
                  {postureData.slouchCard.title}
                </h4>

                <div className="space-y-2 text-xs text-gray-700 dark:text-amber-200/90">
                  {postureData.slouchCard.points.map((pt, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold shrink-0">{idx + 1}.</span>
                      <span><strong>{pt.title}</strong> {pt.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card B: Optimal Neutral Alignment (Target) */}
              <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-5 rounded-3xl border border-emerald-200 dark:border-emerald-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>{postureData.plumbLineCard.badge}</span>
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                    {postureData.plumbLineCard.shearReduction}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                  {postureData.plumbLineCard.title}
                </h4>

                <div className="space-y-2 text-xs text-gray-700 dark:text-emerald-200/90">
                  {postureData.plumbLineCard.points.map((pt, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold shrink-0">{idx + 1}.</span>
                      <span><strong>{pt.title}</strong> {pt.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Daily Functional Ergonomic Scenarios (Tabbed System) */}
            <div className="bg-white dark:bg-[#1f192b] p-5 sm:p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-100 dark:border-rose-900/40 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
                    Everyday Body Comfort Guide
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                    Week {selectedWeek} • Trimester {detail.trimester} Focus
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 bg-rose-50/80 dark:bg-rose-950/60 p-1 rounded-2xl border border-rose-200/60 dark:border-rose-900/40 text-[11px] font-bold">
                  <button
                    onClick={() => setPostureTab("standing")}
                    className={`px-3 py-1.5 rounded-xl transition-all ${
                      postureTab === "standing" ? "bg-rose-500 text-white shadow-xs" : "text-gray-600 dark:text-rose-300 hover:text-rose-600"
                    }`}
                  >
                    Standing & Walking
                  </button>
                  <button
                    onClick={() => setPostureTab("sitting")}
                    className={`px-3 py-1.5 rounded-xl transition-all ${
                      postureTab === "sitting" ? "bg-rose-500 text-white shadow-xs" : "text-gray-600 dark:text-rose-300 hover:text-rose-600"
                    }`}
                  >
                    Sitting & Working
                  </button>
                  <button
                    onClick={() => setPostureTab("sleeping")}
                    className={`px-3 py-1.5 rounded-xl transition-all ${
                      postureTab === "sleeping" ? "bg-rose-500 text-white shadow-xs" : "text-gray-600 dark:text-rose-300 hover:text-rose-600"
                    }`}
                  >
                    Rest & Sleep
                  </button>
                  <button
                    onClick={() => setPostureTab("lifting")}
                    className={`px-3 py-1.5 rounded-xl transition-all ${
                      postureTab === "lifting" ? "bg-rose-500 text-white shadow-xs" : "text-gray-600 dark:text-rose-300 hover:text-rose-600"
                    }`}
                  >
                    Safe Bending & Lifting
                  </button>
                </div>
              </div>

              {/* Tab Contents */}
              {(() => {
                const currentTabErgo = postureData.ergonomics[postureTab];
                const tipBg =
                  postureTab === "standing"
                    ? "bg-rose-50/60 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/40 text-rose-700 dark:text-rose-300"
                    : postureTab === "sitting"
                    ? "bg-purple-50/60 dark:bg-purple-950/30 border-purple-100 dark:border-purple-900/40 text-purple-700 dark:text-purple-300"
                    : postureTab === "sleeping"
                    ? "bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-300"
                    : "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300";

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div className="space-y-2.5 text-xs">
                      <h4 className="font-bold text-sm text-gray-900 dark:text-rose-100">
                        {currentTabErgo.title}
                      </h4>
                      <p className="text-gray-600 dark:text-rose-200/80 leading-relaxed">
                        {currentTabErgo.description}
                      </p>
                      <div className="space-y-1.5 pt-1">
                        {currentTabErgo.checklist.map((item, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center gap-2 font-medium ${
                              item.type === "warning"
                                ? "text-amber-700 dark:text-amber-300"
                                : "text-emerald-700 dark:text-emerald-300"
                            }`}
                          >
                            {item.type === "warning" ? (
                              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            )}
                            <span>{item.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={`p-4 rounded-2xl border text-xs space-y-2 ${tipBg}`}>
                      <span className="font-bold text-[11px] block uppercase tracking-wider">
                        {currentTabErgo.clinicalTipTitle}
                      </span>
                      <p className="text-gray-700 dark:text-rose-200 leading-relaxed">
                        {currentTabErgo.clinicalTipText}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* 4. Interactive 1-Minute Posture Self-Check */}
            <div className="bg-purple-500/5 p-5 sm:p-6 rounded-3xl border border-purple-200/60 dark:border-purple-900/40 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-serif text-lg font-bold text-gray-900 dark:text-rose-100 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-purple-600" />
                    <span>Quick 4-Point Posture Check (Week {selectedWeek})</span>
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-rose-300/80 mt-0.5">
                    Stand up right now and check these 4 simple steps for immediate back relief.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-200 border border-purple-300 dark:border-purple-800">
                    Score: {Object.values(postureChecklist).filter(Boolean).length} / 4 Aligned
                  </span>
                </div>
              </div>

              {/* 4 Checkbox items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {postureData.checklistItems.map((item) => {
                  const isChecked = postureChecklist[item.id];
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        const next = { ...postureChecklist, [item.id]: !isChecked };
                        setPostureChecklist(next);
                        if (!isChecked && Object.values(next).filter(Boolean).length === 4) {
                          try {
                            confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
                          } catch {}
                          showToast("Perfect 100% Postural Alignment Achieved! Back strain reduced.");
                        }
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                        isChecked
                          ? "bg-purple-50 dark:bg-purple-950/50 border-purple-400 dark:border-purple-700 shadow-xs"
                          : "bg-white/90 dark:bg-black/30 border-gray-200 dark:border-purple-900/30 hover:border-purple-300"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all mt-0.5 shrink-0 ${
                        isChecked
                          ? "bg-purple-600 border-purple-600 text-white"
                          : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <div className="space-y-0.5">
                        <span className={`text-xs font-bold block ${isChecked ? "text-purple-900 dark:text-purple-200" : "text-gray-800 dark:text-gray-200"}`}>
                          {item.label}
                        </span>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400 block leading-tight">
                          {item.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {Object.values(postureChecklist).filter(Boolean).length === 4 && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-300 dark:border-emerald-800 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-200 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
                    <span className="font-bold">Excellent! Your pelvis and spine are aligned for optimal comfort & fetal positioning.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPostureChecklist({ chin: false, shoulders: false, pelvis: false, knees: false })}
                    className="text-[10px] underline hover:text-emerald-900 dark:hover:text-emerald-100 font-bold"
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>

            {/* 5. Recommended Exercises & Studio Deep-Link */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-2">
              <div className="md:col-span-4 relative rounded-3xl overflow-hidden border border-rose-100 dark:border-rose-900/40 shadow-sm">
                <img
                  src={prenatalYogaGuide}
                  alt="Prenatal Yoga and Posture Guide"
                  referrerPolicy="no-referrer"
                  className="w-full h-56 object-cover"
                />
                <div className="absolute inset-0 bg-black/40 p-4 flex flex-col justify-end text-white">
                  <span className="text-[10px] font-bold text-rose-300 uppercase tracking-widest">
                    Prenatal Movement Guide
                  </span>
                  <h4 className="font-serif text-lg font-bold mt-0.5">
                    Week {selectedWeek} Safe Alignment
                  </h4>
                </div>
              </div>

              <div className="md:col-span-8 space-y-3">
                <h4 className="text-sm font-bold text-gray-900 dark:text-rose-100 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>Gentle Posture & Movement Tips for Week {selectedWeek}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {detail.exerciseTips.map((tip, idx) => {
                    const isEven = idx % 2 === 0;
                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-2xl border flex items-start gap-2.5 text-xs font-medium transition-all ${
                          isEven
                            ? "bg-rose-50/70 dark:bg-rose-950/40 border-rose-200/80 dark:border-rose-900/40 text-gray-800 dark:text-rose-100"
                            : "bg-purple-50/70 dark:bg-purple-950/40 border-purple-200/80 dark:border-purple-900/40 text-gray-800 dark:text-purple-100"
                        }`}
                      >
                        <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${isEven ? "text-rose-500" : "text-purple-500"}`} />
                        <span className="leading-relaxed">{tip}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={() => setActivePage("yoga")}
                    className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2"
                  >
                    <Heart className="w-4 h-4" />
                    <span>Open BloomNest Yoga & Breathwork Studio</span>
                  </button>
                  <button
                    onClick={() => setActivePage("ai-assistant")}
                    className="px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40 font-bold text-xs hover:bg-rose-100 transition-all flex items-center gap-1.5"
                  >
                    <Brain className="w-4 h-4 text-rose-500" />
                    <span>Ask AI About Back & Hip Comfort</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* 4. SIDE BY SIDE WEEK COMPARISON SECTION */}
      {showComparison && (
        <div className="bg-purple-900/10 dark:bg-purple-950/40 p-6 rounded-3xl border border-purple-200 dark:border-purple-800/40 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-200/50 pb-3">
            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-bold text-sm">
              <Layers className="w-5 h-5 text-purple-600" />
              <span>Side-by-Side Week Comparison</span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-600 dark:text-purple-300">Compare Week {selectedWeek} with:</span>
              <select
                value={compareWeek}
                onChange={(e) => setCompareWeek(Number(e.target.value))}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1a1523] border border-purple-300 dark:border-purple-700 text-xs font-bold focus:outline-none"
              >
                {Array.from({ length: 40 }, (_, i) => i + 1).map((w) => (
                  <option key={w} value={w}>
                    Week {w} ({PREGNANCY_WEEKS_DATA[w - 1]?.babySize.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Week A */}
            <div className="bg-white dark:bg-[#1a1523] p-5 rounded-2xl border border-rose-100 dark:border-rose-900/40 space-y-3">
              <span className="px-3 py-1 bg-rose-500 text-white rounded-full text-xs font-bold">
                Week {selectedWeek}
              </span>
              <div className="flex items-center gap-4">
                <span className="text-5xl">{detail.babySize.emoji}</span>
                <div>
                  <h4 className="font-serif text-lg font-bold text-gray-900 dark:text-rose-100">
                    {detail.babySize.name}
                  </h4>
                  <p className="text-xs text-rose-600 dark:text-rose-400">
                    {detail.babySize.indianComparison}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                <div className="bg-rose-50/60 dark:bg-rose-950/30 p-2.5 rounded-xl">
                  <span className="text-gray-500 block text-[10px]">Length</span>
                  <strong className="text-rose-700 dark:text-rose-300">{detail.babySize.length}</strong>
                </div>
                <div className="bg-rose-50/60 dark:bg-rose-950/30 p-2.5 rounded-xl">
                  <span className="text-gray-500 block text-[10px]">Weight</span>
                  <strong className="text-rose-700 dark:text-rose-300">{detail.babySize.weight}</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-rose-100 dark:border-rose-900/30 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-500 block">Week {selectedWeek} Milestones</span>
                <ul className="text-xs space-y-1 text-gray-700 dark:text-rose-200">
                  {detail.milestones.map((m, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-rose-500 font-bold">•</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Week B */}
            <div className="bg-white dark:bg-[#1a1523] p-5 rounded-2xl border border-purple-100 dark:border-purple-900/40 space-y-3">
              <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-xs font-bold">
                Week {compareWeek}
              </span>
              <div className="flex items-center gap-4">
                <span className="text-5xl">{compareDetail.babySize.emoji}</span>
                <div>
                  <h4 className="font-serif text-lg font-bold text-gray-900 dark:text-rose-100">
                    {compareDetail.babySize.name}
                  </h4>
                  <p className="text-xs text-purple-600 dark:text-purple-400">
                    {compareDetail.babySize.indianComparison}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                <div className="bg-purple-50/60 dark:bg-purple-950/30 p-2.5 rounded-xl">
                  <span className="text-gray-500 block text-[10px]">Length</span>
                  <strong className="text-purple-700 dark:text-purple-300">{compareDetail.babySize.length}</strong>
                </div>
                <div className="bg-purple-50/60 dark:bg-purple-950/30 p-2.5 rounded-xl">
                  <span className="text-gray-500 block text-[10px]">Weight</span>
                  <strong className="text-purple-700 dark:text-purple-300">{compareDetail.babySize.weight}</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-purple-100 dark:border-purple-900/30 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-500 block">Week {compareWeek} Milestones</span>
                <ul className="text-xs space-y-1 text-gray-700 dark:text-purple-200">
                  {compareDetail.milestones.map((m, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-purple-500 font-bold">•</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. TRAJECTORY GROWTH CHARTS (RECHARTS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weight Curve */}
        <div className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-300 flex items-center gap-1.5">
              <Scale className="w-4 h-4" />
              <span>Estimated Fetal Weight Trajectory (g)</span>
            </h3>
            <span className="text-[10px] text-gray-400">40-Week Median Curve</span>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trajectoryData}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="week" tick={{ fontSize: 9 }} interval={4} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="weightGrams"
                  stroke="#ec4899"
                  fillOpacity={1}
                  fill="url(#colorWeight)"
                  name="Weight (grams)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Length Curve */}
        <div className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-300 flex items-center gap-1.5">
              <Move className="w-4 h-4" />
              <span>Crown-to-Heel Length Trajectory (cm)</span>
            </h3>
            <span className="text-[10px] text-gray-400">40-Week Median Curve</span>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trajectoryData}>
                <defs>
                  <linearGradient id="colorLength" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="week" tick={{ fontSize: 9 }} interval={4} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="lengthCm"
                  stroke="#8b5cf6"
                  fillOpacity={1}
                  fill="url(#colorLength)"
                  name="Length (cm)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
};

export default BabyDevelopmentPage;
