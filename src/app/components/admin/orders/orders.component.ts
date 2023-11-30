import { Component, OnInit, TemplateRef, ViewChild, HostListener } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ServiceTypeService } from '../../../shared/services/service-type.service';
import { UserService } from '../../../shared/services/user.service';
import { CompaniesService } from '../companies/companies.service';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { validate, clean, format } from 'rut.js';
import { OrdersViewComponent } from './orders-view/orders-view.component';
import { Router } from '@angular/router';
import { OrderService } from 'src/app/shared/services/order.service';
import { Order } from 'src/app/shared/model/order.model';
import { ConstantService } from 'src/app/shared/services/constant.service';
import { Companies } from 'src/app/shared/model/companies.model';
import { UtilService } from 'src/app/shared/services/util.service';
declare var require;
const Swal = require('sweetalert2');

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
  providers: [ServiceTypeService, UserService, CompaniesService, OrderService],
})
export class OrdersComponent implements OnInit {
  
  private subscription: Subscription = new Subscription();
  public closeResult: string;
  public modalOpen: boolean = false;
  public companiesForm: FormGroup;
  public profile =  JSON.parse(localStorage.getItem('profile'));
  public count: number;
  public companies: Companies[];
  public uniqueId = (new Date()).getTime().toString();
  public openSidebar: boolean = false;
  public listView: boolean = false;
  public col: string = '3';
  public companiesName = this.profile.role.slug == 'taller' ? 'Talleres' : this.profile.role.slug == 'comercio' ? 'Comercios' : 'Negocios';
  public orders: Order[];
  public loading: boolean = true;
  public filterForm: FormGroup;
  public periods: string[] = [];
  public parameters: {date: string, status: string} = {
    date: "",
    status: ""
  }
  public pageSize: number = ConstantService.paginationDesktop;
  public currentPage: number = 0;
  public totalElements: number;
  public screenType: string = "";
  public filterHidden: boolean = false;
  public filterButton: string = "Filtrar";
  // Ventanas Popup
  @ViewChild("quickViewOrdersView") QuickViewOrdersView: OrdersViewComponent;

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private utilSrv: UtilService,
    private router: Router,
    private userSrv: UserService,
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
        status: "",
        date: ""
      });
      this.parameters.date = (new Date()).toISOString().
      replace(/T/, ' ').      // replace T with a space
      replace(/\..+/, '')     // delete the dot and everything after
      this.getPeriods();
    } else {
      this.router.navigate(['/admin/unauthorized']);
    }
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
  private haveAccess() {
    let permissions = JSON.parse(localStorage.getItem("profile")).privilege;
    if (permissions) {
      let access = permissions.filter((perm: string) => {
        return perm === ConstantService.PERM_MIS_PEDIDOS_LECTURA;
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
  private getCompanies() {
    this.subscription.add(
        this.companiesSrv.findByEmail(this.profile.email).subscribe(
            (response) => {
                this.companies = response;
                if (this.companies && this.companies.length < 1) {
                  if (this.profile.role.slug === "taller") {
                    this.toster.info("Para ingresar un pedido, favor indícanos el tipo de facturación que desees, Boleta o Factura", "", {timeOut: 6000});
                    this.router.navigate(['/admin/companies/add']);
                  } else if (this.profile.role.slug === "comercio") {
                    this.toster.info('Para interactuar con el sistema, debe tener 1 o varios comercios', "", {timeOut: 6000});
                    this.router.navigate(['/admin/companies/add']);
                  } else {
                    this.toster.info('Para interactuar con el sistema, debe tener 1 o varios negocios', "", {timeOut: 6000});
                    this.router.navigate(['/admin/companies/add']);
                  }
                } else {
                  this.getCount();
                }
            },
            (error) => {
                this.toster.error('Se ha producido un error al intentar buscar los '+this.companiesName);
                this.loading = false;
            }
        )
    );
  }
  private getCount() {
    this.subscription.add(this.srv.countByEmail(this.profile.email, this.parameters).subscribe(
      response => {
        console.log(response);
        this.totalElements = response.count;
        this.findOrders();
      }, error => {
        console.log(error);
        this.toster.error('Se a producido un error al intentar buscar los pedidos');
        this.loading = false;
      }
    ));
  }
  private findOrders() {
    this.subscription.add(this.srv.findByEmail(this.profile.email, this.parameters, this.currentPage).subscribe(
      response => {
        this.orders = response;
        console.log(this.orders);
        this.loading = false;
      }, error => {
        console.log(error);
        this.toster.error('Se a producido un error al intentar buscar los pedidos');
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
        if (rut.length > 3 && validate(rut))
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
  canWrite() {
    let permissions = JSON.parse(localStorage.getItem("profile")).privilege;
    if (permissions) {
      let access = permissions.filter((perm: string) => {
        return perm === ConstantService.PERM_MIS_PEDIDOS_ESCRITURA;
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
      if (error.error.error.message === 'products con ofertas') {
        return error.error.error.message;
      } else {
        return 'error';
      }
    }
  }
  orderView(id: string) {
    this.router.navigate(['/admin/orders/'+id+'/products']);
  }
  removeWithConfirmation(id: string) {
    Swal.fire({
      title: 'Estas seguro que deseas eliminar tu pedido?',
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
        let confirm = await this.remove(id);
        console.log(confirm);
        if (confirm === 'success') {
          Swal.fire(
              'Pedido eliminado',
              'Tu pedido se ha eliminado.',
              'success'
          )
          this.ngOnInit();
        } else if (confirm === 'products con ofertas') {
          Swal.fire(
            'Pedido con ofertas',
            'Tu pedido no se ha eliminado porque contiene ofertas pendientes.',
            'error'
          )
          this.loading = false;
        } else {
          Swal.fire(
              'Ups.. algo salio mal!',
              'Tu pedido no se ha eliminado.',
              'error'
          )
          this.loading = false;
        }
      }
    })
  }
  add() {
    this.router.navigate(['/admin/orders/add']);
  }
  edit(id: string) {
    this.router.navigate(['/admin/orders/edit/'+id]);
  }
  public changeFilter() {
    this.loading = true;
    this.parameters.status = this.filterForm.controls.status.value;
    this.parameters.date = this.filterForm.controls.date.value;
    console.log(this.parameters);
    this.getCount();
  }
  public onPageFired(event: any) {
    this.loading = true;
    this.currentPage = event;
    this.pageSize = this.pageSize;
    this.getPeriods();
  }

}
