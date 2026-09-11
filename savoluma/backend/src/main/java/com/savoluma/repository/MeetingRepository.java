package com.savoluma.repository;

import com.savoluma.entity.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MeetingRepository extends JpaRepository<Meeting, Long> {
    List<Meeting> findByOrganizerId(Long organizerId);
    List<Meeting> findByClientId(Long clientId);
}
