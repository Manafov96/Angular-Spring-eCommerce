import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Address } from 'src/app/common/address';
import { Country } from 'src/app/common/country';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { Purchase } from 'src/app/common/purchase';
import { ShopValidators } from 'src/app/common/shop-validators';
import { State } from 'src/app/common/state';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { FormService } from 'src/app/services/form.service';
import { ShopService } from 'src/app/services/shop.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  public checkoutFormGroup!: FormGroup;

  public totalPrice: number = 0.00;

  public totalQuantity: number = 0;

  public creditCardYears: number[] = [];

  public creditCardMonths: number[] = [];

  public countries: Country[] = [];

  public shippingAddressStates: State[] = [];

  public billingAddressStates: State[] = [];

  constructor(private formBuilder: FormBuilder, private shopService: ShopService,
    private formService: FormService, private cartService: CartService,
    private checkoutService: CheckoutService, private router: Router) { }

  ngOnInit(): void {
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhiteSpace]),
        lastName: new FormControl('', [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhiteSpace]),
        email: new FormControl('', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')])
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhiteSpace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhiteSpace]),
        state: new FormControl('', [Validators.required, Validators.minLength(2)]),
        country: new FormControl('', [Validators.required, Validators.minLength(2)]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhiteSpace]),
      }),
      billingAddress: this.formBuilder.group({
        country: new FormControl('', [Validators.required, Validators.minLength(2)]),
        street: new FormControl('', [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhiteSpace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhiteSpace]),
        state: new FormControl('', [Validators.required, Validators.minLength(2)]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhiteSpace]),
      }),
      creditCard: this.formBuilder.group({
        cardType: new FormControl('', [Validators.required, ShopValidators.notOnlyWhiteSpace]),
        nameOnCard: new FormControl('', [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhiteSpace]),
        cardNumber: new FormControl('', [Validators.required, Validators.pattern('[0-9]{16}')]),
        securityCode: new FormControl('', [Validators.required, Validators.pattern('[0-9]{3}')]),
        expirationMonth: [''],
        expirationYear: ['']
      })
    });

    // populate credit card months
    const startMonth: number = new Date().getMonth() + 1;
    this.shopService.getCreditCardMonths(startMonth).subscribe(
      data => {
        this.creditCardMonths = data;
      }
    )

    // populate credit card years
    this.shopService.getCreditCardYears().subscribe(
      data => {
        this.creditCardYears = data;
      }
    )

    // populate countries
    this.formService.getCountries().subscribe(
      data => {
        this.countries = data;
      }
    )

    this.reviewCartDetails();
  }

  // Customer Information
  public get firstName() { return this.checkoutFormGroup.get('customer.firstName'); }

  public get lastName() { return this.checkoutFormGroup.get('customer.lastName'); }

  public get email() { return this.checkoutFormGroup.get('customer.email'); }

  // Shipping Address Information
  public get shippingAddressStreet() { return this.checkoutFormGroup.get('shippingAddress.street'); }

  public get shippingAddressCity() { return this.checkoutFormGroup.get('shippingAddress.city'); }

  public get shippingAddressState() { return this.checkoutFormGroup.get('shippingAddress.state'); }

  public get shippingAddressCountry() { return this.checkoutFormGroup.get('shippingAddress.country'); }

  public get shippingAddressZipCode() { return this.checkoutFormGroup.get('shippingAddress.zipCode'); }

  // Billing Address Information
  public get billingAddressStreet() { return this.checkoutFormGroup.get('billingAddress.street'); }

  public get billingAddressCity() { return this.checkoutFormGroup.get('billingAddress.city'); }

  public get billingAddressState() { return this.checkoutFormGroup.get('billingAddress.state'); }

  public get billingAddressCountry() { return this.checkoutFormGroup.get('billingAddress.country'); }

  public get billingAddressZipCode() { return this.checkoutFormGroup.get('billingAddress.zipCode'); }

  // Credit Card Information
  public get creditCardType() { return this.checkoutFormGroup.get('creditCard.cardType'); }

  public get creditCardNameOnCard() { return this.checkoutFormGroup.get('creditCard.nameOnCard'); }

  public get creditCardNumber() { return this.checkoutFormGroup.get('creditCard.cardNumber'); }

  public get creditCardSecurityCode() { return this.checkoutFormGroup.get('creditCard.securityCode'); }


  public onSubmit() {
    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    // set up order
    let order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    // get cart items
    const cartItems = this.cartService.cartItems;

    // create orderItems from cartItems
    let orderItems: OrderItem[] = cartItems.map(tempCartItem => new OrderItem(tempCartItem));

    // set up purchase
    let purchase: Purchase = new Purchase();

    // populate purchase - customer
    purchase.customer = this.checkoutFormGroup.controls['customer'].value;

    // populate purchase - shipping address
    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const shippingCountry: State = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.state = shippingState.name;
    purchase.shippingAddress.country = shippingCountry.name;

    // populate purchase - billing address
    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry: State = JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.billingAddress.state = billingState.name;
    purchase.billingAddress.country = billingCountry.name;

    // populate purchase - order and orderItems
    purchase.order = order;
    purchase.orderItems = orderItems;

    // call REST API via CheckoutService
    this.checkoutService.placeOrder(purchase).subscribe({
      next: response => {
        alert(`Your order has been recieved.\nOrder tracking number: ${response.orderTrackingNumber}`);
        // reset cart
        this.resetCart();
      },
      error: err => {
        alert(`There was an error: ${err.message}`);
      }
    });
  }

  private resetCart() {
    // reset cart data
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);

    // reset the form
    this.checkoutFormGroup.reset();

    // navigate back to the products page
    this.router.navigateByUrl("/prodcuts");
  }

  public copyShippingAddressToBillingAddress(event: any) {
    if (event.target.checked) {
      this.checkoutFormGroup.controls.billingAddress
        .setValue(this.checkoutFormGroup.controls.shippingAddress.value);
      // copy values  
      this.billingAddressStates = this.shippingAddressStates;
    }
    else {
      this.checkoutFormGroup.controls.billingAddress.reset();
      // reset billing address
      this.billingAddressStates = [];
    }
  }

  public handleMonthsAndYears() {
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');

    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup?.value.expirationYear);

    let startMonth: number;
    if (currentYear === selectedYear) {
      startMonth = new Date().getMonth() + 1;
    }
    else {
      startMonth = 1;
    }

    this.shopService.getCreditCardMonths(startMonth).subscribe(
      data => {
        this.creditCardMonths = data;
      }
    )
  }

  public getStates(formGroupName: string) {
    const formGroup = this.checkoutFormGroup.get(formGroupName);
    const countryCode = formGroup?.value.country.code;

    this.formService.getStates(countryCode).subscribe(
      data => {
        if (formGroupName === 'shippingAddress') {
          this.shippingAddressStates = data;
        }
        else {
          this.billingAddressStates = data;
        }

        // select first item by default
        formGroup?.get('state')?.setValue(data[0]);
      }
    )
  }

  private reviewCartDetails() {
    // subscribe to cartService totalQuantity
    this.cartService.totalQuantity.subscribe(
      totalQuantity => this.totalQuantity = totalQuantity
    );

    // subscribe to cartService totalPrice
    this.cartService.totalPrice.subscribe(
      totalPrice => this.totalPrice = totalPrice
    );
  }

}