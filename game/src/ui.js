/* ============================================================================
   UI — panels, dialogs, and everything the mouse does.
   ========================================================================= */

var UI = {
  build: { active: false, line: null, endFront: false, cursor: null, snap: null, affordable: true, stack: [] },
  selectedStation: null,
  drag: null,
  panelDirty: true,
  panelSig: "",
  lastReport: null,
  reportTimer: 0
};

var $ = function (id) { return document.getElementById(id); };
var GAME = null;   // set by main.js

/* --------------------------------------------------------------------------
   HUD
   -------------------------------------------------------------------------- */
function refreshHUD(state) {
  $("cityName").innerHTML = escapeHtml(state.name) + ' <span class="star">*</span>';
  $("money").textContent = money(state.money);
  $("takings").textContent = money(state.today.fares + state.today.pax * CFG.subsidyPerPassenger);
  $("paxToday").textContent = num(state.today.pax);
  $("sat").textContent = Math.round(state.satisfaction * 100) + "%";
  $("date").textContent = dateString(state);
  $("time").textContent = clockString(state);
  if (state.log.length) $("ticker").textContent = state.log[0].text;
}

/* The panel is rebuilt only when its structure changes; the numbers that tick
   every frame are written straight into their spans, so a rebuild can never
   land between your mouse going down and coming up again. */
function panelSignature(state) {
  var sig = state.stations.length + "|" + (UI.build.active && UI.build.line ? UI.build.line.id : 0) +
            "|" + (state.money >= CFG.cost.train ? 1 : 0);
  for (var i = 0; i < state.lines.length; i++) {
    var L = state.lines[i];
    sig += "|" + L.id + ":" + L.name + ":" + L.color + ":" + L.stops.length + ":" + L.trains.length;
  }
  return sig;
}

function refreshPanel(state) {
  var sig = panelSignature(state);
  if (sig !== UI.panelSig) { rebuildPanel(state); UI.panelSig = sig; }
  updatePanelNumbers(state);
  UI.panelDirty = false;
}

function rebuildPanel(state) {
  var html = '<div class="card"><h3 class="cardTitle">Lines</h3>';
  if (!state.lines.length) html += '<div style="font-size:12px;color:#6E7590;line-height:1.5">No lines yet. The city walks everywhere and resents it.</div>';
  html += '<div class="lineBtns"><button class="tb wide" data-act="newline">+ New line</button></div></div>';

  for (var i = 0; i < state.lines.length; i++) {
    var L = state.lines[i];
    var building = UI.build.active && UI.build.line === L;
    html += '<div class="card">' +
      '<div class="lineRow">' +
        '<span class="swatch" style="background:' + L.color + '"></span>' +
        '<span class="lineName" data-act="rename" data-line="' + L.id + '" title="Click to rename">' + escapeHtml(L.name) + '</span>' +
        '<button class="rnd" data-act="dice" data-line="' + L.id + '" title="Random name">&#9861;</button>' +
      '</div>' +
      '<div class="lineMeta" data-meta="' + L.id + '"></div>' +
      '<div class="trainCtl">' +
        '<span style="font-size:11.5px;font-weight:700">Trains</span>' +
        '<button class="tb" data-act="lesstrain" data-line="' + L.id + '"' + (L.trains.length ? "" : " disabled") + '>&minus;</button>' +
        '<span class="n">' + L.trains.length + '</span>' +
        '<button class="tb" data-act="moretrain" data-line="' + L.id + '"' + (state.money >= CFG.cost.train && L.stops.length > 1 ? "" : " disabled") + '>+</button>' +
        '<span style="font-size:10.5px;color:#6E7590;font-family:var(--mono)">' + money(CFG.cost.train) + ' each</span>' +
      '</div>' +
      '<div class="lineBtns">' +
        '<button class="tb wide' + (building ? ' on' : '') + '" data-act="extend" data-line="' + L.id + '">' + (building ? "Building&hellip;" : "Extend") + '</button>' +
        '<button class="tb" data-act="delline" data-line="' + L.id + '">Delete</button>' +
      '</div>' +
    '</div>';
  }
  html += '<div class="card"><h3 class="cardTitle">Network</h3><div class="lineMeta" id="netStats" style="margin:0;line-height:1.7"></div></div>';
  $("panel").innerHTML = html;
}

