package com.inventory.controller;

import com.inventory.dto.PurchaseOrderDto;
import com.inventory.service.PurchaseOrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchases")
public class PurchaseOrderController {

    @Autowired
    private PurchaseOrderService purchaseOrderService;

    @GetMapping
    public ResponseEntity<List<PurchaseOrderDto.Response>> getAllOrders() {
        return ResponseEntity.ok(purchaseOrderService.getAllOrders());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseOrderDto.Response> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseOrderService.getOrderById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<PurchaseOrderDto.Response> createOrder(@Valid @RequestBody PurchaseOrderDto.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(purchaseOrderService.createOrder(request));
    }

    @PutMapping("/{id}/receive")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<PurchaseOrderDto.Response> receiveOrder(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseOrderService.receiveOrder(id));
    }
}
