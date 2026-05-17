import { Component, ElementRef, ViewChild, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
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
import { get, result } from 'lodash';
import Swal from 'sweetalert2';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { ConsService } from 'src/app/core/services/cons.service';


@Component({
    selector: 'manageDemandDrug',
    templateUrl: 'manageDemandDrug.component.html', 
    providers: [GridJsService, DecimalPipe, ConsService]
})
export class manageDemandDrugComponent {
    // Table data
    gridjsList$!: Observable<GridJsModel[]>;
    total$: Observable<number>;
    griddata: any;
    gridjsListDetail$!: Observable<GridJsModel[]>;
    totalDetail$: Observable<number>;
    griddataDetail: any;
    searchTermDetail = '';
    totalSize: number = 0;
    select_year:any;
    MAS_DEMAND_DRUG: any;
    old_MAS_DEMAND_DRUG: any;
    private dataSubscription: any;
    List_MAS_DEMAND_DRUG: any[] = [];
    donwloadUrl: string = environment.DownloadExamUrl;
    // ===== Demand Tabs + Upload Excel =====
    demandTab: 'drug' | 'hospital' = 'drug'; // default: ความต้องการยา
    selectedYear: number = 0;
    yearOptions: number[] = [];
    excelFile: File | null = null;
    List_tb_group_menu: any[] = [];
    List_permission_group: any[] = [];
    permissionData: any;
    userData: any;
    // ตัวแปรสำหรับ modal จัดการเมนู
    selectedGroupName: string = '';
    selectedMenuGroup: string = '';
    menuGroups: any[] = [];
    assignedMenus: any[] = [];
    List_FILE_UPLOAD: any[] = [];
    FILE_UPLOAD_TEMPLATE: any;
    List_Demand_Drug: any;
    List_Demand_Drug_Hospital: any[] = [];
    public serviceDetail: GridJsService;
    constructor(private modalService: NgbModal, public service: GridJsService
        , private sortService: PaginationService
        , private authService: AuthenticationService, public consService: ConsService
        , private decimalPipe: DecimalPipe) {
        this.gridjsList$ = service.countries$;
        this.total$ = service.total$;
        this.serviceDetail = new GridJsService(decimalPipe);
        this.gridjsListDetail$ = this.serviceDetail.countries$;
        this.totalDetail$ = this.serviceDetail.total$;

    }

    ngOnInit(): void  {
        this.userData = this.authService.getAuthen();
        this.permissionData = this.authService.getStoredPermission();

        const currentYearBE = new Date().getFullYear() + 543; // ปี พ.ศ.
        this.selectedYear = currentYearBE;
        this.yearOptions = Array.from({ length: 7 }, (_, idx) => currentYearBE - 3 + idx); // +/- 3 ปี

        if (!this.dataSubscription) {
            this.gridjsList$ = this.service.countries$;
            this.dataSubscription = this.gridjsList$.subscribe((data: any) => {
                this.griddata = Object.assign([], data);
            });
        }
        this.gridjsListDetail$ = this.serviceDetail.countries$;
        this.gridjsListDetail$.subscribe((data: any) => {
            this.griddataDetail = Object.assign([], data);
        });

        this.loadDemandData();
    }

    private loadDemandData(): void {
        const model = {
            FUNC_CODE: "FUNC-GET_DATA_MAS_DEMAND_DRUG",
            YEAR: this.selectedYear,
            AUTHEN_INFORMATION: this.userData
        };
        const getData = this.consService.GatewayGetData(model);
        getData.subscribe((response: any) => {
            if (response.RESULT == null) {
                this.List_FILE_UPLOAD = response.List_FILE_UPLOAD || [];
                // this.FILE_UPLOAD_TEMPLATE = response.FILE_UPLOAD_TEMPLATE;
                this.refreshUploadGrid();
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
        this.modalService.open(smallDataModal, { size: 'xl', windowClass: 'modal-holder' });
        
        // ตั้งค่าข้อมูลกลุ่มผู้ใช้งาน
        this.MAS_DEMAND_DRUG = data || this.old_MAS_DEMAND_DRUG;
    }

    onChangeDemandDrugYear(year: any) {
        this.selectedYear = year;
        this.loadDemandData();
    }

    getFileUploadsByType(typeUpload: number): any[] {
        return (this.List_FILE_UPLOAD || []).filter((x: any) => Number(x?.TYPE_UPLOAD) === Number(typeUpload));
    }

    switchDemandTab(tab: 'drug' | 'hospital'): void {
        this.demandTab = tab;
        this.refreshUploadGrid();
    }

    private refreshUploadGrid(): void {
        const currentType = this.demandTab === 'drug' ? 1 : 2;
        this.service.setGridData(this.getFileUploadsByType(currentType));
    }

    openFileDetail(demandDrugDetailModal: any, row: any): void {
        this.modalService.open(demandDrugDetailModal, { size: 'xl', windowClass: 'modal-holder' });
        this.List_Demand_Drug = [];
        this.serviceDetail.setGridData([]);
        const typeUpload = this.demandTab === 'drug' ? 1 : 2;
        if (typeUpload === 1) {
            let model ={
                FUNC_CODE: "FUNC-GET_DATA_MAS_DEMAND_DRUG_DETAIL",
                FILE_UPLOAD: row,
                AUTHEN_INFORMATION: this.userData
              }
              var getData = this.consService.GatewayGetData(model);
              getData.subscribe((response: any) => {
                //debugger;
                if (response.RESULT == null) {
                    this.List_Demand_Drug = this.mapDemandDrugRows(response.List_Demand_Drug || []);
                    this.serviceDetail.setGridData(this.List_Demand_Drug || []);
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
        }else{
            let model ={
                FUNC_CODE: "FUNC-GET_DATA_MAS_DEMAND_HOSPITAL_DETAIL",
                FILE_UPLOAD: row,
                AUTHEN_INFORMATION: this.userData
              }
              var getData = this.consService.GatewayGetData(model);
              getData.subscribe((response: any) => {
                 //debugger;
                 if (response.RESULT == null) {
                    this.List_Demand_Drug_Hospital = this.mapDemandHospitalRows(response.List_Demand_Drug_Hospital || []);
                    this.serviceDetail.setGridData(this.List_Demand_Drug_Hospital || []);
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
       
    }
    deleteFile(row: any) {
        Swal.fire({
            title: 'ยืนยันการลบ',
            text: 'คุณต้องการลบข้อมูลหรือไม่?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: 'rgb(3, 142, 220)',
            confirmButtonText: 'ลบ'
        }).then((result: any) => {
            if (result.isConfirmed) {
                const typeUpload = this.demandTab === 'drug' ? 1 : 2;
                let model ={
                    FUNC_CODE: "FUNC-DELETE_FILE_IMPORT",
                    IDA: row.IDA,
                    TYPE_UPLOAD: typeUpload,
                    AUTHEN_INFORMATION: this.userData
                }
                var getData = this.consService.GatewayGetData(model);
                getData.subscribe((response: any) => {
                    if (response.RESULT == null) {
                        Swal.fire({
                            title: 'สำเร็จ!',
                            text: 'ลบข้อมูลเรียบร้อยแล้ว',
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
    
    onSortDetail(column: string): void {
        this.serviceDetail.getSortData(column);
    }

    onSearchDetail(): void {
        this.serviceDetail.searchTerm = this.searchTermDetail;
    }

    saveEmailSend() {
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
                    FUNC_CODE: "FUNC-SAVE_DATA_MAS_DEMAND_DRUG",
                    MAS_DEMAND_DRUG: this.MAS_DEMAND_DRUG,
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

    deleteEmail(data: any) {
        Swal.fire({
            title: 'ยืนยันการลบ',
            text: 'คุณต้องการลบข้อมูลหรือไม่?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: 'rgb(3, 142, 220)',
            confirmButtonText: 'ลบ'
        }).then((result: any) => {
            if (result.isConfirmed) {
                let model ={
                    FUNC_CODE: "FUNC-DELETE_DATA_MAS_EMAIL_SEND",
                    MAS_EMAIL_SEND: data,
                    AUTHEN_INFORMATION: this.userData
                }
                var getData = this.consService.GatewayGetData(model);
                getData.subscribe((response: any) => {
                    if (response.RESULT == null) {
                        Swal.fire({
                            title: 'สำเร็จ!',
                            text: 'ลบข้อมูลเรียบร้อยแล้ว',
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

    openUploadExcelModal(uploadModalTpl: any, tab: 'drug' | 'hospital'): void {
        this.demandTab = tab;
        this.excelFile = null;

        // reset year default เป็น "ปัจจุบัน +/- 3"
        if (!this.selectedYear) {
            const currentYearBE = new Date().getFullYear() + 543;
            this.selectedYear = currentYearBE;
        }

        this.modalService.open(uploadModalTpl, { size: 'xl', windowClass: 'modal-holder' });
    }

    onExcelFileChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input?.files?.[0] ?? null;
        this.excelFile = file;
    }

    Export_FileExam(typeUpload: number) {
        return this.donwloadUrl + '?TYPE_UPLOAD=' + typeUpload;
    }

    downloadTemplate() {
        const typeUpload = this.demandTab === 'drug' ? 1 : 2;
        // สร้างข้อมูล template สำหรับ Excel
        window.open(this.Export_FileExam(typeUpload), '_blank');
    }

    uploadDemandExcel(): void {
        if (!this.excelFile) {
            Swal.fire({
                icon: 'warning',
                title: 'กรุณาเลือกไฟล์',
                text: 'โปรดเลือกไฟล์ Excel ก่อนอัปโหลด'
            });
            return;
        }

        // NOTE: ยังไม่แน่ใจ FUNC_CODE ของ backend
        // ถ้า backend ใช้ชื่อ/ฟิลด์ต่างจากนี้ บอกได้ เดี๋ยวผมปรับให้ตรง endpoint จริง
        const funcCode =
            this.demandTab === 'drug'
                ? 'FUNC-UPLOAD_DEMAND_DRUG_EXCEL'
                : 'FUNC-UPLOAD_DEMAND_HOSPITAL_EXCEL';

        const model = {
            FUNC_CODE: funcCode,
            YEAR: this.selectedYear,
            AUTHEN_INFORMATION: this.userData
        };

        const fd = new FormData();
        fd.append('MODEL', JSON.stringify(model));
        fd.append('file', this.excelFile, this.excelFile.name);

        this.consService.UploadData(fd).subscribe({
            next: (response: any) => {
                if (response?.RESULT == null) {
                    Swal.fire({
                        icon: 'success',
                        title: 'สำเร็จ',
                        text: 'อัปโหลดไฟล์ Excel เรียบร้อยแล้ว'
                    });
                    this.modalService.dismissAll();
                    this.loadDemandData();
                } else {
                    Swal.fire({
                        icon: 'warning',
                        title: 'เกิดข้อผิดพลาด!',
                        text: response?.RESULT || 'อัปโหลดไม่สำเร็จ'
                    });
                }
            },
            error: (err: any) => {
                console.error(err);
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: 'ไม่สามารถอัปโหลดข้อมูลได้'
                });
            }
        });
    }

    private mapDemandDrugRows(rows: any[]): any[] {
        return (rows || []).map((row: any) => ({
            ...row,
            ProductTradeName: row?.ProductTradeName ?? row?.DRUG_NAME ?? '-',
            QTY: row?.QTY ?? row?.QUANTITY ?? 0,
            UNIT_NAME: row?.UNIT_NAME ?? row?.UNIT ?? '-'
        }));
    }

    private mapDemandHospitalRows(rows: any[]): any[] {
        return (rows || []).map((row: any) => ({
            ...row,
            CustomerTypeName: row?.CustomerTypeName ?? row?.CUSTOMER_TYPE_NAME ?? '-',
            QTY: row?.QTY ?? row?.QUANTITY ?? 0,
            // alias ให้ตาราง detail เดิมแสดงได้ทันที
            ProductTradeName: row?.CustomerTypeName ?? row?.CUSTOMER_TYPE_NAME ?? '-',
            UNIT_NAME: row?.UNIT_NAME ?? row?.UNIT ?? '-'
        }));
    }
}