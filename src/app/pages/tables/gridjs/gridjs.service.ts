/* eslint-disable @typescript-eslint/adjacent-overload-signatures */
import { Injectable, PipeTransform } from '@angular/core';

import { BehaviorSubject, Observable, of, Subject } from 'rxjs';

import { GridJsModel } from './gridjs.model';
import { GridJs } from 'src/app/core/data';
import { DecimalPipe } from '@angular/common';
import { debounceTime, delay, switchMap, tap } from 'rxjs/operators';


interface SearchResult {
  countries: GridJsModel[];
  total: number;
}

interface State {
  page: number;
  pageSize: number;
  searchTerm: string;
  startIndex: number;
  endIndex: number;
  totalRecords: number;
}

const compare = (v1: string | number, v2: string | number) => v1 < v2 ? -1 : v1 > v2 ? 1 : 0;



function matches(country: GridJsModel, term: string, pipe: PipeTransform) {
  return country.id.toLowerCase().includes(term.toLowerCase())
    || country.name.toLowerCase().includes(term.toLowerCase())
    || country.email.toLowerCase().includes(term.toLowerCase())
    || country.position.toLowerCase().includes(term.toLowerCase())
    || country.company.toLowerCase().includes(term.toLowerCase())
    || country.country.toLowerCase().includes(term.toLowerCase())
    ;

}

@Injectable({ providedIn: 'root' })
export class GridJsService {
  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  private _countries$ = new BehaviorSubject<any[]>([]);
  private _total$ = new BehaviorSubject<number>(0);
  private _data$ = new BehaviorSubject<any[]>([]);
  private _originalData: any[] = [];

  // เพิ่มตัวแปรที่ขาดหายไป
  private _sortColumn: string = '';
  private _sortDirection: 'asc' | 'desc' = 'asc';

  // เพิ่มใน GridJsService
  private _sortedData$ = new BehaviorSubject<any[]>([]);
  public sortedData$ = this._sortedData$.asObservable();
  // เพิ่มตัวแปรใหม่
  private _sortedOriginalData: any[] = [];
  // สร้าง Observable ที่เปิดเผยออกไปภายนอก (เพื่อป้องกันการเรียกใช้ .next() จากภายนอก)
  // public _countries$ = this._data$.asObservable();

  private _state: State = {
    page: 1,
    pageSize: 10,
    searchTerm: '',
    startIndex: 0,
    endIndex: 9,
    totalRecords: 0
  };

