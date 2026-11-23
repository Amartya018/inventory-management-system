package com.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

public class CategoryDto {

    @Getter @Setter
    public static class Request {
        @NotBlank(message = "Category name is required")
        private String categoryName;

        private String description;
    }

    @Getter @Setter @Builder
    public static class Response {
        private Long id;
        private String categoryName;
        private String description;
    }
}
