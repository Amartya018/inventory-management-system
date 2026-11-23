package com.inventory.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class SaleDto {

    @Getter @Setter
    public static class Request {
        private Long customerId;

        @NotEmpty(message = "Sale must have at least one item")
        private List<SaleItemRequest> items;

        @Getter @Setter
        public static class SaleItemRequest {
            @NotNull(message = "Product ID is required")
            private Long productId;

            @Min(value = 1, message = "Quantity must be >= 1")
            private Integer quantity;
        }
    }

    @Getter @Setter @Builder
    public static class Response {
        private Long id;
        private String invoiceNumber;
        private Long customerId;
        private String customerName;
        private BigDecimal totalAmount;
        private LocalDateTime saleDate;
        private String status;
        private List<SaleItemResponse> items;

        @Getter @Setter @Builder
        public static class SaleItemResponse {
            private Long productId;
            private String productName;
            private Integer quantity;
            private BigDecimal unitPrice;
            private BigDecimal subtotal;
        }
    }
}
