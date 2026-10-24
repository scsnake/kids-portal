/**
 * WESTERN PACIFIC TYPHOON SATELLITE SIMULATOR
 * Real coastlines (Natural Earth 10m) and terrain (ETOPO1) seen from Himawari-9 at 140.7°E,
 * procedural GPU clouds, a CPU Navier-Stokes wind grid, an adaptive granularity governor
 * and a hardware benchmark.
 */
'use strict';

// =========================================================================
// GEOGRAPHY & PROJECTION
// =========================================================================

// Data domain: every texture and the fluid grid cover this lon/lat box.
const GEO = { minLon: 102, maxLon: 154, minLat: 3, maxLat: 42 };
const SPAN_LON = GEO.maxLon - GEO.minLon;
const SPAN_LAT = GEO.maxLat - GEO.minLat;

// Land raster (country id, land mask, Taiwan mask), drawn from coast.json at start.
const LAND = { res: 0.025, w: Math.round(SPAN_LON / 0.025), h: Math.round(SPAN_LAT / 0.025) };

// The view a media satellite image shows by default.
const BASE_BOX = { minLon: 108, maxLon: 141, minLat: 9, maxLat: 37 };
const MAX_ZOOM = 6;

// Geostationary view from Himawari-9 (spherical Earth)
const SAT_LON = 140.7;
const RE = 6378.137;
const HS = 42164.0;
const DEG = Math.PI / 180;

function lonLatToAngles(lon, lat) {
  const phi = lat * DEG, dl = (lon - SAT_LON) * DEG;
  const x = RE * Math.cos(phi) * Math.cos(dl);
  const y = RE * Math.cos(phi) * Math.sin(dl);
  const z = RE * Math.sin(phi);
  const hx = HS - x;
  return [Math.atan2(y, hx), Math.atan2(z, Math.hypot(hx, y))];
}

function anglesToLonLat(ax, ay) {
  const dx = -Math.cos(ay) * Math.cos(ax), dy = Math.cos(ay) * Math.sin(ax), dz = Math.sin(ay);
  const disc = RE * RE - HS * HS * (dy * dy + dz * dz);
  if (disc < 0) return null; // off the Earth disk
  const t = -HS * dx - Math.sqrt(disc);
  const X = HS + t * dx, Y = t * dy, Z = t * dz;
  return [SAT_LON + Math.atan2(Y, X) / DEG, Math.asin(Math.max(-1, Math.min(1, Z / RE))) / DEG];
}

function lonToNormX(lon) { return (lon - GEO.minLon) / SPAN_LON; }
function latToNormY(lat) { return (GEO.maxLat - lat) / SPAN_LAT; }
function normXToLon(nx) { return GEO.minLon + nx * SPAN_LON; }
function normYToLat(ny) { return GEO.maxLat - ny * SPAN_LAT; }

// View in scan-angle space; W/H in CSS pixels, k in CSS px per radian.
const view = { W: 1, H: 1, cx: 0, cy: 0, k: 1, zoom: 1, baseCx: 0, baseCy: 0, baseK: 1, dirty: true };

function toScreen(lon, lat) {
  const a = lonLatToAngles(lon, lat);
  return [view.W / 2 + (a[0] - view.cx) * view.k, view.H / 2 - (a[1] - view.cy) * view.k];
}

function fromScreen(x, y) {
  return anglesToLonLat(view.cx + (x - view.W / 2) / view.k, view.cy - (y - view.H / 2) / view.k);
}

function insideData(cx, cy, k) {
  const W = view.W, H = view.H;
  const pts = [[0, 0], [W / 2, 0], [W, 0], [0, H / 2], [W, H / 2], [0, H], [W / 2, H], [W, H]];
  for (const [sx, sy] of pts) {
    const ll = anglesToLonLat(cx + (sx - W / 2) / k, cy - (sy - H / 2) / k);
    if (!ll || ll[0] < GEO.minLon || ll[0] > GEO.maxLon || ll[1] < GEO.minLat || ll[1] > GEO.maxLat) return false;
  }
  return true;
}

function fitBaseView() {
  let minAx = Infinity, maxAx = -Infinity, minAy = Infinity, maxAy = -Infinity;
  for (let t = 0; t <= 1.0001; t += 0.05) {
    const lon = BASE_BOX.minLon + t * (BASE_BOX.maxLon - BASE_BOX.minLon);
    const lat = BASE_BOX.minLat + t * (BASE_BOX.maxLat - BASE_BOX.minLat);
    for (const [lo, la] of [[lon, BASE_BOX.minLat], [lon, BASE_BOX.maxLat], [BASE_BOX.minLon, lat], [BASE_BOX.maxLon, lat]]) {
      const a = lonLatToAngles(lo, la);
      minAx = Math.min(minAx, a[0]); maxAx = Math.max(maxAx, a[0]);
      minAy = Math.min(minAy, a[1]); maxAy = Math.max(maxAy, a[1]);
    }
  }
  const cx = (minAx + maxAx) / 2, cy = (minAy + maxAy) / 2;
  let k = Math.min(view.W / (maxAx - minAx), view.H / (maxAy - minAy));
  for (let guard = 0; guard < 120 && !insideData(cx, cy, k); guard++) k *= 1.02;
  view.baseCx = cx; view.baseCy = cy; view.baseK = k;
  setView(cx, cy, 1);
}

function setView(cx, cy, zoom) {
  zoom = Math.max(1, Math.min(MAX_ZOOM, zoom));
  const k = view.baseK * zoom;
  if (zoom <= 1.0001) {
    cx = view.baseCx; cy = view.baseCy;
  } else if (!insideData(cx, cy, k)) {
    // pull the center back toward the base view until the screen is inside the data
    let lo = 0, hi = 1;
    for (let i = 0; i < 14; i++) {
      const mid = (lo + hi) / 2;
      if (insideData(cx + (view.baseCx - cx) * mid, cy + (view.baseCy - cy) * mid, k)) hi = mid; else lo = mid;
    }
    cx += (view.baseCx - cx) * hi; cy += (view.baseCy - cy) * hi;
  }
  view.cx = cx; view.cy = cy; view.zoom = zoom; view.k = k; view.dirty = true;
}

function zoomAt(sx, sy, factor) {
  const ax = view.cx + (sx - view.W / 2) / view.k;
  const ay = view.cy - (sy - view.H / 2) / view.k;
  const zoom = Math.max(1, Math.min(MAX_ZOOM, view.zoom * factor));
  const k = view.baseK * zoom;
  setView(ax - (sx - view.W / 2) / k, ay + (sy - view.H / 2) / k, zoom);
}

// =========================================================================
// MAP DATA: COASTLINES, LAND RASTER, ELEVATION
// =========================================================================

let regions = [];        // [{ en, zh, id, rings: [Float32Array lon,lat,...] }]
let landPixels = null;   // ImageData bytes of the land raster
let landCanvas = null;
let demMeta = null;
let demMain = null;      // Float32Array metres (+ land, - sea)
let demTw = null;
let demImages = null;
let twBox = null;        // [lonW, latS, lonE, latN] of the Taiwan detail grid

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Cannot load ' + src));
    img.src = src;
  });
}

async function loadMapData() {
  const [coast, meta, dem, tw] = await Promise.all([
    fetch('coast.json?v=1').then(r => r.json()),
    fetch('dem.json?v=1').then(r => r.json()),
    loadImage('dem.png?v=1'),
    loadImage('dem-tw.png?v=1')
  ]);

  regions = coast.regions.map((reg, k) => {
    const rings = reg.rings.map(flat => {
      const out = new Float32Array(flat.length);
      let x = 0, y = 0;
      for (let i = 0; i < flat.length; i += 2) {
        x += flat[i]; y += flat[i + 1];
        out[i] = x / coast.scale; out[i + 1] = y / coast.scale;
      }
      return out;
    });
    return { en: reg.en, zh: reg.zh, id: k + 1, rings };
  });

  demMeta = meta;
  demImages = { main: dem, tw };
  demMain = decodeDem(dem, meta.dem, meta);
  demTw = decodeDem(tw, meta.tw, meta);
  const t = meta.tw;
  twBox = [t.lon0, t.lat0 + (t.h - 1) * t.dLat, t.lon0 + (t.w - 1) * t.dLon, t.lat0];
  buildLandRaster();
}

function decodeDem(img, g, meta) {
  const c = document.createElement('canvas');
  c.width = g.w; c.height = g.h;
  const x = c.getContext('2d', { willReadFrequently: true });
  x.drawImage(img, 0, 0);
  const d = x.getImageData(0, 0, g.w, g.h).data;
  const out = new Float32Array(g.w * g.h);
  for (let i = 0; i < out.length; i++) {
    const r = d[4 * i] / 255, gg = d[4 * i + 1] / 255;
    out[i] = r * r * meta.hMax - gg * gg * meta.dMax;
  }
  return out;
}

function buildLandRaster() {
  landCanvas = document.createElement('canvas');
  landCanvas.width = LAND.w; landCanvas.height = LAND.h;
  const x = landCanvas.getContext('2d', { willReadFrequently: true });
  x.fillStyle = '#000';
  x.fillRect(0, 0, LAND.w, LAND.h);
  for (const reg of regions) {
    // R = region id, G = land, B = Taiwan (only B and G are filtered on the GPU)
    x.fillStyle = `rgb(${reg.id},255,${reg.en === 'Taiwan' ? 255 : 0})`;
    x.beginPath();
    for (const ring of reg.rings) {
      for (let i = 0; i < ring.length; i += 2) {
        const px = (ring[i] - GEO.minLon) / LAND.res;
        const py = (GEO.maxLat - ring[i + 1]) / LAND.res;
        if (i === 0) x.moveTo(px, py); else x.lineTo(px, py);
      }
      x.closePath();
    }
    x.fill();
  }
  landPixels = x.getImageData(0, 0, LAND.w, LAND.h).data;
}

function landAt(lon, lat) {
  const px = Math.floor((lon - GEO.minLon) / LAND.res);
  const py = Math.floor((GEO.maxLat - lat) / LAND.res);
  if (!landPixels || px < 0 || py < 0 || px >= LAND.w || py >= LAND.h) return { land: false, region: null, taiwan: false };
  const k = (py * LAND.w + px) * 4;
  const g = landPixels[k + 1];
  if (g < 128) return { land: false, region: null, taiwan: false };
  const id = Math.round(landPixels[k] / (g / 255));
  return { land: true, region: regions[id - 1] || null, taiwan: landPixels[k + 2] > 127 };
}

function sampleGrid(arr, g, lon, lat) {
  const fx = (lon - g.lon0) / g.dLon, fy = (lat - g.lat0) / g.dLat;
  if (fx < 0 || fy < 0 || fx > g.w - 1 || fy > g.h - 1) return null;
  const x0 = Math.floor(fx), y0 = Math.floor(fy);
  const x1 = Math.min(g.w - 1, x0 + 1), y1 = Math.min(g.h - 1, y0 + 1);
  const tx = fx - x0, ty = fy - y0;
  return (arr[y0 * g.w + x0] * (1 - tx) + arr[y0 * g.w + x1] * tx) * (1 - ty) +
         (arr[y1 * g.w + x0] * (1 - tx) + arr[y1 * g.w + x1] * tx) * ty;
}

// Raw DEM metres at a point: positive = land height, negative = sea depth.
function demHeight(lon, lat) {
  if (!demMain) return 0;
  if (twBox && lon > twBox[0] && lon < twBox[2] && lat > twBox[1] && lat < twBox[3]) {
    const v = sampleGrid(demTw, demMeta.tw, lon, lat);
    if (v !== null) return v;
  }
  const v = sampleGrid(demMain, demMeta.dem, lon, lat);
  return v === null ? 0 : v;
}

function twScale() { return CONFIG.cmrHeight / 3952; }

// Ground height shown to the user (Taiwan follows the mountain slider).
function groundAt(lon, lat) {
  const L = landAt(lon, lat);
  const raw = demHeight(lon, lat);
  if (L.land) return { land: true, region: L.region, taiwan: L.taiwan, height: Math.max(0, raw) * (L.taiwan ? twScale() : 1), depth: 0 };
  return { land: false, region: null, taiwan: false, height: 0, depth: Math.max(0, -raw) };
}

