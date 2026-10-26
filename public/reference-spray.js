/**
 * Tines footer spray motion, extracted from module 239964 and its path sampler.
 * Source: https://www.tines.com/_next/static/immutable/chunks/37cvwdwaz6wfz.js
 * Captured in kaky/references/tines-footer-source on 2026-10-26.
 * Original path data, timing, motion, compositing and drawing math are retained.
 * Stock character artwork, palette loader and bundler code are omitted; callers
 * supply KALE sprite sets. Canvas contexts use the native 2D API.
 */

let cubicBezier = (t, e, l, r, o) => {
  let i = 1 - o;
  return i * i * i * t + 3 * i * i * o * e + 3 * i * o * o * l + o * o * o * r;
};
function anchors(t) {
  return t.map(([t, e, l, r, o, i]) => ({
    x: t,
    y: e,
    hIn: [l, r],
    hOut: [o, i]
  }));
}
let samplerCache = new WeakMap();
function getSampler(path, aspect = 1) {
  let r = samplerCache.get(path);
  if (r && r.aspect === aspect) return r.sampler;
  let n = function (t, e) {
    let r = [];
    if (0 === t.length) return {
      at: () => ({
        fx: .5,
        fy: .5
      }),
      poly: [{
        x: .5,
        y: .5
      }]
    };
    if (1 === t.length) return {
      at: () => ({
        fx: t[0].x,
        fy: t[0].y
      }),
      poly: [{
        x: t[0].x,
        y: t[0].y
      }]
    };
    for (let e = 0; e < t.length - 1; e++) {
      let o = t[e],
        i = t[e + 1];
      for (let t = 0; t < 24; t++) {
        let e = t / 24;
        r.push({
          x: cubicBezier(o.x, o.hOut[0], i.hIn[0], i.x, e),
          y: cubicBezier(o.y, o.hOut[1], i.hIn[1], i.y, e)
        });
      }
    }
    let o = t[t.length - 1];
    r.push({
      x: o.x,
      y: o.y
    });
    let i = [0];
    for (let t = 1; t < r.length; t++) i.push(i[t - 1] + Math.hypot((r[t].x - r[t - 1].x) * e, r[t].y - r[t - 1].y));
    let n = i[i.length - 1] || 1;
    return {
      at: t => {
        let e = Math.max(0, Math.min(1, t)) * n,
          l = 1,
          o = i.length - 1;
        for (; l < o;) {
          let t = l + o >> 1;
          i[t] < e ? l = t + 1 : o = t;
        }
        let s = l,
          a = i[s] - i[s - 1] || 1,
          c = (e - i[s - 1]) / a;
        return {
          fx: r[s - 1].x + (r[s].x - r[s - 1].x) * c,
          fy: r[s - 1].y + (r[s].y - r[s - 1].y) * c
        };
      },
      poly: r
    };
  }(path, aspect);
  return samplerCache.set(path, {
    aspect: aspect,
    sampler: n
  }), n;
}
let beamPaths = [anchors([[-.05, .217, -.0765, .217, -.0235, .217], [.109, .217, .0825, .2015, .1355, .2325], [.109, .31, .1205, .279, .0975, .341], [.04, .403, .0385, .372, .0415, .434], [.118, .496, .0928, .465, .1432, .527], [.191, .589, .192, .558, .19, .62], [.112, .682, .1248, .651, .0992, .713], [.114, .775, .0725, .76, .1555, .79], [.361, .772, .3263, .7867, .3957, .7573], [.322, .687, .329, .7152, .315, .6588], [.319, .603, .3195, .6312, .3185, .5748], [.319, .518, .3177, .5463, .3203, .4897], [.327, .433, .327, .4613, .327, .4047], [.319, .348, .3203, .3763, .3177, .3197], [.319, .263, .2835, .255, .3545, .271], [.532, .396, .4967, .358, .5673, .434], [.531, .491, .5295, .4595, .5325, .5225], [.541, .585, .541, .5535, .541, .6165], [.531, .68, .5312, .6483, .5308, .7117], [.54, .775, .512, .7602, .568, .7898], [.699, .769, .6725, .7853, .7255, .7527], [.699, .677, .699, .7077, .699, .6463], [.699, .585, .698, .6155, .7, .5545], [.705, .494, .698, .5245, .712, .4635], [.741, .402, .709, .4405, .773, .3635], [.897, .263, .871, .272, .923, .254], [.897, .348, .8957, .3197, .8983, .3763], [.905, .433, .905, .4047, .905, .4613], [.897, .518, .8983, .4897, .8957, .5463], [.897, .603, .8963, .5748, .8977, .6312], [.901, .687, .894, .6588, .908, .7152], [.939, .772, .9142, .7578, .9638, .7862], [1.05, .772, 1.0315, .772, 1.0685, .772]]), anchors([[1.05, .402, 1.0758, .402, 1.0242, .402], [.895, .402, .9208, .3867, .8692, .4173], [.895, .494, .895, .4633, .895, .5247], [.895, .586, .895, .5553, .895, .6167], [.895, .678, .895, .6473, .895, .7087], [.895, .77, .8963, .7393, .8937, .8007], [.887, .862, .8907, .8313, .8833, .8927], [.873, .954, .9037, .9685, .8423, .9395], [.703, .775, .7325, .8207, .6735, .7293], [.696, .68, .6958, .7117, .6962, .6483], [.704, .585, .704, .6165, .704, .5535], [.696, .491, .6973, .5225, .6947, .4595], [.696, .396, .7203, .4437, .6717, .3483], [.55, .205, .5743, .221, .5257, .189], [.55, .3, .5595, .2683, .5405, .3317], [.493, .395, .5048, .3633, .4812, .4267], [.479, .49, .4818, .4585, .4762, .5215], [.476, .584, .476, .5525, .476, .6155], [.479, .679, .4763, .6473, .4817, .7107], [.492, .774, .5292, .758, .4548, .79], [.256, .775, .2953, .7907, .2167, .7593], [.256, .68, .256, .7117, .256, .6483], [.256, .585, .256, .6165, .256, .5535], [.256, .491, .256, .5225, .256, .4595], [.256, .396, .289, .434, .223, .358], [.058, .263, .091, .271, .025, .255], [.058, .348, .0568, .3197, .0592, .3763], [.065, .433, .065, .4047, .065, .4613], [.058, .518, .0592, .4897, .0568, .5463], [.058, .603, .0575, .5748, .0585, .6312], [.061, .687, .0548, .6588, .0672, .7152], [.095, .772, .1135, .7578, .0765, .7862], [-.05, .772, -.0258, .772, -.0742, .772]])];
let PAINT_END = .8666666666666667;
let BEAM_RGB = "215, 242, 237";
let DRONES = [{
  spriteKey: "a",
  color: "orange",
  tint: 25,
  flipX: 1,
  seed: 0,
  stops: 3,
  dwellDepth: .9,
  travelOffset: 0,
  paintBias: 0,
  path: beamPaths[0],
  bodyPath: anchors([[.2183, .1993, .2359, .1573, .1313, .4074], [.1548, 1.0474, .0565, 1.054, .2062, 1.0439], [.4177, .4371, .2445, .633, .4924, .3529], [.6995, 1.0033, .6058, 1.0363, .8382, .9546], [1.0149, .5586, 1.0005, .5702, 1.0724, .512]])
}, {
  spriteKey: "a",
  color: "green",
  tint: 25,
  flipX: -1,
  seed: 2.1,
  stops: 4,
  dwellDepth: .8,
  travelOffset: .25,
  paintBias: -1,
  path: beamPaths[1],
  bodyPath: anchors([[.879, .2217, .9273, .2832, .7629, .0736], [.6132, .9824, .7389, .9232, .5659, 1.0047], [.4494, .3705, .5293, .4841, .284, .1346], [.1985, .9902, .2848, 1.0457, .1301, .9462]])
}];
let clamp01 = t => Math.max(0, Math.min(1, t));
let lerp = (t, e, l) => t + (e - t) * l;
let smoothstep = t => {
  let e = clamp01(t);
  return e * e * (3 - 2 * e);
};
let progressBetween = (t, e, l) => clamp01((t - e) / (l - e));
function softClamp(t, e, l, r) {
  let o = t;
  return o > l - r && (o = l - r * Math.exp(-(o - (l - r)) / r)), o < e + r && (o = e + r * Math.exp(-(e + r - o) / r)), o;
}
function paintEndFor(t) {
  return (13 + (t.paintBias ?? 0)) / 15;
}
function travelState(t, e, l) {
  if (e > l) return {
    pos: lerp(1, 0, smoothstep(progressBetween(e, l, 1))),
    dwell: 0
  };
  let r = t.stops ?? 3,
    o = t.dwellDepth ?? .9,
    i = 2 * Math.PI * (t.travelOffset ?? 0),
    n = progressBetween(e, 0, l),
    s = 2 * Math.PI * r * n + i;
  return {
    pos: clamp01(n - o / (2 * Math.PI * r) * (Math.sin(s) - Math.sin(i))),
    dwell: clamp01(o * Math.cos(s))
  };
}
function rasterSprite(t, e) {
  let l = t.rasters[e];
  if (l) return l;
  let r = t.frames[e];
  if (!r.complete || 0 === r.naturalWidth) return null;
  let {
      vbW: o,
      vbH: i
    } = t.meta,
    n = document.createElement("canvas");
  n.width = o, n.height = i;
  let s = n.getContext("2d");
  return s ? (s.drawImage(r, 0, 0, o, i), t.rasters[e] = n, n) : null;
}
function shadowSprite(t, e) {
  let l = t.shadows[e];
  if (l) return l;
  let r = t.frames[e];
  if (!r.complete || 0 === r.naturalWidth) return null;
  let {
      vbW: o,
      vbH: i
    } = t.meta,
    n = document.createElement("canvas");
  n.width = o, n.height = i;
  let s = n.getContext("2d");
  return s ? (s.drawImage(r, 0, 0, o, i), s.globalCompositeOperation = "source-in", s.fillStyle = t.shadowColor, s.fillRect(0, 0, n.width, n.height), t.shadows[e] = n, n) : null;
}
function animatedNozzle(t, e) {
  let {
      meta: l
    } = t.set,
    r = l.nozzleFrames?.[t.frame];
  if (!r) return t.nozzle;
  let o = .269 * t.scale,
    i = e * (r.x - l.nozzle.x) * l.vbW * o,
    n = (r.y - l.nozzle.y) * l.vbH * o,
    s = Math.cos(t.swingRad),
    a = Math.sin(t.swingRad);
  return {
    x: t.nozzle.x + i * s - n * a,
    y: t.nozzle.y + i * a + n * s
  };
}
let beamCanvas = null;
let beamContext = null;
let withAlpha = (t, e) => t.replace(/\)$/, ` / ${e})`);
function drawBeam(ctx, nozzle, spot, intensity, beamColor, pool) {
  if (intensity <= .001) return;
  let n = 50 * intensity * (pool?.size ?? 1),
    s = pool?.along ?? 1,
    a = pool?.across ?? 1,
    c = 1 !== s || 1 !== a,
    d = 1.55 * n,
    h = d * Math.max(s, a),
    f = Math.min(1, intensity / .35),
    p = ctx.getTransform(),
    w = p.a;
  (!beamCanvas || beamCanvas.width < ctx.canvas.width || beamCanvas.height < ctx.canvas.height) && ((beamCanvas = document.createElement("canvas")).width = ctx.canvas.width, beamCanvas.height = ctx.canvas.height, beamContext = beamCanvas.getContext("2d"));
  let M = beamContext;
  if (!M) return;
  let Z = Math.max(0, Math.floor((Math.min(nozzle.x, spot.x - h) - 4) * w + p.e)),
    m = Math.max(0, Math.floor((Math.min(nozzle.y, spot.y - h) - 4) * w + p.f)),
    u = Math.min(beamCanvas.width - Z, Math.ceil((Math.max(nozzle.x, spot.x + h) + 4) * w + p.e) - Z),
    x = Math.min(beamCanvas.height - m, Math.ceil((Math.max(nozzle.y, spot.y + h) + 4) * w + p.f) - m);
  if (u <= 0 || x <= 0) return;
  M.setTransform(1, 0, 0, 1, 0, 0), M.clearRect(Z, m, u, x), M.setTransform(p);
  let y = spot.x - nozzle.x,
    j = spot.y - nozzle.y,
    g = Math.hypot(y, j) || 1,
    v = t => {
      if (M.beginPath(), c) {
        M.save(), M.translate(spot.x, spot.y), M.rotate(Math.atan2(j, y)), M.scale(s, a);
        let e = -g / s;
        if (-e > 1.02 * t) {
          let l = Math.acos(-(t / e));
          M.moveTo(e, 0), M.lineTo(t * Math.cos(Math.PI + l), t * Math.sin(Math.PI + l)), M.arc(0, 0, t, Math.PI + l, Math.PI - l, !1), M.closePath();
        } else M.arc(0, 0, t, 0, 2 * Math.PI);
        M.restore();
        return;
      }
      if (g > 1.02 * t) {
        let r = Math.acos(t / g),
          o = Math.atan2(nozzle.y - spot.y, nozzle.x - spot.x);
        M.moveTo(nozzle.x, nozzle.y), M.lineTo(spot.x + t * Math.cos(o + r), spot.y + t * Math.sin(o + r)), M.arc(spot.x, spot.y, t, o + r, o - r, !1), M.closePath();
      } else M.arc(spot.x, spot.y, t, 0, 2 * Math.PI);
    };
  M.fillStyle = beamColor ? withAlpha(beamColor, .16) : `rgba(${BEAM_RGB}, 0.16)`, v(d), M.fill(), M.fillStyle = beamColor ? withAlpha(beamColor, .3) : `rgba(${BEAM_RGB}, 0.3)`, v(1.2 * n), M.fill();
  let T = M.createLinearGradient(nozzle.x, nozzle.y, spot.x + y / g * n * s, spot.y + j / g * n * s);
  T.addColorStop(0, beamColor ? withAlpha(beamColor, .7) : "rgba(234, 247, 243, 0.7)"), T.addColorStop(1, beamColor ? withAlpha(beamColor, .38) : "rgba(185, 232, 226, 0.38)"), M.fillStyle = T, v(n), M.fill(), ctx.save(), ctx.setTransform(1, 0, 0, 1, 0, 0), ctx.globalCompositeOperation = "overlay", ctx.globalAlpha = f, ctx.drawImage(beamCanvas, Z, m, u, x, Z, m, u, x), ctx.restore();
}
function drawSprite(ctx, frame, facing, offsetX, offsetY, draw) {
  let {
    meta: n
  } = frame.set;
  ctx.save(), ctx.translate(frame.nozzle.x + offsetX, frame.nozzle.y + offsetY), ctx.rotate(frame.swingRad);
  let s = .269 * frame.scale;
  ctx.scale(facing * s, s);
  let a = rasterSprite(frame.set, frame.frame);
  a && draw(a, n), ctx.restore();
}
export function beamArrivalU(x, y, stamps) {
  let r = 1 / 0,
    o = 1;
  for (let i of stamps) {
    let l = i.x - x,
      n = i.y - y,
      s = l * l + n * n;
    s < r && (r = s, o = i.u);
  }
  return r > 3906.25 ? 1 / 0 : Math.min(1, o + Math.sqrt(r) / 62.5 * .045);
}
// phase is normalized to the original 15-second loop. Boxes and canvas geometry
// use CSS pixels; bleed is applied to both the beam and body coordinates.
// Sprite sets: { hover, active }, each holding { meta, frames, rasters, shadows,
// shadowColor }. meta supplies vbW/vbH, normalized nozzle, faces, nozzleFrames?.
export function drawDrones(ctx, drones, sprites, phase, boxes, width, height, bleed, beamColor, scale = 1, overrides) {
  let h = drones.map((t, e) => {
      let c = droneFrame(t, sprites[e], phase, boxes[e], width, height, bleed, overrides?.[e]);
      return c.scale *= scale, c;
    }),
    f = h.map((t, l) => drones[l].flipX * t.set.meta.faces);
  drawDroneFrames(ctx, h, f, beamColor);
}
export function dronePathPosition(drone, phase) {
  return travelState(drone, phase, paintEndFor(drone)).pos;
}
export function paintProgress(phase) {
  return progressBetween(phase, 0, PAINT_END);
}
export function paintProgressFor(drone, phase) {
  return progressBetween(phase, 0, paintEndFor(drone));
}
export function prerasterDroneSprites(sprites) {
  let e = new Set();
  for (let l of sprites) for (let t of [l.hover, l.active]) if (!e.has(t)) {
    e.add(t);
    for (let e = 0; e < t.frames.length; e++) rasterSprite(t, e), shadowSprite(t, e);
  }
}
export function stampsFor(drones, boxes) {
  let l = [];
  for (let r = 0; r < drones.length; r++) {
    let o = drones[r],
      n = boxes[r],
      s = getSampler(o.path, n.w / n.h);
    for (let t = 0; t <= 100; t++) {
      let e = t / 100,
        {
          fx: r,
          fy: o
        } = s.at(e);
      l.push({
        x: n.x + r * n.w,
        y: n.y + o * n.h,
        u: e
      });
    }
  }
  return l;
}
// Extracted from the original drawDrones closure. Its scale is intrinsic only;
// a caller-controlled display scale is multiplied by drawDrones afterwards.
export function droneFrame(drone, sprites, phase, box, width, height, bleed, override) {
  let c = box.w / box.h,
    d = override && phase >= override.atPhase ? override : null,
    k = d ? d.atPhase : paintEndFor(drone),
    h = function (t, e, l, r) {
      let o = getSampler(t.path, l);
      if (e <= r) return o.at(progressBetween(e, 0, r));
      let n = smoothstep(progressBetween(e, r, 1)),
        s = o.at(1),
        a = o.at(0);
      return {
        fx: lerp(s.fx, a.fx, n),
        fy: lerp(s.fy, a.fy, n)
      };
    }(drone, phase, c, k),
    f = {
      x: box.x + h.fx * box.w + bleed,
      y: box.y + h.fy * box.h + bleed
    },
    {
      pos: b,
      dwell: p
    } = travelState(drone, phase, k),
    w = getSampler(drone.bodyPath, c),
    M = w.at(b);
  if (phase > k || d) {
    let t = smoothstep(progressBetween(phase, k, 1)),
      e = w.at(d ? d.fromPos : 1),
      r = w.at(0);
    M = {
      fx: lerp(e.fx, r.fx, t),
      fy: lerp(e.fy, r.fy, t)
    };
  }
  let Z = 1.2 * (smoothstep(progressBetween(phase, 0, .04)) * (1 - smoothstep(progressBetween(phase, k - .03, k)))) * (.25 + .75 * p) * Math.sin(2 * Math.PI * 5 * phase * 15 + 4.3 * drone.seed),
    m = phase < k ? sprites.active : sprites.hover,
    u = Math.floor(15 * phase * 8) % m.frames.length,
    x = .5 - .5 * Math.cos(2 * Math.PI * 2 * b + drone.seed),
    y = 1 - .02 * x,
    j = 30 * lerp(1, .85, x),
    g = sprites.hover.meta,
    L = Math.max(g.nozzle.x, 1 - g.nozzle.x) * g.vbW * .269 | 0,
    I = Math.max(g.nozzle.y, 1 - g.nozzle.y) * g.vbH * .269 | 0,
    O = {
      x: softClamp(box.x + M.fx * box.w + bleed, L, width + 2 * bleed - L, 40),
      y: softClamp(box.y + M.fy * box.h + bleed + Z, I, height + 2 * bleed - I, 40)
    },
    P = {
      x: width / 2 + bleed,
      y: -.45 * width
    },
    S = O.x - P.x,
    R = O.y - P.y,
    C = Math.hypot(S, R) || 1;
  return {
    spot: f,
    nozzle: O,
    frame: u,
    set: m,
    intensity: function (t, e, l) {
      let r = clamp01(Math.min(progressBetween(t, 0, .03), 1 - progressBetween(t, l - .025, l)));
      if (r <= 0) return 0;
      let o = 15 * t;
      return r * (1 - .16 * (.6 * (.5 + .5 * Math.sin(41 * o + 5 * e)) + .4 * (.5 + .5 * Math.sin(67 * o + 11 * e))));
    }(phase, drone.seed, k),
    swingRad: 6 * Math.PI / 180 * Math.sin(2 * Math.PI * 3 * phase + 2.1 * drone.seed),
    scale: y,
    shadow: {
      dx: S / C * j,
      dy: R / C * j
    }
  };
}
// Preserve original pass order: darkened shadows, overlay beams, then sprites.
// Exposed separately so accessible drag controls can override frame positions.
export function drawDroneFrames(ctx, frames, facings, beamColor) {
  ctx.save(), ctx.globalCompositeOperation = "darken";
  for (let e = 0; e < frames.length; e++) {
    let l = frames[e],
      r = shadowSprite(l.set, l.frame);
    r && drawSprite(ctx, l, facings[e], l.shadow.dx, l.shadow.dy, (e, l) => {
      ctx.drawImage(r, -l.nozzle.x * l.vbW, -l.nozzle.y * l.vbH, l.vbW, l.vbH);
    });
  }
  ctx.restore();
  for (let e = 0; e < frames.length; e++) {
    let l = frames[e];
    drawBeam(ctx, animatedNozzle(l, facings[e]), l.spot, l.intensity, beamColor);
  }
  for (let e = 0; e < frames.length; e++) drawSprite(ctx, frames[e], facings[e], 0, 0, (e, l) => {
    ctx.drawImage(e, -l.nozzle.x * l.vbW, -l.nozzle.y * l.vbH, l.vbW, l.vbH);
  });
}
export const LOOP_SECONDS = 15;
export { DRONES, PAINT_END, getSampler };
