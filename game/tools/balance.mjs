/* Headless balance harness. A greedy robot mayor builds a metro; we watch the
   money and the ridership to see whether the economy paces sensibly.
   Run: node game/tools/balance.mjs [days] [seed]                            */
import fs from "node:fs";
import vm from "node:vm";

const root = new URL("../", import.meta.url).pathname;
for (const f of ["data/names.js", "src/config.js", "src/rng.js", "src/city.js", "src/network.js", "src/sim.js"]) {
  vm.runInThisContext(fs.readFileSync(root + f, "utf8"), { filename: f });
}

const DAYS = Number(process.argv[2] || 40);
const SEED = Number(process.argv[3] || 12345);
const S = newGame(SEED);

function afford(v) { return S.money >= v; }

/* --- the robot mayor ------------------------------------------------------- */
function bestUnserved(nearX, nearY) {
  let best = null, bestScore = -1;
  for (const d of S.districts) {
    if (d.station !== null) continue;
    const dist = Math.hypot(d.x - nearX, d.y - nearY);
    const score = (d.prodPotential + d.attrPotential) / (1 + dist / 2200);
    if (score > bestScore) { bestScore = score; best = d; }
  }
  return best;
}

function robotTurn() {
  /* 1. no network yet: found the first line at the city centre */
  if (!S.lines.length) {
    const c = S.districts[S.centreId];
    const L = addLine(S);
    const st = addStation(S, c.x, c.y);
    L.stops.push(st.id);
    rebuildLine(S, L);
    S.money -= stationCost(S);
    S.routingDirty = true;
    return;
  }

  /* 2. trains: every line wants at least two, then one per four stops */
  for (const L of S.lines) {
    if (L.stops.length < 2) continue;
    const crowd = L.stops.reduce((a, id) => a + stationById(S, id).crowd, 0);
    const want = Math.max(2, Math.ceil(L.stops.length / 3) + Math.floor(crowd / 900));
    if (L.trains.length < want && afford(CFG.cost.train * 1.4)) {
      S.money -= CFG.cost.train;
      addTrain(S, L);
      return;
    }
  }

  /* 3. extend the line whose end is closest to a juicy unserved district */
  let bestPlan = null;
  for (const L of S.lines) {
    for (const front of [true, false]) {
      if (!L.stops.length) continue;
      const endId = front ? L.stops[0] : L.stops[L.stops.length - 1];
      const end = stationById(S, endId);
      const d = bestUnserved(end.x, end.y);
      if (!d) continue;
      const c = extendCost(S, L, d, front);
      const total = c.total + stationCost(S);
      const value = (d.prodPotential + d.attrPotential) / total;
      if (!bestPlan || value > bestPlan.value) bestPlan = { L, front, d, total, value };
    }
  }
  if (bestPlan && afford(bestPlan.total + CFG.cost.train * 0.8)) {
    const st = addStation(S, bestPlan.d.x, bestPlan.d.y);
    if (bestPlan.front) bestPlan.L.stops.unshift(st.id); else bestPlan.L.stops.push(st.id);
    rebuildLine(S, bestPlan.L);
    S.money -= bestPlan.total;
    S.routingDirty = true;
    if (bestPlan.L.trains.length === 0 && afford(CFG.cost.train)) { S.money -= CFG.cost.train; addTrain(S, bestPlan.L); }
    return;
  }

  /* 4. a fifth line eventually, once there is money spare */
  if (S.lines.length < 4 && S.money > 4_000_000) {
    const L = addLine(S);
    const d = bestUnserved(S.world.w / 2, S.world.h / 2);
    if (d) { const st = addStation(S, d.x, d.y); L.stops.push(st.id); rebuildLine(S, L); S.money -= stationCost(S); S.routingDirty = true; }
  }
}

/* --- run ------------------------------------------------------------------- */
const STEP = 0.5; // game-minutes per sim step
let lastDay = -1;
console.log("day  date                       stations  km   trains  pax/day     net/day     balance   sat  wait");
for (let m = 0; m < DAYS * 1440; m += STEP) {
  tick(S, STEP);
  if (Math.floor(m) % 20 === 0) robotTurn();
  const day = Math.floor((S.time + 360) / 1440);
  if (day !== lastDay) {
    lastDay = day;
    const y = S.yesterday;
    if (y) {
      console.log(
        String(day).padStart(3) + "  " + y.date.padEnd(26) +
        String(S.stations.length).padStart(6) +
        networkKm(S).toFixed(0).padStart(6) +
        String(trainCount(S)).padStart(7) +
        num(y.pax).padStart(11) +
        money(y.net).padStart(12) +
        money(y.money).padStart(11) +
        (y.satisfaction * 100).toFixed(0).padStart(5) +
        y.avgWait.toFixed(1).padStart(6)
      );
    }
  }
}
const totalPot = S.districts.reduce((a, d) => a + d.prodPotential, 0);
console.log("\ncity: " + S.name + "  |  districts: " + S.districts.length +
  "  |  daily trip potential if fully served: " + num(totalPot));
console.log("captured on the final day: " + num(S.yesterday.pax) +
  " (" + (100 * S.yesterday.pax / totalPot).toFixed(1) + "%)");
