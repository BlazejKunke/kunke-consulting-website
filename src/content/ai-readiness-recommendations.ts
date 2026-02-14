import type { MaturityLevel, ReadinessResult } from '../utils/aiReadinessScoring';

interface LevelContent {
  levelName: string;
  summary: string;
  nextSteps: string[];
  pitfalls: string[];
}

export const levelContent: Record<MaturityLevel, LevelContent> = {
  1: {
    levelName: 'Poziom 1 — Początki',
    summary:
      'AI jest obecne, ale działa głównie „w tle”. Największa szansa to przejście z pasywnego użycia do świadomego wyboru narzędzia i kontroli jakości.',
    nextSteps: [
      'Wprowadź 45-minutowe szkolenie: podstawy użycia AI i ryzyka związane z danymi.',
      'Wybierz 2 bezpieczne zastosowania (np. podsumowanie spotkań, szkic e-maila) i opisz prostą instrukcję.',
      'Dodaj zasadę: każdą odpowiedź AI człowiek szybko sprawdza przed użyciem.'
    ],
    pitfalls: [
      'Bezrefleksyjne kopiowanie odpowiedzi AI.',
      'Wklejanie danych wrażliwych do przypadkowych narzędzi.',
      'Brak wspólnego języka i definicji, czym jest AI w firmie.'
    ]
  },
  2: {
    levelName: 'Poziom 2 — Pierwsze nawyki',
    summary:
      'Zespół używa AI świadomie, ale głównie do pojedynczych zadań. To dobry etap na przejście z „szybciej” do „lepiej i systemowo”.',
    nextSteps: [
      'Przygotuj 3 wzory poleceń z kontekstem firmowym (styl marki, format, kryteria jakości).',
      'Ustal stały sposób sprawdzania treści i danych (fakty, źródła, liczby).',
      'Wybierz 1 proces, w którym AI będzie używane szerzej (np. oferta handlowa, analiza zapytań).'
    ],
    pitfalls: [
      'Zalew generycznych treści o niskiej jakości.',
      'Syndrom „AI raz się pomyliło, więc nie działa”.',
      'Brak transferu wiedzy między działami.'
    ]
  },
  3: {
    levelName: 'Poziom 3 — Uporządkowane działania',
    summary:
      'Pojawiają się realne przewagi operacyjne. Teraz kluczowe jest utrwalenie standardów, skalowanie praktyk i połączenie ich ze strategią firmy.',
    nextSteps: [
      'Wskaż osoby, które dobrze pracują z AI (3A/3B), i wesprzyj je w każdym kluczowym dziale.',
      'Wprowadź prostą tablicę wyników: czas, jakość, oszczędności i skala użycia.',
      'Połącz codzienną pracę z jasnymi zasadami: dane, wybór narzędzi i odpowiedzialność.'
    ],
    pitfalls: [
      'Uzależnienie efektów od 1–2 osób.',
      'Brak standaryzacji i trudność ze skalowaniem.',
      'Napięcie między szybkim eksperymentem a bezpieczeństwem danych.'
    ]
  },
  4: {
    levelName: 'Poziom 4 — Świadome przywództwo',
    summary:
      'Firma myśli o AI całościowo: sposób działania, ryzyko, opłacalność i przewaga rynkowa. Priorytetem jest równowaga między technologią a celami biznesowymi.',
    nextSteps: [
      'Połącz profile 4A/4B: zgraj plan rozwoju technologii z celami biznesowymi i finansowymi.',
      'Wprowadź regularny przegląd narzędzi, kosztów i ryzyk (bezpieczeństwo i zgodność).',
      'Zaplanij program przebudowy ról i kompetencji na kolejne 12 miesięcy.'
    ],
    pitfalls: [
      'Budowanie projektów pokazowych bez realnego wpływu na wyniki firmy.',
      'Duże obietnice bez możliwości sprawnego wdrożenia.',
      'Niedoszacowanie kosztów skali i utrzymania.'
    ]
  }
};

const profileLabels: Record<ReadinessResult['profileTag'], string> = {
  '3A': 'Profil 3A — mocna codzienna praktyka',
  '3B': 'Profil 3B — mocne dzielenie się wiedzą',
  '4A': 'Profil 4A — mocne uporządkowanie działań',
  '4B': 'Profil 4B — mocne myślenie długoterminowe',
  Balanced: 'Profil zbalansowany'
};

export function getProfileLabel(profileTag: ReadinessResult['profileTag']) {
  return profileLabels[profileTag];
}
