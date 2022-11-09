import { Component, OnInit } from '@angular/core';
import { FormService } from '../../../../shared/services/form.service';
import { Subscription } from 'rxjs';
import { validate, clean, format } from 'rut.js';
import { Form } from '../../../../shared/model/form';
import { Session } from '../../../../shared/model/session';
import { ConstantService } from '../../../../shared/services/constant.service';
import { Group } from '../../../../shared/model/group';
import { Customer } from '../../../../shared/model/costumer';
import { Router } from '@angular/router';
import { UtilService } from '../../../../shared/services/util.service';
import { ReferersService } from '../../../../shared/services/referers.service';
import { Referer } from '../../../../shared/model/referer';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DialogRefererDetails } from '../referers.component';
import { ClipboardService } from 'ngx-clipboard';
import { Service } from '../../../../shared/model/service';
import { ServiceType } from '../../../../shared/model/service-type';
import { ServiceTypeService } from '../../../../shared/services/service-type.service';
import { UserService } from '../../../../shared/services/user.service';
import {ToastrService} from 'ngx-toastr';
import { CompaniesService } from 'src/app/shared/services/companies.service';

@Component({
    selector: 'app-default',
    templateUrl: './seller.component.html',
    styleUrls: ['./seller.component.scss'],
    providers: [ReferersService, ServiceTypeService, UserService],
})
export class SellerComponent implements OnInit{
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
        serviceType: '',
        service: '',
        status: 0,
        referent: '',
        date: ''
    };
    referers: Referer[] = [];
    searchInputControl: FormControl;
    filterForm: FormGroup;
    services: Service[];
    serviceTypes: ServiceType[];
    periods: String[];
    public perfil =  JSON.parse(localStorage.getItem('profile'));

    constructor(
        public toster: ToastrService,
        public formBuilder: FormBuilder,
        private srv: ReferersService,
        private srv2: ServiceTypeService,
        private router: Router,
        private utilSrv: UtilService,
        private userSrv: UserService,
        private clipboardApi: ClipboardService,
        private companiesSrv: CompaniesService
        // public dialog: DialogRefererDetails
    ) {
        this.screenType = this.utilSrv.getScreenSize();
    }
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
    ngOnInit(): void {
            this.profile = JSON.parse(localStorage.getItem('profile'));
            this.checkStatusUser();
            this.filterForm = this.formBuilder.group({
                rut: '',
                fullname: '',
                serviceType: '',
                service: '',
                status: 0,
                date: ''
            });

            this.parameters.date = (new Date()).toISOString().
            replace(/T/, ' ').      // replace T with a space
                replace(/\..+/, '');     // delete the dot and everything after
            this.getServiceTypes();
            this.getCount();
            this.getPeriods();
    }
    checkStatusUser() {
        this.subscription.add(
            this.companiesSrv.checkStatusUser(this.perfil.email).subscribe(
                (response) => {
                    if (response == 0) {
                        this.router.navigate(['/admin/companies']);
                    }
                }
            )
        );
    }

    private find() {
        this.subscription.add(
            this.srv.findWithParams(this.parameters, this.currentPage).subscribe(
                (response) => {
                    console.log(response);
                    this.referers = [];
                    for (let i = 0; i < response.length; i++) {
                        if (response[i].status == 0) { this.getService(response[i]); }
                    }
                },
                (error) => {
                    this.toster.error('Se ha producido un error al intentar conseguir los usuarios.');
                }
            )
        );
    }

    add() {
        this.router.navigate(['/admin/referers/add']);
    }

    edit(rut: string) {
        this.router.navigate(['/admin/users/user/edit/' + rut]);
    }

    gestionarVenta(id: string) {
        this.loading = true;
        this.subscription.add(
            this.srv.findById(id).subscribe(
                (response) => {
                    const referer = response;
                    console.log(referer);
                    if (referer.seller == '' && referer.status == 0) {
                        referer.seller = this.profile.rut;
                        referer.status = 1;
                        referer.step = 1;
                        this.actualizarEstadoVenta(referer);
                    }
                },
                (err) => {
                    this.toster.show('Se ha producido un error.');
                }
            )
        );
    }

    actualizarEstadoVenta(referer: Referer) {
        this.subscription.add(
            this.srv.update(referer.id, referer).subscribe(
                (response) => {
                    this.toster.show('Se ha asignado el referido a Mis Ventas.');
                    this.changeFilter();
                },
                (err) => {
                    this.toster.error('Se ha producido un error');
                }
            )
        );
    }

    remove(rut: string) {
        this.subscription.add(
            this.srv.remove(rut).subscribe(
                (response) => {
                    this.find();
                    this.toster.show('Se ha eliminado satisfactoriamente el referido.');
                },
                (err) => {
                    this.toster.error('Se ha producido un error');
                }
            )
        );
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
                        this.loading = false;
                        this.loadingSrv = false;
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
                this.toster.error('Se ha producido un error');
            }
        );
    }

    private getServiceTypes() {
        this.subscription.add(
            this.srv2.findAll().subscribe(
                (response) => {
                    console.log(response);
                    this.serviceTypes = response;
                },
                (error) => {
                    this.toster.error('Se ha producido un error al intentar guardar el servicio');
                }
            )
        );
    }


    changeFilter() {
        // this.loadingSrv = true;
        this.parameters.rut = clean(this.filterForm.controls.rut.value);
        this.parameters.fullname = this.filterForm.controls.fullname.value;
        this.parameters.serviceType = this.filterForm.controls.serviceType.value;
        this.parameters.service = this.filterForm.controls.service.value;
        this.parameters.status = this.filterForm.controls.status.value;
        this.parameters.date = this.filterForm.controls.date.value + '-01 00:00:00';
        this.getCount();
    }


    copyText(texto: string) {
        this.clipboardApi.copyFromContent(texto);
    }

   // verObservacion(referer: Referer, accion: number): void {
        /*
        const dialogRef = this.dialog.open(DialogRefererDetails, {
            data: {
                referer,
                accion,
            },
            autoFocus: false,
            maxHeight: '90vh',
        });
         */
  //  }

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
                    this.toster.error('Se ha producido un error al intentar guardar el servicio.');
                }
            )
        );
    }
}
