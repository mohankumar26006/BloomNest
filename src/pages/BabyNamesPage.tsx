import React, { useState } from "react";
import { apiFetch } from "../services/apiClient";
import { useApp } from "../context/AppContext";
import { BabyName } from "../types";
import {
  Card,
  Button,
  Badge,
  PageHeading,
  CardHeading,
  BodyText,
  Caption,
} from "../components/ui";
import {
  Sparkles,
  Heart,
  X,
  Bookmark,
  Copy,
  Check,
  Volume2,
  Share2,
  Wand2,
  Search,
  RefreshCw,
  Star,
  Users,
  Moon,
  Compass,
  ChevronRight,
  Flame,
} from "lucide-react";

// --- 27 VEDIC / TAMIL NAKSHATRAS DATA WITH AKSHARS (INITIAL SYLLABLES) ---
export interface NakshatraItem {
  id: number;
  name: string;
  tamil: string;
  rashi: string;
  tamilRashi: string;
  syllables: string[];
  tamilSyllables: string[];
}

export const NAKSHATRA_LIST: NakshatraItem[] = [
  { id: 1, name: "Ashwini", tamil: "அஸ்வினி", rashi: "Aries", tamilRashi: "மேஷம்", syllables: ["Chu", "Che", "Cho", "La"], tamilSyllables: ["சு", "சே", "சோ", "ல"] },
  { id: 2, name: "Bharani", tamil: "பரணி", rashi: "Aries", tamilRashi: "மேஷம்", syllables: ["Lee", "Lu", "Le", "Lo"], tamilSyllables: ["லி", "லு", "லே", "லோ"] },
  { id: 3, name: "Krittika", tamil: "கார்த்திகை", rashi: "Aries / Taurus", tamilRashi: "மேஷம் / ரிஷபம்", syllables: ["A", "Ee", "U", "Ea"], tamilSyllables: ["அ", "இ", "உ", "எ"] },
  { id: 4, name: "Rohini", tamil: "ரோகிணி", rashi: "Taurus", tamilRashi: "ரிஷபம்", syllables: ["O", "Va", "Vi", "Vu"], tamilSyllables: ["ஒ", "வ", "வி", "வு"] },
  { id: 5, name: "Mrigashira", tamil: "மிருகசீரிஷம்", rashi: "Taurus / Gemini", tamilRashi: "ரிஷபம் / மிதுனம்", syllables: ["Ve", "Vo", "Ka", "Kee"], tamilSyllables: ["வே", "வோ", "கா", "கி"] },
  { id: 6, name: "Ardra", tamil: "திருவாதிரை", rashi: "Gemini", tamilRashi: "மிதுனம்", syllables: ["Ku", "Gha", "Nga", "Chha"], tamilSyllables: ["கு", "க", "ஞ", "ச"] },
  { id: 7, name: "Punarvasu", tamil: "புனர்பூசம்", rashi: "Gemini / Cancer", tamilRashi: "மிதுனம் / கடகம்", syllables: ["Ke", "Ko", "Ha", "Hee"], tamilSyllables: ["கே", "கோ", "ஹ", "ஹி"] },
  { id: 8, name: "Pushya", tamil: "பூசம்", rashi: "Cancer", tamilRashi: "கடகம்", syllables: ["Hu", "He", "Ho", "Da"], tamilSyllables: ["ஹு", "ஹே", "ஹோ", "ட"] },
  { id: 9, name: "Ashlesha", tamil: "ஆயில்யம்", rashi: "Cancer", tamilRashi: "கடகம்", syllables: ["Dee", "Doo", "De", "Do"], tamilSyllables: ["டி", "டு", "டே", "டோ"] },
  { id: 10, name: "Magha", tamil: "மகம்", rashi: "Leo", tamilRashi: "சிம்மம்", syllables: ["Ma", "Mee", "Moo", "Me"], tamilSyllables: ["ம", "மி", "மு", "மே"] },
  { id: 11, name: "Purva Phalguni", tamil: "பூரம்", rashi: "Leo", tamilRashi: "சிம்மம்", syllables: ["Mo", "Ta", "Tee", "Too"], tamilSyllables: ["மோ", "டா", "டி", "டூ"] },
  { id: 12, name: "Uttara Phalguni", tamil: "உத்திரம்", rashi: "Leo / Virgo", tamilRashi: "சிம்மம் / கன்னி", syllables: ["Te", "To", "Pa", "Pee"], tamilSyllables: ["டே", "டோ", "ப", "பி"] },
  { id: 13, name: "Hasta", tamil: "ஹஸ்தம்", rashi: "Virgo", tamilRashi: "கன்னி", syllables: ["Pu", "Sha", "Na", "Tha"], tamilSyllables: ["பு", "ஷ", "ண", "ட"] },
  { id: 14, name: "Chitra", tamil: "சித்திரை", rashi: "Virgo / Libra", tamilRashi: "கன்னி / துலாம்", syllables: ["Pe", "Po", "Ra", "Ree"], tamilSyllables: ["பே", "போ", "ர", "ரி"] },
  { id: 15, name: "Swati", tamil: "சுவாதி", rashi: "Libra", tamilRashi: "துலாம்", syllables: ["Ru", "Re", "Ro", "Taa"], tamilSyllables: ["ரு", "ரே", "ரோ", "த"] },
  { id: 16, name: "Vishakha", tamil: "விசாகம்", rashi: "Libra / Scorpio", tamilRashi: "துலாம் / விருச்சிகம்", syllables: ["Tee", "Too", "Te", "To"], tamilSyllables: ["தி", "து", "தே", "தோ"] },
  { id: 17, name: "Anuradha", tamil: "அனுஷம்", rashi: "Scorpio", tamilRashi: "விருச்சிகம்", syllables: ["Na", "Nee", "Noo", "Ne"], tamilSyllables: ["ந", "நி", "நு", "நே"] },
  { id: 18, name: "Jyeshtha", tamil: "கேட்டை", rashi: "Scorpio", tamilRashi: "விருச்சிகம்", syllables: ["No", "Ya", "Yee", "Yoo"], tamilSyllables: ["நோ", "ய", "யி", "யு"] },
  { id: 19, name: "Moola", tamil: "மூலம்", rashi: "Sagittarius", tamilRashi: "தனுசு", syllables: ["Ye", "Yo", "Bha", "Bhee"], tamilSyllables: ["யே", "யோ", "ப", "பி"] },
  { id: 20, name: "Purva Ashadha", tamil: "பூராடம்", rashi: "Sagittarius", tamilRashi: "தனுசு", syllables: ["Bhu", "Dha", "Pha", "Dha"], tamilSyllables: ["பு", "த", "பா", "தா"] },
  { id: 21, name: "Uttara Ashadha", tamil: "உத்திராடம்", rashi: "Sagittarius / Capricorn", tamilRashi: "தனுசு / மகரம்", syllables: ["Bhe", "Bho", "Ja", "Jee"], tamilSyllables: ["பே", "போ", "ஜ", "ஜி"] },
  { id: 22, name: "Shravana", tamil: "திருவோணம்", rashi: "Capricorn", tamilRashi: "மகரம்", syllables: ["Ju", "Je", "Jo", "Gha"], tamilSyllables: ["ஜு", "ஜே", "ஜோ", "க"] },
  { id: 23, name: "Dhanishta", tamil: "அவிட்டம்", rashi: "Capricorn / Aquarius", tamilRashi: "மகரம் / கும்பம்", syllables: ["Ga", "Gee", "Gu", "Ge"], tamilSyllables: ["க", "கி", "கு", "கே"] },
  { id: 24, name: "Shatabhisha", tamil: "சதயம்", rashi: "Aquarius", tamilRashi: "கும்பம்", syllables: ["Go", "Sa", "See", "Soo"], tamilSyllables: ["கோ", "ச", "சி", "சு"] },
  { id: 25, name: "Purva Bhadrapada", tamil: "பூரட்டாதி", rashi: "Aquarius / Pisces", tamilRashi: "கும்பம் / மீனம்", syllables: ["Se", "So", "Dha", "Dhee"], tamilSyllables: ["சே", "சோ", "த", "தி"] },
  { id: 26, name: "Uttara Bhadrapada", tamil: "உத்திரட்டாதி", rashi: "Pisces", tamilRashi: "மீனம்", syllables: ["Du", "Shyam", "Jha", "Gna"], tamilSyllables: ["து", "ஷ", "ஜ்ஞ", "ஞ"] },
  { id: 27, name: "Revati", tamil: "ரேவதி", rashi: "Pisces", tamilRashi: "மீனம்", syllables: ["De", "Do", "Cha", "Chee"], tamilSyllables: ["தே", "தோ", "ச", "சி"] },
];

