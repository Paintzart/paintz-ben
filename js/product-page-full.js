
    // וידוא שה-side-cart מוסתר בטעינת הדף
    document.addEventListener('DOMContentLoaded', function() {
      const sideCart = document.getElementById('sideCart');
      if (sideCart) {
        sideCart.classList.remove('active');
      }
      setSubmenuEvents(); // Add this line
    });
// Product data structure
const productData = {
  backgammon: {
    1: { name: "שש בש | 777", price: 250, images: 5 },
    2: { name: "שש בש | ספוג וכוכב ים", price: 300, images: 7 },
    3: { name: "שש בש | דגים", price: 250, images: 6 },
    4: { name: "שש בש | דבורות", price: 200, images: 1 },
    5: { name: "שש בש | ברווזים מאוהבים", price: 250, images: 7 },
    6: { name: "שש בש | דרקון", price: 250, images: 2 },
    7: { name: "שש בש | קוטב צפוני", price: 250, images: 2 },
    8: { name: "שש בש | חלל (שחור)", price: 250, images: 4 },
    9: { name: "שש בש | חיות ים", price: 200, images: 4 },
    10: { name: "שש בש | חלל צבעוני", price: 300, images: 5 },
    11: { name: "שש בש | חמניות", price: 200, images: 1 },
    12: { name: "שש בש | יוגה", price: 300, images: 6 },
    13: { name: "שש בש | ים", price: 200, images: 1 },
    14: { name: "שש בש | מדוזות סגולות", price: 250, images: 2 },
    15: { name: "שש בש | יצורים צהובים", price: 250, images: 2 },
    17: { name: "שש בש | פרח ורוד 1", price: 300, images: 5 },
    18: { name: "שש בש | פרח ורוד 2", price: 300, images: 7 },
    19: { name: "שש בש | קוקוס", price: 350, images: 6 },
    20: { name: "שש בש | הנסיכה והשמש", price: 250, images: 1 },
    21: { name: "שש בש | יוון", price: 300, images: 6 },
    22: { name: "שש בש | הגן הקסום", price: 250, images: 5 },
    23: { name: "שש בש | לוויתן", price: 200, images: 4 },
    24: { name: "שש בש | חברים", price: 350, images: 7 },
    25: { name: "שש בש | רקדנית", price: 250, images: 5 }
  },
  matka: {
    1: { name: "מטקה | ספוג וכוכב ים", price: 180, images: 5 },
    2: { name: "מטקה | חיות ים", price: 150, images: 7 },
    3: { name: "מטקה | צורות", price: 150, images: 4 },
    4: { name: "מטקה | חמניות", price: 150, images: 1 },
    5: { name: "מטקה | פרפרים", price: 150, images: 1 },
    6: { name: "מטקה | כלב", price: 150, images: 5 }
  }
};

// Function to get URL parameters
function getURLParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Function to load product data
function loadProduct() {
  const productType = getURLParameter('product');
  const productId = getURLParameter('id');
  
  if (!productType || !productId || !productData[productType] || !productData[productType][productId]) {
    // Default product if no valid parameters
    loadDefaultProduct();
    return;
  }
  
  const product = productData[productType][productId];
  
  // Update product title
  // הצגת השם עם "|" כמו שצריך
  document.querySelector('.record-title').textContent = product.name;
  
  // Update price
  document.querySelector('.price-amount').textContent = `₪${product.price}`;
  
  // Update images
  updateProductImages(productType, productId, product.images);
}

// Function to update product images
function updateProductImages(productType, productId, imageCount) {
  const thumbnailContainer = document.querySelector('.thumbnail-container');
  const mainImage = document.getElementById('mainImage');
  
  // Clear existing thumbnails
  thumbnailContainer.innerHTML = '';
  
  // Create thumbnails based on image count
  for (let i = 1; i <= imageCount; i++) {
    const imagePath = `Models/${productType === 'backgammon' ? 'Backgammon' : 'Matka'}${productId}_${i}.JPG`;
    
    const thumbnail = document.createElement('div');
    thumbnail.className = `thumbnail ${i === 1 ? 'selected' : ''}`;
    thumbnail.onclick = () => updateMainImage(imagePath, thumbnail);
    
    const img = document.createElement('img');
    img.src = imagePath;
    img.alt = `תמונה ${i}`;
    
    thumbnail.appendChild(img);
    thumbnailContainer.appendChild(thumbnail);
  }
  
  // Set main image to first image
  const firstImagePath = `Models/${productType === 'backgammon' ? 'Backgammon' : 'Matka'}${productId}_1.JPG`;
  mainImage.src = firstImagePath;
  
  // Store the full URL for cart usage
  window.currentProductImageUrl = `https://sweet-youtiao-888fc5.netlify.app/${firstImagePath}`;
}

