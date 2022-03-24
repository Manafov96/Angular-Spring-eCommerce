import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem } from '../common/cart-item';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  public cartItems: CartItem[] = [];

  public totalPrice: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  public totalQuantity: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  constructor() { }

  public addToCart(theCartItem: CartItem) {
    let alreadyExistsInCart: boolean = false;
    let existingCartItem!: CartItem;

    if (this.cartItems.length > 0) {

      existingCartItem = this.cartItems.find(tempCartItem => tempCartItem.id === theCartItem.id)!;

      // check if we found it
      alreadyExistsInCart = (existingCartItem != undefined);
    }
    if (alreadyExistsInCart) {
      existingCartItem.quantity++;
    }
    else {
      this.cartItems.push(theCartItem);
    }
    // compute cart quantity and cart total
    this.computeCartTotals();
  }

  public computeCartTotals() {
    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;

    for (let currentCartItem of this.cartItems) {
      totalPriceValue += currentCartItem.quantity * currentCartItem.unitPrice;
      totalQuantityValue += currentCartItem.quantity;
    }

    // publish the new values ... all subscibers will recieve the new data
    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);
  }

  public decrementQuantity(theCartItem: CartItem) {
    theCartItem.quantity--;
    if (theCartItem.quantity === 0) {
      this.remove(theCartItem);
    }
    else {
      this.computeCartTotals();
    }
  }

  public remove(theCartItem: CartItem) {
    // get index of item in the array
    const itemIndex = this.cartItems.findIndex(
      tempCartItem => tempCartItem.id == theCartItem.id
    );
    // if found, remove the item from the array at the given index
    if (itemIndex > -1) {
      this.cartItems.splice(itemIndex, 1);
      this.computeCartTotals();
    }
  }

  public computeTotals() {
    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;

    for (let currentCartItem of this.cartItems) {
      totalPriceValue += currentCartItem.quantity * currentCartItem.unitPrice;
      totalQuantityValue += currentCartItem.quantity;
    }

    // publish the new values ... all subscribers will recieve the new data
    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);
  }

}
