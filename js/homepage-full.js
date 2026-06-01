// --- Side Cart Logic ---
const cartBtn = document.querySelector('.cart');
const sideCart = document.getElementById('sideCart');
const cartOverlay = document.getElementById('cartOverlay');
const closeSideCartBtn = document.getElementById('closeSideCart');
const cartBadge = document.getElementById('cartBadge');
const sideCartList = document.getElementById('sideCartList');
const viewCartBtn = document.getElementById('viewCartBtn');

// עגלת קניות בזיכרון - עם סינכרון מתקדם
let cart = [];

// Load cart safely using the sync API when available
function initializeCart() {
  if (window.cartSync && typeof window.cartSync.loadCart === 'function') {
    cart = window.cartSync.loadCart();
  } else {
    // Fallback for when sync script hasn't loaded yet
    try {
      cart = JSON.parse(localStorage.getItem('cart') || '[]');
    } catch (e) {
      cart = [];
    }
  }
}

// Initialize cart immediately
initializeCart();

function updateCartBadge() {
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  if (total > 0) {
    cartBadge.style.display = 'flex';
    cartBadge.textContent = total;
  } else {
    cartBadge.style.display = 'none';
  }
}

function getColorFromName(name) {
  // מפה בסיסית של שמות צבעים נפוצים לגוון
  const colors = {
    'תכלת': '#7ed6f7',
    'טורקיז': '#40e0d0',
    'אדום': '#e74c3c',
    'כחול': '#2980b9',
    'ירוק': '#27ae60',
    'צהוב': '#f9e79f',
    'שחור': '#222',
    'לבן': '#fff',
    'כתום': '#f39c12',
    'סגול': '#8e44ad',
    'ורוד': '#fd79a8',
    'חום': '#a0522d',
    'אפור': '#7f8c8d',
    'זהב': '#ffd700',
    'כסף': '#bdc3c7',
  };
  return colors[name.trim()] || '#b2bec3'; // ברירת מחדל
}

