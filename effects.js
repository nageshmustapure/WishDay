// ====================
// VISUAL EFFECTS
// ====================

class EffectsManager {
    constructor() {
        this.sparkleCanvas = null;
        this.sparkleCtx = null;
        this.fireworksCanvas = null;
        this.fireworksCtx = null;
        this.sparkles = [];
        this.fireworks = [];
        this.particles = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.animating = false;

        this.init();
    }

    init() {
        // Sparkle canvas for mouse trails
        this.sparkleCanvas = document.getElementById('sparkle-canvas');
        if (this.sparkleCanvas) {
            this.sparkleCtx = this.sparkleCanvas.getContext('2d');
            this.resizeCanvas(this.sparkleCanvas);
        }

        // Fireworks canvas
        this.fireworksCanvas = document.getElementById('fireworks-canvas');
        if (this.fireworksCanvas) {
            this.fireworksCtx = this.fireworksCanvas.getContext('2d');
            this.resizeCanvas(this.fireworksCanvas);
        }

        window.addEventListener('resize', () => {
            if (this.sparkleCanvas) this.resizeCanvas(this.sparkleCanvas);
            if (this.fireworksCanvas) this.resizeCanvas(this.fireworksCanvas);
        });

        window.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        window.addEventListener('click', (e) => {
            this.createClickBurst(e.clientX, e.clientY);
        });

        this.startAnimation();
    }

    resizeCanvas(canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    startAnimation() {
        if (this.animating) return;
        this.animating = true;
        this.animate();
    }

    animate() {
        if (!this.animating) return;

        // Clear canvases
        if (this.sparkleCtx) {
            this.sparkleCtx.clearRect(0, 0, this.sparkleCanvas.width, this.sparkleCanvas.height);
        }
        if (this.fireworksCtx) {
            this.fireworksCtx.clearRect(0, 0, this.fireworksCanvas.width, this.fireworksCanvas.height);
        }

        // Update and draw sparkles
        this.updateSparkles();

        // Update and draw fireworks
        this.updateFireworks();

        // Create mouse trail sparkles
        this.createMouseTrail();

        this.lastMouseX = this.mouseX;
        this.lastMouseY = this.mouseY;

        requestAnimationFrame(() => this.animate());
    }

    // Mouse trail sparkles
    createMouseTrail() {
        const dx = this.mouseX - this.lastMouseX;
        const dy = this.mouseY - this.lastMouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 5) {
            this.sparkles.push({
                x: this.mouseX,
                y: this.mouseY,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 4 + 2,
                life: 1,
                decay: 0.02 + Math.random() * 0.02,
                color: this.getRandomColor()
            });
        }
    }

