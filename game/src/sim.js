/* ============================================================================
   SIMULATION — clock, demand, trains, money.
   No DOM in here, so it can be run headless for balance testing.
   ========================================================================= */

function newGame(seed) {
  var city = buildCity(seed);
  var state = {
    seed: seed,
    version: 1,
    name: city.name,
    world: city.world,
    river: city.river,
    riverWidth: city.riverWidth,
    districts: city.districts,
    centreId: city.centreId,
    bag: city.bag,
    rnd: city.rnd,

    stations: [], lines: [],
    nextStationId: 1, nextLineId: 1, nextTrainId: 1,

    time: 0,                       // game minutes since CFG.startEpoch
    money: CFG.startingBudget,
    speed: 1,
    paused: true,

    today: blankDay(),
    yesterday: null,
    history: [],
    log: [],
    milestone: 0,
    satisfaction: 0.85,
    demandMult: 1.0,
    event: null,
    totalPax: 0,
    routingDirty: true,
    _minuteAcc: 0
  };

  for (var i = 0; i < state.districts.length; i++) {
    var d = state.districts[i];
    d.pop0 = d.pop; d.jobs0 = d.jobs;
    d.capture = 0; d.servedToday = 0;
    refreshPotential(d);
  }
  rollEvent(state);
  logMsg(state, "Welcome to " + state.name + ". There is no metro. Fix that.");
  return state;
}

function refreshPotential(d) {
  d.prodPotential = (d.pop * 0.90 + d.jobs * 0.35) * CFG.modeShare;
  d.attrPotential = (d.jobs * 0.90 + d.pop * 0.35) * CFG.modeShare;
}

/* A metro that works pulls people and jobs toward it. Slowly. */
function growCity(state) {
  var g = CFG.growth;
  var quality = Math.max(0, Math.min(1.4, state.satisfaction * 1.25));
  for (var i = 0; i < state.districts.length; i++) {
    var d = state.districts[i];
    var served = d.station !== null;
    var rate = served ? g.servedPerDay * quality * (0.4 + 0.6 * d.capture) : g.unservedPerDay;
    var capPop = d.pop0 * g.cap, capJobs = d.jobs0 * g.cap;
    d.pop = Math.min(capPop, d.pop * (1 + rate));
    d.jobs = Math.min(capJobs, d.jobs * (1 + rate));
    refreshPotential(d);
  }
}

function blankDay() {
  return { pax: 0, fares: 0, gaveUp: 0, waitSum: 0, waitN: 0, rideSum: 0, boardings: 0 };
}

function logMsg(state, text) {
  state.log.unshift({ t: state.time, text: text });
  if (state.log.length > 60) state.log.pop();
}

/* --- calendar -------------------------------------------------------------- */
function gameDate(state) { return new Date(CFG.startEpoch + state.time * 60000); }
function minuteOfDay(state) { var d = gameDate(state); return d.getUTCHours() * 60 + d.getUTCMinutes(); }
function dayIndex(state) { return Math.floor((state.time + 360) / 1440); } // day 0 = 4 Sept

function clockString(state) {
  var d = gameDate(state);
  return pad2(d.getUTCHours()) + ":" + pad2(d.getUTCMinutes());
}
function dateString(state) { return dateStringOf(gameDate(state)); }
function pad2(n) { return n < 10 ? "0" + n : "" + n; }

/* settleDay runs just after midnight, so the day being reported on is the one
   that has only just ended. Label it correctly. */
function dateStringOfClosingDay(state) {
  var now = new Date(CFG.startEpoch + state.time * 60000);
  var midnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return dateStringOf(new Date(midnight - 60000));
}
function dateStringOf(d) {
  var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return DOW[d.getUTCDay()].name + " " + d.getUTCDate() + " " + months[d.getUTCMonth()] + " " + d.getUTCFullYear();
}

