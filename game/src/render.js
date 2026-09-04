/* ============================================================================
   RENDER — a metro map that happens to be a simulation.
   Line widths, station marks and labels are all in screen space, so the map
   looks hand-drawn at every zoom level.
   ========================================================================= */

var View = {
  cam: { x: 0, y: 0, zoom: 0.07 },
  minZoom: 0.03, maxZoom: 0.42,
  w: 0, h: 0, dpr: 1,
  showAreas: true,
  showDemand: false,
  showLabels: true
};

function worldToScreen(p) {
  return { x: (p.x - View.cam.x) * View.cam.zoom + View.w / 2, y: (p.y - View.cam.y) * View.cam.zoom + View.h / 2 };
}
function screenToWorld(p) {
  return { x: (p.x - View.w / 2) / View.cam.zoom + View.cam.x, y: (p.y - View.h / 2) / View.cam.zoom + View.cam.y };
}
function fitView(state) {
  var pad = 1.06;
  View.cam.x = state.world.w / 2; View.cam.y = state.world.h / 2;
  View.cam.zoom = Math.min(View.w / (state.world.w * pad), View.h / (state.world.h * pad));
  View.minZoom = View.cam.zoom * 0.75;
}

function lineWidthPx() { return Math.max(5, Math.min(13, 7 + View.cam.zoom * 45)); }

/* --------------------------------------------------------------------------
   main draw
   -------------------------------------------------------------------------- */
function draw(ctx, state, ui) {
  var C = CFG.colors;
  ctx.setTransform(View.dpr, 0, 0, View.dpr, 0, 0);
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, View.w, View.h);

  drawGrid(ctx);
  if (View.showAreas) drawDistricts(ctx, state);
  drawRiver(ctx, state);
  if (View.showDemand) drawDemand(ctx, state);

  var offsets = buildSegmentOffsets(state);
  for (var i = 0; i < state.lines.length; i++) drawLine(ctx, state, state.lines[i], offsets);
  if (ui.build.active) drawBuildPreview(ctx, state, ui);
  for (var t = 0; t < state.lines.length; t++) drawTrains(ctx, state, state.lines[t]);
  drawStations(ctx, state, ui);
  if (View.showLabels) drawLabels(ctx, state);
  drawCrowdBadges(ctx, state);
}

/* --- grid ----------------------------------------------------------------- */
function drawGrid(ctx) {
  var step = 500;
  while (step * View.cam.zoom < 26) step *= 2;
  var tl = screenToWorld({ x: 0, y: 0 }), br = screenToWorld({ x: View.w, y: View.h });
  ctx.lineWidth = 1;
  var x0 = Math.floor(tl.x / step) * step, y0 = Math.floor(tl.y / step) * step;
  for (var x = x0; x < br.x; x += step) {
    var sx = Math.round(worldToScreen({ x: x, y: 0 }).x) + 0.5;
    ctx.strokeStyle = (Math.round(x / step) % 5 === 0) ? CFG.colors.gridMajor : CFG.colors.grid;
    ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, View.h); ctx.stroke();
  }
  for (var y = y0; y < br.y; y += step) {
    var sy = Math.round(worldToScreen({ x: 0, y: y }).y) + 0.5;
    ctx.strokeStyle = (Math.round(y / step) % 5 === 0) ? CFG.colors.gridMajor : CFG.colors.grid;
    ctx.beginPath(); ctx.moveTo(0, sy); ctx.lineTo(View.w, sy); ctx.stroke();
  }
}

