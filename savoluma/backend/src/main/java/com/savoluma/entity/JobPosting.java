package com.savoluma.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_postings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobPosting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(length = 80)
    private String team;

    @Column(length = 80)
    private String department;

    @Column(length = 120)
    private String location;

    @Column(name = "work_mode", length = 40)
    private String workMode;

    @Column(name = "job_type", length = 30)
    private String jobType;

    @Column(length = 80)
    private String experience;

    @Column(length = 255)
    private String skills;

    @Column(name = "salary_range", length = 80)
    private String salaryRange;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String responsibilities;

    @Column(columnDefinition = "TEXT")
    private String requirements;

    @Column(columnDefinition = "TEXT")
    private String benefits;

    @Column(name = "is_open")
    @Builder.Default
    private boolean open = true;

    @Column(name = "posted_date")
    private LocalDate postedDate;

    @Column(name = "closing_date")
    private LocalDate closingDate;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() { createdAt = LocalDateTime.now(); if (postedDate == null) postedDate = LocalDate.now(); }
}
