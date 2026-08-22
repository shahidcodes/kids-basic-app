"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface TimerProgressBarProps {
  duration: number;
  onTimeout: () => void;
  isActive: boolean;
  onReset?: () => void;
}

export function TimerProgressBar({ duration, onTimeout, isActive, onReset }: TimerProgressBarProps) {
  const [remaining, setRemaining] = useState(duration);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onTimeoutRef = useRef(onTimeout);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isActive) {
      clearTimer();
      setRemaining(duration);
      return;
    }

    setRemaining(duration);
    clearTimer();

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 0.1) {
          clearTimer();
          onTimeoutRef.current();
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return clearTimer;
  }, [isActive, duration, clearTimer]);

  const progress = Math.max(0, remaining / duration);
  const isLow = progress < 0.2;
  const isMedium = progress < 0.5;

  const barColor = isLow
    ? "bg-red-500"
    : isMedium
    ? "bg-amber-500"
    : "bg-green-500";

  return (
    <div className="flex items-center gap-3 w-full max-w-md">
      <div className="flex-1 h-6 bg-gray-200 rounded-full overflow-hidden shadow-inner border-2 border-gray-300">
        <div
          className={`h-full ${barColor} transition-all duration-100 rounded-full ${
            isLow ? "animate-pulse" : ""
          }`}
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <span
        className={`font-bold text-lg min-w-[3rem] text-right ${
          isLow ? "text-red-600" : isMedium ? "text-amber-600" : "text-green-600"
        }`}
      >
        {Math.ceil(remaining)}s
      </span>
    </div>
  );
}
