package com.savoluma.repository;

import com.savoluma.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByAssignedToId(Long userId);
    List<Task> findByProjectId(Long projectId);
    List<Task> findByProjectManagerId(Long managerId);
}
