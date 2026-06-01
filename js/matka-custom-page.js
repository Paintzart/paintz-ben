// וידוא שה-side-cart מוסתר בטעינת הדף
    
// Add validateForm function for Matka Custom
async function validateForm(e) {
  e.preventDefault();
  
  // Reset error states
  document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  
  let isValid = true;
  const errorFields = [];
  
  // Validate colors
  const color1 = document.getElementById('matka-color1-text');
  const color2 = document.getElementById('matka-color2-text');
  
  if (!color1.value.trim()) {
    color1.classList.add('error');
    errorFields.push('צבע מטקה 1');
    isValid = false;
  }
  
  if (!color2.value.trim()) {
    color2.classList.add('error');
    errorFields.push('צבע מטקה 2');
    isValid = false;
  }
  
  // Validate descriptions
  const desc1 = document.getElementById('matka-desc1');
  const desc2 = document.getElementById('matka-desc2');
  
  if (!desc1.value.trim()) {
    desc1.classList.add('error');
    errorFields.push('הסבר מטקה 1');
    isValid = false;
  }
  
  if (!desc2.value.trim()) {
    desc2.classList.add('error');
    errorFields.push('הסבר מטקה 2');
    isValid = false;
  }
  
  // Validate files
  if (!window.fileUploadSystem || !window.fileUploadSystem.hasFiles()) {
    document.getElementById('fileUploadContainer').classList.add('error');
    errorFields.push('קבצים מצורפים');
    isValid = false;
  }
  
  // Validate quantity
  const qty = document.getElementById('record-qty');
  if (!qty.value || qty.value < 1) {
    qty.classList.add('error');
    errorFields.push('כמות');
    isValid = false;
  }
  
  if (!isValid) {
    const errorToast = document.getElementById('cartError');
    if (errorToast) {
      errorToast.textContent = 'מלא את כל השדות החובה: ' + errorFields.join(', ');
      errorToast.classList.add('show');
      setTimeout(function () { errorToast.classList.remove('show'); }, 3500);
    }
    return false;
  }
  
  // המרת קבצים ל-base64 באמצעות המערכת החדשה
  const filesData = await window.fileUploadSystem.convertFilesToBase64();

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

  // Get main gallery image
  const mainImg = document.getElementById('mainRecordImg');
  const mainImageSrc = mainImg ? mainImg.src : 'img/matka1.jpg';

  // Convert relative path to full URL for email display
  let fullImageUrl = mainImageSrc;
  if (!mainImageSrc.startsWith('http') && !mainImageSrc.startsWith('data:')) {
    fullImageUrl = `https://yardenfad.github.io/paintz-website/${mainImageSrc}`;
  }

  // Convert image to base64 for email display
  const productImageBase64 = await imageUrlToBase64(mainImageSrc);

  // If validation passed, prepare cart item with full file data
  const cartItem = {
    title: 'עיצוב אישי',
    subtitle: 'מטקה',
    qty: parseInt(qty.value),
    id: 'matka_custom_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9), // מזהה ייחודי
    timestamp: new Date().toISOString(), // תאריך ושעת יצירה
    colorData: {
      color1: {
        text: color1.value.trim(),
        color: document.getElementById('matka-color1').value,
        timestamp: new Date().toISOString() // מתי נבחר הצבע
      },
      color2: {
        text: color2.value.trim(),
        color: document.getElementById('matka-color2').value,
        timestamp: new Date().toISOString() // מתי נבחר הצבע
      }
    },
    desc: {
      desc1: desc1.value.trim(),
      desc2: desc2.value.trim(),
      timestamp: new Date().toISOString() // מתי נכתבו ההסברים
    },
    mainImage: fullImageUrl, // שמירת התמונה עם URL מלא
    img: fullImageUrl, // URL מלא - יוצג במייל
    files: filesData,
    formData: {
      // שמירת כל הנתונים מהטופס לגיבוי
      color1Text: color1.value.trim(),
      color1Hex: document.getElementById('matka-color1').value,
      color2Text: color2.value.trim(), 
      color2Hex: document.getElementById('matka-color2').value,
      description1: desc1.value.trim(),
      description2: desc2.value.trim(),
      quantity: parseInt(qty.value),
      mainImageSrc: mainImageSrc,
      filesCount: filesData.length,
      totalFilesSize: filesData.reduce(function (total, file) {
        return total + (file.size || 0);
      }, 0)
    }
  };
  
  // הדפסת כל הנתונים לקונסול לוודא שהכל נשמר
  
  
  // Add to cart using the centralized cart system
  try {
    if (window.cartSync && typeof window.cartSync.addProductToCart === 'function') {
      window.cartSync.addProductToCart(cartItem);
    } else if (typeof window.addProductToCart === 'function') {
      window.addProductToCart(cartItem);
    } else if (window.cartSync && typeof window.cartSync.addItem === 'function') {
      window.cartSync.addItem(cartItem);
      if (window.cartSync.synchronize) window.cartSync.synchronize('add-item');
      if (window.PaintzSiteUI && window.PaintzSiteUI.openSideCart) {
        window.PaintzSiteUI.openSideCart();
      }
    } else {
      const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
      currentCart.push(cartItem);
      localStorage.setItem('cart', JSON.stringify(currentCart));
      if (window.PaintzSiteUI && window.PaintzSiteUI.openSideCart) {
        window.PaintzSiteUI.openSideCart();
      }
    }

    const toast = document.getElementById('toast');
    if (toast) {
      toast.classList.add('show');
      setTimeout(function () { toast.classList.remove('show'); }, 3000);
    }
  } catch (error) {
    console.error('Error adding item to cart:', error);
    const errorToast = document.getElementById('cartError');
    if (errorToast) {
      errorToast.textContent = error.message || 'שגיאה בהוספת המוצר לסל';
      errorToast.classList.add('show');
      setTimeout(function () { errorToast.classList.remove('show'); }, 3500);
    }
    return false;
  }

  const currentForm = document.querySelector('.record-form');
  if (currentForm) {
    currentForm.reset();
  }
  if (window.fileUploadSystem && typeof window.fileUploadSystem.clearFiles === 'function') {
    window.fileUploadSystem.clearFiles();
  }

  document.querySelectorAll('.color-display').forEach(function (display) {
    display.style.backgroundColor = '#ccc';
  });

  return false;
}

