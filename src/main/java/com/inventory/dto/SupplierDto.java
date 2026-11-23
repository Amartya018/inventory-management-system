package com.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

public class SupplierDto {

    @Getter @Setter
    public static class Request {
        @NotBlank(message = "Supplier name is required")
        private String supplierName;

        private String email;
        private String phone;
        private String address;
    }

    @Getter @Setter @Builder
    public static class Response {
        private Long id;
        private String supplierName;
        private String email;
        private String phone;
        private String address;
    }
}
