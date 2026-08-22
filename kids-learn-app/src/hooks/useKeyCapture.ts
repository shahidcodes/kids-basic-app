"use client";

import { useCallback, useEffect, useRef } from "react";

type KeyHandler = (key: string) => void;

interface UseKeyCaptureOptions {
  onKeyPress: KeyHandler;
  enabled?: boolean;
  allowRepeat?: boolean;
  language?: "en" | "ar" | "dv";
}

// Character sets for different languages
const CHAR_SETS = {
  en: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  ar: "ابتثجحخدذرزسشصضطظعغفقكلمنهوي٠١٢٣٤٥٦٧٨٩",
  dv: "ހށނރބޅކއވމފދތލގޏސޑޒޓޔޕޖޗޘޙޚޛޜޝޞޟޠޡޢޣޤޥ٠١٢٣٤٥٦٧٨٩",
};

export function useKeyCapture(options: UseKeyCaptureOptions) {
  const { onKeyPress, enabled = true, allowRepeat = false, language = "en" } = options;
  const pressedKeys = useRef<Set<string>>(new Set());
  const onKeyPressRef = useRef(onKeyPress);

  // Keep the callback ref up to date
  useEffect(() => {
    onKeyPressRef.current = onKeyPress;
  }, [onKeyPress]);

  const getCharSet = useCallback(() => {
    return CHAR_SETS[language] || CHAR_SETS.en;
  }, [language]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Prevent default browser behavior for most keys
      // but allow some system keys
      const allowedKeys = ["F5", "F11", "F12", "Escape", "Tab"];
      const allowedCombos = event.ctrlKey || event.metaKey || event.altKey;

      if (!allowedKeys.includes(event.key) && !allowedCombos) {
        event.preventDefault();
      }

      // Handle repeat
      if (!allowRepeat && pressedKeys.current.has(event.key)) {
        return;
      }

      pressedKeys.current.add(event.key);

      // Get the character
      let key = event.key;

      // Convert to single character if it's a single letter/number
      if (key.length === 1) {
        key = key.toUpperCase();
      }

      // Handle special named keys
      const keyMap: Record<string, string> = {
        Enter: "ENTER",
        Space: " ",
        Backspace: "BACKSPACE",
        Delete: "DELETE",
        ArrowUp: "UP",
        ArrowDown: "DOWN",
        ArrowLeft: "LEFT",
        ArrowRight: "RIGHT",
      };

      const mappedKey = keyMap[event.key] || key;
      const charSet = getCharSet();

      // Check if the key is in the valid character set for the language
      if (charSet.includes(mappedKey)) {
        onKeyPressRef.current(mappedKey);
      }
    },
    [enabled, allowRepeat, getCharSet]
  );

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    pressedKeys.current.delete(event.key);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return {
    isEnabled: enabled,
  };
}
