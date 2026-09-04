/* ============================================================================
   NETWORK — stations, octilinear lines, and the routing table that tells a
   passenger which train to get on.
   ========================================================================= */

/* --- octilinear geometry --------------------------------------------------
   Every segment is a straight run plus one 45-degree diagonal, which is what
   makes a metro map look like a metro map.
   -------------------------------------------------------------------------- */
function elbowPath(a, b, bendAtStart) {
  var dx = b.x - a.x, dy = b.y - a.y;
  var adx = Math.abs(dx), ady = Math.abs(dy);
  var sx = dx < 0 ? -1 : 1, sy = dy < 0 ? -1 : 1;
  var pts = [{ x: a.x, y: a.y }];
  if (adx > ady + 1) {
    var run = adx - ady;
    pts.push(bendAtStart ? { x: a.x + sx * run, y: a.y } : { x: b.x - sx * run, y: b.y });
  } else if (ady > adx + 1) {
    var run2 = ady - adx;
    pts.push(bendAtStart ? { x: a.x, y: a.y + sy * run2 } : { x: b.x, y: b.y - sy * run2 });
  }
  pts.push({ x: b.x, y: b.y });
  return pts;
}

function bendFlag(idA, idB) { return ((idA * 31 + idB * 17) & 1) === 0; }

function polyLength(pts) {
  var L = 0;
  for (var i = 0; i < pts.length - 1; i++) L += Math.hypot(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y);
  return L;
}

/* --- river crossings (bridges cost money) --------------------------------- */
function crossingsOf(state, pts) {
  var n = 0;
  for (var i = 0; i < pts.length - 1; i++)
    for (var j = 0; j < state.river.length - 1; j++)
      if (segmentsCross(pts[i], pts[i + 1], state.river[j], state.river[j + 1])) { n++; break; }
  return n;
}

/* --- building blocks ------------------------------------------------------ */
function addStation(state, x, y, name) {
  var s = {
    id: state.nextStationId++,
    name: name || state.bag.station(),
    x: Math.round(x), y: Math.round(y),
    lines: [],
    waiting: {},      // destStationId -> { n, tsum, fsum }
    waitingTotal: 0,
    boarded: 0, alighted: 0, gaveUp: 0,
    crowd: 0
  };
  state.stations.push(s);
  assignCatchment(state);
  return s;
}

function addLine(state, name) {
  var l = {
    id: state.nextLineId++,
    name: name || state.bag.line(),
    color: CFG.lineColors[state.lines.length % CFG.lineColors.length],
    stops: [],
    trains: [],
    path: null,
    length: 0,
    lastDeparture: [-999, -999],
    paxToday: 0
  };
  state.lines.push(l);
  return l;
}

/* Cost of adding stationId to the end of a line (track + bridges). */
function extendCost(state, line, toStation, atFront) {
  if (!line.stops.length) return { track: 0, bridges: 0, total: 0, km: 0 };
  var fromId = atFront ? line.stops[0] : line.stops[line.stops.length - 1];
  var from = stationById(state, fromId);
  var toId = toStation.id === undefined ? state.nextStationId : toStation.id;
  var pts = elbowPath(from, toStation, bendFlag(from.id, toId));
  var km = polyLength(pts) / 1000;
  var br = crossingsOf(state, pts);
  return { track: km * CFG.cost.trackPerKm, bridges: br * CFG.cost.bridge, km: km, total: km * CFG.cost.trackPerKm + br * CFG.cost.bridge };
}

/* Station number N costs more than station number 1: land, lawyers, objections. */
function stationCost(state) {
  return Math.round(CFG.cost.station * (1 + CFG.cost.stationEscalation * state.stations.length));
}

function stationById(state, id) {
  for (var i = 0; i < state.stations.length; i++) if (state.stations[i].id === id) return state.stations[i];
  return null;
}
function lineById(state, id) {
  for (var i = 0; i < state.lines.length; i++) if (state.lines[i].id === id) return state.lines[i];
  return null;
}

