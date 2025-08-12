// Cart Synchronization Script - Enhanced Version
// This script ensures cart changes are synchronized across all tabs and pages

// Global variables for synchronization
let syncInProgress = false;
let saveTimeout = null;
let lastKnownCartHash = '';

// Initialize global cart variables
window.cart = window.cart || [];
window.storedFiles = window.storedFiles || [];

// Function to load cart from storage with validation
function loadCartFromStorage() {
  let cart = [];
  
  try {
    const cartData = localStorage.getItem('cart');
    
    if (cartData) {
      cart = JSON.parse(cartData);
      
      // וידוא שהעגלה היא מערך
      if (!Array.isArray(cart)) {
        console.warn('Cart data is not an array, resetting to empty array');
        cart = [];
      }
      
      // נרמול נתונים בסיסיים
      cart = cart.map(item => ({
        ...item,
        qty: parseInt(item.qty) || 1,
        title: (item.title || '').trim(),
        subtitle: (item.subtitle || '').trim(),
        notes: (item.notes || '').trim(),
        desc: typeof item.desc === 'string' ? item.desc.trim() : item.desc,
        files: Array.isArray(item.files) ? item.files : (item.file ? [item.file] : [])
      }));
    }
  } catch (e) {
    console.error('Error loading cart:', e);
    cart = [];
  }
  
  return cart;
}

// Function to safely save cart to localStorage with debouncing
function saveCartToStorage(cartData, immediate = false) {
  // Validate input
  if (!Array.isArray(cartData)) {
    console.error('Invalid cart data type:', typeof cartData);
    return false;
  }

  // Clear existing timeout if not immediate
  if (saveTimeout && !immediate) {
    clearTimeout(saveTimeout);
  }

  const doSave = () => {
    try {
      const cartString = JSON.stringify(cartData);
      const cartSizeBytes = new Blob([cartString]).size;
      const cartSizeMB = (cartSizeBytes / (1024 * 1024)).toFixed(2);
      const maxCartSize = 5 * 1024 * 1024; // 5MB max for entire cart (based on typical localStorage limits)
      
      if (cartSizeBytes > maxCartSize) {
        // Try to compress the cart data by reducing image quality
        
        // Find items with large files and compress them
        const compressedCart = cartData.map(item => {
          if (item.files && item.files.length > 0) {
            return {
              ...item,
              files: item.files.map(file => {
                if (file.type && file.type.startsWith('image/') && file.data) {
                  // For images, we'll reduce quality in the next step
                  return file;
                }
                return file;
              })
            };
          }
          return item;
        });
        
        // Try saving compressed version
        const compressedString = JSON.stringify(compressedCart);
        const compressedSize = new Blob([compressedString]).size;
        const compressedSizeMB = (compressedSize / (1024 * 1024)).toFixed(2);
        
        if (compressedSize <= maxCartSize) {
          // Use compressed version
          cartData = compressedCart;
        } else {
          throw new Error(`הסל גדול מדי (${cartSizeMB}MB). אנא הסר פריטים מהסל או הקטן את הקבצים.`);
        }
      }
      
      // Try to save to localStorage
      try {
        localStorage.setItem('cart', cartString);
      } catch (storageError) {
        if (storageError.name === 'QuotaExceededError') {
          throw new Error(`הסל גדול מדי (${cartSizeMB}MB). אנא הסר פריטים מהסל או הקטן את הקבצים.`);
        } else {
          throw storageError;
        }
      }
      lastKnownCartHash = hashString(cartString);
      window.lastCartString = cartString;
      
      // Immediate UI update after saving
      setTimeout(() => {
        synchronizeCart('immediate-after-save');
      }, 10);
      
      return true;
    } catch (e) {
      console.error('Error saving cart to storage:', e);
      return false;
    }
  };

  if (immediate) {
    return doSave();
  } else {
    // Debounce saves to prevent conflicts
    saveTimeout = setTimeout(doSave, 50); // Reduced from 150ms to 50ms for faster response
    return true;
  }
}

// Simple hash function for comparison
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

// Function to update cart badge across all pages
function syncUpdateCartBadge() {
  if (syncInProgress) return;
  
  const cartBadge = document.getElementById('cartBadge');
  if (cartBadge) {
    try {
      const cart = loadCartFromStorage();
      const total = cart.reduce((sum, item) => sum + (parseInt(item.qty) || 1), 0);
      if (total > 0) {
        cartBadge.style.display = 'block';
        cartBadge.textContent = total.toString();
      } else {
        cartBadge.style.display = 'none';
      }
    } catch (e) {
      console.error('Error updating cart badge:', e);
      cartBadge.style.display = 'none';
    }
  }
}

