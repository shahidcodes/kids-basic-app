"use client";

import { useCallback, useState } from "react";
import { useVoice } from "@/hooks/useVoice";
import { useKeyCapture } from "@/hooks/useKeyCapture";
import { Music, Volume2, Sparkles } from "lucide-react";

interface MelodyModeProps {
  isActive: boolean;
  language?: "en" | "ar" | "dv";
}

interface Ripple {
  id: number;
  key: string;
}

// Word associations for each language
const WORD_ASSOCIATIONS: Record<string, { letters: string; words: Record<string, string>; numbers: string[] }> = {
  en: {
    letters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    words: {
      A: "A for Apple", B: "B for Ball", C: "C for Cat", D: "D for Dog",
      E: "E for Elephant", F: "F for Fish", G: "G for Giraffe", H: "H for House",
      I: "I for Ice cream", J: "J for Jellyfish", K: "K for Kite", L: "L for Lion",
      M: "M for Monkey", N: "N for Nest", O: "O for Orange", P: "P for Penguin",
      Q: "Q for Queen", R: "R for Rainbow", S: "S for Sun", T: "T for Tiger",
      U: "U for Umbrella", V: "V for Violin", W: "W for Whale", X: "X for Xylophone",
      Y: "Y for Yellow", Z: "Z for Zebra",
    },
    numbers: ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"],
  },
  ar: {
    letters: "ابتثجحخدذرزسشصضطظعغفقكلمنهوي",
    words: {
      "ا": "ألف - أسد", "ب": "باء - بطة", "ت": "تاء - تفاح", "ث": "ثاء - ثعلب",
      "ج": "جيم - جمل", "ح": "حاء - حمار", "خ": "خاء - خبز", "د": "دال - ديك",
      "ذ": "ذال - ذئب", "ر": "راء - رمان", "ز": "زاي - زرافة", "س": "سين - سنبلة",
      "ش": "شين - شمس", "ص": "صاد - صقر", "ض": "ضاد - ضفدع", "ط": "طاء - طائر",
      "ظ": "ظاء - ظرف", "ع": "عين - عنب", "غ": "غين - غزال", "ف": "فاء - فراشة",
      "ق": "قاف - قمر", "ك": "كاف - كتاب", "ل": "لام - ليمون", "م": "ميم - موز",
      "ن": "نون - نجمة", "ه": "هاء - هدهد", "و": "واو - ورقة", "ي": "ياء - يد",
    },
    numbers: ["صفر", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة"],
  },
  dv: {
    letters: "ހށނރބޅކއވމފދތލގޏސޑޒޓޔޕޖޗޘޙޚޛޜޝޞޟޠޡޢޣޤޥ",
    words: {
      "ހ": "ހާ - ހަސް", "ށ": "ށާ - ށަމާކި", "ނ": "ނާ - ނުވާ", "ރ": "ރާ - ރުކަ",
      "ބ": "ބާ - ބައްރަ", "ޅ": "ޅާ - ޅައި", "ކ": "ކާ - ކައިގަން", "އ": "އާ - އަލި",
      "ވ": "ވާ - ވަރިއަ", "މ": "މާ - މަސް", "ފ": "ފާ - ފަތް", "ދ": "ދާ - ދޫނި",
      "ތ": "ތާ - ތިނަ", "ލ": "ލާ - ލައި", "ގ": "ގާ - ގަހަ", "ޏ": "ޏާ - ޏިޔަ",
      "ސ": "ސާ - ސިނަ", "ޑ": "ޑާ - ޑޮރު", "ޒ": "ޒާ - ޒޫނަ", "ޓ": "ޓާ - ޓޭބަލް",
      "ޔ": "ޔާ - ޔަކަތް", "ޕ": "ޕާ - ޕަންޑަ", "ޖ": "ޖާ - ޖަމަލު", "ޗ": "ޗާ - ޗާނަ",
    },
    numbers: ["ސިފަރު", "އެއް", "ދޭ", "ތިން", "ހާރަ", "ފަސް", "ހަތް", "އަށް", "އަށްޑަރަ", "ނުވަ"],
  },
};

// Get character set based on language
const getCharSet = (language: "en" | "ar" | "dv") => {
  if (language === "ar") return "ابتثجحخدذرزسشصضطظعغفقكلمنهوي٠١٢٣٤٥٦٧٨٩";
  if (language === "dv") return "ހށނރބޅކއވމފދތލގޏސޑޒޓޔޕޖޗޘޙޚޛޜޝޞޟޠޡޢޣޤޥ٠١٢٣٤٥٦٧٨٩";
  return "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
};

export function MelodyMode({ isActive, language = "en" }: MelodyModeProps) {
  const [lastKey, setLastKey] = useState<string>("");
  const [lastWord, setLastWord] = useState<string>("");
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [noteCount, setNoteCount] = useState(0);

  // Use voice hook with playMelody
  const { speakLetter, speakWord } = useVoice({
    rate: 0.9,
    pitch: 1,
    volume: 1,
  });

  const associations = WORD_ASSOCIATIONS[language];
  // Melody mode displays all languages LTR for consistent keyboard layout
  const isRTL = false;
  const charSet = getCharSet(language);

  const handleKeyPress = useCallback(
    (key: string) => {
      // Play the melody note for this character
      speakLetter(key, "melody", language);

      // Speak the word association
      let word = "";
      if (associations.words[key]) {
        word = associations.words[key];
      } else if (/[0-9]/.test(key) || /[٠-٩]/.test(key) || /[٠-٩]/.test(key)) {
        // Handle numbers for all languages
        let numIndex = -1;
        if (/[0-9]/.test(key)) {
          numIndex = parseInt(key);
        } else if (/[٠-٩]/.test(key)) {
          // Arabic numerals
          const arNums = "٠١٢٣٤٥٦٧٨٩";
          numIndex = arNums.indexOf(key);
        }
        if (numIndex >= 0 && numIndex <= 9) {
          word = associations.numbers[numIndex] || key;
        }
      }

      if (word) {
        setTimeout(() => {
          speakWord(word, language);
        }, 400);
      }

      setLastKey(key);
      setLastWord(word);
      setNoteCount((c) => c + 1);

      // Visual feedback
      setActiveNotes((prev) => new Set([...prev, key]));

      // Add ripple effect
      const rippleId = Date.now();
      setRipples((prev) => [...prev, { id: rippleId, key }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== rippleId));
      }, 500);

      setTimeout(() => {
        setActiveNotes((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }, 300);
    },
    [speakLetter, speakWord, associations, language]
  );

  useKeyCapture({
    onKeyPress: handleKeyPress,
    enabled: isActive,
    language,
  });

  // Split charset into rows for display
  const chars = charSet.split("");
  const charsPerRow = language === "en" ? 10 : 8;
  const rows: string[][] = [];
  for (let i = 0; i < chars.length; i += charsPerRow) {
    rows.push(chars.slice(i, i + charsPerRow));
  }

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-8 relative overflow-hidden">
      <div className="mb-6 text-center z-10">
        <h2 className="text-4xl md:text-5xl font-bold text-pink-700 mb-4">
          Melody Mode
        </h2>
        <div className="flex items-center justify-center gap-4">
          <p className="text-xl md:text-2xl text-pink-600">
            Press keys to make music!
          </p>
          <div className="flex items-center gap-2 bg-pink-100 px-3 py-1 rounded-full">
            <Music className="text-pink-600" size={18} />
            <span className="font-bold text-pink-700">{noteCount}</span>
          </div>
        </div>
      </div>

      {/* Word display */}
      {lastWord && (
        <div className="mb-4 text-center z-10">
          <div className="bg-gradient-to-r from-pink-100 to-purple-100 px-6 py-3 rounded-2xl shadow-lg">
            <p
              className="text-2xl md:text-3xl font-bold text-purple-700"
              dir={isRTL ? "rtl" : "ltr"}
              style={{
                fontFamily: language === "ar" || language === "dv"
                  ? "'Noto Naskh Arabic', 'Traditional Arabic', 'Scheherazade New', serif"
                  : "'Comic Sans MS', 'Comic Neue', cursive",
              }}
            >
              {lastWord}
            </p>
          </div>
        </div>
      )}

      {/* Piano-style visual - arranged in rows */}
      <div className="flex-1 flex flex-col items-center justify-center w-full z-10 gap-2">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1 md:gap-2 justify-center w-full max-w-5xl">
            {row.map((key) => (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                className={`
                  relative aspect-square rounded-xl text-xl md:text-3xl font-bold
                  transition-all duration-100 overflow-hidden
                  ${activeNotes.has(key) ? "scale-95 brightness-110" : "hover:scale-105"}
                `}
                style={{
                  width: language === "en" ? "9%" : "11%",
                  maxWidth: "80px",
                  backgroundColor: getPianoColor(key, language),
                  boxShadow: activeNotes.has(key)
                    ? "0 2px 0 rgba(0,0,0,0.2)"
                    : "0 6px 0 rgba(0,0,0,0.2)",
                  transform: activeNotes.has(key) ? "translateY(4px)" : "",
                  fontFamily: language === "ar" || language === "dv"
                    ? "'Noto Naskh Arabic', 'Traditional Arabic', 'Scheherazade New', serif"
                    : "'Comic Sans MS', 'Comic Neue', cursive",
                }}
              >
                {/* Ripple effect */}
                {ripples.filter(r => r.key === key).map((ripple) => (
                  <span
                    key={ripple.id}
                    className="absolute inset-0 bg-white/40 rounded-xl"
                    style={{
                      animation: 'rippleEffect 0.5s ease-out forwards',
                    }}
                  />
                ))}
                <span className="relative z-10">{key}</span>
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Last key display */}
      <div className="mt-8 flex items-center gap-6 z-10">
        <div className="text-center relative">
          {/* Glow effect */}
          {lastKey && (
            <div
              className="absolute inset-0 rounded-2xl blur-xl opacity-50"
              style={{ backgroundColor: getPianoColor(lastKey, language) }}
            />
          )}
          <div
            className="relative w-24 h-24 rounded-2xl flex items-center justify-center text-5xl font-bold shadow-lg transition-all duration-300"
            style={{
              backgroundColor: lastKey ? getPianoColor(lastKey, language) : "#e5e7eb",
              color: lastKey ? "white" : "#9ca3af",
              transform: lastKey ? "scale(1.1)" : "scale(1)",
              boxShadow: lastKey ? `0 0 30px ${getPianoColor(lastKey, language)}80` : undefined,
              fontFamily: language === "ar" || language === "dv"
                ? "'Noto Naskh Arabic', 'Traditional Arabic', 'Scheherazade New', serif"
                : "'Comic Sans MS', 'Comic Neue', cursive",
            }}
          >
            {lastKey || "?"}
            {lastKey && (
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-pink-600">
            <Music size={24} />
            <span className="text-lg font-bold">Keep playing!</span>
          </div>
          <div className="flex items-center gap-2 text-pink-500 text-sm">
            <Volume2 size={18} />
            <span>Each letter plays a different note</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes rippleEffect {
          0% {
            transform: scale(0);
            opacity: 0.8;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

function getPianoColor(key: string, language: "en" | "ar" | "dv" = "en"): string {
  // Color palette
  const palette = [
    "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e",
    "#14b8a6", "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6",
    "#a855f7", "#d946ef", "#ec4899", "#f43f5e", "#fb923c",
    "#fbbf24", "#a3e635", "#4ade80", "#2dd4bf", "#38bdf8",
    "#60a5fa", "#818cf8", "#a78bfa", "#c084fc", "#e879f9",
    "#f472b6", "#78350f", "#92400e", "#b45309", "#d97706",
    "#f59e0b", "#fbbf24", "#fcd34d", "#fde68a", "#fef3c7",
    "#fffbeb",
  ];

  const charSet = getCharSet(language);
  const index = charSet.indexOf(key);

  if (index === -1) return "#9ca3af";
  return palette[index % palette.length];
}
