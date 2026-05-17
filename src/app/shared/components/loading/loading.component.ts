import { Component, OnInit } from '@angular/core';
import { LoadingService } from '../../../core/services/loading.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit {
  loading$: Observable<boolean>;
  loadingMessage$: Observable<string>;

  constructor(private loadingService: LoadingService) {
    this.loading$ = this.loadingService.loading$;
    this.loadingMessage$ = this.loadingService.loadingMessage$;
  }

  ngOnInit(): void {
  }
}