// --- 8 QUICK MEANING & THEME PRESETS ---
export interface QuickTheme {
  label: string;
  icon: string;
  themePrompt: string;
}

export const QUICK_THEMES: QuickTheme[] = [
  { label: "Nature & Bloom", icon: "🌿", themePrompt: "Nature, earth, blossoms, spring, fresh flowers, dawn" },
  { label: "2-Syllable Short", icon: "✨", themePrompt: "Short, modern, 2-syllable catchy and sweet name" },
  { label: "Spiritual & Divine", icon: "🕉️", themePrompt: "Divine, spiritual blessings, sacred grace, holy peace" },
  { label: "Radiant Light", icon: "💫", themePrompt: "Radiant light, sunshine, brightness, illuminating truth" },
  { label: "Royal & Noble", icon: "👑", themePrompt: "Royal, noble leader, dignity, crown, supreme honour" },
  { label: "Soft & Floral", icon: "🌸", themePrompt: "Tender lotus blossom, sweet fragrance, gentle grace" },
  { label: "Courage & Strength", icon: "💪", themePrompt: "Courageous warrior, fearless strength, brave protector" },
  { label: "Melody & Music", icon: "🎵", themePrompt: "Melodious rhythm, sweet harmony, songbird resonance" },
];

// --- 6 CURATED TRENDING STARTER NAMES ---
export const CURATED_TRENDING_NAMES: BabyName[] = [
  {
    id: "curated-1",
    name: "Aarav",
    script: "ஆரவ் · आरव",
    gender: "Boy",
    origin: "Modern",
    meaning: "Peaceful, wisdom, melodic sound, calm leader",
    pronunciation: "Ah-RAHV",
    luckyNumber: 1,
    isFavorite: false,
  },
  {
    id: "curated-2",
    name: "Ananya",
    script: "அனன்யா · अनन्या",
    gender: "Girl",
    origin: "Hindu",
    meaning: "Matchless, unique, divine incarnation of Goddess Lakshmi",
    pronunciation: "Ah-NAN-yah",
    luckyNumber: 6,
    isFavorite: false,
  },
  {
    id: "curated-3",
    name: "Vihaan",
    script: "விஹான் · विहान",
    gender: "Boy",
    origin: "Hindu",
    meaning: "Dawn of a new era, morning sunrays, radiant awakening",
    pronunciation: "Vee-HAHN",
    luckyNumber: 5,
    isFavorite: false,
  },
  {
    id: "curated-4",
    name: "Iniya",
    script: "இனியா",
    gender: "Girl",
    origin: "South Indian",
    meaning: "Sweet natured, endearing, full of kind-hearted grace and melody",
    pronunciation: "Ih-NEE-yah",
    luckyNumber: 3,
    isFavorite: false,
  },
  {
    id: "curated-5",
    name: "Zayan",
    script: "ஜயான் · زَيَّان",
    gender: "Boy",
    origin: "Muslim",
    meaning: "Graceful, hospitable, radiant beautifier of the world",
    pronunciation: "Zah-YAHN",
    luckyNumber: 7,
    isFavorite: false,
  },
  {
    id: "curated-6",
    name: "Mira",
    script: "மீரா · मीरा",
    gender: "Girl",
    origin: "Modern",
    meaning: "Ocean, prosperous, admirable peace and divine devotion",
    pronunciation: "MEE-rah",
    luckyNumber: 4,
    isFavorite: false,
  },
];

