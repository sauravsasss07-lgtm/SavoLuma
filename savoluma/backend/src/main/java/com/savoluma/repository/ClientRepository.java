package com.savoluma.repository;

import com.savoluma.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClientRepository extends JpaRepository<Client, Long> {
    List<Client> findByIsPublicTrueAndStatus(String status);
}
