/**
 * CUBIC FUEL - AUTOMOTIVE PERFORMANCE SPEEDOMETER GAUGE
 * High-performance 2D Canvas Gauge with dynamic needle, red illumination,
 * tick marks up to 280, mouse responsiveness, and smooth cruising acceleration.
 */

class SpeedometerGauge {
  constructor(canvasId, readoutId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.readout = document.getElementById(readoutId);
    
    this.currentSpeed = 0;
    this.targetSpeed = 240; // High-performance growth cruising speed
    this.maxSpeed = 280;
    this.minAngle = (3 / 4) * Math.PI; // 135 degrees (bottom-left)
    this.maxAngle = (9 / 4) * Math.PI; // 405 degrees (bottom-right)
    this.angleRange = this.maxAngle - this.minAngle;
    
    this.mouseOffset = { x: 0, y: 0 };
    this.acceleration = 0.04;
    this.isHovered = false;

    this.init();
  }

  init() {
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());
    
    // Mouse reactivity
    const container = this.canvas.closest('.hero-visual-container') || this.canvas;
    container.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const dx = (e.clientX - centerX) / (rect.width / 2);
      const dy = (e.clientY - centerY) / (rect.height / 2);
      
      this.mouseOffset.x = dx;
      this.mouseOffset.y = dy;
      
      // Slight speed fluctuation based on mouse position (acceleration feel)
      this.targetSpeed = Math.min(275, Math.max(160, 240 + dx * 25));
    });

    container.addEventListener('mouseleave', () => {
      this.mouseOffset.x = 0;
      this.mouseOffset.y = 0;
      this.targetSpeed = 240;
    });

    // Start render loop
    requestAnimationFrame(() => this.animate());
  }

  handleResize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.size = Math.min(rect.width || 440, rect.height || 440);
    this.canvas.width = this.size * dpr;
    this.canvas.height = this.size * dpr;
    this.ctx.scale(dpr, dpr);
    this.center = this.size / 2;
    this.radius = this.size * 0.42;
  }

  speedToAngle(speed) {
    const fraction = Math.min(Math.max(speed, 0), this.maxSpeed) / this.maxSpeed;
    return this.minAngle + fraction * this.angleRange;
  }

  animate() {
    // Smooth easing toward targetSpeed
    this.currentSpeed += (this.targetSpeed - this.currentSpeed) * this.acceleration;
    
    this.draw();
    
    if (this.readout) {
      this.readout.textContent = Math.round(this.currentSpeed);
    }

    requestAnimationFrame(() => this.animate());
  }

  draw() {
    const ctx = this.ctx;
    const c = this.center;
    const r = this.radius;

    ctx.clearRect(0, 0, this.size, this.size);

    ctx.save();
    // Parallax tilt shift based on mouse
    ctx.translate(c + this.mouseOffset.x * 6, c + this.mouseOffset.y * 6);

    // 1. Carbon Outer Ring
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.15, 0, Math.PI * 2);
    ctx.fillStyle = '#0f0f0f';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#222222';
    ctx.stroke();

    // 2. Bezel Shadow & Subtle Red Ring
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.08, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(230, 43, 43, 0.2)';
    ctx.stroke();

    // 3. Track Arc Background (Dim)
    ctx.beginPath();
    ctx.arc(0, 0, r, this.minAngle, this.maxAngle);
    ctx.lineWidth = 6;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineCap = 'round';
    ctx.stroke();

    // 4. Active Red Illuminated Arc up to current speed
    const currentAngle = this.speedToAngle(this.currentSpeed);
    ctx.beginPath();
    ctx.arc(0, 0, r, this.minAngle, currentAngle);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#E62B2B';
    ctx.shadowColor = '#E62B2B';
    ctx.shadowBlur = 18;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.shadowBlur = 0; // reset glow

    // 5. Dial Tick Marks & Values
    const tickIntervals = [0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280];
    
    tickIntervals.forEach((val) => {
      const angle = this.speedToAngle(val);
      const isMajor = val % 40 === 0 || val === 280;
      const tickLength = isMajor ? 14 : 7;
      const isOverActive = val <= this.currentSpeed;

      const innerX = Math.cos(angle) * (r - tickLength);
      const innerY = Math.sin(angle) * (r - tickLength);
      const outerX = Math.cos(angle) * r;
      const outerY = Math.sin(angle) * r;

      ctx.beginPath();
      ctx.moveTo(innerX, innerY);
      ctx.lineTo(outerX, outerY);
      ctx.lineWidth = isMajor ? 2.5 : 1.5;
      ctx.strokeStyle = isOverActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.25)';
      ctx.stroke();

      // Number Label for major ticks
      if (isMajor) {
        const textRadius = r - 28;
        const textX = Math.cos(angle) * textRadius;
        const textY = Math.sin(angle) * textRadius;

        ctx.font = '700 11px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = isOverActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)';
        ctx.fillText(val.toString(), textX, textY);
      }
    });

    // 6. Center Branding Text inside dial
    ctx.font = '900 12px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText('GROWTH VELOCITY', 0, -r * 0.35);

    ctx.font = '700 8px Orbitron, sans-serif';
    ctx.fillStyle = '#E62B2B';
    ctx.fillText('PERFORMANCE METRIC', 0, -r * 0.22);

    // 7. Futuristic Red Needle with glow
    ctx.save();
    ctx.rotate(currentAngle);

    // Needle shadow / glow
    ctx.shadowColor = 'rgba(230, 43, 43, 0.8)';
    ctx.shadowBlur = 14;

    ctx.beginPath();
    ctx.moveTo(-16, -2);
    ctx.lineTo(r - 12, 0);
    ctx.lineTo(-16, 2);
    ctx.closePath();
    ctx.fillStyle = '#E62B2B';
    ctx.fill();

    // Center needle white laser core line
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(r - 16, 0);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();

    ctx.restore();

    // 8. Center Hub Cap
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fillStyle = '#141414';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#E62B2B';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#E62B2B';
    ctx.fill();

    ctx.restore();
  }
}

// Initialize when DOM loaded
document.addEventListener('DOMContentLoaded', () => {
  new SpeedometerGauge('speedometer-canvas', 'speedometer-value');
});
