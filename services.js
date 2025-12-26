import "../style.css";
import * as THREE from "three";

const mount = document.getElementById("product3d");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0f172a);

const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 2000);
camera.position.set(0.8, 0.6, 1.3);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
mount.appendChild(renderer.domElement);

// Lights
scene.add(new THREE.HemisphereLight(0xffffff, 0x222233, 0.9));
const light = new THREE.DirectionalLight(0xffffff, 1.2);
light.position.set(2, 3, 4);
scene.add(light);

// A simple "assembly" made of parts (replace with real models later)
const assembly = new THREE.Group();
scene.add(assembly);

function part(color, w, h, d) {
  return new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.15 })
  );
}

// Base body
const body = part(0x9ca3af, 0.26, 0.26, 0.36);
assembly.add(body);

// Panels
const panelL = part(0x60a5fa, 0.02, 0.22, 0.5);
const panelR = part(0x60a5fa, 0.02, 0.22, 0.5);
panelL.position.set(-0.18, 0, 0);
panelR.position.set(0.18, 0, 0);
assembly.add(panelL, panelR);

// Frame components (demo)
const frameTop = part(0x22c55e, 0.28, 0.02, 0.38);
const frameBot = part(0x22c55e, 0.28, 0.02, 0.38);
frameTop.position.set(0, 0.16, 0);
frameBot.position.set(0, -0.16, 0);
assembly.add(frameTop, frameBot);

// Resize observer for container
const ro = new ResizeObserver(() => {
  const w = mount.clientWidth;
  const h = mount.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
});
ro.observe(mount);

// Scroll-to-explode mapping (0..1)
function getScrollProgress() {
  const rect = mount.getBoundingClientRect();
  const viewH = window.innerHeight;
  // 0 when container top hits bottom of screen, 1 when bottom hits top
  const raw = (viewH - rect.top) / (viewH + rect.height);
  return Math.min(1, Math.max(0, raw));
}

function applyExplosion(p) {
  // p: 0 (assembled) -> 1 (exploded)
  const s = p * 0.6;

  panelL.position.x = -0.18 - s;
  panelR.position.x = 0.18 + s;

  frameTop.position.y = 0.16 + s * 0.7;
  frameBot.position.y = -0.16 - s * 0.7;

  assembly.rotation.y = -0.6 + p * 1.2;
}

function animate() {
  requestAnimationFrame(animate);

  const p = getScrollProgress();
  applyExplosion(p);

  renderer.render(scene, camera);
}
animate();

// Simple UI toggles
document.getElementById("showPricing")?.addEventListener("click", () => {
  const el = document.getElementById("pricing");
  el.style.display = el.style.display === "none" ? "block" : "none";
});
document.getElementById("requestQuote")?.addEventListener("click", () => {
  alert("Request quote: wire this to a Contact form or email next.");
});