import { Component, OnInit, TemplateRef, ViewChild, HostListener } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { ConstantService } from 'src/app/shared/services/constant.service';
import { CartService } from '../cart.service';
import { Product } from 'src/app/shared/model/product.model';
import { Offer } from 'src/app/shared/model/offer.model';
import { ProductsService } from '../../orders/products/products.service';
import { OfferService } from 'src/app/shared/services/offer.service';
import { Order } from 'src/app/shared/model/order.model';
import { OfferWithData } from 'src/app/shared/model/offer-with-data';
import { PurchasesViewComponent } from './purchases-view/purchases-view.component';
import { UtilService } from 'src/app/shared/services/util.service';
declare var require;
const Swal = require('sweetalert2');

@Component({
    selector: 'app-purchases',
    templateUrl: './purchases.component.html',
    styleUrls: ['./purchases.component.scss'],
    providers: [CartService, ProductsService, OfferService],
})

export class PurchasesComponent implements OnInit {
    private subscription: Subscription = new Subscription();
    public profile =  JSON.parse(localStorage.getItem('profile'));
    public loading: boolean = true;
    public products: Product[] = [];
    public orderOffer: OfferWithData[] = [];
    public listView: boolean = false;
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
    @ViewChild("quickViewParchasesView") QuickViewParchasesView: PurchasesViewComponent;

    constructor(
        private modalService: NgbModal,
        private formBuilder: FormBuilder,
        private utilSrv: UtilService,
        private router: Router,
        public srv: CartService,
        public toster: ToastrService) {
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
        this.getCount();
    }
    
    private haveAccess() {
        let permissions = JSON.parse(localStorage.getItem("profile")).privilege;
        if (permissions) {
        let access = permissions.filter((perm: string) => {
            return perm === ConstantService.PERM_CAJA_LECTURA;
        });
        return access.length > 0;
        } else {
        return false;
        }
    }
    private getCount() {
        this.subscription.add(this.srv.countPurchasesByEmail(this.profile.email, this.parameters).subscribe(
            response => {
                console.log(response)
                this.totalElements = response.count;
                this.getPurchases();
            }, error => {
                console.log(error);
                this.loading = false;
            }
        ));
    }
    private getPurchases() {
        this.subscription.add(this.srv.findPurchasesByEmail(this.profile.email, this.parameters, this.currentPage).subscribe(
            response => {
                console.log(response)
                this.orderOffer = response;
                this.loading = false;
            }, error => {
                console.log(error);
                this.loading = false;
            }
        ));
    }
    public changeFilter() {
        this.loading = true;
        this.parameters.status = this.filterForm.controls.status.value;
        this.parameters.date = this.filterForm.controls.date.value;
        console.log(this.parameters);
        this.getCount();
      }
    showFilter() {
        this.filterButton = (this.filterButton == "Filtrar") ? "Ocultar" : "Filtrar";
        this.filterHidden = (this.filterHidden) ? false : true;
    }
    onCellClick(offer: OfferWithData) {
        this.QuickViewParchasesView.openModal(offer);
    }
    public onPageFired(event: any) {
        this.loading = true;
        this.currentPage = event;
        this.pageSize = this.pageSize;
        this.getPeriods();
      }
}
