'use strict';
/**
 * Paintz shared UI — shop popup, side cart, keyboard navigation.
 * Loaded on every page; initializes after partials are injected.
 */
window.PaintzSiteUI = (function () {
  let cart = [];
  let cartDeleteIdx = null;

  let shopBtn, shopPopup, cartBtn, sideCart, cartOverlay, closeSideCartBtn;
  let sideCartList, viewCartBtn, cartBadge;

  function ensureCartElements() {
    if (!sideCart) sideCart = document.getElementById('sideCart');
    if (!cartOverlay) cartOverlay = document.getElementById('cartOverlay');
    if (!sideCartList) sideCartList = document.getElementById('sideCartList');
    if (!closeSideCartBtn) closeSideCartBtn = document.getElementById('closeSideCart');
    if (!viewCartBtn) viewCartBtn = document.getElementById('viewCartBtn');
    if (!cartBtn) cartBtn = document.querySelector('.cart');
    if (!cartBadge) cartBadge = document.getElementById('cartBadge');
  }

  function escapeHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function buildSideCartImageHtml(item) {
    const rawImage = item.img || item.image || item.mainImage;
    if (!rawImage) return '';
    const urls = window.cartSync && window.cartSync.resolveCartImageUrl
      ? window.cartSync.resolveCartImageUrl(rawImage)
      : { primary: rawImage, fallback: rawImage };
    const alt = escapeHtml(item.subtitle || item.title || 'מוצר');
    return '<img class="side-cart-item-thumb" src="' + urls.primary + '" data-fallback="' + urls.fallback + '" alt="' + alt + '">';
  }

  function bindSideCartImageFallback(row) {
    const imgEl = row.querySelector('.side-cart-item-thumb');
    if (!imgEl) return;
    imgEl.addEventListener('error', function onSideCartImageError() {
      const fallback = this.dataset.fallback;
      const allowFallback = window.cartSync && typeof window.cartSync.isAllowedCartImageSrc === 'function'
        ? window.cartSync.isAllowedCartImageSrc(fallback)
        : !fallback || fallback.indexOf(window.location.origin) === 0;
      if (fallback && allowFallback && this.src !== fallback && !this.dataset.fallbackUsed) {
        this.dataset.fallbackUsed = '1';
        this.src = fallback;
        return;
      }
      this.style.visibility = 'hidden';
    });
  }

  function resolveCartTitles(item) {
    var mainTitle = 'עיצוב אישי';
    var subTitle = '';
    if (item.subtitle) {
      mainTitle = item.title || '';
      subTitle = item.subtitle;
    } else if (item.title && item.title.indexOf('|') !== -1) {
      var parts = item.title.split('|');
      mainTitle = parts[0].trim();
      subTitle = parts[1].trim();
    } else if (item.title) {
      subTitle = item.title;
    }
    return { mainTitle: mainTitle, subTitle: subTitle };
  }

  function announceToScreenReader(message) {
    const announcements = document.getElementById('accessibilityAnnouncements');
    if (!announcements) return;
    announcements.textContent = message;
    setTimeout(function () { announcements.textContent = ''; }, 3000);
  }

  let shopPopupJustOpened = false;
  let shopPopupDocListenerBound = false;
  let shopPopupLastToggle = 0;
  let shopPopupCloseTimer = null;

  function ensureShopElements() {
    if (!shopBtn) shopBtn = document.getElementById('shopPopupBtn');
    if (!shopPopup) shopPopup = document.getElementById('shopPopup');
    return !!(shopBtn && shopPopup);
  }

  function isShopPopupOpen() {
    return shopPopup && (shopPopup.classList.contains('is-open') || shopPopup.style.display === 'block');
  }

  function closeAllSubs() {
    document.querySelectorAll('.popup-sub').forEach(function (sub) {
      sub.classList.remove('show');
      sub.style.display = '';
    });
  }

  function clearShopCloseTimer() {
    if (shopPopupCloseTimer) {
      clearTimeout(shopPopupCloseTimer);
      shopPopupCloseTimer = null;
    }
  }

  function positionShopPopup() {
    if (!ensureShopElements()) return;
    const rect = shopBtn.getBoundingClientRect();
    const attachGap = window.innerWidth > 700 ? 0 : 6;
    shopPopup.style.top = (rect.bottom + attachGap) + 'px';
    shopPopup.style.right = (window.innerWidth - rect.right) + 'px';
    shopPopup.style.left = 'auto';
    shopPopup.style.width = '';
    shopPopup.style.maxWidth = '';
    shopPopup.style.transform = 'none';
  }

  function scheduleShopClose() {
    clearShopCloseTimer();
    shopPopupCloseTimer = setTimeout(function () {
      if (!ensureShopElements() || !isShopPopupOpen()) return;
      if (shopBtn.matches(':hover') || shopPopup.matches(':hover')) return;
      closeShopPopup();
    }, 220);
  }

  function openShopPopup() {
    if (!ensureShopElements()) return;
    clearShopCloseTimer();
    closeAllSubs();
    positionShopPopup();
    shopPopup.style.display = 'block';
    shopPopup.classList.add('is-open');
    shopBtn.setAttribute('aria-expanded', 'true');
    shopPopupJustOpened = true;
    setTimeout(function () { shopPopupJustOpened = false; }, 350);
    if (window.innerWidth > 700) {
      setTimeout(function () {
        const firstItem = shopPopup.querySelector('a, .popup-main-btn');
        if (firstItem) firstItem.focus();
      }, 100);
    }
  }

  function closeShopPopup() {
    if (!ensureShopElements()) return;
    clearShopCloseTimer();
    shopPopup.style.display = 'none';
    shopPopup.classList.remove('is-open');
    closeAllSubs();
    shopBtn.setAttribute('aria-expanded', 'false');
  }

  function toggleShopPopup(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const now = Date.now();
    if (now - shopPopupLastToggle < 400) return;
    shopPopupLastToggle = now;
    if (!ensureShopElements()) return;
    if (isShopPopupOpen()) closeShopPopup();
    else openShopPopup();
  }

  function onShopBtnMouseLeave(e) {
    if (!shopPopup || !shopBtn) return;
    if (shopPopup.contains(e.relatedTarget)) return;
    if (window.innerWidth > 700) scheduleShopClose();
    else closeShopPopup();
  }

  function onShopPopupMouseLeave(e) {
    if (!shopPopup || !shopBtn) return;
    if (shopBtn.contains(e.relatedTarget)) return;
    if (window.innerWidth > 700) scheduleShopClose();
    else closeShopPopup();
  }

  function onShopPopupMouseEnter() {
    clearShopCloseTimer();
  }

  function clearShopPopupEvents() {
    if (!shopBtn || !shopPopup) return;
    shopBtn.removeEventListener('click', toggleShopPopup);
    shopBtn.removeEventListener('mouseenter', openShopPopup);
    shopBtn.removeEventListener('mouseleave', onShopBtnMouseLeave);
    shopPopup.removeEventListener('mouseleave', onShopPopupMouseLeave);
    shopPopup.removeEventListener('mouseenter', onShopPopupMouseEnter);
  }

  function setShopPopupEvents() {
    if (!ensureShopElements()) return;
    clearShopPopupEvents();
    if (window.innerWidth > 700) {
      shopBtn.addEventListener('mouseenter', openShopPopup);
      shopBtn.addEventListener('mouseleave', onShopBtnMouseLeave);
      shopPopup.addEventListener('mouseenter', onShopPopupMouseEnter);
      shopPopup.addEventListener('mouseleave', onShopPopupMouseLeave);
    } else {
      shopBtn.addEventListener('click', toggleShopPopup);
    }
  }

  function onDocumentCloseShopPopup(e) {
    if (shopPopupJustOpened) return;
    if (!ensureShopElements() || !isShopPopupOpen()) return;
    if (shopBtn.contains(e.target) || shopPopup.contains(e.target)) return;
    closeShopPopup();
  }

  function setSubmenuEvents() {
    document.querySelectorAll('.popup-main-btn').forEach(function (btn) {
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
    });
    document.querySelectorAll('.popup-main-btn').forEach(function (btn) {
      const target = btn.getAttribute('data-target');
      const sub = document.getElementById('sub-' + target);
      if (!sub) return;
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (sub.classList.contains('show')) {
          sub.classList.remove('show');
          sub.style.display = '';
        } else {
          closeAllSubs();
          sub.classList.add('show');
          if (window.innerWidth <= 700) sub.style.display = 'block';
        }
      });
      btn.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.click();
        }
      });
    });
  }

  function handleKeyboardNavigation(e) {
    if (shopBtn && (e.target === shopBtn || shopBtn.contains(e.target)) && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      toggleShopPopup(e);
    }
    if (e.key === 'Escape') {
      closeShopPopup();
      if (sideCart && sideCart.classList.contains('active')) closeSideCart();
    }
  }

  function initializeCart() {
    if (window.cartSync && typeof window.cartSync.loadCart === 'function') {
      cart = window.cartSync.loadCart();
    } else {
      try { cart = JSON.parse(localStorage.getItem('cart') || '[]'); }
      catch (e) { cart = []; }
    }
  }

  function getColorFromName(colorName) {
    const colorMap = {
      'אדום': '#FF0000', 'כחול': '#0000FF', 'ירוק': '#008000', 'צהוב': '#FFFF00',
      'כתום': '#FFA500', 'סגול': '#800080', 'ורוד': '#FFC0CB', 'חום': '#A52A2A',
      'שחור': '#000000', 'לבן': '#FFFFFF', 'אפור': '#808080', 'תכלת': '#00CED1',
      'בז\'': '#F5F5DC', 'זהב': '#FFD700', 'כסף': '#C0C0C0', 'ברונזה': '#CD7F32'
    };
    return colorMap[colorName.trim()] || '#ccc';
  }

  function truncateText(text, maxLength) {
    maxLength = maxLength || 10;
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  function updateCartBadge() {
    ensureCartElements();
    if (!cartBadge) return;
    try {
      const stored = JSON.parse(localStorage.getItem('cart') || '[]');
      const total = stored.reduce(function (sum, item) { return sum + (item.qty || 1); }, 0);
      if (total > 0) {
        cartBadge.style.display = 'flex';
        cartBadge.textContent = total;
      } else {
        cartBadge.style.display = 'none';
      }
    } catch (e) {
      cartBadge.style.display = 'none';
    }
  }

  function renderCartNotesLocal(item) {
    if (window.cartSync && typeof window.cartSync.renderCartNotes === 'function') {
      return window.cartSync.renderCartNotes(item);
    }
    const details = [];
    const notesText = item.notes || '';
    if (notesText.trim()) {
      details.push('<li><span class=\'side-cart-item-details-label\'>הערה:</span><span class=\'side-cart-item-details-value\'>' + truncateText(notesText.trim()) + '</span></li>');
    }
    return details.join('');
  }

  function renderCart() {
    ensureCartElements();
    initializeCart();
    if (!sideCartList) return;
    sideCartList.innerHTML = '';
    if (!cart.length) {
      sideCartList.innerHTML = '<div style="text-align:center;padding:20px;font-family:\'Amatica SC\',cursive;font-size:20px;color:#8B6B47;">העגלה ריקה</div>';
      return;
    }
    cart.forEach(function (item, idx) {
      var titles = resolveCartTitles(item);
      var mainTitle = escapeHtml(titles.mainTitle);
      var subTitle = escapeHtml(titles.subTitle);
      var details = renderCartNotesLocal(item);
      var priceHtml = window.cartSync && window.cartSync.renderCartPrice
        ? window.cartSync.renderCartPrice(item) : '';

      var row = document.createElement('div');
      row.className = 'side-cart-item';
      row.setAttribute('data-idx', idx);
      row.style.position = 'relative';
      row.innerHTML =
        '<div style="height:120px;display:flex;flex-direction:row;width:100%;position:relative;flex:1;min-width:0;">' +
          '<div style="flex:1;height:100%;display:flex;align-items:center;">' +
            '<div style="width:100%;display:flex;flex-direction:column;gap:8px;">' +
              '<div style="height:30px;display:flex;align-items:center;justify-content:center;">' +
                '<span class="side-cart-item-title-main" style="font-family:\'Amatica SC\',cursive;font-size:22px;font-weight:bold;color:#8B6B47;text-align:center;line-height:1.1;">' + mainTitle + '</span>' +
              '</div>' +
              '<div style="height:24px;display:flex;align-items:center;justify-content:center;">' +
                '<span class="side-cart-item-title-sub" style="font-family:\'Amatica SC\',cursive;font-size:16px;color:#8B6B47;text-align:center;font-weight:normal;">' + subTitle + '</span>' +
              '</div>' +
              priceHtml +
            '</div>' +
          '</div>' +
          '<div style="width:48px;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;margin-left:8px;flex-shrink:0;">' +
            '<button class="side-cart-item-add-btn" type="button" title="הוסף" aria-label="הוסף כמות" style="background:none;border:none;font-size:22px;color:#4C8467;cursor:pointer;width:28px;height:28px;display:flex;align-items:center;justify-content:center;">+</button>' +
            '<span class="side-cart-item-qty" style="width:32px;height:28px;font-size:18px;color:#8B6B47;display:flex;align-items:center;justify-content:center;background:none;border-radius:0;border:none;font-family:\'Amatica SC\',cursive;font-weight:bold;" aria-label="כמות: ' + item.qty + '">' + item.qty + '</span>' +
            '<button class="side-cart-item-minus-btn" type="button" title="הפחת" aria-label="הפחת כמות" style="background:none;border:none;font-size:22px;color:#4C8467;cursor:pointer;width:28px;height:28px;display:flex;align-items:center;justify-content:center;">–</button>' +
          '</div>' +
        '</div>' +
        '<div class="side-cart-item-details" style="padding:0 0 8px 0;">' +
          '<ul class="side-cart-item-details-list" style="max-width:100%;overflow:hidden;">' + details + '</ul>' +
        '</div>' +
        '<button class="side-cart-item-trash-btn" type="button" title="מחק" aria-label="מחק מוצר מהעגלה" style="position:absolute;left:8px;bottom:8px;background:none;border:none;padding:0;margin:0;cursor:pointer;width:22px;height:22px;">' +
          '<span class="side-cart-item-trash-icon"></span>' +
        '</button>';

      row.querySelector('.side-cart-item-trash-btn').onclick = function (e) { e.stopPropagation(); showDeleteDialog(idx); };
      row.querySelector('.side-cart-item-add-btn').onclick = function (e) {
        e.stopPropagation();
        if (window.cartSync) { window.cartSync.updateItem(idx, { qty: cart[idx].qty + 1 }); }
        else { cart[idx].qty += 1; localStorage.setItem('cart', JSON.stringify(cart)); }
        setTimeout(function () {
          if (window.cartSync && typeof window.cartSync.loadCart === 'function') cart = window.cartSync.loadCart();
          else { try { cart = JSON.parse(localStorage.getItem('cart') || '[]'); } catch (err) { cart = []; } }
          updateCartBadge(); renderCart();
        }, 50);
      };
      row.querySelector('.side-cart-item-minus-btn').onclick = function (e) {
        e.stopPropagation();
        if (cart[idx].qty > 1) {
          if (window.cartSync) { window.cartSync.updateItem(idx, { qty: cart[idx].qty - 1 }); }
          else { cart[idx].qty -= 1; localStorage.setItem('cart', JSON.stringify(cart)); }
          setTimeout(function () {
            if (window.cartSync && typeof window.cartSync.loadCart === 'function') cart = window.cartSync.loadCart();
            else { try { cart = JSON.parse(localStorage.getItem('cart') || '[]'); } catch (err) { cart = []; } }
            updateCartBadge(); renderCart();
          }, 50);
        } else showDeleteDialog(idx);
      };
      sideCartList.appendChild(row);
    });
  }

  function openSideCart(highlightIndex) {
    ensureCartElements();
    renderCart();
    if (!sideCart || !cartOverlay) return;
    sideCart.classList.add('active');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (closeSideCartBtn) setTimeout(function () { closeSideCartBtn.focus(); }, 100);

    if (highlightIndex !== false && highlightIndex !== null && highlightIndex !== -1) {
      setTimeout(function () { highlightCartItem(highlightIndex); }, 200);
    }
  }

  function highlightCartItem(highlightIndex) {
    ensureCartElements();
    if (!sideCartList) return;
    var items = sideCartList.querySelectorAll('.side-cart-item');
    if (!items.length) return;

    var targetItem;
    if (highlightIndex === true || highlightIndex === undefined) {
      targetItem = items[items.length - 1];
    } else if (typeof highlightIndex === 'number' && highlightIndex >= 0) {
      targetItem = items[highlightIndex] || items[items.length - 1];
    }
    if (!targetItem) return;

    targetItem.classList.add('just-added');
    targetItem.scrollIntoView({ behavior: 'smooth', block: 'center' });

    var titleEl = targetItem.querySelector('.side-cart-item-title-main');
    var subEl = targetItem.querySelector('.side-cart-item-title-sub');
    var label = [titleEl && titleEl.textContent, subEl && subEl.textContent].filter(Boolean).join(' — ');
    if (label) {
      announceToScreenReader('נוסף לסל: ' + label);
    }

    setTimeout(function () {
      targetItem.classList.remove('just-added');
    }, 2000);
  }

  function closeSideCart() {
    if (!sideCart || !cartOverlay) return;
    sideCart.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  function removeFromCart(idx) {
    if (idx < 0 || idx >= cart.length) return;
    if (window.cartSync) { window.cartSync.removeItem(idx); cart = window.cartSync.loadCart(); }
    else { cart.splice(idx, 1); localStorage.setItem('cart', JSON.stringify(cart)); }
    updateCartBadge(); renderCart();
  }

  function showDeleteDialog(idx) {
    cartDeleteIdx = idx;
    const dialog = document.getElementById('cartDeleteDialog');
    if (dialog) dialog.style.display = 'flex';
  }

  function isCheckoutPage() {
    var body = document.body;
    if (body && (body.classList.contains('page-shopping-cart') || body.classList.contains('page-order'))) {
      return true;
    }
    var path = decodeURIComponent(window.location.pathname || '').toLowerCase();
    var file = path.split('/').pop() || '';
    if (file.indexOf('order.html') !== -1) return true;
    return (file.indexOf('shopping') !== -1 && file.indexOf('cart') !== -1);
  }

  function adaptCheckoutPagesCartUi() {
    ensureCartElements();
    if (!isCheckoutPage()) {
      if (cartBtn) {
        cartBtn.addEventListener('click', function (e) {
          e.preventDefault();
          openSideCart(false);
        });
      }
      return;
    }
    if (cartBtn) cartBtn.style.display = 'none';
    if (viewCartBtn) viewCartBtn.style.display = 'none';
    var siteCartRoot = document.getElementById('site-cart');
    if (siteCartRoot) siteCartRoot.style.display = 'none';
  }

  function initSideCart() {
    ensureCartElements();
    if (!sideCart) return;
    sideCart.classList.remove('active');
    initializeCart();
    updateCartBadge();
    renderCart();

    adaptCheckoutPagesCartUi();
    if (cartOverlay) cartOverlay.addEventListener('click', closeSideCart);
    if (closeSideCartBtn) closeSideCartBtn.addEventListener('click', closeSideCart);
    if (viewCartBtn) viewCartBtn.addEventListener('click', function () { window.location.href = 'Shopping Cart.html'; });

    const yesBtn = document.getElementById('cartDeleteYes');
    const noBtn = document.getElementById('cartDeleteNo');
    if (yesBtn) yesBtn.onclick = function () {
      if (cartDeleteIdx !== null) removeFromCart(cartDeleteIdx);
      cartDeleteIdx = null;
      if (document.getElementById('cartDeleteDialog')) document.getElementById('cartDeleteDialog').style.display = 'none';
    };
    if (noBtn) noBtn.onclick = function () {
      cartDeleteIdx = null;
      if (document.getElementById('cartDeleteDialog')) document.getElementById('cartDeleteDialog').style.display = 'none';
    };

    window.addEventListener('storage', function (e) {
      if (e.key === 'cart') { initializeCart(); updateCartBadge(); renderCart(); }
    });
  }

  function initShopPopup() {
    if (!ensureShopElements()) return;
    setShopPopupEvents();
    setSubmenuEvents();
    if (!shopPopupDocListenerBound) {
      document.addEventListener('click', onDocumentCloseShopPopup);
      document.addEventListener('keydown', handleKeyboardNavigation);
      shopPopupDocListenerBound = true;
    }
    window.addEventListener('resize', function () {
      setShopPopupEvents();
      setSubmenuEvents();
      if (isShopPopupOpen()) positionShopPopup();
    });
  }

  function initProductLinkParams() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href*="Product.html"]');
      if (!link) return;
      try {
        var url = new URL(link.getAttribute('href'), window.location.href);
        var product = url.searchParams.get('product');
        var id = url.searchParams.get('id');
        if (product && id) {
          sessionStorage.setItem('paintzProductParams', JSON.stringify({ product: product, id: id }));
        }
      } catch (err) {}
    }, true);
  }

  function init() {
    ensureShopElements();
    ensureCartElements();

    initShopPopup();
    initSideCart();
    initProductLinkParams();
  }

  return { init: init, updateCartBadge: updateCartBadge, renderCart: renderCart, openSideCart: openSideCart, openShopPopup: openShopPopup, closeShopPopup: closeShopPopup };
})();

// Keep global renderCart/updateCartBadge pointing to the shared UI implementation
window.renderCart = function () {
  if (window.PaintzSiteUI && typeof window.PaintzSiteUI.renderCart === 'function') {
    window.PaintzSiteUI.renderCart();
  }
};
window.updateCartBadge = function () {
  if (window.PaintzSiteUI && typeof window.PaintzSiteUI.updateCartBadge === 'function') {
    window.PaintzSiteUI.updateCartBadge();
  }
};
