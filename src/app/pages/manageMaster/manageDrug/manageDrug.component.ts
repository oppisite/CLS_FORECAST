import { Component, ElementRef, ViewChild, CUSTOM_ELEMENTS_SCHEMA, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormGroup, FormBuilder, FormArray, FormControl, FormControlName, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GridJsService } from '../../tables/gridjs/gridjs.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { GridJsModel } from '../../tables/gridjs/gridjs.model';
import { DecimalPipe } from '@angular/common';
import { get } from 'lodash';
import Swal from 'sweetalert2';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { ConsService } from 'src/app/core/services/cons.service';
import { InventoryService } from 'src/app/core/services/inventory.service';
import { Subscription } from 'rxjs';


@Component({
    selector: 'manageDrug',
    templateUrl: 'manageDrug.component.html', 
    providers: [GridJsService, DecimalPipe, ConsService]
})
export class manageDrugComponent implements OnInit, OnDestroy {
    // Table data
    gridjsList$!: Observable<GridJsModel[]>;
    total$: Observable<number>;
    griddata: any;
    totalSize: number = 0;
    select_year:any;
    Group_Permission: any;
    old_Group_Permission: any;
    private dataSubscription: any;
    List_Group_Permission: any[] = [];
    List_tb_group_menu: any[] = [];
    List_permission_group: any[] = [];
    permissionData: any;
    userData: any;
    // ตัวแปรสำหรับ modal จัดการเมนู
    selectedGroupName: string = '';
    selectedMenuGroup: string = '';
    menuGroups: any[] = [];
    assignedMenus: any[] = [];
    LIST_MAS_DRUG: any[] = [];
    private inventorySubscription?: Subscription;
    List_MAS_Product_SubGroup: any;
    MAS_Product_Stock: any;
    DeliveryDrug: any;
    deliveryDateList: any[] = [];

    constructor(private modalService: NgbModal, public service: GridJsService
        , private sortService: PaginationService
        , private authService: AuthenticationService, public consService: ConsService
        , private inventoryService: InventoryService) {
        this.gridjsList$ = service.countries$;
        this.total$ = service.total$;

    }

    ngOnInit(): void  {
        this.userData = this.authService.getAuthen();
        this.permissionData = this.authService.getStoredPermission();

        if (!this.dataSubscription) {
            this.gridjsList$ = this.service.countries$;
            this.dataSubscription = this.gridjsList$.subscribe((data: any) => {
                this.griddata = Object.assign([], data);
            });
        }

        // Subscribe ข้อมูล inventory เพื่อ map จำนวนสต็อก (inspection_qty) เข้า LIST_MAS_DRUG
        this.inventorySubscription?.unsubscribe();
        this.inventorySubscription = this.inventoryService.inventory.subscribe((invData: any) => {
            if (invData != null && this.LIST_MAS_DRUG?.length > 0 && invData.List_product) {
                const qtyByCode: { [key: string]: number } = {};
                (invData.List_product as any[]).forEach((p: any) => {
                    const code = p.ProductCode;
                    qtyByCode[code] = (qtyByCode[code] ?? 0) + (Number(p.inspection_qty) || 0);
                });
                // อัปเดต inspection_qty และ DOH (วันคงเหลือ = สต็อก / ยอดขายเฉลี่ยต่อวัน) บน object เดิม เพื่อคง ReorderPoint ฯลฯ
                this.LIST_MAS_DRUG.forEach((d: any) => {
                    const qty = qtyByCode[d.ProductCode] ?? 0;
                    d.inspection_qty = qty;
                    const avgPerDay = Number(d.avgdemand) / 30; // ยอดขายเฉลี่ยต่อวัน = avgdemand/30
                    d.DOH = (avgPerDay > 0)
                        ? Math.round(qty / avgPerDay)
                        : (d.DOH ?? 0);
                    d.FK_Product_SubGroup = parseInt(d.FK_Product_SubGroup ?? '0');
                });
                this.service.setGridData(this.LIST_MAS_DRUG);
            }
        });

        let model ={
            FUNC_CODE: "FUNC-GET_DATA_MANAGE_DRUG",
            AUTHEN_INFORMATION: this.userData
          }
          var getData = this.consService.GatewayGetData(model);
          getData.subscribe((response: any) => {
            //debugger;
            if (response.RESULT == null) {
                this.LIST_MAS_DRUG = response.LIST_MAS_DRUG;
                this.MAS_Product_Stock = response.MAS_Product_Stock;
                this.DeliveryDrug = response.DeliveryDrug;
                this.List_MAS_Product_SubGroup = response.List_MAS_Product_SubGroup;
                this.service.setGridData(this.LIST_MAS_DRUG);
                // โหลด inventory เพื่อ map จำนวนสต็อกแล้วอัปเดตตาราง
                this.inventoryService.loadData(this.userData, {
                    listMasDrug: this.LIST_MAS_DRUG,
                    listMasTypeDrug: []
                });
            }else{
              Swal.fire({
                title: 'เกิดข้อผิดพลาด!',
                text: response.RESULT,
                icon: 'warning',
                //showCancelButton: true,
                confirmButtonColor: 'rgb(3, 142, 220)',
               // cancelButtonColor: 'rgb(243, 78, 78)',
                confirmButtonText: 'OK'
              });
            }
          });
    }

