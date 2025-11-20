import { Component, ElementRef, ViewChild, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { FormGroup, FormBuilder, FormArray, FormControl, FormControlName, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GridJsService } from '../../tables/gridjs/gridjs.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { GridJsModel } from '../../tables/gridjs/gridjs.model';
import { DecimalPipe } from '@angular/common';
import { get } from 'lodash';
import Swal from 'sweetalert2';
import { ConsService } from 'src/app/core/services/cons.service';
import { DropzoneComponent, DropzoneDirective } from 'ngx-dropzone-wrapper';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import {
    ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexStroke, ApexTitleSubtitle,
    ApexXAxis, ApexYAxis, ApexGrid, ApexTooltip, ChartComponent, ApexLegend, ApexFill
  } from 'ng-apexcharts';


  export type LineChartOptions = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    dataLabels: ApexDataLabels;
    stroke: ApexStroke;
    xaxis: ApexXAxis;
    yaxis: ApexYAxis;
    grid: ApexGrid;
    tooltip: ApexTooltip;
    legend: ApexLegend;
    title: ApexTitleSubtitle;
    fill: ApexFill;
  };
  
  interface Kpis {
    stockRiskCount: number;
    avgDOH: number;
    nearExpiry: { d30: number; d60: number; d90: number; value90: number };
    purchaseRequests: { pending: number; approved: number; amountApproved: number };
    poOpen: { count: number; amount: number };
    forecastAccuracyPrevMonth: { mape: number; wape: number };
  }
  
  interface StockRiskRow {
    productCode: string; tradeName: string; soh: number; onOrder: number;
    avgDailyUse: number; doh: number; rop: number; suggestedQty: number;
    unit: string; typeDrugName: string;
  }
  
  interface NearExpiryRow {
    productCode: string; tradeName: string; lot: string; expiryDate: string;
    daysToExpire: number; qty: number; unit: string; value: number;
  }
  
  interface ActionItem { type: string; title: string; due: string; link: string; amount?: number; }

  
@Component({
    selector: 'Dashboard',
    templateUrl: 'dashboard.component.html',
    styleUrls: ['./dashboard.component.css'],
    providers: [GridJsService, DecimalPipe, ConsService]
})

export class DashboardForecastComponent {

    // ======= Filters (mock) =======
    month = '2025-10';
    facilityId = '';
    typeDrugCode = '';
    groupDrugCode = '';

   
    typeDrugs = [
        { id: '', name: 'ทั้งหมด' },
        { id: '0988555C-1762-4221-9EB9-95C3FC2D6ABE', name: 'ยส. 4' },
        { id: '6500EACE-502C-4301-A1C3-3792D8735DD4', name: 'ยส. 2 / วจ. 2' },
    ];
    groupDrugs = [
        { id: '', name: 'ทั้งหมด' },
        { id: '0CB7AEDB-C9FB-4AEB-B604-9ABAA4EA714F', name: 'บรรเทาปวดในมะเร็ง' },
    ];

    // ======= Data =======
    loading = true;
    kpis?: Kpis;
    stockRisk: StockRiskRow[] = [];
    nearExpiry: NearExpiryRow[] = [];
    actions: ActionItem[] = [];

    @ViewChild('trendChart') trendChart?: ChartComponent;
    lineOptions: LineChartOptions | null = null;


    @ViewChild(DropzoneComponent) componentRef?: DropzoneComponent;
    @ViewChild(DropzoneDirective) directiveRef?: DropzoneDirective;
    // Table data
    gridjsList$!: Observable<GridJsModel[]>;
    total$: Observable<number>;
    // ตัวแปรเพิ่มเติม
    private dataSubscription: Subscription | null = null;
    private subscriptions: Subscription[] = [];
        // เพิ่มตัวแปร
        private lastLoadedYear: number | null = null;
    griddata: any;
    totalSize: number = 0;
    selectedTable: string = 'all'; // ค่าเริ่มต้นแสดงตารางทั้งหมด
    selectedDetail: string = ''; // ค่าเริ่มต้นแสดงตารางทั้งหมด
    userData: any;
    permissionData: any;
    select_year: any;
    list_year: any = [];
    List_Indications_Template: any = [];
    List_Indication_Report: any= [];
    List_Indication_Report_Month: any= [];
    List_Indications_Head: any= [];
    filter_List_Indications_Template: any = [];
         List_selectedTemplate: any = [];
     selectedData: any;
     chartData: any[] = [];
     chartOptions: any = {};
     barChartOptions: any = {};
    List_MAS_HEALTH_ZONE: any[] = [];
    List_MAS_REGION: any[] = [];
    List_MAS_MEDICAL_FACILITY: any[] = [];
    List_MAS_GROUP_DRUG: any[] = [];
    List_MAS_TYPE_DRUG: any[] = [];
    LIST_MAS_DRUG: any[] = [];
    LIST_DM_PRODUCT: any[] = [];
    list_period_stock: any[] = [];
    List_product: any[] = [];
    List_product_detail: any[] = [];
    List_Group_Drug: any[] = [];
    List_Group_Drug_detail: any[] = [];
    All_Approve: any[] = [];
    constructor(private modalService: NgbModal, public service: GridJsService
        , private sortService: PaginationService, public consService: ConsService
        , private authService: AuthenticationService) {
        this.gridjsList$ = service.countries$;
        this.total$ = service.total$;

    }

