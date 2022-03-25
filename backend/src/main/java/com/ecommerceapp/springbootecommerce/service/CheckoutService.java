package com.ecommerceapp.springbootecommerce.service;

import com.ecommerceapp.springbootecommerce.dto.Purchase;
import com.ecommerceapp.springbootecommerce.dto.PurchaseResponse;

public interface CheckoutService {

    PurchaseResponse placeOrder(Purchase purchase);

}