// Real summit heights; the ETOPO1 grid (~2 km) smooths summits lower.
const PEAKS = [
  { zh: '玉山', en: 'Yushan', lon: 120.957, lat: 23.470, alt: 3952, tw: true, rank: 1 },
  { zh: '雪山', en: 'Xueshan', lon: 121.232, lat: 24.383, alt: 3886, tw: true, rank: 1 },
  { zh: '秀姑巒山', en: 'Xiuguluan', lon: 121.058, lat: 23.497, alt: 3805, tw: true, rank: 2 },
  { zh: '南湖大山', en: 'Nanhu', lon: 121.439, lat: 24.362, alt: 3742, tw: true, rank: 2 },
  { zh: '合歡山', en: 'Hehuan', lon: 121.272, lat: 24.142, alt: 3417, tw: true, rank: 3 },
  { zh: '北大武山', en: 'Beidawu', lon: 120.758, lat: 22.627, alt: 3092, tw: true, rank: 2 },
  { zh: '富士山', en: 'Mt. Fuji', lon: 138.731, lat: 35.363, alt: 3776, rank: 1 },
  { zh: '宮之浦岳', en: 'Miyanoura', lon: 130.504, lat: 30.336, alt: 1936, rank: 3 },
  { zh: '漢拏山', en: 'Hallasan', lon: 126.533, lat: 33.362, alt: 1947, rank: 2 },
  { zh: '智異山', en: 'Jirisan', lon: 127.731, lat: 35.337, alt: 1915, rank: 3 },
  { zh: '普拉格山', en: 'Mt. Pulag', lon: 120.887, lat: 16.587, alt: 2928, rank: 1 },
  { zh: '馬榮火山', en: 'Mayon', lon: 123.685, lat: 13.257, alt: 2463, rank: 2 },
  { zh: '阿波山', en: 'Mt. Apo', lon: 125.273, lat: 6.987, alt: 2954, rank: 1 },
  { zh: '京那巴魯山', en: 'Kinabalu', lon: 116.558, lat: 6.075, alt: 4095, rank: 1 },
  { zh: '黃崗山', en: 'Huanggang', lon: 117.78, lat: 27.83, alt: 2158, rank: 2 },
  { zh: '黃山', en: 'Huangshan', lon: 118.17, lat: 30.13, alt: 1864, rank: 3 },
  { zh: '五指山', en: 'Wuzhi', lon: 109.68, lat: 18.90, alt: 1840, rank: 2 },
  { zh: '峨眉山', en: 'Emei', lon: 103.33, lat: 29.52, alt: 3099, rank: 2 },
  { zh: '番西邦峰', en: 'Fansipan', lon: 103.775, lat: 22.303, alt: 3147, rank: 1 }
];

function peakAlt(peak) { return Math.round(peak.tw ? peak.alt * twScale() : peak.alt); }

function seaName(lon, lat) {
  if (lon >= 117.5 && lon <= 121 && lat >= 22.3 && lat <= 25.8) return ['台灣海峽', 'Taiwan Strait'];
  if (lon >= 119.5 && lon <= 122.5 && lat >= 19.3 && lat < 22.3) return ['巴士海峽', 'Luzon Strait'];
  if (lon >= 117.5 && lon <= 122 && lat >= 37 && lat <= 41) return ['渤海', 'Bohai Sea'];
  if (lon >= 119 && lon <= 126.5 && lat >= 33.5 && lat <= 41) return ['黃海', 'Yellow Sea'];
  if (lat > 34.8 && lon > 127.5 && lon < 133 + (lat - 34.8) * 2.2) return ['日本海', 'Sea of Japan'];
  if (lon >= 117 && lat >= 24.5 && lat <= 33.5 && lon < 123.5 + (lat - 24.3) * 1.05) return ['東海', 'East China Sea'];
  if (lon >= 119.5 && lon <= 123 && lat >= 7 && lat <= 12) return ['蘇祿海', 'Sulu Sea'];
  if (lon >= 119.5 && lon <= 125.5 && lat < 7) return ['西里伯斯海', 'Celebes Sea'];
  if (lat < 23 && (lon < 120.3 || (lat < 12 && lon < 119.5))) return ['南海', 'South China Sea'];
  if (lon < 141 && lat < 31) return ['菲律賓海', 'Philippine Sea'];
  return ['西北太平洋', 'NW Pacific'];
}

function nearestPeak(lon, lat, maxKm) {
  let best = null, bestD = maxKm;
  for (const p of PEAKS) {
    const dx = (p.lon - lon) * 111.32 * Math.cos(lat * DEG), dy = (p.lat - lat) * 110.57;
    const d = Math.hypot(dx, dy);
    if (d < bestD) { bestD = d; best = p; }
  }
  return best;
}

function describePoint(lon, lat) {
  const g = groundAt(lon, lat);
  let name;
  let elev = g.land ? `海拔 ${Math.round(g.height).toLocaleString()} m` : `水深 ${Math.round(g.depth).toLocaleString()} m`;
  if (g.land) {
    const summit = nearestPeak(lon, lat, 2);
    const near = nearestPeak(lon, lat, 8);
    if (summit) {
      // the ~2 km grid flattens summits, so show the surveyed height on top
      name = `${summit.zh} 山頂 ${summit.en} summit`;
      elev = `海拔 ${peakAlt(summit).toLocaleString()} m`;
    } else if (near) {
      name = `${near.zh}附近 near ${near.en}`;
    } else {
      name = g.region ? `${g.region.zh} ${g.region.zh === g.region.en ? '' : g.region.en}`.trim() : '陸地 Land';
    }
  } else {
    name = seaName(lon, lat).join(' ');
  }
  return { name, elev, ground: g };
}

// =========================================================================
// CONFIGURATION & SIMULATION STATE
// =========================================================================

// Granularity Tiers (From Low-power Efficiency to Hypercane Torture)
const GRANULARITY_TIERS = {
  1: { name: "Eco", gridW: 128, gridH: 96, substeps: 1, iterations: 16, particles: 22000, renderScale: 0.5, label: "Level 1 (Eco)" },
  2: { name: "Balanced", gridW: 160, gridH: 120, substeps: 1, iterations: 22, particles: 42000, renderScale: 0.6, label: "Level 2 (Balanced)" },
  3: { name: "High", gridW: 192, gridH: 144, substeps: 2, iterations: 28, particles: 65000, renderScale: 0.75, label: "Level 3 (High)" },
  4: { name: "Ultra", gridW: 240, gridH: 180, substeps: 2, iterations: 38, particles: 100000, renderScale: 0.9, label: "Level 4 (Ultra)" },
  5: { name: "Hyper", gridW: 288, gridH: 216, substeps: 3, iterations: 52, particles: 150000, renderScale: 1.0, label: "Level 5 (Hypercane Melter)" }
};

const CONFIG = {
  isAdaptive: true,
  currentTier: 3,
  targetFPS: 60,
  gridW: 192,
  gridH: 144,
  substeps: 2,
  iterations: 28,
  particleCount: 65000,
  renderScale: 0.75,
  cmrHeight: 3952,
  sstBase: 30.0,
  coriolisFactor: 1.0,
  activeLayer: 'satellite', // 'satellite', 'radar', 'topo', 'stream', 'pressure', 'sst'
  showPeaks: true,
  probeMode: false,
  isSoundEnabled: false
};

const LAYER_INDEX = { satellite: 0, radar: 1, topo: 2, stream: 3, pressure: 4, sst: 5 };

// Fluid Grids
let GW = CONFIG.gridW;
let GH = CONFIG.gridH;
let size = GW * GH;

let u, v, u_prev, v_prev;
let p, div;
let density, density_prev;
let terrain;          // Normalized height 0.0 to 1.0
let elevMeters;       // Elevation in meters
let isLandMap;        // 1 if land, 0 if ocean
let sstClim;          // climatological sea surface temperature
let sstAnom;          // cold wake left by the typhoon
let sstMap;
let sstShown;         // sea value under land too, so the SST layer has no cold coast fringe

// Particles Data Buffer
const MAX_PARTICLES = 160000;
const px = new Float32Array(MAX_PARTICLES);
const py = new Float32Array(MAX_PARTICLES);
const pAge = new Float32Array(MAX_PARTICLES);
const pMaxAge = new Float32Array(MAX_PARTICLES);
const pVel = new Float32Array(MAX_PARTICLES);

// Typhoon start: east of Luzon, like the classic media image
const TC_START = { lon: 130.2, lat: 19.2 };

const typhoon = {
  x: lonToNormX(TC_START.lon),
  y: latToNormY(TC_START.lat),
  targetX: lonToNormX(TC_START.lon),
  targetY: latToNormY(TC_START.lat),
  intensity: 0.85,
  radius: 0.06,
  rot: 0,
  trend: 0,
  vx: 0,
  vy: 0,
  isDragging: false
};

// Web Audio Synthesizer State
let audioCtx = null;
let windFilter = null;
let windGain = null;

// Performance & Benchmark Accounting
let frameCount = 0;
let lastFpsUpdate = performance.now();
let fps = 60;
let rollingFps = 60;
let currentOpsPerSec = 0;

const governor = {
  lastEvalTime: performance.now(),
  evalInterval: 1200,
  fpsHistory: [],
  cooldown: 0,
  stableStreak: 0
};

const bench = {
  active: false,
  duration: 15.0,
  timeLeft: 15.0,
  frames: 0,
  fpsList: [],
  opsList: [],
  totalOps: 0,
  startTime: 0,
  lastFrameTime: performance.now()
};

let hardwareRating = {
  roughScore: 0,
  tierName: "Detecting...",
  classType: "Standard"
};

// =========================================================================
// HARDWARE PROBE & GRANULARITY
// =========================================================================

// Calibrated on an Apple M-series Mac (~1.9M ops/ms in Chrome and Safari): ~40k points in Chrome
const PROBE_SCALE = 0.0067;

/**
 * Startup Micro-Benchmark: Evaluates Raw Hardware Math Throughput
 */
function performStartupHardwareProbe() {
  const concurrency = navigator.hardwareConcurrency || 4;
  const memEstimate = navigator.deviceMemory || 4;

  const dummyA = new Float32Array(512);
  const dummyB = new Float32Array(512);
  for (let k = 0; k < 512; k++) dummyA[k] = Math.sin(k * 0.1);

  // Fixed 80 ms window: a fast CPU does more stencil passes, the time stays the same
  let mathOps = 0;
  const probeStart = performance.now();
  let probeDuration = 0;
  while (probeDuration < 80) {
    for (let cycle = 0; cycle < 50; cycle++) {
      for (let i = 1; i < 511; i++) {
        dummyB[i] = (dummyA[i - 1] + dummyA[i + 1] + dummyA[i] * 1.5) * 0.2857;
      }
      for (let i = 1; i < 511; i++) dummyA[i] = dummyB[i];
      mathOps += 510 * 4;
    }
    probeDuration = performance.now() - probeStart;
  }
  const opsPerMs = mathOps / probeDuration;
  window.__probeOpsPerMs = opsPerMs;
  const estimatedScore = Math.floor((opsPerMs * PROBE_SCALE) + (concurrency * 1800) + (memEstimate * 800));

  let tierName, classType, initialTier;
  if (estimatedScore >= 38000) {
    tierName = "Ultra Workstation"; classType = "Tier 1: Monster Silicon"; initialTier = 4;
  } else if (estimatedScore >= 24000) {
    tierName = "Flagship Device"; classType = "Tier 2: High Performance"; initialTier = 3;
  } else if (estimatedScore >= 14000) {
    tierName = "Mainstream Laptop / Mobile"; classType = "Tier 3: Balanced Power"; initialTier = 2;
  } else {
    tierName = "Efficiency Platform"; classType = "Tier 4: Low Power / Eco"; initialTier = 1;
  }

  hardwareRating = { roughScore: estimatedScore, tierName, classType };
  document.getElementById('rough-score-val').innerText = estimatedScore.toLocaleString();
  document.getElementById('detected-tier-tag').innerText = tierName.toUpperCase();

  if (CONFIG.isAdaptive) applyGranularityTier(initialTier, false);
}

/**
 * Apply Granularity Tier with Smooth Bilinear Grid Resampling
 */
function applyGranularityTier(tierLevel, notifyUser = true) {
  tierLevel = Math.max(1, Math.min(5, tierLevel));
  const target = GRANULARITY_TIERS[tierLevel];
  if (!target) return;

  const oldGW = GW, oldGH = GH;
  const oldU = u, oldV = v, oldDens = density;

  CONFIG.currentTier = tierLevel;
  CONFIG.gridW = target.gridW;
  CONFIG.gridH = target.gridH;
  CONFIG.substeps = target.substeps;
  CONFIG.iterations = target.iterations;
  CONFIG.particleCount = target.particles;
  CONFIG.renderScale = target.renderScale;

  GW = CONFIG.gridW;
  GH = CONFIG.gridH;
  size = GW * GH;

  u = new Float32Array(size);
  v = new Float32Array(size);
  u_prev = new Float32Array(size);
  v_prev = new Float32Array(size);
  p = new Float32Array(size);
  div = new Float32Array(size);
  density = new Float32Array(size);
  density_prev = new Float32Array(size);
  sstAnom = new Float32Array(size);

  if (oldU && oldV && oldDens) {
    for (let j = 0; j < GH; j++) {
      const oy = (j / GH) * oldGH;
      const j0 = Math.floor(oy), j1 = Math.min(oldGH - 1, j0 + 1), fy = oy - j0;
      for (let i = 0; i < GW; i++) {
        const ox = (i / GW) * oldGW;
        const i0 = Math.floor(ox), i1 = Math.min(oldGW - 1, i0 + 1), fx = ox - i0;
        const idx00 = i0 + j0 * oldGW, idx10 = i1 + j0 * oldGW, idx01 = i0 + j1 * oldGW, idx11 = i1 + j1 * oldGW;
        const nIdx = i + j * GW;
        u[nIdx] = (1 - fx) * (1 - fy) * oldU[idx00] + fx * (1 - fy) * oldU[idx10] + (1 - fx) * fy * oldU[idx01] + fx * fy * oldU[idx11];
        v[nIdx] = (1 - fx) * (1 - fy) * oldV[idx00] + fx * (1 - fy) * oldV[idx10] + (1 - fx) * fy * oldV[idx01] + fx * fy * oldV[idx11];
        density[nIdx] = (1 - fx) * (1 - fy) * oldDens[idx00] + fx * (1 - fy) * oldDens[idx10] + (1 - fx) * fy * oldDens[idx01] + fx * fy * oldDens[idx11];
      }
    }
    initBasinGeography();
  } else {
    initBasinGeography();
    seedTyphoonVortex(typhoon.x, typhoon.y, typhoon.intensity);
  }

  resizeGL();
  view.dirty = true;
  gpu.fieldDirty = true;

  document.getElementById('label-adaptive-level').innerText = `${CONFIG.isAdaptive ? 'AUTO' : 'MANUAL'}: ${target.label.toUpperCase()}`;
  document.getElementById('hud-grid-cells').innerText = `${GW} × ${GH}`;
  document.getElementById('hud-particles').innerText = CONFIG.particleCount.toLocaleString();

  if (notifyUser) {
    showScalingToast(`Granularity Adjusted: ${target.name} (${GW}×${GH} | ${(CONFIG.particleCount / 1000).toFixed(0)}k pts)`);
  }
}