/* Rebuild the drawn path and the arc positions of each stop. */
function rebuildLine(state, line) {
  line.path = [];
  line.stopArc = [];
  line.segs = [];
  if (line.stops.length < 2) {
    line.length = 0;
    if (line.stops.length === 1) {
      var only = stationById(state, line.stops[0]);
      line.path = [{ x: only.x, y: only.y }];
      line.stopArc = [0];
    }
    return;
  }
  var arc = 0;
  var a = stationById(state, line.stops[0]);
  line.path.push({ x: a.x, y: a.y });
  line.stopArc.push(0);
  for (var i = 1; i < line.stops.length; i++) {
    var b = stationById(state, line.stops[i]);
    var pts = elbowPath(a, b, bendFlag(a.id, b.id));
    for (var k = 1; k < pts.length; k++) {
      arc += Math.hypot(pts[k].x - pts[k - 1].x, pts[k].y - pts[k - 1].y);
      line.path.push(pts[k]);
    }
    line.stopArc.push(arc);
    line.segs.push({ a: a.id, b: b.id, pts: pts });
    a = b;
  }
  line.length = arc;

  /* refresh station -> line membership */
  for (var s = 0; s < state.stations.length; s++) {
    var st = state.stations[s], idx = st.lines.indexOf(line.id);
    var on = line.stops.indexOf(st.id) >= 0;
    if (on && idx < 0) st.lines.push(line.id);
    if (!on && idx >= 0) st.lines.splice(idx, 1);
  }
}

/* Point on a line's path at arc distance d. */
function pointAtArc(line, d) {
  var pts = line.path;
  if (!pts || pts.length === 0) return { x: 0, y: 0, ang: 0 };
  if (pts.length === 1) return { x: pts[0].x, y: pts[0].y, ang: 0 };
  if (d <= 0) d = 0;
  if (d >= line.length) d = line.length;
  var acc = 0;
  for (var i = 0; i < pts.length - 1; i++) {
    var seg = Math.hypot(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y);
    if (acc + seg >= d || i === pts.length - 2) {
      var t = seg === 0 ? 0 : (d - acc) / seg;
      return {
        x: pts[i].x + (pts[i + 1].x - pts[i].x) * t,
        y: pts[i].y + (pts[i + 1].y - pts[i].y) * t,
        ang: Math.atan2(pts[i + 1].y - pts[i].y, pts[i + 1].x - pts[i].x)
      };
    }
    acc += seg;
  }
  return { x: pts[pts.length - 1].x, y: pts[pts.length - 1].y, ang: 0 };
}

/* Every district takes the nearest station inside walking distance. */
function assignCatchment(state) {
  for (var i = 0; i < state.districts.length; i++) {
    var d = state.districts[i], best = null, bestD = CFG.catchment;
    for (var j = 0; j < state.stations.length; j++) {
      var s = state.stations[j], dist = Math.hypot(s.x - d.x, s.y - d.y);
      if (dist < bestD) { bestD = dist; best = s; }
    }
    d.station = best ? best.id : null;
    d.walk = best ? bestD : null;
    /* people right on top of a station nearly all use it; people at the edge
       of the catchment mostly cannot be bothered */
    d.capture = best ? 1 - CFG.captureFalloff * Math.pow(bestD / CFG.catchment, 1.3) : 0;
  }
}

/* ==========================================================================
   ROUTING
   Nodes: one "waiting at station" node per station, plus one node per stop on
   every line ("aboard line L at stop i"). Boarding costs half a headway plus a
   penalty, riding costs time, alighting is free — which makes an interchange
   cost exactly what an interchange should cost: another wait.
   ========================================================================== */
