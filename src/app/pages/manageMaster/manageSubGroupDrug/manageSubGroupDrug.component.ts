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
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { ConsService } from 'src/app/core/services/cons.service';


@Component({
    selector: 'manageSubGroupDrug',
    templateUrl: 'manageSubGroupDrug.component.html', 
    providers: [GridJsService, DecimalPipe, ConsService]
})
export class manageSubGroupDrugComponent {
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
    List_MAS_Product_SubGroup: any;
    MAS_Product_SubGroup: any;
    old_MAS_Product_SubGroup: any;
    constructor(private modalService: NgbModal, public service: GridJsService
        , private sortService: PaginationService
        , private authService: AuthenticationService, public consService: ConsService) {
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
            FUNC_CODE: "FUNC-GET_DATA_MANAGE_SUBGROUPDRUG",
            AUTHEN_INFORMATION: this.userData
          }
          var getData = this.consService.GatewayGetData(model);
          getData.subscribe((response: any) => {
            //debugger;
            if (response.RESULT == null) {
                this.List_MAS_Product_SubGroup = response.List_MAS_Product_SubGroup;
                this.old_MAS_Product_SubGroup = response.MAS_Product_SubGroup;
                this.MAS_Product_SubGroup = response.MAS_Product_SubGroup;
                this.service.setGridData(this.List_MAS_Product_SubGroup);
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
        this.modalService.open(smallDataModal, { size: 'xl', windowClass: 'modal-holder' });
        
        // ตั้งค่าข้อมูลกลุ่มผู้ใช้งาน
        this.MAS_Product_SubGroup = data;

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
                if(this.MAS_Product_SubGroup.SubGroupDrugName == null || this.MAS_Product_SubGroup.SubGroupDrugName == ''){
                    Swal.fire({
                        title: 'เกิดข้อผิดพลาด!',
                        text: 'กรุณากรอกชื่อกลุ่มยาย่อย',
                        icon: 'warning',
                        confirmButtonColor: 'rgb(3, 142, 220)',
                        confirmButtonText: 'OK'
                    });
                }
                // สร้างข้อมูลสำหรับส่งไป API โดยเอา isTitle และ GroupMenuName ออก
                delete this.MAS_Product_SubGroup.Create_Date;
                delete this.MAS_Product_SubGroup.Update_Date;
                let model ={
                    FUNC_CODE: "FUNC-SAVE_DATA_MANAGE_SUBGROUPDRUG",
                    MAS_Product_SubGroup: this.MAS_Product_SubGroup
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
    // ลบเมนู
    deleteData(data: any) {
        Swal.fire({
            title: 'ยืนยันการลบ',
            text: 'คุณต้องการลบข้อมูลหรือไม่?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: 'rgb(3, 142, 220)',
            confirmButtonText: 'ลบ'
        }).then((result) => {
            if (result.isConfirmed) {
                delete data.Create_Date;
                delete data.Update_Date;
                let model ={
                    FUNC_CODE: "FUNC-DELETE_DATA_MANAGE_SUBGROUPDRUG",
                    MAS_Product_SubGroup: data
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