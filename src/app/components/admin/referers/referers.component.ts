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
 import { ReferersService } from '../../../shared/services/referers.service';
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
    private srv: ReferersService,
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
        
        
        this.filterForm = this.formBuilder.group({
            rut: '',
            fullname: '',
            service: '',
            serviceType: '',
            status: '',
            date: ''
        });

       
        this.parameters.referent = this.profile.rut;
        this.parameters.date = (new Date()).toISOString().
        replace(/T/, ' ').      // replace T with a space
            replace(/\..+/, '');     // delete the dot and everything after
        this.getCount();
        this.getPeriods();
    }

    private find() {
        
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

         
    }
    changeFilter() {
        this.parameters.rut = clean(this.filterForm.controls.rut.value);
        this.parameters.fullname = this.filterForm.controls.fullname.value;
        this.parameters.service = this.filterForm.controls.service.value;
        this.parameters.serviceType = this.filterForm.controls.serviceType.value;
        this.parameters.status = this.filterForm.controls.status.value;
        this.parameters.date = this.filterForm.controls.date.value + "-01 00:00:00";
        this.getCount();
    }
    private getPeriods() {
        
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

         
    }


    private findUser() {
        let profile = JSON.parse(localStorage.getItem('profile'));
        
        this.subscription.add(
            this.userSrv.findByRut(profile.rut).subscribe(
                (response) => {
                    this.user = response[0];
                    console.log(this.user);
                }
            )
        );

    }


    private getCount() {
        
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
    }



    verObservacion(referer: Referer, accion: number): void {
        /*
        const dialogRef = this.dialog.open(DialogRefererDetails, {
            data: {
                referer: referer,
                accion: accion,
            },
            autoFocus: false,
            maxHeight: "90vh",
        });

         */
    }
    ngOnDestroy() {
        if (this.subscription) this.subscription.unsubscribe();
    }
}
/*
    @Component({
        selector: "referers-seller-sells-information",
        templateUrl: "./referers-detail/referers-info-details.component.html",
        styleUrls: ["./referers-detail/referers-info-details.component.scss"],
        providers: [ReferersService, ServiceTypeService]
    })


    export class DialogRefererDetails {
    private subscription: Subscription = new Subscription();
    services: Service[] = null;
    serviceTypes: ServiceType[] = null;
    refererFinal: Referer;
    public toster: ToastrService;
        constructor(
        public dialogRef: MatDialogRef<DialogRefererDetails>,
        @Inject(MAT_DIALOG_DATA) public data: { referer: Referer; accion: number},
        private srv: ReferersService,
        private srv2: ServiceTypeService,
        //private snack: MatSnackBar,
    ) {
        this.refererFinal = this.data.referer;
        this.getServiceTypes();
        this.cargarServicios(this.data.referer.serviceType);
    }
    private getServiceTypes() {
        this.subscription.add(
            this.srv2.findAll().subscribe(
                (response) => {
                    this.serviceTypes = response;
                }
            )
        );
    }

    public cargarServicios(serviceType: string) {
        this.subscription.add(
            this.srv.findServices(serviceType).subscribe(
                (response) => {
                    this.services = response;
                }
            )
        );
}
    public actualizarServicios(serviceType: string) {
        this.subscription.add(
            this.srv.findServices(serviceType).subscribe(
                (response) => {
                    this.refererFinal.serviceType = serviceType;
                    this.refererFinal.service = null;
                    this.services = response;
                }
            )
        );
    }

    public seleccionarServicio(service:string) {
        this.srv.findServiceById(service).subscribe(
            (response) => {
                if (response.length != 0) {
                    this.refererFinal.service = response[0].id;
                    this.refererFinal.serviceName = response[0].serviceName;
                    this.refererFinal.profit = response[0].profit;
                }
            }
        )
    }

    public confirmarServicio() {
        if(this.refererFinal.service != null && this.refererFinal.serviceType != null && this.refererFinal.cantidadServicios != null) {
            this.refererFinal.profitOriginal = this.refererFinal.profit;
            this.refererFinal.profit = this.refererFinal.profit * this.refererFinal.cantidadServicios;
            this.confirmarActualizacionEstadoVenta(this.refererFinal);
        }
    }

    public seleccionarCantidadVendidos($event:any){
        let regex: RegExp = new RegExp(/^[0-9]{1,}$/g);
        let specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', 'ArrowRight','ArrowLeft','backspace'];//enter code here
        if (specialKeys.indexOf($event.key) !== -1) {
            this.refererFinal.cantidadServicios = parseInt($event.target.value);
            return true;
        } else {
            if (regex.test($event.key)) {
                this.refererFinal.cantidadServicios = parseInt($event.target.value);
                return true;
            } else {
                return false;
            }
        }
    }

    confirmarActualizacionEstadoVenta(referer: Referer) {
        this.subscription.add(
            this.srv.update(referer.id, referer).subscribe(
                (response) => {
                    this.toster.error('Se ha actualizado el estado de la venta.');
                    this.onCloseClick();
                }
            )
        );
    }

    onCloseClick(): void {
        this.dialogRef.close();
    }

}
*/
