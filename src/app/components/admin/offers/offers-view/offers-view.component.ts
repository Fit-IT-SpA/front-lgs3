import { Component, OnInit, TemplateRef, ViewChild, HostListener } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ServiceTypeService } from '../../../../shared/services/service-type.service';
import { UserService } from '../../../../shared/services/user.service';
import { CompaniesService } from '../../companies/companies.service';
import { User } from '../../../../shared/model/user';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { validate, clean, format } from 'rut.js';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from 'src/app/shared/services/order.service';
import { Order } from 'src/app/shared/model/order.model';
import { Product } from 'src/app/shared/model/product.model';
import { ProductsFilter } from 'src/app/shared/model/product-filter';
import { UtilService } from 'src/app/shared/services/util.service';
import { Offer } from 'src/app/shared/model/offer.model';
import { Companies } from 'src/app/shared/model/companies.model';
import { ConstantService } from 'src/app/shared/services/constant.service';
import { OfferService } from 'src/app/shared/services/offer.service';
//import { OrdersEditComponent } from './orders-edit/orders-edit.component';
declare var require;
const Swal = require('sweetalert2');

@Component({
  selector: 'app-offers-view',
  templateUrl: './offers-view.component.html',
  styleUrls: ['./offers-view.component.scss'],
  providers: [ServiceTypeService, UserService, OfferService]
})
export class OffersViewComponent implements OnInit {
  
  private subscription: Subscription = new Subscription();
  public closeResult: string;
  public modalOpen: boolean = false;
  public offer : Offer;
  public pageSize: number = ConstantService.paginationDesktop;
  public currentPage: number = 0;
  public totalElements: number;
  public profile =  JSON.parse(localStorage.getItem('profile'));
  private offerId: string;
  public listView: boolean = true;
  public loading: boolean = true;
  public col: string = '3';
  public companiesName = this.profile.role.slug == 'taller' ? 'Talleres' : this.profile.role.slug == 'comercio' ? 'Comercios' : 'No posee';
  public screenType: string = "";
  public filterHidden: boolean = false;
  public filterButton: string = "Filtrar";
  
  //@ViewChild("quickViewOrdersEdit") QuickViewOrdersEdit: OrdersEditComponent;

  constructor(
    public formBuilder: FormBuilder,
    private router: Router,
    private utilSrv: UtilService,
    private activatedRoute: ActivatedRoute,
    private srv: OfferService,
    public toster: ToastrService,) {
      this.screenType = utilSrv.getScreenSize();
      if (window.innerWidth < 575) {
        this.listView = true;
        this.filterButton = "Filtrar";
        this.filterHidden = true;
      } else {
        this.filterButton = "Ocultar";
        this.filterHidden = false;
        this.listView = false;
      }
     }
  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any) {
    //console.log('Resolución actual: ' + window.innerWidth + ' x ' + window.innerHeight);
    if (window.innerWidth < 575) {
      this.filterButton = "Filtrar";
      this.listView = true;
      this.filterHidden = true;
    } else {
      this.filterButton = "Ocultar";
      this.filterHidden = false;
      this.listView = false;
    }
  }
  ngOnInit(): void {
    if (this.haveAccess()) {
        this.subscription.add(this.activatedRoute.params.subscribe(params => {
            this.offerId = params['id'];
            this.findOffer();
        }));
    }
  }
  private haveAccess() {
    let permissions = JSON.parse(localStorage.getItem("profile")).privilege;
    if (permissions) {
        let access = permissions.filter((perm: string) => {
            return perm === ConstantService.PERM_MIS_OFERTAS_LECTURA;
        });
        return access.length > 0;
    } else {
        return false;
    }
  }
  private findOffer() {
    this.subscription.add(this.srv.getOfferById(this.offerId).subscribe(
        response => {
            console.log(response);
            this.offer = response;
            this.loading = false;
        }, error => {
            console.log(error);
            this.loading = false;
        }
    ))
  }
  /**
   * metodo para convertir cadena de caraceres en formato rut (puntos y guion)
   * @param rut rut de los talleres del usuario
   * @returns retorna el string con formato rut, si no es valido retornará un mensaje
   */
   formatRut(rut: string) {
    if (rut != '') 
        if (rut?.length > 3 && validate(rut))
            return format(rut);
    return 'rut incorrecto';    
  }
  toggleListView(val) {
    this.listView = val;
  }
  gridColumn(val) {
    this.col = val;
  }
  showFilter() {
    this.filterButton = (this.filterButton == "Filtrar") ? "Ocultar" : "Filtrar";
    this.filterHidden = (this.filterHidden) ? false : true;
  }
  public canWrite() {
    let permissions = JSON.parse(localStorage.getItem("profile")).privilege;
    if (permissions) {
        let access = permissions.filter((perm: string) => {
            return perm === ConstantService.PERM_MIS_OFERTAS_ESCRITURA;
        });
        return access.length > 0;
    } else {
        return false;
    }
  }
  private async remove(id: string) {
    try {
      const response = await this.srv.remove(id).toPromise();
      console.log(response);
      return 'success';
    } catch (error) {
      if (error.error.error.message === 'product con ofertas') {
        return error.error.error.message;
      } else {
        return 'error';
      }
    }
  }
  removeWithConfirmation() {
    Swal.fire({
      title: 'Estas seguro que deseas eliminar tu oferta?',
      text: "No podras revertir esto despues!",
      type: 'warning',
      showCancelButton: true,
      buttonsStyling: false,
      confirmButtonText: 'Si, quiero hacerlo!',
      cancelButtonText: 'No, cancelar!',
      reverseButtons: true,
      customClass: {
        confirmButton: 'btn btn-pill btn-success mb-3', // Agrega tu clase CSS personalizada aquí
        cancelButton: 'btn btn-pill btn-info m-r-15 mb-3', // Agrega tu clase CSS personalizada aquí
      }
    }).then(async (result) => {
      if (result.value) {
        this.loading = true;
        let confirm = await this.remove(this.offerId);
        console.log(confirm);
        if (confirm) {
            Swal.fire(
                'Eliminado!',
                'Tu oferta se a eliminado.',
                'success'
            )
            this.loading = false;
            this.goBack();
        } else {
            Swal.fire(
                'Ups.. algo salio mal!',
                'Tu oferta no se a eliminado.',
                'error'
            )
            this.loading = false;
        }
        
      }
    })
  }
  public goBack() {
    this.router.navigate(['/admin/offers']);
    //console.log(this.form);
  }
  public edit() {
    this.router.navigate(['/admin/offers/edit/'+this.offerId]);
  }
}