export const BabyNamesPage: React.FC = () => {
  const { babyNames, toggleFavoriteBabyName, showToast } = useApp();

  // Form Inputs
  const [startingLetter, setStartingLetter] = useState("");
  const [expectedMeaning, setExpectedMeaning] = useState("");
  const [selectedGender, setSelectedGender] = useState<string>("Girl");
  const [selectedOrigin, setSelectedOrigin] = useState<string>("South Indian");
  const [isGenerating, setIsGenerating] = useState(false);

  // Mom & Dad Syllable Blending States
  const [isBlendingOpen, setIsBlendingOpen] = useState(false);
  const [motherName, setMotherName] = useState("");
  const [fatherName, setFatherName] = useState("");

  // Nakshatra Finder Modal States
  const [showNakshatraModal, setShowNakshatraModal] = useState(false);
  const [nakshatraSearch, setNakshatraSearch] = useState("");
  const [selectedNakshatra, setSelectedNakshatra] = useState<NakshatraItem | null>(null);

  // Active View State & Shortlist Search
  const [activeTab, setActiveTab] = useState<"generator" | "swiper" | "favorites">("generator");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Local Lists (AI Generated + Curated Starter Names)
  const [aiGeneratedNames, setAiGeneratedNames] = useState<BabyName[]>([]);
  const [curatedList, setCuratedList] = useState<BabyName[]>(CURATED_TRENDING_NAMES);

  // Determine active display pool
  const activeDisplayNames = aiGeneratedNames.length > 0 ? aiGeneratedNames : curatedList;
  const sanitizedBabyNames = babyNames.filter((b) => !/^\d+$/.test(b.id));
  const combinedNameList = [...activeDisplayNames, ...sanitizedBabyNames];

  // Core AI Generator Function
  const handleGenerateNames = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsGenerating(true);

    try {
      const response = await apiFetch("/api/generate-baby-names", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gender: selectedGender !== "All" ? selectedGender : undefined,
          origin: selectedOrigin !== "All" ? selectedOrigin : undefined,
          startingLetter: startingLetter.trim() || undefined,
          meaningTheme: expectedMeaning.trim() || undefined,
          motherName: motherName.trim() || undefined,
          fatherName: fatherName.trim() || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.names && Array.isArray(data.names)) {
          const fallbackPrefix = (startingLetter || "A").toUpperCase();

          const generated: BabyName[] = data.names.map((n: any, idx: number) => {
            const rawName = n.name || n.Name || n.babyName || n.name_english || "Aarav";
            const rawMeaning = n.meaning || n.Meaning || expectedMeaning || "Radiant light and grace";
            const rawScript = n.script || n.Script || "";
            const rawPronounce = n.pronunciation || n.Pronunciation || rawName;

            return {
              id: `ai-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
              name: String(rawName),
              script: String(rawScript),
              gender: selectedGender !== "All" ? selectedGender : (n.gender || "Unisex"),
              origin: selectedOrigin !== "All" ? selectedOrigin : (n.origin || "Modern"),
              meaning: String(rawMeaning),
              pronunciation: String(rawPronounce),
              luckyNumber: n.luckyNumber || ((idx % 9) + 1),
              isFavorite: false,
            };
          });

          setAiGeneratedNames(generated);
          setCurrentIndex(0);
          showToast(`Generated 5 custom AI baby names! ✨`);
        }
      } else {
        showToast("AI Name generation request failed. Try again.");
      }
    } catch (err) {
      console.error("AI Generation error:", err);
      showToast("Could not generate AI names.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Synchronized Favorite handler across Context and Local Lists
  const handleToggleFavorite = (id: string) => {
    toggleFavoriteBabyName(id);
    setAiGeneratedNames((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isFavorite: !n.isFavorite } : n))
    );
    setCuratedList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isFavorite: !n.isFavorite } : n))
    );
    showToast("Updated your baby name shortlist! ❤️");
  };

  // Filter Engine for Swiper & Shortlist
  const filteredNames = combinedNameList.filter((n) => {
    const matchesSearch =
      !searchQuery.trim() ||
      n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.script && n.script.includes(searchQuery));

    return matchesSearch;
  });

  const favorites = combinedNameList.filter((n) => n.isFavorite);
  const currentCard = filteredNames[currentIndex % (filteredNames.length || 1)];

  const handleNextCard = () => {
    if (filteredNames.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % filteredNames.length);
    }
  };

  // Text-to-Speech Audio Pronunciation Trigger
  const handleSpeakName = (name: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(name);
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      utterance.lang = "en-IN";
      window.speechSynthesis.speak(utterance);
      showToast(`Pronouncing "${name}"... 🔊`);
    } else {
      showToast(`Speech synthesis not supported in this browser.`);
    }
  };

  const handleCopyName = (name: BabyName) => {
    navigator.clipboard.writeText(`${name.name} (${name.script || ""}) — ${name.meaning}`);
    setCopiedId(name.id);
    showToast(`Copied "${name.name}" to clipboard!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // WhatsApp Shortlist Share
  const handleShareShortlist = () => {
    if (favorites.length === 0) {
      showToast("No favorite names shortlisted yet. Bookmark names first!");
      return;
    }

    const nameListText = favorites
      .map((n, i) => `${i + 1}. ${n.name} (${n.script || ""}) — ${n.meaning} [Lucky No. ${n.luckyNumber || 7}]`)
      .join("\n");

    const fullShareText = `🌸 BloomNest AI Baby Name Shortlist:\n\n${nameListText}\n\nWhich one is your favorite? 💕`;

    if (navigator.share) {
      navigator
        .share({
          title: "BloomNest Baby Name Shortlist",
          text: fullShareText,
        })
        .catch(() => {});
    } else {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(fullShareText)}`;
      window.open(whatsappUrl, "_blank");
    }
  };

  // Nakshatra initial selection helper
  const handleSelectSyllable = (syllable: string, nakshatra: NakshatraItem) => {
    setStartingLetter(syllable);
    setSelectedNakshatra(nakshatra);
    setShowNakshatraModal(false);
    showToast(`Selected "${syllable}" (${nakshatra.name} · ${nakshatra.tamil}) as starting initial! 🌟`);
  };

  // Filtered Nakshatras for modal
  const filteredNakshatras = NAKSHATRA_LIST.filter((nak) => {
    const q = nakshatraSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      nak.name.toLowerCase().includes(q) ||
      nak.tamil.includes(q) ||
      nak.rashi.toLowerCase().includes(q) ||
      nak.tamilRashi.includes(q) ||
      nak.syllables.some((s) => s.toLowerCase().includes(q)) ||
      nak.tamilSyllables.some((ts) => ts.includes(q))
    );
  });

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-300 max-w-7xl mx-auto font-sans">
      
      {/* 1. HERO HEADER */}
      <Card variant="gradient" radius="3xl" className="p-6 sm:p-8 space-y-4 shadow-sm border border-rose-100 dark:border-rose-950/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="rose" size="sm" icon={<Sparkles className="w-3.5 h-3.5" />}>
                AI Personalized Baby Name Generator
              </Badge>
              <Badge variant="sage" size="sm" icon={<Flame className="w-3 h-3 text-amber-500" />}>
                Gemini AI Multi-Model
              </Badge>
              <Badge variant="purple" size="sm" icon={<Star className="w-3 h-3 text-purple-500" />}>
                27 Vedic Nakshatras
              </Badge>
            </div>

            <PageHeading>AI Baby Name Finder</PageHeading>

            <BodyText>
              Blend Mom & Dad's names, pick Vedic birth star (Nakshatra) initials, explore curated themes, and generate custom names with numerology!
            </BodyText>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-white/70 dark:bg-rose-950/40 p-1.5 rounded-2xl border border-rose-200 dark:border-rose-900/40 text-xs font-bold shrink-0">
            <button
              onClick={() => setActiveTab("generator")}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === "generator"
                  ? "bg-rose-500 text-white shadow-sm"
                  : "text-rose-700 dark:text-rose-200 hover:bg-rose-100"
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Generator</span>
            </button>

            <button
              onClick={() => setActiveTab("swiper")}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === "swiper"
                  ? "bg-rose-500 text-white shadow-sm"
                  : "text-rose-700 dark:text-rose-200 hover:bg-rose-100"
              }`}
            >
              <span>Swiper ({filteredNames.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("favorites")}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === "favorites"
                  ? "bg-rose-500 text-white shadow-sm"
                  : "text-rose-700 dark:text-rose-200 hover:bg-rose-100"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 fill-current" />
              <span>Shortlist ({favorites.length})</span>
            </button>
          </div>
        </div>
      </Card>

      {/* 2. PRIMARY GENERATOR FORM TAB */}
      {activeTab === "generator" && (
        <div className="space-y-8 max-w-4xl mx-auto">
          <Card variant="glass" radius="3xl" className="p-6 sm:p-8 space-y-6 shadow-xl border border-rose-200/80 dark:border-rose-900/40">
            <div className="border-b border-rose-100 dark:border-rose-900/40 pb-4 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="rose" size="sm" icon={<Wand2 className="w-3.5 h-3.5" />}>
                    Personalized Parameters
                  </Badge>
                  {selectedNakshatra && (
                    <Badge variant="purple" size="sm">
                      Nakshatra: {selectedNakshatra.name} ({selectedNakshatra.tamil})
                    </Badge>
                  )}
                </div>
              </div>
              <CardHeading text-2xl className="pt-1">Generate AI Baby Names</CardHeading>
              <Caption>Pick an initial, blend parent names, choose cultural roots, and select meaning themes.</Caption>
            </div>

            <form onSubmit={handleGenerateNames} className="space-y-5 text-xs">
              
              {/* Row 1: Starting Initial + Nakshatra Picker Button */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-gray-700 dark:text-rose-200 flex items-center gap-1.5">
                    <span>First Letter / Initial (Akshar)</span>
                    {selectedNakshatra && (
                      <span className="text-purple-600 dark:text-purple-400 font-semibold">
                        (From {selectedNakshatra.name} · {selectedNakshatra.tamil})
                      </span>
                    )}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowNakshatraModal(true)}
                    className="text-[11px] font-bold text-purple-600 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-100 flex items-center gap-1 transition-colors px-2 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800"
                  >
                    <Star className="w-3 h-3 fill-current text-amber-400" />
                    <span>⭐ Find by Nakshatra (நட்சத்திர எழுத்து)</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. A, R, Vi, O, Sh (or pick via Nakshatra Finder)"
                    value={startingLetter}
                    onChange={(e) => {
                      setStartingLetter(e.target.value);
                      if (!e.target.value) setSelectedNakshatra(null);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#120E18] border border-rose-200 dark:border-rose-900/50 text-xs font-medium text-gray-900 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                  {startingLetter && (
                    <button
                      type="button"
                      onClick={() => {
                        setStartingLetter("");
                        setSelectedNakshatra(null);
                      }}
                      className="p-2.5 rounded-xl text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50"
                      title="Clear"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Row 2: Expected Meaning + Quick Theme Pills */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-700 dark:text-rose-200 block">
                  Expected Meaning / Theme
                </label>
                <input
                  type="text"
                  placeholder="e.g. Light, Grace, Divine, Strength, Sweet Nature, Ocean"
                  value={expectedMeaning}
                  onChange={(e) => setExpectedMeaning(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#120E18] border border-rose-200 dark:border-rose-900/50 text-xs font-medium text-gray-900 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />

                {/* Quick Theme Pills */}
                <div className="pt-1">
                  <div className="text-[10px] uppercase tracking-wider font-extrabold text-gray-500 dark:text-rose-300 mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Quick Theme Shortcuts:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_THEMES.map((theme) => {
                      const isActive = expectedMeaning === theme.themePrompt;
                      return (
                        <button
                          key={theme.label}
                          type="button"
                          onClick={() => setExpectedMeaning(isActive ? "" : theme.themePrompt)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all flex items-center gap-1 border ${
                            isActive
                              ? "bg-rose-500 text-white border-rose-600 shadow-xs"
                              : "bg-white/80 dark:bg-rose-950/30 text-gray-700 dark:text-rose-200 border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-900/30"
                          }`}
                        >
                          <span>{theme.icon}</span>
                          <span>{theme.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Row 3: Mom & Dad Name Blending Section */}
              <div className="rounded-2xl border border-pink-200/80 dark:border-pink-900/50 bg-gradient-to-r from-pink-50/60 to-rose-50/40 dark:from-pink-950/20 dark:to-rose-950/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-300">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-pink-100 text-xs flex items-center gap-1.5">
                        <span>Mom & Dad Syllable Blending</span>
                        <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-900/60 text-pink-700 dark:text-pink-200">
                          Optional
                        </span>
                      </h4>
                      <p className="text-[10.5px] text-gray-600 dark:text-rose-300">
                        AI blends phonetic sounds from both parents (e.g. Priya + Rahul ➔ Riya, Prihan, Rahi)
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsBlendingOpen(!isBlendingOpen)}
                    className="text-xs font-bold text-pink-600 dark:text-pink-300 hover:text-pink-800 transition-colors"
                  >
                    {isBlendingOpen ? "Hide Inputs ▲" : "Add Parent Names ▼"}
                  </button>
                </div>

                {(isBlendingOpen || motherName || fatherName) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 animate-in fade-in duration-200">
                    <div>
                      <label className="text-[10.5px] font-bold text-gray-700 dark:text-rose-200 block mb-1">
                        👩 Mother's Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Priya, Deepa, Ananya"
                        value={motherName}
                        onChange={(e) => setMotherName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#120E18] border border-pink-200 dark:border-pink-900/50 text-xs font-medium text-gray-900 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-pink-400"
                      />
                    </div>

                    <div>
                      <label className="text-[10.5px] font-bold text-gray-700 dark:text-rose-200 block mb-1">
                        👨 Father's Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Rahul, Karthik, Vikram"
                        value={fatherName}
                        onChange={(e) => setFatherName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#120E18] border border-pink-200 dark:border-pink-900/50 text-xs font-medium text-gray-900 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-pink-400"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Row 4: Gender & Cultural Origin Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 dark:text-rose-200 block mb-1.5">
                    Gender Filter
                  </label>
                  <div className="flex items-center gap-1.5">
                    {["Girl", "Boy", "Unisex"].map((g) => (
                      <button
                        type="button"
                        key={g}
                        onClick={() => setSelectedGender(g)}
                        className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex-1 ${
                          selectedGender === g
                            ? "bg-rose-500 text-white shadow-xs"
                            : "bg-rose-50 dark:bg-rose-950/40 text-gray-700 dark:text-rose-200 hover:bg-rose-100"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-700 dark:text-rose-200 block mb-1.5">
                    Cultural Origin Filter
                  </label>
                  <div className="flex items-center gap-1 overflow-x-auto pb-1">
                    {["South Indian", "Hindu", "Muslim", "Modern", "All"].map((o) => (
                      <button
                        type="button"
                        key={o}
                        onClick={() => setSelectedOrigin(o)}
                        className={`px-3 py-2 rounded-xl font-bold text-xs transition-all shrink-0 ${
                          selectedOrigin === o
                            ? "bg-purple-600 text-white shadow-xs"
                            : "bg-purple-50 dark:bg-purple-950/40 text-gray-700 dark:text-rose-200 hover:bg-purple-100"
                        }`}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Generate Action Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full shadow-lg text-sm font-extrabold py-3.5"
                  isLoading={isGenerating}
                  leftIcon={<Wand2 className="w-5 h-5" />}
                >
                  {isGenerating ? "Gemini AI is Generating Names..." : "Generate Custom AI Baby Names ✨"}
                </Button>
              </div>
            </form>
          </Card>

          {/* DISPLAY AI GENERATED NAMES OR CURATED STARTER NAMES */}
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={aiGeneratedNames.length > 0 ? "rose" : "amber"} size="sm" icon={<Sparkles className="w-3.5 h-3.5" />}>
                  {aiGeneratedNames.length > 0 ? `AI Generated (${aiGeneratedNames.length})` : "⭐ Trending Curated Starters"}
                </Badge>
                <CardHeading text-xl>
                  {aiGeneratedNames.length > 0 ? "Your Custom AI Baby Names" : "Popular Modern Baby Names"}
                </CardHeading>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setActiveTab("swiper")}
              >
                View in Swiper 🃏
              </Button>
            </div>

            {aiGeneratedNames.length === 0 && (
              <p className="text-xs text-gray-600 dark:text-rose-300">
                Explore these top trending modern names, or hit <b>"Generate Custom AI Baby Names"</b> above to generate custom picks tailored to your exact initials and meanings.
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeDisplayNames.map((name) => (
                <Card
                  key={name.id}
                  variant="glass"
                  radius="2xl"
                  className="p-5 space-y-3 flex flex-col justify-between border border-rose-200/80 dark:border-rose-900/50 hover:shadow-md transition-shadow"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant="rose" size="sm">
                          {name.gender} · {name.origin}
                        </Badge>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                          🍀 Lucky {name.luckyNumber || 7}
                        </span>
                        {(motherName && fatherName && aiGeneratedNames.length > 0) && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/10 text-pink-600 dark:text-pink-300 border border-pink-500/20">
                            💕 Blended
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleSpeakName(name.name)}
                          className="p-1.5 rounded-full text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/40"
                          title="Pronounce 🔊"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleFavorite(name.id)}
                          className={`p-1.5 rounded-full transition-colors ${
                            name.isFavorite ? "text-rose-600 font-bold" : "text-gray-400 hover:text-rose-500"
                          }`}
                          title={name.isFavorite ? "Remove from Shortlist" : "Add to Shortlist"}
                        >
                          <Bookmark className={`w-4 h-4 ${name.isFavorite ? "fill-current" : ""}`} />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-serif font-bold text-2xl text-gray-900 dark:text-rose-100 flex items-baseline gap-2">
                      <span>{name.name}</span>
                      {name.script && <span className="text-base font-normal text-amber-600 dark:text-amber-300">({name.script})</span>}
                    </h3>
                    <p className="text-xs text-rose-600 dark:text-rose-300 italic">"{name.pronunciation}"</p>
                    <BodyText className="text-xs font-medium leading-relaxed">"{name.meaning}"</BodyText>
                  </div>

                  <div className="pt-3 border-t border-rose-100 dark:border-rose-900/40 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => handleToggleFavorite(name.id)}
                      className={`text-xs font-bold flex items-center gap-1 transition-colors ${
                        name.isFavorite ? "text-rose-600" : "text-gray-500 hover:text-rose-600"
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${name.isFavorite ? "fill-rose-600 text-rose-600" : ""}`} />
                      <span>{name.isFavorite ? "Shortlisted" : "Shortlist"}</span>
                    </button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyName(name)}
                      leftIcon={copiedId === name.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    >
                      {copiedId === name.id ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. SWIPER CARDS TAB */}
      {activeTab === "swiper" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab("generator")}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Change Parameters
            </Button>
            <Caption>Showing Cards ({filteredNames.length})</Caption>
          </div>

          <div className="flex flex-col items-center justify-center min-h-[440px]">
            {isGenerating ? (
              /* AI Loading State */
              <Card variant="flat" radius="3xl" className="p-8 text-center space-y-3 max-w-md animate-pulse">
                <div className="text-3xl animate-bounce">✨</div>
                <CardHeading text-lg>Gemini AI is Generating Custom Names...</CardHeading>
                <BodyText>Blending syllables, calculating numerology, and finding authentic meanings.</BodyText>
              </Card>
            ) : filteredNames.length === 0 ? (
              <Card variant="flat" radius="3xl" className="p-8 text-center space-y-3 max-w-md">
                <div className="text-3xl">🌸</div>
                <CardHeading text-lg>No Names Match Search</CardHeading>
                <BodyText>Try adjusting your search query or generate fresh AI names!</BodyText>
                <Button variant="primary" size="sm" onClick={() => setActiveTab("generator")}>
                  Go to Generator Form ✨
                </Button>
              </Card>
            ) : currentCard && (
              <div className="w-full max-w-md bg-gradient-to-tr from-rose-500 to-rose-600 rounded-[36px] text-white p-8 shadow-2xl relative space-y-6 text-center transform transition-all duration-300 hover:scale-[1.01]">
                
                {/* Card Top Pills */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-200" />
                      <span>{currentCard.gender} · {currentCard.origin}</span>
                    </span>
                    <span className="px-2.5 py-1 bg-amber-400/30 backdrop-blur-md rounded-full text-[11px] font-extrabold text-amber-100 border border-amber-300/30">
                      🍀 Lucky {currentCard.luckyNumber || 7}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Audio Pronunciation Button */}
                    <button
                      onClick={() => handleSpeakName(currentCard.name)}
                      className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                      title="Audio Pronunciation 🔊"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleToggleFavorite(currentCard.id)}
                      className={`p-2 rounded-full transition-colors ${
                        currentCard.isFavorite ? "bg-white text-rose-600" : "bg-white/20 text-white"
                      }`}
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                </div>

                {/* Main Name & Native Script */}
                <div className="space-y-2 py-4">
                  {currentCard.script && (
                    <div className="text-3xl font-serif tracking-widest text-amber-200 drop-shadow-xs">
                      {currentCard.script}
                    </div>
                  )}
                  <h2 className="font-serif text-4xl sm:text-5xl font-extrabold tracking-tight">
                    {currentCard.name}
                  </h2>
                  <p className="text-xs text-rose-100 italic">"{currentCard.pronunciation}"</p>
                </div>

                {/* Meaning */}
                <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl text-xs space-y-2 border border-white/20">
                  <div className="font-semibold text-rose-50 leading-relaxed text-xs sm:text-sm">
                    "{currentCard.meaning}"
                  </div>
                </div>

                {/* Interactive Swiper Action Buttons */}
                <div className="flex items-center justify-center gap-6 pt-2">
                  <button
                    onClick={handleNextCard}
                    className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center shadow-lg transition-transform active:scale-90"
                    title="Pass to Next"
                  >
                    <X className="w-6 h-6" />
                  </button>

                  <button
                    onClick={() => handleCopyName(currentCard)}
                    className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center shadow-lg transition-transform active:scale-90"
                    title="Copy Name"
                  >
                    {copiedId === currentCard.id ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>

                  <button
                    onClick={() => {
                      handleToggleFavorite(currentCard.id);
                      handleNextCard();
                    }}
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 ${
                      currentCard.isFavorite
                        ? "bg-amber-400 text-rose-950"
                        : "bg-white text-rose-600 hover:bg-rose-50"
                    }`}
                    title="Bookmark & Next"
                  >
                    <Heart className="w-6 h-6 fill-current" />
                  </button>
                </div>

              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. SHORTLIST & FAVORITES TAB */}
      {activeTab === "favorites" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-100 dark:border-rose-900/40 pb-3">
            <div>
              <CardHeading>Your Bookmarked Shortlist ({favorites.length})</CardHeading>
              <Caption>Share your favorite baby names with your partner, family, and loved ones.</Caption>
            </div>

            {favorites.length > 0 && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleShareShortlist}
                leftIcon={<Share2 className="w-4 h-4" />}
              >
                Share Shortlist (WhatsApp) 📲
              </Button>
            )}
          </div>

          {favorites.length === 0 ? (
            <Card variant="flat" radius="3xl" className="p-8 text-center space-y-3">
              <div className="text-3xl">❤️</div>
              <CardHeading text-lg>No Favorite Names Shortlisted Yet</CardHeading>
              <BodyText>Tap the heart or bookmark icon on any card in the Generator or Swiper tab to bookmark your top picks!</BodyText>
              <Button variant="primary" size="sm" onClick={() => setActiveTab("generator")}>
                Browse Baby Names ✨
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.map((name) => (
                <Card
                  key={name.id}
                  variant="glass"
                  radius="2xl"
                  className="p-5 space-y-3 flex flex-col justify-between border border-rose-200/80 dark:border-rose-900/40"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="rose" size="sm">
                          {name.gender} · {name.origin}
                        </Badge>
                        <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                          🍀 No. {name.luckyNumber || 7}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleSpeakName(name.name)}
                          className="p-1.5 rounded-full text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/40"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleFavorite(name.id)}
                          className="text-rose-500 hover:text-rose-700 p-1.5"
                        >
                          <Bookmark className="w-4 h-4 fill-current" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-serif font-bold text-2xl text-gray-900 dark:text-rose-100">
                      {name.name} {name.script && <span className="text-base font-normal text-amber-500 dark:text-amber-300">({name.script})</span>}
                    </h3>
                    <p className="text-xs text-rose-600 dark:text-rose-300 italic">"{name.pronunciation}"</p>
                    <BodyText className="text-xs leading-relaxed">"{name.meaning}"</BodyText>
                  </div>

                  <div className="pt-3 border-t border-rose-100 dark:border-rose-900/40 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => handleToggleFavorite(name.id)}
                      className="text-rose-600 hover:text-rose-800 text-xs font-semibold"
                    >
                      Remove from Shortlist
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyName(name)}
                      leftIcon={<Copy className="w-3.5 h-3.5" />}
                    >
                      Copy
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. NAKSHATRA INITIAL FINDER MODAL DIALOG */}
      {showNakshatraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#150F1E] rounded-3xl border border-rose-200 dark:border-rose-900/50 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-rose-100 dark:border-rose-900/40 flex items-center justify-between bg-gradient-to-r from-purple-500/10 via-rose-500/10 to-transparent">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300">
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                  <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-rose-100">
                    27 Vedic Nakshatras & Initial Sounds
                  </h3>
                </div>
                <p className="text-xs text-gray-600 dark:text-rose-300">
                  Select your baby's Janma Nakshatra (பிறந்த நட்சத்திரம்) or tap any initial syllable to auto-fill the starting letter!
                </p>
              </div>

              <button
                onClick={() => setShowNakshatraModal(false)}
                className="p-2 rounded-full text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Filter in Modal */}
            <div className="p-4 border-b border-rose-100 dark:border-rose-900/30 bg-rose-50/30 dark:bg-rose-950/20">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search Nakshatra / Rashi / Tamil (e.g. Rohini, அஸ்வினி, Leo, Vi...)"
                  value={nakshatraSearch}
                  onChange={(e) => setNakshatraSearch(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white dark:bg-[#1B1326] border border-rose-200 dark:border-rose-900/50 text-xs font-medium text-gray-900 dark:text-rose-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
            </div>

            {/* Nakshatras Grid */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredNakshatras.map((nak) => (
                  <div
                    key={nak.id}
                    className="p-3.5 rounded-2xl border border-purple-100 dark:border-purple-900/40 bg-purple-50/20 dark:bg-purple-950/20 hover:border-purple-300 dark:hover:border-purple-700 transition-all space-y-2.5"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-xs text-gray-900 dark:text-purple-100 flex items-center gap-1.5">
                          <span className="text-purple-600 dark:text-purple-400 font-extrabold">{nak.id}.</span>
                          <span>{nak.name}</span>
                          <span className="text-gray-500 dark:text-purple-300 font-normal">({nak.tamil})</span>
                        </div>
                        <div className="text-[10px] text-gray-500 dark:text-rose-300">
                          {nak.rashi} · {nak.tamilRashi}
                        </div>
                      </div>
                    </div>

                    {/* Syllable 1-Tap Pills */}
                    <div>
                      <div className="text-[9.5px] uppercase font-bold text-purple-700 dark:text-purple-300 mb-1">
                        Auspicous Initials (பாத எழுத்துக்கள்):
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {nak.syllables.map((syl, sIdx) => {
                          const tamSyl = nak.tamilSyllables[sIdx] || "";
                          return (
                            <button
                              key={syl}
                              type="button"
                              onClick={() => handleSelectSyllable(syl, nak)}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white dark:bg-[#201530] text-purple-700 dark:text-purple-200 border border-purple-200 dark:border-purple-800/60 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 transition-colors shadow-xs flex items-center gap-1"
                              title={`Choose initial "${syl}" (${tamSyl})`}
                            >
                              <span>{syl}</span>
                              {tamSyl && <span className="text-[10px] opacity-75">({tamSyl})</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredNakshatras.length === 0 && (
                <div className="p-8 text-center space-y-2 text-gray-500 dark:text-rose-300 text-xs">
                  <p>No Nakshatras found matching "{nakshatraSearch}".</p>
                  <button
                    onClick={() => setNakshatraSearch("")}
                    className="text-purple-600 dark:text-purple-400 font-bold underline"
                  >
                    Reset search filter
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 border-t border-rose-100 dark:border-rose-900/40 bg-gray-50/50 dark:bg-rose-950/20 flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-rose-300 text-[11px]">
                Showing {filteredNakshatras.length} of 27 Vedic Nakshatras
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowNakshatraModal(false)}
              >
                Close
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default BabyNamesPage;