/* --- the tick -------------------------------------------------------------- */
function tick(state, dtMin) {
  if (dtMin <= 0) return;
  if (state.routingDirty) buildRouting(state);

  var before = gameDate(state).getUTCDate();
  state.time += dtMin;
  if (gameDate(state).getUTCDate() !== before) settleDay(state);

  /* demand runs on whole game-minutes; movement runs continuously */
  state._minuteAcc += dtMin;
  while (state._minuteAcc >= 1) {
    state._minuteAcc -= 1;
    generateDemand(state, 1);
    decayQueues(state, 1);
  }
  moveTrains(state, dtMin);
}

/* --- demand ---------------------------------------------------------------- */
function generateDemand(state, dtMin) {
  if (!state.stations.length) return;
  var R = state.routing;
  if (!R) return;

  var d = gameDate(state);
  var hour = d.getUTCHours();
  var frac = d.getUTCMinutes() / 60;
  var dow = DOW[d.getUTCDay()];
  var prof = PROFILES[dow.weekend ? "weekend" : "weekday"];
  var season = SEASON[d.getUTCMonth()];
  var eventMult = state.event ? state.event.mult : 1;
  var globalMult = dow.m * season.m * eventMult * state.demandMult;

  /* served districts only */
  var served = [];
  for (var i = 0; i < state.districts.length; i++) {
    var dd = state.districts[i];
    if (dd.station === null) continue;
    var p = prof[dd.type];
    dd._prod = dd.prodPotential * dd.capture / 1440 * lerp24(p.prod, hour, frac);
    dd._attr = dd.attrPotential * dd.capture * lerp24(p.attr, hour, frac);
    served.push(dd);
  }
  if (served.length < 2) return;

  var noise = 0.88 + state.rnd() * 0.24;

  for (var a = 0; a < served.length; a++) {
    var o = served[a];
    var rate = o._prod * globalMult * noise * dtMin;
    if (rate <= 0.0001) continue;
    var oSt = R.idxOfStation[o.station];
    if (oSt === undefined) continue;

    /* destination weights */
    var w = [], sum = 0;
    for (var b = 0; b < served.length; b++) {
      var t = served[b];
      if (t.station === o.station) { w.push(0); continue; }
      var dist = Math.hypot(t.x - o.x, t.y - o.y);
      if (dist < CFG.minTripDistance) { w.push(0); continue; }
      if (!isFinite(routeCost(state, oSt, t.station))) { w.push(0); continue; }
      var val = t._attr * Math.exp(-dist / CFG.distanceDecay);
      w.push(val); sum += val;
    }
    if (sum <= 0) continue;

    var st = stationById(state, o.station);
    for (var c = 0; c < served.length; c++) {
      if (w[c] <= 0) continue;
      var n = rate * (w[c] / sum);
      if (n < 0.0005) continue;
      var dest = served[c].station;
      var km = Math.hypot(served[c].x - o.x, served[c].y - o.y) / 1000;
      var fare = CFG.fare.base + CFG.fare.perKm * km;
      var q = st.waiting[dest];
      if (!q) { q = st.waiting[dest] = { n: 0, tsum: 0, fsum: 0, wsum: 0 }; }
      q.n += n; q.tsum += n * state.time; q.fsum += n * fare; q.wsum += n * state.time;
      st.waitingTotal += n;
      o.servedToday += n;
    }
  }
}

function lerp24(arr, hour, frac) {
  var a = arr[hour % 24], b = arr[(hour + 1) % 24];
  return a + (b - a) * frac;
}

/* People give up if they have been standing there too long. */
function decayQueues(state, dtMin) {
  for (var i = 0; i < state.stations.length; i++) {
    var s = state.stations[i], total = 0;
    for (var k in s.waiting) {
      var q = s.waiting[k];
      if (q.n <= 0.0001) { delete s.waiting[k]; continue; }
      var avgWait = state.time - q.wsum / q.n;
      if (avgWait > CFG.pax.patience) {
        var lost = q.n * CFG.pax.giveUpRate * dtMin * Math.min(3, avgWait / CFG.pax.patience);
        if (lost > q.n) lost = q.n;
        var share = lost / q.n;
        q.tsum -= q.tsum * share; q.fsum -= q.fsum * share; q.wsum -= q.wsum * share; q.n -= lost;
        s.gaveUp += lost;
        state.today.gaveUp += lost;
      }
      total += q.n;
    }
    s.waitingTotal = total;
    s.crowd = s.crowd * 0.9 + total * 0.1;
  }
}

