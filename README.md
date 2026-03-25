# Flipkart Inventory Management System

A full-stack inventory management app with a **Spring Boot + MySQL** backend and a **vanilla HTML/CSS/JS** frontend.

## What You Can Do

- Manage products and categories (CRUD)
- Track stock levels (low stock / out of stock)
- View dashboard KPIs + recent products
- Explore an **Inventory Overview** screen that aggregates product stats
- Adjust **Settings** (UI-only for now)

## Tech Stack

**Backend**
- Java 17, Spring Boot 3.5.10
- Spring Data JPA, Validation
- MySQL 8+
- Maven

**Frontend**
- HTML, CSS, JavaScript (no framework)

## Project Structure

```
Flipcart_inventory_management_Java_backend/
├── flipkart/                 # Spring Boot backend
│   ├── src/
│   ├── pom.xml
│   └── mvnw / mvnw.cmd
├── ui/                       # Frontend
│   ├── css/
│   ├── js/
│   ├── index.html
│   ├── products.html
│   ├── categories.html
│   ├── add-product.html
│   ├── edit-product.html
│   ├── product-detail.html
│   ├── inventory-overview.html
│   └── settings.html
├── TESTING.md
├── TODO.md
└── README.md
```

## Getting Started

### Prerequisites

- Java 17+
- Maven 3.6+
- MySQL 8+
- A browser or a static server (Live Server / http-server)

### 1) Backend Setup

1. Configure MySQL in `flipkart/src/main/resources/application.properties`.
2. From the project root:

```bash
cd flipkart
mvn spring-boot:run
```

Backend runs at `http://localhost:8080`.

### 2) Frontend Setup

Serve the `ui/` folder using any static server (or Live Server in VS Code).

Example:
```bash
cd ui
python -m http.server 5500
```

Open `http://localhost:5500/ui/index.html` (adjust port if needed).

## API Overview

### Products

- `GET /api/products` (pagination + filters)
- `GET /api/products/{id}`
- `GET /api/products/category/{categoryId}`
- `GET /api/products/recent?limit=10`
- `POST /api/products`
- `PUT /api/products/{id}`
- `DELETE /api/products/{id}`

**Product payload**
```json
{
  "name": "Smartphone",
  "description": "Flagship phone",
  "price": 999.99,
  "discount": 5,
  "quantity": 50,
  "categoryId": 1,
  "status": "ACTIVE",
  "imageUrl": "/assets/icons/product-placeholder.svg"
}
```

**Status values**
- `ACTIVE`
- `OUT_OF_STOCK`
- `DISCONTINUED`

### Categories

- `GET /api/categories`
- `GET /api/categories/{id}`
- `POST /api/categories`
- `PUT /api/categories/{id}`
- `DELETE /api/categories/{id}`

### Dashboard

- `GET /api/dashboard/stats`

Returns:
```json
{
  "totalProducts": 0,
  "totalCategories": 0,
  "outOfStockProducts": 0,
  "lowStockProducts": 0
}
```

## Inventory Overview (Live Data)

`ui/inventory-overview.html` is wired to the backend:

- KPIs use `/api/dashboard/stats`
- Tables use `/api/products` + `/api/categories`
- Aggregates are computed on the client (avg stock, low stock ratios)

## Notes

- `imageUrl` is required in the backend (`@NotNull`).
- The frontend currently uses a placeholder image path by default.
- Settings UI is present but not persisted yet.

## Tests

See `TESTING.md` for curl samples and API testing instructions.

## Future Enhancements

- Authentication & RBAC
- File uploads for product images
- Real settings persistence
- Inventory analytics charts
- Bulk import/export
