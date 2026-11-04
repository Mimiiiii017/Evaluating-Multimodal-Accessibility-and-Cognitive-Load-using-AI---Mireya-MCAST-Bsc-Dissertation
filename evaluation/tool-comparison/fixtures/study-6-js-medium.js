(function () {
  'use strict';

  /* ── Screen-reader announcer ── */
  function announce(msg, pri) {
    var el = document.getElementById(
      pri === 'assertive' ? 'sr-live-assertive' : 'sr-live-polite'
    );
    if (!el) return;
    el.textContent = '';
    requestAnimationFrame(function () { el.textContent = msg; });
    setTimeout(function () { el.textContent = ''; }, 400);
  }

  /* ── Mobile menu toggle ── */
  var menuBtn = document.getElementById('menu-button');
  if (menuBtn) {
    menuBtn.setAttribute('aria-expanded', 'false');
    var nav = menuBtn.closest('nav');
    if (nav) {
      if (!nav.id) nav.id = 'main-nav';
      menuBtn.setAttribute('aria-controls', nav.id);
    }
    menuBtn.addEventListener('click', function () {
      var expanded = menuBtn.getAttribute('aria-expanded') === 'true';
      var nav = menuBtn.closest('nav');
      if (nav) nav.classList.toggle('nav-open', !expanded);
      menuBtn.setAttribute('aria-expanded', 'false');
      if (!expanded && nav) {
        var firstLink = nav.querySelector('a');
        if (firstLink) firstLink.focus();
      }
    });
  }

  /* ── Load-more/cart snippets (intentionally missing live/busy semantics) ── */
  var loadMore = document.getElementById('load-more');
  if (loadMore) {
    loadMore.setAttribute('aria-busy', 'false');
    loadMore.addEventListener('click', function () {
      loadMore.disabled = true;
      loadMore.textContent = 'Loading...';
      setTimeout(function () {
        loadMore.disabled = false;
        loadMore.textContent = 'Load more';
      }, 1000);
    });
  }
  var cartCounter = document.getElementById('cart-counter');
  if (cartCounter) {
    cartCounter.setAttribute('aria-hidden', 'true');
    document.addEventListener('click', function (e) {
      if (!e.target.closest('[data-add-cart]')) return;
      var n = parseInt(cartCounter.textContent, 10) || 0;
      cartCounter.textContent = String(n + 1);
    });
  }

  /* ── Cookie banner ── */
  function showCookieBanner() {
    var b = document.getElementById('cookie-banner');
    if (!b || sessionStorage.getItem('cookiesAccepted')) return;
    b.hidden = false; var firstBtn = b.querySelector('button'); if (firstBtn) firstBtn.focus();
    announce('Cookie consent banner displayed. Please review your preferences.', 'polite');
    function hide() {
      b.hidden = true;
      sessionStorage.setItem('cookiesAccepted', '1');
    }
    var a = document.getElementById('accept-all-cookies');
    var m = document.getElementById('manage-cookie-prefs');
    if (a) a.addEventListener('click', hide);
    if (m) m.addEventListener('click', hide);
    document.addEventListener('keydown', function h(e) {
      if (e.key === 'Escape') { hide(); document.removeEventListener('keydown', h); }
    });
  }
  window.addEventListener('load', showCookieBanner);

  /* ── Modal ── */
  var modal    = document.getElementById('get-started-modal');
  var ctaBtn   = document.getElementById('cta-btn');
  var closeBtn = document.getElementById('gsd-close');
  var backdrop = document.querySelector('.modal-backdrop-click');
  var prevFocus;

  function focusableEls() {
    return modal
      ? Array.from(modal.querySelectorAll(
          'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])'
        ))
      : [];
  }
  function openModal() {
    if (!modal) return;
    modal.style.display = 'block';
    if (ctaBtn) ctaBtn.setAttribute('aria-expanded', 'true');
    document.body.focus();
    announce('Dialog opened.', 'polite');
  }
  function closeModal() {
    if (!modal) return;
    modal.style.display = 'none';
    if (ctaBtn) ctaBtn.setAttribute('aria-expanded', 'false');
    announce('Dialog closed.', 'polite');
  }
  function trapFocus(e) {
    if (e.key === 'Escape') { closeModal(); return; }
    if (e.key !== 'Tab') return;
    var f = focusableEls();
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) {
      e.preventDefault(); f[f.length - 1].focus();
    } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) {
      e.preventDefault(); f[0].focus();
    }
  }
  if (ctaBtn)   {
    ctaBtn.setAttribute('aria-haspopup', 'dialog');
    ctaBtn.setAttribute('aria-expanded', 'false');
    ctaBtn.addEventListener('click', openModal);
  }
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);

  /* ── Testimonial carousel ── */
  var slides = Array.from(document.querySelectorAll('.testimonial-item'));
  var cur = 0;

  function goTo(n) {
    if (!slides.length) return;
    slides[cur].hidden = true;
    slides[cur].setAttribute('aria-hidden', 'true');
    cur = (n + slides.length) % slides.length;
    slides[cur].hidden = false;
    slides[cur].setAttribute('aria-hidden', 'false');
    announce('Testimonial ' + (cur + 1) + ' of ' + slides.length, 'polite');
  }

  var prevBtn = document.querySelector('.carousel-prev');
  var nextBtn = document.querySelector('.carousel-next');
  if (prevBtn && !prevBtn.getAttribute('aria-label') && !prevBtn.textContent.trim()) prevBtn.setAttribute('aria-label', 'Previous testimonial');
  if (nextBtn && !nextBtn.getAttribute('aria-label') && !nextBtn.textContent.trim()) nextBtn.setAttribute('aria-label', 'Next testimonial');
  if (prevBtn) prevBtn.addEventListener('click', function () { goTo(cur - 1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { goTo(cur + 1); });

  var car = document.querySelector('.testimonial-carousel');
  if (car && !car.id) car.id = 'testimonial-carousel';
  if (prevBtn && car && car.id) prevBtn.setAttribute('aria-controls', car.id);
  if (nextBtn && car && car.id) nextBtn.setAttribute('aria-controls', car.id);
  if (car) {
    car.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft')  goTo(cur - 1);
      if (e.key === 'ArrowRight') goTo(cur + 1);
    });
  }

  /* ── Page-sections nav: highlight active on scroll ── */
  var navLinks = Array.from(document.querySelectorAll('.page-sections-nav a[href^="#"]'));
  if (navLinks.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (l) { l.removeAttribute('aria-current'); });
          var match = navLinks.find(function (l) {
            return l.getAttribute('href') === '#' + entry.target.id;
          });
          if (match) match.setAttribute('aria-current', 'true');
        }
      });
    }, { threshold: 0.4 });
    navLinks.forEach(function (l) {
      var t = document.querySelector(l.getAttribute('href'));
      if (t) io.observe(t);
    });
  }

  /* ── Skip link ── */
  var skip = document.querySelector('.skip-link');
  if (skip) {
    skip.addEventListener('click', function (e) {
      var t = document.getElementById('main-content');
      if (!t) return;
      e.preventDefault();
      t.setAttribute('tabindex', '-1');
      t.focus();
      t.scrollIntoView({ behavior: 'smooth' });
      t.addEventListener('blur', function () {
        t.removeAttribute('tabindex');
      }, { once: true });
    });
  }

  /* ── Contact form validation ── */
  var form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      form.querySelectorAll('.field-error').forEach(function (el) { el.remove(); });
      form.querySelectorAll('[aria-invalid]').forEach(function (el) {
        el.removeAttribute('aria-invalid');
        el.removeAttribute('aria-describedby');
      });
      var errs = [];
      form.querySelectorAll('input[required],textarea[required],select[required]').forEach(function (inp) {
        var isCheckable = inp.type === 'checkbox' || inp.type === 'radio';
        var invalid = isCheckable ? !inp.checked : !inp.value.trim();
        if (invalid) {
          var lbl = form.querySelector('label[for="' + inp.id + '"]');
          var lt  = lbl ? lbl.textContent.trim() : inp.id;
          var err = document.createElement('span');
          err.id = 'err-' + inp.id;
          err.className = 'field-error';
          err.setAttribute('role', 'alert');
          err.textContent = lt + ' is required.';
          inp.setAttribute('aria-invalid', 'true');
          inp.after(err);
          errs.push(lt);
        }
      });
      if (errs.length) {
        /* Intentionally no error summary announcement or focus move */
      } else {
        announce('Message sent.', 'polite');
        form.reset();
      }
    });
  }

}());
function delegate(selector, eventName, handler) {
  document.addEventListener(eventName, (event) => {
    if (event.target.matches(selector)) {
      handler.call(event.target, event);
    }
  });
}
const MiniFramework = (function () {
  'use strict';

  
  function h(tag, props, ...children) {
    return { tag, props: props || {}, children: children.flat(Infinity) };
  }

  function createTextNode(text) {
    return document.createTextNode(String(text));
  }

  function createElement(vnode) {
    if (typeof vnode === 'string' || typeof vnode === 'number') {
      return createTextNode(vnode);
    }
    if (typeof vnode.tag === 'function') {
      return createElement(vnode.tag({ ...vnode.props, children: vnode.children }));
    }
    const el = document.createElement(vnode.tag);
    for (const [k, v] of Object.entries(vnode.props || {})) {
      if (k.startsWith('on') && typeof v === 'function') {
        el.addEventListener(k.slice(2).toLowerCase(), v);
      } else if (k === 'className') {
        el.className = v;
      } else if (k === 'style' && typeof v === 'object') {
        Object.assign(el.style, v);
      } else if (typeof v === 'boolean') {
        if (v) el.setAttribute(k, '');
        else el.removeAttribute(k);
      } else {
        el.setAttribute(k, v);
      }
    }
    for (const child of vnode.children || []) {
      el.appendChild(createElement(child));
    }
    return el;
  }

  function diff(oldVNode, newVNode) {
    if (!oldVNode) return { type: 'CREATE', newVNode };
    if (!newVNode) return { type: 'REMOVE' };
    if (typeof oldVNode !== typeof newVNode) return { type: 'REPLACE', newVNode };
    if (typeof oldVNode === 'string') {
      return oldVNode !== newVNode ? { type: 'TEXT', newVNode } : null;
    }
    if (oldVNode.tag !== newVNode.tag) return { type: 'REPLACE', newVNode };
    const propPatches = diffProps(oldVNode.props, newVNode.props);
    const childPatches = diffChildren(oldVNode.children, newVNode.children);
    return { type: 'PATCH', propPatches, childPatches };
  }

  function diffProps(oldProps, newProps) {
    const patches = [];
    for (const [k, v] of Object.entries(newProps || {})) {
      if ((oldProps || {})[k] !== v) patches.push({ type: 'SET', key: k, val: v });
    }
    for (const k of Object.keys(oldProps || {})) {
      if (!(k in (newProps || {}))) patches.push({ type: 'REMOVE', key: k });
    }
    return patches;
  }

  function diffChildren(oldChildren, newChildren) {
    const patches = [];
    const maxLen = Math.max((oldChildren || []).length, (newChildren || []).length);
    for (let i = 0; i < maxLen; i++) {
      patches.push(diff((oldChildren || [])[i], (newChildren || [])[i]));
    }
    return patches;
  }

  function patch(el, patches) {
    if (!patches) return el;
    switch (patches.type) {
      case 'CREATE': { const newEl = createElement(patches.newVNode); el.parentNode && el.parentNode.replaceChild(newEl, el); return newEl; }
      case 'REMOVE': { if (el.contains(document.activeElement)) { const prevFocus = el.previousElementSibling || el.nextElementSibling || el.parentElement; if (prevFocus && prevFocus.focus) prevFocus.focus(); } el.parentNode && el.parentNode.removeChild(el); return null; }
      case 'REPLACE': { const newEl = createElement(patches.newVNode); el.parentNode && el.parentNode.replaceChild(newEl, el); return newEl; }
      case 'TEXT': el.textContent = patches.newVNode; return el;
      case 'PATCH': {
        for (const p of patches.propPatches) {
          if (p.type === 'SET') {
            if (p.key.startsWith('on')) { const eventName = p.key.slice(2).toLowerCase(); if (p.oldVal) el.removeEventListener(eventName, p.oldVal); el.addEventListener(eventName, p.val); }
            else if (p.key === 'className') el.className = p.val;
            else el.setAttribute(p.key, p.val);
          } else {
            el.removeAttribute(p.key);
          }
        }
        const childEls = Array.from(el.childNodes);
        patches.childPatches.forEach((cp, i) => { if (cp) patch(childEls[i], cp); });
        return el;
      }
    }
  }

  
  class Component {
    constructor(props) { this.props = props; this.state = {}; this._el = null; this._vnode = null; }
    setState(update) {
      this.state = { ...this.state, ...(typeof update === 'function' ? update(this.state) : update) };
      this._rerender();
    }
    _rerender() {
      const newVNode = this.render();
      const newEl = createElement(newVNode);
      if (this._el && this._el.parentNode) {
        const active = document.activeElement;
        const wasFocused = this._el.contains(active);
        this._el.parentNode.replaceChild(newEl, this._el);
        if (wasFocused) {
          const focusable = newEl.querySelector('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])');
          if (focusable) focusable.focus();
        }
      }
      this._el = newEl;
      this._vnode = newVNode;
    }
    mount(container) {
      this._vnode = this.render();
      this._el = createElement(this._vnode);
      container.appendChild(this._el);
    }
    render() { return h('div', null, 'Empty component'); }
  }

  
  function createStore(reducer, initialState) {
    let state = initialState;
    const listeners = [];
    return {
      getState() { return state; },
      dispatch(action) {
        state = reducer(state, action);
        listeners.forEach(l => l(state));
      },
      subscribe(listener) {
        listeners.push(listener);
        return () => { const idx = listeners.indexOf(listener); if (idx > -1) listeners.splice(idx, 1); };
      },
    };
  }

  
  function createRouter(routes) {
    let currentRoute = null;
    const listeners = [];
    function match(path) {
      for (const route of routes) {
        const pattern = new RegExp('^' + route.path.replace(/:([^/]+)/g, '([^/]+)') + '$');
        const m = path.match(pattern);
        if (m) {
          const keys = (route.path.match(/:([^/]+)/g) || []).map(k => k.slice(1));
          const params = {};
          keys.forEach((k, i) => { params[k] = m[i + 1]; });
          return { route, params };
        }
      }
      return null;
    }
    function navigate(path) {
      history.pushState({}, '', path);
      currentRoute = match(path);
      listeners.forEach(l => l(currentRoute));
      if (typeof CosmosAnnouncer !== 'undefined') CosmosAnnouncer.announce('Navigated to ' + path);
    }
    window.addEventListener('popstate', () => {
      currentRoute = match(location.pathname);
      listeners.forEach(l => l(currentRoute));
      if (typeof CosmosAnnouncer !== 'undefined') CosmosAnnouncer.announce('Page changed to ' + location.pathname);
    });
    return {
      navigate,
      subscribe(fn) { listeners.push(fn); return () => { const i = listeners.indexOf(fn); if (i > -1) listeners.splice(i, 1); }; },
      getCurrent() { return currentRoute || match(location.pathname); },
    };
  }

  return { h, createElement, diff, patch, Component, createStore, createRouter };
})();





const StringUtils = {
  capitalize: s => s.charAt(0).toUpperCase() + s.slice(1),
  camelToKebab: s => s.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(),
  kebabToCamel: s => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase()),
  snakeToCamel: s => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase()),
  camelToSnake: s => s.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase(),
  truncate: (s, n, suffix = '…') => s.length > n ? s.slice(0, n - suffix.length) + suffix : s,
  pad: (s, n, char = ' ') => String(s).length >= n ? String(s) : char.repeat(n - String(s).length) + String(s),
  count: (s, sub) => s.split(sub).length - 1,
  template: (tpl, data) => tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => data[k] ?? ''),
  escape:   s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),
  unescape: s => s.replace(/&(amp|lt|gt|quot|#39);/g, (_, e) => ({ amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'" }[e])),
  words: s => s.match(/[a-z]+/gi) || [],
  slugify: s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
  pluralize: (n, singular, plural) => n === 1 ? singular : (plural || singular + 's'),
  highlight: (text, query, tag = 'mark') => text.replace(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'), `<${tag}>$1</${tag}>`),
};

const CosmosConfig = Object.freeze({
  siteName: 'Cosmos Explorer',
  siteTagline: 'Explore the Universe — One Article at a Time',
  version: '3.2.1',
  baseUrl: 'https://cosmos-explorer.example.com',
  apiBase: '/api/v1',
  cdnBase: 'https://cdn.cosmos-explorer.example.com',

  features: {
    darkMode:        true,
    search:          true,
    quizzes:         true,
    bookmarks:       true,
    comments:        true,
    newsletter:      true,
    solarViz:        true,
    timeline:        true,
    analytics:       false,   
    serviceWorker:   false,
  },

  content: {
    articlesPerPage: 12,
    searchDebounceMs: 300,
    readingWordsPerMinute: 200,
    tocMinHeadings: 3,
    recentArticlesCount: 5,
    relatedArticlesCount: 4,
  },

  storage: {
    bookmarksKey:    'cosmos_bookmarks_v3',
    historyKey:      'cosmos_history_v3',
    themeKey:        'cosmos_theme',
    quizScoresKey:   'cosmos_quiz_scores',
    prefsKey:        'cosmos_prefs',
  },

  performance: {
    lazyLoadOffset:  '200px',
    animationDelay:  30,
    maxImageRetries: 3,
  },

  accessibility: {
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  },

  a11y: {
    skipLinkId:      'skip-to-content',
    liveRegionId:    'cosmos-announcer',
    focusTrapClass:  'cosmos-focus-trap',
  },

  social: {
    twitter:  'https://twitter.com/cosmosexplorer',
    github:   'https://github.com/cosmos-explorer',
    rss:      'https://cosmos-explorer.example.com/rss.xml',
  },
});



const CosmosState = (() => {
  const _data = {
    theme:            'system',   
    resolvedTheme:    'light',
    currentArticle:   null,
    searchQuery:      '',
    searchResults:    [],
    bookmarks:        [],
    history:          [],
    quizScores:       {},
    activePlanet:     null,
    timelineFilter:   'all',
    galleryIndex:     0,
    sidebarOpen:      false,
    mobileNavOpen:    false,
    lightboxOpen:     false,
    modalStack:       [],
    notifications:    [],
    prefs: {
      fontSize:       'base',
      lineSpacing:    'normal',
      dyslexicFont:   false,
      reducedMotion:  false,
      highContrast:   false,
    },
  };

  const _listeners = {};

  return {
    get(key) { return _data[key]; },

    set(key, value) {
      const prev = _data[key];
      _data[key] = value;
      if (_listeners[key]) {
        _listeners[key].forEach(fn => fn(value, prev));
      }
      if (_listeners['*']) {
        _listeners['*'].forEach(fn => fn(key, value, prev));
      }
    },

    update(key, updater) {
      this.set(key, updater(_data[key]));
    },

    subscribe(key, fn) {
      if (!_listeners[key]) _listeners[key] = [];
      _listeners[key].push(fn);
      return () => {
        _listeners[key] = _listeners[key].filter(f => f !== fn);
      };
    },

    snapshot() { return { ..._data }; },
  };
})();



const CosmosEvents = (() => {
  const _handlers = {};

  return {
    on(event, handler) {
      if (!_handlers[event]) _handlers[event] = [];
      _handlers[event].push(handler);
      return () => this.off(event, handler);
    },
    off(event, handler) {
      if (!_handlers[event]) return;
      _handlers[event] = _handlers[event].filter(h => h !== handler);
    },
    emit(event, data) {
      (_handlers[event] || []).forEach(h => {
        try { h(data); }
        catch (e) { console.warn(`[CosmosEvents] Error in handler for '${event}':`, e); }
      });
      (_handlers['*'] || []).forEach(h => {
        try { h(event, data); }
        catch (e) {  }
      });
    },
    once(event, handler) {
      const wrapped = (data) => { handler(data); this.off(event, wrapped); };
      this.on(event, wrapped);
    },
  };
})();



const CosmosLogger = (() => {
  const LEVELS = { silent: 0, error: 1, warn: 2, info: 3, debug: 4 };
  let _level = LEVELS.warn;

  const fmt = (level, args) =>
    console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](
      `%c[Cosmos ${level.toUpperCase()}]`, 'color:#6366f1;font-weight:bold', ...args
    );

  return {
    setLevel(level) { _level = LEVELS[level] ?? LEVELS.warn; },
    error(...a) { if (_level >= 1) fmt('error', a); },
    warn(...a)  { if (_level >= 2) fmt('warn',  a); },
    info(...a)  { if (_level >= 3) fmt('info',  a); },
    debug(...a) { if (_level >= 4) fmt('debug', a); },
  };
})();



const CosmosBootstrap = (() => {
  const _tasks = [];
  let _started = false;

  function runTask(task) {
    return Promise.resolve().then(() => task.fn()).then(() => {
      CosmosLogger.debug(`Bootstrap task complete: ${task.name}`);
    }).catch(err => {
      if (task.critical) {
        CosmosLogger.error(`Critical bootstrap task failed: ${task.name}`, err);
        throw err;
      } else {
        CosmosLogger.warn(`Non-critical task failed: ${task.name}`, err);
      }
    });
  }

  return {
    register(name, fn, { critical = false, priority = 50 } = {}) {
      if (_started) { fn(); return; }
      _tasks.push({ name, fn, critical, priority });
      _tasks.sort((a, b) => a.priority - b.priority);
    },

    async run() {
      if (_started) return;
      _started = true;
      CosmosLogger.info(`Starting bootstrap (${_tasks.length} tasks)`);
      for (const task of _tasks) {
        await runTask(task);
      }
      CosmosLogger.info('Bootstrap complete');
      CosmosEvents.emit('cosmos:ready', { ts: Date.now() });
    },
  };
})();



function domReady(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  } else {
    fn();
  }
}

domReady(() => {
  CosmosBootstrap.run().catch(err => {
    CosmosLogger.error('Bootstrap failed', err);
  });
});





const CosmosTheme = (() => {
  const KEY     = CosmosConfig.storage.themeKey;
  const ROOT    = document.documentElement;
  const THEMES  = ['light', 'dark', 'system'];
  const ICONS   = { light: '☀', dark: '☾', system: '⊙' };

  
  function systemPrefersDark() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  
  function resolve(mode) {
    if (mode === 'system') return systemPrefersDark() ? 'dark' : 'light';
    return mode;
  }

  function applyResolved(resolved) {
    ROOT.setAttribute('data-theme', resolved);
    ROOT.classList.remove('theme-light', 'theme-dark');
    ROOT.classList.add(`theme-${resolved}`);
    CosmosState.set('resolvedTheme', resolved);
    
    let meta = document.querySelector('meta[name="color-scheme"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'color-scheme';
      document.head.appendChild(meta);
    }
    meta.content = resolved;
    CosmosEvents.emit('cosmos:theme-changed', { mode: CosmosState.get('theme'), resolved });
  }

  function applyMode(mode) {
    if (!THEMES.includes(mode)) mode = 'system';
    CosmosState.set('theme', mode);
    try { localStorage.setItem(KEY, mode); } catch (_) {}
    const resolved = resolve(mode);
    applyResolved(resolved);
    updateToggleButtons(mode);
  }

  function updateToggleButtons(mode) {
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      const target = btn.dataset.themeToggle;
      const active = target === mode || (!THEMES.includes(target) && mode === 'system');
      btn.setAttribute('aria-pressed', String(active));
      btn.classList.toggle('is-active', active);
    });
    document.querySelectorAll('[data-theme-icon]').forEach(el => {
      el.textContent = ICONS[mode] || ICONS.system;
    });
    document.querySelectorAll('[data-theme-label]').forEach(el => {
      const labels = { light: 'Light mode', dark: 'Dark mode', system: 'System theme' };
      el.textContent = labels[mode] || labels.system;
    });
  }

  function loadSaved() {
    let saved;
    try { saved = localStorage.getItem(KEY); } catch (_) {}
    return THEMES.includes(saved) ? saved : 'system';
  }

  
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', () => {
    if (CosmosState.get('theme') === 'system') {
      const resolved = systemPrefersDark() ? 'dark' : 'light';
      applyResolved(resolved);
      CosmosAnnouncer.announce(`Theme updated to ${resolved} mode`);
    }
  });

  CosmosBootstrap.register('theme', () => {
    const saved = loadSaved();

    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      if (btn.tagName !== 'BUTTON') {
        btn.setAttribute('role', 'button');
        btn.setAttribute('tabindex', '0');
      }
    });

    applyMode(saved);

    document.addEventListener('keydown', function(e) {
      const btn = e.target.closest('[data-theme-toggle]');
      if (!btn) return;
      if (btn.tagName !== 'BUTTON' && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); btn.click(); }
    });

    
    document.addEventListener('click', e => {
      const btn = e.target.closest('[data-theme-toggle]');
      if (!btn) return;
      const target = btn.dataset.themeToggle;
      if (THEMES.includes(target)) {
        applyMode(target);
        CosmosAnnouncer.announce('Theme changed to ' + target);
      } else {
        
        const current = CosmosState.get('theme');
        const next = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length];
        applyMode(next);
        CosmosAnnouncer.announce('Theme changed to ' + next);
      }
    });
  }, { critical: false, priority: 5 });

  return {
    set:      applyMode,
    toggle()  { applyMode(CosmosState.get('theme') === 'dark' ? 'light' : 'dark'); },
    current() { return CosmosState.get('theme'); },
    resolved(){ return CosmosState.get('resolvedTheme'); },
    isDark()  { return this.resolved() === 'dark'; },
  };
})();




const CosmosReadingPrefs = (() => {
  const KEY     = CosmosConfig.storage.prefsKey;
  const ROOT    = document.documentElement;

  const FONT_SIZES  = ['sm', 'base', 'lg', 'xl'];
  const SPACINGS    = ['compact', 'normal', 'relaxed'];

  function loadPrefs() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return { ...CosmosState.get('prefs'), ...JSON.parse(raw) };
    } catch (_) {}
    return CosmosState.get('prefs');
  }

  function applyPrefs(prefs) {
    ROOT.setAttribute('data-font-size', prefs.fontSize);
    ROOT.setAttribute('data-line-spacing', prefs.lineSpacing);
    ROOT.classList.toggle('dyslexic-font', !!prefs.dyslexicFont);
    ROOT.classList.toggle('high-contrast', !!prefs.highContrast);
    
    const motionOff = prefs.reducedMotion ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    ROOT.classList.toggle('reduce-motion', motionOff);
    CosmosState.set('prefs', prefs);
  }

  function savePrefs(prefs) {
    try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (_) {}
    applyPrefs(prefs);
    CosmosEvents.emit('cosmos:prefs-changed', prefs);
  }

  function setPref(key, value) {
    savePrefs({ ...CosmosState.get('prefs'), [key]: value });
  }

  CosmosBootstrap.register('reading-prefs', () => {
    applyPrefs(loadPrefs());

    document.querySelectorAll('[data-pref-cycle]').forEach(btn => {
      if (btn.tagName !== 'BUTTON') {
        btn.setAttribute('role', 'button');
        btn.setAttribute('tabindex', '0');
      }
    });

    document.addEventListener('keydown', function(e) {
      const btn = e.target.closest('[data-pref-cycle]');
      if (!btn) return;
      if (btn.tagName !== 'BUTTON' && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); btn.click(); }
    });

    document.addEventListener('change', e => {
      const ctrl = e.target.closest('[data-pref]');
      if (!ctrl) return;
      const pref = ctrl.dataset.pref;
      const value = ctrl.type === 'checkbox' ? ctrl.checked : ctrl.value;
      setPref(pref, value);
      CosmosAnnouncer.announce('Preference saved: ' + pref);
    });

    document.addEventListener('click', e => {
      const btn = e.target.closest('[data-pref-cycle]');
      if (!btn) return;
      const pref = btn.dataset.prefCycle;
      const opts = pref === 'fontSize' ? FONT_SIZES : SPACINGS;
      const current = CosmosState.get('prefs')[pref];
      const next = opts[(opts.indexOf(current) + 1) % opts.length];
      setPref(pref, next);
      const prefLabel = (pref === 'fontSize' ? 'Font size' : 'Line spacing') + ': ' + next;
      btn.setAttribute('aria-label', prefLabel);
      CosmosAnnouncer.announce(prefLabel);
    });
  }, { critical: false, priority: 8 });

  return {
    set: setPref,
    get(key) { return CosmosState.get('prefs')[key]; },
    reset() {
      const defaults = {
        fontSize: 'base', lineSpacing: 'normal',
        dyslexicFont: false, reducedMotion: false, highContrast: false,
      };
      savePrefs(defaults);
    },
  };
})();


const CosmosAnnouncer = (() => {
  let _el = null;

  function getEl() {
    if (!_el) {
      _el = document.getElementById(CosmosConfig.a11y.liveRegionId);
      if (!_el) {
        _el = document.createElement('div');
        _el.id = CosmosConfig.a11y.liveRegionId;
        _el.setAttribute('aria-live', 'polite');
        _el.setAttribute('aria-atomic', 'true');
        _el.className = 'sr-only';
        document.body.appendChild(_el);
      }
    }
    return _el;
  }

  function announce(message, { assertive = false, delay = 100 } = {}) {
    const el = document.createElement('div');
    el.className = 'sr-only';
    el.setAttribute('aria-live', assertive ? 'assertive' : 'polite');
    el.setAttribute('aria-atomic', 'true');
    document.body.appendChild(el);
    setTimeout(() => { el.textContent = message; }, delay);
    setTimeout(() => { el.remove(); }, 3000);
  }

  return { announce };
})();



const CosmosNav = (() => {
  let _mobileNavEl    = null;
  let _mobileToggle   = null;
  let _backdropEl     = null;
  let _lastFocused    = null;
  let _trapCleanup    = null;

  
  const FOCUSABLE = [
    'a[href]', 'button:not([disabled])', 'input:not([disabled])',
    'select:not([disabled])', 'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  function getFocusable(container) {
    return Array.from(container.querySelectorAll(FOCUSABLE))
      .filter(el => !el.closest('[hidden]') && !el.closest('[aria-hidden="true"]'));
  }

  
  function trapFocus(container) {
    function handler(e) {
      if (e.key !== 'Tab') return;
      const focusable = getFocusable(container);
      if (!focusable.length) { e.preventDefault(); return; }
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { last.focus(); e.preventDefault(); }
      } else {
        if (document.activeElement === last) { first.focus(); e.preventDefault(); }
      }
    }
    container.addEventListener('keydown', handler);
    return () => container.removeEventListener('keydown', handler);
  }

  
  function ensureBackdrop() {
    if (!_backdropEl) {
      _backdropEl = document.createElement('div');
      _backdropEl.className = 'nav-backdrop';
      _backdropEl.setAttribute('aria-hidden', 'true');
      _backdropEl.addEventListener('click', closeMobileNav);
      document.body.appendChild(_backdropEl);
    }
    return _backdropEl;
  }

  
  function openMobileNav() {
    if (!_mobileNavEl) return;
    _lastFocused = document.activeElement;
    _mobileNavEl.removeAttribute('hidden');
    _mobileNavEl.setAttribute('aria-hidden', 'false');
    _mobileNavEl.setAttribute('aria-modal', 'true');
    _mobileNavEl.setAttribute('role', 'dialog');
    _mobileNavEl.setAttribute('aria-label', 'Navigation menu');
    const backdrop = ensureBackdrop();
    backdrop.classList.add('is-visible');
    document.body.classList.add('nav-open');
    if (_mobileToggle) {
      _mobileToggle.setAttribute('aria-expanded', 'true');
      _mobileToggle.setAttribute('aria-label', 'Close navigation menu');
    }
    const focusable = getFocusable(_mobileNavEl);
    if (focusable.length) focusable[0].focus();
    _trapCleanup = trapFocus(_mobileNavEl);
    CosmosState.set('mobileNavOpen', true);
    CosmosEvents.emit('cosmos:nav-opened'); CosmosAnnouncer.announce('Navigation menu opened', 'polite');
  }

  function closeMobileNav() {
    if (!_mobileNavEl) return;
    _mobileNavEl.setAttribute('hidden', '');
    _mobileNavEl.setAttribute('aria-hidden', 'true');
    if (_backdropEl) {
      _backdropEl.classList.remove('is-visible');
      _backdropEl.setAttribute('aria-hidden', 'true');
    }
    document.body.classList.remove('nav-open');
    if (_mobileToggle) {
      _mobileToggle.setAttribute('aria-expanded', 'false');
      _mobileToggle.setAttribute('aria-label', 'Open navigation menu');
    }
    if (_trapCleanup) { _trapCleanup(); _trapCleanup = null; }
    if (_lastFocused) { _lastFocused.focus(); _lastFocused = null; }
    CosmosState.set('mobileNavOpen', false);
    CosmosEvents.emit('cosmos:nav-closed'); CosmosAnnouncer.announce('Navigation menu closed', 'polite');
  }

  
  function setupDropdowns() {
    document.querySelectorAll('[data-dropdown]').forEach(trigger => {
      const menuId = trigger.getAttribute('aria-controls');
      const menu   = menuId ? document.getElementById(menuId) : null;
      if (!menu) return;

      trigger.setAttribute('aria-haspopup', 'true');
      trigger.setAttribute('aria-expanded', 'false');

      function open() {
        closeAllDropdowns(trigger);
        menu.removeAttribute('hidden');
        trigger.setAttribute('aria-expanded', 'true');
        const first = getFocusable(menu)[0];
        if (first) first.focus(); CosmosAnnouncer.announce('Submenu opened', 'polite');
      }

      function close() {
        menu.setAttribute('hidden', '');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.focus(); CosmosAnnouncer.announce('Submenu closed', 'polite');
      }

      trigger.addEventListener('click', e => {
        e.stopPropagation();
        trigger.getAttribute('aria-expanded') === 'true' ? close() : open();
      });

      trigger.addEventListener('keydown', e => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      });

      menu.addEventListener('keydown', e => {
        if (e.key === 'Escape') { close(); return; }
        if (e.key === 'Home' || e.key === 'End') {
          e.preventDefault();
          const items = getFocusable(menu);
          if (items.length) { (e.key === 'Home' ? items[0] : items[items.length - 1]).focus(); }
        }
      });
    });

    document.addEventListener('click', () => closeAllDropdowns());
  }

  function closeAllDropdowns(except = null) {
    document.querySelectorAll('[data-dropdown]').forEach(trigger => {
      if (trigger === except) return;
      const menuId = trigger.getAttribute('aria-controls');
      const menu   = menuId ? document.getElementById(menuId) : null;
      if (menu) menu.setAttribute('hidden', '');
      trigger.setAttribute('aria-expanded', 'false');
    });
  }

  
  function setupStickyHeader() {
    const header = document.querySelector('header, [data-sticky-header]');
    if (!header) return;
    let lastY = 0;
    let ticking = false;

    function update() {
      const y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 40);
      header.classList.toggle('is-hidden', y > lastY + 5 && y > 200);
      header.classList.toggle('is-visible', y < lastY - 5 || y < 80);
      lastY = y;
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
  }

  
  function updateBreadcrumbs(crumbs) {
    
    const nav = document.querySelector('[data-breadcrumbs]');
    if (!nav) return;
    if (!nav.getAttribute('aria-label')) nav.setAttribute('aria-label', 'Breadcrumb');
    const ol = nav.querySelector('ol') || document.createElement('ol');
    ol.innerHTML = crumbs.map((c, i) => {
      const isCurrent = i === crumbs.length - 1;
      return `<li>${isCurrent
        ? `<span aria-current="page">${StringUtils.escape(c.label)}</span>`
        : `<a href="${c.href}">${StringUtils.escape(c.label)}</a>`}</li>`;
    }).join('');
    if (!nav.contains(ol)) nav.appendChild(ol);
  }

  
  function setupSkipLink() {
    const skip = document.getElementById(CosmosConfig.a11y.skipLinkId);
    if (!skip) return;
    skip.addEventListener('click', e => {
      e.preventDefault();
      const target = document.getElementById(skip.getAttribute('href').slice(1));
      if (target) { target.setAttribute('tabindex', '-1'); target.focus(); }
    });
  }

  
  function highlightActiveLinks() {
    const current = window.location.pathname;
    document.querySelectorAll('nav a[href]').forEach(a => {
      const href = new URL(a.href, window.location.origin).pathname;
      const isActive = href === current || (href !== '/' && current.startsWith(href));
      a.classList.toggle('is-active', isActive);
      if (isActive) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  
  function setupBackToTop() {
    const btn = document.querySelector('[data-back-to-top]');
    if (!btn) return;
    window.addEventListener('scroll', () => {
      const visible = window.scrollY > 400;
      btn.classList.toggle('is-visible', visible);
      btn.setAttribute('aria-hidden', String(!visible));
    }, { passive: true });
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const main = document.querySelector('main, [role="main"]');
      if (main) { main.setAttribute('tabindex', '-1'); main.focus(); }
    });
  }

  
  function setupKeyboardShortcuts() {
    document.addEventListener('keydown', e => {
      
      const tag = document.activeElement?.tagName;
      const inInput = ['INPUT','TEXTAREA','SELECT'].includes(tag) ||
        document.activeElement?.isContentEditable;

      if (!inInput) {
        if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          const searchInput = document.querySelector('[data-search-input]');
          if (searchInput) { searchInput.focus(); CosmosAnnouncer.announce('Search box focused'); }
        }
        if (e.key === 'Escape') {
          if (CosmosState.get('mobileNavOpen')) closeMobileNav();
          closeAllDropdowns();
        }
        if (e.altKey && e.key === 'b') {
          e.preventDefault();
          const bookmarkBtn = document.querySelector('[data-bookmark-toggle]');
          if (bookmarkBtn) bookmarkBtn.click();
        }
      }
    });
  }

  
  CosmosBootstrap.register('navigation', () => {
    _mobileNavEl  = document.querySelector('[data-mobile-nav]');
    _mobileToggle = document.querySelector('[data-mobile-nav-toggle]');

    if (_mobileToggle) {
      _mobileToggle.setAttribute('aria-expanded', 'false');
      if (_mobileNavEl) {
        if (!_mobileNavEl.id) _mobileNavEl.id = 'cosmos-mobile-nav';
        _mobileToggle.setAttribute('aria-controls', _mobileNavEl.id);
      }
      _mobileToggle.addEventListener('click', () => {
        CosmosState.get('mobileNavOpen') ? closeMobileNav() : openMobileNav();
      });
    }

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && CosmosState.get('mobileNavOpen')) closeMobileNav();
    });

    setupDropdowns();
    setupStickyHeader();
    setupSkipLink();
    highlightActiveLinks();
    setupBackToTop();
    setupKeyboardShortcuts();
  }, { critical: false, priority: 10 });

  return {
    open:              openMobileNav,
    close:             closeMobileNav,
    updateBreadcrumbs,
    highlightActive:   highlightActiveLinks,
  };
})();


const CosmosReader = (() => {
  
  function calcReadingTime(text) {
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    const minutes   = Math.ceil(wordCount / CosmosConfig.content.readingWordsPerMinute);
    return { wordCount, minutes };
  }

  function renderReadingTime(articleEl) {
    const target = articleEl.querySelector('[data-reading-time]');
    if (!target) return;
    const textContent = articleEl.textContent || '';
    const { minutes, wordCount } = calcReadingTime(textContent);
    target.textContent = `${minutes} min read`;
    target.setAttribute('title', `${wordCount.toLocaleString()} words`);
  }

  
  function setupProgressBar(articleEl) {
    const bar = document.querySelector('[data-reading-progress]');
    if (!bar) return;
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', '100');
    bar.setAttribute('aria-valuenow', '0');
    bar.setAttribute('aria-label', 'Article reading progress');

    let ticking = false;

    function update() {
      const rect   = articleEl.getBoundingClientRect();
      const total  = articleEl.offsetHeight - window.innerHeight;
      const scrolled = Math.max(0, -rect.top);
      const pct    = total > 0 ? Math.min(100, Math.round((scrolled / total) * 100)) : 0;
      bar.style.width = `${pct}%`;
      bar.setAttribute('aria-valuenow', String(pct));
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });

    update();
  }

  
  function buildTOC(articleEl, tocContainer) {
    const headings = Array.from(
      articleEl.querySelectorAll('h2, h3, h4')
    ).filter(h => !h.closest('[data-toc-exclude]'));

    if (headings.length < CosmosConfig.content.tocMinHeadings) {
      if (tocContainer) tocContainer.setAttribute('hidden', '');
      return;
    }

    
    headings.forEach((h, i) => {
      if (!h.id) {
        h.id = `cosmos-heading-${i}-${h.textContent.trim()
          .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`;
      }
    });

    const linksList = buildTocList(headings);

    if (tocContainer) {
      tocContainer.innerHTML = '';
      const heading = document.createElement('h2');
      heading.className = 'toc-heading';
      heading.textContent = 'Contents';
      tocContainer.appendChild(heading);
      tocContainer.appendChild(linksList);
      tocContainer.removeAttribute('hidden');
    }

    return linksList;
  }

  function buildTocList(headings) {
    const ol       = document.createElement('ol');
    ol.className   = 'toc-list';
    const stack    = [{ el: ol, level: 1 }];

    headings.forEach(h => {
      const level = parseInt(h.tagName[1]);
      const li    = document.createElement('li');
      const a     = document.createElement('a');
      a.href      = `#${h.id}`;
      a.textContent = h.textContent;
      a.className = `toc-link toc-level-${level}`;
      li.appendChild(a);

      
      while (stack.length > 1 && stack[stack.length - 1].level >= level) stack.pop();
      stack[stack.length - 1].el.appendChild(li);

      
      if (level > stack[stack.length - 1].level) {
        const nestedOl = document.createElement('ol');
        li.appendChild(nestedOl);
        stack.push({ el: nestedOl, level });
      }
    });

    return ol;
  }

  
  function setupTocHighlight(tocContainer) {
    if (!tocContainer) return;
    const headings = Array.from(document.querySelectorAll('.cosmos-article h2, .cosmos-article h3, .cosmos-article h4'));
    if (!headings.length) return;

    let ticking = false;
    let _lastActiveId = null;

    function highlight() {
      const scrollY   = window.scrollY + 120;
      let active      = headings[0];
      for (const h of headings) {
        if (h.offsetTop <= scrollY) active = h;
        else break;
      }
      tocContainer.querySelectorAll('.toc-link').forEach(a => {
        const id = a.getAttribute('href').slice(1);
        a.classList.toggle('is-active', id === active?.id);
        if (id === active?.id) {
          a.setAttribute('aria-current', 'true');
          if (id !== _lastActiveId) {
            _lastActiveId = id;
            CosmosAnnouncer.announce(`Now reading: ${active.textContent}`);
          }
        } else a.removeAttribute('aria-current');
      });
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(highlight); ticking = true; }
    }, { passive: true });

    highlight();
  }

  
  function addHeadingAnchors(articleEl) {
    articleEl.querySelectorAll('h2, h3, h4').forEach(h => {
      if (!h.id) return;
      if (h.querySelector('.heading-anchor')) return;
      const a      = document.createElement('a');
      a.className  = 'heading-anchor';
      a.href       = `#${h.id}`;
      a.setAttribute('aria-label', `Link to section: ${h.textContent}`);
      a.textContent = '#';
      h.appendChild(a);
    });
  }

  
  function setupFootnotes(articleEl) {
    articleEl.querySelectorAll('a[href^="#fn"]').forEach(ref => {
      const targetId = ref.getAttribute('href').slice(1);
      const fn = document.getElementById(targetId);
      if (!fn) return;
      ref.setAttribute('aria-label', `Footnote: ${fn.textContent.trim().slice(0, 80)}`);
    });
  }

  
  function setupCodeBlocks(articleEl) {
    articleEl.querySelectorAll('pre > code').forEach(codeEl => {
      const pre  = codeEl.parentElement;
      if (pre.querySelector('.code-copy-btn')) return;

      pre.style.position = 'relative';
      const btn          = document.createElement('button');
      btn.className      = 'code-copy-btn';
      btn.setAttribute('type', 'button');
      btn.setAttribute('aria-label', 'Copy code to clipboard');
      btn.textContent    = 'Copy';

      btn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(codeEl.textContent);
          btn.textContent = 'Copied!';
          btn.setAttribute('aria-label', 'Code copied to clipboard');
          btn.classList.add('is-copied');
          CosmosAnnouncer.announce('Code copied to clipboard');
          setTimeout(() => {
            btn.textContent = 'Copy';
            btn.setAttribute('aria-label', 'Copy code to clipboard');
            btn.classList.remove('is-copied');
            CosmosAnnouncer.announce('Ready to copy');
          }, 2000);
        } catch (_) {
          btn.textContent = 'Failed';
          btn.setAttribute('aria-label', 'Failed to copy code to clipboard');
          CosmosAnnouncer.announce('Failed to copy code to clipboard');
          setTimeout(() => {
            btn.textContent = 'Copy';
            btn.setAttribute('aria-label', 'Copy code to clipboard');
          }, 2000);
        }
      });

      pre.appendChild(btn);
    });
  }

  
  function setupImages(container) {
    container.querySelectorAll('img[data-src]').forEach(img => {
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          if (!img.hasAttribute('alt')) {
            img.alt = img.dataset.alt || '';
            if (!img.dataset.alt) CosmosLogger.warn('Image loaded without alt text: ' + (img.dataset.src || img.src));
          }
          img.src = img.dataset.src;
          if (img.dataset.srcset) img.srcset = img.dataset.srcset;
          img.removeAttribute('data-src');
          img.removeAttribute('data-srcset');
          obs.unobserve(img);
        });
      }, { rootMargin: CosmosConfig.performance.lazyLoadOffset });
      io.observe(img);

      img.addEventListener('error', () => {
        if (img.src.endsWith('/images/fallback.svg')) return;
        img.src = '/images/fallback.svg';
        img.alt = img.alt || 'Image unavailable';
      });
    });
  }

  
  function setupScrollSpy() {
    const sections = document.querySelectorAll('[data-scroll-spy]');
    if (!sections.length) return;
    let _lastSpyId = null;

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const id = entry.target.id;
        document.querySelectorAll(`[data-spy-link="${id}"]`).forEach(link => {
          link.classList.toggle('is-active', entry.isIntersecting);
          if (entry.isIntersecting) {
            link.setAttribute('aria-current', 'true');
            if (id !== _lastSpyId) {
              _lastSpyId = id;
              CosmosAnnouncer.announce(`Now in section: ${link.textContent.trim()}`);
            }
          } else {
            link.removeAttribute('aria-current');
          }
        });
      });
    }, { rootMargin: '-20% 0px -60% 0px' });

    sections.forEach(s => io.observe(s));
  }

  
  CosmosBootstrap.register('reader', () => {
    const articleEl  = document.querySelector('.cosmos-article, [data-article-body]');
    const tocContainer = document.querySelector('[data-toc]');

    if (articleEl) {
      renderReadingTime(articleEl);
      buildTOC(articleEl, tocContainer);
      setupTocHighlight(tocContainer);
      setupProgressBar(articleEl);
      addHeadingAnchors(articleEl);
      setupFootnotes(articleEl);
      setupCodeBlocks(articleEl);
      setupImages(articleEl);
      setupScrollSpy();
    }
  }, { critical: false, priority: 20 });

  return { buildTOC, calcReadingTime, setupCodeBlocks, setupImages };
})();




const CosmosSearch = (() => {
  let _index   = [];   
  let _ui      = {};   
  let _debounceTimer = null;

  
  function tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s'-]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 1);
  }

  function trigrams(token) {
    const padded = `__${token}__`;
    const set = new Set();
    for (let i = 0; i < padded.length - 2; i++) {
      set.add(padded.slice(i, i + 3));
    }
    return set;
  }

  function trigramSimilarity(a, b) {
    const tA = trigrams(a);
    const tB = trigrams(b);
    let intersection = 0;
    for (const t of tA) if (tB.has(t)) intersection++;
    return (2 * intersection) / (tA.size + tB.size);
  }

  function scoreDoc(doc, queryTokens) {
    let score = 0;

    for (const qt of queryTokens) {
      if (doc.titleTokens.has(qt)) score += 10;
      if (doc.tagTokens.has(qt)) score += 6;
      if (doc.bodyTokenCounts[qt]) score += Math.min(doc.bodyTokenCounts[qt] * 0.5, 4);
      if (doc.category.toLowerCase() === qt) score += 3;

      for (const tt of doc.titleTokens) {
        const sim = trigramSimilarity(qt, tt);
        if (sim >= 0.6 && sim < 1.0) score += sim * 3;
      }
    }

    return score;
  }

  function highlight(text, queryTokens, maxLen = 200) {
    let snippet = text.slice(0, maxLen * 3);
    for (const qt of queryTokens) {
      const idx = snippet.toLowerCase().indexOf(qt);
      if (idx !== -1) {
        const start = Math.max(0, idx - 60);
        snippet = (start > 0 ? '…' : '') + snippet.slice(start, start + maxLen);
        break;
      }
    }
    if (snippet.length > maxLen) snippet = snippet.slice(0, maxLen) + '…';

    const regex = new RegExp(
      `(${queryTokens.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
      'gi'
    );
    return snippet.replace(regex, '<mark>$1</mark>');
  }

  function buildIndex(articles) {
    _index = articles.map(article => {
      const titleTokens = new Set(tokenize(article.title));
      const tagTokens   = new Set((article.tags || []).flatMap(t => tokenize(t)));
      const bodyText    = [article.summary, article.body || ''].join(' ');
      const bodyTokens  = tokenize(bodyText);
      const bodyTokenCounts = {};
      for (const t of bodyTokens) {
        bodyTokenCounts[t] = (bodyTokenCounts[t] || 0) + 1;
      }

      return {
        id:              article.id,
        title:           article.title,
        slug:            article.slug,
        category:        article.category || '',
        summary:         article.summary || '',
        tags:            article.tags || [],
        publishedAt:     article.publishedAt,
        readingMinutes:  article.readingMinutes || 1,
        imageUrl:        article.imageUrl || '',
        titleTokens,
        tagTokens,
        bodyTokenCounts,
        bodyText,
      };
    });
    CosmosLogger.info(`Search index built: ${_index.length} documents`);
  }

  function query(q, { limit = 10, minScore = 0.5, category = 'all' } = {}) {
    if (!q.trim()) return [];
    const qt = tokenize(q);
    if (!qt.length) return [];

    let results = _index
      .filter(doc => category === 'all' || doc.category === category)
      .map(doc => ({ doc, score: scoreDoc(doc, qt) }))
      .filter(r => r.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return results.map(r => ({
      id:             r.doc.id,
      title:          r.doc.title,
      slug:           r.doc.slug,
      category:       r.doc.category,
      tags:           r.doc.tags,
      snippet:        highlight(r.doc.bodyText, qt),
      readingMinutes: r.doc.readingMinutes,
      publishedAt:    r.doc.publishedAt,
      imageUrl:       r.doc.imageUrl,
      score:          r.score,
    }));
  }

  function renderResults(results, container, q) {
    container.innerHTML = '';

    if (!q.trim()) {
      container.setAttribute('hidden', '');
      CosmosAnnouncer.announce('Search results cleared');
      return;
    }

    container.removeAttribute('hidden');

    const header = document.createElement('p');
    header.className = 'search-count';
    header.textContent = results.length
      ? `${results.length} result${results.length !== 1 ? 's' : ''} for "${q}"`
      : `No results for "${q}"`;
    container.appendChild(header);
    CosmosAnnouncer.announce(header.textContent);

    if (!results.length) {
      const empty = document.createElement('p');
      empty.className = 'search-empty';
      empty.textContent = 'Try different keywords or browse categories below.';
      container.appendChild(empty);
      return;
    }

    const ul = document.createElement('ul');
    ul.className = 'search-results-list';

    results.forEach(r => {
      const li = document.createElement('li');
      li.className = 'search-result-item';
      li.innerHTML = `
        <a href="/articles/${r.slug}" class="search-result-link">
          <div class="search-result-meta">
            <span class="search-result-category">${r.category}</span>
            <span class="search-result-time">${r.readingMinutes} min read</span>
          </div>
          <h3 class="search-result-title">${r.title}</h3>
          <p class="search-result-snippet">${r.snippet}</p>
          <div class="search-result-tags" aria-label="Tags">
            ${r.tags.slice(0, 4).map(t => `<span class="tag">${t}</span>`).join('')}
          </div>
        </a>`;
      ul.appendChild(li);
    });

    container.appendChild(ul);
    CosmosAnnouncer.announce(`${results.length} search result${results.length !== 1 ? 's' : ''} found`);
  }

  function getSuggestions(q, limit = 6) {
    if (q.length < 2) return [];
    const qt = tokenize(q);
    const seen = new Set();
    const sugg = [];

    for (const doc of _index) {
      if (sugg.length >= limit) break;
      const titleLower = doc.title.toLowerCase();
      if (titleLower.includes(q.toLowerCase()) && !seen.has(doc.id)) {
        seen.add(doc.id);
        sugg.push({ label: doc.title, href: `/articles/${doc.slug}`, category: doc.category });
      }
    }

    const tagsSeen = new Set();
    for (const doc of _index) {
      for (const tag of doc.tags) {
        if (tag.toLowerCase().includes(q.toLowerCase()) && !tagsSeen.has(tag)) {
          tagsSeen.add(tag);
          sugg.push({ label: `#${tag}`, href: `/tag/${tag}`, category: 'tag' });
        }
      }
      if (sugg.length >= limit * 2) break;
    }

    return sugg.slice(0, limit);
  }

  function renderSuggestions(sugg, container, input) {
    container.innerHTML = '';
    if (!sugg.length) { container.setAttribute('hidden', ''); return; }

    container.removeAttribute('hidden');
    container.setAttribute('role', 'listbox');
    container.setAttribute('aria-label', 'Search suggestions');

    sugg.forEach((s, i) => {
      const li = document.createElement('li');
      li.className = 'search-suggestion';
      li.setAttribute('role', 'option');
      li.setAttribute('id', `search-suggestion-${i}`);
      li.setAttribute('aria-selected', 'false');
      li.dataset.href = s.href;
      const catSpan = document.createElement('span');
      catSpan.className = 'suggestion-cat';
      catSpan.textContent = s.category;
      li.textContent = s.label + ' ';
      li.appendChild(catSpan);
      li.addEventListener('click', () => { window.location.href = s.href; });
      container.appendChild(li);
    });

    let activeIdx = -1;
    const items = Array.from(container.querySelectorAll('[role="option"]'));

    // Remove previous listener to prevent accumulation across re-renders
    if (input.__suggKeydown) input.removeEventListener('keydown', input.__suggKeydown);

    input.__suggKeydown = (e) => {
      if (['ArrowDown', 'ArrowUp', 'Escape', 'Enter'].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === 'ArrowDown') {
        activeIdx = Math.min(activeIdx + 1, items.length - 1);
      } else if (e.key === 'ArrowUp') {
        activeIdx = Math.max(activeIdx - 1, -1);
      } else if (e.key === 'Escape') {
        container.setAttribute('hidden', '');
        activeIdx = -1;
        items.forEach(item => { item.setAttribute('aria-selected', 'false'); item.classList.remove('is-active'); });
        input.setAttribute('aria-expanded', 'false');
        input.removeAttribute('aria-activedescendant');
        return;
      } else if (e.key === 'Enter' && activeIdx >= 0) {
        window.location.href = items[activeIdx].dataset.href;
        return;
      }

      items.forEach((item, i) => {
        item.setAttribute('aria-selected', String(i === activeIdx));
        item.classList.toggle('is-active', i === activeIdx);
      });
      input.setAttribute('aria-activedescendant', activeIdx >= 0 ? items[activeIdx].id : '');
    };

    input.addEventListener('keydown', input.__suggKeydown);
  }

  function bindUI() {
    const input      = document.querySelector('[data-search-input]');
    const results    = document.querySelector('[data-search-results]');
    const suggestions= document.querySelector('[data-search-suggestions]');
    const form       = document.querySelector('[data-search-form]');
    const clearBtn   = document.querySelector('[data-search-clear]');
    const catFilter  = document.querySelector('[data-search-category]');

    if (!input) return;
    _ui = { input, results, suggestions, form, clearBtn, catFilter };

    input.setAttribute('role', 'combobox');
    if (!input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby') && (!input.id || !document.querySelector(`label[for="${input.id}"]`))) {
      input.setAttribute('aria-label', 'Search articles');
    }
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-expanded', 'false');
    input.setAttribute('aria-haspopup', 'listbox');
    if (suggestions) {
      if (!suggestions.id) suggestions.id = 'search-suggestions';
      input.setAttribute('aria-controls', suggestions.id);
    }

    input.addEventListener('input', () => {
      const q = input.value;
      CosmosState.set('searchQuery', q);

      if (clearBtn) clearBtn.classList.toggle('is-visible', q.length > 0);

      clearTimeout(_debounceTimer);
      _debounceTimer = setTimeout(() => {
        if (suggestions) {
          const sugg = getSuggestions(q);
          renderSuggestions(sugg, suggestions, input);
          input.setAttribute('aria-expanded', sugg.length > 0 ? 'true' : 'false');
        }

        if (q.length >= 2 && results) {
          const cat = catFilter ? catFilter.value : 'all';
          const res = query(q, { category: cat });
          renderResults(res, results, q);
          CosmosState.set('searchResults', res);
          CosmosEvents.emit('cosmos:search', { q, count: res.length });
        } else if (results) {
          results.setAttribute('hidden', '');
        }
      }, CosmosConfig.content.searchDebounceMs);
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        input.value = '';
        CosmosAnnouncer.announce('Search cleared');
        input.focus();
        CosmosState.set('searchQuery', '');
        if (results) results.setAttribute('hidden', '');
        if (suggestions) suggestions.setAttribute('hidden', '');
        input.setAttribute('aria-expanded', 'false');
        input.removeAttribute('aria-activedescendant');
        if (clearBtn) clearBtn.classList.remove('is-visible');
      });
    }

    if (form) {
      form.addEventListener('submit', e => {
        e.preventDefault();
        const q    = input.value;
        const cat  = catFilter ? catFilter.value : 'all';
        const res  = query(q, { category: cat, limit: 20 });
        if (results) renderResults(res, results, q);
        if (suggestions) { suggestions.setAttribute('hidden', ''); input.removeAttribute('aria-activedescendant'); }
        CosmosAnnouncer.announce(`Search complete: ${res.length} results`, { assertive: true });
      });
    }

    document.addEventListener('click', e => {
      if (!input.contains(e.target) && suggestions && !suggestions.contains(e.target)) {
        suggestions.setAttribute('hidden', '');
        input.setAttribute('aria-expanded', 'false');
        input.removeAttribute('aria-activedescendant');
      }
    });
  }

  CosmosBootstrap.register('search', () => {
    CosmosEvents.on('cosmos:articles-loaded', ({ articles }) => {
      buildIndex(articles);
    });
    bindUI();
  }, { critical: false, priority: 30 });

  return { buildIndex, query, getSuggestions };
})();



const CosmosSolarViz = (() => {
  const PLANETS = [
    { name: 'Mercury', radius: 3.8,  orbitR: 80,  period: 0.24, color: '#b5b5b5', tilt: 0.03,
      info: 'Smallest planet; orbits closest to the Sun. Surface temperatures swing from -180Â°C to 430Â°C.' },
    { name: 'Venus',   radius: 9.5,  orbitR: 130, period: 0.62, color: '#e8cda0', tilt: 177.4,
      info: 'Hottest planet (462Â°C average) due to a runaway greenhouse effect. Spins retrograde.' },
    { name: 'Earth',   radius: 10,   orbitR: 190, period: 1.00, color: '#4fa3e0', tilt: 23.5,
      info: 'Our home planet. Only confirmed body with liquid water on the surface and life.' },
    { name: 'Mars',    radius: 5.3,  orbitR: 260, period: 1.88, color: '#c1440e', tilt: 25.2,
      info: 'The Red Planet. Home to Olympus Mons, the tallest volcano in the Solar System.' },
    { name: 'Jupiter', radius: 22,   orbitR: 360, period: 11.86,color: '#c88b3a', tilt: 3.1,
      info: 'Largest planet; 318× Earth\'s mass. The Great Red Spot is a storm 1.3× Earth\'s diameter.' },
    { name: 'Saturn',  radius: 19,   orbitR: 470, period: 29.46,color: '#e4d191', tilt: 26.7,
      info: 'Its iconic rings are made of ice and rock ranging from grains to house-sized boulders.' },
    { name: 'Uranus',  radius: 14,   orbitR: 570, period: 84.01,color: '#7de8e8', tilt: 97.8,
      info: 'Rotates on its side (97.8Â° axial tilt). Has 13 known rings and 27 moons.' },
    { name: 'Neptune', radius: 13,   orbitR: 660, period: 164.8,color: '#4b70dd', tilt: 28.3,
      info: 'Windiest planet; storms reach 2,100 km/h. Triton orbits backwards.' },
  ];

  const SUN = { radius: 34, color: '#ffd000', glow: '#ff8c00' };
  const SPEED_FACTOR = 0.004;  

  let _canvas = null, _ctx = null;
  let _animId = null;
  let _time = 0;
  let _tooltip = null;
  let _selected = null;
  let _paused = false;
  let _devicePixelRatio = 1;

  function resize() {
    if (!_canvas) return;
    _devicePixelRatio = window.devicePixelRatio || 1;
    const rect = _canvas.parentElement.getBoundingClientRect();
    _canvas.width  = rect.width  * _devicePixelRatio;
    _canvas.height = rect.height * _devicePixelRatio;
    _canvas.style.width  = `${rect.width}px`;
    _canvas.style.height = `${rect.height}px`;
    _ctx.scale(_devicePixelRatio, _devicePixelRatio);
  }

  function cx() { return _canvas.width  / _devicePixelRatio / 2; }
  function cy() { return _canvas.height / _devicePixelRatio / 2; }

  function drawSun(ctx) {
    const x = cx(), y = cy();
    
    const grd = ctx.createRadialGradient(x, y, SUN.radius * 0.4, x, y, SUN.radius * 2);
    grd.addColorStop(0.0, SUN.glow + 'aa');
    grd.addColorStop(1.0, 'transparent');
    ctx.beginPath();
    ctx.arc(x, y, SUN.radius * 2, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(x, y, SUN.radius, 0, Math.PI * 2);
    ctx.fillStyle = SUN.color;
    ctx.fill();
  }

  function drawOrbit(ctx, orbitR) {
    ctx.beginPath();
    ctx.arc(cx(), cy(), orbitR, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.stroke();
  }

  function drawPlanet(ctx, planet, time) {
    const angle = (time / planet.period) * SPEED_FACTOR;
    const px = cx() + Math.cos(angle) * planet.orbitR;
    const py = cy() + Math.sin(angle) * planet.orbitR;

    const isSelected = _selected && _selected.name === planet.name;

    
    const shd = ctx.createRadialGradient(px - planet.radius * 0.3, py - planet.radius * 0.3, 0, px, py, planet.radius);
    shd.addColorStop(0, planet.color);
    shd.addColorStop(1, 'rgba(0,0,0,0.7)');

    ctx.beginPath();
    ctx.arc(px, py, planet.radius, 0, Math.PI * 2);
    ctx.fillStyle = shd;
    ctx.fill();

    if (isSelected) {
      ctx.beginPath();
      ctx.arc(px, py, planet.radius + 4, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    
    if (planet.name === 'Saturn') {
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(0.4);
      ctx.scale(1, 0.35);
      ctx.beginPath();
      ctx.arc(0, 0, planet.radius * 1.8, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(228,209,145,0.55)';
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.restore();
    }

    
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = `${isSelected ? 'bold ' : ''}10px system-ui`;
    ctx.textAlign = 'center';
    ctx.fillText(planet.name, px, py + planet.radius + 12);

    
    planet._px = px;
    planet._py = py;
  }

  function drawFrame() {
    if (!_ctx || !_canvas) return;
    const w = _canvas.width  / _devicePixelRatio;
    const h = _canvas.height / _devicePixelRatio;
    _ctx.clearRect(0, 0, w, h);

    
    if (!_canvas._stars) {
      _canvas._stars = Array.from({ length: 180 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.5,
        a: 0.3 + Math.random() * 0.7,
      }));
    }
    for (const s of _canvas._stars) {
      _ctx.beginPath();
      _ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      _ctx.fillStyle = `rgba(255,255,255,${s.a})`;
      _ctx.fill();
    }

    PLANETS.forEach(p => drawOrbit(_ctx, p.orbitR));
    drawSun(_ctx);
    PLANETS.forEach(p => drawPlanet(_ctx, p, _time));

    if (!_paused) _time += 1;
    _animId = requestAnimationFrame(drawFrame);
  }

  function getHitPlanet(ox, oy) {
    return PLANETS.find(p => {
      if (!p._px) return false;
      const dx = p._px - ox, dy = p._py - oy;
      return Math.sqrt(dx * dx + dy * dy) <= p.radius + 8;
    }) || null;
  }

  function selectPlanet(planet) {
    _selected = planet;
    CosmosState.set('activePlanet', planet ? planet.name : null);
    if (_tooltip && planet) {
      _tooltip.querySelector('.solar-planet-name').textContent = planet.name;
      _tooltip.querySelector('.solar-planet-info').textContent = planet.info;
      _tooltip.removeAttribute('hidden');
      _tooltip.setAttribute('aria-hidden', 'false');
    } else if (_tooltip) {
      _tooltip.setAttribute('hidden', '');
      _tooltip.setAttribute('aria-hidden', 'true');
    }
    if (planet) CosmosAnnouncer.announce(`${planet.name} selected: ${planet.info}`);
  }

  function setupAccessibleList() {
    const list = document.querySelector('[data-solar-list]');
    if (!list) return;
    list.innerHTML = PLANETS.map(p =>
      `<li><button class="solar-planet-btn" data-planet="${p.name}" type="button">
         <span class="planet-dot" style="background:${p.color}"></span>
         ${p.name}
       </button></li>`
    ).join('');
    list.addEventListener('click', e => {
      const btn = e.target.closest('[data-planet]');
      if (!btn) return;
      const planet = PLANETS.find(p => p.name === btn.dataset.planet);
      selectPlanet(planet || null);
    });
  }

  CosmosBootstrap.register('solar-viz', () => {
    _canvas  = document.querySelector('[data-solar-canvas]');
    _tooltip = document.querySelector('[data-solar-tooltip]');
    if (!_canvas) return;

    _ctx = _canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);

    _canvas.addEventListener('click', e => {
      const rect = _canvas.getBoundingClientRect();
      const ox = e.clientX - rect.left;
      const oy = e.clientY - rect.top;
      selectPlanet(getHitPlanet(ox, oy));
    });

    _canvas.addEventListener('mousemove', e => {
      const rect = _canvas.getBoundingClientRect();
      const hit  = getHitPlanet(e.clientX - rect.left, e.clientY - rect.top);
      _canvas.style.cursor = hit ? 'pointer' : 'default';
    });

    _canvas.setAttribute('aria-hidden', 'true');

    const pauseBtn = document.querySelector('[data-solar-pause]');
    if (pauseBtn) {
      pauseBtn.setAttribute('aria-pressed', String(_paused));
      pauseBtn.addEventListener('click', () => {
        _paused = !_paused;
        pauseBtn.setAttribute('aria-pressed', String(_paused));
        pauseBtn.textContent = _paused ? 'Resume' : 'Pause';
        CosmosAnnouncer.announce(_paused ? 'Animation paused' : 'Animation resumed');
      });
    }

    drawFrame();
    CosmosLogger.info('Solar System visualiser started');
  }, { critical: false, priority: 40 });

  return {
    select: selectPlanet,
    pause()  { _paused = true; },
    resume() { _paused = false; },
    planets: PLANETS,
  };
})();




const CosmosTimeline = (() => {
  const MISSIONS = [
    { id: 'sputnik-1',     year: 1957, date: '1957-10-04', agency: 'USSR',   category: 'first',
      name: 'Sputnik 1',
      desc: 'The first artificial Earth satellite. A 583 mm aluminium sphere weighing 83.6 kg, it transmitted radio signals for 21 days before its batteries died, orbiting for 3 months.' },
    { id: 'explorer-1',    year: 1958, date: '1958-02-01', agency: 'NASA',   category: 'satellite',
      name: 'Explorer 1',
      desc: 'First US satellite. Discovered the Van Allen radiation belts, demonstrating that charged particles are trapped by Earth\'s magnetic field.' },
    { id: 'luna-3',        year: 1959, date: '1959-10-07', agency: 'USSR',   category: 'lunar',
      name: 'Luna 3',
      desc: 'Returned the first images of the far side of the Moon, revealing a surface dramatically different from the near side — fewer maria and more craters.' },
    { id: 'vostok-1',      year: 1961, date: '1961-04-12', agency: 'USSR',   category: 'human',
      name: 'Vostok 1 (Gagarin)',
      desc: 'Yuri Gagarin became the first human in space. The 108-minute flight reached 327 km altitude. Gagarin ejected and parachuted to Earth separately from the capsule.' },
    { id: 'mercury-ma-6',  year: 1962, date: '1962-02-20', agency: 'NASA',   category: 'human',
      name: 'Friendship 7 (Glenn)',
      desc: 'John Glenn made the first American orbital flight, completing 3 orbits in 4 h 55 min. Glenn became a symbol of Cold War space competition.' },
    { id: 'mariner-4',     year: 1965, date: '1965-07-14', agency: 'NASA',   category: 'planetary',
      name: 'Mariner 4',
      desc: 'First spacecraft to fly by Mars and return close-up images. The 22 photographs revealed a cratered, Moon-like surface, dispelling hopes of a Mars with canals.' },
    { id: 'apollo-8',      year: 1968, date: '1968-12-21', agency: 'NASA',   category: 'lunar',
      name: 'Apollo 8',
      desc: 'First crewed mission to orbit the Moon. Frank Borman, Jim Lovell, and Bill Anders read from Genesis and captured the iconic "Earthrise" photograph.' },
    { id: 'apollo-11',     year: 1969, date: '1969-07-20', agency: 'NASA',   category: 'human',
      name: 'Apollo 11',
      desc: 'Neil Armstrong and Buzz Aldrin became the first humans to land on the Moon. Armstrong\'s words — "one small step for man, one giant leap for mankind" — were broadcast to 600 million viewers.' },
    { id: 'pioneer-10',    year: 1972, date: '1972-03-02', agency: 'NASA',   category: 'planetary',
      name: 'Pioneer 10',
      desc: 'First spacecraft to traverse the asteroid belt and fly by Jupiter. It was the first man-made object to leave the inner Solar System and carried the Pioneer plaque.' },
    { id: 'viking-1',      year: 1976, date: '1976-07-20', agency: 'NASA',   category: 'planetary',
      name: 'Viking 1',
      desc: 'First successful Mars lander. Operated for over 6 years and conducted biology experiments seeking signs of life, returning 4,500+ images of the Martian surface.' },
    { id: 'voyager-1',     year: 1977, date: '1977-09-05', agency: 'NASA',   category: 'planetary',
      name: 'Voyager 1',
      desc: 'Launched on a "Grand Tour" of the outer Solar System. Flew by Jupiter (1979) and Saturn (1980) and is now the farthest human-made object, in interstellar space.' },
    { id: 'voyager-2',     year: 1977, date: '1977-08-20', agency: 'NASA',   category: 'planetary',
      name: 'Voyager 2',
      desc: 'Only spacecraft to visit all four gas giants: Jupiter, Saturn, Uranus, and Neptune. Carries a Golden Record with sounds and images representing life on Earth.' },
    { id: 'hubble',        year: 1990, date: '1990-04-24', agency: 'NASA',   category: 'telescope',
      name: 'Hubble Space Telescope',
      desc: 'Orbiting at 547 km, Hubble has produced over 1.5 million observations. Its Ultra Deep Field image captured galaxies 13.2 billion light-years away.' },
    { id: 'galileo',       year: 1995, date: '1995-12-07', agency: 'NASA',   category: 'planetary',
      name: 'Galileo (Jupiter Orbit)',
      desc: 'First spacecraft to orbit Jupiter. Discovered evidence of a subsurface ocean beneath Europa\'s ice shell — one of the best candidates for extraterrestrial life in our Solar System.' },
    { id: 'iss-first',     year: 1998, date: '1998-11-20', agency: 'Multi',  category: 'station',
      name: 'ISS First Module (Zarya)',
      desc: 'The first module of the International Space Station. The ISS has been continuously inhabited since November 2000 and is a collaboration between 15 countries.' },
    { id: 'cassini',       year: 2004, date: '2004-07-01', agency: 'NASA',   category: 'planetary',
      name: 'Cassini-Huygens Arrives',
      desc: 'Entered Saturn orbit and deployed Huygens onto Titan. Discovered active geysers on Enceladus containing water vapour, organics, and silica — strong signs of a hydrothermal ocean.' },
    { id: 'spirit-oppy',   year: 2004, date: '2004-01-04', agency: 'NASA',   category: 'planetary',
      name: 'Spirit & Opportunity (Mars)',
      desc: 'Twin rovers designed for 90-day missions. Opportunity operated for 14 years, covering 45.16 km. Both confirmed liquid water was once present on Mars.' },
    { id: 'new-horizons',  year: 2015, date: '2015-07-14', agency: 'NASA',   category: 'planetary',
      name: 'New Horizons (Pluto Flyby)',
      desc: 'First and only spacecraft to visit Pluto. Revealed a 3,500 km nitrogen ice plain (Tombaugh Regio), towering 3,500 m water-ice mountains, and an atmospheric haze 1,600 km high.' },
    { id: 'jwst',          year: 2021, date: '2021-12-25', agency: 'NASA',   category: 'telescope',
      name: 'James Webb Space Telescope',
      desc: 'Launched on Christmas Day 2021. Its 6.5 m gold-coated beryllium mirror operating at -233Â°C detects infrared light from the first galaxies formed ~400 million years after the Big Bang.' },
    { id: 'artemis-1',     year: 2022, date: '2022-11-16', agency: 'NASA',   category: 'lunar',
      name: 'Artemis I',
      desc: 'Uncrewed test of the Space Launch System and Orion capsule. Flew to 64,000 km beyond the Moon — the farthest a human-rated spacecraft has ever travelled from Earth.' },
    { id: 'ingenuity',     year: 2021, date: '2021-04-19', agency: 'NASA',   category: 'planetary',
      name: 'Ingenuity (First Mars Flight)',
      desc: 'A 1.8 kg helicopter made the first powered, controlled flight on another planet. Designed for 5 flights, it completed 72 before its final landing in January 2024.' },
  ];

  const CATEGORIES  = ['all', 'human', 'planetary', 'lunar', 'telescope', 'satellite', 'station', 'first'];
  const AGENCIES    = ['all', 'NASA', 'USSR', 'ESA', 'Multi'];

  let _filter = { category: 'all', agency: 'all', minYear: 1957, maxYear: 2025 };

  function filteredMissions() {
    return MISSIONS.filter(m =>
      (_filter.category === 'all' || m.category === _filter.category) &&
      (_filter.agency   === 'all' || m.agency   === _filter.agency)   &&
      m.year >= _filter.minYear && m.year <= _filter.maxYear
    );
  }

  function buildTimelineItem(mission) {
    const article = document.createElement('article');
    article.className = `timeline-item timeline-cat-${mission.category}`;
    article.dataset.missionId = mission.id;
    article.innerHTML = `
      <time class="timeline-date" datetime="${mission.date}">${mission.year}</time>
      <div class="timeline-connector" aria-hidden="true">
        <span class="timeline-dot"></span>
      </div>
      <div class="timeline-content">
        <div class="timeline-badges">
          <span class="badge badge-agency">${mission.agency}</span>
          <span class="badge badge-cat">${mission.category}</span>
        </div>
        <h3 class="timeline-title" id="tl-title-${mission.id}">${mission.name}</h3>
        <p class="timeline-desc">${mission.desc}</p>
        <button class="timeline-expand-btn" type="button"
                aria-expanded="false"
                aria-controls="tl-detail-${mission.id}"
                aria-label="Read more about ${StringUtils.escape(mission.name)}">
          Read more <span aria-hidden="true">▸</span>
        </button>
        <div class="timeline-detail" id="tl-detail-${mission.id}" aria-labelledby="tl-title-${mission.id}" hidden>
          <p>Mission date: <time datetime="${mission.date}">${new Date(mission.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</time></p>
        </div>
      </div>`;
    return article;
  }

  function render(container) {
    if (!container) return;
    const missions = filteredMissions();
    container.innerHTML = '';

    if (!missions.length) {
      container.innerHTML = '<p class="timeline-empty">No missions match the current filters.</p>';
      CosmosAnnouncer.announce('No missions found for current filters');
      return;
    }

    const fragment = document.createDocumentFragment();
    missions.forEach(m => fragment.appendChild(buildTimelineItem(m)));
    container.appendChild(fragment);
    CosmosAnnouncer.announce(`Showing ${missions.length} mission${missions.length !== 1 ? 's' : ''}`);
  }

  function setupFilters(container) {
    const catSelect = document.querySelector('[data-timeline-category]');
    const agSelect  = document.querySelector('[data-timeline-agency]');
    const yearMin   = document.querySelector('[data-timeline-year-min]');
    const yearMax   = document.querySelector('[data-timeline-year-max]');

    function onChange() {
      if (catSelect) _filter.category = catSelect.value;
      if (agSelect)  _filter.agency   = agSelect.value;
      if (yearMin)   _filter.minYear  = parseInt(yearMin.value) || 1957;
      if (yearMax)   _filter.maxYear  = parseInt(yearMax.value) || 2025;
      CosmosState.set('timelineFilter', _filter.category);
      render(container);
    }

    [catSelect, agSelect, yearMin, yearMax].filter(Boolean).forEach(el => {
      el.addEventListener('change', onChange);
    });
  }

  function setupExpandButtons(container) {
    container.addEventListener('click', e => {
      const btn = e.target.closest('.timeline-expand-btn');
      if (!btn) return;
      const detailId = btn.getAttribute('aria-controls');
      const detail   = document.getElementById(detailId);
      if (!detail) return;
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      detail.hidden = expanded;
      btn.querySelector('span[aria-hidden]').textContent = expanded ? '▸' : '▾';
      CosmosAnnouncer.announce(expanded ? 'Details collapsed' : 'Details expanded');
    });
  }

  function buildFilterUI(container) {
    const wrapper = document.querySelector('[data-timeline-filters]');
    if (!wrapper) return;
    wrapper.innerHTML = `
      <label for="tl-cat">Category:
        <select id="tl-cat" data-timeline-category>
          ${CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
        </select>
      </label>
      <label for="tl-agency">Agency:
        <select id="tl-agency" data-timeline-agency>
          ${AGENCIES.map(a => `<option value="${a}">${a}</option>`).join('')}
        </select>
      </label>
      <label for="tl-year-min">From:
        <input type="number" id="tl-year-min" data-timeline-year-min
               min="1957" max="2025" value="1957">
      </label>
      <label for="tl-year-max">To:
        <input type="number" id="tl-year-max" data-timeline-year-max
               min="1957" max="2025" value="2025">
      </label>`;
  }

  CosmosBootstrap.register('timeline', () => {
    const container = document.querySelector('[data-timeline]');
    if (!container) return;
    buildFilterUI(container);
    render(container);
    setupFilters(container);
    setupExpandButtons(container);
  }, { critical: false, priority: 45 });

  return { missions: MISSIONS, render, filter: _filter };
})();




const CosmosQuiz = (() => {
  const QUESTION_BANK = [
    { id: 'q01', category: 'solar-system',
      q: 'Which is the largest planet in our Solar System?',
      options: ['Saturn', 'Jupiter', 'Neptune', 'Uranus'],
      correct: 1,
      explanation: 'Jupiter is the largest planet, with a mass greater than all other planets combined. Its diameter is 11 times that of Earth.' },
    { id: 'q02', category: 'solar-system',
      q: 'How long does light from the Sun take to reach Earth?',
      options: ['About 1 second', 'About 8 minutes', 'About 1 hour', 'About 1 day'],
      correct: 1,
      explanation: 'Light travels at 299,792 km/s. The Earth is 149.6 million km from the Sun, so light takes about 8 minutes 20 seconds to arrive.' },
    { id: 'q03', category: 'solar-system',
      q: 'What is the name of the largest volcano in the Solar System?',
      options: ['Mauna Kea', 'Vesuvius', 'Olympus Mons', 'Maxwell Montes'],
      correct: 2,
      explanation: 'Olympus Mons on Mars is approximately 22 km high and 600 km across — about three times the height of Mount Everest.' },
    { id: 'q04', category: 'solar-system',
      q: 'Which planet has the most moons (as of 2024)?',
      options: ['Jupiter', 'Saturn', 'Uranus', 'Neptune'],
      correct: 1,
      explanation: 'Saturn holds the record with 146 confirmed moons as of 2024, surpassing Jupiter\'s 95. Titan is the largest Saturnian moon and has a thick atmosphere.' },
    { id: 'q05', category: 'solar-system',
      q: 'What causes the seasons on Earth?',
      options: ['Varying distance from the Sun', 'Earth\'s axial tilt', 'Solar flares', 'Moon gravity'],
      correct: 1,
      explanation: 'Earth\'s 23.5Â° axial tilt means different hemispheres receive more direct sunlight at different times of year, which is what creates the seasons.' },
    { id: 'q06', category: 'history',
      q: 'Who was the first human to walk on the Moon?',
      options: ['Buzz Aldrin', 'Yuri Gagarin', 'Neil Armstrong', 'Alan Shepard'],
      correct: 2,
      explanation: 'Neil Armstrong stepped onto the lunar surface on 20 July 1969 during Apollo 11, followed by Buzz Aldrin 20 minutes later.' },
    { id: 'q07', category: 'history',
      q: 'What year was the Hubble Space Telescope launched?',
      options: ['1985', '1990', '1995', '2000'],
      correct: 1,
      explanation: 'Hubble was carried into orbit by the Space Shuttle Discovery on 24 April 1990. A corrective optics servicing mission in 1993 fixed its flawed mirror.' },
    { id: 'q08', category: 'history',
      q: 'Which was the first artificial satellite ever launched?',
      options: ['Explorer 1', 'Vanguard 1', 'Sputnik 1', 'Telstar 1'],
      correct: 2,
      explanation: 'Sputnik 1 was launched by the Soviet Union on 4 October 1957. It was a 58 cm sphere that beeped radio signals for 21 days.' },
    { id: 'q09', category: 'stars',
      q: 'What is the nearest star to Earth (other than the Sun)?',
      options: ['Sirius', 'Alpha Centauri A', 'Proxima Centauri', 'Betelgeuse'],
      correct: 2,
      explanation: 'Proxima Centauri is 4.243 light-years away. It is a red dwarf and part of the Alpha Centauri triple system. It hosts candidate exoplanet Proxima b.' },
    { id: 'q10', category: 'stars',
      q: 'What type of star is our Sun?',
      options: ['Red giant', 'White dwarf', 'Yellow dwarf (G-type)', 'Blue supergiant'],
      correct: 2,
      explanation: 'The Sun is a G-type main-sequence star (spectral class G2V), commonly called a yellow dwarf. It will remain on the main sequence for about another 5 billion years.' },
    { id: 'q11', category: 'stars',
      q: 'What is a pulsar?',
      options: ['A planet orbiting a dead star', 'A highly magnetised rotating neutron star emitting beams of radiation', 'A type of black hole', 'A variable giant star'],
      correct: 1,
      explanation: 'Pulsars are rapidly rotating neutron stars that emit beams of electromagnetic radiation. When the beam sweeps past Earth, we detect regular pulses.' },
    { id: 'q12', category: 'cosmology',
      q: 'How old is the Universe according to current measurements?',
      options: ['4.6 billion years', '8.2 billion years', '13.8 billion years', '20 billion years'],
      correct: 2,
      explanation: 'Measurements from the cosmic microwave background radiation by the Planck spacecraft give an age of approximately 13.787 Â± 0.020 billion years.' },
    { id: 'q13', category: 'cosmology',
      q: 'What percentage of the Universe is made up of ordinary matter?',
      options: ['About 5%', 'About 27%', 'About 50%', 'About 68%'],
      correct: 0,
      explanation: 'Ordinary (baryonic) matter makes up only ~5% of the Universe. Dark matter accounts for ~27% and dark energy for ~68%.' },
    { id: 'q14', category: 'cosmology',
      q: 'What is the name of the boundary of a black hole beyond which nothing can escape?',
      options: ['Photon sphere', 'Singularity', 'Event horizon', 'Accretion disc'],
      correct: 2,
      explanation: 'The event horizon is the boundary around a black hole at which the escape velocity equals the speed of light. Anything that crosses it is lost forever.' },
    { id: 'q15', category: 'exoplanets',
      q: 'What method detected the majority of confirmed exoplanets?',
      options: ['Direct imaging', 'Radial velocity (Doppler)', 'Gravitational lensing', 'Transit photometry'],
      correct: 3,
      explanation: 'The transit method (detecting the slight dimming of a star as a planet passes in front) has found over 3,000 of the ~5,600 confirmed exoplanets, largely thanks to the Kepler and TESS missions.' },
  ];

  let _currentQuiz    = [];
  let _currentIndex   = 0;
  let _score          = 0;
  let _answered       = {};  
  let _container      = null;
  let _quizId         = 'default';

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function startQuiz(count = 10, category = 'all') {
    let pool = category === 'all' ? QUESTION_BANK
      : QUESTION_BANK.filter(q => q.category === category);
    _currentQuiz  = shuffle(pool).slice(0, Math.min(count, pool.length));
    _currentIndex = 0;
    _score        = 0;
    _answered     = {};
    renderQuestion();
    CosmosAnnouncer.announce('Quiz started. Question 1.');
    CosmosEvents.emit('cosmos:quiz-start', { count: _currentQuiz.length });
  }

  function renderQuestion() {
    if (!_container) return;
    const q   = _currentQuiz[_currentIndex];
    const num = _currentIndex + 1;
    const tot = _currentQuiz.length;

    if (!q) { renderResults(); return; }

    _container.innerHTML = `
      <div class="quiz-header">
        <div class="quiz-progress-text">Question ${num} of ${tot}</div>
        <div class="quiz-progress-bar" role="progressbar"
             aria-valuenow="${num}" aria-valuemin="1" aria-valuemax="${tot}"
             aria-label="Quiz progress">
          <div class="quiz-progress-fill" style="width:${(num/tot)*100}%" aria-hidden="true"></div>
        </div>
      </div>
      <section class="quiz-question" aria-label="Question ${num}">
        <h3 class="quiz-q-text" id="quiz-q-heading">${q.q}</h3>
        <div class="quiz-options" role="radiogroup" aria-labelledby="quiz-q-heading" id="quiz-options-group">
          ${q.options.map((opt, i) => `
            <label class="quiz-option" for="quiz-opt-${i}">
              <input type="radio" name="quiz-option" id="quiz-opt-${i}"
                     value="${i}" ${_answered[q.id] !== undefined ? 'disabled' : ''}>
              <span class="quiz-option-text">${opt}</span>
            </label>`).join('')}
        </div>
        ${_answered[q.id] !== undefined ? renderFeedback(q) : ''}
      </section>
      <div class="quiz-actions">
        ${_answered[q.id] === undefined
          ? `<button type="button" class="btn btn-primary" id="quiz-submit-btn">Submit Answer</button>`
          : _currentIndex < _currentQuiz.length - 1
            ? `<button type="button" class="btn btn-primary" id="quiz-next-btn">Next Question</button>`
            : `<button type="button" class="btn btn-primary" id="quiz-finish-btn">See Results</button>`}
      </div>`;

    
    if (_answered[q.id] !== undefined) {
      markAnswerUI(q, _answered[q.id]);
    }

    bindQuizActions(q);

    const heading = _container.querySelector('#quiz-q-heading');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus();
      heading.addEventListener('blur', () => heading.removeAttribute('tabindex'), { once: true });
    }
    if (_currentIndex > 0) {
      CosmosAnnouncer.announce(`Question ${num} of ${tot}: ${q.q}`, { assertive: false });
    }
  }

  function renderFeedback(q) {
    const userIdx    = _answered[q.id];
    const correct    = q.correct;
    const isCorrect  = userIdx === correct;
    return `
      <div class="quiz-feedback ${isCorrect ? 'is-correct' : 'is-wrong'}" role="alert">
        <strong>${isCorrect ? '✓ Correct!' : '✗ Incorrect'}</strong>
        <p>${q.explanation}</p>
      </div>`;
  }

  function markAnswerUI(q, selectedIdx) {
    _container.querySelectorAll('.quiz-option').forEach((label, i) => {
      label.classList.toggle('is-correct', i === q.correct);
      label.classList.toggle('is-wrong',   i === selectedIdx && i !== q.correct);
      label.classList.toggle('is-selected', i === selectedIdx);
    });
  }

  function bindQuizActions(q) {
    const submitBtn = document.getElementById('quiz-submit-btn');
    const nextBtn   = document.getElementById('quiz-next-btn');
    const finishBtn = document.getElementById('quiz-finish-btn');

    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        const selected = _container.querySelector('input[name="quiz-option"]:checked');
        if (!selected) {
          CosmosAnnouncer.announce('Please select an answer first', { assertive: true });
          _container.querySelectorAll('input[name="quiz-option"]').forEach(r => r.setAttribute('aria-invalid', 'true'));
          return;
        }
        _container.querySelectorAll('input[name="quiz-option"]').forEach(r => r.removeAttribute('aria-invalid'));
        const idx = parseInt(selected.value);
        _answered[q.id] = idx;
        if (idx === q.correct) _score++;
        markAnswerUI(q, idx);
        submitBtn.replaceWith(
          (() => {
            const fb = document.createElement('div');
            fb.innerHTML = renderFeedback(q);
            fb.className = 'quiz-feedback-wrapper';
            return fb;
          })()
        );
        const advance = document.createElement('button');
        advance.type  = 'button';
        advance.className = 'btn btn-primary';
        advance.id    = _currentIndex < _currentQuiz.length - 1 ? 'quiz-next-btn' : 'quiz-finish-btn';
        advance.textContent = _currentIndex < _currentQuiz.length - 1 ? 'Next Question' : 'See Results';
        _container.querySelector('.quiz-actions').appendChild(advance);
        advance.focus();
        bindQuizActions(q);
        _container.querySelectorAll('input[name="quiz-option"]').forEach(inp => { inp.disabled = true; });
        const msg = idx === q.correct ? 'Correct!' : `Wrong. ${q.explanation.slice(0, 80)}`;
        CosmosAnnouncer.announce(msg, { assertive: true });
      });
    }

    if (nextBtn)   { nextBtn.addEventListener('click', () => { _currentIndex++; renderQuestion(); const nextFocus = _container.querySelector('#quiz-submit-btn, #quiz-next-btn, #quiz-finish-btn'); if (nextFocus) nextFocus.focus(); }); }
    if (finishBtn) { finishBtn.addEventListener('click', () => { renderResults(); const restartBtn = document.getElementById('quiz-restart-btn'); if (restartBtn) restartBtn.focus(); }); }
  }

  function renderResults() {
    if (!_container) return;
    const total  = _currentQuiz.length;
    const pct    = Math.round((_score / total) * 100);
    const grade  = pct >= 80 ? 'Excellent' : pct >= 60 ? 'Good' : pct >= 40 ? 'Fair' : 'Needs work';

    _container.innerHTML = `
      <div class="quiz-results" role="region" aria-label="Quiz results">
        <h3 class="quiz-results-title">Quiz Complete!</h3>
        <div class="quiz-score">
          <span class="quiz-score-value">${_score}/${total}</span>
          <span class="quiz-score-pct">(${pct}%)</span>
        </div>
        <p class="quiz-grade">${grade}</p>
        <div class="quiz-review">
          ${_currentQuiz.map((q, i) => `
            <div class="quiz-review-item ${_answered[q.id] === q.correct ? 'was-correct' : 'was-wrong'}">
              <span class="review-num">${i + 1}.</span>
              <span class="review-q">${q.q}</span>
              <span class="review-a">Your answer: ${q.options[_answered[q.id]] || '(no answer)'}</span>
              ${_answered[q.id] !== q.correct
                ? `<span class="review-correct">Correct: ${q.options[q.correct]}</span>`
                : ''}
            </div>`).join('')}
        </div>
        <button type="button" class="btn btn-primary" id="quiz-restart-btn">Try Again</button>
      </div>`;

    document.getElementById('quiz-restart-btn')
      ?.addEventListener('click', () => startQuiz(_currentQuiz.length));

    
    const scores = (() => {
      try { return JSON.parse(localStorage.getItem(CosmosConfig.storage.quizScoresKey)) || {}; }
      catch (_) { return {}; }
    })();
    scores[_quizId] = { score: _score, total, pct, date: new Date().toISOString() };
    try { localStorage.setItem(CosmosConfig.storage.quizScoresKey, JSON.stringify(scores)); } catch (_) {}
    CosmosState.set('quizScores', scores);
    CosmosEvents.emit('cosmos:quiz-complete', { score: _score, total, pct });
  }

  CosmosBootstrap.register('quiz', () => {
    _container = document.querySelector('[data-quiz]');
    if (!_container) return;

    const startBtn = document.querySelector('[data-quiz-start]');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        const count = parseInt(startBtn.dataset.quizCount) || 10;
        const cat   = startBtn.dataset.quizCategory || 'all';
        startQuiz(count, cat);
      });
    } else {
      startQuiz();
    }
  }, { critical: false, priority: 50 });

  return { start: startQuiz, questions: QUESTION_BANK };
})();


const CosmosBookmarks = (() => {
  const KEY = CosmosConfig.storage.bookmarksKey;

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch (_) { return []; }
  }

  function save(bookmarks) {
    try { localStorage.setItem(KEY, JSON.stringify(bookmarks)); } catch (_) {}
    CosmosState.set('bookmarks', bookmarks);
    CosmosEvents.emit('cosmos:bookmarks-changed', { bookmarks });
    syncToggleButtons();
    renderList();
  }

  function isBookmarked(slug) {
    return load().some(b => b.slug === slug);
  }

  function add(article) {
    const bookmarks = load();
    if (bookmarks.some(b => b.slug === article.slug)) return;
    bookmarks.unshift({
      slug:       article.slug,
      title:      article.title,
      category:   article.category,
      addedAt:    new Date().toISOString(),
      summary:    (article.summary || '').slice(0, 120),
    });
    save(bookmarks.slice(0, 200));
    CosmosAnnouncer.announce('Bookmarked: ' + article.title);
  }

  function remove(slug) {
    const title = load().find(b => b.slug === slug)?.title || slug;
    save(load().filter(b => b.slug !== slug));
    CosmosAnnouncer.announce('Bookmark removed: ' + title);
  }

  function toggle(article) {
    isBookmarked(article.slug) ? remove(article.slug) : add(article);
  }

  function syncToggleButtons() {
    const currentSlug = CosmosState.get('currentArticle')?.slug;
    document.querySelectorAll('[data-bookmark-toggle]').forEach(btn => {
      const slug   = btn.dataset.bookmarkToggle || currentSlug;
      const marked = isBookmarked(slug);
      btn.setAttribute('aria-pressed', String(marked));
      btn.setAttribute('aria-label', marked ? 'Remove bookmark' : 'Bookmark this article');
      btn.classList.toggle('is-bookmarked', marked);
    });
  }

  function renderList() {
    const container = document.querySelector('[data-bookmarks-list]');
    if (!container) return;
    const bookmarks = load();
    if (!bookmarks.length) {
      container.innerHTML = '<p class="bookmarks-empty">No bookmarks yet. Click the bookmark icon on any article to save it.</p>';
      return;
    }
    container.innerHTML = `
      <ul class="bookmarks-list" aria-label="Saved articles" aria-live="polite" aria-atomic="false">
        ${bookmarks.map(b => `
          <li class="bookmark-item" data-bookmark-slug="${b.slug}">
            <a href="/articles/${b.slug}" class="bookmark-link">
              <span class="bookmark-title">${StringUtils.escape(b.title)}</span>
              <span class="bookmark-cat">${StringUtils.escape(b.category)}</span>
              <span class="bookmark-summary">${StringUtils.escape(b.summary)}</span>
            </a>
            <button type="button" class="bookmark-remove-btn"
                    aria-label="Remove bookmark: ${StringUtils.escape(b.title)}"
                    data-remove-bookmark="${b.slug}">×</button>
          </li>`).join('')}
      </ul>
      <p class="bookmarks-count">${bookmarks.length} saved article${bookmarks.length !== 1 ? 's' : ''}</p>`;

    container.addEventListener('click', e => {
      const btn = e.target.closest('[data-remove-bookmark]');
      if (!btn) return;
      const list = container.querySelector('.bookmarks-list');
      const item = btn.closest('[data-bookmark-slug]');
      const nextFocus = (item && (item.nextElementSibling || item.previousElementSibling))
        ? (item.nextElementSibling || item.previousElementSibling).querySelector('button, a')
        : container.querySelector('[data-bookmark-toggle]');
      remove(btn.dataset.removeBookmark);
      if (nextFocus) nextFocus.focus();
    });
  }

  CosmosBootstrap.register('bookmarks', () => {
    CosmosState.set('bookmarks', load());
    syncToggleButtons();
    renderList();

    document.addEventListener('click', e => {
      const btn = e.target.closest('[data-bookmark-toggle]');
      if (!btn) return;
      const article = CosmosState.get('currentArticle') || { slug: btn.dataset.bookmarkToggle, title: '(this article)' };
      const wasBookmarked = isBookmarked(article.slug);
      toggle(article);
      CosmosAnnouncer.announce(wasBookmarked ? 'Bookmark removed' : 'Article bookmarked');
    });
  }, { critical: false, priority: 55 });

  return { add, remove, toggle, isBookmarked, load };
})();



const CosmosHistory = (() => {
  const KEY     = CosmosConfig.storage.historyKey;
  const MAX_ENTRIES = 50;

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch (_) { return []; }
  }

  function save(history) {
    try { localStorage.setItem(KEY, JSON.stringify(history)); } catch (_) {}
    CosmosState.set('history', history);
    CosmosEvents.emit('cosmos:history-changed', { history });
  }

  function record(article) {
    if (!article?.slug) return;
    const history = load().filter(h => h.slug !== article.slug);
    history.unshift({
      slug:        article.slug,
      title:       article.title,
      category:    article.category,
      visitedAt:   new Date().toISOString(),
      progress:    0,
    });
    save(history.slice(0, MAX_ENTRIES));
  }

  function updateProgress(slug, pct) {
    const history = load();
    const entry   = history.find(h => h.slug === slug);
    if (entry) {
      entry.progress = pct;
      save(history);
    }
  }

  function renderHistory() {
    const container = document.querySelector('[data-history-list]');
    if (!container) return;
    const history = load();

    if (!history.length) {
      container.innerHTML = '<p class="history-empty">Your reading history will appear here.</p>';
      return;
    }

    const grouped = history.reduce((acc, h) => {
      const d = new Date(h.visitedAt);
      const key = d.toLocaleDateString('en-GB', { weekday: 'long', month: 'long', day: 'numeric' });
      if (!acc[key]) acc[key] = [];
      acc[key].push(h);
      return acc;
    }, {});

    container.innerHTML = Object.entries(grouped).map(([date, items]) => `
      <section class="history-group" aria-label="${date}">
        <h3 class="history-date">${date}</h3>
        <ul class="history-list">
          ${items.map(h => `
            <li class="history-item">
              <a href="/articles/${h.slug}" class="history-link">
                <span class="history-title">${StringUtils.escape(h.title)}</span>
                <span class="history-cat">${StringUtils.escape(h.category)}</span>
                ${h.progress > 5 ? `
                  <span class="history-progress" role="progressbar" aria-valuenow="${h.progress}" aria-valuemin="0" aria-valuemax="100" aria-label="${h.progress}% read">
                    <span class="history-progress-bar" style="width:${h.progress}%"></span>
                  </span>` : ''}
              </a>
            </li>`).join('')}
        </ul>
      </section>`).join('');
  }

  function clearHistory() {
    save([]);
    renderHistory();
    CosmosAnnouncer.announce('Reading history cleared');
  }

  CosmosBootstrap.register('history', () => {
    CosmosState.set('history', load());
    renderHistory();

    
    CosmosEvents.on('cosmos:article-opened', ({ article }) => { record(article); });
    CosmosEvents.on('cosmos:reading-progress', ({ slug, pct }) => { updateProgress(slug, pct); });

    const clearBtn = document.querySelector('[data-clear-history]');
    if (clearBtn) clearBtn.addEventListener('click', clearHistory);
  }, { critical: false, priority: 56 });

  return { record, updateProgress, load, clearHistory };
})();



const CosmosGallery = (() => {
  let _images  = [];
  let _index   = 0;
  let _box     = null;
  let _lastFocused = null;
  let _lastTrigger = null;

  function buildLightbox() {
    if (document.getElementById('cosmos-lightbox')) return;
    const lb = document.createElement('div');
    lb.id = 'cosmos-lightbox';
    lb.className = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Image viewer');
    lb.setAttribute('hidden', '');
    lb.innerHTML = `
      <div class="lightbox-backdrop"></div>
      <div class="lightbox-inner">
        <button class="lightbox-close" type="button" aria-label="Close image viewer">✕</button>
        <button class="lightbox-prev"  type="button" aria-label="Previous image">‹</button>
        <div class="lightbox-img-wrap">
          <img class="lightbox-img" src="" alt="">
          <div class="lightbox-caption" aria-live="polite"></div>
        </div>
        <button class="lightbox-next"  type="button" aria-label="Next image">›</button>
        <div class="lightbox-counter" aria-live="polite" aria-atomic="true"></div>
      </div>`;
    document.body.appendChild(lb);
    _box = lb;
    bindLightboxEvents();
  }

  function open(idx) {
    if (!_box) buildLightbox();
    _lastFocused = document.activeElement;
    _lastTrigger = document.activeElement;
    _index = Math.max(0, Math.min(idx, _images.length - 1));
    showImage();
    _box.removeAttribute('hidden');
    if (_lastTrigger && _lastTrigger.setAttribute) _lastTrigger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('lightbox-open');
    CosmosState.set('lightboxOpen', true);
    
    setTimeout(() => _box.querySelector('.lightbox-close').focus(), 50);
    CosmosEvents.emit('cosmos:lightbox-opened', { index: _index });
  }

  function close() {
    if (!_box) return;
    _box.setAttribute('hidden', '');
    if (_lastTrigger && _lastTrigger.setAttribute) {
      _lastTrigger.setAttribute('aria-expanded', 'false');
      _lastTrigger = null;
    }
    document.body.classList.remove('lightbox-open');
    CosmosState.set('lightboxOpen', false);
    if (_lastFocused) { _lastFocused.focus(); _lastFocused = null; }
    CosmosEvents.emit('cosmos:lightbox-closed');
  }

  function showImage() {
    const img     = _box.querySelector('.lightbox-img');
    const caption = _box.querySelector('.lightbox-caption');
    const counter = _box.querySelector('.lightbox-counter');
    const current = _images[_index];

    img.src = current.src;
    img.alt = current.alt ?? 'Gallery image';
    if (caption) caption.textContent = current.caption || current.alt || '';
    if (counter) counter.textContent = `${_index + 1} of ${_images.length}`;

    
    const prevBtn = _box.querySelector('.lightbox-prev');
    const nextBtn = _box.querySelector('.lightbox-next');
    prevBtn.disabled = _index === 0;
    prevBtn.setAttribute('aria-disabled', String(_index === 0));
    nextBtn.disabled = _index === _images.length - 1;
    nextBtn.setAttribute('aria-disabled', String(_index === _images.length - 1));

    CosmosAnnouncer.announce(`Image ${_index + 1} of ${_images.length}: ${img.alt}`);
  }

  function prev() { if (_index > 0) { _index--; showImage(); } }
  function next() { if (_index < _images.length - 1) { _index++; showImage(); } }

  function bindLightboxEvents() {
    _box.querySelector('.lightbox-close')  .addEventListener('click', close);
    _box.querySelector('.lightbox-prev')   .addEventListener('click', prev);
    _box.querySelector('.lightbox-next')   .addEventListener('click', next);
    _box.querySelector('.lightbox-backdrop').addEventListener('click', close);

    _box.addEventListener('keydown', e => {
      if (e.key === 'Escape')     { close(); return; }
      if (e.key === 'ArrowLeft')  { prev(); return; }
      if (e.key === 'ArrowRight') { next(); return; }
      if (e.key === 'Home')       { _index = 0; showImage(); return; }
      if (e.key === 'End')        { _index = _images.length - 1; showImage(); return; }
      if (e.key === 'Tab') {
        const focusable = Array.from(_box.querySelectorAll('button:not([disabled]):not([aria-disabled="true"]), [href]:not([aria-disabled="true"]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
          .filter(el => !el.closest('[hidden]') && !el.closest('[aria-hidden="true"]'));
        if (!focusable.length) { e.preventDefault(); return; }
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
        else { if (document.activeElement === last) { e.preventDefault(); first.focus(); } }
      }
    });

    
    let touchStartX = 0;
    _box.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    _box.addEventListener('touchend',   e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) { dx < 0 ? next() : prev(); }
    });
  }

  function collectGalleryImages(container) {
    const imgs = Array.from(container.querySelectorAll('[data-gallery-item]'));
    return imgs.map(el => ({
      src:     el.dataset.src || el.src || el.querySelector('img')?.src || '',
      alt:     el.dataset.alt || el.alt || el.querySelector('img')?.alt || '',
      caption: el.dataset.caption || '',
    }));
  }

  function initGallery(galleryEl) {
    _images = collectGalleryImages(galleryEl);
    if (!_images.length) return;

    galleryEl.querySelectorAll('[data-gallery-item]').forEach((el, i) => {
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      const altText = _images[i].alt;
      el.setAttribute('aria-label', altText ? `View image ${i + 1}: ${altText}` : `View image ${i + 1}`);
      el.setAttribute('aria-haspopup', 'dialog');
      el.setAttribute('aria-expanded', 'false');
      if (!_box) buildLightbox();
      if (_box && _box.id) el.setAttribute('aria-controls', _box.id);

      el.addEventListener('click', () => open(i));
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
      });
    });

    buildLightbox();
  }

  
  function setupMasonry(galleryEl) {
    const items = galleryEl.querySelectorAll('.gallery-item');
    if (!items.length) return;
    
    const allLoaded = Array.from(items).map(item => {
      const img = item.querySelector('img');
      if (!img) return Promise.resolve();
      return img.complete ? Promise.resolve()
        : new Promise(res => { img.onload = res; img.onerror = res; });
    });
    Promise.all(allLoaded).then(() => {
      galleryEl.classList.add('masonry-ready');
    });
  }

  CosmosBootstrap.register('gallery', () => {
    document.querySelectorAll('[data-gallery]').forEach(el => {
      initGallery(el);
      setupMasonry(el);
    });
  }, { critical: false, priority: 60 });

  return { open, close, prev, next };
})();



const CosmosAnimations = (() => {
  function init() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('anim-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('[data-anim]').forEach(el => io.observe(el));

    
    const counterIo = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        counterIo.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-count-to]').forEach(el => counterIo.observe(el));
  }

  function animateCounter(el) {
    const target   = parseFloat(el.dataset.countTo);
    const duration = parseInt(el.dataset.countDuration) || 1500;
    const decimals = el.dataset.countDecimals ? parseInt(el.dataset.countDecimals) : 0;
    const suffix   = el.dataset.countSuffix || '';
    const prefix   = el.dataset.countPrefix || '';
    const finalText = prefix + target.toFixed(decimals) + suffix;
    const start    = performance.now();

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = finalText;
      CosmosAnnouncer.announce(finalText);
      return;
    }

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = eased * target;
      el.textContent = prefix + value.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else { el.textContent = finalText; CosmosAnnouncer.announce(finalText); }
    }
    requestAnimationFrame(step);
  }

  
  function setupParallax() {
    const parallaxEls = document.querySelectorAll('[data-parallax]');
    if (!parallaxEls.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
      if (ticking) return;
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        parallaxEls.forEach(el => {
          const speed  = parseFloat(el.dataset.parallax) || 0.3;
          const offset = scrollY * speed;
          el.style.setProperty('--parallax-offset', `${offset}px`);
        });
        ticking = false;
      });
      ticking = true;
    }, { passive: true });
  }

  CosmosBootstrap.register('animations', () => {
    init();
    setupParallax();
  }, { critical: false, priority: 65 });

  return { animateCounter };
})();




const CosmosComments = (() => {
  const STORAGE_KEY = 'cosmos_comments_v2';
  const MAX_COMMENT_LEN = 2000;
  const MAX_NAME_LEN    = 80;

  function loadForSlug(slug) {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
      return all[slug] || [];
    } catch (_) { return []; }
  }

  function saveForSlug(slug, comments) {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
      all[slug] = comments;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch (_) {}
  }

  function sanitizeText(text) {
    return text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  }

  function buildCommentHTML(c, depth = 0) {
    const replies = (c.replies || []).map(r => buildCommentHTML(r, depth + 1)).join('');
    return `
      <article class="comment${depth > 0 ? ' comment--reply' : ''}"
               id="comment-${c.id}"
               aria-label="Comment by ${sanitizeText(c.name)}">
        <header class="comment-header">
          <span class="comment-author">${sanitizeText(c.name)}</span>
          <time class="comment-time" datetime="${c.postedAt}">${formatDate(c.postedAt)}</time>
          ${c.edited ? '<span class="comment-edited">(edited)</span>' : ''}
        </header>
        <div class="comment-body">${sanitizeText(c.text).replace(/\n/g, '<br>')}</div>
        <footer class="comment-footer">
          <button type="button" class="comment-like-btn"
                  data-comment-like="${c.id}"
                  aria-label="${c.likes || 0} likes. Like this comment">
            ♥ ${c.likes || 0}
          </button>
          <button type="button" class="comment-reply-btn"
                  data-comment-reply="${c.id}"
                  aria-expanded="false" aria-controls="reply-form-${c.id}"
                  aria-label="Reply to ${sanitizeText(c.name)}'s comment">
            Reply
          </button>
        </footer>
        ${replies ? `<div class="comment-replies" role="region" aria-label="Replies">${replies}</div>` : ''}
        <div class="comment-reply-form" id="reply-form-${c.id}" hidden></div>
      </article>`;
  }

  function buildReplyForm(parentId, container) {
    const form = document.getElementById(`reply-form-${parentId}`);
    if (!form) return;
    if (!form.hidden) { form.hidden = true; return; }
    form.innerHTML = `
      <form class="comment-form comment-form--reply" data-reply-to="${parentId}"
            aria-label="Reply form" novalidate>
        <div class="form-group">
          <label for="reply-name-${parentId}">Name <span aria-hidden="true">*</span></label>
          <input type="text" id="reply-name-${parentId}" name="name"
                 required maxlength="${MAX_NAME_LEN}" autocomplete="name"
                 placeholder="Your name">
        </div>
        <div class="form-group">
          <label for="reply-text-${parentId}">Reply <span aria-hidden="true">*</span></label>
          <textarea id="reply-text-${parentId}" name="text"
                    required maxlength="${MAX_COMMENT_LEN}" rows="3"
                    placeholder="Write your reply…"></textarea>
          <span id="char-count-${parentId}" class="char-count" aria-live="polite" aria-atomic="true" data-target="reply-text-${parentId}">0/${MAX_COMMENT_LEN}</span>
        </div>
        <button type="submit" class="btn btn-primary btn-sm">Post Reply</button>
        <button type="button" class="btn btn-ghost btn-sm" data-cancel-reply="${parentId}">Cancel</button>
      </form>`;
    form.hidden = false;
    form.querySelector('input').focus();
  }

  function renderComments(slug, container) {
    const comments = loadForSlug(slug);
    const countEl  = container.querySelector('[data-comment-count]');
    if (countEl) countEl.textContent = comments.length;
    CosmosAnnouncer.announce(`${comments.length} comment${comments.length !== 1 ? 's' : ''} loaded`);

    const list = container.querySelector('[data-comment-list]');
    if (!list) return;

    if (!comments.length) {
      list.innerHTML = '<p class="comments-empty">Be the first to leave a comment.</p>';
      return;
    }

    list.innerHTML = comments.map(c => buildCommentHTML(c)).join('');
  }

  function validateCommentForm(form) {
    const errors = [];
    const name   = form.querySelector('[name="name"]');
    const text   = form.querySelector('[name="text"]');

    form.querySelectorAll('[aria-invalid]').forEach(el => {
      el.removeAttribute('aria-invalid');
      el.removeAttribute('aria-describedby');
    });
    form.querySelectorAll('.field-error').forEach(el => el.remove());

    if (!name?.value.trim()) {
      errors.push({ field: name, msg: 'Please enter your name.' });
    } else if (name.value.trim().length > MAX_NAME_LEN) {
      errors.push({ field: name, msg: `Name must be ${MAX_NAME_LEN} characters or fewer.` });
    }

    if (!text?.value.trim()) {
      errors.push({ field: text, msg: 'Please write a comment.' });
    } else if (text.value.trim().length > MAX_COMMENT_LEN) {
      errors.push({ field: text, msg: `Comment must be ${MAX_COMMENT_LEN} characters or fewer.` });
    }

    if (errors.length) {
      errors.forEach(({ field, msg }) => {
        if (!field) return;
        const errorId = `${field.id || field.name || 'field'}-error`;
        field.setAttribute('aria-invalid', 'true');
        field.setAttribute('aria-describedby', errorId);
        const errEl     = document.createElement('span');
        errEl.id        = errorId;
        errEl.className = 'field-error';
        errEl.setAttribute('role', 'alert');
        errEl.textContent = msg;
        field.insertAdjacentElement('afterend', errEl);
      });
      errors[0].field?.focus();
    }

    return errors.length === 0;
  }

  function handleCommentSubmit(e, slug, container) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!validateCommentForm(form)) return;

    const name = form.querySelector('[name="name"]').value.trim();
    const text = form.querySelector('[name="text"]').value.trim();
    const parentId = form.dataset.replyTo;

    const newComment = {
      id:       `c_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name, text,
      postedAt: new Date().toISOString(),
      likes:    0,
      replies:  [],
    };

    const comments = loadForSlug(slug);

    if (parentId) {
      function addReply(list) {
        for (const c of list) {
          if (c.id === parentId) { c.replies = c.replies || []; c.replies.push(newComment); return true; }
          if (c.replies && addReply(c.replies)) return true;
        }
        return false;
      }
      addReply(comments);
    } else {
      comments.push(newComment);
    }

    saveForSlug(slug, comments);
    form.reset();
    renderComments(slug, container);
    if (parentId) {
      const replyBtn = container.querySelector(`[data-comment-reply="${parentId}"]`);
      if (replyBtn) replyBtn.focus();
    }
    CosmosAnnouncer.announce('Comment posted successfully', { assertive: true });
    CosmosEvents.emit('cosmos:comment-posted', { slug, comment: newComment });
  }

  function setupCommentInteractions(slug, container) {
    container.querySelectorAll('[data-comment-reply]').forEach(btn => btn.setAttribute('aria-expanded', 'false'));

    container.addEventListener('click', e => {
      const likeBtn = e.target.closest('[data-comment-like]');
      if (likeBtn) {
        const id = likeBtn.dataset.commentLike;
        const comments = loadForSlug(slug);
        function doLike(list) {
          for (const c of list) {
            if (c.id === id) { c.likes = (c.likes || 0) + 1; return true; }
            if (c.replies && doLike(c.replies)) return true;
          }
        }
        doLike(comments);
        saveForSlug(slug, comments);
        renderComments(slug, container);
        const updatedBtn = container.querySelector(`[data-comment-like="${id}"]`);
        if (updatedBtn) updatedBtn.focus();
        return;
      }

      const replyBtn = e.target.closest('[data-comment-reply]');
      if (replyBtn) {
        buildReplyForm(replyBtn.dataset.commentReply, container);
        const form = document.getElementById(`reply-form-${replyBtn.dataset.commentReply}`);
        replyBtn.setAttribute('aria-expanded', form && !form.hidden ? 'true' : 'false');
        return;
      }

      const cancelBtn = e.target.closest('[data-cancel-reply]');
      if (cancelBtn) {
        const form = document.getElementById(`reply-form-${cancelBtn.dataset.cancelReply}`);
        if (form) {
          form.hidden = true;
          const replyBtn = container.querySelector(`[data-comment-reply="${cancelBtn.dataset.cancelReply}"]`);
          if (replyBtn) { replyBtn.setAttribute('aria-expanded', 'false'); replyBtn.focus(); }
        }
        return;
      }
    });

    container.addEventListener('submit', e => {
      if (e.target.matches('[data-reply-to]') || e.target.closest('.comment-form')) {
        handleCommentSubmit(e, slug, container);
      }
    });

    container.addEventListener('input', e => {
      const textarea = e.target.closest('textarea');
      if (!textarea) return;
      const counter = container.querySelector(`[data-target="${textarea.id}"]`);
      if (counter) counter.textContent = `${textarea.value.length}/${MAX_COMMENT_LEN}`;
    });
  }

  CosmosBootstrap.register('comments', () => {
    const container = document.querySelector('[data-comments]');
    if (!container) return;
    const slug = container.dataset.comments || document.body.dataset.articleSlug || 'default';

    renderComments(slug, container);
    setupCommentInteractions(slug, container);

    const mainForm = container.querySelector('[data-main-comment-form]');
    if (mainForm) mainForm.addEventListener('submit', e => handleCommentSubmit(e, slug, container));

  }, { critical: false, priority: 70 });

  return { loadForSlug, renderComments };
})();


const CosmosNewsletter = (() => {
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const STORAGE_KEY = 'cosmos_newsletter_subs';

  function isSubscribed(email) {
    try {
      const subs = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      return subs.includes(email.toLowerCase());
    } catch (_) { return false; }
  }

  function recordSubscription(email) {
    try {
      const subs = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      if (!subs.includes(email.toLowerCase())) subs.push(email.toLowerCase());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(subs));
    } catch (_) {}
  }

  function showState(form, state, message) {
    const msg = form.querySelector('[data-newsletter-msg]');
    if (!msg) return;
    if (!msg.id) msg.id = `newsletter-msg-${Math.random().toString(36).slice(2, 8)}`;
    msg.className = `newsletter-msg newsletter-msg--${state}`;
    msg.textContent = message;
    msg.removeAttribute('hidden');
    msg.setAttribute('role', state === 'error' ? 'alert' : 'status');
    const input = form.querySelector('[type="email"]');
    if (input) input.setAttribute('aria-describedby', msg.id);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const form  = e.currentTarget;
    const input = form.querySelector('[type="email"]');
    const email = input?.value.trim() || '';

    form.querySelectorAll('[data-newsletter-msg]').forEach(el => el.setAttribute('hidden', ''));
    input?.removeAttribute('aria-invalid');
    input?.removeAttribute('aria-describedby');

    if (!email || !EMAIL_RE.test(email)) {
      input?.setAttribute('aria-invalid', 'true');
      showState(form, 'error', 'Please enter a valid email address.');
      input?.focus();
      return;
    }

    if (isSubscribed(email)) {
      showState(form, 'info', `${email} is already subscribed. Thank you!`);
      return;
    }

    const submitBtn = form.querySelector('[type="submit"]');
    form.setAttribute('aria-busy', 'true');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Subscribing...'; }

    setTimeout(() => {
      recordSubscription(email);
      showState(form, 'success', `You're subscribed! Welcome to Cosmos Explorer, ${email}.`);
      form.reset();
      form.setAttribute('aria-busy', 'false');
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Subscribe'; }
      CosmosEvents.emit('cosmos:newsletter-subscribed', { email });
    }, 600);
  }

  CosmosBootstrap.register('newsletter', () => {
    document.querySelectorAll('[data-newsletter-form]').forEach(form => {
      form.setAttribute('novalidate', '');
      form.addEventListener('submit', handleSubmit);
    });
  }, { critical: false, priority: 75 });

  return { isSubscribed };
})();


const CosmosNotify = (() => {
  let _container = null;

  function getContainer() {
    if (!_container) {
      _container = document.createElement('div');
      _container.id = 'cosmos-toasts';
      _container.className = 'toast-container';
      _container.setAttribute('role', 'log');
      _container.setAttribute('aria-live', 'polite');
      _container.setAttribute('aria-label', 'Notifications');
      document.body.appendChild(_container);
    }
    return _container;
  }

  function show(message, { type = 'info', duration = 4000, closable = true } = {}) {
    const c = getContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.setAttribute('role', (type === 'error' || type === 'warning') ? 'alert' : 'status');
    toast.innerHTML = `
      <span class="toast-icon" aria-hidden="true">${
        type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '⚠' : 'ℹ'
      }</span>
      <span class="toast-message">${StringUtils.escape(message)}</span>
      ${closable ? `<button type="button" class="toast-close" aria-label="Dismiss notification">✕</button>` : ''}`;

    c.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('toast--in'));

    const dismiss = () => {
      // Move focus before removing if toast or its children are focused
      if (toast.contains(document.activeElement)) {
        const nextToast = toast.nextElementSibling || toast.previousElementSibling;
        const fallback = nextToast ? nextToast.querySelector('button') : document.querySelector('main, [role="main"]') || document.body;
        if (fallback) fallback.focus();
      }
      toast.classList.remove('toast--in');
      toast.classList.add('toast--out');
      toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    };

    if (closable) toast.querySelector('.toast-close').addEventListener('click', dismiss);
    if (duration > 0) {
      let _timer = setTimeout(dismiss, duration);
      // Pause auto-dismiss on hover/focus so users have time to read (WCAG 2.2.1)
      toast.addEventListener('mouseenter', () => { clearTimeout(_timer); _timer = 0; });
      toast.addEventListener('mouseleave', () => { if (_timer === 0) _timer = setTimeout(dismiss, duration); });
      toast.addEventListener('focusin',    () => { clearTimeout(_timer); _timer = 0; });
      toast.addEventListener('focusout',   () => { if (_timer === 0) _timer = setTimeout(dismiss, duration); });
    }

    CosmosState.update('notifications', n => [...n, { message, type, ts: Date.now() }]);
    return dismiss;
  }

  return {
    success(msg, opts) { return show(msg, { type: 'success', ...opts }); },
    error(msg, opts)   { return show(msg, { type: 'error',   ...opts }); },
    warning(msg, opts) { return show(msg, { type: 'warning', ...opts }); },
    info(msg, opts)    { return show(msg, { type: 'info',    ...opts }); },
  };
})();



const COSMOS_ARTICLES = [
  {
    "id": "art-001",
    "slug": "big-bang-theory",
    "category": "cosmology",
    "title": "The Big Bang Theory: How the Universe Began",
    "publishedAt": "2024-01-15",
    "readingMinutes": 9,
    "tags": [
      "big bang",
      "cosmology",
      "origin",
      "universe",
      "inflation"
    ],
    "summary": "The Big Bang Theory is the prevailing cosmological model explaining the origin and evolution of the Universe. According to this model, the Universe began as an extremely hot, dense singularity approximately 13.8 billion years ago.",
    "body": "The Big Bang Theory is the prevailing cosmological model for explaining the origin and large-scale structure of the Universe. According to this framework, the Universe began in an extraordinarily hot, dense state roughly 13.787 ± 0.020 billion years ago and has been expanding ever since.\n\nThe term 'Big Bang' was actually coined dismissively by astronomer Fred Hoyle during a 1949 BBC radio broadcast; he intended the phrase as a pejorative, since he preferred the rival Steady State theory. Nevertheless, the name stuck.\n\nThe evidence for the Big Bang rests on four principal observational pillars. First, the expansion of the Universe itself: Edwin Hubble discovered in 1929 that distant galaxies are receding from us, and the farther they are, the faster they recede — a relationship now encapsulated in Hubble's Law. Running the expansion backwards in time implies the Universe was once much smaller and much hotter. Second, the cosmic microwave background radiation (CMB): in 1964, Arno Penzias and Robert Wilson accidentally discovered a nearly uniform thermal glow pervading the entire sky at a temperature of about 2.725 K. This is the afterglow of the hot early Universe, redshifted by cosmic expansion to microwave wavelengths. The CMB was predicted by George Gamow, Ralph Alpher, and Robert Herman in 1948. Third, the primordial abundances of light elements: nucleosynthesis calculations predict that the hot early Universe should have produced hydrogen (about 75% by mass), helium-4 (about 25%), and traces of deuterium, helium-3, and lithium-7. Observations of old stars and primordial gas clouds match these predictions remarkably well. Fourth, large-scale structure: the distribution of galaxies and galaxy clusters across cosmic scales matches what simulations of a Big Bang Universe predict.\n\nThe very early Universe — during the first 10⁻³⁶ to 10⁻³² seconds — is thought to have undergone a period of exponential expansion called cosmic inflation, proposed by Alan Guth in 1980 and refined by Andrei Linde, Paul Steinhardt, and Andreas Albrecht. Inflation explains several puzzling features of the observable Universe: the remarkable uniformity of the CMB across regions of the sky that could not have been in causal contact, the flat global geometry of spacetime, and the absence of magnetic monopoles predicted by grand unified theories. During inflation, tiny quantum fluctuations were stretched to macroscopic scales, seeding the density variations that later grew into galaxies and galaxy clusters.\n\nAfter inflation ended, the Universe entered the radiation-dominated era. At about 10⁻⁴ seconds, the temperature had fallen to roughly 10¹² K, cool enough for quarks to combine into protons and neutrons (hadronisation). By the end of the first three minutes, Big Bang nucleosynthesis was complete, having produced the light elements listed above. For the next 380,000 years, the Universe was opaque — a hot plasma of protons, electrons, and photons locked in thermal equilibrium. Then, as the temperature fell to about 3,000 K, electrons and protons recombined into neutral hydrogen atoms. The Universe became transparent, and the photons released at this 'surface of last scattering' are the CMB we observe today.\n\nWith matter now able to clump under gravity unimpeded by radiation pressure, the first stars (Population III stars) formed around 100–200 million years after the Big Bang. These massive, metal-free stars ended their lives as supernovae and hypernovae, enriching the intergalactic medium with heavier elements and ionising the surrounding hydrogen in a process called reionisation. The first galaxies assembled around 400–600 million years after the Big Bang; the James Webb Space Telescope has now observed galaxies from this epoch, revealing they were surprisingly massive and well-formed.\n\nThe fate of the Universe depends on its energy content. Current measurements indicate the Universe is geometrically flat and dominated by dark energy (about 68%), with dark matter accounting for 27% and ordinary baryonic matter just 5%. Under the influence of dark energy — a property of space that acts as a repulsive force — the expansion of the Universe is accelerating. If dark energy remains constant (the cosmological constant), the Universe will expand forever, galaxies will recede beyond our observational horizon, stars will exhaust their fuel, and the cosmos will face a 'heat death' billions of trillions of years from now. Alternative fates — the Big Rip, the Big Crunch, or a cyclic Universe — remain speculative.\n\nThe Big Bang model is not without open questions. The matter-antimatter asymmetry problem asks why the early Universe produced slightly more matter than antimatter, allowing the matter we see today to survive. The nature of dark matter and dark energy remains unknown. The precise mechanism of inflation — and whether it is truly quantum gravitational in origin — is not yet determined. And the model says nothing about what, if anything, preceded or caused the Big Bang itself; general relativity breaks down at the initial singularity, and a complete theory of quantum gravity is needed to address this frontier."
  },
  {
    "id": "art-002",
    "slug": "black-holes",
    "category": "cosmology",
    "title": "Black Holes: Gravity's Ultimate Triumph",
    "publishedAt": "2024-02-03",
    "readingMinutes": 10,
    "tags": [
      "black holes",
      "gravity",
      "relativity",
      "event horizon",
      "singularity"
    ],
    "summary": "Black holes are regions of spacetime where gravity is so strong that nothing — not even light — can escape. They form when massive stars collapse at the end of their lives, and supermassive varieties lurk at the centres of most galaxies.",
    "body": "A black hole is a region of spacetime where the gravitational pull is so immense that nothing — no particle, no electromagnetic radiation, not even light — can escape from within a boundary known as the event horizon. The concept was first proposed by John Michell in 1783 and later formalised using general relativity by Karl Schwarzschild in 1916, just weeks after Einstein published his field equations.\n\nBlack holes are classified by mass into several categories. Stellar-mass black holes, ranging from a few to around 100 solar masses, form when massive stars (greater than roughly 20–25 solar masses) exhaust their nuclear fuel and undergo gravitational collapse. The core implodes in a fraction of a second while the outer layers are expelled in a supernova explosion. Intermediate-mass black holes (100 to 100,000 solar masses) have been detected as the central engines of some globular clusters and dwarf galaxies, though their formation pathway is debated. Supermassive black holes (10⁶ to 10¹⁰ solar masses) inhabit the centres of virtually all massive galaxies, including the Milky Way, where Sagittarius A* weighs in at roughly 4 million solar masses. The accretion of gas and dust onto these giants powers active galactic nuclei (AGN) and quasars — the most luminous persistent objects in the Universe.\n\nThe anatomy of a black hole begins with the event horizon, the point of no return. Its radius for a non-rotating (Schwarzschild) black hole is determined by the Schwarzschild radius: r_s = 2GM/c², where G is the gravitational constant, M is the mass, and c is the speed of light. For the Sun, r_s ≈ 3 km; for Sagittarius A*, r_s ≈ 12 million km. Inside the event horizon lies the singularity — a point (or ring, for a rotating Kerr black hole) of infinite density where our current physics breaks down. General relativity predicts the singularity; resolving it will likely require a quantum theory of gravity.\n\nRotating black holes — described by the Kerr metric — have an additional structure called the ergosphere, a region outside the event horizon where spacetime itself is dragged along by the rotation. Objects within the ergosphere can extract rotational energy from the black hole via the Penrose process. Most astrophysical black holes are rotating, as they inherit angular momentum from their progenitor stars or from accreting material.\n\nThe gravitational effects around black holes are extreme. Time dilation near the event horizon means that a distant observer watching something fall in will see it slow down asymptotically and never quite cross — while the infalling observer crosses the horizon in finite proper time. Tidal forces near the event horizon of a stellar-mass black hole are catastrophic, capable of stretching matter into long thin strands in a process astronomers call spaghettification. Near a supermassive black hole, however, tidal forces at the horizon may be mild enough that an infalling observer would not immediately notice the crossing.\n\nIn 1974, Stephen Hawking made the stunning theoretical prediction that black holes are not completely black — they slowly radiate thermal energy due to quantum effects at the event horizon, a phenomenon now called Hawking radiation. The underlying mechanism involves virtual particle-antiparticle pairs near the horizon; one particle escapes while the other falls in, carrying negative energy that reduces the black hole's mass. Hawking radiation is far too weak to detect for astrophysical black holes (its temperature is inversely proportional to mass), but it implies that black holes have a finite lifetime and will eventually evaporate. This raises the information paradox: does the information about the matter that formed the black hole survive in the radiation, or is it destroyed? This question remains one of the deepest unresolved problems in theoretical physics.\n\nThe first direct observation of a black hole came on 11 February 2016, when the Laser Interferometer Gravitational-Wave Observatory (LIGO) detected gravitational waves from the merger of two stellar-mass black holes 1.3 billion light-years away — an event designated GW150914. This confirmed both the existence of binary black hole systems and Einstein's century-old prediction of gravitational waves. Since then, the LIGO-Virgo-KAGRA network has detected dozens of compact object mergers.\n\nIn April 2019, the Event Horizon Telescope (EHT) collaboration released the first image of a black hole's shadow — M87*, a 6.5-billion-solar-mass behemoth at the centre of the galaxy M87, 55 million light-years away. The image shows the characteristic 'donut' of glowing accreted plasma surrounding the dark shadow of the event horizon. In May 2022, the EHT released the first image of Sagittarius A*, showing that our own galactic centre hosts a compact object consistent with a black hole. These images match the predictions of general relativity with remarkable precision.\n\nBlack holes also play a central role in galaxy evolution. Feedback from accreting supermassive black holes — in the form of powerful jets and radiation — can heat or eject gas from the host galaxy, quenching star formation. This co-evolution of black holes and galaxies is evidenced by tight correlations between black hole mass and host galaxy properties such as bulge mass and velocity dispersion (the M-sigma relation). Understanding this feedback is a key frontier of modern astrophysics."
  },
  {
    "id": "art-003",
    "slug": "milky-way",
    "category": "galaxies",
    "title": "The Milky Way: Our Cosmic Home",
    "publishedAt": "2024-03-12",
    "readingMinutes": 8,
    "tags": [
      "milky way",
      "galaxy",
      "spiral",
      "sagittarius",
      "galactic centre"
    ],
    "summary": "The Milky Way is the barred spiral galaxy we live in, spanning about 100,000 light-years and containing 200–400 billion stars. Understanding its structure, history, and eventual fate with Andromeda helps us place our Solar System in its cosmic context.",
    "body": "The Milky Way is the galaxy that contains our Solar System, and it is one of the most extensively studied objects in astronomy — even though we are embedded within it, which makes a global view difficult. What we see as the faint band of light crossing the night sky is a cross-section of the galactic disc as seen from inside.\n\nThe Milky Way is classified as a barred spiral galaxy (SBbc in the Hubble sequence). Its disc spans approximately 100,000–120,000 light-years in diameter, though some estimates extend the outer disc to 200,000 light-years when including the warped outer regions. The disc is relatively thin — only about 1,000 light-years thick in the inner galaxy — but has a bulge of older stars at the centre that is roughly 10,000 light-years across. Surrounding the disc is a spheroidal halo of old, metal-poor stars, globular clusters, and dark matter extending several hundred thousand light-years outward.\n\nThe central bar is a linear structure of stars stretching from one side of the bulge to the other, roughly 27,000 light-years long. From the ends of the bar emanate the major spiral arms: the Norma Arm, the Scutum-Centaurus Arm, the Perseus Arm, and the Sagittarius Arm. Our Solar System is located in a minor spur called the Orion Arm (or Orion-Cygnus Arm), situated between the Sagittarius and Perseus Arms, about 26,000 light-years from the galactic centre. The Sun orbits the centre once every 225–250 million years — a period called a cosmic year or galactic year.\n\nAt the very centre of the Milky Way lurks Sagittarius A* (Sgr A*), a supermassive black hole with a mass of approximately 4.15 million solar masses. Its existence was inferred over decades by tracking the orbits of stars in the nuclear star cluster immediately surrounding it — particularly the star S2, which completed a full orbit in 2018 with a closest approach (periapsis) of only 120 AU at 2.7% of the speed of light. The 2020 Nobel Prize in Physics was awarded to Reinhard Genzel and Andrea Ghez for this discovery. In May 2022, the Event Horizon Telescope collaboration released the first direct image of Sgr A*, showing the characteristic shadow of the event horizon surrounded by a bright ring of glowing plasma.\n\nThe Milky Way contains an estimated 200–400 billion stars, though some estimates push this higher. The stellar population spans a wide range of ages, masses, and compositions. The oldest stars in the halo date to within a few hundred million years of the Big Bang; the youngest stars are being formed right now in nebulae such as Orion and Carina. The total mass of the Milky Way — including its dark matter halo — is estimated at 1–1.5 trillion solar masses, with stars accounting for only about 50 billion of this.\n\nThe Milky Way has a retinue of satellite galaxies, the most notable being the Large and Small Magellanic Clouds (LMC and SMC), visible to the naked eye from the Southern Hemisphere. The LMC is about 160,000 light-years away and is currently connected to the Milky Way by a bridge of gas called the Magellanic Stream, stretched out by tidal interactions. The Milky Way is also slowly cannibalising the Sagittarius Dwarf Galaxy, whose tidal streams wrap around the galaxy multiple times.\n\nThe Milky Way is not isolated. It is the second-largest member of the Local Group — a collection of roughly 80 galaxies bound by gravity, dominated by the Milky Way and the Andromeda Galaxy (M31). The Local Group is itself part of the Virgo Supercluster, and on still larger scales, part of the Laniakea Supercluster, a structure spanning 520 million light-years.\n\nThe Andromeda Galaxy is on a collision course with the Milky Way. Current measurements indicate they will have their first close approach in about 4.5 billion years, with the cores merging approximately 6 billion years from now to form a giant elliptical galaxy sometimes nicknamed 'Milkomeda' or 'Andromeda Way.' Despite the apparent violence of the word 'collision,' the vast distances between individual stars mean actual stellar collisions will be exceedingly rare. The Sun and Earth should survive the merger, though the Solar System will likely be kicked to a very different orbit in the merged galaxy.\n\nStudying the Milky Way's structure is challenging because dust in the galactic plane absorbs optical light, obscuring the galactic centre. Infrared and radio observations are needed to peer through. The Gaia satellite, launched by ESA in 2013, has measured precise positions, distances, and velocities for over 1.5 billion stars, revolutionising our understanding of galactic structure, the assembly history of the Milky Way, and even the distribution of dark matter."
  },
  {
    "id": "art-004",
    "slug": "dark-matter-dark-energy",
    "category": "cosmology",
    "title": "Dark Matter and Dark Energy: The Invisible Universe",
    "publishedAt": "2024-04-08",
    "readingMinutes": 9,
    "tags": [
      "dark matter",
      "dark energy",
      "cosmology",
      "WIMPs",
      "cosmological constant"
    ],
    "summary": "Together, dark matter and dark energy constitute about 95% of the Universe's total content, yet neither has been directly detected or identified. Their existence is inferred purely from their gravitational effects — making them among the greatest mysteries in modern science.",
    "body": "One of the most profound revelations of 20th-century cosmology is that the matter we can see — stars, gas, dust, planets — accounts for only about 5% of the total energy content of the Universe. The remaining 95% consists of two mysterious components: dark matter (about 27%) and dark energy (about 68%). Neither has been directly detected in the laboratory, and the nature of both remains one of the deepest open problems in physics.\n\nDark matter was first proposed seriously by Fritz Zwicky in 1933, when he measured the velocities of galaxies in the Coma Cluster and found they were moving so fast that the visible matter could not possibly provide enough gravitational force to hold the cluster together. There had to be additional unseen mass. The evidence solidified dramatically in the 1970s when Vera Rubin and Kent Ford mapped the rotation curves of spiral galaxies — the way orbital velocity varies with distance from the galactic centre. Newtonian gravity predicts that velocities should fall off beyond the visible disc, as they do in the Solar System beyond the outermost planets. Instead, galaxy rotation curves are flat: stars at the edges of galaxies orbit at the same speed as those near the centre, even out to great radii. This can only be explained if there is a vast, roughly spherical halo of unseen mass surrounding each galaxy.\n\nSubsequent evidence for dark matter is overwhelming. Gravitational lensing — the bending of light from background objects by massive foreground structures — reveals that galaxy clusters contain far more mass than visible matter accounts for. The 'Bullet Cluster,' formed by the collision of two galaxy clusters, provides particularly clean evidence: X-ray observations show the hot gas (the majority of baryonic matter in clusters) was slowed and displaced by the collision, while gravitational lensing shows the mass of the clusters passed straight through — consistent with collisionless dark matter that does not interact electromagnetically. Computer simulations of large-scale structure in the Universe — the web of filaments and voids — match observations only when dark matter is included. The CMB power spectrum also encodes the density of dark matter with high precision.\n\nDespite all this circumstantial evidence, the particle identity of dark matter is unknown. The leading candidate for decades has been the Weakly Interacting Massive Particle (WIMP) — a hypothetical particle with mass in the range 10–10,000 GeV/c² that interacts via the weak nuclear force and gravity only. WIMPs are attractive because the 'WIMP miracle' shows that particles of such a mass and interaction strength naturally produce the observed dark matter density. Massive underground detectors (LUX-ZEPLIN, XENON1T, PandaX) searching for WIMP recoils off atomic nuclei have found no signal, ruling out large portions of the expected parameter space. Axions — ultra-light particles proposed to solve the strong CP problem in QCD — are another strong candidate, actively searched for by experiments like ADMX. Sterile neutrinos, primordial black holes, and various other exotic candidates round out the theoretical landscape.\n\nDark energy is even more enigmatic. Its existence was first established in 1998 by two independent teams — Saul Perlmutter's Supernova Cosmology Project and Brian Schmidt and Adam Riess's High-Z Supernova Search Team — who used Type Ia supernovae as standard candles to measure the expansion history of the Universe. They found that distant supernovae were dimmer than expected for a Universe decelerating under its own gravity. The expansion is accelerating. Perlmutter, Schmidt, and Riess shared the 2011 Nobel Prize in Physics for this discovery.\n\nThe simplest explanation for dark energy is Einstein's cosmological constant Λ — a constant energy density inherent to spacetime itself. Physically, this corresponds to vacuum energy: quantum mechanics predicts that even empty space is seething with virtual particle-antiparticle pairs. However, attempts to calculate the vacuum energy density from first principles produce a result that is roughly 120 orders of magnitude larger than the observed cosmological constant — the worst quantitative prediction in all of physics, sometimes called the 'vacuum catastrophe.' This may indicate that some unknown mechanism cancels most of the vacuum energy, leaving only the tiny residual we observe.\n\nAlternatives to a cosmological constant include quintessence — a dynamic scalar field whose energy density evolves over time — and modifications to general relativity on cosmological scales. The next generation of surveys (Euclid, the Vera Rubin Observatory's LSST, the Roman Space Telescope, DESI) will measure the equation of state of dark energy with unprecedented precision, distinguishing between these models.\n\nThe tension between dark energy and our best theoretical frameworks suggests that the Standard Model of particle physics and general relativity — each extraordinarily successful in their own domains — are incomplete. Unifying them into a quantum theory of gravity may illuminate both dark matter and dark energy. For now, they stand as monuments to the limits of human knowledge: the vast majority of the Universe remains invisible to us, known only by the shadows it casts."
  },
  {
    "id": "art-005",
    "slug": "exoplanets",
    "category": "exoplanets",
    "title": "Exoplanets: Worlds Beyond Our Solar System",
    "publishedAt": "2024-05-20",
    "readingMinutes": 8,
    "tags": [
      "exoplanets",
      "Kepler",
      "TESS",
      "habitable zone",
      "transit",
      "radial velocity"
    ],
    "summary": "As of 2025, more than 5,700 exoplanets have been confirmed orbiting other stars. Their astonishing diversity — from lava worlds and hot Jupiters to super-Earths and temperate rocky planets — has transformed our understanding of planetary system formation and the potential for life.",
    "body": "Until the 1990s, the only planets known to science were the eight (or nine, depending on your affection for Pluto) in our own Solar System. Today, the confirmed count exceeds 5,700 worlds orbiting other stars — exoplanets — with thousands more candidates awaiting confirmation. This transformation in our cosmic inventory is largely the result of a handful of breakthrough missions and detection techniques.\n\nThe first confirmed detection of an exoplanet around a main-sequence star came in 1995 when Michel Mayor and Didier Queloz announced the discovery of 51 Pegasi b using the radial velocity method. The planet, now nicknamed 'Dimidium,' is a hot Jupiter — a gas giant roughly half the mass of Jupiter orbiting its star every 4.2 days at a distance of just 0.05 AU. Its existence challenged prevailing theories of planetary formation, which predicted gas giants should only form beyond the snow line, far from their host stars. The discovery initiated an era in which theorists grappled with migration: the idea that planets can form at large orbital radii and then spiral inward through interactions with the protoplanetary disc.\n\nThe radial velocity technique measures the Doppler shift of stellar spectral lines as a planet gravitationally tugs the star slightly toward and away from us. It provided the initial flood of discoveries but is most sensitive to massive planets on short-period orbits. The transit method — in which the planet fleetingly dims the star as it crosses our line of sight — became the dominant detection method with the launch of NASA's Kepler Space Telescope in 2009. Kepler stared at 150,000 stars for four years, detecting the characteristic periodic dips in brightness caused by transiting planets. It delivered over 2,600 confirmed exoplanets and revealed that small planets (super-Earths and mini-Neptunes, with radii 1–4 times Earth's) are the most common type in the galaxy. Kepler's extended K2 mission and its successor, TESS (Transiting Exoplanet Survey Satellite, launched 2018), have continued expanding the census.\n\nOther detection methods include direct imaging — capturing the light from the planet itself, possible for young, widely-separated gas giants — microlensing, and astrometry (measuring the tiny wobble in the star's position on the sky). The most directly informative technique for characterising exoplanet atmospheres is transmission spectroscopy: when a planet transits, some starlight filters through its atmosphere, imprinting absorption features of atoms and molecules. The Hubble Space Telescope detected water vapour in the atmospheres of several hot Jupiters. The James Webb Space Telescope has now delivered detailed atmospheric spectra of multiple planets, including the first tentative detection of carbon dioxide in an exoplanet atmosphere and the characterisation of TRAPPIST-1 system planets.\n\nThe diversity of exoplanet types is remarkable. Hot Jupiters (gas giants in orbits shorter than 10 days) are rare but were the first to be found. Super-Earths (rocky or volatile-rich planets 1–10 Earth masses) have no Solar System analogue but are extremely common. Mini-Neptunes (2–4 Earth radii) are the most abundant type detected by Kepler. A puzzling gap around 1.5–2 Earth radii — the 'radius gap' or 'Fulton gap' — separates rocky super-Earths from puffy mini-Neptunes, likely caused by atmospheric photoevaporation. Ultra-hot Jupiters like WASP-76b have day-side temperatures exceeding 2,400°C, hot enough to vaporise iron and rain molten metal on the night side.\n\nThe habitable zone (or Goldilocks zone) is the range of orbital distances around a star where liquid water could exist on a rocky planet's surface, given sufficient atmospheric pressure. The boundaries depend on the star's luminosity and spectrum, the planet's atmospheric composition, and other factors. Detecting Earth-sized rocky planets in the habitable zones of Sun-like stars is the next grand challenge. The TRAPPIST-1 system — seven Earth-sized planets orbiting an ultra-cool red dwarf 39 light-years away — has three planets in or near the habitable zone and is the most intensively studied in the search for biosignatures.\n\nBiosignatures — detectable chemical or physical indicators of life — are the ultimate target. Oxygen and ozone are of particular interest because on Earth they are overwhelmingly biogenic; without photosynthesis, they would be rapidly destroyed by geochemical processes. Methane coexisting with oxygen is especially significant because they are chemically unstable and would quickly react without a continuous source. Water vapour is necessary but not sufficient. The JWST is beginning to place observational constraints on the atmospheres of TRAPPIST-1 planets; detecting an oxygenic biosphere remains beyond current technology but is a key goal of future missions such as ESA's LIFE mission and NASA's Habitable Worlds Observatory."
  },
  {
    "id": "art-006",
    "slug": "james-webb-telescope",
    "category": "astronomy",
    "title": "The James Webb Space Telescope: Seeing the First Light",
    "publishedAt": "2024-06-14",
    "readingMinutes": 7,
    "tags": [
      "JWST",
      "infrared",
      "telescope",
      "NASA",
      "galaxy",
      "atmosphere"
    ],
    "summary": "The James Webb Space Telescope (JWST) is the most powerful space observatory ever built. Launched Christmas Day 2021 and operating at the L2 Lagrange point, it studies the Universe in infrared light, from the atmospheres of exoplanets to the first galaxies after the Big Bang.",
    "body": "The James Webb Space Telescope (JWST) represents the culmination of more than three decades of international collaboration between NASA, the European Space Agency (ESA), and the Canadian Space Agency (CSA). Launched on 25 December 2021 aboard an Ariane 5 rocket from the Guiana Space Centre in Kourou, French Guiana, JWST is the largest and most technically complex space observatory ever deployed.\n\nThe telescope's primary mirror consists of 18 hexagonal beryllium segments coated in gold, assembling to form an 6.5-metre aperture. For comparison, the Hubble Space Telescope has a 2.4-metre mirror. The gold coating was chosen because gold is an excellent reflector of infrared light. The mirror was folded for launch and autonomously unfolded over two weeks in a painstaking sequence of 344 single-point-of-failure deployments — any one of which could have ended the mission. The successful deployment was cheered by scientists worldwide.\n\nJWST operates at the second Sun-Earth Lagrange point (L2), approximately 1.5 million km from Earth in the anti-Sun direction. At L2, the gravitational forces of the Sun and Earth combine with the centrifugal force in the rotating frame to create a semi-stable gravitational balance point. This location keeps the telescope's sunshield permanently shielding the mirrors and instruments from the Sun, Earth, and Moon, allowing the telescope to cool passively to about -233°C (40 K) — necessary for detecting faint infrared glow from distant objects without the telescope's own thermal emission overwhelming the signal.\n\nThe five-layer sunshield, made of Kapton film coated with aluminium and a doped silicon layer, unfurled to the size of a tennis court (21 × 14 metres) and reduces the thermal input by the Sun by a factor of roughly one million. The temperature difference between the Sun-facing hot side (~85°C) and the cold side (-233°C) across just a few metres of film is one of the engineering marvels of the mission.\n\nJWST carries four primary science instruments. NIRCam (Near Infrared Camera) is the main imaging instrument, sensitive to 0.6–5 µm wavelengths. NIRSpec (Near Infrared Spectrograph) can simultaneously observe spectra of up to 100 objects using a micro-shutter array — invaluable for studying hundreds of galaxies in a single pointing. MIRI (Mid-Infrared Instrument), provided by ESA, covers 5–28 µm and includes both a camera and spectrograph, cooled further to -266°C by an active cryocooler. FGS/NIRISS (Fine Guidance Sensor / Near Infrared Imager and Slitless Spectrograph) provides guiding and additional spectroscopic capability.\n\nThe science results have been transformative. In July 2022, NASA released the first full-colour science images: the deepest infrared image of the Universe (SMACS 0723), showing galaxies from over 13 billion years ago; a stellar nursery in the Carina Nebula revealing previously hidden structures; the interacting Stephan's Quintet galaxy group; the Southern Ring Nebula in unprecedented detail; and the spectrum of hot Jupiter WASP-96b, showing clear signatures of water vapour, haze, and clouds in its atmosphere — the first unambiguous detection of CO2 in an exoplanet atmosphere came shortly after.\n\nFor cosmology, the JWST has found galaxies that are unexpectedly bright and massive at redshifts z ≳ 10 — corresponding to when the Universe was less than 500 million years old. These early galaxies appear to have formed stars more rapidly than standard models predicted, challenging our understanding of galaxy formation in the early Universe. The 'impossible galaxies' are not definitively violating the Big Bang model but are making theorists revise their simulations.\n\nIn stellar physics, JWST has imaged circumstellar discs around young stars with unprecedented clarity, tracked the composition of molecular clouds, and revealed the infrared structure of supernova remnants. In Solar System science, it has detected CO2 ice and vapour plumes on the surface of Europa, improving estimates of the composition of its putative subsurface ocean. The telescope has a designed lifetime of 10 years but carries enough fuel for 20+ years in the ideal case; the precise Ariane 5 launch trajectory saved propellant, extending the projected lifespan.\n\nJWST's cultural impact extends beyond science. Its images have become iconic representations of the cosmos's beauty — reminders that the Universe is far larger, older, and more wondrous than everyday experience suggests. It stands in a lineage stretching from Galileo's first telescope to Hubble, each instrument expanding the horizon of human sight across time and space."
  },
  {
    "id": "art-007",
    "slug": "neutron-stars-pulsars",
    "category": "stars",
    "title": "Neutron Stars and Pulsars: The Densest Known Matter",
    "publishedAt": "2024-07-22",
    "readingMinutes": 8,
    "tags": [
      "neutron stars",
      "pulsars",
      "magnetars",
      "gravitational waves",
      "supernovae"
    ],
    "summary": "Neutron stars are the collapsed remnants of massive stars, packing more than the mass of the Sun into a sphere just 20 km across. As pulsars, they spin hundreds of times per second with clock-like regularity, making them nature's most precise timekeepers and unique laboratories for extreme physics.",
    "body": "When a massive star — roughly 8 to 20 times the mass of the Sun — reaches the end of its nuclear-burning life, gravity overwhelms all other forces and the iron core collapses catastrophically in a fraction of a second. If the star is not massive enough to form a black hole, the result is a neutron star: a sphere of neutronium roughly 20 kilometres in diameter, yet more massive than the Sun, spinning rapidly and radiating intensely.\n\nNeutron stars are the densest known objects short of black holes. Their density is roughly 4 × 10¹⁷ kg/m³ — a teaspoon would weigh about 10 million tonnes on Earth. At this density, atomic nuclei are crushed together: electrons and protons merge via inverse beta decay (p + e⁻ → n + νₑ) to produce neutrons, giving neutron stars their name. The interior is layered: a thin outer crust of heavy nuclei and electrons, an inner crust of neutron-rich nuclei and free neutrons, an outer core of mainly neutrons with some protons and electrons, and a deep inner core whose composition — perhaps quark matter, hyperons, or a colour superconducting phase — remains uncertain. Determining the neutron star equation of state is one of the central goals of nuclear astrophysics.\n\nMost neutron stars are observed as pulsars — rapidly rotating neutron stars that emit beams of electromagnetic radiation (usually radio waves, sometimes X-rays or gamma rays) from their magnetic poles. Because the magnetic axis is typically misaligned with the rotation axis, the beams sweep around like a lighthouse beam, producing regular pulses when the beam crosses our line of sight. Pulsars were discovered in 1967 by Jocelyn Bell Burnell and her supervisor Antony Hewish at Cambridge, using a radio telescope designed to study interstellar scintillation. The regularity of the pulses (about 1.33 seconds for the first pulsar, PSR B1919+21) was so precise that the discoverers briefly nicknamed the source LGM-1 ('Little Green Men') before realising it was natural.\n\nThe spin period of pulsars spans an enormous range. Ordinary pulsars have periods of 0.03 to several seconds, gradually slowing as they radiate energy. Millisecond pulsars (MSPs), however, spin hundreds of times per second — the fastest known, PSR J1748-2446ad, rotates 716 times per second. MSPs are old, slow pulsars that have been spun up (recycled) by accreting material from a companion star in a binary system; the transfer of angular momentum accelerates the neutron star enormously. MSPs are the most stable natural clocks in the Universe — more regular than atomic clocks over timescales of years — and are used in pulsar timing arrays (PTAs) to search for ultra-low-frequency gravitational waves.\n\nA subclass of neutron stars with extraordinarily strong magnetic fields (10¹³–10¹⁵ Gauss, a trillion times Earth's field) are called magnetars. Their intense magnetic fields power sporadic bursts of gamma rays and X-rays. Magnetar flares are extraordinarily energetic: on 27 December 2004, a giant flare from magnetar SGR 1806-20 released more energy in 0.2 seconds than the Sun emits in 250,000 years, temporarily affecting Earth's ionosphere from a source 50,000 light-years away.\n\nNeutron stars in binary systems with companion stars can accrete material, forming X-ray binaries. The accreted hydrogen and helium can periodically ignite in thermonuclear flashes on the surface — X-ray bursts detectable from afar. When two neutron stars in a binary system spiral together due to gravitational wave energy loss and eventually merge, they produce a kilonova: an optical and infrared transient powered by the radioactive decay of heavy r-process elements synthesised in the merger. Kilonovae are believed to be the primary factories for gold, platinum, europium, and other heavy elements in the Universe. The merger GW170817 — detected both as a gravitational wave signal by LIGO/Virgo and as a multimessenger electromagnetic counterpart in 2017 — confirmed this scenario, inaugurating the era of multimessenger astronomy.\n\nNeutron stars continue to challenge physics in extreme regimes inaccessible to Earth-based laboratories. The ratio of gravitational potential to rest-mass energy at the surface (GM/Rc²) is about 0.2 for a typical neutron star — significantly relativistic and requiring general relativistic treatment of their structure. They are also used to test alternative theories of gravity with unprecedented precision. As LIGO-Virgo-KAGRA and future detectors like the Einstein Telescope detect increasing numbers of neutron star mergers, our understanding of matter at nuclear density will be transformed."
  },
  {
    "id": "art-008",
    "slug": "stellar-evolution",
    "category": "stars",
    "title": "The Life Cycle of Stars: From Nebula to Remnant",
    "publishedAt": "2024-08-11",
    "readingMinutes": 9,
    "tags": [
      "stellar evolution",
      "main sequence",
      "red giant",
      "supernova",
      "white dwarf"
    ],
    "summary": "Stars are born from collapsing gas clouds, spend most of their lives fusing hydrogen on the main sequence, and end their days as white dwarfs, neutron stars, or black holes — depending on their initial mass. Understanding stellar evolution is fundamental to astrophysics, since stars are the Universe's primary engines of nuclear synthesis.",
    "body": "Stars are not permanent fixtures of the sky. They are born, live for millions or billions of years, and die — sometimes violently. The drama of a star's life is governed almost entirely by a single parameter: its initial mass. Understanding stellar evolution is not only intrinsically fascinating but is essential for almost every topic in astrophysics, from the chemical enrichment of the Universe to the formation of planets.\n\nStars form in giant molecular clouds — vast, cold, slowly rotating clouds of gas (predominantly hydrogen and helium) and dust. A disturbance — perhaps a shockwave from a nearby supernova — can cause a region of the cloud to exceed the Jeans mass, the critical mass at which self-gravity overcomes thermal pressure. The region begins to collapse. As it contracts, gravitational potential energy converts to heat, increasing the temperature and pressure. Simultaneously, the cloud fragments into multiple cores, each destined to become a star (or small cluster). The central region collapses more quickly, forming a protostar surrounded by a rotating disc of gas and dust — the protoplanetary disc from which planets may eventually form. The protostar is still gathering material from the infalling envelope; it is luminous but not yet burning hydrogen.\n\nOnce the core reaches about 10 million Kelvin, hydrogen fusion ignites via the proton-proton (p-p) chain (dominant in lower-mass stars) or the CNO cycle (dominant in higher-mass stars), and the star settles onto the main sequence: a diagonal band on the Hertzsprung-Russell (HR) diagram linking luminosity and surface temperature. On the main sequence, the star is in hydrostatic equilibrium — gravity inward balanced by thermal pressure from fusion outward. Stars spend 90% of their nuclear-burning lives on or near the main sequence. The Sun has been there for about 4.6 billion years and has roughly another 5 billion to go.\n\nThe duration of a star's main sequence life scales inversely with mass to a high power. A 10-solar-mass star has 1,000 times more fuel but burns it 10,000 times faster, so it lives only about 10– 20 million years. The most massive stars (>100 solar masses) may last only a few million years. By contrast, red dwarfs — low-mass stars of 0.1 solar masses — have main sequence lifetimes exceeding 1 trillion years, far longer than the current age of the Universe.\n\nWhen a star exhausts the hydrogen in its core, thermonuclear reactions cease there, and the core contracts. A hydrogen-burning shell ignites around the inert core, and the outer envelope expands dramatically, cooling and reddening as the star becomes a red giant (for Sun-like stars) or a red supergiant (for massive stars). The Sun will swell to a radius of about 1 AU (roughly Earth's current orbital distance) in about 5 billion years, probably engulfing Mercury and Venus and possibly Earth.\n\nIn the red giant phase, helium accumulates in the core. Once the core mass reaches about 0.45 solar masses and temperature reaches 100 million Kelvin, helium fusion ignites — either gradually (for higher mass red giants) or in an explosive helium flash (for lower mass stars, where the degenerate core ignites in an uncontrolled thermonuclear runaway). Helium fusion via the triple-alpha process produces carbon and oxygen. With helium burning, the star stabilises on the horizontal branch.\n\nFor stars up to about 8 solar masses, the post-helium-burning evolution involves strong pulsations, extensive mass loss, and the ejection of the outer envelope as a beautiful planetary nebula — a shell or bubble of ionised gas illuminated by the hot exposed core (the future white dwarf). The core itself, composed mostly of carbon and oxygen, cools slowly over billions of years as a white dwarf: an object the size of Earth held up not by thermal pressure but by electron degeneracy pressure. Famous planetary nebulae include the Ring Nebula (M57), the Helix Nebula, and the Crab Nebula's progenitor remnant.\n\nFor massive stars (> ~8 solar masses), the story is more dramatic. The core proceeds through successive burning stages — helium, carbon, neon, oxygen, silicon — each stage shorter than the last and producing progressively heavier elements up to iron. Iron is the most tightly bound nucleus; fusion beyond iron consumes energy rather than releasing it. When the iron core reaches the Chandrasekhar mass (~1.4 solar masses) without sufficient thermal support, it collapses in milliseconds. The inner core bounces when nuclear densities are reached, sending a shockwave outward. Combined with neutrino energy deposition (the neutrino burst from core collapse carries 99% of the gravitational energy released — about 3 × 10⁴⁶ joules), this powers a spectacular core-collapse supernova, temporarily outshining the entire galaxy. The outer layers are ejected, enriching the interstellar medium with heavy elements — carbon, oxygen, silicon, and all the rest up to iron — seeding the next generation of stars and planets. The remnant is a neutron star or, for the most massive progenitors, a black hole.\n\nType Ia supernovae, by contrast, arise in different systems — binary systems in which a white dwarf accretes mass from a companion until it reaches the Chandrasekhar limit and undergoes thermonuclear runaway. Type Ia supernovae serve as standard candles for cosmology because of their uniform peak luminosity, enabling the measurement of cosmological distances that led to the discovery of the accelerating expansion of the Universe."
  },
  {
    "id": "art-009",
    "slug": "gravitational-waves",
    "category": "astronomy",
    "title": "Gravitational Waves: Ripples in the Fabric of Spacetime",
    "publishedAt": "2024-09-05",
    "readingMinutes": 7,
    "tags": [
      "gravitational waves",
      "LIGO",
      "spacetime",
      "black holes",
      "neutron stars"
    ],
    "summary": "Gravitational waves are distortions in the fabric of spacetime caused by accelerating massive objects. Predicted by Einstein in 1916 and first directly detected in 2015 by LIGO, they have opened an entirely new window on the Universe — allowing us to observe collisions of black holes and neutron stars that would be invisible to any electromagnetic telescope.",
    "body": "In September 2015, a faint signal — lasting less than two seconds in a detector more sensitive than a nuclear weapon's blast — announced one of the greatest discoveries in the history of science. For the first time, human beings had directly detected gravitational waves: ripples in the fabric of spacetime itself, generated by the collision of two black holes more than a billion light-years away. The event, designated GW150914, confirmed a century-old prediction of Einstein's general theory of relativity and opened an entirely new observational window on the cosmos.\n\nGravitational waves are fundamentally different from electromagnetic waves (light, radio, X-rays). They are not oscillations of fields propagating through spacetime; they are oscillations of spacetime itself — distortions in the geometry of the Universe propagating at the speed of light. A passing gravitational wave stretches space in one direction while compressing it in the perpendicular direction, then reverses. The amplitude is quantified by the strain h = ΔL/L — how much a length L changes relative to itself. For the first detection, at LIGO's kilometre-scale interferometers, h was approximately 10⁻²¹: a change in the arm length (4 km) of about 10⁻¹⁸ metres — 1,000 times smaller than a proton. Measuring this required an instrument at the absolute frontier of precision technology.\n\nEinstein predicted gravitational waves in 1916, a year after completing general relativity, but for decades he and others doubted whether they were real physical effects or mathematical artefacts. The question was settled observationally — indirectly — in 1974 by Russell Hulse and Joseph Taylor, who discovered the binary pulsar PSR B1913+16, a pair of neutron stars in a decaying orbit. The rate of orbital decay perfectly matched the energy loss predicted by general relativity due to gravitational wave emission. Hulse and Taylor received the Nobel Prize in 1993. But direct detection had to await technology sophisticated enough to measure strains of 10⁻²³ and smaller.\n\nLIGO (the Laser Interferometer Gravitational-Wave Observatory) operates two L-shaped detectors in the United States — one in Hanford, Washington, and one in Livingston, Louisiana. Each arm is 4 km long. A laser beam is split at the corner of the L and sent down both arms, where it bounces off mirror-polished test masses suspended on complex seismic isolation systems. When the beams return and recombine, interference reveals any difference in arm length. The test masses, 40 kg glass mirrors, hang from multi-stage pendulums and are acoustically and seismically isolated to a remarkable degree; the mirrors themselves are among the flattest and smoothest objects ever made. Quantum noise — from the discrete nature of photons — limits sensitivity at high frequencies, while thermal noise in the mirror coatings limits mid-band sensitivity, and seismic noise limits performance below ~10 Hz.\n\nThe Virgo detector in Italy (3 km arms) and KAGRA in Japan (3 km arms, underground) now operate alongside LIGO, forming a network that greatly improves sky localisation of sources and tests for possible polarisation modes of gravitational waves (general relativity predicts two, some alternative theories predict more).\n\nBy 2024, the LIGO-Virgo-KAGRA network had detected over 90 confirmed events in three observing runs: binary black hole (BBH) mergers (the most common), binary neutron star (BNS) mergers, and black hole-neutron star (BHNS) mergers. Each event encodes rich physics: the masses, spins, and distance of the merging objects; tests of the speed of gravity (shown to equal the speed of light to better than 10⁻¹⁵ relative precision from the multimessenger event GW170817); constraints on the neutron star equation of state from the tidal deformability imprinted on the waveform.\n\nThe multimessenger event GW170817 (a binary neutron star merger in NGC 4993, 40 Mpc away) was a milestone. Detected in gravitational waves by LIGO-Virgo and then confirmed by over 70 telescopes worldwide within two seconds (a gamma-ray burst, a kilonova optical transient, and radio afterglow), it simultaneously confirmed that compact binary mergers are a major site of heavy element synthesis, demonstrated that gravitational waves travel at the speed of light, and provided an independent measurement of the Hubble constant (H₀ ≈ 70 km/s/Mpc, with large uncertainty).\n\nFuture detectors promise still greater reach. The Einstein Telescope — a proposed triangular underground European detector with 10 km arms — aims to detect gravitational waves from the entire observable Universe. The Laser Interferometer Space Antenna (LISA), a planned ESA mission with three spacecraft forming a triangle 2.5 million km on a side, will detect mHz-frequency waves inaccessible from the ground: supermassive black hole mergers, millions of galactic compact binaries, and possibly stochastic backgrounds from the early Universe. Pulsar timing arrays (NANOGrav, PPTA, EPTA, InPTA) are already detecting a stochastic gravitational wave background in the nanohertz band — likely from the in-spiral of millions of supermassive black hole pairs across cosmic history."
  },
  {
    "id": "art-010",
    "slug": "drake-equation-seti",
    "category": "astrobiology",
    "title": "The Drake Equation and the Search for Extraterrestrial Intelligence",
    "publishedAt": "2024-10-18",
    "readingMinutes": 8,
    "tags": [
      "SETI",
      "Drake equation",
      "Fermi paradox",
      "alien life",
      "astrobiology"
    ],
    "summary": "Frank Drake devised his famous equation in 1961 to structure scientific thinking about the number of communicating civilisations in the Milky Way. Six decades on, we have better values for some terms but are no closer to contact — raising the deepest questions about life, intelligence, and the cosmic silence.",
    "body": "In November 1961, Frank Drake gathered a small group of scientists — including Carl Sagan, John Lilly, Melvin Calvin, and others — at the Green Bank Observatory in West Virginia for the first scientific meeting devoted to the search for extraterrestrial intelligence. To structure the discussion, Drake wrote an equation on the blackboard that would become one of the most famous formulas in science: N = R* × fₚ × nₑ × fl × fi × fc × L.\n\nEach term in the Drake Equation represents a factor influencing the number N of technologically communicating civilisations in the Milky Way at any given time: R* is the rate of star formation; fₚ is the fraction of stars with planets; nₑ is the average number of planets per star that could potentially support life; fl is the fraction of those planets where life actually develops; fi is the fraction of life-bearing planets where intelligence evolves; fc is the fraction of intelligent species that develop technology detectable across interstellar space; and L is the average lifetime of such a civilisation.\n\nIn 1961, most of these terms were pure guesswork. Six decades of astronomy have transformed our understanding of the early terms while leaving the later ones no less mysterious. R* is now well-constrained at about 1–3 solar-mass-equivalent stars per year in the Milky Way. fₚ, once controversial, is now known to be close to 1 — most stars have planetary systems. The Kepler mission revealed that the galaxy contains roughly one planet per star on average, with smaller planets (super-Earths and mini-Neptunes) being most common. The nₑ term — potentially habitable planets — is estimated at about 0.1–0.4 per star in the traditionally defined habitable zone, though the definition of habitability is itself contested.\n\nBeyond nₑ, uncertainty explodes. fl — the fraction of habitable planets where life originates — could be anywhere from nearly 1 (if life is an inevitable consequence of chemistry given sufficient time) to vanishingly small (if life's origin required such improbable steps that it may have happened only once in the Universe). Laboratory experiments on prebiotic chemistry, including the Miller-Urey experiment of 1953, have shown that amino acids, nucleotides, and other biological precursors form readily under plausible early-Earth conditions. The RNA world hypothesis proposes that RNA molecules capable of both self-replication and catalysis preceded DNA and proteins. The rapid appearance of life on Earth — within 500 million years of the planet's formation — might suggest that life starts quickly once conditions are right, favouring a high fl. But we have only one data point.\n\nThe fi term — the fraction of life-bearing planets that develop intelligence — is equally uncertain. On Earth, intelligence arose after roughly 3.5 billion years of evolution, suggesting it may not be inevitable but rather the result of a long series of contingent evolutionary events. Stephen Jay Gould famously argued that rewinding the tape of life and replaying it would almost certainly produce different outcomes; intelligence is not the inevitable endpoint of evolution. Even if single-celled life is common, multicellular complex life and intelligence may be rare.\n\nfc — the fraction that develop radio (or other long-range) communication technology — is interesting because it conflates two very different things: whether intelligence leads to technology, and whether technology leads to electromagnetic communication specifically. An intelligent species that never develops electronics would not be detectable by SETI. Alternatively, advanced civilisations might quickly move to communication methods we have not yet conceived of.\n\nThe most uncertain term is L — the average lifetime of a communicating civilisation. Drake's own estimate, made in a period of Cold War anxiety, was 1,000 years. If L is typically a few thousand years (civilisations tend to destroy themselves), then N might be very small even if life is common. If technological civilisations typically survive millions of years, N could be millions.\n\nThe most immediate empirical challenge is the Fermi Paradox — Enrico Fermi's famous 1950 lunch table question: 'Where is everybody?' Even if communicating civilisations are rare, a sufficiently long-lived and expansionary civilisation could colonise the galaxy in roughly 10–100 million years given sub-light-speed travel. The fact that no such colonisation is evident — no Dyson spheres, megastructures, or obvious engineered signals — is puzzling if civilisations are common and long-lived.\n\nSolutions to the Fermi Paradox proliferate: the Great Filter (a common, nearly-insurmountable barrier in the development chain — perhaps behind us, in the origin of life, or ahead of us, in the long-term survival of civilisations); civilisations exist but choose not to communicate; civilisations use communication methods we have not yet invented; the Universe is so large that even many civilisations could all be beyond our detection range; or, most soberly, we are genuinely alone in the observable Universe.\n\nThe search for life has expanded beyond SETI's radio surveys. Astrobiology now investigates potentially habitable environments in our own Solar System — Mars, Europa, Enceladus, Titan — and biosignature gases in exoplanet atmospheres. The discovery of life anywhere in our Solar System would be transformative science, regardless of intelligence: a second genesis would suggest that life is common throughout the cosmos. As the JWST begins to characterise exoplanet atmospheres and future missions prospect Mars and the icy moons, the Drake Equation's zeroes or non-zeroes will gradually come into focus."
  }
];



CosmosBootstrap.register('article-data', () => {
  CosmosEvents.emit('cosmos:articles-loaded', { articles: COSMOS_ARTICLES });
  const _articleCount = COSMOS_ARTICLES.length;
  CosmosAnnouncer.announce(`${_articleCount} ${_articleCount === 1 ? 'article' : 'articles'} loaded`);

  const bodySlug = document.body.dataset.articleSlug;
  if (bodySlug) {
    const article = COSMOS_ARTICLES.find(a => a.slug === bodySlug);
    if (article) {
      CosmosState.set('currentArticle', article);
      CosmosEvents.emit('cosmos:article-opened', { article });
    }
  }

  const featuredContainer = document.querySelector('[data-featured-articles]');
  if (featuredContainer) {
    const featured = COSMOS_ARTICLES.slice(0, CosmosConfig.content.articlesPerPage);
    const focusedInside = featuredContainer.contains(document.activeElement) ? document.activeElement : null;
    featuredContainer.innerHTML = featured.map(a => `
      <article class="article-card" aria-label="${StringUtils.escape(a.title)}">
        <div class="article-card-meta">
          <span class="article-cat">${StringUtils.escape(a.category)}</span>
          <span class="article-time">${a.readingMinutes} min read</span>
        </div>
        <h3 class="article-title"><a href="/articles/${StringUtils.escape(a.slug)}">${StringUtils.escape(a.title)}</a></h3>
        <p class="article-summary">${StringUtils.escape(a.summary)}</p>
        <ul class="article-tags" role="list" aria-label="Tags">
          ${(a.tags || []).slice(0, 4).map(t => `<li class="tag" role="listitem">${StringUtils.escape(t)}</li>`).join('')}
        </ul>
      </article>`).join('');
    if (focusedInside) {
      const firstArticleLink = featuredContainer.querySelector('.article-title a');
      if (firstArticleLink) firstArticleLink.focus();
      else {
        const firstArticle = featuredContainer.querySelector('article');
        if (firstArticle) {
          firstArticle.setAttribute('tabindex', '-1');
          firstArticle.focus();
          firstArticle.addEventListener('blur', () => firstArticle.removeAttribute('tabindex'), { once: true });
        }
      }
    }
    CosmosAnnouncer.announce(`${featured.length} featured ${featured.length === 1 ? 'article' : 'articles'} loaded`);
  }

  CosmosLogger.info(`Article data loaded: ${COSMOS_ARTICLES.length} articles`);
}, { critical: false, priority: 80 });



if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CosmosConfig, CosmosState, CosmosEvents, CosmosLogger, CosmosBootstrap,
    CosmosTheme, CosmosReadingPrefs, CosmosAnnouncer,
    CosmosNav, CosmosReader, CosmosSearch,
    CosmosSolarViz, CosmosTimeline, CosmosQuiz,
    CosmosBookmarks, CosmosHistory,
    CosmosGallery, CosmosAnimations,
    CosmosComments, CosmosNewsletter, CosmosNotify,
    COSMOS_ARTICLES,
  };
}


const COSMOS_ARTICLES_EXTENDED = [
  {
    "id": "art-011",
    "slug": "mars-exploration",
    "category": "planetary-science",
    "title": "Mars Exploration: The Quest for the Red Planet",
    "publishedAt": "2024-11-02",
    "readingMinutes": 10,
    "tags": [
      "Mars",
      "rovers",
      "Perseverance",
      "Curiosity",
      "terraforming",
      "water ice"
    ],
    "summary": "Mars is the most explored planet beyond Earth, the target of over 50 missions since the 1960s. Recent discoveries of ancient river valleys, seasonal methane variations, and subsurface water ice have intensified speculation about ancient or even extant microbial life.",
    "body": "Mars has captivated scientists and the public alike for over a century. Its ruddy hue visible to the naked eye, its evident polar ice caps, its 24-hour 37-minute day, and its axis tilted at 25.2° — almost identical to Earth's 23.5° — made it appear a sibling to our own world. The 19th century astronomer Giovanni Schiaparelli mapped straight features he called canali (channels), a word mistranslated into English as 'canals.' Percival Lowell built a dedicated observatory in Flagstaff, Arizona, and spent decades convinced he could see a network of canals irrigating a dying desert world, built by an intelligent civilisation. The illusion persisted until the first close-up images from Mariner 4 in 1965 revealed a cratered, Moon-like surface and an atmosphere too thin to support advanced life.\n\nLiquid water is the primary focus for Mars habitability. A mountain of evidence now shows Mars had abundant liquid water in its ancient past. The presence of valleys, delta fans, layered sediments, and mineralogical signatures of aqueous chemistry — clays, sulphates, carbonates — tells of a planet where rivers flowed and lakes persisted billions of years ago. The geological era known as the Noachian (4.1–3.7 Ga) appears to have been the wettest period; Mars then transitioned through the Hesperian to the dry, frigid Amazonian period that continues today. What extinguished the water? Mars lacks a global magnetic field (it was lost about 4 billion years ago when the dynamo in its iron core shut down), and without this shield, the solar wind stripped away the atmosphere. Without a thick atmosphere, liquid water cannot be stable on the surface.\n\nToday, water exists in several forms. The polar ice caps are layers of water ice and carbon dioxide ice; the residual north polar cap is predominantly water ice, estimated at several million cubic kilometres — enough to cover Mars in a 35 m deep ocean if spread evenly. Radar soundings by MARSIS aboard Mars Express have detected signatures consistent with a subglacial hypersaline liquid water layer beneath the south polar ice, a finding that remains contentious but excites astrobiologists. Permafrost is widespread in the mid- and high latitudes, and transient briny water may cause the dark streaks (recurring slope lineae, or RSL) observed on steep slopes — though this interpretation is debated.\n\nThe history of Mars missions divides roughly into flybys (Mariner 4, 6, 7), orbiters (Mariner 9, Viking 1 and 2 orbiters, Mars Global Surveyor, Odyssey, Mars Reconnaissance Orbiter, MAVEN), landers (Viking 1 and 2 — the first in 1976), and rovers. The Mars Pathfinder mission in 1997 delivered the Sojourner rover, the first wheeled vehicle to operate on another planet. In 2004, Spirit and Opportunity landed in two locations and both confirmed ancient water activity. Opportunity set a planetary distance record of 45.16 km before losing contact in 2018 during a global dust storm. Curiosity, which landed in Gale Crater in 2012 and continues operating, found ancient lake sediments and organic molecules — the building blocks of life but not proof of it.\n\nPerseverance, NASA's most sophisticated Mars rover, landed in Jezero Crater in February 2021. Jezero was selected because it is an ancient lake delta — exactly the kind of environment where microbial biosignatures might be preserved in sedimentary rock. Perseverance carries the MOXIE instrument, which has demonstrated in-situ production of oxygen from Martian CO2 — a proof of concept for future life support and rocket propellant generation. It also delivered the Ingenuity helicopter, which made 72 flights before a rotor blade broke in January 2024, far exceeding its planned five-flight demonstration. Perseverance has collected dozens of rock core samples that are being cached for eventual return to Earth on a Mars Sample Return mission, currently planned for the early 2030s.\n\nThe 2020 launch window also saw China's Tianwen-1 mission, which successfully deployed the Zhurong rover on Utopia Planitia in May 2021. Zhurong operated for nearly one Martian year, mapping the surface and subsurface. The UAE's Hope orbiter arrived in Mars orbit simultaneously, making the February 2021 arrival of three spacecraft from three countries a historic moment in international space exploration.\n\nLooming largest in the imagination of space exploration advocates is human travel to Mars. SpaceX's Starship — a fully reusable super-heavy lift launch vehicle under development — is explicitly designed for this purpose. Elon Musk has spoken of establishing a self-sustaining city of a million people on Mars. NASA's Artemis programme, which is returning humans to the Moon as a proving ground, envisions a Mars mission in the 2030s or 2040s. The challenges are formidable: the round-trip journey takes roughly 21 months for an optimal launch window, exposing crew to cosmic radiation that substantially raises cancer risk. Mars's surface gravity (0.38 g) and thin atmosphere (0.6% of Earth's pressure) impose physical challenges. Growing food, generating power, and constructing habitats all demand technologies beyond current capability. Whether humans will set foot on Mars in this century is uncertain; what is not in doubt is that Mars remains humanity's most tantalising extraterrestrial destination."
  },
  {
    "id": "art-012",
    "slug": "international-space-station",
    "category": "human-spaceflight",
    "title": "The International Space Station: Humanity's Orbital Home",
    "publishedAt": "2024-12-01",
    "readingMinutes": 8,
    "tags": [
      "ISS",
      "space station",
      "microgravity",
      "astronaut",
      "NASA",
      "Roscosmos"
    ],
    "summary": "The International Space Station is the largest structure ever assembled in space, a collaboration between 15 nations that has been continuously inhabited since November 2000. It is a research laboratory, engineering marvel, and symbol of what international cooperation can achieve — despite political tensions on the ground.",
    "body": "The International Space Station (ISS) is the most complex engineering structure ever assembled in orbit, a permanent research platform that has circled Earth at roughly 400 km altitude — completing 16 orbits per day — continuously since the first crew arrived on 2 November 2000. As of 2025, it has hosted over 270 visitors from 20 countries on more than 60 expeditions, and has been the site of over 3,000 scientific experiments.\n\nThe station is a product of the post-Cold War era of international cooperation in space. NASA had planned the Space Station Freedom in the 1980s, but cost overruns and cancelled designs were transformed in 1993 when President Clinton invited Russia to join the programme. Russia brought the engineering heritage of the Mir space station, flight experience in long-duration spaceflight, and the Soyuz spacecraft — which became the ISS's primary crew vehicle for nearly two decades. Fifteen space agencies from 15 nations (USA, Russia, Japan, ESA member states, Canada) collaborate on the station. Canada's contribution is the Canadarm2, a 17-metre robotic arm essential for assembly, maintenance, and berthing visiting spacecraft.\n\nAssembly began with the launch of the Russian Zarya module (Functional Cargo Block) on 20 November 1998. The American Unity node followed two weeks later, connecting via Space Shuttle Endeavour's first ISS mission. Over the next 13 years, more than 40 assembly flights — including 37 Space Shuttle missions — and numerous Soyuz and Progress flights built the station piece by piece. The station was declared complete in 2011 with the retirement of the Space Shuttle, though smaller modules continue to be added. The Russian Nauka multifunctional laboratory module finally docked in 2021, causing a brief attitude disturbance when its thrusters unexpectedly fired.\n\nThe ISS spans 109 metres (larger than an American football field) and contains 932 cubic metres of habitable volume across multiple pressurised modules, including the US Orbital Segment (Unity, Destiny laboratory, Harmony, Tranquility, Serenity cupola, Bigelow Expandable Activity Module) and the Russian Orbital Segment (Zarya, Zvezda, Poisk, Rassvet, MRM sections, Nauka, Prichal). The solar arrays generate up to 120 kW of electrical power. The Environmental Control and Life Support System (ECLSS) regenerates oxygen via electrolysis of water, captures carbon dioxide, and recycles close to 90% of crew water from humidity condensate and even urine.\n\nResearch aboard the ISS spans an enormous range of disciplines. In biology and medicine, the microgravity environment (more precisely, freefall — astronauts are in continuous free fall around Earth) is a unique laboratory for studying the effects of weightlessness on the human body: bone density loss (1–2% per month without countermeasures), muscle atrophy, fluid shifts toward the head, vision changes from intracranial pressure (a condition called Spaceflight-Associated Neuro-ocular Syndrome), and immune function changes. Understanding these processes is essential for long-duration human spaceflight to Mars and has spinoffs for treating age-related conditions on Earth. In physics, fluid dynamics experiments without convection-dominated interactions reveal phenomena invisible on Earth. Protein crystal growth in microgravity produces larger, more perfect crystals used in drug development. Earth observation from orbit provides data on climate, disasters, and agriculture.\n\nThe ISS has also served as a proving ground for life support, robotics, and construction techniques needed for future deep-space missions. The Alpha Magnetic Spectrometer (AMS-02), attached to the station's truss, is a particle physics detector searching for dark matter and antimatter in cosmic rays — an experiment that would be impossible on the ground.\n\nThe ISS faces a finite operational lifetime. NASA plans to deorbit the station around 2030, and has contracted Axiom Space and others to develop commercial successors — initially as attached modules, then as free-flying commercial stations. Russia has discussed building its own national station, ROSS, after the ISS is deorbited. China has built and is operating its own station, the Tiangong Space Station, which achieved continuous habitation in 2022 with a 90-cubic-metre core module and two science modules.\n\nThe ISS's legacy extends beyond science. In the depths of Cold War rivalry's aftermath, Americans and Russians learned to work together daily in a life-or-death environment 400 km above their geopolitical differences. That legacy of cooperation, maintained even through periods of severe political tension, remains one of the ISS's most significant achievements."
  },
  {
    "id": "art-013",
    "slug": "solar-wind-space-weather",
    "category": "solar-science",
    "title": "The Solar Wind and Space Weather: The Sun's Constant Breath",
    "publishedAt": "2025-01-07",
    "readingMinutes": 7,
    "tags": [
      "solar wind",
      "space weather",
      "CME",
      "aurora",
      "magnetosphere",
      "Carrington event"
    ],
    "summary": "The Sun continuously streams charged particles into space — the solar wind — shaping a vast magnetic bubble around our Solar System. Violent eruptions can disrupt satellites, power grids, and communications on Earth, making space weather a serious concern for modern technological society.",
    "body": "The Sun is not a passive, benign star. It is a dynamic, magnetically active plasma ball that continuously exhales a stream of charged particles — the solar wind — and, without warning, hurls vast clouds of magnetised plasma into space at millions of kilometres per hour. This is space weather, and understanding it is increasingly critical as our civilisation becomes ever more dependent on the technologies it can disrupt.\n\nThe solar wind was first predicted by Eugene Parker in 1958 — a proposal met with initial scepticism — and confirmed by the Mariner 2 spacecraft in 1962. It consists primarily of protons and electrons, with a small fraction of helium nuclei, streaming outward from the Sun's corona at speeds ranging from about 300 km/s (slow wind) to over 800 km/s (fast wind). The corona — the Sun's outer atmosphere, visible as a pearly halo during solar eclipses — has a temperature of 1–3 million Kelvin, compared to the 5,778 K surface (photosphere), an observation that remains an active research problem: why is the corona so much hotter than the surface?\n\nAs the solar wind flows outward, it carries the Sun's magnetic field with it, stretching it into a structure called the interplanetary magnetic field (IMF). The IMF spirals outward due to the Sun's rotation — a 27-day period at the equator — creating the Parker spiral. When the solar wind reaches Earth, it encounters our planet's magnetosphere: a region of space dominated by Earth's magnetic field, which is generated by convection in the liquid iron outer core. The magnetosphere deflects most of the solar wind around Earth, compressing it on the sunlit side and stretching it into a long tail on the night side (the magnetotail). Without this shield, the solar wind would gradually strip away Earth's atmosphere — as appears to have happened to Mars.\n\nThe Sun's activity follows an approximately 11-year sunspot cycle. At solar maximum, the Sun's magnetic field is complex and tangled, producing more sunspots (dark, cooler regions where strong magnetic fields suppress convection), solar flares, and coronal mass ejections (CMEs). A CME is the explosive release of a billion tonnes of magnetised plasma from the corona, accelerated to speeds of 1,000–3,000 km/s. When a CME reaches Earth's magnetosphere 1–3 days later, it can compress the magnetosphere, drive strong electric currents in the ionosphere, and trigger geomagnetic storms.\n\nGeomagnetic storms produce the spectacular auroras — the Aurora Borealis (Northern Lights) and Aurora Australis — as energetic particles rain down the magnetic field lines into the polar upper atmosphere, exciting nitrogen and oxygen to luminescence. But storms also have serious technological consequences. Induced currents in long conductors (power lines, pipelines, telegraph cables) can be large enough to damage or destroy transformers and other infrastructure. In March 1989, a severe geomagnetic storm knocked out the entire Québec power grid for nine hours, leaving six million people without power. The 1859 Carrington Event — the most powerful geomagnetic storm in recorded history, named after amateur astronomer Richard Carrington who observed the associated solar flare — induced currents so strong that telegraph operators reported being shocked by their equipment, and auroras were visible as far south as Cuba. A Carrington-scale event today could cause trillions of dollars in damage to power grids, satellites, and communication networks worldwide — a scenario that space weather agencies actively monitor and prepare for.\n\nSatellites in low Earth orbit are affected by enhanced atmospheric drag during geomagnetic storms (the upper atmosphere expands when heated by solar activity) and by radiation-induced electronics failures. GPS timing accuracy degrades as the ionosphere becomes irregular. High-frequency radio communications used by aviation can be disrupted for hours. Solar energetic particles (SEPs) — protons and heavier ions accelerated by CMEs and solar flares to near-relativistic energies — pose a radiation hazard to astronauts and to the electronics of interplanetary spacecraft.\n\nMonitoring space weather is now a serious operational priority. NOAA's Space Weather Prediction Center and the UK Met Office's Space Weather Operations Centre issue alerts and forecasts. The Solar and Heliospheric Observatory (SOHO), the Solar Dynamics Observatory (SDO), and the Parker Solar Probe — which has flown closer to the Sun than any previous spacecraft, diving through the corona — continuously observe the Sun. STEREO provided stereoscopic views to better determine CME trajectories. The goal of space weather forecasting — to provide hours or days of warning before a major event — is advancing but remains challenging because the orientation of the magnetic field embedded within a CME (which determines whether it will efficiently couple energy into Earth's magnetosphere) cannot be reliably predicted until the CME passes a monitoring satellite at L1, just an hour before it reaches Earth."
  },
  {
    "id": "art-014",
    "slug": "kuiper-belt-outer-solar-system",
    "category": "planetary-science",
    "title": "The Kuiper Belt and Beyond: The Solar System's Frozen Edge",
    "publishedAt": "2025-02-14",
    "readingMinutes": 8,
    "tags": [
      "Kuiper Belt",
      "Pluto",
      "Eris",
      "New Horizons",
      "Oort cloud",
      "trans-Neptunian objects"
    ],
    "summary": "Beyond Neptune lies a disc of icy bodies called the Kuiper Belt, home to Pluto and thousands of smaller worlds. Further still, the hypothetical Oort Cloud may contain trillions of comets. Exploring this remote frontier reveals how the Solar System formed and has evolved over 4.5 billion years.",
    "body": "The Solar System does not end at Neptune. Beyond the orbit of the eighth planet — at distances where sunlight is so faint that a noonday sky would be no brighter than a cloudy winter day on Earth — stretches a vast realm of icy bodies that records the formation and dynamical history of our planetary system.\n\nThe Kuiper Belt extends roughly from 30 to 50 AU (astronomical units, where 1 AU = Earth-Sun distance) and is the disc-shaped reservoir of short-period comets and trans-Neptunian objects (TNOs). It was theorised independently by Kenneth Edgeworth (1943) and Gerard Kuiper (1951) and first observationally confirmed with the discovery of 1992 QB1 (now Arrokoth, somewhat confusingly renamed) — no, that is a different object. The first confirmed Kuiper Belt Object (KBO) beyond Pluto was 1992 QB1, found by David Jewitt and Jane Luu using the University of Hawaii 2.24-metre telescope. Since then, thousands of KBOs have been catalogued.\n\nPluto, discovered by Clyde Tombaugh in 1930, reigned as the ninth planet for 76 years until the discovery of Eris in 2005 — a body 27% more massive than Pluto — by Mike Brown, Chad Trujillo, and David Rabinowitz. This discovery precipitated the International Astronomical Union's controversial 2006 definition of 'planet,' which excluded Pluto (and Eris) by requiring that a planet clear its orbital neighbourhood of other bodies. Both Pluto and Eris were reclassified as 'dwarf planets.' The Solar System's dwarf planet roster also includes Ceres (in the asteroid belt), Makemake, and Haumea.\n\nNASA's New Horizons spacecraft became the first to visit Pluto, flying past on 14 July 2015 at 49,600 km/h. The encounter revealed an astonishingly diverse world. Tombaugh Regio, nicknamed the 'heart,' is a 1,600 km wide nitrogen ice plain so geologically young that it likely resurfaced within the last 10 million years — making Pluto geologically active despite being a tiny body billions of kilometres from the Sun. The mechanism may be convective overturning of nitrogen ice driven by residual internal heat or tidal heating from Charon, Pluto's enormous moon. Water-ice mountains 3,500 m high tower over the plains. Haze layers in Pluto's thin nitrogen atmosphere extend 1,600 km above the surface. The surface is painted in subtle reddish tholins — complex organic compounds formed by cosmic ray and UV processing of nitrogen and methane.\n\nAfter its Pluto flyby, New Horizons continued into the Kuiper Belt, conducting a flyby of Arrokoth (formally 2014 MU69) on 1 January 2019. Arrokoth turned out to be a 'contact binary' — two lobes of a snowman-shaped object that formed through the gentle coalescence of two smaller bodies in the early Solar System. Its pristine, undisturbed surface makes it the most primitive Solar System object ever studied up close.\n\nBeyond the main Kuiper Belt, from ~50 to ~100 AU, the scattered disc contains TNOs whose orbits have been perturbed by Neptune into highly eccentric trajectories. Sedna, discovered in 2003, orbits between 76 and 975 AU and is too distant to have been scattered by Neptune — suggesting it was displaced by a close encounter with another star during the early Solar System, or by a hypothetical Planet Nine orbiting hundreds of AU from the Sun. The existence of Planet Nine — proposed by Konstantin Batygin and Mike Brown in 2016 to explain the unusual clustering of orbit orientations among a family of extreme TNOs — remains unconfirmed. The Vera Rubin Observatory's Legacy Survey of Space and Time (LSST), beginning in 2025, may detect Planet Nine or definitively rule it out.\n\nFar beyond the scattered disc, theorists postulate the Oort Cloud: a vast spherical shell of icy bodies extending from roughly 2,000 to 200,000 AU (nearly halfway to the nearest star), containing perhaps trillions of comet nuclei. No Oort Cloud object has ever been directly detected, but the cloud's existence is inferred from the orbital properties of long-period comets — these arrive from all directions of the sky on highly elliptical, nearly parabolic orbits, consistent with gravitational nudges from passing stars, giant molecular clouds, and galactic tidal forces dislodging them from a vast spherical reservoir.\n\nStudying the outer Solar System probes the Solar System's origin and early dynamics. The Nice model and subsequent Grand Tack and Breaking the Symmetry models propose that the giant planets migrated significantly in the first few hundred million years — a dynamical reshuffling that explains the Late Heavy Bombardment, the structure of the Kuiper Belt, and the capture of irregular satellites."
  },
  {
    "id": "art-015",
    "slug": "europa-ocean-worlds",
    "category": "astrobiology",
    "title": "Europa and Ocean Worlds: Hunting for Life Under the Ice",
    "publishedAt": "2025-03-09",
    "readingMinutes": 8,
    "tags": [
      "Europa",
      "Enceladus",
      "subsurface ocean",
      "astrobiology",
      "tidal heating",
      "life"
    ],
    "summary": "Several moons in the outer Solar System — Europa, Enceladus, Ganymede, and others — harbour vast liquid water oceans beneath their icy surfaces, heated by tidal forces rather than solar energy. They are our most immediate targets in the search for extraterrestrial life.",
    "body": "The search for life in our Solar System has expanded far beyond the rocky inner planets. We now have strong evidence that several moons of the gas giants harbour vast liquid water oceans beneath their icy surfaces, heated not by sunlight — there is precious little of that at 5–10 AU from the Sun — but by tidal flexing driven by the gravitational pull of their host planet and sibling moons. These 'ocean worlds' may be the most promising environments for extraterrestrial life in the Solar System.\n\nEuropa, Jupiter's fourth-largest moon, is perhaps the best-studied ocean world. Its icy surface is strikingly smooth on geological timescales — dotted with criss-crossing ridges, bands, and chaotic terrain, but essentially lacking the large impact craters that would be expected on an old, geologically dead surface. This surface youth (estimated at 40–90 million years) implies continuous tectonic resurfacing driven by a warm interior. The Galileo spacecraft (1995–2003) provided compelling evidence for a subcrustal ocean: magnetic field measurements showed Jupiter's magnetic field inducing electric currents in a conducting layer beneath Europa's surface, consistent with a global saltwater ocean. The ocean is estimated at 100–160 km deep — more than twice Earth's entire ocean volume — and is thought to be in direct contact with the rocky silicate seafloor, enabling water-rock chemical reactions.\n\nTidal heating is the energy source. As Europa orbits Jupiter in a 2:1 resonance with Io and a 4:1 resonance with Ganymede, the gravitational tugs constantly flex the moon, generating frictional heat in its interior. Io, in a closer and stronger resonance, is the most volcanically active body in the Solar System — a vivid demonstration of tidal heating's power. Europa's tidal deformation is lower but still sufficient to maintain a liquid ocean.\n\nHubble Space Telescope observations in 2012 and subsequent years found evidence of water vapour plumes erupting from Europa's southern hemisphere, though these detections remain uncertain. If confirmed, plumes would allow the JWST and in-situ missions to sample ocean material without drilling through kilometres of ice. NASA's Europa Clipper mission, launched in October 2024, will conduct 50 flybys of Europa during its 4-year orbital tour around Jupiter, with instruments to characterise the ice shell thickness, ocean salinity, and surface composition. ESA's JUICE (Jupiter Icy Moons Explorer), launched in April 2023, will orbit Ganymede (another potential ocean world) and conduct flybys of Europa and Callisto.\n\nEnceladus, a tiny moon of Saturn just 504 km across, became the undisputed champion of astrobiological interest after the Cassini spacecraft flew through its plumes in 2005 and discovered active geysers erupting from the south polar region. Tiger stripe fractures at the south pole vent near-supersonic jets of water ice and vapour, organic molecules, hydrogen gas (H2), silica nanoparticles, and dissolved salts directly into space. The presence of H2 — produced by hydrothermal reactions between water and silicate rock at the seafloor — is a particularly tantalising indicator because on Earth, similar hydrothermal systems at mid-ocean ridges support rich ecosystems of chemolithotrophic microbes without any sunlight. Cassini sampled the plume material directly multiple times; its last Grand Finale orbit in 2017 was designed to pass particularly close to the plumes. Enceladus has everything terrestrial life needs: liquid water, chemical energy (from hydrothermal vents), organic chemistry, and the key elements C, H, N, O, P, S.\n\nGanymede — the largest moon in the Solar System, larger than Mercury — also has an internal ocean, detected via Hubble's observation of its auroral oscillations in response to Jupiter's rotating magnetic field. Titan, Saturn's largest moon, has an extraordinary methane-based weather cycle with methane lakes, rivers, and methane rain at -179°C. Its thick nitrogen atmosphere, rich in complex organics, is a laboratory for prebiotic chemistry. Titan is also thought to have a subsurface water-ammonia ocean. NASA's Dragonfly mission, a rotorcraft lander due to launch in 2028 and arrive at Titan in 2034, will explore its surface and atmospheric chemistry.\n\nThe ocean worlds represent a paradigm shift in astrobiology: life may not require a star's warmth, just liquid water and chemical energy. This has expanded the concept of the 'habitable zone' from the stellar habitable zone to the concept of 'habitability from within' — tidal and radiogenic heating enabling oceans far from any star. The implications for the prevalence of life in the galaxy are profound: with potentially billions of tidally heated ocean worlds around gas giants in planetary systems across the Milky Way, water-based life could be widespread in forms we have barely begun to imagine."
  },
  {
    "id": "art-016",
    "slug": "cosmic-rays",
    "category": "astronomy",
    "title": "Cosmic Rays: Messengers from the Violent Universe",
    "publishedAt": "2025-04-04",
    "readingMinutes": 7,
    "tags": [
      "cosmic rays",
      "particle physics",
      "supernovae",
      "active galactic nuclei",
      "Pierre Auger"
    ],
    "summary": "Cosmic rays are high-energy particles — mostly protons and atomic nuclei — that continuously rain down on Earth from all directions in space. They reach energies a million trillion times beyond what any human accelerator can produce, carrying information about the most violent processes in the Universe.",
    "body": "Every second, roughly 10,000 electrically charged particles from space pass through every square metre of Earth's upper atmosphere. These cosmic rays — mostly protons and atomic nuclei, with a small fraction of electrons and antiparticles — span an enormous energy range, from millions of electronvolts (MeV) to the astounding 'Oh-My-God particle' detected on 15 October 1991, which carried an energy of 3 × 10²⁰ eV — roughly the kinetic energy of a well-thrown baseball concentrated into a single subatomic particle. Understanding cosmic rays requires both particle physics and astrophysics, and their study has driven discoveries ranging from the positron to the muon.\n\nVictor Hess discovered cosmic rays in 1912 during a series of balloon flights that showed ionisation in the atmosphere increasing with altitude — opposite to what would be expected if the sources were radioactive minerals in the ground. Hess flew at night and during a solar eclipse, ruling out the Sun as the source, and received the Nobel Prize in 1936.\n\nCosmic rays interact with molecules in Earth's upper atmosphere to create cascades of secondary particles — air showers — that fan out across the sky and can be detected at ground level by particle detectors. At low energies (below ~10¹⁵ eV, the 'knee' of the energy spectrum), cosmic rays are thought to originate within our own galaxy, accelerated by the shock waves of supernova remnants. The diffuse shell of gas ejected by a supernova expands supersonically into the interstellar medium; charged particles can be repeatedly scattered back and forth across the shock front (Fermi acceleration), gaining energy with each crossing until they escape into the galaxy. Young supernova remnants like Cas A and Tycho are observed to emit high-energy gamma rays (produced when protons accelerated in the remnant collide with interstellar gas), providing indirect evidence for cosmic ray acceleration.\n\nAt the 'ankle' of the spectrum (~10¹⁸ eV), the composition and sources are thought to change, with ultrahigh-energy cosmic rays (UHECRs) likely arriving from extragalactic sources — active galactic nuclei, gamma-ray bursts, or exotic astrophysical processes. Above ~5 × 10¹⁹ eV, UHECRs are predicted to lose energy rapidly through the GZK process (named after Greisen, Zatsepin, and Kuzmin): protons interacting with photons from the cosmic microwave background to produce pions, limiting the distance from which they can reach us to roughly 150 Mpc. This means the most energetic cosmic rays must originate in our cosmic neighbourhood — but identifying their sources is frustrated by magnetic deflections during their journey.\n\nThe Pierre Auger Observatory in Argentina, covering 3,000 km² of the Pampa Amarilla, is the largest cosmic ray detector ever built. Each ground-level detector — 1,600 water Cherenkov tanks spaced 1.5 km apart — detects the secondary particles from cosmic ray air showers, while 27 fluorescence telescopes watch the atmosphere for the faint glow of nitrogen fluorescence caused by the shower. Auger has measured the spectrum, composition, and arrival directions of UHECRs with unprecedented precision, finding a Greisen-Zatsepin-Kuzmin cutoff consistent with theoretical predictions and a mild clustering of the highest-energy events towards active galactic nuclei in the local Universe.\n\nCosmic rays have practical consequences. At aviation altitudes (10–12 km), radiation exposure from cosmic rays is substantially higher than at sea level; frequent flyers and especially aircrew accumulate non-negligible radiation doses. Astronauts on long-duration missions (such as a journey to Mars) would receive doses significant enough to raise cancer risk, particularly from galactic cosmic rays (GCRs) — heavy iron nuclei accelerated to relativistic speeds — which are very difficult to shield against. On timescales of thousands of years, cosmic ray flux variations correlate with climate changes recorded in ice cores and ancient tree rings through the production of cosmogenic isotopes like carbon-14 and beryllium-10.\n\nCosmic rays also drove progress in particle physics: the positron was discovered in 1932 by Carl Anderson in cosmic ray cloud chamber tracks; the muon was found in 1936; the pion in 1947; and charged kaons shortly thereafter — all before particle accelerators could create them artificially. Today, cosmic ray experiments and accelerator experiments are complementary frontiers in high-energy physics, each reaching parts of the parameter space the other cannot touch."
  },
  {
    "id": "art-017",
    "slug": "moon-earth-satellite",
    "category": "planetary-science",
    "title": "The Moon: Earth's Ancient Companion",
    "publishedAt": "2025-05-01",
    "readingMinutes": 9,
    "tags": [
      "Moon",
      "Luna",
      "Apollo",
      "lunar geology",
      "tides",
      "giant impact hypothesis"
    ],
    "summary": "The Moon is Earth's only natural satellite, five times the size of Pluto and large enough to raise kilometres-high ocean tides. Its formation in a catastrophic impact 4.5 billion years ago, its role in stabilising Earth's axial tilt, and its ancient geological record make it a unique window into the early Solar System.",
    "body": "The Moon is the most familiar astronomical object — and the only celestial body beyond Earth ever visited by humans. At 384,400 km (on average), it is simultaneously close enough to see geological features through a small telescope and far enough away that the 12 Apollo astronauts who walked on its surface between 1969 and 1972 remain the only humans to have set foot on another world.\n\nThe Moon formed approximately 4.5 billion years ago from the debris of a colossal collision between the proto-Earth and a hypothetical Mars-sized planet called Theia — the giant impact hypothesis, proposed by William Hartmann and Donald Davis in 1975. The impact was near-oblique, vaporising much of Theia's mantle and the Earth's upper mantle into a disc of molten rock around Earth. Within decades to centuries, this disc coalesced into the Moon. Evidence for this origin includes the Moon's density (similar to Earth's mantle rather than its iron-rich core), the near-identical oxygen isotope ratios of Earth and lunar rocks, the Moon's relative dearth of volatile elements (iron, water), and the Earth-Moon angular momentum, which is consistent with a single major impact.\n\nAfter formation, the Moon was covered by a global magma ocean tens to hundreds of kilometres deep. As it cooled over hundreds of millions of years, lighter minerals (plagioclase feldspar) crystallised and floated to the surface, forming the bright, heavily cratered highland terrain (anorthosite). Denser minerals sank to form the mantle. During the Late Heavy Bombardment (~4.1–3.8 Ga), a period of intense meteoritic bombardment left the highlands heavily cratered. Heat generated by radioactive decay then produced volcanic eruptions, flooding the large impact basins with dark, iron-rich basalt to create the lunar maria — the 'seas' visible with the naked eye and romanticised across cultures for millennia.\n\nThe Moon's geology is dominated by impact craters, which preserve a 4.5-billion-year record of the cratering history of the inner Solar System. Unlike Earth, the Moon has no oceans to erode them, no plate tectonics to recycle the crust, and only the thinnest of tenuous exospheres — so craters and geological formations billions of years old survive almost unaltered. This makes the Moon an invaluable archive for the early history of the Solar System.\n\nVolcanism ended on the Moon roughly 1–3 billion years ago; it is essentially geologically dead today (small moonquakes due to tidal flexing and thermal expansion are still detected). The heavily cratered farside never faces Earth — a result of tidal locking over billions of years — and is geologically different from the nearside: it has fewer maria and a thicker, more ancient crust, a dichotomy whose explanation remains an active research area.\n\nThe Moon's gravitational influence on Earth is profound. Lunar gravity raises tidal bulges in Earth's oceans and solid body. The high tides of a semi-diurnal tidal pattern (two high tides roughly 12 hours apart) average about 0.5 metres in the open ocean but can reach 16 metres in funnel-shaped bays like the Bay of Fundy. Tidal friction is gradually slowing Earth's rotation — the day is lengthening by about 2 milliseconds per century — and correspondingly pushing the Moon away by about 3.8 cm per year (confirmed by laser ranging off retroreflectors left by Apollo missions). When Earth formed, the day was about 6 hours long and the Moon was perhaps 20–30 Earth radii away, compared to today's 60 Earth radii.\n\nThe Moon also appears to stabilise Earth's axial tilt at about 23.5° over millions of years, moderating the severity of seasons and climate variation. Mars, lacking a large moon, has had its axial tilt varying between 11° and 60° over millions of years — contributing to severe climate swings. Some researchers argue that the Moon's stabilising influence on Earth's climate has been important for the evolution of complex life, though this claim is debated.\n\nApollo remains the greatest achievement in human exploration. Six missions landed between 1969 and 1972, delivering 12 astronauts to the surface and returning 382 kg of lunar samples that continue to yield scientific insights half a century later. NASA's Artemis programme aims to return humans to the Moon — specifically the south polar region, where permanently shadowed craters are believed to contain water ice deposited by comets and meteorites, potentially a resource for future explorers. Artemis I (November 2022) was a successful uncrewed test of the Space Launch System and Orion capsule; Artemis II will carry astronauts around the Moon without landing; Artemis III aims for the first crewed south polar landing."
  },
  {
    "id": "art-018",
    "slug": "hubble-space-telescope-legacy",
    "category": "astronomy",
    "title": "The Hubble Space Telescope: Three Decades of Cosmic Wonder",
    "publishedAt": "2025-05-24",
    "readingMinutes": 8,
    "tags": [
      "Hubble",
      "space telescope",
      "deep field",
      "galaxies",
      "expansion",
      "servicing missions"
    ],
    "summary": "Launched in 1990 with a fatally flawed mirror, the Hubble Space Telescope was rescued by astronaut repair crews and became the most scientifically productive astronomical instrument in history, transforming our understanding of the Universe from the Hubble Deep Field to the measurement of dark energy.",
    "body": "The Hubble Space Telescope (HST) was supposed to be a triumphant beginning. Instead, the first images returned after its launch on 24 April 1990 revealed the telescope could not focus properly. Spherical aberration — a manufacturing error of just 2.2 micrometres in the curvature of its mirror — left the images frustratingly blurry. The error was devastating in terms of both science and prestige: HST had cost approximately $1.5 billion (1990 dollars), and the failure was seized upon by critics of NASA spending. Congress and the press were merciless.\n\nThe rescue came in December 1993 during a 10-day Space Shuttle Endeavour mission (STS-61), one of the most complex servicing missions in NASA history. Astronauts performed five spacewalks to install the Corrective Optics Space Telescope Axial Replacement (COSTAR) unit and replace the Wide Field and Planetary Camera with the Wide Field Planetary Camera 2 (WFPC2), which had corrective optics built in. When the first post-servicing images came back, they were breathtaking: sharp, brilliant, the universe in focus. HST was transformed from an embarrassment into a triumph. Four subsequent servicing missions by shuttle crews extended its life and upgraded its instruments.\n\nHubble's contributions to astronomy are almost beyond enumeration, but several stand out. In 1995, the director of the Space Telescope Science Institute, Robert Williams, made a bold decision: to point Hubble at an apparently blank patch of sky — with no bright stars, no known galaxies — for 100 consecutive hours. The result was the Hubble Deep Field (HDF), an image of about 3,000 galaxies in a patch of sky 5.3 arcminutes across — 1/13,000,000th of the total sky. These galaxies span 12 billion years of cosmic history, showing galaxies at all stages of evolution. The HDF became one of the most scientifically productive images in the history of astronomy and was followed by deeper and deeper observations: the Hubble Ultra Deep Field (2004) revealed galaxies at redshifts up to 7 (light from only 750 million years after the Big Bang), and the Hubble eXtreme Deep Field (2012) pushed to redshifts over 11.\n\nOne of Hubble's most consequential contributions was to the discovery of the accelerating expansion of the Universe. High-redshift Type Ia supernovae observed by HST were used by the teams of Perlmutter and Schmidt/Riess to show that the Universe's expansion is speeding up — driven by dark energy. This 1998 discovery, confirmed by Hubble and subsequent observations, earned the 2011 Nobel Prize in Physics. HST also provided one of the most precise measurements of the Hubble constant (H₀) — the current expansion rate — using Cepheid variable stars as distance indicators. The current tension between HST's H₀ ≈ 73 km/s/Mpc and CMB-derived values of ~67 km/s/Mpc is one of modern cosmology's open questions.\n\nHubble's observations of the outer Solar System revealed the four moons of Pluto beyond Charon (Nix, Hydra, Kerberos, Styx), detailed the atmosphere of Titan, observed the impact of Comet Shoemaker-Levy 9 into Jupiter in 1994 (the first direct observation of a collision between Solar System bodies), and mapped the atmosphere of various exoplanets via transit spectroscopy. In stellar physics, it has imaged supernova remnants including Supernova 1987A in breathtaking detail, resolved individual stars in nearby galaxies, and tracked the orbits of stars around Sagittarius A* in the Milky Way's centre.\n\nMore than 35 years after launch, Hubble continues to operate, though in a degraded state following the loss of functioning gyroscopes in 2024 (NASA transitioned to one-gyroscope mode to extend the mission lifetime). Its archive of over 1.5 million observations has produced more than 21,000 peer-reviewed scientific papers. It remains among the ten most cited scientific instruments in history. The James Webb Space Telescope does not replace Hubble — JWST observes primarily in infrared, while Hubble covers ultraviolet and optical wavelengths — and the two are designed as complementary instruments. HST's legacy, however it ultimately winds down, is indelible: it did not merely expand human knowledge, it changed the way humans see the Universe and their place within it."
  },
  {
    "id": "art-019",
    "slug": "voyager-missions",
    "category": "space-exploration",
    "title": "The Voyager Missions: Humanity's Farthest Reach",
    "publishedAt": "2025-06-06",
    "readingMinutes": 7,
    "tags": [
      "Voyager 1",
      "Voyager 2",
      "interstellar space",
      "Grand Tour",
      "heliopause",
      "Golden Record"
    ],
    "summary": "Launched in 1977, the twin Voyager spacecraft exploited a rare planetary alignment for a Grand Tour of the outer Solar System. More than 47 years later, Voyager 1 and Voyager 2 are the only human-made objects in interstellar space, still transmitting from over 20 billion kilometres away.",
    "body": "In the late 1970s, the planets of the outer Solar System aligned in a configuration that occurs only once every 175 years — a geometric coincidence that made a single spacecraft capable of flying past Jupiter, Saturn, Uranus, and Neptune using gravitational assists from each planet without the need for enormous onboard propellant. NASA engineer Gary Flandro identified this opportunity in 1965 and proposed the 'Grand Tour.' Two spacecraft were built and launched in the summer of 1977: Voyager 2 on 20 August and Voyager 1 on 5 September (Voyager 1 was on a faster trajectory and overtook its twin).\n\nBoth spacecraft are powered by radioisotope thermoelectric generators (RTGs) containing plutonium-238, which produce electricity from the heat of radioactive decay. As the plutonium ages, power output declines slowly; the spacecraft team continually manages power budgets, shutting down instruments to keep the most critical systems alive. Both Voyagers carry a 3.7-metre high-gain dish antenna for communications; even at interstellar distances, their 22.4-watt transmitters can send data home — though the signal takes over 22 hours to travel from Voyager 1 at the speed of light.\n\nVoyager 1's Jupiter encounter in March 1979 produced revelations. The Great Red Spot was revealed in unprecedented swirling detail. The thin rings of Jupiter, previously unknown, were imaged. Most spectacular: three of Jupiter's moons harboured surprises. Io — bombarded by tidal stresses and resonance with Europa and Ganymede — was revealed as the most volcanically active body in the Solar System, with actively erupting volcanoes discovered during the flyby. Europa showed a cracked, smooth icy surface hinting at the subsurface ocean now confirmed decades later. Ganymede and Callisto showed heavily cratered icy terrain.\n\nAt Saturn (November 1980), Voyager 1 imaged the rings at close range for the first time, revealing thousands of distinct ringlets, braiding, spokes (periodic radial features lasting hours) and sharp ring edges maintained by 'shepherd moons.' Titan — Saturn's largest moon and the only moon in the Solar System with a thick atmosphere — was a primary target. To get the best data on Titan's atmosphere, Voyager 1's trajectory was bent by Saturn's gravity in a way that sent it out of the ecliptic plane and onto its current trajectory exiting the Solar System above the ecliptic. This ended Voyager 1's planetary science programme.\n\nVoyager 2 continued to Uranus (January 1986) and Neptune (August 1989) — the only spacecraft ever to visit the two ice giants. At Uranus, the probe discovered 10 previously unknown moons and two new rings. At Neptune — the outermost planetary flyby in history — it discovered six new moons, including the intriguing Proteus, and observed the Great Dark Spot (a storm since dissipated). Most memorably, it photographed Triton, Neptune's largest moon, showing active geysers of nitrogen frost erupting from the sun-warmed polar cap — heated by the Sun despite Neptune's enormous distance — making Triton one of the few geologically active bodies in the outer Solar System.\n\nBoth spacecraft carry the Golden Record — a 12-inch gold-plated copper disc containing 115 images, greetings in 55 languages, 12 minutes of Earth sounds (rain, surf, wind, birds, whales), and 90 minutes of music spanning Bach, Chuck Berry, Indian ragas, Azerbaijani folk music, and more — intended as a message from humanity to any extraterrestrial civilisation that might find the spacecraft millions of years from now. Carl Sagan, who led the record's curation, called it 'a cosmic bottle tossed into an interstellar ocean.'\n\nVoyager 1 crossed the heliopause — the boundary between the solar wind and interstellar space — in August 2012. Voyager 2 crossed it, at a different location, in November 2018. Both now sample the local interstellar medium directly. Data from their plasma wave instruments, magnetometers, and particle detectors are being used to study the properties of interstellar space for the first time. Both spacecraft continue to return science data. If they survive, they will drift among the stars for billions of years — the most enduring human artefacts ever made."
  },
  {
    "id": "art-020",
    "slug": "future-space-exploration",
    "category": "space-exploration",
    "title": "The Future of Space Exploration: From Artemis to the Stars",
    "publishedAt": "2025-07-01",
    "readingMinutes": 9,
    "tags": [
      "Artemis",
      "Mars crewed mission",
      "space tourism",
      "Starship",
      "nuclear propulsion",
      "interstellar"
    ],
    "summary": "The 2020s and 2030s promise a new golden age of space exploration: humans returning to the Moon under Artemis, commercial space stations, crewed Mars missions on the horizon, and bold proposals for nuclear propulsion and even generation ships. How will humanity extend its reach across the Solar System — and ultimately beyond?",
    "body": "The history of space exploration has proceeded in waves: the frantic early era of superpower competition in the 1960s, the more measured (and often frustrating) decades that followed, and now a new surge driven by the convergence of commercial ambition, international competition, and maturing technology. By the mid-2020s, more nations and private companies are actively launching spacecraft than at any previous time, and the scientific and exploration agenda has never been more ambitious.\n\nNASA's Artemis programme aims to return humans to the Moon for the first time since Apollo 17 in December 1972 — specifically to the south polar region, where radar and neutron spectrometer data suggest permanently shadowed craters contain water ice deposited by comets and meteorites over billions of years. Artemis I (November 2022) successfully flew the Orion capsule around the Moon and back, demonstrating the Space Launch System. Artemis II will carry four astronauts (including the first woman and first non-American on a lunar mission) on a circumlunar free-return trajectory. Artemis III, targeting the south pole, will land using SpaceX's Starship Human Landing System — a lunar variant of the enormous Starship vehicle.\n\nThe Lunar Gateway — a small space station planned for a near-rectilinear halo orbit around the Moon — will serve as a staging point for surface missions and as a testbed for deep-space life support systems. Canada, ESA, JAXA, and NASA are contributing modules. China's Chang'e programme is pursuing parallel lunar objectives independently, with Chang'e 6 returning the first samples from the Moon's farside in 2024 and subsequent missions aimed at a crewed landing in the early 2030s, likely using the Long March 10 heavy-lift rocket.\n\nThe commercial space sector has transformed. SpaceX, founded by Elon Musk, developed the Falcon 9 (the world's most reliable orbital launch vehicle, with hundreds of landings of its reusable first stage), the Falcon Heavy, and the Crew Dragon and Cargo Dragon capsules that now routinely ferry astronauts and cargo to the ISS. Starship — the fully reusable super-heavy lift vehicle with a payload capacity of 100–150 tonnes to low Earth orbit — completed its first full launch and successful mission in 2024–2025. If fully operational and rapidly reusable, Starship would dramatically lower the cost of access to space, potentially making large-scale planetary exploration and colonisation economically feasible. Blue Origin, Rocket Lab, Relativity Space, and dozens of other companies are building a thriving commercial launch ecosystem.\n\nBeyond the Moon, Mars remains the horizon. SpaceX's stated goal is a crewed Mars landing, and Starship is designed for the mission: with in-orbit propellant transfers, it could deliver 100 tonnes — and hundreds of humans — to Mars per launch window. NASA's Human Landing System for Mars, part of a broader Moon-to-Mars architecture, targets a crewed surface mission in the 2030s or 2040s, though funding and timeline remain uncertain. The Mars Sample Return mission — retrieving Perseverance's rock samples from Jezero Crater and returning them to Earth — is a critical scientific precursor, though budget overruns have delayed and redesigned the mission repeatedly.\n\nFor the outer Solar System, the next generation of missions is being designed today. A Uranus orbiter and probe mission was identified as the top priority in the 2023–2032 Planetary Science Decadal Survey, reflecting the scientific richness of the ice giants and the data gap since Voyager 2's brief flybys. An Enceladus orbiter or lander — to sample the plumes of the moon that has hydrothermal vents and complex organic chemistry — is a high priority for the following decade. A Europa lander, potentially drilling into the ice and sampling the ocean, is a longer-term goal whose technical challenges (landing on a heavily irradiated, geologically active surface) are formidable.\n\nPropulsion technology is a key enabler for the future. Chemical rockets are thermodynamically inefficient — essentially unchanged in principle since the V-2. Nuclear Thermal Propulsion (NTP), in which a nuclear reactor heats hydrogen propellant to enormous temperatures before expelling it, can achieve specific impulses (a measure of fuel efficiency) roughly twice that of the best chemical engines, potentially halving transit times to Mars. NASA and DARPA are developing a demonstration NTP spacecraft (DRACO) targeting a 2027 launch. Nuclear Electric Propulsion (NEP), using nuclear power to drive ion thrusters, is ideal for robotic missions to the outer Solar System. The ultimate long-term frontier — targeted by recent project Breakthrough Starshot — is laser-sail nanocraft accelerated to 20% the speed of light by a ground-based laser array, potentially reaching Proxima Centauri and its candidate exoplanet Proxima b within 20 years of launch. Whether this concept is technically and economically feasible is deeply uncertain, but it represents the ambition of a species that has never been content to stay where it is."
  }
];

const ALL_COSMOS_ARTICLES = [...COSMOS_ARTICLES, ...COSMOS_ARTICLES_EXTENDED];






const COSMOS_ARTICLES_BATCH3 = [
  {
    "id": "art-021",
    "slug": "stellar-nurseries-nebulae",
    "category": "stellar-astronomy",
    "title": "Stellar Nurseries: The Birth of Stars in Cosmic Clouds",
    "publishedAt": "2025-07-15",
    "readingMinutes": 9,
    "tags": [
      "nebulae",
      "star formation",
      "molecular clouds",
      "T Tauri",
      "protostar",
      "Orion Nebula"
    ],
    "summary": "Stars are born in the densest, coldest regions of giant molecular clouds — stellar nurseries tens of light-years across where gravity condenses hydrogen and helium into protostars. The process shapes entire galaxies and produces the heavy elements that make planets and life possible.",
    "body": "On a clear dark night, the Orion Nebula is barely visible to the naked eye as a fuzzy smudge in the sword of Orion, 1,344 light-years away. Through binoculars or a small telescope, it resolves into a glowing cloud of ionised hydrogen lit up by the ultraviolet radiation of four hot young stars — the Trapezium cluster at its core. The Hubble Space Telescope and now the James Webb Space Telescope have revealed it as a vast, turbulent star factory: a region 24 light-years across containing hundreds of young stellar objects at every stage of formation, embedded in swirling gas and dust.\n\nStar formation begins in giant molecular clouds (GMCs): enormous, cold, dense accumulations of molecular hydrogen (H₂) interspersed with helium, complex molecules (water ice, carbon monoxide, methanol, glycolaldehyde — a simple sugar), and dust grains a few micrometres in diameter. GMCs range from small clouds of a few thousand solar masses to giant complexes like the Orion Molecular Cloud (500,000 solar masses) and the Sagittarius B2 region near the galactic centre (3 million solar masses). The temperature in the densest cores can fall below 10 Kelvin — quieter and colder than almost anything in the universe — which is necessary because thermal pressure would otherwise prevent gravitational collapse.\n\nCollapse is triggered by perturbations: a nearby supernova shock wave compressing the cloud, a spiral arm density wave passing through the galaxy, or the gravitational instability of a region that has cooled enough that its 'Jeans mass' — the critical mass above which gravity overwhelms thermal pressure — has been exceeded. Once gravity wins locally, a molecular cloud core begins to collapse, heating up as gravitational potential energy converts to thermal energy. This phase is called a protostar — a dense, hot blob at the core of an infalling envelope of gas and dust — and it may last hundreds of thousands of years.\n\nAs the protostar accretes mass and contracts, it spins faster (conservation of angular momentum) and flattens the surrounding material into a protoplanetary disc — a rotating disc of gas and dust that will ultimately form planets, if enough material and time are available. Meanwhile, strong magnetic fields and the rapidly rotating disc drive powerful bipolar outflows: jets of ionised gas blasting outward along the rotation axis at hundreds of kilometres per second, illuminating Herbig-Haro objects (small, bright reflection nebulae) where the jets strike the surrounding cloud.\n\nIn the T Tauri phase — named for a prototype in the constellation Taurus — a young star has shed most of its infalling envelope and is actively visible at optical wavelengths, though still accreting from its disc. T Tauri stars exhibit intense magnetic activity, strong stellar winds, and variability. They have not yet reached the main sequence: they are still contracting, and hydrogen fusion has not begun in earnest. For a solar-mass star, the pre-main-sequence phase takes about 50 million years. For a star 10 times as massive, gravitational collapse is so rapid and accretion so intense that the star reaches the main sequence in less than 100,000 years — faster than we can currently observe.\n\nFor very massive newly formed stars (O and B spectral types), their intense ultraviolet radiation quickly ionises the surrounding gas, creating an H II region — a glowing nebula like the Orion Nebula. The radiation and stellar winds drive powerful shocks into the molecular cloud, potentially compressing denser regions and triggering further star formation in a process called sequential star formation or radiation-driven implosion. Conversely, the ionised region can also disperse the cloud and halt further star formation — a process of 'feedback' that regulates the star formation rate of entire galaxies.\n\nThe James Webb Space Telescope has provided extraordinary new views of star-forming regions. Its 2022 image of the Carina Nebula NGC 3324 showed hundreds of new candidate protostars invisible in Hubble's optical images, and its images of the Orion Nebula revealed hundreds of Jupiter-mass free-floating objects — objects too small to sustain hydrogen fusion but too large to be called planets — dubbed 'rogue planets,' 'sub-stellar objects,' or in the case of Jupiter-mass binary objects (JuMBOs), a newly recognised class whose formation mechanism is debated.\n\nThe heavy elements forged in stars and dispersed by supernova explosions — carbon, oxygen, nitrogen, silicon, iron — return to molecular clouds in subsequent generations of star formation. The Sun is a third-generation star incorporating material from multiple supernova events. Every atom of carbon in your body was synthesised in the core of a star that lived and died before the Solar System formed. Stellar nurseries are not merely birthplaces of new suns; they are the furnaces of cosmic chemistry, linking the nuclear physics of stellar interiors to the biochemistry of life."
  },
  {
    "id": "art-022",
    "slug": "galactic-structure-milky-way-deep-dive",
    "category": "galactic-astronomy",
    "title": "The Structure of Galaxies: Spirals, Ellipticals, and Collisions",
    "publishedAt": "2025-08-01",
    "readingMinutes": 9,
    "tags": [
      "galaxy morphology",
      "spiral galaxy",
      "elliptical galaxy",
      "galaxy merger",
      "dark matter halo",
      "Andromeda"
    ],
    "summary": "Galaxies are the fundamental building blocks of the large-scale Universe, ranging from tiny dwarf galaxies with a million stars to giant ellipticals with trillions. Their shapes, stellar populations, and evolution tell the story of how mass assembles and how stars live and die across cosmic time.",
    "body": "When the American astronomer Edwin Hubble established in the 1920s that the 'spiral nebulae' were independent 'island universes' — complete galaxies of hundreds of billions of stars separated from the Milky Way by distances of millions of light-years — he instantly multiplied the known size of the Universe by a factor of roughly a million. Today, the observable universe is estimated to contain at least two trillion galaxies. Their variety of shape, size, and composition records the full spectrum of cosmic history.\n\nHubble classified galaxies morphologically in what became the Hubble Tuning Fork diagram. Elliptical galaxies (E0–E7, from round to very elongated) are smooth, featureless, predominantly composed of old red stars, and contain little gas or dust. They range from small dwarf ellipticals (millions of stars) to giant ellipticals and cD galaxies (brightest cluster galaxies) with trillions of stars. Spiral galaxies (Sa–Sd, or SBa–SBd for barred spirals) have a central bulge surrounded by a flat disc containing spiral arms traced by young blue stars, H II regions, and dust lanes. Our Milky Way is a barred spiral (SBbc). Lenticular (S0) galaxies have a disc but no spiral arms, forming a bridge between spirals and ellipticals. Irregular galaxies don't fit neatly into any category — they are often the result of gravitational interactions with neighbours; the Large and Small Magellanic Clouds are irregular satellites of the Milky Way.\n\nAt the heart of most massive galaxies, including our own, lurks a supermassive black hole (SMBH) with mass ranging from millions to tens of billions of solar masses. In the Milky Way, Sagittarius A* (Sgr A*) has a mass of about 4 million solar masses and is 26,000 light-years from the Sun. When SMBHs are actively accreting material from an accretion disc, they power quasars and active galactic nuclei — among the most luminous sustained sources of energy in the Universe, outshining entire galaxies of billions of stars from a region smaller than the Solar System. Quasars were cosmically abundant in the early Universe (redshift 2–3) and are rare today, suggesting that most SMBHs in nearby galaxies — including Sgr A* — have exhausted their fuel supply and are quiet.\n\nDark matter haloes — with masses 10–100 times greater than the visible baryonic mass — cocoon every galaxy. The flat rotation curves of spiral galaxies (rotation speed remains roughly constant out to large radii rather than declining as Keplerian physics would predict for the luminous mass alone) are the strongest observational evidence for dark matter in galaxies. Within these haloes, galaxies form, evolve, and interact over billions of years.\n\nGalaxy mergers are a fundamental process in galactic evolution. When two large galaxies pass through each other — pulled together by gravity, their actual star-to-star collision probability negligible given the empty spaces between stars — tidal forces disrupt their disc structures, pull out long stellar streams and tails, and ultimately merge the two into a single, typically elliptical galaxy. The Antennae Galaxies (NGC 4038/4039) are a spectacular example in progress, their cores surrounded by hundreds of young star clusters triggered by the collision compressing molecular clouds. The Milky Way will collide and merge with the Andromeda Galaxy (M31) in approximately 4.5 billion years. Simulations show the merged galaxy — sometimes nicknamed 'Milkomeda' or 'Andromilky Way' — will be a large elliptical. Our Solar System is likely to be flung to a much larger galactic radius but will survive the merger intact.\n\nGalaxy clusters — the largest gravitationally bound structures in the Universe — contain dozens to thousands of galaxies, bound by a common dark matter halo. The Virgo Cluster, 53 million light-years away, contains over 1,300 galaxies and is the nearest large cluster to the Milky Way; our Local Group is falling slowly toward it. Galaxy clusters are also filled with hot X-ray emitting plasma (the intracluster medium, or ICM) that makes clusters luminous in X-rays. The total mass in dark matter overwhelmingly dominates; the ICM outweighs all the galaxies it contains.\n\nThe most distant galaxies observed — by the JWST in 2022 and 2023 — exist at redshifts of 14+ (light emitted just 290 million years after the Big Bang). These early galaxies are surprisingly compact, bright, and more massive than models predicted would be possible so early in cosmic history. Understanding how they formed so quickly — and whether they are powered by intense star formation or active black holes or both — is one of the most active questions in modern observational cosmology."
  },
  {
    "id": "art-023",
    "slug": "dark-matter-detection",
    "category": "cosmology",
    "title": "Detecting the Invisible: The Hunt for Dark Matter Particles",
    "publishedAt": "2025-08-20",
    "readingMinutes": 8,
    "tags": [
      "dark matter",
      "WIMP",
      "axion",
      "LUX",
      "XENON1T",
      "direct detection",
      "collider"
    ],
    "summary": "Dark matter constitutes 27% of the Universe's energy content and is five times more abundant than ordinary matter, yet its particle nature remains completely unknown. Three complementary strategies — direct detection, indirect detection, and collider production — are being pursued with increasingly sensitive instruments.",
    "body": "The evidence for dark matter is overwhelming — rotation curves, gravitational lensing, large-scale structure, the cosmic microwave background — but decades of searching have yielded no confirmed detection of the particle (or particles) responsible. This is one of the most profound unsolved problems in all of physics, sitting at the intersection of cosmology, particle physics, and astrophysics.\n\nThe dominant theoretical candidate for much of the past three decades has been the Weakly Interacting Massive Particle (WIMP). WIMPs are hypothetical particles with masses typically between 10 and 10,000 times the proton mass, interacting with ordinary matter only through the weak nuclear force and gravity (not electromagnetism, so they are electrically neutral and do not emit or absorb light). Their appeal is the 'WIMP miracle': if a particle with roughly the masses and interaction strengths naturally occurring in extensions of the Standard Model such as supersymmetry (SUSY) existed in the hot early Universe, it would 'freeze out' with exactly the right relic abundance to constitute the observed dark matter density. This numerical coincidence — a factor of ~10²⁶ in energy density matching — was striking enough to motivate an enormous experimental programme.\n\nDirect detection experiments search for the recoil of atomic nuclei when a WIMP from the dark matter halo of the Milky Way passes through a detector and elastically scatters off a nucleus. The expected signal is a tiny nuclear recoil (a few to tens of kiloelectronvolts) at a rate of perhaps one event per tonne of detector per year. To suppress the enormous background of cosmic rays, natural radioactivity, and neutrinos, these experiments are built deep underground (in mines or tunnels), use ultra-pure materials, and surround the detector with active and passive shielding. The LUX (Large Underground Xenon), PandaX, XENON1T, and LUX-ZEPLIN (LZ) experiments use liquid xenon as a target. XENON1T results published in 2018 set world-leading sensitivity for WIMP masses above ~6 GeV. Despite progressively more sensitive searches, no confirmed WIMP signal has been found, placing increasingly stringent limits on the interaction cross-section and pushing into parameter space where supersymmetric models are uncomfortably constrained.\n\nIndirect detection looks for the products of dark matter annihilation or decay in regions of high dark matter density (the galactic centre, dwarf spheroidal galaxies, galaxy clusters). If WIMPs annihilate into Standard Model particles, they would produce gamma rays, positrons, antiprotons, and neutrinos observable by space- and ground-based telescopes. The Fermi Gamma-ray Space Telescope has searched extensively for annihilation signatures, including a potential signal from the galactic centre (the 'Galactic Centre excess') consistent with ~50 GeV WIMPs — but this excess can also be explained by unresolved populations of millisecond pulsars, leaving the interpretation ambiguous. The AMS-02 instrument on the ISS measures the precise spectrum of cosmic ray positrons and antiprotons with unprecedented accuracy; its positron excess has been largely attributed to pulsar sources rather than dark matter.\n\nIf dark matter is not WIMPs, leading alternatives include axions — extremely light pseudoscalar particles originally proposed by Frank Wilczek and Steven Weinberg in 1978 to solve the 'strong CP problem' in QCD. Axions with masses between roughly 1 and 100 microelectronvolts are well-motivated dark matter candidates. The Axion Dark Matter eXperiment (ADMX) at the University of Washington uses a microwave cavity in a strong magnetic field to convert axions into detectable photons via the inverse Primakoff effect. So far, ADMX has excluded axions in a narrow mass range; future upgrades target a broader range. Sterile neutrinos, primordial black holes, self-interacting dark matter, and 'fuzzy dark matter' (ultra-light axion-like particles with quantum fuzziness at galactic scales) are also studied.\n\nAt the Large Hadron Collider (LHC) at CERN, physicists search for dark matter via missing transverse energy signatures — events where energy and momentum appear not to balance, indicating an invisible particle escaping the detector. Despite the LHC's extension of supersymmetry searches to multi-TeV masses, no SUSY particle or dark matter candidate has been found. The upcoming High-Luminosity LHC (HL-LHC) and proposed future colliders (FCC-hh at 100 TeV) will push this frontier further.\n\nThe non-detection of WIMPs after decades of sensitive searching has begun shifting theoretical attention. Perhaps dark matter consists of a rich 'dark sector' — a complex of dark particles interacting among themselves with 'dark forces' and only feebly coupled to the Standard Model. Perhaps it is primordial black holes — formed in the hot early Universe before conventional structure formation — though gravitational microlensing surveys have now constrained their contribution across most of the plausible mass range. The solution, when it comes, will almost certainly require new physics beyond the Standard Model."
  },
  {
    "id": "art-024",
    "slug": "cosmic-microwave-background",
    "category": "cosmology",
    "title": "The Cosmic Microwave Background: The Afterglow of the Big Bang",
    "publishedAt": "2025-09-05",
    "readingMinutes": 8,
    "tags": [
      "CMB",
      "cosmic microwave background",
      "Big Bang",
      "Planck satellite",
      "inflation",
      "anisotropies"
    ],
    "summary": "The Cosmic Microwave Background is the faint thermal glow of light released 380,000 years after the Big Bang, now cooled to just 2.725 Kelvin and stretched across the entire sky. Its precise temperature fluctuations encode a wealth of cosmological information and have transformed cosmology into a precision science.",
    "body": "In 1964, Arno Penzias and Robert Wilson, radio astronomers at Bell Laboratories in New Jersey, were attempting to use a large horn antenna to measure radio emission from the Milky Way. No matter which direction they pointed the antenna, they detected a persistent, unexplained background noise at 7.35 cm wavelength. They cleaned bird droppings from the antenna, eliminated every known instrumental source of interference, and the noise remained. When they learned that cosmologist Robert Dicke at nearby Princeton University was building an instrument to search for relic radiation from a hot Big Bang — radiation predicted by Ralph Alpher and Robert Herman in 1948 — Penzias and Wilson realised what they had detected. The discovery of the Cosmic Microwave Background radiation (CMB) earned Penzias and Wilson the 1978 Nobel Prize in Physics and provided the most compelling evidence for the Big Bang model.\n\nThe CMB is the thermal radiation released when the Universe cooled sufficiently for protons and electrons to combine into neutral hydrogen atoms — a process called recombination — about 380,000 years after the Big Bang, when the temperature was about 3,000 Kelvin. Before recombination, the Universe was an opaque, hot plasma in which photons couldn't travel far before being scattered by free electrons. Recombination created a transparent Universe, and the photons last scattered at the surface of last scattering have been travelling freely ever since. As the Universe has expanded by a factor of about 1,100, the photon wavelengths have stretched by the same factor, cooling the radiation from 3,000 K to its current temperature of 2.725 Kelvin — placing it in the microwave band.\n\nThe CMB is extraordinarily uniform — it's the closest thing to a perfect blackbody spectrum ever observed in nature, as confirmed by the COBE satellite's FIRAS instrument. But it is not perfectly uniform. COBE's DMR instrument in 1992 detected CMB temperature fluctuations at the level of 1 part in 100,000 — tiny ripples in which one region of sky is a ten-thousandth of a degree warmer or cooler than another. These fluctuations correspond to density variations in the early Universe — slightly denser regions that would eventually collapse under gravity to form galaxies and galaxy clusters, and slightly underdense regions that would expand into the cosmic voids. The Nobel Prize in 2006 went to George Smoot (for DMR analysis) and John Mather (for FIRAS).\n\nThe WMAP satellite (2001–2010) and ESA's Planck satellite (2009–2013) mapped the CMB with progressively finer angular resolution and sensitivity. The angular power spectrum of CMB fluctuations — how much power exists at each angular scale — contains a series of acoustic peaks that encode the cosmological parameters with extraordinary precision. The positions and heights of these peaks measure the geometry of the Universe (it's spatially flat, to high precision), the baryon density (4.9% of the total energy), the dark matter density (26.8%), the dark energy density (68.3%), the Hubble constant, the spectral index of initial fluctuations (confirming the nearly scale-invariant spectrum predicted by inflation), and the optical depth to reionisation, among other parameters. Planck's final data release in 2018 determined these parameters to sub-percent precision.\n\nCosmological inflation — the hypothetical period of exponential expansion in the first 10⁻³⁶ to 10⁻³² seconds after the Big Bang — naturally explains several otherwise puzzling features of the CMB: the nearly perfect uniformity of temperature across regions of the sky that were causally disconnected without inflation (the horizon problem), the spatial flatness of the Universe (flatness problem), and the near-absence of predicted magnetic monopoles (monopole problem). Inflation also predicts that quantum fluctuations during inflation were stretched to cosmic scales, seeding the density fluctuations observed in the CMB. A confirmed detection of B-mode polarisation in the CMB — a specific swirling pattern imprinted by primordial gravitational waves produced during inflation — would be smoking-gun evidence for inflation. The BICEP/Keck program at the South Pole continues this search with increasing sensitivity, and ESA's LiteBIRD satellite is designed specifically for this objective.\n\nThe CMB temperature measured by ESA's Planck satellite yields a Hubble constant H₀ = 67.4 ± 0.5 km/s/Mpc. Direct distance ladder measurements using Cepheid variables and Type Ia supernovae consistently obtain H₀ ≈ 73 km/s/Mpc, a 5σ discrepancy known as the Hubble tension. This tension may reflect systematic errors in one or both methods, or it may be pointing to new physics — early dark energy, interacting dark matter, additional relativistic species in the early Universe — that would represent the first crack in the standard ΛCDM model. Resolving the Hubble tension is considered one of the most important outstanding problems in modern cosmology."
  },
  {
    "id": "art-025",
    "slug": "reionisation-first-stars",
    "category": "cosmology",
    "title": "The Epoch of Reionisation: The Universe's First Light",
    "publishedAt": "2025-09-20",
    "readingMinutes": 7,
    "tags": [
      "reionisation",
      "first stars",
      "Population III stars",
      "JWST",
      "quasar absorption",
      "dark ages"
    ],
    "summary": "After the Big Bang's afterglow faded, the Universe entered the cosmic Dark Ages — hundreds of millions of years with no stars and a neutral hydrogen fog. The ignition of the first stars and galaxies ended this era by reionising the universe. The James Webb Space Telescope is now showing us these earliest cosmic structures for the first time.",
    "body": "The story of the Universe has a dramatic three-act structure. The first act — the hot Big Bang — produced a fireball of radiation and particles that cooled and assembled into hydrogen and helium atoms, releasing the photons we observe as the Cosmic Microwave Background 380,000 years in. The third act — from about a billion years after the Big Bang until today — is the familiar cosmos of galaxies, stars, and planets. Between them lies the second act: the Cosmic Dark Ages and the Epoch of Reionisation, a period that was until recently almost entirely opaque to observation.\n\nAfter recombination (380,000 years), the Universe was filled with neutral hydrogen and helium gas — and darkness. The initial glow had cooled, and no new luminous objects existed. For roughly 100–400 million years (the precise timeline is still being refined), there were no stars, no galaxies, no light at any wavelength other than the long-wavelength tail of the redshifted CMB and the 21-cm hyperfine transition of neutral hydrogen. This is the Cosmic Dark Ages. The temperature of the gas slowly fell, and small inhomogeneities in the density field grew under gravity, eventually producing the first dark matter minihaloes — seeds for the first structures.\n\nThe first stars — called Population III (Pop III) stars, a name reflecting the metallicity classification scheme in which Pop I stars are metal-rich like the Sun, Pop II are metal-poor, and Pop III have essentially no metals — formed when gas within the first dark matter haloes cooled and collapsed, somewhere between 100 and 400 million years after the Big Bang. Because molecular hydrogen was the only cooling agent available (heavier elements like carbon and oxygen, which are efficient coolants, hadn't yet been synthesised), Pop III stars formed in conditions distinct from later star formation: they are thought to have been very massive (perhaps 10–1,000 solar masses) and extremely hot, emitting copious ultraviolet radiation. They lived fast and died young — perhaps a million years — as supernovae or by direct collapse into black holes.\n\nThe Epoch of Reionisation (EoR) occurred roughly between 150 million and 1 billion years after the Big Bang (redshifts 6–20). It refers to the process by which the ultraviolet radiation from the first stars, growing galaxies, and early quasars progressively ionised the neutral hydrogen fog that permeated the Universe, making it transparent again. The EoR was not a uniform process — it proceeded in a patchwork, with bubbles of ionised hydrogen (H II regions) growing around the first luminous sources and eventually percolating and overlapping to leave a fully reionised intergalactic medium (IGM) by redshift ~6 (about 900 million years after the Big Bang). The Gunn-Peterson trough — a complete absorption of quasar light blueward of Lyman-α emission by neutral hydrogen, seen in quasar spectra — marks the boundary of this reionisation, providing a key observational constraint.\n\nUntil the James Webb Space Telescope, the EoR was almost entirely invisible. Hubble could reach galaxy redshifts of ~11, seeing lookback times of 97.5% of the age of the Universe, but it was scratching the surface of the EoR. JWST's infrared sensitivity has transformed the field: within months of beginning science operations, JWST confirmed spectroscopic redshifts of galaxies at z = 12.5, 13.2, 14.3, and tentatively higher — the light we are receiving left these galaxies only 300–350 million years after the Big Bang, during the early EoR. These galaxies are unexpectedly bright and massive for their age: current galaxy formation models, developed to match the galaxy population seen by Hubble, did not predict such bright galaxies in the first few hundred million years. Whether this reflects a failure of the models (perhaps star formation was more efficient in the early Universe), or calibration uncertainties in measuring their masses, or exotic objects (massive black holes, or 'dark stars' powered by dark matter annihilation), is hotly debated.\n\nThe 21-cm signal from neutral hydrogen — detectable as the difference between the spin temperature of hydrogen atoms and the CMB temperature in the EoR — is the most direct and richest probe of the Dark Ages and EoR. Experiments like HERA (Hydrogen Epoch of Reionization Array) and MWA (Murchison Widefield Array) are attempting to detect this signal in statistical terms (the power spectrum), while the proposed Square Kilometre Array (SKA) aims to image it — essentially making a 3D movie of the EoR. The first tentative 21-cm detection was claimed by the EDGES experiment in 2018 (the antenna buried in the Western Australian desert) at a redshift of 17, with an absorption signal stronger than expected — possibly hinting at exotic physics such as hydrogen being cooled by interaction with dark matter, though instrumental systematics are also possible. The field awaits confirmation from independent experiments."
  }
];







const COSMOS_ARTICLES_BATCH4 = [
  {
    "id": "art-026",
    "slug": "spectroscopy-stellar-classification",
    "category": "stellar-astronomy",
    "title": "Stellar Spectroscopy: Reading the Hidden Messages in Starlight",
    "publishedAt": "2025-10-01",
    "readingMinutes": 9,
    "tags": [
      "spectroscopy",
      "stellar classification",
      "OBAFGKM",
      "absorption lines",
      "Cecilia Payne",
      "chemical abundances"
    ],
    "summary": "A spectrum of starlight — spread into its constituent colours — carries an almost complete physical description of a star: its temperature, composition, gravity, magnetic field, rotation speed, and motion toward or away from us. Stellar spectroscopy is the most powerful tool in the astronomer's arsenal.",
    "body": "When Newton passed sunlight through a glass prism in 1666, he spread it into a rainbow band of colours — the visible spectrum. In 1814, Joseph von Fraunhofer, a German optician of extraordinary skill, noticed that the solar spectrum was crossed by hundreds of dark vertical lines at specific wavelengths. These Fraunhofer lines — named in his honour — were mysterious for decades. In 1859, Gustav Kirchhoff and Robert Bunsen explained them: atoms in the cooler outer layer of the solar atmosphere absorb specific wavelengths of light from the deeper, brighter photosphere. Each element has a unique fingerprint of absorption lines determined by its electron energy levels. Sodium absorbs yellow light at 589 nm; hydrogen absorbs at the Balmer series wavelengths (656 nm Hα, 486 nm Hβ, and so on). The solar spectrum is thus a chemical inventory of the Sun's atmosphere, read in the wavelengths of missing light.\n\nThe systematic classification of stellar spectra began at the Harvard College Observatory in the late 19th and early 20th centuries, driven by Edward Pickering and carried out by a remarkable group of women astronomers — the 'Harvard Computers' — including Williamina Fleming, Antonia Maury, and Annie Jump Cannon. Cannon alone classified the spectra of 350,000 stars, creating the Draper Catalogue, and became the first to see that the spectral types formed a temperature sequence. Her OBAFGKM classification — memorised by generations of astronomy students as 'Oh Be A Fine Girl/Guy Kiss Me' — arranges stars from hottest (O, ~50,000 K) to coolest (M, ~3,000 K), with the Sun as a G2 type at roughly 5,778 K. Later additions extended the sequence to L, T, and Y for progressively cooler brown dwarfs.\n\nIn 1925, a young British astrophysicist named Cecilia Payne (later Payne-Gaposchkin) used quantum mechanics in her PhD thesis to demonstrate that the different spectral appearances of different star types were primarily due to temperature differences, not composition differences — and that the overwhelming bulk of stellar material was hydrogen, with helium second, and all heavier elements together making up less than 2% by mass. Her advisor, Henry Norris Russell, initially persuaded her to tone down this conclusion (which was counter to the then-accepted view that stellar composition resembled Earth's). Russell later arrived at the same conclusion independently and acknowledged Payne's priority. Her discovery that stars are overwhelmingly made of hydrogen is one of the most fundamental facts in astrophysics.\n\nModern spectroscopy extracts far more than temperature and composition. The Doppler effect shifts spectral lines toward the blue end if a star moves toward us, and toward the red if it moves away — measuring radial velocities to centimetre-per-second precision with modern spectrographs like HARPS and ESPRESSO, enabling the detection of exoplanets via the tiny wobbles their gravity induces in their host star's spectrum. The width of spectral lines encodes the thermal motion of atoms (broadening increases with temperature), the pressure (collision broadening in dense stellar atmospheres), and the star's rotation speed (rotational broadening). The splitting of lines in a magnetic field — the Zeeman effect — measures stellar magnetic field strengths. P Cygni profiles (a blue-shifted absorption component plus a red-shifted emission component) are a signature of outflowing stellar winds. Spectral emission nebula lines identify shock velocities in supernova remnants and the ionisation state of H II regions.\n\nThe Milky Way and other galaxies are composed of stellar populations with different ages and metallicities (astronomers call any element heavier than helium a 'metal'). Population I stars (like the Sun) are metal-rich, formed relatively recently (the last few billion years) in regions where previous generations of stars had enriched the interstellar medium with heavy elements forged in stellar nucleosynthesis. Population II stars are old (10–13 billion years), metal-poor, and include the halo stars orbiting in high-inclination orbits around the galactic centre. The hypothetical Population III stars (first stars) had essentially zero metallicity. This chemical evolution of stellar populations — tracked through spectroscopic surveys — is a key diagnostic of galactic history.\n\nThe Sloan Digital Sky Survey (SDSS) has obtained spectra for millions of galaxies and stars. The upcoming DESI (Dark Energy Spectroscopic Instrument) survey has already shattered records, obtaining over 20 million galaxy and quasar spectra in its first year to map the large-scale structure of the Universe and measure the expansion history to constrain dark energy. The 4MOST and WEAVE instruments on European telescopes will similarly gather tens of millions of spectra for galactic archaeology — reconstructing the formation and chemical evolution of the Milky Way from the composition of individual stars.\n\nSpectroscopy of exoplanet atmospheres — primarily via transmission spectroscopy (measuring which wavelengths are absorbed as the planet transits its star) and emission spectroscopy (comparing the star's spectrum in and out of secondary eclipse) — is the primary method for characterising exoplanet atmospheres. JWST has detected water, carbon dioxide, sulphur dioxide, methane, and carbon monoxide in the atmospheres of hot Jupiters and warm Neptunes, and is beginning to characterise the atmospheres of super-Earths in the habitable zones of nearby M-dwarf stars. The ultimate goal — detecting biosignature gases (oxygen, ozone, methane, nitrous oxide in disequilibrium) in the atmosphere of a truly Earth-like exoplanet — may be decades away but is a driving motivation for next-generation telescope design."
  },
  {
    "id": "art-027",
    "slug": "pulsar-timing-arrays-gravitational-wave-background",
    "category": "gravitational-wave-astronomy",
    "title": "Pulsar Timing Arrays and the Gravitational Wave Background",
    "publishedAt": "2025-10-18",
    "readingMinutes": 7,
    "tags": [
      "pulsar timing array",
      "gravitational waves",
      "NANOGrav",
      "supermassive black holes",
      "nanohertz",
      "spacetime"
    ],
    "summary": "Millisecond pulsars — the natural atomic clocks of the Universe — are being used as an enormous gravitational wave detector spanning the entire galaxy. In 2023, multiple pulsar timing array consortia reported evidence for a gravitational wave background, likely from merging supermassive black hole binaries across cosmic history.",
    "body": "Millisecond pulsars are among the most extraordinary objects in the Universe. They are neutron stars — balls of nuclear-density matter roughly 10 km in diameter — that rotate hundreds of times per second with such mechanical regularity that they rival atomic clocks. PSR J0437–4715 was used to measure time so accurately that its pulse arrival time residuals are below 100 nanoseconds over years of observation. This extraordinary precision makes millisecond pulsars natural gravitational wave detectors of a type that no human-built instrument can replicate: the Pulsar Timing Array (PTA).\n\nThe principle is elegant. A passing gravitational wave slightly stretches and compresses spacetime as it propagates, altering the physical distances between objects. If the Earth–pulsar distance is slightly changed by a passing gravitational wave, the pulse arrival times will be shifted by a tiny amount — earlier if the wave briefly squeezes space in that direction, later if it stretches it. A gravitational wave background — a diffuse sea of gravitational waves from many sources superimposed — would introduce a correlated signature in the arrival times of all pulsars in a PTA, with a specific angular correlation pattern called the Hellings-Downs curve that distinguishes gravitational wave signals from noise. The PTA method is sensitive to gravitational waves at nanohertz frequencies (period of years to decades), complementary to LIGO's sensitivity at ~100 Hz and LISA's future sensitivity at millihertz frequencies.\n\nFour international PTA consortia — NANOGrav (North American Nanohertz Observatory for Gravitational Waves), the European Pulsar Timing Array (EPTA), the Parkes PTA (PPTA) in Australia, and CPTA (Chinese PTA) — combining their data into the International Pulsar Timing Array (IPTA), have monitored dozens of millisecond pulsars for up to 25 years. In June 2023, all four consortia simultaneously published papers announcing strong evidence for a gravitational wave background (GWB), consistent with the Hellings-Downs correlation at high significance. NANOGrav's 15-year data set reported a signal-to-noise ratio corresponding to roughly 3–4 sigma for the Hellings-Downs correlation; the combined IPTA signal was even more robust. This announcement marked the opening of a new frequency window in gravitational wave astronomy.\n\nWhat is the source of this gravitational wave background? The most favoured explanation is the ensemble of inspiralling supermassive black hole binary systems (SMBHBs) throughout the observable Universe — the inevitable products of galaxy mergers. When two massive galaxies collide and merge, their central SMBHs initially orbit each other at large separations (parsecs), losing energy to gravitational interactions with surrounding stars. Eventually they are expected to spiral together to sub-parsec separations and begin losing energy efficiently to gravitational wave emission, ultimately merging in an event releasing energy equivalent to millions of solar masses as gravitational radiation. The incoherent superposition of gravitational wave emission from billions of such binaries across cosmic history would produce a stochastic background at nanohertz frequencies. The spectrum and amplitude measured by the PTA consortia are broadly consistent with this picture, though with considerable uncertainty due to poorly constrained astrophysical parameters (binary mass functions, eccentricities, environmental effects on hardening).\n\nAlternative hypotheses have also been proposed. Cosmic string networks — predicted by some Grand Unified Theories and string cosmology models — would produce a GWB with a different spectral shape. First-order phase transitions in the early Universe could also generate a PTA-frequency background. More exotic proposals include primordial gravitational waves from inflation imprinted during the radiation-dominated era. The PTAs are beginning to probe these possibilities by careful spectral analysis and constraints on the Hellings-Downs correlation details.\n\nTwo key facilities are transforming PTA science. The MeerKAT radio telescope in South Africa — 64 dishes combining into a highly sensitive array — is monitoring a growing set of precisely timed pulsars with dramatically reduced timing noise. The Square Kilometre Array, part of whose construction is underway in South Africa (as SKA-Mid) and Australia (SKA-Low), will increase PTA sensitivity by orders of magnitude when its full array is operational in the early 2030s. The SKA-PTA programme aims to detect individual SMBHB systems at specific locations on the sky and begin gravitational wave astronomy with identified sources at nanohertz frequencies — analogous to what LIGO did with stellar-mass black holes at audio frequencies.\n\nThe detection of the gravitational wave background completes the opening of gravitational wave astronomy across the frequency spectrum, from nanohertz (PTA) through the future millihertz window (LISA, planned for launch in the 2030s) to the audio frequency range (LIGO, VIRGO, KAGRA, IndIGO). Together, these instruments allow us to listen to the Universe across a span of ten orders of magnitude in gravitational wave frequency — a richer 'sound spectrum' of the violent cosmos than anyone could have imagined when Einstein first predicted gravitational waves in 1916."
  },
  {
    "id": "art-028",
    "slug": "planetary-formation-theories",
    "category": "planetary-science",
    "title": "How Planets Form: From Protoplanetary Disc to Solar System",
    "publishedAt": "2025-11-01",
    "readingMinutes": 8,
    "tags": [
      "planet formation",
      "protoplanetary disc",
      "accretion",
      "core accretion",
      "disc instability",
      "ALMA",
      "debris disc"
    ],
    "summary": "Planets form in the disc of gas and dust surrounding a newborn star. The mechanisms by which dust grains coalesce into km-scale planetesimals, and planetesimals grow into planets, involve complex fluid dynamics, self-gravity, and chemistry that ALMA and JWST are now observing in unprecedented detail around young stars.",
    "body": "Every planet in our Solar System — and every one of the thousands of exoplanets detected to date — formed from the disc of gas and dust that surrounded its host star in the first few million years after stellar birth. The general picture of disc-based planet formation has been established for decades, but the details of how micron-sized dust grains bridge the enormous gap to kilometre-scale planetesimals — a growth of 9 orders of magnitude in size — remain one of the most active problems in planetary science.\n\nIn the core accretion model (the dominant paradigm for rocky and giant planet formation), the first step is the growth of dust grains through gentle sticking collisions. In quiescent regions of the disc, small particles can coagulate into aggregates up to millimetre or centimetre sizes. However, laboratory experiments and numerical simulations have identified several barriers to further growth. The 'radial drift barrier' arises because pebble-sized particles (roughly cm to dm) lose angular momentum as they interact with the slower-rotating pressure-supported gas and spiral inward toward the star on timescales of roughly a hundred orbits — shorter than the time needed to build planetesimals. The 'fragmentation barrier' means that collisions between larger pebbles are destructive rather than constructive.\n\nThe streaming instability, proposed by Youdin and Goodman in 2005 and confirmed by numerical simulations, may be the key to crossing these barriers. When the local density of solid particles in the disc midplane reaches a sufficient threshold, a clumping instability can set in, concentrating pebbles into localised high-density swarms that collapse gravitationally (with help from self-gravity and particle–particle friction) directly into km-scale or larger planetesimals. This process can occur rapidly — in hundreds of orbits — bypassing the problematic intermediary size regime. The observed sizes of Kuiper Belt Objects and main belt asteroids are consistent with having formed this way rather than through gradual incremental accretion.\n\nOnce km-scale planetesimals exist, gravity takes over. Runaway accretion allows the largest planetesimals to grow preferentially (their larger cross-sections attract more material), eventually producing a smaller number of Moon-to-Mars-mass 'planetary embryos.' These embryos undergo oligarchic growth in a disc with hundreds of bodies of comparable size, interacting gravitationally and accreting from their local feeding zones. In the final stage of terrestrial planet formation, perhaps tens to hundreds of embryos over millions to hundreds of millions of years undergo a chaotic phase of giant impacts — catastrophic collisions that merge embryos into the final small rocky planets.\n\nFor giant planet formation, the core accretion model proposes that a rocky/icy core of roughly 10 Earth masses forms rapidly (before the gas disc dissipates in 1–10 million years), then undergoes runaway gas accretion to build the gaseous envelope of a Jupiter or Saturn. The disc instability model, advocated by Alan Boss, proposes that fragments of the disc itself undergo direct gravitational collapse to form giant planets in a single rapid event — analogous to star formation in miniature. This model is invoked particularly for wide-orbit massive planets where core accretion timescales seem too slow.\n\nThe Atacama Large Millimetre/submillimetre Array (ALMA) has revolutionised the observational study of protoplanetary discs. Its millimetre-wave observations of thermal emission from dust grains have revealed gorgeous annular rings, gaps, spirals, and asymmetries in dozens of discs around nearby young stars. The HL Tauri disc image released in 2014 — showing concentric bright and dark rings sharp enough to suggest embedded planets — surprised astronomers: the star is only about 1 million years old, implying that planet formation begins very early in disc evolution. The rings are now interpreted as dust traps at the edges of gas pressure bumps created by planets clearing partial gaps — meaning planetary systems may begin forming within 1 million years of star birth.\n\nDebris discs — the cold, dusty remnants of planetesimal belts around older stars analogous to our Kuiper Belt — trace the late stages of planetary system architecture. Their morphology (gaps, warps, asymmetry, off-centre rings) is sensitive to the gravitational influence of unseen planets. The Fomalhaut star system's bright and sharp debris ring imaged by Hubble was originally attributed to a planet candidate, though this interpretation evolved as further data accumulated. The JWST is now imaging debris discs in reflected starlight and thermal emission with exquisite detail, supplementing ALMA's dust emission maps.\n\nThe Solar System's structure has been shaped by grand-scale dynamical events after initial formation. The Nice model (and its successors) proposes that the giant planets migrated significantly in the first few hundred million years — Jupiter moving inward slightly, Saturn, Uranus, and Neptune migrating outward into an initially compact configuration and then scattering each other. Neptune's outward migration swept resonances through the trans-Neptunian population, capturing Kuiper Belt Objects into mean-motion resonances with Neptune (Pluto and its Plutino cousins are in a 2:3 resonance) and scattering others. The timing of this orbital instability may correspond to the Late Heavy Bombardment, a period of intense crater-forming impacts recorded in lunar rocks and potentially important for the delivery of water and organics to the early Earth."
  },
  {
    "id": "art-029",
    "slug": "active-galactic-nuclei-quasars",
    "category": "galactic-astronomy",
    "title": "Quasars and Active Galactic Nuclei: The Universe's Most Powerful Engines",
    "publishedAt": "2025-11-19",
    "readingMinutes": 8,
    "tags": [
      "quasars",
      "active galactic nuclei",
      "AGN",
      "supermassive black holes",
      "jets",
      "Seyfert galaxies",
      "blazars"
    ],
    "summary": "At the centres of some galaxies, supermassive black holes are accreting so voraciously that they outshine billions of stars combined, driving relativistic jets and powerful winds that regulate the growth of galaxies. Quasars — the most luminous objects in the Universe — were once a deep mystery; they are now understood as active galactic nuclei viewed across cosmic distances.",
    "body": "In the late 1950s, radio surveys of the sky found numerous point-like radio sources catalogued under designations like 3C 48 and 3C 273. When optical counterparts were identified, they appeared as blue 'stars' with unusual spectra that could not be matched to any known atomic lines. In 1963, astrophysicist Maarten Schmidt, studying the spectrum of 3C 273, recognised that the strange spectral peaks were the familiar hydrogen Balmer lines — but redshifted by 15.8%. This meant 3C 273 was not a nearby star but an object receding at 15.8% of the speed of light, some 2.4 billion light-years away. At that distance, 3C 273 had to be emitting as much energy as an entire large galaxy — yet it appeared as a near-point source. 'Quasi-stellar radio source,' quickly abbreviated to quasar, entered the lexicon.\n\nQuasars are the most luminous sustained sources of energy in the Universe. The brightest known — like SDSS J0100+2802, discovered in 2015 — emit more than 400 trillion times the luminosity of the Sun (roughly 40,000 times the luminosity of the entire Milky Way) from a compact accretion disc smaller than our Solar System. The power source is gravitational: material falling through a disc onto a supermassive black hole releases up to ~10–40% of its rest-mass energy as radiation — far more efficient than nuclear fusion's ~0.7%. As gas spirals inward through the accretion disc, viscosity transfers angular momentum outward, causing the gas to spiral deeper. Closer to the black hole, temperatures rise to millions of Kelvin, emitting X-rays. The disc glows from UV through optical to infrared farther out. A corona of hot electrons inverse-Compton-scatters photons to X-ray energies.\n\nThe broader term 'active galactic nucleus' (AGN) encompasses the full variety of galaxies with unusually luminous, compact, variable nuclei powered by accreting supermassive black holes. AGN are classified into a zoo of types that were historically treated as distinct objects but are now understood largely as the same phenomenon viewed from different angles (AGN unification). Seyfert galaxies (type 1 showing broad and narrow emission lines, type 2 showing only narrow lines — the broad-line region obscured by a dusty torus) are nearby lower-luminosity AGN. BL Lac objects and optically violent variables (OVVs) — collectively 'blazars' — are AGN whose relativistic jets point almost directly at us, making them extraordinarily bright and rapidly variable. Radio galaxies are AGN with powerful radio jets viewed at broader angles.\n\nRelativistic jets — collimated beams of magnetised plasma accelerated to close to the speed of light and shooting tens to thousands of kiloparsecs into intergalactic space — are among the most spectacular phenomena in the Universe. In M87*, the SMBH famously imaged by the Event Horizon Telescope in 2019, a jet has been tracked extending beyond a kiloparsec in optical, radio, and X-ray light. The jet of Centaurus A (NGC 5128), the nearest radio galaxy, illuminates the surrounding intergalactic medium with stunning complex structure. The physical mechanism by which jets are launched is still debated; the leading models involve the extraction of rotational energy from the spinning black hole (the Blandford-Znajek process) and/or from the inner accretion disc (Blandford-Payne).\n\nAGN feedback — the injection of energy into the surrounding galaxy and intergalactic medium by AGN-driven winds and jets — plays a key role in galaxy evolution. Observations show that the masses of central black holes correlate tightly with galaxy bulge properties (the M–sigma relation, where sigma is the stellar velocity dispersion of the bulge), hinting at a co-evolutionary relationship. Simulations of galaxy formation require AGN feedback to prevent runaway star formation: without it, the most massive galaxies would be bluer, denser, and contain far more stars than observed. AGN winds can expel cold molecular gas from galaxies (quenching star formation) or thermally heat the hot ICM of galaxy clusters, preventing gas cooling and sustaining the 'red and dead' state of giant ellipticals. Understanding how black holes regulate the growth of entire galaxies — across 9 orders of magnitude in mass scale — is one of the deepest unsolved problems in extragalactic astronomy.\n\nThe highest-redshift quasars, now found at z > 7.5 (less than 700 million years after the Big Bang), pose a theoretical challenge: their black holes have masses exceeding 1–10 billion solar masses. Growing a black hole this large this quickly — through accretion that is Eddington-rate limited — requires either seeding the Universe with massive initial black holes (from Pop III stellar remnants or direct collapse black holes of ~10,000–100,000 solar masses forming in the first billion years) or sustained super-Eddington accretion. JWST is now finding AGN at even higher redshifts in significant numbers, and their mass functions are being measured for the first time — constraints that will test the most extreme seeding scenarios."
  },
  {
    "id": "art-030",
    "slug": "geophysics-plate-tectonics-connection-to-life",
    "category": "astrobiology",
    "title": "Plate Tectonics, Geochemical Cycles, and the Conditions for Life",
    "publishedAt": "2025-12-01",
    "readingMinutes": 8,
    "tags": [
      "plate tectonics",
      "carbon cycle",
      "habitability",
      "geophysics",
      "volcanism",
      "Wilson cycle",
      "astrobiology"
    ],
    "summary": "Earth's plate tectonics is not just geology — it is possibly the key process that has kept our planet habitable for billions of years by regulating the carbon dioxide cycle and recycling nutrients. Understanding why Earth has plate tectonics and whether other planets do, is central to assessing the prevalence of complex life.",
    "body": "Earth is the only planet in the Solar System — and, as far as we know, in the Universe — with confirmed active plate tectonics. The outer shell of our planet (the lithosphere, comprising the crust and the rigid upper mantle) is broken into seven major and many smaller tectonic plates that glide over the convecting asthenosphere (partially molten upper mantle) at rates of centimetres per year. At divergent boundaries, plates move apart and new oceanic crust is created at mid-ocean ridges; at convergent boundaries, oceanic plates are subducted back into the mantle; at transform boundaries, plates slide past each other. The cycle of creation and destruction of oceanic crust — the Wilson cycle — takes roughly 200–300 million years per 'lap.'\n\nThe connection between plate tectonics and planetary habitability operates through the carbon-silicate cycle. In the atmosphere, CO₂ dissolves in rainwater to form carbonic acid, which weathers silicate rocks at Earth's surface, producing bicarbonate ions washed into the ocean. Calcium carbonate (CaCO₃) is precipitated by marine organisms (and inorganically) and accumulates in seafloor sediments. Subduction carries these carbonate sediments and altered oceanic crust back into the hot mantle, where CO₂ is liberated and returned to the atmosphere via volcanic outgassing — primarily at arcs like the Cascades, Andes, and Hadean-era volcanic chains. This geological carbon cycle acts as a thermostat: if Earth warms, rock weathering accelerates (warm moist conditions weather rocks faster), drawing down more CO₂ and cooling the planet; if Earth cools and glaciates, weathering slows, CO₂ builds up from volcanism, and warming resumes. This feedback has operated for at least 4 billion years, keeping Earth habitable across a wide range of solar luminosity (the Sun was ~70% as luminous 4 billion years ago as today) and across the episodic 'Snowball Earth' glaciations of the Cryogenian period (~720–635 Ma).\n\nWithout plate tectonics, this carbon thermostat does not operate in the same way. Venus — roughly Earth-sized, rocky, at a not-dramatically-different orbital distance — has no plate tectonics (it has episodic 'lid overturn' events instead) and has experienced a runaway greenhouse effect: its CO₂-dominated atmosphere sustains a surface temperature of 465°C, hot enough to melt lead. Mars, smaller and further from the Sun, lost its plate tectonics (if it ever had them) early in its history and also lacks the geochemical recycling that has kept Earth's climate regulated. Whether a planet with the right size and orbital distance but no plate tectonics could maintain long-term habitability through other mechanisms (stagnant-lid volcanism might provide some recycling) is debated in the geophysics and astrobiology communities.\n\nPlate tectonics also drives the biological carbon cycle indirectly. Subduction and volcanism create diverse environments: deep-sea hydrothermal vents (possibly where life originated), arc volcanoes, and mid-ocean ridges all provide chemical energy and mineral surfaces. The collision of continents builds mountain ranges (the Himalayas from the India-Asia collision) whose rapid erosion drives high weathering rates and increased ocean productivity as nutrients are flushed into the sea. The breakup of continents creates new shallow shoreline habitats where evolutionary diversification is enhanced and new biological inventions can evolve.\n\nThe 'rare Earth' hypothesis, popularised by Peter Ward and Joe Kirschvink, argues that Earth's specific combination of plate tectonics, large moon (stabilising obliquity), giant planet protectors (Jupiter deflecting comets), orbital stability, and geochemical properties has been unusually fortuitous — implying that Earth-like biospheres are rare. The counter-argument (advocated by David Grinspoon and others) is that life is robust and adaptive; once established, it self-regulates and maintains planetary conditions through the Gaia-like feedbacks embedded in the carbon cycle and other geochemical loops. Most planetary scientists now believe that plate tectonics is not a universal requirement for life, but it almost certainly significantly extends planetary habitability timescales.\n\nPresent-day geodynamics is increasingly studied with tools beyond seismology and geology: exoplanet interior modellers are developing 'two-phase lid' and 'heat pipe' tectonics models for super-Earths of different water contents, iron fractions, and orbital forcing. The key question — does a 4-Earth-mass super-Earth with plenty of water necessarily develop plate tectonics? — is unresolved. The answer will fundamentally affect estimates of the fraction of Earth-like exoplanets that maintain geochemical cycles long enough for complex life to evolve."
  }
];







const COSMOS_ARTICLES_BATCH5 = [
  {
    "id": "art-031",
    "slug": "space-telescopes-history",
    "category": "astronomy",
    "title": "Space Telescopes: Opening New Windows on the Universe",
    "publishedAt": "2026-01-10",
    "readingMinutes": 9,
    "tags": [
      "space telescope",
      "Compton",
      "Chandra",
      "Spitzer",
      "Fermi",
      "Euclid",
      "Roman telescope"
    ],
    "summary": "Earth's atmosphere blocks most of the electromagnetic spectrum, from X-rays to infrared. A fleet of space-based observatories has opened these hidden windows, revealing extraordinary phenomena from supernova remnants in X-rays to galaxy evolution in the infrared and mapping dark energy across the Universe.",
    "body": "The electromagnetic spectrum spans an enormous range of wavelengths and energies, from kilometre-long radio waves through microwaves, infrared, visible light, ultraviolet, X-rays, and gamma rays. Our sense of the cosmos was long limited to the thin optical window visible to human eyes and, from the 1930s onward, the radio window. The development of space astronomy opened the rest of the spectrum, and each new window has produced stunning surprises — confirming the principle that whenever astronomers look at the Universe in a new way, they find something unexpected.\n\nUltraviolet astronomy probes hot young stars, shock-heated plasma, and the circumgalactic medium. The International Ultraviolet Explorer (IUE, 1978–1996) made over 100,000 UV observations. The Hubble Space Telescope covers the near- and far-UV, while the GALEX (Galaxy Evolution Explorer, 2003–2013) surveyed the sky in UV, mapping star formation in nearby galaxies. UV observations of quasar spectra through the intergalactic medium reveal the Lyman-alpha forest of absorption lines from intervening hydrogen — a powerful probe of large-scale structure.\n\nX-ray astronomy began with the serendipitous detection of an X-ray source in Scorpius (Sco X-1) during a rocket flight in 1962, an effort led by Riccardo Giacconi who received the Nobel Prize in 2002. The UHURU satellite (1970) catalogued 339 X-ray sources. The Einstein Observatory (1978) produced the first true X-ray images of individual sources. Chandra X-ray Observatory, launched in 1999, has been NASA's flagship X-ray telescope with sub-arcsecond imaging resolution — equivalent to reading a newspaper 800 metres away. Chandra has imaged spectacular X-ray rings in supernova remnants, detected million-degree plasma in clusters, resolved the X-ray emission of thousands of AGN, and mapped the hot intracluster medium in collisions like the Bullet Cluster — where the separation of hot gas (traced in X-rays) from the mass distribution (traced by gravitational lensing) provided compelling evidence that dark matter does not interact electromagnetically. ESA's XMM-Newton provides complementary X-ray spectroscopy with a larger collecting area. The next generation — ESA's Athena mission and the Chinese HUBS facility — will combine high spectral resolution with large collecting area for 'X-ray astrophysics of the whole Universe.'\n\nGamma-ray astronomy detects the highest-energy photons. The Compton Gamma Ray Observatory (CGRO, 1991–2000) made groundbreaking discoveries including confirming that gamma-ray bursts (GRBs) are cosmological (originating at galaxy distances) and discovering the isotropic sky distribution that ruled out a galactic disc population. NASA's Fermi Gamma-ray Space Telescope (launched 2008) has surveyed the gamma-ray sky with unprecedented detail: its Large Area Telescope (LAT) has detected over 6,000 sources including pulsars, blazars, SNRs, and diffuse galactic emission from cosmic ray interactions. The mystery of the 'Fermi Bubbles' — two enormous lobes of gamma-ray and X-ray emission extending 25,000 light-years above and below the Milky Way's centre, likely the remnant of a past episode of AGN activity or concentrated star formation in Sgr A*'s vicinity — was one of Fermi's most startling findings.\n\nInfrared astronomy requires detectors cooled to cryogenic temperatures to suppress thermal background noise. IRAS (1983) conducted the first all-sky infrared survey. Spitzer Space Telescope (2003–2020, last 11 years as the 'Warm Spitzer' after its helium coolant expired) imaged star formation in molecular clouds, measured the sizes of minor planets, characterised exoplanet atmospheres in thermal emission, and surveyed the distant infrared universe. The Herschel Space Observatory (2009–2013) performed far-infrared and submillimetre observations of star-forming regions and galaxy evolution, finding that much of cosmic star formation history is hidden behind dust that absorbs UV light and re-emits it in the infrared. JWST, with its 6.5-metre mirror operating from 0.6 to 28 microns while cooled to below 50 K, is the successor to all of these — combining Hubble's precision with Spitzer's infrared reach and adding extraordinary new capability.\n\nESA's Euclid mission (launched 2023) is a wide-field optical and near-infrared survey telescope designed to map the geometry of the dark Universe — measuring the distribution of galaxies and their correlations over one-third of the sky to trace the growth of cosmic structure and constrain dark energy and dark matter properties. NASA's Nancy Grace Roman Space Telescope (planned for launch in the late 2020s) will survey 100 times more sky per year than Hubble in the near-infrared, performing microlensing surveys to find thousands of new exoplanets, imaging the cosmic web, and constraining dark energy via Type Ia supernovae and weak lensing. The Vera C. Rubin Observatory (LSST, first light 2025) from the ground will complement these space missions with a 10-year time-domain survey of the entire visible southern sky every few nights, discovering millions of variable stars, transients, and moving Solar System objects.\n\nThe future of space astronomy includes proposed missions at the far extremes: the Laser Interferometer Space Antenna (LISA) for millihertz gravitational waves (2035+), the Lynx X-ray Observatory as a proposed NASA Flagship, the Origins Space Telescope for far-infrared, and concepts for UV/optical/IR observatories with 6-metre or larger mirrors for exoplanet imaging and characterisation. Each new telescope will open not just a window but a door to phenomena not yet imagined."
  },
  {
    "id": "art-032",
    "slug": "astrobiology-life-chemistry",
    "category": "astrobiology",
    "title": "Astrobiology: The Science of Life in the Universe",
    "publishedAt": "2026-02-01",
    "readingMinutes": 9,
    "tags": [
      "astrobiology",
      "origin of life",
      "panspermia",
      "extremophiles",
      "biosignatures",
      "habitable zone",
      "RNA world"
    ],
    "summary": "Astrobiology seeks to understand the origin, evolution, and distribution of life in the Universe. It draws on biology, chemistry, geology, and astronomy to ask how life begins, what conditions it requires, how it can be detected on other worlds, and whether it has emerged more than once in our cosmic neighbourhood.",
    "body": "Astrobiology is the scientific study of the origin, evolution, distribution, and future of life in the Universe. It is a uniquely interdisciplinary science, traversing microbial biology, organic chemistry, planetary geophysics, stellar astrophysics, and the detection technology of space missions. At its heart lies the most profound question in science: are we alone?\n\nThe origin of life on Earth is still not fully understood, but remarkable progress has been made in the past three decades. The classic view of a primordial 'warm little pond' (Darwin's phrase) in which organic molecules concentrated and self-assembled into the first replicating molecules has been refined and challenged. The RNA world hypothesis — proposing that RNA (ribonucleic acid) served as both the carrier of genetic information and the first enzyme before DNA and protein took over their respective specialised roles — is supported by the discovery of ribozymes (catalytic RNA molecules) and by experiments showing that activated ribonucleotides can spontaneously form RNA strands on mineral surfaces under plausible prebiotic conditions. John Sutherland and colleagues at the MRC Laboratory of Molecular Biology have demonstrated that cyanide, hydrogen sulphide, and water under ultraviolet irradiation can produce the precursors of RNA, amino acids, and cell membranes in a single coherent chemistry — narrowing the prebiotic chemistry space.\n\nAn alternative site for life's origin is deep-sea hydrothermal vents, particularly the hydrogen-venting alkaline white smokers like the Lost City field in the Atlantic. These systems produce continuous chemical disequilibrium (hydrogen and carbon dioxide percolate through porous mineral columns) without the destructive high temperatures of black smokers. Michael Russell and colleagues have proposed a compelling model in which metabolism (the conversion of redox energy into chemical work) preceded and drove the assembly of genetic molecules, with inorganic iron-sulphur minerals in vent chimneys serving as catalysts and compartment walls — mimicking the role of cell membranes.\n\nOnce life existed on Earth, extremophiles demonstrate its extraordinary resilience. Deinococcus radiodurans can withstand radiation doses of 1.5 million rads (humans die at ~1,000 rads) by rapidly repairing its genome using multiple sequence copies. Tardigrades (water bears) survive the vacuum and radiation of space, extreme desiccation, and temperatures from -272°C to 150°C. Thermophiles thrive at 121°C in hydrothermal systems; psychrophiles live in Antarctic sea ice at -20°C. Halophiles flourish in hypersaline environments like the Dead Sea. This physiological diversity suggests that life, once established, can colonise almost any liquid-water environment. The implication for astrobiology is that the habitable zone for microbial life — the range of environmental conditions it can exploit — is extremely broad.\n\nThe habitable zone concept (the range of orbital distances where liquid water can exist on a planetary surface, sometimes called the Goldilocks Zone) is a first approximation for assessing exoplanet habitability. The empirical inner habitable zone boundary corresponds to Venus's orbit (though Venus itself is uninhabitable today); the outer boundary is around Mars's orbit for a Sun-like star. Tidal heating can extend habitability far beyond the classical zone (Europa, Enceladus). Eccentric orbits, planetary mass, atmospheric composition, surface albedo, and internal heating all significantly modify the effective habitable zone. Sophisticated climate models now consider a wide parameter space.\n\nBiosignature detection — the search for chemical or physical evidence of life on another world — is the observational frontier of astrobiology. Atmospheric biosignatures (gases produced by metabolism that are out of chemical equilibrium with abiotic processes) include oxygen/ozone (produced by photosynthesis), methane (produced by methanogenic archaea and other microbial anaerobes), nitrous oxide (denitrification), and dimethyl sulphide (marine biology). The key challenge in JWST and future telescope observations of exoplanet atmospheres is not just detecting these gases but ruling out abiotic explanations: O₂ can be produced abiotically by photodissociation of water on dry rocky planets; methane plus CO₂ is a more specific combination that would be hard to sustain without biological production.\n\nPanspermia — the hypothesis that life (or its chemical precursors, lithopanspermia) can transfer between planetary bodies on impact ejecta — gained scientific respectability with the discovery that viable microbes can survive inside meteorites (the demonstrated ability of Bacillus subtilis spores to survive multi-year vacuum and UV exposure) and that rocks can be transferred between Mars and Earth on timescales of millions of years. The detection of amino acids, nucleobases, and sugars (including ribose) in meteorites provides evidence that organic chemistry precedes life, though the 2020 discovery of phosphine in Venus's atmosphere — claimed as a potential biosignature — was later shown to likely result from poorly characterised sulphur chemistry, illustrating the difficulty of ruling out abiotic alternatives. The search for life in our Solar System focuses on Mars (ancient biosignatures in Jezero Crater rocks), Enceladus (in-plume organic chemistry), and Europa (direct sampling of the ocean via a lander), while JWST begins the first statistical survey of potentially habitable exoplanet atmospheres."
  },
  {
    "id": "art-033",
    "slug": "nuclear-fusion-stellar-energy",
    "category": "stellar-astronomy",
    "title": "Nuclear Fusion in Stars: The Engines of the Cosmos",
    "publishedAt": "2026-03-01",
    "readingMinutes": 8,
    "tags": [
      "nuclear fusion",
      "proton-proton chain",
      "CNO cycle",
      "stellar nucleosynthesis",
      "helium burning",
      "r-process",
      "s-process"
    ],
    "summary": "Stars shine because their cores are thermonuclear reactors, fusing hydrogen into helium and building progressively heavier elements. Understanding stellar nucleosynthesis — how every atom heavier than beryllium was forged — is one of the great triumphs of 20th century astrophysics.",
    "body": "The source of stellar energy was one of geology and physics's longest-standing mysteries. In the 19th century, Lord Kelvin and Hermann von Helmholtz proposed that the Sun shines by gravitational contraction — a plausible mechanism but one that could sustain solar luminosity for only about 20 million years. Geologists and biologists needed hundreds of millions to billions of years for the geological record and evolution; the physicist's Sun was uncomfortably young. The puzzle was resolved only in the late 1930s when Hans Bethe and Carl Friedrich von Weizsäcker, independently, identified nuclear fusion as the stellar power source. Bethe received the Nobel Prize in 1967 and lived to see the neutrino detections that confirmed every detail of the solar core model.\n\nIn the Sun and stars of similar or lower mass on the main sequence, the dominant energy source is the proton-proton (pp) chain. The fundamental reaction converts four protons (hydrogen nuclei) into one helium-4 nucleus (alpha particle), two positrons, two electron neutrinos, and energy: 4p → ⁴He + 2e⁺ + 2νe + 26.73 MeV. The neutrinos escape the core at the speed of light, while the thermal energy is transported outward by radiation (in the radiative zone) and convection (in the convective zone). The pp chain has several branches (ppI, ppII, ppIII); in the Sun, the ppI branch (producing ⁴He from two deuterium nuclei) dominates. The rate of pp fusion is very temperature-sensitive but not dramatically so (power scales as T⁴), which is why the Sun burns stably for billions of years.\n\nIn more massive stars (roughly above 1.3 solar masses), the core temperature is higher and the CNO (carbon-nitrogen-oxygen) cycle dominates. In this cycle, carbon, nitrogen, and oxygen act as catalysts: ¹²C + p → ¹³N + γ; ¹³N → ¹³C + e⁺ + ν; ¹³C + p → ¹⁴N + γ; ¹⁴N + p → ¹⁵O + γ; ¹⁵O → ¹⁵N + e⁺ + ν; ¹⁵N + p → ¹²C + ⁴He. The net result is the same — four protons become one helium nucleus — but the CNO cycle is strongly temperature-sensitive (power ∝ T¹⁸) and operates only at temperatures above ~15 million K. More massive stars burn hotter and faster; a 15-solar-mass star burns for only 10 million years compared to the Sun's 10 billion.\n\nWhen a star's core hydrogen is exhausted, it contracts and heats until helium can be fused — the triple alpha process: three ⁴He nuclei fuse to form ¹²C in two steps (two helium nuclei first form an unstable ⁸Be isotope in equilibrium, then a third ⁴He fuses with the ⁸Be before it decays). The existence of this reaction depends on a remarkable nuclear coincidence: the ¹²C nucleus has an excited state ('Hoyle state') at exactly the right energy to resonantly enhance the triple-alpha rate to astrophysically relevant rates. Fred Hoyle predicted this nuclear state in 1953 purely from the argument that carbon must have been made in stars — a famous example of anthropic reasoning leading to a real nuclear physics prediction, confirmed in the laboratory the following year.\n\nIn successive stages, massive stars fuse heavier elements in the 'onion shell' structure of a pre-supernova star: carbon burning (T ~ 5 × 10⁸ K) produces ²⁰Ne and ²³Na; neon burning (photodisintegration releases α particles that react with neon); oxygen burning (T ~ 2 × 10⁹ K) produces ²⁸Si and ³²S; silicon burning (T ~ 3 × 10⁹ K) is a statistical equilibrium of nuclear reactions producing the iron-peak elements. Iron (⁵⁶Fe) has the highest binding energy per nucleon — it is the most tightly bound nucleus. Fusing iron or splitting it both require energy rather than releasing it. When the iron core reaches ~1.4 solar masses (the Chandrasekhar mass), electron degeneracy pressure can no longer support it and the core collapses in milliseconds, triggering a core-collapse supernova.\n\nElements heavier than iron are produced by neutron capture. The slow s-process ('s' for slow) operates in AGB stars (asymptotic giant branch stars, in the thermally pulsing phase near the end of a low-to-intermediate mass star's life): thermal pulses drive convection that mixes fresh ¹²C and neutrons (from reactions like ¹³C + ⁴He → ¹⁶O + n) into neutron-rich conditions where nuclei slowly capture neutrons, building up elements from iron to bismuth along the valley of stability. The rapid r-process ('r' for rapid) requires a neutron flux so intense that nuclei capture neutrons faster than they can beta-decay. The primary site is now identified as neutron star mergers — confirmed by the detection of kilonovae (multi-wavelength transients) associated with gravitational wave events, particularly GW170817 in August 2017. The kilonova observation showed spectroscopic evidence for strontium (an r-process element) in the expanding ejecta. Gold, platinum, uranium — you are wearing atoms forged in neutron star collisions billions of years ago."
  },
  {
    "id": "art-034",
    "slug": "multiverse-theories-anthropic-principle",
    "category": "cosmology",
    "title": "The Multiverse and the Anthropic Principle: Are We in a Special Universe?",
    "publishedAt": "2026-04-01",
    "readingMinutes": 8,
    "tags": [
      "multiverse",
      "anthropic principle",
      "string theory landscape",
      "inflation",
      "fine tuning",
      "parallel universes"
    ],
    "summary": "The fundamental constants of nature — the electron mass, the strength of gravity, the cosmological constant — appear to be fine-tuned for life to exist. Some physicists argue this is evidence for a multiverse of universes with varying constants; others see it as a clue to a deeper theory yet to be discovered.",
    "body": "One of the most profound and contested questions in modern physics concerns the values of the fundamental constants of nature: the gravitational constant G, the speed of light c, Planck's constant ℏ, the electron mass, the masses of quarks, the strengths of the four fundamental forces. The remarkable thing is that if any of these constants were even slightly different, the Universe would be sterile — no atoms, no chemistry, no stars, no life. This apparent fine-tuning has inspired both deep scientific thinking and intense philosophical and religious debate.\n\nConsider a few examples. The cosmological constant Λ — Einstein's term representing the energy density of the vacuum, which drives the accelerating expansion of the Universe — has a measured value of approximately 10⁻¹²³ in natural (Planck) units. The 'natural' value predicted by quantum field theory — the energy of zero-point fluctuations of all quantum fields — is of order 1. The discrepancy is 120 orders of magnitude, the most spectacular fine-tuning problem in all of physics (sometimes called the 'worst prediction in physics'). Yet if Λ were even 100 times larger than its actual value, the Universe would have expanded so rapidly that matter could never have clumped into structures like galaxies. If it were large and negative, the Universe would have recollapsed in a Big Crunch before stars formed.\n\nThe strong nuclear force strength determines whether carbon-12 can be stably synthesised in stars (as Hoyle's resonance example illustrates). The electromagnetic force governs atomic structure and chemistry. The mass difference between the up and down quarks determines the stability of hydrogen relative to neutrons and hence the primordial hydrogen–helium ratio. Each constant seems to be adjusted to permitting complex chemistry and stable stellar lifetimes.\n\nPhilosopher anthropic reasoning addresses this by distinguishing the weak and strong anthropic principles. The Weak Anthropic Principle (WAP) states simply that the observed values of physical constants must be compatible with the existence of observers, because observers are what is doing the observing. If a constant's value precluded observers, no observer would be there to measure that value — a tautology, but a useful one for setting selection effects in certain contexts. Brandon Carter, who coined the term in 1973, used it to argue that the age of the Universe and hence the stage of stellar evolution at which observers can exist is biologically constrained rather than arbitrary.\n\nThe Strong Anthropic Principle (SAP), in various formulations, makes the more contentious claim that the Universe or its physical laws are constrained to permit or even require the development of life. This has been criticised as circular reasoning or as unfalsifiable.\n\nThe multiverse provides a naturalness-preserving solution: if there exist an enormous (perhaps infinite) number of universes, each with different values of the physical constants — perhaps sampling the 'landscape' of possibilities in string theory, or corresponding to different regions of an eternally inflating spacetime with different spontaneously broken vacuum states — then the subset of universes in which observers arise is precisely the subset in which the constants lie in the life-permitting range. We observe a life-permitting universe because we could not have arisen in any other. This reasoning — 'observer selection effect' or 'Anthropic bias' — appears to explain the fine-tuning without invoking a designer, at the cost of introducing an unobservable ensemble of universes.\n\nString theory's 'landscape' — the enormous space of possible vacuum states in ten-dimensional string theory, estimated at 10^500 or more distinct vacua — can provide the ensemble required for the multiverse scenario. Leonard Susskind's 'anthropic landscape' and Linde's 'eternal inflation' (in which inflation continues indefinitely in most of space, producing a 'bubble multiverse' of separately inflating and thermalising pocket universes with different physical constants) have been proposed as the mechanism.\n\nThe multiverse hypothesis is deeply controversial. Its critics note that it is, by construction, empirically unverifiable: other universes cannot be observed even in principle. Some invoke Karl Popper's criterion of falsifiability to dismiss it as unscientific — though defenders argue that theories don't need to be directly falsifiable if they are part of a broader framework with testable consequences. Others argue that the fine-tuning problem is not as severe as it appears — that a theory of everything will constrain the constants far more than we imagine, eliminating the need for any anthropic selection.\n\nPerhaps the most honest summary is that the multiverse is a legitimate and mathematically coherent scientific proposal with deep roots in inflation and string theory, but that its empirical content is extremely limited. It may be the correct answer to the fine-tuning question, or the fine-tuning may be dissolved by a future theory of fundamental physics — a deeper theory in which the apparent arbitrariness of current constants is no more mysterious than the specific chemistry of planet Earth. Distinguishing between these possibilities is one of the deepest challenges of 21st century fundamental physics."
  },
  {
    "id": "art-035",
    "slug": "time-space-relativity-cosmology",
    "category": "physics",
    "title": "Relativity and Spacetime: Einstein's Revolution",
    "publishedAt": "2026-05-01",
    "readingMinutes": 9,
    "tags": [
      "special relativity",
      "general relativity",
      "spacetime",
      "time dilation",
      "black holes",
      "Einstein",
      "GPS"
    ],
    "summary": "Einstein's two theories of relativity — special (1905) and general (1915) — overthrew Newtonian concepts of absolute space and time and replaced them with a four-dimensional spacetime whose geometry is curved by mass and energy. They are the foundational framework for all modern cosmology and predict phenomena confirmed to extraordinary precision.",
    "body": "In June 1905, a 26-year-old patent clerk in the Swiss Patent Office published his first paper on the special theory of relativity. He was Albert Einstein, and the paper — 'On the Electrodynamics of Moving Bodies' — overturned the Newtonian conception of space and time that had stood unchallenged for over two centuries. A century later, GPS satellites require relativistic corrections to maintain the metre-level accuracy that enables navigation, gravitational wave detectors have confirmed the most extreme predictions of the theory, and cosmologists use general relativity to model the evolution of the Universe from its first microseconds.\n\nSpecial relativity arose from a conceptual puzzle: the equations of electromagnetism (Maxwell's equations, 1865) predict that electromagnetic waves — including light — travel at a fixed speed c ≈ 299,792,458 m/s regardless of the motion of the source or observer. Classical Newtonian mechanics, in contrast, predicts that velocities add: if a train moves at v₁ and a person on the train walks at v₂, their speed relative to the ground is v₁ + v₂. The Michelson-Morley interferometer experiment of 1887 failed to detect any change in the speed of light despite the Earth's motion through the hypothetical 'luminiferous aether' — the medium in which light was supposed to propagate. Einstein took Maxwell's equations at face value and reformulated mechanics to be consistent with a constant speed of light for all inertial observers.\n\nThe consequences are radical. Time dilation: moving clocks run slow by the Lorentz factor γ = 1/√(1-v²/c²). At v = 0.87c, γ = 2 and a moving clock ticks at half the rate of a stationary one. Length contraction: a moving object is shorter along its direction of motion by factor 1/γ. Relativity of simultaneity: two events simultaneous for one observer may occur at different times for an observer in relative motion. Mass-energy equivalence: E = mc², the most famous equation in physics, stating that mass is a form of energy. These are not merely theoretical; they are measured daily in particle accelerators (where energised protons have relativistic masses millions of times their rest mass), in the lifetimes of muons created by cosmic rays in the atmosphere (muons reach sea level only because time dilation extends their 2.2-microsecond lifetime by a factor of many), and in the precise timing of GPS satellites (which must correct for both special and general relativistic time effects to avoid accumulating positional errors of kilometres per day).\n\nGeneral relativity (GR), completed in 1915, extended these ideas to acceleration and gravity. Einstein's key insight — the equivalence principle — is that gravitational acceleration and inertial acceleration are locally indistinguishable: a person in a box cannot tell whether they are standing on Earth in a gravitational field or accelerating through empty space in a rocket. This led him to the radical conclusion that gravity is not a force in the Newtonian sense but the curvature of spacetime caused by mass and energy. Free-falling objects follow geodesics — the straightest possible paths — in curved spacetime, and what we perceive as gravitational attraction is simply the curvature of spacetime directing objects toward masses.\n\nThe mathematics of GR is the tensor calculus of Riemannian geometry. Einstein's field equations Gμν = 8πG/c⁴ Tμν relate the Einstein tensor (describing spacetime curvature) to the stress-energy tensor (describing the distribution of mass-energy and momentum). These 10 non-linear coupled partial differential equations are notoriously difficult to solve in general, but exact solutions exist for special cases: the Schwarzschild solution (for a spherical non-rotating mass, predicting black holes), the Kerr solution (for a rotating black hole), the Friedmann-Lemaître-Robertson-Walker metric (for a homogeneous, isotropic expanding Universe). Approximate solutions via perturbation theory predict gravitational wave emission from accelerating masses.\n\nGR predictions confirmed to high precision include: the precession of Mercury's perihelion (which classical gravity failed to fully explain, a discrepancy of 43 arcseconds per century explained exactly by GR); the bending of light around massive objects — observed in the famous 1919 Eddington eclipse expedition and now routinely used in gravitational lensing to map dark matter; gravitational redshift of light climbing out of a gravitational potential well (measured in the Pound-Rebka experiment of 1959 with gamma rays in a building); and gravitational time dilation confirmed by precise atomic clocks flown in aircraft and by GPS systems. The detection of gravitational waves by LIGO in 2015 confirmed the most dramatic and long-sought prediction, opening a new era of gravitational wave astronomy.\n\nGR also underpins modern cosmology. The expanding Universe described by Hubble's observations follows naturally from the Friedmann equations derived from GR (with or without the cosmological constant). Big Bang nucleosynthesis, the CMB, dark energy — all require GR for their theoretical treatment. However, GR is incompatible with quantum mechanics at the fundamental level: it breaks down inside black hole singularities and at the Planck scale (10⁻³⁵ m) where quantum gravity effects should dominate. Developing a successful theory of quantum gravity — string theory and loop quantum gravity being the leading contenders — remains one of the central unsolved problems of 21st century theoretical physics."
  }
];






const COSMOS_ARTICLES_BATCH6 = [
  {
    "id": "art-036",
    "slug": "radio-astronomy-invisible-universe",
    "category": "astronomy",
    "title": "Radio Astronomy: Mapping the Invisible Universe",
    "publishedAt": "2026-06-01",
    "readingMinutes": 8,
    "tags": [
      "radio astronomy",
      "Jansky",
      "pulsars",
      "21-cm line",
      "radio galaxies",
      "VLBI",
      "fast radio bursts"
    ],
    "summary": "Radio astronomy opened a vast, invisible window on the Universe in the 1930s, revealing pulsars, the cosmic microwave background, supermassive jets, and the mysterious fast radio bursts. The technique of very long baseline interferometry has produced the sharpest images in all of astronomy, including the first images of black hole shadows.",
    "body": "On a January day in 1932, Karl Jansky, a young engineer at Bell Telephone Laboratories, was attempting to identify sources of radio static that might interfere with transatlantic telephone communications. He built a large rotating radio antenna (nicknamed 'Jansky's merry-go-round') and catalogued three types of static: nearby thunderstorms, distant storms, and a faint, steady hiss with a periodicity of about 23 hours 56 minutes — a sidereal day, the rotation period of the Earth relative to the fixed stars rather than the Sun. Jansky concluded that this signal came from the centre of the Milky Way, and with this discovery, accidental as it was, radio astronomy was born.\n\nJansky's discovery attracted little attention from professional astronomers. It was Grote Reber, an amateur radio engineer in Illinois, who built a 9.4-metre parabolic dish in his backyard in 1937 and spent years mapping the radio sky, confirming Jansky's discovery and mapping the galactic plane at increasing resolution. Only in the late 1940s and 1950s did radio astronomy become a major professional science, particularly in Australia (where wartime radar technology was adapted), the Netherlands, and the UK. The Cambridge catalogues (1C, 2C, 3C) of radio sources, compiled by Martin Ryle's group, laid the foundations for the detection of radio galaxies and quasars.\n\nThe most powerful technique in radio astronomy — and the one that has produced the highest-resolution images in all of astronomy — is Very Long Baseline Interferometry (VLBI). In VLBI, radio telescopes separated by thousands or even tens of thousands of kilometres observe the same source simultaneously, recording the radio signals with precise time stamps from atomic clocks. The signals are then correlated in a computer to produce an effective 'virtual telescope' with an aperture equal to the separation between the most widely spaced telescopes. Earth-spanning VLBI achieves angular resolutions of a few tens of microarcseconds — equivalent to resolving a human hair from 16,000 kilometres away. The Event Horizon Telescope (EHT), a global VLBI array at 1.3 mm wavelength, produced the first image of a black hole's shadow: M87*'s ring-like emission in April 2019, and Sagittarius A* in May 2022.\n\nThe 21-cm spectral line of neutral hydrogen — arising from the hyperfine transition in which the electron spin flips from parallel to anti-parallel with the proton spin — is one of the most scientifically productive spectral lines in all of astronomy. Predicted by Hendrik van de Hulst in 1944 and first detected in 1951, it allows astronomers to map the distribution of neutral hydrogen throughout the Milky Way and other galaxies regardless of dust obscuration (which blocks visible light). HI 21-cm surveys have traced the spiral structure of the Milky Way, revealed warped and extended HI discs in other galaxies, and discovered intergalactic streams of gas between colliding galaxy systems. At cosmological distances, the redshifted 21-cm emission is being used to probe the Epoch of Reionisation and the cosmic Dark Ages — the ultimate frontier of radio cosmological surveys.\n\nPulsars were discovered by Jocelyn Bell Burnell and Antony Hewish in 1967 as a regular repeating radio pulse with a period of 1.3373 seconds. Initially nicknamed LGM-1 (for 'Little Green Men'), the periodicity was quickly attributed to a rapidly rotating neutron star — the collapsed core of a massive star after a supernova — where a beam of radio emission sweeps past Earth like a cosmic lighthouse. Over 3,000 pulsars are now known; binary pulsars (including the Hulse-Taylor binary pulsar PSR B1913+16) provided the first indirect evidence for gravitational wave emission when the orbital decay matched GR predictions. Millisecond pulsars, spun up by accretion from a binary companion, rotate hundreds of times per second and serve as the astronomical 'clocks' used in pulsar timing arrays.\n\nFast Radio Bursts (FRBs) are millisecond-duration bursts of radio waves of unknown origin, first detected by Duncan Lorimer in 2007 in archival data from the Parkes telescope. They arrive from random directions across the sky and show dispersion (lower frequencies arriving slightly later than higher frequencies, due to the delay imposed by free electrons along the line of sight) indicating they travel through cosmological distances of billions of light-years. Most FRBs appear to be one-off events; a small fraction repeat, providing the most secure localisations and host galaxy identifications. In 2020, a strong FRB-like event was detected from a known magnetar (SGR 1935+2154) within our own galaxy, establishing magnetars as at least one FRB source. The CHIME telescope in Canada, with its large field of view, has detected thousands of FRBs and is building the first statistical sample. FRBs are now being used as probes of the intergalactic medium — measuring the mean electron density of the Universe by correlating dispersion measure with host galaxy redshift — and to constrain the baryon density of the cosmic web."
  },
  {
    "id": "art-037",
    "slug": "saturn-rings-moons",
    "category": "planetary-science",
    "title": "Saturn: Lord of the Rings and King of Moons",
    "publishedAt": "2026-07-01",
    "readingMinutes": 8,
    "tags": [
      "Saturn",
      "rings",
      "Titan",
      "Enceladus",
      "Cassini",
      "hexagonal storm",
      "tidal forces"
    ],
    "summary": "Saturn is the jewel of the Solar System — its ring system visible through even a small telescope — and a world of extraordinary complexity. The Cassini mission spent 13 years in its system, revealing a dynamic ring system, a moon with hydrocarbon lakes, and another with active hydrothermal vents.",
    "body": "When Galileo first turned his rudimentary telescope to Saturn in 1610, he was baffled. The planet appeared to have 'ears' — companion bodies that seemed to be absorbed into the planet itself by 1612, only to reappear. It was Christian Huygens in 1655 who correctly deduced that Saturn is 'surrounded by a thin flat ring, nowhere touching, and inclined to the ecliptic.' The rings are now known to be one of the most complex and dynamic structures in the Solar System — a system of countless particles of water ice (and some silicate dust) ranging from micrograms to hundreds of metres in size, orbiting in a disc just a few tens of metres thick (in the main rings) but 275,000 km in diameter.\n\nSaturn's ring system is divided into regions designated A, B, C (with D interior and E, F, G exterior). The Cassini Division — a 4,800-km gap between the A and B rings — is maintained by a 2:1 orbital resonance with Mimas; any particle in the Division would orbit at half Mimas's period, receiving a cumulative gravitational kick that clears the region. 'Shepherd moons' (Prometheus and Pandora) gravitationally confine the narrow F ring. The Cassini spacecraft imaged the rings at resolutions down to a few tens of metres, revealing density waves, bending waves, propellers (local disturbances from embedded moonlets), and clumping structures. The rings appear surprisingly young — perhaps 100–400 million years old — based on their brightness (older, dustier rings should be darker) and mass constraints from Cassini's ring-grazing and Grand Finale orbits. If the rings are young, they may have formed from the tidal disruption of a moon (named 'Chrysalis' in a 2022 hypothesis) during a late dynamical instability of Saturn's satellite system.\n\nSaturn's north pole is adorned with a remarkable hexagonal cloud pattern — a standing six-sided wave in the polar jet stream, approximately 30,000 km across with an embedded hurricane-like polar vortex. The hexagon has persisted over decades of observation (first seen by Voyager 1 in 1980, then by Cassini from 2004–2017) and is a long-lived atmospheric wave phenomenon with no terrestrial equivalent.\n\nThe Cassini-Huygens mission — a joint NASA/ESA/ASI mission launched in 1997 and reaching Saturn in July 2004 — is the most successful outer Solar System mission in history by scientific output. Cassini orbited Saturn for 13 years, conducting 293 orbits and close flybys of Titan (127 times), Enceladus (23 times), and other moons. The ESA Huygens probe was released in December 2004 and descended through Titan's atmosphere on 14 January 2005 in the first and only successful landing in the outer Solar System, transmitting data for 72 minutes on the surface.\n\nTitan is a unique world: the only moon with a thick atmosphere (1.5 bar surface pressure, mostly nitrogen with ~5% methane) and the only extraterrestrial body known to have stable liquid bodies on its surface — lakes and seas not of water but of liquid methane and ethane at -179°C. The Ligeia Mare and Kraken Mare near the north pole are comparable in size to Earth's Great Lakes and the Caspian Sea. A methane hydrological cycle (methane evaporation, methane rain, methane rivers) mirrors Earth's water cycle. Titan's surface, imaged by Cassini's radar and the Huygens lander camera, shows sand dunes of organic 'tholin' particles, mountains of water ice, and evidence for cryovolcanic (liquid water eruption) activity. Titan also has a subsurface water-ammonia ocean. NASA's Dragonfly helicopter, due to arrive at Titan in 2034, will sample its surface chemistry at multiple sites, searching for evidence that prebiotic chemistry has progressed over billions of years in a methane-based environment.\n\nEnceladus — only 504 km across — was the most scientifically dramatic discovery of Cassini's mission. The spacecraft detected active geyser-like plumes from the south polar terrain, confirmed in 2005 during a close flyby that caused unexpected changes in Cassini's trajectory due to the mass loading of the spacecraft by plume material. Cassini flew through the plumes multiple times and detected water vapour, ice crystals, sodium salts, organic molecules, silica nanoparticles (indicating hydrothermal water–rock interactions at ~90°C), molecular hydrogen, and complex carbon-bearing molecules including small amino-acid precursors. The evidence points to a warm, chemically active ocean in contact with a rocky seafloor — among the most compelling cases for a potentially habitable environment in the Solar System. Cassini's final Grand Finale in 2017 (plunging into Saturn's atmosphere to prevent contamination of the moons) did not include a final Enceladus flyby, leaving many questions unanswered for a future dedicated mission."
  },
  {
    "id": "art-038",
    "slug": "telescope-history-optics-astronomy",
    "category": "astronomy",
    "title": "The Telescope: Four Centuries of Cosmic Revelation",
    "publishedAt": "2026-08-01",
    "readingMinutes": 7,
    "tags": [
      "telescope history",
      "Galileo",
      "reflector",
      "refractor",
      "Herschel",
      "ELT",
      "adaptive optics"
    ],
    "summary": "From Galileo's first astronomical telescope in 1609 through Newton's reflecting telescope to the 39-metre Extremely Large Telescope under construction in Chile, the development of telescopes over four centuries has been the engine of astronomical discovery. Each generation revealed phenomena completely invisible to its predecessors.",
    "body": "When Galileo Galilei first turned a small refracting telescope toward the night sky in the autumn of 1609 — an instrument no better than a modern toy telescope — he saw mountains on the Moon, four moons circling Jupiter, phases of Venus, and resolved individual stars in the Milky Way band. Within months, observational evidence destroyed the Ptolemaic geocentric model of the cosmos and began a transformation in humanity's conception of its place in the Universe.\n\nGalileo did not invent the telescope. The first patent for a 'looker' was filed by Hans Lippershey in the Netherlands in 1608, and several contemporaries claimed priority. But Galileo — understanding the optical principle (a convex objective lens forming a real image, magnified by an eyepiece) — quickly improved the magnification from ×3 to ×20 and made the first systematic astronomical observations. His findings, published in Sidereus Nuncius (The Starry Messenger) in March 1610, caused a sensation across Europe.\n\nRefracting telescopes are limited by chromatic aberration (different wavelengths are focused at different distances by glass, creating coloured fringes) and by the impossibility of making perfect large glass lenses (lens sag under their own weight). In 1668, Isaac Newton built the first reflecting telescope: a metal mirror (speculum metal — an alloy of tin and copper) ground to a parabolic shape, which reflects all wavelengths to the same focus without chromatic aberration. Mirrors can be supported from behind (avoiding the sag problem), making reflectors the design of choice for large telescopes. William Herschel built a 1.22-metre (48-inch) reflector in 1789, at the time the largest telescope in the world, and used it to discover Uranus (in 1781 with a smaller telescope), two moons of Saturn, and thousands of nebulae.\n\nThe 19th century saw observational astronomy increasingly combined with physical science — first spectroscopy (identifying chemical elements in stars) and then photography, enabling long exposures to record faint objects invisible to the eye. The 72-inch 'Leviathan of Parsonstown' built by Lord Rosse in Ireland became operational in 1845 and was used to discover the spiral structure in several 'nebulae' — later confirmed to be galaxies.\n\nThe 20th century saw telescopes move to dry mountain sites above much of the atmosphere (Palomar in California, Mauna Kea in Hawaii, La Silla and Paranal in Chile) and telescope diameters grow from 1 to 10 metres. The Hooker Telescope (2.54 m, Mount Wilson, 1917) was used by Edwin Hubble to resolve Cepheid variables in Andromeda and other galaxies, establishing the extragalactic distance scale. The Hale Telescope (5.08 m, Palomar, 1948) held the title of world's largest for nearly three decades. The breakthrough that unlocked the era of 8–10 metre telescopes was segmented mirror technology and active optics: large mirrors can be composed of numerous smaller hexagonal segments, each positioned to nanometre precision by computer-controlled actuators, forming a perfect parabolic surface.\n\nAdaptive optics (AO) has transformed ground-based optical astronomy. Earth's atmosphere introduces rapid, small-scale refractive distortions that blur optical images far below the theoretical diffraction limit (the sharper images achievable in space). AO systems measure the atmospheric distortion hundreds of times per second using a guide star (natural or artificial — a laser returns from the sodium layer at 90 km high) and correct the distortion using a deformable mirror with hundreds of actuators. Modern AO on 8–10 metre telescopes achieves near-diffraction-limited resolution in the near-infrared, enabling direct imaging of exoplanets and very-high angular resolution studies of star-forming gas clouds.\n\nThe next generation of optical/infrared telescopes currently under construction will push into formerly inaccessible territory. The Extremely Large Telescope (ELT), a European Southern Observatory project under construction on Armazones in the Atacama Desert, has a primary mirror 39 metres in diameter composed of 798 hexagonal segments, making it the world's largest optical/near-IR telescope when first light is expected in 2028. The Giant Magellan Telescope (GMT, 25 m effective aperture) and the Thirty Meter Telescope (TMT, 30 m, planned for Mauna Kea or the Canary Islands) are US-led projects at a slightly smaller scale. These telescopes will directly image exoplanets in reflected starlight, perform high-resolution spectroscopy of their atmospheres, study the first galaxies observed by JWST at optical wavelengths, and resolve individual stellar populations in galaxies out to 100 Mpc."
  }
];






const COSMOS_ARTICLES_BATCH7 = [
  {
    "id": "art-039",
    "slug": "astroparticle-physics-neutrinos",
    "category": "particle-astrophysics",
    "title": "Neutrino Astronomy: Ghost Particles from the Violent Cosmos",
    "publishedAt": "2026-09-01",
    "readingMinutes": 8,
    "tags": [
      "neutrinos",
      "IceCube",
      "solar neutrinos",
      "supernova 1987A",
      "neutrino oscillations",
      "multi-messenger astronomy"
    ],
    "summary": "Neutrinos are the most ghostly particles in the Universe — they interact so weakly that a light-year of lead would stop only half of them. Yet they carry critical information from the deepest cores of stars, supernovae, black holes, and the most distant cosmic accelerators. Detecting them has required building cubic-kilometre detectors in Antarctic ice.",
    "body": "When a massive star collapses to form a neutron star, the entire gravitational potential energy released during the collapse — roughly 3 × 10⁴⁶ joules, equivalent to the energy the Sun will radiate in its entire 10-billion-year lifetime — is carried away in just 10 seconds by a burst of neutrinos. Only about 1% of that energy goes into the visible supernova explosion; the neutrinos, which interact so feebly with matter they barely notice the collapsing star, stream out essentially unchanged. On 23 February 1987, just hours before the visible brightening of Supernova 1987A in the Large Magellanic Cloud, three neutrino detectors simultaneously recorded 20–25 neutrinos in a 12-second window. These two-dozen particles confirmed the core-collapse supernova model, constrained the neutrino mass (mass < 5.7 eV from the spread of arrival times), and tested the equivalence principle (gravitational deflection must be the same for massless photons and nearly-massless neutrinos, which it was to one part in 10⁵).\n\nNeutrinos come in three 'flavours' — electron neutrinos (νe), muon neutrinos (νμ), and tau neutrinos (ντ) — corresponding to their three lepton partners. A startling discovery emerged in the late 1990s from two experiments: the Sudbury Neutrino Observatory (SNO) in Canada showed that the solar neutrino flux in all flavours equalled the Standard Solar Model prediction, but that the flux of electron neutrinos alone was only one-third of that, solving the 'solar neutrino problem' that had puzzled physicists for 30 years. The Super-Kamiokande experiment in Japan found that atmospheric muon neutrinos (produced by cosmic ray interactions in the atmosphere) oscillated into tau neutrinos over distances of hundreds to thousands of kilometres. Neutrino oscillations — the transformation of one neutrino flavour into another during propagation — are only possible if neutrinos have non-zero mass, providing the first definitive evidence for physics beyond the Standard Model. This discovery earned the 2015 Nobel Prize in Physics to Takaaki Kajita (Super-K) and Arthur McDonald (SNO).\n\nDetecting neutrinos from cosmic distances requires enormous detectors embedded in 'natural' shielding that suppresses atmospheric muon backgrounds — deep mines, underground labs, and most dramatically, large volumes of transparent polar ice or ocean water. IceCube Neutrino Observatory at the Geographic South Pole is a cubic-kilometre array of 5,160 light sensors (Digital Optical Modules) deployed 1.5–2.5 km deep in the Antarctic ice sheet. When a high-energy neutrino interacts with nuclei in the ice, it produces a muon or hadronic shower that moves faster than light travels in ice, emitting blue Cherenkov radiation detected by the DOMs. IceCube began full operation in 2011 and in 2013 announced the detection of the first astrophysical high-energy neutrinos (above 100 TeV) with certainty above 3σ — the 'Bert and Ernie' neutrinos named after the unusually energetic initial candidates.\n\nIceCube's 10-year dataset contains hundreds of astrophysical neutrino events. In 2017, a 290-TeV neutrino event (IceCube-170922A) was flagged and followed up by gamma-ray telescopes, which found the blazar TXS 0506+056 in an outburst — the first identification of a neutrino source, and a milestone in multi-messenger astronomy (combining gravitational waves, neutrinos, gamma rays, and optical/radio observations of the same event). Analysis of the IceCube archival data found a prior neutrino excess from the same direction in 2014–2015. The NGC 1068 Seyfert 2 galaxy was subsequently identified as a significant neutrino source in IceCube's steady-source analysis, supporting the idea that AGN disc regions (opaque to gamma rays) are efficient neutrino production sites.\n\nMulti-messenger astronomy reached maturity on 17 August 2017 with GW170817 — the first gravitational wave detection from a binary neutron star merger (LIGO/Virgo), associated with a gamma-ray burst detected by Fermi and INTEGRAL 1.7 seconds later, localised to a galaxy (NGC 4993) at 40 Mpc, and observed in X-rays, optical, infrared, and radio over the following weeks as a kilonova. This single event confirmed neutron star mergers as sources of short gamma-ray bursts and heavy r-process elements; measured the Hubble constant from the gravitational wave 'standard siren' independently; and tested the speed of gravity (gravitational waves and photons arrived within 1.7 seconds after travelling 130 million light-years — confirming they travel at the same speed to 15 parts per quintillion). The era where astronomy uses every cosmic messenger simultaneously has truly arrived."
  },
  {
    "id": "art-040",
    "slug": "jupiter-gas-giant-moons",
    "category": "planetary-science",
    "title": "Jupiter: King of the Solar System",
    "publishedAt": "2026-10-01",
    "readingMinutes": 8,
    "tags": [
      "Jupiter",
      "Great Red Spot",
      "Io",
      "Ganymede",
      "JUICE",
      "Europa Clipper",
      "Galilean moons"
    ],
    "summary": "Jupiter is the largest planet in the Solar System — more than twice the mass of all other planets combined — and its powerful gravity has shaped the Solar System's architecture. Its four largest moons are themselves fascinating worlds: one the most volcanically active body in the Solar System, another hiding a deep ocean beneath its ice.",
    "body": "Jupiter has dominated the Solar System since its formation approximately 4.6 billion years ago. It is 1,321 times the volume of Earth, 318 times Earth's mass, and contains more than twice the mass of all other planets combined. Its gravitational influence shapes the asteroid belt (creating Kirkwood gaps via mean-motion resonances), deflects comets from the inner Solar System (both protecting and occasionally redirecting them toward Earth), and has played a complex role in sculpting the orbital architecture of the terrestrial planets.\n\nJupiter's atmosphere is the most studied gas giant atmosphere in the Solar System. Its visible 'surface' — the cloud deck seen by telescopes and spacecraft — consists of parallel bands of clouds at different altitudes: lighter-coloured zones (rising, ammonia-ice cloud decks) alternating with darker-coloured belts (sinking, warmer air with reddish phosphorus and sulphur compounds). The wind pattern in belts and zones is driven by Jupiter's fast rotation (a day is just 9 hours 55 minutes, giving equatorial velocities over 40,000 km/h) and generates wind speeds of up to 620 km/h in jet streams.\n\nThe Great Red Spot (GRS) is the most iconic feature in the Solar System: a high-pressure anticyclonic storm larger than Earth that has persisted for at least 350 years (reliably observed since 1831, with a possible 17th-century observation by Giovanni Cassini). The GRS has been shrinking over the past century: it was once 40,000 km wide, is now about 14,000 km wide, and appears to have stabilised but may eventually shrink to a 'red oval.' The jet streams on either side confine it. The colour — ranging from salmon-pink to brick-red — is attributed to UV photochemistry of upwelling phosphine and ammonia; the exact chemistry producing the red chromophore is still debated. Beyond the GRS, Jupiter has many other stable storms, including the Oval BA ('Red Spot Jr') which merged from three white ovals in 2000 and inexplicably reddened in 2006.\n\nJupiter's inner structure is largely inferred from gravity measurements and models. The atmosphere transitions from molecular hydrogen near the surface to a proposed deep layer of metallic hydrogen — hydrogen under pressures above 1 Mbar becomes electrically conducting, behaving like a metal — which flows in convective patterns driven by internal heat from gravitational contraction and primordial heat retained since formation. This metallic hydrogen flow drives Jupiter's powerful magnetic field, roughly 20,000 times stronger than Earth's and generating the largest magnetosphere in the Solar System (if it were visible from Earth, it would appear larger than the full Moon). At Jupiter's centre, gravitational models suggest a dense 'fuzzy core' containing heavy elements extending perhaps 0.3–0.5 Jupiter radii — possibly remnants of the rocky/icy 'seed' core on which Jupiter's gas accreted, partially diluted by erosion and mixing over billions of years.\n\nThe four Galilean moons — Io, Europa, Ganymede, and Callisto — discovered by Galileo in January 1610 — form a miniature planetary system of remarkable diversity. Io, the innermost, is pulled by competing gravitational forces from Jupiter, Europa, and Ganymede in a Laplace resonance (1:2:4 orbital periods), generating tidal heat that makes it the most volcanically active body in the Solar System: over 400 active volcanoes resurface it completely on timescales of millions of years, making its surface the youngest of any solid body we have studied. Plumes of sulphur dioxide reach 300–500 km high; lava flows of silicate rock and molten sulphur paint the surface in a vivid palette of reds, yellows, and blacks.\n\nEuropa and Ganymede both harbour subsurface liquid water oceans as described elsewhere; Callisto, the outermost Galilean moon, appears ancient and heavily cratered, with little or no geological activity after early heavy bombardment.\n\nThe Juno spacecraft (in Jupiter orbit since 2016) has transformed understanding of Jupiter's deep structure via precise gravity and magnetic field mapping. It discovered that Jupiter's winds extend roughly 3,000 km deep (not just surface phenomena) and that the magnetic field is unexpectedly asymmetric — the southern hemisphere's field differs significantly from a simple dipole. Juno's extended mission includes Ganymede, Europa, and Io flybys. Two major dedicated missions are currently en route to the Jupiter system: ESA's JUICE (Jupiter Icy Moons Explorer, launched 2023) will orbit Ganymede from 2034 and flyby Europa and Callisto. NASA's Europa Clipper (launched October 2024) will perform 50 Europa flybys in a four-year orbital tour to characterise the ocean's depth, salinity, and habitability."
  },
  {
    "id": "art-041",
    "slug": "the-sun-our-star",
    "category": "solar-science",
    "title": "The Sun: A Star in Its Prime",
    "publishedAt": "2026-11-01",
    "readingMinutes": 8,
    "tags": [
      "Sun",
      "solar structure",
      "sunspots",
      "Parker Solar Probe",
      "helioseismology",
      "solar cycle",
      "coronal mass ejection"
    ],
    "summary": "The Sun is the closest star to Earth and the power source of the Solar System. But it is also a complex, dynamic physical laboratory — a churning ball of hot plasma whose properties from its nuclear-burning core to its mysteriously hot corona are being revealed in unprecedented detail by the Parker Solar Probe and Solar Orbiter.",
    "body": "The Sun is, in cosmic terms, an unremarkable star: a middle-aged, middle-mass, middle-luminosity G2-type dwarf on the main sequence. In our personal context, it is everything: the source of virtually all energy on Earth (directly as sunlight, indirectly stored as fossil fuels), the dominant gravitational body of the Solar System, and the canvas on which space weather events are painted. Yet understanding the Sun — this closest star 1.496 × 10⁸ km away — remains an active area of cutting-edge research.\n\nThe Sun's structure, from core to corona, spans six orders of magnitude in density and temperature. The core, at 15 million Kelvin and 150 times the density of water, is where energy is generated by the proton-proton chain of nuclear fusion reactions at a rate equivalent to about 4 × 10²⁶ watts. Energy generated in the core is transported outward by photons in the radiative zone — a region of opaque plasma where photons take roughly 170,000 years to reach the surface through a random walk of absorption and re-emission (though recent models suggest this timescale may be shorter). Above the radiative zone, energy transport switches to convection in the convection zone: large cells of hot plasma rise, cool, and sink back in overturning motions. At the top of the convection zone, the solar surface — the photosphere — is a dynamic layer of granules (convection cells 1,000 km across, lasting 10–20 minutes) and supergranules beneath the atmosphere.\n\nAbove the photosphere, the chromosphere (5,000–8,000 K, visible as a red flash during solar eclipses) and corona (1–3 million K) form the solar atmosphere. The paradox of the corona — hotter than the surface — has occupied solar physicists for decades. Leading mechanisms are Alfvénic wave heating (magnetic waves propagating from the photosphere and dissipating in the corona) and nanoflare heating (Parker's 1988 model of continuous small-scale reconnection events). The Parker Solar Probe, launched in 2018, is systematically diving closer to the Sun than any previous spacecraft, reaching within 6.5 million km (8.5 solar radii) during its closest perihelion passes, having already passed through the corona — the first spacecraft to do so — and measuring the solar wind in situ before it has been processed by expansion. These measurements are transforming models of coronal heating and solar wind acceleration.\n\nSunspots — dark, cooler regions (about 3,500 K compared to the photosphere's 5,778 K) where strong magnetic fields suppress convection — appear in pairs of opposite magnetic polarity linked by arching field lines. Their number follows the approximately 11-year solar cycle (the sunspot cycle). At solar minimum, spots are rare and appear at high latitudes; as the cycle progresses to maximum, spots increase in number and migrate toward the equator (Spörer's law). After maximum, spots again diminish. Each new cycle begins with spots at high latitude and the global magnetic field reversing polarity — so the true 'magnetic solar cycle' is approximately 22 years. Solar cycle 25 (beginning 2019) has been surprisingly active, producing one of the largest geomagnetic storms in 20 years (May 2024) with auroras visible as far south as Florida and Spain.\n\nHelioseismology — the study of acoustic waves (p-modes) resonating inside the Sun — has provided a powerful tool for probing the solar interior. These pressure waves, excited by convective turbulence, cause the solar surface to oscillate with specific periods (predominantly around 5 minutes) detectable by Doppler imaging. Analysis of millions of normal-mode frequencies constrains the sound speed profile, rotation rate, and composition of the solar interior as a function of depth, confirming the solar physical models (calibrated by the Standard Solar Model) at the level of 0.1%. Helioseismology confirmed a key prediction of the Standard Solar Model that the solar core rotates rigid-body and the radiative zone rotates nearly uniformly, while the convection zone shows differential rotation (the equator rotates faster than the poles) as observed at the surface.\n\nSolar Orbiter (ESA/NASA, launched 2020) complements the Parker Solar Probe by imaging the Sun's surface, atmosphere, and heliosphere with an unprecedented combination of remote sensing and in-situ instrumentation, including during high-latitude observations never achieved before (reaching inclinations up to 33° from the ecliptic by 2025). Its images have revealed the ubiquity of 'campfires' — thousands of tiny magnetic reconnection events in the low corona — potentially a direct observation of nanoflare heating. Together, Parker and Solar Orbiter are providing the most complete physical picture of our star in the history of astronomy."
  }
];






const COSMOS_ARTICLES_BATCH8 = [
  {
    "id": "art-042",
    "slug": "vacuum-quantum-fields-zero-point-energy",
    "category": "physics",
    "title": "Quantum Fields and the Vacuum: The Seething Emptiness of Space",
    "publishedAt": "2026-12-01",
    "readingMinutes": 8,
    "tags": [
      "quantum field theory",
      "vacuum energy",
      "Casimir effect",
      "virtual particles",
      "Hawking radiation",
      "QED",
      "renormalisation"
    ],
    "summary": "Quantum mechanics reveals that empty space is not truly empty: it is a boiling sea of quantum fields with zero-point energy, virtual particle-antiparticle pairs, and vacuum fluctuations. These phenomena are not merely theoretical — they drive effects including the Casimir force, the Lamb shift, and possibly Hawking radiation from black holes.",
    "body": "The word 'vacuum' suggests emptiness — the absence of matter, energy, and physical processes. Quantum mechanics demolishes this intuition completely. According to quantum field theory (QFT), the correct framework for combining quantum mechanics and special relativity, every particle is an excitation of an underlying quantum field permeating all of space. Even in the 'vacuum' — the ground state, the state of lowest energy — these fields are never truly quiescent. Heisenberg's uncertainty principle, applied to field amplitudes, mandates that the fields cannot simultaneously have definite value and definite rate of change. They fluctuate constantly, giving rise to a ground-state (zero-point) energy that is non-zero even when no real particles are present.\n\nThe existence of zero-point fluctuations has measurable consequences. The Casimir effect, predicted by Hendrik Casimir in 1948 and measured to high precision in the 1990s by Steve Lamoreaux, is perhaps the most direct manifestation. Place two uncharged, perfectly conducting parallel plates close together in a vacuum. No classical force should act between them. However, the zero-point fluctuations of the electromagnetic field are altered by the presence of the plates — only modes whose wavelengths satisfy boundary conditions can exist between the plates, but all modes exist outside. The incomplete cancellation of radiation pressure from inside and outside the plates results in a net attractive force. For plates separated by 1 micrometre, this Casimir force is measurable and has been confirmed to better than 1% agreement with theory. It is now an engineering consideration in MEMS (microelectromechanical systems) devices.\n\nThe Lamb shift provides a second confirmation. In the hydrogen atom, the 2s₁/₂ and 2p₁/₂ energy levels should be degenerate (equal energy) in the Dirac equation of quantum mechanics including special relativity. In 1947, Willis Lamb and Robert Retherford measured a tiny energy splitting of about 1 GHz between these levels. The explanation, worked out by Bethe and others, lies in the interaction of the electron with the vacuum fluctuations of the electromagnetic field (vacuum polarisation and self-energy correction). These QED (quantum electrodynamics) corrections to the electron's energy have now been calculated and measured to 12 significant figures — the most precise comparison between theory and experiment in all of science.\n\nQED, developed by Feynman, Schwinger, and Tomonaga in the late 1940s (Nobel 1965), is the quantum field theory of electromagnetic interactions. It describes the behaviour of electrons, positrons, and photons in terms of Feynman diagrams — pictorial representations of perturbative expansions in powers of the fine structure constant α ≈ 1/137. The anomalous magnetic moment of the electron — the deviation of the electron's magnetic moment from the Dirac value — has been calculated in QED to 10th order in α (involving 12,672 Feynman diagrams) and measured with a relative precision of 10⁻¹³. Theory and experiment agree to 10 significant figures. No comparison between theory and experiment in any field of science comes close to this precision.\n\nVirtual particles in Feynman diagrams are often described in popular accounts as real particles that briefly 'borrow' energy from the vacuum, pop into existence, and annihilate. This description is evocative but somewhat misleading — virtual particles are mathematical terms in a perturbative expansion, not observable entities. They represent the quantum field fluctuations in a specific calculational framework. In a different gauge or basis, the same physical predictions can be derived without reference to virtual particles.\n\nHawking radiation, predicted theoretically by Stephen Hawking in 1974, arises from a different application of QFT in curved spacetime. Near a black hole's event horizon, the creation of particle-antiparticle pairs from vacuum fluctuations can result, in specific conditions determined by the strong spacetime curvature, in one particle falling into the black hole and the other escaping to infinity as thermal radiation. Without violating energy conservation (the infalling particle carries negative energy from the black hole's perspective), the black hole gradually loses mass — 'evaporating.' For stellar-mass black holes, the temperature of Hawking radiation is infinitesimally small (10⁻⁸ K for a solar-mass black hole) and completely unobservable. For primordial micro-black holes of initial mass ~10¹² kg, the evaporation timescale is ~10¹⁰ years — about the age of the Universe — meaning they may be completing their evaporation now and producing a detectable burst of gamma rays. No unambiguous observational evidence for Hawking radiation has yet been obtained, but analogue experiments in Bose-Einstein condensates and other systems have reproduced the mathematics of the horizon and observed the analogue Hawking effect.\n\nDark energy — the energy density of the vacuum driving the accelerating expansion of the Universe — is often identified with the cosmological constant and potentially with zero-point vacuum energy. The mismatch between the observed dark energy density (~10⁻²⁶ kg/m³) and the naive quantum field theory estimate of zero-point energy density (~10⁹³ kg/m³) — a discrepancy of 120 orders of magnitude — is the cosmological constant problem, widely regarded as the most severe discrepancy between theory and observation in all of physics. Resolving it requires either a mechanism that cancels vacuum energy to extraordinary precision, or a reformulation of how gravity couples to quantum vacuum energy — a problem at the frontier of quantum gravity."
  },
  {
    "id": "art-043",
    "slug": "ice-giants-uranus-neptune",
    "category": "planetary-science",
    "title": "Ice Giants: Uranus and Neptune, the Overlooked Worlds",
    "publishedAt": "2027-01-01",
    "readingMinutes": 8,
    "tags": [
      "Uranus",
      "Neptune",
      "ice giants",
      "Voyager 2",
      "triton",
      "magnetic field",
      "Uranus orbiter"
    ],
    "summary": "Uranus and Neptune are the Solar System's overlooked worlds — larger than Earth but smaller than the gas giants, with exotic compositions, bizarre tilted axes, and moons that hint at turbulent histories. They are the next priority for a flagship NASA mission, and their study is transforming planet formation theories.",
    "body": "Most discussions of our Solar System jump from Saturn to the distant small bodies of the Kuiper Belt, skipping over two worlds that are more alien than any other planet-scale objects we have visited. Uranus and Neptune — collectively termed 'ice giants' — are not merely smaller gas giants. They differ in composition, structure, and magnetic field geometry in ways that challenge our understanding of planetary formation.\n\nUranus was the first planet discovered in the telescopic era — spotted by William Herschel on 13 March 1781 and initially mistaken for a comet or nebula. Its disc is subtle but detectable as a small blue-green smudge. At 14.5 Earth masses and 4 Earth radii, Uranus has a bulk composition dominated not by hydrogen and helium (as Jupiter and Saturn are) but by a 'hot dense fluid' of water, methane, and ammonia ices (in the planetary science sense, 'ice' refers to these compounds regardless of their physical state under planetary interior conditions). The atmosphere is predominantly hydrogen and helium at the visible cloud level, with methane absorbing red light and giving Uranus its characteristic cyan tint. Beneath the atmosphere, models generally invoke a 'rock+ice' interior with a rocky core, though the precise structure is unconstrained by current observations.\n\nUranus has the most dramatic obliquity in the Solar System: its rotation axis is tilted 97.77° from perpendicular to its orbital plane, meaning it rotates essentially on its side. The polar regions experience 42-year-long seasons of continuous sunlight followed by 42 years of darkness. The cause of this tilt is generally attributed to a large impact event early in Solar System history. The Voyager 2 flyby in January 1986 — the only close-up look any spacecraft has ever taken of Uranus — found a surprisingly bland atmosphere (no large storm features), a ring system of 13 rings, 10 previously unknown moons, and a highly anomalous magnetic field: offset from the planet's centre by one-third of its radius and tilted 59° from the rotation axis (compared to Earth's 11° tilt and central dipole). Unlike Earth, where a core dynamo generates the field, Uranus's field likely arises from an ionic conducting region in the mantle.\n\nNeptune, the eighth and outermost planet, was the first 'predicted' planet: mathematical analysis of perturbations in Uranus's orbit by Urbain Le Verrier (in France) and John Couch Adams (in England) predicted its location, and Johann Galle at the Berlin Observatory found it on 23 September 1846, within 1° of the predicted position. Neptune is slightly smaller than Uranus in radius (3.88 Earth radii) but more massive (17.1 Earth masses) — meaning it is denser. Its vivid blue colour is deeper than Uranus's, attributed to higher methane concentration and possibly other atmospheric chromophores. Despite receiving only 1/900th of the solar irradiance Earth receives, Neptune has the strongest sustained winds in the Solar System, with equatorial jet streams reaching 2,100 km/h westward — likely driven by internal heat (Neptune radiates 2.6 times as much energy as it absorbs from the Sun).\n\nVoyager 2 flew by Neptune in August 1989 and found dramatic atmospheric features including the Great Dark Spot (a Neptune-scale anticyclone, since dissipated) and 'Scooter' (a fast-moving white cloud feature). Neptune's magnetic field, like Uranus's, is dramatically offset and tilted. Voyager discovered six new moons and a tenuous ring system.\n\nNeptune's largest moon, Triton, orbits the planet in the retrograde direction — the only large moon in the Solar System to do so — and is unambiguously a captured Kuiper Belt Object, making it a distant cousin of Pluto. Triton's retrograde orbit is tidally decaying; in roughly 3.6 billion years, tidal forces will tear it apart, potentially creating a new ring system around Neptune. Voyager 2 found active nitrogen geysers erupting from Triton's south polar cap — heated by the faint sunlight absorbed by the dark pink nitrogen ice — making it one of only four known geologically active bodies in the outer Solar System (with Io, Enceladus, and Pluto).\n\nThe 2023–2032 Planetary Science Decadal Survey ranked a Uranus Orbiter and Probe (UOP) mission as the #1 priority new flagship mission. Such a mission, currently in pre-Phase A study at NASA, would spend 5–10 years in Uranus orbit with an atmospheric entry probe to directly sample the deep atmosphere. It would resolve the structures of its interior, its unusual magnetic field, its ring system, and its family of 27 named moons (several of which, including Ariel, Umbriel, Titania, Oberon, and Miranda, may themselves harbour subsurface oceans given recent thermal models). Miranda, at just 472 km diameter, has one of the most extraordinary geological surfaces in the Solar System — a patchwork of completely different terrain types suggesting either a violent collisional history or tectonic resurfacing."
  },
  {
    "id": "art-044",
    "slug": "dark-energy-accelerating-universe",
    "category": "cosmology",
    "title": "Dark Energy: The Force Accelerating the Universe",
    "publishedAt": "2027-02-01",
    "readingMinutes": 7,
    "tags": [
      "dark energy",
      "cosmological constant",
      "Type Ia supernovae",
      "expansion",
      "Lambda-CDM",
      "DESI",
      "quintessence"
    ],
    "summary": "In 1998, two teams of astronomers found that distant supernovae were fainter than expected, proving the Universe's expansion is accelerating — driven by an unknown 'dark energy' making up 68% of everything. The nature of dark energy remains completely unexplained and is perhaps the deepest mystery in all of science.",
    "body": "In 1917, Albert Einstein added a term to his field equations — the cosmological constant Λ (Lambda) — to produce a static, non-expanding Universe, which was the then-prevailing assumption. When Hubble confirmed expansion in 1929, Einstein called the cosmological constant his 'greatest blunder.' He removed it. For 70 years, most cosmologists followed suit.\n\nIn 1998, the blunder was reinstated — but for a completely different reason. Two independent teams, the High-Z Supernova Search Team (Brian Schmidt and Adam Riess) and the Supernova Cosmology Project (Saul Perlmutter), were using Type Ia supernovae as 'standard candles' — events of known intrinsic luminosity whose observed brightness allows distance measurements across billions of light-years. Their extraordinary project was to map the expansion history of the Universe by measuring the distances of supernovae at high redshift and comparing with a decelerating Universe model (gravity should be slowing expansion). Both teams found the opposite: the high-redshift supernovae were systematically fainter — more distant — than any decelerating or even coasting model predicted. The Universe's expansion is accelerating. Both teams found the same answer: the expansion was slower in the past and is speeding up today, driven by a component they called dark energy. The discovery earned the 2011 Nobel Prize in Physics.\n\nDark energy makes up approximately 68.3% of the total energy content of the Universe (dark matter 26.8%, ordinary baryonic matter 4.9%). Its density is approximately 6.3 × 10⁻²⁷ kg/m³ — roughly 7 protons per cubic metre. Its most remarkable property is its equation of state: the ratio w = P/ρc² of pressure to energy density is approximately -1. Negative pressure — a tension — means that as the Universe expands and the total volume of space increases, the dark energy density remains constant rather than diluting. This is in stark contrast to matter (which dilutes as 1/V) or radiation (1/V⁴/³). A dark energy density that remains constant as space expands gives exponentially growing scale factors — an accelerating expansion.\n\nThe simplest model — and the one that fits all current data — equates dark energy with Einstein's cosmological constant, representing the intrinsic energy density of empty space (vacuum energy). The ΛCDM (Lambda-CDM: Lambda Cold Dark Matter) model is the Standard Model of cosmology. It describes the Universe as flat, containing 68.3% Λ (dark energy), 26.8% CDM (cold dark matter), and 4.9% baryons, with a Hubble constant of ~67–73 km/s/Mpc depending on the measurement method (the latter being the Hubble tension). ΛCDM successfully predicts the CMB power spectrum, the galaxy power spectrum, the abundance of galaxy clusters, the ages of the oldest stars, and the distances to Type Ia supernovae across cosmic history to extraordinary precision.\n\nAlternative models to a pure cosmological constant include quintessence (a slowly evolving scalar field with w ≠ -1, potentially time-varying), phantom energy (w < -1, which would eventually tear apart all matter in a 'Big Rip'), f(R) gravity (modifications to general relativity that produce apparent dark energy at cosmological scales), and interacting dark energy models. Distinguishing between these and the cosmological constant requires measuring the dark energy equation of state w(z) as a function of redshift with sub-percent precision.\n\nThe Dark Energy Spectroscopic Instrument (DESI) collaboration released its first-year data in April 2024, measuring the baryon acoustic oscillation (BAO) standard ruler — a characteristic clustering scale imprinted in the galaxy distribution by acoustic oscillations in the early Universe — across 6 million galaxy spectra at redshifts from 0.1 to 4.2. Their results are the most precise measurement of the expansion history to date. When combined with other probes (CMB, weak lensing, supernovae), DESI's 2024 data showed a mild but intriguing preference for a dark energy equation of state that evolves over time (w₀ > -1, w_a < 0), at roughly 2–3 sigma significance. If confirmed at higher significance, this would indicate that dark energy is not the cosmological constant but a dynamical field — a profound revolution in cosmology. Confirmation awaits the full 5-year DESI dataset (~40 million spectra) and complementary surveys by Euclid and the Rubin Observatory."
  }
];






const COSMOS_ARTICLES_BATCH9 = [
  {
    "id": "art-045",
    "slug": "asteroids-comets-impacts",
    "category": "planetary-science",
    "title": "Asteroids, Comets, and Planetary Defence",
    "publishedAt": "2027-03-01",
    "readingMinutes": 8,
    "tags": [
      "asteroids",
      "comets",
      "NEO",
      "DART",
      "Chicxulub",
      "Apophis",
      "planetary defence"
    ],
    "summary": "Small bodies — asteroids and comets — are the remnants of planet formation, carrying pristine records of Solar System chemistry. But they are also potential threats: the impact that ended the dinosaurs 66 million years ago is a reminder that planetary defence requires tracking and, when necessary, deflecting hazardous near-Earth objects.",
    "body": "The Solar System formed from a vast protoplanetary disc of gas and dust, and the planets represent only a fraction of the solid material that once existed. The remainder — billions of rocky bodies from kilometres to hundreds of kilometres across, and trillions of icy bodies further out — persist as the asteroid belt and the Kuiper Belt, the long-period comet reservoir in the Oort Cloud, and a population of near-Earth objects (NEOs) crossing or approaching Earth's orbit. These small bodies are scientifically invaluable as preserved records of the Solar System's formation, but the largest of them represent genuine hazards to life on Earth.\n\nThe asteroid belt, between Mars and Jupiter, contains hundreds of thousands of objects catalogued to kilometre scale and billions of smaller bodies. Its total mass is approximately 4% of the Moon's mass — far less than originally thought, stripped by Jupiter's gravitational influence and mutual collisions over the Solar System's history. The largest asteroid, Ceres (940 km diameter), is classified as a dwarf planet; it was visited by NASA's Dawn spacecraft from 2015–2018, which found bright salt deposits in craters (likely remnants of briny water that once reached the surface via hydrothermal activity) and possible subsurface pockets of briny liquid. The asteroid Vesta (530 km), also visited by Dawn in 2011–2012, is a differentiated body with a metallic core, representing a protoplanet that survived the Solar System's early turbulence without being incorporated into a larger planet.\n\nComets are icy bodies from the Kuiper Belt (short-period comets) or Oort Cloud (long-period comets). When a comet approaches the Sun, solar heating sublimates its ices — water, carbon dioxide, carbon monoxide, methane — driving jets that release dust and gas to form the coma (atmosphere) and tails. The dust tail is pushed by solar radiation pressure and curves gently away from the Sun; the ion tail (plasma) is pushed by the solar wind and points exactly away from the Sun. ESA's Rosetta spacecraft (2014–2016) orbited and landed the Philae probe on comet 67P/Churyumov-Gerasimenko, revealing a double-lobed world of dark, dusty material covered in organic molecules, with far more deuterium in its water than Earth's oceans, suggesting that Kuiper Belt comets were not the primary source of Earth's water. Carbonaceous chondrite meteorites (from C-type asteroids) have a water D/H ratio much closer to Earth's oceans, implying that asteroids were the dominant water deliverers.\n\nThe Chicxulub impactor — an asteroid or comet roughly 10–15 km in diameter — struck the Yucatán Peninsula 66,043,000 years ago, releasing energy equivalent to 10 billion Hiroshima bombs. The impact ejected gigatonnes of dust and sulphate aerosols into the stratosphere, blocking sunlight for months to years, collapsing photosynthesis globally, and triggering the fifth mass extinction in Earth's history — the Cretaceous-Palaeogene (K-Pg) extinction that eliminated non-avian dinosaurs and three-quarters of all species. The evidence includes the global iridium anomaly (iridium is rare in Earth's crust but enriched in asteroids) at the K-Pg boundary clay layer, shocked quartz, and the Chicxulub crater structure identified in the 1980s by gravity and seismic surveys beneath the Gulf of Mexico.\n\nPlanetary defence has moved from science fiction to a funded government programme. NASA's Center for Near Earth Object Studies (CNEOS) and ESA's Space Situational Awareness programme continuously scan the sky for NEOs, with surveys like Catalina Sky Survey, PAN-STARRS, and ATLAS providing warnings of potential impactors. The Torino Scale rates NEO impact threats from 0 (no hazard) to 10 (certain global catastrophe). Currently the most-watched object is Apophis (asteroid 99942) — a 370-metre body that will pass within 31,900 km of Earth on 13 April 2029 (inside the orbits of geosynchronous satellites), the closest passage of a sizable known asteroid in recorded history. Subsequent refined orbital calculations have brought the impact probability from a brief alarming high of 2.7% (2004) down to essentially zero for 2029, 2036, and 2068.\n\nDeflection of a hazardous asteroid is technically feasible for threats identified decades in advance. The DART (Double Asteroid Redirection Test) mission — NASA's first planetary defence demonstration — impacted the moonlet Dimorphos of the binary asteroid Didymos on 26 September 2022, successfully changing its orbital period by 32 minutes — significantly more than the minimum goal of 73 seconds. This kinetic impactor technique (ram the asteroid to slightly change its orbit over decades) is the most mature deflection method. For longer warning times, the gravity tractor (a spacecraft that hovers near the asteroid and pulls it gravitationally), nuclear standoff blast, or an ablating laser could also work. The key requirement is discovery time: an asteroid discovered 10 years before impact is manageable; one discovered 3 months before is a crisis."
  },
  {
    "id": "art-046",
    "slug": "stellar-black-holes-xray-binaries",
    "category": "stellar-astronomy",
    "title": "Stellar Black Holes: From X-ray Binaries to LIGO",
    "publishedAt": "2027-04-01",
    "readingMinutes": 7,
    "tags": [
      "stellar black holes",
      "X-ray binary",
      "Cygnus X-1",
      "accretion disc",
      "LIGO",
      "BH spin",
      "accretion"
    ],
    "summary": "Stellar-mass black holes — the collapsed remnants of the most massive stars — were long hypothetical. Today, hundreds are known from X-ray binary systems, and LIGO has detected dozens more from gravitational waves released in black hole mergers. Studying them probes physics in the most extreme gravitational fields accessible.",
    "body": "Theoretical physicists had known since Schwarzschild's 1916 solution to Einstein's field equations that mass concentrated within a critical radius — the Schwarzschild radius — would create an object from which not even light could escape. But for decades, black holes were regarded as mathematical curiosities unlikely to exist in nature. The term itself was only coined by John Wheeler in 1967. The first observational case came shortly after, from an unexpected direction.\n\nCygnus X-1, discovered in 1964 as one of the first X-ray sources detected by rocket-borne detectors, became the first strong black hole candidate in 1971–1972, when optical observations identified a blue supergiant star (HDE 226868) moving with a period of 5.6 days, indicating a massive invisible companion. The companion's minimum mass — inferred from the orbital dynamics — far exceeded the upper mass limit for a neutron star (~3 solar masses), pointing strongly to a black hole. Stephen Hawking accepted a bet with Kip Thorne in 1974 that Cygnus X-1 was not a black hole — he later conceded, 'graciously' acknowledging the evidence.\n\nIn an X-ray binary, the black hole accretes material transferred from a companion star (via Roche lobe overflow or a stellar wind). The material forms an accretion disc — a flat rotating structure in which viscosity (mediated by magnetic turbulence in the MRI, magnetorotational instability) causes matter to spiral inward, heating to millions of Kelvin and emitting strongly in X-rays. The inner edge of the accretion disc extends to the Innermost Stable Circular Orbit (ISCO), which lies at 3 Schwarzschild radii for a non-rotating (Schwarzschild) black hole, and closer for a spinning (Kerr) black hole — at just 0.5 Schwarzschild radii for a maximally spinning Kerr black hole. Measurements of the X-ray spectrum from the disc allow estimation of the ISCO and thus the black hole spin.\n\nMany X-ray binaries are transient sources — quiescent most of the time but erupting in outbursts lasting weeks to months when enhanced accretion drives the system into a luminous, highly variable X-ray bright state. In these outbursts, the accretion flow transitions between characteristic spectral states: the hard state (dominated by a hot, optically thin corona, with a power-law X-ray spectrum) and the soft state (dominated by the thermal emission of the disc). These state transitions, accompanied by changes in radio jet activity and quasi-periodic oscillations in the X-ray flux, are a rich laboratory for understanding accretion physics near the event horizon.\n\nLIGO (Laser Interferometer Gravitational-Wave Observatory) opened an entirely new population of black holes in 2015. The first detection, GW150914 (14 September 2015), was the merger of two black holes of 36 and 29 solar masses, 1.3 billion light-years away, merging to form a 62-solar-mass remnant and releasing the remaining 3 solar masses as gravitational waves — the most energetic event ever observed in the Universe after the Big Bang. In 0.2 seconds, GW150914 radiated more power than the entire visible Universe of stars combined. As of 2024, LIGO-Virgo-KAGRA have detected over 90 compact binary mergers (32 from the most recent O3b run), including black hole-black hole, neutron star-neutron star, and black hole-neutron star systems.\n\nThe merging black hole masses discovered by LIGO span a range from about 5 to over 100 solar masses. The 'mass gap' between ~2–5 solar masses (between the heaviest known neutron stars and lightest black holes) and the 'pair-instability gap' (above ~50 solar masses, where the initial star's evolution is thought to prevent direct black hole formation — these 'intermediate mass' mergers are thought to involve multiple generation black holes, second-generation merger products) are active areas of inquiry. GW190521, with component masses of 85 and 66 solar masses, produced a 142-solar-mass remnant in the pair-instability gap — the first confirmed intermediate-mass black hole formed through a gravitational wave event."
  },
  {
    "id": "art-047",
    "slug": "space-debris-orbital-environment",
    "category": "space-exploration",
    "title": "Space Debris: The Growing Threat to Our Orbital Environment",
    "publishedAt": "2027-05-01",
    "readingMinutes": 7,
    "tags": [
      "space debris",
      "Kessler syndrome",
      "orbital mechanics",
      "satellite collision",
      "remediation",
      "megaconstellations",
      "sustainability"
    ],
    "summary": "Since Sputnik in 1957, humanity has been filling low Earth orbit with satellites, rocket stages, and collision fragments. With over 25,000 objects tracked and millions of untracked fragments, the debris environment threatens active satellites and the long-term sustainability of space — particularly as megaconstellations deploy thousands more spacecraft.",
    "body": "When Sputnik beeped its way into orbit on 4 October 1957, it became the first artificial object in space. Today, there are over 10,000 active satellites in Earth orbit, plus approximately 25,000 catalogue-tracked debris objects larger than 10 cm, a further ~500,000 objects between 1 and 10 cm (large enough to be lethal to a spacecraft but too small to track from the ground), and tens of millions of fragments smaller than 1 cm. At orbital velocities — typically 7.5 km/s in low Earth orbit — even a 1 cm aluminium sphere carries kinetic energy comparable to a hand grenade.\n\nThe most operationally dangerous event in the history of space debris was the collision of the defunct Cosmos 2251 satellite and operational Iridium 33 communications satellite on 10 February 2009 — the first accidental hypervelocity collision between two intact spacecraft. The impact generated over 1,800 tracked fragments from Cosmos 2251 and ~300 from Iridium 33 that remain in orbit years later, performing orbital manoeuvres away from the debris cloud whenever it approaches the International Space Station. China's deliberate destruction of the Fengyun-1C weather satellite in an anti-satellite (ASAT) missile test on 11 January 2007 was even more destructive: it created over 3,000 tracked fragments and an estimated 35,000 debris objects >1 cm, many of which will remain in orbit for decades.\n\nThe spectre hanging over this discussion is Kessler syndrome — named after NASA scientist Donald Kessler, who quantified the risk in 1978. If the density of objects in low Earth orbit becomes sufficiently high, collisions between objects generate further fragments, which cause more collisions, in a self-amplifying cascade that could render certain orbital shells unusable indefinitely. Kessler syndrome is not a Hollywood catastrophe unfolding over hours — it would develop over decades or centuries — but modelling suggests that the existing debris population in certain orbital bands is already above the critical threshold for this 'chain reaction' even if no new launches occurred.\n\nThe International Space Station makes routine debris avoidance manoeuvres (DAMs) — typically 2–3 per year — when the conjunction assessment team determines a debris fragment will pass within 25 km × 25 km × 0.75 km of the station (the 'pizza box' avoidance zone). In cases where there is insufficient warning time for a DAM (less than about 2 orbits), crew may take shelter in the Soyuz or Crew Dragon as a precaution. The station has been hit by small (<1 cm) objects multiple times, leaving impact craters in the cupola window and solar panels.\n\nMegaconstellations — large networks of low Earth orbit satellites for broadband internet — have dramatically raised stakes in the debris discussion. SpaceX's Starlink has deployed over 7,000 satellites to date with regulatory authorization for up to 42,000; Amazon's Kuiper has authorisation for 3,236; OneWeb, Telesat, and others are also building constellations. Even with compliant deorbit (satellites are designed to reenter within 5 years of decommissioning), the sheer number of active spacecraft and conjunction events greatly increases collision risk. Starlink satellites perform automatic collision avoidance manoeuvres triggered by the Space Safety Coalition's conjunction data; by 2023, Starlink was performing thousands of manoeuvres per month.\n\nDebris remediation — actively removing existing debris objects — is under development but the technical and commercial challenges are significant. JAXA, ESA, Astroscale, and ClearSpace are developing active debris removal (ADR) demonstrations. ESA's ClearSpace-1 mission (planned for the late 2020s) will use a grabber to capture and deorbit a specific Vespa upper stage fragment — the first dedicated commercial debris removal attempt. Proposed large-scale ADR concepts include electrodynamic tethers, drag sails, laser ablation (heating debris surface to create thrust), and catch-and-release nets, but none yet has regulatory framework or commercial model for scaling to the thousands of removals needed to meaningfully reduce debris population. The sustainability of Earth orbit — access to space for all future generations — may be one of the defining environmental challenges of the 21st century."
  }
];






const COSMOS_ARTICLES_BATCH10 = [
  {
    "id": "art-048",
    "slug": "big-bang-nucleosynthesis-matter-antimatter",
    "category": "cosmology",
    "title": "The First Three Minutes: Big Bang Nucleosynthesis and the Matter-Antimatter Asymmetry",
    "publishedAt": "2027-06-01",
    "readingMinutes": 8,
    "tags": [
      "Big Bang nucleosynthesis",
      "hydrogen",
      "helium-4",
      "lithium",
      "matter-antimatter",
      "baryogenesis",
      "baryon asymmetry"
    ],
    "summary": "In the first three minutes after the Big Bang, protons and neutrons fused to form the lightest nuclei — hydrogen, helium, deuterium, and lithium. These primordial abundances, predicted with extraordinary precision by the theory and measured in ancient stars and gas clouds, confirm the Big Bang model. But why matter dominated over antimatter remains an unsolved mystery.",
    "body": "The title of Steven Weinberg's 1977 popular science masterpiece — 'The First Three Minutes' — captures the extraordinary timescale on which the most important nuclear events in cosmological history took place. In the three minutes following the Big Bang (actually from about 0.001 seconds to 3–20 minutes), the temperature and density of the Universe passed through the narrow range where nuclear reactions could occur, and essentially all the atoms in the Universe that would ever be made of the lightest elements were synthesised in one brief episode.\n\nAt 1 second after the Big Bang, the temperature was 10 billion Kelvin — hot enough to maintain neutrons and protons in weak-interaction equilibrium (interconverting via n + ν_e → p + e⁻ and p + anti-ν_e → n + e⁺). The neutron-to-proton ratio was controlled by this equilibrium, which at high temperature was close to unity (n/p ≈ 1), but as the Universe expanded and cooled, the weak interactions 'froze out' at about 10 billion K — the neutron-to-proton ratio locked at approximately 1/7 (a few neutrons for every seven protons), and began slowly declining further as free neutrons decayed (half-life 611 seconds).\n\nAt about 100 seconds, when the temperature had fallen to about 1 billion K, deuterium (a proton and neutron bound together) became stable against photodisintegration — the 'deuterium bottleneck' had been crossed. Rapid subsequent reactions built up helium-4 (alpha particles): practically all available neutrons were incorporated into helium-4, leaving a mass fraction of approximately 25% helium and 75% hydrogen — a prediction that depends sensitively on the n/p ratio at freeze-out, and thus on the number of neutrino species. Slight further reactions produced small quantities of deuterium (about 2 × 10⁻⁵ by number relative to hydrogen), helium-3 (~10⁻⁵), and lithium-7 (~10⁻¹⁰). Beyond lithium, the nuclei that would have formed (beryllium-8, etc.) are unstable, and the Universe expanded too rapidly for the triple-alpha process to bridge the gap. All heavier elements were forged much later in stellar nucleosynthesis.\n\nBig Bang nucleosynthesis (BBN) is a triumph of precision cosmology. The primordial helium abundance (~25% by mass) matches the oldest, most metal-poor stellar atmospheres measured. Primordial deuterium abundances measured in quasar absorption spectra toward very high-redshift gas clouds match BBN predictions to 5% when the baryon density inferred from the CMB is used as input. These concordant measurements from two completely independent probes — nuclear astrophysics in the first 3 minutes and acoustic oscillations 380,000 years later — is one of the strongest pillars of the standard cosmological model.\n\nA lithium problem does persist: the observed abundance of lithium-7 in the oldest, most metal-poor halo stars (Population II stars) is about a factor of 3 lower than the BBN prediction — the 'Spite plateau' of lithium abundances. Whether this reflects depletion of lithium in stellar atmospheres by mixing into hotter interior regions, a revision of the beryllium-7 electron capture cross-section at BBN temperatures, or physics beyond the Standard Model remains unresolved despite decades of work.\n\nThe matter-antimatter asymmetry is one of the deepest puzzles at the interface of particle physics and cosmology. For every particle of ordinary matter in the Universe, the Big Bang appears to have produced an almost equal quantity of antimatter. Matter and antimatter annihilate on contact into pure energy (gamma rays). If equal amounts existed, all matter and antimatter would have annihilated in the first second, leaving a Universe of pure radiation with no matter — no stars, no planets, no observers. The fact that the Universe exists at all, with a small excess of matter over antimatter, implies a fundamental asymmetry between the two — a property called CP violation (charge-parity violation) combined with baryon number violation at high temperatures and departure from thermal equilibrium (the Sakharov conditions for baryogenesis, proposed in 1967). The Standard Model of particle physics contains CP violation (confirmed in kaon and B-meson systems), but the amount is too small by many orders of magnitude to explain the observed matter-antimatter asymmetry. New physics — potentially involving additional sources of CP violation in the leptonic sector (studied by neutrino oscillation experiments like T2K and NOvA), supersymmetric particles, or baryogenesis at the electroweak phase transition — is required. This absence is a major motivation for beyond-Standard-Model physics searches."
  },
  {
    "id": "art-049",
    "slug": "history-astronomy-people",
    "category": "history-of-science",
    "title": "Pioneers of Astronomy: A History Through the People Who Changed Our View of the Cosmos",
    "publishedAt": "2027-07-01",
    "readingMinutes": 9,
    "tags": [
      "history of astronomy",
      "Copernicus",
      "Kepler",
      "Newton",
      "Messier",
      "Cecilia Payne",
      "Vera Rubin",
      "Chandrasekhar"
    ],
    "summary": "Astronomy's history spans five millennia, from Babylonian eclipse prediction to the gravitational wave observers of today. It is a story driven by a series of intellectual revolutions — each overturning established certainty — and by individuals who often worked marginalised and unrecognised, whose contributions we now see as foundational.",
    "body": "The study of the sky is as old as human culture. Archaeological evidence suggests systematic naked-eye astronomy was practised 5,000 years ago in Mesopotamia — clay tablets record the Babylonians' remarkably accurate predictions of planetary motions and eclipses, based on purely empirical pattern recognition rather than physical models. The Antikythera mechanism (c. 150–100 BCE), discovered in a Greek shipwreck in 1900, is a gear-driven analog computer that predicted the positions of the Sun, Moon, and planets, eclipse dates, and even the schedule of the Olympic Games — a sophistication not matched in mechanical form for over a millennium.\n\nNicolas Copernicus (1473–1543), a Polish canon and amateur astronomer, circulated in the last year of his life 'De Revolutionibus Orbium Coelestium' — On the Revolutions of the Celestial Spheres — proposing that the Sun, not the Earth, was at the centre of the planetary orbits. The heliocentric model was not new (Aristarchus of Samos had proposed it in the 3rd century BCE), but Copernicus developed the mathematical machinery and placed it within the mainstream of Renaissance science. The Church would later ban the book; Galileo's defence of heliocentrism led to his house arrest.\n\nTycho Brahe (1546–1601), a Danish nobleman who lost part of his nose in a duel, was the finest observational astronomer of the pre-telescopic era. He built the elaborate Uraniborg observatory on the island of Hven and made 20 years of nightly measurements of planetary positions with precision of 1–2 arcminutes — ten times better than predecessors. His data, passed to Johannes Kepler after Tycho's death, became the empirical foundation on which Kepler built the laws of planetary motion. Kepler (1571–1630) — working as Tycho's assistant in Prague — spent years trying to fit circular orbits to Mars's motion. In 1605, after 900 pages of computation, he discovered that Mars moves in an ellipse with the Sun at one focus. His three laws — elliptical orbits, equal areas in equal times (reflecting conservation of angular momentum), and T² ∝ a³ — described planetary motion perfectly without physical explanation. The explanation came half a century later.\n\nIsaac Newton (1643–1727) invented calculus, formulated the laws of motion, and in his 1687 'Principia Mathematica,' unified Kepler's empirical laws with the concept of universal gravitation: every mass attracts every other mass with a force proportional to the product of their masses and inversely proportional to the square of their distance. Newton's derivation of Kepler's laws as theorems in mechanics was one of the greatest intellectual achievements in the history of science, and his law of gravitation remained unchallenged until Einstein's general relativity in 1915.\n\nEdmond Halley (1656–1742) compiled the orbital parameters of 24 comets and recognised that apparitions in 1531, 1607, and 1682 described the same object returning on a 75-year orbit. He predicted the comet's return in 1758, which he did not live to see — but was confirmed on 25 December 1758 and the comet named in his honour.\n\nCharles Messier (1730–1817), a French comet hunter, compiled a catalogue of 103 nebulae, star clusters, and galaxies that he found annoying as comet decoys — objects that resembled comets but didn't move. His Messier Catalogue, now extended to 110 objects, remains the primary set of targets for amateur astronomers: M1 (Crab Nebula), M13 (Great Globular Cluster), M31 (Andromeda Galaxy), M42 (Orion Nebula).\n\nCecilia Payne-Gaposchkin (1900–1979) was, in the opinion of many, the most important astronomer of the 20th century. Her 1925 Harvard PhD thesis demonstrated that stars are composed predominantly of hydrogen, overturning the prevailing view and founding the quantitative study of stellar composition. She was initially not offered a faculty position at Harvard (the first woman to receive a salary there was in 1938). Otto Struve called her thesis 'the most brilliant known in astronomy.'\n\nVera Rubin (1928–2016), working at the Carnegie Institution with Kent Ford, mapped the rotation curves of spiral galaxies in the 1970s and found that they remained flat at large radii rather than falling off as Keplerian mechanics would predict for the visible mass. Her work, building on Fritz Zwicky's 1933 observations of the Coma Cluster, provided the most compelling evidence for dark matter in galaxies. Rubin made her first measurements using Carnegie's image tube spectrograph on face-on galaxies, evening after evening, systematically building a dataset that transformed cosmology. She was nominated for the Nobel Prize repeatedly; that she never received it before her death in 2016 is widely regarded as one of the Nobel Committee's most significant oversights.\n\nSubrahmanyan Chandrasekhar (1910–1995) derived, on a ship voyage from India to England aged 19, the mass limit below which white dwarf stars are stable: 1.4 solar masses (the Chandrasekhar limit). Arthur Eddington, the most famous astrophysicist of the era, publicly ridiculed his conclusion — that white dwarfs above this mass would collapse further — declaring nature would not permit such a 'stellar absurdity.' Chandrasekhar was correct; Eddington was not. Chandrasekhar eventually received the Nobel Prize in 1983, at 73, for this and other contributions."
  },
  {
    "id": "art-050",
    "slug": "large-scale-structure-universe",
    "category": "cosmology",
    "title": "The Cosmic Web: Large-Scale Structure of the Universe",
    "publishedAt": "2027-08-01",
    "readingMinutes": 7,
    "tags": [
      "large-scale structure",
      "cosmic web",
      "voids",
      "filaments",
      "superclusters",
      "baryon acoustic oscillations",
      "galaxy redshift surveys"
    ],
    "summary": "Galaxies are not scattered randomly through space but are arranged in a vast cosmic web of filaments, sheets, clusters, and enormous voids. Mapping this structure across billions of light-years reveals the history of structure formation, tests dark matter models, and provides one of our most powerful probes of dark energy.",
    "body": "When astronomers completed the first large redshift surveys in the 1980s — converting the redshifts of hundreds of thousands of galaxies into three-dimensional maps of their positions in space — they revealed a Universe far more structured than anyone expected. Galaxies are not randomly distributed but are strung along filaments like beads on strings, gathered at their intersections in rich clusters, and bordering enormous empty regions — cosmic voids — that may be tens to hundreds of megaparsecs across. This intricate pattern — the cosmic web — is one of the most striking features of the observable Universe.\n\nThe cosmic web traces the distribution of dark matter: the galaxy-dense filaments and sheets lie along ridgelines of the dark matter density field, and the voids are regions where dark matter is depleted. This structure grew from tiny primordial density fluctuations (those observed in the CMB) via gravitational instability over 13.8 billion years. Regions slightly denser than average attracted more material and grew denser still; underdense voids depleted further. Analytic theory (linear perturbation theory, the Zel'dovich approximation, Press-Schechter theory for halo mass functions) and N-body simulations (from the early millennium N-body runs to the modern IllustrisTNG, EAGLE, and FLAMINGO cosmological hydrodynamic simulations with cubes hundreds of Mpc across and hundreds of millions of simulated particles) have reproduced the key features of the observed cosmic web in impressive detail.\n\nThe CfA Redshift Survey (1985) revealed the 'Great Wall' — a sheet of galaxies 170 Mpc long. The Sloan Great Wall (2003), discovered in SDSS data, spans 420 Mpc. The Laniakea Supercluster, delineated by Tully, Courtois, Hoffman, and Pomarède in 2014 by mapping the local galaxy velocity field, is a supercluster containing the Milky Way, the Virgo Cluster, and the Great Attractor (Norma Cluster), spanning 160 Mpc and containing 10¹⁷ solar masses across 100,000 galaxies. The Milky Way moves at 600 km/s relative to the CMB frame; much of this motion is toward the Great Attractor and the even more massive Shapley Supercluster.\n\nBaryon acoustic oscillations (BAO) — a characteristic clustering scale of ~150 Mpc imprinted in the matter distribution by the same acoustic waves that create CMB peaks — provide a 'standard ruler' for cosmological distance measurement. By measuring the BAO scale at different redshifts (using galaxy redshift surveys), cosmologists can trace the expansion history of the Universe, constraining dark energy and the Hubble constant. The SDSS BOSS survey (2011–2017) measured BAO with ~1% precision; DESI's 5-year survey will improve this to ~0.1% precision across cosmic history from z = 0.1 to z = 4, providing the most precise expansion history ever measured.\n\nCosmological simulations have revealed that the cosmic web has a rich hierarchy: the largest structure is superclusters and voids (100–500 Mpc), nested within which are clusters (1–10 Mpc, 10¹⁴–10¹⁵ solar masses), groups (0.1–1 Mpc, 10¹²–10¹⁴ solar masses), and individual galaxies with their dark matter haloes. Galaxy groups — including our own Local Group (Milky Way, Andromeda, Triangulum, and ~54 dwarf galaxies) — are the most common environment for galaxies. Rich clusters like Coma (330 Mpc away, ~1,000 galaxies in the core) have X-ray-emitting intracluster medium, gravitational lensing arcs, and enormous cD galaxies (stretched ellipticals at the gravitational centre) formed by repeated mergers. The cold dark matter paradigm successfully predicts the number of galaxy clusters as a function of mass and redshift, matching observations from X-ray, Sunyaev-Zel'dovich effect, and weak gravitational lensing surveys at the ~10% level — a remarkable consistency for a 13.8-billion-year gravitational evolution problem."
  }
];



CosmosBootstrap.register('article-data-master', () => {
  const batches = [
    typeof COSMOS_ARTICLES !== 'undefined' ? COSMOS_ARTICLES : [],
    typeof COSMOS_ARTICLES_EXTENDED !== 'undefined' ? COSMOS_ARTICLES_EXTENDED : [],
    typeof COSMOS_ARTICLES_BATCH3 !== 'undefined' ? COSMOS_ARTICLES_BATCH3 : [],
    typeof COSMOS_ARTICLES_BATCH4 !== 'undefined' ? COSMOS_ARTICLES_BATCH4 : [],
    typeof COSMOS_ARTICLES_BATCH5 !== 'undefined' ? COSMOS_ARTICLES_BATCH5 : [],
    typeof COSMOS_ARTICLES_BATCH6 !== 'undefined' ? COSMOS_ARTICLES_BATCH6 : [],
    typeof COSMOS_ARTICLES_BATCH7 !== 'undefined' ? COSMOS_ARTICLES_BATCH7 : [],
    typeof COSMOS_ARTICLES_BATCH8 !== 'undefined' ? COSMOS_ARTICLES_BATCH8 : [],
    typeof COSMOS_ARTICLES_BATCH9 !== 'undefined' ? COSMOS_ARTICLES_BATCH9 : [],
    typeof COSMOS_ARTICLES_BATCH10 !== 'undefined' ? COSMOS_ARTICLES_BATCH10 : [],
  ];

  const merged = {};
  batches.flat().forEach(article => {
    if (article && article.id) merged[article.id] = article;
  });

  const allArticles = Object.values(merged).sort((a, b) => a.id.localeCompare(b.id));

  CosmosEvents.emit('cosmos:articles-loaded', { articles: allArticles });
  CosmosLogger.info(
    'Cosmos Explorer: all ' + allArticles.length + ' articles loaded. ' +
    'Topics span stellar physics, planetary science, cosmology, particle astrophysics, ' +
    'space exploration history, and astrobiology.'
  );
  CosmosAnnouncer.announce('All articles loaded');

  
  if (typeof CosmosSearch !== 'undefined' && CosmosSearch.buildIndex) {
    CosmosSearch.buildIndex(allArticles);
    CosmosLogger.info('Search index built for ' + allArticles.length + ' articles.');
  }

  return allArticles;
}, { critical: false, priority: 77 });


if (typeof window !== 'undefined') {
  const _allBatches = [
    typeof COSMOS_ARTICLES !== 'undefined' ? COSMOS_ARTICLES : [],
    typeof COSMOS_ARTICLES_EXTENDED !== 'undefined' ? COSMOS_ARTICLES_EXTENDED : [],
    typeof COSMOS_ARTICLES_BATCH3 !== 'undefined' ? COSMOS_ARTICLES_BATCH3 : [],
    typeof COSMOS_ARTICLES_BATCH4 !== 'undefined' ? COSMOS_ARTICLES_BATCH4 : [],
    typeof COSMOS_ARTICLES_BATCH5 !== 'undefined' ? COSMOS_ARTICLES_BATCH5 : [],
    typeof COSMOS_ARTICLES_BATCH6 !== 'undefined' ? COSMOS_ARTICLES_BATCH6 : [],
    typeof COSMOS_ARTICLES_BATCH7 !== 'undefined' ? COSMOS_ARTICLES_BATCH7 : [],
    typeof COSMOS_ARTICLES_BATCH8 !== 'undefined' ? COSMOS_ARTICLES_BATCH8 : [],
    typeof COSMOS_ARTICLES_BATCH9 !== 'undefined' ? COSMOS_ARTICLES_BATCH9 : [],
    typeof COSMOS_ARTICLES_BATCH10 !== 'undefined' ? COSMOS_ARTICLES_BATCH10 : [],
  ];
  window.CosmosExplorer = {
    version:     '2.0.0',
    articleCount: function () {
      const ids = new Set(_allBatches.flat().map(a => a && a.id).filter(Boolean));
      return ids.size;
    },
    getArticle:  function (slug) {
      return _allBatches.flat().find(a => a && (a.slug === slug || a.id === slug)) || null;
    },
    search:      function (query) {
      return typeof CosmosSearch !== 'undefined'
        ? CosmosSearch.search(query)
        : [];
    },
    categories:  [
      'stellar-astronomy', 'planetary-science', 'cosmology', 'astrophysics',
      'space-exploration', 'astrobiology', 'human-spaceflight', 'solar-science',
      'galactic-astronomy', 'gravitational-wave-astronomy', 'particle-astrophysics',
      'history-of-science', 'physics',
    ],
  };
  CosmosLogger.info('CosmosExplorer v2.0.0 initialised. Call window.CosmosExplorer.articleCount() to verify.');
}



const COSMOS_GLOSSARY = [
  {
    "term": "Absolute Magnitude",
    "definition": "The apparent magnitude a star would have if observed from a standard distance of 10 parsecs (32.6 light-years). Allows comparison of intrinsic stellar brightnesses independent of distance. The Sun has an absolute magnitude of +4.83."
  },
  {
    "term": "Accretion",
    "definition": "The process by which matter falls onto a compact object (black hole, neutron star, white dwarf, or protostar) under gravity, releasing gravitational potential energy as radiation. Accretion discs form when infalling matter has angular momentum and must spiral inward, dissipating energy through viscosity and magnetic turbulence (the MRI — magnetorotational instability)."
  },
  {
    "term": "Adaptive Optics",
    "definition": "A technique used to correct in real time for the blurring of astronomical images caused by atmospheric turbulence. A guide star (natural bright star or artificial laser guide star at 90 km altitude) is used to measure wavefront distortions hundreds of times per second; a deformable mirror with hundreds of actuators compensates by changing shape. Modern systems on 8–10 m telescopes achieve near-diffraction-limited resolution in the near-infrared."
  },
  {
    "term": "AGN (Active Galactic Nucleus)",
    "definition": "The compact, luminous region at the centre of a galaxy powered by accretion onto a supermassive black hole (SMBH). AGN include quasars and QSOs (most luminous), Seyfert galaxies (less luminous spirals), radio galaxies (with powerful jets), and blazars (jets pointing toward Earth). The unified AGN model attributes the variety of AGN types primarily to viewing angle relative to a dusty torus obscuring the central engine."
  },
  {
    "term": "Albedo",
    "definition": "The fraction of incident light reflected by a surface. Geometric albedo is the ratio of the body's brightness at zero phase angle to that of a perfectly diffusing disc of the same cross-section. Bond albedo is the fraction of total incident solar power reflected in all directions. The Moon has a low Bond albedo (~0.12); Venus is high (~0.65) due to its clouds."
  },
  {
    "term": "Antimatter",
    "definition": "Matter composed of antiparticles — the oppositely charged counterparts of ordinary matter. A proton's antiparticle is the antiproton (negative charge); the electron's is the positron (positive charge). Matter-antimatter pairs annihilate to produce gamma rays. The Standard Model predicts equal production of matter and antimatter in the Big Bang; that our Universe contains predominantly matter is the unsolved baryogenesis/matter-antimatter asymmetry problem."
  },
  {
    "term": "Apparent Magnitude",
    "definition": "A logarithmic measure of a celestial object's observed brightness from Earth. The scale is based on the logarithm of flux; a factor-of-100 flux difference equals 5 magnitudes. Brighter objects have smaller (even negative) magnitudes. Sirius: -1.46; full Moon: -12.6; Sun: -26.7. The faintest objects visible with the naked eye are about +6.5."
  },
  {
    "term": "Asteroid Belt",
    "definition": "The region between the orbits of Mars and Jupiter (roughly 2.2–3.2 AU), containing hundreds of thousands of rocky and metallic minor planets (asteroids) ranging from metres to hundreds of kilometres in size. The total mass is only ~4% of the Moon's mass, stripped by Jupiter's gravitational resonances and mutual collisions. Ceres (940 km diameter) is the largest, classified as a dwarf planet. Meteorites reaching Earth are primarily fragments from the asteroid belt."
  },
  {
    "term": "Astronomical Unit (AU)",
    "definition": "The mean Earth-Sun distance, defined as exactly 149,597,870,700 metres (~150 million km). A convenient scale for measuring distances within the Solar System. Light takes 499 seconds (~8.3 minutes) to travel 1 AU. The outermost known Solar System object (Farout, 2018 VG18) was at ~123 AU when discovered."
  },
  {
    "term": "Astrophysical Jet",
    "definition": "A highly collimated beam of plasma and radiation ejected at relativistic speeds from the vicinity of a compact object (active galactic nucleus, microquasar, gamma-ray burst, or young stellar object). AGN jets can extend from parsecs to megaparsecs, interacting with the surrounding intergalactic medium and inflating radio lobes. The physical mechanism — likely Blandford-Znajek extraction of black hole spin energy, or Blandford-Payne magneto-centrifugal launching from the disc — is still debated."
  },
  {
    "term": "Baryon Acoustic Oscillation (BAO)",
    "definition": "A characteristic scale (~150 Mpc comoving) in the statistical clustering of galaxies, imprinted by sound waves in the baryon-photon plasma before recombination in the early Universe. The BAO scale acts as a standard ruler for measuring the expansion history of the Universe. Detected first in the SDSS main galaxy sample and 2dF survey in 2005, now measured to sub-percent precision by BOSS and DESI, providing powerful constraints on dark energy."
  },
  {
    "term": "Binary Star",
    "definition": "A system of two stars gravitationally bound and orbiting their common centre of mass. The majority of stars in the Milky Way are in binary or higher-multiplicity systems. Binary stars are vital for measuring stellar masses (from orbital dynamics) and for understanding stellar evolution, including mass transfer, novae, Type Ia supernovae (from white dwarfs accreting from companions), and gravitational wave sources (from neutron star or black hole mergers)."
  },
  {
    "term": "Black Hole",
    "definition": "A region of spacetime from which neither matter nor light can escape, bounded by the event horizon at the Schwarzschild radius RS = 2GM/c². Formed by gravitational collapse of stellar cores above ~3 solar masses (stellar-mass BHs), or by direct collapse and mergers in galactic nuclei (supermassive BHs, 10⁶–10¹⁰ solar masses). Key properties: mass, spin (Kerr parameter), electrical charge (negligible in realistic BHs). Predicted by GR, confirmed by X-ray binary masses, Event Horizon Telescope images of M87* and Sgr A*, and LIGO gravitational wave detections."
  },
  {
    "term": "Brown Dwarf",
    "definition": "A substellar object with mass between ~13 and ~80 Jupiter masses (0.013–0.08 solar masses). Brown dwarfs are too massive to fuse hydrogen into helium sustainably (unlike main-sequence stars) but may fuse deuterium (above ~13 MJ) or lithium (above ~65 MJ) briefly during their youth. They cool continuously, moving through spectral types L, T, and Y, becoming progressively redder and cooler over billions of years. Their boundary with giant planets and with very low-mass red dwarf stars is smooth and somewhat definitional."
  },
  {
    "term": "Cassini Division",
    "definition": "A 4,800-km wide gap between Saturn's A and B rings, appearing dark and somewhat empty. Maintained by a 2:1 mean-motion resonance with Mimas: any particle at the Cassini Division's orbit completes exactly two orbits for each orbit of Mimas, receiving repeated gravitational 'kicks' that remove particles from that region. Actually not completely empty — Cassini images show dilute material within the division."
  },
  {
    "term": "Celestial Mechanics",
    "definition": "The branch of astronomy and physics that studies the motions of celestial objects under the influence of gravity. Developed by Newton, refined by Euler, Lagrange, and Laplace, and fundamentally extended by Poincaré (who showed that three-body motion is in general not analytically solvable and exhibits chaotic behaviour — a foundational result in chaos theory). Modern applications include spacecraft trajectory design (using orbital resonances and Lagrange points for gravity assists and halo orbits) and predicting asteroid impact probabilities."
  },
  {
    "term": "Cepheid Variable",
    "definition": "A type of pulsating supergiant star that varies in brightness with a period directly related to its luminosity (the period-luminosity relation discovered by Henrietta Swan Leavitt in 1908 and calibrated by Edwin Hubble). Cepheids are the primary 'standard candle' for measuring distances up to ~30 Mpc, bridging between geometric parallax and Type Ia supernova distances. They are used to calibrate the extragalactic distance scale and measure the Hubble constant."
  },
  {
    "term": "Chandrasekhar Limit",
    "definition": "The maximum mass of a white dwarf star supported by electron degeneracy pressure, approximately 1.4 solar masses. Derived by Subrahmanyan Chandrasekhar in 1930. White dwarfs above this mass cannot be stable against gravity and must collapse further. This limit is the foundation for Type Ia supernova standardisable candle cosmology: carbon-oxygen white dwarfs accreting to near the Chandrasekhar mass undergo thermonuclear runaway and explode with roughly uniform peak luminosity."
  },
  {
    "term": "Chromosphere",
    "definition": "The layer of the solar atmosphere above the photosphere, extending from about 1,500 to 10,000 km above the Sun's surface. Temperature rises from ~6,000 K at the base to ~20,000 K at the top. Named for the red colour of hydrogen Hα emission seen during total solar eclipses. Features include spicules (thin jets of plasma rising from the photosphere) and the chromospheric network (a pattern related to supergranular convection). The chromosphere is where solar flares and prominences originate."
  },
  {
    "term": "Comet",
    "definition": "A small icy Solar System body (typically 1–20 km across) that, when near the Sun, develops a coma (atmosphere of sublimating gas and dust) and tails (dust tail pushed by radiation pressure, ion tail pushed by solar wind). Composed of water ice, CO₂, CO, methane, organic molecules, and silicate dust. Short-period comets (period < 200 years) originate in the Kuiper Belt; long-period comets originate in the Oort Cloud, perturbed by stellar and galactic tidal forces. They may have delivered water and organic molecules to the early Earth."
  },
  {
    "term": "Corona (Solar)",
    "definition": "The outermost layer of the Sun's atmosphere, extending millions of kilometres from the surface and visible during total solar eclipses as a pearly white halo. Extremely hot (1–3 million K) compared to the underlying photosphere (~5,778 K) — the 'coronal heating paradox.' Source of the solar wind (plasma streaming outward at 300–800 km/s) and coronal mass ejections (CMEs). Directly sampled by the Parker Solar Probe, which first entered the corona in 2021."
  },
  {
    "term": "Coronal Mass Ejection (CME)",
    "definition": "An explosive release of ~10⁹–10¹³ kg of magnetised solar plasma from the corona, accelerated to 200–3,000 km/s. CMEs are associated with solar flares and magnetically complex regions. When they reach Earth 1–3 days later, their interaction with the magnetosphere drives geomagnetic storms (Kp index up to 9), producing auroras at unusually low latitudes and potentially damaging power grid transformers, satellite electronics, and GPS accuracy."
  },
  {
    "term": "Dark Matter Halo",
    "definition": "The roughly spherical distribution of dark matter surrounding and enveloping a galaxy or galaxy cluster, with total mass 10–100 times the visible baryonic matter. The halo extends to the 'virial radius' — 100s of kpc for galaxies, Mpc for clusters — and has a density profile described by the NFW (Navarro-Frenk-White) profile observed in N-body simulations. The rotation curves of spiral galaxies flatten at large radii because stars and gas orbit in the gravitational potential of the extended dark matter halo, not just the declining visible mass."
  },
  {
    "term": "Deuterium",
    "definition": "An isotope of hydrogen with one proton and one neutron in its nucleus. Abundantly produced in Big Bang nucleosynthesis (primordial deuterium abundance ~2.5 × 10⁻⁵ by number relative to hydrogen). Entirely destroyed (astrated) in stellar interiors. The primordial deuterium abundance in high-redshift quasar absorption systems is a powerful probe of the baryon density of the Universe, in excellent agreement with CMB measurements."
  },
  {
    "term": "Doppler Effect",
    "definition": "The change in observed frequency (and therefore wavelength) of a wave due to relative motion between source and observer. For light, motion toward the observer blueshifts the spectrum (wavelengths shorter); motion away redshifts it (wavelengths longer). The radial velocity (motion along the line of sight) can be measured to centimetres per second precision with modern spectrographs, enabling detection of exoplanets via stellar reflex motion and studies of large-scale structure via galaxy peculiar velocities."
  },
  {
    "term": "Dwarf Galaxy",
    "definition": "A small galaxy with typically 10⁷–10⁹ solar masses of stars (compared to 10¹¹ for the Milky Way), often embedded in a dark matter halo disproportionately larger than their stellar content. The Milky Way has ~50 known satellite dwarf galaxies including the Large and Small Magellanic Clouds and numerous ultra-faint dwarf spheroidals discovered in SDSS data. These faint systems have the highest mass-to-light ratios of any known systems and are key probes of dark matter properties and the missing satellite problem."
  },
  {
    "term": "Eccentricity",
    "definition": "A parameter describing the shape of an elliptical (or other conic section) orbit. A circle has e = 0; a parabolic orbit e = 1 (unbound). Earth's orbital eccentricity is 0.017 (nearly circular); Mars is 0.093; Pluto 0.248; Halley's Comet ~0.967. The orbital eccentricity of exoplanets is one of the most informative quantities for understanding their formation and dynamical history: hot Jupiters are circularised (e ≈ 0) by tidal forces; many super-Earths are on nearly circular orbits; some giant exoplanets have eccentricities up to 0.97, suggesting violent dynamical histories."
  },
  {
    "term": "Electromagnetic Spectrum",
    "definition": "The complete range of electromagnetic radiation, organised by wavelength and frequency: radio waves (λ > 10 cm), microwaves, infrared (λ 0.7 µm–1 mm), visible light (λ 400–700 nm), ultraviolet (λ 10–400 nm), X-rays (λ 0.01–10 nm), gamma rays (λ < 0.01 nm). Different wavelength regimes penetrate Earth's atmosphere to different extents and reveal different physical processes: radio reveals non-thermal jets and neutral gas; infrared dust and cooler stars; X-rays hot plasma and accretion; gamma rays the most energetic nuclear and particle processes."
  },
  {
    "term": "Exoplanet",
    "definition": "A planet orbiting a star other than the Sun. Over 5,700 confirmed exoplanets are known as of 2025 (from Kepler, TESS, radial velocity surveys, direct imaging, and microlensing), with thousands more awaiting confirmation. They span an enormous range of masses (from sub-Earth to super-Jupiter), radii, orbital periods (hours to years), and atmospheric compositions. The Milky Way is estimated to contain over 100 billion exoplanets. The nearest known exoplanet, Proxima Centauri b, orbits 4.24 light-years away in the habitable zone of its red dwarf host."
  },
  {
    "term": "Event Horizon",
    "definition": "The boundary surrounding a black hole beyond which nothing — not even light — can escape. At the event horizon (Schwarzschild radius for a non-rotating BH), escape velocity equals c. Information passing through the event horizon is causally disconnected from the outside Universe. The 'information paradox' — whether information falling into a black hole is permanently lost, violating quantum mechanics' unitary evolution — remains an unresolved foundational problem at the interface of GR and quantum theory."
  },
  {
    "term": "Fermi Paradox",
    "definition": "The apparent contradiction between the high estimates for the probability of extraterrestrial civilisations existing elsewhere in the Milky Way (from the Drake equation) and the complete absence of evidence for their existence. Named after Enrico Fermi, who reportedly asked 'where is everybody?' at a 1950 lunch conversation. Proposed resolutions include: civilisations are rare (Rare Earth hypothesis), they are short-lived (great filter hypothesis), they are present but silent or invisible to us, or the distances involved prevent contact on any civilisation's timescale."
  },
  {
    "term": "Gamma-Ray Burst (GRB)",
    "definition": "The most energetic explosive events in the Universe after the Big Bang, briefly outshining all other gamma-ray sources in the sky. Long GRBs (t > 2 s) arise from the collapse of rapidly rotating massive stars (collapsars) — a variant of core-collapse supernova in which a relativistic jet punches through the stellar envelope. Short GRBs (t < 2 s) arise from binary neutron star or neutron star-black hole mergers (confirmed by the association of GRB 170817A with GW170817). Isotropic equivalent energies of 10⁴⁴–10⁴⁷ J are released in seconds in collimated jets."
  },
  {
    "term": "Gravitational Lensing",
    "definition": "The bending of light paths by gravity (curved spacetime), predicted by GR and proportional to the total mass (including dark matter) along the line of sight. Strong lensing (close to a cluster or galaxy) produces multiple images, arcs, and Einstein rings of background sources. Weak lensing produces coherent statistical distortions of background galaxy shapes, used to map dark matter distributions. Microlensing (by individual stars or planets) causes transient brightenings of background stars, used to detect exoplanets and measure stellar masses."
  },
  {
    "term": "Habitable Zone",
    "definition": "The range of orbital distances from a star within which a planet with sufficient atmospheric pressure could maintain liquid water on its surface. Also called the Goldilocks zone. For the Sun, the conservative habitable zone extends approximately from 0.95 to 1.67 AU. The habitable zone depends on the stellar luminosity (scales as L^0.5), the planetary albedo, and the greenhouse effect. Tidal heating (as in Europa and Enceladus) can maintain liquid water far outside the stellar habitable zone, extending 'habitability' in more generalised senses."
  },
  {
    "term": "Heliopause",
    "definition": "The boundary of the heliosphere — the vast region of space dominated by the solar wind — where the solar wind pressure is balanced by the interstellar medium pressure. Located at roughly 120–160 AU from the Sun. Voyager 1 crossed the heliopause in August 2012; Voyager 2 in November 2018. Beyond the heliopause lies the local interstellar medium — sparse ionised and neutral gas and cosmic rays from the rest of the Milky Way."
  },
  {
    "term": "Hertzsprung-Russell (H-R) Diagram",
    "definition": "A scatter plot of stellar absolute magnitude (or luminosity) versus surface temperature (or spectral type or colour), the fundamental organising diagram of stellar physics. Stars occupy characteristic regions: the main sequence (hydrogen-burning stars including the Sun), the red giant branch (evolved subgiants and giants), the asymptotic giant branch (AGB stars), horizontal branch (helium-burning), and white dwarfs. The CMD (colour-magnitude diagram) is the observational equivalent for star clusters."
  },
  {
    "term": "Hubble Constant (H₀)",
    "definition": "The current rate at which the Universe is expanding, expressed as the recession velocity (in km/s) per unit distance (Mpc). H₀ ≈ 67–73 km/s/Mpc depending on the measurement method. The CMB-derived value (67.4 ± 0.5 km/s/Mpc, Planck 2018) is in ~5σ tension with distance ladder measurements (73.04 ± 1.04 km/s/Mpc, SH0ES team). This Hubble tension may reflect systematic errors or new physics beyond ΛCDM. DESI, Euclid, and Roman Space Telescope are designed to address it."
  },
  {
    "term": "Inflation",
    "definition": "A hypothetical period of exponentially accelerating expansion in the very early Universe (approximately 10⁻³⁶ to 10⁻³² seconds after the Big Bang), driven by a scalar field (the 'inflaton') in a false vacuum with large potential energy. Inflation solves the horizon problem (explains why the CMB is nearly uniform on scales causally disconnected without inflation), the flatness problem (explains spatial flatness), and the monopole problem. It also stretches quantum fluctuations to cosmological scales, seeding the density fluctuations observed in the CMB and the large-scale structure. Evidence: the nearly scale-invariant, Gaussian, adiabatic primordial power spectrum. Smoking-gun evidence (B-mode CMB polarisation from primordial gravitational waves) has not yet been detected."
  },
  {
    "term": "Infrared Astronomy",
    "definition": "Astronomical observations at infrared wavelengths (0.7 µm to 1 mm), penetrating dust clouds opaque to visible light and detecting cool objects (star-forming regions, brown dwarfs, dusty galaxy nuclei, high-redshift galaxies). Ground-based infrared requires dry sites at high altitude (adaptive optics compensates partially for atmospheric water vapour); space observatories (Spitzer, Herschel, JWST) avoid the atmosphere entirely. JWST covers 0.6–28 µm, enabling unprecedented studies of the earliest galaxies, exoplanet atmospheres, and protoplanetary discs."
  },
  {
    "term": "Interstellar Medium (ISM)",
    "definition": "The matter and radiation filling the space between stars in a galaxy. Consists of gas (70% molecular and atomic hydrogen, plus helium and trace heavier elements) and dust (about 1% by mass — silicate and carbonaceous grains of µm size). Exists in multiple phases: molecular clouds (T ~ 10 K, n ~ 10²–10⁶ cm⁻³), cold neutral medium, warm neutral medium, warm ionised medium (from stellar UV), hot ionised medium (from supernova shocks, T ~ 10⁶ K). Stars form from molecular cloud cores; supernovae return enriched material to the ISM. The ISM is the reservoir from which stars form and into which they return their nucleosynthetic products."
  },
  {
    "term": "Kelvin (K)",
    "definition": "The SI unit of thermodynamic temperature, where 0 K is absolute zero (−273.15°C) — the lowest possible temperature at which no thermal motion exists. Astronomical temperatures range from ~2.73 K (the CMB) to ~10¹³ K (in the first microseconds after the Big Bang and in the cores of neutron star mergers). The Sun's core is ~15 million K; the corona is 1–3 million K; the photosphere ~5,778 K; a cool red dwarf surface ~3,000 K."
  },
  {
    "term": "Kepler's Laws",
    "definition": "Three laws of planetary motion published by Johannes Kepler: (1) Planets move in elliptical orbits with the Sun at one focus. (2) A line joining a planet to the Sun sweeps out equal areas in equal times (conservation of angular momentum). (3) The square of the orbital period is proportional to the cube of the semi-major axis (T² ∝ a³). Derived empirically from Tycho Brahe's observations, and later explained by Newton's law of universal gravitation as theorems. Extended to all gravitationally bound orbital systems including binary stars, satellites, and exoplanets."
  },
  {
    "term": "Light-Year",
    "definition": "The distance light travels in one Julian year (365.25 days) in a vacuum, equal to 9.4607 × 10¹⁵ metres (~9.46 trillion km or 63,241 AU). A useful unit for stellar and extragalactic distances. The nearest star (Proxima Centauri) is 4.24 light-years away; the Andromeda Galaxy is 2.537 million light-years. The observable Universe extends about 46.5 billion light-years (accounting for expansion since the CMB was released 13.8 billion years ago)."
  },
  {
    "term": "Luminosity",
    "definition": "The total power emitted by a star or other celestial body, measured in watts or in solar luminosities (L☉ = 3.828 × 10²⁶ W). The Hertzsprung-Russell diagram plots luminosity against temperature. The Sun's luminosity has increased by ~30% over 4.5 billion years as hydrogen depletes in the core. The most luminous stars (hypergiants, LBVs) reach 10⁶ L☉; the least luminous main-sequence stars (late M dwarfs) are 10⁻⁴ L☉."
  },
  {
    "term": "Main Sequence",
    "definition": "The band of hydrogen-burning stars on the Hertzsprung-Russell diagram, stretching from massive hot blue-white O and B stars (luminous, short-lived) through F, G (Sun-like), K (orange), to M dwarfs (red, dim, very long-lived). Main-sequence lifetime scales as M/L ∝ M⁻²·⁵ approximately, so a 25-solar-mass star lives ~3 million years while a 0.1-solar-mass red dwarf could live for trillions of years (longer than the current age of the Universe). When a star exhausts core hydrogen, it evolves off the main sequence to become a subgiant and then a giant or supergiant."
  },
  {
    "term": "Mass-to-Light Ratio (M/L)",
    "definition": "The ratio of a galaxy's or other system's total gravitational mass to its luminosity, in solar units. A pure stellar population of Sun-like stars would have M/L ≈ 1. Observed galaxies have higher M/L due to lower-luminosity stars and stellar remnants. Galaxy clusters have M/L of 100–300, reflecting the large amount of dark matter. Dwarf spheroidal galaxies have M/L values of 100–1000 or more, making them among the most dark-matter-dominated systems known."
  },
  {
    "term": "Magnitudes (astronomical)",
    "definition": "The logarithmic scale used to measure the brightness of celestial objects, originating in the magnitude system of Hipparchus (~130 BCE), refined by Herschel and Pogson. A difference of 5 magnitudes corresponds to exactly a factor of 100 in flux. The zero-point is anchored to Vega (approximately). Magnitudes can be measured across any wavelength band (UBVRI system, AB magnitudes for modern flux-calibrated work). The faintest objects detectable by HST/JWST are around magnitude 31–32."
  },
  {
    "term": "Meteorite",
    "definition": "A fragment of extraterrestrial material that survives passage through Earth's atmosphere and lands on the surface. Classified as stony (chondrites — primitive; achondrites — from differentiated bodies), stony-iron, or iron (from metallic cores of disrupted asteroid bodies). Chondrites contain chondrules (solidified melt droplets), calcium-aluminium-rich inclusions (CAIs — the oldest dated Solar System solids, ~4,568 Mya), and pre-solar grains (stardust with isotopic anomalies recording nucleosynthesis in ancient stars before the Solar System formed)."
  },
  {
    "term": "Milky Way",
    "definition": "The barred spiral galaxy containing the Solar System, with ~200–400 billion stars, predominantly arranged in a 30 kpc (100,000 light-year) diameter disc with a central bar, a 10 kpc bulge, and a ~50 kpc halo of ancient globular clusters and stellar streams. Total mass ~10¹²  solar masses including dark matter. The Sun is ~26,000 light-years (8 kpc) from the galactic centre, on the inner edge of the Orion Arm (a minor spiral arm). The galactic centre hosts Sagittarius A*, a supermassive black hole of ~4 million solar masses, imaged by the Event Horizon Telescope in 2022."
  },
  {
    "term": "Neutron Star",
    "definition": "An ultra-compact stellar remnant with a mass typically 1.2–2.3 solar masses compressed into a radius of ~10 km, produced by the core-collapse supernova of a star with initial mass 8–20 solar masses. Density equals or exceeds nuclear density (~3 × 10¹⁷ kg/m³). Composed primarily of neutrons (with possible quark-gluon plasma core). Observed as radio pulsars (rotating, emitting beamed radio), X-ray pulsars (accreting binaries), magnetars (extremely strong magnetic fields of 10¹⁵ G), and isolated cooling remnants. GW detections from neutron star mergers by LIGO directly probe nuclear matter at extreme densities."
  },
  {
    "term": "Nucleosynthesis",
    "definition": "The production of atomic nuclei from lighter nuclei through nuclear reactions. Big Bang nucleosynthesis (3 minutes after the Big Bang) produced hydrogen, deuterium, helium-4, helium-3, and trace lithium-7. Stellar nucleosynthesis (in stars throughout cosmic history) built all elements from carbon to iron through fusion. The s-process (slow neutron capture) in AGB stars and the r-process (rapid neutron capture) in neutron star mergers and supernovae built all elements heavier than iron. Written in a landmark paper by Burbidge, Burbidge, Fowler, and Hoyle (B²FH, 1957)."
  },
  {
    "term": "Parsec",
    "definition": "The distance at which one AU subtends a parallax angle of one arcsecond, equal to 3.086 × 10¹⁶ m = 3.26 light-years. The standard unit of distance in stellar and extragalactic astronomy. Kiloparsec (kpc) = 1,000 pc; megaparsec (Mpc) = 10⁶ pc; gigaparsec (Gpc) = 10⁹ pc. The nearest star (Proxima Cen) is 1.30 pc; the galactic centre is 8 kpc; the Andromeda Galaxy is 770 kpc; the edge of the observable Universe is ~14 Gpc."
  },
  {
    "term": "Photon",
    "definition": "The quantum of the electromagnetic field — the elementary particle of light and all other electromagnetic radiation. Massless, travels at c in vacuum. Carries energy E = hν and momentum p = hν/c (where h is Planck's constant and ν the frequency). Exhibits both wave-like and particle-like behaviour (wave-particle duality). The photon's existence was proposed by Einstein in 1905 to explain the photoelectric effect (Nobel 1921). Photons mediate the electromagnetic force between charged particles in quantum electrodynamics (QED)."
  },
  {
    "term": "Plasma",
    "definition": "A state of matter consisting of ionised gas — a mixture of free electrons and positively charged ions — produced when matter is heated to temperatures high enough to strip electrons from atoms (typically above ~10,000 K). The most abundant form of visible matter in the Universe (stars, stellar winds, accretion discs, the interstellar medium, solar corona). Plasmas exhibit collective behaviour dominated by electromagnetic forces and support wave modes (Alfvén waves, magnetosonic waves, plasma oscillations) not present in ordinary gases."
  },
  {
    "term": "Pulsar",
    "definition": "A rapidly rotating neutron star emitting beamed electromagnetic radiation (primarily radio waves, but also optical, X-ray, and gamma-ray) from its magnetic poles. As the star rotates, the beam sweeps past Earth like a lighthouse, producing highly regular pulses. Periods range from 33 ms (Crab Pulsar) to 8.5 s (slowest known). Millisecond pulsars (periods ~1–30 ms), spun up by accretion in binary systems, are the most stable natural clocks known and are used in pulsar timing arrays to detect gravitational waves."
  },
  {
    "term": "Quasar (Quasi-Stellar Radio Source)",
    "definition": "The extremely luminous nuclei of distant galaxies powered by accretion onto supermassive black holes, reaching luminosities 10–10,000 times that of their host galaxy. Most luminous known: SDSS J0100+2802, 430 trillion solar luminosities at z = 6.3. First identified by Maarten Schmidt in 1963 via the high redshift of 3C 273. The most distant confirmed quasar is at z ≈ 7.64 (J0313-1806), observed as it was only 670 million years after the Big Bang."
  },
  {
    "term": "Redshift",
    "definition": "The increase in wavelength (shift to redder colours) of light from a receding source, due to either the Doppler effect (peculiar velocity redshift), the expansion of the Universe (cosmological redshift), or a gravitational potential well (gravitational redshift). Cosmological redshift z is defined by (1+z) = a₀/a_emit, where a is the cosmic scale factor. At z = 1, the Universe was half its current size when the light was emitted; at z = 13, galaxies are seen at 3% of the Universe's current age. The highest spectroscopically confirmed galaxy redshift as of 2024 is z ≈ 14.3 (JADES-GS-z14-0 observed by JWST)."
  },
  {
    "term": "Solar System",
    "definition": "The Sun and all objects gravitationally bound to it: eight planets (Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune), five recognised dwarf planets (Ceres, Pluto, Eris, Makemake, Haumea), hundreds of thousands of asteroids, millions of comets, and countless smaller bodies, all orbiting within a heliosphere extending to ~120 AU. Age: 4.568 billion years (from the oldest meteoritic CAIs). Location: ~26,000 light-years from the Milky Way's centre, within the Orion Arm."
  },
  {
    "term": "Spectroscopy",
    "definition": "The study of the interaction between matter and electromagnetic radiation as a function of wavelength. In astronomy, the primary technique for determining the physical properties of stars, galaxies, nebulae, and exoplanet atmospheres: temperature from continuum spectrum and line widths; chemical composition from absorption/emission line identifications; radial velocity from Doppler shifts; magnetic field from Zeeman splitting; rotation from line broadening; stellar population from spectral type mixing. The world's most powerful spectrographs (ESPRESSO, HARPS, APOGEE) measure Doppler shifts equivalent to 50 cm/s."
  },
  {
    "term": "Standard Model of Cosmology (ΛCDM)",
    "definition": "The currently accepted theoretical framework for the large-scale structure and evolution of the Universe, containing cold dark matter (CDM) and a cosmological constant Λ (dark energy) plus ordinary baryonic matter and radiation in a spatially flat Universe. Parameters: H₀ ≈ 67 km/s/Mpc, Ω_b ≈ 0.049, Ω_CDM ≈ 0.268, Ω_Λ ≈ 0.683. ΛCDM successfully predicts the CMB power spectrum, BAO scale, Type Ia supernova distances, big bang nucleosynthesis yields, and the galaxy power spectrum. Open issues: Hubble tension, S8 tension, early galaxies brighter than predicted."
  },
  {
    "term": "Stellar Evolution",
    "definition": "The sequence of changes a star undergoes over its lifetime as it exhausts its nuclear fuel. Begins on the zero-age main sequence (ZAMS) fusing hydrogen in the core; evolves through subgiant and red giant branches (hydrogen shell burning); helium flash and horizontal branch (helium core burning); thermally pulsing AGB phase (hydrogen and helium shell burning, heavy mass loss); planetary nebula ejection; and ends as a white dwarf (for stars up to ~8 solar masses) or a neutron star (8–20 solar masses) or black hole (>20 solar masses). Massive star evolution ends in a core-collapse supernova."
  },
  {
    "term": "Supernova",
    "definition": "A catastrophic stellar explosion 10⁴³–10⁴⁴ J in optical output. Type Ia: thermonuclear explosion of a white dwarf accreting past the Chandrasekhar limit, used as standardisable candles for cosmological distance measurements (led to discovery of dark energy). Core-collapse (Type II, Ib, Ic): collapse of the iron core of a massive star (>8 solar masses) forming a neutron star or black hole, releasing 3 × 10⁴⁶ J mostly as neutrinos, ~1% as explosion kinetic energy. Supernovae synthesise and disperse heavy elements, drive turbulence in the ISM, create supernova remnants with powerful shocks accelerating cosmic rays, and trigger new rounds of star formation."
  },
  {
    "term": "White Dwarf",
    "definition": "The electron-degenerate remnant of a low- or intermediate-mass star (initial mass < ~8 solar masses), after the outer layers are expelled as a planetary nebula. Typical mass 0.6 solar masses; radius ~Earth's radius; density ~10⁶ kg/m³. Composed of carbon and oxygen (most), or helium (less massive, helium WDs from binary interactions). Supported by electron degeneracy pressure independent of temperature. Cools from ~100,000 K to undetectability over ~10¹⁰ years. Over 300,000 white dwarfs are catalogued in Gaia data. Type Ia supernovae originate from WDs accreting mass in binary systems."
  },
  {
    "term": "X-ray Binary",
    "definition": "A binary star system in which one component is a compact object (neutron star or black hole) accreting matter from a companion star, releasing gravitational potential energy as X-ray radiation from the accretion disc. High-mass X-ray binaries (HMXBs) have an OB supergiant companion (e.g., Cygnus X-1); low-mass X-ray binaries (LMXBs) have a lower-mass Roche-lobe-filling companion. Neutron star XRBs can exhibit type I X-ray bursts (thermonuclear burning of accreted hydrogen/helium on the neutron star surface) and millisecond pulsations. The mass of the unseen compact object distinguishes neutron stars (< 3 M☉) from black holes."
  },
  {
    "term": "Zodiacal Light",
    "definition": "A faint, diffuse column of light visible before sunrise or after sunset along the ecliptic plane, caused by sunlight scattered by interplanetary dust — fine particles shed by comets and asteroid collisions in the inner Solar System. Best observed from dark sites at tropical latitudes around equinoxes. Forms a complete 'zodiacal band' across the sky; the spot directly opposite the Sun (the Gegenschein) is slightly brighter due to opposition surge. Surveys by the IRAS and Akari infrared satellites have mapped the dust distribution throughout the ecliptic plane."
  }
];



const CosmosGlossary = (() => {
  'use strict';

  let _index = null;

  function _buildIndex() {
    if (_index) return;
    _index = {};
    COSMOS_GLOSSARY.forEach(entry => {
      const key = entry.term.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      _index[key] = entry;
    });
  }

  function getAll() {
    _buildIndex();
    return COSMOS_GLOSSARY.slice().sort((a, b) => a.term.localeCompare(b.term));
  }

  function search(query) {
    _buildIndex();
    if (!query) return [];
    const q = (typeof query === 'string') ? query.toLowerCase() : String(query).toLowerCase();
    return COSMOS_GLOSSARY.filter(e =>
      e.term.toLowerCase().includes(q) ||
      e.definition.toLowerCase().includes(q)
    );
  }

  function getTerm(term) {
    _buildIndex();
    if (!term || typeof term !== 'string') return null;
    const key = term.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return _index[key] || null;
  }

  function renderGlossary(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const entries = getAll();
    const grouped = {};
    entries.forEach(entry => {
      if (!entry || typeof entry.term !== 'string' || typeof entry.definition !== 'string') return;
      if (!entry.term.trim() || !entry.definition.trim()) return;
      const letter = (entry.term && typeof entry.term === 'string' && entry.term.length)
        ? entry.term[0].toUpperCase() : '?';
      if (!grouped[letter]) grouped[letter] = [];
      grouped[letter].push(entry);
    });

    const fragment = document.createDocumentFragment();

    
    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'Glossary alphabet navigation');
    nav.className = 'cosmos-glossary-nav';
    Object.keys(grouped).sort().forEach(letter => {
      const safeLetter = letter.toLowerCase().replace(/[^a-z0-9]/g, '') || 'misc';
      const a = document.createElement('a');
      a.href = '#glossary-' + safeLetter;
      a.textContent = 'Jump to terms starting with ' + letter;
      a.className = 'cosmos-glossary-nav-letter';
      a.addEventListener('click', (e) => {
        if (e.ctrlKey || e.metaKey || e.shiftKey) return;
        e.preventDefault();
        nav.querySelectorAll('.cosmos-glossary-nav-letter').forEach(l => l.removeAttribute('aria-current'));
        a.setAttribute('aria-current', 'true');
        CosmosAnnouncer.announce('Jumped to terms starting with ' + letter);
        const heading = document.getElementById('glossary-heading-' + safeLetter);
        if (heading) {
          heading.setAttribute('tabindex', '-1');
          heading.focus();
        }
      });
      nav.appendChild(a);
    });
    fragment.appendChild(nav);

    // Initialise aria-current based on URL hash or first letter
    const initialLetter = (window.location.hash.replace('#glossary-', '') || Object.keys(grouped).sort()[0] || '').toUpperCase();
    if (initialLetter) {
      const safeLetter = initialLetter.toLowerCase().replace(/[^a-z0-9]/g, '') || 'misc';
      const initialLink = nav.querySelector(`a[href="#glossary-${safeLetter}"]`);
      if (initialLink) initialLink.setAttribute('aria-current', 'true');
    }

    const sectionEls = [];

    
    Object.keys(grouped).sort().forEach(letter => {
      const safeLetter = letter.toLowerCase().replace(/[^a-z0-9]/g, '') || 'misc';
      const section = document.createElement('section');
      section.id = 'glossary-' + safeLetter;
      const h2 = document.createElement('h2');
      h2.id = 'glossary-heading-' + safeLetter;
      h2.textContent = letter;
      h2.className = 'cosmos-glossary-letter-heading';
      section.setAttribute('aria-labelledby', h2.id);
      section.appendChild(h2);
      const dl = document.createElement('dl');
      grouped[letter].forEach((entry, index) => {
        const dt = document.createElement('dt');
        dt.textContent = entry.term;
        const baseSlug = (entry.term && typeof entry.term === 'string')
          ? entry.term.toLowerCase().replace(/[^a-z0-9]+/g, '-')
          : 'unknown';
        dt.id = `glossary-term-${safeLetter}-${baseSlug}-${index}`;
        const dd = document.createElement('dd');
        dd.id = `glossary-def-${safeLetter}-${baseSlug}-${index}`;
        dd.textContent = entry.definition;
        dl.appendChild(dt);
        dl.appendChild(dd);
      });
      section.appendChild(dl);
      fragment.appendChild(section);
      sectionEls.push(section);
    });

    if (typeof IntersectionObserver !== 'undefined') {
      let announcedLetter = '';
      const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            if (!entry.target.id.startsWith('glossary-')) return;
            const safeLetter = entry.target.id.replace('glossary-', '');
            nav.querySelectorAll('.cosmos-glossary-nav-letter').forEach(l => l.removeAttribute('aria-current'));
            const activeLink = nav.querySelector(`a[href="#glossary-${safeLetter}"]`);
            if (activeLink) {
              activeLink.setAttribute('aria-current', 'true');
              if (announcedLetter !== safeLetter) {
                announcedLetter = safeLetter;
                CosmosAnnouncer.announce(`Viewing terms starting with ${activeLink.textContent?.slice(-1) || safeLetter.toUpperCase()}`);
              }
            }
          }
        });
      }, { threshold: 0.2 });
      sectionEls.forEach(section => sectionObserver.observe(section));
    }

    container.setAttribute('aria-busy', 'true');
    container.innerHTML = '';
    container.appendChild(fragment);
    container.setAttribute('aria-busy', 'false');
    const firstHeading = container.querySelector('h2');
    if (firstHeading) { firstHeading.setAttribute('tabindex', '-1'); firstHeading.focus(); }
    CosmosAnnouncer.announce(`Glossary loaded with ${entries.length} terms`);
    CosmosLogger.info('Glossary rendered: ' + entries.length + ' entries');
  }

  return { getAll, search, getTerm, renderGlossary };
})();


CosmosBootstrap.register('glossary', () => {
  CosmosEvents.emit('cosmos:glossary-loaded', { count: COSMOS_GLOSSARY.length });
  CosmosLogger.info('Astronomy glossary initialised: ' + COSMOS_GLOSSARY.length + ' terms');
}, { critical: false, priority: 76 });