/* --- trains ---------------------------------------------------------------- */
function addTrain(state, line) {
  var t = {
    id: state.nextTrainId++,
    line: line.id,
    pos: 0, dir: 1, mode: "dwell", timer: 0.1,
    stopIdx: 0,
    onboard: {}, load: 0
  };
  /* stagger new trains along the line so they do not all leave together */
  if (line.trains.length && line.length > 0) {
    var frac = (line.trains.length % 2) ? 0.5 : 0.25;
    t.pos = line.length * frac;
    t.mode = "run";
    t.stopIdx = 0;
    for (var i = 0; i < line.stopArc.length; i++) if (line.stopArc[i] > t.pos) { t.stopIdx = i; break; }
  }
  line.trains.push(t);
  state.routingDirty = true;
  return t;
}

function moveTrains(state, dtMin) {
  for (var i = 0; i < state.lines.length; i++) {
    var L = state.lines[i];
    if (L.stops.length < 2) continue;
    for (var j = 0; j < L.trains.length; j++) {
      var T = L.trains[j];
      var guard = 0;
      var remaining = dtMin;
      while (remaining > 0 && guard++ < 40) {
        if (T.mode === "dwell") {
          T.timer -= remaining;
          if (T.timer > 0) { remaining = 0; break; }
          remaining = -T.timer;
          /* try to depart */
          var atTerminus = (T.stopIdx === 0 || T.stopIdx === L.stops.length - 1);
          if (atTerminus) {
            var end = T.stopIdx === 0 ? 0 : 1;
            var hw = lineHeadway(L);
            var since = state.time - L.lastDeparture[end];
            if (isFinite(hw) && L.trains.length > 1 && since < hw * 0.88) { T.timer = 0.1; remaining = 0; break; }
            L.lastDeparture[end] = state.time;
            T.dir = T.stopIdx === 0 ? 1 : -1;
          }
          T.mode = "run";
        } else {
          var nextIdx = T.stopIdx + T.dir;
          if (nextIdx < 0) nextIdx = 1;
          if (nextIdx > L.stops.length - 1) nextIdx = L.stops.length - 2;
          var targetArc = L.stopArc[nextIdx];
          var travel = CFG.train.speed * remaining * T.dir;
          var newPos = T.pos + travel;
          var arrived = T.dir > 0 ? (newPos >= targetArc) : (newPos <= targetArc);
          if (arrived) {
            var used = Math.abs(targetArc - T.pos) / CFG.train.speed;
            remaining -= used;
            T.pos = targetArc;
            T.stopIdx = nextIdx;
            var terminusNow = (nextIdx === 0 || nextIdx === L.stops.length - 1);
            T.mode = "dwell";
            T.timer = terminusNow ? CFG.train.turnaround : CFG.train.dwell;
            serviceStop(state, L, T);
          } else {
            T.pos = newPos;
            remaining = 0;
          }
        }
      }
    }
  }
}

