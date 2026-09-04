/* ============================================================================
   CITY GENERATION
   A river, a dense commercial core, a ring of housing, industry on the edges
   and by the water. Districts are soft blobs; the metro map sits on top.
   ========================================================================= */

function buildCity(seed) {
  var rnd = makeRng(seed);
  var bag = makeNameBag(rnd);
  var W = CFG.world.w, H = CFG.world.h;
  var cx = W / 2, cy = H / 2;

  /* --- the river: a lazy S from the west edge to the south-east ---------- */
  var river = [];
  var ry = H * rnd.range(0.30, 0.42);
  var amp = H * rnd.range(0.10, 0.16);
  var phase = rnd.range(0, Math.PI * 2);
  for (var i = 0; i <= 26; i++) {
    var t = i / 26;
    river.push({
      x: -400 + t * (W + 800),
      y: ry + Math.sin(phase + t * Math.PI * 1.7) * amp + t * H * 0.28
    });
  }
  var riverWidth = rnd.range(220, 340);

  function distToRiver(x, y) {
    var best = 1e9;
    for (var i = 0; i < river.length - 1; i++) {
      var d = distToSegment(x, y, river[i].x, river[i].y, river[i + 1].x, river[i + 1].y);
      if (d < best) best = d;
    }
    return best;
  }

  /* --- district seeds ---------------------------------------------------- */
  var districts = [];
  var n = CFG.districtCount;
  var tries = 0;
  var minSep = Math.sqrt((W * H) / n) * 0.62;

  while (districts.length < n && tries < n * 400) {
    tries++;
    var x, y;
    /* bias toward the middle so the city has a shape rather than a smear */
    if (rnd.chance(0.55)) {
      var ang = rnd.range(0, Math.PI * 2);
      var rad = Math.pow(rnd(), 0.62) * Math.min(W, H) * 0.48;
      x = cx + Math.cos(ang) * rad * 1.25;
      y = cy + Math.sin(ang) * rad;
    } else {
      x = rnd.range(W * 0.05, W * 0.95);
      y = rnd.range(H * 0.06, H * 0.94);
    }
    if (x < 600 || x > W - 600 || y < 500 || y > H - 500) continue;
    if (distToRiver(x, y) < riverWidth * 1.35) continue;

    var ok = true;
    for (var j = 0; j < districts.length; j++) {
      var dx = districts[j].x - x, dy = districts[j].y - y;
      if (dx * dx + dy * dy < minSep * minSep) { ok = false; break; }
    }
    if (!ok) continue;

    var dc = Math.hypot((x - cx) / (W * 0.5), (y - cy) / (H * 0.5)); // 0 centre, 1 edge
    var type;
    var roll = rnd();
    if (dc < 0.30)      type = roll < 0.72 ? "commercial" : (roll < 0.94 ? "homes" : "industry");
    else if (dc < 0.62) type = roll < 0.24 ? "commercial" : (roll < 0.90 ? "homes" : "industry");
    else                type = roll < 0.10 ? "commercial" : (roll < 0.60 ? "homes" : "industry");

    /* industry likes the water and the edges */
    if (type !== "industry" && distToRiver(x, y) < riverWidth * 3.2 && rnd.chance(0.35)) type = "industry";

    districts.push({ id: districts.length, x: x, y: y, type: type, dc: dc });
  }

  /* --- size, population, shape ------------------------------------------- */
  for (var k = 0; k < districts.length; k++) {
    var d = districts[k];
    var coreness = 1 - Math.min(1, d.dc);
    d.name = bag.station();
    d.radius = rnd.range(520, 900) * (0.85 + coreness * 0.5);

    if (d.type === "homes") {
      d.pop = Math.round(rnd.range(14000, 52000) * (0.65 + coreness * 0.9));
      d.jobs = Math.round(d.pop * rnd.range(0.05, 0.18));
    } else if (d.type === "commercial") {
      d.jobs = Math.round(rnd.range(9000, 46000) * (0.55 + coreness * 1.15));
      d.pop = Math.round(d.jobs * rnd.range(0.10, 0.45));
    } else {
      d.jobs = Math.round(rnd.range(5000, 22000) * (1.25 - coreness * 0.4));
      d.pop = Math.round(d.jobs * rnd.range(0.02, 0.14));
    }

    /* blob outline */
    d.poly = [];
    var lobes = rnd.int(3, 5), off = rnd.range(0, 6.28);
    for (var a = 0; a < 20; a++) {
      var th = (a / 20) * Math.PI * 2;
      var wob = 1
        + 0.20 * Math.sin(th * lobes + off)
        + 0.11 * Math.sin(th * (lobes + 2) + off * 1.7);
      d.poly.push({ x: d.x + Math.cos(th) * d.radius * wob, y: d.y + Math.sin(th) * d.radius * wob * 0.82 });
    }
    d.station = null;   // assigned station id, or null
    d.served = 0;       // rolling share of demand actually carried
  }

  /* the biggest commercial district gets to be the city centre */
  var centre = null;
  for (var c = 0; c < districts.length; c++)
    if (districts[c].type === "commercial" && (!centre || districts[c].jobs > centre.jobs)) centre = districts[c];

  return {
    seed: seed,
    name: bag.city(),
    world: { w: W, h: H },
    river: river,
    riverWidth: riverWidth,
    districts: districts,
    centreId: centre ? centre.id : 0,
    bag: bag,
    rnd: rnd
  };
}

/* --- geometry helpers ----------------------------------------------------- */
function distToSegment(px, py, x1, y1, x2, y2) {
  var vx = x2 - x1, vy = y2 - y1;
  var wx = px - x1, wy = py - y1;
  var c1 = vx * wx + vy * wy;
  if (c1 <= 0) return Math.hypot(px - x1, py - y1);
  var c2 = vx * vx + vy * vy;
  if (c2 <= c1) return Math.hypot(px - x2, py - y2);
  var t = c1 / c2;
  return Math.hypot(px - (x1 + t * vx), py - (y1 + t * vy));
}

function segmentsCross(a1, a2, b1, b2) {
  function ccw(p, q, r) { return (r.y - p.y) * (q.x - p.x) > (q.y - p.y) * (r.x - p.x); }
  return ccw(a1, b1, b2) !== ccw(a2, b1, b2) && ccw(a1, a2, b1) !== ccw(a1, a2, b2);
}
