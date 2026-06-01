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

// Function to get URL parameters (supports ?query and #product=...&id=...)
function getProductParams() {
  var search = new URLSearchParams(window.location.search);
  var product = search.get('product');
  var id = search.get('id');
  if (product && id) return { product: product, id: id };

  var hash = (window.location.hash || '').replace(/^#/, '');
  if (hash) {
    var hashParams = new URLSearchParams(hash);
    product = hashParams.get('product');
    id = hashParams.get('id');
    if (product && id) return { product: product, id: id };
  }

  try {
    var stored = sessionStorage.getItem('paintzProductParams');
    if (stored) {
      var parsed = JSON.parse(stored);
      if (parsed.product && parsed.id) return parsed;
    }
  } catch (e) {}

  return { product: null, id: null };
}

function getURLParameter(name) {
  var params = getProductParams();
  if (name === 'product') return params.product;
  if (name === 'id') return params.id;
  return new URLSearchParams(window.location.search).get(name);
}

function resolveProduct(productType, productId) {
  if (!productType || !productId || !productData[productType]) return null;
  var catalog = productData[productType];
  return catalog[productId] || catalog[String(parseInt(productId, 10))] || null;
}

// Function to load product data
function loadProduct() {
  var params = getProductParams();
  var productType = params.product;
  var productId = params.id;
  var product = resolveProduct(productType, productId);

  if (!product) {
    loadDefaultProduct();
    return;
  }

  try {
    sessionStorage.setItem('paintzProductParams', JSON.stringify({ product: productType, id: productId }));
  } catch (e) {}
  
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

  const firstThumb = thumbnailContainer.querySelector('.thumbnail');
  if (window.PaintzGallery && window.PaintzGallery.setProductThumbSelected && firstThumb) {
    window.PaintzGallery.setProductThumbSelected(firstThumb);
  }
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


function updateMainImage(src, clickedThumb) {
  document.getElementById('mainImage').src = src;
  
  if (window.PaintzGallery && window.PaintzGallery.setProductThumbSelected) {
    window.PaintzGallery.setProductThumbSelected(clickedThumb);
  } else if (window.PaintzGallery && window.PaintzGallery.syncThumbSelection) {
    window.PaintzGallery.syncThumbSelection('.thumbnail', clickedThumb);
  } else {
    document.querySelectorAll('.thumbnail').forEach(function (thumb) {
      thumb.classList.remove('selected');
      thumb.removeAttribute('data-gallery-active');
      thumb.setAttribute('aria-selected', 'false');
    });
    if (clickedThumb) {
      clickedThumb.classList.add('selected');
      clickedThumb.setAttribute('data-gallery-active', 'true');
      clickedThumb.setAttribute('aria-selected', 'true');
    }
  }
  
  // Update the stored full URL for cart usage
  if (!src.startsWith('http') && !src.startsWith('data:')) {
    window.currentProductImageUrl = `https://sweet-youtiao-888fc5.netlify.app/${src}`;
  } else {
    window.currentProductImageUrl = src;
  }
}
window.updateMainImage = updateMainImage;

// Quantity Functions
function updateQuantity(change) {
  const quantityInput = document.getElementById('quantity');
  const currentValue = parseInt(quantityInput.value) || 1;
  const newValue = Math.max(1, currentValue + change);
  quantityInput.value = newValue;
}

// Prevent manual input of negative numbers


// Replace the validation function with a simple add to cart function
async function addToCart() {
  var params = getProductParams();
  var productType = params.product;
  var productId = params.id;
  var product = resolveProduct(productType, productId);

  if (!product) {
    alert('שגיאה: לא ניתן לזהות את המוצר');
    return;
  }
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
  var cart;
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
  if (window.PaintzSiteUI) {
    window.PaintzSiteUI.updateCartBadge();
    window.PaintzSiteUI.renderCart();
    if (window.PaintzSiteUI.openSideCart) window.PaintzSiteUI.openSideCart();
  }
  
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
  
  setTimeout(function () {
    toast.classList.remove('show');
  }, 3000);
}
window.addToCart = addToCart;


function onProductPageReady(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    fn();
  }
}

onProductPageReady(function () {
  loadProduct();
  var qty = document.getElementById('quantity');
  if (qty) {
    qty.addEventListener('change', function () {
      if (this.value < 1) this.value = 1;
    });
  }
});
