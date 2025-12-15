"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export const dynamic = "force-dynamic";

export default function ARPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.01,
      20
    );

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1));

    const objects: Record<string, THREE.Object3D> = {};

    // ---------- LOAD REAL MODELS ----------
    const loadModels = async () => {
      const { GLTFLoader } = await import(
        "three/examples/jsm/loaders/GLTFLoader.js"
      );

      const loader = new GLTFLoader();

      const load = (
        word: string,
        url: string,
        x: number
      ) =>
        new Promise<void>((resolve) => {
          loader.load(url, (gltf) => {
            const model = gltf.scene;
            model.scale.set(0.15, 0.15, 0.15);
            model.position.set(x, 0, -0.7);
            model.userData.word = word;
            scene.add(model);
            objects[word] = model;
            resolve();
          });
        });

      await load("der Laptop", "/models/laptop.glb", -0.3);
      await load("das Buch", "/models/book.glb", 0);
      await load("das Handy", "/models/phone.glb", 0.3);
    };

    loadModels();

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

    ["der Laptop", "das Buch", "das Handy"].forEach((word) => {
      const btn = document.createElement("button");
      btn.innerText = word;
      btn.style.padding = "10px 14px";
      btn.style.borderRadius = "20px";
      btn.style.border = "none";
      btn.style.cursor = "pointer";
      btn.style.background = "#eee";
      btn.onclick = () => select(word);
      buttons[word] = btn;
      ui.appendChild(btn);
    });

    const select = (word: string) => {
      Object.values(objects).forEach((o) =>
        o.traverse((c: any) => {
          if (c.material) c.material.emissive?.set(0x000000);
        })
      );
      Object.values(buttons).forEach(
        (b) => (b.style.background = "#eee")
      );

      objects[word]?.traverse((c: any) => {
        if (c.material) c.material.emissive?.set(0x00ffcc);
      });
      buttons[word].style.background = "#00ffcc";
    };

    // ---------- AR BUTTON ----------
    const arBtn = document.createElement("button");
    arBtn.innerText = "Enter AR";
    arBtn.style.position = "absolute";
    arBtn.style.bottom = "20px";
    arBtn.style.left = "50%";
    arBtn.style.transform = "translateX(-50%)";
    arBtn.style.padding = "12px 18px";
    arBtn.style.zIndex = "10";

    arBtn.onclick = async () => {
      if (!("xr" in navigator)) {
        alert("WebXR not supported");
        return;
      }

      const session = await navigator.xr!.requestSession("immersive-ar", {
        requiredFeatures: ["local-floor"],
      });

      renderer.xr.setSession(session);
    };

    document.body.appendChild(arBtn);

    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });

    return () => {
      renderer.dispose();
      ui.remove();
      arBtn.remove();
    };
  }, []);

  return <div ref={containerRef} className="w-screen h-screen" />;
}
