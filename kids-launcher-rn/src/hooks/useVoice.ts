import { useCallback, useEffect, useRef, useState } from 'react';
import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import { TTS_LOCALES, getWordAssociations } from '../theme';

// Safely get TTS module - may be null if not properly linked
let Tts: any = null;
try {
  Tts = require('react-native-tts').default;
} catch (e) {
  console.warn('TTS module not available');
}

interface VoiceOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
}

const CELEBRATION_PHRASES: Record<'en' | 'ar' | 'dv', string[]> = {
  en: ['Amazing!', 'Great job!', 'Well done!', 'Fantastic!', 'You are awesome!', 'Super!'],
  ar: ['أحسنت!', 'ممتاز!', 'رائع!', 'عمل جيد!', 'مذهل!'],
  dv: ['ރަނގާރީ!', 'ވަރަށް ރަނގާރީ!', 'ރަނގަޅު މަސައްކަތް!', 'ފަސް މަސައްކަތް!'],
};

// Letter pronunciation maps for TTS
const ARABIC_LETTER_NAMES: Record<string, string> = {
  'ا': 'ألف', 'ب': 'باء', 'ت': 'تاء', 'ث': 'ثاء',
  'ج': 'جيم', 'ح': 'حاء', 'خ': 'خاء', 'د': 'دال',
  'ذ': 'ذال', 'ر': 'راء', 'ز': 'زاي', 'س': 'سين',
  'ش': 'شين', 'ص': 'صاد', 'ض': 'ضاد', 'ط': 'طاء',
  'ظ': 'ظاء', 'ع': 'عين', 'غ': 'غين', 'ف': 'فاء',
  'ق': 'قاف', 'ك': 'كاف', 'ل': 'لام', 'م': 'ميم',
  'ن': 'نون', 'ه': 'هاء', 'و': 'واو', 'ي': 'ياء',
};

const DHIVEHI_LETTER_NAMES: Record<string, string> = {
  'ހ': 'ހާ', 'ށ': 'ށަވިޔަނީ', 'ނ': 'ނޫނު', 'ރ': 'ރާ',
  'ބ': 'ބާ', 'ޅ': 'ޅަވިޔަނީ', 'ކ': 'ކާފު', 'އ': 'އަލިފު',
  'ވ': 'ވާވު', 'މ': 'މީމު', 'ފ': 'ފާފު', 'ދ': 'ދާލު',
  'ތ': 'ތާލު', 'ލ': 'ލާމު', 'ގ': 'ގާފު', 'ޏ': 'ޏަވިޔަނީ',
  'ސ': 'ސީނު', 'ޑ': 'ޑަވިޔަނީ', 'ޒ': 'ޒަވިޔަނީ', 'ޓ': 'ޓަވިޔަނީ',
  'ޔ': 'ޔަވިޔަނީ', 'ޕ': 'ޕަވިޔަނީ', 'ޖ': 'ޖަވިޔަނީ', 'ޗ': 'ޗަވިޔަނީ',
};

const ENGLISH_PHONETIC: Record<string, string> = {
  A: 'A.', B: 'B.', C: 'C.', D: 'D.', E: 'E.', F: 'F.', G: 'G.',
  H: 'H.', I: 'I.', J: 'J.', K: 'K.', L: 'L.', M: 'M.', N: 'N.',
  O: 'O.', P: 'P.', Q: 'Q.', R: 'R.', S: 'S.', T: 'T.', U: 'U.',
  V: 'V.', W: 'W.', X: 'X.', Y: 'Y.', Z: 'Z.',
};

const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

