/* ─── CURSOR ─── */
const $cur = document.getElementById("cursor"),
  $ring = document.getElementById("cursor-ring");
let cX = 0,
  cY = 0,
  rX = 0,
  rY = 0;
document.addEventListener(
  "mousemove",
  (e) => {
    cX = e.clientX;
    cY = e.clientY;
  },
  { passive: true },
);
(function animCur() {
  rX += (cX - rX) * 0.12;
  rY += (cY - rY) * 0.12;
  $cur.style.cssText = `left:${cX}px;top:${cY}px`;
  $ring.style.cssText = `left:${rX}px;top:${rY}px`;
  requestAnimationFrame(animCur);
})();

/* ─── THREE.JS HERO ─── */
(function initThree() {
  if (!window.THREE) return;
  const canvas = document.getElementById("three-canvas");
  if (!canvas || !canvas.offsetWidth) return;
  const W = canvas.offsetWidth,
    H = canvas.offsetHeight;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(W, H);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(48, W / H, 0.1, 1000);
  camera.position.z = 5.2;
  const G1 = 0xd4af37,
    G2 = 0xb8960c,
    G3 = 0xf0c843;

  /* Core octahedron */
  const coreMesh = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.55, 2),
    new THREE.MeshBasicMaterial({
      color: G1,
      wireframe: true,
      transparent: true,
      opacity: 0.28,
    }),
  );
  scene.add(coreMesh);
  const innerCore = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.28, 0),
    new THREE.MeshBasicMaterial({
      color: G2,
      transparent: true,
      opacity: 0.14,
    }),
  );
  scene.add(innerCore);

  /* Rings */
  const ringData = [
    [1.0, G1, 0.5],
    [0.7, G2, 0.3],
    [1.3, G3, 0.18],
  ];
  const rings = ringData.map(([r, c, o], i) => {
    const m = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.006 + i * 0.002, 8, 80),
      new THREE.MeshBasicMaterial({
        color: c,
        transparent: true,
        opacity: o,
      }),
    );
    m.rotation.x = (i * Math.PI) / 3.5;
    m.rotation.y = (i * Math.PI) / 4;
    scene.add(m);
    return m;
  });

  /* Orbiting cubes */
  const cube1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.18, 0.18),
    new THREE.MeshBasicMaterial({
      color: G1,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    }),
  );
  scene.add(cube1);
  const cube2 = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.12, 0.12),
    new THREE.MeshBasicMaterial({
      color: G3,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    }),
  );
  scene.add(cube2);

  /* Floating panels */
  [
    [0.6, 0.35, 1.5, 0.4, -0.8, 0.2],
    [0.45, 0.25, -1.4, -0.3, -0.6, -0.15],
    [0.5, 0.3, 0.8, -1.1, -0.5, 0.4],
    [0.35, 0.2, -0.6, 0.9, -0.7, -0.3],
  ].forEach(([w, h, ox, oy, oz, rz]) => {
    const g = new THREE.PlaneGeometry(w, h);
    const m = new THREE.Mesh(
      g,
      new THREE.MeshBasicMaterial({
        color: G2,
        transparent: true,
        opacity: 0.06,
        side: THREE.DoubleSide,
      }),
    );
    m.position.set(ox, oy, oz);
    m.rotation.z = rz;
    scene.add(m);
    const e = new THREE.LineSegments(
      new THREE.EdgesGeometry(g),
      new THREE.LineBasicMaterial({
        color: G1,
        transparent: true,
        opacity: 0.28,
      }),
    );
    e.position.copy(m.position);
    e.rotation.copy(m.rotation);
    scene.add(e);
  });

  /* Icosphere */
  scene.add(
    new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.85, 1),
      new THREE.MeshBasicMaterial({
        color: G1,
        wireframe: true,
        transparent: true,
        opacity: 0.04,
      }),
    ),
  );

  /* Particles */
  const N = 1800,
    pPos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const phi = Math.acos(-1 + (2 * i) / N),
      theta = Math.sqrt(N * Math.PI) * phi;
    const r = 2.0 + Math.random() * 0.6;
    pPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    pPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    pPos[i * 3 + 2] = r * Math.cos(phi);
  }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
  scene.add(
    new THREE.Points(
      pg,
      new THREE.PointsMaterial({
        color: G1,
        size: 0.015,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true,
      }),
    ),
  );

  /* Network nodes */
  const nodePos = [
    new THREE.Vector3(1.6, 0.8, -0.5),
    new THREE.Vector3(-1.4, 0.6, -0.4),
    new THREE.Vector3(0.5, -1.5, -0.3),
    new THREE.Vector3(-0.8, -1.2, -0.6),
    new THREE.Vector3(1.2, -0.7, -0.8),
    new THREE.Vector3(-1.5, -0.4, -0.3),
    new THREE.Vector3(0.3, 1.7, -0.5),
  ];
  const nodeMeshes = nodePos.map((pos) => {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 8, 8),
      new THREE.MeshBasicMaterial({
        color: G1,
        transparent: true,
        opacity: 0.55,
      }),
    );
    m.position.copy(pos);
    scene.add(m);
    return m;
  });
  [
    [0, 2],
    [1, 3],
    [2, 4],
    [3, 5],
    [4, 6],
    [0, 6],
    [1, 4],
  ].forEach(([a, b]) => {
    scene.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([nodePos[a], nodePos[b]]),
        new THREE.LineBasicMaterial({
          color: G2,
          transparent: true,
          opacity: 0.12,
        }),
      ),
    );
  });

  /* Pulse rings */
  const pulseRingMats = [0.6, 0.9, 1.2].map((r) => {
    const m = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.003, 6, 60),
      new THREE.MeshBasicMaterial({
        color: G1,
        transparent: true,
        opacity: 0,
      }),
    );
    scene.add(m);
    return m.material;
  });

  let mx = 0,
    my = 0,
    tx = 0,
    ty = 0,
    tick = 0,
    pulseT = 0;
  document.addEventListener(
    "mousemove",
    (e) => {
      mx = (e.clientX / innerWidth - 0.5) * 2;
      my = (e.clientY / innerHeight - 0.5) * 2;
    },
    { passive: true },
  );

  (function animate() {
    requestAnimationFrame(animate);
    tick += 0.005;
    pulseT += 0.022;
    tx += (mx * 0.18 - tx) * 0.045;
    ty += (my * 0.12 - ty) * 0.045;

    coreMesh.rotation.x = tick * 0.3 + ty * 0.4;
    coreMesh.rotation.y = tick * 0.5 + tx;
    coreMesh.rotation.z = tick * 0.15;
    innerCore.rotation.x = -tick * 0.4;
    innerCore.rotation.y = tick * 0.6;
    innerCore.scale.setScalar(1 + 0.1 * Math.sin(tick * 3));

    rings[0].rotation.z = tick * 0.15 + tx * 0.3;
    rings[0].rotation.x = tick * 0.1 + ty * 0.2;
    rings[1].rotation.y = tick * 0.25 + tx * 0.4;
    rings[1].rotation.z = tick * 0.12;
    rings[2].rotation.x = tick * 0.08 + ty * 0.3;
    rings[2].rotation.z = tick * 0.2;

    const r1 = 1.4 + 0.1 * Math.sin(tick * 2);
    cube1.position.x = Math.cos(tick * 0.7) * r1;
    cube1.position.y = Math.sin(tick * 0.5) * 0.5;
    cube1.position.z = Math.sin(tick * 0.7) * r1;
    cube1.rotation.x += 0.02;
    cube1.rotation.y += 0.03;
    cube2.position.x = Math.cos(tick * 0.9 + Math.PI) * 1.1;
    cube2.position.y = Math.sin(tick * 1.1) * 0.7;
    cube2.position.z = Math.sin(tick * 0.9 + Math.PI) * 1.1;
    cube2.rotation.z += 0.025;

    pulseRingMats.forEach((m, i) => {
      const ph = (pulseT + i * 0.8) % (Math.PI * 2);
      m.opacity = Math.max(0, 0.35 * Math.sin(ph) * (1 - ph / (Math.PI * 2)));
    });
    nodeMeshes.forEach((m, i) => {
      m.material.opacity = 0.4 + 0.25 * Math.sin(tick * 1.5 + i * 0.8);
    });

    renderer.render(scene, camera);
  })();
  window.addEventListener("resize", () => {
    const W2 = canvas.offsetWidth,
      H2 = canvas.offsetHeight;
    if (!W2 || !H2) return;
    renderer.setSize(W2, H2);
    camera.aspect = W2 / H2;
    camera.updateProjectionMatrix();
  });
})();

