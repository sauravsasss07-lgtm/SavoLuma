package com.savoluma.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "company_locations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyLocation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "office_name", nullable = false, length = 120)
    private String officeName;

    @Column(length = 80)
    private String city;

    @Column(length = 80)
    private String state;

    @Column(length = 80)
    private String country;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(length = 120)
    private String email;

    @Column(length = 30)
    private String phone;

    @Column(name = "map_embed_url", length = 500)
    private String mapEmbedUrl;

    @Column(name = "is_active")
    @Builder.Default
    private boolean active = true;
}
