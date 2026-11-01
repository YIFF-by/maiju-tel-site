(() => {
  const $ = s => document.querySelector(s);
  const menu = $('#menu-dialog');
  const opener = $('.menu-toggle');
  const header = $('#header');
  function updateHeader() {
    header?.classList.toggle('is-scrolled', window.scrollY > 28);
  }
  updateHeader();
  addEventListener('scroll', updateHeader, {passive:true});
  addEventListener('resize', updateHeader);
  addEventListener('pageshow', updateHeader);
  opener?.addEventListener('click', () => {
    menu.showModal(); document.body.classList.add('menu-open'); opener.setAttribute('aria-expanded','true');
  });
  $('.menu-close')?.addEventListener('click', () => menu.close());
  menu?.addEventListener('close', () => {
    document.body.classList.remove('menu-open'); opener.setAttribute('aria-expanded','false');
    opener.focus({preventScroll:true});
  });
  menu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.close()));

  // The immersive studio film keeps native seeking and fullscreen controls.
  const film = $('#about-video');
  if (film) {
    const error = $('[data-film-error]');
    const syncFilmError = () => { error.hidden = !film.error; };
    film.addEventListener('error', syncFilmError);
    syncFilmError();
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      film.autoplay = false;
      film.pause();
    } else {
      film.play().catch(syncFilmError);
    }
    // Pause when reading further down or leaving the tab; resume is always the viewer's choice.
    const pauseFilm = () => { if (!film.paused) film.pause(); };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        if (entries[0].intersectionRatio < 0.25 && !document.fullscreenElement) pauseFilm();
      }, {threshold:0.25}).observe(film);
    }
    document.addEventListener('visibilitychange', () => { if (document.hidden) pauseFilm(); });
    opener?.addEventListener('click', pauseFilm);
  }

  // Preserve old shared column links without restoring the removed type filters.
  if ($('[data-collection-index]')) {
    const requested = new URLSearchParams(location.search).get('series');
    const target = [...document.querySelectorAll('[data-collection]')].find(link => link.dataset.collection === requested);
    if (target) location.replace(target.href);
  }

})();
