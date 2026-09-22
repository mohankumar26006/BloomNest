import React, { useState, useEffect } from "react";
import { apiFetch } from "../services/apiClient";
import { useApp } from "../context/AppContext";
import { DynamicLyricsViewer } from "../components/DynamicLyricsViewer";
import {
  Flower2,
  Music,
  Heart,
  Sparkles,
  Play,
  Pause,
  BookOpen,
  Apple,
  MessageCircle,
  Volume2,
  ShieldCheck,
  Sun,
  CheckCircle2,
  Share2,
  Zap,
} from "lucide-react";

interface RagaTrack {
  id: string;
  name: string;
  sanskritName: string;
  benefits: string;
  trimester: string;
  freq: number;
  timeOfDay: string;
}

const RAGA_TRACKS: RagaTrack[] = [
  {
    id: "yaman",
    name: "Raag Yaman (Peace & Calm)",
    sanskritName: "राग यमन",
    benefits: "Reduces maternal cortisol, promotes serene fetal brain cell development.",
    trimester: "Trimester 1 & All",
    freq: 432,
    timeOfDay: "Evening / Sunset",
  },
  {
    id: "bageshri",
    name: "Raag Bageshri (Deep Emotional Connection)",
    sanskritName: "राग बागेश्री",
    benefits: "Stimulates auditory nerve pathways and enhances mother-baby emotional resonance.",
    trimester: "Trimester 2",
    freq: 528,
    timeOfDay: "Night Time",
  },
  {
    id: "malkauns",
    name: "Raag Malkauns (Strength & Vitality)",
    sanskritName: "राग मालकौंस",
    benefits: "Boosts physical stamina, aids peaceful sleep, and prepares pelvic nerves.",
    trimester: "Trimester 3",
    freq: 396,
    timeOfDay: "Late Night / Dawn",
  },
  {
    id: "bhairavi",
    name: "Raag Bhairavi (Pure Joy & Harmony)",
    sanskritName: "राग भैरवी",
    benefits: "Imparts a sense of contentment, reduces anxiety, and fosters sweet dreams.",
    trimester: "All Trimesters",
    freq: 639,
    timeOfDay: "Early Morning",
  },
];

const GARBHA_SAMVAD_PROMPTS = [
  "Dearest little one, today the warm sunshine is bathing us. I am sending you all my warmth, safety, and endless love.",
  "Hello my precious baby, your heart is beating in harmony with mine. Together we are strong, serene, and blessed.",
  "My brave little seed, today I listened to beautiful melodies. As I feel peaceful, I know you are growing gently inside me.",
  "Dearest child, as you stretch and turn today, know that your family is eagerly awaiting your bright arrival with open arms.",
];

