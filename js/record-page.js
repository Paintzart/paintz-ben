// וידוא שה-side-cart מוסתר בטעינת הדף
    

// Add form validation functions
async function validateForm(event) {
  event.preventDefault();
  let isValid = true;

  // Reset all error states
  document.querySelectorAll('.error').forEach(field => field.classList.remove('error'));
  
  // Validate description
  const desc = document.getElementById('record-desc');
  if (!desc.value.trim()) {
    desc.classList.add('error');
    isValid = false;
  }

  // Validate file - בודקים אם יש קבצים
  if (!window.fileUploadSystem || !window.fileUploadSystem.hasFiles()) {
    document.getElementById('fileUploadContainer').classList.add('error');
    isValid = false;
  } else {
    document.getElementById('fileUploadContainer').classList.remove('error');
  }

  // Validate quantity
  const qty = document.getElementById('record-qty');
  if (!qty.value || qty.value < 1) {
    qty.classList.add('error');
    isValid = false;
  }

  if (!isValid) {
    // הצגת הודעת שגיאה קופצת
    const errorToast = document.getElementById('errorToast');
    if (errorToast) {
      errorToast.classList.add('show');
      setTimeout(() => {
        errorToast.classList.remove('show');
      }, 3000);
    }
    return false;
  }

  // Function to convert file to base64 with compression for images
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      if (file.type && file.type.startsWith('image/')) {
        // Compress images before converting to base64
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = function() {
          // Calculate new dimensions (max 800px width/height)
          let { width, height } = img;
          const maxSize = 800;
          
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height * maxSize) / width;
              width = maxSize;
            } else {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7); // 70% quality
          

          
          resolve(compressedDataUrl);
        };
        
        img.onerror = () => {
          // Fallback to original method if compression fails
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
          reader.readAsDataURL(file);
        };
        
        img.src = URL.createObjectURL(file);
      } else {
        // For non-images, use original method
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
      }
    });
  }

  // Function to convert image URL to base64 (only if already base64)
  function imageUrlToBase64(url) {
    return new Promise((resolve, reject) => {
      if (url && url.startsWith('data:image')) {
        resolve(url);
        return;
      }
      
      // For relative paths, we can't convert to base64 in browser
      
      resolve(null);
    });
  }

  // שמירת מידע הקבצים עם תוכן מלא באמצעות המערכת החדשה
  const filesData = await window.fileUploadSystem.convertFilesToBase64();

  // Always use the first record thumb (correct selector)
  const firstThumbnail = document.querySelector('.record-thumb');
  const currentImageSrc = firstThumbnail ? (firstThumbnail.getAttribute('data-img') || firstThumbnail.src) : 'img/img-record1.jpg';

  // Convert product image to base64 for email display
  const productImageBase64 = await imageUrlToBase64(currentImageSrc);

  // Add to cart using the enhanced API
  // Convert relative path to full URL for email display
  let fullImageUrl = currentImageSrc;
  if (!currentImageSrc.startsWith('http') && !currentImageSrc.startsWith('data:')) {
    // Use Netlify URL since that's where images are actually hosted
    fullImageUrl = `https://sweet-youtiao-888fc5.netlify.app/${currentImageSrc}`;
  } else if (currentImageSrc.startsWith('https://yardenfad.github.io')) {
    // Convert GitHub Pages URL to Netlify URL
    const path = currentImageSrc.replace('https://yardenfad.github.io/paintz-website/', '');
    fullImageUrl = `https://sweet-youtiao-888fc5.netlify.app/${path}`;
  }

  const cartItem = {
    title: 'עיצוב אישי',
    subtitle: 'תקליט',
    notes: '', // לא מציגים הערות בתקליט
    desc: desc.value.trim(),
    files: filesData, // שמירת הקבצים המלאים בbase64
    qty: parseInt(qty.value) || 1,
    price: '', // מחיר תקליט
    mainImage: fullImageUrl, // שמירת התמונה עם URL מלא
    img: fullImageUrl // URL מלא - יוצג במייל
  };

  // Check final object size after base64 conversion
  const itemJSON = JSON.stringify(cartItem);
  const itemSizeBytes = new Blob([itemJSON]).size;
  const itemSizeMB = (itemSizeBytes / (1024 * 1024)).toFixed(2);
  const maxItemSize = 8 * 1024 * 1024; // 8MB for final object
  
  if (itemSizeBytes > maxItemSize) {
    throw new Error(`המוצר גדול מדי אחרי עיבוד (${itemSizeMB}MB). אנא הקטן את הקבצים או הסר חלק מהם.`);
  }

  // הוספת המוצר לסל באמצעות הפונקציה המקומית
  try {
    const addResult = addToCart(cartItem);
    
    // בדיקה אם המוצר נוסף בהצלחה
    if (addResult === false) {
      throw new Error('שגיאה בהוספת המוצר לסל. אנא נסה שוב.');
    }

    // Show success message
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  } catch (error) {
    console.error('Error in validateForm:', error);
    // הצג הודעת שגיאה
    const errorToast = document.getElementById('cartError');
    errorToast.textContent = error.message || 'שגיאה בהוספת המוצר לסל. אנא נסה שוב.';
    errorToast.classList.add('show');
    setTimeout(() => {
      errorToast.classList.remove('show');
    }, 3000);
    return false;
  }

  // Reset form
  desc.value = '';
  qty.value = '1';
  window.fileUploadSystem.clearFiles();

  return false;
}

