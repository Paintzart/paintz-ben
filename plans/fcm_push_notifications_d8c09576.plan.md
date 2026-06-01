---
name: FCM Push Notifications
overview: הוספת Web Push (Firebase Cloud Messaging) עם רישום טוקנים ב-Firestore, שליחה דרך `firebase-admin` ב-API routes מאובטחים, קרון לתזכורת «נפתחו הזמנות» לפי לוח העסק, הוקים אחרי פעולות ניהול (אישור ידני, מוכן לאיסוף, ביטול מנהל, תזכורת תור ready, הודעה אישית מהעסק), ושליחה קבוצתית לפי עמודות נבחרות (בחירת «תור») כמו בהודעה ההמונית הקיימת.
todos:
  - id: fcm-client-sw
    content: Service Worker + רישום FCM בלקוח (VAPID) וקומפוננטת הסכמה
    status: completed
  - id: firestore-api-tokens
    content: מודל pushTokens + POST /api/push/register עם אימות orderToken
    status: completed
  - id: server-fcm-send
    content: עטיפת firebase-admin/messaging + ניקוי טוקנים מתים
    status: completed
  - id: admin-notify-api
    content: API מוגן session לשליחות אישיות (אישור, מוכן, ביטול, הודעת עסק) + שילוב אחרי dispatch
    status: completed
  - id: ready-reminder-push
    content: שילוב PUSH בזרם תזכורת עמודת ready הקיים
    status: completed
  - id: bulk-columns-push
    content: PUSH לפי עמודות נבחרות (אותה בחירת תורים כמו בהודעה ההמונית + טקסט)
    status: completed
  - id: cron-menu-open
    content: קרון + לוגיקת לוח ירושלים + מניעת כפילויות לשידור «נפתחו הזמנות»
    status: completed
  - id: rules-docs
    content: עדכון חוקי Firestore לטוקנים + בדיקות ידניות
    status: completed
isProject: false
---

# תכנית: הודעות PUSH (קבוצתיות ואישיות)

## מצב נוכחי בקוד

- פעולות הזמנה (אישור, מוכן, ביטול וכו׳) מתבצעות **מהלקוח** דרך Firestore ב-`[lib/firebase/write-remote.ts](lib/firebase/write-remote.ts)` — אין היום שרת שרץ אחרי כל שינוי.
- יש כבר `[lib/server/firebase-admin-db.ts](lib/server/firebase-admin-db.ts)` (מפתח שירות) ודפוס קרון מאובטח עם `CRON_SECRET` ב-`[app/api/cron/weekly-purge-orders/route.ts](app/api/cron/weekly-purge-orders/route.ts)`.
- מסלולי לקוח/ניהול: `APPROVE_ORDER` (מ־`pendingApproval` ל־`work`), `MARK_ORDER_READY` (ל־`ready`), `ADMIN_CANCEL_ORDER` (מחיקת הזמנה מכל עמודה — לפי הבהרתך), תזכורת וואטסאפ לעמודת «מוכן» ב-`[app/admin/page.tsx](app/admin/page.tsx)` (`readyColumnWaRecipients`), **הודעה המונית לפי עמודות שנבחרו** (אותו רעיון כמו `bulkWaRecipients`), והודעה ללקוח ב-`[ADMIN_SET_ORDER_BUSINESS_MESSAGE_TO_CUSTOMER](lib/store/app-store-actions.ts)`.
- אין Cloud Functions ב-repo; נשתמש ב-**Next.js API Routes + `firebase-admin/messaging`** כדי לא לסטות מהארכיטקטורה הקיימת.

## נוסחים להתראות (מוצגים ב-PUSH)

**אייקון:** אייקון האתר / ה-PWA (כמו ב-manifest).

**שידור כללי — נפתחו הזמנות ליום העסק הבא**

- כותרת: התפריט נפתח למחר להזמנות
- תוכן: אפשר להזמין עכשיו אוכל למחר, אפשר להזמין עד **X** היום/מחר. נשמח לראותכם.  
  - **X** — נקבע דינמית לפי ההגדרות (למשל שעת סגירת הזמנות, ובחירת נוסח «היום» או «מחר» לפי לוח העסק).

**אישור הזמנה (אחרי אישור ידני)**