/* --- districts ------------------------------------------------------------ */
function drawDistricts(ctx, state) {
  var C = CFG.colors;
  for (var i = 0; i < state.districts.length; i++) {
    var d = state.districts[i];
    ctx.beginPath();
    var p0 = worldToScreen(d.poly[0]);
    ctx.moveTo(p0.x, p0.y);
    for (var k = 1; k <= d.poly.length; k++) {
      var a = worldToScreen(d.poly[k % d.poly.length]);
      var b = worldToScreen(d.poly[(k + 1) % d.poly.length]);
      ctx.quadraticCurveTo(a.x, a.y, (a.x + b.x) / 2, (a.y + b.y) / 2);
    }
    ctx.closePath();
    ctx.fillStyle = d.type === "homes" ? C.homes : d.type === "commercial" ? C.commercial : C.industry;
    ctx.globalAlpha = View.showDemand ? 0.85 : 0.5;
    ctx.fill();
    ctx.globalAlpha = View.showDemand ? 0.9 : 0.45;
    ctx.strokeStyle = d.type === "homes" ? C.homesEdge : d.type === "commercial" ? C.commercialEdge : C.industryEdge;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  if (View.cam.zoom > 0.16) {
    ctx.font = "600 10px ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (var j = 0; j < state.districts.length; j++) {
      var dd = state.districts[j], s = worldToScreen(dd);
      if (s.x < -60 || s.x > View.w + 60 || s.y < -30 || s.y > View.h + 30) continue;
      ctx.fillStyle = "rgba(70,82,108,0.30)";
      ctx.fillText(dd.name.toUpperCase(), s.x, s.y + 2);
    }
  }
}

function drawRiver(ctx, state) {
  var w = state.riverWidth * View.cam.zoom;
  ctx.lineJoin = "round"; ctx.lineCap = "round";
  ctx.beginPath();
  for (var i = 0; i < state.river.length; i++) {
    var p = worldToScreen(state.river[i]);
    if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
  }
  ctx.strokeStyle = CFG.colors.waterEdge; ctx.lineWidth = w + 2; ctx.stroke();
  ctx.strokeStyle = CFG.colors.water; ctx.lineWidth = w; ctx.stroke();
}

