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
