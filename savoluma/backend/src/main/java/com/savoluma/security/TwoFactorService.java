package com.savoluma.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Minimal OTP-based two-factor step, required for the roles listed in
 * app.security.two-factor-required-roles (application.yml — ADMIN, CEO,
 * SUPER_ADMIN by default).
 *
 * Flow (see AuthController):
 *   1. POST /api/v1/auth/login with username+password.
 *   2. If the account's role requires 2FA, the response is
 *      { "twoFactorRequired": true, "challengeId": "..." } instead of a JWT,
 *      and an OTP is generated here (in production: emailed/SMS'd to the user).
 *   3. Frontend prompts for the code, then calls
 *      POST /api/v1/auth/verify-2fa { challengeId, code } to receive the JWT.
 *
 * This in-memory store is for demonstration only — replace with Redis or
 * a database-backed store (with TTL) before production use.
 */
@Service
public class TwoFactorService {

    @Value("${app.security.two-factor-required-roles}")
    private String requiredRolesCsv;

    private final SecureRandom random = new SecureRandom();
    private final Map<String, PendingChallenge> challenges = new ConcurrentHashMap<>();

    private record PendingChallenge(String username, String code, long expiresAtMillis) {}

    public boolean isRequiredForRole(String role) {
        List<String> required = List.of(requiredRolesCsv.split(","));
        return required.contains(role);
    }

    public Challenge createChallenge(String username) {
        String challengeId = java.util.UUID.randomUUID().toString();
        String code = String.format("%06d", random.nextInt(1_000_000));
        challenges.put(challengeId, new PendingChallenge(username, code, System.currentTimeMillis() + 5 * 60_000));
        return new Challenge(challengeId, code);
    }

    public record Challenge(String id, String code) {}

    public boolean verify(String challengeId, String code, String expectedUsername) {
        PendingChallenge pending = challenges.get(challengeId);
        if (pending == null) return false;
        if (System.currentTimeMillis() > pending.expiresAtMillis()) {
            challenges.remove(challengeId);
            return false;
        }
        boolean valid = pending.code().equals(code) && pending.username().equals(expectedUsername);
        if (valid) challenges.remove(challengeId); // one-time use
        return valid;
    }
}
