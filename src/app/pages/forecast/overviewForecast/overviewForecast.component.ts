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
    ApexXAxis, ApexYAxis, ApexGrid, ApexTooltip, ChartComponent, ApexLegend, ApexFill, ApexMarkers,
    ApexStates, ApexAnnotations, ApexPlotOptions, ApexResponsive
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
    colors?: string[];
    markers?: ApexMarkers;
    states?: ApexStates;
    annotations?: ApexAnnotations; 
  };

  export type BarChartOptions = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    dataLabels: ApexDataLabels;
    plotOptions?: ApexPlotOptions;
    stroke?: ApexStroke;
    xaxis: ApexXAxis;
    yaxis: ApexYAxis;
    grid: ApexGrid;
    tooltip: ApexTooltip;
    legend: ApexLegend;
    title: ApexTitleSubtitle;
    colors?: string[];
    responsive?: ApexResponsive[];
  };

  export type DonutChartOptions = {
    series: number[];
    chart: ApexChart;
    dataLabels: ApexDataLabels;
    labels: string[];
    legend: ApexLegend;
    title: ApexTitleSubtitle;
    colors?: string[];
    plotOptions?: ApexPlotOptions;
    tooltip: ApexTooltip;
  };

  export type BubbleChartOptions = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    dataLabels: ApexDataLabels;
    plotOptions?: ApexPlotOptions;
    xaxis: ApexXAxis;
    yaxis: ApexYAxis;
    grid: ApexGrid;
    tooltip: ApexTooltip;
    legend: ApexLegend;
    title: ApexTitleSubtitle;
    colors?: string[];
    fill: ApexFill;
    responsive?: ApexResponsive[];
  };
  
  interface Kpis {
    stockRiskCount: number;
    avgDOH: number;
    nearExpiry: { d30: number; d60: number; d90: number; };
    purchaseRequests: { pending: number; approved: number; amountApproved: number };
    poOpen: { count: number; amount: number };
    forecastAccuracyPrevMonth: { mape: number; wape: number };
    RiskItem: any[];
    RiskItemNearExpiry: any[];
    totalQuantity: number;
    totalValue: number;
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
    selector: 'OverviewForecast',
    templateUrl: 'overviewForecast.component.html',
    styleUrls: ['./overviewForecast.component.css'],
    providers: [GridJsService, DecimalPipe, ConsService]
})

export class OverviewForecastComponent {

    // ======= Filters (mock) =======
    month = '2025-10';
    facilityId = '';
    typeDrugCode = '';
    groupDrugCode = '';
    drugCode = '';
    regionId = '';
    healthZoneId = '';
    // ======= Period Selection =======
    periodId: number | null = null;
    periodName = '';
    monthId: number | null = null;
    quarterId: number | null = null;
    dateStart = '';
    dateEnd = '';
    
    // ======= Period Lists =======
    listPeriod = [
        { IDA: 1, Period_Name: 'วัน' },
        { IDA: 2, Period_Name: 'เดือน' },
        { IDA: 3, Period_Name: 'ไตรมาส' },
        { IDA: 4, Period_Name: 'ปี' }
    ];
    
    listMonth = [
        { IDA: 1, MONTH: 'มกราคม' },
        { IDA: 2, MONTH: 'กุมภาพันธ์' },
        { IDA: 3, MONTH: 'มีนาคม' },
        { IDA: 4, MONTH: 'เมษายน' },
        { IDA: 5, MONTH: 'พฤษภาคม' },
        { IDA: 6, MONTH: 'มิถุนายน' },
        { IDA: 7, MONTH: 'กรกฎาคม' },
        { IDA: 8, MONTH: 'สิงหาคม' },
        { IDA: 9, MONTH: 'กันยายน' },
        { IDA: 10, MONTH: 'ตุลาคม' },
        { IDA: 11, MONTH: 'พฤศจิกายน' },
        { IDA: 12, MONTH: 'ธันวาคม' }
    ];
    
    listQuarter = [
        { IDA: 1, QUARTER: 'ไตรมาส 1' },
        { IDA: 2, QUARTER: 'ไตรมาส 2' },
        { IDA: 3, QUARTER: 'ไตรมาส 3' },
        { IDA: 4, QUARTER: 'ไตรมาส 4' }
    ];

   
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
    
    // Chart options สำหรับกราฟต่างๆ
    stockRopChartOptions: BarChartOptions | null = null;
    drugGroupDonutOptions: DonutChartOptions | null = null;
    inventoryValueBarOptions: BarChartOptions | null = null;
    riskBubbleOptions: BubbleChartOptions | null = null;


    @ViewChild(DropzoneComponent) componentRef?: DropzoneComponent;
    @ViewChild(DropzoneDirective) directiveRef?: DropzoneDirective;
    // Table data
    gridjsList$!: Observable<GridJsModel[]>;
    total$: Observable<number>;
    // ตัวแปรเพิ่มเติมสำหรับ Risk Items
    gridjsListRisk$!: Observable<GridJsModel[]>;
    totalRisk$: Observable<number>;
    griddataRisk: any[] = [];
    // ตัวแปรเพิ่มเติมสำหรับ Near Expiry
    gridjsListNearExpiry$!: Observable<GridJsModel[]>;
    totalNearExpiry$: Observable<number>;
    griddataNearExpiry: any[] = [];
    // ตัวแปรเพิ่มเติมสำหรับ Detail
    gridjsListDetail$!: Observable<GridJsModel[]>;
    totalDetail$: Observable<number>;
    griddataDetail: any[] = [];
    // ตัวแปรเพิ่มเติมสำหรับ LIST_MAS_DRUG
    gridjsListMasDrug$!: Observable<GridJsModel[]>;
    totalMasDrug$: Observable<number>;
    griddataMasDrug: any[] = [];
    // ตัวแปรเพิ่มเติม
    private dataSubscription: Subscription | null = null;
    private subscriptions: Subscription[] = [];
    private dataSubscriptionRisk: Subscription | null = null;
    private dataSubscriptionNearExpiry: Subscription | null = null;
    private dataSubscriptionDetail: Subscription | null = null;
    private dataSubscriptionMasDrug: Subscription | null = null;
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
    old_List_MAS_HEALTH_ZONE: any[] = []; // เก็บข้อมูลเดิมทั้งหมด
    List_MAS_REGION: any[] = [];
    List_MAS_MEDICAL_FACILITY: any[] = [];
    List_MAS_GROUP_DRUG: any[] = [];
    List_MAS_TYPE_DRUG: any[] = [];
    LIST_MAS_DRUG: any[] = [];
    filteredDrugs: any[] = [];
    LIST_DM_PRODUCT: any[] = [];
    list_period_stock: any[] = [];
    List_product: any[] = [];
    List_product_detail: any[] = [];
    List_Group_Drug: any[] = [];
    List_Group_Drug_detail: any[] = [];
    All_Approve: any[] = [];
    list_month: any[] = [];
    list_quater: any[] = [];
    Group_Pay_Drug: any[] = [];
    // Service instances แยกกันสำหรับแต่ละตาราง
    public serviceRisk: GridJsService;
    public serviceNearExpiry: GridJsService;
    public serviceDetail: GridJsService;
    public serviceMasDrug: GridJsService;
    Detail_product: any[] = [];