// Function to load default product
function loadDefaultProduct() {
  document.querySelector('.record-title').textContent = "מוצר לדוגמה";
  document.querySelector('.price-amount').textContent = "₪199";
  
  // Keep existing default images
  const thumbnailContainer = document.querySelector('.thumbnail-container');
  thumbnailContainer.innerHTML = `
    <div class="thumbnail selected" onclick="updateMainImage('product1.jpg', this)">
      <img src="product1.jpg" alt="Thumbnail 1">
    </div>
    <div class="thumbnail" onclick="updateMainImage('product2.jpg', this)">
      <img src="product2.jpg" alt="Thumbnail 2">
    </div>
    <div class="thumbnail" onclick="updateMainImage('product3.jpg', this)">
      <img src="product3.jpg" alt="Thumbnail 3">
    </div>
  `;
  
  document.getElementById('mainImage').src = 'product1.jpg';
}

// Load product when page loads
document.addEventListener('DOMContentLoaded', loadProduct);

// --- נגישות - ניווט במקלדת ---
function handleKeyboardNavigation(event) {
  const shopBtn = document.getElementById('shopPopupBtn');
  const shopPopup = document.getElementById('shopPopup');
  
  // Enter או Space לפתיחת תפריט החנות
  if ((event.key === 'Enter' || event.key === ' ') && event.target === shopBtn) {
    event.preventDefault();
    if (shopPopup.style.display === 'block') {
      closeShopPopup();
    } else {
      openShopPopup();
    }
  }
  
  // Escape לסגירת תפריטים
  if (event.key === 'Escape') {
    if (shopPopup.style.display === 'block') {
      closeShopPopup();
    }
    if (document.getElementById('cartDeleteDialog').style.display === 'flex') {
      document.getElementById('cartDeleteDialog').style.display = 'none';
    }
  }
  
  // Tab לתפריט החנות - לכידת פוקוס
  if (event.key === 'Tab' && shopPopup.style.display === 'block') {
    const focusableElements = shopPopup.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }
}

// הוספת מאזין לניווט במקלדת
document.addEventListener('keydown', handleKeyboardNavigation);


// Add keyboard support for thumbnail images
document.querySelectorAll('.thumbnail').forEach(thumb => {
  thumb.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // Remove selected class from all thumbs
      document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('selected'));
      // Add selected class to current thumb
      this.classList.add('selected');
      // Update main image
      const img = this.querySelector('img');
      if (img) {
        const mainImg = document.getElementById('mainImage');
        if (mainImg) {
          mainImg.src = img.src;
        }
      }
    }
  });
});

// --- Shop Popup Logic ---
const shopBtn = document.getElementById('shopPopupBtn');
const shopPopup = document.getElementById('shopPopup');
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
  
  // העברת פוקוס לתפריט החנות
  setTimeout(() => {
    const firstLink = shopPopup.querySelector('a');
    if (firstLink) {
      firstLink.focus();
    }
  }, 100);
}
function closeShopPopup() {
  shopPopup.style.display = 'none';
  shopBtn.setAttribute('aria-expanded', 'false');
  closeAllSubs();
}
function setShopPopupEvents() {
  if (window.innerWidth > 700) {
    shopBtn.removeEventListener('click', shopBtn._shopClickHandler || (()=>{}));
    
    // Hover functionality with delay
    let hoverTimeout;
    let isHovering = false;
    
    shopBtn.addEventListener('mouseenter', function() {
      isHovering = true;
      clearTimeout(hoverTimeout);
      openShopPopup();
    });
    
    shopBtn.addEventListener('mouseleave', function() {
      isHovering = false;
      hoverTimeout = setTimeout(() => {
        if (!isHovering) closeShopPopup();
      }, 200);
    });
    
    shopPopup.addEventListener('mouseenter', function() {
      isHovering = true;
      clearTimeout(hoverTimeout);
    });
    
    shopPopup.addEventListener('mouseleave', function() {
      isHovering = false;
      hoverTimeout = setTimeout(() => {
        if (!isHovering) closeShopPopup();
      }, 200);
    });
    
  } else {
    shopBtn._shopClickHandler = function(e) {
      e.stopPropagation();
      if (shopPopup.style.display === 'block') {
        closeShopPopup();
      } else {
        openShopPopup();
      }
    };
    shopBtn.addEventListener('click', shopBtn._shopClickHandler);
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
function closeAllSubs() {
  document.querySelectorAll('.popup-sub').forEach(sub => sub.style.display = 'none');
}
function setSubmenuEvents() {
  const isDesktop = window.innerWidth > 700;
  document.querySelectorAll('.popup-main-btn').forEach(btn => {
    const target = btn.getAttribute('data-target');
    const sub = document.getElementById('sub-' + target);
    btn.replaceWith(btn.cloneNode(true));
  });
  document.querySelectorAll('.popup-main-btn').forEach(btn => {
    const target = btn.getAttribute('data-target');
    const sub = document.getElementById('sub-' + target);
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      if (sub.style.display === 'block') {
        sub.style.display = 'none';
      } else {
        closeAllSubs();
        sub.style.display = 'block';
      }
    });
    
    // Add keyboard support
    btn.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        if (sub.style.display === 'block') {
          sub.style.display = 'none';
        } else {
          closeAllSubs();
          sub.style.display = 'block';
        }
      }
    });
    btn.removeEventListener('mouseenter', null);
    btn.removeEventListener('mouseleave', null);
    if (sub) {
      sub.removeEventListener('mouseenter', null);
      sub.removeEventListener('mouseleave', null);
    }
  });
}
setSubmenuEvents();
window.addEventListener('resize', setSubmenuEvents);

