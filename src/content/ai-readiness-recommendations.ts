import type { MaturityLevel, ReadinessResult } from '../utils/aiReadinessScoring';

interface LevelContent {
  levelName: string;
  summary: string;
  nextSteps: string[];
  pitfalls: string[];
}

export const levelContent: Record<MaturityLevel, LevelContent> = {
  1: {
    levelName: 'Poziom 1 — Accidental Users',
    summary:
      'AI jest obecne, ale działa głównie „w tle”. Największa szansa to przejście z pasywnego użycia do świadomego wyboru narzędzia i kontroli jakości.',
    nextSteps: [
      'Wprowadź 45-min szkolenie „AI basics + ryzyka danych” dla całego zespołu.',
      'Wybierz 2 bezpieczne use-case’y (np. podsumowanie spotkań, draft e-maila) i opisz prostą instrukcję.',
      'Dodaj zasadę „AI output zawsze wymaga szybkiej weryfikacji człowieka”.'
    ],
    pitfalls: [
      'Bezrefleksyjne kopiowanie odpowiedzi AI.',
      'Wklejanie danych wrażliwych do przypadkowych narzędzi.',
      'Brak wspólnego języka i definicji, czym jest AI w firmie.'
    ]
  },
  2: {
    levelName: 'Poziom 2 — Basic Users',
    summary:
      'Zespół używa AI świadomie, ale głównie do pojedynczych zadań. To dobry etap na przejście z „szybciej” do „lepiej i systemowo”.',
    nextSteps: [
      'Zaprojektuj 3 szablony promptów z kontekstem firmowym (ton marki, format, kryteria jakości).',
      'Ustal „verification loop” dla treści i danych (fakty, źródła, liczby).',
      'Wybierz 1 proces do pełniejszej integracji AI (np. oferta handlowa, analiza zapytań).'
    ],
    pitfalls: [
      'Zalew generycznych treści o niskiej jakości.',
      'Syndrom „AI raz się pomyliło, więc nie działa”.',
      'Brak transferu wiedzy między działami.'
    ]
  },
  3: {
    levelName: 'Poziom 3 — Advanced Layer',
    summary:
      'Pojawiają się realne przewagi operacyjne. Teraz kluczowe jest utrwalenie standardów, skalowanie praktyk i połączenie ich ze strategią firmy.',
    nextSteps: [
      'Zidentyfikuj i wesprzyj AI Championów (3A/3B) w każdym kluczowym dziale.',
      'Ustal dashboard efektów: czas, jakość, oszczędności, adopcja.',
      'Połącz praktyki operacyjne z governance (zasady danych, wybór narzędzi, odpowiedzialność).'
    ],
    pitfalls: [
      'Uzależnienie efektów od 1–2 osób.',
      'Brak standaryzacji i trudność ze skalowaniem.',
      'Napięcie między szybkim eksperymentem a bezpieczeństwem danych.'
    ]
  },
  4: {
    levelName: 'Poziom 4 — AI Leaders',
    summary:
      'Firma myśli o AI systemowo: architektura, ryzyko, ROI i przewaga konkurencyjna. Priorytetem staje się utrzymanie równowagi między technologią i biznesem.',
    nextSteps: [
      'Wyrównaj mapę 4A/4B: połącz roadmapę techniczną z celami biznesowymi i finansowymi.',
      'Wdroż regularny przegląd modeli, kosztów i ryzyk (security/compliance).',
      'Zaplanij program redesignu ról i kompetencji pod kolejne 12 miesięcy.'
    ],
    pitfalls: [
      'Budowanie „science projects” bez wpływu na biznes.',
      'Obietnice strategiczne bez wykonalności technicznej.',
      'Niedoszacowanie kosztów skali i utrzymania.'
    ]
  }
};

const profileLabels: Record<ReadinessResult['profileTag'], string> = {
  '3A': 'Profil zbliżony do 3A (Power User)',
  '3B': 'Profil zbliżony do 3B (Advocate)',
  '4A': 'Profil zbliżony do 4A (Technical Architect)',
  '4B': 'Profil zbliżony do 4B (Strategic Visionary)',
  Balanced: 'Profil zbalansowany'
};

export function getProfileLabel(profileTag: ReadinessResult['profileTag']) {
  return profileLabels[profileTag];
}
