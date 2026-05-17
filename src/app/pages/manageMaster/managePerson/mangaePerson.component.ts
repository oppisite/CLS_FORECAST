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
import { get } from 'lodash';
import Swal from 'sweetalert2';
import { ConsService } from 'src/app/core/services/cons.service';
import { AuthenticationService } from 'src/app/core/services/auth.service';



@Component({
    selector: 'managePerson',
    templateUrl: 'managePerson.component.html', 
    providers: [GridJsService, DecimalPipe, ConsService]
})
export class managePersonComponent {
    // Table data
    gridjsList$!: Observable<GridJsModel[]>;
    total$: Observable<number>;
    griddata: any;
    totalSize: number = 0;
    select_year:any;
    Mas_Personal: any;
    old_Mas_Personal: any;
    private dataSubscription: any;
    List_Group_Permission: any[] = [];
    selectedGroupPermission: any;
    selectedDepartment: any;
    permissionData: any;
    userData: any;
    List_Personal_Group_Permission: any[] = [];
    List_Mas_Department: any[] = [];
    List_Mas_Personal: any[] = [];

    constructor(private modalService: NgbModal, public service: GridJsService
        , private sortService: PaginationService, public consService: ConsService
        , private authService: AuthenticationService) {
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

        let model ={
            FUNC_CODE: "FUNC-GET_DATA_PERSONAL",
          }
          var getData = this.consService.GatewayGetData(model);
          getData.subscribe((response: any) => {
            //debugger;
            if (response.RESULT == null) {
                this.Mas_Personal = response.MAS_PERSONAL;
                this.old_Mas_Personal = response.MAS_PERSONAL;
                this.List_Group_Permission = response.List_Group_Permission;
                this.List_Mas_Personal = response.List_MAS_PERSONAL;
                this.service.setGridData(this.List_Mas_Personal);
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
         this.Mas_Personal = data || this.old_Mas_Personal;
         this.selectedGroupPermission = '';
         this.selectedDepartment = '';
         this.List_Personal_Group_Permission = [];
         
         // โหลดข้อมูลเมนูที่กำหนดให้กลุ่มนี้
         let model ={
             FUNC_CODE: "FUNC-GET_DATA_PERSONAL_PERMISSION",
             MAS_PERSONAL: data
           }
           var getData = this.consService.GatewayGetData(model);
           getData.subscribe((response: any) => {
             //debugger;
             if (response.RESULT == null) {
                 this.List_Personal_Group_Permission = response.List_Personal_Group_Permission;
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

     // เพิ่มเมนู
     addGroupPermission() {
        if (!this.selectedGroupPermission) {
            Swal.fire({
                title: 'แจ้งเตือน!',
                text: 'กรุณาเลือกกลุ่มสิทธิ์',
                icon: 'warning',
                confirmButtonColor: 'rgb(3, 142, 220)',
                confirmButtonText: 'OK'
            });
            return;
        }

        const selectedGroup = this.List_Group_Permission.find(menu => menu.IDA.toString() === this.selectedGroupPermission);
        if (selectedGroup) {
            var mockData = {
                Group_Id: this.selectedGroupPermission,
                Group_Name: selectedGroup.Group_Name,
            }
            this.List_Personal_Group_Permission.push(mockData);
            this.selectedGroupPermission = '';
            this.selectedDepartment = '';
        }
    }

    saveGroupPermission() {
        const name = (this.Mas_Personal?.NAME ?? '').toString().trim();
        const identify = (this.Mas_Personal?.IDENTIFY ?? '').toString().trim();

        if (!name) {
            Swal.fire({
                title: 'แจ้งเตือน!',
                text: 'กรุณากรอกชื่อผู้ใช้งาน',
                icon: 'warning',
                confirmButtonColor: 'rgb(3, 142, 220)',
                confirmButtonText: 'OK'
            });
            return;
        }
        if (!identify || identify.length !== 13) {
            Swal.fire({
                title: 'แจ้งเตือน!',
                text: 'กรุณากรอกเลขประจำตัวประชาชน 13 หลัก',
                icon: 'warning',
                confirmButtonColor: 'rgb(3, 142, 220)',
                confirmButtonText: 'OK'
            });
            return;
        }

        Swal.fire({
            title: 'ยืนยันการบันทึก',
            text: 'คุณต้องการบันทึกข้อมูลหรือไม่?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: 'rgb(3, 142, 220)',
            confirmButtonText: 'บันทึก'
        }).then((result) => {
            if (result.isConfirmed) {
                // ส่งฟิลด์ตามตาราง: NAME, IDENTIFY และ IDA (ถ้าเป็นการแก้ไข)
                const masPersonal = {
                    NAME: name,
                    IDENTIFY: identify,
                    ...(this.Mas_Personal?.IDA != null && this.Mas_Personal?.IDA !== '' && { IDA: this.Mas_Personal.IDA })
                };

                const dataToSave = this.List_Personal_Group_Permission.map((item: any) => ({
                    Group_Id: item.Group_Id,
                    Group_Name: item.Group_Name,
                    AUTHEN_INFORMATION: this.userData
                }));

                const model = {
                    FUNC_CODE: 'FUNC-SAVE_DATA_PERSONAL_PERMISSION',
                    AUTHEN_INFORMATION: this.userData,
                    MAS_PERSONAL: masPersonal,
                    List_Personal_Group_Permission: dataToSave
                };
                const getData = this.consService.GatewayGetData(model);
                getData.subscribe((response: any) => {
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
        });
    }
    // ลบเมนู
    removeGroupPermission(index: number) {
        this.List_Personal_Group_Permission.splice(index, 1);
    }

    deletePerson(data: any) {
        Swal.fire({
            title: 'ยืนยันการลบ',
            text: 'คุณต้องการลบข้อมูลผู้ใช้งานนี้หรือไม่?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: 'rgb(3, 142, 220)',
            confirmButtonText: 'ลบ'
        }).then((result) => {
            if (result.isConfirmed) {
                let model ={
                    FUNC_CODE: "FUNC-DELETE_DATA_PERSONAL",
                    MAS_PERSONAL: data
                }
                var getData = this.consService.GatewayGetData(model);
                getData.subscribe((response: any) => {
                    //debugger;
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
}