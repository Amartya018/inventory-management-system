package com.inventory.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardDto {
    private long totalProducts;
    private long totalCategories;
    private long totalSuppliers;
    private long totalCustomers;
    private long lowStockCount;
    private long outOfStockCount;
    private long totalSales;
    private BigDecimal totalRevenue;
}
