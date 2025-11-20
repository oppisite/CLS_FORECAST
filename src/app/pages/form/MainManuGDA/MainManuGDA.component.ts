import { Component, ElementRef, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormGroup, FormBuilder, FormArray, FormControl, FormControlName, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import * as XLSX from 'xlsx';
import { DomSanitizer } from '@angular/platform-browser';
import { evaluate } from 'mathjs';
import html2canvas from 'html2canvas';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'MainManuGDA-cmp',
  templateUrl: 'MainManuGDA.component.html',
})

export class MainManuGDAComponent {
  @ViewChild('captureElement', { static: false }) captureDiv!: ElementRef;
  


  validationform!: UntypedFormGroup;
  tooltipvalidationform!: UntypedFormGroup;
  submit!: boolean;
  formsubmit!: boolean;

  DataModel: any = '1';
  isLoading2: boolean = false;
  CalCustom: any;
  CalRefer: any = '1';
  SwitchCheckfood: any;
  show1SwitchCheckfood: Boolean = false;
  show2SwitchCheckfood: Boolean = false;
  ListProduct: any = [];
  AddListProductModel: any;
  TESTTEXT: any;
  ChkCheckAssent = {
    CheckAssent: false
  };
  ChkCheckDisabled: boolean = false;
  ChkGl: boolean = false;
  Calculate_FDL: any;
  search_data: any;
  unit_name: any;
  GL_Amount: any;
  GL_Amount_MT_MAX: any;
  GL_Unit_id: any;
  GL_Unit_Name: any;
  Listgroupsearch_dataFilter:any;
  ListTypesearch_dataFilter:any;
  ListTypesearch_Unit_dataFilter:any;
  UnitFinish:any;
  Listgroupsearch_data: any = [];
  selectedAccount: any;
  DefaultAccount = [
    { name: 'Choice 1' },
    { name: 'Choice 2' },
    { name: 'Choice 3' },
  ];
  selectedFood:any;
  DefaultFood = [
    { name: 'Choice 4' },
    { name: 'Choice 5' },
    { name: 'Choice 6' },
  ];

  constructor(private route: ActivatedRoute, private router: Router, private sanitizer: DomSanitizer, private http: HttpClient, private formBuilder: UntypedFormBuilder,private modalService: NgbModal) { }

  ngOnInit() {

    const formula = 'sqrt(a^2 + b^2)';
    const values = { a: 3, b: 4 };
    console.log('formula:' + evaluate(formula, values)); //

    // this.isLoading2 = true;
    let datenow = new Date();
    let day = datenow.getDate();
    let hour = datenow.getHours();
    let Minute = datenow.getMinutes();

    this.SwitchCheckfood = '1';
    this.show1SwitchCheckfood = true;
    this.show2SwitchCheckfood = false;

    this.validationform = this.formBuilder.group({
      // city: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]], // ตัวเลขและภาษาอังกฤษ
      // username: ['', [Validators.required]] // ป้องกันค่าว่างโดยตรง
      // Validators.pattern('^(?!\\s*$)[a-zA-Z0-9 ]+$') // ป้องกันค่าว่าง แต่เว้นวรรคได้
      Product: ['', [Validators.required, Validators.pattern('^(?!\\s*$).+')]], // ป้องกันค่าว่าง
    });

    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      observe: 'response' as 'response'
    };

    // // this.http.get(environment.GET_MasterData).subscribe((res_ponse) => {
    //   this.http.get(environment.GET_MasterData).subscribe((res_ponse) => {
    //   this.search_data = res_ponse;

    //   console.log("MData: ",this.search_data)

    //   // this.isLoading2 = false;
    // })

