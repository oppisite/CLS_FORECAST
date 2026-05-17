# 🧹 การจัดการ Cache และไฟล์ขนาดใหญ่

## 📊 ปัญหาที่พบ
เมื่อรันโปรเจ็กต์ Angular ไปนานๆ cache จะเพิ่มขึ้นเรื่อยๆ โดยเฉพาะ:
- **`.angular`** folder - Angular build cache (อาจใหญ่ถึง 20+ GB)
- **`dist`** folder - Build artifacts
- **`node_modules`** - Dependencies (ปกติไม่ควรลบ)

## 🛠️ วิธีลบ Cache

### วิธีที่ 1: ใช้ npm script (แนะนำ)
```bash
# ลบ cache ทั้งหมด (Angular cache + dist + logs)
npm run clean

# ลบเฉพาะ Angular cache
npm run clean:cache

# ลบทุกอย่าง
npm run clean:all
```

### วิธีที่ 2: ใช้ Angular CLI
```bash
# ลบ Angular cache
ng cache clean
```

### วิธีที่ 3: ใช้ PowerShell script
```bash
powershell -ExecutionPolicy Bypass -File clean-cache.ps1
```

### วิธีที่ 4: ลบด้วยมือ
```bash
# ลบ .angular folder
Remove-Item -Recurse -Force .angular

# ลบ dist folder
Remove-Item -Recurse -Force dist

# ลบ log files
Remove-Item -Recurse -Force *.log
```

## ⚠️ เมื่อไหร่ควรลบ Cache?

### ควรลบเมื่อ:
- ✅ โปรเจ็กต์มีขนาดใหญ่เกิน 1 GB
- ✅ Build ช้า หรือมีปัญหา
- ✅ เปลี่ยน Angular version
- ✅ มี error เกี่ยวกับ cache
- ✅ ก่อน commit code (เพื่อไม่ให้ commit cache)

### ไม่ควรลบเมื่อ:
- ❌ กำลัง develop อยู่ (จะทำให้ build ช้าลงชั่วคราว)
- ❌ หลัง build เสร็จใหม่ๆ (cache ยังมีประโยชน์)

## 🔄 หลังจากลบ Cache

หลังจากลบ cache แล้ว:
1. **Build ครั้งแรกจะช้า** - เพราะต้องสร้าง cache ใหม่ (ปกติ 2-5 นาที)
2. **Build ครั้งต่อไปจะเร็ว** - เพราะใช้ cache ที่สร้างใหม่
3. **Cache จะค่อยๆ เพิ่มขึ้นอีก** - เป็นเรื่องปกติ

## 📝 คำแนะนำ

### 1. ลบ Cache เป็นประจำ
```bash
# ทุกสัปดาห์ หรือเมื่อโปรเจ็กต์ใหญ่เกิน 500 MB
npm run clean
```

### 2. เพิ่มใน .gitignore (ทำแล้ว)
```
.angular
dist
*.log
.cache
```

### 3. ตรวจสอบขนาดโปรเจ็กต์
```bash
# ใช้ script ที่สร้างไว้
powershell -ExecutionPolicy Bypass -File check-size.ps1
```

### 4. ตั้งค่า Angular Cache Size Limit (ถ้าต้องการ)
ใน `angular.json` สามารถตั้งค่า cache size limit ได้:
```json
{
  "cli": {
    "cache": {
      "enabled": true,
      "path": ".angular/cache",
      "environment": "all"
    }
  }
}
```

## 📈 ขนาดปกติของแต่ละส่วน

| ส่วน | ขนาดปกติ | ควรลบเมื่อ |
|------|----------|-----------|
| `.angular` | 100-500 MB | > 1 GB |
| `dist` | 50-200 MB | > 500 MB |
| `node_modules` | 500-1000 MB | ไม่ควรลบ |
| `src` | 30-100 MB | ไม่ควรลบ |

## 🚀 Quick Commands

```bash
# ตรวจสอบขนาด
npm run clean  # จะแสดงขนาดก่อนลบ

# ลบ cache
npm run clean:cache

# ลบทุกอย่าง
npm run clean:all

# Build ใหม่ (หลังลบ cache)
npm run build
```

## ⚡ Tips

1. **ใช้ Git LFS** สำหรับไฟล์ใหญ่ (ถ้ามี)
2. **ลบ cache ก่อน commit** เพื่อไม่ให้ commit cache
3. **ใช้ CI/CD** เพื่อ build ใน clean environment
4. **ตรวจสอบขนาดเป็นประจำ** เพื่อป้องกันปัญหา

