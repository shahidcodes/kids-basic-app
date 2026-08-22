"use client";

import { useCallback, useState, useEffect } from "react";
import { useVoice } from "@/hooks/useVoice";
import { useKeyCapture } from "@/hooks/useKeyCapture";
import { Volume2, Sparkles, Globe } from "lucide-react";

interface SayModeProps {
  isActive: boolean;
  language?: "en" | "ar" | "dv";
}

interface Sparkle {
  id: number;
  x: number;
  y: number;
  delay: number;
  scale: number;
}

const TRANSLATIONS = {
  en: {
    title: "Say Mode",
    subtitle: "Press any letter or number key!",
    prompt: "Press a key to hear it!",
    lastKey: "Last key",
    keysPressed: "Keys pressed",
  },
  ar: {
    title: "وضع النطق",
    subtitle: "اضغط على أي حرف أو رقم!",
    prompt: "اضغط على مفتاح لتسمعه!",
    lastKey: "آخر مفتاح",
    keysPressed: "المفاتيح المضغوطة",
  },
  dv: {
    title: "ބައްކަލުނުދާ މޯޑު",
    subtitle: "ކޮންމެ ފޮތުން ނުވަތަ ނަންބަރަކުން ފިއާރުކުރާ!",
    prompt: "އަޑުއިވުމަށް ފިއާރުކުރާ!",
    lastKey: "އެންމެ ފަހުގެ ފޮތް",
    keysPressed: "ޖުމްލަ ފިއާރުކޮށްފައިވާ",
  },
};

export function SayMode({ isActive, language = "en" }: SayModeProps) {
  const [lastKey, setLastKey] = useState<string>("");
  const [showVisual, setShowVisual] = useState(false);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [keyCount, setKeyCount] = useState(0);
  const { speakLetter } = useVoice();

  const t = TRANSLATIONS[language];

  // RTL support for Arabic and Dhivehi
  const isRTL = language === "ar" || language === "dv";

  const createSparkles = useCallback(() => {
    const newSparkles: Sparkle[] = [];
    for (let i = 0; i < 12; i++) {
      newSparkles.push({
        id: Date.now() + i,
        x: (Math.random() - 0.5) * 300,
        y: (Math.random() - 0.5) * 300,
        delay: Math.random() * 0.3,
        scale: 0.5 + Math.random() * 0.5,
      });
    }
    setSparkles(newSparkles);
    setTimeout(() => setSparkles([]), 1200);
  }, []);

  const handleKeyPress = useCallback(
    (key: string) => {
      speakLetter(key, "say", language);
      setLastKey(key);
      setShowVisual(true);
      setKeyCount((c) => c + 1);
      createSparkles();

      // Hide visual after animation
      setTimeout(() => setShowVisual(false), 1200);
    },
    [speakLetter, createSparkles, language]
  );

  useKeyCapture({
    onKeyPress: handleKeyPress,
    enabled: isActive,
    language,
  });

  return (
    <div
      className="flex flex-col items-center justify-center h-full w-full p-8 relative overflow-hidden"
      dir={isRTL ? "rtl" : "ltr"}
      role="main"
      aria-label="Say Mode - Press keys to hear letters and numbers"
    >
      {/* Sparkles around the letter */}
      {sparkles.map((s) => (
        <div
          key={s.id}
          className="absolute pointer-events-none"
          style={{
            left: '50%',
            top: '50%',
            transform: `translate(${s.x}px, ${s.y}px) scale(${s.scale})`,
            animation: `sparkleFloat 1s ease-out forwards`,
            animationDelay: `${s.delay}s`,
          }}
        >
          <Sparkles className="w-8 h-8 text-yellow-400" />
        </div>
      ))}

      <div className="mb-8 text-center z-10">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Globe className="text-amber-500 w-8 h-8" />
          <h2 className="text-4xl md:text-5xl font-bold text-amber-700">
            {t.title}
          </h2>
        </div>
        <p className="text-xl md:text-2xl text-amber-600">
          {t.subtitle}
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center w-full relative z-10">
        {lastKey && (
          <div className="relative">
            {/* Glow effect behind letter */}
            <div
              className={`
                absolute inset-0 rounded-full blur-3xl transition-all duration-300
                ${showVisual ? 'opacity-60 scale-150' : 'opacity-0 scale-100'}
              `}
              style={{ backgroundColor: getColorForKey(lastKey) }}
            />
            <div
              className={`
                display-text transition-all duration-300 select-none relative z-10
                ${showVisual ? "scale-110 opacity-100" : "scale-90 opacity-40"}
              `}
              style={{
                color: getColorForKey(lastKey),
                textShadow: showVisual ? `0 0 40px ${getColorForKey(lastKey)}80` : 'none',
                animation: showVisual ? 'letterBounce 0.6s ease-out' : 'none',
                fontFamily: language === "ar" || language === "dv"
                  ? "'Noto Naskh Arabic', 'Traditional Arabic', 'Scheherazade New', serif"
                  : "'Comic Sans MS', 'Comic Neue', cursive",
              }}
              aria-live="polite"
              role="status"
            >
              {lastKey}
            </div>
          </div>
        )}

        {!lastKey && (
          <div className="text-center text-amber-400 animate-pulse">
            <div className="relative inline-block">
              <Volume2 size={120} className="mx-auto mb-4" />
              <div className="absolute -top-4 -right-4 animate-bounce">
                <Sparkles className="w-10 h-10 text-yellow-400" />
              </div>
            </div>
            <p className="text-2xl font-bold">{t.prompt}</p>
          </div>
        )}
      </div>

      <div className="mt-8 text-center z-10">
        <div className="flex items-center gap-4" dir={isRTL ? "rtl" : "ltr"}>
          <div className="flex items-center gap-2 text-amber-600 text-lg bg-white/50 px-4 py-2 rounded-full">
            <Volume2 size={24} />
            <span>{t.lastKey}: <span className="font-bold text-2xl">{lastKey || "-"}</span></span>
          </div>
          <div className="flex items-center gap-2 text-purple-600 text-lg bg-purple-100 px-4 py-2 rounded-full">
            <span>{t.keysPressed}: <span className="font-bold text-2xl">{keyCount}</span></span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes letterBounce {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.2) translateY(-20px); }
          50% { transform: scale(0.95) translateY(10px); }
          75% { transform: scale(1.05) translateY(-10px); }
        }
        @keyframes sparkleFloat {
          0% {
            transform: translate(0, 0) scale(0);
            opacity: 1;
          }
          50% {
            transform: translate(${Math.random() * 100 - 50}px, -50px) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(${Math.random() * 100 - 50}px, -100px) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

function getColorForKey(key: string): string {
  const colors = [
    "#ef4444", // red
    "#f97316", // orange
    "#f59e0b", // amber
    "#84cc16", // lime
    "#22c55e", // green
    "#14b8a6", // teal
    "#06b6d4", // cyan
    "#3b82f6", // blue
    "#6366f1", // indigo
    "#8b5cf6", // violet
    "#a855f7", // purple
    "#d946ef", // fuchsia
    "#ec4899", // pink
  ];

  // Use char code to pick a color
  const code = key.charCodeAt(0);
  return colors[code % colors.length];
}
