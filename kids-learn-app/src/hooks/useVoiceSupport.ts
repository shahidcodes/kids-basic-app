"use client";

import { useEffect, useState } from "react";
import {
  checkSpeechSynthesisSupport,
  checkSpeechRecognitionSupport,
  getAvailableVoices,
  getBestVoiceForLanguage,
} from "@/utils/voiceSupport";
import type { Language } from "@/types";

export function useVoiceSupport(language: Language = "en") {
  const [synthesisSupported, setSynthesisSupported] = useState(false);
  const [recognitionSupported, setRecognitionSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [bestVoice, setBestVoice] = useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    setSynthesisSupported(checkSpeechSynthesisSupport());
    setRecognitionSupported(checkSpeechRecognitionSupport());

    const loadVoices = () => {
      const available = getAvailableVoices();
      setVoices(available);
      setBestVoice(getBestVoiceForLanguage(language));
    };

    loadVoices();

    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
      return () => {
        window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      };
    }
  }, [language]);

  return {
    synthesisSupported,
    recognitionSupported,
    voices,
    bestVoice,
  };
}
