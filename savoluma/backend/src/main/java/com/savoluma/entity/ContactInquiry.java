package com.savoluma.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "contact_inquiries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContactInquiry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 40)
    private String intent;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, length = 120)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(length = 150)
    private String company;

    @Column(length = 80)
    private String projectType;

    @Column(length = 60)
    private String timeline;

    @Column(length = 60)
    private String budgetRange;

    @Column(length = 120)
    private String technologyPreference;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "NEW";

    @ManyToOne
    @JoinColumn(name = "assigned_to")
    private User assignedTo;

    @ManyToOne
    @JoinColumn(name = "converted_lead_id")
    private Lead convertedLead;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() { createdAt = LocalDateTime.now(); }
}
