# Debug Menu Session System

## ปัญหาที่พบ
เมื่อ inspect หน้าบ้าน ข้อมูล menuItems ยังคงแสดง menu จากไฟล์ `menu.ts` แทนที่จะใช้ข้อมูลจาก session

## สาเหตุของปัญหา
1. Sidebar component ยังคงใช้ `MENU` จากไฟล์ `menu.ts` เป็น fallback
2. ไม่มีการตรวจสอบ session ก่อนที่จะใช้ default menu
3. Menu service อาจจะไม่โหลดข้อมูลจาก session อย่างถูกต้อง

## การแก้ไขที่ทำ

### 1. แก้ไข Sidebar Component
- เปลี่ยน fallback จาก `MENU` เป็น empty array `[]`
- เพิ่ม debug logs เพื่อติดตามการโหลด menu
- เพิ่ม environment property สำหรับ debug buttons

### 2. เพิ่ม Debug Functions
```typescript
// Debug session data
debugSession(): void

// Force refresh menu from session
forceRefreshMenu(): void

// Clear session and reload
clearSessionAndReload(): void

// Create test menu data
createTestMenuData(): void
```

### 3. เพิ่ม Debug Buttons (เฉพาะ development)
- Debug Session: แสดงข้อมูล session ใน console
- Refresh Menu: บังคับ refresh menu จาก session
- Clear Session: ลบ session และ reload menu
- Test Menu: สร้าง test menu data

## วิธีการทดสอบ

### 1. เปิด Developer Tools
1. กด F12 หรือ right-click → Inspect
2. ไปที่ Console tab

### 2. ทดสอบ Debug Functions
```javascript
// ใน browser console
// เรียก debug functions จาก sidebar component
const sidebar = document.querySelector('app-sidebar');
if (sidebar) {
  sidebar.debugSession();
  sidebar.forceRefreshMenu();
  sidebar.clearSessionAndReload();
  sidebar.createTestMenuData();
}
```

### 3. ตรวจสอบ Session Storage
1. ไปที่ Application tab ใน Developer Tools
2. เลือก Session Storage
3. ตรวจสอบ key: `userSession`, `sidebarMenu`

### 4. ตรวจสอบ Console Logs
ดู console logs ที่เพิ่มเข้ามา:
- `Loading menu from session: [...]`
- `No valid menu in session, using empty menu`
- `Sidebar ngOnInit - Current menuItems: [...]`

## การตรวจสอบว่าแก้ไขแล้ว

### 1. ตรวจสอบ Menu Items
```javascript
// ใน console
const sidebar = document.querySelector('app-sidebar');
console.log('Menu Items:', sidebar.menuItems);
```

### 2. ตรวจสอบ Session
```javascript
// ใน console
console.log('Session Storage:', sessionStorage.getItem('userSession'));
console.log('Menu Data:', sessionStorage.getItem('sidebarMenu'));
```

### 3. ทดสอบ Clear Session
1. กดปุ่ม "Clear Session" ใน debug panel
2. ตรวจสอบว่า menu หายไป
3. ตรวจสอบ console logs

### 4. ทดสอบ Create Test Menu
1. กดปุ่ม "Test Menu" ใน debug panel
2. ตรวจสอบว่า menu ใหม่ปรากฏขึ้น
3. ตรวจสอบ session storage

## การแก้ไขเพิ่มเติม

### ถ้ายังมีปัญหา:

1. **ตรวจสอบ Permission Component**
   - ตรวจสอบว่า `convertToMenuStructure()` ทำงานถูกต้อง
   - ตรวจสอบว่า session ถูกเก็บอย่างถูกต้อง

2. **ตรวจสอบ Session Service**
   - ตรวจสอบว่า `hasValidSession()` ทำงานถูกต้อง
   - ตรวจสอบว่า `getUserSession()` คืนค่าถูกต้อง

3. **ตรวจสอบ Menu Service**
   - ตรวจสอบว่า `loadMenuFromStorage()` ทำงานถูกต้อง
   - ตรวจสอบว่า `updateMenuItems()` เก็บข้อมูลใน session

### Debug Commands:
```javascript
// ตรวจสอบ session service
const sessionService = window.angular.getService('SessionService');
console.log('Has valid session:', sessionService.hasValidSession());
console.log('User session:', sessionService.getUserSession());

// ตรวจสอบ menu service
const menuService = window.angular.getService('MenuService');
console.log('Current menu items:', menuService.getCurrentMenuItems());
console.log('Has menu in session:', menuService.hasMenuInSession());
```

## ผลลัพธ์ที่คาดหวัง

หลังจากแก้ไขแล้ว:
1. Menu จะโหลดจาก session เป็นอันดับแรก
2. ถ้าไม่มี session จะแสดง empty menu
3. Debug buttons จะช่วยในการทดสอบ
4. Console logs จะแสดงการทำงานของระบบ

## การลบ Debug Features

เมื่อระบบทำงานปกติแล้ว สามารถลบ debug features ได้:

1. ลบ debug buttons จาก template
2. ลบ debug functions จาก component
3. ลบ debug logs
4. ลบ environment property
