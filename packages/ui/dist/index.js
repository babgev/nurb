import * as Dn from "react";
import { useState as O, useRef as C, useEffect as F, useCallback as Z, createContext as gt, useLayoutEffect as yt, useId as Te, useContext as ue, useInsertionEffect as Ui, useMemo as he, Children as Cc, isValidElement as Ec, Fragment as zi, createElement as Dc, forwardRef as Wi, Component as Vc } from "react";
import { jsx as c, jsxs as y, Fragment as G } from "react/jsx-runtime";
import L from "clsx";
import Rc from "react-markdown";
import { DirectionalLight as Lc, HemisphereLight as Fc, Mesh as et, PlaneGeometry as Oc, MeshStandardMaterial as _i, ReplaceStencilOp as $n, NotEqualStencilFunc as Ic, DoubleSide as Gi, Group as yn, LineSegments as Ki, EdgesGeometry as na, LineBasicMaterial as ot, Vector3 as de, Matrix4 as an, BufferGeometry as Hi, BufferAttribute as qi, MeshBasicMaterial as Vt, SphereGeometry as Bc, Box3 as Rt, Quaternion as Ys, IncrementWrapStencilOp as jn, BackSide as $c, AlwaysStencilFunc as jc, DecrementWrapStencilOp as Un, FrontSide as Uc, Frustum as zc, BoxGeometry as Wc, Scene as _c, Color as Gc, PerspectiveCamera as Kc, Plane as Hc, WebGLRenderer as qc, Vector2 as Yc, Raycaster as Xc } from "three";
import { OrbitControls as Zc } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader as Xs } from "three/addons/loaders/GLTFLoader.js";
import { createPortal as ia } from "react-dom";
const sa = {
  /** A soft two-note ascending bell, like an iOS/macOS confirmation tink. */
  chime: {
    masterGain: 0.5,
    layers: [
      { kind: "tone", waveform: "sine", frequency: 1046.5, attack: 6e-3, decay: 0.22, peak: 0.09 },
      { kind: "tone", waveform: "sine", frequency: 1568, offset: 0.09, attack: 6e-3, decay: 0.26, peak: 0.08 }
    ],
    shimmer: { delay: 0.12, feedback: 0.25, wet: 0.18, lowpass: 4e3 }
  },
  /** A quick ascending twinkle of four notes — bright and playful. */
  sparkle: {
    masterGain: 0.5,
    layers: [
      { kind: "tone", waveform: "sine", frequency: 1760, offset: 0, attack: 3e-3, decay: 0.09, peak: 0.045 },
      { kind: "tone", waveform: "sine", frequency: 2217, offset: 0.045, attack: 3e-3, decay: 0.09, peak: 0.04 },
      { kind: "tone", waveform: "sine", frequency: 2637, offset: 0.09, attack: 3e-3, decay: 0.1, peak: 0.038 },
      { kind: "tone", waveform: "sine", frequency: 3520, offset: 0.135, attack: 3e-3, decay: 0.12, peak: 0.032 }
    ],
    shimmer: { delay: 0.07, feedback: 0.35, wet: 0.22, lowpass: 6e3 }
  },
  /** A single note gliding smoothly downward, like a drop of water. */
  droplet: {
    masterGain: 0.55,
    layers: [
      { kind: "tone", waveform: "sine", frequency: 1200, glideTo: 550, glideTime: 0.14, attack: 4e-3, decay: 0.2, peak: 0.075 }
    ],
    shimmer: { delay: 0.09, feedback: 0.2, wet: 0.15, lowpass: 3e3 }
  },
  /** A warm, slow-swelling pad from two gently detuned sines. */
  bloom: {
    masterGain: 0.5,
    layers: [
      { kind: "tone", waveform: "sine", frequency: 528, attack: 0.06, decay: 0.32, peak: 0.06 },
      { kind: "tone", waveform: "sine", frequency: 528, detune: 12, attack: 0.06, decay: 0.34, peak: 0.05 }
    ],
    shimmer: { delay: 0.15, feedback: 0.2, wet: 0.12, lowpass: 2500 }
  },
  /** A soft hush with a falling tone — for tooltips and low-priority previews. */
  whisper: {
    masterGain: 0.48,
    layers: [
      { kind: "noise", filterType: "lowpass", filterFrequency: 1600, filterQ: 0.7, attack: 0.025, decay: 0.13, peak: 0.04 },
      { kind: "tone", waveform: "sine", frequency: 880, glideTo: 660, glideTime: 0.14, offset: 0.01, attack: 0.012, decay: 0.14, peak: 0.025 }
    ]
  },
  /** A focused, bandpass-filtered tick with a bright sine ping on top — crisp and instant. */
  tick: {
    masterGain: 0.4,
    layers: [
      { kind: "noise", filterType: "bandpass", filterFrequency: 5400, filterQ: 1.8, attack: 1e-3, decay: 0.018, peak: 0.14 },
      { kind: "tone", waveform: "sine", frequency: 2600, attack: 1e-3, decay: 0.012, peak: 0.018 }
    ]
  },
  /** A dull, muted knock — the "down" half of a press/release pair, like a key bottoming out. */
  press: {
    masterGain: 0.4,
    layers: [
      { kind: "noise", filterType: "bandpass", filterFrequency: 1700, filterQ: 1.4, attack: 1e-3, decay: 0.02, peak: 0.13 }
    ]
  },
  /** A brighter, springier tick — the "up" half of a press/release pair, like a key returning. */
  release: {
    masterGain: 0.4,
    layers: [
      { kind: "noise", filterType: "bandpass", filterFrequency: 4600, filterQ: 1.8, attack: 1e-3, decay: 0.016, peak: 0.12 },
      { kind: "tone", waveform: "sine", frequency: 3200, offset: 6e-3, attack: 1e-3, decay: 0.05, peak: 0.02 }
    ]
  },
  /** A two-part click-clack, like a mechanical switch flipping between states. */
  toggle: {
    masterGain: 0.4,
    layers: [
      { kind: "noise", filterType: "bandpass", filterFrequency: 2200, filterQ: 1.6, attack: 1e-3, decay: 0.016, peak: 0.12 },
      { kind: "noise", filterType: "bandpass", filterFrequency: 3800, filterQ: 1.6, offset: 0.024, attack: 1e-3, decay: 0.02, peak: 0.1 }
    ]
  },
  /** A short, warm three-note ascending confirmation — "done", not a fanfare. */
  success: {
    masterGain: 0.5,
    layers: [
      { kind: "tone", waveform: "sine", frequency: 880, attack: 4e-3, decay: 0.09, peak: 0.06 },
      { kind: "tone", waveform: "sine", frequency: 1108.73, offset: 0.06, attack: 4e-3, decay: 0.1, peak: 0.06 },
      { kind: "tone", waveform: "sine", frequency: 1318.51, offset: 0.12, attack: 4e-3, decay: 0.18, peak: 0.07 }
    ],
    shimmer: { delay: 0.1, feedback: 0.22, wet: 0.16, lowpass: 4500 }
  },
  /** A muted knock followed by two descending tones — a calm, recoverable refusal. */
  error: {
    masterGain: 0.42,
    layers: [
      { kind: "noise", filterType: "bandpass", filterFrequency: 850, filterQ: 1.1, attack: 1e-3, decay: 0.035, peak: 0.13 },
      { kind: "tone", waveform: "triangle", frequency: 440, offset: 0.025, attack: 4e-3, decay: 0.09, peak: 0.045 },
      { kind: "tone", waveform: "triangle", frequency: 349.23, offset: 0.1, attack: 4e-3, decay: 0.14, peak: 0.04 }
    ]
  },
  /** A papery filtered flick with a tiny glass tick — for pages, galleries, and carousels. */
  page: {
    masterGain: 0.38,
    layers: [
      { kind: "noise", filterType: "lowpass", filterFrequency: 1800, filterQ: 0.7, attack: 6e-3, decay: 0.08, peak: 0.11 },
      { kind: "noise", filterType: "bandpass", filterFrequency: 4200, filterQ: 1.2, offset: 0.04, attack: 4e-3, decay: 0.065, peak: 0.08 },
      { kind: "tone", waveform: "sine", frequency: 2400, offset: 0.075, attack: 2e-3, decay: 0.045, peak: 0.02 }
    ]
  },
  /** A brief unresolved lift — signals that user-initiated work has started. */
  loading: {
    masterGain: 0.42,
    layers: [
      { kind: "noise", filterType: "lowpass", filterFrequency: 1400, filterQ: 0.6, attack: 0.035, decay: 0.14, peak: 0.035 },
      { kind: "tone", waveform: "sine", frequency: 420, glideTo: 630, glideTime: 0.18, attack: 0.025, decay: 0.18, peak: 0.05 }
    ],
    shimmer: { delay: 0.11, feedback: 0.18, wet: 0.12, lowpass: 2800 }
  },
  /** A quick lock-on sweep resolving to a clear tone — the system is ready. */
  ready: {
    masterGain: 0.48,
    layers: [
      { kind: "noise", filterType: "bandpass", filterFrequency: 3600, filterQ: 1.8, attack: 1e-3, decay: 0.02, peak: 0.11 },
      { kind: "tone", waveform: "triangle", frequency: 330, glideTo: 660, glideTime: 0.12, offset: 0.012, attack: 4e-3, decay: 0.16, peak: 0.055 },
      { kind: "tone", waveform: "sine", frequency: 990, offset: 0.13, attack: 4e-3, decay: 0.22, peak: 0.06 }
    ],
    shimmer: { delay: 0.1, feedback: 0.16, wet: 0.1, lowpass: 4200 }
  },
  /** A compact synthetic chirp — crisp feedback for primary buttons and controls. */
  pulse: {
    masterGain: 0.42,
    layers: [
      { kind: "noise", filterType: "bandpass", filterFrequency: 2600, filterQ: 2.4, attack: 1e-3, decay: 0.022, peak: 0.08 },
      { kind: "tone", waveform: "triangle", frequency: 620, glideTo: 1240, glideTime: 0.07, attack: 2e-3, decay: 0.085, peak: 0.055 }
    ]
  },
  /** A fast three-step locator signal — playful feedback for menus and secondary buttons. */
  scan: {
    masterGain: 0.4,
    layers: [
      { kind: "tone", waveform: "sine", frequency: 740, attack: 2e-3, decay: 0.055, peak: 0.05 },
      { kind: "tone", waveform: "sine", frequency: 1110, offset: 0.045, attack: 2e-3, decay: 0.055, peak: 0.045 },
      { kind: "tone", waveform: "sine", frequency: 1665, offset: 0.09, attack: 2e-3, decay: 0.07, peak: 0.04 }
    ],
    shimmer: { delay: 0.065, feedback: 0.16, wet: 0.1, lowpass: 4200 }
  },
  /** A rising harmonic portal with a soft tail — for client-side page arrivals. */
  arrival: {
    masterGain: 0.44,
    layers: [
      { kind: "noise", filterType: "lowpass", filterFrequency: 900, filterQ: 0.8, attack: 0.05, decay: 0.24, peak: 0.035 },
      { kind: "tone", waveform: "sine", frequency: 220, glideTo: 440, glideTime: 0.32, attack: 0.04, decay: 0.34, peak: 0.055 },
      { kind: "tone", waveform: "sine", frequency: 659.25, offset: 0.12, attack: 0.045, decay: 0.32, peak: 0.04 },
      { kind: "tone", waveform: "sine", frequency: 987.77, offset: 0.19, attack: 0.045, decay: 0.34, peak: 0.032 }
    ],
    shimmer: { delay: 0.16, feedback: 0.28, wet: 0.18, lowpass: 3200 }
  }
};
function Qc(e) {
  return typeof e == "string" && Object.prototype.hasOwnProperty.call(sa, e);
}
const Yi = 0.05, Jc = 0.05, eu = 1e-3, tu = 4;
function nu(e, t, n, i) {
  const s = e.createOscillator();
  if (s.type = n.waveform, s.frequency.setValueAtTime(n.frequency, i), n.detune && (s.detune.value = n.detune), n.glideTo !== void 0) {
    const o = n.glideTime ?? n.attack + n.decay;
    s.frequency.exponentialRampToValueAtTime(n.glideTo, i + o);
  }
  const r = e.createGain();
  r.gain.setValueAtTime(1e-4, i), r.gain.exponentialRampToValueAtTime(n.peak, i + n.attack), r.gain.exponentialRampToValueAtTime(1e-4, i + n.attack + n.decay), s.connect(r).connect(t), s.start(i), s.stop(i + n.attack + n.decay + Yi);
}
function iu(e, t, n, i) {
  const s = n.attack + n.decay + Yi, r = Math.max(1, Math.floor(s * e.sampleRate)), o = e.createBuffer(1, r, e.sampleRate), a = o.getChannelData(0);
  for (let h = 0; h < r; h++)
    a[h] = 2 * Math.random() - 1;
  const l = e.createBufferSource();
  l.buffer = o;
  const u = e.createBiquadFilter();
  u.type = n.filterType, u.frequency.value = n.filterFrequency, n.filterQ !== void 0 && (u.Q.value = n.filterQ);
  const d = e.createGain();
  d.gain.setValueAtTime(1e-4, i), d.gain.exponentialRampToValueAtTime(n.peak, i + n.attack), d.gain.exponentialRampToValueAtTime(1e-4, i + n.attack + n.decay), l.connect(u).connect(d).connect(t), l.start(i), l.stop(i + s);
}
function su(e, t, n, i) {
  const s = e.createDelay(1);
  s.delayTime.value = i.delay;
  const r = e.createBiquadFilter();
  r.type = "lowpass", r.frequency.value = i.lowpass;
  const o = e.createGain();
  o.gain.value = i.feedback;
  const a = e.createGain();
  return a.gain.value = i.wet, t.connect(s), s.connect(r), r.connect(o), o.connect(s), r.connect(a), a.connect(n), [s, r, o, a];
}
function ru(e) {
  return Math.max(...e.layers.map((t) => (t.offset ?? 0) + t.attack + t.decay + Yi));
}
function ou(e) {
  return !e || e.feedback <= 0 ? 0 : e.feedback >= 1 ? e.delay : e.delay * (1 + Math.ceil(Math.log(eu) / Math.log(e.feedback)));
}
let zn = null;
function au(e) {
  if (zn)
    return zn;
  const t = e.createGain();
  t.gain.value = tu;
  const n = e.createDynamicsCompressor();
  return n.threshold.value = -8, n.knee.value = 6, n.ratio.value = 12, n.attack.value = 2e-3, n.release.value = 0.08, t.connect(n).connect(e.destination), zn = t, t;
}
function Zs(e, t, n) {
  const i = e.currentTime, s = au(e), r = e.createGain();
  r.gain.value = t.masterGain * n, r.connect(s);
  const o = t.shimmer ? su(e, r, s, t.shimmer) : [];
  for (const l of t.layers) {
    const u = i + (l.offset ?? 0);
    l.kind === "tone" ? nu(e, r, l, u) : iu(e, r, l, u);
  }
  const a = (ru(t) + ou(t.shimmer) + Jc) * 1e3;
  setTimeout(() => {
    r.disconnect();
    for (const l of o)
      l.disconnect();
  }, a);
}
let Xt = null, ui = !0, di = 1;
function ra(e, t) {
  return typeof e == "number" && Number.isFinite(e) ? Math.min(1, Math.max(0, e)) : t;
}
function lu(e) {
  typeof e == "boolean" && (ui = e);
}
function cu(e) {
  di = ra(e, di);
}
function uu() {
  if (Xt)
    return Xt;
  if (typeof window > "u")
    return null;
  const e = window.AudioContext ?? window.webkitAudioContext;
  if (!e)
    return null;
  try {
    Xt = new e();
  } catch {
    return null;
  }
  return Xt;
}
function du(e = "chime", t) {
  if (!ui || !Qc(e) || typeof navigator < "u" && navigator.userActivation?.hasBeenActive === !1)
    return;
  const n = di * ra(t?.volume, 1);
  if (n === 0)
    return;
  const i = uu();
  if (!i)
    return;
  const s = sa[e];
  if (i.state === "running")
    Zs(i, s, n);
  else
    try {
      i.resume().then(() => {
        ui && i.state === "running" && Zs(i, s, n);
      }, () => {
      });
    } catch {
    }
}
const dt = "nurb-sound-enabled", Xi = "nurb-sound-volume", Qs = "nurb-completion-sound", Zi = 0.6;
function He(e) {
  try {
    return localStorage.getItem(e);
  } catch {
    return null;
  }
}
function xn(e, t) {
  try {
    t === null ? localStorage.removeItem(e) : localStorage.setItem(e, t);
  } catch {
  }
}
function Qi(e) {
  return Number.isFinite(e) ? Math.min(1, Math.max(0, e)) : Zi;
}
function Ty() {
  const e = He(Qs);
  e !== null && (e === "off" && He(dt) === null && xn(dt, "off"), xn(Qs, null));
  const t = He(dt) !== "off", n = He(Xi), i = n === null ? Zi : Qi(Number(n));
  return Ji(t, i), { enabled: t, volume: i };
}
function Sy(e) {
  xn(dt, e ? null : "off"), Ji(e, fu());
}
function Ny(e) {
  const t = Qi(e);
  xn(Xi, String(t)), Ji(He(dt) !== "off", t);
}
function fu() {
  const e = He(Xi);
  return e === null ? Zi : Qi(Number(e));
}
function Ji(e, t) {
  try {
    lu(e), cu(t);
  } catch {
  }
}
function ze(e, t) {
  if (!(typeof window > "u") && He(dt) !== "off")
    try {
      du(e, t);
    } catch {
    }
}
const W = {
  tick: 0.09,
  settle: 0.24,
  arrive: 0.42,
  coast: 1.4
}, Q = {
  out: [0.23, 1, 0.32, 1],
  inOut: [0.65, 0, 0.35, 1]
};
function Ay({ timeout: e = 1500, onCopy: t, onError: n } = {}) {
  const [i, s] = O("idle"), r = C(null);
  F(() => () => {
    r.current && clearTimeout(r.current);
  }, []);
  const o = Z(
    (l) => {
      s(l), r.current && clearTimeout(r.current), r.current = setTimeout(() => s("idle"), e);
    },
    [e]
  ), a = Z(
    async (l) => {
      try {
        if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(l);
        else if (!hu(l)) throw new Error("clipboard unavailable");
        ze("success"), t?.(l), o("copied");
      } catch (u) {
        ze("error"), n?.(u), o("error");
      }
    },
    [t, n, o]
  );
  return { status: i, copy: a };
}
function hu(e) {
  const t = document.createElement("textarea");
  t.value = e, t.setAttribute("readonly", ""), t.style.position = "fixed", t.style.opacity = "0", document.body.appendChild(t);
  try {
    return t.select(), document.execCommand("copy");
  } finally {
    t.remove();
  }
}
const pu = {
  "chevron-left": /* @__PURE__ */ c("polyline", { points: "7.75 1.75 3.5 6 7.75 10.25" }),
  "chevron-down": /* @__PURE__ */ c("polyline", { points: "1.75 4.25 6 8.5 10.25 4.25" }),
  "chevron-up": /* @__PURE__ */ c("polyline", { points: "10.25 7.75 6 3.5 1.75 7.75" }),
  check: /* @__PURE__ */ c("path", { d: "m1.76,7.004l2.25,3L10.24,1.746" }),
  warning: /* @__PURE__ */ y(G, { children: [
    /* @__PURE__ */ c("circle", { cx: "6", cy: "10.125", r: ".875", fill: "currentColor", stroke: "none" }),
    /* @__PURE__ */ c("line", { x1: "6", y1: "4.75", x2: "6", y2: "7.75" }),
    /* @__PURE__ */ c("path", { d: "m8.625,10.25h1.164c1.123,0,1.826-1.216,1.265-2.189L7.265,1.484c-.562-.975-1.969-.975-2.53,0L.946,8.061c-.561.973.142,2.189,1.265,2.189h1.164" })
  ] }),
  lock: /* @__PURE__ */ y(G, { children: [
    /* @__PURE__ */ c("line", { x1: "6", y1: "7.5", x2: "6", y2: "8.5" }),
    /* @__PURE__ */ c("path", { d: "m3.75,4.75v-1.75c0-1.243,1.007-2.25,2.25-2.25h0c1.243,0,2.25,1.007,2.25,2.25v1.75" }),
    /* @__PURE__ */ c("rect", { x: "1.25", y: "4.75", width: "9.5", height: "6.5", rx: "1.5", ry: "1.5" })
  ] }),
  plus: /* @__PURE__ */ y(G, { children: [
    /* @__PURE__ */ c("line", { x1: "10.75", y1: "6", x2: "1.25", y2: "6" }),
    /* @__PURE__ */ c("line", { x1: "6", y1: "10.75", x2: "6", y2: "1.25" })
  ] }),
  minus: /* @__PURE__ */ c("line", { x1: "10.75", y1: "6", x2: "1.25", y2: "6" }),
  camera: /* @__PURE__ */ y(G, { children: [
    /* @__PURE__ */ c("circle", { cx: "3.25", cy: "5.75", r: ".75", fill: "currentColor", stroke: "none" }),
    /* @__PURE__ */ c("rect", { x: ".75", y: "3.25", width: "10.5", height: "8", rx: "2", ry: "2" }),
    /* @__PURE__ */ c("line", { x1: "2.75", y1: ".75", x2: "4.75", y2: ".75" }),
    /* @__PURE__ */ c("circle", { cx: "7.25", cy: "7.25", r: "1", fill: "currentColor" })
  ] }),
  search: /* @__PURE__ */ y(G, { children: [
    /* @__PURE__ */ c("line", { x1: "7.652", y1: "7.652", x2: "10.75", y2: "10.75" }),
    /* @__PURE__ */ c("circle", { cx: "5", cy: "5", r: "3.75" })
  ] }),
  xmark: /* @__PURE__ */ y(G, { children: [
    /* @__PURE__ */ c("line", { x1: "2.25", y1: "9.75", x2: "9.75", y2: "2.25" }),
    /* @__PURE__ */ c("line", { x1: "9.75", y1: "9.75", x2: "2.25", y2: "2.25" })
  ] }),
  image: /* @__PURE__ */ y(G, { children: [
    /* @__PURE__ */ c("path", { d: "m2.32,10.516l4.723-4.723c.391-.391,1.024-.391,1.414,0l2.293,2.293" }),
    /* @__PURE__ */ c("circle", { cx: "4", cy: "4", r: "1", fill: "currentColor", stroke: "none" }),
    /* @__PURE__ */ c("rect", { x: "1.25", y: "1.25", width: "9.5", height: "9.5", rx: "2", ry: "2" })
  ] }),
  download: /* @__PURE__ */ y(G, { children: [
    /* @__PURE__ */ c("line", { x1: "6", y1: "7.75", x2: "6", y2: ".75" }),
    /* @__PURE__ */ c("polyline", { points: "3.75 5.75 6 8 8.25 5.75" }),
    /* @__PURE__ */ c("path", { d: "m8.69,2.75c1.028,0,1.888.779,1.99,1.801l.35,3.5c.118,1.177-.807,2.199-1.99,2.199H2.96c-1.183,0-2.108-1.022-1.99-2.199l.35-3.5c.102-1.022.963-1.801,1.99-1.801" })
  ] }),
  expand: /* @__PURE__ */ y(G, { children: [
    /* @__PURE__ */ c("path", { d: "m1.25,4.25v-1c0-1.105.895-2,2-2h1" }),
    /* @__PURE__ */ c("path", { d: "m7.75,1.25h1c1.105,0,2,.895,2,2v1" }),
    /* @__PURE__ */ c("path", { d: "m10.75,7.75v1c0,1.105-.895,2-2,2h-1" }),
    /* @__PURE__ */ c("path", { d: "m4.25,10.75h-1c-1.105,0-2-.895-2-2v-1" })
  ] }),
  eye: /* @__PURE__ */ y(G, { children: [
    /* @__PURE__ */ c("path", { d: "M5.99997 10.25C8.64947 10.25 10.2021 8.38538 10.9485 7.12628C11.3599 6.43238 11.3599 5.56762 10.9485 4.87372C10.2021 3.61462 8.64937 1.75 5.99997 1.75C3.42267 1.75 1.87667 3.53288 1.10727 4.78918C0.649466 5.53658 0.649466 6.46338 1.10727 7.21088C1.87667 8.46718 3.42267 10.25 5.99997 10.25Z" }),
    /* @__PURE__ */ c("circle", { cx: "6", cy: "6", r: "1.25", fill: "currentColor" })
  ] }),
  "arrow-up": /* @__PURE__ */ y(G, { children: [
    /* @__PURE__ */ c("line", { x1: "6", y1: "11", x2: "6", y2: "1.25" }),
    /* @__PURE__ */ c("polyline", { points: "9.25 4.25 6 1 2.75 4.25" })
  ] }),
  link: /* @__PURE__ */ y(G, { children: [
    /* @__PURE__ */ c("path", { d: "M7 7C7.97631 6.02369 7.97631 4.44078 7 3.46447L5.55292 2.01788C4.57661 1.04157 2.9937 1.04157 2.01739 2.01788C1.05869 2.97658 1.0414 4.5202 1.96552 5.5" }),
    /* @__PURE__ */ c("path", { d: "M5 5C4.02369 5.97631 4.02369 7.55922 5 8.53553L6.44197 9.97758C7.41828 10.9539 9.00119 10.9539 9.9775 9.97758C10.9347 9.02036 10.9534 7.48002 10.0336 6.5" })
  ] }),
  stop: /* @__PURE__ */ c(
    "path",
    {
      d: "M3.75 11C2.23122 11 1 9.76878 1 8.25V3.75C1 2.23122 2.23122 1 3.75 1L8.25 1C9.76878 1 11 2.23122 11 3.75V8.25C11 9.76878 9.76878 11 8.25 11H3.75Z",
      fill: "currentColor",
      stroke: "none"
    }
  ),
  chat: /* @__PURE__ */ c("path", { d: "m8.75,8.75h-4.75l-2.75,2.5V3.25c0-1.105.895-2,2-2h5.5c1.105,0,2,.895,2,2v3.5c0,1.105-.895,2-2,2Z" }),
  loader: /* @__PURE__ */ y(G, { children: [
    /* @__PURE__ */ c("path", { d: "M6 2.25V0.75" }),
    /* @__PURE__ */ c("path", { opacity: "0.5", d: "M6 11.25V9.75" }),
    /* @__PURE__ */ c("path", { opacity: "0.75", d: "M9.75488 5.995L11.2549 5.995" }),
    /* @__PURE__ */ c("path", { opacity: "0.25", d: "M0.754883 5.995L2.25488 5.995" }),
    /* @__PURE__ */ c("path", { opacity: "0.88", d: "M8.65321 3.3449L9.71387 2.28424" }),
    /* @__PURE__ */ c("path", { opacity: "0.38", d: "M2.28895 9.70885L3.34961 8.64819" }),
    /* @__PURE__ */ c("path", { opacity: "0.63", d: "M8.66004 8.64811L9.7207 9.70877" }),
    /* @__PURE__ */ c("path", { opacity: "0.13", d: "M2.29627 2.28416L3.35693 3.34482" })
  ] }),
  dots: /* @__PURE__ */ y(G, { children: [
    /* @__PURE__ */ c("circle", { cx: "6", cy: "6", r: "1", fill: "currentColor", stroke: "none" }),
    /* @__PURE__ */ c("circle", { cx: "2", cy: "6", r: "1", fill: "currentColor", stroke: "none" }),
    /* @__PURE__ */ c("circle", { cx: "10", cy: "6", r: "1", fill: "currentColor", stroke: "none" })
  ] }),
  trash: /* @__PURE__ */ y(G, { children: [
    /* @__PURE__ */ c("line", { x1: "1", y1: "2.25", x2: "11", y2: "2.25" }),
    /* @__PURE__ */ c("path", { d: "m4.75,2.25v-1c0-.276.224-.5.5-.5h1.5c.276,0,.5.224.5.5v1" }),
    /* @__PURE__ */ c("path", { d: "m9.5,4.75l-.195,5.058c-.031.805-.693,1.442-1.499,1.442h-3.613c-.806,0-1.468-.637-1.499-1.442l-.195-5.058" })
  ] }),
  ruler: /* @__PURE__ */ y(G, { children: [
    /* @__PURE__ */ c("line", { x1: "6.623", y1: "6.623", x2: "7.754", y2: "7.754" }),
    /* @__PURE__ */ c("line", { x1: "7.873", y1: "4.373", x2: "9.504", y2: "6.004" }),
    /* @__PURE__ */ c("line", { x1: "4.373", y1: "7.873", x2: "6.004", y2: "9.504" }),
    /* @__PURE__ */ c("rect", { x: ".42", y: "3.52", width: "11.161", height: "4.96", rx: "1.086", ry: "1.086", transform: "translate(-2.485 6) rotate(-45)" })
  ] }),
  gear: /* @__PURE__ */ y(G, { children: [
    /* @__PURE__ */ c("circle", { cx: "6", cy: "6", r: ".75", fill: "currentColor" }),
    /* @__PURE__ */ c("circle", { cx: "6", cy: "6", r: "4" }),
    /* @__PURE__ */ c("line", { x1: "6", y1: ".75", x2: "6", y2: "2" }),
    /* @__PURE__ */ c("line", { x1: "9.086", y1: "1.753", x2: "8.351", y2: "2.764" }),
    /* @__PURE__ */ c("line", { x1: "10.993", y1: "4.378", x2: "9.804", y2: "4.764" }),
    /* @__PURE__ */ c("line", { x1: "10.993", y1: "7.622", x2: "9.804", y2: "7.236" }),
    /* @__PURE__ */ c("line", { x1: "9.086", y1: "10.247", x2: "8.351", y2: "9.236" }),
    /* @__PURE__ */ c("line", { x1: "6", y1: "11.25", x2: "6", y2: "10" }),
    /* @__PURE__ */ c("line", { x1: "2.914", y1: "10.247", x2: "3.649", y2: "9.236" }),
    /* @__PURE__ */ c("line", { x1: "1.007", y1: "7.622", x2: "2.196", y2: "7.236" }),
    /* @__PURE__ */ c("line", { x1: "1.007", y1: "4.378", x2: "2.196", y2: "4.764" }),
    /* @__PURE__ */ c("line", { x1: "2.914", y1: "1.753", x2: "3.649", y2: "2.764" })
  ] }),
  user: /* @__PURE__ */ y(G, { children: [
    /* @__PURE__ */ c("circle", { cx: "6", cy: "2.491", r: "1.75" }),
    /* @__PURE__ */ c("path", { d: "m9.425,10.458c.551-.255.759-.92.458-1.446-.773-1.349-2.215-2.262-3.882-2.262s-3.11.912-3.882,2.262c-.301.526-.093,1.192.458,1.446,2.283,1.056,4.566,1.056,6.849,0Z" })
  ] }),
  logout: /* @__PURE__ */ y(G, { children: [
    /* @__PURE__ */ c("path", { d: "M5.75 3.25V2.25c0-.828.672-1.5 1.5-1.5h2.5c.828 0 1.5.672 1.5 1.5v7.5c0 .828-.672 1.5-1.5 1.5h-2.5c-.828 0-1.5-.672-1.5-1.5v-1" }),
    /* @__PURE__ */ c("line", { x1: "8.25", y1: "6", x2: "1", y2: "6" }),
    /* @__PURE__ */ c("polyline", { points: "3 3.75 .75 6 3 8.25" })
  ] }),
  box: /* @__PURE__ */ y(G, { children: [
    /* @__PURE__ */ c("line", { x1: "1.25", y1: "3.75", x2: "10.75", y2: "3.75" }),
    /* @__PURE__ */ c("line", { x1: "6", y1: ".75", x2: "6", y2: "3.75" }),
    /* @__PURE__ */ c("line", { x1: "3.75", y1: "8.25", x2: "5.25", y2: "8.25" }),
    /* @__PURE__ */ c("path", { d: "m1.25,3.75l1.461-2.504c.179-.307.508-.496.864-.496h4.851c.356,0,.685.189.864.496l1.461,2.504v5c0,1.105-.895,2-2,2H3.25c-1.105,0-2-.895-2-2V3.75Z" })
  ] }),
  copy: /* @__PURE__ */ y(G, { children: [
    /* @__PURE__ */ c("rect", { x: "3.25", y: ".75", width: "8", height: "8", rx: "1.5", ry: "1.5" }),
    /* @__PURE__ */ c("path", { d: "m8.25,11.25H2.25c-.828,0-1.5-.672-1.5-1.5V3.75" })
  ] }),
  folder: /* @__PURE__ */ y(G, { children: [
    /* @__PURE__ */ c("path", { d: "m.75,7.25V3.25c0-1.105.895-2,2-2h1.701c.607,0,1.18.275,1.56.748l.603.752h2.636c1.105,0,2,.895,2,2v2.5" }),
    /* @__PURE__ */ c("path", { d: "m2.75,5.25h6.5c1.105,0,2,.895,2,2v1.5c0,1.105-.895,2-2,2H2.75c-1.105,0-2-.895-2-2v-1.5c0-1.105.895-2,2-2Z" })
  ] })
};
function z({ name: e, className: t, ...n }) {
  return /* @__PURE__ */ c(
    "svg",
    {
      viewBox: "0 0 12 12",
      width: "12",
      height: "12",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true",
      className: t ? `size-3 shrink-0 ${t}` : "size-3 shrink-0",
      ...n,
      children: pu[e]
    }
  );
}
const es = gt({});
function zt(e) {
  const t = C(null);
  return t.current === null && (t.current = e()), t.current;
}
const mu = typeof window < "u", Lt = mu ? yt : F, Wt = /* @__PURE__ */ gt(null);
function ts(e, t) {
  e.indexOf(t) === -1 && e.push(t);
}
function Je(e, t) {
  const n = e.indexOf(t);
  n > -1 && e.splice(n, 1);
}
const Pe = (e, t, n) => n > t ? t : n < e ? e : n;
function fi(e, t) {
  return t ? `${e}. For more information and steps for solving, visit https://motion.dev/troubleshooting/${t}` : e;
}
let tt = () => {
}, we = () => {
};
typeof process < "u" && process.env?.NODE_ENV !== "production" && (tt = (e, t, n) => {
  !e && typeof console < "u" && console.warn(fi(t, n));
}, we = (e, t, n) => {
  if (!e)
    throw new Error(fi(t, n));
});
const Le = {}, ns = (e) => /^-?(?:\d+(?:\.\d+)?|\.\d+)$/u.test(e), is = (e) => typeof e == "object" && e !== null, ss = (e) => /^0[^.\s]+$/u.test(e);
// @__NO_SIDE_EFFECTS__
function oa(e) {
  let t;
  return () => (t === void 0 && (t = e()), t);
}
const Ae = /* @__NO_SIDE_EFFECTS__ */ (e) => e, _t = (...e) => e.reduce((t, n) => (i) => n(t(i))), pt = /* @__NO_SIDE_EFFECTS__ */ (e, t, n) => {
  const i = t - e;
  return i ? (n - e) / i : 1;
};
class vn {
  constructor() {
    this.subscriptions = [];
  }
  add(t) {
    return ts(this.subscriptions, t), () => this.remove(t);
  }
  remove(t) {
    Je(this.subscriptions, t);
  }
  notify(t, n, i) {
    const s = this.subscriptions.length;
    if (s)
      if (s === 1)
        this.subscriptions[0](t, n, i);
      else
        for (let r = 0; r < s; r++) {
          const o = this.subscriptions[r];
          o && o(t, n, i);
        }
  }
  getSize() {
    return this.subscriptions.length;
  }
  clear() {
    this.subscriptions.length = 0;
  }
}
const ye = /* @__NO_SIDE_EFFECTS__ */ (e) => e * 1e3, xe = /* @__NO_SIDE_EFFECTS__ */ (e) => e / 1e3, aa = /* @__NO_SIDE_EFFECTS__ */ (e, t) => t ? e * (1e3 / t) : 0, Js = /* @__PURE__ */ new Set();
function Vn(e, t, n) {
  e || Js.has(t) || (console.warn(fi(t, n)), Js.add(t));
}
const gu = (e, t, n) => {
  const i = t - e;
  return ((n - e) % i + i) % i + e;
}, la = (e, t, n) => (((1 - 3 * n + 3 * t) * e + (3 * n - 6 * t)) * e + 3 * t) * e, yu = 1e-7, xu = 12;
function vu(e, t, n, i, s) {
  let r, o, a = 0;
  do
    o = t + (n - t) / 2, r = la(o, i, s) - e, r > 0 ? n = o : t = o;
  while (Math.abs(r) > yu && ++a < xu);
  return o;
}
// @__NO_SIDE_EFFECTS__
function Gt(e, t, n, i) {
  if (e === t && n === i)
    return Ae;
  const s = (r) => vu(r, 0, 1, e, n);
  return (r) => r === 0 || r === 1 ? r : la(s(r), t, i);
}
const ca = /* @__NO_SIDE_EFFECTS__ */ (e) => (t) => t <= 0.5 ? e(2 * t) / 2 : (2 - e(2 * (1 - t))) / 2, rs = /* @__NO_SIDE_EFFECTS__ */ (e) => (t) => 1 - e(1 - t), ua = /* @__PURE__ */ Gt(0.33, 1.53, 0.69, 0.99), os = /* @__PURE__ */ rs(ua), da = /* @__PURE__ */ ca(os), fa = (e) => e >= 1 ? 1 : (e *= 2) < 1 ? 0.5 * os(e) : 0.5 * (2 - Math.pow(2, -10 * (e - 1))), as = (e) => 1 - Math.sin(Math.acos(e)), ha = /* @__PURE__ */ rs(as), pa = /* @__PURE__ */ ca(as), bu = /* @__PURE__ */ Gt(0.42, 0, 1, 1), wu = /* @__PURE__ */ Gt(0, 0, 0.58, 1), ma = /* @__PURE__ */ Gt(0.42, 0, 0.58, 1), ga = /* @__NO_SIDE_EFFECTS__ */ (e) => Array.isArray(e) && typeof e[0] != "number";
// @__NO_SIDE_EFFECTS__
function ya(e, t) {
  return /* @__PURE__ */ ga(e) ? e[gu(0, e.length, t)] : e;
}
const xa = /* @__NO_SIDE_EFFECTS__ */ (e) => Array.isArray(e) && typeof e[0] == "number", er = {
  linear: Ae,
  easeIn: bu,
  easeInOut: ma,
  easeOut: wu,
  circIn: as,
  circInOut: pa,
  circOut: ha,
  backIn: os,
  backInOut: da,
  backOut: ua,
  anticipate: fa
}, ku = (e) => typeof e == "string", tr = (e) => {
  if (/* @__PURE__ */ xa(e)) {
    we(e.length === 4, "Cubic bezier arrays must contain four numerical values.", "cubic-bezier-length");
    const [t, n, i, s] = e;
    return /* @__PURE__ */ Gt(t, n, i, s);
  } else if (ku(e))
    return we(er[e] !== void 0, `Invalid easing type '${e}'`, "invalid-easing-type"), er[e];
  return e;
}, Zt = [
  "setup",
  // Compute
  "read",
  // Read
  "resolveKeyframes",
  // Write/Read/Write/Read
  "preUpdate",
  // Compute
  "update",
  // Compute
  "preRender",
  // Compute
  "render",
  // Write
  "postRender"
  // Compute
];
function Tu(e) {
  let t = /* @__PURE__ */ new Set(), n = /* @__PURE__ */ new Set(), i = !1, s = !1;
  const r = /* @__PURE__ */ new Set();
  let o = {
    delta: 0,
    timestamp: 0,
    isProcessing: !1
  };
  function a(u) {
    r.has(u) && (n.add(u), e()), u(o);
  }
  const l = {
    /**
     * Schedule a process to run on the next frame.
     */
    schedule: (u, d = !1, h = !1) => {
      const p = h && i ? t : n;
      return d && r.add(u), p.add(u), u;
    },
    /**
     * Cancel the provided callback from running on the next frame.
     */
    cancel: (u) => {
      n.delete(u), r.delete(u);
    },
    /**
     * Execute all schedule callbacks.
     */
    process: (u) => {
      if (o = u, i) {
        s = !0;
        return;
      }
      i = !0;
      const d = t;
      t = n, n = d, t.forEach(a), t.clear(), i = !1, s && (s = !1, l.process(u));
    }
  };
  return l;
}
const Su = 40;
function va(e, t) {
  let n = !1, i = !0;
  const s = {
    delta: 0,
    timestamp: 0,
    isProcessing: !1
  }, r = () => n = !0, o = Zt.reduce((g, S) => (g[S] = Tu(r), g), {}), { setup: a, read: l, resolveKeyframes: u, preUpdate: d, update: h, preRender: f, render: p, postRender: m } = o, x = () => {
    const g = Le.useManualTiming, S = g ? s.timestamp : performance.now();
    n = !1, g || (s.delta = i ? 1e3 / 60 : Math.max(Math.min(S - s.timestamp, Su), 1)), s.timestamp = S, s.isProcessing = !0, a.process(s), l.process(s), u.process(s), d.process(s), h.process(s), f.process(s), p.process(s), m.process(s), s.isProcessing = !1, n && t && (i = !1, e(x));
  }, v = () => {
    n = !0, i = !0, s.isProcessing || e(x);
  };
  return { schedule: Zt.reduce((g, S) => {
    const R = o[S];
    return g[S] = (D, k = !1, A = !1) => (n || v(), R.schedule(D, k, A)), g;
  }, {}), cancel: (g) => {
    for (let S = 0; S < Zt.length; S++)
      o[Zt[S]].cancel(g);
  }, state: s, steps: o };
}
const { schedule: K, cancel: Fe, state: ae, steps: Wn } = /* @__PURE__ */ va(typeof requestAnimationFrame < "u" ? requestAnimationFrame : Ae, !0);
let ln;
function Nu() {
  ln = void 0;
}
const fe = {
  now: () => (ln === void 0 && fe.set(ae.isProcessing || Le.useManualTiming ? ae.timestamp : performance.now()), ln),
  set: (e) => {
    ln = e, queueMicrotask(Nu);
  }
}, ft = (e) => Math.round(e * 1e5) / 1e5, ba = (e) => (t) => typeof t == "string" && t.startsWith(e), wa = /* @__PURE__ */ ba("--"), Au = /* @__PURE__ */ ba("var(--"), ls = (e) => Au(e) ? Pu.test(e.split("/*")[0].trim()) : !1, Pu = /var\(--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)$/iu;
function nr(e) {
  return typeof e != "string" ? !1 : e.split("/*")[0].includes("var(--");
}
const xt = {
  test: (e) => typeof e == "number",
  parse: parseFloat,
  transform: (e) => e
}, Ft = {
  ...xt,
  transform: (e) => Pe(0, 1, e)
}, Qt = {
  ...xt,
  default: 1
}, cs = /-?(?:\d+(?:\.\d+)?|\.\d+)/gu;
function Mu(e) {
  return e == null;
}
const Cu = /^(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))$/iu, us = (e, t) => (n) => !!(typeof n == "string" && Cu.test(n) && n.startsWith(e) || t && !Mu(n) && Object.prototype.hasOwnProperty.call(n, t)), ka = (e, t, n) => (i) => {
  if (typeof i != "string")
    return i;
  const [s, r, o, a] = i.match(cs);
  return {
    [e]: parseFloat(s),
    [t]: parseFloat(r),
    [n]: parseFloat(o),
    alpha: a !== void 0 ? parseFloat(a) : 1
  };
}, Eu = (e) => Pe(0, 255, e), _n = {
  ...xt,
  transform: (e) => Math.round(Eu(e))
}, qe = {
  test: /* @__PURE__ */ us("rgb", "red"),
  parse: /* @__PURE__ */ ka("red", "green", "blue"),
  transform: ({ red: e, green: t, blue: n, alpha: i = 1 }) => "rgba(" + _n.transform(e) + ", " + _n.transform(t) + ", " + _n.transform(n) + ", " + ft(Ft.transform(i)) + ")"
};
function Du(e) {
  let t = "", n = "", i = "", s = "";
  return e.length > 5 ? (t = e.substring(1, 3), n = e.substring(3, 5), i = e.substring(5, 7), s = e.substring(7, 9)) : (t = e.substring(1, 2), n = e.substring(2, 3), i = e.substring(3, 4), s = e.substring(4, 5), t += t, n += n, i += i, s += s), {
    red: parseInt(t, 16),
    green: parseInt(n, 16),
    blue: parseInt(i, 16),
    alpha: s ? parseInt(s, 16) / 255 : 1
  };
}
const hi = {
  test: /* @__PURE__ */ us("#"),
  parse: Du,
  transform: qe.transform
}, Kt = /* @__NO_SIDE_EFFECTS__ */ (e) => ({
  test: (t) => typeof t == "string" && t.endsWith(e) && t.split(" ").length === 1,
  parse: parseFloat,
  transform: (t) => `${t}${e}`
}), Re = /* @__PURE__ */ Kt("deg"), De = /* @__PURE__ */ Kt("%"), V = /* @__PURE__ */ Kt("px"), Vu = /* @__PURE__ */ Kt("vh"), Ru = /* @__PURE__ */ Kt("vw"), ir = {
  ...De,
  parse: (e) => De.parse(e) / 100,
  transform: (e) => De.transform(e * 100)
}, at = {
  test: /* @__PURE__ */ us("hsl", "hue"),
  parse: /* @__PURE__ */ ka("hue", "saturation", "lightness"),
  transform: ({ hue: e, saturation: t, lightness: n, alpha: i = 1 }) => "hsla(" + Math.round(e) + ", " + De.transform(ft(t)) + ", " + De.transform(ft(n)) + ", " + ft(Ft.transform(i)) + ")"
}, le = {
  test: (e) => qe.test(e) || hi.test(e) || at.test(e),
  parse: (e) => qe.test(e) ? qe.parse(e) : at.test(e) ? at.parse(e) : hi.parse(e),
  transform: (e) => typeof e == "string" ? e : e.hasOwnProperty("red") ? qe.transform(e) : at.transform(e),
  getAnimatableNone: (e) => {
    const t = le.parse(e);
    return t.alpha = 0, le.transform(t);
  }
}, Lu = /(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))/giu, Ta = /* @__PURE__ */ new RegExp(cs.source), Sa = /* @__PURE__ */ new RegExp(Lu.source, "i");
function Fu(e) {
  return isNaN(e) && typeof e == "string" && (Ta.test(e) || Sa.test(e));
}
const Na = "number", Aa = "color", Ou = "var", Iu = "var(", sr = "${}", Bu = /var\s*\(\s*--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)|#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\)|-?(?:\d+(?:\.\d+)?|\.\d+)/giu;
function $u(e) {
  const t = e.toString();
  return Ta.test(t) || Sa.test(t);
}
function Ot(e) {
  const t = e.toString(), n = [], i = {
    color: [],
    number: [],
    var: []
  }, s = [];
  let r = 0;
  const a = t.replace(Bu, (l) => (le.test(l) ? (i.color.push(r), s.push(Aa), n.push(le.parse(l))) : l.startsWith(Iu) ? (i.var.push(r), s.push(Ou), n.push(l)) : (i.number.push(r), s.push(Na), n.push(parseFloat(l))), ++r, sr)).split(sr);
  return { values: n, split: a, indexes: i, types: s };
}
function ju(e) {
  return Ot(e).values;
}
function Pa({ split: e, types: t }) {
  const n = e.length;
  return (i) => {
    let s = "";
    for (let r = 0; r < n; r++)
      if (s += e[r], i[r] !== void 0) {
        const o = t[r];
        o === Na ? s += ft(i[r]) : o === Aa ? s += le.transform(i[r]) : s += i[r];
      }
    return s;
  };
}
function Uu(e) {
  return Pa(Ot(e));
}
const zu = (e) => typeof e == "number" ? 0 : le.test(e) ? le.getAnimatableNone(e) : e, Wu = (e, t) => typeof e == "number" ? t?.trim().endsWith("/") ? e : 0 : zu(e);
function _u(e) {
  const t = Ot(e);
  return Pa(t)(t.values.map((i, s) => Wu(i, t.split[s])));
}
const be = {
  test: Fu,
  parse: ju,
  createTransformer: Uu,
  getAnimatableNone: _u
};
function Gn(e, t, n) {
  return n < 0 && (n += 1), n > 1 && (n -= 1), n < 1 / 6 ? e + (t - e) * 6 * n : n < 1 / 2 ? t : n < 2 / 3 ? e + (t - e) * (2 / 3 - n) * 6 : e;
}
function Gu({ hue: e, saturation: t, lightness: n, alpha: i }) {
  e /= 360, t /= 100, n /= 100;
  let s = 0, r = 0, o = 0;
  if (!t)
    s = r = o = n;
  else {
    const a = n < 0.5 ? n * (1 + t) : n + t - n * t, l = 2 * n - a;
    s = Gn(l, a, e + 1 / 3), r = Gn(l, a, e), o = Gn(l, a, e - 1 / 3);
  }
  return {
    red: Math.round(s * 255),
    green: Math.round(r * 255),
    blue: Math.round(o * 255),
    alpha: i
  };
}
function bn(e, t) {
  return (n) => n > 0 ? t : e;
}
const q = (e, t, n) => e + (t - e) * n, Kn = (e, t, n) => {
  const i = e * e, s = n * (t * t - i) + i;
  return s < 0 ? 0 : Math.sqrt(s);
}, Ku = [hi, qe, at], Hu = (e) => Ku.find((t) => t.test(e));
function rr(e) {
  const t = Hu(e);
  if (!t)
    return tt(!1, `'${e}' is not an animatable color. Use the equivalent color code instead.`, "color-not-animatable"), !1;
  let n = t.parse(e);
  return t === at && (n = Gu(n)), n;
}
const or = (e, t) => {
  const n = rr(e), i = rr(t);
  if (!n || !i)
    return bn(e, t);
  const s = { ...n };
  return (r) => (s.red = Kn(n.red, i.red, r), s.green = Kn(n.green, i.green, r), s.blue = Kn(n.blue, i.blue, r), s.alpha = q(n.alpha, i.alpha, r), qe.transform(s));
}, pi = /* @__PURE__ */ new Set(["none", "hidden"]);
function qu(e, t) {
  return pi.has(e) ? (n) => n <= 0 ? e : t : (n) => n >= 1 ? t : e;
}
function Yu(e, t) {
  return (n) => q(e, t, n);
}
function ds(e) {
  return typeof e == "number" ? Yu : typeof e == "string" ? ls(e) ? bn : le.test(e) ? or : Qu : Array.isArray(e) ? Ma : typeof e == "object" ? le.test(e) ? or : Xu : bn;
}
function Ma(e, t) {
  const n = [...e], i = n.length, s = e.map((r, o) => ds(r)(r, t[o]));
  return (r) => {
    for (let o = 0; o < i; o++)
      n[o] = s[o](r);
    return n;
  };
}
function Xu(e, t) {
  const n = { ...e, ...t }, i = {};
  for (const s in n)
    e[s] !== void 0 && t[s] !== void 0 && (i[s] = ds(e[s])(e[s], t[s]));
  return (s) => {
    for (const r in i)
      n[r] = i[r](s);
    return n;
  };
}
function Zu(e, t) {
  const n = [], i = { color: 0, var: 0, number: 0 };
  for (let s = 0; s < t.values.length; s++) {
    const r = t.types[s], o = e.indexes[r][i[r]], a = e.values[o] ?? 0;
    n[s] = a, i[r]++;
  }
  return n;
}
const Qu = (e, t) => {
  const n = be.createTransformer(t), i = Ot(e), s = Ot(t);
  return i.indexes.var.length === s.indexes.var.length && i.indexes.color.length === s.indexes.color.length && i.indexes.number.length >= s.indexes.number.length ? pi.has(e) && !s.values.length || pi.has(t) && !i.values.length ? qu(e, t) : _t(Ma(Zu(i, s), s.values), n) : (tt(!0, `Complex values '${e}' and '${t}' too different to mix. Ensure all colors are of the same type, and that each contains the same quantity of number and color values. Falling back to instant transition.`, "complex-values-different"), bn(e, t));
}, ar = /^(-?(?:\d+(?:\.\d*)?|\.\d+))([a-z%]*)$/iu;
function Ju(e, t) {
  const n = ar.exec(e);
  if (!n)
    return;
  const i = ar.exec(t);
  if (!i || n[2] !== i[2])
    return;
  const s = n[2], r = parseFloat(n[1]), o = parseFloat(i[1]);
  return (a) => ft(q(r, o, a)) + s;
}
function fs(e, t, n) {
  if (typeof e == "number" && typeof t == "number" && typeof n == "number")
    return q(e, t, n);
  if (typeof e == "string" && typeof t == "string") {
    const s = Ju(e, t);
    if (s)
      return s;
  }
  return ds(e)(e, t);
}
const ed = (e) => {
  const t = ({ timestamp: n }) => e(n);
  return {
    start: (n = !0) => K.update(t, n),
    stop: () => Fe(t),
    /**
     * If we're processing this frame we can use the
     * framelocked timestamp to keep things in sync.
     */
    now: () => ae.isProcessing ? ae.timestamp : fe.now()
  };
}, Ca = (e, t, n = 10) => {
  let i = "";
  const s = Math.max(Math.round(t / n), 2);
  for (let r = 0; r < s; r++)
    i += Math.round(e(r / (s - 1)) * 1e4) / 1e4 + ", ";
  return `linear(${i.substring(0, i.length - 2)})`;
}, hs = 2e4;
function ps(e, t = 50, n = hs, i) {
  let s = 0, r = e.next(s);
  for (; !r.done && s < n; )
    s += t, r = e.next(s);
  return s >= n ? 1 / 0 : s;
}
function Ea(e, t = 100, n) {
  const i = n({ ...e, keyframes: [0, t] }), s = Math.min(ps(i), hs);
  return {
    type: "keyframes",
    ease: (r) => i.next(s * r).value / t,
    duration: /* @__PURE__ */ xe(s)
  };
}
const J = {
  // Default spring physics
  stiffness: 100,
  damping: 10,
  mass: 1,
  velocity: 0,
  // Default duration/bounce-based options
  duration: 800,
  // in ms
  bounce: 0.3,
  visualDuration: 0.3,
  // in seconds
  // Rest thresholds
  restSpeed: {
    granular: 0.01,
    default: 2
  },
  restDelta: {
    granular: 5e-3,
    default: 0.5
  },
  // Limits
  minDuration: 0.01,
  // in seconds
  maxDuration: 10,
  // in seconds
  minDamping: 0.05,
  maxDamping: 1
};
function mi(e, t) {
  return e * Math.sqrt(1 - t * t);
}
const td = 12;
function nd(e, t, n) {
  let i = n;
  for (let s = 1; s < td; s++)
    i = i - e(i) / t(i);
  return i;
}
const Hn = 1e-3;
function id({ duration: e = J.duration, bounce: t = J.bounce, velocity: n = J.velocity, mass: i = J.mass }) {
  let s, r;
  tt(e <= /* @__PURE__ */ ye(J.maxDuration), "Spring duration must be 10 seconds or less", "spring-duration-limit");
  let o = 1 - t;
  o = Pe(J.minDamping, J.maxDamping, o), e = Pe(J.minDuration, J.maxDuration, /* @__PURE__ */ xe(e)), o < 1 ? (s = (u) => {
    const d = u * o, h = d * e, f = d - n, p = mi(u, o), m = Math.exp(-h);
    return Hn - f / p * m;
  }, r = (u) => {
    const h = u * o * e, f = h * n + n, p = o * o * u * u * e, m = Math.exp(-h), x = mi(u * u, o);
    return (-s(u) + Hn > 0 ? -1 : 1) * ((f - p) * m) / x;
  }) : (s = (u) => {
    const d = Math.exp(-u * e), h = (u - n) * e + 1;
    return -Hn + d * h;
  }, r = (u) => {
    const d = Math.exp(-u * e), h = (n - u) * (e * e);
    return d * h;
  });
  const a = 5 / e, l = nd(s, r, a);
  if (e = /* @__PURE__ */ ye(e), isNaN(l))
    return {
      stiffness: J.stiffness,
      damping: J.damping,
      duration: e
    };
  {
    const u = l * l * i;
    return {
      stiffness: u,
      damping: o * 2 * Math.sqrt(i * u),
      duration: e
    };
  }
}
const Da = ["duration", "bounce"], Va = ["stiffness", "damping", "mass"];
function wn(e, t) {
  return t.some((n) => e[n] !== void 0);
}
function sd(e) {
  let t = {
    velocity: J.velocity,
    stiffness: J.stiffness,
    damping: J.damping,
    mass: J.mass,
    isResolvedFromDuration: !1,
    ...e
  };
  if (!wn(e, Va) && wn(e, Da))
    if (t.velocity = 0, e.visualDuration) {
      const n = e.visualDuration, i = 2 * Math.PI / (n * 1.2), s = i * i, r = 2 * Pe(0.05, 1, 1 - (e.bounce || 0)) * Math.sqrt(s);
      t = {
        ...t,
        mass: J.mass,
        stiffness: s,
        damping: r
      };
    } else {
      const n = id({ ...e, velocity: 0 });
      t = {
        ...t,
        ...n,
        mass: J.mass
      }, t.isResolvedFromDuration = !0;
    }
  return t;
}
function It(e = J.visualDuration, t = J.bounce) {
  const n = typeof e != "object" ? {
    visualDuration: e,
    keyframes: [0, 1],
    bounce: t
  } : e, i = n.keyframes[0], s = n.keyframes[n.keyframes.length - 1], r = { done: !1, value: i }, { stiffness: o, damping: a, mass: l, duration: u, velocity: d, isResolvedFromDuration: h } = sd({
    ...n,
    velocity: -/* @__PURE__ */ xe(n.velocity || 0)
  }), f = a / (2 * Math.sqrt(o * l)), p = /* @__PURE__ */ xe(Math.sqrt(o / l)), m = f * p, x = {
    target: s,
    delta: s - i,
    velocity: d || 0,
    restSpeed: 0,
    restDelta: 0
  }, v = () => {
    const k = Math.abs(x.delta) < 5;
    x.restSpeed = n.restSpeed || (k ? J.restSpeed.granular : J.restSpeed.default), x.restDelta = n.restDelta || (k ? J.restDelta.granular : J.restDelta.default);
  };
  v();
  let w, T, g;
  if (f < 1) {
    const k = mi(p, f), A = { A: 0, sinC: 0, cosC: 0, t: -1, env: 0, sin: 0, cos: 0 };
    g = () => {
      A.A = (x.velocity + m * x.delta) / k, A.sinC = m * A.A + x.delta * k, A.cosC = m * x.delta - A.A * k;
    };
    const N = (M) => {
      M !== A.t && (A.t = M, A.env = Math.exp(-m * M), A.sin = Math.sin(k * M), A.cos = Math.cos(k * M));
    };
    w = (M) => (N(M), x.target - A.env * (A.A * A.sin + x.delta * A.cos)), T = (M) => (N(M), A.env * (A.sinC * A.sin + A.cosC * A.cos));
  } else if (f === 1) {
    w = (A) => x.target - Math.exp(-p * A) * (x.delta + (x.velocity + p * x.delta) * A);
    const k = { C: 0 };
    g = () => {
      k.C = x.velocity + p * x.delta;
    }, T = (A) => Math.exp(-p * A) * (p * k.C * A - x.velocity);
  } else {
    const k = p * Math.sqrt(f * f - 1);
    w = (N) => {
      const M = Math.exp(-m * N), b = Math.min(k * N, 300);
      return x.target - M * ((x.velocity + m * x.delta) * Math.sinh(b) + k * x.delta * Math.cosh(b)) / k;
    };
    const A = { P: 0, sinh: 0, cosh: 0 };
    g = () => {
      A.P = (x.velocity + m * x.delta) / k, A.sinh = m * A.P - x.delta * k, A.cosh = m * x.delta - A.P * k;
    }, T = (N) => {
      const M = Math.exp(-m * N), b = Math.min(k * N, 300);
      return M * (A.sinh * Math.sinh(b) + A.cosh * Math.cosh(b));
    };
  }
  g();
  const S = !wn(n, Va) && wn(n, Da), R = h && u || null, D = {
    calculatedDuration: R,
    /**
     * Aim the spring at a new target from its current position and
     * velocity, reusing the resolved physics and closures.
     */
    retarget: (k, A) => {
      x.target = k[k.length - 1], x.delta = x.target - k[0], x.velocity = S ? 0 : -/* @__PURE__ */ xe(A), n.restSpeed && n.restDelta || v(), D.calculatedDuration = R, r.done = !1, g();
    },
    velocity: (k) => /* @__PURE__ */ ye(T(k)),
    next: (k) => {
      const A = w(k);
      if (h)
        r.done = k >= u;
      else {
        const N = /* @__PURE__ */ ye(T(k));
        r.done = Math.abs(N) <= x.restSpeed && Math.abs(x.target - A) <= x.restDelta;
      }
      return r.value = r.done ? x.target : A, r;
    },
    toString: () => {
      const k = Math.min(ps(D), hs), A = Ca((N) => D.next(k * N).value, k, 30);
      return k + "ms " + A;
    },
    toTransition: () => {
    }
  };
  return D;
}
It.applyToOptions = (e) => {
  const t = Ea(e, 100, It);
  return e.ease = t.ease, e.duration = /* @__PURE__ */ ye(t.duration), e.type = "keyframes", e;
};
function gi({ keyframes: e, velocity: t = 0, power: n = 0.8, timeConstant: i = 325, bounceDamping: s = 10, bounceStiffness: r = 500, modifyTarget: o, min: a, max: l, restDelta: u = 0.5, restSpeed: d }) {
  const h = e[0], f = {
    done: !1,
    value: h
  }, p = (k) => k < a || k > l, m = (k) => a === void 0 ? l : l === void 0 || Math.abs(a - k) < Math.abs(l - k) ? a : l;
  let x = n * t;
  const v = h + x, w = o === void 0 ? v : o(v);
  w !== v && (x = w - h);
  const T = (k) => -x * Math.exp(-k / i), g = (k) => {
    const A = T(k);
    f.done = Math.abs(A) <= u, f.value = f.done ? w : w + A;
  };
  let S, R;
  const D = (k) => {
    p(f.value) && (S = k, R = It({
      keyframes: [f.value, m(f.value)],
      /**
       * The friction curve is target + calcDelta(t), so its exact
       * derivative is -calcDelta(t) / timeConstant in units/ms,
       * converted here to the units/second expected by spring.
       */
      velocity: -T(k) / i * 1e3,
      damping: s,
      stiffness: r,
      restDelta: u,
      restSpeed: d
    }));
  };
  return D(0), {
    calculatedDuration: null,
    next: (k) => {
      let A = !1;
      return !R && S === void 0 && (A = !0, g(k), D(k)), S !== void 0 && k >= S ? R.next(k - S) : (!A && g(k), f);
    }
  };
}
function rd(e, t, n) {
  const i = [], s = n || Le.mix || fs, r = e.length - 1;
  for (let o = 0; o < r; o++) {
    let a = s(e[o], e[o + 1]);
    if (t) {
      const l = Array.isArray(t) ? t[o] || Ae : t;
      a = _t(l, a);
    }
    i.push(a);
  }
  return i;
}
function Ra(e, t, { clamp: n = !0, ease: i, mixer: s } = {}) {
  const r = e.length;
  if (we(r === t.length, "Both input and output ranges must be the same length", "range-length"), r === 1)
    return () => t[0];
  if (r === 2 && t[0] === t[1])
    return () => t[1];
  const o = e[0] === e[1];
  e[0] > e[r - 1] && (e = [...e].reverse(), t = [...t].reverse());
  const a = rd(t, i, s), l = a.length, u = (d) => {
    if (o && d < e[0])
      return t[0];
    let h = 0;
    if (l > 1)
      for (; h < e.length - 2 && !(d < e[h + 1]); h++)
        ;
    const f = /* @__PURE__ */ pt(e[h], e[h + 1], d);
    return a[h](f);
  };
  return n ? (d) => u(Pe(e[0], e[r - 1], d)) : u;
}
function La(e, t) {
  const n = e[e.length - 1];
  for (let i = 1; i <= t; i++) {
    const s = /* @__PURE__ */ pt(0, t, i);
    e.push(q(n, 1, s));
  }
}
function Fa(e) {
  const t = [0];
  return La(t, e.length - 1), t;
}
function od(e, t) {
  return e.map((n) => n * t);
}
function ad(e, t) {
  return e.map(() => t || ma).splice(0, e.length - 1);
}
function lt({ duration: e = 300, keyframes: t, times: n, ease: i = "easeInOut" }) {
  const s = /* @__PURE__ */ ga(i) ? i.map(tr) : tr(i), r = {
    done: !1,
    value: t[0]
  };
  if (t.length === 2 && !Array.isArray(s) && (!n || n.length !== 2 || n[0] === 0 && n[1] === 1)) {
    const [l, u] = t, d = l === u ? void 0 : (Le.mix || fs)(l, u);
    return {
      calculatedDuration: e,
      next: (h) => (r.value = d ? d(s(e > 0 ? Pe(0, 1, h / e) : 1)) : u, r.done = h >= e, r)
    };
  }
  const o = od(
    // Only use the provided offsets if they're the correct length
    // TODO Maybe we should warn here if there's a length mismatch
    n && n.length === t.length ? n : Fa(t),
    e
  ), a = Ra(o, t, {
    ease: Array.isArray(s) ? s : ad(t, s)
  });
  return {
    calculatedDuration: e,
    next: (l) => (r.value = a(l), r.done = l >= e, r)
  };
}
const ld = 5;
function cd(e, t, n) {
  const i = Math.max(t - ld, 0);
  return /* @__PURE__ */ aa(n - e(i), t - i);
}
function ud(e, t, n = 0) {
  return t <= 0 ? n : e.velocity ? e.velocity(t) : cd((i) => e.next(i).value, t, e.next(t).value);
}
const dd = (e) => e !== null;
function Rn(e, { repeat: t, repeatType: n = "loop" }, i, s = 1) {
  const r = e.filter(dd), a = s < 0 || t && n !== "loop" && t % 2 === 1 ? 0 : r.length - 1;
  return !a || i === void 0 ? r[a] : i;
}
const fd = {
  decay: gi,
  inertia: gi,
  tween: lt,
  keyframes: lt,
  spring: It
};
function Oa(e) {
  typeof e.type == "string" && (e.type = fd[e.type]);
}
function Ia(e, t) {
  return {
    kind: e,
    animation: t,
    timestamp: fe.now(),
    frameTimestamp: ae.timestamp,
    frameIsProcessing: ae.isProcessing
  };
}
function Ba(e, t, n) {
  const i = globalThis.__MOTION_INSPECT__;
  if (i)
    try {
      i({
        ...Ia("animation-start", e),
        options: n ? { ...t, ...n } : t
      });
    } catch {
    }
}
function hd(e, t) {
  const n = globalThis.__MOTION_INSPECT__;
  if (n)
    try {
      n({
        ...Ia("layout-animation-start", e),
        node: t
      });
    } catch {
    }
}
class ms {
  constructor() {
    this.isResolved = !1;
  }
  get finished() {
    return this._finished || (this._finished = this.isResolved ? Promise.resolve() : new Promise((t) => {
      this._resolve = t;
    })), this._finished;
  }
  updateFinished() {
    this._finished = this._resolve = void 0, this.isResolved = !1;
  }
  notifyFinished() {
    this.isResolved = !0, this._resolve?.();
  }
  /**
   * Allows the animation to be awaited.
   *
   * @deprecated Use `finished` instead.
   */
  then(t, n) {
    return this.finished.then(t, n);
  }
}
const pd = (e) => e / 100;
class kn extends ms {
  constructor(t) {
    super(), this.state = "idle", this.startTime = null, this.isStopped = !1, this.currentTime = 0, this.holdTime = null, this.playbackSpeed = 1, this.delayState = {
      done: !1,
      value: void 0
    }, this.stop = () => {
      const { motionValue: n } = this.options;
      n && n.updatedAt !== fe.now() && this.tick(fe.now()), this.isStopped = !0, this.state !== "idle" && (this.teardown(), this.options.onStop?.());
    }, this.options = t, this.initAnimation(), this.play(), t.autoplay === !1 && this.pause(), Ba(this, this.options);
  }
  initAnimation() {
    const { options: t } = this;
    Oa(t);
    const { type: n = lt, repeat: i = 0, repeatDelay: s = 0, repeatType: r, velocity: o = 0 } = t;
    let { keyframes: a } = t;
    const l = n || lt;
    process.env.NODE_ENV !== "production" && l !== lt && we(a.length <= 2, `Only two keyframes currently supported with spring and inertia animations. Trying to animate ${a}`, "spring-two-frames"), l !== lt && typeof a[0] != "number" && (this.mixKeyframes = _t(pd, fs(a[0], a[1])), a = [0, 100]);
    const u = l(a === t.keyframes ? t : { ...t, keyframes: a });
    r === "mirror" && (this.mirroredGenerator = l({
      ...t,
      keyframes: [...a].reverse(),
      velocity: -o
    })), u.calculatedDuration === null && (u.calculatedDuration = ps(u));
    const { calculatedDuration: d } = u;
    this.calculatedDuration = d, this.resolvedDuration = d + s, this.totalDuration = this.resolvedDuration * (i + 1) - s, this.generator = u;
  }
  updateTime(t) {
    const n = Math.round(t - this.startTime) * this.playbackSpeed;
    this.holdTime !== null ? this.currentTime = this.holdTime : this.currentTime = n;
  }
  tick(t, n = !1) {
    const { generator: i, totalDuration: s, mixKeyframes: r, mirroredGenerator: o, resolvedDuration: a, calculatedDuration: l } = this;
    if (this.startTime === null)
      return i.next(0);
    const { delay: u = 0, keyframes: d, repeat: h, repeatType: f, repeatDelay: p, type: m, onUpdate: x, finalKeyframe: v } = this.options;
    this.speed > 0 ? this.startTime = Math.min(this.startTime, t) : this.speed < 0 && (this.startTime = Math.min(t - s / this.speed, this.startTime)), n ? this.currentTime = t : this.updateTime(t);
    const w = this.currentTime - u * (this.playbackSpeed >= 0 ? 1 : -1), T = this.playbackSpeed >= 0 ? w < 0 : w > s;
    this.currentTime = Math.max(w, 0), this.state === "finished" && this.holdTime === null && (this.currentTime = s);
    let g = this.currentTime, S = i;
    if (h) {
      const A = Math.min(this.currentTime, s) / a;
      let N = Math.floor(A), M = A % 1;
      !M && A >= 1 && (M = 1), M === 1 && N--, N = Math.min(N, h + 1), N % 2 && (f === "reverse" ? (M = 1 - M, p && (M -= p / a)) : f === "mirror" && (S = o)), g = Pe(0, 1, M) * a;
    }
    let R;
    T ? (this.delayState.value = d[0], R = this.delayState) : R = S.next(g), r && !T && (R.value = r(R.value));
    let { done: D } = R;
    !T && l !== null && (D = this.playbackSpeed >= 0 ? this.currentTime >= s : this.currentTime <= 0);
    const k = this.holdTime === null && (this.state === "finished" || this.state === "running" && D);
    return k && m !== gi && (R.value = Rn(d, this.options, v, this.speed)), x && x(R.value), k && this.finish(), R;
  }
  /**
   * Allows the returned animation to be awaited or promise-chained. Currently
   * resolves when the animation finishes at all but in a future update could/should
   * reject if its cancels.
   */
  then(t, n) {
    return this.finished.then(t, n);
  }
  get duration() {
    return /* @__PURE__ */ xe(this.calculatedDuration);
  }
  get iterationDuration() {
    const { delay: t = 0 } = this.options || {};
    return this.duration + /* @__PURE__ */ xe(t);
  }
  get time() {
    return /* @__PURE__ */ xe(this.currentTime);
  }
  set time(t) {
    t = /* @__PURE__ */ ye(t), this.currentTime = t, this.startTime === null || this.holdTime !== null || this.playbackSpeed === 0 ? this.holdTime = t : this.driver && (this.startTime = this.driver.now() - t / this.playbackSpeed), this.driver ? this.driver.start(!1) : (this.startTime = 0, this.state = "paused", this.holdTime = t, this.tick(t));
  }
  /**
   * Returns the generator's velocity at the current time in units/second.
   * Uses the analytical derivative when available (springs), avoiding
   * the MotionValue's frame-dependent velocity estimation.
   */
  getGeneratorVelocity() {
    return ud(this.generator, this.currentTime, this.options.velocity);
  }
  get speed() {
    return this.playbackSpeed;
  }
  set speed(t) {
    const n = this.playbackSpeed !== t;
    n && this.driver && this.updateTime(fe.now()), this.playbackSpeed = t, n && this.driver && (this.time = /* @__PURE__ */ xe(this.currentTime));
  }
  play() {
    if (this.isStopped)
      return;
    const { driver: t = ed, startTime: n } = this.options;
    this.driver || (this.driver = t((s) => this.tick(s))), this.options.onPlay?.();
    const i = this.driver.now();
    this.state === "finished" ? (this.updateFinished(), this.startTime = i) : this.holdTime !== null ? this.startTime = i - this.holdTime : this.startTime || (this.startTime = n ?? i), this.state === "finished" && this.speed < 0 && (this.startTime += this.calculatedDuration), this.holdTime = null, this.state = "running", this.driver.start();
  }
  pause() {
    this.state = "paused", this.updateTime(fe.now()), this.holdTime = this.currentTime;
  }
  complete() {
    this.state !== "running" && this.play(), this.state = "finished", this.holdTime = null;
  }
  finish() {
    this.notifyFinished(), this.teardown(), this.state = "finished", this.options.onComplete?.();
  }
  cancel() {
    this.holdTime = null, this.startTime = 0, this.tick(0), this.teardown(), this.options.onCancel?.();
  }
  teardown() {
    this.state = "idle", this.stopDriver(), this.startTime = this.holdTime = null;
  }
  stopDriver() {
    this.driver && (this.driver.stop(), this.driver = void 0);
  }
  sample(t) {
    return this.startTime = 0, this.tick(t, !0);
  }
  attachTimeline(t) {
    return this.options.allowFlatten && (this.options.type = "keyframes", this.options.ease = "linear", this.initAnimation()), this.driver?.stop(), t.observe(this);
  }
}
const md = /* @__PURE__ */ new Set(["brightness", "contrast", "saturate", "opacity"]);
function gd(e) {
  const [t, n] = e.slice(0, -1).split("(");
  if (t === "drop-shadow")
    return e;
  const [i] = n.match(cs) || [];
  if (!i)
    return e;
  const s = n.replace(i, "");
  let r = md.has(t) ? 1 : 0;
  return i !== n && (r *= 100), t + "(" + r + s + ")";
}
const yd = /\b([a-z-]*)\(.*?\)/gu, yi = {
  ...be,
  getAnimatableNone: (e) => {
    const t = e.match(yd);
    return t ? t.map(gd).join(" ") : e;
  }
}, xi = {
  ...be,
  getAnimatableNone: (e) => {
    const t = be.parse(e);
    return be.createTransformer(e)(t.map((i) => typeof i == "number" ? 0 : typeof i == "object" ? { ...i, alpha: 1 } : i));
  }
}, lr = {
  ...xt,
  transform: Math.round
}, vi = {
  rotate: Re,
  /**
   * Internal channel for `transition.path` orientToPath. Composed onto
   * `rotate` at the transform-build sites so the user's `rotate` is
   * never read or overwritten. Not part of `transformPropOrder`.
   */
  pathRotation: Re,
  rotateX: Re,
  rotateY: Re,
  rotateZ: Re,
  scale: Qt,
  scaleX: Qt,
  scaleY: Qt,
  scaleZ: Qt,
  skew: Re,
  skewX: Re,
  skewY: Re,
  distance: V,
  translateX: V,
  translateY: V,
  translateZ: V,
  x: V,
  y: V,
  z: V,
  perspective: V,
  transformPerspective: V,
  opacity: Ft,
  originX: ir,
  originY: ir,
  originZ: V
}, Ve = {
  // Border props
  borderWidth: V,
  borderTopWidth: V,
  borderRightWidth: V,
  borderBottomWidth: V,
  borderLeftWidth: V,
  borderRadius: V,
  borderTopLeftRadius: V,
  borderTopRightRadius: V,
  borderBottomRightRadius: V,
  borderBottomLeftRadius: V,
  // Positioning props
  width: V,
  maxWidth: V,
  height: V,
  maxHeight: V,
  top: V,
  right: V,
  bottom: V,
  left: V,
  inset: V,
  insetBlock: V,
  insetBlockStart: V,
  insetBlockEnd: V,
  insetInline: V,
  insetInlineStart: V,
  insetInlineEnd: V,
  // Spacing props
  padding: V,
  paddingTop: V,
  paddingRight: V,
  paddingBottom: V,
  paddingLeft: V,
  paddingBlock: V,
  paddingBlockStart: V,
  paddingBlockEnd: V,
  paddingInline: V,
  paddingInlineStart: V,
  paddingInlineEnd: V,
  margin: V,
  marginTop: V,
  marginRight: V,
  marginBottom: V,
  marginLeft: V,
  marginBlock: V,
  marginBlockStart: V,
  marginBlockEnd: V,
  marginInline: V,
  marginInlineStart: V,
  marginInlineEnd: V,
  // Typography
  fontSize: V,
  // Misc
  backgroundPositionX: V,
  backgroundPositionY: V,
  ...vi,
  zIndex: lr,
  // SVG
  fillOpacity: Ft,
  strokeOpacity: Ft,
  numOctaves: lr
}, xd = {
  ...Ve,
  // Color props
  color: le,
  backgroundColor: le,
  outlineColor: le,
  fill: le,
  stroke: le,
  // Border props
  borderColor: le,
  borderTopColor: le,
  borderRightColor: le,
  borderBottomColor: le,
  borderLeftColor: le,
  filter: yi,
  WebkitFilter: yi,
  mask: xi,
  WebkitMask: xi
}, $a = (e) => xd[e], vd = /* @__PURE__ */ new Set([yi, xi]);
function gs(e, t) {
  let n = $a(e);
  return vd.has(n) || (n = be), n.getAnimatableNone ? n.getAnimatableNone(t) : void 0;
}
function bd(e) {
  for (let t = 1; t < e.length; t++)
    e[t] ?? (e[t] = e[t - 1]);
}
const Ye = (e) => e * 180 / Math.PI, bi = (e) => {
  const t = Ye(Math.atan2(e[1], e[0]));
  return wi(t);
}, wd = {
  x: 4,
  y: 5,
  translateX: 4,
  translateY: 5,
  scaleX: 0,
  scaleY: 3,
  scale: (e) => (Math.abs(e[0]) + Math.abs(e[3])) / 2,
  rotate: bi,
  rotateZ: bi,
  skewX: (e) => Ye(Math.atan(e[1])),
  skewY: (e) => Ye(Math.atan(e[2])),
  skew: (e) => (Math.abs(e[1]) + Math.abs(e[2])) / 2
}, wi = (e) => (e = e % 360, e < 0 && (e += 360), e), cr = bi, ur = (e) => Math.sqrt(e[0] * e[0] + e[1] * e[1]), dr = (e) => Math.sqrt(e[4] * e[4] + e[5] * e[5]), kd = {
  x: 12,
  y: 13,
  z: 14,
  translateX: 12,
  translateY: 13,
  translateZ: 14,
  scaleX: ur,
  scaleY: dr,
  scale: (e) => (ur(e) + dr(e)) / 2,
  rotateX: (e) => wi(Ye(Math.atan2(e[6], e[5]))),
  rotateY: (e) => wi(Ye(Math.atan2(-e[2], e[0]))),
  rotateZ: cr,
  rotate: cr,
  skewX: (e) => Ye(Math.atan(e[4])),
  skewY: (e) => Ye(Math.atan(e[1])),
  skew: (e) => (Math.abs(e[1]) + Math.abs(e[4])) / 2
};
function ki(e) {
  return e.includes("scale") ? 1 : 0;
}
function Ti(e, t) {
  if (!e || e === "none")
    return ki(t);
  const n = e.match(/^matrix3d\(([-\d.e\s,]+)\)$/u);
  let i, s;
  if (n)
    i = kd, s = n;
  else {
    const a = e.match(/^matrix\(([-\d.e\s,]+)\)$/u);
    i = wd, s = a;
  }
  if (!s)
    return ki(t);
  const r = i[t], o = s[1].split(",").map(Td);
  return typeof r == "function" ? r(o) : o[r];
}
const ja = (e, t) => {
  const { transform: n = "none" } = getComputedStyle(e);
  return Ti(n, t);
};
function Td(e) {
  return parseFloat(e.trim());
}
const We = [
  "transformPerspective",
  "x",
  "y",
  "z",
  "translateX",
  "translateY",
  "translateZ",
  "scale",
  "scaleX",
  "scaleY",
  "rotate",
  "rotateX",
  "rotateY",
  "rotateZ",
  "skew",
  "skewX",
  "skewY"
], Be = /* @__PURE__ */ new Set([...We, "pathRotation"]), fr = (e) => e === xt || e === V, Sd = /* @__PURE__ */ new Set(["x", "y", "z"]), Nd = We.filter((e) => !Sd.has(e));
function Ad(e) {
  const t = [];
  return Nd.forEach((n) => {
    const i = e.getValue(n);
    if (i !== void 0) {
      const s = i.get(), r = n.startsWith("scale") ? 1 : 0;
      if (s === r)
        return;
      t.push([n, s]), i.set(r);
    }
  }), t;
}
const Pd = /* @__PURE__ */ new Set(["bottom", "right"]);
function hr(e, t, n, i, s, r) {
  const o = parseFloat(e);
  if (!isNaN(o))
    return o;
  const { min: a, max: l } = t()[n], u = l - a;
  return r === "border-box" ? u : u - parseFloat(i) - parseFloat(s);
}
const Xe = {
  // Dimensions
  width: ({ width: e, paddingLeft: t = "0", paddingRight: n = "0", boxSizing: i }, s) => hr(e, s, "x", t, n, i),
  height: ({ height: e, paddingTop: t = "0", paddingBottom: n = "0", boxSizing: i }, s) => hr(e, s, "y", t, n, i),
  top: ({ top: e }) => parseFloat(e),
  left: ({ left: e }) => parseFloat(e),
  bottom: ({ top: e }, t) => {
    const { y: n } = t();
    return parseFloat(e) + (n.max - n.min);
  },
  right: ({ left: e }, t) => {
    const { x: n } = t();
    return parseFloat(e) + (n.max - n.min);
  },
  // Transform
  x: ({ transform: e }) => Ti(e, "x"),
  y: ({ transform: e }) => Ti(e, "y")
};
Xe.translateX = Xe.x;
Xe.translateY = Xe.y;
const Ze = /* @__PURE__ */ new Set();
let Si = !1, Ni = !1, Ai = !1;
function Ua() {
  if (Ni) {
    const e = [], t = /* @__PURE__ */ new Set(), n = /* @__PURE__ */ new Set();
    Ze.forEach((s) => {
      s.needsMeasurement && (e.push(s), t.add(s.element), Pd.has(s.name) && n.add(s.element));
    });
    const i = /* @__PURE__ */ new Map();
    n.forEach((s) => {
      const r = Ad(s);
      r.length && (i.set(s, r), s.render());
    }), e.forEach((s) => s.measureInitialState()), t.forEach((s) => {
      s.render();
      const r = i.get(s);
      r && r.forEach(([o, a]) => {
        s.getValue(o)?.set(a);
      });
    }), e.forEach((s) => s.measureEndState()), e.forEach((s) => {
      s.suspendedScrollY !== void 0 && window.scrollTo(0, s.suspendedScrollY);
    });
  }
  Ni = !1, Si = !1, Ze.forEach((e) => e.complete(Ai)), Ze.clear();
}
function za() {
  Ze.forEach((e) => {
    e.readKeyframes(), e.needsMeasurement && (Ni = !0);
  });
}
function Md() {
  Ai = !0, za(), Ua(), Ai = !1;
}
function Cd(e, t, n) {
  if (typeof e == "string") {
    if (ns(e) || ss(e))
      return parseFloat(e);
    if (!be.test(e) && be.test(n))
      return gs(t, n);
  }
  return e ?? void 0;
}
class ys {
  constructor(t, n, i, s, r, o = !1) {
    this.state = "pending", this.isAsync = !1, this.needsMeasurement = !1, this.unresolvedKeyframes = [...t], this.onComplete = n, this.name = i, this.motionValue = s, this.element = r, this.isAsync = o;
  }
  scheduleResolve() {
    this.state = "scheduled", this.isAsync ? (Ze.add(this), Si || (Si = !0, K.read(za), K.resolveKeyframes(Ua))) : (this.readKeyframes(), this.complete());
  }
  readKeyframes() {
    const { unresolvedKeyframes: t, name: n, element: i, motionValue: s } = this;
    if (t[0] === null) {
      const r = s?.get(), o = t[t.length - 1];
      if (r !== void 0)
        t[0] = r;
      else if (i && n) {
        const a = Cd(i.readValue(n, o), n, o);
        a !== void 0 && (t[0] = a);
      }
      t[0] === void 0 && (t[0] = o), s && r === void 0 && s.set(t[0]);
    }
    bd(t);
  }
  setFinalKeyframe() {
  }
  measureInitialState() {
  }
  renderEndStyles() {
  }
  measureEndState() {
  }
  complete(t = !1) {
    this.state = "complete", this.onComplete(this.unresolvedKeyframes, this.finalKeyframe, t), Ze.delete(this);
  }
  cancel() {
    this.state === "scheduled" && (Ze.delete(this), this.state = "pending");
  }
  resume() {
    this.state === "pending" && this.scheduleResolve();
  }
}
const xs = (e) => e.startsWith("--");
function Wa(e, t, n) {
  xs(t) ? e.style.setProperty(t, n) : e.style[t] = n;
}
const Ed = {};
function _a(e, t) {
  const n = /* @__PURE__ */ oa(e);
  return () => Ed[t] ?? n();
}
const Dd = /* @__PURE__ */ _a(() => window.ScrollTimeline !== void 0, "scrollTimeline"), Ga = /* @__PURE__ */ _a(() => {
  try {
    document.createElement("div").animate({ opacity: 0 }, { easing: "linear(0, 1)" });
  } catch {
    return !1;
  }
  return !0;
}, "linearEasing"), Pt = ([e, t, n, i]) => `cubic-bezier(${e}, ${t}, ${n}, ${i})`, pr = {
  linear: "linear",
  ease: "ease",
  easeIn: "ease-in",
  easeOut: "ease-out",
  easeInOut: "ease-in-out",
  circIn: /* @__PURE__ */ Pt([0, 0.65, 0.55, 1]),
  circOut: /* @__PURE__ */ Pt([0.55, 0, 1, 0.45]),
  backIn: /* @__PURE__ */ Pt([0.31, 0.01, 0.66, -0.59]),
  backOut: /* @__PURE__ */ Pt([0.33, 1.53, 0.69, 0.99])
};
function Ka(e, t) {
  if (e)
    return typeof e == "function" ? Ga() ? Ca(e, t) : "ease-out" : /* @__PURE__ */ xa(e) ? Pt(e) : Array.isArray(e) ? e.map((n) => Ka(n, t) || pr.easeOut) : pr[e];
}
function Vd(e, t, n, { delay: i = 0, duration: s = 300, repeat: r = 0, repeatType: o = "loop", ease: a = "easeOut", times: l } = {}, u = void 0) {
  const d = {
    [t]: n
  };
  l && (d.offset = l);
  const h = Ka(a, s);
  Array.isArray(h) && (d.easing = h);
  const f = {
    delay: i,
    duration: s,
    easing: Array.isArray(h) ? "linear" : h,
    fill: "both",
    iterations: r + 1,
    direction: o === "reverse" ? "alternate" : "normal"
  };
  return u && (f.pseudoElement = u), e.animate(d, f);
}
function vs(e) {
  return typeof e == "function" && "applyToOptions" in e;
}
function Rd({ type: e, ...t }) {
  return vs(e) && Ga() ? e.applyToOptions(t) : (t.duration ?? (t.duration = 300), t.ease ?? (t.ease = "easeOut"), t);
}
class Ha extends ms {
  constructor(t) {
    if (super(), this.finishedTime = null, this.isStopped = !1, this.manualStartTime = null, !t)
      return;
    const { element: n, name: i, keyframes: s, pseudoElement: r, allowFlatten: o = !1, finalKeyframe: a, onComplete: l } = t;
    this.isPseudoElement = !!r, this.allowFlatten = o, this.options = t, we(typeof t.type != "string", `Mini animate() doesn't support "type" as a string.`, "mini-spring");
    const u = Rd(t);
    this.animation = Vd(n, i, s, u, r), u.autoplay === !1 && this.animation.pause(), this.animation.onfinish = () => {
      if (this.finishedTime = this.time, !r) {
        const d = Rn(s, this.options, a, this.speed);
        this.updateMotionValue && this.updateMotionValue(d), Wa(n, i, d), this.animation.cancel();
      }
      l?.(), this.notifyFinished();
    }, Ba(this, t, u);
  }
  play() {
    this.isStopped || (this.manualStartTime = null, this.animation.play(), this.state === "finished" && this.updateFinished());
  }
  pause() {
    this.animation.pause();
  }
  complete() {
    this.animation.finish?.();
  }
  cancel() {
    try {
      this.animation.cancel();
    } catch {
    }
  }
  stop() {
    if (this.isStopped)
      return;
    this.isStopped = !0;
    const { state: t } = this;
    t === "idle" || t === "finished" || (this.updateMotionValue ? this.updateMotionValue() : this.commitStyles(), this.isPseudoElement || this.cancel());
  }
  /**
   * WAAPI doesn't natively have any interruption capabilities.
   *
   * In this method, we commit styles back to the DOM before cancelling
   * the animation.
   *
   * This is designed to be overridden by NativeAnimationExtended, which
   * will create a renderless JS animation and sample it twice to calculate
   * its current value, "previous" value, and therefore allow
   * Motion to also correctly calculate velocity for any subsequent animation
   * while deferring the commit until the next animation frame.
   */
  commitStyles() {
    const t = this.options?.element;
    !this.isPseudoElement && t?.isConnected && this.animation.commitStyles?.();
  }
  get duration() {
    const t = this.animation.effect?.getComputedTiming?.().duration || 0;
    return /* @__PURE__ */ xe(Number(t));
  }
  get iterationDuration() {
    const { delay: t = 0 } = this.options || {};
    return this.duration + /* @__PURE__ */ xe(t);
  }
  get time() {
    return /* @__PURE__ */ xe(Number(this.animation.currentTime) || 0);
  }
  set time(t) {
    const n = this.finishedTime !== null;
    this.manualStartTime = null, this.finishedTime = null, this.animation.currentTime = /* @__PURE__ */ ye(t), n && this.animation.pause();
  }
  /**
   * The playback speed of the animation.
   * 1 = normal speed, 2 = double speed, 0.5 = half speed.
   */
  get speed() {
    return this.animation.playbackRate;
  }
  set speed(t) {
    t < 0 && (this.finishedTime = null), this.animation.playbackRate = t;
  }
  get state() {
    return this.finishedTime !== null ? "finished" : this.animation.playState;
  }
  get startTime() {
    return this.manualStartTime ?? Number(this.animation.startTime);
  }
  set startTime(t) {
    this.manualStartTime = this.animation.startTime = t;
  }
  /**
   * Attaches a timeline to the animation, for instance the `ScrollTimeline`.
   */
  attachTimeline({ timeline: t, rangeStart: n, rangeEnd: i, observe: s }) {
    return this.allowFlatten && this.animation.effect?.updateTiming({ easing: "linear" }), this.animation.onfinish = null, t && Dd() ? (this.animation.timeline = t, n && (this.animation.rangeStart = n), i && (this.animation.rangeEnd = i), Ae) : s(this);
  }
}
const qa = {
  anticipate: fa,
  backInOut: da,
  circInOut: pa
};
function Ld(e) {
  return e in qa;
}
function Fd(e) {
  typeof e.ease == "string" && Ld(e.ease) && (e.ease = qa[e.ease]);
}
const qn = 10;
class Od extends Ha {
  constructor(t) {
    Fd(t), Oa(t), super(t), t.startTime !== void 0 && t.autoplay !== !1 && (this.startTime = t.startTime), this.options = t;
  }
  /**
   * WAAPI doesn't natively have any interruption capabilities.
   *
   * Rather than read committed styles back out of the DOM, we can
   * create a renderless JS animation and sample it twice to calculate
   * its current value, "previous" value, and therefore allow
   * Motion to calculate velocity for any subsequent animation.
   */
  updateMotionValue(t) {
    const { motionValue: n, onUpdate: i, onComplete: s, element: r, ...o } = this.options;
    if (!n)
      return;
    if (t !== void 0) {
      n.set(t);
      return;
    }
    const a = new kn({
      ...o,
      autoplay: !1
    }), l = Math.max(qn, fe.now() - this.startTime), u = Pe(0, qn, l - qn), d = a.sample(l).value, { name: h } = this.options;
    r && h && Wa(r, h, d), n.setWithVelocity(a.sample(Math.max(0, l - u)).value, d, u), a.stop();
  }
}
const mr = (e, t) => t === "zIndex" ? !1 : !!(typeof e == "number" || Array.isArray(e) || typeof e == "string" && // It's animatable if we have a string
(be.test(e) || e === "0") && // And it contains numbers and/or colors
!e.startsWith("url("));
function Id(e) {
  const t = e[0];
  if (e.length === 1)
    return !0;
  for (let n = 0; n < e.length; n++)
    if (e[n] !== t)
      return !0;
}
function Bd(e, t, n, i) {
  const s = e[0];
  if (s === null)
    return !1;
  if (t === "display" || t === "visibility")
    return !0;
  const r = e[e.length - 1], o = mr(s, t), a = mr(r, t);
  return !o || !a ? (o !== a && tt(!1, `You are trying to animate ${t} from "${s}" to "${r}". "${o ? r : s}" is not an animatable value.`, "value-not-animatable"), !1) : Id(e) || (n === "spring" || vs(n)) && i;
}
function Pi(e) {
  e.duration = 0, e.type = "keyframes";
}
const Mi = /* @__PURE__ */ new Set([
  "opacity",
  "clipPath",
  "filter",
  "transform",
  "backgroundColor"
]), $d = /^(?:oklch|oklab|lab|lch|color|color-mix|light-dark)\(/;
function jd(e) {
  for (let t = 0; t < e.length; t++)
    if (typeof e[t] == "string" && $d.test(e[t]))
      return !0;
  return !1;
}
const gr = /* @__PURE__ */ new Set([
  "color",
  "backgroundColor",
  "outlineColor",
  "fill",
  "stroke",
  "borderColor",
  "borderTopColor",
  "borderRightColor",
  "borderBottomColor",
  "borderLeftColor"
]), Ud = /* @__PURE__ */ oa(() => Object.hasOwnProperty.call(Element.prototype, "animate"));
function zd(e) {
  const { motionValue: t, name: n, repeatDelay: i, repeatType: s, damping: r, type: o, keyframes: a } = e;
  if (!n || !(Mi.has(n) || gr.has(n)))
    return !1;
  const l = t?.owner?.current;
  if (!(l instanceof HTMLElement) && !(l instanceof SVGElement))
    return !1;
  const { onUpdate: u, transformTemplate: d } = t.owner.getProps();
  return Ud() && /**
   * Force WAAPI for color properties with browser-only color formats
   * (oklch, oklab, lab, lch, etc.) that the JS animation path can't parse.
   */
  (Mi.has(n) || gr.has(n) && jd(a)) && (n !== "transform" || !d) && /**
   * If we're outputting values to onUpdate then we can't use WAAPI as there's
   * no way to read the value from WAAPI every frame.
   */
  !u && !i && s !== "mirror" && r !== 0 && o !== "inertia";
}
const Wd = 40;
class _d extends ms {
  constructor(t) {
    super(), this.stop = () => {
      this._animation && (this._animation.stop(), this.stopTimeline?.()), this.keyframeResolver?.cancel();
    }, this.createdAt = fe.now();
    const { keyframes: n, name: i, motionValue: s, element: r } = t, o = t;
    o.autoplay ?? (o.autoplay = !0), o.delay ?? (o.delay = 0), o.type ?? (o.type = "keyframes"), o.repeat ?? (o.repeat = 0), o.repeatDelay ?? (o.repeatDelay = 0), o.repeatType ?? (o.repeatType = "loop");
    const a = r?.KeyframeResolver || ys;
    this.keyframeResolver = new a(n, (l, u, d) => this.onKeyframesResolved(l, u, o, !d), i, s, r), this.keyframeResolver?.scheduleResolve();
  }
  onKeyframesResolved(t, n, i, s) {
    this.keyframeResolver = void 0;
    const { name: r, type: o, velocity: a, delay: l, isHandoff: u, onUpdate: d } = i;
    this.resolvedAt = fe.now();
    let h = !0;
    Bd(t, r, o, a) || (h = !1, (Le.instantAnimations || !l) && d?.(Rn(t, i, n)), t[0] = t[t.length - 1], Pi(i), i.repeat = 0);
    const f = s ? this.resolvedAt ? this.resolvedAt - this.createdAt > Wd ? this.resolvedAt : this.createdAt : this.createdAt : void 0, { onComplete: p } = i;
    i.startTime ?? (i.startTime = f), i.finalKeyframe = n, i.keyframes = t, i.onComplete = () => {
      p?.(), this.notifyFinished();
    };
    const m = h && !u && zd(i);
    let x;
    if (m) {
      i.element = i.motionValue?.owner?.current;
      try {
        x = new Od(i);
      } catch {
        x = new kn(i);
      }
    } else
      x = new kn(i);
    this.pendingTimeline && (this.stopTimeline = x.attachTimeline(this.pendingTimeline), this.pendingTimeline = void 0), this._animation = x;
  }
  get finished() {
    return this._animation ? this._animation.finished : super.finished;
  }
  then(t, n) {
    return this.finished.finally(t).then(() => {
    });
  }
  get animation() {
    return this._animation || (this.keyframeResolver?.resume(), Md()), this._animation;
  }
  get duration() {
    return this.animation.duration;
  }
  get iterationDuration() {
    return this.animation.iterationDuration;
  }
  get time() {
    return this.animation.time;
  }
  set time(t) {
    this.animation.time = t;
  }
  get speed() {
    return this.animation.speed;
  }
  get state() {
    return this.animation.state;
  }
  set speed(t) {
    this.animation.speed = t;
  }
  get startTime() {
    return this.animation.startTime;
  }
  attachTimeline(t) {
    return this._animation ? this.stopTimeline = this.animation.attachTimeline(t) : this.pendingTimeline = t, () => this.stop();
  }
  play() {
    this.animation.play();
  }
  pause() {
    this.animation.pause();
  }
  complete() {
    this.animation.complete();
  }
  cancel() {
    this._animation && this.animation.cancel(), this.keyframeResolver?.cancel();
  }
}
class Gd {
  constructor(t) {
    this.stop = () => this.runAll("stop"), this.animations = t.filter(Boolean);
  }
  get finished() {
    return Promise.all(this.animations.map((t) => t.finished));
  }
  /**
   * TODO: Filter out cancelled or stopped animations before returning
   */
  getAll(t) {
    return this.animations[0][t];
  }
  setAll(t, n) {
    for (let i = 0; i < this.animations.length; i++)
      this.animations[i][t] = n;
  }
  attachTimeline(t) {
    const n = this.animations.map((i) => i.attachTimeline(t));
    return () => {
      n.forEach((i, s) => {
        i && i(), this.animations[s].stop();
      });
    };
  }
  get time() {
    return this.getAll("time");
  }
  set time(t) {
    this.setAll("time", t);
  }
  get speed() {
    return this.getAll("speed");
  }
  set speed(t) {
    this.setAll("speed", t);
  }
  get state() {
    return this.getAll("state");
  }
  get startTime() {
    return this.getAll("startTime");
  }
  get duration() {
    return yr(this.animations, "duration");
  }
  get iterationDuration() {
    return yr(this.animations, "iterationDuration");
  }
  runAll(t) {
    this.animations.forEach((n) => n[t]());
  }
  play() {
    this.runAll("play");
  }
  pause() {
    this.runAll("pause");
  }
  cancel() {
    this.runAll("cancel");
  }
  complete() {
    this.runAll("complete");
  }
}
function yr(e, t) {
  let n = 0;
  for (let i = 0; i < e.length; i++) {
    const s = e[i][t];
    s !== null && s > n && (n = s);
  }
  return n;
}
class Kd extends Gd {
  then(t, n) {
    return this.finished.finally(t).then(() => {
    });
  }
}
function Ya(e, t, n, i = 0, s = 1) {
  const r = Array.from(e).sort((u, d) => u.sortNodePosition(d)).indexOf(t), o = e.size, a = (o - 1) * i;
  return typeof n == "function" ? n(r, o) : s === 1 ? r * i : a - r * i;
}
const xr = 30, Hd = (e) => !isNaN(parseFloat(e)), Mt = {
  current: void 0
};
class Ct {
  /**
   * @param init - The initiating value
   * @param config - Optional configuration options
   *
   * -  `transformer`: A function to transform incoming values with.
   */
  constructor(t, n = {}) {
    this.canTrackVelocity = null, this.events = {}, this.updateAndNotify = (i) => {
      const s = fe.now();
      if (this.updatedAt !== s && this.setPrevFrameValue(), this.prev = this.current, this.setCurrent(i), this.current !== this.prev && (this.notifyChange(), this.dependents))
        for (const r of this.dependents)
          r.dirty();
    }, this.hasAnimated = !1, this.setCurrent(t), this.owner = n.owner;
  }
  setCurrent(t) {
    this.current = t, this.updatedAt = fe.now(), this.canTrackVelocity === null && t !== void 0 && (this.canTrackVelocity = Hd(this.current));
  }
  setPrevFrameValue(t = this.current) {
    this.prevFrameValue = t, this.prevUpdatedAt = this.updatedAt;
  }
  /**
   * Adds a function that will be notified when the `MotionValue` is updated.
   *
   * It returns a function that, when called, will cancel the subscription.
   *
   * When calling `onChange` inside a React component, it should be wrapped with the
   * `useEffect` hook. As it returns an unsubscribe function, this should be returned
   * from the `useEffect` function to ensure you don't add duplicate subscribers..
   *
   * ```jsx
   * export const MyComponent = () => {
   *   const x = useMotionValue(0)
   *   const y = useMotionValue(0)
   *   const opacity = useMotionValue(1)
   *
   *   useEffect(() => {
   *     function updateOpacity() {
   *       const maxXY = Math.max(x.get(), y.get())
   *       const newOpacity = transform(maxXY, [0, 100], [1, 0])
   *       opacity.set(newOpacity)
   *     }
   *
   *     const unsubscribeX = x.on("change", updateOpacity)
   *     const unsubscribeY = y.on("change", updateOpacity)
   *
   *     return () => {
   *       unsubscribeX()
   *       unsubscribeY()
   *     }
   *   }, [])
   *
   *   return <motion.div style={{ x }} />
   * }
   * ```
   *
   * @param subscriber - A function that receives the latest value.
   * @returns A function that, when called, will cancel this subscription.
   *
   * @deprecated
   */
  onChange(t) {
    return process.env.NODE_ENV !== "production" && Vn(!1, 'value.onChange(callback) is deprecated. Switch to value.on("change", callback).'), this.on("change", t);
  }
  on(t, n) {
    var i;
    return t === "change" ? this.onChangeSubscribe(n) : ((i = this.events)[t] || (i[t] = new vn())).add(n);
  }
  onChangeSubscribe(t) {
    const { events: n } = this;
    return !n.change && !this.changeSubscriber ? this.changeSubscriber = t : (n.change || (n.change = new vn(), n.change.add(this.changeSubscriber), this.changeSubscriber = void 0), n.change.add(t)), () => {
      this.changeSubscriber === t ? this.changeSubscriber = void 0 : n.change?.remove(t), this.stopIfUnobserved();
    };
  }
  /**
   * If we have no more change listeners by the start
   * of the next frame, stop active animations.
   */
  stopIfUnobserved() {
    K.read(() => {
      !this.changeSubscriber && !this.events.change?.getSize() && this.stop();
    });
  }
  clearListeners() {
    this.changeSubscriber = void 0;
    for (const t in this.events)
      this.events[t].clear();
  }
  /**
   * Attaches a passive effect to the `MotionValue`.
   */
  attach(t, n) {
    this.passiveEffect = t, this.stopPassiveEffect = n;
  }
  /**
   * Sets the state of the `MotionValue`.
   *
   * @remarks
   *
   * ```jsx
   * const x = useMotionValue(0)
   * x.set(10)
   * ```
   *
   * @param latest - Latest value to set.
   * @param render - Whether to notify render subscribers. Defaults to `true`
   *
   * @public
   */
  set(t) {
    this.passiveEffect ? this.passiveEffect(t, this.updateAndNotify) : this.updateAndNotify(t);
  }
  setWithVelocity(t, n, i) {
    this.set(n), this.prev = void 0, this.prevFrameValue = t, this.prevUpdatedAt = this.updatedAt - i;
  }
  /**
   * Set the state of the `MotionValue`, stopping any active animations,
   * effects, and resets velocity to `0`.
   */
  jump(t, n = !0) {
    this.updateAndNotify(t), this.prev = t, this.prevUpdatedAt = this.prevFrameValue = void 0, n && this.stop(), this.stopPassiveEffect && this.stopPassiveEffect();
  }
  dirty() {
    this.notifyChange();
  }
  notifyChange() {
    const { current: t, changeSubscriber: n } = this;
    n ? n(t) : this.events.change?.notify(t);
  }
  addDependent(t) {
    this.dependents || (this.dependents = /* @__PURE__ */ new Set()), this.dependents.add(t);
  }
  removeDependent(t) {
    this.dependents && this.dependents.delete(t);
  }
  /**
   * Returns the latest state of `MotionValue`
   *
   * @returns - The latest state of `MotionValue`
   *
   * @public
   */
  get() {
    return Mt.current && Mt.current.push(this), this.current;
  }
  /**
   * @public
   */
  getPrevious() {
    return this.prev;
  }
  /**
   * Returns the latest velocity of `MotionValue`
   *
   * @returns - The latest velocity of `MotionValue`. Returns `0` if the state is non-numerical.
   *
   * @public
   */
  getVelocity() {
    const t = fe.now();
    if (!this.canTrackVelocity || this.prevFrameValue === void 0 || t - this.updatedAt > xr)
      return 0;
    const n = Math.min(this.updatedAt - this.prevUpdatedAt, xr);
    return /* @__PURE__ */ aa(parseFloat(this.current) - parseFloat(this.prevFrameValue), n);
  }
  /**
   * Registers a new animation to control this `MotionValue`. Only one
   * animation can drive a `MotionValue` at one time.
   *
   * ```jsx
   * value.start()
   * ```
   *
   * @param animation - A function that starts the provided animation
   */
  start(t) {
    return this.stop(), new Promise((n) => {
      this.hasAnimated = !0;
      let i = !1, s;
      s = t(() => {
        i = !0, this.events.animationComplete?.notify(), this.animation === s && this.clearAnimation(), n();
      }), i || (this.animation = s), this.events.animationStart?.notify();
    });
  }
  /**
   * Stop the currently active animation.
   *
   * @public
   */
  stop() {
    this.animation && (this.animation.stop(), this.events.animationCancel && this.events.animationCancel.notify()), this.clearAnimation();
  }
  /**
   * Returns `true` if this value is currently animating.
   *
   * @public
   */
  isAnimating() {
    return !!this.animation;
  }
  clearAnimation() {
    this.animation = void 0;
  }
  /**
   * Destroy and clean up subscribers to this `MotionValue`.
   *
   * The `MotionValue` hooks like `useMotionValue` and `useTransform` automatically
   * handle the lifecycle of the returned `MotionValue`, so this method is only necessary if you've manually
   * created a `MotionValue` via the `motionValue` function.
   *
   * @public
   */
  destroy() {
    this.dependents?.clear(), this.events.destroy?.notify(), this.clearListeners(), this.stop(), this.stopPassiveEffect && this.stopPassiveEffect();
  }
}
function Oe(e, t) {
  return new Ct(e, t);
}
function Xa(e, t) {
  if (e?.inherit && t) {
    const { inherit: n, ...i } = e;
    return { ...t, ...i };
  }
  return e;
}
function bs(e, t) {
  const n = e?.[t] ?? e?.default ?? e;
  return n !== e ? Xa(n, e) : n;
}
const qd = {
  type: "spring",
  stiffness: 500,
  damping: 25,
  restSpeed: 10
}, Yd = (e) => ({
  type: "spring",
  stiffness: 550,
  damping: e === 0 ? 2 * Math.sqrt(550) : 30,
  restSpeed: 10
}), Xd = {
  type: "keyframes",
  duration: 0.8
}, Zd = {
  type: "keyframes",
  ease: [0.25, 0.1, 0.35, 1],
  duration: 0.3
}, Qd = (e, { keyframes: t }) => t.length > 2 ? Xd : Be.has(e) ? e.startsWith("scale") ? Yd(t[1]) : qd : Zd, Jd = /* @__PURE__ */ new Set([
  "when",
  "delay",
  "delayChildren",
  "staggerChildren",
  "staggerDirection",
  "repeat",
  "repeatType",
  "repeatDelay",
  "from",
  "elapsed"
]);
function ef(e) {
  for (const t in e)
    if (!Jd.has(t))
      return !0;
  return !1;
}
const Ln = (e, t, n, i = {}, s, r) => (o) => {
  const a = bs(i, e) || {}, l = a.delay || i.delay || 0;
  let { elapsed: u = 0 } = i;
  u = u - /* @__PURE__ */ ye(l);
  const d = {
    keyframes: Array.isArray(n) ? n : [null, n],
    ease: "easeOut",
    velocity: t.getVelocity(),
    ...a,
    delay: -u,
    onUpdate: (f) => {
      t.set(f), a.onUpdate && a.onUpdate(f);
    },
    onComplete: () => {
      o(), a.onComplete && a.onComplete();
    },
    name: e,
    motionValue: t,
    element: r ? void 0 : s
  };
  ef(a) || Object.assign(d, Qd(e, d)), d.duration && (d.duration = /* @__PURE__ */ ye(d.duration)), d.repeatDelay && (d.repeatDelay = /* @__PURE__ */ ye(d.repeatDelay)), d.from !== void 0 && (d.keyframes[0] = d.from);
  let h = !1;
  if ((d.type === !1 || d.duration === 0 && !d.repeatDelay) && (Pi(d), d.delay === 0 && (h = !0)), (Le.instantAnimations || Le.skipAnimations || s?.shouldSkipAnimations || a.skipAnimations) && (h = !0, Pi(d), d.delay = 0), d.allowFlatten = !a.type && !a.ease, h && !r && t.get() !== void 0) {
    const f = Rn(d.keyframes, a);
    if (f !== void 0) {
      K.update(() => {
        d.onUpdate(f), d.onComplete();
      });
      return;
    }
  }
  return a.isSync ? new kn(d) : new _d(d);
}, tf = (
  // eslint-disable-next-line redos-detector/no-unsafe-regex -- false positive, as it can match a lot of words
  /^var\(--(?:([\w-]+)|([\w-]+), ?([a-zA-Z\d ()%#.,-]+))\)/u
);
function nf(e) {
  const t = tf.exec(e);
  if (!t)
    return [,];
  const [, n, i, s] = t;
  return [`--${n ?? i}`, s];
}
const sf = 4;
function Za(e, t, n = 1) {
  we(n <= sf, `Max CSS variable fallback depth detected in property "${e}". This may indicate a circular fallback dependency.`, "max-css-var-depth");
  const [i, s] = nf(e);
  if (!i)
    return;
  const r = window.getComputedStyle(t).getPropertyValue(i);
  if (r) {
    const o = r.trim();
    return ns(o) ? parseFloat(o) : o;
  }
  return ls(s) ? Za(s, t, n + 1) : s;
}
function vr(e) {
  const t = [{}, {}];
  return e?.values.forEach((n, i) => {
    t[0][i] = n.get(), t[1][i] = n.getVelocity();
  }), t;
}
function ws(e, t, n, i) {
  if (typeof t == "function") {
    const [s, r] = vr(i);
    t = t(n !== void 0 ? n : e.custom, s, r);
  }
  if (typeof t == "string" && (t = e.variants && e.variants[t]), typeof t == "function") {
    const [s, r] = vr(i);
    t = t(n !== void 0 ? n : e.custom, s, r);
  }
  return t;
}
function Qe(e, t, n) {
  const i = e.getProps();
  return ws(i, t, n !== void 0 ? n : i.custom, e);
}
const ks = /* @__PURE__ */ new Set([
  "width",
  "height",
  "top",
  "left",
  "right",
  "bottom",
  ...We
]), Ci = (e) => Array.isArray(e);
function rf(e, t, n) {
  e.hasValue(t) ? e.getValue(t).set(n) : e.addValue(t, Oe(n));
}
function of(e) {
  return Ci(e) ? e[e.length - 1] || 0 : e;
}
function af(e, t) {
  const n = Qe(e, t);
  let { transitionEnd: i = {}, transition: s = {}, ...r } = n || {};
  r = { ...r, ...i };
  for (const o in r) {
    const a = of(r[o]);
    rf(e, o, a);
  }
}
const ce = (e) => !!(e && e.getVelocity);
function lf(e) {
  return !!(ce(e) && e.add);
}
function Ei(e, t) {
  const n = e.getValue("willChange");
  if (lf(n))
    return n.add(t);
  if (!n && Le.WillChange) {
    const i = new Le.WillChange("auto");
    e.addValue("willChange", i), i.add(t);
  }
}
function Ht(e) {
  return e.replace(/([A-Z])/g, (t) => `-${t.toLowerCase()}`);
}
const cf = "framerAppearId", Qa = "data-" + Ht(cf);
function Ja(e) {
  return e.props[Qa];
}
const uf = typeof window < "u";
function df({ protectedKeys: e, needsAnimating: t }, n) {
  const i = e.hasOwnProperty(n) && t[n] !== !0;
  return t[n] = !1, i;
}
function el(e, t, { delay: n = 0, transitionOverride: i, type: s } = {}) {
  let { transition: r, transitionEnd: o, ...a } = t;
  const l = e.getDefaultTransition();
  r = r ? Xa(r, l) : l;
  const u = r?.reduceMotion, d = r?.skipAnimations;
  i && (r = i);
  const h = [], f = s && e.animationState && e.animationState.getState()[s], p = r?.path;
  p && p.animateVisualElement(e, a, r, n, h);
  for (const m in a) {
    const x = e.getValue(m, e.latestValues[m] ?? null), v = a[m];
    if (v === void 0 || f && df(f, m))
      continue;
    const w = {
      delay: n,
      ...bs(r || {}, m)
    };
    d && (w.skipAnimations = !0);
    const T = x.get();
    if (T !== void 0 && !x.isAnimating() && !Array.isArray(v) && v === T && !w.velocity) {
      K.update(() => x.set(v));
      continue;
    }
    let g = !1;
    if (uf && window.MotionHandoffAnimation) {
      const D = Ja(e);
      if (D) {
        const k = window.MotionHandoffAnimation(D, m, K);
        k !== null && (w.startTime = k, g = !0);
      }
    }
    Ei(e, m);
    const S = u ?? e.shouldReduceMotion;
    x.start(Ln(m, x, v, S && ks.has(m) ? { type: !1 } : w, e, g));
    const R = x.animation;
    R && h.push(R);
  }
  if (o) {
    const m = () => K.update(() => {
      o && af(e, o);
    });
    h.length ? Promise.all(h).then(m) : m();
  }
  return h;
}
function Di(e, t, n = {}) {
  const i = Qe(e, t, n.type === "exit" ? e.presenceContext?.custom : void 0);
  let { transition: s = e.getDefaultTransition() || {} } = i || {};
  n.transitionOverride && (s = n.transitionOverride);
  const r = i ? () => Promise.all(el(e, i, n)) : () => Promise.resolve(), o = e.variantChildren && e.variantChildren.size ? (l = 0) => {
    const { delayChildren: u = 0, staggerChildren: d, staggerDirection: h } = s;
    return ff(e, t, l, u, d, h, n);
  } : () => Promise.resolve(), { when: a } = s;
  if (a) {
    const [l, u] = a === "beforeChildren" ? [r, o] : [o, r];
    return l().then(() => u());
  } else
    return Promise.all([r(), o(n.delay)]);
}
function ff(e, t, n = 0, i = 0, s = 0, r = 1, o) {
  const a = [];
  for (const l of e.variantChildren)
    l.notify("AnimationStart", t), a.push(Di(l, t, {
      ...o,
      delay: n + (typeof i == "function" ? 0 : i) + Ya(e.variantChildren, l, i, s, r)
    }).then(() => l.notify("AnimationComplete", t)));
  return Promise.all(a);
}
function hf(e, t, n = {}) {
  e.notify("AnimationStart", t);
  let i;
  if (Array.isArray(t)) {
    const s = t.map((r) => Di(e, r, n));
    i = Promise.all(s);
  } else if (typeof t == "string")
    i = Di(e, t, n);
  else {
    const s = typeof t == "function" ? Qe(e, t, n.custom) : t;
    i = Promise.all(el(e, s, n));
  }
  return i.then(() => {
    e.notify("AnimationComplete", t);
  });
}
const pf = {
  test: (e) => e === "auto",
  parse: (e) => e
}, mf = (e) => (t) => t.test(e), gf = [xt, V, De, Re, Ru, Vu, pf], br = (e) => gf.find(mf(e));
function yf(e) {
  return typeof e == "number" ? e === 0 : e !== null ? e === "none" || e === "0" || ss(e) : !0;
}
const xf = /* @__PURE__ */ new Set(["auto", "none", "0"]);
function vf(e, t, n) {
  let i = 0, s;
  for (; i < e.length && !s; ) {
    const r = e[i];
    typeof r == "string" && !xf.has(r) && $u(r) && (s = e[i]), i++;
  }
  if (s && n)
    for (const r of t)
      e[r] !== s && (e[r] = gs(n, s));
}
class tl extends ys {
  constructor(t, n, i, s, r) {
    super(t, n, i, s, r, !0);
  }
  readKeyframes() {
    const { unresolvedKeyframes: t, element: n, name: i } = this;
    if (!n || !n.current)
      return;
    super.readKeyframes();
    for (let d = 0; d < t.length; d++) {
      let h = t[d];
      if (typeof h == "string" && (h = h.trim(), ls(h))) {
        const f = Za(h, n.current);
        f !== void 0 && (t[d] = f), d === t.length - 1 && (this.finalKeyframe = h);
      }
    }
    if (this.resolveNoneKeyframes(), !ks.has(i) || t.length !== 2)
      return;
    const [s, r] = t;
    if (typeof s == "number" && typeof r == "number")
      return;
    const o = br(s), a = br(r), l = nr(s), u = nr(r);
    if (l !== u && Xe[i]) {
      this.needsMeasurement = !0;
      return;
    }
    if (o !== a)
      if (fr(o) && fr(a))
        for (let d = 0; d < t.length; d++) {
          const h = t[d];
          typeof h == "string" && (t[d] = parseFloat(h));
        }
      else Xe[i] && (this.needsMeasurement = !0);
  }
  resolveNoneKeyframes() {
    const { unresolvedKeyframes: t, name: n } = this, i = [];
    for (let s = 0; s < t.length; s++)
      (t[s] === null || yf(t[s])) && i.push(s);
    i.length && vf(t, i, n);
  }
  measure() {
    const { element: t, name: n } = this;
    return Xe[n](window.getComputedStyle(t.current), () => t.measureViewportBox());
  }
  measureInitialState() {
    const { element: t, unresolvedKeyframes: n, name: i } = this;
    if (!t || !t.current)
      return;
    i === "height" && (this.suspendedScrollY = window.pageYOffset), this.measuredOrigin = this.measure(), n[0] = this.measuredOrigin;
    const s = n[n.length - 1];
    s !== void 0 && this.motionValue?.jump(s, !1);
  }
  measureEndState() {
    const { element: t, unresolvedKeyframes: n } = this;
    if (!t || !t.current)
      return;
    this.motionValue?.jump(this.measuredOrigin, !1);
    const i = n.length - 1, s = n[i];
    n[i] = this.measure(), s !== null && this.finalKeyframe === void 0 && (this.finalKeyframe = s), this.removedTransforms?.length && this.removedTransforms.forEach(([r, o]) => {
      t.getValue(r).set(o);
    }), this.resolveNoneKeyframes();
  }
}
const Ts = [
  "borderTopLeftRadius",
  "borderTopRightRadius",
  "borderBottomRightRadius",
  "borderBottomLeftRadius"
], Ss = [];
function bf(e) {
  we(typeof e.test == "function" && typeof e.read == "function", "Effects passed to animate.addEffect() need test() and read().", "effect-missing-test"), nl(e), Ss.unshift(e);
}
function nl(e) {
  Je(Ss, e);
}
function wf(e) {
  return Ss.find((t) => t.test(e));
}
function il(e, t, n = {}, i) {
  const s = [], { velocity: r } = n, o = n.reduceMotion ?? i?.shouldReduceMotion;
  for (const l in t) {
    if (l === "transition" || l === "transitionEnd")
      continue;
    const u = t[l];
    if (u === void 0)
      continue;
    const d = e(l), h = d.get();
    if (h !== void 0 && !d.isAnimating() && !Array.isArray(u) && u === h && !r) {
      K.update(() => d.set(u));
      continue;
    }
    d.start(Ln(l, d, u, o && ks.has(l) ? { type: !1 } : n, i)), d.animation && s.push(d.animation);
  }
  const { transitionEnd: a } = t;
  if (a) {
    const l = () => K.update(() => {
      for (const u in a)
        e(u).set(a[u]);
    });
    s.length ? Promise.all(s).then(l) : l();
  }
  return s;
}
function sl(e, t, n, i, s) {
  return il((r) => {
    let o = e.get(t, r);
    if (!o) {
      let a;
      if (!s) {
        const l = n[r];
        a = kf(l) ?? e.read(t, r, l), we(a !== void 0, `"${r}" can't be read from the animated subject. Provide [from, to] keyframes.`, "effect-unreadable-value");
      }
      o = Oe(a, { owner: s }), e(t, { [r]: o });
    }
    return o;
  }, n, i, s);
}
function kf(e) {
  const t = Array.isArray(e) ? e[0] : void 0;
  return t === null ? void 0 : t;
}
function ht(e) {
  return is(e) && "offsetHeight" in e && !("ownerSVGElement" in e);
}
function vt(e) {
  return is(e) && "ownerSVGElement" in e;
}
const Ie = (e, t) => t && typeof e == "number" ? t.transform(e) : e;
function Ns(e, t, n) {
  if (e == null)
    return [];
  if (e instanceof EventTarget)
    return [e];
  if (typeof e == "string") {
    let i = document;
    t && (i = t.current);
    const s = n?.[e] ?? i.querySelectorAll(e);
    return s ? Array.from(s) : [];
  }
  return Array.from(e).filter((i) => i != null);
}
class Tf {
  /**
   * @param step - The frameloop step renders are scheduled in. Defaults
   * to `frame.render`. Effects that feed a render loop running in
   * `frame.render` (GPU scenes) should write in `frame.preRender`.
   */
  constructor(t = K.render) {
    this.step = t, this.values = /* @__PURE__ */ new Map(), this.pending = [], this.numPending = 0, this.flush = () => {
      const { pending: n, numPending: i } = this;
      this.numPending = 0;
      for (let s = 0; s < i; s++)
        n[s]();
    };
  }
  /**
   * @param render - Writes the value to the subject. Renders read the
   * motion value directly rather than a cached copy, so there is one
   * place a value lives.
   * @param computed - A value already in this state (e.g. `transform`)
   * whose render should run whenever `value` changes.
   */
  set(t, n, i, s) {
    if (this.values.get(t)?.onRemove(), s)
      for (const l of this.values.values())
        l.value === s && (i = l.render);
    const r = () => i && this.schedule(i);
    n.get() !== void 0 && r();
    const o = n.on("change", r), a = () => {
      o(), i && !s && this.cancel(i), this.values.delete(t);
    };
    return this.values.set(t, {
      value: n,
      render: s ? void 0 : i,
      onRemove: a
    }), a;
  }
  get(t) {
    return this.values.get(t)?.value;
  }
  /**
   * Detach every value from this state and return them, so another
   * renderer can take them over. The state stays cached by its effect,
   * so the bound transforms are reset too rather than leaking into
   * values bound later.
   */
  release() {
    const t = /* @__PURE__ */ new Map();
    return this.values.forEach((n, i) => {
      t.set(i, n.value), n.onRemove();
    }), this.transformKeys = this.transformValues = void 0, t;
  }
  schedule(t) {
    const { pending: n, numPending: i } = this;
    for (let s = 0; s < i; s++)
      if (n[s] === t)
        return;
    i || this.step(this.flush), n[this.numPending++] = t;
  }
  cancel(t) {
    const { pending: n } = this;
    for (let i = 0; i < this.numPending; i++)
      if (n[i] === t) {
        n[i] = n[--this.numPending];
        return;
      }
  }
}
function As(e, { step: t, ...n } = {}) {
  const i = /* @__PURE__ */ new WeakMap();
  return Object.assign((r, o) => {
    const a = i.get(r) ?? new Tf(t);
    i.set(r, a);
    const l = [];
    for (const u in o) {
      const d = o[u], h = e(r, a, u, d);
      l.push(h);
    }
    return () => {
      for (const u of l)
        u();
    };
  }, n, {
    get: (r, o) => i.get(r)?.get(o),
    flush: (r) => i.get(r)?.flush(),
    state: (r) => i.get(r)
  });
}
const Sf = {
  x: "translateX",
  y: "translateY",
  z: "translateZ",
  transformPerspective: "perspective"
}, wr = {};
function Nf(e) {
  let t = "";
  const { transformKeys: n = [], transformValues: i = {} } = e;
  for (let r = 0; r < n.length; r++) {
    const o = n[r], a = i[o].get();
    if (a === void 0)
      continue;
    (typeof a == "number" ? a : parseFloat(a)) !== (o.startsWith("scale") ? 1 : 0) && (t += (t && " ") + (wr[o] || (wr[o] = (Sf[o] || o) + "(")) + Ie(a, vi[o]) + ")");
  }
  const s = e.get("pathRotation")?.get();
  return s && (t += (t && " ") + "rotate(" + Ie(s, vi.pathRotation) + ")"), t || "none";
}
const Af = /* @__PURE__ */ new Set(["originX", "originY", "originZ"]), Yn = (e, t) => Ie(e.get(t)?.get(), Ve[t]), Ps = (e, t, n, i) => {
  let s, r;
  if (Be.has(n)) {
    if (n !== "pathRotation") {
      const o = t.transformKeys ?? (t.transformKeys = []);
      (t.transformValues ?? (t.transformValues = {}))[n] = i, o.includes(n) || (o.push(n), o.sort((a, l) => We.indexOf(a) - We.indexOf(l)));
    }
    t.get("transform") || (!ht(e) && !t.get("transformBox") && Ps(e, t, "transformBox", new Ct("fill-box")), t.set("transform", new Ct("none"), () => {
      e.style.transform = Nf(t);
    })), r = t.get("transform");
  } else Af.has(n) ? (t.get("transformOrigin") || t.set("transformOrigin", new Ct(""), () => {
    const o = Yn(t, "originX") ?? "50%", a = Yn(t, "originY") ?? "50%", l = Yn(t, "originZ") ?? 0;
    e.style.transformOrigin = `${o} ${a} ${l}`;
  }), r = t.get("transformOrigin")) : xs(n) ? s = () => {
    e.style.setProperty(n, i.get());
  } : s = () => {
    e.style[n] = Ie(i.get(), Ve[n]);
  };
  return t.set(n, i, s, r);
}, Pf = (e) => ht(e) || vt(e), rl = (e, t) => {
  if (Be.has(t))
    return ja(e, t);
  const n = getComputedStyle(e), i = xs(t) ? n.getPropertyValue(t) : n[t];
  return typeof i == "string" && i.trim() || 0;
}, Mf = /* @__PURE__ */ As(Ps, {
  test: Pf,
  read: rl
}), Cf = {
  x: "translateX",
  y: "translateY",
  z: "translateZ",
  transformPerspective: "perspective"
}, Ef = We.length;
function Df(e, t, n) {
  let i = "", s = !0;
  for (let o = 0; o < Ef; o++) {
    const a = We[o], l = e[a];
    if (l === void 0)
      continue;
    let u = !0;
    if (typeof l == "number")
      u = l === (a.startsWith("scale") ? 1 : 0);
    else {
      const d = parseFloat(l);
      u = a.startsWith("scale") ? d === 1 : d === 0;
    }
    if (!u || n) {
      const d = Ie(l, Ve[a]);
      if (!u) {
        s = !1;
        const h = Cf[a] || a;
        i += `${h}(${d}) `;
      }
      n && (t[a] = d);
    }
  }
  const r = e.pathRotation;
  return r && (s = !1, i += `rotate(${Ie(r, Ve.pathRotation)}) `), i = i.trim(), n ? i = n(t, s ? "" : i) : s && (i = "none"), i;
}
function Ms(e, t, n) {
  const { style: i, vars: s, transformOrigin: r } = e;
  let o = !1, a = !1;
  for (const l in t) {
    const u = t[l];
    if (Be.has(l)) {
      o = !0;
      continue;
    } else if (wa(l)) {
      s[l] = u;
      continue;
    } else {
      const d = Ie(u, Ve[l]);
      l.startsWith("origin") ? (a = !0, r[l] = d) : i[l] = d;
    }
  }
  if (t.transform || (o || n ? i.transform = Df(t, e.transform, n) : i.transform && (i.transform = "none")), a) {
    const { originX: l = "50%", originY: u = "50%", originZ: d = 0 } = r;
    i.transformOrigin = `${l} ${u} ${d}`;
  }
}
const Vf = {
  offset: "stroke-dashoffset",
  array: "stroke-dasharray"
}, Rf = {
  offset: "strokeDashoffset",
  array: "strokeDasharray"
};
function Lf(e, t, n = 1, i = 0, s = !0) {
  e.pathLength = 1;
  const r = s ? Vf : Rf;
  e[r.offset] = `${-i}`, e[r.array] = `${t} ${n}`;
}
const Cs = [
  "transform",
  "opacity",
  "offsetDistance",
  "offsetPath",
  "offsetRotate",
  "offsetAnchor"
];
function ol(e, {
  attrX: t,
  attrY: n,
  attrScale: i,
  pathLength: s,
  pathSpacing: r = 1,
  pathOffset: o = 0,
  // This is object creation, which we try to avoid per-frame.
  ...a
}, l, u, d) {
  if (Ms(e, a, u), l) {
    e.style.viewBox && (e.attrs.viewBox = e.style.viewBox);
    return;
  }
  e.attrs = e.style, e.style = {};
  const { attrs: h, style: f } = e;
  for (const p of Cs)
    h[p] !== void 0 && (f[p] = h[p], delete h[p]);
  (f.transform || h.transformOrigin) && (f.transformOrigin = h.transformOrigin ?? "50% 50%", delete h.transformOrigin), f.transform && (f.transformBox = d?.transformBox ?? "fill-box", delete h.transformBox), t !== void 0 && (h.x = t), n !== void 0 && (h.y = n), i !== void 0 && (h.scale = i), s !== void 0 && Lf(h, s, r, o, !1);
}
function Ff(e, t) {
  if (!(t in e))
    return !1;
  const n = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(e), t) || Object.getOwnPropertyDescriptor(e, t);
  return n && typeof n.set == "function";
}
const kr = (e, t, n, i, s = n) => {
  const r = Ff(e, s);
  !r && (s.startsWith("data") || s.startsWith("aria")) && (s = Ht(s));
  const o = Ve[n] || Ve[s], a = r ? () => {
    e[s] = Ie(i.get(), Ve[n]);
  } : () => {
    const l = Ie(i.get(), o);
    l == null ? e.removeAttribute(s) : e.setAttribute(s, String(l));
  };
  return t.set(n, i, a);
};
function Of(e, t, n, i) {
  return K.render(() => e.setAttribute("pathLength", "1")), n === "pathOffset" ? t.set(n, i, () => {
    const s = i.get();
    e.setAttribute("stroke-dashoffset", `${-s}`);
  }) : (t.get("stroke-dasharray") || t.set("stroke-dasharray", new Ct("1 1"), () => {
    const s = t.get("pathLength")?.get() ?? 1, r = t.get("pathSpacing")?.get();
    e.setAttribute("stroke-dasharray", `${s} ${r ?? 1 - Number(s)}`);
  }), t.set(n, i, void 0, t.get("stroke-dasharray")));
}
const If = (e, t, n, i) => n.startsWith("path") ? Of(e, t, n, i) : n.startsWith("attr") ? kr(e, t, n, i, al(n)) : (n in e.style ? Ps : kr)(e, t, n, i), Bf = (e, t) => Be.has(t) ? Ve[t]?.default || 0 : Cs.includes(t) ? rl(e, t) : (t = al(t), e.getAttribute(Ht(t)) ?? e.getAttribute(t) ?? void 0), $f = /* @__PURE__ */ As(If, {
  test: vt,
  read: Bf
});
function al(e) {
  return e.replace(/^attr([A-Z])/, (t, n) => n.toLowerCase());
}
function ll({ top: e, left: t, right: n, bottom: i }) {
  return {
    x: { min: t, max: n },
    y: { min: e, max: i }
  };
}
function jf({ x: e, y: t }) {
  return { top: t.min, right: e.max, bottom: t.max, left: e.min };
}
function Uf(e, t) {
  if (!t)
    return e;
  const n = t({ x: e.left, y: e.top }), i = t({ x: e.right, y: e.bottom });
  return {
    top: n.y,
    left: n.x,
    bottom: i.y,
    right: i.x
  };
}
function Xn(e) {
  return e === void 0 || e === 1;
}
function Vi({ scale: e, scaleX: t, scaleY: n }) {
  return !Xn(e) || !Xn(t) || !Xn(n);
}
function Ke(e) {
  return Vi(e) || cl(e) || e.z || e.rotate || e.rotateX || e.rotateY || e.skewX || e.skewY;
}
function cl(e) {
  return Tr(e.x) || Tr(e.y);
}
function Tr(e) {
  return e && e !== "0%";
}
function Tn(e, t, n) {
  const i = e - n, s = t * i;
  return n + s;
}
function Sr(e, t, n, i, s) {
  return s !== void 0 && (e = Tn(e, s, i)), Tn(e, n, i) + t;
}
function Ri(e, t = 0, n = 1, i, s) {
  e.min = Sr(e.min, t, n, i, s), e.max = Sr(e.max, t, n, i, s);
}
function ul(e, { x: t, y: n }) {
  Ri(e.x, t.translate, t.scale, t.originPoint), Ri(e.y, n.translate, n.scale, n.originPoint);
}
const Nr = 0.999999999999, Ar = 1.0000000000001;
function zf(e, t, n, i = !1) {
  const s = n.length;
  if (!s)
    return;
  t.x = t.y = 1;
  let r, o;
  for (let a = 0; a < s; a++) {
    r = n[a], o = r.projectionDelta;
    const { visualElement: l } = r.options;
    l && l.props.style && l.props.style.display === "contents" || (i && r.options.layoutScroll && r.scroll && r !== r.root && (Ee(e.x, -r.scroll.offset.x), Ee(e.y, -r.scroll.offset.y)), o && (t.x *= o.x.scale, t.y *= o.y.scale, ul(e, o)), i && Ke(r.latestValues) && cn(e, r.latestValues, r.layout?.layoutBox));
  }
  t.x < Ar && t.x > Nr && (t.x = 1), t.y < Ar && t.y > Nr && (t.y = 1);
}
function Ee(e, t) {
  e.min += t, e.max += t;
}
function Pr(e, t, n, i, s = 0.5) {
  const r = q(e.min, e.max, s);
  Ri(e, t, n, r, i);
}
function Mr(e, t) {
  return typeof e == "string" ? parseFloat(e) / 100 * (t.max - t.min) : e;
}
function cn(e, t, n) {
  const i = n ?? e;
  Pr(e.x, Mr(t.x, i.x), t.scaleX, t.scale, t.originX), Pr(e.y, Mr(t.y, i.y), t.scaleY, t.scale, t.originY);
}
function Es(e, t) {
  return ll(Uf(e.getBoundingClientRect(), t));
}
function Wf(e, t, n) {
  const i = Es(e, n), { scroll: s } = t;
  return s && (Ee(i.x, s.offset.x), Ee(i.y, s.offset.y)), i;
}
const _f = {}, Gf = (e) => vt(e) ? $f : Mf;
class Kf {
  constructor(t, n) {
    this.effect = t, this.current = n, this.KeyframeResolver = tl;
  }
  getValue(t) {
    return this.effect.get(this.current, t);
  }
  readValue(t, n) {
    return this.effect.read(this.current, t, n);
  }
  render() {
    this.effect.flush(this.current);
  }
  measureViewportBox() {
    return Es(this.current);
  }
  getProps() {
    return _f;
  }
}
function Hf(e, t, n, i) {
  if (i)
    return il((r) => i.getValue(r, null), t, n, i);
  const s = Gf(e);
  return sl(s, e, t, n, new Kf(s, e));
}
const qf = /* @__PURE__ */ As((e, t, n, i) => t.set(n, i, () => {
  e[n] = i.get();
}), {
  test: (e) => is(e),
  read: (e, t) => {
    const n = e[t];
    return typeof n == "string" || typeof n == "number" ? n : void 0;
  }
}), { schedule: Ds } = /* @__PURE__ */ va(queueMicrotask, !1), Ne = {
  x: !1,
  y: !1
};
function dl() {
  return Ne.x || Ne.y;
}
function Yf(e) {
  return e === "x" || e === "y" ? Ne[e] ? null : (Ne[e] = !0, () => {
    Ne[e] = !1;
  }) : Ne.x || Ne.y ? null : (Ne.x = Ne.y = !0, () => {
    Ne.x = Ne.y = !1;
  });
}
function fl(e, t) {
  const n = Ns(e), i = new AbortController(), s = {
    passive: !0,
    ...t,
    signal: i.signal
  };
  return [n, s, () => i.abort()];
}
function Xf(e) {
  return !(e.pointerType === "touch" || dl());
}
function Zf(e, t, n = {}) {
  const [i, s, r] = fl(e, n);
  return i.forEach((o) => {
    let a = !1, l = !1, u;
    const d = () => {
      o.removeEventListener("pointerleave", m);
    }, h = (v) => {
      u && (u(v), u = void 0), d();
    }, f = (v) => {
      a = !1, window.removeEventListener("pointerup", f), window.removeEventListener("pointercancel", f), l && (l = !1, h(v));
    }, p = () => {
      a = !0, window.addEventListener("pointerup", f, s), window.addEventListener("pointercancel", f, s);
    }, m = (v) => {
      if (v.pointerType !== "touch") {
        if (a) {
          l = !0;
          return;
        }
        h(v);
      }
    }, x = (v) => {
      if (!Xf(v))
        return;
      l = !1;
      const w = t(o, v);
      typeof w == "function" && (u = w, o.addEventListener("pointerleave", m, s));
    };
    o.addEventListener("pointerenter", x, s), o.addEventListener("pointerdown", p, s);
  }), r;
}
const hl = (e, t) => t ? e === t ? !0 : hl(e, t.parentElement) : !1, Vs = (e) => e.pointerType === "mouse" ? typeof e.button != "number" || e.button <= 0 : e.isPrimary !== !1, Qf = /* @__PURE__ */ new Set([
  "BUTTON",
  "INPUT",
  "SELECT",
  "TEXTAREA",
  "A"
]);
function Jf(e) {
  return Qf.has(e.tagName) || e.isContentEditable === !0;
}
const eh = /* @__PURE__ */ new Set(["INPUT", "SELECT", "TEXTAREA"]);
function th(e) {
  return eh.has(e.tagName) || e.isContentEditable === !0;
}
const un = /* @__PURE__ */ new WeakSet();
function Cr(e) {
  return (t) => {
    t.key === "Enter" && e(t);
  };
}
function Zn(e, t) {
  e.dispatchEvent(new PointerEvent("pointer" + t, { isPrimary: !0, bubbles: !0 }));
}
const nh = (e, t) => {
  const n = e.currentTarget;
  if (!n)
    return;
  const i = Cr(() => {
    if (un.has(n))
      return;
    Zn(n, "down");
    const s = Cr(() => {
      Zn(n, "up");
    }), r = () => Zn(n, "cancel");
    n.addEventListener("keyup", s, t), n.addEventListener("blur", r, t);
  });
  n.addEventListener("keydown", i, t), n.addEventListener("blur", () => n.removeEventListener("keydown", i), t);
};
function Er(e) {
  return Vs(e) && !dl();
}
const Dr = /* @__PURE__ */ new WeakSet();
function ih(e, t, n = {}) {
  const [i, s, r] = fl(e, n), o = (a) => {
    const l = a.currentTarget;
    if (!Er(a) || Dr.has(a))
      return;
    un.add(l), n.stopPropagation && Dr.add(a);
    const u = t(l, a), d = { ...s, capture: !0 }, h = (m, x) => {
      window.removeEventListener("pointerup", f, d), window.removeEventListener("pointercancel", p, d), un.has(l) && un.delete(l), Er(m) && typeof u == "function" && u(m, { success: x });
    }, f = (m) => {
      h(m, l === window || l === document || n.useGlobalTarget || hl(l, m.target));
    }, p = (m) => {
      h(m, !1);
    };
    window.addEventListener("pointerup", f, d), window.addEventListener("pointercancel", p, d);
  };
  return i.forEach((a) => {
    (n.useGlobalTarget ? window : a).addEventListener("pointerdown", o, s), ht(a) && (a.addEventListener("focus", (u) => nh(u, s)), !Jf(a) && !a.hasAttribute("tabindex") && (a.tabIndex = 0));
  }), r;
}
const dn = /* @__PURE__ */ new WeakMap();
let fn;
const pl = (e, t, n) => (i, s) => s && s[0] ? s[0][e + "Size"] : vt(i) && "getBBox" in i ? i.getBBox()[t] : i[n], sh = /* @__PURE__ */ pl("inline", "width", "offsetWidth"), rh = /* @__PURE__ */ pl("block", "height", "offsetHeight");
function oh({ target: e, borderBoxSize: t }) {
  dn.get(e)?.forEach((n) => {
    n(e, {
      get width() {
        return sh(e, t);
      },
      get height() {
        return rh(e, t);
      }
    });
  });
}
function ah(e) {
  e.forEach(oh);
}
function lh() {
  typeof ResizeObserver > "u" || (fn = new ResizeObserver(ah));
}
function ch(e, t) {
  fn || lh();
  const n = Ns(e);
  return n.forEach((i) => {
    let s = dn.get(i);
    s || (s = /* @__PURE__ */ new Set(), dn.set(i, s)), s.add(t), fn?.observe(i);
  }), () => {
    n.forEach((i) => {
      const s = dn.get(i);
      s?.delete(t), s?.size || fn?.unobserve(i);
    });
  };
}
const hn = /* @__PURE__ */ new Set();
let ct;
function uh() {
  ct = () => {
    const e = {
      get width() {
        return window.innerWidth;
      },
      get height() {
        return window.innerHeight;
      }
    };
    hn.forEach((t) => t(e));
  }, window.addEventListener("resize", ct);
}
function dh(e) {
  return hn.add(e), ct || uh(), () => {
    hn.delete(e), !hn.size && typeof ct == "function" && (window.removeEventListener("resize", ct), ct = void 0);
  };
}
function Vr(e, t) {
  return typeof e == "function" ? dh(e) : ch(e, t);
}
function fh(e) {
  return vt(e) && e.tagName === "svg";
}
function hh(...e) {
  const t = !Array.isArray(e[0]), n = t ? 0 : -1, i = e[0 + n], s = e[1 + n], r = e[2 + n], o = e[3 + n], a = Ra(s, r, o);
  return t ? a(i) : a;
}
const Rr = () => ({
  translate: 0,
  scale: 1,
  origin: 0,
  originPoint: 0
}), ut = () => ({
  x: Rr(),
  y: Rr()
}), Lr = () => ({ min: 0, max: 0 }), oe = () => ({
  x: Lr(),
  y: Lr()
}), ml = /* @__PURE__ */ new WeakMap();
function Fn(e) {
  return e !== null && typeof e == "object" && typeof e.start == "function";
}
function Bt(e) {
  return typeof e == "string" || Array.isArray(e);
}
const Rs = [
  "animate",
  "whileInView",
  "whileFocus",
  "whileHover",
  "whileTap",
  "whileDrag",
  "exit"
], Sn = ["initial", ...Rs];
function On(e) {
  if (Fn(e.animate))
    return !0;
  for (let t = 0; t < Sn.length; t++)
    if (Bt(e[Sn[t]]))
      return !0;
  return !1;
}
function gl(e) {
  return !!(On(e) || e.variants);
}
function ph(e, t, n) {
  for (const i in t) {
    const s = t[i], r = n[i];
    if (ce(s))
      e.addValue(i, s);
    else if (ce(r))
      e.addValue(i, Oe(s, { owner: e }));
    else if (r !== s)
      if (e.hasValue(i)) {
        const o = e.getValue(i);
        o.liveStyle === !0 ? o.jump(s) : o.hasAnimated || o.set(s);
      } else {
        const o = e.getStaticValue(i);
        e.addValue(i, Oe(o !== void 0 ? o : s, { owner: e }));
      }
  }
  for (const i in n)
    t[i] === void 0 && e.removeValue(i);
  return t;
}
const Nn = { current: null }, Ls = { current: !1 }, mh = typeof window < "u";
function yl() {
  if (Ls.current = !0, !!mh)
    if (window.matchMedia) {
      const e = window.matchMedia("(prefers-reduced-motion)"), t = () => Nn.current = e.matches;
      e.addEventListener("change", t), t();
    } else
      Nn.current = !1;
}
const Fr = [
  "AnimationStart",
  "AnimationComplete",
  "Update",
  "BeforeLayoutMeasure",
  "LayoutMeasure",
  "LayoutAnimationStart",
  "LayoutAnimationComplete"
];
let An = {};
function xl(e) {
  An = e;
}
function gh() {
  return An;
}
class yh {
  /**
   * This method takes React props and returns found MotionValues. For example, HTML
   * MotionValues will be found within the style prop, whereas for Three.js within attribute arrays.
   *
   * This isn't an abstract method as it needs calling in the constructor, but it is
   * intended to be one.
   */
  scrapeMotionValuesFromProps(t, n, i) {
    return {};
  }
  constructor({ parent: t, props: n, presenceContext: i, reducedMotionConfig: s, skipAnimations: r, blockInitialAnimation: o, visualState: a }, l = {}) {
    this.current = null, this.children = /* @__PURE__ */ new Set(), this.isVariantNode = !1, this.isControllingVariants = !1, this.shouldReduceMotion = null, this.shouldSkipAnimations = !1, this.values = /* @__PURE__ */ new Map(), this.KeyframeResolver = ys, this.features = {}, this.valueSubscriptions = /* @__PURE__ */ new Map(), this.prevMotionValues = {}, this.hasBeenMounted = !1, this.events = {}, this.propEventSubscriptions = {}, this.notifyUpdate = () => this.notify("Update", this.latestValues), this.render = () => {
      this.current && (this.triggerBuild(), this.renderInstance(this.current, this.renderState, this.props.style, this.projection));
    }, this.renderScheduledAt = 0, this.scheduleRender = () => {
      const p = fe.now();
      this.renderScheduledAt < p && (this.renderScheduledAt = p, K.render(this.render, !1, !0));
    };
    const { latestValues: u, renderState: d } = a;
    this.latestValues = u, this.baseTarget = { ...u }, this.initialValues = n.initial ? { ...u } : {}, this.renderState = d, this.parent = t, this.props = n, this.presenceContext = i, this.depth = t ? t.depth + 1 : 0, this.reducedMotionConfig = s, this.skipAnimationsConfig = r, this.options = l, this.blockInitialAnimation = !!o, this.isControllingVariants = On(n), this.isVariantNode = gl(n), this.isVariantNode && (this.variantChildren = /* @__PURE__ */ new Set()), this.manuallyAnimateOnMount = !!(t && t.current);
    const { willChange: h, ...f } = this.scrapeMotionValuesFromProps(n, {}, this);
    for (const p in f) {
      const m = f[p];
      u[p] !== void 0 && ce(m) && m.set(u[p]);
    }
  }
  mount(t) {
    if (this.hasBeenMounted)
      for (const n in this.initialValues)
        this.values.get(n)?.jump(this.initialValues[n]), this.latestValues[n] = this.initialValues[n];
    this.current = t, ml.set(t, this), this.projection && !this.projection.instance && this.projection.mount(t), this.parent && this.isVariantNode && !this.isControllingVariants && (this.removeFromVariantTree = this.parent.addVariantChild(this)), this.values.forEach((n, i) => this.bindToMotionValue(i, n)), this.reducedMotionConfig === "never" ? this.shouldReduceMotion = !1 : this.reducedMotionConfig === "always" ? this.shouldReduceMotion = !0 : (Ls.current || yl(), this.shouldReduceMotion = Nn.current), process.env.NODE_ENV !== "production" && Vn(this.shouldReduceMotion !== !0, "You have Reduced Motion enabled on your device. Animations may not appear as expected.", "reduced-motion-disabled"), this.shouldSkipAnimations = this.skipAnimationsConfig ?? !1, this.parent?.addChild(this), this.update(this.props, this.presenceContext), this.hasBeenMounted = !0;
  }
  unmount() {
    this.projection && this.projection.unmount(), Fe(this.notifyUpdate), Fe(this.render), this.valueSubscriptions.forEach((t) => t()), this.valueSubscriptions.clear(), this.removeFromVariantTree && this.removeFromVariantTree(), this.parent?.removeChild(this);
    for (const t in this.events)
      this.events[t].clear();
    for (const t in this.features) {
      const n = this.features[t];
      n && (n.unmount(), n.isMounted = !1);
    }
    this.current = null;
  }
  addChild(t) {
    this.children.add(t), this.enteringChildren ?? (this.enteringChildren = /* @__PURE__ */ new Set()), this.enteringChildren.add(t);
  }
  removeChild(t) {
    this.children.delete(t), this.enteringChildren && this.enteringChildren.delete(t);
  }
  bindToMotionValue(t, n) {
    if (this.valueSubscriptions.has(t) && this.valueSubscriptions.get(t)(), n.accelerate && Mi.has(t) && this.current instanceof HTMLElement) {
      const { factory: o, keyframes: a, times: l, ease: u, duration: d } = n.accelerate, h = new Ha({
        element: this.current,
        name: t,
        keyframes: a,
        times: l,
        ease: u,
        duration: /* @__PURE__ */ ye(d)
      }), f = o(h);
      this.valueSubscriptions.set(t, () => {
        f(), h.cancel();
      });
      return;
    }
    const i = Be.has(t);
    i && this.onBindTransform && this.onBindTransform();
    const s = n.on("change", (o) => {
      this.latestValues[t] = o, this.props.onUpdate && K.preRender(this.notifyUpdate), i && this.projection && (this.projection.isTransformDirty = !0), this.scheduleRender();
    });
    let r;
    typeof window < "u" && window.MotionCheckAppearSync && (r = window.MotionCheckAppearSync(this, t, n)), this.valueSubscriptions.set(t, () => {
      s(), r && r();
    });
  }
  sortNodePosition(t) {
    return !this.current || !this.sortInstanceNodePosition || this.type !== t.type ? 0 : this.sortInstanceNodePosition(this.current, t.current);
  }
  updateFeatures() {
    let t = "animation";
    for (t in An) {
      const n = An[t];
      if (!n)
        continue;
      const { isEnabled: i, Feature: s } = n;
      if (!this.features[t] && s && i(this.props) && (this.features[t] = new s(this)), this.features[t]) {
        const r = this.features[t];
        r.isMounted ? r.update() : (r.mount(), r.isMounted = !0);
      }
    }
  }
  triggerBuild() {
    this.build(this.renderState, this.latestValues, this.props);
  }
  /**
   * Measure the current viewport box with or without transforms.
   * Only measures axis-aligned boxes, rotate and skew must be manually
   * removed with a re-render to work.
   */
  measureViewportBox() {
    return this.current ? this.measureInstanceViewportBox(this.current, this.props) : oe();
  }
  getStaticValue(t) {
    return this.latestValues[t];
  }
  setStaticValue(t, n) {
    this.latestValues[t] = n;
  }
  /**
   * Update the provided props. Ensure any newly-added motion values are
   * added to our map, old ones removed, and listeners updated.
   */
  update(t, n) {
    (t.transformTemplate || this.props.transformTemplate) && this.scheduleRender(), this.prevProps = this.props, this.props = t, this.prevPresenceContext = this.presenceContext, this.presenceContext = n;
    for (let i = 0; i < Fr.length; i++) {
      const s = Fr[i];
      this.propEventSubscriptions[s] && (this.propEventSubscriptions[s](), delete this.propEventSubscriptions[s]);
      const r = "on" + s, o = t[r];
      o && (this.propEventSubscriptions[s] = this.on(s, o));
    }
    this.prevMotionValues = ph(this, this.scrapeMotionValuesFromProps(t, this.prevProps || {}, this), this.prevMotionValues), this.handleChildMotionValue && this.handleChildMotionValue();
  }
  getProps() {
    return this.props;
  }
  /**
   * Returns the variant definition with a given name.
   */
  getVariant(t) {
    return this.props.variants ? this.props.variants[t] : void 0;
  }
  /**
   * Returns the defined default transition on this component.
   */
  getDefaultTransition() {
    return this.props.transition;
  }
  getTransformPagePoint() {
    return this.props.transformPagePoint;
  }
  getClosestVariantNode() {
    return this.isVariantNode ? this : this.parent ? this.parent.getClosestVariantNode() : void 0;
  }
  /**
   * Add a child visual element to our set of children.
   */
  addVariantChild(t) {
    const n = this.getClosestVariantNode();
    if (n)
      return n.variantChildren && n.variantChildren.add(t), () => n.variantChildren.delete(t);
  }
  /**
   * Add a motion value and bind it to this visual element.
   */
  addValue(t, n) {
    const i = this.values.get(t);
    n !== i && (i && this.removeValue(t), this.bindToMotionValue(t, n), this.values.set(t, n), this.latestValues[t] = n.get());
  }
  /**
   * Remove a motion value and unbind any active subscriptions.
   */
  removeValue(t) {
    this.values.delete(t);
    const n = this.valueSubscriptions.get(t);
    n && (n(), this.valueSubscriptions.delete(t)), delete this.latestValues[t], this.removeValueFromRenderState(t, this.renderState);
  }
  /**
   * Check whether we have a motion value for this key
   */
  hasValue(t) {
    return this.values.has(t);
  }
  getValue(t, n) {
    if (this.props.values && this.props.values[t])
      return this.props.values[t];
    let i = this.values.get(t);
    return i === void 0 && n !== void 0 && (i = Oe(n === null ? void 0 : n, { owner: this }), this.addValue(t, i)), i;
  }
  /**
   * If we're trying to animate to a previously unencountered value,
   * we need to check for it in our state and as a last resort read it
   * directly from the instance (which might have performance implications).
   */
  readValue(t, n) {
    let i = this.latestValues[t] !== void 0 || !this.current ? this.latestValues[t] : this.getBaseTargetFromProps(this.props, t) ?? this.readValueFromInstance(this.current, t, this.options);
    return i != null && (typeof i == "string" && (ns(i) || ss(i)) ? i = parseFloat(i) : (
      /**
       * If the value as read isn't animatable (e.g. "none") but
       * the target is, derive an animatable none from the target.
       * A value is animatable if it's a number or contains a
       * number or color, which is cheaper to check than trying
       * every value type in turn.
       */
      typeof i != "number" && !be.test(i) && be.test(n) && (i = gs(t, n))
    ), this.setBaseTarget(t, ce(i) ? i.get() : i)), ce(i) ? i.get() : i;
  }
  /**
   * Set the base target to later animate back to. This is currently
   * only hydrated on creation and when we first read a value.
   */
  setBaseTarget(t, n) {
    this.baseTarget[t] = n;
  }
  /**
   * Find the base target for a value thats been removed from all animation
   * props.
   */
  getBaseTarget(t) {
    const { initial: n } = this.props;
    let i;
    if (typeof n == "string" || typeof n == "object") {
      const r = ws(this.props, n, this.presenceContext?.custom);
      r && (i = r[t]);
    }
    if (n && i !== void 0)
      return i;
    const s = this.getBaseTargetFromProps(this.props, t);
    return s !== void 0 && !ce(s) ? s : this.initialValues[t] !== void 0 && i === void 0 ? void 0 : this.baseTarget[t];
  }
  on(t, n) {
    return this.events[t] || (this.events[t] = new vn()), this.events[t].add(n);
  }
  notify(t, ...n) {
    this.events[t] && this.events[t].notify(...n);
  }
  scheduleRenderMicrotask() {
    Ds.render(this.render);
  }
}
class vl extends yh {
  constructor() {
    super(...arguments), this.KeyframeResolver = tl;
  }
  sortInstanceNodePosition(t, n) {
    return t.compareDocumentPosition(n) & 2 ? 1 : -1;
  }
  getBaseTargetFromProps(t, n) {
    const i = t.style;
    return i ? i[n] : void 0;
  }
  removeValueFromRenderState(t, { vars: n, style: i }) {
    delete n[t], delete i[t];
  }
  handleChildMotionValue() {
    this.childSubscription && (this.childSubscription(), delete this.childSubscription);
    const { children: t } = this.props;
    ce(t) && (this.childSubscription = t.on("change", (n) => {
      this.current && (this.current.textContent = `${n}`);
    }));
  }
}
class _e {
  constructor(t) {
    this.isMounted = !1, this.node = t;
  }
  update() {
  }
}
function bl(e, { style: t, vars: n }, i, s) {
  const r = e.style;
  let o;
  for (o in t)
    r[o] = t[o];
  s?.applyProjectionStyles(r, i);
  for (o in n)
    r.setProperty(o, n[o]);
}
function Or(e, t) {
  return t.max === t.min ? 0 : e / (t.max - t.min) * 100;
}
const kt = {
  correct: (e, t) => {
    if (!t.target)
      return e;
    if (typeof e == "string")
      if (V.test(e))
        e = parseFloat(e);
      else
        return e;
    const n = Or(e, t.target.x), i = Or(e, t.target.y);
    return `${n}% ${i}%`;
  }
}, xh = {
  correct: (e, { treeScale: t, projectionDelta: n }) => {
    const i = e, s = be.parse(e);
    if (s.length > 5)
      return i;
    const r = be.createTransformer(e), o = typeof s[0] != "number" ? 1 : 0, a = n.x.scale * t.x, l = n.y.scale * t.y;
    s[0 + o] /= a, s[1 + o] /= l;
    const u = q(a, l, 0.5);
    return typeof s[2 + o] == "number" && (s[2 + o] /= u), typeof s[3 + o] == "number" && (s[3 + o] /= u), r(s);
  }
}, Li = {
  borderRadius: {
    ...kt,
    applyTo: [...Ts]
  },
  borderTopLeftRadius: kt,
  borderTopRightRadius: kt,
  borderBottomLeftRadius: kt,
  borderBottomRightRadius: kt,
  boxShadow: xh
};
function wl(e, { layout: t, layoutId: n }) {
  return Be.has(e) || e.startsWith("origin") || (t || n !== void 0) && (!!Li[e] || e === "opacity");
}
function Fs(e, t, n) {
  const i = e.style, s = t?.style, r = {};
  if (!i)
    return r;
  for (const o in i)
    (ce(i[o]) || s && ce(s[o]) || wl(o, e) || n?.getValue(o)?.liveStyle !== void 0) && (r[o] = i[o]);
  return r;
}
function vh(e) {
  return window.getComputedStyle(e);
}
class bh extends vl {
  constructor() {
    super(...arguments), this.type = "html", this.renderInstance = bl;
  }
  mount(t) {
    we(!!t.style, "motion.create() components must forward their ref to a HTML or SVG element", "custom-component-ref"), super.mount(t);
  }
  readValueFromInstance(t, n) {
    if (Be.has(n))
      return this.projection?.isProjecting ? ki(n) : ja(t, n);
    {
      const i = vh(t), s = (wa(n) ? i.getPropertyValue(n) : i[n]) || 0;
      return typeof s == "string" ? s.trim() : s;
    }
  }
  measureInstanceViewportBox(t, { transformPagePoint: n }) {
    return Es(t, n);
  }
  build(t, n, i) {
    Ms(t, n, i.transformTemplate);
  }
  scrapeMotionValuesFromProps(t, n, i) {
    return Fs(t, n, i);
  }
}
const kl = /* @__PURE__ */ new Set([
  "baseFrequency",
  "diffuseConstant",
  "kernelMatrix",
  "kernelUnitLength",
  "keySplines",
  "keyTimes",
  "limitingConeAngle",
  "markerHeight",
  "markerWidth",
  "numOctaves",
  "targetX",
  "targetY",
  "surfaceScale",
  "specularConstant",
  "specularExponent",
  "stdDeviation",
  "tableValues",
  "viewBox",
  "gradientTransform",
  "pathLength",
  "startOffset",
  "textLength",
  "lengthAdjust"
]), Tl = (e) => typeof e == "string" && e.toLowerCase() === "svg";
function wh(e, t, n, i) {
  bl(e, t, void 0, i);
  for (const s in t.attrs)
    e.setAttribute(kl.has(s) ? s : Ht(s), t.attrs[s]);
}
function Sl(e, t, n) {
  const i = Fs(e, t, n);
  for (const s in e)
    if (ce(e[s]) || ce(t[s])) {
      const r = We.indexOf(s) !== -1 ? "attr" + s.charAt(0).toUpperCase() + s.substring(1) : s;
      i[r] = e[s];
    }
  return i;
}
class kh extends vl {
  constructor() {
    super(...arguments), this.type = "svg", this.isSVGTag = !1, this.measureInstanceViewportBox = oe;
  }
  getBaseTargetFromProps(t, n) {
    return t[n];
  }
  readValueFromInstance(t, n) {
    if (Be.has(n)) {
      const i = $a(n);
      return i && i.default || 0;
    }
    if (Cs.includes(n)) {
      const s = getComputedStyle(t)[n];
      if (typeof s == "string" && s)
        return s.trim();
    }
    return n = kl.has(n) ? n : Ht(n), t.getAttribute(n);
  }
  scrapeMotionValuesFromProps(t, n, i) {
    return Sl(t, n, i);
  }
  build(t, n, i) {
    ol(t, n, this.isSVGTag, i.transformTemplate, i.style);
  }
  renderInstance(t, n, i, s) {
    wh(t, n, i, s);
  }
  mount(t) {
    this.isSVGTag = Tl(t.tagName), super.mount(t);
  }
}
const Th = Sn.length;
function Nl(e) {
  if (!e)
    return;
  if (!e.isControllingVariants) {
    const n = e.parent ? Nl(e.parent) || {} : {};
    return e.props.initial !== void 0 && (n.initial = e.props.initial), n;
  }
  const t = {};
  for (let n = 0; n < Th; n++) {
    const i = Sn[n], s = e.props[i];
    (Bt(s) || s === !1) && (t[i] = s);
  }
  return t;
}
function Al(e, t) {
  if (!Array.isArray(t))
    return !1;
  const n = t.length;
  if (n !== e.length)
    return !1;
  for (let i = 0; i < n; i++)
    if (t[i] !== e[i])
      return !1;
  return !0;
}
const Sh = [...Rs].reverse(), Nh = Rs.length;
function Ah(e) {
  return (t) => Promise.all(t.map(({ animation: n, options: i }) => hf(e, n, i)));
}
function Ph(e) {
  let t = Ah(e), n = Ir(), i = !0, s = !1;
  const r = (u) => (d, h) => {
    const f = Qe(e, h, u === "exit" ? e.presenceContext?.custom : void 0);
    if (f) {
      const { transition: p, transitionEnd: m, ...x } = f;
      d = { ...d, ...x, ...m };
    }
    return d;
  };
  function o(u) {
    t = u(e);
  }
  function a(u) {
    const { props: d } = e, h = Nl(e.parent) || {}, f = [], p = /* @__PURE__ */ new Set();
    let m = {}, x = 1 / 0;
    for (let w = 0; w < Nh; w++) {
      const T = Sh[w], g = n[T], S = d[T] !== void 0 ? d[T] : h[T], R = Bt(S), D = T === u ? g.isActive : null;
      D === !1 && (x = w);
      let k = S === h[T] && S !== d[T] && R;
      if (k && (i || s) && e.manuallyAnimateOnMount && (k = !1), g.protectedKeys = { ...m }, // If it isn't active and hasn't *just* been set as inactive
      !g.isActive && D === null || // If we didn't and don't have any defined prop for this animation type
      !S && !g.prevProp || // Or if the prop doesn't define an animation
      Fn(S) || typeof S == "boolean")
        continue;
      if (T === "exit" && g.isActive && D !== !0) {
        g.prevResolvedValues && (m = {
          ...m,
          ...g.prevResolvedValues
        });
        continue;
      }
      const A = Mh(g.prevProp, S);
      let N = A || // If we're making this variant active, we want to always make it active
      T === u && g.isActive && !k && R || // If we removed a higher-priority variant (i is in reverse order)
      w > x && R, M = !1;
      const b = Array.isArray(S) ? S : [S];
      let B = b.reduce(r(T), {});
      D === !1 && (B = {});
      const { prevResolvedValues: $ = {} } = g, Y = {
        ...$,
        ...B
      }, H = (U) => {
        N = !0, p.has(U) && (M = !0, p.delete(U)), g.needsAnimating[U] = !0;
        const ee = e.getValue(U);
        ee && (ee.liveStyle = !1);
      };
      for (const U in Y) {
        const ee = B[U], se = $[U];
        if (m.hasOwnProperty(U))
          continue;
        let ne = !1;
        Ci(ee) && Ci(se) ? ne = !Al(ee, se) || A : ne = ee !== se, ne ? ee != null ? H(U) : p.add(U) : ee !== void 0 && p.has(U) ? H(U) : g.protectedKeys[U] = !0;
      }
      g.prevProp = S, g.prevResolvedValues = B, g.isActive && (m = { ...m, ...B }), (i || s) && e.blockInitialAnimation && (N = !1);
      const _ = k && A;
      N && (!_ || M) && f.push(...b.map((U) => {
        const ee = { type: T };
        if (typeof U == "string" && (i || s) && !_ && e.manuallyAnimateOnMount && e.parent) {
          const { parent: se } = e, ne = Qe(se, U);
          if (se.enteringChildren && ne) {
            const { delayChildren: E } = ne.transition || {};
            ee.delay = Ya(se.enteringChildren, e, E);
          }
        }
        return {
          animation: U,
          options: ee
        };
      }));
    }
    if (p.size) {
      const w = {};
      if (typeof d.initial != "boolean") {
        const T = Qe(e, Array.isArray(d.initial) ? d.initial[0] : d.initial);
        T && T.transition && (w.transition = T.transition);
      }
      p.forEach((T) => {
        const g = e.getBaseTarget(T), S = e.getValue(T);
        S && (S.liveStyle = !0), w[T] = g ?? null;
      }), f.push({ animation: w });
    }
    let v = !!f.length;
    return i && (d.initial === !1 || d.initial === d.animate) && !e.manuallyAnimateOnMount && (v = !1), i = !1, s = !1, v ? t(f) : Promise.resolve();
  }
  function l(u, d) {
    if (n[u].isActive === d)
      return Promise.resolve();
    e.variantChildren?.forEach((f) => f.animationState?.setActive(u, d)), n[u].isActive = d;
    const h = a(u);
    for (const f in n)
      n[f].protectedKeys = {};
    return h;
  }
  return {
    animateChanges: a,
    setActive: l,
    setAnimateFunction: o,
    getState: () => n,
    reset: () => {
      n = Ir(), s = !0;
    }
  };
}
function Mh(e, t) {
  return typeof t == "string" ? t !== e : Array.isArray(t) ? !Al(t, e) : !1;
}
function Ge(e = !1) {
  return {
    isActive: e,
    protectedKeys: {},
    needsAnimating: {},
    prevResolvedValues: {}
  };
}
function Ir() {
  return {
    animate: Ge(!0),
    whileInView: Ge(),
    whileHover: Ge(),
    whileTap: Ge(),
    whileDrag: Ge(),
    whileFocus: Ge(),
    exit: Ge()
  };
}
function Fi(e, t) {
  e.min = t.min, e.max = t.max;
}
function Se(e, t) {
  Fi(e.x, t.x), Fi(e.y, t.y);
}
function Br(e, t) {
  e.translate = t.translate, e.scale = t.scale, e.originPoint = t.originPoint, e.origin = t.origin;
}
const Pl = 1e-4, Ch = 1 - Pl, Eh = 1 + Pl, Ml = 0.01, Dh = 0 - Ml, Vh = 0 + Ml;
function pe(e) {
  return e.max - e.min;
}
function Rh(e, t, n) {
  return Math.abs(e - t) <= n;
}
function $r(e, t, n, i = 0.5) {
  e.origin = i, e.originPoint = q(t.min, t.max, e.origin), e.scale = pe(n) / pe(t), e.translate = q(n.min, n.max, e.origin) - e.originPoint, (e.scale >= Ch && e.scale <= Eh || isNaN(e.scale)) && (e.scale = 1), (e.translate >= Dh && e.translate <= Vh || isNaN(e.translate)) && (e.translate = 0);
}
function Et(e, t, n, i) {
  $r(e.x, t.x, n.x, i ? i.originX : void 0), $r(e.y, t.y, n.y, i ? i.originY : void 0);
}
function jr(e, t, n, i = 0) {
  const s = i ? q(n.min, n.max, i) : n.min;
  e.min = s + t.min, e.max = e.min + pe(t);
}
function Lh(e, t, n, i) {
  jr(e.x, t.x, n.x, i?.x), jr(e.y, t.y, n.y, i?.y);
}
function Ur(e, t, n, i = 0) {
  const s = i ? q(n.min, n.max, i) : n.min;
  e.min = t.min - s, e.max = e.min + pe(t);
}
function Pn(e, t, n, i) {
  Ur(e.x, t.x, n.x, i?.x), Ur(e.y, t.y, n.y, i?.y);
}
function zr(e, t, n, i, s) {
  return e -= t, e = Tn(e, 1 / n, i), s !== void 0 && (e = Tn(e, 1 / s, i)), e;
}
function Fh(e, t = 0, n = 1, i = 0.5, s, r = e, o = e) {
  if (De.test(t) && (t = parseFloat(t), t = q(o.min, o.max, t / 100) - o.min), typeof t != "number")
    return;
  let a = q(r.min, r.max, i);
  e === r && (a -= t), e.min = zr(e.min, t, n, a, s), e.max = zr(e.max, t, n, a, s);
}
function Wr(e, t, [n, i, s], r, o) {
  Fh(e, t[n], t[i], t[s], t.scale, r, o);
}
const Oh = ["x", "scaleX", "originX"], Ih = ["y", "scaleY", "originY"];
function _r(e, t, n, i) {
  Wr(e.x, t, Oh, n ? n.x : void 0, i ? i.x : void 0), Wr(e.y, t, Ih, n ? n.y : void 0, i ? i.y : void 0);
}
function Gr(e) {
  return e.translate === 0 && e.scale === 1;
}
function Cl(e) {
  return Gr(e.x) && Gr(e.y);
}
function Kr(e, t) {
  return e.min === t.min && e.max === t.max;
}
function Bh(e, t) {
  return Kr(e.x, t.x) && Kr(e.y, t.y);
}
function Hr(e, t) {
  return Math.round(e.min) === Math.round(t.min) && Math.round(e.max) === Math.round(t.max);
}
function El(e, t) {
  return Hr(e.x, t.x) && Hr(e.y, t.y);
}
function qr(e) {
  return pe(e.x) / pe(e.y);
}
function Yr(e, t) {
  return e.translate === t.translate && e.scale === t.scale && e.originPoint === t.originPoint;
}
function Ce(e) {
  return [e("x"), e("y")];
}
function $h(e, t, n) {
  let i = "";
  const s = e.x.translate / t.x, r = e.y.translate / t.y, o = n?.z || 0;
  if ((s || r || o) && (i = `translate3d(${s}px, ${r}px, ${o}px) `), (t.x !== 1 || t.y !== 1) && (i += `scale(${1 / t.x}, ${1 / t.y}) `), n) {
    const { transformPerspective: u, rotate: d, pathRotation: h, rotateX: f, rotateY: p, skewX: m, skewY: x } = n;
    u && (i = `perspective(${u}px) ${i}`), d && (i += `rotate(${d}deg) `), h && (i += `rotate(${h}deg) `), f && (i += `rotateX(${f}deg) `), p && (i += `rotateY(${p}deg) `), m && (i += `skewX(${m}deg) `), x && (i += `skewY(${x}deg) `);
  }
  const a = e.x.scale * t.x, l = e.y.scale * t.y;
  return (a !== 1 || l !== 1) && (i += `scale(${a}, ${l})`), i || "none";
}
const jh = Ts.length, Xr = (e) => typeof e == "string" ? parseFloat(e) : e, Zr = (e) => typeof e == "number" || V.test(e);
function Uh(e, t, n, i, s, r) {
  s ? (e.opacity = q(0, n.opacity ?? 1, zh(i)), e.opacityExit = q(t.opacity ?? 1, 0, Wh(i))) : r && (e.opacity = q(t.opacity ?? 1, n.opacity ?? 1, i));
  for (let o = 0; o < jh; o++) {
    const a = Ts[o];
    let l = Qr(t, a), u = Qr(n, a);
    if (l === void 0 && u === void 0)
      continue;
    l || (l = 0), u || (u = 0), l === 0 || u === 0 || Zr(l) === Zr(u) ? (e[a] = Math.max(q(Xr(l), Xr(u), i), 0), (De.test(u) || De.test(l)) && (e[a] += "%")) : e[a] = u;
  }
  (t.rotate || n.rotate) && (e.rotate = q(t.rotate || 0, n.rotate || 0, i));
}
function Qr(e, t) {
  return e[t] !== void 0 ? e[t] : e.borderRadius;
}
const zh = /* @__PURE__ */ Dl(0, 0.5, ha), Wh = /* @__PURE__ */ Dl(0.5, 0.95, Ae);
function Dl(e, t, n) {
  return (i) => i < e ? 0 : i > t ? 1 : n(/* @__PURE__ */ pt(e, t, i));
}
function Vl(e, t, n) {
  const i = ce(e) ? e : Oe(e);
  return i.start(Ln("", i, t, n)), i.animation;
}
function $t(e, t, n, i = { passive: !0 }) {
  return e.addEventListener(t, n, i), () => e.removeEventListener(t, n, i);
}
const _h = (e, t) => e.depth - t.depth;
class Gh {
  constructor() {
    this.children = [], this.isDirty = !1;
  }
  add(t) {
    ts(this.children, t), this.isDirty = !0;
  }
  remove(t) {
    Je(this.children, t), this.isDirty = !0;
  }
  forEach(t) {
    this.isDirty && this.children.sort(_h), this.isDirty = !1, this.children.forEach(t);
  }
}
function Kh(e, t) {
  const n = fe.now(), i = ({ timestamp: s }) => {
    const r = s - n;
    r >= t && (Fe(i), e(r - t));
  };
  return K.setup(i, !0), () => Fe(i);
}
function pn(e) {
  return ce(e) ? e.get() : e;
}
class Hh {
  constructor() {
    this.members = [];
  }
  add(t) {
    ts(this.members, t);
    for (let n = this.members.length - 1; n >= 0; n--) {
      const i = this.members[n];
      if (i === t || i === this.lead || i === this.prevLead)
        continue;
      const s = i.instance;
      (!s || s.isConnected === !1) && !i.snapshot && (Je(this.members, i), i.unmount());
    }
    t.scheduleRender();
  }
  remove(t) {
    if (Je(this.members, t), t === this.prevLead && (this.prevLead = void 0), t === this.lead) {
      const n = this.members[this.members.length - 1];
      n && this.promote(n);
    }
  }
  relegate(t) {
    for (let n = this.members.indexOf(t) - 1; n >= 0; n--) {
      const i = this.members[n];
      if (i.isPresent !== !1 && i.instance?.isConnected !== !1)
        return this.promote(i), !0;
    }
    return !1;
  }
  promote(t, n) {
    const i = this.lead;
    if (t !== i && (this.prevLead = i, this.lead = t, t.show(), i)) {
      i.updateSnapshot(), t.scheduleRender();
      const { layoutDependency: s } = i.options, { layoutDependency: r } = t.options;
      (s === void 0 || s !== r) && (t.resumeFrom = i, n && (i.preserveOpacity = !0), i.snapshot && (t.snapshot = i.snapshot, t.snapshot.latestValues = i.animationValues || i.latestValues), t.root?.isUpdating && (t.isLayoutDirty = !0)), t.options.crossfade === !1 && i.hide();
    }
  }
  exitAnimationComplete() {
    this.members.forEach((t) => {
      t.options.onExitComplete?.(), t.resumingFrom?.options.onExitComplete?.();
    });
  }
  scheduleRender() {
    this.members.forEach((t) => t.instance && t.scheduleRender(!1));
  }
  removeLeadSnapshot() {
    this.lead?.snapshot && (this.lead.snapshot = void 0);
  }
}
const mn = {
  /**
   * Global flag as to whether the tree has animated since the last time
   * we resized the window
   */
  hasAnimatedSinceResize: !0,
  /**
   * We set this to true once, on the first update. Any nodes added to the tree beyond that
   * update will be given a `data-projection-id` attribute.
   */
  hasEverUpdated: !1
}, Qn = ["", "X", "Y", "Z"], qh = 1e3;
let Yh = 0;
function Jn(e, t, n, i) {
  const { latestValues: s } = t;
  s[e] && (n[e] = s[e], t.setStaticValue(e, 0), i && (i[e] = 0));
}
function Rl(e) {
  if (e.hasCheckedOptimisedAppear = !0, e.root === e)
    return;
  const { visualElement: t } = e.options;
  if (!t)
    return;
  const n = Ja(t);
  if (window.MotionHasOptimisedAnimation(n, "transform")) {
    const { layout: s, layoutId: r } = e.options;
    window.MotionCancelOptimisedAnimation(n, "transform", K, !(s || r));
  }
  const { parent: i } = e;
  i && !i.hasCheckedOptimisedAppear && Rl(i);
}
function Ll({ attachResizeListener: e, defaultParent: t, measureScroll: n, checkIsScrollRoot: i, resetTransform: s }) {
  return class {
    constructor(o = {}, a = t?.()) {
      this.id = Yh++, this.animationId = 0, this.animationCommitId = 0, this.children = /* @__PURE__ */ new Set(), this.options = {}, this.isTreeAnimating = !1, this.isAnimationBlocked = !1, this.isLayoutDirty = !1, this.isProjectionDirty = !1, this.isSharedProjectionDirty = !1, this.isTransformDirty = !1, this.updateManuallyBlocked = !1, this.updateBlockedByResize = !1, this.isUpdating = !1, this.isSVG = !1, this.needsReset = !1, this.shouldResetTransform = !1, this.hasCheckedOptimisedAppear = !1, this.treeScale = { x: 1, y: 1 }, this.eventHandlers = /* @__PURE__ */ new Map(), this.hasTreeAnimated = !1, this.layoutVersion = 0, this.updateScheduled = !1, this.scheduleUpdate = () => this.update(), this.projectionUpdateScheduled = !1, this.checkUpdateFailed = () => {
        this.isUpdating && (this.isUpdating = !1, this.clearAllSnapshots());
      }, this.updateProjection = () => {
        this.projectionUpdateScheduled = !1, this.nodes.forEach(Qh), this.nodes.forEach(sp), this.nodes.forEach(rp), this.nodes.forEach(Jh);
      }, this.resolvedRelativeTargetAt = 0, this.linkedParentVersion = 0, this.hasProjected = !1, this.isVisible = !0, this.animationProgress = 0, this.sharedNodes = /* @__PURE__ */ new Map(), this.latestValues = o, this.root = a ? a.root || a : this, this.path = a ? [...a.path, a] : [], this.parent = a, this.depth = a ? a.depth + 1 : 0;
      for (let l = 0; l < this.path.length; l++)
        this.path[l].shouldResetTransform = !0;
      this.root === this && (this.nodes = new Gh());
    }
    addEventListener(o, a) {
      return this.eventHandlers.has(o) || this.eventHandlers.set(o, new vn()), this.eventHandlers.get(o).add(a);
    }
    notifyListeners(o, ...a) {
      const l = this.eventHandlers.get(o);
      l && l.notify(...a);
    }
    hasListeners(o) {
      return this.eventHandlers.has(o);
    }
    /**
     * Lifecycles
     */
    mount(o) {
      if (this.instance)
        return;
      this.isSVG = vt(o) && !fh(o), this.instance = o;
      const { layoutId: a, layout: l, visualElement: u } = this.options;
      if (u && !u.current && u.mount(o), this.root.nodes.add(this), this.parent && this.parent.children.add(this), this.root.hasTreeAnimated && (l || a) && (this.isLayoutDirty = !0), e) {
        let d, h = 0;
        const f = () => this.root.updateBlockedByResize = !1;
        K.read(() => {
          h = window.innerWidth;
        }), e(o, () => {
          const p = window.innerWidth;
          p !== h && (h = p, this.root.updateBlockedByResize = !0, d && d(), d = Kh(f, 250), mn.hasAnimatedSinceResize && (mn.hasAnimatedSinceResize = !1, this.nodes.forEach(to)));
        });
      }
      a && this.root.registerSharedNode(a, this), this.options.animate !== !1 && u && (a || l) && this.addEventListener("didUpdate", ({ delta: d, hasLayoutChanged: h, hasRelativeLayoutChanged: f, layout: p }) => {
        if (this.isTreeAnimationBlocked()) {
          this.target = void 0, this.relativeTarget = void 0;
          return;
        }
        const m = this.options.transition || u.getDefaultTransition() || up, { onLayoutAnimationStart: x, onLayoutAnimationComplete: v } = u.getProps(), w = !this.targetLayout || !El(this.targetLayout, p), T = !h && f;
        if (this.options.layoutRoot || this.resumeFrom || T || h && (w || !this.currentAnimation)) {
          this.resumeFrom && (this.resumingFrom = this.resumeFrom, this.resumingFrom.resumingFrom = void 0);
          const g = {
            ...bs(m, "layout"),
            onPlay: x,
            onComplete: v
          };
          (u.shouldReduceMotion || this.options.layoutRoot) && (g.delay = 0, g.type = !1), this.startAnimation(g), this.setAnimationOrigin(d, T, g.path);
        } else
          h || to(this), this.isLead() && this.options.onExitComplete && this.options.onExitComplete();
        this.targetLayout = p;
      });
    }
    unmount() {
      this.options.layoutId && this.willUpdate(), this.root.nodes.remove(this);
      const o = this.getStack();
      o && o.remove(this), this.parent && this.parent.children.delete(this), this.instance = void 0, this.eventHandlers.clear(), Fe(this.updateProjection);
    }
    // only on the root
    blockUpdate() {
      this.updateManuallyBlocked = !0;
    }
    unblockUpdate() {
      this.updateManuallyBlocked = !1;
    }
    isUpdateBlocked() {
      return this.updateManuallyBlocked || this.updateBlockedByResize;
    }
    isTreeAnimationBlocked() {
      return this.isAnimationBlocked || this.parent && this.parent.isTreeAnimationBlocked() || !1;
    }
    // Note: currently only running on root node
    startUpdate() {
      this.isUpdateBlocked() || (this.isUpdating = !0, this.nodes && this.nodes.forEach(op), this.animationId++);
    }
    getTransformTemplate() {
      const { visualElement: o } = this.options;
      return o && o.getProps().transformTemplate;
    }
    willUpdate(o = !0) {
      if (this.root.hasTreeAnimated = !0, this.root.isUpdateBlocked()) {
        this.options.onExitComplete && this.options.onExitComplete();
        return;
      }
      if (window.MotionCancelOptimisedAnimation && !this.hasCheckedOptimisedAppear && Rl(this), !this.root.isUpdating && this.root.startUpdate(), this.isLayoutDirty)
        return;
      this.isLayoutDirty = !0;
      for (let d = 0; d < this.path.length; d++) {
        const h = this.path[d];
        h.shouldResetTransform = !0, (typeof h.latestValues.x == "string" || typeof h.latestValues.y == "string") && (h.isLayoutDirty = !0), h.updateScroll("snapshot"), h.options.layoutRoot && h.willUpdate(!1);
      }
      const { layoutId: a, layout: l } = this.options;
      if (a === void 0 && !l)
        return;
      const u = this.getTransformTemplate();
      this.prevTransformTemplateValue = u ? u(this.latestValues, "") : void 0, this.updateSnapshot(), o && this.notifyListeners("willUpdate");
    }
    update() {
      if (this.updateScheduled = !1, this.isUpdateBlocked()) {
        const l = this.updateBlockedByResize;
        this.unblockUpdate(), this.updateBlockedByResize = !1, this.clearAllSnapshots(), l && this.nodes.forEach(tp), this.nodes.forEach(Jr);
        return;
      }
      if (this.animationId <= this.animationCommitId) {
        this.nodes.forEach(eo);
        return;
      }
      this.animationCommitId = this.animationId, this.isUpdating ? (this.isUpdating = !1, this.nodes.forEach(np), this.nodes.forEach(ip), this.nodes.forEach(Xh), this.nodes.forEach(Zh)) : this.nodes.forEach(eo), this.clearAllSnapshots();
      const a = fe.now();
      ae.delta = Pe(0, 1e3 / 60, a - ae.timestamp), ae.timestamp = a, ae.isProcessing = !0, Wn.update.process(ae), Wn.preRender.process(ae), Wn.render.process(ae), ae.isProcessing = !1;
    }
    didUpdate() {
      this.updateScheduled || (this.updateScheduled = !0, Ds.read(this.scheduleUpdate));
    }
    clearAllSnapshots() {
      this.nodes.forEach(ep), this.sharedNodes.forEach(ap);
    }
    scheduleUpdateProjection() {
      this.projectionUpdateScheduled || (this.projectionUpdateScheduled = !0, K.preRender(this.updateProjection, !1, !0));
    }
    scheduleCheckAfterUnmount() {
      K.postRender(() => {
        this.isLayoutDirty ? this.root.didUpdate() : this.root.checkUpdateFailed();
      });
    }
    /**
     * Update measurements
     */
    updateSnapshot() {
      this.snapshot || !this.instance || (this.snapshot = this.measure(), this.snapshot && !pe(this.snapshot.measuredBox.x) && !pe(this.snapshot.measuredBox.y) && (this.snapshot = void 0));
    }
    updateLayout() {
      if (!this.instance || (this.updateScroll(), !(this.options.alwaysMeasureLayout && this.isLead()) && !this.isLayoutDirty))
        return;
      if (this.resumeFrom && !this.resumeFrom.instance)
        for (let l = 0; l < this.path.length; l++)
          this.path[l].updateScroll();
      const o = this.layout;
      this.layout = this.measure(!1), this.layoutVersion++, this.layoutCorrected || (this.layoutCorrected = oe()), this.isLayoutDirty = !1, this.projectionDelta = void 0, this.notifyListeners("measure", this.layout.layoutBox);
      const { visualElement: a } = this.options;
      a && a.notify("LayoutMeasure", this.layout.layoutBox, o ? o.layoutBox : void 0);
    }
    updateScroll(o = "measure") {
      let a = !!(this.options.layoutScroll && this.instance);
      if (this.scroll && this.scroll.animationId === this.root.animationId && this.scroll.phase === o && (a = !1), a && this.instance) {
        const l = i(this.instance);
        this.scroll = {
          animationId: this.root.animationId,
          phase: o,
          isRoot: l,
          offset: n(this.instance),
          wasRoot: this.scroll ? this.scroll.isRoot : l
        };
      }
    }
    resetTransform() {
      if (!s)
        return;
      const o = this.isLayoutDirty || this.shouldResetTransform || this.options.alwaysMeasureLayout, a = this.projectionDelta && !Cl(this.projectionDelta), l = this.getTransformTemplate(), u = l ? l(this.latestValues, "") : void 0, d = u !== this.prevTransformTemplateValue;
      o && this.instance && (a || Ke(this.latestValues) || d) && (s(this.instance, u), this.shouldResetTransform = !1, this.scheduleRender());
    }
    measure(o = !0) {
      const a = this.measurePageBox();
      let l = this.removeElementScroll(a);
      return o && (l = this.removeTransform(l)), dp(l), {
        animationId: this.root.animationId,
        measuredBox: a,
        layoutBox: l,
        latestValues: {},
        source: this.id
      };
    }
    measurePageBox() {
      const { visualElement: o } = this.options;
      if (!o)
        return oe();
      const a = o.measureViewportBox();
      if (!(this.scroll?.wasRoot || this.path.some(fp))) {
        const { scroll: u } = this.root;
        u && (Ee(a.x, u.offset.x), Ee(a.y, u.offset.y));
      }
      return a;
    }
    removeElementScroll(o) {
      const a = oe();
      if (Se(a, o), this.scroll?.wasRoot)
        return a;
      for (let l = 0; l < this.path.length; l++) {
        const u = this.path[l], { scroll: d, options: h } = u;
        u !== this.root && d && h.layoutScroll && (d.wasRoot && Se(a, o), Ee(a.x, d.offset.x), Ee(a.y, d.offset.y));
      }
      return a;
    }
    applyTransform(o, a = !1, l) {
      const u = l || oe();
      Se(u, o);
      for (let d = 0; d < this.path.length; d++) {
        const h = this.path[d];
        !a && h.options.layoutScroll && h.scroll && h !== h.root && (Ee(u.x, -h.scroll.offset.x), Ee(u.y, -h.scroll.offset.y)), Ke(h.latestValues) && cn(u, h.latestValues, h.layout?.layoutBox);
      }
      return Ke(this.latestValues) && cn(u, this.latestValues, this.layout?.layoutBox), u;
    }
    removeTransform(o) {
      const a = oe();
      Se(a, o);
      for (let l = 0; l < this.path.length; l++) {
        const u = this.path[l];
        if (!Ke(u.latestValues))
          continue;
        let d;
        u.instance && (Vi(u.latestValues) && u.updateSnapshot(), d = oe(), Se(d, u.measurePageBox())), _r(a, u.latestValues, u.snapshot?.layoutBox, d);
      }
      return Ke(this.latestValues) && _r(a, this.latestValues), a;
    }
    setTargetDelta(o) {
      this.targetDelta = o, this.root.scheduleUpdateProjection(), this.isProjectionDirty = !0;
    }
    setOptions(o) {
      this.options = {
        ...this.options,
        ...o,
        crossfade: o.crossfade !== void 0 ? o.crossfade : !0
      };
    }
    clearMeasurements() {
      this.scroll = void 0, this.layout = void 0, this.snapshot = void 0, this.prevTransformTemplateValue = void 0, this.targetDelta = void 0, this.target = void 0, this.isLayoutDirty = !1;
    }
    forceRelativeParentToResolveTarget() {
      this.relativeParent && this.relativeParent.resolvedRelativeTargetAt !== ae.timestamp && this.relativeParent.resolveTargetDelta(!0);
    }
    resolveTargetDelta(o = !1) {
      const a = this.getLead();
      this.isProjectionDirty || (this.isProjectionDirty = a.isProjectionDirty), this.isTransformDirty || (this.isTransformDirty = a.isTransformDirty), this.isSharedProjectionDirty || (this.isSharedProjectionDirty = a.isSharedProjectionDirty);
      const l = !!this.resumingFrom || this !== a;
      if (!(o || l && this.isSharedProjectionDirty || this.isProjectionDirty || this.parent?.isProjectionDirty || this.attemptToResolveRelativeTarget || this.root.updateBlockedByResize))
        return;
      const { layout: d, layoutId: h } = this.options;
      if (!this.layout || !(d || h))
        return;
      this.resolvedRelativeTargetAt = ae.timestamp;
      const f = this.getClosestProjectingParent();
      f && this.linkedParentVersion !== f.layoutVersion && !f.options.layoutRoot && this.removeRelativeTarget(), !this.targetDelta && !this.relativeTarget && (this.options.layoutAnchor !== !1 && f && f.layout ? this.createRelativeTarget(f, this.layout.layoutBox, f.layout.layoutBox) : this.removeRelativeTarget()), !(!this.relativeTarget && !this.targetDelta) && (this.target || (this.target = oe(), this.targetWithTransforms = oe()), this.relativeTarget && this.relativeTargetOrigin && this.relativeParent && this.relativeParent.target ? (this.forceRelativeParentToResolveTarget(), Lh(this.target, this.relativeTarget, this.relativeParent.target, this.options.layoutAnchor || void 0)) : this.targetDelta ? (this.resumingFrom ? this.applyTransform(this.layout.layoutBox, !1, this.target) : Se(this.target, this.layout.layoutBox), ul(this.target, this.targetDelta)) : Se(this.target, this.layout.layoutBox), this.attemptToResolveRelativeTarget && (this.attemptToResolveRelativeTarget = !1, this.options.layoutAnchor !== !1 && f && !!f.resumingFrom == !!this.resumingFrom && !f.options.layoutScroll && f.target && this.animationProgress !== 1 ? this.createRelativeTarget(f, this.target, f.target) : this.relativeParent = this.relativeTarget = void 0));
    }
    getClosestProjectingParent() {
      if (!(!this.parent || Vi(this.parent.latestValues) || cl(this.parent.latestValues)))
        return this.parent.isProjecting() ? this.parent : this.parent.getClosestProjectingParent();
    }
    isProjecting() {
      return !!((this.relativeTarget || this.targetDelta || this.options.layoutRoot) && this.layout);
    }
    createRelativeTarget(o, a, l) {
      this.relativeParent = o, this.linkedParentVersion = o.layoutVersion, this.forceRelativeParentToResolveTarget(), this.relativeTarget = oe(), this.relativeTargetOrigin = oe(), Pn(this.relativeTargetOrigin, a, l, this.options.layoutAnchor || void 0), Se(this.relativeTarget, this.relativeTargetOrigin);
    }
    removeRelativeTarget() {
      this.relativeParent = this.relativeTarget = void 0;
    }
    calcProjection() {
      const o = this.getLead(), a = !!this.resumingFrom || this !== o;
      let l = !0;
      if ((this.isProjectionDirty || this.parent?.isProjectionDirty) && (l = !1), a && (this.isSharedProjectionDirty || this.isTransformDirty) && (l = !1), this.resolvedRelativeTargetAt === ae.timestamp && (l = !1), l)
        return;
      const { layout: u, layoutId: d } = this.options;
      if (this.isTreeAnimating = !!(this.parent && this.parent.isTreeAnimating || this.currentAnimation || this.pendingAnimation), this.isTreeAnimating || (this.targetDelta = this.relativeTarget = void 0), !this.layout || !(u || d))
        return;
      Se(this.layoutCorrected, this.layout.layoutBox);
      const h = this.treeScale.x, f = this.treeScale.y;
      zf(this.layoutCorrected, this.treeScale, this.path, a), o.layout && !o.target && (this.treeScale.x !== 1 || this.treeScale.y !== 1) && (o.target = o.layout.layoutBox, o.targetWithTransforms = oe());
      const { target: p } = o;
      if (!p) {
        this.prevProjectionDelta && (this.createProjectionDeltas(), this.scheduleRender());
        return;
      }
      !this.projectionDelta || !this.prevProjectionDelta ? this.createProjectionDeltas() : (Br(this.prevProjectionDelta.x, this.projectionDelta.x), Br(this.prevProjectionDelta.y, this.projectionDelta.y)), Et(this.projectionDelta, this.layoutCorrected, p, this.latestValues), (this.treeScale.x !== h || this.treeScale.y !== f || !Yr(this.projectionDelta.x, this.prevProjectionDelta.x) || !Yr(this.projectionDelta.y, this.prevProjectionDelta.y)) && (this.hasProjected = !0, this.scheduleRender(), this.notifyListeners("projectionUpdate", p));
    }
    hide() {
      this.isVisible = !1;
    }
    show() {
      this.isVisible = !0;
    }
    scheduleRender(o = !0) {
      if (this.options.visualElement?.scheduleRender(), o) {
        const a = this.getStack();
        a && a.scheduleRender();
      }
      this.resumingFrom && !this.resumingFrom.instance && (this.resumingFrom = void 0);
    }
    createProjectionDeltas() {
      this.prevProjectionDelta = ut(), this.projectionDelta = ut(), this.projectionDeltaWithTransform = ut();
    }
    setAnimationOrigin(o, a = !1, l) {
      const u = this.snapshot, d = u ? u.latestValues : {}, h = { ...this.latestValues }, f = ut();
      (!this.relativeParent || !this.relativeParent.options.layoutRoot) && (this.relativeTarget = this.relativeTargetOrigin = void 0), this.attemptToResolveRelativeTarget = !a;
      const p = oe(), m = u ? u.source : void 0, x = this.layout ? this.layout.source : void 0, v = m !== x, w = this.getStack(), T = !w || w.members.length <= 1, g = !!(v && !T && this.options.crossfade === !0 && !this.path.some(cp));
      this.animationProgress = 0;
      let S;
      const R = l?.interpolateProjection(o);
      this.mixTargetDelta = (D) => {
        const k = D / 1e3, A = R?.(k);
        A ? (f.x.translate = A.x, f.x.scale = q(o.x.scale, 1, k), f.x.origin = o.x.origin, f.x.originPoint = o.x.originPoint, f.y.translate = A.y, f.y.scale = q(o.y.scale, 1, k), f.y.origin = o.y.origin, f.y.originPoint = o.y.originPoint) : (no(f.x, o.x, k), no(f.y, o.y, k)), this.setTargetDelta(f), this.relativeTarget && this.relativeTargetOrigin && this.layout && this.relativeParent && this.relativeParent.layout && (Pn(p, this.layout.layoutBox, this.relativeParent.layout.layoutBox, this.options.layoutAnchor || void 0), lp(this.relativeTarget, this.relativeTargetOrigin, p, k), S && Bh(this.relativeTarget, S) && (this.isProjectionDirty = !1), S || (S = oe()), Se(S, this.relativeTarget)), v && (this.animationValues = h, Uh(h, d, this.latestValues, k, g, T)), A && A.rotate !== void 0 && (this.animationValues || (this.animationValues = h), this.animationValues.pathRotation = A.rotate), this.root.scheduleUpdateProjection(), this.scheduleRender(), this.animationProgress = k;
      }, this.mixTargetDelta(this.options.layoutRoot ? 1e3 : 0);
    }
    startAnimation(o) {
      this.notifyListeners("animationStart"), this.currentAnimation?.stop(), this.resumingFrom?.currentAnimation?.stop(), this.pendingAnimation && (Fe(this.pendingAnimation), this.pendingAnimation = void 0), this.pendingAnimation = K.update(() => {
        mn.hasAnimatedSinceResize = !0, this.motionValue || (this.motionValue = Oe(0)), this.motionValue.jump(0, !1), this.currentAnimation = Vl(this.motionValue, [0, 1e3], {
          ...o,
          velocity: 0,
          isSync: !0,
          onUpdate: (a) => {
            this.mixTargetDelta(a), o.onUpdate && o.onUpdate(a);
          },
          onComplete: () => {
            o.onComplete && o.onComplete(), this.completeAnimation();
          }
        }), hd(this.currentAnimation, this), this.resumingFrom && (this.resumingFrom.currentAnimation = this.currentAnimation), this.pendingAnimation = void 0;
      });
    }
    completeAnimation() {
      this.resumingFrom && (this.resumingFrom.currentAnimation = void 0, this.resumingFrom.preserveOpacity = void 0);
      const o = this.getStack();
      o && o.exitAnimationComplete(), this.resumingFrom = this.currentAnimation = this.animationValues = void 0, this.notifyListeners("animationComplete");
    }
    finishAnimation() {
      this.currentAnimation && (this.mixTargetDelta && this.mixTargetDelta(qh), this.currentAnimation.stop()), this.completeAnimation();
    }
    applyTransformsToTarget() {
      const o = this.getLead(), { targetWithTransforms: a, layout: l, latestValues: u } = o;
      let { target: d } = o;
      if (!(!a || !d || !l)) {
        if (this !== o && this.layout && l && Fl(this.options.animationType, this.layout.layoutBox, l.layoutBox)) {
          d = this.target || oe();
          const h = pe(this.layout.layoutBox.x);
          d.x.min = o.target.x.min, d.x.max = d.x.min + h;
          const f = pe(this.layout.layoutBox.y);
          d.y.min = o.target.y.min, d.y.max = d.y.min + f;
        }
        Se(a, d), cn(a, u), Et(this.projectionDeltaWithTransform, this.layoutCorrected, a, u);
      }
    }
    registerSharedNode(o, a) {
      this.sharedNodes.has(o) || this.sharedNodes.set(o, new Hh()), this.sharedNodes.get(o).add(a);
      const u = a.options.initialPromotionConfig;
      a.promote({
        transition: u ? u.transition : void 0,
        preserveFollowOpacity: u && u.shouldPreserveFollowOpacity ? u.shouldPreserveFollowOpacity(a) : void 0
      });
    }
    isLead() {
      const o = this.getStack();
      return o ? o.lead === this : !0;
    }
    getLead() {
      const { layoutId: o } = this.options;
      return o ? this.getStack()?.lead || this : this;
    }
    getPrevLead() {
      const { layoutId: o } = this.options;
      return o ? this.getStack()?.prevLead : void 0;
    }
    getStack() {
      const { layoutId: o } = this.options;
      if (o)
        return this.root.sharedNodes.get(o);
    }
    promote({ needsReset: o, transition: a, preserveFollowOpacity: l } = {}) {
      const u = this.getStack();
      u && u.promote(this, l), o && (this.projectionDelta = void 0, this.needsReset = !0), a && this.setOptions({ transition: a });
    }
    relegate() {
      const o = this.getStack();
      return o ? o.relegate(this) : !1;
    }
    resetSkewAndRotation() {
      const { visualElement: o } = this.options;
      if (!o)
        return;
      let a = !1;
      const { latestValues: l } = o;
      if ((l.z || l.rotate || l.rotateX || l.rotateY || l.rotateZ || l.skewX || l.skewY) && (a = !0), !a)
        return;
      const u = {};
      l.z && Jn("z", o, u, this.animationValues);
      for (let d = 0; d < Qn.length; d++)
        Jn(`rotate${Qn[d]}`, o, u, this.animationValues), Jn(`skew${Qn[d]}`, o, u, this.animationValues);
      o.render();
      for (const d in u)
        o.setStaticValue(d, u[d]), this.animationValues && (this.animationValues[d] = u[d]);
      o.scheduleRender();
    }
    applyProjectionStyles(o, a) {
      if (!this.instance || this.isSVG)
        return;
      if (!this.isVisible) {
        o.visibility = "hidden";
        return;
      }
      const l = this.getTransformTemplate();
      if (this.needsReset) {
        this.needsReset = !1, o.visibility = "", o.opacity = "", o.pointerEvents = pn(a?.pointerEvents) || "", o.transform = l ? l(this.latestValues, "") : "none";
        return;
      }
      const u = this.getLead();
      if (!this.projectionDelta || !this.layout || !u.target) {
        this.options.layoutId && (o.opacity = this.latestValues.opacity !== void 0 ? this.latestValues.opacity : 1, o.pointerEvents = pn(a?.pointerEvents) || ""), this.hasProjected && !Ke(this.latestValues) && (o.transform = l ? l({}, "") : "none", this.hasProjected = !1);
        return;
      }
      o.visibility = "";
      const d = u.animationValues || u.latestValues;
      this.applyTransformsToTarget();
      let h = $h(this.projectionDeltaWithTransform, this.treeScale, d);
      l && (h = l(d, h)), o.transform = h;
      const { x: f, y: p } = this.projectionDelta;
      o.transformOrigin = `${f.origin * 100}% ${p.origin * 100}% 0`, u.animationValues ? o.opacity = u === this ? d.opacity ?? this.latestValues.opacity ?? 1 : this.preserveOpacity ? this.latestValues.opacity : d.opacityExit : o.opacity = u === this ? d.opacity !== void 0 ? d.opacity : "" : d.opacityExit !== void 0 ? d.opacityExit : 0;
      for (const m in Li) {
        if (d[m] === void 0)
          continue;
        const { correct: x, applyTo: v, isCSSVariable: w } = Li[m], T = h === "none" ? d[m] : x(d[m], u);
        if (v) {
          const g = v.length;
          for (let S = 0; S < g; S++)
            o[v[S]] = T;
        } else
          w ? this.options.visualElement.renderState.vars[m] = T : o[m] = T;
      }
      this.options.layoutId && (o.pointerEvents = u === this ? pn(a?.pointerEvents) || "" : "none");
    }
    clearSnapshot() {
      this.resumeFrom = this.snapshot = void 0;
    }
    // Only run on root
    resetTree() {
      this.root.nodes.forEach((o) => o.currentAnimation?.stop()), this.root.nodes.forEach(Jr), this.root.sharedNodes.clear();
    }
  };
}
function Xh(e) {
  e.updateLayout();
}
function Zh(e) {
  const t = e.resumeFrom?.snapshot || e.snapshot;
  if (e.isLead() && e.layout && t && e.hasListeners("didUpdate")) {
    const { layoutBox: n, measuredBox: i } = e.layout, { animationType: s } = e.options, r = t.source !== e.layout.source;
    if (s === "size")
      Ce((d) => {
        const h = r ? t.measuredBox[d] : t.layoutBox[d], f = pe(h);
        h.min = n[d].min, h.max = h.min + f;
      });
    else if (s === "x" || s === "y") {
      const d = s === "x" ? "y" : "x";
      Fi(r ? t.measuredBox[d] : t.layoutBox[d], n[d]);
    } else Fl(s, t.layoutBox, n) && Ce((d) => {
      const h = r ? t.measuredBox[d] : t.layoutBox[d], f = pe(n[d]);
      h.max = h.min + f, e.relativeTarget && !e.currentAnimation && (e.isProjectionDirty = !0, e.relativeTarget[d].max = e.relativeTarget[d].min + f);
    });
    const o = ut();
    Et(o, n, t.layoutBox);
    const a = ut();
    r ? Et(a, e.applyTransform(i, !0), t.measuredBox) : Et(a, n, t.layoutBox);
    const l = !Cl(o);
    let u = !1;
    if (!e.resumeFrom) {
      const d = e.getClosestProjectingParent();
      if (d && !d.resumeFrom) {
        const { snapshot: h, layout: f } = d;
        if (h && f) {
          const p = e.options.layoutAnchor || void 0, m = oe();
          Pn(m, t.layoutBox, h.layoutBox, p);
          const x = oe();
          Pn(x, n, f.layoutBox, p), El(m, x) || (u = !0), d.options.layoutRoot && (e.relativeTarget = x, e.relativeTargetOrigin = m, e.relativeParent = d);
        }
      }
    }
    e.notifyListeners("didUpdate", {
      layout: n,
      snapshot: t,
      delta: a,
      layoutDelta: o,
      hasLayoutChanged: l,
      hasRelativeLayoutChanged: u
    });
  } else if (e.isLead()) {
    const { onExitComplete: n } = e.options;
    n && n();
  }
  e.options.transition = void 0;
}
function Qh(e) {
  e.parent && (e.isProjecting() || (e.isProjectionDirty = e.parent.isProjectionDirty), e.isSharedProjectionDirty || (e.isSharedProjectionDirty = !!(e.isProjectionDirty || e.parent.isProjectionDirty || e.parent.isSharedProjectionDirty)), e.isTransformDirty || (e.isTransformDirty = e.parent.isTransformDirty));
}
function Jh(e) {
  e.isProjectionDirty = e.isSharedProjectionDirty = e.isTransformDirty = !1;
}
function ep(e) {
  e.clearSnapshot();
}
function Jr(e) {
  e.clearMeasurements();
}
function tp(e) {
  e.isLayoutDirty = !0, e.updateLayout();
}
function eo(e) {
  e.isLayoutDirty = !1;
}
function np(e) {
  e.isAnimationBlocked && e.layout && !e.isLayoutDirty && (e.snapshot = e.layout, e.isLayoutDirty = !0);
}
function ip(e) {
  const { visualElement: t } = e.options;
  t && t.getProps().onBeforeLayoutMeasure && t.notify("BeforeLayoutMeasure"), e.resetTransform();
}
function to(e) {
  e.finishAnimation(), e.targetDelta = e.relativeTarget = e.target = void 0, e.isProjectionDirty = !0;
}
function sp(e) {
  e.resolveTargetDelta();
}
function rp(e) {
  e.calcProjection();
}
function op(e) {
  e.resetSkewAndRotation();
}
function ap(e) {
  e.removeLeadSnapshot();
}
function no(e, t, n) {
  e.translate = q(t.translate, 0, n), e.scale = q(t.scale, 1, n), e.origin = t.origin, e.originPoint = t.originPoint;
}
function io(e, t, n, i) {
  e.min = q(t.min, n.min, i), e.max = q(t.max, n.max, i);
}
function lp(e, t, n, i) {
  io(e.x, t.x, n.x, i), io(e.y, t.y, n.y, i);
}
function cp(e) {
  return e.animationValues && e.animationValues.opacityExit !== void 0;
}
const up = {
  duration: 0.45,
  ease: [0.4, 0, 0.1, 1]
}, so = (e) => typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().includes(e), ro = so("applewebkit/") && !so("chrome/") ? Math.round : Ae;
function oo(e) {
  e.min = ro(e.min), e.max = ro(e.max);
}
function dp(e) {
  oo(e.x), oo(e.y);
}
function Fl(e, t, n) {
  return e === "position" || e === "preserve-aspect" && !Rh(qr(t), qr(n), 0.2);
}
function fp(e) {
  return e !== e.root && e.scroll?.wasRoot;
}
const hp = Ll({
  attachResizeListener: (e, t) => $t(e, "resize", t),
  measureScroll: () => ({
    x: document.documentElement.scrollLeft || document.body?.scrollLeft || 0,
    y: document.documentElement.scrollTop || document.body?.scrollTop || 0
  }),
  checkIsScrollRoot: () => !0
}), ei = {
  current: void 0
}, Ol = Ll({
  measureScroll: (e) => ({
    x: e.scrollLeft,
    y: e.scrollTop
  }),
  defaultParent: () => {
    if (!ei.current) {
      const e = new hp({});
      e.mount(window), e.setOptions({ layoutScroll: !0 }), ei.current = e;
    }
    return ei.current;
  },
  resetTransform: (e, t) => {
    e.style.transform = t !== void 0 ? t : "none";
  },
  checkIsScrollRoot: (e) => window.getComputedStyle(e).position === "fixed"
}), In = gt({
  transformPagePoint: (e) => e,
  isStatic: !1,
  reducedMotion: "never"
});
function ao(e, t) {
  if (typeof e == "function")
    return e(t);
  e != null && (e.current = t);
}
function pp(...e) {
  return (t) => {
    let n = !1;
    const i = e.map((s) => {
      const r = ao(s, t);
      return !n && typeof r == "function" && (n = !0), r;
    });
    if (n)
      return () => {
        for (let s = 0; s < i.length; s++) {
          const r = i[s];
          typeof r == "function" ? r() : ao(e[s], null);
        }
      };
  };
}
function mp(...e) {
  return Dn.useCallback(pp(...e), e);
}
class gp extends Dn.Component {
  getSnapshotBeforeUpdate(t) {
    const n = this.props.childRef.current;
    if (ht(n) && t.isPresent && !this.props.isPresent && this.props.pop !== !1) {
      const i = n.offsetParent, s = ht(i) && i.offsetWidth || 0, r = ht(i) && i.offsetHeight || 0, o = getComputedStyle(n), a = this.props.sizeRef.current;
      a.height = parseFloat(o.height), a.width = parseFloat(o.width), a.top = n.offsetTop, a.left = n.offsetLeft, a.right = s - a.width - a.left, a.bottom = r - a.height - a.top, a.direction = o.direction;
    }
    return null;
  }
  /**
   * Required with getSnapshotBeforeUpdate to stop React complaining.
   */
  componentDidUpdate() {
  }
  render() {
    return this.props.children;
  }
}
function yp({ children: e, isPresent: t, anchorX: n, anchorY: i, root: s, pop: r }) {
  const o = Te(), a = C(null), l = C({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    direction: "ltr"
  }), { nonce: u } = ue(In), d = r !== !1 ? e.props?.ref ?? e?.ref : void 0, h = mp(a, d);
  return Ui(() => {
    const { width: f, height: p, top: m, left: x, right: v, bottom: w, direction: T } = l.current;
    if (t || r === !1 || !a.current || !f || !p)
      return;
    const g = T === "rtl", S = n === "left" ? g ? `right: ${v}` : `left: ${x}` : g ? `left: ${x}` : `right: ${v}`, R = i === "bottom" ? `bottom: ${w}` : `top: ${m}`;
    a.current.dataset.motionPopId = o;
    const D = document.createElement("style");
    u && (D.nonce = u);
    const k = s ?? document.head;
    return k.appendChild(D), D.sheet && D.sheet.insertRule(`
          [data-motion-pop-id="${o}"] {
            position: absolute !important;
            width: ${f}px !important;
            height: ${p}px !important;
            ${S}px !important;
            ${R}px !important;
          }
        `), () => {
      a.current?.removeAttribute("data-motion-pop-id"), k.contains(D) && k.removeChild(D);
    };
  }, [t]), c(gp, { isPresent: t, childRef: a, sizeRef: l, pop: r, children: r === !1 ? e : Dn.cloneElement(e, { ref: h }) });
}
const xp = ({ children: e, initial: t, isPresent: n, onExitComplete: i, custom: s, presenceAffectsLayout: r, mode: o, anchorX: a, anchorY: l, root: u }) => {
  const d = zt(vp), h = Te(), f = C(n), p = C(i);
  Lt(() => {
    f.current = n, p.current = i;
  });
  let m = !0, x = he(() => (m = !1, {
    id: h,
    initial: t,
    isPresent: n,
    custom: s,
    onExitComplete: (v) => {
      d.set(v, !0);
      for (const w of d.values())
        if (!w)
          return;
      i && i();
    },
    register: (v) => (d.set(v, !1), () => {
      d.delete(v), !f.current && !d.size && p.current?.();
    })
  }), [n, d, i]);
  return r && m && (x = { ...x }), he(() => {
    d.forEach((v, w) => d.set(w, !1));
  }, [n]), Dn.useEffect(() => {
    !n && !d.size && i && i();
  }, [n]), e = c(yp, { pop: o === "popLayout", isPresent: n, anchorX: a, anchorY: l, root: u, children: e }), c(Wt.Provider, { value: x, children: e });
};
function vp() {
  return /* @__PURE__ */ new Map();
}
function Il(e = !0) {
  const t = ue(Wt);
  if (t === null)
    return [!0, null];
  const { isPresent: n, onExitComplete: i, register: s } = t, r = Te();
  F(() => {
    if (e)
      return s(r);
  }, [e]);
  const o = Z(() => e && i && i(r), [r, i, e]);
  return !n && i ? [!1, o] : [!0];
}
function bp() {
  return wp(ue(Wt));
}
function wp(e) {
  return e === null ? !0 : e.isPresent;
}
const Jt = (e) => e.key || "";
function lo(e) {
  const t = [];
  return Cc.forEach(e, (n) => {
    Ec(n) && t.push(n);
  }), t;
}
const me = ({ children: e, custom: t, initial: n = !0, onExitComplete: i, presenceAffectsLayout: s = !0, mode: r = "sync", propagate: o = !1, anchorX: a = "left", anchorY: l = "top", root: u }) => {
  const [d, h] = Il(o), f = he(() => lo(e), [e]), p = o && !d ? [] : f.map(Jt), m = C(!0), x = C(f), v = zt(() => /* @__PURE__ */ new Map()), w = C(/* @__PURE__ */ new Set()), [T, g] = O(f), [S, R] = O(f);
  Lt(() => {
    o && !d && !S.length && h?.();
  }, [d, o, S.length, h]), Lt(() => {
    m.current = !1, x.current = f;
    for (let A = 0; A < S.length; A++) {
      const N = Jt(S[A]);
      p.includes(N) ? (v.delete(N), w.current.delete(N)) : v.get(N) !== !0 && v.set(N, !1);
    }
  }, [S, p.length, p.join("-")]);
  const D = [];
  if (f !== T) {
    let A = [...f], N = 0;
    for (const M of S) {
      const b = p.indexOf(Jt(M));
      b === -1 ? (A.splice(N++, 0, M), D.push(M)) : N = b + D.length + 1;
    }
    return r === "wait" && D.length && (A = D), R(lo(A)), g(f), null;
  }
  process.env.NODE_ENV !== "production" && r === "wait" && S.length > 1 && console.warn(`You're attempting to animate multiple children within AnimatePresence, but its mode is set to "wait". This will lead to odd visual behaviour.`);
  const { forceRender: k } = ue(es);
  return c(G, { children: S.map((A) => {
    const N = Jt(A), M = o && !d ? !1 : f === S || p.includes(N), b = () => {
      if (w.current.has(N))
        return;
      if (v.has(N))
        w.current.add(N), v.set(N, !0);
      else
        return;
      let B = !0;
      v.forEach(($) => {
        $ || (B = !1);
      }), B && (k?.(), R(x.current), o && h?.(), i && i());
    };
    return c(xp, { isPresent: M, initial: !m.current || n ? void 0 : !1, custom: t, presenceAffectsLayout: s, mode: r, root: u, onExitComplete: M ? void 0 : b, anchorX: a, anchorY: l, children: A }, N);
  }) });
}, Bl = gt({ strict: !1 }), co = {
  animation: [
    "animate",
    "variants",
    "whileHover",
    "whileTap",
    "exit",
    "whileInView",
    "whileFocus",
    "whileDrag"
  ],
  exit: ["exit"],
  drag: ["drag", "dragControls"],
  focus: ["whileFocus"],
  hover: ["whileHover", "onHoverStart", "onHoverEnd"],
  tap: ["whileTap", "onTap", "onTapStart", "onTapCancel"],
  pan: ["onPan", "onPanStart", "onPanSessionStart", "onPanEnd"],
  inView: ["whileInView", "onViewportEnter", "onViewportLeave"],
  layout: ["layout", "layoutId"]
};
let uo = !1;
function kp() {
  if (uo)
    return;
  const e = {};
  for (const t in co)
    e[t] = {
      isEnabled: (n) => co[t].some((i) => !!n[i])
    };
  xl(e), uo = !0;
}
function $l() {
  return kp(), gh();
}
function Tp(e) {
  const t = $l();
  for (const n in e)
    t[n] = {
      ...t[n],
      ...e[n]
    };
  xl(t);
}
const Bn = /* @__PURE__ */ gt({});
function Sp(e, t) {
  if (On(e)) {
    const { initial: n, animate: i } = e;
    return {
      initial: n === !1 || Bt(n) ? n : void 0,
      animate: Bt(i) ? i : void 0
    };
  }
  return e.inherit !== !1 ? t : {};
}
function Np(e) {
  const { initial: t, animate: n } = Sp(e, ue(Bn));
  return he(() => ({ initial: t, animate: n }), [fo(t), fo(n)]);
}
function fo(e) {
  return Array.isArray(e) ? e.join(" ") : e;
}
const Os = () => ({
  style: {},
  transform: {},
  transformOrigin: {},
  vars: {}
});
function jl(e, t, n) {
  for (const i in t)
    !ce(t[i]) && !wl(i, n) && (e[i] = t[i]);
}
function Ap({ transformTemplate: e }, t) {
  return he(() => {
    const n = Os();
    return Ms(n, t, e), Object.assign({}, n.vars, n.style);
  }, [t]);
}
function Pp(e, t) {
  const n = e.style || {}, i = {};
  return jl(i, n, e), Object.assign(i, Ap(e, t)), i;
}
function Mp(e, t) {
  const n = {}, i = Pp(e, t);
  return e.drag && e.dragListener !== !1 && (n.draggable = !1, i.userSelect = i.WebkitUserSelect = i.WebkitTouchCallout = "none", i.touchAction = e.drag === !0 ? "none" : `pan-${e.drag === "x" ? "y" : "x"}`), e.tabIndex === void 0 && (e.onTap || e.onTapStart || e.whileTap) && (n.tabIndex = 0), n.style = i, n;
}
const Ul = () => ({
  ...Os(),
  attrs: {}
});
function Cp(e, t, n, i) {
  const s = he(() => {
    const r = Ul();
    return ol(r, t, Tl(i), e.transformTemplate, e.style), {
      ...r.attrs,
      style: { ...r.style }
    };
  }, [t]);
  if (e.style) {
    const r = {};
    jl(r, e.style, e), s.style = { ...r, ...s.style };
  }
  return s;
}
const Ep = /* @__PURE__ */ new Set([
  "animate",
  "exit",
  "variants",
  "initial",
  "style",
  "values",
  "variants",
  "transition",
  "transformTemplate",
  "custom",
  "inherit",
  "onBeforeLayoutMeasure",
  "onAnimationStart",
  "onAnimationComplete",
  "onUpdate",
  "onDragStart",
  "onDrag",
  "onDragEnd",
  "onMeasureDragConstraints",
  "onDirectionLock",
  "onDragTransitionEnd",
  "_dragX",
  "_dragY",
  "onHoverStart",
  "onHoverEnd",
  "onViewportEnter",
  "onViewportLeave",
  "globalTapTarget",
  "propagate",
  "ignoreStrict",
  "viewport"
]);
function Mn(e) {
  return e.startsWith("while") || e.startsWith("drag") && e !== "draggable" || e.startsWith("layout") || e.startsWith("onTap") || e.startsWith("onPan") || e.startsWith("onLayout") || Ep.has(e);
}
function Dp(e, t) {
  return e.startsWith("on") ? !Mn(e) : t?.(e) ?? !Mn(e);
}
function Vp(e, t, n, i) {
  const s = {};
  for (const r in e)
    r === "values" && typeof e.values == "object" || ce(e[r]) || (Dp(r, i) || n === !0 && Mn(r) || !t && !Mn(r) || // If trying to use native HTML drag events, forward drag listeners
    e.draggable && r.startsWith("onDrag")) && (s[r] = e[r]);
  return s;
}
const Rp = [
  "animate",
  "circle",
  "defs",
  "desc",
  "ellipse",
  "g",
  "image",
  "line",
  "filter",
  "marker",
  "mask",
  "metadata",
  "path",
  "pattern",
  "polygon",
  "polyline",
  "rect",
  "stop",
  "switch",
  "symbol",
  "svg",
  "text",
  "tspan",
  "use",
  "view"
];
function Is(e) {
  return (
    /**
     * If it's not a string, it's a custom React component. Currently we only support
     * HTML custom React components.
     */
    typeof e != "string" || /**
     * If it contains a dash, the element is a custom HTML webcomponent.
     */
    e.includes("-") ? !1 : (
      /**
       * If it's in our list of lowercase SVG tags, it's an SVG component
       */
      !!(Rp.indexOf(e) > -1 || /**
       * If it contains a capital letter, it's an SVG component
       */
      /[A-Z]/u.test(e))
    )
  );
}
function Lp(e, t, n, { latestValues: i }, s, r = !1, o, a) {
  const u = (o ?? Is(e) ? Cp : Mp)(t, i, s, e), d = Vp(t, typeof e == "string", r, a), h = e !== zi ? { ...d, ...u, ref: n } : {}, { children: f } = t, p = he(() => ce(f) ? f.get() : f, [f]);
  return Dc(e, {
    ...h,
    children: p
  });
}
function Fp({ scrapeMotionValuesFromProps: e, createRenderState: t }, n, i, s) {
  return {
    latestValues: Op(n, i, s, e),
    renderState: t()
  };
}
function Op(e, t, n, i) {
  const s = {}, r = i(e, {});
  for (const f in r)
    s[f] = pn(r[f]);
  let { initial: o, animate: a } = e;
  const l = On(e), u = gl(e);
  t && u && !l && e.inherit !== !1 && (o === void 0 && (o = t.initial), a === void 0 && (a = t.animate));
  let d = n ? n.initial === !1 : !1;
  d = d || o === !1;
  const h = d ? a : o;
  if (h && typeof h != "boolean" && !Fn(h)) {
    const f = Array.isArray(h) ? h : [h];
    for (let p = 0; p < f.length; p++) {
      const m = ws(e, f[p]);
      if (m) {
        const { transitionEnd: x, transition: v, ...w } = m;
        for (const T in w) {
          let g = w[T];
          if (Array.isArray(g)) {
            const S = d ? g.length - 1 : 0;
            g = g[S];
          }
          g !== null && (s[T] = g);
        }
        for (const T in x)
          s[T] = x[T];
      }
    }
  }
  return s;
}
const zl = (e) => (t, n) => {
  const i = ue(Bn), s = ue(Wt), r = () => Fp(e, t, i, s);
  return n ? r() : zt(r);
}, Ip = /* @__PURE__ */ zl({
  scrapeMotionValuesFromProps: Fs,
  createRenderState: Os
}), Bp = /* @__PURE__ */ zl({
  scrapeMotionValuesFromProps: Sl,
  createRenderState: Ul
}), $p = /* @__PURE__ */ Symbol.for("motionComponentSymbol");
function jp(e, t, n) {
  const i = C(n);
  Ui(() => {
    i.current = n;
  });
  const s = C(null);
  return Z((r) => {
    r && e.onMount?.(r), t && (r ? t.mount(r) : t.unmount());
    const o = i.current;
    if (typeof o == "function")
      if (r) {
        const a = o(r);
        typeof a == "function" && (s.current = a);
      } else s.current ? (s.current(), s.current = null) : o(r);
    else o && (o.current = r);
  }, [t]);
}
const Wl = gt({});
function st(e) {
  return e && typeof e == "object" && Object.prototype.hasOwnProperty.call(e, "current");
}
function Up(e, t, n, i, s, r) {
  const { visualElement: o } = ue(Bn), a = ue(Bl), l = ue(Wt), u = ue(In), d = u.reducedMotion, h = u.skipAnimations, f = C(null), p = C(!1);
  i = i || a.renderer, !f.current && i && (f.current = i(e, {
    visualState: t,
    parent: o,
    props: n,
    presenceContext: l,
    blockInitialAnimation: l ? l.initial === !1 : !1,
    reducedMotionConfig: d,
    skipAnimations: h,
    isSVG: r
  }), p.current && f.current && (f.current.manuallyAnimateOnMount = !0));
  const m = f.current, x = ue(Wl);
  m && !m.projection && s && (m.type === "html" || m.type === "svg") && zp(f.current, n, s, x);
  const v = C(!1);
  Ui(() => {
    m && v.current && m.update(n, l);
  });
  const w = n[Qa], T = C(!!w && typeof window < "u" && !window.MotionHandoffIsComplete?.(w) && window.MotionHasOptimisedAnimation?.(w));
  return Lt(() => {
    p.current = !0, m && (v.current = !0, window.MotionIsMounted = !0, m.updateFeatures(), m.scheduleRenderMicrotask(), T.current && m.animationState && m.animationState.animateChanges());
  }), F(() => {
    m && (!T.current && m.animationState && m.animationState.animateChanges(), T.current && (queueMicrotask(() => {
      window.MotionHandoffMarkAsComplete?.(w);
    }), T.current = !1), m.enteringChildren = void 0);
  }), m;
}
function zp(e, t, n, i) {
  const { layoutId: s, layout: r, drag: o, dragConstraints: a, layoutScroll: l, layoutRoot: u, layoutAnchor: d, layoutCrossfade: h } = t;
  e.projection = new n(e.latestValues, t["data-framer-portal-id"] ? void 0 : _l(e.parent)), e.projection.setOptions({
    layoutId: s,
    layout: r,
    alwaysMeasureLayout: !!o || a && st(a),
    visualElement: e,
    /**
     * TODO: Update options in an effect. This could be tricky as it'll be too late
     * to update by the time layout animations run.
     * We also need to fix this safeToRemove by linking it up to the one returned by usePresence,
     * ensuring it gets called if there's no potential layout animations.
     *
     */
    animationType: typeof r == "string" ? r : "both",
    initialPromotionConfig: i,
    crossfade: h,
    layoutScroll: l,
    layoutRoot: u,
    layoutAnchor: d
  });
}
function _l(e) {
  if (e)
    return e.options.allowProjection !== !1 ? e.projection : _l(e.parent);
}
function ti(e, { forwardMotionProps: t = !1, type: n } = {}, i, s) {
  i && Tp(i);
  const r = n ? n === "svg" : Is(e), o = r ? Bp : Ip;
  function a(u, d) {
    let h;
    const f = {
      ...ue(In),
      ...u,
      layoutId: Wp(u)
    }, { isStatic: p, isValidProp: m } = f, x = Np(u), v = o(u, p);
    if (!p && typeof window < "u") {
      _p(f, i);
      const w = Gp(f);
      h = w.MeasureLayout, x.visualElement = Up(e, v, f, s, w.ProjectionNode, r);
    }
    return y(Bn.Provider, { value: x, children: [h && x.visualElement ? c(h, { visualElement: x.visualElement, ...f }) : null, Lp(e, u, jp(v, x.visualElement, d), v, p, t, r, m)] });
  }
  a.displayName = `motion.${typeof e == "string" ? e : `create(${e.displayName ?? e.name ?? ""})`}`;
  const l = Wi(a);
  return l[$p] = e, l;
}
function Wp({ layoutId: e }) {
  const t = ue(es).id;
  return t && e !== void 0 ? t + "-" + e : e;
}
function _p(e, t) {
  const n = ue(Bl).strict;
  if (process.env.NODE_ENV !== "production" && t && n) {
    const i = "You have rendered a `motion` component within a `LazyMotion` component. This will break tree shaking. Import and render a `m` component instead.";
    e.ignoreStrict ? tt(!1, i, "lazy-strict-mode") : we(!1, i, "lazy-strict-mode");
  }
}
function Gp(e) {
  const t = $l(), { drag: n, layout: i } = t;
  if (!n && !i)
    return {};
  const s = { ...n, ...i };
  return {
    MeasureLayout: n?.isEnabled(e) || i?.isEnabled(e) ? s.MeasureLayout : void 0,
    ProjectionNode: s.ProjectionNode
  };
}
function Kp(e, t) {
  if (typeof Proxy > "u")
    return ti;
  const n = /* @__PURE__ */ new Map(), i = (r, o) => ti(r, o, e, t), s = (r, o) => (process.env.NODE_ENV !== "production" && Vn(!1, "motion() is deprecated. Use motion.create() instead."), i(r, o));
  return new Proxy(s, {
    /**
     * Called when `motion` is referenced with a prop: `motion.div`, `motion.input` etc.
     * The prop name is passed through as `key` and we can use that to generate a `motion`
     * DOM component with that name.
     */
    get: (r, o) => o === "create" ? i : (n.has(o) || n.set(o, ti(o, void 0, e, t)), n.get(o))
  });
}
const Hp = (e, t) => t.isSVG ?? Is(e) ? new kh(t) : new bh(t, {
  allowProjection: e !== zi
});
class qp extends _e {
  /**
   * We dynamically generate the AnimationState manager as it contains a reference
   * to the underlying animation library. We only want to load that if we load this,
   * so people can optionally code split it out using the `m` component.
   */
  constructor(t) {
    super(t), t.animationState || (t.animationState = Ph(t));
  }
  updateAnimationControlsSubscription() {
    const { animate: t } = this.node.getProps();
    Fn(t) && (this.unmountControls = t.subscribe(this.node));
  }
  /**
   * Subscribe any provided AnimationControls to the component's VisualElement
   */
  mount() {
    this.updateAnimationControlsSubscription();
  }
  update() {
    const { animate: t } = this.node.getProps(), { animate: n } = this.node.prevProps || {};
    t !== n && this.updateAnimationControlsSubscription();
  }
  unmount() {
    this.node.animationState.reset(), this.unmountControls?.();
  }
}
let Yp = 0;
class Xp extends _e {
  constructor() {
    super(...arguments), this.id = Yp++, this.isExitComplete = !1;
  }
  update() {
    if (!this.node.presenceContext)
      return;
    const { isPresent: t, onExitComplete: n } = this.node.presenceContext, { isPresent: i } = this.node.prevPresenceContext || {};
    if (!this.node.animationState || t === i)
      return;
    if (t && i === !1) {
      if (this.isExitComplete) {
        const { initial: r, custom: o } = this.node.getProps();
        if (typeof r == "string" || typeof r == "object" && r !== null && !Array.isArray(r)) {
          const a = Qe(this.node, r, o);
          if (a) {
            const { transition: l, transitionEnd: u, ...d } = a;
            for (const h in d)
              this.node.getValue(h)?.jump(d[h]);
          }
        }
        this.node.animationState.reset(), this.node.animationState.animateChanges();
      } else
        this.node.animationState.setActive("exit", !1);
      this.isExitComplete = !1;
      return;
    }
    const s = this.node.animationState.setActive("exit", !t);
    n && !t && s.then(() => {
      this.isExitComplete = !0, n(this.id);
    });
  }
  mount() {
    const { register: t, onExitComplete: n } = this.node.presenceContext || {};
    n && n(this.id), t && (this.unmount = t(this.id));
  }
  unmount() {
  }
}
const Zp = {
  animation: {
    Feature: qp
  },
  exit: {
    Feature: Xp
  }
};
function qt(e) {
  return {
    point: {
      x: e.pageX,
      y: e.pageY
    }
  };
}
const Qp = (e) => (t) => Vs(t) && e(t, qt(t));
function Dt(e, t, n, i) {
  return $t(e, t, Qp(n), i);
}
const Gl = ({ current: e }) => e ? e.ownerDocument.defaultView : null, ho = (e, t) => Math.abs(e - t);
function Jp(e, t) {
  const n = ho(e.x, t.x), i = ho(e.y, t.y);
  return Math.sqrt(n ** 2 + i ** 2);
}
const po = /* @__PURE__ */ new Set(["auto", "scroll"]);
class Kl {
  constructor(t, n, { transformPagePoint: i, contextWindow: s = window, dragSnapToOrigin: r = !1, distanceThreshold: o = 3, element: a } = {}) {
    if (this.startEvent = null, this.lastMoveEvent = null, this.lastMoveEventInfo = null, this.lastRawMoveEventInfo = null, this.handlers = {}, this.contextWindow = window, this.scrollPositions = /* @__PURE__ */ new Map(), this.removeScrollListeners = null, this.onElementScroll = (m) => {
      this.handleScroll(m.target);
    }, this.onWindowScroll = () => {
      this.handleScroll(window);
    }, this.updatePoint = () => {
      if (!(this.lastMoveEvent && this.lastMoveEventInfo))
        return;
      this.lastRawMoveEventInfo && (this.lastMoveEventInfo = en(this.lastRawMoveEventInfo, this.transformPagePoint));
      const m = ni(this.lastMoveEventInfo, this.history), x = this.startEvent !== null, v = Jp(m.offset, { x: 0, y: 0 }) >= this.distanceThreshold;
      if (!x && !v)
        return;
      const { point: w } = m, { timestamp: T } = ae;
      this.history.push({ ...w, timestamp: T });
      const { onStart: g, onMove: S } = this.handlers;
      x || (g && g(this.lastMoveEvent, m), this.startEvent = this.lastMoveEvent), S && S(this.lastMoveEvent, m);
    }, this.handlePointerMove = (m, x) => {
      this.lastMoveEvent = m, this.lastRawMoveEventInfo = x, this.lastMoveEventInfo = en(x, this.transformPagePoint), K.update(this.updatePoint, !0);
    }, this.handlePointerUp = (m, x) => {
      this.end();
      const { onEnd: v, onSessionEnd: w, resumeAnimation: T } = this.handlers;
      if ((this.dragSnapToOrigin || !this.startEvent) && T && T(), !(this.lastMoveEvent && this.lastMoveEventInfo))
        return;
      const g = ni(m.type === "pointercancel" ? this.lastMoveEventInfo : en(x, this.transformPagePoint), this.history);
      this.startEvent && v && v(m, g), w && w(m, g);
    }, !Vs(t))
      return;
    this.dragSnapToOrigin = r, this.handlers = n, this.transformPagePoint = i, this.distanceThreshold = o, this.contextWindow = s || window;
    const l = qt(t), u = en(l, this.transformPagePoint), { point: d } = u, { timestamp: h } = ae;
    this.history = [{ ...d, timestamp: h }];
    const { onSessionStart: f } = n;
    f && f(t, ni(u, this.history));
    const p = { passive: !0, capture: !0 };
    this.removeListeners = _t(Dt(this.contextWindow, "pointermove", this.handlePointerMove, p), Dt(this.contextWindow, "pointerup", this.handlePointerUp, p), Dt(this.contextWindow, "pointercancel", this.handlePointerUp, p)), a && this.startScrollTracking(a);
  }
  /**
   * Start tracking scroll on ancestors and window.
   */
  startScrollTracking(t) {
    let n = t.parentElement;
    for (; n; ) {
      const i = getComputedStyle(n);
      (po.has(i.overflowX) || po.has(i.overflowY)) && this.scrollPositions.set(n, {
        x: n.scrollLeft,
        y: n.scrollTop
      }), n = n.parentElement;
    }
    this.scrollPositions.set(window, {
      x: window.scrollX,
      y: window.scrollY
    }), window.addEventListener("scroll", this.onElementScroll, {
      capture: !0
    }), window.addEventListener("scroll", this.onWindowScroll), this.removeScrollListeners = () => {
      window.removeEventListener("scroll", this.onElementScroll, {
        capture: !0
      }), window.removeEventListener("scroll", this.onWindowScroll);
    };
  }
  /**
   * Handle scroll compensation during drag.
   *
   * For element scroll: adjusts history origin since pageX/pageY doesn't change.
   * For window scroll: adjusts lastMoveEventInfo since pageX/pageY would change.
   */
  handleScroll(t) {
    const n = this.scrollPositions.get(t);
    if (!n)
      return;
    const i = t === window, s = i ? { x: window.scrollX, y: window.scrollY } : {
      x: t.scrollLeft,
      y: t.scrollTop
    }, r = { x: s.x - n.x, y: s.y - n.y };
    r.x === 0 && r.y === 0 || (i ? this.lastMoveEventInfo && (this.lastMoveEventInfo.point.x += r.x, this.lastMoveEventInfo.point.y += r.y) : this.history.length > 0 && (this.history[0].x -= r.x, this.history[0].y -= r.y), this.scrollPositions.set(t, s), K.update(this.updatePoint, !0));
  }
  updateHandlers(t) {
    this.handlers = t;
  }
  end() {
    this.removeListeners && this.removeListeners(), this.removeScrollListeners && this.removeScrollListeners(), this.scrollPositions.clear(), Fe(this.updatePoint);
  }
}
function en(e, t) {
  return t ? { point: t(e.point) } : e;
}
function mo(e, t) {
  return { x: e.x - t.x, y: e.y - t.y };
}
function ni({ point: e }, t) {
  return {
    point: e,
    delta: mo(e, Hl(t)),
    offset: mo(e, em(t)),
    velocity: tm(t, 0.1)
  };
}
function em(e) {
  return e[0];
}
function Hl(e) {
  return e[e.length - 1];
}
function tm(e, t) {
  if (e.length < 2)
    return { x: 0, y: 0 };
  let n = e.length - 1, i = null;
  const s = Hl(e);
  for (; n >= 0 && (i = e[n], !(s.timestamp - i.timestamp > /* @__PURE__ */ ye(t))); )
    n--;
  if (!i)
    return { x: 0, y: 0 };
  i === e[0] && e.length > 2 && s.timestamp - i.timestamp > /* @__PURE__ */ ye(t) * 2 && (i = e[1]);
  const r = /* @__PURE__ */ xe(s.timestamp - i.timestamp);
  if (r === 0)
    return { x: 0, y: 0 };
  const o = {
    x: (s.x - i.x) / r,
    y: (s.y - i.y) / r
  };
  return o.x === 1 / 0 && (o.x = 0), o.y === 1 / 0 && (o.y = 0), o;
}
function nm(e, { min: t, max: n }, i) {
  return t !== void 0 && e < t ? e = i ? q(t, e, i.min) : Math.max(e, t) : n !== void 0 && e > n && (e = i ? q(n, e, i.max) : Math.min(e, n)), e;
}
function go(e, t, n) {
  return {
    min: t !== void 0 ? e.min + t : void 0,
    max: n !== void 0 ? e.max + n - (e.max - e.min) : void 0
  };
}
function im(e, { top: t, left: n, bottom: i, right: s }) {
  return {
    x: go(e.x, n, s),
    y: go(e.y, t, i)
  };
}
function yo(e, t) {
  let n = t.min - e.min, i = t.max - e.max;
  return t.max - t.min < e.max - e.min && ([n, i] = [i, n]), { min: n, max: i };
}
function sm(e, t) {
  return {
    x: yo(e.x, t.x),
    y: yo(e.y, t.y)
  };
}
function rm(e, t) {
  let n = 0.5;
  const i = pe(e), s = pe(t);
  return s > i ? n = /* @__PURE__ */ pt(t.min, t.max - i, e.min) : i > s && (n = /* @__PURE__ */ pt(e.min, e.max - s, t.min)), Pe(0, 1, n);
}
function om(e, t) {
  const n = {};
  return t.min !== void 0 && (n.min = t.min - e.min), t.max !== void 0 && (n.max = t.max - e.min), n;
}
const Oi = 0.35;
function am(e = Oi) {
  return e === !1 ? e = 0 : e === !0 && (e = Oi), {
    x: xo(e, "left", "right"),
    y: xo(e, "top", "bottom")
  };
}
function xo(e, t, n) {
  return {
    min: vo(e, t),
    max: vo(e, n)
  };
}
function vo(e, t) {
  return typeof e == "number" ? e : e[t] || 0;
}
const lm = /* @__PURE__ */ new WeakMap();
class cm {
  constructor(t) {
    this.openDragLock = null, this.isDragging = !1, this.currentDirection = null, this.originPoint = { x: 0, y: 0 }, this.constraints = !1, this.hasMutatedConstraints = !1, this.elastic = oe(), this.latestPointerEvent = null, this.latestPanInfo = null, this.visualElement = t;
  }
  start(t, { snapToCursor: n = !1, distanceThreshold: i } = {}) {
    const { presenceContext: s } = this.visualElement;
    if (s && s.isPresent === !1)
      return;
    const r = (h) => {
      n && this.snapToCursor(qt(h).point), this.stopAnimation();
    }, o = (h, f) => {
      const { drag: p, dragPropagation: m, onDragStart: x } = this.getProps();
      if (p && !m && (this.openDragLock && this.openDragLock(), this.openDragLock = Yf(p), !this.openDragLock))
        return;
      this.latestPointerEvent = h, this.latestPanInfo = f, this.isDragging = !0, this.currentDirection = null, this.resolveConstraints(), this.visualElement.projection && (this.visualElement.projection.isAnimationBlocked = !0, this.visualElement.projection.target = void 0), Ce((w) => {
        let T = this.getAxisMotionValue(w).get() || 0;
        if (De.test(T)) {
          const { projection: g } = this.visualElement;
          if (g && g.layout) {
            const S = g.layout.layoutBox[w];
            S && (T = pe(S) * (parseFloat(T) / 100));
          }
        }
        this.originPoint[w] = T;
      }), x && K.update(() => x(h, f), !1, !0), Ei(this.visualElement, "transform");
      const { animationState: v } = this.visualElement;
      v && v.setActive("whileDrag", !0);
    }, a = (h, f) => {
      this.latestPointerEvent = h, this.latestPanInfo = f;
      const { dragPropagation: p, dragDirectionLock: m, onDirectionLock: x, onDrag: v } = this.getProps();
      if (!p && !this.openDragLock)
        return;
      const { offset: w } = f;
      if (m && this.currentDirection === null) {
        this.currentDirection = dm(w), this.currentDirection !== null && x && x(this.currentDirection);
        return;
      }
      this.updateAxis("x", f.point, w), this.updateAxis("y", f.point, w), this.visualElement.render(), v && K.update(() => v(h, f), !1, !0);
    }, l = (h, f) => {
      this.latestPointerEvent = h, this.latestPanInfo = f, this.stop(h, f), this.latestPointerEvent = null, this.latestPanInfo = null;
    }, u = () => {
      const { dragSnapToOrigin: h } = this.getProps();
      (h || this.constraints) && this.startAnimation({ x: 0, y: 0 });
    }, { dragSnapToOrigin: d } = this.getProps();
    this.panSession = new Kl(t, {
      onSessionStart: r,
      onStart: o,
      onMove: a,
      onSessionEnd: l,
      resumeAnimation: u
    }, {
      transformPagePoint: this.visualElement.getTransformPagePoint(),
      dragSnapToOrigin: d,
      distanceThreshold: i,
      contextWindow: Gl(this.visualElement),
      element: this.visualElement.current
    });
  }
  /**
   * @internal
   */
  stop(t, n) {
    const i = t || this.latestPointerEvent, s = n || this.latestPanInfo, r = this.isDragging;
    if (this.cancel(), !r || !s || !i)
      return;
    const { velocity: o } = s;
    this.startAnimation(o);
    const { onDragEnd: a } = this.getProps();
    a && K.postRender(() => a(i, s));
  }
  /**
   * @internal
   */
  cancel() {
    this.isDragging = !1;
    const { projection: t, animationState: n } = this.visualElement;
    t && (t.isAnimationBlocked = !1), this.endPanSession();
    const { dragPropagation: i } = this.getProps();
    !i && this.openDragLock && (this.openDragLock(), this.openDragLock = null), n && n.setActive("whileDrag", !1);
  }
  /**
   * Clean up the pan session without modifying other drag state.
   * This is used during unmount to ensure event listeners are removed
   * without affecting projection animations or drag locks.
   * @internal
   */
  endPanSession() {
    this.panSession && this.panSession.end(), this.panSession = void 0;
  }
  updateAxis(t, n, i) {
    const { drag: s } = this.getProps();
    if (!i || !tn(t, s, this.currentDirection))
      return;
    const r = this.getAxisMotionValue(t);
    let o = this.originPoint[t] + i[t];
    this.constraints && this.constraints[t] && (o = nm(o, this.constraints[t], this.elastic[t])), r.set(o);
  }
  resolveConstraints() {
    const { dragConstraints: t, dragElastic: n } = this.getProps(), i = this.visualElement.projection && !this.visualElement.projection.layout ? this.visualElement.projection.measure(!1) : this.visualElement.projection?.layout, s = this.constraints;
    t && st(t) ? this.constraints || (this.constraints = this.resolveRefConstraints()) : t && i ? this.constraints = im(i.layoutBox, t) : this.constraints = !1, this.elastic = am(n), s !== this.constraints && !st(t) && i && this.constraints && !this.hasMutatedConstraints && Ce((r) => {
      this.constraints !== !1 && this.getAxisMotionValue(r) && (this.constraints[r] = om(i.layoutBox[r], this.constraints[r]));
    });
  }
  resolveRefConstraints() {
    const { dragConstraints: t, onMeasureDragConstraints: n } = this.getProps();
    if (!t || !st(t))
      return !1;
    const i = t.current;
    we(i !== null, "If `dragConstraints` is set as a React ref, that ref must be passed to another component's `ref` prop.", "drag-constraints-ref");
    const { projection: s } = this.visualElement;
    if (!s || !s.layout)
      return !1;
    s.root && (s.root.scroll = void 0, s.root.updateScroll());
    const r = Wf(i, s.root, this.visualElement.getTransformPagePoint());
    let o = sm(s.layout.layoutBox, r);
    if (n) {
      const a = n(jf(o));
      this.hasMutatedConstraints = !!a, a && (o = ll(a));
    }
    return o;
  }
  startAnimation(t) {
    const { drag: n, dragMomentum: i, dragElastic: s, dragTransition: r, dragSnapToOrigin: o, onDragTransitionEnd: a } = this.getProps(), l = this.constraints || {}, u = Ce((d) => {
      if (!tn(d, n, this.currentDirection))
        return;
      let h = l && l[d] || {};
      (o === !0 || o === d) && (h = { min: 0, max: 0 });
      const f = s ? 200 : 1e6, p = s ? 40 : 1e7, m = {
        type: "inertia",
        velocity: i ? t[d] : 0,
        bounceStiffness: f,
        bounceDamping: p,
        timeConstant: 750,
        restDelta: 1,
        restSpeed: 10,
        ...r,
        ...h
      };
      return this.startAxisValueAnimation(d, m);
    });
    return Promise.all(u).then(a);
  }
  startAxisValueAnimation(t, n) {
    const i = this.getAxisMotionValue(t);
    return Ei(this.visualElement, t), i.start(Ln(t, i, 0, n, this.visualElement, !1));
  }
  stopAnimation() {
    Ce((t) => this.getAxisMotionValue(t).stop());
  }
  /**
   * Drag works differently depending on which props are provided.
   *
   * - If _dragX and _dragY are provided, we output the gesture delta directly to those motion values.
   * - Otherwise, we apply the delta to the x/y motion values.
   */
  getAxisMotionValue(t) {
    const n = `_drag${t.toUpperCase()}`, s = this.visualElement.getProps()[n];
    return s || this.visualElement.getValue(t, this.visualElement.latestValues[t] ?? 0);
  }
  snapToCursor(t) {
    Ce((n) => {
      const { drag: i } = this.getProps();
      if (!tn(n, i, this.currentDirection))
        return;
      const { projection: s } = this.visualElement, r = this.getAxisMotionValue(n);
      if (s && s.layout) {
        const { min: o, max: a } = s.layout.layoutBox[n], l = r.get() || 0;
        r.set(t[n] - q(o, a, 0.5) + l);
      }
    });
  }
  /**
   * When the viewport resizes we want to check if the measured constraints
   * have changed and, if so, reposition the element within those new constraints
   * relative to where it was before the resize.
   */
  scalePositionWithinConstraints() {
    if (!this.visualElement.current)
      return;
    const { drag: t, dragConstraints: n } = this.getProps(), { projection: i } = this.visualElement;
    if (!st(n) || !i || !this.constraints)
      return;
    this.stopAnimation();
    const s = { x: 0, y: 0 };
    Ce((o) => {
      const a = this.getAxisMotionValue(o);
      if (a && this.constraints !== !1) {
        const l = a.get();
        s[o] = rm({ min: l, max: l }, this.constraints[o]);
      }
    });
    const { transformTemplate: r } = this.visualElement.getProps();
    this.visualElement.current.style.transform = r ? r({}, "") : "none", i.root && i.root.updateScroll(), i.updateLayout(), this.constraints = !1, this.resolveConstraints(), Ce((o) => {
      if (!tn(o, t, null))
        return;
      const a = this.getAxisMotionValue(o), { min: l, max: u } = this.constraints[o];
      a.set(q(l, u, s[o]));
    }), this.visualElement.render();
  }
  addListeners() {
    if (!this.visualElement.current)
      return;
    lm.set(this.visualElement, this);
    const t = this.visualElement.current, n = Dt(t, "pointerdown", (u) => {
      const { drag: d, dragListener: h = !0 } = this.getProps(), f = u.target, p = f !== t && th(f);
      d && h && !p && this.start(u);
    });
    let i;
    const s = () => {
      const { dragConstraints: u } = this.getProps();
      st(u) && u.current && (this.constraints = this.resolveRefConstraints(), i || (i = um(t, u.current, () => this.scalePositionWithinConstraints())));
    }, { projection: r } = this.visualElement, o = r.addEventListener("measure", s);
    r && !r.layout && (r.root && r.root.updateScroll(), r.updateLayout()), K.read(s);
    const a = $t(window, "resize", () => this.scalePositionWithinConstraints()), l = r.addEventListener("didUpdate", (({ delta: u, hasLayoutChanged: d }) => {
      this.isDragging && d && (Ce((h) => {
        const f = this.getAxisMotionValue(h);
        f && (this.originPoint[h] += u[h].translate, f.set(f.get() + u[h].translate));
      }), this.visualElement.render());
    }));
    return () => {
      a(), n(), o(), l && l(), i && i();
    };
  }
  getProps() {
    const t = this.visualElement.getProps(), { drag: n = !1, dragDirectionLock: i = !1, dragPropagation: s = !1, dragConstraints: r = !1, dragElastic: o = Oi, dragMomentum: a = !0 } = t;
    return {
      ...t,
      drag: n,
      dragDirectionLock: i,
      dragPropagation: s,
      dragConstraints: r,
      dragElastic: o,
      dragMomentum: a
    };
  }
}
function bo(e) {
  let t = !0;
  return () => {
    if (t) {
      t = !1;
      return;
    }
    e();
  };
}
function um(e, t, n) {
  const i = Vr(e, bo(n)), s = Vr(t, bo(n));
  return () => {
    i(), s();
  };
}
function tn(e, t, n) {
  return (t === !0 || t === e) && (n === null || n === e);
}
function dm(e, t = 10) {
  let n = null;
  return Math.abs(e.y) > t ? n = "y" : Math.abs(e.x) > t && (n = "x"), n;
}
class fm extends _e {
  constructor(t) {
    super(t), this.removeGroupControls = Ae, this.removeListeners = Ae, this.controls = new cm(t);
  }
  mount() {
    const { dragControls: t } = this.node.getProps();
    t && (this.removeGroupControls = t.subscribe(this.controls)), this.removeListeners = this.controls.addListeners() || Ae;
  }
  update() {
    const { dragControls: t } = this.node.getProps(), { dragControls: n } = this.node.prevProps || {};
    t !== n && (this.removeGroupControls(), t && (this.removeGroupControls = t.subscribe(this.controls)));
  }
  unmount() {
    this.removeGroupControls(), this.removeListeners(), this.controls.isDragging || this.controls.endPanSession();
  }
}
const ii = (e) => (t, n) => {
  e && K.update(() => e(t, n), !1, !0);
};
class hm extends _e {
  constructor() {
    super(...arguments), this.removePointerDownListener = Ae;
  }
  onPointerDown(t) {
    this.session = new Kl(t, this.createPanHandlers(), {
      transformPagePoint: this.node.getTransformPagePoint(),
      contextWindow: Gl(this.node)
    });
  }
  createPanHandlers() {
    const { onPanSessionStart: t, onPanStart: n, onPan: i, onPanEnd: s } = this.node.getProps();
    return {
      onSessionStart: ii(t),
      onStart: ii(n),
      onMove: ii(i),
      onEnd: (r, o) => {
        delete this.session, s && K.postRender(() => s(r, o));
      }
    };
  }
  mount() {
    this.removePointerDownListener = Dt(this.node.current, "pointerdown", (t) => this.onPointerDown(t));
  }
  update() {
    this.session && this.session.updateHandlers(this.createPanHandlers());
  }
  unmount() {
    this.removePointerDownListener(), this.session && this.session.end();
  }
}
let si = !1;
class pm extends Vc {
  /**
   * This only mounts projection nodes for components that
   * need measuring, we might want to do it for all components
   * in order to incorporate transforms
   */
  componentDidMount() {
    const { visualElement: t, layoutGroup: n, switchLayoutGroup: i, layoutId: s } = this.props, { projection: r } = t;
    r && (n.group && n.group.add(r), i && i.register && s && i.register(r), si && r.root.didUpdate(), r.addEventListener("animationComplete", () => {
      this.safeToRemove();
    }), r.setOptions({
      ...r.options,
      layoutDependency: this.props.layoutDependency,
      onExitComplete: () => this.safeToRemove()
    })), mn.hasEverUpdated = !0;
  }
  getSnapshotBeforeUpdate(t) {
    const { layoutDependency: n, visualElement: i, drag: s, isPresent: r } = this.props, { projection: o } = i;
    return o && (o.isPresent = r, t.layoutDependency !== n && o.setOptions({
      ...o.options,
      layoutDependency: n
    }), si = !0, s || t.layoutDependency !== n || n === void 0 || t.isPresent !== r ? o.willUpdate() : this.safeToRemove(), t.isPresent !== r && (r ? o.promote() : o.relegate() || K.postRender(() => {
      const a = o.getStack();
      (!a || !a.members.length) && this.safeToRemove();
    }))), null;
  }
  componentDidUpdate() {
    const { visualElement: t, layoutAnchor: n } = this.props, { projection: i } = t;
    i && (i.options.layoutAnchor = n, i.root.didUpdate(), Ds.postRender(() => {
      !i.currentAnimation && i.isLead() && this.safeToRemove();
    }));
  }
  componentWillUnmount() {
    const { visualElement: t, layoutGroup: n, switchLayoutGroup: i } = this.props, { projection: s } = t;
    si = !0, s && (s.scheduleCheckAfterUnmount(), n && n.group && n.group.remove(s), i && i.deregister && i.deregister(s));
  }
  safeToRemove() {
    const { safeToRemove: t } = this.props;
    t && t();
  }
  render() {
    return null;
  }
}
function ql(e) {
  const [t, n] = Il(), i = ue(es);
  return c(pm, { ...e, layoutGroup: i, switchLayoutGroup: ue(Wl), isPresent: t, safeToRemove: n });
}
const mm = {
  pan: {
    Feature: hm
  },
  drag: {
    Feature: fm,
    ProjectionNode: Ol,
    MeasureLayout: ql
  }
};
function wo(e, t, n) {
  const { props: i } = e;
  e.animationState && i.whileHover && e.animationState.setActive("whileHover", n === "Start");
  const s = "onHover" + n, r = i[s];
  r && K.postRender(() => r(t, qt(t)));
}
class gm extends _e {
  mount() {
    const { current: t } = this.node;
    t && (this.unmount = Zf(t, (n, i) => (wo(this.node, i, "Start"), (s) => wo(this.node, s, "End"))));
  }
  unmount() {
  }
}
class ym extends _e {
  constructor() {
    super(...arguments), this.isActive = !1;
  }
  onFocus() {
    let t = !1;
    try {
      t = this.node.current.matches(":focus-visible");
    } catch {
      t = !0;
    }
    !t || !this.node.animationState || (this.node.animationState.setActive("whileFocus", !0), this.isActive = !0);
  }
  onBlur() {
    !this.isActive || !this.node.animationState || (this.node.animationState.setActive("whileFocus", !1), this.isActive = !1);
  }
  mount() {
    this.unmount = _t($t(this.node.current, "focus", () => this.onFocus()), $t(this.node.current, "blur", () => this.onBlur()));
  }
  unmount() {
  }
}
function ko(e, t, n) {
  const { props: i } = e;
  if (e.current instanceof HTMLButtonElement && e.current.disabled)
    return;
  e.animationState && i.whileTap && e.animationState.setActive("whileTap", n === "Start");
  const s = "onTap" + (n === "End" ? "" : n), r = i[s];
  r && K.postRender(() => r(t, qt(t)));
}
class xm extends _e {
  mount() {
    const { current: t } = this.node;
    if (!t)
      return;
    const { globalTapTarget: n, propagate: i } = this.node.props;
    this.unmount = ih(t, (s, r) => (ko(this.node, r, "Start"), (o, { success: a }) => ko(this.node, o, a ? "End" : "Cancel")), {
      useGlobalTarget: n,
      stopPropagation: i?.tap === !1
    });
  }
  unmount() {
  }
}
const Ii = /* @__PURE__ */ new WeakMap(), ri = /* @__PURE__ */ new WeakMap(), vm = (e) => {
  const t = Ii.get(e.target);
  t && t(e);
}, bm = (e) => {
  e.forEach(vm);
};
function wm({ root: e, ...t }) {
  const n = e || document;
  ri.has(n) || ri.set(n, {});
  const i = ri.get(n), s = JSON.stringify(t);
  return i[s] || (i[s] = new IntersectionObserver(bm, { root: e, ...t })), i[s];
}
function km(e, t, n) {
  const i = wm(t);
  return Ii.set(e, n), i.observe(e), () => {
    Ii.delete(e), i.unobserve(e);
  };
}
const Tm = {
  some: 0,
  all: 1
};
class Sm extends _e {
  constructor() {
    super(...arguments), this.hasEnteredView = !1, this.isInView = !1;
  }
  startObserver() {
    this.stopObserver?.();
    const { viewport: t = {} } = this.node.getProps(), { root: n, margin: i, amount: s = "some", once: r } = t, o = {
      root: n ? n.current : void 0,
      rootMargin: i,
      threshold: typeof s == "number" ? s : Tm[s]
    }, a = (l) => {
      const { isIntersecting: u } = l;
      if (this.isInView === u || (this.isInView = u, r && !u && this.hasEnteredView))
        return;
      u && (this.hasEnteredView = !0), this.node.animationState && this.node.animationState.setActive("whileInView", u);
      const { onViewportEnter: d, onViewportLeave: h } = this.node.getProps(), f = u ? d : h;
      f && f(l);
    };
    this.stopObserver = km(this.node.current, o, a);
  }
  mount() {
    this.startObserver();
  }
  update() {
    if (typeof IntersectionObserver > "u")
      return;
    const { props: t, prevProps: n } = this.node;
    ["amount", "margin", "root"].some(Nm(t, n)) && this.startObserver();
  }
  unmount() {
    this.stopObserver?.(), this.hasEnteredView = !1, this.isInView = !1;
  }
}
function Nm({ viewport: e = {} }, { viewport: t = {} } = {}) {
  return (n) => e[n] !== t[n];
}
const Am = {
  inView: {
    Feature: Sm
  },
  tap: {
    Feature: xm
  },
  focus: {
    Feature: ym
  },
  hover: {
    Feature: gm
  }
}, Pm = {
  layout: {
    ProjectionNode: Ol,
    MeasureLayout: ql
  }
}, Mm = {
  ...Zp,
  ...Am,
  ...mm,
  ...Pm
}, Cm = /* @__PURE__ */ Kp(Mm, Hp);
function Yl(e) {
  const t = zt(() => Oe(e)), { isStatic: n } = ue(In);
  if (n) {
    const [, i] = O(e);
    F(() => t.on("change", i), []);
  }
  return t;
}
function Xl(e, t) {
  const n = Yl(t()), i = () => n.set(t());
  return i(), Lt(() => {
    const s = () => K.preRender(i, !1, !0), r = e.map((o) => o.on("change", s));
    return () => {
      r.forEach((o) => o()), Fe(i);
    };
  }), n;
}
function Em(e) {
  Mt.current = [], e();
  const t = Xl(Mt.current, e);
  return Mt.current = void 0, t;
}
function Dm(e, t, n, i) {
  if (typeof e == "function")
    return Em(e);
  const r = typeof t == "function" ? t : hh(t, n, i), o = Array.isArray(e) ? To(e, r) : To([e], ([l]) => r(l)), a = Array.isArray(e) ? void 0 : e.accelerate;
  return a && !a.isTransformed && typeof t != "function" && Array.isArray(n) && i?.clamp !== !1 && (o.accelerate = {
    ...a,
    times: t,
    keyframes: n,
    isTransformed: !0
  }), o;
}
function To(e, t) {
  const n = zt(() => []);
  return Xl(e, () => {
    n.length = 0;
    const i = e.length;
    for (let s = 0; s < i; s++)
      n[s] = e[s].get();
    return t(n);
  });
}
function te() {
  !Ls.current && yl();
  const [e] = O(Nn.current);
  return process.env.NODE_ENV !== "production" && Vn(e !== !0, "You have Reduced Motion enabled on your device. Animations may not appear as expected.", "reduced-motion-disabled"), e;
}
function Bs(e) {
  return typeof e == "object" && !Array.isArray(e);
}
function Zl(e, t, n, i) {
  return e == null ? [] : typeof e == "string" && Bs(t) ? Ns(e, n, i) : e instanceof NodeList ? Array.from(e) : Array.isArray(e) ? e.filter((s) => s != null) : [e];
}
function Vm(e, t, n) {
  return e * (t + 1) + n * t;
}
function So(e, t, n, i) {
  return typeof t == "number" ? t : t.startsWith("-") || t.startsWith("+") ? Math.max(0, e + parseFloat(t)) : t === "<" ? n : t.startsWith("<") ? Math.max(0, n + parseFloat(t.slice(1))) : i.get(t) ?? e;
}
function Rm(e, t, n) {
  for (let i = 0; i < e.length; i++) {
    const s = e[i];
    s.at > t && s.at < n && (Je(e, s), i--);
  }
}
function Lm(e, t, n, i, s, r) {
  Rm(e, s, r);
  for (let o = 0; o < t.length; o++)
    e.push({
      value: t[o],
      at: q(s, r, i[o]),
      easing: /* @__PURE__ */ ya(n, o)
    });
}
function Fm(e, t, n = 0) {
  const i = t + 1 + t * n;
  for (let s = 0; s < e.length; s++)
    e[s] = e[s] / i;
}
function Om(e, t) {
  return e.at === t.at ? e.value === null ? 1 : t.value === null ? -1 : 0 : e.at - t.at;
}
const Im = "easeInOut", oi = 20;
function Bm(e, { defaultTransition: t = {}, ...n } = {}, i, s) {
  const r = t.duration || 0.3, o = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map(), l = {}, u = /* @__PURE__ */ new Map();
  let d = 0, h = 0, f = 0;
  for (let p = 0; p < e.length; p++) {
    const m = e[p];
    if (typeof m == "string") {
      u.set(m, h);
      continue;
    } else if (!Array.isArray(m)) {
      u.set(m.name, So(h, m.at, d, u));
      continue;
    }
    let [x, v, w = {}] = m;
    w.at !== void 0 && (h = So(h, w.at, d, u));
    let T = 0;
    const g = (S, R, D, k = 0, A = 0) => {
      const N = $m(S), { delay: M = 0, times: b = Fa(N), type: B = t.type || "keyframes", repeat: $, repeatType: Y, repeatDelay: H = 0, ..._ } = R;
      let { ease: P = t.ease || "easeOut", duration: U } = R;
      const ee = typeof M == "function" ? M(k, A) : M, se = N.length, ne = vs(B) ? B : s?.[B || "keyframes"];
      if (se <= 2 && ne) {
        let ie = 100;
        if (se === 2 && zm(N)) {
          const $e = N[1] - N[0];
          ie = Math.abs($e);
        }
        const re = {
          ...t,
          ..._
        };
        U !== void 0 && (re.duration = /* @__PURE__ */ ye(U));
        const ke = Ea(re, ie, ne);
        P = ke.ease, U = ke.duration;
      }
      U ?? (U = r);
      const E = h + ee;
      b.length === 1 && b[0] === 0 && (b[1] = 1);
      const I = b.length - N.length;
      if (I > 0 && La(b, I), N.length === 1 && N.unshift(null), $ && tt($ < oi, `Sequence segments can't repeat ${$} times — ignoring repeat option. Use a value below ${oi} or apply repeat at the sequence level instead.`), $ && $ < oi) {
        const ie = U > 0 ? H / U : 0;
        U = Vm(U, $, H);
        const re = [...N], ke = [...b];
        P = Array.isArray(P) ? [...P] : [P];
        const $e = [...P], bt = Y === "reverse" || Y === "mirror";
        let _s = re, Gs = $e;
        bt && (_s = [...re].reverse(), Y === "reverse" && (Gs = [...$e].reverse().map((je) => typeof je == "function" ? /* @__PURE__ */ rs(je) : je)));
        for (let je = 0; je < $; je++) {
          const Ks = bt && je % 2 === 0, Hs = Ks ? _s : re, Mc = Ks ? Gs : $e, qs = (je + 1) * (1 + ie);
          ie > 0 && (N.push(N[N.length - 1]), b.push(qs), P.push("linear")), N.push(...Hs);
          for (let wt = 0; wt < Hs.length; wt++)
            b.push(ke[wt] + qs), P.push(wt === 0 ? "linear" : /* @__PURE__ */ ya(Mc, wt - 1));
        }
        Fm(b, $, ie);
      }
      const X = E + U;
      Lm(D, N, P, b, E, X), T = Math.max(ee + U, T), f = Math.max(X, f);
    };
    if (ce(x)) {
      const S = No(x, a);
      g(v, w, Ao("default", S));
    } else {
      const S = Zl(x, v, i, l), R = S.length;
      for (let D = 0; D < R; D++) {
        v = v, w = w;
        const k = S[D], A = No(k, a);
        for (const N in v)
          g(v[N], jm(w, N), Ao(N, A), D, R);
      }
    }
    d = h, h += T;
  }
  return a.forEach((p, m) => {
    for (const x in p) {
      const v = p[x];
      v.sort(Om);
      const w = [], T = [], g = [];
      for (let k = 0; k < v.length; k++) {
        const { at: A, value: N, easing: M } = v[k];
        w.push(N), T.push(/* @__PURE__ */ pt(0, f, A)), g.push(M || "easeOut");
      }
      T[0] !== 0 && (T.unshift(0), w.unshift(w[0]), g.unshift(Im)), T[T.length - 1] !== 1 && (T.push(1), w.push(null)), o.has(m) || o.set(m, {
        keyframes: {},
        transition: {}
      });
      const S = o.get(m);
      S.keyframes[x] = w;
      const { type: R, ...D } = t;
      S.transition[x] = {
        ...D,
        duration: f,
        ease: g,
        times: T,
        ...n
      };
    }
  }), o;
}
function No(e, t) {
  return !t.has(e) && t.set(e, {}), t.get(e);
}
function Ao(e, t) {
  return t[e] || (t[e] = []), t[e];
}
function $m(e) {
  return Array.isArray(e) ? e : [e];
}
function jm(e, t) {
  return e && e[t] ? {
    ...e,
    ...e[t]
  } : { ...e };
}
const Um = (e) => typeof e == "number", zm = (e) => e.every(Um);
function Wm(e, t) {
  return ce(e) || typeof e == "number" || typeof e == "string" && !Bs(t);
}
function Ql(e, t, n, i) {
  const s = [];
  if (Wm(e, t))
    s.push(Vl(e, Bs(t) && t.default || t, n && (n.default || n)));
  else {
    if (e == null)
      return s;
    const r = Zl(e, t, i), o = r.length;
    we(!!o, "No valid elements provided.", "no-valid-elements");
    for (let a = 0; a < o; a++) {
      const l = r[a], u = { ...n };
      "delay" in u && typeof u.delay == "function" && (u.delay = u.delay(a, o)), l instanceof Element ? s.push(...Hf(l, t, u, ml.get(l))) : s.push(...sl(wf(l) ?? qf, l, t, u));
    }
  }
  return s;
}
function _m(e, t, n) {
  const i = [], s = e.map((o) => {
    if (Array.isArray(o) && typeof o[0] == "function") {
      const a = o[0], l = Oe(0);
      return l.on("change", a), o.length === 1 ? [l, [0, 1]] : o.length === 2 ? [l, [0, 1], o[1]] : [l, o[1], o[2]];
    }
    return o;
  });
  return Bm(s, t, n, { spring: It }).forEach(({ keyframes: o, transition: a }, l) => {
    i.push(...Ql(l, o, a));
  }), i;
}
function Gm(e) {
  return Array.isArray(e) && e.some(Array.isArray);
}
function Km(e = {}) {
  const { scope: t, reduceMotion: n, skipAnimations: i } = e;
  function s(r, o, a) {
    let l = [], u;
    const d = {};
    if (n !== void 0 && (d.reduceMotion = n), i !== void 0 && (d.skipAnimations = i), Gm(r)) {
      const { onComplete: f, ...p } = o || {};
      typeof f == "function" && (u = f), l = _m(r, { ...d, ...p }, t);
    } else {
      const { onComplete: f, ...p } = a || {};
      typeof f == "function" && (u = f), l = Ql(r, o, { ...d, ...p }, t);
    }
    const h = new Kd(l);
    return u && h.finished.then(u), t && (t.animations.push(h), h.finished.then(() => {
      Je(t.animations, h);
    })), h;
  }
  return s;
}
const ai = Object.assign(Km(), {
  /**
   * Register an effect so `animate()` can animate the subjects it
   * claims, for instance `animate.addEffect(threeEffect)`. The most
   * recently added effect is tested first. DOM elements are always
   * animated directly.
   */
  addEffect: bf,
  removeEffect: nl
}), j = Cm;
function jt(e) {
  return `REV ${String(Math.max(0, e ?? 0)).padStart(2, "0")}`;
}
function My(e, t) {
  if (!e) return null;
  const n = e.replace(/^claude-/, "");
  return t ? `${n} ${t}` : n;
}
function Jl(e) {
  if (e == null) return null;
  const t = Math.max(0, Math.round(e));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
}
function Yt(e) {
  const t = Math.max(0, e);
  return t < 59.95 ? `${t.toFixed(1)}s` : Jl(t);
}
function Hm(e, t = Date.now()) {
  if (!e) return null;
  const n = Math.max(0, Math.round((t - new Date(e).getTime()) / 1e3));
  if (n < 60) return "just now";
  const i = Math.round(n / 60);
  if (i < 60) return `${i}m ago`;
  const s = Math.round(i / 60);
  if (s < 24) return `${s}h ago`;
  const r = Math.round(s / 24);
  if (r < 7) return `${r}d ago`;
  const o = Math.round(r / 7);
  return o < 8 ? `${o}w ago` : `${Math.round(r / 30)}mo ago`;
}
function qm(e) {
  return !e || e.length !== 3 ? null : e.map((t) => Math.round(t * 10) / 10).join(" × ");
}
function Cy(e) {
  if (!e) return "·";
  if (e.includes("@")) return e.split("@")[0].slice(0, 2).toUpperCase();
  const t = e.trim().split(/\s+/);
  return (t.length > 1 ? t[0][0] + t[1][0] : t[0].slice(0, 2)).toUpperCase();
}
function Cn(e) {
  const t = e.replace(/_+/g, " ").trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}
const Ym = typeof window > "u" ? F : yt, Xm = Q.out;
function $s(e) {
  const t = C(null), [n, i] = O(0), [s, r] = O(!1), [o, a] = O(e), l = C(e);
  l.current !== e && (l.current = e, o && a(!1)), Ym(() => {
    const d = t.current;
    if (!d) return;
    const h = () => {
      const p = d.getBoundingClientRect().height;
      i((m) => Math.abs(m - p) < 0.5 ? m : p);
    };
    if (h(), r(!0), typeof ResizeObserver > "u") return;
    const f = new ResizeObserver(h);
    return f.observe(d), () => f.disconnect();
  }, []);
  const u = te();
  return {
    ref: t,
    height: n,
    animate: { height: e ? o || !s ? "auto" : n : 0 },
    transition: { duration: u ? 0 : W.settle, ease: Xm },
    onAnimationComplete: () => {
      e && a(!0);
    },
    style: { overflow: "hidden" }
  };
}
const Zm = {
  done: "check",
  failed: "warning",
  running: "ruler"
};
function En(e, t) {
  return e.status !== "running" ? e.elapsed_s ?? 0 : Math.max(0, (t - new Date(e.started_at).getTime()) / 1e3);
}
function Qm({ startedAt: e, className: t }) {
  const [n, i] = O(() => Date.now());
  F(() => {
    const r = setInterval(() => i(Date.now()), 100);
    return () => clearInterval(r);
  }, []);
  const s = Math.max(0, (n - new Date(e).getTime()) / 1e3);
  return /* @__PURE__ */ c("span", { "aria-hidden": "true", className: t, children: Yt(s) });
}
function ec({ open: e }) {
  const t = te() === !0;
  return /* @__PURE__ */ c(
    j.span,
    {
      "aria-hidden": "true",
      className: "flex shrink-0 items-center text-faint",
      animate: { rotate: e ? 0 : -90 },
      transition: { duration: t ? 0 : W.tick, ease: Q.out },
      children: /* @__PURE__ */ c(z, { name: "chevron-down" })
    }
  );
}
function tc({ open: e, id: t, className: n, children: i }) {
  const s = $s(e);
  return /* @__PURE__ */ c(j.div, { id: t, style: s.style, animate: s.animate, transition: s.transition, onAnimationComplete: s.onAnimationComplete, children: /* @__PURE__ */ c("div", { ref: s.ref, className: n, children: e ? i : null }) });
}
function Jm(e) {
  const t = `${e.verb.charAt(0).toUpperCase()}${e.verb.slice(1)} ${e.object}`;
  if (e.status === "running")
    return `${t}, running for ${Math.round(En(e, Date.now()))} seconds`;
  const n = En(e, Date.now()).toFixed(1);
  return `${t}, ${e.status === "failed" ? "failed after" : "finished in"} ${n} seconds`;
}
function nc({ step: e, defaultOpen: t }) {
  const [n, i] = O(t ?? e.status === "failed");
  F(() => {
    e.status === "failed" && i(!0);
  }, [e.status]);
  const s = Te(), r = e.status === "running", o = e.status === "failed", a = e.input == null ? null : JSON.stringify(e.input, null, 2), l = e.output?.trim() ? e.output : null, u = a != null || l != null;
  return /* @__PURE__ */ y("div", { className: "flex flex-col", children: [
    /* @__PURE__ */ y(
      "button",
      {
        type: "button",
        onClick: u ? () => i((d) => !d) : void 0,
        "aria-expanded": u ? n : void 0,
        "aria-controls": u ? s : void 0,
        className: L(
          "flex min-h-[28px] w-full items-center gap-2 rounded-[3px] px-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent",
          o ? "bg-fail-wash" : r ? "bg-accent-wash" : "bg-transparent",
          u && !o && !r && "hover:bg-raised",
          !u && "cursor-default"
        ),
        children: [
          /* @__PURE__ */ c("span", { "aria-hidden": "true", className: L("flex shrink-0 items-center", o ? "text-fail" : "text-ink-soft"), children: /* @__PURE__ */ c(z, { name: Zm[e.status] }) }),
          /* @__PURE__ */ c("span", { "aria-hidden": "true", className: L("mono-label shrink-0", o ? "text-fail" : "text-muted"), children: e.verb.toUpperCase() }),
          /* @__PURE__ */ c("span", { "aria-hidden": "true", className: "min-w-0 flex-1 truncate text-[13px] leading-[19px] text-ink-soft", children: e.object }),
          r ? /* @__PURE__ */ c(Qm, { startedAt: e.started_at, className: "mono-value min-w-[44px] shrink-0 text-right tabular-nums text-accent-ink" }) : /* @__PURE__ */ c("span", { "aria-hidden": "true", className: "mono-value min-w-[44px] shrink-0 text-right tabular-nums text-faint", children: Yt(En(e, Date.now())) }),
          u ? /* @__PURE__ */ c(ec, { open: n }) : null,
          /* @__PURE__ */ c("span", { className: "sr-only", children: Jm(e) })
        ]
      }
    ),
    /* @__PURE__ */ y(tc, { open: n && u, id: s, className: "relative flex flex-col gap-1.5 pt-1.5 pr-2 pb-2.5 pl-7", children: [
      /* @__PURE__ */ c("span", { "aria-hidden": "true", className: "absolute top-0 bottom-0 left-[13px] w-px bg-line-soft" }),
      a ? /* @__PURE__ */ y("div", { className: "flex flex-col gap-1", children: [
        /* @__PURE__ */ c("span", { className: "mono-label text-muted", children: "INPUT" }),
        /* @__PURE__ */ c("pre", { className: "max-h-[216px] overflow-y-auto rounded-[6px] bg-raised px-2.5 py-2 font-mono text-[11.5px] leading-[17px] break-words whitespace-pre-wrap text-ink-soft", children: a })
      ] }) : null,
      l ? /* @__PURE__ */ y("div", { className: "flex flex-col gap-1", children: [
        /* @__PURE__ */ c("span", { className: "mono-label text-muted", children: "OUTPUT" }),
        /* @__PURE__ */ c("pre", { className: "max-h-[216px] overflow-y-auto rounded-[6px] bg-raised px-2.5 py-2 font-mono text-[11.5px] leading-[17px] break-words whitespace-pre-wrap text-ink-soft", children: l })
      ] }) : null
    ] })
  ] });
}
function eg(e) {
  const t = [];
  let n = [];
  const i = () => {
    n.length >= 3 ? t.push({ kind: "group", steps: n }) : n.forEach((s) => t.push({ kind: "step", step: s })), n = [];
  };
  for (const s of e) {
    if (s.status === "done") {
      n.push(s);
      continue;
    }
    i(), t.push({ kind: "step", step: s });
  }
  return i(), t;
}
function tg({ steps: e, defaultCollapsed: t }) {
  const [n, i] = O(!t), s = Te();
  F(() => {
    t && i(!1);
  }, [t]);
  const r = e.reduce((o, a) => o + En(a, Date.now()), 0);
  return /* @__PURE__ */ y("div", { className: "flex flex-col", children: [
    /* @__PURE__ */ y(
      "button",
      {
        type: "button",
        onClick: () => i((o) => !o),
        "aria-expanded": n,
        "aria-controls": s,
        className: "flex min-h-[28px] items-center gap-2 self-start rounded-[3px] px-2 hover:bg-raised focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent",
        children: [
          /* @__PURE__ */ c("span", { "aria-hidden": "true", className: "flex shrink-0 items-center text-ink-soft", children: /* @__PURE__ */ c(z, { name: "dots" }) }),
          /* @__PURE__ */ y("span", { className: "mono-label text-muted", children: [
            e.length,
            " STEPS"
          ] }),
          /* @__PURE__ */ y("span", { className: "mono-value text-faint", children: [
            /* @__PURE__ */ c("span", { "aria-hidden": "true", children: "· " }),
            Yt(r)
          ] }),
          /* @__PURE__ */ c("span", { "aria-hidden": "true", className: "ml-1.5 flex items-center", children: /* @__PURE__ */ c(ec, { open: n }) })
        ]
      }
    ),
    /* @__PURE__ */ c(tc, { open: n, id: s, className: "flex flex-col gap-[2px]", children: e.map((o) => /* @__PURE__ */ c(nc, { step: o }, o.id)) })
  ] });
}
function ng({ steps: e, defaultCollapsed: t = !0 }) {
  return /* @__PURE__ */ c("div", { className: "flex flex-col gap-[2px]", children: eg(e).map(
    (n) => n.kind === "group" ? /* @__PURE__ */ c(tg, { steps: n.steps, defaultCollapsed: t }, n.steps[0].id) : /* @__PURE__ */ c(nc, { step: n.step }, n.step.id)
  ) });
}
function ig({ findings: e, passed: t }) {
  const n = e.filter((r) => r.severity === "fail"), i = e.filter((r) => r.severity === "warn"), s = t ? i : [...n, ...i];
  return /* @__PURE__ */ y("ul", { className: "flex flex-col gap-[5px]", role: "list", children: [
    t ? /* @__PURE__ */ y("li", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ c("span", { className: "text-pass", children: /* @__PURE__ */ c(z, { name: "check" }) }),
      /* @__PURE__ */ c("span", { className: "mono-id text-ink-soft uppercase [letter-spacing:0.06em]", children: "Checks pass" })
    ] }) : n.length > 0 ? /* @__PURE__ */ y("li", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ c("span", { className: "text-fail", children: /* @__PURE__ */ c(z, { name: "xmark" }) }),
      /* @__PURE__ */ y("span", { className: "mono-id text-ink-soft uppercase [letter-spacing:0.06em]", children: [
        n.length,
        " check",
        n.length === 1 ? "" : "s",
        " failed"
      ] })
    ] }) : null,
    s.map((r, o) => /* @__PURE__ */ y("li", { className: "flex items-baseline gap-2", children: [
      /* @__PURE__ */ c("span", { className: L("flex h-[14px] items-center", r.severity === "fail" ? "text-fail" : "text-warn"), children: /* @__PURE__ */ c(z, { name: "warning" }) }),
      /* @__PURE__ */ c("span", { className: "mono-id shrink-0 text-ink-soft uppercase [letter-spacing:0.06em]", children: r.label || r.rule }),
      /* @__PURE__ */ c("span", { className: "min-w-0 text-xs leading-[14px] text-muted", children: r.message })
    ] }, `${r.rule}-${o}`))
  ] });
}
function sg({ startedAt: e }) {
  const [t, n] = O(() => Date.now());
  return F(() => {
    const i = setInterval(() => n(Date.now()), 100);
    return () => clearInterval(i);
  }, []), /* @__PURE__ */ c(G, { children: Yt(Math.max(0, (t - new Date(e).getTime()) / 1e3)) });
}
function Ey({ build: e, collapsed: t }) {
  const n = e.status === "running", i = e.status === "passed", s = n ? "Building" : i ? "Built" : "Failed", r = e.status === "error" ? e.error?.trim().split(`
`).pop() || "Something broke on my end." : null, o = [
    e.revision != null ? jt(e.revision) : null,
    n ? /* @__PURE__ */ c(sg, { startedAt: e.started_at }, "clock") : e.elapsed_s != null ? Jl(e.elapsed_s) : null
  ].filter((a) => a != null);
  return /* @__PURE__ */ y("div", { className: "flex flex-col overflow-hidden rounded-[6px] border border-line", children: [
    /* @__PURE__ */ y("div", { className: "chrome flex h-[30px] items-center justify-between border-b border-line-soft bg-raised px-3", children: [
      /* @__PURE__ */ y("span", { className: "mono-label flex items-center gap-2 text-ink", children: [
        i ? /* @__PURE__ */ c("span", { className: "text-pass", children: /* @__PURE__ */ c(z, { name: "check" }) }) : n ? null : /* @__PURE__ */ c("span", { className: "text-fail", children: /* @__PURE__ */ c(z, { name: "xmark" }) }),
        s
      ] }),
      /* @__PURE__ */ c("span", { className: "mono-caption text-muted [letter-spacing:0.06em]", children: o.map((a, l) => /* @__PURE__ */ y("span", { children: [
        l > 0 ? " · " : "",
        a
      ] }, l)) })
    ] }),
    /* @__PURE__ */ y("div", { className: "flex flex-col gap-[9px] px-3 pt-2.5 pb-3", children: [
      e.steps.length > 0 ? /* @__PURE__ */ c(ng, { steps: e.steps, defaultCollapsed: t ?? i }) : null,
      !n && e.render_url ? /* @__PURE__ */ c(
        "img",
        {
          src: e.render_url,
          alt: `${e.part_name} from four sides`,
          className: "w-full rounded-[4px] border border-line-soft bg-raised"
        }
      ) : null,
      !n && e.findings.length > 0 ? /* @__PURE__ */ c(ig, { findings: e.findings, passed: i }) : null,
      r ? /* @__PURE__ */ c("p", { className: "text-[13px] leading-[19px] text-ink-soft", children: r }) : null
    ] })
  ] });
}
const rg = ["img"], og = {
  p: ({ node: e, ...t }) => /* @__PURE__ */ c("p", { className: "text-pretty [&:not(:first-child)]:mt-2", ...t }),
  ol: ({ node: e, ...t }) => /* @__PURE__ */ c("ol", { className: "mt-2 list-decimal space-y-2 pl-7 marker:font-mono marker:text-[11px] marker:text-accent-ink", ...t }),
  ul: ({ node: e, ...t }) => /* @__PURE__ */ c("ul", { className: "mt-2 list-disc space-y-2 pl-7 marker:text-faint", ...t }),
  strong: ({ node: e, ...t }) => /* @__PURE__ */ c("strong", { className: "font-semibold text-ink", ...t }),
  // A fenced block is a <pre> around a <code>; the pre resets the pill so the
  // block reads as one surface. The className merge keeps react-markdown's
  // language-* class, which it sets on fenced code only.
  pre: ({ node: e, ...t }) => /* @__PURE__ */ c("pre", { className: "mt-2 overflow-x-auto rounded-[6px] bg-raised px-2.5 py-2 font-mono text-[11.5px] leading-[17px] text-ink-soft [&_code]:rounded-none [&_code]:bg-transparent [&_code]:px-0 [&_code]:text-[inherit]", ...t }),
  code: ({ node: e, className: t, ...n }) => /* @__PURE__ */ c("code", { className: L("rounded-[3px] bg-raised px-1 font-mono text-[0.85em] text-ink", t), ...n }),
  a: ({ node: e, ...t }) => /* @__PURE__ */ c("a", { className: "underline decoration-1 underline-offset-[3px] hover:text-accent-ink", target: "_blank", rel: "noreferrer", ...t })
};
function Dy({ content: e, streaming: t = !1 }) {
  return /* @__PURE__ */ c("div", { className: L(t && "md-streaming"), children: /* @__PURE__ */ c(
    Rc,
    {
      skipHtml: !0,
      disallowedElements: rg,
      components: og,
      children: e
    }
  ) });
}
const ag = {
  standard: "Published",
  measured: "You measured",
  asked: "You told us",
  doctrine: "Rule of thumb"
};
function lg(e) {
  if (e.source) return e.source;
  const t = e.how.toLowerCase();
  return /\b(caliper|measured|ruler|tape)\b/.test(t) ? "measured" : /\b(user|stated|asked|said|told)\b/.test(t) ? "asked" : /\b(standard|spec|published|listing|datasheet|nominal)\b/.test(t) ? "standard" : "doctrine";
}
function Po({ children: e }) {
  return /* @__PURE__ */ y("div", { className: "flex items-center gap-2", children: [
    /* @__PURE__ */ c("span", { className: "mono-caption shrink-0 text-faint [letter-spacing:0.12em]", children: e }),
    /* @__PURE__ */ c("span", { className: "h-px flex-1 bg-line-soft" })
  ] });
}
function Vy({ spec: e }) {
  return /* @__PURE__ */ y("div", { className: "flex flex-col overflow-hidden rounded-[6px] border border-line", children: [
    /* @__PURE__ */ c("div", { className: "chrome flex h-[30px] items-center justify-between border-b border-line-soft bg-raised px-3", children: /* @__PURE__ */ y("span", { className: "mono-label flex items-center gap-2 text-ink", children: [
      /* @__PURE__ */ c(z, { name: "lock" }),
      "The plan"
    ] }) }),
    /* @__PURE__ */ y("div", { className: "flex flex-col gap-3 px-3 pt-[11px] pb-3", children: [
      /* @__PURE__ */ c("p", { className: "text-[13px] leading-[19px] text-pretty text-ink-soft", children: e.summary }),
      /* @__PURE__ */ c("dl", { className: "flex flex-col gap-[5px]", children: e.dimensions.map((t) => {
        const n = lg(t);
        return /* @__PURE__ */ y(
          "div",
          {
            className: "flex items-baseline gap-2",
            title: t.provisional ? `${t.how} · a best guess until it is measured` : t.how,
            children: [
              /* @__PURE__ */ c("dt", { className: "min-w-0 flex-1 truncate text-xs leading-4 text-ink-soft", children: Cn(t.name) }),
              /* @__PURE__ */ y("dd", { className: "mono-value text-ink", children: [
                t.provisional ? "~" : "",
                t.value_mm,
                " mm"
              ] }),
              /* @__PURE__ */ c("dd", { className: n === "measured" ? "mono-caption w-24 shrink-0 text-right text-accent-ink [letter-spacing:0.06em]" : "mono-caption w-24 shrink-0 text-right text-muted [letter-spacing:0.06em]", children: ag[n] })
            ]
          },
          t.name
        );
      }) }),
      e.acceptance.length > 0 ? /* @__PURE__ */ y("div", { className: "flex flex-col gap-1.5", children: [
        /* @__PURE__ */ c(Po, { children: "Done when" }),
        /* @__PURE__ */ c("ul", { className: "flex list-disc flex-col gap-1 pl-4 marker:text-faint", role: "list", children: e.acceptance.map((t, n) => /* @__PURE__ */ c("li", { className: "text-xs leading-4 text-pretty text-ink-soft", children: t.criterion }, n)) })
      ] }) : null,
      e.params.length > 0 ? /* @__PURE__ */ y("div", { className: "flex flex-col gap-1.5", children: [
        /* @__PURE__ */ c(Po, { children: `${e.params.length} slider${e.params.length === 1 ? "" : "s"} to adjust` }),
        /* @__PURE__ */ c("ul", { className: "flex flex-wrap gap-1", role: "list", children: e.params.map((t) => /* @__PURE__ */ c("li", { className: "rounded-control bg-raised px-1.5 py-0.5 text-xs leading-4 text-ink-soft", title: t.description, children: Cn(t.name) }, t.name)) })
      ] }) : null
    ] })
  ] });
}
function cg(e) {
  return e.previous_value_mm != null && e.previous_value_mm !== e.value_mm;
}
function Ry({
  measurement: e,
  staleParts: t,
  onAccept: n,
  onEdit: i,
  onRebuild: s,
  rebuilding: r
}) {
  const o = e.stale_parts ?? [], a = t ? o.filter((d) => t.includes(d)) : o, l = cg(e), u = e.provisional && n;
  return /* @__PURE__ */ y("div", { className: "flex flex-col overflow-hidden rounded-[6px] border border-line", children: [
    /* @__PURE__ */ y("div", { className: "chrome flex h-[30px] items-center justify-between border-b border-line-soft bg-raised px-3", children: [
      /* @__PURE__ */ y("span", { className: "mono-label flex items-center gap-2 text-ink", children: [
        /* @__PURE__ */ c(z, { name: "ruler" }),
        l ? "Measurement changed" : "Measurement recorded"
      ] }),
      e.provisional ? /* @__PURE__ */ c("span", { className: "mono-caption text-warn [letter-spacing:0.1em]", children: "Provisional" }) : null
    ] }),
    /* @__PURE__ */ y("div", { className: "flex flex-col gap-1.5 px-3 pt-[9px] pb-2.5", children: [
      /* @__PURE__ */ y("div", { className: "flex items-baseline gap-2", children: [
        /* @__PURE__ */ c("span", { className: "min-w-0 flex-1 truncate text-xs leading-4 text-ink-soft", children: Cn(e.name) }),
        l ? /* @__PURE__ */ y("span", { className: "mono-value text-muted line-through", children: [
          e.previous_value_mm,
          " mm"
        ] }) : null,
        /* @__PURE__ */ y("span", { className: "mono-value text-ink", children: [
          e.value_mm,
          " mm"
        ] })
      ] }),
      /* @__PURE__ */ c("p", { className: "text-xs leading-4 text-muted", children: e.how }),
      u || i ? /* @__PURE__ */ y("div", { className: "mt-0.5 flex items-center gap-1.5", children: [
        u ? /* @__PURE__ */ c(
          "button",
          {
            type: "button",
            onClick: () => n(e.name),
            className: "btn-label chrome rounded-control focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent bg-ink px-2 py-1 text-white transition-colors hover:bg-ink-soft",
            children: "Accept"
          }
        ) : null,
        i ? /* @__PURE__ */ c(
          "button",
          {
            type: "button",
            onClick: () => i(e.name),
            className: "btn-label chrome rounded-control focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent border border-line px-2 py-1 text-ink-soft transition-colors hover:bg-raised",
            children: "Edit"
          }
        ) : null
      ] }) : null,
      a.length > 0 ? /* @__PURE__ */ y("div", { className: "mt-1 flex items-center gap-2 rounded-[6px] bg-warn-wash px-2.5 py-1.5", children: [
        /* @__PURE__ */ c("span", { className: "size-1.5 shrink-0 rounded-full bg-warn" }),
        /* @__PURE__ */ c("span", { className: "mono-caption min-w-0 flex-1 truncate text-warn [letter-spacing:0.08em]", children: a.length === 1 ? `${a[0]} is stale` : `${a.length} parts stale · ${a.join(", ")}` }),
        s ? /* @__PURE__ */ c(
          "button",
          {
            type: "button",
            onClick: () => s(a),
            disabled: r,
            className: "btn-label chrome rounded-control focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent bg-ink px-2 py-1 text-white transition-colors hover:bg-ink-soft disabled:opacity-60",
            children: r ? "Rebuilding…" : "Rebuild"
          }
        ) : null
      ] }) : null
    ] })
  ] });
}
const ve = {
  stage: 15069435,
  part: 16732720,
  // Scenery stays neutral, and its albedo is pre-darkened because the key is bright enough
  // to clip the part's red: 0x78818d lit from above reads as the grey-blue token, 0xaab6c6.
  context: 7897485,
  edge: 10691593,
  gridMinor: 13623537,
  gridMajor: 12374760,
  gridBorder: 10467021,
  accent: 16732720,
  fail: 13570600,
  warn: 14714624,
  // Amber and violet are lit by the same key, so both are pre-darkened the same way.
  ghost: 8608554,
  cap: 7169436
}, ug = { fail: 0.4, warn: 0.38 }, dg = 0.62, fg = 25, ic = (e, t) => e === "fail" ? t.fail : t.warn;
function hg() {
  const e = new Lc(16777215, 6);
  e.position.set(0.4, -0.9, 2.9);
  const t = new Fc(16777215, ve.gridMajor, 1);
  return t.position.set(0, 0, 1), [t, e];
}
const nn = (e, t) => {
  const n = new Hi();
  return n.setAttribute("position", new qi(new Float32Array(e), 3)), new Ki(n, t);
};
function pg([e, t], n = 10) {
  const i = e / 2, s = t / 2, r = n > 0 ? n : 10, o = r * 5, a = [], l = [];
  for (let f = r; f < i; f += r)
    (f % o === 0 ? l : a).push(f, -s, 0, f, s, 0, -f, -s, 0, -f, s, 0);
  for (let f = r; f < s; f += r)
    (f % o === 0 ? l : a).push(-i, f, 0, i, f, 0, -i, -f, 0, i, -f, 0);
  const u = [0, -s, 0, 0, s, 0, -i, 0, 0, i, 0, 0], d = [
    -i,
    -s,
    0,
    i,
    -s,
    0,
    i,
    -s,
    0,
    i,
    s,
    0,
    i,
    s,
    0,
    -i,
    s,
    0,
    -i,
    s,
    0,
    -i,
    -s,
    0
  ], h = new yn();
  return h.add(
    nn(a, new ot({ color: ve.gridMinor })),
    nn(l, new ot({ color: ve.gridMajor })),
    nn(d, new ot({ color: ve.gridBorder })),
    nn(u, new ot({ color: ve.accent, transparent: !0, opacity: 0.35 }))
  ), h;
}
const sn = 1.2;
function mg(e) {
  const t = new et(
    new Wc(1, sn, sn),
    new Vt({ color: ve.accent, transparent: !0, opacity: 0.9 })
  );
  return t.position.set(0, -e / 2 + sn * 2, sn / 2), t;
}
const sc = (e) => {
  const t = e.getSize(new de());
  return Math.max(t.x, t.y, t.z) || 10;
};
function gg(e, t, n) {
  const i = n.getCenter(new de()), s = sc(n), r = s / (2 * Math.tan(e.fov * Math.PI / 180 / 2)) * 2.1, o = [0.7, -0.75, 0.6];
  e.up.set(0, 0, 1), e.position.set(i.x + r * o[0], i.y + r * o[1], i.z + r * o[2]), t.target.copy(i), e.near = s / 100, e.far = s * 100, e.updateProjectionMatrix(), t.update();
}
function rc(e, t, n) {
  const i = sc(n), s = e.distanceTo(t);
  return !n.containsPoint(e) && n.clone().expandByScalar(i * 2).containsPoint(t) && s > i / 100 && s < i * 50;
}
function oc(e, t) {
  return e.updateMatrixWorld(), new zc().setFromProjectionMatrix(
    new an().multiplyMatrices(e.projectionMatrix, e.matrixWorldInverse)
  ).intersectsBox(t);
}
function yg(e, t, n) {
  const i = [];
  e.traverse((r) => {
    r.isMesh && i.push(r);
  });
  const s = new yn();
  for (const r of i) {
    const o = r.geometry;
    o.attributes.normal || o.computeVertexNormals();
    const a = new _i({
      color: n.part,
      // Flat and matte: printed plastic, no specular sheen over the accent.
      metalness: 0,
      roughness: 0.85,
      // Pushed back a hair so the edge overlay draws without z-fighting the surface.
      polygonOffset: !0,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
      clippingPlanes: [t]
    });
    o.attributes.color && (a.vertexColors = !0);
    const l = new et(o, a);
    for (const u of [].concat(r.material)) u.dispose();
    if (l.name = r.name || r.parent?.name || "", l.name === "context")
      a.color.setHex(n.context), a.transparent = !0, a.opacity = 0.3;
    else {
      const u = new Ki(
        new na(o, fg),
        new ot({ color: n.edge, transparent: !0, opacity: 0.35, clippingPlanes: [t] })
      );
      l.add(u);
    }
    s.add(l);
  }
  return s;
}
const ac = (e) => e.children.filter((t) => t.isMesh && t.name !== "context" && t.name !== "target");
function xg(e) {
  e.position.set(0, 0, 0), e.updateMatrixWorld(!0);
  const t = new Rt();
  for (const o of e.children) o.name !== "target" && t.expandByObject(o);
  const n = new Rt();
  for (const o of ac(e)) n.expandByObject(o);
  n.isEmpty() && n.copy(t);
  const i = n.getCenter(new de()), s = new de(-i.x, -i.y, -n.min.z), r = e.parent ? e.parent.getWorldQuaternion(new Ys()) : new Ys();
  return e.position.copy(s).applyQuaternion(r.invert()), e.updateMatrixWorld(!0), t.translate(s);
}
function vg(e) {
  const t = new Rt();
  for (const n of ac(e)) t.expandByObject(n);
  return t;
}
const Mo = {
  depthWrite: !1,
  depthTest: !1,
  colorWrite: !1,
  stencilWrite: !0,
  stencilFunc: jc
};
function bg(e, t) {
  const n = new Vt({
    ...Mo,
    clippingPlanes: [t],
    side: $c,
    stencilFail: jn,
    stencilZFail: jn,
    stencilZPass: jn
  }), i = new Vt({
    ...Mo,
    clippingPlanes: [t],
    side: Uc,
    stencilFail: Un,
    stencilZFail: Un,
    stencilZPass: Un
  });
  return [n, i].map((s) => {
    const r = new et(e.geometry, s);
    return r.matrixAutoUpdate = !1, r.matrix = e.matrixWorld, r.renderOrder = 1, r;
  });
}
function wg() {
  const e = new et(
    new Oc(1, 1),
    new _i({
      // Violet, because the cap is the one surface that is not part material and must not
      // impersonate a signal: amber is a warn, red a fail, orange the part itself.
      color: ve.cap,
      metalness: 0,
      roughness: 0.85,
      side: Gi,
      stencilWrite: !0,
      stencilRef: 0,
      stencilFunc: Ic,
      stencilFail: $n,
      stencilZFail: $n,
      stencilZPass: $n
    })
  );
  return e.renderOrder = 1.1, e.visible = !1, e.onAfterRender = (t) => t.clearStencil(), e;
}
function kg(e, t, n, i) {
  const s = new Hi();
  s.setAttribute("position", new qi(new Float32Array(e), 3));
  const r = new Vt({
    color: ic(t, i),
    transparent: !0,
    opacity: ug[t],
    side: Gi,
    polygonOffset: !0,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
    depthWrite: !1,
    clippingPlanes: [n]
  });
  return new et(s, r);
}
function Tg(e, t, n) {
  const i = new Hi();
  i.setAttribute("position", new qi(new Float32Array(e), 3));
  const s = new Ki(
    new na(i, 1),
    new ot({ color: n.accent, depthTest: !1, clippingPlanes: [t] })
  );
  return s.renderOrder = 998, i.dispose(), s;
}
function Sg(e, t, n, i) {
  const s = new Vt({ color: ic(t, i), depthTest: !1, depthWrite: !1 }), r = new et(new Bc(1, 12, 8), s);
  return r.position.set(e[0], e[1], e[2]), r.scale.setScalar(n), r.renderOrder = 999, r;
}
const Ng = (e) => {
  for (const t of Array.isArray(e) ? e : [e]) t.dispose();
};
function ge(e) {
  e.traverse((t) => {
    const n = t;
    !n.geometry || t.name === "target" || (n.geometry.dispose(), Ng(n.material));
  });
}
function Co(e, t, n) {
  for (const i of t) {
    const s = e.getObjectByName(i.node), r = i.param ? n[i.param] : void 0, o = typeof r == "number" && Number.isFinite(r) ? r : i.at;
    if (!s || !Number.isFinite(o) || !Number.isFinite(i.at)) continue;
    const a = new de(...i.dir);
    if (!a.lengthSq()) continue;
    const l = s.userData.nurbJointBase ??= s.matrix.clone(), [u, d, h] = i.origin;
    s.matrixAutoUpdate = !1, s.matrix.copy(new an().makeTranslation(u, d, h).multiply(new an().makeRotationAxis(a.normalize(), (o - i.at) * Math.PI / 180)).multiply(new an().makeTranslation(-u, -d, -h)).multiply(l)), s.matrixWorldNeedsUpdate = !0;
  }
  e.updateMatrixWorld(!0);
}
const Bi = 1e6, Ag = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] }, Eo = 10, Pg = 42, Mg = 4e3, Cg = Math.PI / 12, Do = 1.8, Eg = 2, Vo = 0.9, Dg = 320, js = () => {
  try {
    return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? !1;
  } catch {
    return !1;
  }
};
function lc(e, t) {
  if (e <= 0) return 0;
  if (e >= 1) return 1;
  const [n, i, s, r] = t, o = (l, u, d) => 3 * (1 - l) ** 2 * l * u + 3 * (1 - l) * l ** 2 * d + l ** 3;
  let a = e;
  for (let l = 0; l < 8; l++) {
    const u = o(a, n, s) - e;
    if (Math.abs(u) < 1e-4) break;
    const d = 3 * (1 - a) ** 2 * n + 6 * (1 - a) * a * (s - n) + 3 * a ** 2 * (1 - s);
    if (Math.abs(d) < 1e-6) break;
    a -= u / d;
  }
  return o(a, i, r);
}
const Ro = (e) => {
  const t = [];
  return e.traverse((n) => {
    const i = n.material;
    if (i)
      for (const s of Array.isArray(i) ? i : [i])
        t.push({ material: s, opacity: s.opacity, transparent: s.transparent, depthWrite: s.depthWrite });
  }), t;
}, Lo = (e) => {
  for (const t of e)
    t.material.opacity = t.opacity, t.material.transparent = t.transparent, t.material.depthWrite = t.depthWrite;
};
function Vg(e, t, n) {
  const i = n.now ?? (() => performance.now()), s = n.schedule ?? ((p) => requestAnimationFrame(() => p())), r = n.unschedule ?? ((p) => cancelAnimationFrame(p)), o = t ? Ro(t) : [], a = e ? Ro(e) : [];
  for (const p of o)
    p.material.transparent = !0, p.material.opacity = 0;
  for (const p of a)
    p.material.transparent = !0, p.material.depthWrite = !1;
  const l = i(), u = Math.max(1, n.seconds * 1e3);
  let d = 0, h = !0;
  const f = () => {
    if (d = 0, !h) return;
    const p = Math.min(1, (i() - l) / u);
    for (const m of o) m.material.opacity = m.opacity * p;
    for (const m of a) m.material.opacity = m.opacity * (1 - p);
    if (n.render(), p < 1) {
      d = s(f);
      return;
    }
    h = !1, Lo(o), n.onDone();
  };
  return d = s(f), () => {
    h && (h = !1, d && r(d), Lo(o));
  };
}
const Rg = (e, t) => !e || !t ? e === t : e.position.every((n, i) => n === t.position[i]) && e.target.every((n, i) => n === t.target[i]), Lg = (e) => {
  let t = null;
  return e.traverse((n) => {
    n.isMesh && !t && (t = n.geometry);
  }), t;
};
function cc(e, t, n) {
  if (!e.controls) return !1;
  const i = new de().fromArray(t.position), s = new de().fromArray(t.target);
  if (!rc(i, s, n)) return !1;
  e.camera.position.copy(i), e.controls.target.copy(s);
  const r = n.getSize(new de()), o = Math.max(r.x, r.y, r.z) || 10;
  return e.camera.near = o / 100, e.camera.far = o * 100, e.camera.updateProjectionMatrix(), e.controls.update(), oc(e.camera, n);
}
function Fg(e, t) {
  return !e.controls || !rc(e.camera.position, e.controls.target, t) ? !1 : oc(e.camera, t);
}
function Og(e) {
  const t = e.controls;
  t && (t._sphericalDelta?.set(0, 0, 0), t._panOffset?.set(0, 0, 0), t._scale = 1);
}
function Tt(e, t) {
  e.plate && (e.scene.remove(e.plate), ge(e.plate), e.plate = null);
  const n = t ?? Ig(e);
  e.plateSize = n, n && (e.plate = pg(n, e.pitch), e.scene.add(e.plate));
}
function Ig(e) {
  if (!e.part) return null;
  const t = new Rt().setFromObject(e.part).getSize(new de()), n = Math.max(100, Math.ceil(Math.max(t.x, t.y) * 1.8 / 50) * 50);
  return [n, n];
}
function Fo(e, t) {
  if (!e.part) return;
  e.box = xg(e.part), e.size = e.box.getSize(new de()).length(), e.quiet = !0, !(e.framed ? Fg(e, e.box) : t && cc(e, t, e.box)) && e.controls && gg(e.camera, e.controls, e.box), e.quiet = !1, e.framed = !0;
}
function Oo(e) {
  const t = e.fading;
  t && (e.fading = null, t.cancel(), e.root.remove(t.group), ge(t.group));
}
function Bg(e) {
  const t = e.controls;
  if (!t || js()) return;
  e.nudgeRaf && cancelAnimationFrame(e.nudgeRaf);
  const n = t.target.clone(), i = e.camera.position.clone().sub(n), s = e.camera.up.clone().normalize(), r = performance.now(), o = W.coast * 1e3;
  e.quiet = !0;
  const a = () => {
    e.nudgeRaf = 0;
    const l = Math.min(1, (performance.now() - r) / o);
    l >= 1 && (e.quiet = !1), e.camera.position.copy(i).applyAxisAngle(s, Cg * lc(l, Q.out)).add(n), t.update(), e.render(), l < 1 && (e.nudgeRaf = requestAnimationFrame(a));
  };
  e.nudgeRaf = requestAnimationFrame(a);
}
function uc(e) {
  e.purgeRaf && cancelAnimationFrame(e.purgeRaf), e.purgeRaf = 0, e.purge && (e.scene.remove(e.purge), ge(e.purge), e.purge = null);
}
function $g(e) {
  if (!e.plate || !e.plateSize || js()) return !1;
  const [t, n] = e.plateSize, i = mg(n);
  e.purge = i, e.scene.add(i);
  const s = i.material, r = performance.now(), o = () => {
    e.purgeRaf = 0;
    const a = (performance.now() - r) / 1e3, l = Math.max(1e-3, t * lc(a / Do, Q.out));
    i.scale.x = l, i.position.x = -t / 2 + l / 2;
    const u = a - Do - Eg;
    if (s.opacity = u <= 0 ? Vo : Vo * (1 - Math.min(1, u / W.settle)), e.render(), u < W.settle) {
      e.purgeRaf = requestAnimationFrame(o);
      return;
    }
    uc(e), e.render();
  };
  return e.purgeRaf = requestAnimationFrame(o), !0;
}
function Io(e, t, n) {
  !t || n.current || (n.current = $g(e));
}
function gn(e) {
  for (const t of e.writers)
    e.scene.remove(t), t.material.dispose();
  e.writers = [];
}
function jg(e) {
  if (gn(e), !!e.part) {
    e.part.updateMatrixWorld(!0);
    for (const t of e.part.children)
      if (!(!t.isMesh || t.name === "context" || t.name === "target"))
        for (const n of bg(t, e.plane))
          n.visible = e.cutting, e.scene.add(n), e.writers.push(n);
  }
}
function nt(e, t) {
  if (!t) {
    e.cutting = !1, e.cutSign = 0, e.cap.visible = !1;
    for (const d of e.writers) d.visible = !1;
    e.plane.constant = Bi, e.render();
    return;
  }
  if ((!e.cutting || e.cutAxis !== t.axis) && (e.cutting = !0, e.cutAxis = t.axis, e.cutSign = 0), !e.part) {
    e.cap.visible = !1, e.plane.constant = Bi, e.render();
    return;
  }
  const n = vg(e.part), i = t.axis, s = n.min[i], r = n.max[i];
  e.cutSign || (e.cutSign = e.camera.position[i] >= (s + r) / 2 ? 1 : -1);
  const o = e.cutSign === 1 ? t.t : 1 - t.t, a = s + (r - s) * (0.02 + 0.96 * o), l = Ag[i];
  e.plane.normal.set(-e.cutSign * l[0], -e.cutSign * l[1], -e.cutSign * l[2]), e.plane.constant = e.cutSign * a, e.cap.visible = !0;
  for (const d of e.writers) d.visible = !0;
  const u = n.getSize(new de()).length();
  e.cap.scale.set(u, u, 1), e.plane.projectPoint(n.getCenter(new de()), e.cap.position), e.cap.lookAt(
    e.cap.position.x - e.plane.normal.x,
    e.cap.position.y - e.plane.normal.y,
    e.cap.position.z - e.plane.normal.z
  ), e.render();
}
function St(e, t, n) {
  for (const r of e.marks.children) ge(r);
  if (e.marks.clear(), e.glows = [], !e.part) {
    e.render();
    return;
  }
  const i = e.part.position, s = Math.max(0.6, e.size / 90);
  t.forEach((r, o) => {
    if (r.face && r.face.length) {
      const l = kg(r.face, r.severity, e.plane, ve);
      l.position.copy(i), l.userData.finding = o, o === n && (l.material.opacity = dg, l.add(Tg(r.face, e.plane, ve))), e.marks.add(l), e.glows.push(l);
    }
    if (!r.where) return;
    const a = Sg(
      [r.where[0] + i.x, r.where[1] + i.y, r.where[2] + i.z],
      r.severity,
      s,
      ve
    );
    e.marks.add(a);
  }), e.render();
}
function Ly(e) {
  const { glbUrl: t, targetUrl: n, targetOffset: i, findings: s, highlight: r, bed: o, up: a, section: l, camera: u, settleKey: d, purge: h, className: f } = e, [p, m] = O(!1), x = C(null), v = C(null), w = C(null), T = C(null), g = C(e);
  g.current = e;
  const S = C(!1), R = C([]), D = e.anchors ?? [], k = D.map((b) => `${b.key}@${b.point.join(",")}`).join("|");
  F(() => {
    v.current?.render();
  }, [k]), F(() => {
    const b = x.current;
    if (!b) return;
    const B = new _c();
    B.background = new Gc(ve.stage);
    const $ = new Kc(45, 1, 0.1, 1e4);
    $.up.set(0, 0, 1);
    const Y = new yn(), H = new yn();
    Y.add(H), B.add(Y);
    for (const I of hg()) B.add(I);
    const _ = wg();
    B.add(_);
    const P = {
      renderer: null,
      scene: B,
      camera: $,
      controls: null,
      plane: new Hc(new de(0, 0, -1), Bi),
      root: Y,
      marks: H,
      cap: _,
      part: null,
      fading: null,
      ghost: null,
      plate: null,
      plateSize: null,
      pitch: Eo,
      purge: null,
      writers: [],
      glows: [],
      box: new Rt(),
      size: 0,
      cutting: !1,
      cutAxis: "z",
      cutSign: 0,
      framed: !1,
      generation: 0,
      loaded: 0,
      targetGeneration: 0,
      quiet: !1,
      lastW: 0,
      lastH: 0,
      raf: 0,
      nudgeRaf: 0,
      purgeRaf: 0,
      camTimer: null,
      render: () => {
      },
      place: () => {
      }
    };
    v.current = P, b.__nurbViewer = P;
    try {
      P.renderer = new qc({ antialias: !0, stencil: !0 });
    } catch {
      b.setAttribute("data-nogl", "");
    }
    const U = P.renderer?.domElement ?? null;
    P.renderer && U && (P.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)), P.renderer.localClippingEnabled = !0, U.className = "block h-full w-full", b.appendChild(U), P.controls = new Zc($, U), P.controls.enableDamping = !0, P.controls.dampingFactor = 0.0533);
    const ee = () => {
      if (P.raf = 0, !P.renderer || !P.controls) return;
      const I = P.controls.update();
      I || Og(P), P.renderer.render(B, $), P.place(), I && P.render();
    };
    P.place = () => {
      const I = P.part?.children.find((X) => X.isMesh && X.name !== "context");
      for (const [X, ie] of (g.current.anchors ?? []).entries()) {
        const re = R.current[X];
        if (!re) continue;
        const ke = I ? I.localToWorld(new de(...ie.point)).project($) : null;
        if (!ke || ke.z > 1) {
          re.style.visibility = "hidden";
          continue;
        }
        const $e = (ke.x + 1) / 2 * P.lastW, bt = $e > P.lastW - Dg;
        re.toggleAttribute("data-flip", bt), re.style.visibility = "visible", re.style.transform = `translate(${$e}px, ${(1 - ke.y) / 2 * P.lastH}px)${bt ? " translateX(-100%)" : ""}`;
      }
    }, P.render = () => {
      !P.renderer || P.raf || (P.raf = requestAnimationFrame(ee));
    };
    const se = (I, X) => {
      const ie = Math.floor(I), re = Math.floor(X);
      !ie || !re || ie === P.lastW && re === P.lastH || (P.lastW = ie, P.lastH = re, P.renderer?.setSize(ie, re, !1), $.aspect = ie / re, $.updateProjectionMatrix(), P.render());
    }, ne = new ResizeObserver((I) => {
      const X = I[I.length - 1].contentRect;
      se(X.width, X.height);
    });
    ne.observe(b), se(b.clientWidth, b.clientHeight);
    const E = () => {
      P.render(), !P.quiet && (P.camTimer && clearTimeout(P.camTimer), P.camTimer = setTimeout(() => {
        const I = g.current.onCamera;
        !I || !P.controls || I({
          position: P.camera.position.toArray(),
          target: P.controls.target.toArray()
        });
      }, 250));
    };
    return P.controls?.addEventListener("change", E), () => {
      ne.disconnect(), P.raf && cancelAnimationFrame(P.raf), P.nudgeRaf && cancelAnimationFrame(P.nudgeRaf), P.camTimer && clearTimeout(P.camTimer), P.generation++, P.targetGeneration++, P.controls?.removeEventListener("change", E), P.controls?.dispose(), gn(P), uc(P);
      for (const I of H.children) ge(I);
      Oo(P), P.part && ge(P.part), P.ghost && (P.ghost.geometry.dispose(), P.ghost.material.dispose()), P.plate && ge(P.plate), ge(_), P.renderer?.setAnimationLoop(null), P.renderer?.forceContextLoss(), P.renderer?.dispose(), U?.remove(), delete b.__nurbViewer, v.current = null;
    };
  }, []), F(() => {
    const b = v.current;
    if (!b || !b.controls) return;
    const B = ++b.generation;
    Oo(b);
    const $ = () => {
      b.part && (b.root.remove(b.part), b.ghost && b.part.remove(b.ghost), ge(b.part), b.part = null);
    };
    if (!t) {
      $(), Tt(b, g.current.bed), gn(b), St(b, [], null), nt(b, g.current.section);
      return;
    }
    new Xs().loadAsync(t).then((Y) => {
      if (B !== b.generation) {
        ge(Y.scene);
        return;
      }
      const H = yg(Y.scene, b.plane, ve);
      if (b.loaded = B, !H.children.length) {
        $(), ge(H), gn(b), St(b, [], null), nt(b, g.current.section);
        return;
      }
      const _ = b.part;
      _ && b.ghost && _.remove(b.ghost), b.ghost && H.add(b.ghost), b.root.add(H), b.part = H, Co(H, g.current.joints ?? [], g.current.jointValues ?? {}), Fo(b, g.current.camera), Tt(b, g.current.bed), Io(b, g.current.purge, S), T.current = g.current.camera ?? null, jg(b), nt(b, g.current.section), St(b, g.current.findings ?? [], g.current.highlight), _ && js() ? (b.root.remove(_), ge(_)) : _ && (b.fading = {
        group: _,
        cancel: Vg(_, H, {
          seconds: W.settle,
          render: b.render,
          onDone: () => {
            b.fading = null, b.root.remove(_), ge(_), b.render();
          }
        })
      }), b.render();
    }).catch((Y) => {
      B === b.generation && console.warn(`ViewerIsland: could not load ${t}`, Y);
    });
  }, [t]), F(() => {
    const b = v.current;
    b?.part && (Co(b.part, e.joints ?? [], e.jointValues ?? {}), nt(b, g.current.section), b.render());
  }, [e.joints, e.jointValues]);
  const A = (i ?? [0, 0, 0]).join(",");
  F(() => {
    const b = v.current;
    if (!b || !b.controls) return;
    const B = ++b.targetGeneration;
    if (b.ghost && (b.ghost.parent?.remove(b.ghost), b.ghost.geometry.dispose(), b.ghost.material.dispose(), b.ghost = null), !n) {
      b.render();
      return;
    }
    new Xs().loadAsync(n).then(($) => {
      if (B !== b.targetGeneration) {
        ge($.scene);
        return;
      }
      const Y = Lg($.scene);
      if (!Y) return;
      Y.attributes.normal || Y.computeVertexNormals();
      const H = new et(
        Y,
        new _i({
          color: ve.ghost,
          metalness: 0,
          roughness: 0.9,
          transparent: !0,
          opacity: 0.3,
          depthWrite: !1,
          side: Gi,
          clippingPlanes: [b.plane]
        })
      );
      H.name = "target";
      const _ = A.split(",").map(Number);
      H.position.set(_[0], _[1], _[2]), b.ghost = H, b.part?.add(H), b.render();
    }).catch(() => {
    });
  }, [n, A]), F(() => {
    const b = v.current;
    !b || b.loaded !== b.generation || St(b, s ?? [], r);
  }, [s, r]), F(() => {
    const b = v.current;
    b && (Tt(b, o), b.render());
  }, [o?.[0], o?.[1], !o]);
  const N = C(d);
  F(() => {
    const b = v.current, B = N.current;
    N.current = d, !(!b || d === void 0 || d === B) && Bg(b);
  }, [d]), F(() => {
    const b = v.current;
    b && Io(b, h, S);
  }, [h, o?.[0], o?.[1]]), F(() => {
    let b = null;
    const B = () => {
      m(!0), b && clearTimeout(b), b = setTimeout(() => m(!1), Mg);
    };
    return window.addEventListener("nurb:gridfinity", B), () => {
      window.removeEventListener("nurb:gridfinity", B), b && clearTimeout(b);
    };
  }, []), F(() => {
    const b = v.current;
    b && (b.pitch = p ? Pg : Eo, Tt(b, g.current.bed), b.render());
  }, [p]);
  const M = (a ?? [0, 0, 1]).join(",");
  return F(() => {
    const b = v.current;
    if (!b) return;
    const B = new de(...M.split(",").map(Number)).normalize();
    b.root.quaternion.setFromUnitVectors(B, new de(0, 0, 1)), b.root.updateMatrixWorld(!0), b.part && (Fo(b, g.current.camera), Tt(b, g.current.bed), nt(b, g.current.section), St(b, g.current.findings ?? [], g.current.highlight)), b.render();
  }, [M]), F(() => {
    const b = v.current;
    b && nt(b, l);
  }, [l]), F(() => {
    const b = v.current;
    if (!b || !b.part || !u || Rg(u, T.current)) return;
    T.current = u, b.quiet = !0;
    const B = cc(b, u, b.box);
    b.quiet = !1, B && b.render();
  }, [u]), /* @__PURE__ */ y(
    "div",
    {
      ref: x,
      className: L("relative block h-full w-full", e.onPick && "cursor-crosshair", f),
      onPointerDown: (b) => {
        w.current = [b.clientX, b.clientY];
      },
      onPointerUp: (b) => {
        const B = w.current;
        w.current = null;
        const $ = v.current, { onHighlight: Y, onPick: H } = g.current;
        if (!B || !$ || !Y && !H || Math.hypot(b.clientX - B[0], b.clientY - B[1]) > 5) return;
        const _ = b.currentTarget.getBoundingClientRect();
        if (!_.width || !_.height) return;
        const P = new Yc(
          (b.clientX - _.left) / _.width * 2 - 1,
          -((b.clientY - _.top) / _.height) * 2 + 1
        ), U = new Xc();
        if (U.setFromCamera(P, $.camera), H) {
          const se = ($.part?.children ?? []).filter((E) => E.isMesh && E.name !== "context"), ne = U.intersectObjects(se, !1).find((E) => !$.cutting || $.plane.distanceToPoint(E.point) >= 0);
          if (ne?.face) {
            const E = ne.object.worldToLocal(ne.point.clone()), I = ne.face.normal;
            H({ point: [E.x, E.y, E.z], normal: [I.x, I.y, I.z] });
          }
          return;
        }
        if (!Y) return;
        const ee = U.intersectObjects($.glows, !1).find((se) => !$.cutting || $.plane.distanceToPoint(se.point) >= 0);
        Y(ee ? ee.object.userData.finding : null);
      },
      children: [
        D.map((b, B) => /* @__PURE__ */ c(
          "div",
          {
            ref: ($) => {
              R.current[B] = $;
            },
            className: "group pointer-events-none absolute top-0 left-0 z-10 *:pointer-events-auto",
            style: { visibility: "hidden" },
            onPointerDown: ($) => $.stopPropagation(),
            onPointerUp: ($) => $.stopPropagation(),
            children: b.node
          },
          b.key
        )),
        p && /* @__PURE__ */ c("div", { className: "mono-caption pointer-events-none absolute bottom-3 left-3 text-faint [letter-spacing:0.12em]", children: "GRID 42.0 MM" })
      ]
    }
  );
}
const Ug = {
  accent: "bg-accent text-white hover:bg-accent-hover",
  ink: "bg-ink text-white hover:bg-ink-soft",
  outline: "border border-line bg-ground text-ink-soft hover:border-panel-edge hover:text-ink",
  ghost: "text-muted hover:bg-raised hover:text-ink",
  danger: "bg-fail text-white hover:bg-fail/90"
}, zg = {
  sm: "h-7 px-3",
  md: "h-9 px-3",
  lg: "h-10 px-4"
}, Me = Wi(function({ variant: t = "outline", size: n = "sm", icon: i, trailingIcon: s, className: r, children: o, type: a = "button", ...l }, u) {
  return /* @__PURE__ */ y(
    "button",
    {
      ref: u,
      type: a,
      className: L(
        "chrome btn-label inline-flex shrink-0 items-center justify-center gap-2 rounded-[3px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50",
        Ug[t],
        zg[n],
        i && "pl-2.5",
        s && "pr-2.5",
        r
      ),
      ...l,
      children: [
        i ? /* @__PURE__ */ c(z, { name: i }) : null,
        o,
        s ? /* @__PURE__ */ c(z, { name: s }) : null
      ]
    }
  );
});
function Us({
  icon: e,
  label: t,
  active: n = !1,
  className: i,
  ...s
}) {
  return /* @__PURE__ */ y(
    "button",
    {
      type: "button",
      "aria-label": t,
      title: t,
      className: L(
        "chrome relative inline-flex size-7 shrink-0 items-center justify-center rounded-[4px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent disabled:opacity-40",
        n ? "bg-accent-wash text-accent-ink" : "text-ink-soft hover:bg-raised hover:text-ink",
        i
      ),
      ...s,
      children: [
        /* @__PURE__ */ c(z, { name: e }),
        /* @__PURE__ */ c("span", { className: "absolute top-1/2 left-1/2 size-[max(100%,3rem)] -translate-1/2 pointer-fine:hidden", "aria-hidden": "true" })
      ]
    }
  );
}
const Wg = Q.out, _g = { duration: W.settle, ease: Wg }, Gg = { duration: 0 };
function Kg({
  action: e,
  resetAfter: t = 1400
}) {
  const [n, i] = O("idle"), s = C("idle"), r = C(0), o = C(null), a = C(!0), l = C(e);
  l.current = e;
  const u = Z(() => {
    o.current && clearTimeout(o.current), o.current = null;
  }, []), d = Z(() => {
    if (s.current === "pending") return;
    u();
    const h = ++r.current;
    s.current = "pending", i("pending");
    const f = (p) => {
      !a.current || h !== r.current || (s.current = p, i(p), o.current = setTimeout(() => {
        !a.current || h !== r.current || (s.current = "idle", i("idle"));
      }, t));
    };
    Promise.resolve().then(() => l.current()).then(
      () => f("success"),
      () => f("error")
    );
  }, [u, t]);
  return F(() => (a.current = !0, () => {
    a.current = !1, u();
  }), [u]), { status: n, run: d, pending: n === "pending" };
}
function Hg({ still: e }) {
  return /* @__PURE__ */ y(
    j.svg,
    {
      width: "11",
      height: "11",
      viewBox: "0 0 12 12",
      fill: "none",
      "aria-hidden": "true",
      className: "shrink-0",
      animate: e ? void 0 : { rotate: 360 },
      transition: e ? void 0 : { duration: W.coast * 0.6, repeat: 1 / 0, ease: "linear" },
      children: [
        /* @__PURE__ */ c("circle", { cx: "6", cy: "6", r: "4.5", stroke: "currentColor", strokeWidth: "1.5", strokeOpacity: "0.22" }),
        /* @__PURE__ */ c("path", { d: "M10.5 6A4.5 4.5 0 0 0 6 1.5", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" })
      ]
    }
  );
}
function Bo({ d: e, extra: t }) {
  return /* @__PURE__ */ y(
    "svg",
    {
      width: "11",
      height: "11",
      viewBox: "0 0 12 12",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.7",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true",
      className: "shrink-0",
      children: [
        /* @__PURE__ */ c("path", { d: e }),
        t ? /* @__PURE__ */ c("path", { d: t }) : null
      ]
    }
  );
}
function qg({
  label: e,
  pendingLabel: t = e,
  successLabel: n = "Done",
  errorLabel: i = "Try again",
  onAction: s,
  resetAfter: r = 1400,
  variant: o = "outline",
  disabled: a = !1,
  className: l
}) {
  const u = te(), { status: d, run: h, pending: f } = Kg({ action: s, resetAfter: r }), p = u ? Gg : _g, m = [
    { key: "idle", text: e, color: void 0, icon: null },
    {
      key: "pending",
      text: t,
      color: "var(--color-muted)",
      icon: /* @__PURE__ */ c(Hg, { still: u === !0 || d !== "pending" })
    },
    {
      key: "success",
      text: n,
      color: "var(--color-pass)",
      icon: /* @__PURE__ */ c(Bo, { d: "M2.6 6.3 4.9 8.6 9.4 3.6" })
    },
    {
      key: "error",
      text: i,
      color: "var(--color-fail)",
      icon: /* @__PURE__ */ c(Bo, { d: "M6 2.9v3.5", extra: "M6 9.05h.01" })
    }
  ], x = m.find((v) => v.key === d) ?? m[0];
  return /* @__PURE__ */ y(G, { children: [
    /* @__PURE__ */ c(
      Me,
      {
        variant: o,
        disabled: a,
        "aria-label": x.text,
        "aria-busy": f || void 0,
        "aria-disabled": f || void 0,
        className: l,
        onClick: () => {
          f || (ze("press"), h());
        },
        children: /* @__PURE__ */ c("span", { "aria-hidden": "true", className: "relative grid place-items-center", children: m.map((v) => /* @__PURE__ */ y(
          j.span,
          {
            initial: !1,
            animate: v.key === d ? { opacity: 1, y: 0 } : { opacity: 0, y: 2 },
            transition: p,
            style: { color: v.color },
            className: "col-start-1 row-start-1 flex items-center justify-center gap-1.5 whitespace-nowrap",
            children: [
              v.icon,
              v.text
            ]
          },
          v.key
        )) })
      }
    ),
    /* @__PURE__ */ c("span", { role: "status", "aria-live": "polite", className: "sr-only", children: d === "success" ? n : d === "error" ? i : "" })
  ] });
}
function Nt(e) {
  return Math.round(e * 1e6) / 1e6;
}
function Yg({
  value: e,
  onValueChange: t,
  min: n,
  max: i,
  step: s,
  detents: r,
  pull: o
}) {
  const a = he(() => r.map((v) => typeof v == "number" ? { value: v } : v), [r]), l = o ?? (i - n) * 0.045, u = C(t);
  u.current = t;
  const d = he(() => a.findIndex((v) => Nt(v.value) === Nt(e)), [a, e]), h = C(d);
  h.current = d;
  const f = C(!1), p = Z(
    (v) => {
      let w = -1, T = l;
      for (let g = 0; g < a.length; g += 1) {
        const S = Math.abs(v - a[g].value);
        S <= T && (T = S, w = g);
      }
      return w >= 0 ? a[w].value : n + Math.round((v - n) / s) * s;
    },
    [l, a, n, s]
  ), m = Z(
    (v) => {
      const w = Number(v.target.value);
      if (!Number.isFinite(w)) return;
      const T = f.current;
      f.current = !1;
      const g = Nt(Math.min(i, Math.max(n, T ? w : p(w)))), S = a.findIndex((R) => Nt(R.value) === g);
      S >= 0 && S !== h.current && ze("tick"), g !== Nt(e) && u.current(g);
    },
    [a, i, n, p, e]
  ), x = Z((v) => {
    (v.key.startsWith("Arrow") || v.key === "PageUp" || v.key === "PageDown") && (f.current = !0);
  }, []);
  return { onChange: m, onKeyDown: x, activeDetent: d, detents: a, activeLabel: a[d]?.label };
}
function Xg({
  detents: e,
  min: t,
  max: n,
  activeDetent: i,
  className: s
}) {
  const r = n - t;
  return (
    // Inset by half the 12px thumb, because that is the width the thumb's centre actually travels.
    /* @__PURE__ */ c("div", { "aria-hidden": !0, className: L("pointer-events-none absolute inset-x-[6px] bottom-0", s), children: e.map((o, a) => /* @__PURE__ */ c(
      "span",
      {
        title: o.label,
        className: L(
          "absolute bottom-0 block h-[3px] w-px -translate-x-1/2",
          a === i ? "bg-accent" : "bg-line"
        ),
        style: { left: r > 0 ? `${(o.value - t) / r * 100}%` : "0%" }
      },
      o.value
    )) })
  );
}
function Zg(e, t) {
  let n, i;
  if (e === 0 ? (n = 0, i = t ? 8 : 1) : e < 0 ? (n = e * 2, i = e / 2) : (n = e / 2, i = e * 2), t)
    return n = Math.floor(n), i = Math.ceil(i), e >= 1 && (n = Math.max(1, n)), i - n < 4 && (i = n + 4), { lo: n, hi: i, step: 1 };
  const s = Math.min(10 ** (Math.floor(Math.log10(i - n)) - 1), 10 ** -fc(e));
  return { lo: mt(Math.floor(n / s) * s, s), hi: mt(Math.ceil(i / s) * s, s), step: s };
}
function dc(e, t) {
  const n = Zg(e.default, t);
  return {
    lo: e.min ?? n.lo,
    hi: e.max ?? n.hi,
    step: e.step ?? n.step
  };
}
function fc(e) {
  const t = String(e), n = t.indexOf(".");
  return n === -1 || t.includes("e") ? 0 : Math.min(t.length - n - 1, 4);
}
function mt(e, t) {
  const n = Math.max(0, -Math.floor(Math.log10(t)));
  return +e.toFixed(n);
}
function $i(e) {
  return e.kind === "bool" || e.kind === "int" || e.kind === "float";
}
function Qg(e, t) {
  const n = {};
  for (const i of e) {
    if (!$i(i)) continue;
    const s = t[i.name];
    s === void 0 || s === i.default || (n[i.name] = s);
  }
  return n;
}
const Jg = /wall|thickness|lip|rim|shell/;
function e0(e, t, n = 0.4, i = "default") {
  if (e.kind !== "float" || typeof e.default != "number") return [];
  const { lo: s, hi: r, step: o } = dc(e, !1), a = (d) => Number.isFinite(d) && d >= s && d <= r, l = [{ value: e.default, label: i }];
  for (const d of t ?? [])
    a(d.value_mm) && l.push({ value: d.value_mm, label: "measured" });
  if (Jg.test(e.name.toLowerCase()) && n > 0)
    for (let d = 2; d * n <= r; d += 1) {
      const h = mt(d * n, 1e-3);
      a(h) && l.push({ value: h, label: `${d} lines` });
    }
  const u = /* @__PURE__ */ new Map();
  for (const d of l) {
    const h = mt(d.value, o);
    u.has(h) || u.set(h, d);
  }
  return [...u.values()].sort((d, h) => d.value - h.value);
}
const $o = Q.out, jo = "mm", Uo = 4, t0 = 60, zo = 6;
function it(e, t, n) {
  return String(t ? Math.round(e) : mt(e, n));
}
function Ut(e) {
  return e.replace(/_/g, " ");
}
function Wo({ children: e }) {
  return /* @__PURE__ */ y("div", { className: "chrome flex items-center gap-2 px-4 pt-[11px] pb-2", children: [
    /* @__PURE__ */ c("span", { className: "mono-caption text-faint [letter-spacing:0.12em]", children: e }),
    /* @__PURE__ */ c("span", { className: "h-px flex-1 bg-line-soft" })
  ] });
}
function hc({ param: e, onReset: t }) {
  return /* @__PURE__ */ c(
    "button",
    {
      type: "button",
      title: `Default ${e.default}`,
      onClick: t,
      "aria-label": `Reset ${e.name} to default`,
      className: "size-1.5 shrink-0 rounded-full bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    }
  );
}
function n0({
  id: e,
  param: t,
  value: n,
  dirty: i,
  measurements: s,
  nozzle: r,
  restLabel: o,
  onValue: a
}) {
  const l = t.kind === "int", u = dc(t, l), d = Math.min(u.lo, n), h = Math.max(u.hi, n), f = l ? 1 : Math.min(u.step, 10 ** -fc(n)), [p, m] = O(() => it(n, l, f)), x = C(!1);
  if (!x.current) {
    const E = it(n, l, f);
    E !== p && m(E);
  }
  const v = te(), w = he(
    () => e0(t, s, r, o),
    [t, s, r, o]
  ), T = Yg({
    value: n,
    onValueChange: a,
    min: d,
    max: h,
    step: f,
    detents: w,
    pull: (h - d) * 0.045
  }), [g, S] = O(null), [R, D] = O(0);
  F(() => {
    if (!g) return;
    D(g.end === "max" ? 3 : -3);
    const E = setTimeout(() => D(0), v ? 0 : W.tick * 1e3), I = setTimeout(() => S(null), 1200);
    return () => {
      clearTimeout(E), clearTimeout(I);
    };
  }, [g, v]);
  const k = (E) => S({ end: E }), A = (E) => {
    if (l) {
      a(Math.round(Number(E.target.value)));
      return;
    }
    T.onChange(E);
  }, N = C(!1), M = C(!1), b = (E) => {
    E.button === 0 && (N.current = !0, M.current = !1);
  }, B = (E) => {
    if (!N.current) return;
    const I = E.currentTarget.getBoundingClientRect(), X = E.clientX > I.right + zo ? "max" : E.clientX < I.left - zo ? "min" : null;
    if (!X) {
      M.current = !1;
      return;
    }
    M.current || (X === "max" && n >= h ? (M.current = !0, k("max")) : X === "min" && n <= d && (M.current = !0, k("min")));
  }, $ = () => {
    N.current = !1, M.current = !1;
  }, Y = (E) => {
    const I = E.key === "ArrowRight" || E.key === "ArrowUp" || E.key === "PageUp", X = E.key === "ArrowLeft" || E.key === "ArrowDown" || E.key === "PageDown";
    I && n >= h ? k("max") : X && n <= d && k("min"), T.onKeyDown(E);
  }, H = () => {
    x.current = !1;
    const E = Number(p), I = l ? Math.round(E) : E;
    if (p.trim() === "" || !Number.isFinite(E) || I === n) {
      m(it(n, l, f));
      return;
    }
    a(I);
  }, _ = (E, I, X) => {
    const ie = l ? Math.round(E + I * X) : mt(E + I * X, X);
    return ie !== n && a(ie), ie;
  }, P = C(null), U = C(0), ee = (E) => {
    E.button === 0 && (P.current = { x: E.clientX, from: n, step: f, scrubbing: !1 });
  }, se = (E) => {
    const I = P.current;
    if (!I) return;
    const X = E.clientX - I.x;
    if (!I.scrubbing) {
      if (Math.abs(X) < Uo) return;
      I.scrubbing = !0, E.currentTarget.setPointerCapture?.(E.pointerId);
    }
    const ie = n;
    if (_(I.from, Math.round(X / Uo), I.step) === ie) return;
    const ke = Date.now();
    ke - U.current >= t0 && (U.current = ke, ze("tick"));
  }, ne = (E) => {
    const I = P.current;
    P.current = null, I?.scrubbing && E.currentTarget.hasPointerCapture?.(E.pointerId) && E.currentTarget.releasePointerCapture(E.pointerId);
  };
  return /* @__PURE__ */ y("div", { className: "flex flex-col gap-1 px-4", children: [
    /* @__PURE__ */ y("div", { className: "flex items-baseline justify-between gap-2", children: [
      /* @__PURE__ */ y("div", { className: "flex min-w-0 items-center gap-1.5", children: [
        /* @__PURE__ */ c(
          "label",
          {
            htmlFor: e,
            title: t.description,
            className: L("mono-caption min-w-0 truncate", i ? "font-medium text-ink" : "text-muted"),
            children: Ut(t.name)
          }
        ),
        i ? /* @__PURE__ */ c(hc, { param: t, onReset: () => a(t.default) }) : null
      ] }),
      /* @__PURE__ */ y("div", { className: "flex shrink-0 items-baseline gap-1.5", children: [
        T.activeLabel ? /* @__PURE__ */ c("span", { className: "mono-caption text-faint", children: T.activeLabel }) : null,
        /* @__PURE__ */ c(
          "input",
          {
            value: p,
            onChange: (E) => {
              x.current = !0, m(E.target.value);
            },
            onBlur: H,
            onPointerDown: ee,
            onPointerMove: se,
            onPointerUp: ne,
            onPointerCancel: ne,
            onKeyDown: (E) => {
              if (E.key === "Enter" && H(), E.key === "Escape") {
                const I = P.current;
                P.current = null, x.current = !1, I?.scrubbing ? a(I.from) : m(it(n, l, f));
              }
              (E.key === "ArrowUp" || E.key === "ArrowDown") && (E.preventDefault(), _(n, (E.key === "ArrowUp" ? 1 : -1) * (E.shiftKey ? 10 : 1), f));
            },
            inputMode: l ? "numeric" : "decimal",
            "aria-label": `${t.name} value`,
            className: L(
              "mono-value w-16 cursor-ew-resize rounded-control border-0 bg-transparent p-0 text-right focus:bg-raised focus:outline-1 focus:outline-accent",
              i ? "text-accent-ink" : "text-ink"
            )
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ y(
      j.div,
      {
        className: "relative",
        animate: { x: R },
        transition: { duration: v ? 0 : W.tick, ease: $o },
        children: [
          /* @__PURE__ */ c(
            "input",
            {
              id: e,
              type: "range",
              min: d,
              max: h,
              step: f,
              value: n,
              onChange: A,
              onKeyDown: Y,
              onPointerDown: b,
              onPointerMove: B,
              onPointerUp: $,
              onPointerCancel: $,
              onLostPointerCapture: $,
              "aria-label": Ut(t.name),
              "aria-valuetext": `${n}`,
              className: "param-slider w-full",
              style: { "--pct": h === d ? 0 : (n - d) / (h - d) }
            }
          ),
          /* @__PURE__ */ c(Xg, { detents: T.detents, min: d, max: h, activeDetent: T.activeDetent })
        ]
      }
    ),
    /* @__PURE__ */ c(me, { children: g ? /* @__PURE__ */ c(
      j.p,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: v ? 0 : W.settle, ease: $o },
        className: "mono-caption text-accent-ink",
        children: g.end === "max" ? `${it(h, l, f)} ${jo} · widest this will go` : `${it(d, l, f)} ${jo} · thinnest this will go`
      }
    ) : null })
  ] });
}
function i0({
  id: e,
  param: t,
  value: n,
  dirty: i,
  onValue: s
}) {
  return /* @__PURE__ */ y("div", { className: "flex items-center gap-2 px-4 py-1", children: [
    /* @__PURE__ */ c(
      "label",
      {
        htmlFor: e,
        title: t.description,
        className: L("mono-caption min-w-0 truncate", i ? "font-medium text-ink" : "text-muted"),
        children: Ut(t.name)
      }
    ),
    i ? /* @__PURE__ */ c(hc, { param: t, onReset: () => s(t.default) }) : null,
    /* @__PURE__ */ c("span", { className: "flex-1" }),
    /* @__PURE__ */ c(
      "button",
      {
        id: e,
        type: "button",
        role: "switch",
        "aria-checked": n,
        "aria-label": Ut(t.name),
        onClick: () => s(!n),
        className: L(
          "relative h-4 w-7 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
          n ? "bg-accent" : "bg-line"
        ),
        children: /* @__PURE__ */ c(
          "span",
          {
            className: L(
              "absolute top-0.5 size-3 rounded-full bg-ground transition-[left]",
              n ? "left-3.5" : "left-0.5"
            )
          }
        )
      }
    )
  ] });
}
function Fy({
  params: e,
  measurements: t,
  nozzle: n,
  values: i,
  onChange: s,
  onApply: r,
  building: o,
  applying: a,
  stats: l,
  error: u,
  note: d
}) {
  const h = he(() => e.filter($i), [e]), f = he(() => e.filter((g) => !$i(g)), [e]), p = h.filter((g) => g.kind === "bool"), m = h.filter((g) => g.kind !== "bool"), x = he(() => Qg(e, i), [e, i]), v = Object.keys(x).length, w = Te(), T = (g, S) => {
    s({ ...i, [g]: S });
  };
  return h.length === 0 ? null : /* @__PURE__ */ y("div", { className: "flex min-h-0 flex-1 flex-col", role: "group", "aria-label": "Part parameters", children: [
    u ? /* @__PURE__ */ y("div", { className: "border-b border-line-soft bg-fail-wash px-4 py-2.5", children: [
      /* @__PURE__ */ y("p", { className: "mono-label flex items-center gap-2 text-fail", children: [
        /* @__PURE__ */ c(z, { name: "warning" }),
        "Build failed at these values"
      ] }),
      /* @__PURE__ */ c("p", { className: "mt-1 text-xs leading-4 text-ink-soft", children: u }),
      /* @__PURE__ */ c("p", { className: "mt-0.5 text-xs leading-4 text-muted", children: "Showing the last part that built." })
    ] }) : null,
    /* @__PURE__ */ y("div", { className: "flex min-h-0 flex-1 flex-col overflow-y-auto pb-3", children: [
      f.length > 0 ? /* @__PURE__ */ y(G, { children: [
        /* @__PURE__ */ c(Wo, { children: "Set by the plan" }),
        /* @__PURE__ */ c("dl", { className: "flex flex-col", children: f.map((g) => /* @__PURE__ */ y("div", { className: "flex items-center gap-[9px] px-4 py-1.5", title: g.description, children: [
          /* @__PURE__ */ c("span", { className: "text-muted", children: /* @__PURE__ */ c(z, { name: "lock" }) }),
          /* @__PURE__ */ c("dt", { className: "mono-id min-w-0 flex-1 truncate uppercase text-muted [letter-spacing:0.06em]", children: Ut(g.name) }),
          /* @__PURE__ */ c("dd", { className: "mono-value text-muted", children: String(i[g.name] ?? g.default) })
        ] }, g.name)) })
      ] }) : null,
      /* @__PURE__ */ c(Wo, { children: "Yours to drag" }),
      /* @__PURE__ */ y("div", { className: "flex flex-col gap-3", children: [
        p.map((g) => /* @__PURE__ */ c(
          i0,
          {
            id: `${w}${g.name}`,
            param: g,
            value: i[g.name] ?? g.default,
            dirty: g.name in x,
            onValue: (S) => T(g.name, S)
          },
          g.name
        )),
        m.map((g) => /* @__PURE__ */ c(
          n0,
          {
            id: `${w}${g.name}`,
            param: g,
            value: i[g.name] ?? g.default,
            dirty: g.name in x,
            measurements: t,
            nozzle: n,
            onValue: (S) => T(g.name, S)
          },
          g.name
        ))
      ] })
    ] }),
    l?.size_mm ? /* @__PURE__ */ c("div", { className: "chrome shrink-0 border-t border-line-soft px-4 py-2", children: /* @__PURE__ */ y("span", { className: "mono-caption text-muted", children: [
      l.size_mm.map((g) => Math.round(g * 10) / 10).join(" × "),
      " mm",
      o ? " · rebuilding" : null
    ] }) }) : null,
    /* @__PURE__ */ c(
      "p",
      {
        role: "status",
        className: d ? "mx-4 mb-3 rounded-content bg-raised px-3 py-2 text-xs leading-4 text-ink-soft" : "sr-only",
        children: d
      }
    ),
    v > 0 ? /* @__PURE__ */ y("div", { className: "chrome mx-4 mb-3 flex flex-col gap-2 rounded-content bg-accent-wash p-2 pl-3", children: [
      /* @__PURE__ */ y("div", { className: "flex h-6 items-center gap-2", children: [
        /* @__PURE__ */ c("span", { className: "size-1.5 shrink-0 rounded-full bg-accent" }),
        /* @__PURE__ */ y("span", { className: "mono-id flex-1 whitespace-nowrap uppercase text-accent-ink tabular-nums [letter-spacing:0.08em]", children: [
          v,
          " ",
          v === 1 ? "change" : "changes"
        ] }),
        /* @__PURE__ */ c(
          "button",
          {
            type: "button",
            onClick: () => s({}),
            className: "mono-label shrink-0 rounded-control px-2 py-1 text-ink-soft transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-accent",
            children: "Reset"
          }
        )
      ] }),
      /* @__PURE__ */ c("span", { className: "flex [&>*]:w-full", title: "Make these values the part's defaults, so it opens and downloads this way.", children: /* @__PURE__ */ c(
        qg,
        {
          label: "Save as default",
          pendingLabel: "Saving",
          successLabel: "Saved",
          errorLabel: "Try again",
          resetAfter: 1400,
          variant: "ink",
          disabled: a,
          onAction: () => r(x)
        }
      ) })
    ] }) : null
  ] });
}
const pc = Wi(function({ anchor: t, width: n, align: i = "right", gap: s = 6, className: r, children: o, ...a }, l) {
  const [u, d] = O(null), h = Z(() => {
    const f = t.current?.getBoundingClientRect();
    if (!f) return;
    const p = i === "right" ? f.right - n : f.left;
    d({
      left: Math.max(8, Math.min(p, window.innerWidth - n - 8)),
      bottom: Math.max(8, window.innerHeight - f.top + s)
    });
  }, [t, n, i, s]);
  return yt(h, [h]), F(() => (window.addEventListener("resize", h), window.addEventListener("scroll", h, !0), () => {
    window.removeEventListener("resize", h), window.removeEventListener("scroll", h, !0);
  }), [h]), typeof document > "u" ? null : ia(
    /* @__PURE__ */ c(
      "div",
      {
        ref: l,
        style: { position: "fixed", left: u?.left ?? 0, bottom: u?.bottom ?? 0, width: n },
        className: r,
        ...a,
        children: o
      }
    ),
    document.body
  );
}), mc = [
  { format: "3mf", caption: "Print-ready, keeps units and orientation.", recommended: !0 },
  { format: "stl", caption: "Print-ready mesh. Works in every slicer." },
  { format: "step", caption: "Solid model, for another CAD tool." }
];
function s0(e) {
  if (e.state === "queued") return "Estimate · slicing…";
  if (e.state === "failed") return `Estimate · ${e.error ?? "unavailable"}`;
  const t = [
    e.grams ? `${Math.round(e.grams)} g` : null,
    e.seconds ? `${(e.seconds / 3600).toFixed(1)} hr` : null
  ].filter(Boolean);
  return `Estimate · ${t.length ? t.join(" · ") : "unavailable"}`;
}
const gc = "nurb.exportFormat";
function r0() {
  try {
    const e = localStorage.getItem(gc);
    if (mc.some((t) => t.format === e)) return e;
  } catch {
  }
  return "3mf";
}
function Oy({ partId: e, export: t, status: n, revision: i, runId: s, openIn: r }) {
  const [o, a] = O(r0), [l, u] = O(!1), [d, h] = O(null), [f, p] = O(null), m = C(null), x = C(null), v = C(null), w = C(null), T = C(0), g = C({ partId: e, revision: i, runId: s });
  F(() => {
    const k = g.current;
    k.partId === e && Object.is(k.revision, i) && Object.is(k.runId, s) || (g.current = { partId: e, revision: i, runId: s }, T.current += 1, h(null), p(null));
  }, [e, i, s]), F(() => {
    if (!l) return;
    const k = (N) => {
      const M = N.target;
      m.current?.contains(M) || w.current?.contains(M) || u(!1);
    }, A = (N) => {
      if (N.key === "Escape") {
        u(!1), x.current?.focus();
        return;
      }
      if (N.key !== "ArrowDown" && N.key !== "ArrowUp") return;
      const M = Array.from(v.current?.querySelectorAll('[role="menuitem"]') ?? []);
      if (M.length === 0) return;
      N.preventDefault();
      const b = N.key === "ArrowDown" ? 1 : -1, B = M.indexOf(document.activeElement), $ = B === -1 ? b === 1 ? 0 : M.length - 1 : (B + b + M.length) % M.length;
      M[$].focus();
    };
    return document.addEventListener("pointerdown", k), document.addEventListener("keydown", A), () => {
      document.removeEventListener("pointerdown", k), document.removeEventListener("keydown", A);
    };
  }, [l]);
  const S = async (k, A) => {
    const N = ++T.current;
    h(k), p(null);
    try {
      await A(), N === T.current && u(!1);
    } catch (M) {
      if (N !== T.current) return;
      p(M instanceof Error ? M.message : "The export did not finish."), u(!0);
    } finally {
      N === T.current && h(null);
    }
  }, R = (k) => S(k, () => t(k)), D = (k) => {
    a(k);
    try {
      localStorage.setItem(gc, k);
    } catch {
    }
    R(k);
  };
  return /* @__PURE__ */ y("div", { ref: m, className: "relative flex-1", children: [
    /* @__PURE__ */ y("div", { className: "flex h-9 w-full overflow-hidden rounded-control bg-accent text-white", children: [
      /* @__PURE__ */ y(
        "button",
        {
          type: "button",
          disabled: d !== null,
          onClick: () => {
            R(o);
          },
          className: "chrome btn-label inline-flex flex-1 items-center justify-center gap-2 px-3 transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white disabled:hover:bg-transparent",
          children: [
            /* @__PURE__ */ c(z, { name: "download" }),
            d ? "Preparing…" : `Download ${o.toUpperCase()}`
          ]
        }
      ),
      /* @__PURE__ */ c(
        "button",
        {
          ref: x,
          type: "button",
          "aria-haspopup": "menu",
          "aria-expanded": l,
          "aria-label": "Choose file type",
          title: "Choose file type",
          onClick: () => u((k) => !k),
          className: "inline-flex w-9 shrink-0 items-center justify-center border-l border-white/25 transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white",
          children: /* @__PURE__ */ c(z, { name: "chevron-down" })
        }
      )
    ] }),
    l ? /* @__PURE__ */ y(
      pc,
      {
        ref: w,
        anchor: x,
        width: 254,
        align: "left",
        gap: 8,
        className: "z-30 overflow-hidden rounded-content border border-panel-edge bg-ground shadow-[var(--shadow-panel)]",
        children: [
          /* @__PURE__ */ y("div", { className: "chrome flex h-[30px] items-center justify-between border-b border-line-soft px-3", children: [
            /* @__PURE__ */ c("span", { className: "mono-label text-muted", children: "File type" }),
            i != null ? /* @__PURE__ */ c("span", { className: "mono-caption text-muted", children: jt(i) }) : null
          ] }),
          f ? /* @__PURE__ */ y("div", { className: "border-b border-line-soft bg-fail-wash px-3 py-2 text-[11px] leading-4 text-ink-soft", children: [
            /* @__PURE__ */ c("p", { className: "mono-label text-fail", children: "Download failed" }),
            /* @__PURE__ */ c("p", { className: "mt-0.5", children: f })
          ] }) : null,
          /* @__PURE__ */ y(
            "div",
            {
              ref: v,
              role: "menu",
              "aria-label": "Download format",
              className: "flex flex-col py-1",
              children: [
                mc.map((k) => {
                  const A = d === k.format, N = o === k.format;
                  return /* @__PURE__ */ y(
                    "button",
                    {
                      type: "button",
                      role: "menuitem",
                      disabled: d !== null,
                      "aria-current": N || void 0,
                      onClick: () => D(k.format),
                      className: L(
                        "flex w-full flex-col gap-0.5 px-3 py-2 text-left transition-colors hover:bg-raised focus-visible:bg-raised focus-visible:outline-none disabled:opacity-60 disabled:hover:bg-transparent",
                        N && "bg-raised/60"
                      ),
                      children: [
                        /* @__PURE__ */ y("span", { className: "flex w-full items-center", children: [
                          /* @__PURE__ */ c("span", { className: "mono-value uppercase text-ink", children: k.format }),
                          N ? /* @__PURE__ */ c(z, { name: "check", className: "ml-1.5 text-accent-ink" }) : null,
                          A ? /* @__PURE__ */ y("span", { className: "mono-caption ml-auto flex items-center gap-1.5 text-muted", children: [
                            /* @__PURE__ */ c("span", { className: "size-1.5 rounded-full bg-accent" }),
                            "preparing"
                          ] }) : k.recommended ? /* @__PURE__ */ c("span", { className: "mono-caption ml-auto text-accent-ink", children: "Recommended" }) : null
                        ] }),
                        /* @__PURE__ */ c("span", { className: "text-xs leading-4 text-ink-soft", children: k.caption })
                      ]
                    },
                    k.format
                  );
                }),
                r ? /* @__PURE__ */ y(
                  "button",
                  {
                    type: "button",
                    role: "menuitem",
                    disabled: d !== null,
                    onClick: () => {
                      S("slicer", r.open);
                    },
                    className: "mt-1 flex w-full flex-col gap-0.5 border-t border-line-soft px-3 pt-2.5 pb-2 text-left transition-colors hover:bg-raised focus-visible:bg-raised focus-visible:outline-none disabled:opacity-60 disabled:hover:bg-transparent",
                    children: [
                      /* @__PURE__ */ y("span", { className: "flex w-full items-center", children: [
                        /* @__PURE__ */ y("span", { className: "mono-value uppercase text-ink", children: [
                          "Open in ",
                          r.name
                        ] }),
                        d === "slicer" ? /* @__PURE__ */ y("span", { className: "mono-caption ml-auto flex items-center gap-1.5 text-muted", children: [
                          /* @__PURE__ */ c("span", { className: "size-1.5 rounded-full bg-accent" }),
                          "preparing"
                        ] }) : null
                      ] }),
                      /* @__PURE__ */ c("span", { className: "text-xs leading-4 text-ink-soft", children: "Saves a 3MF and opens it there." })
                    ]
                  }
                ) : null
              ]
            }
          ),
          n ? /* @__PURE__ */ c("div", { className: "chrome border-t border-line-soft bg-raised px-3 py-2", children: /* @__PURE__ */ c("span", { className: "mono-caption text-muted", children: s0(n) }) }) : null
        ]
      }
    ) : null
  ] });
}
function Iy({
  printers: e,
  current: t,
  defaultName: n,
  onPick: i,
  onAdd: s,
  onManage: r,
  triggerRef: o,
  onClose: a
}) {
  const l = C(null);
  return F(() => {
    const u = (h) => {
      const f = h.target;
      l.current?.contains(f) || o.current?.contains(f) || a();
    }, d = (h) => {
      h.key === "Escape" && a();
    };
    return document.addEventListener("pointerdown", u), document.addEventListener("keydown", d), () => {
      document.removeEventListener("pointerdown", u), document.removeEventListener("keydown", d);
    };
  }, [a, o]), /* @__PURE__ */ y(
    pc,
    {
      ref: l,
      anchor: o,
      width: 254,
      align: "right",
      gap: 6,
      role: "menu",
      "aria-label": "Print on",
      className: "z-30 overflow-hidden rounded-[6px] border border-panel-edge bg-ground shadow-[var(--shadow-panel)]",
      children: [
        /* @__PURE__ */ y("div", { className: "flex h-6 items-center justify-between px-3 font-mono text-[9.5px] leading-3 font-medium tracking-[0.12em] text-faint uppercase", children: [
          /* @__PURE__ */ c("span", { children: "Print on" }),
          /* @__PURE__ */ c("span", { children: "This part" })
        ] }),
        e.map((u) => {
          const d = u.name === t;
          return /* @__PURE__ */ y(
            "button",
            {
              type: "button",
              role: "menuitemradio",
              "aria-checked": d,
              onClick: () => i(u.name),
              className: L(
                "chrome flex h-7 w-full items-center gap-2 px-3 text-left font-mono text-[10.5px] leading-4 transition-colors hover:bg-raised focus-visible:bg-raised focus-visible:outline-none",
                d ? "text-ink" : "text-ink-soft hover:text-ink"
              ),
              children: [
                /* @__PURE__ */ c("span", { className: "flex size-3 shrink-0 items-center justify-center", children: d ? /* @__PURE__ */ c(z, { name: "check" }) : null }),
                /* @__PURE__ */ c("span", { className: "min-w-0 flex-1 truncate", children: u.label }),
                u.name === n ? /* @__PURE__ */ c("span", { className: "shrink-0 rounded-[2px] border border-line px-1 font-mono text-[9px] leading-[14px] tracking-[0.08em] text-muted uppercase", children: "Default" }) : null
              ]
            },
            u.name
          );
        }),
        /* @__PURE__ */ c("div", { className: "border-t border-line-soft", role: "separator" }),
        /* @__PURE__ */ y(
          "button",
          {
            type: "button",
            role: "menuitem",
            onClick: s,
            className: "chrome flex h-7 w-full items-center gap-2 px-3 text-left font-mono text-[10.5px] leading-4 text-accent-ink transition-colors hover:bg-raised focus-visible:bg-raised focus-visible:outline-none",
            children: [
              /* @__PURE__ */ c("span", { className: "size-3 shrink-0" }),
              /* @__PURE__ */ c("span", { className: "min-w-0 flex-1 truncate", children: "+ Add a printer" })
            ]
          }
        ),
        r ? /* @__PURE__ */ y(
          "button",
          {
            type: "button",
            role: "menuitem",
            onClick: r,
            className: "chrome flex w-full items-center gap-2 border-t border-line-soft bg-raised px-3 py-2 text-left font-mono text-[9.5px] leading-3 tracking-[0.08em] text-muted uppercase transition-colors hover:text-ink focus-visible:outline-none",
            children: [
              /* @__PURE__ */ c("span", { className: "min-w-0 flex-1 truncate", children: "Manage printers in Settings" }),
              /* @__PURE__ */ c("span", { className: "shrink-0 rotate-180", children: /* @__PURE__ */ c(z, { name: "chevron-left" }) })
            ]
          }
        ) : null
      ]
    }
  );
}
function zs({
  label: e,
  trailing: t,
  inset: n = 18
}) {
  return /* @__PURE__ */ y(
    "div",
    {
      className: `chrome flex h-[30px] shrink-0 items-center justify-between border-b border-line-soft ${n === 16 ? "px-4" : "px-[18px]"}`,
      children: [
        /* @__PURE__ */ c("div", { className: "mono-label shrink-0 text-muted", children: e }),
        t ? /* @__PURE__ */ c("div", { className: "mono-caption min-w-0 text-muted tabular-nums [letter-spacing:0.1em]", children: t }) : null
      ]
    }
  );
}
const o0 = (e) => e && e.length === 3 ? e.map((t) => Math.round(t)).join(" × ") : "";
function By({
  catalogue: e,
  owned: t,
  busy: n,
  error: i,
  onAdd: s,
  onClose: r
}) {
  const [o, a] = O(""), [l, u] = O(null), d = he(() => new Set(t), [t]);
  F(() => {
    const f = (p) => {
      p.key === "Escape" && r();
    };
    return window.addEventListener("keydown", f), () => window.removeEventListener("keydown", f);
  }, [r]);
  const h = he(() => {
    const f = o.trim().toLowerCase(), p = f ? e.filter((v) => v.label.toLowerCase().includes(f)) : e, m = [], x = /* @__PURE__ */ new Map();
    for (const v of p)
      x.has(v.brand) || (x.set(v.brand, []), m.push(v.brand)), x.get(v.brand).push(v);
    return m.map((v) => ({ brand: v, rows: x.get(v) }));
  }, [e, o]);
  return /* @__PURE__ */ c(
    "div",
    {
      className: "fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-6",
      onClick: (f) => f.target === f.currentTarget && r(),
      children: /* @__PURE__ */ y(
        "div",
        {
          className: "panel flex max-h-full w-[520px] flex-col overflow-hidden",
          role: "dialog",
          "aria-modal": "true",
          "aria-label": "Add a printer",
          children: [
            /* @__PURE__ */ c(
              zs,
              {
                label: "Add a printer",
                inset: 16,
                trailing: /* @__PURE__ */ c(Us, { icon: "xmark", label: "Close", onClick: r, className: "-mr-2" })
              }
            ),
            /* @__PURE__ */ y("div", { className: "flex shrink-0 flex-col gap-3 px-5 pt-4", children: [
              /* @__PURE__ */ c("p", { className: "text-[13.5px] leading-[18px] text-ink-soft", children: "Pick the machine on your bench. Checks use its bed size; the slicer brings its own profile." }),
              /* @__PURE__ */ y("div", { className: "flex h-8 shrink-0 items-center gap-2 rounded-[3px] border border-line bg-ground px-2.5", children: [
                /* @__PURE__ */ c("span", { className: "shrink-0 text-faint", children: /* @__PURE__ */ c(z, { name: "search" }) }),
                /* @__PURE__ */ c(
                  "input",
                  {
                    name: "printer-search",
                    "aria-label": "Search printers",
                    placeholder: "SEARCH PRINTERS",
                    value: o,
                    onChange: (f) => a(f.target.value),
                    autoFocus: !0,
                    className: "min-w-0 flex-1 bg-transparent font-mono text-[10.5px] tracking-[0.08em] text-ink uppercase placeholder:text-faint focus:outline-none"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ c("div", { className: "mt-3 min-h-0 flex-1 overflow-y-auto border-t border-line-soft", children: h.length === 0 ? /* @__PURE__ */ c("p", { className: "px-5 py-4 text-[13px] leading-[18px] text-muted", children: "No printer matches that." }) : h.map((f) => /* @__PURE__ */ y("div", { className: "flex flex-col", children: [
              /* @__PURE__ */ c("div", { className: "flex h-6 items-center bg-raised px-5 font-mono text-[9.5px] leading-3 font-medium tracking-[0.12em] text-faint uppercase", children: f.brand }),
              f.rows.map((p) => {
                const m = d.has(p.name), x = l === p.name;
                return /* @__PURE__ */ y(
                  "button",
                  {
                    type: "button",
                    disabled: m,
                    "aria-pressed": x,
                    onClick: () => u(p.name),
                    className: L(
                      "chrome flex h-[30px] w-full items-center gap-2 px-5 text-left transition-colors focus-visible:outline-none",
                      m ? "cursor-default text-faint" : x ? "bg-accent-wash text-ink" : "text-ink-soft hover:bg-raised hover:text-ink"
                    ),
                    children: [
                      /* @__PURE__ */ c("span", { className: "flex size-3 shrink-0 items-center justify-center", children: x ? /* @__PURE__ */ c(z, { name: "check" }) : null }),
                      /* @__PURE__ */ c("span", { className: "min-w-0 flex-1 truncate font-mono text-[11px] leading-4", children: p.label }),
                      /* @__PURE__ */ c("span", { className: "shrink-0 font-mono text-[10px] leading-4 tracking-[0.08em] text-muted tabular-nums", children: m ? "On your bench" : o0(p.bed) })
                    ]
                  },
                  p.name
                );
              })
            ] }, f.brand)) }),
            i ? /* @__PURE__ */ c("p", { className: "shrink-0 bg-fail-wash px-5 py-2 text-[12px] leading-4 text-fail", role: "alert", children: i }) : null,
            /* @__PURE__ */ y("div", { className: "flex shrink-0 items-center gap-4 border-t border-line-soft px-5 py-4", children: [
              /* @__PURE__ */ c("p", { className: "min-w-0 flex-1 text-[12px] leading-4 text-muted", children: "Not listed? Pick the one with the closest bed size. That is all the checks use." }),
              /* @__PURE__ */ c(Me, { size: "md", className: "px-3.5", onClick: r, children: "Cancel" }),
              /* @__PURE__ */ c(
                Me,
                {
                  variant: "accent",
                  size: "md",
                  className: "px-3.5",
                  disabled: !l || n,
                  onClick: () => l && s(l),
                  children: n ? "Adding" : "Add printer"
                }
              )
            ] })
          ]
        }
      )
    }
  );
}
const a0 = "" + new URL("nurb-lockup.svg", import.meta.url).href, l0 = "" + new URL("nurb-mark-16.svg", import.meta.url).href, c0 = "" + new URL("nurb-mark-outline.svg", import.meta.url).href, u0 = "" + new URL("nurb-mark-small.svg", import.meta.url).href, d0 = "" + new URL("favicon.svg", import.meta.url).href, f0 = "" + new URL("auth-plane.svg", import.meta.url).href, h0 = "" + new URL("ghost-bracket.svg", import.meta.url).href, p0 = "" + new URL("404-squiggle.svg", import.meta.url).href, Ws = { lockup: a0, mark: l0, markOutline: c0, markSmall: u0, favicon: d0, authPlane: f0, ghostBracket: h0, squiggle: p0 }, At = 240, rn = 148;
function Ue(e, t, n) {
  return [(e - t) * 0.866, (e + t) * 0.5 - n];
}
function m0({ bbox: e, ghost: t = !1, className: n }) {
  const i = e && e.length === 3 && e.every((M) => M > 0) ? e : null, s = i ?? [1, 1, 1], r = Math.max(...s), [o, a, l] = s.map((M) => M / r), u = [
    Ue(0, 0, 0),
    Ue(o, 0, 0),
    Ue(o, a, 0),
    Ue(0, a, 0),
    Ue(0, 0, l),
    Ue(o, 0, l),
    Ue(o, a, l),
    Ue(0, a, l)
  ], d = u.map((M) => M[0]), h = u.map((M) => M[1]), f = Math.min(...d), p = Math.max(...d), m = Math.min(...h), x = Math.max(...h), v = Math.min((At - 60) / (p - f), (rn - 40) / (x - m)), w = At / 2 - (f + p) / 2 * v, T = rn / 2 - (m + x) / 2 * v, g = (M) => `${(u[M][0] * v + w).toFixed(1)},${(u[M][1] * v + T).toFixed(1)}`, S = `${g(4)} ${g(5)} ${g(6)} ${g(7)}`, R = `${g(3)} ${g(2)} ${g(6)} ${g(7)}`, D = `${g(1)} ${g(2)} ${g(6)} ${g(5)}`, k = At / 2, A = Math.max(...u.map((M) => M[1])) * v + T + 6, N = (p - f) * v / 2 + 8;
  return t || !i ? /* @__PURE__ */ c("svg", { viewBox: `0 0 ${At} ${rn}`, className: n, "aria-hidden": "true", children: /* @__PURE__ */ y("g", { fill: "none", stroke: "var(--color-panel-edge)", strokeWidth: "1.5", strokeLinejoin: "round", strokeDasharray: "5 4", children: [
    /* @__PURE__ */ c("polygon", { points: S }),
    /* @__PURE__ */ c("polygon", { points: R }),
    /* @__PURE__ */ c("polygon", { points: D })
  ] }) }) : /* @__PURE__ */ y("svg", { viewBox: `0 0 ${At} ${rn}`, className: n, "aria-hidden": "true", children: [
    /* @__PURE__ */ c("ellipse", { cx: k, cy: A, rx: N, ry: N * 0.16, fill: "var(--color-raised)" }),
    /* @__PURE__ */ y("g", { stroke: "var(--color-part-edge)", strokeWidth: "1.2", strokeLinejoin: "round", children: [
      /* @__PURE__ */ c("polygon", { points: S, fill: "var(--color-part-top)" }),
      /* @__PURE__ */ c("polygon", { points: R, fill: "var(--color-part-front)" }),
      /* @__PURE__ */ c("polygon", { points: D, fill: "var(--color-part-side)" })
    ] })
  ] });
}
const g0 = Q.out;
function y0({
  label: e,
  items: t,
  align: n = "right",
  className: i,
  menuClassName: s,
  trigger: r,
  footer: o,
  portal: a,
  disabled: l,
  triggerClassName: u,
  onOpenChange: d,
  filter: h
}) {
  const [f, p] = O(!1), [m, x] = O(""), [v, w] = O(), T = C(null), g = C(null), S = C(null), R = Te(), D = C(d);
  D.current = d, F(() => {
    D.current?.(f), f || x("");
  }, [f]);
  const k = m.trim().toLowerCase(), A = k ? t.filter((N) => typeof N.label == "string" && N.label.toLowerCase().includes(k)) : t;
  return yt(() => {
    if (!f || !a) return;
    const N = S.current?.getBoundingClientRect();
    N && w(
      n === "right" ? {
        position: "fixed",
        top: N.bottom + 4,
        right: window.innerWidth - N.right
      } : { position: "fixed", top: N.bottom + 4, left: N.left }
    );
  }, [f, a, n]), F(() => {
    if (!f) return;
    const N = (b) => {
      const B = b.target;
      !T.current?.contains(B) && !g.current?.contains(B) && p(!1);
    }, M = (b) => {
      b.key === "Escape" && (p(!1), S.current?.focus());
    };
    return document.addEventListener("pointerdown", N), document.addEventListener("keydown", M), () => {
      document.removeEventListener("pointerdown", N), document.removeEventListener("keydown", M);
    };
  }, [f]), /* @__PURE__ */ y("div", { ref: T, className: L("relative", i), children: [
    /* @__PURE__ */ c(
      "button",
      {
        ref: S,
        type: "button",
        "aria-label": e,
        title: e,
        "aria-haspopup": "menu",
        "aria-expanded": f,
        "aria-controls": R,
        disabled: l,
        onClick: (N) => {
          N.preventDefault(), N.stopPropagation(), p((M) => !M);
        },
        onKeyDown: (N) => N.stopPropagation(),
        className: L(
          "chrome inline-flex items-center justify-center rounded-[3px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent",
          u ?? (r ? "rounded-full" : "size-5"),
          !r && (f ? "bg-raised text-ink" : "text-muted hover:bg-raised hover:text-ink")
        ),
        children: r ? r(f) : /* @__PURE__ */ c(z, { name: "dots" })
      }
    ),
    vc(
      a,
      /* @__PURE__ */ c(me, { children: f ? /* @__PURE__ */ y(
        xc,
        {
          id: R,
          ref: g,
          style: a ? v : void 0,
          className: L(
            "z-30 min-w-[168px] overflow-hidden rounded-[6px] border border-panel-edge bg-ground shadow-[var(--shadow-panel)]",
            o ? "pt-1" : "py-1",
            !a && "absolute top-full mt-1",
            !a && (n === "right" ? "right-0" : "left-0"),
            s
          ),
          children: [
            h ? /* @__PURE__ */ y("div", { className: "sticky top-0 z-10 -mt-1 mb-1 flex h-8 items-center gap-2 border-b border-line-soft bg-ground px-3", children: [
              /* @__PURE__ */ c(z, { name: "search", className: "text-muted" }),
              /* @__PURE__ */ c(
                "input",
                {
                  autoFocus: !0,
                  value: m,
                  onChange: (N) => x(N.target.value),
                  onKeyDown: (N) => {
                    N.key === "Enter" && A[0] && (A[0].onSelect(), p(!1));
                  },
                  placeholder: h,
                  "aria-label": h,
                  className: "mono-id min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-faint"
                }
              )
            ] }) : null,
            h && A.length === 0 ? /* @__PURE__ */ c("div", { className: "mono-id flex h-7 items-center px-3 text-faint", children: "Nothing matches" }) : null,
            /* @__PURE__ */ c(
              yc,
              {
                items: A,
                onPick: (N) => {
                  N.onSelect(), N.keepOpen || p(!1);
                }
              }
            ),
            o ? /* @__PURE__ */ c("div", { className: "sticky bottom-0 mt-1 border-t border-line-soft bg-raised px-3 py-2 font-mono text-[9.5px] leading-3 tracking-[0.08em] text-muted uppercase", children: o }) : null
          ]
        }
      ) : null })
    )
  ] });
}
function x0() {
  const [e, t] = O(null), [n, i] = O(), s = C(null), r = Te();
  yt(() => {
    if (!e || !s.current) return;
    const { width: l, height: u } = s.current.getBoundingClientRect();
    i({
      position: "fixed",
      left: Math.max(8, Math.min(e.x, window.innerWidth - l - 8)),
      top: Math.max(8, Math.min(e.y, window.innerHeight - u - 8))
    });
  }, [e]), F(() => {
    if (!e) return;
    const l = (h) => {
      s.current?.contains(h.target) || t(null);
    }, u = (h) => h.key === "Escape" && t(null), d = () => t(null);
    return document.addEventListener("pointerdown", l, !0), document.addEventListener("keydown", u), window.addEventListener("blur", d), window.addEventListener("scroll", d, !0), () => {
      document.removeEventListener("pointerdown", l, !0), document.removeEventListener("keydown", u), window.removeEventListener("blur", d), window.removeEventListener("scroll", d, !0);
    };
  }, [e]);
  const o = (l, u) => {
    u?.length && (l.preventDefault(), l.stopPropagation(), i({ position: "fixed", left: l.clientX, top: l.clientY, visibility: "hidden" }), t({ x: l.clientX, y: l.clientY, items: u }));
  }, a = vc(
    !0,
    /* @__PURE__ */ c(me, { children: e ? /* @__PURE__ */ c(
      xc,
      {
        id: r,
        ref: s,
        style: n,
        className: "z-30 min-w-[168px] overflow-hidden rounded-[6px] border border-panel-edge bg-ground py-1 shadow-[var(--shadow-panel)]",
        children: /* @__PURE__ */ c(
          yc,
          {
            items: e.items,
            onPick: (l) => {
              l.onSelect(), l.keepOpen || t(null);
            }
          }
        )
      }
    ) : null })
  );
  return { open: o, menu: a };
}
function yc({ items: e, onPick: t }) {
  const n = e.some((i) => i.checked !== void 0);
  return /* @__PURE__ */ c(G, { children: e.map((i, s) => /* @__PURE__ */ y(zi, { children: [
    i.section && i.section !== e[s - 1]?.section ? /* @__PURE__ */ y(G, { children: [
      s > 0 ? /* @__PURE__ */ c("div", { className: "my-1 border-t border-line-soft", role: "separator" }) : null,
      /* @__PURE__ */ c("div", { className: "flex h-6 items-center px-3 font-mono text-[9.5px] leading-3 font-medium tracking-[0.12em] text-faint uppercase", children: i.section })
    ] }) : null,
    /* @__PURE__ */ y(
      "button",
      {
        type: "button",
        role: n ? "menuitemradio" : "menuitem",
        "aria-checked": n ? !!i.checked : void 0,
        disabled: i.disabled,
        title: i.title,
        onClick: (r) => {
          r.preventDefault(), r.stopPropagation(), t(i);
        },
        className: L(
          "chrome mono-id flex h-7 w-full items-center gap-2 px-3 text-left transition-colors focus-visible:bg-raised focus-visible:outline-none disabled:text-faint disabled:hover:bg-transparent",
          i.separated && "mt-1 border-t border-line-soft pt-px",
          i.tone === "danger" ? "text-fail hover:bg-fail-wash" : i.checked ? "text-ink hover:bg-raised" : "text-ink-soft hover:bg-raised hover:text-ink"
        ),
        children: [
          n ? /* @__PURE__ */ c("span", { className: "flex size-3 shrink-0 items-center justify-center", children: i.checked ? /* @__PURE__ */ c(z, { name: "check" }) : null }) : null,
          i.icon ? /* @__PURE__ */ c(z, { name: i.icon }) : null,
          /* @__PURE__ */ c("span", { className: "min-w-0 flex-1 truncate", children: i.label }),
          i.trailing ? /* @__PURE__ */ c("span", { className: "shrink-0", children: i.trailing }) : null
        ]
      }
    )
  ] }, s)) });
}
function xc({
  id: e,
  ref: t,
  style: n,
  className: i,
  children: s
}) {
  const r = bp();
  return /* @__PURE__ */ c(
    j.div,
    {
      id: e,
      ref: t,
      role: r ? "menu" : "presentation",
      "aria-hidden": r ? void 0 : !0,
      initial: { opacity: 0, y: -4 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -4 },
      transition: { duration: W.tick, ease: g0 },
      style: n,
      className: i,
      children: s
    }
  );
}
function vc(e, t) {
  return e && typeof document < "u" ? ia(t, document.body) : t;
}
const bc = Q.out, wc = 2.5, on = 20, v0 = 10;
function b0({
  onConfirm: e,
  holdMs: t = 1800,
  disabled: n = !1
}) {
  const [i, s] = O(0), [r, o] = O("idle"), a = C("idle"), l = C(!1), u = C(0), d = C(0), h = C(0), f = C(null), p = C(e);
  p.current = e;
  const m = Z((g) => {
    a.current = g, o(g);
  }, []), x = Z(() => {
    cancelAnimationFrame(h.current), h.current = 0, l.current = !1, u.current = 0, f.current = null, s(0), m("idle");
  }, [m]), v = Z(
    (g) => {
      if (n || a.current === "committed" || a.current === "holding" || (f.current = g ?? null, l.current = !0, m("holding"), ze("press"), h.current)) return;
      d.current = performance.now();
      const S = (R) => {
        const D = Math.min(64, R - d.current);
        if (d.current = R, u.current += l.current ? D : -D * wc, u.current >= t) {
          h.current = 0, u.current = t, l.current = !1, f.current = null, s(on), m("committed"), p.current();
          return;
        }
        if (u.current <= 0) {
          h.current = 0, u.current = 0, f.current = null, s(0), m("idle");
          return;
        }
        const k = Math.min(on, Math.floor(u.current / t * on));
        s((A) => A === k ? A : k), h.current = requestAnimationFrame(S);
      };
      h.current = requestAnimationFrame(S);
    },
    [n, t, m]
  ), w = Z(() => {
    a.current === "holding" && (l.current = !1, f.current = null, m("releasing"));
  }, [m]);
  return F(() => {
    const g = () => w(), S = () => {
      document.hidden && w();
    };
    return window.addEventListener("blur", g), document.addEventListener("visibilitychange", S), () => {
      window.removeEventListener("blur", g), document.removeEventListener("visibilitychange", S), cancelAnimationFrame(h.current), h.current = 0;
    };
  }, [w]), { bind: {
    onPointerDown: (g) => {
      g.pointerType === "mouse" && g.button !== 0 || (g.currentTarget.setPointerCapture?.(g.pointerId), v({ x: g.clientX, y: g.clientY }));
    },
    onPointerMove: (g) => {
      const S = f.current;
      a.current !== "holding" || !S || Math.hypot(g.clientX - S.x, g.clientY - S.y) > v0 && w();
    },
    onPointerUp: w,
    onPointerCancel: w,
    onPointerLeave: w,
    onKeyDown: (g) => {
      if (g.key === "Escape") {
        (a.current === "holding" || a.current === "releasing") && (g.preventDefault(), x());
        return;
      }
      g.repeat || (g.key === " " || g.key === "Enter") && (g.preventDefault(), v());
    },
    onKeyUp: (g) => {
      (g.key === " " || g.key === "Enter") && w();
    },
    onBlur: w,
    onClick: (g) => g.preventDefault(),
    onContextMenu: (g) => g.preventDefault()
  }, phase: r, progress: i / on, reset: x };
}
function w0({
  label: e,
  confirmLabel: t = "Confirmed",
  holdMs: n = 1800,
  onConfirm: i,
  variant: s = "danger",
  disabled: r = !1,
  className: o
}) {
  const { bind: a, phase: l, reset: u } = b0({ onConfirm: i, holdMs: n, disabled: r }), d = te(), h = Te(), f = l === "committed", p = Math.round(n / 100) / 10, m = Yl(0), x = Dm(m, (v) => `inset(0 ${(1 - v) * 100}% 0 0)`);
  return F(() => {
    if (!f) return;
    const v = setTimeout(u, 1600);
    return () => clearTimeout(v);
  }, [f, u]), F(() => {
    if (d) {
      m.set(l === "holding" || l === "committed" ? 1 : 0);
      return;
    }
    if (l === "committed") {
      const T = ai(m, 1, { duration: W.tick, ease: "linear" });
      return () => T.stop();
    }
    const v = m.get();
    if (l === "holding") {
      const T = ai(m, 1, { duration: n * (1 - v) / 1e3, ease: "linear" });
      return () => T.stop();
    }
    const w = ai(m, 0, { duration: n * v / wc / 1e3, ease: bc });
    return () => w.stop();
  }, [l, n, d, m]), /* @__PURE__ */ y(
    Me,
    {
      variant: s,
      "aria-label": e,
      "aria-disabled": r || f,
      "aria-describedby": h,
      className: `relative isolate select-none overflow-hidden ${o ?? ""}`,
      ...a,
      children: [
        /* @__PURE__ */ c(_o, { committed: f, label: e, confirmLabel: t }),
        /* @__PURE__ */ c(
          j.span,
          {
            "aria-hidden": "true",
            style: { clipPath: x },
            className: "absolute inset-0 grid place-items-center bg-ink text-ground",
            children: /* @__PURE__ */ c(_o, { committed: f, label: e, confirmLabel: t })
          }
        ),
        /* @__PURE__ */ y("span", { id: h, className: "sr-only", children: [
          "Press and hold for ",
          p,
          " seconds to confirm. Let go early and nothing happens."
        ] }),
        /* @__PURE__ */ c("span", { role: "status", "aria-live": "polite", className: "sr-only", children: f ? t : "" })
      ]
    }
  );
}
function _o({ committed: e, label: t, confirmLabel: n }) {
  const i = { duration: W.settle, ease: bc };
  return /* @__PURE__ */ y("span", { "aria-hidden": "true", className: "col-start-1 row-start-1 grid", children: [
    /* @__PURE__ */ c(
      j.span,
      {
        initial: !1,
        animate: { opacity: e ? 0 : 1 },
        transition: i,
        className: "col-start-1 row-start-1 flex items-center justify-center whitespace-nowrap",
        children: t
      }
    ),
    /* @__PURE__ */ y(
      j.span,
      {
        initial: !1,
        animate: { opacity: e ? 1 : 0 },
        transition: i,
        className: "col-start-1 row-start-1 flex items-center justify-center gap-1.5 whitespace-nowrap",
        children: [
          /* @__PURE__ */ c(
            "svg",
            {
              width: "11",
              height: "11",
              viewBox: "0 0 12 12",
              fill: "none",
              stroke: "currentColor",
              strokeWidth: "1.7",
              strokeLinecap: "round",
              strokeLinejoin: "round",
              "aria-hidden": "true",
              children: /* @__PURE__ */ c("path", { d: "M2.5 6.4 4.7 8.6 9.5 3.5" })
            }
          ),
          n
        ]
      }
    )
  ] });
}
const k0 = Q.out;
function $y({
  title: e,
  children: t,
  confirmLabel: n = "Delete",
  hold: i = !1,
  onConfirm: s,
  onCancel: r
}) {
  const o = C(null), a = C(null);
  return F(() => {
    o.current?.showModal(), a.current?.focus();
  }, []), /* @__PURE__ */ y(
    j.dialog,
    {
      ref: o,
      "aria-labelledby": "confirm-title",
      initial: { opacity: 0, scale: 0.98 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: W.settle, ease: k0 },
      onCancel: (l) => {
        l.preventDefault(), r();
      },
      onClick: (l) => {
        l.target === l.currentTarget && r();
      },
      className: "panel m-auto w-[320px] max-w-[calc(100vw-32px)] p-0 text-ink backdrop:bg-ink/30 backdrop:transition-colors backdrop:duration-[240ms] starting:backdrop:bg-ink/0",
      children: [
        /* @__PURE__ */ y("div", { className: "flex flex-col gap-1.5 px-4 pt-4 pb-3.5", children: [
          /* @__PURE__ */ c("h2", { id: "confirm-title", className: "font-display text-[16px] leading-5 font-bold tracking-[-0.02em] text-ink", children: e }),
          /* @__PURE__ */ c("p", { className: "text-xs leading-4 text-muted", children: t })
        ] }),
        /* @__PURE__ */ y("div", { className: "flex justify-end gap-1.5 border-t border-line-soft px-4 py-3", children: [
          /* @__PURE__ */ c(Me, { ref: a, variant: "outline", onClick: r, children: "Cancel" }),
          i ? /* @__PURE__ */ c(w0, { label: n, confirmLabel: "Done", holdMs: 1200, onConfirm: s }) : /* @__PURE__ */ c(Me, { variant: "danger", onClick: s, children: n })
        ] })
      ]
    }
  );
}
function jy({
  size: e = "header",
  onNavigate: t
}) {
  const n = e === "panel" ? "h-6 w-[87px]" : "h-[18px] w-[65px]", i = /* @__PURE__ */ c("img", { src: Ws.lockup, alt: "nurb", className: `${n} shrink-0` });
  return t ? /* @__PURE__ */ c(
    "button",
    {
      type: "button",
      onClick: t,
      className: "inline-flex rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent",
      children: i
    }
  ) : /* @__PURE__ */ c("div", { className: "inline-flex", children: i });
}
const T0 = Q.out, S0 = { duration: 0 }, N0 = typeof window > "u" ? F : yt;
function A0({
  src: e,
  onReady: t,
  onError: n
}) {
  const i = C(null), [s, r] = O({ status: "loading", instant: !1 }), o = C(t);
  o.current = t;
  const a = C(n);
  return a.current = n, N0(() => {
    const l = i.current, u = (m, x) => r((v) => v.status === m && v.instant === x ? v : { status: m, instant: x });
    if (!l || !e) {
      u("loading", !1);
      return;
    }
    let d = !0;
    const h = l.complete && l.naturalWidth > 0, f = () => {
      d && (u("ready", h), o.current?.());
    }, p = () => {
      d && (u("error", h), a.current?.());
    };
    return l.complete ? (h ? f() : p(), () => {
      d = !1;
    }) : (u("loading", !1), l.addEventListener("load", f), l.addEventListener("error", p), () => {
      d = !1, l.removeEventListener("load", f), l.removeEventListener("error", p);
    });
  }, [e]), { ref: i, status: s.status, instant: s.instant, loaded: s.status === "ready" };
}
function P0({
  src: e,
  alt: t,
  width: n,
  height: i,
  placeholder: s = "var(--color-accent-wash)",
  blur: r = 14,
  sizes: o,
  loading: a = "lazy",
  onReady: l,
  onError: u,
  className: d
}) {
  const h = te() === !0, { ref: f, status: p, instant: m } = A0({ src: e, onReady: l, onError: u }), x = p === "ready", v = h || m, w = v ? S0 : { duration: W.arrive, ease: T0 };
  return /* @__PURE__ */ y(
    "div",
    {
      "aria-busy": p === "loading",
      "data-status": p,
      style: { aspectRatio: `${n} / ${i}`, backgroundColor: s },
      className: L("relative w-full overflow-hidden rounded-[6px]", d),
      children: [
        /* @__PURE__ */ c(
          j.img,
          {
            ref: f,
            src: e,
            sizes: o,
            alt: t,
            width: n,
            height: i,
            loading: a,
            decoding: "async",
            draggable: !1,
            className: "absolute inset-0 size-full object-cover",
            initial: !1,
            animate: v ? { opacity: x ? 1 : 0 } : x ? { opacity: 1, filter: "blur(0px)", scale: 1 } : { opacity: 0, filter: `blur(${r}px)`, scale: 1.06 },
            transition: w
          }
        ),
        p === "error" ? /* @__PURE__ */ c("div", { "aria-hidden": "true", className: "absolute inset-0 grid place-items-center bg-raised text-faint", children: /* @__PURE__ */ c(z, { name: "image" }) }) : null
      ]
    }
  );
}
const Go = 3e4;
function M0(e, t) {
  const n = t ? Date.parse(t) : NaN, [i, s] = O(() => Date.now());
  return F(() => {
    if (!e || Number.isNaN(n)) return;
    const r = n + Go - Date.now();
    if (r <= 0) return;
    const o = setTimeout(() => s(Date.now()), r);
    return () => clearTimeout(o);
  }, [e, n]), e ? Number.isNaN(n) ? !0 : i - n < Go : !1;
}
function Uy({
  part: e,
  onOpen: t,
  menu: n,
  renaming: i,
  onRename: s
}) {
  const r = qm(e.bbox), o = Hm(e.builtAt), a = e.status === "failed", l = e.status === "building", u = M0(l, e.buildingSince), d = x0();
  return /* @__PURE__ */ y(
    "div",
    {
      onContextMenu: (h) => d.open(h, i ? void 0 : n),
      className: "group relative flex flex-col rounded-[6px] border border-panel-edge bg-ground transition-shadow focus-within:shadow-[var(--shadow-panel)] hover:shadow-[var(--shadow-panel)]",
      children: [
        d.menu,
        /* @__PURE__ */ c(
          "button",
          {
            type: "button",
            onClick: t,
            "aria-label": `Open ${e.name}`,
            className: "absolute inset-0 z-10 rounded-[6px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          }
        ),
        /* @__PURE__ */ c("div", { className: "relative h-[148px] overflow-hidden rounded-t-[6px] border-b border-line-soft bg-ground", children: e.thumbnailUrl ? (
          // The card owns the box, so the frame fills it instead of its own ratio,
          // and the whole part stays in frame rather than being cropped to it.
          /* @__PURE__ */ c(
            P0,
            {
              src: e.thumbnailUrl,
              alt: "",
              width: 4,
              height: 3,
              placeholder: "transparent",
              className: "h-full rounded-none! [&_img]:object-contain [&_img]:p-2"
            }
          )
        ) : /* @__PURE__ */ c(m0, { bbox: e.bbox, ghost: !e.bbox, className: "size-full" }) }),
        n && n.length > 0 ? /* @__PURE__ */ c("div", { className: "absolute top-2 right-2 z-20 flex items-center gap-1 transition-opacity lg:opacity-0 lg:group-focus-within:opacity-100 lg:group-hover:opacity-100 lg:has-[[aria-expanded=true]]:opacity-100", children: /* @__PURE__ */ c(
          y0,
          {
            label: `More for ${e.name}`,
            className: "[&>button]:size-7 [&>button]:rounded-[4px] [&>button]:border [&>button]:border-panel-edge [&>button]:bg-ground [&>button]:shadow-[var(--shadow-control)]",
            items: n
          }
        ) }) : null,
        /* @__PURE__ */ y("div", { className: "flex flex-col gap-1.5 px-[13px] py-[11px]", children: [
          /* @__PURE__ */ y("div", { className: "flex items-center gap-2", children: [
            i ? /* @__PURE__ */ c(C0, { name: e.name, onDone: (h) => s?.(h) }) : /* @__PURE__ */ c("h2", { className: "min-w-0 flex-1 truncate text-[13.5px] leading-[18px] font-semibold tracking-[-0.01em] text-ink", children: e.name }),
            a ? /* @__PURE__ */ c("span", { className: "text-warn", children: /* @__PURE__ */ c(z, { name: "warning" }) }) : l ? /* @__PURE__ */ c(
              "span",
              {
                "data-build": u ? "running" : "stalled",
                className: `size-1.5 rounded-full bg-accent${u ? " motion-safe:animate-pulse" : ""}`
              }
            ) : e.status === "built" ? /* @__PURE__ */ c("span", { className: "text-pass", children: /* @__PURE__ */ c(z, { name: "check" }) }) : null
          ] }),
          /* @__PURE__ */ y("p", { className: "mono-caption truncate text-muted normal-case [letter-spacing:0.08em]", children: [
            e.identifier ?? "",
            e.identifier && r ? " · " : "",
            r ? `${r} mm` : ""
          ] })
        ] }),
        /* @__PURE__ */ y("div", { className: "mono-caption flex items-center justify-between border-t border-line-soft px-[13px] py-2 text-muted [letter-spacing:0.08em]", children: [
          /* @__PURE__ */ c("span", { children: o ? `Built ${o}` : "Not built yet" }),
          /* @__PURE__ */ c("span", { className: a ? "text-warn" : void 0, children: a ? "Failed" : e.folder ?? jt(e.revision) })
        ] })
      ]
    }
  );
}
function C0({ name: e, onDone: t }) {
  const [n, i] = O(e), s = C(!1), r = (o) => {
    s.current || (s.current = !0, t(o && o.trim() && o.trim() !== e ? o.trim() : null));
  };
  return /* @__PURE__ */ c(
    "input",
    {
      autoFocus: !0,
      "aria-label": `Rename ${e}`,
      value: n,
      onFocus: (o) => o.currentTarget.select(),
      onChange: (o) => i(o.target.value),
      onBlur: () => r(n),
      onKeyDown: (o) => {
        o.key === "Enter" ? r(n) : o.key === "Escape" && r(null);
      },
      className: "relative z-20 h-[22px] min-w-0 flex-1 rounded-[2px] border border-accent bg-ground px-1 text-[13.5px] leading-[18px] font-semibold tracking-[-0.01em] text-ink focus:outline-none"
    }
  );
}
function zy({
  caption: e = "Describe a part and it builds here, live.",
  firstRun: t = !1,
  primary: n,
  secondary: i
}) {
  return /* @__PURE__ */ y("div", { className: "flex flex-1 flex-col items-center justify-center gap-7 pb-16", children: [
    /* @__PURE__ */ c("img", { src: Ws.ghostBracket, alt: "", "aria-hidden": "true", className: "h-[300px] w-auto select-none" }),
    /* @__PURE__ */ y("div", { className: "flex flex-col items-center gap-2", children: [
      /* @__PURE__ */ c("h2", { className: "font-display text-[20px] leading-[26px] tracking-[-0.022em] text-balance text-ink", children: "Empty shelf. What’s rattling around your bench?" }),
      /* @__PURE__ */ c("p", { className: "mono-caption text-on-stage-muted [letter-spacing:0.11em]", children: e }),
      t ? /* @__PURE__ */ c("p", { className: "mt-1 max-w-[42ch] text-center text-[13px] leading-5 text-balance text-on-stage-muted", children: "Nothing on the plate yet. Your first part goes here, and the first layer is the one that matters." }) : null
    ] }),
    n || i ? /* @__PURE__ */ y("div", { className: "flex flex-col items-center gap-3", children: [
      n ? /* @__PURE__ */ c(Me, { variant: "accent", size: "lg", icon: n.icon, onClick: n.onClick, children: n.label }) : null,
      i ? /* @__PURE__ */ c(Me, { variant: "outline", size: "md", icon: i.icon, onClick: i.onClick, disabled: i.disabled, children: i.label }) : null
    ] }) : null
  ] });
}
function Wy({
  title: e = "No part yet",
  caption: t = "It appears here, live, as soon as the plan is set."
}) {
  return /* @__PURE__ */ y("div", { className: "relative flex min-h-[320px] flex-1 flex-col items-center justify-center gap-5 text-center", children: [
    /* @__PURE__ */ c("img", { src: Ws.markOutline, alt: "", "aria-hidden": "true", className: "size-14 select-none" }),
    /* @__PURE__ */ y("div", { className: "flex flex-col items-center gap-2", children: [
      /* @__PURE__ */ c("p", { className: "mono-label text-on-stage-muted", children: e }),
      /* @__PURE__ */ c("p", { className: "max-w-[34ch] text-[15px] leading-[22px] text-balance text-ink-soft", children: t })
    ] })
  ] });
}
function _y({ header: e, children: t, className: n, style: i, topInset: s, dragRegion: r }) {
  return /* @__PURE__ */ y(
    "div",
    {
      className: L("isolate flex h-dvh flex-col gap-4 bg-stage p-4 antialiased", n),
      style: s == null ? i : { ...i, paddingTop: s },
      ...r ? { "data-tauri-drag-region": !0 } : {},
      children: [
        e,
        /* @__PURE__ */ c("div", { className: "flex min-h-0 flex-1 gap-4", children: t })
      ]
    }
  );
}
function E0({
  children: e,
  className: t,
  onContextMenu: n
}) {
  return /* @__PURE__ */ c(
    "div",
    {
      onContextMenu: n,
      className: L("relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden", t),
      children: e
    }
  );
}
function Gy({ children: e, className: t }) {
  return /* @__PURE__ */ c(E0, { className: L("items-center justify-center", t), children: e });
}
function Ky({ start: e, cells: t, end: n, children: i, dragRegion: s }) {
  return /* @__PURE__ */ y(
    "header",
    {
      className: "panel chrome flex h-[52px] shrink-0 items-center overflow-hidden",
      ...s ? { "data-tauri-drag-region": !0 } : {},
      children: [
        e,
        t,
        i,
        n ? /* @__PURE__ */ y(G, { children: [
          /* @__PURE__ */ c("div", { className: "flex-1" }),
          n
        ] }) : null
      ]
    }
  );
}
function Hy() {
  return /* @__PURE__ */ c("div", { className: "h-full w-px bg-line" });
}
function kc({ children: e, className: t }) {
  return /* @__PURE__ */ c("div", { className: L("flex h-full items-center px-4", t), children: e });
}
function qy({ label: e, value: t, className: n }) {
  return /* @__PURE__ */ c(kc, { className: n, children: /* @__PURE__ */ y("div", { className: "flex flex-col gap-[3px]", children: [
    /* @__PURE__ */ c("span", { className: "mono-label text-[9px] leading-[10px] text-faint", children: e }),
    /* @__PURE__ */ c("span", { className: "mono-value text-ink", children: t })
  ] }) });
}
const D0 = {
  pass: "bg-pass",
  warn: "bg-warn",
  fail: "bg-fail",
  none: "bg-line",
  building: "bg-accent motion-safe:animate-pulse"
}, V0 = {
  pass: "border-line bg-pass-wash",
  warn: "border-line bg-warn-wash",
  fail: "border-line bg-fail-wash",
  none: "border-transparent bg-transparent",
  building: "border-line bg-accent-wash"
}, Ko = "transition-colors duration-(--duration-settle) ease-out-strong";
function Yy({
  tone: e,
  label: t,
  detail: n,
  className: i
}) {
  return /* @__PURE__ */ c(kc, { className: i, children: /* @__PURE__ */ y("span", { className: L("flex h-7 items-center gap-2 rounded-[3px] border px-2.5 whitespace-nowrap", Ko, V0[e]), children: [
    /* @__PURE__ */ c("span", { className: L("size-1.5 shrink-0 rounded-full", Ko, D0[e]) }),
    /* @__PURE__ */ c("span", { className: "mono-label text-ink", children: t }),
    n ? /* @__PURE__ */ c("span", { className: "mono-caption text-muted", children: n }) : null
  ] }) });
}
function Xy({ children: e, className: t }) {
  return /* @__PURE__ */ c("div", { className: L("flex h-full items-center gap-1 px-3", t), children: e });
}
function Zy({ strip: e, picker: t, children: n, composer: i, hidden: s, dragRegion: r }) {
  return /* @__PURE__ */ y("section", { className: "panel flex w-[372px] shrink-0 flex-col overflow-hidden", hidden: s, children: [
    /* @__PURE__ */ c("div", { ...r ? { "data-tauri-drag-region": !0 } : {}, children: /* @__PURE__ */ c(
      zs,
      {
        label: e.label,
        inset: 16,
        trailing: t || e.trailing ? /* @__PURE__ */ y("span", { className: "flex items-center gap-2", children: [
          e.trailing,
          t
        ] }) : void 0
      }
    ) }),
    /* @__PURE__ */ c("div", { className: "min-h-0 flex-1 overflow-y-auto", children: n }),
    /* @__PURE__ */ c("div", { className: "shrink-0 p-4 pt-0", children: i })
  ] });
}
function R0(e) {
  const t = Math.max(0, Math.round(e / 60));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
}
function li({ value: e, unit: t }) {
  return /* @__PURE__ */ y("span", { className: "flex items-baseline gap-1", children: [
    /* @__PURE__ */ c("span", { className: "mono-value text-ink", children: e }),
    /* @__PURE__ */ c("span", { className: "mono-caption text-muted", children: t })
  ] });
}
function L0({ children: e }) {
  return /* @__PURE__ */ y("div", { className: "chrome flex items-center gap-2 px-4 pt-[11px] pb-2", children: [
    /* @__PURE__ */ c("span", { className: "mono-caption text-faint [letter-spacing:0.12em]", children: e }),
    /* @__PURE__ */ c("span", { className: "h-px flex-1 bg-line-soft" })
  ] });
}
function Qy({
  count: e,
  pinned: t,
  params: n,
  readouts: i,
  warnCount: s = 0,
  failCount: r = 0,
  disclosures: o,
  actions: a
}) {
  const l = r > 0 ? r : s;
  return /* @__PURE__ */ y("aside", { className: "panel flex w-[288px] shrink-0 flex-col overflow-hidden", children: [
    /* @__PURE__ */ c(zs, { label: "Parameters", inset: 16, trailing: e }),
    /* @__PURE__ */ y("div", { className: "flex min-h-0 flex-1 flex-col overflow-y-auto", children: [
      t && t.length > 0 ? /* @__PURE__ */ y(G, { children: [
        /* @__PURE__ */ c(L0, { children: "Set by the plan" }),
        /* @__PURE__ */ c("ul", { className: "flex flex-col gap-1.5 px-4 pb-1", children: t.map((u) => /* @__PURE__ */ y("li", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ c("span", { className: "shrink-0 text-faint", children: /* @__PURE__ */ c(z, { name: "lock" }) }),
          /* @__PURE__ */ c("span", { className: "mono-label truncate text-muted", children: Cn(u.name) }),
          /* @__PURE__ */ c("span", { className: "flex-1" }),
          /* @__PURE__ */ c("span", { className: "mono-value text-right text-ink", children: u.value })
        ] }, u.name)) })
      ] }) : null,
      n
    ] }),
    /* @__PURE__ */ y("div", { className: "min-h-0 overflow-y-auto border-t border-line bg-ground", children: [
      i ? /* @__PURE__ */ y("div", { className: "chrome flex items-center justify-between px-4 py-2.5", children: [
        /* @__PURE__ */ c(li, { value: i.grams == null ? "-" : String(Math.round(i.grams)), unit: "g" }),
        /* @__PURE__ */ c(li, { value: i.seconds == null ? "-" : R0(i.seconds), unit: "hr" }),
        /* @__PURE__ */ c(li, { value: i.heightMm == null ? "-" : String(Math.round(i.heightMm)), unit: "mm" })
      ] }) : null,
      /* @__PURE__ */ c("div", { className: "h-px bg-line-soft" }),
      l > 0 && !o ? /* @__PURE__ */ y("div", { className: "flex items-center gap-2 px-4 py-2", children: [
        /* @__PURE__ */ c("span", { className: r > 0 ? "text-fail" : "text-warn", children: /* @__PURE__ */ c(z, { name: r > 0 ? "xmark" : "warning" }) }),
        /* @__PURE__ */ y("span", { className: "mono-label text-ink", children: [
          l,
          " ",
          r > 0 ? l === 1 ? "fail" : "fails" : l === 1 ? "warn" : "warns"
        ] })
      ] }) : null,
      o,
      /* @__PURE__ */ c("div", { className: "flex gap-2 p-4", children: a })
    ] })
  ] });
}
const F0 = {
  warn: "warning",
  fail: "xmark",
  pass: "check",
  none: null
}, O0 = {
  warn: "text-warn",
  fail: "text-fail",
  pass: "text-pass",
  none: "text-muted"
};
function Jy({ label: e, summary: t, tone: n = "none", open: i, onToggle: s, children: r }) {
  const o = F0[n];
  return /* @__PURE__ */ y("div", { className: "flex flex-col", children: [
    /* @__PURE__ */ y(
      "button",
      {
        type: "button",
        onClick: s,
        "aria-expanded": i,
        className: "chrome flex h-8 w-full items-center gap-2 px-4 text-left hover:bg-raised focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent",
        children: [
          o ? /* @__PURE__ */ c("span", { className: L("shrink-0", O0[n]), children: /* @__PURE__ */ c(z, { name: o }) }) : null,
          /* @__PURE__ */ c("span", { className: "mono-label text-ink", children: e }),
          /* @__PURE__ */ c("span", { className: "flex-1" }),
          t ? /* @__PURE__ */ c("span", { className: "mono-caption text-muted", children: t }) : null,
          /* @__PURE__ */ c("span", { className: L("shrink-0 text-muted transition-transform", i && "rotate-180"), children: /* @__PURE__ */ c(z, { name: "chevron-down" }) })
        ]
      }
    ),
    /* @__PURE__ */ c("div", { hidden: !i, className: "max-h-48 overflow-y-auto border-t border-line-soft", children: r })
  ] });
}
const Ho = Q.out;
function Tc(e, t = 900) {
  const [n, i] = O({ direction: null, from: e, changeId: 0, flashing: !1 }), s = C(e), r = C(null);
  return F(() => {
    const o = s.current;
    Object.is(o, e) || (s.current = e, e - o !== 0 && (i((a) => ({
      direction: e > o ? "up" : "down",
      from: o,
      changeId: a.changeId + 1,
      flashing: !0
    })), r.current && clearTimeout(r.current), r.current = setTimeout(() => {
      r.current = null, i((a) => a.flashing ? { ...a, flashing: !1 } : a);
    }, t)));
  }, [e, t]), F(() => () => r.current ? clearTimeout(r.current) : void 0, []), n;
}
function ex({ value: e, format: t, label: n, hold: i = 900, className: s }) {
  const { direction: r, flashing: o, changeId: a } = Tc(e, i), l = te(), u = t ? t(e) : String(e), [d, h] = O(u);
  F(() => {
    const m = setTimeout(() => h(u), 700);
    return () => clearTimeout(m);
  }, [u]);
  const f = { duration: l ? 0 : W.settle, ease: Ho }, p = { duration: l ? 0 : W.tick * 2, ease: Ho };
  return /* @__PURE__ */ y(
    "span",
    {
      "data-direction": o ? r : void 0,
      className: L(
        "mono-value relative inline-grid grid-flow-col items-center gap-1 rounded-[3px] px-1 py-px transition-colors",
        o ? r === "up" ? "text-pass" : "text-fail" : "text-ink",
        s
      ),
      children: [
        r ? /* @__PURE__ */ c(
          j.span,
          {
            "aria-hidden": !0,
            initial: { opacity: 0 },
            animate: { opacity: o ? 1 : 0 },
            transition: f,
            className: L(
              "pointer-events-none absolute inset-0 rounded-[3px]",
              r === "up" ? "bg-pass-wash" : "bg-fail-wash"
            )
          }
        ) : null,
        /* @__PURE__ */ c("span", { "aria-hidden": !0, className: "relative inline-grid overflow-hidden", children: /* @__PURE__ */ c(me, { initial: !1, mode: "popLayout", children: /* @__PURE__ */ c(
          j.span,
          {
            initial: l ? { opacity: 0 } : { opacity: 0, y: r === "down" ? "-0.85em" : "0.85em" },
            animate: { opacity: 1, y: "0em" },
            exit: { opacity: 0, y: r === "down" ? "0.7em" : "-0.7em", transition: p },
            transition: p,
            className: "col-start-1 row-start-1",
            children: u
          },
          a
        ) }) }),
        /* @__PURE__ */ c("span", { "aria-hidden": !0, className: "relative grid size-[1em] place-items-center", children: /* @__PURE__ */ c(me, { initial: !1, children: o && r ? /* @__PURE__ */ c(
          j.svg,
          {
            viewBox: "0 0 256 256",
            fill: "currentColor",
            initial: l ? { opacity: 0 } : { opacity: 0, scale: 0.4 },
            animate: { opacity: 1, scale: 1 },
            exit: { opacity: 0, transition: f },
            transition: f,
            className: "col-start-1 row-start-1 block size-[0.68em]",
            children: r === "up" ? /* @__PURE__ */ c("path", { d: "M128 68 L210 180 H46 Z" }) : /* @__PURE__ */ c("path", { d: "M128 188 L46 76 H210 Z" })
          },
          `${a}-${r}`
        ) : null }) }),
        /* @__PURE__ */ c("span", { className: "sr-only", "aria-live": "polite", children: n ? `${n}: ${d}` : d })
      ]
    }
  );
}
const I0 = Q.out;
function tx({ findings: e, verdict: t, highlight: n, onHighlight: i }) {
  const s = te(), r = e.length, { direction: o, flashing: a } = Tc(r), l = a && !s, u = o === "up", d = r > 0 ? `${r} ${r === 1 ? "finding" : "findings"} to fix.` : t === "none" ? "Nothing checked yet" : t === "fail" ? "The build stopped before the checks ran" : "Nothing to fix. Checks pass at these numbers.", h = /* @__PURE__ */ c(
    "p",
    {
      "aria-live": "polite",
      className: L(
        "mono-caption py-1 text-center transition-colors duration-(--duration-settle) ease-out-strong",
        l ? u ? "bg-fail-wash text-fail" : "bg-pass-wash text-pass" : "text-muted"
      ),
      children: d
    }
  );
  return r === 0 ? h : /* @__PURE__ */ y(G, { children: [
    h,
    /* @__PURE__ */ c("ul", { className: "flex flex-col", children: e.map((f, p) => (
      // Keyed by what the finding says, not by where it sits, so a rebuild that
      // changes nothing leaves the rows alone instead of replaying the entrance.
      /* @__PURE__ */ c(
        j.li,
        {
          initial: { opacity: 0, y: 4 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: s ? 0 : W.settle, ease: I0, delay: s ? 0 : p * 0.06 },
          children: /* @__PURE__ */ y(
            "button",
            {
              type: "button",
              "aria-pressed": n === p,
              onMouseEnter: () => i?.(p),
              onClick: () => i?.(n === p ? null : p),
              className: L(
                "flex w-full items-start gap-2 px-4 py-2 text-left hover:bg-raised focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent",
                n === p && "bg-raised"
              ),
              children: [
                /* @__PURE__ */ c("span", { className: L("mt-0.5 shrink-0", f.severity === "fail" ? "text-fail" : "text-warn"), children: /* @__PURE__ */ c(z, { name: f.severity === "fail" ? "xmark" : "warning" }) }),
                /* @__PURE__ */ y("span", { className: "flex min-w-0 flex-col gap-1", children: [
                  /* @__PURE__ */ c("span", { className: "mono-label text-ink", children: f.label || f.rule }),
                  /* @__PURE__ */ c("span", { className: "text-chat text-ink-soft", children: f.message })
                ] })
              ]
            }
          )
        },
        `${f.rule}:${f.message}`
      )
    )) })
  ] });
}
const B0 = Q.out;
function nx({
  open: e = !0,
  revision: t,
  shownRevision: n,
  error: i
}) {
  const s = te();
  return /* @__PURE__ */ c(me, { children: e ? /* @__PURE__ */ y(
    j.div,
    {
      initial: { opacity: 0, y: -8 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -8 },
      transition: { duration: s ? 0 : W.settle, ease: B0 },
      className: "flex items-start gap-2 bg-fail-wash px-4 py-2.5",
      children: [
        /* @__PURE__ */ c("span", { className: "mt-0.5 shrink-0 text-fail", children: /* @__PURE__ */ c(z, { name: "warning" }) }),
        /* @__PURE__ */ y("span", { className: "flex flex-col gap-1", children: [
          /* @__PURE__ */ y("span", { className: "mono-label text-fail", children: [
            jt(t),
            " failed at these values"
          ] }),
          i ? /* @__PURE__ */ c("span", { className: "text-chat text-ink", children: i }) : null,
          n != null ? /* @__PURE__ */ y("span", { className: "text-chat text-ink-soft", children: [
            "Showing ",
            jt(n).toLowerCase(),
            ", the last one that built."
          ] }) : null
        ] })
      ]
    }
  ) : null });
}
function ix({ children: e }) {
  return /* @__PURE__ */ y("div", { className: "panel chrome absolute top-4 left-4 flex h-7 items-center gap-2 rounded-full px-3", children: [
    /* @__PURE__ */ c("span", { className: "size-1.5 shrink-0 rounded-full bg-fail" }),
    /* @__PURE__ */ c("span", { className: "mono-label text-ink", children: e })
  ] });
}
const $0 = Q.out;
function sx({ open: e, expected: t }) {
  return /* @__PURE__ */ c(me, { children: e ? /* @__PURE__ */ c(j0, { expected: t ?? null }, "building") : null });
}
function j0({ expected: e }) {
  const t = te(), [n] = O(() => performance.now()), [i, s] = O(0), [r, o] = O(!1);
  return F(() => {
    const a = setInterval(() => s((performance.now() - n) / 1e3), 100), l = requestAnimationFrame(() => o(!0));
    return () => {
      clearInterval(a), cancelAnimationFrame(l);
    };
  }, [n]), /* @__PURE__ */ y(
    j.div,
    {
      role: "status",
      initial: { opacity: 0, y: t ? 0 : -6 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: t ? 0 : -6 },
      transition: { duration: W.settle, ease: $0 },
      className: "panel chrome pointer-events-none absolute top-4 left-1/2 z-10 flex h-8 -translate-x-1/2 items-center gap-2.5 overflow-hidden rounded-full pr-3.5 pl-3",
      children: [
        /* @__PURE__ */ c(
          "span",
          {
            "aria-hidden": !0,
            className: "size-3 shrink-0 rounded-full border-[1.5px] border-accent/25 border-t-accent motion-safe:animate-spin"
          }
        ),
        /* @__PURE__ */ c("span", { className: "mono-label whitespace-nowrap text-ink", children: "Rebuilding" }),
        /* @__PURE__ */ c("span", { className: "mono-label w-9 text-right whitespace-nowrap text-muted tabular-nums", children: Yt(i) }),
        e ? /* @__PURE__ */ c("span", { "aria-hidden": !0, className: "absolute inset-x-0 bottom-0 h-0.5 bg-accent/15", children: /* @__PURE__ */ c(
          "span",
          {
            className: "block h-full origin-left bg-accent ease-out",
            style: {
              transform: `scaleX(${r ? 0.92 : 0})`,
              transitionProperty: "transform",
              transitionDuration: t ? "0ms" : `${Math.max(0.3, e) * 1e3}ms`
            }
          }
        ) }) : null
      ]
    }
  );
}
const U0 = Q.out;
function rx({
  version: e,
  installing: t = !1,
  onLater: n,
  onInstall: i,
  className: s
}) {
  const r = te() === !0, o = r ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } } : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 8 } };
  return /* @__PURE__ */ y(
    j.div,
    {
      ...o,
      transition: { duration: r ? 0 : W.settle, ease: U0 },
      className: L("panel flex w-[260px] flex-col gap-2 p-4", s),
      role: "status",
      children: [
        /* @__PURE__ */ c("span", { className: "mono-caption text-muted", children: "Update" }),
        /* @__PURE__ */ y("div", { className: "flex flex-col gap-1", children: [
          /* @__PURE__ */ y("h2", { className: "font-display text-[15px] leading-5 tracking-[-0.02em] text-ink", children: [
            "nurb ",
            e,
            " is ready"
          ] }),
          /* @__PURE__ */ c("p", { className: "text-[13px] leading-[18px] text-muted", children: t ? "Closing and reopening nurb." : "Downloaded. Restart to finish." })
        ] }),
        /* @__PURE__ */ y("div", { className: "mt-1 flex items-center gap-2", children: [
          t || !n ? null : /* @__PURE__ */ c(Me, { variant: "outline", onClick: n, children: "Later" }),
          /* @__PURE__ */ c(Me, { variant: "accent", disabled: t, onClick: i, children: t ? "Restarting…" : "Restart now" })
        ] })
      ]
    }
  );
}
const z0 = Q.out, qo = [100, 93, 97, 88, 95, 91];
function W0(e, t) {
  return t > 1 && e === t - 1 ? 62 : qo[(e * 7 + 3) % qo.length];
}
function _0({ loading: e, delay: t = 120, minVisible: n = 380 }) {
  const [i, s] = O(!1), r = C(0);
  return F(() => {
    if (e) {
      if (i) return;
      const l = setTimeout(() => {
        r.current = performance.now(), s(!0);
      }, t);
      return () => clearTimeout(l);
    }
    if (!i) return;
    const o = Math.max(0, n - (performance.now() - r.current)), a = setTimeout(() => s(!1), o);
    return () => clearTimeout(a);
  }, [e, i, t, n]), { showSkeleton: i };
}
function ox({
  loading: e,
  children: t,
  lines: n = 3,
  lineHeight: i = 21,
  reserve: s,
  delay: r = 120,
  minVisible: o = 380,
  label: a,
  className: l
}) {
  const { showSkeleton: u } = _0({ loading: e, delay: r, minVisible: o }), d = te(), h = C(null), f = C(null), [p, m] = O(!1), x = s ?? n * i, v = { duration: d ? 0 : W.settle, ease: z0 };
  return F(() => {
    const w = h.current;
    if (!w || typeof ResizeObserver > "u") return;
    const T = () => m(w.scrollHeight - w.clientHeight > 1);
    T();
    const g = new ResizeObserver(T);
    return g.observe(w), f.current && g.observe(f.current), () => g.disconnect();
  }, []), /* @__PURE__ */ y(
    "div",
    {
      ref: h,
      "aria-busy": e,
      "aria-label": a,
      tabIndex: p ? 0 : void 0,
      style: { height: x },
      className: L("relative grid overflow-y-auto overscroll-contain text-ink-soft", l),
      children: [
        /* @__PURE__ */ c(
          j.div,
          {
            ref: f,
            className: "col-start-1 row-start-1 min-w-0",
            initial: !1,
            animate: { opacity: u ? 0 : 1 },
            transition: v,
            style: { pointerEvents: u ? "none" : void 0 },
            children: t
          }
        ),
        /* @__PURE__ */ c(me, { initial: !1, children: u ? /* @__PURE__ */ c(
          j.div,
          {
            "aria-hidden": !0,
            "data-skeleton": !0,
            className: "pointer-events-none col-start-1 row-start-1 w-full self-start",
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            transition: v,
            children: Array.from({ length: n }, (w, T) => /* @__PURE__ */ c("div", { className: "flex items-center", style: { height: i }, children: /* @__PURE__ */ c("div", { className: "h-[8px] rounded-[3px] bg-raised", style: { width: `${W0(T, n)}%` } }) }, T))
          },
          "skeleton"
        ) : null }),
        a ? /* @__PURE__ */ c("span", { role: "status", className: "sr-only", children: e ? "" : `${a} loaded` }) : null
      ]
    }
  );
}
const Yo = Q.out, Xo = 0.35, G0 = 2200;
function ax({
  value: e,
  max: t = 100,
  segments: n,
  label: i = "Progress",
  pendingLabel: s = "Working",
  completeLabel: r = "Complete",
  className: o
}) {
  const a = te(), l = Te(), [u, d] = O(0), h = e === null;
  F(() => {
    if (!h || a) return;
    const g = performance.now();
    let S = requestAnimationFrame(function R() {
      const D = Xo * (1 - Math.exp(-(performance.now() - g) / G0));
      d((k) => Math.max(k, D)), Xo - D > 2e-3 && (S = requestAnimationFrame(R));
    });
    return () => cancelAnimationFrame(S);
  }, [h, a]);
  const f = e === null || t <= 0 ? 0 : Math.min(1, Math.max(0, e / t)), p = Math.max(h ? u : 0, f), m = n ? Math.round(p * n) / n : p, x = Math.round(m * 100), v = !h && m >= 1, w = h ? {} : { "aria-valuenow": Math.round(f * t * 100) / 100, "aria-valuetext": `${x}%` }, T = { duration: a ? 0 : W.settle, ease: Yo };
  return /* @__PURE__ */ y("div", { className: L("w-full", o), children: [
    /* @__PURE__ */ y("div", { className: "flex items-baseline justify-between gap-3", children: [
      /* @__PURE__ */ c("span", { id: l, className: "mono-label truncate text-ink-soft", children: i }),
      /* @__PURE__ */ y("span", { "aria-hidden": !0, className: "grid shrink-0 justify-items-end", children: [
        /* @__PURE__ */ c(
          j.span,
          {
            className: "mono-label col-start-1 row-start-1 whitespace-nowrap text-muted",
            initial: !1,
            animate: { opacity: h ? 1 : 0 },
            transition: T,
            children: s
          }
        ),
        /* @__PURE__ */ y(
          j.span,
          {
            className: "mono-value col-start-1 row-start-1 whitespace-nowrap text-ink",
            initial: !1,
            animate: { opacity: h ? 0 : 1 },
            transition: T,
            children: [
              x,
              "%"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ c(
      "div",
      {
        role: "progressbar",
        "aria-labelledby": l,
        "aria-valuemin": 0,
        "aria-valuemax": t,
        ...w,
        className: "mt-2 h-[8px] overflow-hidden rounded-[3px] bg-raised",
        children: n ? /* @__PURE__ */ c("div", { className: "flex h-full gap-px", "data-cells": n, children: Array.from({ length: n }, (g, S) => /* @__PURE__ */ c(
          j.span,
          {
            "data-lit": S < Math.round(m * n) ? "" : void 0,
            className: "h-full flex-1 bg-accent first:rounded-l-[3px] last:rounded-r-[3px]",
            initial: !1,
            animate: { opacity: S < Math.round(m * n) ? 1 : 0.12 },
            transition: { duration: a ? 0 : W.tick, ease: Yo }
          },
          S
        )) }) : /* @__PURE__ */ c(
          j.span,
          {
            className: "block h-full origin-left rounded-[3px] bg-accent",
            initial: !1,
            animate: { scaleX: m },
            transition: T
          }
        )
      }
    ),
    /* @__PURE__ */ c("span", { "aria-live": "polite", className: "sr-only", children: v ? r : h ? s : "" })
  ] });
}
const ci = Q.out, Zo = { duration: 0 }, Qo = {
  warn: { surface: "bg-warn-wash border-warn/25", mark: "text-warn" },
  fail: { surface: "bg-fail-wash border-fail/25", mark: "text-fail" },
  neutral: { surface: "bg-raised border-line", mark: "text-ink" }
};
function K0({
  state: e,
  defaultState: t = "open",
  onStateChange: n,
  onDismiss: i
} = {}) {
  const [s, r] = O(t), o = e ?? s, a = C(n);
  a.current = n;
  const l = C(i);
  l.current = i;
  const u = Z((m) => {
    r(m), a.current?.(m);
  }, []), d = Z(() => u("folded"), [u]), h = Z(() => u("open"), [u]), f = Z(() => u(o === "open" ? "folded" : "open"), [u, o]), p = Z(() => {
    u("dismissed"), l.current?.();
  }, [u]);
  return {
    state: o,
    open: o === "open",
    folded: o === "folded",
    dismissed: o === "dismissed",
    fold: d,
    expand: h,
    toggle: f,
    dismiss: p
  };
}
function lx({
  title: e,
  description: t,
  children: n,
  action: i,
  tone: s = "neutral",
  dismissible: r = !0,
  state: o,
  defaultState: a = "open",
  onStateChange: l,
  onDismiss: u,
  dismissLabel: d = "Dismiss notice",
  className: h
}) {
  const f = te() === !0, p = Te(), m = `${p}-body`, x = `${p}-title`, { state: v, open: w, dismissed: T, toggle: g, fold: S, dismiss: R } = K0({
    state: o,
    defaultState: a,
    onStateChange: l,
    onDismiss: u
  }), D = !!(t || n || i), k = { duration: f ? 0 : W.settle, ease: ci };
  return /* @__PURE__ */ y(G, { children: [
    /* @__PURE__ */ c(
      j.div,
      {
        initial: { height: 0, opacity: 0 },
        animate: { height: T ? 0 : "auto", opacity: T ? 0 : 1 },
        transition: k,
        style: { overflow: "hidden" },
        children: /* @__PURE__ */ y(
          "div",
          {
            role: "region",
            "aria-labelledby": x,
            className: L("rounded-[12px] border", Qo[s].surface, h),
            children: [
              /* @__PURE__ */ y("div", { className: "flex items-center gap-2 p-2.5", children: [
                /* @__PURE__ */ c("span", { "aria-hidden": "true", className: L("flex shrink-0", Qo[s].mark), children: /* @__PURE__ */ c(z, { name: s === "neutral" ? "box" : "warning" }) }),
                D ? /* @__PURE__ */ y(
                  "button",
                  {
                    type: "button",
                    onClick: g,
                    onKeyDown: (A) => {
                      A.key !== "Escape" || !w || (A.stopPropagation(), S());
                    },
                    "aria-expanded": w,
                    "aria-controls": m,
                    className: "chrome group flex min-w-0 flex-1 items-center gap-2 rounded-[3px] text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                    children: [
                      /* @__PURE__ */ c("span", { id: x, className: "min-w-0 flex-1 truncate text-[13px] leading-5 font-medium text-ink", children: e }),
                      /* @__PURE__ */ c(
                        j.span,
                        {
                          "aria-hidden": "true",
                          className: "flex shrink-0 text-muted group-hover:text-ink",
                          initial: !1,
                          animate: { rotate: w ? 180 : 0 },
                          transition: f ? Zo : { duration: W.tick, ease: ci },
                          children: /* @__PURE__ */ c(z, { name: "chevron-down" })
                        }
                      )
                    ]
                  }
                ) : /* @__PURE__ */ c("span", { id: x, className: "min-w-0 flex-1 truncate text-[13px] leading-5 font-medium text-ink", children: e }),
                r ? /* @__PURE__ */ c(Us, { icon: "xmark", label: d, onClick: R }) : null
              ] }),
              D ? /* @__PURE__ */ c(
                j.div,
                {
                  id: m,
                  inert: !w,
                  initial: !1,
                  animate: { height: w ? "auto" : 0, opacity: w ? 1 : 0 },
                  transition: f ? Zo : { height: k, opacity: { duration: W.tick, ease: ci, delay: w ? 0.05 : 0 } },
                  style: { overflow: "hidden" },
                  children: /* @__PURE__ */ y("div", { className: "pr-2.5 pb-2.5 pl-[30px]", children: [
                    t ? /* @__PURE__ */ c("p", { className: "text-[12.5px] leading-relaxed text-muted", children: t }) : null,
                    n,
                    i ? /* @__PURE__ */ c("div", { className: "mt-2", children: i }) : null
                  ] })
                }
              ) : null
            ]
          }
        )
      }
    ),
    /* @__PURE__ */ c("span", { role: "status", "aria-live": "polite", className: "sr-only", children: v === "dismissed" ? "Notice dismissed." : "" })
  ] });
}
const H0 = Q.out, ji = { duration: 0 }, q0 = { duration: W.coast, ease: "linear", repeat: 1 / 0 };
function cx({ linger: e = 2e3 } = {}) {
  const [t, n] = O(null), i = C(0), s = C(null), r = Z(() => {
    s.current && clearTimeout(s.current), s.current = null;
  }, []), o = Z(
    (h) => {
      r(), i.current += 1;
      const f = `activity-${i.current}`;
      return n({ ...h, id: f, tone: "working" }), f;
    },
    [r]
  ), a = Z((h) => {
    n((f) => f && { ...f, ...h });
  }, []), l = Z(() => {
    r(), n(null);
  }, [r]), u = Z(
    (h) => {
      n((f) => f && { ...f, ...h, tone: "done" }), r(), s.current = setTimeout(() => {
        s.current = null, n(null);
      }, e);
    },
    [r, e]
  ), d = Z(
    (h) => {
      r(), n((f) => f && { ...f, ...h, tone: "fail" });
    },
    [r]
  );
  return F(() => r, [r]), { activity: t, start: o, update: a, succeed: u, fail: d, dismiss: l };
}
function ux({
  activity: e,
  onDismiss: t,
  label: n = "Activity",
  className: i
}) {
  const s = te() === !0, [r, o] = O(""), a = C(/* @__PURE__ */ new Set()), l = e?.tone ?? "working";
  return F(() => {
    if (!e) return;
    const u = `${e.id}:${l}`;
    a.current.has(u) || (a.current.add(u), o(
      l === "working" ? `${e.title} started.` : l === "done" ? `${e.title} finished.` : `${e.title} failed.`
    ));
  }, [e, l]), /* @__PURE__ */ y("div", { role: "region", "aria-label": n, className: L("pointer-events-none flex justify-center", i), children: [
    /* @__PURE__ */ c(me, { initial: !1, mode: "wait", children: e ? /* @__PURE__ */ y(
      j.div,
      {
        initial: s ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.94 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: s ? { opacity: 0, transition: ji } : { opacity: 0, y: -8, scale: 0.97 },
        transition: s ? ji : { duration: W.settle, ease: H0 },
        style: { transformOrigin: "50% 0%" },
        className: "pointer-events-auto flex max-w-[320px] items-center gap-2 rounded-[12px] border border-line bg-ground px-3 py-2 shadow-[var(--shadow-panel)]",
        children: [
          /* @__PURE__ */ c(Y0, { tone: l, reduced: s }),
          /* @__PURE__ */ y("span", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ c("span", { className: "block truncate text-[13px] leading-5 font-medium text-ink", children: e.title }),
            e.detail ? /* @__PURE__ */ c("span", { className: "mono-caption block truncate text-muted", children: e.detail }) : null
          ] }),
          t && l !== "working" ? /* @__PURE__ */ c(Us, { icon: "xmark", label: "Dismiss activity", onClick: t }) : null
        ]
      },
      e.id
    ) : null }),
    /* @__PURE__ */ c("span", { role: "status", "aria-live": "polite", className: "sr-only", children: r })
  ] });
}
function Y0({ tone: e, reduced: t }) {
  return e === "done" ? /* @__PURE__ */ c("span", { className: "flex shrink-0 text-pass", "data-tone": "done", children: /* @__PURE__ */ c(z, { name: "check" }) }) : e === "fail" ? /* @__PURE__ */ c("span", { className: "flex shrink-0 text-fail", "data-tone": "fail", children: /* @__PURE__ */ c(z, { name: "warning" }) }) : /* @__PURE__ */ c(
    j.span,
    {
      className: "flex shrink-0 text-accent",
      "data-tone": "working",
      style: { transformOrigin: "50% 50%" },
      animate: t ? void 0 : { rotate: 360 },
      transition: t ? ji : q0,
      children: /* @__PURE__ */ c(z, { name: "loader" })
    }
  );
}
const X0 = Q.out, Jo = { duration: 0 }, Z0 = (e) => `${e} new ${e === 1 ? "item" : "items"}`;
function dx({
  count: e,
  onClick: t,
  anchor: n = "bottom",
  label: i = Z0,
  className: s
}) {
  const r = te() === !0, [o, a] = O(0);
  F(() => {
    if (e === 0) {
      a(0);
      return;
    }
    const d = setTimeout(() => a(e), 700);
    return () => clearTimeout(d);
  }, [e]);
  const l = i(e), u = n === "bottom" ? 10 : -10;
  return /* @__PURE__ */ y(
    "div",
    {
      className: L(
        "pointer-events-none absolute inset-x-0 z-10 flex justify-center",
        n === "bottom" ? "bottom-2" : "top-2",
        s
      ),
      children: [
        /* @__PURE__ */ c(me, { initial: !1, children: e > 0 ? /* @__PURE__ */ y(
          j.button,
          {
            type: "button",
            onClick: t,
            "aria-label": l,
            initial: r ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: u },
            animate: { opacity: 1, scale: 1, y: 0 },
            exit: r ? { opacity: 0, transition: Jo } : { opacity: 0, scale: 0.96, y: u * 0.5 },
            transition: r ? Jo : { duration: W.settle, ease: X0 },
            className: "chrome btn-label pointer-events-auto inline-flex h-7 items-center gap-1.5 rounded-[3px] border border-line bg-ground pr-3 pl-2.5 text-ink-soft shadow-[var(--shadow-panel)] hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
            children: [
              /* @__PURE__ */ c("span", { "aria-hidden": "true", className: L("flex text-accent", n === "bottom" && "rotate-180"), children: /* @__PURE__ */ c(z, { name: "arrow-up" }) }),
              /* @__PURE__ */ c("span", { className: "tabular-nums", "aria-hidden": "true", children: l })
            ]
          }
        ) : null }),
        /* @__PURE__ */ c("span", { role: "status", "aria-live": "polite", className: "sr-only", children: o > 0 ? i(o) : "" })
      ]
    }
  );
}
const Q0 = Q.out;
function fx({
  options: e,
  label: t,
  value: n,
  onValueChange: i,
  className: s
}) {
  const r = Te(), o = te(), a = C([]), [l, u] = O(null), d = e.findIndex((x) => x.value === n), h = d < 0 ? 0 : d, f = l ?? h, p = (x) => {
    const v = (x + e.length) % e.length;
    a.current[v]?.focus();
  }, m = (x) => {
    x !== n && (ze("toggle"), i(x));
  };
  return /* @__PURE__ */ c(
    "div",
    {
      role: "radiogroup",
      "aria-label": t,
      onBlur: (x) => {
        x.currentTarget.contains(x.relatedTarget) || u(null);
      },
      className: L(
        "chrome grid auto-cols-fr grid-flow-col gap-px rounded-[3px] border border-line bg-raised p-[2px]",
        s
      ),
      children: e.map((x, v) => /* @__PURE__ */ y(
        "button",
        {
          ref: (w) => {
            a.current[v] = w;
          },
          type: "button",
          role: "radio",
          "aria-checked": v === h,
          tabIndex: v === f ? 0 : -1,
          onFocus: () => u(v),
          onClick: () => m(x.value),
          onKeyDown: (w) => {
            if (w.key === "ArrowRight" || w.key === "ArrowDown") p(v + 1);
            else if (w.key === "ArrowLeft" || w.key === "ArrowUp") p(v - 1);
            else if (w.key === "Home") p(0);
            else if (w.key === "End") p(e.length - 1);
            else if (w.key === "Enter" || w.key === " ") m(x.value);
            else return;
            w.preventDefault();
          },
          className: L(
            "mono-label relative flex h-6 items-center justify-center rounded-[3px] px-2.5 whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent",
            v === h ? "text-ink" : "text-muted hover:text-ink-soft"
          ),
          children: [
            v === h ? /* @__PURE__ */ c(
              j.span,
              {
                layoutId: r,
                "aria-hidden": !0,
                transition: { duration: o ? 0 : W.settle, ease: Q0 },
                className: "absolute inset-0 rounded-[3px] bg-ground"
              }
            ) : null,
            /* @__PURE__ */ c("span", { className: "relative", children: x.label })
          ]
        },
        x.value
      ))
    }
  );
}
const Sc = Q.out, rt = { duration: 0 };
function J0({ steps: e, current: t, failed: n = !1 }) {
  const i = !n && t >= e.length, s = e.map((a, l) => ({
    ...a,
    status: l < t ? "done" : l === t && n ? "failed" : l === t && !i ? "active" : "pending"
  })), r = s.find((a) => a.status === "active"), o = n ? `Failed at ${e[Math.min(t, e.length - 1)]?.label ?? "step"}` : i ? `All ${e.length} steps complete` : r ? `${r.label}, step ${t + 1} of ${e.length}` : "";
  return { rows: s, complete: i, failed: n, sentence: o };
}
function ey({ reduced: e }) {
  return /* @__PURE__ */ c("svg", { viewBox: "0 0 256 256", width: "11", height: "11", fill: "none", "aria-hidden": !0, children: /* @__PURE__ */ c(
    j.polyline,
    {
      points: "216 72 104 184 48 128",
      stroke: "currentColor",
      strokeWidth: "26",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      initial: { pathLength: 0 },
      animate: { pathLength: 1 },
      transition: { duration: e ? 0 : W.settle, ease: Sc }
    }
  ) });
}
function ty() {
  return /* @__PURE__ */ c("svg", { viewBox: "0 0 256 256", width: "10", height: "10", fill: "none", "aria-hidden": !0, children: /* @__PURE__ */ c("path", { d: "M200 56 56 200 M56 56l144 144", stroke: "currentColor", strokeWidth: "26", strokeLinecap: "round" }) });
}
function ny({ reduced: e }) {
  return /* @__PURE__ */ y(
    j.svg,
    {
      viewBox: "0 0 16 16",
      className: "size-3",
      "aria-hidden": !0,
      animate: { rotate: e ? 0 : 360 },
      transition: e ? rt : { duration: W.coast / 2, ease: "linear", repeat: 1 / 0 },
      children: [
        /* @__PURE__ */ c("circle", { cx: "8", cy: "8", r: "6", fill: "none", stroke: "currentColor", strokeOpacity: "0.25", strokeWidth: "2" }),
        /* @__PURE__ */ c("path", { d: "M8 2 a6 6 0 0 1 6 6", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" })
      ]
    }
  );
}
const iy = {
  done: "text-ink-soft",
  active: "font-medium text-ink",
  failed: "font-medium text-fail",
  pending: "text-faint"
};
function hx({
  steps: e,
  current: t,
  failed: n = !1,
  label: i = "Task progress",
  className: s
}) {
  const { rows: r, complete: o, sentence: a } = J0({ steps: e, current: t, failed: n }), l = te() === !0, [u, d] = O("");
  F(() => {
    if (!a) return;
    const f = setTimeout(() => d(a), 500);
    return () => clearTimeout(f);
  }, [a]);
  const h = { duration: l ? 0 : W.settle, ease: Sc };
  return /* @__PURE__ */ y("div", { className: L("w-full", s), children: [
    /* @__PURE__ */ c("ol", { "aria-label": i, className: "space-y-0.5", children: r.map((f) => /* @__PURE__ */ y(
      "li",
      {
        "data-status": f.status,
        "aria-current": f.status === "active" ? "step" : void 0,
        className: "flex h-7 items-center gap-2.5 px-1",
        children: [
          /* @__PURE__ */ c("span", { className: "relative grid size-4 shrink-0 place-items-center", children: /* @__PURE__ */ c(me, { initial: !1, children: f.status === "done" ? /* @__PURE__ */ c(
            j.span,
            {
              className: "col-start-1 row-start-1 grid size-4 place-items-center rounded-[3px] bg-pass-wash text-pass",
              initial: { opacity: l ? 1 : 0 },
              animate: { opacity: 1 },
              exit: { opacity: 0, transition: rt },
              transition: h,
              children: /* @__PURE__ */ c(ey, { reduced: l })
            },
            "done"
          ) : f.status === "failed" ? /* @__PURE__ */ c(
            j.span,
            {
              className: "col-start-1 row-start-1 grid size-4 place-items-center rounded-[3px] bg-fail-wash text-fail",
              initial: { opacity: l ? 1 : 0 },
              animate: { opacity: 1 },
              exit: { opacity: 0, transition: rt },
              transition: h,
              children: /* @__PURE__ */ c(ty, {})
            },
            "failed"
          ) : f.status === "active" ? /* @__PURE__ */ c(
            j.span,
            {
              className: "col-start-1 row-start-1 text-accent",
              initial: { opacity: l ? 1 : 0 },
              animate: { opacity: 1 },
              exit: { opacity: 0, transition: rt },
              transition: h,
              children: /* @__PURE__ */ c(ny, { reduced: l })
            },
            "active"
          ) : /* @__PURE__ */ c(
            j.span,
            {
              className: "col-start-1 row-start-1 size-[5px] rounded-[3px] bg-line",
              initial: { opacity: 1 },
              animate: { opacity: 1 },
              exit: { opacity: 0, transition: rt },
              transition: rt
            },
            "pending"
          ) }) }),
          /* @__PURE__ */ c("span", { className: L("mono-id min-w-0 flex-1 truncate transition-colors", iy[f.status]), children: f.label }),
          f.meta ? /* @__PURE__ */ c(
            "span",
            {
              "aria-hidden": f.status !== "done",
              className: L(
                "mono-caption shrink-0 text-faint transition-opacity",
                f.status === "done" ? "opacity-100" : "opacity-0"
              ),
              children: f.meta
            }
          ) : null
        ]
      },
      f.id
    )) }),
    /* @__PURE__ */ c("span", { role: "status", className: "sr-only", children: u }),
    /* @__PURE__ */ c("span", { className: "sr-only", "aria-live": o || n ? "polite" : "off", children: o ? "Run complete" : n ? "Run failed" : "" })
  ] });
}
const sy = Q.out, Nc = /-?\d*\.?\d+/g, ry = "12", oy = {
  "check-close": [
    ["M 5 12.5 L 10 17.5 L 19.5 7", "M 12 12 L 12 12 L 12 12"],
    ["M 6.5 6.5 L 12 12 L 17.5 17.5", "M 17.5 6.5 L 12 12 L 6.5 17.5"]
  ],
  "plus-minus": [
    ["M 5 12 L 19 12", "M 12 5 L 12 19"],
    ["M 5 12 L 19 12", "M 5 12 L 19 12"]
  ]
};
function ay(e) {
  const t = e.match(Nc);
  return !t || t.length < 4 ? !1 : t.every((n, i) => n === t[i % 2]);
}
function ly(e, t) {
  const n = e.reduce((s, r) => Math.max(s, r.length), 0), i = e[t] ?? e[0];
  return Array.from({ length: n }, (s, r) => {
    const o = i[r], a = e.find((u) => u[r] !== void 0)?.[r] ?? "", l = o ?? a.replace(Nc, ry);
    return { key: r, d: l, visible: !ay(l) };
  });
}
function px({
  preset: e = "check-close",
  active: t = 0,
  size: n = 12,
  strokeWidth: i = 1.75,
  label: s,
  className: r
}) {
  const o = oy[e], a = typeof t == "boolean" ? t ? 1 : 0 : Math.min(Math.max(Math.trunc(t), 0), 1), l = he(() => ly(o, a), [o, a]), d = te() ? { duration: 0 } : { duration: W.settle, ease: sy };
  return /* @__PURE__ */ c(
    "svg",
    {
      viewBox: "0 0 24 24",
      width: n,
      height: n,
      focusable: "false",
      role: s ? "img" : void 0,
      "aria-label": s,
      "aria-hidden": s ? void 0 : !0,
      fill: "none",
      stroke: "currentColor",
      strokeWidth: i,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      className: r,
      style: { display: "block" },
      children: l.map((h) => /* @__PURE__ */ c(
        j.path,
        {
          initial: !1,
          animate: { d: h.d, opacity: h.visible ? 1 : 0 },
          transition: d
        },
        h.key
      ))
    }
  );
}
const Ac = Q.out;
function cy({ value: e }) {
  const t = te() === !0;
  return /* @__PURE__ */ c("span", { className: "relative inline-flex h-[13px] overflow-hidden leading-[13px] tabular-nums", children: /* @__PURE__ */ c(me, { initial: !1, mode: "popLayout", children: /* @__PURE__ */ c(
    j.span,
    {
      initial: t ? { opacity: 0 } : { y: 13, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: t ? { opacity: 0 } : { y: -13, opacity: 0 },
      transition: { duration: t ? 0 : W.tick, ease: Ac },
      children: e
    },
    e
  ) }) });
}
function mx({
  questions: e,
  onAnswer: t,
  className: n
}) {
  const [i, s] = O(0), r = C(!1), o = e.length;
  F(() => {
    if (o === 0) {
      r.current = !1, s(0);
      return;
    }
    r.current || (r.current = !0, ze("scan"));
  }, [o]);
  const a = $s(!0), l = e[0];
  if (!l) return null;
  const u = i + o, d = Math.min(i + 1, u), h = (f) => {
    s((p) => p + 1), t(l.id, f);
  };
  return /* @__PURE__ */ y("div", { className: L("flex flex-col gap-2.5 rounded-[6px] bg-raised p-3", n), children: [
    u > 1 ? /* @__PURE__ */ y("div", { className: "flex items-center gap-1", children: [
      /* @__PURE__ */ y("span", { "aria-hidden": "true", className: "mono-caption flex items-center gap-1 text-faint", children: [
        /* @__PURE__ */ c(cy, { value: d }),
        "of ",
        u
      ] }),
      /* @__PURE__ */ y("span", { className: "sr-only", children: [
        "Question ",
        d,
        " of ",
        u
      ] })
    ] }) : null,
    /* @__PURE__ */ c(j.div, { style: a.style, animate: a.animate, transition: a.transition, onAnimationComplete: a.onAnimationComplete, children: /* @__PURE__ */ c("div", { ref: a.ref, children: /* @__PURE__ */ c(me, { initial: !1, mode: "popLayout", children: /* @__PURE__ */ y(
      j.div,
      {
        initial: { y: 12, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: W.settle, ease: Ac },
        className: "flex flex-col gap-2.5",
        children: [
          /* @__PURE__ */ c("p", { className: "text-chat text-ink", children: l.title }),
          l.detail ? /* @__PURE__ */ c("p", { className: "mono-caption text-muted", children: l.detail }) : null,
          /* @__PURE__ */ c("div", { className: "flex flex-wrap gap-1.5", children: l.actions.map((f) => /* @__PURE__ */ c(Me, { variant: f.variant ?? "outline", onClick: () => h(f.id), children: f.label }, f.id)) })
        ]
      },
      l.id
    ) }) }) })
  ] });
}
const uy = /def\s+\w+\s*\(([\s\S]*?)\)\s*(?:->[^:]*?)?:/;
function dy(e) {
  const t = [];
  let n = 0, i = 0;
  for (let s = 0; s < e.length; s++) {
    const r = e[s];
    r === "(" || r === "[" || r === "{" ? n++ : r === ")" || r === "]" || r === "}" ? n-- : r === "," && n === 0 && (t.push(e.slice(i, s)), i = s + 1);
  }
  return t.push(e.slice(i)), t;
}
function ea(e) {
  const t = /* @__PURE__ */ new Map(), n = e.match(uy);
  if (!n) return t;
  for (const i of dy(n[1])) {
    const s = i.indexOf("=");
    if (s < 0) continue;
    const r = i.slice(0, s).split(":")[0].trim(), o = i.slice(s + 1).trim();
    !/^[A-Za-z_]\w*$/.test(r) || !o || t.set(r, o);
  }
  return t;
}
function fy(e, t) {
  const n = ea(e), i = ea(t), s = [];
  for (const [r, o] of i) {
    const a = n.get(r);
    a === void 0 ? s.push(`added ${r}`) : a !== o && s.push(`${r} ${a} to ${o}`);
  }
  for (const r of n.keys())
    i.has(r) || s.push(`removed ${r}`);
  return s;
}
function hy(e, t) {
  const n = e ? e.split(`
`) : [], i = t ? t.split(`
`) : [];
  let s = 0;
  for (; s < n.length && s < i.length && n[s] === i[s]; ) s++;
  let r = 0;
  for (; r < n.length - s && r < i.length - s && n[n.length - 1 - r] === i[i.length - 1 - r]; ) r++;
  const o = n.slice(s, n.length - r).map((l) => ({ sign: "-", text: l })), a = i.slice(s, i.length - r).map((l) => ({ sign: "+", text: l }));
  return [...o, ...a];
}
function py(e) {
  if (!e || typeof e != "object") return null;
  const t = e, n = typeof t.part_name == "string" ? t.part_name : null;
  return n ? typeof t.old_string == "string" && typeof t.new_string == "string" ? { name: n, before: t.old_string, after: t.new_string } : typeof t.source == "string" ? { name: n, after: t.source } : null : null;
}
const ta = 12;
function gx({ input: e, className: t }) {
  const [n, i] = O(null), [s, r] = O(!1), o = $s(n !== null), a = py(e), l = a?.before !== void 0 ? fy(a.before, a.after) : [];
  if (!a) return null;
  const u = l.length > 0 ? l : [`edited ${a.name}`], d = hy(a.before ?? "", a.after), h = s ? d : d.slice(0, ta);
  return /* @__PURE__ */ y("div", { className: L("flex flex-col gap-1.5", t), children: [
    /* @__PURE__ */ c("div", { className: "flex flex-wrap gap-1", children: u.map((f) => /* @__PURE__ */ c(
      "button",
      {
        type: "button",
        "aria-expanded": n === f,
        onClick: () => i((p) => p === f ? null : f),
        className: L(
          "mono-caption rounded-[3px] bg-raised px-1.5 py-0.5 text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent",
          n === f && "text-ink"
        ),
        children: f
      },
      f
    )) }),
    /* @__PURE__ */ c(j.div, { style: o.style, animate: o.animate, transition: o.transition, onAnimationComplete: o.onAnimationComplete, children: /* @__PURE__ */ c("div", { ref: o.ref, children: n !== null && d.length > 0 ? /* @__PURE__ */ y("div", { className: "flex flex-col rounded-[3px] bg-raised py-1", children: [
      h.map((f, p) => /* @__PURE__ */ y(
        "span",
        {
          className: L(
            "px-2 font-mono text-[11.5px] leading-[17px] break-words whitespace-pre-wrap",
            f.sign === "+" ? "bg-pass-wash text-ink-soft" : "bg-fail-wash text-ink-soft"
          ),
          children: [
            f.sign,
            " ",
            f.text
          ]
        },
        p
      )),
      !s && d.length > ta ? /* @__PURE__ */ c(
        "button",
        {
          type: "button",
          onClick: () => r(!0),
          className: "mono-caption self-start px-2 pt-1 text-faint hover:text-ink",
          children: "show more"
        }
      ) : null
    ] }) : null }) })
  ] });
}
const Pc = Q.out;
function yx({ active: e, label: t = "Drop the photo here" }) {
  const n = te() === !0;
  return /* @__PURE__ */ c(me, { initial: !1, children: e ? /* @__PURE__ */ c(
    j.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: n ? 0 : W.tick, ease: Pc },
      className: "pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-[6px] border border-dashed border-accent bg-accent-wash",
      children: /* @__PURE__ */ c("span", { className: "btn-label text-accent-ink", children: t })
    }
  ) : null });
}
function xx({
  lines: e,
  active: t,
  everyMs: n = 4e3,
  className: i
}) {
  const [s, r] = O(0), o = te() === !0;
  return F(() => {
    if (!t || e.length < 2) return;
    const a = setInterval(() => r((l) => (l + 1) % e.length), n);
    return () => clearInterval(a);
  }, [t, e.length, n]), !t || e.length === 0 ? null : /* @__PURE__ */ c("span", { "aria-hidden": "true", className: L("pointer-events-none absolute inset-0 block", i), children: /* @__PURE__ */ c(me, { initial: !1, children: /* @__PURE__ */ c(
    j.span,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: o ? 0 : W.settle, ease: Pc },
      className: "absolute inset-x-0 top-0 block",
      children: e[s % e.length]
    },
    s % e.length
  ) }) });
}
export {
  rg as ASSISTANT_MARKDOWN_DISALLOWED_ELEMENTS,
  By as AddPrinterDialog,
  mx as ApprovalCard,
  Dy as AssistantMarkdown,
  P0 as BlurUpImage,
  Ey as BuildCard,
  nx as BuildFailedBanner,
  Me as Button,
  Zy as ChatPanel,
  lx as CollapsibleBanner,
  $y as ConfirmDialog,
  xx as CyclingPlaceholder,
  Xg as DetentMarks,
  yx as DropHint,
  gx as EditChips,
  Wy as EmptyProject,
  zy as EmptyShelf,
  Oy as ExportMenu,
  tx as FindingsList,
  pc as Floating,
  Ky as FloatingHeader,
  kc as HeaderCell,
  Hy as HeaderDivider,
  Xy as HeaderIcons,
  qy as HeaderStack,
  Yy as HeaderStatus,
  w0 as HoldToConfirm,
  z as Icon,
  Us as IconButton,
  px as IconMorph,
  m0 as IsoBox,
  ux as LiveActivity,
  qg as LoadingButton,
  jy as Lockup,
  Ry as MeasurementCard,
  y0 as Menu,
  dx as NewItemsPill,
  zs as PanelStrip,
  Qy as ParamRail,
  n0 as ParamSlider,
  Fy as ParamsPanel,
  Uy as PartCard,
  Iy as PrinterMenu,
  ax as ProgressBar,
  Jy as RailDisclosure,
  fx as SegmentedControl,
  ox as SkeletonSwap,
  Vy as SpecCard,
  _y as Stage,
  sx as StageBuilding,
  E0 as StageColumn,
  Gy as StageEmpty,
  ix as StageNotice,
  hx as TaskSteps,
  nc as ToolStepCard,
  ng as ToolStepGroup,
  rx as UpdateCard,
  ex as ValueFlash,
  Ly as ViewerIsland,
  $i as adjustable,
  o0 as bedLine,
  Ws as brand,
  hy as changedLines,
  cg as changedSize,
  Jl as clock,
  ze as cue,
  fc as decimals,
  fy as diffDefaults,
  Qg as dirtyValues,
  W as duration,
  Q as ease,
  Yt as elapsedLabel,
  qm as formatBbox,
  Cy as initials,
  ea as keywordDefaults,
  Ty as readSoundPrefs,
  Hm as relativeTime,
  jt as rev,
  Sy as setSoundEnabled,
  Ny as setSoundVolume,
  Zg as sliderRange,
  py as sourceEdit,
  My as stackLabel,
  mt as tidy,
  Kg as useAsyncAction,
  $s as useAutoHeight,
  A0 as useBlurUpImage,
  K0 as useCollapsibleBanner,
  x0 as useContextMenu,
  Ay as useCopyToClipboard,
  b0 as useHoldToConfirm,
  cx as useLiveActivity,
  _0 as useSkeletonSwap,
  Yg as useSliderDetents,
  J0 as useTaskSteps,
  Tc as useValueFlash,
  Cn as words
};
