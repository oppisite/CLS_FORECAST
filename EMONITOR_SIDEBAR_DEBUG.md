# Emonitor Sidebar Debug

## ปัญหาที่พบ

- `http://localhost:4200/pages` มี sidebar ✅
- `http://localhost:4200/emonitor` ไม่มี sidebar ❌

## สาเหตุของปัญหา

### 1. Routing Configuration
```typescript
// app-routing.module.ts - BEFORE
const routes: Routes = [
  { path: 'pages', component: LayoutComponent, loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule), canActivate: [AuthGuard] },
  // ไม่มี route สำหรับ emonitor โดยตรง
];

// app-routing.module.ts - AFTER
const routes: Routes = [
  { path: 'pages', component: LayoutComponent, loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule), canActivate: [AuthGuard] },
  { path: 'emonitor', component: LayoutComponent, loadChildren: () => import('./pages/emonitor/emonitor.module').then(m => m.EmonitorModule), canActivate: [AuthGuard] },
];
```

### 2. การทำงานของ Routing

#### ก่อนแก้ไข:
```
/pages → LayoutComponent → PagesModule → EmonitorModule
/emonitor → ไม่มี route → 404 หรือ redirect
```

#### หลังแก้ไข:
```
/pages → LayoutComponent → PagesModule → EmonitorModule
/emonitor → LayoutComponent → EmonitorModule (โดยตรง)
```

## การแก้ไขที่ทำ

### 1. เพิ่ม Route สำหรับ Emonitor
```typescript
{ 
  path: 'emonitor', 
  component: LayoutComponent, 
  loadChildren: () => import('./pages/emonitor/emonitor.module').then(m => m.EmonitorModule), 
  canActivate: [AuthGuard] 
}
```

### 2. ตรวจสอบ Layout Component
```typescript
// layout.component.ts
export class LayoutComponent implements OnInit {
  layoutType!: string;

  ngOnInit(): void {
    this.store.select('layout').subscribe((data) => {
      this.layoutType = data.LAYOUT;
      // ตั้งค่า layout attributes
    })
  }
}
```

### 3. ตรวจสอบ Sidebar Component
```typescript
// sidebar.component.ts
export class SidebarComponent implements OnInit {
  ngOnInit(): void {
    this.checkSessionExpiration();
    this.loadMenuFromSession();
    // โหลด menu จาก session
  }
}
```

## การทดสอบ

### 1. ทดสอบ Routing
```bash
# เปิด application
ng serve

# ทดสอบ URLs
http://localhost:4200/pages          # ควรมี sidebar
http://localhost:4200/emonitor       # ควรมี sidebar (หลังแก้ไข)
http://localhost:4200/emonitor/Home  # ควรมี sidebar
```

### 2. ตรวจสอบ Console Logs
```javascript
// ใน browser console
console.log('Layout type:', document.documentElement.getAttribute('data-layout'));
console.log('Sidebar element:', document.querySelector('app-sidebar'));
console.log('Current URL:', window.location.pathname);
```

### 3. ตรวจสอบ Session
```javascript
// ใน browser console
console.log('Session storage:', sessionStorage.getItem('userSession'));
console.log('Menu data:', sessionStorage.getItem('sidebarMenu'));
```

## Debug Functions

### 1. ตรวจสอบ Layout
```javascript
function checkEmonitorLayout() {
  console.log('=== Emonitor Layout Check ===');
  console.log('URL:', window.location.href);
  console.log('Pathname:', window.location.pathname);
  console.log('Layout type:', document.documentElement.getAttribute('data-layout'));
  console.log('Sidebar element:', document.querySelector('app-sidebar'));
  console.log('Router outlet:', document.querySelector('router-outlet'));
}
```

### 2. ตรวจสอบ Session
```javascript
function checkEmonitorSession() {
  console.log('=== Emonitor Session Check ===');
  const userSession = sessionStorage.getItem('userSession');
  const sidebarMenu = sessionStorage.getItem('sidebarMenu');
  console.log('User session:', userSession ? JSON.parse(userSession) : 'null');
  console.log('Sidebar menu:', sidebarMenu ? JSON.parse(sidebarMenu) : 'null');
}
```

### 3. ตรวจสอบ Menu Items
```javascript
function checkEmonitorMenu() {
  console.log('=== Emonitor Menu Check ===');
  const sidebarElement = document.querySelector('app-sidebar');
  if (sidebarElement && sidebarElement.menuItems) {
    console.log('Menu items:', sidebarElement.menuItems);
    console.log('Menu items length:', sidebarElement.menuItems.length);
  } else {
    console.log('No sidebar element or menu items found');
  }
}
```

## การแก้ไขเพิ่มเติม

### 1. ถ้า Sidebar ยังไม่แสดง
```javascript
// ตรวจสอบ CSS
console.log('Sidebar display:', getComputedStyle(document.querySelector('app-sidebar')).display);
console.log('Sidebar visibility:', getComputedStyle(document.querySelector('app-sidebar')).visibility);
```

### 2. ถ้า Menu ไม่แสดง
```javascript
// ใช้ debug functions
const sidebar = document.querySelector('app-sidebar');
if (sidebar) {
  sidebar.debugSession();
  sidebar.checkSidebarState();
  sidebar.checkSessionStorage();
}
```

### 3. ถ้า Layout ไม่ถูกต้อง
```javascript
// ตรวจสอบ layout attributes
const html = document.documentElement;
console.log('data-layout:', html.getAttribute('data-layout'));
console.log('data-bs-theme:', html.getAttribute('data-bs-theme'));
console.log('data-sidebar:', html.getAttribute('data-sidebar'));
```

## ผลลัพธ์ที่คาดหวัง

### หลังแก้ไข:
- ✅ `http://localhost:4200/emonitor` มี sidebar
- ✅ `http://localhost:4200/emonitor/Home` มี sidebar
- ✅ `http://localhost:4200/emonitor/EmoIndicator` มี sidebar
- ✅ Menu items แสดงผลถูกต้อง
- ✅ Session ทำงานถูกต้อง

### Console Logs ที่ควรเห็น:
```
Loading menu from session: [...]
Sidebar ngOnInit - Current menuItems: [...]
Layout type: vertical
Sidebar element: [object HTMLElement]
```

## หมายเหตุ

- การแก้ไขนี้จะทำให้ `/emonitor` ใช้ `LayoutComponent` โดยตรง
- Sidebar จะถูกโหลดเหมือนกับ `/pages`
- Session และ menu จะทำงานเหมือนกัน
- ตรวจสอบ console logs เพื่อยืนยันการทำงาน
