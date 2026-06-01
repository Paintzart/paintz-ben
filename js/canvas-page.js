// וידוא שה-side-cart מוסתר בטעינת הדף
    

// Add form validation functions
async function validateForm(event) {
  event.preventDefault();
  let isValid = true;

  // Reset all error states
  document.querySelectorAll('.error').forEach(field => field.classList.remove('error'));

  // Validate canvas size
  const width = document.getElementById('canvas-width');
  const height = document.getElementById('canvas-height');
  if (!width.value.trim()) {
    width.classList.add('error');
    isValid = false;
  }
  if (!height.value.trim()) {
    height.classList.add('error');
    isValid = false;
  }

  // Validate description
  const desc = document.getElementById('record-desc');
  if (!desc.value.trim()) {
    desc.classList.add('error');
    isValid = false;
  }

  // Validate file
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

  // Get main gallery image
  const mainImg = document.getElementById('mainRecordImg');
  const mainImageSrc = mainImg ? mainImg.src : 'img/canvas1.jpg';
  
  // Convert relative path to full URL for email display
  let fullImageUrl = mainImageSrc;
  if (!mainImageSrc.startsWith('http') && !mainImageSrc.startsWith('data:')) {
    fullImageUrl = `https://yardenfad.github.io/paintz-website/${mainImageSrc}`;
  }

  // Create cart item
  const canvasItem = {
    title: 'עיצוב אישי | קנבס',
    notes: `${width.value.trim()} * ${height.value.trim()}`,
    desc: desc.value.trim(),
    qty: parseInt(document.getElementById('record-qty').value) || 1,
    price: 0, // Price to be determined
    mainImage: fullImageUrl, // שמירת התמונה עם URL מלא
    img: fullImageUrl, // URL מלא - יוצג במייל
    file: storedFiles.length > 0 ? storedFiles.map(f => f.name).join(', ') : '',
    files: await window.fileUploadSystem.convertFilesToBase64()
  };

  // Check final object size after base64 conversion
  const itemJSON = JSON.stringify(canvasItem);
  const itemSizeBytes = new Blob([itemJSON]).size;
  const itemSizeMB = (itemSizeBytes / (1024 * 1024)).toFixed(2);
  const maxItemSize = 8 * 1024 * 1024; // 8MB for final object
  

  
  if (itemSizeBytes > maxItemSize) {
    throw new Error(`המוצר גדול מדי אחרי עיבוד (${itemSizeMB}MB). אנא הקטן את הקבצים או הסר חלק מהם.`);
  }

  // Use the improved addToCart function
  try {
    const success = addToCart(canvasItem);
    
    if (!success) {
      throw new Error('שגיאה בהוספת המוצר לסל. אנא נסה שוב.');
    }

    // Reset form
    document.querySelector('.record-form').reset();
    window.fileUploadSystem.clearFiles();

    return false;
  } catch (error) {
    console.error('Error in validateForm:', error);
    // Show error toast if addition failed
    const errorToast = document.getElementById('cartError');
    if (errorToast) {
      errorToast.textContent = error.message || 'שגיאה בהוספת המוצר לסל. אנא נסה שוב.';
      errorToast.classList.add('show');
      setTimeout(() => {
        errorToast.classList.remove('show');
      }, 3000);
    }
    return false;
  }
}

// Add real-time validation
document.addEventListener('DOMContentLoaded', function() {
  // Remove error on width input
  document.getElementById('canvas-width').addEventListener('input', function() {
    if (this.value.trim()) {
      this.classList.remove('error');
    } else {
      this.classList.add('error');
    }
  });

  // Remove error on height input
  document.getElementById('canvas-height').addEventListener('input', function() {
    if (this.value.trim()) {
      this.classList.remove('error');
    } else {
      this.classList.add('error');
    }
  });

  // Remove error on description input
  document.getElementById('record-desc').addEventListener('input', function() {
    if (this.value.trim()) {
      this.classList.remove('error');
    } else {
      this.classList.add('error');
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
    } else {
      this.classList.add('error');
    }
  });
});

// מערכת הוספת קבצים מטופלת על ידי FileUploadSystem
  
