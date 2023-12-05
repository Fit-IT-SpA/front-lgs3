import { Component, OnInit, HostListener, LOCALE_ID, inject } from '@angular/core';
import * as XLSX from 'xlsx'
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { trxLogs } from '../../../../shared/model/trx-logs';
import { Session } from '../../../../shared/model/session';
import { User } from '../../../../shared/model/user';
import { Router } from '@angular/router';
import { NgbDateStruct, NgbDate, NgbCalendar, NgbDatepickerConfig, NgbDateParserFormatter} from '@ng-bootstrap/ng-bootstrap';
//SERVICES
import { ConstantService } from '../../../../shared/services/constant.service';
import { TrxLogsService } from './trx-logs.service';
import { UtilService } from '../../../../shared/services/util.service';

@Component({
  selector: 'app-trx-logs',
  templateUrl: './trx-logs.component.html',
  styleUrls: ['./trx-logs.component.scss'],
  providers: [TrxLogsService],
})
export class trxLogsComponent implements OnInit {

  private subscription: Subscription = new Subscription();
  filterForm: FormGroup;
  logForm: FormGroup;
  loading: boolean = true;
  loadingSrv: boolean = true;
  currentPage:number = 0;
  totalElements:number;
  pageSize: number = ConstantService.paginationDesktop;
  screenType: string;
  profile: Session;
  logs: trxLogs[] = [];
  public modulesFilter: { value: string, label: string, job: string }[] = [];
  public trxTypesFilter: { value: string, label: string, job: string }[] = [];
  logsToExcel: trxLogs[] = [];
  disabledDownloadExcel: boolean = true;
  logsFilter: trxLogs[] = [];
  modules: string[] = [];
  allTrxTypes: {module: string, transaction: string}[] = [];
  trxTypes: string[] = [];
  users: User[] = [];
  numbersId: number[] = [-1, 0, 1, 2, 3];
  parameters: { name: string, module: string, trxType: string, details: string, dateLogStart: string, dateLogEnd: string } = {
    name: '',
    module: '',
    trxType: '',
    details: '',
    dateLogStart:'',
    dateLogEnd:''
  }
  parametersInput = {
    userId: '',
    module: '',
    trxType: '',
    details: '',
    createdAt: new Date,
    updatedAt: new Date
  }
  maxDate: Date;
  rut:string;
  agregar: boolean = false;
  advancedFilter: boolean = false; 
  access: boolean = false;
  dateLogStart: Date;
  dateLogEnd: Date;
  range = new FormGroup({
    start: new FormControl(null),
    end: new FormControl(null),
  });
  public disabledTrxTypeFilter: boolean = false;
  public filterHidden: boolean = false;
  public filterButton: string = "Filtrar";
  public listView: boolean = false;

  //Excel
  title = 'angular-app';
  fileName = 'ExcelSheet.xlsx';

  // DatePicker
  modelFooter: NgbDateStruct;
  hoveredDate: NgbDate | null = null;
  toDate: NgbDate | null = this.calendar.getToday();
  fromDate: NgbDate | null = this.calendar.getPrev(this.toDate, 'm', 1); // Rango máximo de un mes
  

