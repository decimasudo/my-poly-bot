"use client";

import { useEffect, useRef } from 'react';

export default function PixelBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    
    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Configuration
    const gridSize = 40; // Ukuran kotak pixel (makin besar makin blocky)
    const dots: {x: number, y: number, alpha: number, speed: number}[] = [];

    // Initialize dots logic
    const initDots = () => {
      dots.length = 0; // Clear array
      const cols = Math.ceil(window.innerWidth / gridSize);
      const rows = Math.ceil(window.innerHeight / gridSize);
      
      for (let i = 0; i < 40; i++) { // Jumlah pixel melayang
        dots.push({
          x: Math.floor(Math.random() * cols) * gridSize,
          y: Math.floor(Math.random() * rows) * gridSize,
          alpha: Math.random() * 0.4, // Transparansi acak
          speed: 0.2 + Math.random() * 0.5 // Kecepatan jatuh acak
        });
      }
    };
    
    initDots();

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 1. Draw Grid (Garis tipis background)
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.03)';
      ctx.lineWidth = 1;
      
      // Vertical Lines
      for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      // Horizontal Lines
      for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // 2. Draw Floating Pixels
      dots.forEach(dot => {
        // Warna Biru (Tailwind Blue-600) dengan alpha
        ctx.fillStyle = `rgba(37, 99, 235, ${dot.alpha})`; 
        ctx.fillRect(dot.x, dot.y, gridSize, gridSize);
        
        // Move downwards
        dot.y += dot.speed;
        
        // Reset if out of screen (Looping)
        if (dot.y > canvas.height) {
          dot.y = -gridSize;
          dot.x = Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize;
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none bg-white"
    />
  );
}