import { useCallback, useEffect, useRef } from 'react';
import Tts from 'react-native-tts';

interface VoiceOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
}

const CELEBRATION_PHRASES: Record<string, string[]> = {
  en: ['Amazing!', 'Great job!', 'Well done!', 'Fantastic!', 'You are awesome!', 'Super!'],
  ar: ['أحسنت!', 'ممتاز!', 'رائع!', 'عمل جيد!', 'مذهل!'],
  dv: ['ރަނގާރީ!', 'ވަރަށް ރަނގާރީ!', 'ރަނގަޅު މަސައްކަތް!', 'ފަސް މަސައްކަތް!'],
};

export function useVoice(options: VoiceOptions = {}) {
  const { rate = 0.9, pitch = 1, volume = 1 } = options;
  const isSpeakingRef = useRef(false);

  useEffect(() => {
    Tts.setDefaultRate(rate);
    Tts.setDefaultPitch(pitch);
    Tts.setDefaultLanguage('en-US');

    const listener = Tts.addEventListener('tts-finish', () => {
      isSpeakingRef.current = false;
    });

    return () => {
      listener.remove();
    };
  }, [rate, pitch]);

  const setLanguage = useCallback((language: string) => {
    const locale = language === 'ar' ? 'ar-SA' : language === 'dv' ? 'dv-MV' : 'en-US';
    Tts.setDefaultLanguage(locale).catch(() => {
      // Fallback to English if language not available
      Tts.setDefaultLanguage('en-US');
    });
  }, []);

  const speak = useCallback(
    (text: string, language?: string) => {
      if (language) {
        setLanguage(language);
      }
      isSpeakingRef.current = true;
      Tts.stop();
      Tts.speak(text);
    },
    [setLanguage]
  );

  const speakLetter = useCallback(
    (key: string, mode: 'say' | 'melody' = 'say', language: 'en' | 'ar' | 'dv' = 'en') => {
      setLanguage(language);
      isSpeakingRef.current = true;
      Tts.stop();

      let text = key;
      if (mode === 'melody') {
        const associations = {
          en: {
            A: 'A for Apple', B: 'B for Ball', C: 'C for Cat', D: 'D for Dog',
            E: 'E for Elephant', F: 'F for Fish', G: 'G for Giraffe', H: 'H for House',
            I: 'I for Ice cream', J: 'J for Jellyfish', K: 'K for Kite', L: 'L for Lion',
            M: 'M for Monkey', N: 'N for Nest', O: 'O for Orange', P: 'P for Penguin',
            Q: 'Q for Queen', R: 'R for Rainbow', S: 'S for Sun', T: 'T for Tiger',
            U: 'U for Umbrella', V: 'V for Violin', W: 'W for Whale', X: 'X for Xylophone',
            Y: 'Y for Yellow', Z: 'Z for Zebra',
            '0': 'Zero', '1': 'One', '2': 'Two', '3': 'Three', '4': 'Four',
            '5': 'Five', '6': 'Six', '7': 'Seven', '8': 'Eight', '9': 'Nine',
          },
          ar: {
            'ا': 'ألف - أسد', 'ب': 'باء - بطة', 'ت': 'تاء - تفاح', 'ث': 'ثاء - ثعلب',
            'ج': 'جيم - جمل', 'ح': 'حاء - حمار', 'خ': 'خاء - خبز', 'د': 'دال - ديك',
            'ذ': 'ذال - ذئب', 'ر': 'راء - رمان', 'ز': 'زاي - زرافة', 'س': 'سين - سنبلة',
            'ش': 'شين - شمس', 'ص': 'صاد - صقر', 'ض': 'ضاد - ضفدع', 'ط': 'طاء - طائر',
            'ظ': 'ظاء - ظرف', 'ع': 'عين - عنب', 'غ': 'غين - غزال', 'ف': 'فاء - فراشة',
            'ق': 'قاف - قمر', 'ك': 'كاف - كتاب', 'ل': 'لام - ليمون', 'م': 'ميم - موز',
            'ن': 'نون - نجمة', 'ه': 'هاء - هدهد', 'و': 'واو - ورقة', 'ي': 'ياء - يد',
            '٠': 'صفر', '١': 'واحد', '٢': 'اثنان', '٣': 'ثلاثة', '٤': 'أربعة',
            '٥': 'خمسة', '٦': 'ستة', '٧': 'سبعة', '٨': 'ثمانية', '٩': 'تسعة',
          },
          dv: {
            'ހ': 'ހާ - ހަސް', 'ށ': 'ށާ - ށަމާކި', 'ނ': 'ނާ - ނުވާ', 'ރ': 'ރާ - ރުކަ',
            'ބ': 'ބާ - ބައްރަ', 'ޅ': 'ޅާ - ޅައި', 'ކ': 'ކާ - ކައިގަން', 'އ': 'އާ - އަލި',
            'ވ': 'ވާ - ވަރިއަ', 'މ': 'މާ - މަސް', 'ފ': 'ފާ - ފަތް', 'ދ': 'ދާ - ދޫނި',
            'ތ': 'ތާ - ތިނަ', 'ލ': 'ލާ - ލައި', 'ގ': 'ގާ - ގަހަ', 'ޏ': 'ޏާ - ޏިޔަ',
            'ސ': 'ސާ - ސިނަ', 'ޑ': 'ޑާ - ޑޮރު', 'ޒ': 'ޒާ - ޒޫނަ', 'ޓ': 'ޓާ - ޓޭބަލް',
            'ޔ': 'ޔާ - ޔަކަތް', 'ޕ': 'ޕާ - ޕަންޑަ', 'ޖ': 'ޖާ - ޖަމަލު', 'ޗ': 'ޗާ - ޗާނަ',
            '٠': 'ސިފަރު', '١': 'އެއް', '٢': 'ދޭ', '٣': 'ތިން', '٤': 'ހާރަ',
            '٥': 'ފަސް', '٦': 'ހަތް', '٧': 'އަށް', '٨': 'އަށްޑަރަ', '٩': 'ނުވަ',
          },
        };
        text = associations[language][key] || key;
      }

      Tts.speak(text);
    },
    [setLanguage]
  );

  const speakWord = useCallback(
    (word: string, language: 'en' | 'ar' | 'dv' = 'en') => {
      setLanguage(language);
      isSpeakingRef.current = true;
      Tts.stop();
      Tts.speak(word);
    },
    [setLanguage]
  );

  const celebrate = useCallback(
    (language: 'en' | 'ar' | 'dv' = 'en') => {
      const phrases = CELEBRATION_PHRASES[language] || CELEBRATION_PHRASES.en;
      const phrase = phrases[Math.floor(Math.random() * phrases.length)];
      setLanguage(language);
      Tts.stop();
      Tts.speak(phrase);
    },
    [setLanguage]
  );

  const speakHint = useCallback(
    (text: string, language?: 'en' | 'ar' | 'dv') => {
      if (language) {
        setLanguage(language);
      }
      Tts.stop();
      Tts.speak(text);
    },
    [setLanguage]
  );

  const speakWrongAnswer = useCallback(
    (pressed: string, target: string, language: 'en' | 'ar' | 'dv' = 'en') => {
      setLanguage(language);
      Tts.stop();
      const messages: Record<string, string> = {
        en: `That was ${pressed}. Try again. Find ${target}`,
        ar: `هذا ${pressed}. حاول مرة أخرى. ابحث عن ${target}`,
        dv: `މިއީ ${pressed}. އަދިވަރަކާ މަސައްކަތް ކުރާ. ${target} ހޯދާ`,
      };
      Tts.speak(messages[language] || messages.en);
    },
    [setLanguage]
  );

  return {
    speak,
    speakLetter,
    speakWord,
    celebrate,
    speakHint,
    speakWrongAnswer,
    setLanguage,
  };
}