  constructor(private router: Router, private srv: TrxLogsService, private calendar: NgbCalendar, private formatter: NgbDateParserFormatter,
    private snack: MatSnackBar, private utilSrv: UtilService, public formBuilder: FormBuilder) { 
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
  private haveAccess() {
    let permissions = JSON.parse(localStorage.getItem("profile")).privilege;
    this.rut = JSON.parse(localStorage.getItem("profile")).rut;
    console.log(permissions);
    let access = permissions.filter((perm: string) => {
      return perm === ConstantService.PERM_SISTEMA_LECTURA;
    });
    return access.length > 0;
  }

  ngOnInit(): void {
    let access = this.haveAccess();
    if (!access) {
      this.router.navigate(['/admin/unauthorized']);
    } else {
      this.access = access;
      this.profile = JSON.parse(localStorage.getItem("profile"));
      this.subscription.add(this.utilSrv.screenType$.subscribe(
        screen => {
          this.screenType = screen;
        }
      ));
    
      this.filterForm = this.formBuilder.group({
        name: [''],
        module: [null],
        trxType: [null],
        details: [''],
        dateLogStart: [''],
        dateLogEnd: ['']
      });
      this.filterForm.get('trxType').disable();
      /*this.logForm = this.formBuilder.group({
        userId: [''],
        module: [''],
        trxType: [''],
        details: ['']
      });*/
      this.filterForm.controls.dateLogStart.setValue(this.fromDate.year+'-'+String(this.fromDate.month).padStart(2, '0')+'-'+String(this.fromDate.day).padStart(2, '0')+'T00:00:00.000Z');
      this.filterForm.controls.dateLogEnd.setValue(this.toDate.year+'-'+String(this.toDate.month).padStart(2, '0')+'-'+String(this.toDate.day).padStart(2, '0')+'T23:59:59.999Z');
      this.parameters.dateLogStart = this.filterForm.controls.dateLogStart.value;
      this.parameters.dateLogEnd = this.filterForm.controls.dateLogEnd.value;
      this.getModules();
    }
  }

  private getCount() {
    this.subscription.add(this.srv.countWithFilter(this.parameters)
      .subscribe(
        response => {
          this.totalElements = response.count;
          console.log("this.totalElements");
          console.log(this.totalElements);
          this.find();
        },
        error => {
          this.loading = false;
          this.loadingSrv = false;
          this.snack.open('Se ha producido un error al intentar conseguir los logs.', 'X',
            { verticalPosition: 'top', duration: ConstantService.snackDuration }
          );
        }
      )
    );
  }

  private find() {
    this.subscription.add(this.srv.findWithParams(this.parameters, this.currentPage)
      .subscribe(
        response => {
          this.logs = response;
          console.log("this.logs");
          console.log(this.logs)
          //this.dataForExcel();
          this.loading = false;
          this.loadingSrv = false;
        },
        error => {
          this.loading = false;
          this.loadingSrv = false;
          this.snack.open('Se ha producido un error al intentar conseguir los datos.', 'X',
            { verticalPosition: 'top', duration: 5000 }
          );
        }
      )
    );
  }
  /**
   * Algoritmo para buscar todos los modulos y transacciones 
   * (Las transacciones dependen de modulos)
   */
  private getModulesAndTrxTypes() {
    
     this.subscription.add(this.srv.findWithParamsGroup()
      .subscribe(
        response => {
            console.log("getModulesAndTrxType()");
            console.log(response);
          let module = "";
          
          for(let i: number = 0 ; i < response.length ; i++) {
              
              if(module == ""){
                  module = response[i]._id.module;
                  this.modules.push(module);
              } else {
                  if(!this.modules.includes(module)){
                      this.modules.push(module);
                  }
                  module = response[i]._id.module;
              }

               this.allTrxTypes.push({
                module: module, 
                transaction: response[i]._id.trxType
              });
          }
          this.getCount();
        },
        error => {
          this.loading = false;
          this.loadingSrv = false;
          this.snack.open('Se ha producido un error al intentar conseguir los datos.', 'X',
            { verticalPosition: 'top', duration: 5000 }
          );
        }
      )
    );
  }
  private getModules() {
    this.subscription.add(this.srv.findModules()
      .subscribe(
        response => {
            for (let trxLog of response) {
                this.modulesFilter.push({
                  value: trxLog._id.module,
                  label: trxLog._id.module + ', total: '+trxLog.total,
                  job: ''
                });
            }
            console.log(this.modulesFilter);
            this.getCount();
        },
        error => {
          this.loading = false;
          this.loadingSrv = false;
          this.snack.open('Se ha producido un error al intentar conseguir los datos.', 'X',
            { verticalPosition: 'top', duration: 5000 }
          );
        }
      )
    );
  }
  private dataForExcel() {
    this.subscription.add(this.srv.findWithParamsToExcel(this.parameters)
      .subscribe(
        response => {
          this.logsToExcel = response;
          console.log("this.logsToExcel");
          console.log(this.logsToExcel);
          this.disabledDownloadExcel = false;
         // this.getModulesAndTrxTypes();
        },
        error => {
          this.loading = false;
          this.loadingSrv = false;
          this.snack.open('Se ha producido un error al intentar conseguir los datos.', 'X',
            { verticalPosition: 'top', duration: 5000 }
          );
        }
      )
    );
  }
  onChangeModuleFilter() {
    this.disabledTrxTypeFilter = true;
    this.trxTypesFilter = [];
    this.filterForm.controls.trxType.setValue(null);
    this.filterForm.get('trxType').disable();
    /*this.trxTypes = [];
    for (let trxTypes of this.allTrxTypes) {
      for(let module of this.filterForm.controls['module'].value) {
        if (module == trxTypes.module)
          this.trxTypes.push(trxTypes.transaction);
      }
    }*/
    if (this.filterForm.controls.module.value) {
        this.subscription.add(this.srv.findAllTrxTypesOfModule(this.filterForm.controls.module.value.value)
        .subscribe(
            response => {
                for (let trxLog of response) {
                    this.trxTypesFilter.push({
                    value: trxLog._id.trxType,
                    label: trxLog._id.trxType + ', total: '+trxLog.total,
                    job: ''
                    });
                }
                this.disabledTrxTypeFilter = false;
                this.filterForm.get('trxType').enable();
                console.log(this.trxTypesFilter);
            },
            error => {
            this.loading = false;
            this.loadingSrv = false;
            this.snack.open('Se ha producido un error al intentar conseguir los datos.', 'X',
                { verticalPosition: 'top', duration: 5000 }
            );
            }
        )
        );
    }
  }
  public onClearModuleFilter() {
    this.disabledTrxTypeFilter = false;
    this.filterForm.controls.trxType.setValue(null);
    this.filterForm.get('trxType').disable();
    this.trxTypesFilter = [];
  }

  onPageFired(event: any) {
    this.loading = true;
    this.currentPage = event;
    this.pageSize = this.pageSize;
    this.getCount();
  }

  add() {
    this.router.navigate(['/admin/users/user/add']);
  }

  canWrite() {
    let permissions = JSON.parse(localStorage.getItem("profile")).privilege;
    let access = permissions.filter((perm: string) => {
      return perm === ConstantService.PERM_SISTEMA_ESCRITURA;
    });
    return access.length > 0;
  }

  changeFilter() {
    this.disabledDownloadExcel = true;
    this.loadingSrv = true;
    this.parameters.name = this.filterForm.controls.name.value;
    this.parameters.module = (this.filterForm.controls.module.value) ? this.filterForm.controls.module.value.value : '';
    this.parameters.trxType = (this.filterForm.controls.trxType.value) ? this.filterForm.controls.trxType.value.value : '';
    this.parameters.details = this.filterForm.controls.details.value;
    this.parameters.dateLogStart = this.filterForm.controls.dateLogStart.value;
    this.parameters.dateLogEnd = this.filterForm.controls.dateLogEnd.value;
    console.log("this.parameters");
    console.log(this.parameters);
    this.getCount();
  }

  exportexcel(): void {
    const data: {'Módulo': string, 'Tipo transacción': string, 'Fecha': string, 'Detalles': string}[] = this.createTrxLogsModelExcel();
    // Crear una hoja de cálculo
    const workbook = XLSX.utils.book_new();
    // Crear una hoja dentro del libro
    const worksheetLogs = XLSX.utils.json_to_sheet(data);

    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(workbook, worksheetLogs, 'Logs');
    // Guardar el libro como un archivo Excel
    XLSX.writeFile(workbook, 'Logs.xlsx');
  }
  createTrxLogsModelExcel(): {'Módulo': string, 'Tipo transacción': string, 'Fecha': string, 'Detalles': string}[] {
    let dataModel: { 'Módulo': string, 'Tipo transacción': string, 'Fecha': string, 'Detalles': string}[] = [];
    for (let log of this.logs) {
      dataModel.push({
        'Módulo': log.module,
        'Tipo transacción': log.trxType,
        'Fecha': String(log.createdAt),
        'Detalles': log.details
      });
    }
    return dataModel;
  }

  fixDate(stringFecha: string, startOrEnd: string){
    let myDate = stringFecha;
    let months = new Map<string, string>([
      ["Jan", "01"], ["Feb", "02"], ["Mar", "03"], ["Apr", "04"],
      ["May", "05"], ["Jun", "06"], ["Jul", "07"], ["Aug", "08"],
      ["Sep", "09"], ["Oct", "10"], ["Nov", "11"], ["Dic", "12"]
    ])
    let mesLetras = myDate.substring(4,7);

    let yyyy = myDate.substring(11,15);
    let mm = months.get(mesLetras);
    let dd = myDate.substring(8,10);

    if (startOrEnd == 'start'){
      myDate = yyyy + '-' + mm + '-' + dd + 'T00:00:00.000Z';
    } else if (startOrEnd == 'end'){
      myDate = yyyy + '-' + mm + '-' + dd + 'T23:59:59.999Z';
    }
    return myDate;
  }

    postLogForm(){

      let now = new Date();

      this.parametersInput.userId = this.logForm.controls.userId.value;
      this.parametersInput.module = this.logForm.controls.module.value;
      this.parametersInput.trxType = this.logForm.controls.trxType.value;
      this.parametersInput.details = this.logForm.controls.details.value;
      this.parametersInput.createdAt = now;
      this.parametersInput.updatedAt = now;
      /*this.subscription.add(this.srv.postLog(this.parametersInput)
      .subscribe(
        
      ))*/

      this.changeFilter();
  }
  public showFilter() {
    this.filterButton = (this.filterButton == "Filtrar") ? "Ocultar" : "Filtrar";
    this.filterHidden = (this.filterHidden) ? false : true;
  }

  isDisabled = (date: NgbDate, current: {month: number}) => date.month !== current.month;
  isWeekend = (date: NgbDate) =>  this.calendar.getWeekday(date) >= 6;

   // La lógica para verificar el rango de fechas seleccionadas
   onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
        this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date.after(this.fromDate)) {
        this.toDate = date;
        // Calcula la diferencia en días
        const diffInDays = this.calculateDateDifference(this.fromDate, this.toDate);
        if (diffInDays > 31) {
            // Si el rango excede los 31 días, anula la selección
            this.toDate = null;
            this.filterForm.controls.dateLogStart.setValue('');
            this.filterForm.controls.dateLogEnd.setValue('');
            // Aquí puedes agregar una notificación o mensaje para el usuario indicando el límite de días permitidos.
        } else {
            this.filterForm.controls.dateLogStart.setValue(this.fromDate.year+'-'+String(this.fromDate.month).padStart(2, '0')+'-'+String(this.fromDate.day).padStart(2, '0')+'T00:00:00.000Z');
            this.filterForm.controls.dateLogEnd.setValue(this.toDate.year+'-'+String(this.toDate.month).padStart(2, '0')+'-'+String(this.toDate.day).padStart(2, '0')+'T23:59:59.999Z');
        }
    } else {
        this.filterForm.controls.dateLogStart.setValue('');
        this.filterForm.controls.dateLogEnd.setValue('');
        this.toDate = null;
        this.fromDate = date;
    }
}

// Método para calcular la diferencia entre fechas en días
calculateDateDifference(from: NgbDate, to: NgbDate): number {
    const fromDate = new Date(from.year, from.month - 1, from.day);
    const toDate = new Date(to.year, to.month - 1, to.day);
    const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

  isHovered(date: NgbDate) {
    return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
  }

  isInside(date: NgbDate) {
    return date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return date.equals(this.fromDate) || date.equals(this.toDate) || this.isInside(date) || this.isHovered(date);
  }

  validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
    const parsed = this.formatter.parse(input);
    return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;
  }
}
