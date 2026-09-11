package com.savoluma.repository;

import com.savoluma.entity.CrmActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CrmActivityRepository extends JpaRepository<CrmActivity, Long> {
    List<CrmActivity> findByLeadId(Long leadId);
}
