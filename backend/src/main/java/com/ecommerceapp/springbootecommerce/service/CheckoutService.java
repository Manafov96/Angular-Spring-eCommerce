package com.ecommerceapp.springbootecommerce.service;

import com.ecommerceapp.springbootecommerce.dto.PaymentInfo;
import com.ecommerceapp.springbootecommerce.dto.Purchase;
import com.ecommerceapp.springbootecommerce.dto.PurchaseResponse;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;

public interface CheckoutService {

    PurchaseResponse placeOrder(Purchase purchase);

    PaymentIntent createPaymentIntent(PaymentInfo paymentInfo) throws StripeException;

}