    ngOnInit(): void {
        this.userData = this.authService.getAuthen();
        this.permissionData = this.authService.getStoredPermission();
        this.list_period_stock = [
            {
                'IDA': 1,
                'Period_Name': 'เดือน'
            },
            {
                'IDA': 2,
                'Period_Name': 'ไตรมาส'
            },
            {
                'IDA': 3,
                'Period_Name': 'วันที่'
            }
    
        ];
        // --- Mock KPIs ---
        this.kpis = {
            stockRiskCount: 14,
            avgDOH: 19.4,
            nearExpiry: { d30: 5, d60: 12, d90: 22, value90: 1540000 },
            purchaseRequests: { pending: 3, approved: 6, amountApproved: 580000 },
            poOpen: { count: 4, amount: 345000 },
            forecastAccuracyPrevMonth: { mape: 11.7, wape: 9.3 }
        };

        // --- Mock Trend Series (Actual vs Forecast) ---
        this.lineOptions = {
            chart: {
                type: 'line',
                height: 330,
                toolbar: { show: false }
            },
            stroke: { curve: 'smooth', width: 3 },
            dataLabels: { enabled: false },
            legend: { position: 'top' },
            xaxis: {
                categories: ['2025-06', '2025-07', '2025-08', '2025-09', '2025-10', '2025-11', '2025-12'],
                labels: { rotate: 0 }
            },
            yaxis: { decimalsInFloat: 0, forceNiceScale: true },
            grid: { strokeDashArray: 4 },
            tooltip: { shared: true, intersect: false },
            fill: { type: 'gradient', gradient: { opacityFrom: 0.35, opacityTo: 0.05 } },
            title: { text: 'ยอดใช้จริง vs พยากรณ์', align: 'left' },
            series: [
                { name: 'Actual', data: [820, 910, 880, 960] },
                { name: 'Forecast', data: [0, 0, 0, 0, 940, 970, 995] }
            ]
        };

        // --- Mock Top Stock Risk ---
        this.stockRisk = [
            {
                productCode: '3E8A1259-65AC-44B1-A3C0-23DBCE8DFBFE',
                tradeName: 'Pseudoephedrine HCl tablets 60 mg (1000 tab/box)',
                soh: 120, onOrder: 0, avgDailyUse: 15.3, doh: 7.8, rop: 260, suggestedQty: 200,
                unit: 'Box', typeDrugName: '(วจ. 2) วัตถุออกฤทธิ์ในประเภท 2'
            },
            {
                productCode: '097EBCD3-0F75-4AC0-98AA-A33B8AED586B',
                tradeName: 'Pethidine HCl inj. 50 mg/ml/amp (10 amp/box)',
                soh: 80, onOrder: 40, avgDailyUse: 12.0, doh: 6.7, rop: 180, suggestedQty: 100,
                unit: 'Box', typeDrugName: 'ยส. 2'
            },
        ];

        // --- Mock Near Expiry ---
        this.nearExpiry = [
            {
                productCode: '3E8A1259-65AC-44B1-A3C0-23DBCE8DFBFE',
                tradeName: 'Pseudoephedrine HCl tablets 60 mg (1000 tab/box)',
                lot: '968215', expiryDate: '2029-05-01', daysToExpire: 1295,
                qty: 120, unit: 'Box', value: 68400
            },
            {
                productCode: '097EBCD3-0F75-4AC0-98AA-A33B8AED586B',
                tradeName: 'Pethidine HCl inj. 50 mg/ml/amp (10 amp/box)',
                lot: 'AB-2231', expiryDate: '2026-02-15', daysToExpire: 490,
                qty: 50, unit: 'Box', value: 125000
            }
        ];

        // --- Mock Actions ---
        this.actions = [
            { type: 'PR_APPROVAL', title: 'อนุมัติคำขอซื้อ 03-19444/2568 (200,000 บาท)', due: '2025-10-14', link: '/purchases/requests/03-19444-2568' },
            { type: 'REORDER', title: 'สั่งซื้อ Pseudoephedrine: DOH < 10 วัน แนะนำ 200 Box', due: '2025-10-14', link: '/planning/suggestions' }
        ];

    


        this.list_year = this.generateYearRange();
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() + 543; // แปลงจาก ค.ศ. เป็น พ.ศ.
        const currentMonth = currentDate.getMonth() + 1; // getMonth() เริ่มจาก 0
        
        if (currentMonth > 9) {
            this.select_year = currentYear + 1;
        } else {
            this.select_year = currentYear;
        }
        // // Update today's date
        // this.today = new Date().toISOString().split('T')[0];

        // ย้ายการ subscribe ออกมาจากใน API call
        if (!this.dataSubscription) {
            this.gridjsList$ = this.service.countries$;
            this.dataSubscription = this.gridjsList$.subscribe((data: any) => {
                this.griddata = Object.assign([], data);
            });
            this.subscriptions.push(this.dataSubscription);
        }
        // โหลดข้อมูลเฉพาะเมื่อยังไม่เคยโหลด หรือเมื่อ select_year เปลี่ยน
        if (this.lastLoadedYear !== this.select_year) {
            this.loadDataFromApi();
        }
    }

