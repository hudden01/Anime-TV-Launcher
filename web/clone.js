// Naruto's shadow clones, from Vivek's green-screen clips (keyed to transparent WebM by
// source-4k/naruto-clips/make_clone_clips.sh). Like the crow, a clone stands on top of the selected tile.
// Each time the selection moves the old clone vanishes and a new one is summoned on the new icon: a burst of white
// smoke bigger than him, and he fades in behind it - a random form (one of Vivek's clips) and facing. He then stands
// still, breathing with his
// cloak moving (the "idle" clip, looping), and after about five seconds performs his move (the "act" clip:
// Rasenshuriken, Tailed Beast Bomb, tails bursting out...) before going back to standing; the move repeats every
// 5-8 seconds. A form without a move just keeps standing.
// Everything here is DOM + video, so the GPU and the video decoder do the work.
window.makeClone = function (box, opts) {
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = (n, not) => { let v; do v = Math.random() * n | 0; while (n > 1 && v === not); return v; };
  const forms = opts.forms.map(f => {
    const root = document.createElement("div"), ent = document.createElement("div"), flip = document.createElement("div");
    root.className = "cl"; ent.className = "ent"; flip.className = "flip";
    const vid = (name, loop) => {
      const v = Object.assign(document.createElement("video"),
        { src: opts.dir + f.name + "-" + name + ".webm", muted: true, loop, playsInline: true, preload: "auto",
          poster: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" });   // transparent poster: no grey play-button placeholder
      const rate = () => { v.playbackRate = v.defaultPlaybackRate = opts.speed || 1; };   // the clips play faster than recorded
      rate(); v.addEventListener("loadedmetadata", rate);
      return v;
    };
    const idle = vid("idle", true), act = f.act ? vid("act", false) : null;
    idle.className = "idle";
    flip.append(idle); if (act) { act.className = "act"; flip.append(act); }
    ent.append(flip); root.append(ent); box.append(root);
    return Object.assign({}, f, { root, ent, flip, idle, act });   // the config's act flag must not replace the video
  });
  let cur = null, lastForm = -1, x = 0, y = 0, timer = 0, paused = false;

  // every clip was scaled the same way (half size), so a frame of 360 px tall maps to opts.size of the screen
  // (scale evens out clips where Gemini framed him bigger, so every clone is the same size)
  function size(f) { const fr = (f && f.frame) || [500, 360], k = innerHeight * opts.size / 360 * ((f && f.scale) || 1); return [fr[0] * k, fr[1] * k]; }
  // foot[0] is the middle of his whole figure across the clip, so sitting and lying poses are centred on the icon
  // too; mirrored clips use the mirrored position
  function place(f) {
    const [w, h] = size(f), fx = f.dir < 0 ? 1 - f.foot[0] : f.foot[0];
    Object.assign(f.root.style, { width: w + "px", height: h + "px",
      transform: `translate(${Math.round(x - w * fx)}px,${Math.round(y - h * f.foot[1])}px)` });
  }

  // the summoning smoke: a burst of white clouds covering more than the whole clone, swelling and clearing
  // (CSS-animated divs, drawn above him so he can fade in behind it)
  function poof(f) {
    const [w, h] = size(f), fx = f.dir < 0 ? 1 - f.foot[0] : f.foot[0];
    const bodyH = h * f.foot[1] * .9, bodyW = Math.max(w * .5, bodyH * .6), big = Math.max(bodyH, bodyW);
    const cx0 = x + (0.5 - fx) * w * .3, cy0 = y - bodyH * .5;          // middle of his body
    for (let i = 0; i < 11; i++) {
      const p = document.createElement("div"), r = big * rnd(.32, .5);
      p.className = "puff";
      Object.assign(p.style, { left: cx0 - r + rnd(-.5, .5) * bodyW + "px", top: cy0 - r + rnd(-.55, .45) * bodyH + "px", width: r * 2 + "px", height: r * 2 + "px" });
      p.style.setProperty("--dx", rnd(-.25, .25) * big + "px"); p.style.setProperty("--dy", -rnd(.05, .3) * big + "px");
      p.style.animationDelay = rnd(0, .03) + "s";
      p.addEventListener("animationend", () => p.remove());
      opts.smokeBox.appendChild(p);
    }
  }

  // he fades in behind the smoke once it has built up
  function enter(f) {
    f.ent.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: "ease-out", fill: "backwards" });
  }

  function stop(f) {
    f.root.style.display = "none"; f.idle.pause(); f.flip.classList.remove("acting");
    if (f.act) { f.act.pause(); f.act.classList.remove("on"); }
  }
  function idleThenAct(f, wait) {
    clearTimeout(timer);
    if (!f.act) return;
    timer = setTimeout(() => {                    // stood still long enough: perform the move
      if (cur !== f || paused) return;
      f.act.currentTime = 0;
      // the move replaces the standing clip (which fades out underneath) for its whole length
      f.act.play().then(() => { f.act.classList.add("on"); f.flip.classList.add("acting"); setTimeout(() => cur === f && f.act.classList.contains("on") && f.idle.pause(), 200); }).catch(() => {});
    }, wait * 1000);
  }
  forms.forEach(f => f.act && f.act.addEventListener("ended", () => {   // back to standing, and again in a while
    if (cur !== f) return;
    f.idle.play().catch(() => {}); f.act.classList.remove("on"); f.flip.classList.remove("acting");
    idleThenAct(f, rnd(5, 8));
  }));

  function perch(px, py) {
    if (cur) stop(cur);                             // the old clone just goes; the smoke is only where the new one lands
    x = px; y = py;
    const f = forms[lastForm = pick(forms.length, lastForm)];
    f.dir = Math.random() < .5 ? -1 : 1;
    f.flip.style.transform = f.dir < 0 ? "scaleX(-1)" : "";
    place(f);
    f.root.style.display = "block";
    // (no seek here: resuming where the clip paused shows him at once, a seek has to decode first)
    if (!paused) f.idle.play().catch(() => {});
    cur = f;
    poof(f); enter(f);
    idleThenAct(f, rnd(4.5, 5.5));
  }

  return {
    perch,
    resize() { if (cur) place(cur); },
    pause() { paused = true; clearTimeout(timer); if (cur) { cur.idle.pause(); cur.flip.classList.remove("acting"); if (cur.act) { cur.act.pause(); cur.act.classList.remove("on"); } } },
    resume() { paused = false; if (cur) { cur.idle.play().catch(() => {}); idleThenAct(cur, rnd(4.5, 5.5)); } }
  };
};
