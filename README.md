# Flipkart Inventory Management System

A full-stack web application for managing product inventory with categories, built using **Spring Boot** backend and **HTML/CSS/JavaScript** frontend.

## Project Overview

This inventory management system provides a comprehensive solution for managing products and categories in an e-commerce environment. It features a robust Java Spring Boot REST API backend and an interactive web-based frontend interface.

## Tech Stack

### Backend
- **Framework**: Spring Boot 3.5.10
- **Language**: Java 17
- **Database**: MySQL
- **Build Tool**: Maven
- **ORM**: Spring Data JPA
- **Additional Libraries**:
  - Lombok (for boilerplate reduction)
  - Spring Boot Validation
  - Spring Boot Web (REST APIs)

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling
- **JavaScript** - Interactivity
- **Vanilla JS** (No framework dependencies)

## Project Structure

```
Flipkart_inventory_management_Java_backend/
├── flipkart/                    # Java Spring Boot Backend
│   ├── src/                  # Source code
│   ├── .mvn/wrapper/         # Maven wrapper
│   ├── pom.xml               # Maven configuration
│   ├── mvnw                 # Maven wrapper script
│   └── mvnw.cmd             # Maven wrapper for Windows
├── ui/                      # Frontend Application
│   ├── css/                 # Stylesheets
│   ├── js/                  # JavaScript files
│   ├── index.html           # Dashboard page
│   ├── products.html        # Products listing page
│   ├── categories.html      # Categories page
│   ├── add-product.html     # Add product form
│   ├── edit-product.html    # Edit product form
│   └── product-detail.html  # Product details page
├── TESTING.md              # API Testing Guide
├── TODO.md                 # API Endpoints Reference
└── README.md               # This file
```

## Getting Started

### Prerequisites
- Java 17 or higher
- Maven 3.6+
- MySQL Server 8.0+
- Modern web browser

### Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd flipkart
   ```

2. **Configure database** (application.properties):
   - Update MySQL connection details
   - Set database name, username, and password

3. **Build the project**:
   ```bash
   mvn clean install
   ```

4. **Run the application**:
   ```bash
   mvn spring-boot:run
   ```

   The backend will start on `http://localhost:8080`

### Frontend Setup

1. **Navigate to the UI directory**:
   ```bash
   cd ui
   ```

2. **Serve the frontend**:
   - Use any simple HTTP server or IDE's live server
   - Example: `python -m http.server 3000` or VS Code Live Server extension

3. **Access the application**:
   - Open browser and go to `http://localhost:3000` (or configured port)

## API Endpoints

### Products

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| GET | `/api/products` | Get all products with pagination & filtering | page, size, search, categoryId, status, minPrice, maxPrice, sort |
| GET | `/api/products/{id}` | Get product by ID | - |
| GET | `/api/products/category/{categoryId}` | Get products by category | - |
| GET | `/api/products/recent` | Get recent products | limit |
| POST | `/api/products` | Create a new product | name, description, price, discount, quantity, categoryId, imageUrl |
| PUT | `/api/products/{id}` | Update a product | name, description, price, discount, quantity, categoryId, status |
| DELETE | `/api/products/{id}` | Delete a product | - |

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | Get all categories |
| GET | `/api/categories/{id}` | Get category by ID |
| POST | `/api/categories` | Create a new category |
| PUT | `/api/categories/{id}` | Update a category |
| DELETE | `/api/categories/{id}` | Delete a category |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Get dashboard statistics (counts & status) |

## Testing

The project includes comprehensive API testing documentation.

### Using cURL

Ensure the backend is running on `http://localhost:8080`.

#### Create a Category
```bash
curl -X POST http://localhost:8080/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name": "Electronics", "description": "Gadgets and devices"}'
```

#### Get All Categories
```bash
curl http://localhost:8080/api/categories
```

#### Create a Product
```bash
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Smartphone", "description": "Flagship phone", "price": 999.99, "discount": 5.0, "quantity": 50, "categoryId": 1, "imageUrl": ""}'
```

#### Get All Products (with pagination)
```bash
curl "http://localhost:8080/api/products?page=1&size=10"
```

#### Filter Products
```bash
curl "http://localhost:8080/api/products?search=Smart&minPrice=500&maxPrice=2000"
```

For more testing examples, see [TESTING.md](TESTING.md)

## Features

### Product Management
- ✓ Create, read, update, and delete products
- ✓ Product pagination and filtering
- ✓ Search products by name
- ✓ Filter by price range
- ✓ Filter by category
- ✓ Discount management
- ✓ Stock quantity tracking
- ✓ Product status management (ACTIVE/INACTIVE)

### Category Management
- ✓ Create and manage product categories
- ✓ Update category information
- ✓ Delete categories
- ✓ Link products to categories

### Dashboard
- ✓ View inventory statistics
- ✓ See product counts
- ✓ Monitor stock status
- ✓ View recent products

## Future Enhancements

- [ ] User authentication and authorization
- [ ] Advanced inventory analytics
- [ ] Bulk import/export functionality
- [ ] Order management system
- [ ] Supplier management
- [ ] Stock alerts and notifications
- [ ] Image upload functionality
- [ ] Role-based access control (RBAC)
- [ ] API rate limiting
- [ ] Comprehensive logging and monitoring

## Database Schema

### Products Table
- `id` - Primary key
- `name` - Product name
- `description` - Product description
- `price` - Current price
- `discount` - Discount percentage
- `quantity` - Stock quantity
- `status` - Product status (ACTIVE/INACTIVE)
- `category_id` - Foreign key to categories
- `image_url` - Product image URL
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Categories Table
- `id` - Primary key
- `name` - Category name
- `description` - Category description
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## Development Notes

- The backend uses Spring Boot's embedded Tomcat server
- All API responses follow RESTful conventions
- Frontend communicates with backend via fetch API
- CORS is configured to allow frontend requests
- Database migrations are handled by Hibernate

## Browser Support

- Chrome/Edge (latest versions)
- Firefox (latest versions)
- Safari (latest versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

Contributions are welcome! Please ensure:
1. Code follows existing style conventions
2. All features are properly tested
3. Documentation is updated
4. Commit messages are descriptive

## License

This project is open source and available under the MIT License.

## Contact

For questions or suggestions, please reach out to the project maintainers.

## Acknowledgments

- Spring Boot documentation and community
- MySQL documentation
- Frontend development best practices
