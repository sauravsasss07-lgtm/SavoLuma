package com.savoluma.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "clients")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Client {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_name", nullable = false, length = 150)
    private String companyName;

    @Column(name = "logo_text", length = 60)
    private String logoText;

    @Column(length = 255)
    private String website;

    @Column(length = 80)
    private String industry;

    @Column(length = 80)
    private String country;

    @Column(length = 120)
    private String location;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "services_delivered", length = 255)
    private String servicesDelivered;

    @Column(length = 20)
    @Builder.Default
    private String status = "ACTIVE";

    @Column(name = "is_public")
    @Builder.Default
    private boolean isPublic = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() { createdAt = LocalDateTime.now(); }
}