function updatePanelNumbers(state) {
  for (var i = 0; i < state.lines.length; i++) {
    var L = state.lines[i];
    var el = $("panel").querySelector('[data-meta="' + L.id + '"]');
    if (!el) continue;
    var hw = lineHeadway(L);
    el.textContent = L.stops.length + " stops \u00b7 " + (L.length / 1000).toFixed(1) + " km \u00b7 " +
      (isFinite(hw) ? "every " + hw.toFixed(1) + " min" : "no service") + " \u00b7 " + num(L.paxToday) + " today";
  }
  var net = $("netStats");
  if (net) net.innerHTML =
    'Stations <b>' + state.stations.length + '</b> &middot; Track <b>' + networkKm(state).toFixed(1) + ' km</b><br>' +
    'Next station costs <b>' + money(stationCost(state)) + '</b><br>' +
    'Track <b>' + money(CFG.cost.trackPerKm) + '/km</b> &middot; bridges <b>' + money(CFG.cost.bridge) + '</b><br>' +
    'Carried in total <b>' + num(state.totalPax) + '</b>';
}

/* One delegated listener for the whole panel, bound once, always acting on the
   live game: "New city" swaps the state object out from under it. */
function wirePanel() {
  $("panel").addEventListener("click", function (e) {
    var state = GAME;
    var b = e.target.closest("[data-act]");
    if (!b) return;
    var act = b.getAttribute("data-act");
    var L = b.hasAttribute("data-line") ? lineById(state, +b.getAttribute("data-line")) : null;

    if (act === "newline") {
      var nl = addLine(state);
      logMsg(state, "New line opened: " + nl.name + ". It goes nowhere, for now.");
      startBuild(state, nl, false);
    } else if (act === "extend" && L) {
      if (UI.build.active && UI.build.line === L) endBuild(state); else startBuild(state, L, false);
    } else if (act === "moretrain" && L) {
      if (state.money < CFG.cost.train || L.stops.length < 2) return;
      state.money -= CFG.cost.train;
      addTrain(state, L);
      logMsg(state, "A train joins " + L.name + ". " + (L.trains.length === 1 ? "The service begins." : "Waits should shorten."));
    } else if (act === "lesstrain" && L) {
      if (!L.trains.length) return;
      L.trains.pop();
      state.money += CFG.cost.train * 0.5;
      state.routingDirty = true;
      logMsg(state, "A train is sold off " + L.name + ". Half price, obviously.");
    } else if (act === "delline" && L) {
      confirmDialog("Delete " + escapeHtml(L.name) + "?", "You get 40% of the track and trains back. Stations stay put and can be reused.", function () {
        deleteLine(state, L); UI.panelDirty = true;
      });
      return;
    } else if (act === "rename" && L) {
      nameDialog("Rename line", L.name, function () { return state.bag.line(); }, function (v) { L.name = v; UI.panelDirty = true; });
      return;
    } else if (act === "dice" && L) {
      L.name = state.bag.line();
    }
    UI.panelDirty = true;
    refreshPanel(state);
  });
}

function deleteLine(state, L) {
  var refund = (L.length / 1000) * CFG.cost.trackPerKm * 0.4 + L.trains.length * CFG.cost.train * 0.4;
  var idx = state.lines.indexOf(L);
  if (idx >= 0) state.lines.splice(idx, 1);
  for (var i = 0; i < state.stations.length; i++) {
    var j = state.stations[i].lines.indexOf(L.id);
    if (j >= 0) state.stations[i].lines.splice(j, 1);
  }
  state.money += refund;
  state.routingDirty = true;
  logMsg(state, L.name + " is closed. " + money(refund) + " recovered. Somebody will write to the paper.");
  if (UI.build.active && UI.build.line === L) endBuild(state);
}

/* --------------------------------------------------------------------------
   Building
   -------------------------------------------------------------------------- */
function startBuild(state, line, front) {
  /* only one build session at a time, or half-finished lines pile up */
  if (UI.build.active && UI.build.line && UI.build.line !== line) endBuild(state);
  UI.build.active = true;
  UI.build.line = line;
  UI.build.endFront = front;
  UI.build.stack = [];
  UI.selectedStation = null;
  hideInspector();
  $("buildBar").classList.add("on");
  $("buildLabel").innerHTML = '<span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:' +
    line.color + ';margin-right:6px"></span>' + escapeHtml(line.name);
  $("map").classList.add("building");
}

