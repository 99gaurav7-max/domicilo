import { useEffect, useRef } from 'react';
import { useThemeStore } from '../store/themeStore';

interface Star {
  x: number; y: number; z: number;
  size: number; opacity: number; twinkleSpeed: number; twinklePhase: number;
  color: string;
}

interface ShootingStar {
  x: number; y: number; vx: number; vy: number; life: number; maxLife: number; trail: number;
}

export default function StarsBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useThemeStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let stars: Star[] = [];
    let shootingStars: ShootingStar[] = [];
    let mouseX = 0;
    let mouseY = 0;
    let time = 0;

    const STAR_COUNT = 600;
    const COLORS = ['#ffffff', '#e0e8ff', '#fff8e7', '#ffe4f0', '#b8c6ff'];

    const cvs: HTMLCanvasElement = canvas;
    const cxt: CanvasRenderingContext2D = ctx;

    function resize() {
      cvs.width = window.innerWidth;
      cvs.height = window.innerHeight;
    }

    function initStars() {
      stars = [];
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: Math.random() * cvs.width,
          y: Math.random() * cvs.height,
          z: Math.random() * 3 + 1,
          size: Math.random() * 2.2 + 0.3,
          opacity: Math.random() * 0.7 + 0.3,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinklePhase: Math.random() * Math.PI * 2,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        });
      }
    }

    function spawnShootingStar() {
      const angle = Math.random() * Math.PI * 0.4 - Math.PI * 0.1;
      const speed = Math.random() * 6 + 4;
      shootingStars.push({
        x: Math.random() * cvs.width * 0.8 + cvs.width * 0.1,
        y: Math.random() * cvs.height * 0.3,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: Math.random() * 60 + 40,
        trail: Math.random() * 40 + 30,
      });
    }

    function drawNebula(x: number, y: number, radius: number, color: string) {
      const gradient = cxt.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, color);
      gradient.addColorStop(0.4, color.replace('0.', '0.03'));
      gradient.addColorStop(1, 'transparent');
      cxt.fillStyle = gradient;
      cxt.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }

    let lastShootingStar = 0;

    function draw() {
      time++;
      const w = cvs.width;
      const h = cvs.height;
      const isDark = theme === 'dark';

      cxt.clearRect(0, 0, w, h);

      if (!isDark) {
        const gradient = cxt.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.8);
        gradient.addColorStop(0, '#f8f9ff');
        gradient.addColorStop(0.5, '#f0f2ff');
        gradient.addColorStop(1, '#e8ecff');
        cxt.fillStyle = gradient;
        cxt.fillRect(0, 0, w, h);
        const gridGradient = cxt.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.7);
        gridGradient.addColorStop(0, 'rgba(180, 160, 255, 0.04)');
        gridGradient.addColorStop(1, 'transparent');
        cxt.fillStyle = gridGradient;
        cxt.fillRect(0, 0, w, h);
      } else {
        const bgGrad = cxt.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.8);
        bgGrad.addColorStop(0, '#0a0a1a');
        bgGrad.addColorStop(0.4, '#0d0d24');
        bgGrad.addColorStop(0.7, '#0f0d2e');
        bgGrad.addColorStop(1, '#0a0818');
        cxt.fillStyle = bgGrad;
        cxt.fillRect(0, 0, w, h);

        drawNebula(w * 0.2, h * 0.3, 300, 'rgba(100, 60, 180, 0.04)');
        drawNebula(w * 0.8, h * 0.6, 350, 'rgba(50, 100, 200, 0.03)');
        drawNebula(w * 0.5, h * 0.8, 250, 'rgba(180, 100, 200, 0.02)');
      }

      const px = (mouseX / w - 0.5) * (isDark ? 6 : 2);
      const py = (mouseY / h - 0.5) * (isDark ? 6 : 2);

      for (const star of stars) {
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase) * 0.3 + 0.7;
        const opacity = star.opacity * twinkle;
        const parallaxFactor = 1 + (star.z - 1) * 0.5;
        const sx = star.x + px * parallaxFactor * (isDark ? 1 : 0.2);
        const sy = star.y + py * parallaxFactor * (isDark ? 1 : 0.2);
        const size = star.size * (isDark ? 1 : 0.5);

        cxt.beginPath();
        cxt.arc(sx, sy, Math.max(size * twinkle, 0.2), 0, Math.PI * 2);
        cxt.fillStyle = isDark
          ? `rgba(${hexToRgb(star.color)}, ${opacity})`
          : `rgba(100, 90, 140, ${opacity * 0.4})`;
        cxt.fill();

        if (size > 1.2 && isDark) {
          cxt.beginPath();
          cxt.arc(sx, sy, size * 3, 0, Math.PI * 2);
          cxt.fillStyle = `rgba(${hexToRgb(star.color)}, ${opacity * 0.08})`;
          cxt.fill();
        }
      }

      if (isDark) {
        if (time - lastShootingStar > 120 + Math.random() * 200) {
          spawnShootingStar();
          lastShootingStar = time;
        }

        for (let i = shootingStars.length - 1; i >= 0; i--) {
          const s = shootingStars[i];
          s.x += s.vx;
          s.y += s.vy;
          s.life++;

          const progress = s.life / s.maxLife;
          const alpha = Math.sin(progress * Math.PI) * 0.9;

          cxt.beginPath();
          cxt.moveTo(s.x, s.y);
          cxt.lineTo(s.x - s.vx * 2, s.y - s.vy * 2);
          cxt.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          cxt.lineWidth = 1.5;
          cxt.stroke();

          cxt.beginPath();
          cxt.moveTo(s.x, s.y);
          cxt.lineTo(s.x - s.vx * s.trail, s.y - s.vy * s.trail);
          const trailGrad = cxt.createLinearGradient(s.x, s.y, s.x - s.vx * s.trail, s.y - s.vy * s.trail);
          trailGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.8})`);
          trailGrad.addColorStop(1, 'transparent');
          cxt.strokeStyle = trailGrad;
          cxt.lineWidth = 0.5;
          cxt.stroke();

          if (s.life >= s.maxLife) {
            shootingStars.splice(i, 1);
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    }

    function hexToRgb(hex: string) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `${r}, ${g}, ${b}`;
    }

    function onMouseMove(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }

    function onResize() {
      resize();
      initStars();
    }

    resize();
    initStars();
    draw();

    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMouseMove);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
