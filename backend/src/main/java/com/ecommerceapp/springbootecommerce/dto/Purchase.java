package com.ecommerceapp.springbootecommerce.dto;

import com.ecommerceapp.springbootecommerce.entity.Address;
import com.ecommerceapp.springbootecommerce.entity.Customer;
import com.ecommerceapp.springbootecommerce.entity.Order;
import com.ecommerceapp.springbootecommerce.entity.OrderItem;
import lombok.Data;

import java.util.Set;

@Data
public class Purchase {

    private Customer customer;

    private Address shippingAddress;

    private Address billingAddress;

    private Order order;

    private Set<OrderItem> orderItems;
}