// Side Cart Logic
function addToCart(canvasItem) {
  // בדיקה שיש קבצים
  if (!canvasItem.files || canvasItem.files.length === 0) {

    return false;
  }

  try {
    // טעינת העגלה
    let cart = [];
    if (window.cartSync && typeof window.cartSync.loadCart === 'function') {
      cart = window.cartSync.loadCart();
    } else {
      cart = JSON.parse(localStorage.getItem('cart') || '[]');
    }
    

    
    // חיפוש מוצר זהה - כולל בדיקת קבצים
    const existingIndex = cart.findIndex(item => {


      // בדיקת כותרת (חייבת להיות זהה)
      const titleMatch = item.title === canvasItem.title;
      
      // בדיקת גודל והסבר
      const notesMatch = item.notes === canvasItem.notes;
      const descMatch = item.desc === canvasItem.desc;
      

      
      if (!titleMatch || !notesMatch || !descMatch) {
        return false;
      }
      
      // בדיקת קבצים
      const existingFiles = item.files || [];
      const newFiles = canvasItem.files || [];
      
      // אם מספר הקבצים שונה, זה לא אותו מוצר
      if (existingFiles.length !== newFiles.length) {
        return false;
      }
      
      // בדיקה שכל הקבצים זהים - השוואה על בסיס שם, גודל וסוג
      for (let i = 0; i < existingFiles.length; i++) {
        const existingFile = existingFiles[i];
        const newFile = newFiles[i];
        
        // אם חסר קובץ באחד מהם
        if (!existingFile || !newFile) {
          return false;
        }
        
        // נורמליזציה של פרטי הקובץ (לטפל בהבדל בין File object לאובייקט רגיל)
        const getFileProps = (file) => ({
          name: file.name,
          size: file.size,
          type: file.type
        });
        
        const existingProps = getFileProps(existingFile);
        const newProps = getFileProps(newFile);
        
        // בדיקת שם, גודל וסוג של הקובץ
        const nameMatch = existingProps.name === newProps.name;
        const sizeMatch = existingProps.size === newProps.size;
        const typeMatch = existingProps.type === newProps.type;
        

        
        if (!nameMatch || !sizeMatch || !typeMatch) {
          return false;
        }
      }
      
      // אם הגענו לכאן, כל הבדיקות עברו בהצלחה
      return true;
    });



    let targetIndex; // האינדקס של המוצר שצריך לעשות לו אנימציה
    
    // אם נמצא מוצר זהה לחלוטין
    if (existingIndex !== -1) {
      const oldQty = cart[existingIndex].qty || 1;
      cart[existingIndex].qty = oldQty + 1;
      targetIndex = existingIndex; // אנימציה על המוצר הקיים

    } else {
      // אם לא נמצא מוצר זהה
      canvasItem.qty = 1;
      cart.push(canvasItem);
      targetIndex = cart.length - 1; // אנימציה על המוצר החדש (אחרון)

    }

    // שמירה ועדכון
    try {
      if (window.cartSync && typeof window.cartSync.addItem === 'function') {
        if (existingIndex !== -1) {
          window.cartSync.updateItem(existingIndex, {qty: cart[existingIndex].qty});
        } else {
          // Check if adding this item would exceed cart size limit
          const testCart = [...cart, canvasItem];
          const testCartString = JSON.stringify(testCart);
          const testCartSize = new Blob([testCartString]).size;
          const testCartSizeMB = (testCartSize / (1024 * 1024)).toFixed(2);
          const maxCartSize = 5 * 1024 * 1024; // 5MB max (based on typical localStorage limits)
          

          
          if (testCartSize > maxCartSize) {
            throw new Error(`הסל יהיה גדול מדי (${testCartSizeMB}MB). אנא הסר פריטים מהסל או הקטן את הקבצים.`);
          }
          
          window.cartSync.addItem(canvasItem);
        }
      } else {
        localStorage.setItem('cart', JSON.stringify(cart));
      }
    } catch (storageError) {
      console.error('Storage error:', storageError);
      if (storageError.message && storageError.message.includes('הסל יהיה גדול מדי')) {
        throw storageError; // Re-throw our custom error
      } else if (storageError.name === 'QuotaExceededError') {
        throw new Error('הסל גדול מדי - לא ניתן לשמור בזיכרון הדפדפן. אנא הסר פריטים מהסל או הקטן את הקבצים.');
      } else {
        throw new Error('שגיאה בשמירת המוצר - הקבצים גדולים מדי או שאין מקום בזיכרון');
      }
    }
    

    
    // Immediate verification - check if item was actually saved
    let updatedCart = [];
    try {
      if (window.cartSync && typeof window.cartSync.loadCart === 'function') {
        updatedCart = window.cartSync.loadCart();
      } else {
        updatedCart = JSON.parse(localStorage.getItem('cart') || '[]');
      }
    } catch (loadError) {
      console.error('Error loading cart for verification:', loadError);
      throw new Error('שגיאה בטעינת הסל לאימות');
    }
    
    const itemExists = updatedCart.some(item => 
      item.title === canvasItem.title &&
      item.notes === canvasItem.notes &&
      item.desc === canvasItem.desc &&
      item.files && item.files.length === canvasItem.files.length &&
      item.files.every((file, index) => 
        file.name === canvasItem.files[index].name &&
        file.type === canvasItem.files[index].type
        // Removed size check because files are compressed
      )
    );
    
    if (!itemExists) {
      console.error('Item was not actually added to cart');
      throw new Error('המוצר לא נוסף לסל - ייתכן שהקבצים גדולים מדי');
    }
    
    // Only show success if verification passed
    if (window.PaintzSiteUI) {
      window.PaintzSiteUI.updateCartBadge();
      window.PaintzSiteUI.renderCart();
    }
    window.PaintzSiteUI.openSideCart();
    
    // Show success message
    const toast = document.getElementById('toast');
    if (toast) {
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 3000);
    }

    return true;
  } catch (error) {
    console.error('Error adding item to cart:', error);
    return false;
  }
}

// Initialize
if (window.PaintzSiteUI) {
  window.PaintzSiteUI.updateCartBadge();
  window.PaintzSiteUI.renderCart();
}

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
