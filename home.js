import "../style.css";
import * as THREE from "three";

// ---------- 3D HERO: CubeSat in LEO (stylized demo) ----------
const mount = document.getElementById("hero3d");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0f18);

const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 1900);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
mount.appendChild(renderer.domElement);

// Lights
scene.add(new THREE.HemisphereLight(0xffffff, 0x1a1f2b, 0.9));
const sun = new THREE.DirectionalLight(0xffffff, 1.2);
sun.position.set(3, 2, 4);
scene.add(sun);

// Earth (simple sphere)
const earth = new THREE.Mesh(
  new THREE.SphereGeometry(1.1, 48, 48),
  new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.9, metalness: 0.0 })
);
earth.position.set(-0.6, -1.4, -1.2);
scene.add(earth);

// Stars/points
const starGeo = new THREE.BufferGeometry();
const starCount = 2000;
const starPos = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
  starPos[i * 3 + 0] = (Math.random() - 0.5) * 120;
  starPos[i * 3 + 1] = (Math.random() - 0.5) * 120;
  starPos[i * 3 + 2] = (Math.random() - 0.5) * 120;
}
starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
const stars = new THREE.Points(
  starGeo,
  new THREE.PointsMaterial({ size: 0.08, opacity: 0.9, transparent: true })
);
scene.add(stars);

// CubeSat (box + panels)
const sat = new THREE.Group();
scene.add(sat);

const body = new THREE.Mesh(
  new THREE.BoxGeometry(0.25, 0.25, 0.35),
  new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 0.6, metalness: 0.2 })
);
sat.add(body);

const panelMat = new THREE.MeshStandardMaterial({ color: 0x60a5fa, roughness: 0.7, metalness: 0.1 });
const leftPanel = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.22, 0.5), panelMat);
leftPanel.position.set(-0.175, 0, 0);
sat.add(leftPanel);

const rightPanel = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.22, 0.5), panelMat);
rightPanel.position.set(0.175, 0, 0);
sat.add(rightPanel);

// Responsive sizing (hero container)
const ro = new ResizeObserver(() => {
  const w = mount.clientWidth;
  const h = mount.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
});
ro.observe(mount);

// Orbiting camera (around satellite)
let t = 0;
function animate() {
  requestAnimationFrame(animate);
  t += 0.006;

  const r = 1.2;
  camera.position.set(
    Math.cos(t) * r,
    0.35 + Math.sin(t * 0.7) * 0.12,
    Math.sin(t) * r
  );
  camera.lookAt(0, 0, 0);

  sat.rotation.y += 0.01;
  earth.rotation.y += 0.002;

  renderer.render(scene, camera);
}
animate();

// ---------- Exaggerated problem counter ----------
const impactEl = document.getElementById("impactCount");
const effEl = document.getElementById("efficiency");
const lifeEl = document.getElementById("lifetime");

let impacts = 0;
let efficiency = 100.0;
let lifetime = 12;

function tickCounters() {
  // Exaggeration: impacts ramp quickly
  impacts += Math.floor(30 + Math.random() * 70);

  // Efficiency decays with impacts (demo math)
  efficiency = Math.max(55, 100 - impacts * 0.003);

  // Lifetime “shrinks” as efficiency drops (demo math)
  lifetime = Math.max(6, Math.round(6 + (efficiency - 55) * 0.18));

  impactEl.textContent = impacts.toLocaleString();
  effEl.textContent = efficiency.toFixed(1);
  lifeEl.textContent = lifetime.toString();

  // Update stats section too
  document.getElementById("statCollisions").textContent = `${Math.round(impacts / 1000)}k (demo)`;
  document.getElementById("statSaved").textContent = `${(100 - efficiency).toFixed(1)}% at-risk avoided (demo framing)`;
  document.getElementById("statLongevity").textContent = `+${Math.max(0, lifetime - 9)} months (demo)`;
}
setInterval(tickCounters, 120);

// ---------- Before/After slider ----------
const range = document.getElementById("compareRange");
const afterLayer = document.getElementById("afterLayer");

function updateCompare(val) {
  // clip right side based on slider
  afterLayer.style.clipPath = `inset(0 ${100 - val}% 0 0)`;
}
updateCompare(range.value);
range.addEventListener("input", (e) => updateCompare(e.target.value));
