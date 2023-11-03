import { Component, OnInit, TemplateRef, ViewChild, HostListener } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { validate, clean, format } from 'rut.js';
import { Router } from '@angular/router';
import { UtilService } from 'src/app/shared/services/util.service';
import { ProductWithData } from 'src/app/shared/model/product-with-data';
import { ConstantService } from 'src/app/shared/services/constant.service';
import { OfferService } from 'src/app/shared/services/offer.service';
import { ReportService } from '../report.service';
//import { OrdersEditComponent } from './orders-edit/orders-edit.component';
declare var require;
const Swal = require('sweetalert2');

@Component({
  selector: 'app-products-report',
  templateUrl: './products-report.component.html',
  styleUrls: ['./products-report.component.scss'],
  providers: [ReportService]
})
export class ProductsReportComponent implements OnInit {
  
  private subscription: Subscription = new Subscription();
  public closeResult: string;
  public modalOpen: boolean = false;
  public pageSize: number = ConstantService.paginationDesktop;
  public currentPage: number = 0;
  public totalElements: number;
  public profile =  JSON.parse(localStorage.getItem('profile'));
  public listView: boolean = true;
  public loading: boolean = true;
  public col: string = '3';
  public filterForm: FormGroup;
  public periods: string[] = [];
  public parameters: {date: string, status: string} = {
    date: "",
    status: ""
  }
  public screenType: string = "";
  public filterHidden: boolean = false;
  public filterButton: string = "Filtrar";
  private intervalsId: number[] = [];
  public products: ProductWithData[] = [];
  
  //@ViewChild("quickViewOrdersEdit") QuickViewOrdersEdit: OrdersEditComponent;

  constructor(
    public formBuilder: FormBuilder,
    private router: Router,
    private utilSrv: UtilService,
    private srv: ReportService,
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
      this.filterForm = this.formBuilder.group({
        status: "",
        date: ""
      });
      this.parameters.date = (new Date()).toISOString().
      replace(/T/, ' ').      // replace T with a space
      replace(/\..+/, '')     // delete the dot and everything after
      this.getPeriods();
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
    this.getCount();
  }
  private haveAccess() {
    let permissions = JSON.parse(localStorage.getItem("profile")).privilege;
    if (permissions) {
        let access = permissions.filter((perm: string) => {
            return perm === ConstantService.PERM_REPORTES_LECTURA;
        });
        return access.length > 0;
    } else {
        return false;
    }
  }
  private getCount() {
    this.subscription.add(this.srv.countProductsReport(this.parameters).subscribe(
        response => {
            console.log(response);
            this.totalElements = response.count;
            this.getProducts();
        }, error => {
            console.log(error);
            this.loading = false;
        }
    ));
  }
  private getProducts() {
    this.subscription.add(this.srv.findProductsReport(this.currentPage, this.parameters).subscribe(
        response => {
            console.log(response);
            this.products = response;
            this.loading = false;
        }, error => {
            console.log(error);
            this.loading = false;
        }
    ));
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
  public changeFilter() {
    this.loading = true;
    this.parameters.status = this.filterForm.controls.status.value;
    this.parameters.date = this.filterForm.controls.date.value;
    console.log(this.parameters);
    this.getCount();
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