// Product Gallery Functions
function updateMainImage(src, clickedThumb) {
  document.getElementById('mainImage').src = src;
  
  // Update thumbnail borders
  document.querySelectorAll('.thumbnail').forEach(thumb => {
    thumb.classList.remove('selected');
  });
  clickedThumb.classList.add('selected');
  
  // Update the stored full URL for cart usage
  if (!src.startsWith('http') && !src.startsWith('data:')) {
    window.currentProductImageUrl = `https://sweet-youtiao-888fc5.netlify.app/${src}`;
  } else {
    window.currentProductImageUrl = src;
  }
}

// Quantity Functions
function updateQuantity(change) {
  const quantityInput = document.getElementById('quantity');
  const currentValue = parseInt(quantityInput.value) || 1;
  const newValue = Math.max(1, currentValue + change);
  quantityInput.value = newValue;
}

// Prevent manual input of negative numbers
document.getElementById('quantity').addEventListener('change', function() {
  if (this.value < 1) this.value = 1;
});

// Replace the validation function with a simple add to cart function
async function addToCart() {
  const productType = getURLParameter('product');
  const productId = getURLParameter('id');
  
  if (!productType || !productId || !productData[productType] || !productData[productType][productId]) {
    alert('שגיאה: לא ניתן לזהות את המוצר');
    return;
  }
  
  const product = productData[productType][productId];
  const quantity = parseInt(document.getElementById('quantity').value) || 1;
  const notes = (document.getElementById('notes').value || '').trim();
  
  // יצירת מוצר חדש לעגלה
  // פרוק שם המוצר לחלקים - מחיקת ה-"|" והפיצול
  const nameParts = product.name.split(' | ');
  const mainTitle = nameParts[0]; // "שש בש"
  const subTitle = nameParts[1]; // "777", "בובספוג", etc.
  
  // Function to convert image URL to base64 (only if already base64)
  function imageUrlToBase64(url) {
    return new Promise((resolve, reject) => {
      if (url && url.startsWith('data:image')) {
        resolve(url);
        return;
      }
      
      // For relative paths, we can't convert to base64 in browser
      // But we can return the full URL for email display
      if (url && !url.startsWith('http') && !url.startsWith('data:')) {
        const fullUrl = `https://yardenfad.github.io/paintz-website/${url}`;
        resolve(fullUrl);
        return;
      }
      
      resolve(url);
    });
  }

  // Get first thumbnail image instead of current main image
  let firstImageSrc = '';
  
  if (productType && productId && productData[productType] && productData[productType][productId]) {
    // For dynamic products, use first image from the series
    firstImageSrc = `Models/${productType === 'backgammon' ? 'Backgammon' : 'Matka'}${productId}_1.JPG`;
  } else {
    // For default products, use first thumbnail
    const firstThumbnail = document.querySelector('.thumbnail img');
    firstImageSrc = firstThumbnail ? firstThumbnail.src : 'product1.jpg';
  }

  // Use stored full URL if available, otherwise convert relative path to full URL
  let fullImageUrl = window.currentProductImageUrl || firstImageSrc;
  if (!fullImageUrl.startsWith('http') && !fullImageUrl.startsWith('data:')) {
    // Use Netlify URL since that's where images are actually hosted
    fullImageUrl = `https://sweet-youtiao-888fc5.netlify.app/${firstImageSrc}`;
  } else if (fullImageUrl.startsWith('https://yardenfad.github.io')) {
    // Convert GitHub Pages URL to Netlify URL
    const path = fullImageUrl.replace('https://yardenfad.github.io/paintz-website/', '');
    fullImageUrl = `https://sweet-youtiao-888fc5.netlify.app/${path}`;
  }

  // Convert image to base64 for email display
  const productImageBase64 = await imageUrlToBase64(fullImageUrl);
  
  const cartItem = {
    title: mainTitle,
    subtitle: subTitle,
    notes: notes,
    desc: '',
    qty: quantity,
    price: `₪ ${product.price}`,
    mainImage: fullImageUrl, // שמירת התמונה עם URL מלא
    img: fullImageUrl, // URL מלא - יוצג במייל
    image: fullImageUrl // גיבוי נוסף לתמונה
  };
  

  
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
  
  const existingItemIndex = window.cartSync && window.cartSync.areItemsIdentical 
    ? cart.findIndex(existing => {
        const result = window.cartSync.areItemsIdentical(existing, cartItem);
        return result;
      })
    : cart.findIndex(item => {
        // בדיקה מיוחדת למוצרי דגמים - אם זה מוצר דגם, עדכן אותו במקום ליצור חדש
        const isModelItem = (item.title === 'מטקה' && !item.notes) || 
                           (item.title + ' ' + item.subtitle).toLowerCase().includes('דגם');
        const isNewModelItem = (cartItem.title === 'מטקה' && !cartItem.notes) || 
                              (cartItem.title + ' ' + cartItem.subtitle).toLowerCase().includes('דגם');
        
        if (isModelItem && isNewModelItem && 
            item.title === cartItem.title && 
            item.subtitle === cartItem.subtitle) {
          // בדוק שההערות זהות
          const existingNotes = (item.notes || '').trim();
          const newNotes = (cartItem.notes || '').trim();
          
          if (existingNotes === newNotes) {
            return true;
          }
          return false;
        }
        
        // בדיקה אם זה מוצר עם הערות זהות או ללא הערות
        const existingNotes = (item.notes || '').trim();
        const newNotes = (cartItem.notes || '').trim();
        
        if (existingNotes === newNotes && 
            item.title === cartItem.title && 
            item.subtitle === cartItem.subtitle) {
          return true;
        }
        
        const result = item.title === cartItem.title && 
          item.subtitle === cartItem.subtitle &&
          ((item.notes || '').trim() === (cartItem.notes || '').trim()) &&
          item.desc === cartItem.desc &&
          item.price === cartItem.price &&
          item.img === cartItem.img &&
          JSON.stringify(item.files || []) === JSON.stringify(cartItem.files || []);
        return result;
      });
  
  if (existingItemIndex !== -1) {
    // בדיקה אם זה מוצר דגם שצריך לעדכן עם הערות
    const existingItem = cart[existingItemIndex];
    const isModelItem = (existingItem.title === 'מטקה' && !existingItem.notes) || 
                       (existingItem.title + ' ' + existingItem.subtitle).toLowerCase().includes('דגם');
    const isNewModelItem = (cartItem.title === 'מטקה' && !cartItem.notes) || 
                          (cartItem.title + ' ' + cartItem.subtitle).toLowerCase().includes('דגם');
    
    if (isModelItem && isNewModelItem && 
        existingItem.title === cartItem.title && 
        existingItem.subtitle === cartItem.subtitle) {
      // עדכן מוצר דגם עם הערות חדשות
      cart[existingItemIndex] = {
        ...existingItem,
        notes: cartItem.notes,
        qty: existingItem.qty + quantity
      };
    } else {
      // בדיקה אם זה מוצר עם הערות זהות
      const existingNotes = (existingItem.notes || '').trim();
      const newNotes = (cartItem.notes || '').trim();
      
      if (existingNotes === newNotes && 
          existingItem.title === cartItem.title && 
          existingItem.subtitle === cartItem.subtitle) {
        // איחוד מוצרים עם הערות זהות
        cart[existingItemIndex].qty += quantity;
      } else {
        // אם המוצר קיים, הוסף כמות
        cart[existingItemIndex].qty += quantity;
      }
    }
  } else {
    // אם המוצר לא קיים, הוסף אותו
    cartItem.qty = quantity;
    cart.push(cartItem);
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

  // מציאת האינדקס של המוצר אחרי הוספה
  const targetIndex = window.cartSync && window.cartSync.areItemsIdentical 
    ? cart.findIndex(existing => window.cartSync.areItemsIdentical(existing, cartItem))
    : cart.findIndex(item => {
        // בדיקה מיוחדת למוצרי דגמים
        const isModelItem = (item.title === 'מטקה' && !item.notes) || 
                           (item.title + ' ' + item.subtitle).toLowerCase().includes('דגם');
        const isNewModelItem = (cartItem.title === 'מטקה' && !cartItem.notes) || 
                              (cartItem.title + ' ' + cartItem.subtitle).toLowerCase().includes('דגם');
        
        if (isModelItem && isNewModelItem && 
            item.title === cartItem.title && 
            item.subtitle === cartItem.subtitle) {
          return true;
        }
        
        // בדיקה אם זה מוצר עם הערות זהות או ללא הערות
        const existingNotes = (item.notes || '').trim();
        const newNotes = (cartItem.notes || '').trim();
        
        if (existingNotes === newNotes && 
            item.title === cartItem.title && 
            item.subtitle === cartItem.subtitle) {
          return true;
        }
        
        return item.title === cartItem.title && 
          item.subtitle === cartItem.subtitle &&
          ((item.notes || '').trim() === (cartItem.notes || '').trim()) &&
          item.desc === cartItem.desc &&
          item.price === cartItem.price &&
          item.img === cartItem.img &&
          JSON.stringify(item.files || []) === JSON.stringify(cartItem.files || []);
      });
  
  // פתיחת הסל הקטן אוטומטית עם אנימציה למוצר הנכון
  const finalTargetIndex = targetIndex !== -1 ? targetIndex : cart.length - 1;
  openSideCart(finalTargetIndex);
  
  // הפעלת סנכרון נוסף לוודא שכל הטאבים מתעדכנים
  if (window.cartSync && typeof window.cartSync.synchronize === 'function') {
    setTimeout(() => {
      window.cartSync.synchronize('add-to-cart-complete');
    }, 100);
  }
  
  // איפוס הטופס
  document.getElementById('quantity').value = '1';
  document.getElementById('notes').value = '';
  
  // הצגת הודעה
  const toast = document.getElementById('toast');
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Cart functionality for Product.html
let cart = [];

function initializeCart() {
  if (window.cartSync && typeof window.cartSync.loadCart === 'function') {
    cart = window.cartSync.loadCart();
  } else {
    try {
      cart = JSON.parse(localStorage.getItem('cart') || '[]');
    } catch (e) {
      cart = [];
    }
  }
}

initializeCart();
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(initializeCart, 100);
});

