// מערכת ניהול הסכמה לקוקיז - Cookie Consent Management System
if (window.__paintzCookieConsentScriptLoaded) {
  // כבר נטען בעמוד זה — מונע שגיאת "already been declared"
} else {
window.__paintzCookieConsentScriptLoaded = true;

class CookieConsent {
    constructor() {
        this.cookieName = 'paintz_cookie_consent';
        this.cookieExpiry = 365; // ימים
        this.init();
    }

    init() {
        // בדיקה אם המשתמש כבר נתן הסכמה
        if (!this.hasConsent()) {
            this.showBanner();
        }
        
        // טעינת סקריפטים בהתאם להסכמה
        this.loadScripts();
    }

    hasConsent() {
        // בדיקה ראשית בקוקי
        let consent = this.getCookie(this.cookieName);
        
        // אם אין קוקי, בודק ב-localStorage
        if (!consent) {
            consent = localStorage.getItem(this.cookieName);
        }
        
        if (!consent) return false;
        
        try {
            const consentData = JSON.parse(consent);
            // בדיקה שהבחירה סופית
            return consentData.final === true;
        } catch (e) {
            return false;
        }
    }

    getConsentTypes() {
        // בדיקה ראשית בקוקי
        let consent = this.getCookie(this.cookieName);
        
        // אם אין קוקי, בודק ב-localStorage
        if (!consent) {
            consent = localStorage.getItem(this.cookieName);
        }
        
        if (!consent) return null;
        
        try {
            return JSON.parse(consent);
        } catch (e) {
            return null;
        }
    }

    setConsent(consentTypes) {
        const consentData = {
            essential: true, // תמיד נדרש
            analytics: consentTypes.analytics || false,
            marketing: consentTypes.marketing || false,
            functional: consentTypes.functional || false,
            timestamp: new Date().toISOString(),
            final: true // מסמן שהבחירה סופית
        };
        
        // שמירה גם בקוקי וגם ב-localStorage לוודאות
        this.setCookie(this.cookieName, JSON.stringify(consentData), this.cookieExpiry);
        localStorage.setItem(this.cookieName, JSON.stringify(consentData));
        
        this.hideBanner();
        this.loadScripts();
        
        // הסרת כפתור ההגדרות אחרי בחירה
        const settingsBtn = document.querySelector('.cookie-settings-btn');
        if (settingsBtn) {
            settingsBtn.remove();
        }
    }

    showBanner() {
        // בדיקה שאין כבר באנר פעיל
        const existingBanner = document.getElementById('cookie-consent-banner');
        if (existingBanner) {
            existingBanner.remove();
        }
        
        // יצירת הבאנר
        const banner = this.createBanner();
        document.body.appendChild(banner);
        
        // הוספת אנימציה
        setTimeout(() => {
            banner.classList.add('show');
        }, 100);
    }

    hideBanner() {
        const banner = document.getElementById('cookie-consent-banner');
        if (banner) {
            banner.classList.remove('show');
            setTimeout(() => {
                banner.remove();
            }, 400);
        }
    }

    createBanner() {
        const banner = document.createElement('div');
        banner.id = 'cookie-consent-banner';
        banner.className = 'cookie-consent-banner';
        
        banner.innerHTML = `
            <button class="cookie-close-btn" id="cookie-close-btn" aria-label="סגור הודעת עוגיות">×</button>
            <div class="cookie-consent-content">
                <div class="cookie-consent-text">
                    <h3>שימוש בעוגיות (Cookies)</h3>
                    <p>אנו משתמשים בעוגיות כדי לשפר את החוויה שלך באתר, לנתח תנועה ולהציג תוכן רלוונטי. לפרטים נוספים עיין ב<a href="terms-of-service.html" style="color: #F9F1DC; text-decoration: underline;">תנאי השימוש</a>.</p>
                </div>
                <div class="cookie-consent-buttons">
                    <button id="accept-all-cookies" class="btn-accept-all">קבל הכל</button>
                    <button id="customize-cookies" class="btn-customize">התאמה אישית</button>
                    <button id="reject-cookies" class="btn-reject">דחה</button>
                </div>
            </div>
            <div class="cookie-consent-details" id="cookie-details" style="display: none;">
                <h4>בחר את סוגי העוגיות:</h4>
                <div class="cookie-types">
                    <label class="cookie-type">
                        <input type="checkbox" checked disabled>
                        <span class="checkmark"></span>
                        <div class="cookie-info">
                            <strong>עוגיות חיוניות</strong>
                            <p>נדרשות לתפקוד בסיסי של האתר (תמיד פעילות)</p>
                        </div>
                    </label>
                    
                    <!-- Google Analytics הוסר - אין צורך בו -->
                    
                    <label class="cookie-type">
                        <input type="checkbox" id="marketing-cookies">
                        <span class="checkmark"></span>
                        <div class="cookie-info">
                            <strong>עוגיות שיווק</strong>
                            <p>משמשות להצגת פרסומות רלוונטיות</p>
                        </div>
                    </label>
                    
                    <label class="cookie-type">
                        <input type="checkbox" id="functional-cookies">
                        <span class="checkmark"></span>
                        <div class="cookie-info">
                            <strong>עוגיות פונקציונליות</strong>
                            <p>שומרות העדפות כמו שפה ונושא</p>
                        </div>
                    </label>
                </div>
                <div class="cookie-consent-buttons">
                    <button id="save-preferences" class="btn-save">שמור העדפות</button>
                    <button id="back-to-main" class="btn-back">חזור</button>
                </div>
            </div>
        `;
        
        this.attachEventListeners(banner);
        return banner;
    }

    attachEventListeners(banner) {
        // כפתור סגירה - רק מסתיר ללא שמירה (יופיע שוב ברענון)
        banner.querySelector('#cookie-close-btn').addEventListener('click', () => {
            this.hideBanner();
        });

        // קבל הכל
        banner.querySelector('#accept-all-cookies').addEventListener('click', () => {
            this.setConsent({
                analytics: false, // Google Analytics הוסר
                marketing: true,
                functional: true
            });
        });

        // דחה הכל (רק חיוניות)
        banner.querySelector('#reject-cookies').addEventListener('click', () => {
            this.setConsent({
                analytics: false,
                marketing: false,
                functional: false
            });
        });

        // התאמה אישית
        banner.querySelector('#customize-cookies').addEventListener('click', () => {
            const content = banner.querySelector('.cookie-consent-content');
            const details = banner.querySelector('.cookie-consent-details');
            if (content && details) {
                content.style.display = 'none';
                details.style.display = 'block';
            }
        });

        // חזור מהתאמה אישית
        banner.querySelector('#back-to-main').addEventListener('click', () => {
            const content = banner.querySelector('.cookie-consent-content');
            const details = banner.querySelector('.cookie-consent-details');
            if (content && details) {
                content.style.display = 'flex'; // חזרה לעיצוב המקורי
                details.style.display = 'none';
            }
        });

        // שמור העדפות
        banner.querySelector('#save-preferences').addEventListener('click', () => {
            const marketing = banner.querySelector('#marketing-cookies').checked;
            const functional = banner.querySelector('#functional-cookies').checked;
            
            this.setConsent({
                analytics: false, // Google Analytics הוסר
                marketing,
                functional
            });
        });
    }

    loadScripts() {
        const consent = this.getConsentTypes();
        if (!consent) return;

        // Google Analytics הוסר - אין צורך בו

        // טעינת סקריפטים נוספים בהתאם להסכמה
        if (consent.marketing) {
            this.loadMarketingScripts();
        }

        if (consent.functional) {
            this.loadFunctionalScripts();
        }
    }

    // Google Analytics הוסר - אין צורך בו

    loadMarketingScripts() {
        // כאן תוכלי להוסיף סקריפטים של פרסום
        console.log('Loading marketing scripts...');
    }

    loadFunctionalScripts() {
        // כאן תוכלי להוסיף סקריפטים פונקציונליים
        console.log('Loading functional scripts...');
    }

    // פונקציות עזר לניהול קוקיז
    setCookie(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        // הוספת Secure אם האתר ב-HTTPS
        const secure = location.protocol === 'https:' ? ';Secure' : '';
        document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax${secure}`;
    }

    getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) {
                return decodeURIComponent(c.substring(nameEQ.length, c.length));
            }
        }
        return null;
    }

    // פונקציה להצגת הגדרות קוקיז - לא זמינה יותר מהאתר
    showSettings() {
        // הבחירה סופית - ניתן לשנות רק דרך הדפדפן
        alert('לשינוי הגדרות עוגיות, השתמש בהגדרות הדפדפן שלך או נקה את נתוני האתר.');
    }

    // פונקציה לקבלת מידע על הסכמה נוכחית
    getConsentInfo() {
        return this.getConsentTypes();
    }
}

// CSS עבור הבאנר - מותאם לעיצוב האתר
const style = document.createElement('style');
style.textContent = `
    .cookie-consent-banner {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: #4C8467;
        color: white;
        padding: 25px;
        box-shadow: 0 -4px 25px rgba(94, 161, 137, 0.4);
        z-index: 10000;
        transform: translateY(100%);
        transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        direction: rtl;
        font-family: 'Rubik', Arial, sans-serif;
        border-top: 3px solid #F9F1DC;
        border-radius: 15px 15px 0 0;
    }

    .cookie-close-btn {
        position: absolute;
        top: 15px;
        left: 20px;
        background: transparent;
        border: none;
        color: white;
        font-size: 24px;
        font-weight: bold;
        cursor: pointer;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: opacity 0.2s ease;
        z-index: 10001;
    }

    .cookie-close-btn:hover {
        opacity: 0.7;
    }

    .cookie-consent-banner.show {
        transform: translateY(0);
    }

    .cookie-consent-content {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 15px;
    }

    .cookie-consent-text h3 {
        margin: 0 0 15px 0;
        font-size: 26px;
        font-weight: 800;
        font-family: 'Rubik', Arial, sans-serif;
        color: white;
        text-shadow: none;
    }

    .cookie-consent-text p {
        margin: 0 0 5px 0;
        font-size: 14px;
        opacity: 0.9;
        line-height: 1.4;
        font-weight: 300;
    }

    .cookie-consent-buttons {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        margin-bottom: 0;
        align-self: flex-end;
    }

    .cookie-consent-banner button {
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        white-space: nowrap;
        font-family: 'Rubik', Arial, sans-serif;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        text-transform: none;
    }

    .btn-accept-all {
        background: #7BC4A4;
        color: white;
        border: 2px solid #7BC4A4;
    }

    .btn-accept-all:hover {
        background: #6BB394;
        border-color: #6BB394;
        transform: translateY(-1px);
    }

    .btn-customize {
        background: #2F5C4A;
        color: white;
        border: 2px solid #2F5C4A;
    }

    .btn-customize:hover {
        background: #254A3C;
        border-color: #254A3C;
        transform: translateY(-1px);
    }

    .btn-reject {
        background: #2F5C4A;
        color: white;
        border: 2px solid #2F5C4A;
    }

    .btn-reject:hover {
        background: #254A3C;
        color: white;
        transform: translateY(-1px);
    }

    .btn-save {
        background: #7BC4A4;
        color: white;
        border: 2px solid #7BC4A4;
    }

    .btn-save:hover {
        background: #6BB394;
        border-color: #6BB394;
    }

    .btn-back {
        background: #2F5C4A;
        color: white;
        border: 2px solid #2F5C4A;
    }

    .btn-back:hover {
        background: #254A3C;
        color: white;
    }

    .cookie-consent-details {
        max-width: 1200px;
        margin: 0 auto;
    }

    .cookie-consent-details h4 {
        margin: 0 0 15px 0;
        font-size: 16px;
    }

    .cookie-types {
        margin-bottom: 20px;
    }

    .cookie-type {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 15px;
        cursor: pointer;
        position: relative;
    }

    .cookie-type input[type="checkbox"] {
        position: absolute;
        opacity: 0;
        cursor: pointer;
    }

    .checkmark {
        width: 20px;
        height: 20px;
        background: rgba(255,255,255,0.2);
        border: 2px solid rgba(255,255,255,0.5);
        border-radius: 4px;
        position: relative;
        flex-shrink: 0;
        margin-top: 2px;
    }

    .cookie-type input:checked + .checkmark {
        background: #8B6B47;
        border-color: #8B6B47;
    }

    .cookie-type input:checked + .checkmark::after {
        content: '✓';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        font-size: 12px;
        font-weight: bold;
    }

    .cookie-type input:disabled + .checkmark {
        background: #8B6B47;
        border-color: #8B6B47;
    }

    .cookie-info strong {
        display: block;
        margin-bottom: 4px;
        font-size: 14px;
    }

    .cookie-info p {
        margin: 0;
        font-size: 12px;
        opacity: 0.8;
        line-height: 1.3;
    }

    @media (max-width: 768px) {
        .cookie-consent-banner {
            padding: 20px;
            border-radius: 12px 12px 0 0;
        }
        
        .cookie-consent-content {
            flex-direction: column;
            text-align: center;
            gap: 10px;
        }
        
        .cookie-consent-buttons {
            justify-content: center;
            width: 100%;
            gap: 8px;
            margin-top: 5px;
        }
        
        .cookie-consent-banner button {
            flex: 1;
            min-width: 80px;
            padding: 10px 16px;
            font-size: 13px;
        }
        
        .cookie-close-btn {
            top: 10px;
            left: 15px;
            font-size: 20px;
        }
        
        .cookie-consent-text h3 {
            font-size: 22px;
            margin-bottom: 10px;
        }
        
        .cookie-consent-text p {
            font-size: 13px;
        }
    }


`;
document.head.appendChild(style);

// הסרת כפתור הגדרות קבוע - לא נדרש יותר

function bootCookieConsent() {
    if (!window.cookieConsent) {
        window.cookieConsent = new CookieConsent();
    }
}

// אתחול המערכת
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootCookieConsent);
} else {
    bootCookieConsent();
}

}