// Add real-time validation
document.addEventListener('DOMContentLoaded', function() {
  // Remove error on description input
  document.getElementById('record-desc').addEventListener('input', function() {
    if (this.value.trim()) {
      this.classList.remove('error');
    }
  });

  // Remove error on file selection
  document.getElementById('record-file').addEventListener('change', function() {
    if (window.fileUploadSystem && window.fileUploadSystem.hasFiles()) {
      document.getElementById('fileUploadContainer').classList.remove('error');
    }
  });

  // Remove error on quantity change
  document.getElementById('record-qty').addEventListener('input', function() {
    if (this.value && this.value >= 1) {
      this.classList.remove('error');
    }
  });
});
// מערכת הוספת קבצים מטופלת על ידי FileUploadSystem

function addToCart(item) {
  // וידוא שיש קבצים
  if (!item.files || item.files.length === 0) {
    console.error('לא ניתן להוסיף תקליט ללא קבצים');
    return false;
  }


  
  // שימוש ב-API המרכזי להוספת מוצר
  let targetIndex = -1;
  if (window.cartSync && typeof window.cartSync.addItem === 'function') {
    // Check if adding this item would exceed cart size limit
    const currentCart = window.cartSync.loadCart();
    const testCart = [...currentCart, item];
    const testCartString = JSON.stringify(testCart);
    const testCartSize = new Blob([testCartString]).size;
    const testCartSizeMB = (testCartSize / (1024 * 1024)).toFixed(2);
                             const maxCartSize = 5 * 1024 * 1024; // 5MB max (based on typical localStorage limits)
    

    
          if (testCartSize > maxCartSize) {
        throw new Error(`הסל יהיה גדול מדי (${testCartSizeMB}MB). אנא הסר פריטים מהסל או הקטן את הקבצים.`);
      }
    
    // שימוש ב-API המרכזי
    targetIndex = window.cartSync.addItem(item);
    cart = window.cartSync.loadCart(); // רענון הסל המקומי
  } else {
    // Fallback למקרה שה-sync לא זמין
    let cart = [];
    try {
      const stored = localStorage.getItem('cart');
      cart = Array.isArray(JSON.parse(stored)) ? JSON.parse(stored) : [];
    } catch (e) {
      cart = [];
    }
    if (!Array.isArray(cart)) cart = [];
    
    // בדיקה פשוטה למוצר קיים
    const existingIndex = cart.findIndex(existing => 
      existing.title === item.title && 
      existing.subtitle === item.subtitle &&
      (() => {
        const files1 = existing.files || [];
        const files2 = item.files || [];
        if (files1.length !== files2.length) return false;
        for (let i = 0; i < files1.length; i++) {
          const f1 = files1[i] || {};
          const f2 = files2[i] || {};
          if (f1.name !== f2.name || f1.type !== f2.type) return false; // Removed size check because files are compressed
        }
        return true;
      })() &&
      (existing.desc || '').trim() === (item.desc || '').trim()
    );
    
    if (existingIndex !== -1) {
      cart[existingIndex].qty += item.qty;
      targetIndex = existingIndex;
    } else {
      cart.push(item);
      targetIndex = cart.length - 1;
    }
    
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to add item to cart:', e);
      if (e.name === 'QuotaExceededError') {
        throw new Error('הסל גדול מדי - לא ניתן לשמור בזיכרון הדפדפן. אנא הסר פריטים מהסל או הקטן את הקבצים.');
      } else {
        throw new Error('שגיאה בהוספת המוצר לסל. אנא נסה שוב.');
      }
    }
  }

  // עדכון מיידי של הממשק
  if (window.PaintzSiteUI) {
    window.PaintzSiteUI.updateCartBadge();
    window.PaintzSiteUI.renderCart();
  }
  
  // בדיקה נוספת לוודא שהמוצר נוסף
  const currentCart = window.cartSync ? window.cartSync.loadCart() : JSON.parse(localStorage.getItem('cart') || '[]');
  const itemExists = currentCart.some(cartItem => {
    // בדיקת כותרת וכותרת משנית
    if (cartItem.title !== item.title || cartItem.subtitle !== item.subtitle) {
      return false;
    }
    
    // בדיקת הסבר
    if (cartItem.desc !== item.desc) {
      return false;
    }
    
    // בדיקת קבצים
    const cartFiles = cartItem.files || [];
    const itemFiles = item.files || [];
    
    if (cartFiles.length !== itemFiles.length) {
      return false;
    }
    
    // בדיקת שמות הקבצים
    for (let i = 0; i < cartFiles.length; i++) {
      if (cartFiles[i].name !== itemFiles[i].name) {
        return false;
      }
    }
    
    return true;
  });
  
  if (!itemExists) {
    console.error('המוצר לא נוסף לסל למרות שלא הייתה שגיאה');
    throw new Error('המוצר לא נוסף לסל - ייתכן שהקבצים גדולים מדי');
  }
  
  // פתיחת הסל הקטן אוטומטית עם אנימציה למוצר הנכון
  const finalTargetIndex = targetIndex !== -1 ? targetIndex : cart.length - 1;
  window.PaintzSiteUI.openSideCart();
  
  // הפעלת סנכרון נוסף לוודא שכל הטאבים מתעדכנים
  if (window.cartSync && typeof window.cartSync.synchronize === 'function') {
    window.cartSync.synchronize('add-to-cart-complete');
  }
  
  return true; // הצלחה
}