function truncateText(text, maxLength = 10) {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

// תיקון עיבוד הצבעים
function renderCartNotes(item) {
  const details = [];
  const notesText = item.notes || '';
  let colorBox = '';

  // עיבוד מיוחד לשש בש עיצוב אישי
  const allTitles = ((item.title || '') + ' ' + (item.subtitle || '')).toLowerCase();
  if (allTitles.includes('שש בש') && allTitles.includes('עיצוב אישי')) {
    const colorLines = [];
    
    // Handle colors - check if colorData exists with correct field names
    if (item.colorData) {
      const colorData = item.colorData;
      
      if (colorData.bgOuter) {
        colorLines.push(`<span class='side-cart-item-details-label'>צבע רקע (מהבחוץ):</span><span class='side-cart-item-details-value'><span class='side-cart-item-color-box' style='background:${colorData.bgOuter.color}' title='${colorData.bgOuter.text}'></span></span>`);
      }
      if (colorData.bgInnerRight) {
        colorLines.push(`<span class='side-cart-item-details-label'>צבע רקע (מבפנים-צד ימין):</span><span class='side-cart-item-details-value'><span class='side-cart-item-color-box' style='background:${colorData.bgInnerRight.color}' title='${colorData.bgInnerRight.text}'></span></span>`);
      }
      if (colorData.bgInnerLeft) {
        colorLines.push(`<span class='side-cart-item-details-label'>צבע רקע (מבפנים-צד שמאל):</span><span class='side-cart-item-details-value'><span class='side-cart-item-color-box' style='background:${colorData.bgInnerLeft.color}' title='${colorData.bgInnerLeft.text}'></span></span>`);
      }
      if (colorData.triangle1) {
        colorLines.push(`<span class='side-cart-item-details-label'>צבע משולש 1:</span><span class='side-cart-item-details-value'><span class='side-cart-item-color-box' style='background:${colorData.triangle1.color}' title='${colorData.triangle1.text}'></span></span>`);
      }
      if (colorData.triangle2) {
        colorLines.push(`<span class='side-cart-item-details-label'>צבע משולש 2:</span><span class='side-cart-item-details-value'><span class='side-cart-item-color-box' style='background:${colorData.triangle2.color}' title='${colorData.triangle2.text}'></span></span>`);
      }
    } else {
      // Fallback to text parsing for old items
      const regex = /(צבע [^:]+):\s*([^,]+(?:, [^:]+)*)(?=,\s*צבע|$)/g;
      let match;
      while ((match = regex.exec(notesText)) !== null) {
        const label = match[1];
        const colors = match[2].split(',').map(s => s.trim()).filter(Boolean);
        const colorBoxes = colors.map(c => {
          if (label.includes('משולש') && c === 'משתנה') {
            return 'משתנה';
          } else if (c === 'משתנה') {
            return 'משתנה';
          } else {
            return `<span class='side-cart-item-color-box' style='background:${getColorFromName(c)}' title='${c}'></span>`;
          }
        }).join(' ');
        colorLines.push(`<span class='side-cart-item-details-label'>${label}:</span><span class='side-cart-item-details-value'>${colorBoxes}</span>`);
      }
    }
    
    if (colorLines.length) {
      details.push(...colorLines.map(l => `<li>${l}</li>`));
    }
    
    // Handle explanations - check if desc exists
    if (item.desc) {
      const desc = item.desc;
      if (desc.right) {
        details.push(`<li><span class='side-cart-item-details-label'>הסבר ציור ימין:</span><span class='side-cart-item-details-value'>${truncateText(desc.right, 15)}</span></li>`);
      }
      if (desc.left) {
        details.push(`<li><span class='side-cart-item-details-label'>הסבר ציור שמאל:</span><span class='side-cart-item-details-value'>${truncateText(desc.left, 15)}</span></li>`);
      }
    }
    
    // Add files display
    if (item.files && item.files.length > 0) {
      const fileName = item.files[0].name;
      details.push(`<li><span class='side-cart-item-details-label'>קובץ:</span><span class='side-cart-item-details-value'>${truncateText(fileName, 10)}</span></li>`);
    }
  } else if (allTitles.includes('מטקה') && allTitles.includes('עיצוב אישי')) {
    // עיבוד מיוחד למטקה עיצוב אישי
    const colors = [];
    const explanations = [];
    const matkaRegex = /(צבע מטקה [12]|הסבר מטקה [12]):\s*([^,]+)(?=,\s*(?:צבע מטקה|הסבר מטקה)|$)/g;
    let match;
    while ((match = matkaRegex.exec(notesText)) !== null) {
      const label = match[1];
      const value = match[2].trim();
      
      if (label.includes('צבע מטקה')) {
        const colorHex = getColorFromName(value);
        const colorBox = `<span class='side-cart-item-color-box' style='background:${colorHex}' title='${value}'></span>`;
        colors.push(colorBox);
      } else if (label.includes('הסבר מטקה')) {
        explanations.push(truncateText(value, 8));
      }
    }
    
    if (colors.length > 0) {
      details.push(`<li><span class='side-cart-item-details-label'>צבעי מטקה:</span><span class='side-cart-item-details-value'>${colors.join(' ')}</span></li>`);
    }
    
    if (explanations.length > 0) {
        explanations.forEach((explanation, index) => {
          details.push(`<li><span class='side-cart-item-details-label'>הסבר מטקה ${index + 1}:</span><span class='side-cart-item-details-value'>${explanation}</span></li>`);
        });
    }
  } else if (allTitles.includes('שש בש')) {
    if (notesText.trim()) {
      details.push(`<li><span class='side-cart-item-details-label'>הערה:</span><span class='side-cart-item-details-value'>${truncateText(notesText.trim())}</span></li>`);
    }
  } else {
    let noteLabel = 'הערה:';
    if (allTitles.includes('קנבס')) noteLabel = 'גודל:';
    
    // הערה: חפש "גוון: ..." והצג ריבוע צבע
    let colorMatch = notesText.match(/גוון\s*[:：]?\s*([\u0590-\u05FF\w]+)/);
    if (colorMatch) {
      const colorName = colorMatch[1];
      const colorHex = getColorFromName(colorName);
      colorBox = `<span class='side-cart-item-color-box' style='background:${colorHex}' title='${colorName}'></span>`;
      notesText = notesText.replace(/,?\s*גוון\s*[:：]?\s*[\u0590-\u05FF\w]+/, '');
    }
    
    if (allTitles.includes('מטקה')) {
      if (notesText.trim() || colorBox) {
        details.push(`<li><span class='side-cart-item-details-label'>${noteLabel}</span><span class='side-cart-item-details-value'>${truncateText(notesText.trim())} ${colorBox}</span></li>`);
      }
    } else if (notesText.trim() || colorBox) {
      details.push(`<li><span class='side-cart-item-details-label'>${noteLabel}</span><span class='side-cart-item-details-value'>${truncateText(notesText.trim())} ${colorBox}</span></li>`);
    }
  }

      // Remove generic explanation display for matka custom design and backgammon custom design
    if (item.desc && !allTitles.includes('מטקה') && !(allTitles.includes('שש בש') && allTitles.includes('עיצוב אישי'))) {
    details.push(`<li><span class='side-cart-item-details-label'>הסבר:</span><span class='side-cart-item-details-value'>${truncateText(item.desc)}</span></li>`);
  }
  if (item.file) {
    // מחלץ את שם הקובץ מהנתיב המלא
    const fileName = item.file.split(/[\/\\]/).pop();
    details.push(`<li><span class='side-cart-item-details-label'>קובץ:</span><span class='side-cart-item-details-value'>${truncateText(fileName)}</span></li>`);
  }
  return details.join('');
}

  function renderCart() {
    sideCartList.innerHTML = '';
    
    if (!cart.length) {
      sideCartList.innerHTML = '<div style="text-align: center; padding: 20px; font-family: \'Amatica SC\', cursive; font-size: 20px; color: #8B6B47;">העגלה ריקה</div>';
      return;
    }
    
    cart.forEach((item, idx) => {
      // const cartIdx = cart.indexOf(item); // duplicate removal
    
    // פיצול שם המוצר
    let mainTitle = 'עיצוב אישי';
    let subTitle = '';
                  // Check if item has separate subtitle field (new format)
      if (item.subtitle) {
        mainTitle = item.title || '';
        subTitle = item.subtitle;
      } else if (item.title && item.title.includes('|')) {
          const parts = item.title.split('|');
          mainTitle = parts[0].trim();
          subTitle = parts[1].trim();
        } else if (item.title) {
          subTitle = item.title;
        }
    
    // קבלת הפרטים מהפונקציה המרכזית
    const details = window.cartSync && window.cartSync.renderCartNotes ? 
                  window.cartSync.renderCartNotes(item) : renderCartNotes(item);
    
    const row = document.createElement('div');
    row.className = 'side-cart-item';
    row.setAttribute('data-idx', idx);
    row.style.position = 'relative';
    row.innerHTML = `
      <div style=\"height: 120px; display: flex; flex-direction: row; width: 100%; position: relative;\">
        <div style=\"flex: 1; height: 100%; display: flex; align-items: center;\">
          <div style=\"width: 100%; display: flex; flex-direction: column; gap: 8px;\">
            <div style=\"height: 30px; display: flex; align-items: center; justify-content: center;\">
              <span style=\"font-family: 'Amatica SC', cursive; font-size: 22px; font-weight: bold; color: #8B6B47; text-align: center; line-height: 1.1;\">${mainTitle}</span>
            </div>
            <div style=\"height: 24px; display: flex; align-items: center; justify-content: center;\">
              <span style=\"font-family: 'Amatica SC', cursive; font-size: 16px; color: #8B6B47; text-align: center; font-weight: normal;\">${subTitle}</span>
            </div>
            ${window.cartSync && window.cartSync.renderCartPrice ? window.cartSync.renderCartPrice(item) : ''}
          </div>
        </div>
        <div style=\"width: 48px; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; margin-left: 8px;\">
          <button class=\"side-cart-item-add-btn\" title=\"הוסף\" aria-label=\"הוסף כמות\" style=\"background: none; border: none; font-size: 22px; color: #4C8467; cursor: pointer; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;\">+</button>
          <span class=\"side-cart-item-qty\" style=\"width: 32px; height: 28px; font-size: 18px; color: #8B6B47; display: flex; align-items: center; justify-content: center; background: none; border-radius: 0; border: none; font-family: 'Amatica SC', cursive; font-weight: bold;\" aria-label=\"כמות: ${item.qty}\">${item.qty}</span>
          <button class=\"side-cart-item-minus-btn\" title=\"הפחת\" aria-label=\"הפחת כמות\" style=\"background: none; border: none; font-size: 22px; color: #4C8467; cursor: pointer; width: 28px; height: 28px; display: flex: align-items: center; justify-content: center;\">–</button>
        </div>
      </div>
      <div class=\"side-cart-item-details\" style=\"padding: 0 0 8px 0;\">
        <ul class=\"side-cart-item-details-list\" style=\"max-width: 100%; overflow: hidden;\">
          ${details}
        </ul>
      </div>
      <button class=\"side-cart-item-trash-btn\" title=\"מחק\" aria-label=\"מחק מוצר מהעגלה\" style=\"position: absolute; left: 8px; bottom: 8px; background: none; border: none; padding: 0; margin: 0; cursor: pointer; width: 22px; height: 22px;\"><span class=\"side-cart-item-trash-icon\"></span></button>
    `;
    // כפתור פח אשפה
    row.querySelector('.side-cart-item-trash-btn').onclick = function(e) {
      e.stopPropagation();
      showDeleteDialog(idx);
    };
    // כפתור הוספה
    row.querySelector('.side-cart-item-add-btn').onclick = function(e) {
      e.stopPropagation();
      if (window.cartSync) {
        window.cartSync.updateItem(idx, {qty: cart[idx].qty + 1});
        cart = window.cartSync.loadCart();
      } else {
        cart[idx].qty += 1;
        localStorage.setItem('cart', JSON.stringify(cart));
      }

      setTimeout(() => {
        if (window.cartSync && typeof window.cartSync.loadCart === 'function') {
          cart = window.cartSync.loadCart();
        } else {
          cart = JSON.parse(localStorage.getItem('cart') || '[]');
        }
        updateCartBadge();
        renderCart();
        
        // הכרזה לקוראי מסך
        announceToScreenReader(`כמות ${mainTitle} עודכנה ל-${cart[idx].qty}`);
      }, 50);
    };
    // כפתור הפחתה
    row.querySelector('.side-cart-item-minus-btn').onclick = function(e) {
      e.stopPropagation();
      if (cart[idx].qty > 1) {
        if (window.cartSync) {
          window.cartSync.updateItem(idx, {qty: cart[idx].qty - 1});
          cart = window.cartSync.loadCart();
        } else {
          cart[idx].qty -= 1;
          localStorage.setItem('cart', JSON.stringify(cart));
        }

        setTimeout(() => {
          if (window.cartSync && typeof window.cartSync.loadCart === 'function') {
            cart = window.cartSync.loadCart();
          } else {
            cart = JSON.parse(localStorage.getItem('cart') || '[]');
          }
          updateCartBadge();
          renderCart();
          
          // הכרזה לקוראי מסך
          announceToScreenReader(`כמות ${mainTitle} עודכנה ל-${cart[idx].qty}`);
        }, 50);
      } else {
        showDeleteDialog(idx);
      }
    };
    sideCartList.appendChild(row);
  });
}

function openSideCart(scrollToItemIndex = false) {
  sideCart.classList.add('active');
  cartOverlay.classList.add('active');
  
  // הכרזה לקוראי מסך
  if (cart.length > 0) {
    announceToScreenReader(`סל קניות נפתח עם ${cart.length} מוצרים`);
  } else {
    announceToScreenReader('סל קניות נפתח - העגלה ריקה');
  }
  
  // שמירה על גלילה במובייל
  if (window.innerWidth > 768) {
  document.body.style.overflow = 'hidden';
  }
  
  // העברת פוקוס לכפתור הסגירה של הסל
  setTimeout(() => {
    const closeBtn = document.getElementById('closeSideCart');
    if (closeBtn) {
      closeBtn.focus();
    }
    
    // הוספת לכידת פוקוס בתוך הסל
    const sideCart = document.getElementById('sideCart');
    if (sideCart) {
      sideCart.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
          const focusableElements = sideCart.querySelectorAll('button, a, [tabindex]:not([tabindex="-1"])');
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];
          
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      });
    }
  }, 100);
  
  // אם צריך לגלול למוצר ספציפי
  if (scrollToItemIndex !== false && cart.length > 0) {
    setTimeout(() => {
      const cartItems = sideCartList.querySelectorAll('.side-cart-item');
      if (cartItems.length > 0) {
        let targetItem;
        
        if (scrollToItemIndex === true) {
          // ברירת מחדל - המוצר האחרון
          targetItem = cartItems[cartItems.length - 1];
        } else if (typeof scrollToItemIndex === 'number') {
          // מוצר ספציפי לפי אינדקס
          targetItem = cartItems[scrollToItemIndex] || cartItems[cartItems.length - 1];
        }
        
        if (targetItem) {
          // אנימציית קפיצה למוצר 
          targetItem.style.transform = 'scale(1.1)';
          targetItem.style.background = 'linear-gradient(135deg, #f0f8f0, #e8f5e8)';
          targetItem.style.border = '2px solid #4C8467'; /* שינוי לירוק-כחול כהה שעומד בתנאי הנגישות */
          targetItem.style.borderRadius = '8px';
          targetItem.style.transition = 'all 0.3s ease';
          
          // גלילה למוצר
          targetItem.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          
          // החזרה לגודל הרגיל אחרי אנימציה
          setTimeout(() => {
            targetItem.style.transform = 'scale(1)';
            targetItem.style.background = '';
            targetItem.style.border = '';
            targetItem.style.borderRadius = '';
          }, 1500);
        }
      }
    }, 200);
  }
}
function closeSideCart() {
  sideCart.classList.remove('active');
  cartOverlay.classList.remove('active');
  
  // הכרזה לקוראי מסך
  announceToScreenReader('סל קניות נסגר');
  
  // שמירה על גלילה במובייל
  if (window.innerWidth > 768) {
  document.body.style.overflow = '';
  }
}
cartBtn.addEventListener('click', function(e) {
  e.preventDefault();
  openSideCart();
});

