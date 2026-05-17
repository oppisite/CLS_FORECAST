import { Injectable } from '@angular/core';
import { getFirebaseBackend } from '../../authUtils';
import { User } from 'src/app/store/Authentication/auth.models';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, finalize } from 'rxjs/operators';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { GlobalComponent } from "../../global-component";
import { Store } from '@ngrx/store';
import { environment } from 'src/environments/environment';
import { LoadingService } from './loading.service';

const CON_API = environment.CON_API;

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  

@Injectable({ providedIn: 'root' })

export class ConsService {

    user!: User;
    currentUserValue: any;

    private currentUserSubject: BehaviorSubject<User>;
    // public currentUser: Observable<User>;
    constructor(
        private http: HttpClient, 
        private store: Store,
        private loadingService: LoadingService
    ) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(sessionStorage.getItem('currentUser')!));
        // this.currentUser = this.currentUserSubject.asObservable();
     }

     GatewayGetData(model: any) {
        this.loadingService.show('กำลังดึงข้อมูล...');
        
        return this.http.post(CON_API + 'GATE_WAY/GATEWAY_EXCHANGE', {
            MODEL: JSON.stringify(model)
          }).pipe(
            map((response: any) => {
                return response;
            }),
            catchError((error: any) => {
                const errorMessage = error; // Customize the error message as needed
                return throwError(errorMessage);
            }),
            finalize(() => {
                this.loadingService.hide();
            })
        );
     }

     GetService(model: any) {
        this.loadingService.show('กำลังดึงข้อมูล...');
        
        return this.http.post(CON_API + 'DataCenter/Call_Smart_Inven', {
            MODEL: JSON.stringify(model)
          }).pipe(
            map((response: any) => {
                return response;
            }),
            catchError((error: any) => {
                const errorMessage = error; // Customize the error message as needed
                return throwError(errorMessage);
            }),
            finalize(() => {
                this.loadingService.hide();
            })
        );
     }

     UploadData(model: FormData) {
        this.loadingService.show('กำลังอัปโหลดข้อมูล...');
        
        return this.http.post(CON_API + 'GATE_WAY/ProcessRequest', model).pipe(
            map((response: any) => {
                return response;
            }),
            catchError((error: any) => {
                const errorMessage = error; // Customize the error message as needed
                return throwError(errorMessage);
            }),
            finalize(() => {
                this.loadingService.hide();
            })
        );
     }

     GetSetFullModel(){
        this.loadingService.show('กำลังโหลดข้อมูลโมเดล...');
        
        return this.http.get(CON_API + 'GET_DATA/SET_FULL_MODEL').pipe(
            map((response: any) => {
                return response;
            }),
            catchError((error: any) => {
                const errorMessage = error; // Customize the error message as needed
                return throwError(errorMessage);
            }),
            finalize(() => {
                this.loadingService.hide();
            })
        );
     }

     SendEmail(model: any) {
        return this.http.post(environment.SEND_EMAIL, {
            MODEL: JSON.stringify(model)
        }).pipe(
            map((response: any) => {
                return response;
            }),
            catchError((error: any) => {
                const errorMessage = error; // Customize the error message as needed
                return throwError(errorMessage);
            }),
        );
      }


}