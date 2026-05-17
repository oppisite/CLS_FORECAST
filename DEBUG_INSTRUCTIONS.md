# Debug Instructions - วิธีตรวจสอบปัญหา Sidebar

## วิธีใช้ Debug Tools

### 1. เปิด Application
```bash
ng serve
```
เปิด browser ไปที่ `http://localhost:4200`

### 2. ใช้ Debug HTML Page
เปิดไฟล์ `debug_sidebar_test.html` ใน browser เพื่อตรวจสอบ:
- Session Storage
- Layout Configuration
- Sidebar Element
- Menu Items

### 3. ใช้ Console Script
คัดลอกเนื้อหาจากไฟล์ `debug_sidebar_console.js` แล้ว paste ใน browser console

### 4. ใช้ Debug Buttons ใน Application
เมื่อเปิด application แล้ว จะมี debug buttons ด้านขวาบน:
- **Debug Session** - ตรวจสอบ session data
- **Refresh Menu** - บังคับ refresh menu
- **Clear Session** - ลบ session
- **Test Menu** - สร้าง test menu
- **Use Default** - ใช้ default menu
- **Check State** - ตรวจสอบ sidebar state
- **Check Storage** - ตรวจสอบ session storage
- **Check Service** - ตรวจสอบ menu service

## การตรวจสอบปัญหา

### 1. ตรวจสอบ Session
```javascript
// ใน browser console
checkSessionStorage();
```

**ผลลัพธ์ที่ควรเห็น:**
- ✅ Session found - มี session
- ❌ No session found - ไม่มี session

### 2. ตรวจสอบ Layout
```javascript
// ใน browser console
checkLayout();
```

**ผลลัพธ์ที่ควรเห็น:**
- ✅ Vertical layout detected - layout ถูกต้อง
- ⚠️ Layout type: [type] - layout อาจมีปัญหา

### 3. ตรวจสอบ Sidebar Element
```javascript
// ใน browser console
checkSidebarElement();
```

**ผลลัพธ์ที่ควรเห็น:**
- ✅ Sidebar element found - sidebar ถูกโหลด
- ❌ Sidebar element not found - sidebar ไม่ถูกโหลด

### 4. ตรวจสอบ Menu Items
```javascript
// ใน browser console
checkMenuItems();
```

**ผลลัพธ์ที่ควรเห็น:**
- ✅ Menu items found: [count] - มี menu items
- ⚠️ Menu items array is empty - menu items ว่าง
- ❌ No menu items found - ไม่มี menu items

## การแก้ไขปัญหา

### 1. ถ้าไม่มี Session
```javascript
// ล้าง session และ login ใหม่
fixSidebarIssues();
```

### 2. ถ้า Menu ไม่แสดง
```javascript
// สร้าง test menu
createTestMenu();

// หรือใช้ default menu
useDefaultMenu();
```

### 3. ถ้า Sidebar ไม่แสดง
```javascript
// ตรวจสอบ layout
checkLayout();

// ตรวจสอบ sidebar element
checkSidebarElement();
```

## Console Logs ที่ควรเห็น

### เมื่อโหลดจาก Session
```
Loading menu from session: [...]
Sidebar ngOnInit - Current menuItems: [...]
```

### เมื่อใช้ Default Menu
```
No valid menu in session, using default MENU
```

### เมื่อมีปัญหา
```
Session expired, clearing session and redirecting to login
API error, using default MENU as fallback
```

## การทดสอบ Step by Step

### 1. ทดสอบ Login
1. เปิด `http://localhost:4200`
2. Login เข้าระบบ
3. ตรวจสอบ session storage
4. เข้าหน้า `/pages`

### 2. ทดสอบ Sidebar
1. ตรวจสอบว่า sidebar แสดงหรือไม่
2. ตรวจสอบ menu items
3. ตรวจสอบ console logs

### 3. ทดสอบ Navigation
1. คลิก menu items
2. ตรวจสอบว่า navigate ถูกต้องหรือไม่
3. ตรวจสอบ active menu state

## การใช้ Debug Functions

### 1. ตรวจสอบทั้งหมด
```javascript
checkAll();
```

### 2. ทดสอบ Sidebar Functions
```javascript
testSidebarFunctions();
```

### 3. ตรวจสอบ Console Logs
```javascript
checkConsoleLogs();
```

## การแก้ไขปัญหาเฉพาะ

### 1. Session หมดอายุ
```javascript
// ล้าง session และ reload
sessionStorage.clear();
window.location.reload();
```

### 2. Menu ไม่ตรงกับ Session
```javascript
// ใช้ debug buttons ใน application
// หรือใช้ console functions
createTestMenu();
useDefaultMenu();
```

### 3. Sidebar ไม่แสดง
```javascript
// ตรวจสอบ layout type
console.log('Layout type:', document.documentElement.getAttribute('data-layout'));

// ตรวจสอบ sidebar element
console.log('Sidebar element:', document.querySelector('app-sidebar'));
```

## หมายเหตุ

- Debug buttons จะแสดงเฉพาะใน development mode
- Console logs จะช่วยในการ debug
- Session จะหมดอายุใน 24 ชั่วโมง
- Menu จะถูกเก็บใน session storage
- ใช้ debug tools เพื่อหาสาเหตุของปัญหา
