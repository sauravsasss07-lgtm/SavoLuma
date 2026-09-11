package com.savoluma.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "site_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SiteSetting {
    @Id
    @Column(length = 80)
    private String settingKey;

    @Column(columnDefinition = "TEXT")
    private String settingValue;
}