    // Click burst effect
    createClickBurst(x, y) {
        for (let i = 0; i < 15; i++) {
            const angle = (Math.PI * 2 / 15) * i;
            const speed = 3 + Math.random() * 3;

            this.sparkles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 5 + 3,
                life: 1,
                decay: 0.02,
                color: this.getRandomColor()
            });
        }

        if (window.audioManager) {
            window.audioManager.playSparkle();
        }
    }

    updateSparkles() {
        if (!this.sparkleCtx) return;

        this.sparkles = this.sparkles.filter(s => s.life > 0);

        this.sparkles.forEach(s => {
            s.x += s.vx;
            s.y += s.vy;
            s.vy += 0.05; // Gravity
            s.life -= s.decay;

            this.sparkleCtx.beginPath();
            this.sparkleCtx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
            this.sparkleCtx.fillStyle = s.color.replace('1)', `${s.life})`);
            this.sparkleCtx.fill();

            // Glow effect
            this.sparkleCtx.shadowBlur = 10;
            this.sparkleCtx.shadowColor = s.color;
        });

        this.sparkleCtx.shadowBlur = 0;
    }

    // FIREWORKS SYSTEM
    launchFirework(x, y) {
        const targetY = 100 + Math.random() * 200;

        this.fireworks.push({
            x: x || Math.random() * this.fireworksCanvas.width,
            y: this.fireworksCanvas.height,
            targetY: targetY,
            vy: -12 - Math.random() * 5,
            color: this.getRandomColor(),
            trail: []
        });

        if (window.audioManager) {
            window.audioManager.playWoosh();
        }
    }

    explodeFirework(x, y, color) {
        const particleCount = 80 + Math.floor(Math.random() * 40);

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 / particleCount) * i;
            const speed = 2 + Math.random() * 6;

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 3 + 1,
                life: 1,
                decay: 0.01 + Math.random() * 0.01,
                color: color
            });
        }

        // Screen shake effect
        document.body.style.transform = `translate(${Math.random() * 6 - 3}px, ${Math.random() * 6 - 3}px)`;
        setTimeout(() => {
            document.body.style.transform = '';
        }, 100);

        if (window.audioManager) {
            window.audioManager.playExplosion();
        }
    }

    updateFireworks() {
        if (!this.fireworksCtx) return;

        // Update rockets
        this.fireworks = this.fireworks.filter(f => {
            f.y += f.vy;
            f.trail.push({ x: f.x, y: f.y });
            if (f.trail.length > 10) f.trail.shift();

            // Draw trail
            f.trail.forEach((t, i) => {
                this.fireworksCtx.beginPath();
                this.fireworksCtx.arc(t.x, t.y, 2 * (i / f.trail.length), 0, Math.PI * 2);
                this.fireworksCtx.fillStyle = f.color.replace('1)', `${i / f.trail.length})`);
                this.fireworksCtx.fill();
            });

            // Draw rocket
            this.fireworksCtx.beginPath();
            this.fireworksCtx.arc(f.x, f.y, 3, 0, Math.PI * 2);
            this.fireworksCtx.fillStyle = f.color;
            this.fireworksCtx.fill();

            if (f.y <= f.targetY) {
                this.explodeFirework(f.x, f.y, f.color);
                return false;
            }
            return true;
        });

        // Update explosion particles
        this.particles = this.particles.filter(p => p.life > 0);

        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.05; // Gravity
            p.vx *= 0.99; // Air resistance
            p.life -= p.decay;

            this.fireworksCtx.beginPath();
            this.fireworksCtx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            this.fireworksCtx.fillStyle = p.color.replace('1)', `${p.life})`);
            this.fireworksCtx.fill();

            // Glow
            this.fireworksCtx.shadowBlur = 5;
            this.fireworksCtx.shadowColor = p.color;
        });

        this.fireworksCtx.shadowBlur = 0;
    }

    // Launch fireworks show
    startFireworksShow(duration = 5000) {
        const interval = setInterval(() => {
            this.launchFirework();
            if (Math.random() > 0.5) {
                setTimeout(() => this.launchFirework(), 200);
            }
        }, 300);

        setTimeout(() => {
            clearInterval(interval);
        }, duration);
    }

    // Confetti burst
    confettiBurst(x, y, count = 50) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 5 + Math.random() * 10;

            this.sparkles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 5,
                size: Math.random() * 6 + 4,
                life: 1,
                decay: 0.008,
                color: this.getRandomColor()
            });
        }
    }

    getRandomColor() {
        const colors = [
            'rgba(99, 102, 241, 1)',   // Indigo
            'rgba(168, 85, 247, 1)',   // Purple
            'rgba(236, 72, 153, 1)',   // Pink
            'rgba(251, 191, 36, 1)',   // Gold
            'rgba(34, 211, 238, 1)',   // Cyan
            'rgba(16, 185, 129, 1)',   // Emerald
            'rgba(244, 63, 94, 1)'     // Rose
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Starfield warp effect
    createStarfield(container, callback) {
        const canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const stars = [];
        const numStars = 500;

        // Create stars
        for (let i = 0; i < numStars; i++) {
            stars.push({
                x: (Math.random() - 0.5) * canvas.width * 2,
                y: (Math.random() - 0.5) * canvas.height * 2,
                z: Math.random() * 2000,
                size: Math.random() * 2 + 1
            });
        }

        let speed = 20;
        let frame = 0;
        const maxFrames = 120; // 2 seconds at 60fps

        const animate = () => {
            ctx.fillStyle = 'rgba(5, 5, 16, 0.3)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const cx = canvas.width / 2;
            const cy = canvas.height / 2;

            stars.forEach(star => {
                star.z -= speed;

                if (star.z <= 0) {
                    star.z = 2000;
                    star.x = (Math.random() - 0.5) * canvas.width * 2;
                    star.y = (Math.random() - 0.5) * canvas.height * 2;
                }

                const x = (star.x / star.z) * 500 + cx;
                const y = (star.y / star.z) * 500 + cy;
                const size = (1 - star.z / 2000) * 4;

                const prevZ = star.z + speed;
                const prevX = (star.x / prevZ) * 500 + cx;
                const prevY = (star.y / prevZ) * 500 + cy;

                ctx.beginPath();
                ctx.moveTo(prevX, prevY);
                ctx.lineTo(x, y);
                ctx.strokeStyle = `rgba(255, 255, 255, ${1 - star.z / 2000})`;
                ctx.lineWidth = size;
                ctx.stroke();
            });

            frame++;
            speed = 20 + (frame / maxFrames) * 80; // Accelerate

            if (frame < maxFrames) {
                requestAnimationFrame(animate);
            } else {
                // Flash white and fade out
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                gsap.to(canvas, {
                    opacity: 0,
                    duration: 0.5,
                    onComplete: () => {
                        canvas.remove();
                        if (callback) callback();
                    }
                });
            }
        };

        animate();
    }

    destroy() {
        this.animating = false;
    }
}

// Global effects manager
window.effectsManager = new EffectsManager();
