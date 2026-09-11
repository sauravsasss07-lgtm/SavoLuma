package com.savoluma.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "client_users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClientUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "client_id")
    private Client client;

    @Column(nullable = false, unique = true, length = 60)
    private String username;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "contact_name", nullable = false, length = 120)
    private String contactName;

    @Column(nullable = false, unique = true, length = 120)
    private String email;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "ACTIVE";
}
