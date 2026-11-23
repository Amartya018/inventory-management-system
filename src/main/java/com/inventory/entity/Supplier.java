package com.inventory.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "suppliers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "supplier_name", nullable = false)
    private String supplierName;

    @Column(unique = true)
    private String email;

    private String phone;

    @Column(columnDefinition = "TEXT")
    private String address;
}
