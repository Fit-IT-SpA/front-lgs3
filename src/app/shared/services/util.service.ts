
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn : 'root'})
export class UtilService
{
    private size : string;
    private screenType = new Subject<any>();
    screenType$ = this.screenType.asObservable();
    private progressBar = new Subject<Boolean>();
    progressBar$ = this.progressBar.asObservable();

    public showProgressBar(visible: Boolean){
        this.progressBar.next(visible)
    }

    public setScreenType(screen: string){
        this.setScreenSize(screen);
        this.screenType.next(screen);
    }

    private setScreenSize(screen: string){
        this.size = screen;
    }

    getScreenSize(){
        return this.size;
    }

    formatDate(date : string){
        if (date !== null){
            let aar = date.split('T');
            let ar = aar[0].split('-');
            let time = aar[1].substring(0, 5);
            return ar[2] + "-" + ar[1] + "-" + ar[0] + " " + time;
        }
        return "";
    }

    checkIlegallCharacter(title: string){
        var format = /[`!@#$%^&*()_+\-=\[\]{};':"\\|<>\/?~]/;
        return format.test(title);
    }
}
