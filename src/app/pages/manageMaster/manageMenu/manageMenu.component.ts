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
    selector: 'manageMenu',
    templateUrl: 'manageMenu.component.html', 
    providers: [GridJsService, DecimalPipe, ConsService]
})
export class manageMenuComponent {
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
            FUNC_CODE: "FUNC-GET_DATA_PERMISSION_MENU",
          }
          var getData = this.consService.GatewayGetData(model);
          getData.subscribe((response: any) => {
            //debugger;
            if (response.RESULT == null) {
                this.Group_Permission = response.Group_Permission;
                this.old_Group_Permission = response.Group_Permission;
                this.List_Group_Permission = response.List_Group_Permission;
                this.List_tb_group_menu = response.List_tb_group_menu;
                this.service.setGridData(this.List_Group_Permission);
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
        this.Group_Permission = data || '';
        this.selectedMenuGroup = '';
        this.assignedMenus = [];
        
        // โหลดข้อมูลเมนูที่กำหนดให้กลุ่มนี้
        let model ={
            FUNC_CODE: "FUNC-GET_DATA_PERMISSION_MENU_GROUP",
            Group_Id: data.IDA
          }
          var getData = this.consService.GatewayGetData(model);
          getData.subscribe((response: any) => {
            //debugger;
            if (response.RESULT == null) {
                this.List_permission_group = response.List_permission_group.map((item: any) => {
                    let Groupname = this.List_tb_group_menu.find(menu => menu.IDA === item.GroupMenuId);
                    return {
                        GroupId: item.GroupId,
                        GroupMenuId: item.GroupMenuId,
                        GroupMenuName: Groupname.GROUP_NAME,
                        isTitle: Groupname.isTitle
                    }
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

    // เพิ่มเมนู
    addMenu() {
        if (!this.selectedMenuGroup) {
            Swal.fire({
                title: 'แจ้งเตือน!',
                text: 'กรุณาเลือกกลุ่มเมนู',
                icon: 'warning',
                confirmButtonColor: 'rgb(3, 142, 220)',
                confirmButtonText: 'OK'
            });
            return;
        }

        const selectedMenu = this.List_tb_group_menu.find(menu => menu.IDA.toString() === this.selectedMenuGroup);
        if (selectedMenu) {
            // ตรวจสอบว่าเมนูนี้มีอยู่แล้วหรือไม่
            const existingMenu = this.List_permission_group.find(menu => menu.GroupMenuId === selectedMenu.IDA);
            if (existingMenu) {
                this.selectedMenuGroup = '';
                Swal.fire({
                    title: 'แจ้งเตือน!',
                    text: 'เมนูนี้มีอยู่แล้วในรายการ',
                    icon: 'warning',
                    confirmButtonColor: 'rgb(3, 142, 220)',
                    confirmButtonText: 'OK'
                });
                return;
            }
            var mockData = {
                GroupId: this.Group_Permission.IDA,
                GroupMenuId: selectedMenu.IDA,
                GroupMenuName: selectedMenu.GROUP_NAME,
                isTitle: selectedMenu.isTitle
            }
            this.List_permission_group.push(mockData);
            this.selectedMenuGroup = '';
        }
    }

    saveMenu() {
        Swal.fire({
            title: 'ยืนยันการบันทึก',
            text: 'คุณต้องการบันทึกข้อมูลหรือไม่?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: 'rgb(3, 142, 220)',
            confirmButtonText: 'บันทึก'
        }).then((result) => {
            if (result.isConfirmed) {
                // สร้างข้อมูลสำหรับส่งไป API โดยเอา isTitle และ GroupMenuName ออก
                const dataToSave = this.List_permission_group.map(item => ({
                    GroupId: item.GroupId,
                    GroupMenuId: item.GroupMenuId,
                    AUTHEN_INFORMATION: this.userData
                }));
                
                let model ={
                    FUNC_CODE: "FUNC-SAVE_DATA_PERMISSION_MENU",
                    Group_Permission: this.Group_Permission,
                    List_permission_group: dataToSave
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
    removeMenu(index: number) {
        this.List_permission_group.splice(index, 1);
    }
}