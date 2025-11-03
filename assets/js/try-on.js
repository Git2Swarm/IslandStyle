(function () {
  const app = document.getElementById('try-on-app');
  if (!app) return;

  const wigs = Array.isArray(window.TRY_ON_WIGS) ? window.TRY_ON_WIGS : [];
  const samplePortrait = window.TRY_ON_SAMPLE_PORTRAIT || '';

  const fileInput = app.querySelector('#portrait-input');
  const sampleButton = app.querySelector('#load-sample');
  const resetButton = app.querySelector('#reset-portrait');
  const feedback = app.querySelector('[data-role="upload-feedback"]');
  const placeholder = app.querySelector('[data-role="placeholder"]');
  const previewBase = app.querySelector('[data-role="preview-base"]');
  const wigOverlay = app.querySelector('[data-role="wig-overlay"]');
  const favoritesList = app.querySelector('[data-role="favorites"]');
  const favoritesEmpty = app.querySelector('[data-role="favorites-empty"]');
  const wigName = app.querySelector('[data-role="wig-name"]');
  const wigColor = app.querySelector('[data-role="wig-color"]');
  const wigDescription = app.querySelector('[data-role="wig-description"]');
  const controls = app.querySelector('[data-role="controls"]');
  const scaleInput = app.querySelector('#scale-control');
  const offsetXInput = app.querySelector('#offset-x-control');
  const offsetYInput = app.querySelector('#offset-y-control');
  const downloadButton = app.querySelector('#download-result');

  let activeWig = null;
  let portraitReady = false;

  function setFeedback(message, tone = 'muted') {
    if (!feedback) return;
    feedback.textContent = message;
    feedback.dataset.tone = tone;
  }

  function ensureOverlayVisibility() {
    if (!wigOverlay) return;
    wigOverlay.hidden = !(portraitReady && activeWig);
  }

  function updateDownloadState() {
    if (!downloadButton) return;
    downloadButton.disabled = !(portraitReady && activeWig);
  }

  function updateOverlayStyles() {
    if (!wigOverlay) return;
    const scale = scaleInput ? Number(scaleInput.value) || 100 : 100;
    const offsetX = offsetXInput ? Number(offsetXInput.value) || 0 : 0;
    const offsetY = offsetYInput ? Number(offsetYInput.value) || 0 : 0;

    wigOverlay.style.setProperty('--wig-scale', (scale / 100).toFixed(2));
    wigOverlay.style.setProperty('--wig-offset-x', offsetX);
    wigOverlay.style.setProperty('--wig-offset-y', offsetY);
  }

  function renderFavorites() {
    if (!favoritesList) return;
    favoritesList.innerHTML = '';

    if (!wigs.length) {
      if (favoritesEmpty) favoritesEmpty.hidden = false;
      return;
    }

    if (favoritesEmpty) favoritesEmpty.hidden = true;

    wigs.forEach((wig) => {
      const li = document.createElement('li');
      li.className = 'favorite-item';

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'favorite-card';
      if (activeWig && activeWig.id === wig.id) {
        button.classList.add('is-active');
      }
      button.setAttribute('aria-pressed', String(Boolean(activeWig && activeWig.id === wig.id)));
      button.innerHTML = `
        <img class="favorite-card__image" src="${wig.thumb}" alt="" loading="lazy" />
        <span class="favorite-card__meta">
          <span class="favorite-card__name">${wig.name}</span>
          <span class="favorite-card__color">${wig.color}</span>
        </span>
      `;
      button.addEventListener('click', () => selectWig(wig));

      li.appendChild(button);
      favoritesList.appendChild(li);
    });
  }

  function applyWigDetails(wig) {
    if (!wig) return;
    if (wigOverlay) {
      wigOverlay.src = wig.overlay;
      wigOverlay.style.setProperty('--wig-width-percent', String(wig.widthPercent || 80));
    }
    if (scaleInput) {
      scaleInput.value = String(wig.defaultScale || 100);
    }
    if (offsetXInput) {
      offsetXInput.value = String(wig.defaultOffsetX || 0);
    }
    if (offsetYInput) {
      offsetYInput.value = String(wig.defaultOffsetY || 0);
    }
    if (wigName) wigName.textContent = wig.name;
    if (wigColor) wigColor.textContent = wig.color;
    if (wigDescription) wigDescription.textContent = wig.description;
    updateOverlayStyles();
    ensureOverlayVisibility();
    updateDownloadState();
  }

  function selectWig(wig) {
    activeWig = wig;
    applyWigDetails(wig);
    renderFavorites();
  }

  function resetPortrait() {
    if (previewBase) {
      previewBase.removeAttribute('src');
      previewBase.hidden = true;
    }
    if (placeholder) placeholder.hidden = false;
    portraitReady = false;
    ensureOverlayVisibility();
    if (controls) controls.hidden = true;
    setFeedback('Portrait cleared. Upload a new image to continue.', 'muted');
    updateDownloadState();
  }

  function loadPortrait(dataUrl, message) {
    if (!previewBase) return;
    portraitReady = false;
    previewBase.onload = () => {
      portraitReady = true;
      ensureOverlayVisibility();
      updateDownloadState();
    };
    previewBase.src = dataUrl;
    previewBase.hidden = false;
    if (placeholder) placeholder.hidden = true;
    if (controls) controls.hidden = false;
    setFeedback(message, 'success');
  }

  function handleFileSelection(file) {
    if (!file) return;
    if (!/^image\/(jpe?g|png)$/i.test(file.type)) {
      setFeedback('Please upload a JPG or PNG portrait.', 'warning');
      return;
    }
    const maxBytes = 8 * 1024 * 1024;
    if (file.size > maxBytes) {
      setFeedback('Portrait is larger than 8 MB. Choose a smaller file.', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target && event.target.result;
      if (typeof result === 'string') {
        loadPortrait(result, 'Portrait uploaded. Select a wig to begin styling.');
      } else {
        setFeedback('Unable to read the selected file. Please try again.', 'warning');
      }
    };
    reader.onerror = () => {
      setFeedback('Portrait upload failed. Please try again.', 'warning');
    };
    reader.readAsDataURL(file);
  }

  function loadSamplePortrait() {
    if (!samplePortrait) {
      setFeedback('Sample portrait is not available in this demo build.', 'warning');
      return;
    }
    loadPortrait(samplePortrait, 'Sample portrait ready. Fine-tune the wig placement for best alignment.');
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Failed to load image.'));
      image.src = src;
    });
  }

  async function downloadComposite() {
    if (!portraitReady || !activeWig || !previewBase || !wigOverlay) {
      return;
    }

    try {
      const [baseImage, overlayImage] = await Promise.all([
        loadImage(previewBase.src),
        loadImage(wigOverlay.src),
      ]);

      const canvas = document.createElement('canvas');
      const naturalWidth = baseImage.naturalWidth || baseImage.width || 900;
      const naturalHeight = baseImage.naturalHeight || baseImage.height || 1200;
      canvas.width = naturalWidth;
      canvas.height = naturalHeight;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(baseImage, 0, 0, naturalWidth, naturalHeight);

      const widthPercent = Number(activeWig.widthPercent || 80) / 100;
      const scale = Number(scaleInput ? scaleInput.value : 100) / 100;
      const offsetXPercent = Number(offsetXInput ? offsetXInput.value : 0) / 100;
      const offsetYPercent = Number(offsetYInput ? offsetYInput.value : 0) / 100;
      const overlayWidth = naturalWidth * widthPercent * scale;
      const overlayAspect = overlayImage.naturalHeight
        ? overlayImage.naturalHeight / overlayImage.naturalWidth
        : 1;
      const overlayHeight = overlayWidth * overlayAspect;
      const centerX = naturalWidth / 2 + naturalWidth * offsetXPercent;
      const centerY = naturalHeight / 2 + naturalHeight * offsetYPercent;
      const drawX = centerX - overlayWidth / 2;
      const drawY = centerY - overlayHeight / 2;

      ctx.drawImage(overlayImage, drawX, drawY, overlayWidth, overlayHeight);

      canvas.toBlob((blob) => {
        if (!blob) {
          setFeedback('Unable to export the try-on preview. Please try again.', 'warning');
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const fileName = `${activeWig.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-try-on.png`;
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setFeedback('Composite downloaded to your device.', 'success');
      }, 'image/png');
    } catch (error) {
      console.error(error);
      setFeedback('Something went wrong while preparing the download.', 'warning');
    }
  }

  if (fileInput) {
    fileInput.addEventListener('change', (event) => {
      const target = event.target;
      const files = target && target.files;
      if (files && files[0]) {
        handleFileSelection(files[0]);
      }
      fileInput.value = '';
    });
  }

  if (sampleButton) {
    sampleButton.addEventListener('click', () => {
      loadSamplePortrait();
    });
  }

  if (resetButton) {
    resetButton.addEventListener('click', () => {
      resetPortrait();
    });
  }

  if (scaleInput) {
    scaleInput.addEventListener('input', () => {
      updateOverlayStyles();
    });
  }

  if (offsetXInput) {
    offsetXInput.addEventListener('input', () => {
      updateOverlayStyles();
    });
  }

  if (offsetYInput) {
    offsetYInput.addEventListener('input', () => {
      updateOverlayStyles();
    });
  }

  if (downloadButton) {
    downloadButton.addEventListener('click', () => {
      downloadComposite();
    });
  }

  renderFavorites();
  if (wigs.length) {
    selectWig(wigs[0]);
  } else {
    if (wigName) wigName.textContent = 'Add favorites to begin';
    if (wigColor) wigColor.textContent = 'Update assets/js/try-on-data.js with your saved wig styles.';
  }

  if (controls) controls.hidden = true;
  ensureOverlayVisibility();
  updateDownloadState();
  setFeedback('Upload a portrait or load the sample to begin.', 'muted');
})();
