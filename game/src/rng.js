/* ============================================================================
   RNG + the name generator
   ========================================================================= */

/* mulberry32: small, fast, seedable, good enough for a metro map */
function makeRng(seed) {
  var a = seed >>> 0;
  function rnd() {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  rnd.range = function (lo, hi) { return lo + rnd() * (hi - lo); };
  rnd.int = function (lo, hi) { return Math.floor(lo + rnd() * (hi - lo + 1)); };
  rnd.pick = function (arr) { return arr[Math.floor(rnd() * arr.length)]; };
  rnd.chance = function (p) { return rnd() < p; };
  rnd.shuffle = function (arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1)), t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  };
  rnd.seed = seed;
  return rnd;
}

/* --------------------------------------------------------------------------
   NameBag: hands out names without repeating itself. Curated names come out
   first (they are funnier), then the procedural generator takes over.
   -------------------------------------------------------------------------- */
function makeNameBag(rnd) {
  var P = METRO_NAMES.parts;
  var used = Object.create(null);
  var pool = rnd.shuffle(METRO_NAMES.stationCurated.slice());
  var cityPool = rnd.shuffle(METRO_NAMES.city.slice());
  var linePool = rnd.shuffle(METRO_NAMES.lines.slice());

  function generate() {
    var roll = rnd();
    if (roll < 0.22) {
      /* possessive: "Uncle Kev's Third Wife" */
      return rnd.pick(P.owner) + "'s " + rnd.pick(P.thing);
    }
    if (roll < 0.34) {
      /* "Nether Wibbling" style, no suffix */
      return rnd.pick(P.prefix) + " " + rnd.pick(P.core) + "ing" + rnd.pick(P.tail);
    }
    var name = rnd.pick(P.core) + rnd.pick(P.suffix);
    name = name.charAt(0).toUpperCase() + name.slice(1);
    if (rnd.chance(0.45)) name = rnd.pick(P.prefix) + " " + name;
    return name + rnd.pick(P.tail);
  }

  function unique(fn) {
    for (var i = 0; i < 60; i++) {
      var n = fn();
      if (!used[n]) { used[n] = 1; return n; }
    }
    var m = fn() + " " + rnd.int(2, 99);
    used[m] = 1;
    return m;
  }

  return {
    station: function () {
      if (pool.length && rnd.chance(0.82)) {
        var n = pool.pop();
        if (!used[n]) { used[n] = 1; return n; }
      }
      return unique(generate);
    },
    city: function () { return cityPool.length ? cityPool.pop() : unique(generate); },
    line: function () { return linePool.length ? linePool.pop() : unique(generate) + " Line"; },
    any: function () { return unique(generate); },
    claim: function (n) { used[n] = 1; }
  };
}
