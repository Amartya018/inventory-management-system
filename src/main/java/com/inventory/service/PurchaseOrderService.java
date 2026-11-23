package com.inventory.service;

import com.inventory.dto.PurchaseOrderDto;
import com.inventory.entity.*;
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
public class PurchaseOrderService {

    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StockMovementRepository stockMovementRepository;

    @Transactional(readOnly = true)
    public List<PurchaseOrderDto.Response> getAllOrders() {
        return purchaseOrderRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PurchaseOrderDto.Response getOrderById(Long id) {
        PurchaseOrder order = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase Order", id));
        return toResponse(order);
    }

    @Transactional
    public PurchaseOrderDto.Response createOrder(PurchaseOrderDto.Request request) {
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", request.getSupplierId()));

        PurchaseOrder order = PurchaseOrder.builder()
                .supplier(supplier)
                .orderNumber(InvoiceNumberGenerator.generateOrderNumber())
                .orderDate(LocalDateTime.now())
                .status(PurchaseOrder.OrderStatus.PENDING)
                .build();

        BigDecimal total = BigDecimal.ZERO;

        for (PurchaseOrderDto.Request.PurchaseItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", itemReq.getProductId()));

            BigDecimal unitCost = itemReq.getUnitCost() != null ? itemReq.getUnitCost() : BigDecimal.ZERO;

            PurchaseItem item = PurchaseItem.builder()
                    .purchaseOrder(order)
                    .product(product)
                    .quantity(itemReq.getQuantity())
                    .unitCost(unitCost)
                    .build();

            order.getItems().add(item);
            total = total.add(unitCost.multiply(BigDecimal.valueOf(itemReq.getQuantity())));
        }

        order.setTotalAmount(total);
        return toResponse(purchaseOrderRepository.save(order));
    }

    @Transactional
    public PurchaseOrderDto.Response receiveOrder(Long id) {
        PurchaseOrder order = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase Order", id));

        if (order.getStatus() != PurchaseOrder.OrderStatus.PENDING) {
            throw new com.inventory.exception.BusinessException(
                    "Order " + order.getOrderNumber() + " is already " + order.getStatus());
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email).orElse(null);

        // Increase stock for each item
        for (PurchaseItem item : order.getItems()) {
            Product product = item.getProduct();
            product.setQuantity(product.getQuantity() + item.getQuantity());
            productRepository.save(product);

            StockMovement movement = StockMovement.builder()
                    .product(product)
                    .movementType(StockMovement.MovementType.IN)
                    .quantity(item.getQuantity())
                    .reference(order.getOrderNumber())
                    .movementDate(LocalDateTime.now())
                    .user(currentUser)
                    .build();
            stockMovementRepository.save(movement);
        }

        order.setStatus(PurchaseOrder.OrderStatus.RECEIVED);
        return toResponse(purchaseOrderRepository.save(order));
    }

    private PurchaseOrderDto.Response toResponse(PurchaseOrder order) {
        List<PurchaseOrderDto.Response.PurchaseItemResponse> items = order.getItems().stream()
                .map(item -> PurchaseOrderDto.Response.PurchaseItemResponse.builder()
                        .productId(item.getProduct().getId())
                        .productName(item.getProduct().getProductName())
                        .quantity(item.getQuantity())
                        .unitCost(item.getUnitCost())
                        .build())
                .collect(Collectors.toList());

        return PurchaseOrderDto.Response.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .supplierId(order.getSupplier().getId())
                .supplierName(order.getSupplier().getSupplierName())
                .totalAmount(order.getTotalAmount())
                .orderDate(order.getOrderDate())
                .status(order.getStatus().name())
                .items(items)
                .build();
    }
}