const STOTRA_MANTRAS = [
  {
    id: "garbha-raksha",
    title: "Sri GARBHARAKSHAMBIKAI MULLAIVANAM (Mullaivanam Nirkum Thaaye)",
    sanskrit: `முல்லைவனம் நிற்கும் தாயே
கர்பரக்ஷாம்பிகே எம்மை காத்தருள்வாயே
தீர்த்தக்கரை அழகு வாவி
திகழும் சிவன் வாமதேவனின் மேனியமர் தேவி
கேட்கின்ற வரம் யாவும் தருவாய்
தருவாய். . . வரம் யாவும் தருவாய். . .
எங்கும் பூக்கின்ற கர்பத்தை காத்தருள வா நீ
பூக்கின்ற கர்பத்தை காத்தருள வா நீ
போற்றுதலை ஏற்கின்ற தாயே
வேண்டும் பொருள்யாவும் வார்கின்ற ஸ்ரீசக்ர மாயே
ஏற்றமிகு வாழ்வை அருள்வாயே
எங்கள் எழிலார்ந்த மங்கள மகாதிவ்ய தாயே
எழிலார்ந்த மங்கள மகாதிவ்ய தாயே
அகிலம் வளர்கின்ற தாயே
எங்கும் அனைவர்க்கும் தாயாகி தயவுதரும் மாயே
முகிலில் இருக்கும் ஒரு குளிராய்
கருணை முழுவதும் பொழிகின்ற கருக்காவூர் தாயே
சந்தனக் காப்பினில் கோலம்
அழகு சதிராடும் பட்டினில் ஆடை அலங்காரம்
வந்தனம் தரிசனம் யோகம்
ஆடி வெள்ளியில் தாயுந்தன் அதிசயத் தோற்றம்
வளம் யாவும் தருகின்ற உருவாய்
புண்ய வாஜபேயம் போன்ற வேள்வியில் எழுவாய்
நனைகின்ற கருவிற்கு காப்பாய்
அன்று வேதிகைக்கருள் செய்ய வேண்டுதலை ஏற்றாய்
மழலைகள் தொழுகின்ற பாதம்
வேண்டும் மங்கையரின் கர்பத்தைக் காக்கின்ற சீலம்
அழகு முகம் ஆனந்தம் ஆகும்
வானின் அமரர்க்கு உன் தாழே சரண மலர் பாதம்
உற்சவத் தேரினில் ஏறி
வீதி ஊர்வலம் செய்கின்ற உலகிதன் தேவி
பற்பல வாத்தியம் முழங்க
அதில் பலவாறு ஆனந்தம் கொள்கின்ற வேணி
அன்னையின் ஸ்தோத்திரம் பாடும்
உள்ளம் அகிலத்தின் பாக்கியம் யாவும் கொண்டாடும்
சன்னதியில் வந்துன்னைத் தேடும்
அன்பர் சந்ததி வளர்ந்தோங்கும் சந்தோஷம் கூடும்
காத்தருள்வாயே. . காத்தருள்வாயே.. காத்தருள்வாயே. . .`,
    transliteration: "Mullaivanam nirkum thaaye / Garbharakshambige emmai kaatharulvaaye...",
    meaning: "O Divine Mother residing in Mullaivanam (Thirukkarugavur), Garbharakshambigai! O Goddess who protects my womb and growing baby, please grant all the boons we ask of you. O Mother of the Universe, protect the child growing within, and shower your infinite grace upon us.",
    audioUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Aum_Chant.ogg",
    youtubeVideoId: "bjqa9LJ6JmE",
    youtubeUrl: "https://www.youtube.com/watch?v=bjqa9LJ6JmE",
    audioToneFreq: 108,
    duration: "Full Authentic Chanting",
    reciter: "Padma Shri Smt. Sudha Ragunathan",
    dynamicLyrics: [
      { time: 14, text: "முல்லைவனம் நிற்கும் தாயே" },
      { time: 21, text: "கர்பரக்ஷாம்பிகே எம்மை காத்தருள்வாயே" },
      { time: 28, text: "தீர்த்தக்கரை அழகு வாவி" },
      { time: 35, text: "திகழும் சிவன் வாமதேவனின் மேனியமர் தேவி" },
      { time: 42, text: "கேட்கின்ற வரம் யாவும் தருவாய்" },
      { time: 49, text: "தருவாய். . . வரம் யாவும் தருவாய். . ." },
      { time: 56, text: "எங்கும் பூக்கின்ற கர்பத்தை காத்தருள வா நீ" },
      { time: 63, text: "பூக்கின்ற கர்பத்தை காத்தருள வா நீ" },
      { time: 70, text: "போற்றுதலை ஏற்கின்ற தாயே" },
      { time: 77, text: "வேண்டும் பொருள்யாவும் வார்கின்ற ஸ்ரீசக்ர மாயே" },
      { time: 84, text: "ஏற்றமிகு வாழ்வை அருள்வாயே" },
      { time: 91, text: "எங்கள் எழிலார்ந்த மங்கள மகாதிவ்ய தாயே" },
      { time: 98, text: "எழிலார்ந்த மங்கள மகாதிவ்ய தாயே" },
      { time: 105, text: "அகிலம் வளர்கின்ற தாயே" },
      { time: 112, text: "எங்கும் அனைவர்க்கும் தாயாகி தயவுதரும் மாயே" },
      { time: 119, text: "முகிலில் இருக்கும் ஒரு குளிராய்" },
      { time: 126, text: "கருணை முழுவதும் பொழிகின்ற கருக்காவூர் தாயே" },
      { time: 133, text: "சந்தனக் காப்பினில் கோலம்" },
      { time: 140, text: "அழகு சதிராடும் பட்டினில் ஆடை அலங்காரம்" },
      { time: 147, text: "வந்தனம் தரிசனம் யோகம்" },
      { time: 154, text: "ஆடி வெள்ளியில் தாயுந்தன் அதிசயத் தோற்றம்" },
      { time: 161, text: "வளம் யாவும் தருகின்ற உருவாய்" },
      { time: 168, text: "புண்ய வாஜபேயம் போன்ற வேள்வியில் எழுவாய்" },
      { time: 175, text: "நனைகின்ற கருவிற்கு காப்பாய்" },
      { time: 182, text: "அன்று வேதிகைக்கருள் செய்ய வேண்டுதலை ஏற்றாய்" },
      { time: 189, text: "மழலைகள் தொழுகின்ற பாதம்" },
      { time: 196, text: "வேண்டும் மங்கையரின் கர்பத்தைக் காக்கின்ற சீலம்" },
      { time: 203, text: "அழகு முகம் ஆனந்தம் ஆகும்" },
      { time: 210, text: "வானின் அமரர்க்கு உன் தாழே சரண மலர் பாதம்" },
      { time: 217, text: "உற்சவத் தேரினில் ஏறி" },
      { time: 224, text: "வீதி ஊர்வலம் செய்கின்ற உலகிதன் தேவி" },
      { time: 231, text: "பற்பல வாத்தியம் முழங்க" },
      { time: 238, text: "அதில் பலவாறு ஆனந்தம் கொள்கின்ற வேணி" },
      { time: 245, text: "அன்னையின் ஸ்தோத்திரம் பாடும்" },
      { time: 252, text: "உள்ளம் அகிலத்தின் பாக்கியம் யாவும் கொண்டாடும்" },
      { time: 259, text: "சன்னதியில் வந்துன்னைத் தேடும்" },
      { time: 266, text: "அன்பர் சந்ததி வளர்ந்தோங்கும் சந்தோஷம் கூடும்" },
      { time: 273, text: "காத்தருள்வாயே. . காத்தருள்வாயே.. காத்தருள்வாயே. . ." },
    ]
  },
  {
    id: "gayatri",
    title: "Gayatri Mantra for Fetal Intelligence",
    sanskrit: "ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥",
    transliteration: "Om Bhur Bhuvah Svah, Tat Savitur Varenyam, Bhargo Devasya Dhimahi, Dhiyo Yo Nah Prachodayat.",
    meaning: "May the supreme divine light illuminate the intellect, clarity, wisdom, and spirit of my baby.",
    audioUrl: "https://upload.wikimedia.org/wikipedia/commons/2/23/Gayatri_Mantra.ogg",
    youtubeVideoId: "EMI5aX-Y3jE",
    youtubeUrl: "https://www.youtube.com/watch?v=EMI5aX-Y3jE",
    audioToneFreq: 136.1,
    duration: "Authentic 108 Chants",
    reciter: "Authentic Traditional Sanskrit Chanting Choir",
  },
  {
    id: "santana-gopala",
    title: "Santana Gopala Mantra",
    sanskrit: "ॐ देवकीसुत गोविंद वासुदेव जगत्पते। देहि मे तनयं कृष्ण त्वामहं शरणं गतः॥",
    transliteration: "Om Devakisuta Govinda Vasudeva Jagatpate, Dehi Me Tanayam Krishna Tvam Aham Sharanam Gatah.",
    meaning: "O Lord Krishna, son of Devaki and protector of all worlds, bless our home with a healthy, wise, and joyful child.",
    audioUrl: "https://upload.wikimedia.org/wikipedia/commons/d/df/Om_chanting.ogg",
    youtubeVideoId: "EMI5aX-Y3jE",
    youtubeUrl: "https://www.youtube.com/watch?v=EMI5aX-Y3jE",
    audioToneFreq: 144,
    duration: "Traditional Rendition",
    reciter: "Authentic Ashram Temple Chanting",
  },
  {
    id: "maha-mrityunjaya",
    title: "Maha Mrityunjaya Divine Shield",
    sanskrit: "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय माऽमृतात्॥",
    transliteration: "Om Tryambakam Yajamahe Sugandhim Pushti-Vardhanam, Urvarukamiva Bandhanan Mrityor Mukshiya Ma-Amritat.",
    meaning: "We worship the Three-Eyed Lord who nourishes all beings. May He liberate us and grant supreme maternal health, longevity, and vitality.",
    audioUrl: "https://upload.wikimedia.org/wikipedia/commons/1/18/Tibetan_singing_bowl.ogg",
    youtubeVideoId: "EMI5aX-Y3jE",
    youtubeUrl: "https://www.youtube.com/watch?v=EMI5aX-Y3jE",
    audioToneFreq: 128,
    duration: "Acoustic Resonance",
    reciter: "Authentic Vedic Resonance Chanting",
  },
];

