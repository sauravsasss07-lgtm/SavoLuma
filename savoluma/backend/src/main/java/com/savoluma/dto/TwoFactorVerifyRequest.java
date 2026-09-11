package com.savoluma.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TwoFactorVerifyRequest {

    @NotBlank
    private String challengeId;

    @NotBlank
    private String code;

    @NotBlank
    private String username;
}
