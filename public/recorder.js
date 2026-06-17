(function () {
  'use strict';

  // ── CONFIG ──
  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3000/api/monitoring' : 'https://api.shivamsingh.website/api/monitoring';
  const FLUSH_INTERVAL = 5000; // send events every 5 seconds
  const MAX_TARGET_LEN = 100;

  // ── STATE ──
  const sessionId = generateId();
  let eventBuffer = [];
  let flushTimer = null;

  // ── HELPERS ──
  function generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  function now() { return Date.now(); }

  function getApp() {
    const path = window.location.pathname;
    if (path.startsWith('/freeflix')) return 'FreeFlix';
    if (path.startsWith('/rag'))      return 'RAG';
    if (path.startsWith('/monitoring')) return 'Monitoring';
    return 'Portfolio';
  }

  function sanitizeTarget(el) {
    if (!el) return null;
    const tag  = el.tagName?.toLowerCase() || '';
    const id   = el.id ? `#${el.id}` : '';
    const cls  = el.className && typeof el.className === 'string'
      ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.')
      : '';
    const text = el.innerText?.trim().slice(0, 30) || '';
    return `${tag}${id}${cls}${text ? `[${text}]` : ''}`.slice(0, MAX_TARGET_LEN);
  }

  function push(event) {
    eventBuffer.push({ ...event, ts: now() });
  }

  // ── FLUSH TO BACKEND ──
  async function flush() {
    if (!eventBuffer.length) return;
    const events = [...eventBuffer];
    eventBuffer = [];

    try {
      await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, events }),
        keepalive: true
      });
    } catch (err) {
      // silently fail — don't break the host app
    }
  }

  // ── INIT SESSION ──
  async function initSession() {
    try {
      await fetch(`${API_BASE}/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id:        sessionId,
          app:       getApp(),
          origin:    window.location.origin,
          userAgent: navigator.userAgent,
          screenW:   window.screen.width,
          screenH:   window.screen.height,
          startedAt: new Date().toISOString()
        })
      });
    } catch (err) {
      // silently fail
    }
  }

  // ── CAPTURE CLICKS ──
  function captureClicks() {
    document.addEventListener('click', e => {
      push({
        type:   'click',
        x:      Math.round(e.clientX),
        y:      Math.round(e.clientY),
        target: sanitizeTarget(e.target)
      });
    }, { passive: true });
  }

  // ── CAPTURE SCROLL ──
  function captureScroll() {
    let lastScroll = 0;
    document.addEventListener('scroll', () => {
      const t = now();
      if (t - lastScroll < 500) return; // throttle 500ms
      lastScroll = t;
      push({
        type:  'scroll',
        value: {
          scrollY: Math.round(window.scrollY),
          scrollX: Math.round(window.scrollX),
          depth:   Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100) || 0
        }
      });
    }, { passive: true });
  }

  // ── CAPTURE NAVIGATION (SPA route changes) ──
  function captureNavigation() {
    function recordNav() {
      push({
        type:  'nav',
        target: window.location.pathname,
        value: { app: getApp(), href: window.location.href }
      });
    }

    // Patch pushState
    const origPush = history.pushState.bind(history);
    history.pushState = function (...args) {
      origPush(...args);
      recordNav();
    };

    // Patch replaceState
    const origReplace = history.replaceState.bind(history);
    history.replaceState = function (...args) {
      origReplace(...args);
      recordNav();
    };

    // Back/forward
    window.addEventListener('popstate', recordNav);

    // Record initial page
    recordNav();
  }

  // ── CAPTURE JS ERRORS ──
  function captureErrors() {
    window.addEventListener('error', e => {
      push({
        type:  'error',
        target: e.filename || 'unknown',
        value: {
          message: e.message?.slice(0, 200),
          line:    e.lineno,
          col:     e.colno,
          stack:   e.error?.stack?.slice(0, 500)
        }
      });
    });

    window.addEventListener('unhandledrejection', e => {
      push({
        type:  'error',
        target: 'unhandledrejection',
        value: {
          message: String(e.reason)?.slice(0, 200)
        }
      });
    });
  }

  // ── CAPTURE DOM MUTATIONS ──
  function captureMutations() {
    const observer = new MutationObserver(mutations => {
      const significant = mutations.filter(m =>
        m.addedNodes.length > 0 || m.removedNodes.length > 0
      );
      if (!significant.length) return;
      push({
        type:  'dom',
        value: { mutations: significant.length }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree:   true
    });
  }

  // ── FLUSH ON PAGE HIDE ──
  function capturePageHide() {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flush();
    });
    window.addEventListener('beforeunload', flush);
    window.addEventListener('pagehide', flush);
  }

  // ── START ──
  async function start() {
    await initSession();
    captureClicks();
    captureScroll();
    captureNavigation();
    captureErrors();
    captureMutations();
    capturePageHide();

    // Flush every 5 seconds
    flushTimer = setInterval(flush, FLUSH_INTERVAL);

    console.debug(`[Monitor] session=${sessionId} app=${getApp()}`);
  }

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

})();