function showScalingToast(msg) {
  const toast = document.getElementById('toast-scaling');
  document.getElementById('toast-scaling-text').innerText = msg;
  toast.classList.remove('hidden');
  clearTimeout(showScalingToast.timer);
  showScalingToast.timer = setTimeout(() => toast.classList.add('hidden'), 2200);
}

// Kuroshio axis: east of Taiwan, past the Ryukyus, along south Japan
const KUROSHIO = [[121.8, 21.5], [122.3, 24.0], [123.5, 25.6], [127.0, 28.0], [130.5, 30.6], [134.0, 32.8], [138.0, 34.0], [141.5, 35.6]];

function climatologySST(lon, lat, depth) {
  let sst = CONFIG.sstBase - Math.max(0, lat - 18) * 0.38;
  let dMin = Infinity;
  for (let k = 0; k < KUROSHIO.length - 1; k++) {
    const a = KUROSHIO[k], b = KUROSHIO[k + 1];
    const d2 = distToSegmentSquared([lon, lat], a, b);
    if (d2 < dMin) dMin = d2;
  }
  sst += 1.8 * Math.exp(-dMin / 0.8) * Math.min(1, Math.max(0, (lat - 20) / 3));
  // cool shallow shelf in the north (autumn mixing)
  if (lat > 23 && depth < 150) sst -= 1.6 * Math.min(1, (lat - 23) / 4);
  return sst;
}

