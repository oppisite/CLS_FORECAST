# ระบบจัดการ Menu และ Permission

## ภาพรวม

ระบบนี้ถูกออกแบบมาเพื่อจัดการสิทธิ์การเข้าถึงและเมนูในแอปพลิเคชัน โดยจะดึงข้อมูลจากฐานข้อมูลและแปลงเป็นเมนูที่ใช้ใน sidebar

## โครงสร้างการทำงาน

### 1. การเลือก Permission (Permission Selection)

เมื่อผู้ใช้เลือก permission ในหน้า `permission.component.ts`:

1. ระบบจะเรียก API `environment.GET_MENU` พร้อมส่ง:
   - `TOKEN`: token ของผู้ใช้
   - `PERMISSION_ID`: ID ของ permission ที่เลือก

2. API จะส่งคืนข้อมูล 3 ส่วน:
   - `List_permission_group`: ข้อมูลกลุ่ม permission
   - `List_permission_menu`: ข้อมูลเมนูที่อนุญาต
   - `List_permission_submenu`: ข้อมูล submenu ที่อนุญาต

### 2. การแปลงข้อมูล (Data Mapping)

`MenuService` จะแปลงข้อมูลจาก API เป็นโครงสร้างเมนูที่ใช้ใน sidebar:

```typescript
// โครงสร้างข้อมูลที่ได้จาก API
interface MenuResponse {
  List_permission_group: PermissionGroup[];
  List_permission_menu: PermissionMenu[];
  List_permission_submenu: PermissionSubmenu[];
}

// โครงสร้างเมนูที่ใช้ใน sidebar
interface MenuItem {
  id?: number;
  label?: string;
  icon?: string;
  link?: string;
  subItems?: MenuItem[];
  parentId?: number;
  isTitle?: boolean;
  isLayout?: boolean;
}
```

### 3. การจัดเก็บ Session

ข้อมูลทั้งหมดจะถูกจัดเก็บใน session storage ผ่าน `SessionService`:

- Token ของผู้ใช้
- ข้อมูล Permission ที่เลือก
- ข้อมูล Authentication
- ข้อมูล Menu ที่แปลงแล้ว

## ไฟล์ที่เกี่ยวข้อง

### Core Services

1. **`src/app/core/services/menu.service.ts`**
   - จัดการการดึงข้อมูล menu จาก API
   - แปลงข้อมูลจากฐานข้อมูลเป็น menu items
   - จัดการ menu state ในแอปพลิเคชัน

2. **`src/app/core/services/session.service.ts`**
   - จัดการ session storage
   - เก็บและดึงข้อมูล session ของผู้ใช้
   - ตรวจสอบความถูกต้องของ session

3. **`src/app/core/services/auth.service.ts`**
   - จัดการการยืนยันตัวตน
   - เก็บข้อมูล permission ที่เลือก

### Data Files

4. **`src/app/core/data/menu-mapping.ts`**
   - เก็บข้อมูล mapping ของ menu items
   - กำหนดชื่อ, icon, และ link ของแต่ละ menu
   - Helper functions สำหรับค้นหาข้อมูล menu

### Components

5. **`src/app/account/permission/permission.component.ts`**
   - หน้าเลือก permission
   - เรียก API เพื่อดึง menu ตาม permission
   - จัดเก็บ session และ navigate ไปหน้าหลัก

## โครงสร้างฐานข้อมูล

### tb_permission_group
```sql
SELECT TOP (1000) [IDA]
      ,[GroupId]
      ,[GroupMenuId]
      ,[Activefact]
      ,[Create_Date]
      ,[Create_By]
      ,[Update_Date]
      ,[Update_By]
FROM [CLS_MONITOR].[dbo].[tb_permission_group]
```

### tb_permission_menu
```sql
SELECT TOP (1000) [IDA]
      ,[GroupId]
      ,[menuId]
      ,[Activefact]
      ,[Create_Date]
      ,[Create_By]
      ,[Update_Date]
      ,[Update_By]
FROM [CLS_MONITOR].[dbo].[tb_permission_menu]
```

### tb_permission_submenu
```sql
SELECT TOP (1000) [IDA]
      ,[GroupId]
      ,[SubmenuId]
      ,[Activefact]
      ,[Create_Date]
      ,[Create_By]
      ,[Update_Date]
      ,[Update_By]
FROM [CLS_MONITOR].[dbo].[tb_permission_submenu]
```

## การใช้งาน

### 1. การเลือก Permission

```typescript
// ใน permission.component.ts
selectPermission(permission: PersonalGroupPermission): void {
  this.menuService.getMenuByPermission(permission.Group_Id, this.token)
    .subscribe({
      next: (menuData) => {
        // เก็บ session และ navigate
        this.sessionService.createNewSession(
          this.token,
          permission.Group_Id,
          permission,
          this.authen,
          menuData
        );
        this.router.navigate(['/pages']);
      }
    });
}
```

### 2. การดึง Menu ใน Sidebar

```typescript
// ใน sidebar component
ngOnInit() {
  this.menuService.menuItems.subscribe(menuItems => {
    this.menuData = menuItems;
  });
}
```

### 3. การตรวจสอบ Session

```typescript
// ตรวจสอบว่ามี session อยู่หรือไม่
if (this.sessionService.hasValidSession()) {
  // ดึงข้อมูล session
  const session = this.sessionService.getUserSession();
  // ใช้งานข้อมูล
}
```

## การตั้งค่า Environment

ใน `src/environments/environment.ts`:

```typescript
export const environment = {
  // ... other configs
  GET_MENU: 'https://localhost:44389/GET_DATA/GetMenu',
  // ... other configs
};
```

## การเพิ่ม Menu ใหม่

เพื่อเพิ่ม menu ใหม่ ให้แก้ไขไฟล์ `src/app/core/data/menu-mapping.ts`:

1. เพิ่มข้อมูลใน `MENU_MAPPING` array
2. กำหนด groupId, menuId, submenuId ตามโครงสร้างฐานข้อมูล
3. กำหนดชื่อ, icon, และ link ที่เหมาะสม

## การ Debug

ระบบมีการ log ข้อมูลในขั้นตอนต่างๆ:

- การเรียก API: `console.log('Calling GET_MENU API with:', requestData)`
- ข้อมูลที่ได้จาก API: `console.log('Raw menu response:', response)`
- ข้อมูลที่แปลงแล้ว: `console.log('Mapped menu data:', menuData)`

## หมายเหตุ

- Session จะหมดอายุหลังจาก 24 ชั่วโมง
- ระบบจะตรวจสอบ Activefact = true เท่านั้น
- หากไม่พบ menu สำหรับ permission จะแสดงข้อความแจ้งเตือน
- ข้อมูล menu จะถูกเก็บใน session storage เพื่อการใช้งานที่รวดเร็ว
