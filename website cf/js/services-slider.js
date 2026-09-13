/**
 * CUBIC FUEL - SERVICES HORIZONTAL SLIDER & DRAWER
 * Enables smooth horizontal scrolling with prev/next buttons,
 * drag/swipe support, and service exploration drawer.
 */

class ServicesSlider {
  constructor() {
    this.track = document.querySelector('.services-carousel-track');
    this.prevBtn = document.querySelector('#services-prev');
    this.nextBtn = document.querySelector('#services-next');
    
    if (!this.track) return;

    this.cardWidth = 398; // card + gap
    this.initControls();
    this.initMouseWheel();
    this.initTouchSwipe();
    this.initDetailTriggers();
  }

  initControls() {
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => {
        this.track.scrollBy({ left: -this.cardWidth, behavior: 'smooth' });
      });
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => {
        this.track.scrollBy({ left: this.cardWidth, behavior: 'smooth' });
      });
    }
  }

  initMouseWheel() {
    // Optional smooth horizontal scroll on track hover
    this.track.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        // If track can still scroll horizontally
        const canScrollRight = this.track.scrollLeft < (this.track.scrollWidth - this.track.clientWidth - 5);
        const canScrollLeft = this.track.scrollLeft > 5;
        
        if ((e.deltaY > 0 && canScrollRight) || (e.deltaY < 0 && canScrollLeft)) {
          e.preventDefault();
          this.track.scrollLeft += e.deltaY * 0.9;
        }
      }
    }, { passive: false });
  }

  initTouchSwipe() {
    let startX = 0;
    let scrollStart = 0;

    this.track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].pageX;
      scrollStart = this.track.scrollLeft;
    }, { passive: true });

    this.track.addEventListener('touchmove', (e) => {
      const x = e.touches[0].pageX;
      const dist = startX - x;
      this.track.scrollLeft = scrollStart + dist;
    }, { passive: true });
  }

  initDetailTriggers() {
    const cards = document.querySelectorAll('.service-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        // Pre-select service in the contact form when clicking on explore!
        const serviceName = card.getAttribute('data-service');
        if (serviceName) {
          const radioOrCheckbox = document.querySelector(`.pill-option input[value="${serviceName}"]`);
          if (radioOrCheckbox) {
            radioOrCheckbox.checked = true;
          }
          // Smooth scroll down to contact section
          const contactSec = document.querySelector('#contact');
          if (contactSec) {
            contactSec.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ServicesSlider();
});
