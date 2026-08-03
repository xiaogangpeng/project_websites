export class ParticleNetwork {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error(`Canvas element with id '${canvasId}' not found.`);
            return;
        }
        this.ctx = this.canvas.getContext('2d');

        // --- Configuration ---
        this.particleCount = options.count || 70;
        this.connectionDist = options.connectionDist || 140;
        this.mouseDist = options.mouseDist || 200;
        this.color = options.color || 'rgba(148, 163, 184, 1)'; // Slate-400

        // --- State ---
        this.particles = [];
        this.mouse = { x: null, y: null };
        this.isRunning = false;

        // Bind methods to 'this'
        this.animate = this.animate.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseOut = this.handleMouseOut.bind(this);

        this.init();
    }

    init() {
        // Event Listeners
        window.addEventListener('resize', this.handleResize);
        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('mouseout', this.handleMouseOut);

        // Initial Size
        this.handleResize();

        // Create Particles
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push(this.createParticle());
        }
    }

    createParticle() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
            size: Math.random() * 2 + 1
        };
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.animate();
        }
    }

    stop() {
        this.isRunning = false;
        // Optional: Clean up listeners if you want to destroy the object fully
        // window.removeEventListener('resize', this.handleResize);
    }

    handleResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    handleMouseMove(e) {
        this.mouse.x = e.x;
        this.mouse.y = e.y;
    }

    handleMouseOut() {
        this.mouse.x = null;
        this.mouse.y = null;
    }

    update() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i < this.particles.length; i++) {
            let p = this.particles[i];

            // 1. Move
            p.x += p.vx;
            p.y += p.vy;

            // 2. Bounce
            if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

            // 3. Mouse Interaction (Repulsion)
            if (this.mouse.x != null) {
                let dx = this.mouse.x - p.x;
                let dy = this.mouse.y - p.y;
                let dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < this.mouseDist) {
                    const force = (this.mouseDist - dist) / this.mouseDist;
                    const directionX = (dx / dist) * force * 5; // Strength 5
                    const directionY = (dy / dist) * force * 5;
                    p.x -= directionX;
                    p.y -= directionY;
                }
            }

            // 4. Draw Particle
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();

            // 5. Draw Lines
            for (let j = i; j < this.particles.length; j++) {
                let p2 = this.particles[j];
                let dx = p.x - p2.x;
                let dy = p.y - p2.y;
                let dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < this.connectionDist) {
                    this.ctx.beginPath();
                    let opacity = 1 - (dist / this.connectionDist);
                    // Match the color tone but with opacity
                    this.ctx.strokeStyle = `rgba(148, 163, 184, ${opacity * 0.5})`; 
                    this.ctx.lineWidth = 0.5;
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();
                }
            }
        }
    }

    animate() {
        if (!this.isRunning) return;
        this.update();
        requestAnimationFrame(this.animate);
    }
}