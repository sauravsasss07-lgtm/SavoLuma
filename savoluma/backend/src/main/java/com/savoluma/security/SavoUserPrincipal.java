package com.savoluma.security;

import com.savoluma.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * Wraps our User entity so Spring Security can authenticate/authorize
 * against it. The authority is prefixed with ROLE_ so it matches the
 * hasRole(...) checks used throughout SecurityConfig, e.g. a user with
 * Role.ADMIN gets authority "ROLE_ADMIN".
 */
public class SavoUserPrincipal implements UserDetails {

    private final User user;

    public SavoUserPrincipal(User user) {
        this.user = user;
    }

    public User getUser() {
        return user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
    }

    @Override
    public String getPassword() {
        return user.getPasswordHash();
    }

    @Override
    public String getUsername() {
        return user.getUsername();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        // A BLOCKED employee (fired / access removed by Admin) cannot authenticate at all.
        return !user.isBlocked();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return !user.isBlocked();
    }
}
