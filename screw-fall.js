const image = document.querySelector('#gallery-image');
const video = document.querySelector('#gallery-video');
const caption = document.querySelector('#gallery-caption');
const originalLink = document.querySelector('#open-original-video');
const mediaButtons = [...document.querySelectorAll('[data-media-src]')];
let selectedButton;

function selectMedia(button) {
  if (selectedButton === button) return;
  video.pause();
  video.removeAttribute('src');
  const isVideo = button.dataset.mediaType === 'video';
  image.hidden = isVideo;
  video.hidden = !isVideo;
  originalLink.hidden = !isVideo;
  if (isVideo) {
    video.src = button.dataset.mediaSrc;
    originalLink.href = button.dataset.mediaSrc;
    video.setAttribute('aria-label', button.dataset.mediaLabel);
  } else {
    image.src = button.dataset.mediaSrc;
    image.alt = `Screw fall — ${button.dataset.mediaLabel}`;
  }
  video.load();
  caption.textContent = window.portfolioI18n.t(button.dataset.mediaLabel);
  selectedButton = button;
  mediaButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
}

function playSelectedVideo() {
  video.play().catch(error => {
    if (error.name === 'AbortError') return;
    caption.textContent = window.portfolioI18n.t('Press Play in the video controls. If playback fails, open the original video.');
  });
}

mediaButtons.forEach(button => button.addEventListener('click', () => {
  selectMedia(button);
  if (button.dataset.mediaType === 'video') playSelectedVideo();
}));
video.addEventListener('error', () => {
  if (!video.hasAttribute('src')) return;
  const error = video.error;
  caption.textContent = `${window.portfolioI18n.t('Video error')} ${error.code}: ${error.message || window.portfolioI18n.t('No decoder details available.')} ${window.portfolioI18n.t('Open the original video to check playback.')}`;
});
document.querySelector('#watch-gameplay').addEventListener('click', () => {
  selectMedia(mediaButtons.find(button => button.dataset.mediaLabel === 'Gameplay'));
  playSelectedVideo();
});
window.addEventListener('pagehide', () => video.pause());
document.addEventListener('visibilitychange', () => {
  if (document.hidden) video.pause();
});
selectMedia(mediaButtons.find(button => button.dataset.mediaLabel === 'Gameplay'));

document.addEventListener('portfolio-language-change', () => {
  caption.textContent = window.portfolioI18n.t(selectedButton.dataset.mediaLabel);
});
