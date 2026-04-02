// Scroll animations utility for revealing elements on scroll
export const initScrollAnimations = () => {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all elements with scroll animation classes
  const elementsToAnimate = document.querySelectorAll(
    '.scroll-fade-in, .scroll-slide-up, .scroll-slide-left, .scroll-zoom-in'
  );

  elementsToAnimate.forEach((el) => {
    observer.observe(el);
  });

  return observer;
};

// Parallax effect for images
export const initParallaxEffect = () => {
  const parallaxElements = document.querySelectorAll('[data-parallax]');

  if (parallaxElements.length === 0) return;

  window.addEventListener('scroll', () => {
    parallaxElements.forEach((element) => {
      const scrollPosition = window.pageYOffset;
      const elementOffset = element.getBoundingClientRect().top;
      const distance = scrollPosition - elementOffset;
      
      // Calculate parallax movement (slower on scroll)
      element.style.backgroundPosition = `center ${distance * 0.5}px`;
    });
  });
};

// Smooth counter animation for stats
export const animateCounter = (element, target, duration = 2000) => {
  let start = 0;
  const increment = target / (duration / 16);
  
  const updateCounter = () => {
    start += increment;
    if (start < target) {
      element.textContent = Math.floor(start) + (target.toString().includes('K') ? 'K' : '+');
      requestAnimationFrame(updateCounter);
    } else {
      element.textContent = target;
    }
  };

  updateCounter();
};

// Element hover effect
export const initHoverEffects = () => {
  const hoverElements = document.querySelectorAll('[data-hover-effect="lift"]');
  
  hoverElements.forEach((el) => {
    el.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-10px) scale(1.02)';
      this.style.boxShadow = '0 20px 40px rgba(102, 126, 234, 0.3)';
    });
    
    el.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1)';
      this.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)';
    });
  });
};

// Animated gradient background
export const createAnimatedGradientBackground = (container, colors = ['#667eea', '#764ba2']) => {
  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.zIndex = '0';
  
  container.style.position = 'relative';
  container.insertBefore(canvas, container.firstChild);
  
  const ctx = canvas.getContext('2d');
  let angle = 0;

  const animate = () => {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    angle += 0.01;
    requestAnimationFrame(animate);
  };

  animate();
};