    // ======= Helpers UI =======
    dohClass(value: number): string {
        if (value < 10) return 'dashboard-badge danger';
        if (value < 20) return 'dashboard-badge warn';
        return 'dashboard-badge ok';
    }

    expiryClass(days: number): string {
        if (days <= 30) return 'dashboard-badge danger';
        if (days <= 90) return 'dashboard-badge warn';
        return 'dashboard-badge ok';
    }

    currency(n: number | null | undefined): string {
        if (n == null) return '-';
        return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
    }

    // เรียกซ้ำเมื่อเปลี่ยน filter
    applyFilters(): void {
        // TODO: เปลี่ยนจาก mock → ยิง API โดยส่ง month/facilityId/typeDrugCode/groupDrugCode
        // this.loadAll();
    }

    generateYearRange(): number[] {
        let currentYear = new Date().getFullYear();
        if (currentYear < 2500) {
            currentYear += 543;
        }
        this.select_year = currentYear;
        const startYear = currentYear + 2; // เริ่มจาก +2 ปี
        const endYear = currentYear - 5; // ย้อนหลัง 5 ปี

        return Array.from({ length: startYear - endYear + 1 }, (_, i) => startYear - i);
    }


    ngOnDestroy(): void {
        // Unsubscribe จากทุก subscription เพื่อป้องกัน memory leak
        if (this.dataSubscription) {
            this.dataSubscription.unsubscribe();
        }
        
        this.subscriptions.forEach(subscription => {
            if (subscription && !subscription.closed) {
                subscription.unsubscribe();
            }
        });
        
        this.subscriptions = [];
    }

    loadDataFromApi(): void {
        let model = {
            PROCESS_CODE: '',
            FUNC_CODE: "FUNC-GET_DATA-STOCK_MAIN",
            //AUTHEN_INFORMATION: $scope.FULL_MODEL.AUTHEN_INFORMATION,
            IDA: 0
        }
        var getData = this.consService.GatewayGetData(model);
        getData.subscribe((response: any) => {
            this.List_MAS_HEALTH_ZONE = response.List_MAS_HEALTH_ZONE;
            this.List_MAS_REGION = response.List_MAS_REGION;
            this.List_MAS_MEDICAL_FACILITY = response.List_MAS_MEDICAL_FACILITY;
            this.List_MAS_GROUP_DRUG = response.List_MAS_GROUP_DRUG;
            this.List_MAS_TYPE_DRUG = response.List_MAS_TYPE_DRUG;
            this.LIST_MAS_DRUG = response.LIST_MAS_DRUG;
            this.LIST_DM_PRODUCT = response.LIST_DM_PRODUCT;


            this.loadDataService();
        });
    }

    loadDataService(): void {
        let model = {
            AUTHEN_INFORMATION: this.userData
        }
        var getData = this.consService.GetService(model);
        getData.subscribe((response: any) => {
            if(response.is_success == true){
               if(response != undefined){
                // เรียกข้อมูล inventory
                this.processInventoryData(response);
               }
            }else{
                Swal.fire({
                    icon: 'error',
                    title: 'การดึงข้อมูลล้มเหลว',
                    text: response.message
                });
            }
        });
    }


