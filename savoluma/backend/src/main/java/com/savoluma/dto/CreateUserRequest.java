package com.savoluma.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateUserRequest {

    @NotBlank
    private String fullName;

    @NotBlank @Email
    private String email;

    private String phone;

    @NotBlank
    private String role; // must match Role enum name

    private String department;
    private String team;
    private String managerId; // employeeId of manager, optional

    @NotBlank
    private String username;

    @NotBlank
    private String temporaryPassword;
}