    constructor(private modalService: NgbModal, public service: GridJsService
        , private sortService: PaginationService, public consService: ConsService
        , private authService: AuthenticationService, private decimalPipe: DecimalPipe) {
        this.gridjsList$ = service.countries$;
        this.total$ = service.total$;

        // สร้าง service instances แยกกันสำหรับแต่ละตาราง
        this.serviceRisk = new GridJsService(decimalPipe);
        this.serviceNearExpiry = new GridJsService(decimalPipe);
        this.serviceDetail = new GridJsService(decimalPipe);
        this.serviceMasDrug = new GridJsService(decimalPipe);

        this.gridjsListRisk$ = this.serviceRisk.countries$;
        this.totalRisk$ = this.serviceRisk.total$;

        this.gridjsListNearExpiry$ = this.serviceNearExpiry.countries$;
        this.totalNearExpiry$ = this.serviceNearExpiry.total$;

        this.gridjsListDetail$ = this.serviceDetail.countries$;
        this.totalDetail$ = this.serviceDetail.total$;

        this.gridjsListMasDrug$ = this.serviceMasDrug.countries$;
        this.totalMasDrug$ = this.serviceMasDrug.total$;

    }

    ngOnInit(): void {
        this.userData = this.authService.getAuthen();
        this.permissionData = this.authService.getStoredPermission();
        
        // Set default date values
        this.dateStart = this.getDate30DaysAgo();
        this.dateEnd = this.getCurrentDate();
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

        this.list_quater =  [
            {
                'IDA': 1,
                'QUATER': 'ไตรมาสที่ 1'
            },
            {
                'IDA': 2,
                'QUATER': 'ไตรมาสที่ 2'
            },
            {
                'IDA': 3,
                'QUATER': 'ไตรมาสที่ 3'
            },
            {
                'IDA': 4,
                'QUATER': 'ไตรมาสที่ 4'
            }
        ];

        this.list_month =  [
            {
                'IDA': 1,
                'MONTH': 'มกราคม'
            },
            {
                'IDA': 2,
                'MONTH': 'กุมภาพันธ์'
            },
            {
                'IDA': 3,
                'MONTH': 'มีนาคม'
            },
            {
                'IDA': 4,
                'MONTH': 'เมษายน'
            },
            {
                'IDA': 5,
                'MONTH': 'พฤษภาคม'
            },
            {
                'IDA': 6,
                'MONTH': 'มิถุนายน'
            },
            {
                'IDA': 7,
                'MONTH': 'กรกฎาคม'
            },
            {
                'IDA': 8,
                'MONTH': 'สิงหาคม'
            },
            {
                'IDA': 9,
                'MONTH': 'กันยายน'
            },
            {
                'IDA': 10,
                'MONTH': 'ตุลาคม'
            },
            {
                'IDA': 11,
                'MONTH': 'พฤศจิกายน'
            },
            {
                'IDA': 12,
                'MONTH': 'ธันวาคม'
            }
        ];
        // --- Mock KPIs ---
        this.kpis = {
            stockRiskCount: 0,
            avgDOH: 0,
            nearExpiry: { d30: 0, d60: 0, d90: 0 },
            purchaseRequests: { pending: 0, approved: 0, amountApproved: 0 },
            poOpen: { count: 0, amount: 0 },
            forecastAccuracyPrevMonth: { mape: 0, wape: 0 },
            RiskItem: [],
            RiskItemNearExpiry: [],
            totalQuantity: 0,
            totalValue: 0
        };


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
        // Subscribe สำหรับ Risk Items
        if (!this.dataSubscriptionRisk) {
            this.dataSubscriptionRisk = this.gridjsListRisk$.subscribe((data: any) => {
                this.griddataRisk = Object.assign([], data);
            });
            this.subscriptions.push(this.dataSubscriptionRisk);
        }
        // Subscribe สำหรับ Near Expiry
        if (!this.dataSubscriptionNearExpiry) {
            this.dataSubscriptionNearExpiry = this.gridjsListNearExpiry$.subscribe((data: any) => {
                this.griddataNearExpiry = Object.assign([], data);
            });
            this.subscriptions.push(this.dataSubscriptionNearExpiry);
        }
        if (!this.dataSubscriptionDetail) {
            this.dataSubscriptionDetail = this.gridjsListDetail$.subscribe((data: any) => {
                this.griddataDetail = Object.assign([], data);
            });
            this.subscriptions.push(this.dataSubscriptionDetail);
        }
        // Subscribe สำหรับ LIST_MAS_DRUG
        if (!this.dataSubscriptionMasDrug) {
            this.dataSubscriptionMasDrug = this.gridjsListMasDrug$.subscribe((data: any) => {
                this.griddataMasDrug = Object.assign([], data);
            });
            this.subscriptions.push(this.dataSubscriptionMasDrug);
        }
        // โหลดข้อมูลเฉพาะเมื่อยังไม่เคยโหลด หรือเมื่อ select_year เปลี่ยน
        if (this.lastLoadedYear !== this.select_year) {
            this.loadDataFromApi();
        }
    }

    // ======= Helpers UI =======
    dohClass(value: number): string {
        if (value < 10) return 'danger';
        if (value < 20) return 'warn';
        return 'ok';
    }

    expiryClass(days: number): string {
        if (days <= 30) return 'danger';
        if (days <= 90) return 'warn';
        return 'ok';
    }

    currency(n: number | null | undefined): string {
        if (n == null) return '-';
        return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
    }

    // เรียกเมื่อเปลี่ยน period type
    choosePeriod(): void {
        const selectedPeriod = this.listPeriod.find(p => p.IDA === this.periodId);
        this.periodName = selectedPeriod ? selectedPeriod.Period_Name : '';
        
        // Reset dependent fields
        this.monthId = null;
        this.quarterId = null;
        this.dateStart = '';
        this.dateEnd = '';
        
        // Apply filters after period change
        this.applyFilters();
    }

    // Format date for display
    formatDateForInput(date: string | null): string {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    }

    // Get current date in YYYY-MM-DD format
    getCurrentDate(): string {
        return new Date().toISOString().split('T')[0];
    }

    // Get date 30 days ago
    getDate30DaysAgo(): string {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        return date.toISOString().split('T')[0];
    }

    // เรียกซ้ำเมื่อเปลี่ยน filter
    applyFilters(): void {
        // TODO: เปลี่ยนจาก mock → ยิง API โดยส่ง month/facilityId/typeDrugCode/groupDrugCode
        // this.loadAll();
        this.filterDrugs();
    }

    // เมื่อเปลี่ยนประเภทยา
    onTypeDrugChange(): void {
        this.applyFilters();
        this.drugCode = ''; // Reset dropdown ยา
    }

    // เมื่อเปลี่ยนกลุ่มยา
    onGroupDrugChange(): void {
        this.applyFilters();
        this.drugCode = ''; // Reset dropdown ยา
    }

    // เมื่อเปลี่ยนภูมิภาค - filter เขตสุขภาพตามภูมิภาค
    chg_region(): void {
        const re_id = this.regionId;
        
        // หา region object จาก List_MAS_REGION
        const objrow = this.List_MAS_REGION.filter((i: any) => i.IDA == re_id);
        
        // ถ้าไม่พบ region หรือ regionId เป็น '' หรือ '0' ให้แสดงทั้งหมด
        if (!re_id || re_id === '' || re_id === '0' || objrow.length === 0) {
            this.List_MAS_HEALTH_ZONE = [...this.old_List_MAS_HEALTH_ZONE];
        } else {
            // ดึง Region_Id จาก region object
            const re_code = objrow[0].Region_Id;
            
            // Filter เขตสุขภาพตาม Region_Id
            const objhealth = this.old_List_MAS_HEALTH_ZONE.filter((i: any) => i.Region_Id == re_code);
            this.List_MAS_HEALTH_ZONE = objhealth;
        }
        
        // Reset healthZoneId เมื่อเปลี่ยน region
        this.healthZoneId = '';
        
        // เรียก applyFilters เพื่ออัพเดทข้อมูล
        this.applyFilters();
    }

