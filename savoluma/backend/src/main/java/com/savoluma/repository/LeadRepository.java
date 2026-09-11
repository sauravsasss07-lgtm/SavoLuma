package com.savoluma.repository;

import com.savoluma.entity.Lead;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LeadRepository extends JpaRepository<Lead, Long> {
    List<Lead> findByAssignedToId(Long userId);
    List<Lead> findByStatus(String status);
}
