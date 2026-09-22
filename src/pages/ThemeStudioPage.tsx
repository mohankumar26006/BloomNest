import React from "react";
import { useApp } from "../context/AppContext";
import { UiThemeOption } from "../types";
import {
  Palette,
  Sparkles,
  CheckCircle2,
  Moon,
  Sun,
  Layout,
  Type,
  Eye,
  Sliders,
  Check,
  Zap,
} from "lucide-react";

import themeSereneRoseImg from "../assets/images/theme_serene_rose_1785563258722.jpg";
import themeMidnightLavenderImg from "../assets/images/theme_midnight_lavender_1785563273469.jpg";
import themeBotanicalSageImg from "../assets/images/theme_botanical_sage_1785563284313.jpg";
import themeSunsetCoralImg from "../assets/images/theme_sunset_coral_1785563295262.jpg";

import themeBlackRoseGoldUi from "../assets/images/black_rosegold_ui_concept_1785730350825.jpg";
import themeRoseGoldFetalArt from "../assets/images/rosegold_fetal_art_1785730367099.jpg";
import themeRoseGoldWellnessArt from "../assets/images/rosegold_wellness_art_1785730385219.jpg";
import pastelMotherArt from "../assets/images/pastel_mother_art_1785746033662.jpg";

interface ThemeOptionDetail {
  id: UiThemeOption;
  name: string;
  subtitle: string;
  description: string;
  image: string;
  typography: string;
  colorPalette: { name: string; hex: string }[];
  uxHighlights: string[];
  vibeTag: string;
  galleryImages?: string[];
}

