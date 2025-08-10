// Google Apps Script - מערכת הזמנות Paintz - גרסה סופית מתוקנת
// תאריך עדכון: 2025-01-14
// העתק את הקוד הזה במלואו לGoogle Apps Script
// 🎯 VERSION: UPDATED_WITH_BEAUTIFUL_DESIGN_v2 🎯

function doGet(e) {
  console.log('=== doGet called ===');
  console.log('🎯 RUNNING: UPDATED_WITH_BEAUTIFUL_DESIGN_v2 🎯');
  console.log('This is the NEW UPDATED version with beautiful email design!');
  
  try {
    // בדיקה אם יש נתונים
    if (e.parameter && e.parameter.data) {
      console.log('Processing GET request with data');
      const orderData = JSON.parse(e.parameter.data);
      return processOrder(orderData);
    } else {
      console.log('GET request without data - returning status');
      return ContentService
        .createTextOutput('{"message":"Paintz Orders API is running","status":"active","version":"UPDATED_WITH_BEAUTIFUL_DESIGN_v2","timestamp":"' + new Date().toISOString() + '"}')
        .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    console.error('Error in doGet:', error);
    return ContentService
      .createTextOutput('{"error":"' + error.toString() + '","status":"error"}')
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  console.log('=== doPost called ===');
  console.log('🎯 RUNNING: UPDATED_WITH_BEAUTIFUL_DESIGN_v2 🎯');
  console.log('This is the NEW UPDATED version with beautiful email design!');
  console.log('e.parameter:', e.parameter);
  console.log('e.postData:', e.postData);
  
  try {
    let data;
    
    // שיטה 1: מe.parameter.data
    if (e.parameter && e.parameter.data) {
      console.log('Method 1: Getting data from e.parameter.data');
      data = JSON.parse(e.parameter.data);
    } 
    // שיטה 2: מe.postData.contents
    else if (e.postData && e.postData.contents) {
      console.log('Method 2: Getting data from e.postData.contents');
      data = JSON.parse(e.postData.contents);
    }
    // שיטה 3: מכל הparameters
    else if (e.parameter) {
      console.log('Method 3: Getting data from all parameters');
      data = e.parameter;
    }
    else {
      throw new Error('No data received');
    }
    
    console.log('Received data:', data);
    return processOrder(data);
    
  } catch (error) {
    console.error('Error in doPost:', error);
    return createErrorResponse(error);
  }
}

function processOrder(data) {
  console.log('=== Processing order ===');
  console.log('Raw data received:', JSON.stringify(data, null, 2));
  
  if (!data) {
    throw new Error('נתונים חסרים');
  }

  if (!data.firstName || !data.lastName || !data.email) {
    console.error('Missing required fields:', {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email
    });
    throw new Error('שדות חובה חסרים');
  }

  // יצירת מספר הזמנה
  data.orderNumber = generateOrderNumber();
  
  console.log('=== DETAILED CART DEBUG ===');
  console.log('Cart exists:', !!data.cart);
  console.log('Cart length:', data.cart ? data.cart.length : 'undefined');
  console.log('Cart data:', JSON.stringify(data.cart, null, 2));
  
  if (data.cart && data.cart.length > 0) {
    data.cart.forEach((item, index) => {
      console.log(`=== ITEM ${index} DETAILED ANALYSIS ===`);
      console.log('Complete item:', JSON.stringify(item, null, 2));
      console.log('Title fields:', {
        title: item.title,
        name: item.name,
        mainTitle: item.mainTitle
      });
      console.log('Subtitle fields:', {
        subtitle: item.subtitle,
        subTitle: item.subTitle,
        variant: item.variant
      });
      console.log('Image fields:', {
        img: item.img,
        image: item.image,
        imgUrl: item.imgUrl
      });
      console.log('Quantity fields:', {
        qty: item.qty,
        quantity: item.quantity,
        qtyType: typeof item.qty
      });
      console.log('Price and notes:', {
        price: item.price,
        priceType: typeof item.price,
        notes: item.notes,
        notesType: typeof item.notes
      });
      console.log('Files analysis:', {
        files: item.files,
        filesType: typeof item.files,
        filesLength: item.files ? item.files.length : 'undefined',
        file: item.file,
        fileType: typeof item.file
      });
      console.log('Color data:', {
        colorData: item.colorData,
        colorDataType: typeof item.colorData,
        colors: item.colors,
        colorsType: typeof item.colors
      });
      console.log('Description data:', {
        desc: item.desc,
        description: item.description,
        explanations: item.explanations,
        descType: typeof item.desc
      });
      console.log(`=== END ITEM ${index} ===`);
    });
  } else {
    console.log('❌ NO CART DATA FOUND!');
    console.log('This means the cart is empty or not properly sent from the website');
  }
  console.log('=== END CART DEBUG ===');

  // שליחת מיילים
  try {
    sendBusinessEmail(data);
    sendCustomerEmail(data);
    console.log('✅ All emails sent successfully');
  } catch (emailError) {
    console.error('❌ Email sending failed:', emailError);
    // אם יש שגיאה בשליחת מייל, נחזיר הודעת שגיאה עם המלצות
    return HtmlService.createHtmlOutput(`
      <html>
        <head>
          <meta charset="UTF-8">
          <title>שגיאה בשליחת המייל</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              direction: rtl;
              text-align: center;
              padding: 50px;
              background: #f9f1dc;
            }
            .error-container {
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
            .insta-link {
              color: #5B9B86;
              font-weight: bold;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="error-container">
            <h1>ההזמנה התקבלה אך יש בעיה בשליחת המייל</h1>
            <div class="order-number">מספר הזמנה: #${data.orderNumber}</div>
            <p>ההזמנה שלך התקבלה בהצלחה במערכת!</p>
            <p>אך יש בעיה בשליחת המייל האישור.</p>
            <p>אנא פנו אלינו באינסטגרם:
              <a class="insta-link" href="https://instagram.com/paintz.official" target="_blank">@paintz.official</a>
            </p>
            <p>או במייל: paintz.yf@gmail.com</p>
            <p>ונחזור אליכם בהקדם!</p>
          </div>
        </body>
      </html>
    `);
  }

  return createSuccessResponse(data.orderNumber);
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

// Functions to build product HTML based on existing cart data
function buildProductHtml(item) {
  console.log('Building product HTML for item:', item);
  
  // נסה למצוא את השם בכמה דרכים שונות
  const title = item.title || item.name || item.mainTitle || 'מוצר';
  const subtitle = item.subtitle || item.subTitle || item.variant || '';
  const image = item.img || item.image || item.imgUrl || '';
  const quantity = item.qty || item.quantity || 1;
  const isCustom = subtitle.includes('עיצוב אישי') || (item.notes && item.notes.includes('עיצוב אישי'));
  
  console.log('Product details:', { title, subtitle, image, quantity, isCustom });
  console.log('IMAGE DEBUG:', { 
    'item.img': item.img, 
    'item.image': item.image, 
    'final image': image 
  });
  console.log('FILES DEBUG:', { 
    'item.files': item.files, 
    'item.file': item.file,
    'files length': item.files ? item.files.length : 'no files'
  });
  console.log('NOTES DEBUG:', {
    'item.notes': item.notes,
    'notes type': typeof item.notes,
    'notes value': JSON.stringify(item.notes),
    'isCustom': isCustom,
    'subtitle': subtitle,
    'subtitle includes עיצוב אישי': subtitle.includes('עיצוב אישי')
  });
  
  // Build title with subtitle - תיקון הכותרת
  const titleHtml = subtitle ? `${title} | ${subtitle}` : title;
  
  // Build image HTML if exists - תיקון התמונה
  let imageHtml = '';
  if (image) {
    // אם התמונה לא מתחילה ב-http, נבנה נתיב מלא
    let imageUrl = image;
    if (!image.startsWith('http')) {
      // נשתמש בנתיב המלא לאתר
      imageUrl = `https://yardenfad.github.io/paintz-website/${image}`;
    }
    imageHtml = `
      <div style="flex-shrink: 0; margin-left: 20px;">
        <img src="${imageUrl}" style="width: 100px; height: 100px; border-radius: 8px; border: 1px solid #ddd; object-fit: cover;" alt="תמונת מוצר" onerror="this.style.display='none'">
      </div>
    `;
    console.log('IMAGE ADDED:', imageUrl);
  } else {
    console.log('❌ NO IMAGE FOUND for item');
  }
  
  // Build quantity display - תיקון הכמות - כדי שתהיה עם רווח מהתמונה
  const quantityHtml = `<div style="flex-shrink: 0; margin: 0 15px; display: flex; align-items: center; color: #20B2AA; font-size: 16px; font-weight: bold;">${quantity}</div>`;
  
  // Build content based on product type
  let contentHtml = '';
  
  if (title.includes('שש בש')) {
    if (isCustom) {
      contentHtml = buildBackgammonCustomHtml(item);
    } else {
      contentHtml = buildBackgammonModelHtml(item);
    }
  } else if (title.includes('מטקה') || title.includes('מטקות')) {
    if (isCustom) {
      contentHtml = buildMatkaCustomHtml(item);
    } else {
      contentHtml = buildMatkaModelHtml(item);
    }
  } else if (title.includes('קנבס')) {
    contentHtml = buildCanvasHtml(item);
    // Add custom price message for canvas custom
    if (isCustom) {
      contentHtml += `<div style="font-size: 16px; color: #ff8900; font-weight: bold; margin-top: 15px;">הצעת מחיר תשלח בהמשך</div>`;
    }
  } else if (title.includes('תקליט')) {
    contentHtml = buildRecordHtml(item);
    // Add custom price message for record custom
    if (isCustom) {
      contentHtml += `<div style="font-size: 16px; color: #ff8900; font-weight: bold; margin-top: 15px;">הצעת מחיר תשלח בהמשך</div>`;
    }
  } else {
    // ברירת מחדל - מוצר כללי
    if (isCustom) {
      contentHtml = `<div style="font-size: 16px; color: #ff8900; font-weight: bold; margin-bottom: 10px;">הצעת מחיר תשלח בהמשך</div>`;
    } else if (item.price && item.price > 0) {
      const priceText = item.price.toString();
      const priceDisplay = priceText.includes('₪') ? priceText : `₪${priceText}`;
      contentHtml = `<div style="font-size: 16px; color: #ff8900; font-weight: bold; margin-bottom: 10px;">מחיר: ${priceDisplay}</div>`;
    }
    

    
    // הוספת קבצים כלליים
    contentHtml += buildFilesHtml(item);
    
    // Add custom price message for general custom products
    if (isCustom) {
      contentHtml += `<div style="font-size: 16px; color: #ff8900; font-weight: bold; margin-top: 15px;">הצעת מחיר תשלח בהמשך</div>`;
    }
  }
  

  
  return `
    <div style="background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 15px 0; display: flex; align-items: flex-start; direction: rtl;">
      ${imageHtml}
      ${quantityHtml}
      <div style="flex: 1;">
        <h4 style="margin: 0 0 10px 0; color: #5A3E36; font-size: 18px;">${titleHtml}</h4>
        ${contentHtml}
      </div>
    </div>
  `;
}

function buildBackgammonCustomHtml(item) {
  console.log('=== BUILDING BACKGAMMON CUSTOM ===');
  console.log('Item notes:', item.notes);
  console.log('Item colorData:', item.colorData);
  console.log('Item desc:', item.desc);
  
  let html = '';
  
  // Build colors section
  if (item.colorData) {
    console.log('Processing colors for backgammon');
    const colorLabels = {
      bgOuter: 'צבע רקע חיצוני',
      bgInnerRight: 'צבע רקע פנימי ימין',
      bgInnerLeft: 'צבע רקע פנימי שמאל',
      triangle1: 'צבע משולש 1',
      triangle2: 'צבע משולש 2'
    };
    
    Object.keys(colorLabels).forEach(key => {
      if (item.colorData[key]) {
        const colorData = item.colorData[key];
        html += `<div style="margin-bottom: 8px; display: flex; align-items: center;">
          <div style="width: 20px; height: 20px; background: ${colorData.color}; border: 1px solid #ddd; border-radius: 4px; margin-left: 10px;"></div>
          <span style="font-size: 14px; color: #666;"><strong>${colorLabels[key]}:</strong> ${colorData.color} - ${colorData.text}</span>
        </div>`;
      }
    });
  } else if (item.colors) {
    console.log('Processing colors array for backgammon');
    if (Array.isArray(item.colors)) {
      item.colors.forEach((color, index) => {
        if (color) {
          const colorValue = color.color || color.hex || color.value || color;
          const colorText = color.text || color.name || colorValue;
          html += `<div style="margin-bottom: 8px; display: flex; align-items: center;">
            <div style="width: 20px; height: 20px; background: ${colorValue}; border: 1px solid #ddd; border-radius: 4px; margin-left: 10px;"></div>
            <span style="font-size: 14px; color: #666;"><strong>צבע ${index + 1}:</strong> ${colorValue} - ${colorText}</span>
          </div>`;
        }
      });
    }
  } else {
    console.log('❌ No colorData for backgammon');
  }
  
  // Build explanations section
  if (item.desc) {
    console.log('Processing descriptions for backgammon');
    if (item.desc.right) {
      html += `<div style="margin-bottom: 8px; font-size: 14px; color: #666;"><strong>הסבר ציור ימין:</strong> ${item.desc.right}</div>`;
    }
    if (item.desc.left) {
      html += `<div style="margin-bottom: 8px; font-size: 14px; color: #666;"><strong>הסבר ציור שמאל:</strong> ${item.desc.left}</div>`;
    }
  } else if (item.explanations) {
    console.log('Processing explanations for backgammon');
    if (item.explanations.right) {
      html += `<div style="margin-bottom: 8px; font-size: 14px; color: #666;"><strong>הסבר ציור ימין:</strong> ${item.explanations.right}</div>`;
    }
    if (item.explanations.left) {
      html += `<div style="margin-bottom: 8px; font-size: 14px; color: #666;"><strong>הסבר ציור שמאל:</strong> ${item.explanations.left}</div>`;
    }
  } else {
    console.log('❌ No descriptions for backgammon');
  }
  
  // Add notes if exists
  // (נמחקה שורת ההערות כאן)
  // Build files section
  html += buildFilesHtml(item);
  
  // Add custom price message for backgammon custom
  html += `<div style="font-size: 16px; color: #ff8900; font-weight: bold; margin-top: 15px;">הצעת מחיר תשלח בהמשך</div>`;
  
  console.log('=== END BACKGAMMON CUSTOM ===');
  return html;
}

function buildBackgammonModelHtml(item) {
  let html = '';
  
  // Notes first
  if (item.notes && item.notes !== 'הערה לבדיקה') {
    html += `<div style="font-size: 14px; color: #666; margin-bottom: 8px;"><strong>הערות:</strong> ${item.notes}</div>`;
  }
  
  // Price after notes (no files for models)
  if (item.price && item.price > 0) {
    const priceText = item.price.toString();
    const priceDisplay = priceText.includes('₪') ? priceText : `₪${priceText}`;
    html += `<div style="font-size: 16px; color: #ff8900; font-weight: bold; margin-bottom: 10px;">מחיר: ${priceDisplay}</div>`;
  }
  
  return html;
}

function buildMatkaCustomHtml(item) {
  console.log('=== BUILDING MATKA CUSTOM ===');
  console.log('Item notes:', item.notes);
  console.log('Item colorData:', item.colorData);
  console.log('Item desc:', item.desc);
  
  let html = '';
  
  // Build colors section
  if (item.colorData) {
    console.log('Processing colors for matka');
    if (item.colorData.color1) {
      const colorHex = item.colorData.color1.hex || item.colorData.color1.color;
      html += `<div style="margin-bottom: 8px; display: flex; align-items: center;">
        <div style="width: 20px; height: 20px; background: ${colorHex}; border: 1px solid #ddd; border-radius: 4px; margin-left: 10px;"></div>
        <span style="font-size: 14px; color: #666;"><strong>צבע מטקה 1:</strong> ${colorHex} - ${item.colorData.color1.text}</span>
      </div>`;
    }
    
    if (item.colorData.color2) {
      const colorHex = item.colorData.color2.hex || item.colorData.color2.color;
      html += `<div style="margin-bottom: 8px; display: flex; align-items: center;">
        <div style="width: 20px; height: 20px; background: ${colorHex}; border: 1px solid #ddd; border-radius: 4px; margin-left: 10px;"></div>
        <span style="font-size: 14px; color: #666;"><strong>צבע מטקה 2:</strong> ${colorHex} - ${item.colorData.color2.text}</span>
      </div>`;
    }
  } else {
    console.log('❌ No colorData for matka');
  }
  
  // Build explanations section
  if (item.colorData || item.desc) {
    console.log('Processing descriptions for matka');
    const desc1 = (item.colorData && item.colorData.desc1) || (item.desc && item.desc.desc1);
    const desc2 = (item.colorData && item.colorData.desc2) || (item.desc && item.desc.desc2);
    
    if (desc1) {
      html += `<div style="margin-bottom: 8px; font-size: 14px; color: #666;"><strong>הסבר מטקה 1:</strong> ${desc1}</div>`;
    }
    if (desc2) {
      html += `<div style="margin-bottom: 8px; font-size: 14px; color: #666;"><strong>הסבר מטקה 2:</strong> ${desc2}</div>`;
    }
  } else {
    console.log('❌ No descriptions for matka');
  }
  
  // Add notes if exists
  console.log('CHECKING NOTES for matka custom:', {
    'item.notes': item.notes,
    'notes type': typeof item.notes,
    'condition check': !!(item.notes && item.notes !== 'הערה לבדיקה')
  });
  
  if (item.notes && item.notes !== 'הערה לבדיקה') {
    html += `<div style="margin-bottom: 8px; font-size: 14px; color: #666;"><strong>הערות:</strong> ${item.notes}</div>`;
    console.log('✅ NOTES ADDED TO MATKA CUSTOM');
  } else {
    console.log('❌ NO NOTES ADDED TO MATKA - either empty or test note');
  }
  
  // Build files section
  html += buildFilesHtml(item);
  
  // Add custom price message for matka custom
  html += `<div style="font-size: 16px; color: #ff8900; font-weight: bold; margin-top: 15px;">הצעת מחיר תשלח בהמשך</div>`;
  
  console.log('=== END MATKA CUSTOM ===');
  return html;
}

function buildMatkaModelHtml(item) {
  let html = '';
  
  // Notes first
  if (item.notes && item.notes !== 'הערה לבדיקה') {
    html += `<div style="font-size: 14px; color: #666; margin-bottom: 8px;"><strong>הערות:</strong> ${item.notes}</div>`;
  }
  
  // Price after notes (no files for models)
  if (item.price && item.price > 0) {
    const priceText = item.price.toString();
    const priceDisplay = priceText.includes('₪') ? priceText : `₪${priceText}`;
    html += `<div style="font-size: 16px; color: #ff8900; font-weight: bold; margin-bottom: 10px;">מחיר: ${priceDisplay}</div>`;
  }
  
  return html;
}

function buildCanvasHtml(item) {
  console.log('=== BUILDING CANVAS ===');
  console.log('Item notes:', item.notes);
  console.log('Item desc:', item.desc);
  
  let html = '';
  // גודל
  if (item.notes && item.notes !== 'הערה לבדיקה' && (item.notes.includes('×') || item.notes.includes('סמ'))) {
    html += `<div style="font-size: 14px; color: #666; margin-bottom: 8px;"><strong>גודל:</strong> ${item.notes}</div>`;
    console.log('✅ SIZE ADDED TO CANVAS');
  }
  // הסבר
  if (item.desc) {
    html += `<div style="font-size: 14px; color: #666; margin-bottom: 8px;"><strong>הסבר:</strong> ${item.desc}</div>`;
    console.log('✅ DESCRIPTION ADDED TO CANVAS');
  } else {
    console.log('❌ No description for canvas');
  }
  // קבצים
  html += buildFilesHtml(item);
  return html;
}

function buildRecordHtml(item) {
  console.log('=== BUILDING RECORD ===');
  console.log('Item desc:', item.desc);
  let html = '';
  // הסבר
  if (item.desc) {
    html += `<div style="font-size: 14px; color: #666; margin-bottom: 8px;"><strong>הסבר:</strong> ${item.desc}</div>`;
    console.log('✅ DESCRIPTION ADDED TO RECORD');
  } else {
    console.log('❌ No description for record');
  }
  // קבצים
  html += buildFilesHtml(item);
  return html;
}

function buildFilesHtml(item) {
  console.log('=== FILES DEBUG ===');
  console.log('item.file:', item.file);
  console.log('item.files:', item.files);
  console.log('item.files type:', typeof item.files);
  console.log('item.files length:', item.files ? item.files.length : 'undefined');
  
  let html = '';
  const allFiles = [];
  
  // Add single file if exists
  if (item.file) {
    console.log('Processing single file:', item.file);
    if (typeof item.file === 'string') {
      const fileName = item.file.split(/[\/\\]/).pop();
      if (fileName) {
        allFiles.push(fileName);
        console.log('Added single file:', fileName);
      }
    } else if (item.file && item.file.name) {
      allFiles.push(item.file.name);
      console.log('Added single file from object:', item.file.name);
    }
  }
  
  // Add files from array
  if (item.files && Array.isArray(item.files) && item.files.length > 0) {
    console.log('Processing files array:', item.files);
    item.files.forEach((file, index) => {
      console.log(`Processing file ${index}:`, file);
      if (typeof file === 'string') {
        // אם זה string של נתיב קובץ
        const fileName = file.split(/[\/\\]/).pop();
        if (fileName) {
          allFiles.push(fileName);
          console.log('Added file from string:', fileName);
        }
      } else if (file && file.name) {
        // אם זה אובייקט עם שדה name
        allFiles.push(file.name);
        console.log('Added file from object:', file.name);
      } else if (file && file.fileName) {
        // אולי השדה נקרא fileName
        allFiles.push(file.fileName);
        console.log('Added file from fileName field:', file.fileName);
      } else if (file) {
        // גיבוי - הצג את הקובץ כמו שהוא
        allFiles.push(file.toString());
        console.log('Added file as fallback:', file.toString());
      }
    });
  } else if (item.files && typeof item.files === 'string') {
    // אולי files הוא string יחיד
    const fileName = item.files.split(/[\/\\]/).pop();
    if (fileName) {
      allFiles.push(fileName);
      console.log('Added files as single string:', fileName);
    }
  } else {
    console.log('❌ No files array or array is empty');
  }
  
  console.log('Final files list:', allFiles);
  console.log('=== END FILES DEBUG ===');
  
  // Display all files if any exist
  if (allFiles.length > 0) {
    html += `<div style="margin-bottom: 8px; font-size: 14px; color: #666;"><strong>קובץ:</strong> ${allFiles.join(', ')}</div>`;
    console.log('✅ FILES ADDED TO HTML');
  } else {
    console.log('❌ NO FILES TO DISPLAY');
  }
  
  return html;
}

function sendBusinessEmail(orderData) {
  console.log('=== sendBusinessEmail called ===');
  console.log('*** THIS EMAIL GOES TO BUSINESS: paintz.yf@gmail.com ***');
  
  console.log('ORDER DATA DEBUG:', {
    'firstName': orderData.firstName,
    'lastName': orderData.lastName,
    'email': orderData.email,
    'phone': orderData.phone,
    'company': orderData.company,
    'deliveryMethod': orderData.deliveryMethod,
    'country': orderData.country,
    'city': orderData.city,
    'street': orderData.street,
    'houseNumber': orderData.houseNumber,
    'zipCode': orderData.zipCode,
    'notes': orderData.notes
  });
  
  const firstName = orderData.firstName || 'לא צוין';
  const lastName = orderData.lastName || 'לא צוין';
  const email = orderData.email || 'לא צוין';
  const phone = orderData.phone || 'לא צוין';
  const company = orderData.company || 'לא צוין';
  const orderNumber = orderData.orderNumber || 'לא צוין';
  
  const subject = `הזמנה חדשה #${orderNumber} | ${firstName} ${lastName}`;
  
  // הכנת תוכן המוצרים עם הפונקציה החדשה
  let productsHtml = '';
  if (orderData.cart && orderData.cart.length > 0) {
    let totalPrice = 0;
    let hasCustomProducts = false;
    
    orderData.cart.forEach((item, index) => {
      console.log('Processing business email item:', item);
      
      // בניית HTML של המוצר עם הפונקציה החדשה
      productsHtml += buildProductHtml(item);
      
      // ספירת מחירים לסיכום
      if (item.price && item.price > 0) {
        totalPrice += item.price;
      } else {
        hasCustomProducts = true;
      }
    });
    
    // סיכום מחירים
    if (totalPrice > 0) {
      productsHtml += `
        <div style="border-top: 2px solid #8B4513; padding-top: 20px; margin-top: 20px;">
          <div style="text-align: right; font-size: 20px; color: #5D4037; font-weight: bold;">
            סה"כ מוצרים עם מחיר קבוע: ₪${totalPrice}
          </div>
        </div>
      `;
    }
    
    if (hasCustomProducts) {
      productsHtml += `
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 15px 0; text-align: center; color: #856404;">
          <strong>חלק מהמוצרים דורשים הצעת מחיר אישית</strong>
        </div>
      `;
    }
  } else {
    productsHtml = `
      <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 15px 0; text-align: center;">
        <p style="color: #856404; margin: 0;"><strong>לא נמצאו מוצרים בהזמנה</strong></p>
      </div>
    `;
  }

  // HTML תוכן המייל עם העיצוב היפה - רק אחד ללא כפילות
  let htmlContent = `
    <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; max-width: 800px; margin: 0 auto;">
      <div style="background: #5B9B86; color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">הזמנה חדשה מאתר Paintz</h1>
        <h2 style="margin: 10px 0 0 0; font-size: 24px;">מספר הזמנה: #${orderNumber}</h2>
      </div>
      
      <div style="background: #fff; border: 1px solid #ddd; border-radius: 0 0 10px 10px; padding: 30px;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #5B9B86; margin: 0 0 15px 0; font-size: 18px;">פרטי הזמנה:</h3>
          <p style="margin: 4px 0; font-size: 18px;"><strong>שם:</strong> ${firstName} ${lastName}</p>
          <p style="margin: 4px 0; font-size: 18px;"><strong>אימייל:</strong> ${email}</p>
          <p style="margin: 4px 0; font-size: 18px;"><strong>טלפון:</strong> ${phone}</p>
          ${company !== 'לא צוין' ? `<p style="margin: 4px 0; font-size: 18px;"><strong>חברה:</strong> ${company}</p>` : ''}
          <p style="margin: 4px 0; font-size: 18px;"><strong>אופן מסירה:</strong> ${orderData.deliveryMethod === 'pickup' ? 'איסוף עצמי' : 'משלוח'}</p>
        </div>
        
                 ${orderData.deliveryMethod === 'delivery' ? `
         <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
           <h3 style="color: #5B9B86; margin: 0 0 15px 0; font-size: 18px;">פרטי משלוח:</h3>
           <p style="margin: 4px 0; font-size: 18px;"><strong>מדינה:</strong> ${orderData.country === 'israel' ? 'ישראל' : (orderData.country || 'ישראל')}</p>
           <p style="margin: 4px 0; font-size: 18px;"><strong>עיר:</strong> ${orderData.city || 'לא צוין'}</p>
           <p style="margin: 4px 0; font-size: 18px;"><strong>רחוב:</strong> ${orderData.street || 'לא צוין'}</p>
           <p style="margin: 4px 0; font-size: 18px;"><strong>מספר בית:</strong> ${orderData.houseNumber || 'לא צוין'}</p>
           <p style="margin: 4px 0; font-size: 18px;"><strong>מיקוד:</strong> ${orderData.zipCode || 'לא צוין'}</p>
         </div>
         ` : ''}
        
        ${orderData.notes && orderData.notes !== 'הערה לבדיקה' ? `
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #5B9B86; margin: 0 0 15px 0; font-size: 18px;">הערות:</h3>
            <p style="margin: 0; font-size: 18px; line-height: 1.4;">${orderData.notes}</p>
          </div>
        ` : ''}
        
        <h3 style="background: #8B4513; color: white; padding: 15px; margin: 20px 0; border-radius: 8px; text-align: center; font-size: 20px;">סיכום הזמנה</h3>
        
        ${productsHtml}
        
        <div style="text-align: center; margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
          <strong>צוות Paintz</strong><br>
          <strong>מייל:</strong> paintz.yf@gmail.com<br>
          <strong>אינסטגרם:</strong> @paintz.official<br>
          <strong>מיקום:</strong> פתח תקווה
        </div>
      </div>
    </div>
  `;
  
  // הכנת קבצים מצורפים
  let attachments = [];
  if (orderData.cart && orderData.cart.length > 0) {
    orderData.cart.forEach((item, index) => {
      if (item.files && item.files.length > 0) {
        item.files.forEach(file => {
          // רק אם יש content מקודד base64
          if (file.content) {
            try {
              console.log(`Processing business attachment: ${file.name}`);
              attachments.push({
                fileName: file.name,
                content: Utilities.base64Decode(file.content),
                mimeType: file.type || 'application/octet-stream'
              });
            } catch (error) {
              console.error('Error processing business attachment:', error);
            }
          } else {
            console.log(`File ${file.name} has no content - will be listed in email but not attached`);
          }
        });
      }
    });
  }
  
  // שליחת מייל
  const emailOptions = {
    htmlBody: htmlContent,
    name: 'Paintz - מערכת הזמנות'
  };
  
  if (attachments.length > 0) {
    emailOptions.attachments = attachments;
    console.log(`Added ${attachments.length} attachments to business email`);
  }
  
  console.log('=== BUSINESS EMAIL ===');
  console.log('🎯 VERSION: UPDATED_WITH_BEAUTIFUL_DESIGN_v2 🎯');
  console.log('Sending business email to: paintz.yf@gmail.com');
  console.log('Email subject:', subject);
  console.log('Customer email in data:', email);
  console.log('IMPORTANT: Business email should go to paintz.yf@gmail.com ONLY!');
  
  try {
    GmailApp.sendEmail('paintz.yf@gmail.com', subject, '', emailOptions);
    console.log('✅ Business email sent successfully to: paintz.yf@gmail.com');
  } catch (emailError) {
    console.error('❌ Error sending business email:', emailError);
    throw new Error('שגיאה בשליחת מייל לעסק: ' + emailError.toString());
  }
}

function sendCustomerEmail(orderData) {
  console.log('=== sendCustomerEmail called ===');
  console.log('*** THIS EMAIL GOES TO CUSTOMER ***');
  
  const firstName = orderData.firstName || 'לא צוין';
  const lastName = orderData.lastName || 'לא צוין';
  const email = orderData.email; // זה המייל של הלקוח - לכאן נשלח המייל
  const phone = orderData.phone || 'לא צוין';
  const company = orderData.company || 'לא צוין';
  const orderNumber = orderData.orderNumber || 'לא צוין';
  
  console.log('Customer details:');
  console.log('- firstName:', firstName);
  console.log('- lastName:', lastName);
  console.log('- email:', email);
  console.log('- orderNumber:', orderNumber);
  
  if (!email) {
    console.error('No customer email provided!');
    throw new Error('כתובת אימייל של הלקוח חסרה');
  }
  
  console.log('Customer email address:', email);
  
  const subject = `אישור הזמנה #${orderNumber} | Paintz`;
  
  // הכנת תוכן המוצרים ללקוח עם הפונקציה החדשה
  let productsHtml = '';
  if (orderData.cart && orderData.cart.length > 0) {
    let totalPrice = 0;
    let hasCustomProducts = false;
    
    orderData.cart.forEach((item, index) => {
      console.log('Processing customer email item:', item);
      
      // בניית HTML של המוצר עם הפונקציה החדשה
      productsHtml += buildProductHtml(item);
      
      // ספירת מחירים לסיכום
      if (item.price && item.price > 0) {
        totalPrice += item.price;
      } else {
        hasCustomProducts = true;
      }
    });
    
    // סיכום מחירים
    if (totalPrice > 0) {
      productsHtml += `
        <div style="border-top: 2px solid #8B4513; padding-top: 20px; margin-top: 20px;">
          <div style="text-align: right; font-size: 20px; color: #5D4037; font-weight: bold;">
            סה"כ: ₪${totalPrice}
          </div>
        </div>
      `;
    }
    
    if (hasCustomProducts) {
      productsHtml += `
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 15px 0; text-align: center; color: #856404;">
          <strong>חלק מהמוצרים דורשים הצעת מחיר אישית</strong>
        </div>
      `;
    }
  } else {
    productsHtml = `
      <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 15px 0; text-align: center;">
        <p style="color: #856404; margin: 0;"><strong>לא נמצאו מוצרים בהזמנה</strong></p>
      </div>
    `;
  }
  
  // HTML תוכן המייל ללקוח עם העיצוב היפה
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; max-width: 800px; margin: 0 auto;">
      <div style="background: #5B9B86; color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">אישור הזמנה - Paintz</h1>
        <h2 style="margin: 10px 0 0 0; font-size: 24px;">מספר הזמנה: #${orderNumber}</h2>
      </div>
      
      <div style="background: #fff; border: 1px solid #ddd; border-radius: 0 0 10px 10px; padding: 30px;">
        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <h3 style="color: #2e7d32; margin: 0 0 10px 0;">שלום ${firstName}!</h3>
          <p style="margin: 0; color: #2e7d32; font-size: 16px;">
            תודה על הזמנתך! קיבלנו את פרטיך ואת פרטי המוצרים.
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #5B9B86; margin: 0 0 15px 0; font-size: 18px;">פרטי הזמנה:</h3>
          <p style="margin: 4px 0; font-size: 16px;"><strong>שם:</strong> ${firstName} ${lastName}</p>
          <p style="margin: 4px 0; font-size: 16px;"><strong>אימייל:</strong> ${email}</p>
          <p style="margin: 4px 0; font-size: 16px;"><strong>טלפון:</strong> ${phone}</p>
          ${company !== 'לא צוין' ? `<p style="margin: 4px 0; font-size: 16px;"><strong>חברה:</strong> ${company}</p>` : ''}
          <p style="margin: 4px 0; font-size: 16px;"><strong>אופן מסירה:</strong> ${orderData.deliveryMethod === 'pickup' ? 'איסוף עצמי' : 'משלוח'}</p>
        </div>
        
        ${orderData.deliveryMethod === 'delivery' ? `
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #5B9B86; margin: 0 0 15px 0; font-size: 18px;">פרטי משלוח:</h3>
          <p style="margin: 4px 0; font-size: 16px;"><strong>מדינה:</strong> ${orderData.country === 'israel' ? 'ישראל' : (orderData.country || 'ישראל')}</p>
          <p style="margin: 4px 0; font-size: 16px;"><strong>עיר:</strong> ${orderData.city || 'לא צוין'}</p>
          <p style="margin: 4px 0; font-size: 16px;"><strong>רחוב:</strong> ${orderData.street || 'לא צוין'}</p>
          <p style="margin: 4px 0; font-size: 16px;"><strong>מספר בית:</strong> ${orderData.houseNumber || 'לא צוין'}</p>
          <p style="margin: 4px 0; font-size: 16px;"><strong>מיקוד:</strong> ${orderData.zipCode || 'לא צוין'}</p>
        </div>
        ` : ''}
        
        ${orderData.notes && orderData.notes !== 'הערה לבדיקה' ? `
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #5B9B86; margin: 0 0 15px 0; font-size: 18px;">הערות:</h3>
            <p style="margin: 0; font-size: 16px; line-height: 1.4;">${orderData.notes}</p>
          </div>
        ` : ''}
        
        <h3 style="background: #8B4513; color: white; padding: 15px; margin: 20px 0; border-radius: 8px; text-align: center; font-size: 20px;">סיכום הזמנה</h3>
        
        ${productsHtml}
        
        <div style="background: #f0f8ff; border: 1px solid #b3d9ff; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #2e7d32; margin: 0 0 15px 0;">מה הלאה?</h3>
          <p style="margin: 5px 0; color: #333;">
            צוות Paintz יצור איתך קשר בהקדם לאישור ההזמנה, לוחות זמנים ופרטי תשלום.
          </p>
        </div>
        
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
  
  // הכנת קבצים מצורפים
  let attachments = [];
  if (orderData.cart && orderData.cart.length > 0) {
    orderData.cart.forEach((item, index) => {
      if (item.files && item.files.length > 0) {
        item.files.forEach(file => {
          // רק אם יש content מקודד base64
          if (file.content) {
            try {
              console.log(`Processing customer attachment: ${file.name}`);
              attachments.push({
                fileName: file.name,
                content: Utilities.base64Decode(file.content),
                mimeType: file.type || 'application/octet-stream'
              });
            } catch (error) {
              console.error('Error processing customer attachment:', error);
            }
          } else {
            console.log(`File ${file.name} has no content - will be listed in email but not attached`);
          }
        });
      }
    });
  }
  
  // שליחת מייל
  const emailOptions = {
    htmlBody: htmlContent,
    name: 'Paintz - אישור הזמנה'
  };
  
  if (attachments.length > 0) {
    emailOptions.attachments = attachments;
    console.log(`Added ${attachments.length} attachments to customer email`);
  }
  
  console.log('=== CUSTOMER EMAIL ===');
  console.log('🎯 VERSION: UPDATED_WITH_BEAUTIFUL_DESIGN_v2 🎯');
  console.log('Sending customer email to:', email);
  console.log('Email subject:', subject);
  console.log('IMPORTANT: Customer email goes to customer address:', email);
  
  try {
    GmailApp.sendEmail(email, subject, '', emailOptions);
    console.log('✅ Customer email sent successfully to:', email);
  } catch (sendError) {
    console.error('❌ Error sending customer email:', sendError);
    console.error('Customer email details:');
    console.error('- To:', email);
    console.error('- Subject:', subject);
    throw new Error('שגיאה בשליחת מייל ללקוח: ' + sendError.toString());
  }
}

function createSuccessResponse(orderNumber) {
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
          .order-number {
            font-size: 24px;
            font-weight: bold;
            color: #5B9B86;
            margin: 20px 0;
          }
          p {
            color: #5A3E36;
            font-size: 18px;
            line-height: 1.6;
          }
        </style>
      </head>
      <body>
        <div class="success-container">
          <h1>ההזמנה נשלחה בהצלחה!</h1>
          <div class="order-number">מספר הזמנה: #${orderNumber}</div>
          <p>תודה על הזמנתך!<br>
          קיבלנו את פרטיך ואת פרטי המוצרים המעוצבים.<br>
          ניצור איתך קשר בהקדם לאישור ההזמנה ופרטי התשלום.</p>
        </div>
      </body>
    </html>
  `);
}

function createErrorResponse(error) {
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
          .insta-link {
            color: #5B9B86;
            font-weight: bold;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="error-container">
          <h1>שגיאה בשליחת ההזמנה</h1>
          <p>מצטערים, אירעה שגיאה בעיבוד או בשליחת ההזמנה.</p>
          <p>אנא נסו שוב מאוחר יותר.<br>או פנו אלינו באינסטגרם:
            <a class="insta-link" href="https://instagram.com/paintz.official" target="_blank">@paintz.official</a>
          </p>
          <p>או במייל: paintz.yf@gmail.com</p>
        </div>
      </body>
    </html>
  `);
}

function testEmailSending() {
  console.log('=== Testing email sending with real cart data format ===');
  
  const testData = {
    firstName: 'יוני',
    lastName: 'בן דוד',
    email: 'yardenfad@gmail.com',
    phone: '050-1234567',
    company: 'חברת בדיקה',
    country: 'israel',
    city: 'תל אביב',
    street: 'דיזנגוף',
    houseNumber: '123',
    zipCode: '12345',
    notes: 'הערה לבדיקה - מוצרים מתקדמים',
    deliveryMethod: 'delivery',
    orderNumber: 'TEST-' + Date.now(),
    orderDate: new Date().toLocaleDateString('he-IL'),
    orderTime: new Date().toLocaleTimeString('he-IL'),
    cart: [
      {
        title: 'שש בש',
        subtitle: 'עיצוב אישי',
        img: 'img/Backgammon1.jpeg',
        qty: 1,
        price: 0,
        notes: 'עיצוב אישי - צבעים מותאמים אישית',
        colorData: {
          bgOuter: { color: '#8B4513', text: 'חום כהה' },
          bgInnerRight: { color: '#D2691E', text: 'חום בהיר' },
          bgInnerLeft: { color: '#F4A460', text: 'חום זהוב' },
          triangle1: { color: '#000000', text: 'שחור' },
          triangle2: { color: '#FFFFFF', text: 'לבן' }
        },
        desc: {
          right: 'ציור של דרקון בצד ימין',
          left: 'כיתוב אישי בצד שמאל'
        },
        files: [
          { name: 'dragon_design.jpg', type: 'image/jpeg', size: 1024000 },
          { name: 'personal_text.pdf', type: 'application/pdf', size: 512000 }
        ]
      },
      {
        title: 'מטקות',
        subtitle: 'דגם בובספוג',
        img: 'img/Matka1.JPG',
        qty: 1,
        price: 120,
        notes: 'דגם מיוחד עם הדפסה איכותית'
      }
    ]
  };
  
  console.log('Test data prepared with real cart format:', testData);
  
  // שליחת מיילים
  try {
    sendBusinessEmail(testData);
    sendCustomerEmail(testData);
    
    console.log('✅ Test emails sent successfully!');
    return {
      success: true,
      message: 'מיילי בדיקה נשלחו בהצלחה',
      orderNumber: testData.orderNumber
    };
  } catch (error) {
    console.error('❌ Error sending test emails:', error);
    return {
      success: false,
      message: 'שגיאה בשליחת מיילי בדיקה',
      error: error.toString()
    };
  }
} 