function endBuild(state) {
  if (UI.build.line && UI.build.line.stops.length === 1) {
    /* a one-stop line is not a line; refund it */
    undoBuildStep(state);
  }
  if (UI.build.line && UI.build.line.stops.length === 0) {
    var i = state.lines.indexOf(UI.build.line);
    if (i >= 0) state.lines.splice(i, 1);
  }
  UI.build.active = false; UI.build.line = null; UI.build.stack = [];
  $("buildBar").classList.remove("on");
  $("map").classList.remove("building");
  $("costTag").style.display = "none";
  UI.panelDirty = true;
}

function buildQuote(state, target) {
  var L = UI.build.line;
  var isNew = target.id === undefined;
  var stationPart = isNew ? stationCost(state) : 0;
  var track = { total: 0, km: 0, bridges: 0 };
  if (L.stops.length) track = extendCost(state, L, target, UI.build.endFront);
  return { station: stationPart, track: track.total, km: track.km, bridges: track.bridges, total: stationPart + track.total, isNew: isNew };
}

function tryPlace(state, world) {
  var L = UI.build.line;
  var snap = UI.build.snap;
  var target = snap || world;

  if (snap && L.stops.length) {
    var endId = UI.build.endFront ? L.stops[0] : L.stops[L.stops.length - 1];
    if (snap.id === endId) return;                        // clicking the end again does nothing
  }
  var q = buildQuote(state, target);
  if (q.total > state.money) {
    flashTicker(state, "Not enough money. That would cost " + money(q.total) + " and you have " + money(state.money) + ".");
    return;
  }

  var st;
  if (snap) { st = snap; }
  else { st = addStation(state, world.x, world.y); }

  if (UI.build.endFront) L.stops.unshift(st.id); else L.stops.push(st.id);
  rebuildLine(state, L);
  state.money -= q.total;
  state.routingDirty = true;
  UI.build.stack.push({ stationId: st.id, created: !snap, cost: q.total, front: UI.build.endFront });

  if (L.stops.length === 2 && !L.trains.length && state.money >= CFG.cost.train) {
    state.money -= CFG.cost.train;
    addTrain(state, L);
    logMsg(state, L.name + " opens with one train. Buy more when the platforms fill up.");
  }
  assignCatchment(state);
  UI.panelDirty = true;
}

function undoBuildStep(state) {
  var s = UI.build.stack.pop();
  if (!s) return;
  var L = UI.build.line;
  if (s.front) L.stops.shift(); else L.stops.pop();
  rebuildLine(state, L);
  if (s.created) {
    var st = stationById(state, s.stationId);
    if (st && st.lines.length === 0) {
      var i = state.stations.indexOf(st);
      if (i >= 0) state.stations.splice(i, 1);
      state.nextStationId = Math.max(1, state.nextStationId - 1);
    }
  }
  state.money += s.cost;
  state.routingDirty = true;
  assignCatchment(state);
  UI.panelDirty = true;
}

/* --------------------------------------------------------------------------
   Canvas input
   -------------------------------------------------------------------------- */
function findStationNear(state, sx, sy, tolPx) {
  var best = null, bestD = tolPx;
  for (var i = 0; i < state.stations.length; i++) {
    var p = worldToScreen(state.stations[i]);
    var d = Math.hypot(p.x - sx, p.y - sy);
    if (d < bestD) { bestD = d; best = state.stations[i]; }
  }
  return best;
}

