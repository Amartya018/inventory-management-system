package com.inventory.service;

import com.inventory.dto.SaleDto;
import com.inventory.entity.*;
import com.inventory.exception.BusinessException;
import com.inventory.exception.ResourceNotFoundException;
import com.inventory.repository.*;
import com.inventory.util.InvoiceNumberGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class SaleService {

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StockMovementRepository stockMovementRepository;

    @Transactional(readOnly = true)
    public List<SaleDto.Response> getAllSales() {
        return saleRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SaleDto.Response getSaleById(Long id) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale", id));
        return toResponse(sale);
    }

    @Transactional
    public SaleDto.Response createSale(SaleDto.Request request) {
        // Resolve current user
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Resolve customer (optional)
        Customer customer = null;
        if (request.getCustomerId() != null) {
            customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer", request.getCustomerId()));
        }

        // Build sale
        Sale sale = Sale.builder()
                .customer(customer)
                .user(currentUser)
                .invoiceNumber(InvoiceNumberGenerator.generateInvoiceNumber())
                .saleDate(LocalDateTime.now())
                .status(Sale.SaleStatus.COMPLETED)
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (SaleDto.Request.SaleItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", itemReq.getProductId()));

            // Prevent negative stock
            if (product.getQuantity() < itemReq.getQuantity()) {
                throw new BusinessException(
                        "Insufficient stock for product: " + product.getProductName()
                                + ". Available: " + product.getQuantity()
                                + ", Requested: " + itemReq.getQuantity()
                );
            }

            BigDecimal unitPrice = product.getSellingPrice() != null ? product.getSellingPrice() : BigDecimal.ZERO;
            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity()));

            SaleItem saleItem = SaleItem.builder()
                    .sale(sale)
                    .product(product)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(unitPrice)
                    .subtotal(subtotal)
                    .build();

            sale.getItems().add(saleItem);
            totalAmount = totalAmount.add(subtotal);

            // Decrease stock
            product.setQuantity(product.getQuantity() - itemReq.getQuantity());
            productRepository.save(product);

            // Log stock movement
            StockMovement movement = StockMovement.builder()
                    .product(product)
                    .movementType(StockMovement.MovementType.OUT)
                    .quantity(itemReq.getQuantity())
                    .reference(sale.getInvoiceNumber())
                    .movementDate(LocalDateTime.now())
                    .user(currentUser)
                    .build();
            stockMovementRepository.save(movement);
        }

        sale.setTotalAmount(totalAmount);
        return toResponse(saleRepository.save(sale));
    }

    private SaleDto.Response toResponse(Sale sale) {
        List<SaleDto.Response.SaleItemResponse> items = sale.getItems().stream()
                .map(item -> SaleDto.Response.SaleItemResponse.builder()
                        .productId(item.getProduct().getId())
                        .productName(item.getProduct().getProductName())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .subtotal(item.getSubtotal())
                        .build())
                .collect(Collectors.toList());

        return SaleDto.Response.builder()
                .id(sale.getId())
                .invoiceNumber(sale.getInvoiceNumber())
                .customerId(sale.getCustomer() != null ? sale.getCustomer().getId() : null)
                .customerName(sale.getCustomer() != null ? sale.getCustomer().getCustomerName() : "Walk-in Customer")
                .totalAmount(sale.getTotalAmount())
                .saleDate(sale.getSaleDate())
                .status(sale.getStatus().name())
                .items(items)
                .build();
    }
}
