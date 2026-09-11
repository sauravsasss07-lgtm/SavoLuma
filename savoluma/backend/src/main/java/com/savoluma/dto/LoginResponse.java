package com.savoluma.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private boolean twoFactorRequired;
    private String challengeId;   // present only when twoFactorRequired = true
    /** Only populated when TWO_FACTOR_DEV_RETURN=true — never enable in production. */
    private String developmentOtpHint;

    private String token;         // present only when twoFactorRequired = false
    private String refreshToken;
    private String employeeId;
    private String name;
    private String role;
}
