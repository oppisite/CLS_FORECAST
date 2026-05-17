import { Component, ElementRef, ViewChild, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, iif, Observable, Subscription } from 'rxjs';
import { FormGroup, FormBuilder, FormArray, FormControl, FormControlName, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GridJsService } from '../../tables/gridjs/gridjs.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { GridJsModel } from '../../tables/gridjs/gridjs.model';
import { DecimalPipe } from '@angular/common';
import { get } from 'lodash';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { ConsService } from 'src/app/core/services/cons.service';
import { InventoryService } from 'src/app/core/services/inventory.service';
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
    nearExpiry: { d180: number; d270: number; d360: number; };
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
    forecastMonths = 12; // จำนวนเดือนที่ต้องการ forecast (default 12)
    installmentCount = 4; // จำนวนงวดที่ต้องการแบ่งส่ง
    /** ปรับเส้นการคาดการณ์บนกราฟ (บวก = เพิ่ม % ลบ = ลด %) */
    forecastAdjustmentPercent = 0;
    installmentPlan: Array<{
      round: number;
      startLabel: string;
      endLabel: string;
      sendLabel: string;
      qty: number;
      stockEnough: boolean;
      shortageAt: string;
      recommendBefore: string;
    }> = [];
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
    @ViewChild('riskTableSection') riskTableSection?: ElementRef<HTMLElement>;
    lineOptions: LineChartOptions | null = null;
    /** ข้อมูลเส้น forecast ก่อนคูณเปอร์เซ็นต์ (สำหรับปรับแสดงผลบนกราฟ) */
    private seriesForecastBaseData: (number | null)[] | null = null;
    /** ข้อมูลฐานสำหรับคำนวณแผนงวด (ก่อนปรับ %) */
    private installmentPlanContext: {
      labels: string[];
      forecastValues: number[];
      stockQty: number;
      deliveryValues: number[];
    } | null = null;
    
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
    // รายการยา (Use Drug) — ข้อมูลจาก Drug_Use_Stock (ProductTradeName, Po_Month, Forecast, ...)
    gridjsListUseDrug$!: Observable<any[]>;
    totalUseDrug$: Observable<number>;
    searchTermUseDrug = '';
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
    public serviceUseDrug: GridJsService;
    Detail_product: any[] = [];
  List_MAS_Product_Stock_UseDrug: any;
  Drug_Use_Stock: any[] = [];
  List_DeliveryDrug: any[] = [];
  old_List_DeliveryDrug: any[] = [];
  Demand_Drug_Show: any;

    constructor(private modalService: NgbModal, public service: GridJsService
        , private sortService: PaginationService, public consService: ConsService
        , private authService: AuthenticationService, private decimalPipe: DecimalPipe
        , private inventoryService: InventoryService) {
        this.gridjsList$ = service.countries$;
        this.total$ = service.total$;

        // สร้าง service instances แยกกันสำหรับแต่ละตาราง
        this.serviceRisk = new GridJsService(decimalPipe);
        this.serviceNearExpiry = new GridJsService(decimalPipe);
        this.serviceDetail = new GridJsService(decimalPipe);
        this.serviceMasDrug = new GridJsService(decimalPipe);
        this.serviceUseDrug = new GridJsService(decimalPipe);

        this.gridjsListRisk$ = this.serviceRisk.countries$;
        this.totalRisk$ = this.serviceRisk.total$;

        this.gridjsListNearExpiry$ = this.serviceNearExpiry.countries$;
        this.totalNearExpiry$ = this.serviceNearExpiry.total$;

        this.gridjsListDetail$ = this.serviceDetail.countries$;
        this.totalDetail$ = this.serviceDetail.total$;

        this.gridjsListMasDrug$ = this.serviceMasDrug.countries$;
        this.totalMasDrug$ = this.serviceMasDrug.total$;

        this.gridjsListUseDrug$ = this.serviceUseDrug.countries$;
        this.totalUseDrug$ = this.serviceUseDrug.total$;

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
            nearExpiry: { d180: 0, d270: 0, d360: 0 },
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
        // Subscribe สำหรับ inventory (จาก InventoryService เมื่อ loadData สำเร็จ - ได้ข้อมูลที่ประมวลผลแล้ว)
        this.subscriptions.push(
            this.inventoryService.inventory.subscribe((data: any) => {
                if (data != null) {
                    this.List_product = data.List_product ?? [];
                    this.List_product_detail = data.List_product_detail ?? [];
                    this.List_Group_Drug_detail = data.List_Group_Drug_detail ?? [];
                    this.List_Group_Drug = data.List_Group_Drug ?? [];
                    this.All_Approve = data.All_Approve ?? [];
                    if (this.Group_Pay_Drug && this.Group_Pay_Drug.length > 0) {
                      if (data != null && this.LIST_MAS_DRUG?.length > 0 && data.List_product) {
                        const qtyByCode: { [key: string]: number } = {};
                        (data.List_product as any[]).forEach((p: any) => {
                            const code = p.ProductCode;
                            qtyByCode[code] = (qtyByCode[code] ?? 0) + (Number(p.inspection_qty) || 0);
                        });
                        // อัปเดต inspection_qty และ DOH (วันคงเหลือ = สต็อก / ยอดขายเฉลี่ยต่อวัน) บน object เดิม เพื่อคง ReorderPoint ฯลฯ
                        this.LIST_MAS_DRUG.forEach((d: any) => {
                            const qty = qtyByCode[d.ProductCode] ?? 0;
                            d.inspection_qty = qty;
                            const avgPerDay = Number(d.avgdemand) / 30; // ยอดขายเฉลี่ยต่อวัน = avgdemand/30
                            d.dop = (avgPerDay > 0)
                                ? Math.round(qty / avgPerDay)
                                : (d.DOH ?? 0);
                            d.FK_Product_SubGroup = parseInt(d.FK_Product_SubGroup ?? '0');

                            d.rop = parseFloat(d.ReorderPoint || '0');
                            d.soh = parseFloat(d.inspection_qty || '0');
                            d.daily_use = parseFloat(avgPerDay.toString() || '0');
                            d.pricePerUnit = parseFloat(d.pricePerUnit || '0');
                            d.totalPricePerUnit = parseFloat(d.totalPricePerUnit || '0');
                        });
                      }
                        this.enrichListMasDrug();
                    }
                }
            })
        );
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

    clearFilters(): void {
        this.periodId = null;
        this.periodName = '';
        this.forecastMonths = 12;
        this.regionId = '';
        this.healthZoneId = '';
        this.facilityId = '';
        this.typeDrugCode = '';
        this.groupDrugCode = '';
        this.drugCode = '';
        this.monthId = null;
        this.quarterId = null;
        this.dateStart = this.getDate30DaysAgo();
        this.dateEnd = this.getCurrentDate();

        if (this.old_List_MAS_HEALTH_ZONE?.length) {
            this.List_MAS_HEALTH_ZONE = [...this.old_List_MAS_HEALTH_ZONE];
        }

        this.filterDrugs();
        this.searchPayOrder();
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
        if (this.Group_Pay_Drug && this.List_product) {
            this.prepareForecastChart(this.Group_Pay_Drug, this.List_product, this.drugCode, this.Drug_Use_Stock, this.List_DeliveryDrug, this.Demand_Drug_Show);
        }
    }

    // เมื่อเปลี่ยนจำนวนเดือน forecast
    onForecastMonthsChange(): void {
        const val = Number(this.forecastMonths);
        if (!val || val < 1) { this.forecastMonths = 1; }
        else if (val > 60) { this.forecastMonths = 60; }
        if (this.Group_Pay_Drug && this.List_product) {
            this.prepareForecastChart(this.Group_Pay_Drug, this.List_product, this.drugCode, this.Drug_Use_Stock, this.List_DeliveryDrug, this.Demand_Drug_Show);
        }
    }

    onInstallmentCountChange(): void {
        const val = Number(this.installmentCount);
        if (!val || val < 1) { this.installmentCount = 1; }
        else if (val > 24) { this.installmentCount = 24; }
        this.rebuildInstallmentPlan();
    }

    private getPrevMonthLabel(label: string): string {
      const [y, m] = String(label).split('-');
      const year = Number(y);
      const month = Number(m);
      if (!year || !month) return '-';
      const d = new Date(year, month - 1, 1);
      d.setMonth(d.getMonth() - 1);
      const yy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      return `${yy}-${mm}`;
    }

    private buildInstallmentPlan(labels: string[], values: number[], startingStock = 0, deliveryPlan: (number | null)[] = []): void {
      const cleanLabels = Array.isArray(labels) ? labels : [];
      const cleanValues = Array.isArray(values) ? values.map(v => Number(v) || 0) : [];
      const totalPoints = Math.min(cleanLabels.length, cleanValues.length);
      if (!totalPoints) {
        this.installmentPlan = [];
        return;
      }

      const rounds = Math.max(1, Math.min(Number(this.installmentCount) || 1, totalPoints));
      const plan: Array<{
        round: number; startLabel: string; endLabel: string; sendLabel: string; qty: number;
        stockEnough: boolean; shortageAt: string; recommendBefore: string;
      }> = [];
      const cleanDelivery = cleanLabels.map((_, idx) => Number(deliveryPlan[idx]) || 0);
      let runningStock = Number(startingStock) || 0;

      for (let r = 1; r <= rounds; r++) {
        const startIdx = Math.floor(((r - 1) * totalPoints) / rounds);
        const endIdx = Math.floor((r * totalPoints) / rounds) - 1;
        const safeEnd = Math.max(startIdx, endIdx);
        const qty = cleanValues.slice(startIdx, safeEnd + 1).reduce((sum, cur) => sum + (Number(cur) || 0), 0);
        let shortageAt = '';

        for (let i = startIdx; i <= safeEnd; i++) {
          runningStock += cleanDelivery[i] || 0;
          runningStock -= cleanValues[i] || 0;
          if (!shortageAt && runningStock < 0) {
            shortageAt = cleanLabels[i] || '';
          }
        }

        const stockEnough = shortageAt === '';
        const recommendBefore = stockEnough ? '-' : this.getPrevMonthLabel(shortageAt);
        plan.push({
          round: r,
          startLabel: cleanLabels[startIdx] || '-',
          endLabel: cleanLabels[safeEnd] || '-',
          sendLabel: stockEnough ? (cleanLabels[safeEnd] || '-') : recommendBefore,
          qty,
          stockEnough,
          shortageAt: shortageAt || '-',
          recommendBefore
        });
      }
      this.installmentPlan = plan;
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
            this.List_MAS_Product_Stock_UseDrug = response.List_MAS_Product_Stock_UseDrug;
           
            // เรียก filter ยาเมื่อโหลดข้อมูลเสร็จ
            // this.filterDrugs();

            this.loadDataService();
    
            this.searchPayOrder();
    
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

    formatJsonDate(jsonDate: string): string {
      const d = this.convertJsonDate(jsonDate);
      if (!d) {
        return '';
      }
      const parts = new Intl.DateTimeFormat('th-TH', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).formatToParts(d);
      const getPart = (type: string) => parts.find(p => p.type === type)?.value ?? '';
      let year = parseInt(getPart('year'), 10);
      if (isNaN(year)) {
        year = d.getFullYear();
      }
      if (year > 2500) {
        year -= 543;
      }
      return `${getPart('day')}/${getPart('month')}/${year}`;
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
            this.Drug_Use_Stock = response.Drug_Use_Stock;
            this.Demand_Drug_Show = response.Demand_Drug_Show;
            this.Group_Pay_Drug = this.Group_Pay_Drug.map((item: any) => {
                const drug = this.LIST_MAS_DRUG.filter(g => g.ProductCode === item.ProductCode);              
                return {
                    ...item,
                    avgdemand: parseFloat(drug[0]?.avgdemand || '0'),
                    LeadTime: parseFloat(drug[0]?.LeadTime || '0'),
                    SafetyStock: parseFloat(drug[0]?.SafetyStock || '0'),
                    // forecast_qty: parseFloat(stockUseDrug[0]?.Forecast || '0'),
                }
            });
            this.List_DeliveryDrug = response.List_DeliveryDrug;
            // this.LIST_DM_PRODUCT = response.LIST_DM_PRODUCT;
            this.List_DeliveryDrug.forEach((item: any) => {
              item.DeliveryDate = this.formatJsonDate(item.DeliveryDate);
            });

           this.old_List_DeliveryDrug = [...this.List_DeliveryDrug];

            if(this.drugCode == ''){
              this.List_DeliveryDrug = this.old_List_DeliveryDrug;
            }else{
              this.List_DeliveryDrug = this.List_DeliveryDrug.filter((item: any) => item.ProductCode == this.drugCode);
            }
            // เพิ่มฟิลด์ rop, dop, soh, ราคาต่อหน่วย, ราคารวมต่อหน่วย ให้ LIST_MAS_DRUG
            this.enrichListMasDrug();
            
            this.prepareForecastChart(this.Group_Pay_Drug, this.List_product, this.drugCode, this.Drug_Use_Stock, this.List_DeliveryDrug, this.Demand_Drug_Show);   
            this.getKpis(this.Group_Pay_Drug, this.List_product, this.drugCode);
            this.serviceUseDrug.setGridData(this.Drug_Use_Stock || []);
        });   
    }

    loadDataService(): void {
        this.inventoryService.loadData(this.userData, {
            listMasDrug: this.LIST_MAS_DRUG,
            listMasTypeDrug: this.List_MAS_TYPE_DRUG
        });
    }

    onSort(tableType: string, column: string) {
        if (tableType === 'risk') {
            this.serviceRisk.getSortData(column);
        } else if (tableType === 'nearExpiry') {
            this.serviceNearExpiry.getSortData(column);
        } else if (tableType === 'useDrug') {
            this.serviceUseDrug.getSortData(column);
        } else {
            this.serviceMasDrug.getSortData(column);
        }
    }

    onSearchUseDrug(): void {
        this.serviceUseDrug.searchTerm = this.searchTermUseDrug;
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
      nearExpiry: { d180: 0, d270: 0, d360: 0 },
      purchaseRequests: { pending: 0, approved: 0, amountApproved: 0 },
      poOpen: { count: 0, amount: 0 },
      forecastAccuracyPrevMonth: { mape: 0, wape: 0 },
      RiskItem: [],
      RiskItemNearExpiry: [],
      totalQuantity: 0,
      totalValue: 0
    };
  
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
      const validStock = stock.filter((s: any) => {
        if (!s?.exp_date) return true; // ถ้าไม่มีวันหมดอายุให้ถือว่าใช้ได้
        const expDate = new Date(s.exp_date);
        if (isNaN(expDate.getTime())) return true;
        const diffDays = Math.ceil((expDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return diffDays >= 0; // ตัดล็อตที่หมดอายุแล้ว (diffDays < 0)
      });
  
      // --- รวมยอดรายเดือน (กันเดือนซ้ำ) + เรียงเวลา ---
      const agg: Record<string, { label: string; value: number }> = {};
      for (const x of hist) {
        const label = `${x.yearaprv}-${String(x.monthaprv).padStart(2, '0')}`;
        if (!agg[label]) agg[label] = { label, value: 0 };
        agg[label].value += Number(x.PurchaseOrderItemApprovedAmount) || 0;
      }
      const monthly = Object.values(agg).sort((a, b) => a.label.localeCompare(b.label));
  
      // --- ค่าเฉลี่ยรายเดือน (ใช้เฉพาะ 6 เดือนล่าสุด เพื่อทันสมัยขึ้น) ---
      const avgMonthly = parseFloat(prod.avgdemand) || 0;
  
      // --- LeadTime (เดือน): ใช้จาก product ก่อน, ไม่มีก็เฉลี่ยจาก hist ---
      let leadTimeMonths = Number(prod.LeadTime) || 0;
      // if (!leadTimeMonths && hist.length) {
      //   const sumLT = hist.reduce((a, b) => a + (Number(b.LeadTime) || 0), 0);
      //   leadTimeMonths = sumLT / hist.length;
      // }
  
      // --- Safety Stock & ROP (หน่วย: ชิ้น/เดือน) ---
      const safetyStock = parseFloat(prod.SafetyStock) || 0;
      const ropUnits = parseFloat(prod.ReorderPoint) || 0;
  
      // --- Stock & DOH ---
      const currentStock = validStock.reduce((a, b) => a + (Number(b.inspection_qty) || 0), 0);
      const daily = avgMonthly > 0 ? avgMonthly / 30 : 0;
      const doh = daily > 0 ? Math.floor(currentStock / daily) : 0;
  
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
          unit: prod.ProductUnitName,
          SafetyStock: safetyStock
        });
      }

      for (const s of stock) {
        const exp_date_obj = new Date(s.exp_date);
        const current_date = new Date();
        
        // คำนวณส่วนต่างของวัน
        const diff_time = exp_date_obj.getTime() - current_date.getTime();
        const diff_days = Math.ceil(diff_time / (1000 * 60 * 60 * 24));
      
        // สร้าง Object ข้อมูลพื้นฐานเพื่อลดการเขียนซ้ำ (Dry principle)
        const itemData = {
          productCode: code,
          productName: prod.ProductTradeName,
          lot: s.LOT,
          exp_date: s.exp_date,
          doh: doh,
          rop: ropUnits,
          currentStock: s.inspection_qty,
          unit: s.ProductUnitName,
          daysToExpire: diff_days,
          SafetyStock: safetyStock,
          IsExpired: false
        };
      
        // --- ส่วนการเช็คเงื่อนไข ---
        if (diff_days < 0) {
          // กรณีที่ 1: หมดอายุแล้ว (ค่าติดลบ)
          // คุณอาจจะเพิ่ม this.kpis.expired++ หรือจัดการตามต้องการ
          itemData.IsExpired = true;
          // this.kpis.RiskItemNearExpiry.push(itemData);
        } else if (diff_days <= 180) {
          // กรณีที่ 2: ใกล้หมดอายุภายใน 180 วัน
          this.kpis.nearExpiry.d180++;
          this.kpis.RiskItemNearExpiry.push(itemData);
          
        } else if (diff_days <= 270) {
          // กรณีที่ 3: ใกล้หมดอายุภายใน 270 วัน
          this.kpis.nearExpiry.d270++;
          this.kpis.RiskItemNearExpiry.push(itemData);
          
        } else if (diff_days <= 360) {
          // กรณีที่ 4: ใกล้หมดอายุภายใน 360 วัน
          this.kpis.nearExpiry.d360++;
          this.kpis.RiskItemNearExpiry.push(itemData);
        }
      }
    //   if(diff_days <= 90){
    //     this.kpis.nearExpiry.value90 += currentStock;
    //   }
     
      dohall += doh;
      counted++;

      this.kpis.totalQuantity = this.kpis.totalQuantity + (currentStock || 0);
      const productPrice = items.find((item: any) => item.ProductCode === code)?.ProductPrice || 0;
      this.kpis.totalValue = this.kpis.totalValue + ((currentStock || 0) * parseFloat(productPrice) || 0);
  
    }
    this.kpis.RiskItemNearExpiry = this.kpis.RiskItemNearExpiry.sort((a, b) => a.daysToExpire - b.daysToExpire);
    this.kpis.RiskItem = this.kpis.RiskItem.sort((a, b) => a.doh - b.doh);
    // ใช้ service แยกกันสำหรับแต่ละตาราง
    this.serviceRisk.setGridData(this.kpis.RiskItem);
    
    this.serviceNearExpiry.setGridData(this.kpis.RiskItemNearExpiry);
    
    // เฉลี่ยจากจำนวนสินค้าที่คำนวณจริง
    this.kpis.avgDOH = counted ? Math.floor(dohall / counted) : 0;

   
    // คำนวณ MAPE/WAPE จากข้อมูลทั้งหมด
    // this.calculateMAPEWAPE(historyData);
  }

  calculateMAPEWAPE(historyData: any[]): void {
    // รวมข้อมูลทั้งหมดตามเดือน
    const agg: Record<string, { label: string; actual: number; forecast: number }> = {};
    
    // จัดกลุ่มข้อมูลตาม ProductCode และเดือน
    const productGroups: Record<string, any[]> = {};
    for (const x of historyData) {
      const code = x.ProductCode;
      if (!productGroups[code]) {
        productGroups[code] = [];
      }
      productGroups[code].push(x);
    }

    let totalMAPE = 0;
    let totalWAPE = 0;
    let totalAbsoluteError = 0;
    let totalActual = 0;
    let count = 0;

    // คำนวณ MAPE/WAPE สำหรับแต่ละสินค้า
    for (const [productCode, hist] of Object.entries(productGroups)) {
      // รวมยอดรายเดือน
      const monthlyAgg: Record<string, number> = {};
      for (const x of hist) {
        const label = `${x.yearaprv}-${String(x.monthaprv).padStart(2, '0')}`;
        monthlyAgg[label] = (monthlyAgg[label] || 0) + (Number(x.PurchaseOrderItemApprovedAmount) || 0);
      }
      
      const monthly = Object.entries(monthlyAgg)
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => a.label.localeCompare(b.label));

      // ต้องมีอย่างน้อย 2 เดือนเพื่อคำนวณ forecast
      if (monthly.length < 2) continue;

      // ใช้ข้อมูลเดือนก่อนหน้าเพื่อ forecast เดือนถัดไป
      for (let i = 1; i < monthly.length; i++) {
        const actual = monthly[i].value;
        if (actual <= 0) continue; // ข้ามถ้า actual เป็น 0 หรือติดลบ

        // คำนวณ forecast จากค่าเฉลี่ยของเดือนก่อนหน้า
        const pastValues = monthly.slice(0, i).map(m => m.value);
        const forecast = pastValues.reduce((a, b) => a + b, 0) / pastValues.length;

        // คำนวณ error
        const absoluteError = Math.abs(actual - forecast);
        const percentageError = (absoluteError / actual) * 100;

        totalMAPE += percentageError;
        totalAbsoluteError += absoluteError;
        totalActual += actual;
        count++;
      }
    }

    // คำนวณ MAPE (Mean Absolute Percentage Error)
    if (this.kpis && this.kpis.forecastAccuracyPrevMonth) {
      this.kpis.forecastAccuracyPrevMonth.mape = count > 0 ? totalMAPE / count : 0;
      // คำนวณ WAPE (Weighted Absolute Percentage Error)
      this.kpis.forecastAccuracyPrevMonth.wape = totalActual > 0 ? (totalAbsoluteError / totalActual) * 100 : 0;
    }
  }
  
  fullModal(smallDataModal: any, data: any): void {
    this.modalService.open(smallDataModal, { size: 'fullscreen', windowClass: 'modal-holder' });
    this.Detail_product = this.List_product_detail.filter((item: any) => item.ProductCode === data.productCode);
    this.serviceDetail.setGridData(this.Detail_product);
}

  private getForecastScaleFactor(): number {
    const pct = Number(this.forecastAdjustmentPercent);
    return 1 + (isNaN(pct) ? 0 : pct) / 100;
  }

  private applyForecastPercentToSeries(base: (number | null)[]): (number | null)[] {
    const f = this.getForecastScaleFactor();
    return base.map(v => (v == null ? null : v * f));
  }

  private applyForecastPercentToValues(values: number[]): number[] {
    const f = this.getForecastScaleFactor();
    return values.map(v => (Number(v) || 0) * f);
  }

  private rebuildInstallmentPlan(): void {
    if (!this.installmentPlanContext) {
      this.installmentPlan = [];
      return;
    }
    const { labels, forecastValues, stockQty, deliveryValues } = this.installmentPlanContext;
    const adjustedForecast = this.applyForecastPercentToValues(forecastValues);
    this.buildInstallmentPlan(labels, adjustedForecast, stockQty, deliveryValues);
  }

  onForecastAdjustmentChange(): void {
    this.rebuildInstallmentPlan();

    if (!this.seriesForecastBaseData?.length || !this.lineOptions?.series) {
      return;
    }
    const newForecastSeries = this.applyForecastPercentToSeries(this.seriesForecastBaseData);
    const series = this.lineOptions.series.map((s, i) =>
      i === 1 ? { ...s, data: newForecastSeries } : s
    );
    const nums = series.flatMap(s =>
      (s.data as (number | null)[]).filter((v): v is number => v != null && !isNaN(Number(v))).map(Number)
    );
    const yMinData = nums.length ? Math.min(...nums) : 0;
    const yMaxData = nums.length ? Math.max(...nums) : 10;
    const yMin = Math.floor(yMinData * 0.9);
    const yMax = Math.ceil(yMaxData * 1.05);
    const prevY = this.lineOptions.yaxis;
    this.lineOptions = {
      ...this.lineOptions,
      series,
      yaxis: { ...prevY, min: yMin, max: yMax }
    };
  }

   // คำนวณแนวโน้ม + forecast
   prepareForecastChart(historyData: any[], stockData: any[], productCode: string, stockUseDrug: any[], deliveryDrug: any[], demandData: any[]): void {
    const code = productCode?.trim();
    const z = 1.65; // ~95% service level
  
    // 1) ดึงข้อมูลเฉพาะสินค้าตัวนี้ (ถ้า code ว่าง ให้ใช้ทั้งหมด)
    const hist = code ? historyData.filter(x => x.ProductCode === code) : historyData;
    const stock = code ? stockData.filter(x => x.ProductCode === code) : stockData;
    const demand = code ? demandData.filter(x => x.ProductCode === code) : demandData;
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
    
    const listMasDrug = this.LIST_MAS_DRUG || [];
    let drug_safetyStock: any[] = code === '' ? listMasDrug : listMasDrug.filter((x: any) => x.ProductCode === code);
    const safetyStock = drug_safetyStock.reduce((a, b) => a + ((Number(b?.SafetyStock) || 0) / (Number(b?.WorkPeriod) || 1)), 0);
    const ropUnits = drug_safetyStock.reduce((a, b) => a + ((Number(b?.ReorderPoint) || 0) / (Number(b?.WorkPeriod) || 1)), 0);
    // 8) DOH และ stock คงเหลือรวม
    const validStock = stock.filter((s: any) => {
      if (!s?.exp_date) return true; // ถ้าไม่มีวันหมดอายุให้ถือว่าใช้ได้
      const expDate = new Date(s.exp_date);
      if (isNaN(expDate.getTime())) return true;
      const diffDays = Math.ceil((expDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0; // ตัดล็อตที่หมดอายุแล้ว (diffDays < 0)
    });
    const stockQty = validStock.reduce((a, b) => a + (Number(b.inspection_qty) || 0), 0);
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
    const doh = daily > 0 ? Math.floor(stockQty / daily) : 0;
  
    // 9) สร้าง Forecast ตาม period (ใช้ forecastMonths เป็นหน่วย "เดือน" แล้ว scale ตาม period)
    const fMonths = Math.max(1, Math.min(60, Number(this.forecastMonths) || 12));
    const futureCount = periodId === 1 ? 7                                    // รายวัน: คงที่ 7 วัน
                      : periodId === 2 ? fMonths                               // รายเดือน: ตามที่กำหนด
                      : periodId === 3 ? Math.max(1, Math.round(fMonths / 3))  // รายไตรมาส
                      : Math.max(1, Math.round(fMonths / 12));                 // รายปี
    const lastLabel = pastLabels[pastLabels.length - 1] || this.getCurrentLabel(periodId);
    const forecastLabels: string[] = [];
    const forecastValues: number[] = [];
    const demandValues: (number | null)[] = [];
   
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
      // Po_Month วนซ้ำทุก 12 เดือน (stockUseDrug มีแค่เดือน 1-12)
      let monthaprv = (forecastLabels[i - 1].split('-')[1] as any) - 1;
      if (monthaprv === 0) { monthaprv = 12; }
      // cycle: ถ้าเกิน 12 เดือน ให้วนซ้ำ Po_Month ผ่าน modulo
      const cyclicMonth = ((monthaprv - 1) % 12) + 1;
      let forecast = [];
      
      if(code == '') {
        forecast = stockUseDrug.filter(x => parseInt(x.Po_Month) === cyclicMonth);
      } else {
        forecast = stockUseDrug.filter(x => x.ProductCode === code && parseInt(x.Po_Month) == cyclicMonth);
      }

      // คำนวณ forecast valu
      if (periodData.length) {
        const avgF = forecast.reduce((a, b) => a + parseFloat(b.Forecast), 0);
        forecastValues.push(avgF || 0);
      } else {
        forecastValues.push(avgPeriod || 0);
      }

      // ถ้าเป็นรอบสุดท้าย ให้เพิ่ม forecast อีก 1 เดือนจาก cyclicMonth ถัดไป
      if (periodId === 2 && i === futureCount) {
        const extraLabel = this.addMonth(forecastLabels[i - 1], 1);
        // forecastLabels.push(extraLabel);
        const nextCyclicMonth = (cyclicMonth % 12) + 1;
        let extraForecast = [];
        if (code == '') {
          extraForecast = stockUseDrug.filter(x => parseInt(x.Po_Month) === nextCyclicMonth);
        } else {
          extraForecast = stockUseDrug.filter(x => x.ProductCode === code && parseInt(x.Po_Month) == nextCyclicMonth);
        }

        if (periodData.length) {
          const extraAvgF = extraForecast.reduce((a, b) => a + parseFloat(b.Forecast), 0);
          forecastValues.push(extraAvgF || 0);
        } else {
          forecastValues.push(avgPeriod || 0);
        }
      }
    }

    // 9.1) ความต้องการยา (Demand_Drug_Show) -> เส้นคงที่ช่วงอนาคต
    // shape จาก backend: YEAR, ProductCode, drugQty (sum(QTY))
    const demandRows = Array.isArray(this.Demand_Drug_Show) ? this.Demand_Drug_Show : [];
    const demandByYearCE: Record<number, number> = {};
    for (const r of demandRows) {
      if (!r) continue;
      if (code && r.ProductCode !== code) continue;
      const yRaw = Number(r.YEAR);
      if (!yRaw) continue;
      const yCE = yRaw > 2500 ? yRaw - 543 : yRaw; // รองรับปี พ.ศ.
      demandByYearCE[yCE] = (demandByYearCE[yCE] || 0) + (Number(r.drugQty) || 0);
    }

    const toYearFromLabel = (label: string): number => {
      if (!label) return new Date().getFullYear();
      if (periodId === 1) return Number(String(label).split('-')[0]) || new Date().getFullYear(); // YYYY-MM-DD
      if (periodId === 2) return Number(String(label).split('-')[0]) || new Date().getFullYear(); // YYYY-MM
      if (periodId === 3) return Number(String(label).split('-Q')[0]) || new Date().getFullYear(); // YYYY-Qx
      if (periodId === 4) return Number(label) || new Date().getFullYear(); // YYYY
      return Number(String(label).split('-')[0]) || new Date().getFullYear();
    };

    const demandPerLabel = (label: string): number => {
      const y = toYearFromLabel(label);
      const yearly = demandByYearCE[y] || 0;
      // if (periodId === 1) return yearly / 365;
      // if (periodId === 2) return yearly / 12;
      // if (periodId === 3) return yearly / 4;
      return yearly;
    };

    for (let i = 0; i < forecastLabels.length; i++) {
      demandValues.push(demandPerLabel(forecastLabels[i]) || 0);
    }

    // 11) เตรียม series ให้ยาวเท่ากับแกนเวลา (อดีต + อนาคต)
    const categories = [...pastLabels, ...forecastLabels];
    const finDeliveryByCategory = this.buildDeliverySeriesByDate(
      categories, deliveryDrug, code, periodId, 'Fin_DeliveryQty'
    );
    const overdueDeliveryByCategory = this.buildDeliverySeriesByDate(
      categories, deliveryDrug, code, periodId, 'Overdue_DeliveryQty'
    );
    const deliveryValues = finDeliveryByCategory.slice(pastLabels.length);

    // แผนแบ่งงวดส่งตามจำนวนงวดที่ผู้ใช้กำหนด (ใช้ forecast หลังปรับ %)
    this.installmentPlanContext = {
      labels: [...forecastLabels],
      forecastValues: [...forecastValues],
      stockQty,
      deliveryValues: [...deliveryValues]
    };
    this.rebuildInstallmentPlan();
  
    // 10) จำลอง stock คงเหลือในอนาคต (ตัดตาม forecast และ +delivery เมื่อมีส่งมอบ)
    // stockValues[0] = stock ณ จุดเริ่มคาดการณ์, stockValues[i+1] = stock หลังเดือนอนาคตลำดับ i
    const stockValues: number[] = [];
    let stockRemain = stockQty;
    stockValues.push(stockRemain);
    for (let i = 0; i < forecastValues.length; i++) {
      const forecastOut = Number(forecastValues[i]) || 0;
      const deliveryIn = periodId === 2 ? (Number(deliveryValues[i]) || 0) : 0; // รองรับรายเดือนเป็นหลัก
      stockRemain = Math.max(stockRemain - forecastOut + deliveryIn, 0);
      stockValues.push(stockRemain);
    }
  
    const seriesActual = pastValues; // ความยาว = pastLabels.length
   // 3) Forecast ให้ "ต่อจากจุดสุดท้ายของ Actual" (+ ปรับตาม % ที่ผู้ใช้กำหนดบนกราฟ)
    const seriesForecastBase = [
        ...pastValues.slice(0, -1).map(() => null),
        ...forecastValues
    ];
    this.seriesForecastBaseData = seriesForecastBase.map(v => v);
    const seriesForecast = this.applyForecastPercentToSeries(seriesForecastBase);
    // 4) Stock ให้ "เริ่มที่จุดสุดท้ายของ Actual" เช่นกัน
    const seriesStock = [
        ...pastValues.slice(0, -1).map(() => null),           // เว้นว่างก่อนหน้า
        stockQty,                                             // สต็อก ณ จุดสุดท้ายของ history
        ...stockValues.slice(2)                               // ต่อด้วยคงเหลือในอนาคต (ยาวเท่า forecastLabels)
    ];
    const seriesDelivery = finDeliveryByCategory;
    const seriesOverdueDelivery = overdueDeliveryByCategory;
    const demandPastValues = pastLabels.map(label => demandPerLabel(label) || 0);
    const seriesDemand = [
        ...demandPastValues,                         // ช่วงอดีตเติมตามปีที่มีข้อมูล
        ...demandValues                              // ความต้องการยาในอนาคต
    ];
    const seriesROP = new Array(categories.length).fill(ropUnits);
    const seriesSafetyStock = new Array(categories.length).fill(safetyStock);

    // 12) สเกลแกน Y
    const adjustedForecastValues = forecastValues.map(v => (Number(v) || 0) * this.getForecastScaleFactor());
    const nums = [
      ...seriesActual,
      ...adjustedForecastValues,
      ...finDeliveryByCategory,
      ...overdueDeliveryByCategory,
      ...seriesDemand,
      ...stockValues,
      ...seriesROP,
      ...seriesSafetyStock
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
      colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#27CCF5', '#F97316', '#9CA3AF'],
      stroke: {
        curve: 'smooth',
        width: [3, 3, 3, 2, 2, 3, 3, 3],
        dashArray: [0, 6, 0, 6, 6, 6, 6, 6]
      },
      markers: {
        size: [4, 6, 6, 0, 0, 6, 6, 6] as unknown as number[],
        strokeWidth: 3,
        strokeColors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#27CCF5', '#F97316', '#9CA3AF'],
        fillOpacity: 1,
        hover: { size: 9, sizeOffset: 3 }
      },
      dataLabels: {
        enabled: true,
        enabledOnSeries: [0, 1, 2, 5, 6],
        formatter: (val: number) => (val == null ? '' : Math.round(val).toLocaleString()),
        background: { enabled: true, borderRadius: 4, foreColor: '#111827', padding: 4, opacity: 0.9 },
        offsetY: -10
      },
      fill: { type: 'solid', opacity: [0.95, 0.95, 0.95, 0.7, 0.7, 0.95, 0.95, 0.95] },
      legend: { position: 'top' },
      grid: { strokeDashArray: 4 },
      tooltip: { shared: true, y: { formatter: (v: number) => (v == null ? '' : Math.round(v).toLocaleString()) } },
      title: { text: '', align: 'left' },
      xaxis: { categories },
      yaxis: { decimalsInFloat: 0, min: yMin, max: yMax, labels: { formatter: (v: number) => Math.round(v).toLocaleString() } },
      series: [
        { name: 'ประวัติการขาย',  data: seriesActual },
        { name: 'การคาดการณ์ยอดขาย', data: seriesForecast },
        { name: 'สต็อกคงเหลือ',   data: seriesStock },
        { name: 'จุดสั่งซื้อ(ROP)', data: seriesROP },
        { name: 'สต็อกสำรอง(Safety Stock)', data: seriesSafetyStock },
        { name: 'ยอดส่งมอบยา', data: seriesDelivery, color: '#27CCF5' },
        { name: 'ค้างส่งมอบ', data: seriesOverdueDelivery, color: '#F97316' },
        { name: 'ความต้องการยา', data: seriesDemand, color: '#9CA3AF' }
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
  
  private parseDeliveryDateParts(deliveryDate: string): { year: number; month: number; day: number } | null {
    if (!deliveryDate) {
      return null;
    }
    if (String(deliveryDate).startsWith('/Date(')) {
      const d = this.convertJsonDate(deliveryDate);
      if (!d) {
        return null;
      }
      return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
    }
    const slashParts = String(deliveryDate).split('/');
    if (slashParts.length === 3) {
      const day = parseInt(slashParts[0], 10);
      const month = parseInt(slashParts[1], 10);
      let year = parseInt(slashParts[2], 10);
      if (isNaN(day) || isNaN(month) || isNaN(year)) {
        return null;
      }
      if (year > 2500) {
        year -= 543;
      }
      return { year, month, day };
    }
    const isoParts = String(deliveryDate).split('-');
    if (isoParts.length === 3) {
      const year = parseInt(isoParts[0], 10);
      const month = parseInt(isoParts[1], 10);
      const day = parseInt(isoParts[2], 10);
      if (isNaN(year) || isNaN(month) || isNaN(day)) {
        return null;
      }
      return { year, month, day };
    }
    return null;
  }

  private deliveryMatchesCategory(
    categoryLabel: string,
    parts: { year: number; month: number; day: number },
    periodId: number
  ): boolean {
    if (periodId === 1) {
      const label = `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
      return categoryLabel === label;
    }
    if (periodId === 2) {
      const [y, m] = String(categoryLabel).split('-');
      return parseInt(y, 10) === parts.year && parseInt(m, 10) === parts.month;
    }
    if (periodId === 3) {
      const [y, qPart] = String(categoryLabel).split('-Q');
      const quarter = parseInt(qPart, 10);
      const itemQuarter = Math.ceil(parts.month / 3);
      return parseInt(y, 10) === parts.year && itemQuarter === quarter;
    }
    if (periodId === 4) {
      return parseInt(categoryLabel, 10) === parts.year;
    }
    return false;
  }

  private buildDeliverySeriesByDate(
    categories: string[],
    deliveryDrug: any[],
    productCode: string,
    periodId: number,
    qtyField: 'Fin_DeliveryQty' | 'Overdue_DeliveryQty'
  ): number[] {
    const code = productCode?.trim();
    const list = Array.isArray(deliveryDrug) ? deliveryDrug : [];
    return categories.map((label) => {
      if (!list.length) {
        return 0;
      }
      let sum = 0;
      for (const item of list) {
        if (!item) {
          continue;
        }
        if (code && item.ProductCode !== code) {
          continue;
        }
        const parts = this.parseDeliveryDateParts(item.DeliveryDate);
        if (!parts || !this.deliveryMatchesCategory(label, parts, periodId)) {
          continue;
        }
        if (qtyField === 'Fin_DeliveryQty') {
          sum += Number(item.Fin_DeliveryQty ?? item.DeliveryQty) || 0;
        } else {
          sum += Number(item.Overdue_DeliveryQty) || 0;
        }
      }
      return sum;
    });
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
    //แก้เปลี่ยนเป็น season
    // const z = 1.65; // ~95% service level
    
    // this.LIST_MAS_DRUG = this.LIST_MAS_DRUG.map((drug: any) => {
    //   const code = drug.ProductCode;
      
    //   // ดึงข้อมูลประวัติการซื้อ
    //   const hist = (this.Group_Pay_Drug || []).filter((x: any) => x.ProductCode === code);
      
    //   // ดึงข้อมูลสต็อก
    //   const stock = (this.List_product || []).filter((x: any) => x.ProductCode === code);
      
    //   // คำนวณค่าเฉลี่ยรายเดือน (6 เดือนล่าสุด)
    //   const agg: Record<string, { label: string; value: number }> = {};
    //   for (const x of hist) {
    //     const label = `${x.yearaprv}-${String(x.monthaprv).padStart(2, '0')}`;
    //     if (!agg[label]) agg[label] = { label, value: 0 };
    //     agg[label].value += Number(x.PurchaseOrderItemApprovedAmount) || 0;
    //   }
    //   const monthly = Object.values(agg).sort((a, b) => a.label.localeCompare(b.label));
    //   const last6 = monthly.slice(-6);
    //   const pastValues = last6.map(m => m.value);
    //   const avgMonthly = pastValues.length
    //     ? pastValues.reduce((a, b) => a + b, 0) / pastValues.length
    //     : 0;
      
    //   // LeadTime (เดือน)
    //   let leadTimeMonths = Number(drug.LeadTime) || 0;
    //   if (!leadTimeMonths && hist.length) {
    //     const sumLT = hist.reduce((a: number, b: any) => a + (Number(b.LeadTime) || 0), 0);
    //     leadTimeMonths = sumLT / hist.length;
    //   }
      
    //   // SD รายเดือน
    //   const n = Math.max(pastValues.length, 1);
    //   const varianceMonth = pastValues.length
    //     ? pastValues.map(v => (v - avgMonthly) ** 2).reduce((a, b) => a + b, 0) / n
    //     : 0;
    //   const sdMonth = Math.sqrt(varianceMonth);
      
    //   // Safety Stock & ROP
    //   const safetyStock = z * sdMonth * Math.sqrt(Math.max(leadTimeMonths, 0));
    //   const rop = (avgMonthly * leadTimeMonths) + safetyStock;
      
    //   // SOH (Stock on Hand) - รวมจำนวนสต็อกทั้งหมด
    //   const soh = stock.reduce((a: number, b: any) => a + (Number(b.inspection_qty) || 0), 0);
      
    //   // DOP (Days of Purchase) - จำนวนวันที่ต้องสั่งซื้อ (คำนวณจาก ROP และ demand รายวัน)
    //   const daily = avgMonthly > 0 ? avgMonthly / 30 : 0;
    //   const dop = daily > 0 ? (rop / daily) : 0;
      
    //   // ราคาต่อหน่วย (Price per Unit)
    //   const pricePerUnit = parseFloat(drug.ProductPrice || '0');
      
    //   // ราคารวมต่อหน่วย (Total Price per Unit) - ราคารวมของสต็อกทั้งหมดต่อหน่วย
    //   const totalPricePerUnit = soh > 0 ? (stock.reduce((a: number, b: any) => a + (Number(b.total_price) || 0), 0) / soh) : pricePerUnit;
      
    //   return {
    //     ...drug,
    //     rop: rop,
    //     dop: dop,
    //     soh: soh,
    //     daily_use: daily,
    //     pricePerUnit: pricePerUnit,
    //     totalPricePerUnit: totalPricePerUnit
    //   };
    // });

    // this.LIST_MAS_DRUG = this.LIST_MAS_DRUG.map((drug: any) => {
    //   const avgPerDay = Number(drug.avgdemand) / 30; 
    //   return {
    //     ...drug,
    //     rop: parseFloat(drug.ReorderPoint || '0'),
    //     dop: parseFloat(drug.dop || '0'),
    //     soh: parseFloat(drug.soh || '0'),
    //     daily_use: parseFloat(drug.daily_use || '0'),
    //     pricePerUnit: parseFloat(drug.pricePerUnit || '0'),
    //     totalPricePerUnit: parseFloat(drug.totalPricePerUnit || '0')
    //   };
    // });
    // อัพเดท filteredDrugs ด้วย
    this.filterDrugs();
    
    // อัพเดทตาราง
    this.serviceMasDrug.setGridData(this.LIST_MAS_DRUG);
    
    // สร้างกราฟทั้งหมด
    // this.prepareAllCharts();
  }

  // สร้างกราฟทั้งหมด
  prepareAllCharts(): void {
    // this.prepareStockRopChart();
    // this.prepareDrugGroupDonutChart();
    this.prepareInventoryValueBarChart();
    // this.prepareRiskBubbleChart();
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
      Subject: '[!Low Stock Alert!] ยาใกล้ขาดคราว',
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

  focusRiskTable(): void {
    const el = this.riskTableSection?.nativeElement;
    if (!el) return;

    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => el.focus(), 300);
  }

  downloadUseDrugExcel(): void {
    const rows = (this.Drug_Use_Stock || []).map((item: any, index: number) => ({
      'ลำดับ': index + 1,
      'ชื่อยา': item.ProductTradeName || '',
      'เดือน': item.Po_Month || '',
      'ยอดใช้ยาย้อนหลัง 1 ปี': item.Qty_Y1 || 0,
      'ยอดใช้ยาย้อนหลัง 2 ปี': item.Qty_Y2 || 0,
      'ยอดใช้ยาย้อนหลัง 3 ปี': item.Qty_Y3 || 0,
      'Moving average ย้อนหลัง 1 ปี': item.MA_Y1 || 0,
      'Moving average ย้อนหลัง 2 ปี': item.MA_Y2 || 0,
      'Moving average ย้อนหลัง 3 ปี': item.MA_Y3 || 0,
      'Season ratio ย้อนหลัง 1 ปี': item.SeasonRatioY1 || 0,
      'Season ratio ย้อนหลัง 2 ปี': item.SeasonRatioY2 || 0,
      'Season ratio ย้อนหลัง 3 ปี': item.SeasonRatioY3 || 0,
      'Season index': item.SeasonIndex || 0,
      'จำนวนยอดใช้เฉลี่ย': item.Useavg12 || 0,
      'คาดการณ์ยอดใช้ยาปีนี้': item.Forecast || 0
    }));
    this.exportTableToExcel(rows, 'รายการยา', 'รายการยา');
  }

  downloadRiskExcel(): void {
    const rows = (this.kpis?.RiskItem || []).map((item: any, index: number) => ({
      'ลำดับ': index + 1,
      'ชื่อการค้า': item.productName || '',
      'สต็อกคงเหลือ(SOH)': item.soh || 0,
      'วันคงเหลือ(DOH)': item.doh || 0,
      'จุดสั่งซื้อ(ROP)': item.rop || 0,
      'ความปลอดภัย(Safety Stock)': item.SafetyStock || 0,
      'จำนวนที่ใช้ต่อวัน': item.avgDailyUse || 0,
      'หน่วย': item.unit || ''
    }));
    this.exportTableToExcel(rows, 'ยาใกล้ขาดคราว', 'ยาใกล้ขาดคราว');
  }

  downloadNearExpiryExcel(): void {
    const rows = (this.kpis?.RiskItemNearExpiry || []).map((item: any, index: number) => ({
      'ลำดับ': index + 1,
      'ชื่อการค้า': item.productName || '',
      'LOT': item.lot || '',
      'วันหมดอายุ': item.exp_date || '',
      'วันที่เหลือก่อนหมดอายุ': item.daysToExpire || 0,
      'จำนวน': item.currentStock || 0,
      'หน่วย': item.unit || ''
    }));
    this.exportTableToExcel(rows, 'ยาที่ใกล้หมดอายุ', 'ยาที่ใกล้หมดอายุ');
  }

  private exportTableToExcel(rows: any[], sheetName: string, filePrefix: string): void {
    try {
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      const fileName = `${filePrefix}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error('Error exporting excel:', error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถส่งออกข้อมูลเป็น Excel ได้'
      });
    }
  }
  
  
}