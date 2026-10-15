// ============================================================
// SITE CONFIG — change name and social links here only
// (an empty url hides that icon)
// ============================================================
const SITE = {
  name: 'FABIO ENRICO VIGANÒ',
  socials: [
    { label: 'Instagram', url: 'https://www.instagram.com/_fabiovig/', icon: 'img/social/instagram.png' },
    { label: 'LinkedIn',  url: '', icon: 'img/social/linkedin.png' },
    { label: 'Behance',   url: '', icon: 'img/social/behance.png' }
  ]
};

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = window.matchMedia('(hover: hover)').matches;

// apply site name everywhere it appears
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.logo, .side-logo').forEach(el => { el.textContent = SITE.name; });
});

// hide gallery tiles whose image/video file is missing, so placeholders never show as broken
document.addEventListener('DOMContentLoaded', () => {
  const hide = item => { if (item) item.remove(); };
  document.querySelectorAll('.gallery .item img').forEach(img => {
    if (img.complete && img.naturalWidth === 0) hide(img.closest('.item'));
    else img.addEventListener('error', () => hide(img.closest('.item')), { once: true });
  });
  document.querySelectorAll('.gallery .item video').forEach(video => {
    video.addEventListener('error', () => hide(video.closest('.item')), { once: true });
  });
});

// smooth scroll for in-page anchors
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
});

// hamburger toggle
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  if (!hamburger) return;
  const header = document.querySelector('.header');
  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = header.classList.toggle('nav-open');
    hamburger.setAttribute('aria-expanded', String(open));
  });
  // close nav when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.header')) {
      header.classList.remove('nav-open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });
});

// set copyright year in sidebar footer
document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('copy-year');
  if (el) el.textContent = new Date().getFullYear();
});

// add social shortcuts to desktop side menu
document.addEventListener('DOMContentLoaded', () => {
  const sideLinks = document.querySelector('.side-nav .side-links');
  if (!sideLinks || sideLinks.querySelector('.side-socials')) return;
  const active = SITE.socials.filter(s => s.url);
  if (!active.length) return;

  const socialWrap = document.createElement('div');
  socialWrap.className = 'side-socials';
  socialWrap.innerHTML = active.map(s => `
    <a href="${s.url}" target="_blank" rel="noopener noreferrer" aria-label="${s.label}" title="${s.label}">
      <img src="${s.icon}" alt="${s.label}">
    </a>`).join('');

  sideLinks.appendChild(socialWrap);
});

// white text caption at bottom of each image tile (customizable)
document.addEventListener('DOMContentLoaded', () => {
  const pageNameByFile = {
    'index.html': 'Selected Works',
    'corporate.html': 'Corporate',
    'interiors.html': 'Interiors',
    'art-exhibitions-design.html': 'Art Exhibitions & Design',
    'portraits.html': 'Portraits'
  };

  const currentFile = (window.location.pathname || '').split('/').pop() || 'index.html';
  const seriesName = pageNameByFile[currentFile] || 'Series';

  document.querySelectorAll('.gallery .item').forEach((item, index) => {
    if (item.querySelector('.item-caption')) return;

    const media = item.querySelector('img, video');
    if (!media) return;

    const customTitle = item.getAttribute('data-title') || media.getAttribute('data-title');
    const fallbackTitle = `${seriesName} ${String(index + 1).padStart(2, '0')}`;
    const captionText = (customTitle || fallbackTitle).trim();
    if (!captionText) return;

    const caption = document.createElement('span');
    caption.className = 'item-caption';
    caption.textContent = captionText;
    item.classList.add('has-caption');
    item.appendChild(caption);
  });
});

// mobile footer: reuse desktop sidebar footer content at page bottom
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.mobile-page-footer')) return;
  const sourceFooter = document.querySelector('.side-footer');
  if (!sourceFooter) return;

  const mobileFooter = document.createElement('footer');
  mobileFooter.className = 'mobile-page-footer';
  mobileFooter.innerHTML = sourceFooter.innerHTML;
  document.body.appendChild(mobileFooter);
});

