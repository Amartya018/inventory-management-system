# Full-Stack Inventory Management System (IMS)

A professional, enterprise-grade **Inventory Management System** built with **Java 21 / 17, Spring Boot 3.x, MySQL 8, Hibernate JPA, Spring Security, JWT Authentication**, and a pure **HTML5, CSS3, and JavaScript** responsive frontend.

---

## 1. Project Architecture

```
inventory-management-system/
│
├── src/main/java/com/inventory/
│   ├── InventoryApplication.java       # Spring Boot Main Entry Point
│   ├── config/                         # Security & Data Bootstrap Config
│   │   ├── SecurityConfig.java         # Spring Security 6 & JWT Filter Chain
│   │   └── DataInitializer.java        # Initial Database Seeder
│   ├── controller/                     # RESTful API Endpoints
│   │   ├── AuthController.java         # /api/auth (Login & Registration)
│   │   ├── ProductController.java      # /api/products
│   │   ├── CategoryController.java     # /api/categories
│   │   ├── SupplierController.java     # /api/suppliers
│   │   ├── CustomerController.java     # /api/customers
│   │   ├── SaleController.java         # /api/sales & invoices
│   │   ├── PurchaseOrderController.java# /api/purchases
│   │   ├── StockMovementController.java# /api/stock-movements
│   │   ├── DashboardController.java    # /api/dashboard (Stats & Feeds)
│   │   └── UserController.java         # /api/users
│   ├── service/                        # Business Logic Layer
│   ├── repository/                     # Spring Data JPA Repositories
│   ├── entity/                         # Normalized JPA Relational Entities
│   ├── dto/                            # Data Transfer Objects & Validations
│   ├── exception/                      # Global Exception Handling
│   ├── security/                       # JWT Provider & Auth Filters
│   └── util/                           # Invoice & Order Number Generators
│
├── src/main/resources/
│   ├── application.properties          # MySQL Database Configuration
│   ├── application-dev.properties      # Standalone In-Memory Dev Profile
│   └── static/                         # Frontend Application (HTML/CSS/JS)
│       ├── index.html                  # Public Landing Page
│       ├── login.html                  # JWT Login Form
│       ├── dashboard.html              # Live Metrics & Overview
│       ├── products.html               # Product Management CRUD
│       ├── categories.html             # Category Hierarchy CRUD
│       ├── suppliers.html              # Vendor Directory CRUD
│       ├── customers.html              # Customer Accounts CRUD
│       ├── sales.html                  # Sales POS, Cart & Invoicing
│       ├── purchases.html              # Purchase Orders & Goods Receiving
│       ├── stock.html                  # Stock Levels & Movement Audit Log
│       ├── reports.html                # Visual Analytics (Chart.js)
│       ├── settings.html               # Profile, Themes & Security
│       ├── css/                        # Responsive Enterprise CSS
│       └── js/                         # Fetch API Client & Page Controllers
│           ├── api.js                  # Master Fetch Client + Toast System
│           └── auth.js                 # JWT Session & Role Guard
│
├── database/
│   ├── schema.sql                      # Complete MySQL 8 Relational Schema
│   └── data.sql                        # Default Initial Seed Records
├── pom.xml                             # Maven Dependencies & Build Setup
└── README.md                           # Documentation & Setup Guide
```

---

## 2. Key Features

- **JWT Authentication & Role-Based Access:**
  - **ADMIN:** Unrestricted system access, user management, deletions.
  - **MANAGER:** Inventory management, suppliers, purchases, sales, and analytics.
  - **STAFF:** View catalog, check stock levels, and process customer sales.
- **Transactional Stock Management:**
  - Adding a sale automatically decreases stock in real-time.
  - Hard constraint against negative inventory (prevents selling more than on hand).
  - Receiving purchase orders automatically increments product stock.
  - Complete, unalterable stock movement audit trail (`IN`, `OUT`, `ADJUSTMENT`).
- **Invoicing & Print Modal:**
  - Unique invoice numbers (e.g. `INV-20261124-0001`).
  - Printable sales invoice view ready for thermal or standard A4 printers.
- **Live Executive Dashboard:**
  - Total Products, Categories, Suppliers, Low-Stock items, Total Sales, and Gross Revenue.
  - Dynamic stock distribution charts powered by Chart.js.
