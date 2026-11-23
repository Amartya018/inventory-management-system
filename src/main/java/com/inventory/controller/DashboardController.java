package com.inventory.controller;

import com.inventory.dto.DashboardDto;
import com.inventory.dto.ProductDto;
import com.inventory.dto.PurchaseOrderDto;
import com.inventory.dto.SaleDto;
import com.inventory.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardDto> getDashboardStats() {
        return ResponseEntity.ok(dashboardService.getDashboardStats());
    }

    @GetMapping("/recent-sales")
    public ResponseEntity<List<SaleDto.Response>> getRecentSales() {
        return ResponseEntity.ok(dashboardService.getRecentSales());
    }

    @GetMapping("/recent-purchases")
    public ResponseEntity<List<PurchaseOrderDto.Response>> getRecentPurchases() {
        return ResponseEntity.ok(dashboardService.getRecentPurchases());
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<ProductDto.Response>> getLowStock() {
        return ResponseEntity.ok(dashboardService.getLowStock());
    }
}
