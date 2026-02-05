package com.flipkart.service.impl;

import com.flipkart.dto.DashboardStatsDto;
import com.flipkart.repository.CategoryRepository;
import com.flipkart.repository.ProductRepository;
import com.flipkart.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public DashboardStatsDto getStats() {
        DashboardStatsDto stats = new DashboardStatsDto();

        stats.setTotalProducts(productRepository.count());
        stats.setTotalCategories(categoryRepository.count());

        stats.setOutOfStockProducts(productRepository.countByQuantity(0));
        stats.setLowStockProducts(productRepository.countByQuantityLessThanEqual(5));

        return stats;
    }
}