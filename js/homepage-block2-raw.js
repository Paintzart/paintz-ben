// וידוא שה-side-cart מוסתר בטעינת הדף
    document.addEventListener('DOMContentLoaded', function() {
      const sideCart = document.getElementById('sideCart');
      if (sideCart) {
        sideCart.classList.remove('active');
      }
    });
// Simple slider logic
const sliderImgs = document.querySelectorAll('.slider-img');
const sliderDots = document.querySelectorAll('.slider-dot');
let currentSlide = 0;
let sliderInterval = null;


function nextSlide() {
  let next = (currentSlide + 1) % sliderImgs.length;
  showSlide(next);
}

function prevSlide() {
  let prev = (currentSlide - 1 + sliderImgs.length) % sliderImgs.length;
  showSlide(prev);
}

// Event listeners for dots
sliderDots.forEach((dot, i) => {
  dot.addEventListener('click', () => {
    showSlide(i);
    clearInterval(sliderInterval);
    if (!isPaused) {
      sliderInterval = setInterval(nextSlide, 5000);
    }
  });
  
  // Keyboard support for dots
  dot.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      showSlide(i);
      clearInterval(sliderInterval);
      if (!isPaused) {
        sliderInterval = setInterval(nextSlide, 5000);
      }
    }
  });
});

// Event listeners for slider images (Enter key navigation)
sliderImgs.forEach((img, i) => {
  img.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      showSlide(i);
      clearInterval(sliderInterval);
      if (!isPaused) {
        sliderInterval = setInterval(nextSlide, 5000);
      }
    }
  });
});

// Event listeners for arrows
const leftArrow = document.getElementById('sliderArrowLeft');
const rightArrow = document.getElementById('sliderArrowRight');

if (leftArrow) {
  leftArrow.addEventListener('click', () => {
    prevSlide();
    clearInterval(sliderInterval);
    if (!isPaused) {
      sliderInterval = setInterval(nextSlide, 5000);
    }
    makeDotsAccessible();
  });
}

if (rightArrow) {
  rightArrow.addEventListener('click', () => {
    nextSlide();
    clearInterval(sliderInterval);
    if (!isPaused) {
      sliderInterval = setInterval(nextSlide, 5000);
    }
    makeDotsAccessible();
  });
}

sliderInterval = setInterval(nextSlide, 5000);

// Stop/Start button functionality
const stopBtn = document.getElementById('sliderStopBtn');
let isPaused = false;

if (stopBtn) {
  stopBtn.addEventListener('click', () => {
    if (isPaused) {
      // Resume
      sliderInterval = setInterval(nextSlide, 5000);
      stopBtn.textContent = '⏸';
      stopBtn.setAttribute('aria-label', 'עצור תמונות');
      isPaused = false;
    } else {
      // Pause
      clearInterval(sliderInterval);
      stopBtn.textContent = '▶';
      stopBtn.setAttribute('aria-label', 'המשך תמונות');
      isPaused = true;
    }
    makeDotsAccessible();
  });
}

// Make all dots accessible
function makeDotsAccessible() {
  sliderDots.forEach((dot, i) => {
    dot.setAttribute('tabindex', '0');
  });
}

// Make images accessible only for active slide
function makeImagesAccessible() {
  sliderImgs.forEach((img, i) => {
    if (i === currentSlide) {
      img.setAttribute('tabindex', '0');
    } else {
      img.setAttribute('tabindex', '-1');
    }
  });
}

// Initialize dots and images accessibility
makeDotsAccessible();
makeImagesAccessible();

// Update dots accessibility when slide changes
function showSlide(idx) {
  sliderImgs.forEach((img, i) => {
    img.classList.toggle('active', i === idx);
  });
  sliderDots.forEach((dot, i) => {
    dot.classList.toggle('active', i === idx);
    dot.setAttribute('tabindex', '0'); // Keep all dots accessible
    if (i === idx) {
      dot.setAttribute('aria-selected', 'true');
    } else {
      dot.setAttribute('aria-selected', 'false');
    }
  });
  currentSlide = idx;
  makeImagesAccessible();
}

// --- Shop Popup Logic ---
const shopBtn = document.getElementById('shopPopupBtn');
const shopPopup = document.getElementById('shopPopup');

