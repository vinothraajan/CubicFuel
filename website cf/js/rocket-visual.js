/**
 * CUBIC FUEL - COMPLETE 3D PROCEDURAL ROCKET & DISSIPATING THRUSTER FLAME
 * Built with Three.js (WebGL)
 * 
 * Features:
 * 1. Ultra Eye-Catching 3D Metallic Rocket Craft:
 *    - Jet-black carbon-fiber fuselage with high-contrast specular reflections.
 *    - Razor-sharp Fuel Red (#E62B2B) delta wings, forward canard fins, and glowing neon trim seams.
 *    - Dual booster pods, polarized cockpit visor, titanium exhaust bells with glowing internal combustion chambers.
 *    - Geometric CF brand emblem mounted on fuselage.
 *    - 3D cosmic starfield / space particle dust drifting in deep space.
 * 2. Down-to-Upward scroll propulsion: moves smoothly from lower position (Y = -3.8) to high orbit (Y = +3.2).
 * 3. Dynamic thruster flames that burn intensely at liftoff and completely fade away / shut down
 *    ("flames gone while scrolling") as the rocket ascends into orbit.
 * 4. Interactive 3D mouse rotation (pitch and yaw).
 */

class Rocket3DScene {
  constructor() {
    this.container = document.getElementById('rocket-3d-container');
    this.canvas = document.getElementById('rocket-3d-canvas');
    this.aboutSection = document.getElementById('about');
    this.altitudeEl = document.getElementById('rocket-altitude');
    this.statusEl = document.getElementById('rocket-flight-status');
    this.flameStatusDot = document.getElementById('rocket-flame-status-dot');
    this.propulsionModeEl = document.getElementById('rocket-propulsion-mode');
    this.thrusterGlow = document.getElementById('thruster-glow');

    if (!this.container || !this.canvas || typeof THREE === 'undefined') return;

    // Scroll & Physics variables
    this.scrollProgress = 0;
    this.currentY = -3.8;      // Starts low down
    this.targetY = -3.8;
    this.flameIntensity = 1.0; // 1.0 = full burn, 0 = completely gone
    this.targetFlameIntensity = 1.0;
    this.mouse = { x: 0, y: 0 };
    this.targetRotation = { x: 0, y: 0 };

    this.initThree();
    this.buildSpaceEnvironment();
    this.buildRocket();
    this.buildThrusterFlame();
    this.initEvents();

    requestAnimationFrame((t) => this.animate(t));
  }

  initThree() {
    const width = this.container.clientWidth || 400;
    const height = this.container.clientHeight || 560;

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 11);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.4;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    // Directional Key Light (sharp metallic rim highlight)
    this.dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
    this.dirLight.position.set(6, 12, 8);
    this.scene.add(this.dirLight);

    // Secondary Rim Light (creates sleek edge specular reflection)
    const rimLight = new THREE.DirectionalLight(0xE62B2B, 1.8);
    rimLight.position.set(-8, 6, -4);
    this.scene.add(rimLight);

