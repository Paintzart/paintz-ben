/**
 * Initializes FileUploadSystem on custom design pages (Record, Canvas, Backgammon, Matka).
 */
document.addEventListener('DOMContentLoaded', function () {
  var container = document.getElementById('fileUploadContainer');
  var fileInput = document.getElementById('record-file');
  if (!container || !fileInput || typeof FileUploadSystem === 'undefined') {
    return;
  }

  container.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInput.click();
    }
  });

  window.fileUploadSystem = new FileUploadSystem({
    container: container,
    previewContainer: document.getElementById('filePreviewContainer'),
    errorContainer: document.getElementById('fileErrorMessage'),
    fileInput: fileInput,
    countDisplay: document.getElementById('fileCountDisplay')
  });
});
