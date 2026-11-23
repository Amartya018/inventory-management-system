package com.inventory.service;

import com.inventory.dto.StockMovementDto;
import com.inventory.repository.StockMovementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class StockMovementService {

    @Autowired
    private StockMovementRepository stockMovementRepository;

    public List<StockMovementDto> getAllMovements() {
        return stockMovementRepository.findAll().stream()
                .map(m -> StockMovementDto.builder()
                        .id(m.getId())
                        .productId(m.getProduct().getId())
                        .productName(m.getProduct().getProductName())
                        .movementType(m.getMovementType().name())
                        .quantity(m.getQuantity())
                        .reference(m.getReference())
                        .movementDate(m.getMovementDate())
                        .userName(m.getUser() != null ? m.getUser().getFullName() : "System")
                        .build())
                .collect(Collectors.toList());
    }

    public List<StockMovementDto> getMovementsByProduct(Long productId) {
        return stockMovementRepository.findByProductIdOrderByMovementDateDesc(productId).stream()
                .map(m -> StockMovementDto.builder()
                        .id(m.getId())
                        .productId(m.getProduct().getId())
                        .productName(m.getProduct().getProductName())
                        .movementType(m.getMovementType().name())
                        .quantity(m.getQuantity())
                        .reference(m.getReference())
                        .movementDate(m.getMovementDate())
                        .userName(m.getUser() != null ? m.getUser().getFullName() : "System")
                        .build())
                .collect(Collectors.toList());
    }
}
