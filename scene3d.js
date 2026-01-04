// ====================
// ENHANCED 3D SCENE
// ====================

class BirthdayScene3D {
    constructor() {
        this.canvas = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = [];
        this.cake = null;
        this.gifts = [];
        this.balloons3D = [];
        this.mouse = { x: 0, y: 0 };
        this.animationId = null;
        this.clock = null;

        this.init();
    }

    init() {
        // Get canvas
        this.canvas = document.getElementById('three-canvas');
        if (!this.canvas) return;

        this.clock = new THREE.Clock();

        // Scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x050510, 0.003);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 40;
        this.camera.position.y = 0;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x050510, 0);

        // Lighting
        this.setupLighting();

        // Create ambient particles
        this.createAmbientParticles();

        // Create floating orbs
        this.createFloatingOrbs();

        // Event Listeners
        window.addEventListener('resize', () => this.onWindowResize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));

        // Start animation
        this.animate();
    }

    setupLighting() {
        // Ambient
        const ambient = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(ambient);

        // Main directional
        const directional = new THREE.DirectionalLight(0xffffff, 0.6);
        directional.position.set(10, 20, 15);
        this.scene.add(directional);

        // Colored point lights
        const colors = [0x6366f1, 0xa855f7, 0xec4899, 0x22d3ee];
        const positions = [
            [-20, 15, 10],
            [20, 15, 10],
            [0, -15, -10],
            [0, 20, 0]
        ];

        colors.forEach((color, i) => {
            const light = new THREE.PointLight(color, 1.5, 60);
            light.position.set(...positions[i]);
            this.scene.add(light);
        });
    }

    createAmbientParticles() {
        const particleCount = 300;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;

            positions[i3] = (Math.random() - 0.5) * 120;
            positions[i3 + 1] = (Math.random() - 0.5) * 80;
            positions[i3 + 2] = (Math.random() - 0.5) * 80;

            const color = new THREE.Color();
            color.setHSL(Math.random() * 0.3 + 0.7, 0.9, 0.7);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;

            sizes[i] = Math.random() * 3 + 1;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            size: 0.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        const particles = new THREE.Points(geometry, material);
        this.scene.add(particles);
        this.particles.push({
            mesh: particles,
            velocities: Array(particleCount).fill(null).map(() => ({
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.02
            }))
        });
    }

    createFloatingOrbs() {
        const orbCount = 8;
        const colors = [0x6366f1, 0xa855f7, 0xec4899, 0x22d3ee, 0xfbbf24];

        for (let i = 0; i < orbCount; i++) {
            const geometry = new THREE.SphereGeometry(1 + Math.random(), 32, 32);
            const material = new THREE.MeshPhongMaterial({
                color: colors[i % colors.length],
                emissive: colors[i % colors.length],
                emissiveIntensity: 0.3,
                transparent: true,
                opacity: 0.6
            });

            const orb = new THREE.Mesh(geometry, material);
            orb.position.set(
                (Math.random() - 0.5) * 80,
                (Math.random() - 0.5) * 50,
                (Math.random() - 0.5) * 40 - 20
            );

            this.scene.add(orb);
            this.gifts.push({
                mesh: orb,
                floatSpeed: Math.random() * 0.5 + 0.2,
                floatOffset: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.01
            });
        }
    }

    create3DBirthdayCake() {
        const cakeGroup = new THREE.Group();

        // Cake tiers with better materials
        const tiers = [
            { radius: 5, height: 2.5, color: 0xff69b4, y: 1.25 },
            { radius: 4, height: 2, color: 0xffd700, y: 3.5 },
            { radius: 3, height: 1.8, color: 0x9966ff, y: 5.4 }
        ];

        tiers.forEach(tier => {
            const geometry = new THREE.CylinderGeometry(tier.radius, tier.radius, tier.height, 64);
            const material = new THREE.MeshPhongMaterial({
                color: tier.color,
                shininess: 80,
                emissive: tier.color,
                emissiveIntensity: 0.15
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.y = tier.y;
            cakeGroup.add(mesh);

            // Icing drips
            const dripCount = 12;
            for (let i = 0; i < dripCount; i++) {
                const angle = (i / dripCount) * Math.PI * 2;
                const drip = new THREE.Mesh(
                    new THREE.SphereGeometry(0.3 + Math.random() * 0.3, 16, 16),
                    new THREE.MeshPhongMaterial({
                        color: 0xfffafa,
                        shininess: 100
                    })
                );
                drip.position.set(
                    Math.cos(angle) * tier.radius,
                    tier.y + tier.height / 2 - 0.3,
                    Math.sin(angle) * tier.radius
                );
                drip.scale.y = 1.5 + Math.random();
                cakeGroup.add(drip);
            }
        });

        // Candles
        const candleCount = 7;
        for (let i = 0; i < candleCount; i++) {
            const angle = (i / candleCount) * Math.PI * 2;
            const radius = 2;

            const candleGroup = new THREE.Group();

            // Candle body
            const candle = new THREE.Mesh(
                new THREE.CylinderGeometry(0.15, 0.15, 1.2, 16),
                new THREE.MeshPhongMaterial({ color: 0xfffbe6 })
            );
            candleGroup.add(candle);

            // Flame
            const flame = new THREE.Mesh(
                new THREE.ConeGeometry(0.2, 0.5, 16),
                new THREE.MeshBasicMaterial({
                    color: 0xff6600,
                    transparent: true,
                    opacity: 0.9
                })
            );
            flame.position.y = 0.85;
            flame.userData.isFlame = true;
            candleGroup.add(flame);

            // Flame glow
            const glow = new THREE.PointLight(0xff6600, 0.5, 3);
            glow.position.y = 0.85;
            candleGroup.add(glow);

            candleGroup.position.set(
                Math.cos(angle) * radius,
                6.5,
                Math.sin(angle) * radius
            );
            cakeGroup.add(candleGroup);
        }

        // Cherry on top
        const cherry = new THREE.Mesh(
            new THREE.SphereGeometry(0.5, 32, 32),
            new THREE.MeshPhongMaterial({
                color: 0xff0040,
                shininess: 120
            })
        );
        cherry.position.y = 7;
        cakeGroup.add(cherry);

        cakeGroup.position.set(0, -5, 0);
        cakeGroup.scale.set(0.7, 0.7, 0.7);
        this.scene.add(cakeGroup);
        this.cake = cakeGroup;

        return cakeGroup;
    }

    showBirthdayCake() {
        if (!this.cake) {
            this.create3DBirthdayCake();
        }

        if (this.cake) {
            this.cake.position.y = -25;
            this.cake.rotation.y = Math.PI * 2;

            gsap.to(this.cake.position, {
                y: -2,
                duration: 2,
                ease: "elastic.out(1, 0.6)"
            });

            gsap.to(this.cake.rotation, {
                y: 0,
                duration: 2,
                ease: "power2.out"
            });
        }
    }

    hideBirthdayCake() {
        if (this.cake) {
            gsap.to(this.cake.position, {
                y: -25,
                duration: 1,
                ease: "power2.in",
                onComplete: () => {
                    if (this.cake) {
                        this.scene.remove(this.cake);
                        this.cake = null;
                    }
                }
            });
        }
    }

    createConfettiExplosion(count = 150) {
        const colors = [0x6366f1, 0xa855f7, 0xec4899, 0xfbbf24, 0x10b981, 0x22d3ee];
        const confettiPieces = [];

        for (let i = 0; i < count; i++) {
            const geometry = new THREE.BoxGeometry(0.15, 0.25, 0.03);
            const material = new THREE.MeshBasicMaterial({
                color: colors[Math.floor(Math.random() * colors.length)]
            });
            const piece = new THREE.Mesh(geometry, material);

            piece.position.set(
                (Math.random() - 0.5) * 2,
                5,
                (Math.random() - 0.5) * 2
            );

            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.4,
                Math.random() * 0.3 + 0.15,
                (Math.random() - 0.5) * 0.4
            );

            this.scene.add(piece);
            confettiPieces.push({
                mesh: piece,
                velocity: velocity,
                rotationSpeed: {
                    x: (Math.random() - 0.5) * 0.2,
                    y: (Math.random() - 0.5) * 0.2,
                    z: (Math.random() - 0.5) * 0.2
                }
            });
        }

        const animateConfetti = () => {
            let active = false;
            confettiPieces.forEach(piece => {
                piece.velocity.y -= 0.008;
                piece.mesh.position.add(piece.velocity);
                piece.mesh.rotation.x += piece.rotationSpeed.x;
                piece.mesh.rotation.y += piece.rotationSpeed.y;
                piece.mesh.rotation.z += piece.rotationSpeed.z;

                if (piece.mesh.position.y > -20) {
                    active = true;
                } else {
                    this.scene.remove(piece.mesh);
                }
            });

            if (active) {
                requestAnimationFrame(animateConfetti);
            }
        };

        animateConfetti();
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        const time = this.clock.getElapsedTime();

        // Animate particles
        this.particles.forEach(ps => {
            const positions = ps.mesh.geometry.attributes.position.array;
            ps.velocities.forEach((vel, i) => {
                const i3 = i * 3;
                positions[i3] += vel.x;
                positions[i3 + 1] += vel.y;
                positions[i3 + 2] += vel.z;

                if (Math.abs(positions[i3]) > 60) vel.x *= -1;
                if (Math.abs(positions[i3 + 1]) > 40) vel.y *= -1;
                if (Math.abs(positions[i3 + 2]) > 40) vel.z *= -1;
            });
            ps.mesh.geometry.attributes.position.needsUpdate = true;
            ps.mesh.rotation.y += 0.0003;
        });

        // Animate orbs
        this.gifts.forEach(orb => {
            orb.mesh.position.y += Math.sin(time * orb.floatSpeed + orb.floatOffset) * 0.02;
            orb.mesh.rotation.x += orb.rotationSpeed;
            orb.mesh.rotation.y += orb.rotationSpeed * 0.5;
        });

        // Animate cake
        if (this.cake) {
            this.cake.rotation.y += 0.002;

            // Flicker flames
            this.cake.traverse(child => {
                if (child.userData && child.userData.isFlame) {
                    child.scale.y = 1 + Math.sin(time * 15 + child.id) * 0.15;
                    child.scale.x = 1 + Math.sin(time * 12 + child.id) * 0.1;
                }
            });
        }

        // Parallax camera
        this.camera.position.x += (this.mouse.x * 8 - this.camera.position.x) * 0.03;
        this.camera.position.y += (-this.mouse.y * 5 - this.camera.position.y) * 0.03;
        this.camera.lookAt(0, 0, 0);

        this.renderer.render(this.scene, this.camera);
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.renderer) {
            this.renderer.dispose();
        }
    }
}

// Initialize
let birthday3D = null;

document.addEventListener('DOMContentLoaded', () => {
    if (typeof THREE !== 'undefined') {
        birthday3D = new BirthdayScene3D();
        window.birthday3D = birthday3D;
    }
});
