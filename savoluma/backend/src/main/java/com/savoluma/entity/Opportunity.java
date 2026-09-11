package com.savoluma.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "opportunities")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Opportunity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "opp_code", nullable = false, unique = true, length = 20)
    private String oppCode;

    @Column(nullable = false, length = 150)
    private String name;

    @ManyToOne
    @JoinColumn(name = "lead_id")
    private Lead lead;

    @ManyToOne
    @JoinColumn(name = "client_id")
    private Client client;

    private BigDecimal value;

    @Column(length = 40)
    @Builder.Default
    private String stage = "QUALIFIED";

    private Integer probability;

    @Column(name = "expected_close")
    private LocalDate expectedClose;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    private User owner;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() { createdAt = LocalDateTime.now(); }
}