function distToSegmentSquared(pt, a, b) {
  const l2 = (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
  if (l2 === 0) return (pt[0] - a[0]) ** 2 + (pt[1] - a[1]) ** 2;
  let t = ((pt[0] - a[0]) * (b[0] - a[0]) + (pt[1] - a[1]) * (b[1] - a[1])) / l2;
  t = Math.max(0, Math.min(1, t));
  return (pt[0] - (a[0] + t * (b[0] - a[0]))) ** 2 + (pt[1] - (a[1] + t * (b[1] - a[1]))) ** 2;
}

/**
 * Build the fluid grid's geography from the real coastline raster and DEM
 */
function initBasinGeography() {
  terrain = new Float32Array(size);
  elevMeters = new Float32Array(size);
  isLandMap = new Uint8Array(size);
  sstClim = new Float32Array(size);
  sstMap = new Float32Array(size);
  sstShown = new Float32Array(size);
  if (!sstAnom || sstAnom.length !== size) sstAnom = new Float32Array(size);

  for (let j = 0; j < GH; j++) {
    const lat = normYToLat((j + 0.5) / GH);
    for (let i = 0; i < GW; i++) {
      const lon = normXToLon((i + 0.5) / GW);
      const idx = i + j * GW;
      const g = groundAt(lon, lat);
      isLandMap[idx] = g.land ? 1 : 0;
      elevMeters[idx] = g.height;
      terrain[idx] = Math.min(1.0, g.height / 3952.0);
      const seaSST = climatologySST(lon, lat, g.depth);
      sstShown[idx] = seaSST;
      sstClim[idx] = g.land ? CONFIG.sstBase - 15.0 : seaSST;
      sstMap[idx] = sstClim[idx] + sstAnom[idx];
    }
  }
  gpu.fieldDirty = true;
}

/**
 * Initialize Wind Particles System
 */
function initParticles() {
  for (let i = 0; i < MAX_PARTICLES; i++) {
    px[i] = Math.random() * GW;
    py[i] = Math.random() * GH;
    pAge[i] = Math.random() * 80;
    pMaxAge[i] = 40 + Math.random() * 80;
    pVel[i] = 0;
  }
}

/**
 * Vortex Seeding with Atmospheric Tangential & Inward Vector Velocity
 */
function seedTyphoonVortex(cxNorm, cyNorm, strength) {
  const cx = cxNorm * GW, cy = cyNorm * GH;
  const rMax = Math.min(GW, GH) * typhoon.radius;
  for (let j = 0; j < GH; j++) {
    for (let i = 0; i < GW; i++) {
      const dx = i - cx, dy = j - cy;
      const dist = Math.sqrt(dx * dx + dy * dy) + 0.001;
      const idx = i + j * GW;
      if (dist < rMax * 4.5) {
        const vTangential = (strength * 22.0) * (dist / (dist * dist + rMax * rMax * 0.3));
        const vRadial = -vTangential * 0.25;
        u[idx] += (-dy / dist) * vTangential + (dx / dist) * vRadial;
        v[idx] += (dx / dist) * vTangential + (dy / dist) * vRadial;
        density[idx] = Math.min(2.8, density[idx] + Math.exp(-dist / rMax) * 2.2);
      }
    }
  }
}

/**
 * Eulerian Navier-Stokes Solver Step
 */
function fluidStep(dt) {
  let ops = 0;
  let idx;

  const cx = typhoon.x * GW, cy = typhoon.y * GH;
  const rEye = Math.min(GW, GH) * typhoon.radius;
  const coriolis = 0.08 * CONFIG.coriolisFactor;

  for (let j = 0; j < GH; j++) {
    for (let i = 0; i < GW; i++) {
      idx = i + j * GW;
      const dx = i - cx, dy = j - cy;
      const d2 = dx * dx + dy * dy;
      const dist = Math.sqrt(d2) + 0.001;

      // Eyewall Continuous Acceleration
      if (dist < rEye * 4.0) {
        const sstFuel = Math.max(0.2, (sstMap[idx] - 25.0) * 0.28);
        const force = (typhoon.intensity * sstFuel * 7.5) / (1.0 + d2 * 0.04);
        u[idx] += (-dy / dist) * force * dt;
        v[idx] += (dx / dist) * force * dt;
        if (dist > rEye * 0.5 && dist < rEye * 2.8) {
          density[idx] = Math.min(3.5, density[idx] + 0.05 * sstFuel);
        }
      }

      // Coriolis Force
      const vx = u[idx], vy = v[idx];
      u[idx] += vy * coriolis * dt;
      v[idx] -= vx * coriolis * dt;

      // Mountain Drag
      const mountainH = terrain[idx];
      if (mountainH > 0.02) {
        const mountainFriction = 1.0 - Math.min(0.92, mountainH * 1.5 * dt * 8.0);
        u[idx] *= mountainFriction;
        v[idx] *= mountainFriction;
        density[idx] *= 0.95;
      }
      ops += 18;
    }
  }

  // Advection
  for (let j = 1; j < GH - 1; j++) {
    for (let i = 1; i < GW - 1; i++) {
      idx = i + j * GW;
      let x = i - dt * u[idx];
      let y = j - dt * v[idx];
      x = Math.max(0.5, Math.min(GW - 1.5, x));
      y = Math.max(0.5, Math.min(GH - 1.5, y));
      const i0 = Math.floor(x), i1 = i0 + 1;
      const j0 = Math.floor(y), j1 = j0 + 1;
      const s1 = x - i0, s0 = 1 - s1;
      const t1 = y - j0, t0 = 1 - t1;
      u_prev[idx] = s0 * (t0 * u[i0 + j0 * GW] + t1 * u[i0 + j1 * GW]) + s1 * (t0 * u[i1 + j0 * GW] + t1 * u[i1 + j1 * GW]);
      v_prev[idx] = s0 * (t0 * v[i0 + j0 * GW] + t1 * v[i0 + j1 * GW]) + s1 * (t0 * v[i1 + j0 * GW] + t1 * v[i1 + j1 * GW]);
      density_prev[idx] = s0 * (t0 * density[i0 + j0 * GW] + t1 * density[i0 + j1 * GW]) + s1 * (t0 * density[i1 + j0 * GW] + t1 * density[i1 + j1 * GW]);
      ops += 24;
    }
  }

  for (let k = 0; k < size; k++) {
    u[k] = u_prev[k];
    v[k] = v_prev[k];
    density[k] = Math.max(0, density_prev[k] * 0.998);
  }

  // Pressure Projection
  for (let j = 1; j < GH - 1; j++) {
    for (let i = 1; i < GW - 1; i++) {
      idx = i + j * GW;
      div[idx] = -0.5 * (u[idx + 1] - u[idx - 1] + v[idx + GW] - v[idx - GW]);
      p[idx] = 0;
      ops += 6;
    }
  }

  const iters = CONFIG.iterations;
  for (let it = 0; it < iters; it++) {
    for (let j = 1; j < GH - 1; j++) {
      for (let i = 1; i < GW - 1; i++) {
        idx = i + j * GW;
        p[idx] = (div[idx] + p[idx - 1] + p[idx + 1] + p[idx - GW] + p[idx + GW]) * 0.25;
        ops += 5;
      }
    }
  }

  for (let j = 1; j < GH - 1; j++) {
    for (let i = 1; i < GW - 1; i++) {
      idx = i + j * GW;
      u[idx] -= 0.5 * (p[idx + 1] - p[idx - 1]);
      v[idx] -= 0.5 * (p[idx + GW] - p[idx - GW]);
      ops += 6;
    }
  }

  return ops;
}

/**
 * Particle Advection & Wind Gust Vector Tracing
 */
function updateParticles(dt) {
  let ops = 0;
  const count = CONFIG.particleCount;
  for (let i = 0; i < count; i++) {
    const gx = Math.min(GW - 2, Math.max(1, Math.floor(px[i])));
    const gy = Math.min(GH - 2, Math.max(1, Math.floor(py[i])));
    const idx = gx + gy * GW;
    const vx = u[idx], vy = v[idx];
    pVel[i] = Math.sqrt(vx * vx + vy * vy);

    px[i] += vx * dt * 2.2;
    py[i] += vy * dt * 2.2;
    pAge[i] += 1;

    if (pAge[i] > pMaxAge[i] || px[i] < 1 || px[i] >= GW - 1 || py[i] < 1 || py[i] >= GH - 1) {
      if (Math.random() < 0.65) {
        const rad = Math.random() * (GW * typhoon.radius * 2.6);
        const ang = Math.random() * Math.PI * 2;
        px[i] = (typhoon.x * GW) + Math.cos(ang) * rad;
        py[i] = (typhoon.y * GH) + Math.sin(ang) * rad;
      } else {
        px[i] = Math.random() * GW;
        py[i] = Math.random() * GH;
      }
      pAge[i] = 0;
      pMaxAge[i] = 40 + Math.random() * 80;
    }
    ops += 14;
  }
  return ops;
}

// =========================================================================
// TYPHOON LIFE CYCLE (warm sea feeds it, land and mountains break it)
// =========================================================================

function tcLonLat() { return [normXToLon(typhoon.x), normYToLat(typhoon.y)]; }
function tcMaxWindKt() { return 35 + 120 * typhoon.intensity; }
function tcPressure() { return 1005 - 100 * typhoon.intensity; }
function tcRmwKm() { return 60 - 32 * typhoon.intensity; }

// Holland-type wind profile (kt) at a distance from the eye
function windAtKm(rKm, overLand) {
  const x = Math.pow(tcRmwKm() / Math.max(rKm, 1), 1.4);
  const vt = tcMaxWindKt() * Math.sqrt(x * Math.exp(1 - x));
  return Math.max(vt, 8) * (overLand ? 0.75 : 1);
}

function kmBetween(lon1, lat1, lon2, lat2) {
  const dx = (lon2 - lon1) * 111.32 * Math.cos(0.5 * (lat1 + lat2) * DEG);
  const dy = (lat2 - lat1) * 110.57;
  return Math.hypot(dx, dy);
}

function sstAtEye() {
  const i = Math.max(0, Math.min(GW - 1, Math.floor(typhoon.x * GW)));
  const j = Math.max(0, Math.min(GH - 1, Math.floor(typhoon.y * GH)));
  // the storm feels part of its own wake: a long stall weakens it but does not kill it
  return sstMap ? sstClim[i + j * GW] + 0.3 * sstAnom[i + j * GW] : CONFIG.sstBase;
}

let tcEnv = { land: false, height: 0, sst: 29 };

function updateTyphoon(dt) {
  const px0 = typhoon.x, py0 = typhoon.y;
  typhoon.x += (typhoon.targetX - typhoon.x) * 0.08;
  typhoon.y += (typhoon.targetY - typhoon.y) * 0.08;
  const k = Math.min(1, dt * 4);
  typhoon.vx += ((typhoon.x - px0) / Math.max(dt, 1e-3) - typhoon.vx) * k;
  typhoon.vy += ((typhoon.y - py0) / Math.max(dt, 1e-3) - typhoon.vy) * k;

  const [lon, lat] = tcLonLat();
  const g = groundAt(lon, lat);
  const sst = g.land ? CONFIG.sstBase : sstAtEye();
  tcEnv = { land: g.land, height: g.height, sst };

  let pot = g.land ? 0.1 : Math.max(0, Math.min(1, (sst - 26.0) / 4.0));
  pot *= Math.min(1, CONFIG.coriolisFactor) * Math.min(1, Math.max(0, (lat - 4) / 4));
  let rate;
  if (typhoon.intensity > pot) {
    rate = g.land ? 0.12 + 0.45 * Math.min(1, g.height / 3000) : 0.05;
  } else {
    rate = 0.035;
  }
  const before = typhoon.intensity;
  typhoon.intensity = Math.max(0.02, Math.min(1, typhoon.intensity + (pot - typhoon.intensity) * rate * dt));
  typhoon.trend = typhoon.trend * 0.95 + ((typhoon.intensity - before) / Math.max(dt, 1e-3)) * 0.05;
  typhoon.rot += dt * (0.12 + 0.28 * typhoon.intensity);

  // Cold wake: strong winds stir up cool deep water, most on the right of the track.
  // It fades slowly, so a moving typhoon leaves a cool trail behind it.
  if (sstAnom) {
    const r = Math.max(2, GW * 0.022);
    const sp = Math.hypot(typhoon.vx, typhoon.vy);
    const side = Math.min(1, sp / 0.02) * 0.7 * r;   // grid y points south, so (-vy, vx) is the right-hand side
    const ci = typhoon.x * GW + (sp > 1e-6 ? -typhoon.vy / sp : 0) * side;
    const cj = typhoon.y * GH + (sp > 1e-6 ? typhoon.vx / sp : 0) * side;
    const i0 = Math.max(0, Math.floor(ci - 3 * r)), i1 = Math.min(GW - 1, Math.ceil(ci + 3 * r));
    const j0 = Math.max(0, Math.floor(cj - 3 * r)), j1 = Math.min(GH - 1, Math.ceil(cj + 3 * r));
    for (let n = 0; n < size; n++) sstAnom[n] *= (1 - 0.002 * dt);
    for (let j = j0; j <= j1; j++) {
      for (let i = i0; i <= i1; i++) {
        const idx = i + j * GW;
        const d2 = ((i - ci) ** 2 + (j - cj) ** 2) / (r * r);
        sstAnom[idx] = Math.max(-4, sstAnom[idx] - 1.2 * typhoon.intensity * dt * Math.exp(-d2));
      }
    }
    for (let n = 0; n < size; n++) sstMap[n] = sstClim[n] + sstAnom[n];
    gpu.fieldDirty = true;
  }
}

function tcClass(kt) {
  if (kt >= 100) return ['強烈颱風', 'STRONG TYPHOON'];
  if (kt >= 64) return ['中度颱風', 'TYPHOON'];
  if (kt >= 34) return ['輕度颱風', 'TROPICAL STORM'];
  return ['熱帶性低氣壓', 'TROPICAL DEPRESSION'];
}

function updateTyphoonCard() {
  const kt = tcMaxWindKt();
  const [zh, en] = tcClass(kt);
  document.getElementById('tc-class').innerText = `${zh} ${en}`;
  document.getElementById('tc-wind').innerText = kt.toFixed(0);
  document.getElementById('tc-pres').innerText = tcPressure().toFixed(0);
  let trend;
  if (tcEnv.land && tcEnv.height > 1500) trend = 'High mountains break the eye 高山破壞颱風眼';
  else if (tcEnv.land) trend = 'Over land · weakening 登陸減弱';
  else if (typhoon.trend < -0.002) trend = 'Cool sea · weakening 海溫低減弱';
  else if (typhoon.trend > 0.002) trend = 'Warm sea · strengthening 暖海增強';
  else trend = 'Steady 強度持平';
  document.getElementById('tc-trend').innerText = trend;
  document.getElementById('hud-sst').innerText = tcEnv.land ? 'over land' : `${tcEnv.sst.toFixed(1)} °C`;
}

// =========================================================================
// GPU RENDERER (ground, clouds and data layers)
// =========================================================================

const glCanvas = document.getElementById('gl-canvas');
const canvas = document.getElementById('sim-canvas');
const ctx = canvas.getContext('2d');
const gpu = { gl: null, prog: null, loc: {}, tex: {}, fieldDirty: true, fieldW: 0, fieldH: 0, fieldBuf: null, w: 1, h: 1 };

const VERT_SRC = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG_SRC = `#version 300 es
precision highp float;
precision highp sampler2D;
out vec4 outColor;

uniform vec2 uRes;
uniform vec3 uView;          // center scan angles (rad), GL px per rad
uniform sampler2D uDem;
uniform sampler2D uDemTw;
uniform sampler2D uLand;
uniform sampler2D uNoise;
uniform sampler2D uField;
uniform vec4 uDemGeo;        // first texel lon, lat, dLon, dLat
uniform vec2 uDemSize;
uniform vec4 uTwGeo;
uniform vec2 uTwSize;
uniform vec4 uTwBox;         // lonW, latS, lonE, latN
uniform vec4 uGeo;           // minLon, maxLat, spanLon, spanLat
uniform float uTwScale;
uniform vec4 uTc;            // eye lon, lat, intensity, rotation
uniform float uTime;
uniform int uLayer;

const float RE = 6378.137;
const float HS = 42164.0;
const float SAT_LON = 140.7;

vec2 lonLat(vec2 a, out float ok) {
  vec3 d = vec3(-cos(a.y) * cos(a.x), cos(a.y) * sin(a.x), sin(a.y));
  float disc = RE * RE - HS * HS * (d.y * d.y + d.z * d.z);
  ok = step(0.0, disc);
  float t = -HS * d.x - sqrt(max(disc, 0.0));
  vec3 p = vec3(HS, 0.0, 0.0) + t * d;
  return vec2(SAT_LON + degrees(atan(p.y, p.x)), degrees(asin(clamp(p.z / RE, -1.0, 1.0))));
}

vec2 gridUv(vec4 g, vec2 sz, vec2 ll) {
  return (vec2((ll.x - g.x) / g.z, (ll.y - g.y) / g.w) + 0.5) / sz;
}

float decodeH(vec4 c) { return c.r * c.r * 6000.0 - c.g * c.g * 10000.0; }

float heightRaw(vec2 ll) {
  float h = decodeH(texture(uDem, gridUv(uDemGeo, uDemSize, ll)));
  float e = min(min(ll.x - uTwBox.x, uTwBox.z - ll.x), min(ll.y - uTwBox.y, uTwBox.w - ll.y));
  float hw = decodeH(texture(uDemTw, gridUv(uTwGeo, uTwSize, ll)));
  return mix(h, hw, smoothstep(0.0, 0.15, e));
}

vec2 geoUv(vec2 ll) { return vec2((ll.x - uGeo.x) / uGeo.z, (uGeo.y - ll.y) / uGeo.w); }

float fbm(vec2 p, int oct) {
  float s = 0.0, a = 0.5, n = 0.0;
  for (int i = 0; i < 6; i++) {
    if (i >= oct) break;
    s += a * texture(uNoise, p).r;
    n += a;
    p = mat2(1.62, 1.18, -1.18, 1.62) * p + vec2(0.31, 0.57);
    a *= 0.5;
  }
  return (s / n - 0.5) * 10.0;   // roughly zero mean, unit spread
}

vec2 rot2(vec2 q, float a) { float c = cos(a), s = sin(a); return vec2(c * q.x - s * q.y, s * q.x + c * q.y); }

// Typhoon cloud: density (x), convective strength for radar (y), fine texture (z)
vec3 typhoonCloud(vec2 q) {
  float I = uTc.z;
  float r = length(q) + 0.001;
  float th = atan(q.y, q.x);
  float rEye = mix(45.0, 14.0, I);
  float rCdo = mix(110.0, 290.0, I);
  float rOut = mix(550.0, 1000.0, I);
  float spin = uTc.w;
  vec2 evo = vec2(uTime * 0.0021, -uTime * 0.0017);

  // large structure turns with the storm
  vec2 qs = rot2(q, 1.0 * log(1.0 + r / 80.0) - spin);
  float nL = fbm(qs / 6400.0 + evo, 4);

  // cloud texture flows: spins faster near the eye and drifts inward.
  // Two phases cross-fade so the spiral never winds up too tight.
  float ph0 = fract(uTime / 4.5);
  float ph1 = fract(uTime / 4.5 + 0.5);
  float w0 = 1.0 - abs(2.0 * ph0 - 1.0);
  float w1 = 1.0 - w0;
  float omega = 0.25 * (1.0 + 1.5 / (1.0 + r / 120.0)) * mix(0.4, 1.0, I);
  float swirl = 1.0 * log(1.0 + r / 80.0);
  vec2 qa = rot2(q * exp(0.05 * ph0 * 4.5), swirl - omega * ph0 * 4.5);
  vec2 qb = rot2(q * exp(0.05 * ph1 * 4.5), swirl - omega * ph1 * 4.5);
  float norm = inversesqrt(w0 * w0 + w1 * w1);
  float nM = (fbm(qa / 2800.0 + 3.7, 4) * w0 + fbm(qb / 2800.0 + 9.2, 4) * w1) * norm;
  float nS = (fbm(qa / 1040.0 + 1.3, 3) * w0 + fbm(qb / 1040.0 + 6.4, 3) * w1) * norm;

  // central dense overcast: bright and round, with a ragged edge
  float edge = rCdo * (1.0 + 0.13 * nL + 0.07 * nM);
  float cdo = 1.0 - smoothstep(edge * 0.62, edge * 1.12, r);

  float clear = smoothstep(0.35, 0.8, I);
  float eye = smoothstep(rEye * 0.7, rEye * 1.25, r + 3.0 * nS);
  float wr = (r - rEye * 1.7) / (rEye * 0.9);
  float wall = exp(-wr * wr);

  // two broad spiral bands that trail clockwise outward
  float b = 2.6;
  float phase = 2.0 * (th + b * log(1.0 + r / 80.0) - spin) + 0.7 * nL;
  float arms = 0.5 + 0.5 * cos(phase);
  float env = smoothstep(rCdo * 0.5, rCdo * 1.0, r) * (1.0 - smoothstep(rOut * 0.45, rOut, r));
  float bands = smoothstep(0.45, 0.8, arms + 0.12 * nL + 0.08 * nM) * env;
  bands *= 0.72 + 0.28 * smoothstep(-1.6, 1.6, nM + 0.4 * nS);
  bands *= 0.75 + 0.25 * cos(th - 0.9);          // feeder band heavier to the south-east

  float dense = max(cdo, bands);
  dense = mix(dense, dense * eye, clear);
  // weak storms are ragged
  dense *= mix(0.45 + 0.55 * smoothstep(-1.0, 0.8, nM), 1.0, smoothstep(0.25, 0.65, I));
  float strength = smoothstep(0.0, 0.25, I);
  dense *= strength;

  // fibrous cirrus outflow at the rim, turning the other way
  vec2 qc = rot2(q, -0.9 * log(1.0 + r / 200.0) + spin * 0.2);
  float nc = fbm(qc / 1800.0 + evo * 0.7 + 5.1, 5);
  float cir = (0.45 + 0.55 * smoothstep(-1.6, 1.6, nc)) * smoothstep(rCdo * 0.8, rCdo * 1.3, r) * (1.0 - smoothstep(rCdo * 1.5, rCdo * 2.5, r));
  float total = 1.0 - (1.0 - dense) * (1.0 - 0.32 * cir * I);

  float conv = max(cdo * 0.5 * (0.8 + 0.3 * nM), bands * (0.6 + 0.35 * nM + 0.15 * nS));
  conv = max(conv, wall * clear * (0.85 + 0.15 * nS));
  conv *= mix(1.0, eye, clear) * strength * mix(0.6, 1.0, I);
  return vec3(total, conv, nS);
}

// Background weather: trade-wind cumulus, tropical clusters, mid-latitude cloud bands
vec2 backgroundCloud(vec2 ll, float land, float rKm) {
  float lat = ll.y;
  // each field moves as one piece (trade winds west, westerlies east), so nothing smears
  vec2 g = vec2(ll.x * cos(radians(lat)), lat);
  vec2 p = g - vec2(-0.12, 0.015) * uTime;    // degrees per second
  vec2 pm = g - vec2(0.30, 0.02) * uTime;
  float clus = fbm(p / 48.0 + vec2(5.2, 1.3), 4);
  // a second field moving the other way makes cumulus grow and fade
  float pop = 0.75 * fbm(p / 7.2, 5) + 0.45 * fbm(p / 5.0 + vec2(0.05, -0.03) * uTime + 4.4, 3);
  float tex = fbm(p / 14.0 + vec2(2.9, 7.7), 4);
  float trop = 1.0 - smoothstep(17.0, 26.0, lat);
  // popcorn cumulus: small specks, more over warm land
  float cu = smoothstep(1.1, 1.7, pop + 0.8 * clus + 0.6 * land) * trop * 0.75;
  // convective clusters: lumpy, with towers and thin anvils
  float cbCore = smoothstep(0.9, 1.9, clus + 0.35 * tex);
  float cb = cbCore * (0.55 + 0.45 * smoothstep(-0.8, 1.0, tex + 0.5 * pop)) * trop;
  float mid = smoothstep(26.0, 34.0, lat);
  float st = fbm(vec2(pm.x / 70.0, pm.y / 22.0) + vec2(1.7, 9.1) + vec2(-0.004, 0.003) * uTime, 5);
  float zone = fbm(pm / 110.0 + vec2(3.3, 0.6), 3);
  float texm = fbm(pm / 14.0 + vec2(6.1, 2.2), 4);
  float fr = smoothstep(0.0, 1.6, st + 0.35 * texm + 0.8 * zone) * mid * 0.8;
  float sub = mix(0.25, 1.0, smoothstep(650.0, 1400.0, rKm));   // sinking air around the typhoon
  float d = max(max(cu, cb), fr) * sub;
  float conv = max(cbCore * (0.45 + 0.35 * smoothstep(-0.5, 1.5, tex + pop)), cu * 0.35) * trop;
  return vec2(d, conv * sub);
}

vec3 ramp7(float x, float s[7], vec3 c[7]) {
  vec3 col = c[0];
  for (int i = 0; i < 6; i++) col = mix(col, c[i + 1], clamp((x - s[i]) / (s[i + 1] - s[i]), 0.0, 1.0));
  return col;
}

vec3 topoColor(float h) {
  float s[7] = float[7](0.0, 200.0, 600.0, 1200.0, 2000.0, 3000.0, 3700.0);
  vec3 c[7] = vec3[7](vec3(0.30, 0.52, 0.30), vec3(0.50, 0.67, 0.36), vec3(0.80, 0.80, 0.48),
                      vec3(0.80, 0.62, 0.37), vec3(0.62, 0.43, 0.29), vec3(0.56, 0.47, 0.44), vec3(0.95, 0.95, 0.95));
  return ramp7(h, s, c);
}

vec3 depthColor(float d) {
  float s[7] = float[7](0.0, 100.0, 200.0, 1000.0, 3000.0, 6000.0, 9000.0);
  vec3 c[7] = vec3[7](vec3(0.62, 0.84, 0.92), vec3(0.52, 0.77, 0.89), vec3(0.40, 0.66, 0.85),
                      vec3(0.22, 0.47, 0.75), vec3(0.11, 0.29, 0.60), vec3(0.05, 0.16, 0.42), vec3(0.02, 0.06, 0.24));
  return ramp7(d, s, c);
}

vec3 radarColor(float dbz) {
  float s[7] = float[7](15.0, 22.0, 30.0, 38.0, 45.0, 52.0, 60.0);
  vec3 c[7] = vec3[7](vec3(0.0, 0.75, 1.0), vec3(0.0, 0.35, 1.0), vec3(0.0, 0.78, 0.0),
                      vec3(1.0, 1.0, 0.0), vec3(1.0, 0.55, 0.0), vec3(0.95, 0.0, 0.0), vec3(0.95, 0.0, 0.95));
  return ramp7(dbz, s, c);
}

vec3 windColor(float kt) {
  float s[7] = float[7](0.0, 20.0, 34.0, 64.0, 90.0, 115.0, 140.0);
  vec3 c[7] = vec3[7](vec3(0.10, 0.16, 0.38), vec3(0.15, 0.45, 0.75), vec3(0.20, 0.70, 0.70),
                      vec3(0.35, 0.80, 0.30), vec3(0.98, 0.82, 0.20), vec3(0.95, 0.35, 0.15), vec3(0.80, 0.15, 0.75));
  return ramp7(kt, s, c);
}

vec3 sstColor(float t) {
  float s[7] = float[7](20.0, 23.0, 25.5, 27.0, 28.5, 30.0, 31.5);
  vec3 c[7] = vec3[7](vec3(0.17, 0.20, 0.70), vec3(0.15, 0.55, 0.85), vec3(0.20, 0.78, 0.75),
                      vec3(0.65, 0.85, 0.30), vec3(0.98, 0.75, 0.20), vec3(0.95, 0.35, 0.15), vec3(0.75, 0.08, 0.30));
  return ramp7(t, s, c);
}

void main() {
  float ok;
  vec2 a = uView.xy + (gl_FragCoord.xy - 0.5 * uRes) / uView.z;
  vec2 ll = lonLat(a, ok);

  vec4 L = texture(uLand, geoUv(ll));
  float land = L.g;
  float tws = mix(1.0, uTwScale, L.b);
  float hr = heightRaw(ll);
  float h = max(hr, 0.0) * tws * land;
  float depth = max(-hr, 0.0);

  // hillshade from the DEM (light from the north-west)
  float pxDeg = 35800.0 / uView.z / 111.0;
  float e = max(pxDeg * 1.2, 0.012);
  float hE = max(heightRaw(ll + vec2(e, 0.0)), 0.0) * tws;
  float hW = max(heightRaw(ll - vec2(e, 0.0)), 0.0) * tws;
  float hN = max(heightRaw(ll + vec2(0.0, e)), 0.0) * tws;
  float hS = max(heightRaw(ll - vec2(0.0, e)), 0.0) * tws;
  float kmx = 2.0 * e * 111.32 * cos(radians(ll.y));
  float kmy = 2.0 * e * 110.57;
  float ex = 7.0;
  vec3 n = normalize(vec3(-(hE - hW) * 0.001 / kmx * ex, -(hN - hS) * 0.001 / kmy * ex, 1.0));
  vec3 Ld = normalize(vec3(-0.55, 0.65, 0.75));
  float shade = clamp(dot(n, Ld) / Ld.z, 0.35, 1.35);

  // typhoon frame (km)
  vec2 q = vec2((ll.x - uTc.x) * 111.32 * cos(radians(0.5 * (ll.y + uTc.y))), (ll.y - uTc.y) * 110.57);
  float rKm = length(q);

  // --- satellite-style ground: muted navy sea, sage land, yellow lines drawn on top in 2D ---
  float vary = texture(uNoise, ll * 0.0175).g - 0.5;
  vec3 sea = vec3(0.176, 0.196, 0.431) * (1.0 + 0.10 * vary);
  vec3 lowland = vec3(0.478, 0.525, 0.349) * (1.0 + 0.08 * vary);
  vec3 upland = vec3(0.420, 0.440, 0.330);
  vec3 ground = mix(lowland, upland, smoothstep(300.0, 2500.0, h)) * mix(1.0, shade, 0.7);
  vec3 satBase = mix(sea, ground, land);

  vec3 col;
  if (uLayer == 2) {
    // terrain: elevation tints, bathymetry and 500 m contours
    vec3 lc = topoColor(h) * shade;
    float c = h / 500.0;
    float fw = fwidth(c);
    float line = (1.0 - smoothstep(0.0, fw * 1.2, abs(fract(c + 0.5) - 0.5))) * step(60.0, h) * (1.0 - smoothstep(0.25, 0.6, fw));
    lc *= 1.0 - 0.35 * line * (mod(floor(c + 0.5), 2.0) < 0.5 ? 1.0 : 0.6);
    col = mix(depthColor(depth), lc, land);
    // faint moving clouds keep the map alive; the mountains still read through
    vec3 tcT = typhoonCloud(q);
    float dT = clamp(1.0 - (1.0 - tcT.x) * (1.0 - backgroundCloud(ll, land, rKm).x), 0.0, 1.0);
    col = mix(col, vec3(0.97), (1.0 - exp(-4.6 * dT)) * 0.42);
  } else if (uLayer == 5) {
    float sst = 20.0 + 15.0 * texture(uField, geoUv(ll)).r;
    col = mix(sstColor(sst), vec3(0.22, 0.24, 0.20) * mix(1.0, shade, 0.6), land);
  } else {
    // clouds share satellite, radar, wind and pressure views
    vec3 tcC = typhoonCloud(q);
    vec2 bgC = backgroundCloud(ll, land, rKm);
    float d = 1.0 - (1.0 - tcC.x) * (1.0 - bgC.x);
    float conv = max(tcC.y, bgC.y);

    if (uLayer == 0) {
      float g = clamp(d, 0.0, 1.0);
      float lit = 1.0 + 0.05 * tcC.z;
      float alpha = 1.0 - exp(-4.6 * g);
      vec3 cloud = mix(vec3(0.66, 0.68, 0.72), vec3(0.98, 0.98, 0.98), smoothstep(0.1, 0.7, g)) * lit;
      col = mix(satBase, cloud, alpha);
    } else if (uLayer == 1) {
      float dbz = conv * 62.0;
      vec3 bg = mix(vec3(0.06, 0.07, 0.10), vec3(0.17, 0.18, 0.17) * mix(1.0, shade, 0.7), land);
      float ra = smoothstep(14.0, 18.0, dbz) * 0.92;
      col = mix(bg, radarColor(dbz), ra);
    } else if (uLayer == 3) {
      float x = pow(mix(60.0, 28.0, uTc.z) / max(rKm, 1.0), 1.4);
      float kt = max((35.0 + 120.0 * uTc.z) * sqrt(x * exp(1.0 - x)), 8.0) * mix(1.0, 0.75, land);
      col = mix(satBase * 0.55, windColor(kt), 0.6);
    } else {
      // isobars: typhoon low inside a Pacific high and the autumn continental high
      float I = uTc.z;
      float pc = 1005.0 - 100.0 * I;
      float rm = mix(60.0, 28.0, I);
      vec2 dh = (ll - vec2(148.0, 29.0)) / vec2(14.0, 7.0);
      float hi = 9.0 * exp(-dot(dh, dh));
      vec2 dc = (ll - vec2(113.0, 40.0)) / vec2(10.0, 8.0);
      float cont = 12.0 * exp(-dot(dc, dc));
      float bgP = 1006.0 + hi + cont + 0.08 * (ll.y - 20.0);
      float P = bgP + (pc - 1010.0) * (1.0 - exp(-pow(rm / max(rKm, 1.0), 1.4)));
      float c = P / 4.0;
      float fw = fwidth(c);
      float line = (1.0 - smoothstep(0.0, fw * 0.9, abs(fract(c + 0.5) - 0.5))) * (1.0 - smoothstep(0.35, 0.8, fw));
      float bold = step(abs(P - 1000.0), 2.0);
      vec3 tint = mix(vec3(0.85, 0.30, 0.35), vec3(0.25, 0.45, 0.85), smoothstep(985.0, 1018.0, P));
      col = mix(satBase * 0.6, tint, 0.28);
      col = mix(col, vec3(1.0, 0.97, 0.75), line * (0.75 + 0.25 * bold));
    }
  }

  outColor = vec4(col * ok, 1.0);
}`;

function compileShader(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
  return sh;
}

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Tileable Perlin noise, four independent channels
function makeNoise(sizePx, period, seed) {
  const rnd = mulberry32(seed);
  const out = new Uint8Array(sizePx * sizePx * 4);
  const fade = t => t * t * t * (t * (t * 6 - 15) + 10);
  for (let ch = 0; ch < 4; ch++) {
    const g = new Float32Array(period * period * 2);
    for (let i = 0; i < period * period; i++) {
      const a = rnd() * Math.PI * 2;
      g[2 * i] = Math.cos(a); g[2 * i + 1] = Math.sin(a);
    }
    const grad = (ix, iy, dx, dy) => {
      const k = (((iy % period) * period) + (ix % period)) * 2;
      return g[k] * dx + g[k + 1] * dy;
    };
    for (let y = 0; y < sizePx; y++) {
      for (let x = 0; x < sizePx; x++) {
        const fx = (x + 0.5) / sizePx * period, fy = (y + 0.5) / sizePx * period;
        const ix = Math.floor(fx), iy = Math.floor(fy), dx = fx - ix, dy = fy - iy;
        const uu = fade(dx), vv = fade(dy);
        const n0 = grad(ix, iy, dx, dy) * (1 - uu) + grad(ix + 1, iy, dx - 1, dy) * uu;
        const n1 = grad(ix, iy + 1, dx, dy - 1) * (1 - uu) + grad(ix + 1, iy + 1, dx - 1, dy - 1) * uu;
        const n = n0 * (1 - vv) + n1 * vv;
        out[(y * sizePx + x) * 4 + ch] = Math.max(0, Math.min(255, Math.round((0.5 + n * 0.68) * 255)));
      }
    }
  }
  return out;
}

function makeTexture(gl, unit, filter, wrap) {
  const t = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
  return t;
}

function initGL() {
  const gl = glCanvas.getContext('webgl2', { antialias: false, alpha: false, depth: false, premultipliedAlpha: false, powerPreference: 'high-performance' });
  if (!gl) throw new Error('This page needs WebGL 2 (Safari 15+, Chrome, Edge or Firefox).');
  gpu.gl = gl;

  const prog = gl.createProgram();
  gl.attachShader(prog, compileShader(gl, gl.VERTEX_SHADER, VERT_SRC));
  gl.attachShader(prog, compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  gl.useProgram(prog);
  gpu.prog = prog;

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  for (const name of ['uRes', 'uView', 'uDem', 'uDemTw', 'uLand', 'uNoise', 'uField', 'uDemGeo', 'uDemSize', 'uTwGeo', 'uTwSize', 'uTwBox', 'uGeo', 'uTwScale', 'uTc', 'uTime', 'uLayer']) {
    gpu.loc[name] = gl.getUniformLocation(prog, name);
  }

  gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

  gpu.tex.dem = makeTexture(gl, 0, gl.LINEAR, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, demImages.main);
  gpu.tex.tw = makeTexture(gl, 1, gl.LINEAR, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, demImages.tw);
  gpu.tex.land = makeTexture(gl, 2, gl.LINEAR, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, landCanvas);
  gpu.tex.noise = makeTexture(gl, 3, gl.LINEAR_MIPMAP_LINEAR, gl.REPEAT);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, makeNoise(512, 32, 20261024));
  gl.generateMipmap(gl.TEXTURE_2D);
  gpu.tex.field = makeTexture(gl, 4, gl.LINEAR, gl.CLAMP_TO_EDGE);

  gl.uniform1i(gpu.loc.uDem, 0);
  gl.uniform1i(gpu.loc.uDemTw, 1);
  gl.uniform1i(gpu.loc.uLand, 2);
  gl.uniform1i(gpu.loc.uNoise, 3);
  gl.uniform1i(gpu.loc.uField, 4);

  const d = demMeta.dem, t = demMeta.tw;
  gl.uniform4f(gpu.loc.uDemGeo, d.lon0, d.lat0, d.dLon, d.dLat);
  gl.uniform2f(gpu.loc.uDemSize, d.w, d.h);
  gl.uniform4f(gpu.loc.uTwGeo, t.lon0, t.lat0, t.dLon, t.dLat);
  gl.uniform2f(gpu.loc.uTwSize, t.w, t.h);
  gl.uniform4f(gpu.loc.uTwBox, twBox[0], twBox[1], twBox[2], twBox[3]);
  gl.uniform4f(gpu.loc.uGeo, GEO.minLon, GEO.maxLat, SPAN_LON, SPAN_LAT);
}

function resizeGL() {
  if (!gpu.gl) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let scale = dpr * CONFIG.renderScale;
  const maxPixels = 4.2e6;
  if (view.W * view.H * scale * scale > maxPixels) scale = Math.sqrt(maxPixels / (view.W * view.H));
  const w = Math.max(1, Math.round(view.W * scale)), h = Math.max(1, Math.round(view.H * scale));
  if (glCanvas.width !== w || glCanvas.height !== h) {
    glCanvas.width = w; glCanvas.height = h;
  }
  gpu.w = w; gpu.h = h;
}

function uploadField() {
  const gl = gpu.gl;
  if (gpu.fieldW !== GW || gpu.fieldH !== GH) {
    gpu.fieldW = GW; gpu.fieldH = GH;
    gpu.fieldBuf = new Uint8Array(GW * GH * 4);
  }
  const b = gpu.fieldBuf;
  for (let k = 0; k < size; k++) {
    b[4 * k] = Math.max(0, Math.min(255, Math.round((sstShown[k] + sstAnom[k] - 20) / 15 * 255)));
    b[4 * k + 1] = isLandMap[k] * 255;
    b[4 * k + 3] = 255;
  }
  gl.activeTexture(gl.TEXTURE4);
  gl.bindTexture(gl.TEXTURE_2D, gpu.tex.field);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, GW, GH, 0, gl.RGBA, gl.UNSIGNED_BYTE, b);
  gpu.fieldDirty = false;
}

