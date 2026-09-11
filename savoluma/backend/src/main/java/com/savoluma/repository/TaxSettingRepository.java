package com.savoluma.repository;

import com.savoluma.entity.TaxSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TaxSettingRepository extends JpaRepository<TaxSetting, Long> {
    Optional<TaxSetting> findByCode(String code);
}
