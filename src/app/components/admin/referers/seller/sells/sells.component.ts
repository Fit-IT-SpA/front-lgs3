import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { validate, clean, format } from 'rut.js';
import { Form } from '../../../../../shared/model/form';
import { Session } from '../../../../../shared/model/session';
import { ConstantService } from '../../../../../shared/services/constant.service';
import { Group } from '../../../../../shared/model/group';
import { Customer } from '../../../../../shared/model/costumer';
import { Router } from '@angular/router';
import { UtilService } from '../../../../../shared/services/util.service';
import { ReferersService } from '../../../../../shared/services/referers.service';
import { Referer } from '../../../../../shared/model/referer';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ClipboardService } from 'ngx-clipboard';
import { MatDialog } from '@angular/material/dialog';
import { DialogRefererDetails } from '../../referers.component';
import { Service } from '../../../../../shared/model/service';
import { ServiceTypeService } from '../../../../../shared/services/service-type.service';
import { ServiceType } from '../../../../../shared/model/service-type';
import { UserService } from '../../../../../shared/services/user.service';
import {ToastrService} from 'ngx-toastr';


@Component({
    selector: 'app-default',
    templateUrl: './sells.component.html',
    styleUrls: ['./sells.component.scss'],
})
export class ReferersSellersSellsComponent implements OnInit, OnDestroy {
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
    access = false;
    recentlySearch = false;
    parameters = {
        rut: '',
        fullname: '',
        serviceType: '',
        service: '',
        status: '',
        seller: JSON.parse(localStorage.getItem('profile')).rut,
        date: ''
    };
    referers: Referer[] = [];
    searchInputControl: FormControl;
    filterForm: FormGroup;
    ingresado = true;
    editable = true;
    services: Service[] = null;
    serviceTypes: ServiceType[];
    periods: String[];

    constructor(
        public formBuilder: FormBuilder,
        private srv: ReferersService,
        private srv2: ServiceTypeService,
        private router: Router,
        private utilSrv: UtilService,
        private userSrv: UserService,
        private clipboardApi: ClipboardService,
        public dialog: MatDialog,
        public toster: ToastrService

) {
        this.screenType = this.utilSrv.getScreenSize();
    }
    /*
    private haveAccess() {
        const permissions = JSON.parse(localStorage.getItem('profile')).privilege;
        const access = permissions.filter((perm: string) => {
            return perm === ConstantService.PERM_GESTION_VENTAS_LECTURA;
        });
        return access.length > 0;
    }

    canWrite() {
        const permissions = JSON.parse(localStorage.getItem('profile')).privilege;
        const access = permissions.filter((perm: string) => {
            return perm === ConstantService.PERM_GESTION_VENTAS_ESCRITURA;
        });
        return access.length > 0;
    }
     */
    ngOnInit(): void {
        this.profile = JSON.parse(localStorage.getItem('profile'));
        this.filterForm = this.formBuilder.group({
            rut: '',
            fullname: '',
            serviceType: '',
            service: '',
            status: '',
            date: ''
        });
        this.parameters.date = (new Date()).toISOString().
        replace(/T/, ' ').      // replace T with a space
            replace(/\..+/, '');     // delete the dot and everything after
        this.getServiceTypes();
        this.getCount();
        this.getPeriods();
    }

    toPeriod(date: string) {
        return date.substring(0, 7);
    }

    copyText(texto: string) {
        this.clipboardApi.copyFromContent(texto);
    }

    private find() {
        this.subscription.add(
            this.srv.findWithParams(this.parameters, this.currentPage).subscribe(
                (response) => {
                    this.referers = [];
                    for (let i = 0; i < response.length; i++) {
                        if (response[i].status != 0) { this.getService(response[i]); }
                    }

                    this.loading = false;
                    this.loadingSrv = false;
                },
                (error) => {
                    this.loading = false;
                    this.loadingSrv = false;
                    this.toster.error('Se ha producido un error al intentar conseguir los usuarios.');
                }
            )
        );
    }

    add() {
        this.router.navigate(['/admin/referers/add']);
    }

    edit(id: string) {
        this.router.navigate(['/admin/referers/edit/' + id]);
    }