function renderGL(timeSec) {
  const gl = gpu.gl;
  if (CONFIG.activeLayer === 'sst' && gpu.fieldDirty && frameCount % 6 === 0) uploadField();
  if (!gpu.fieldW) uploadField();
  const s = gpu.w / view.W;
  const [lon, lat] = tcLonLat();
  gl.viewport(0, 0, gpu.w, gpu.h);
  gl.uniform2f(gpu.loc.uRes, gpu.w, gpu.h);
  gl.uniform3f(gpu.loc.uView, view.cx, view.cy, view.k * s);
  gl.uniform1f(gpu.loc.uTwScale, twScale());
  gl.uniform4f(gpu.loc.uTc, lon, lat, typhoon.intensity, typhoon.rot);
  gl.uniform1f(gpu.loc.uTime, timeSec);
  gl.uniform1i(gpu.loc.uLayer, LAYER_INDEX[CONFIG.activeLayer]);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

// =========================================================================
// 2D OVERLAY (coastlines, grid, peaks, typhoon symbol, particles)
// =========================================================================

const overlay = { dpr: 1, coast: null, grid: null, gridLabels: [], nodeX: null, nodeY: null, nodeGW: 0, nodeGH: 0, peaks: [] };
let probe = null;   // { lon, lat, info }

function onClipEdge(lon, lat) {
  const e = 0.02;
  return Math.abs(lon - GEO.minLon) < e || Math.abs(lon - GEO.maxLon) < e || Math.abs(lat - GEO.minLat) < e || Math.abs(lat - GEO.maxLat) < e;
}

function rebuildOverlayCache() {
  // coastlines (skip the straight edges made by clipping to the data box)
  const coast = new Path2D();
  for (const reg of regions) {
    for (const ring of reg.rings) {
      const n = ring.length / 2;
      let prev = null;
      for (let k = 0; k <= n; k++) {
        const i = (k % n) * 2;
        const lon = ring[i], lat = ring[i + 1];
        const [sx, sy] = toScreen(lon, lat);
        const clip = onClipEdge(lon, lat);
        if (prev && !(clip && prev.clip)) coast.lineTo(sx, sy); else coast.moveTo(sx, sy);
        prev = { clip };
      }
    }
  }
  overlay.coast = coast;

  // 10° graticule, like the media images
  const grid = new Path2D();
  const labels = [];
  for (let lon = 110; lon <= 150; lon += 10) {
    let first = null;
    for (let lat = GEO.minLat; lat <= GEO.maxLat + 1e-6; lat += 0.5) {
      const [sx, sy] = toScreen(lon, lat);
      if (lat === GEO.minLat) grid.moveTo(sx, sy); else grid.lineTo(sx, sy);
      if (sy >= 0 && sy <= view.H && sx >= 0 && sx <= view.W) first = [sx, sy];
    }
    if (first) labels.push({ text: `${lon}°E`, x: first[0] + 4, y: Math.max(first[1], 0) + 13 });
  }
  for (let lat = 10; lat <= 40; lat += 10) {
    let first = null;
    for (let lon = GEO.minLon; lon <= GEO.maxLon + 1e-6; lon += 0.5) {
      const [sx, sy] = toScreen(lon, lat);
      if (lon === GEO.minLon) grid.moveTo(sx, sy); else grid.lineTo(sx, sy);
      if (!first && sx >= 0 && sx <= view.W && sy >= 0 && sy <= view.H) first = [sx, sy];
    }
    if (first) labels.push({ text: `${lat}°N`, x: Math.max(first[0], 0) + 4, y: first[1] - 4 });
  }
  overlay.grid = grid;
  overlay.gridLabels = labels;

  // particle grid nodes on screen
  overlay.nodeGW = GW; overlay.nodeGH = GH;
  overlay.nodeX = new Float32Array((GW + 1) * (GH + 1));
  overlay.nodeY = new Float32Array((GW + 1) * (GH + 1));
  for (let j = 0; j <= GH; j++) {
    for (let i = 0; i <= GW; i++) {
      const [sx, sy] = toScreen(normXToLon(i / GW), normYToLat(j / GH));
      overlay.nodeX[j * (GW + 1) + i] = sx;
      overlay.nodeY[j * (GW + 1) + i] = sy;
    }
  }

  overlay.peaks = PEAKS.map(pk => {
    const [sx, sy] = toScreen(pk.lon, pk.lat);
    return { pk, sx, sy };
  }).sort((a, b) => a.pk.rank - b.pk.rank || b.pk.alt - a.pk.alt);

  view.dirty = false;
}

function gridToScreen(gx, gy) {
  const W1 = overlay.nodeGW + 1;
  const i = Math.max(0, Math.min(overlay.nodeGW - 1, Math.floor(gx)));
  const j = Math.max(0, Math.min(overlay.nodeGH - 1, Math.floor(gy)));
  const fx = gx - i, fy = gy - j;
  const k = j * W1 + i;
  const X = overlay.nodeX, Y = overlay.nodeY;
  return [
    (X[k] * (1 - fx) + X[k + 1] * fx) * (1 - fy) + (X[k + W1] * (1 - fx) + X[k + W1 + 1] * fx) * fy,
    (Y[k] * (1 - fx) + Y[k + 1] * fx) * (1 - fy) + (Y[k + W1] * (1 - fx) + Y[k + W1 + 1] * fx) * fy
  ];
}

const LINE_STYLE = {
  satellite: { coast: 'rgba(226, 226, 72, 0.95)', grid: 'rgba(214, 214, 82, 0.55)' },
  radar: { coast: 'rgba(210, 210, 210, 0.75)', grid: 'rgba(160, 160, 160, 0.35)' },
  topo: { coast: 'rgba(25, 30, 40, 0.75)', grid: 'rgba(255, 255, 255, 0.35)' },
  stream: { coast: 'rgba(226, 226, 72, 0.85)', grid: 'rgba(214, 214, 82, 0.4)' },
  pressure: { coast: 'rgba(226, 226, 72, 0.85)', grid: 'rgba(214, 214, 82, 0.4)' },
  sst: { coast: 'rgba(240, 240, 240, 0.85)', grid: 'rgba(255, 255, 255, 0.35)' }
};

function renderOverlay() {
  if (view.dirty || overlay.nodeGW !== GW || overlay.nodeGH !== GH) rebuildOverlayCache();
  const dpr = overlay.dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, view.W, view.H);
  const layer = CONFIG.activeLayer;
  const style = LINE_STYLE[layer];

  if (layer === 'stream' || layer === 'pressure' || layer === 'sst') renderWindParticles(layer === 'stream' ? 0.55 : 0.3);

  ctx.lineWidth = 1;
  ctx.strokeStyle = style.grid;
  ctx.stroke(overlay.grid);
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.fillStyle = style.grid;
  ctx.textAlign = 'left';
  for (const l of overlay.gridLabels) ctx.fillText(l.text, l.x, l.y);

  ctx.lineWidth = 1.1;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = style.coast;
  ctx.stroke(overlay.coast);

  if (layer === 'pressure') renderPressureMarks();
  if (CONFIG.showPeaks || layer === 'topo') renderPeaks();
  renderTyphoonSymbol();
  renderProbe();
}

