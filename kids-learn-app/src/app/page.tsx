"use client";

import { useState } from "react";
import { useFullscreen } from "@/hooks/useFullscreen";
import { usePersistedState } from "@/hooks/usePersistedState";
import { SayMode } from "@/components/SayMode";
import { CorrectMode } from "@/components/CorrectMode";
import { WriteMode } from "@/components/WriteMode";
import { MelodyMode } from "@/components/MelodyMode";
import { SettingsPanel } from "@/components/SettingsPanel";
import { getSettingsWithDefaults } from "@/utils/storage";
import {
  Volume2,
  CheckCircle,
  Pencil,
  Music,
  Maximize,
  Minimize,
  Home,
  Star,
  Globe,
  Settings,
} from "lucide-react";
import type { GameSettings, Language } from "@/types";

type AppMode = "menu" | "say" | "correct" | "write" | "melody";

interface LanguageOption {
  id: Language;
  name: string;
  nativeName: string;
  flag: string;
}

const LANGUAGES: LanguageOption[] = [
  { id: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { id: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
  { id: "dv", name: "Dhivehi", nativeName: "ދިވެހި", flag: "🇲🇻" },
];

const MODES = [
  {
    id: "say" as AppMode,
    name: "Say Mode",
    description: "Press any key and hear it spoken!",
    icon: Volume2,
    color: "from-amber-400 to-orange-400",
    bgColor: "bg-gradient-to-br from-amber-100 to-orange-100",
  },
  {
    id: "correct" as AppMode,
    name: "Find the Letter",
    description: "Find the letter shown on screen!",
    icon: CheckCircle,
    color: "from-blue-400 to-cyan-400",
    bgColor: "bg-gradient-to-br from-blue-100 to-cyan-100",
  },
  {
    id: "write" as AppMode,
    name: "Write Mode",
    description: "Draw letters with your mouse!",
    icon: Pencil,
    color: "from-purple-400 to-pink-400",
    bgColor: "bg-gradient-to-br from-purple-100 to-pink-100",
  },
  {
    id: "melody" as AppMode,
    name: "Melody Mode",
    description: "Make music with your keyboard!",
    icon: Music,
    color: "from-pink-400 to-rose-400",
    bgColor: "bg-gradient-to-br from-pink-100 to-rose-100",
  },
];

export default function KidsLearnApp() {
  const [mode, setMode] = useState<AppMode>("menu");
  const [language, setLanguage] = usePersistedState<Language>("kidslearn_language", "en");
  const [settings, setSettings] = usePersistedState<GameSettings>(
    "kidslearn_settings",
    getSettingsWithDefaults()
  );
  const [showSettings, setShowSettings] = useState(false);
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  const handleModeSelect = (selectedMode: AppMode) => {
    setMode(selectedMode);
  };

  const handleBackToMenu = () => {
    setMode("menu");
  };

  const selectedLang = LANGUAGES.find((l) => l.id === language) || LANGUAGES[0];

  return (
    <div
      className={`
        min-h-screen w-full transition-colors duration-300
        ${mode === "menu" && "bg-amber-50"}
        ${mode === "say" && "bg-amber-50"}
        ${mode === "correct" && "bg-blue-50"}
        ${mode === "write" && "bg-purple-50"}
        ${mode === "melody" && "bg-pink-50"}
      `}
    >
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 pt-[max(1rem,env(safe-area-inset-top))] pb-4 px-4 flex items-center justify-between bg-gradient-to-b from-white/90 to-transparent">
        <div className="flex items-center gap-2">
          {mode !== "menu" && (
            <button
              onClick={handleBackToMenu}
              className="kid-btn kid-btn-secondary flex items-center gap-2 text-base"
            >
              <Home size={20} />
              Menu
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Language indicator */}
          <div className="flex items-center gap-2 bg-white/80 rounded-xl px-3 py-2 shadow-lg">
            <Globe size={20} className="text-gray-600" />
            <span className="text-lg">{selectedLang.flag}</span>
            <span className="text-sm font-bold text-gray-700 hidden sm:inline">
              {selectedLang.nativeName}
            </span>
          </div>

          {/* Settings button */}
          {mode !== "menu" && (
            <button
              onClick={() => setShowSettings(true)}
              className="p-3 rounded-xl bg-white/80 hover:bg-white shadow-lg transition-all"
              aria-label="Open settings"
            >
              <Settings size={24} className="text-gray-700" />
            </button>
          )}

          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-3 rounded-xl bg-white/80 hover:bg-white shadow-lg transition-all"
            aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize size={24} className="text-gray-700" />
            ) : (
              <Maximize size={24} className="text-gray-700" />
            )}
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="h-screen w-full pt-24">
        {mode === "menu" && (
          <div className="flex flex-col items-center justify-center h-full p-8">
            {/* Title */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Star className="text-yellow-400 w-12 h-12 animate-bounce-gentle" />
                <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 bg-clip-text text-transparent">
                  Kids Learn
                </h1>
                <Star className="text-yellow-400 w-12 h-12 animate-bounce-gentle" />
              </div>
              <p className="text-2xl text-gray-600 font-bold">
                Fun way to learn letters & numbers!
              </p>
            </div>

            {/* Language Selector */}
            <div className="mb-8 bg-white/60 rounded-2xl p-4 shadow-lg border-2 border-white">
              <p className="text-center text-gray-600 font-bold mb-3 flex items-center justify-center gap-2">
                <Globe size={18} />
                Choose Language / اختر اللغة / ބަސް ހޮވާލާ
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {LANGUAGES.map((lang) => (
                  <label
                    key={lang.id}
                    className={`
                      cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl
                      transition-all duration-200 border-2
                      ${
                        language === lang.id
                          ? "bg-gradient-to-r from-amber-400 to-orange-400 border-amber-500 text-white shadow-lg scale-105"
                          : "bg-white border-gray-200 hover:border-amber-300 hover:bg-amber-50"
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="language"
                      value={lang.id}
                      checked={language === lang.id}
                      onChange={() => setLanguage(lang.id)}
                      className="hidden"
                    />
                    <span className="text-2xl">{lang.flag}</span>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">{lang.name}</span>
                      <span
                        className={`text-xs ${
                          language === lang.id ? "text-white/90" : "text-gray-500"
                        }`}
                      >
                        {lang.nativeName}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Mode cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
              {MODES.map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => handleModeSelect(m.id)}
                    className={`mode-card ${m.bgColor}`}
                  >
                    <div
                      className={`
                        w-20 h-20 rounded-2xl bg-gradient-to-br ${m.color}
                        flex items-center justify-center mb-4
                        shadow-lg
                      `}
                    >
                      <Icon className="text-white w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      {m.name}
                    </h3>
                    <p className="text-lg text-gray-600">{m.description}</p>
                  </button>
                );
              })}
            </div>

            {/* Hint */}
            <div className="mt-12 text-center">
              <p className="text-gray-500 text-lg">
                Press the fullscreen button for the best experience!
              </p>
            </div>
          </div>
        )}

        {mode === "say" && <SayMode isActive={true} language={language} />}
        {mode === "correct" && <CorrectMode isActive={true} language={language} />}
        {mode === "write" && <WriteMode isActive={true} language={language} />}
        {mode === "melody" && <MelodyMode isActive={true} language={language} />}
      </main>

      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSave={setSettings}
      />
    </div>
  );
}