    private findUser() {
        const profile = JSON.parse(localStorage.getItem('profile'));
        this.subscription.add(
            this.userSrv.findByRut(profile.rut).subscribe(
                (response) => {
                    this.user = response[0];
                    // console.log(this.user);
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
                (error) => {
                    this.toster.error('Se ha producido un error al intentar conseguir los usuarios.');
                }
            )
        );
    }

    private getService(referer: Referer) {
        this.srv.findServiceById(referer.service).subscribe(
            (response) => {
                if (response.length != 0) {
                    referer.serviceName = response[0].serviceName;
                    this.referers.push(referer);
                } else {
                    referer.serviceName = 'Sin Servicio';
                    this.referers.push(referer);
                }
            },
            (err) => {
                this.toster.error('Sin servicio');
            }
        );
    }

    onPageFired(event: any) {
        this.currentPage = event.pageIndex;
        this.pageSize = event.pageSize;
        this.getCount();
    }

    formatRut(rut: string) {
        return format(rut);
    }

    onFocusRut() {
        this.filterForm.controls.rut.markAsPristine();
        if (this.filterForm.controls.rut.value != '') {
            this.filterForm.controls.rut.setValue(
                clean(this.filterForm.controls.rut.value)
            );
        }
    }

    onBlurRut() {
        if (this.filterForm.controls.rut.value != '') {
            if (
                (this.filterForm.controls.rut.value.length > 7 &&
                    validate(this.filterForm.controls.rut.value)) ||
                this.filterForm.controls.rut.value.length == 8
            ) {
                this.filterForm.controls.rut.setErrors(null);
            } else {
                this.filterForm.controls.rut.setErrors({ incorrect: true });
            }
            this.filterForm.controls.rut.markAsDirty();
        } else if (this.recentlySearch) {
            this.parameters.rut = '';
            this.getCount();
        }
    }

    changeFilter() {
        this.parameters.rut = clean(this.filterForm.controls.rut.value);
        this.parameters.fullname = this.filterForm.controls.fullname.value;
        this.parameters.serviceType = this.filterForm.controls.serviceType.value;
        this.parameters.service = this.filterForm.controls.service.value;
        this.parameters.status = this.filterForm.controls.status.value;
        this.parameters.date = this.filterForm.controls.date.value + '-01 00:00:00';
        this.getCount();
    }

    public actualizarServicios(serviceType: string) {
        if (serviceType != '') {
            this.subscription.add(
                this.srv.findServices(serviceType).subscribe(
                    (response) => {
                        this.services = response;
                        this.filterForm.patchValue({
                            service: '',
                        });
                        this.changeFilter();
                    },
                    (error) => {
                        this.toster.error('Se ha producido un error al intentar conseguir los servicios.');
                    }
                )
            );
        } else {
            this.services = [];
            this.filterForm.patchValue({
                service: '',
            });
            this.changeFilter();
        }
    }

    actualizarEstadoVenta(referer: Referer, step: number) {
        if (confirm('¿Está seguro de actualizar el estado?')) {
            referer.step = step;
            referer.updatedAt = new Date();
            switch (true) {
                case step < 0:
                    referer.status = -1;
                    break;
                case step == 0:
                    referer.status = 0;
                    break;
                case step > 0 && step < 4:
                    referer.status = 1;
                    if (step == 2) {
                        this.verObservacion(referer, 3, step);
                    }
                    break;
                case step == 4:
                    referer.status = 2;
                    break;
            }

            if (step < 0) {
                this.verObservacion(referer, 2, step);
            } else {
                this.confirmarActualizacionEstadoVenta(referer, referer.information);
            }
        }
    }

    confirmarActualizacionEstadoVenta(referer: Referer, information: string) {
        referer.information = information;
        this.subscription.add(
            this.srv.update(referer.id, referer).subscribe(
                (response) => {
                    this.toster.show('Se ha actualizado el estado de la venta.');
                    this.getCount;
                },
                (err) => {
                    this.toster.error('Sin servicio');
                }
            )
        );
    }

    ngOnDestroy() {
        if (this.subscription) { this.subscription.unsubscribe(); }
    }

    verObservacion(referer: Referer, accion: number, step: number): void {
        if (referer.status < 0 && accion == 2) {
            switch (step) {
                case -1:
                    referer.information = 'Referido No Interesado';
                    break;
                case -3:
                    referer.information = 'Instalación/Entrega Infactible';
                    break;
                case -4:
                    referer.information = 'Venta objetada por proveedor';
                    break;
            }
        }
        const dialogRef = this.dialog.open(DialogRefererDetails, {
            data: {
                referer,
                accion
            },
            autoFocus: false,
            maxHeight: '90vh',
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result != undefined) {
                this.actualizarObservacion(referer, result);
            } else if (accion == 2) {
                this.changeFilter();
            }
        });
    }

    actualizarObservacion(referer: Referer, observacion: string): void {
        referer.information = observacion;
        referer.updatedAt = new Date();
        this.subscription.add(
            this.srv.update(referer.id, referer).subscribe(
                (response) => {
                    this.toster.show('Venta Rechazada');
                    this.getCount;
                },
                (err) => {
                    this.toster.error('Sin servicio');
                }
            )
        );
    }

    private getServiceTypes() {
        this.subscription.add(
            this.srv2.findAll().subscribe(
                (response) => {
                    this.serviceTypes = response;
                },
                (error) => {
                    this.toster.error('Se ha producido un error al intentar guardar el servicio');
                }
            )
        );
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
                    this.toster.error('Se ha producido un error al intentar guardar el servicio');
                }
            )
        );
    }

}
