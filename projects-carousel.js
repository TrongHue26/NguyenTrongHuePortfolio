const carousel = document.querySelector('#project-carousel');
const motionButton = document.querySelector('#projects-motion');
const preview = document.querySelector('#project-preview');
const previewVideo = document.querySelector('#project-preview-video');
const previewTitle = document.querySelector('#project-preview-title');
const previewStatus = document.querySelector('#project-preview-status');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const scrollSpeed = 28;
let userPaused = reducedMotion.matches || !finePointer.matches;
let inView = false;
let hoveredCard = null;
let focusedCard = null;
let previewCard = null;
let previewTimer;
let frameId = 0;
let previousTime = 0;
let scrollPosition = 0;
let direction = 1;
let maxScroll = 0;

function animateProjects(time) {
  if (previousTime) {
    scrollPosition += direction * scrollSpeed * Math.min((time - previousTime) / 1000, 0.05);
    if (scrollPosition >= maxScroll) {
      scrollPosition = maxScroll;
      direction = -1;
    } else if (scrollPosition <= 0) {
      scrollPosition = 0;
      direction = 1;
    }
    carousel.scrollLeft = scrollPosition;
  }
  previousTime = time;
  frameId = window.requestAnimationFrame(animateProjects);
}

function syncMotion() {
  window.cancelAnimationFrame(frameId);
  frameId = 0;
  previousTime = 0;
  scrollPosition = carousel.scrollLeft;
  maxScroll = Math.max(0, carousel.scrollWidth - carousel.clientWidth);
  motionButton.textContent = window.portfolioI18n.t(userPaused ? 'Start motion' : 'Pause motion');
  motionButton.setAttribute('aria-pressed', String(userPaused));
  if (!userPaused && !hoveredCard && !focusedCard && inView && !document.hidden && maxScroll > 1) {
    frameId = window.requestAnimationFrame(animateProjects);
  }
}

function hidePreview() {
  window.clearTimeout(previewTimer);
  preview.hidden = true;
  previewCard = null;
  previewVideo.pause();
  previewVideo.removeAttribute('src');
  previewVideo.load();
}

function showPreview(card) {
  if (previewCard === card) return;
  hidePreview();
  previewCard = card;
  previewTimer = window.setTimeout(() => {
    if (previewCard !== card || card.hidden || document.hidden || !inView) return;
    previewTitle.textContent = card.querySelector('h3').textContent;
    previewVideo.poster = card.querySelector('.project-art img').src;
    preview.hidden = false;
    const bounds = card.getBoundingClientRect();
    const padding = 12;
    const left = Math.max(padding, Math.min(bounds.right - preview.offsetWidth - padding, window.innerWidth - preview.offsetWidth - padding));
    const top = Math.max(padding, Math.min(bounds.top + padding, window.innerHeight - preview.offsetHeight - padding));
    preview.style.left = `${left}px`;
    preview.style.top = `${top}px`;
    previewStatus.textContent = window.portfolioI18n.t(reducedMotion.matches ? 'Click card to watch gameplay' : 'Muted preview · Click card to explore');
    if (reducedMotion.matches) return;
    previewVideo.muted = true;
    previewVideo.src = card.dataset.previewSrc;
    previewVideo.play().catch(error => {
      if (previewCard === card && error.name !== 'AbortError') {
        previewStatus.textContent = window.portfolioI18n.t('Click card to watch gameplay');
      }
    });
  }, 180);
}

function syncInteraction() {
  const card = hoveredCard || focusedCard;
  if (card) showPreview(card);
  else hidePreview();
  syncMotion();
}

carousel.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse' || !finePointer.matches) return;
    hoveredCard = card;
    syncInteraction();
  });
  card.addEventListener('pointerleave', () => {
    if (hoveredCard === card) hoveredCard = null;
    syncInteraction();
  });
});
carousel.addEventListener('focusin', event => {
  focusedCard = event.target.closest('.project-card');
  syncInteraction();
});
carousel.addEventListener('focusout', event => {
  focusedCard = event.relatedTarget?.closest('.project-card') || null;
  syncInteraction();
});
carousel.addEventListener('keydown', event => {
  if (event.key === 'Escape') hidePreview();
});
carousel.addEventListener('wheel', () => {
  userPaused = true;
  syncMotion();
}, { passive: true });
carousel.addEventListener('pointerdown', event => {
  if (event.pointerType === 'touch' || event.pointerType === 'pen' || event.target === carousel) {
    userPaused = true;
    hidePreview();
    syncMotion();
  }
});

motionButton.addEventListener('click', () => {
  userPaused = !userPaused;
  syncMotion();
});
function moveProjects(step) {
  userPaused = true;
  hidePreview();
  syncMotion();
  const card = [...carousel.children].find(item => !item.hidden);
  if (card) carousel.scrollBy({ left: step * (card.offsetWidth + 20), behavior: reducedMotion.matches ? 'instant' : 'smooth' });
}
document.querySelector('#projects-previous').addEventListener('click', () => moveProjects(-1));
document.querySelector('#projects-next').addEventListener('click', () => moveProjects(1));
document.addEventListener('projects-filtered', () => {
  hoveredCard = null;
  focusedCard = null;
  hidePreview();
  carousel.scrollLeft = 0;
  direction = 1;
  syncMotion();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) hidePreview();
  syncMotion();
});
window.addEventListener('pagehide', () => {
  window.cancelAnimationFrame(frameId);
  hidePreview();
});
window.addEventListener('pageshow', syncMotion);
window.addEventListener('scroll', hidePreview, { passive: true });
window.addEventListener('resize', () => {
  hidePreview();
  syncMotion();
});
function updateMotionPreference() {
  userPaused = reducedMotion.matches || !finePointer.matches;
  hidePreview();
  syncMotion();
}
reducedMotion.addEventListener('change', updateMotionPreference);
finePointer.addEventListener('change', updateMotionPreference);
new IntersectionObserver(entries => {
  inView = entries[0].isIntersecting;
  if (!inView) hidePreview();
  syncMotion();
}, { threshold: 0.15 }).observe(carousel);
new ResizeObserver(syncMotion).observe(carousel);
syncMotion();
document.addEventListener('portfolio-language-change', () => {
  syncMotion();
  previewStatus.textContent = window.portfolioI18n.t(reducedMotion.matches ? 'Click card to watch gameplay' : 'Muted preview · Click card to explore');
});
