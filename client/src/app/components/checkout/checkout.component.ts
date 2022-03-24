import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Country } from 'src/app/common/country';
import { ShopValidators } from 'src/app/common/shop-validators';
import { State } from 'src/app/common/state';
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

  constructor(private formBuilder: FormBuilder, private shopService: ShopService, private formService: FormService) { }

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
  }

  public onSubmit() {
    console.log(this.checkoutFormGroup.get('customer')!.value);
    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
    }
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

  // Customer Information
  get firstName() { return this.checkoutFormGroup.get('customer.firstName'); }

  get lastName() { return this.checkoutFormGroup.get('customer.lastName'); }

  get email() { return this.checkoutFormGroup.get('customer.email'); }

  // Shipping Address Information
  get shippingAddressStreet() { return this.checkoutFormGroup.get('shippingAddress.street'); }

  get shippingAddressCity() { return this.checkoutFormGroup.get('shippingAddress.city'); }

  get shippingAddressState() { return this.checkoutFormGroup.get('shippingAddress.state'); }

  get shippingAddressCountry() { return this.checkoutFormGroup.get('shippingAddress.country'); }

  get shippingAddressZipCode() { return this.checkoutFormGroup.get('shippingAddress.zipCode'); }

  // Billing Address Information
  get billingAddressStreet() { return this.checkoutFormGroup.get('billingAddress.street'); }

  get billingAddressCity() { return this.checkoutFormGroup.get('billingAddress.city'); }

  get billingAddressState() { return this.checkoutFormGroup.get('billingAddress.state'); }

  get billingAddressCountry() { return this.checkoutFormGroup.get('billingAddress.country'); }

  get billingAddressZipCode() { return this.checkoutFormGroup.get('billingAddress.zipCode'); }

  // Credit Card Information
  get creditCardType() { return this.checkoutFormGroup.get('creditCard.cardType'); }

  get creditCardNameOnCard() { return this.checkoutFormGroup.get('creditCard.nameOnCard'); }

  get creditCardNumber() { return this.checkoutFormGroup.get('creditCard.cardNumber'); }

  get creditCardSecurityCode() { return this.checkoutFormGroup.get('creditCard.securityCode'); }

}