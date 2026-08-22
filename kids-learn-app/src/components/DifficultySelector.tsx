"use client";

import { Star } from "lucide-react";
import type { Difficulty } from "@/types";

interface DifficultySelectorProps {
  currentDifficulty: Difficulty;
  onSelect: (difficulty: Difficulty) => void;
}

const DIFFICULTIES: { id: Difficulty; label: string; stars: number; color: string; activeColor: string; bg: string }[] = [
  { id: "easy", label: "Easy", stars: 1, color: "text-green-600", activeColor: "from-green-400 to-green-500", bg: "bg-green-50" },
  { id: "medium", label: "Medium", stars: 2, color: "text-amber-600", activeColor: "from-amber-400 to-amber-500", bg: "bg-amber-50" },
  { id: "hard", label: "Hard", stars: 3, color: "text-red-600", activeColor: "from-red-400 to-red-500", bg: "bg-red-50" },
];

export function DifficultySelector({ currentDifficulty, onSelect }: DifficultySelectorProps) {
  return (
    <div className="flex gap-3 justify-center">
      {DIFFICULTIES.map((d) => {
        const isActive = currentDifficulty === d.id;
        return (
          <button
            key={d.id}
            onClick={() => onSelect(d.id)}
            className={`
              flex flex-col items-center gap-2 px-6 py-4 rounded-2xl border-4 transition-all duration-200
              ${isActive
                ? `bg-gradient-to-br ${d.activeColor} border-white text-white shadow-xl scale-105`
                : `${d.bg} border-gray-200 hover:border-gray-300 hover:scale-102`
              }
            `}
          >
            <div className="flex gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  className={
                    i < d.stars
                      ? isActive
                        ? "text-yellow-200"
                        : d.color
                      : "text-gray-300"
                  }
                  fill={i < d.stars ? "currentColor" : "none"}
                />
              ))}
            </div>
            <span className="font-bold text-lg">{d.label}</span>
          </button>
        );
      })}
    </div>
  );
}
