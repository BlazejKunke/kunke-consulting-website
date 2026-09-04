/* ============================================================================
   CONFIG — every number worth arguing about lives here.
   ========================================================================= */

var CFG = {
  /* --- world ----------------------------------------------------------- */
  world: { w: 15000, h: 10000 },        // metres
  districtCount: 60,
  catchment: 1000,                       // metres people will walk to a station

  /* --- clock ------------------------------------------------------------ */
  startEpoch: Date.UTC(2025, 8, 4, 6, 0), // 4 Sept 2025, 06:00
  /* 12 game-hours in 6 real minutes => 2 game-minutes per real second */
  minutesPerRealSecond: 2,
  speeds: [0, 1, 2, 4, 8],

  /* --- money ------------------------------------------------------------ */
  startingBudget: 4600000,
  cost: {
    station: 210000,
    stationEscalation: 0.06,             // each station built makes the next dearer
    trackPerKm: 88000,
    bridge: 175000,                      // per river crossing
    train: 260000
  },
  upkeep: {
    stationPerDay: 4200,
    trainPerDay: 13500,
    trackPerKmPerDay: 1400
  },
  fare: { base: 1.9, perKm: 0.42 },
  subsidyPerPassenger: 0.95,             // the council's daily bung for moving people
  grantFloor: 400000,                    // you can never end a day below this
  milestones: [                          // one-off grants for growing ridership
    { pax: 25000,   cash: 250000, text: "25,000 journeys in a day. The council notices." },
    { pax: 60000,   cash: 500000, text: "60,000 in a day. A ribbon is cut somewhere." },
    { pax: 120000,  cash: 900000, text: "120,000. Regional news does a piece." },
    { pax: 250000,  cash: 1600000, text: "250,000. The Minister visits and says nothing useful." },
    { pax: 500000,  cash: 3000000, text: "Half a million a day. National news. Actual applause." },
    { pax: 1000000, cash: 6000000, text: "A million journeys in one day. Unbelievable scenes." }
  ],

  /* --- rolling stock ---------------------------------------------------- */
  train: {
    capacity: 640,
    speed: 950,        // metres per game-minute (~57 km/h average)
    dwell: 0.45,       // game-minutes at a station
    turnaround: 1.6    // game-minutes at a terminus
  },

  /* --- passengers ------------------------------------------------------- */
  pax: {
    patience: 22,        // game-minutes before they start giving up
    giveUpRate: 0.10,    // fraction per minute once out of patience
    transferPenalty: 4,  // minutes of perceived cost for changing trains
    boardPenalty: 1.2,   // minutes of perceived cost for boarding at all
    walkSpeed: 80        // metres per minute (unused for now, kept for clarity)
  },

  /* --- demand ----------------------------------------------------------- */
  modeShare: 0.40,       // trips per resident/job per day that could use the metro
  captureFalloff: 0.62,  // how much of a district's demand is lost at the edge of the catchment
  growth: {              // the city grows around a metro that works
    servedPerDay: 0.0022,
    unservedPerDay: 0.0003,
    cap: 3.5             // no district may grow past this multiple of its founding size
  },
  distanceDecay: 3800,   // metres; gravity model falloff
  minTripDistance: 700,  // people walk anything shorter

  /* --- look ------------------------------------------------------------- */
  colors: {
    bg: "#FCFBF7",
    grid: "#E8E6F2",
    gridMajor: "#DEDBEE",
    label: "#1B2A7A",
    ink: "#14203A",
    water: "#DCE9F2",
    waterEdge: "#C7DCEA",
    homes: "#F0E6D8",
    commercial: "#E2E6F2",
    industry: "#E8E2D2",
    homesEdge: "#E0D2BE",
    commercialEdge: "#CFD6EA",
    industryEdge: "#D8CFB8",
    chip: "#DFE1F6",
    chipActive: "#9AA0D0",
    chipInk: "#2E3170"
  },
  lineColors: [
    "#1F5C3A", "#D93A2B", "#8B5CF6", "#1D5FBF", "#E08A00",
    "#0F8B8D", "#C2185B", "#5D4037", "#7CB342", "#00838F",
    "#F4511E", "#3949AB"
  ]
};

/* --- hourly demand profiles ------------------------------------------------
   Index 0..23. Normalised at load so the 24h mean is exactly 1, which makes
   the daily trip totals behave predictably no matter how the curves are edited.
   prod = people setting off FROM this kind of place.
   attr = people wanting to arrive AT this kind of place.
   -------------------------------------------------------------------------- */
