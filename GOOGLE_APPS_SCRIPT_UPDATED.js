// Google Apps Script - מערכת הזמנות Paintz - גרסה סופית מתוקנת

// === הוראות שימוש לפונקציות בדיקה ===
// 
// כדי לבדוק את מערכת המיילים, הרץ את הפונקציות הבאות ב-Google Apps Script Console:
//
// 1. testEmailSystem() - בודקת את כל מערכת המיילים
// 2. checkAdvancedPermissions() - בודקת הרשאות מתקדמות
// 3. diagnoseEmailIssues() - מאבחנת בעיות נפוצות
// 4. testEmailSending() - בודקת שליחת מיילים מלאה
//
// אם יש בעיות, הבדוק:
// - הרשאות Gmail API
// - הגדרות הפריסה (Deployment)
// - לוגים ב-Google Apps Script Console
// - כתובות המייל של השולח והמקבל
//
// === סיבות נפוצות לבעיות ===
// 1. הרשאות Gmail לא מופעלות
// 2. הסקריפט לא מפורסם כאפליקציית ווב
// 3. כתובת המייל של הלקוח לא תקינה
// 4. בעיות ברשת או בשרת
// 5. שגיאות בקוד המייל

// === משתנים גלובליים לתמונה מוטמעת לבדיקה ===
var matkaImgHtml = '<div style="margin-top:30px;text-align:center;border-top:2px solid #20B2AA;padding-top:20px;"><strong>תמונה לבדיקה:</strong><br><img src="https://via.placeholder.com/180x180/FF6B6B/ffffff?text=Matka1+Real" style="width:180px;border-radius:12px;border:2px solid #20B2AA;box-shadow:0 2px 8px #ccc;margin-top:10px;" onerror="this.style.display=\'none\'"></div>';

// פונקציה לבדיקת תמונה תקינה למייל
function isValidEmailImage(imageUrl) {
  if (!imageUrl) return false;
  
  // בדיקה אם זה URL תקין למייל
  const isValid = imageUrl.startsWith('data:image') || imageUrl.startsWith('http');
  
  // אם זה URL חיצוני, נבדוק אם הוא נגיש
  if (isValid && imageUrl.startsWith('http')) {
    try {
      // בדיקה בסיסית של ה-URL
      const url = new URL(imageUrl);
      if (!url.hostname || url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        console.log(`Image URL is localhost - will be hidden: ${imageUrl}`);
        return false;
      }
    } catch (e) {
      console.log(`Invalid URL format - will be hidden: ${imageUrl}`);
      return false;
    }
  }
  
  return isValid;
}

// פונקציה להמרת נתיב תמונה ל-URL מלא אם אפשר
function processImageUrl(imageUrl) {
  if (!imageUrl) return null;
  
  // אם זה כבר URL מלא או base64, החזר אותו
  if (imageUrl.startsWith('http') || imageUrl.startsWith('data:image')) {
    return imageUrl;
  }
  
  // אם זה נתיב יחסי, נסה להמיר ל-URL מלא
  // כאן תוכל להוסיף את הדומיין שלך
  const baseUrl = 'https://yardenfad.github.io/paintz-website'; // החלף בדומיין האמיתי של האתר שלך
  
  // הסר / מההתחלה אם יש
  if (imageUrl.startsWith('/')) {
    imageUrl = imageUrl.substring(1);
  }
  
  const fullUrl = `${baseUrl}/${imageUrl}`;
  
  // בדיקה אם ה-URL תקין למייל
  if (isValidEmailImage(fullUrl)) {
    return fullUrl;
  } else {
    console.log(`Processed image URL is not valid for email: ${fullUrl}`);
    return null;
  }
}

// פונקציה להמרת תמונה ל-base64 (לשימוש עתידי)
function convertImageToBase64(imageUrl) {
  try {
    // אם זה כבר base64, החזר אותו
    if (imageUrl && imageUrl.startsWith('data:image')) {
      return imageUrl;
    }
    
    // אם זה URL מלא, נסה להמיר ל-base64
    if (imageUrl && imageUrl.startsWith('http')) {
      // כאן אפשר להוסיף לוגיקה להמרה ל-base64
      // כרגע נחזיר את ה-URL המקורי
      return imageUrl;
    }
    
    return null;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return null;
  }
}

