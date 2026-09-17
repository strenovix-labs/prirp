import { useEffect, useRef, useState, useCallback } from "react";

const FRAME_COUNT = 240;
const FRAME_PATH = "/Frames/ezgif-6ea00191b36c078b-jpg/ezgif-frame-";

export default function ScrollSequence({ onScrollProgress, activeColor = "#0066ff" }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const imagesRef = useRef([]);
  const currentFrameRef = useRef(0);
  const targetFrameRef = useRef(0);
  const rafRef = useRef(null);
  const isLoadedRef = useRef(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  // Draw a specific frame to the canvas
  const drawFrame = useCallback((frameIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const img = imagesRef.current[frameIndex];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    ctx.clearRect(0, 0, width, height);

    const imageRatio = img.width / img.height;
    const screenRatio = width / height;

    let drawWidth;
    let drawHeight;

    if (imageRatio > screenRatio) {
      drawWidth = width;
      drawHeight = width / imageRatio;
    } else {
      drawHeight = height;
      drawWidth = height * imageRatio;
    }

    const x = (width - drawWidth) / 2;
    const y = (height - drawHeight) / 2;

    ctx.drawImage(img, x, y, drawWidth, drawHeight);
  }, []);

  // Resize canvas with DPI scaling
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawFrame(currentFrameRef.current);
  }, [drawFrame]);

  // Preload frames with progressive loading
  useEffect(() => {
    const images = [];
    let loadedCount = 0;

    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      const frameNumber = String(i).padStart(3, "0");
      img.src = `${FRAME_PATH}${frameNumber}.jpg`;

      img.onload = () => {
        loadedCount++;
        const percent = Math.floor((loadedCount / FRAME_COUNT) * 100);
        setLoadProgress(percent);

        if (i === 1) {
          // Draw first frame immediately
          drawFrame(0);
        }

        if (loadedCount >= Math.min(30, FRAME_COUNT)) {
          // Mark ready once initial batch is in memory for instantaneous interactivity
          setIsReady(true);
          isLoadedRef.current = true;
        }
      };

      images.push(img);
    }

    imagesRef.current = images;

    // Smooth animation lerp loop
    const animate = () => {
      // Smooth interpolation for silky frame transitions
      const diff = targetFrameRef.current - currentFrameRef.current;
      if (Math.abs(diff) > 0.05) {
        currentFrameRef.current += diff * 0.35;
        const frameToDraw = Math.round(currentFrameRef.current);
        const clampedFrame = Math.max(0, Math.min(FRAME_COUNT - 1, frameToDraw));
        drawFrame(clampedFrame);
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

  // Scroll listener for calculating frame target and calling progress
  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const totalScrollable = container.offsetHeight - window.innerHeight;
      const currentScroll = -rect.top;

      let progress = currentScroll / totalScrollable;
      progress = Math.max(0, Math.min(1, progress));

      const targetFrame = progress * (FRAME_COUNT - 1);
      targetFrameRef.current = targetFrame;

      if (onScrollProgress) {
        onScrollProgress(progress);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [onScrollProgress]);

  return (
    <div ref={containerRef} className="scroll-sequence-container" id="hero-stage">
      <div className="scroll-sequence-sticky">
        {/* Subtle radial glow matching active flavor */}
        <div
          className="ambient-glow-source"
          style={{
            background: `radial-gradient(circle, ${activeColor} 0%, rgba(6, 9, 19, 0) 70%)`,
          }}
        />

        <canvas ref={canvasRef} className="scroll-sequence-canvas" />
        <div className="scroll-vignette" />

        {/* Minimal Initial Loader Pill if first batch is downloading */}
        {!isReady && (
          <div
            style={{
              position: "absolute",
              bottom: "40px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 100,
              padding: "10px 24px",
              borderRadius: "999px",
              background: "rgba(6, 9, 19, 0.8)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#fff",
              fontSize: "12px",
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.15em",
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#00e5ff",
                animation: "pulse-glow 1s infinite",
              }}
            />
            <span>PREPARING SUB-ZERO FRAMES {loadProgress}%</span>
          </div>
        )}
      </div>
    </div>
  );
}