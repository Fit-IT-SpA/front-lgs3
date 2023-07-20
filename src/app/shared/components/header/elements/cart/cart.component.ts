import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {

  public openCart: boolean = false;

  constructor(private router: Router) { }

  ngOnInit() {
  }

  // For Mobile Device
  toggleCart() {
    this.openCart = !this.openCart;
  }
  goToCart() {
    this.router.navigate(['admin/cart']);
  }

}