/* ─── GSAP ─── */
function bootGSAP() {
  if (!window.gsap) {
    setTimeout(bootGSAP, 80);
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  gsap.to("#progress-bar", {
    width: "100%",
    ease: "none",
    scrollTrigger: {
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      scrub: 0.35,
    },
  });

  ScrollTrigger.create({
    start: 80,
    onEnter: () =>
      document.getElementById("site-header").classList.add("scrolled"),
    onLeaveBack: () =>
      document.getElementById("site-header").classList.remove("scrolled"),
  });

  const loaderTl = gsap.timeline({ onComplete: revealHero });
  loaderTl
    .to("#loader-fill", {
      width: "100%",
      duration: 1.1,
      ease: "power3.inOut",
    })
    .to(
      "#loader-count",
      {
        textContent: 100,
        duration: 1.1,
        snap: { textContent: 1 },
        ease: "power2.inOut",
        onUpdate() {
          document.getElementById("loader-count").textContent =
            Math.round(+this.targets()[0].textContent) + "%";
        },
      },
      "<",
    )
    .to("#loader", {
      yPercent: -100,
      duration: 0.85,
      ease: "power4.inOut",
      delay: 0.18,
    })
    .to("#site-header", { opacity: 1, duration: 0.5 }, "-=.3");

  function revealHero() {
    gsap
      .timeline()
      .to("#hero-eyebrow", {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
      })
      .to(
        "#hero-h1",
        {
          opacity: 1,
          clipPath: "inset(0 0 0% 0)",
          duration: 0.9,
          ease: "power4.out",
        },
        "-=.35",
      )
      .to(
        "#hero-sub",
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
        "-=.45",
      )
      .to(
        "#hero-ctas",
        { opacity: 1, y: 0, duration: 0.65, ease: "power3.out" },
        "-=.4",
      )
      .to(
        "#hero-stats",
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
        "-=.35",
      )
      .to(
        "#hero-right",
        { opacity: 1, duration: 0.9, ease: "power3.out" },
        "-=.8",
      )
      .to("#scroll-hint", { opacity: 1, duration: 0.6 }, "-=.2");
    setTimeout(runCounters, 800);
  }

  gsap.to("#hero-left", {
    yPercent: -12,
    ease: "none",
    scrollTrigger: {
      trigger: "#hero",
      start: "top top",
      end: "bottom top",
      scrub: 1,
    },
  });
  gsap.to("#hero-right", {
    yPercent: -6,
    ease: "none",
    scrollTrigger: {
      trigger: "#hero",
      start: "top top",
      end: "bottom top",
      scrub: 1.4,
    },
  });
  gsap.to(".glow-1", {
    yPercent: 20,
    ease: "none",
    scrollTrigger: {
      trigger: "#hero",
      start: "top top",
      end: "bottom top",
      scrub: 2,
    },
  });

  /* Services pinned horizontal */
  const svcTrack = document.getElementById("svc-track");
  if (svcTrack) {
    const dist = svcTrack.scrollWidth - window.innerWidth + 120;
    if (dist > 0)
      gsap.to(svcTrack, {
        x: -dist,
        ease: "none",
        scrollTrigger: {
          trigger: "#services",
          start: "top top",
          end: `+=${dist}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      });
  }

  gsap.utils.toArray(".sa").forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 36 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          toggleActions: "play none none reverse",
        },
      },
    );
  });

  gsap.utils.toArray(".port-item").forEach((el, i) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 28, scale: 0.97 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.65,
        delay: i * 0.04,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
      },
    );
  });
}
bootGSAP();

/* ─── COUNTERS ─── */
function runCounters() {
  document.querySelectorAll("[data-target],[data-val]").forEach((el) => {
    const v = parseInt(el.dataset.target || el.dataset.val);
    if (isNaN(v)) return;
    const dur = 1400;
    let s = null;
    (function step(ts) {
      if (!s) s = ts;
      const p = Math.min((ts - s) / dur, 1),
        e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(e * v);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = v;
    })(performance.now());
  });
}
function runCounterOne(el, v) {
  if (el._counted) return;
  el._counted = true;
  const dur = 1400;
  let s = null;
  (function step(ts) {
    if (!s) s = ts;
    const p = Math.min((ts - s) / dur, 1),
      e = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(e * v);
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = v;
  })(performance.now());
}
document.querySelectorAll("[data-val]").forEach((el) => {
  new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting)
          runCounterOne(e.target, parseInt(e.target.dataset.val || 0));
      });
    },
    { threshold: 0.5 },
  ).observe(el);
});

/* ─── HEADER FALLBACK ─── */
const hdr = document.getElementById("site-header");
window.addEventListener(
  "scroll",
  () => hdr.classList.toggle("scrolled", scrollY > 60),
  { passive: true },
);

/* ─── BURGER ─── */
const burger = document.getElementById("burger"),
  mnav = document.getElementById("main-nav");
burger.addEventListener("click", () => {
  burger.classList.toggle("open");
  mnav.classList.toggle("open");
});
mnav.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    burger.classList.remove("open");
    mnav.classList.remove("open");
  }),
);

/* ─── SMOOTH SCROLL ─── */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const t = document.querySelector(a.getAttribute("href"));
    if (t) {
      e.preventDefault();
      scrollTo({ top: t.offsetTop - 72, behavior: "smooth" });
    }
  });
});

/* ─── ACTIVE NAV ─── */
document.querySelectorAll('section[id],div[id="services"]').forEach((s) => {
  new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          document
            .querySelectorAll(".main-nav a")
            .forEach((a) => a.classList.remove("active"));
          const act = document.querySelector(`.main-nav a[href="#${s.id}"]`);
          if (act) act.classList.add("active");
        }
      });
    },
    { threshold: 0.3, rootMargin: "-72px 0px 0px 0px" },
  ).observe(s);
});

/* ─── 3D TILT ─── */
const tiltCard = document.getElementById("tilt-card"),
  tiltShine = document.getElementById("tilt-shine");
if (tiltCard) {
  tiltCard.addEventListener("mousemove", (e) => {
    const r = tiltCard.getBoundingClientRect(),
      x = (e.clientX - r.left) / r.width - 0.5,
      y = (e.clientY - r.top) / r.height - 0.5;
    tiltCard.style.transform = `perspective(900px) rotateY(${x * 16}deg) rotateX(${-y * 11}deg) scale(1.025)`;
    tiltShine.style.background = `radial-gradient(circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%,rgba(255,255,255,.08),transparent 60%)`;
  });
  tiltCard.addEventListener("mouseleave", () => {
    tiltCard.style.transform =
      "perspective(900px) rotateY(0) rotateX(0) scale(1)";
    tiltShine.style.background =
      "radial-gradient(circle at 30% 30%,rgba(255,255,255,.05),transparent 60%)";
  });
}

/* ─── MAGNETIC BUTTONS ─── */
document
  .querySelectorAll(".btn-primary,.btn-secondary,.btn-grad,.nav-cta a")
  .forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      if (!window.gsap) return;
      const r = btn.getBoundingClientRect();
      gsap.to(btn, {
        x: (e.clientX - r.left - r.width / 2) * 0.3,
        y: (e.clientY - r.top - r.height / 2) * 0.3,
        duration: 0.3,
        ease: "power2.out",
      });
    });
    btn.addEventListener("mouseleave", () => {
      if (!window.gsap) return;
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.55,
        ease: "elastic.out(1,.4)",
      });
    });
  });

/* ─── SCROLL REVEAL FALLBACK ─── */
document.querySelectorAll(".sa").forEach((el) => {
  new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("in");
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -48px 0px" },
  ).observe(el);
});

/* ─── FORM TOAST ─── */
const urlP = new URLSearchParams(location.search);
if (urlP.get("success") || urlP.get("error")) {
  const ok = !!urlP.get("success"),
    toast = document.createElement("div");
  toast.className = "toast-msg " + (ok ? "tok" : "terr");
  toast.textContent = ok
    ? "✓ Message sent! We'll be in touch soon."
    : "✗ Something went wrong. Please try again.";
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 5500);
}
