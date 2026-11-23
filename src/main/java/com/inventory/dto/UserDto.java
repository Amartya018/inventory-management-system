package com.inventory.dto;

import com.inventory.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

public class UserDto {

    @Getter @Setter
    public static class RegisterRequest {
        @NotBlank(message = "Full name is required")
        private String fullName;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;

        private User.Role role = User.Role.STAFF;
    }

    @Getter @Setter
    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;
    }

    @Getter @Setter @Builder
    public static class LoginResponse {
        private String token;
        @Builder.Default
        private String tokenType = "Bearer";
        private Long id;
        private String fullName;
        private String email;
        private String role;
    }

    @Getter @Setter @Builder
    public static class UserResponse {
        private Long id;
        private String fullName;
        private String email;
        private String role;
        private LocalDateTime createdAt;
    }
}
