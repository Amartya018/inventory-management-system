package com.inventory.controller;

import com.inventory.dto.StockMovementDto;
import com.inventory.service.StockMovementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock-movements")
public class StockMovementController {

    @Autowired
    private StockMovementService stockMovementService;

    @GetMapping
    public ResponseEntity<List<StockMovementDto>> getAllMovements() {
        return ResponseEntity.ok(stockMovementService.getAllMovements());
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<StockMovementDto>> getMovementsByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(stockMovementService.getMovementsByProduct(productId));
    }
}
