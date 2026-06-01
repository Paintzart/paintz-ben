'use strict';
/**
 * Shared gallery — click/keyboard navigation for .record-thumb → #mainRecordImg
 */
(function () {
  function syncThumbSelection(selector, activeEl) {
    document.querySelectorAll(selector).forEach(function (el) {
      var isActive = Boolean(activeEl && el === activeEl);
      if (isActive) {
        el.classList.add('selected');
        el.setAttribute('data-gallery-active', 'true');
        el.setAttribute('aria-selected', 'true');
      } else {
        el.classList.remove('selected');
        el.removeAttribute('data-gallery-active');
        el.setAttribute('aria-selected', 'false');
      }
    });
  }

  function selectRecordThumb(thumb) {
    var mainImg = document.getElementById('mainRecordImg');
    if (!mainImg || !thumb) return;

    syncThumbSelection('.record-thumb', thumb);

    var src = thumb.getAttribute('data-img') || thumb.src;
    if (src) {
      mainImg.src = src;
      if (thumb.alt) mainImg.alt = thumb.alt;
    }
  }

  function setProductThumbSelected(thumb) {
    if (!thumb) return;
    syncThumbSelection('.thumbnail', thumb);
  }

  function initRecordGallery() {
    var cols = document.querySelectorAll('.record-thumbs-col');
    if (!cols.length) return;

    cols.forEach(function (col) {
      if (col.dataset.galleryBound === '1') return;
      col.dataset.galleryBound = '1';

      col.addEventListener('click', function (e) {
        var thumb = e.target.closest('.record-thumb');
        if (!thumb || !col.contains(thumb)) return;
        selectRecordThumb(thumb);
        if (e.pointerType === 'mouse' || e.detail > 0) {
          thumb.blur();
        }
      });

      col.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        var thumb = e.target.closest('.record-thumb');
        if (!thumb || !col.contains(thumb)) return;
        e.preventDefault();
        selectRecordThumb(thumb);
      });
    });

    document.querySelectorAll('.record-thumb').forEach(function (thumb) {
      thumb.style.cursor = 'pointer';
    });

    var current =
      document.querySelector('.record-thumb[data-gallery-active="true"]') ||
      document.querySelector('.record-thumb.selected') ||
      document.querySelector('.record-thumb');
    if (current) syncThumbSelection('.record-thumb', current);
  }

  function initProductGallery() {
    var container = document.querySelector('.thumbnail-container');
    if (!container || container.dataset.galleryBound === '1') return;
    container.dataset.galleryBound = '1';

    container.addEventListener('click', function (e) {
      var thumb = e.target.closest('.thumbnail');
      if (!thumb) return;
      var img = thumb.querySelector('img');
      if (!img) return;
      var src = img.getAttribute('src') || img.src;
      if (window.updateMainImage) {
        window.updateMainImage(src, thumb);
      } else {
        var mainImg = document.getElementById('mainImage');
        if (mainImg) mainImg.src = src;
        setProductThumbSelected(thumb);
      }
      if (e.pointerType === 'mouse' || e.detail > 0) {
        thumb.blur();
      }
    });

    var current =
      container.querySelector('.thumbnail[data-gallery-active="true"]') ||
      container.querySelector('.thumbnail.selected') ||
      container.querySelector('.thumbnail');
    if (current) setProductThumbSelected(current);
  }

  function initAll() {
    initRecordGallery();
    initProductGallery();
  }

  window.PaintzGallery = {
    initRecordGallery: initRecordGallery,
    initProductGallery: initProductGallery,
    selectRecordThumb: selectRecordThumb,
    setProductThumbSelected: setProductThumbSelected,
    syncThumbSelection: syncThumbSelection,
    applyThumbSelection: syncThumbSelection,
    init: initAll
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