       // ใน Component
   onSort(column: string) {
    // แทนที่จะใช้ข้อมูลตรงๆ ให้ใช้ service.getSortedData แทน
        this.service.getSortData(column);
    }

    close_modal(){
        const modalButton = document.getElementById("cdFullmodal") as HTMLButtonElement;
        if (modalButton) {
          modalButton.click();
        }
    }
    /**
* Open small modal
* @param smallDataModal small modal data
*/

    fullModal(smallDataModal: any, data: any) {
        this.modalService.open(smallDataModal, { size: 'fullscreen', windowClass: 'modal-holder' });
        
        // ตั้งค่าข้อมูลกลุ่มผู้ใช้งาน
        this.MAS_Product_Stock = data || '';

    }

    SaveData() {
        Swal.fire({
            title: 'ยืนยันการบันทึก',
            text: 'คุณต้องการบันทึกข้อมูลหรือไม่?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: 'rgb(3, 142, 220)',
            confirmButtonText: 'บันทึก'
        }).then((result) => {
            if (result.isConfirmed) {
                let model ={
                    FUNC_CODE: "FUNC-SAVE_DATA_MANAGE_DRUG",
                    MAS_Product_Stock: this.MAS_Product_Stock,
                    AUTHEN_INFORMATION: this.userData
                }
                var getData = this.consService.GatewayGetData(model);
                getData.subscribe((response: any) => {
                    //debugger;
                    if (response.RESULT == null) {
                        Swal.fire({
                            title: 'สำเร็จ!',
                            text: 'บันทึกข้อมูลเรียบร้อยแล้ว',
                            icon: 'success',
                            confirmButtonColor: 'rgb(3, 142, 220)',
                            confirmButtonText: 'OK'
                        });
                        this.ngOnInit();
                        this.close_modal();
                    }else{
                        Swal.fire({
                            title: 'เกิดข้อผิดพลาด!',
                            text: response.RESULT,
                            icon: 'warning',
                            confirmButtonColor: 'rgb(3, 142, 220)',
                            confirmButtonText: 'OK'
                        });
                    }
                });
            }
        });


    }
    onChangeProductSubGroup(fkId: any) {
        const sub = this.List_MAS_Product_SubGroup?.find((item: any) => item.IDA == fkId);
        this.MAS_Product_Stock.Product_SubGroup_Name = sub ? sub.SubGroupDrugName : '';
    }

