# การใช้งาน Loading Service

## 1. การใช้งานใน Component

```typescript
import { LoadingService } from '../../core/services/loading.service';

export class YourComponent {
  constructor(private loadingService: LoadingService) {}

  // เริ่มต้น loading
  startLoading() {
    this.loadingService.show('กำลังโหลดข้อมูล...');
  }

  // หยุด loading
  stopLoading() {
    this.loadingService.hide();
  }

  // ตั้งค่า loading state โดยตรง
  setLoadingState(isLoading: boolean) {
    this.loadingService.setLoading(isLoading, 'กำลังประมวลผล...');
  }

  // ตรวจสอบสถานะ loading
  checkLoadingStatus() {
    console.log('Is loading:', this.loadingService.isLoading);
  }
}
```

## 2. การใช้งานใน Service

```typescript
import { LoadingService } from './loading.service';

@Injectable()
export class YourService {
  constructor(private loadingService: LoadingService) {}

  getData() {
    this.loadingService.show('กำลังดึงข้อมูล...');
    
    return this.http.get('/api/data').pipe(
      finalize(() => {
        this.loadingService.hide();
      })
    );
  }
}
```

## 3. การใช้งานใน HTTP Interceptor (อัตโนมัติ)

HTTP Interceptor จะจัดการ loading state อัตโนมัติสำหรับ HTTP requests ทั้งหมด:

```typescript
// ไม่ต้องทำอะไรเพิ่มเติม - ทำงานอัตโนมัติ
this.http.get('/api/data').subscribe(response => {
  // Loading จะแสดงและหายไปอัตโนมัติ
});
```

## 4. การใช้งานแบบ Manual Control

```typescript
// เริ่มต้น loading พร้อมข้อความ
this.loadingService.show('กำลังบันทึกข้อมูล...');

// หยุด loading
this.loadingService.hide();

// รีเซ็ต loading state
this.loadingService.reset();
```

## 5. การตรวจสอบ Loading State

```typescript
// รับ Observable ของ loading state
this.loadingService.loading$.subscribe(isLoading => {
  console.log('Loading state changed:', isLoading);
});

// รับ Observable ของ loading message
this.loadingService.loadingMessage$.subscribe(message => {
  console.log('Current message:', message);
});

// ตรวจสอบสถานะปัจจุบัน
if (this.loadingService.isLoading) {
  console.log('Currently loading...');
}
```

## 6. การใช้งานใน Template

```html
<!-- Global loading component จะแสดงอัตโนมัติ -->
<app-loading></app-loading>

<!-- หรือใช้ loading state ใน template -->
<div *ngIf="loadingService.isLoading" class="loading">
  <div class="spinner"></div>
  <p>{{ loadingService.currentMessage }}</p>
</div>
```

## 7. การจัดการ Multiple Requests

Loading service จะนับจำนวน requests ที่กำลังทำงานอยู่ และจะแสดง loading จนกว่า requests ทั้งหมดจะเสร็จสิ้น:

```typescript
// Request 1
this.http.get('/api/data1').subscribe();

// Request 2  
this.http.get('/api/data2').subscribe();

// Request 3
this.http.get('/api/data3').subscribe();

// Loading จะแสดงจนกว่า requests ทั้ง 3 จะเสร็จสิ้น
```

## 8. การปิดใช้งาน HTTP Interceptor

หากต้องการปิดใช้งาน HTTP Interceptor สำหรับบาง requests:

```typescript
// สร้าง custom header เพื่อข้าม interceptor
const headers = new HttpHeaders().set('X-Skip-Loading', 'true');

this.http.get('/api/data', { headers }).subscribe();
```

จากนั้นแก้ไข LoadingInterceptor:

```typescript
intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
  // ข้าม loading ถ้ามี header X-Skip-Loading
  if (request.headers.has('X-Skip-Loading')) {
    return next.handle(request);
  }
  
  // ... rest of the code
}
```


