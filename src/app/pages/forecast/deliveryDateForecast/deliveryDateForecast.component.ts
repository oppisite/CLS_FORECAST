import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GridJsService } from '../../tables/gridjs/gridjs.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { GridJsModel } from '../../tables/gridjs/gridjs.model';
import { DecimalPipe } from '@angular/common';
import Swal from 'sweetalert2';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { ConsService } from 'src/app/core/services/cons.service';

@Component({
    selector: 'deliveryDateForecast',
    templateUrl: 'deliveryDateForecast.component.html',
    providers: [GridJsService, DecimalPipe, ConsService]
})
export class DeliveryDateForecastComponent implements OnInit, OnDestroy {
    gridjsList$!: Observable<GridJsModel[]>;
    total$: Observable<number>;
    griddata: any;
    private dataSubscription: any;
    permissionData: any;
    userData: any;
    LIST_MAS_DRUG: any[] = [];
    List_Contract_DeliveryDrug: any[] = [];
    Contract_DeliveryDrug: any;
    old_Contract_DeliveryDrug: any;
    DeliveryDrug: any;
    old_DeliveryDrug: any;
    /** รายการส่งมอบยาภายใต้สัญญา (ใน modal) */
    deliveryDrugList: any[] = [];
    /** index รายการที่กำลังแก้ไข (null = เพิ่มใหม่) */
    editingDeliveryIndex: number | null = null;
    title = '';

    constructor(
        private modalService: NgbModal,
        public service: GridJsService,
        private sortService: PaginationService,
        private authService: AuthenticationService,
        public consService: ConsService
    ) {
        this.gridjsList$ = service.countries$;
        this.total$ = service.total$;
    }

    ngOnInit(): void {
        this.userData = this.authService.getAuthen();
        this.permissionData = this.authService.getStoredPermission();

        if (!this.dataSubscription) {
            this.gridjsList$ = this.service.countries$;
            this.dataSubscription = this.gridjsList$.subscribe((data: any) => {
                this.griddata = Object.assign([], data);
            });
        }
        this.loadContractList();
    }

