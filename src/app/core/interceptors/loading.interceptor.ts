import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private totalRequests = 0;

  constructor(private loadingService: LoadingService) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // เพิ่มจำนวน requests
    this.totalRequests++;
    
    // เริ่มต้น loading ถ้าเป็น request แรก
    if (this.totalRequests === 1) {
      this.loadingService.show('กำลังเชื่อมต่อกับเซิร์ฟเวอร์...');
    }

    return next.handle(request).pipe(
      finalize(() => {
        // ลดจำนวน requests
        this.totalRequests--;
        
        // หยุด loading ถ้าไม่มี requests ค้างอยู่
        if (this.totalRequests === 0) {
          this.loadingService.hide();
        }
      })
    );
  }
}


