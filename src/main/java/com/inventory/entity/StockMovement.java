package com.inventory.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "stock_movements", indexes = {
    @Index(name = "idx_product_movement", columnList = "product_id"),
    @Index(name = "idx_movement_date", columnList = "movement_date")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StockMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Enumerated(EnumType.STRING)
    @Column(name = "movement_type", nullable = false)
    private MovementType movementType;

    @Column(nullable = false)
    private Integer quantity;

    private String reference;

    @Column(name = "movement_date")
    private LocalDateTime movementDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    public enum MovementType {
        IN, OUT, ADJUSTMENT
    }
}
