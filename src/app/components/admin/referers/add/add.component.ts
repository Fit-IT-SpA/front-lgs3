import { Component,  OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UtilService } from '../../../../shared/services/util.service';
import { I18nService } from '../../../../shared/services/i18n.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { validate, clean, format } from 'rut.js';
import { ReferersService } from '../../../../shared/services/referers.service';
import { User } from '../../../../shared/model/user';
import { CountryService } from '../../../../shared/services/country.service'; // no estaba antes
// import { RoleService } from '../../../../shared/services/role.service'; // no estaba antes y no creo que se tenga que usar
import {
    emailValidator,
    justLetterValidatorLastAndFirstName,
    selectAnOptionValidator,
    mobileValidator,
    justComplexLettersValidator,
    numberValidator,
} from '../../../../shared/validators/form-validators'; // no estaba antes
import { MatStepper } from '@angular/material/stepper';
/*
import {
    MomentDateAdapter,
    MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from  '@angular/material-moment-adapter'; // no estaba antes y creo que es de treo

 */
import {
    DateAdapter,
    MAT_DATE_FORMATS,
    MAT_DATE_LOCALE,
} from '@angular/material/core';
// import 'moment/locale/es'; // no estaba antes y no se que es
import { ConstantService } from '../../../../shared/services/constant.service';
import { Promotions } from '../../../../shared/model/promotions'; // no estaba antes
// import { exit } from 'process'; // nofunciona
import { Service } from '../../../../shared/model/service';
import { ServiceType } from '../../../../shared/model/service-type';
import { ServicesService } from '../../../../shared/services/services.service'; // no estaba antes
import { ServiceTypeService } from '../../../../shared/services/service-type.service';
import { ToastrService } from 'ngx-toastr';


export const MY_FORMATS = {
    display: {
        dateInput: ConstantService.simpleDate,
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
    },
};

@Component({
    selector: 'app-default',
    templateUrl: './add.component.html',
    styleUrls: ['./add.component.scss'],
    providers: [
        ReferersService,
        ServicesService,
        ServiceTypeService,
        /*
        { provide: MAT_DATE_LOCALE, useValue: 'es-CL' },
        {
            provide: DateAdapter,
            useClass: MomentDateAdapter,
            deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
        },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
         */
    ],
})
export class AddComponent implements OnInit {
    private subscription: Subscription = new Subscription();
    screenType: string;
    formAdd: FormGroup;
    originalUser: any;
    updateUser: any;
    user: User = null;
    userAdd: User = null;
    // loading: boolean = true;
    // loadingSrv: boolean = false;
    // access: boolean = false;
    promotions: Promotions[];
    services: Service[];
    servicesTypes: ServiceType[];
    serviceName: string = null;

    // @ViewChild("stepper") private myStepper: MatStepper;

    constructor(
        private utilSrv: UtilService,
        private router: Router,
        public i18n: I18nService,
        private srv: ReferersService,
        private srv2: ServiceTypeService,
        private srv3: ServicesService,
        public toster: ToastrService,
        public formBuilder: FormBuilder,
        // private _adapter: DateAdapter<any>
    ) {
        // this.splash.hide();
       // this._adapter.setLocale('es');
      //  const now = new Date();
    }
    /*
    private haveAccess() { // probablemente quitar
        let permissions = JSON.parse(localStorage.getItem("profile")).privilege;
        let access = permissions.filter((perm: string) => {
            return perm === ConstantService.PERM_REFERIDOS_ESCRITURA;
        });
        return access.length > 0;
    }

    */
    ngOnInit(): void {
    /*
        let access = this.haveAccess();
        if (!access) {
            this.router.navigate(["/admin/unauthorized"]);
        } else {
            this.access = access;
            this.initForms();
            this.subscription.add(
                this.utilSrv.screenType$.subscribe((screen) => {
                    this.screenType = screen;
                })
            );
         */
            this.initForms();
            this.getServicesTypes();
    }
    initForms() {
        this.formAdd = this.formBuilder.group({
            rut: ['', [Validators.required]],
            name: [
                '',
                [
                    Validators.required,
                    Validators.minLength(3),
                    Validators.maxLength(40),
                    justComplexLettersValidator,
                ],
            ],
            lastName: [
                '',
                [
                    Validators.required,
                    Validators.minLength(3),
                    Validators.maxLength(40),
                    justComplexLettersValidator,
                ],
            ],
            secondLastName: [
                '',
                [
                    Validators.required,
                    Validators.minLength(3),
                    Validators.maxLength(40),
                    justComplexLettersValidator,
                ],
            ],
            email: [
                '',
                [
                    Validators.required,
                    Validators.minLength(10),
                    Validators.maxLength(40),
                    emailValidator,
                ],
            ],
            phone: [
                '',
                [
                    Validators.required,
                    Validators.minLength(9),
                    Validators.maxLength(9),
                    mobileValidator,
                    numberValidator,
                ],
            ],
            serviceType: ['', [Validators.required]],
            service: ['', [Validators.minLength(1), Validators.required]],
            promotion: ['', [Validators.minLength(1)]],
            information: ['', [Validators.maxLength(300)]],
        });

        // this.loading = false;
    }
    public getServicesTypes() {
        this.subscription.add(
            this.srv2.findAll().subscribe(
                (response) => {
                    console.log(response);
                    this.servicesTypes = response;
                },
                (error) => {
                    this.toster.error('Se ha producido un error al intentar conseguir los servicios.');
                }
            )
        );
    }