    private loadContractList(): void {
        const model = {
            FUNC_CODE: 'FUNC-GET_DATA_DELIVERY_DATE_FORECAST',
            AUTHEN_INFORMATION: this.userData
        };
        this.consService.GatewayGetData(model).subscribe((response: any) => {
            if (response.RESULT == null) {
                this.List_Contract_DeliveryDrug = response.List_Contract_DeliveryDrug || [];
                this.Contract_DeliveryDrug = response.Contract_DeliveryDrug;
                this.old_Contract_DeliveryDrug = response.Contract_DeliveryDrug;
                // this.DeliveryDrug = response.DeliveryDrug;
                // this.old_DeliveryDrug = response.DeliveryDrug;
                this.LIST_MAS_DRUG = response.LIST_MAS_DRUG || [];
                this.service.setGridData(this.List_Contract_DeliveryDrug);
            } else {
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
    onSort(column: string): void {
        this.service.getSortData(column);
    }

    onChangeProductCode(event: any): void {
        const drug = this.LIST_MAS_DRUG.find((d: any) => d.ProductCode == event);
        if (!drug || !this.DeliveryDrug) {
            return;
        }
        this.DeliveryDrug.ProductCodeNew = drug.ProductCodeNew;
        this.DeliveryDrug.ProductGenericName = drug.ProductGenericName;
        this.DeliveryDrug.ProductTradeName = drug.ProductTradeName;
    }

    deleteContract(data: any): void {
        Swal.fire({
            title: 'ยืนยันการลบ',
            text: 'คุณต้องการลบสัญญานี้หรือไม่?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: 'rgb(3, 142, 220)',
            confirmButtonText: 'ลบ'
        }).then((result) => {
            if (!result.isConfirmed) {
                return;
            }
            const payload = { ...data };
            delete payload.Create_Date;
            delete payload.Update_Date;
            const model = {
                FUNC_CODE: 'FUNC-DELETE_DATA_CONTRACT_DELIVERY_FORECAST',
                Contract_DeliveryDrug: payload,
                AUTHEN_INFORMATION: this.userData
            };
            this.consService.GatewayGetData(model).subscribe((response: any) => {
                if (response.RESULT == null) {
                    Swal.fire({
                        title: 'สำเร็จ!',
                        text: 'ลบข้อมูลเรียบร้อยแล้ว',
                        icon: 'success',
                        confirmButtonColor: 'rgb(3, 142, 220)',
                        confirmButtonText: 'OK'
                    });
                    this.loadContractList();
                } else {
                    Swal.fire({
                        title: 'เกิดข้อผิดพลาด!',
                        text: response.RESULT,
                        icon: 'warning',
                        confirmButtonColor: 'rgb(3, 142, 220)',
                        confirmButtonText: 'OK'
                    });
                }
            });
        });
    }

    addOrUpdateDeliveryDrug(): void {
        if (!this.DeliveryDrug?.ProductCode) {
            Swal.fire({
                title: 'เกิดข้อผิดพลาด!',
                text: 'กรุณาเลือกยา',
                icon: 'warning',
                confirmButtonColor: 'rgb(3, 142, 220)',
                confirmButtonText: 'OK'
            });
            return;
        }
        const periodName = (this.DeliveryDrug.Period_Name || '').trim();
        if (!periodName) {
            Swal.fire({
                title: 'เกิดข้อผิดพลาด!',
                text: 'กรุณากรอกงวด',
                icon: 'warning',
                confirmButtonColor: 'rgb(3, 142, 220)',
                confirmButtonText: 'OK'
            });
            return;
        }
        if (this.DeliveryDrug.DeliveryQty == null || this.DeliveryDrug.DeliveryQty === '') {
            Swal.fire({
                title: 'เกิดข้อผิดพลาด!',
                text: 'กรุณากรอกจำนวนที่ต้องส่งมอบ',
                icon: 'warning',
                confirmButtonColor: 'rgb(3, 142, 220)',
                confirmButtonText: 'OK'
            });
            return;
        }
        if (this.DeliveryDrug.Fin_DeliveryQty == null || this.DeliveryDrug.Fin_DeliveryQty === '') {
            Swal.fire({
                title: 'เกิดข้อผิดพลาด!',
                text: 'กรุณากรอกจำนวนส่งมอบแล้ว',
                icon: 'warning',
                confirmButtonColor: 'rgb(3, 142, 220)',
                confirmButtonText: 'OK'
            });
            return;
        }

        const item = this.buildDeliveryDrugItem();
        if (this.editingDeliveryIndex != null) {
            const existing = this.deliveryDrugList[this.editingDeliveryIndex];
            this.deliveryDrugList[this.editingDeliveryIndex] = {
                ...existing,
                ...item,
                IDA: existing?.IDA
            };
        } else {
            this.deliveryDrugList.push(item);
        }
        this.sortDeliveryDrugListDesc();
        this.resetDeliveryDrugDraft();
    }

    editDeliveryDrugFromList(index: number): void {
        const item = this.deliveryDrugList[index];
        if (!item) {
            return;
        }
        this.editingDeliveryIndex = index;
        this.DeliveryDrug = {
            ...this.old_DeliveryDrug,
            ...item,
            ProductCode: item.ProductCode,
            DeliveryDate: this.toInputDate(item.DeliveryDate),
            Period_Name: item.Period_Name || '',
            DeliveryQty: item.DeliveryQty ?? null,
            Fin_DeliveryQty: item.Fin_DeliveryQty ?? null,
            Overdue_DeliveryQty: item.Overdue_DeliveryQty ?? null,
            Delivery_Detail: item.Delivery_Detail || ''
        };
    }

    cancelEditDeliveryDrug(): void {
        this.resetDeliveryDrugDraft();
    }

    deleteDeliveryDrugFromList(index: number): void {
        if (this.editingDeliveryIndex === index) {
            this.resetDeliveryDrugDraft();
        } else if (this.editingDeliveryIndex != null && index < this.editingDeliveryIndex) {
            this.editingDeliveryIndex--;
        }
        this.deliveryDrugList.splice(index, 1);
    }

    private buildDeliveryDrugItem(): any {
        const deliveryQty = Number(this.DeliveryDrug.DeliveryQty) || 0;
        const finQty = Number(this.DeliveryDrug.Fin_DeliveryQty) || 0;
        const overdueQty = Number(this.DeliveryDrug.Overdue_DeliveryQty) || 0;
        const deliveryDateFormatted = this.DeliveryDrug.DeliveryDate
            ? this.formatInputDateToThaiShort(this.DeliveryDrug.DeliveryDate)
            : '';
        return {
            IDA: this.DeliveryDrug.IDA || 0,
            ProductCode: this.DeliveryDrug.ProductCode,
            ProductGenericName: this.DeliveryDrug.ProductGenericName,
            ProductTradeName: this.DeliveryDrug.ProductTradeName,
            ProductCodeNew: this.DeliveryDrug.ProductCodeNew,
            Period_Name: (this.DeliveryDrug.Period_Name || '').trim(),
            DeliveryQty: deliveryQty,
            Fin_DeliveryQty: finQty,
            Overdue_DeliveryQty: overdueQty,
            Delivery_Detail: (this.DeliveryDrug.Delivery_Detail || '').trim(),
            DeliveryDate: deliveryDateFormatted,
            FK_Contract_DeliveryDrug: this.Contract_DeliveryDrug?.IDA || 0
        };
    }

    saveContractDeliveryDrug(): void {
        const contractName = (this.Contract_DeliveryDrug?.Contract_Name || '').trim();
        if (!contractName) {
            Swal.fire({
                title: 'เกิดข้อผิดพลาด!',
                text: 'กรุณากรอกชื่อสัญญา',
                icon: 'warning',
                confirmButtonColor: 'rgb(3, 142, 220)',
                confirmButtonText: 'OK'
            });
            return;
        }
        if (!this.deliveryDrugList.length) {
            Swal.fire({
                title: 'เกิดข้อผิดพลาด!',
                text: 'กรุณาเพิ่มรายการส่งมอบยาอย่างน้อย 1 รายการ',
                icon: 'warning',
                confirmButtonColor: 'rgb(3, 142, 220)',
                confirmButtonText: 'OK'
            });
            return;
        }

        const model = {
            FUNC_CODE: 'FUNC-SAVE_DATA_CONTRACT_DELIVERY_FORECAST',
            Contract_DeliveryDrug: this.Contract_DeliveryDrug,
            List_DeliveryDrug: this.deliveryDrugList,
            AUTHEN_INFORMATION: this.userData
        };
        this.consService.GatewayGetData(model).subscribe((response: any) => {
            if (response.RESULT == null) {
                Swal.fire({
                    title: 'สำเร็จ!',
                    text: 'บันทึกข้อมูลเรียบร้อยแล้ว',
                    icon: 'success',
                    confirmButtonColor: 'rgb(3, 142, 220)',
                    confirmButtonText: 'OK'
                });
                this.modalService.dismissAll();
                this.loadContractList();
            } else {
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

    fullModal(modal: any, data: any): void {
        if (!data?.IDA) {
            this.title = 'เพิ่มข้อมูลสัญญาส่งมอบยา';
            this.Contract_DeliveryDrug = { ...this.old_Contract_DeliveryDrug };
            this.deliveryDrugList = [];
        } else {
            this.title = 'แก้ไขข้อมูลสัญญาส่งมอบยา';
            this.Contract_DeliveryDrug = { ...data };
            this.loadContractDeliveryDrugs(data);
        }
        this.editingDeliveryIndex = null;
        this.resetDeliveryDrugDraft();
        this.modalService.open(modal, { size: 'fullscreen' });
    }

    private loadContractDeliveryDrugs(contract: any): void {
        const model = {
            FUNC_CODE: 'FUNC-GET_DATA_DELIVERY_DATE_FORECAST_DETAIL',
            Contract_DeliveryDrug: { IDA: contract.IDA },
            AUTHEN_INFORMATION: this.userData
        };
        this.consService.GatewayGetData(model).subscribe((response: any) => {
            if (response.RESULT == null) {
                this.DeliveryDrug = response.DeliveryDrug;
                this.old_DeliveryDrug = response.DeliveryDrug;
                const list = response.List_DeliveryDrug || [];
                this.deliveryDrugList = list.map((item: any) => this.normalizeDeliveryDrugRow(item));
                this.sortDeliveryDrugListDesc();
            }
        });
    }

    private normalizeDeliveryDrugRow(item: any): any {
        const deliveryQty = Number(item.DeliveryQty) || 0;
        const finQty = item.Fin_DeliveryQty != null && item.Fin_DeliveryQty !== ''
            ? Number(item.Fin_DeliveryQty)
            : deliveryQty;
        return {
            ...item,
            Period_Name: item.Period_Name || '',
            DeliveryQty: deliveryQty,
            Fin_DeliveryQty: finQty,
            Overdue_DeliveryQty: item.Overdue_DeliveryQty ?? 0,
            Delivery_Detail: item.Delivery_Detail || '',
            DeliveryDate: this.formatJsonDate(item.DeliveryDate) || item.DeliveryDate || ''
        };
    }

    private resetDeliveryDrugDraft(): void {
        this.DeliveryDrug = { ...this.old_DeliveryDrug };
        this.editingDeliveryIndex = null;
    }

    private sortDeliveryDrugListDesc(): void {
        this.deliveryDrugList.sort((a, b) => {
            const pa = String(a.Period_Name || '');
            const pb = String(b.Period_Name || '');
            if (pa !== pb) {
                return pa.localeCompare(pb, 'th');
            }
            const da = this.parseDeliveryDateForSort(a.DeliveryDate);
            const db = this.parseDeliveryDateForSort(b.DeliveryDate);
            return db - da;
        });
    }

    toInputDate(value: string): string {
        if (!value) {
            return '';
        }
        if (value.startsWith('/Date(')) {
            const d = this.convertJsonDate(value);
            return d ? d.toISOString().substring(0, 10) : '';
        }
        const parts = value.split('/');
        if (parts.length === 3) {
            const [day, month, year] = parts;
            const y = parseInt(year, 10);
            const ceYear = y > 2500 ? y - 543 : y;
            return `${ceYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        return value;
    }

    private parseDeliveryDateForSort(value: string): number {
        if (!value) {
            return 0;
        }
        if (value.startsWith('/Date(')) {
            return this.convertJsonDate(value)?.getTime() || 0;
        }
        const parts = String(value).split('/');
        if (parts.length === 3) {
            const [day, month, year] = parts;
            const y = parseInt(year, 10);
            const ceYear = y > 2500 ? y - 543 : y;
            return new Date(ceYear, parseInt(month, 10) - 1, parseInt(day, 10)).getTime();
        }
        const d = new Date(value);
        return isNaN(d.getTime()) ? 0 : d.getTime();
    }

    private formatInputDateToThaiShort(value: any): string {
        if (!value) {
            return '';
        }
        const d = new Date(String(value));
        if (isNaN(d.getTime())) {
            return String(value);
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
        return new Date(Number(match[1]));
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

    ngOnDestroy(): void {
        if (this.dataSubscription) {
            this.dataSubscription.unsubscribe();
        }
    }
}
