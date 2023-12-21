import { Component, OnInit, TemplateRef, ViewChild, HostListener } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { validate, clean, format } from 'rut.js';
import { Router } from '@angular/router';
import { UtilService } from 'src/app/shared/services/util.service';
import { ConstantService } from 'src/app/shared/services/constant.service';
import { CompanyAdminService } from './company-admin.service';
import { Companies } from 'src/app/shared/model/companies.model';
declare var require;
const Swal = require('sweetalert2');

@Component({
  selector: 'app-company-admin',
  templateUrl: './company-admin.component.html',
  styleUrls: ['./company-admin.component.scss'],
  providers: [CompanyAdminService]
})
export class CompanyAdminComponent implements OnInit {
  
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
  parameters: { rut: string, name: string, status: string, type: string } = {
    rut: '',
    name: '',
    status:'',
    type:''
  }
  public screenType: string = "";
  public filterHidden: boolean = false;
  public filterButton: string = "Filtrar";
  private intervalsId: number[] = [];
  public companies: Companies[] = [];
  
  //@ViewChild("quickViewOrdersEdit") QuickViewOrdersEdit: OrdersEditComponent;

  constructor(
    public formBuilder: FormBuilder,
    private router: Router,
    private utilSrv: UtilService,
    private srv: CompanyAdminService,
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
        name: "",
        rut: "",
        status: "",
        type: ""
      });
      this.getCount();
    }
  }
  private haveAccess() {
    let permissions = JSON.parse(localStorage.getItem("profile")).privilege;
    if (permissions) {
        let access = permissions.filter((perm: string) => {
            return perm === ConstantService.PERM_NEGOCIOS_ADMIN_LECTURA;
        });
        return access.length > 0;
    } else {
        return false;
    }
  }
  private getCount() {
    this.subscription.add(this.srv.count(this.parameters).subscribe(
        response => {
            this.totalElements = response.count;
            this.getCompanies();
        }, error => {
            console.log(error);
            this.loading = false;
        }
    ));
  }
  private getCompanies() {
    this.subscription.add(this.srv.findCompanies(this.currentPage, this.parameters).subscribe(
        response => {
            this.companies = response;
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
    this.parameters.rut = this.filterForm.controls.rut.value;
    this.parameters.name = this.filterForm.controls.name.value;
    this.parameters.status = this.filterForm.controls.status.value;
    this.parameters.type = this.filterForm.controls.type.value;
    this.getCount();
  }
  public onCellClick(id: string) {
    console.log(id);
    this.router.navigate(['/admin/users/company/view/'+id]);
  }
  public ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
    for (let intervalId of this.intervalsId) {
      clearInterval(intervalId);
    }
  }
}
