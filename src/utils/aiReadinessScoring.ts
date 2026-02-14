export type MaturityLevel = 1 | 2 | 3 | 4;

export interface QuestionDefinition {
  id: string;
  text: string;
  options: Array<{
    label: string;
    value: number;
  }>;
  axes: {
    x?: number;
    y?: number;
    z?: number;
  };
}

export interface AssessmentAnswers {
  [questionId: string]: number;
}

export interface ReadinessResult {
  overall: number;
  axisX: number;
  axisY: number;
  axisZ: number;
  computedLevel: MaturityLevel;
  displayedLevel: MaturityLevel;
  confidenceAdjusted: boolean;
  profileTag: '3A' | '3B' | '4A' | '4B' | 'Balanced';
}

export const readinessQuestions: QuestionDefinition[] = [
  {
    id: 'q1_frequency',
    text: 'Jak często Twój zespół używa AI do zadań zawodowych?',
    options: [
      { label: 'Prawie nigdy', value: 0 },
      { label: 'Sporadycznie (1–2 razy w miesiącu)', value: 1 },
      { label: 'Co tydzień', value: 2 },
      { label: 'Prawie codziennie', value: 3 },
      { label: 'Codziennie i w wielu procesach', value: 4 }
    ],
    axes: { y: 1, z: 0.5 }
  },
  {
    id: 'q2_usage_pattern',
    text: 'Który opis najlepiej oddaje obecny sposób pracy z AI?',
    options: [
      { label: 'Głównie korzystamy z automatycznych podpowiedzi w narzędziach', value: 0 },
      { label: 'Czasem odpalamy ChatGPT/Copilot do prostych pytań', value: 1 },
      { label: 'Świadomie używamy AI do konkretnych zadań', value: 2 },
      { label: 'Regularnie przebudowujemy sposób pracy pod AI', value: 3 },
      { label: 'AI jest elementem standardu operacyjnego', value: 4 }
    ],
    axes: { x: 1 }
  },
  {
    id: 'q3_prompting',
    text: 'Jak wygląda pisanie poleceń dla AI?',
    options: [
      { label: 'Jedno krótkie polecenie bez kontekstu', value: 0 },
      { label: 'Proste polecenie + czasem doprecyzowanie', value: 1 },
      { label: 'Dodajemy kontekst i oczekiwany format', value: 2 },
      { label: 'Poprawiamy polecenie 2–4 razy i używamy gotowych wzorów', value: 3 },
      { label: 'Mamy dopracowane sposoby pisania poleceń i własną bazę sprawdzonych wzorów', value: 4 }
    ],
    axes: { x: 1 }
  },
  {
    id: 'q4_verification',
    text: 'Co robicie, gdy AI wygeneruje odpowiedź?',
    options: [
      { label: 'Najczęściej kopiujemy bez weryfikacji', value: 0 },
      { label: 'Sprawdzamy tylko przy krytycznych zadaniach', value: 1 },
      { label: 'Mamy podstawową checklistę jakości', value: 2 },
      { label: 'Standardem jest kontrola faktów i poprawek', value: 3 },
      { label: 'Mamy formalną pętlę weryfikacji i odpowiedzialności', value: 4 }
    ],
    axes: { x: 1, y: 0.5 }
  },
  {
    id: 'q5_integration',
    text: 'Jak mocno AI jest włączone w codzienny sposób pracy?',
    options: [
      { label: 'To osobne narzędzie „od czasu do czasu”', value: 0 },
      { label: 'Często kopiuj-wklej między aplikacjami', value: 1 },
      { label: 'Mamy kilka stałych zastosowań', value: 2 },
      { label: 'AI wspiera kluczowe etapy procesów', value: 3 },
      { label: 'Sposób pracy został od początku ułożony z udziałem AI', value: 4 }
    ],
    axes: { x: 1, y: 1 }
  },
  {
    id: 'q6_tools',
    text: 'Jakich narzędzi i konfiguracji używacie?',
    options: [
      { label: 'Wyłącznie ustawienia domyślne', value: 0 },
      { label: 'Kilka narzędzi, bez konfiguracji', value: 1 },
      { label: 'Podstawowe własne instrukcje lub pliki', value: 2 },
      { label: 'Dobór modeli pod zadanie, własne szablony', value: 3 },
      { label: 'Połączenia między narzędziami i automatyzacje + kontrola kosztów', value: 4 }
    ],
    axes: { x: 1 }
  },
  {
    id: 'q7_enablement',
    text: 'Jak wiedza o AI rozchodzi się po firmie?',
    options: [
      { label: 'Każdy działa sam, bez wymiany wiedzy', value: 0 },
      { label: 'Czasem dzielimy się pojedynczą wskazówką', value: 1 },
      { label: 'Mamy osoby, które pokazują dobre praktyki', value: 2 },
      { label: 'Regularnie dzielimy się przykładami zastosowań i wzorami', value: 3 },
      { label: 'Mamy osoby wspierające zespół i krótkie szkolenia', value: 4 }
    ],
    axes: { z: 1 }
  },
  {
    id: 'q8_governance',
    text: 'Jak wygląda temat danych, bezpieczeństwa i zasad korzystania z AI?',
    options: [
      { label: 'Brak ustaleń', value: 0 },
      { label: 'Ogólne zalecenia, bez praktyki', value: 1 },
      { label: 'Podstawowe zasady dla zespołu', value: 2 },
      { label: 'Mamy jasne reguły + odpowiedzialność', value: 3 },
      { label: 'Zasady są powiązane z ryzykiem i procesami firmy', value: 4 }
    ],
    axes: { y: 1 }
  },
  {
    id: 'q9_strategy',
    text: 'Co jest dziś głównym celem AI w firmie?',
    options: [
      { label: 'Drobna oszczędność czasu', value: 0 },
      { label: 'Szybsze wykonywanie tych samych zadań', value: 1 },
      { label: 'Lepsza jakość pracy i krótsze cykle', value: 2 },
      { label: 'Przebudowa procesów i roli zespołów', value: 3 },
      { label: 'Realizacja celów strategicznych i przewagi rynkowej', value: 4 }
    ],
    axes: { y: 1, z: 0.5 }
  }
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function normalize(axisPoints: number, axisMax: number) {
  if (axisMax <= 0) {
    return 0;
  }
  return Math.round((axisPoints / axisMax) * 100);
}

function mapLevel(overall: number, axisX: number, axisY: number): MaturityLevel {
  if (overall < 25 || axisX < 20) {
    return 1;
  }

  if (overall < 50) {
    return 2;
  }

  if (overall < 75 || axisY < 70) {
    return 3;
  }

  return 4;
}

function profileFromAxes(axisX: number, axisY: number, axisZ: number): ReadinessResult['profileTag'] {
  if (axisX >= 80 && axisY >= 75) {
    return '4A';
  }

  if (axisY >= 80 && axisZ >= 70) {
    return '4B';
  }

  if (axisX >= 70 && axisZ < 55) {
    return '3A';
  }

  if (axisZ >= 65 && axisX >= 50) {
    return '3B';
  }

  return 'Balanced';
}

export function calculateReadiness(answers: AssessmentAnswers, selfPerceptionLevel: MaturityLevel) {
  const axisWeights = {
    x: 0,
    y: 0,
    z: 0
  };

  const axisPoints = {
    x: 0,
    y: 0,
    z: 0
  };

  for (const question of readinessQuestions) {
    const answer = answers[question.id] ?? 0;

    if (question.axes.x) {
      axisWeights.x += question.axes.x;
      axisPoints.x += answer * question.axes.x;
    }

    if (question.axes.y) {
      axisWeights.y += question.axes.y;
      axisPoints.y += answer * question.axes.y;
    }

    if (question.axes.z) {
      axisWeights.z += question.axes.z;
      axisPoints.z += answer * question.axes.z;
    }
  }

  const axisX = normalize(axisPoints.x, axisWeights.x * 4);
  const axisY = normalize(axisPoints.y, axisWeights.y * 4);
  const axisZ = normalize(axisPoints.z, axisWeights.z * 4);

  const weightedOverall = round(axisX * 0.45 + axisY * 0.35 + axisZ * 0.2);
  const overall = clamp(Math.round(weightedOverall), 0, 100);

  const computedLevel = mapLevel(overall, axisX, axisY);
  const confidenceAdjusted = selfPerceptionLevel - computedLevel >= 2;
  const displayedLevel = confidenceAdjusted
    ? (Math.max(1, computedLevel - 1) as MaturityLevel)
    : computedLevel;

  return {
    overall,
    axisX,
    axisY,
    axisZ,
    computedLevel,
    displayedLevel,
    confidenceAdjusted,
    profileTag: profileFromAxes(axisX, axisY, axisZ)
  } as ReadinessResult;
}