// tiny dynamic scroll-to-top button
document.addEventListener('DOMContentLoaded', () => {
  const button = document.createElement('button');
  button.className = 'back-to-top';
  button.setAttribute('aria-label', 'Back to top');
  button.textContent = '↑';
  document.body.appendChild(button);

  const toggleVisibility = () => {
    if (window.scrollY > 500) button.classList.add('is-visible');
    else button.classList.remove('is-visible');
  };

  window.addEventListener('scroll', toggleVisibility, { passive: true });
  toggleVisibility();

  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
});

// ============================================================
// MOTION
// ============================================================

// reveal tiles as they scroll into view (staggered)
document.addEventListener('DOMContentLoaded', () => {
  const items = document.querySelectorAll('.gallery .item, .text-block > *');
  if (prefersReducedMotion || !('IntersectionObserver' in window)) return;

  document.documentElement.classList.add('js-reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  items.forEach((item, i) => {
    item.style.setProperty('--reveal-delay', `${(i % 4) * 80}ms`);
    io.observe(item);
  });
});

// video tiles: play on hover (desktop) or while visible (touch devices)
document.addEventListener('DOMContentLoaded', () => {
  const videos = document.querySelectorAll('.gallery .item video');
  videos.forEach(v => { v.muted = true; v.loop = true; v.playsInline = true; });
  if (prefersReducedMotion) return;

  if (canHover) {
    videos.forEach(v => {
      const item = v.closest('.item');
      item.addEventListener('mouseenter', () => { v.play().catch(() => {}); });
      item.addEventListener('mouseleave', () => { v.pause(); });
    });
  } else if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.play().catch(() => {});
        else entry.target.pause();
      });
    }, { threshold: 0.6 });
    videos.forEach(v => io.observe(v));
  }
});

// hero video: pause when off-screen (saves battery), respect reduced motion
document.addEventListener('DOMContentLoaded', () => {
  const hero = document.querySelector('.hero-media');
  if (!hero) return;
  if (prefersReducedMotion) { hero.removeAttribute('autoplay'); hero.pause(); return; }
  hero.play().catch(() => {});
  if (!('IntersectionObserver' in window)) return;
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) hero.play().catch(() => {});
    else hero.pause();
  }, { threshold: 0.1 }).observe(hero);
});

