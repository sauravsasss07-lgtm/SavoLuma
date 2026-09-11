package com.savoluma.controller;

import com.savoluma.dto.LoginRequest;
import com.savoluma.dto.LoginResponse;
import com.savoluma.dto.TwoFactorVerifyRequest;
import com.savoluma.dto.UserDTO;
import com.savoluma.entity.User;
import com.savoluma.repository.UserRepository;
import com.savoluma.security.JwtUtil;
import com.savoluma.security.SavoUserPrincipal;
import com.savoluma.security.TwoFactorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final TwoFactorService twoFactorService;
    private final UserRepository userRepository;

    /**
     * Step 1 of login. Verifies credentials via Spring Security (which
     * internally re-checks isAccountNonLocked/isEnabled — a BLOCKED
     * employee's password will simply fail here, not just be hidden by
     * the frontend). If the account's role requires 2FA, a challenge is
     * returned instead of a token.
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
        } catch (Exception e) {
            throw new BadCredentialsException("Invalid username or password.");
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);
        SavoUserPrincipal principal = (SavoUserPrincipal) authentication.getPrincipal();
        User user = principal.getUser();

        if (twoFactorService.isRequiredForRole(user.getRole().name()) || user.isTwoFactorEnabled()) {
            var challenge = twoFactorService.createChallenge(user.getUsername());
            boolean echo = Boolean.parseBoolean(System.getenv().getOrDefault("TWO_FACTOR_DEV_RETURN", "false"));
            return ResponseEntity.ok(LoginResponse.builder()
                    .twoFactorRequired(true)
                    .challengeId(challenge.id())
                    .developmentOtpHint(echo ? challenge.code() : null)
                    .build());
        }

        user.setLastLoginAt(java.time.LocalDateTime.now());
        userRepository.save(user);
        return ResponseEntity.ok(buildTokenResponse(user));
    }

    /** Step 2 of login for roles that require 2FA (ADMIN, CEO, SUPER_ADMIN by default). */
    @PostMapping("/verify-2fa")
    public ResponseEntity<LoginResponse> verifyTwoFactor(@Valid @RequestBody TwoFactorVerifyRequest request) {
        boolean valid = twoFactorService.verify(request.getChallengeId(), request.getCode(), request.getUsername());
        if (!valid) {
            throw new BadCredentialsException("Invalid or expired verification code.");
        }
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Account not found."));
        user.setLastLoginAt(java.time.LocalDateTime.now());
        userRepository.save(user);
        return ResponseEntity.ok(buildTokenResponse(user));
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> me(@org.springframework.security.core.annotation.AuthenticationPrincipal SavoUserPrincipal principal) {
        return ResponseEntity.ok(UserDTO.fromEntity(principal.getUser()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        // Stateless JWT — logout is handled client-side by discarding the token.
        // If a server-side blacklist is needed later, add the token's jti to a
        // short-lived revocation store here.
        SecurityContextHolder.clearContext();
        return ResponseEntity.noContent().build();
    }

    private LoginResponse buildTokenResponse(User user) {
        String token = jwtUtil.generateToken(user.getUsername(), user.getEmployeeId(), user.getRole().name());
        return LoginResponse.builder()
                .twoFactorRequired(false)
                .token(token)
                .employeeId(user.getEmployeeId())
                .name(user.getFullName())
                .role(user.getRole().name())
                .build();
    }
}
