package com.inventory;

import com.inventory.dto.*;
import com.inventory.service.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("dev")
class InventoryApplicationTests {

    @Autowired
    private UserService userService;

    @Autowired
    private ProductService productService;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private SupplierService supplierService;

    @Autowired
    private CustomerService customerService;

    @Autowired
    private DashboardService dashboardService;

    @Test
    void contextLoads() {
        assertNotNull(userService);
        assertNotNull(productService);
        assertNotNull(dashboardService);
    }

    @Test
    void testLoginWithSeededAdmin() {
        UserDto.LoginRequest loginReq = new UserDto.LoginRequest();
        loginReq.setEmail("admin@ims.com");
        loginReq.setPassword("admin123");

        UserDto.LoginResponse response = userService.login(loginReq);
        assertNotNull(response);
        assertNotNull(response.getToken());
        assertEquals("ADMIN", response.getRole());
    }

    @Test
    void testDashboardStats() {
        DashboardDto stats = dashboardService.getDashboardStats();
        assertNotNull(stats);
        assertTrue(stats.getTotalProducts() >= 4);
        assertTrue(stats.getTotalCategories() >= 3);
        assertTrue(stats.getTotalSuppliers() >= 2);
    }

    @Test
    void testProductCrud() {
        List<CategoryDto.Response> categories = categoryService.getAllCategories();
        assertFalse(categories.isEmpty());
        Long catId = categories.get(0).getId();

        List<SupplierDto.Response> suppliers = supplierService.getAllSuppliers();
        assertFalse(suppliers.isEmpty());
        Long supId = suppliers.get(0).getId();

        ProductDto.Request req = new ProductDto.Request();
        req.setProductName("Test Monitor");
        req.setSku("SKU-TEST-001");
        req.setDescription("27-inch 4K Monitor");
        req.setCategoryId(catId);
        req.setSupplierId(supId);
        req.setPurchasePrice(new BigDecimal("15000.00"));
        req.setSellingPrice(new BigDecimal("22000.00"));
        req.setQuantity(20);
        req.setMinimumStock(5);
        req.setUnit("units");

        ProductDto.Response created = productService.createProduct(req);
        assertNotNull(created.getId());
        assertEquals("Test Monitor", created.getProductName());

        ProductDto.Response fetched = productService.getProductById(created.getId());
        assertEquals(20, fetched.getQuantity());

        productService.deleteProduct(created.getId());
    }
}