// Grid / Carousel toggle + carousel behavior (images and videos)
(function(){
  let overlay = null;
  let media = [];
  let index = 0;

  function collectMedia() {
    media = Array.from(document.querySelectorAll('.gallery .item')).map(item => {
      const el = item.querySelector('img, video');
      if (!el) return null;
      return { type: el.tagName.toLowerCase(), src: el.currentSrc || el.getAttribute('src'), poster: el.getAttribute('poster') || '' };
    }).filter(Boolean);
  }

  function createOverlay() {
    overlay = document.createElement('div');
    overlay.className = 'carousel-overlay';
    overlay.innerHTML = `
      <div class="carousel-stage">
        <button class="carousel-close" aria-label="Close">✕</button>
        <div class="carousel-nav left" data-action="prev"></div>
        <div class="carousel-nav right" data-action="next"></div>
        <div class="carousel-media"></div>
        <div class="carousel-counter"></div>
      </div>`;
    document.body.appendChild(overlay);

    overlay.querySelector('.carousel-nav.left').addEventListener('click', prevImage);
    overlay.querySelector('.carousel-nav.right').addEventListener('click', nextImage);
    overlay.querySelector('.carousel-close').addEventListener('click', closeCarousel);

    // key navigation
    document.addEventListener('keydown', onKey);
  }

  function showImage(i) {
    if (!media.length) return;
    if (!overlay) createOverlay();
    index = (i + media.length) % media.length;
    const m = media[index];
    const holder = overlay.querySelector('.carousel-media');
    holder.innerHTML = '';
    const el = document.createElement(m.type === 'video' ? 'video' : 'img');
    el.src = m.src;
    if (m.type === 'video') {
      Object.assign(el, { muted: true, loop: true, autoplay: true, playsInline: true, controls: true });
      if (m.poster) el.poster = m.poster;
    } else {
      el.alt = '';
    }
    holder.appendChild(el);
    const counter = overlay.querySelector('.carousel-counter');
    if (counter) counter.textContent = `${index+1} / ${media.length}`;
  }

  function nextImage() { showImage(index + 1); }
  function prevImage() { showImage(index - 1); }

  function onKey(e) {
    if (!overlay) return;
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'Escape') closeCarousel();
  }

  function closeCarousel() {
    if (!overlay) return;
    document.removeEventListener('keydown', onKey);
    overlay.remove();
    overlay = null;
    // update toggle UI if present
    const btn = document.getElementById('view-toggle');
    if (btn) { btn.setAttribute('aria-pressed','false'); btn.textContent = 'Carousel view'; }
  }

  // toggle handler
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('#view-toggle');
    if (!btn) return;
    collectMedia();
    const pressed = btn.getAttribute('aria-pressed') === 'true';
    if (pressed) {
      // switch to grid
      closeCarousel();
      btn.setAttribute('aria-pressed','false');
      btn.textContent = 'Carousel view';
    } else {
      // open carousel at first image
      btn.setAttribute('aria-pressed','true');
      btn.textContent = 'Grid view';
      showImage(0);
    }
  });

  // open on thumbnail click
  document.addEventListener('click', (e) => {
    const item = e.target.closest('.gallery .item');
    if (!item) return;
    const btn = document.getElementById('view-toggle');
    collectMedia();
    const items = Array.from(document.querySelectorAll('.gallery .item')).filter(it => it.querySelector('img, video'));
    const idx = items.indexOf(item);
    if (idx >= 0) {
      // ensure toggle shows carousel state
      if (btn) { btn.setAttribute('aria-pressed','true'); btn.textContent = 'Grid view'; }
      showImage(idx);
    }
  });

  function updateLandingGridTiles() {
    const landingGalleries = Array.from(document.querySelectorAll('.gallery.landing-grid'));
    if (!landingGalleries.length) return;

    const markWide = (item, width, height) => {
      if (!width || !height) return;
      if (width / height >= 1.05) item.classList.add('tile-wide');
      else item.classList.remove('tile-wide');
    };

    landingGalleries.forEach((landingGallery) => {
      landingGallery.querySelectorAll('.item').forEach((item) => {
        const img = item.querySelector('img');
        const video = item.querySelector('video');

        if (img) {
          if (img.complete && img.naturalWidth && img.naturalHeight) {
            markWide(item, img.naturalWidth, img.naturalHeight);
          } else {
            img.addEventListener('load', () => {
              markWide(item, img.naturalWidth, img.naturalHeight);
            }, { once: true });
          }
        }

        if (video) {
          if (video.videoWidth && video.videoHeight) {
            markWide(item, video.videoWidth, video.videoHeight);
          } else {
            video.addEventListener('loadedmetadata', () => {
              markWide(item, video.videoWidth, video.videoHeight);
            }, { once: true });
          }
        }
      });
    });
  }

  // add masonry class to non-landing galleries and initialize landing tiles
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.gallery:not(.landing-grid)').forEach(g => g.classList.add('masonry'));
    updateLandingGridTiles();
  });
})();

// mark current page link as active in the sidebar and mobile nav
document.addEventListener('DOMContentLoaded', function() {
  try {
    var links = Array.from(document.querySelectorAll('.side-nav .side-links a, .header nav a'));
    if (!links.length) return;
    var currentFile = (window.location.pathname || '').split('/').pop();
    if (!currentFile) currentFile = 'index.html';

    links.forEach(function(link){
      var href = link.getAttribute('href') || '';
      var linkFile = href.split('/').pop().split('#')[0];
      if (!linkFile) return;
      if (linkFile === currentFile) {
        link.classList.add('active');
        link.setAttribute('aria-current','page');
      }
    });
  } catch (e) { /* no-op */ }
});
