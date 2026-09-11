package com.savoluma.repository;

import com.savoluma.entity.Role;
import com.savoluma.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmployeeId(String employeeId);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    List<User> findByManagerId(Long managerId);
    Page<User> findByRole(Role role, Pageable pageable);
}
