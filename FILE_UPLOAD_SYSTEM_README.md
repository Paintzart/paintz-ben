                      # מערכת הוספת קבצים מרכזית
# Central File Upload System

## סקירה כללית
מערכת הוספת קבצים מרכזית שפותחה עבור אתר Paintz. המערכת מאפשרת העלאת קבצים עם תצוגה מקדימה, דחיסה אוטומטית של תמונות, וניהול מגבלות גודל וכמות.

## תכונות עיקריות

### ✅ תכונות קיימות
- **העלאת קבצים מרובים**: עד 5 קבצים בו-זמנית
- **סוגי קבצים נתמכים**: PNG, JPG, JPEG, PDF
- **מגבלות גודל**: 
  - קובץ בודד: עד 10MB
  - סך הכל: עד 5MB
- **דחיסה אוטומטית**: תמונות נדחסות אוטומטית ל-800px מקסימום עם איכות 70%
- **תצוגה מקדימה**: תמונות מוצגות כמיני-תמונות, PDF מוצג עם אייקון
- **גרירה וזריקה**: תמיכה מלאה ב-Drag & Drop
- **כפתורי מחיקה**: אפשרות למחיקת קבצים בודדים
- **ספירת קבצים**: תצוגת כמות קבצים וגודל כולל
- **הודעות שגיאה**: הודעות ברורות בעברית
- **רספונסיביות**: עיצוב מותאם למובייל

### 🎨 עיצוב
- **עיצוב אחיד**: זהה בכל העמודים
- **אנימציות**: אפקטים חלקים בעת גרירה והעלאה
- **צבעים דינמיים**: שינוי צבע לפי מצב (ירוק/כתום/אדום)
- **תמיכה במובייל**: רספונסיבי לכל הגדלי מסך

## איך להשתמש

### 1. הוספת הקבצים הנדרשים

#### הוספת CSS
```html
<link rel="stylesheet" href="file-upload-styles.css">
```

#### הוספת JavaScript
```html
<script src="file-upload-system.js"></script>
```

### 2. מבנה HTML נדרש

```html
<!-- אזור העלאה -->
<div class="file-upload-container" id="fileUploadContainer">
  <div class="file-upload-text">גרור קבצים לכאן או לחץ לבחירה</div>
  <div class="file-upload-subtext">
    <span class="file-type-icon">PNG</span>
    <span class="file-type-icon">JPEG</span>
    <span class="file-type-icon">JPG</span>
    <span class="file-type-icon">PDF</span>
    עד 5 קבצים, תמונות יודחסו אוטומטית (מקסימום 5MB לקבצים)
  </div>
  <div class="file-count-display" id="fileCountDisplay" style="display:none;">
    נבחרו <span id="fileCount">0</span> קבצים
  </div>
  <input type="file" id="record-file" multiple accept="image/png,image/jpeg,application/pdf" style="display:none" />
</div>

<!-- אזור תצוגה מקדימה -->
<div class="file-preview-container" id="filePreviewContainer"></div>

<!-- הודעות שגיאה -->
<div class="file-error-message" id="fileErrorMessage"></div>
```

### 3. אתחול המערכת

```javascript
document.addEventListener('DOMContentLoaded', function() {
  // אתחול מערכת הוספת קבצים
  const fileUploadSystem = new FileUploadSystem({
    container: document.getElementById('fileUploadContainer'),
    previewContainer: document.getElementById('filePreviewContainer'),
    errorContainer: document.getElementById('fileErrorMessage'),
    fileInput: document.getElementById('record-file'),
    countDisplay: document.getElementById('fileCountDisplay')
  });
  
  // שמירת המערכת בגלובלי לשימוש בפונקציות אחרות
  window.fileUploadSystem = fileUploadSystem;
});
```

### 4. שימוש בפונקציות

#### בדיקת נוכחות קבצים
```javascript
if (window.fileUploadSystem.hasFiles()) {
  // יש קבצים
}
```

