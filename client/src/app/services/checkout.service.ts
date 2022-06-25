import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaymentInfo } from '../common/payment-info';
import { Purchase } from '../common/purchase';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  private purchaseUrl = 'http://localhost:8080/api/checkout/purchase';

  private paymentIntentUrl = 'http://localhost:8080/api/checkout/payment-intent';

  constructor(private httpClient: HttpClient) { }

  public placeOrder(purchase: Purchase): Observable<any> {
    return this.httpClient.post<Purchase>(this.purchaseUrl, purchase);
  }

  public createPaymentIntent(paymentInfo: PaymentInfo) {
    return this.httpClient.post<any>(this.paymentIntentUrl, paymentInfo); 
  }
}
