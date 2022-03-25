package com.ecommerceapp.springbootecommerce.controller;

import com.ecommerceapp.springbootecommerce.dto.Purchase;
import com.ecommerceapp.springbootecommerce.dto.PurchaseResponse;
import com.ecommerceapp.springbootecommerce.service.CheckoutService;
import org.springframework.web.bind.annotation.*;

@CrossOrigin("http://localhost:4200")
@RestController
@RequestMapping("/api/checkout")
public class CheckoutController {

    private CheckoutService checkoutService;

    public CheckoutController(CheckoutService checkoutService) {
        this.checkoutService = checkoutService;
    }

    @PostMapping("/purchase")
    public PurchaseResponse placeOrder(@RequestBody Purchase purchase) {

        PurchaseResponse purchaseResponse = checkoutService.placeOrder(purchase);

        return  purchaseResponse;
    }
}
