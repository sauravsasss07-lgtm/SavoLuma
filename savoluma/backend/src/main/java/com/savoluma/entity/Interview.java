package com.savoluma.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "interviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Interview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "application_id")
    private JobApplication application;

    @Column(length = 40)
    private String round; // SCREENING, TECHNICAL, HR, FINAL

    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;

    @ManyToOne
    @JoinColumn(name = "interviewer_id")
    private User interviewer;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(length = 30)
    @Builder.Default
    private String decision = "PENDING";

    @Column(length = 20)
    @Builder.Default
    private String status = "SCHEDULED";
}