/**
 * Vector Wind Streamline Renderer
 */
function renderWindParticles(alpha) {
  const N = CONFIG.particleCount;
  const stride = N > 90000 ? 3 : (N > 50000 ? 2 : 1);
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  for (let i = 0; i < N; i += stride) {
    const spd = pVel[i];
    if (spd < 0.25) continue;
    const gx = Math.min(GW - 1, Math.max(0, Math.floor(px[i])));
    const gy = Math.min(GH - 1, Math.max(0, Math.floor(py[i])));
    const idx = gx + gy * GW;
    const trail = Math.min(13, spd * 1.8) * 0.2;
    const [x0, y0] = gridToScreen(px[i], py[i]);
    const [x1, y1] = gridToScreen(px[i] - u[idx] * trail * 0.12, py[i] - v[idx] * trail * 0.12);
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
  }
  ctx.strokeStyle = `rgba(230, 250, 255, ${alpha})`;
  ctx.stroke();
}

function renderPressureMarks() {
  ctx.font = 'bold 18px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const marks = [{ t: 'H', lon: 148, lat: 29, c: '#93c5fd' }, { t: 'H', lon: 113, lat: 39.5, c: '#93c5fd' }];
  for (const m of marks) {
    const [sx, sy] = toScreen(m.lon, m.lat);
    if (sx < 0 || sy < 0 || sx > view.W || sy > view.H) continue;
    ctx.fillStyle = m.c;
    ctx.fillText(m.t, sx, sy);
  }
  ctx.textBaseline = 'alphabetic';
}

function renderPeaks() {
  // keep clear of the typhoon symbol and its label
  const [ex, ey] = toScreen(...tcLonLat());
  const placed = [[ex - 16, ey - 20, ex + 130, ey + 20]];
  const zoomed = view.zoom > 2.2;
  ctx.font = '600 11px Inter, "PingFang TC", "Noto Sans TC", sans-serif';
  ctx.textAlign = 'left';
  for (const { pk, sx, sy } of overlay.peaks) {
    if (sx < -10 || sy < -10 || sx > view.W + 10 || sy > view.H + 10) continue;
    const text = `${pk.zh} ${peakAlt(pk).toLocaleString()} m${zoomed ? ' · ' + pk.en : ''}`;
    const w = ctx.measureText(text).width;
    const box = [sx - 6, sy - 12, sx + 9 + w, sy + 5];
    const hit = placed.some(b => box[0] < b[2] && box[2] > b[0] && box[1] < b[3] && box[3] > b[1]);
    if (hit) continue;
    placed.push(box);

    ctx.beginPath();
    ctx.moveTo(sx, sy - 6);
    ctx.lineTo(sx + 4.5, sy + 2);
    ctx.lineTo(sx - 4.5, sy + 2);
    ctx.closePath();
    ctx.fillStyle = pk.rank === 1 ? '#fbbf24' : '#f8fafc';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.lineWidth = 1;
    ctx.fill();
    ctx.stroke();

    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.strokeText(text, sx + 7, sy + 2);
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(text, sx + 7, sy + 2);
  }
}