const SATTVIC_FOODS = [
  { id: "saffron", name: "Saffron A2 Milk", benefits: "Rich in calcium and calming bioactive peptides for night sleep." },
  { id: "almonds", name: "Soaked Almonds & Walnuts", benefits: "High DHA and Vitamin E for optimal fetal brain maturation." },
  { id: "coconut", name: "Fresh Tender Coconut Water", benefits: "Electrolyte balance and natural hydration for amniotic fluid." },
  { id: "ghee", name: "Ghee & Dates Concoction", benefits: "Natural stamina building and iron absorption." },
];

// Global Web Audio Context singleton to satisfy browser user gesture requirements
let globalAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!globalAudioCtx) {
    globalAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (globalAudioCtx.state === "suspended") {
    globalAudioCtx.resume().catch((e) => console.warn("AudioContext resume error:", e));
  }
  return globalAudioCtx;
}

export const GarbhaWellnessPage: React.FC = () => {
  const { showToast, user, t } = useApp();

  // Raga State
  const [activeRaga, setActiveRaga] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Stotra Audio State
  const [activeStotraId, setActiveStotraId] = useState<string | null>(null);
  const [isPlayingStotra, setIsPlayingStotra] = useState(false);
  const [activeYoutubeEmbedId, setActiveYoutubeEmbedId] = useState<string | null>(null);
  const [chantCount, setChantCount] = useState<number>(0);
  const [chantLoopMode, setChantLoopMode] = useState<"1x" | "21x" | "108x" | "loop">("21x");
  const [stotraVolume, setStotraVolume] = useState<number>(0.9);
  const [audioMode, setAudioMode] = useState<"mantra-voice" | "acoustic-drone">("mantra-voice");
  const [completedRituals, setCompletedRituals] = useState<Record<string, boolean>>({
    music: false,
    samvad: false,
    story: false,
    mantra: false,
    sattvic: false,
  });

  // AI Story Generator State
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [generatedStory, setGeneratedStory] = useState<string | null>(null);
  const [storyTheme, setStoryTheme] = useState<string>("");
  
  // Samvad State
  const [samvadIndex, setSamvadIndex] = useState<number>(0);
  const [spokenSamvad, setSpokenSamvad] = useState<boolean>(false);

  const ragaNodesRef = React.useRef<{ osc1?: OscillatorNode; osc2?: OscillatorNode; gain?: GainNode }>({});
  const stotraNodesRef = React.useRef<{ oscOm?: OscillatorNode; oscHarmonic?: OscillatorNode; gain?: GainNode }>({});
  const playingRef = React.useRef(false); // Prevent SpeechSynthesis loop race condition

  // Clean up all audio and speech when leaving the page
  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  // Stop all active sound
  const stopAllAudio = () => {
    playingRef.current = false;
    // Stop Raga synth
    if (ragaNodesRef.current.osc1) {
      try { ragaNodesRef.current.osc1.stop(); } catch (e) {}
    }
    if (ragaNodesRef.current.osc2) {
      try { ragaNodesRef.current.osc2.stop(); } catch (e) {}
    }
    ragaNodesRef.current = {};

    // Stop Stotra synth
    if (stotraNodesRef.current.oscOm) {
      try { stotraNodesRef.current.oscOm.stop(); } catch (e) {}
    }
    if (stotraNodesRef.current.oscHarmonic) {
      try { stotraNodesRef.current.oscHarmonic.stop(); } catch (e) {}
    }
    stotraNodesRef.current = {};

    // Stop Speech
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setIsPlayingAudio(false);
    setActiveRaga(null);
    setIsPlayingStotra(false);
    setActiveStotraId(null);
  };

  // Speaker Test Sound
  const playTestSpeakerSound = () => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(528, ctx.currentTime); // 528 Hz Healing tone
      gain.gain.setValueAtTime(stotraVolume * 0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);

      showToast("Playing 528Hz Healing Tone test! Verify your speaker volume.");
    } catch (e) {
      console.error("Test sound error:", e);
    }
  };

  // Play Classical Raag Acoustic Drone
  const startRagaSynth = (ragaId: string) => {
    stopAllAudio();

    const selectedRaga = RAGA_TRACKS.find((r) => r.id === ragaId);
    const baseFreq = selectedRaga ? selectedRaga.freq : 432;

    try {
      const ctx = getAudioContext();
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(stotraVolume * 0.25, ctx.currentTime);

      // Drone 1: Root Tanpura tone
      const osc1 = ctx.createOscillator();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(baseFreq / 2, ctx.currentTime);

      // Drone 2: Harmonious Fifth/Octave tone
      const osc2 = ctx.createOscillator();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(baseFreq * 1.5, ctx.currentTime);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();

      ragaNodesRef.current = { osc1, osc2, gain };
      setActiveRaga(ragaId);
      setIsPlayingAudio(true);
      setCompletedRituals((prev) => ({ ...prev, music: true }));
      showToast(`Playing ${selectedRaga?.name || "Garbha Raga"} at ${baseFreq}Hz`);
    } catch (e) {
      console.error("Raga synth error", e);
      showToast("Unable to start audio context. Please check browser sound permissions.");
    }
  };

  // Play Vedic Mantra Sound
  const startStotraChant = (stotraId: string) => {
    stopAllAudio();

    const selectedStotra = STOTRA_MANTRAS.find((s) => s.id === stotraId);
    if (!selectedStotra) return;

    try {
      const ctx = getAudioContext();

      // 1. Web Audio API Om & Temple Bell Acoustic Background
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(stotraVolume * 0.2, ctx.currentTime);

      const oscOm = ctx.createOscillator();
      oscOm.type = "sine";
      oscOm.frequency.setValueAtTime(selectedStotra.audioToneFreq, ctx.currentTime);

      const oscHarmonic = ctx.createOscillator();
      oscHarmonic.type = "triangle";
      oscHarmonic.frequency.setValueAtTime(selectedStotra.audioToneFreq * 2, ctx.currentTime);

      oscOm.connect(gain);
      oscHarmonic.connect(gain);
      gain.connect(ctx.destination);

      oscOm.start();
      oscHarmonic.start();
      stotraNodesRef.current = { oscOm, oscHarmonic, gain };
      playingRef.current = true;

      // 2. Clear Sanskrit Speech / Vocal Chanting
      if (audioMode === "mantra-voice" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();

        const textToChant = `${selectedStotra.sanskrit}. ${selectedStotra.transliteration}`;
        const utterance = new SpeechSynthesisUtterance(textToChant);
        
        // Find best Hindi/Sanskrit/Indian English voice if available
        const voices = window.speechSynthesis.getVoices();
        const hindiVoice = voices.find(
          (v) => v.lang.includes("hi") || v.lang.includes("ta") || v.name.toLowerCase().includes("india")
        );
        if (hindiVoice) {
          utterance.voice = hindiVoice;
        }

        utterance.rate = 0.75; // Calm, meditative chanting speed
        utterance.pitch = 0.9;  // Deep, soothing voice pitch
        utterance.volume = stotraVolume;

        utterance.onend = () => {
          if (!playingRef.current) return; // Prevent race condition when navigating away
          setChantCount((prev) => {
            const nextCount = prev + 1;
            const target = chantLoopMode === "21x" ? 21 : chantLoopMode === "108x" ? 108 : 1;
            if (chantLoopMode === "loop" || nextCount < target) {
              // Re-chant next cycle
              setTimeout(() => {
                if ("speechSynthesis" in window) {
                  window.speechSynthesis.speak(utterance);
                }
              }, 400);
              return nextCount;
            } else {
              stopAllAudio();
              showToast(`Completed ${target} chant repetitions for ${selectedStotra.title}!`);
              return 0;
            }
          });
        };

        utterance.onerror = (err) => {
          console.warn("Speech synthesis error, acoustic Om drone continues:", err);
        };

        window.speechSynthesis.speak(utterance);
      }

      setActiveStotraId(stotraId);
      setIsPlayingStotra(true);
      setCompletedRituals((prev) => ({ ...prev, mantra: true }));
      showToast(`Chanting ${selectedStotra.title}`);
    } catch (e) {
      console.error("Stotra audio error:", e);
    }
  };

  const toggleRagaPlay = (ragaId: string) => {
    if (activeRaga === ragaId && isPlayingAudio) {
      stopAllAudio();
    } else {
      startRagaSynth(ragaId);
    }
  };

  const toggleStotraPlay = (stotraId: string) => {
    if (activeStotraId === stotraId && isPlayingStotra) {
      stopAllAudio();
    } else {
      startStotraChant(stotraId);
    }
  };

  const handleCompleteSamvad = () => {
    setSpokenSamvad(true);
    setCompletedRituals((prev) => ({ ...prev, samvad: true }));
    showToast("Garbha Samvad completed! Your baby feels your peaceful bond.");
  };

  const handleGenerateStory = async () => {
    setIsGeneratingStory(true);
    try {
      const response = await apiFetch("/api/ai-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userWeek: user.currentWeek,
          trimester: user.trimester,
          language: user.language,
          theme: storyTheme,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate story");

      const data = await response.json();
      setGeneratedStory(data.story);
      showToast("A beautiful new story has been created for your baby!");
    } catch (error) {
      console.error(error);
      showToast("Oops, the AI storyteller needs a moment to rest. Try again shortly!");
    } finally {
      setIsGeneratingStory(false);
    }
  };

  const toggleRitual = (key: string, name: string) => {
    setCompletedRituals((prev) => {
      const nextVal = !prev[key];
      if (nextVal) showToast(`Completed daily Garbha ritual: ${name}!`);
      return { ...prev, [key]: nextVal };
    });
  };

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="bg-white dark:bg-[#1a1523] p-6 sm:p-8 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-300 text-xs font-bold uppercase tracking-wider">
            <Flower2 className="w-4 h-4 text-rose-500" />
            <span>{t("ayurvedicMindfulWombCare")}</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-gray-900 dark:text-rose-100">
            {t("garbhaSanskarMaternalWellness")}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-rose-300 max-w-2xl leading-relaxed">
            {t("garbhaSanskarDesc")}
          </p>
        </div>

        <div className="bg-pink-600 text-white p-5 rounded-2xl shadow-sm shrink-0 flex flex-col justify-between w-full md:w-64">
          <div className="text-xs uppercase font-bold text-rose-100 flex items-center justify-between">
            <span>{t("dailySanskarScore")}</span>
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div className="font-serif text-3xl font-bold mt-2">
            {Object.values(completedRituals).filter(Boolean).length} / 5 {t("done")}
          </div>
          <div className="w-full bg-white/30 h-2 rounded-full overflow-hidden mt-3">
            <div
              className="bg-amber-300 h-full transition-all duration-500"
              style={{
                width: `${(Object.values(completedRituals).filter(Boolean).length / 5) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* 1. Garbha Samvad (Baby Bonding Talk) */}
      <div className="bg-white dark:bg-[#1a1523] p-6 sm:p-8 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-100 dark:border-rose-900/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-600 dark:text-rose-300 shrink-0">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-gray-900 dark:text-rose-100">
                {t("garbhaSamvadTitle")}
              </h2>
              <p className="text-xs text-gray-500 dark:text-rose-300">
                {t("garbhaSamvadDesc", { week: user.currentWeek })}
              </p>
            </div>
          </div>

          <button
            onClick={() => setSamvadIndex((prev) => (prev + 1) % GARBHA_SAMVAD_PROMPTS.length)}
            className="px-4 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-200 rounded-full font-bold text-xs flex items-center gap-1.5 transition-all self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t("nextPrompt")}</span>
          </button>
        </div>

        <div className="bg-pink-50/60 dark:bg-purple-950/20 p-6 rounded-2xl border border-rose-100 dark:border-rose-900/30 space-y-4">
          <div className="text-xs font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1.5">
            <Volume2 className="w-4 h-4" />
            <span>{t("todaysGuidedSpeechPrompt")}</span>
          </div>

          <blockquote className="font-serif text-lg sm:text-xl italic text-gray-800 dark:text-rose-100 leading-relaxed">
            "{GARBHA_SAMVAD_PROMPTS[samvadIndex]}"
          </blockquote>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="text-xs text-gray-500 dark:text-rose-300">
              <em>{t("samvadTip")}</em>
            </div>

            <button
              onClick={handleCompleteSamvad}
              className={`px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-sm transition-all ${
                spokenSamvad
                  ? "bg-emerald-600 text-white"
                  : "bg-rose-500 hover:bg-rose-600 text-white"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{spokenSamvad ? t("samvadSpokenToday") : t("markSamvadCompleted")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1.5. AI Pregnancy Story Generator */}
      <div className="bg-white dark:bg-[#1a1523] p-6 sm:p-8 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-100 dark:border-rose-900/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-300 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-gray-900 dark:text-rose-100">
                AI Bedtime Storyteller
              </h2>
              <p className="text-xs text-gray-500 dark:text-rose-300">
                Generate a unique, personalized story to bond with your baby, tailored to Week {user.currentWeek}.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input 
              type="text" 
              value={storyTheme} 
              onChange={(e) => setStoryTheme(e.target.value)}
              placeholder="e.g. A magical ocean journey with a friendly dolphin"
              className="flex-1 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-400 dark:text-indigo-100"
            />
            <button
              onClick={handleGenerateStory}
              disabled={isGeneratingStory}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm transition-all"
            >
              {isGeneratingStory ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Weaving magic...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Story</span>
                </>
              )}
            </button>
          </div>

          {generatedStory && (
            <div className="bg-purple-50/60 dark:bg-purple-950/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 space-y-4 animate-in fade-in zoom-in duration-500">
              <div className="text-xs font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-indigo-100 dark:border-indigo-900/50 pb-2">
                <BookOpen className="w-4 h-4" />
                <span>Your Personalized Womb Story</span>
              </div>
              <div className="font-serif text-base sm:text-lg text-gray-800 dark:text-indigo-100 leading-relaxed whitespace-pre-line">
                {generatedStory}
              </div>
              
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => toggleRitual("story", "Bedtime Storytime")}
                  className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-sm transition-all ${
                    completedRituals.story
                      ? "bg-emerald-600 text-white"
                      : "bg-indigo-100 dark:bg-indigo-900/50 hover:bg-indigo-200 text-indigo-700 dark:text-indigo-300"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{completedRituals.story ? "Read to Baby Today" : "Mark as Read"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Garbha Music & Classical Ragas Player */}
      <div className="bg-white dark:bg-[#1a1523] p-6 sm:p-8 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-rose-100 dark:border-rose-900/30 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600 dark:purple-300 shrink-0">
            <Music className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-gray-900 dark:text-rose-100">
              {t("garbhaRagasTitle")}
            </h2>
            <p className="text-xs text-gray-500 dark:text-rose-300">
              {t("garbhaRagasDesc")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {RAGA_TRACKS.map((raga) => {
            const isThisPlaying = activeRaga === raga.id && isPlayingAudio;
            return (
              <div
                key={raga.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                  isThisPlaying
                    ? "bg-purple-50/80 dark:bg-purple-950/40 border-purple-400 dark:border-purple-600 shadow-md ring-2 ring-purple-500/20"
                    : "bg-gray-50/50 dark:bg-rose-950/20 border-gray-100 dark:border-rose-900/30 hover:border-purple-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 dark:text-rose-100 text-sm">{t(`raga_${raga.id}_name`) || raga.name}</h3>
                      <span className="text-xs font-semibold text-purple-600 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/50 px-2.5 py-0.5 rounded-full">
                        {raga.sanskritName}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-rose-300 mt-1">{t(`raga_${raga.id}_benefits`) || raga.benefits}</p>
                  </div>

                  <button
                    onClick={() => toggleRagaPlay(raga.id)}
                    className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 shadow-md transition-all ${
                      isThisPlaying
                        ? "bg-purple-600 text-white animate-pulse"
                        : "bg-rose-500 hover:bg-rose-600 text-white"
                    }`}
                  >
                    {isThisPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500 dark:text-rose-300 border-t border-black/5 dark:border-white/5 pt-3">
                  <span>{t("idealLabel")}: {raga.trimester}</span>
                  <span>{raga.timeOfDay}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Vedic Stotras & Daily Mantras */}
      <div className="bg-white dark:bg-[#1a1523] p-6 sm:p-8 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-rose-100 dark:border-rose-900/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-300 shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-gray-900 dark:text-rose-100">
                {t("vedicGarbhaStotras")}
              </h2>
              <p className="text-xs text-gray-500 dark:text-rose-300">
                {t("vedicGarbhaStotrasDesc")}
              </p>
            </div>
          </div>
          
          {/* Restored Audio Settings Controls */}
          <div className="flex flex-wrap items-center gap-3 bg-gray-50 dark:bg-[#221c2e] p-3 rounded-xl border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={stotraVolume}
                onChange={(e) => setStotraVolume(parseFloat(e.target.value))}
                className="w-20 accent-amber-500"
                title="Volume"
              />
            </div>
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>
            <select
              value={audioMode}
              onChange={(e) => setAudioMode(e.target.value as "mantra-voice" | "acoustic-drone")}
              className="bg-white dark:bg-[#1a1523] border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400 dark:text-rose-200"
            >
              <option value="mantra-voice">Vocal Mantra</option>
              <option value="acoustic-drone">Acoustic Drone</option>
            </select>
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>
            <select
              value={chantLoopMode}
              onChange={(e) => setChantLoopMode(e.target.value as any)}
              className="bg-white dark:bg-[#1a1523] border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400 dark:text-rose-200"
            >
              <option value="1x">1x Chant</option>
              <option value="21x">21x Chants</option>
              <option value="108x">108x (Mala)</option>
              <option value="loop">Loop</option>
            </select>
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>
            <button
              onClick={playTestSpeakerSound}
              className="px-3 py-1.5 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-[11px] font-bold rounded-lg transition-all"
            >
              Test Sound
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {STOTRA_MANTRAS.map((stotra) => {
            const isVideoActive = activeYoutubeEmbedId === stotra.id;

            return (
              <div
                key={stotra.id}
                className={`p-5 rounded-2xl border transition-all space-y-4 ${
                  isVideoActive
                    ? "bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 shadow-md ring-2 ring-amber-500/20"
                    : "bg-amber-50/40 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30 hover:border-amber-200"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-serif font-bold text-gray-900 dark:text-rose-100 text-base flex items-center gap-2">
                      <span>{t(`stotra_${stotra.id.replace(/-/g, '_')}_title`) || stotra.title}</span>
                      {isVideoActive && (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-bold px-2.5 py-0.5 rounded-full animate-pulse border border-red-300/40">
                          <Play className="w-3 h-3 fill-current" /> {t("playingAuthenticChanting")}
                        </span>
                      )}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                    {/* Authentic Play / Video Button */}
                    <button
                      onClick={() =>
                        setActiveYoutubeEmbedId((prev) => (prev === stotra.id ? null : stotra.id))
                      }
                      className={`text-xs px-4 py-2 rounded-full font-bold transition-all flex items-center gap-2 shadow-sm ${
                        isVideoActive
                          ? "bg-red-600 text-white shadow-md ring-2 ring-red-400/40"
                          : "bg-red-500 hover:bg-red-600 text-white"
                      }`}
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>{isVideoActive ? t("closeAuthenticPlayer") : t("playAuthenticChanting")}</span>
                    </button>

                    {/* External YouTube Link */}
                    {stotra.youtubeUrl && (
                      <a
                        href={stotra.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-3 py-2 rounded-full font-bold bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 text-amber-900 dark:text-amber-200 border border-amber-200/60 transition-all flex items-center gap-1"
                        title="Open on YouTube app"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>{t("youtubeLink")} ↗</span>
                      </a>
                    )}

                    {/* Mark Chanted */}
                    <button
                      onClick={() => toggleRitual("mantra", stotra.title)}
                      className={`text-xs px-3.5 py-2 rounded-full font-bold transition-all flex items-center gap-1.5 ${
                        completedRituals.mantra
                          ? "bg-emerald-600 text-white"
                          : "bg-amber-200/80 dark:bg-amber-900/60 hover:bg-amber-300 text-amber-950 dark:text-amber-100"
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{completedRituals.mantra ? t("chantedToday") : t("markChanted")}</span>
                    </button>
                  </div>
                </div>

                {/* Dynamic Lyrics Viewer OR Static Fallback */}
                {isVideoActive && stotra.dynamicLyrics && stotra.youtubeVideoId ? (
                  <div className="animate-in fade-in zoom-in duration-500">
                    <div className="flex items-center justify-between text-xs text-rose-600 dark:text-rose-400 font-bold mb-2 px-1">
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        <span>Dynamic Synchronized Lyrics</span>
                      </span>
                      <button onClick={() => setActiveYoutubeEmbedId(null)} className="hover:text-red-500">
                        {t("closePlayer")} ✖
                      </button>
                    </div>
                    <DynamicLyricsViewer 
                      youtubeVideoId={stotra.youtubeVideoId} 
                      lyrics={stotra.dynamicLyrics} 
                    />
                  </div>
                ) : (
                  <>
                    {/* Embedded Authentic YouTube Player Card (Static Fallback) */}
                    {isVideoActive && (
                      <div className="p-3 bg-black/95 rounded-2xl border border-red-500/40 shadow-xl space-y-2 animate-in fade-in duration-300">
                        <div className="flex items-center justify-between text-xs text-white font-bold px-1">
                          <span className="flex items-center gap-2 text-red-400">
                            <Play className="w-4 h-4 fill-red-500 text-red-500" />
                            <span>{t("authenticRecording")}: {t(`stotra_${stotra.id.replace(/-/g, '_')}_title`) || stotra.title}</span>
                          </span>
                          <a
                            href={stotra.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-amber-300 hover:underline flex items-center gap-1"
                          >
                            {t("openOnYoutube")} ↗
                          </a>
                        </div>

                        <div className="relative w-full overflow-hidden rounded-xl aspect-video bg-black shadow-inner">
                          <iframe
                            src={`https://www.youtube-nocookie.com/embed/${stotra.youtubeVideoId}?autoplay=1&rel=0&modestbranding=1`}
                            title={`Authentic ${stotra.title} Chanting`}
                            className="absolute top-0 left-0 w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                        </div>

                        <div className="text-[11px] text-gray-300 flex items-center justify-between px-1">
                          <span>{t("authenticChantingNote")}</span>
                          <button
                            onClick={() => setActiveYoutubeEmbedId(null)}
                            className="text-[11px] text-red-300 hover:text-white font-bold"
                          >
                            {t("closePlayer")} ✖
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Complete Continuous Song Lyrics */}
                    <div className="space-y-4 bg-amber-100/30 dark:bg-amber-950/30 p-5 rounded-2xl border border-amber-200/50 dark:border-amber-900/40">
                      <div className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider border-b border-amber-200/50 dark:border-amber-800/40 pb-2 flex items-center justify-between">
                        <span>{t("garbha_sanskar_original_script")}</span>
                        <span className="normal-case text-[11px] font-medium text-amber-800 dark:text-amber-300">
                          {stotra.duration}
                        </span>
                      </div>

                      {/* Full Original Script Lyrics */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300">
                          {t("garbha_sanskar_original_verses")}:
                        </span>
                        <p className="font-serif text-base sm:text-lg text-amber-950 dark:text-amber-100 font-semibold leading-relaxed whitespace-pre-line bg-amber-100/50 dark:bg-amber-900/30 p-3.5 rounded-xl border border-amber-200/60 dark:border-amber-800/40">
                          {stotra.sanskrit}
                        </p>
                      </div>

                      {/* Complete Phonetic Pronunciation */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300">
                          {t("garbha_sanskar_phonetic_pronunciation")}:
                        </span>
                        <p className="text-xs text-amber-900 dark:text-amber-200 font-medium italic whitespace-pre-line bg-amber-50/60 dark:bg-amber-950/40 p-3 rounded-lg border border-amber-200/40 dark:border-amber-900/30">
                          {stotra.transliteration}
                        </p>
                      </div>

                      {/* Complete English Translation / Meaning */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300">
                          {t("garbha_sanskar_full_meaning")}:
                        </span>
                        <p className="text-xs text-gray-700 dark:text-rose-200 leading-relaxed whitespace-pre-line bg-white/60 dark:bg-black/20 p-3 rounded-lg border border-amber-200/30 dark:border-amber-900/20">
                          {t(`stotra_${stotra.id.replace(/-/g, '_')}_meaning`) || stotra.meaning}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Sattvic Ayurvedic Nutrition */}
      <div className="bg-white dark:bg-[#1a1523] p-6 sm:p-8 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-rose-100 dark:border-rose-900/30 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-300 shrink-0">
            <Apple className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-gray-900 dark:text-rose-100">
              {t("garbha_sattvic_diet_essentials")}
            </h2>
            <p className="text-xs text-gray-500 dark:text-rose-300">
              {t("garbha_sattvic_diet_desc")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SATTVIC_FOODS.map((food, idx) => (
            <div
              key={idx}
              className="p-4 bg-emerald-50/30 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center gap-3">
                <h4 className="font-bold text-xs text-gray-900 dark:text-rose-100">{t(`food_${food.id}_name`) || food.name}</h4>
              </div>
              <p className="text-[11px] text-gray-600 dark:text-rose-300 leading-relaxed">{t(`food_${food.id}_benefits`) || food.benefits}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
