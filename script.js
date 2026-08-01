const giftOverlay = document.getElementById('giftOverlay');
const giftBox = document.getElementById('giftBox');
const giftText = document.getElementById('giftText');
const openedMessage = document.getElementById('openedMessage');
const mainContent = document.getElementById('mainContent');
const typingText = document.getElementById('typingText');
const audioToggle = document.querySelector('.audio-toggle');
const volumeSlider = document.getElementById('volumeSlider');
const audioStatus = document.getElementById('audioStatus');
const bgMusic = document.getElementById('bgMusic');
const soundClick = document.getElementById('soundClick');
const soundOpen = document.getElementById('soundOpen');
const soundFireworks = document.getElementById('soundFireworks');
const galleryGrid = document.getElementById('galleryGrid');
const imageModal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const closeModal = document.getElementById('closeModal');
const celebrateButton = document.getElementById('celebrateButton');

let typingIndex = 0;
const typingMessage = 'You are my light, my joy, my forever.';
const imageManifestUrl = 'assets/images/manifest.json';
const fallbackImages = [
  'assets/images/rizzu.png'
];

function playSynthSound(type) {
  if (!window.AudioContext && !window.webkitAudioContext) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioContext();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  let duration = 0.12;
  let frequency = 440;

  if (type === 'click') {
    frequency = 880;
    duration = 0.08;
  } else if (type === 'open') {
    frequency = 520;
    duration = 0.16;
  } else if (type === 'fireworks') {
    frequency = 330;
    duration = 0.3;
  }

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);

  gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.16, audioCtx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

  osc.connect(gain).connect(audioCtx.destination);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + duration);
}

function playAudio(audioElement, fallbackType) {
  if (!audioElement) return;
  audioElement.currentTime = 0;
  const promise = audioElement.play();
  if (promise !== undefined) {
    promise.catch(() => {
      audioStatus.textContent = 'Audio is unavailable; using fallback sound.';
      playSynthSound(fallbackType);
    });
  }
}

function updateAudioStatus(message) {
  if (!audioStatus) return;
  audioStatus.textContent = message;
}

function activateGift() {
  playAudio(soundClick);
  giftBox.classList.add('open');
  giftText.textContent = 'Opening your surprise...';

  setTimeout(() => {
    openedMessage.classList.add('active');
    playAudio(soundOpen, 'open');
  }, 700);

  setTimeout(() => {
    giftOverlay.classList.add('hidden');
    giftOverlay.classList.remove('active');
    mainContent.setAttribute('aria-hidden', 'false');
    mainContent.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      if (bgMusic.src) {
        playAudio(bgMusic);
        audioToggle.textContent = 'Pause Music';
      } else {
        updateAudioStatus('Background music file is missing; please add assets/music/bgmusic.mp3.');
      }
    }, 500);
  }, 1600);
}

giftBox.addEventListener('click', activateGift);

audioToggle.addEventListener('click', () => {
  if (bgMusic.paused) {
    playAudio(bgMusic);
    audioToggle.textContent = 'Pause Music';
  } else {
    bgMusic.pause();
    audioToggle.textContent = 'Play Music';
  }
});

volumeSlider.addEventListener('input', () => {
  const volumeValue = Number(volumeSlider.value);
  bgMusic.volume = volumeValue;
  soundClick.volume = volumeValue;
  soundOpen.volume = volumeValue;
  soundFireworks.volume = volumeValue;
});

function typeMessage() {
  if (typingIndex <= typingMessage.length) {
    typingText.textContent = typingMessage.slice(0, typingIndex);
    typingIndex += 1;
    setTimeout(typeMessage, 110);
  }
}

typeMessage();

function openImage(src) {
  modalImage.src = src;
  imageModal.classList.add('active');
  imageModal.setAttribute('aria-hidden', 'false');
}

function bindGalleryEvents() {
  const galleryItems = galleryGrid.querySelectorAll('.gallery-item');
  galleryItems.forEach((item) => {
    item.addEventListener('click', () => {
      const imageSrc = item.dataset.image;
      playAudio(soundClick);
      openImage(imageSrc);
    });
  });
}

