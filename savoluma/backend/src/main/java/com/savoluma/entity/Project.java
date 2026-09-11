package com.savoluma.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "projects")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_code", nullable = false, unique = true, length = 20)
    private String projectCode;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "client_id")
    private Long clientId;

    @ManyToOne
    @JoinColumn(name = "manager_id")
    private User manager;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "PLANNING";

    @Column(length = 20)
    @Builder.Default
    private String priority = "MEDIUM";

    @Builder.Default
    private int progress = 0;

    private BigDecimal budget;

    private LocalDate startDate;
    private LocalDate endDate;

    @Column(name = "tech_stack")
    private String techStack; // comma-separated for simplicity; normalize into its own table if needed

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() { createdAt = LocalDateTime.now(); }
}