function buildRouting(state) {
  var stations = state.stations, S = stations.length;
  var idxOfStation = {};
  var nodes = [];
  var i, j, k;

  for (i = 0; i < S; i++) { idxOfStation[stations[i].id] = nodes.length; nodes.push({ st: stations[i].id, line: -1 }); }

  var lineNodes = {};
  for (i = 0; i < state.lines.length; i++) {
    var L = state.lines[i];
    lineNodes[L.id] = [];
    for (j = 0; j < L.stops.length; j++) { lineNodes[L.id].push(nodes.length); nodes.push({ st: L.stops[j], line: L.id, pos: j }); }
  }
  var N = nodes.length;

  /* adjacency, forward and reversed */
  var fwd = [], rev = [];
  for (i = 0; i < N; i++) { fwd.push([]); rev.push([]); }
  function edge(u, v, w) { fwd[u].push({ v: v, w: w }); rev[v].push({ v: u, w: w }); }

  for (i = 0; i < state.lines.length; i++) {
    var L2 = state.lines[i];
    var nodesL = lineNodes[L2.id];
    var headway = lineHeadway(L2);
    var boardCost = (headway === Infinity) ? 1e6 : headway / 2 + CFG.pax.boardPenalty;
    for (j = 0; j < nodesL.length; j++) {
      var u = nodesL[j], sIdx = idxOfStation[L2.stops[j]];
      edge(sIdx, u, boardCost);   // board
      edge(u, sIdx, 0);           // alight
      if (j < nodesL.length - 1) {
        var ride = (L2.stopArc[j + 1] - L2.stopArc[j]) / CFG.train.speed + CFG.train.dwell;
        edge(u, nodesL[j + 1], ride);
        edge(nodesL[j + 1], u, ride);
      }
    }
  }

  /* Dijkstra from every station, on the reversed graph, so we learn the next
     hop from anywhere toward that station. */
  var next = new Int32Array(S * N).fill(-1);
  var cost = new Float32Array(S * N).fill(Infinity);
  var heap = new BinHeap();

  for (var t = 0; t < S; t++) {
    var target = idxOfStation[stations[t].id];
    var base = t * N;
    cost[base + target] = 0;
    heap.clear();
    heap.push(0, target);
    while (heap.size) {
      var top = heap.pop();
      var u2 = top.v, du = top.k;
      if (du > cost[base + u2]) continue;
      var adj = rev[u2];
      for (k = 0; k < adj.length; k++) {
        var v = adj[k].v, nd = du + adj[k].w;
        if (nd < cost[base + v] - 1e-9) {
          cost[base + v] = nd;
          next[base + v] = u2;          // from v, head to u2
          heap.push(nd, v);
        }
      }
    }
  }

  state.routing = {
    N: N, S: S, nodes: nodes, next: next, cost: cost,
    idxOfStation: idxOfStation, lineNodes: lineNodes,
    targetIndex: (function () { var m = {}; for (var q = 0; q < S; q++) m[stations[q].id] = q; return m; })()
  };
  state.routingDirty = false;
}

function lineHeadway(line) {
  if (!line.trains.length || line.length <= 0) return Infinity;
  var roundTrip = 2 * (line.length / CFG.train.speed + line.stops.length * CFG.train.dwell) + 2 * CFG.train.turnaround;
  return roundTrip / line.trains.length;
}

/* What should a passenger at `nodeIdx` do to reach station `destId`? */
function nextHop(state, nodeIdx, destId) {
  var R = state.routing;
  if (!R) return -1;
  var t = R.targetIndex[destId];
  if (t === undefined) return -1;
  var nx = R.next[t * R.N + nodeIdx];
  return nx;
}
function routeCost(state, fromNode, destId) {
  var R = state.routing;
  if (!R) return Infinity;
  var t = R.targetIndex[destId];
  if (t === undefined) return Infinity;
  return R.cost[t * R.N + fromNode];
}

/* --- a small binary heap --------------------------------------------------- */
function BinHeap() { this.k = []; this.v = []; this.size = 0; }
BinHeap.prototype.clear = function () { this.k.length = 0; this.v.length = 0; this.size = 0; };
BinHeap.prototype.push = function (key, val) {
  var i = this.size++;
  this.k[i] = key; this.v[i] = val;
  while (i > 0) {
    var p = (i - 1) >> 1;
    if (this.k[p] <= this.k[i]) break;
    var tk = this.k[p]; this.k[p] = this.k[i]; this.k[i] = tk;
    var tv = this.v[p]; this.v[p] = this.v[i]; this.v[i] = tv;
    i = p;
  }
};
BinHeap.prototype.pop = function () {
  var rk = this.k[0], rv = this.v[0];
  this.size--;
  if (this.size > 0) {
    this.k[0] = this.k[this.size]; this.v[0] = this.v[this.size];
    var i = 0;
    for (;;) {
      var l = i * 2 + 1, r = l + 1, m = i;
      if (l < this.size && this.k[l] < this.k[m]) m = l;
      if (r < this.size && this.k[r] < this.k[m]) m = r;
      if (m === i) break;
      var tk = this.k[m]; this.k[m] = this.k[i]; this.k[i] = tk;
      var tv = this.v[m]; this.v[m] = this.v[i]; this.v[i] = tv;
      i = m;
    }
  }
  return { k: rk, v: rv };
};