function installInput(canvas) {
  var moved = 0;

  canvas.addEventListener("pointerdown", function (e) {
    canvas.setPointerCapture(e.pointerId);
    UI.drag = { x: e.clientX, y: e.clientY, camx: View.cam.x, camy: View.cam.y };
    moved = 0;
  });

  canvas.addEventListener("pointermove", function (e) {
    var rect = canvas.getBoundingClientRect();
    var sx = e.clientX - rect.left, sy = e.clientY - rect.top;

    if (UI.drag && (e.buttons & 1)) {
      var dx = e.clientX - UI.drag.x, dy = e.clientY - UI.drag.y;
      moved = Math.max(moved, Math.hypot(dx, dy));
      if (moved > 4 && !UI.build.active) {
        View.cam.x = UI.drag.camx - dx / View.cam.zoom;
        View.cam.y = UI.drag.camy - dy / View.cam.zoom;
        canvas.classList.add("panning");
      }
    }

    if (UI.build.active) {
      var L = UI.build.line;
      UI.build.cursor = screenToWorld({ x: sx, y: sy });
      var snap = findStationNear(GAME, sx, sy, 26);
      /* extend from whichever end of the line is nearer the cursor */
      if (L.stops.length > 1) {
        var a = worldToScreen(stationById(GAME, L.stops[0]));
        var b = worldToScreen(stationById(GAME, L.stops[L.stops.length - 1]));
        UI.build.endFront = Math.hypot(a.x - sx, a.y - sy) < Math.hypot(b.x - sx, b.y - sy);
      }
      if (snap && L.stops.length) {
        var endId = UI.build.endFront ? L.stops[0] : L.stops[L.stops.length - 1];
        if (snap.id === endId) snap = null;
      }
      UI.build.snap = snap;
      var q = buildQuote(GAME, snap || UI.build.cursor);
      UI.build.affordable = q.total <= GAME.money;
      var tag = $("costTag");
      tag.style.display = "block";
      tag.style.left = (e.clientX + 16) + "px";
      tag.style.top = (e.clientY + 16) + "px";
      tag.className = UI.build.affordable ? "" : "bad";
      var parts = [];
      if (q.station) parts.push("station " + money(q.station));
      if (q.track) parts.push(q.km.toFixed(1) + " km " + money(q.track - q.bridges * CFG.cost.bridge));
      if (q.bridges) parts.push(q.bridges + " bridge " + money(q.bridges * CFG.cost.bridge));
      tag.textContent = (snap ? "connect " + snap.name + " — " : "") + parts.join(" + ") + (parts.length > 1 ? " = " + money(q.total) : "");
      if (!q.total) tag.textContent = "click to place the first station";
    }
  });

  canvas.addEventListener("pointerup", function (e) {
    canvas.classList.remove("panning");
    var rect = canvas.getBoundingClientRect();
    var sx = e.clientX - rect.left, sy = e.clientY - rect.top;
    UI.drag = null;
    if (moved > 4) return;

    if (UI.build.active) {
      tryPlace(GAME, screenToWorld({ x: sx, y: sy }));
      return;
    }
    var st = findStationNear(GAME, sx, sy, 22);
    if (st) { UI.selectedStation = st.id; showInspector(GAME, st, e.clientX, e.clientY); }
    else { UI.selectedStation = null; hideInspector(); }
  });

  canvas.addEventListener("wheel", function (e) {
    e.preventDefault();
    var rect = canvas.getBoundingClientRect();
    var before = screenToWorld({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    var factor = Math.exp(-e.deltaY * 0.0016);
    setZoom(View.cam.zoom * factor);
    var after = screenToWorld({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    View.cam.x += before.x - after.x;
    View.cam.y += before.y - after.y;
    syncZoomSlider();
  }, { passive: false });

  window.addEventListener("keydown", function (e) {
    if (e.target.tagName === "INPUT") return;
    var k = e.key.toLowerCase();
    if (e.code === "Space") { e.preventDefault(); setSpeed(GAME, GAME.speed ? 0 : 1); }
    else if (k >= "0" && k <= "4") setSpeed(GAME, +k);
    else if (k === "escape") { if (UI.build.active) endBuild(GAME); else { hideInspector(); hideModal(); } }
    else if (k === "a") { View.showAreas = !View.showAreas; $("tAreas").classList.toggle("on", View.showAreas); }
    else if (k === "d") { View.showDemand = !View.showDemand; $("tDemand").classList.toggle("on", View.showDemand); }
    else if (k === "n") { View.showLabels = !View.showLabels; $("tLabels").classList.toggle("on", View.showLabels); }
    else if (k === "s") { saveGame(GAME); }
    else if (k === "l") { var L = addLine(GAME); startBuild(GAME, L, false); UI.panelDirty = true; }
    else if (k === "?" || k === "h") showHelp();
  });
}

function setZoom(z) { View.cam.zoom = Math.max(View.minZoom, Math.min(View.maxZoom, z)); }
function syncZoomSlider() {
  var t = (Math.log(View.cam.zoom) - Math.log(View.minZoom)) / (Math.log(View.maxZoom) - Math.log(View.minZoom));
  $("zoom").value = String(Math.round(t * 1000));
}

function setSpeed(state, idx) {
  state.speed = idx;
  var sp = document.querySelectorAll(".sp");
  for (var i = 0; i < sp.length; i++) sp[i].classList.toggle("on", +sp[i].getAttribute("data-s") === idx);
}

/* --------------------------------------------------------------------------
   Station inspector
   -------------------------------------------------------------------------- */
function showInspector(state, st, cx, cy) {
  var box = $("inspect");
  var lineChips = "";
  for (var i = 0; i < st.lines.length; i++) {
    var L = lineById(state, st.lines[i]);
    if (L) lineChips += '<span class="swatch" style="display:inline-block;background:' + L.color + ';margin-right:4px"></span>';
  }
  var near = [];
  for (var d = 0; d < state.districts.length; d++)
    if (state.districts[d].station === st.id) near.push(state.districts[d]);
  var pop = 0, jobs = 0;
  for (var n = 0; n < near.length; n++) { pop += near[n].pop; jobs += near[n].jobs; }

  box.innerHTML =
    '<div class="nm">' + escapeHtml(st.name) + '</div>' +
    '<div class="sub">' + (st.lines.length ? lineChips + (st.lines.length > 1 ? " interchange" : " " + (lineById(state, st.lines[0]) || {}).name) : "not on any line yet") + '</div>' +
    '<div class="row"><span>Waiting now</span><span class="v">' + num(st.waitingTotal) + '</span></div>' +
    '<div class="row"><span>Boarded today</span><span class="v">' + num(st.boarded) + '</span></div>' +
    '<div class="row"><span>Arrived today</span><span class="v">' + num(st.alighted) + '</span></div>' +
    '<div class="row"><span>Gave up today</span><span class="v">' + num(st.gaveUp) + '</span></div>' +
    '<div class="row"><span>Catchment</span><span class="v">' + num(pop) + ' res / ' + num(jobs) + ' jobs</span></div>' +
    '<div class="lineBtns"><button class="tb wide" id="renameStation">Rename</button>' +
    '<button class="tb" id="diceStation" title="Random name">&#9861;</button>' +
    '<button class="tb" id="closeInspect">Close</button></div>';

  box.style.display = "block";
  var w = 244;
  box.style.left = Math.min(window.innerWidth - w - 14, Math.max(14, cx - w / 2)) + "px";
  box.style.top = Math.min(window.innerHeight - 230, Math.max(14, cy + 18)) + "px";

  $("renameStation").onclick = function () {
    nameDialog("Rename station", st.name, function () { return state.bag.station(); }, function (v) {
      st.name = v; showInspector(state, st, cx, cy);
    });
  };
  $("diceStation").onclick = function () { st.name = state.bag.station(); showInspector(state, st, cx, cy); };
  $("closeInspect").onclick = function () { hideInspector(); UI.selectedStation = null; };
}
function hideInspector() { $("inspect").style.display = "none"; }

/* --------------------------------------------------------------------------
   Modals
   -------------------------------------------------------------------------- */
function showModal(html) { $("modal").innerHTML = html; $("scrim").classList.add("on"); }
function hideModal() { $("scrim").classList.remove("on"); }

function nameDialog(title, current, randomFn, onOk) {
  showModal(
    '<h2>' + title + '</h2><p class="lede">Call it whatever you like. Nobody is checking.</p>' +
    '<div style="display:flex;gap:8px"><input type="text" id="nmInput" value="' + escapeAttr(current) + '">' +
    '<button class="pbtn" id="nmDice" title="Surprise me">&#9861;</button></div>' +
    '<div class="modalBtns"><button class="pbtn" id="nmCancel">Cancel</button>' +
    '<button class="pbtn primary" id="nmOk">Save</button></div>');
  var input = $("nmInput");
  input.focus(); input.select();
  $("nmDice").onclick = function () { input.value = randomFn(); input.focus(); };
  $("nmCancel").onclick = hideModal;
  $("nmOk").onclick = function () {
    var v = input.value.trim();
    if (v) onOk(v);
    hideModal();
  };
  input.onkeydown = function (e) {
    if (e.key === "Enter") { $("nmOk").click(); }
    if (e.key === "Escape") { hideModal(); }
  };
}

function confirmDialog(title, body, onOk) {
  showModal('<h2>' + title + '</h2><p class="lede">' + body + '</p>' +
    '<div class="modalBtns"><button class="pbtn" id="cfNo">Keep it</button>' +
    '<button class="pbtn primary" id="cfYes">Do it</button></div>');
  $("cfNo").onclick = hideModal;
  $("cfYes").onclick = function () { hideModal(); onOk(); };
}

function showHelp() {
  showModal(
    '<h2>How to run a metro</h2>' +
    '<p class="lede">You have a city, a budget and no railway. Every journey you carry earns a fare plus a per-passenger subsidy, paid out at midnight. You cannot go bankrupt: if you end a day short, the borough quietly tops you up. You can only grow slowly, or quickly.</p>' +
    '<div class="help">' +
    '<h4>Building</h4><ul>' +
    '<li><b>New line</b>, then click the map. Each click adds a station; clicking an existing station connects to it and makes an interchange.</li>' +
    '<li>While building, the line extends from whichever <b>end</b> is nearer your cursor.</li>' +
    '<li>Track follows 45-degree geometry, because metro maps do. Crossing the river needs a bridge and costs extra.</li>' +
    '<li>A line with no trains is drawn hollow and carries nobody. Buy trains.</li>' +
    '</ul>' +
    '<h4>Who travels</h4><ul>' +
    '<li>People live in <b>homes</b>, work in <b>commercial</b> and <b>industrial</b> districts, and travel between them by hour, weekday and season.</li>' +
    '<li>They will only walk about a kilometre to a station, and they give up if they queue too long.</li>' +
    '<li>Turn on the <b>demand overlay</b> to see which districts are still unserved.</li>' +
    '</ul>' +
    '<h4>Keys</h4><ul>' +
    '<li><kbd>Space</kbd> pause &middot; <kbd>1</kbd>–<kbd>4</kbd> speed &middot; <kbd>Esc</kbd> stop building</li>' +
    '<li><kbd>L</kbd> new line &middot; <kbd>A</kbd> districts &middot; <kbd>D</kbd> demand &middot; <kbd>N</kbd> names &middot; <kbd>S</kbd> save</li>' +
    '<li>Drag to pan, scroll to zoom, click a station to rename it.</li>' +
    '</ul>' +
    '<h4>Names</h4><ul>' +
    '<li>Every name is a suggestion. Click the city name, a line name or a station to change it.</li>' +
    '<li>The dice button rolls a new one from a very long list in <code>data/names.js</code>.</li>' +
    '</ul></div>' +
    '<div class="modalBtns"><button class="pbtn primary" id="hpOk">Right then</button></div>');
  $("hpOk").onclick = hideModal;
}

/* --------------------------------------------------------------------------
   Daily report card
   -------------------------------------------------------------------------- */
function showReport(state) {
  var r = state.yesterday;
  if (!r) return;
  var box = $("report");
  box.innerHTML =
    '<button class="x" id="repX">&times;</button>' +
    '<div class="rh">Yesterday</div><div class="rd">' + r.date + '</div>' +
    '<div class="hl">' + escapeHtml(r.headline) + '</div>' +
    '<div class="row"><span>Journeys carried</span><span class="v">' + num(r.pax) + '</span></div>' +
    '<div class="row"><span>Fares</span><span class="v">' + money(r.fares) + '</span></div>' +
    '<div class="row"><span>Subsidy</span><span class="v">' + money(r.subsidy) + '</span></div>' +
    '<div class="row"><span>Running costs</span><span class="v">-' + money(r.upkeep) + '</span></div>' +
    (r.bonus ? '<div class="row"><span>Milestone grant</span><span class="v">' + money(r.bonus) + '</span></div>' : "") +
    (r.grant ? '<div class="row"><span>Emergency grant</span><span class="v">' + money(r.grant) + '</span></div>' : "") +
    '<div class="row tot"><span>Net</span><span class="v">' + money(r.net + r.bonus + r.grant) + '</span></div>' +
    '<div class="row" style="margin-top:7px"><span>Gave up waiting</span><span class="v">' + num(r.gaveUp) + '</span></div>' +
    '<div class="row"><span>Average wait</span><span class="v">' + r.avgWait.toFixed(1) + ' min</span></div>' +
    '<div class="row"><span>Average journey</span><span class="v">' + r.avgRide.toFixed(0) + ' min</span></div>' +
    '<div class="row"><span>Satisfaction</span><span class="v">' + Math.round(r.satisfaction * 100) + '%</span></div>';
  box.classList.add("on");
  $("repX").onclick = function () { box.classList.remove("on"); UI.reportTimer = 0; };
  UI.reportTimer = 16;
}

/* --------------------------------------------------------------------------
   Save / load
   -------------------------------------------------------------------------- */
var SAVE_KEY = "metro-game-save-v1";

function saveGame(state) {
  try {
    var data = {
      v: 1, seed: state.seed, name: state.name, time: state.time, money: state.money,
      satisfaction: state.satisfaction, demandMult: state.demandMult, milestone: state.milestone,
      totalPax: state.totalPax, nextStationId: state.nextStationId, nextLineId: state.nextLineId,
      districts: state.districts.map(function (d) { return { pop: d.pop, jobs: d.jobs }; }),
      stations: state.stations.map(function (s) { return { id: s.id, name: s.name, x: s.x, y: s.y }; }),
      lines: state.lines.map(function (l) {
        return { id: l.id, name: l.name, color: l.color, stops: l.stops.slice(), trains: l.trains.length };
      }),
      history: state.history.slice(-120)
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    flashTicker(state, "Saved. " + state.name + " is safe on this computer, and nowhere else.");
    return true;
  } catch (err) {
    flashTicker(state, "Could not save: " + err.message);
    return false;
  }
}

function loadGame() {
  var raw;
  try { raw = localStorage.getItem(SAVE_KEY); } catch (e) { return null; }
  if (!raw) return null;
  var d;
  try { d = JSON.parse(raw); } catch (e2) { return null; }
  if (!d || d.v !== 1) return null;

  var state = newGame(d.seed);
  state.name = d.name;
  state.time = d.time; state.money = d.money;
  state.satisfaction = d.satisfaction; state.demandMult = d.demandMult;
  state.milestone = d.milestone; state.totalPax = d.totalPax || 0;
  state.nextStationId = d.nextStationId; state.nextLineId = d.nextLineId;
  state.history = d.history || [];

  for (var i = 0; i < d.districts.length && i < state.districts.length; i++) {
    state.districts[i].pop = d.districts[i].pop;
    state.districts[i].jobs = d.districts[i].jobs;
    refreshPotential(state.districts[i]);
  }
  for (var s = 0; s < d.stations.length; s++) {
    var ss = d.stations[s];
    state.stations.push({ id: ss.id, name: ss.name, x: ss.x, y: ss.y, lines: [], waiting: {}, waitingTotal: 0, boarded: 0, alighted: 0, gaveUp: 0, crowd: 0 });
    state.bag.claim(ss.name);
  }
  for (var l = 0; l < d.lines.length; l++) {
    var dl = d.lines[l];
    var L = { id: dl.id, name: dl.name, color: dl.color, stops: dl.stops.slice(), trains: [], path: null, length: 0, lastDeparture: [-999, -999], paxToday: 0 };
    state.lines.push(L);
    rebuildLine(state, L);
    for (var t = 0; t < dl.trains; t++) addTrain(state, L);
    state.bag.claim(dl.name);
  }
  assignCatchment(state);
  state.routingDirty = true;
  logMsg(state, "Loaded " + state.name + ". Back to work.");
  return state;
}

function hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } }

/* --------------------------------------------------------------------------
   bits and pieces
   -------------------------------------------------------------------------- */
function flashTicker(state, msg) { logMsg(state, msg); $("ticker").textContent = msg; }
function escapeHtml(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
function escapeAttr(s) { return escapeHtml(s).replace(/'/g, "&#39;"); }
