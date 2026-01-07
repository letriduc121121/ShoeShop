package com.bitis.shoeshop.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// Order Request
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequest {
    private String paymentMethod; // COD or QR_CODE
    private String deliveryAddress;
    private String deliveryPhone;
    private String notes;
}
