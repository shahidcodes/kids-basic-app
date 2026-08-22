export function checkSpeechSynthesisSupport(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function checkSpeechRecognitionSupport(): boolean {
  if (typeof window === 'undefined') return false;
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (!checkSpeechSynthesisSupport()) return [];
  return window.speechSynthesis.getVoices();
}

export function getBestVoiceForLanguage(
  language: 'en' | 'ar' | 'dv'
): SpeechSynthesisVoice | null {
  const voices = getAvailableVoices();
  if (voices.length === 0) return null;

  const langMap: Record<'en' | 'ar' | 'dv', string[]> = {
    en: ['en-US', 'en-GB', 'en-AU', 'en'],
    ar: ['ar-SA', 'ar-EG', 'ar-AE', 'ar'],
    dv: ['dv-MV', 'dv'],
  };

  const targets = langMap[language];

  for (const target of targets) {
    const match = voices.find((v) => v.lang === target);
    if (match) return match;
  }

  const partial = voices.find((v) => v.lang.startsWith(language));
  if (partial) return partial;

  return voices[0] ?? null;
}
