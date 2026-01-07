package com.bitis.shoeshop.controller;

import com.bitis.shoeshop.dto.OrderResponse;
import com.bitis.shoeshop.repository.OrderRepository;
import com.bitis.shoeshop.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:8080", allowCredentials = "true")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final OrderRepository orderRepository;
    private final OrderService orderService;

    @GetMapping("/orders")
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        List<OrderResponse> orders = orderRepository.findAll()
                .stream()
                .map(order -> {
                    // Reuse the private method from OrderService via reflection
                    // Or just create the OrderResponse here
                    return orderService.getOrderById(order.getId(), order.getUser().getId());
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(orders);
    }
}