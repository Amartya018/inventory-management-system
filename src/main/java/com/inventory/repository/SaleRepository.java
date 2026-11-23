package com.inventory.repository;

import com.inventory.entity.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {

    Optional<Sale> findByInvoiceNumber(String invoiceNumber);

    List<Sale> findByCustomerId(Long customerId);

    @Query("SELECT COALESCE(SUM(s.totalAmount), 0) FROM Sale s WHERE s.status = 'COMPLETED'")
    BigDecimal getTotalRevenue();

    @Query("SELECT s FROM Sale s ORDER BY s.saleDate DESC")
    List<Sale> findRecentSales();

    List<Sale> findTop5ByOrderBySaleDateDesc();
}