function renderTyphoonSymbol() {
  const [lon, lat] = tcLonLat();
  const [ex, ey] = toScreen(lon, lat);
  ctx.save();
  ctx.lineCap = 'round';
  // tropical cyclone symbol (northern hemisphere)
  const path = new Path2D();
  path.arc(ex, ey, 9, 0, Math.PI * 2);
  path.moveTo(ex, ey - 9);
  path.quadraticCurveTo(ex + 10, ey - 10, ex + 14, ey - 18);
  path.moveTo(ex, ey + 9);
  path.quadraticCurveTo(ex - 10, ey + 10, ex - 14, ey + 18);
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.stroke(path);
  ctx.lineWidth = 1.8;
  ctx.strokeStyle = '#ff3b4a';
  ctx.stroke(path);

  ctx.font = 'bold 10px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  const label = `${tcMaxWindKt().toFixed(0)} kt · ${tcPressure().toFixed(0)} hPa`;
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.strokeText(label, ex + 20, ey + 4);
  ctx.fillStyle = '#fecdd3';
  ctx.fillText(label, ex + 20, ey + 4);
  ctx.restore();
}

function renderProbe() {
  if (!probe) return;
  const [sx, sy] = toScreen(probe.lon, probe.lat);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.bezierCurveTo(sx - 7, sy - 10, sx - 7, sy - 20, sx, sy - 20);
  ctx.bezierCurveTo(sx + 7, sy - 20, sx + 7, sy - 10, sx, sy);
  ctx.fillStyle = '#22d3ee';
  ctx.strokeStyle = '#082f49';
  ctx.lineWidth = 1.5;
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(sx, sy - 13, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = '#082f49';
  ctx.fill();

  const lines = [probe.info.name, probe.info.elev];
  ctx.font = '600 12px Inter, "PingFang TC", "Noto Sans TC", sans-serif';
  const w = Math.max(...lines.map(t => ctx.measureText(t).width)) + 16;
  let bx = sx + 10, by = sy - 50;
  if (bx + w > view.W - 56) bx = sx - 10 - w;
  if (by < 4) by = sy + 8;
  ctx.fillStyle = 'rgba(3, 7, 18, 0.85)';
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.7)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(bx, by, w, 40, 8) : ctx.rect(bx, by, w, 40);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#e0f2fe';
  ctx.textAlign = 'left';
  ctx.fillText(lines[0], bx + 8, by + 16);
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 13px "JetBrains Mono", monospace';
  ctx.fillText(lines[1], bx + 8, by + 33);
  ctx.restore();
}

// =========================================================================
// AUDIO
// =========================================================================

function initAudio() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
    const bufferSize = audioCtx.sampleRate * 2;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      output[i] = (b0 + b1 + b2) * 0.12;
    }
    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;
    windFilter = audioCtx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.setValueAtTime(320, audioCtx.currentTime);
    windFilter.Q.setValueAtTime(2.5, audioCtx.currentTime);
    windGain = audioCtx.createGain();
    windGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
    whiteNoise.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(audioCtx.destination);
    whiteNoise.start();
  } catch (err) {
    console.warn('Audio Init Error:', err);
  }
}

function updateAudioWind(speedMagnitude) {
  if (!audioCtx || !CONFIG.isSoundEnabled || !windGain) return;
  windGain.gain.setTargetAtTime(Math.min(0.35, speedMagnitude * 0.015), audioCtx.currentTime, 0.1);
  windFilter.frequency.setTargetAtTime(180 + speedMagnitude * 28, audioCtx.currentTime, 0.1);
}

// =========================================================================
// ADAPTIVE GOVERNOR & BENCHMARK
// =========================================================================

function runAdaptiveGovernor(now, currentFps) {
  if (!CONFIG.isAdaptive || bench.active) return;

  governor.fpsHistory.push(currentFps);
  if (governor.fpsHistory.length > 5) governor.fpsHistory.shift();
  const avgRecentFps = governor.fpsHistory.reduce((a, b) => a + b, 0) / governor.fpsHistory.length;
  const target = CONFIG.targetFPS;
  const stateLabel = document.getElementById('hud-governor-state');

  if (now - governor.lastEvalTime < governor.evalInterval) return;
  governor.lastEvalTime = now;

  if (governor.cooldown > 0) {
    governor.cooldown--;
    return;
  }

  if (avgRecentFps < target - 7) {
    if (CONFIG.currentTier > 1) {
      stateLabel.innerText = "Throttling Down (Lag Protection)";
      applyGranularityTier(CONFIG.currentTier - 1, true);
      governor.cooldown = 2;
      governor.stableStreak = 0;
    } else {
      stateLabel.innerText = "Minimum Granularity (Eco)";
    }
  } else if (avgRecentFps >= target - 1.5) {
    governor.stableStreak++;
    if (governor.stableStreak >= 3) {
      if (CONFIG.currentTier < 5) {
        stateLabel.innerText = "Headroom Detected (Scaling Up)";
        applyGranularityTier(CONFIG.currentTier + 1, true);
        governor.cooldown = 3;
        governor.stableStreak = 0;
      } else {
        stateLabel.innerText = "Max Granularity (Hypercane)";
      }
    } else {
      stateLabel.innerText = `Stable @ ${avgRecentFps.toFixed(0)} FPS (Testing)`;
    }
  } else {
    governor.stableStreak = 0;
    stateLabel.innerText = `Balanced @ ${avgRecentFps.toFixed(0)} FPS`;
  }
}

function startBenchmark() {
  bench.active = true;
  bench.duration = 15.0;
  bench.timeLeft = 15.0;
  bench.frames = 0;
  bench.fpsList = [];
  bench.opsList = [];
  bench.totalOps = 0;
  bench.startTime = performance.now();
  bench.lastFrameTime = performance.now();

  applyGranularityTier(4, false); // Level 4 Ultra

  document.getElementById('benchmark-toast').classList.remove('hidden');
  document.getElementById('modal-benchmark-result').classList.add('hidden');
}

function finishBenchmark() {
  bench.active = false;
  document.getElementById('benchmark-toast').classList.add('hidden');

  const avgFps = bench.fpsList.reduce((a, b) => a + b, 0) / (bench.fpsList.length || 1);
  const sortedFps = [...bench.fpsList].sort((a, b) => a - b);
  const lowIndex = Math.max(0, Math.floor(sortedFps.length * 0.01));
  const low1PctFps = sortedFps[lowIndex] || avgFps * 0.7;
  const avgOps = bench.opsList.reduce((a, b) => a + b, 0) / (bench.opsList.length || 1);
  const peakOps = Math.max(...bench.opsList, 0);
  // ops are counted per second in millions; an Apple M-series Mac scores about 30-40k
  const finalScore = Math.floor((avgOps / 1e6) * 25 + (avgFps * 100) + (low1PctFps * 125));

  let tierBadge, tierColor;
  if (finalScore > 35000) {
    tierBadge = "Tier 1: Desktop Ultra / Monster Silicon";
    tierColor = "bg-purple-500/20 text-purple-300 border-purple-500/40";
  } else if (finalScore > 23000) {
    tierBadge = "Tier 2: Flagship Mobile / M-Series Pro";
    tierColor = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
  } else if (finalScore > 13000) {
    tierBadge = "Tier 3: Mainstream Laptop / Upper Mobile";
    tierColor = "bg-sky-500/20 text-sky-300 border-sky-500/40";
  } else {
    tierBadge = "Tier 4: Entry Level / Efficiency Device";
    tierColor = "bg-amber-500/20 text-amber-300 border-amber-500/40";
  }

  document.getElementById('result-final-score').innerText = finalScore.toLocaleString();
  const badgeElem = document.getElementById('result-tier-badge');
  badgeElem.innerText = tierBadge;
  badgeElem.className = `inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase border ${tierColor}`;
  document.getElementById('result-avg-fps').innerText = avgFps.toFixed(1) + " FPS";
  document.getElementById('result-low-fps').innerText = low1PctFps.toFixed(1) + " FPS";
  document.getElementById('result-peak-ops').innerText = (peakOps / 1000000).toFixed(1) + " M/s";
  document.getElementById('result-res-summary').innerText = `${GW} × ${GH}`;
  document.getElementById('result-advect-summary').innerText = CONFIG.particleCount.toLocaleString();

  if (CONFIG.isAdaptive) applyGranularityTier(CONFIG.currentTier, false);
  document.getElementById('modal-benchmark-result').classList.remove('hidden');
}

// =========================================================================
// MAIN LOOP
// =========================================================================

const t0 = performance.now();
let lastFrame = performance.now();
let lastCardUpdate = 0;
// simulated satellite clock: one image every 10 minutes, 1 s = 3 min
const satClockStart = Math.floor(Date.now() / 600000) * 600000;

function loop(timestamp) {
  bench.lastFrameTime = timestamp;
  const now = performance.now();
  const dt = Math.min(0.05, (now - lastFrame) / 1000);
  lastFrame = now;

  updateTyphoon(dt);

  let frameOps = 0;
  for (let s = 0; s < CONFIG.substeps; s++) frameOps += fluidStep(0.08);
  frameOps += updateParticles(0.12);

  const timeSec = (now - t0) / 1000;
  renderGL(timeSec);
  renderOverlay();

  if (now - lastCardUpdate > 400) {
    lastCardUpdate = now;
    updateTyphoonCard();
    const simMs = satClockStart + Math.floor(timeSec * 180 / 600) * 600000;
    const d = new Date(simMs + 8 * 3600000);
    document.getElementById('sat-time').innerText =
      `${d.toISOString().slice(0, 10)} ${d.toISOString().slice(11, 16)} (UTC+8)`;
  }

  frameCount++;
  if (now - lastFpsUpdate >= 500) {
    fps = Math.round((frameCount * 1000) / (now - lastFpsUpdate));
    rollingFps = rollingFps * 0.7 + fps * 0.3;
    currentOpsPerSec = Math.round(frameOps * fps);
    document.getElementById('fps-counter').innerText = fps;
    document.getElementById('megaops-counter').innerText = (currentOpsPerSec / 1000000).toFixed(1);
    runAdaptiveGovernor(now, fps);
    frameCount = 0;
    lastFpsUpdate = now;
  }

  if (CONFIG.isSoundEnabled) updateAudioWind(typhoon.intensity * 30.0);

  if (bench.active) {
    bench.frames++;
    bench.fpsList.push(fps);
    bench.opsList.push(currentOpsPerSec);
    bench.totalOps += frameOps;
    const elapsed = (now - bench.startTime) / 1000.0;
    bench.timeLeft = Math.max(0, bench.duration - elapsed);
    document.getElementById('bench-timer').innerText = bench.timeLeft.toFixed(1) + 's';
    document.getElementById('bench-progress-bar').style.width = ((bench.duration - bench.timeLeft) / bench.duration) * 100 + '%';
    document.getElementById('bench-inst-fps').innerText = fps;
    document.getElementById('bench-inst-ops').innerText = (currentOpsPerSec / 1000000).toFixed(1) + ' M/s';
    if (bench.timeLeft <= 0) finishBenchmark();
  }

  requestAnimationFrame(loop);
}

/**
 * Responsive Canvas Resize Handler
 */
function handleResize() {
  const host = canvas.parentElement;
  view.W = host.clientWidth;
  view.H = host.clientHeight;
  overlay.dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(view.W * overlay.dpr);
  canvas.height = Math.round(view.H * overlay.dpr);
  fitBaseView();
  resizeGL();
}

// =========================================================================
// INTERACTION
// =========================================================================

const pointers = new Map();
let pinch = null;