// הוספת מאזין למקלדת לסל קניות
cartBtn.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    openSideCart();
  }
});
cartOverlay.addEventListener('click', closeSideCart);
closeSideCartBtn.addEventListener('click', closeSideCart);

// דוגמה להוספת מוצר לעגלה (להחליף בלחיצה אמיתית בהמשך)
function addToCart(item, onlyQty) {
  let targetItemIndex = null;
  
  // טעינת הסל הנוכחי
  if (window.cartSync && typeof window.cartSync.loadCart === 'function') {
    cart = window.cartSync.loadCart();
  } else {
    try {
      cart = JSON.parse(localStorage.getItem('cart') || '[]');
    } catch (e) {
      cart = [];
    }
  }
  
  // בדיקה מלאה של מוצר קיים (כל השדות צריכים להיות זהים!)
  let existingIndex = window.cartSync && window.cartSync.areItemsIdentical 
    ? cart.findIndex(existing => window.cartSync.areItemsIdentical(existing, item))
    : cart.findIndex(existing => 
        existing.title === item.title && 
        existing.subtitle === item.subtitle &&
        existing.notes === item.notes &&
        existing.desc === item.desc &&
        existing.price === item.price &&
        JSON.stringify(existing.files || []) === JSON.stringify(item.files || [])
      );
  
  if (existingIndex !== -1) {
    // מוצר קיים - הוסף כמות
    cart[existingIndex].qty += (item.qty || 1);
    targetItemIndex = existingIndex;
  } else if (!onlyQty) {
    // מוצר חדש - הוסף לסל
    cart.push(item);
    targetItemIndex = cart.length - 1;
  }
  
  // שמירה בחזרה עם עדכון מיידי של הממשק
  if (window.cartSync && typeof window.cartSync.saveCart === 'function') {
    window.cartSync.saveCart(cart, true); // Save immediately
  } else {
    localStorage.setItem('cart', JSON.stringify(cart));
  }
  
  // עדכון מיידי של הממשק
  updateCartBadge();
  renderCart();
  
  // פתיחת הסל הקטן אוטומטית עם אנימציה למוצר הנכון
  if (targetItemIndex !== null) {
    // מציאת האינדקס הנכון של המוצר
    const finalTargetIndex = window.cartSync && window.cartSync.areItemsIdentical 
      ? cart.findIndex(existing => window.cartSync.areItemsIdentical(existing, item))
      : cart.findIndex(existing => 
          existing.title === item.title && 
          existing.subtitle === item.subtitle &&
          existing.notes === item.notes &&
          existing.desc === item.desc &&
          existing.price === item.price &&
          JSON.stringify(existing.files || []) === JSON.stringify(item.files || [])
        );
    const indexToShow = finalTargetIndex !== -1 ? finalTargetIndex : cart.length - 1;
    openSideCart(indexToShow);
  }
  
  // הפעלת סנכרון נוסף לוודא שכל הטאבים מתעדכנים
  if (window.cartSync && typeof window.cartSync.synchronize === 'function') {
    setTimeout(() => {
      window.cartSync.synchronize('add-to-cart-complete');
    }, 100);
  }
}

