package com.savoluma.repository;

import com.savoluma.entity.ClientUser;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ClientUserRepository extends JpaRepository<ClientUser, Long> {
    Optional<ClientUser> findByUsername(String username);
    List<ClientUser> findByClientId(Long clientId);
}
