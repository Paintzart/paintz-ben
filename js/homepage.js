// Homepage slider — init after DOM ready
(function () {
  function initHomepageSlider() {
    var sliderImgs = document.querySelectorAll('.slider-img');
    var sliderDots = document.querySelectorAll('.slider-dot');
    if (!sliderImgs.length) return;

    var currentSlide = 0;
    var sliderInterval = null;
    var isPaused = false;

    function showSlide(idx) {
      sliderImgs.forEach(function (img, i) {
        img.classList.toggle('active', i === idx);
      });
      sliderDots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === idx);
        dot.setAttribute('tabindex', '0');
        dot.setAttribute('aria-selected', i === idx ? 'true' : 'false');
      });
      currentSlide = idx;
      sliderImgs.forEach(function (img, i) {
        img.setAttribute('tabindex', i === idx ? '0' : '-1');
      });
    }

    function nextSlide() {
      showSlide((currentSlide + 1) % sliderImgs.length);
    }

    function prevSlide() {
      showSlide((currentSlide - 1 + sliderImgs.length) % sliderImgs.length);
    }

    function restartInterval() {
      clearInterval(sliderInterval);
      if (!isPaused) {
        sliderInterval = setInterval(nextSlide, 5000);
      }
    }

    sliderDots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
        restartInterval();
      });
      dot.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          showSlide(i);
          restartInterval();
        }
      });
    });

    sliderImgs.forEach(function (img, i) {
      img.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          showSlide(i);
          restartInterval();
        }
      });
    });

    var leftArrow = document.getElementById('sliderArrowLeft');
    var rightArrow = document.getElementById('sliderArrowRight');

    if (leftArrow) {
      leftArrow.addEventListener('click', function () {
        prevSlide();
        restartInterval();
      });
    }

    if (rightArrow) {
      rightArrow.addEventListener('click', function () {
        nextSlide();
        restartInterval();
      });
    }

    var stopBtn = document.getElementById('sliderStopBtn');
    if (stopBtn) {
      stopBtn.addEventListener('click', function () {
        if (isPaused) {
          sliderInterval = setInterval(nextSlide, 5000);
          stopBtn.textContent = '⏸';
          stopBtn.setAttribute('aria-label', 'עצור תמונות');
          isPaused = false;
        } else {
          clearInterval(sliderInterval);
          stopBtn.textContent = '▶';
          stopBtn.setAttribute('aria-label', 'המשך תמונות');
          isPaused = true;
        }
      });
    }

    showSlide(0);
    sliderInterval = setInterval(nextSlide, 5000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHomepageSlider);
  } else {
    initHomepageSlider();
  }
})();

// Mobile hot-products row — always start at the first card (scroll to start)
function resetBestSellerScroll() {
  var list = document.getElementById('bestSellerList');
  if (!list || window.matchMedia('(min-width: 769px)').matches) return;
  list.scrollLeft = 0;
}

document.addEventListener('DOMContentLoaded', resetBestSellerScroll);
window.addEventListener('load', resetBestSellerScroll);
window.addEventListener('resize', function () {
  clearTimeout(window._bestSellerScrollTimer);
  window._bestSellerScrollTimer = setTimeout(resetBestSellerScroll, 120);
});

// Best Seller Overlay Quantity Logic
document.addEventListener('DOMContentLoaded', function() {
  const cards = document.querySelectorAll('.best-seller-card');
  
  cards.forEach(function(card, cardIndex) {
    const overlay = card.querySelector('.best-seller-overlay');
    if (!overlay) return;
    
    const qtyGroup = overlay.querySelector('.best-seller-overlay-qty-group');
    if (!qtyGroup) return;
    
    const buttons = qtyGroup.querySelectorAll('.best-seller-overlay-qty-btn');
    const minusBtn = buttons[0];
    const plusBtn = buttons[1];
    const qtyNum = qtyGroup.querySelector('.best-seller-overlay-qty-num');
    const addBtn = overlay.querySelector('.best-seller-btn.add');
    
    // וודא שכל האלמנטים קיימים
    if (!minusBtn || !plusBtn || !qtyNum || !addBtn) return;
    
    // הגדר את הטקסט של הכפתורים
    minusBtn.textContent = '−'; // סימן מינוס יוניקוד
    plusBtn.textContent = '+'; // סימן פלוס
    
    let qty = 1;
    
    function updateQuantity(newQty) {
      qty = Math.max(1, newQty);
      qtyNum.textContent = qty.toString();
    }
    
    minusBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      updateQuantity(qty - 1);
    });
    
    plusBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      updateQuantity(qty + 1);
    });
    
    addBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const fullTitle = card.querySelector('.best-seller-model')?.textContent || 'מוצר';
      const priceText = card.querySelector('.best-seller-price')?.textContent || '';
      const userNote = '';
      
      // מצא תמונה
      const imgStyle = card.querySelector('.best-seller-img')?.style?.backgroundImage || '';
      const imgUrl = imgStyle.match(/url\(['"]?([^'"]*?)['"]?\)/)?.[1] || '';
      
      // פיצול הכותרת למוצרי שש בש בפורמט אחיד
      let title, subtitle;
      if (fullTitle.includes(' | ')) {
        const parts = fullTitle.split(' | ');
        title = parts[0].trim(); // "שש בש"
        subtitle = parts[1].trim(); // "בובספוג"
      } else {
        // אם אין פיצול, נניח שזה שש בש
        if (fullTitle.toLowerCase().includes('שש בש')) {
          title = "שש בש";
          subtitle = fullTitle.replace(/שש בש[\s|]*/, '').trim() || '';
        } else if (fullTitle.toLowerCase().includes('מטקה')) {
          title = "מטקה";
          subtitle = fullTitle.replace(/מטקה[\s|]*/, '').trim() || '';
        } else {
          title = fullTitle.trim();
          subtitle = '';
        }
      }
      
      // יצירת פריט עם כל הפרטים
      const cartItem = {
        title: title,
        subtitle: subtitle,
        notes: userNote,
        desc: '',
        qty: qty,
        price: priceText,
        mainImage: imgUrl, // שמירת התמונה הראשית
        img: imgUrl
      };
      
      // שימוש בפונקציה המשופרת להוספה
      addToCart(cartItem);


      
      // אפס את הכמות בממשק בחזרה ל-1
      updateQuantity(1);
      
      // הודעת הצלחה
      showCenterToast('המוצר נוסף לסל בהצלחה!');
      
      // הכרזה לקוראי מסך
      announceToScreenReader(`המוצר ${fullTitle} נוסף לסל הקניות בהצלחה`);
    });
  });
});

