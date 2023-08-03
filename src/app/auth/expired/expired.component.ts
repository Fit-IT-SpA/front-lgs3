import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { interval, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-expired',
  templateUrl: './expired.component.html',
  styleUrls: ['./expired.component.scss'],
  encapsulation: ViewEncapsulation.None

})
export class ExpiredComponent implements OnInit {
  cardStyle: string;
  loadingSrv : Boolean = false;
  countdown: number;
  countdownMapping: any;
  private _unsubscribeAll: Subject<any>;
  constructor(
    private _router: Router
    ) {
      this._unsubscribeAll = new Subject();
      this.countdown = 3;
      this.countdownMapping = {
          '=1'   : '# segundo',
          'other': '# segundos'
      };
    }

  ngOnInit(): void {
    this._setCardStyle();
     // Get the duration
     const duration = this.countdown;

     // Redirect after the countdown
     interval(1000)
         .pipe(
             take(duration),
             takeUntil(this._unsubscribeAll)
         )
         .subscribe(() => {
                 this.countdown--;
             },
             () => {
             },
             () => {
                 this._router.navigate(['auth/login']);
             }
         );
  }

  private _setCardStyle(): void
  {
      this.cardStyle = "fullscreen-alt";
  }

}