/* Alight, then board. Direction used is the one the train will leave in. */
function serviceStop(state, L, T) {
  var R = state.routing;
  if (!R) return;
  var idx = T.stopIdx;
  var st = stationById(state, L.stops[idx]);
  if (!st) return;
  var outDir = (idx === 0) ? 1 : (idx === L.stops.length - 1 ? -1 : T.dir);
  var hereNode = R.lineNodes[L.id] ? R.lineNodes[L.id][idx] : undefined;
  var aheadIdx = idx + outDir;
  var aheadNode = (R.lineNodes[L.id] && aheadIdx >= 0 && aheadIdx < L.stops.length) ? R.lineNodes[L.id][aheadIdx] : -1;
  var stationNode = R.idxOfStation[st.id];
  var k, q;

  /* --- alight ---------------------------------------------------------- */
  for (k in T.onboard) {
    q = T.onboard[k];
    if (q.n <= 0.0001) { delete T.onboard[k]; continue; }
    var destId = +k;
    if (destId === st.id) {
      /* delivered */
      state.today.pax += q.n;
      state.today.fares += q.fsum;
      state.today.rideSum += q.n * (state.time - q.tsum / q.n);
      state.totalPax += q.n;
      L.paxToday += q.n;
      st.alighted += q.n;
      T.load -= q.n;
      delete T.onboard[k];
      continue;
    }
    var hop = (hereNode === undefined) ? -1 : nextHop(state, hereNode, destId);
    var stayOnBoard = (hop >= 0 && hop === aheadNode);
    if (!stayOnBoard) {
      /* transfer: back onto the platform, keeping their fare and start time */
      var w = st.waiting[destId];
      if (!w) w = st.waiting[destId] = { n: 0, tsum: 0, fsum: 0, wsum: 0 };
      w.n += q.n; w.tsum += q.tsum; w.fsum += q.fsum;
      w.wsum += q.n * state.time;   // they have only just stepped onto this platform
      st.waitingTotal += q.n;
      T.load -= q.n;
      delete T.onboard[k];
    }
  }
  if (T.load < 0) T.load = 0;

  /* --- board ----------------------------------------------------------- */
  if (aheadNode < 0) return;
  var space = CFG.train.capacity - T.load;
  if (space <= 0.01) return;

  var rideAhead = Math.abs(L.stopArc[aheadIdx] - L.stopArc[idx]) / CFG.train.speed + CFG.train.dwell;
  var cands = [];
  for (k in st.waiting) {
    q = st.waiting[k];
    if (q.n <= 0.0001) continue;
    var dst = +k;
    var viaHere = rideAhead + routeCost(state, aheadNode, dst);
    if (!isFinite(viaHere)) continue;
    var best = routeCost(state, stationNode, dst);
    /* Board only if this train genuinely helps. `best` already includes the wait
       for the ideal line, so anything at least as good is worth getting on --
       but a looser rule than this sends people back and forth between stations. */
    if (viaHere <= best + 1.0) cands.push({ dst: dst, wait: state.time - q.wsum / q.n, q: q });
  }
  cands.sort(function (a, b) { return b.wait - a.wait; });

  for (var i = 0; i < cands.length && space > 0.01; i++) {
    var c = cands[i], take = Math.min(space, c.q.n);
    var share = take / c.q.n;
    var tsumTake = c.q.tsum * share, fsumTake = c.q.fsum * share;
    c.q.n -= take; c.q.tsum -= tsumTake; c.q.fsum -= fsumTake; c.q.wsum -= c.q.wsum * share;
    st.waitingTotal -= take;
    if (c.q.n <= 0.0001) delete st.waiting[c.dst];

    var ob = T.onboard[c.dst];
    if (!ob) ob = T.onboard[c.dst] = { n: 0, tsum: 0, fsum: 0 };
    ob.n += take; ob.tsum += tsumTake; ob.fsum += fsumTake;
    T.load += take;
    space -= take;

    st.boarded += take;
    state.today.boardings += take;
    state.today.waitSum += take * c.wait;
    state.today.waitN += take;
  }
}

/* --- money ----------------------------------------------------------------- */
function networkKm(state) {
  var km = 0;
  for (var i = 0; i < state.lines.length; i++) km += state.lines[i].length / 1000;
  return km;
}
function trainCount(state) {
  var n = 0;
  for (var i = 0; i < state.lines.length; i++) n += state.lines[i].trains.length;
  return n;
}

