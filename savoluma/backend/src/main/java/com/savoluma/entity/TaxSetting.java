package com.savoluma.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "tax_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaxSetting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 40)
    private String code; // GST, CGST, SGST, IGST

    @Column(nullable = false, precision = 6, scale = 3)
    private BigDecimal rate;

    @Column(length = 8)
    @Builder.Default
    private String currency = "INR";

    @Column(name = "is_active")
    @Builder.Default
    private boolean active = true;
}