- כותרת: הזמנתך (**מספר הזמנה**) אושרה
- תוכן: קיבלנו את ההזמנה שלכם והיא אושרה. נתראה בקרוב!
- הערת מוצר: הנוסח לא סופי אצל הלקוח — ניתן ללטש במימוש.

**מוכן לאיסוף**

- כותרת: הזמנתך (**מספר הזמנה**) מוכנה לאיסוף
- תוכן: אפשר להגיע לאסוף. נשמח לראותכם בקרוב.

**ביטול הזמנה (מנהל)**

- כותרת: הזמנתך (**מספר הזמנה**) בוטלה
- תוכן: לצערנו, ההזמנה שלכם בוטלה. אנחנו ממש מתנצלים! נשמח לראות אתכם בהזמנה הבאה!

**תזכורת לכל מי שממתין לאיסוף (עמודת מוכן)**

- כותרת: תזכורת: הזמנתך (**מספר הזמנה**) מחכה לאיסוף
- תוכן: ההזמנה שלך מוכנה ומחכה לאיסוף.

**הודעה לפי תורים / עמודות (טקסט חופשי)**

- כותרת: עדכון מהמסעדה
- תוכן: אותו טקסט שכותבים בהודעה ההמונית (גם ב-PUSH).

**הודעה אישית מהמסעדה (ללקוח ספציפי)**

- כותרת: עדכון מהמסעדה לגבי הזמנתך (**מספר הזמנה**)
- תוכן: הטקסט שנשלח ללקוח במערכת (כמו `businessMessageToCustomer`).

**מימוש:** **מספר הזמנה** = מספר תצוגה כמו בממשק (למשל `orderDisplayNumber`), לא בהכרח מזהה מסמך גולמי.

## ארכיטקטורה (תמצית)

```mermaid
flowchart LR
  subgraph client [דפדפן לקוח]
    SW[firebase-messaging-sw.js]
    UI[דפי אתר / מעקב הזמנה]
    UI --> SW
  end
  subgraph server [Next.js API]
    Reg[POST רישום טוקן]
    Send[POST שליחה / קרון]
    Admin[אימות session מנהל]
  end
  subgraph firebase [Firebase]
    FS[(Firestore)]
    FCM[FCM]
  end
  UI --> Reg
  Reg --> FS
  Send --> FCM
  Admin --> Send
  FS --> Send
```



## 1. תשתית FCM Web (לקוח)

- הוספת `firebase/messaging` (מודולרי) בקומפוננטות **client** בלבד.
- קובץ Service Worker ב-`[public/firebase-messaging-sw.js](public/firebase-messaging-sw.js)` שמייבא את `firebase` compat או מגדיר `onBackgroundMessage` לפי התיעוד ב-`node_modules/firebase` / מסמכי הגרסה שלכם.
- משתני סביבה: `NEXT_PUBLIC_FIREBASE_VAPID_KEY` (ממסך Cloud Messaging בקונסולת Firebase).
- UI להפעלת הרשאת התראות (כבר יש בסיס ב-`[components/pwa/use-pwa-install.ts](components/pwa/use-pwa-install.ts)`) — לחבר לרישום טוקן אחרי `Notification.permission === "granted"`.

## 2. מודל נתונים ב-Firestore

לדוגמה (שמות ניתנים לכיווץ):

- `**pushTokens`**: מסמך לכל מכשיר — `fcmToken`, `createdAt`, `topics` או שדות בוליאניים: `wantsBroadcast`, רשימת `orderTokens` (מזהי מעקב) שהמכשיר מעוניין לעקוב אחריהם.
- אינדקסים: אם מחפשים לפי `orderTokens` — `array-contains` + כללים מתאימים.

**רישום טוקן**

- `POST /api/push/register` (או דומה): גוף `{ fcmToken, orderToken? }`.
  - אם יש `orderToken`: לוודא מול Firestore שקיימת הזמנה עם אותו `token` (שאילתה בצד השרת) לפני שמירה — מונע רישום לכל הזמנה.
  - `wantsBroadcast`: ברירת מחדל true אם המשתמש הסכים במסך (מתאים ל«כל הלקוחות» = כל מי שנרשם).