// --- נגישות - תמיכה במקלדת ---
function handleKeyboardNavigation(e) {
  // Enter או Space לפתיחת תפריט חנות
  if (e.target.id === 'shopPopupBtn' && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault();
    if (shopPopup.style.display === 'block') {
      closeShopPopup();
    } else {
      openShopPopup();
    }
  }
  
  // Escape לסגירת תפריטים
  if (e.key === 'Escape') {
    closeShopPopup();
    if (sideCart.classList.contains('active')) {
      closeSideCart();
    }
  }
  
  // Tab לניווט בתפריט
  if (e.key === 'Tab' && shopPopup.style.display === 'block') {
    const focusableElements = shopPopup.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
    if (focusableElements.length > 0) {
      if (e.shiftKey && document.activeElement === focusableElements[0]) {
        e.preventDefault();
        focusableElements[focusableElements.length - 1].focus();
      } else if (!e.shiftKey && document.activeElement === focusableElements[focusableElements.length - 1]) {
        e.preventDefault();
        focusableElements[0].focus();
      }
    }
  }
}

// הוספת מאזיני מקלדת
document.addEventListener('keydown', handleKeyboardNavigation);

// --- נגישות - הכרזת הודעות לקוראי מסך ---
function announceToScreenReader(message) {
  const announcements = document.getElementById('accessibilityAnnouncements');
  if (announcements) {
    announcements.textContent = message;
    // ניקוי ההודעה אחרי 3 שניות
    setTimeout(() => {
      announcements.textContent = '';
    }, 3000);
  }
}

function positionShopPopup() {
  const rect = shopBtn.getBoundingClientRect();
  shopPopup.style.top = rect.bottom + 'px';
  shopPopup.style.right = (window.innerWidth - rect.right) + 'px';
  shopPopup.style.left = 'auto';
  shopPopup.style.transform = 'none';
}

function openShopPopup() {
  positionShopPopup();
  shopPopup.style.display = 'block';
  shopBtn.setAttribute('aria-expanded', 'true');
  
  // העברת פוקוס לפריט הראשון בתפריט
  setTimeout(() => {
    const firstItem = shopPopup.querySelector('a, .popup-main-btn');
    if (firstItem) {
      firstItem.focus();
    }
  }, 100);
}
function closeShopPopup() {
  shopPopup.style.display = 'none';
  closeAllSubs();
  shopBtn.setAttribute('aria-expanded', 'false');
}

// Desktop: open on hover, Mobile: open on click
function setShopPopupEvents() {
  if (window.innerWidth > 700) {
    // Desktop: hover
    shopBtn.removeEventListener('click', shopBtn._shopClickHandler || (()=>{}));
    shopBtn.addEventListener('mouseenter', openShopPopup);
    shopBtn.addEventListener('mouseleave', function(e) {
      if (!shopPopup.contains(e.relatedTarget)) closeShopPopup();
    });
    shopPopup.addEventListener('mouseleave', function(e) {
      if (!shopBtn.contains(e.relatedTarget)) closeShopPopup();
    });
    shopPopup.addEventListener('mouseenter', function() { openShopPopup(); });
  } else {
    // Mobile: click
    shopBtn._shopClickHandler = function(e) {
      e.stopPropagation();
      if (shopPopup.style.display === 'block') {
        closeShopPopup();
      } else {
        openShopPopup();
      }
    };
    shopBtn.addEventListener('click', shopBtn._shopClickHandler);
    shopBtn.removeEventListener('mouseenter', openShopPopup);
    shopBtn.removeEventListener('mouseleave', closeShopPopup);
    shopPopup.removeEventListener('mouseleave', closeShopPopup);
    shopPopup.removeEventListener('mouseenter', openShopPopup);
  }
}
setShopPopupEvents();
window.addEventListener('resize', setShopPopupEvents);

window.addEventListener('resize', function() {
  if (shopPopup.style.display === 'block') {
    positionShopPopup();
  }
});

document.addEventListener('click', function(e) {
  if (!shopPopup.contains(e.target) && e.target !== shopBtn) {
    closeShopPopup();
  }
});

// Submenu logic
function closeAllSubs() {
  document.querySelectorAll('.popup-sub').forEach(sub => sub.style.display = 'none');
}

