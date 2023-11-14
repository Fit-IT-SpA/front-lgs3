import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbTooltipConfig } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators, FormGroup, FormArray } from '@angular/forms';
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
import { mobileValidator, numberValidator } from 'src/app/shared/validators/form-validators';
import { Product } from 'src/app/shared/model/product.model';

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
  public profile =  JSON.parse(localStorage.getItem('profile'));
  public companiesTitle = this.profile.role.slug == 'taller' ? 'Talleres' : this.profile.role.slug == 'comercio' ? 'Comercios' : 'Negocios';
  public url: ArrayBuffer | string;
  public orderAdd: OrderAdd;
  public order: Order;
  public firstFormGroup: FormGroup;
  public secondFormGroup: FormGroup;
  public thirdFormGroup: FormGroup;
  public companies: Companies[];
  public filePath: string;
  public imgFile: any;
  public loading: boolean = true;
  public loadingImg: boolean = false;
  public makesFilter: { value: string, label: string, job: string }[] = [];
  public modelFilter: { value: string, label: string, job: string }[] = [];
  public yearFilter: { value: string, label: string, job: string }[] = [];
  public billingTypes: {title: string, slug: string, check: boolean}[] = [];
  public regionFilter: { value: string, label: string, job: string }[] = [];
  public communeFilter: { value: string, label: string, job: string }[] = [];
  public counter: number[] = [1];
  public disabledCommuneFilter: boolean = false;
  public disabledModelFilter: boolean = false;
  public disabledYearFilter: boolean = false;
  public placeholderSecondForm: string = '';

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private userSrv: UserService,
    private srv: OrderService,
    private router: Router,
    public toster: ToastrService,
    private companiesSrv: CompaniesService) {
        this.firstFormGroup = this.fb.group({
          brand: [null, [Validators.required]],
          model: [null, [Validators.required]],
          chassis: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(40)]],
          photo: ['', [Validators.required]],
          year: [null, [Validators.required]],
        });
        this.firstFormGroup.get('model').disable();
        this.firstFormGroup.get('year').disable();
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
        this.thirdFormGroup = this.fb.group({
          products: this.fb.array([
            this.fb.group({
              description: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(40)]],
              qty: [1, [Validators.required]],
            })
          ])
        });
        if (this.companies[0].status === 0) {
          this.placeholderSecondForm = (this.companies[0].billingType === 'boleta') ? '' : 'de empresa';
          this.secondFormGroup = this.fb.group({
            rut: [format(this.companies[0].rut), [Validators.required]],
            billingType: [this.companies[0].billingType, [Validators.required]],
            name: [(this.companies[0].billingType === 'boleta') ? this.profile.name: '', [Validators.required,Validators.maxLength(18)]],
            direction: ['', [Validators.required,Validators.maxLength(140)]],
            region: [null, [Validators.required]],
            commune: [null, [Validators.required]],
            phone: ['', [Validators.required,Validators.minLength(9),Validators.maxLength(9),mobileValidator,numberValidator]],
          });
          this.getRegion();
        } else {
          this.secondFormGroup = this.fb.group({
            rut: [this.companies[0].rut, Validators.required],
          })
          this.getVehicleListMake();
        }
        
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
  private getRegion() {
    this.secondFormGroup.get('commune').disable();
    this.subscription.add(this.companiesSrv.findLocationsRegion().subscribe(
      response => {
        console.log(response);
        for (let location of response) {
          this.regionFilter.push({
            value: location.region,
            label: location.region,
            job: ''
          });
        }
        this.getBilling();
      }, error => {
        console.log(error);
      }
    ));
  }
  private getBilling() {
    this.billingTypes.push({title: 'Factura', slug: 'factura', check: (this.companies[0].billingType === 'factura') ? true : false});
    this.billingTypes.push({title: 'Boleta', slug: 'boleta', check: (this.companies[0].billingType === 'boleta') ? true : false});
    this.secondFormGroup.controls.billingType.setValue(this.companies[0].billingType);
    console.log(this.billingTypes);
    this.getVehicleListMake();
  }
  public async onChangeRegionFilter() {
    this.disabledCommuneFilter = true;
    this.secondFormGroup.controls.commune.setValue(null);
    this.secondFormGroup.get('commune').disable();
    this.communeFilter = [];
    try {
      const response: {commune: string}[] = await this.companiesSrv.findLocationsCommuneByRegion(this.secondFormGroup.controls.region.value.value).toPromise();
      if (response && response.length > 0) {
        for (let location of response) {
          this.communeFilter.push({
            value: location.commune,
            label: location.commune,
            job: ''
          });
        }
        this.disabledCommuneFilter = false;
        this.secondFormGroup.get('commune').enable();
      }
    } catch (error) {
      console.log(error);
    }
  }
  public onClearRegionFilter() {
    this.disabledCommuneFilter = false;
    this.secondFormGroup.controls.commune.setValue(null);
    this.secondFormGroup.get('commune').disable();
    this.communeFilter = [];
  }
  public clickBilling(slug: string) {
    this.secondFormGroup.controls.billingType.setValue(slug);
    if (slug === 'boleta') {
      this.secondFormGroup.controls.name.setValue(this.profile.name);
    } else {
      this.secondFormGroup.controls.name.setValue("");
    }
  }
  public async onChangeMakeFilter() {
    //console.log("onChangeMakeFilter");
    this.disabledModelFilter = true;
    this.firstFormGroup.controls.model.setValue(null);
    this.firstFormGroup.controls.year.setValue(null);
    this.firstFormGroup.get('model').disable();
    this.firstFormGroup.get('year').disable();
    this.modelFilter = [];
    this.yearFilter = [];
    try {
      const response: {model: string}[] = await this.companiesSrv.findVehicleListModelByMake(this.firstFormGroup.controls.brand.value.value).toPromise();
      if (response && response.length > 0) {
        for (let vehicle of response) {
          this.modelFilter.push({
            value: vehicle.model,
            label: vehicle.model,
            job: ''
          });
        }
        console.log(this.modelFilter);
        this.disabledModelFilter = false;
        this.firstFormGroup.get('model').enable();
      }
    } catch (error) {
      console.log(error);
    }
  }
  public onClearMakeFilter() {
    this.disabledModelFilter = false;
    this.firstFormGroup.controls.model.setValue(null);
    this.firstFormGroup.controls.year.setValue(null);
    this.firstFormGroup.get('model').disable();
    this.firstFormGroup.get('year').disable();
    this.modelFilter = [];
    this.yearFilter = [];
  }
  public increment(i: number) {
    this.counter[i] += 1;
    const control = this.thirdFormGroup.get('products') as FormArray;
    const item = control.at(i);
    item.get("qty").setValue(this.counter[i]);
    //console.log(this.productsAddFormGroup.controls);
  }

  public decrement(i: number) {
    if (this.counter[i] > 1) {
      this.counter[i] -= 1;
      const control = this.thirdFormGroup.get('products') as FormArray;
      const item = control.at(i);
      item.get("qty").setValue(this.counter[i]);
    }
  }
  public async onChangeModelFilter() {
    //console.log("onChangeModelFilter");
    this.disabledYearFilter = true;
    this.firstFormGroup.controls.year.setValue(null);
    this.firstFormGroup.get('year').disable();
    this.yearFilter = [];
    try {
      const response: {year: string}[] = await this.companiesSrv.findVehicleListYearByMakeModel(this.firstFormGroup.controls.brand.value.value, this.firstFormGroup.controls.model.value.value).toPromise();
      if (response && response.length > 0) {
        for (let vehicle of response) {
          this.yearFilter.push({
            value: vehicle.year,
            label: vehicle.year,
            job: ''
          });
        }
        this.disabledYearFilter = false;
        this.firstFormGroup.get('year').enable();
      }
    } catch (error) {
      console.log(error);
    }
  }
  public onClearModelFilter() {
    this.disabledYearFilter = false;
    this.firstFormGroup.controls.year.setValue(null);
    this.firstFormGroup.get('year').disable();
    this.yearFilter = [];
  }
  add() {
    this.loading = true;
    console.log(this.createOrder());
    this.subscription.add(this.srv.add(this.createOrder()).subscribe(
        response => {
            //console.log(response);
            this.toster.success('Felicitaciones! Tu pedido ya ha sido publicado. Ahora espera ofertas pronto! Revisa en tu sección Mis Pedidos');
            //this.product(response.id);
            this.goBack();
        },
        error => {
            this.loading = false;
            console.log(error);
            this.toster.error('No se pudo crear su Pedido :(');
        }
    ));
    
  }
  product(id: string) {
    console.log(id);
    this.router.navigate(['/admin/orders/'+id+'/products']);
  }
  public addProduct() {
    const control = this.thirdFormGroup.get('products') as FormArray;
    control.push(this.fb.group({
      description: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(40)]],
      qty: [1, [Validators.required]],
    }));
    this.counter.push(1);
    console.log(this.thirdFormGroup);
  }
  public deleteProduct() {
    const control = this.thirdFormGroup.get('products') as FormArray;
    if (control.length > 1) { // Asegurarse de que siempre haya al menos un formulario
      control.removeAt(control.length - 1);
    }
    this.counter.pop();
  }
  createOrder() : {order: OrderAdd, products: Product[], company: Companies}{
    const control = this.thirdFormGroup.get('products') as FormArray;
    return {
        order: {
          idOrder: (new Date().getTime()).toString(),
          createBy: this.profile.email,
          company: clean(this.secondFormGroup.controls.rut.value),
          status: 1,
          //closingDate: this.createClosingDateTime(),
          brand: (this.firstFormGroup.controls.brand.value) ? this.firstFormGroup.controls.brand.value.value : '',
          model: (this.firstFormGroup.controls.model.value) ? this.firstFormGroup.controls.model.value.value : '',
          year: (this.firstFormGroup.controls.year.value) ? this.firstFormGroup.controls.year.value.value : '',
          //engine: '',
          chassis: (this.firstFormGroup.controls.chassis.value) ? this.firstFormGroup.controls.chassis.value : '',
          photo: (this.firstFormGroup.controls.photo.value) ? this.firstFormGroup.controls.photo.value : '',
          closingDate: new Date(),
        },
        products: control.value,
        company: {
          rut: clean(this.secondFormGroup.controls.rut.value),
          billingType: (this.secondFormGroup.controls.billingType) ? this.secondFormGroup.controls.billingType.value : '',
          createBy: this.profile.email,
          type: this.profile.role.slug,
          name: (this.secondFormGroup.controls.name) ? this.secondFormGroup.controls.name.value : '',
          status: this.companies[0].status,
          direction: (this.secondFormGroup.controls.direction) ? this.secondFormGroup.controls.direction.value : '',
          region: (this.secondFormGroup.controls.region) ? this.secondFormGroup.controls.region.value.value : '',
          commune: (this.secondFormGroup.controls.commune) ? this.secondFormGroup.controls.commune.value.value : '',
          phone: (this.secondFormGroup.controls.phone) ? this.secondFormGroup.controls.phone.value : '',
          accountNumber: -1,
          accountType: '',
          bank: '',
          make: [],
        }
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
          this.filePath = archivo.files[0].originalname;
          this.url = this.filePath;
          this.firstFormGroup.controls.photo.setValue(this.url);
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
  public onFocusRut() {
    this.secondFormGroup.controls.rut.markAsPristine();
    if (this.secondFormGroup.controls.rut.value != "") {
      this.secondFormGroup.controls.rut.setValue(
        clean(this.secondFormGroup.controls.rut.value)
      );
    }
  }

  public onBlurRut() {
    if (this.secondFormGroup.controls.rut.value != "") {
      if (
        this.secondFormGroup.controls.rut.value.length > 3 &&
        validate(this.secondFormGroup.controls.rut.value)
      ) {
        this.secondFormGroup.controls.rut.setErrors(null);
        this.secondFormGroup.controls.rut.setValue(
          format(this.secondFormGroup.controls.rut.value)
        );
      } else {
        this.secondFormGroup.controls.rut.setErrors({ rut: true });
      }
      this.secondFormGroup.controls.rut.markAsDirty();
    }
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
  /**
   * metodo que se dispara al hacer click en un botón radio
   * guarda el rut dentro del formulario
   * @param rut rut del taller que hará el pedido
   */
  clickCompany(rut: string) {
    this.secondFormGroup.controls.rut.setValue(rut);
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
