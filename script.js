// ============================================
// PARTICLE CANVAS ANIMATION
// ============================================
class ParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 100;
        this.connectionDistance = 150;
        this.mouse = { x: null, y: null, radius: 150 };
        
        this.init();
        this.setupEventListeners();
        this.animate();
    }
    
    init() {
        this.resizeCanvas();
        this.createParticles();
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1
            });
        }
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.createParticles();
        });
        
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.x;
            this.mouse.y = e.y;
        });
        
        window.addEventListener('mouseout', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }
    
    drawParticle(particle) {
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(102, 126, 234, 0.8)';
        this.ctx.fill();
    }
    
    drawConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.connectionDistance) {
                    const opacity = 1 - (distance / this.connectionDistance);
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(102, 126, 234, ${opacity * 0.3})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }
    
    updateParticles() {
        this.particles.forEach(particle => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Mouse interaction
            if (this.mouse.x !== null && this.mouse.y !== null) {
                const dx = this.mouse.x - particle.x;
                const dy = this.mouse.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.mouse.radius) {
                    const force = (this.mouse.radius - distance) / this.mouse.radius;
                    const angle = Math.atan2(dy, dx);
                    particle.vx -= Math.cos(angle) * force * 0.5;
                    particle.vy -= Math.sin(angle) * force * 0.5;
                }
            }
            
            // Boundary check
            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;
            
            // Damping
            particle.vx *= 0.99;
            particle.vy *= 0.99;
            
            // Keep particles within bounds
            particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
            particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));
        });
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawConnections();
        this.particles.forEach(particle => this.drawParticle(particle));
        this.updateParticles();
        
        requestAnimationFrame(() => this.animate());
    }
}

// ============================================
// COUNTER ANIMATION
// ============================================
class CounterAnimation {
    constructor(element, target, duration = 2000) {
        this.element = element;
        this.target = parseInt(target);
        this.duration = duration;
        this.hasAnimated = false;
    }
    
    animate() {
        if (this.hasAnimated) return;
        this.hasAnimated = true;
        
        const start = 0;
        const startTime = performance.now();
        
        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / this.duration, 1);
            
            // Easing function (ease-out cubic)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (this.target - start) * easeOut);
            
            this.element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                this.element.textContent = this.target;
            }
        };
        
        requestAnimationFrame(updateCounter);
    }
}

// ============================================
// INTERSECTION OBSERVER FOR ANIMATIONS
// ============================================
class AnimationObserver {
    constructor() {
        this.options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    // Trigger counter animation if it's a stat number
                    if (entry.target.classList.contains('stat-number')) {
                        const target = entry.target.dataset.target;
                        if (target) {
                            const counter = new CounterAnimation(entry.target, target);
                            counter.animate();
                        }
                    }
                }
            });
        }, this.options);
    }
    
    observe(elements) {
        elements.forEach(element => this.observer.observe(element));
    }
}

// ============================================
// CATEGORY HOVER EFFECTS
// ============================================
class CategoryEffects {
    constructor() {
        this.categories = document.querySelectorAll('.category');
        this.init();
    }
    
    init() {
        this.categories.forEach(category => {
            category.addEventListener('mouseenter', (e) => {
                this.handleHover(e.currentTarget);
            });
            
            category.addEventListener('mouseleave', (e) => {
                this.handleLeave(e.currentTarget);
            });
        });
    }
    
    handleHover(category) {
        // Add ripple effect
        const ripple = document.createElement('div');
        ripple.className = 'ripple-effect';
        category.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
        
        // Subtle scale on links
        const links = category.querySelectorAll('.link-card');
        links.forEach((link, index) => {
            setTimeout(() => {
                link.style.transform = 'translateX(4px)';
            }, index * 50);
        });
    }
    
    handleLeave(category) {
        const links = category.querySelectorAll('.link-card');
        links.forEach(link => {
            link.style.transform = '';
        });
    }
}

// ============================================
// SMOOTH SCROLL
// ============================================
class SmoothScroll {
    constructor() {
        this.init();
    }
    
    init() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
}

// ============================================
// LINK CARD INTERACTIONS
// ============================================
class LinkCardEffects {
    constructor() {
        this.cards = document.querySelectorAll('.link-card');
        this.init();
    }
    
    init() {
        this.cards.forEach(card => {
            card.addEventListener('mouseenter', (e) => {
                this.createGlow(e.currentTarget);
            });
            
            card.addEventListener('mousemove', (e) => {
                this.updateGlow(e.currentTarget, e);
            });
            
            card.addEventListener('mouseleave', (e) => {
                this.removeGlow(e.currentTarget);
            });
        });
    }
    
