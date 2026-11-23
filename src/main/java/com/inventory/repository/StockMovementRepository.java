package com.inventory.repository;

import com.inventory.entity.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {

    List<StockMovement> findByProductIdOrderByMovementDateDesc(Long productId);

    List<StockMovement> findByMovementTypeOrderByMovementDateDesc(StockMovement.MovementType type);
}