function setSubmenuEvents() {
  const isDesktop = window.innerWidth > 700;
  document.querySelectorAll('.popup-main-btn').forEach(btn => {
    const target = btn.getAttribute('data-target');
    const sub = document.getElementById('sub-' + target);
    // ניקוי מאזינים ישנים
    btn.replaceWith(btn.cloneNode(true));
  });
  // צריך לבחור מחדש אחרי cloneNode
  document.querySelectorAll('.popup-main-btn').forEach(btn => {
    const target = btn.getAttribute('data-target');
    const sub = document.getElementById('sub-' + target);
    // Desktop: open submenus only on click
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      if (sub.style.display === 'block') {
        sub.style.display = 'none';
      } else {
        closeAllSubs();
        sub.style.display = 'block';
        
        // העברת פוקוס לפריט הראשון בתפריט המשני
        setTimeout(() => {
          const firstSubItem = sub.querySelector('a');
          if (firstSubItem) {
            firstSubItem.focus();
          }
        }, 100);
      }
    });
    
    // הוספת מאזיני מקלדת לתפריטים משניים
    btn.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (sub.style.display === 'block') {
          sub.style.display = 'none';
        } else {
          closeAllSubs();
          sub.style.display = 'block';
          
          // העברת פוקוס לפריט הראשון בתפריט המשני
          setTimeout(() => {
            const firstSubItem = sub.querySelector('a');
            if (firstSubItem) {
              firstSubItem.focus();
            }
          }, 100);
        }
      }
    });
    // Remove hover events if exist
    btn.removeEventListener('mouseenter', null);
    btn.removeEventListener('mouseleave', null);
    if (sub) {
      sub.removeEventListener('mouseenter', null);
      sub.removeEventListener('mouseleave', null);
      
      // הוספת לכידת פוקוס לתפריט המשני
      sub.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
          const focusableElements = sub.querySelectorAll('a, [tabindex]:not([tabindex="-1"])');
          if (focusableElements.length > 0) {
            if (e.shiftKey && document.activeElement === focusableElements[0]) {
              e.preventDefault();
              btn.focus(); // חוזר לכפתור הראשי
            } else if (!e.shiftKey && document.activeElement === focusableElements[focusableElements.length - 1]) {
              e.preventDefault();
              // עובר לפריט הבא אחרי התפריט המשני
              const nextFocusable = btn.parentElement.nextElementSibling;
              if (nextFocusable) {
                const nextBtn = nextFocusable.querySelector('a, .popup-main-btn, [tabindex]:not([tabindex="-1"])');
                if (nextBtn) nextBtn.focus();
              } else {
                // אם אין פריט הבא, חוזר לכפתור הראשי
                btn.focus();
              }
            }
          }
        }
      });
    }
  });
}
setSubmenuEvents();
window.addEventListener('resize', setSubmenuEvents);

const token = 'ACCESS_TOKEN';
fetch(`https://graph.instagram.com/me/media?fields=id,media_type,media_url,permalink,thumbnail_url&access_token=${token}`)
  .then(res => res.json())
  .then(data => {
    const gallery = document.getElementById('insta-gallery');
    if (gallery && data.data) {
      gallery.innerHTML = '';
      data.data.slice(0,6).forEach(item => {
        if(item.media_type === 'IMAGE' || item.media_type === 'CAROUSEL_ALBUM') {
          const a = document.createElement('a');
          a.href = item.permalink;
          a.target = '_blank';
          a.rel = 'noopener';
          a.className = 'instagram-img';
          a.style.backgroundImage = `url('${item.media_url}')`;
          gallery.appendChild(a);
        }
      });
    }
  })
  .catch(err => {
    // Instagram API error - silent
  });

// --- פופאפ חנות בפוטר ---
const footerShopLink = document.getElementById('footerShopLink');
const footerShopPopup = document.getElementById('footerShopPopup');

if (footerShopLink && footerShopPopup) {
  footerShopLink.addEventListener('mouseenter', function() {
    footerShopPopup.style.display = 'block';
  });
  footerShopLink.addEventListener('mouseleave', function(e) {
    // סגור רק אם לא עברנו לפופאפ עצמו
    if (!footerShopPopup.contains(e.relatedTarget)) {
      footerShopPopup.style.display = 'none';
    }
  });
  footerShopPopup.addEventListener('mouseleave', function(e) {
    // סגור רק אם לא עברנו חזרה ללינק
    if (!footerShopLink.contains(e.relatedTarget)) {
      footerShopPopup.style.display = 'none';
    }
  });
  // סאב תפריטים בפוטר
  footerShopPopup.querySelectorAll('.popup-main-btn').forEach(btn => {
    btn.addEventListener('mouseenter', function(e) {
      const target = btn.getAttribute('data-target');
      const sub = document.getElementById('footer-sub-' + target.replace('footer-',''));
      if (sub) sub.style.display = 'block';
    });
    btn.addEventListener('mouseleave', function(e) {
      const target = btn.getAttribute('data-target');
      const sub = document.getElementById('footer-sub-' + target.replace('footer-',''));
      if (sub && !sub.contains(e.relatedTarget)) sub.style.display = 'none';
    });
  });
  footerShopPopup.querySelectorAll('.popup-sub').forEach(sub => {
    sub.addEventListener('mouseleave', function(e) {
      if (!sub.parentElement.contains(e.relatedTarget)) sub.style.display = 'none';
    });
  });
}

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
      z-index: 1000;
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

// ... existing code ...