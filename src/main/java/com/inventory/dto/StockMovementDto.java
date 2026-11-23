package com.inventory.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class StockMovementDto {
    private Long id;
    private Long productId;
    private String productName;
    private String movementType;
    private Integer quantity;
    private String reference;
    private LocalDateTime movementDate;
    private String userName;
}