function buildGallery(imageUrls) {
  galleryGrid.innerHTML = '';
  const galleryItems = imageUrls.filter((imageUrl) => !imageUrl.endsWith('/background.jpg'));
  galleryItems.forEach((imageUrl, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'gallery-item';
    button.dataset.image = imageUrl;
    button.setAttribute('aria-label', `Open memory ${index + 1}`);

    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = `Memory ${index + 1}`;
    img.loading = 'lazy';
    img.addEventListener('error', () => button.remove());

    button.appendChild(img);
    galleryGrid.appendChild(button);
  });

  if (!galleryGrid.children.length) {
    galleryGrid.innerHTML = '<p class="gallery-empty">Add images in assets/images and update assets/images/manifest.json.</p>';
  } else {
    bindGalleryEvents();
  }
}

function setPageBackground(imageFiles) {
  if (imageFiles.includes('background.jpg')) {
    document.body.style.backgroundImage = 'url("assets/images/background.jpg"), radial-gradient(circle at top, rgba(255, 214, 177, 0.16), transparent 35%), radial-gradient(circle at 20% 10%, rgba(173, 80, 190, 0.22), transparent 28%), linear-gradient(180deg, #160b2c 0%, #0d0716 45%, #14061c 100%)';
    document.body.style.backgroundSize = 'cover, auto, auto, auto';
    document.body.style.backgroundPosition = 'center, top, 20% 10%, center';
    document.body.style.backgroundRepeat = 'no-repeat, no-repeat, no-repeat, no-repeat';
  }
}

function loadGallery() {
  fetch(imageManifestUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Image manifest not found');
      }
      return response.json();
    })
    .then((manifest) => {
      if (Array.isArray(manifest) && manifest.length) {
        setPageBackground(manifest);
        const urls = manifest
          .filter((path) => !path.toLowerCase().endsWith('manifest.json'))
          .map((path) => `assets/images/${path}`);
        buildGallery(urls);
      } else {
        buildGallery(fallbackImages);
      }
    })
    .catch(() => {
      buildGallery(fallbackImages);
    });
}

loadGallery();

closeModal.addEventListener('click', () => {
  imageModal.classList.remove('active');
  imageModal.setAttribute('aria-hidden', 'true');
});

imageModal.addEventListener('click', (event) => {
  if (event.target === imageModal) {
    closeModal.click();
  }
});

celebrateButton.addEventListener('click', () => {
  playAudio(soundFireworks);
  triggerConfetti();
});

function triggerConfetti() {
  const count = 55;
  for (let i = 0; i < count; i += 1) {
    const confetti = document.createElement('span');
    confetti.className = 'confetti-piece';
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.animationDuration = `${1.2 + Math.random() * 1.2}s`;
    confetti.style.background = `hsl(${320 + Math.random() * 70}, 92%, 70%)`;
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(confetti);
    confetti.addEventListener('animationend', () => confetti.remove());
  }
}

function generateFloatingHearts() {
  const heart = document.createElement('span');
  heart.className = 'float-heart';
  heart.style.left = `${Math.random() * 100}%`;
  heart.style.animationDuration = `${5 + Math.random() * 4}s`;
  document.body.appendChild(heart);
  heart.addEventListener('animationend', () => heart.remove());
}

setInterval(generateFloatingHearts, 650);

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && imageModal.classList.contains('active')) {
    closeModal.click();
  }
});

function attachAudioErrors(audioElement, label) {
  audioElement.addEventListener('error', () => {
    updateAudioStatus(`${label} file is missing. Please add it to assets/music.`);
  });
}

attachAudioErrors(bgMusic, 'Background music');
attachAudioErrors(soundClick, 'Click sound');
attachAudioErrors(soundOpen, 'Gift opening sound');
attachAudioErrors(soundFireworks, 'Fireworks sound');

window.addEventListener('load', () => {
  bgMusic.volume = Number(volumeSlider.value);
  soundClick.volume = bgMusic.volume;
  soundOpen.volume = bgMusic.volume;
  soundFireworks.volume = bgMusic.volume;
});