function removeFromCart(idx) {
  if (idx >= 0 && idx < cart.length) {
    if (window.cartSync) {
      window.cartSync.removeItem(idx);
      cart = window.cartSync.loadCart();
    } else {
      cart.splice(idx, 1);
      localStorage.setItem('cart', JSON.stringify(cart));
    }

    setTimeout(() => {
      if (window.cartSync && typeof window.cartSync.loadCart === 'function') {
        cart = window.cartSync.loadCart();
      } else {
        cart = JSON.parse(localStorage.getItem('cart') || '[]');
      }
      updateCartBadge();
      renderCart();
    }, 50);
  }
}

// דוגמה: הוספת מוצרים לדוגמה (מומלץ להסיר בפרודקשן)
// הוספת פרמטר URL לדמו: ?demo=true
window.addEventListener('DOMContentLoaded', function() {
  const urlParams = new URLSearchParams(window.location.search);
  const isDemoMode = urlParams.get('demo') === 'true';
  
  // במצב דמו - הסל יישאר ריק
});

// כפתור "לצפייה בסל הקניות"
viewCartBtn.addEventListener('click', function() {
  window.location.href = 'Shopping Cart.html';
});

// עדכון באדג' בהתחלה
updateCartBadge();
renderCart();

// iPad and Safari specific fixes
function ensureViewCartButtonVisibleOniPad() {
  const viewCartBtn = document.getElementById('viewCartBtn');
  if (viewCartBtn) {
    viewCartBtn.style.display = 'block';
    viewCartBtn.style.visibility = 'visible';
    viewCartBtn.style.opacity = '1';
    viewCartBtn.style.position = 'sticky';
    viewCartBtn.style.bottom = '0';
    viewCartBtn.style.zIndex = '9999';
    viewCartBtn.style.webkitTransform = 'none';
    viewCartBtn.style.transform = 'none';
  }
}

