import { useEffect, useRef, useState, useCallback } from "react";
import "./ProductFrameViewer.css";

const FRAME_COUNT = 50;
const FRAME_PATH = "/Frames/ezgif-4c9006586d2b27a4-jpg/ezgif-frame-";

export default function ProductFrameViewer({ onFrameChange }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const imagesRef = useRef([]);
  const currentFrameRef = useRef(0);
  const targetFrameRef = useRef(0);
  const rafRef = useRef(null);
  const onFrameChangeRef = useRef(onFrameChange);

  const [currentFrameDisplay, setCurrentFrameDisplay] = useState(1);

  // Keep callback ref updated
  useEffect(() => {
    onFrameChangeRef.current = onFrameChange;
  }, [onFrameChange]);

  // High-performance draw function
  const drawFrame = useCallback((index) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const clampedIndex = Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(index)));
    const img = imagesRef.current[clampedIndex];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;

    // Fill with studio light gray tone matching the unboxing video background
    ctx.fillStyle = "#e0e0e4";
    ctx.fillRect(0, 0, width, height);

    const imgRatio = img.naturalWidth / img.naturalHeight; // 720 / 1280 = 0.5625
    const containerRatio = width / height;

    let drawW;
    let drawH;

    // Scale to fill the frame card seamlessly (cover with center alignment)
    if (imgRatio > containerRatio) {
      drawH = height;
      drawW = height * imgRatio;
    } else {
      drawW = width;
      drawH = width / imgRatio;
    }

    const x = (width - drawW) / 2;
    const y = (height - drawH) / 2;

    ctx.drawImage(img, x, y, drawW, drawH);
  }, []);

  // Resize canvas strictly on window resize
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    drawFrame(currentFrameRef.current);
  }, [drawFrame]);

  // Preload frames once on mount
  useEffect(() => {
    const images = new Array(FRAME_COUNT);
    imagesRef.current = images;

    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      const frameNumber = String(i).padStart(3, "0");
      img.src = `${FRAME_PATH}${frameNumber}.jpg`;

      const frameIdx = i - 1;
      images[frameIdx] = img;

      img.onload = () => {
        if (frameIdx === 0 && currentFrameRef.current === 0) {
          drawFrame(0);
        } else if (Math.round(targetFrameRef.current) === frameIdx) {
          drawFrame(frameIdx);
        }
      };

      if (i === 1 && img.complete && img.naturalWidth > 0) {
        drawFrame(0);
      }
    }

    let lastReportedFrame = -1;

    // Smooth RAF lerp loop
    const animate = () => {
      const diff = targetFrameRef.current - currentFrameRef.current;
      if (Math.abs(diff) > 0.002) {
        currentFrameRef.current += diff * 0.45;
        const frameToDraw = Math.round(currentFrameRef.current);
        const clamped = Math.max(0, Math.min(FRAME_COUNT - 1, frameToDraw));
        
        drawFrame(clamped);

        if (clamped !== lastReportedFrame) {
          lastReportedFrame = clamped;
          setCurrentFrameDisplay(clamped + 1);

          if (onFrameChangeRef.current) {
            onFrameChangeRef.current(clamped + 1);
          }
        }
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [drawFrame, resizeCanvas]);

  // Map scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const scrollableDistance = container.offsetHeight - viewportHeight;

      if (scrollableDistance <= 0) return;

      const scrollInside = -rect.top;
      let progress = scrollInside / scrollableDistance;
      progress = Math.max(0, Math.min(1, progress));

      const targetFrame = progress * (FRAME_COUNT - 1);
      targetFrameRef.current = targetFrame;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const getPhaseLabel = (frame) => {
    if (frame <= 18) return "01 // COLD SHIPMENT BOX";
    if (frame <= 35) return "02 // 24-CAN ARSENAL UNBOX";
    return "03 // 330ML HERO CAN CLOSE-UP";
  };

  return (
    <div ref={containerRef} className="product-frame-container">
      <div className="product-frame-sticky">
        <div className="frame-canvas-frame">
          <canvas ref={canvasRef} className="product-frame-canvas" />

          {/* Floating Subtle Angle & Phase Indicator */}
          <div className="frame-rotation-badge font-mono">
            <span className="dot-live"></span>
            <span>{getPhaseLabel(currentFrameDisplay)}</span>
            <span className="badge-sep">•</span>
            <span>FRAME {String(currentFrameDisplay).padStart(2, "0")}/50</span>
          </div>
        </div>
      </div>
    </div>
  );
}