var PROFILES = {
  weekday: {
    homes: {
      prod: [0.05,0.03,0.02,0.02,0.08,0.35,0.95,1.85,1.95,1.05,0.55,0.45,0.45,0.45,0.50,0.60,0.70,0.70,0.60,0.45,0.35,0.25,0.15,0.08],
      attr: [0.20,0.12,0.08,0.05,0.05,0.08,0.12,0.18,0.25,0.30,0.35,0.40,0.45,0.55,0.70,0.95,1.45,1.95,1.75,1.20,0.90,0.70,0.55,0.35]
    },
    commercial: {
      prod: [0.10,0.06,0.04,0.03,0.04,0.08,0.15,0.25,0.35,0.45,0.55,0.70,0.90,0.80,0.75,0.90,1.35,1.95,1.60,1.10,0.85,0.75,0.55,0.30],
      attr: [0.15,0.08,0.05,0.04,0.06,0.22,0.60,1.25,1.85,1.60,1.10,1.00,1.10,0.95,0.85,0.80,0.75,0.70,0.75,0.70,0.55,0.40,0.25,0.18]
    },
    industry: {
      prod: [0.10,0.06,0.05,0.05,0.10,0.20,0.35,0.55,0.60,0.45,0.40,0.45,0.55,0.75,1.35,1.55,1.10,0.80,0.60,0.45,0.55,0.75,0.45,0.20],
      attr: [0.10,0.06,0.05,0.10,0.40,0.95,1.45,1.10,0.70,0.55,0.50,0.50,0.55,0.75,1.00,0.70,0.45,0.35,0.30,0.30,0.40,0.30,0.20,0.12]
    }
  },
  weekend: {
    homes: {
      prod: [0.15,0.10,0.06,0.04,0.04,0.06,0.12,0.25,0.45,0.80,1.20,1.45,1.35,1.15,1.00,0.95,0.90,0.85,0.80,0.75,0.60,0.45,0.35,0.25],
      attr: [0.45,0.35,0.25,0.15,0.08,0.06,0.08,0.12,0.20,0.30,0.45,0.60,0.75,0.85,0.95,1.10,1.30,1.45,1.50,1.40,1.20,1.00,0.80,0.60]
    },
    commercial: {
      prod: [0.25,0.18,0.12,0.06,0.04,0.05,0.08,0.12,0.20,0.35,0.55,0.80,1.05,1.20,1.30,1.40,1.45,1.40,1.30,1.15,0.95,0.75,0.55,0.38],
      attr: [0.20,0.12,0.08,0.05,0.04,0.06,0.10,0.20,0.40,0.75,1.25,1.60,1.70,1.65,1.50,1.30,1.10,0.90,0.75,0.60,0.45,0.32,0.22,0.16]
    },
    industry: {
      prod: [0.12,0.08,0.06,0.05,0.06,0.10,0.18,0.28,0.35,0.40,0.45,0.50,0.55,0.60,0.65,0.60,0.50,0.42,0.35,0.30,0.28,0.25,0.20,0.15],
      attr: [0.10,0.07,0.05,0.06,0.12,0.25,0.45,0.55,0.55,0.50,0.48,0.45,0.45,0.42,0.40,0.35,0.30,0.25,0.22,0.20,0.18,0.15,0.12,0.10]
    }
  }
};

/* Month multipliers: British seasons, British excuses. */
var SEASON = [
  { m: 1.02, name: "Winter",  note: "January. Everyone is at work and nobody is happy about it." },
  { m: 1.04, name: "Winter",  note: "February. Dark at both ends of the day." },
  { m: 1.03, name: "Spring",  note: "March. Optimism returns, briefly." },
  { m: 1.00, name: "Spring",  note: "April. Four seasons before lunch." },
  { m: 0.97, name: "Spring",  note: "May. Two bank holidays and no work done." },
  { m: 0.92, name: "Summer",  note: "June. Everyone suddenly owns a bicycle." },
  { m: 0.83, name: "Summer",  note: "July. Half the borough is in Spain." },
  { m: 0.80, name: "Summer",  note: "August. The city is empty and the trains are hot." },
  { m: 1.06, name: "Autumn",  note: "September. Term starts. The city refills overnight." },
  { m: 1.07, name: "Autumn",  note: "October. Dark, wet, busy. Peak metro weather." },
  { m: 1.05, name: "Autumn",  note: "November. Leaves on the line. Ridership up regardless." },
  { m: 0.99, name: "Winter",  note: "December. Shoppers by day, office parties by night." }
];

var DOW = [
  { m: 0.55, name: "Sunday",    weekend: true  },
  { m: 1.00, name: "Monday",    weekend: false },
  { m: 1.02, name: "Tuesday",   weekend: false },
  { m: 1.03, name: "Wednesday", weekend: false },
  { m: 1.02, name: "Thursday",  weekend: false },
  { m: 1.06, name: "Friday",    weekend: false },
  { m: 0.78, name: "Saturday",  weekend: true  }
];

/* normalise every profile to mean 1 */
(function normaliseProfiles() {
  var kinds = ["weekday", "weekend"], types = ["homes", "commercial", "industry"], dirs = ["prod", "attr"];
  for (var a = 0; a < kinds.length; a++)
    for (var b = 0; b < types.length; b++)
      for (var c = 0; c < dirs.length; c++) {
        var arr = PROFILES[kinds[a]][types[b]][dirs[c]], s = 0, i;
        for (i = 0; i < 24; i++) s += arr[i];
        var mean = s / 24;
        for (i = 0; i < 24; i++) arr[i] = arr[i] / mean;
      }
})();