// Call the function multiple times to ensure it works
setTimeout(ensureViewCartButtonVisibleOniPad, 100);
setTimeout(ensureViewCartButtonVisibleOniPad, 500);
setTimeout(ensureViewCartButtonVisibleOniPad, 1000);
setTimeout(ensureViewCartButtonVisibleOniPad, 2000);

let cartDeleteIdx = null;
function showDeleteDialog(idx) {
  cartDeleteIdx = idx;
  document.getElementById('cartDeleteDialog').style.display = 'flex';
  
  // הכרזה לקוראי מסך
  const item = cart[idx];
  const itemName = item.subtitle || item.title || 'מוצר';
  announceToScreenReader(`דיאלוג מחיקה נפתח עבור ${itemName}`);
  
  // העברת פוקוס לכפתור "לא" בדיאלוג
  setTimeout(() => {
    const noBtn = document.getElementById('cartDeleteNo');
    if (noBtn) {
      noBtn.focus();
    }
    
    // הוספת לכידת פוקוס לדיאלוג
    const dialog = document.getElementById('cartDeleteDialog');
    if (dialog) {
      dialog.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
          const focusableElements = dialog.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
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
      });
    }
  }, 100);
}
document.getElementById('cartDeleteYes').onclick = function() {
  if (cartDeleteIdx !== null) {
    const item = cart[cartDeleteIdx];
    const itemName = item.subtitle || item.title || 'מוצר';
    removeFromCart(cartDeleteIdx);
    cartDeleteIdx = null;
    
    // הכרזה לקוראי מסך
    announceToScreenReader(`${itemName} נמחק מהעגלה בהצלחה`);
  }
  document.getElementById('cartDeleteDialog').style.display = 'none';
};
document.getElementById('cartDeleteNo').onclick = function() {
  cartDeleteIdx = null;
  document.getElementById('cartDeleteDialog').style.display = 'none';
};