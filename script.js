// Hero particle network. Self-contained; touches nothing else on the page.
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.host = canvas.parentElement;
        this.ctx = canvas.getContext('2d');
        this.linkDistance = 130;
        this.mouse = { x: null, y: null, radius: 140 };
        this.visible = true;

        this.resize();
        new ResizeObserver(() => this.resize()).observe(this.host);
        new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; }).observe(this.host);

        this.host.addEventListener('mousemove', (e) => {
            const r = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - r.left;
            this.mouse.y = e.clientY - r.top;
        });
        this.host.addEventListener('mouseleave', () => { this.mouse.x = this.mouse.y = null; });

        this.animate();
    }

    resize() {
        const w = this.host.offsetWidth, h = this.host.offsetHeight;
        this.canvas.width = w;
        this.canvas.height = h;
        const count = Math.max(30, Math.min(90, Math.round((w * h) / 14000)));
        this.particles = Array.from({ length: count }, () => ({
            x: Math.random() * w, y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
            r: Math.random() * 1.8 + 1
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
        ctx.lineWidth = 1;
        for (let i = 0; i < ps.length; i++) {
            for (let j = i + 1; j < ps.length; j++) {
                const d = Math.hypot(ps[i].x - ps[j].x, ps[i].y - ps[j].y);
                if (d < this.linkDistance) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(255, 90, 31, ${(1 - d / this.linkDistance) * 0.35})`;
                    ctx.moveTo(ps[i].x, ps[i].y);
                    ctx.lineTo(ps[j].x, ps[j].y);
                    ctx.stroke();
                }
            }
        }
        ctx.fillStyle = 'rgba(255, 90, 31, 0.85)';
        for (const p of ps) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    animate() {
        if (this.visible) {
            this.update();
            this.draw();
        }
        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('particleCanvas');
    if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        new ParticleSystem(canvas);
    }
});

// Highlight the jump-bar chip for the category currently in view.
document.addEventListener('DOMContentLoaded', () => {
    const chips = new Map([...document.querySelectorAll('.chip')].map(c => [c.getAttribute('href').slice(1), c]));
    if (!chips.size) return;
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            chips.forEach(c => c.classList.remove('active'));
            const chip = chips.get(e.target.id);
            if (chip) chip.classList.add('active');
        });
    }, { rootMargin: '-35% 0px -55% 0px' });
    document.querySelectorAll('.category[id]').forEach(el => io.observe(el));
});
