package com.flipkart.service;

import com.flipkart.dto.ProductDto;
import java.util.List;

public interface ProductService {
    ProductDto addProduct(ProductDto productDto);
    ProductDto updateProduct(Long productId, ProductDto productDto);
    void deleteProduct(Long productId);
    List<ProductDto> getAllProducts();
    List<ProductDto> getProductsByCategory(Long categoryId);
    ProductDto getProductById(Long productId);
}
