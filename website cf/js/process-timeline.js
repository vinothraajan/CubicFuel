/**
 * CUBIC FUEL - PROCESS TIMELINE CONTROLLER
 * Dynamic progress beam fill and interactive stage highlighting.
 */

class ProcessTimeline {
  constructor() {
    this.section = document.querySelector('#process');
    this.progressFill = document.querySelector('.timeline-progress-fill');
    this.stageCards = document.querySelectorAll('.stage-card');

    if (!this.section || !this.progressFill || this.stageCards.length === 0) return;

    this.initScrollFill();
  }

  initScrollFill() {
    window.addEventListener('scroll', () => {
      const rect = this.section.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // When process section is entering or in viewport
      if (rect.top < windowHeight * 0.75 && rect.bottom > 0) {
        // Calculate scroll progress through the section
        const totalDistance = rect.height + windowHeight * 0.5;
        const currentDistance = windowHeight * 0.75 - rect.top;
        const progress = Math.min(Math.max(currentDistance / totalDistance, 0), 1);

        this.progressFill.style.width = `${progress * 100}%`;

        // Highlight active stages based on progress
        const activeIndex = Math.min(
          Math.floor(progress * this.stageCards.length),
          this.stageCards.length - 1
        );

        this.stageCards.forEach((card, idx) => {
          if (idx <= activeIndex) {
            card.classList.add('active');
          } else {
            card.classList.remove('active');
          }
        });
      }
    }, { passive: true });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ProcessTimeline();
});
