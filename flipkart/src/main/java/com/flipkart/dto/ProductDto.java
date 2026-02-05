package com.flipkart.dto;

import com.flipkart.enums.ProductStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductDto {

    private Long id;

    @NotBlank(message = "Product name cannot be blank")
    private String name;

    private String description;

    @NotNull(message = "Price cannot be null")
    @Positive(message = "Price must be positive")
    private Double price;

    @Min(value = 0, message = "Discount must be between 0 and 100")
    @Max(value = 100, message = "Discount must be between 0 and 100")
    private Integer discount;

    @NotNull(message = "Quantity cannot be null")
    @Min(value = 0, message = "Quantity cannot be negative")
    private Integer quantity;

    private ProductStatus status;

    @NotNull(message = "Category ID cannot be null")
    private Long categoryId;

    @NotNull(message = "image url cannot be null")
    private String imageUrl;
}
