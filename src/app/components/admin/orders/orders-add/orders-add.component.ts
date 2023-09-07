import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ServiceTypeService } from '../../../../shared/services/service-type.service';
import { UserService } from '../../../../shared/services/user.service';
import { CompaniesService } from '../../companies/companies.service';
import { User } from '../../../../shared/model/user';
import { Order } from '../../../../shared/model/order.model';
import { OrderAdd } from '../../../../shared/model/order-add.model';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { validate, clean, format } from 'rut.js';
import { Companies } from 'src/app/shared/model/companies.model';
import { OrderService } from 'src/app/shared/services/order.service';
import { Router } from '@angular/router';
import { ConstantService } from 'src/app/shared/services/constant.service';
import { numberValidator } from 'src/app/shared/validators/form-validators';

@Component({
  selector: 'app-orders-add',
  templateUrl: './orders-add.component.html',
  styleUrls: ['./orders-add.component.scss'],
  providers: [ServiceTypeService, UserService, CompaniesService, OrderService],
})
export class OrdersAddComponent implements OnInit {
  
  @ViewChild("quickViewOrdersAdd", { static: false }) QuickViewOrdersAdd: TemplateRef<any>;
  private subscription: Subscription = new Subscription();
  public closeResult: string;
  public modalOpen: boolean = false;
  public companiesForm: FormGroup;
  public profile =  JSON.parse(localStorage.getItem('profile'));
  public companiesTitle = this.profile.role.slug == 'taller' ? 'Talleres' : this.profile.role.slug == 'comercio' ? 'Comercios' : 'Negocios';
  public url: ArrayBuffer | string;
  private user: User;
  public orderAdd: OrderAdd;
  public order: Order;
  public formOrder: FormGroup;
  public companies: Companies[];
  public counter: number = 1;
  public filePath: string;
  public imgFile: any;
  public loading: boolean = true;
  public loadingImg: boolean = false;
  public makesFilter: { value: string, label: string, job: string }[] = [];
  public modelFilter: { value: string, label: string, job: string }[] = [];
  public yearFilter: { value: string, label: string, job: string }[] = [];
  public disabledModelFilter: boolean = false;
  public disabledYearFilter: boolean = false;

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private userSrv: UserService,
    private srv: OrderService,
    private router: Router,
    public toster: ToastrService,
    private companiesSrv: CompaniesService) {
        this.formOrder = this.fb.group({
            company: ['', Validators.required],
            brand: [null, [Validators.required]],
            model: [null, [Validators.required]],
            chassis: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(40)]],
            photo: ['', [Validators.required]],
            year: [null, [Validators.required]],
            //engine: ['', Validators.required],
        });
        this.formOrder.get('model').disable();
        this.formOrder.get('year').disable();
     }

  ngOnInit(): void {
    if (this.haveAccess()) {
      this.getCompany();
    } else {
      this.router.navigate(['/admin/unauthorized']);
    }
  }
  private haveAccess() {
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
  private getCompany() {
    this.subscription.add(this.companiesSrv.findByEmail(this.profile.email).subscribe(
      (response) => {
        console.log(response);
        this.companies = response;
        this.formOrder.controls.company.setValue(this.companies[0].rut);
        this.getVehicleListMake();
      }, (error) => {
        console.log(error);
        this.toster.error('Se ha producido un error al intentar buscar los '+this.companiesTitle+' del usuario');
        this.loading = false;
      }
    ));
  }
  private getVehicleListMake() {
    this.subscription.add(this.companiesSrv.findVehicleListMake().subscribe(
      response => {
        for (let vehicle of response) {
          this.makesFilter.push({
            value: vehicle.make,
            label: vehicle.make,
            job: ''
          })
        }
        this.loading = false;
      }, (error) => {
        console.log(error);
      }
    ));
  }
  public async onChangeMakeFilter() {
    console.log("onChangeMakeFilter");
    this.disabledModelFilter = true;
    this.formOrder.controls.model.setValue(null);
    this.formOrder.controls.year.setValue(null);
    this.formOrder.get('model').disable();
    this.formOrder.get('year').disable();
    this.modelFilter = [];
    this.yearFilter = [];
    try {
      const response: {model: string}[] = await this.companiesSrv.findVehicleListModelByMake(this.formOrder.controls.brand.value.value).toPromise();
      if (response && response.length > 0) {
        for (let vehicle of response) {
          this.modelFilter.push({
            value: vehicle.model,
            label: vehicle.model,
            job: ''
          });
        }
        this.disabledModelFilter = false;
        this.formOrder.get('model').enable();
      }
    } catch (error) {
      console.log(error);
    }
  }
  public onClearMakeFilter() {
    this.disabledModelFilter = false;
    this.formOrder.controls.model.setValue(null);
    this.formOrder.controls.year.setValue(null);
    this.formOrder.get('model').disable();
    this.formOrder.get('year').disable();
    this.modelFilter = [];
    this.yearFilter = [];
  }
  public async onChangeModelFilter() {
    console.log("onChangeModelFilter");
    this.disabledYearFilter = true;
    this.formOrder.controls.year.setValue(null);
    this.formOrder.get('year').disable();
    this.yearFilter = [];
    try {
      const response: {year: string}[] = await this.companiesSrv.findVehicleListYearByMakeModel(this.formOrder.controls.brand.value.value, this.formOrder.controls.model.value.value).toPromise();
      if (response && response.length > 0) {
        for (let vehicle of response) {
          this.yearFilter.push({
            value: vehicle.year,
            label: vehicle.year,
            job: ''
          });
        }
        this.disabledYearFilter = false;
        this.formOrder.get('year').enable();
      }
    } catch (error) {
      console.log(error);
    }
  }
  public onClearModelFilter() {
    this.disabledYearFilter = false;
    this.formOrder.controls.year.setValue(null);
    this.formOrder.get('year').disable();
    this.yearFilter = [];
  }
  /**
   * open Dialog CUBA
   * @param user 
   */
  /*openModal(user: User) {
    this.user = user;
    this.companies = user.companies;
    //console.log(this.user);
    //console.log(this.companies);
    this.modalOpen = true;
      this.modalService.open(this.QuickViewOrdersAdd, { 
        size: 'lg',
        ariaLabelledBy: 'modal-basic-title',
        centered: true,
        windowClass: 'Quickview' 
      }).result.then((result) => {
        `Result ${result}`
      }, (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
  }*/
  add() {
    this.orderAdd = this.createOrder();
    console.log(this.orderAdd);
    this.subscription.add(this.srv.add(this.orderAdd).subscribe(
        response => {
            //console.log(response);
            this.toster.success('Se creó correctamente su pedido');
            this.formOrder.controls.company.setValue('');
            this.product(response.id);
        },
        error => {
            console.log(error);
            this.toster.error('No se pudo crear su Pedido :(');
        }
    ));
    
  }
  product(id: string) {
    console.log(id);
    this.router.navigate(['/admin/orders/'+id+'/products']);
  }
  createOrder() {
    return {
        idOrder: (new Date().getTime()).toString(),
        createBy: this.profile.email,
        company: this.formOrder.controls.company.value,
        status: 0,
        //closingDate: this.createClosingDateTime(),
        brand: (this.formOrder.controls.brand.value) ? this.formOrder.controls.brand.value.value : '',
        model: (this.formOrder.controls.model.value) ? this.formOrder.controls.model.value.value : '',
        year: (this.formOrder.controls.year.value) ? this.formOrder.controls.year.value.value : '',
        //engine: '',
        chassis: (this.formOrder.controls.chassis.value) ? this.formOrder.controls.chassis.value : '',
        photo: (this.formOrder.controls.photo.value) ? this.formOrder.controls.photo.value : '',
        closingDate: new Date(),
    }

  }
  fileChangeEvent(event: any) {
    this.loadingImg = true;
    console.log(event.target.files[0]);
    const file = event.target.files[0];
    var mimeType = event.target.files[0].type;
    console.log(mimeType);
    if (mimeType.match(/image\/*/) == null) {
      this.loadingImg = false;
      this.toster.error("Formato de imagen no soportado. Formatos soportados: png, jpg, jpeg");
    } else {
      this.imgFile = file;
      let possible = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
      var ramdomName = '';
      for (var i = 30; i > 0; --i) ramdomName += possible[Math.floor(Math.random() * possible.length)];
      var fileExtension = this.imgFile.name.slice(this.imgFile.name.lastIndexOf('.') - this.imgFile.name.length);
      var newFileName = ramdomName + fileExtension;
      const formData = new FormData();

      formData.append("file", this.imgFile, newFileName);
      this.subscription.add(this.srv.uploadFile(formData).subscribe(
        response => {
          this.loadingImg = false;
          let archivo = response;
          this.filePath = this.srv.apiUrl + "/files/" + archivo.files[0].originalname;
          this.url = this.filePath;
          this.formOrder.controls.photo.setValue(this.url);
          this.toster.success('¡Imagen subida correctamente!');
        }, error => {
            console.log(error);
            this.toster.error('Se ha producido un error al intentar cargar la imagen');
            this.loadingImg = false;
        }
      ));
    }
  }
  public goBack() {
    this.router.navigate(['/admin/orders']);
  }
  /*createClosingDateTime() {
    let date: Date = new Date(
        this.thirdFormGroup.controls.closingDate.value.year, 
        this.thirdFormGroup.controls.closingDate.value.month - 1, 
        this.thirdFormGroup.controls.closingDate.value.day,
        this.thirdFormGroup.controls.closingTime.value.hour, this.thirdFormGroup.controls.closingTime.value.minute, 0, 0);
    date.setSeconds(0);
    date.setHours(date.getHours()-3);
    return date;
  }*/
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
  /**
   * metodo que se dispara al hacer click en un botón radio
   * guarda el rut dentro del formulario
   * @param rut rut del taller que hará el pedido
   */
  clickCompany(rut: string) {
    this.formOrder.controls.company.setValue(rut);
    //console.log(this.formOrder.controls.company.value);
  }
  public finish() {
    this.toster.success('Successfully Registered')
  }
  /*checkImageFile() {
    const inputNode: any = document.querySelector('#file');
    const fileTemp = inputNode.files[0];
    var mimeType = fileTemp.type;*/
    //if (mimeType.match(/image\/*/) == null) {
      /*this.toster.error('Formato de imagen no soportado. Formatos soportados: png, jpg, jpeg', 'X');
      return;
    } else {
      this.toster.success('¡Imagen subida correctamente!');
      this.imgFile = fileTemp;
      console.log(this.imgFile);
      this.thirdFormGroup.controls.photo.setValue(this.imgFile.name);
      return;
    }

  }*/

  /*uploadFile() {
    
    const file = this.imgFile;

    if (file) {
      console.log(file);
      let possible = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
      var ramdomName = '';
      for (var i = 30; i > 0; --i) ramdomName += possible[Math.floor(Math.random() * possible.length)];
      var fileExtension = file.name.slice(file.name.lastIndexOf('.') - file.name.length);
      var newFileName = ramdomName + fileExtension;

      const formData = new FormData();

      formData.append("file", file, newFileName);
      this.subscription.add(this.srv.uploadFile(formData).subscribe(
        response => {
          let archivo = response;
          this.filePath = this.srv.apiUrl + "/files/" + archivo.files[0].originalname;
          console.log(this.filePath);
          this.add();
        }, error => {
            this.toster.error('Se ha producido un error al intentar cargar la imagen');
        }
      ));

    }
  }*/

}
