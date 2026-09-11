package com.savoluma.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "consultations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Consultation {
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

    @Column(name = "preferred_date")
    private LocalDate preferredDate;

    @Column(name = "preferred_time", length = 20)
    private String preferredTime;

    @Column(columnDefinition = "TEXT")
    private String requirement;

    @Column(length = 20)
    @Builder.Default
    private String status = "PENDING";

    @ManyToOne
    @JoinColumn(name = "assigned_to")
    private User assignedTo;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() { createdAt = LocalDateTime.now(); }
}
