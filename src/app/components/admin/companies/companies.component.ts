import {Component, OnInit, ViewChild} from '@angular/core';
import {ServiceTypeService} from '../../../shared/services/service-type.service';
import {UserService} from '../../../shared/services/user.service';
import { AuthService } from '../../../shared/services/firebase/auth.service';
import { Router } from '@angular/router';
import { CompaniesAddComponent } from './companies-add/companies-add.component';
import { CompaniesEditComponent } from './companies-edit/companies-edit.component';
import { CompaniesViewComponent } from './companies-view/companies-view.component';
import { CompaniesService } from 'src/app/shared/services/companies.service';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { User } from 'src/app/shared/model/user';
import { Companies } from 'src/app/shared/model/companies.model';
declare var require
const Swal = require('sweetalert2')


@Component({
    selector: 'app-companies',
    templateUrl: './companies.component.html',
    styleUrls: ['./companies.component.scss'],
    providers: [ServiceTypeService, UserService, CompaniesService],
})

export class CompaniesComponent implements OnInit{
    private subscription: Subscription = new Subscription();
    public count: number;
    public user: User;
    public companies: Companies[];
    public perfil =  JSON.parse(localStorage.getItem('profile'));
    public companiesTitle = this.perfil.role.slug == 'taller' ? 'Talleres' : this.perfil.role.slug == 'comercio' ? 'Comercios' : 'Negocios';
    public companyTitle = this.perfil.role.slug == 'taller' ? 'Taller' : this.perfil.role.slug == 'comercio' ? 'Comercio' : 'Negocio';

    // Ventanas popup
    @ViewChild("quickViewCompaniesAdd") QuickViewCompaniesAdd: CompaniesAddComponent;
    @ViewChild("quickViewCompaniesEdit") QuickViewCompaniesEdit: CompaniesEditComponent;
    @ViewChild("quickViewCompaniesView") QuickViewCompaniesView: CompaniesViewComponent;

    constructor(
        public authService: AuthService, 
        private _router: Router, 
        private userSrv: UserService,
        private srv: CompaniesService,
        public toster: ToastrService,) { }

    ngOnInit() {
        console.log(this.perfil);
        this.getCount();
    }
    private getCount() {
        this.subscription.add(
            this.srv.countByEmail(this.perfil.email).subscribe(
                (response) => {
                    this.count = response;
                    console.log(this.count);
                    this.find();
                },
                (error) => {
                    this.toster.error('Se ha producido un error al intentar buscar los '+this.companiesTitle);
                }
            )
        );
    }
    private find() {
        this.subscription.add(
            this.srv.findByEmail(this.perfil.email).subscribe(
                (response) => {
                    this.user = response;
                    this.companies = this.user.companies;
                    if (this.user.status == 0) {
                        this.toster.info('Para interactuar con el sistema, debe tener 1 o varios '+this.companiesTitle);   
                    }
                    console.log(this.user);
                },
                (error) => {
                    this.toster.error('Se ha producido un error al intentar buscar los '+this.companiesTitle);
                }
            )
        );
    }
    private async remove(rut: string) {
        await this.subscription.add(
            this.srv.remove(this.perfil.email, rut).subscribe(
                (response) => {
                    return response;
                },
                (error) => {
                    return false;
                }
            )
        );
        return false;
    }
    removeWithConfirmation(rut: string) {
        Swal.fire({
          title: 'Estas seguro que deseas eliminar el '+this.perfil.role.name+'?',
          text: "No podras revertir esto despues!",
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Si, quiero hacerlo!',
          cancelButtonText: 'No, cancelar!'
        }).then((result) => {
          if (result.value) {
            let confirm = this.remove(rut);
            if (confirm) {
                Swal.fire(
                    'Eliminado!',
                    'Tu '+this.perfil.role.name+' se a eliminado.',
                    'success'
                )
                this.getCount();
            } else {
                Swal.fire(
                    'Ups.. algo salio mal!',
                    'Tu '+this.perfil.role.name+' no se a eliminado.',
                    'error'
                )
            }
            
          }
        })
      }
    public canWrite() {
        return true;
    }
}
