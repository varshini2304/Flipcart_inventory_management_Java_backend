
## API Endpoints for Testing

### Products
- `GET /api/products` - Get all products (supports pagination & filtering: page, size, search, categoryId, status, minPrice, maxPrice, sort)
- `GET /api/products/{id}` - Get product by ID
- `GET /api/products/category/{categoryId}` - Get products by category
- `GET /api/products/recent` - Get recent products (param: limit)
- `POST /api/products` - Create a new product
- `PUT /api/products/{id}` - Update a product
- `DELETE /api/products/{id}` - Delete a product

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/{id}` - Get category by ID
- `POST /api/categories` - Create a new category
- `PUT /api/categories/{id}` - Update a category
- `DELETE /api/categories/{id}` - Delete a category

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