// Toast message function
function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 16px;
      border-radius: 4px;
      z-index: 9999;
      font-family: 'Amatica SC', cursive;
      opacity: 0;
      transform: translateY(100%);
      transition: all 0.3s ease;
    `;
    document.body.appendChild(toast);
  }
  
  toast.textContent = message;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(100%)';
  }, 3000);
}

function showCenterToast(message) {
  // Create center toast if it doesn't exist
  let centerToast = document.getElementById('centerToast');
  if (!centerToast) {
    centerToast = document.createElement('div');
    centerToast.id = 'centerToast';
    centerToast.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
              background-color: #4C8467; /* שינוי לירוק-כחול כהה שעומד בתנאי הנגישות */
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-family: 'Amatica SC', cursive;
      font-size: 20px;
      font-weight: bold;
      z-index: 10100;
      display: none;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    document.body.appendChild(centerToast);
  }
  
  centerToast.textContent = message;
  centerToast.style.display = 'block';
  setTimeout(() => {
    centerToast.style.display = 'none';
  }, 3000);
}

function announceToScreenReader(message) {
  var announcements = document.getElementById('accessibilityAnnouncements');
  if (!announcements) return;
  announcements.textContent = message;
  setTimeout(function () { announcements.textContent = ''; }, 3000);
}

function addToCart(item, onlyQty) {
  let cart;
  if (window.cartSync && typeof window.cartSync.loadCart === 'function') {
    cart = window.cartSync.loadCart();
  } else {
    try { cart = JSON.parse(localStorage.getItem('cart') || '[]'); }
    catch (e) { cart = []; }
  }

  const existingIndex = window.cartSync && window.cartSync.areItemsIdentical
    ? cart.findIndex(function (existing) { return window.cartSync.areItemsIdentical(existing, item); })
    : cart.findIndex(function (existing) {
        return existing.title === item.title &&
          existing.subtitle === item.subtitle &&
          existing.notes === item.notes &&
          existing.desc === item.desc &&
          existing.price === item.price &&
          JSON.stringify(existing.files || []) === JSON.stringify(item.files || []);
      });

  if (existingIndex !== -1) {
    cart[existingIndex].qty += (item.qty || 1);
  } else if (!onlyQty) {
    cart.push(item);
  }

  if (window.cartSync && typeof window.cartSync.saveCart === 'function') {
    window.cartSync.saveCart(cart, true);
  } else {
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  if (window.PaintzSiteUI) {
    window.PaintzSiteUI.updateCartBadge();
    window.PaintzSiteUI.renderCart();
    var highlightIdx = existingIndex !== -1 ? existingIndex : cart.length - 1;
    if (window.PaintzSiteUI.openSideCart) window.PaintzSiteUI.openSideCart(highlightIdx);
  }

  if (window.cartSync && typeof window.cartSync.synchronize === 'function') {
    setTimeout(function () { window.cartSync.synchronize('add-to-cart-complete'); }, 100);
  }
}

// בדיקה אם תוסף האינסטגרם נטען - אם לא, מציג גיבוי
function checkInstagramWidget() {
  // מחכה קצת לתוסף לטעון
  setTimeout(function() {
    const instagramGallery = document.getElementById('instagramGallery');
    const instagramFallback = document.getElementById('instagramFallback');
    
    if (instagramGallery && instagramFallback) {
      // בודק אם יש תוכן בתוסף האינסטגרם
      const elfsightWidget = instagramGallery.querySelector('.elfsight-app-458ff3d3-8da7-460b-8d4f-1fcde129ca8b');
      const hasContent = elfsightWidget && elfsightWidget.children.length > 0;
      
      // אם יש תוכן - מציג את הגלריה ומסתיר את הגיבוי
      if (hasContent && elfsightWidget) {
        instagramGallery.style.display = 'flex';
        instagramFallback.style.display = 'none';
      } else {
        // אם אין תוכן או שהתוסף לא נטען, מציג את הגיבוי ומסתיר את הגלריה
        instagramGallery.style.display = 'none';
        instagramFallback.style.display = 'flex';
      }
    }
  }, 3000); // מחכה 3 שניות לתוסף לטעון
}

// הרצת הבדיקה כשהדף נטען
document.addEventListener('DOMContentLoaded', function() {
  checkInstagramWidget();
});

// בדיקה נוספת אחרי 5 שניות למקרה שהתוסף נטען מאוחר יותר
setTimeout(function() {
  checkInstagramWidget();
}, 5000);