    // เมื่อเปลี่ยน period ของกราฟ
    onPeriodChange(): void {
        // เรียก prepareForecastChart ใหม่เมื่อเปลี่ยน period
        if (this.Group_Pay_Drug && this.List_product) {
            this.prepareForecastChart(this.Group_Pay_Drug, this.List_product, this.drugCode);
        }
    }

    // Filter ยาตามประเภทยาและกลุ่มยา
    filterDrugs(): void {
        this.filteredDrugs = (this.LIST_MAS_DRUG || []).filter((drug: any) => {
            // ถ้าไม่ได้เลือกค่าใดค่าหนึ่งให้ถือว่าผ่านเงื่อนไขนั้น
            const matchType = !this.typeDrugCode || drug.ProductTypeCode === this.typeDrugCode;
            const matchGroup = !this.groupDrugCode || drug.NarcoticGroupCode === this.groupDrugCode;
            return matchType && matchGroup;
        });
    }

    // Group ข้อมูลตาม Group Detail Stock
    groupDataByGroup_Detail_Stock(data: any[]): any[] {
        const groupedData: { [key: string]: any } = {};
        const groupedData_Detail: { [key: string]: any } = {};

        data.forEach(item => {
            const type = item.ProductTypeName + '-' + item.NarcoticGroupCode;
            if (!groupedData[type]) {
                groupedData[type] = {
                    head: {
                        Type: item.ProductTypeName,
                        Type_code: item.ProductTypeCode,
                        Group: item.NarcoticGroupName,
                        Group_code: item.NarcoticGroupCode
                    },
                    detail: []
                };
            }
        });

        const len_data = data.length;
        for (let i = 0; i < len_data; i++) {
            const head_g = data[i].ProductTypeName + '-' + data[i].NarcoticGroupCode;

            if (groupedData[head_g]) {
                const P_head = head_g + '-' + data[i].ProductCode;
                if (!groupedData_Detail[P_head]) {
                    groupedData_Detail[P_head] = {
                        CODE: P_head
                    };
                    groupedData[head_g].detail.push({
                        Type: data[i].ProductTypeName,
                        ProductCode: data[i].ProductCode,
                        Trade: data[i].ProductTradeName,
                        Group: data[i].NarcoticGroupName,
                        Quantity: data[i].ProductAmount,
                        Price: data[i].total_price,
                        check: 0,
                        UnitName: data[i].ProductUnitName
                    });
                }
            }
        }

        // แปลงผลรวมที่รวมแล้วเป็นรายการข้อมูล
        const groupedArray = Object.values(groupedData);
        return groupedArray;
    }

