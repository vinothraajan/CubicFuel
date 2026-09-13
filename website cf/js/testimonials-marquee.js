/**
 * CUBIC FUEL - TESTIMONIALS CONTINUOUS MARQUEE & CENTER FOCUS
 * Right-to-left marquee where cards passing through the viewport center
 * smoothly elevate, enlarge, and gain a vibrant red ambient glow.
 */

class TestimonialsMarquee {
  constructor() {
    this.container = document.querySelector('.marquee-container');
    this.track = document.querySelector('.marquee-track');
    this.cards = document.querySelectorAll('.testimonial-card');

    if (!this.container || !this.track || this.cards.length === 0) return;

    this.checkCenterFocus = this.checkCenterFocus.bind(this);
    this.initCenterDetection();
  }

  initCenterDetection() {
    // Run center detection on each animation frame
    const loop = () => {
      this.checkCenterFocus();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  checkCenterFocus() {
    const viewportCenterX = window.innerWidth / 2;
    const focusThreshold = 220; // proximity in pixels to center

    this.cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const cardCenterX = rect.left + rect.width / 2;
      const distFromCenter = Math.abs(viewportCenterX - cardCenterX);

      if (distFromCenter < focusThreshold) {
        card.classList.add('is-center');
      } else {
        card.classList.remove('is-center');
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new TestimonialsMarquee();
});