/* --- demand overlay ------------------------------------------------------- */
function drawDemand(ctx, state) {
  for (var i = 0; i < state.districts.length; i++) {
    var d = state.districts[i];
    var s = worldToScreen(d);
    var mag = (d.prodPotential + d.attrPotential) / 2;
    var r = Math.max(6, Math.sqrt(mag) * 0.10) * (0.6 + View.cam.zoom * 3);
    var unserved = d.station === null;
    ctx.beginPath(); ctx.arc(s.x, s.y, r, 0, 6.2832);
    ctx.fillStyle = unserved ? "rgba(217,58,43,0.20)" : "rgba(31,92,58,0.16)";
    ctx.fill();
    ctx.strokeStyle = unserved ? "rgba(217,58,43,0.55)" : "rgba(31,92,58,0.40)";
    ctx.lineWidth = unserved ? 2 : 1;
    if (unserved) ctx.setLineDash([4, 3]);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

/* --- lines ---------------------------------------------------------------- */
function buildSegmentOffsets(state) {
  var map = {};
  for (var i = 0; i < state.lines.length; i++) {
    var L = state.lines[i];
    if (!L.segs) continue;
    for (var j = 0; j < L.segs.length; j++) {
      var s = L.segs[j];
      var key = Math.min(s.a, s.b) + "_" + Math.max(s.a, s.b);
      if (!map[key]) map[key] = [];
      if (map[key].indexOf(L.id) < 0) map[key].push(L.id);
    }
  }
  return map;
}

function segOffsetVec(seg, offsets, lineId, widthPx) {
  var key = Math.min(seg.a, seg.b) + "_" + Math.max(seg.a, seg.b);
  var arr = offsets[key] || [lineId];
  if (arr.length < 2) return { x: 0, y: 0 };
  var idx = arr.indexOf(lineId);
  var d = (idx - (arr.length - 1) / 2) * (widthPx + 2.5);
  var a = seg.pts[0], b = seg.pts[seg.pts.length - 1];
  var dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
  return { x: -dy / len * d, y: dx / len * d };
}

function drawLine(ctx, state, L, offsets) {
  if (!L.segs || !L.segs.length) return;
  var w = lineWidthPx();
  ctx.lineJoin = "round"; ctx.lineCap = "round";
  ctx.strokeStyle = L.color;
  ctx.lineWidth = w;
  for (var i = 0; i < L.segs.length; i++) {
    var seg = L.segs[i];
    var off = segOffsetVec(seg, offsets, L.id, w);
    ctx.beginPath();
    for (var k = 0; k < seg.pts.length; k++) {
      var p = worldToScreen(seg.pts[k]);
      if (k === 0) ctx.moveTo(p.x + off.x, p.y + off.y); else ctx.lineTo(p.x + off.x, p.y + off.y);
    }
    ctx.stroke();
  }
  if (!L.trains.length) {
    /* a line with no trains is just a drawing: show it hollow */
    ctx.strokeStyle = "rgba(252,251,247,0.75)";
    ctx.lineWidth = Math.max(1.5, w - 5);
    ctx.setLineDash([w * 0.9, w * 0.9]);
    for (var j = 0; j < L.segs.length; j++) {
      var sg = L.segs[j], of2 = segOffsetVec(sg, offsets, L.id, w);
      ctx.beginPath();
      for (var m = 0; m < sg.pts.length; m++) {
        var q = worldToScreen(sg.pts[m]);
        if (m === 0) ctx.moveTo(q.x + of2.x, q.y + of2.y); else ctx.lineTo(q.x + of2.x, q.y + of2.y);
      }
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }
}

/* tangent of the line at a stop, for tick marks */
function stopTangent(L, idx) {
  if (!L.path || L.path.length < 2) return { x: 1, y: 0 };
  var arc = L.stopArc[idx];
  var a = pointAtArc(L, Math.max(0, arc - 30));
  var b = pointAtArc(L, Math.min(L.length, arc + 30));
  var dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
  return { x: dx / len, y: dy / len };
}

/* --- stations ------------------------------------------------------------- */
function drawStations(ctx, state, ui) {
  var w = lineWidthPx();
  var i, j;
  /* ticks and terminus caps, drawn per line */
  for (i = 0; i < state.lines.length; i++) {
    var L = state.lines[i];
    if (!L.stops.length) continue;
    for (j = 0; j < L.stops.length; j++) {
      var st = stationById(state, L.stops[j]);
      if (!st || st.lines.length > 1) continue;   // interchanges get a circle instead
      var s = worldToScreen(st);
      if (s.x < -40 || s.x > View.w + 40 || s.y < -40 || s.y > View.h + 40) continue;
      var tg = stopTangent(L, j);
      var nx = -tg.y, ny = tg.x;
      var terminus = (j === 0 || j === L.stops.length - 1);
      /* a tick long enough to stand proud of the line it crosses */
      var len = terminus ? w * 1.05 : w * 1.08;
      var thick = terminus ? w : Math.max(3.5, w * 0.52);
      ctx.lineCap = "butt";
      ctx.strokeStyle = L.color;
      ctx.lineWidth = thick;
      ctx.beginPath();
      ctx.moveTo(s.x - nx * len, s.y - ny * len);
      ctx.lineTo(s.x + nx * len, s.y + ny * len);
      ctx.stroke();
    }
  }
  ctx.lineCap = "round";

  /* interchanges, plus anything not yet on a line */
  for (i = 0; i < state.stations.length; i++) {
    var stn = state.stations[i];
    var p = worldToScreen(stn);
    if (p.x < -40 || p.x > View.w + 40 || p.y < -40 || p.y > View.h + 40) continue;
    if (stn.lines.length > 1) {
      var r = w * 0.86;
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 6.2832);
      ctx.fillStyle = "#FFFFFF"; ctx.fill();
      ctx.lineWidth = Math.max(3, w * 0.42); ctx.strokeStyle = "#111318"; ctx.stroke();
    } else if (stn.lines.length === 0) {
      ctx.beginPath(); ctx.arc(p.x, p.y, w * 0.55, 0, 6.2832);
      ctx.fillStyle = "#FFFFFF"; ctx.fill();
      ctx.lineWidth = 2.5; ctx.strokeStyle = "#9AA0B4"; ctx.setLineDash([3, 3]); ctx.stroke(); ctx.setLineDash([]);
    }
    if (ui.selectedStation === stn.id) {
      ctx.beginPath(); ctx.arc(p.x, p.y, w * 1.5, 0, 6.2832);
      ctx.strokeStyle = "#1B2A7A"; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.stroke(); ctx.setLineDash([]);
    }
  }
}

/* --- labels --------------------------------------------------------------- */
function wrapName(ctx, name, maxW) {
  var words = name.split(" "), lines = [], cur = "";
  for (var i = 0; i < words.length; i++) {
    var trial = cur ? cur + " " + words[i] : words[i];
    if (ctx.measureText(trial).width > maxW && cur) { lines.push(cur); cur = words[i]; }
    else cur = trial;
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 3);
}

function drawLabels(ctx, state) {
  if (View.cam.zoom < 0.035) return;
  var fs = Math.max(10, Math.min(15, 8 + View.cam.zoom * 34));
  ctx.font = "700 " + fs.toFixed(1) + "px ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";
  ctx.textBaseline = "middle";
  var placed = [];
  var w = lineWidthPx();
  var order = state.stations.slice().sort(function (a, b) { return b.lines.length - a.lines.length; });

  for (var i = 0; i < order.length; i++) {
    var st = order[i];
    var p = worldToScreen(st);
    if (p.x < -120 || p.x > View.w + 120 || p.y < -60 || p.y > View.h + 60) continue;
    var lines = wrapName(ctx, st.name, 108);
    var tw = 0;
    for (var k = 0; k < lines.length; k++) tw = Math.max(tw, ctx.measureText(lines[k]).width);
    var th = lines.length * (fs + 2);
    var gap = w * 1.5;
    var cands = [
      { x: p.x + gap, y: p.y, align: "left" },
      { x: p.x - gap, y: p.y, align: "right" },
      { x: p.x, y: p.y - gap - th / 2, align: "center" },
      { x: p.x, y: p.y + gap + th / 2, align: "center" }
    ];
    var chosen = null;
    for (var c = 0; c < cands.length; c++) {
      var cd = cands[c];
      var rx = cd.align === "left" ? cd.x : cd.align === "right" ? cd.x - tw : cd.x - tw / 2;
      var rect = { x: rx - 3, y: cd.y - th / 2 - 2, w: tw + 6, h: th + 4 };
      var clash = false;
      for (var q = 0; q < placed.length; q++) if (overlaps(rect, placed[q])) { clash = true; break; }
      if (!clash) { chosen = cd; placed.push(rect); break; }
    }
    if (!chosen) continue;
    ctx.textAlign = chosen.align;
    ctx.lineWidth = 3.5; ctx.strokeStyle = "rgba(252,251,247,0.9)"; ctx.lineJoin = "round";
    for (var m = 0; m < lines.length; m++) {
      var ly = chosen.y - th / 2 + (fs + 2) * m + (fs + 2) / 2;
      ctx.strokeText(lines[m], chosen.x, ly);
    }
    ctx.fillStyle = CFG.colors.label;
    for (var n = 0; n < lines.length; n++) {
      var ly2 = chosen.y - th / 2 + (fs + 2) * n + (fs + 2) / 2;
      ctx.fillText(lines[n], chosen.x, ly2);
    }
  }
}
function overlaps(a, b) { return !(a.x + a.w < b.x || b.x + b.w < a.x || a.y + a.h < b.y || b.y + b.h < a.y); }

/* --- crowding ------------------------------------------------------------- */
function drawCrowdBadges(ctx, state) {
  var w = lineWidthPx();
  ctx.font = "700 10px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  for (var i = 0; i < state.stations.length; i++) {
    var st = state.stations[i];
    if (st.waitingTotal < 60) continue;
    var p = worldToScreen(st);
    if (p.x < -30 || p.x > View.w + 30 || p.y < -30 || p.y > View.h + 30) continue;
    var hot = st.waitingTotal > 500;
    var txt = st.waitingTotal >= 1000 ? (st.waitingTotal / 1000).toFixed(1) + "k" : String(Math.round(st.waitingTotal));
    var bw = ctx.measureText(txt).width + 10;
    var bx = p.x + w * 0.9, by = p.y - w * 1.15;
    ctx.fillStyle = hot ? "#D93A2B" : "#E8A33D";
    roundRect(ctx, bx - bw / 2, by - 7, bw, 14, 7); ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillText(txt, bx, by);
  }
}
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/* --- trains --------------------------------------------------------------- */
function drawTrains(ctx, state, L) {
  if (!L.path || L.path.length < 2) return;
  var w = lineWidthPx();
  for (var i = 0; i < L.trains.length; i++) {
    var T = L.trains[i];
    var pt = pointAtArc(L, T.pos);
    var s = worldToScreen(pt);
    if (s.x < -30 || s.x > View.w + 30 || s.y < -30 || s.y > View.h + 30) continue;
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(pt.ang);
    var tl = Math.max(10, w * 1.55), tw = Math.max(5.5, w * 0.72);
    ctx.fillStyle = CFG.colors.bg;
    roundRect(ctx, -tl / 2 - 1.6, -tw / 2 - 1.6, tl + 3.2, tw + 3.2, 4); ctx.fill();
    ctx.fillStyle = L.color;
    roundRect(ctx, -tl / 2, -tw / 2, tl, tw, 3); ctx.fill();
    /* how full it is, as a strip along the bottom edge */
    var load = Math.min(1, T.load / CFG.train.capacity);
    if (load > 0.04) {
      var bh = Math.max(1.8, tw * 0.22);
      ctx.fillStyle = load > 0.92 ? "#FFC9C2" : "rgba(255,255,255,0.92)";
      roundRect(ctx, -tl / 2 + 1.4, tw / 2 - bh - 1.2, (tl - 2.8) * load, bh, 1); ctx.fill();
    }
    ctx.restore();
  }
}

/* --- build preview -------------------------------------------------------- */
function drawBuildPreview(ctx, state, ui) {
  var b = ui.build;
  if (!b.line || !b.cursor) return;
  var L = b.line;
  var w = lineWidthPx();
  if (L.stops.length) {
    var from = stationById(state, b.endFront ? L.stops[0] : L.stops[L.stops.length - 1]);
    var target = b.snap ? b.snap : b.cursor;
    var pts = elbowPath(from, target, bendFlag(from.id, b.snap ? b.snap.id : state.nextStationId));
    ctx.strokeStyle = L.color;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = w; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.setLineDash([w * 1.4, w * 0.9]);
    ctx.beginPath();
    for (var i = 0; i < pts.length; i++) {
      var p = worldToScreen(pts[i]);
      if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }
  var c = worldToScreen(b.snap ? b.snap : b.cursor);
  ctx.beginPath(); ctx.arc(c.x, c.y, w * 0.8, 0, 6.2832);
  ctx.fillStyle = b.snap ? "rgba(27,42,122,0.18)" : "rgba(255,255,255,0.9)";
  ctx.fill();
  ctx.strokeStyle = b.affordable ? "#1B2A7A" : "#D93A2B";
  ctx.lineWidth = 2.5; ctx.setLineDash([4, 3]); ctx.stroke(); ctx.setLineDash([]);
}

/* --- minimap -------------------------------------------------------------- */
function drawMinimap(ctx, state, w, h) {
  ctx.clearRect(0, 0, w, h);
  var pad = 4;
  var sx = (w - pad * 2) / state.world.w, sy = (h - pad * 2) / state.world.h;
  var s = Math.min(sx, sy);
  var ox = pad + ((w - pad * 2) - state.world.w * s) / 2;
  var oy = pad + ((h - pad * 2) - state.world.h * s) / 2;
  function m(p) { return { x: ox + p.x * s, y: oy + p.y * s }; }

  ctx.fillStyle = "rgba(255,255,255,0.55)";
  roundRect(ctx, 0, 0, w, h, 10); ctx.fill();

  ctx.strokeStyle = CFG.colors.water; ctx.lineWidth = Math.max(1, state.riverWidth * s);
  ctx.beginPath();
  for (var i = 0; i < state.river.length; i++) { var p = m(state.river[i]); if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); }
  ctx.stroke();

  ctx.lineCap = "round"; ctx.lineJoin = "round";
  for (var l = 0; l < state.lines.length; l++) {
    var L = state.lines[l];
    if (!L.path || L.path.length < 2) continue;
    ctx.strokeStyle = L.color; ctx.lineWidth = 2.2;
    ctx.beginPath();
    for (var k = 0; k < L.path.length; k++) { var q = m(L.path[k]); if (k === 0) ctx.moveTo(q.x, q.y); else ctx.lineTo(q.x, q.y); }
    ctx.stroke();
  }
  for (var st = 0; st < state.stations.length; st++) {
    var v = m(state.stations[st]);
    ctx.beginPath(); ctx.arc(v.x, v.y, 1.9, 0, 6.2832);
    ctx.fillStyle = "#fff"; ctx.fill();
    ctx.strokeStyle = "#6b7290"; ctx.lineWidth = 1; ctx.stroke();
  }
  var tl = m(screenToWorld({ x: 0, y: 0 })), br = m(screenToWorld({ x: View.w, y: View.h }));
  ctx.strokeStyle = "#5B60A8"; ctx.lineWidth = 1.5;
  ctx.strokeRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);
}
