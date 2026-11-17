const filterButtons = [...document.querySelectorAll('[data-filter]')];
const projectCards = [...document.querySelectorAll('.project-card')];

function matchesCategory(category, filter) {
  return filter === 'all' || category === filter;
}

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    filterButtons.forEach(item => {
      const selected = item === button;
      item.classList.toggle('selected', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    projectCards.forEach(card => { card.hidden = !matchesCategory(card.dataset.category, filter); });
    const count = projectCards.filter(card => !card.hidden).length;
    document.querySelector('.project-count').textContent = window.portfolioI18n.projectCount(count);
    document.dispatchEvent(new Event('projects-filtered'));
  });
});

document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
});

document.querySelector('#contact-button').addEventListener('click', () => document.querySelector('#contact-dialog').showModal());
document.querySelector('#print-cv').addEventListener('click', () => window.print());

const navigationLinks = [...document.querySelectorAll('.nav-link')];
const sections = navigationLinks.map(link => document.querySelector(link.getAttribute('href')));
let navigationUpdatePending = false;
function updateNavigation() {
  const threshold = window.innerWidth <= 650 ? 140 : 160;
  let current = sections[0];
  let closestTop = -Infinity;
  sections.forEach(section => {
    const top = section.getBoundingClientRect().top;
    if (top <= threshold && (top > closestTop || (top === closestTop && `#${section.id}` === window.location.hash))) {
      current = section;
      closestTop = top;
    }
  });
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8) current = sections[sections.length - 1];
  navigationLinks.forEach(link => {
    const active = link.getAttribute('href') === `#${current.id}`;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  navigationUpdatePending = false;
}
window.addEventListener('scroll', () => {
  if (!navigationUpdatePending) {
    navigationUpdatePending = true;
    window.requestAnimationFrame(updateNavigation);
  }
}, { passive: true });
window.addEventListener('hashchange', updateNavigation);
updateNavigation();
function updateProjectCountLanguage() {
  document.querySelector('.project-count').textContent = window.portfolioI18n.projectCount(projectCards.filter(card => !card.hidden).length);
}
document.addEventListener('portfolio-language-change', updateProjectCountLanguage);
updateProjectCountLanguage();

console.assert(matchesCategory('tools', 'all'), 'All must include tools');
console.assert(matchesCategory('commercial', 'commercial'), 'Matching category must be included');
console.assert(!matchesCategory('personal', 'tools'), 'Other categories must be excluded');
