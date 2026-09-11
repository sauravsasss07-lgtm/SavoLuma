package com.savoluma.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "meetings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Meeting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 160)
    private String title;

    @Column(length = 20)
    @Builder.Default
    private String type = "MEETING"; // MEETING | CALL

    @Column(columnDefinition = "TEXT")
    private String agenda;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "starts_at", nullable = false)
    private LocalDateTime startsAt;

    @Column(name = "ends_at")
    private LocalDateTime endsAt;

    @ManyToOne
    @JoinColumn(name = "organizer_id")
    private User organizer;

    @Column(name = "participant_ids", length = 500)
    private String participantIds; // comma-separated employee IDs

    @ManyToOne
    @JoinColumn(name = "client_id")
    private Client client;

    @Column(length = 20)
    @Builder.Default
    private String status = "SCHEDULED";

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() { createdAt = LocalDateTime.now(); }
}