#### קבלת הקבצים
```javascript
const files = window.fileUploadSystem.getFiles();
```

#### המרה ל-base64 (עם דחיסה)
```javascript
const filesData = await window.fileUploadSystem.convertFilesToBase64();
```

#### ניקוי הקבצים
```javascript
window.fileUploadSystem.clearFiles();
```

#### קבלת כמות קבצים
```javascript
const count = window.fileUploadSystem.getFilesCount();
```

## דוגמה מלאה לשימוש

```javascript
// פונקציית אימות טופס
async function validateForm(event) {
  event.preventDefault();
  let isValid = true;

  // בדיקת קבצים
  if (!window.fileUploadSystem.hasFiles()) {
    document.getElementById('fileUploadContainer').classList.add('error');
    isValid = false;
  } else {
    document.getElementById('fileUploadContainer').classList.remove('error');
  }

  if (!isValid) return false;

  // המרת קבצים ל-base64
  const filesData = await window.fileUploadSystem.convertFilesToBase64();

  // יצירת אובייקט מוצר
  const cartItem = {
    title: 'עיצוב אישי',
    subtitle: 'תקליט',
    desc: document.getElementById('record-desc').value,
    files: filesData,
    qty: parseInt(document.getElementById('record-qty').value) || 1,
    price: '',
    img: 'img/img-record1.jpg'
  };

  // הוספה לסל
  const success = addToCart(cartItem);
  
  if (success) {
    // ניקוי הטופס
    document.getElementById('record-desc').value = '';
    document.getElementById('record-qty').value = '1';
    window.fileUploadSystem.clearFiles();
  }

  return false;
}
```

## הגדרות מותאמות אישית

```javascript
const fileUploadSystem = new FileUploadSystem({
  container: document.getElementById('fileUploadContainer'),
  previewContainer: document.getElementById('filePreviewContainer'),
  errorContainer: document.getElementById('fileErrorMessage'),
  fileInput: document.getElementById('record-file'),
  countDisplay: document.getElementById('fileCountDisplay'),
  
  // הגדרות מותאמות אישית
  maxFiles: 5,                    // כמות מקסימלית של קבצים
  maxFileSize: 10 * 1024 * 1024, // גודל מקסימלי לקובץ (10MB)
  maxTotalSize: 5 * 1024 * 1024, // גודל מקסימלי כולל (5MB)
  allowedTypes: [                 // סוגי קבצים מותרים
    'image/jpeg', 
    'image/png', 
    'application/pdf'
  ]
});
```

## תמיכה בעמודים קיימים

המערכת כבר מוטמעת בעמודים הבאים:
- ✅ `Record.html` - עמוד תקליטים
- ✅ `Canvas.html` - עמוד קנבסים

## יתרונות המערכת

1. **קוד מרכזי**: מערכת אחת לכל העמודים
2. **תחזוקה קלה**: שינויים במקום אחד משפיעים על הכל
3. **עקביות**: התנהגות זהה בכל העמודים
4. **ביצועים**: דחיסה אוטומטית חוסכת רוחב פס
5. **UX משופר**: הודעות ברורות ואנימציות חלקות
6. **רספונסיביות**: עובד מושלם במובייל

## פתרון בעיות

### בעיה: הקבצים לא נטענים
**פתרון**: וודא שכל האלמנטים הנדרשים קיימים ב-HTML

### בעיה: דחיסה לא עובדת
**פתרון**: המערכת חוזרת אוטומטית לשיטה המקורית אם הדחיסה נכשלת

### בעיה: הודעות שגיאה לא מוצגות
**פתרון**: וודא שקיים אלמנט עם ID `fileErrorMessage`

## עדכונים עתידיים

- [ ] תמיכה בסוגי קבצים נוספים
- [ ] אפשרות להגדרת מגבלות שונות לכל עמוד
- [ ] תצוגה מקדימה מתקדמת יותר
- [ ] אפשרות להעלאה לשרת 