**כללי אבטחה Firestore**: לא לאפשר ללקוח לקרוא את כל `pushTokens`; רישום/עדכון רק דרך ה-API (או חוקים מצומצמים מאוד). שליחת הודעות — רק דרך Admin SDK בשרת.

## 3. שכבת שליחה בשרת

- פונקציה משותפת (למשל `[lib/server/fcm-send.ts](lib/server/fcm-send.ts)`): `getMessaging()` מ-`firebase-admin/messaging`, `sendEach` / `sendEachForMulticast` לפי רשימת טוקנים, טיפול בטוקן לא חוקי (מחיקה מ-Firestore).
- אתחול Admin גם ל-Messaging (אותו credential כמו Firestore).

## 4. הודעות אישיות להזמנה (3 המצבים + שני המקרים הנוספים)

ההנחה: **לא** שולחים על כל מעבר עמודה — רק:


| אירוע                    | טריגר בקוד                                                                             | הערות                                                                                                                                                                                                                                                                                                  |
| ------------------------ | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| אישור אחרי אישור ידני    | אחרי `APPROVE_ORDER`                                                                   | לוודא שההזמנה הייתה ב-`pendingApproval` לפני הפעולה (למסור בבקשה ל-API את `previousColumn` או לבדוק בצד שרת לפני שהמסמך השתנה — הכי בטוח: קריאה ל-API **מיד אחרי** הצלחה עם צילום מצב `{ orderId, approvedFromPending: true }` מאומת מול Firestore בזמן הבקשה, או העברת snapshot מהלקוט לפני המוטציה). |
| מוכן לאיסוף              | אחרי `MARK_ORDER_READY`                                                                |                                                                                                                                                                                                                                                                                                        |
| ביטול מנהל               | אחרי `ADMIN_CANCEL_ORDER`                                                              | לפי הבהרתך — מכל עמודה; לפני המחיקה לשמור `orderToken` + טלפון לשליחה בבקשה ל-API.                                                                                                                                                                                                                     |
| תזכורת «מחכים לאיסוף»    | הזרם הקיים של תזכורת וואטסאפ לעמודת ready ב-`[app/admin/page.tsx](app/admin/page.tsx)` | להוסיף קריאה מקבילה ל-API ששולחת PUSH לכל `readyColumnWaRecipients` (אותה רשימה).                                                                                                                                                                                                                      |
| הודעה אישית מהעסק        | אחרי `ADMIN_SET_ORDER_BUSINESS_MESSAGE_TO_CUSTOMER`                                    | גוף ההודעה = הטקסט שנשמר ב-`businessMessageToCustomer`.                                                                                                                                                                                                                                                |
| הודעה לפי «תור» (עמודות) | מסך הניהול — אותו מצב כמו שליחת הודעה המונית לפי עמודות שנבחרו                         | הנמענים: כל מי שההזמנה שלו נמצאת באחת העמודות המסומנות (ממתין / בעבודה / בהכנה / מוכן וכו׳), בלי כפילויות לפי לקוח. בניגוד לתזכורת ready הקבועה — כאן **בוחרים אילו תורים** מקבלים את ה-PUSH. טקסט חופשי כמו בוואטסאפ ההמוני.                                                                          |


**אימות**

- רוט מוגן **session מנהל** (עוגיה כמו ב-`[app/api/admin/session/route.ts](app/api/admin/session/route.ts)`) — לייבא/לשתף פונקציית `verifySession` קיימת אם קיימת ב-`lib/server`, או לאמת עוגיה באותו אופן.
- גוף הבקשה: סוג אירוע + מזהים; השרת טוען טוקנים רלוונטיים מ-Firestore ושולח.

**דגש לביטול**: המסמך נמחק — חייבים לשלוח את פרטי ההזמנה (לפחות `orderToken`) **בבקשה** מהלקוח אחרי שהמוטציה הצליחה, או לשמור עותק ב-API לפני מחיקה (עדיף payload מהלקוח עם אימות session).

## 4b. שידור קבוצתי לפי עמודות (בחירת תור)

