// custom-captcha.component.ts
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-custom-captcha',
  templateUrl: 'custom-captcha.component.html',
  styles: [`
    .captcha-container {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 15px;
      background: #f9f9f9;
      width: 100%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      font-family: Arial, sans-serif;
    }

    h4 {
      margin-top: 0;
      margin-bottom: 12px;
      color: #333;
      font-size: 16px;
    }

    .captcha-canvas-container {
      position: relative;
      margin-bottom: 15px;
    }

    .captcha-canvas {
      border: 1px solid #ccc;
      border-radius: 4px;
      background: white;
    }

    .refresh-btn {
      position: absolute;
      right: 5px;
      bottom: 5px;
      background: rgba(255,255,255,0.7);
      border: 1px solid #ccc;
      border-radius: 4px;
      width: 30px;
      height: 30px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .refresh-btn:hover {
      background: rgba(255,255,255,0.9);
    }

    .refresh-icon {
      font-style: normal;
      font-size: 18px;
      color: #555;
    }

    .captcha-input-container {
      display: flex;
      gap: 8px;
      margin-bottom: 10px;
    }

    .captcha-input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 16px;
    }

    .verify-btn {
      background: #4285f4;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 8px 16px;
      cursor: pointer;
      font-weight: bold;
    }

    .verify-btn:hover {
      background: #3b78e7;
    }

    .verification-result {
      text-align: center;
      padding: 8px;
      border-radius: 4px;
      font-weight: bold;
    }

    .success {
      background: #e6f4ea;
      color: #137333;
    }

    .error {
      background: #fce8e6;
      color: #c5221f;
    }
  `]
})
export class CustomCaptchaComponent implements OnInit, AfterViewInit {
  @ViewChild('captchaCanvas') captchaCanvas!: ElementRef<HTMLCanvasElement>;
  @Output() verified = new EventEmitter<boolean>();
  @Input() captchaLength: number = 6;
  @Input() caseSensitive: boolean = false;
  
  private captchaText: string = '';
  userInput: string = '';
  verificationResult: boolean | null = null;

  ngOnInit() {}

  ngAfterViewInit() {
    this.generateCaptcha();
  }

  generateCaptcha() {
    const canvas = this.captchaCanvas.nativeElement;
    const ctx = canvas.getContext('2d')!;
    
    // เคลียร์ canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // กำหนดพื้นหลัง
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // สร้างตัวอักษรที่ใช้ใน CAPTCHA
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    this.captchaText = '';
    
    // สร้างตัวอักษรสุ่ม
    for (let i = 0; i < this.captchaLength; i++) {
      this.captchaText += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // เพิ่มเส้นรบกวน
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.strokeStyle = this.getRandomLightColor();
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    
    // วาดจุดรบกวน
    for (let i = 0; i < 50; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width, 
        Math.random() * canvas.height, 
        Math.random() * 2, 
        0, 
        Math.PI * 2
      );
      ctx.fillStyle = this.getRandomColor();
      ctx.fill();
    }
    
    // เพิ่มตัวอักษร
    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // วาดตัวอักษรแต่ละตัว
    const textWidth = canvas.width * 0.8;
    const startX = canvas.width * 0.1;
    const charWidth = textWidth / this.captchaText.length;
    
    for (let i = 0; i < this.captchaText.length; i++) {
      // สุ่มสีและการหมุน
      ctx.fillStyle = this.getRandomDarkColor();
      ctx.save();
      
      const x = startX + i * charWidth + charWidth / 2;
      const y = canvas.height / 2 + Math.random() * 10 - 5;
      
      ctx.translate(x, y);
      ctx.rotate((Math.random() - 0.5) * 0.3);
      ctx.fillText(this.captchaText[i], 0, 0);
      
      ctx.restore();
    }
    
    // เพิ่มเส้นผ่านกลางข้อความ
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2 + (Math.random() * 10 - 5));
    ctx.lineTo(canvas.width, canvas.height / 2 + (Math.random() * 10 - 5));
    ctx.strokeStyle = this.getRandomLightColor();
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // รีเซ็ตข้อมูลการตรวจสอบ
    this.userInput = '';
    this.verificationResult = null;
  }
  
  verifyCaptcha() {
    let inputToCheck = this.userInput;
    let captchaToCheck = this.captchaText;
    
    if (!this.caseSensitive) {
      inputToCheck = inputToCheck.toLowerCase();
      captchaToCheck = captchaToCheck.toLowerCase();
    }
    
    this.verificationResult = inputToCheck === captchaToCheck;
    this.verified.emit(this.verificationResult);
    if(this.verificationResult){
      const button = document.getElementById('c_modal');
      if (button) {
        button.click(); // คลิกปุ่มเพื่อเปิด Modal
      }
    }
    // สร้าง CAPTCHA ใหม่หลังจากยืนยันสำเร็จ
    if (this.verificationResult) {
      setTimeout(() => {
        this.generateCaptcha();
      }, 1500);
    }
  }
  
  // ฟังก์ชั่นสำหรับสร้างสีสุ่ม
  private getRandomColor(): string {
    return `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.random() * 0.5 + 0.5})`;
  }
  
  private getRandomDarkColor(): string {
    return `rgb(${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)})`;
  }
  
  private getRandomLightColor(): string {
    return `rgba(${150 + Math.floor(Math.random() * 100)}, ${150 + Math.floor(Math.random() * 100)}, ${150 + Math.floor(Math.random() * 100)}, 0.5)`;
  }
}