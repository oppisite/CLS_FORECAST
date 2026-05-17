# ปัญหา Sidebar ในหน้า Pages

## ปัญหาที่พบ

1. **เมื่อเข้า `/pages` ไม่มี sidebar แสดง**
2. **Menu ไม่ตรงกับ session** - แสดง menu จากไฟล์แทน session

## การวิเคราะห์ปัญหา

### 1. การ Routing
```typescript
// app-routing.module.ts
{ 
  path: 'pages', 
  component: LayoutComponent, 
  loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule), 
  canActivate: [AuthGuard] 
}
```

- Route `/pages` ใช้ `LayoutComponent` ซึ่งควรจะมี sidebar
- Layout component จะเลือก layout ตาม `layoutType` (vertical, horizontal, etc.)

### 2. การโหลด Menu
```typescript
// sidebar.component.ts
ngOnInit(): void {
  this.checkSessionExpiration();
  this.loadMenuFromSession();
  // ...
}
```

- Sidebar จะโหลด menu จาก session ก่อน
- ถ้าไม่มี session จะใช้ default MENU

### 3. Session Management
```typescript
// permission.component.ts
selectPermission(permission: PersonalGroupPermission): void {
  // โหลด menu จาก backend
  // แปลงเป็น MenuItem[]
  // เก็บใน session
  this.router.navigate(['/pages']);
}
```

## สาเหตุที่เป็นไปได้

### 1. Session ไม่ถูกเก็บหรือหมดอายุ
- ตรวจสอบว่า session ถูกเก็บหลังจาก login หรือไม่
- ตรวจสอบว่า session หมดอายุหรือไม่

### 2. Layout ไม่ถูกต้อง
- ตรวจสอบว่า layout type เป็น 'vertical' หรือไม่
- ตรวจสอบว่า sidebar component ถูกโหลดหรือไม่

### 3. Menu ไม่ตรงกับ Session
- ตรวจสอบว่า menu ถูกแปลงจาก backend อย่างถูกต้องหรือไม่
- ตรวจสอบว่า menu ถูกเก็บใน session หรือไม่

## วิธีแก้ไข

### 1. ตรวจสอบ Session
```javascript
// ใน browser console
console.log('Session Storage:', sessionStorage.getItem('userSession'));
console.log('Menu Data:', sessionStorage.getItem('sidebarMenu'));
```

### 2. ตรวจสอบ Layout
```javascript
// ใน browser console
console.log('Layout Type:', document.documentElement.getAttribute('data-layout'));
console.log('Sidebar Element:', document.querySelector('app-sidebar'));
```

### 3. ตรวจสอบ Menu Items
```javascript
// ใน browser console
const sidebar = document.querySelector('app-sidebar');
if (sidebar) {
  console.log('Menu Items:', sidebar.menuItems);
  console.log('Menu Items Length:', sidebar.menuItems.length);
}
```

### 4. ใช้ Debug Functions
```javascript
// ใน browser console
const sidebar = document.querySelector('app-sidebar');
if (sidebar) {
  sidebar.checkSidebarState();
  sidebar.checkSessionStorage();
  sidebar.checkMenuService();
}
```

## Debug Buttons ที่เพิ่ม

### 1. Check State
- ตรวจสอบ sidebar state
- แสดง menuItems, session data, current URL

### 2. Check Storage
- ตรวจสอบ session storage
- แสดง userSession, sidebarMenu, selectedPermission, authToken

### 3. Check Service
- ตรวจสอบ menu service
- แสดง current menu items และ session status

## การทดสอบ

### 1. ทดสอบ Session
1. Login เข้าระบบ
2. ตรวจสอบ session storage
3. เข้าหน้า `/pages`
4. ตรวจสอบ sidebar

### 2. ทดสอบ Menu
1. ตรวจสอบ menu items ใน sidebar
2. เปรียบเทียบกับ session data
3. ตรวจสอบ console logs

### 3. ทดสอบ Layout
1. ตรวจสอบ layout type
2. ตรวจสอบ sidebar element
3. ตรวจสอบ CSS classes

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

## การแก้ไขเพิ่มเติม

### 1. ถ้า Session หมดอายุ
- ลบ session และ login ใหม่
- ตรวจสอบ session expiration time

### 2. ถ้า Menu ไม่ตรง
- ตรวจสอบ backend response
- ตรวจสอบ menu transformation
- ตรวจสอบ session storage

### 3. ถ้า Sidebar ไม่แสดง
- ตรวจสอบ layout component
- ตรวจสอบ CSS styles
- ตรวจสอบ component loading

## หมายเหตุ

- Debug buttons จะแสดงเฉพาะใน development mode
- Console logs จะช่วยในการ debug
- Session จะหมดอายุใน 24 ชั่วโมง
- Menu จะถูกเก็บใน session storage
