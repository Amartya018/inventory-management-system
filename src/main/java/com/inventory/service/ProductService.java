package com.inventory.service;

import com.inventory.dto.ProductDto;
import com.inventory.entity.Category;
import com.inventory.entity.Product;
import com.inventory.entity.Supplier;
import com.inventory.exception.BusinessException;
import com.inventory.exception.ResourceNotFoundException;
import com.inventory.repository.CategoryRepository;
import com.inventory.repository.ProductRepository;
import com.inventory.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Transactional(readOnly = true)
    public List<ProductDto.Response> getAllProducts() {
        return productRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductDto.Response> searchProducts(String name) {
        return productRepository.findByProductNameContainingIgnoreCase(name)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductDto.Response> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductDto.Response> getLowStockProducts() {
        return productRepository.findLowStockProducts()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductDto.Response getProductById(Long id) {
        return toResponse(findById(id));
    }

    public ProductDto.Response createProduct(ProductDto.Request request) {
        if (request.getSku() != null && !request.getSku().isBlank()
                && productRepository.existsBySku(request.getSku())) {
            throw new BusinessException("Product with SKU already exists: " + request.getSku());
        }

        Product product = buildProduct(new Product(), request);
        return toResponse(productRepository.save(product));
    }

    public ProductDto.Response updateProduct(Long id, ProductDto.Request request) {
        Product product = findById(id);

        // Check SKU conflict (not same product)
        if (request.getSku() != null && !request.getSku().isBlank()) {
            productRepository.findBySku(request.getSku())
                    .ifPresent(existing -> {
                        if (!existing.getId().equals(id)) {
                            throw new BusinessException("SKU already in use: " + request.getSku());
                        }
                    });
        }

        buildProduct(product, request);
        return toResponse(productRepository.save(product));
    }

    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product", id);
        }
        productRepository.deleteById(id);
    }

    public Product findById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
    }

    private Product buildProduct(Product product, ProductDto.Request request) {
        product.setProductName(request.getProductName());
        product.setSku(request.getSku());
        product.setDescription(request.getDescription());
        product.setPurchasePrice(request.getPurchasePrice());
        product.setSellingPrice(request.getSellingPrice());
        product.setUnit(request.getUnit());

        if (request.getQuantity() != null) {
            product.setQuantity(request.getQuantity());
        }
        if (request.getMinimumStock() != null) {
            product.setMinimumStock(request.getMinimumStock());
        }

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));
            product.setCategory(category);
        }

        if (request.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier", request.getSupplierId()));
            product.setSupplier(supplier);
        }

        return product;
    }

    public ProductDto.Response toResponse(Product p) {
        String stockStatus;
        if (p.getQuantity() == 0) {
            stockStatus = "OUT_OF_STOCK";
        } else if (p.getQuantity() <= p.getMinimumStock()) {
            stockStatus = "LOW_STOCK";
        } else {
            stockStatus = "IN_STOCK";
        }

        BigDecimal profit = BigDecimal.ZERO;
        if (p.getSellingPrice() != null && p.getPurchasePrice() != null) {
            profit = p.getSellingPrice().subtract(p.getPurchasePrice());
        }

        return ProductDto.Response.builder()
                .id(p.getId())
                .productName(p.getProductName())
                .sku(p.getSku())
                .description(p.getDescription())
                .categoryId(p.getCategory() != null ? p.getCategory().getId() : null)
                .categoryName(p.getCategory() != null ? p.getCategory().getCategoryName() : null)
                .supplierId(p.getSupplier() != null ? p.getSupplier().getId() : null)
                .supplierName(p.getSupplier() != null ? p.getSupplier().getSupplierName() : null)
                .purchasePrice(p.getPurchasePrice())
                .sellingPrice(p.getSellingPrice())
                .profit(profit)
                .quantity(p.getQuantity())
                .minimumStock(p.getMinimumStock())
                .unit(p.getUnit())
                .stockStatus(stockStatus)
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
