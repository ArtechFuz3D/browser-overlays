// Particle background only. Nothing here touches the link cards.
class ParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.count = 100;
        this.linkDistance = 150;
        this.mouse = { x: null, y: null, radius: 150 };
        this.resize();
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => { this.mouse.x = e.clientX; this.mouse.y = e.clientY; });
        window.addEventListener('mouseout', () => { this.mouse.x = this.mouse.y = null; });
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.particles = Array.from({ length: this.count }, () => ({
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            r: Math.random() * 2 + 1
        }));
    }

    update() {
        const { width, height } = this.canvas;
        for (const p of this.particles) {
            p.x += p.vx;
            p.y += p.vy;

            if (this.mouse.x !== null) {
                const dx = this.mouse.x - p.x, dy = this.mouse.y - p.y;
                const d = Math.hypot(dx, dy);
                if (d < this.mouse.radius) {
                    const force = (this.mouse.radius - d) / this.mouse.radius;
                    const a = Math.atan2(dy, dx);
                    p.vx -= Math.cos(a) * force * 0.5;
                    p.vy -= Math.sin(a) * force * 0.5;
                }
            }

            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;
            p.vx *= 0.99;
            p.vy *= 0.99;
            p.x = Math.max(0, Math.min(width, p.x));
            p.y = Math.max(0, Math.min(height, p.y));
        }
    }

    draw() {
        const ctx = this.ctx, ps = this.particles;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let i = 0; i < ps.length; i++) {
            for (let j = i + 1; j < ps.length; j++) {
                const d = Math.hypot(ps[i].x - ps[j].x, ps[i].y - ps[j].y);
                if (d < this.linkDistance) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(102, 126, 234, ${(1 - d / this.linkDistance) * 0.3})`;
                    ctx.moveTo(ps[i].x, ps[i].y);
                    ctx.lineTo(ps[j].x, ps[j].y);
                    ctx.stroke();
                }
            }
        }
        ctx.fillStyle = 'rgba(102, 126, 234, 0.8)';
        for (const p of ps) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        new ParticleSystem('particleCanvas');
    }
});
