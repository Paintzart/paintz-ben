// Lazy Loading for Images
document.addEventListener('DOMContentLoaded', function() {
  // בדוק אם הדפדפן תומך ב-Intersection Observer
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });

    // מצא את כל התמונות עם lazy loading
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback לדפדפנים ישנים
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => {
      img.src = img.dataset.src;
      img.classList.remove('lazy');
    });
  }
});

// פונקציה להמרת תמונות רגילות ל-lazy loading
function convertImagesToLazy() {
  const images = document.querySelectorAll('img:not([data-src])');
  images.forEach(img => {
    if (img.src && !img.classList.contains('lazy-converted')) {
      // שמור את המקור המקורי
      img.dataset.src = img.src;
      
      // הגדר תמונת placeholder קטנה
      img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNGOUYxREMvMCIvPjwvc3ZnPg==';
      
      // הוסף class לזיהוי
      img.classList.add('lazy', 'lazy-converted');
      
      // הוסף אפקט טעינה
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.3s ease';
      
      // הוסף event listener לטעינה
      img.addEventListener('load', function() {
        this.style.opacity = '1';
      });
    }
  });
}

// הפעל את ההמרה כשהדף נטען
window.addEventListener('load', convertImagesToLazy);

