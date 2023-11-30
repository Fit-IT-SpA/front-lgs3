import { Component, OnInit, OnDestroy } from '@angular/core';
import { RoleService } from './role.service';
import { Subscription } from 'rxjs';
import { Role } from '../../../../shared/model/role.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl } from '@angular/forms';
import { ConstantService } from '../../../../shared/services/constant.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
declare var require;
const Swal = require('sweetalert2');

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss'],
  providers: [RoleService]
})
export class RoleComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  roles: Role[] = null;
  loading: boolean = true;
  currentPage: number = 0;
  pageSize: number = ConstantService.paginationDesktop;
  totalElements: number;
  searchInputControl: FormControl;
  access: boolean = false;
  constructor( private router: Router, public toster: ToastrService,
    private srv: RoleService, private snack: MatSnackBar) {}

  private haveAccess() {
    let permissions = JSON.parse(localStorage.getItem("profile")).privilege;
    if (permissions) {
      let access = permissions.filter((perm: string) => {
        return perm === ConstantService.PERM_PERFIL_ADMIN_LECTURA;
      });
      return access.length > 0;
    } else {
      return false;
    }
  }

  canWrite() {
    let permissions = JSON.parse(localStorage.getItem("profile")).privilege;
    if (permissions) {
      let access = permissions.filter((perm: string) => {
        return perm === ConstantService.PERM_PERFIL_ADMIN_ESCRITURA;
      });
      return access.length > 0;
    } else {
      return false;
    }
  }

  ngOnInit(): void {
    let access = this.haveAccess();
    if (!access) {
      this.router.navigate(['/admin/unauthorized']);
    } else {
      this.access = access;
      this.getCount();
    }
  }

  private getCount() {
    this.subscription.add(this.srv.count()
      .subscribe(
        response => {
          this.totalElements = response.count;
          this.find();
        },
        error => {
          this.loading = false;
          this.toster.error('Se ha producido un error al intentar conseguir los perfiles.')
        }
      )
    );
  }

  private find() {
    this.subscription.add(this.srv.find(this.currentPage)
      .subscribe(
        response => {
          this.roles = response;
          console.log(this.roles);
          window.scrollTo(0, 0);
          this.loading = false;
        },
        error => {
          this.loading = false;
          this.toster.error('Se ha producido un error al intentar conseguir los perfiles.')
        }
      )
    );
  }

  edit(slug: string) {
    this.router.navigate(['/admin/users/role/edit/' + slug]);
  }

  private async remove(slug: string) {
    this.subscription.add(this.srv.remove(slug)
      .subscribe(
        response => {
          return true;
        },
        err => {
          console.log(err);
          return false;
        }
      )
    );
    return false;
  }
  removeWithConfirmation(id: string) {
    Swal.fire({
      title: '¿Estas seguro que deseas eliminar este perfil?',
      text: "No podras revertir esto despues!",
      showCancelButton: true,
      buttonsStyling: false,
      confirmButtonText: 'Si, quiero hacerlo!',
      cancelButtonText: 'No, cancelar!',
      reverseButtons: true,
      customClass: {
        confirmButton: 'btn btn-pill btn-success mb-3', // Agrega tu clase CSS personalizada aquí
        cancelButton: 'btn btn-pill btn-info m-r-15 mb-3', // Agrega tu clase CSS personalizada aquí
      }
    }).then((result) => {
      if (result.value) {
        let confirm = this.remove(id);
        console.log(confirm);
        if (confirm) {
            Swal.fire(
                'Eliminado!',
                'El perfil se a eliminado.',
                'success'
            )
            this.loading = true;
            this.getCount();
        } else {
            Swal.fire(
                'Ups.. algo salio mal!',
                'El perfil no se a eliminado.',
                'error'
            )
        }
        
      }
    })
  }

  onPageFired(event: any) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loading = true;
    this.find();
  }
  add() {
    this.router.navigate(['/admin/users/role/add']);
  }
  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
  }
}
