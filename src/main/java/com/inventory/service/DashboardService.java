package com.inventory.service;

import com.inventory.dto.DashboardDto;
import com.inventory.dto.ProductDto;
import com.inventory.dto.PurchaseOrderDto;
import com.inventory.dto.SaleDto;
import com.inventory.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;

    @Autowired
    private ProductService productService;

    public DashboardDto getDashboardStats() {
        long totalProducts = productRepository.count();
        long totalCategories = categoryRepository.count();
        long totalSuppliers = supplierRepository.count();
        long totalCustomers = customerRepository.count();
        long lowStock = productRepository.countLowStockProducts();
        long outOfStock = productRepository.findOutOfStockProducts().size();
        long totalSales = saleRepository.count();
        BigDecimal totalRevenue = saleRepository.getTotalRevenue();

        return DashboardDto.builder()
                .totalProducts(totalProducts)
                .totalCategories(totalCategories)
                .totalSuppliers(totalSuppliers)
                .totalCustomers(totalCustomers)
                .lowStockCount(lowStock)
                .outOfStockCount(outOfStock)
                .totalSales(totalSales)
                .totalRevenue(totalRevenue)
                .build();
    }

    public List<SaleDto.Response> getRecentSales() {
        return saleRepository.findTop5ByOrderBySaleDateDesc().stream()
                .map(sale -> SaleDto.Response.builder()
                        .id(sale.getId())
                        .invoiceNumber(sale.getInvoiceNumber())
                        .customerName(sale.getCustomer() != null ? sale.getCustomer().getCustomerName() : "Walk-in")
                        .totalAmount(sale.getTotalAmount())
                        .saleDate(sale.getSaleDate())
                        .status(sale.getStatus().name())
                        .build())
                .collect(Collectors.toList());
    }

    public List<PurchaseOrderDto.Response> getRecentPurchases() {
        return purchaseOrderRepository.findTop5ByOrderByOrderDateDesc().stream()
                .map(po -> PurchaseOrderDto.Response.builder()
                        .id(po.getId())
                        .orderNumber(po.getOrderNumber())
                        .supplierName(po.getSupplier() != null ? po.getSupplier().getSupplierName() : "Unknown")
                        .totalAmount(po.getTotalAmount())
                        .orderDate(po.getOrderDate())
                        .status(po.getStatus().name())
                        .build())
                .collect(Collectors.toList());
    }

    public List<ProductDto.Response> getLowStock() {
        return productService.getLowStockProducts();
    }
}
