package com.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

public class CustomerDto {

    @Getter @Setter
    public static class Request {
        @NotBlank(message = "Customer name is required")
        private String customerName;

        private String email;
        private String phone;
        private String address;
    }

    @Getter @Setter @Builder
    public static class Response {
        private Long id;
        private String customerName;
        private String email;
        private String phone;
        private String address;
    }
}
