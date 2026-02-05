# API Testing Guide

Use these `curl` commands to test your application scenarios. Ensure your backend is running on `http://localhost:8080`.

## 1. Category Management

### Create a Category
```bash
curl -X POST http://localhost:8080/api/categories \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Electronics\", \"description\": \"Gadgets and devices\"}"
```

### Get All Categories
```bash
curl http://localhost:8080/api/categories
```

### Update a Category (Assuming ID 1)
```bash
curl -X PUT http://localhost:8080/api/categories/1 \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Smart Electronics\", \"description\": \"Updated description\"}"
```

## 2. Product Management

### Create a Product (Linked to Category 1)
```bash
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Smartphone\", \"description\": \"Flagship phone\", \"price\": 999.99, \"discount\": 5.0, \"quantity\": 50, \"categoryId\": 1, \"imageUrl\": \"\"}"
```

### Get All Products (Pagination)
```bash
curl "http://localhost:8080/api/products?page=1&size=10"
```

### Get Product by ID (Assuming ID 1)
```bash
curl http://localhost:8080/api/products/1
```

### Update Product (Assuming ID 1)
```bash
curl -X PUT http://localhost:8080/api/products/1 \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Smartphone Pro\", \"description\": \"Updated flagship\", \"price\": 1099.99, \"discount\": 10.0, \"quantity\": 45, \"categoryId\": 1, \"status\": \"ACTIVE\"}"
```

### Filter Products (Search & Price)
```bash
curl "http://localhost:8080/api/products?search=Smart&minPrice=500&maxPrice=2000"
```

### Get Products by Category (Category ID 1)
```bash
curl http://localhost:8080/api/products/category/1
```

## 3. Dashboard Scenarios

### Get Dashboard Stats
*Should return counts for products, categories, and stock status.*
```bash
curl http://localhost:8080/api/dashboard/stats
```

### Get Recent Products
*Should return the most recently added products.*
```bash
curl "http://localhost:8080/api/products/recent?limit=5"
```

## 4. Cleanup Scenarios

### Delete Product (ID 1)
```bash
curl -X DELETE http://localhost:8080/api/products/1
```

### Delete Category (ID 1)
```bash
curl -X DELETE http://localhost:8080/api/categories/1
```