const cartBtn = document.querySelector('.cart');
const sideCart = document.getElementById('sideCart');
const cartOverlay = document.getElementById('cartOverlay');
const closeSideCartBtn = document.getElementById('closeSideCart');
const sideCartList = document.getElementById('sideCartList');
const viewCartBtn = document.getElementById('viewCartBtn');
const cartBadge = document.getElementById('cartBadge');

function getColorFromName(colorName) {
  const colorMap = {
    'אדום': '#FF0000', 'כחול': '#0000FF', 'ירוק': '#008000', 'צהוב': '#FFFF00',
    'כתום': '#FFA500', 'סגול': '#800080', 'ורוד': '#FFC0CB', 'חום': '#A52A2A',
    'שחור': '#000000', 'לבן': '#FFFFFF', 'אפור': '#808080', 'תכלת': '#00CED1',
    'בז\'': '#F5F5DC', 'זהב': '#FFD700', 'כסף': '#C0C0C0', 'ברונזה': '#CD7F32'
  };
  return colorMap[colorName.trim()] || '#ccc';
}

function truncateText(text, maxLength = 10) {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

function updateCartBadge() {
  try {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const total = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    if (total > 0) {
      cartBadge.style.display = 'block';
      cartBadge.textContent = total;
    } else {
      cartBadge.style.display = 'none';
    }
  } catch (e) {
    cartBadge.style.display = 'none';
  }
}

function renderCartNotes(item, hidePrices) {
  const details = [];
  let colorBox = '';
  const notesText = item.notes || '';
  const allTitles = ((item.title || '') + ' ' + (item.subtitle || '')).toLowerCase();
  
  // Handle custom backgammon design
  if (allTitles.includes('שש בש') && allTitles.includes('עיצוב אישי')) {
    // ... existing code ...
  } else if (allTitles.includes('מטקה') && allTitles.includes('עיצוב אישי')) {
    // עיבוד מיוחד למטקה עיצוב אישי
    const colors = [];
    const explanations = [];
    
    // בדיקת צבעים והסברים בפורמט הישן
    if (item.colorData) {
      if (item.colorData.color1) {
        details.push(`<span class='side-cart-item-details-label'>צבע מטקה 1: </span><span class='side-cart-item-details-value'><span class='side-cart-item-color-box' style='background:${item.colorData.color1.hex}' title='${item.colorData.color1.text}'></span></span>`);
      }
      if (item.colorData.color2) {
        details.push(`<span class='side-cart-item-details-label'>צבע מטקה 2: </span><span class='side-cart-item-details-value'><span class='side-cart-item-color-box' style='background:${item.colorData.color2.hex}' title='${item.colorData.color2.text}'></span></span>`);
      }
      if (item.colorData.desc1) {
        details.push(`<span class='side-cart-item-details-label'>הסבר מטקה 1: </span><span class='side-cart-item-details-value'>${truncateText(item.colorData.desc1, 10)}</span>`);
      }
      if (item.colorData.desc2) {
        details.push(`<span class='side-cart-item-details-label'>הסבר מטקה 2: </span><span class='side-cart-item-details-value'>${truncateText(item.colorData.desc2, 10)}</span>`);
      }
    } else {
      // בדיקת צבעים והסברים בפורמט החדש
      const matkaRegex = /(צבע מטקה [12]|הסבר מטקה [12]):\s*([^,]+)(?=,\s*(?:צבע מטקה|הסבר מטקה)|$)/g;
      let match;
      const foundLabels = new Set();
      
      while ((match = matkaRegex.exec(notesText)) !== null) {
        const label = match[1];
        const value = match[2].trim();
        foundLabels.add(label);
        
        if (label.includes('צבע מטקה')) {
          const colorHex = getColorFromName(value);
          details.push(`<span class='side-cart-item-details-label'>${label}: </span><span class='side-cart-item-details-value'><span class='side-cart-item-color-box' style='background:${colorHex}' title='${value}'></span></span>`);
        } else if (label.includes('הסבר מטקה')) {
          details.push(`<span class='side-cart-item-details-label'>${label}: </span><span class='side-cart-item-details-value'>${truncateText(value, 10)}</span>`);
        }
      }
      
      // הוספת תוויות חסרות עם ערכים ריקים
      ['צבע מטקה 1', 'צבע מטקה 2', 'הסבר מטקה 1', 'הסבר מטקה 2'].forEach(label => {
        if (!foundLabels.has(label)) {
          if (label.includes('צבע')) {
            details.push(`<span class='side-cart-item-details-label'>${label}: </span><span class='side-cart-item-details-value'></span>`);
          } else {
            details.push(`<span class='side-cart-item-details-label'>${label}: </span><span class='side-cart-item-details-value'></span>`);
          }
        }
      });
    }
    
    // הוספת קבצים אם יש
    if (item.files && item.files.length > 0) {
      const fileName = item.files[0].name;
      details.push(`<span class='side-cart-item-details-label'>קובץ: </span><span class='side-cart-item-details-value'>${truncateText(fileName, 10)}</span>`);
    } else if (item.file) {
      const fileName = item.file.split(/[\/\\]/).pop();
      details.push(`<span class='side-cart-item-details-label'>קובץ: </span><span class='side-cart-item-details-value'>${truncateText(fileName, 10)}</span>`);
    }
  } else if (allTitles.includes('תקליט') && allTitles.includes('עיצוב אישי')) {
    // ... existing code ...
  } else {
    // ... existing code ...
  }

  // Return different formats based on hidePrices (true = big cart, false = mini cart)
  if (hidePrices) {
    // For big cart - return UL format
    return details.length ? `<ul class='big-cart-item-notes' style='list-style:none;margin:0 0 2px 0;padding:0;'>${details.map(detail => `<li>${detail}</li>`).join('')}</ul>` : '';
  } else {
    // For mini cart - return DIV format  
    return details.map(detail => `<div style="font-family: 'Amatica SC', cursive;">${detail}</div>`).join('');
  }
}

  function renderCart() {
    sideCartList.innerHTML = '';
    
    if (!cart.length) {
      sideCartList.innerHTML = '<div style="text-align: center; padding: 20px; font-family: \'Amatica SC\', cursive; font-size: 20px; color: #8B6B47;">העגלה ריקה</div>';
      return;
    }
    
    cart.forEach((item, idx) => {
      const row = document.createElement('div');
      row.className = 'side-cart-item';
      row.setAttribute('data-idx', idx);
      row.style.position = 'relative';
      row.innerHTML = `
        <div style="height: 120px; display: flex; flex-direction: row; width: 100%; position: relative;">
          <div style="flex: 1; height: 100%; display: flex; align-items: center;">
            <div style="width: 100%; display: flex; flex-direction: column; gap: 8px;">
              <div style="height: 30px; display: flex; align-items: center; justify-content: center;">
                <span style="font-family: 'Amatica SC', cursive; font-size: 22px; font-weight: bold; color: #8B6B47; text-align: center; line-height: 1.1;">${item.title}</span>
              </div>
              <div style="height: 24px; display: flex; align-items: center; justify-content: center;">
                <span style="font-family: 'Amatica SC', cursive; font-size: 16px; color: #8B6B47; text-align: center; font-weight: normal;">${item.subtitle}</span>
              </div>
              ${window.cartSync && window.cartSync.renderCartPrice ? window.cartSync.renderCartPrice(item) : ''}
            </div>
          </div>
          <div style="width: 48px; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; margin-left: 8px;">
            <button class="side-cart-item-add-btn" title="הוסף" style="background: none; border: none; font-size: 22px; color: #4C8467; cursor: pointer; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">+</button>
            <span class="side-cart-item-qty" style="width: 32px; height: 28px; font-size: 18px; color: #8B6B47; display: flex; align-items: center; justify-content: center; background: none; border-radius: 0; border: none; font-family: 'Amatica SC', cursive; font-weight: bold;">${item.qty}</span>
            <button class="side-cart-item-minus-btn" title="הפחת" style="background: none; border: none; font-size: 22px; color: #4C8467; cursor: pointer; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">–</button>
          </div>
        </div>
        <div class="side-cart-item-details" style="padding: 0 0 8px 0;">
          <ul class="side-cart-item-details-list">
            ${window.cartSync && window.cartSync.renderCartNotes ? window.cartSync.renderCartNotes(item, false) : renderCartNotes(item, false)}
          </ul>
        </div>
        <button class="side-cart-item-trash-btn" title="מחק" style="position: absolute; left: 8px; bottom: 8px; background: none; border: none; padding: 0; margin: 0; cursor: pointer; width: 22px; height: 22px;"><span class="side-cart-item-trash-icon"></span></button>
      `;
      
      row.querySelector('.side-cart-item-trash-btn').onclick = function(e) {
        e.stopPropagation();
        showDeleteDialog(idx);
      };
      
      // כפתור הוספה
      row.querySelector('.side-cart-item-add-btn').onclick = function(e) {
        e.stopPropagation();
        if (window.cartSync && typeof window.cartSync.updateItem === 'function') {
          window.cartSync.updateItem(idx, {qty: cart[idx].qty + 1});
          cart = window.cartSync.loadCart();
        } else {
          cart[idx].qty += 1;
          localStorage.setItem('cart', JSON.stringify(cart));
        }

        // טעינה מחדש לוודא סנכרון מיד
        setTimeout(() => {
          if (window.cartSync && typeof window.cartSync.loadCart === 'function') {
            cart = window.cartSync.loadCart();
          } else {
            cart = JSON.parse(localStorage.getItem('cart') || '[]');
          }
          
          updateCartBadge();
          renderCart();
        }, 50);
      };
      // כפתור הפחתה
      row.querySelector('.side-cart-item-minus-btn').onclick = function(e) {
        e.stopPropagation();
        if (cart[idx].qty > 1) {
          if (window.cartSync && typeof window.cartSync.updateItem === 'function') {
            window.cartSync.updateItem(idx, {qty: cart[idx].qty - 1});
            cart = window.cartSync.loadCart();
          } else {
            cart[idx].qty -= 1;
            localStorage.setItem('cart', JSON.stringify(cart));
          }

          // טעינה מחדש לוודא סנכרון מיד
          setTimeout(() => {
            if (window.cartSync && typeof window.cartSync.loadCart === 'function') {
              cart = window.cartSync.loadCart();
            } else {
              cart = JSON.parse(localStorage.getItem('cart') || '[]');
            }
            
            updateCartBadge();
            renderCart();
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
  document.body.style.overflow = 'hidden';
  
  // הפעלת הכפתור "לצפייה בסל הקניות"
  const viewCartBtn = document.getElementById('viewCartBtn');
  if (viewCartBtn) {
    viewCartBtn.tabIndex = 0;
  }
  
  // העברת פוקוס לכפתור הסגירה
  setTimeout(() => {
    const closeSideCartBtn = document.getElementById('closeSideCart');
    if (closeSideCartBtn) {
      closeSideCartBtn.focus();
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
          targetItem.style.border = '2px solid #4C8467';
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
  document.body.style.overflow = '';
  
  // השבתת הכפתור "לצפייה בסל הקניות"
  const viewCartBtn = document.getElementById('viewCartBtn');
  if (viewCartBtn) {
    viewCartBtn.tabIndex = -1;
  }
}

cartBtn.addEventListener('click', function(e) {
  e.preventDefault();
  openSideCart();
});

// Add keyboard support for cart button
cartBtn.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    openSideCart();
  }
});

cartOverlay.addEventListener('click', closeSideCart);
closeSideCartBtn.addEventListener('click', closeSideCart);

viewCartBtn.addEventListener('click', function() {
  window.location.href = 'Shopping Cart.html';
});

// לכידת פוקוס בסל הקניות
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

function removeFromCart(idx) {
  if (idx >= 0 && idx < cart.length) {
    if (window.cartSync && typeof window.cartSync.removeItem === 'function') {
      window.cartSync.removeItem(idx);
      cart = window.cartSync.loadCart();
    } else {
        cart.splice(idx, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // טעינה מחדש לוודא סנכרון מיד
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

let cartDeleteIdx = null;
function showDeleteDialog(idx) {
  cartDeleteIdx = idx;
  const dialog = document.getElementById('cartDeleteDialog');
  dialog.style.display = 'flex';
  dialog.style.zIndex = '1001';
  document.body.style.overflow = 'hidden';
  
  // העברת פוקוס לכפתור "כן"
  setTimeout(() => {
    const yesBtn = document.getElementById('cartDeleteYes');
    if (yesBtn) {
      yesBtn.focus();
    }
  }, 100);
}

document.getElementById('cartDeleteYes').onclick = function() {
  if (cartDeleteIdx !== null) {
    removeFromCart(cartDeleteIdx);
    cartDeleteIdx = null;
  }
  const dialog = document.getElementById('cartDeleteDialog');
  dialog.style.display = 'none';
  document.body.style.overflow = '';
  
  // החזרת פוקוס לסל הקניות
  setTimeout(() => {
    const closeSideCartBtn = document.getElementById('closeSideCart');
    if (closeSideCartBtn) {
      closeSideCartBtn.focus();
    }
  }, 100);
};

document.getElementById('cartDeleteNo').onclick = function() {
  cartDeleteIdx = null;
  const dialog = document.getElementById('cartDeleteDialog');
  dialog.style.display = 'none';
  document.body.style.overflow = '';
  
  // החזרת פוקוס לסל הקניות
  setTimeout(() => {
    const closeSideCartBtn = document.getElementById('closeSideCart');
    if (closeSideCartBtn) {
      closeSideCartBtn.focus();
    }
  }, 100);
};

// Add keyboard support for delete dialog buttons
document.getElementById('cartDeleteYes').addEventListener('keydown', function(e) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    if (cartDeleteIdx !== null) {
      removeFromCart(cartDeleteIdx);
      cartDeleteIdx = null;
    }
    const dialog = document.getElementById('cartDeleteDialog');
    dialog.style.display = 'none';
    document.body.style.overflow = '';
    
    // החזרת פוקוס לסל הקניות
    setTimeout(() => {
      const closeSideCartBtn = document.getElementById('closeSideCart');
      if (closeSideCartBtn) {
        closeSideCartBtn.focus();
      }
    }, 100);
  }
});

document.getElementById('cartDeleteNo').addEventListener('keydown', function(e) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    cartDeleteIdx = null;
    const dialog = document.getElementById('cartDeleteDialog');
    dialog.style.display = 'none';
    document.body.style.overflow = '';
    
    // החזרת פוקוס לסל הקניות
    setTimeout(() => {
      const closeSideCartBtn = document.getElementById('closeSideCart');
      if (closeSideCartBtn) {
        closeSideCartBtn.focus();
      }
    }, 100);
  }
});

// לכידת פוקוס בדיאלוג המחיקה
document.getElementById('cartDeleteDialog').addEventListener('keydown', function(e) {
  if (e.key === 'Tab') {
    const focusableElements = this.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
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

  // Initialize
loadProduct();
updateCartBadge();
renderCart();

// Wait for cart sync to be available, then reinitialize
window.addEventListener('load', function() {
  setTimeout(() => {
    if (window.cartSync) {
      cart = window.cartSync.loadCart();
      updateCartBadge();
      renderCart();
    }
  }, 100);
});

// Also update on storage changes
window.addEventListener('storage', function(e) {
  if (e.key === 'cart') {
    try {
      cart = JSON.parse(localStorage.getItem('cart') || '[]');
      updateCartBadge();
      renderCart();
    } catch (error) {
      console.error('Error syncing cart:', error);
    }
  }
});

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
  