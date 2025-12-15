"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export const dynamic = "force-dynamic";

export default function ARPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- THREE SETUP ---
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

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);

    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.15, 0.15),
      new THREE.MeshStandardMaterial()
    );
    cube.position.set(0, 0, -0.7);
    scene.add(cube);

    // --- SIMPLE AR BUTTON (INLINE, NO IMPORTS) ---
    const button = document.createElement("button");
    button.innerText = "Enter AR";
    button.style.position = "absolute";
    button.style.bottom = "20px";
    button.style.left = "50%";
    button.style.transform = "translateX(-50%)";
    button.style.padding = "12px 18px";
    button.style.fontSize = "16px";
    button.style.zIndex = "10";

    button.onclick = async () => {
      if (!navigator.xr) {
        alert("WebXR not supported");
        return;
      }

      const session = await navigator.xr.requestSession("immersive-ar", {
        requiredFeatures: ["local-floor"],
      });

      renderer.xr.setSession(session);
    };

    document.body.appendChild(button);

    renderer.setAnimationLoop(() => {
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    });

    return () => {
      renderer.setAnimationLoop(null);
      renderer.dispose();
      button.remove();
    };
  }, []);

  return <div ref={containerRef} className="w-screen h-screen" />;
}
