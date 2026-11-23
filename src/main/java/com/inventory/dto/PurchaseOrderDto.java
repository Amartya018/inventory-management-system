package com.inventory.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class PurchaseOrderDto {

    @Getter @Setter
    public static class Request {
        @NotNull(message = "Supplier ID is required")
        private Long supplierId;

        @NotEmpty(message = "Purchase order must have at least one item")
        private List<PurchaseItemRequest> items;

        @Getter @Setter
        public static class PurchaseItemRequest {
            @NotNull(message = "Product ID is required")
            private Long productId;

            @Min(value = 1, message = "Quantity must be >= 1")
            private Integer quantity;

            @DecimalMin(value = "0.0", message = "Unit cost must be >= 0")
            private BigDecimal unitCost;
        }
    }

    @Getter @Setter @Builder
    public static class Response {
        private Long id;
        private String orderNumber;
        private Long supplierId;
        private String supplierName;
        private BigDecimal totalAmount;
        private LocalDateTime orderDate;
        private String status;
        private List<PurchaseItemResponse> items;

        @Getter @Setter @Builder
        public static class PurchaseItemResponse {
            private Long productId;
            private String productName;
            private Integer quantity;
            private BigDecimal unitCost;
        }
    }
}
