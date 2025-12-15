"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export const dynamic = "force-dynamic";

export default function ARPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // ---------- THREE SETUP ----------
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.01,
      20
    );

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;

    containerRef.current.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1));

    // ---------- OBJECTS ----------
    const objects: Record<string, THREE.Mesh> = {};

    const createObject = (word: string, x: number) => {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.1, 0.02),
        new THREE.MeshStandardMaterial({ color: 0x888888 })
      );
      mesh.position.set(x, 0, -0.7);
      mesh.userData.word = word;
      scene.add(mesh);
      objects[word] = mesh;
    };

    createObject("der Laptop", -0.3);
    createObject("das Buch", 0);
    createObject("das Handy", 0.3);

    // ---------- UI BUBBLES ----------
    const ui = document.createElement("div");
    ui.style.position = "absolute";
    ui.style.right = "20px";
    ui.style.top = "50%";
    ui.style.transform = "translateY(-50%)";
    ui.style.display = "flex";
    ui.style.flexDirection = "column";
    ui.style.gap = "12px";
    ui.style.zIndex = "10";
    document.body.appendChild(ui);

    const buttons: Record<string, HTMLButtonElement> = {};

    Object.keys(objects).forEach((word) => {
      const btn = document.createElement("button");
      btn.innerText = word;
      btn.style.padding = "10px 14px";
      btn.style.borderRadius = "20px";
      btn.style.border = "none";
      btn.style.fontSize = "14px";
      btn.style.cursor = "pointer";
      btn.style.background = "#eee";

      btn.onclick = () => select(word);

      buttons[word] = btn;
      ui.appendChild(btn);
    });

    // ---------- SELECTION ----------
    const select = (word: string) => {
      Object.values(objects).forEach(
        (o) =>
          ((o.material as THREE.MeshStandardMaterial).color.set(0x888888))
      );
      Object.values(buttons).forEach(
        (b) => (b.style.background = "#eee")
      );

      (objects[word].material as THREE.MeshStandardMaterial).color.set(0x00ffcc);
      buttons[word].style.background = "#00ffcc";
    };

    // ---------- RAYCAST (CLICK 3D OBJECT) ----------
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(Object.values(objects));

      if (hits.length > 0) {
        select(hits[0].object.userData.word);
      }
    };

    window.addEventListener("click", onClick);

    // ---------- AR BUTTON ----------
    const arBtn = document.createElement("button");
    arBtn.innerText = "Enter AR";
    arBtn.style.position = "absolute";
    arBtn.style.bottom = "20px";
    arBtn.style.left = "50%";
    arBtn.style.transform = "translateX(-50%)";
    arBtn.style.padding = "12px 18px";
    arBtn.style.fontSize = "16px";
    arBtn.style.zIndex = "10";

    arBtn.onclick = async () => {
      if (!("xr" in navigator)) {
        alert("WebXR not supported");
        return;
      }

      const xr = navigator.xr!;
      const session = await xr.requestSession("immersive-ar", {
        requiredFeatures: ["local-floor"],
      });

      renderer.xr.setSession(session);
    };

    document.body.appendChild(arBtn);

    // ---------- LOOP ----------
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });

    return () => {
      renderer.setAnimationLoop(null);
      renderer.dispose();
      ui.remove();
      arBtn.remove();
      window.removeEventListener("click", onClick);
    };
  }, []);

  return <div ref={containerRef} className="w-screen h-screen" />;
}