    // Group ข้อมูลตาม Group Import
    groupDataByGroup_Import(data: any[], list_type: any[]): any[] {
        const groupedData: { [key: string]: any } = {};

        // วนลูปผ่านข้อมูลและรวมข้อมูลตามกลุ่ม
        data.forEach(item => {
            const type = item.ProductTypeName;
            const group = item.ProductTypeName;
            let color = '';
            const obj_type = list_type.filter(i => i.Type_Drug_Code == item.ProductTypeCode);
            color = obj_type[0]?.COLOR || '';
            
            if (!groupedData[type]) {
                groupedData[type] = {
                    head: {
                        Type: type,
                        Type_code: item.ProductTypeCode,
                        Group: item.NarcoticGroupName,
                        Group_code: item.NarcoticGroupCode,
                        Group_Alias: obj_type[0]?.Type_Drug_Alias || '',
                        color_group: color
                    },
                    detail: []
                };
            }
        });

        const len_data = data.length;
        for (let i = 0; i < len_data; i++) {
            if (groupedData[data[i].ProductTypeName]) {
                groupedData[data[i].ProductTypeName].detail.push({
                    Type: data[i].ProductTypeName,
                    Trade: data[i].ProductTradeName,
                    Group: data[i].NarcoticGroupName,
                    Quantity: data[i].inspection_qty,
                    Price: data[i].total_price,
                    UnitName: data[i].ProductUnitName
                });
            }
        }

        // แปลงผลรวมที่รวมแล้วเป็นรายการข้อมูล
        const groupedArray = Object.values(groupedData);
        return groupedArray;
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
            this.old_List_MAS_HEALTH_ZONE = [...response.List_MAS_HEALTH_ZONE]; // เก็บข้อมูลเดิม
            this.List_MAS_REGION = response.List_MAS_REGION;
            this.List_MAS_MEDICAL_FACILITY = response.List_MAS_MEDICAL_FACILITY;
            this.List_MAS_GROUP_DRUG = response.List_MAS_GROUP_DRUG;
            this.List_MAS_TYPE_DRUG = response.List_MAS_TYPE_DRUG;
            this.LIST_MAS_DRUG = response.LIST_MAS_DRUG;
            // this.LIST_DM_PRODUCT = response.LIST_DM_PRODUCT;

            // เรียก filter ยาเมื่อโหลดข้อมูลเสร็จ
            // this.filterDrugs();

            this.loadDataService();
    
            this.searchPayOrder();
    
        });
    }

    searchPayOrder(): void {

        let Send_r = {

            'Reg_ID': this.regionId == '' ? 0 : this.regionId, //region id
            'Health_ID': this.healthZoneId == '' ? 0 : this.healthZoneId, //health id
            'MF_ID': this.facilityId == '' ? 0 : this.facilityId, //medical facility id
            'TYPE_DRUG_ID': this.typeDrugCode == '' ? 0 : this.typeDrugCode,
            'GROUP_DRUG_CODE': this.groupDrugCode,
            'NARCROTIC_CODE': this.drugCode,
        }
        let model = {
            PROCESS_CODE: '',
            FUNC_CODE: 'FUNC-GET_DATA-SEARCH_FORECAST',
            AUTHEN_INFORMATION: this.userData,
            SEND_SEARCH: Send_r
        }
        var getData = this.consService.GatewayGetData(model);
        getData.subscribe((response: any) => {
            this.Group_Pay_Drug = response.Group_Pay_Drug;
            this.Group_Pay_Drug = this.Group_Pay_Drug.map((item: any) => {
                const drug = this.LIST_MAS_DRUG.filter(g => g.ProductCode === item.ProductCode);
                return {
                    ...item,
                    avgdemand: parseFloat(drug[0]?.avgdemand || '0'),
                    LeadTime: parseFloat(drug[0]?.LeadTime || '0'),
                }
            });
            
            // เพิ่มฟิลด์ rop, dop, soh, ราคาต่อหน่วย, ราคารวมต่อหน่วย ให้ LIST_MAS_DRUG
            this.enrichListMasDrug();
            
            this.prepareForecastChart(this.Group_Pay_Drug, this.List_product, this.drugCode);   
            this.getKpis(this.Group_Pay_Drug, this.List_product, this.drugCode);
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

    onSort(column: string) {
        this.serviceMasDrug.getSortData(column);
    }


    processInventoryData(datas_inv: any): void {
        // รีเซ็ตข้อมูล
        this.List_product = [];
        this.List_product_detail = [];

        var list_inv = datas_inv.inventorys.length;
        for (var i = 0; i < list_inv; i++) {
            var dm_detail = this.LIST_MAS_DRUG.filter(g => g.ProductCode === datas_inv.inventorys[i].item_master_id.toUpperCase());
            if (dm_detail.length != 0) {
                var mock = {
                    'type': dm_detail[0].ProductTypeName,
                    'ProductTypeCode': dm_detail[0].ProductTypeCode,
                    'ProductTypeName': dm_detail[0].ProductTypeName,
                    'NarcoticGroupName': dm_detail[0].NarcoticGroupName,
                    'NarcoticGroupCode': dm_detail[0].NarcoticGroupCode,
                    'LOT': datas_inv.inventorys[i].lot_number,
                    // 'LOT': dm_detail[0].LOT,
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
                    // 'LOT': datas_inv.inventorys[i].lot_number,
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
        
        // อัพเดท LIST_MAS_DRUG ด้วยข้อมูลใหม่ (ถ้ามี Group_Pay_Drug แล้ว)
        if (this.Group_Pay_Drug && this.Group_Pay_Drug.length > 0) {
            this.enrichListMasDrug();
        }
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



    // trackBy for performance in *ngFor
    trackByProduct(index: number, item: any): any {
        return item?.productCode ?? index;
    }

    trackByLot(index: number, item: any): any {
        return (item?.productCode ?? '') + '|' + (item?.lot ?? index);
    }

    // === Add function inside OverviewForecastComponent ===

// mock input
// historyData = [
//     { yearaprv: 2025, monthaprv: 4, PurchaseOrderItemApprovedAmount: 300 },
//     { yearaprv: 2025, monthaprv: 5, PurchaseOrderItemApprovedAmount: 260 },
//     { yearaprv: 2025, monthaprv: 6, PurchaseOrderItemApprovedAmount: 310 },
//     { yearaprv: 2025, monthaprv: 7, PurchaseOrderItemApprovedAmount: 290 },
//     { yearaprv: 2025, monthaprv: 8, PurchaseOrderItemApprovedAmount: 305 },
//     { yearaprv: 2025, monthaprv: 9, PurchaseOrderItemApprovedAmount: 280 },
//   ];
  
//   stockData = {
//     ProductTradeName: "Pseudoephedrine HCl syrup 30 mg/5 ml (60 ml/bot)",
//     inspection_qty: 8170,
//     capital_price: 32.5,
//     exp_date: "2028-07-01"
//   };



getKpis(historyData: any[], stockData: any[], productCode: string): void {
    // reset
    this.kpis = {
      stockRiskCount: 0,
      avgDOH: 0,
      nearExpiry: { d30: 0, d60: 0, d90: 0 },
      purchaseRequests: { pending: 0, approved: 0, amountApproved: 0 },
      poOpen: { count: 0, amount: 0 },
      forecastAccuracyPrevMonth: { mape: 0, wape: 0 },
      RiskItem: [],
      RiskItemNearExpiry: [],
      totalQuantity: 0,
      totalValue: 0
    };
  
    const z = 1.65; // ~95% service level
    const items = productCode
      ? this.LIST_MAS_DRUG.filter((d: any) => d.ProductCode === productCode)
      : this.LIST_MAS_DRUG;
  
    let dohall = 0;
    let counted = 0;
  
    for (const prod of items) {
      const code = prod.ProductCode;
  
      // --- ดึงข้อมูลของสินค้านี้ ---
      const hist = historyData.filter(x => x.ProductCode === code);
      const stock = stockData.filter(x => x.ProductCode === code);
  
      // --- รวมยอดรายเดือน (กันเดือนซ้ำ) + เรียงเวลา ---
      const agg: Record<string, { label: string; value: number }> = {};
      for (const x of hist) {
        const label = `${x.yearaprv}-${String(x.monthaprv).padStart(2, '0')}`;
        if (!agg[label]) agg[label] = { label, value: 0 };
        agg[label].value += Number(x.PurchaseOrderItemApprovedAmount) || 0;
      }
      const monthly = Object.values(agg).sort((a, b) => a.label.localeCompare(b.label));
      const last6 = monthly.slice(-6);
  
      // --- ค่าเฉลี่ยรายเดือน (ใช้เฉพาะ 6 เดือนล่าสุด เพื่อทันสมัยขึ้น) ---
      const pastValues = last6.map(m => m.value);
      const avgMonthly = pastValues.length
        ? pastValues.reduce((a, b) => a + b, 0) / pastValues.length
        : 0;
  
      // --- LeadTime (เดือน): ใช้จาก product ก่อน, ไม่มีก็เฉลี่ยจาก hist ---
      let leadTimeMonths = Number(prod.LeadTime) || 0;
      if (!leadTimeMonths && hist.length) {
        const sumLT = hist.reduce((a, b) => a + (Number(b.LeadTime) || 0), 0);
        leadTimeMonths = sumLT / hist.length;
      }
  
      // --- SD รายเดือนจาก last6 ---
      const n = Math.max(pastValues.length, 1);
      const varianceMonth = pastValues.length
        ? pastValues.map(v => (v - avgMonthly) ** 2).reduce((a, b) => a + b, 0) / n
        : 0;
      const sdMonth = Math.sqrt(varianceMonth);
  
      // --- Safety Stock & ROP (หน่วย: ชิ้น/เดือน) ---
      const safetyStock = z * sdMonth * Math.sqrt(Math.max(leadTimeMonths, 0));
      const ropUnits = (avgMonthly * leadTimeMonths) + safetyStock;
  
      // --- Stock & DOH ---
      const currentStock = stock.reduce((a, b) => a + (Number(b.inspection_qty) || 0), 0);
      const daily = avgMonthly > 0 ? avgMonthly / 30 : 0;
      const doh = daily > 0 ? (currentStock / daily) : 0;
  
      // --- เสี่ยงต่ำกว่า ROP (เทียบหน่วยเดียวกัน: ชิ้น) ---
      if (currentStock < ropUnits) {
        this.kpis.stockRiskCount++;
        this.kpis.RiskItem.push({
          productCode: code,
          productName: prod.ProductTradeName,
          doh,
          rop: ropUnits,
          soh:currentStock,
          avgDailyUse: daily,
          unit: prod.ProductUnitName
        });
      }

      for(const s of stock){
      const exp_date = s.exp_date;
        const exp_date_obj = new Date(exp_date);
        const current_date = new Date();
        const diff_time = exp_date_obj.getTime() - current_date.getTime();
        const diff_days = Math.ceil(diff_time / (1000 * 60 * 60 * 24));
        if(diff_days <= 90){
            this.kpis.nearExpiry.d90++;
            this.kpis.RiskItemNearExpiry.push({
              productCode: code,
              productName: prod.ProductTradeName,
              lot: s.LOT,
              exp_date: s.exp_date,
              doh: doh,
              rop: ropUnits,
              currentStock: s.inspection_qty,
              unit: s.ProductUnitName,
              daysToExpire: diff_days
            });
          }else if(diff_days <= 60){
            this.kpis.nearExpiry.d60++;
            this.kpis.RiskItemNearExpiry.push({
              productCode: code,
              productName: prod.ProductTradeName,
              lot: s.LOT,
              exp_date: s.exp_date,
              doh: doh,
              rop: ropUnits,
              currentStock: s.inspection_qty,
              unit: s.ProductUnitName,
              daysToExpire: diff_days
            });
          } else if(diff_days <= 30){
            this.kpis.nearExpiry.d30++;
            this.kpis.RiskItemNearExpiry.push({
              productCode: code,
              productName: prod.ProductTradeName,
              lot: s.LOT,
              exp_date: s.exp_date,
              doh: doh,
              rop: ropUnits,
              currentStock: s.inspection_qty,
              unit: s.ProductUnitName,
              daysToExpire: diff_days
            });
       
         }
       
       
      }
    //   if(diff_days <= 90){
    //     this.kpis.nearExpiry.value90 += currentStock;
    //   }
     
      dohall += doh;
      counted++;
    }
    this.kpis.RiskItemNearExpiry = this.kpis.RiskItemNearExpiry.sort((a, b) => a.daysToExpire - b.daysToExpire);
    this.kpis.RiskItem = this.kpis.RiskItem.sort((a, b) => a.doh - b.doh);
    // ใช้ service แยกกันสำหรับแต่ละตาราง
    this.serviceRisk.setGridData(this.kpis.RiskItem);
    this.serviceNearExpiry.setGridData(this.kpis.RiskItemNearExpiry);
    
    // เฉลี่ยจากจำนวนสินค้าที่คำนวณจริง
    this.kpis.avgDOH = counted ? (dohall / counted) : 0;

    // คำนวณผลรวมปริมาณและราคา
    const filteredItems = productCode
      ? this.LIST_MAS_DRUG.filter((d: any) => d.ProductCode === productCode)
      : this.LIST_MAS_DRUG;
    
    this.kpis.totalQuantity = filteredItems.reduce((sum: number, item: any) => {
      return sum + (parseFloat(item.soh) || 0);
    }, 0);

    this.kpis.totalValue = filteredItems.reduce((sum: number, item: any) => {
      const soh = parseFloat(item.soh) || 0;
      const pricePerUnit = parseFloat(item.totalPricePerUnit) || parseFloat(item.pricePerUnit) || 0;
      return sum + (soh * pricePerUnit);
    }, 0);
  }
  
  fullModal(smallDataModal: any, data: any): void {
    this.modalService.open(smallDataModal, { size: 'fullscreen', windowClass: 'modal-holder' });
    this.Detail_product = this.List_product_detail.filter((item: any) => item.ProductCode === data.productCode);
    this.serviceDetail.setGridData(this.Detail_product);
}
   // คำนวณแนวโน้ม + forecast
   prepareForecastChart(historyData: any[], stockData: any[], productCode: string): void {
    const code = productCode?.trim();
    const z = 1.65; // ~95% service level
  
    // 1) ดึงข้อมูลเฉพาะสินค้าตัวนี้ (ถ้า code ว่าง ให้ใช้ทั้งหมด)
    const hist = code ? historyData.filter(x => x.ProductCode === code) : historyData;
    const stock = code ? stockData.filter(x => x.ProductCode === code) : stockData;
  
    // 2) จัดกลุ่มข้อมูลตาม period ที่เลือก
    const periodId = this.periodId ? (typeof this.periodId === 'string' ? parseInt(this.periodId) : this.periodId) : 2; // default เป็นเดือน (2)
    let aggMap: Record<string, { label: string; value: number }> = {};
    let periodData: { label: string; value: number }[] = [];
    
    // จัดกลุ่มข้อมูลตาม period
    if (periodId === 1) {
      // รายวัน - ใช้ข้อมูลรายวัน (ถ้ามี) หรือแปลงจากรายเดือน
      aggMap = this.aggregateByDay(hist);
      periodData = Object.values(aggMap).sort((a, b) => a.label.localeCompare(b.label));
      periodData = periodData.slice(-30); // 30 วันล่าสุด
    } else if (periodId === 2) {
      // รายเดือน
      aggMap = this.aggregateByMonth(hist);
      periodData = Object.values(aggMap).sort((a, b) => a.label.localeCompare(b.label));
      periodData = periodData.slice(-6); // 6 เดือนล่าสุด
    } else if (periodId === 3) {
      // รายไตรมาส
      aggMap = this.aggregateByQuarter(hist);
      periodData = Object.values(aggMap).sort((a, b) => a.label.localeCompare(b.label));
      periodData = periodData.slice(-4); // 4 ไตรมาสล่าสุด
    } else if (periodId === 4) {
      // รายปี
      aggMap = this.aggregateByYear(hist);
      periodData = Object.values(aggMap).sort((a, b) => a.label.localeCompare(b.label));
      periodData = periodData.slice(-3); // 3 ปีล่าสุด
    } else {
      // default: รายเดือน
      aggMap = this.aggregateByMonth(hist);
      periodData = Object.values(aggMap).sort((a, b) => a.label.localeCompare(b.label));
      periodData = periodData.slice(-6);
    }
  
    // 3) ข้อมูลอดีต
    const pastLabels = periodData.map(m => m.label);
    const pastValues = periodData.map(m => m.value);
  
    // กันข้อมูลว่าง
    const n = periodData.length || 1;
    const avgPeriod = periodData.length
      ? pastValues.reduce((a, b) => a + b, 0) / periodData.length
      : 0;
  
    // 4) หา Lead Time (เดือน)
    //    - พยายามใช้จาก LIST_MAS_DRUG ก่อน ถ้าไม่มีค่อยเฉลี่ยจาก hist
    let leadTimeMonths = 0;
    const prodRow = this.LIST_MAS_DRUG?.find?.((d: any) => d.ProductCode === code);
    if (prodRow?.LeadTime != null) {
      leadTimeMonths = Number(prodRow.LeadTime) || 0;
    } else if (hist.length) {
      const sumLT = hist.reduce((a, b) => a + (Number(b.LeadTime) || 0), 0);
      leadTimeMonths = sumLT / hist.length;
    }
  
    // 5) SD ตาม period
    const variancePeriod = periodData.length
      ? pastValues.map(v => (v - avgPeriod) ** 2).reduce((a, b) => a + b, 0) / n
      : 0;
    const sdPeriod = Math.sqrt(variancePeriod);
  
    // 6) Safety Stock และ ROP - แปลง leadTime เป็นหน่วยตาม period
    let leadTimeInPeriod = leadTimeMonths;
    if (periodId === 1) {
      leadTimeInPeriod = leadTimeMonths * 30; // แปลงเป็นวัน
    } else if (periodId === 3) {
      leadTimeInPeriod = leadTimeMonths / 3; // แปลงเป็นไตรมาส
    } else if (periodId === 4) {
      leadTimeInPeriod = leadTimeMonths / 12; // แปลงเป็นปี
    }
    
    const safetyStock = z * sdPeriod * Math.sqrt(Math.max(leadTimeInPeriod, 0));
    const ropUnits = (avgPeriod * leadTimeInPeriod) + safetyStock;
  
    // 8) DOH และ stock คงเหลือรวม
    const stockQty = stock.reduce((a, b) => a + (Number(b.inspection_qty) || 0), 0);
    let daily = 0;
    if (periodId === 1) {
      daily = avgPeriod; // รายวัน
    } else if (periodId === 2) {
      daily = avgPeriod / 30; // รายเดือน -> รายวัน
    } else if (periodId === 3) {
      daily = avgPeriod / 90; // รายไตรมาส -> รายวัน
    } else if (periodId === 4) {
      daily = avgPeriod / 365; // รายปี -> รายวัน
    }
    const doh = daily > 0 ? (stockQty / daily) : 0;
  
    // 9) สร้าง Forecast ตาม period
    const futureCount = periodId === 1 ? 7 : periodId === 2 ? 3 : periodId === 3 ? 2 : 1; // วัน: 7, เดือน: 3, ไตรมาส: 2, ปี: 1
    const lastLabel = pastLabels[pastLabels.length - 1] || this.getCurrentLabel(periodId);
    const forecastLabels: string[] = [];
    const forecastValues: number[] = [];
    
    for (let i = 1; i <= futureCount; i++) {
      if (periodId === 1) {
        forecastLabels.push(this.addDay(lastLabel, i));
      } else if (periodId === 2) {
        forecastLabels.push(this.addMonth(lastLabel, i));
      } else if (periodId === 3) {
        forecastLabels.push(this.addQuarter(lastLabel, i));
      } else if (periodId === 4) {
        forecastLabels.push(this.addYear(lastLabel, i));
      }
      
      // คำนวณ forecast value
      if (periodData.length) {
        const avgF = pastValues.reduce((a, b) => a + b, 0) / (periodData.length + (i - 1));
        forecastValues.push(avgF || 0);
      } else {
        forecastValues.push(avgPeriod || 0);
      }
    }
  
    // 10) จำลอง stock คงเหลือในอนาคต (ตัดตาม forecast)
    const stockValues: number[] = [];
    let stockRemain = stockQty;
    // แสดงค่า ณ จุดเริ่มคาดการณ์ก่อนตัด
    stockValues.push(stockRemain);
    for (let i = 1; i < forecastValues.length; i++) {
      stockRemain = Math.max(stockRemain - (forecastValues[i] || 0), 0);
      stockValues.push(stockRemain);
    }
  
    // 11) เตรียม series ให้ยาวเท่ากับแกนเวลา (อดีต + อนาคต)
    const categories = [...pastLabels, ...forecastLabels];
  
    const seriesActual = pastValues; // ความยาว = pastLabels.length
   // 3) Forecast ให้ "ต่อจากจุดสุดท้ายของ Actual"
    const seriesForecast = [
        ...pastValues.slice(0, -1).map(() => null),           // เว้นว่างก่อนหน้า
        // pastValues[pastValues.length - 1],                    // ต่อเส้น ณ จุดสุดท้ายของ history
        ...forecastValues                                 // แล้วลากไปอนาคต
    ];
    // 4) Stock ให้ "เริ่มที่จุดสุดท้ายของ Actual" เช่นกัน
    const seriesStock = [
        ...pastValues.slice(0, -1).map(() => null),           // เว้นว่างก่อนหน้า
        stockQty,                                             // สต็อก ณ จุดสุดท้ายของ history
        ...stockValues.slice(1)                               // ต่อด้วยคงเหลือในอนาคต (ข้ามตัวแรกเพราะเท่ากับ stockQty)
    ];
    const seriesROP = new Array(categories.length).fill(ropUnits);
  
    // 12) สเกลแกน Y
    const nums = [
      ...seriesActual,
      ...forecastValues,
      ...stockValues,
      ...seriesROP
    ].filter(v => v != null) as number[];
    const yMinData = nums.length ? Math.min(...nums) : 0;
    const yMaxData = nums.length ? Math.max(...nums) : 10;
    const yMin = Math.floor(yMinData * 0.9);
    const yMax = Math.ceil(yMaxData * 1.05);
  
    // 13) ส่งค่าเข้า ApexCharts
    this.lineOptions = {
      chart: { type: 'line'
              , height: 350, animations: { enabled: true, speed: 700 }
              , toolbar: {
                show: true,
                tools: {
                  download: true,  // ✅ เปิดปุ่มดาวน์โหลด
                }
              }
            },
      colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'], // Actual, Forecast, Stock, ROP
      stroke: {
        curve: 'smooth',
        width: [3, 3, 3, 2],          // Actual, Forecast, Stock, ROP
        dashArray: [0, 6, 0, 6]       // Forecast/ROP เป็นเส้นประ
      },
      markers: {
        size: [4, 6, 6, 0] as unknown as number[],
        strokeWidth: 3,
        strokeColors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
        fillOpacity: 1,
        hover: { size: 9, sizeOffset: 3 }
      },
      dataLabels: {
        enabled: true,
        enabledOnSeries: [0, 1, 2], // โชว์ตัวเลขบน Actual/Forecast/Stock
        formatter: (val: number) => (val == null ? '' : Math.round(val).toLocaleString()),
        background: { enabled: true, borderRadius: 4, foreColor: '#111827', padding: 4, opacity: 0.9 },
        offsetY: -10
      },
      fill: { type: 'solid', opacity: [0.95, 0.95, 0.95, 0.7] },
      legend: { position: 'top' },
      grid: { strokeDashArray: 4 },
      tooltip: { shared: true, y: { formatter: (v: number) => (v == null ? '' : Math.round(v).toLocaleString()) } },
      title: { text: 'ยอดใช้จริง vs คาดการณ์ vs สต็อกคงเหลือ', align: 'left' },
      xaxis: { categories },
      yaxis: { decimalsInFloat: 0, min: yMin, max: yMax, labels: { formatter: (v: number) => Math.round(v).toLocaleString() } },
      series: [
        { name: 'ประวัติการใช้',  data: seriesActual },
        { name: 'คาดการณ์ยอดใช้', data: seriesForecast },
        { name: 'สต็อกคงเหลือ',   data: seriesStock },
        { name: 'ROP',            data: seriesROP }
      ],
      states: {
        normal: { filter: { type: 'none', value: 0 } },
        hover:  { filter: { type: 'none', value: 0 } },
        active: { allowMultipleDataPointsSelection: false, filter: { type: 'darken', value: 0.4 } }
      }
    };
  
    // ถ้าจะใช้ doh/rop เพิ่มเติมภายนอก ฟังค์ชันนี้สามารถ return หรือ set ลงตัวแปรอื่นได้
    // const ropInDays = daily > 0 ? ropUnits / daily : Infinity;
  }
  
  private getCurrentYYYYMM(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }
  
  // สมมติรับรูปแบบ 'YYYY-MM' แล้วบวก i เดือน
  private addMonth(yyyymm: string, i: number): string {
    const [y, m] = yyyymm.split('-').map(v => +v);
    const d = new Date(y, m - 1 + i, 1);
    const yy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${yy}-${mm}`;
  }

  // Helper functions สำหรับจัดกลุ่มข้อมูล
  private aggregateByDay(hist: any[]): Record<string, { label: string; value: number }> {
    const aggMap: Record<string, { label: string; value: number }> = {};
    for (const x of hist) {
      // ถ้ามีข้อมูลวันที่ใช้ dateaprv หรือสร้างจาก yearaprv/monthaprv
      const dateStr = x.dateaprv || `${x.yearaprv}-${String(x.monthaprv).padStart(2, '0')}-01`;
      const key = dateStr.substring(0, 10); // YYYY-MM-DD
      if (!aggMap[key]) aggMap[key] = { label: key, value: 0 };
      aggMap[key].value += +x.PurchaseOrderItemApprovedAmount || 0;
    }
    return aggMap;
  }

  private aggregateByMonth(hist: any[]): Record<string, { label: string; value: number }> {
    const aggMap: Record<string, { label: string; value: number }> = {};
    for (const x of hist) {
      const key = `${x.yearaprv}-${String(x.monthaprv).padStart(2, '0')}`;
      if (!aggMap[key]) aggMap[key] = { label: key, value: 0 };
      aggMap[key].value += +x.PurchaseOrderItemApprovedAmount || 0;
    }
    return aggMap;
  }

  private aggregateByQuarter(hist: any[]): Record<string, { label: string; value: number }> {
    const aggMap: Record<string, { label: string; value: number }> = {};
    for (const x of hist) {
      const quarter = Math.ceil(x.monthaprv / 3);
      const key = `${x.yearaprv}-Q${quarter}`;
      if (!aggMap[key]) aggMap[key] = { label: key, value: 0 };
      aggMap[key].value += +x.PurchaseOrderItemApprovedAmount || 0;
    }
    return aggMap;
  }

  private aggregateByYear(hist: any[]): Record<string, { label: string; value: number }> {
    const aggMap: Record<string, { label: string; value: number }> = {};
    for (const x of hist) {
      const key = `${x.yearaprv}`;
      if (!aggMap[key]) aggMap[key] = { label: key, value: 0 };
      aggMap[key].value += +x.PurchaseOrderItemApprovedAmount || 0;
    }
    return aggMap;
  }

  // Helper functions สำหรับสร้าง label อนาคต
  private getCurrentLabel(periodId: number | null): string {
    const d = new Date();
    if (periodId === 1) {
      return d.toISOString().split('T')[0]; // YYYY-MM-DD
    } else if (periodId === 2) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      return `${y}-${m}`;
    } else if (periodId === 3) {
      const y = d.getFullYear();
      const quarter = Math.ceil((d.getMonth() + 1) / 3);
      return `${y}-Q${quarter}`;
    } else if (periodId === 4) {
      return `${d.getFullYear()}`;
    }
    return this.getCurrentYYYYMM();
  }

  private addDay(dateStr: string, i: number): string {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  }

  private addQuarter(quarterStr: string, i: number): string {
    const [y, q] = quarterStr.split('-Q').map(v => +v);
    const totalQuarters = q + i;
    const newYear = y + Math.floor((totalQuarters - 1) / 4);
    const newQuarter = ((totalQuarters - 1) % 4) + 1;
    return `${newYear}-Q${newQuarter}`;
  }

  private addYear(yearStr: string, i: number): string {
    return `${parseInt(yearStr) + i}`;
  }

    // เพิ่มฟิลด์ rop, dop, soh, ราคาต่อหน่วย, ราคารวมต่อหน่วย ให้ LIST_MAS_DRUG
  enrichListMasDrug(): void {
    const z = 1.65; // ~95% service level
    
    this.LIST_MAS_DRUG = this.LIST_MAS_DRUG.map((drug: any) => {
      const code = drug.ProductCode;
      
      // ดึงข้อมูลประวัติการซื้อ
      const hist = (this.Group_Pay_Drug || []).filter((x: any) => x.ProductCode === code);
      
      // ดึงข้อมูลสต็อก
      const stock = (this.List_product || []).filter((x: any) => x.ProductCode === code);
      
      // คำนวณค่าเฉลี่ยรายเดือน (6 เดือนล่าสุด)
      const agg: Record<string, { label: string; value: number }> = {};
      for (const x of hist) {
        const label = `${x.yearaprv}-${String(x.monthaprv).padStart(2, '0')}`;
        if (!agg[label]) agg[label] = { label, value: 0 };
        agg[label].value += Number(x.PurchaseOrderItemApprovedAmount) || 0;
      }
      const monthly = Object.values(agg).sort((a, b) => a.label.localeCompare(b.label));
      const last6 = monthly.slice(-6);
      const pastValues = last6.map(m => m.value);
      const avgMonthly = pastValues.length
        ? pastValues.reduce((a, b) => a + b, 0) / pastValues.length
        : 0;
      
      // LeadTime (เดือน)
      let leadTimeMonths = Number(drug.LeadTime) || 0;
      if (!leadTimeMonths && hist.length) {
        const sumLT = hist.reduce((a: number, b: any) => a + (Number(b.LeadTime) || 0), 0);
        leadTimeMonths = sumLT / hist.length;
      }
      
      // SD รายเดือน
      const n = Math.max(pastValues.length, 1);
      const varianceMonth = pastValues.length
        ? pastValues.map(v => (v - avgMonthly) ** 2).reduce((a, b) => a + b, 0) / n
        : 0;
      const sdMonth = Math.sqrt(varianceMonth);
      
      // Safety Stock & ROP
      const safetyStock = z * sdMonth * Math.sqrt(Math.max(leadTimeMonths, 0));
      const rop = (avgMonthly * leadTimeMonths) + safetyStock;
      
      // SOH (Stock on Hand) - รวมจำนวนสต็อกทั้งหมด
      const soh = stock.reduce((a: number, b: any) => a + (Number(b.inspection_qty) || 0), 0);
      
      // DOP (Days of Purchase) - จำนวนวันที่ต้องสั่งซื้อ (คำนวณจาก ROP และ demand รายวัน)
      const daily = avgMonthly > 0 ? avgMonthly / 30 : 0;
      const dop = daily > 0 ? (rop / daily) : 0;
      
      // ราคาต่อหน่วย (Price per Unit)
      const pricePerUnit = parseFloat(drug.ProductPrice || '0');
      
      // ราคารวมต่อหน่วย (Total Price per Unit) - ราคารวมของสต็อกทั้งหมดต่อหน่วย
      const totalPricePerUnit = soh > 0 ? (stock.reduce((a: number, b: any) => a + (Number(b.total_price) || 0), 0) / soh) : pricePerUnit;
      
      return {
        ...drug,
        rop: rop,
        dop: dop,
        soh: soh,
        daily_use: daily,
        pricePerUnit: pricePerUnit,
        totalPricePerUnit: totalPricePerUnit
      };
    });
    
    // อัพเดท filteredDrugs ด้วย
    this.filterDrugs();
    
    // อัพเดทตาราง
    this.serviceMasDrug.setGridData(this.LIST_MAS_DRUG);
    
    // สร้างกราฟทั้งหมด
    this.prepareAllCharts();
  }

  // สร้างกราฟทั้งหมด
  prepareAllCharts(): void {
    this.prepareStockRopChart();
    this.prepareDrugGroupDonutChart();
    this.prepareInventoryValueBarChart();
    this.prepareRiskBubbleChart();
  }

  // 1. กราฟ Bar + Line: ตรวจสอบสต็อกคงเหลือเทียบ ROP
  prepareStockRopChart(): void {
    const data = this.LIST_MAS_DRUG
      .filter((drug: any) => drug.soh > 0 || drug.rop > 0)
    //   .slice(0, 20) // แสดง 20 รายการแรก
      .sort((a: any, b: any) => b.soh - a.soh);

    const categories = data.map((d: any) => d.ProductTradeName.length > 20 
      ? d.ProductTradeName.substring(0, 20) + '...' 
      : d.ProductTradeName);
    const sohData = data.map((d: any) => d.soh || 0);
    const ropData = data.map((d: any) => d.rop || 0);

    this.stockRopChartOptions = {
      series: [
        {
          name: 'SOH (สต็อกคงเหลือ)',
          type: 'column',
          data: sohData
        },
        {
          name: 'ROP (จุดสั่งซื้อ)',
          type: 'line',
          data: ropData
        }
      ],
      chart: {
        type: 'line',
        height: 400,
        toolbar: { show: true }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        width: [0, 3],
        curve: 'smooth'
      },
      plotOptions: {
        bar: {
          columnWidth: '50%'
        }
      },
      xaxis: {
        categories: categories,
        labels: {
          rotate: -45,
          rotateAlways: true,
          style: {
            fontSize: '11px'
          }
        }
      },
      yaxis: {
        title: {
          text: 'จำนวน'
        },
        labels: {
          formatter: (val: number) => Math.round(val).toLocaleString()
        }
      },
      grid: {
        strokeDashArray: 4
      },
      tooltip: {
        shared: true,
        y: {
          formatter: (val: number) => Math.round(val).toLocaleString()
        }
      },
      legend: {
        position: 'top'
      },
      title: {
        text: 'ตรวจสอบสต็อกคงเหลือเทียบ ROP',
        align: 'left'
      },
      colors: ['#3B82F6', '#EF4444']
    };
  }

  // 2. กราฟ Donut: สัดส่วนการใช้ยาแต่ละกลุ่ม
  prepareDrugGroupDonutChart(): void {
    const groupData: Record<string, number> = {};
    
    this.LIST_MAS_DRUG.forEach((drug: any) => {
      const groupName = drug.NarcoticGroupName || 'ไม่ระบุกลุ่ม';
      const soh = drug.soh || 0;
      if (!groupData[groupName]) {
        groupData[groupName] = 0;
      }
      groupData[groupName] += soh;
    });

    const labels = Object.keys(groupData);
    const series = Object.values(groupData);

    this.drugGroupDonutOptions = {
      series: series,
      chart: {
        type: 'donut',
        height: 400
      },
      labels: labels,
      dataLabels: {
        enabled: true,
        formatter: (val: number) => {
          return val.toFixed(1) + '%';
        }
      },
      legend: {
        position: 'bottom'
      },
      title: {
        text: 'สัดส่วนยาแต่ละกลุ่มในคลังยา',
        align: 'left'
      },
      tooltip: {
        y: {
          formatter: (val: number) => Math.round(val).toLocaleString() + ' หน่วย/วัน'
        }
      },
      colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16']
    };
  }

  // 3. กราฟ Horizontal Bar: มูลค่าคงคลัง
  prepareInventoryValueBarChart(): void {
    const data = this.LIST_MAS_DRUG
      .filter((drug: any) => drug.totalPricePerUnit > 0 && drug.soh > 0)
      .map((drug: any) => ({
        name: drug.ProductTradeName,
        value: drug.totalPricePerUnit * drug.soh
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 15); // แสดง 15 รายการแรก

    const categories = data.map(d => d.name.length > 25 ? d.name.substring(0, 25) + '...' : d.name);
    const values = data.map(d => d.value);

    this.inventoryValueBarOptions = {
      series: [
        {
          name: 'มูลค่าคงคลัง',
          data: values
        }
      ],
      chart: {
        type: 'bar',
        height: 500,
        toolbar: { show: true }
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => {
          if (val >= 1000000) {
            return (val / 1000000).toFixed(2) + 'M';
          } else if (val >= 1000) {
            return (val / 1000).toFixed(1) + 'K';
          }
          return Math.round(val).toLocaleString();
        }
      },
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: '70%'
        }
      },
      xaxis: {
        categories: categories,
        labels: {
          formatter: (val: string) => {
            const num = parseFloat(val);
            if (num >= 1000000) {
              return (num / 1000000).toFixed(2) + 'M';
            } else if (num >= 1000) {
              return (num / 1000).toFixed(1) + 'K';
            }
            return Math.round(num).toLocaleString();
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            fontSize: '11px'
          }
        }
      },
      grid: {
        strokeDashArray: 4
      },
      tooltip: {
        y: {
          formatter: (val: number) => '฿' + Math.round(val).toLocaleString()
        }
      },
      legend: {
        show: false
      },
      title: {
        text: 'มูลค่าคงคลัง',
        align: 'left'
      },
      colors: ['#10B981']
    };
  }

  // 4. กราฟ Bubble: วิเคราะห์ความเสี่ยงขาดยา
  prepareRiskBubbleChart(): void {
    // แปลงข้อมูลและ scale z (ขนาด bubble) ให้อยู่ในช่วง 6..40 px
    const raw = this.LIST_MAS_DRUG || [];
  
    const filtered = raw
      .filter((drug: any) => drug.soh != null && drug.daily_use != null)
      // หากต้องการไม่กรอง pricePerUnit=0 ให้เอาออกจากเงื่อนไข
      .map((drug: any) => ({
        soh: Number(drug.soh) || 0,
        daily_use: Number(drug.daily_use) || 0,
        price: Number(drug.pricePerUnit) || 0,
        name: drug.ProductTradeName || 'ไม่ระบุ',
        rop: Number(drug.rop) || 0
      }));
  
    // หา min/max ของ price เพื่อ scale z
    const prices = filtered.map(d => d.price).filter(p => p > 0);
    const minP = prices.length ? Math.min(...prices) : 0;
    const maxP = prices.length ? Math.max(...prices) : 1;
  
    // ฟังก์ชัน scale linear -> radius (6..40)
    const scaleZ = (val: number) => {
      if (val <= 0) return 6;
      const minR = 6, maxR = 40;
      if (minP === maxP) return (minR + maxR) / 2;
      return Math.round(minR + ( (val - minP) / (maxP - minP) ) * (maxR - minR));
    };
  
    const data = filtered.map(d => ({
      x: d.soh,
      y: d.daily_use,
      z: scaleZ(d.price),
      rawZ: d.price,
      name: d.name,
      risk: d.soh < d.rop ? 'high' : 'medium'
    }));
  
    const highRiskData = data.filter(d => d.risk === 'high');
    const mediumRiskData = data.filter(d => d.risk === 'medium');
  
    // กำหนด axis range เพื่อให้จุดไม่ยุบมุมเดียว (ปรับตามข้อมูลจริง)
    const maxX = Math.max(...data.map(d => d.x), 10);
    const maxY = Math.max(...data.map(d => d.y), 5);
  
    this.riskBubbleOptions = {
      series: [
        { name: 'ความเสี่ยงสูง (SOH < ROP)', data: highRiskData },
        { name: 'ความเสี่ยงปานกลาง', data: mediumRiskData }
      ],
      chart: {
        type: 'bubble',
        height: 520,
        toolbar: { show: true },
        zoom: { enabled: true } // ให้ zoom ได้เผื่อ dataset ใหญ่
      },
      dataLabels: {
        enabled: false
      },
      plotOptions: {
        bubble: {
          minBubbleRadius: 6,
          maxBubbleRadius: 40
        }
      },
      xaxis: {
        type: 'numeric',
        title: { text: 'SOH (สต็อกคงเหลือ)' },
        min: 0,
        max: Math.ceil(maxX * 1.1),
        tickAmount: 6,
        labels: {
          formatter: (val: string) => Math.round(parseFloat(val)).toLocaleString()
        }
      },
      yaxis: {
        title: { text: 'จำนวนที่ใช้ต่อวัน' },
        min: 0,
        max: Math.ceil(maxY * 1.1),
        tickAmount: 6,
        labels: {
          formatter: (val: number) => Math.round(val).toLocaleString()
        }
      },
      grid: { strokeDashArray: 4 },
      tooltip: {
        custom: (opts: any) => {
          const sIdx = opts.seriesIndex;
          const dpIdx = opts.dataPointIndex;
          const seriesData = opts.w.config.series[sIdx].data[dpIdx];
          if (!seriesData) return '';
          const x = seriesData.x, y = seriesData.y, rawZ = seriesData.rawZ || 0;
          const name = seriesData.name || 'ไม่ระบุ';
          return `
            <div style="padding:10px;">
              <strong>${name}</strong><br/>
              SOH: ${Math.round(x).toLocaleString()}<br/>
              ใช้ต่อวัน: ${Math.round(y).toLocaleString()}<br/>
              ราคาต่อหน่วย: ฿${rawZ.toLocaleString()}<br/>
             
            </div>
          `;
        }
      },
      legend: { position: 'top' },
      title: { text: 'วิเคราะห์ความเสี่ยงขาดยา', align: 'left' },
      colors: ['#EF4444', '#3B82F6'],
      fill: { opacity: 0.6 },
      responsive: [{
        breakpoint: 800,
        options: { chart: { height: 420 } }
      }]
    };
  }

  sendEmailRisk(): void {
    if (!this.kpis || !this.kpis.RiskItem || this.kpis.RiskItem.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'ไม่มีข้อมูล',
        text: 'ไม่มีรายการยาที่เสี่ยงขาดให้ส่งอีเมล',
        timer: 2000,
        showConfirmButton: false
      });
      return;
    }
    // TODO: เรียก API เพื่อส่งอีเมล
    // ตัวอย่างข้อมูลที่จะส่ง
    const emailData = {
      Subject: 'แจ้งเตือน: ยาเสี่ยงขาด',
      Body: `มีรายการยาที่เสี่ยงขาดจำนวน ${this.kpis.stockRiskCount} รายการ ดังนี้`,
      riskItems: this.kpis.RiskItem
    };

    this.consService.SendEmail(emailData).subscribe((response: any) => {
      if (response == "สำเร็จ") {
        Swal.fire({
          icon: 'success',
          title: 'ส่งอีเมลสำเร็จ',
          text: 'ส่งอีเมลแจ้งเตือนยาเสี่ยงขาดสำเร็จ',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'ส่งอีเมลไม่สำเร็จ',
          text: 'ส่งอีเมลแจ้งเตือนยาเสี่ยงขาดไม่สำเร็จ',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });

  }
  
  
}