    // Red Engine Glow Point Light
    this.thrusterLight = new THREE.PointLight(0xE62B2B, 3.8, 9);
    this.thrusterLight.position.set(0, -3.2, 0);
    this.scene.add(this.thrusterLight);
  }

  buildSpaceEnvironment() {
    // 3D Ambient Space Dust / Starfield
    const starCount = 260;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 16;
      starPositions[i + 1] = (Math.random() - 0.5) * 18;
      starPositions[i + 2] = (Math.random() - 0.5) * 10 - 2;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.08,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });

    this.starField = new THREE.Points(starGeo, starMat);
    this.scene.add(this.starField);
  }

  buildRocket() {
    this.rocketGroup = new THREE.Group();

    // High-End Materials
    // 1. Carbon / Jet Black fuselage
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x141414,
      roughness: 0.18,
      metalness: 0.9
    });

    // 2. Fuel Red aerodynamic finish
    const redMat = new THREE.MeshStandardMaterial({
      color: 0xE62B2B,
      roughness: 0.15,
      metalness: 0.85,
      emissive: 0x660808,
      emissiveIntensity: 0.3
    });

    // 3. Glowing Laser Red Neon Line Material
    const laserRedMat = new THREE.MeshBasicMaterial({
      color: 0xFF2B2B
    });

    // 4. Titanium / Dark Chrome
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x58585e,
      roughness: 0.12,
      metalness: 0.95
    });

    // 5. Polarized Glass Cockpit Visor
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x050505,
      roughness: 0.02,
      metalness: 0.98
    });

    // --- Main Fuselage Body ---
    const bodyGeo = new THREE.CylinderGeometry(0.55, 0.88, 3.8, 32);
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = 0;
    this.rocketGroup.add(bodyMesh);

    // Glowing Neon Seam Rings on Fuselage
    [-0.8, 0.4].forEach((yPos) => {
      const ringRadius = yPos === 0.4 ? 0.62 : 0.77;
      const ringGeo = new THREE.TorusGeometry(ringRadius, 0.014, 12, 48);
      ringGeo.rotateX(Math.PI / 2);
      const ringMesh = new THREE.Mesh(ringGeo, laserRedMat);
      ringMesh.position.y = yPos;
      this.rocketGroup.add(ringMesh);
    });

    // --- Aerodynamic Nose Cone ---
    const noseGeo = new THREE.ConeGeometry(0.55, 1.7, 32);
    const noseMesh = new THREE.Mesh(noseGeo, metalMat);
    noseMesh.position.y = 2.75;
    this.rocketGroup.add(noseMesh);

    // Glowing Red Tip Accent & Pitot Sensor
    const tipGeo = new THREE.ConeGeometry(0.18, 0.6, 32);
    const tipMesh = new THREE.Mesh(tipGeo, redMat);
    tipMesh.position.y = 3.3;
    this.rocketGroup.add(tipMesh);

    const needleProbeGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.45, 12);
    const needleProbe = new THREE.Mesh(needleProbeGeo, laserRedMat);
    needleProbe.position.y = 3.75;
    this.rocketGroup.add(needleProbe);

    // --- Polarized Visor Band ---
    const visorGeo = new THREE.CylinderGeometry(0.57, 0.64, 0.45, 32);
    const visorMesh = new THREE.Mesh(visorGeo, glassMat);
    visorMesh.position.y = 1.4;
    this.rocketGroup.add(visorMesh);

    // Red Racing Stripe Decal below visor
    const stripeGeo = new THREE.CylinderGeometry(0.66, 0.70, 0.12, 32);
    const stripeMesh = new THREE.Mesh(stripeGeo, redMat);
    stripeMesh.position.y = 0.95;
    this.rocketGroup.add(stripeMesh);

    // --- Forward Swept Canards (Eye-Catching Upper Winglets) ---
    const canardShape = new THREE.Shape();
    canardShape.moveTo(0, 0);
    canardShape.lineTo(0.45, -0.2);
    canardShape.lineTo(0.45, -0.4);
    canardShape.lineTo(0, -0.25);
    canardShape.closePath();

    const canardGeo = new THREE.ExtrudeGeometry(canardShape, { depth: 0.03, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01 });
    [-1, 1].forEach((dir) => {
      const canardMesh = new THREE.Mesh(canardGeo, redMat);
      canardMesh.scale.x = dir;
      canardMesh.position.set(dir * 0.58, 1.8, 0);
      canardMesh.rotation.z = dir * 0.1;
      this.rocketGroup.add(canardMesh);
    });

    // --- Dual Booster Pods (Left & Right) with Laser Red Stripes ---
    const boosterGeo = new THREE.CylinderGeometry(0.26, 0.32, 2.8, 24);
    const boosterNoseGeo = new THREE.ConeGeometry(0.26, 0.7, 24);

    [-0.95, 0.95].forEach((xPos) => {
      const boosterMesh = new THREE.Mesh(boosterGeo, bodyMat);
      boosterMesh.position.set(xPos, -0.6, 0);
      this.rocketGroup.add(boosterMesh);

      const boosterNose = new THREE.Mesh(boosterNoseGeo, redMat);
      boosterNose.position.set(xPos, 1.15, 0);
      this.rocketGroup.add(boosterNose);

      // Booster neon red stripe
      const bStripeGeo = new THREE.CylinderGeometry(0.30, 0.30, 0.08, 24);
      const bStripe = new THREE.Mesh(bStripeGeo, laserRedMat);
      bStripe.position.set(xPos, 0.2, 0);
      this.rocketGroup.add(bStripe);

      // Booster engine nozzles with glowing internal ring
      const bNozzleGeo = new THREE.CylinderGeometry(0.2, 0.28, 0.4, 20);
      const bNozzle = new THREE.Mesh(bNozzleGeo, metalMat);
      bNozzle.position.set(xPos, -2.15, 0);
      this.rocketGroup.add(bNozzle);

      // Emissive chamber ring
      const chamberGeo = new THREE.TorusGeometry(0.16, 0.02, 12, 24);
      chamberGeo.rotateX(Math.PI / 2);
      const chamber = new THREE.Mesh(chamberGeo, laserRedMat);
      chamber.position.set(xPos, -2.3, 0);
      this.rocketGroup.add(chamber);
    });

    // --- Main Engine Bell (Center) with Emissive Core ---
    const nozzleGeo = new THREE.CylinderGeometry(0.38, 0.54, 0.65, 28);
    const nozzleMesh = new THREE.Mesh(nozzleGeo, metalMat);
    nozzleMesh.position.y = -2.15;
    this.rocketGroup.add(nozzleMesh);

    // Main chamber glow ring
    const mainChamberGeo = new THREE.TorusGeometry(0.32, 0.03, 16, 32);
    mainChamberGeo.rotateX(Math.PI / 2);
    this.mainChamberRing = new THREE.Mesh(mainChamberGeo, laserRedMat);
    this.mainChamberRing.position.y = -2.42;
    this.rocketGroup.add(this.mainChamberRing);

    // --- 4 Aerodynamic Fuel Red Delta Wings with Highlighted Edges ---
    const finShape = new THREE.Shape();
    finShape.moveTo(0, 0);
    finShape.lineTo(0.95, -0.9);
    finShape.lineTo(0.95, -1.45);
    finShape.lineTo(0, -1.15);
    finShape.closePath();

    const extrudeSettings = { depth: 0.05, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.02, bevelThickness: 0.02 };
    const finGeo = new THREE.ExtrudeGeometry(finShape, extrudeSettings);

    for (let i = 0; i < 4; i++) {
      const finMesh = new THREE.Mesh(finGeo, redMat);
      finMesh.rotation.y = (i * Math.PI) / 2;
      finMesh.position.set(0, -0.8, 0);
      this.rocketGroup.add(finMesh);
    }

    // Set initial position low down
    this.rocketGroup.position.set(0, this.currentY, 0);
    this.scene.add(this.rocketGroup);
  }

  buildThrusterFlame() {
    this.flameGroup = new THREE.Group();

    // 1. Center Main Flame Cone (Glow gradient)
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0xE62B2B,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });

    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });

    const flameGeo = new THREE.ConeGeometry(0.48, 2.4, 24);
    flameGeo.rotateX(Math.PI); // Point downwards
    this.mainFlameMesh = new THREE.Mesh(flameGeo, flameMat);
    this.mainFlameMesh.position.set(0, -3.6, 0);
    this.flameGroup.add(this.mainFlameMesh);

    // Inner Core Needle
    const coreGeo = new THREE.ConeGeometry(0.22, 1.6, 16);
    coreGeo.rotateX(Math.PI);
    this.coreFlameMesh = new THREE.Mesh(coreGeo, coreMat);
    this.coreFlameMesh.position.set(0, -3.2, 0);
    this.flameGroup.add(this.coreFlameMesh);

    // 2. Booster Side Flames
    const bFlameGeo = new THREE.ConeGeometry(0.24, 1.4, 16);
    bFlameGeo.rotateX(Math.PI);

    this.boosterFlames = [];
    [-0.95, 0.95].forEach((xPos) => {
      const bFlame = new THREE.Mesh(bFlameGeo, flameMat);
      bFlame.position.set(xPos, -3.05, 0);
      this.flameGroup.add(bFlame);
      this.boosterFlames.push(bFlame);
    });

    // 3. Glowing Exhaust 3D Particle System
    this.particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    this.particlePositions = new Float32Array(this.particleCount * 3);
    this.particleVelocities = [];

    for (let i = 0; i < this.particleCount; i++) {
      this.resetParticle(i);
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xFF8844,
      size: 0.16,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    this.particleSystem = new THREE.Points(particleGeo, particleMat);
    this.flameGroup.add(this.particleSystem);

    this.rocketGroup.add(this.flameGroup);
  }

  resetParticle(i) {
    const idx = i * 3;
    const whichNozzle = Math.random();
    let ox = 0;
    if (whichNozzle < 0.3) ox = -0.95;
    else if (whichNozzle > 0.7) ox = 0.95;

    this.particlePositions[idx] = ox + (Math.random() - 0.5) * 0.15;
    this.particlePositions[idx + 1] = -2.4 - Math.random() * 0.4;
    this.particlePositions[idx + 2] = (Math.random() - 0.5) * 0.15;

    this.particleVelocities[i] = {
      vx: (Math.random() - 0.5) * 0.04,
      vy: -(0.08 + Math.random() * 0.12),
      vz: (Math.random() - 0.5) * 0.04
    };
  }

  initEvents() {
    // Scroll listener to move rocket down-to-upward and extinguish flames
    window.addEventListener('scroll', () => {
      if (!this.aboutSection) return;

      const rect = this.aboutSection.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // When About section is in view
      if (rect.top < windowHeight && rect.bottom > 0) {
        // Calculate scroll progress through the section (0 = entry at bottom, 1 = exit at top)
        const totalDistance = rect.height + windowHeight;
        const currentDistance = windowHeight - rect.top;
        const p = Math.min(Math.max(currentDistance / totalDistance, 0), 1);
        this.scrollProgress = p;

        // 1. Position: Moves smoothly from DOWN (-3.8) to UPWARDS (+3.4)
        this.targetY = -3.8 + p * 7.2;

        // 2. "Flames gone while scrolling":
        // At start: Flames burn bright.
        // Mid-scroll (0.28 <= p <= 0.65): Main Engine Cutoff (MECO), flame extinguishes to 0.
        // High orbit (p > 0.65): Flames completely gone, craft glides cleanly!
        if (p < 0.28) {
          this.targetFlameIntensity = 1.0;
        } else if (p < 0.65) {
          this.targetFlameIntensity = Math.max(0, 1.0 - (p - 0.28) / 0.35);
        } else {
          this.targetFlameIntensity = 0; // Completely gone
        }

        // Update Aerospace HUD Readouts
        if (this.altitudeEl) {
          const altitude = Math.round(14000 + p * 118000);
          this.altitudeEl.textContent = `${altitude.toLocaleString()} FT`;
        }

        if (this.statusEl && this.propulsionModeEl && this.flameStatusDot) {
          if (this.targetFlameIntensity <= 0.01) {
            this.statusEl.textContent = 'ORBIT REACHED // 0-G GLIDE';
            this.statusEl.style.color = '#FFFFFF';
            this.propulsionModeEl.textContent = 'ENGINES CUTOFF // ORBIT';
            this.propulsionModeEl.style.color = 'rgba(255, 255, 255, 0.6)';
            this.flameStatusDot.style.backgroundColor = '#FFFFFF';
            this.flameStatusDot.style.boxShadow = 'none';
          } else {
            this.statusEl.textContent = 'IGNITION // ASCENT';
            this.statusEl.style.color = '#E62B2B';
            this.propulsionModeEl.textContent = 'PROPULSION LIVE';
            this.propulsionModeEl.style.color = '#E62B2B';
            this.flameStatusDot.style.backgroundColor = '#E62B2B';
            this.flameStatusDot.style.boxShadow = '0 0 8px #E62B2B';
          }
        }
      }
    }, { passive: true });

    // Interactive 3D mouse rotation
    this.container.addEventListener('mousemove', (e) => {
      const rect = this.container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      this.targetRotation.y = x * 0.9;
      this.targetRotation.x = y * 0.45;
    });

    this.container.addEventListener('mouseleave', () => {
      this.targetRotation.x = 0;
      this.targetRotation.y = 0;
    });

    // Responsive Canvas Resize
    window.addEventListener('resize', () => {
      const width = this.container.clientWidth || 400;
      const height = this.container.clientHeight || 560;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    });
  }

  animate(timestamp) {
    const time = timestamp * 0.001;

    // Slowly drift space stars downwards to give feeling of ascension
    if (this.starField) {
      const pos = this.starField.geometry.attributes.position.array;
      for (let i = 1; i < pos.length; i += 3) {
        pos[i] -= 0.02;
        if (pos[i] < -9) pos[i] = 9;
      }
      this.starField.geometry.attributes.position.needsUpdate = true;
    }

    // Smooth lerp vertical position (Moving down to upwards)
    this.currentY += (this.targetY - this.currentY) * 0.08;
    this.rocketGroup.position.y = this.currentY;

    // Smooth aerodynamic banking and pitch during ascent
    const ascentPitch = (this.targetY - this.currentY) * 0.15;
    this.rocketGroup.rotation.x += (this.targetRotation.x - ascentPitch - this.rocketGroup.rotation.x) * 0.08;
    this.rocketGroup.rotation.y += (this.targetRotation.y - this.rocketGroup.rotation.y) * 0.08;

    // Gentle orbital roll & hover breath
    this.rocketGroup.rotation.z = Math.sin(time * 1.2) * 0.04;
    this.rocketGroup.position.x = Math.sin(time * 0.8) * 0.08;

    // Smooth transition of flame intensity (Flames disappearing while scrolling)
    this.flameIntensity += (this.targetFlameIntensity - this.flameIntensity) * 0.08;

    // Adjust Ambient Thruster Heat Glow & Chamber light
    if (this.thrusterGlow) {
      this.thrusterGlow.style.opacity = (this.flameIntensity * 0.85).toFixed(2);
    }

    if (this.thrusterLight) {
      this.thrusterLight.intensity = this.flameIntensity * 4.0;
    }

    if (this.mainChamberRing) {
      this.mainChamberRing.material.opacity = Math.max(0.2, this.flameIntensity);
    }

    // Dynamic 3D Flame Scale & Turbulence
    if (this.flameIntensity > 0.01) {
      this.flameGroup.visible = true;

      const flicker = 1.0 + Math.sin(time * 36) * 0.15;
      const flameScaleY = this.flameIntensity * flicker;
      const flameScaleXZ = this.flameIntensity * (0.9 + Math.cos(time * 28) * 0.1);

      this.mainFlameMesh.scale.set(flameScaleXZ, flameScaleY, flameScaleXZ);
      this.coreFlameMesh.scale.set(flameScaleXZ * 0.9, flameScaleY * 0.85, flameScaleXZ * 0.9);

      this.boosterFlames.forEach((bf, idx) => {
        const bFlicker = 1.0 + Math.sin(time * 32 + idx) * 0.15;
        bf.scale.set(flameScaleXZ * 0.85, flameScaleY * 0.75 * bFlicker, flameScaleXZ * 0.85);
      });

      // Update 3D Exhaust Particles
      const positions = this.particlePositions;
      for (let i = 0; i < this.particleCount; i++) {
        const idx = i * 3;
        const vel = this.particleVelocities[i];

        positions[idx] += vel.vx * this.flameIntensity;
        positions[idx + 1] += vel.vy * this.flameIntensity;
        positions[idx + 2] += vel.vz * this.flameIntensity;

        // Recycle particle
        if (positions[idx + 1] < -6.5 || Math.random() < 0.02) {
          this.resetParticle(i);
        }
      }
      this.particleSystem.geometry.attributes.position.needsUpdate = true;
      this.particleSystem.material.opacity = this.flameIntensity * 0.85;

    } else {
      // Flames completely gone!
      this.flameGroup.visible = false;
    }

    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame((t) => this.animate(t));
  }
}

// Initialize when DOM loaded
document.addEventListener('DOMContentLoaded', () => {
  new Rocket3DScene();
});
