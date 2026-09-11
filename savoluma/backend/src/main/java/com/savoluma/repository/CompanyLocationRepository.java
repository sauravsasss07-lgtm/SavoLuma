package com.savoluma.repository;

import com.savoluma.entity.CompanyLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CompanyLocationRepository extends JpaRepository<CompanyLocation, Long> {
    List<CompanyLocation> findByActiveTrue();
}
