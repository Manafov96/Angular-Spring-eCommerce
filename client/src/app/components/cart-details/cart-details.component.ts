import { Component, OnInit } from '@angular/core';
import { CartItem } from 'src/app/common/cart-item';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-cart-details',
  templateUrl: './cart-details.component.html',
  styleUrls: ['./cart-details.component.css']
})
export class CartDetailsComponent implements OnInit {

  public cartItems: CartItem[] = [];

  public totalPrice: number = 0;

  public totalQuantity: number = 0;

  constructor(private cartService: CartService) { }

  ngOnInit(): void {
    this.listCartDetails();
  }

  private listCartDetails() {
    // get a handle to the cart items
    this.cartItems = this.cartService.cartItems;

    // subscribe to the cart totalPrice
    this.cartService.totalQuantity.subscribe(
      data => this.totalQuantity = data
    );

    // subscribe to teh cart totalQuantity
    this.cartService.totalPrice.subscribe(
      data => this.totalPrice = data
    );

    // compute cart total price and total quantity
    this.cartService.computeCartTotals();
  }

  public incrementQuantity(theCartItem: CartItem) {
    this.cartService.addToCart(theCartItem)
  }

  public decrementQuantity(theCartItem: CartItem) {
    this.cartService.decrementQuantity(theCartItem);
  }

  public remove(theCartItem: CartItem) {
    this.cartService.remove(theCartItem);
  }

}