// Function to re-render cart items (if cart list exists on page)
function syncRenderCart() {
  if (syncInProgress) return;
  
  try {
    // Check if the current page has a cart render function
    if (typeof renderCart === 'function') {
      // Update the global cart variable first
      if (typeof cart !== 'undefined') {
        const newCart = loadCartFromStorage();
        // Always update to ensure UI reflects latest state
        cart = newCart;
        renderCart();
      }
    }
    
    // Check if the current page has a big cart render function (Shopping Cart page)
    if (typeof renderBigCart === 'function' && typeof bigCart !== 'undefined') {
      const newBigCart = loadCartFromStorage();
      // Always update to ensure UI reflects latest state
      bigCart = newBigCart;
      renderBigCart();
    }
  } catch (e) {
  }
}

// Main synchronization function with error handling
function synchronizeCart(source = 'unknown') {
  if (syncInProgress) {
    return;
  }
  
  try {
    syncUpdateCartBadge();
    syncRenderCart();
  } catch (e) {
  }
}

// Enhanced storage event listener
window.addEventListener('storage', function(e) {
  if (e.key === 'cart' && e.newValue !== e.oldValue) {
    // Skip if this tab made the change
    if (syncInProgress) return;
    
    try {
      const newCartString = e.newValue || '[]';
      const newHash = hashString(newCartString);
      
      // Only sync if the cart has actually changed
      if (newHash !== lastKnownCartHash) {
        lastKnownCartHash = newHash;
        window.lastCartString = newCartString;
        
        // Update global cart variable if it exists
        if (typeof cart !== 'undefined') {
          cart = loadCartFromStorage();
        }
        
        // Update global bigCart variable if it exists
        if (typeof bigCart !== 'undefined') {
          bigCart = loadCartFromStorage();
        }
        
        // Small delay to avoid conflicts
        setTimeout(() => synchronizeCart('storage-event'), 25);
      }
    } catch (e) {
      console.error('Error handling storage event:', e);
    }
  }
});

// Listen for focus event to sync when returning to tab
window.addEventListener('focus', function() {
  // Delay to ensure any pending operations complete
  setTimeout(() => {
    if (!syncInProgress) {
      synchronizeCart('focus-event');
    }
  }, 100);
});

// Faster periodic check (every 2 seconds instead of 5)
let periodicCheckInterval = setInterval(function() {
  if (syncInProgress) return;
  
  try {
    const currentCartString = localStorage.getItem('cart') || '[]';
    const currentHash = hashString(currentCartString);
    
    if (currentHash !== lastKnownCartHash && window.lastCartString !== currentCartString) {
      window.lastCartString = currentCartString;
      lastKnownCartHash = currentHash;
      
      if (typeof cart !== 'undefined') {
        cart = loadCartFromStorage();
      }
      
      if (typeof bigCart !== 'undefined') {
        bigCart = loadCartFromStorage();
      }
      
      synchronizeCart('periodic-check');
    }
  } catch (e) {
  }
}, 2000); // Check every 2 seconds instead of 5

// Page visibility change handling
document.addEventListener('visibilitychange', function() {
  if (!document.hidden && !syncInProgress) {
    setTimeout(() => synchronizeCart('visibility-change'), 50);
  }
});

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  try {
    // Set initial cart string for comparison
    const initialCart = localStorage.getItem('cart') || '[]';
    window.lastCartString = initialCart;
    lastKnownCartHash = hashString(initialCart);
    
    // Initial synchronization with delay to let page load
    setTimeout(() => {
      synchronizeCart('dom-ready');
    }, 50);
  } catch (e) {
    console.error('Error initializing cart sync:', e);
  }
});

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  if (periodicCheckInterval) {
    clearInterval(periodicCheckInterval);
  }
});

// Helper function to get color from name
function getColorFromName(colorName) {
  const colorMap = {
    'אדום': '#FF0000', 'כחול': '#0000FF', 'ירוק': '#008000', 'צהוב': '#FFFF00',
    'כתום': '#FFA500', 'סגול': '#800080', 'ורוד': '#FFC0CB', 'חום': '#A52A2A',
    'שחור': '#000000', 'לבן': '#FFFFFF', 'אפור': '#808080', 'תכלת': '#00CED1',
    'בז\'': '#F5F5DC', 'זהב': '#FFD700', 'כסף': '#C0C0C0', 'ברונזה': '#CD7F32'
  };
  return colorMap[colorName.trim()] || '#ccc';
}

