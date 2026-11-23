-- =============================================================================
-- INVENTORY MANAGEMENT SYSTEM - INITIAL SEED DATA
-- Database Name: inventory_management
-- =============================================================================

USE inventory_management;

-- 1. SEED USERS (Password for all is 'admin123', 'manager123', 'staff123' hashed with BCrypt)
INSERT INTO users (id, full_name, email, password, role, created_at)
VALUES 
(1, 'System Administrator', 'admin@ims.com', '$2a$10$e8w.U5O26mI3O43jV5jEfeP30r7oM6tW2BkgK2.a8w49o9xG7qCSu', 'ADMIN', NOW()),
(2, 'Operations Manager', 'manager@ims.com', '$2a$10$V08Z4UfB50p2oW5oV2K.2eC/4FkM0kX2Y0z8f2tN1vQ6uA5sO3hG6', 'MANAGER', NOW()),
(3, 'Store Staff', 'staff@ims.com', '$2a$10$Q7y0B3mK9oX1oT4nV1K.3eC/3FkL9kX1Y9z7f1tM0vP5uA4sN2hF5', 'STAFF', NOW())
ON DUPLICATE KEY UPDATE id=id;

-- 2. SEED CATEGORIES
INSERT INTO categories (id, category_name, description)
VALUES
(1, 'Electronics', 'Consumer electronics, laptops, monitors and related computing devices'),
(2, 'Computer Accessories', 'Peripherals, mice, keyboards, cables and adapters'),
(3, 'Office Equipment', 'Printers, scanners, shredders and office stationery supplies'),
(4, 'Networking', 'Routers, switches, patch cables and network infrastructure')
ON DUPLICATE KEY UPDATE id=id;

-- 3. SEED SUPPLIERS
INSERT INTO suppliers (id, supplier_name, email, phone, address)
VALUES
(1, 'TechDistro Global Inc.', 'sales@techdistro.com', '+1-555-0199', '100 Technology Way, San Jose, CA'),
(2, 'OfficePro Logistics Ltd.', 'orders@officepro.com', '+1-555-0244', '45 Business Park Blvd, Chicago, IL'),
(3, 'Prime Peripherals Supply', 'contact@primeperipherals.com', '+1-555-0377', '78 Hardware Ave, Austin, TX')
ON DUPLICATE KEY UPDATE id=id;

-- 4. SEED CUSTOMERS
INSERT INTO customers (id, customer_name, email, phone, address)
VALUES
(1, 'Acme Technologies', 'procurement@acme.com', '+1-555-1001', '12 Industry Square, Seattle, WA'),
(2, 'Apex Global Solutions', 'accounts@apexsolutions.com', '+1-555-2002', '55 Innovation Drive, Boston, MA'),
(3, 'Walk-in Retail Customer', 'walkin@ims.local', '+1-555-0000', 'Store Front Counter')
ON DUPLICATE KEY UPDATE id=id;

-- 5. SEED PRODUCTS
INSERT INTO products (id, product_name, sku, description, category_id, supplier_id, purchase_price, selling_price, quantity, minimum_stock, unit, created_at)
VALUES
(1, 'ThinkPad Pro Laptop 16GB', 'SKU-LAP-001', 'High performance business laptop with 16GB RAM and 512GB SSD', 1, 1, 45000.00, 58000.00, 25, 5, 'units', NOW()),
(2, 'Wireless Optical Mouse', 'SKU-MOU-002', 'Ergonomic 2.4GHz wireless mouse with USB receiver', 2, 3, 450.00, 850.00, 80, 15, 'pcs', NOW()),
(3, 'Mechanical Gaming Keyboard', 'SKU-KEY-003', 'RGB backlit mechanical keyboard with blue tactile switches', 2, 3, 1800.00, 2999.00, 45, 10, 'pcs', NOW()),
(4, 'LaserJet Pro Multi-function Printer', 'SKU-PRI-004', 'Monochrome high-speed duplex laser printer with scanner', 3, 2, 12000.00, 16500.00, 8, 10, 'units', NOW()),
(5, '4K Ultra-HD Monitor 27"', 'SKU-MON-005', 'IPS LED display 144Hz with HDR support and HDMI/DisplayPort', 1, 1, 14000.00, 19500.00, 18, 5, 'units', NOW()),
(6, 'Cat6 Shielded Ethernet Cable 5m', 'SKU-CAB-006', 'High speed Gigabit network cable with snagless connectors', 4, 3, 120.00, 250.00, 4, 15, 'pcs', NOW())
ON DUPLICATE KEY UPDATE id=id;

-- 6. SEED INITIAL STOCK MOVEMENTS
INSERT INTO stock_movements (id, product_id, movement_type, quantity, reference, movement_date, user_id)
VALUES
(1, 1, 'IN', 25, 'PO-INITIAL-0001', NOW(), 1),
(2, 2, 'IN', 80, 'PO-INITIAL-0001', NOW(), 1),
(3, 3, 'IN', 45, 'PO-INITIAL-0001', NOW(), 1),
(4, 4, 'IN', 8, 'PO-INITIAL-0002', NOW(), 1),
(5, 5, 'IN', 18, 'PO-INITIAL-0002', NOW(), 1),
(6, 6, 'IN', 4, 'PO-INITIAL-0003', NOW(), 1)
ON DUPLICATE KEY UPDATE id=id;
