import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Floating3DCan() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();

    // Camera setup
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 500;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 7);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // Clear existing children
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // Group for can assembly
    const canGroup = new THREE.Group();
    scene.add(canGroup);

    // Texture loader for PRIRP logo
    const textureLoader = new THREE.TextureLoader();
    
    // Create label texture on canvas
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");

    // Pitch black metallic background for body
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, 1024, 1024);

    // Subtle red diagonal cyber lines on can body
    ctx.strokeStyle = "rgba(180, 5, 4, 0.25)";
    ctx.lineWidth = 4;
    for (let i = -1000; i < 2000; i += 80) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 1000, 1024);
      ctx.stroke();
    }

    // Load logo onto label canvas
    const logoImage = new Image();
    logoImage.src = "/prirplogoo.png";
    let canTexture = new THREE.CanvasTexture(canvas);

    logoImage.onload = () => {
      // Draw centered logo on canvas
      const logoW = 480;
      const logoH = (logoImage.height / logoImage.width) * logoW;
      const logoX = (1024 - logoW) / 2;
      const logoY = (1024 - logoH) / 2 - 40;

      // Draw red glowing aura behind logo
      const radGlow = ctx.createRadialGradient(512, 512, 50, 512, 512, 350);
      radGlow.addColorStop(0, "rgba(230, 10, 10, 0.4)");
      radGlow.addColorStop(1, "rgba(5, 5, 5, 0)");
      ctx.fillStyle = radGlow;
      ctx.beginPath();
      ctx.arc(512, 512, 350, 0, Math.PI * 2);
      ctx.fill();

      // Tint logo to red
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = logoImage.width;
      tempCanvas.height = logoImage.height;
      const tempCtx = tempCanvas.getContext("2d");
      tempCtx.drawImage(logoImage, 0, 0);

      // Apply red tint overlay
      tempCtx.globalCompositeOperation = "source-in";
      tempCtx.fillStyle = "#ff1a1a";
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      ctx.drawImage(tempCanvas, logoX, logoY, logoW, logoH);

      // Add text "LET IT OUT" below logo on can
      ctx.font = "42px 'Blade 2', sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText("LET IT OUT", 512, logoY + logoH + 60);

      ctx.font = "bold 24px monospace";
      ctx.fillStyle = "#ff3333";
      ctx.fillText("180MG CAFFEINE  •  0G SUGAR", 512, logoY + logoH + 105);

      canTexture.needsUpdate = true;
    };

    // 1. Can Body Cylinder
    const bodyGeometry = new THREE.CylinderGeometry(1.2, 1.2, 3.4, 64, 1, true);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      map: canTexture,
      roughness: 0.25,
      metalness: 0.85,
      bumpScale: 0.02,
    });
    const canBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
    canGroup.add(canBody);

    // 2. Top Rim / Shoulder Chrome
    const topRimGeo = new THREE.CylinderGeometry(1.2, 1.05, 0.3, 64);
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0x222222,
      metalness: 0.95,
      roughness: 0.1,
    });
    const topRim = new THREE.Mesh(topRimGeo, chromeMat);
    topRim.position.y = 1.85;
    canGroup.add(topRim);

    // 3. Top Cap
    const topCapGeo = new THREE.CylinderGeometry(1.05, 1.05, 0.05, 64);
    const topCapMat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      metalness: 0.9,
      roughness: 0.2,
    });
    const topCap = new THREE.Mesh(topCapGeo, topCapMat);
    topCap.position.y = 2.0;
    canGroup.add(topCap);

    // 4. Bottom Rim
    const botRimGeo = new THREE.CylinderGeometry(1.05, 1.2, 0.3, 64);
    const botRim = new THREE.Mesh(botRimGeo, chromeMat);
    botRim.position.y = -1.85;
    canGroup.add(botRim);

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // Red Key Light from front right
    const redLight = new THREE.SpotLight(0xff0000, 15);
    redLight.position.set(5, 5, 6);
    redLight.angle = Math.PI / 4;
    redLight.penumbra = 0.8;
    scene.add(redLight);

    // Intense Red Rim Light from left back
    const rimLight = new THREE.DirectionalLight(0xff2222, 6);
    rimLight.position.set(-6, 4, -4);
    scene.add(rimLight);

    // Soft White Fill Light
    const fillLight = new THREE.DirectionalLight(0xffffff, 2);
    fillLight.position.set(0, 6, 8);
    scene.add(fillLight);

    // Initial rotation tilt
    canGroup.rotation.z = -0.15;
    canGroup.rotation.y = 0.3;

    // Mouse Tracking State
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      mouseX = (x / rect.width) * 2;
      mouseY = (y / rect.height) * 2;
    };

    container.addEventListener("mousemove", handleMouseMove);

    // Animation Loop
    let clock = new THREE.Clock();
    let animId;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Realistic 3D Float Motion (sine wave)
      canGroup.position.y = Math.sin(elapsedTime * 1.8) * 0.22;
      canGroup.position.x = Math.cos(elapsedTime * 1.2) * 0.08;

      // Continuous 3D slow spin + interactive mouse tilt
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      canGroup.rotation.y = 0.3 + elapsedTime * 0.5 + targetX * 0.6;
      canGroup.rotation.x = targetY * 0.4;
      canGroup.rotation.z = -0.15 + Math.sin(elapsedTime * 1.5) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // Handle Window Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      bodyGeometry.dispose();
      topRimGeo.dispose();
      topCapGeo.dispose();
      botRimGeo.dispose();
      bodyMaterial.dispose();
      chromeMat.dispose();
      topCapMat.dispose();
    };
  }, []);

  return (
    <div className="floating-3d-can-wrapper">
      <div ref={containerRef} className="floating-3d-canvas-container" />
      <div className="can-reflection-floor" />
    </div>
  );
}
