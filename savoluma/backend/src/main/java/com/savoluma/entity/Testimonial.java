package com.savoluma.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "testimonials")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Testimonial {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "client_id")
    private Client client;

    @Column(length = 120)
    private String authorName;

    @Column(length = 120)
    private String designation;

    @Column(length = 150)
    private String company;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String quote;

    @Column(name = "image_url", length = 255)
    private String imageUrl;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "DRAFT"; // DRAFT | ACTIVE
}
