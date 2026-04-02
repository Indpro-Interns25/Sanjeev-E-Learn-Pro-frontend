// Advanced animation and effect utilities for enhanced UI/UX

/**
 * Magnetic cursor effect - makes elements follow mouse
 * Usage: Add to hover elements for interactive feedback
 */
export const initMagneticEffect = (selector) => {
  const elements = document.querySelectorAll(selector);
  
  elements.forEach((el) => {
    el.addEventListener('mousemove', function(e) {
      const { left, top, width, height } = this.getBoundingClientRect();
      const x = (e.clientX - left - width / 2) * 0.2;
      const y = (e.clientY - top - height / 2) * 0.2;
      
      this.style.transform = `translate(${x}px, ${y}px)`;
    });
    
    el.addEventListener('mouseleave', function() {
      this.style.transform = 'translate(0, 0)';
    });
  });
};

/**
 * Ripple effect on click
 * Usage: Add data-ripple attribute to clickable elements
 */
export const initRippleEffect = () => {
  const rippleElements = document.querySelectorAll('[data-ripple]');
  
  rippleElements.forEach((el) => {
    el.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      ripple.classList.add('ripple');
      
      this.appendChild(ripple);
      
      setTimeout(() => ripple.remove(), 600);
    });
  });
};

/**
 * Staggered animation for multiple elements
 * Usage: Pass array of elements and delay increment
 */
export const initStaggerAnimation = (elements, delayIncrement = 0.1) => {
  elements.forEach((el, index) => {
    el.style.animationDelay = `${index * delayIncrement}s`;
  });
};

/**
 * Gradient animation on text
 * Usage: Add data-gradient-text attribute
 */
export const initGradientText = () => {
  const gradientTexts = document.querySelectorAll('[data-gradient-text]');
  
  gradientTexts.forEach((el) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = el.offsetWidth;
    canvas.height = el.offsetHeight;
    
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(0.5, '#764ba2');
    gradient.addColorStop(1, '#667eea');
    
    ctx.font = window.getComputedStyle(el).font;
    ctx.fillStyle = gradient;
    ctx.fillText(el.textContent, 0, el.offsetHeight * 0.75);
  });
};

/**
 * Reveal animation on scroll
 * Usage: Elements with data-reveal will animate in when in viewport
 */
export const initRevealOnScroll = () => {
  const revealElements = document.querySelectorAll('[data-reveal]');
  
  const config = {
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, config);
  
  revealElements.forEach((el) => observer.observe(el));
};

/**
 * Text blur animation - unblurs on hover
 * Usage: Wrap text in element with data-text-blur
 */
export const initTextBlur = () => {
  const blurTexts = document.querySelectorAll('[data-text-blur]');
  
  blurTexts.forEach((el) => {
    el.style.filter = 'blur(3px)';
    el.style.transition = 'filter 0.4s ease';
    
    el.addEventListener('mouseenter', function() {
      this.style.filter = 'blur(0px)';
    });
    
    el.addEventListener('mouseleave', function() {
      this.style.filter = 'blur(3px)';
    });
  });
};

/**
 * Counter animation with formatting
 * Usage: data-counter="1000" data-duration="2000"
 */
export const initCounterAnimation = () => {
  const counters = document.querySelectorAll('[data-counter]');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
        entry.target.classList.add('counted');
        const target = parseInt(entry.target.dataset.counter);
        const duration = parseInt(entry.target.dataset.duration) || 2000;
        animateValue(entry.target, 0, target, duration);
        observer.unobserve(entry.target);
      }
    });
  });
  
  counters.forEach((el) => observer.observe(el));
};

function animateValue(element, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    element.textContent = Math.floor(progress * (end - start) + start).toLocaleString();
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

/**
 * Custom cursor effect
 * Usage: Initialize globally
 */
export const initCustomCursor = () => {
  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  document.body.appendChild(cursor);
  
  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });
  
  document.addEventListener('mousedown', () => {
    cursor.classList.add('active');
  });
  
  document.addEventListener('mouseup', () => {
    cursor.classList.remove('active');
  });
};

/**
 * Keyboard shortcuts for animations
 * Usage: Pass object with key->action mapping
 */
export const initKeyboardShortcuts = (shortcuts = {}) => {
  document.addEventListener('keydown', (e) => {
    if (shortcuts[e.key]) {
      shortcuts[e.key]();
    }
  });
};

/**
 * Intersection observer for lazy animations
 * Usage: Add data-lazy-animate attribute
 */
export const initLazyAnimations = () => {
  const lazyElements = document.querySelectorAll('[data-lazy-animate]');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const animation = entry.target.dataset.lazyAnimate;
        entry.target.style.animation = animation;
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  
  lazyElements.forEach((el) => observer.observe(el));
};

/**
 * Parallax background effect
 * Usage: Add data-parallax="0.5" to elements
 */
export const initAdvancedParallax = () => {
  const parallaxElements = document.querySelectorAll('[data-parallax]');
  
  window.addEventListener('scroll', () => {
    parallaxElements.forEach((el) => {
      const speed = parseFloat(el.dataset.parallax);
      const yOffset = window.pageYOffset;
      el.style.backgroundPosition = `center ${yOffset * speed}px`;
    });
  }, { passive: true });
};

/**
 * Initialize all advanced effects
 * Call this in main component useEffect
 */
export const initAllAdvancedEffects = () => {
  initRevealOnScroll();
  initCounterAnimation();
  initRippleEffect();
  initLazyAnimations();
  initAdvancedParallax();
};

export default {
  initMagneticEffect,
  initRippleEffect,
  initStaggerAnimation,
  initGradientText,
  initRevealOnScroll,
  initTextBlur,
  initCounterAnimation,
  initCustomCursor,
  initKeyboardShortcuts,
  initLazyAnimations,
  initAdvancedParallax,
  initAllAdvancedEffects
};
