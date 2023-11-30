import { Component, OnInit, TemplateRef, ViewChild, HostListener } from '@angular/core';
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
import { UtilService } from 'src/app/shared/services/util.service';
import { Offer } from 'src/app/shared/model/offer.model';
import { Companies } from 'src/app/shared/model/companies.model';
import { ConstantService } from 'src/app/shared/services/constant.service';
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
  public profile =  JSON.parse(localStorage.getItem('profile'));
  public count: number;
  public ordertable: any[];
  public user: User;
  public companies: Companies[] = [];
  public uniqueId = (new Date()).getTime().toString();
  public openSidebar: boolean = false;
  public listView: boolean = true;
  public loading: boolean = true;
  public col: string = '3';
  public companiesName = this.profile.role.slug == 'taller' ? 'Talleres' : this.profile.role.slug == 'comercio' ? 'Comercios' : 'No posee';
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
  public periods: string[] = [];
  public parameters: {date: string, brand: string[]} = {
    date: "",
    brand: [],
  }
  public pageSize: number = ConstantService.paginationDesktop;
  public currentPage: number = 0;
  public totalElements: number;
  public filterHidden: boolean = false;
  public filterButton: string = "Filtrar";
  
  // Ventanas Popup
  @ViewChild("quickViewOffersView") QuickViewOffersView: OffersViewComponent;
  @ViewChild("quickViewOffersDetail") QuickViewOffersDetail: OffersDetailComponent;
  
  //@ViewChild("quickViewOrdersEdit") QuickViewOrdersEdit: OrdersEditComponent;

  constructor(
    public formBuilder: FormBuilder,
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
        date: this.formBuilder.control({value: "", disabled: false}),
      });
      this.getPeriods();
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
  checkStatusUser() {
    this.subscription.add(
        this.companiesSrv.checkStatusUser(this.profile.email).subscribe(
            (response) => {
                if (response == 0) {
                    this.router.navigate(['/admin/companies']);
                }
            }
        )
    );
  }
  private async getCompanies() {
    try {
      const response: Companies[] = await this.companiesSrv.findByEmail(this.profile.email).toPromise();
      if (response && response.length > 0) {
        console.log(response);
        this.companies = response;
        /*let count = 0;
        for (let company of this.companies) {
          for (let i = 0 ; i < company.make.length ; i++) {
            this.brandsFilter.push({
              value: company.make[i],
              label: company.make[i],
              job: ''
            })
            this.parameters.brand.push(company.make[i]);
          }
          count++;
        }*/
        this.getCompaniesMakes();
      } else {
        this.getVehicleListMake();
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
              this.router.navigate(['admin/companies/add']);
            }
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
  private getCompaniesMakes() {
    this.subscription.add(this.companiesSrv.findCompaniesMakesByEmail(this.profile.email).subscribe(
      response => {
        console.log(response);
        for (let make of response) {
          this.brandsFilter.push({
            value: make,
            label: make,
            job: ''
          })
          this.parameters.brand.push(make);
        }
        this.getCount();
      }, error => {
        console.log(error);
        this.loading = false;
      }
    ))
  }
  private getVehicleListMake() {
    this.subscription.add(this.companiesSrv.findVehicleListMake().subscribe(
      response => {
        this.brandsFilter.push({
          value: "all",
          label: "Todas las marcas",
          job: ''
        })
        for (let vehicle of response) {
          this.brandsFilter.push({
            value: vehicle.make,
            label: vehicle.make,
            job: ''
          })
        }
        this.filterForm.controls.brand.setValue([{value: "all",label: "Todas las marcas",job: ''}]);
        //console.log(this.makesFilter); 
        this.changeFilter();
      }, (error) => {
        console.log(error);
      }
    ));
  }
  private getCount() {
    this.subscription.add(this.srv.countProcutsNotOfferByMail(this.profile.email, this.parameters).subscribe(
      response => {
        console.log(response);
        this.totalElements = response.count;
        this.findProductsNotOffer();
      }, error => {
        console.log(error);
        this.loading = false;
      }
    ))
  }
  private findProductsNotOffer() {
    this.subscription.add(this.srv.findProductsNotOfferByMail(this.profile.email,this.currentPage, this.parameters).subscribe(
      response => {
        console.log(response);
        this.orderWithProductOffers = response;
        this.loading = false;
      }, error => {
        console.log(error);
        this.loading = false;
      }
    ))
  }
  private getPeriods() {
    const months = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    
    const actualDate = new Date();
    const actualMonth = months[actualDate.getMonth()];
    const actualYear = actualDate.getFullYear();
    
    actualDate.setMonth(actualDate.getMonth() - 1);
    const previousMonth = months[actualDate.getMonth()];
    const previousYear = actualDate.getFullYear();
    this.periods.push(actualMonth + " " + actualYear);
    this.periods.push(previousMonth + " " + previousYear);
    this.filterForm.controls.date.setValue(this.periods[0]);
    this.parameters.date = this.periods[0];
    this.getCompanies();
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
    this.loading = true;
    this.parameters.brand = (this.filterForm.controls.brand.value).map((object: { value: string; label: string; job: string }) => object.value);
    //this.parameters.brand = "";
    this.parameters.date = this.filterForm.controls.date.value;
    if (this.parameters.brand && this.parameters.brand.length == 0) {
      this.parameters.brand = [];
    }
    this.getCount();
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
      title: 'Estas seguro que deseas eliminar tu pedido?',
      text: "No podras revertir esto despues!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Si, quiero hacerlo!',
      buttonsStyling: false,
      cancelButtonText: 'No, cancelar!',
      reverseButtons: true,
      customClass: {
        confirmButton: 'btn btn-pill btn-success mb-3', // Agrega tu clase CSS personalizada aquí
        cancelButton: 'btn btn-pill btn-info m-r-15 mb-3', // Agrega tu clase CSS personalizada aquí
      }
    }).then((result) => {
      if (result.value) {
        let confirm = this.remove(id);
        if (confirm) {
            Swal.fire(
                'Eliminado!',
                'Tu pedido se a eliminado.',
                'success'
            )
            this.getCount();
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
  onPageFired(event: any) {
    this.loading = true;
    this.currentPage = event;
    this.pageSize = this.pageSize;
    this.getCount();
  }
  public add(id: string) {
    this.router.navigate(['/admin/orders/offers/add/'+id]);
  }

}
