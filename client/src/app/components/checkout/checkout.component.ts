import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Address } from 'src/app/common/address';
import { Country } from 'src/app/common/country';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { PaymentInfo } from 'src/app/common/payment-info';
import { Purchase } from 'src/app/common/purchase';
import { ShopValidators } from 'src/app/common/shop-validators';
import { State } from 'src/app/common/state';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { FormService } from 'src/app/services/form.service';
import { ShopService } from 'src/app/services/shop.service';
import { environment } from 'src/environments/environment';

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

  private storage: Storage = sessionStorage;

  private localStorage: Storage = localStorage;

  // initialize Stripe API
  private stripe = Stripe(environment.stripePublishableKey);

  private paymentInfo: PaymentInfo = new PaymentInfo();

  public cardElement: any;

  public displayError: any = '';

  public isDisabled: boolean = false;

  constructor(private formBuilder: FormBuilder,
    private formService: FormService, private cartService: CartService,
    private checkoutService: CheckoutService, private router: Router) { }

  ngOnInit(): void {
    // setup Stripe form
    this.setupStripePaymentForm();

    // read user email 
    const theEmail = JSON.parse(this.storage.getItem('userEmail')!);

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhiteSpace]),
        lastName: new FormControl('', [Validators.required, Validators.minLength(2), ShopValidators.notOnlyWhiteSpace]),
        email: new FormControl(theEmail, [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')])
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
      })
    });

    // populate countries
    this.formService.getCountries().subscribe(
      data => {
        this.countries = data;
      }
    )

    this.reviewCartDetails();
  }

  private setupStripePaymentForm() {
    // get a handle to stripe elements
    var elements = this.stripe.elements();

    // Create a card element ... and hide the zip-code field
    this.cardElement = elements.create('card', { hidePostalCode: true });

    // Add an instanve of card UI component into the 'card-element' div
    this.cardElement.mount('#card-element');

    // Add event binding for the 'change' event on the card element
    this.cardElement.on('change', (event: any) => {
      // get a handle to card-errors element
      this.displayError = document.getElementById('card-errors');

      if (event.complete) {
        this.displayError.textContent = "";
      } else if (event.error) {
        // show validation error to customer
        this.displayError.textContent = event.error.message;
      }
    });

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

    // compute payment info
    this.paymentInfo.amount = Math.round(this.totalPrice * 100);
    this.paymentInfo.currency = 'USD';
    this.paymentInfo.receiptEmail = purchase.customer.email;

    // if valid form then 
    // - create payment intent
    // - confirm card payment
    // - place order

    if (!this.checkoutFormGroup.invalid && this.displayError.textContent === '') {
      this.isDisabled = true;
      this.checkoutService.createPaymentIntent(this.paymentInfo).subscribe(
        (paymentIntentResponse) => {
          console.log(paymentIntentResponse);
          // send credit card data directly to stripe server
          this.stripe.confirmCardPayment(paymentIntentResponse.client_secret, {
            payment_method: {
              card: this.cardElement,
              billing_details: {
                email: purchase.customer.email,
                name: `${purchase.customer.firstName} ${purchase.customer.lastNme}`,
                address: {
                  line1: purchase.billingAddress.street,
                  city: purchase.billingAddress.city,
                  state: purchase.billingAddress.state,
                  postal_code: purchase.billingAddress.zipCode,
                  country: this.billingAddressCountry?.value.code
                } 
              }
            }
          }, { handleActions: false }).then((result: any) => {
            if (result.error) {
              // inform the customer there was an error
              alert(`There was an error: ${result.error.message}`);
              this.isDisabled = false;
            } else {
              // call REST API via CheckoutService
              this.checkoutService.placeOrder(purchase).subscribe({
                next: response => {
                  alert(`Your order has been recieved.\nOrder tracking number: ${response.orderTrackingNumber}`);
                  // reset cart
                  this.resetCart();
                  this.isDisabled = false;
                },
                error: err => {
                  alert(`There was an error: ${err.message}`);
                  this.isDisabled = false;
                }
              });
            }
          })
        }
      )
    } else {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }
  }

  private resetCart() {
    // reset cart data
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);
    this.cartService.persistCartItems();

    // reset the form
    this.checkoutFormGroup.reset();

    // reset local storage
    this.localStorage.removeItem('cartItems');

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

  // public handleMonthsAndYears() {
  //   const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');

  //   const currentYear: number = new Date().getFullYear();
  //   const selectedYear: number = Number(creditCardFormGroup?.value.expirationYear);

  //   let startMonth: number;
  //   if (currentYear === selectedYear) {
  //     startMonth = new Date().getMonth() + 1;
  //   }
  //   else {
  //     startMonth = 1;
  //   }

  //   this.shopService.getCreditCardMonths(startMonth).subscribe(
  //     data => {
  //       this.creditCardMonths = data;
  //     }
  //   )
  // }

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