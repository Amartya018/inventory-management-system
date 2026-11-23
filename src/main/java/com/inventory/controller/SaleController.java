package com.inventory.controller;

import com.inventory.dto.SaleDto;
import com.inventory.service.SaleService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales")
public class SaleController {

    @Autowired
    private SaleService saleService;

    @GetMapping
    public ResponseEntity<List<SaleDto.Response>> getAllSales() {
        return ResponseEntity.ok(saleService.getAllSales());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SaleDto.Response> getSaleById(@PathVariable Long id) {
        return ResponseEntity.ok(saleService.getSaleById(id));
    }

    @GetMapping("/{id}/invoice")
    public ResponseEntity<SaleDto.Response> getSaleInvoice(@PathVariable Long id) {
        return ResponseEntity.ok(saleService.getSaleById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<SaleDto.Response> createSale(@Valid @RequestBody SaleDto.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(saleService.createSale(request));
    }
}
