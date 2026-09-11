package com.savoluma.controller;

import com.savoluma.dto.CreateUserRequest;
import com.savoluma.dto.UpdateUserRequest;
import com.savoluma.dto.UserDTO;
import com.savoluma.security.SavoUserPrincipal;
import com.savoluma.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Endpoint-level access is already enforced in SecurityConfig
 * ("/api/v1/users/**" -> SUPER_ADMIN, ADMIN, HR, CEO). The @PreAuthorize
 * annotations below add a second, finer-grained layer (e.g. only
 * SUPER_ADMIN/ADMIN may hard-delete), per spec section 30
 * "role level access AND resource level access".
 */
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAll() {
        return ResponseEntity.ok(userService.getAll());
    }

    @GetMapping("/{employeeId}")
    public ResponseEntity<UserDTO> getOne(@PathVariable String employeeId) {
        return ResponseEntity.ok(userService.getByEmployeeId(employeeId));
    }

    @GetMapping("/{employeeId}/direct-reports")
    public ResponseEntity<List<UserDTO>> getDirectReports(@PathVariable String employeeId,
                                                           @AuthenticationPrincipal SavoUserPrincipal principal) {
        String actorRole = principal.getUser().getRole().name();
        boolean privileged = actorRole.matches("SUPER_ADMIN|ADMIN|HR|CEO");
        boolean self = principal.getUser().getEmployeeId().equals(employeeId);
        if (!privileged && !self) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "You can only view your own direct reports.");
        }
        return ResponseEntity.ok(userService.getDirectReports(employeeId));
    }

    /** HR or Admin only — matches the frontend's register.html / Admin "Add Employee" modal. */
    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','HR')")
    public ResponseEntity<UserDTO> create(@Valid @RequestBody CreateUserRequest request,
                                           @AuthenticationPrincipal SavoUserPrincipal principal) {
        return ResponseEntity.ok(userService.create(request, principal.getUser()));
    }

    @PutMapping("/{employeeId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','HR')")
    public ResponseEntity<UserDTO> update(@PathVariable String employeeId,
                                           @RequestBody UpdateUserRequest changes,
                                           @AuthenticationPrincipal SavoUserPrincipal principal) {
        return ResponseEntity.ok(userService.update(employeeId, changes, principal.getUser()));
    }

    /** Block = "fire the employee / remove access" from the spec. Unblock reverses it. */
    @PatchMapping("/{employeeId}/status")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
    public ResponseEntity<UserDTO> setStatus(@PathVariable String employeeId,
                                              @RequestBody Map<String, String> body,
                                              @AuthenticationPrincipal SavoUserPrincipal principal) {
        return ResponseEntity.ok(userService.setStatus(employeeId, body.get("status"), principal.getUser()));
    }

    @DeleteMapping("/{employeeId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String employeeId,
                                        @AuthenticationPrincipal SavoUserPrincipal principal) {
        userService.delete(employeeId, principal.getUser());
        return ResponseEntity.noContent().build();
    }
}
