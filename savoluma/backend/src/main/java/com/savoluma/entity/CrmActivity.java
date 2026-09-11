package com.savoluma.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "crm_activities")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrmActivity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 30)
    private String type; // NOTE, CALL, MEETING, TASK, FOLLOW_UP

    @Column(nullable = false, length = 200)
    private String subject;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @ManyToOne
    @JoinColumn(name = "lead_id")
    private Lead lead;

    @ManyToOne
    @JoinColumn(name = "opportunity_id")
    private Opportunity opportunity;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    private User owner;

    @Column(name = "due_at")
    private LocalDateTime dueAt;

    @Column(length = 20)
    @Builder.Default
    private String status = "OPEN";

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() { createdAt = LocalDateTime.now(); }
}
