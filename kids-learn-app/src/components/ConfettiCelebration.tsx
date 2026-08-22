"use client";

import { useEffect, useRef, useCallback } from "react";

interface ConfettiCelebrationProps {
  active: boolean;
  streak?: number;
  onComplete?: () => void;
}

interface ConfettiPiece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  shape: "rect" | "circle" | "star";
  size: number;
  opacity: number;
  gravity: number;
}

const COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e",
  "#14b8a6", "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6",
  "#a855f7", "#d946ef", "#ec4899", "#f43f5e",
];

const SHAPES: ConfettiPiece["shape"][] = ["rect", "circle", "star"];

function getConfettiCount(streak: number): number {
  if (streak >= 10) return 150;
  if (streak >= 5) return 100;
  if (streak >= 3) return 60;
  return 30;
}

function createConfettiPiece(canvasWidth: number, canvasHeight: number): ConfettiPiece {
  return {
    x: canvasWidth / 2 + (Math.random() - 0.5) * canvasWidth * 0.3,
    y: canvasHeight / 2,
    vx: (Math.random() - 0.5) * 12,
    vy: -(Math.random() * 12 + 4),
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 10,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    size: Math.random() * 8 + 4,
    opacity: 1,
    gravity: 0.15 + Math.random() * 0.1,
  };
}

export function ConfettiCelebration({ active, streak = 0, onComplete }: ConfettiCelebrationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const piecesRef = useRef<ConfettiPiece[]>([]);
  const animationRef = useRef<number | null>(null);
  const activeRef = useRef(active);

  const drawStar = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const px = x + Math.cos(angle) * size;
      const py = y + Math.sin(angle) * size;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }, []);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    if (!active || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const count = getConfettiCount(streak);
    piecesRef.current = Array.from({ length: count }, () =>
      createConfettiPiece(canvas.width, canvas.height)
    );

    let frame = 0;
    const maxFrames = 180;

    const animate = () => {
      if (!canvasRef.current) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      piecesRef.current.forEach((piece) => {
        piece.x += piece.vx;
        piece.y += piece.vy;
        piece.vy += piece.gravity;
        piece.rotation += piece.rotationSpeed;
        piece.vx *= 0.99;

        if (frame > maxFrames * 0.6) {
          piece.opacity -= 0.02;
        }

        if (piece.opacity <= 0) return;

        ctx.save();
        ctx.translate(piece.x, piece.y);
        ctx.rotate((piece.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, piece.opacity);
        ctx.fillStyle = piece.color;

        if (piece.shape === "rect") {
          ctx.fillRect(-piece.size / 2, -piece.size / 4, piece.size, piece.size / 2);
        } else if (piece.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, piece.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          drawStar(ctx, 0, 0, piece.size / 2);
        }

        ctx.restore();
      });

      frame++;

      if (frame < maxFrames && piecesRef.current.some((p) => p.opacity > 0)) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        piecesRef.current = [];
        onComplete?.();
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [active, streak, onComplete, drawStar]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}
