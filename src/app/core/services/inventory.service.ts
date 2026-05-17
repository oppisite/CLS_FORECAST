import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ConsService } from './cons.service';
import Swal from 'sweetalert2';

export interface InventoryLoadOptions {
    listMasDrug: any[];
    listMasTypeDrug: any[];
}

export interface ProcessedInventoryResult {
    List_product: any[];
    List_product_detail: any[];
    List_Group_Drug_detail: any[];
    List_Group_Drug: any[];
    All_Approve: any[];
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
    private inventorySubject = new BehaviorSubject<ProcessedInventoryResult | null>(null);
    public inventory = this.inventorySubject.asObservable();

    constructor(private consService: ConsService) { }

    setInventory(inventory: ProcessedInventoryResult | null) {
        this.inventorySubject.next(inventory);
    }

    /**
     * โหลดข้อมูล inventory จาก API แล้วประมวลผล (processInventoryData) แล้ว return ข้อมูลกลับทาง stream
     * @param userData - ข้อมูลผู้ใช้สำหรับ AUTHEN_INFORMATION
     * @param options - listMasDrug, listMasTypeDrug สำหรับประมวลผล
     */
    loadData(userData: any, options: InventoryLoadOptions): void {
        const model = {
            AUTHEN_INFORMATION: userData
        };
        this.consService.GetService(model).subscribe({
            next: (response: any) => {
                if (response?.is_success === true && response != null) {
                    const processed = this.processInventoryData(
                        response,
                        options.listMasDrug,
                        options.listMasTypeDrug
                    );
                    this.inventorySubject.next(processed);
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'การดึงข้อมูลล้มเหลว',
                        text: response?.message || 'ไม่สามารถดึงข้อมูลได้'
                    });
                }
            },
            error: (err) => {
                Swal.fire({
                    icon: 'error',
                    title: 'การดึงข้อมูลล้มเหลว',
                    text: err?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ'
                });
            }
        });
    }

    /**
     * ประมวลผล response จาก API เป็น List_product, List_Group_Drug, All_Approve ฯลฯ
     */
    private processInventoryData(
        datas_inv: any,
        listMasDrug: any[],
        listMasTypeDrug: any[]
    ): ProcessedInventoryResult {
        const List_product: any[] = [];
        const List_product_detail: any[] = [];

        const list_inv = datas_inv.inventorys?.length ?? 0;
        for (let i = 0; i < list_inv; i++) {
            const inv = datas_inv.inventorys[i];
            const dm_detail = listMasDrug.filter(
                (g: any) => g.ProductCode?.toUpperCase() === inv.item_master_id?.toUpperCase()
            );
            if (dm_detail.length !== 0) {
                const d = dm_detail[0];
                List_product.push({
                    type: d.ProductTypeName,
                    ProductTypeCode: d.ProductTypeCode,
                    ProductTypeName: d.ProductTypeName,
                    NarcoticGroupName: d.NarcoticGroupName,
                    NarcoticGroupCode: d.NarcoticGroupCode,
                    LOT: inv.lot_number,
                    procure_date: inv.mfg_date,
                    exp_date: inv.exp_date,
                    capital_price: parseFloat(d.ProductPrice),
                    Receive_date: inv.receive_date,
                    ProductCode: d.ProductCode,
                    ProductTradeName: inv.description,
                    inspection_qty: parseFloat(inv.quantity_available),
                    total_price: parseFloat(d.ProductPrice) * parseFloat(inv.quantity_available),
                    ProductUnitName: inv.uom_prompt
                });
                List_product_detail.push({
                    type: d.ProductTypeName,
                    ProductTypeCode: d.ProductTypeCode,
                    ProductTypeName: d.ProductTypeName,
                    NarcoticGroupName: d.NarcoticGroupName,
                    NarcoticGroupCode: d.NarcoticGroupCode,
                    LOT: inv.lot_number,
                    procure_date: inv.mfg_date,
                    Receive_date: inv.receive_date,
                    exp_date: inv.exp_date,
                    capital_price: parseFloat(d.ProductPrice),
                    ProductCode: d.ProductCode,
                    ProductTradeName: inv.description,
                    ProductAmount: parseFloat(inv.quantity_available),
                    total_price: parseFloat(d.ProductPrice) * parseFloat(inv.quantity_available),
                    ProductUnitName: inv.uom_prompt
                });
            }
        }

        const List_Group_Drug_detail = this.groupDataByGroup_Detail_Stock(List_product_detail);
        const List_Group_Drug = this.groupDataStock(List_product);
        const All_Approve = this.groupDataByGroup_Import(List_Group_Drug, listMasTypeDrug);

        return {
            List_product,
            List_product_detail,
            List_Group_Drug_detail,
            List_Group_Drug,
            All_Approve
        };
    }

    private groupDataStock(data: any[]): any[] {
        const groupedData: Record<string, any> = {};
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
                    ...groupedData[type],
                    inspection_qty: groupedData[type].inspection_qty + item.inspection_qty,
                    total_price: groupedData[type].total_price + item.total_price
                };
            }
        });
        return Object.values(groupedData);
    }

    private groupDataByGroup_Detail_Stock(data: any[]): any[] {
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

        for (let i = 0; i < data.length; i++) {
            const head_g = data[i].ProductTypeName + '-' + data[i].NarcoticGroupCode;
            if (groupedData[head_g]) {
                const P_head = head_g + '-' + data[i].ProductCode;
                if (!groupedData_Detail[P_head]) {
                    groupedData_Detail[P_head] = { CODE: P_head };
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
        return Object.values(groupedData);
    }

    private groupDataByGroup_Import(data: any[], list_type: any[]): any[] {
        const groupedData: { [key: string]: any } = {};

        data.forEach(item => {
            const type = item.ProductTypeName;
            const obj_type = list_type.filter((i: any) => i.Type_Drug_Code === item.ProductTypeCode);
            const color = obj_type[0]?.COLOR || '';
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

        for (let i = 0; i < data.length; i++) {
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
        return Object.values(groupedData);
    }
}