function settleDay(state) {
  var d = state.today;
  var subsidy = d.pax * CFG.subsidyPerPassenger;
  var upkeep = state.stations.length * CFG.upkeep.stationPerDay
             + trainCount(state) * CFG.upkeep.trainPerDay
             + networkKm(state) * CFG.upkeep.trackPerKmPerDay;
  var net = d.fares + subsidy - upkeep;
  state.money += net;

  var grant = 0;
  if (state.money < CFG.grantFloor) { grant = CFG.grantFloor - state.money; state.money = CFG.grantFloor; }

  /* satisfaction: were people carried, and how long did they stand about? */
  var delivered = d.pax, lost = d.gaveUp;
  var carriedShare = (delivered + lost) > 0 ? delivered / (delivered + lost) : 0.85;
  var avgWait = d.waitN > 0 ? d.waitSum / d.waitN : 0;
  var waitScore = Math.max(0, 1 - Math.max(0, avgWait - 4) / 16);
  var dayScore = state.stations.length ? (carriedShare * 0.65 + waitScore * 0.35) : 0.85;
  state.satisfaction = state.satisfaction * 0.6 + dayScore * 0.4;
  state.demandMult = 0.82 + 0.32 * state.satisfaction;

  /* milestones */
  var bonus = 0, bonusText = null;
  while (state.milestone < CFG.milestones.length && d.pax >= CFG.milestones[state.milestone].pax) {
    bonus += CFG.milestones[state.milestone].cash;
    bonusText = CFG.milestones[state.milestone].text;
    state.milestone++;
  }
  state.money += bonus;

  var report = {
    date: dateStringOfClosingDay(state),
    pax: d.pax, fares: d.fares, subsidy: subsidy, upkeep: upkeep, net: net,
    grant: grant, bonus: bonus, bonusText: bonusText,
    gaveUp: d.gaveUp,
    avgWait: avgWait,
    avgRide: d.pax > 0 ? d.rideSum / d.pax : 0,
    satisfaction: state.satisfaction,
    money: state.money,
    headline: makeHeadline(state, d)
  };
  state.yesterday = report;
  state.history.push({ pax: d.pax, net: net, money: state.money });
  if (state.history.length > 400) state.history.shift();
  if (bonusText) logMsg(state, bonusText + " Grant: " + money(bonus) + ".");
  if (grant > 0) logMsg(state, "Emergency grant from the borough: " + money(grant) + ". Nobody will mention it again.");

  for (var i = 0; i < state.stations.length; i++) {
    var s = state.stations[i]; s.boarded = 0; s.alighted = 0; s.gaveUp = 0;
  }
  for (var j = 0; j < state.lines.length; j++) state.lines[j].paxToday = 0;
  for (var k = 0; k < state.districts.length; k++) state.districts[k].servedToday = 0;

  growCity(state);
  state.today = blankDay();
  rollEvent(state);
}

function rollEvent(state) {
  var e = METRO_NAMES.events[Math.floor(state.rnd() * METRO_NAMES.events.length)];
  state.event = { text: fillTokens(state, e.text), mult: e.mult };
  logMsg(state, state.event.text);
}

function makeHeadline(state, d) {
  var h = METRO_NAMES.headlines[Math.floor(state.rnd() * METRO_NAMES.headlines.length)];
  return fillTokens(state, h).replace(/\{PAX\}/g, Math.round(d.pax).toLocaleString("en-GB"));
}

function fillTokens(state, s) {
  var st = state.stations.length ? state.stations[Math.floor(state.rnd() * state.stations.length)].name : "the bus station";
  var ln = state.lines.length ? state.lines[Math.floor(state.rnd() * state.lines.length)].name : "the number 9 bus";
  return s.replace(/\{CITY\}/g, state.name)
          .replace(/\{STATION\}/g, st)
          .replace(/\{LINE\}/g, ln)
          .replace(/\{NUM\}/g, String(Math.floor(state.rnd() * 40) + 3))
          .replace(/\{PAX\}/g, Math.round(state.today.pax).toLocaleString("en-GB"));
}

/* --- formatting ------------------------------------------------------------ */
function money(v) {
  var neg = v < 0; v = Math.abs(v);
  var s;
  if (v >= 1e9) s = "£" + (v / 1e9).toFixed(2) + "bn";
  else if (v >= 1e6) s = "£" + (v / 1e6).toFixed(2) + "m";
  else if (v >= 1e3) s = "£" + Math.round(v / 1e3) + "k";
  else s = "£" + Math.round(v);
  return (neg ? "-" : "") + s;
}
function num(v) { return Math.round(v).toLocaleString("en-GB"); }
