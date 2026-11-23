package com.inventory.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ProductDto {

    @Getter @Setter
    public static class Request {
        @NotBlank(message = "Product name is required")
        private String productName;

        private String sku;
        private String description;
        private Long categoryId;
        private Long supplierId;

        @DecimalMin(value = "0.0", inclusive = true, message = "Purchase price must be >= 0")
        private BigDecimal purchasePrice;

        @DecimalMin(value = "0.0", inclusive = true, message = "Selling price must be >= 0")
        private BigDecimal sellingPrice;

        @Min(value = 0, message = "Quantity cannot be negative")
        private Integer quantity = 0;

        private Integer minimumStock = 10;
        private String unit;
    }

    @Getter @Setter @Builder
    public static class Response {
        private Long id;
        private String productName;
        private String sku;
        private String description;
        private Long categoryId;
        private String categoryName;
        private Long supplierId;
        private String supplierName;
        private BigDecimal purchasePrice;
        private BigDecimal sellingPrice;
        private BigDecimal profit;
        private Integer quantity;
        private Integer minimumStock;
        private String unit;
        private String stockStatus;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
