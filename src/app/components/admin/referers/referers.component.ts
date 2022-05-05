import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormService } from '../../../shared/services/form.service';
import { Subscription } from 'rxjs';
import { validate, clean, format } from 'rut.js';
import { Form } from '../../../shared/model/form';
import { Session } from '../../../shared/model/session';
import { ConstantService } from '../../../shared/services/constant.service';
import { Group } from '../../../shared/model/group';
import { Customer } from '../../../shared/model/costumer';
import { Router } from '@angular/router';
import { UtilService } from '../../../shared/services/util.service';
// import { ReferersService } from '../../../shared/services/referers.service';
import { Referer } from '../../../shared/model/referer';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ClipboardService } from 'ngx-clipboard';
import {
    MatDialog,
    MatDialogRef,
    MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { Service } from '../../../shared/model/service';
import { ServiceTypeService } from '../../../shared/services/service-type.service';
import { ServiceType } from '../../../shared/model/service-type';
import { UserService } from '../../../shared/services/user.service';
import { ToastrService } from 'ngx-toastr';
import {I18nService} from '../../../shared/services/i18n.service';

@Component({
    selector: 'app-default',
    templateUrl: './referers.component.html',
    styleUrls: ['./referers.component.scss'],
})
export class ReferersComponent implements OnInit, OnDestroy  {
    private subscription: Subscription = new Subscription();
    forms: Form[] = null;
    profile: Session;
    user: any;
    loading = true;
    loadingSrv = true;
    currentPage = 0;
    pageSize: number = ConstantService.paginationDesktop;
    advancedFilter = false;
    totalElements: number;
    customers: Customer[] = null;
    groups: Group[];
    score: any[] = null;
    hasScore = false;
    puntaje = 0;
    screenType = '';
    periodo = '';
    access = false;
    recentlySearch = false;
    parameters = {
        rut: '',
        fullname: '',
        service: '',
        serviceType: '',
        status: '',
        referent: '',
        date: ''
    };
    referers: Referer[] = null;
    services: Service[] = null;
    serviceTypes: ServiceType[] = null;
    searchInputControl: FormControl;
    filterForm: FormGroup;
    periods: String[];


    public perfil =  JSON.parse(localStorage.getItem('profile'));
    constructor(

    public formBuilder: FormBuilder,
   // private srv: ReferersService,
    private srv2: ServiceTypeService,
    private router: Router,
    private utilSrv: UtilService,
    private clipboardApi: ClipboardService,
    private userSrv: UserService,
    public _i18n: I18nService,
    public toster: ToastrService,
    public dialog: MatDialog
)
{console.log('1')}

ngOnInit(): void {
console.log('2')
        this.profile = JSON.parse(localStorage.getItem('profile'));
      /*  this.filterForm = this.formBuilder.group({
            rut: '',
            fullname: '',
            service: '',
            serviceType: '',
            status: '',
            date: ''
        });

       */
        this.parameters.referent = this.profile.rut;
        this.parameters.date = (new Date()).toISOString().
        replace(/T/, ' ').      // replace T with a space
            replace(/\..+/, '');     // delete the dot and everything after
 //       this.getCount();
 //       this.getPeriods();
    }

    private find() {
        /*
        this.subscription.add(
            this.srv.findWithParams(this.parameters, this.currentPage).subscribe(
                (response) => {
                    this.referers = response;
                },
                (error) => {

                    this.toster.error('Se ha producido un error al intentar conseguir los usuarios.');

                }
            )
        );

         */
    }
    private getPeriods() {
        /*
        this.subscription.add(
            this.srv.getPeriods().subscribe(
                (response) => {

                    this.periods = [];
                    for (let i = 0; i < response[0].periods.length; i++) {
                        if (response[0].periods[i].month < 10) {
                            this.periods.push(response[0].periods[i].year.toString() + '-0' + response[0].periods[i].month.toString());
                        } else {
                            this.periods.push(response[0].periods[i].year.toString() + '-' + response[0].periods[i].month.toString());
                        }
                    }

                },
                (error) => {
                    this.toster.error('Se ha producido un error al intentar guardar el servicio: ');
                }
            )
        );

         */
    }


    private findUser() {
        let profile = JSON.parse(localStorage.getItem('profile'));
        /*
        this.subscription.add(
            this.userSrv.findByRut(profile.rut).subscribe(
                (response) => {
                    this.user = response[0];
                    console.log(this.user);
                }
            )
        );

         */
    }


    private getCount() {
        /*
        this.subscription.add(
            this.srv.countWithParams(this.parameters).subscribe(
                (response) => {
                    this.totalElements = response;
                    this.find();
                    this.findUser();
                },
                (resultadoError) => {
                    this.toster.error(this._i18n.getKey(resultadoError.error.error.message));
                }
            )
        );

         */
    }
    ngOnDestroy() {
        if (this.subscription) this.subscription.unsubscribe();
    }
}
