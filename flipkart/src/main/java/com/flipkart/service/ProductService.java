package com.flipkart.service;

import com.flipkart.dto.ProductDto;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductService {
    ProductDto addProduct(ProductDto productDto);

    ProductDto updateProduct(Long productId, ProductDto productDto);

    void deleteProduct(Long productId);

    Page<ProductDto> getAllProducts(Pageable pageable, String search, Long categoryId, String status,
            BigDecimal minPrice, BigDecimal maxPrice);

    List<ProductDto> getProductsByCategory(Long categoryId);

    ProductDto getProductById(Long productId);

    List<ProductDto> getRecentProducts(int limit);
}
