import { Component, OnInit, TemplateRef, ViewChild, HostListener } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ServiceTypeService } from '../../../shared/services/service-type.service';
import { UserService } from '../../../shared/services/user.service';
import { CompaniesService } from '../companies/companies.service';
import { User } from '../../../shared/model/user';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { validate, clean, format } from 'rut.js';
import { Router } from '@angular/router';
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
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.scss'],
  providers: [ServiceTypeService, UserService, OfferService]
})
export class OffersComponent implements OnInit {
  
  private subscription: Subscription = new Subscription();
  public closeResult: string;
  public modalOpen: boolean = false;
  public offers : Offer[];
  public pageSize: number = ConstantService.paginationDesktop;
  public currentPage: number = 0;
  public totalElements: number;
  public profile =  JSON.parse(localStorage.getItem('profile'));
  public listView: boolean = true;
  public loading: boolean = true;
  public loadingOffers: boolean = true;
  public col: string = '3';
  public companiesName = this.profile.role.slug == 'taller' ? 'Talleres' : this.profile.role.slug == 'comercio' ? 'Comercios' : 'No posee';
  public screenType: string = "";
  public filterHidden: boolean = false;
  public filterButton: string = "Filtrar";
  private intervalsId: number[] = [];
  
  //@ViewChild("quickViewOrdersEdit") QuickViewOrdersEdit: OrdersEditComponent;

  constructor(
    public formBuilder: FormBuilder,
    private router: Router,
    private utilSrv: UtilService,
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
        this.getCount();
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
  private getCount() {
    this.subscription.add(this.srv.getCountOffersByEmail(this.profile.email).subscribe(
        response => {
            console.log(response);
            this.totalElements = response.count;
            this.getOffers();
        }, error => {
            console.log(error);
            this.loading = false;
            this.loadingOffers = false;
        }
    ));
  }
  private getOffers() {
    this.subscription.add(this.srv.getOffersByEmail(this.profile.email, this.currentPage).subscribe(
        response => {
            console.log(response);
            this.offers = response;
            this.getTimers();
        }, error => {
            console.log(error);
            this.loading = false;
            this.loadingOffers = false;
        }
    ));
  }
  private getTimers() {
    for (let offer of this.offers) {
      if (offer.status === 2) {
        offer.count = Number(new Date(offer.timerVigency).getTime() - new Date().getTime())
        offer.countMinutes = Math.floor(offer.count / (1000 * 60));
        offer.countSeconds = Math.floor((offer.count % (1000 * 60)) / 1000);
        offer.count = offer.count / 1000;
        let intervalId = setInterval(() => {
          offer.count--;
          if (offer.count > 0) {
            if (offer.countSeconds <= 0) {
              offer.countSeconds = 59;
              offer.countMinutes--;
            } else {
              offer.countSeconds--;
            }
          } else {
            // Detiene el intervalo cuando alcanza 0 minutos y 0 segundos
            this.loadingOffers = true;
            this.getCount();
            for (let intervalId of this.intervalsId) {
              clearInterval(intervalId);
            }
          }
        }, 1000);
        this.intervalsId.push(intervalId);
      }
    }
    this.loading = false;
    this.loadingOffers = false;
  }
  onPageFired(event: any) {
    this.loading = true;
    this.currentPage = event;
    this.pageSize = this.pageSize;
    this.getCount();
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
    this.subscription.add(this.srv.remove(id).subscribe(
      response => {
        return response;
      }
    ))
    return false;
}
  removeWithConfirmation(id: string) {
    Swal.fire({
      title: 'Estas seguro que deseas eliminar tu oferta?',
      text: "No podras revertir esto despues!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, quiero hacerlo!',
      cancelButtonText: 'No, cancelar!'
    }).then((result) => {
      if (result.value) {
        let confirm = this.remove(id);
        if (confirm) {
            Swal.fire(
                'Eliminado!',
                'Tu oferta se a eliminado.',
                'success'
            )
            this.getCount();
        } else {
            Swal.fire(
                'Ups.. algo salio mal!',
                'Tu oferta no se a eliminado.',
                'error'
            )
        }
        
      }
    })
  }
  public onCellClick(id: string) {
    this.router.navigate(['/admin/offers/view/'+id]);
  }
  public ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
    for (let intervalId of this.intervalsId) {
      clearInterval(intervalId);
    }
  }
}