- **תיאור מוצר**: כמו היום שולחים הודעה לכמה לקוחות לפי העמודה שבה נמצאת ההזמנה — רק שבמקום (או בנוסף ל) וואטסאפ תהיה אפשרות לשלוח **PUSH** לאותה קבוצה.
- **UI**: להשתלב בפאנל ההודעה ההמונית הקיים — אחרי שמסמנים עמודות וכותבים טקסט, כפתור/אפשרות «שלח גם התראת דחיפה» (או שליחה כפולה וואטסאפ + PUSH), כדי שלא לשכפל מסכים.
- **לוגיקת נמענים**: זהה לרשימת הנמענים של ההודעה ההמונית (לקוחות ייחודיים מההזמנות בעמודות הנבחרות, עם טלפון תקין / מזהי הזמנה לצורך מיפוי לטוקני מכשיר).
- **אימות**: רק מנהל מחובר (אותו session כמו שאר פעולות אדמין).

## 5. שידור קבוצתי — «נפתחו הזמנות» ב-`orderOpenTime` (למשל 14:30)

- לוגיקת זמן: להשתמש ב-`[lib/business-schedule.ts](lib/business-schedule.ts)` (`JERUSALEM_TZ`, `activeScheduleForCalendarIso`, `orderOpenTime`, scopes `eveBefore` / `sameDay`) כדי להחליט **מתי בדיוק** נשלחת התזכורת (הרגע שבו נפתח חלון ההזמנות ליום העסק הבא — כפי שהגדרתם במערכת, לא קשיח 14:30 בקוד).
- קרון חדש: למשל `[app/api/cron/menu-open-broadcast/route.ts](app/api/cron/menu-open-broadcast/route.ts)` עם אותו `CRON_SECRET`.
- תדירות: מומלץ **כל 5–15 דקות** (UTC ב-`vercel.json`) והקוד בודק «האם עכשיו בירושלים זה רגע הפתיחה + יום עסקים רלוונטי»; **מניעת כפילויות** — מסמך ב-Firestore כמו `broadcastLog/{dateKey}` או `settings/lastMenuOpenPushIso`.
- תוכן וכותרת: ראו **«נוסחים להתראות»** — שידור כללי; מילוי **X** ו«היום/מחר» לפי לוח והגדרות סגירה.

## 6. שינויים ב-UI

- מסך לקוח (בית / ניוזלטר / הגדרות PWA): הסכמה ל«התראות על תפריט ומבצעים» + רישום broadcast.
- דף מעקב הזמנה `[app/(customer)/order/[token]/page.tsx](app/(customer)`/order/[token]/page.tsx): אחרי טעינה מוצלחת — הצעה להפעיל התראות עבור **ההזמנה הזו** (רישום `orderToken`).
- אדמין: תזכורת ready — שילוב בזרם הוואטסאפ; הודעה לפי עמודות — טוגל או כפתור «שלח PUSH» לצד שליחת הוואטסאפ ההמוני.

## 7. פריסה וסביבה

- `firebase-admin` כבר קיים; יש לוודא שבפרודקשן מוגדרים מפתח שירות + VAPID.
- עדכון `[vercel.json](vercel.json)` עם cron לנתיב החדש.
- בדיקות ידניות: הרשאות דפדפן, קבלת PUSH ברקע (Chrome), ובדיקת שליחה מ-local עם משתני env.

## סיכונים ומגבלות

- **iOS Safari / PWA**: התנהגות שונה מהדפדפן לשולחן עבודה; כדאי לתעד למשתמשים «מומלץ התקנה למסך הבית».
- **ספאם**: שידור קבוצתי רק למנויים (`wantsBroadcast`); לא לשלוח לכל רשימת הדיוור בטלפון בלי מכשיר רשום.

## קבצים עיקריים לגעת בהם

- חדש: `public/firebase-messaging-sw.js`, `lib/server/fcm-send.ts`, `app/api/push/register/route.ts`, `app/api/admin/push/notify/route.ts` (או מבנה דומה), `app/api/cron/menu-open-broadcast/route.ts`.
- עריכה: `[lib/store/firebase-app-store.tsx](lib/store/firebase-app-store.tsx)` או נקודות ה-`dispatch` אחרי פעולות רלוונטיות, `[app/admin/page.tsx](app/admin/page.tsx)` (תזכורת ready + הודעה המונית לפי עמודות + הודעה אישית), דף מעקב הזמנה, `[firestore.rules](firestore.rules)` אם קיים.