  constructor(private pipe: DecimalPipe) {
    this._search$.pipe(
      tap(() => this._loading$.next(true)),
      debounceTime(200),
      switchMap(() => this._search()),
      delay(200),
      tap(() => this._loading$.next(false))
    ).subscribe(result => {
      this._countries$.next(result.countries);
      this._total$.next(result.total);
    });

    this._search$.next();
  }
  // เพิ่ม getter/setter เพื่อให้เข้าถึง _sortColumn จากภายนอก
  get sortColumn(): string {
    return this._sortColumn;
  }

  
  // แก้ไขฟังก์ชัน getSortData
  getSortData(column: string) {
    // คัดลอกข้อมูลเพื่อไม่ให้กระทบข้อมูลต้นฉบับ
    let data = [...this._originalData];

    // เก็บคอลัมน์และทิศทางการเรียง
    if (this._sortColumn === column) {
      this._sortDirection = this._sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this._sortColumn = column;
      this._sortDirection = 'asc';
    }

    // เรียงลำดับข้อมูล
    data.sort((a, b) => {
      const valueA = a[column] != null ? a[column].toString().toLowerCase() : '';
      const valueB = b[column] != null ? b[column].toString().toLowerCase() : '';

      // ถ้าเป็นตัวเลข
      if (!isNaN(Number(valueA)) && !isNaN(Number(valueB))) {
        return this._sortDirection === 'asc'
          ? Number(valueA) - Number(valueB)
          : Number(valueB) - Number(valueA);
      }

      // ถ้าเป็นข้อความ
      return this._sortDirection === 'asc'
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    });

    // อย่าอัพเดต _originalData ที่นี่!!
    // this._originalData = [...data]; ← ลบบรรทัดนี้

    // อัพเดทข้อมูลใน service
    this._sortedData$.next(data);

    // นำข้อมูลที่เรียงแล้วมาค้นหาและแบ่งหน้าอีกครั้ง
    this._sortedOriginalData = [...data]; // เก็บข้อมูลที่เรียงแล้วไว้
    this._search$.next(); // ให้ _search ทำงานอีกครั้ง
  }
  setGridData(data: any[]): void {
    this._originalData = [...data]; // เก็บข้อมูลต้นฉบับ

    // ถ้ามีการเรียงลำดับอยู่แล้ว ให้เรียงลำดับข้อมูลใหม่ด้วย
    if (this._sortColumn) {
      // เรียงลำดับข้อมูลใหม่
      let sortedData = [...data];
      sortedData.sort((a, b) => {
        const column = this._sortColumn;
        const valueA = a[column] != null ? a[column].toString().toLowerCase() : '';
        const valueB = b[column] != null ? b[column].toString().toLowerCase() : '';

        // ถ้าเป็นตัวเลข
        if (!isNaN(Number(valueA)) && !isNaN(Number(valueB))) {
          return this._sortDirection === 'asc'
            ? Number(valueA) - Number(valueB)
            : Number(valueB) - Number(valueA);
        }

        // ถ้าเป็นข้อความ
        return this._sortDirection === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      });

      this._sortedOriginalData = sortedData;
      this._search$.next(); // อัพเดทการค้นหาและแบ่งหน้า
    } else {
      this._sortedOriginalData = []; // ล้างข้อมูลที่เรียงลำดับไว้
      this._countries$.next(data); // อัพเดทข้อมูลโดยตรง
      this._sortedData$.next(data); // อัพเดทข้อมูลที่เรียงลำดับ
      this._total$.next(data.length); // อัพเดทจำนวนรวม
      this._search$.next();
    }
  }

  get countries$() { return this._countries$.asObservable(); }
  get total$() { return this._total$.asObservable(); }
  get loading$() { return this._loading$.asObservable(); }
  get page() { return this._state.page; }
  get pageSize() { return this._state.pageSize; }
  get searchTerm() { return this._state.searchTerm; }
  get startIndex() { return this._state.startIndex; }
  get endIndex() { return this._state.endIndex; }
  get totalRecords() { return this._state.totalRecords; }

  set page(page: number) { this._set({ page }); }
  set pageSize(pageSize: number) { this._set({ pageSize }); }
  set searchTerm(searchTerm: string) { this._set({ searchTerm }); }
  set startIndex(startIndex: number) { this._set({ startIndex }); }
  set endIndex(endIndex: number) { this._set({ endIndex }); }
  set totalRecords(totalRecords: number) { this._set({ totalRecords }); }

  private _set(patch: Partial<State>) {
    Object.assign(this._state, patch);
    this._search$.next();
  }

  // แก้ไขฟังก์ชัน _search เพื่อใช้ _originalData แทน GridJs
  private _search(): Observable<SearchResult> {
    const { pageSize, page, searchTerm } = this._state;

    // ใช้ข้อมูลที่เรียงลำดับแล้วถ้ามี
    let countries = this._sortedOriginalData.length > 0 && this._sortColumn
      ? [...this._sortedOriginalData]
      : [...this._originalData];

    // กรองข้อมูลตามคำค้นหา
    countries = countries.filter(country => {
      if (!searchTerm) return true;

      return Object.keys(country).some(key => {
        if (country[key] == null) return false;
        return country[key].toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
    });

    const total = countries.length;

    // แบ่งหน้า
    this.totalRecords = countries.length;
    this._state.startIndex = (page - 1) * this.pageSize + 1;
    this._state.endIndex = (page - 1) * this.pageSize + this.pageSize;
    if (this.endIndex > this.totalRecords) {
      this.endIndex = this.totalRecords;
    }
    countries = countries.slice(this._state.startIndex - 1, this._state.endIndex);
    return of({ countries, total });
  }
}
