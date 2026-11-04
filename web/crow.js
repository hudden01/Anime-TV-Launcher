// Itachi's crow: an anime-style, all-black crow drawn on a canvas.
// It perches on the selected item, idles like a real crow (looks around, preens, ruffles, stretches, caws, hops round),
// and flies to the next item when the selection moves. First appearance is a summon: smoke and a burst of feathers.
// The model is drawn facing right, feet at (0,0), about 90 units tall; S converts units to screen px.
window.makeCrow = function (canvas, opts = {}) {
  const cx = canvas.getContext("2d");
  const rnd = (a, b) => a + Math.random() * (b - a);
  const ease = t => t < .5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
  const env = (t, d) => Math.sin(Math.PI * Math.min(1, Math.max(0, t / d)));   // 0 -> 1 -> 0 over an action
  const lerp = (a, b, t) => a + (b - a) * t;
  let W = 0, H = 0, S = 1, T = 0;
  let state = "hidden";              // hidden | summon | perch | takeoff | fly | land
  let x = 0, y = 0, dir = -1, settle = null, fly = null, stT = 0, act = null, nextAct = 2, blinkAt = 2, target = null;
  const feathers = [], smoke = [];
  const C = { body: "#0a0a0f", wing: "#111118", far: "#060609", edge: "rgba(70,78,100,.55)", rim: "rgba(150,170,210,.55)", eye: opts.eye || "#c3111f" };

  // The canvas is a small box that follows the bird; it covers the whole screen only while the
  // summon's smoke and feathers are flying about.
  let dpr = 1, full = null, bw = 0, bh = 0, ox = 0, oy = 0;
  function resize() {
    W = innerWidth; H = innerHeight;
    dpr = Math.min(2, devicePixelRatio || 1);
    S = H * (opts.size || .078) / 90;
    full = null;
  }
  function frameBox(wantFull) {
    if (wantFull !== full) {
      full = wantFull;
      bw = full ? W : Math.ceil(300 * S); bh = full ? H : Math.ceil(300 * S);
      canvas.width = Math.round(bw * dpr); canvas.height = Math.round(bh * dpr);
      Object.assign(canvas.style, { left: "0", top: "0", right: "auto", bottom: "auto", width: bw + "px", height: bh + "px" });
    }
    ox = full ? 0 : Math.round(x - bw / 2); oy = full ? 0 : Math.round(y - bh * .62);
    canvas.style.transform = `translate(${ox}px,${oy}px)`;
    cx.setTransform(dpr, 0, 0, dpr, -ox * dpr, -oy * dpr);   // keep drawing in screen coordinates
  }

  // ---------- moving between perches ----------
  function perch(px, py) {
    if (state === "hidden") { x = px; y = py; return summon(); }
    target = [px, py];
    if (state === "perch" && Math.hypot(px - x, py - y) < 30 * S) { settle = [px, py]; return; }   // small shift: just step there
    if (state === "fly" || state === "land" || state === "takeoff") return startFly(true);
    state = "takeoff"; stT = 0; act = null;
    dir = px > x ? 1 : px < x ? -1 : dir;
  }
  function startFly(midair) {
    const [tx, ty] = target, d = Math.hypot(tx - x, ty - y);
    const lift = Math.min(H * .16, 30 + d * .35);
    fly = { x0: x, y0: y, cx: (x + tx) / 2, cy: Math.min(y, ty) - lift, x1: tx, y1: ty,
            dur: Math.min(1.15, Math.max(.45, d / (H * 1.25))), t: 0, phase: midair && fly ? fly.phase : 0 };
    dir = tx > x ? 1 : tx < x ? -1 : dir;
    state = "fly";
    if (!midair) for (let i = 0; i < 2; i++) dropFeather(x, y - 40 * S, .5);
  }
  function summon() {
    state = "summon"; stT = 0;
    for (let i = 0; i < 12; i++) smoke.push({ x: x + rnd(-30, 30) * S, y: y - rnd(10, 70) * S, r: rnd(18, 34) * S, g: rnd(40, 90) * S, life: rnd(.7, 1.1), t: 0 });
    for (let i = 0; i < 16; i++) dropFeather(x, y - 40 * S, 1.6);
  }
  function dropFeather(fx, fy, burst) {
    const a = rnd(0, 6.283), sp = rnd(20, 90) * burst * S;
    feathers.push({ x: fx + rnd(-15, 15) * S, y: fy + rnd(-15, 15) * S, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 30 * S,
                    rot: rnd(0, 6.283), vr: rnd(-3, 3), size: rnd(.7, 1.2), life: rnd(1.6, 2.6), t: 0, ph: rnd(0, 6) });
  }

  // ---------- idle behaviour ----------
  const ACTS = [
    ["look", 1.8, 4], ["preen", 2.2, 3], ["ruffle", .7, 2], ["stretch", 1.6, 2], ["caw", 1.0, 2], ["hop", .45, 2], ["flick", .5, 2]
  ];
  function pickAct() {
    const total = ACTS.reduce((s, a) => s + a[2], 0); let r = Math.random() * total;
    for (const a of ACTS) if ((r -= a[2]) < 0) return { name: a[0], dur: a[1], t: 0, v: rnd(-1, 1) };
  }

  function step(dt) {
    T += dt; stT += dt;
    if (state === "summon" && stT > .75) { state = "perch"; nextAct = rnd(1.2, 2.5); }
    if (state === "takeoff" && stT > .14) startFly(false);
    if (state === "fly") {
      const f = fly; f.t += dt; f.phase += dt * 2 * Math.PI * 5.5;
      const k = ease(Math.min(1, f.t / f.dur)), u = 1 - k;
      x = u * u * f.x0 + 2 * u * k * f.cx + k * k * f.x1;
      y = u * u * f.y0 + 2 * u * k * f.cy + k * k * f.y1;
      if (f.t >= f.dur) { x = f.x1; y = f.y1; state = "land"; stT = 0; }
    }
    if (state === "land" && stT > .35) { state = "perch"; nextAct = rnd(.8, 2); }
    if (state === "perch" && settle) {
      const k = Math.min(1, dt * 8); x += (settle[0] - x) * k; y += (settle[1] - y) * k;
      if (Math.hypot(settle[0] - x, settle[1] - y) < .3) settle = null;
    }
    if (state === "perch") {
      if (act) { act.t += dt; if (act.name === "hop" && act.t > act.dur / 2 && !act.turned) { dir = -dir; act.turned = true; }
                 if (act.name === "ruffle" && !act.fx) { act.fx = 1; for (let i = 0; i < 3; i++) dropFeather(x, y - 40 * S, .4); }
                 if (act.t >= act.dur) { act = null; nextAct = rnd(1.4, 3.6); } }
      else if ((nextAct -= dt) <= 0) act = pickAct();
    }
    if (T > blinkAt + .13) blinkAt = T + rnd(2, 5);
    for (let i = feathers.length - 1; i >= 0; i--) {
      const p = feathers[i]; p.t += dt;
      p.vx *= 1 - dt * 1.5; p.vy = Math.min(p.vy + 140 * S * dt, 40 * S);       // flutter down slowly
      p.x += (p.vx + Math.sin(p.t * 3 + p.ph) * 25 * S) * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      if (p.t > p.life) feathers.splice(i, 1);
    }
    for (let i = smoke.length - 1; i >= 0; i--) { const p = smoke[i]; p.t += dt; p.r += p.g * dt; if (p.t > p.life) smoke.splice(i, 1); }
  }

  // ---------- pose for this frame ----------
  function pose() {
    const p = { headAng: 0, hx: 0, hy: 0, beak: 0, puff: 1 + .015 * Math.sin(T * 2.4), wing: 0, flap: 0, fan: 0, lift: 0,
                tail: .05 * Math.sin(T * 1.3), crouch: 0, tilt: 0, legs: "perch", jump: 0, scale: 1, blink: T > blinkAt };
    if (state === "summon") {
      const k = Math.min(1, stT / .75); p.scale = .35 + .65 * ease(k);
      p.wing = 1 - ease(k); p.flap = Math.sin(stT * 30) * (1 - k); p.fan = 1;
    } else if (state === "takeoff") {
      p.crouch = stT / .14; p.wing = stT / .14 * .6;
    } else if (state === "fly") {
      const f = fly, k = f.t / f.dur;
      p.wing = 1; p.fan = 1; p.legs = "tuck";
      const glide = k > .78 ? (k - .78) / .22 : 0;                       // brake before landing: wings up, legs out
      p.flap = lerp(Math.sin(f.phase), .9, glide);
      p.tilt = lerp(-.25 * Math.cos(Math.PI * k), .35, glide);
      if (glide > .3) p.legs = "reach";
      p.hy = 2 * Math.sin(f.phase);
    } else if (state === "land") {
      const k = stT / .35; p.wing = 1 - ease(k); p.flap = .9 * (1 - k); p.fan = 1 - k;
      p.crouch = env(stT, .35) * .8; p.tail = .4 * env(stT, .35);
    } else if (state === "perch" && act) {
      const t = act.t, d = act.dur, e = env(t, d);
      switch (act.name) {
        case "look":    p.headAng = act.v * .45 * Math.min(1, t / .2) * Math.min(1, (d - t) / .2); break;
        case "preen":   p.headAng = -2.0 * e; p.hx = -7 * e; p.hy = 12 * e; p.lift = .45 * e;
                        p.headAng += .12 * Math.sin(t * 26) * (e > .8); break;
        case "ruffle":  p.puff += .09 * e * (1 + Math.sin(t * 60)) / 2; p.headAng = .15 * Math.sin(t * 40) * e; p.tail = .3 * Math.sin(t * 45) * e; p.lift = .2 * e; break;
        case "stretch": p.wing = .75 * e; p.flap = -.55; p.fan = e; p.tail = .25 * e; p.headAng = .2 * e; break;
        case "caw":     p.headAng = -.35 * e; p.beak = Math.max(0, Math.sin(t * 13)) * e; p.crouch = .25 * Math.max(0, Math.sin(t * 13)) * e; p.tail = .25 * p.beak; break;
        case "hop":     p.jump = 14 * Math.sin(Math.PI * t / d); p.wing = .3 * e; p.flap = .4; break;
        case "flick":   p.tail = .55 * Math.sin(t * 25) * e; break;
      }
    }
    return p;
  }

  // ---------- drawing (model space) ----------
  function poly(pts, fill) { cx.beginPath(); pts.forEach((q, i) => i ? cx.lineTo(q[0], q[1]) : cx.moveTo(q[0], q[1])); cx.closePath(); cx.fillStyle = fill; cx.fill(); }
  // a spread wing from the shoulder: open = 0 folded back, 1 fully spread; flap -1 (down) .. 1 (up).
  // Built from layered, round-tipped feathers: coverts on the arm, secondaries along it, primaries fanning from the hand.
  function feather(x0, y0, ang, len, w, fill) {
    cx.save(); cx.translate(x0, y0); cx.rotate(ang);
    cx.beginPath(); cx.moveTo(0, -w * .5);
    cx.quadraticCurveTo(len * .7, -w * .7, len, 0); cx.quadraticCurveTo(len * .7, w * .7, 0, w * .5); cx.closePath();
    cx.fillStyle = fill; cx.fill();
    cx.strokeStyle = C.edge; cx.lineWidth = .7; cx.stroke();
    cx.restore();
  }
  function wing(open, flap, fan, lift, color, far) {
    const sx = 4, sy = -52;
    const fold = Math.PI - .32 - lift * .5;
    let spread = Math.atan2(-flap * .95, -.38);
    if (spread < 0) spread += 2 * Math.PI;                                  // keep it on the back side (atan2(-0, x) is -PI)
    const th = lerp(fold, spread, open);
    const len = lerp(40, 44 * (.62 + .38 * Math.abs(flap)) + 8, open) * (far ? .9 : 1);
    const ux = Math.cos(th), uy = Math.sin(th);
    let px = uy, py = -ux; if (px > .1) { px = -px; py = -py; }           // trailing edge side
    const tr = Math.atan2(py, px);
    const wx = sx + ux * len, wy = sy + uy * len;                           // wrist
    const pl = lerp(26, 40, open) * (.75 + .25 * fan);                      // primary length
    // primaries: from the wrist, fanning from straight out toward the trailing edge
    for (let i = 5; i >= 0; i--) {
      const f = i / 5, a = th + (tr - th) * (f * .7 * (.4 + .6 * fan)) * (Math.abs(tr - th) < Math.PI ? 1 : -1);
      feather(wx - ux * f * 6, wy - uy * f * 6, a, pl * (1 - f * .25), 7.5, color);
    }
    // secondaries along the arm, pointing to the trailing side
    for (let i = 0; i < 5; i++) {
      const f = .2 + i * .17, bx = sx + ux * len * f, by = sy + uy * len * f;
      feather(bx, by, tr + (th - tr) * .25 * (1 - f), lerp(14, 24, open), 8, color);
    }
    // coverts: the solid arm of the wing over the feather bases
    cx.beginPath(); cx.moveTo(sx - px * 4, sy - py * 4); cx.lineTo(wx - px * 3, wy - py * 3);
    cx.quadraticCurveTo(wx + px * 10, wy + py * 10, wx - ux * 10 + px * 12, wy - uy * 10 + py * 12);
    cx.quadraticCurveTo(sx + ux * len * .4 + px * 14, sy + uy * len * .4 + py * 14, sx + px * 9, sy + py * 9);
    cx.closePath(); cx.fillStyle = color; cx.fill();
    if (!far) { cx.strokeStyle = C.rim; cx.lineWidth = 1.1; cx.beginPath(); cx.moveTo(sx - px * 4, sy - py * 4); cx.lineTo(wx - px * 3, wy - py * 3); cx.stroke(); }
  }
  function foldedWing(lift) {
    cx.save(); cx.translate(14, -56); cx.rotate(-lift * .6); cx.translate(-14, 56);
    poly([[16, -58], [2, -60], [-16, -50], [-34, -36], [-50, -24], [-44, -21], [-48, -18], [-38, -17], [-40, -14],
          [-24, -17], [-6, -22], [8, -32], [17, -45]], C.wing);
    cx.strokeStyle = C.edge; cx.lineWidth = .9; cx.beginPath();
    for (const [a, b, c, d] of [[4, -44, -42, -22], [2, -38, -38, -17], [8, -34, -30, -18]]) { cx.moveTo(a, b); cx.lineTo(c, d); }  // primaries
    for (let i = 0; i < 4; i++) { const bx = 12 - i * 7, by = -52 + i * 4; cx.moveTo(bx + 4, by - 2); cx.quadraticCurveTo(bx, by + 5, bx - 6, by + 3); }   // covert scallops
    cx.stroke();
    cx.strokeStyle = C.rim; cx.lineWidth = 1.2; cx.beginPath(); cx.moveTo(14, -59); cx.quadraticCurveTo(-14, -56, -48, -24); cx.stroke();
    cx.restore();
  }
  function drawCrow(p) {
    cx.save();
    cx.translate(x, y - p.jump * S);
    cx.scale(dir * S * p.scale, S * p.scale);
    // legs
    cx.strokeStyle = "#141419"; cx.lineWidth = 2.6; cx.lineCap = "round"; cx.beginPath();
    const cr = p.crouch * 5;
    if (p.legs === "perch") {
      for (const [lx, fx] of [[5, 7], [-4, -2]]) {
        cx.moveTo(lx, -17 + cr); cx.lineTo(fx, 0);
        cx.moveTo(fx - 1, 0); cx.lineTo(fx + 9, 1); cx.moveTo(fx, 0); cx.lineTo(fx + 7, -2); cx.moveTo(fx, 0); cx.lineTo(fx - 6, 1);
      }
    } else if (p.legs === "reach") {
      cx.moveTo(4, -17); cx.lineTo(12, -4); cx.moveTo(-3, -17); cx.lineTo(4, -3);
      cx.moveTo(12, -4); cx.lineTo(19, -2); cx.moveTo(4, -3); cx.lineTo(11, -1);
    } else { cx.moveTo(0, -18); cx.lineTo(-14, -12); cx.moveTo(-5, -19); cx.lineTo(-18, -15); }
    cx.stroke();
    cx.translate(0, cr);
    cx.translate(0, -35); cx.rotate(p.tilt); cx.scale(1, p.puff); cx.translate(0, 35);
    // far wing behind the body
    if (p.wing >= .22) { cx.save(); cx.translate(-3, -2); wing(p.wing, p.flap, p.fan, p.lift, C.far, true); cx.restore(); }
    // tail
    cx.save(); cx.translate(-20, -30); cx.rotate(-p.tail);
    poly([[0, -10], [-30, -6], [-44, -2], [-48, 4], [-44, 8], [-46, 12], [-30, 10], [0, 6]], C.body);
    cx.strokeStyle = C.edge; cx.lineWidth = .8; cx.beginPath(); cx.moveTo(-6, -2); cx.lineTo(-44, 3); cx.moveTo(-6, 2); cx.lineTo(-42, 9); cx.stroke();
    cx.restore();
    // body
    cx.beginPath();
    cx.moveTo(30, -64);                                                   // throat
    cx.bezierCurveTo(36, -50, 30, -28, 14, -18);                          // chest
    cx.bezierCurveTo(2, -11, -16, -14, -26, -26);                         // belly to vent
    cx.bezierCurveTo(-24, -42, -10, -60, 6, -70);                         // back
    cx.bezierCurveTo(14, -74, 24, -72, 30, -64);                          // nape
    cx.closePath(); cx.fillStyle = C.body; cx.fill();
    cx.strokeStyle = "rgba(60,66,86,.45)"; cx.lineWidth = .8; cx.beginPath();   // ruffled throat hackles
    for (let i = 0; i < 4; i++) { cx.moveTo(30 - i * 1.5, -58 + i * 5); cx.lineTo(26 - i * 2, -54 + i * 5); }
    cx.stroke();
    cx.strokeStyle = C.rim; cx.lineWidth = 1.4; cx.beginPath();          // moonlight on the back
    cx.moveTo(-25, -32); cx.bezierCurveTo(-18, -48, -6, -62, 8, -70); cx.stroke();
    // near wing: folded on the body while perched, a real spread wing when flying or stretching
    if (p.wing < .22) foldedWing(p.lift); else wing(p.wing, p.flap, p.fan, p.lift, C.wing, false);
    // head
    cx.save(); cx.translate(14, -60); cx.rotate(p.headAng); cx.translate(-14 + p.hx, 60 + p.hy);
    cx.beginPath(); cx.ellipse(22, -72, 17, 15, -.25, 0, 6.283); cx.fillStyle = C.body; cx.fill();
    poly([[6, -80], [0, -85], [11, -84], [8, -90], [17, -86]], C.body);    // ruffled crown feathers
    cx.strokeStyle = C.rim; cx.lineWidth = 1.2; cx.beginPath(); cx.ellipse(22, -72, 17, 15, -.25, 3.5, 5.3); cx.stroke();
    // beak: heavy, slightly hooked crow bill; the lower mandible opens for a caw
    cx.save(); cx.translate(34, -66); cx.rotate(p.beak * .45);
    poly([[0, -1], [14, 1], [22, 2.5], [0, 6]], "#121217"); cx.restore();
    cx.beginPath(); cx.moveTo(32, -78); cx.quadraticCurveTo(48, -77, 61, -66.5); cx.quadraticCurveTo(50, -67, 34, -66); cx.closePath();
    cx.fillStyle = "#18181f"; cx.fill();
    poly([[30, -79], [40, -79], [36, -74]], "#0a0a0f");                   // nasal bristles
    cx.strokeStyle = "rgba(170,180,205,.4)"; cx.lineWidth = .8; cx.beginPath(); cx.moveTo(36, -76); cx.quadraticCurveTo(48, -75, 58, -67.5); cx.stroke();
    // eye
    if (!p.blink) {
      cx.beginPath(); cx.arc(27, -75, 3.2, 0, 6.283); cx.fillStyle = C.eye; cx.fill();
      cx.beginPath(); cx.arc(27, -75, 1.2, 0, 6.283); cx.fillStyle = "#200"; cx.fill();
      cx.beginPath(); cx.arc(26, -76.2, .9, 0, 6.283); cx.fillStyle = "#fff"; cx.fill();
    } else { cx.strokeStyle = "#2a2a33"; cx.lineWidth = 1; cx.beginPath(); cx.moveTo(24, -75); cx.lineTo(30, -75); cx.stroke(); }
    cx.restore();
    cx.restore();
  }
  function drawFeather(f) {
    const a = Math.min(1, (f.life - f.t) / .5);
    cx.save(); cx.translate(f.x, f.y); cx.rotate(f.rot); cx.scale(S * f.size, S * f.size); cx.globalAlpha = a;
    cx.beginPath(); cx.ellipse(0, 0, 9, 2.6, 0, 0, 6.283); cx.fillStyle = "#0c0c11"; cx.fill();
    cx.strokeStyle = "rgba(110,120,145,.6)"; cx.lineWidth = .6; cx.beginPath(); cx.moveTo(-11, 0); cx.lineTo(8, 0); cx.stroke();
    cx.restore(); cx.globalAlpha = 1;
  }
  function draw() {
    frameBox(smoke.length > 0 || feathers.length > 0);
    cx.clearRect(ox, oy, bw, bh);
    for (const s of smoke) {
      const a = .55 * (1 - s.t / s.life);
      const g = cx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r);
      g.addColorStop(0, `rgba(18,18,24,${a})`); g.addColorStop(1, "rgba(18,18,24,0)");
      cx.fillStyle = g; cx.fillRect(s.x - s.r, s.y - s.r, s.r * 2, s.r * 2);
    }
    if (state !== "hidden") drawCrow(pose());
    for (const f of feathers) drawFeather(f);
  }
  return { resize, perch, step, draw, get busy() { return state !== "perch"; } };
};