- **Enterprise UI/UX:**
  - Modern design, animated toast notifications, empty states, and dark mode.

---

## 3. Technology Stack

- **Backend:** Java 17 / 21, Spring Boot 3.2.0
- **Security:** Spring Security 6, JJWT 0.12.3, BCrypt
- **ORM / Persistence:** Spring Data JPA, Hibernate ORM
- **Database:** MySQL 8.0 (Production) / H2 (Development & Testing)
- **Frontend:** HTML5, CSS3, JavaScript (Fetch API, Chart.js, Font Awesome)
- **Build Tool:** Apache Maven 3.9+

---

## 4. Default Seed Accounts

The application automatically seeds default accounts on first run:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin@ims.com` | `admin123` | Full Access + User Management |
| **Manager** | `manager@ims.com` | `manager123` | Inventory, Purchases, Sales, Reports |
| **Staff** | `staff@ims.com` | `staff123` | View Inventory, Process Sales |

---

## 5. Database Setup (MySQL 8)

1. Open MySQL Workbench or MySQL CLI:
   ```sql
   CREATE DATABASE inventory_management;
   ```
2. Execute the provided script to initialize tables:
   ```bash
   mysql -u root -p inventory_management < database/schema.sql
   mysql -u root -p inventory_management < database/data.sql
   ```
3. Update your credentials in `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/inventory_management?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
   spring.datasource.username=root
   spring.datasource.password=YOUR_MYSQL_PASSWORD
   ```

---

## 6. How to Run the Application

### Option A: Running with Local MySQL
```bash
# Navigate to the project root
cd inventory-management-system

# Build and run with Maven
mvn spring-boot:run
```

### Option B: Running in Standalone Dev Mode (Zero-Config In-Memory DB)
If MySQL is not installed or configured on the machine, you can run in standalone dev mode using the embedded H2 database (in MySQL compatibility mode):
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### Accessing the Application
- **Frontend Application:** [http://localhost:8080/](http://localhost:8080/)
- **Direct Login Page:** [http://localhost:8080/login.html](http://localhost:8080/login.html)
- **H2 Database Console (Dev profile only):** [http://localhost:8080/h2-console](http://localhost:8080/h2-console)

---

## 7. REST API Documentation

### Auth
- `POST /api/auth/login` - Authenticate with email and password, returns JWT token.

### Products
- `GET /api/products` - List all products (supports `?search=` and `?categoryId=`).
- `GET /api/products/{id}` - Get product by ID.
- `GET /api/products/search?keyword=...` - Search products by name/SKU.
- `GET /api/products/low-stock` - Get products below minimum stock threshold.
- `POST /api/products` - Create new product (ADMIN/MANAGER).
- `PUT /api/products/{id}` - Update product (ADMIN/MANAGER).
- `DELETE /api/products/{id}` - Delete product (ADMIN/MANAGER).

### Categories, Suppliers & Customers
- Complete CRUD endpoints under `/api/categories`, `/api/suppliers`, `/api/customers`.

### Sales & Invoices
- `GET /api/sales` - List all sales orders.
- `GET /api/sales/{id}/invoice` - Retrieve formatted invoice data.
- `POST /api/sales` - Place multi-item order (decreases stock, logs movement).

### Purchase Orders
- `GET /api/purchases` - List purchase orders.
- `POST /api/purchases` - Create purchase order.
- `PUT /api/purchases/{id}/receive` - Mark order as received (increases stock, logs movement).

### Dashboard & Analytics
- `GET /api/dashboard/stats` - Summary statistics (Products, Categories, Suppliers, Low Stock, Sales, Revenue).
- `GET /api/dashboard/recent-sales` - 5 most recent sales.
- `GET /api/dashboard/recent-purchases` - 5 most recent purchase orders.
- `GET /api/stock-movements` - Full audit trail of stock movements.

---

## 8. Testing

Run the automated test suite with Maven:
```bash
mvn test
```
The test suite validates:
1. Application context loading
2. JWT generation and password authentication with BCrypt
3. Product, Category, and Supplier CRUD operations
4. Dashboard analytics calculations
