import { useEffect, useRef } from 'react';

interface FloatingBuilding {
  x: number; y: number; z: number;
  width: number; height: number;
  opacity: number; twinkleSpeed: number; twinklePhase: number;
  type: 'house' | 'building' | 'skyscraper';
  windows: { x: number; y: number; lit: boolean }[];
}

interface Sunbeam {
  x: number; y: number; vx: number; vy: number; life: number; maxLife: number; trail: number;
}

interface Building {
  x: number; width: number; height: number; litWindows: number[];
  dome: boolean;
  minaret: boolean;
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
    let beams: Sunbeam[] = [];
    let skyline: Building[] = [];
    let mouseX = 0;
    let mouseY = 0;
    let time = 0;

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
        const width = Math.random() * 55 + 25;
        const height = Math.random() * 130 + 35;
        const b: Building = {
          x, width, height, litWindows: [],
          dome: Math.random() > 0.7,
          minaret: Math.random() > 0.85,
        };
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
      for (let i = 0; i < 70; i++) {
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
          opacity: Math.random() * 0.35 + 0.1,
          twinkleSpeed: Math.random() * 0.008 + 0.002,
          twinklePhase: Math.random() * Math.PI * 2,
          type,
          windows,
        });
      }
    }

    function spawnBeam() {
      const angle = Math.random() * Math.PI * 0.25 - Math.PI * 0.05;
      const speed = Math.random() * 4 + 2;
      beams.push({
        x: Math.random() * cvs.width * 0.8 + cvs.width * 0.1,
        y: Math.random() * cvs.height * 0.4,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: Math.random() * 45 + 30,
        trail: Math.random() * 30 + 20,
      });
    }

    function drawNebula(x: number, y: number, radius: number, color: string) {
      const gradient = cxt.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, color);
      gradient.addColorStop(0.5, color.replace(/[\d.]+\)$/, '0.006)'));
      gradient.addColorStop(1, 'transparent');
      cxt.fillStyle = gradient;
      cxt.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }

    function drawSkyline() {
      const baseY = cvs.height - 50;

      for (const b of skyline) {
        const bWidth = b.width - 1;
        const bh = b.height;
        const bx = b.x;
        const by = baseY - bh;

        cxt.fillStyle = 'rgba(10, 8, 30, 0.2)';
        cxt.fillRect(bx, by, bWidth, bh);

        cxt.strokeStyle = 'rgba(255, 140, 50, 0.05)';
        cxt.lineWidth = 0.5;
        cxt.strokeRect(bx, by, bWidth, bh);

        if (b.dome) {
          cxt.beginPath();
          cxt.arc(bx + bWidth / 2, by, bWidth / 2 + 4, Math.PI, 0);
          cxt.fillStyle = 'rgba(10, 8, 30, 0.2)';
          cxt.fill();
          cxt.strokeStyle = 'rgba(255, 140, 50, 0.04)';
          cxt.lineWidth = 0.5;
          cxt.stroke();
        }

        if (b.minaret) {
          const mw = 4;
          const mh = 18;
          cxt.fillStyle = 'rgba(10, 8, 30, 0.2)';
          cxt.fillRect(bx - mw, by - mh, mw, mh);
          cxt.fillRect(bx + bWidth, by - mh, mw, mh);
        }

        const winCols = Math.floor(bWidth / 14);
        for (let c = 0; c < winCols; c++) {
          for (const r of b.litWindows) {
            const wx = bx + c * 14 + 4;
            const wy = by + r * 16 + 6;
            const glow = 0.04 + Math.sin(time * 0.02 + c + r + b.x * 0.01) * 0.02;
            cxt.fillStyle = `rgba(255, 180, 80, ${glow})`;
            cxt.fillRect(wx, wy, 6, 8);
          }
        }
      }
    }

    function drawSun() {
      const sunX = cvs.width * 0.75;
      const sunY = cvs.height * 0.45;
      const sunRadius = 60 + Math.sin(time * 0.005) * 5;

      const grad = cxt.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius * 3);
      grad.addColorStop(0, 'rgba(255, 200, 100, 0.6)');
      grad.addColorStop(0.1, 'rgba(255, 160, 60, 0.3)');
      grad.addColorStop(0.3, 'rgba(255, 120, 40, 0.1)');
      grad.addColorStop(0.6, 'rgba(255, 80, 30, 0.03)');
      grad.addColorStop(1, 'transparent');
      cxt.fillStyle = grad;
      cxt.fillRect(sunX - sunRadius * 3, sunY - sunRadius * 3, sunRadius * 6, sunRadius * 6);

      cxt.beginPath();
      cxt.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
      const sunGrad = cxt.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius);
      sunGrad.addColorStop(0, 'rgba(255, 220, 150, 0.9)');
      sunGrad.addColorStop(0.4, 'rgba(255, 180, 80, 0.6)');
      sunGrad.addColorStop(0.8, 'rgba(255, 120, 40, 0.2)');
      sunGrad.addColorStop(1, 'rgba(255, 80, 20, 0)');
      cxt.fillStyle = sunGrad;
      cxt.fill();

      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + time * 0.002;
        const len = sunRadius * (0.4 + Math.sin(time * 0.01 + i) * 0.15);
        cxt.beginPath();
        cxt.moveTo(sunX + Math.cos(angle) * sunRadius * 0.8, sunY + Math.sin(angle) * sunRadius * 0.8);
        cxt.lineTo(sunX + Math.cos(angle) * (sunRadius + len), sunY + Math.sin(angle) * (sunRadius + len));
        cxt.strokeStyle = `rgba(255, 200, 100, ${0.15 + Math.sin(time * 0.008 + i) * 0.05})`;
        cxt.lineWidth = 1.5;
        cxt.stroke();
      }
    }

    let lastBeam = 0;

    function draw() {
      time++;
      const w = cvs.width;
      const h = cvs.height;

      cxt.clearRect(0, 0, w, h);

      const bgGrad = cxt.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#0a0a1a');
      bgGrad.addColorStop(0.25, '#1a0e2e');
      bgGrad.addColorStop(0.45, '#2a1035');
      bgGrad.addColorStop(0.6, '#3d1530');
      bgGrad.addColorStop(0.75, '#5c1f28');
      bgGrad.addColorStop(0.85, '#8a3520');
      bgGrad.addColorStop(0.93, '#c65d18');
      bgGrad.addColorStop(1, '#e88520');
      cxt.fillStyle = bgGrad;
      cxt.fillRect(0, 0, w, h);

      drawNebula(w * 0.2, h * 0.2, 250, 'rgba(180, 100, 180, 0.02)');
      drawNebula(w * 0.7, h * 0.35, 300, 'rgba(255, 140, 60, 0.025)');
      drawNebula(w * 0.5, h * 0.15, 200, 'rgba(100, 60, 200, 0.015)');

      drawSkyline();

      drawSun();

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
          cxt.fillStyle = '#e88520';
          cxt.fillRect(-bw / 2, -bh, bw, bh);
          cxt.beginPath();
          cxt.moveTo(-bw / 2 - 2, -bh);
          cxt.lineTo(0, -bh - 8);
          cxt.lineTo(bw / 2 + 2, -bh);
          cxt.closePath();
          cxt.fillStyle = '#d4a853';
          cxt.fill();
          cxt.fillStyle = '#1a0e2e';
          cxt.fillRect(-1.5, -bh * 0.25, 3, bh * 0.25);
        } else if (b.type === 'building') {
          cxt.fillStyle = '#c65d18';
          cxt.fillRect(-bw / 2, -bh, bw, bh);
          for (const win of b.windows) {
            const lit = Math.sin(time * 0.01 + win.x + win.y) > 0.1;
            cxt.fillStyle = lit ? 'rgba(255, 220, 150, 0.5)' : 'rgba(10, 8, 24, 0.3)';
            cxt.fillRect(-bw / 2 + win.x, -bh + win.y, 3, 4);
          }
        } else {
          cxt.fillStyle = '#8a3520';
          cxt.fillRect(-bw / 2, -bh, bw, bh);
          cxt.strokeStyle = '#d4a853';
          cxt.lineWidth = 0.5;
          cxt.beginPath();
          cxt.moveTo(0, -bh);
          cxt.lineTo(0, -bh - 6);
          cxt.stroke();
          for (const win of b.windows) {
            const lit = Math.sin(time * 0.015 + win.x * 2) > 0;
            cxt.fillStyle = lit ? 'rgba(255, 220, 150, 0.4)' : 'rgba(10, 8, 24, 0.25)';
            cxt.fillRect(-bw / 2 + win.x, -bh + win.y, 3, 4);
          }
        }

        cxt.restore();
      }

      if (time - lastBeam > 180 + Math.random() * 300) {
        spawnBeam();
        lastBeam = time;
      }

      for (let i = beams.length - 1; i >= 0; i--) {
        const s = beams[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life++;

        const progress = s.life / s.maxLife;
        const alpha = Math.sin(progress * Math.PI) * 0.5;

        cxt.beginPath();
        cxt.moveTo(s.x, s.y);
        cxt.lineTo(s.x - s.vx * 2, s.y - s.vy * 2);
        cxt.strokeStyle = `rgba(255, 200, 100, ${alpha})`;
        cxt.lineWidth = 1.5;
        cxt.stroke();

        cxt.beginPath();
        cxt.moveTo(s.x, s.y);
        cxt.lineTo(s.x - s.vx * s.trail, s.y - s.vy * s.trail);
        const trailGrad = cxt.createLinearGradient(s.x, s.y, s.x - s.vx * s.trail, s.y - s.vy * s.trail);
        trailGrad.addColorStop(0, `rgba(255, 200, 100, ${alpha * 0.6})`);
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
