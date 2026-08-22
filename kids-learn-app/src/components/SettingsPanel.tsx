"use client";

import { X } from "lucide-react";
import { DifficultySelector } from "./DifficultySelector";
import type { GameSettings, Difficulty } from "@/types";
import { DIFFICULTY_SETTINGS } from "@/constants";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onSave: (settings: GameSettings) => void;
}

export function SettingsPanel({ isOpen, onClose, settings, onSave }: SettingsPanelProps) {
  const handleDifficultyChange = (difficulty: Difficulty) => {
    const defaults = DIFFICULTY_SETTINGS[difficulty];
    onSave({
      ...settings,
      difficulty,
      numberRange: defaults.numberRange,
      timerDuration: defaults.timerDuration,
      operations: defaults.operations,
    });
  };

  const toggleOperation = (op: "+" | "-" | "×") => {
    const ops = settings.operations.includes(op)
      ? settings.operations.filter((o) => o !== op)
      : [...settings.operations, op];
    if (ops.length === 0) return;
    onSave({ ...settings, operations: ops });
  };

  const handleTimerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSave({ ...settings, timerDuration: parseInt(e.target.value) });
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-50" onClick={onClose} />
      )}
      <div
        className={`
          fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50
          transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
          rounded-l-3xl overflow-y-auto
        `}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Settings</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <X size={28} className="text-gray-600" />
            </button>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-bold text-gray-700 mb-4">Difficulty</h3>
              <DifficultySelector
                currentDifficulty={settings.difficulty}
                onSelect={handleDifficultyChange}
              />
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-700 mb-4">Operations</h3>
              <div className="flex gap-3">
                {(["+", "-", "×"] as const).map((op) => (
                  <button
                    key={op}
                    onClick={() => toggleOperation(op)}
                    className={`
                      w-16 h-16 rounded-2xl text-3xl font-bold transition-all border-4
                      ${settings.operations.includes(op)
                        ? "bg-blue-500 text-white border-blue-600 shadow-lg scale-105"
                        : "bg-gray-100 text-gray-400 border-gray-200"
                      }
                    `}
                  >
                    {op}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-700 mb-4">
                Timer: {settings.timerDuration}s
              </h3>
              <input
                type="range"
                min={5}
                max={30}
                step={1}
                value={settings.timerDuration}
                onChange={handleTimerChange}
                className="w-full h-3 rounded-full appearance-none cursor-pointer bg-gray-200 accent-blue-500"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>5s</span>
                <span>30s</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
