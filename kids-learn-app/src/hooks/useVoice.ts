"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseVoiceOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
}

// Map all characters to musical notes (cyclical assignment for non-English chars)
const getNoteForChar = (char: string, language: "en" | "ar" | "dv" = "en"): string => {
  const baseNotes = [
    "C4", "D4", "E4", "F4", "G4", "A4", "B4",
    "C5", "D5", "E5", "F5", "G5", "A5", "B5",
    "C6", "D6", "E6", "F6", "G6", "A6", "B6",
    "C3", "D3", "E3", "F3", "G3", "A3", "B3",
  ];

  // Character sets for each language
  const charSets = {
    en: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    ar: "ابتثجحخدذرزسشصضطظعغفقكلمنهوي٠١٢٣٤٥٦٧٨٩",
    dv: "ހށނރބޅކއވމފދތލގޏސޑޒޓޔޕޖޗޘޙޚޛޜޝޞޟޠޡޢޣޤޥ٠١٢٣٤٥٦٧٨٩",
  };

  const charSet = charSets[language] || charSets.en;
  const index = charSet.indexOf(char);

  if (index === -1) return "C4"; // Default

  return baseNotes[index % baseNotes.length];
};

const NOTE_FREQUENCIES: Record<string, number> = {
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  F3: 174.61,
  G3: 196.0,
  A3: 220.0,
  B3: 246.94,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
  A5: 880.0,
  B5: 987.77,
  C6: 1046.5,
  D6: 1174.66,
  E6: 1318.51,
  F6: 1396.91,
  G6: 1567.98,
  A6: 1760.0,
  B6: 1975.53,
};

// Fun phrases for celebration
const CELEBRATION_PHRASES = [
  "Awesome!",
  "Amazing!",
  "Fantastic!",
  "Super!",
  "Wonderful!",
  "Great job!",
  "Excellent!",
  "Brilliant!",
  "Well done!",
  "You got it!",
];

