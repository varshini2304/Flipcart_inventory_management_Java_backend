package com.flipkart.dto;

import lombok.Data;

@Data
public class DashboardStatsDto {
    private long totalProducts;
    private long totalCategories;
    private long outOfStockProducts;
    private long lowStockProducts;
}