// Helper function to truncate text
function truncateText(text, maxLength = 10) {
  if (!text) return '';
  text = text.toString().trim();
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Helper function to check if item should be shown in mini cart
function shouldShowInMiniCart(item) {
  // Show all items in mini cart (removed the filtering logic)
  return true;
}

// Universal function to render cart item notes and details
function renderCartNotes(item, hidePrices = false) {
  const details = [];
  let colorBox = '';
  const notesText = item.notes || '';
  const allTitles = ((item.title || '') + ' ' + (item.subtitle || '')).toLowerCase();

  // Helper function to handle files display
  function addFilesDisplay() {
    const allFiles = [];
    
    // Add single file if exists
    if (item.file) {
      const fileName = item.file.split(/[\/\\]/).pop();
      if (fileName) {
        allFiles.push(fileName);
      }
    }
    
    // Add files from array
    if (item.files && item.files.length > 0) {
      item.files.forEach(file => {
        const displayName = file.name || 'קובץ';
        allFiles.push(displayName);
      });
    }
    
    // Display all files in one line if any exist
    if (allFiles.length > 0) {
      const filesDisplay = allFiles.join(', ');
      const fileDetails = `<span class='side-cart-item-details-label'>קובץ:</span> <span class='side-cart-item-details-value'>${hidePrices ? filesDisplay : truncateText(filesDisplay, 10)}</span>`;
      return fileDetails;
    }
    
    return '';
  }

  // Handle custom backgammon design
  if (allTitles.includes('שש בש') && allTitles.includes('עיצוב אישי')) {
    const colorLines = [];
    const explanations = [];
    
    // Handle colors - check if colorData exists, otherwise fallback to text parsing
    if (item.colorData) {
      // Use stored color data from form with correct field names
      const colorData = item.colorData;
      
      if (colorData.bgOuter) {
        colorLines.push(`<span class='side-cart-item-details-label'>צבע רקע (מהבחוץ):</span> <span class='side-cart-item-details-value'><span class='side-cart-item-color-box' style='background:${colorData.bgOuter.color}' title='${colorData.bgOuter.text}'></span></span>`);
      }
      if (colorData.bgInnerRight) {
        colorLines.push(`<span class='side-cart-item-details-label'>צבע רקע (מבפנים-צד ימין):</span> <span class='side-cart-item-details-value'><span class='side-cart-item-color-box' style='background:${colorData.bgInnerRight.color}' title='${colorData.bgInnerRight.text}'></span></span>`);
      }
      if (colorData.bgInnerLeft) {
        colorLines.push(`<span class='side-cart-item-details-label'>צבע רקע (מבפנים-צד שמאל):</span> <span class='side-cart-item-details-value'><span class='side-cart-item-color-box' style='background:${colorData.bgInnerLeft.color}' title='${colorData.bgInnerLeft.text}'></span></span>`);
      }
      if (colorData.triangle1) {
        colorLines.push(`<span class='side-cart-item-details-label'>צבע משולש 1:</span> <span class='side-cart-item-details-value'><span class='side-cart-item-color-box' style='background:${colorData.triangle1.color}' title='${colorData.triangle1.text}'></span></span>`);
      }
      if (colorData.triangle2) {
        colorLines.push(`<span class='side-cart-item-details-label'>צבע משולש 2:</span> <span class='side-cart-item-details-value'><span class='side-cart-item-color-box' style='background:${colorData.triangle2.color}' title='${colorData.triangle2.text}'></span></span>`);
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
      details.push(...colorLines);
    }
    
    // Handle explanations - check if desc exists, otherwise fallback to text parsing
    if (item.desc) {
      // Use stored explanation data from form
      const desc = item.desc;
      if (desc.right) {
        details.push(`<span class='side-cart-item-details-label'>הסבר ציור ימין:</span> <span class='side-cart-item-details-value'>${hidePrices ? desc.right : truncateText(desc.right, 10)}</span>`);
      }
      if (desc.left) {
        details.push(`<span class='side-cart-item-details-label'>הסבר ציור שמאל:</span> <span class='side-cart-item-details-value'>${hidePrices ? desc.left : truncateText(desc.left, 10)}</span>`);
      }
    } else {
      // Fallback to text parsing for old items
      const rightExplanationMatch = notesText.match(/הסבר ציור ימין:\s*([^,]+?)(?=,\s*הסבר ציור שמאל|$)/);
      const leftExplanationMatch = notesText.match(/הסבר ציור שמאל:\s*([^,]+?)(?=,\s*|$)/);
      
      if (rightExplanationMatch) {
        details.push(`<span class='side-cart-item-details-label'>הסבר ציור ימין:</span> <span class='side-cart-item-details-value'>${hidePrices ? rightExplanationMatch[1].trim() : truncateText(rightExplanationMatch[1].trim(), 10)}</span>`);
      }
      
      if (leftExplanationMatch) {
        details.push(`<span class='side-cart-item-details-label'>הסבר ציור שמאל:</span> <span class='side-cart-item-details-value'>${hidePrices ? leftExplanationMatch[1].trim() : truncateText(leftExplanationMatch[1].trim(), 10)}</span>`);
      }
    }
    
    // Add files display
    const filesDisplay = addFilesDisplay();
    if (filesDisplay) {
      details.push(filesDisplay);
    }
  } else if (allTitles.includes('מטקה') && allTitles.includes('עיצוב אישי')) {
    // עיבוד מיוחד למטקה עיצוב אישי
    const colors = [];
    const explanations = [];
    
    // בדיקת צבעים והסברים בפורמט הישן
    if (item.colorData) {
      if (item.colorData.color1) {
        const colorHex = item.colorData.color1.hex || item.colorData.color1.color;
        details.push(`<span class='side-cart-item-details-label'>צבע מטקה 1: </span><span class='side-cart-item-details-value'><span class='side-cart-item-color-box' style='background:${colorHex}' title='${item.colorData.color1.text}'></span></span>`);
      }
      if (item.colorData.color2) {
        const colorHex = item.colorData.color2.hex || item.colorData.color2.color;
        details.push(`<span class='side-cart-item-details-label'>צבע מטקה 2: </span><span class='side-cart-item-details-value'><span class='side-cart-item-color-box' style='background:${colorHex}' title='${item.colorData.color2.text}'></span></span>`);
      }
      
      // הסברים - נחפש קודם בתוך colorData, אחרי זה בתוך desc
      const desc1 = item.colorData.desc1 || (item.desc && item.desc.desc1);
      const desc2 = item.colorData.desc2 || (item.desc && item.desc.desc2);
      
      if (desc1) {
        details.push(`<span class='side-cart-item-details-label'>הסבר מטקה 1: </span><span class='side-cart-item-details-value'>${hidePrices ? desc1 : truncateText(desc1, 10)}</span>`);
      }
      if (desc2) {
        details.push(`<span class='side-cart-item-details-label'>הסבר מטקה 2: </span><span class='side-cart-item-details-value'>${hidePrices ? desc2 : truncateText(desc2, 10)}</span>`);
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
          details.push(`<span class='side-cart-item-details-label'>${label}: </span><span class='side-cart-item-details-value'>${hidePrices ? value : truncateText(value, 10)}</span>`);
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
    const filesDisplay = addFilesDisplay();
    if (filesDisplay) {
      details.push(filesDisplay);
    }
  } else if (allTitles.includes('תקליט') && allTitles.includes('עיצוב אישי')) {
    // Special handling for custom record design
    const descriptionFull = item.desc ? (typeof item.desc === 'string' ? item.desc.trim() : JSON.stringify(item.desc)) : '';
    
    // Use full text for comparison, truncated text for display
    const description = descriptionFull ? (hidePrices ? descriptionFull : truncateText(descriptionFull)) : '';
    
    if (description) {
      details.push(`<span class='side-cart-item-details-label'>הסבר:</span> <span class='side-cart-item-details-value'>${description}</span>`);
    }
    
    // Add files display
    const filesDisplay = addFilesDisplay();
    if (filesDisplay) {
      details.push(filesDisplay);
    }
  } else if (allTitles.includes('קנבס')) {
    // Special handling for canvas items
    const size = notesText.trim();
    const description = item.desc ? (typeof item.desc === 'string' ? item.desc.trim() : JSON.stringify(item.desc)) : '';
    
    if (size) {
      details.push(`<span class='side-cart-item-details-label'>גודל:</span> <span class='side-cart-item-details-value'>${hidePrices ? size : truncateText(size)}</span>`);
    }
    if (description) {
      details.push(`<span class='side-cart-item-details-label'>הסבר:</span> <span class='side-cart-item-details-value'>${hidePrices ? description : truncateText(description)}</span>`);
    }

    // Add files display
    const filesDisplay = addFilesDisplay();
    if (filesDisplay) {
      details.push(filesDisplay);
    }
  } else {
    // Default handling for other items
    let noteLabel = 'הערה:';
    if (allTitles.includes('מטקה')) noteLabel = 'צבע:';
    
    // Look for color: "גוון: ..." and show color box
    let colorMatch = notesText.match(/גוון\s*[:：]?\s*([\u0590-\u05FF\w]+)/);
    if (colorMatch) {
      const colorName = colorMatch[1];
      const colorHex = getColorFromName(colorName);
      colorBox = `<span class='side-cart-item-color-box' style='background:${colorHex}' title='${colorName}'></span>`;
      notesText = notesText.replace(/,?\s*גוון\s*[:：]?\s*[\u0590-\u05FF\w]+/, '');
    }
    
    // בדיקה מיוחדת למוצרי דגמים - הצג הערות רק אם יש
    const isModelItem = (item.title === 'מטקה' && !item.notes) || 
                       allTitles.includes('דגם');
    
    if (allTitles.includes('מטקה')) {
      if (colorBox) {
        details.push(`<span class='side-cart-item-details-label'>${noteLabel}</span> <span class='side-cart-item-details-value'>${colorBox}</span>`);
      }
      // הצג הערות למוצרי דגמים אם יש
      if (!isModelItem && notesText.trim()) {
        details.push(`<span class='side-cart-item-details-label'>הערה:</span> <span class='side-cart-item-details-value'>${hidePrices ? notesText.trim() : truncateText(notesText.trim())}</span>`);
      }
    } else if (notesText.trim() || colorBox) {
      details.push(`<span class='side-cart-item-details-label'>${noteLabel}</span> <span class='side-cart-item-details-value'>${hidePrices ? notesText.trim() : truncateText(notesText.trim())} ${colorBox}</span>`);
    }

    // Add files display for non-canvas items too
    const filesDisplay = addFilesDisplay();
    if (filesDisplay) {
      details.push(filesDisplay);
    }
  }

  // Remove generic explanation display for custom design items that have their own handling
  // Handle desc field - check if it's string or object
  const descText = item.desc ? (typeof item.desc === 'string' ? item.desc : JSON.stringify(item.desc)) : '';
  
  if (descText && !allTitles.includes('תקליט') && !allTitles.includes('מטקה') && !(allTitles.includes('שש בש') && allTitles.includes('עיצוב אישי')) && !(allTitles.includes('קנבס') && allTitles.includes('עיצוב אישי'))) {
    details.push(`<span class='side-cart-item-details-label'>הסבר:</span> <span class='side-cart-item-details-value'>${hidePrices ? descText : truncateText(descText)}</span>`);
  }
  // Return different formats based on hidePrices (true = big cart, false = mini cart)
  if (hidePrices) {
    // For big cart - return UL format
    return details.length ? `<ul class='big-cart-item-notes' style='list-style:none;margin:0 0 2px 0;padding:0;'>${details.map(detail => `<li>${detail}</li>`).join('')}</ul>` : '';
  } else {
    // For mini cart - check if it's a custom design item and return li format
    if ((allTitles.includes('מטקה') && allTitles.includes('עיצוב אישי')) || 
        (allTitles.includes('שש בש') && allTitles.includes('עיצוב אישי'))) {
      return details.map(detail => `<li>${detail}</li>`).join('');
    } else {
      // For other items, return DIV format
      return details.map(detail => `<div style="font-family: 'Amatica SC', cursive;">${detail}</div>`).join('');
    }
  }
}

// Function to get price display HTML for mini cart
function renderCartPrice(item, hidePrices = false) {
  if (!hidePrices && item.price) {
    return `<div class='side-cart-item-price-display' style='font-size: 14px; color: #000; margin-top: 4px; font-family: "Amatica SC", cursive; text-align: center; display: flex; justify-content: center; align-items: center;'>${item.price}</div>`;
  }
  return '';
}

// Helper function to normalize product data for consistent comparison
function normalizeProductData(item) {
  return {
    title: (item.title || '').trim(),
    subtitle: (item.subtitle || '').trim(), 
    notes: (item.notes || '').trim().replace(/\s+/g, ' '),
    desc: typeof item.desc === 'string' ? item.desc.trim() : item.desc,
    price: (item.price || '').trim(),
    img: item.img || '',
    qty: parseInt(item.qty) || 1,
    files: item.files || [],
    file: item.file || '',
    colorData: item.colorData || {}
  };
}

// Add item to cart with proper comparison
function addItem(item) {
  if (!item) return -1;
  
  // Load current cart
  const cart = loadCartFromStorage();
  
  // Find existing item with exact match
  const existingIndex = findExistingItemIndex(cart, item);
  if (existingIndex !== -1) {
    // Update quantity of existing item
    cart[existingIndex].qty = (cart[existingIndex].qty || 1) + (item.qty || 1);
  } else {
    // Add new item
    if (!item.qty) item.qty = 1;
    cart.push(item);
  }
  
  // Save cart immediately
  saveCartToStorage(cart, true);
  
  // Return index of item in cart
  return existingIndex !== -1 ? existingIndex : cart.length - 1;
}

// Function to find existing item in cart
function findExistingItemIndex(cart, item) {
  if (!Array.isArray(cart) || !item) return -1;
  
  return cart.findIndex(existing => {
    // בדיקת שדות חובה
    if (!existing.title || !existing.subtitle) {
      return false;
    }

    // בדיקת כותרת וכותרת משנית - חובה להיות זהים
    const titleMatch = existing.title === item.title;
    const subtitleMatch = existing.subtitle === item.subtitle;
    
    // אם הכותרות לא תואמות, זה לא אותו מוצר
    if (!titleMatch || !subtitleMatch) {
      return false;
    }

    // בדיקה אם זה מוצר מעמוד דגמים
    const isModelPage = (existing.title + ' ' + existing.subtitle).toLowerCase().includes('דגם') || 
                       (item.title + ' ' + item.subtitle).toLowerCase().includes('דגם') ||
                       (existing.title === 'מטקה' && !existing.notes) ||
                       (item.title === 'מטקה' && !item.notes);

    // אם זה מעמוד דגמים, בדוק שהכותרות זהות
    if (isModelPage) {
      return true;
    }
    
    // עבור מוצרי עיצוב אישי, בדוק קבצים והסברים
    const isCustomDesign = (existing.title + ' ' + existing.subtitle).toLowerCase().includes('עיצוב אישי') ||
                          (item.title + ' ' + item.subtitle).toLowerCase().includes('עיצוב אישי');
    
    if (isCustomDesign) {
      // בדיקת קבצים
      const existingFiles = existing.files || [];
      const itemFiles = item.files || [];
      
      // אם יש קבצים שונים, זה לא אותו מוצר
      if (existingFiles.length !== itemFiles.length) {
        return false;
      }
      
      // בדיקת שמות הקבצים
      for (let i = 0; i < existingFiles.length; i++) {
        const existingFile = existingFiles[i];
        const itemFile = itemFiles[i];
        
        if (!existingFile || !itemFile) {
          if (existingFile !== itemFile) {
            return false;
          }
          continue;
        }
        
        if (existingFile.name !== itemFile.name || 
            existingFile.type !== itemFile.type) {
          return false;
        }
      }
      
      // בדיקת הסברים
      const existingDesc = (existing.desc || '').trim();
      const itemDesc = (item.desc || '').trim();
      
      if (existingDesc !== itemDesc) {
        return false;
      }
      
      return true;
    }
    
    // עבור מוצרים רגילים, בדוק הערות
    const existingNotes = (existing.notes || '').trim();
    const itemNotes = (item.notes || '').trim();
    
    // אם ההערות זהות (כולל ריקות), זה אותו מוצר
    if (existingNotes === itemNotes) {
      return true;
    }
    
    // אם ההערות שונות, זה לא אותו מוצר
    return false;
  });
}

// Make function globally available
window.addItem = addItem;

// Expose functions to global scope for external use
window.cartSync = {
  loadCart: loadCartFromStorage,
  saveCart: saveCartToStorage,
  synchronize: synchronizeCart,
  renderCartNotes: renderCartNotes,
  renderCartPrice: renderCartPrice,
  areItemsIdentical: areItemsIdentical,
  findExistingIndex: findExistingItemIndex,
  normalizeProduct: normalizeProductData,
  addItem: addItem,
  updateItem: updateCartItem,
  removeItem: removeCartItem
};

// Function to check if two items are identical
function areItemsIdentical(item1, item2) {
  if (!item1 || !item2) {
    return false;
  }

  // בדיקה בסיסית - כותרת וכותרת משנית
  if (item1.title !== item2.title || item1.subtitle !== item2.subtitle) {
    return false;
  }

  // בדיקה אם זה מוצר מעמוד דגמים
  const isModel1 = (item1.title + ' ' + item1.subtitle).toLowerCase().includes('דגם') || 
                   (item1.title === 'מטקה' && !item1.notes);
  const isModel2 = (item2.title + ' ' + item2.subtitle).toLowerCase().includes('דגם') || 
                   (item2.title === 'מטקה' && !item2.notes);
  
  if (isModel1 && isModel2) {
    // עבור מוצרי דגמים, בדוק רק כותרת וכותרת משנית
    return true;
  }

  // עבור מוצרי עיצוב אישי, נבדוק קבצים והסברים
  const isCustom1 = (item1.title + ' ' + item1.subtitle).toLowerCase().includes('עיצוב אישי');
  const isCustom2 = (item2.title + ' ' + item2.subtitle).toLowerCase().includes('עיצוב אישי');
  
  if (isCustom1 && isCustom2) {
    // בדיקת קבצים
    const files1 = item1.files || [];
    const files2 = item2.files || [];
    
    if (files1.length !== files2.length) {
      return false;
    }
    
    // בדיקת שמות הקבצים
    for (let i = 0; i < files1.length; i++) {
      const file1 = files1[i];
      const file2 = files2[i];
      
      if (!file1 || !file2) {
        if (file1 !== file2) {
          return false;
        }
        continue;
      }
      
      if (file1.name !== file2.name || 
          file1.type !== file2.type) {
        return false;
      }
    }
    
    // בדיקת הסברים
    const desc1 = (typeof item1.desc === 'string' ? item1.desc : '').trim();
    const desc2 = (typeof item2.desc === 'string' ? item2.desc : '').trim();
    
    if (desc1 !== desc2) {
      return false;
    }
    
    return true;
  }

  // עבור מוצרים רגילים, בדוק הערות
  const notes1 = (typeof item1.notes === 'string' ? item1.notes : '').trim();
  const notes2 = (typeof item2.notes === 'string' ? item2.notes : '').trim();
  
  if (notes1 !== notes2) {
    return false;
  }

  // אם הגענו לכאן, המוצרים זהים
  return true;
}

// Function to update a cart item (usually quantity)
function updateCartItem(index, updates) {
  try {
    const cart = loadCartFromStorage();
    if (index >= 0 && index < cart.length) {
      // Update the specified item
      Object.assign(cart[index], updates);
      
      // Save immediately
      saveCartToStorage(cart, true);
      
      // Sync across tabs
      setTimeout(() => synchronizeCart('item-updated'), 10);
      
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}

// Function to remove a cart item
function removeCartItem(index) {
  try {
    const cart = loadCartFromStorage();
    if (index >= 0 && index < cart.length) {
      cart.splice(index, 1);
      
      // Save immediately
      saveCartToStorage(cart, true);
      
      // Sync across tabs
      setTimeout(() => synchronizeCart('item-removed'), 10);
      
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}

// Function to show delete confirmation dialog
function showDeleteDialog(idx) {
  const dialog = document.createElement('div');
  dialog.className = 'delete-dialog';
  dialog.innerHTML = `
    <div class="delete-dialog-content">
      <p>האם אתה בטוח שברצונך להסיר פריט זה מהסל?</p>
      <div class="delete-dialog-buttons">
        <button onclick="confirmDelete(${idx})" class="delete-confirm">כן, הסר</button>
        <button onclick="hideDeleteDialog()" class="delete-cancel">ביטול</button>
      </div>
    </div>
  `;
  document.body.appendChild(dialog);
}

// Function to hide delete confirmation dialog
function hideDeleteDialog() {
  const dialog = document.querySelector('.delete-dialog');
  if (dialog) {
    dialog.remove();
  }
}

// Function to confirm deletion
function confirmDelete(idx) {
  try {
    window.cart = window.cart || loadCartFromStorage();
    if (idx >= 0 && idx < window.cart.length) {
      window.cart.splice(idx, 1);
      saveCartToStorage(window.cart, true);
      updateCartBadge();
      renderCart();
    }
  } catch (e) {
    console.error('Error removing item:', e);
  }
  hideDeleteDialog();
}

// Make functions globally available
window.showDeleteDialog = showDeleteDialog;
window.hideDeleteDialog = hideDeleteDialog;
window.confirmDelete = confirmDelete;

// Function to update cart badge
function updateCartBadge() {
  const cartBadge = document.getElementById('cartBadge');
  if (!cartBadge) return;
  
  try {
    const cart = window.cart || loadCartFromStorage();
    const total = cart.reduce((sum, item) => sum + (parseInt(item.qty) || 1), 0);
    
    if (total > 0) {
      cartBadge.style.display = 'block';
      cartBadge.textContent = total.toString();
    } else {
      cartBadge.style.display = 'none';
    }
  } catch (e) {
    console.error('Error updating cart badge:', e);
    cartBadge.style.display = 'none';
  }
}

// Make function globally available
window.updateCartBadge = updateCartBadge;

// Function to render cart items
function renderCart() {
  const cartList = document.querySelector('.side-cart-list');
  if (!cartList) return;
  
  try {
    const cart = window.cart || loadCartFromStorage();
    
    if (!cart || cart.length === 0) {
      cartList.innerHTML = '<div class="empty-cart-message">הסל ריק</div>';
      return;
    }
    
    let html = '';
    cart.forEach((item, index) => {
      const isCustom = item.type === 'custom';
      
      html += `
        <div class="cart-item" data-index="${index}">
          <div class="cart-item-content">
            <div class="cart-item-title">${item.title}</div>
            <div class="cart-item-subtitle">${item.subtitle}</div>
            ${isCustom ? renderCustomItemDetails(item) : ''}
            <div class="cart-item-qty">כמות: ${item.qty}</div>
          </div>
          <button class="cart-item-remove" onclick="showDeleteDialog(${index})">
            <img src="trash.svg" alt="הסר" />
          </button>
        </div>
      `;
    });
    
    cartList.innerHTML = html;
  } catch (e) {
    console.error('Error rendering cart:', e);
    cartList.innerHTML = '<div class="error-message">שגיאה בטעינת הסל</div>';
  }
}

// Helper function to render custom item details
function renderCustomItemDetails(item) {
  const { colorData = {}, desc = {} } = item;
  
  let details = '<div class="cart-item-details">';
  
  // Add color information
  if (colorData.bgOuter) {
    details += `<div>צבע רקע חיצוני: ${colorData.bgOuter.text}</div>`;
  }
  if (colorData.bgInnerRight) {
    details += `<div>צבע רקע פנימי ימין: ${colorData.bgInnerRight.text}</div>`;
  }
  if (colorData.bgInnerLeft) {
    details += `<div>צבע רקע פנימי שמאל: ${colorData.bgInnerLeft.text}</div>`;
  }
  if (colorData.triangle1) {
    details += `<div>צבע משולש 1: ${colorData.triangle1.text}</div>`;
  }
  if (colorData.triangle2) {
    details += `<div>צבע משולש 2: ${colorData.triangle2.text}</div>`;
  }
  
  // Add descriptions
  if (desc.right) {
    details += `<div>ציור ימין: ${desc.right}</div>`;
  }
  if (desc.left) {
    details += `<div>ציור שמאל: ${desc.left}</div>`;
  }
  
  // Add file information
  if (item.files && item.files.length > 0) {
    details += `<div>קבצים מצורפים: ${item.files.length}</div>`;
  }
  
  details += '</div>';
  return details;
}

// Make functions globally available
window.renderCart = renderCart;

// Function to open side cart
function openSideCart(highlightIndex = -1) {
  const sideCart = document.getElementById('sideCart');
  const overlay = document.getElementById('cartOverlay');
  if (!sideCart || !overlay) return;
  
  // Show cart and overlay
  sideCart.classList.add('active');
  overlay.classList.add('active');
  
  // Highlight item if specified
  if (highlightIndex >= 0) {
    setTimeout(() => {
      const item = document.querySelector(`.cart-item[data-index="${highlightIndex}"]`);
      if (item) {
        item.classList.add('highlight');
        item.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Remove highlight after animation
        setTimeout(() => {
          item.classList.remove('highlight');
        }, 2000);
      }
    }, 300);
  }
}

// Function to close side cart
function closeSideCart() {
  const sideCart = document.getElementById('sideCart');
  const overlay = document.getElementById('cartOverlay');
  if (!sideCart || !overlay) return;
  
  sideCart.classList.remove('active');
  overlay.classList.remove('active');
}

// Make functions globally available
window.openSideCart = openSideCart;
window.closeSideCart = closeSideCart;

// Add click handler to overlay
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('cartOverlay');
  if (overlay) {
    overlay.addEventListener('click', closeSideCart);
  }
});

// Function to initialize cart
function initializeCart() {
  try {
    // Try to load from localStorage first
    const cart = loadCartFromStorage();
    
    // Set global cart variable
    window.cart = cart;
    
    // Update UI
    updateCartBadge();
    if (typeof renderCart === 'function') {
      renderCart();
    }
    
    return cart;
  } catch (e) {
    console.error('Error initializing cart:', e);
    return [];
  }
}

// Make function globally available
window.initializeCart = initializeCart;

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', () => {
  initializeCart();
}); 