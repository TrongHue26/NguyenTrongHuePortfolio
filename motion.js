const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const revealSections = [...document.querySelectorAll('#about, #skills, .projects-section, .resume-grid, .contact-section, .detail-overview, .detail-highlights, .detail-tools, .detail-more, .detail-contact')];
let revealObserver;

function configurePageMotion() {
  if (revealObserver) revealObserver.disconnect();
  revealSections.forEach(section => section.classList.remove('motion-reveal', 'motion-pending'));
  document.documentElement.classList.toggle('motion-ready', !motionPreference.matches);
  if (motionPreference.matches) return;

  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.remove('motion-pending');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.05 });

  revealSections.forEach(section => {
    if (section.getBoundingClientRect().top < window.innerHeight) return;
    section.classList.add('motion-reveal', 'motion-pending');
    revealObserver.observe(section);
  });
}

motionPreference.addEventListener('change', configurePageMotion);
window.addEventListener('pageshow', event => {
  if (event.persisted) configurePageMotion();
});
configurePageMotion();
