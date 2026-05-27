/** Lightweight confetti burst without external dependencies */
export function fireConfetti(durationMs = 1800): void {
  if (typeof window === "undefined") return;
  const canvas = document.createElement("canvas");
  canvas.style.cssText =
    "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener("resize", resize);

  const colors = ["#34d399", "#a78bfa", "#fbbf24", "#f472b6", "#38bdf8"];
  const particles = Array.from({ length: 120 }, () => ({
    x: canvas.width / 2 + (Math.random() - 0.5) * 200,
    y: canvas.height * 0.35,
    vx: (Math.random() - 0.5) * 12,
    vy: Math.random() * -14 - 4,
    size: Math.random() * 6 + 3,
    color: colors[Math.floor(Math.random() * colors.length)]!,
    rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.2,
  }));

  const start = performance.now();
  const tick = (now: number) => {
    const elapsed = now - start;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      p.vy += 0.35;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    }
    if (elapsed < durationMs) {
      requestAnimationFrame(tick);
    } else {
      window.removeEventListener("resize", resize);
      canvas.remove();
    }
  };
  requestAnimationFrame(tick);
}