export function useVoice(options: UseVoiceOptions = {}) {
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context for melody mode
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Play a note using Web Audio API with better sound
  const playNote = useCallback((frequency: number, duration: number = 0.4) => {
    const ctx = initAudioContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "triangle"; // Softer, more pleasant sound

    const now = ctx.currentTime;
    gainNode.gain.setValueAtTime(0.01, now);
    gainNode.gain.exponentialRampToValueAtTime(0.4, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

    oscillator.start(now);
    oscillator.stop(now + duration);
  }, [initAudioContext]);

  // Play melody for any character (works with all languages)
  const playMelody = useCallback((char: string, language: "en" | "ar" | "dv" = "en") => {
    const note = getNoteForChar(char, language);
    const frequency = NOTE_FREQUENCIES[note];
    if (frequency) {
      playNote(frequency, 0.4);
    }
  }, [playNote]);

  // Speak text with natural, expressive settings
  const speak = useCallback(
    (text: string, forcePitch?: number) => {
      if (typeof window === "undefined" || !window.speechSynthesis) return;

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // Use more natural, conversational settings
      utterance.rate = 0.92; // Slightly slower for clarity
      utterance.pitch = forcePitch || 1.02; // Very slight pitch variation for naturalness
      utterance.volume = 0.95; // Slightly reduced for comfort

      window.speechSynthesis.speak(utterance);
    },
    []
  );

  // Speak letter with fun, kid-friendly pronunciation
  const speakLetter = useCallback(
    (letter: string, mode: "say" | "melody" = "say", language: "en" | "ar" | "dv" = "en") => {
      if (mode === "melody") {
        playMelody(letter, language);
        return;
      }

      // Handle different languages
      if (language === "ar") {
        // Arabic letter pronunciation
        const arabicLetters: Record<string, string> = {
          "ا": "alif", "ب": "baa", "ت": "taa", "ث": "thaa",
          "ج": "jeem", "ح": "haa", "خ": "khaa", "د": "daal",
          "ذ": "thaal", "ر": "raa", "ز": "zaay", "س": "seen",
          "ش": "sheen", "ص": "saad", "ض": "daad", "ط": "taa",
          "ظ": "zaa", "ع": "ain", "غ": "ghain", "ف": "faa",
          "ق": "qaf", "ك": "kaf", "ل": "lam", "م": "meem",
          "ن": "noon", "ه": "haa", "و": "waw", "ي": "yaa",
          "٠": "sifr", "١": "waahid", "٢": "ithnaan", "٣": "thalaatha",
          "٤": "arbaa", "٥": "khamsa", "٦": "sitta", "٧": "saba",
          "٨": "thamaanya", "٩": "tisaa",
        };
        const textToSpeak = arabicLetters[letter] || letter;
        speak(textToSpeak, 1.05);
        return;
      }

      if (language === "dv") {
        // Dhivehi letter pronunciation (simplified)
        const dhivehiLetters: Record<string, string> = {
          "ހ": "haa", "ށ": "shaviyani", "ނ": "noonu", "ރ": "raa",
          "ބ": "baa", "ޅ": "lhaviyani", "ކ": "kaafu", "އ": "alifu",
          "ވ": "vaavu", "މ": "meemu", "ފ": "faafu", "ދ": "dhaalu",
          "ތ": "thaalu", "ލ": "laamu", "ގ": "gaafu", "ޏ": "gnaviyani",
          "ސ": "seenu", "ޑ": "daviyani", "ޒ": "zaviyani", "ޓ": "taviyani",
          "ޔ": "yaviyani", "ޕ": "paviyani", "ޖ": "javiyani", "ޗ": "chaviyani",
          "ޘ": "ttaa", "ޙ": "haa", "ޚ": "tha", "ޛ": "zaa",
          "ޜ": "sheen", "ޝ": "saad", "ޞ": "daad", "ޟ": "to",
          "ޠ": "zo", "ޡ": "ain", "ޢ": "ghain", "ޣ": "qaa",
          "ޤ": "waa", "ޥ": "waa",
          "٠": "sifaru", "١": "ek", "٢": "dhey", "٣": "thin",
          "٤": "haara", "٥": "fahe", "٦": "heh", "٧": "hith",
          "٨": "aasha", "٩": "nuva",
        };
        const textToSpeak = dhivehiLetters[letter] || letter;
        speak(textToSpeak, 1.05);
        return;
      }

      // English (default)
      const isLetter = /^[a-zA-Z]$/.test(letter);
      const isNumber = /^[0-9]$/.test(letter);

      let textToSpeak = letter;

      if (isLetter) {
        const upperLetter = letter.toUpperCase();
        // Add a period after each letter to force letter pronunciation
        const phoneticMap: Record<string, string> = {
          A: "A.", B: "B.", C: "C.", D: "D.", E: "E.", F: "F.", G: "G.",
          H: "H.", I: "I.", J: "J.", K: "K.", L: "L.", M: "M.", N: "N.",
          O: "O.", P: "P.", Q: "Q.", R: "R.", S: "S.", T: "T.", U: "U.",
          V: "V.", W: "W.", X: "X.", Y: "Y.", Z: "Z.",
        };
        textToSpeak = phoneticMap[upperLetter] || upperLetter;
      } else if (isNumber) {
        const numberWords = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
        textToSpeak = numberWords[parseInt(letter)];
      }

      speak(textToSpeak, 1.08); // Slightly higher pitch for kids
    },
    [speak, playMelody]
  );

  // Speak wrong answer feedback with empathy
  const speakWrongAnswer = useCallback(
    (pressedKey: string, targetKey: string) => {
      const message = `You pressed ${pressedKey}. Press ${targetKey} now.`;
      speak(message, 0.95); // Slightly lower for gentle guidance
    },
    [speak]
  );

  // Speak a fun celebration phrase
  const celebrate = useCallback(() => {
    const phrase = CELEBRATION_PHRASES[Math.floor(Math.random() * CELEBRATION_PHRASES.length)];
    speak(phrase, 1.15); // Higher pitch for excitement
  }, [speak]);

  // Speak hint/instruction with warm tone
  const speakHint = useCallback(
    (text: string) => {
      speak(text, 0.98); // Slightly lower for gentle guidance
    },
    [speak]
  );

  // Speak a word/phrase in the specified language
  const speakWord = useCallback(
    (text: string, language: "en" | "ar" | "dv" = "en") => {
      if (typeof window === "undefined" || !window.speechSynthesis) return;

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // Set language-specific voice
      const langCode = language === "ar" ? "ar-SA" : language === "dv" ? "dv-MV" : "en-US";
      utterance.lang = langCode;
      utterance.rate = 0.9; // Slightly slower for kids
      utterance.pitch = 1.05;
      utterance.volume = 0.95;

      window.speechSynthesis.speak(utterance);
    },
    []
  );

  return {
    speak,
    speakLetter,
    celebrate,
    speakHint,
    speakWrongAnswer,
    speakWord,
    playMelody,
  };
}