    openDeliveryDate(addDeliveryDateModal: any, data: any) {
        this.modalService.open(addDeliveryDateModal, { size: 'xl', windowClass: 'modal-holder' });
        this.DeliveryDrug.ProductCode = data.ProductCode;
        this.DeliveryDrug.ProductGenericName = data.ProductGenericName;
        this.DeliveryDrug.ProductTradeName = data.ProductTradeName;
        this.DeliveryDrug.ProductCodeNew = data.ProductCodeNew;
        let model ={
            FUNC_CODE: "FUNC-GET_DATA_DELIVERY_DATE_MANAGE_DRUG",
            MAS_Product_Stock: this.MAS_Product_Stock,
            ProductCode: data.ProductCode,
            AUTHEN_INFORMATION: this.userData
        }
        var getData = this.consService.GatewayGetData(model);
        getData.subscribe((response: any) => {
            //debugger;
            if (response.RESULT == null) {
                // this.DeliveryDrug = response.DeliveryDrug;
                this.deliveryDateList = response.List_DeliveryDrug;
                this.deliveryDateList.forEach((item: any) => {
                    item.DeliveryDate = this.formatJsonDate(item.DeliveryDate);
                });
                this.sortDeliveryDateListDesc();
            }else{
                Swal.fire({
                    title: 'เกิดข้อผิดพลาด!',
                    text: response.RESULT,
                    icon: 'warning',
                    confirmButtonColor: 'rgb(3, 142, 220)',
                    confirmButtonText: 'OK'
                });
            }
        });
    }
    formatJsonDate(jsonDate: string): string {
        const d = this.convertJsonDate(jsonDate);
      if (!d) {
        return '';
      }
      return d.toLocaleDateString('th-TH', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }

    convertJsonDate(jsonDate: string): Date | null {
        if (!jsonDate) {
          return null;
        }
        const match = /\/Date\((\d+)\)\//.exec(jsonDate);
        if (!match) {
          return null;
        }
        const millis = Number(match[1]);
        return new Date(millis);
      }
    addDeliveryDate() {
        if(this.DeliveryDrug.DeliveryDate == null || this.DeliveryDrug.DeliveryDate == ''){
            Swal.fire({
                title: 'เกิดข้อผิดพลาด!',
                text: 'กรุณากรอกวันที่ส่งมอบยา',
                icon: 'warning',
                confirmButtonColor: 'rgb(3, 142, 220)',
                confirmButtonText: 'OK'
            });
            return;
        }
        if(this.DeliveryDrug.DeliveryQty == null || this.DeliveryDrug.DeliveryQty == ''){
            Swal.fire({
                title: 'เกิดข้อผิดพลาด!',
                text: 'กรุณากรอกจำนวนยา',
                icon: 'warning',
                confirmButtonColor: 'rgb(3, 142, 220)',
                confirmButtonText: 'OK'
            });
            return;
        }

        const deliveryDateFormatted = this.formatInputDateToThaiShort(this.DeliveryDrug.DeliveryDate);
        this.deliveryDateList.push({
            ProductCode: this.DeliveryDrug.ProductCode,
            ProductGenericName: this.DeliveryDrug.ProductGenericName,
            ProductTradeName: this.DeliveryDrug.ProductTradeName,
            DeliveryDate: deliveryDateFormatted,
            ProductCodeNew: this.DeliveryDrug.ProductCodeNew,
            DeliveryQty: Number(this.DeliveryDrug.DeliveryQty) || 0
        });
        this.sortDeliveryDateListDesc();
        this.DeliveryDrug.DeliveryDate = '';
        this.DeliveryDrug.DeliveryQty = null;
    }

    private formatInputDateToThaiShort(value: any): string {
        if (!value) return '';
        // input[type="date"] => yyyy-MM-dd
        const str = String(value);
        const d = new Date(str);
        if (isNaN(d.getTime())) return str;
        return d.toLocaleDateString('th-TH', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    saveDeliveryDate() {
        let model ={
            FUNC_CODE: "FUNC-SAVE_DATA_DELIVERY_DATE_MANAGE_DRUG",
            ProductCode: this.DeliveryDrug.ProductCode,
            List_DeliveryDrug: this.deliveryDateList,
            AUTHEN_INFORMATION: this.userData
        }
        var getData = this.consService.GatewayGetData(model);
        getData.subscribe((response: any) => {
            if (response.RESULT == null) {
                Swal.fire({
                    title: 'สำเร็จ!',
                    text: 'บันทึกข้อมูลเรียบร้อกแล้ว',
                icon: 'success',
                confirmButtonColor: 'rgb(3, 142, 220)',
                confirmButtonText: 'OK'
            });
            // ปิด modal หลัง save เสร็จ
            this.modalService.dismissAll();
        }else{
            Swal.fire({
                title: 'เกิดข้อผิดพลาด!',
                text: response.RESULT,
                icon: 'warning',
                confirmButtonColor: 'rgb(3, 142, 220)',
                confirmButtonText: 'OK'
            });
        }
    });
    }
    deleteDeliveryDate(index: any) {
        this.deliveryDateList.splice(index, 1);
    }

    private sortDeliveryDateListDesc(): void {
        this.deliveryDateList = [...this.deliveryDateList].sort((a: any, b: any) => {
            const aTime = this.parseAnyDateToTime(a?.DeliveryDate);
            const bTime = this.parseAnyDateToTime(b?.DeliveryDate);
            return bTime - aTime;
        });
    }

    private parseAnyDateToTime(value: any): number {
        if (!value) return 0;
        const str = String(value);
        if (str.startsWith('/Date(')) {
            const match = /\/Date\((\d+)\)\//.exec(str);
            return match ? Number(match[1]) : 0;
        }

        // yyyy-MM-dd
        if (str.includes('-')) {
            const d = new Date(str);
            return isNaN(d.getTime()) ? 0 : d.getTime();
        }

        // dd/MM/yyyy (รองรับปี พ.ศ.)
        const parts = str.split('/');
        if (parts.length === 3) {
            const day = Number(parts[0]);
            const month = Number(parts[1]);
            let year = Number(parts[2]);
            if (year > 2500) year -= 543;
            const d = new Date(year, month - 1, day);
            return isNaN(d.getTime()) ? 0 : d.getTime();
        }
        return 0;
    }

    ngOnDestroy(): void {
        this.inventorySubscription?.unsubscribe();
    }
}