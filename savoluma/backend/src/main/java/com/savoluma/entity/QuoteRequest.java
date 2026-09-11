package com.savoluma.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "quote_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuoteRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(length = 150)
    private String company;

    @Column(nullable = false, length = 120)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(length = 120)
    private String service;

    @Column(length = 60)
    private String budget;

    @Column(length = 60)
    private String timeline;

    @Column(columnDefinition = "TEXT")
    private String requirements;

    @Column(length = 20)
    @Builder.Default
    private String status = "SUBMITTED";

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() { createdAt = LocalDateTime.now(); }
}
