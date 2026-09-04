/* ============================================================================
   MAIN — boot, resize, the loop.
   ========================================================================= */

(function () {
  var canvas = $("map");
  var ctx = canvas.getContext("2d");
  var mini = $("minimap");
  var mctx = mini.getContext("2d");
  var state = null;
  var lastFrame = 0, panelTimer = 0, lastReportRef = null, lastSavedDay = -1;

  function resize() {
    View.dpr = Math.min(2, window.devicePixelRatio || 1);
    View.w = window.innerWidth;
    View.h = window.innerHeight;
    canvas.width = Math.round(View.w * View.dpr);
    canvas.height = Math.round(View.h * View.dpr);
    canvas.style.width = View.w + "px";
    canvas.style.height = View.h + "px";
  }

  function boot(loaded) {
    state = loaded || newGame((Math.random() * 1e9) | 0);
    GAME = state;
    /* a new city means the old selection, build session and panel are stale */
    UI.build.active = false; UI.build.line = null; UI.build.stack = [];
    UI.selectedStation = null; UI.panelSig = "";
    $("buildBar").classList.remove("on");
    $("map").classList.remove("building");
    $("costTag").style.display = "none";
    $("report").classList.remove("on");
    hideInspector();
    resize();
    fitView(state);
    View.maxZoom = Math.max(0.3, View.cam.zoom * 6);
    syncZoomSlider();
    UI.panelDirty = true;
    lastReportRef = state.yesterday;
    setSpeed(state, 0);
    refreshHUD(state);
    refreshPanel(state);
  }

  /* --- toolbar ------------------------------------------------------------ */
  function wireChrome() {
    $("tAreas").onclick = function () { View.showAreas = !View.showAreas; this.classList.toggle("on", View.showAreas); };
    $("tDemand").onclick = function () { View.showDemand = !View.showDemand; this.classList.toggle("on", View.showDemand); };
    $("tLabels").onclick = function () { View.showLabels = !View.showLabels; this.classList.toggle("on", View.showLabels); };
    $("tSave").onclick = function () { saveGame(state); };
    $("tHelp").onclick = showHelp;
    $("tNew").onclick = function () {
      confirmDialog("Start a new city?", "This one gets bulldozed. Your saved game stays where it is until you save over it.", function () {
        boot(newGame((Math.random() * 1e9) | 0));
        flashTicker(state, "Welcome to " + state.name + ". Still no metro. Still your problem.");
      });
    };
    $("renameCity").onclick = function () {
      nameDialog("Rename the city", state.name, function () { return state.bag.city(); }, function (v) { state.name = v; });
    };

    document.querySelectorAll(".sp").forEach(function (b) {
      b.onclick = function () { setSpeed(state, +b.getAttribute("data-s")); };
    });

    $("zoom").oninput = function () {
      var t = +this.value / 1000;
      View.cam.zoom = Math.exp(Math.log(View.minZoom) + t * (Math.log(View.maxZoom) - Math.log(View.minZoom)));
    };
    $("zoomIn").onclick = function () { setZoom(View.cam.zoom * 1.35); syncZoomSlider(); };
    $("zoomOut").onclick = function () { setZoom(View.cam.zoom / 1.35); syncZoomSlider(); };
    $("zoomFit").onclick = function () { fitView(state); syncZoomSlider(); };

    mini.onclick = function (e) {
      var r = mini.getBoundingClientRect();
      var pad = 4;
      var s = Math.min((mini.width - pad * 2) / state.world.w, (mini.height - pad * 2) / state.world.h);
      var ox = pad + ((mini.width - pad * 2) - state.world.w * s) / 2;
      var oy = pad + ((mini.height - pad * 2) - state.world.h * s) / 2;
      View.cam.x = (e.clientX - r.left - ox) / s;
      View.cam.y = (e.clientY - r.top - oy) / s;
    };

    $("buildDone").onclick = function () { endBuild(state); };
    $("buildUndo").onclick = function () { undoBuildStep(state); };
    $("scrim").onclick = function (e) { if (e.target === this) hideModal(); };
    window.addEventListener("resize", resize);
    window.addEventListener("beforeunload", function () { if (state && state.stations.length) saveGame(state); });
  }

  /* --- loop --------------------------------------------------------------- */
  function frame(ts) {
    var dtReal = Math.min(0.1, (ts - lastFrame) / 1000 || 0);
    lastFrame = ts;

    var mult = CFG.speeds[state.speed] || 0;
    if (mult > 0) tick(state, dtReal * CFG.minutesPerRealSecond * mult);

    draw(ctx, state, UI);
    drawMinimap(mctx, state, mini.width, mini.height);
    refreshHUD(state);

    panelTimer -= dtReal;
    if (UI.panelDirty || panelTimer <= 0) { refreshPanel(state); panelTimer = 0.5; }

    if (state.yesterday !== lastReportRef) {
      lastReportRef = state.yesterday;
      showReport(state);
      var day = Math.floor((state.time + 360) / 1440);
      if (day !== lastSavedDay) { lastSavedDay = day; saveGame(state); }
    }
    if (UI.reportTimer > 0) {
      UI.reportTimer -= dtReal;
      if (UI.reportTimer <= 0) $("report").classList.remove("on");
    }

    requestAnimationFrame(frame);
  }

  /* --- go ----------------------------------------------------------------- */
  wireChrome();
  installInput(canvas);
  wirePanel();
  boot(hasSave() ? loadGame() : null);
  if (!hasSave()) setTimeout(showHelp, 400);
  requestAnimationFrame(frame);
})();
