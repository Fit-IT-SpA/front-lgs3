import {Component, OnInit, ViewChild} from '@angular/core';
import {ServiceTypeService} from '../../../shared/services/service-type.service';
import {UserService} from '../../../shared/services/user.service';
import { AuthService } from '../../../shared/services/firebase/auth.service';
import { Router } from '@angular/router';
import { CompaniesViewComponent } from './companies-view/companies-view.component';
import { CompaniesService } from 'src/app/components/admin/companies/companies.service';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { User } from 'src/app/shared/model/user';
import { Companies } from 'src/app/shared/model/companies.model';
import { ConstantService } from 'src/app/shared/services/constant.service';
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
    public loading: boolean = true;
    public profile =  JSON.parse(localStorage.getItem('profile'));
    public companiesTitle = this.profile.role.slug == 'taller' ? 'Talleres' : this.profile.role.slug == 'comercio' ? 'Comercios' : 'Negocios';
    public companyTitle = this.profile.role.slug == 'taller' ? 'Taller' : this.profile.role.slug == 'comercio' ? 'Comercio' : 'Negocio';
    @ViewChild("quickViewCompaniesView") QuickViewCompaniesView: CompaniesViewComponent;

    constructor(
        public authService: AuthService, 
        private router: Router, 
        private userSrv: UserService,
        private srv: CompaniesService,
        public toster: ToastrService,) { }

    ngOnInit() {
        if (this.haveAccess()) {
            this.getCount();
        }
    }
    private haveAccess() {
        let permissions = JSON.parse(localStorage.getItem("profile")).privilege;
        if (permissions) {
            let access = permissions.filter((perm: string) => {
                return perm === ConstantService.PERM_MIS_TALLERES_LECTURA|| perm === ConstantService.PERM_MIS_COMERCIOS_LECTURA;
            });
            return access.length > 0;
        } else {
            return false;
        }
    }
    private getCount() {
        this.subscription.add(
            this.srv.countByEmail(this.profile.email).subscribe(
                (response) => {
                    this.count = response;
                    console.log(this.count);
                    this.find();
                },
                (error) => {
                    this.toster.error('Se ha producido un error al intentar buscar los '+this.companiesTitle);
                    this.loading = false;
                }
            )
        );
    }
    private find() {
        this.subscription.add(
            this.srv.findByEmail(this.profile.email).subscribe(
                (response) => {
                    this.companies = response;
                    if (this.companies && this.companies.length < 1) {
                        this.toster.info('Para interactuar con el sistema, debe tener 1 o varios '+this.companiesTitle);   
                    }
                    this.loading = false;
                },
                (error) => {
                    this.toster.error('Se ha producido un error al intentar buscar los '+this.companiesTitle);
                    this.loading = false;
                }
            )
        );
    }
    private async remove(id: string) {
        await this.subscription.add(
            this.srv.remove(id).subscribe(
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
          title: 'Estas seguro que deseas eliminar el '+this.profile.role.name+'?',
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
                    'Tu '+this.profile.role.name+' se a eliminado.',
                    'success'
                )
                this.getCount();
            } else {
                Swal.fire(
                    'Ups.. algo salio mal!',
                    'Tu '+this.profile.role.name+' no se a eliminado.',
                    'error'
                )
            }
            
          }
        })
      }
    public canWrite() {
        let permissions = JSON.parse(localStorage.getItem("profile")).privilege;
        if (permissions) {
            let access = permissions.filter((perm: string) => {
                return perm === ConstantService.PERM_MIS_TALLERES_ESCRITURA|| perm === ConstantService.PERM_MIS_COMERCIOS_ESCRITURA;
            });
            return access.length > 0;
        } else {
            return false;
        }
    }
    public add() {
        this.router.navigate(['/admin/companies/add']);
    }
    public edit(id: string) {
        this.router.navigate(['/admin/companies/edit/'+id]);
    }
}