    this.http.get<any>(environment.GET_MasterData).subscribe({
      next: (res_ponse) => {
        this.search_data = res_ponse;
        this.Listgroupsearch_data = this.search_data.List_Mas_Food_Group;
        console.log("MData: ", this.search_data);
        console.log("Listgroupsearch_data: ", this.Listgroupsearch_data);
      },
      error: (error) => {
        console.error("Error fetching data:", error);
      }
      // this.isLoading2 = false;
    });
    var mock = {
      Product_Name: '',
      WG_Product_MT: 0,
      WG_Product: 0,
      WG_Unit_Id: 0,
      WG_Unit_Name: 0,
      Pagking_Unit: '',
      Pagking_Eat: '',
    };
    this.Calculate_FDL = mock;
  }
  ngAfterViewInit(): void {
    setTimeout(() => { // รอให้ DOM โหลดเสร็จ
      const button = document.getElementById('m_static');
      if (button) {
       // button.click(); 
      }
    }, 500); // รอ 500ms เพื่อให้ Bootstrap โหลดเสร็จก่อน
  }
  capture(id:any) {
    html2canvas(this.captureDiv.nativeElement).then(canvas => {
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = 'generated-image.png';
      link.click();
    });
  }
  
  isCaptchaValid: boolean = false;

  onCaptchaSuccess(isValid: boolean): void {
    this.isCaptchaValid = isValid;
  }

  onCalculateNutri(): void{
    let gl_cal = this.GL_Amount == ''? 1:this.GL_Amount;
    this.Calculate_FDL.Pagking_Eat = (this.Calculate_FDL.WG_Product / gl_cal);
  }
  
  confirmCaptcha(modal: any): void {
    if (this.isCaptchaValid) {
      modal.close(); // ปิด Modal เมื่อผ่าน CAPTCHA
    }
  }
  /**
   * Static modal
   * @param StaticDataModal modal content
   */
  StaticModal(StaticDataModal: any) {
    this.modalService.open(StaticDataModal, { centered: true, backdrop: 'static', // ป้องกันปิดเมื่อกดข้างนอก
           keyboard: false });
  }

  choosegroup(Ida: any) {
    console.log("P : ", Ida)

    this.search_data.List_Mas_Food_Group
    this.Listgroupsearch_dataFilter = this.search_data.List_Mas_Food_Group.filter((y: any) => y.Ida == Ida);
    console.log("Listgroupsearch_dataFilter : ", this.Listgroupsearch_dataFilter);

    this.ListTypesearch_dataFilter = this.search_data.List_Mas_Refer_Unit_Type.filter((y: any) => y.Group_No == this.Listgroupsearch_dataFilter[0].Ida);   
    this.selectedFood = this.ListTypesearch_dataFilter[0].Ida;
    this.choosetype(this.selectedFood);

    
  }

  chooseWgUnit(Ida: any){
    let fil_listUnit = this.search_data?.List_MAS_UNIT.filter((i:any) => i.IDA == this.Calculate_FDL.WG_Unit_Id);
    this.Calculate_FDL.WG_Unit_Name = fil_listUnit[0].UNIT_NAME_TH;
    this.UnitFinish = this.Calculate_FDL.WG_Unit_Id;
  }

  choosetype(Ida: any){
    console.log("T : ", Ida);


    this.ListTypesearch_Unit_dataFilter = this.ListTypesearch_dataFilter.filter((y: any) => y.Ida == Ida);
   let fil_listUnit = this.search_data?.List_MAS_UNIT.filter((i:any) => i.IDA == this.ListTypesearch_Unit_dataFilter[0].MT_UNIT_ID)
   debugger;
   if(fil_listUnit.length == 0){
    this.UnitFinish = '';
    this.unit_name = '';
    this.ChkGl = true;
    this.GL_Amount = this.ListTypesearch_Unit_dataFilter[0].GL_Amount_G;
    this.GL_Unit_id = this.ListTypesearch_Unit_dataFilter[0].G_UNIT_TH_ID;
    this.GL_Unit_Name = this.ListTypesearch_Unit_dataFilter[0].G_UNIT_TH;
    this.GL_Amount_MT_MAX = this.ListTypesearch_Unit_dataFilter[0].Amount_MT_MAX;
    this.Calculate_FDL.WG_Product_MT = 0;
    this.Calculate_FDL.WG_Unit_Id = '';
    this.Calculate_FDL.WG_Unit_Name = '';
   }else{
    this.UnitFinish = fil_listUnit[0].IDA;
    this.unit_name = fil_listUnit[0].UNIT_NAME_TH;
    this.ChkGl = false;
    this.GL_Amount = this.ListTypesearch_Unit_dataFilter[0].GL_Amount_MT;
    this.GL_Unit_id = this.ListTypesearch_Unit_dataFilter[0].G_UNIT_TH_ID;
    this.GL_Unit_Name = this.ListTypesearch_Unit_dataFilter[0].G_UNIT_TH;
    this.GL_Amount_MT_MAX = this.ListTypesearch_Unit_dataFilter[0].Amount_MT_MAX;
    this.Calculate_FDL.WG_Product_MT = 0;
    this.Calculate_FDL.WG_Unit_Id = '';
    this.Calculate_FDL.WG_Unit_Name = '';
   }


  }

  SwitchCheckfoodFN() {
    if (this.SwitchCheckfood == '1') {
      this.show1SwitchCheckfood = true;
      this.show2SwitchCheckfood = false;
    } else if (this.SwitchCheckfood == '2') {
      this.show1SwitchCheckfood = false;
      this.show2SwitchCheckfood = true;
    }
  }

  NotReportCaloriesfromfat(evt: any) {
    console.log("EVT : ", evt)
    if (evt == true || evt == "true") {
      this.ChkCheckAssent.CheckAssent = true;
      this.ChkCheckDisabled = true;
      // document.getElementById("CaloriesfromfatInput")!.setAttribute("disabled", "true");
    } else if (evt == false || evt == "false") {
      this.ChkCheckAssent.CheckAssent = false;
      this.ChkCheckDisabled = false;
    }
  }

  AddProduct() {

    this.ListProduct.push({
      IDA: "TEST",
      Product_Code: "TEST",
      Product_Name: this.AddListProductModel,
      Product_Amount: "TEST",
      Product_FileCheck: "TEST"
    })
    this.AddListProductModel = "";
  }

  DelectProduct(i: any) {
    this.ListProduct.splice(i, 1) // ลบข้อมูลตำแหน่งที่ i , 1 แถว
  }

  validSubmit() {
    this.submit = true;

    console.log("TESTTEXT : ", this.TESTTEXT)
  }

  get form() {
    return this.validationform.controls;
  }

  // File Upload
  imageURL: any;
  fileChange(event: any) {
    let fileList: any = (event.target as HTMLInputElement);
    let file: File = fileList.files[0];
    console.log("file : ", file)
    const reader = new FileReader();
    reader.onload = () => {
      this.imageURL = reader.result as string;
      document.querySelectorAll('#user-img').forEach((element: any) => {
        element.src = this.imageURL;
        console.log("imageURL : ", this.imageURL)
      });

    }

    reader.readAsDataURL(file)
  }


  // exportexcel() {
  //   this.excel_header = ["RCVDATE", "RCVNO", "INV_NO", "LICENSE_PER_INVOICE", "NAME_PRODUCT", "QTY", "NAME_PRODUCT_TH", "ชื่อผู้นำเข้า"];


  //   for (let i = 0; i < this.search_data.length; i++) {

  //     this.excel_array[i + 1] = [this.search_data[i].RCVDATE, this.search_data[i].RCVNO, this.search_data[i].INV_NO, this.search_data[i].INV_DATE, this.search_data[i].NEWCODE, this.search_data[i].FOOD_NAME, this.search_data[i].FRGN_NAME, this.search_data[i].COUNTRY, this.search_data[i].QTY, this.search_data[i].SIZE_UNIT, this.search_data[i].FDTYPE_NAME, this.search_data[i].IMPORT_NAME, this.search_data[i].CITIZEN_ID_AUTHORIZE, this.search_data[i].STATUS_ID, this.search_data[i].REMARK];

  //   }
  //   console.log(this.excel_array)

  //   var data = XLSX.utils.json_to_sheet(this.excel_array, { skipHeader: true })

  //   // A workbook is the name given to an Excel file
  //   var wb = XLSX.utils.book_new() // make Workbook of Excel

  //   // add Worksheet to Workbook
  //   // Workbook contains one or more worksheets
  //   XLSX.utils.book_append_sheet(wb, data, 'data')

  //   // export Excel file
  //   XLSX.writeFile(wb, 'data.xlsx') // name of the file is 'book.xlsx'

  // }


}
