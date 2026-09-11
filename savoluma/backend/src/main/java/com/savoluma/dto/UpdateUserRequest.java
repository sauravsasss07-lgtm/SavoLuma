package com.savoluma.dto;

import jakarta.validation.constraints.Email;
import lombok.Data;

/**
 * Partial employee update. All fields optional — unlike CreateUserRequest,
 * this must not require a password or username on every save.
 */
@Data
public class UpdateUserRequest {

    private String fullName;

    @Email
    private String email;

    private String phone;
    private String department;
    private String team;
    private String title;
    private String managerId;
}