    processInventoryData(datas_inv: any): void {
        // รีเซ็ตข้อมูล
        this.List_product = [];
        this.List_product_detail = [];

        var list_inv = datas_inv.inventorys.length;
        for (var i = 0; i < list_inv; i++) {
            var dm_detail = this.LIST_DM_PRODUCT.filter(g => g.ProductCode === datas_inv.inventorys[i].item_master_id.toUpperCase() && g.LOT == datas_inv.inventorys[i].lot_number);
            if (dm_detail.length != 0) {
                var mock = {
                    'type': dm_detail[0].ProductTypeName,
                    'ProductTypeCode': dm_detail[0].ProductTypeCode,
                    'ProductTypeName': dm_detail[0].ProductTypeName,
                    'NarcoticGroupName': dm_detail[0].NarcoticGroupName,
                    'NarcoticGroupCode': dm_detail[0].NarcoticGroupCode,
                    'LOT': datas_inv.inventorys[i].lot_number,
                    'procure_date': datas_inv.inventorys[i].mfg_date,
                    'exp_date': datas_inv.inventorys[i].exp_date,
                    'capital_price': parseFloat(dm_detail[0].ProductPrice),
                    'Receive_date': datas_inv.inventorys[i].receive_date,
                    'ProductCode': dm_detail[0].ProductCode,
                    'ProductTradeName': datas_inv.inventorys[i].description,
                    'inspection_qty': parseFloat(datas_inv.inventorys[i].quantity_available),
                    'total_price': parseFloat(dm_detail[0].ProductPrice) * parseFloat(datas_inv.inventorys[i].quantity_available),
                    'ProductUnitName': datas_inv.inventorys[i].uom_prompt
                }
                this.List_product.push(mock);

                var mock_detail = {
                    'type': dm_detail[0].ProductTypeName,
                    'ProductTypeCode': dm_detail[0].ProductTypeCode,
                    'ProductTypeName': dm_detail[0].ProductTypeName,
                    'NarcoticGroupName': dm_detail[0].NarcoticGroupName,
                    'NarcoticGroupCode': dm_detail[0].NarcoticGroupCode,
                    'LOT': datas_inv.inventorys[i].lot_number,
                    'procure_date': datas_inv.inventorys[i].mfg_date,
                    'Receive_date': datas_inv.inventorys[i].receive_date,
                    'exp_date': datas_inv.inventorys[i].exp_date,
                    'capital_price': parseFloat(dm_detail[0].ProductPrice),
                    'ProductCode': dm_detail[0].ProductCode,
                    'ProductTradeName': datas_inv.inventorys[i].description,
                    'ProductAmount': parseFloat(datas_inv.inventorys[i].quantity_available),
                    'total_price': parseFloat(dm_detail[0].ProductPrice) * parseFloat(datas_inv.inventorys[i].quantity_available),
                    'ProductUnitName': datas_inv.inventorys[i].uom_prompt
                }
                this.List_product_detail.push(mock_detail);
            }
        }

        this.List_Group_Drug_detail = this.groupDataByGroup_Detail_Stock(this.List_product_detail);
        this.List_Group_Drug = this.groupDataStock(this.List_product);
        this.All_Approve = this.groupDataByGroup_Import(this.List_Group_Drug, this.List_MAS_TYPE_DRUG);
    }

    groupDataStock(data: any[]): any[] {
        const groupedData: any = {};
        const groupedData_Detail: any = {};
        data.forEach(item => {
            const type = item.ProductCode + '-' + item.LOT + '-' + item.exp_date + '-' + item.Receive_date;
            if (!groupedData[type]) {
                groupedData[type] = {
                    type: item.type,
                    ProductTypeCode: item.ProductTypeCode,
                    ProductTypeName: item.ProductTypeName,
                    NarcoticGroupName: item.NarcoticGroupName,
                    NarcoticGroupCode: item.NarcoticGroupCode,
                    LOT: item.LOT,
                    procure_date: item.procure_date,
                    exp_date: item.exp_date,
                    capital_price: item.capital_price,
                    Receive_date: item.Receive_date,
                    ProductCode: item.ProductCode,
                    ProductTradeName: item.ProductTradeName,
                    inspection_qty: item.inspection_qty,
                    total_price: item.total_price,
                    ProductUnitName: item.ProductUnitName
                };
            } else {
                groupedData[type] = {
                    type: item.type,
                    ProductTypeCode: item.ProductTypeCode,
                    ProductTypeName: item.ProductTypeName,
                    NarcoticGroupName: item.NarcoticGroupName,
                    NarcoticGroupCode: item.NarcoticGroupCode,
                    LOT: item.LOT,
                    procure_date: item.procure_date,
                    exp_date: item.exp_date,
                    capital_price: item.capital_price,
                    Receive_date: item.Receive_date,
                    ProductCode: item.ProductCode,
                    ProductTradeName: item.ProductTradeName,
                    inspection_qty: groupedData[type].inspection_qty + item.inspection_qty,
                    total_price: groupedData[type].total_price + item.total_price,
                    ProductUnitName: item.ProductUnitName
                };
            }
        });

        const groupedArray = Object.values(groupedData);
        return groupedArray;
    }

    // ฟังก์ชันที่ยังไม่ได้ implement - ต้องเพิ่มตามความต้องการ
    groupDataByGroup_Detail_Stock(data: any[]): any[] {
        // TODO: Implement this function
        return data;
    }

    groupDataByGroup_Import(data: any[], typeDrug: any[]): any[] {
        // TODO: Implement this function
        return data;
    }

}