    createGlow(card) {
        if (!card.querySelector('.card-glow')) {
            const glow = document.createElement('div');
            glow.className = 'card-glow';
            card.appendChild(glow);
        }
    }
    
    updateGlow(card, event) {
        const glow = card.querySelector('.card-glow');
        if (glow) {
            const rect = card.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            glow.style.left = `${x}px`;
            glow.style.top = `${y}px`;
        }
    }
    
    removeGlow(card) {
        const glow = card.querySelector('.card-glow');
        if (glow) {
            glow.remove();
        }
    }
}

// ============================================
// PERFORMANCE OPTIMIZATION
// ============================================
class PerformanceOptimizer {
    constructor() {
        this.checkForReducedMotion();
    }
    
    checkForReducedMotion() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            document.body.classList.add('reduced-motion');
            // Disable particle system if reduced motion is preferred
            return false;
        }
        return true;
    }
}

// ============================================
// OVERLAY MANAGEMENT (for sub-pages)
// ============================================
class OverlayManager {
    constructor() {
        this.openBtns = document.querySelectorAll('.open-overlay');
        this.overlays = document.querySelectorAll('.overlay');
        this.closeBtns = document.querySelectorAll('.close-overlay');
        this.init();
    }
    
    init() {
        if (this.openBtns.length === 0) return;
        
        this.openBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.dataset.target;
                const targetOverlay = document.getElementById(targetId);
                if (targetOverlay) {
                    this.closeAll();
                    this.open(targetOverlay);
                }
            });
        });
        
        this.closeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const overlay = btn.closest('.overlay');
                if (overlay) {
                    this.close(overlay);
                }
            });
        });
        
        this.overlays.forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.close(overlay);
                }
            });
        });
        
        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAll();
            }
        });
    }
    
    open(overlay) {
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    close(overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    closeAll() {
        this.overlays.forEach(ov => this.close(ov));
    }
}

// ============================================
// PAGE LOADER
// ============================================
class PageLoader {
    constructor() {
        this.init();
    }
    
    init() {
        window.addEventListener('load', () => {
            document.body.classList.add('loaded');
            
            // Trigger entrance animations
            setTimeout(() => {
                this.triggerAnimations();
            }, 100);
        });
    }
    
    triggerAnimations() {
        const elements = document.querySelectorAll('.hero-section, .category');
        elements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('animate-in');
            }, index * 100);
        });
    }
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Performance check
    const perfOptimizer = new PerformanceOptimizer();
    const canUseAnimations = perfOptimizer.checkForReducedMotion();
    
    // Initialize particle system (if not reduced motion)
    if (canUseAnimations) {
        new ParticleSystem('particleCanvas');
    }
    
    // Initialize counter animations
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');
    const animObserver = new AnimationObserver();
    animObserver.observe(statNumbers);
    
    // Initialize category effects
    new CategoryEffects();
    
    // Initialize link card effects
    new LinkCardEffects();
    
    // Initialize smooth scroll
    new SmoothScroll();
    
    // Initialize overlay management (for sub-pages)
    new OverlayManager();
    
    // Initialize page loader
    new PageLoader();
    
    // Log initialization
    console.log('%c✨ Browser Overlays Studio Initialized', 'color: #667eea; font-size: 16px; font-weight: bold;');
    console.log('%cBuilt with ❤️ by artechfuz3d', 'color: #764ba2; font-size: 12px;');
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Random number generator
function random(min, max) {
    return Math.random() * (max - min) + min;
}

// Add CSS for dynamic effects
const style = document.createElement('style');
style.textContent = `
    .card-glow {
        position: absolute;
        width: 200px;
        height: 200px;
        background: radial-gradient(circle, rgba(102, 126, 234, 0.3) 0%, transparent 70%);
        border-radius: 50%;
        pointer-events: none;
        transform: translate(-50%, -50%);
        transition: opacity 0.3s ease;
        z-index: 0;
    }
    
    .link-card {
        position: relative;
        overflow: hidden;
    }
    
    .link-card > * {
        position: relative;
        z-index: 1;
    }
    
    .ripple-effect {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle, rgba(102, 126, 234, 0.3) 0%, transparent 70%);
        border-radius: 50%;
        transform: translate(-50%, -50%) scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple {
        to {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
        }
    }
    
    .reduced-motion * {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
    }
`;
document.head.appendChild(style);
