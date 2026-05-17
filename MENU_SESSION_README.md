# Menu Session Management System

## ภาพรวม

ระบบนี้ได้รับการปรับปรุงให้ sidebar สามารถรับ menu จาก session ที่เก็บไว้ได้ โดยไม่ต้องโหลดจาก API ทุกครั้ง

## โครงสร้างการทำงาน

### 1. Permission Component (`src/app/account/permission/permission.component.ts`)

#### หน้าที่หลัก:
- รับข้อมูลจาก backend ที่มี 3 ตาราง: `tb_group`, `tb_menu`, `tb_submenu`
- แปลงข้อมูลเป็น `MenuItem[]` structure
- เก็บข้อมูลใน session

#### Interface ใหม่:
```typescript
interface TbGroup {
  IDA: number;
  GROUP_NAME: string;
  menu_group: string;
  menu_group_icon: string;
  menu_group_controller: string;
  menu_group_actionname: string;
  sort_index: number;
  isTitle: boolean;
  isCollapsed: boolean;
  Activefact: boolean;
  // ... other fields
}

interface TbMenu {
  IDA: number;
  menu_name: string;
  menu_icon: string;
  menu_controller: string;
  menu_actionname: string;
  menu_group: string;
  isCollapsed: boolean;
  menu_active: boolean;
  sort_index: number;
}

interface TbSubmenu {
  IDA: number;
  submenu_name: string;
  submenu_icon: string;
  submenu_controller: string;
  submenu_actionname: string;
  submenu_active: boolean;
  menu_id: number;
  sort_index: number;
}
```

#### ฟังก์ชันหลัก:
- `convertToMenuStructure()`: แปลงข้อมูลจาก backend เป็น MenuItem[]
- `buildMenuLink()`: สร้าง link สำหรับ menu
- `findParentMenuInGroups()`: หา parent menu ในโครงสร้าง

### 2. Session Service (`src/app/core/services/session.service.ts`)

#### หน้าที่หลัก:
- จัดการ session storage
- เก็บและดึงข้อมูล menu, permission, token
- ตรวจสอบ session expiration

#### ฟังก์ชันหลัก:
```typescript
// เก็บข้อมูล session ทั้งหมด
createNewSession(token: string, permissionId: string, permissionData: any, authenData: any, menuData: MenuItem[]): void

// ดึงข้อมูล session
getUserSession(): UserSession | null

// ตรวจสอบ session validity
hasValidSession(): boolean

// อัปเดต session
updateSession(updates: Partial<UserSession>): void
```

### 3. Sidebar Component (`src/app/layouts/layouts/sidebar/sidebar.component.ts`)

#### หน้าที่หลัก:
- โหลด menu จาก session เป็นอันดับแรก
- Fallback ไปใช้ API หรือ default menu ถ้าไม่มี session
- จัดการ session expiration

#### ฟังก์ชันหลัก:
```typescript
// โหลด menu จาก session
private loadMenuFromSession(): void

// ตรวจสอบ session expiration
private checkSessionExpiration(): void

// Refresh menu จาก session
refreshMenuFromSession(): void

// Debug function
debugSession(): void
```

### 4. Menu Service (`src/app/core/services/menu.service.ts`)

#### หน้าที่หลัก:
- จัดการ menu items ผ่าน BehaviorSubject
- ทำงานร่วมกับ session service
- แปลงข้อมูลจาก API เป็น menu structure

#### ฟังก์ชันหลัก:
```typescript
// โหลด menu จาก session storage
private loadMenuFromStorage(): void

// อัปเดต menu items
updateMenuItems(menuItems: MenuItem[]): void

// Refresh menu จาก session
refreshMenuFromSession(): void
```

## การทำงานของระบบ

### 1. การ Login และ Permission Selection
1. User login ผ่าน permission component
2. ระบบเรียก API เพื่อดึงข้อมูล menu ตาม permission
3. แปลงข้อมูลเป็น MenuItem[] structure
4. เก็บข้อมูลใน session storage

### 2. การโหลด Sidebar
1. ตรวจสอบ session expiration
2. โหลด menu จาก session เป็นอันดับแรก
3. ถ้าไม่มี session หรือ menu ให้ใช้ default menu
4. Fallback ไปใช้ API ถ้าจำเป็น

### 3. การจัดการ Session
- Session มีอายุ 24 ชั่วโมง
- ตรวจสอบ session validity ทุกครั้งที่โหลด sidebar
- Clear session และ redirect ไป login ถ้า session หมดอายุ

## การใช้งาน

### Debug Session
```typescript
// ใน sidebar component
this.debugSession(); // แสดงข้อมูล session ใน console
```

### Force Refresh Menu
```typescript
// ใน sidebar component
this.forceRefreshMenu(); // บังคับ refresh menu จาก session
```

### อัปเดต Menu ใน Session
```typescript
// ใน sidebar component
this.updateMenuInSession(newMenuItems); // อัปเดต menu ใน session
```

## การปรับปรุงในอนาคต

1. **Caching Strategy**: เพิ่ม caching mechanism สำหรับ menu data
2. **Real-time Updates**: เพิ่ม WebSocket สำหรับ real-time menu updates
3. **Menu Permissions**: เพิ่มการตรวจสอบ permission ในระดับ menu item
4. **Menu Customization**: เพิ่มความสามารถในการ customize menu ตาม user preference

## Troubleshooting

### ปัญหาที่พบบ่อย:
1. **Menu ไม่แสดง**: ตรวจสอบ session validity และ menu data
2. **Session หมดอายุ**: ระบบจะ redirect ไป login อัตโนมัติ
3. **Menu ไม่ตรงกับ permission**: ตรวจสอบ API response และ data mapping

### Debug Steps:
1. เรียก `debugSession()` ใน sidebar component
2. ตรวจสอบ console logs
3. ตรวจสอบ session storage ใน browser dev tools
4. ตรวจสอบ API response
