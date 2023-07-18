import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ServiceTypeService } from '../../../../shared/services/service-type.service';
import { UserService } from '../../../../shared/services/user.service';
import { CompaniesService } from '../../../../shared/services/companies.service';
import { User } from '../../../../shared/model/user';
import { Order } from '../../../../shared/model/order.model';
import { OrderAdd } from '../../../../shared/model/order-add.model';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { validate, clean, format } from 'rut.js';
import { Companies } from 'src/app/shared/model/companies.model';
import { OrderService } from 'src/app/shared/services/order.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-orders-edit',
  templateUrl: './orders-edit.component.html',
  styleUrls: ['./orders-edit.component.scss'],
  providers: [ServiceTypeService, UserService, CompaniesService, OrderService],
})
export class OrdersEditComponent implements OnInit {
  
  @ViewChild("quickViewOrdersEdit", { static: false }) QuickViewOrdersEdit: TemplateRef<any>;
  private subscription: Subscription = new Subscription();
  public closeResult: string;
  public modalOpen: boolean = false;
  public companiesForm: FormGroup;
  public perfil =  JSON.parse(localStorage.getItem('profile'));
  private user: User;
  private order: OrderAdd;
  public firstFormGroup: FormGroup;
  public secondFormGroup: FormGroup;
  public thirdFormGroup: FormGroup;
  public companies: Companies[];
  public counter: number = 1;
  public filePath: string;
  public imgFile: any;

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private userSrv: UserService,
    private srv: OrderService,
    private router: Router,
    public toster: ToastrService,) {
        this.firstFormGroup = this.fb.group({
            company: ['', Validators.required],
          });
          this.secondFormGroup = this.fb.group({
            brand: ['', Validators.required],
            model: ['', Validators.required],
            year: ['', Validators.required],
            engine: ['', Validators.required],
          });
          this.thirdFormGroup = this.fb.group({
            productName: ['', Validators.required],
            productBrand: ['', Validators.required],
            productDetails: ['', Validators.required],
            limitPrice: ['', Validators.required],
            qty: [this.counter, Validators.required],
            closingDate: ['', Validators.required],
            closingTime: [{hour: new Date().getHours(), minute: new Date().getMinutes()}, Validators.required],
            photo: ['', Validators.required],
          })
     }

  ngOnInit(): void {
  }
  /**
   * open Dialog CUBA
   * @param user 
   */
  openModal(order: Order, companies: Companies[]) {
    this.order = order;
    this.companies = companies;
    this.setValuesForm();
    console.log(this.order);
    this.modalOpen = true;
      this.modalService.open(this.QuickViewOrdersEdit, { 
        size: 'lg',
        ariaLabelledBy: 'modal-basic-title',
        centered: true,
        windowClass: 'Quickview' 
      }).result.then((result) => {
        `Result ${result}`
      }, (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
  }

  add() {
    this.order = this.createOrder();
    this.subscription.add(this.srv.add(this.order).subscribe(
        response => {
            //console.log(response);
            this.toster.success('Se creo correctamente su Pedido!!');
            this.firstFormGroup.controls.company.setValue('');
            this.secondFormGroup.controls.brand.setValue('');
            this.secondFormGroup.controls.model.setValue('');
            this.secondFormGroup.controls.year.setValue('');
            this.secondFormGroup.controls.engine.setValue('');
            this.thirdFormGroup.controls.productName.setValue('');
            this.thirdFormGroup.controls.productBrand.setValue('');
            this.thirdFormGroup.controls.productDetails.setValue('');
            this.thirdFormGroup.controls.limitPrice.setValue('');
            this.thirdFormGroup.controls.closingDate.setValue('');
            this.thirdFormGroup.controls.closingTime.setValue({hour: new Date().getHours(), minute: new Date().getMinutes()});
            this.thirdFormGroup.controls.photo.setValue('');
            this.modalService.dismissAll();
        },
        error => {
            console.log(error);
            this.toster.error('No se pudo crear su Pedido :(');
        }
    ));
    
  }
  createOrder() {
    return {
      idOrder: (new Date().getTime()).toString(),
      createBy: this.perfil.email,
      company: this.firstFormGroup.controls.company.value,
      products: [],
      status: 1,
      //closingDate: this.createClosingDateTime(),
      closingDate: new Date(),
      photo: this.filePath,
    }

  }
  createClosingDateTime() {
    let date: Date = new Date(
        this.thirdFormGroup.controls.closingDate.value.year, 
        this.thirdFormGroup.controls.closingDate.value.month - 1, 
        this.thirdFormGroup.controls.closingDate.value.day,
        this.thirdFormGroup.controls.closingTime.value.hour, this.thirdFormGroup.controls.closingTime.value.minute, 0, 0);
    date.setSeconds(0);
    date.setHours(date.getHours()-3);
    return date;
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
    this.firstFormGroup.controls.company.setValue(rut);
    //console.log(this.firstFormGroup.controls.company.value);
  }
  public finish() {
    this.toster.success('Successfully Registered')
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
  public increment() {
    this.counter += 1;
    this.thirdFormGroup.controls.closingDate.setValue(this.counter);
  }

  public decrement() {
    if (this.counter > 1) {
        this.counter -= 1;
        this.thirdFormGroup.controls.closingDate.setValue(this.counter);
    }
  }
  checkImageFile() {
    const inputNode: any = document.querySelector('#file');
    const fileTemp = inputNode.files[0];
    var mimeType = fileTemp.type;
    if (mimeType.match(/image\/*/) == null) {
      this.toster.error('Formato de imagen no soportado. Formatos soportados: png, jpg, jpeg', 'X');
      return;
    } else {
      this.toster.success('¡Imagen subida correctamente!');
      this.imgFile = fileTemp;
      console.log(this.imgFile);
      this.thirdFormGroup.controls.photo.setValue(this.imgFile.name);
      return;
    }

  }

  uploadFile() {
    
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
  }
  private setValuesForm() {
    /*this.firstFormGroup.controls.company.setValue(this.order.company);
    this.secondFormGroup.controls.brand.setValue(this.order.sparePart.brand);
    this.secondFormGroup.controls.model.setValue(this.order.sparePart.model);
    this.secondFormGroup.controls.year.setValue(this.order.sparePart.year);
    this.secondFormGroup.controls.engine.setValue(this.order.sparePart.engine);
    this.thirdFormGroup.controls.productName.setValue(this.order.productName);
    this.thirdFormGroup.controls.productBrand.setValue(this.order.productBrand);
    this.thirdFormGroup.controls.productDetails.setValue(this.order.productDetails);
    this.thirdFormGroup.controls.limitPrice.setValue(this.order.limitPrice);
    let date = {
        year: new Date(this.order.closingDate).getFullYear(),
        month: new Date(this.order.closingDate).getMonth() + 1,
        day: new Date(this.order.closingDate).getDate(),
    }
    let time = {
        hour: new Date(this.order.closingDate).getHours(),
        minute: new Date(this.order.closingDate).getMinutes()
    }
    this.thirdFormGroup.controls.closingDate.setValue(date);
    this.thirdFormGroup.controls.closingTime.setValue(time);
    this.thirdFormGroup.controls.photo.setValue(this.order.photo);*/
  }

}