// Remove duplicate event listeners
// Event listener cleanup is no longer needed

// Add event listeners for form validation
document.addEventListener('DOMContentLoaded', function() {
  const form = document.querySelector('.record-form');
  let submitting = false;

  if (form) {
    form.addEventListener('submit', async function(event) {
      event.preventDefault();
      if (submitting) return;
      submitting = true;
      try {
        await validateForm(event);
      } finally {
        submitting = false;
      }
    });
  }

  // Remove error on color text inputs
  document.getElementById('matka-color1-text').addEventListener('input', function() {
    if (this.value.trim()) {
      this.classList.remove('error');
    }
  });

  document.getElementById('matka-color2-text').addEventListener('input', function() {
    if (this.value.trim()) {
      this.classList.remove('error');
    }
  });

  // Remove error on description inputs
  document.getElementById('matka-desc1').addEventListener('input', function() {
    if (this.value.trim()) {
      this.classList.remove('error');
    }
  });

  document.getElementById('matka-desc2').addEventListener('input', function() {
    if (this.value.trim()) {
      this.classList.remove('error');
    }
  });



  // Remove error on quantity change
  document.getElementById('record-qty').addEventListener('input', function() {
    if (this.value && this.value >= 1) {
      this.classList.remove('error');
    }
  });
});

// Event listeners are now handled in the validateForm function

// Function is no longer needed as notes are handled in validateForm

// Color picker functionality for mobile
document.addEventListener('DOMContentLoaded', function() {
  // Get all color inputs
  const colorInputs = document.querySelectorAll('input[type="color"]');
  
  // Initialize colors on page load
  function initializeColors() {
    colorInputs.forEach(function(input) {
      // Set the default color if not already set
      if (!input.value || input.value === '#000000') {
        input.value = '#5C4638';
      }
      updateColorDisplay(input);
    });
  }
  
  // Add event listeners to each color input
  colorInputs.forEach(function(input) {
    // Set initial color display
    updateColorDisplay(input);
    
    // Add change event listener
    input.addEventListener('change', function() {
      updateColorDisplay(this);
    });
    
    // Add input event listener for real-time updates
    input.addEventListener('input', function() {
      updateColorDisplay(this);
    });
  });
  
  function updateColorDisplay(colorInput) {
    const color = colorInput.value;
    
    // Update the input's background color directly
    colorInput.style.backgroundColor = color;
    
    // Remove any unwanted elements that might have been created
    const unwantedElements = colorInput.querySelectorAll('*');
    unwantedElements.forEach(element => {
      if (element.style && element.style.backgroundColor) {
        element.remove();
      }
    });
  }
  
  // Initialize colors immediately and after a short delay
  initializeColors();
  setTimeout(initializeColors, 100);
  setTimeout(initializeColors, 500);
});
