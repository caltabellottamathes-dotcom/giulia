import { useEffect, useRef } from "react";
import * as THREE from "three";
import { daysSince } from "@/lib/domainUtils";

// LIFE-kleuren voor de node/edge-materialen (three.js werkt met losse hex,
// niet met CSS-tokens) — Ridge Sky, Whipped Pistachio, Olive, Urgent.
const LIFE = { ridgeSky: "#b1bec6", pistachio: "#d8dab3", olive: "#94925d", urgent: "#d5e24a" };

function hexLerp(a, b, t) {
  return new THREE.Color(a).lerp(new THREE.Color(b), Math.max(0, Math.min(1, t)));
}

function makeLabelSprite(text, accent) {
  // Donkere pil achter de tekst zodat het label leesbaar blijft op de
  // lichte OS-achtergrond, ongeacht de node-kleur erachter.
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const fontSize = 42;
  ctx.font = `600 ${fontSize}px 'Space Grotesk', sans-serif`;
  const textW = ctx.measureText(text).width;
  const padX = 22, padY = 14;
  canvas.width = Math.ceil(textW) + padX * 2;
  canvas.height = fontSize + padY * 2;
  const r = canvas.height / 2;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.arcTo(canvas.width, 0, canvas.width, canvas.height, r);
  ctx.arcTo(canvas.width, canvas.height, 0, canvas.height, r);
  ctx.arcTo(0, canvas.height, 0, 0, r);
  ctx.arcTo(0, 0, canvas.width, 0, r);
  ctx.closePath();
  ctx.fillStyle = "rgba(20,20,20,0.62)";
  ctx.fill();
  if (accent) { ctx.strokeStyle = accent; ctx.lineWidth = 2; ctx.stroke(); }
  ctx.font = `600 ${fontSize}px 'Space Grotesk', sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "middle";
  ctx.fillText(text, padX, canvas.height / 2 + 1);
  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(mat);
  const scale = 0.011;
  sprite.scale.set(canvas.width * scale, canvas.height * scale, 1);
  return sprite;
}

/**
 * RelationshipGraph3D — §5.2 3D Relationship Map. Nodes = close-circle
 * contacten, edge-dikte via nearest-neighbour-web, kleur = recency-zone
 * (Ridge Sky → Whipped Pistachio → Olive), Urgent-gloed bij overdue.
 * Roteerbaar via pointer-drag, licht auto-rotate wanneer los.
 */
export default function RelationshipGraph3D({ contacts = [], onHover, onSelect }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || !contacts.length) return;
    const width = mount.clientWidth || 400, height = mount.clientHeight || 400;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 9);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const n = contacts.length;
    const nodeMeshes = [];
    contacts.forEach((c, i) => {
      const since = daysSince(c.last_meaningful_contact_date || c.last_contact_date);
      const freq = c.desired_frequency_days || c.contact_rhythm_days || 30;
      const overdue = since != null && since > freq;
      const t = since == null ? 0.7 : Math.min(1, since / 60);
      let color;
      if (t > 0.66) color = hexLerp(LIFE.pistachio, LIFE.olive, (t - 0.66) / 0.34);
      else if (t > 0.33) color = hexLerp(LIFE.ridgeSky, LIFE.pistachio, (t - 0.33) / 0.33);
      else color = new THREE.Color(LIFE.ridgeSky);
      const sizeBase = 0.16 + Math.max(0, 1 - t) * 0.14;

      const phi = Math.acos(1 - (2 * (i + 0.5)) / n);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = 2.2 + t * 2.4;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      const geo = new THREE.SphereGeometry(sizeBase, 20, 20);
      const mat = new THREE.MeshStandardMaterial({
        color, roughness: 0.5, metalness: 0.1,
        emissive: overdue ? new THREE.Color(LIFE.urgent) : new THREE.Color(0x000000),
        emissiveIntensity: overdue ? 0.85 : 0,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      mesh.userData = { contact: c };
      group.add(mesh);
      nodeMeshes.push(mesh);

      const label = makeLabelSprite(c.name || "?", overdue ? LIFE.urgent : null);
      label.position.copy(mesh.position).add(new THREE.Vector3(0, sizeBase + 0.22, 0));
      group.add(label);
    });

    const K = Math.min(3, n - 1);
    const lineMat = new THREE.LineBasicMaterial({ color: new THREE.Color(LIFE.olive), transparent: true, opacity: 0.35 });
    if (K > 0) {
      nodeMeshes.forEach((m, i) => {
        const dists = nodeMeshes.map((m2, j) => ({ j, d: i === j ? Infinity : m.position.distanceTo(m2.position) }));
        dists.sort((a, b) => a.d - b.d);
        dists.slice(0, K).forEach(({ j }) => {
          const geometry = new THREE.BufferGeometry().setFromPoints([m.position, nodeMeshes[j].position]);
          group.add(new THREE.Line(geometry, lineMat));
        });
      });
    }

    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const pt = new THREE.PointLight(0xffffff, 1.1);
    pt.position.set(5, 5, 8);
    scene.add(pt);

    let dragging = false, lastX = 0, lastY = 0, driftX = 0.0016;
    const raycaster = new THREE.Raycaster();

    const onDown = (e) => { dragging = true; lastX = e.clientX; lastY = e.clientY; };
    const onUp = () => { dragging = false; };
    const onMove = (e) => {
      if (dragging) {
        const dx = e.clientX - lastX, dy = e.clientY - lastY;
        group.rotation.y += dx * 0.005;
        group.rotation.x += dy * 0.005;
        lastX = e.clientX; lastY = e.clientY;
        driftX = dx * 0.0002;
      }
      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(nodeMeshes);
      if (hits.length) {
        onHover?.(hits[0].object.userData.contact, { x: e.clientX, y: e.clientY });
        renderer.domElement.style.cursor = "pointer";
      } else {
        onHover?.(null);
        renderer.domElement.style.cursor = dragging ? "grabbing" : "grab";
      }
    };
    const onClick = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(nodeMeshes);
      if (hits.length) onSelect?.(hits[0].object.userData.contact);
    };
    renderer.domElement.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    renderer.domElement.addEventListener("pointermove", onMove);
    renderer.domElement.addEventListener("click", onClick);

    let raf;
    const tick = () => {
      if (!dragging) group.rotation.y += driftX || 0.0016;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    const onResize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointerup", onUp);
      renderer.domElement.removeEventListener("pointerdown", onDown);
      renderer.domElement.removeEventListener("pointermove", onMove);
      renderer.domElement.removeEventListener("click", onClick);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [contacts, onHover, onSelect]);

  return <div ref={mountRef} className="w-full h-full" />;
}