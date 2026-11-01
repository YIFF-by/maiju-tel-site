(() => {
  // Keep the existing video elements and controls; change only media delivery.
  let library;
  function loadHls() {
    if (!library) library = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = '/maiju-tel-site/assets/vendor/hls-1.6.15.min.js';
      script.onload = () => resolve(window.Hls);
      script.onerror = () => reject(new Error('Video library failed to load'));
      document.head.append(script);
    });
    return library;
  }
  for (const video of document.querySelectorAll('video[data-hls-src]')) {
    const src = matchMedia('(max-width: 700px)').matches && video.dataset.hlsMobile
      ? video.dataset.hlsMobile : video.dataset.hlsSrc;
    const errorMessage = document.querySelector('[data-film-error]');
    const showError = () => { if (errorMessage) errorMessage.hidden = false; };
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      continue;
    }
    loadHls().then(Hls => {
      if (!Hls.isSupported()) { showError(); return; }
      const player = new Hls({maxBufferLength: 20, backBufferLength: 20});
      player.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) { showError(); player.destroy(); }
      });
      player.on(Hls.Events.MANIFEST_PARSED, () => {
        if (video.autoplay && !document.hidden) video.play().catch(() => {});
      });
      player.attachMedia(video);
      player.loadSource(src);
      // Release segment buffers when the document is actually discarded.
      addEventListener('pagehide', event => { if (!event.persisted) player.destroy(); });
    }).catch(showError);
  }
})();
