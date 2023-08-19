import { Component, OnInit, TemplateRef, ViewChild, HostListener } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ServiceTypeService } from '../../../../shared/services/service-type.service';
import { UserService } from '../../../../shared/services/user.service';
import { CompaniesService } from '../../companies/companies.service';
import { User } from '../../../../shared/model/user';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { validate, clean, format } from 'rut.js';
import { OffersAddComponent } from './offers-add/offers-add.component';
import { OffersViewComponent } from './offers-view/offers-view.component';
import { OffersDetailComponent } from './offers-detail/offers-detail.component';
import { Router } from '@angular/router';
import { OrderService } from 'src/app/shared/services/order.service';
import { Order } from 'src/app/shared/model/order.model';
import { Product } from 'src/app/shared/model/product.model';
import { ProductsFilter } from 'src/app/shared/model/product-filter';
import { OfferWithData } from 'src/app/shared/model/offer-with-data';
import { UtilService } from 'src/app/shared/services/util.service';
import { Offer } from 'src/app/shared/model/offer.model';
import { checkedOptionValidator } from 'src/app/shared/validators/form-validators';
import { Companies } from 'src/app/shared/model/companies.model';
//import { OrdersEditComponent } from './orders-edit/orders-edit.component';
declare var require;
const Swal = require('sweetalert2');

@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.scss'],
  providers: [ServiceTypeService, UserService, CompaniesService, OrderService]
})
export class OffersComponent implements OnInit {
  
  private subscription: Subscription = new Subscription();
  public closeResult: string;
  public modalOpen: boolean = false;
  public companiesForm: FormGroup;
  public perfil =  JSON.parse(localStorage.getItem('profile'));
  public count: number;
  public ordertable: any[];
  public user: User;
  public companies: Companies[] = [];
  public uniqueId = (new Date()).getTime().toString();
  public openSidebar: boolean = false;
  public listView: boolean = true;
  public loading: boolean = true;
  public col: string = '3';
  public companiesName = this.perfil.role.slug == 'taller' ? 'Talleres' : this.perfil.role.slug == 'comercio' ? 'Comercios' : 'No posee';
  //public orders: Order[];
  public products: Product[];
  public orderWithProductOffers: {
    order: Order,
    product: Product,
    offers: Offer[]
  }[] = [];
  public screenType: string = "";
  public filterForm: FormGroup;
  public brandsFilter: { value: string, label: string, job: string }[] = [];
  public parameters: ProductsFilter = {
    brand: "",
  };
  public filterHidden: boolean = false;
  public filterButton: string = "Filtrar";
  
  // Ventanas Popup
  @ViewChild("quickViewOffersAdd") QuickViewOffersAdd: OffersAddComponent;
  @ViewChild("quickViewOffersView") QuickViewOffersView: OffersViewComponent;
  @ViewChild("quickViewOffersDetail") QuickViewOffersDetail: OffersDetailComponent;
  
  //@ViewChild("quickViewOrdersEdit") QuickViewOrdersEdit: OrdersEditComponent;

  constructor(
    public formBuilder: FormBuilder,
    private fb: FormBuilder,
    private router: Router,
    private utilSrv: UtilService,
    private srv: OrderService,
    public toster: ToastrService,
    private companiesSrv: CompaniesService) {
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
      this.filterForm = this.formBuilder.group({
        brand: this.formBuilder.control({value: this.brandsFilter, disabled: false}),
      });
      this.findUser();
    }
  }
  private haveAccess() {
    return true;
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
  private async findUser() {
    try {
      const response: Companies[] = await this.companiesSrv.findByEmail(this.perfil.email).toPromise();
      if (response && response.length > 0) {
        console.log(response);
        this.companies = response;
        let count = 0;
        for (let company of this.companies) {
          for (let i = 0 ; i < company.make.length ; i++) {
            this.brandsFilter.push({
              value: company.make[i],
              label: company.make[i],
              job: ''
            })
            if (i == company.make.length - 1 && count == this.companies.length-1) {
              this.parameters.brand += company.make[i];
            } else {
              this.parameters.brand += company.make[i]+',';
            }
          }
          count++;
        }
        this.findOrders();
      } else {
        this.loading = false;
        if(!this.companies || this.companies.length <= 0){
            const swalWithBootstrapButtons = Swal.mixin({
                customClass: {
                  confirmButton: 'btn btn-pill btn-primary mr-2',
                  cancelButton: 'btn btn-pill btn-info ml-2'
                },
                buttonsStyling: false,
              });   
            swalWithBootstrapButtons.fire({
            title: 'Ups! no has ingresado los datos de tu local',
            text: "Sólo podrás ver pedidos, pero no podrás ofertar",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Agregar local',
            cancelButtonText: 'Ver pedidos'
          }).then((result) => {
            if (result.isConfirmed) {
              this.router.navigate(['admin/companies']);
            }
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
    /*this.subscription.add(
        this.companiesSrv.findByEmail(this.perfil.email).subscribe(
            (response) => {
                
            },
            (error) => {
                this.toster.error('Se ha producido un error al intentar buscar los '+this.companiesName);
            }
        )
    );*/
  }
  private findOrders() {
    this.subscription.add(this.srv.findOfferByMail(this.perfil.email, this.parameters.brand).subscribe(
      response => {
        console.log(response);
        this.orderWithProductOffers = response;
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
  changeFilter() {
    this.parameters.brand = (this.filterForm.controls.brand.value).map((object: { value: string; label: string; job: string }) => object.value);
    if (this.parameters.brand && this.parameters.brand.length == 0) {
      this.parameters.brand = "null";
    }
    this.findOrders();
  }
  public canWrite() {
    return true;
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
      title: 'Estas seguro que deseas eliminar tu pedido?',
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
                'Tu pedido se a eliminado.',
                'success'
            )
            this.findOrders();
        } else {
            Swal.fire(
                'Ups.. algo salio mal!',
                'Tu pedido no se a eliminado.',
                'error'
            )
        }
        
      }
    })
  }

}
