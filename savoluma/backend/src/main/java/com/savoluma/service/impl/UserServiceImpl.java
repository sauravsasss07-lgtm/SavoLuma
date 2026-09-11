package com.savoluma.service.impl;

import com.savoluma.dto.CreateUserRequest;
import com.savoluma.dto.UpdateUserRequest;
import com.savoluma.dto.UserDTO;
import com.savoluma.entity.Role;
import com.savoluma.entity.User;
import com.savoluma.exception.BadRequestException;
import com.savoluma.exception.ResourceNotFoundException;
import com.savoluma.repository.UserRepository;
import com.savoluma.service.AuditService;
import com.savoluma.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    @Override
    public List<UserDTO> getAll() {
        return userRepository.findAll().stream().map(UserDTO::fromEntity).collect(Collectors.toList());
    }

    @Override
    public UserDTO getByEmployeeId(String employeeId) {
        return UserDTO.fromEntity(findOrThrow(employeeId));
    }

    @Override
    @Transactional
    public UserDTO create(CreateUserRequest request, User actor) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("That username is already taken.");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("That email is already registered.");
        }

        Role role;
        try {
            role = Role.valueOf(request.getRole());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Unknown role: " + request.getRole());
        }

        User manager = null;
        if (request.getManagerId() != null && !request.getManagerId().isBlank()) {
            manager = userRepository.findByEmployeeId(request.getManagerId())
                    .orElseThrow(() -> new BadRequestException("Manager not found: " + request.getManagerId()));
        }

        User user = User.builder()
                .employeeId(generateEmployeeId())
                .username(request.getUsername())
                .passwordHash(passwordEncoder.encode(request.getTemporaryPassword()))
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .role(role)
                .department(request.getDepartment())
                .team(request.getTeam())
                .manager(manager)
                .status("ACTIVE")
                .build();

        user = userRepository.save(user);
        auditService.log(actor, "Created employee " + user.getEmployeeId() + " (" + user.getFullName() + ")", "USER", user.getEmployeeId());
        return UserDTO.fromEntity(user);
    }

    @Override
    @Transactional
    public UserDTO update(String employeeId, UpdateUserRequest changes, User actor) {
        User user = findOrThrow(employeeId);

        if (changes.getFullName() != null) user.setFullName(changes.getFullName());
        if (changes.getEmail() != null) user.setEmail(changes.getEmail());
        if (changes.getPhone() != null) user.setPhone(changes.getPhone());
        if (changes.getDepartment() != null) user.setDepartment(changes.getDepartment());
        if (changes.getTeam() != null) user.setTeam(changes.getTeam());
        if (changes.getTitle() != null) user.setTitle(changes.getTitle());
        if (changes.getManagerId() != null) {
            if (changes.getManagerId().isBlank()) {
                user.setManager(null);
            } else {
                user.setManager(userRepository.findByEmployeeId(changes.getManagerId())
                        .orElseThrow(() -> new BadRequestException("Manager not found: " + changes.getManagerId())));
            }
        }

        userRepository.save(user);
        auditService.log(actor, "Updated employee " + employeeId, "USER", employeeId);
        return UserDTO.fromEntity(user);
    }

    @Override
    @Transactional
    public UserDTO setStatus(String employeeId, String status, User actor) {
        if (!status.equals("ACTIVE") && !status.equals("BLOCKED")) {
            throw new BadRequestException("Status must be ACTIVE or BLOCKED.");
        }
        User user = findOrThrow(employeeId);
        user.setStatus(status);
        userRepository.save(user);

        String action = status.equals("BLOCKED")
                ? "Blocked access for employee " + employeeId + " (offboarding / access removal)"
                : "Restored access for employee " + employeeId;
        auditService.log(actor, action, "USER", employeeId);
        return UserDTO.fromEntity(user);
    }

    @Override
    @Transactional
    public void delete(String employeeId, User actor) {
        User user = findOrThrow(employeeId);
        userRepository.delete(user);
        auditService.log(actor, "Removed employee " + employeeId + " from the system", "USER", employeeId);
    }

    @Override
    public List<UserDTO> getDirectReports(String managerEmployeeId) {
        User manager = findOrThrow(managerEmployeeId);
        return userRepository.findByManagerId(manager.getId()).stream().map(UserDTO::fromEntity).collect(Collectors.toList());
    }

    private User findOrThrow(String employeeId) {
        return userRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("No employee found with ID " + employeeId));
    }

    /** SL-YYYY-#### — simple sequential generator; swap for a DB sequence under real concurrency. */
    private String generateEmployeeId() {
        long count = userRepository.count() + 1;
        return String.format("SL-%d-%04d", Year.now().getValue(), count);
    }
}
