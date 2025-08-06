// מערכת הוספת קבצים מרכזית
// File Upload System - Central Component

class FileUploadSystem {
  constructor(options = {}) {
    this.container = options.container || null;
    this.previewContainer = options.previewContainer || null;
    this.errorContainer = options.errorContainer || null;
    this.fileInput = options.fileInput || null;
    this.countDisplay = options.countDisplay || null;
    
    // הגדרות ברירת מחדל
    this.maxFiles = options.maxFiles || 5;
    this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB
    this.maxTotalSize = options.maxTotalSize || 5 * 1024 * 1024; // 5MB
    this.allowedTypes = options.allowedTypes || ['image/jpeg', 'image/png', 'application/pdf'];
    
    // מערך הקבצים השמורים
    this.storedFiles = [];
    
    // אתחול המערכת
    this.init();
  }
  
  init() {

    
    if (!this.container || !this.fileInput) {
      console.error('FileUploadSystem: Missing required elements');
      return;
    }
    
    this.setupEventListeners();
    this.updateDisplay();
  }
  
  setupEventListeners() {

    
    // לחיצה על אזור ההעלאה
    this.container.addEventListener('click', () => {
      if (this.storedFiles.length >= this.maxFiles) {
        this.showError(`הגעת למגבלה של ${this.maxFiles} קבצים. לא ניתן להוסיף קבצים נוספים.`);
        return;
      }
      this.fileInput.click();
    });
    
    // בחירת קבצים
    this.fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        if (this.storedFiles.length >= this.maxFiles) {
          this.showError(`הגעת למגבלה של ${this.maxFiles} קבצים. לא ניתן להוסיף קבצים נוספים.`);
          e.target.value = '';
          return;
        }
        this.handleFiles(Array.from(e.target.files));
      }
      e.target.value = '';
    });
    
    // גרירה וזריקה
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      this.container.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
      this.container.addEventListener(eventName, () => {
        this.container.classList.add('dragover');
      });
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
      this.container.addEventListener(eventName, () => {
        this.container.classList.remove('dragover');
      });
    });
    
    this.container.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      
      if (this.storedFiles.length >= this.maxFiles) {
        this.showError(`הגעת למגבלה של ${this.maxFiles} קבצים. לא ניתן להוסיף קבצים נוספים.`);
        return;
      }
      
      this.handleFiles(files);
      this.fileInput.value = '';
    });
  }
  
  validateFile(file) {
    if (!this.allowedTypes.includes(file.type)) {
      this.showError('ניתן להעלות רק קבצי PNG, JPG, JPEG או PDF');
      return false;
    }
    
    if (file.size > this.maxFileSize) {
      this.showError('גודל הקובץ חורג מ-10MB');
      return false;
    }
    
    // בדיקה אם הוספת הקובץ תחרוג מהמגבלה הכוללת
    const currentTotalSize = this.storedFiles.reduce((sum, f) => sum + f.size, 0);
    

    
    if (currentTotalSize + file.size > this.maxTotalSize) {
      const remainingMB = ((this.maxTotalSize - currentTotalSize) / (1024 * 1024)).toFixed(1);
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
      this.showError(`הוספת קובץ זה (${fileSizeMB}MB) תחרוג מהמגבלה. נותרו ${remainingMB}MB זמינים`);
      return false;
    }
    
    return true;
  }
  
  handleFiles(files) {
    if (!files || files.length === 0) return;
    
    // בדיקת מגבלת כמות
    const remainingSlots = this.maxFiles - this.storedFiles.length;
    let filesToAdd = Math.min(files.length, remainingSlots);
    
    if (filesToAdd < files.length) {
      this.showError(`ניתן להעלות עד ${this.maxFiles} קבצים בלבד. יועלו ${filesToAdd} קבצים ראשונים.`, true);
    } else if (this.storedFiles.length >= this.maxFiles) {
      this.showError(`הגעת למגבלה של ${this.maxFiles} קבצים. לא ניתן להוסיף קבצים נוספים.`);
      return;
    }
    
    // בדיקת מגבלת גודל כולל - העלאה חכמה של קבצים
    let newFiles = [];
    let currentTotalSize = this.storedFiles.reduce((sum, f) => sum + f.size, 0);
    let addedCount = 0;
    let skippedCount = 0;
    
    for (let i = 0; i < filesToAdd; i++) {
      const file = files[i];
      
      // בדיקת סוג קובץ וגודל בודד
      if (!this.validateFile(file)) {
        skippedCount++;
        continue;
      }
      
      // בדיקת מגבלת גודל כולל
      if (currentTotalSize + file.size <= this.maxTotalSize) {
        newFiles.push(file);
        currentTotalSize += file.size;
        addedCount++;
      } else {
        skippedCount++;
        // המשך לבדוק קבצים נוספים שיכולים להיכנס
      }
    }
    
    // הוספת הקבצים שיכולים להיכנס
    for (let i = 0; i < newFiles.length; i++) {
      this.storedFiles.push(newFiles[i]);
      this.createFilePreview(newFiles[i]);
    }
    

    
    // הצגת הודעה על הקבצים שהועלו
    if (addedCount > 0 && skippedCount > 0) {
      const addedSizeMB = (newFiles.reduce((sum, f) => sum + f.size, 0) / (1024 * 1024)).toFixed(1);
      this.showError(`הועלו ${addedCount} קבצים (${addedSizeMB}MB). ${skippedCount} קבצים לא הועלו עקב מגבלת גודל.`, true);
    } else if (addedCount > 0) {
      const addedSizeMB = (newFiles.reduce((sum, f) => sum + f.size, 0) / (1024 * 1024)).toFixed(1);
      this.showError(`הועלו ${addedCount} קבצים בהצלחה (${addedSizeMB}MB).`, true);
    } else if (skippedCount > 0) {
      this.showError(`לא ניתן להעלות קבצים נוספים עקב מגבלת גודל.`);
    }
    
    this.updateFileInput();
    this.updateDisplay();
    
    if (this.storedFiles.length > 0) {
      this.container.classList.remove('error');
    }
  }
  
  getTotalFilesSize(files) {
    return files.reduce((sum, file) => sum + file.size, 0);
  }
  
  updateFileInput() {
    const dt = new DataTransfer();
    this.storedFiles.forEach(file => dt.items.add(file));
    this.fileInput.files = dt.files;
  }
  
  updateDisplay() {
    if (this.countDisplay) {
      if (this.storedFiles.length > 0) {
        const totalSize = this.storedFiles.reduce((sum, file) => sum + file.size, 0);
        const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(1);
        const maxTotalSize = 5;
        const remainingMB = (maxTotalSize - parseFloat(totalSizeMB)).toFixed(1);
        
        this.countDisplay.style.display = 'block';
        this.countDisplay.innerHTML = `נבחרו <span>${this.storedFiles.length}/5 קבצים (${totalSizeMB}MB/5MB)</span>`;
        
        // שינוי צבע לפי מצב
        if (this.storedFiles.length >= 5 || parseFloat(remainingMB) < 1) {
          this.countDisplay.style.color = '#ff4444'; // אדום כשמלא
        } else if (this.storedFiles.length >= 4 || parseFloat(remainingMB) < 2) {
          this.countDisplay.style.color = '#ff8800'; // כתום כשקרוב למגבלה
        } else {
          this.countDisplay.style.color = '#5EA189'; // ירוק רגיל
        }
      } else {
        this.countDisplay.style.display = 'none';
      }
    }
  }
  
  createFilePreview(file) {
    if (!this.previewContainer) return;
    
    const previewItem = document.createElement('div');
    previewItem.className = 'file-preview-item';

    if (file.type === 'application/pdf') {
      previewItem.innerHTML = `
        <div class="pdf-preview">
          <img src="pdf.svg" alt="PDF" class="pdf-icon" />
          <div class="file-name">${file.name}</div>
        </div>
        <div class="remove-file" data-name="${file.name}">×</div>
      `;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        previewItem.innerHTML = `
          <img src="${e.target.result}" alt="${file.name}" />
          <div class="file-name">${file.name}</div>
          <div class="remove-file" data-name="${file.name}">×</div>
        `;
        
        this.addRemoveButtonListener(previewItem, file.name);
      };
      reader.readAsDataURL(file);
    }

    // הוספת כפתור מחיקה לקבצי PDF
    if (file.type === 'application/pdf') {
      this.addRemoveButtonListener(previewItem, file.name);
    }
    
    this.previewContainer.appendChild(previewItem);
  }
  
  addRemoveButtonListener(previewItem, fileName) {
    const removeBtn = previewItem.querySelector('.remove-file');
    if (removeBtn) {
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeFile(fileName);
        previewItem.remove();
      });
    }
  }
  
  removeFile(fileName) {
    this.storedFiles = this.storedFiles.filter(f => f.name !== fileName);
    this.updateFileInput();
    this.updateDisplay();
    
    if (this.storedFiles.length > 0) {
      this.container.classList.remove('error');
    }
  }
  
  showError(message, isSuccess = false) {
    if (this.errorContainer) {
      this.errorContainer.textContent = message;
      this.errorContainer.style.display = 'block';
      
      // שינוי צבע לפי סוג ההודעה
      if (isSuccess) {
        this.errorContainer.style.color = '#5EA189'; // ירוק להודעות הצלחה
        this.errorContainer.style.background = 'rgba(94, 161, 137, 0.1)';
      } else {
        this.errorContainer.style.color = '#ff4444'; // אדום להודעות שגיאה
        this.errorContainer.style.background = 'rgba(255, 68, 68, 0.1)';
      }
      
      setTimeout(() => {
        this.errorContainer.style.display = 'none';
      }, 4000); // זמן ארוך יותר להודעות הצלחה
    }
  }
  
  // פונקציות עזר
  getFiles() {
    return [...this.storedFiles];
  }
  
  clearFiles() {
    this.storedFiles = [];
    this.updateFileInput();
    this.updateDisplay();
    if (this.previewContainer) {
      this.previewContainer.innerHTML = '';
    }
  }
  
  hasFiles() {

    return this.storedFiles.length > 0;
  }
  
  getFilesCount() {
    return this.storedFiles.length;
  }
  
  // פונקציה להמרת קבצים ל-base64 עם דחיסה
  async convertFilesToBase64() {
    const filesData = await Promise.all(this.storedFiles.map(async file => ({
      name: file.name,
      type: file.type,
      size: file.size,
      data: await this.fileToBase64(file),
      lastModified: file.lastModified || Date.now(),
      uploadTimestamp: new Date().toISOString()
    })));
    
    return filesData;
  }
  
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      if (file.type && file.type.startsWith('image/')) {
        // דחיסת תמונות לפני המרה ל-base64
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = function() {
          // חישוב מימדים חדשים (מקסימום 800px רוחב/גובה)
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
          
          // ציור ודחיסה
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7); // 70% איכות
          
          
          
          resolve(compressedDataUrl);
        };
        
        img.onerror = () => {
          // גיבוי לשיטה המקורית אם הדחיסה נכשלת
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
          reader.readAsDataURL(file);
        };
        
        img.src = URL.createObjectURL(file);
      } else {
        // לקבצים שאינם תמונות, השתמש בשיטה המקורית
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
      }
    });
  }
}

// ייצוא למערכת גלובלית
window.FileUploadSystem = FileUploadSystem; 