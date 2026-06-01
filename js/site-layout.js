/**
 * Paintz shared layout loader — injects header, footer, and cart partials once per page.
 */
(function () {
  'use strict';

  var PARTIALS = [
    { placeholder: 'site-cart', file: 'partials/cart.html' },
    { placeholder: 'site-header', file: 'partials/header.html' },
    { placeholder: 'site-footer', file: 'partials/footer.html' }
  ];

  function injectPartial(placeholderId, html) {
    var el = document.getElementById(placeholderId);
    if (!el) return;
    el.outerHTML = html;
  }

  function setCopyrightYear() {
    var yearEl = document.getElementById('copyright-year');
    if (yearEl) {
      yearEl.textContent = 'Paintz ' + new Date().getFullYear() + '©';
    }
  }

  function isCheckoutFlowPage() {
    var body = document.body;
    if (!body) return false;
    if (body.classList.contains('page-shopping-cart') || body.classList.contains('page-order')) {
      return true;
    }
    var path = decodeURIComponent(window.location.pathname || '').toLowerCase();
    var file = path.split('/').pop() || '';
    if (file.indexOf('order.html') !== -1) return true;
    return file.indexOf('shopping') !== -1 && file.indexOf('cart') !== -1;
  }

  function hideCheckoutFlowCartChrome() {
    if (!isCheckoutFlowPage()) return;
    var cartLink = document.querySelector('header .cart');
    if (cartLink) cartLink.remove();
    ['sideCart', 'cartOverlay', 'cartDeleteDialog'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.remove();
    });
  }

  function initLogoLink() {
    var logo = document.querySelector('header .logo');
    if (!logo || logo.dataset.bound === '1') return;
    logo.dataset.bound = '1';
    logo.style.cursor = 'pointer';
    logo.setAttribute('tabindex', '0');
    logo.setAttribute('role', 'link');
    logo.setAttribute('aria-label', 'לוגו Paintz - חזרה לעמוד הבית');
    function goHome() {
      window.location.href = 'homepage.html';
    }
    logo.addEventListener('click', goHome);
    logo.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        goHome();
      }
    });
  }

  function getSiteBaseUrl() {
    var scripts = document.getElementsByTagName('script');
    for (var i = scripts.length - 1; i >= 0; i--) {
      var src = scripts[i].getAttribute('src');
      if (!src || src.indexOf('site-layout.js') === -1) continue;
      return new URL('../', new URL(src, window.location.href)).href;
    }
    return new URL('./', window.location.href).href;
  }

  function partialUrl(file) {
    return new URL(file, getSiteBaseUrl()).href;
  }

  async function loadPartials() {
    await Promise.all(
      PARTIALS.map(async function (p) {
        var el = document.getElementById(p.placeholder);
        if (!el) return;
        try {
          var res = await fetch(partialUrl(p.file));
          if (!res.ok) throw new Error('Failed to load ' + p.file);
          injectPartial(p.placeholder, await res.text());
        } catch (err) {
          console.warn('Paintz: could not load partial', p.file, err);
        }
      })
    );
    setCopyrightYear();
    hideCheckoutFlowCartChrome();
    initLogoLink();
    if (window.PaintzSiteUI && typeof window.PaintzSiteUI.init === 'function') {
      window.PaintzSiteUI.init();
    }
    if (window.cartSync && typeof window.cartSync.synchronize === 'function') {
      window.cartSync.synchronize('partials-loaded');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadPartials);
  } else {
    loadPartials();
  }
})();