export const ThemeStudioPage: React.FC = () => {
  const { currentTheme, setUiTheme, showToast } = useApp();

  const THEMES: ThemeOptionDetail[] = [
    {
      id: "soft-pastel-minimal",
      name: "1. Soft Pastel Minimal (Recommended)",
      subtitle: "Calm • Warm • Elegant • Premium",
      description:
        "Exact maternal theme featuring soft pastel rose blush canvas, delicate watercolor mother & baby art, circular progress ring, and clean 4-tile health metrics layout.",
      image: pastelMotherArt,
      typography: "Fraunces + Outfit",
      colorPalette: [
        { name: "Blush Canvas", hex: "#FFF7F9" },
        { name: "Rose Accent", hex: "#E26989" },
        { name: "Pastel Pink", hex: "#FCE8EE" },
        { name: "Soft Charcoal", hex: "#111827" },
      ],
      uxHighlights: [
        "Donut progress ring & EDD countdown",
        "Soft pastel health vitals 4-tile grid",
        "Watercolor mother & baby artwork",
        "Floating quick bottom navigation",
      ],
      vibeTag: "Recommended Minimal",
    },
    {
      id: "black-rosegold",
      name: "2. Luxury Dark Rose Gold",
      subtitle: "Ultra-Sleek Obsidian & Metallic Rose Gold (Active)",
      description:
        "High-contrast obsidian black backdrop paired with shimmering metallic rose gold typography, glowing borders, and premium velvet cards. Designed for ultra-sleek, luxury dark-mode aesthetics with zero glare.",
      image: themeBlackRoseGoldUi,
      galleryImages: [themeBlackRoseGoldUi, themeRoseGoldFetalArt, themeRoseGoldWellnessArt],
      typography: "Playfair Display + Plus Jakarta Sans (Metallic Finish)",
      colorPalette: [
        { name: "Obsidian Black", hex: "#0D0B0E" },
        { name: "Rose Gold Accent", hex: "#E09F9C" },
        { name: "Champagne Foil", hex: "#F3C5C1" },
        { name: "Velvet Card", hex: "#1A151C" },
      ],
      uxHighlights: [
        "Sleek high-contrast metallic rose gold metrics",
        "OLED obsidian power-saving dark canvas",
        "Glowing rose gold progress indicators",
        "Premium luxury editorial cards & typography",
      ],
      vibeTag: "Black & Rose Gold",
    },
    {
      id: "serene-rose",
      name: "Serene Rose & Warm Cream",
      subtitle: "Soft, Warm & Nurturing",
      description:
        "Designed specifically for maternal calm with warm off-white tones, soft rose accents, high-contrast readable text, and generous padding for effortless focus.",
      image: themeSereneRoseImg,
      typography: "Fraunces + Outfit",
      colorPalette: [
        { name: "Canvas", hex: "#FDF9F6" },
        { name: "Rose Accent", hex: "#F43F5E" },
        { name: "Blush Tint", hex: "#FFE4E6" },
        { name: "Deep Obsidian", hex: "#111827" },
      ],
      uxHighlights: [
        "WCAG AA Compliant 4.5:1 Contrast",
        "Eye-soothing warm neutral background",
        "Soft 24px rounded card containers",
        "Tactile touch targets (min 44px)",
      ],
      vibeTag: "Gentle & Calm",
    },
    {
      id: "midnight-lavender",
      name: "Midnight Lavender & Obsidian",
      subtitle: "Dark Mode Luxury & Night-Safe",
      description:
        "Deep obsidian and velvet lavender tones tailored for nighttime feeding, late-night kick tracking, and low-light eye comfort without blue-light glare.",
      image: themeMidnightLavenderImg,
      typography: "Cormorant Garamond + Inter",
      colorPalette: [
        { name: "Obsidian Slate", hex: "#15111C" },
        { name: "Deep Lavender", hex: "#1A1523" },
        { name: "Violet Pulse", hex: "#A855F7" },
        { name: "Soft Glow White", hex: "#F3E8FF" },
      ],
      uxHighlights: [
        "OLED True Dark power saving",
        "Zero harsh white glare for night feeds",
        "High contrast glowing metric badges",
        "Reduced eye strain under low ambient light",
      ],
      vibeTag: "Dark Luxury",
    },
    {
      id: "botanical-sage",
      name: "Botanical Sage & Linen",
      subtitle: "Organic, Earthy & Peaceful",
      description:
        "Clean, organic sage green paired with natural linen tones. Inspired by holistic prenatal wellness, fresh air, and mindful meditation spaces.",
      image: themeBotanicalSageImg,
      typography: "Cinzel + Plus Jakarta Sans",
      colorPalette: [
        { name: "Linen Warm", hex: "#F8F7F4" },
        { name: "Sage Green", hex: "#059669" },
        { name: "Earthy Leaf", hex: "#D1FAE5" },
        { name: "Charcoal Text", hex: "#1F2937" },
      ],
      uxHighlights: [
        "Holistic organic color harmony",
        "Relaxing visual cadence for meditation",
        "Clean grid structure for logs and scans",
        "High legibility for medical reports",
      ],
      vibeTag: "Organic Wellness",
    },
    {
      id: "sunset-coral",
      name: "Sunset Coral & Terracotta",
      subtitle: "Vibrant, Warm & Editorial",
      description:
        "Warm terracotta, gold, and coral tones with bold typography and crisp editorial metrics for an uplifting, energetic maternal experience.",
      image: themeSunsetCoralImg,
      typography: "Syne + Space Grotesk",
      colorPalette: [
        { name: "Terracotta Warm", hex: "#FFF7ED" },
        { name: "Sunset Coral", hex: "#EA580C" },
        { name: "Golden Amber", hex: "#F59E0B" },
        { name: "Espresso Text", hex: "#1C1917" },
      ],
      uxHighlights: [
        "Energetic visual hierarchy",
        "Bold metric callouts for vitals",
        "High impact CTA buttons for SOS",
        "Warm golden aesthetic highlights",
      ],
      vibeTag: "Vibrant Editorial",
    },
  ];

  const handleSelectTheme = (themeId: UiThemeOption, name: string) => {
    setUiTheme(themeId);
    showToast(`Applied ${name} UI/UX Theme!`);
  };

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-[#1a1523] p-6 sm:p-8 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider">
            <Palette className="w-4 h-4" />
            <span>Pictorial UI & UX Studio</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 dark:text-rose-100 mt-1">
            Choose Your Visual & UX Archetype
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-rose-300 mt-1 max-w-2xl">
            Explore high-definition pictorial concepts crafted with precision typography, color contrast math, and maternal eye-care ergonomics.
          </p>
        </div>

        <div className="px-4 py-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-200 font-bold text-xs flex items-center gap-2 shrink-0">
          <Zap className="w-4 h-4 text-amber-500" />
          <span>Active Theme: {THEMES.find((t) => t.id === currentTheme)?.name}</span>
        </div>
      </div>

      {/* Grid of Pictorial Theme Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {THEMES.map((theme) => {
          const isActive = currentTheme === theme.id;
          return (
            <div
              key={theme.id}
              className={`bg-white dark:bg-[#1a1523] rounded-3xl border overflow-hidden shadow-sm transition-all duration-300 flex flex-col ${
                isActive
                  ? "border-2 border-rose-500 dark:border-rose-400 ring-4 ring-rose-500/10 shadow-lg scale-[1.01]"
                  : "border-rose-100 dark:border-rose-900/40 hover:border-rose-300 dark:hover:border-rose-700"
              }`}
            >
              {/* Pictorial Image Preview */}
              <div className="relative h-60 sm:h-64 overflow-hidden group">
                <img
                  src={theme.image}
                  alt={theme.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center transition-transform duration-700"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6 flex flex-col justify-end text-white">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-rose-200">
                      {theme.vibeTag}
                    </span>

                    {isActive && (
                      <span className="px-3 py-1 rounded-full bg-rose-500 text-white font-bold text-xs flex items-center gap-1 shadow-md">
                        <Check className="w-3.5 h-3.5" />
                        <span>Active Selected</span>
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif text-2xl font-bold mt-2">{theme.name}</h3>
                  <p className="text-xs text-rose-100 opacity-90 mt-0.5">{theme.subtitle}</p>
                </div>
              </div>

              {/* Gallery thumbnails if available */}
              {theme.galleryImages && theme.galleryImages.length > 0 && (
                <div className="p-3 bg-black/90 border-b border-rose-900/40 flex items-center gap-3 overflow-x-auto">
                  <span className="text-[10px] uppercase font-bold text-rose-300 shrink-0">Pictorial Previews:</span>
                  <div className="flex items-center gap-2">
                    {theme.galleryImages.map((gImg, gIdx) => (
                      <img
                        key={gIdx}
                        src={gImg}
                        alt={`${theme.name} pictorial ${gIdx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-16 h-12 object-cover rounded-lg border border-rose-500/40 hover:border-rose-300 transition-colors cursor-pointer"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Theme Details Body */}
              <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">
                <p className="text-xs text-gray-600 dark:text-rose-200 leading-relaxed">
                  {theme.description}
                </p>

                {/* Typography pairing */}
                <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-rose-200 bg-rose-50/50 dark:bg-rose-950/20 p-3 rounded-2xl border border-rose-100 dark:border-rose-900/30">
                  <Type className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="font-semibold text-gray-500 dark:text-rose-300">Typography Pairing:</span>
                  <strong className="text-gray-900 dark:text-rose-100">{theme.typography}</strong>
                </div>

                {/* Swatches */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block mb-2">Color Palette Swatches</span>
                  <div className="grid grid-cols-4 gap-2">
                    {theme.colorPalette.map((c, i) => (
                      <div key={i} className="text-center">
                        <div
                          className="h-8 rounded-xl border border-black/10 shadow-inner"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="text-[9px] font-semibold text-gray-500 dark:text-rose-300 block mt-1 truncate">
                          {c.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* UX Highlights */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">UX & Visual Ergonomics</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-gray-600 dark:text-rose-300">
                    {theme.uxHighlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action CTA Button */}
                <button
                  onClick={() => handleSelectTheme(theme.id, theme.name)}
                  className={`w-full py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all mt-2 ${
                    isActive
                      ? "bg-rose-500 text-white cursor-default opacity-90"
                      : "bg-rose-500 hover:bg-rose-600 text-white"
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  <span>{isActive ? "Currently Applied UI/UX Theme" : "Apply This Pictorial UI/UX Style"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
