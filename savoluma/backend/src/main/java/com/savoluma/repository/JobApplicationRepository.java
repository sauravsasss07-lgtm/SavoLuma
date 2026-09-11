package com.savoluma.repository;

import com.savoluma.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    boolean existsByEmailAndJobId(String email, Long jobId);
    List<JobApplication> findByJobId(Long jobId);
}
