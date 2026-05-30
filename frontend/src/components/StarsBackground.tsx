import { useEffect, useRef } from 'react';

interface FloatingBuilding {
  x: number; y: number; z: number;
  width: number; height: number;
  opacity: number; twinkleSpeed: number; twinklePhase: number;
  type: 'house' | 'building' | 'skyscraper';
  windows: { x: number; y: number; lit: boolean }[];
}

interface ShootingBeam {
  x: number; y: number; vx: number; vy: number; life: number; maxLife: number; trail: number;
}

interface Building {
  x: number; width: number; height: number; litWindows: number[];
}

export default function StarsBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let buildings: FloatingBuilding[] = [];
    let beams: ShootingBeam[] = [];
    let skyline: Building[] = [];
    let mouseX = 0;
    let mouseY = 0;
    let time = 0;

    const COLORS = ['#d4a853', '#ffffff', '#e0e8ff', '#f5e6c8', '#b8c6ff'];

    const cvs: HTMLCanvasElement = canvas;
    const cxt: CanvasRenderingContext2D = ctx;

    function resize() {
      cvs.width = window.innerWidth;
      cvs.height = window.innerHeight;
      generateSkyline();
    }

    function generateSkyline() {
      skyline = [];
      let x = 0;
      while (x < cvs.width) {
        const width = Math.random() * 60 + 30;
        const height = Math.random() * 120 + 40;
        const b: Building = { x, width, height, litWindows: [] };
        const windowCols = Math.floor(width / 14);
        const windowRows = Math.floor(height / 16);
        for (let r = 0; r < windowRows; r++) {
          if (Math.random() > 0.4) b.litWindows.push(r);
        }
        skyline.push(b);
        x += width;
      }
    }

    function initBuildings() {
      buildings = [];
      for (let i = 0; i < 80; i++) {
        const type = ['house', 'building', 'skyscraper'][Math.floor(Math.random() * 3)] as 'house' | 'building' | 'skyscraper';
        let width = type === 'house' ? 12 : type === 'building' ? 18 : 14;
        let height = type === 'house' ? 12 : type === 'building' ? 24 : 32;
        const windows: { x: number; y: number; lit: boolean }[] = [];
        const cols = type === 'house' ? 1 : type === 'building' ? 2 : 1;
        const rows = type === 'house' ? 1 : type === 'building' ? 3 : 4;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            windows.push({ x: c * 5 + 3, y: r * 6 + 4, lit: Math.random() > 0.5 });
          }
        }
        buildings.push({
          x: Math.random() * cvs.width,
          y: Math.random() * cvs.height,
          z: Math.random() * 3 + 1,
          width,
          height,
          opacity: Math.random() * 0.4 + 0.15,
          twinkleSpeed: Math.random() * 0.01 + 0.003,
          twinklePhase: Math.random() * Math.PI * 2,
          type,
          windows,
        });
      }
    }

    function spawnBeam() {
      const angle = Math.random() * Math.PI * 0.3 - Math.PI * 0.05;
      const speed = Math.random() * 5 + 3;
      beams.push({
        x: Math.random() * cvs.width * 0.8 + cvs.width * 0.1,
        y: Math.random() * cvs.height * 0.3,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: Math.random() * 50 + 35,
        trail: Math.random() * 35 + 25,
      });
    }

    function drawNebula(x: number, y: number, radius: number, color: string) {
      const gradient = cxt.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, color);
      gradient.addColorStop(0.5, color.replace(/[\d.]+\)$/, '0.008)'));
      gradient.addColorStop(1, 'transparent');
      cxt.fillStyle = gradient;
      cxt.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }

    function drawSkyline() {
      const baseY = cvs.height - 60;
      for (const b of skyline) {
        const bWidth = b.width - 1;
        cxt.fillStyle = 'rgba(10, 8, 30, 0.15)';
        cxt.fillRect(b.x, baseY - b.height, bWidth, b.height);

        cxt.strokeStyle = 'rgba(212, 168, 83, 0.04)';
        cxt.lineWidth = 0.5;
        cxt.strokeRect(b.x, baseY - b.height, bWidth, b.height);

        const winCols = Math.floor(bWidth / 14);
        for (let c = 0; c < winCols; c++) {
          for (const r of b.litWindows) {
            const wx = b.x + c * 14 + 4;
            const wy = baseY - b.height + r * 16 + 6;
            cxt.fillStyle = `rgba(212, 168, 83, ${0.03 + Math.sin(time * 0.02 + c + r) * 0.015})`;
            cxt.fillRect(wx, wy, 6, 8);
          }
        }
      }
    }

    let lastBeam = 0;

    function draw() {
      time++;
      const w = cvs.width;
      const h = cvs.height;

      cxt.clearRect(0, 0, w, h);

      const bgGrad = cxt.createRadialGradient(w * 0.5, h * 0.3, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.9);
      bgGrad.addColorStop(0, '#0b0e1a');
      bgGrad.addColorStop(0.3, '#0d0f24');
      bgGrad.addColorStop(0.6, '#100d2e');
      bgGrad.addColorStop(0.8, '#0a0818');
      bgGrad.addColorStop(1, '#050410');
      cxt.fillStyle = bgGrad;
      cxt.fillRect(0, 0, w, h);

      drawNebula(w * 0.15, h * 0.25, 280, 'rgba(212, 168, 83, 0.025)');
      drawNebula(w * 0.75, h * 0.55, 320, 'rgba(100, 60, 180, 0.02)');
      drawNebula(w * 0.5, h * 0.8, 220, 'rgba(180, 120, 80, 0.015)');

      drawSkyline();

      const px = (mouseX / w - 0.5) * 4;
      const py = (mouseY / h - 0.5) * 4;

      for (const b of buildings) {
        const twinkle = Math.sin(time * b.twinkleSpeed + b.twinklePhase) * 0.25 + 0.75;
        const opacity = b.opacity * twinkle;
        const parallaxFactor = 1 + (b.z - 1) * 0.4;
        const sx = b.x + px * parallaxFactor;
        const sy = b.y + py * parallaxFactor;
        const bw = b.width;
        const bh = b.height;

        cxt.save();
        cxt.translate(sx, sy);
        cxt.globalAlpha = opacity;

        if (b.type === 'house') {
          cxt.fillStyle = '#d4a853';
          cxt.fillRect(-bw / 2, -bh, bw, bh);
          cxt.beginPath();
          cxt.moveTo(-bw / 2 - 2, -bh);
          cxt.lineTo(0, -bh - 8);
          cxt.lineTo(bw / 2 + 2, -bh);
          cxt.closePath();
          cxt.fillStyle = '#d4a853';
          cxt.fill();
          const doorWidth = 4;
          cxt.fillStyle = '#0a0818';
          cxt.fillRect(-doorWidth / 2, -bh * 0.25, doorWidth, bh * 0.25);
        } else if (b.type === 'building') {
          cxt.fillStyle = '#b8c6ff';
          cxt.fillRect(-bw / 2, -bh, bw, bh);
          for (const win of b.windows) {
            const lit = Math.sin(time * 0.01 + win.x + win.y) > 0.2;
            cxt.fillStyle = lit ? 'rgba(212, 168, 83, 0.5)' : 'rgba(10, 8, 24, 0.4)';
            cxt.fillRect(-bw / 2 + win.x, -bh + win.y, 3, 4);
          }
        } else {
          cxt.fillStyle = '#e0e8ff';
          cxt.fillRect(-bw / 2, -bh, bw, bh);
          const antennaH = 6;
          cxt.strokeStyle = '#d4a853';
          cxt.lineWidth = 0.5;
          cxt.beginPath();
          cxt.moveTo(0, -bh);
          cxt.lineTo(0, -bh - antennaH);
          cxt.stroke();
          for (const win of b.windows) {
            const lit = Math.sin(time * 0.015 + win.x * 2) > 0.1;
            cxt.fillStyle = lit ? 'rgba(255, 255, 255, 0.4)' : 'rgba(10, 8, 24, 0.3)';
            cxt.fillRect(-bw / 2 + win.x, -bh + win.y, 3, 4);
          }
        }

        cxt.restore();
      }

      if (time - lastBeam > 150 + Math.random() * 250) {
        spawnBeam();
        lastBeam = time;
      }

      for (let i = beams.length - 1; i >= 0; i--) {
        const s = beams[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life++;

        const progress = s.life / s.maxLife;
        const alpha = Math.sin(progress * Math.PI) * 0.7;

        cxt.beginPath();
        cxt.moveTo(s.x, s.y);
        cxt.lineTo(s.x - s.vx * 2, s.y - s.vy * 2);
        cxt.strokeStyle = `rgba(212, 168, 83, ${alpha})`;
        cxt.lineWidth = 1.5;
        cxt.stroke();

        cxt.beginPath();
        cxt.moveTo(s.x, s.y);
        cxt.lineTo(s.x - s.vx * s.trail, s.y - s.vy * s.trail);
        const trailGrad = cxt.createLinearGradient(s.x, s.y, s.x - s.vx * s.trail, s.y - s.vy * s.trail);
        trailGrad.addColorStop(0, `rgba(212, 168, 83, ${alpha * 0.7})`);
        trailGrad.addColorStop(1, 'transparent');
        cxt.strokeStyle = trailGrad;
        cxt.lineWidth = 0.5;
        cxt.stroke();

        if (s.life >= s.maxLife) {
          beams.splice(i, 1);
        }
      }

      animationId = requestAnimationFrame(draw);
    }

    function onMouseMove(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }

    function onResize() {
      resize();
      initBuildings();
    }

    resize();
    initBuildings();
    draw();

    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMouseMove);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