    public actualizarServicios(id: string) {
        console.log('AAAAAAAAAA');
        this.subscription.add(
            this.srv3.findByServiceType(id).subscribe(
                (response) => {
                    console.log(response);
                    this.services = response;
                },
                (error) => {
                    this.toster.error('Se ha producido un error al intentar conseguir los servicios.');
                }
            )
        );
    }

    onFocusRut() {
        this.formAdd.controls.rut.markAsPristine();
        if (this.formAdd.controls.rut.value != '') {
            this.formAdd.controls.rut.setValue(
                clean(this.formAdd.controls.rut.value)
            );
        }
    }

    onBlurRut() {
        if (this.formAdd.controls.rut.value != '') {
            if (
                this.formAdd.controls.rut.value.length > 3 &&
                validate(this.formAdd.controls.rut.value)
            ) {
                this.formAdd.controls.rut.setErrors(null);
                this.formAdd.controls.rut.setValue(
                    format(this.formAdd.controls.rut.value)
                );
            } else {
                this.formAdd.controls.rut.setErrors({ incorrect: true });
            }
            this.formAdd.controls.rut.markAsDirty();
        }
    }

    private save() {
        this.subscription.add(
            this.srv.add(this.createReferer()).subscribe(
                (response) => {
                    this.userAdd = response;
                    this.toster.show('Se ha agregado satisfactoriamente el referido.');
                    this.goBack();
                },
                (error) => {
                    this.toster.error('Se ha producido un error al intentar guardar el referido.');
                }
            )
        );
    }

add() {
        console.log('Guradaste?');
        let invalid = false;
        Object.keys(this.formAdd.controls).forEach((key) => {
            this.formAdd.controls[key].markAsTouched();
            if (this.formAdd.controls[key].status == 'INVALID') {
                console.log(key);
                if (key == 'name'){
                    this.toster.show('Error: el nombre debe tener entre 3 y 40 letras.');
                } else if (key == 'lastName'){
                    this.toster.show('Error: el apellido paterno debe tener entre 3 y 40 letras.');
                } else if (key == 'secondLastName'){
                    this.toster.show('Error: el apellido materno debe tener entre 3 y 40 letras.');
                } else if (key == 'email'){
                    this.toster.show('Error: el email debe tener entre 10 y 40 caracteres.');
                } else if (key == 'phone'){
                    this.toster.show('Error: el numero de telefono debe tener 9 digitos.');
                }
                invalid = true;
                return;
            }
        });
        console.log(invalid);
        if (invalid == false) {
            this.save();
        }
    }

    private getService(id: string) {
        this.subscription.add(
            this.srv.findServiceById(id).subscribe(
                (response) => {
                    this.serviceName = response[0].serviceName;
                },
                (error) => {
                    this.toster.error('X');
                }
            )
        );
    }

actualizarPromociones(id: string) {
        console.log('BBBBBBB')
        this.subscription.add(
            this.srv.findByService(id).subscribe(
                (response) => {
                    console.log(response);
                    this.promotions = response;
                    this.getService(id);
                },
                (error) => {
                    this.toster.error('Ha ocurrido un error al actualizar las promociones.');
                }
            )
        );
    }

    private validateEmail() {
        this.subscription.add(
            this.srv.findByEmail(this.formAdd.controls.email.value).subscribe(
                (response) => {
                    if (response.length === 0) {
                        this.save();
                    } else {
                        this.toster.error('Ha ocurrido un error al actualizar las promociones.');
                    }
                },
                (error) => {
                    this.toster.show('Ha ocurrido un error al actualizar las promociones.');
                }
            )
        );
    }

    private validateRut() {
        this.subscription.add(
            this.srv.findByRut(clean(this.formAdd.controls.rut.value)).subscribe(
                (response) => {
                    if (response.length === 0) {
                        this.validateEmail();
                    } else {
                        this.toster.show('Ya existe un usuario registrado con ese rut.');
                    }
                },
                (error) => {
                    this.toster.show('Ya existe un usuario registrado con ese rut.');
                }
            )
        );
    }

    private createReferer() {
        let selectedPromotion = null;
        if (this.promotions != undefined) {
            this.promotions.forEach((promotion) => {
                if (promotion.name == this.formAdd.controls.promotion.value) {
                    selectedPromotion = promotion;
                }
            });
        }

        let promonotionName = 'Sin Promoción';
        if (selectedPromotion != undefined) {
            promonotionName = selectedPromotion.name;
        }

        let selectedService = null;
        this.services.forEach((service) => {
            if (service.id == this.formAdd.controls.service.value) {
                selectedService = service;
            }
        });

        let profit = 0;
        if (selectedService != undefined) {
            profit = selectedService.profit;
        }

        let referer: any;

        referer = {
            email: this.formAdd.controls.email.value,
            name: this.formAdd.controls.name.value,
            lastName: this.formAdd.controls.lastName.value,
            secondLastName: this.formAdd.controls.secondLastName.value,
            rut: clean(this.formAdd.controls.rut.value),
            phone: this.formAdd.controls.phone.value,
            service: this.formAdd.controls.service.value,
            serviceType: this.formAdd.controls.serviceType.value,
            serviceName: this.serviceName,
            promotion: promonotionName,
            information: this.formAdd.controls.information.value,
            profit,
            status: 0,
            step: 0,
            seller: '',
            referent: JSON.parse(localStorage.getItem('profile')).rut,
        };

        return referer;
    }

goBack() {
        this.router.navigate(['/admin/referers']);
    }

goPrevious(stepper: MatStepper) {
        stepper.previous();
    }
}
