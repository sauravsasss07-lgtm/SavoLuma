package com.savoluma.repository;

import com.savoluma.entity.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {
    List<SupportTicket> findByClientId(Long clientId);
    List<SupportTicket> findByStatus(String status);
}
