"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useVoice } from "@/hooks/useVoice";
import { useKeyCapture } from "@/hooks/useKeyCapture";
import { CheckCircle, XCircle, Trophy, Star, Sparkles, Volume2 } from "lucide-react";

interface CorrectModeProps {
  isActive: boolean;
  language?: "en" | "ar" | "dv";
}

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("");
const INACTIVITY_TIMEOUT = 5000; // 5 seconds before reminder
const SIZE_INCREASE_INTERVAL = 3000; // Increase size every 3 seconds
const MAX_SIZE_MULTIPLIER = 1.5; // Maximum 1.5x size

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  delay: number;
  size: number;
}

export function CorrectMode({ isActive, language = "en" }: CorrectModeProps) {
  const [targetKey, setTargetKey] = useState<string>("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showStreak, setShowStreak] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [letterScale, setLetterScale] = useState(1);
  const [showReminder, setShowReminder] = useState(false);
  const [lastPressedKey, setLastPressedKey] = useState<string>("");

  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sizeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const reminderTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const { speakLetter, speak, celebrate, speakHint, speakWrongAnswer } = useVoice();

  // Keep screen awake
  const requestWakeLock = useCallback(async () => {
    try {
      if ("wakeLock" in navigator && !wakeLockRef.current) {
        wakeLockRef.current = await navigator.wakeLock.request("screen");
      }
    } catch (err) {
      console.log("Wake lock not supported");
    }
  }, []);

  const releaseWakeLock = useCallback(() => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  }, []);

  // Clear all timers
  const clearAllTimers = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (sizeTimerRef.current) clearTimeout(sizeTimerRef.current);
    if (reminderTimerRef.current) clearTimeout(reminderTimerRef.current);
  }, []);

  // Reset inactivity timer
  const resetInactivityTimer = useCallback(() => {
    clearAllTimers();
    setLetterScale(1);
    setShowReminder(false);

    // Start inactivity timer for reminder
    inactivityTimerRef.current = setTimeout(() => {
      setShowReminder(true);
      speakHint(`Press the letter ${targetKey}`);
    }, INACTIVITY_TIMEOUT);

    // Start size increase timer
    let currentScale = 1;
    const increaseSize = () => {
      if (currentScale < MAX_SIZE_MULTIPLIER) {
        currentScale += 0.1;
        setLetterScale(currentScale);
        sizeTimerRef.current = setTimeout(increaseSize, SIZE_INCREASE_INTERVAL);
      }
    };
    sizeTimerRef.current = setTimeout(increaseSize, SIZE_INCREASE_INTERVAL);
  }, [targetKey, speakHint, clearAllTimers]);

  // Generate celebration particles with confetti effect
  const createParticles = useCallback(() => {
    const colors = ["#ef4444", "#f97316", "#f59e0b", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#f472b6", "#10b981"];
    const newParticles: Particle[] = [];
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: Date.now() + i,
        x: 50 + (Math.random() - 0.5) * 80,
        y: 50 + (Math.random() - 0.5) * 60,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.8,
        size: 8 + Math.random() * 16,
      });
    }
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 3000);
  }, []);

  // Pick a random letter
  const pickNewTarget = useCallback(() => {
    const random = LETTERS[Math.floor(Math.random() * LETTERS.length)];
    setTargetKey(random);
    setFeedback(null);
    setShowHint(false);
    setShowCelebration(false);
    setLetterScale(1);
    setShowReminder(false);
    clearAllTimers();

    // Speak the target after a short delay
    setTimeout(() => {
      speakHint(`Find the letter ${random}`);
      resetInactivityTimer();
    }, 500);
  }, [speak, resetInactivityTimer, clearAllTimers]);

  // Initialize first target and wake lock
  useEffect(() => {
    if (isActive) {
      if (!targetKey) {
        pickNewTarget();
      }
      requestWakeLock();
    } else {
      clearAllTimers();
      releaseWakeLock();
    }

    return () => {
      clearAllTimers();
      releaseWakeLock();
    };
  }, [isActive, targetKey, pickNewTarget, clearAllTimers, requestWakeLock, releaseWakeLock]);

  const handleKeyPress = useCallback(
    (key: string) => {
      if (!targetKey) return;

      // Reset timers on any key press
      resetInactivityTimer();
      setLastPressedKey(key);

      if (key === targetKey) {
        // Correct!
        setFeedback("correct");
        setScore((s) => s + 10);
        setStreak((s) => {
          const newStreak = s + 1;
          if (newStreak >= 5) {
            setShowStreak(true);
            setTimeout(() => setShowStreak(false), 2500);
          }
          return newStreak;
        });
        createParticles();
        setShowCelebration(true);
        speakLetter(key, "say");
        setTimeout(() => celebrate(), 400);

        clearAllTimers();

        // Pick new target after delay
        setTimeout(() => {
          pickNewTarget();
        }, 2500);
      } else {
        // Wrong!
        setFeedback("wrong");
        setStreak(0);
        speakWrongAnswer(key, targetKey);

        // Clear feedback after delay
        setTimeout(() => {
          setFeedback(null);
        }, 1500);
      }
    },
    [targetKey, pickNewTarget, speakLetter, speakWrongAnswer, createParticles, resetInactivityTimer, clearAllTimers]
  );

  useKeyCapture({
    onKeyPress: handleKeyPress,
    enabled: isActive,
  });

  const handleShowHint = () => {
    if (!targetKey) return;
    setShowHint(true);
    speakLetter(targetKey, "say");
    resetInactivityTimer();
    setTimeout(() => setShowHint(false), 2000);
  };

  return (
    <div className="flex flex-col items-center justify-start h-full w-full p-4 md:p-6 relative overflow-hidden pt-20" role="main" aria-label="Find the Letter game">
      {/* Celebration Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute pointer-events-none z-50"
          style={{
            backgroundColor: p.color,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: "50%",
            left: `${p.x}%`,
            top: `${p.y}%`,
            animation: `confettiPop 1.2s ease-out forwards`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      {/* Streak Celebration Overlay */}
      {showStreak && (
        <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
          <div className="bg-gradient-to-r from-yellow-300 to-amber-400 text-yellow-900 px-10 py-6 rounded-3xl shadow-2xl animate-streakBounce">
            <div className="flex items-center gap-4">
              <Sparkles className="w-12 h-12 animate-spin" />
              <span className="text-5xl font-black">{streak} Streak!</span>
              <Sparkles className="w-12 h-12 animate-spin" style={{ animationDirection: "reverse" }} />
            </div>
          </div>
        </div>
      )}

      {/* Success Celebration Overlay */}
      {showCelebration && (
        <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none bg-white/20">
          <div className="relative animate-successBounce">
            <div className="absolute inset-0 animate-ping opacity-30">
              <Star className="text-yellow-400 w-56 h-56" fill="currentColor" />
            </div>
            <div className="relative z-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full p-8 shadow-2xl">
              <CheckCircle className="text-white w-32 h-32" strokeWidth={3} />
            </div>
            <div className="absolute -top-8 -left-8 animate-float">
              <Star className="text-yellow-400 w-16 h-16" fill="currentColor" />
            </div>
            <div className="absolute -top-4 -right-12 animate-float" style={{ animationDelay: "0.2s" }}>
              <Sparkles className="text-pink-400 w-14 h-14" />
            </div>
            <div className="absolute -bottom-8 -left-12 animate-float" style={{ animationDelay: "0.4s" }}>
              <Star className="text-blue-400 w-12 h-12" fill="currentColor" />
            </div>
            <div className="absolute -bottom-4 -right-8 animate-float" style={{ animationDelay: "0.6s" }}>
              <Sparkles className="text-purple-400 w-16 h-16" />
            </div>
          </div>
          <div className="absolute bottom-1/3">
            <p className="text-5xl font-black text-green-600 animate-textPop drop-shadow-lg">
              Amazing! 🎉
            </p>
          </div>
        </div>
      )}

      {/* Reminder Overlay */}
      {showReminder && !feedback && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 animate-reminderPulse">
          <div className="bg-amber-100 border-4 border-amber-400 rounded-2xl px-6 py-3 shadow-xl flex items-center gap-3">
            <Volume2 className="text-amber-600 w-8 h-8 animate-bounce" />
            <span className="text-2xl font-bold text-amber-700">
              Press {targetKey}!
            </span>
          </div>
        </div>
      )}

      {/* Score Header */}
      <div className="mb-2 text-center z-10">
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full shadow-lg">
            <Trophy className="text-green-600" size={24} />
            <span className="text-xl font-bold text-green-700">{score}</span>
          </div>
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-all duration-300 ${
              streak >= 5 ? "bg-yellow-300 scale-110" : "bg-yellow-100"
            }`}
          >
            <Star
              className={`${streak >= 5 ? "text-yellow-700 animate-spin" : "text-yellow-600"}`}
              size={24}
              fill={streak >= 5 ? "currentColor" : "none"}
            />
            <span className={`text-xl font-bold ${streak >= 5 ? "text-yellow-800" : "text-yellow-700"}`}>
              {streak}
            </span>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10 min-h-0">
        <p className="text-xl md:text-2xl text-blue-600 mb-4 font-bold">
          Press this key:
        </p>

        {/* Letter with dynamic scaling */}
        <div
          className={`
            display-text transition-all duration-500 select-none
            ${feedback === "correct" ? "text-green-500" : ""}
            ${feedback === "wrong" ? "text-red-500 animate-wiggle" : ""}
            ${showHint ? "animate-glow" : ""}
          `}
          style={{
            color: getColorForKey(targetKey),
            transform: `scale(${letterScale})`,
            textShadow: showReminder ? "0 0 30px rgba(245, 158, 11, 0.8)" : undefined,
          }}
          aria-live="assertive"
          aria-label={`Target letter: ${targetKey}`}
        >
          {targetKey || "?"}
        </div>

        {/* Wrong feedback */}
        {feedback === "wrong" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20" role="alert" aria-live="assertive">
            <XCircle className="text-red-500 w-32 h-32 animate-pop drop-shadow-lg" />
          </div>
        )}

        {/* Hint button */}
        <button
          onClick={handleShowHint}
          className="kid-btn-secondary mt-8 z-10 flex items-center gap-2"
          disabled={!targetKey || !!feedback}
        >
          <Volume2 size={20} />
          Hear Hint
        </button>
      </div>

      <style jsx>{`
        @keyframes confettiPop {
          0% {
            transform: translate(0, 0) rotate(0deg) scale(0);
            opacity: 1;
          }
          20% {
            transform: translate(var(--x, ${Math.random() * 100 - 50}px), var(--y, -50px)) rotate(180deg) scale(1.2);
            opacity: 1;
          }
          100% {
            transform: translate(var(--x, ${Math.random() * 200 - 100}px), 200px) rotate(720deg) scale(0);
            opacity: 0;
          }
        }

        @keyframes streakBounce {
          0%, 100% { transform: scale(1) rotate(-2deg); }
          25% { transform: scale(1.15) rotate(2deg); }
          50% { transform: scale(1.05) rotate(-1deg); }
          75% { transform: scale(1.1) rotate(1deg); }
        }

        @keyframes successBounce {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          50% { transform: scale(1.2) rotate(10deg); opacity: 1; }
          70% { transform: scale(0.9) rotate(-5deg); }
          100% { transform: scale(1) rotate(0deg); }
        }

        @keyframes textPop {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }

        @keyframes reminderPulse {
          0%, 100% { transform: translateX(-50%) scale(1); }
          50% { transform: translateX(-50%) scale(1.05); }
        }

        .animate-streakBounce {
          animation: streakBounce 0.6s ease-out;
        }

        .animate-successBounce {
          animation: successBounce 0.7s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }

        .animate-textPop {
          animation: textPop 0.5s ease-out forwards;
        }

        .animate-float {
          animation: float 2s ease-in-out infinite;
        }

        .animate-reminderPulse {
          animation: reminderPulse 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

function getColorForKey(key: string): string {
  const colors = [
    "#ef4444",
    "#f97316",
    "#f59e0b",
    "#84cc16",
    "#22c55e",
    "#14b8a6",
    "#06b6d4",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#a855f7",
    "#d946ef",
    "#ec4899",
  ];
  const code = key.charCodeAt(0);
  return colors[code % colors.length];
}