function localPos(e) {
  const rect = canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function updateInspector(ll) {
  const info = describePoint(ll[0], ll[1]);
  const wind = windAtKm(kmBetween(ll[0], ll[1], ...tcLonLat()), info.ground.land);
  document.getElementById('gis-loc-name').innerText = info.name;
  document.getElementById('gis-coords').innerText = `${ll[1].toFixed(2)}°N, ${ll[0].toFixed(2)}°E`;
  document.getElementById('gis-elevation').innerText = info.elev;
  document.getElementById('gis-wind').innerText = `Wind ${Math.round(wind)} kt`;
  return info;
}

function steerTo(ll, seed) {
  const nx = Math.max(0.03, Math.min(0.97, lonToNormX(ll[0])));
  const ny = Math.max(0.03, Math.min(0.97, latToNormY(ll[1])));
  typhoon.targetX = nx;
  typhoon.targetY = ny;
  if (seed) seedTyphoonVortex(nx, ny, typhoon.intensity * 1.2);
}

function startPinch() {
  const [a, b] = [...pointers.values()];
  pinch = {
    dist: Math.max(10, Math.hypot(a.x - b.x, a.y - b.y)),
    mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
    zoom: view.zoom, cx: view.cx, cy: view.cy, k: view.k
  };
}

function movePinch() {
  const [a, b] = [...pointers.values()];
  const dist = Math.max(10, Math.hypot(a.x - b.x, a.y - b.y));
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const ax = pinch.cx + (pinch.mid.x - view.W / 2) / pinch.k;
  const ay = pinch.cy - (pinch.mid.y - view.H / 2) / pinch.k;
  const zoom = Math.max(1, Math.min(MAX_ZOOM, pinch.zoom * dist / pinch.dist));
  const k = view.baseK * zoom;
  setView(ax - (mid.x - view.W / 2) / k, ay + (mid.y - view.H / 2) / k, zoom);
}

function onPointerDown(e) {
  canvas.setPointerCapture(e.pointerId);
  const pos = localPos(e);
  pointers.set(e.pointerId, pos);
  if (pointers.size === 2) {
    typhoon.isDragging = false;
    startPinch();
    return;
  }
  if (pointers.size > 2) return;

  const ll = fromScreen(pos.x, pos.y);
  if (!ll) return;
  const info = updateInspector(ll);
  if (CONFIG.probeMode) {
    probe = { lon: ll[0], lat: ll[1], info };
    return;
  }
  typhoon.isDragging = true;
  steerTo(ll, true);

  if (CONFIG.isSoundEnabled && audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
}

function onPointerMove(e) {
  const pos = localPos(e);
  if (pointers.has(e.pointerId)) pointers.set(e.pointerId, pos);
  if (pinch && pointers.size >= 2) {
    movePinch();
    return;
  }
  const ll = fromScreen(pos.x, pos.y);
  if (!ll) return;
  if (e.pointerType === 'mouse' || pointers.size === 1) {
    const info = updateInspector(ll);
    if (CONFIG.probeMode && pointers.size === 1) probe = { lon: ll[0], lat: ll[1], info };
  }
  if (typhoon.isDragging && pointers.size === 1) steerTo(ll, false);
}

function onPointerUp(e) {
  pointers.delete(e.pointerId);
  if (pointers.size < 2) pinch = null;
  if (pointers.size === 0) typhoon.isDragging = false;
}

const LEGENDS = {
  radar: { title: 'Radar reflectivity 雷達回波 (dBZ)', stops: [[15, '#00bfff'], [22, '#0059ff'], [30, '#00c700'], [38, '#ffff00'], [45, '#ff8c00'], [52, '#f20000'], [60, '#f200f2']], ticks: [15, 30, 45, 60] },
  topo: { title: 'Elevation 海拔 (m) · sea depth 水深', stops: [[0, '#4d854d'], [200, '#80ab5c'], [600, '#cccc7a'], [1200, '#cc9e5e'], [2000, '#9e6e4a'], [3000, '#8f7870'], [3700, '#f2f2f2']], ticks: [0, 1000, 2000, 3000, '3952'] },
  stream: { title: 'Wind speed 風速 (kt)', stops: [[0, '#1a2961'], [20, '#2673bf'], [34, '#33b3b3'], [64, '#59cc4d'], [90, '#fad133'], [115, '#f25926'], [140, '#cc26bf']], ticks: [0, 34, 64, 100, 140] },
  pressure: { title: 'Sea level pressure 氣壓 · lines every 4 hPa', stops: [[905, '#d94d59'], [1018, '#4073d9']], ticks: [905, 960, 1018] },
  sst: { title: 'Sea temperature 海溫 (°C) · cool trail = cold wake 冷尾流', stops: [[20, '#2b33b3'], [23, '#268cd9'], [25.5, '#33c7bf'], [27, '#a6d94d'], [28.5, '#fabf33'], [30, '#f25926'], [31.5, '#bf144d']], ticks: [20, 23, 26, 29, 32] }
};

function updateLegend() {
  const layer = CONFIG.activeLayer;
  const legend = document.getElementById('legend');
  const caption = document.getElementById('sat-caption');
  const L = LEGENDS[layer];
  caption.classList.toggle('hidden', layer !== 'satellite');
  document.getElementById('scanline').classList.toggle('hidden', layer !== 'radar');
  if (!L) { legend.classList.add('hidden'); return; }
  legend.classList.remove('hidden');
  document.getElementById('legend-title').innerText = L.title;
  const lo = L.stops[0][0], hi = L.stops[L.stops.length - 1][0];
  document.getElementById('legend-bar').style.background =
    `linear-gradient(to right, ${L.stops.map(([v, c]) => `${c} ${((v - lo) / (hi - lo) * 100).toFixed(1)}%`).join(', ')})`;
  document.getElementById('legend-ticks').innerHTML = L.ticks.map(t => `<span>${t}</span>`).join('');
}

const LAYER_BTN_ON = 'layer-btn shrink-0 px-2.5 py-1 rounded-md text-xs font-semibold bg-cyan-600/30 border border-cyan-500 text-cyan-200 transition';
const LAYER_BTN_OFF = 'layer-btn shrink-0 px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition';

function styleLayerButtons() {
  document.querySelectorAll('.layer-btn').forEach(b => {
    b.className = b.getAttribute('data-layer') === CONFIG.activeLayer ? LAYER_BTN_ON : LAYER_BTN_OFF;
  });
}

// Buttons zoom toward the probe pin or the typhoon when it is on screen
function zoomFocus() {
  const [lon, lat] = probe ? [probe.lon, probe.lat] : tcLonLat();
  const [sx, sy] = toScreen(lon, lat);
  if (sx > 0 && sy > 0 && sx < view.W && sy < view.H) return [sx, sy];
  return [view.W / 2, view.H / 2];
}

function setupInteractions() {
  window.addEventListener('resize', handleResize);

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);
  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    const pos = localPos(e);
    zoomAt(pos.x, pos.y, Math.exp(-e.deltaY * 0.0015));
  }, { passive: false });
  // Safari trackpad pinch
  canvas.addEventListener('gesturestart', e => e.preventDefault());

  document.getElementById('btn-zoom-in').addEventListener('click', () => zoomAt(...zoomFocus(), 1.6));
  document.getElementById('btn-zoom-out').addEventListener('click', () => zoomAt(...zoomFocus(), 1 / 1.6));

  const btnProbe = document.getElementById('btn-probe');
  btnProbe.addEventListener('click', () => {
    CONFIG.probeMode = !CONFIG.probeMode;
    btnProbe.setAttribute('aria-pressed', String(CONFIG.probeMode));
    if (!CONFIG.probeMode) probe = null;
    document.getElementById('map-hint-text').innerText = CONFIG.probeMode
      ? 'Tap the map to read the height 點地圖看海拔'
      : 'Drag to steer the typhoon · pinch to zoom';
  });

  const btnPeaks = document.getElementById('btn-peaks');
  btnPeaks.addEventListener('click', () => {
    CONFIG.showPeaks = !CONFIG.showPeaks;
    btnPeaks.setAttribute('aria-pressed', String(CONFIG.showPeaks));
  });

  // Layer Selectors
  document.querySelectorAll('.layer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      CONFIG.activeLayer = btn.getAttribute('data-layer');
      styleLayerButtons();
      updateLegend();
      gpu.fieldDirty = true;
      if (CONFIG.activeLayer === 'sst') uploadField();
    });
  });
  styleLayerButtons();

  // Granularity Mode Dropdown
  document.getElementById('select-granularity-mode').addEventListener('change', e => {
    const val = e.target.value;
    const indicator = document.getElementById('hud-adaptive-indicator');
    if (val === 'adaptive') {
      CONFIG.isAdaptive = true;
      indicator.innerText = `ADAPTIVE ${CONFIG.targetFPS}FPS`;
      indicator.className = 'text-[10px] px-1.5 rounded bg-cyan-900/60 text-cyan-200 mono';
      applyGranularityTier(CONFIG.currentTier, true);
    } else {
      CONFIG.isAdaptive = false;
      const tierMap = { eco: 1, balanced: 2, high: 3, ultra: 4, hyper: 5 };
      indicator.innerText = 'MANUAL LOCK';
      indicator.className = 'text-[10px] px-1.5 rounded bg-amber-900/60 text-amber-200 mono';
      applyGranularityTier(tierMap[val] || 3, true);
    }
  });

  document.getElementById('slider-target-fps').addEventListener('input', e => {
    CONFIG.targetFPS = parseInt(e.target.value, 10);
    document.getElementById('label-target-fps').innerText = `${CONFIG.targetFPS} FPS`;
    if (CONFIG.isAdaptive) document.getElementById('hud-adaptive-indicator').innerText = `ADAPTIVE ${CONFIG.targetFPS}FPS`;
  });

  document.getElementById('btn-toggle-params').addEventListener('click', () => {
    document.getElementById('physics-panel').classList.toggle('hidden');
    requestAnimationFrame(handleResize);
  });

  document.getElementById('slider-cmr').addEventListener('input', e => {
    CONFIG.cmrHeight = parseFloat(e.target.value);
    document.getElementById('label-cmr-slider').innerText = `${CONFIG.cmrHeight.toLocaleString()} m`;
    document.getElementById('hud-cmr-height').innerText = `${CONFIG.cmrHeight.toLocaleString()} m`;
    initBasinGeography();
    if (probe) probe.info = describePoint(probe.lon, probe.lat);
  });

  document.getElementById('slider-sst').addEventListener('input', e => {
    CONFIG.sstBase = parseFloat(e.target.value);
    document.getElementById('label-sst-slider').innerText = `${CONFIG.sstBase.toFixed(1)} °C`;
    initBasinGeography();
  });

  document.getElementById('slider-coriolis').addEventListener('input', e => {
    CONFIG.coriolisFactor = parseFloat(e.target.value);
    document.getElementById('label-coriolis-slider').innerText = `${CONFIG.coriolisFactor.toFixed(1)}x`;
  });

  document.getElementById('btn-benchmark-start').addEventListener('click', startBenchmark);
  document.getElementById('btn-rerun-bench').addEventListener('click', startBenchmark);
  document.getElementById('btn-close-modal').addEventListener('click', () => {
    document.getElementById('modal-benchmark-result').classList.add('hidden');
  });

  document.getElementById('card-rough-score').addEventListener('click', () => {
    showScalingToast(`Detected Hardware: ${hardwareRating.tierName} (${hardwareRating.classType})`);
  });

  document.getElementById('btn-share-result').addEventListener('click', () => {
    const score = document.getElementById('result-final-score').innerText;
    const avgFps = document.getElementById('result-avg-fps').innerText;
    const lowFps = document.getElementById('result-low-fps').innerText;
    const peakOps = document.getElementById('result-peak-ops').innerText;
    const tier = document.getElementById('result-tier-badge').innerText;
    const shareText = `🌀 Western Pacific Typhoon Atmospheric Compute Benchmark\n` +
      `• Score: ${score} pts (${tier})\n` +
      `• Performance: ${avgFps} (1% Low: ${lowFps})\n` +
      `• Peak Compute: ${peakOps}\n` +
      `• Particles: ${CONFIG.particleCount.toLocaleString()} | Navier-Stokes Grid: ${GW}x${GH}`;
    const done = () => {
      const toast = document.getElementById('toast-copy');
      toast.classList.remove('hidden');
      setTimeout(() => toast.classList.add('hidden'), 2500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareText).then(done, () => {});
    }
  });

  document.getElementById('btn-reset-sim').addEventListener('click', () => {
    typhoon.x = typhoon.targetX = lonToNormX(TC_START.lon);
    typhoon.y = typhoon.targetY = latToNormY(TC_START.lat);
    typhoon.intensity = 0.85;
    probe = null;
    sstAnom = null;
    u = v = density = null;
    applyGranularityTier(CONFIG.currentTier, false);
    setView(view.baseCx, view.baseCy, 1);
  });

  const btnSound = document.getElementById('btn-sound-toggle');
  btnSound.addEventListener('click', () => {
    if (!audioCtx) initAudio();
    CONFIG.isSoundEnabled = !CONFIG.isSoundEnabled;
    if (CONFIG.isSoundEnabled && audioCtx.state === 'suspended') audioCtx.resume();
    if (!CONFIG.isSoundEnabled && windGain) windGain.gain.setTargetAtTime(0.0001, audioCtx.currentTime, 0.05);
    document.getElementById('icon-sound-off').classList.toggle('hidden', CONFIG.isSoundEnabled);
    document.getElementById('icon-sound-on').classList.toggle('hidden', !CONFIG.isSoundEnabled);
  });
}

// =========================================================================
// STARTUP
// =========================================================================

async function start() {
  try {
    await loadMapData();
    handleResize();
    initGL();
    resizeGL();
    initParticles();
    setupInteractions();
    performStartupHardwareProbe();
    if (!u) applyGranularityTier(CONFIG.currentTier, false);
    updateLegend();
    updateInspector([121.0, 23.5]);
    document.getElementById('loading').classList.add('hidden');
    requestAnimationFrame(loop);
  } catch (err) {
    console.error(err);
    document.getElementById('loading').innerText = 'Cannot start: ' + err.message;
  }
}

start();
