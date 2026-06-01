async function validateForm(e) {
  e.preventDefault();

  document.querySelectorAll('.error').forEach(function (el) { el.classList.remove('error'); });

  var isValid = true;
  var colorIds = [
    'bg-color-outer-text',
    'bg-color-inner-right-text',
    'bg-color-inner-left-text',
    'triangle1-color-text',
    'triangle2-color-text'
  ];

  colorIds.forEach(function (id) {
    var input = document.getElementById(id);
    if (input && !input.value.trim()) {
      input.classList.add('error');
      isValid = false;
    }
  });

  var descRight = document.getElementById('desc-right');
  var descLeft = document.getElementById('desc-left');
  if (descRight && !descRight.value.trim()) { descRight.classList.add('error'); isValid = false; }
  if (descLeft && !descLeft.value.trim()) { descLeft.classList.add('error'); isValid = false; }

  if (!window.fileUploadSystem || !window.fileUploadSystem.hasFiles()) {
    var uploadEl = document.getElementById('fileUploadContainer');
    if (uploadEl) uploadEl.classList.add('error');
    isValid = false;
  }

  var qty = document.getElementById('record-qty');
  if (!qty || !qty.value || qty.value < 1) {
    if (qty) qty.classList.add('error');
    isValid = false;
  }

  if (!isValid) {
    var errorToast = document.getElementById('errorToast');
    if (errorToast) {
      errorToast.classList.add('show');
      setTimeout(function () { errorToast.classList.remove('show'); }, 3000);
    }
    return false;
  }

  var filesData = await window.fileUploadSystem.convertFilesToBase64();
  var mainImg = document.getElementById('mainRecordImg');
  var mainImageSrc = mainImg ? mainImg.src : 'img/Backgammon1.jpg';
  var fullImageUrl = mainImageSrc;
  if (!mainImageSrc.startsWith('http') && !mainImageSrc.startsWith('data:')) {
    fullImageUrl = 'https://paintz.store/' + mainImageSrc.replace(/^\//, '');
  }

  var cartItem = {
    title: 'עיצוב אישי',
    subtitle: 'שש בש',
    qty: parseInt(qty.value, 10),
    colorData: {
      bgOuter: { text: document.getElementById('bg-color-outer-text').value.trim(), color: document.getElementById('bg-color-outer').value },
      bgInnerRight: { text: document.getElementById('bg-color-inner-right-text').value.trim(), color: document.getElementById('bg-color-inner-right').value },
      bgInnerLeft: { text: document.getElementById('bg-color-inner-left-text').value.trim(), color: document.getElementById('bg-color-inner-left').value },
      triangle1: { text: document.getElementById('triangle1-color-text').value.trim(), color: document.getElementById('triangle1-color').value },
      triangle2: { text: document.getElementById('triangle2-color-text').value.trim(), color: document.getElementById('triangle2-color').value }
    },
    desc: {
      right: document.getElementById('desc-right').value.trim(),
      left: document.getElementById('desc-left').value.trim()
    },
    mainImage: fullImageUrl,
    img: fullImageUrl,
    files: filesData
  };

  try {
    if (!window.cartSync || typeof window.cartSync.addItem !== 'function') {
      throw new Error('שגיאה בהוספת המוצר לסל');
    }
    window.cartSync.addItem(cartItem);
    if (window.cartSync.synchronize) window.cartSync.synchronize('add-item-complete');
    if (window.PaintzSiteUI) {
      window.PaintzSiteUI.updateCartBadge();
      window.PaintzSiteUI.renderCart();
      window.PaintzSiteUI.openSideCart();
    }
    var toast = document.getElementById('toast');
    if (toast) {
      toast.classList.add('show');
      setTimeout(function () { toast.classList.remove('show'); }, 3000);
    }
  } catch (err) {
    var cartError = document.getElementById('cartError');
    if (cartError) {
      cartError.textContent = err.message || 'שגיאה בהוספת המוצר לסל';
      cartError.classList.add('show');
      setTimeout(function () { cartError.classList.remove('show'); }, 3000);
    }
    return false;
  }

  var form = document.getElementById('customBackgammonForm');
  if (form) form.reset();
  window.fileUploadSystem.clearFiles();
  return false;
}

window.updateColorDisplay = function (colorInput) {
  colorInput.style.backgroundColor = colorInput.value;
};

document.addEventListener('DOMContentLoaded', function () {
  var colorIds = [
    'bg-color-outer-text', 'bg-color-inner-right-text', 'bg-color-inner-left-text',
    'triangle1-color-text', 'triangle2-color-text'
  ];
  colorIds.forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('input', function () {
      if (this.value.trim()) this.classList.remove('error');
    });
  });

  ['desc-right', 'desc-left'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('input', function () {
      if (this.value.trim()) this.classList.remove('error');
    });
  });

  var qtyEl = document.getElementById('record-qty');
  if (qtyEl) {
    qtyEl.addEventListener('input', function () {
      if (this.value && this.value >= 1) this.classList.remove('error');
    });
  }

  var form = document.getElementById('customBackgammonForm');
  var addBtn = document.getElementById('addToCartBtn');
  if (form) form.addEventListener('submit', validateForm);
  if (addBtn) addBtn.addEventListener('click', function (e) { e.preventDefault(); validateForm(e); });

  var fileInput = document.getElementById('record-file');
  if (fileInput) {
    fileInput.addEventListener('change', function () {
      if (window.fileUploadSystem && window.fileUploadSystem.hasFiles()) {
        document.getElementById('fileUploadContainer').classList.remove('error');
      }
    });
  }

  document.querySelectorAll('input[type="color"]').forEach(function (input) {
    if (!input.value || input.value === '#000000') input.value = '#5C4638';
    window.updateColorDisplay(input);
    input.addEventListener('change', function () { window.updateColorDisplay(this); });
    input.addEventListener('input', function () { window.updateColorDisplay(this); });
  });
});