export function useVoice(options: VoiceOptions = {}) {
  const { rate = 0.9, pitch = 1, volume = 1 } = options;
  const [isReady, setIsReady] = useState(false);
  const [hasTtsSupport, setHasTtsSupport] = useState(true);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const isSpeakingRef = useRef(false);
  const initRef = useRef(false);

  // Initialize TTS and check availability
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    if (!Tts) {
      setHasTtsSupport(false);
      setTtsError('TTS module not available');
      return;
    }

    const init = async () => {
      try {
        const engines = await Tts.engines();
        if (!engines || engines.length === 0) {
          setHasTtsSupport(false);
          setTtsError('No TTS engine available');
          return;
        }

        await Tts.setDefaultRate(rate);
        await Tts.setDefaultPitch(pitch);
        await Tts.setDefaultLanguage(TTS_LOCALES.en);
        setIsReady(true);
      } catch (err) {
        console.error('TTS init failed:', err);
        setHasTtsSupport(false);
        setTtsError(err instanceof Error ? err.message : 'TTS init failed');
      }
    };

    init();

    const finishListener = Tts.addEventListener('tts-finish', () => {
      isSpeakingRef.current = false;
    });

    const errorListener = Tts.addEventListener('tts-error', (event: any) => {
      console.warn('TTS error:', event);
      isSpeakingRef.current = false;
      setTtsError(event?.error || 'TTS error');
    });

    return () => {
      finishListener?.remove?.();
      errorListener?.remove?.();
    };
  }, [rate, pitch]);

  // Set TTS language with fallback
  const setLanguage = useCallback((language: 'en' | 'ar' | 'dv') => {
    if (!Tts) return;
    const locale = TTS_LOCALES[language];
    Tts.setDefaultLanguage(locale).catch(() => {
      // Dhivehi likely unavailable, fall back to English
      Tts.setDefaultLanguage(TTS_LOCALES.en);
    });
  }, []);

  // Safe speak wrapper with error handling
  const speakSafe = useCallback((text: string, language?: 'en' | 'ar' | 'dv') => {
    if (!Tts || !hasTtsSupport) {
      console.warn('TTS unavailable, skipping:', text);
      return;
    }
    try {
      if (language) setLanguage(language);
      isSpeakingRef.current = true;
      Tts.stop();
      Tts.speak(text);
    } catch (err) {
      console.error('TTS speak failed:', err);
      isSpeakingRef.current = false;
      setTtsError(err instanceof Error ? err.message : 'Speak failed');
    }
  }, [hasTtsSupport, setLanguage]);

  // Speak plain text
  const speak = useCallback(
    (text: string, language?: 'en' | 'ar' | 'dv') => {
      speakSafe(text, language);
    },
    [speakSafe]
  );

  // Speak a letter (say mode = letter name, melody mode = just letter)
  const speakLetter = useCallback(
    (key: string, mode: 'say' | 'melody' = 'say', language: 'en' | 'ar' | 'dv' = 'en') => {
      let text = key;

      if (language === 'ar') {
        text = ARABIC_LETTER_NAMES[key] || key;
      } else if (language === 'dv') {
        text = DHIVEHI_LETTER_NAMES[key] || key;
      } else {
        const upper = key.toUpperCase();
        if (/^[A-Z]$/.test(upper)) {
          text = ENGLISH_PHONETIC[upper] || upper;
        } else if (/^[0-9]$/.test(key)) {
          text = NUMBER_WORDS[parseInt(key)];
        }
      }

      speakSafe(text, language);
    },
    [speakSafe]
  );

  // Speak a word/phrase
  const speakWord = useCallback(
    (word: string, language: 'en' | 'ar' | 'dv' = 'en') => {
      speakSafe(word, language);
    },
    [speakSafe]
  );

  // Celebrate
  const celebrate = useCallback(
    (language: 'en' | 'ar' | 'dv' = 'en') => {
      const phrases = CELEBRATION_PHRASES[language] || CELEBRATION_PHRASES.en;
      const phrase = phrases[Math.floor(Math.random() * phrases.length)];
      speakSafe(phrase, language);
    },
    [speakSafe]
  );

  // Speak hint
  const speakHint = useCallback(
    (text: string, language?: 'en' | 'ar' | 'dv') => {
      speakSafe(text, language);
    },
    [speakSafe]
  );

  // Speak wrong answer feedback
  const speakWrongAnswer = useCallback(
    (pressed: string, target: string, language: 'en' | 'ar' | 'dv' = 'en') => {
      const messages: Record<string, string> = {
        en: `That was ${pressed}. Try again. Find ${target}`,
        ar: `هذا ${pressed}. حاول مرة أخرى. ابحث عن ${target}`,
        dv: `މިއީ ${pressed}. އަދިވަރަކާ މަސައްކަތް ކުރާ. ${target} ހޯދާ`,
      };
      speakSafe(messages[language] || messages.en, language);
    },
    [speakSafe]
  );

  return {
    speak,
    speakLetter,
    speakWord,
    celebrate,
    speakHint,
    speakWrongAnswer,
    setLanguage,
    isReady,
    hasTtsSupport,
    ttsError,
  };
}