// פונקציה לבדיקת זמינות תמונה
function checkImageAvailability(imageUrl) {
  if (!imageUrl) return false;
  
  try {
    // בדיקה בסיסית של ה-URL
    if (!isValidEmailImage(imageUrl)) {
      console.log(`Image URL is not valid for email: ${imageUrl}`);
      return false;
    }
    
    // אם זה localhost או URL לא תקין, נחזיר false
    if (imageUrl.includes('localhost') || imageUrl.includes('127.0.0.1')) {
      console.log(`Image URL is localhost - not available: ${imageUrl}`);
      return false;
    }
    
    // בדיקה מיוחדת לדומיין GitHub Pages
    if (imageUrl.includes('github.io')) {
      console.log(`GitHub Pages image URL detected: ${imageUrl}`);
      // GitHub Pages בדרך כלל נגיש למיילים
      return true;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking image availability:', error);
    return false;
  }
}

// העתק את הקוד הזה לGoogle Apps Script

function doGet(e) {
  try {
  console.log('=== doGet called ===');
    console.log('doGet event object:', e);
    console.log('doGet parameters:', e ? e.parameter : 'e is undefined');
    
    // בדיקה אם e קיים ויש לו parameter
    if (!e || !e.parameter) {
      console.log('No parameters received in doGet');
      return ContentService
        .createTextOutput(JSON.stringify({
          message: 'Paintz Orders API is running',
          status: 'active',
          timestamp: new Date().toISOString(),
          instructions: 'Use POST method to send orders, GET for testing'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const callback = e.parameter.callback;
    const data = e.parameter.data;
    
    if (data) {
      const orderData = JSON.parse(data);
      const orderNumber = generateOrderNumber();
      orderData.orderNumber = orderNumber;
      
      sendBusinessEmail(orderData);
      sendCustomerEmail(orderData);
      
      const response = {success: true, message: 'Order sent successfully', orderNumber: orderNumber};
      const jsonpResponse = callback + '(' + JSON.stringify(response) + ');';
      
      return ContentService
        .createTextOutput(jsonpResponse)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else {
      const response = {message: 'Paintz Orders API is running'};
      if (callback) {
        const jsonpResponse = callback + '(' + JSON.stringify(response) + ');';
      return ContentService
          .createTextOutput(jsonpResponse)
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      } else {
        return ContentService
          .createTextOutput(JSON.stringify(response))
        .setMimeType(ContentService.MimeType.JSON);
      }
    }
  } catch (error) {
    console.error('Error in doGet:', error);
    const response = {success: false, error: error.toString()};
    
    if (e && e.parameter && e.parameter.callback) {
      const jsonpResponse = e.parameter.callback + '(' + JSON.stringify(response) + ');';
    return ContentService
        .createTextOutput(jsonpResponse)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else {
      return ContentService
        .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
    }
  }
}

function doPost(e) {
  try {
    // הוספת logging מורחב
  console.log('=== doPost called ===');
    console.log('Event object e:', e);
    console.log('Event object type:', typeof e);
    console.log('Event object keys:', e ? Object.keys(e) : 'e is undefined');
    
    // בדיקה אם e קיים
    if (!e) {
      console.error('❌ No event object received - e is undefined');
      console.log('This usually means the form is not sending data correctly');
      console.log('Or the URL is not configured properly');
      
      // נסיון לבדוק אם יש נתונים בדרך אחרת
      console.log('Trying to get data from other sources...');
      
      // נסיון מספר 1: מ-ContentService
      try {
        const request = ContentService.getRequest();
        console.log('ContentService request:', request);
        if (request && request.parameter) {
          console.log('Found data in ContentService request');
          e = { parameter: request.parameter };
        }
      } catch (csError) {
        console.log('ContentService not available:', csError.message);
      }
      
      // אם עדיין אין נתונים, נחזיר שגיאה ברורה
      if (!e) {
        throw new Error('לא התקבל אובייקט אירוע - בדוק את הגדרת הטופס וה-URL');
      }
    }
    
  console.log('e.parameter:', e.parameter);
  console.log('e.postData:', e.postData);
    console.log('e.postData.contents:', e.postData ? e.postData.contents : 'undefined');
    console.log('e.postData.type:', e.postData ? e.postData.type : 'undefined');
  
    let data;
    
    // נסיון מספר 1: מparam.data (הפורמט שהטופס שולח)
    if (e.parameter && e.parameter.data) {
      console.log('Method 1: Getting data from e.parameter.data');
      console.log('Raw data length:', e.parameter.data.length);
      console.log('Raw data preview:', e.parameter.data.substring(0, 200) + '...');
      console.log('Raw data type:', typeof e.parameter.data);
      try {
      data = JSON.parse(e.parameter.data);
        console.log('Parsed data successfully');
      } catch (parseError) {
        console.error('Error parsing data:', parseError);
        console.error('Raw data that failed to parse:', e.parameter.data);
        throw new Error('שגיאה בפענוח הנתונים: ' + parseError.toString());
    } 
    } 
    // נסיון מספר 2: מpostData.contents
    else if (e.postData && e.postData.contents) {
      console.log('Method 2: Getting data from e.postData.contents');
      console.log('Raw data:', e.postData.contents);
      console.log('Raw data type:', typeof e.postData.contents);
      try {
      data = JSON.parse(e.postData.contents);
        console.log('Parsed data successfully');
      } catch (parseError) {
        console.error('Error parsing data:', parseError);
        throw new Error('שגיאה בפענוח הנתונים: ' + parseError.toString());
    }
    }
    // נסיון מספר 3: מכל הparameters
    else if (e.parameter) {
      console.log('Method 3: Getting data from all parameters');
      console.log('All parameters:', e.parameter);
      data = e.parameter;
    }
    // נסיון מספר 4: בדיקה אם יש data בשדה אחר
    else if (e.postData && e.postData.contents) {
      console.log('Method 4: Trying to parse postData.contents as JSON');
      try {
        data = JSON.parse(e.postData.contents);
        console.log('Successfully parsed postData.contents');
      } catch (parseError) {
        console.error('Failed to parse postData.contents:', parseError);
        throw new Error('שגיאה בפענוח הנתונים: ' + parseError.toString());
      }
    }
    else {
      console.error('❌ No data found in any method');
      console.log('Available data:');
      console.log('- e.parameter:', e.parameter);
      console.log('- e.postData:', e.postData);
      console.log('- e.postData.contents:', e.postData ? e.postData.contents : 'undefined');
      console.log('- e.postData.type:', e.postData ? e.postData.type : 'undefined');
      console.log('- e.parameter keys:', e.parameter ? Object.keys(e.parameter) : 'undefined');
      
      // נסיון נוסף - בדיקה אם יש נתונים בכלל
      console.log('=== Debugging data issue ===');
      console.log('Full event object:', JSON.stringify(e, null, 2));
      
      // אם אין נתונים בכלל, נחזיר הודעה ברורה
      if (!e.parameter && !e.postData) {
        throw new Error('לא התקבלו נתונים מהטופס - בדוק את הגדרת הטופס, ה-URL והשיטת שליחה');
      }
      
      throw new Error('הנתונים התקבלו אבל לא בפורמט הנכון - בדוק את מבנה הנתונים שנשלחים');
    }
    
    // בדיקת שדות חיוניים ולוגים מפורטים
    console.log('=== Data validation ===');
    console.log('Full data object received from form:', JSON.stringify(data, null, 2));
    console.log('firstName:', data.firstName);
    console.log('lastName:', data.lastName);
    console.log('email:', data.email);
    console.log('cart length:', data.cart ? data.cart.length : 'undefined');
    console.log('cart data:', data.cart);
    
    // בדיקה מפורטת של כל פריט בעגלה
    if (data.cart && data.cart.length > 0) {
      console.log('=== Detailed cart analysis ===');
      data.cart.forEach((item, index) => {
        console.log(`Item ${index} keys:`, Object.keys(item));
        console.log(`Item ${index} complete object:`, JSON.stringify(item, null, 2));
      });
    }
    
    // בדיקה שהנתונים תקינים
  if (!data.firstName || !data.lastName || !data.email) {
      console.error('Missing required fields');
      throw new Error('חסרים שדות נדרשים: שם, שם משפחה, אימייל');
    }
    
    if (!data.cart || !Array.isArray(data.cart) || data.cart.length === 0) {
      console.error('Invalid or empty cart');
      console.log('Cart data:', data.cart);
      throw new Error('העגלה ריקה או לא תקינה');
    }
    
    // בדיקה מפורטת של כל פריט בעגלה
    console.log('=== Cart items validation ===');
    data.cart.forEach((item, index) => {
      console.log(`Item ${index + 1}:`, {
        title: item.title,
        subtitle: item.subtitle,
        price: item.price,
        img: item.img,
        notes: item.notes,
        colorData: item.colorData,
        desc: item.desc,
        filesCount: item.files ? item.files.length : 0
      });
    });
    
    // יצירת מספר הזמנה
    const orderNumber = generateOrderNumber();
    data.orderNumber = orderNumber;
    console.log('Generated order number:', orderNumber);
    
    // שליחת מיילים עם בדיקה מתקדמת
    console.log('=== Sending emails with advanced validation ===');
    console.log('Data being passed to email functions:', {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      cartLength: data.cart ? data.cart.length : 'undefined',
      orderNumber: data.orderNumber
    });
    console.log('Full cart data being sent to emails:', JSON.stringify(data.cart, null, 2));
    
    // מערכת בדיקה מתקדמת למיילים
    let businessEmailSent = false;
    let customerEmailSent = false;
    let businessEmailError = null;
    let customerEmailError = null;
    
    // שליחת מייל לעסק עם בדיקה
    try {
      console.log('Sending business email...');
      console.log('Data being passed to sendBusinessEmail:', JSON.stringify(data, null, 2));
      console.log('Data type:', typeof data);
      console.log('Data is null?', data === null);
      console.log('Data is undefined?', data === undefined);
      
      if (!data) {
        throw new Error('Data is null or undefined when calling sendBusinessEmail');
      }
      
    sendBusinessEmail(data);
      console.log('Business email sent successfully');
      businessEmailSent = true;
    } catch (emailError) {
      console.error('Error sending business email:', emailError);
      businessEmailError = emailError;
      throw new Error('שגיאה בשליחת מייל לעסק: ' + emailError.toString());
    }
    
    // שליחת מייל ללקוח עם בדיקה
    try {
      console.log('Sending customer email...');
      console.log('Data being passed to sendCustomerEmail:', JSON.stringify(data, null, 2));
      console.log('Data type:', typeof data);
      console.log('Data is null?', data === null);
      console.log('Data is undefined?', data === undefined);
      
      if (!data) {
        throw new Error('Data is null or undefined when calling sendCustomerEmail');
      }
      
    sendCustomerEmail(data);
      console.log('Customer email sent successfully');
      customerEmailSent = true;
  } catch (emailError) {
      console.error('Error sending customer email:', emailError);
      customerEmailError = emailError;
      throw new Error('שגיאה בשליחת מייל ללקוח: ' + emailError.toString());
    }
    
    // בדיקה סופית של שליחת המיילים
    console.log('=== Final email validation ===');
    console.log('Business email sent:', businessEmailSent);
    console.log('Customer email sent:', customerEmailSent);
    console.log('Business email error:', businessEmailError);
    console.log('Customer email error:', customerEmailError);
    
    // אם יש בעיה עם מייל אחד, נחזיר הודעה מתאימה
    if (!businessEmailSent && !customerEmailSent) {
      console.error('❌ Both emails failed to send');
    return HtmlService.createHtmlOutput(`
      <html>
        <head>
          <meta charset="UTF-8">
            <title>בעיה בשליחת המיילים</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              direction: rtl;
              text-align: center;
              padding: 50px;
              background: #f9f1dc;
            }
            .error-container {
                background: #ffebee;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              max-width: 500px;
              margin: 0 auto;
                border: 2px solid #e57373;
            }
            h1 {
                color: #c62828;
              margin-bottom: 20px;
            }
            p {
              color: #5A3E36;
              font-size: 18px;
              line-height: 1.6;
            }
            .order-number {
              font-size: 24px;
              font-weight: bold;
              color: #5B9B86;
              margin: 20px 0;
            }
            .insta-link {
              color: #5B9B86;
              font-weight: bold;
              text-decoration: none;
            }
              .warning-box {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
              }
              .button {
                background: #5B9B86;
                color: white;
                padding: 12px 24px;
                border: none;
                border-radius: 6px;
                font-size: 16px;
                cursor: pointer;
                margin: 10px;
                text-decoration: none;
                display: inline-block;
              }
              .button:hover {
                background: #4a8a75;
              }
          </style>
        </head>
        <body>
          <div class="error-container">
              <h1>ההזמנה התקבלה אך יש בעיה בשליחת המיילים</h1>
              <div class="order-number">מספר הזמנה: #${orderNumber}</div>
            <p>ההזמנה שלך התקבלה בהצלחה במערכת!</p>
              <p>אך יש בעיה בשליחת המיילים.</p>
              
              <div class="warning-box">
                <p><strong>⚠️ חשוב:</strong> הסל קניות שלך נשמר ולא יימחק!</p>
                <p>אם המיילים לא נשלחו, תוכל לנסות שוב מאוחר יותר.</p>
              </div>
              
              <p><strong>אפשרויות:</strong></p>
              <p>1. נסה שוב מאוחר יותר</p>
              <p>2. פנה אלינו באינסטגרם:
              <a class="insta-link" href="https://instagram.com/paintz.official" target="_blank">@paintz.official</a>
            </p>
              <p>3. או במייל: paintz.yf@gmail.com</p>
              
              <a href="Order.html" class="button">נסה שוב</a>
              <a href="homepage.html" class="button">חזור לדף הבית</a>
          </div>
        </body>
      </html>
    `);
    } else if (!businessEmailSent) {
      console.warn('⚠️ Business email failed, but customer email sent');
      return HtmlService.createHtmlOutput(`
        <html>
          <head>
            <meta charset="UTF-8">
            <title>הזמנה נשלחה - חלקית</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                direction: rtl;
                text-align: center;
                padding: 50px;
                background: #f9f1dc;
              }
              .warning-container {
                background: #fff3cd;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                max-width: 500px;
                margin: 0 auto;
                border: 2px solid #ffeaa7;
              }
              h1 {
                color: #856404;
                margin-bottom: 20px;
              }
              p {
                color: #5A3E36;
                font-size: 18px;
                line-height: 1.6;
              }
              .order-number {
                font-size: 24px;
                font-weight: bold;
                color: #5B9B86;
                margin: 20px 0;
              }
              .button {
                background: #5B9B86;
                color: white;
                padding: 12px 24px;
                border: none;
                border-radius: 6px;
                font-size: 16px;
                cursor: pointer;
                margin: 10px;
                text-decoration: none;
                display: inline-block;
              }
              .button:hover {
                background: #4a8a75;
              }
            </style>
          </head>
          <body>
            <div class="warning-container">
              <h1>ההזמנה נשלחה בהצלחה!</h1>
              <div class="order-number">מספר הזמנה: #${orderNumber}</div>
              <p>קיבלת מייל אישור לכתובת: ${data.email}</p>
              <p>אם לא קיבלת מייל, אנא פנו אלינו: paintz.yf@gmail.com</p>
              
              <a href="homepage.html" class="button">חזור לדף הבית</a>
            </div>
          </body>
        </html>
      `);
    } else if (!customerEmailSent) {
      console.warn('⚠️ Customer email failed, but business email sent');
      return HtmlService.createHtmlOutput(`
        <html>
          <head>
            <meta charset="UTF-8">
            <title>הזמנה נשלחה - חלקית</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                direction: rtl;
                text-align: center;
                padding: 50px;
                background: #f9f1dc;
              }
              .warning-container {
                background: #fff3cd;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                max-width: 500px;
                margin: 0 auto;
                border: 2px solid #ffeaa7;
              }
              h1 {
                color: #856404;
                margin-bottom: 20px;
              }
              p {
                color: #5A3E36;
                font-size: 18px;
                line-height: 1.6;
              }
              .order-number {
                font-size: 24px;
                font-weight: bold;
                color: #5B9B86;
                margin: 20px 0;
              }
              .button {
                background: #5B9B86;
                color: white;
                padding: 12px 24px;
                border: none;
                border-radius: 6px;
                font-size: 16px;
                cursor: pointer;
                margin: 10px;
                text-decoration: none;
                display: inline-block;
              }
              .button:hover {
                background: #4a8a75;
              }
            </style>
          </head>
          <body>
            <div class="warning-container">
              <h1>ההזמנה נשלחה בהצלחה!</h1>
              <div class="order-number">מספר הזמנה: #${orderNumber}</div>
              <p>ההזמנה התקבלה במערכת!</p>
              <p>אם לא קיבלת מייל אישור, אנא פנו אלינו: paintz.yf@gmail.com</p>
              
              <a href="homepage.html" class="button">חזור לדף הבית</a>
            </div>
          </body>
        </html>
      `);
    }
    
    console.log('=== Success - Both emails sent ===');
    return HtmlService.createHtmlOutput(`
      <html>
        <head>
          <meta charset="UTF-8">
          <title>הזמנה נשלחה</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              direction: rtl;
              text-align: center;
              padding: 50px;
              background: #f9f1dc;
            }
            .success-container {
              background: white;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              max-width: 500px;
              margin: 0 auto;
            }
            h1 {
              color: #5B9B86;
              margin-bottom: 20px;
            }
            p {
              color: #5A3E36;
              font-size: 18px;
              line-height: 1.6;
            }
            .order-number {
              font-size: 24px;
              font-weight: bold;
              color: #5B9B86;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="success-container">
            <h1>ההזמנה נשלחה בהצלחה!</h1>
            <div class="order-number">מספר הזמנה: #${orderNumber}</div>
            <p>תודה על הזמנתך ${data.firstName || 'לקוח'}!<br>
            קיבלנו את פרטיך ואת פרטי המוצרים המעוצבים.<br>
            ניצור איתך קשר בהקדם לאישור ההזמנה ופרטי התשלום.</p>
            <p><strong>מייל אישור נשלח לכתובת: ${data.email}</strong></p>
          </div>
          <script>
            setTimeout(() => {
              window.close();
            }, 5000);
          </script>
        </body>
      </html>
    `);
    
  } catch (error) {
    console.error('=== Error in doPost ===');
    console.error('Error:', error);
    console.error('Error stack:', error.stack);
    
    return HtmlService.createHtmlOutput(`
      <html>
        <head>
          <meta charset="UTF-8">
          <title>שגיאה</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              direction: rtl;
              text-align: center;
              padding: 50px;
              background: #f9f1dc;
            }
            .error-container {
              background: #ffebee;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              max-width: 500px;
              margin: 0 auto;
              border: 2px solid #e57373;
            }
            h1 {
              color: #c62828;
              margin-bottom: 20px;
            }
            p {
              color: #5A3E36;
              font-size: 18px;
              line-height: 1.6;
            }
            .error-detail {
              background: #ffcdd2;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
              text-align: left;
              font-family: monospace;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="error-container">
            <h1>שגיאה בשליחת ההזמנה</h1>
            <p>מצטערים, אירעה שגיאה בעיבוד ההזמנה.</p>
            <div class="error-detail">${error.toString()}</div>
            <p>אנא נסה שוב מאוחר יותר או צור קשר: paintz.yf@gmail.com</p>
          </div>
          <script>
            setTimeout(() => {
              window.close();
            }, 10000);
          </script>
        </body>
      </html>
    `);
  }
}

function generateOrderNumber() {
  const now = new Date();
  const year = now.getFullYear().toString().substr(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  
  return `${year}${month}${day}${hours}${minutes}`;
}

function sendBusinessEmail(data) {
  console.log('=== sendBusinessEmail called ===');
  console.log('Parameter received:', data);
  console.log('Parameter type:', typeof data);
  console.log('Parameter is null?', data === null);
  console.log('Parameter is undefined?', data === undefined);
  
  // בדיקה שהנתונים קיימים
  if (!data) {
    console.error('❌ No data received in sendBusinessEmail');
    throw new Error('לא התקבלו נתונים לפונקציה sendBusinessEmail - data is null/undefined');
  }
  
  console.log('Full data object received:', JSON.stringify(data, null, 2));
  console.log('Cart data:', data.cart);
  console.log('Cart length:', data.cart ? data.cart.length : 'No cart');
  
  // בדיקת הרשאות Gmail
  try {
    console.log('Testing Gmail permissions...');
    const testThread = GmailApp.getInboxThreads(0, 1);
    console.log('✅ Gmail permissions OK - found', testThread.length, 'threads');
  } catch (gmailError) {
    console.error('❌ Gmail permissions error:', gmailError);
    throw new Error('בעיית הרשאות Gmail: ' + gmailError.toString());
  }
  
  // בדיקה שהנתונים קיימים
  if (!data) {
    console.error('No data received in sendBusinessEmail');
    throw new Error('לא התקבלו נתונים לפונקציה sendBusinessEmail');
  }
  
  // בדיקת שדות חיוניים
  const firstName = data.firstName || 'לא צוין';
  const lastName = data.lastName || 'לא צוין';
  const orderNumber = data.orderNumber || 'לא צוין';
  
  console.log('firstName:', firstName);
  console.log('lastName:', lastName);
  console.log('orderNumber:', orderNumber);
  
  const subject = `הזמנה חדשה #${orderNumber} | ${firstName} ${lastName}`;
  console.log('Email subject:', subject);
  
  let productsHtml = '';
  let attachments = [];
  
  if (data.cart && data.cart.length > 0) {
    console.log('Processing cart items:', data.cart.length);
    
    let totalPrice = 0;
    let hasCustomProducts = false;
    
    data.cart.forEach((item, index) => {
      console.log(`=== Processing business item ${index} ===`);
      console.log('Full item object:', JSON.stringify(item, null, 2));
      console.log('Item title:', item.title);
      console.log('Item subtitle:', item.subtitle);
      
      // בדיקת כל שדות התמונה האפשריים
      console.log('Image fields check:', {
        img: item.img,
        image: item.image,
        src: item.src,
        imgSrc: item.imgSrc,
        imageSrc: item.imageSrc,
        imageUrl: item.imageUrl,
        photo: item.photo,
        picture: item.picture
      });
      
      // בדיקת כל שדות הכמות האפשריים
      console.log('Quantity fields check:', {
        quantity: item.quantity,
        amount: item.amount,
        count: item.count,
        qty: item.qty,
        num: item.num,
        number: item.number,
        itemCount: item.itemCount,
        itemQuantity: item.itemQuantity
      });
      
      // בדיקת קבצים
      console.log('Files check:', {
        hasFiles: !!item.files,
        filesLength: item.files ? item.files.length : 0,
        files: item.files || 'No files'
      });
      
      if (item.files && item.files.length > 0) {
        item.files.forEach((file, fileIndex) => {
          console.log(`Business file ${fileIndex}:`, {
            name: file.name,
            type: file.type,
            size: file.size,
            hasContent: !!file.content,
            contentLength: file.content ? file.content.length : 0,
            contentPreview: file.content ? file.content.substring(0, 50) + '...' : 'No content'
          });
        });
      }
      
      // עיבוד צבעים - עם קצוות מעוגלים, קוד צבע והסבר
      let colorsHtml = '';
      if (item.colorData) {
        const colorEntries = [];
        if (item.colorData.color1) {
          colorEntries.push(`<div style="display: inline-block; width: 20px; height: 20px; background-color: ${item.colorData.color1.color}; border: 1px solid #ccc; border-radius: 3px; margin-left: 5px;"></div> <strong>מטקה 1:</strong> ${item.colorData.color1.color} - ${item.colorData.color1.text}`);
        }
        if (item.colorData.color2) {
          colorEntries.push(`<div style="display: inline-block; width: 20px; height: 20px; background-color: ${item.colorData.color2.color}; border: 1px solid #ccc; border-radius: 3px; margin-left: 5px;"></div> <strong>מטקה 2:</strong> ${item.colorData.color2.color} - ${item.colorData.color2.text}`);
        }
        if (item.colorData.bgOuter) {
          colorEntries.push(`<div style="display: inline-block; width: 20px; height: 20px; background-color: ${item.colorData.bgOuter.color}; border: 1px solid #ccc; border-radius: 3px; margin-left: 5px;"></div> <strong>רקע חיצוני:</strong> ${item.colorData.bgOuter.color} - ${item.colorData.bgOuter.text}`);
        }
        if (item.colorData.bgInnerRight) {
          colorEntries.push(`<div style="display: inline-block; width: 20px; height: 20px; background-color: ${item.colorData.bgInnerRight.color}; border: 1px solid #ccc; border-radius: 3px; margin-left: 5px;"></div> <strong>רקע פנימי ימין:</strong> ${item.colorData.bgInnerRight.color} - ${item.colorData.bgInnerRight.text}`);
        }
        if (item.colorData.bgInnerLeft) {
          colorEntries.push(`<div style="display: inline-block; width: 20px; height: 20px; background-color: ${item.colorData.bgInnerLeft.color}; border: 1px solid #ccc; border-radius: 3px; margin-left: 5px;"></div> <strong>רקע פנימי שמאל:</strong> ${item.colorData.bgInnerLeft.color} - ${item.colorData.bgInnerLeft.text}`);
        }
        if (item.colorData.triangle1) {
          colorEntries.push(`<div style="display: inline-block; width: 20px; height: 20px; background-color: ${item.colorData.triangle1.color}; border: 1px solid #ccc; border-radius: 3px; margin-left: 5px;"></div> <strong>משולש 1:</strong> ${item.colorData.triangle1.color} - ${item.colorData.triangle1.text}`);
        }
        if (item.colorData.triangle2) {
          colorEntries.push(`<div style="display: inline-block; width: 20px; height: 20px; background-color: ${item.colorData.triangle2.color}; border: 1px solid #ccc; border-radius: 3px; margin-left: 5px;"></div> <strong>משולש 2:</strong> ${item.colorData.triangle2.color} - ${item.colorData.triangle2.text}`);
        }
        colorsHtml = colorEntries.join('<br>');
      } else if (item.colors) {
        // פורמט ישן עם colors
        colorsHtml = Object.entries(item.colors).map(([key, value]) => {
          const colorValue = value.match(/#[0-9A-Fa-f]{6}/);
          if (colorValue) {
            return `<div style="display: inline-block; width: 20px; height: 20px; background-color: ${colorValue[0]}; border: 1px solid #ccc; border-radius: 3px; margin-left: 5px;"></div> <strong>${key}:</strong> ${value}`;
          }
          return `<strong>${key}:</strong> ${value}`;
        }).join('<br>');
      }
      
      // עיבוד הסברים - עם כותרת בולד
      let explanationsHtml = '';
      if (item.desc) {
        if (typeof item.desc === 'string') {
          // טיפול מיוחד בתקליט - לא מציגים הסבר אם זה string
          if (item.title && (item.title.includes('תקליט') || item.title.includes('Record'))) {
            explanationsHtml = '';
          } else {
            explanationsHtml = `<strong>הסבר:</strong> ${item.desc}`;
          }
        } else {
          // פורמט אובייקט - עם כותרת בולד
          const descEntries = [];
          
          // טיפול מיוחד בתקליט - רק הסבר אחד עם כותרת
          if (item.title && (item.title.includes('תקליט') || item.title.includes('Record'))) {
            // למצוא את ההסבר הראשון שיש ולהציג רק פעם אחת
            if (item.desc.right) {
              descEntries.push(`<strong>הסבר:</strong> ${item.desc.right}`);
            } else if (item.desc.left) {
              descEntries.push(`<strong>הסבר:</strong> ${item.desc.left}`);
            } else if (item.desc.desc1) {
              descEntries.push(`<strong>הסבר:</strong> ${item.desc.desc1}`);
            } else if (item.desc.desc2) {
              descEntries.push(`<strong>הסבר:</strong> ${item.desc.desc2}`);
    }
  } else {
            // מוצרים אחרים - הצגה רגילה
            if (item.desc.right) descEntries.push(`<strong>הסבר ציור ימין:</strong> ${item.desc.right}`);
            if (item.desc.left) descEntries.push(`<strong>הסבר ציור שמאל:</strong> ${item.desc.left}`);
            if (item.desc.desc1) descEntries.push(`<strong>הסבר מטקה 1:</strong> ${item.desc.desc1}`);
            if (item.desc.desc2) descEntries.push(`<strong>הסבר מטקה 2:</strong> ${item.desc.desc2}`);
          }
          explanationsHtml = descEntries.join('<br>');
        }
      } else if (item.explanations) {
        explanationsHtml = Object.entries(item.explanations).map(([key, value]) => `<strong>${key}:</strong> ${value}`).join('<br>');
      }
      
      // עיבוד קבצים - בדיקה מפורטת ושיפור הטיפול בקבצים
      let filesHtml = '';
      const itemFiles = item.files || item.attachments || item.uploads || item.file || [];
      
      // בדיקה אם itemFiles הוא מערך
      const filesArray = Array.isArray(itemFiles) ? itemFiles : (itemFiles ? [itemFiles] : []);
      
      console.log(`Business item ${index} - Files found:`, filesArray.length);
      console.log(`Business item ${index} - Files data:`, JSON.stringify(filesArray, null, 2));
      
      // בדיקה נוספת - אולי הקבצים נמצאים במקום אחר
      if (filesArray.length === 0) {
        console.log(`Business item ${index} - Checking alternative file locations:`);
        console.log(`item.file:`, item.file);
        console.log(`item.files:`, item.files);
        console.log(`item.attachments:`, item.attachments);
        console.log(`item.uploads:`, item.uploads);
        console.log(`item.uploadedFiles:`, item.uploadedFiles);
        console.log(`item.uploadedFiles:`, item.uploadedFiles);
      }
      
      if (filesArray && filesArray.length > 0) {
        const fileNames = [];
        const largeFileNames = [];
        
        filesArray.forEach((file, fileIndex) => {
          console.log(`Processing business file ${fileIndex}:`, {
            name: file.name,
            fileName: file.fileName,
            type: file.type,
            mimeType: file.mimeType,
            size: file.size,
            hasContent: !!file.content,
            hasData: !!file.data,
            hasFileContent: !!file.fileContent,
            hasBase64: !!file.base64,
            contentLength: file.content ? file.content.length : 0,
            dataLength: file.data ? file.data.length : 0,
            fileContentLength: file.fileContent ? file.fileContent.length : 0,
            base64Length: file.base64 ? file.base64.length : 0,
            dataType: typeof file.data,
            dataKeys: file.data ? Object.keys(file.data) : [],
            fileKeys: Object.keys(file),
            isLargeFile: file.isLargeFile
          });
          
          const fileName = file.name || file.fileName || `קובץ ${fileIndex + 1}`;
          
          // כל הקבצים יישלחו במייל הרגיל
          fileNames.push(fileName);
          
          // הוספת קובץ מצורף - כל הקבצים
          const fileContent = file.content || file.data || file.fileContent || file.base64 || 
                             (file.data && file.data.content) || (file.data && file.data.data) ||
                             (file.file && file.file.content) || (file.file && file.file.data);
          if (fileContent && typeof fileContent === 'string' && fileContent.length > 0) {
            try {
              console.log(`Creating business attachment: ${fileName}, type: ${file.type || file.mimeType}, size: ${fileContent.length} chars`);
              
              // קביעת סוג הקובץ
              let fileType = file.type || file.mimeType || 'application/octet-stream';
              
              // זיהוי סוג קובץ לפי סיומת
              const extension = fileName.toLowerCase().split('.').pop();
              if (extension === 'pdf') {
                fileType = 'application/pdf';
              } else if (['jpg', 'jpeg'].includes(extension)) {
                fileType = 'image/jpeg';
              } else if (extension === 'png') {
                fileType = 'image/png';
              } else if (extension === 'gif') {
                fileType = 'image/gif';
              } else if (extension === 'txt') {
                fileType = 'text/plain';
              } else if (['doc', 'docx'].includes(extension)) {
                fileType = 'application/msword';
              }
              
              // ניסיון לפענח base64
              try {
                // הסרת prefix אם קיים (data:image/jpeg;base64,)
                let cleanContent = fileContent;
                if (fileContent.includes(',')) {
                  cleanContent = fileContent.split(',')[1];
                }
                
                const decodedContent = Utilities.base64Decode(cleanContent);
                const blob = Utilities.newBlob(decodedContent, fileType, fileName);
                attachments.push(blob);
                console.log(`✅ Added business file attachment: ${fileName} (type: ${fileType}, size: ${decodedContent.length} bytes)`);
              } catch (decodeError) {
                console.error(`❌ Error decoding base64 for business file ${fileName}:`, decodeError);
                console.error(`File content preview (first 100 chars):`, fileContent.substring(0, 100));
                
                // נסיון עם תוכן גולמי כ-text
                try {
                  const blob = Utilities.newBlob(fileContent, 'text/plain', fileName + '.txt');
                  attachments.push(blob);
                  console.log(`✅ Added business file attachment as text: ${fileName}.txt`);
                } catch (rawError) {
                  console.error(`❌ Error creating text blob for business file ${fileName}:`, rawError);
                }
              }
            } catch (blobError) {
              console.error(`❌ Error creating blob for business file ${fileName}:`, blobError);
              console.error('File content preview:', fileContent ? fileContent.substring(0, 100) : 'No content');
            }
  } else {
            console.log(`⚠️ Business file ${fileName} has no valid content, skipping attachment`);
            console.log(`File content type: ${typeof fileContent}, length: ${fileContent ? fileContent.length : 0}`);
          }
        });
        
        // יצירת HTML לקבצים - כל הקבצים מצורפים
        let filesList = [...fileNames];
        
        if (filesList.length > 0) {
          filesHtml = `<strong>קובץ:</strong> ${filesList.join(', ')}`;
        }
        
        console.log(`Business item ${index} - Final files HTML: ${filesHtml}`);
        console.log(`Business item ${index} - Small files: ${fileNames.length}, Large files: ${largeFileNames.length}`);
  } else {
        console.log(`Business item ${index} - No files found`);
      }
      
      // עיבוד הערות - דגמים
      let notesHtml = '';
      if (item.notes && item.notes.trim() !== 'הערה לבדיקה') {
        if (item.title && item.title.toLowerCase().includes('קנבס')) {
          notesHtml = `<strong>גודל:</strong> ${item.notes}`;
        } else if (item.title && (item.title.includes('תקליט') || item.title.includes('Record'))) {
          notesHtml = '';
        } else if (item.price && item.price > 0) {
          notesHtml = `<strong>הערות:</strong> ${item.notes}`;
        } else if (!item.title.includes('עיצוב אישי') && !item.subtitle.includes('עיצוב אישי')) {
          // מוצרי דגמים - הצגת הערות עם כותרת
          notesHtml = `<strong>הערות:</strong> ${item.notes}`;
        } else if (item.title && (item.title.includes('תקליט') || item.title.includes('Record'))) {
          // תקליט עיצוב אישי - לא מציגים הערות
          notesHtml = '';
  } else {
          notesHtml = item.notes;
        }
      }
      
      // כמות המוצר - בדיקה מפורטת של כל האפשרויות
      const quantity = item.quantity || item.amount || item.count || item.qty || 
                      item.num || item.number || item.itemCount || item.itemQuantity || 1;
      console.log(`Business email - Final quantity for item ${index}: ${quantity}`);
      
      // מחיר - הצגת המחיר הסופי מהאתר כולל כמות
      let priceHtml = '';
      console.log(`Business email - Item price data:`, {
        price: item.price,
        originalPrice: item.originalPrice,
        cost: item.cost,
        websitePrice: item.websitePrice,
        cartPrice: item.cartPrice,
        listPrice: item.listPrice,
        itemPrice: item.itemPrice,
        productPrice: item.productPrice,
        quantity: quantity,
        title: item.title,
        subtitle: item.subtitle,
        isCustomDesign: item.title.includes('עיצוב אישי') || item.subtitle.includes('עיצוב אישי')
      });
      
      // בדיקה מפורטת של כל השדות האפשריים למחיר
      console.log(`Business email - All possible price fields for item ${index}:`, {
        'item.price': item.price,
        'item.originalPrice': item.originalPrice,
        'item.cost': item.cost,
        'item.websitePrice': item.websitePrice,
        'item.cartPrice': item.cartPrice,
        'item.listPrice': item.listPrice,
        'item.itemPrice': item.itemPrice,
        'item.productPrice': item.productPrice,
        'item.value': item.value,
        'item.amount': item.amount,
        'item.total': item.total,
        'item.priceValue': item.priceValue,
        'item.priceAmount': item.priceAmount
      });
      
      if (item.price && item.price > 0 && !isNaN(item.price)) {
        const displayPrice = Number(item.price); // המחיר הנכון מהאתר
        const totalItemPrice = displayPrice * quantity; // מחיר כולל כמות
        totalPrice += totalItemPrice;
        priceHtml = `מחיר: <strong>₪${totalItemPrice}</strong>`;
      } else if (!item.title.includes('עיצוב אישי') && !item.subtitle.includes('עיצוב אישי')) {
        // מוצרי דגמים - השתמש במחיר מהאתר או מהסל
        let itemPrice = 0;
        
        // בדיקה של המחיר כמו בסל קניות הגדול
        if (item.price) {
          const priceNumber = parseFloat(item.price.toString().replace('₪', '').replace(',', ''));
          if (!isNaN(priceNumber)) {
            itemPrice = priceNumber;
          }
        }
        
        if (itemPrice > 0) {
          const totalItemPrice = itemPrice * quantity;
          totalPrice += totalItemPrice;
          priceHtml = `מחיר: <strong>₪${totalItemPrice}</strong>`;
        } else {
          // אם אין מחיר, לא מציגים מחיר
          priceHtml = '';
        }
      } else {
        hasCustomProducts = true;
        priceHtml = `מחיר: <strong>הצעת מחיר תשלח בהמשך</strong>`;
      }
      
      // בניית HTML למוצר עם כמות וכל הפרטים
      // עיבוד תמונה - שיפור הטיפול בתמונות עם הסתרה אוטומטית
      let imageUrl = item.img || item.image || item.src || item.imgSrc || 
                    item.imageSrc || item.imageUrl || item.photo || item.picture || item.mainImage;
      
      console.log(`Business email - Original image URL for item ${index}: ${imageUrl}`);
      
      // שימוש בפונקציה החדשה לבדיקת תמונות דגמים
      imageUrl = validateModelImageUrl(imageUrl);
      
      // בדיקה אם התמונה תקינה למייל
      let isValidImageUrl = imageUrl && (imageUrl.startsWith('data:image') || imageUrl.startsWith('http'));
      console.log(`Business email - Is valid image URL for item ${index}: ${isValidImageUrl}`);
      
      if (!isValidImageUrl) {
        console.log(`Business email - No valid image URL found, hiding image`);
        imageUrl = null;
        isValidImageUrl = false;
      } else {
        console.log(`Business email - Image URL is valid for email: ${imageUrl}`);
      }
    
      productsHtml += `
        <div style="background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 15px 0; display: flex; align-items: flex-start; direction: rtl;">
          ${isValidImageUrl && imageUrl ? `
            <div style="flex-shrink: 0; margin-left: 20px;">
              <img src="${imageUrl}" style="width: 120px; height: 120px; border-radius: 8px; border: 1px solid #ddd; object-fit: cover;" alt="תמונת מוצר" onerror="this.style.display='none'; this.parentElement.style.display='none'; console.log('Image failed to load, hiding container:', '${imageUrl}');">
            </div>
          ` : ''}
          <div style="flex: 1;">
            <div style="margin-bottom: 15px;">
              <span style="color: #20B2AA; font-size: 18px; font-weight: bold; margin-left: 10px;">${quantity}</span>
              <h3 style="color: #8B4513; margin: 0; font-size: 18px; display: inline;">${item.title || 'עיצוב אישי'} ${item.subtitle ? `| ${item.subtitle}` : ''}</h3>
            </div>
            <div style="font-size: 15px; line-height: 1.6;">
              ${notesHtml && !item.title.includes('תקליט') ? `${notesHtml}<br>` : ''}
              ${colorsHtml ? `${colorsHtml}<br>` : ''}
              ${explanationsHtml ? `${explanationsHtml}<br>` : ''}
              ${filesHtml ? `${filesHtml}<br>` : ''}
              ${priceHtml ? `<div style="margin-top: 10px; font-size: 16px; font-weight: bold; color: #f57c00;">${priceHtml}</div>` : ''}
            </div>
          </div>
        </div>
      `;
    });
    
    // הוספת סיכום מחיר - עיצוב חדש
    if (totalPrice > 0 || hasCustomProducts) {
      productsHtml += `
        <div style="border-top: 3px solid #8B4513; margin: 20px 0; padding-top: 15px;">
          ${totalPrice > 0 ? `<p style="margin: 0 0 15px 0; font-size: 20px; color: #8B4513; text-align: right; font-weight: bold;">סה"כ: ${totalPrice} ש"ח</p>` : ''}
          ${hasCustomProducts ? `
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 10px; padding: 15px; margin: 10px 0; text-align: center;">
              <p style="color: #8B4513; margin: 0; font-weight: bold;">חלק מהמוצרים דורשים הצעת מחיר אישית</p>
            </div>
          ` : ''}
        </div>
      `;
    }
    
  } else {
    console.log('No cart items found');
    productsHtml = `
      <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 15px 0; text-align: center;">
        <p style="color: #856404; margin: 0;"><strong>לא נמצאו מוצרים בהזמנה</strong></p>
      </div>
    `;
  }

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; max-width: 800px; margin: 0 auto;">
      <div style="background: #5B9B86; color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">הזמנה חדשה מאתר Paintz</h1>
        <h2 style="margin: 10px 0 0 0; font-size: 24px;">מספר הזמנה: #${orderNumber}</h2>
      </div>
      
      <div style="background: #fff; border: 1px solid #ddd; border-radius: 0 0 10px 10px; padding: 30px;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #5B9B86; margin: 0 0 15px 0; font-size: 18px;">פרטי הזמנה:</h3>
          <p style="margin: 4px 0; font-size: 18px;"><strong>שם:</strong> ${firstName} ${lastName}</p>
          <p style="margin: 4px 0; font-size: 18px;"><strong>אימייל:</strong> ${data.email || 'לא צוין'}</p>
          <p style="margin: 4px 0; font-size: 18px;"><strong>טלפון:</strong> ${data.phone || 'לא צוין'}</p>
          ${data.company ? `<p style="margin: 4px 0; font-size: 18px;"><strong>חברה:</strong> ${data.company}</p>` : ''}
          <p style="margin: 4px 0; font-size: 18px;"><strong>אופן מסירה:</strong> ${data.deliveryMethod === 'pickup' ? 'איסוף עצמי' : 'משלוח'}</p>
        </div>
        
        ${data.deliveryMethod !== 'pickup' && (data.city || data.street) ? `
         <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
           <h3 style="color: #5B9B86; margin: 0 0 15px 0; font-size: 18px;">פרטי משלוח:</h3>
            <p style="margin: 4px 0; font-size: 18px;"><strong>מדינה:</strong> ${data.country === 'israel' || data.country === 'Israel' || data.country === 'ISRAEL' ? 'ישראל' : (data.country || 'ישראל')}</p>
            <p style="margin: 4px 0; font-size: 18px;"><strong>יישוב:</strong> ${data.city || 'לא צוין'}</p>
            <p style="margin: 4px 0; font-size: 18px;"><strong>רחוב:</strong> ${data.street || 'לא צוין'}</p>
            <p style="margin: 4px 0; font-size: 18px;"><strong>מספר בית:</strong> ${data.houseNumber || 'לא צוין'}</p>
            <p style="margin: 4px 0; font-size: 18px;"><strong>מיקוד:</strong> ${data.zipCode || 'לא צוין'}</p>
         </div>
         ` : ''}
        
        ${data.notes && data.notes.trim() !== 'הערה לבדיקה' ? `
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #5B9B86; margin: 0 0 15px 0; font-size: 18px;">הערות:</h3>
            <p style="margin: 0; font-size: 18px; line-height: 1.4;">${data.notes}</p>
          </div>
        ` : ''}
        
        <h3 style="background: #8B4513; color: white; padding: 15px; margin: 20px 0; border-radius: 8px; text-align: center; font-size: 20px;">סיכום הזמנה</h3>
        
        ${productsHtml}
        
        <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f0f8ff; border-radius: 8px;">
          <p style="margin: 0 0 10px 0; font-size: 16px; color: #666;">
            <strong>צוות Paintz</strong>
          </p>
          <p style="margin: 0; font-size: 14px; color: #666;">
          <strong>מייל:</strong> paintz.yf@gmail.com<br>
          <strong>אינסטגרם:</strong> @paintz.official<br>
          <strong>מיקום:</strong> פתח תקווה
          </p>
        </div>
      </div>
    </div>
  `;
  
  const emailOptions = {
    htmlBody: htmlBody,
    name: 'מערכת הזמנות Paintz'
  };
  
  if (attachments.length > 0) {
    emailOptions.attachments = attachments;
    console.log(`Added ${attachments.length} attachments to business email`);
    attachments.forEach((attachment, index) => {
      console.log(`Attachment ${index + 1}: ${attachment.getName()}, type: ${attachment.getContentType()}, size: ${attachment.getBytes().length} bytes`);
    });
  } else {
    console.log('⚠️ No attachments found for business email');
  }
  
  console.log('Sending business email to: paintz.yf@gmail.com');
  console.log('Email options:', JSON.stringify(emailOptions, null, 2));
  try {
    const result = GmailApp.sendEmail(
      'paintz.yf@gmail.com',
      subject,
      '',
      emailOptions
    );
    console.log('✅ Business email sent successfully');
    console.log('Email result:', result);
    
    // כל הקבצים נשלחים במייל הרגיל - אין צורך במייל נפרד
    console.log('All files sent in regular email - no separate large files email needed');
  } catch (sendError) {
    console.error('❌ Error sending business email:', sendError);
    console.error('Error details:', {
      message: sendError.message,
      stack: sendError.stack,
      name: sendError.name
    });
    throw sendError;
  }
}

function sendCustomerEmail(data) {
  console.log('=== sendCustomerEmail called ===');
  console.log('Parameter received:', data);
  console.log('Parameter type:', typeof data);
  console.log('Parameter is null?', data === null);
  console.log('Parameter is undefined?', data === undefined);
  
  // בדיקה שהנתונים קיימים
  if (!data) {
    console.error('❌ No data received in sendCustomerEmail');
    throw new Error('לא התקבלו נתונים לפונקציה sendCustomerEmail - data is null/undefined');
  }
  
  console.log('Full customer data object received:', JSON.stringify(data, null, 2));
  console.log('Customer cart data:', data.cart);
  console.log('Customer cart length:', data.cart ? data.cart.length : 'No cart');
  
  // בדיקת הרשאות Gmail
  try {
    console.log('Testing Gmail permissions for customer email...');
    const testThread = GmailApp.getInboxThreads(0, 1);
    console.log('✅ Gmail permissions OK for customer email - found', testThread.length, 'threads');
  } catch (gmailError) {
    console.error('❌ Gmail permissions error for customer email:', gmailError);
    throw new Error('בעיית הרשאות Gmail למייל לקוח: ' + gmailError.toString());
  }
  
  // בדיקה שהנתונים קיימים
  if (!data) {
    console.error('No data received in sendCustomerEmail');
    throw new Error('לא התקבלו נתונים לפונקציה sendCustomerEmail');
  }
  
  // בדיקת שדות חיוניים
  const firstName = data.firstName || 'לא צוין';
  const lastName = data.lastName || 'לא צוין';
  const orderNumber = data.orderNumber || 'לא צוין';
  const email = data.email;
  
  console.log('firstName:', firstName);
  console.log('lastName:', lastName);
  console.log('orderNumber:', orderNumber);
  console.log('email:', email);
  
  if (!email) {
    console.error('No email address provided for customer');
    throw new Error('כתובת אימייל של הלקוח חסרה');
  }
  
  const subject = `אישור הזמנה #${orderNumber} | Paintz`;
  console.log('Customer email subject:', subject);
  
  let productsHtml = '';
  let attachments = [];
  
  if (data.cart && data.cart.length > 0) {
    console.log('Processing cart items for customer email:', data.cart.length);
    
    let totalPrice = 0;
    let hasCustomProducts = false;
    
    data.cart.forEach((item, index) => {
      console.log(`=== Processing customer item ${index} ===`);
      console.log('Full customer item object:', JSON.stringify(item, null, 2));
      console.log('Customer item title:', item.title);
      console.log('Customer item subtitle:', item.subtitle);
      
      // בדיקת כל שדות התמונה האפשריים
      console.log('Customer image fields check:', {
        img: item.img,
        image: item.image,
        src: item.src,
        imgSrc: item.imgSrc,
        imageSrc: item.imageSrc,
        imageUrl: item.imageUrl,
        photo: item.photo,
        picture: item.picture
      });
      
      // בדיקת כל שדות הכמות האפשריים
      console.log('Customer quantity fields check:', {
        quantity: item.quantity,
        amount: item.amount,
        count: item.count,
        qty: item.qty,
        num: item.num,
        number: item.number,
        itemCount: item.itemCount,
        itemQuantity: item.itemQuantity
      });
      
      // בדיקת קבצים
      console.log('Customer files check:', {
        hasFiles: !!item.files,
        filesLength: item.files ? item.files.length : 0,
        files: item.files || 'No files'
      });
      
      if (item.files && item.files.length > 0) {
        item.files.forEach((file, fileIndex) => {
          console.log(`Customer file ${fileIndex}:`, {
            name: file.name,
            type: file.type,
            size: file.size,
            hasContent: !!file.content,
            contentLength: file.content ? file.content.length : 0,
            contentPreview: file.content ? file.content.substring(0, 50) + '...' : 'No content'
          });
        });
      }
      
      // עיבוד צבעים - עם קצוות מעוגלים, קוד צבע והסבר
      let colorsHtml = '';
      if (item.colorData) {
        const colorEntries = [];
        if (item.colorData.color1) {
          colorEntries.push(`<div style="display: inline-block; width: 20px; height: 20px; background-color: ${item.colorData.color1.color}; border: 1px solid #ccc; border-radius: 3px; margin-left: 5px;"></div> <strong>מטקה 1:</strong> ${item.colorData.color1.color} - ${item.colorData.color1.text}`);
        }
        if (item.colorData.color2) {
          colorEntries.push(`<div style="display: inline-block; width: 20px; height: 20px; background-color: ${item.colorData.color2.color}; border: 1px solid #ccc; border-radius: 3px; margin-left: 5px;"></div> <strong>מטקה 2:</strong> ${item.colorData.color2.color} - ${item.colorData.color2.text}`);
        }
        if (item.colorData.bgOuter) {
          colorEntries.push(`<div style="display: inline-block; width: 20px; height: 20px; background-color: ${item.colorData.bgOuter.color}; border: 1px solid #ccc; border-radius: 3px; margin-left: 5px;"></div> <strong>רקע חיצוני:</strong> ${item.colorData.bgOuter.color} - ${item.colorData.bgOuter.text}`);
        }
        if (item.colorData.bgInnerRight) {
          colorEntries.push(`<div style="display: inline-block; width: 20px; height: 20px; background-color: ${item.colorData.bgInnerRight.color}; border: 1px solid #ccc; border-radius: 3px; margin-left: 5px;"></div> <strong>רקע פנימי ימין:</strong> ${item.colorData.bgInnerRight.color} - ${item.colorData.bgInnerRight.text}`);
        }
        if (item.colorData.bgInnerLeft) {
          colorEntries.push(`<div style="display: inline-block; width: 20px; height: 20px; background-color: ${item.colorData.bgInnerLeft.color}; border: 1px solid #ccc; border-radius: 3px; margin-left: 5px;"></div> <strong>רקע פנימי שמאל:</strong> ${item.colorData.bgInnerLeft.color} - ${item.colorData.bgInnerLeft.text}`);
        }
        if (item.colorData.triangle1) {
          colorEntries.push(`<div style="display: inline-block; width: 20px; height: 20px; background-color: ${item.colorData.triangle1.color}; border: 1px solid #ccc; border-radius: 3px; margin-left: 5px;"></div> <strong>משולש 1:</strong> ${item.colorData.triangle1.color} - ${item.colorData.triangle1.text}`);
        }
        if (item.colorData.triangle2) {
          colorEntries.push(`<div style="display: inline-block; width: 20px; height: 20px; background-color: ${item.colorData.triangle2.color}; border: 1px solid #ccc; border-radius: 3px; margin-left: 5px;"></div> <strong>משולש 2:</strong> ${item.colorData.triangle2.color} - ${item.colorData.triangle2.text}`);
        }
        colorsHtml = colorEntries.join('<br>');
      } else if (item.colors) {
        // פורמט ישן עם colors
        colorsHtml = Object.entries(item.colors).map(([key, value]) => {
          const colorValue = value.match(/#[0-9A-Fa-f]{6}/);
          if (colorValue) {
            return `<div style="display: inline-block; width: 20px; height: 20px; background-color: ${colorValue[0]}; border: 1px solid #ccc; border-radius: 3px; margin-left: 5px;"></div> <strong>${key}:</strong> ${value}`;
          }
          return `<strong>${key}:</strong> ${value}`;
        }).join('<br>');
      }
      
      // עיבוד הסברים - עם כותרת בולד
      let explanationsHtml = '';
      if (item.desc) {
        if (typeof item.desc === 'string') {
          // טיפול מיוחד בתקליט - לא מציגים הסבר אם זה string
          if (item.title && (item.title.includes('תקליט') || item.title.includes('Record'))) {
            explanationsHtml = '';
      } else {
            explanationsHtml = `<strong>הסבר:</strong> ${item.desc}`;
          }
        } else {
          // פורמט אובייקט - עם כותרת בולד
          const descEntries = [];
          
          // טיפול מיוחד בתקליט - רק הסבר אחד עם כותרת
          if (item.title && (item.title.includes('תקליט') || item.title.includes('Record'))) {
            // למצוא את ההסבר הראשון שיש ולהציג רק פעם אחת
            if (item.desc.right) {
              descEntries.push(`<strong>הסבר:</strong> ${item.desc.right}`);
            } else if (item.desc.left) {
              descEntries.push(`<strong>הסבר:</strong> ${item.desc.left}`);
            } else if (item.desc.desc1) {
              descEntries.push(`<strong>הסבר:</strong> ${item.desc.desc1}`);
            } else if (item.desc.desc2) {
              descEntries.push(`<strong>הסבר:</strong> ${item.desc.desc2}`);
            }
          } else {
            // מוצרים אחרים - הצגה רגילה
            if (item.desc.right) descEntries.push(`<strong>הסבר ציור ימין:</strong> ${item.desc.right}`);
            if (item.desc.left) descEntries.push(`<strong>הסבר ציור שמאל:</strong> ${item.desc.left}`);
            if (item.desc.desc1) descEntries.push(`<strong>הסבר מטקה 1:</strong> ${item.desc.desc1}`);
            if (item.desc.desc2) descEntries.push(`<strong>הסבר מטקה 2:</strong> ${item.desc.desc2}`);
          }
          explanationsHtml = descEntries.join('<br>');
        }
      } else if (item.explanations) {
        explanationsHtml = Object.entries(item.explanations).map(([key, value]) => `<strong>${key}:</strong> ${value}`).join('<br>');
      }
      
      // עיבוד קבצים - בדיקה מפורטת ושיפור הטיפול בקבצים
      let filesHtml = '';
      const customerFiles = item.files || item.attachments || item.uploads || item.file || [];
      
      // בדיקה אם customerFiles הוא מערך
      const filesArray = Array.isArray(customerFiles) ? customerFiles : (customerFiles ? [customerFiles] : []);
      
      console.log(`Customer item ${index} - Files found:`, filesArray.length);
      console.log(`Customer item ${index} - Files data:`, JSON.stringify(filesArray, null, 2));
      
      // בדיקה נוספת - אולי הקבצים נמצאים במקום אחר
      if (filesArray.length === 0) {
        console.log(`Customer item ${index} - Checking alternative file locations:`);
        console.log(`item.file:`, item.file);
        console.log(`item.files:`, item.files);
        console.log(`item.attachments:`, item.attachments);
        console.log(`item.uploads:`, item.uploads);
        console.log(`item.uploadedFiles:`, item.uploadedFiles);
      }
      
      if (filesArray && filesArray.length > 0) {
        const fileNames = [];
        const largeFileNames = [];
        
        filesArray.forEach((file, fileIndex) => {
          console.log(`Processing customer file ${fileIndex}:`, {
            name: file.name,
            fileName: file.fileName,
            type: file.type,
            mimeType: file.mimeType,
            size: file.size,
            hasContent: !!file.content,
            hasData: !!file.data,
            contentLength: file.content ? file.content.length : 0,
            dataLength: file.data ? file.data.length : 0,
            isLargeFile: file.isLargeFile
          });
          
          const fileName = file.name || file.fileName || `קובץ ${fileIndex + 1}`;
          
          // כל הקבצים יישלחו ללקוח במייל הרגיל
          fileNames.push(fileName);
          
          // הוספת קובץ מצורף - כל הקבצים יישלחו ללקוח (גם גדולים)
          const fileContent = file.content || file.data || file.fileContent || file.base64 || 
                             (file.data && file.data.content) || (file.data && file.data.data) ||
                             (file.file && file.file.content) || (file.file && file.file.data);
          if (fileContent && typeof fileContent === 'string' && fileContent.length > 0) {
            try {
              console.log(`Creating customer attachment: ${fileName}, type: ${file.type || file.mimeType}, size: ${fileContent.length} chars`);
              
              // קביעת סוג הקובץ
              let fileType = file.type || file.mimeType || 'application/octet-stream';
              
              // זיהוי סוג קובץ לפי סיומת
              const extension = fileName.toLowerCase().split('.').pop();
              if (extension === 'pdf') {
                fileType = 'application/pdf';
              } else if (['jpg', 'jpeg'].includes(extension)) {
                fileType = 'image/jpeg';
              } else if (extension === 'png') {
                fileType = 'image/png';
              } else if (extension === 'gif') {
                fileType = 'image/gif';
              } else if (extension === 'txt') {
                fileType = 'text/plain';
              } else if (['doc', 'docx'].includes(extension)) {
                fileType = 'application/msword';
              }
              
              // ניסיון לפענח base64
              try {
                // הסרת prefix אם קיים (data:image/jpeg;base64,)
                let cleanContent = fileContent;
                if (fileContent.includes(',')) {
                  cleanContent = fileContent.split(',')[1];
                }
                
                const decodedContent = Utilities.base64Decode(cleanContent);
                const blob = Utilities.newBlob(decodedContent, fileType, fileName);
                attachments.push(blob);
                                  console.log(`✅ Added customer file attachment: ${fileName} (type: ${fileType}, size: ${decodedContent.length} bytes)`);
              } catch (decodeError) {
                console.error(`❌ Error decoding base64 for customer file ${fileName}:`, decodeError);
                console.error(`File content preview (first 100 chars):`, fileContent.substring(0, 100));
                
                // נסיון עם תוכן גולמי כ-text
                try {
                  const blob = Utilities.newBlob(fileContent, 'text/plain', fileName + '.txt');
                  attachments.push(blob);
                  console.log(`✅ Added customer file attachment as text: ${fileName}.txt`);
                } catch (rawError) {
                  console.error(`❌ Error creating text blob for customer file ${fileName}:`, rawError);
                }
              }
            } catch (blobError) {
              console.error(`❌ Error creating blob for customer file ${fileName}:`, blobError);
              console.error('File content preview:', fileContent ? fileContent.substring(0, 100) : 'No content');
            }
          } else {
            console.log(`⚠️ Customer file ${fileName} has no valid content, skipping attachment`);
            console.log(`File content type: ${typeof fileContent}, length: ${fileContent ? fileContent.length : 0}`);
          }
        });
        
        // יצירת HTML לקבצים - כל הקבצים מצורפים
        let filesList = [...fileNames];
        
        if (filesList.length > 0) {
          filesHtml = `<strong>קובץ:</strong> ${filesList.join(', ')}`;
        }
        
        console.log(`Customer item ${index} - Final files HTML: ${filesHtml}`);
        console.log(`Customer item ${index} - Small files: ${fileNames.length}, Large files: ${largeFileNames.length}`);
      } else {
        console.log(`Customer item ${index} - No files found`);
      }
      
      // עיבוד הערות - דגמים
      let notesHtml = '';
      if (item.notes && item.notes.trim() !== 'הערה לבדיקה') {
        if (item.title && item.title.toLowerCase().includes('קנבס')) {
          notesHtml = `<strong>גודל:</strong> ${item.notes}`;
        } else if (item.title && (item.title.includes('תקליט') || item.title.includes('Record'))) {
          notesHtml = '';
        } else if (item.price && item.price > 0) {
          notesHtml = `<strong>הערות:</strong> ${item.notes}`;
        } else if (!item.title.includes('עיצוב אישי') && !item.subtitle.includes('עיצוב אישי')) {
          // מוצרי דגמים - הצגת הערות עם כותרת
          notesHtml = `<strong>הערות:</strong> ${item.notes}`;
        } else if (item.title && (item.title.includes('תקליט') || item.title.includes('Record'))) {
          // תקליט עיצוב אישי - לא מציגים הערות
          notesHtml = '';
        } else {
          notesHtml = item.notes;
        }
      }
      
      // כמות המוצר - בדיקה מפורטת של כל האפשרויות
      const quantity = item.quantity || item.amount || item.count || item.qty || 
                      item.num || item.number || item.itemCount || item.itemQuantity || 1;
      console.log(`Customer email - Final quantity for item ${index}: ${quantity}`);
      
      // מחיר - הצגת המחיר הסופי מהאתר כולל כמות (מייל ללקוח)
      let priceHtml = '';
      console.log(`Customer email - Item price data:`, {
        price: item.price,
        originalPrice: item.originalPrice,
        cost: item.cost,
        websitePrice: item.websitePrice,
        cartPrice: item.cartPrice,
        listPrice: item.listPrice,
        itemPrice: item.itemPrice,
        productPrice: item.productPrice,
        quantity: quantity,
        title: item.title,
        subtitle: item.subtitle,
        isCustomDesign: item.title.includes('עיצוב אישי') || item.subtitle.includes('עיצוב אישי')
      });
      
      // בדיקה מפורטת של כל השדות האפשריים למחיר
      console.log(`Customer email - All possible price fields for item ${index}:`, {
        'item.price': item.price,
        'item.originalPrice': item.originalPrice,
        'item.cost': item.cost,
        'item.websitePrice': item.websitePrice,
        'item.cartPrice': item.cartPrice,
        'item.listPrice': item.listPrice,
        'item.itemPrice': item.itemPrice,
        'item.productPrice': item.productPrice,
        'item.value': item.value,
        'item.amount': item.amount,
        'item.total': item.total,
        'item.priceValue': item.priceValue,
        'item.priceAmount': item.priceAmount
      });
      
      if (item.price && item.price > 0 && !isNaN(item.price)) {
        const displayPrice = Number(item.price); // המחיר הנכון מהאתר
        const totalItemPrice = displayPrice * quantity; // מחיר כולל כמות
        totalPrice += totalItemPrice;
        priceHtml = `מחיר: <strong>₪${totalItemPrice}</strong>`;
      } else if (!item.title.includes('עיצוב אישי') && !item.subtitle.includes('עיצוב אישי')) {
        // מוצרי דגמים - השתמש במחיר מהאתר או מהסל
        let itemPrice = 0;
        
        // בדיקה של המחיר כמו בסל קניות הגדול
        if (item.price) {
          const priceNumber = parseFloat(item.price.toString().replace('₪', '').replace(',', ''));
          if (!isNaN(priceNumber)) {
            itemPrice = priceNumber;
          }
        }
        
        if (itemPrice > 0) {
          const totalItemPrice = itemPrice * quantity;
          totalPrice += totalItemPrice;
          priceHtml = `מחיר: <strong>₪${totalItemPrice}</strong>`;
        } else {
          // אם אין מחיר, לא מציגים מחיר
          priceHtml = '';
        }
      } else {
        hasCustomProducts = true;
        priceHtml = `מחיר: <strong>הצעת מחיר תשלח בהמשך</strong>`;
      }
      
      // עיבוד תמונה - שיפור הטיפול בתמונות
      let customerImageUrl = item.img || item.image || item.src || item.imgSrc ||
                            item.imageSrc || item.imageUrl || item.photo || item.picture || item.mainImage;
      
      console.log(`Customer email - Original image URL for item ${index}: ${customerImageUrl}`);
      
      // שימוש בפונקציה החדשה לבדיקת תמונות דגמים
      customerImageUrl = validateModelImageUrl(customerImageUrl);
      
      // בדיקה אם התמונה תקינה למייל
      let isValidCustomerImageUrl = customerImageUrl && (customerImageUrl.startsWith('data:image') || customerImageUrl.startsWith('http'));
      console.log(`Customer email - Is valid image URL for item ${index}: ${isValidCustomerImageUrl}`);
      
      if (!isValidCustomerImageUrl) {
        console.log(`Customer email - No valid image URL found, hiding image`);
        customerImageUrl = null;
        isValidCustomerImageUrl = false;
      } else {
        console.log(`Customer email - Image URL is valid for email: ${customerImageUrl}`);
      }
      
      productsHtml += `
        <div style="background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 15px 0; display: flex; align-items: flex-start; direction: rtl;">
          ${isValidCustomerImageUrl && customerImageUrl ? `
            <div style="flex-shrink: 0; margin-left: 20px;">
              <img src="${customerImageUrl}" style="width: 120px; height: 120px; border-radius: 8px; border: 1px solid #ddd; object-fit: cover;" alt="תמונת מוצר" onerror="this.style.display='none'; this.parentElement.style.display='none'; console.log('Image failed to load, hiding container:', '${customerImageUrl}');">
            </div>
          ` : ''}
          <div style="flex: 1;">
            <div style="margin-bottom: 15px;">
              <span style="color: #20B2AA; font-size: 18px; font-weight: bold; margin-left: 10px;">${quantity}</span>
              <h3 style="color: #8B4513; margin: 0; font-size: 18px; display: inline;">${item.title || 'עיצוב אישי'} ${item.subtitle ? `| ${item.subtitle}` : ''}</h3>
            </div>
            <div style="font-size: 15px; line-height: 1.6;">
              ${notesHtml && !item.title.includes('תקליט') ? `${notesHtml}<br>` : ''}
              ${colorsHtml ? `${colorsHtml}<br>` : ''}
              ${explanationsHtml ? `${explanationsHtml}<br>` : ''}
              ${filesHtml ? `${filesHtml}<br>` : ''}
              ${priceHtml ? `<div style="margin-top: 10px; font-size: 16px; font-weight: bold; color: #f57c00;">${priceHtml}</div>` : ''}
            </div>
          </div>
        </div>
      `;
    });
    
    // הוספת סיכום מחיר - עיצוב חדש
    if (totalPrice > 0 || hasCustomProducts) {
      productsHtml += `
        <div style="border-top: 3px solid #8B4513; margin: 20px 0; padding-top: 15px;">
          ${totalPrice > 0 ? `<p style="margin: 0 0 15px 0; font-size: 20px; color: #8B4513; text-align: right; font-weight: bold;">סה"כ: ${totalPrice} ש"ח</p>` : ''}
          ${hasCustomProducts ? `
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 10px; padding: 15px; margin: 10px 0; text-align: center;">
              <p style="color: #8B4513; margin: 0; font-weight: bold;">חלק מהמוצרים דורשים הצעת מחיר אישית</p>
            </div>
          ` : ''}
        </div>
      `;
    }
    
  } else {
    console.log('No cart items found for customer email');
    productsHtml = `
      <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 15px 0; text-align: center;">
        <p style="color: #856404; margin: 0;"><strong>לא נמצאו מוצרים בהזמנה</strong></p>
      </div>
    `;
  }
  
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; max-width: 800px; margin: 0 auto;">
      <div style="background: #5B9B86; color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">אישור הזמנה מ-Paintz</h1>
        <h2 style="margin: 10px 0 0 0; font-size: 24px;">מספר הזמנה: #${orderNumber}</h2>
      </div>
      
      <div style="background: #fff; border: 1px solid #ddd; border-radius: 0 0 10px 10px; padding: 30px;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #5B9B86; margin: 0 0 15px 0; font-size: 18px;">שלום ${firstName} ${lastName},</h3>
          <p style="margin: 0; font-size: 16px; line-height: 1.6;">תודה על הזמנתך! אנו מאשרים שקיבלנו את הזמנתך ונעבוד על הכנתה בהקדם.</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #5B9B86; margin: 0 0 15px 0; font-size: 18px;">פרטי הזמנה:</h3>
          <p style="margin: 4px 0; font-size: 16px;"><strong>שם:</strong> ${firstName} ${lastName}</p>
          <p style="margin: 4px 0; font-size: 16px;"><strong>אימייל:</strong> ${data.email || 'לא צוין'}</p>
          <p style="margin: 4px 0; font-size: 16px;"><strong>טלפון:</strong> ${data.phone || 'לא צוין'}</p>
          ${data.company ? `<p style="margin: 4px 0; font-size: 16px;"><strong>חברה:</strong> ${data.company}</p>` : ''}
          <p style="margin: 4px 0; font-size: 16px;"><strong>אופן מסירה:</strong> ${data.deliveryMethod === 'pickup' ? 'איסוף עצמי' : 'משלוח'}</p>
        </div>
        
        ${data.deliveryMethod !== 'pickup' && (data.city || data.street) ? `
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #5B9B86; margin: 0 0 15px 0; font-size: 18px;">כתובת למשלוח:</h3>
            <p style="margin: 4px 0; font-size: 16px;"><strong>מדינה:</strong> ${data.country === 'israel' || data.country === 'Israel' || data.country === 'ISRAEL' ? 'ישראל' : (data.country || 'ישראל')}</p>
            <p style="margin: 4px 0; font-size: 16px;"><strong>יישוב:</strong> ${data.city || 'לא צוין'}</p>
            <p style="margin: 4px 0; font-size: 16px;"><strong>רחוב:</strong> ${data.street || 'לא צוין'}</p>
            <p style="margin: 4px 0; font-size: 16px;"><strong>מספר בית:</strong> ${data.houseNumber || 'לא צוין'}</p>
            <p style="margin: 4px 0; font-size: 16px;"><strong>מיקוד:</strong> ${data.zipCode || 'לא צוין'}</p>
        </div>
        ` : ''}
        
        ${data.notes && data.notes.trim() !== 'הערה לבדיקה' ? `
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #5B9B86; margin: 0 0 15px 0; font-size: 18px;">הערות נוספות:</h3>
            <p style="margin: 0; font-size: 16px; line-height: 1.4;">${data.notes}</p>
          </div>
        ` : ''}
        
        <h3 style="background: #8B4513; color: white; padding: 15px; margin: 20px 0; border-radius: 8px; text-align: center; font-size: 20px;">פרטי ההזמנה</h3>
        
        ${productsHtml}
        
        <div style="text-align: center; margin-top: 30px; padding: 20px; background: #e8f5e8; border-radius: 8px;">
          <p style="margin: 0 0 10px 0; font-size: 16px; color: #2e7d32;">
            <strong>אנו נצור איתך קשר בהקדם לאישור הפרטים ולתיאום המשך התהליך.</strong>
          </p>
          <p style="margin: 0; font-size: 14px; color: #666;">
            <strong>צוות Paintz</strong><br>
            <strong>מייל:</strong> paintz.yf@gmail.com<br>
            <strong>אינסטגרם:</strong> @paintz.official<br>
            <strong>מיקום:</strong> פתח תקווה
          </p>
        </div>
      </div>
    </div>
  `;
  
  const emailOptions = {
    htmlBody: htmlBody,
    name: 'Paintz - אישור הזמנה'
  };
  
  if (attachments.length > 0) {
    emailOptions.attachments = attachments;
    console.log(`Added ${attachments.length} attachments to customer email`);
    attachments.forEach((attachment, index) => {
      console.log(`Customer attachment ${index + 1}: ${attachment.getName()}, type: ${attachment.getContentType()}, size: ${attachment.getBytes().length} bytes`);
    });
  } else {
    console.log('⚠️ No attachments found for customer email');
  }
  
  console.log('Sending customer email to:', email);
  console.log('Customer email options:', JSON.stringify(emailOptions, null, 2));
  try {
    const result = GmailApp.sendEmail(
      email,
      subject,
      '',
      emailOptions
    );
    console.log('✅ Customer email sent successfully');
    console.log('Customer email result:', result);
  } catch (sendError) {
    console.error('❌ Error sending customer email:', sendError);
    console.error('Customer email error details:', {
      message: sendError.message,
      stack: sendError.stack,
      name: sendError.name
    });
    throw sendError;
  }
}

function testFormConfiguration() {
  console.log('=== testFormConfiguration called ===');
  
  // בדיקת ה-URL
  console.log('=== URL Configuration ===');
  try {
    const scriptUrl = ScriptApp.getService().getUrl();
    console.log('✅ Script URL:', scriptUrl);
    console.log('📝 COPY THIS URL TO YOUR FORM:');
    console.log('📝', scriptUrl);
    console.log('📝');
    
    // בדיקה אם זה URL נכון
    if (scriptUrl.includes('/exec')) {
      console.log('✅ URL format is correct (contains /exec)');
    } else {
      console.log('⚠️ URL format might be wrong - should contain /exec');
    }
    
    // בדיקת deployment
    const deployments = ScriptApp.getService().getDeployments();
    console.log('✅ Found', deployments.length, 'deployments');
    
    if (deployments.length === 0) {
      console.log('⚠️ No deployments found - you need to deploy the script');
      console.log('📝 Go to Deploy → New deployment → Web app');
      console.log('📝 Set Execute as: Me');
      console.log('📝 Set Who has access: Anyone');
    } else {
      deployments.forEach((deployment, index) => {
        console.log(`Deployment ${index + 1}:`, {
          description: deployment.getDescription(),
          version: deployment.getVersion(),
          type: deployment.getType()
        });
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking configuration:', error);
  }
  
  // הוראות לטופס
  console.log('=== Form Configuration Instructions ===');
  console.log('📝 Your form should:');
  console.log('1. Send POST requests to the script URL above');
  console.log('2. Send data in JSON format');
  console.log('3. Include a "data" field with the order information');
  console.log('4. Set Content-Type to application/json');
  console.log('5. Include all required fields: firstName, lastName, email, cart');
  console.log('');
  console.log('📝 Example form data structure:');
  console.log('{');
  console.log('  "data": JSON.stringify({');
  console.log('    "firstName": "יוסי",');
  console.log('    "lastName": "כהן",');
  console.log('    "email": "test@example.com",');
  console.log('    "cart": [...]');
  console.log('  })');
  console.log('}');
  
  return {
    scriptUrl: ScriptApp.getService().getUrl(),
    deployments: ScriptApp.getService().getDeployments().length,
    instructions: 'Check the logs above for configuration details'
  };
}

function checkDeployment() {
  console.log('=== checkDeployment called ===');
  
  try {
    // בדיקת deployment נוכחי
    const service = ScriptApp.getService();
    console.log('✅ Service is active');
    
    // בדיקת URL
    const scriptUrl = service.getUrl();
    console.log('✅ Script URL:', scriptUrl);
    
    // בדיקת deployments
    const deployments = service.getDeployments();
    console.log('✅ Found', deployments.length, 'deployments');
    
    if (deployments.length === 0) {
      console.log('❌ NO DEPLOYMENTS FOUND!');
      console.log('📝 You need to create a deployment:');
      console.log('📝 1. Click "Deploy" → "New deployment"');
      console.log('📝 2. Choose "Web app"');
      console.log('📝 3. Set "Execute as": Me');
      console.log('📝 4. Set "Who has access": Anyone');
      console.log('📝 5. Click "Deploy"');
      console.log('📝 6. Copy the new URL');
    } else {
      deployments.forEach((deployment, index) => {
        console.log(`Deployment ${index + 1}:`, {
          description: deployment.getDescription() || 'No description',
          version: deployment.getVersion(),
          type: deployment.getType(),
          isActive: deployment.isActive()
        });
      });
    }
    
    return {
      hasDeployments: deployments.length > 0,
      scriptUrl: scriptUrl,
      deploymentCount: deployments.length
    };
    
  } catch (error) {
    console.error('❌ Error checking deployment:', error);
    return {
      hasDeployments: false,
      error: error.toString()
    };
  }
}

function testEmailSending() {
  console.log('=== testEmailSending called ===');
  console.log('Testing basic Gmail functionality...');
  
  // בדיקת ה-URL הנוכחי
  console.log('=== URL Test ===');
  try {
    const scriptUrl = ScriptApp.getService().getUrl();
    console.log('✅ Current script URL:', scriptUrl);
    console.log('📝 Use this URL in your form configuration');
    console.log('📝 Make sure your form sends POST requests to this URL');
    console.log('📝 The form should send data in JSON format');
  } catch (urlError) {
    console.error('❌ Error getting script URL:', urlError);
  }
  
  // בדיקת deployment
  console.log('=== Deployment Test ===');
  try {
    const deployments = ScriptApp.getService().getDeployments();
    console.log('✅ Found', deployments.length, 'deployments');
    deployments.forEach((deployment, index) => {
      console.log(`Deployment ${index + 1}:`, deployment.getDescription());
    });
  } catch (deploymentError) {
    console.error('❌ Error getting deployments:', deploymentError);
  }
  
  try {
    // בדיקה בסיסית של Gmail
    const threads = GmailApp.getInboxThreads(0, 1);
    console.log('✅ Basic Gmail test passed - found', threads.length, 'threads');
    
    // בדיקת שליחת מייל פשוט
    const testResult = GmailApp.sendEmail(
      'paintz.yf@gmail.com',
      'בדיקת מערכת Paintz - ' + new Date().toISOString(),
      'זוהי בדיקה אוטומטית של מערכת המיילים',
      {name: 'מערכת בדיקה Paintz'}
    );
    console.log('✅ Test email sent successfully:', testResult);
    
  } catch (testError) {
    console.error('❌ Basic Gmail test failed:', testError);
    throw testError;
  }
  
  const testData = {
    firstName: 'יוסי',
    lastName: 'כהן',
    email: 'yardenfad@gmail.com', // כתובת המייל של הלקוח לבדיקה
    extraHtml: matkaImgHtml, // הוספת תמונה מוטמעת לבדיקה
    phone: '050-1234567',
    company: 'חברת בדיקה',
    country: 'ישראל',
    city: 'תל אביב',
    street: 'דיזנגוף',
    houseNumber: '123',
    zipCode: '12345',
    notes: 'אנא הכינו במיוחד יפה - זה מתנה מיוחדת!',
    cart: [
      {
        title: 'שש בש',
        subtitle: 'עיצוב אישי',
        quantity: 2,
        amount: 2,
        colorData: {
          bgOuter: { text: 'חום כהה', color: '#8B4513' },
          bgInnerRight: { text: 'חום בהיר', color: '#D2691E' },
          bgInnerLeft: { text: 'חום זהוב', color: '#F4A460' },
          triangle1: { text: 'שחור', color: '#000000' },
          triangle2: { text: 'לבן', color: '#FFFFFF' }
        },
        desc: {
          right: 'ציור של דרקון בצד ימין',
          left: 'כיתוב אישי בצד שמאל - "מתנה לדוד יוסי"'
        },
        notes: 'בקשה מיוחדת לחריטה עמוקה',
        img: 'https://via.placeholder.com/150x150/ff0000/ffffff?text=שש+בש',
        price: 0,
        files: [
          { name: 'dragon_design.jpg', type: 'image/jpeg', size: 1024, content: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' },
          { name: 'personal_text.pdf', type: 'application/pdf', size: 2048, content: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' }
        ]
      },
      {
        title: 'מטקה',
        subtitle: 'עיצוב אישי',
        quantity: 4,
        colorData: {
          color1: { text: 'אדום בוהק', color: '#FF0000' },
          color2: { text: 'כחול רויאל', color: '#0000FF' },
          desc1: 'ציור של לב עם השם יוני',
          desc2: 'כיתוב "חופש" בגופן מעוצב'
        },
        notes: 'מטקות לכל המשפחה - עמידות במים',
        img: 'https://via.placeholder.com/150x150/00ff00/ffffff?text=מטקה',
        price: 0,
        files: [
          { name: 'heart_design.jpg', type: 'image/jpeg', size: 3072, content: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' }
        ]
      },
      {
        title: 'שש בש',
        subtitle: 'דגם קלאסי',
        quantity: 1,
        notes: 'דגם קלאסי עם עץ אגוז מובחר',
        img: 'https://via.placeholder.com/150x150/8B4513/ffffff?text=שש+בש+קלאסי',
        price: 250
      }
    ],
    deliveryMethod: 'delivery',
    timestamp: new Date().toISOString(),
    orderNumber: generateOrderNumber()
  };
  
  console.log('=== Test data prepared ===');
  console.log('Order number:', testData.orderNumber);
  console.log('Customer email:', testData.email);
  console.log('Cart items:', testData.cart.length);
  console.log('Delivery method:', testData.deliveryMethod);
  
  try {
    console.log('=== Starting email sending test ===');
    
    console.log('Sending business email...');
    sendBusinessEmail(testData);
    console.log('✅ Business email sent successfully');
    
    console.log('Sending customer email...');
    sendCustomerEmail(testData);
    console.log('✅ Customer email sent successfully');
    
    console.log('=== Test completed successfully ===');
    console.log('Both emails sent successfully!');
    console.log('Business email sent to: paintz.yf@gmail.com');
    console.log('Customer email sent to:', testData.email);
    console.log('Order number:', testData.orderNumber);
    
    return {
      success: true,
      orderNumber: testData.orderNumber,
      message: 'שני המיילים נשלחו בהצלחה!',
      businessEmail: 'paintz.yf@gmail.com',
      customerEmail: testData.email
    };
    
  } catch (error) {
    console.error('=== Error in testEmailSending ===');
    console.error('Error:', error);
    console.error('Error stack:', error.stack);
    
    return {
      success: false,
      error: error.toString(),
      message: 'שגיאה בשליחת המיילים: ' + error.toString()
    };
  }
} 

// פונקציה לבדיקת מערכת המיילים
function testEmailSystem() {
  console.log('=== testEmailSystem called ===');
  
  const results = {
    gmailPermissions: false,
    businessEmail: false,
    customerEmail: false,
    errors: []
  };
  
  try {
    // בדיקת הרשאות Gmail
    console.log('Testing Gmail permissions...');
    const threads = GmailApp.getInboxThreads(0, 1);
    console.log('✅ Gmail permissions OK - found', threads.length, 'threads');
    results.gmailPermissions = true;
  } catch (gmailError) {
    console.error('❌ Gmail permissions error:', gmailError);
    results.errors.push('Gmail permissions: ' + gmailError.toString());
  }
  
  // בדיקת שליחת מייל פשוט
  try {
    console.log('Testing basic email sending...');
    const testResult = GmailApp.sendEmail(
      'paintz.yf@gmail.com',
      'בדיקת מערכת Paintz - ' + new Date().toISOString(),
      'זוהי בדיקה אוטומטית של מערכת המיילים',
      {name: 'מערכת בדיקה Paintz'}
    );
    console.log('✅ Basic email test passed:', testResult);
  } catch (testError) {
    console.error('❌ Basic email test failed:', testError);
    results.errors.push('Basic email test: ' + testError.toString());
  }
  
  // בדיקת שליחת מייל לעסק
  try {
    console.log('Testing business email function...');
    const testData = {
      firstName: 'בדיקה',
      lastName: 'מערכת',
      email: 'test@paintz.com',
      phone: '050-1234567',
      orderNumber: 'TEST-' + new Date().getTime(),
      cart: [
        {
          title: 'בדיקת מערכת',
          subtitle: 'מוצר בדיקה',
          price: 100,
          notes: 'זוהי בדיקה אוטומטית'
        }
      ]
    };
    
    sendBusinessEmail(testData);
    console.log('✅ Business email function test passed');
    results.businessEmail = true;
  } catch (businessError) {
    console.error('❌ Business email function test failed:', businessError);
    results.errors.push('Business email function: ' + businessError.toString());
  }
  
  // בדיקת שליחת מייל ללקוח
  try {
    console.log('Testing customer email function...');
    const testData = {
      firstName: 'בדיקה',
      lastName: 'מערכת',
      email: 'yardenfad@gmail.com', // מייל אמיתי לבדיקה
      phone: '050-1234567',
      orderNumber: 'TEST-' + new Date().getTime(),
      cart: [
        {
          title: 'בדיקת מערכת',
          subtitle: 'מוצר בדיקה',
          price: 100,
          notes: 'זוהי בדיקה אוטומטית'
        }
      ]
    };
    
    sendCustomerEmail(testData);
    console.log('✅ Customer email function test passed');
    results.customerEmail = true;
  } catch (customerError) {
    console.error('❌ Customer email function test failed:', customerError);
    results.errors.push('Customer email function: ' + customerError.toString());
  }
  
  // סיכום התוצאות
  console.log('=== Email System Test Results ===');
  console.log('Gmail permissions:', results.gmailPermissions);
  console.log('Business email function:', results.businessEmail);
  console.log('Customer email function:', results.customerEmail);
  console.log('Errors:', results.errors);
  
  if (results.errors.length > 0) {
    console.error('❌ Email system has issues:');
    results.errors.forEach(error => console.error('-', error));
  } else {
    console.log('✅ Email system is working correctly');
  }
  
  return results;
}

// פונקציה לבדיקת הרשאות מתקדמת
function checkAdvancedPermissions() {
  console.log('=== checkAdvancedPermissions called ===');
  
  const permissions = {
    gmail: false,
    script: false,
    deployment: false,
    url: false,
    errors: []
  };
  
  try {
    // בדיקת הרשאות Gmail
    console.log('Testing Gmail permissions...');
    const threads = GmailApp.getInboxThreads(0, 1);
    console.log('✅ Gmail permissions OK - found', threads.length, 'threads');
    permissions.gmail = true;
  } catch (gmailError) {
    console.error('❌ Gmail permissions error:', gmailError);
    permissions.errors.push('Gmail: ' + gmailError.toString());
  }
  
  try {
    // בדיקת הרשאות Script
    console.log('Testing Script permissions...');
    const scriptUrl = ScriptApp.getService().getUrl();
    console.log('✅ Script permissions OK - URL:', scriptUrl);
    permissions.script = true;
    permissions.url = true;
  } catch (scriptError) {
    console.error('❌ Script permissions error:', scriptError);
    permissions.errors.push('Script: ' + scriptError.toString());
  }
  
  try {
    // בדיקת Deployment
    console.log('Testing deployment...');
    const deployments = ScriptApp.getService().getDeployments();
    console.log('✅ Deployment OK - found', deployments.length, 'deployments');
    permissions.deployment = true;
  } catch (deploymentError) {
    console.error('❌ Deployment error:', deploymentError);
    permissions.errors.push('Deployment: ' + deploymentError.toString());
  }
  
  // בדיקת שליחת מייל פשוט
  try {
    console.log('Testing email sending...');
    const testResult = GmailApp.sendEmail(
      'paintz.yf@gmail.com',
      'בדיקת הרשאות Paintz - ' + new Date().toISOString(),
      'זוהי בדיקה אוטומטית של הרשאות המייל',
      {name: 'בדיקת הרשאות Paintz'}
    );
    console.log('✅ Email sending test passed:', testResult);
  } catch (emailError) {
    console.error('❌ Email sending test failed:', emailError);
    permissions.errors.push('Email sending: ' + emailError.toString());
  }
  
  // סיכום התוצאות
  console.log('=== Advanced Permissions Test Results ===');
  console.log('Gmail permissions:', permissions.gmail);
  console.log('Script permissions:', permissions.script);
  console.log('Deployment:', permissions.deployment);
  console.log('URL access:', permissions.url);
  console.log('Errors:', permissions.errors);
  
  if (permissions.errors.length > 0) {
    console.error('❌ Permission issues found:');
    permissions.errors.forEach(error => console.error('-', error));
  } else {
    console.log('✅ All permissions are working correctly');
  }
  
  return permissions;
}

// פונקציה לבדיקת בעיות נפוצות ופתרונות
function diagnoseEmailIssues() {
  console.log('=== diagnoseEmailIssues called ===');
  
  const diagnosis = {
    issues: [],
    solutions: [],
    recommendations: []
  };
  
  try {
    // בדיקה 1: הרשאות Gmail
    console.log('Checking Gmail permissions...');
    try {
      const threads = GmailApp.getInboxThreads(0, 1);
      console.log('✅ Gmail permissions are OK');
    } catch (gmailError) {
      console.error('❌ Gmail permissions issue:', gmailError);
      diagnosis.issues.push('Gmail permissions error');
      diagnosis.solutions.push('Go to Google Apps Script > Project Settings > Script Properties and ensure Gmail API is enabled');
      diagnosis.recommendations.push('Check if the script has proper Gmail permissions in the Google Apps Script console');
    }
    
    // בדיקה 2: שליחת מייל פשוט
    console.log('Testing basic email sending...');
    try {
      const testResult = GmailApp.sendEmail(
        'paintz.yf@gmail.com',
        'בדיקת אבחון Paintz - ' + new Date().toISOString(),
        'זוהי בדיקה אוטומטית לאבחון בעיות',
        {name: 'אבחון Paintz'}
      );
      console.log('✅ Basic email sending is OK');
    } catch (emailError) {
      console.error('❌ Basic email sending issue:', emailError);
      diagnosis.issues.push('Basic email sending error');
      diagnosis.solutions.push('Check Gmail API quotas and limits');
      diagnosis.recommendations.push('Verify the sender email address is correct and has proper permissions');
    }
    
    // בדיקה 3: פונקציות המייל
    console.log('Testing email functions...');
    try {
      const testData = {
        firstName: 'אבחון',
        lastName: 'מערכת',
        email: 'paintz.yf@gmail.com',
        phone: '050-1234567',
        orderNumber: 'DIAG-' + new Date().getTime(),
        cart: [
          {
            title: 'בדיקת אבחון',
            subtitle: 'מוצר בדיקה',
            price: 100,
            notes: 'זוהי בדיקת אבחון'
          }
        ]
      };
      
      sendBusinessEmail(testData);
      console.log('✅ Business email function is OK');
    } catch (businessError) {
      console.error('❌ Business email function issue:', businessError);
      diagnosis.issues.push('Business email function error');
      diagnosis.solutions.push('Check the sendBusinessEmail function for syntax errors');
      diagnosis.recommendations.push('Verify all required data fields are present in the order data');
    }
    
    // בדיקה 4: פונקציית מייל ללקוח
    try {
      const testData = {
        firstName: 'אבחון',
        lastName: 'מערכת',
        email: 'yardenfad@gmail.com',
        phone: '050-1234567',
        orderNumber: 'DIAG-' + new Date().getTime(),
        cart: [
          {
            title: 'בדיקת אבחון',
            subtitle: 'מוצר בדיקה',
            price: 100,
            notes: 'זוהי בדיקת אבחון'
          }
        ]
      };
      
      sendCustomerEmail(testData);
      console.log('✅ Customer email function is OK');
    } catch (customerError) {
      console.error('❌ Customer email function issue:', customerError);
      diagnosis.issues.push('Customer email function error');
      diagnosis.solutions.push('Check the sendCustomerEmail function for syntax errors');
      diagnosis.recommendations.push('Verify the customer email address is valid and accessible');
    }
    
    // בדיקה 5: URL ופריסה
    console.log('Checking deployment and URL...');
    try {
      const scriptUrl = ScriptApp.getService().getUrl();
      console.log('✅ Script URL is OK:', scriptUrl);
    } catch (urlError) {
      console.error('❌ Script URL issue:', urlError);
      diagnosis.issues.push('Script URL error');
      diagnosis.solutions.push('Deploy the script as a web app and ensure it\'s accessible');
      diagnosis.recommendations.push('Check the deployment settings and make sure the script is published as a web app');
    }
    
  } catch (generalError) {
    console.error('❌ General diagnosis error:', generalError);
    diagnosis.issues.push('General diagnosis error');
    diagnosis.solutions.push('Check the Google Apps Script console for detailed error messages');
    diagnosis.recommendations.push('Review the script logs and ensure all functions are properly defined');
  }
  
  // סיכום האבחון
  console.log('=== Email Issues Diagnosis Results ===');
  console.log('Issues found:', diagnosis.issues.length);
  console.log('Solutions provided:', diagnosis.solutions.length);
  console.log('Recommendations:', diagnosis.recommendations.length);
  
  if (diagnosis.issues.length > 0) {
    console.error('❌ Issues found:');
    diagnosis.issues.forEach((issue, index) => {
      console.error(`${index + 1}. ${issue}`);
      console.error(`   Solution: ${diagnosis.solutions[index]}`);
      console.error(`   Recommendation: ${diagnosis.recommendations[index]}`);
    });
  } else {
    console.log('✅ No issues found - email system appears to be working correctly');
  }
  
  return diagnosis;
}

// פונקציה לשליחת קבצים גדולים במייל נפרד
function sendLargeFilesEmail(data) {
  console.log('=== sendLargeFilesEmail called ===');
  
  // איסוף כל הקבצים הגדולים
  let largeFiles = [];
  let orderInfo = {
    orderNumber: data.orderNumber || 'לא צוין',
    customerName: `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'לא צוין',
    customerEmail: data.email || 'לא צוין',
    customerPhone: data.phone || 'לא צוין'
  };
  
  if (data.cart && data.cart.length > 0) {
    data.cart.forEach((item, itemIndex) => {
      if (item.files && item.files.length > 0) {
        item.files.forEach((file, fileIndex) => {
          if (file.isLargeFile === true && file.content) {
            largeFiles.push({
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size,
              content: file.content,
              productTitle: item.title,
              productSubtitle: item.subtitle,
              itemIndex: itemIndex,
              fileIndex: fileIndex
            });
          }
        });
      }
    });
  }
  
  console.log(`Found ${largeFiles.length} large files to send separately`);
  
  if (largeFiles.length === 0) {
    console.log('No large files found - skipping separate email');
    return;
  }
  
  // יצירת תוכן המייל
  let emailSubject = `קבצים גדולים להזמנה #${orderInfo.orderNumber} | Paintz`;
  let emailBody = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #20B2AA; text-align: center;">קבצים גדולים להזמנה #${orderInfo.orderNumber}</h2>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #333; margin-top: 0;">פרטי הלקוח:</h3>
        <p><strong>שם:</strong> ${orderInfo.customerName}</p>
        <p><strong>אימייל:</strong> ${orderInfo.customerEmail}</p>
        <p><strong>טלפון:</strong> ${orderInfo.customerPhone}</p>
      </div>
      
      <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #333; margin-top: 0;">קבצים גדולים שנשלחו בנפרד:</h3>
        <ul style="list-style-type: none; padding: 0;">
  `;
  
  largeFiles.forEach((file, index) => {
    emailBody += `
          <li style="background-color: white; padding: 10px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #20B2AA;">
            <strong>קובץ ${index + 1}:</strong> ${file.fileName}<br>
            <small>גודל: ${(file.fileSize / (1024 * 1024)).toFixed(2)} MB | סוג: ${file.fileType}</small><br>
            <small>מוצר: ${file.productTitle} - ${file.productSubtitle}</small>
          </li>
    `;
  });
  
  emailBody += `
        </ul>
      </div>
      
      <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
        <p style="margin: 0; color: #856404;"><strong>הערה:</strong> קבצים אלה נשלחו בנפרד כי הם גדולים מדי לשליחה רגילה. הם מצורפים למייל זה.</p>
      </div>
    </div>
  `;
  
  // יצירת קבצים מצורפים
  let attachments = [];
  largeFiles.forEach(file => {
    try {
      // הסרת prefix אם קיים (data:image/jpeg;base64,)
      let cleanContent = file.content;
      if (file.content.includes(',')) {
        cleanContent = file.content.split(',')[1];
      }
      
      const decodedContent = Utilities.base64Decode(cleanContent);
      const blob = Utilities.newBlob(decodedContent, file.fileType, file.fileName);
      attachments.push(blob);
      console.log(`✅ Added large file attachment: ${file.fileName} (type: ${file.fileType}, size: ${decodedContent.length} bytes)`);
    } catch (error) {
      console.error(`❌ Error creating attachment for large file ${file.fileName}:`, error);
    }
  });
  
  // שליחת המייל
  try {
    const emailOptions = {
      htmlBody: emailBody,
      attachments: attachments
    };
    
    console.log('Sending large files email to: paintz.yf@gmail.com');
    console.log('Email options:', JSON.stringify({
      subject: emailSubject,
      attachmentsCount: attachments.length,
      largeFilesCount: largeFiles.length
    }, null, 2));
    
    const result = GmailApp.sendEmail(
      'paintz.yf@gmail.com',
      emailSubject,
      '',
      emailOptions
    );
    
    console.log('✅ Large files email sent successfully');
    console.log('Email result:', result);
    
  } catch (sendError) {
    console.error('❌ Error sending large files email:', sendError);
    console.error('Error details:', {
      message: sendError.message,
      stack: sendError.stack,
      name: sendError.name
    });
    throw sendError;
  }
}

// פונקציה לבדיקה מיוחדת של תמונות דגמים
function validateModelImageUrl(imageUrl) {
  if (!imageUrl) return null;
  
  console.log(`Validating image URL: ${imageUrl}`);
  
  // אם זה כבר URL מלא, נחזיר אותו
  if (imageUrl.startsWith('http')) {
    console.log(`Image is already full URL: ${imageUrl}`);
    return imageUrl;
  }
  
  // אם זה נתיב יחסי של דגם, נמיר ל-URL מלא
  if (imageUrl.startsWith('Models/')) {
    const baseUrl = 'https://yardenfad.github.io/paintz-website';
    const fullUrl = `${baseUrl}/${imageUrl}`;
    console.log(`Converted Models image to full URL: ${fullUrl}`);
    return fullUrl;
  }
  
  // אם זה נתיב יחסי של img, נמיר גם אותו
  if (imageUrl.startsWith('img/')) {
    const baseUrl = 'https://yardenfad.github.io/paintz-website';
    const fullUrl = `${baseUrl}/${imageUrl}`;
    console.log(`Converted img image to full URL: ${fullUrl}`);
    return fullUrl;
  }
  
  // אם זה נתיב יחסי אחר (ללא /), נמיר גם אותו
  if (imageUrl.includes('.jpg') || imageUrl.includes('.jpeg') || imageUrl.includes('.png') || imageUrl.includes('.JPG')) {
    const baseUrl = 'https://yardenfad.github.io/paintz-website';
    const fullUrl = `${baseUrl}/${imageUrl}`;
    console.log(`Converted other image to full URL: ${fullUrl}`);
    return fullUrl;
  }
  
  console.log(`Image URL not recognized: ${imageUrl}`);
  return null;
}

// פונקציה לבדיקת תמונות דגמים
function testModelImages() {
  console.log('=== Testing All Images ===');
  
  const testImages = [
    'Models/Backgammon1_1.JPG',
    'Models/Matka1_1.JPG',
    'img/Backgammon1.jpg',
    'img/Backgammon1.jpg',
    'img/matka1.jpg',
    'img/canvas1.jpg',
    'img/img-record1.jpg',
    'img/Matka1.JPG',
    'img/Matka2.JPG',
    'img/Matka3.JPG'
  ];
  
  const baseUrl = 'https://yardenfad.github.io/paintz-website';
  
  testImages.forEach((imagePath, index) => {
    const fullUrl = `${baseUrl}/${imagePath}`;
    console.log(`Test ${index + 1}: ${imagePath} -> ${fullUrl}`);
    
    // בדיקה אם ה-URL תקין
    const isValid = isValidEmailImage(fullUrl);
    console.log(`  Valid for email: ${isValid}`);
    
    // בדיקה אם התמונה נגישה
    const isAvailable = checkImageAvailability(fullUrl);
    console.log(`  Available: ${isAvailable}`);
    
    // בדיקה עם הפונקציה החדשה
    const validatedUrl = validateModelImageUrl(imagePath);
    console.log(`  Validated URL: ${validatedUrl}`);
  });
  
  console.log('=== All Images Test Complete ===');
}

// פונקציה לבדיקה מיוחדת של תמונות עיצובים אישיים
function testCustomDesignImages() {
  console.log('=== Testing Custom Design Images ===');
  
  const customImages = [
    'img/Backgammon1.jpg', // שש בש עיצוב אישי
    'img/Backgammon1.jpg',  // שש בש עיצוב אישי (גרסה אחרת)
    'img/matka1.jpg',       // מטקה עיצוב אישי
    'img/canvas1.jpg',      // קנבס עיצוב אישי
    'img/img-record1.jpg'   // תקליט עיצוב אישי
  ];
  
  const baseUrl = 'https://yardenfad.github.io/paintz-website';
  
  customImages.forEach((imagePath, index) => {
    console.log(`\n--- Custom Design Image ${index + 1} ---`);
    console.log(`Original path: ${imagePath}`);
    
    // בדיקה עם הפונקציה החדשה
    const validatedUrl = validateModelImageUrl(imagePath);
    console.log(`Validated URL: ${validatedUrl}`);
    
    // בדיקה אם ה-URL תקין
    const isValid = isValidEmailImage(validatedUrl);
    console.log(`Valid for email: ${isValid}`);
    
    // בדיקה אם התמונה נגישה
    const isAvailable = checkImageAvailability(validatedUrl);
    console.log(`Available: ${isAvailable}`);
  });
  
  console.log('\n=== Custom Design Images Test Complete ===');
}

// פונקציה לבדיקה מיוחדת של תמונות בסל הקניות הגדול
function testShoppingCartImages() {
  console.log('=== Testing Shopping Cart Images ===');
  
  const cartImages = [
    'img/Backgammon1.jpg',    // שש בש עיצוב אישי
    'img/Backgammon2.jpg',    // שש בש עיצוב אישי
    'img/matka1.jpg',         // מטקה עיצוב אישי
    'img/matka2.jpg',         // מטקה עיצוב אישי
    'img/canvas1.jpg',        // קנבס עיצוב אישי
    'img/canvas2.jpg',        // קנבס עיצוב אישי
    'img/img-record1.jpg',    // תקליט עיצוב אישי
    'img/img-record2.jpg',    // תקליט עיצוב אישי
    'Models/Backgammon1_1.JPG', // שש בש דגם
    'Models/Matka1_1.JPG'     // מטקה דגם
  ];
  
  const baseUrl = 'https://yardenfad.github.io/paintz-website';
  
  cartImages.forEach((imagePath, index) => {
    console.log(`\n--- Shopping Cart Image ${index + 1} ---`);
    console.log(`Original path: ${imagePath}`);
    
    // בדיקה עם הפונקציה החדשה
    const validatedUrl = validateModelImageUrl(imagePath);
    console.log(`Validated URL: ${validatedUrl}`);
    
    // בדיקה אם ה-URL תקין
    const isValid = isValidEmailImage(validatedUrl);
    console.log(`Valid for email: ${isValid}`);
    
    // בדיקה אם התמונה נגישה
    const isAvailable = checkImageAvailability(validatedUrl);
    console.log(`Available: ${isAvailable}`);
    
    // בדיקה אם התמונה תקינה למייל
    const isEmailValid = isValidEmailImage(validatedUrl);
    console.log(`Email valid: ${isEmailValid}`);
  });
  
  console.log('\n=== Shopping Cart Images Test Complete ===');
}

// פונקציה לבדיקה מיוחדת של תמונות עמוד החנות
function testShopPageImages() {
  console.log('=== Testing Shop Page Images ===');
  
  const shopImages = [
    'sheshbesh.jpg',    // שש בשים
    'matkot.jpg',       // מטקות
    'vinyl.jpg',        // תקליטים
    'canvas.jpg'        // קנבסים
  ];
  
  const baseUrl = 'https://yardenfad.github.io/paintz-website';
  
  shopImages.forEach((imagePath, index) => {
    console.log(`\n--- Shop Page Image ${index + 1} ---`);
    console.log(`Original path: ${imagePath}`);
    
    // בדיקה עם הפונקציה החדשה
    const validatedUrl = validateModelImageUrl(imagePath);
    console.log(`Validated URL: ${validatedUrl}`);
    
    // בדיקה אם ה-URL תקין
    const isValid = isValidEmailImage(validatedUrl);
    console.log(`Valid for email: ${isValid}`);
    
    // בדיקה אם התמונה נגישה
    const isAvailable = checkImageAvailability(validatedUrl);
    console.log(`Available: ${isAvailable}`);
    
    // בדיקה אם התמונה תקינה למייל
    const isEmailValid = isValidEmailImage(validatedUrl);
    console.log(`Email valid: ${isEmailValid}`);
  });
  
  console.log('\n=== Shop Page Images Test Complete ===');
}

// פונקציה לבדיקת תמונות החנות
function testShopImages() {
  console.log('=== Testing Shop Images ===');
  
  const shopImages = [
    'sheshbesh.jpg',    // שש בשים
    'matkot.jpg',       // מטקות
    'vinyl.jpg',        // תקליטים
    'canvas.jpg'        // קנבסים
  ];
  
  const baseUrl = 'https://yardenfad.github.io/paintz-website';
  
  shopImages.forEach((imageName, index) => {
    console.log(`\n--- Shop Image ${index + 1} ---`);
    console.log(`Image name: ${imageName}`);
    
    // בדיקה עם הנתיב המלא
    const fullUrl = `${baseUrl}/${imageName}`;
    console.log(`Full URL: ${fullUrl}`);
    
    // בדיקה אם ה-URL תקין
    const isValid = isValidEmailImage(fullUrl);
    console.log(`Valid for email: ${isValid}`);
    
    // בדיקה אם התמונה נגישה
    const isAvailable = checkImageAvailability(fullUrl);
    console.log(`Available: ${isAvailable}`);
    
    // בדיקה עם הפונקציה החדשה
    const validatedUrl = validateModelImageUrl(imageName);
    console.log(`Validated URL: ${validatedUrl}`);
  });
  
  console.log('\n=== Shop Images Test Complete ===');
} 