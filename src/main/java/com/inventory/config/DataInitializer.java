package com.inventory.config;

import com.inventory.entity.*;
import com.inventory.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private StockMovementRepository stockMovementRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // 1. Create default users if none exist
        User admin = null;
        if (userRepository.count() == 0) {
            admin = User.builder()
                    .fullName("System Admin")
                    .email("admin@ims.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(User.Role.ADMIN)
                    .build();
            userRepository.save(admin);

            User manager = User.builder()
                    .fullName("Store Manager")
                    .email("manager@ims.com")
                    .password(passwordEncoder.encode("manager123"))
                    .role(User.Role.MANAGER)
                    .build();
            userRepository.save(manager);

            User staff = User.builder()
                    .fullName("Store Staff")
                    .email("staff@ims.com")
                    .password(passwordEncoder.encode("staff123"))
                    .role(User.Role.STAFF)
                    .build();
            userRepository.save(staff);

            logger.info("Default users created: admin@ims.com, manager@ims.com, staff@ims.com");
        } else {
            admin = userRepository.findByEmail("admin@ims.com").orElse(null);
        }

        // 2. Create sample categories if none exist
        Category electronics = null;
        Category accessories = null;
        Category office = null;
        if (categoryRepository.count() == 0) {
            electronics = categoryRepository.save(Category.builder()
                    .categoryName("Electronics")
                    .description("Laptops, monitors and devices")
                    .build());
            accessories = categoryRepository.save(Category.builder()
                    .categoryName("Computer Accessories")
                    .description("Keyboards, mice, and peripherals")
                    .build());
            office = categoryRepository.save(Category.builder()
                    .categoryName("Office Equipment")
                    .description("Printers and office hardware")
                    .build());
            logger.info("Sample categories initialized");
        }

        // 3. Create sample suppliers if none exist
        Supplier techDistro = null;
        Supplier primePeripherals = null;
        if (supplierRepository.count() == 0) {
            techDistro = supplierRepository.save(Supplier.builder()
                    .supplierName("TechDistro Global Inc.")
                    .email("sales@techdistro.com")
                    .phone("+1-555-0199")
                    .address("100 Technology Way, San Jose, CA")
                    .build());
            primePeripherals = supplierRepository.save(Supplier.builder()
                    .supplierName("Prime Peripherals Supply")
                    .email("contact@primeperipherals.com")
                    .phone("+1-555-0377")
                    .address("78 Hardware Ave, Austin, TX")
                    .build());
            logger.info("Sample suppliers initialized");
        }

        // 4. Create sample customers if none exist
        if (customerRepository.count() == 0) {
            customerRepository.save(Customer.builder()
                    .customerName("Acme Technologies")
                    .email("procurement@acme.com")
                    .phone("+1-555-1001")
                    .address("12 Industry Square, Seattle, WA")
                    .build());
            customerRepository.save(Customer.builder()
                    .customerName("Walk-in Retail Customer")
                    .email("walkin@ims.local")
                    .phone("+1-555-0000")
                    .address("Store Front Counter")
                    .build());
            logger.info("Sample customers initialized");
        }

        // 5. Create sample products if none exist
        if (productRepository.count() == 0 && electronics != null && accessories != null) {
            Product laptop = productRepository.save(Product.builder()
                    .productName("ThinkPad Pro Laptop")
                    .sku("SKU-LAP-001")
                    .description("Core i7, 16GB RAM, 512GB SSD")
                    .category(electronics)
                    .supplier(techDistro)
                    .purchasePrice(new BigDecimal("45000.00"))
                    .sellingPrice(new BigDecimal("58000.00"))
                    .quantity(25)
                    .minimumStock(5)
                    .unit("units")
                    .build());

            Product mouse = productRepository.save(Product.builder()
                    .productName("Wireless Mouse")
                    .sku("SKU-MOU-002")
                    .description("2.4GHz optical ergonomic mouse")
                    .category(accessories)
                    .supplier(primePeripherals)
                    .purchasePrice(new BigDecimal("450.00"))
                    .sellingPrice(new BigDecimal("850.00"))
                    .quantity(50)
                    .minimumStock(10)
                    .unit("pcs")
                    .build());

            Product keyboard = productRepository.save(Product.builder()
                    .productName("Mechanical Keyboard")
                    .sku("SKU-KEY-003")
                    .description("RGB backlit mechanical keyboard")
                    .category(accessories)
                    .supplier(primePeripherals)
                    .purchasePrice(new BigDecimal("1800.00"))
                    .sellingPrice(new BigDecimal("2999.00"))
                    .quantity(8) // low stock (< 10)
                    .minimumStock(10)
                    .unit("pcs")
                    .build());

            Product printer = productRepository.save(Product.builder()
                    .productName("LaserJet Printer")
                    .sku("SKU-PRI-004")
                    .description("Monochrome wireless laser printer")
                    .category(office)
                    .supplier(techDistro)
                    .purchasePrice(new BigDecimal("12000.00"))
                    .sellingPrice(new BigDecimal("16500.00"))
                    .quantity(4) // low stock
                    .minimumStock(8)
                    .unit("units")
                    .build());

            // Log initial stock movements
            if (admin != null) {
                stockMovementRepository.save(StockMovement.builder()
                        .product(laptop)
                        .movementType(StockMovement.MovementType.IN)
                        .quantity(25)
                        .reference("INITIAL-STOCK")
                        .movementDate(LocalDateTime.now())
                        .user(admin)
                        .build());
                stockMovementRepository.save(StockMovement.builder()
                        .product(mouse)
                        .movementType(StockMovement.MovementType.IN)
                        .quantity(50)
                        .reference("INITIAL-STOCK")
                        .movementDate(LocalDateTime.now())
                        .user(admin)
                        .build());
            }

            logger.info("Sample products and stock movements initialized");
        }
    }
}
